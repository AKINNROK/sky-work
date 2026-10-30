// ---------- โฟลเดอร์จัดระเบียบ Note ----------
let noteFolders=[];                      // [{id,name,color}]
const FLD_COLORS=["#2f80c8","#2e9e6b","#e08a1e","#c94c4c","#8a5cc7","#3aa5a5","#d1568f","#6b7a89"];
const folderOf=key=>noteFolders.find(f=>f.id===key);
const folderName=key=>{ const f=folderOf(key); return f?f.name:"(ไม่พบโฟลเดอร์)"; };
const fldCount=key=>notes.filter(n=>key==="__none"?!n.folder||!folderOf(n.folder):n.folder===key).length;
async function fldSave(list){ noteFolders=list; await saveMeta("nfolders",noteFolders); }
function askText(msg,def="",yes="ตกลง"){
el("cmsg").innerHTML=msg+`<div style="margin-top:14px"><input id="ctext" maxlength="60" value="${esc(def)}" style="width:100%;background:var(--paper);border:0;border-radius:var(--r-xs);padding:12px 14px;font-size:15px"></div>`;
el("cyes").textContent=yes; el("cyes").style.display=""; el("cno").textContent="ยกเลิก";
el("cdlg").showModal(); setTimeout(()=>{ const i=el("ctext"); if(i){ i.focus(); i.select(); i.onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); el("cyes").click(); } }; } },30);
return new Promise(r=>{ cResolve=v=>r(v?((el("ctext")&&el("ctext").value)||"").trim():null); });
}
async function fldCreate(name){
name=(name||"").trim(); if(!name)return null;
const ex=noteFolders.find(f=>f.name===name); if(ex)return ex.id;
const f={id:"f"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,color:FLD_COLORS[noteFolders.length%FLD_COLORS.length]};
await fldSave([...noteFolders,f]); return f.id;
}
// เลือกโฟลเดอร์ปลายทาง — คืน id | "" (ไม่อยู่โฟลเดอร์) | null (ยกเลิก)
async function pickFolder(cur){
const opts=`<option value="">— ไม่อยู่ในโฟลเดอร์ —</option>`+noteFolders.map(f=>`<option value="${esc(f.id)}"${f.id===cur?" selected":""}>📁 ${esc(f.name)}</option>`).join("")+`<option value="__new">＋ สร้างโฟลเดอร์ใหม่…</option>`;
const v=await askPick("ย้ายไปโฟลเดอร์ไหนคะ?",opts,"ย้าย");
if(v===null)return null;
if(v==="__new"){ const nm=await askText("ตั้งชื่อโฟลเดอร์ใหม่","","สร้างและย้าย"); if(!nm)return null; return await fldCreate(nm); }
return v;
}
async function noteMoveTo(ids,folder){
for(const id of ids){ try{ await DB.collection("note").doc(id).set({folder},{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; } }
setFoot(folder?"ย้ายไปโฟลเดอร์ “"+folderName(folder)+"” แล้ว":"เอาออกจากโฟลเดอร์แล้ว");
}
function noteFolderBar(){
const cur=R.noteFolder||"";
const chip=(key,label,n,col)=>`<button type="button" class="fchip${cur===key?" on":""}" data-fld="${esc(key)}"${key&&key!=="__none"?` data-fdrop="${esc(key)}"`:key==="__none"?` data-fdrop=""`:""}>${col?`<i style="background:${col}"></i>`:""}<span>${esc(label)}</span><b>${n}</b></button>`;
return `<div class="fbar" id="fbar">${chip("","ทั้งหมด",notes.length)}${noteFolders.map(f=>chip(f.id,f.name,fldCount(f.id),f.color)).join("")}${noteFolders.length?chip("__none","ยังไม่จัดโฟลเดอร์",fldCount("__none")):""}
<button type="button" class="fchip add" id="fld-add">＋ โฟลเดอร์</button>${noteFolders.length?`<button type="button" class="fchip add" id="fld-mng">จัดการ</button>`:""}</div>`;
}
function noteFolderTag(n){ const f=n.folder&&folderOf(n.folder); return f?`<span class="tag" style="background:${f.color}22;color:${f.color}" title="โฟลเดอร์">📁 ${esc(f.name)}</span>`:""; }
function noteFolderFilter(n){ const c=R.noteFolder||""; if(!c)return true; if(c==="__none")return !n.folder||!folderOf(n.folder); return n.folder===c; }
function fldManage(){
const box=el("fl-list");
box.innerHTML=noteFolders.length?noteFolders.map((f,i)=>`<div class="flrow"><i style="background:${f.color}"></i><input class="nm" data-flname="${esc(f.id)}" value="${esc(f.name)}" aria-label="ชื่อโฟลเดอร์"><span class="flc">${fldCount(f.id)} รายการ</span>
<button class="iconbtn" data-flmv="${i}:-1" ${i===0?"disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,15)}</button><button class="iconbtn" data-flmv="${i}:1" ${i===noteFolders.length-1?"disabled":""} title="เลื่อนลง">${svg(ICON_DN,15)}</button>
<button class="iconbtn" data-flcol="${esc(f.id)}" title="เปลี่ยนสี">🎨</button><button class="iconbtn" data-fldel="${esc(f.id)}" title="ลบโฟลเดอร์" style="color:var(--over)">✕</button></div>`).join(""):`<div class="empty">ยังไม่มีโฟลเดอร์</div>`;
box.querySelectorAll("[data-flname]").forEach(i=>i.onchange=async()=>{ const nm=i.value.trim(); if(!nm){ fldManage(); return; } await fldSave(noteFolders.map(f=>f.id===i.dataset.flname?{...f,name:nm}:f)); });
box.querySelectorAll("[data-flmv]").forEach(b=>b.onclick=async()=>{ const [i,d]=b.dataset.flmv.split(":").map(Number), a=noteFolders.slice(), j=i+d; if(j<0||j>=a.length)return; [a[i],a[j]]=[a[j],a[i]]; await fldSave(a); fldManage(); });
box.querySelectorAll("[data-flcol]").forEach(b=>b.onclick=async()=>{ const f=folderOf(b.dataset.flcol), k=(FLD_COLORS.indexOf(f.color)+1)%FLD_COLORS.length; await fldSave(noteFolders.map(x=>x.id===f.id?{...x,color:FLD_COLORS[k]}:x)); fldManage(); });
box.querySelectorAll("[data-fldel]").forEach(b=>b.onclick=async()=>{
const f=folderOf(b.dataset.fldel), n=notes.filter(x=>x.folder===f.id);
el("fldlg").close();
const ok=await ask(`ลบโฟลเดอร์ “${esc(f.name)}” ใช่ไหมคะ?<div class="hint">บันทึกในโฟลเดอร์ ${n.length} รายการจะ <b>ไม่ถูกลบ</b> แค่ย้ายไปเป็น “ยังไม่จัดโฟลเดอร์”</div>`,"ลบโฟลเดอร์");
if(ok){ await noteMoveTo(n.map(x=>x._id),""); await fldSave(noteFolders.filter(x=>x.id!==f.id)); if(R.noteFolder===f.id)R.noteFolder=""; render(); }
if(noteFolders.length){ fldManage(); el("fldlg").showModal(); }
});
}
async function fldNew(andPick){
const nm=await askText("ตั้งชื่อโฟลเดอร์ใหม่ เช่น “ประชุมประจำเดือน” “งานสรรหา”","","สร้างโฟลเดอร์");
if(!nm)return null; const id=await fldCreate(nm); if(andPick){ R.noteFolder=id; render(); } return id;
}
function noteFolderWire(){
document.querySelectorAll("[data-fld]").forEach(b=>b.onclick=()=>{ R.noteFolder=b.dataset.fld; render(); });
el("fld-add")&&(el("fld-add").onclick=()=>fldNew(true));
el("fld-mng")&&(el("fld-mng").onclick=()=>{ fldManage(); el("fldlg").showModal(); });
document.querySelectorAll("[data-ntmv]").forEach(b=>b.onclick=async e=>{
e.stopPropagation(); const n=notes.find(v=>v._id===b.dataset.ntmv); if(!n)return;
const v=await pickFolder(n.folder||""); if(v===null)return; await noteMoveTo([n._id],v); });
// ลากการ์ดไปวางบนชิปโฟลเดอร์ (คอมพิวเตอร์) — บนมือถือ/ไอแพดใช้ปุ่ม “ย้าย”
document.querySelectorAll(".notecard[data-nt]").forEach(c=>{ c.draggable=true; c.ondragstart=e=>{ e.dataTransfer.setData("text/plain",c.dataset.nt); e.dataTransfer.effectAllowed="move"; c.classList.add("dragging"); }; c.ondragend=()=>c.classList.remove("dragging"); });
document.querySelectorAll("[data-fdrop]").forEach(z=>{
z.ondragover=e=>{ e.preventDefault(); z.classList.add("over"); }; z.ondragleave=()=>z.classList.remove("over");
z.ondrop=async e=>{ e.preventDefault(); z.classList.remove("over"); const id=e.dataTransfer.getData("text/plain"); if(id&&notes.some(n=>n._id===id))await noteMoveTo([id],z.dataset.fdrop); };
});
}
(function(){ if(!el("fldlg"))return; el("fl-close").onclick=()=>el("fldlg").close(); el("fl-new").onclick=async()=>{ el("fldlg").close(); await fldNew(false); fldManage(); el("fldlg").showModal(); }; })();
