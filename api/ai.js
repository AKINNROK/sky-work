// Sky Work — ผู้ช่วย AI (Vercel Serverless Function)
// เก็บ ANTHROPIC_API_KEY ไว้ฝั่งเซิร์ฟเวอร์เท่านั้น (ตั้งใน Vercel → Settings → Environment Variables)
// ตัวแปรที่ต้องมี: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
// ตัวแปรเสริม: AI_MODEL (ชื่อรุ่นโมเดล), ALLOWED_EMAILS (อีเมลที่อนุญาต คั่นด้วยคอมมา)
const DEFAULT_MODEL = "claude-sonnet-5-5";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const KEY = process.env.ANTHROPIC_API_KEY, SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, ""), SB_ANON = process.env.SUPABASE_ANON_KEY;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  // เช็กความพร้อม (ไม่เปิดเผยค่าใดๆ ที่เป็นความลับ)
  if (req.method === "GET") return res.status(200).json({ ok: true, ready: !!(KEY && SB_URL && SB_ANON), model });
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!(KEY && SB_URL && SB_ANON)) return res.status(503).json({ error: "not_configured", message: "ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY / SUPABASE_URL / SUPABASE_ANON_KEY ที่ Vercel" });

  // ยืนยันตัวตน: ต้องล็อกอิน Sky Work (Supabase) อยู่เท่านั้น
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "unauthorized", message: "ต้องล็อกอินก่อน" });
  let email = "";
  try {
    const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, Authorization: "Bearer " + token } });
    if (!r.ok) return res.status(401).json({ error: "unauthorized", message: "เซสชันหมดอายุ ลองรีเฟรชหรือล็อกอินใหม่" });
    email = ((await r.json()).email || "").toLowerCase();
  } catch (e) { return res.status(502).json({ error: "auth_failed", message: "ตรวจสอบการล็อกอินไม่สำเร็จ" }); }
  const allow = (process.env.ALLOWED_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  if (allow.length && !allow.includes(email)) return res.status(403).json({ error: "forbidden", message: "บัญชีนี้ไม่ได้รับอนุญาต" });

  // รับข้อมูล
  const b = typeof req.body === "string" ? safeJSON(req.body) : (req.body || {});
  const system = String(b.system || "").slice(0, 8000);
  const context = String(b.context || "").slice(0, 60000);
  let messages = Array.isArray(b.messages) ? b.messages.slice(-12) : [];
  messages = messages.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 6000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "bad_request", message: "ไม่มีคำถาม" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 1500, system: system + "\n\n[ข้อมูลในระบบ]\n" + context, messages })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (j.error && j.error.message) || ("HTTP " + r.status);
      const hint = r.status === 404 ? " (ชื่อรุ่นโมเดลอาจไม่ถูกต้อง — ตั้งตัวแปร AI_MODEL ที่ Vercel)" : r.status === 401 ? " (API key ไม่ถูกต้อง)" : r.status === 429 ? " (เกินโควตาหรือเครดิตหมด)" : "";
      return res.status(502).json({ error: "upstream", message: msg + hint });
    }
    const text = (j.content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
    return res.status(200).json({ text, model });
  } catch (e) {
    return res.status(502).json({ error: "upstream", message: "เชื่อมต่อ Anthropic ไม่สำเร็จ" });
  }
};
function safeJSON(s) { try { return JSON.parse(s); } catch (e) { return {}; } }
