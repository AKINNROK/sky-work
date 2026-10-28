// ===== เขียนบันทึก: To-do ติ๊กได้ · ย่อหน้า · สีตัวอักษร · แนบรูป · ตารางแบบ Excel =====
// (ใช้ร่วมกับตัวกรอง ntClean ใน 05-views-more.js — ถ้าเพิ่มรูปแบบใหม่ต้องอนุญาตที่ตัวกรองด้วย)
const NE_COLS=["#dc2626","#ea580c","#ca8a04","#16a34a","#0d9488","#2563eb","#7c3aed","#db2777","#6b7280"];
const NE_HIL=["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#e5e7eb"];
const NE_BG={y:"#fef9c3",g:"#dcfce7",b:"#dbeafe",r:"#fee2e2",p:"#f3e8ff",o:"#ffedd5",x:"#e5e7eb"};
let neRange=null, neScope="cell", neImgSel=null;

// ---------- ตัวช่วยเรื่อง selection ----------
function neIn(tags){ const s=getSelection(); let n=s.anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&tags.indexOf(n.tagName)>=0)return n; n=n.parentNode; } return null; }
const neCell=()=>neIn(["TD","TH"]);
const neLi=()=>neIn(["LI"]);
function neSave(){ const s=getSelection(); if(s.rangeCount&&NE().contains(s.getRangeAt(0).commonAncestorContainer))neRange=s.getRangeAt(0).cloneRange(); }
function neRestore(){
NE().focus(); const s=getSelection();
if(!neRange||!NE().contains(neRange.commonAncestorContainer)){ neRange=document.createRange(); neRange.selectNodeContents(NE()); neRange.collapse(false); }
s.removeAllRanges(); s.addRange(neRange);
}
function neFocusCell(c,end){ const r=document.createRange(); r.selectNodeContents(c); r.collapse(!end); const s=getSelection(); s.removeAllRanges(); s.addRange(r); try{ c.scrollIntoView({block:"nearest"}); }catch(e){} }

// ---------- เมนูลอย (สี / ตาราง / สีช่อง) ----------
function nePopEl(){
let p=el("nepop"); if(p)return p;
p=document.createElement("div"); p.id="nepop"; p.className="nepop"; p.hidden=true; el("ndlg").appendChild(p);
p.addEventListener("mousedown",e=>{ if(!e.target.closest("input"))e.preventDefault(); });
p.addEventListener("click",nePopClick); return p;
}
function nePopShow(html,anchor,key){
const p=nePopEl(); if(!p.hidden&&p.dataset.for===key){ p.hidden=true; return; }
p.innerHTML=html; p.hidden=false; p.dataset.for=key;
const r=anchor.getBoundingClientRect();
p.style.top=Math.max(8,Math.min(innerHeight-p.offsetHeight-8,r.bottom+6))+"px"; p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.left))+"px";
}
function neHideAll(){ const p=el("nepop"); if(p)p.hidden=true; neImgDeselect(); }
document.addEventListener("pointerdown",e=>{
const p=el("nepop"); if(p&&!p.hidden&&!e.target.closest("#nepop,[data-ne],[data-nt]"))p.hidden=true;
const b=el("neimgbar"); if(b&&!b.hidden&&!e.target.closest("#neimgbar,#n-body img"))neImgDeselect();
},true);
el("ndlg").addEventListener("close",neHideAll);
el("ndlg").addEventListener("scroll",()=>{ const p=el("nepop"); if(p)p.hidden=true; neImgPos(); },true);

const neColorHtml=()=>`<div class="nepl">สีตัวอักษร</div><div class="nesw">${NE_COLS.map(c=>`<button type="button" data-cc="fore:${c}" style="background:${c}" aria-label="สี ${c}"></button>`).join("")}<button type="button" class="nex" data-cc="fore:">ค่าเริ่มต้น</button></div>
<div class="nepl">ไฮไลต์พื้นหลัง</div><div class="nesw">${NE_HIL.map(c=>`<button type="button" data-cc="hil:${c}" style="background:${c}" aria-label="ไฮไลต์ ${c}"></button>`).join("")}<button type="button" class="nex" data-cc="hil:">ไม่มี</button></div>`;
const neTableHtml=()=>`<div class="nepl">แทรกตาราง</div><div class="nrow"><label>แถว <input type="number" id="net-r" min="1" max="50" value="3"></label><label>คอลัมน์ <input type="number" id="net-c" min="1" max="12" value="3"></label></div>
<label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="net-h" checked> แถวแรกเป็นหัวตาราง</label><button type="button" class="go" data-tmake="1">สร้างตาราง</button>`;
const neCellBgHtml=()=>`<div class="nepl">ใส่สีให้</div><div class="nesw">${[["cell","ช่องนี้"],["row","ทั้งแถว"],["col","ทั้งคอลัมน์"]].map(([k,l])=>`<button type="button" class="nex${neScope===k?" on":""}" data-scope="${k}">${l}</button>`).join("")}</div>
<div class="nepl">สี</div><div class="nesw">${Object.keys(NE_BG).map(k=>`<button type="button" data-cbg="${k}" style="background:${NE_BG[k]}" aria-label="สีช่อง"></button>`).join("")}<button type="button" class="nex" data-cbg="">ไม่มีสี</button></div>`;
function nePopClick(e){
const b=e.target.closest("button"); if(!b)return;
if(b.dataset.cc!=null){ const [k,v]=b.dataset.cc.split(":"); el("nepop").hidden=true; neColor(k,v); }
else if(b.dataset.tmake){ const r=Math.max(1,Math.min(50,+el("net-r").value||3)), c=Math.max(1,Math.min(12,+el("net-c").value||3)); el("nepop").hidden=true; neInsertTable(Array.from({length:r},()=>Array(c).fill("")),el("net-h").checked); }
else if(b.dataset.scope){ neScope=b.dataset.scope; el("nepop").innerHTML=neCellBgHtml(); }
else if(b.dataset.cbg!=null){ neCellBg(b.dataset.cbg); el("nepop").hidden=true; }
}

// ---------- สีตัวอักษร / ไฮไลต์ ----------
function neColor(kind,hex){
neRestore();
if(!hex){ neClearColor(kind==="fore"?"color":"backgroundColor"); neSave(); neState(); return; }
document.execCommand("styleWithCSS",false,true);
if(kind==="fore")document.execCommand("foreColor",false,hex);
else{ document.execCommand("hiliteColor",false,hex); document.execCommand("foreColor",false,"#1f2937"); }
document.execCommand("styleWithCSS",false,false); neSave(); neState();
}
function neClearColor(prop){
const s=getSelection(); if(!s.rangeCount)return; const r=s.getRangeAt(0);
NE().querySelectorAll("span[style]").forEach(sp=>{ if(!r.intersectsNode(sp))return;
 const hadBg=!!sp.style.backgroundColor; sp.style[prop]=""; if(prop==="backgroundColor"&&hadBg)sp.style.color="";
 if(!sp.getAttribute("style")){ sp.removeAttribute("style"); if(!sp.className){ while(sp.firstChild)sp.parentNode.insertBefore(sp.firstChild,sp); sp.remove(); } } });
}

// ---------- ช่องติ๊ก (To-do) ----------
function neCheck(){
NE().focus(); let li=neLi();
if(li&&li.parentNode.tagName==="UL"){ const ul=li.parentNode;
 if(ul.classList.contains("ck")){ ul.classList.remove("ck"); ul.querySelectorAll(":scope>li").forEach(l=>l.removeAttribute("data-c")); } else ul.classList.add("ck"); }
else{ document.execCommand("insertUnorderedList"); li=neLi(); if(li&&li.parentNode.tagName==="UL")li.parentNode.classList.add("ck"); }
neState();
}
function neCkHit(e){
const li=e.target.closest&&e.target.closest("li"); if(!li||e.target!==li)return null;
const ul=li.parentNode; if(!ul||!ul.classList||!ul.classList.contains("ck"))return null;
return e.clientX>li.getBoundingClientRect().left+28?null:li;
}
function neCkToggle(li){ if(li.getAttribute("data-c")==="1")li.removeAttribute("data-c"); else li.setAttribute("data-c","1"); }
async function ntCkSave(){
const n=viewingNote; if(!n||n.fmt!=="h")return; const body=ntClean(el("nvb").innerHTML); n.body=body;
try{ await DB.collection("note").doc(n._id).set({body},{merge:true}); }catch(e){}
}
el("nvb").addEventListener("click",e=>{ const li=neCkHit(e); if(!li)return; neCkToggle(li); ntCkSave(); });

// ---------- ย่อหน้า ----------
function neBlocks(){
const s=getSelection(); if(!s.rangeCount)return []; const r=s.getRangeAt(0);
return [...NE().querySelectorAll("p,div,h2,h3,blockquote")].filter(b=>!b.querySelector("p,div,h2,h3,blockquote,table,ul,ol")&&!b.closest("li")&&r.intersectsNode(b));
}
function neIndent(dir){
NE().focus();
if(neLi()){ document.execCommand(dir>0?"indent":"outdent"); NE().querySelectorAll("ul.ck ul").forEach(u=>u.classList.add("ck")); neState(); return; }
let bl=neBlocks();
if(!bl.length&&!neCell()){ document.execCommand("formatBlock",false,"p"); bl=neBlocks(); }
bl.forEach(b=>{ const v=Math.max(0,Math.min(6,(+b.getAttribute("data-i")||0)+dir)); if(v)b.setAttribute("data-i",v); else b.removeAttribute("data-i"); });
neState();
}

// ---------- ตาราง ----------
function neInsertTable(rows,head){
neRestore(); const cur=neCell(), li=neLi(); let after=null;
if(cur)after=cur.closest("table"); else if(li){ after=li.closest("ul,ol"); while(after.parentNode&&after.parentNode.closest&&after.parentNode.closest("li"))after=after.parentNode.closest("ul,ol"); }

const n=Math.max(...rows.map(r=>r.length));
const html=`<table class="nt" id="ne-new"><tbody>${rows.map((r,i)=>"<tr>"+Array.from({length:n},(_,j)=>{ const t=head&&i===0?"th":"td"; const v=r[j]; return `<${t}>${v?esc(v):"<br>"}</${t}>`; }).join("")+"</tr>").join("")}</tbody></table><p><br></p>`;
if(after){ const w=document.createElement("div"); w.innerHTML=html; after.after(w.querySelector("table"),w.querySelector("p"));
 if(li&&!li.textContent.trim()&&!li.querySelector("img,table")){ const ul=li.parentNode; li.remove(); if(ul&&!ul.children.length)ul.remove(); } }
else document.execCommand("insertHTML",false,html);
const t=el("ne-new"); if(t){ t.removeAttribute("id"); neFocusCell(t.rows[0].cells[0]); }
neState();
}
function neTbOp(op){
const c=neCell(); if(!c)return; const tr=c.parentNode, tb=c.closest("table"), rows=[...tb.rows], ci=c.cellIndex;
const mk=t=>{ const x=document.createElement(t); x.innerHTML="<br>"; return x; };
if(op==="rowa"||op==="rowb"){ const nr=document.createElement("tr"); for(let i=0;i<tr.cells.length;i++)nr.appendChild(mk("td")); if(op==="rowa")tr.before(nr); else tr.after(nr); }
else if(op==="rowd"){ if(rows.length<=1)tb.remove(); else{ const nx=tr.nextElementSibling||tr.previousElementSibling; tr.remove(); neFocusCell(nx.cells[Math.min(ci,nx.cells.length-1)]); } }
else if(op==="cola"||op==="colb"){ rows.forEach(r=>{ const x=r.cells[ci], n=mk(x&&x.tagName==="TH"?"th":"td"); if(x){ if(op==="cola")x.before(n); else x.after(n); } else r.appendChild(n); }); }
else if(op==="cold"){ if(tr.cells.length<=1)tb.remove(); else{ const keep=c.nextElementSibling||c.previousElementSibling; rows.forEach(r=>{ if(r.cells[ci])r.cells[ci].remove(); }); neFocusCell(keep); } }
else if(op==="head"){ const r0=rows[0], toTh=r0.cells[0].tagName!=="TH"; [...r0.cells].forEach(x=>{ const n=document.createElement(toTh?"th":"td"); n.innerHTML=x.innerHTML; if(x.getAttribute("data-bg"))n.setAttribute("data-bg",x.getAttribute("data-bg")); x.replaceWith(n); }); }
else if(op==="tdel"){ tb.remove(); NE().focus(); }
neExtraState();
}
function neCellBg(k){
const c=neCell(); if(!c)return; let cs=[c]; const tb=c.closest("table");
if(neScope==="row")cs=[...c.parentNode.cells]; else if(neScope==="col")cs=[...tb.rows].map(r=>r.cells[c.cellIndex]).filter(Boolean);
cs.forEach(x=>{ if(k)x.setAttribute("data-bg",k); else x.removeAttribute("data-bg"); });
}
function neCellMove(c,dir){
const tb=c.closest("table"), all=[...tb.querySelectorAll("th,td")], i=all.indexOf(c)+dir;
if(i<0)return;
if(i>=all.length){ const tr=c.parentNode; neTbOp("rowb"); const nx=tr.nextElementSibling; if(nx)neFocusCell(nx.cells[0]); return; }
neFocusCell(all[i]);
}
function neCellDown(c){
const tr=c.parentNode, ci=c.cellIndex; let nx=tr.nextElementSibling;
if(!nx){ neTbOp("rowb"); nx=tr.nextElementSibling; }
if(nx)neFocusCell(nx.cells[Math.min(ci,nx.cells.length-1)]);
}
function neFillTable(c,rows){
const tb=c.closest("table"), r0=[...tb.rows].indexOf(c.parentNode), c0=c.cellIndex;
rows.forEach((row,i)=>{
 while(tb.rows.length<=r0+i){ const nr=tb.insertRow(-1); for(let k=0;k<tb.rows[0].cells.length;k++){ const x=document.createElement("td"); x.innerHTML="<br>"; nr.appendChild(x); } }
 row.forEach((v,j)=>{ const need=c0+j+1; [...tb.rows].forEach(r=>{ while(r.cells.length<need){ const x=document.createElement("td"); x.innerHTML="<br>"; r.appendChild(x); } }); tb.rows[r0+i].cells[c0+j].textContent=v; }); });
neFocusCell(c,true);
}
function neParseTSV(t){ t=String(t||"").replace(/\r\n?/g,"\n").replace(/\n+$/,""); if(t.indexOf("\t")<0)return null; return t.split("\n").map(l=>l.split("\t").map(x=>x.replace(/^"([\s\S]*)"$/,"$1").trim())); }
el("netbar").addEventListener("mousedown",e=>{ if(e.target.closest("button"))e.preventDefault(); });
el("netbar").addEventListener("click",e=>{ const b=e.target.closest("[data-nt]"); if(!b)return; const op=b.dataset.nt; if(op==="bg"){ nePopShow(neCellBgHtml(),b,"cellbg"); return; } neTbOp(op); });

// ---------- รูปภาพ ----------
const NIMG=new Map();
async function nimgGet(id){
if(NIMG.has(id))return NIMG.get(id); if(!SB)return "";
try{ const {data,error}=await SB.from("rows").select("id,data").eq("uid",uid).eq("id",id); if(error)throw error; const d=(data&&data[0]&&data[0].data&&data[0].data.d)||""; if(d)NIMG.set(id,d); return d; }catch(e){ return ""; }
}
function ntHydrate(root){
if(!root)return; root.querySelectorAll("img[data-nid]").forEach(async im=>{ if(im.getAttribute("src"))return;
 im.alt="กำลังโหลดรูป…"; const d=await nimgGet(im.getAttribute("data-nid")); if(d&&im.isConnected){ im.src=d; im.alt=""; } else if(!d)im.alt="(โหลดรูปไม่ได้)"; });
}
function neImgScale(file,maxSide,q){
return new Promise((res,rej)=>{ const u=URL.createObjectURL(file), im=new Image();
 im.onload=()=>{ const w=im.naturalWidth, h=im.naturalHeight, c=document.createElement("canvas"); let sc=Math.min(1,maxSide/Math.max(w,h));
  const draw=()=>{ c.width=Math.max(1,Math.round(w*sc)); c.height=Math.max(1,Math.round(h*sc)); const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); return c.toDataURL("image/jpeg",q); };
  let out=draw(), t=0; while(out.length>650000&&t<4){ sc*=.8; q=Math.max(.6,q-.05); out=draw(); t++; }
  URL.revokeObjectURL(u); res(out); };
 im.onerror=()=>{ URL.revokeObjectURL(u); rej(new Error("อ่านรูปไม่ได้")); }; im.src=u; });
}
function neInsertNode(node,tail){
neRestore(); const s=getSelection(); let r=s.getRangeAt(0); r.deleteContents(); r.insertNode(node);
let last=node; if(tail){ const t=document.createTextNode(" "); node.after(t); last=t; }
r=document.createRange(); r.setStartAfter(last); r.collapse(true); s.removeAllRanges(); s.addRange(r); neRange=r.cloneRange();
}
async function neImgInsert(file){
if(!file||!/^image\//.test(file.type))return;
let url; try{ url=await neImgScale(file,1280,.82); }catch(e){ tell("<b>อ่านรูปนี้ไม่ได้ค่ะ</b>"); return; }
const id="nimg-"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4); let ok=false;
if(SB&&uid){ try{ const {error}=await SB.from("rows").upsert({id,uid,kind:"nimg",data:{d:url},updated_at:new Date().toISOString()}); ok=!error; }catch(e){} }
NIMG.set(id,url);
const im=document.createElement("img"); im.src=url; if(ok)im.setAttribute("data-nid",id); im.setAttribute("data-w","50"); im.alt="";
neInsertNode(im,true);
}
async function neImgMany(files){ setFoot("กำลังแนบรูป…"); for(const f of files)await neImgInsert(f); setFoot("แนบรูปแล้ว — กดที่รูปเพื่อปรับขนาด/ลบ"); }
function neImgPos(){ const b=el("neimgbar"); if(!b||b.hidden||!neImgSel)return; const r=neImgSel.getBoundingClientRect(); b.style.top=Math.max(8,r.top-48)+"px"; b.style.left=Math.max(8,Math.min(innerWidth-b.offsetWidth-8,r.left))+"px"; }
function neImgDeselect(){ if(neImgSel)neImgSel.classList.remove("nesel"); neImgSel=null; const b=el("neimgbar"); if(b)b.hidden=true; }
function neImgSelect(im){
neImgDeselect(); neImgSel=im; im.classList.add("nesel"); let b=el("neimgbar");
if(!b){ b=document.createElement("div"); b.id="neimgbar"; b.className="nepop neimgbar";
 b.innerHTML='<button type="button" data-iw="33">เล็ก</button><button type="button" data-iw="50">กลาง</button><button type="button" data-iw="100">ใหญ่</button><button type="button" data-iw="del" class="danger">ลบรูป</button>';
 el("ndlg").appendChild(b); b.addEventListener("mousedown",e=>e.preventDefault());
 b.addEventListener("click",e=>{ const x=e.target.closest("button"); if(!x||!neImgSel)return; if(x.dataset.iw==="del"){ neImgSel.remove(); neImgDeselect(); } else{ neImgSel.setAttribute("data-w",x.dataset.iw); neImgPos(); } }); }
b.hidden=false; neImgPos();
}
el("ne-file").addEventListener("change",e=>{ const fs=[...e.target.files]; e.target.value=""; if(fs.length)neImgMany(fs); });

// ---------- ผูกปุ่ม / คีย์ลัด ----------
el("ntool").addEventListener("click",e=>{
const b=e.target.closest("[data-ne]"); if(!b)return; const k=b.dataset.ne;
if(k==="ck")neCheck(); else if(k==="indent")neIndent(1); else if(k==="outdent")neIndent(-1);
else if(k==="color"){ neSave(); nePopShow(neColorHtml(),b,"color"); }
else if(k==="table"){ neSave(); nePopShow(neTableHtml(),b,"table"); }
else if(k==="img"){ neSave(); el("ne-file").click(); }
else if(k==="clear"){ NE().querySelectorAll("span[style]").forEach(sp=>{ while(sp.firstChild)sp.parentNode.insertBefore(sp.firstChild,sp); sp.remove(); }); }
});
NE().addEventListener("click",e=>{
const t=e.target;
if(t.tagName==="IMG"){ neImgSelect(t); return; } neImgDeselect();
const li=neCkHit(e); if(li)neCkToggle(li);
});
NE().addEventListener("keydown",e=>{
if(e.isComposing||e.keyCode===229)return;
if(e.key==="Tab"){ e.preventDefault(); const c=neCell(); if(c)neCellMove(c,e.shiftKey?-1:1); else neIndent(e.shiftKey?-1:1); return; }
if(e.key==="Enter"&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){ const c=neCell(); if(c){ e.preventDefault(); neCellDown(c); } }
else if(e.key==="Enter"&&e.shiftKey){ const c=neCell(); if(c){ e.preventDefault(); document.execCommand("insertLineBreak"); } }
});
NE().addEventListener("input",e=>{
if(e.inputType==="insertParagraph"){ const li=neLi(); if(li&&li.getAttribute("data-c")==="1"&&li.parentNode.classList&&li.parentNode.classList.contains("ck"))li.removeAttribute("data-c"); }
});
NE().addEventListener("scroll",neImgPos);
NE().addEventListener("paste",e=>{
const cd=e.clipboardData||window.clipboardData; if(!cd)return;
const files=[...(cd.files||[])].filter(f=>/^image\//.test(f.type));
if(files.length){ e.preventDefault(); neSave(); neImgMany(files); return; }
e.preventDefault(); const t=cd.getData("text/plain"), rows=neParseTSV(t);
if(rows&&(rows.length>1||rows[0].length>1)){ const c=neCell(); if(c)neFillTable(c,rows); else{ neSave(); neInsertTable(rows,false); } return; }
document.execCommand("insertText",false,t);
});
NE().addEventListener("drop",e=>{
const fs=[...((e.dataTransfer&&e.dataTransfer.files)||[])].filter(f=>/^image\//.test(f.type)); if(!fs.length)return;
e.preventDefault(); const r=document.caretRangeFromPoint&&document.caretRangeFromPoint(e.clientX,e.clientY); if(r&&NE().contains(r.commonAncestorContainer))neRange=r; neImgMany(fs);
});
NE().addEventListener("dragover",e=>{ if(e.dataTransfer&&[...e.dataTransfer.types].indexOf("Files")>=0)e.preventDefault(); });

// ---------- สถานะแถบเครื่องมือ ----------
function neExtraState(){
const c=neCell(), bar=el("netbar"); bar.hidden=!c;
if(c){ const th=c.closest("table").rows[0].cells[0].tagName==="TH"; const hb=bar.querySelector('[data-nt="head"]'); if(hb)hb.classList.toggle("on",th); }
const li=neLi(), cb=document.querySelector('#ntool [data-ne="ck"]'); if(cb)cb.classList.toggle("on",!!(li&&li.parentNode.classList&&li.parentNode.classList.contains("ck")));
}
document.addEventListener("selectionchange",()=>{ if(el("ndlg").open&&document.activeElement===NE())neExtraState(); });
