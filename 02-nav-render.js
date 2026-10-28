// ---------- เตือนประจำปีของกรมพัฒนาฯ ----------
// ผลงานปี Y ต้องยื่นขอรับรอง/ขอเงินอุดหนุนภายใน 31 ส.ค. ปี Y+1 · รอบเตรียม สท.2 เริ่ม 17 พ.ย.
function dsdYearClock(){
const today=new Date(); today.setHours(0,0,0,0);
const y0=today.getFullYear();
const augThis=new Date(y0,7,31);
const perfYear=(today<=augThis)?y0-1:y0;      // ปีผลงานที่ยังยื่นได้อยู่
const due=new Date(perfYear+1,7,31);          // 31 ส.ค.
const left=Math.round((due-today)/86400000);
const prep=new Date(perfYear,10,17);          // 17 พ.ย. = เริ่มรอบเตรียม
return {today,perfYear,due,left,prep,inPrep:today>=prep};
}
const st2Done=r=>(r&&(r.st2==="ได้รับการรับรองแล้ว"));
const st2Sent=r=>(r&&(r.st2==="ยื่นแล้ว รอผลพิจารณา"||r.st2==="ได้รับการรับรองแล้ว"));
function dsdAnnualBanner(){
const C=dsdYearClock();
const cos=visible(companies).filter(c=>!isGroupCo(c));
if(!cos.length)return "";
const pendingOf=y=>cos.filter(c=>{const r=dsdRec(c.key,y); return r&&!st2Sent(r);});
const rowOf=(c,y,p,pc)=>({t1:cLabel(c.key),t2:"ผลงานปี "+(y+543)+" · สท.2: "+((dsdRec(c.key,y)||{}).st2||"ยังไม่เริ่ม"),
d:"สท.2",c:"var(--over-soft)",ic:"var(--over)",p,pc});
let out="";
// 1) ปีที่เลยเส้นตาย 31 ส.ค. ไปแล้วแต่ยังไม่ได้ยื่น
const allYears=[...new Set(Object.values(hrdata.dsd||{}).flatMap(o=>Object.keys(o||{}).map(Number)))]
.filter(y=>y&&y<C.perfYear).sort();
const lateRows=[];
allYears.forEach(y=>pendingOf(y).forEach(c=>{
const dd=Math.round((C.today-new Date(y+1,7,31))/86400000);
lateRows.push(rowOf(c,y,"เลย "+dd+" วัน","s-over"));}));
if(lateRows.length)
out+=`<div class="banner bad" ${regList("st2Late","สท.2 ที่เลยเส้นตาย 31 ส.ค. แล้ว",lateRows)}>${svg(ICON.bell,19)}
<b>มี ${lateRows.length} รายการที่เลยเส้นตาย 31 ส.ค. แล้วแต่ยังไม่ได้ยื่น สท.2</b> — ปีผลงาน ${allYears.map(y=>y+543).join(", ")} · ยื่นช้ามีสิทธิ์ถูกประเมินเงินสมทบเต็มจำนวน ตรวจด่วน</div>`;
// 2) ปีผลงานที่กำลังจะถึงเส้นตาย
const p=pendingOf(C.perfYear);
if(p.length&&C.left<=120)
out+=`<div class="banner ${C.left<=30?"bad":""}" ${regList("st2Soon","ต้องยื่น สท.2 ของผลงานปี "+(C.perfYear+543),p.map(c=>rowOf(c,C.perfYear,C.left+" วัน",C.left<=30?"s-over":"s-run")))}>${svg(ICON.clock,19)}
เหลือ <b>${C.left} วัน</b> ถึง <b>31 ส.ค. ${C.perfYear+544}</b> — เส้นตายยื่นขอรับรอง/ขอเงินอุดหนุนของผลงานปี ${C.perfYear+543} · ยังค้าง ${p.length} บริษัท</div>`;
// 3) รอบเตรียมประจำปี เริ่ม 17 พ.ย.
const y0=C.today.getFullYear();
if(C.today>=new Date(y0,10,17)&&pendingOf(y0).length)
out+=`<div class="banner">${svg(ICON.file,19)} ถึงรอบ <b>เตรียม สท.2 ของผลงานปี ${y0+543}</b> แล้ว (เริ่ม 17 พ.ย.) — รวบรวมรายชื่อผู้ผ่านการฝึก · ขอข้อมูล สปส. · กรอกในระบบออนไลน์ · ยื่นให้ทันก่อน 31 ส.ค. ${y0+544}</div>`;
return out;
}

// ขั้นตอนตามกรมพัฒนาฯ: ยื่น ยป. ก่อนฝึก → ฝึก → ยื่นรับรองรุ่น/รง.1
// เลขคำขอ ยป. — ถ้ารุ่นไม่ได้ใส่เอง ใช้ของหลักสูตร
// คำขอ ยป. ของหลักสูตร แยกรายปี — ทุกปีต้องยื่นเปิดหลักสูตรใหม่ เลขจึงไม่ซ้ำกัน
const crsYear=t=>{const d=t.date||t.dsdEnd; return d?new Date(d).getFullYear():(typeof R!=="undefined"?R.year:THISYEAR);};
const crsFiling=(code,y)=>(((crsOf(code)||{}).filings)||{})[y]||{};
const ypNoOf=t=>(t.dsdOpenNo||"").trim()||(crsFiling(crsCodeOf(t),crsYear(t)).openNo||"").trim();
const ypDateOf=t=>t.dsdOpenDate||crsFiling(crsCodeOf(t),crsYear(t)).openDate||null;
const ypKind=t=>t.yp||crsFiling(crsCodeOf(t),crsYear(t)).yp||((crsOf(crsCodeOf(t))||{}).yp||"");
function ypState(t){
const today=new Date(); today.setHours(0,0,0,0);
const lead=ypLead(ypKind(t));
const start=t.date?new Date(t.date):null;
const end=t.dsdEnd?new Date(t.dsdEnd):start;
// 1) ยังไม่ยื่นเปิดหลักสูตร
if(!ypNoOf(t)&&!ypDateOf(t)){
if(!start)return {step:"ยังไม่กำหนดวันฝึก",cls:"s-wait",n:null};
const due=dAdd(t.date,-lead), n=dDiff(due,today);
return {step:(ypKind(t)||"ยป.")+" · ต้องยื่นก่อนฝึก "+lead+" วัน",cls:n<0?"s-over":n<=7?"s-run":"s-wait",n,due,
msg:n<0?"เลยกำหนดยื่นก่อนฝึกแล้ว "+(-n)+" วัน":"ต้องยื่น ยป. ภายใน "+n+" วัน"};}
// 2) ยื่นเปิดแล้ว แต่ยังไม่ได้เลขคำขอรับรองรุ่น
if(!t.dsdCertNo){
let due=null,note="";
if(t.dsdCertDate){ due=dAdd(t.dsdCertDate,30); note="นับ 30 วันจากวันที่ยื่นรับรองรุ่น"; }
else if(end){ const d60=dAdd(end.toISOString().slice(0,10),60);
const cap=new Date(end.getFullYear()+1,0,15); due=d60<cap?d60:cap; note="รง.1 ภายใน 60 วันหลังฝึกเสร็จ แต่ไม่เกิน 15 ม.ค."; }
if(!due)return {step:"รอฝึก / รอยื่นรับรองรุ่น",cls:"s-wait",n:null};
const n=dDiff(due,today);
return {step:"ต้องยื่นรับรองรุ่น / รง.1",cls:n<0?"s-over":n<=14?"s-run":"s-mid",n,due,note,
msg:n<0?"เลยกำหนดยื่นรับรองรุ่นแล้ว "+(-n)+" วัน — ยื่นย้อนหลังไม่ได้":"เหลือ "+n+" วันต้องยื่นรับรองรุ่น"};}
return {step:"ยื่นครบขั้นตอนแล้ว",cls:"s-done",n:null};
}
const st2Cls=x=>x==="ได้รับการรับรองแล้ว"?"s-done":x==="ไม่ผ่าน / ต้องแก้ไข"?"s-cancel":x==="ยื่นแล้ว รอผลพิจารณา"?"s-mid":(!x||x==="ยังไม่เริ่ม")?"s-wait":"s-run";
const YP=[["","— ไม่ระบุ —"],["ยป.1","ยป.1 · หลักสูตรใหม่ ยื่นครั้งแรก (ก่อนฝึก 30 วัน)"],["ยป.2","ยป.2 · e-learning ของบริษัท (ก่อนฝึก 30 วัน)"],["ยป.3","ยป.3 · ส่งลูกจ้างไปฝึกภายนอก (ก่อนฝึก 15 วัน)"],["ยป.4","ยป.4 · หลักสูตรเดิม/ของกรมฯ (ก่อนฝึก 30 วัน)"]];
const ypLead=y=>y==="ยป.3"?15:30;
const dAdd=(iso,n)=>{const d=new Date(iso); d.setDate(d.getDate()+n); return d;};
const dDiff=(a,b)=>Math.round((a-b)/86400000);
const ST2=["ยังไม่เริ่ม","รวบรวมรายชื่อผู้ผ่านการฝึก","ขอข้อมูล สปส. จากประกันสังคม","กรอก/อัปโหลดในระบบออนไลน์","ยื่นแล้ว รอผลพิจารณา","ได้รับการรับรองแล้ว","ไม่ผ่าน / ต้องแก้ไข"];
const subPct=()=>+((hrdata.subsidy||{}).pct)||70;
const subRate=()=>+((hrdata.subsidy||{}).rate)||200;
const STD_RATE=1000, STD_CAP=100000, FUND_PCT=10;
function subsidyOf(k,r){
const base=k.avg*subPct()/100;
const excess=Math.max(0,Math.floor(k.C-base));
const amount=excess*subRate();
const stdN=0;
const stdAmt=Math.min(stdN*STD_RATE,STD_CAP);
const fundPaid=+((r||{}).fundPaid)||0;
const fundAmt=Math.round(fundPaid*FUND_PCT/100);
return {base:Math.round(base*100)/100,excess,amount,
stdN,stdAmt,fundPaid,fundAmt,total:amount+stdAmt+fundAmt,
nextPerson:k.avg?Math.max(0,Math.ceil(base+1)-k.C):0};
}
const goalOf=r=>{const g=+((r||{}).goal); return (g&&g>=LAWPCT&&g<=100)?g:LAWPCT;};
function dsdCalc(r){
const ms=(r&&r.months)||[];
const vals=ms.map(v=>+v||0).filter(v=>v>0);
const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*100)/100:0;
const target=Math.ceil(avg*LAWPCT/100);
const goal=goalOf(r);
const goalTarget=Math.ceil(avg*goal/100);
const A=+((r||{}).sent)||0, B=+((r||{}).repeatTimes)||0;
const C=Math.max(0,A-B);
const pct=avg?Math.round(C/avg*10000)/100:0;
const need=Math.max(0,target-C);
const needGoal=Math.max(0,goalTarget-C);
const o={avg,target,goal,goalTarget,A,B,C,pct,need,needGoal,months:vals.length};
return Object.assign(o,{sub:subsidyOf(o,r)});
}
const trainRows=(c,y)=>items.filter(t=>isTrain(t)&&(t.company||"")===c&&t.status==="เสร็จสิ้น"
&&(()=>{const d=dueDate(t);return d?d.getFullYear()===y:false;})());
const trainedPax=(c,y)=>trainRows(c,y).reduce((n,t)=>n+(+t.pax||0),0);
// เฉพาะรุ่นที่ยื่นกรมฯ และได้รับอนุมัติ — ตัวนี้คือตัวที่นับเข้าเกณฑ์ได้จริง
const trainedPaxDsd=(c,y)=>trainRows(c,y).filter(t=>t.dsd==="อนุมัติแล้ว"||t.dsdCertNo).reduce((n,t)=>n+(+t.pax||0),0);
const saveMeta=async(k,list)=>{ if(!DB)return; try{ await DB.doc("meta/"+k).set({list}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); } };
// ---------- ถังขยะ: ลบแล้วกู้คืนได้ 30 วัน ----------
const TRKIND={items:"งาน",ledger:"รายการเงิน",legal:"กฎหมาย/ใบรับรอง",index:"Index Online",note:"บันทึก"};
const trashAll=()=>Object.entries(TRASH).flatMap(([k,a])=>a.map(t=>({coll:k,t})));
const trashDays=t=>Math.floor((Date.now()-new Date(t._trash||Date.now()))/86400000);
const trashLeft=t=>Math.max(0,TRASH_DAYS-trashDays(t));
const trashTitle=(k,t)=>k==="ledger"?((t.note||t.title||"รายการเงิน")+(t.amount?" · "+baht(t.amount)+" ฿":"")):(t.title||"(ไม่มีชื่อ)");
async function softDel(coll,row){
if(!DB)throw new Error("ยังไม่ได้เชื่อมต่อฐานข้อมูล");
const d=Object.assign({},row); delete d._id;
d._trash=new Date().toISOString();
await DB.collection(coll).doc(row._id).set(d);
setFoot("ย้ายไปถังขยะแล้ว · กู้คืนได้ใน "+TRASH_DAYS+" วัน (ตั้งค่า › ถังขยะ)");
}
async function trashRestore(coll,row){
const d=Object.assign({},row); delete d._id; delete d._trash;
await DB.collection(coll).doc(row._id).set(d);
setFoot("กู้คืนแล้ว");
}
async function trashPurge(coll,id){ await DB.collection(coll).doc(id).delete(); }
let purgeRan=false;
async function autoPurgeTrash(){
if(purgeRan||!DB)return; purgeRan=true;
const old=trashAll().filter(({t})=>trashDays(t)>=TRASH_DAYS);
for(const {coll,t} of old){ try{ await trashPurge(coll,t._id); }catch(e){} }
if(old.length)setFoot("ล้างถังขยะที่เกิน "+TRASH_DAYS+" วันแล้ว "+old.length+" รายการ");
}
async function saveItem(data,id){ if(!DB)throw new Error("ยังไม่ได้เชื่อมต่อฐานข้อมูล"); if(data&&"_id" in data)delete data._id; return id?await DB.collection("items").doc(id).set(data):await DB.collection("items").add(data); }
async function hardRefresh(){
setFoot("กำลังรีเฟรช…");
try{ if(window.caches){ const ks=await caches.keys(); await Promise.all(ks.filter(k=>/skywork/i.test(k)).map(k=>caches.delete(k))); } }catch(e){}
try{ if(navigator.serviceWorker){ const rs=await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r=>r.update().catch(()=>{}))); } }catch(e){}
const u=new URL(location.href); u.searchParams.set("r",Date.now()); location.replace(u.toString());
}
const ZOOMS=[["85","เล็ก"],["90","กลาง (แนะนำ)"],["100","ปกติ"]];
const curZoom=()=>{try{return localStorage.getItem("sw-zoom")||"90";}catch(e){return "90";}};
function setZoom(v){ try{localStorage.setItem("sw-zoom",v);}catch(e){} const z=(+v||90)/100, r=document.documentElement; r.style.zoom=z; r.style.setProperty("--zf",z); }
const HLS=[["p","พาสเทล (ตามแบบอ้างอิง)","พื้นครีม การ์ดสีพาสเทลแยกตามหมวด ปุ่ม/เมนูที่เลือกเป็นสีดำมน ใช้ได้เฉพาะโหมดสว่าง"],["b","เรียบ มินิมอล","สีทึบเดียว ไม่มีไล่เฉด ไม่มีเงา"],["c","ขาว + ขอบบาง","การ์ดสีขาว ตัวเลขสีธีม ปุ่มพื้นอ่อน"],["a","แบบเดิม","ไล่เฉดเข้ม มีเงา"]];
const curHL=()=>{try{return localStorage.getItem("sw-hl")||"p";}catch(e){return "p";}};
function setHL(v){ try{localStorage.setItem("sw-hl",v);}catch(e){} document.documentElement.setAttribute("data-hl",v); applyTheme(); }
function setTb(hide){ document.documentElement.classList.toggle("tbh",!!hide); try{localStorage.setItem("sw-tbh",hide?"1":"0");}catch(e){} }
function renderNav(){
const bs=el("brandsub"); if(bs)bs.textContent="เวอร์ชัน "+APP_VERSION;
el("nav").innerHTML=VIEWS.map(([k,l])=>`<button data-v="${k}" aria-current="${k===view}">${svg(ICON[k==="cal"?"cal":k])}<span>${l}</span></button>`).join("");
el("tabbar").innerHTML=TABS.map(k=>{const l=TABLABEL[k]||VIEWS.find(v=>v[0]===k)[1];
return `<button data-v="${k}" aria-current="${k===view}" title="${esc(VIEWS.find(v=>v[0]===k)[1])}">${svg(ICON[k],19)}<span>${l}</span></button>`;}).join("")
+`<button class="tbhide" id="tbtoggle" title="ซ่อนแถบเมนู" aria-label="ซ่อนแถบเมนู">${svg('<path d="M15 6l-6 6 6 6"/>',16)}</button>`;
const go=e=>{const b=e.target.closest("button");if(!b)return; if(b.id==="tbtoggle"){setTb(true);return;} if(!b.dataset.v)return; view=b.dataset.v;R.pq="";renderNav();render();window.scrollTo(0,0);};
el("nav").onclick=go; el("tabbar").onclick=go;
if(el("tbshow"))el("tbshow").onclick=()=>setTb(false);
const fb=el("aifab"); if(fb){ if(!fb.innerHTML)fb.innerHTML=svg(ICON.ai,24); fb.hidden=(view==="ai"); aiPopRender(); if(!fb._w){fb._w=1; fb.onclick=aiPopToggle;} }
["brandBtn","brandBtnM"].forEach(id=>{const n=el(id); if(!n||n._wired)return; n._wired=1;
n.onclick=hardRefresh;
n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();hardRefresh();}};});
}
let LISTBOX={};
function regList(key,title,rows){ LISTBOX[key]={title,rows}; return `data-list="${esc(key)}"`; }
function openListBox(key){
const L=LISTBOX[key]; if(!L||!L.rows.length)return;
el("pdlgh").textContent=L.title;
const clk=r=>!!(r.id||r.tx||r.lg);
const anyClk=L.rows.some(clk);
let seenClk=false, seenStatic=false;
el("pdlgb").innerHTML=`<div class="list">${L.rows.map((r,i)=>{
let pre="";
if(clk(r)&&!seenClk){ seenClk=true; if(seenStatic)pre=`<div class="lsec">งาน / รายการที่นับรวมในหมวดนี้ · แตะเพื่อเปิดดูการ์ด</div>`; }
if(!clk(r)){ seenStatic=true; }
return pre+`<div class="li${clk(r)?"":" static"}"${clk(r)?` data-pick="${i}"`:""}>
<div class="ic" style="background:${r.c||"var(--line-2)"};color:${r.ic||"var(--ink-2)"}">${r.d||"—"}</div>
<div class="tx"><div class="t1">${esc(r.t1)}</div><div class="t2">${esc(r.t2||"")}</div></div>
<span class="pill ${r.pc||"s-wait"}">${esc(r.p||"แก้ไข")}</span>${clk(r)?`<span class="lchev">›</span>`:""}</div>`;}).join("")}</div>
${anyClk&&!seenStatic?`<div class="hint">แตะรายการเพื่อเปิดดู</div>`:""}`;
el("pdlgb").querySelectorAll("[data-pick]").forEach(n=>n.onclick=()=>{
const r=L.rows[+n.dataset.pick]; el("pdlg").close();
if(r.id){const t=items.find(x=>x._id===r.id); if(t)openCard(t);}
else if(r.tx){const x=ledger.find(v=>v._id===r.tx); if(x)openTxCard(x);}
else if(r.lg){const g=legal.find(x=>x._id===r.lg); if(g)openLegalCard(g);}
});
el("pdlg").showModal();
}
function goTo(v,f){
Object.assign(F,{q:"",track:"",type:"",status:"",company:""},f&&f.F||{});
if(f&&f.R)Object.assign(R,f.R);
view=v; renderNav(); render(); window.scrollTo({top:0,behavior:"smooth"});
}
const jump=(v,payload)=>`data-go="${esc(JSON.stringify({v,...payload||{}}))}"`;
function render(){
if(typeof ink!=="undefined"&&ink.note&&document.body.classList.contains("ink-on")){ return; }       // กำลังเขียนสมุด: ไม่วาดหน้าแอปข้างหลังซ้ำ (จะวาดใหม่ตอนปิดสมุด)
LISTBOX={};
if(LOADING){ el("view").innerHTML=`<div class="head"><div><h1>กำลังโหลดข้อมูล…</h1><div class="sub">กำลังดึงข้อมูลล่าสุดจากระบบ · ${syncChip()}</div></div></div>
<div class="dash"><div class="card hero span2 sk" style="height:150px"></div><div class="card stat sk" style="height:150px"></div><div class="card stat sk" style="height:150px"></div>
<div class="card span4 sk" style="height:220px"></div></div>`; paintSync(); return; }
el("view").innerHTML={home,all,matrix:matrixView,gaps:gapsView,meet,train,dsd:dsdView,legal:legalView,idx:idxView,note:noteView,cal:calView,budget,exec:execView,ai:aiView,pipeline,set:setView}[view]();
paintSync(); wire(); if(AI.open)aiPopRender(); pushPlanKick();
}
function header(title,sub,btn=true){
const lab=(view==="train"||view==="dsd")?"เพิ่มหลักสูตร":view==="meet"?"เพิ่มการประชุม":"เพิ่มงาน";
return `<div class="head"><div><h1>${title}</h1><div class="sub">${sub} · ${syncChip()}</div></div>
${btn?`<button class="btn addbtn" id="add">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>${lab}</span></button>`:""}</div>`;
}
// occD = วันที่ที่กำลังดูอยู่ (เช่นกดวันในปฏิทิน) → งานซ้ำจะแสดงสถานะของ "วันนั้น" ไม่ใช่สถานะรวม
function liRow(t,showDate,occD){
const ms=monthsOf(t), d=t.date?fmtDate(t.date).split(" "):null;
const OC=(occD&&rr(t))?occD:null, ost=OC?occStat(t,OC):null;
return `<div class="li" data-id="${t._id}"${OC?` data-occ="${isoOf(OC)}"`:""}>
<div class="ic" style="background:var(--line-2);color:${OC?occColor(t,OC):sColor(t.status)}">${(()=>{const n=OC?OC:(rr(t)?dueDate(t):null);
if(n)return n.getDate()+"<br>"+MTH[n.getMonth()];
return d?`${d[0]}<br>${d[1]}`:(ms.length>1?"ประจำ":"—");})()}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${(()=>{const cc=crsCodeOf(t);return cc?`<b style="font-family:var(--mono);color:var(--accent)">${esc(cc)}</b>${t.batch?" "+esc(t.batch):""} · `:"";})()}${quadOf(t)?`<b class="qtag q-${quadOf(t)}">${quadOf(t).slice(1)} ${esc(quadInfo(quadOf(t))[1])}</b> `:""}${t.tag?`<b style="color:${tagColor(t.tag)||itemColor(t)}">● ${esc(t.tag)}</b> · `:""}${rruleText(t)?esc(rruleText(t))+" · ":""}<span class="gdot" style="background:${gTagColor(t.track)}"></span>${esc(gLabel(t.track))}${t.company?" · "+esc(cLabel(t.company)):""}${t.owner?" · "+esc(t.owner):""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
${OC?(()=>{const od=OC<new Date(new Date().setHours(0,0,0,0))&&isOpenStatus(ost);
return `<span class="pill ${od?"s-over":sCls(ost)}">${esc(od?"ค้างรอบนี้":ost)}</span>`+(ost===STATUS_CANCEL?"":`<button class="okbtn${ost===STATUS_DONE?" on":""}" data-done="${t._id}|${isoOf(OC)}" title="${ost===STATUS_DONE?"ยกเลิกการปิดรอบ ":"ปิดรอบวันที่ "}${OC.getDate()} ${MTH[OC.getMonth()]}">${svg(ICON.check,15)}</button>`);})():(()=>{const S=occState(t);
return `<span class="pill ${S.cls}">${esc(S.label)}</span>`+
(S.recur&&S.d&&daysTo(S.d)<=0?`<button class="okbtn" data-done="${t._id}|${isoOf(S.d)}" title="ปิดรอบวันที่ ${S.d.getDate()} ${MTH[S.d.getMonth()]}">${svg(ICON.check,15)}</button>`:"");})()}</div>`;
}
function prepDue(days){
days=days||7;
return items.filter(t=>isMeet(t)&&isOpenStatus(t.status)&&+t.prepDays>0)
.map(t=>({t,p:prepDate(t),d:dueDate(t)}))
.filter(x=>x.p&&x.d&&daysTo(x.d)>=0&&daysTo(x.p)<=days)
.sort((a,b)=>a.p-b.p);
}
function dueSoon(days){
days=days||7;
const late=[], soon=[];
items.forEach(t=>{ if(!isOpenStatus(t.status))return;
const d=dueDate(t); if(!d)return; const n=daysTo(d);
if(n<0)late.push(t); else if(n>=0&&n<=days)soon.push(t); });
const by=(a,b)=>dueDate(a)-dueDate(b);
return {late:late.sort(by),soon:soon.sort(by)};
}
function icsText(){
const pad=n=>String(n).padStart(2,"0");
const stamp=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
const esc2=v=>String(v||"").replace(/[\\;,]/g,m=>"\\"+m).replace(/\n/g," ");
const out=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Sky Work//TH","CALSCALE:GREGORIAN","X-WR-CALNAME:Sky Work"];
const now=new Date(), seen=new Set();
items.forEach(t=>{
const ds=[];
if(rr(t)){ for(let k=0;k<14;k++){ const m=new Date(R.year,new Date().getMonth()+k,1);
occDays(t,m.getFullYear(),m.getMonth()).forEach(d=>ds.push(new Date(m.getFullYear(),m.getMonth(),d))); } }
else if(t.date)ds.push(new Date(t.date));
ds.slice(0,60).forEach(d=>{
const uidv=(t._id+"-"+stamp(d)); if(seen.has(uidv))return; seen.add(uidv);
const end=new Date(d.getTime()+864e5);
const tm=hhmm(t.time);
const dt=tm?("DTSTART:"+stamp(d)+"T"+tm.replace(":","")+"00\r\nDTEND:"+stamp(d)+"T"+pad((+tm.slice(0,2)+1)%24)+tm.slice(3)+"00")
:("DTSTART;VALUE=DATE:"+stamp(d)+"\r\nDTEND;VALUE=DATE:"+stamp(end));
if(+t.prepDays>0){ const pd=new Date(d); pd.setDate(pd.getDate()-(+t.prepDays));
out.push("BEGIN:VEVENT","UID:"+uidv+"-prep@skywork","DTSTAMP:"+stamp(now)+"T090000Z",
"DTSTART;VALUE=DATE:"+stamp(pd),"DTEND;VALUE=DATE:"+stamp(new Date(pd.getTime()+864e5)),
"SUMMARY:"+esc2("[เตรียมข้อมูล] "+t.title),
"DESCRIPTION:"+esc2((t.prepNote||"เตรียมข้อมูลก่อนประชุม")+" · ประชุม "+stamp(d)),
"BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY","DESCRIPTION:"+esc2("เตรียมข้อมูล "+t.title),"END:VALARM","END:VEVENT"); }
out.push("BEGIN:VEVENT","UID:"+uidv+"@skywork","DTSTAMP:"+stamp(now)+"T090000Z",dt,
"SUMMARY:"+esc2((isTrain(t)?"[อบรม] ":isMeet(t)?"[ประชุม] ":"")+t.title),
"DESCRIPTION:"+esc2([gLabel(t.track),t.place,t.attendees,t.company?cLabel(t.company):"",t.owner,t.note].filter(Boolean).join(" · ")),
"BEGIN:VALARM","TRIGGER:-P2D","ACTION:DISPLAY","DESCRIPTION:"+esc2(t.title),"END:VALARM","END:VEVENT");
});});
legal.forEach(L=>{const d=legalDue(L); if(!d)return;
out.push("BEGIN:VEVENT","UID:lg-"+L._id+"@skywork","DTSTAMP:"+stamp(now)+"T090000Z",
"DTSTART;VALUE=DATE:"+stamp(d),"DTEND;VALUE=DATE:"+stamp(new Date(d.getTime()+864e5)),
"SUMMARY:"+esc2("[ครบกำหนด] "+L.title),
"DESCRIPTION:"+esc2([L.unit,L.person,(L.comps||[]).map(cLabel).join(", "),L.note].filter(Boolean).join(" · ")),
"BEGIN:VALARM","TRIGGER:-P30D","ACTION:DISPLAY","DESCRIPTION:"+esc2("ใกล้ครบกำหนด "+L.title),"END:VALARM","END:VEVENT");});
out.push("END:VCALENDAR");
return out.join("\r\n");
}
function downloadICS(){
const a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([icsText()],{type:"text/calendar;charset=utf-8"}));
a.download="sky-work.ics"; document.body.appendChild(a); a.click();
setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
}
async function notifyToday(force){
if(!("Notification" in window))return false;
if(Notification.permission!=="granted"){ if(!force)return false;
const p=await Notification.requestPermission(); if(p!=="granted")return false; }
const key="sw-notified-"+new Date().toDateString();
if(!force){ try{ if(localStorage.getItem(key))return true; }catch(e){} }
const w=dueSoon(2), pr=prepDue(2);
const n=w.late.length+w.soon.length+pr.length;
if(n)new Notification("Sky Work",{body:[w.late.length?`เลยกำหนด ${w.late.length} งาน`:"",w.soon.length?`ครบกำหนดใน 2 วัน ${w.soon.length} งาน`:"",pr.length?`ต้องเตรียมข้อมูลประชุม ${pr.length} รายการ`:""].filter(Boolean).join(" · "),icon:"icon-192.png"});
else if(force)new Notification("Sky Work",{body:"ไม่มีงานที่ครบกำหนดใน 2 วันนี้ 🎉",icon:"icon-192.png"});
try{localStorage.setItem(key,"1");}catch(e){}
return true;
}
