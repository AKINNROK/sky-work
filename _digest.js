// สรุปงานรายเช้าสำหรับ Web Push (ฟังก์ชันล้วน ทดสอบได้ — ขึ้นต้นด้วย _ จึงไม่ถูกเปิดเป็น endpoint)
function bangkokToday(now) { const t = new Date((now || new Date()).getTime() + 7 * 3600e3); return t.toISOString().slice(0, 10); }
function addDays(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
const short = (s, n) => { s = String(s || "").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
// plan = [{d:"YYYY-MM-DD", t:"ชื่องาน", lw:1?}] (แอปคำนวณจากงานที่ยังเปิดอยู่ แล้วเก็บไว้ที่ meta/pushplan)
function buildDigest(plan, today, soonDays) {
  const n = soonDays || 3, lim = addDays(today, n);
  const L = (Array.isArray(plan) ? plan : []).filter(x => x && /^\d{4}-\d{2}-\d{2}$/.test(x.d || "") && x.t);
  const late = L.filter(x => x.d < today).sort((a, b) => a.d < b.d ? -1 : 1);
  const now = L.filter(x => x.d === today);
  const soon = L.filter(x => x.d > today && x.d <= lim);
  if (!late.length && !now.length && !soon.length) return null;
  const names = (a, k) => a.slice(0, k).map(x => short(x.t, 28)).join(", ") + (a.length > k ? " +" + (a.length - k) : "");
  const parts = [];
  if (late.length) parts.push("เลยกำหนด " + late.length + ": " + names(late, 2));
  if (now.length) parts.push("วันนี้ " + now.length + ": " + names(now, 2));
  if (soon.length) parts.push("ใน " + n + " วัน " + soon.length);
  const law = [...late, ...now].filter(x => x.lw).length;
  if (law) parts.push("⚖︎ กฎหมาย " + law);
  return { title: "Sky Work · เช้านี้", body: short(parts.join(" · "), 230), tag: "skywork-daily", url: "/", counts: { late: late.length, today: now.length, soon: soon.length, law } };
}
module.exports = { bangkokToday, addDays, buildDigest };
