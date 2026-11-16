// ---------- 5W1H: Why / Who / Where / How เสริมจาก What (ชื่องาน) และ When (Deadline) ----------
const W5K=["why","inv","whr","how"];
const w5Txt=v=>String(v==null?"":v).trim();
const w5Has=t=>!!t&&W5K.some(k=>w5Txt(t[k]));
function w5Miss(t,kind){
const m=[]; if(!w5Txt(t.why))m.push("Why"); if(!w5Txt(t.owner)&&!w5Txt(t.inv))m.push("Who");
if(!t.date&&!t.rrule&&!t.recurring)m.push("When");
if((kind||"task")==="task"&&!w5Txt(t.whr))m.push("Where"); if(!w5Txt(t.how))m.push("How"); return m; }
function w5Line(t){ if(!w5Has(t))return "";
const p=[["Why",t.why],["Who",t.inv],["Where",t.whr]].filter(x=>w5Txt(x[1])).map(x=>`<b>${x[0]}</b> ${esc(w5Txt(x[1]).slice(0,60))}`);
const h=w5Txt(t.how); if(h)p.push(`<b>How</b> ${esc(h.split("\n")[0].slice(0,60))}`);
return `<div class="w5line">${p.join(" · ")}</div>`; }
async function aiAskText(system,context,userText){
let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system,context,messages:[{role:"user",content:userText}]})});
const j=await r.json().catch(()=>({}));
if(!r.ok)throw new Error(j.message||("ผิดพลาด "+r.status));
return j.text||""; }
function aiJsonOf(txt){
const s0=String(txt||""), m=s0.match(/```(?:json)?\s*([\s\S]*?)```/i), body=m?m[1]:s0;
const i=body.search(/[\[{]/); if(i<0)return null; const close=body[i]==="["?"]":"}", j=body.lastIndexOf(close); if(j<i)return null;
try{ return JSON.parse(body.slice(i,j+1)); }catch(e){ return null; } }
const W5_SYS=["คุณช่วยเติมรายละเอียด 5W1H ของงาน HR ให้วิม (HR, LeKise Group) จากข้อมูลที่ให้มาเท่านั้น",
"ตอบเป็น JSON ล้วนๆ ไม่มีข้อความอื่น ภาษาไทย สั้นกระชับ ใช้คีย์ตามที่ขอ",
"ห้ามแต่งข้อเท็จจริง: ชื่อคน ตัวเลข วันที่ ลิงก์ ถ้าข้อมูลไม่พอให้ใส่ \"\" — ช่อง why/how ให้ร่างจากหลักสามัญของงาน HR ได้แต่ต้องเป็นข้อเสนอเชิงกว้าง",
"how ให้เป็นขั้นตอนสั้นๆ ขึ้นบรรทัดใหม่ทีละข้อ ไม่เกิน 5 ข้อ"].join("\n");
// ---------- ผู้ช่วย AI: สรุป · จัดแผน · เตือนงาน · เสนอการแก้ (ต้องกดยืนยันเสมอ) ----------
const AI_SYSTEM=[
"คุณคือผู้ช่วย HR ประจำตัวของวิม (HR, LeKise Group) ในแอป Sky Work",
"สไตล์: ตอบภาษาไทย กระชับแบบผู้บริหาร พูดตรง วิเคราะห์ได้ และเสนอสิ่งที่ควรทำต่อเป็นข้อๆ",
"กติกา:",
"- ใช้เฉพาะข้อมูลในส่วน [ข้อมูลในระบบ] ห้ามเดาหรือแต่งตัวเลข ถ้าไม่มีข้อมูลให้บอกตรงๆ ว่าไม่มี",
"- เกณฑ์/เงินอุดหนุนของกรมพัฒนาฝีมือแรงงานเปลี่ยนได้ทุกปี ห้ามยืนยันว่าจะได้เงินคืนแน่นอน ให้แนะนำตรวจกับเจ้าหน้าที่กรมฯ",
"- ห้ามเสนอลบข้อมูล",
"- ถ้าต้องการให้แอปแก้ข้อมูล ให้ใส่บล็อกต่อไปนี้ท้ายคำตอบเท่านั้น (และอธิบายเหตุผลในเนื้อความด้วย):",
"```actions",
"[{\"type\":\"set_status\",\"id\":\"<id จากข้อมูล>\",\"status\":\"เสร็จสิ้น\",\"why\":\"เหตุผลสั้นๆ\"}]",
"```",
"ชนิดที่ใช้ได้: set_status(id,status) · move_date(id,date เป็น YYYY-MM-DD คือ Deadline ใหม่) · set_owner(id,owner) · set_quad(id,quad เป็น q1|q2|q3|q4) · add_task(title,date=Deadline,track?,company?,owner?,note?,quad?,why?,inv?,whr?,how?) · set_w5(id,why?,inv?,whr?,how?) เติมรายละเอียด 5W1H ให้งานเดิม · add_note(title,body)",
"5W1H ของงาน: What=ชื่องาน · Why=วัตถุประสงค์ (why) · Who=ผู้รับผิดชอบ (owner) + ผู้เกี่ยวข้อง/ผู้อนุมัติ (inv) · When=Deadline · Where=สถานที่/ระบบ/ลิงก์ (whr) · How=ขั้นตอน (how) — ก่อนเสนอ add_task ให้ตรวจ Who/When/Why ถ้าขาดตัวใดให้ถามกลับครั้งเดียวสั้นๆ โดยระบุว่าขาดอะไร (ยกเว้นผู้ใช้บอก “เพิ่มเลย”) · Where/How ใส่เมื่ออนุมานได้จากที่ผู้ใช้บอก ห้ามแต่งชื่อคน ตัวเลข ลิงก์",
"Eisenhower Matrix ของงาน: q1=ทำเลย (สำคัญ+เร่งด่วน) · q2=วางแผน (สำคัญ ไม่เร่งด่วน) · q3=มอบหมาย (ไม่สำคัญ แต่เร่งด่วน) · q4=ไว้ทีหลัง/ตัดทิ้ง · ช่อง “Deadline” = วันที่ต้องเสร็จของงาน",
"เกณฑ์ช่วยจัดลำดับ: เร่งด่วน = เลย Deadline หรือครบภายใน ~3 วัน · สำคัญ = กระทบกฎหมาย งบประมาณ ผู้บริหาร ความปลอดภัย หรือเป้าหมายของ HR · เมื่อเสนอ set_quad ให้ใส่ why ที่อ้างข้อมูลจริง (Deadline/ผู้รับผิดชอบ/ประเภท) และเสนอครั้งละไม่เกิน 12 งาน เริ่มจากงานที่ Deadline ใกล้ที่สุด",
"ช่อง 3 (มอบหมาย) ควรมีผู้รับผิดชอบ ถ้ายังไม่มีให้ถามผู้ใช้ว่าจะมอบให้ใคร ห้ามเดาชื่อคน · ห้ามเดา Deadline ถ้าผู้ใช้ไม่ได้บอกให้ถามกลับ · วันที่แบบสัมพัทธ์ (พรุ่งนี้/ศุกร์หน้า) ให้คำนวณจาก “วันนี้” ในข้อมูล",
"id ต้องคัดลอกจากข้อมูลเท่านั้น status ต้องเป็นหนึ่งใน: "+STATUS.join(" / "),
"- เสนอการแก้เฉพาะเมื่อผู้ใช้ขอ หรือชัดเจนว่ามีประโยชน์ ผู้ใช้จะเป็นคนกดยืนยันเอง"].join("\n");
const AI_CHIPS=["สรุปภาพรวมสัปดาห์นี้","งานไหนเสี่ยงเลยกำหนด ควรทำอะไรก่อน","สรุปงบ GL ตอนนี้ หมวดไหนต้องจับตา","จัดแผนงานสัปดาห์หน้าให้หน่อย","มีอะไรต้องเตือนหรือเตรียมก่อนประชุมบ้าง","สรุปงานอบรมและเกณฑ์กรมพัฒนาฯ"];
let AI={msgs:[],busy:false,live:null,model:"",draft:"",pending:null,flash:"",open:false,listening:false,vnote:""};
const AI_CMDS=[
{k:"/สรุป",d:"สรุปภาพรวมสัปดาห์นี้",btn:"สรุปสัปดาห์นี้",q:"สรุปภาพรวมสัปดาห์นี้ให้หน่อย: งานที่ต้องทำ งานเสี่ยง และสิ่งที่ควรทำก่อน"},
{k:"/เลยกำหนด",d:"งานเลยกำหนด + ควรทำอะไรก่อน",btn:"งานเลยกำหนด",q:"งานไหนเลยกำหนดหรือเสี่ยงเลยกำหนด เรียงตามความเร่งด่วน แล้วเสนอว่าควรทำอะไรก่อน"},
{k:"/งบ",d:"สรุปงบ GL หมวดที่ต้องจับตา",btn:"งบ GL",q:"สรุปงบ GL ตอนนี้ หมวดไหนใกล้เต็มหรือเกินงบ ต้องจับตาอะไร"},
{k:"/ประชุม",d:"ประชุมที่ใกล้ถึง + สิ่งที่ต้องเตรียม",btn:"ประชุมใกล้ถึง",q:"ประชุมที่ใกล้ถึงมีอะไรบ้าง และต้องเตรียมอะไรก่อน"},
{k:"/แผน",d:"จัดแผนงานสัปดาห์หน้า",btn:"แผนสัปดาห์หน้า",q:"ช่วยจัดแผนงานสัปดาห์หน้าให้ โดยดูงานที่ใกล้ครบกำหนดและงานที่ค้าง"},
{k:"/ใบรับรอง",d:"ใบรับรอง/คำสั่งแต่งตั้งที่ใกล้หมด",btn:"ใบรับรองใกล้หมด",q:"ใบรับรองหรือคำสั่งแต่งตั้งอะไรที่เกินกำหนดหรือใกล้ครบ ควรทำอะไรต่อ"},
{k:"/จัดลำดับ",d:"ช่วยจัดงานที่ยังไม่จัดเข้า Matrix",btn:"จัด Matrix",q:"ช่วยจัดลำดับงานที่ยังไม่จัดเข้า Eisenhower Matrix โดยเริ่มจากงานที่ Deadline ใกล้สุด เสนอเป็นการ์ด set_quad พร้อมเหตุผลสั้นๆ"},
{k:"/ด่วน",d:"งานที่ต้องทำเลยตอนนี้",btn:"งานต้องทำเลย",q:"ตอนนี้มีงานอะไรที่ควรทำเลย (สำคัญ+เร่งด่วน) บ้าง เรียงลำดับ และถ้ามีงานที่ยังไม่จัดลำดับแต่ควรอยู่ช่อง 1 ให้เสนอ set_quad"},
{k:"/ส่งต่อ",d:"งานที่ควรมอบหมาย + ภาระงานรายคน",q:"ดูภาระงานรายผู้รับผิดชอบ และงานช่อง 3 (มอบหมาย) แนะนำว่างานไหนควรส่งต่อให้ใคร (ถ้าไม่มีข้อมูลคนให้ถามกลับ อย่าเดาชื่อ)"},
{k:"/เพิ่มงาน",a:"ชื่องาน Deadline",d:"เพิ่มงานใหม่ (พิมพ์ชื่อ+Deadline ต่อท้าย) · AI ตรวจ 5W1H ให้",q:"เพิ่มงานใหม่: {a}\nตรวจ 5W1H ก่อน: ถ้าขาด Who/When/Why ให้ถามกลับสั้นๆ ครั้งเดียว ถ้าครบพอให้เสนอการ์ด add_task (ใส่ why/inv/whr/how เท่าที่อนุมานได้) พร้อมเสนอ quad และเหตุผลสั้นๆ"},
{k:"/5w1h",d:"ตรวจงานที่ข้อมูล 5W1H ไม่ครบ + เสนอเติม",btn:"ตรวจ 5W1H",q:"ดูหัวข้อ “งานที่ 5W1H ยังไม่ครบ” แล้วเลือกงานที่สำคัญที่สุดไม่เกิน 8 งาน เสนอการ์ด set_w5 เติม why/how/whr เท่าที่อนุมานได้จากชื่อและข้อมูลในระบบ (ห้ามแต่งชื่อคน/ตัวเลข) ส่วน Who/When ที่ขาดให้ถามฉัน"},
{k:"/รายงาน",d:"สรุปงานสัปดาห์ตามกรอบ 5W1H",btn:"สรุป 5W1H",q:"สรุปงานสัปดาห์นี้และสัปดาห์หน้าเป็นตาราง 5W1H สำหรับนำเสนอผู้บริหาร: What | Why | Who | When | Where | How — เฉพาะงานช่อง 1-2 ของ Matrix งานเลย Deadline และงานที่ใกล้ครบ ช่องไหนไม่มีข้อมูลให้ใส่ “—” แล้วปิดท้ายด้วยข้อเสนอ 3 ข้อ"},
{k:"/เสร็จ",a:"ชื่องาน",d:"ทำเครื่องหมายงานว่าเสร็จ",q:"ทำเครื่องหมายงานนี้เป็นเสร็จสิ้น: {a}\nเสนอเป็นการ์ด set_status (ถ้าหางานไม่เจอหรือคลุมเครือ ให้ถามกลับ)"},
{k:"/เลื่อน",a:"ชื่องาน วันที่ใหม่",d:"เลื่อนวันงาน",q:"เลื่อนวันงาน: {a}\nเสนอเป็นการ์ด move_date (ถ้าหางานไม่เจอหรือคลุมเครือ ให้ถามกลับ)"},
{k:"/มอบ",a:"ชื่องาน ชื่อคน",d:"มอบหมายผู้รับผิดชอบ",q:"มอบหมายงาน: {a}\nเสนอเป็นการ์ด set_owner (ถ้าหางานไม่เจอหรือคลุมเครือ ให้ถามกลับ)"},
{k:"/โน้ต",a:"หัวข้อ เนื้อหา",d:"จดบันทึกลงหน้า บันทึก & ไอเดีย",q:"จดบันทึก: {a}\nเสนอเป็นการ์ด add_note"},
{k:"/ไป",a:"ชื่อหน้า",d:"ไปหน้าอื่น เช่น /ไป งบ",local:"nav"},
{k:"/ล้าง",d:"ล้างแชท",local:"clear"},
{k:"/ช่วย",d:"ดูคำสั่งทั้งหมด",local:"help"}];
const AI_BTNS=AI_CMDS.filter(c=>c.btn);
const AI_NAV=[["gaps",/ค้างข้อมูล|ข้อมูลไม่ครบ|5w1h/i],["home",/ภาพรวม|หน้าแรก|โฮม|home/i],["all",/งานทั้งหมด|งานทั้ง|รายการงาน/],["cal",/ปฏิทิน/],["matrix",/matrix|เมทริกซ์|ไอเซนฮาวเวอร์|eisenhower|จัดลำดับ/i],["budget",/งบ/],["exec",/รายงาน|ผู้บริหาร/],["meet",/ประชุม/],["train",/ฝึกอบรม|อบรม/],["dsd",/กรมพัฒนา|พัฒนาฝีมือ|dsd/i],["legal",/กฎหมาย/],["idx",/index|อินเด็กซ์/i],["note",/บันทึก|ไอเดีย|โน้ต/],["ai",/ผู้ช่วย|เอไอ|\bai\b/i],["set",/ตั้งค่า|เซ็ต/]];
function aiNavTo(name){ const n=String(name||"").trim(); if(!n)return null; const hit=AI_NAV.find(([k,re])=>re.test(n)); return hit?hit[0]:null; }
function aiGo(k){ view=k; R.pq=""; renderNav(); render(); window.scrollTo(0,0); aiPopRender(); }
const aiSys=t=>{ AI.msgs.push({role:"sys",text:t}); aiSave(); };
// คืน true ถ้าจัดการเองในแอปแล้ว (ไม่ต้องส่งให้ AI)
function aiLocal(q){
const m=q.match(/^(?:\/ไป|ไปหน้า|ไปที่|ไป|เปิดหน้า|เปิด)\s*(.+)$/);
if(m){ const k=aiNavTo(m[1]); if(k){ AI.msgs.push({role:"user",text:q}); aiSys("เปิดหน้า “"+(VIEWS.find(v=>v[0]===k)||[0,k])[1]+"” ให้แล้ว"); aiGo(k); return true; }
 if(q[0]==="/"){ AI.msgs.push({role:"user",text:q}); aiSys("ไม่พบหน้า “"+m[1]+"” — ลอง /ไป งบ · /ไป ประชุม · /ไป ปฏิทิน"); return true; } }
return false;
}
// ตีความคำสั่ง / → {done:true} หรือ {q:ข้อความที่จะส่งให้ AI, show:ข้อความที่โชว์}
function aiSlash(q){
const sp=q.indexOf(" "), key=sp<0?q:q.slice(0,sp), arg=sp<0?"":q.slice(sp+1).trim();
const c=AI_CMDS.find(x=>x.k===key);
if(!c){ AI.msgs.push({role:"user",text:q}); aiSys("ไม่รู้จักคำสั่ง “"+key+"” — พิมพ์ /ช่วย ดูคำสั่งทั้งหมด"); return {done:true}; }
if(c.local==="nav"){ if(!aiLocal(q)){ AI.msgs.push({role:"user",text:q}); aiSys("พิมพ์ชื่อหน้าต่อท้าย เช่น /ไป งบ"); } return {done:true}; }
if(c.local==="clear"){ AI.msgs=[]; AI.pending=null; aiSave(); return {done:true}; }
if(c.local==="help"){ AI.msgs.push({role:"user",text:q}); aiSys("คำสั่งลัด: "+AI_CMDS.map(x=>x.k+(x.a?" <"+x.a+">":"")+" = "+x.d).join(" · ")+"\nสั่งด้วยเสียงก็ได้ เช่น “ไปหน้างบ” “สรุปงานสัปดาห์นี้”"); return {done:true}; }
if(c.a&&!arg){ AI.draft=c.k+" "; AI.msgs.push({role:"user",text:q}); aiSys("พิมพ์ต่อท้ายด้วย: "+c.a+" เช่น "+c.k+" "+c.a); AI.draft=c.k+" "; return {done:true}; }
return {q:c.q.replace("{a}",arg),show:q};
}
function aiRefresh(){ if(view==="ai")render(); aiPopRender(); }

try{ AI.msgs=JSON.parse(localStorage.getItem("sw-ai")||"[]").slice(-30); }catch(e){}
const aiSave=()=>{ try{localStorage.setItem("sw-ai",JSON.stringify(AI.msgs.slice(-30)));}catch(e){} };
async function aiPing(){
try{ const r=await fetch("/api/ai",{cache:"no-store"}); if(!r.ok)throw 0; const j=await r.json(); AI.live=!!j.ready; AI.model=j.model||""; }
catch(e){ AI.live=false; }
aiRefresh(); }
function aiContext(){
const y=THISYEAR, D=execData(y), now=new Date();
const lawTag=t=>isLawItem(t)?" [กฎหมาย]":"";
const QN={q1:"1 ทำเลย",q2:"2 วางแผน",q3:"3 มอบหมาย",q4:"4 ไว้ทีหลัง"};
const row=t=>{const d=dueDate(t); return [t._id,(t.title||"")+lawTag(t),(t.type||gLabel(t.track)),t.company?cLabel(t.company):"-",t.owner||"-",d?isoOf(d):"-",t.status,budgetOf(t)||"-",t.actual||"-",QN[quadOf(t)]||"-"].join(" | ");};
const live=items.filter(t=>!isSysRow(t));
const open=live.filter(t=>isOpenStatus(t.status));
const soon=open.filter(t=>{const d=dueDate(t);return d&&daysTo(d)>=0&&daysTo(d)<=14;}).sort((a,b)=>dueDate(a)-dueDate(b));
const seen=new Set([...D.late,...soon].map(t=>t._id));
const going=open.filter(t=>!seen.has(t._id)&&(t.status==="กำลังดำเนินการ"||t.status==="อยู่ระหว่างดำเนินการ"));
const meets=open.filter(t=>isMeet(t)&&(()=>{const d=dueDate(t);return d&&daysTo(d)>=0&&daysTo(d)<=30;})()).sort((a,b)=>dueDate(a)-dueDate(b));
const nm=k=>k?glLabel(k):"ยังไม่ระบุหมวด GL";
const L=[];
L.push(`วันนี้: ${isoOf(now)} (วัน${DOWFULL[now.getDay()]}) · ปี ${y+543}`);
L.push(`งานในปีนี้ที่ยังเปิดอยู่ ${open.length} งาน · เลยกำหนด ${D.late.length} · ครบใน 14 วัน ${soon.length}`);
L.push("\n== งานเลย Deadline (id | ชื่อ | ประเภท | บริษัท | ผู้รับผิดชอบ | Deadline | สถานะ | งบ | ใช้จริง | Matrix) ==");
D.late.slice(0,40).forEach(t=>L.push(row(t))); if(!D.late.length)L.push("(ไม่มี)");
{ const mi=matrixItems(); const cn=k=>mi.filter(t=>quadOf(t)===k).length, un=mi.filter(t=>!quadOf(t));
const noDl=mi.filter(t=>!dueDate(t));
L.push(`\n== Eisenhower Matrix (งานที่ยังเปิด ไม่รวมประชุม/อบรม) ==\nช่อง 1 ทำเลย (สำคัญ+เร่งด่วน) ${cn("q1")} · ช่อง 2 วางแผน (สำคัญ ไม่เร่งด่วน) ${cn("q2")} · ช่อง 3 มอบหมาย (ไม่สำคัญ แต่เร่งด่วน) ${cn("q3")} · ช่อง 4 ไว้ทีหลัง ${cn("q4")} · ยังไม่จัดลำดับ ${un.length} · ไม่มี Deadline ${noDl.length}`);
const q1=mi.filter(t=>quadOf(t)==="q1").slice(0,15); if(q1.length){ L.push("งานช่อง 1 ทำเลย:"); q1.forEach(t=>L.push(row(t))); }
const unS=un.sort((x,y)=>(dueDate(x)||new Date(8e15))-(dueDate(y)||new Date(8e15))).slice(0,25); if(unS.length){ L.push("งานที่ยังไม่จัดลำดับ (เรียงตาม Deadline):"); unS.forEach(t=>L.push(row(t))); }
const own={}; mi.forEach(t=>{const o=(t.owner||"").trim()||"(ยังไม่ระบุผู้รับผิดชอบ)"; own[o]=own[o]||{n:0,late:0}; own[o].n++; const d=dueDate(t); if(d&&daysTo(d)<0)own[o].late++;});
L.push("ภาระงานรายผู้รับผิดชอบ (ผู้รับผิดชอบ | งานเปิด | เลย Deadline): "+(Object.entries(own).sort((x,y)=>y[1].n-x[1].n).slice(0,12).map(([k,v])=>k+" | "+v.n+" | "+v.late).join(" ; ")||"(ไม่มี)")); }
{ const mi=matrixItems(), qo={q1:0,q2:1,q3:2,q4:3};
const need=mi.map(t=>({t,m:w5Miss(t,"task")})).filter(x=>x.m.length).sort((x,y)=>((qo[quadOf(x.t)]??9)-(qo[quadOf(y.t)]??9))||((dueDate(x.t)||new Date(8e15))-(dueDate(y.t)||new Date(8e15)))).slice(0,20);
L.push(`\n== 5W1H ==\nงานเปิดทั้งหมด ${mi.length} · ข้อมูล 5W1H ครบ ${mi.length-mi.filter(t=>w5Miss(t,"task").length).length} · ยังไม่ครบ ${mi.filter(t=>w5Miss(t,"task").length).length}`);
if(need.length){ L.push("งานที่ 5W1H ยังไม่ครบ (id | ชื่อ | Matrix | Deadline | ขาด):"); need.forEach(x=>L.push([x.t._id,x.t.title,QN[quadOf(x.t)]||"-",(dueDate(x.t)?isoOf(dueDate(x.t)):"-"),x.m.join(",")].join(" | "))); }
const have=mi.filter(w5Has).sort((x,y)=>(dueDate(x)||new Date(8e15))-(dueDate(y)||new Date(8e15))).slice(0,20);
if(have.length){ L.push("รายละเอียด 5W1H ที่กรอกไว้ (id | ชื่อ | Why | Who(ผู้เกี่ยวข้อง) | Where | How):"); have.forEach(t=>L.push([t._id,t.title,t.why||"-",t.inv||"-",t.whr||"-",String(t.how||"-").replace(/\n+/g," / ")].join(" | "))); } }
L.push("\n== งานครบ Deadline ใน 14 วัน ==");
soon.slice(0,40).forEach(t=>L.push(row(t))); if(!soon.length)L.push("(ไม่มี)");
L.push("\n== งานที่กำลังทำ (ที่ยังไม่อยู่ข้างบน) ==");
going.slice(0,25).forEach(t=>L.push(row(t))); if(!going.length)L.push("(ไม่มี)");
L.push("\n== ประชุมใน 30 วัน ==");
meets.slice(0,15).forEach(t=>L.push(row(t)+(t.prepNote?" | เตรียม: "+t.prepNote:""))); if(!meets.length)L.push("(ไม่มี)");
L.push(`\n== งบตามหมวด GL ปี ${y+543} (หมวด | งบตั้งไว้ | ใช้จริง | คงเหลือ | %ใช้ | สถานะ) ==`);
D.gl.slice(0,30).forEach(x=>L.push([nm(x.k),x.s.plan,x.s.act,x.s.left,x.s.plan?Math.round(x.s.pct)+"%":"-",x.s.lvl==="over"?"เกินงบ":x.s.lvl==="warn"?"ใกล้เต็ม":x.s.pace?"เร็วกว่าแผน":x.s.lvl==="nob"?"ไม่ได้ตั้งงบ":"ปกติ"].join(" | ")));
if(!D.gl.length)L.push("(ยังไม่มีงบ)");
L.push(`รวมงบ ${D.B} · ใช้จริง ${D.Ac}`);
L.push(`\n== อบรมปี ${y+543} ==\nรุ่นทั้งหมด ${D.trainN.n} · จัดแล้ว ${D.trainN.done} · ผู้เข้าอบรมแล้ว ${D.trainN.pax} คน · ค่าใช้จ่ายรวม ${D.trainN.cost}`);
L.push("เกณฑ์ฝึกอบรมตามกฎหมาย รายบริษัท (บริษัท | พนักงานเฉลี่ย | นับได้ C | % | ต้องเพิ่ม) — ตัวเลขที่กรอกเอง ไม่ใช่ข้อมูลทางการ:");
D.dsd.forEach(x=>L.push([cLabel(x.c.key),x.k.avg,x.k.C,x.k.pct+"%",x.k.need].join(" | "))); if(!D.dsd.length)L.push("(ไม่มีข้อมูล)");
L.push("\n== ใบรับรอง/คำสั่งแต่งตั้ง ที่เกินกำหนดหรือใกล้ครบ 90 วัน ==");
[...D.lgLate,...D.lgSoon].slice(0,15).forEach(x=>L.push(`${x.L.title} | ${(x.L.comps||[]).map(cLabel).join(",")||"-"} | ${x.L.person||"ยังไม่มีผู้รับผิดชอบ"} | ${x.st.t}`));
if(!D.lgLate.length&&!D.lgSoon.length)L.push("(ไม่มี)");
L.push("\n== กลุ่มงานที่ใช้ได้กับ add_task (key = ชื่อ) ==\n"+groups.map(g=>g.key+" = "+g.label).join(" · "));
L.push("บริษัท (key = ชื่อ): "+realCos().map(c=>c.key+" = "+c.label).join(" · "));
return L.join("\n").slice(0,30000);
}
function aiParse(txt){
let actions=[]; let clean=String(txt||"");
const m=clean.match(/```actions\s*([\s\S]*?)```/i);
if(m){ try{ const a=JSON.parse(m[1].trim()); if(Array.isArray(a))actions=a.filter(x=>x&&typeof x==="object").slice(0,12).map(x=>({...x,state:"pending"})); }catch(e){} clean=clean.replace(m[0],"").trim(); }
return {text:clean,actions};
}
const AI_TYPES=["set_status","move_date","set_owner","set_quad","set_w5","add_task","add_note"];
function aiCheck(a){
const t=a.id?items.find(x=>x._id===a.id):null;
if(!AI_TYPES.includes(a.type))return "ชนิดการแก้ที่แอปไม่รองรับ";
if(["set_status","move_date","set_owner","set_quad","set_w5"].includes(a.type)&&!t)return "ไม่พบงานนี้ในระบบ (id ไม่ตรง)";
if(a.type==="set_status"&&!STATUS.includes(a.status))return "สถานะไม่ถูกต้อง";
if(a.type==="move_date"){ if(!/^\d{4}-\d{2}-\d{2}$/.test(a.date||"")||isNaN(new Date(a.date)))return "วันที่ไม่ถูกต้อง"; if(rr(t))return "เป็นงานเกิดซ้ำ — เลื่อนวันที่ทั้งชุดไม่ได้ ให้แก้เองในงานนั้น"; }
if(a.type==="set_owner"&&!String(a.owner||"").trim())return "ไม่มีชื่อผู้รับผิดชอบ";
if(a.type==="set_quad"&&!quadInfo(a.quad))return "ช่อง Matrix ไม่ถูกต้อง";
if(a.type==="set_w5"&&!W5K.some(k=>w5Txt(a[k])))return "ไม่มีรายละเอียด 5W1H ให้เติม";
if(a.type==="set_quad"&&(isMeet(t)||isTrain(t)))return "ประชุม/อบรมไม่อยู่ใน Matrix";
if((a.type==="add_task"||a.type==="add_note")&&!String(a.title||"").trim())return "ไม่มีชื่อ";
if(a.type==="add_task"&&a.date&&!/^\d{4}-\d{2}-\d{2}$/.test(a.date))return "วันที่ไม่ถูกต้อง";
return "";
}
function aiDescribe(a){
const t=a.id?items.find(x=>x._id===a.id):null, q=v=>"“"+esc(v||"")+"”";
switch(a.type){
case "set_status":return `เปลี่ยนสถานะ ${q(t&&t.title)}: ${esc(t?t.status:"?")} → <b>${esc(a.status)}</b>`;
case "move_date":return `เลื่อน Deadline ${q(t&&t.title)}: ${t&&t.date?fmtDate(t.date):"—"} → <b>${a.date?fmtDate(a.date):"?"}</b>`;
case "set_quad":{const qi=quadInfo(a.quad); return `จัด ${q(t&&t.title)} เข้าช่อง <b>${qi?esc(a.quad.slice(1)+" "+qi[1]):"?"}</b>${t&&quadOf(t)?" (เดิม "+esc(quadInfo(quadOf(t))[1])+")":""}`;}
case "set_w5":return `เติม 5W1H ให้ ${q(t&&t.title)}: ${W5K.filter(k=>w5Txt(a[k])).map(k=>({why:"Why",inv:"Who",whr:"Where",how:"How"}[k])+" “"+esc(w5Txt(a[k]).slice(0,70))+"”").join(" · ")}`;
case "set_owner":return `มอบหมาย ${q(t&&t.title)} ให้ <b>${esc(a.owner)}</b>`;
case "add_task":return `เพิ่มงานใหม่ ${q(a.title)}${a.date?" · กำหนด <b>"+fmtDate(a.date)+"</b>":""}${a.owner?" · "+esc(a.owner):""}`;
case "add_note":return `เพิ่มบันทึก ${q(a.title)}`;}
return "การแก้ที่ไม่รู้จัก";
}
async function aiRun(a){
const bad=aiCheck(a); if(bad)throw new Error(bad);
if(a.type==="set_status")await DB.collection("items").doc(a.id).set({status:a.status},{merge:true});
else if(a.type==="move_date")await DB.collection("items").doc(a.id).set({date:a.date},{merge:true});
else if(a.type==="set_owner")await DB.collection("items").doc(a.id).set({owner:String(a.owner).trim()},{merge:true});
else if(a.type==="set_quad")await DB.collection("items").doc(a.id).set({quad:a.quad},{merge:true});
else if(a.type==="set_w5"){ const d={}; W5K.forEach(k=>{ if(w5Txt(a[k]))d[k]=w5Txt(a[k]).slice(0,600); }); await DB.collection("items").doc(a.id).set(d,{merge:true}); }
else if(a.type==="add_task"){
const track=groups.some(g=>g.key===a.track)?a.track:(groups.find(g=>g.key==="ops")||groups[0]).key;
const company=companies.some(c=>c.key===a.company)?a.company:"";
await saveItem({title:String(a.title).trim(),kind:"task",track,type:"",status:"รอดำเนินการ",date:a.date||null,company,owner:String(a.owner||"").trim(),note:String(a.note||"").trim()+(a.note?"\n":"")+"(เพิ่มโดยผู้ช่วย AI)",...(/^[A-Za-z0-9_-]{4,60}$/.test(String(a.srcn||""))?{srcn:String(a.srcn)}:{}),quad:quadInfo(a.quad)?a.quad:"",why:w5Txt(a.why).slice(0,400),inv:w5Txt(a.inv).slice(0,200),whr:w5Txt(a.whr).slice(0,300),how:w5Txt(a.how).slice(0,600)});}
else if(a.type==="add_note")await DB.collection("note").add({title:String(a.title).trim(),kind:"โน้ต",date:null,tag:"AI",body:String(a.body||""),color:"",pin:false});
}
const AI_SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const aiMd=t=>esc(t).replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>");
function aiChatHTML(p){
const live=AI.live, msgs=AI.msgs;
const msgHTML=msgs.map((m,i)=>m.role==="user"?`<div class="aib u">${esc(m.show||m.text)}</div>`
:m.role==="sys"?`<div class="aisys">${esc(m.text).replace(/\n/g,"<br>")}</div>`
:`<div class="aib a">${aiMd(m.text)}${(m.actions||[]).map((a,j)=>{const bad=a.state==="pending"?aiCheck(a):"";
return `<div class="aiact ${a.state}"><div class="aid">${aiDescribe(a)}${a.why?`<div class="aiwhy">${esc(a.why)}</div>`:""}${bad?`<div class="aiwhy" style="color:var(--over)">ทำไม่ได้: ${esc(bad)}</div>`:""}${a.state==="error"?`<div class="aiwhy" style="color:var(--over)">ไม่สำเร็จ: ${esc(a.err||"")}</div>`:""}</div>
${a.state==="pending"?`<button class="btn sm" data-aiok="${i}:${j}"${bad?" disabled":""}>ทำตามนี้</button><button class="btn sm ghost" data-aiskip="${i}:${j}">ข้าม</button>`:`<span class="pill ${a.state==="done"?"s-done":"s-wait"}">${a.state==="done"?"ทำแล้ว":a.state==="skipped"?"ข้ามแล้ว":"ไม่สำเร็จ"}</span>`}</div>`;}).join("")}</div>`).join("");
const first=!msgs.length?`<div class="aisys">สวัสดีค่ะวิม 👋 ถามหรือสั่งได้เลย — พิมพ์ <b>/</b> เพื่อดูคำสั่งลัด หรือกดไมค์พูดได้ ถ้าเสนอให้แก้งาน จะขึ้นเป็นการ์ดให้กดยืนยันเองทุกครั้ง</div>`:"";
const mic=AI_SR?`<button class="aimic${AI.listening?" on":""}" id="${p}mic" title="สั่งด้วยเสียง" aria-label="สั่งด้วยเสียง">${svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',20)}</button>`:"";
return `<div class="aistatus">${live?`<span class="bchip">พร้อมใช้งานในแอป</span> <span>${esc(AI.model)}</span>`:`<span class="bchip warn">โหมดคัดลอก–วาง</span> <span>ยังไม่ได้เชื่อม API · ใช้แชท Claude ปกติได้เลย</span> <button class="gcbtn" id="${p}Ping">ตรวจการเชื่อมต่อใหม่</button>`}</div>
<div class="aimsgs" id="${p}msgs">${first}${msgHTML}${AI.busy?`<div class="aisys">กำลังคิด…</div>`:""}</div>
<div class="aichips">${AI_BTNS.map((c,i)=>`<button class="gcbtn" data-aichip="${i}" title="${esc(c.k+" · "+c.d)}">${esc(c.btn)}</button>`).join("")}</div>
<div class="aivnote" id="${p}vnote">${esc(AI.vnote||"")}</div>
<div class="aiinw"><div class="aimenu" id="${p}menu" hidden></div>
<div class="aiin"><textarea id="${p}q" rows="2" placeholder="${live?"พิมพ์คำถาม / สั่งงาน หรือพิมพ์ / ดูคำสั่งลัด":"พิมพ์คำถาม หรือ / ดูคำสั่งลัด (ส่ง = คัดลอกไปวางใน Claude)"}">${esc(AI.draft)}</textarea>
${mic}<button class="btn" id="${p}send"${AI.busy?" disabled":""}>${live?"ส่ง":"คัดลอกคำถาม"}</button></div></div>
${!live&&AI.pending?`<div class="aipaste"><b>ขั้นต่อไป:</b> ${AI.flash?esc(AI.flash):"คัดลอกแล้ว"} → ไปวางที่แชท Claude → ก๊อปคำตอบกลับมาวางตรงนี้
<textarea id="${p}Paste" rows="4" placeholder="วางคำตอบของ Claude ที่นี่"></textarea>
<div style="display:flex;gap:8px;margin-top:8px"><button class="btn sm" id="${p}PasteGo">แสดงคำตอบในแชท</button><button class="btn sm ghost" id="${p}CopyAgain">คัดลอกอีกครั้ง</button></div></div>`:""}`;
}
function aiView(){
if(AI.live===null){AI.live=false; aiPing();}
const live=AI.live, msgs=AI.msgs;
const msgHTML=msgs.map((m,i)=>m.role==="user"?`<div class="aib u">${esc(m.text)}</div>`
:m.role==="sys"?`<div class="aisys">${esc(m.text)}</div>`
:`<div class="aib a">${aiMd(m.text)}${(m.actions||[]).map((a,j)=>{const bad=a.state==="pending"?aiCheck(a):"";
return `<div class="aiact ${a.state}"><div class="aid">${aiDescribe(a)}${a.why?`<div class="aiwhy">${esc(a.why)}</div>`:""}${bad?`<div class="aiwhy" style="color:var(--over)">ทำไม่ได้: ${esc(bad)}</div>`:""}${a.state==="error"?`<div class="aiwhy" style="color:var(--over)">ไม่สำเร็จ: ${esc(a.err||"")}</div>`:""}</div>
${a.state==="pending"?`<button class="btn sm" data-aiok="${i}:${j}"${bad?" disabled":""}>ทำตามนี้</button><button class="btn sm ghost" data-aiskip="${i}:${j}">ข้าม</button>`:`<span class="pill ${a.state==="done"?"s-done":"s-wait"}">${a.state==="done"?"ทำแล้ว":a.state==="skipped"?"ข้ามแล้ว":"ไม่สำเร็จ"}</span>`}</div>`;}).join("")}</div>`).join("");
const first=!msgs.length?`<div class="aisys">สวัสดีค่ะวิม 👋 ถามได้เลย เช่น “สรุปงานสัปดาห์นี้” “งบหมวดไหนต้องระวัง” หรือ “จัดแผนงานสัปดาห์หน้า” — ถ้าผมเสนอให้แก้งาน จะขึ้นเป็นการ์ดให้กดยืนยันเองทุกครั้ง</div>`:"";
return `<div class="head"><div><h1>ผู้ช่วย AI</h1><div class="sub">สรุป · จัดแผน · เตือนงาน · เสนอการแก้ให้กดยืนยัน · ${syncChip()}</div></div>
<div class="noprint"><button class="btn ghost" id="aiClear">ล้างแชท</button></div></div>
<div class="card aiwrap">${aiChatHTML("ai")}</div>
<div class="card" style="margin-top:16px"><h2>ความเป็นส่วนตัวและการตั้งค่า</h2>
<details class="foldbox"><summary>ข้อมูลอะไรถูกส่งออกไปบ้าง</summary><div class="hint">ส่งเฉพาะสรุปที่แอปรวบรวม: รายการงานที่ยังไม่เสร็จ (ชื่อ ผู้รับผิดชอบ กำหนด งบ) งบตามหมวด GL สรุปอบรม/เกณฑ์กรมพัฒนาฯ แบบตัวเลขรวม และสถานะใบรับรอง — <b>ไม่มีรายชื่อหรือข้อมูลรายบุคคลของพนักงาน</b> (ระบบไม่ได้เก็บอยู่แล้ว) โหมดฝัง AI จะส่งไปยัง Anthropic ผ่านเซิร์ฟเวอร์ของคุณเอง ส่วนโหมดคัดลอก–วาง คุณเป็นคนวางเองในแชท Claude</div></details>
<details class="foldbox"><summary>วิธีเปิดโหมดฝัง AI (ตอบในแอปเลย)</summary><div class="hint">
1) สมัคร/ล็อกอิน <b>console.anthropic.com</b> → API keys → สร้าง key (เสียค่าใช้จ่ายตามการใช้งาน แยกจากแพ็กเกจแชท) · ตั้งวงเงินรายเดือนไว้กันพลาดได้<br>
2) Vercel → โปรเจคของคุณ → Settings → Environment Variables → เพิ่ม 3 ตัว: <b>ANTHROPIC_API_KEY</b> (key ข้อ 1) · <b>SUPABASE_URL</b> (Project URL) · <b>SUPABASE_ANON_KEY</b> (anon public key)<br>
3) กด Redeploy แล้วกลับมาหน้านี้ กด “ตรวจการเชื่อมต่อใหม่”<br>
<b>อย่าวาง API key ในแชท ในไฟล์ app.js หรือในหน้าแอป</b> — ใส่ที่ Vercel ที่เดียว · ตัวแปรเสริม: ALLOWED_EMAILS (จำกัดอีเมลที่ใช้ได้) · AI_MODEL (ชื่อรุ่นโมเดล)</div></details></div>`;
}
async function aiSend(q){
q=(q||"").trim(); if(!q||AI.busy)return;
AI.draft=""; let show="";
if(q[0]==="/"){ const r=aiSlash(q); if(r.done){ aiRefresh(); return; } show=r.show; q=r.q; }
else if(aiLocal(q)){ aiRefresh(); return; }
AI.msgs.push({role:"user",text:q,show:show||undefined}); aiSave();
if(!AI.live){ AI.pending=q; AI.flash=await aiCopyPrompt()?"คัดลอกข้อมูล+คำถามให้แล้ว":"คัดลอกอัตโนมัติไม่สำเร็จ กด “คัดลอกอีกครั้ง”"; aiRefresh(); return; }
AI.busy=true; aiRefresh();
try{
let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
const turns=[]; AI.msgs.filter(m=>m.role==="user"||m.role==="assistant").slice(-12).forEach(m=>{const c=m.text||""; if(turns.length&&turns[turns.length-1].role===m.role)turns[turns.length-1].content+="\n"+c; else turns.push({role:m.role,content:c});});
const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:AI_SYSTEM,context:aiContext(),messages:turns})});
const j=await r.json().catch(()=>({}));
if(!r.ok)throw new Error(j.message||("ผิดพลาด "+r.status));
const p=aiParse(j.text); AI.msgs.push({role:"assistant",text:p.text||"(ไม่มีข้อความตอบกลับ)",actions:p.actions});
}catch(e){ AI.msgs.push({role:"sys",text:"ติดต่อ AI ไม่สำเร็จ: "+(e.message||e)}); }
AI.busy=false; aiSave(); aiRefresh();
}
function aiPromptText(){
const hist=AI.msgs.filter(m=>m.role==="user"||m.role==="assistant").slice(-9,-1).map(m=>(m.role==="user"?"วิม: ":"ผู้ช่วย: ")+m.text).join("\n");
const last=[...AI.msgs].reverse().find(m=>m.role==="user");
return AI_SYSTEM+"\n\n[ข้อมูลในระบบ]\n"+aiContext()+(hist?"\n\n[บทสนทนาก่อนหน้า]\n"+hist:"")+"\n\n[คำถามล่าสุดของวิม]\n"+(last?last.text:"");
}
async function aiCopyPrompt(){
const t=aiPromptText();
try{ await navigator.clipboard.writeText(t); return true; }catch(e){}
try{ const ta=document.createElement("textarea"); ta.value=t; ta.style.cssText="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); const ok=document.execCommand("copy"); ta.remove(); return ok; }catch(e){ return false; }
}
function aiVoiceUI(){
document.querySelectorAll(".aimic").forEach(b=>b.classList.toggle("on",!!AI.listening));
document.querySelectorAll(".aivnote").forEach(n=>n.textContent=AI.vnote||"");
}
let aiRec=null;
function aiMic(p){
if(!AI_SR){ AI.vnote="เบราว์เซอร์นี้ไม่รองรับสั่งด้วยเสียง (ใช้ Chrome / Edge / Safari)"; aiVoiceUI(); return; }
if(AI.listening){ try{aiRec&&aiRec.stop();}catch(e){} return; }
const r=new AI_SR(); aiRec=r; r.lang="th-TH"; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
const base=(AI.draft||"").trim(); let fin="", heard=false;
const put=t=>{ const v=(base?base+" ":"")+t; AI.draft=v; const q=el(p+"q"); if(q)q.value=v; };
r.onstart=()=>{ AI.listening=true; AI.vnote="🎤 กำลังฟัง… พูดได้เลย"; aiVoiceUI(); };
r.onresult=e=>{ let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const t=e.results[i][0].transcript; if(e.results[i].isFinal)fin+=t; else interim+=t; } heard=true; put((fin+interim).trim()); };
r.onerror=e=>{ AI.vnote=e.error==="not-allowed"||e.error==="service-not-allowed"?"ยังไม่ได้อนุญาตไมโครโฟน — กดอนุญาตที่เบราว์เซอร์แล้วลองใหม่":e.error==="no-speech"?"ไม่ได้ยินเสียง ลองกดไมค์แล้วพูดใหม่":e.error==="aborted"?"":"ไมค์ผิดพลาด: "+e.error; };
r.onend=()=>{ AI.listening=false; aiRec=null; const t=(AI.draft||"").trim();
 if(heard&&t){ if(AI.live||/^(ไป|เปิด)/.test(t)||t[0]==="/"){ AI.vnote="ได้ยินว่า: “"+t+"” — กำลังส่ง"; aiVoiceUI(); aiSend(t); setTimeout(()=>{AI.vnote="";aiVoiceUI();},2500); return; } AI.vnote="ได้ยินว่า: “"+t+"” — แก้ได้แล้วกดส่ง"; }
 else if(!AI.vnote||/^🎤/.test(AI.vnote))AI.vnote="";
 aiVoiceUI(); };
try{ r.start(); }catch(e){ AI.listening=false; AI.vnote="เริ่มฟังไม่สำเร็จ ลองใหม่"; aiVoiceUI(); }
}
function aiMenuUpdate(p,v){
const m=el(p+"menu"); if(!m)return;
if(!v||v[0]!=="/"||/\s/.test(v.trim())&&v.trim().indexOf(" ")>-1&&AI_CMDS.some(c=>v.startsWith(c.k+" "))){ m.hidden=true; m.innerHTML=""; return; }
const f=AI_CMDS.filter(c=>c.k.startsWith(v.trim())||v.trim()==="/");
if(!f.length){ m.hidden=true; m.innerHTML=""; return; }
m.hidden=false; m.innerHTML=f.map(c=>`<button type="button" data-aicmd="${esc(c.k)}"><b>${esc(c.k)}</b>${c.a?` <i>${esc(c.a)}</i>`:""}<span>${esc(c.d)}</span></button>`).join("");
m.querySelectorAll("[data-aicmd]").forEach(b=>b.onmousedown=e=>{ e.preventDefault(); const c=AI_CMDS.find(x=>x.k===b.dataset.aicmd); m.hidden=true;
 if(c.a){ AI.draft=c.k+" "; const q=el(p+"q"); if(q){q.value=AI.draft;q.focus();} } else aiSend(c.k); });
}
function aiWireChat(root,p){
if(!root)return;
const q=el(p+"q");
if(q){ q.oninput=()=>{AI.draft=q.value; aiMenuUpdate(p,q.value);};
 q.onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); const m=el(p+"menu"); const v=q.value.trim();
  if(m&&!m.hidden&&!AI_CMDS.some(c=>v===c.k||v.startsWith(c.k+" "))){ const b=m.querySelector("[data-aicmd]"); if(b){ b.onmousedown({preventDefault(){}}); return; } }
  aiSend(q.value); } else if(e.key==="Escape"){ const m=el(p+"menu"); if(m&&!m.hidden){ m.hidden=true; e.stopPropagation(); } } }; }
const sd=el(p+"send"); if(sd)sd.onclick=()=>aiSend(q?q.value:"");
const mc=el(p+"mic"); if(mc)mc.onclick=()=>aiMic(p);
root.querySelectorAll("[data-aichip]").forEach(b=>b.onclick=()=>aiSend(AI_BTNS[+b.dataset.aichip].k));
const pg=el(p+"Ping"); if(pg)pg.onclick=()=>aiPing();
const ca=el(p+"CopyAgain"); if(ca)ca.onclick=async()=>{AI.flash=(await aiCopyPrompt())?"คัดลอกให้อีกครั้งแล้ว":"คัดลอกไม่สำเร็จ ลองใหม่"; aiRefresh();};
const pgo=el(p+"PasteGo"); if(pgo)pgo.onclick=()=>{ const v=(el(p+"Paste").value||"").trim(); if(!v)return; const r=aiParse(v); AI.msgs.push({role:"assistant",text:r.text||"(ไม่มีข้อความ)",actions:r.actions}); AI.pending=null; aiSave(); aiRefresh(); };
root.querySelectorAll("[data-aiskip]").forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.aiskip.split(":").map(Number); AI.msgs[i].actions[j].state="skipped"; aiSave(); aiRefresh();});
root.querySelectorAll("[data-aiok]").forEach(b=>b.onclick=async()=>{const [i,j]=b.dataset.aiok.split(":").map(Number); const a=AI.msgs[i].actions[j];
try{ await aiRun(a); a.state="done"; }catch(e){ a.state="error"; a.err=e.message||String(e); } aiSave(); aiRefresh();});
const box=el(p+"msgs"); if(box)box.scrollTop=box.scrollHeight;
}
function aiWire(){
aiWireChat(el("view"),"ai");
el("aiClear")&&(el("aiClear").onclick=()=>{AI.msgs=[];AI.pending=null;aiSave();aiRefresh();});
}
// ---- หน้าต่างผู้ช่วยลอย (อยู่ทุกหน้า ไม่ต้องย้ายไปหน้า AI)
function aiPopRender(){
const pop=el("aipop"); if(!pop)return;
const show=AI.open&&view!=="ai"&&!LOADING;
pop.hidden=!show; const fb=el("aifab"); if(fb){ fb.hidden=(view==="ai"); fb.classList.toggle("open",show); fb.setAttribute("aria-expanded",show?"true":"false"); }
if(!show){ if(AI.listening){try{aiRec&&aiRec.stop();}catch(e){}} return; }
if(AI.live===null){AI.live=false; aiPing();}
const hadFocus=document.activeElement&&document.activeElement.id==="afq"; const caret=hadFocus?document.activeElement.selectionStart:0;
pop.innerHTML=`<div class="aipoph"><b>${svg(ICON.ai,16)} ผู้ช่วย AI</b><span class="grow"></span>
<button class="aipb" id="afFull" title="เปิดเต็มหน้า" aria-label="เปิดเต็มหน้า">${svg('<path d="M14 4h6v6M20 4l-8 8M10 20H4v-6M4 20l8-8"/>',16)}</button>
<button class="aipb" id="afClear" title="ล้างแชท" aria-label="ล้างแชท">${svg('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',16)}</button>
<button class="aipb" id="afClose" title="ปิด" aria-label="ปิด">${svg('<path d="M6 6l12 12M18 6L6 18"/>',16)}</button></div>
<div class="aipopb">${aiChatHTML("af")}</div>`;
aiWireChat(pop,"af");
el("afFull").onclick=()=>{ AI.open=false; aiGo("ai"); };
el("afClear").onclick=()=>{AI.msgs=[];AI.pending=null;aiSave();aiRefresh();};
el("afClose").onclick=()=>{ AI.open=false; aiPopRender(); };
if(hadFocus){ const q=el("afq"); if(q){q.focus(); try{q.setSelectionRange(caret,caret);}catch(e){}} }
}
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&AI.open&&view!=="ai"&&!e.defaultPrevented){ AI.open=false; aiPopRender(); } });
function aiPopToggle(){ AI.open=!AI.open; aiPopRender(); if(AI.open){ const q=el("afq"); if(q)q.focus(); } }

