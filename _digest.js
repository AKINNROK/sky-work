// สรุปงานรายเช้าสำหรับ Web Push (ฟังก์ชันล้วน ทดสอบได้ — ขึ้นต้นด้วย _ จึงไม่ถูกเปิดเป็น endpoint)
function bangkokToday(now) { const t = new Date((now || new Date()).getTime() + 7 * 3600e3); return t.toISOString().slice(0, 10); }
function addDays(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
const short = (s, n) => { s = String(s || "").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
// plan = [{d:"YYYY-MM-DD", t:"ชื่องาน", lw:1?}] (แอปคำนวณจากงานที่ยังเปิดอยู่ แล้วเก็บไว้ที่ meta/pushplan)
function buildDigest(plan, today, soonDays, ext) {
  ext = ext || {};
  const n = soonDays || 3, lim = addDays(today, n);
  const L = (Array.isArray(plan) ? plan : []).filter(x => x && /^\d{4}-\d{2}-\d{2}$/.test(x.d || "") && x.t);
  const late = L.filter(x => x.d < today).sort((a, b) => a.d < b.d ? -1 : 1);
  const now = L.filter(x => x.d === today);
  const soon = L.filter(x => x.d > today && x.d <= lim);
  const names = (a, k) => a.slice(0, k).map(x => short(x.t, 28)).join(", ") + (a.length > k ? " +" + (a.length - k) : "");
  const parts = [];
  if (late.length) parts.push("เลยกำหนด " + late.length + ": " + names(late, 2));
  if (now.length) parts.push("วันนี้ " + now.length + ": " + names(now, 2));
  if (soon.length) parts.push("ใน " + n + " วัน " + soon.length);
  const law = [...late, ...now].filter(x => x.lw).length;
  if (law) parts.push("⚖︎ กฎหมาย " + law);
  // นัดผู้บริหารวันนี้ (ซ่อนชื่อเป็นค่าเริ่มต้น เพราะแจ้งเตือนขึ้นหน้าจอล็อก) + KPI ที่รอกรอก
  const cfg = ext.cfg || {}, ap = cfg.ap === 0 ? [] : (Array.isArray(ext.ap) ? ext.ap : []).filter(x => x && x.d === today).sort((a, b) => String(a.st).localeCompare(String(b.st)));
  if (ap.length) parts.unshift("นัดผู้บริหารวันนี้ " + ap.length + (cfg.title ? ": " + ap.slice(0, 2).map(x => x.st + " " + short(x.t, 22)).join(", ") + (ap.length > 2 ? " +" + (ap.length - 2) : "") : " (เริ่ม " + ap[0].st + ")"));
  const k = ext.kpi, kpi = k && cfg.kpi !== 0 && k.n > 0 && k.from && k.to && today >= k.from && today <= k.to ? k.n : 0;
  if (kpi) parts.push("KPI รอกรอก " + kpi + " ข้อ");
  if (!parts.length) return null;
  return { title: "Sky Plan · เช้านี้", body: short(parts.join(" · "), 230), tag: "skywork-daily", url: "/", counts: { late: late.length, today: now.length, soon: soon.length, law, ap: ap.length, kpi } };
}
// ===== เตือนก่อนนัดผู้บริหาร (ยิงจากตัวเรียกภายนอกทุก ~10 นาที → /api/push?remind=1) =====
// ap = [{i:id, d:"YYYY-MM-DD", st:"HH:MM", ms:เวลาเริ่ม(epoch ms), t:ชื่อนัด, x:ผู้บริหาร, b:นาทีเผื่อเดินทาง, pl:สถานที่}]
// จังหวะเตือน = เวลาเริ่ม − เผื่อเดินทาง − lead นาที · ยิงเมื่อ now อยู่ในช่วง [trig, trig+grace] และยังไม่เคยส่ง (key = id|date)
const hm = ms => new Date(ms + 7 * 3600e3).toISOString().slice(11, 16);
function buildReminders(ap, nowMs, cfg, sent, graceMin) {
  cfg = cfg || {}; if (cfg.ap === 0) return [];
  const lead = cfg.lead == null ? 30 : Math.max(0, +cfg.lead || 0), grace = graceMin || 15, done = new Set(sent || []), out = [];
  (Array.isArray(ap) ? ap : []).forEach(x => {
    if (!x || !x.i || !x.ms || !x.d) return;
    const b = Math.max(0, +x.b || 0), trig = x.ms - (b + lead) * 60000, key = x.i + "|" + x.d;
    if (nowMs < trig || nowMs - trig > grace * 60000 || nowMs >= x.ms || done.has(key)) return;
    const mins = Math.max(1, Math.round((x.ms - nowMs) / 60000));
    const what = cfg.title ? short(x.t, 40) + (x.x ? " · " + short(x.x, 20) : "") : "นัดผู้บริหาร";
    const bits = [what + " เริ่ม " + x.st];
    if (cfg.title && x.pl) bits.push("ที่ " + short(x.pl, 24));
    if (b) bits.push("ควรออกเดินทาง " + hm(x.ms - b * 60000) + " (เผื่อ " + b + " นาที)");
    out.push({ key, title: "อีก " + mins + " นาที", body: short(bits.join(" · "), 200), tag: "skywork-ap-" + key, url: "/" });
  });
  return out;
}
module.exports = { bangkokToday, addDays, buildDigest, buildReminders };
