// Sky Work — แจ้งเตือนนอกแอป (Web Push) · Vercel Serverless Function
// ตัวแปรที่ต้องมี: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
// สรุปอัตโนมัติรายเช้า (Vercel Cron) ต้องเพิ่ม: SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
// ตัวแปรเสริม: VAPID_SUBJECT (เช่น mailto:you@example.com), ALLOWED_EMAILS
const { bangkokToday, buildDigest } = require("./_digest");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const E = process.env;
  const PUB = E.VAPID_PUBLIC_KEY, PRIV = E.VAPID_PRIVATE_KEY, SB_URL = (E.SUPABASE_URL || "").replace(/\/$/, ""), ANON = E.SUPABASE_ANON_KEY;
  const SVC = E.SUPABASE_SERVICE_ROLE_KEY, CRON = E.CRON_SECRET;
  const ready = !!(PUB && PRIV && SB_URL && ANON), cronReady = !!(SVC && CRON && ready);
  const q = req.query || {};

  if (req.method === "GET") {
    const auth = req.headers.authorization || "";
    if (CRON && auth === "Bearer " + CRON) {
      if (!cronReady) return res.status(503).json({ error: "not_configured" });
      return res.status(200).json(await runDigest(E, SB_URL, SVC));
    }
    // โหมดตั้งค่าครั้งแรก: สร้างคีย์ VAPID ใหม่ให้คัดลอกไปใส่ที่ Vercel (ไม่เก็บอะไรไว้ และปิดทันทีเมื่อมีคีย์แล้ว)
    if (q.genkeys && !PUB) {
      const keys = require("web-push").generateVAPIDKeys();
      return res.status(200).json({ ok: true, publicKey: keys.publicKey, privateKey: keys.privateKey });
    }
    return res.status(200).json({ ok: true, ready, cron: cronReady, publicKey: ready ? PUB : "" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!ready) return res.status(503).json({ error: "not_configured", message: "ยังไม่ได้ตั้งค่า VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / SUPABASE_URL / SUPABASE_ANON_KEY ที่ Vercel" });

  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "unauthorized", message: "ต้องล็อกอินก่อน" });
  try {
    const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: ANON, Authorization: "Bearer " + token } });
    if (!r.ok) return res.status(401).json({ error: "unauthorized", message: "เซสชันหมดอายุ ลองรีเฟรชหรือล็อกอินใหม่" });
    const email = ((await r.json()).email || "").toLowerCase();
    const allow = (E.ALLOWED_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    if (allow.length && !allow.includes(email)) return res.status(403).json({ error: "forbidden", message: "บัญชีนี้ไม่ได้รับอนุญาต" });
  } catch (e) { return res.status(502).json({ error: "auth_failed", message: "ตรวจสอบการล็อกอินไม่สำเร็จ" }); }

  const b = typeof req.body === "string" ? safeJSON(req.body) : (req.body || {});
  const action = b.action === "digest" ? "digest" : "test";
  let docs;
  try { docs = await readDocs(SB_URL, ANON, token, "?kind=eq.meta&id=in.(pushsubs,pushplan)&select=id,data"); }
  catch (e) { return res.status(502).json({ error: "db", message: "อ่านข้อมูลจาก Supabase ไม่สำเร็จ" }); }
  const subs = ((docs.find(d => d.id === "pushsubs") || {}).data || {}).list || [];
  if (!subs.length) return res.status(400).json({ error: "no_subscription", message: "ยังไม่มีเครื่องที่เปิดแจ้งเตือน — กด “เปิดแจ้งเตือนบนเครื่องนี้” ก่อน" });
  let payload;
  if (action === "digest") {
    const plan = ((docs.find(d => d.id === "pushplan") || {}).data || {}).list || [];
    payload = buildDigest(plan, bangkokToday()) || { title: "Sky Work · เช้านี้", body: "ไม่มีงานเลยกำหนดหรือใกล้ครบกำหนดใน 3 วัน 🎉", tag: "skywork-daily", url: "/" };
  } else payload = { title: "Sky Work", body: "ทดสอบแจ้งเตือนนอกแอป สำเร็จ ✅", tag: "skywork-test", url: "/" };
  const out = await sendAll(E, subs, payload);
  return res.status(200).json({ ok: true, sent: out.sent, failed: out.failed, gone: out.gone.length, action });
};

function safeJSON(s) { try { return JSON.parse(s); } catch (e) { return {}; } }
async function readDocs(SB_URL, key, bearer, qs) {
  const r = await fetch(SB_URL + "/rest/v1/rows" + qs, { headers: { apikey: key, Authorization: "Bearer " + bearer } });
  if (!r.ok) throw new Error("db " + r.status);
  return r.json();
}
async function sendAll(E, subs, payload) {
  const webpush = require("web-push");
  webpush.setVapidDetails(E.VAPID_SUBJECT || "mailto:admin@example.com", E.VAPID_PUBLIC_KEY, E.VAPID_PRIVATE_KEY);
  let sent = 0, failed = 0; const gone = [];
  for (const s of subs) {
    if (!s || !s.endpoint || !s.keys) continue;
    try { await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload), { TTL: 12 * 3600 }); sent++; }
    catch (e) { failed++; if (e && (e.statusCode === 404 || e.statusCode === 410)) gone.push(s.endpoint); }
  }
  return { sent, failed, gone };
}
async function runDigest(E, SB_URL, SVC) {
  const today = bangkokToday();
  const rows = await readDocs(SB_URL, SVC, SVC, "?kind=eq.meta&id=in.(pushsubs,pushplan)&select=uid,id,data");
  const byUid = {};
  rows.forEach(r => { (byUid[r.uid] = byUid[r.uid] || {})[r.id] = r.data || {}; });
  const sum = { users: 0, sent: 0, failed: 0, pruned: 0, skipped: 0 };
  for (const uid of Object.keys(byUid)) {
    const subs = (byUid[uid].pushsubs || {}).list || [];
    if (!subs.length) continue;
    sum.users++;
    const dg = buildDigest((byUid[uid].pushplan || {}).list || [], today);
    if (!dg) { sum.skipped++; continue; }
    const out = await sendAll(E, subs, dg);
    sum.sent += out.sent; sum.failed += out.failed;
    if (out.gone.length) {
      const keep = subs.filter(s => !out.gone.includes(s.endpoint)); sum.pruned += out.gone.length;
      try { await fetch(SB_URL + "/rest/v1/rows?id=eq.pushsubs&uid=eq." + encodeURIComponent(uid), { method: "PATCH", headers: { apikey: SVC, Authorization: "Bearer " + SVC, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ data: { list: keep }, updated_at: new Date().toISOString() }) }); } catch (e) {}
    }
  }
  return { ok: true, date: today, ...sum };
}
