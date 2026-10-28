function wire(){
el("pushOn")&&(el("pushOn").onclick=pushOn); el("pushOff")&&(el("pushOff").onclick=pushOff);
el("pushTest")&&(el("pushTest").onclick=()=>pushCall("test")); el("pushDigest")&&(el("pushDigest").onclick=()=>pushCall("digest"));
el("pushGen")&&(el("pushGen").onclick=pushGenKeys); el("pushPing")&&(el("pushPing").onclick=pushPing);
el("pushCopy")&&(el("pushCopy").onclick=async()=>{ try{ await navigator.clipboard.writeText(el("pushKeys").innerText); setFoot("คัดลอกคีย์แล้ว"); }catch(e){ setFoot("คัดลอกไม่ได้ — ลากเลือกข้อความเอง"); } });
document.querySelectorAll("[data-gapf]").forEach(b=>b.onclick=()=>{ R.gapF=b.dataset.gapf===R.gapF?"":b.dataset.gapf; render(); });
if(el("gapAI"))el("gapAI").onclick=()=>{ AI.open=false; aiGo("ai"); aiSend("/5w1h"); };
if(el("bkNow"))el("bkNow").onclick=()=>{ const p=bkDownload(); setFoot("สำรองแล้ว "+(p.items.length+p.ledger.length+p.legal.length+p.index.length+p.note.length)+" รายการ"); render(); };
if(el("bkLater"))el("bkLater").onclick=()=>{ const d=new Date(); d.setDate(d.getDate()+1); try{ localStorage.setItem("sw-bksnooze",isoOf(d)); }catch(e){} render(); };
document.querySelectorAll("[data-go]").forEach(n=>{n.style.cursor="pointer";
n.onclick=e=>{e.stopPropagation();
try{const d=JSON.parse(n.dataset.go);
 if(d.id){const t=items.find(x=>x._id===d.id); if(t){openCard(t);return;}}
 if(d.lg){const L=legal.find(x=>x._id===d.lg); if(L){openLegalCard(L);return;}}
 goTo(d.v,{F:d.F,R:d.R});}catch(err){}};});
document.querySelectorAll("[data-list]").forEach(n=>{n.style.cursor="pointer";
n.onclick=e=>{e.stopPropagation();openListBox(n.dataset.list);};});
el("pclose")&&(el("pclose").onclick=()=>el("pdlg").close());
document.querySelectorAll("[data-skipnow]").forEach(b=>b.onclick=async e=>{
e.stopPropagation();
const [id,iso]=b.dataset.skipnow.split("|");
const t=items.find(x=>x._id===id); if(!t)return;
const skip=[...(t.skip||[])];
const i=skip.indexOf(iso); if(i>=0)skip.splice(i,1); else skip.push(iso);
const {_id,...rest}=t;
try{ await saveItem({...rest,skip},_id); setFoot(i>=0?"กลับมาจัดรอบนี้ตามเดิม":"งดรอบ "+iso+" แล้ว รอบอื่นไม่กระทบ"); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); }
});
document.querySelectorAll("[data-done]").forEach(b=>b.onclick=async e=>{
e.stopPropagation();
const [id,iso]=b.dataset.done.split("|");
const t=items.find(x=>x._id===id); if(!t)return;
const patchD=occPatch(t,iso,occStat(t,isoDate(iso))===STATUS_DONE?"รอดำเนินการ":STATUS_DONE);
const {_id,...rest}=t;
try{ await saveItem({...rest,...patchD},_id); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); }
});
el("add")&&(el("add").onclick=()=>openPick());
el("addTx")&&(el("addTx").onclick=()=>openTx(null));
el("addLegal")&&(el("addLegal").onclick=()=>openLegal(null));
el("addIdx")&&(el("addIdx").onclick=()=>openIdx(null));
document.querySelectorAll("[data-mx]").forEach(n=>n.onclick=e=>{
const qm=e.target.closest("[data-qm]");
if(qm){ e.stopPropagation(); const [id,q]=qm.dataset.qm.split(":"); DB.collection("items").doc(id).set({quad:q||""},{merge:true}).catch(err=>{const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>");}); return; }
const t=items.find(v=>v._id===n.dataset.mx); if(t)openCard(t);});
el("addNote")&&(el("addNote").onclick=()=>openNote(null));
document.querySelectorAll("[data-ix]").forEach(n=>n.onclick=e=>{
if(e.target.closest("[data-stop]"))return;
const x=idx.find(v=>v._id===n.dataset.ix); if(x)openIdxCard(x);});
el("addInk")&&(el("addInk").onclick=()=>inkGallery("new"));
el("addBoard")&&(el("addBoard").onclick=()=>inkNew({mode:"board"}));
noteFolderWire();
document.querySelectorAll("[data-nt]").forEach(n=>n.onclick=e=>{
const x=notes.find(v=>v._id===n.dataset.nt); if(!x)return;
if(x.kind===INKKIND){ inkOpen(x); return; }
if(e.target.closest("[data-ntedit]")){ openNote(x); return; }
viewNote(x);});
el("ix-q")&&(el("ix-q").oninput=e=>{const v=e.target.value,p=e.target.selectionStart;R.idxQ=v;render();const m=el("ix-q"); if(m){m.focus();m.setSelectionRange(p,p);}});
el("ix-sort")&&(el("ix-sort").onclick=()=>{ R.idxSort=!R.idxSort; render(); });
document.querySelectorAll("[data-ixfav]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); ixToggleFav(b.dataset.ixfav); });
document.querySelectorAll("[data-ixmv]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const [id,d]=b.dataset.ixmv.split(":"); ixMove("c",id,d); });
document.querySelectorAll("[data-ixfmv]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const [id,d]=b.dataset.ixfmv.split(":"); ixMove("f",id,d); });
ixDnd();
el("ix-collapse")&&(el("ix-collapse").onclick=()=>{ IDXFOLD=new Set([...idxCatNames(),IDX_NONE]); idxSaveFold(); render(); });
el("ix-expand")&&(el("ix-expand").onclick=()=>{ IDXFOLD=new Set(); idxSaveFold(); render(); });
el("ix-cats")&&(el("ix-cats").onclick=openIxCats);
document.querySelectorAll("[data-ixfold]").forEach(b=>b.onclick=()=>{ const k=b.dataset.ixfold; IDXFOLD.has(k)?IDXFOLD.delete(k):IDXFOLD.add(k); idxSaveFold(); render(); });
el("ix-status")&&(el("ix-status").onchange=e=>{R.idxStatus=e.target.value;render();});
el("nt-kind")&&(el("nt-kind").onchange=e=>{R.noteKind=e.target.value;render();});
el("pq")&&(el("pq").oninput=e=>{const v=e.target.value,p2=e.target.selectionStart;R.pq=v;render();
const m=el("pq"); if(m){m.focus();m.setSelectionRange(p2,p2);}});
el("nt-q")&&(el("nt-q").oninput=e=>{const v=e.target.value,p=e.target.selectionStart;R.noteQ=v;render();
const m=el("nt-q"); if(m){m.focus();m.setSelectionRange(p,p);}});
document.querySelectorAll("[data-lg]").forEach(n=>n.onclick=()=>{
const L=legal.find(x=>x._id===n.dataset.lg); if(L)openLegalCard(L);});
el("lg-comp")&&(el("lg-comp").onchange=e=>{R.legalComp=e.target.value;
const inCo=legal.filter(L=>!R.legalComp||(L.comps||[]).includes(R.legalComp));
if(R.legalCat&&!inCo.some(L=>L.cat===R.legalCat))R.legalCat="";
render();});
el("lg-cat")&&(el("lg-cat").onchange=e=>{R.legalCat=e.target.value;render();});
document.querySelectorAll("[data-id]").forEach(n=>{ if(n.dataset.nolink)return; n.onclick=()=>{
const t=items.find(x=>x._id===n.dataset.id); if(t)openCard(t,n.dataset.occ||"");};});
document.querySelectorAll("[data-tx]").forEach(n=>n.onclick=()=>{
const t=ledger.find(x=>x._id===n.dataset.tx); if(t)openTxCard(t);});
const sc=el("sc1");
if(sc){sc.onclick=e=>{const b=e.target.closest("button[data-sc]");if(!b)return;R.scope=b.dataset.sc;render();};
el("scMonth")&&(el("scMonth").onchange=e=>{R.month=+e.target.value;render();});}
["yrSel","yrSel2","yrSelB"].forEach(id=>{const n=el(id); if(n)n.onchange=e=>{R.year=+e.target.value;R.selDay=null;render();};});
document.querySelectorAll("[data-yr]").forEach(b=>b.onclick=()=>{
const d=+b.dataset.yr; R.year=d?Math.min(2199,Math.max(1900,R.year+d)):THISYEAR; R.selDay=null; render();});
const bs=el("budsc");
if(bs){bs.onclick=e=>{const b=e.target.closest("button[data-bs]");if(!b)return;R.budScope=b.dataset.bs;render();};
el("budMonth")&&(el("budMonth").onchange=e=>{R.budMonth=+e.target.value;render();});}
el("goNoDate")&&(el("goNoDate").onclick=()=>{
LISTBOX["noDate"]={title:"งานที่ยังไม่ได้ใส่วันที่หรือรอบซ้ำ",rows:items.filter(t=>!isSysRow(t)&&!monthsOf(t).length).map(t=>({
id:t._id,t1:t.title,t2:`${gLabel(t.track)}${t.company?" · "+cLabel(t.company):""}${t.owner?" · "+t.owner:""}`,
d:"—",p:t.status,pc:sCls(t.status)}))};
openListBox("noDate");});
el("calcol")&&(el("calcol").onclick=e=>{const b=e.target.closest("button[data-cc]");if(!b)return; try{localStorage.setItem("sw-calcolor",b.dataset.cc);}catch(err){} render();});
el("calmode")&&(el("calmode").onclick=e=>{const b=e.target.closest("button[data-cm]");if(!b)return;R.calMode=b.dataset.cm;R.selDay=null;render();});
el("calMonth")&&(el("calMonth").onchange=e=>{R.month=+e.target.value;R.selDay=null;render();});
el("pm")&&(el("pm").onclick=()=>{R.month=(R.month+11)%12;R.selDay=null;render();});
el("nm")&&(el("nm").onclick=()=>{R.month=(R.month+1)%12;R.selDay=null;render();});
el("clearDay")&&(el("clearDay").onclick=()=>{R.selDay=null;render();});
el("addOnDay")&&(el("addOnDay").onclick=()=>openPick());
if(el("addtag")){
el("addtag").onclick=async()=>{const v=el("newtag").value.trim();
if(!v){tell("ใส่ชื่อป้ายก่อนนะคะ");return;}
if(tagsOf().includes(v)){tell("มีป้ายนี้แล้วค่ะ");return;}
tagList=[...tagDefs(),{name:v,color:"",track:(el("newtagg")?el("newtagg").value:"")}]; el("newtag").value=""; render(); await saveMeta("tags",tagList);};}
el("fixcolor")&&(el("fixcolor").onclick=async()=>{
const list=items.filter(t=>t.color&&t.track&&gColor(t.track)&&t.color!==gColor(t.track));
if(!list.length)return;
if(!await ask(`ล้างสีเฉพาะตัวของ <b>${list.length}</b> งาน ให้กลับไปใช้สีของกลุ่มงาน ใช่ไหมคะ?<div style="font-size:13px;margin-top:8px">ข้อมูลอื่นไม่เปลี่ยน · ถ้าอยากให้งานไหนสีต่างจากกลุ่ม ตั้งใหม่ทีหลังได้</div>`,"ใช้สีตามกลุ่ม"))return;
let ok=0;
for(const t of list){ try{ const {_id,...r}=t; await saveItem(Object.assign({},r,{color:""}),_id); ok++; }catch(e){}
setFoot("กำลังปรับสี "+ok+"/"+list.length+" …"); }
render(); tell("<b>ปรับแล้ว "+ok+" งาน</b> ตอนนี้สีในปฏิทินตรงกับกลุ่มงานทั้งหมด");});
document.querySelectorAll("[data-gcol]").forEach(b=>b.onclick=async()=>{
const [k,c]=b.dataset.gcol.split("|");
const g=groups.find(x=>x.key===k); if(!g)return;
g.color=c; render(); await saveMeta("groups",groups);});
document.querySelectorAll("[data-tagtrack]").forEach(n=>n.onchange=async()=>{
const nm=n.dataset.tagtrack;
tagList=tagDefs().map(x=>x.name===nm?{name:x.name,color:x.color,track:n.value}:x);
render(); await saveMeta("tags",tagList);});

document.querySelectorAll("[data-rentag]").forEach(n=>n.onchange=async()=>{
const from=n.dataset.rentag, to=n.value.trim();
if(!to||to===from||!tagsOf().includes(from)||renameLock){render();return;}
if(tagsOf().includes(to)){tell("มีป้าย “"+esc(to)+"” อยู่แล้วค่ะ");render();return;}
renameLock=true; setTimeout(()=>renameLock=false,800);
tagList=tagDefs().map(x=>x.name===from?{name:to,color:x.color,track:x.track}:x);
await saveMeta("tags",tagList);
const list=items.filter(t=>(t.tag||"").trim()===from);
for(const t of list){try{const {_id,...rest}=t; await saveItem(Object.assign({},rest,{tag:to}),_id);}catch(e){}}
render(); setFoot("เปลี่ยนชื่อป้ายและอัปเดต "+list.length+" งานแล้ว");});
document.querySelectorAll("[data-deltag]").forEach(b=>b.onclick=async()=>{
const nm=b.dataset.deltag, n=tagUsed(nm);
if(!await ask("ลบป้าย “"+esc(nm)+"”"+(n?` — ป้ายจะหายจาก <b>${n}</b> งานด้วย`:"")+" ใช่ไหมคะ?","ลบป้าย"))return;
tagList=tagDefs().filter(x=>x.name!==nm); await saveMeta("tags",tagList);
const list=items.filter(t=>(t.tag||"").trim()===nm);
for(const t of list){try{const {_id,...rest}=t; await saveItem(Object.assign({},rest,{tag:""}),_id);}catch(e){}}
render();});
document.querySelectorAll("[data-day]").forEach(n=>n.onclick=()=>{
const d=+n.dataset.day; R.selDay=R.selDay===d?null:d; render();});
document.querySelectorAll("[data-restore]").forEach(b=>b.onclick=async()=>{
const [coll,id]=b.dataset.restore.split(":");
const t=(TRASH[coll]||[]).find(x=>x._id===id); if(!t)return;
await trashRestore(coll,t); render();});
document.querySelectorAll("[data-purge]").forEach(b=>b.onclick=async()=>{
const [coll,id]=b.dataset.purge.split(":");
const t=(TRASH[coll]||[]).find(x=>x._id===id); if(!t)return;
if(!await ask("ลบ “"+esc(trashTitle(coll,t))+"” <b>ถาวร</b> ใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--over)\">กู้กลับไม่ได้อีกแล้ว</div>","ลบถาวร"))return;
await trashPurge(coll,id); render();});
if(el("trashEmpty"))el("trashEmpty").onclick=async()=>{
const all=trashAll();
if(!await ask("ล้างถังขยะทั้งหมด <b>"+all.length+"</b> รายการ ใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--over)\">กู้กลับไม่ได้อีกแล้ว</div>","ล้างถังขยะ"))return;
let n=0; for(const {coll,t} of all){ try{ await trashPurge(coll,t._id); n++; setFoot("กำลังล้าง "+n+"/"+all.length+" …"); }catch(e){} }
render(); setFoot("ล้างถังขยะแล้ว "+n+" รายการ");};
el("settabs")&&(el("settabs").onclick=e=>{const b=e.target.closest("button[data-st]");if(!b)return;settab=b.dataset.st;healthState="idle";R.pq="";render();});
const bind=(id,key)=>{const n=el(id);if(!n)return;n.oninput=n.onchange=()=>{
F[key]=n.value;const p=n.selectionStart,srch=n.type==="search";render();
const m=el(id);if(m&&srch){m.focus();m.setSelectionRange(p,p);}};};
el("fl-track")&&(el("fl-track").addEventListener("change",()=>{
const v=el("fl-track").value;
if(F.type&&v&&!typesFor(v).includes(F.type)&&!items.some(t=>t.track===v&&(t.type||"")===F.type))F.type="";
}));
el("grpseg")&&(el("grpseg").onclick=e=>{const b=e.target.closest("button[data-grp]"); if(!b)return;
F.grp=b.dataset.grp; render();});
bind("q","q");bind("fl-track","track");bind("fl-type","type");bind("fl-status","status");bind("fl-company","company");
if(view==="ai")aiWire();
el("hlseg")&&(el("hlseg").onclick=e=>{const b=e.target.closest("button[data-hl]"); if(!b)return; setHL(b.dataset.hl); render();});
el("zoomseg")&&(el("zoomseg").onclick=e=>{const b=e.target.closest("button[data-zm]"); if(!b)return; setZoom(b.dataset.zm); render();});
el("modeseg")&&(el("modeseg").onclick=async e=>{
const b=e.target.closest("button[data-md]"); if(!b)return;
await setTheme({preset:theme.preset,custom:theme.custom,mode:b.dataset.md});});
document.querySelectorAll("[data-dsd]").forEach(b=>b.onclick=()=>openDsd(b.dataset.dsd));
["sub-pct","sub-rate"].forEach(id=>{const n=el(id); if(!n)return; n.onchange=async()=>{
hrdata.subsidy={pct:+el("sub-pct").value||70,rate:+el("sub-rate").value||200};
render(); await saveHR();};});
el("dsdAdd")&&(el("dsdAdd").onclick=async()=>{
const free=visible(companies).filter(c=>!isGroupCo(c)&&!dsdRec(c.key,R.year));
if(!free.length){tell("ทุกบริษัทมีข้อมูลปีนี้แล้วค่ะ<div style=\"font-size:13px;margin-top:8px\">ถ้าไม่เห็นบริษัทที่ต้องการ ให้ตรวจว่าตั้งเป็น “กลุ่มบริษัท” ไว้หรือเปล่า ที่ ตั้งค่า → บริษัท</div>");return;}
const ck=await askPick("เลือกนิติบุคคลที่ยื่นกรมพัฒนาฯ ในปี "+(R.year+543),
free.map(c=>`<option value="${esc(c.key)}">${esc(c.label)}</option>`).join(""),"เลือก");
if(ck)openDsd(ck);});
el("dsdCopy")&&(el("dsdCopy").onclick=async()=>{
const from=R.year-1, src=Object.keys(hrdata.dsd||{}).filter(k=>dsdRec(k,from));
if(!src.length){tell("ปี "+(from+543)+" ยังไม่มีข้อมูลให้คัดลอกค่ะ");return;}
if(!await ask(`คัดลอกโครง ${src.length} บริษัท จากปี ${from+543} มาปี ${R.year+543} (เอาเฉพาะเลขทะเบียน ไม่เอาตัวเลข) ใช่ไหมคะ?`,"คัดลอก"))return;
src.forEach(k=>{const r=dsdRec(k,from); hrdata.dsd[k]=hrdata.dsd[k]||{};
if(!hrdata.dsd[k][R.year])hrdata.dsd[k][R.year]={id:r.id||"",months:Array(12).fill(""),sent:0,repeatPersons:0,repeatTimes:0,passSkill:0,passStd:0};});
render(); await saveHR();});
document.querySelectorAll("[data-mp]").forEach(n=>n.onchange=async()=>{
const k=n.dataset.mp; hrdata.manpower[k]=hrdata.manpower[k]||{};
const v=+n.value||0; if(v)hrdata.manpower[k][R.year]=v; else delete hrdata.manpower[k][R.year];
render(); await saveHR();});
document.querySelectorAll("[data-cert]").forEach(n=>n.onchange=async()=>{
const k=n.dataset.cert; hrdata.certified[k]=hrdata.certified[k]||{};
if(n.value.trim()==="")delete hrdata.certified[k][R.year]; else hrdata.certified[k][R.year]=+n.value||0;
render(); await saveHR();});
document.querySelectorAll("[data-see]").forEach(b=>b.onclick=()=>{
const [k,v]=b.dataset.see.split(":");
F.q="";F.track="";F.type="";F.status="";F.company="";
if(k==="tag"||k==="crs")F.q=v; else F[k]=v;
R.scope="year"; view="all"; renderNav(); render(); window.scrollTo(0,0);});
document.querySelectorAll("[data-move]").forEach(b=>b.onclick=async()=>{
const [k,v]=b.dataset.move.split(":");
const list=items.filter(t=>(t[k]||"")===v);
if(!list.length){tell("ไม่มีงานให้ย้ายค่ะ");return;}
const arr=k==="track"?visible(groups):visible(companies);
const opts=arr.filter(x=>x.key!==v).map(x=>`<option value="${esc(x.key)}">${esc(x.label)}</option>`).join("");
if(!opts){tell("ต้องมีปลายทางอย่างน้อย 1 รายการก่อนนะคะ");return;}
const name=k==="track"?gLabel(v):cLabel(v);
const to=await askPick(`ย้ายงานทั้งหมด <b>${list.length}</b> รายการ จาก “${esc(name)}” ไปที่`,opts,"ย้ายงาน");
if(!to)return;
let ok=0,fail=0,err=null;
setFoot("กำลังย้าย 0/"+list.length+" …");
for(const t of list){
try{ const {_id,...rest}=t; await saveItem(Object.assign({},rest,{[k]:to}),_id); ok++; }catch(e){ fail++; if(!err)err=e; }
setFoot("กำลังย้าย "+ok+"/"+list.length+" …");
}
render();
if(fail)tell("<b>ย้ายได้ "+ok+" รายการ · ไม่สำเร็จ "+fail+" รายการ</b>"+errBox(err));
else tell("<b>ย้ายเรียบร้อย "+ok+" รายการ</b><div style=\"font-size:13px;margin-top:8px\">ไปที่ “"+esc(k==="track"?gLabel(to):cLabel(to))+"” แล้วค่ะ</div>");
});
let renameLock=false;
async function retagType(from,to){
const list=items.filter(t=>(t.type||"")===from);
let ok=0,fail=0,err=null;
for(const t of list){
try{ const {_id,...rest}=t; await saveItem(Object.assign({},rest,{type:to}),_id); ok++; }catch(e){ fail++; if(!err)err=e; }
setFoot("กำลังย้าย "+ok+"/"+list.length+" …");}
return {ok,fail,err,n:list.length};
}
async function saveTypes(){ await saveMeta("types",types()); }
el("crslink")&&(el("crslink").onclick=async()=>{
const un=items.filter(t=>isTrain(t)&&!t.course&&crsByName(t.title));
if(!un.length)return;
if(!await ask(`ผูกรหัสหลักสูตรให้ <b>${un.length}</b> รายการที่ชื่อตรงกับทะเบียน ใช่ไหมคะ?<div style="font-size:13px;margin-top:8px">ระบบจะเติมเฉพาะช่องรหัสหลักสูตร ไม่แก้ข้อมูลอื่น</div>`,"ผูกรหัส"))return;
let ok=0;
for(const t of un){ const c=crsByName(t.title); if(!c)continue;
try{ const {_id,...r}=t; await saveItem(Object.assign({},r,{course:c.code,code:t.code||c.code}),_id); ok++; }catch(e){}
setFoot("กำลังผูก "+ok+"/"+un.length+" …"); }
render(); tell("<b>ผูกรหัสแล้ว "+ok+" รายการ</b>");});
if(el("addcrs")){
el("addcrs").onclick=async()=>{
const nm=el("newcrs").value.trim(); if(!nm){tell("ใส่ชื่อหลักสูตรก่อนนะคะ");return;}
if(courses.some(c=>c.name===nm)){tell("มีหลักสูตรชื่อนี้แล้วค่ะ — ถ้าเป็นรุ่นใหม่ ให้ไปเพิ่มงานอบรมแล้วเลือกหลักสูตรนี้แทน");return;}
courses=[...courses,{code:nextCourseCode(),name:nm,skill:(el("newcrssk")?el("newcrssk").value:"")||"",mode:"",hours:0}];
el("newcrs").value=""; render(); await saveMeta("courses",courses);};}
// ค้นหา / ย่อ-ขยาย หมวดในทะเบียนหลักสูตร
const cf=el("crsfind");
if(cf){const run=()=>{const q=cf.value.trim().toLowerCase();
document.querySelectorAll("[data-crssec]").forEach(sec=>{let hit=0;
sec.querySelectorAll("[data-crsname]").forEach(r=>{const ok=!q||r.dataset.crsname.includes(q); r.hidden=!ok; if(ok)hit++;});
sec.hidden=!!q&&!hit; if(q&&hit)sec.open=true;});};
cf.oninput=()=>{crsQ=cf.value; run();}; if(crsQ)run();}
if(el("crsexp"))el("crsexp").onclick=()=>document.querySelectorAll("[data-crssec]").forEach(x=>{x.open=true;crsShut[x.dataset.crssec]=0;});
if(el("crscol"))el("crscol").onclick=()=>document.querySelectorAll("[data-crssec]").forEach(x=>{x.open=false;crsShut[x.dataset.crssec]=1;});
document.querySelectorAll("[data-crssec]").forEach(x=>x.addEventListener("toggle",()=>{crsShut[x.dataset.crssec]=x.open?0:1;}));
document.querySelectorAll("[data-mvc]").forEach(b=>b.onclick=async()=>{
const [i,t]=b.dataset.mvc.split(":").map(Number);
if(t<0||t>=courses.length||i<0||i>=courses.length)return;
const tmp=courses[i]; courses[i]=courses[t]; courses[t]=tmp;
render(); await saveMeta("courses",courses);});
// ทะเบียนหมวดทักษะ / รูปแบบการอบรม
const saveL=async(kind,arr)=>{ if(kind==="sk"){skillList=arr; await saveMeta("skills",arr);} else {modeList=arr; await saveMeta("modes",arr);} };
[["sk",skills,"skill"],["md",modes,"mode"]].forEach(([kind,getter,field])=>{
const addBtn=el("add"+kind), inp=el("new"+kind);
if(addBtn)addBtn.onclick=async()=>{const v=(inp.value||"").trim();
if(!v){tell("พิมพ์ชื่อก่อนนะคะ");return;}
if(getter().includes(v)){tell("มีรายการนี้อยู่แล้วค่ะ");return;}
const arr=[...getter(),v]; inp.value=""; render(); await saveL(kind,arr);};
document.querySelectorAll("[data-ren"+kind+"]").forEach(n=>n.onchange=async()=>{
const from=n.dataset["ren"+kind], to=n.value.trim();
if(!to||to===from){render();return;}
if(getter().includes(to)){tell("มีรายการ “"+esc(to)+"” อยู่แล้วค่ะ");render();return;}
const arr=getter().map(x=>x===from?to:x);
await saveL(kind,arr);
let ok=0; const targets=[...courses.filter(c=>(c[field]||"")===from),...items.filter(t=>(t[field]||"")===from)];
for(const c of courses)if((c[field]||"")===from)c[field]=to;
await saveMeta("courses",courses);
for(const t of items.filter(t=>(t[field]||"")===from)){
try{ await DB.collection("items").doc(t._id).set({[field]:to},{merge:true}); ok++; }catch(e){}}
render(); setFoot("เปลี่ยนชื่อและอัปเดต "+(targets.length)+" รายการแล้ว");});
document.querySelectorAll("[data-del"+kind+"]").forEach(b=>b.onclick=async()=>{
const nm=b.dataset["del"+kind];
const n=kind==="sk"?skillUsed(nm):modeUsed(nm);
if(n&&!await ask("“"+esc(nm)+"” มี <b>"+n+"</b> รายการใช้อยู่ค่ะ ลบออกจากทะเบียนแล้วชื่อนี้จะยังติดอยู่กับข้อมูลเดิม (และจะโผล่ในทะเบียนอีกครั้งอัตโนมัติ) — ลบต่อไหมคะ?","ลบรายการ"))return;
const arr=getter().filter(x=>x!==nm); render(); await saveL(kind,arr);});});
document.querySelectorAll("[data-mvl]").forEach(b=>b.onclick=async()=>{
const [kind,i,d]=b.dataset.mvl.split(":"); const arr=kind==="sk"?skills():modes();
const a=+i,t=a+(+d); if(t<0||t>=arr.length)return;
const tmp=arr[a]; arr[a]=arr[t]; arr[t]=tmp;
render(); await saveL(kind,arr);});
document.querySelectorAll("[data-crsopen]").forEach(b2=>b2.onclick=()=>openCrs(b2.dataset.crsopen));
document.querySelectorAll("[data-rencrs]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.rencrs), v=n.value.trim(); if(!c||!v){render();return;}
c.name=v; render(); await saveMeta("courses",courses);});
document.querySelectorAll("[data-crsskill]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crsskill); if(!c)return; c.skill=n.value; await saveMeta("courses",courses);});
document.querySelectorAll("[data-crsmode]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crsmode); if(!c)return; c.mode=n.value; await saveMeta("courses",courses);});
document.querySelectorAll("[data-crshr]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crshr); if(!c)return; c.hours=+n.value||0; await saveMeta("courses",courses);});
document.querySelectorAll("[data-crslaw]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crslaw); if(!c)return;
if(n.value==="")delete c.law; else c.law=n.value==="1";
render(); await saveMeta("courses",courses);
setFoot(c.law===true?"“"+c.name+"” ตั้งเป็นบังคับตามกฎหมายแล้ว":c.law===false?"“"+c.name+"” ตั้งเป็นไม่บังคับแล้ว":"“"+c.name+"” กลับไปใช้ค่าตามประเภทงาน");});
document.querySelectorAll("[data-delcrs]").forEach(b=>b.onclick=async()=>{
const code=b.dataset.delcrs, n=crsBatches(code).length;
if(n){tell("หลักสูตรนี้มี <b>"+n+"</b> รุ่นผูกอยู่ค่ะ ลบหรือย้ายรุ่นก่อนนะคะ");return;}
if(!await ask("ลบหลักสูตร “"+esc(crsLabel(code))+"” ใช่ไหมคะ?","ลบหลักสูตร"))return;
courses=courses.filter(c=>c.code!==code); render(); await saveMeta("courses",courses);});
if(el("addt")){
el("addt").onclick=async()=>{
const v=el("newt").value.trim(); if(!v){tell("ใส่ชื่อประเภทก่อนนะคะ");return;}
if(types().includes(v)){tell("มีประเภทนี้แล้วค่ะ");return;}
typeList=[...typeDefs(),{name:v,track:el("newtg").value||"",law:el("newtlaw")&&el("newtlaw").checked}]; el("newt").value=""; render(); await saveMeta("types",typeList);};
}
document.querySelectorAll("[data-rent]").forEach(n=>n.onchange=async()=>{
const from=n.dataset.rent, to=n.value.trim();
if(!to||to===from){render();return;}
if(!types().includes(from)||renameLock){render();return;}   // เปลี่ยนไปแล้ว / event ซ้ำ — ไม่ต้องเตือน
renameLock=true; setTimeout(()=>renameLock=false,800);
if(types().includes(to)){tell("มีประเภท “"+esc(to)+"” อยู่แล้วค่ะ ถ้าต้องการรวมเข้าด้วยกันให้ใช้ปุ่มย้ายงานแทน");render();return;}
const used=typeUsed(from);
typeList=typeDefs().map(x=>x.name===from?{name:to,track:x.track,law:x.law}:x);
await saveMeta("types",typeList);
if(used){const r=await retagType(from,to);
render();
if(r.fail)tell("<b>เปลี่ยนชื่อแล้ว แต่ย้ายงานได้ "+r.ok+"/"+r.n+"</b>"+errBox(r.err));
else setFoot("เปลี่ยนชื่อประเภทและอัปเดต "+r.ok+" งานแล้ว");}
else render();});
document.querySelectorAll("[data-movet]").forEach(b=>b.onclick=async()=>{
const from=b.dataset.movet, n=typeUsed(from);
if(!n){tell("ไม่มีงานให้ย้ายค่ะ");return;}
const opts=types().filter(x=>x!==from).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")+`<option value="">— ไม่ระบุประเภท —</option>`;
const to=await askPick(`ย้ายงานทั้งหมด <b>${n}</b> รายการ จากประเภท “${esc(from)}” ไปที่`,opts,"ย้ายงาน");
if(to===null)return;
const r=await retagType(from,to); render();
if(r.fail)tell("<b>ย้ายได้ "+r.ok+" · ไม่สำเร็จ "+r.fail+"</b>"+errBox(r.err));
else tell("<b>ย้ายเรียบร้อย "+r.ok+" รายการ</b>");});
document.querySelectorAll("[data-delt]").forEach(b=>b.onclick=async()=>{
const x=b.dataset.delt, n=typeUsed(x);
if(n){tell("ประเภทนี้มี <b>"+n+"</b> งานใช้อยู่ค่ะ กดปุ่มย้ายงานไปประเภทอื่นก่อนนะคะ");return;}
if(!await ask("ลบประเภท “"+esc(x)+"” ใช่ไหมคะ?","ลบประเภท"))return;
typeList=typeDefs().filter(y=>y.name!==x); render(); await saveMeta("types",typeList);});
document.querySelectorAll("[data-trt]").forEach(n=>n.onchange=async()=>{
const nm=n.dataset.trt;
typeList=typeDefs().map(x=>x.name===nm?{name:x.name,track:n.value,law:x.law}:x);
render(); await saveMeta("types",typeList);});
document.querySelectorAll("[data-tlaw]").forEach(b=>b.onclick=async()=>{
const nm=b.dataset.tlaw;
typeList=typeDefs().map(x=>x.name===nm?{name:x.name,track:x.track,law:!x.law}:x);
render(); await saveMeta("types",typeList);
setFoot(typeDef(nm)&&typeDef(nm).law?"ตั้ง “"+nm+"” เป็นงานบังคับตามกฎหมายแล้ว":"ยกเลิกสถานะบังคับตามกฎหมายของ “"+nm+"” แล้ว");});
document.querySelectorAll("[data-mvt]").forEach(b=>b.onclick=async()=>{
const [i,t]=b.dataset.mvt.split(":").map(Number);
const arr=typeDefs(); if(t<0||t>=arr.length||i<0||i>=arr.length)return;
const tmp=arr[i]; arr[i]=arr[t]; arr[t]=tmp;
typeList=arr; render(); await saveMeta("types",typeList);});
const tyf=el("tyfind");
if(tyf){const run=()=>{const q=tyf.value.trim().toLowerCase();
document.querySelectorAll("[data-tysec]").forEach(s=>{
let hit=0; s.querySelectorAll("[data-tyname]").forEach(r=>{
const ok=!q||r.dataset.tyname.includes(q); r.hidden=!ok; if(ok)hit++;});
s.hidden=!!q&&!hit; if(q&&hit)s.open=true;});};
tyf.oninput=()=>{tyQ=tyf.value; run();}; if(tyQ)run();}
const tyx=el("tyexp"), tyc=el("tycol");
if(tyx)tyx.onclick=()=>document.querySelectorAll("[data-tysec]").forEach(s=>{s.open=true;tyShut[s.dataset.tysec]=0;});
if(tyc)tyc.onclick=()=>document.querySelectorAll("[data-tysec]").forEach(s=>{s.open=false;tyShut[s.dataset.tysec]=1;});
document.querySelectorAll("[data-tysec]").forEach(s=>s.addEventListener("toggle",()=>{tyShut[s.dataset.tysec]=s.open?0:1;}));
document.querySelectorAll("[data-mv]").forEach(b=>b.onclick=async()=>{
const [kind,i,d]=b.dataset.mv.split(":"); const arr=kind==="groups"?groups:kind==="companies"?companies:kind==="courses"?courses:gls;
const a=+i, t=a+(+d); if(t<0||t>=arr.length)return;
const tmp=arr[a]; arr[a]=arr[t]; arr[t]=tmp;
render(); await saveMeta(kind==="gl"?"gl":kind,arr);});
document.querySelectorAll("[data-hide]").forEach(b=>b.onclick=async()=>{
const [kind,i]=b.dataset.hide.split(":"); const arr=kind==="groups"?groups:kind==="companies"?companies:kind==="courses"?courses:gls;
const o=arr[+i]; if(!o)return; o.hidden=!o.hidden;
render(); await saveMeta(kind==="gl"?"gl":kind,arr);});
document.querySelectorAll("[data-pal]").forEach(b=>b.onclick=()=>setTheme({preset:b.dataset.pal,custom:theme.custom}));
if(el("useCustom")){
function paintMixPrev(){
if(!el("mixprev"))return;
const c=[0,1,2,3,4].map(i=>el("cc"+i).value);
const S=(id,k,v)=>{const n=el(id); if(n)n.style[k]=v;};
el("mixprev").style.background=mix(c[0],"#ffffff",.55);
S("mp-card","background","#ffffff");
S("mp-card","boxShadow","0 6px 20px -10px rgba(18,58,94,.28)");
S("mp-h","color",mix(c[4],"#0b1a2a",.12));
S("mp-s","color",mix(c[2],c[3],.3));
S("mp-chip","background",mix(c[1],"#ffffff",.4)); S("mp-chip","color",c[4]);
S("mp-btn","background","linear-gradient(135deg,"+(lum(c[3])<.62?c[3]:c[4])+","+c[4]+")");
S("mp-in","background",mix(c[0],"#ffffff",.55)); S("mp-in","boxShadow","inset 0 0 0 2px "+c[3]);
S("mp-in","color",mix(c[4],"#0b1a2a",.12));}
[0,1,2,3,4].forEach(i=>{const n=el("cc"+i); if(n)n.oninput=paintMixPrev;});
paintMixPrev();
el("useCustom").onclick=()=>setTheme({preset:"custom",custom:[0,1,2,3,4].map(i=>el("cc"+i).value)});
el("fromCur").onclick=()=>{const p=PALETTES.find(x=>x.key===theme.preset);
(p?p.ramp:(theme.custom||PALETTES[0].ramp)).forEach((c,i)=>el("cc"+i).value=c); paintMixPrev();};
}
if(el("addg")){
el("addg").onclick=async()=>{const v=el("newg").value.trim();if(!v)return;
if(groups.some(g=>g.label===v)){tell("มีกลุ่มชื่อนี้แล้วค่ะ");return;}
groups=[...groups,{key:"g"+Date.now().toString(36),label:v}];el("newg").value="";render();await saveMeta("groups",groups);};
el("newg").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();el("addg").click();}};
}
document.querySelectorAll("[data-ren]").forEach(n=>n.onchange=async()=>{
const g=groups.find(x=>x.key===n.dataset.ren), v=n.value.trim();
if(!g||!v){render();return;} g.label=v; await saveMeta("groups",groups); render();});
document.querySelectorAll("[data-delg]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delg,n=items.filter(t=>t.track===k).length;
if(n){tell("กลุ่มนี้ยังมี <b>"+n+"</b> งานอยู่ ย้ายงานออกก่อนนะคะ");return;}
if(groups.length<=1)return;
if(!await ask("ลบกลุ่ม “"+esc(gLabel(k))+"” ใช่ไหมคะ?","ลบกลุ่ม"))return;
groups=groups.filter(g=>g.key!==k);render();await saveMeta("groups",groups);});
if(el("addc")){
el("addc").onclick=async()=>{const v=el("newc").value.trim();if(!v)return;
companies=[...companies,{key:"c"+Date.now().toString(36),label:v}];el("newc").value="";render();await saveMeta("companies",companies);};
el("newc").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();el("addc").click();}};
}
document.querySelectorAll("[data-parent]").forEach(n=>n.onchange=async()=>{
const c=companies.find(x=>x.key===n.dataset.parent); if(!c)return;
const v=n.value;
if(v==="__group__"){c.isGroup=true;delete c.parent;}
else{delete c.isGroup; if(v)c.parent=v; else delete c.parent;}
render(); await saveMeta("companies",companies);});
document.querySelectorAll("[data-renc]").forEach(n=>n.onchange=async()=>{
const c=companies.find(x=>x.key===n.dataset.renc), v=n.value.trim();
if(!c||!v){render();return;} c.label=v; await saveMeta("companies",companies); render();});
document.querySelectorAll("[data-delc]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delc,n=items.filter(t=>t.company===k).length;
if(n){tell("บริษัทนี้ยังมี <b>"+n+"</b> งานผูกอยู่ค่ะ");return;}
if(!await ask("ลบบริษัท “"+esc(cLabel(k))+"” ใช่ไหมคะ?","ลบบริษัท"))return;
companies=companies.filter(c=>c.key!==k);render();await saveMeta("companies",companies);});
if(el("addgl")){
el("addgl").onclick=async()=>{
const code=el("glcode").value.trim(), label=el("glname").value.trim(), b=+el("glbud").value||0;
const dept=el("gldept").value.trim();
if(!label&&!code){tell("ใส่ชื่อหมวดหรือรหัส GL อย่างน้อยหนึ่งอย่างค่ะ");return;}
let key=(dept?dept+"|":"")+(code||label.slice(0,18));
if(gls.some(g=>(g.dept||"")===dept&&(g.code||"")===code&&g.label===(label||code))){
tell("มีหมวดนี้แล้วค่ะ <div style=\"font-size:13px;margin-top:8px\">ซ้ำทั้ง Budget Dept. รหัส GL และชื่อหมวด — ถ้าตั้งใจแยกก้อนงบ ให้ใส่ Budget Dept. หรือชื่อหมวดให้ต่างกันค่ะ</div>");return;}
if(gls.some(g=>g.key===key)){let i=2; while(gls.some(g=>g.key===key+"#"+i))i++; key=key+"#"+i;}
gls=[...gls,{key,code,dept,label:label||code,budget:0,budgets:b?{[(R.glYear||R.year)]:b}:{}}];
el("gldept").value=el("glcode").value=el("glname").value=el("glbud").value="";
render();await saveMeta("gl",gls);};
}
el("glGo")&&(el("glGo").onclick=()=>{view="set";settab="gl";renderNav();render();window.scrollTo(0,0);});
document.querySelectorAll("[data-glplan]").forEach(n=>n.onclick=()=>openGlPlan(n.dataset.glplan));
el("glYearSel")&&(el("glYearSel").onchange=e=>{R.glYear=+e.target.value;render();});
el("glCopy")&&(el("glCopy").onclick=async()=>{
const y=R.glYear||R.year, from=y-1;
const n=gls.filter(g=>glBudget(g,from)).length;
if(!n){tell("ปี "+(from+543)+" ยังไม่มีงบให้คัดลอกค่ะ");return;}
if(!await ask(`คัดลอกงบ <b>${n}</b> หมวด จากปี ${from+543} มาทับปี ${y+543} ใช่ไหมคะ?`,"คัดลอก"))return;
gls.forEach(g=>{ if(!glBudget(g,from))return;
if(hasPlan(g,from)){const P=glPlan(g,from); Object.keys(P).forEach(ck=>setGlPlan(g,y,ck,glPlanMonths(g,from,ck)));}
else{g.budgets=g.budgets&&typeof g.budgets==="object"?g.budgets:{}; g.budgets[y]=glBudget(g,from); g.budget=g.budgets[THISYEAR]||0;}});
render(); await saveMeta("gl",gls);});
document.querySelectorAll("[data-reng]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.reng), v=n.value.trim();
if(!g||!v){render();return;} g.label=v; await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-rend]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.rend);if(!g)return;
g.dept=n.value.trim(); await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-renc2]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.renc2);if(!g)return;
g.code=n.value.trim(); await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-delgl]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delgl,n=ledger.filter(x=>x.gl===k).length;
if(n){tell("หมวดนี้มี <b>"+n+"</b> รายการเงินผูกอยู่ค่ะ ลบหรือย้ายรายการก่อนนะคะ");return;}
if(!await ask("ลบหมวด “"+esc(glLabel(k))+"” ใช่ไหมคะ?","ลบหมวด"))return;
gls=gls.filter(g=>g.key!==k);seedGL._done=true;render();await saveMeta("gl",gls);});
if(el("csvgo")){
el("csvgo").onclick=()=>importCSV(el("csvtext").value);
el("csvsample").onclick=()=>{el("csvtext").value=
"ชื่องาน,กลุ่ม,ประเภท,สถานะ,ผู้รับผิดชอบ,วันที่,บริษัท,หมวด GL,งบ,ใช้จริง,ผู้เข้าอบรม,ชั่วโมง,วิทยากร/สถาบัน,กรมพัฒฯ,รายละเอียด\nปฐมนิเทศพนักงานใหม่,อบรมภายใน,อบรม,กำลังดำเนินการ,วิม,2026-10-05,LeKise (LKL),781800000 ค่าฝึกอบรม,0,0,15,3,ฝ่าย HR,ไม่ต้องยื่น,ทุกต้นเดือน";};
el("csvfile").onchange=e=>{const f=e.target.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{el("csvtext").value=r.result;importCSV(r.result);};r.readAsText(f,"utf-8");};
}
el("expTasks")&&(el("expTasks").onclick=()=>exportCSV("skywork-tasks",
["ชื่องาน","กลุ่ม","ประเภท","สถานะ","ผู้รับผิดชอบ","วันที่","บริษัท","หมวด GL","งบ","หมวด GL รอง","งบรอง","ใช้จริง","เวลา","สถานที่","ผู้เข้าร่วม","เตรียมล่วงหน้า(วัน)","สิ่งที่ต้องเตรียม","ป้ายกำกับ","สี","ผู้เข้าอบรม","ชั่วโมง","หมวดทักษะ","รูปแบบการอบรม","วิทยากร/สถาบัน","กรมพัฒฯ","รหัสหลักสูตร","รุ่นที่","แบบที่ยื่น","วันที่ฝึกเสร็จ","วันที่ยื่นเปิดหลักสูตร","เลขคำขอเปิด","วันที่ยื่นรับรองรุ่น","เลขคำขอรับรอง","การเกิดซ้ำ","รายละเอียด"],
items.map(t=>[t.title,gLabel(t.track),t.type,t.status,t.owner,t.date||t.recurring,cLabel(t.company),
t.gl1?glLabel(glKeyOf(t.gl1)):"",+t.b1||"",t.gl2?glLabel(glKeyOf(t.gl2)):"",+t.b2||"",t.actual,t.time||"",t.place||"",t.attendees||"",t.prepDays||"",t.prepNote||"",t.tag||"",t.color||"",t.pax||"",t.hours||"",t.skill||"",t.mode||"",t.vendor||"",t.dsd||"",t.course||"",t.batch||"",t.yp||"",t.dsdEnd||"",t.dsdOpenDate||"",t.dsdOpenNo||"",t.dsdCertDate||"",t.dsdCertNo||"",rruleText(t),t.note])));
if(el("health")&&healthState!=="done")checkHealth();
el("selftest")&&(el("selftest").onclick=async()=>{
const out=el("csvout2"); out.innerHTML=`<div class="banner">กำลังทดสอบ…</div>`;
const id="selftest-"+Date.now();
const w=await SB.from("rows").upsert({id,uid,kind:"sys",data:{t:"selftest"},updated_at:new Date().toISOString()});
if(w.error){out.innerHTML=errBox(w.error);return;}
const rd=await SB.from("rows").select("id",{count:"exact",head:true}).eq("uid",uid);
await SB.from("rows").delete().eq("id",id).eq("uid",uid);
out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} เขียน อ่าน และลบข้อมูลได้ปกติ · ตอนนี้มี ${rd.count!=null?rd.count-1:"?"} แถวบนเซิร์ฟเวอร์</div>`;
});
// ---- สำรอง / กู้คืน ----
if(el("bkdown"))el("bkdown").onclick=()=>{
const pack=bkDownload();
const n=pack.items.length+pack.ledger.length+pack.legal.length+pack.index.length+pack.note.length;
bkMsg=`<div class="banner ok" style="margin-top:12px">${svg(ICON.file,17)} สำรองแล้ว <b>${n}</b> รายการ + การตั้งค่าทั้งหมด — เก็บไฟล์ไว้ใน Google Drive หรือที่ปลอดภัยนะคะ</div>`; render();};
if(el("bkgo"))el("bkgo").onclick=async()=>{
const f=el("bkfile").files&&el("bkfile").files[0];
if(!f){tell("เลือกไฟล์สำรอง (.json) ก่อนนะคะ");return;}
let pack; try{ pack=JSON.parse(await f.text()); }catch(e){ tell("<b>อ่านไฟล์ไม่ได้</b><div style=\"font-size:13px;margin-top:6px\">ไฟล์อาจไม่ใช่ไฟล์สำรองของ Sky Work</div>"); return; }
if(!pack||pack.app!=="sky-work"){tell("<b>ไม่ใช่ไฟล์สำรองของ Sky Work</b>");return;}
const cnt=["items","ledger","legal","index","note"].reduce((a,k)=>a+((pack[k]||[]).length),0);
if(!await ask("ไฟล์นี้สำรองไว้เมื่อ <b>"+esc(new Date(pack.at||Date.now()).toLocaleString("th-TH"))+"</b> มี <b>"+cnt+"</b> รายการ<br>กู้คืนแบบ<b>เติมกลับ</b> — ของที่ลบไปจะกลับมา ของที่มีอยู่จะถูกเขียนทับด้วยค่าในไฟล์ ของใหม่ที่เพิ่มหลังวันสำรองจะไม่ถูกลบ<br>ดำเนินการต่อไหมคะ?","กู้คืนข้อมูล"))return;
let ok=0,fail=0;
for(const [coll,key] of [["items","items"],["ledger","ledger"],["legal","legal"],["index","index"],["note","note"]]){
for(const r of (pack[key]||[])){
try{ await DB.collection(coll).doc(r.id).set(r.data); ok++; }catch(e){ fail++; }
if(ok%25===0)setFoot("กำลังกู้คืน "+ok+"/"+cnt+" …");}}
const M=pack.meta||{};
try{
if(Array.isArray(M.groups)&&M.groups.length){groups=M.groups; await saveMeta("groups",groups);}
if(Array.isArray(M.companies)){companies=M.companies; await saveMeta("companies",companies);}
if(Array.isArray(M.gl)){gls=M.gl; await saveMeta("gl",gls);}
if(Array.isArray(M.types)){typeList=M.types; await saveMeta("types",typeList);}
if(Array.isArray(M.tags)){tagList=M.tags; await saveMeta("tags",tagList);}
if(Array.isArray(M.courses)){courses=M.courses; await saveMeta("courses",courses);}
if(Array.isArray(M.skills)){skillList=M.skills; await saveMeta("skills",skillList);}
if(Array.isArray(M.modes)){modeList=M.modes; await saveMeta("modes",modeList);}
if(Array.isArray(M.idxcats)){idxCats=M.idxcats; await saveMeta("idxcats",idxCats);}
if(Array.isArray(M.nfolders)){noteFolders=M.nfolders; await saveMeta("nfolders",noteFolders);}
if(Array.isArray(M.tpls)){tpls=M.tpls; await saveMeta("tpls",tpls);}
if(M.hr){hrdata=Object.assign(hrdata,M.hr); await saveHR();}
}catch(e){fail++;}
bkMsg=`<div class="banner ${fail?"bad":"ok"}" style="margin-top:12px">กู้คืนสำเร็จ <b>${ok}</b> รายการ${fail?" · พลาด "+fail:""} + การตั้งค่าทั้งหมด</div>`;
render();};
el("icsgo")&&(el("icsgo").onclick=downloadICS);
el("execPrint")&&(el("execPrint").onclick=()=>window.print());
el("execCsv")&&(el("execCsv").onclick=execCsv);
const wipe=async(kind,label,arr)=>{
const out=el("wipeout");
if(!arr.length){ tell("ยังไม่มี"+label+"ให้ลบค่ะ"); return; }
const CODE="ลบ"+arr.length;
const ok=await askCode(`กำลังจะลบ <b>${label} ${arr.length} รายการ</b> ออกถาวร กู้คืนไม่ได้นะคะ<br><br>
ถ้าแน่ใจแล้ว พิมพ์ <b style="font-family:var(--mono);background:var(--over-soft);color:var(--over);padding:2px 9px;border-radius:8px">${CODE}</b> เพื่อยืนยัน`,CODE);
if(!ok)return;
out.innerHTML=`<div class="banner">กำลังลบ…</div>`;
const {error}=await SB.from("rows").delete().eq("uid",uid).eq("kind",kind);
if(error){ out.innerHTML=errBox(error); return; }
cache[kind].clear(); emit(kind); render();
tell(`<b>ลบ${label}เรียบร้อยแล้ว</b><div style="font-size:13.5px;margin-top:8px;line-height:1.7">ตอนนี้เหลือ 0 รายการ พร้อมนำเข้าข้อมูลชุดใหม่ที่ ตั้งค่า → นำเข้า CSV ค่ะ</div>`);
};
el("wipeTasks")&&(el("wipeTasks").onclick=()=>wipe("items","งาน",items));
el("wipeLedger")&&(el("wipeLedger").onclick=()=>wipe("ledger","รายการเงิน",ledger));
el("notifOn")&&(el("notifOn").onclick=async()=>{
const ok=await notifyToday(true);
if(!ok)tell("เบราว์เซอร์ไม่อนุญาตให้แจ้งเตือนค่ะ — เปิดสิทธิ์ที่รูปแม่กุญแจหน้าช่อง URL แล้วลองใหม่ หรือใช้วิธีซิงก์เข้า Google Calendar แทน");
render();});
el("preset")&&(el("preset").onclick=async()=>{
TRAIN_PRESET.forEach(x=>{ if(!groups.some(g=>g.label===x.label))groups.push({key:x.key,label:x.label}); });
render(); await saveMeta("groups",groups);});
el("signout")&&(el("signout").onclick=async()=>{if(await ask("ออกจากระบบเครื่องนี้ใช่ไหมคะ?","ออกจากระบบ"))signOut();});
el("expIdx")&&(el("expIdx").onclick=()=>exportCSV("skywork-index",
["สารบัญ","กลุ่มงาน","ผู้ดูแล","ลิงก์","สถานะ","รายละเอียดเอกสาร","หมายเหตุ"],
idx.map(x=>[x.title,x.group,x.owner,x.url,x.status,x.detail,x.note])));
el("expNote")&&(el("expNote").onclick=()=>exportCSV("skywork-notes",
["หัวข้อ","ประเภท","วันที่","ป้ายกำกับ","เนื้อหา"],
notes.map(n=>[n.title,n.kind,n.date,n.tag,ntPlain(n,true)])));
el("expLegal")&&(el("expLegal").onclick=()=>exportCSV("skywork-legal",
["ชื่อรายการ","หมวด","ตำแหน่ง/หน่วยงาน","บริษัทที่ต้องมี","ผู้รับผิดชอบ","วันที่ออก","วันหมดอายุ","รอบทบทวน(เดือน)","ไม่มีวันหมดอายุ","เงื่อนไข/หมายเหตุ"],
legal.map(L=>[L.title,L.cat,L.unit,(L.comps||[]).map(cLabel).join(", "),L.person,L.issued,L.expires,L.cycle||"",L.lifetime?"TRUE":"",L.note])));
el("expLedger")&&(el("expLedger").onclick=()=>exportCSV("skywork-ledger",
["วันที่","ประเภท","หมวด GL","จำนวนเงิน","บริษัท","รายละเอียด"],
ledger.map(x=>[x.date,x.kind==="income"?"รายรับ":"รายจ่าย",glLabel(x.gl),x.amount,cLabel(x.company),x.note])));
}
function parseRecur(v){
v=String(v||"").trim(); if(!v)return null;
const dow=["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
if(/^ทุกวัน$/.test(v))return {freq:"day",weekdays:[],nth:[],monthday:null};
if(/ทุกปี/.test(v))return {freq:"year",weekdays:[],nth:[],monthday:null};
const md=v.match(/ทุกเดือน.*?(\d{1,2})|ทุกวันที่\s*(\d{1,2})/);
if(md)return {freq:"monthday",weekdays:[],nth:[],monthday:+(md[1]||md[2])};
const wd=dow.map((d,i)=>v.includes(d)?i:-1).filter(i=>i>=0);
if(wd.length){
const nth=[]; const nm=v.match(/ที่\s*([1-5](\s*(และ|,)\s*[1-5])*)/);
if(nm)nm[1].split(/และ|,/).forEach(x=>{const n=+x.trim(); if(n)nth.push(n);});
if(/สุดท้าย/.test(v))nth.push(-1);
return nth.length?{freq:"monthnth",weekdays:wd,nth,monthday:null}:{freq:"week",weekdays:wd,nth:[],monthday:null};
}
return null;
}
function sniffDelim(txt){
const line=txt.split(/\r?\n/).find(l=>l.trim())||"";
const n=c=>(line.split(c).length-1);
const cand=[[",",n(",")],["\t",n("\t")],[";",n(";")],["|",n("|")]].sort((a,b)=>b[1]-a[1]);
return cand[0][1]>0?cand[0][0]:",";
}
function parseCSV(txt,D){
txt=String(txt).replace(/^\uFEFF/,"");
D=D||sniffDelim(txt);
const rows=[];let row=[],cur="",q=false;
for(let i=0;i<txt.length;i++){const c=txt[i];
if(q){ if(c==='"'&&txt[i+1]==='"'){cur+='"';i++;} else if(c==='"'){q=false;} else cur+=c; }
else if(c==='"')q=true;
else if(c===D){row.push(cur);cur="";}
else if(c==="\n"){row.push(cur);rows.push(row);row=[];cur="";}
else if(c!=="\r")cur+=c;}
if(cur||row.length){row.push(cur);rows.push(row);}
return rows.filter(r=>r.some(c=>c.trim()));
}
async function importCSV(txt){
const out=el("csvout"); if(!txt.trim()){out.innerHTML=`<div class="banner bad">ยังไม่มีข้อมูลให้นำเข้าค่ะ</div>`;return;}
if(/ชื่อรายการ/.test(txt.split(/\r?\n/)[0]||""))return importLegal(txt,out);
if(/สารบัญ/.test(txt.split(/\r?\n/)[0]||""))return importIdx(txt,out);
imp={state:"run",ok:0,fail:0,total:0,msg:"",at:""}; paintImp();
const COLS=["ชื่องาน","กลุ่ม","ประเภท","สถานะ","ผู้รับผิดชอบ","วันที่","บริษัท","งบ","ใช้จริง","รายละเอียด"];
const rows=parseCSV(txt);
let head=rows[0].map(h=>h.replace(/\uFEFF/g,"").trim());
let body=rows.slice(1), noHead=false;
if(head.indexOf("ชื่องาน")<0){ head=COLS.slice(); body=rows; noHead=true; }
const idx=n=>head.indexOf(n);
const get=(r,n)=>{const i=idx(n);return i<0?"":String(r[i]==null?"":r[i]).trim();};
let added=0, failed=0, firstErr=null, newG=[], newC=[], newGL=[];
imp.total=body.length; paintImp();
for(const r of body){
const title=get(r,"ชื่องาน"); if(!title)continue;
let gl=get(r,"กลุ่ม")||"งานประจำปี";
let g=groups.find(x=>x.label===gl);
if(!g){g={key:"g"+Date.now().toString(36)+added,label:gl};groups.push(g);newG.push(gl);}
let co=get(r,"บริษัท"), c=null;
if(co){c=companies.find(x=>x.label===co);
if(!c){c={key:"c"+Date.now().toString(36)+added,label:co};companies.push(c);newC.push(co);}}
const date=get(r,"วันที่");
let glKey="";
const mkGL=raw=>{ raw=(raw||"").trim(); if(!raw)return "";
const m=raw.match(/^(\d{6,9})/); const code=m?m[1]:"";
const label=(raw.replace(/^\d{6,9}\s*[:.\-]?\s*/,"")||raw).trim();
let g=gls.find(x=>(code&&x.key===code)||x.label===label||(x.code&&x.code===code));
if(!g){ g={key:code||label.slice(0,18),code,label:label||code,budget:0,budgets:{}}; gls.push(g); newGL.push(g.label); }
return g.key; };
const gl2Key=mkGL(get(r,"หมวด GL รอง")||get(r,"งบก้อนรอง"));
const glRaw=get(r,"หมวด GL")||get(r,"GL")||get(r,"รหัส GL");
if(glRaw){
const m=glRaw.match(/^(\d{6,9})/); const code=m?m[1]:"";
const label=(glRaw.replace(/^\d{6,9}\s*[:.\-]?\s*/,"")||glRaw).trim();
let g=gls.find(x=>(code&&x.key===code)||x.label===label||(x.code&&x.code===code));
if(!g){ g={key:code||label.slice(0,18),code,label:label||code,budget:0}; gls.push(g); newGL.push(g.label); }
glKey=g.key;
}
try{
await saveItem({
title, track:g.key, type:get(r,"ประเภท"), status:STATUS.includes(normSt(get(r,"สถานะ")))?normSt(get(r,"สถานะ")):"รอดำเนินการ",
owner:get(r,"ผู้รับผิดชอบ"), date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null,
recurring:/^\d{4}-\d{2}-\d{2}$/.test(date)?null:(date||null),
company:c?c.key:"", gl1:glKey, b1:+get(r,"งบ")||0, gl2:gl2Key, b2:+get(r,"งบรอง")||0,
actual:+get(r,"ใช้จริง")||0, code:"", note:get(r,"รายละเอียด"), group:"",
rrule:parseRecur(get(r,"การเกิดซ้ำ")),
meet:/ประชุม/.test(get(r,"กลุ่ม")+get(r,"ประเภท")+title)||!!get(r,"เวลา"),
time:get(r,"เวลา"), place:get(r,"สถานที่"), attendees:get(r,"ผู้เข้าร่วม"),
prepDays:+get(r,"เตรียมล่วงหน้า(วัน)")||+get(r,"เตรียมล่วงหน้า")||0, prepNote:get(r,"สิ่งที่ต้องเตรียม"),
tag:get(r,"ป้ายกำกับ"), color:/^#[0-9a-fA-F]{6}$/.test(get(r,"สี"))?get(r,"สี"):"",
pax:+get(r,"ผู้เข้าอบรม")||0, hours:+get(r,"ชั่วโมง")||0,
vendor:get(r,"วิทยากร/สถาบัน")||get(r,"วิทยากร"), dsd:DSD.includes(get(r,"กรมพัฒฯ"))?get(r,"กรมพัฒฯ"):"",
skill:(get(r,"หมวดทักษะ")||get(r,"ประเภทการอบรม")||"").trim(),
mode:(get(r,"รูปแบบการอบรม")||"").trim(),
course:(()=>{const v=get(r,"รหัสหลักสูตร").trim(); if(v)return v;
const nm=get(r,"ชื่องาน").trim(); const c2=courses.find(x=>x.name===nm); return c2?c2.code:"";})(),
batch:get(r,"รุ่นที่"), yp:get(r,"แบบที่ยื่น"), dsdEnd:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ฝึกเสร็จ"))?get(r,"วันที่ฝึกเสร็จ"):null, dsdOpenDate:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ยื่นเปิดหลักสูตร"))?get(r,"วันที่ยื่นเปิดหลักสูตร"):null,
dsdOpenNo:get(r,"เลขคำขอเปิด"), dsdCertDate:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ยื่นรับรองรุ่น"))?get(r,"วันที่ยื่นรับรองรุ่น"):null,
dsdCertNo:get(r,"เลขคำขอรับรอง"),
train:/อบรม/.test(g.label)||!!get(r,"ผู้เข้าอบรม"),
months:/^\d{4}-\d{2}-\d{2}$/.test(date)?[new Date(date).getMonth()+1]:[]
});
added++;
}catch(e){ failed++; if(!firstErr)firstErr=e; }
imp.ok=added; imp.fail=failed; paintImp();
}
try{ if(newG.length)await saveMeta("groups",groups); if(newC.length)await saveMeta("companies",companies); if(newGL.length)await saveMeta("gl",gls); }catch(e){ if(!firstErr)firstErr=e; }
let verify="";
try{ const {count,error}=await SB.from("rows").select("id",{count:"exact",head:true}).eq("uid",uid).eq("kind","items");
 if(!error)verify=` · ตรวจสอบบนเซิร์ฟเวอร์แล้วมี ${count} งาน`; }catch(e){}
const now=new Date();
imp.ok=added; imp.fail=failed;
imp.at=now.getDate()+" "+MTH[now.getMonth()]+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
imp.state=failed?"fail":"done";
imp.msg=verify?esc(verify.replace(" · ","")):"";
paintImp();
if(failed){
out.innerHTML=`<div class="banner bad" style="margin-bottom:10px">นำเข้าได้ ${added} งาน · <b>ล้มเหลว ${failed} งาน</b></div>`+errBox(firstErr||{});
}else{
out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} นำเข้าสำเร็จ ${added} งาน${noHead?" (ไม่พบบรรทัดหัวตาราง ระบบอ่านตามลำดับคอลัมน์มาตรฐานให้)":""}${verify}${newG.length?` · สร้างกลุ่มใหม่: ${esc(newG.join(", "))}`:""}${newC.length?` · สร้างบริษัทใหม่: ${esc(newC.join(", "))}`:""}${newGL.length?` · สร้างหมวด GL ใหม่ ${newGL.length} หมวด`:""}</div>`;
el("csvtext").value="";
}
}
async function importIdx(txt,out){
imp={state:"run",ok:0,fail:0,total:0,msg:"",at:""}; paintImp();
const rows=parseCSV(txt); const head=rows[0].map(h=>h.replace(/\uFEFF/g,"").trim());
const gi=n=>head.indexOf(n), get=(r,n)=>{const i=gi(n);return i<0?"":String(r[i]==null?"":r[i]).trim();};
const body=rows.slice(1); let ok=0,fail=0,err=null; imp.total=body.length; paintImp();
for(const r of body){
const title=get(r,"สารบัญ")||get(r,"ชื่อระบบ"); if(!title)continue;
try{ await DB.collection("index").add({title,group:get(r,"กลุ่มงาน"),owner:get(r,"ผู้ดูแล")||get(r,"ผู้ดูแลเอกสาร / เว็บไซต์"),
url:get(r,"ลิงก์")||get(r,"URL"),status:IDXSTATUS.includes(get(r,"สถานะ"))?get(r,"สถานะ"):"ใช้งานอยู่",
detail:get(r,"รายละเอียดเอกสาร")||get(r,"รายละเอียด"),note:get(r,"หมายเหตุ")}); ok++; }
catch(e){ fail++; if(!err)err=e; }
imp.ok=ok; imp.fail=fail; paintImp(); }
const now=new Date();
imp.at=now.getDate()+" "+MTH[now.getMonth()]+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
imp.state=fail?"fail":"done"; imp.msg="Index Online"; paintImp();
out.innerHTML=fail?`<div class="banner bad">นำเข้าได้ ${ok} · ล้มเหลว ${fail}</div>`+errBox(err||{})
:`<div class="banner ok">${svg(ICON.check,19)} นำเข้า Index Online ${ok} รายการ — ดูที่เมนู “Index Online”</div>`;
if(!fail)el("csvtext").value=""; render();
}
async function importLegal(txt,out){
imp={state:"run",ok:0,fail:0,total:0,msg:"",at:""}; paintImp();
const rows=parseCSV(txt);
const head=rows[0].map(h=>h.replace(/\uFEFF/g,"").trim());
const idx=n=>head.indexOf(n), get=(r,n)=>{const i=idx(n);return i<0?"":String(r[i]==null?"":r[i]).trim();};
const body=rows.slice(1);
let ok=0,fail=0,err=null,newC=[];
imp.total=body.length; paintImp();
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v:null;
for(const r of body){
const title=get(r,"ชื่อรายการ"); if(!title)continue;
const comps=get(r,"บริษัทที่ต้องมี").split(/[,;|]/).map(x=>x.trim()).filter(Boolean).map(lab=>{
let c=companies.find(x=>x.label===lab||x.label.includes(lab));
if(!c){c={key:"c"+Date.now().toString(36)+ok+Math.floor(Math.random()*99),label:lab};companies.push(c);newC.push(lab);}
return c.key;});
const cat=LEGALCAT.includes(get(r,"หมวด"))?get(r,"หมวด"):LEGALCAT[0];
try{ await DB.collection("legal").add({title,cat,unit:get(r,"ตำแหน่ง/หน่วยงาน")||get(r,"หน่วยงาน"),
person:get(r,"ผู้รับผิดชอบ"),comps,issued:iso(get(r,"วันที่ออก")),expires:iso(get(r,"วันหมดอายุ")),
cycle:+get(r,"รอบทบทวน(เดือน)")||0,lifetime:/^(true|1|ใช่|ไม่มีกำหนด)$/i.test(get(r,"ไม่มีวันหมดอายุ")),
note:get(r,"เงื่อนไข/หมายเหตุ")||get(r,"หมายเหตุ")}); ok++; }
catch(e){ fail++; if(!err)err=e; }
imp.ok=ok; imp.fail=fail; paintImp();
}
try{ if(newC.length)await saveMeta("companies",companies); }catch(e){}
const now=new Date();
imp.at=now.getDate()+" "+MTH[now.getMonth()]+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
imp.state=fail?"fail":"done"; imp.msg="ทะเบียนกฎหมาย"; paintImp();
out.innerHTML=fail?`<div class="banner bad">นำเข้าได้ ${ok} · ล้มเหลว ${fail}</div>`+errBox(err||{})
:`<div class="banner ok">${svg(ICON.check,19)} นำเข้าทะเบียนกฎหมาย ${ok} รายการ${newC.length?" · สร้างบริษัทใหม่ "+esc(newC.join(", ")):""} — ดูที่เมนู “กฎหมาย”</div>`;
if(!fail)el("csvtext").value="";
render();
}
function exportCSV(name,head,rows){
const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
const csv="\ufeff"+[head.map(q).join(","),...rows.map(r=>r.map(q).join(","))].join("\n");
const a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
a.download=name+"-"+R.year+".csv"; document.body.appendChild(a); a.click();
setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
const out=el("csvout2"); if(out)out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} ดาวน์โหลดไฟล์แล้วค่ะ</div>`;
}
