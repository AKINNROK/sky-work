// Sky Plan — สำรองข้อมูลอัตโนมัติรายสัปดาห์ (Vercel Cron → Supabase Storage bucket "backups")
// ตัวแปรที่ต้องมี (ชุดเดียวกับสรุปเช้า): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
// ไฟล์: weekly/backup-YYYY-MM-DD.json (รูปแบบ {app:"sky-work",format:"rows",rows:[{id,uid,kind,data}]}) เก็บล่าสุด 8 ไฟล์
// กู้คืน: ตั้งค่า › นำเข้า/สำรอง › "กู้คืนจากไฟล์" เลือกไฟล์นี้ได้เลย (แอปรู้จักรูปแบบ rows)
const KEEP = 8, BUCKET = "backups";
const today = (now) => new Date((now || new Date()).getTime() + 7 * 3600e3).toISOString().slice(0, 10);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const E = process.env, SB = (E.SUPABASE_URL || "").replace(/\/$/, ""), SVC = E.SUPABASE_SERVICE_ROLE_KEY, CRON = E.CRON_SECRET;
  const ready = !!(SB && SVC && CRON);
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });
  const auth = req.headers.authorization || "";
  if (!(CRON && auth === "Bearer " + CRON)) return res.status(200).json({ ok: true, ready, what: "weekly backup to Supabase Storage (bucket backups)" });
  if (!ready) return res.status(503).json({ error: "not_configured" });
  try { return res.status(200).json(await runBackup(SB, SVC)); }
  catch (e) { return res.status(500).json({ error: "backup_failed", message: String(e && e.message || e) }); }
};

const H = (SVC, extra) => Object.assign({ apikey: SVC, Authorization: "Bearer " + SVC }, extra || {});
async function runBackup(SB, SVC, now) {
  // 1) ให้แน่ใจว่ามี bucket (private)
  const b = await fetch(SB + "/storage/v1/bucket", { method: "POST", headers: H(SVC, { "Content-Type": "application/json" }), body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }) });
  if (!b.ok && b.status !== 400 && b.status !== 409) throw new Error("bucket " + b.status);
  // 2) ดึงทุกแถว (ข้ามประวัติเวอร์ชันสมุด inkver ที่ใหญ่)
  const rows = []; const PAGE = 1000;
  for (let off = 0; ; off += PAGE) {
    const r = await fetch(SB + "/rest/v1/rows?select=id,uid,kind,data&kind=neq.inkver&order=id.asc&limit=" + PAGE + "&offset=" + off, { headers: H(SVC) });
    if (!r.ok) throw new Error("read " + r.status);
    const part = await r.json(); rows.push(...part);
    if (part.length < PAGE) break;
  }
  // 3) อัปโหลด
  const day = today(now), name = "weekly/backup-" + day + ".json";
  const body = JSON.stringify({ app: "sky-work", format: "rows", at: (now || new Date()).toISOString(), rows });
  const u = await fetch(SB + "/storage/v1/object/" + BUCKET + "/" + name, { method: "POST", headers: H(SVC, { "Content-Type": "application/json", "x-upsert": "true" }), body });
  if (!u.ok) throw new Error("upload " + u.status + " " + (await u.text()).slice(0, 120));
  // 4) เก็บล่าสุด KEEP ไฟล์
  let pruned = 0;
  try {
    const l = await fetch(SB + "/storage/v1/object/list/" + BUCKET, { method: "POST", headers: H(SVC, { "Content-Type": "application/json" }), body: JSON.stringify({ prefix: "weekly", limit: 200, sortBy: { column: "name", order: "desc" } }) });
    const files = l.ok ? (await l.json()).map(x => x.name).filter(n => /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().reverse() : [];
    const old = files.slice(KEEP).map(n => "weekly/" + n);
    if (old.length) { const d = await fetch(SB + "/storage/v1/object/" + BUCKET, { method: "DELETE", headers: H(SVC, { "Content-Type": "application/json" }), body: JSON.stringify({ prefixes: old }) }); if (d.ok) pruned = old.length; }
  } catch (e) { /* ไม่ให้การลบไฟล์เก่าทำให้การสำรองล้ม */ }
  return { ok: true, file: name, rows: rows.length, bytes: body.length, pruned };
}
module.exports.runBackup = runBackup;
