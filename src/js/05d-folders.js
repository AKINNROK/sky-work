// ---------- โฟลเดอร์จัดระเบียบ Note (ซ้อนโฟลเดอร์ได้ — field parent) ----------
let noteFolders=[];                      // [{id,name,color,parent?}]
const FLD_COLORS=["#2f80c8","#2e9e6b","#e08a1e","#c94c4c","#8a5cc7","#3aa5a5","#d1568f","#6b7a89"];
const FLD_MAXD=5;                        // ซ้อนได้สูงสุด 5 ชั้น
const folderOf=key=>noteFolders.find(f=>f.id===key);
const fldParentOf=f=>{ const p=f&&f.parent; return (p&&p!==f.id&&noteFolders.some(x=>x.id===p))?p:""; };
const fldKids=id=>noteFolders.filter(f=>fldParentOf(f)===(id||""));
function fldTree(){ const out=[], seen=new Set(); const walk=(pid,d)=>{ fldKids(pid).forEach(f=>{ if(seen.has(f.id)||d>FLD_MAXD+3)return; seen.add(f.id); out.push({f,d}); walk(f.id,d+1); }); }; walk("",0); noteFolders.forEach(f=>{ if(!seen.has(f.id)){ seen.add(f.id); out.push({f,d:0}); } }); return out; }
function fldPath(id){ const a=[], seen=new Set(); let f=folderOf(id); while(f&&!seen.has(f.id)){ seen.add(f.id); a.unshift(f); f=folderOf(fldParentOf(f)); } return a; }
const fldDepth=id=>Math.max(0,fldPath(id).length-1);
const folderName=key=>{ const a=fldPath(key); return a.length?a.map(f=>f.name).join(" › "):"(ไม่พบโฟลเดอร์)"; };
function fldDesc(id){ const out=[id]; const walk=p=>fldKids(p).forEach(k=>{ if(!out.includes(k.id)){ out.push(k.id); walk(k.id); } }); walk(id); return out; }
const fldCount=key=>{ if(key==="__none")return notes.filter(n=>!n.folder||!folderOf(n.folder)).length; const ids=new Set(fldDesc(key)); return notes.filter(n=>ids.has(n.folder)).length; };
const fldDirect=key=>notes.filter(n=>n.folder===key).length;
async function fldSave(list){ noteFolders=list; await saveMeta("nfolders",noteFolders); }
function askText(msg,def="",yes="ตกลง"){
el("cmsg").innerHTML=msg+`<div style="margin-top:14px"><input id="ctext" maxlength="60" value="${esc(def)}" style="width:100%;background:var(--paper);border:0;border-radius:var(--r-xs);padding:12px 14px;font-size:15px"></div>`;
el("cyes").textContent=yes; el("cyes").style.display=""; el("cno").textContent="ยกเลิก";
el("cdlg").showModal(); setTimeout(()=>{ const i=el("ctext"); if(i){ i.focus(); i.select(); i.onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); el("cyes").click(); } }; } },30);
return new Promise(r=>{ cResolve=v=>r(v?((el("ctext")&&el("ctext").value)||"").trim():null); });
}
async function fldCreate(name,parent){
name=(name||"").trim(); if(!name)return null; parent=parent&&folderOf(parent)?parent:"";
if(parent&&fldDepth(parent)>=FLD_MAXD-1){ tell("ซ้อนโฟลเดอร์ได้สูงสุด "+FLD_MAXD+" ชั้นค่ะ"); return null; }
const ex=noteFolders.find(f=>f.name===name&&fldParentOf(f)===parent); if(ex)return ex.id;
const f={id:"f"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,color:(parent&&(folderOf(parent)||{}).color)||FLD_COLORS[noteFolders.length%FLD_COLORS.length]};
if(parent)f.parent=parent;
await fldSave([...noteFolders,f]); return f.id;
}
// เลือกโฟลเดอร์ปลายทาง — คืน id | "" (ไม่อยู่โฟลเดอร์) | null (ยกเลิก)
const fldOptHtml=(cur,skip)=>fldTree().filter(({f})=>!skip||!skip.includes(f.id)).map(({f,d})=>`<option value="${esc(f.id)}"${f.id===cur?" selected":""}>${"\u00a0\u00a0\u00a0".repeat(d)}📁 ${esc(f.name)}</option>`).join("");
async function pickFolder(cur){
const here=R.noteFolder&&R.noteFolder!=="__none"&&folderOf(R.noteFolder)?R.noteFolder:"";
const opts=`<option value="">— ไม่อยู่ในโฟลเดอร์ —</option>`+fldOptHtml(cur)+`<option value="__new">＋ สร้างโฟลเดอร์ใหม่ (ระดับบนสุด)…</option>`+(here?`<option value="__newsub">＋ สร้างโฟลเดอร์ย่อยใน “${esc(folderName(here))}”…</option>`:"");
const v=await askPick("ย้ายไปโฟลเดอร์ไหนคะ?",opts,"ย้าย");
if(v===null)return null;
if(v==="__new"||v==="__newsub"){ const nm=await askText(v==="__new"?"ตั้งชื่อโฟลเดอร์ใหม่":"ตั้งชื่อโฟลเดอร์ย่อยใหม่","","สร้างและย้าย"); if(!nm)return null; return await fldCreate(nm,v==="__newsub"?here:""); }
return v;
}
async function noteMoveTo(ids,folder){
for(const id of ids){ try{ await DB.collection("note").doc(id).set({folder},{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; } }
setFoot(folder?"ย้ายไปโฟลเดอร์ “"+folderName(folder)+"” แล้ว":"เอาออกจากโฟลเดอร์แล้ว");
}
function noteFolderBar(){
const cur=R.noteFolder||"", valid=cur&&cur!=="__none"&&folderOf(cur);
const chip=(key,label,n,col,on)=>`<button type="button" class="fchip${on!==undefined?(on?" on":""):(cur===key?" on":"")}" data-fld="${esc(key)}"${key&&key!=="__none"?` data-fdrop="${esc(key)}"`:key==="__none"?` data-fdrop=""`:""}>${col?`<i style="background:${col}"></i>`:""}<span>${esc(label)}</span><b>${n}</b></button>`;
if(valid){
const path=fldPath(cur), kids=fldKids(cur), sub=R.noteSub!==false;
return `<div class="fbar" id="fbar">${chip("","ทั้งหมด",notes.length,"",false)}${path.map((f,i)=>`<span class="fsep">›</span>`+chip(f.id,f.name,fldCount(f.id),f.color,i===path.length-1)).join("")}</div>
<div class="fbar" id="fbar2">${kids.map(f=>chip(f.id,f.name,fldCount(f.id),f.color,false)).join("")}${kids.length?"":`<span class="hint" style="margin:0;align-self:center">ยังไม่มีโฟลเดอร์ย่อย</span>`}
${fldDepth(cur)<FLD_MAXD-1?`<button type="button" class="fchip add" id="fld-addsub">＋ โฟลเดอร์ย่อย</button>`:""}<button type="button" class="fchip add" id="fld-mng">จัดการ</button>${kids.length?`<button type="button" class="fchip add" id="fld-sub" aria-pressed="${sub}">${sub?"✓ ":""}รวมบันทึกในโฟลเดอร์ย่อย</button>`:""}</div>`;
}
const roots=fldKids("");
return `<div class="fbar" id="fbar">${chip("","ทั้งหมด",notes.length)}${roots.map(f=>chip(f.id,f.name,fldCount(f.id),f.color)).join("")}${noteFolders.length?chip("__none","ยังไม่จัดโฟลเดอร์",fldCount("__none")):""}
<button type="button" class="fchip add" id="fld-add">＋ โฟลเดอร์</button>${noteFolders.length?`<button type="button" class="fchip add" id="fld-mng">จัดการ</button>`:""}</div>`;
}
function noteFolderTag(n){ const f=n.folder&&folderOf(n.folder); return f?`<span class="tag" style="background:${f.color}22;color:${f.color}" title="โฟลเดอร์">📁 ${esc(folderName(f.id))}</span>`:""; }
function noteFolderFilter(n){ const c=R.noteFolder||""; if(!c)return true; if(c==="__none")return !n.folder||!folderOf(n.folder); if(R.noteSub===false)return n.folder===c; return fldDesc(c).includes(n.folder); }
function fldManage(){
const box=el("fl-list"), T=fldTree();
box.innerHTML=T.length?T.map(({f,d})=>{ const sib=fldKids(fldParentOf(f)), i=sib.indexOf(f);
return `<div class="flrow" style="padding-left:${d*20}px">${d?`<span class="fsep" style="margin:0 2px 0 0">└</span>`:""}<i style="background:${f.color}"></i><input class="nm" data-flname="${esc(f.id)}" value="${esc(f.name)}" aria-label="ชื่อโฟลเดอร์"><span class="flc">${fldDirect(f.id)}${fldKids(f.id).length?" ("+fldCount(f.id)+")":""} รายการ</span>
${fldDepth(f.id)<FLD_MAXD-1?`<button class="iconbtn" data-flsub="${esc(f.id)}" title="เพิ่มโฟลเดอร์ย่อย" style="font-size:13px">＋</button>`:""}<button class="iconbtn" data-flmvp="${esc(f.id)}" title="ย้ายโฟลเดอร์นี้ไปไว้ใน…" style="font-size:12px">ย้าย</button>
<button class="iconbtn" data-flmv="${esc(f.id)}:-1" ${i<=0?"disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,15)}</button><button class="iconbtn" data-flmv="${esc(f.id)}:1" ${i>=sib.length-1?"disabled":""} title="เลื่อนลง">${svg(ICON_DN,15)}</button>
<button class="iconbtn" data-flcol="${esc(f.id)}" title="เปลี่ยนสี">🎨</button><button class="iconbtn" data-fldel="${esc(f.id)}" title="ลบโฟลเดอร์" style="color:var(--over)">✕</button></div>`; }).join(""):`<div class="empty">ยังไม่มีโฟลเดอร์</div>`;
box.querySelectorAll("[data-flname]").forEach(i=>i.onchange=async()=>{ const nm=i.value.trim(); if(!nm){ fldManage(); return; } await fldSave(noteFolders.map(f=>f.id===i.dataset.flname?{...f,name:nm}:f)); });
box.querySelectorAll("[data-flmv]").forEach(b=>b.onclick=async()=>{ const [id,dd]=b.dataset.flmv.split(":"), f=folderOf(id), sib=fldKids(fldParentOf(f)), k=sib.indexOf(f)+(+dd); if(k<0||k>=sib.length)return; const a=noteFolders.slice(), x=a.indexOf(f), y=a.indexOf(sib[k]); [a[x],a[y]]=[a[y],a[x]]; await fldSave(a); fldManage(); });
box.querySelectorAll("[data-flcol]").forEach(b=>b.onclick=async()=>{ const f=folderOf(b.dataset.flcol), k=(FLD_COLORS.indexOf(f.color)+1)%FLD_COLORS.length; await fldSave(noteFolders.map(x=>x.id===f.id?{...x,color:FLD_COLORS[k]}:x)); fldManage(); });
box.querySelectorAll("[data-flsub]").forEach(b=>b.onclick=async()=>{ const pid=b.dataset.flsub; el("fldlg").close(); const nm=await askText("ตั้งชื่อโฟลเดอร์ย่อยใน “"+esc(folderName(pid))+"”","","สร้าง"); if(nm)await fldCreate(nm,pid); fldManage(); el("fldlg").showModal(); });
box.querySelectorAll("[data-flmvp]").forEach(b=>b.onclick=async()=>{ const f=folderOf(b.dataset.flmvp); el("fldlg").close();
const bad=fldDesc(f.id), depthBelow=Math.max(...fldDesc(f.id).map(id=>fldDepth(id)-fldDepth(f.id)));
const opts=`<option value=""${!fldParentOf(f)?" selected":""}>(ระดับบนสุด)</option>`+fldTree().filter(({f:x})=>!bad.includes(x.id)&&fldDepth(x.id)+1+depthBelow<FLD_MAXD).map(({f:x,d})=>`<option value="${esc(x.id)}"${fldParentOf(f)===x.id?" selected":""}>${"\u00a0\u00a0\u00a0".repeat(d)}📁 ${esc(x.name)}</option>`).join("");
const v=await askPick("ย้ายโฟลเดอร์ “"+esc(f.name)+"” ไปไว้ใน…",opts,"ย้าย");
if(v!==null){ await fldSave(noteFolders.map(x=>{ if(x.id!==f.id)return x; const o={...x}; if(v)o.parent=v; else delete o.parent; return o; })); }
fldManage(); el("fldlg").showModal(); });
box.querySelectorAll("[data-fldel]").forEach(b=>b.onclick=async()=>{
const f=folderOf(b.dataset.fldel), n=notes.filter(x=>x.folder===f.id), kids=fldKids(f.id), up=fldParentOf(f);
el("fldlg").close();
const ok=await ask(`ลบโฟลเดอร์ “${esc(f.name)}” ใช่ไหมคะ?<div class="hint">บันทึกในโฟลเดอร์ ${n.length} รายการ <b>ไม่ถูกลบ</b> — ย้ายไป${up?" “"+esc(folderName(up))+"”":"เป็น “ยังไม่จัดโฟลเดอร์”"}${kids.length?` · โฟลเดอร์ย่อย ${kids.length} โฟลเดอร์ จะเลื่อนขึ้นมาแทน (ไม่ถูกลบ)`:""}</div>`,"ลบโฟลเดอร์");
if(ok){ await noteMoveTo(n.map(x=>x._id),up); await fldSave(noteFolders.filter(x=>x.id!==f.id).map(x=>{ if(fldParentOf(x)!==f.id)return x; const o={...x}; if(up)o.parent=up; else delete o.parent; return o; })); if(R.noteFolder===f.id)R.noteFolder=up; render(); }
if(noteFolders.length){ fldManage(); el("fldlg").showModal(); }
});
}
async function fldNew(andPick,parent){
const nm=await askText(parent?"ตั้งชื่อโฟลเดอร์ย่อยใน “"+esc(folderName(parent))+"”":"ตั้งชื่อโฟลเดอร์ใหม่ เช่น “ประชุมประจำเดือน” “งานสรรหา”","","สร้างโฟลเดอร์");
if(!nm)return null; const id=await fldCreate(nm,parent); if(id&&andPick){ R.noteFolder=id; render(); } return id;
}
function noteFolderWire(){
document.querySelectorAll("[data-fld]").forEach(b=>b.onclick=()=>{ R.noteFolder=b.dataset.fld; render(); });
el("fld-add")&&(el("fld-add").onclick=()=>fldNew(true,""));
el("fld-addsub")&&(el("fld-addsub").onclick=()=>fldNew(true,R.noteFolder));
el("fld-sub")&&(el("fld-sub").onclick=()=>{ R.noteSub=R.noteSub===false; render(); });
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
