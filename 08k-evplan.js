// ===== Action Plan รายทีม + เทมเพลตงานอีเวนต์ (Project Hub) =====
// ข้อมูลเก็บในโปรเจค (items): acts[] = [{id,team,title,owner,due,st:todo|doing|done,kpi,note}] · ev = {date,venue,pax,budget,run[],chk{b,d,a},bud[],ven[],att{},rep{}}
// หน้าต่างแยก #evdlg เปิดจากการ์ดโปรเจค/กล่องโปรเจค/แท็บ "Action Plan" · แก้แล้วบันทึกทันทีแบบ merge (ไม่ยุ่งกับกล่องโปรเจคเดิม)
const EV={id:null,t:null,tab:"ap",sub:"run",team:"all",hide:false};
const evId=()=>"e"+Math.random().toString(36).slice(2,9);
const evToday=()=>isoOf(new Date());
const evAdd=(iso,n)=>{ const d=new Date(iso+"T00:00:00"); d.setDate(d.getDate()+n); return isoOf(d); };
const evM=n=>{ const v=phNum(n); return v===null?0:v; };
const evFm=n=>Number(Math.round(n*100)/100).toLocaleString("en-US");
const evHM=m=>{ m=((Math.round(m)%1440)+1440)%1440; return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); };
const evMin=s=>{ const m=/^(\d{1,2}):(\d{2})/.exec(s||""); return m?(+m[1])*60+(+m[2]):null; };
const EVST={todo:["ยังไม่เริ่ม","○"],doing:["กำลังทำ","◐"],done:["เสร็จแล้ว","●"]};
const EVNX={todo:"doing",doing:"done",done:"todo"};
const EVVST=["ติดต่อแล้ว","ขอใบเสนอราคา","ยืนยันแล้ว","ชำระแล้ว","ยกเลิก"];
const evTeams=t=>[{id:"",name:"ภาพรวมโปรเจค"}].concat(phKTeams(t));
const evActs=t=>Array.isArray(t.acts)?t.acts:[];
const evProg=a=>{ const n=a.length, d=a.filter(x=>x.st==="done").length; return {n,d,p:n?Math.round(d/n*100):0,late:a.filter(x=>x.st!=="done"&&x.due&&x.due<evToday()).length}; };
// ---------- เทมเพลต ----------
// run: [นาทีจากเวลาเริ่ม, ความยาว(นาที), กิจกรรม, ทีม(index)] · acts: [ทีม, งาน, กี่วันก่อนวันงาน(ติดลบ=หลังงาน)] · ms: [กี่วันก่อน, ชื่อ]
const EVT=[
{k:"party",name:"งานเลี้ยง / กิจกรรมพนักงาน",start:"17:30",pax:100,
 teams:["ฝ่ายสถานที่ & ตกแต่ง","ฝ่ายโปรแกรม & พิธีกร","ฝ่ายอาหาร & เครื่องดื่ม","ฝ่ายลงทะเบียน & ประชาสัมพันธ์","ฝ่ายการเงิน & จัดซื้อ"],
 run:[[-90,60,"เตรียมสถานที่ · เช็กเสียง/ภาพ · ซ้อมคิว",0],[-30,30,"ลงทะเบียน · ต้อนรับ",3],[0,10,"พิธีเปิด · กล่าวต้อนรับ",1],[10,60,"รับประทานอาหาร · การแสดง",2],[70,40,"กิจกรรม / เกมส์",1],[110,20,"จับรางวัล",1],[130,10,"กล่าวปิด · ถ่ายภาพหมู่",1],[140,60,"เก็บสถานที่ · ตรวจนับอุปกรณ์",0]],
 chk:{b:["ยืนยันวัน-สถานที่ และขออนุมัติงบ","ส่งเทียบเชิญ / ประกาศพนักงาน","ยืนยันซัพพลายเออร์ (อาหาร · เสียง · ตกแต่ง)","เตรียมของรางวัล / ของที่ระลึก","ทำป้ายลงทะเบียน · สคริปต์พิธีกร","ซักซ้อมโปรแกรม"],d:["ตั้งโต๊ะลงทะเบียน","ตรวจเสียง · ไมค์ · โปรเจกเตอร์","ตรวจอาหารและเครื่องดื่มมาครบ","ถ่ายภาพ / บันทึกวิดีโอ","นับผู้เข้าร่วมจริง"],a:["ชำระเงินซัพพลายเออร์","สรุปงบจริงเทียบแผน","ส่งภาพและขอบคุณทีมงาน","ส่งแบบประเมินความพึงพอใจ","สรุปรายงานหลังงาน"]},
 acts:[[4,"ขออนุมัติงบประมาณ",35],[0,"จอง/ยืนยันสถานที่",30],[3,"ส่งเทียบเชิญ + เปิดรับ RSVP",21],[1,"ร่างโปรแกรมและสคริปต์พิธีกร",14],[2,"ยืนยันเมนูและจำนวนที่นั่ง",10],[4,"สั่งซื้อของรางวัล / ของที่ระลึก",10],[0,"สั่งตกแต่ง · ป้ายหน้างาน",7],[3,"สรุปรายชื่อผู้ยืนยัน",5],[2,"ยืนยันจำนวนคนสุดท้ายกับผู้จัดเลี้ยง",3],[1,"ซักซ้อมโปรแกรม",2],[4,"เตรียมเงินสดย่อย / ใบเสร็จ",1],[4,"เคลียร์ใบเสร็จ · สรุปงบจริง",-7]],
 ms:[[30,"ยืนยันวัน-สถานที่ + อนุมัติงบ"],[21,"ส่งเทียบเชิญ"],[7,"ยืนยันผู้ขายทุกราย"],[0,"วันงาน"],[-7,"ส่งรายงานหลังงาน"]],
 bud:["สถานที่","อาหาร & เครื่องดื่ม","เสียง แสง ภาพ","ตกแต่ง & ป้าย","ของรางวัล / ของที่ระลึก","พิธีกร / การแสดง","ถ่ายภาพ / วิดีโอ","เบ็ดเตล็ด / สำรอง"],
 ven:[["ตัวแทนสถานที่","สถานที่"],["ผู้จัดเลี้ยง","อาหาร"],["ทีมเสียง-แสง","ระบบเสียง/ภาพ"],["ช่างภาพ","ถ่ายภาพ"]]},
{k:"train",name:"อบรม / สัมมนา",start:"09:00",pax:40,
 teams:["ฝ่ายหลักสูตร & วิทยากร","ฝ่ายสถานที่ & อุปกรณ์","ฝ่ายลงทะเบียน & ประสานผู้เข้าอบรม","ฝ่ายการเงิน & เอกสาร"],
 run:[[-45,45,"เตรียมห้อง · ทดสอบอุปกรณ์",1],[-15,15,"ลงทะเบียน · แจกเอกสาร",2],[0,15,"เปิดงาน · แนะนำวิทยากร",0],[15,90,"หัวข้อที่ 1",0],[105,15,"พัก",1],[120,90,"หัวข้อที่ 2",0],[210,60,"พักกลางวัน",1],[270,90,"Workshop / กรณีศึกษา",0],[360,30,"สรุป · ทดสอบหลังอบรม · แบบประเมิน",2],[390,15,"ปิดงาน · แจกวุฒิบัตร",0]],
 chk:{b:["ยืนยันวิทยากรและหัวข้อ","ส่งหนังสือเชิญ / เปิดลงทะเบียน","ยืนยันห้อง · อุปกรณ์ · อาหารว่าง","จัดทำเอกสารประกอบ / แบบทดสอบ","ตรวจสอบสิทธิ์ขอรับรองหลักสูตร (ถ้ามี)"],d:["เช็กชื่อผู้เข้าอบรม","แจกเอกสารและป้ายชื่อ","จับเวลาตามโปรแกรม","เก็บแบบประเมิน"],a:["ออกวุฒิบัตร / บันทึกประวัติการอบรม","จ่ายค่าวิทยากรและค่าใช้จ่าย","สรุปผลประเมิน + ผลทดสอบ","รายงานผลถึงผู้บังคับบัญชา"]},
 acts:[[0,"ยืนยันวิทยากร + หัวข้อ",30],[3,"ขออนุมัติงบและเบิกค่าวิทยากร",28],[2,"ส่งหนังสือเชิญ / เปิดลงทะเบียน",21],[1,"จองห้อง + อุปกรณ์",21],[0,"ส่งเอกสารประกอบให้ฝ่ายจัดพิมพ์",10],[2,"สรุปรายชื่อและแจ้งผู้ที่ยังไม่ตอบ",5],[1,"ทดสอบระบบเสียง/โปรเจกเตอร์/ออนไลน์",2],[3,"เตรียมเอกสารเบิกจ่าย",1],[3,"ปิดงบ + ส่งเอกสารบัญชี",-7],[2,"บันทึกผลการอบรมเข้าประวัติพนักงาน",-3]],
 ms:[[30,"ยืนยันวิทยากร"],[21,"เปิดลงทะเบียน"],[3,"ปิดรับสมัคร / ยืนยันจำนวน"],[0,"วันอบรม"],[-7,"รายงานผลการอบรม"]],
 bud:["ค่าวิทยากร","ค่าสถานที่ / ห้องอบรม","อาหารและอาหารว่าง","เอกสาร / วัสดุ","ค่าเดินทาง / ที่พักวิทยากร","เบ็ดเตล็ด / สำรอง"],
 ven:[["วิทยากร","บรรยาย"],["โรงแรม/ห้องอบรม","สถานที่"],["ผู้จัดเลี้ยง","อาหารว่าง"]]},
{k:"town",name:"Town Hall / ประชุมใหญ่พนักงาน",start:"14:00",pax:150,
 teams:["ฝ่ายเนื้อหา & ผู้บริหาร","ฝ่ายสถานที่ & เทคนิค","ฝ่ายสื่อสารองค์กร","ฝ่ายลงทะเบียน & อำนวยการ"],
 run:[[-60,60,"เตรียมห้อง · ทดสอบสไลด์ / ไมค์ / ถ่ายทอดสด",1],[-20,20,"ลงทะเบียน · ต้อนรับ",3],[0,5,"เปิดงาน · พิธีกร",3],[5,25,"ผู้บริหารกล่าวสรุปปี / ทิศทาง",0],[30,25,"ผลประกอบการ / ตัวชี้วัดหลัก",0],[55,15,"มอบรางวัล / ประกาศเกียรติคุณ",0],[70,30,"Q&A",0],[100,10,"ปิดงาน · ถ่ายภาพ",3]],
 chk:{b:["ยืนยันวันเวลากับผู้บริหาร","ส่งสไลด์ให้ผู้บริหารตรวจ","ประกาศพนักงานทุกสาขา + ลิงก์ออนไลน์","เตรียมช่องทางส่งคำถาม (Q&A)","ซักซ้อมกับผู้บริหาร"],d:["ตรวจระบบถ่ายทอดสด","เก็บคำถามจากผู้เข้าร่วม","บันทึกภาพ/วิดีโอ","นับผู้เข้าร่วม (ในห้อง/ออนไลน์)"],a:["ส่งสรุป + สไลด์ให้พนักงาน","ตอบคำถามที่ค้างจาก Q&A","รวบรวม feedback","รายงานหลังงานถึงผู้บริหาร"]},
 acts:[[0,"ยืนยันวันเวลาและหัวข้อกับผู้บริหาร",28],[3,"ประกาศพนักงาน + เปิดลงทะเบียน",21],[0,"ร่างสไลด์ / สคริปต์",14],[1,"ทดสอบระบบถ่ายทอดสด",7],[2,"เปิดช่องทางส่งคำถามล่วงหน้า",7],[0,"ซักซ้อมกับผู้บริหาร",3],[2,"สรุปคำถาม + จัดกลุ่มหัวข้อ",1],[2,"ส่งสรุป + ตอบคำถามที่ค้าง",-5]],
 ms:[[28,"ยืนยันวันเวลาและหัวข้อ"],[14,"ฉบับร่างสไลด์พร้อม"],[7,"ทดสอบระบบถ่ายทอดสด"],[0,"วัน Town Hall"],[-5,"ส่งสรุปให้พนักงาน"]],
 bud:["สถานที่ / เทคนิค","อาหารว่าง","สื่อ / ถ่ายทอดสด","ของที่ระลึก / รางวัล","เบ็ดเตล็ด / สำรอง"],
 ven:[["ทีมถ่ายทอดสด","เทคนิค"],["ผู้จัดเลี้ยง","อาหารว่าง"]]},
{k:"blank",name:"กิจกรรมทั่วไป (โครงเรียบง่าย)",start:"09:00",pax:50,
 teams:["ทีมงาน"],run:[[0,60,"เริ่มกิจกรรม",0]],
 chk:{b:["ยืนยันวัน-สถานที่","ขออนุมัติงบ","แจ้งผู้เข้าร่วม"],d:["ลงทะเบียน / นับผู้เข้าร่วม","ถ่ายภาพ"],a:["สรุปค่าใช้จ่าย","รายงานหลังงาน"]},
 acts:[[0,"ยืนยันวัน-สถานที่",14],[0,"ขออนุมัติงบ",14],[0,"แจ้งผู้เข้าร่วม",7]],ms:[[0,"วันงาน"]],bud:["ค่าใช้จ่ายหลัก","เบ็ดเตล็ด / สำรอง"],ven:[]}];
function evBuild(tp,p){ // p={date,start,venue,pax,budget,owner}
 const teams=tp.teams.map(n=>({id:evId(),name:n})), D=p.date, S=evMin(p.start)==null?evMin(tp.start):evMin(p.start);
 const acts=tp.acts.map(([ti,t,b])=>({id:evId(),team:teams[ti]?teams[ti].id:"",title:t,owner:"",due:D?evAdd(D,-b):"",st:"todo",kpi:"",note:""}));
 const mk=l=>l.map(t=>({id:evId(),t,done:false,owner:"",due:""}));
 const ev={date:D||"",start:p.start||tp.start,venue:p.venue||"",pax:+p.pax||tp.pax,budget:p.budget===""||p.budget==null?"":String(p.budget),tpl:tp.k,
  run:tp.run.map(([o,d,t,ti])=>({id:evId(),t:evHM(S+o),dur:d,title:t,owner:teams[ti]?teams[ti].name:"",note:""})),
  chk:{b:mk(tp.chk.b),d:mk(tp.chk.d),a:mk(tp.chk.a)},bud:tp.bud.map(item=>({id:evId(),item,plan:"",act:"",vendor:"",note:""})),ven:tp.ven.map(([name,svc])=>({id:evId(),name,svc,contact:"",cost:"",st:EVVST[0]})),att:{inv:"",conf:"",show:"",list:""},rep:{sum:"",good:"",fix:"",next:""}};
 if(D&&tp.chk.b.length){ ev.chk.b.forEach((x,i)=>{ x.due=evAdd(D,-Math.max(1,30-i*5)); }); ev.chk.a.forEach((x,i)=>{ x.due=evAdd(D,1+i*2); }); }
 const ms=tp.ms.map(([b,t])=>({t,d:false,due:D?evAdd(D,-b):undefined})).map(m=>{ if(!m.due)delete m.due; return m; });
 return {teams,acts,ev,ms}; }
function evAsk(t){ return new Promise(res=>{ const d=xDlg("evnew","min(560px,96vw)"); let done=false; const exist=!!t;
 d.innerHTML=`<div class="dlg-h">${exist?"เปิดโหมดอีเวนต์ให้โปรเจคนี้":"สร้างโปรเจคอีเวนต์จากเทมเพลต"}</div><div class="dlg-b" style="grid-template-columns:1fr 1fr">
<div class="f wide"><label for="en-tp">เทมเพลต</label><select class="ph-in" id="en-tp">${EVT.map(x=>`<option value="${x.k}">${esc(x.name)}</option>`).join("")}</select></div>
${exist?"":`<div class="f wide"><label for="en-ti">ชื่องาน *</label><input class="ph-in" id="en-ti" placeholder="เช่น งานเลี้ยงปีใหม่ 2570"></div>`}
<div class="f"><label for="en-dt">วันงาน *</label><input class="ph-in" type="date" id="en-dt" value="${esc((t&&(t.ev&&t.ev.date||t.pend||t.date))||"")}"></div><div class="f"><label for="en-st">เวลาเริ่ม</label><input class="ph-in" type="time" id="en-st" value="17:30"></div>
<div class="f"><label for="en-vn">สถานที่</label><input class="ph-in" id="en-vn" value="${esc((t&&(t.aplace||t.place||(t.ev&&t.ev.venue)))||"")}"></div><div class="f"><label for="en-px">จำนวนผู้เข้าร่วม (คาด)</label><input class="ph-in" type="number" id="en-px" inputmode="numeric" value="${esc((t&&(t.apax||""))||"")}"></div>
<div class="f"><label for="en-bg">งบอนุมัติ (บาท)</label><input class="ph-in" id="en-bg" inputmode="decimal" value="${esc((t&&(+t.b1||""))||"")}"></div><div class="f"><label for="en-ow">ผู้รับผิดชอบหลัก</label><input class="ph-in" id="en-ow" value="${esc((t&&t.owner)||"")}"></div>
<div class="f wide hint" style="margin:0" id="en-hint"></div></div>
<div class="dlg-f"><button type="button" class="btn ghost" id="en-no">ยกเลิก</button><button type="button" class="btn" id="en-ok">${exist?"เพิ่มโครงอีเวนต์":"สร้างโปรเจค"}</button></div>`;
 const hint=()=>{ const tp=EVT.find(x=>x.k===el("en-tp").value); el("en-hint").innerHTML=`จะสร้างให้: <b>${tp.teams.length} ทีมย่อย</b> · Action Plan <b>${tp.acts.length} งาน</b> (กำหนดส่งถอยหลังจากวันงาน) · run-of-show <b>${tp.run.length} รายการ</b> · เช็กลิสต์ <b>${tp.chk.b.length+tp.chk.d.length+tp.chk.a.length} ข้อ</b> · หมวดงบ ${tp.bud.length} · ผู้ขาย ${tp.ven.length}<br>แก้ไข/เพิ่ม/ลบได้ทุกอย่างหลังสร้าง`; };
 el("en-tp").onchange=()=>{ const tp=EVT.find(x=>x.k===el("en-tp").value); el("en-st").value=tp.start; el("en-px").placeholder=tp.pax; hint(); };
 el("en-tp").onchange(); if(t&&t.astart)el("en-st").value=t.astart; const fin=v=>{ if(done)return; done=true; d.close(); res(v); };
 el("en-no").onclick=()=>fin(null);
 el("en-ok").onclick=()=>{ const v={tp:el("en-tp").value,title:exist?"":el("en-ti").value.trim(),date:el("en-dt").value,start:el("en-st").value,venue:el("en-vn").value.trim(),pax:el("en-px").value,budget:el("en-bg").value.trim(),owner:el("en-ow").value.trim()};
  if(!exist&&!v.title){ el("en-ti").focus(); return; } if(!v.date){ el("en-dt").focus(); return; } fin(v); };
 d.onclose=()=>{ if(!done){ done=true; res(null); } }; d.showModal(); }); }
async function evCreate(){ const v=await evAsk(null); if(!v)return; const tp=EVT.find(x=>x.k===v.tp), b=evBuild(tp,v);
 const trk=(groups.find(g=>g.key==="annual")||groups[0]||{key:""}).key, today=evToday();
 const data={title:v.title,company:"",track:trk,type:"โปรเจค",status:"กำลังดำเนินการ",owner:v.owner,date:v.date,kind:"proj",pstart:today<v.date?today:v.date,pend:v.date,team:v.owner,prog:null,pgoal:"",prisk:"",ms:b.ms,kteams:b.teams,kpis:[],plog:[],acts:b.acts,ev:b.ev,note:"",tag:"",months:[],place:v.venue};
 try{ await saveItem(data); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; }
 setFoot("สร้างโปรเจคอีเวนต์ “"+v.title+"” แล้ว"); await new Promise(r=>setTimeout(r,700));
 const t=items.find(x=>x.title===v.title&&x.ev&&x.ev.date===v.date); if(t)evOpen(t._id); }
async function evEnable(){ const t=EV.t; const v=await evAsk(t); if(!v)return; const tp=EVT.find(x=>x.k===v.tp), b=evBuild(tp,v);
 const teams=phKTeams(t).slice(), mapT={}; b.teams.forEach(x=>{ const ex=teams.find(y=>y.name===x.name); if(ex)mapT[x.id]=ex.id; else{ teams.push(x); mapT[x.id]=x.id; } });
 const acts=evActs(t).concat(b.acts.map(a=>Object.assign({},a,{team:mapT[a.team]||a.team})));
 const patch={ev:b.ev,acts,kteams:teams,ms:chkList(t.ms).concat(b.ms)}; if(!t.date||t.date!==v.date)patch.date=v.date; if(!t.pend)patch.pend=v.date; await evSave(patch); EV.tab="ev"; EV.sub="run"; evPaint(); }
// ---------- บันทึก/เปิดกล่อง ----------
async function evSave(patch){ Object.assign(EV.t,patch); await phSave(EV.id,patch); }
const EVC={acts:t=>t.acts||(t.acts=[]),run:t=>t.ev.run||(t.ev.run=[]),chkb:t=>t.ev.chk.b,chkd:t=>t.ev.chk.d,chka:t=>t.ev.chk.a,bud:t=>t.ev.bud||(t.ev.bud=[]),ven:t=>t.ev.ven||(t.ev.ven=[])};
const evPatchOf=c=>c==="acts"?{acts:EV.t.acts}:{ev:EV.t.ev};
function evOpen(id,tab){ const t=items.find(x=>x._id===id); if(!t)return; if(PH.id&&typeof phFlush==="function")phFlush();
 EV.id=id; EV.t=JSON.parse(JSON.stringify(t)); if(t.ev&&!t.ev.chk)t.ev.chk={b:[],d:[],a:[]}; if(EV.t.ev&&!EV.t.ev.chk)EV.t.ev.chk={b:[],d:[],a:[]}; EV.tab=tab||"ap"; EV.team="all"; EV.hide=false;
 const d=xDlg("evdlg","min(1020px,97vw)"); d.className="evdlg"; d.onclick=evClick; d.onchange=evChange; d.onkeydown=evKey;
 d.onclose=()=>{ EV.id=null; EV.t=null; render(); }; evPaint(); if(!d.open)d.showModal(); }
function evPaint(){ const d=el("evdlg"), t=EV.t; if(!d||!t)return; const bd=d.querySelector(".ev-body"), sc=bd?bd.scrollTop:0, hasEv=!!t.ev;
 if(EV.tab==="ev"&&!hasEv)EV.tab="ap";
 const body=EV.tab==="ev"?evEvent():evAP(), A=evProg(evActs(t));
 d.innerHTML=`<div class="dlg-h">${esc(t.title)}<small class="ev-sub">${hasEv&&t.ev.date?"วันงาน "+fmtDate(t.ev.date)+(t.ev.venue?" · "+esc(t.ev.venue):""):"Action Plan รายทีม"}</small></div>
<div class="ev-tabs"><button data-evtab="ap" aria-pressed="${EV.tab==="ap"}">Action Plan <span class="ev-n">${A.d}/${A.n}</span></button>${hasEv?`<button data-evtab="ev" aria-pressed="${EV.tab==="ev"}">อีเวนต์</button>`:""}</div>
<div class="dlg-b ev-body" style="display:block">${body}</div><div class="dlg-f">${hasEv?"":`<button class="btn ghost" data-evenable>🎪 เปิดโหมดอีเวนต์ (เทมเพลต)</button>`}<button class="btn" data-evclose>เสร็จ</button></div>`;
 const b2=d.querySelector(".ev-body"); if(b2)b2.scrollTop=sc; }
// ---------- Action Plan ----------
function evAP(){ const t=EV.t, acts=evActs(t), T=evToday(), teams=evTeams(t), all=evProg(acts), ks=(t.kpis||[]).filter(k=>k.name);
 const shown=EV.team==="all"?teams:teams.filter(x=>x.id===EV.team);
 const sel=`<select class="ph-in sm" data-evteam><option value="all">ทุกทีม</option>${teams.map(x=>`<option value="${esc(x.id)}"${EV.team===x.id?" selected":""}>${esc(x.name)}</option>`).join("")}</select>`;
 const chips=teams.map(x=>{ const p=evProg(acts.filter(a=>(a.team||"")===x.id)); return p.n?`<span class="ev-tc${p.late?" late":""}" data-evteamset="${esc(x.id)}">${esc(x.name)} <b>${p.d}/${p.n}</b>${p.late?` · เลย ${p.late}`:""}</span>`:""; }).join("");
 const grp=g=>{ const L=acts.filter(a=>(a.team||"")===g.id), P=evProg(L), vis=L.filter(a=>!(EV.hide&&a.st==="done")).sort((a,b)=>(a.st==="done")-(b.st==="done")||(a.due||"9").localeCompare(b.due||"9"));
  return `<div class="ev-g"><div class="ev-gh"><b>${esc(g.name)}</b><span>${P.d}/${P.n}${P.late?` · <i class="late">เลยกำหนด ${P.late}</i>`:""}</span><div class="ph-bar sm"><i style="width:${P.p}%;background:${P.late?"var(--over)":"var(--ok)"}"></i></div><b>${P.p}%</b>${g.id!==""?`<button class="ph-x" data-evteamdel="${esc(g.id)}" title="ลบทีมนี้ (งานจะย้ายไปภาพรวม)">×</button>`:""}</div>
${vis.map(a=>evRow(a,ks,T)).join("")||`<div class="ph-hint">${L.length?"ทุกงานเสร็จแล้ว 🎉":"ยังไม่มีงาน"}</div>`}
<div class="ev-add" data-addrow="acts|${esc(g.id)}"><input class="ph-in" data-af="title" placeholder="งานใหม่ของทีมนี้…"><input class="ph-in" data-af="owner" placeholder="ผู้รับผิดชอบ"><input class="ph-in" type="date" data-af="due"><button class="btn sm" data-add="acts|${esc(g.id)}">+ เพิ่ม</button></div></div>`; };
 return `<div class="ev-sum"><div><b>${all.p}%</b><span>เสร็จแล้ว ${all.d}/${all.n}</span></div><div><b${all.late?` style="color:var(--over)"`:""}>${all.late}</b><span>เลยกำหนด</span></div><div class="ev-chips">${chips||`<span class="ph-hint">ยังไม่มีงานใน Action Plan</span>`}</div></div>
<div class="ev-bar">${sel}<label class="ev-ck"><input type="checkbox" data-evhide${EV.hide?" checked":""}> ซ่อนที่เสร็จแล้ว</label><span class="ev-sp"></span><input class="ph-in sm" id="ev-tn" placeholder="ชื่อทีมใหม่" maxlength="40"><button class="btn ghost sm" data-evteamadd>+ เพิ่มทีม</button></div>${shown.map(grp).join("")}`; }
function evRow(a,ks,T){ const late=a.st!=="done"&&a.due&&a.due<T, s=EVST[a.st]||EVST.todo;
 return `<div class="ev-ar st-${a.st||"todo"}${late?" late":""}"><button class="ev-st" data-evst="${a.id}" title="${s[0]} — แตะเพื่อเปลี่ยน">${s[1]}</button>
<input class="ph-in" data-k="acts|${a.id}|title" value="${esc(a.title)}"><input class="ph-in" data-k="acts|${a.id}|owner" value="${esc(a.owner||"")}" placeholder="ผู้รับผิดชอบ"><input class="ph-in" type="date" data-k="acts|${a.id}|due" value="${esc(a.due||"")}">
${ks.length?`<select class="ph-in" data-k="acts|${a.id}|kpi"><option value="">— ไม่ผูก KPI —</option>${ks.map(k=>`<option value="${esc(k.id)}"${a.kpi===k.id?" selected":""}>${esc((k.code?k.code+" ":"")+k.name)}</option>`).join("")}</select>`:`<span></span>`}
<button class="ph-x" data-del="acts|${a.id}" title="ลบ">×</button></div>`; }
// ---------- อีเวนต์ ----------
const EVSUB=[["run","โปรแกรม (Run-of-show)"],["chk","เช็กลิสต์"],["bud","งบ แผน/จริง"],["ven","ผู้ขาย"],["att","ผู้เข้าร่วม"],["rep","รายงานหลังงาน"]];
function evEvent(){ const e=EV.t.ev, sub=EV.sub; const S=(k,ph,type)=>`<input class="ph-in" ${type?`type="${type}" `:""}data-s="${k}" value="${esc(k.split(".").reduce((o,x)=>o&&o[x],EV.t)||"")}"${ph?` placeholder="${ph}"`:""}>`;
 const body=sub==="run"?evRun():sub==="chk"?evChk():sub==="bud"?evBud():sub==="ven"?evVen():sub==="att"?evAtt():evRep();
 return `<div class="ev-info"><label>วันงาน${S("ev.date","","date")}</label><label>เวลาเริ่ม${S("ev.start","","time")}</label><label>สถานที่${S("ev.venue","สถานที่จัดงาน")}</label><label>ผู้เข้าร่วม (คาด)${S("ev.pax","คน","number")}</label><label>งบอนุมัติ (บาท)${S("ev.budget","เช่น 150000")}</label></div>
<div class="ev-subs">${EVSUB.map(([k,l])=>`<button data-evsub="${k}" aria-pressed="${sub===k}">${l}</button>`).join("")}</div>${body}`; }
const evIn=(coll,r,f,ph,type,cls)=>`<input class="ph-in${cls?" "+cls:""}" ${type?`type="${type}" `:""}data-k="${coll}|${r.id}|${f}" value="${esc(r[f]==null?"":r[f])}"${ph?` placeholder="${ph}"`:""}>`;
const evAddRow=(coll,fields,lbl)=>`<div class="ev-add" data-addrow="${coll}">${fields.map(([f,ph,type])=>`<input class="ph-in" ${type?`type="${type}" `:""}data-af="${f}" placeholder="${ph}">`).join("")}<button class="btn sm" data-add="${coll}">${lbl||"+ เพิ่ม"}</button></div>`;
function evRun(){ const e=EV.t.ev, L=(e.run||[]).slice().sort((a,b)=>(evMin(a.t)==null?9999:evMin(a.t))-(evMin(b.t)==null?9999:evMin(b.t)));
 const first=L.find(x=>evMin(x.t)!=null), last=L.filter(x=>evMin(x.t)!=null).pop(), end=last?evMin(last.t)+(+last.dur||0):null;
 return `<div class="ev-h"><h3>กำหนดการ / Run-of-show <small>${L.length} รายการ${first&&end!=null?" · "+first.t+"–"+evHM(end):""}</small></h3><button class="btn ghost sm" data-evprint="run">🖨 พิมพ์ / PDF</button></div>
<div class="ev-rh"><span>เวลา</span><span>นาที</span><span>กิจกรรม</span><span>ผู้รับผิดชอบ</span><span>หมายเหตุ</span><span></span></div>
${L.map(r=>`<div class="ev-rr">${evIn("run",r,"t","","time")}${evIn("run",r,"dur","","number")}${evIn("run",r,"title")}${evIn("run",r,"owner")}${evIn("run",r,"note")}<button class="ph-x" data-del="run|${r.id}">×</button></div>`).join("")||`<div class="ph-hint">ยังไม่มีรายการ</div>`}
${evAddRow("run",[["t","เวลา","time"],["dur","นาที","number"],["title","กิจกรรม"],["owner","ผู้รับผิดชอบ"],["note","หมายเหตุ"]])}`; }
function evChk(){ const e=EV.t.ev, T=evToday(), sec=(c,l,L)=>{ const p=evProg(L.map(x=>({st:x.done?"done":"todo",due:x.due}))); return `<div class="ev-g"><div class="ev-gh"><b>${l}</b><span>${p.d}/${p.n}${p.late?` · <i class="late">เลยกำหนด ${p.late}</i>`:""}</span><div class="ph-bar sm"><i style="width:${p.p}%;background:${p.late?"var(--over)":"var(--ok)"}"></i></div><b>${p.p}%</b></div>
${L.map(r=>`<div class="ev-cr${r.done?" on":""}${!r.done&&r.due&&r.due<T?" late":""}"><input type="checkbox" data-chk="${c}|${r.id}"${r.done?" checked":""}>${evIn(c,r,"t")}${evIn(c,r,"owner","ผู้รับผิดชอบ")}${evIn(c,r,"due","","date")}<button class="ph-x" data-del="${c}|${r.id}">×</button></div>`).join("")||`<div class="ph-hint">ยังไม่มีรายการ</div>`}
<div class="ev-add" data-addrow="${c}"><input class="ph-in" data-af="t" placeholder="ข้อใหม่…"><input class="ph-in" data-af="owner" placeholder="ผู้รับผิดชอบ"><input class="ph-in" type="date" data-af="due"><button class="btn sm" data-add="${c}">+ เพิ่ม</button></div></div>`; };
 return `<div class="ev-h"><h3>เช็กลิสต์ ก่อน / ระหว่าง / หลังงาน</h3><button class="btn ghost sm" data-evprint="chk">🖨 พิมพ์ / PDF</button></div>${sec("chkb","ก่อนงาน",e.chk.b)}${sec("chkd","วันงาน",e.chk.d)}${sec("chka","หลังงาน",e.chk.a)}`; }
function evBudTot(e){ const plan=(e.bud||[]).reduce((s,x)=>s+evM(x.plan),0), act=(e.bud||[]).reduce((s,x)=>s+evM(x.act),0), ap=evM(e.budget); return {plan,act,ap,diff:plan-act}; }
function evBud(){ const e=EV.t.ev, B=evBudTot(e), lim=B.ap||B.plan, pct=lim?Math.round(B.act/lim*100):0;
 return `<div class="ev-h"><h3>งบประมาณ แผน vs จริง</h3></div>
<div class="ev-sum"><div><b>${evFm(B.ap)}</b><span>งบอนุมัติ</span></div><div><b>${evFm(B.plan)}</b><span>รวมแผน${B.ap&&B.plan>B.ap?` <i class="late">เกินงบ ${evFm(B.plan-B.ap)}</i>`:""}</span></div><div><b>${evFm(B.act)}</b><span>ใช้จริง</span></div><div><b style="color:${B.act>(B.ap||B.plan)&&(B.ap||B.plan)?"var(--over)":"var(--ok)"}">${evFm((B.ap||B.plan)-B.act)}</b><span>คงเหลือ (เทียบ${B.ap?"งบอนุมัติ":"แผน"})</span></div></div>
<div class="ph-bar" style="margin:6px 0 12px"><i style="width:${Math.min(100,pct)}%;background:${pct>100?"var(--over)":pct>85?"#d99a14":"var(--ok)"}"></i></div>
<div class="ev-bh"><span>รายการ</span><span>แผน</span><span>จริง</span><span>ผู้ขาย</span><span>ต่าง</span><span></span></div>
${(e.bud||[]).map(r=>{ const df=evM(r.plan)-evM(r.act), has=String(r.act||"").trim()!==""; return `<div class="ev-br">${evIn("bud",r,"item")}${evIn("bud",r,"plan","แผน","text","num")}${evIn("bud",r,"act","จริง","text","num")}${evIn("bud",r,"vendor")}<b class="df ${has?(df<0?"neg":"pos"):""}">${has?(df>0?"+":"")+evFm(df):"–"}</b><button class="ph-x" data-del="bud|${r.id}">×</button></div>`; }).join("")||`<div class="ph-hint">ยังไม่มีหมวดงบ</div>`}
${evAddRow("bud",[["item","หมวด/รายการ"],["plan","แผน (บาท)"],["act","จริง (บาท)"],["vendor","ผู้ขาย"]])}<div class="ph-hint">ต่าง = แผน − จริง (ติดลบ = เกินแผน) · ใส่ “จริง” เมื่อมีใบเสร็จ/ใบแจ้งหนี้แล้ว</div>`; }
function evVen(){ const e=EV.t.ev, tot=(e.ven||[]).reduce((s,x)=>s+evM(x.cost),0);
 return `<div class="ev-h"><h3>ผู้ขาย / ซัพพลายเออร์ <small>รวมค่าใช้จ่ายตามใบเสนอราคา ${evFm(tot)} บาท</small></h3></div>
<div class="ev-vh"><span>ชื่อ</span><span>บริการ</span><span>ผู้ติดต่อ / เบอร์</span><span>ค่าใช้จ่าย</span><span>สถานะ</span><span></span></div>
${(e.ven||[]).map(r=>`<div class="ev-vr">${evIn("ven",r,"name")}${evIn("ven",r,"svc")}${evIn("ven",r,"contact")}${evIn("ven",r,"cost","","text","num")}<select class="ph-in" data-k="ven|${r.id}|st">${EVVST.map(s=>`<option${r.st===s?" selected":""}>${s}</option>`).join("")}</select><button class="ph-x" data-del="ven|${r.id}">×</button></div>`).join("")||`<div class="ph-hint">ยังไม่มีผู้ขาย</div>`}
${evAddRow("ven",[["name","ชื่อผู้ขาย"],["svc","บริการ"],["contact","ผู้ติดต่อ / เบอร์"],["cost","ค่าใช้จ่าย"]])}`; }
function evAtt(){ const a=EV.t.ev.att||(EV.t.ev.att={}), inv=evM(a.inv), conf=evM(a.conf), show=evM(a.show), n=(a.list||"").split("\n").filter(x=>x.trim()).length, pr=(x,y)=>y?Math.round(x/y*100)+"%":"–";
 const f=(k,l)=>`<label>${l}<input class="ph-in" type="number" inputmode="numeric" data-s="ev.att.${k}" value="${esc(a[k]==null?"":a[k])}"></label>`;
 return `<div class="ev-h"><h3>ผู้เข้าร่วม</h3></div><div class="ev-info">${f("inv","ได้รับเชิญ (คน)")}${f("conf","ยืนยันเข้าร่วม")}${f("show","มาจริง")}</div>
<div class="ev-sum"><div><b>${pr(conf,inv)}</b><span>ตอบรับ (ยืนยัน/เชิญ)</span></div><div><b>${pr(show,conf)}</b><span>มาจริง/ยืนยัน (show rate)</span></div><div><b>${pr(show,evM(EV.t.ev.pax)||inv)}</b><span>มาจริง/เป้าหมาย</span></div></div>
<label class="ev-ta">รายชื่อ (บรรทัดละ 1 คน — ชื่อ · ฝ่าย · อาหาร/หมายเหตุ) <small>${n} รายชื่อ</small><textarea class="ph-in" rows="8" data-s="ev.att.list" placeholder="สมชาย ใจดี · บัญชี · มังสวิรัติ">${esc(a.list||"")}</textarea></label>
${n?`<button class="btn ghost sm" data-evattn>ใช้จำนวนรายชื่อ (${n}) เป็น “ได้รับเชิญ”</button>`:""}`; }
function evFacts(){ const t=EV.t, e=t.ev, B=evBudTot(e), a=e.att||{}, chk=[...e.chk.b,...e.chk.d,...e.chk.a], cd=chk.filter(x=>x.done).length, A=evProg(evActs(t));
 return {B,a,chk:{d:cd,n:chk.length},A,vend:(e.ven||[]).length}; }
function evRepText(){ const t=EV.t, e=t.ev, F=evFacts(), r=e.rep||{}, L=[];
 L.push("รายงานสรุปหลังงาน: "+t.title); L.push("วันที่ "+(e.date?fmtDate(e.date)+" "+(+e.date.slice(0,4)+543):"-")+(e.start?" เวลา "+e.start:"")+(e.venue?" · สถานที่ "+e.venue:""));
 L.push("ผู้เข้าร่วม: เชิญ "+(F.a.inv||"-")+" · ยืนยัน "+(F.a.conf||"-")+" · มาจริง "+(F.a.show||"-")+(evM(F.a.conf)?" (show rate "+Math.round(evM(F.a.show)/evM(F.a.conf)*100)+"%)":""));
 L.push("งบประมาณ: อนุมัติ "+evFm(F.B.ap)+" · แผน "+evFm(F.B.plan)+" · ใช้จริง "+evFm(F.B.act)+" บาท"+((F.B.ap||F.B.plan)?" · คงเหลือ "+evFm((F.B.ap||F.B.plan)-F.B.act):""));
 L.push("ความพร้อม: เช็กลิสต์ "+F.chk.d+"/"+F.chk.n+" · Action Plan "+F.A.d+"/"+F.A.n);
 [["สรุปภาพรวม",r.sum],["สิ่งที่ทำได้ดี",r.good],["สิ่งที่ควรปรับปรุง",r.fix],["ข้อเสนอสำหรับครั้งต่อไป",r.next]].forEach(([h,v])=>{ if(v&&v.trim())L.push("\n"+h+":\n"+v.trim()); });
 return L.join("\n"); }
function evRep(){ const e=EV.t.ev, F=evFacts(), r=e.rep||(e.rep={});
 const ta=(k,l,ph)=>`<label class="ev-ta">${l}<textarea class="ph-in" rows="3" data-s="ev.rep.${k}" placeholder="${ph}">${esc(r[k]||"")}</textarea></label>`;
 return `<div class="ev-h"><h3>รายงานหลังงาน</h3><span><button class="btn ghost sm" data-evcopy>คัดลอกข้อความ</button> <button class="btn ghost sm" data-evprint="rep">🖨 พิมพ์ / PDF</button></span></div>
<div class="ev-sum"><div><b>${F.a.show||"–"}</b><span>ผู้มาจริง</span></div><div><b>${evFm(F.B.act)}</b><span>ใช้จริง (บาท)${F.B.ap?` / อนุมัติ ${evFm(F.B.ap)}`:""}</span></div><div><b>${F.chk.n?Math.round(F.chk.d/F.chk.n*100)+"%":"–"}</b><span>เช็กลิสต์เสร็จ</span></div><div><b>${F.A.p}%</b><span>Action Plan เสร็จ</span></div></div>
${ta("sum","สรุปภาพรวมงาน","งานเป็นอย่างไร ตรงวัตถุประสงค์ไหม")}${ta("good","สิ่งที่ทำได้ดี","")}${ta("fix","สิ่งที่ควรปรับปรุง","")}${ta("next","ข้อเสนอสำหรับครั้งต่อไป","")}<div class="ph-hint">ตัวเลขด้านบนดึงจากแท็บอื่นอัตโนมัติ — ไม่ต้องกรอกซ้ำ</div>`; }
// ---------- ปุ่ม / การเปลี่ยนค่า ----------
function evAddRec(spec){ const [coll,team]=spec.split("|"), row=el("evdlg").querySelector('[data-addrow="'+spec+'"]'); if(!row)return; const v={}; row.querySelectorAll("[data-af]").forEach(i=>{ v[i.dataset.af]=i.value.trim(); });
 const need=coll==="acts"?v.title:coll==="run"?v.title:coll==="bud"?v.item:coll==="ven"?v.name:v.t; if(!need){ const f=row.querySelector("[data-af]"); if(f)f.focus(); return; }
 let rec; if(coll==="acts")rec={id:evId(),team:team||"",title:v.title,owner:v.owner||"",due:v.due||"",st:"todo",kpi:"",note:""};
 else if(coll==="run")rec={id:evId(),t:v.t||"",dur:+v.dur||0,title:v.title,owner:v.owner||"",note:v.note||""};
 else if(coll==="bud")rec={id:evId(),item:v.item,plan:v.plan||"",act:v.act||"",vendor:v.vendor||"",note:""};
 else if(coll==="ven")rec={id:evId(),name:v.name,svc:v.svc||"",contact:v.contact||"",cost:v.cost||"",st:EVVST[0]};
 else rec={id:evId(),t:v.t,done:false,owner:v.owner||"",due:v.due||""};
 EVC[coll](EV.t).push(rec); row.querySelectorAll("[data-af]").forEach(i=>{ i.value=""; }); evSave(evPatchOf(coll)); evPaint();
 const nr=el("evdlg").querySelector('[data-addrow="'+spec+'"] [data-af]'); if(nr)nr.focus(); }
async function evClick(e){ const b=e.target.closest("button"); if(!b)return; const D=b.dataset, t=EV.t;
 if(D.evclose!==undefined){ el("evdlg").close(); return; }
 if(D.evtab){ EV.tab=D.evtab; evPaint(); return; } if(D.evsub){ EV.sub=D.evsub; evPaint(); return; }
 if(D.evteamset!==undefined){ EV.team=D.evteamset; evPaint(); return; }
 if(D.evteamadd!==undefined){ const n=(el("ev-tn").value||"").trim(); if(!n){ el("ev-tn").focus(); return; } await evSave({kteams:phKTeams(t).concat([{id:evId(),name:n}])}); evPaint(); return; }
 if(D.evteamdel!==undefined){ const id=D.evteamdel, tm=phKTeams(t).find(x=>x.id===id); if((t.kpis||[]).some(k=>k.team===id)){ tell("<b>ทีมนี้มี KPI ผูกอยู่</b><div style=\"font-size:13px;margin-top:8px\">ย้าย/ลบ KPI ของทีมนี้ในกล่องโปรเจคก่อนนะคะ</div>"); return; }
  if(!await ask("ลบทีม “"+esc(tm?tm.name:"")+"” ?<br><small>งานใน Action Plan ของทีมนี้จะย้ายไปหมวด “ภาพรวมโปรเจค”</small>","ลบทีม"))return;
  evActs(t).forEach(a=>{ if(a.team===id)a.team=""; }); await evSave({kteams:phKTeams(t).filter(x=>x.id!==id),acts:t.acts||[]}); if(EV.team===id)EV.team="all"; evPaint(); return; }
 if(D.evst){ const a=evActs(t).find(x=>x.id===D.evst); if(a){ a.st=EVNX[a.st||"todo"]; await evSave({acts:t.acts}); evPaint(); } return; }
 if(D.add){ evAddRec(D.add); return; }
 if(D.del){ const [c,id]=D.del.split("|"), L=EVC[c](t), i=L.findIndex(x=>x.id===id); if(i>=0){ L.splice(i,1); await evSave(evPatchOf(c)); evPaint(); } return; }
 if(D.evenable!==undefined){ evEnable(); return; }
 if(D.evprint){ evPrintDoc(D.evprint); return; }
 if(D.evcopy!==undefined){ const tx=evRepText(); try{ await navigator.clipboard.writeText(tx); setFoot("คัดลอกรายงานแล้ว"); b.textContent="คัดลอกแล้ว ✓"; }catch(x){ tell("<b>คัดลอกอัตโนมัติไม่ได้</b><pre style=\"white-space:pre-wrap;font:13px/1.6 var(--font);text-align:left;margin-top:10px\">"+esc(tx)+"</pre>"); } return; }
 if(D.evattn!==undefined){ const a=t.ev.att; a.inv=String((a.list||"").split("\n").filter(x=>x.trim()).length); await evSave({ev:t.ev}); evPaint(); return; } }
function evChange(e){ const n=e.target, t=EV.t; if(!t)return;
 if(n.dataset.evteam!==undefined){ EV.team=n.value; evPaint(); return; }
 if(n.dataset.evhide!==undefined){ EV.hide=n.checked; evPaint(); return; }
 if(n.dataset.chk){ const [c,id]=n.dataset.chk.split("|"), r=EVC[c](t).find(x=>x.id===id); if(r){ r.done=n.checked; evSave({ev:t.ev}); setTimeout(evPaint,0); } return; }
 if(n.dataset.k){ const [c,id,f]=n.dataset.k.split("|"), r=EVC[c](t).find(x=>x.id===id); if(!r)return; r[f]=(f==="dur")?(+n.value||0):n.value; if(c==="acts"&&f==="title"&&!n.value.trim())return; evSave(evPatchOf(c)); setTimeout(evPaint,0); return; }
 if(n.dataset.s){ const p=n.dataset.s.split("."), last=p.pop(); let o=t; p.forEach(k=>{ o=o[k]||(o[k]={}); }); o[last]=n.type==="number"?n.value:n.value; const patch={ev:t.ev};
  if(n.dataset.s==="ev.date"&&n.value){ patch.date=n.value; patch.pend=n.value; } evSave(patch); setTimeout(evPaint,0); } }
function evKey(e){ if(e.key!=="Enter")return; const n=e.target; if(n.tagName==="TEXTAREA"||!n.matches("input"))return; e.preventDefault(); const r=n.closest("[data-addrow]"); if(r){ evAddRec(r.dataset.addrow); return; } n.blur(); }
// รักษาค่าที่พิมพ์ค้างในแถวเพิ่ม + ตำแหน่งโฟกัสเมื่อวาดใหม่
{ const _p=evPaint; evPaint=function(){ const d=el("evdlg"); const keep={}; let foc=null;
  if(d){ d.querySelectorAll("[data-addrow] [data-af]").forEach(i=>{ if(i.value)keep[i.closest("[data-addrow]").dataset.addrow+"|"+i.dataset.af]=i.value; });
   const a=document.activeElement; if(a&&d.contains(a)){ let sel=null; if(a.dataset.k)sel='[data-k="'+a.dataset.k+'"]'; else if(a.dataset.s)sel='[data-s="'+a.dataset.s+'"]'; else if(a.dataset.af&&a.closest("[data-addrow]"))sel='[data-addrow="'+a.closest("[data-addrow]").dataset.addrow+'"] [data-af="'+a.dataset.af+'"]'; if(sel)foc={sel,s:a.selectionStart,e:a.selectionEnd}; } }
  _p.apply(this,arguments); if(!d)return;
  d.querySelectorAll("[data-addrow] [data-af]").forEach(i=>{ const k=i.closest("[data-addrow]").dataset.addrow+"|"+i.dataset.af; if(keep[k]!==undefined)i.value=keep[k]; });
  if(foc){ const n=d.querySelector(foc.sel); if(n){ n.focus(); try{ if(foc.s!=null)n.setSelectionRange(foc.s,foc.e); }catch(x){} } } }; }
// ---------- พิมพ์ ----------
function evPrintHtml(html,land){ let s=el("psheet"); if(!s){ s=document.createElement("div"); s.id="psheet"; document.body.appendChild(s); } s.innerHTML=html;
 let pg=el("psheet-pg"); if(!pg){ pg=document.createElement("style"); pg.id="psheet-pg"; document.head.appendChild(pg); } pg.textContent=`@page{size:A4 ${land?"landscape":"portrait"};margin:10mm}`; document.body.classList.add("psheet-on");
 const done=()=>{ document.body.classList.remove("psheet-on"); s.innerHTML=""; window.removeEventListener("afterprint",done); }; window.addEventListener("afterprint",done); setTimeout(()=>{ try{ window.print(); }catch(x){ done(); } },80); }
function evPhead(h,t){ const e=t.ev, n=new Date(); return `<header><div><h1>${h}</h1><div class="who">${esc(t.title)}</div></div><div class="dt"><b>${e.date?spDate(e.date):"ยังไม่ระบุวันงาน"}</b><small>${[e.start&&"เริ่ม "+e.start,e.venue].filter(Boolean).map(esc).join(" · ")}</small></div></header>`; }
const evPfoot=()=>`<footer>พิมพ์เมื่อ ${new Date().toLocaleString("th-TH")} · Sky Plan · Project Hub</footer>`;
function evPrintDoc(kind){ const t=EV.t, e=t.ev; let h="";
 if(kind==="run"){ const L=(e.run||[]).slice().sort((a,b)=>(evMin(a.t)==null?9999:evMin(a.t))-(evMin(b.t)==null?9999:evMin(b.t)));
  h=`<section class="psh day">${evPhead("Run-of-show / กำหนดการ",t)}<table class="pst"><thead><tr><th style="width:14%">เวลา</th><th style="width:7%">นาที</th><th>กิจกรรม</th><th style="width:20%">ผู้รับผิดชอบ</th><th style="width:20%">หมายเหตุ</th><th style="width:5%">✓</th></tr></thead><tbody>${L.map(r=>{ const a=evMin(r.t); return `<tr><td class="tm">${esc(r.t||"")}${a!=null&&+r.dur?"–"+evHM(a+(+r.dur)):""}</td><td>${r.dur||""}</td><td><b>${esc(r.title)}</b></td><td>${esc(r.owner||"")}</td><td>${esc(r.note||"")}</td><td></td></tr>`; }).join("")}</tbody></table>${evPfoot()}</section>`; evPrintHtml(h,false); return; }
 if(kind==="chk"){ const sec=(l,L)=>`<div class="psx"><h3>${l}</h3><table class="pst sm"><tbody>${L.map(x=>`<tr><td style="width:6%">${x.done?"☑":"☐"}</td><td>${esc(x.t)}</td><td style="width:22%">${esc(x.owner||"")}</td><td class="r" style="width:14%">${x.due?fmtDate(x.due):""}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">—</td></tr>`}</tbody></table></div>`;
  h=`<section class="psh day">${evPhead("เช็กลิสต์งานอีเวนต์",t)}${sec("ก่อนงาน",e.chk.b)}<br>${sec("วันงาน",e.chk.d)}<br>${sec("หลังงาน",e.chk.a)}${evPfoot()}</section>`; evPrintHtml(h,false); return; }
 const F=evFacts(), r=e.rep||{}, blk=(l,v)=>v&&v.trim()?`<div class="psx"><h3>${l}</h3><p style="white-space:pre-wrap;margin:2px 0 10px">${esc(v.trim())}</p></div>`:"";
 const rows=[["ผู้เข้าร่วม",`เชิญ ${F.a.inv||"-"} · ยืนยัน ${F.a.conf||"-"} · มาจริง ${F.a.show||"-"}`+(evM(F.a.conf)?` (show rate ${Math.round(evM(F.a.show)/evM(F.a.conf)*100)}%)`:"")],["งบประมาณ",`อนุมัติ ${evFm(F.B.ap)} · แผน ${evFm(F.B.plan)} · ใช้จริง ${evFm(F.B.act)} บาท`],["ความพร้อม",`เช็กลิสต์ ${F.chk.d}/${F.chk.n} · Action Plan ${F.A.d}/${F.A.n}${F.A.late?` (เลยกำหนด ${F.A.late})`:""}`],["ผู้ขาย",F.vend+" ราย"]];
 h=`<section class="psh day">${evPhead("รายงานสรุปหลังงาน",t)}<table class="pst"><tbody>${rows.map(([a,b])=>`<tr><td class="tm" style="width:20%">${a}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table><br>${blk("สรุปภาพรวม",r.sum)}${blk("สิ่งที่ทำได้ดี",r.good)}${blk("สิ่งที่ควรปรับปรุง",r.fix)}${blk("ข้อเสนอสำหรับครั้งต่อไป",r.next)}${evPfoot()}</section>`; evPrintHtml(h,false); }
// ---------- แท็บ Action Plan ในหน้า Project Hub + จุดเชื่อม ----------
function evHub(open){ const T=evToday(); const L=open.map(t=>({t,P:evProg(evActs(t))})), withA=L.filter(x=>x.P.n), tot=evProg(withA.flatMap(x=>evActs(x.t)));
 const late=withA.flatMap(x=>evActs(x.t).filter(a=>a.st!=="done"&&a.due&&a.due<T).map(a=>({t:x.t,a}))).sort((a,b)=>a.a.due.localeCompare(b.a.due));
 const card=({t,P})=>{ const tm=evTeams(t).map(g=>({g,p:evProg(evActs(t).filter(a=>(a.team||"")===g.id))})).filter(x=>x.p.n);
  return `<div class="card ph-c ev-hc" data-evopen="${t._id}" tabindex="0"><div class="ph-top"><div class="ph-t">${esc(t.title)}${t.ev?` <span class="ev-tag">อีเวนต์${t.ev.date?" · "+fmtDate(t.ev.date):""}</span>`:""}</div><b>${P.p}%</b></div>
<div class="ph-bar"><i style="width:${P.p}%;background:${P.late?"var(--over)":"var(--ok)"}"></i></div><div class="ph-sub">${P.d}/${P.n} งาน${P.late?` · <b style="color:var(--over)">เลยกำหนด ${P.late}</b>`:""}</div>
${tm.map(x=>`<div class="ev-mini"><span>${esc(x.g.name)}</span><div class="ph-bar sm"><i style="width:${x.p.p}%;background:${x.p.late?"var(--over)":"var(--ok)"}"></i></div><em>${x.p.d}/${x.p.n}${x.p.late?" ⚠":""}</em></div>`).join("")}</div>`; };
 return `<div class="ev-sum" style="margin-bottom:14px"><div><b>${tot.p}%</b><span>Action Plan เสร็จ (${tot.d}/${tot.n})</span></div><div><b${tot.late?` style="color:var(--over)"`:""}>${tot.late}</b><span>งานเลยกำหนด</span></div><div><b>${withA.length}/${open.length}</b><span>โปรเจคที่มี Action Plan</span></div></div>
${late.length?`<div class="card" style="margin-bottom:14px"><h2>เลยกำหนด <small>${late.length} งาน</small></h2>${late.slice(0,8).map(x=>`<div class="li" data-evopen="${x.t._id}"><div class="ic" style="background:var(--over-soft);color:var(--over)">${+x.a.due.slice(8)}<br>${MTH[+x.a.due.slice(5,7)-1]}</div><div class="tx"><div class="t1">${esc(x.a.title)}</div><div class="t2">${esc(x.t.title)} · ${esc((evTeams(x.t).find(g=>g.id===(x.a.team||""))||{}).name||"")}${x.a.owner?" · "+esc(x.a.owner):""}</div></div></div>`).join("")}${late.length>8?`<div class="td-e">…อีก ${late.length-8} งาน</div>`:""}</div>`:""}
<div class="ph-grid">${L.map(card).join("")||`<div class="card"><div class="empty">ไม่มีโปรเจคที่กำลังทำ</div></div>`}</div>
<div class="ph-hint" style="margin-top:10px">แตะโปรเจคเพื่อดู/แก้ Action Plan · โปรเจคที่ยังไม่มีงาน: เปิดแล้วเพิ่มงานรายทีม หรือกด “อีเวนต์จากเทมเพลต” ด้านบนเพื่อสร้างโครงให้</div>`; }
{ const _pv=projView; projView=function(){ const ap=PH.tab==="ap"; if(ap)PH.tab="cards"; let h; try{ h=_pv.apply(this,arguments); }finally{ if(ap)PH.tab="ap"; }
  h=h.replace(/(<button data-pht="kpim"[^>]*>[^<]*<\/button>)/,`$1<button data-pht="ap" aria-pressed="${ap}">Action Plan</button>`);
  if(ap){ h=h.replace(/(<button data-pht="cards" aria-pressed=")true/,"$1false"); const i=h.indexOf('<div class="seg ph-flt">'); if(i>=0)h=h.slice(0,i)+evHub(phList().filter(t=>t.status!==STATUS_DONE)); }
  h=h.replace('<button class="btn ghost" id="phSum">','<button class="btn ghost" id="evNew">🎪 อีเวนต์จากเทมเพลต</button><button class="btn ghost" id="phSum">'); return h; }; }
{ const _pc=phCard; phCard=function(t,r){ let h=_pc.apply(this,arguments), P=evProg(evActs(t)); if(P.n||t.ev)h=h.replace(/<\/div>\s*$/,`<div class="ev-chip" data-evopen="${t._id}">${t.ev?"🎪 ":""}Action Plan ${P.n?P.d+"/"+P.n:"—"}${P.late?` · เลย ${P.late}`:""}</div></div>`); return h; }; }
{ const _pp=phPaint; phPaint=function(){ _pp.apply(this,arguments); const f=document.querySelector("#phdlg .dlg-f"); if(f&&!f.querySelector("[data-evopen2]")){ const b=document.createElement("button"); b.type="button"; b.className="btn ghost"; b.setAttribute("data-evopen2",""); b.textContent="Action Plan / อีเวนต์"; b.onclick=ev=>{ ev.stopPropagation(); evOpen(PH.id); }; f.insertBefore(b,f.firstChild); } }; }
{ const _tv=todayView; todayView=function(){ let h=_tv.apply(this,arguments); const T=secToday(), hz=secAdd(T,TD.rng==="week"?7:0);
  const L=phList().filter(t=>t.status!==STATUS_DONE).flatMap(t=>evActs(t).filter(a=>a.st!=="done"&&a.due&&a.due<=hz).map(a=>({t,a}))).sort((x,y)=>x.a.due.localeCompare(y.a.due));
  if(!L.length)return h; const rows=L.slice(0,12).map(({t,a})=>{ const late=a.due<T; return tdRow({attr:`data-evopen="${t._id}"`,ic:tdIc(a.due),col:late?"var(--over)":"",t1:esc(a.title),t2:esc(t.title+" · "+((evTeams(t).find(g=>g.id===(a.team||""))||{}).name||"")+(a.owner?" · "+a.owner:"")),pill:late?"เลย "+Math.round((new Date(T)-new Date(a.due))/864e5)+" วัน":a.due===T?"วันนี้":"ใกล้ครบ",pc:late?"s-over":"s-run"}); }).join("");
  return h.replace(/<\/div>\s*$/,tdCard("Action Plan โปรเจค",L.length+" งาน",rows+(L.length>12?`<div class="td-e">…อีก ${L.length-12} งาน (ดูที่ Project Hub › Action Plan)</div>`:""))+"</div>"); }; }
{ const _w=wire; wire=function(){ _w.apply(this,arguments);
  document.querySelectorAll("[data-evopen]").forEach(n=>{ n.onclick=ev=>{ ev.stopPropagation(); evOpen(n.dataset.evopen); }; n.onkeydown=ev=>{ if(ev.key==="Enter"){ ev.stopPropagation(); evOpen(n.dataset.evopen); } }; });
  if(el("evNew"))el("evNew").onclick=evCreate; }; }
