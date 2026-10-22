async function setTheme(t){
t.mode=t.mode||theme.mode||"auto"; theme=t; applyTheme._last=isNight(); applyTheme(); render();
try{localStorage.setItem("hr-theme",JSON.stringify(t));}catch(e){}
if(DB) await DB.doc("meta/theme").set({preset:t.preset,custom:t.custom||null,mode:t.mode||"auto"});
}
function syncCrsName(){
const v=el("f-course").value, linked=!!crsOf(v);
const w=el("f-title").closest(".f");
if(w)w.hidden=linked&&!el("wrap-course").hidden;
const lb=el("lbl-title");
if(lb)lb.textContent=(v==="__newcrs__")?"ชื่อหลักสูตรใหม่":(formCtx==="train"?"ชื่อหลักสูตร":"ชื่องาน");
if(v==="__newcrs__"&&el("f-title"))setTimeout(()=>el("f-title").focus(),60);
}
function paintCrsHint(){
const code=el("f-course").value, c=crsOf(code);
if(code==="__newcrs__"){el("f-crshint").innerHTML="พิมพ์ชื่อหลักสูตรในช่องด้านล่าง — ระบบจะรันรหัสให้อัตโนมัติตอนกดบันทึก และเพิ่มเข้าทะเบียนให้เอง";return;}
if(!c){el("f-crshint").innerHTML="เลือกหลักสูตรจากทะเบียนเพื่อให้ระบบนับ “หลักสูตร” ไม่ซ้ำ แล้วใส่แค่รุ่นที่ · จัดการทะเบียนที่ ตั้งค่า → หลักสูตรอบรม";return;}
const bs=crsBatches(c.code).filter(x=>x._id!==(editing&&editing._id));
el("f-crshint").innerHTML=`รหัส <b>${esc(c.code)}</b> · หลักสูตรนี้มีอยู่แล้ว <b>${bs.length}</b> รุ่น`
+(bs.length?" ("+bs.map(x=>esc(x.batch||"ไม่ระบุรุ่น")).slice(0,6).join(", ")+")":"")
+(c.hours?` · ชั่วโมงมาตรฐาน ${c.hours} ชม.`:"");
}
function paintTagOpts(cur){
const tr=el("f-track")?el("f-track").value:"";
const list=tagsFor(tr);
if(cur&&!list.includes(cur))list.unshift(cur);
fill("f-tag",[["","— ไม่มีป้าย —"],...list.map(x=>[x,x])],cur||"");
}
function paintTypeOpts(cur){
const tr=el("f-track")?el("f-track").value:"";
const list=typesFor(tr);
if(cur&&!list.includes(cur))list.unshift(cur);
fill("f-type",[["","— ไม่ระบุ —"],...list.map(x=>[x,x])],cur||"");
}
function fill(sel,arr,val){el(sel).innerHTML=arr.map(([v,l])=>`<option value="${esc(v)}"${v===val?" selected":""}${/^__hd__/.test(v)?" disabled":""}>${esc(l)}</option>`).join("");}
function syncStatusLabel(){
const lb=el("lbl-status"); if(!lb)return;
const on=el("f-freq")&&el("f-freq").value!=="none";
lb.innerHTML=on?'สถานะรวมของรายการ <span style="font-weight:400">— รอบแต่ละครั้งติ๊กที่ “ปิดงานรายรอบ” ด้านล่าง</span>':"สถานะ";
}
function syncFreq(){
const f=el("f-freq").value;
el("wrap-wd").hidden=!(f==="week"||f==="monthnth");
el("wrap-nth").hidden=(f!=="monthnth");
el("wrap-md").hidden=(f!=="monthday");
el("wrap-recur").hidden=(f!=="none");
el("wrap-until").hidden=(f==="none");
const dl=el("f-date").parentElement.querySelector("label");
if(dl)dl.textContent=(f==="none")?"วันที่":"วันที่เริ่มต้น";
}
let formCtx="", formKind="", msDraft=[], apDraft=[];
const KINDG={train:/อบรม|training/i,meet:/ประชุม|meeting/i,proj:/โปรเจค|โครงการ|project/i,act:/กิจกรรม|event/i};
const kindGroup=k=>(visible(groups).find(g=>KINDG[k]&&KINDG[k].test(g.label))||{}).key||"";
const kindOfItem=t=>{
if(!t)return "";
if(t.kind)return t.kind;
if(isTrain(t))return "train"; if(isMeet(t))return "meet";
const s2=(t.type||"")+" "+gLabel(t.track);
if(KINDG.proj.test(s2))return "proj"; if(KINDG.act.test(s2))return "act";
return "";};
const QUADS=[["q1","ทำเลย","สำคัญ · เร่งด่วน","#F8D7DC","ทำเองทันที — ตั้ง Deadline ภายใน 1–2 วัน"],
["q2","วางแผน","สำคัญ · ไม่เร่งด่วน","#D6E6F5","กำหนดช่วงเวลาไว้ล่วงหน้า ก่อนจะลุกลามเป็นงานด่วน"],
["q3","มอบหมาย","ไม่สำคัญ · เร่งด่วน","#FBE8BC","ส่งต่อให้คนอื่น — ใส่ผู้รับผิดชอบ แล้วติดตามตาม Deadline"],
["q4","ไว้ทีหลัง","ไม่สำคัญ · ไม่เร่งด่วน","#E7E5DE","ทำเมื่อว่าง หรือพิจารณาตัดทิ้ง"]];
const quadOf=t=>QUADS.some(q=>q[0]===(t&&t.quad))?t.quad:"";
const quadInfo=k=>QUADS.find(q=>q[0]===k);
let genMode=false, curQuad="", backable=false;
const KINDLAB={train:"หลักสูตรอบรม",meet:"การประชุม",proj:"โปรเจค",act:"กิจกรรม",task:"งาน"};
function openPick(){
["meet","train","proj","act","task","note"].forEach(k=>{const n=el("pi-"+k);
if(n)n.innerHTML=svg({meet:ICON.meet,train:ICON.train,proj:ICON.budget,act:ICON.cal,task:ICON.all,note:ICON.note}[k]||ICON.all,17);});
paintTpl(); el("pickdlg").showModal();}
function pickKind(k){
el("pickdlg").close();
if(k==="note"){ openNote(null); return; }
formKind=k; open_(null,k,true);}
// เช็กลิสต์ย่อย (ขั้นตอนโปรเจค / ของที่ต้องเตรียม)
const chkList=a=>(Array.isArray(a)?a:[]).map(x=>typeof x==="string"?{t:x,d:false}:{t:(x&&x.t)||"",d:!!(x&&x.d)}).filter(x=>x.t);
function paintChk(which){
const arr=which==="ms"?msDraft:apDraft, box=el(which==="ms"?"ms-list":"ap-list"); if(!box)return;
box.innerHTML=arr.length?arr.map((x,i)=>`<label class="chkrow${x.d?" on":""}">
<input type="checkbox" data-chk="${which}:${i}"${x.d?" checked":""}><span>${esc(x.t)}</span>
<button type="button" data-chkdel="${which}:${i}" title="ลบข้อนี้">×</button></label>`).join("")
:`<div class="hint" style="margin:0">ยังไม่มีรายการ — พิมพ์ด้านล่างแล้วกดเพิ่ม</div>`;
box.querySelectorAll("[data-chk]").forEach(n=>n.onchange=()=>{
const [w,i]=n.dataset.chk.split(":"); const a=w==="ms"?msDraft:apDraft;
a[+i].d=n.checked; paintChk(w); if(w==="ms")syncProg();});
box.querySelectorAll("[data-chkdel]").forEach(n=>n.onclick=()=>{
const [w,i]=n.dataset.chkdel.split(":"); const a=w==="ms"?msDraft:apDraft;
a.splice(+i,1); paintChk(w); if(w==="ms")syncProg();});}
function syncProg(){
const n=msDraft.length, d=msDraft.filter(x=>x.d).length;
if(n){ el("f-prog").value=Math.round(d/n*100); }
const v=Math.max(0,Math.min(100,+el("f-prog").value||0));
if(el("f-progbar"))el("f-progbar").style.width=v+"%";}
function syncAper(){
const b=(+el("f-b1").value||0)+(+el("f-b2").value||0), real=+el("f-apaxreal").value||0, plan=+el("f-apax").value||0;
const n=real||plan, box=el("f-aper"); if(!box)return;
box.textContent=(b&&n)?baht(Math.round(b/n))+" ฿ / คน"+(real?" (จากคนจริง)":" (จากเป้าหมาย)"):"—";}
function syncKind(){
const k=formKind||kindOfItem(editing)||(()=>{const s2=(el("f-type").value||"")+" "+((groups.find(x=>x.key===el("f-track").value)||{}).label||"");
return KINDG.proj.test(s2)?"proj":KINDG.act.test(s2)?"act":"";})();
const on=(ids,show)=>ids.forEach(id=>{const n=el(id); if(n)n.hidden=!show;});
on(["wrap-proj","wrap-proj1","wrap-proj2","wrap-proj3","wrap-proj4","wrap-proj5","wrap-proj6","wrap-ms"],k==="proj");
on(["wrap-act","wrap-act1","wrap-act2","wrap-act3","wrap-act4","wrap-act5","wrap-act6","wrap-act7","wrap-aprep"],k==="act");
el("sec-proj").hidden=k!=="proj"; el("sec-act").hidden=k!=="act";
if(k==="proj")syncProg(); if(k==="act")syncAper();}
function open_(t,kind,fromPick){
backable=!!fromPick&&!t;
const preDate=(!t&&view==="cal"&&R.selDay)?`${R.year}-${String(R.month+1).padStart(2,"0")}-${String(R.selDay).padStart(2,"0")}`:"";
editing=t;
formKind = kind || kindOfItem(t) || "";
formCtx = (formKind==="train"||formKind==="meet") ? formKind
: (t ? (isTrain(t)?"train":isMeet(t)?"meet":"") : ((view==="train"||view==="dsd")?"train":view==="meet"?"meet":""));
genMode=formKind==="task";
if(genMode)formCtx="";
if(!formKind&&formCtx)formKind=formCtx;
el("dlgh").textContent=(t?"แก้ไข":"เพิ่ม")+(KINDLAB[formKind]||(t?"งาน":"งานใหม่"));
el("lbl-title").textContent=formCtx==="train"?"ชื่อหลักสูตร":"ชื่องาน";
el("lbl-code").textContent=formCtx==="train"?"รหัสหลักสูตร":"รหัสอ้างอิง (ไม่บังคับ)";
el("f-code").placeholder=formCtx==="train"?"เช่น TRN-2026-014":"เช่น 1.0 หรือเลขที่เอกสาร";
el("wrap-flags").hidden=!!formCtx;
el("del").style.display=t?"":"none";
fill("f-company",[["","— ไม่ระบุ —"],...visible(companies).map(c=>[c.key,c.label])],t?.company||"");
fill("f-track",visible(groups).map(g=>[g.key,g.label]),t?.track||
(genMode?((visible(groups).find(g=>!/อบรม|training|ประชุม|meeting|โปรเจค|โครงการ|project|กิจกรรม|event/i.test(g.label))||{}).key||""):(formKind?kindGroup(formKind):""))||
(formCtx==="train"?kindGroup("train"):formCtx==="meet"?kindGroup("meet"):"")||groups[0]?.key);
fill("f-status",STATUS.map(x=>[x,x]),t?.status||"รอดำเนินการ");
const glopts=[["","— ไม่ผูกหมวด —"],...visible(gls).map(g=>[g.key,glLabel(g.key)])];
fill("f-gl1",glopts,glKeyOf(t?.gl1)); fill("f-gl2",glopts,glKeyOf(t?.gl2));
paintTypeOpts(t?.type||(formCtx==="train"?"อบรม":formCtx==="meet"?"ประชุม":""));

el("f-title").value=t?.title||""; el("f-owner").value=t?.owner||"";
el("f-date").value=t?.date||preDate||""; el("f-recur").value=t?.recurring||"";
const RU=(t&&t.rrule)||{freq:"none",weekdays:[],nth:[1],monthday:""};
fill("f-freq",FREQ,RU.freq||"none");
el("f-wd").innerHTML=DOW.map((d,i)=>`<label><input type="checkbox" class="wd" value="${i}"${(RU.weekdays||[]).includes(i)?" checked":""}>${d}.</label>`).join("");
el("f-nth").innerHTML=NTH.map(([v,l])=>`<label><input type="checkbox" class="nth" value="${v}"${(RU.nth||[]).includes(v)?" checked":""}>${l}</label>`).join("");
el("f-md").value=RU.monthday||""; el("f-until").value=RU.until||"";
syncFreq();
el("f-meet").checked=genMode?false:(formCtx?formCtx==="meet":isMeet(t||{}));
el("f-time").value=t?.time||""; el("f-place").value=t?.place||"";
el("f-att").value=t?.attendees||""; el("f-prepd").value=t?.prepDays||"";
el("f-prepn").value=t?.prepNote||"";
syncMeet();
el("f-train").checked=genMode?false:(formCtx?formCtx==="train":isTrain(t||{}));
el("f-tplace").value=t?.place||"";
fill("f-skill",[["","— ยังไม่ระบุ —"],...skills().map(v=>[v,v])],t?.skill||(t?"":guessSkill({title:el("f-title").value,type:el("f-type").value,track:el("f-track").value})));
fill("f-mode",[["","— ยังไม่ระบุ —"],...modes().map(v=>[v,v])],t?.mode||"");
el("f-batch").value=t?.batch||"";
el("f-batches").value=(t&&+t.batches>1)?t.batches:"";
el("f-dsdopen").value=t?.dsdOpenDate||"";
(()=>{const cur=t?.course||"";
fill("f-course",[["__newcrs__","＋ หลักสูตรใหม่ (รันรหัสให้อัตโนมัติ)"],["","— ไม่ผูกทะเบียน (พิมพ์ชื่อเอง) —"],
...(()=>{const vs=visible(courses), out=[];
[...skills(),""].forEach(k=>{const g=vs.filter(c=>(c.skill||"")===k); if(!g.length)return;
out.push(["__hd__"+(k||"none"),"———— "+(k||"ยังไม่ระบุหมวดทักษะ")+" ————"]);
g.forEach(c=>out.push([c.code,c.code+" · "+c.name]));});
return out;})()],cur);
el("f-crscode").value=cur||""; paintCrsHint(); syncCrsName();})();
fill("f-yp",YP,t?.yp||""); el("f-dsdend").value=t?.dsdEnd||"";
el("f-dsdopenno").value=t?.dsdOpenNo||""; el("f-dsdcert").value=t?.dsdCertDate||"";
el("f-dsdcertno").value=t?.dsdCertNo||"";
el("f-pax").value=t?.pax||""; el("f-hours").value=t?.hours||"";
el("f-vendor").value=t?.vendor||"";
fill("f-dsd",[["","— ไม่ระบุ —"],...DSD.map(x=>[x,x])],t?.dsd||"");
if(!t)el("f-train").checked=genMode?false:((formCtx==="train")||trainish());
syncTrain(); if(typeof syncBatches==="function")syncBatches();
el("f-b1").value=t?.b1||""; el("f-b2").value=t?.b2||"";
el("f-actual").value=t?.actual||""; el("f-code").value=t?.code||"";
el("f-note").value=t?.note||"";
el("f-why").value=t?.why||""; el("f-inv").value=t?.inv||""; el("f-whr").value=t?.whr||""; el("f-how").value=t?.how||"";
el("wrap-5w").open=!!(genMode||w5Has(t));
paintTagOpts((t?.tag||"").trim());


el("f-pstart").value=t?.pstart||""; el("f-pend").value=t?.pend||"";
el("f-powner").value=t?.team||""; el("f-prog").value=(t&&t.prog!==undefined&&t.prog!==null&&t.prog!=="")?t.prog:"";
el("f-pgoal").value=t?.pgoal||""; el("f-prisk").value=t?.prisk||"";
el("f-astart").value=t?.astart||""; el("f-aend").value=t?.aend||"";
el("f-aplace").value=t?.aplace||""; el("f-apax").value=t?.apax||""; el("f-apaxreal").value=t?.apaxreal||"";
el("f-aorg").value=t?.aorg||"";
msDraft=chkList(t&&t.ms); apDraft=chkList(t&&t.aprep);
paintChk("ms"); paintChk("ap"); syncKind();
curQuad=quadOf(t); paintQuad(); syncGen();
const ms=t?.months||[];
occSkipDraft=[...((t&&t.skip)||[])]; occShowAll=false;
paintOccs(t); syncStatusLabel();
el("f-months").innerHTML=MTH.map((m,i)=>`<label><input type="checkbox" value="${i+1}"${ms.includes(i+1)?" checked":""}>${m}</label>`).join("");
foldInit(t); el("dlg").showModal();
}
function paintQuad(){
const box=el("f-quad"); if(!box)return;
box.querySelectorAll("[data-q]").forEach(b=>b.classList.toggle("on",b.dataset.q===curQuad));
const q=quadInfo(curQuad); el("f-quadhint").textContent=q?q[1]+" · "+q[4]:"ยังไม่จัดลำดับ — แตะช่องที่เหมาะกับงานนี้ (แตะซ้ำเพื่อยกเลิก)";
}
const DL_CHIPS=[["วันนี้",0],["พรุ่งนี้",1],["ใน 3 วัน",3],["ใน 1 สัปดาห์",7],["ใน 2 สัปดาห์",14],["สิ้นเดือน",-1]];
function syncGen(){
const lab=document.querySelector('label[for="f-date"]'); if(lab)lab.textContent=genMode?"Deadline":"วันที่";
const showQ=!(el("f-train").checked||el("f-meet").checked);
el("wrap-quad").hidden=!showQ;
el("f-dlchips").hidden=!genMode;
if(genMode){ el("wrap-flags").hidden=true; el("wrap-course").hidden=true; el("wrap-train").hidden=true; el("wrap-meet").hidden=true; }
el("back").hidden=!backable;
el("tplsave").hidden=!genMode;
syncW5();
}
// ---------- แม่แบบงาน (เก็บ 5W1H ไว้ใช้ซ้ำ) ----------
const TPL_KEYS=["title","track","company","type","owner","quad","why","inv","whr","how","note","tag"];
function paintTpl(){
const box=el("tplbox"); if(!box)return;
box.innerHTML=tpls.length?`<div class="tplh">แม่แบบงานของฉัน <small>แตะเพื่อเริ่มจากแม่แบบ</small></div>
<div class="tplrows">${tpls.map(tp=>`<div class="tplrow"><button type="button" class="tplgo" data-tpl="${esc(tp.id)}"><b>★ ${esc(tp.name)}</b><i>${esc([gLabel((tp.t||{}).track),(tp.t||{}).owner,(tp.t||{}).why].filter(Boolean).join(" · ").slice(0,70))}</i></button><button type="button" class="tpldel" data-tpldel="${esc(tp.id)}" title="ลบแม่แบบนี้" aria-label="ลบแม่แบบ">×</button></div>`).join("")}</div>`
:`<div class="hint" style="margin:0">ยังไม่มีแม่แบบ — เปิดฟอร์ม “เพิ่มงานทั่วไป” กรอกให้ครบ แล้วกด 💾 บันทึกเป็นแม่แบบ งานที่ทำซ้ำจะได้ไม่ต้องกรอก 5W1H ใหม่</div>`;
box.querySelectorAll("[data-tpl]").forEach(b=>b.onclick=()=>{ const tp=tpls.find(x=>x.id===b.dataset.tpl); if(tp){ el("pickdlg").close(); openFromTpl(tp); } });
box.querySelectorAll("[data-tpldel]").forEach(b=>b.onclick=async()=>{ const tp=tpls.find(x=>x.id===b.dataset.tpldel); if(!tp)return;
if(!await ask("ลบแม่แบบ “"+esc(tp.name)+"” ใช่ไหมคะ? (งานที่เคยสร้างจากแม่แบบนี้ไม่หาย)","ลบแม่แบบ"))return;
tpls=tpls.filter(x=>x.id!==tp.id); await saveMeta("tpls",tpls); paintTpl(); });
}
function openFromTpl(tp){
const T=tp.t||{};
open_(null,"task",true);
const setSel=(id,v)=>{ const n=el(id); if(n&&v!==undefined&&[...n.options].some(o=>o.value===v))n.value=v; };
el("f-title").value=T.title||tp.name||""; setSel("f-track",T.track); setSel("f-company",T.company||""); setSel("f-type",T.type||""); setSel("f-tag",T.tag||"");
el("f-owner").value=T.owner||""; el("f-note").value=T.note||"";
el("f-why").value=T.why||""; el("f-inv").value=T.inv||""; el("f-whr").value=T.whr||""; el("f-how").value=T.how||"";
curQuad=quadInfo(T.quad)?T.quad:""; paintQuad(); el("wrap-5w").open=true; syncW5();
setFoot("เริ่มจากแม่แบบ “"+tp.name+"” — ตั้ง Deadline แล้วบันทึกได้เลย");
}
el("tplsave").onclick=()=>{ if(!el("f-title").value.trim()){ el("f-title").focus(); return; } el("tps-name").value=el("f-title").value.trim(); el("tpsdlg").showModal(); el("tps-name").select(); };
el("tps-cancel").onclick=()=>el("tpsdlg").close();
el("tps-ok").onclick=async()=>{
const nm=el("tps-name").value.trim(); if(!nm){ el("tps-name").focus(); return; }
const t={title:el("f-title").value.trim(),track:el("f-track").value,company:el("f-company").value,type:(el("f-type").value==="__new__"?"":el("f-type").value),owner:el("f-owner").value.trim(),quad:curQuad,why:el("f-why").value.trim(),inv:el("f-inv").value.trim(),whr:el("f-whr").value.trim(),how:el("f-how").value.trim(),note:el("f-note").value.trim(),tag:el("f-tag").value};
const ex=tpls.find(x=>x.name===nm); const rec={id:ex?ex.id:"tp"+Date.now().toString(36),name:nm,t};
tpls=ex?tpls.map(x=>x===ex?rec:x):[...tpls,rec];
el("tpsdlg").close(); await saveMeta("tpls",tpls); setFoot((ex?"อัปเดต":"บันทึก")+"แม่แบบ “"+nm+"” แล้ว");
};
const w5Kind=()=>el("f-meet").checked?"meet":el("f-train").checked?"train":"task";
const W5LAB={
task:["Why · ทำไมต้องทำ","เช่น กฎหมายกำหนด / ผู้บริหารสั่ง / ลดความเสี่ยง","Who · ผู้เกี่ยวข้อง / ผู้อนุมัติ","เช่น อนุมัติโดยหัวหน้า HR · ประสานฝ่ายบัญชี","How · ขั้นตอน / เช็กลิสต์","1) … 2) … 3) …"],
train:["Why · ทักษะที่ขาด / วัตถุประสงค์","เช่น พนักงานใหม่ยังขาดทักษะความปลอดภัย","Who · กลุ่มเป้าหมาย","เช่น พนักงานฝ่ายผลิต กะเช้า","How · วิธีฝึก / เนื้อหา","เช่น บรรยาย 3 ชม. + ฝึกปฏิบัติ"],
meet:["Why · วัตถุประสงค์การประชุม","เช่น อนุมัติงบ / ติดตามความคืบหน้า","Who · ผู้ตัดสินใจ / ผู้ที่ต้องเข้า","เช่น MD, ผอ.ฝ่าย","How · วาระ / ผลที่ต้องได้","เช่น 1) รายงาน 2) ตัดสินใจ"]};
function syncW5(){
const k=w5Kind(), L=W5LAB[k];
el("lbl-why").textContent=L[0]; el("f-why").placeholder=L[1]; el("lbl-inv").textContent=L[2]; el("f-inv").placeholder=L[3]; el("lbl-how").textContent=L[4]; el("f-how").placeholder=L[5];
el("wrap-whr").hidden=k!=="task"; el("f-whr").placeholder="เช่น ห้องประชุม 2 · ระบบ HRIS · ลิงก์เอกสาร";
w5Live();
}
function w5Live(){
const k=w5Kind(), t={why:el("f-why").value,inv:el("f-inv").value,whr:el("f-whr").value,how:el("f-how").value,owner:el("f-owner").value,date:el("f-date").value,rrule:el("f-freq").value!=="none"?1:null};
const m=w5Miss(t,k), total=k==="task"?6:5, filled=total-m.length-(el("f-title").value.trim()?0:1);
el("w5sum").textContent="5W1H · รายละเอียดงาน (ไม่บังคับ) — ครบ "+filled+"/"+total;
el("w5hint").textContent=filled>=total?"ครบ 5W1H แล้ว ✓":"ยังขาด: "+[...(el("f-title").value.trim()?[]:["What"]),...m].join(", ");
}
el("dlg").addEventListener("input",w5Live); el("dlg").addEventListener("change",()=>{ if(el("dlg").open)syncW5(); });
el("w5ai").onclick=async()=>{
const hint=el("w5hint"), title=el("f-title").value.trim();
if(!title){ hint.textContent="พิมพ์ชื่องานก่อน แล้วค่อยให้ AI ช่วยเติม"; el("f-title").focus(); return; }
if(AI.live===null)await aiPing();
if(!AI.live){ hint.textContent="ยังไม่ได้เชื่อม AI ในแอป — เปิดโหมดฝัง AI ที่หน้าผู้ช่วย AI ก่อน หรือกรอกเองได้เลย"; return; }
el("w5ai").disabled=true; hint.textContent="AI กำลังร่าง…";
try{
const k=w5Kind(), info=["ชนิดงาน: "+({task:"งานทั่วไป",train:"อบรม",meet:"ประชุม"}[k]),"ชื่องาน: "+title,"ประเภท: "+(el("f-type").value||"-"),"กลุ่มงาน: "+(el("f-track").selectedOptions[0]?.textContent||"-"),"บริษัท: "+(el("f-company").selectedOptions[0]?.textContent||"-"),"ผู้รับผิดชอบ: "+(el("f-owner").value||"-"),"Deadline: "+(el("f-date").value||"-"),"รายละเอียดเดิม: "+(el("f-note").value||"-"),
"ที่กรอกไว้แล้ว — why: "+(el("f-why").value||"-")+" | inv: "+(el("f-inv").value||"-")+" | whr: "+(el("f-whr").value||"-")+" | how: "+(el("f-how").value||"-")].join("\n");
const txt=await aiAskText(W5_SYS,"วันนี้: "+isoOf(new Date()),info+'\nตอบ JSON: {"why":"","inv":"","whr":"","how":""} — inv คือผู้เกี่ยวข้อง/ผู้อนุมัติ/กลุ่มเป้าหมาย (ถ้าไม่รู้ชื่อจริงให้ใส่บทบาท เช่น “หัวหน้าแผนก”) · whr คือสถานที่/ระบบ');
const j=aiJsonOf(txt); if(!j||typeof j!=="object")throw new Error("อ่านคำตอบ AI ไม่ได้ ลองกดอีกครั้ง");
let n=0; [["why","f-why"],["inv","f-inv"],["whr","f-whr"],["how","f-how"]].forEach(([a,b])=>{ if(!el(b).value.trim()&&w5Txt(j[a])&&!(a==="whr"&&k!=="task")){ el(b).value=w5Txt(j[a]).slice(0,600); n++; } });
w5Live(); hint.textContent=n?"AI เติมให้ "+n+" ช่อง — ตรวจก่อนบันทึกนะคะ (เติมเฉพาะช่องที่ว่าง)":"ไม่มีช่องว่างให้เติม หรือข้อมูลยังไม่พอ";
}catch(e){ hint.textContent="ไม่สำเร็จ: "+(e.message||e); }
el("w5ai").disabled=false;
};
el("f-quad").onclick=e=>{ const b=e.target.closest("[data-q]"); if(!b)return; curQuad=curQuad===b.dataset.q?"":b.dataset.q; paintQuad(); };
el("f-dlchips").onclick=e=>{ const b=e.target.closest("[data-dl]"); if(!b)return; const n=+b.dataset.dl, d=new Date(); d.setHours(12,0,0,0);
if(n<0){ d.setMonth(d.getMonth()+1,0); } else d.setDate(d.getDate()+n);
el("f-date").value=isoOf(d); w5Live(); };
el("back").onclick=()=>{ el("dlg").close(); openPick(); };
let occSkipDraft=[], occShowAll=false;
function paintOccs(t){
const wrap=el("wrap-occ");

const R2=(t&&rr(t))||null;
const f=el("f-freq")?el("f-freq").value:"none";
if(!t||!R2||f==="none"){ wrap.hidden=true; el("f-occs").innerHTML=""; return; }
wrap.hidden=false;
const today=new Date(); today.setHours(0,0,0,0);
const st=t.date?new Date(t.date):today;
const from=new Date(Math.min(st.getTime(),today.getTime()));
const yr=(typeof R!=="undefined"&&R.year)||today.getFullYear();
let show;
if(occShowAll){ show=occList(t,new Date(yr,0,1),12).filter(d=>d.getFullYear()===yr); }
else{ const all=occList(t,new Date(from.getFullYear(),from.getMonth()-2,1),16);
const past=all.filter(d=>d<=today).slice(-5), fut=all.filter(d=>d>today).slice(0,4);
show=[...past,...fut]; }
el("occAll").textContent=occShowAll?"แสดงเฉพาะรอบใกล้ๆ":"ดูทุกรอบของปี "+(yr+543);
el("f-occs").innerHTML=show.map(d=>{const iso=isoOf(d), sk=occSkipDraft.includes(iso);
return `<label class="occ${d<=today?"":" fut"}${sk?" skip":""}">
<input type="checkbox" class="oc" value="${iso}"${occDone(t,d)?" checked":""}${sk?" disabled":""}>
<span>${d.getDate()} ${MTH[d.getMonth()]} ${d.getFullYear()+543-2500}</span>
<i>${sk?"งดรอบนี้":occCancel(t,d)?"ยกเลิกแล้ว":(d<today?"ผ่านมาแล้ว":d.getTime()===today.getTime()?"วันนี้":"ยังไม่ถึง")}</i>
<button type="button" class="skipbtn${sk?" on":""}" data-skip="${iso}" title="${sk?"กลับมาจัดตามปกติ":"งดรอบนี้ (ไม่จัด)"}">${sk?"↺ จัดตามเดิม":"งด"}</button></label>`;}).join("")
||`<div class="hint" style="margin:0">ยังไม่มีรอบให้แสดง</div>`;
el("occAll").onclick=ev=>{ev.preventDefault();occShowAll=!occShowAll;paintOccs(t);};
el("occPast").onclick=ev=>{ev.preventDefault();
el("f-occs").querySelectorAll(".oc").forEach(i=>{const d=new Date(i.value);
if(d<=today&&!occSkipDraft.includes(i.value))i.checked=true;});
setFoot("ติ๊กรอบที่ผ่านมาแล้ว — อย่าลืมกดบันทึก");};
el("occClear").onclick=ev=>{ev.preventDefault();
el("f-occs").querySelectorAll(".oc").forEach(i=>i.checked=false);
setFoot("ล้างเครื่องหมายแล้ว — อย่าลืมกดบันทึก");};
el("f-occs").querySelectorAll("[data-skip]").forEach(b=>b.onclick=ev=>{
ev.preventDefault(); ev.stopPropagation();
const iso=b.dataset.skip, i=occSkipDraft.indexOf(iso);
if(i>=0)occSkipDraft.splice(i,1); else occSkipDraft.push(iso);
paintOccs(t);});
}
function syncMeet(){ el("wrap-meet").hidden=!el("f-meet").checked; if(typeof syncGen==="function")syncGen(); }
el("f-meet").onchange=syncMeet;
// งานนี้ถือเป็นงานอบรมไหม — ดูจากกลุ่มงาน / ประเภท / ติ๊กเอง
function trainish(){
const g=groups.find(x=>x.key===el("f-track").value);
return /อบรม|training/i.test((g&&g.label)||"")||/อบรม/.test(el("f-type").value||"");
}
function syncTrain(){
if(genMode&&el("f-train").checked)el("f-train").checked=false;
const on=el("f-train").checked;
el("wrap-train").hidden=!on;
el("wrap-course").hidden=!on;
if(!on&&el("f-course").value){ el("f-course").value=""; el("f-crscode").value=""; }
syncCrsName(); if(typeof syncGen==="function")syncGen();
}
el("f-train").onchange=syncTrain;
// เปลี่ยนกลุ่ม/ประเภท → เปิดหรือปิดส่วนอบรมให้อัตโนมัติ ไม่ต้องนั่งติ๊กเอง
function autoTrain(){
if(genMode){ syncTrain(); return; }
const want=trainish();
if(want!==el("f-train").checked){ el("f-train").checked=want; }
syncTrain();
}
el("f-track").addEventListener("change",()=>paintTypeOpts(el("f-type").value));
el("f-crscode").oninput=()=>{
const q=el("f-crscode").value.trim().toLowerCase(); if(!q)return;
const hit=courses.find(c=>c.code.toLowerCase()===q)||courses.find(c=>c.code.toLowerCase().endsWith(q))
||courses.find(c=>c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q));
if(hit){ el("f-course").value=hit.code; el("f-course").onchange(); }};
el("f-course").onchange=()=>{
const c=crsOf(el("f-course").value);
syncCrsName();
if(c){ el("f-crscode").value=c.code; el("f-title").value=c.name;
if(c.skill)el("f-skill").value=c.skill; if(c.mode)el("f-mode").value=c.mode;
if(c.hours&&!el("f-hours").value)el("f-hours").value=c.hours;
if(!el("f-code").value.trim())el("f-code").value=c.code; }
paintCrsHint();};
el("f-track").addEventListener("change",()=>paintTagOpts(el("f-tag").value));
el("f-track").addEventListener("change",autoTrain);
el("f-track").addEventListener("change",()=>{if(genMode)return; formKind=""; syncKind();});
el("f-type").addEventListener("change",()=>{if(genMode)return; formKind=""; syncKind();});
if(el("ms-add"))el("ms-add").onclick=()=>{const v=el("ms-new").value.trim(); if(!v)return;
msDraft.push({t:v,d:false}); el("ms-new").value=""; paintChk("ms"); syncProg(); el("ms-new").focus();};
if(el("ms-new"))el("ms-new").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault(); el("ms-add").click();}};
if(el("ap-add"))el("ap-add").onclick=()=>{const v=el("ap-new").value.trim(); if(!v)return;
apDraft.push({t:v,d:false}); el("ap-new").value=""; paintChk("ap"); el("ap-new").focus();};
if(el("ap-new"))el("ap-new").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault(); el("ap-add").click();}};
if(el("f-prog"))el("f-prog").oninput=()=>{if(el("f-progbar"))el("f-progbar").style.width=Math.max(0,Math.min(100,+el("f-prog").value||0))+"%";};
["f-apax","f-apaxreal","f-b1","f-b2"].forEach(id=>{const n=el(id); if(n)n.addEventListener("input",syncAper);});
document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>pickKind(b.dataset.pick));
if(el("pickcancel"))el("pickcancel").onclick=()=>el("pickdlg").close();
el("f-type").addEventListener("change",autoTrain);
el("f-freq").onchange=()=>{syncFreq();paintOccs(editing);syncStatusLabel();};
function syncBatches(){
const w=el("wrap-bhint"), h=el("f-bhint"); if(!w||!h)return;
const tot=+el("f-batches").value||0, cur=batchNo(el("f-batch").value)||1;
const miss=[]; for(let i=1;i<=tot;i++)if(i!==cur)miss.push(batchLabel(el("f-batch").value||"รุ่น 1",i));
if(tot>1&&miss.length){w.hidden=false;
h.innerHTML=`บันทึกแล้วระบบจะสร้าง <b>${miss.length} รุ่น</b> ที่เหลือให้เลย (${esc(miss.slice(0,6).join(" · "))}${miss.length>6?" …":""})<br>
รุ่นใหม่จะได้ชื่อหลักสูตร บริษัท กลุ่มงาน วิทยากร และ<b>เลขคำขอเปิดหลักสูตร (ยป.)</b> เหมือนรุ่นนี้ · <b>เว้นวันที่ จำนวนคน และงบไว้ว่าง</b> ให้ไปเติมทีละรุ่น · รุ่นที่มีอยู่แล้วจะไม่ถูกสร้างซ้ำ`;}
else {w.hidden=true; h.innerHTML="";}}
["f-batches","f-batch"].forEach(id=>{const n=el(id); if(n){n.oninput=syncBatches; n.onchange=syncBatches;}});
el("cancel").onclick=()=>el("dlg").close();
el("save").onclick=async()=>{
if(!el("f-title").value.trim()){ foldOpen(el("f-title")); el("f-title").focus();return;}
const data={
title:el("f-title").value.trim(), company:el("f-company").value,
track:el("f-track").value, type:(el("f-type").value==="__new__"?"":el("f-type").value).trim(),
status:el("f-status").value, owner:el("f-owner").value.trim(),
date:el("f-date").value||null, recurring:el("f-recur").value.trim()||null,
rrule:(()=>{const f=el("f-freq").value; if(f==="none")return null;
return {freq:f,
weekdays:[...el("f-wd").querySelectorAll("input:checked")].map(i=>+i.value),
nth:[...el("f-nth").querySelectorAll("input:checked")].map(i=>+i.value),
monthday:+el("f-md").value||null, ...(el("f-until").value?{until:el("f-until").value}:{})};})(),
gl1:el("f-gl1").value, b1:+el("f-b1").value||0,
gl2:el("f-gl2").value, b2:+el("f-b2").value||0,
actual:+el("f-actual").value||0, code:el("f-code").value.trim(), course:el("f-course").value,
meet:el("f-meet").checked, time:hhmm(el("f-time").value),
place:(el("f-train").checked&&!el("f-meet").checked)?el("f-tplace").value.trim():el("f-place").value.trim(),
attendees:el("f-att").value.trim(), prepDays:+el("f-prepd").value||0, prepNote:el("f-prepn").value.trim(),
train:el("f-train").checked, pax:+el("f-pax").value||0, hours:+el("f-hours").value||0,
vendor:el("f-vendor").value.trim(), dsd:el("f-dsd").value,
skill:el("f-skill").value, mode:el("f-mode").value, batch:el("f-batch").value.trim(), batches:+el("f-batches").value||0, yp:el("f-yp").value, dsdEnd:el("f-dsdend").value||null, dsdOpenDate:el("f-dsdopen").value||null, dsdOpenNo:el("f-dsdopenno").value.trim(),
dsdCertDate:el("f-dsdcert").value||null, dsdCertNo:el("f-dsdcertno").value.trim(),
kind:formKind||kindOfItem(editing)||"",
pstart:el("f-pstart").value||null, pend:el("f-pend").value||null, team:el("f-powner").value.trim(),
prog:el("f-prog").value===""?null:Math.max(0,Math.min(100,+el("f-prog").value||0)),
pgoal:el("f-pgoal").value.trim(), prisk:el("f-prisk").value.trim(), ms:msDraft.filter(x=>x.t),
astart:hhmm(el("f-astart").value), aend:hhmm(el("f-aend").value), aplace:el("f-aplace").value.trim(),
apax:+el("f-apax").value||0, apaxreal:+el("f-apaxreal").value||0, aorg:el("f-aorg").value.trim(),
aprep:apDraft.filter(x=>x.t),
note:el("f-note").value.trim(), group:editing?.group||"", quad:curQuad,
why:el("f-why").value.trim(), inv:el("f-inv").value.trim(), whr:el("f-whr").value.trim(), how:el("f-how").value.trim(),
tag:el("f-tag").value.trim(), color:"",
months:[...el("f-months").querySelectorAll("input:checked")].map(i=>+i.value),
skip:(el("wrap-occ").hidden?(editing?.skip||[]):occSkipDraft.slice()),
ov:(()=>{const ov={...(editing?.ov||{})}; if(!el("wrap-occ").hidden)el("f-occs").querySelectorAll(".oc:checked").forEach(i=>{delete ov[i.value];}); return ov;})(),
done:(()=>{const box=el("f-occs"); if(el("wrap-occ").hidden)return editing?.done||[];
const shown=[...box.querySelectorAll(".oc")].map(i=>i.value);
const keep=(editing?.done||[]).filter(v=>!shown.includes(v));
return [...keep,...[...box.querySelectorAll(".oc:checked")].map(i=>i.value)];})()
};
if(el("f-course").value==="__newcrs__"){
const nm=(data.title||"").trim();
if(!nm){el("f-title").focus();return;}
const dup=courses.find(x=>x.name===nm);
if(dup){ data.course=dup.code; setFoot("มีหลักสูตรนี้อยู่แล้ว — ใช้รหัส "+dup.code); }
else{ const code=nextCourseCode();
courses=[...courses,{code,name:nm,skill:data.skill||"",mode:data.mode||"",hours:data.hours||0}];
data.course=code; if(!data.code)data.code=code;
try{ await saveMeta("courses",courses); }catch(e){}
setFoot("เพิ่มหลักสูตร "+code+" ในทะเบียนแล้ว"); }
}
el("dlg").close();
try{ await saveItem(data,editing?._id); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); return; }
// สร้างรุ่นที่เหลือให้อัตโนมัติ — เว้นวันที่ จำนวนคน และงบไว้ว่าง
const tot=+data.batches||0;
if(data.train&&tot>1){
const cur=batchNo(data.batch)||1, code=crsCodeOf(data), made=[], skip=[];
for(let i=1;i<=Math.min(tot,60);i++){
if(i===cur)continue;
const lb=batchLabel(data.batch||"รุ่น 1",i);
const dup=items.some(x=>isTrain(x)&&(code?crsCodeOf(x)===code:(x.title||"").trim()===(data.title||"").trim())
&&(x.company||"")===(data.company||"")&&batchNo(x.batch)===i);
if(dup){skip.push(lb);continue;}
const cp=Object.assign({},data,{batch:lb,date:null,dsdEnd:null,dsdCertDate:null,dsdCertNo:"",
status:"รอดำเนินการ",pax:0,hours:data.hours||0,b1:0,b2:0,actual:0,done:[],skip:[]});
delete cp._id;
try{ await saveItem(cp); made.push(lb); }catch(e){}
setFoot("กำลังสร้างรุ่น "+made.length+"/"+(tot-1)+" …");}
if(made.length)tell("<b>สร้างรุ่นให้แล้ว "+made.length+" รุ่น</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"
+esc(made.join(" · "))+(skip.length?"<br><span style=\"opacity:.7\">ข้ามรุ่นที่มีอยู่แล้ว: "+esc(skip.join(" · "))+"</span>":"")
+"<br>เหลือแค่เปิดแต่ละรุ่นแล้วเติม <b>วันที่ · จำนวนคน · งบ</b> ค่ะ</div>");
else if(skip.length)setFoot("ทุกรุ่นมีอยู่แล้ว ไม่ได้สร้างเพิ่ม");}
};
el("del").onclick=async()=>{
if(!editing)return;
const t=editing; el("dlg").close();
if(!await ask("ย้าย “"+esc(t.title)+"” ไปถังขยะใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--ink-3)\">กู้คืนได้ภายใน 30 วันที่ ตั้งค่า › ถังขยะ</div>","ย้ายไปถังขยะ"))return;
await softDel("items",t);
};
let editingIdx=null, editingNote=null;
function openIdx(x){
editingIdx=x;
el("idlgh").textContent=x?"แก้ไขรายการ Index":"เพิ่มรายการ Index";
el("idel").style.display=x?"":"none";
el("i-title").value=x?.title||"";
fill("i-group",[["","ไม่ระบุหมวด"],...idxCatNames().map(c=>[c,c]),["__new","＋ สร้างหมวดใหม่…"]],(x?.group||"").trim());
el("i-newwrap").hidden=true; el("i-newcat").value="";
el("i-owner").value=x?.owner||""; el("i-url").value=x?.url||"";
fill("i-status",IDXSTATUS.map(v=>[v,v]),x?.status||"ใช้งานอยู่");
el("i-detail").value=x?.detail||""; el("i-note").value=x?.note||""; el("i-fav").checked=!!x?.fav;
el("i-use").value=x?.iuse||""; el("i-who").value=x?.iwho||""; el("i-when").value=x?.iwhen||"";
el("ixowners").innerHTML=[...new Set(idx.map(v=>(v.owner||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("idlg").showModal();
}
el("icancel").onclick=()=>el("idlg").close();
el("i-group").onchange=()=>{ const n=el("i-group").value==="__new"; el("i-newwrap").hidden=!n; if(n)el("i-newcat").focus(); };
el("isave").onclick=async()=>{
if(!el("i-title").value.trim()){el("i-title").focus();return;}
let grp=el("i-group").value; if(grp==="__new"){ grp=el("i-newcat").value.trim(); if(!grp){el("i-newcat").focus();return;} }
const d={title:el("i-title").value.trim(),group:grp,owner:el("i-owner").value.trim(),
url:el("i-url").value.trim(),status:el("i-status").value,detail:el("i-detail").value.trim(),note:el("i-note").value.trim(),iuse:el("i-use").value.trim(),iwho:el("i-who").value.trim(),iwhen:el("i-when").value.trim()};
if(el("i-fav").checked)d.fav=true;
if(editingIdx){ if(editingIdx.ord!=null)d.ord=editingIdx.ord; if(editingIdx.fo!=null)d.fo=editingIdx.fo; }
else if(d.fav){ d.fo=Math.max(0,...idx.filter(v=>v.fav).map(v=>+v.fo||0))+10; }
if(d.fav&&editingIdx&&!editingIdx.fav&&d.fo==null)d.fo=Math.max(0,...idx.filter(v=>v.fav).map(v=>+v.fo||0))+10;
el("idlg").close();
if(grp&&!idxCatNames().includes(grp)) await idxSaveCats([...idxCatNames(),grp]);
try{ editingIdx? await DB.collection("index").doc(editingIdx._id).set(d) : await DB.collection("index").add(d); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
};
el("idel").onclick=async()=>{ if(!editingIdx)return; const x=editingIdx; el("idlg").close();
if(!await ask("ลบ “"+esc(x.title)+"” ใช่ไหมคะ?","ลบรายการ"))return;
await softDel("index",x);};
let viewingNote=null;
function viewNote(n){
viewingNote=n;
el("nvk").textContent=n.kind||"โน้ต"; el("nvd").textContent=n.date||"";
el("nvt").textContent=n.title||"(ไม่มีหัวข้อ)";
el("nvb").innerHTML=ntHtml(n)||'<span style="color:var(--ink-3)">(ไม่มีเนื้อหา)</span>';
el("nvtag").textContent=n.tag?"#"+n.tag:"";
el("nvpin").textContent=n.pin?"เลิกปักหมุด":"ปักหมุด";
el("nvdlg").querySelector(".nvbar").style.background=n.color||"var(--accent-2)";
el("nvdlg").showModal();
}
el("nvclose").onclick=()=>el("nvdlg").close();
el("nvtask").onclick=()=>{ const n=viewingNote; if(n){ el("nvdlg").close(); openNote2Task(n); } };
el("nvedit").onclick=()=>{ const n=viewingNote; el("nvdlg").close(); if(n)openNote(n); };
el("nvpin").onclick=async()=>{ const n=viewingNote; if(!n)return; el("nvdlg").close(); try{ await DB.collection("note").doc(n._id).set({pin:!n.pin},{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } };
// ---- แปลงบันทึก → งานใน Matrix
let n2tNote=null, n2tRows=[];
function n2tExtract(n){
const d=document.createElement("div"); d.innerHTML=ntHtml(n);
let lines=[...d.querySelectorAll("li")].map(x=>(x.textContent||"").trim());
if(!lines.length)lines=ntPlain(n).split(/\n+/).map(s2=>s2.replace(/^[\s\-–•*·\d.)]+/,"").trim());
return [...new Set(lines.filter(s2=>s2.length>=3))].slice(0,30);
}
function openNote2Task(n){
n2tNote=n; n2tRows=n2tExtract(n).map(t=>({t,on:true,q:"",d:"",o:"",why:"",inv:"",whr:"",how:""}));
el("n2tsrc").textContent=n.title||"(ไม่มีหัวข้อ)";
paintN2T(); el("n2tdlg").showModal();
}
function paintN2T(){
el("n2trows").innerHTML=n2tRows.map((r,i)=>`<div class="n2trow${r.on?"":" off"}">
<label class="n2tck"><input type="checkbox" data-n2t="ck:${i}"${r.on?" checked":""}></label>
<input class="n2tt" data-n2t="t:${i}" value="${esc(r.t)}" aria-label="ชื่องาน">
<select data-n2t="q:${i}" aria-label="Matrix"><option value="">Matrix: ยังไม่จัด</option>${QUADS.map((x,k)=>`<option value="${x[0]}"${r.q===x[0]?" selected":""}>${k+1} ${x[1]}</option>`).join("")}</select>
<input type="date" data-n2t="d:${i}" value="${esc(r.d)}" aria-label="Deadline" title="Deadline">
<input data-n2t="o:${i}" value="${esc(r.o)}" placeholder="ผู้รับผิดชอบ" aria-label="ผู้รับผิดชอบ">${w5Has(r)?`<div class="n2tw5">${w5Line(r).replace(/<\/?div[^>]*>/g,"")}</div>`:""}</div>`).join("")||`<div class="empty">ไม่พบข้อความที่แยกเป็นงานได้ — ลองเขียนเป็นบูเลตทีละข้อในบันทึก</div>`;
const k=n2tRows.filter(r=>r.on&&r.t.trim()).length;
el("n2tgo").textContent="สร้าง "+k+" งาน"; el("n2tgo").disabled=!k;
}
el("n2trows").addEventListener("change",e=>{ if(e.target.tagName==="SELECT"||e.target.type==="date")e.target.dispatchEvent(new Event("input",{bubbles:true})); });
el("n2trows").addEventListener("input",e=>{ const k=e.target.dataset.n2t; if(!k)return; const [f,i]=k.split(":"); const r=n2tRows[+i]; if(!r)return;
 if(f==="ck"){ r.on=e.target.checked; paintN2T(); } else if(f==="t"){ r[f]=e.target.value; const c=n2tRows.filter(x=>x.on&&x.t.trim()).length; el("n2tgo").textContent="สร้าง "+c+" งาน"; el("n2tgo").disabled=!c; } else r[f]=e.target.value; });
el("n2tall").onclick=()=>{ const on=!n2tRows.every(r=>r.on); n2tRows.forEach(r=>r.on=on); paintN2T(); };
el("n2tcancel").onclick=()=>el("n2tdlg").close();
el("n2tai").onclick=async()=>{
const b=el("n2tai"); if(!n2tNote||!n2tRows.length)return;
if(AI.live===null)await aiPing();
if(!AI.live){ tell("<b>ยังไม่ได้เชื่อม AI ในแอป</b><div style=\"font-size:13px;margin-top:8px\">เปิดโหมดฝัง AI ที่หน้าผู้ช่วย AI ก่อน แล้วกลับมากดใหม่ได้ค่ะ — หรือกรอกเองตอนแก้งานแต่ละอัน</div>"); return; }
b.disabled=true; const old=b.textContent; b.textContent="AI กำลังอ่านบันทึก…";
try{
const list=n2tRows.map((r,i)=>i+": "+r.t).join("\n");
const txt=await aiAskText(W5_SYS+"\nงานนี้คือแยกบันทึกเป็นงานย่อย: ให้เติมเฉพาะสิ่งที่เขียนไว้ในบันทึกหรืออนุมานได้ชัดเจน owner ใส่ได้เฉพาะชื่อที่ปรากฏในบันทึก date ใส่ได้เฉพาะเมื่อบันทึกระบุวัน (YYYY-MM-DD, คำนวณจากวันนี้) quad เป็น q1|q2|q3|q4 หรือ \"\"","วันนี้: "+isoOf(new Date()),
"บันทึก: "+(n2tNote.title||"")+"\n"+ntPlain(n2tNote).slice(0,6000)+"\n\nรายการงานที่แยกได้:\n"+list+'\n\nตอบ JSON เป็นอาร์เรย์: [{"i":0,"why":"","inv":"","whr":"","how":"","owner":"","date":"","quad":""}]');
const arr=aiJsonOf(txt); if(!Array.isArray(arr))throw new Error("อ่านคำตอบ AI ไม่ได้ ลองกดอีกครั้ง");
let n=0; arr.forEach(o=>{ const r=n2tRows[+o.i]; if(!r)return; let ch=false;
["why","inv","whr","how","owner"].forEach(k=>{ const v=w5Txt(o[k]); const f=k==="owner"?"o":k; if(v&&!w5Txt(r[f])){ r[f]=v.slice(0,500); ch=true; } });
if(/^\d{4}-\d{2}-\d{2}$/.test(o.date||"")&&!r.d){ r.d=o.date; ch=true; }
if(quadInfo(o.quad)&&!r.q){ r.q=o.quad; ch=true; }
if(ch)n++; });
paintN2T(); b.textContent=n?"AI เติมให้ "+n+" งาน ✓":"ข้อมูลในบันทึกยังไม่พอ";
setTimeout(()=>{ b.textContent=old; },3500);
}catch(e){ b.textContent=old; tell("<b>เติม 5W1H ไม่สำเร็จ</b><div style=\"font-size:13px;margin-top:8px\">"+esc(e.message||e)+"</div>"); }
b.disabled=false;
};
el("n2tgo").onclick=async()=>{
const pick=n2tRows.filter(r=>r.on&&r.t.trim()); if(!pick.length||!n2tNote)return;
const tr=(visible(groups).find(g=>!/อบรม|training|ประชุม|meeting|โปรเจค|โครงการ|project|กิจกรรม|event/i.test(g.label))||groups[0]||{}).key||"";
el("n2tgo").disabled=true; let ok=0;
for(const r of pick){
 try{ await saveItem({title:r.t.trim(),kind:"task",track:tr,type:"",status:"รอดำเนินการ",date:r.d||null,company:"",owner:r.o.trim(),quad:r.q,
  note:"จากบันทึก: "+(n2tNote.title||"(ไม่มีหัวข้อ)"),srcNote:n2tNote._id,why:r.why||"",inv:r.inv||"",whr:r.whr||"",how:r.how||""}); ok++; }catch(e){}
}
el("n2tdlg").close();
tell("<b>สร้างงานแล้ว "+ok+" งาน</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+(pick.some(r=>r.q)?"ที่เลือกช่อง Matrix ไว้ไปอยู่ในหน้า Matrix งานแล้ว · ":"")+"ที่ยังไม่จัดลำดับอยู่ในถาด “ยังไม่จัดลำดับ”</div>");
};
// ตัวแก้ไขแบบจัดรูปแบบ
const NE=()=>el("n-body");
function neCmd(cmd,val){ NE().focus(); document.execCommand(cmd,false,val||null); neState(); }
function neLight(){
NE().focus(); const s=getSelection(); if(!s.rangeCount)return; const r=s.getRangeAt(0);
let n=s.anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&n.classList&&n.classList.contains("lt")){ while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n); n.remove(); neState(); return; } n=n.parentNode; }
if(r.collapsed||!NE().contains(r.commonAncestorContainer))return;
const sp=document.createElement("span"); sp.className="lt"; sp.appendChild(r.extractContents()); r.insertNode(sp); s.removeAllRanges(); const r2=document.createRange(); r2.selectNodeContents(sp); s.addRange(r2); neState();
}
function neBlock(tag){ NE().focus(); const cur=(document.queryCommandValue("formatBlock")||"").toLowerCase(); document.execCommand("formatBlock",false,cur===tag||cur==="<"+tag+">"?"p":tag); neState(); }
function neState(){
const on=c=>{try{return document.queryCommandState(c);}catch(e){return false;}};
const blk=(document.queryCommandValue("formatBlock")||"").toLowerCase().replace(/[<>]/g,"");
document.querySelectorAll("#ntool [data-ne]").forEach(b=>{ const k=b.dataset.ne; let v=false;
 if(k==="bold")v=on("bold"); else if(k==="italic")v=on("italic"); else if(k==="underline")v=on("underline"); else if(k==="strike")v=on("strikeThrough");
 else if(k==="ul")v=on("insertUnorderedList"); else if(k==="ol")v=on("insertOrderedList");
 else if(k==="h2")v=blk==="h2"; else if(k==="h3")v=blk==="h3"; else if(k==="light"){ let n=getSelection().anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&n.classList&&n.classList.contains("lt")){v=true;break;} n=n.parentNode; } }
 b.classList.toggle("on",v); });
}
el("ntool").addEventListener("mousedown",e=>{ if(e.target.closest("[data-ne]"))e.preventDefault(); });
el("ntool").addEventListener("click",e=>{ const b=e.target.closest("[data-ne]"); if(!b)return; const k=b.dataset.ne;
 if(k==="bold")neCmd("bold"); else if(k==="italic")neCmd("italic"); else if(k==="underline")neCmd("underline"); else if(k==="strike")neCmd("strikeThrough");
 else if(k==="light")neLight(); else if(k==="h2")neBlock("h2"); else if(k==="h3")neBlock("h3");
 else if(k==="ul")neCmd("insertUnorderedList"); else if(k==="ol")neCmd("insertOrderedList"); else if(k==="hr")neCmd("insertHorizontalRule");
 else if(k==="clear"){ neCmd("removeFormat"); document.execCommand("formatBlock",false,"p"); NE().querySelectorAll(".lt").forEach(n=>{while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n);n.remove();}); } });
NE().addEventListener("keyup",neState); NE().addEventListener("mouseup",neState);
NE().addEventListener("paste",e=>{ e.preventDefault(); const t=(e.clipboardData||window.clipboardData).getData("text/plain"); document.execCommand("insertText",false,t); });
function openNote(n){
editingNote=n;
el("ndlgh").textContent=n?"แก้ไขบันทึก":"เขียนบันทึกใหม่";
el("ndel").style.display=n?"":"none";
el("n-title").value=n?.title||"";
fill("n-kind",NOTEKIND.map(v=>[v,v]),n?.kind||"บันทึกการประชุม");
el("n-date").value=n?.date||new Date().toISOString().slice(0,10);
el("n-tag").value=n?.tag||""; NE().innerHTML=n?ntHtml(n):"";
el("n-pin").checked=!!n?.pin;
el("n-colors").innerHTML=[["","ค่าเริ่มต้น"],...TAGCOLORS.map(c=>[c,c])].map(([c])=>
`<button type="button" class="sw1${(n?.color||"")===c?" on":""}" data-ncolor="${c}" style="${c?`background:${c}`:"background:var(--line-2)"}">${c?"":"—"}</button>`).join("");
el("n-colors").querySelectorAll("[data-ncolor]").forEach(b=>b.onclick=()=>{
el("n-colors").querySelectorAll("[data-ncolor]").forEach(x=>x.classList.remove("on"));
b.classList.add("on"); el("n-colors").dataset.val=b.dataset.ncolor;});
el("n-colors").dataset.val=n?.color||"";
el("ntaglist").innerHTML=[...new Set(notes.map(v=>(v.tag||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("ndlg").showModal(); neState();
}
el("ncancel").onclick=()=>el("ndlg").close();
el("nsave").onclick=async()=>{
const d={title:el("n-title").value.trim(),kind:el("n-kind").value,date:el("n-date").value||null,
tag:el("n-tag").value.trim(),body:ntClean(NE().innerHTML),fmt:"h",color:el("n-colors").dataset.val||"",pin:el("n-pin").checked};
if(!d.title&&!(NE().textContent||"").trim()){el("n-title").focus();return;}
el("ndlg").close();
try{ editingNote? await DB.collection("note").doc(editingNote._id).set(d) : await DB.collection("note").add(d); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
};
el("ndel").onclick=async()=>{ if(!editingNote)return; const n=editingNote; el("ndlg").close();
if(!await ask("ลบบันทึกนี้ใช่ไหมคะ?","ลบบันทึก"))return;
await softDel("note",n);};
let editingDsd=null;
let editingCrs=null, crsFilingYear=THISYEAR;
function openCrs(code){
const c=crsOf(code); if(!c)return;
editingCrs=code;
const bs=crsBatches(code).slice().sort((x,y)=>String(x.date||"9999").localeCompare(String(y.date||"9999")));
const pax=bs.reduce((a,t)=>a+(+t.pax||0),0);
const cost=bs.reduce((a,t)=>a+((+t.actual||0)||budgetOf(t)),0);
const yrs=[...new Set(bs.map(t=>t.date?new Date(t.date).getFullYear():null).filter(Boolean))].sort();
el("crsdlgh").textContent=c.code+" · "+c.name;
el("crs-kpi").innerHTML=`<div><span>จำนวนรุ่น</span><b>${bs.length}</b></div>
<div><span>ผู้เข้าอบรมสะสม</span><b>${baht(pax)} คน</b></div>
<div><span>ชั่วโมง/คน</span><b>${c.hours||"—"}</b></div>
<div><span>บังคับตามกฎหมาย</span><b>${c.law===true?"ใช่ (ตั้งที่หลักสูตร)":c.law===false?"ไม่ (ตั้งที่หลักสูตร)":"ตามประเภทงาน"}</b></div>
<div><span>งบ/ใช้จริงรวม</span><b>${baht(cost)} ฿</b></div>
<div><span>ปีที่จัด</span><b>${yrs.length?yrs.map(y=>y+543).join(", "):"—"}</b></div>
<div><span>รับรองแล้ว</span><b>${bs.filter(t=>t.dsdCertNo||t.dsd==="อนุมัติแล้ว").length}/${bs.length} รุ่น</b></div>`;
crsFilingYear=R.year;
paintCrsFiling();
el("crs-rows").innerHTML=bs.map(t=>{const y=ypState(t), d=t.date?new Date(t.date):null;
return `<div class="li" data-crsitem="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(crsCodeOf(t)||"")} ${esc(t.batch||"ไม่ระบุรุ่น")}${t.company?" · "+esc(cLabel(t.company)):""}</div>
<div class="t2">${t.pax?t.pax+" คน · ":""}${ypNoOf(t)?"ยป. "+esc(ypNoOf(t))+" · ":""}${t.dsdCertNo?"รับรอง "+esc(t.dsdCertNo):esc(y.step)}</div></div>
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;}).join("")||`<div class="empty">ยังไม่มีรุ่นของหลักสูตรนี้</div>`;
el("crsdlg").showModal();
}
el("crscancel").onclick=()=>el("crsdlg").close();
function paintCrsFiling(){
const c=crsOf(editingCrs); if(!c)return;
const f=crsFiling(editingCrs,crsFilingYear);
fill("crs-fyear",yearList().map(y=>[y,"ปี "+(y+543)]),crsFilingYear);
fill("crs-yp",YP,f.yp||c.yp||"");
el("crs-openno").value=f.openNo||""; el("crs-opendate").value=f.openDate||"";
const other=Object.keys(c.filings||{}).filter(y=>+y!==crsFilingYear&&(c.filings[y].openNo||c.filings[y].openDate));
el("crs-fhint").innerHTML=other.length
?"ปีอื่นที่เคยยื่นไว้: "+other.map(y=>`<b>${+y+543}</b> ${esc(c.filings[y].openNo||"—")}`).join(" · ")
:"ยังไม่มีเลขคำขอของปีอื่นในระบบ";
}
el("crs-fyear")&&(el("crs-fyear").onchange=()=>{saveCrsFiling(); crsFilingYear=+el("crs-fyear").value; paintCrsFiling();});
function saveCrsFiling(){
const c=crsOf(editingCrs); if(!c)return;
const no=el("crs-openno").value.trim(), dt=el("crs-opendate").value||"", yp=el("crs-yp").value;
c.filings=c.filings||{};
if(no||dt||yp)c.filings[crsFilingYear]={yp,openNo:no,openDate:dt};
else delete c.filings[crsFilingYear];
}
el("crssave").onclick=async()=>{
if(!crsOf(editingCrs))return;
saveCrsFiling();
el("crsdlg").close(); render(); await saveMeta("courses",courses);};
el("crs-copy").onclick=async()=>{
const code=editingCrs, bs=crsBatches(code); if(!bs.length){tell("ยังไม่มีรุ่นให้คัดลอกค่ะ");return;}
const yNow=Math.max(...bs.map(t=>t.date?new Date(t.date).getFullYear():THISYEAR));
const src=bs.filter(t=>t.date&&new Date(t.date).getFullYear()===yNow);
if(!src.length){tell("รุ่นที่มีอยู่ยังไม่ได้ใส่วันที่ คัดลอกข้ามปีไม่ได้ค่ะ");return;}
el("crsdlg").close();
if(!await ask(`คัดลอก <b>${src.length}</b> รุ่นของปี ${yNow+543} ไปเป็นปี ${yNow+544} ใช่ไหมคะ?<div style="font-size:13px;margin-top:8px">เลื่อนวันที่ +1 ปี · สถานะกลับเป็นรอดำเนินการ · ไม่คัดลอกเลขคำขอและใช้จริง</div>`,"คัดลอก"))return;
let ok=0;
for(const t of src){
const {_id,...r}=t;
const nd=new Date(t.date); nd.setFullYear(nd.getFullYear()+1);
try{ await saveItem(Object.assign({},r,{date:isoOf(nd),status:"รอดำเนินการ",actual:0,done:[],
dsdOpenNo:"",dsdOpenDate:null,dsdCertNo:"",dsdCertDate:null,dsdEnd:null,dsd:"รอยื่น"})); ok++; }catch(e){}
setFoot("กำลังคัดลอก "+ok+"/"+src.length+" …");}
render(); tell("<b>คัดลอกแล้ว "+ok+" รุ่น</b> ไปปี "+(yNow+544)+"<div style=\"font-size:13px;margin-top:8px\">เปิดแต่ละรุ่นเพื่อแก้วันที่จริงได้เลยค่ะ</div>");};
el("crs-rows")&&el("crsdlg").addEventListener("click",e=>{
const n=e.target.closest("[data-crsitem]"); if(!n)return;
const t=items.find(x=>x._id===n.dataset.crsitem); if(!t)return;
el("crsdlg").close(); setTimeout(()=>openCard(t),200);});
let editingGl=null, glDraft=null, glDraftCo="";
function openGlPlan(key){
const g=gls.find(x=>x.key===key); if(!g)return;
const y=R.glYear||R.year;
editingGl={key,y};
glDraft={}; const P=glPlan(g,y); Object.keys(P).forEach(ck=>glDraft[ck]=glPlanMonths(g,y,ck));
const cos=visible(companies).filter(c=>!c.isGroup);
const list=cos.length?cos:companies;
el("gbdlgh").textContent="งบรายเดือน · "+(g.dept?g.dept+" · ":"")+(g.code?g.code+" · ":"")+g.label+" · ปี "+(y+543);
fill("gb-co",list.map(c=>[c.key,c.label]),glDraftCo&&list.some(c=>c.key===glDraftCo)?glDraftCo:list[0]?.key||"");
glDraftCo=el("gb-co").value;
paintGlMonths(); paintGlFlat();
el("gbdlg").showModal();
}
// ยอดรายปีก้อนเดิม (ไม่มีแผนรายเดือน) — แสดงที่มา และให้กดดึงมาเกลี่ยเป็นรายเดือนได้
function paintGlFlat(){
const b=el("gb-flat"); if(!b||!editingGl)return;
const g=gls.find(x=>x.key===editingGl.key), y=editingGl.y;
const flat=g&&!hasPlan(g,y)?glBudget(g,y):0;
const cur=readGlMonths().reduce((s2,v)=>s2+v,0);
if(!flat||cur){ b.hidden=true; b.innerHTML=""; return; }
b.hidden=false;
b.innerHTML=`<div>หมวดนี้มี <b>ยอดรายปี ${baht(flat)} ฿</b> ที่ตั้งไว้แบบก้อนเดียว (จากการตั้งงบรายปีแบบเดิม หรือปุ่ม “คัดลอกงบจากปีก่อน”) — ยังไม่ได้แยกเป็นรายเดือน/รายบริษัท จึงเห็นในรายการแต่ช่องรายเดือนว่าง<br><button type="button" class="btn sm" id="gb-useflat" style="margin-top:8px">ดึง ${baht(flat)} ฿ มาเกลี่ย 12 เดือนให้บริษัทที่เลือก</button> <span style="font-size:12px;opacity:.8">แล้วแก้รายเดือนได้ · ถ้าแบ่งหลายบริษัทให้ใส่ทีละบริษัทให้ยอดรวมเท่ากับก้อนนี้</span></div>`;
el("gb-useflat").onclick=()=>{ const per=Math.round(flat/12); [...el("gb-months").querySelectorAll(".gm")].forEach((i,k)=>i.value=k===11?flat-per*11:per); paintGlSum(); paintGlFlat(); };
}
function readGlMonths(){ return [...el("gb-months").querySelectorAll(".gm")].map(i=>+i.value||0); }
function stashGl(){ if(glDraft&&glDraftCo)glDraft[glDraftCo]=readGlMonths(); }
function paintGlMonths(){
const arr=(glDraft&&glDraft[glDraftCo])||Array(12).fill(0);
el("gb-months").innerHTML=MTH.map((m,i)=>`<label class="mcell"><span>${m}</span><input type="number" min="0" class="gm" value="${arr[i]||""}" placeholder="—"></label>`).join("");
paintGlSum();
}
function paintGlSum(){
const cur=readGlMonths().reduce((a,b)=>a+b,0);
const others=Object.keys(glDraft||{}).filter(k=>k!==glDraftCo).reduce((s2,k)=>s2+(glDraft[k]||[]).reduce((a,b)=>a+(+b||0),0),0);
el("gb-sum").innerHTML=`<div><span>รวมบริษัทนี้</span><b>${baht(cur)} ฿</b></div>
<div><span>บริษัทอื่นที่ตั้งไว้แล้ว</span><b>${baht(others)} ฿</b></div>
<div><span>รวมทั้งหมวดในปีนี้</span><b style="color:var(--accent)">${baht(cur+others)} ฿</b></div>`;
}
el("gb-co").onchange=()=>{ stashGl(); glDraftCo=el("gb-co").value; paintGlMonths(); paintGlFlat(); };
el("gbdlg").addEventListener("input",e=>{ if(e.target.classList.contains("gm")){ paintGlSum(); paintGlFlat(); } });
el("gb-spread").onclick=()=>{
const tot=readGlMonths().reduce((a,b)=>a+b,0);
if(!tot){tell("ใส่ยอดในเดือนใดเดือนหนึ่งก่อน ระบบจะเกลี่ยให้ค่ะ");return;}
const per=Math.round(tot/12);
[...el("gb-months").querySelectorAll(".gm")].forEach((i,k)=>i.value=k===11?tot-per*11:per);
paintGlSum();};
el("gbcancel").onclick=()=>el("gbdlg").close();
el("gbsave").onclick=async()=>{
if(!editingGl)return; stashGl();
const g=gls.find(x=>x.key===editingGl.key); if(!g){el("gbdlg").close();return;}
const y=editingGl.y;
if(g.plan&&g.plan[y])delete g.plan[y];
Object.keys(glDraft).forEach(ck=>setGlPlan(g,y,ck,glDraft[ck]));
el("gbdlg").close(); render(); await saveMeta("gl",gls);};
function openDsd(ck){
const y=R.year, c=companies.find(x=>x.key===ck); if(!c)return;
const r=dsdRec(ck,y)||{id:"",months:Array(12).fill(""),sent:0,repeatPersons:0,repeatTimes:0,passSkill:0,passStd:0};
editingDsd={ck,y};
el("ddlgh").textContent="กรมพัฒนาฯ · "+c.label+" · ปี "+(y+543);
el("d-id").value=r.id||"";
el("d-months").innerHTML=MTH.map((m,i)=>`<label class="mcell"><span>${m}</span><input type="number" min="0" class="dm" value="${(r.months&&r.months[i]!=null&&r.months[i]!=="")?r.months[i]:""}" placeholder="—"></label>`).join("");
el("d-goal").value=(+r.goal&&+r.goal>LAWPCT)?r.goal:"";
el("d-sent").value=r.sent||""; el("d-rp").value=r.repeatPersons||""; el("d-rt").value=r.repeatTimes||"";
el("d-ps").value=r.passSkill||""; el("d-fund").value=r.fundPaid||"";
fill("d-st2",ST2.map(x=>[x,x]),r.st2||ST2[0]);
el("d-st2date").value=r.st2date||""; el("d-st2no").value=r.st2no||""; el("d-st2note").value=r.st2note||"";
const auto=trainedPax(ck,y);
el("d-hint").innerHTML=`ระบบนับผู้เข้าอบรมจากหลักสูตรที่ปิดงานแล้วในปีนี้ได้ <b>${auto}</b> คน — ใช้เทียบได้ แต่เลข A ให้ยึดตามหน้าเว็บกรมฯ`;
syncPassSkill(true);
el("ddel").style.display=dsdRec(ck,y)?"":"none";
paintDsd();
el("ddlg").showModal();
}
function syncPassSkill(fill0){
if(!editingDsd)return;
const A=+el("d-sent").value||0, rt=+el("d-rt").value||0;
const autoP=Math.max(0,A-rt);
if(fill0||!el("d-ps").value||el("d-ps").dataset.auto==="1"){ el("d-ps").value=autoP||""; el("d-ps").dataset.auto="1"; }
const keyed=+el("d-ps").value||0;
const reg=trainedPax(editingDsd.ck,editingDsd.y), regD=trainedPaxDsd(editingDsd.ck,editingDsd.y);
const same=keyed===autoP;
el("d-pshint").innerHTML=`C = A − ครั้งที่ซ้ำ = <b>${baht(autoP)}</b> คน (หัวคนไม่ซ้ำ)`
+(same?"":` · <span style="color:var(--over)">คุณคีย์ ${baht(keyed)} ต่างจากสูตร ${baht(Math.abs(keyed-autoP))} คน</span>`)
+`<br>ทะเบียนหลักสูตร: ปิดงานแล้วรวม <b>${baht(reg)}</b> คน · เฉพาะรุ่นที่กรมฯ รับรองแล้ว <b>${baht(regD)}</b> คน`
+(regD===keyed?' <span style="color:var(--ok)">· ตรงกับที่กรมฯ รับรอง ✓</span>'
:` <span style="color:var(--over)">· ต่างจากที่กรมฯ รับรอง ${baht(Math.abs(regD-keyed))} คน — ตรวจทานอีกครั้ง</span>`);
}
function paintDsd(){
syncPassSkill(false);
const ms=[...el("d-months").querySelectorAll(".dm")].map(i=>+i.value||0);
const k=dsdCalc({months:ms,sent:+el("d-sent").value||0,repeatTimes:+el("d-rt").value||0,goal:+el("d-goal").value||0,fundPaid:+el("d-fund").value||0});
el("d-calc").innerHTML=`<div class="dcalc">
<div><span>พนักงานเฉลี่ย</span><b>${k.avg?baht(k.avg):"—"}</b></div>
<div><span>เกณฑ์ ${LAWPCT}%</span><b>${k.target?baht(k.target):"—"}</b></div>
${k.goal>LAWPCT?`<div><span>เป้าเรา ${k.goal}%</span><b style="color:var(--accent)">${k.goalTarget?baht(k.goalTarget):"—"}</b></div>`:""}
<div><span>C = A − B</span><b>${baht(k.C)}</b></div>
<div><span>คิดเป็น %</span><b style="color:${k.avg?(k.pct>=50?"var(--ok)":"var(--over)"):"inherit"}">${k.avg?k.pct+"%":"—"}</b></div>
<div><span>ต้องฝึกอีก</span><b style="color:${k.need?"var(--over)":"var(--ok)"}">${k.avg?(k.need?baht(k.need)+" คน":"ครบแล้ว"):"—"}</b></div>
${k.goal>LAWPCT?`<div><span>ถึงเป้าเรา</span><b style="color:${k.needGoal?"var(--accent)":"var(--ok)"}">${k.avg?(k.needGoal?"อีก "+baht(k.needGoal)+" คน":"ถึงแล้ว"):"—"}</b></div>`:""}
<div><span>เงินอุดหนุน (เกิน ${subPct()}%)</span><b style="color:${k.sub.amount?"var(--ok)":"var(--ink-3)"}">${k.avg?(k.sub.amount?baht(k.sub.amount)+" ฿":"ยังไม่ถึงเกณฑ์"):"—"}</b></div>
<div><span>ทดสอบมาตรฐาน</span><b style="color:${k.sub.stdAmt?"var(--ok)":"var(--ink-3)"}">${k.sub.stdAmt?baht(k.sub.stdAmt)+" ฿":"—"}</b></div>
<div><span>คืนเงินสมทบ 10%</span><b style="color:${k.sub.fundAmt?"var(--ok)":"var(--ink-3)"}">${k.sub.fundAmt?baht(k.sub.fundAmt)+" ฿":"—"}</b></div>
<div><span>รวมคาดว่าได้คืน</span><b style="color:${k.sub.total?"var(--ok)":"var(--ink-3)"}">${k.sub.total?baht(k.sub.total)+" ฿":"—"}</b></div></div>`;
}
el("d-ps").addEventListener("input",()=>{el("d-ps").dataset.auto="0";});
el("ddlg").addEventListener("input",e=>{ if(e.target.closest("#ddlg"))paintDsd(); });
el("dcancel").onclick=()=>el("ddlg").close();
el("dsave").onclick=async()=>{
if(!editingDsd)return;
const {ck,y}=editingDsd;
const months=[...el("d-months").querySelectorAll(".dm")].map(i=>i.value===""?"":(+i.value||0));
hrdata.dsd=hrdata.dsd||{}; hrdata.dsd[ck]=hrdata.dsd[ck]||{};
hrdata.dsd[ck][y]={updatedAt:new Date().toISOString(),id:el("d-id").value.trim(),months,goal:+el("d-goal").value||0,
sent:+el("d-sent").value||0,repeatPersons:+el("d-rp").value||0,repeatTimes:+el("d-rt").value||0,
passSkill:+el("d-ps").value||0,fundPaid:+el("d-fund").value||0,
st2:el("d-st2").value,st2date:el("d-st2date").value,st2no:el("d-st2no").value.trim(),st2note:el("d-st2note").value.trim()};
el("ddlg").close(); render(); await saveHR();
};
el("ddel").onclick=async()=>{
if(!editingDsd)return; const {ck,y}=editingDsd; el("ddlg").close();
if(!await ask("ลบข้อมูลกรมพัฒนาฯ ของบริษัทนี้ในปี "+(y+543)+" ใช่ไหมคะ?","ลบข้อมูล"))return;
if(hrdata.dsd&&hrdata.dsd[ck])delete hrdata.dsd[ck][y];
render(); await saveHR();
};
let editingLegal=null;
function openLegal(L){
editingLegal=L;
el("ldlgh").textContent=L?"แก้ไขรายการกฎหมาย":"เพิ่มรายการกฎหมาย";
el("ldel").style.display=L?"":"none";
el("l-title").value=L?.title||"";
fill("l-cat",LEGALCAT.map(x=>[x,x]),L?.cat||LEGALCAT[0]);
el("l-unit").value=L?.unit||"";
el("l-person").value=L?.person||"";
el("l-comps").innerHTML=visible(companies).map(c=>`<label class="flag" style="padding:8px 12px"><input type="checkbox" value="${esc(c.key)}"${(L?.comps||[]).includes(c.key)?" checked":""}><span style="font-size:13.5px">${esc(c.label)}</span></label>`).join("")||`<div class="hint" style="margin:0">ยังไม่มีบริษัท เพิ่มที่หน้าตั้งค่า</div>`;
el("l-issued").value=L?.issued||"";
el("l-expires").value=L?.expires||"";
fill("l-cycle",CYCLES,String(L?.cycle||""));
el("l-life").checked=!!L?.lifetime;
el("l-note").value=L?.note||"";
el("ldlg").showModal();
}
el("lcancel").onclick=()=>el("ldlg").close();
el("lsave").onclick=async()=>{
if(!el("l-title").value.trim()){el("l-title").focus();return;}
const data={title:el("l-title").value.trim(), cat:el("l-cat").value, unit:el("l-unit").value.trim(),
person:el("l-person").value.trim(),
comps:[...el("l-comps").querySelectorAll("input:checked")].map(i=>i.value),
issued:el("l-issued").value||null, expires:el("l-expires").value||null,
cycle:+el("l-cycle").value||0, lifetime:el("l-life").checked, note:el("l-note").value.trim()};
el("ldlg").close();
try{ editingLegal? await DB.collection("legal").doc(editingLegal._id).set(data) : await DB.collection("legal").add(data); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?'<div style="font-size:13px;margin-top:8px;line-height:1.7">'+x.fix+"</div>":"")); }
};
el("ldel").onclick=async()=>{
if(!editingLegal)return; const L=editingLegal; el("ldlg").close();
if(!await ask("ลบรายการ “"+esc(L.title)+"” ใช่ไหมคะ?","ลบรายการ"))return;
await softDel("legal",L);
};
function openTx(x){
editingTx=x;
el("tdlgh").textContent=x?"แก้ไขรายการเงิน":"บันทึกรายการเงิน";
el("tdel").style.display=x?"":"none";
el("t-kind").value=x?.kind||"expense";
el("t-date").value=x?.date||new Date().toISOString().slice(0,10);
fill("t-gl",visible(gls).length?visible(gls).map(g=>[g.key,glLabel(g.key)]):[["","— ยังไม่มีหมวด GL —"]],x?.gl||"");
el("t-amount").value=x?.amount||"";
fill("t-company",[["","— ไม่ระบุ —"],...visible(companies).map(c=>[c.key,c.label])],x?.company||"");
fill("t-task",[["","— ไม่ผูกงาน —"],...items.map(t=>[t._id,t.title])],x?.taskId||"");
el("t-note").value=x?.note||"";
el("tdlg").showModal();
}
el("tcancel").onclick=()=>el("tdlg").close();
el("tsave").onclick=async()=>{
const amt=+el("t-amount").value||0;
if(!amt){el("t-amount").focus();return;}
const data={kind:el("t-kind").value, date:el("t-date").value, gl:el("t-gl").value,
amount:amt, company:el("t-company").value, taskId:el("t-task").value, note:el("t-note").value.trim()};
el("tdlg").close();
if(!DB)return;
try{ editingTx?await DB.collection("ledger").doc(editingTx._id).set(data):await DB.collection("ledger").add(data); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); }
};
el("tdel").onclick=async()=>{
if(!editingTx)return;
const x=editingTx; el("tdlg").close();
if(!await ask("ลบรายการเงินนี้ใช่ไหมคะ?","ลบรายการ"))return;
await softDel("ledger",x);
};
let gateMode="setup";

// ===== การ์ดดูงาน (เปิดงานเดิม → ดูก่อน แล้วกด "แก้ไข" ค่อยเข้าฟอร์ม) =====
let cardItem=null;
// ตัวช่วยสร้างการ์ด (ใช้ร่วมกันทุกหน้า)
const cV=(label,val,wide)=>{
const has=!(val===undefined||val===null||String(val).trim()==="");
return `<div class="vf${wide?" w":""}"><span>${esc(label)}</span><b class="${has?"":"mut"}">${has?esc(String(val)):"—"}</b></div>`;};
const cR=(label,val,wide)=>(val===undefined||val===null||String(val).trim()==="")?"":cV(label,val,wide);
const cH=(label,html,wide)=>`<div class="vf${wide?" w":""}"><span>${esc(label)}</span><b>${html}</b></div>`;
const cS=(title,inner)=>inner.trim()?`<div class="vsec"><h4>${esc(title)}</h4><div class="vgrid">${inner}</div></div>`:"";
let cardCtx=null;
function cardShow(o){
cardCtx=o;
el("vc-kind").textContent=o.kind||""; el("vc-date").textContent=o.date||"";
el("vc-bar").style.background=o.color||"var(--accent-2)";
el("vc-title").textContent=o.title||"(ไม่มีชื่อ)";
el("vc-pills").innerHTML=o.pills||""; el("vc-body").innerHTML=o.body||"";
el("vc-del").style.display=o.del?"":"none";
if(!el("cardlg").open)el("cardlg").showModal();
}
let cardOcc="";   // วันที่ (รอบ) ที่การ์ดกำลังพูดถึง — ใช้กับงานที่เกิดซ้ำ
function openCard(t,occIso){
if(!t)return;
cardItem=t;
const kind=kindOfItem(t)||(isTrain(t)?"train":isMeet(t)?"meet":"");
const V=cV,R_=cR,sec=cS;
let S=occState(t);
// งานเกิดซ้ำ: การ์ดแสดง "รอบวันที่..." พร้อมสถานะของรอบนั้นโดยเฉพาะ
let O=null; cardOcc="";
if(rr(t)){ if(occIso&&occursOn(t,isoDate(occIso)))O=isoDate(occIso); else if(S.d)O=S.d; else{ const l=occList(t,new Date(new Date().getFullYear(),new Date().getMonth()-1,1),6); O=l.find(d=>d>=new Date(new Date().setHours(0,0,0,0)))||l[l.length-1]||null; }
if(O){ cardOcc=isoOf(O); const st=occStat(t,O), od=O<new Date(new Date().setHours(0,0,0,0))&&isOpenStatus(st);
S={label:od?"ค้างรอบนี้":st,cls:od?"s-over":sCls(st),recur:true,d:O,st}; } }
const _kind=KINDLAB[kind]||"งาน", _date=(t.code?t.code+" · ":"")+(O?"รอบวันที่ "+O.getDate()+" "+MTH[O.getMonth()]+" "+(O.getFullYear()+543)+" · "+rruleText(t):(t.date?fmtDate(t.date)+" "+(new Date(t.date).getFullYear()+543):(rr(t)?rruleText(t):"")));
const _pills=`<span class="pill ${S.cls}">${esc(S.label)}</span>`+(quadOf(t)?` <b class="qtag q-${quadOf(t)}">${quadOf(t).slice(1)} ${esc(quadInfo(quadOf(t))[1])}</b>`:"");
const main=R_("บริษัท",t.company?cLabel(t.company):"")+R_("กลุ่มงาน",t.track?gLabel(t.track):"")
+R_("ประเภท",t.type)+R_("ป้ายกำกับ",t.tag)+R_("รหัสอ้างอิง",t.code);
const when=V("ผู้รับผิดชอบ",t.owner)+V(rr(t)?"เริ่ม / วันที่อ้างอิง":"วันที่",t.date?fmtDate(t.date)+" "+(new Date(t.date).getFullYear()+543):"")
+(rr(t)?V("การเกิดซ้ำ",rruleText(t)):R_("รอบงาน",t.recurring))
+(rr(t)&&t.recurring?R_("หมายเหตุรอบงาน",t.recurring):"")
+R_("เดือนที่มีงาน",(t.months||[]).map(m=>MTH[m-1]).join(" "),true);
const meet=isMeet(t)&&kind!=="proj"&&kind!=="act"?sec("ข้อมูลการประชุม",R_("เวลาเริ่ม",tShow(t.time))+R_("สถานที่ / ลิงก์",t.place)+R_("ผู้เข้าร่วม / ประธาน",t.attendees)
+R_("เตรียมข้อมูลล่วงหน้า",+t.prepDays?t.prepDays+" วัน":"")+R_("สิ่งที่ต้องเตรียม",t.prepNote,true)):"";
const train=isTrain(t)&&kind!=="proj"&&kind!=="act"?sec("ข้อมูลการฝึกอบรม",
R_("หลักสูตร",crsCodeOf(t))+R_("รุ่นที่",t.batch?(t.batch+(+t.batches>1?" / "+t.batches:"")):"")
+R_("ผู้เข้าอบรม",t.pax?t.pax+" คน":"")+R_("ชั่วโมงต่อคน",t.hours)+R_("วิทยากร / สถาบัน",t.vendor)+R_("สถานที่",t.place)
+R_("หมวดทักษะ",t.skill)+R_("รูปแบบ",t.mode)+R_("ยื่นกรมพัฒนาฝีมือแรงงาน",t.dsd)+R_("แบบที่ยื่น (ยป.)",t.yp)
+R_("วันที่ฝึกเสร็จสิ้น",t.dsdEnd?fmtDate(t.dsdEnd):"")+R_("วันที่ยื่นขอเปิด",t.dsdOpenDate?fmtDate(t.dsdOpenDate):"")+R_("เลขคำขอเปิด",t.dsdOpenNo)
+R_("วันที่ยื่นรับรองรุ่น",t.dsdCertDate?fmtDate(t.dsdCertDate):"")+R_("เลขคำขอรับรอง",t.dsdCertNo)):"";
const chips=a=>chkList(a).length?`<div class="vf w"><span>${a===t.ms?"ขั้นตอนย่อย":"ของที่ต้องเตรียม"}</span><div class="vchips">${chkList(a).map(x=>`<em>${x.d?"✓ ":"○ "}${esc(x.t)}</em>`).join("")}</div></div>`:"";
const pv=(t.prog!==undefined&&t.prog!==null&&t.prog!=="")?Math.max(0,Math.min(100,+t.prog||0)):null;
const proj=kind==="proj"?sec("รายละเอียดโปรเจค",R_("วันเริ่ม",t.pstart?fmtDate(t.pstart):"")+R_("กำหนดเสร็จ",t.pend?fmtDate(t.pend):"")+R_("ทีมงาน",t.team)
+(pv!==null?`<div class="vf"><span>ความคืบหน้า</span><b>${pv}%</b><div class="vbar"><i style="width:${pv}%"></i></div></div>`:"")
+R_("เป้าหมาย",t.pgoal,true)+R_("อุปสรรค / ความเสี่ยง",t.prisk,true)+chips(t.ms)):"";
const act=kind==="act"?sec("รายละเอียดกิจกรรม",R_("เวลา",(t.astart?tShow(t.astart):"")+(t.aend?" – "+tShow(t.aend):""))+R_("สถานที่",t.aplace)
+R_("ผู้เข้าร่วม (เป้า)",t.apax?t.apax+" คน":"")+R_("ผู้เข้าร่วม (จริง)",t.apaxreal?t.apaxreal+" คน":"")+R_("ผู้จัด / ผู้รับเหมา",t.aorg)+chips(t.aprep)):"";
const glL=(g,b)=>g?`${glLabel(glKeyOf(g))}${+b?" · "+baht(b)+" ฿":""}`:"";
const money=sec("งบประมาณ",R_("หมวด GL หลัก",glL(t.gl1,t.b1),true)+R_("หมวด GL รอง",glL(t.gl2,t.b2),true)
+R_("งบรวม",budgetOf(t)?baht(budgetOf(t))+" ฿":"")+R_("ใช้จริง",+t.actual?baht(t.actual)+" ฿":""));
const k5=isTrain(t)?"train":isMeet(t)?"meet":"task", L5=W5LAB[k5];
const w5=sec("5W1H",R_(L5[0],t.why,true)+R_(L5[2],t.inv,true)+(k5==="task"?R_("Where · สถานที่ / ระบบ / ลิงก์",t.whr,true):"")+R_(L5[4],t.how,true));
const note=R_("",t.note,true)?sec("รายละเอียด",V("หมายเหตุ",t.note,true)):"";
const _o=rr(t)?S.d:null, _isoO=_o?isoOf(_o):"";
const curSt=_o?S.st:normSt(t.status);
const quick=`<div class="vsec vquick"><h4>${_o?`สถานะ · รอบวันที่ ${_o.getDate()} ${MTH[_o.getMonth()]}`:"สถานะ"}${_o?`<span class="vq-nav"><button type="button" data-vqnav="-1" title="รอบก่อนหน้า">${svg('<path d="M15 6l-6 6 6 6"/>',14)}</button><button type="button" data-vqnav="1" title="รอบถัดไป">${svg('<path d="M9 6l6 6-6 6"/>',14)}</button></span>`:""}</h4><div class="vq-row">
${rr(t)&&_o?(curSt!==STATUS_DONE&&curSt!==STATUS_CANCEL?`<button type="button" class="btn vq-big ok" data-vqocc="${_isoO}">${svg(ICON.check,15)} ปิดรอบ ${_o.getDate()} ${MTH[_o.getMonth()]}</button>`:"")
:(!rr(t)&&t.status!==STATUS_DONE?`<button type="button" class="btn vq-big ok" data-vqst="${STATUS_DONE}">${svg(ICON.check,15)} เสร็จแล้ว</button>`:"")}
<div class="vq-chips">${STATUS.map(x=>`<button type="button" class="vq ${sCls(x)}${x===curSt?" on":""}" data-vqst="${x}">${esc(x)}</button>`).join("")}</div></div>
${rr(t)?`<div class="hint" style="margin:6px 0 0;font-size:11.5px">${t.status===STATUS_CANCEL?"ยกเลิกทั้งซีรีส์อยู่ — เลือกสถานะอื่นเพื่อเปิดงานนี้กลับมา · ":""}สถานะมีผลเฉพาะรอบวันที่ ${_o?_o.getDate()+" "+MTH[_o.getMonth()]:"—"} รอบอื่นไม่กระทบ · ตอนกด “ยกเลิก” เลือกได้ว่าจะยกเลิกแค่รอบนี้ หรือรอบนี้เป็นต้นไป หรือทุกรอบ</div>`:""}</div>`;
cardShow({kind:_kind,date:_date,title:t.title,color:({"s-done":"var(--ok)","s-over":"var(--over)","s-run":"var(--run)","s-cancel":"var(--ink-3)"})[S.cls]||"var(--wait)",pills:_pills,body:quick+sec("รายละเอียด",when+main)+meet+train+proj+act+money+w5+note,
edit:()=>open_(t),del:async()=>{
if(!await ask("ย้าย “"+esc(t.title)+"” ไปถังขยะใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--ink-3)\">กู้คืนได้ภายใน 30 วันที่ ตั้งค่า › ถังขยะ</div>","ย้ายไปถังขยะ"))return;
await softDel("items",t);}});
}
el("vc-close").onclick=()=>el("cardlg").close();
el("vc-edit").onclick=()=>{const k=cardCtx; el("cardlg").close(); if(k&&k.edit)setTimeout(k.edit,60);};
el("vc-del").onclick=()=>{const k=cardCtx; el("cardlg").close(); if(k&&k.del)k.del();};
async function cardSave(patch){
const t=cardItem; if(!t)return;
const {_id,...rest}=t;
const occKeep=cardOcc;
try{ await saveItem({...rest,...patch},_id); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); return; }
const f=items.find(x=>x._id===_id)||{...t,...patch,_id};
openCard(f,occKeep);
}
// ถามขอบเขตตอนยกเลิกงานที่เกิดซ้ำ (เหมือน Google Calendar: รอบนี้ / รอบนี้และต่อจากนี้ / ทุกรอบ)
function askScope(title,opts){
el("sc-title").textContent=title;
el("sc-opts").innerHTML=opts.map((o,i)=>`<label class="scopeopt"><input type="radio" name="scopev" value="${esc(o.v)}"${i===0?" checked":""}><span><b>${esc(o.l)}</b>${o.s?`<small>${esc(o.s)}</small>`:""}</span></label>`).join("");
el("scopedlg").showModal();
return new Promise(r=>{ scopeResolve=r; });
}
let scopeResolve=null;
el("sc-ok").onclick=()=>{ const v=(el("sc-opts").querySelector("input:checked")||{}).value||null; el("scopedlg").close(); const r=scopeResolve; scopeResolve=null; r&&r(v); };
el("sc-no").onclick=()=>{ el("scopedlg").close(); const r=scopeResolve; scopeResolve=null; r&&r(null); };
el("scopedlg").addEventListener("cancel",()=>{ const r=scopeResolve; scopeResolve=null; r&&r(null); });
async function cardOccStatus(st){
const t=cardItem; if(!t)return;
const iso=cardOcc; if(!iso){ cardSave({status:st}); return; }
const dl=isoDate(iso), lab=dl.getDate()+" "+MTH[dl.getMonth()]+" "+(dl.getFullYear()+543);
if(st!==STATUS_CANCEL){ cardSave(occPatch(t,iso,st)); return; }
const start=t.date||"";
const v=await askScope("ยกเลิก “"+t.title+"”",[
{v:"this",l:"เฉพาะรอบนี้ ("+lab+")",s:"รอบอื่นๆ ยังอยู่ตามปกติ"},
{v:"following",l:"รอบนี้และรอบต่อจากนี้ทั้งหมด",s:"รอบก่อนหน้าไม่เปลี่ยน · จบการเกิดซ้ำตั้งแต่ "+lab},
{v:"all",l:"ทุกรอบ (ยกเลิกทั้งงาน)",s:"ทุกรอบกลายเป็นยกเลิก"}]);
if(!v)return;
if(v==="this")cardSave(occPatch(t,iso,STATUS_CANCEL));
else if(v==="all")cardSave({status:STATUS_CANCEL});
else{
if(start&&iso<=start)cardSave({status:STATUS_CANCEL});
else cardSave({rrule:{...rr(t),until:occPrevDay(iso)}});
}
}
el("vc-body").onclick=e=>{
const b=e.target.closest("button"); if(!b||!cardItem)return;
if(b.dataset.vqst){ if(rr(cardItem))cardOccStatus(b.dataset.vqst); else cardSave({status:b.dataset.vqst}); }
else if(b.dataset.vqocc){ cardSave(occPatch(cardItem,b.dataset.vqocc,STATUS_DONE)); }
else if(b.dataset.vqnav){ const dir=+b.dataset.vqnav, cur=cardOcc?isoDate(cardOcc):new Date();
const base=new Date(cur.getFullYear(),cur.getMonth()-4,1), l=occList(cardItem,base,9);
const nx=dir<0?l.filter(d=>d<cur).pop():l.find(d=>d>cur);
if(nx)openCard(cardItem,isoOf(nx)); else setFoot("ไม่มีรอบที่"+(dir<0?"ก่อนหน้า":"ถัดไป")+"แล้วค่ะ"); }
};

// ===== การ์ดดู: Index / กฎหมาย / รายการเงิน =====
function openIdxCard(x){
if(!x)return;
const st=x.status||"ใช้งานอยู่";
const pc=st==="ใช้งานอยู่"?"s-done":st==="กำลังพัฒนา"?"s-run":"s-cancel";
const link=x.url?cH("ลิงก์",`<a href="${esc(x.url)}" target="_blank" rel="noopener" class="lklink">${esc(x.url.replace(/^https?:\/\//,"").slice(0,60))}</a>`,true):cV("ลิงก์","",true);
cardShow({kind:"Index Online",date:(x.group||"").trim()||"ไม่ระบุหมวด",title:x.title,
color:st==="ใช้งานอยู่"?"var(--ok)":st==="กำลังพัฒนา"?"var(--run)":"var(--line)",
pills:`<span class="pill ${pc}">${esc(st)}</span>`,
body:cS("ข้อมูลหลัก",link+cR("ผู้ดูแล",x.owner)+cR("หมายเหตุ",x.note))
+cS("ใช้ทำอะไร",cR("ใช้ทำอะไร (What / Why)",x.iuse,true)+cR("ใครใช้",x.iwho)+cR("ใช้เมื่อไหร่",x.iwhen)+cR("ขั้นตอนใช้งาน (How)",x.detail,true)),
edit:()=>openIdx(x),
del:async()=>{ if(!await ask("ลบ “"+esc(x.title)+"” ใช่ไหมคะ?","ลบรายการ"))return; await softDel("index",x);}});
}
function openLegalCard(L){
if(!L)return;
const S=legalState(L), d=legalDue(L);
const cyc=(CYCLES.find(v=>v[0]===String(L.cycle||""))||["",""])[1];
const yr=v=>fmtDate(v)+" "+(new Date(v).getFullYear()+543);
const comps=(L.comps||[]).length?cH("บริษัทที่ต้องมี",`<div class="vchips">${L.comps.map(k=>`<em>${esc(cLabel(k))}</em>`).join("")}</div>`,true):"";
cardShow({kind:"กฎหมาย & ใบรับรอง",date:L.lifetime?"ไม่มีวันหมดอายุ":(d?"ครบกำหนด "+yr(d):""),title:L.title,
color:S.c==="s-over"?"var(--over)":S.c==="s-run"?"var(--run)":S.c==="s-done"?"var(--ok)":"var(--wait)",
pills:`<span class="pill ${S.c}">${esc(S.t)}</span>`+(L.cat?` <span class="tag">${esc(L.cat)}</span>`:""),
body:cS("ผู้รับผิดชอบ",cV("ผู้รับผิดชอบปัจจุบัน",L.person)+cR("ตำแหน่ง / หน่วยงาน",L.unit)+comps)
+cS("วันที่",cR("วันที่ออก / แต่งตั้ง",L.issued?yr(L.issued):"")+cR("ครบกำหนด",L.lifetime?"ไม่มีกำหนด":(d?yr(d):""))+cR("รอบทบทวน / ต่ออายุ",cyc&&String(L.cycle)?cyc:""))
+cS("เงื่อนไขตามกฎหมาย",cR("เงื่อนไข / หมายเหตุ",L.note,true)),
edit:()=>openLegal(L),
del:async()=>{ if(!await ask("ลบรายการ “"+esc(L.title)+"” ใช่ไหมคะ?","ลบรายการ"))return; await softDel("legal",L);}});
}
function openTxCard(x){
if(!x)return;
const inc=x.kind==="income", t=x.taskId?items.find(v=>v._id===x.taskId):null;
cardShow({kind:inc?"รายรับ":"รายจ่าย",date:x.date?fmtDate(x.date)+" "+(new Date(x.date).getFullYear()+543):"",
title:(inc?"+ ":"− ")+baht(x.amount)+" ฿",color:inc?"var(--ok)":"var(--run)",
pills:x.company?`<span class="tag">${esc(cLabel(x.company))}</span>`:"",
body:cS("รายละเอียด",cR("หมวด GL",x.gl?glLabel(x.gl):"",true)+cR("บริษัท",x.company?cLabel(x.company):"")+cR("งานที่ผูกไว้",t?t.title:"")+cR("หมายเหตุ",x.note,true)),
edit:()=>openTx(x),
del:async()=>{ if(!await ask("ลบรายการเงินนี้ใช่ไหมคะ?","ลบรายการ"))return; await softDel("ledger",x);}});
}

// ===== ฟอร์มงาน: พับ/ขยายแต่ละหมวด =====
const foldSecs=()=>[...document.querySelectorAll("#dlg .fsec")];
function foldHdr(sec){ const h=sec.querySelector(".fsh"); return h; }
function foldCount(sec){
let n=0;
sec.querySelectorAll("input,textarea").forEach(i=>{
if(i.closest("[hidden]"))return;
if(i.type==="checkbox"){ if(i.checked&&!i.closest("#f-colors"))n++; return; }
if(i.type==="button"||i.type==="hidden")return;
if(String(i.value||"").trim())n++; });
return n;
}
function foldPaint(sec){
const h=foldHdr(sec); if(!h)return;
let c=h.querySelector(".fcnt"); if(!c){ c=document.createElement("em"); c.className="fcnt"; h.appendChild(c); }
const n=foldCount(sec);
c.textContent=sec.classList.contains("fold")&&n?"กรอกแล้ว "+n+" ช่อง":"";
}
function foldSet(sec,open){
const h=foldHdr(sec); if(!h)return;
sec.classList.toggle("fold",!open);
h.setAttribute("aria-expanded",open?"true":"false");
foldPaint(sec);
}
function foldOpen(elm){ const sec=elm&&elm.closest(".fsec"); if(sec&&sec.classList.contains("fold"))foldSet(sec,true); }
function foldInit(t){
const secs=foldSecs();
secs.forEach(sec=>{
const h=foldHdr(sec); if(!h)return;
const holder=h.parentElement===sec?h:h.parentElement; holder.classList.add("fhold");
h.setAttribute("role","button"); h.setAttribute("tabindex","0");
if(!h._f){ h._f=1;
const tg=()=>{ foldSet(sec,sec.classList.contains("fold")); };
h.onclick=tg; h.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); tg(); } };
}
});
// ค่าเริ่มต้น: หมวดงบ / รายละเอียดเพิ่มเติม พับไว้ถ้ายังว่าง
secs.forEach(sec=>{
const isMoney=!!sec.querySelector("#f-gl1"), isMore=!!sec.querySelector("#wrap-5w");
let open=true;
if(isMoney)open=!!(t&&(t.gl1||t.gl2||+t.b1||+t.b2||+t.actual));
if(isMore)open=!!(genMode||(t&&(t.note||w5Has(t))));
foldSet(sec,open);
});
}
el("dlg").addEventListener("input",e=>{ const s=e.target.closest&&e.target.closest(".fsec"); if(s&&s.classList.contains("fold"))foldPaint(s); });
el("foldAll").onclick=()=>foldSecs().forEach(s=>foldSet(s,false));
el("unfoldAll").onclick=()=>foldSecs().forEach(s=>foldSet(s,true));
