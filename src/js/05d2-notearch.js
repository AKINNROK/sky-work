// ===== คลังโน้ต: เก็บเข้าคลัง (ไม่ลบ) · เก็บอัตโนมัติเมื่อไม่ได้เปิดเกิน N วัน · เรียงลำดับ · โหมดรายการ =====
// field ในโน้ต: arch:true = เก็บเข้าคลังเอง · opened:"YYYY-MM-DD" = วันที่เปิดใช้ล่าสุด (อ่าน/แก้) · ink ใช้ updated ด้วย
// ตั้งค่าอัตโนมัติ: meta/notearch {days} (ค่าเริ่มต้น 20, 0 = ปิด) · โน้ตที่ปักหมุดไม่ถูกเก็บอัตโนมัติ
let ntMig=false;
const ntToday=()=>isoOf(new Date());
const ntLast=n=>{ const a=(n.opened||"").slice(0,10), b=(n.updated||"").slice(0,10); return a>b?a:b; };
const ntIdle=n=>{ const l=ntLast(n); if(!l)return 0; return Math.round((new Date(ntToday()+"T00:00:00")-new Date(l+"T00:00:00"))/864e5); };
function ntArch(n){ if(!n)return false; if(n.arch===true)return true; return NT_DAYS>0&&!n.pin&&ntIdle(n)>NT_DAYS; }
function ntSorter(k){ const dt=n=>n.date||"", lu=n=>ntLast(n)||dt(n);
 if(k==="opened")return (a,b)=>(lu(b)<lu(a)?-1:lu(b)>lu(a)?1:0);
 if(k==="old")return (a,b)=>(dt(a)<dt(b)?-1:dt(a)>dt(b)?1:0);
 if(k==="title")return (a,b)=>String(a.title||"").localeCompare(String(b.title||""),"th");
 return (a,b)=>(b.pin?1:0)-(a.pin?1:0)||((b.date||"")<(a.date||"")?-1:1); }
const ntMode=()=>{ try{ return localStorage.getItem("sw-nmode")==="list"?"list":"card"; }catch(e){ return "card"; } };
const ICON_ARCH='<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>';
const ICON_UNARCH='<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>';
const ntArchBtn=(n,vault)=>vault
 ?`<button class="ntedit" data-ntarch="${n._id}" data-restore="1" title="นำกลับมาใช้ (ออกจากคลัง)" aria-label="นำกลับมาใช้" style="color:var(--ok)">${svg(ICON_UNARCH,14)}</button>`
 :`<button class="ntedit" data-ntarch="${n._id}" title="เก็บเข้าคลัง (ไม่ลบ)" aria-label="เก็บเข้าคลัง">${svg(ICON_ARCH,14)}</button>`;
function ntRowHtml(n,vault){ const idle=ntIdle(n);
 return `<div class="notecard ntrow" data-nt="${n._id}" style="border-left:5px solid ${n.color||"var(--accent-2)"}">
<span class="tag${n.kind==="ไอเดีย"||n.kind===INKKIND?" sky":""}">${esc(n.kind||"โน้ต")}</span>
<span class="nt1">${n.pin?"📌 ":""}${esc(n.title||"(ไม่มีหัวข้อ)")}${n.tag?` <small style="color:var(--ink-3);font-weight:400">#${esc(n.tag)}</small>`:""}</span>
${noteFolderTag(n)}<span class="ntd">${vault&&idle>0?"ไม่ได้เปิด "+idle+" วัน · ":""}${esc(n.date||"")}</span>
<button class="ntedit" data-ntmv="${n._id}" title="ย้ายไปโฟลเดอร์" aria-label="ย้ายไปโฟลเดอร์">${svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',14)}</button>
${ntArchBtn(n,vault)}${n.kind===INKKIND?"":`<button class="ntedit" data-ntedit="${n._id}" title="แก้ไข" aria-label="แก้ไข">${svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',14)}</button>`}</div>`; }
function ntVaultBar(n){ const auto=notes.filter(x=>x.arch!==true&&ntArch(x)).length;
 return `<div class="ntvb"><div><b>🗄 คลังโน้ต ${n} รายการ</b><div class="ph-hint">ไม่ได้ลบ — เปิดอ่านได้ ค้นหาได้ · กดปุ่มลูกศรย้อน ↩ เพื่อนำกลับมาใช้ · แก้ไขแล้วบันทึก = กลับเข้ารายการหลักเอง${auto?` · เข้าคลังอัตโนมัติ ${auto} รายการ`:""}</div></div>
<label class="ntva">เก็บเข้าคลังอัตโนมัติเมื่อไม่ได้เปิดเกิน <select id="nt-days">${[[0,"ปิดระบบอัตโนมัติ"],[10,"10 วัน"],[20,"20 วัน"],[30,"30 วัน"],[60,"60 วัน"],[90,"90 วัน"]].map(([v,l])=>`<option value="${v}"${NT_DAYS===v?" selected":""}>${l}</option>`).join("")}</select></label></div>`; }
async function ntSet(id,patch){ try{ await DB.collection("note").doc(id).set(patch,{merge:true}); return true; }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return false; } }
async function ntToggleArch(id,restore){ const n=notes.find(v=>v._id===id); if(!n)return;
 if(restore){ if(await ntSet(id,{arch:false,opened:ntToday()}))setFoot("นำกลับมาใช้แล้ว — “"+(n.title||"โน้ต")+"”"); }
 else{ if(await ntSet(id,{arch:true,pin:false}))setFoot("เก็บเข้าคลังแล้ว — “"+(n.title||"โน้ต")+"” (ดูได้ที่ปุ่ม 🗄 คลัง)"); } }
// บันทึกว่าเปิดใช้ (วันละครั้งต่อโน้ต) — โน้ตในคลังที่เปิดอ่านเฉยๆ ไม่นับ
let ntTouchQ={};
function ntTouch(n){ if(!n||!n._id||n.opened===ntToday()||ntArch(n)||ntTouchQ[n._id])return; ntTouchQ[n._id]=1; setTimeout(async()=>{ await ntSet(n._id,{opened:ntToday()}); delete ntTouchQ[n._id]; },1500); }
// ครั้งแรก: ให้โน้ตเดิมที่ยังไม่มีวันเปิดใช้ ได้ "วันนี้" เป็นจุดเริ่ม (ไม่ให้ทยอยเข้าคลังทันที)
async function ntMigrate(){ if(ntMig||LOADING||!notes.length)return; ntMig=true; const todo=notes.filter(n=>!n.opened&&!n.arch&&!ntLast(n));
 for(const n of todo){ await ntSet(n._id,{opened:ntToday()}); await new Promise(r=>setTimeout(r,120)); } }
{ const _v=viewNote; viewNote=function(n){ const r=_v.apply(this,arguments); try{ ntTouch(n); }catch(e){} return r; };
  const _i=inkOpen; inkOpen=function(n){ try{ ntTouch(n); }catch(e){} return _i.apply(this,arguments); };
  const _w=wire; wire=function(){ _w.apply(this,arguments); try{ ntWire(); }catch(e){ console.error(e); } }; }
function ntWire(){ if(view!=="note")return; ntMigrate();
 document.querySelectorAll("[data-ntarch]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); ntToggleArch(b.dataset.ntarch,!!b.dataset.restore); });
 const v=el("nt-vault"); if(v)v.onclick=()=>{ R.noteArch=!R.noteArch; render(); };
 const so=el("nt-sort"); if(so)so.onchange=e=>{ R.noteSort=e.target.value; render(); };
 document.querySelectorAll("[data-ntm]").forEach(b=>b.onclick=()=>{ try{ localStorage.setItem("sw-nmode",b.dataset.ntm); }catch(e){} render(); });
 const d=el("nt-days"); if(d)d.onchange=async e=>{ const v=+e.target.value; NT_DAYS=v; try{ await DB.doc("meta/notearch").set({days:v}); }catch(x){ const y=explainErr(x); tell("<b>"+esc(y.title)+"</b>"); } render(); setFoot(v?"ตั้งเก็บเข้าคลังอัตโนมัติเมื่อไม่เปิดเกิน "+v+" วัน":"ปิดการเก็บเข้าคลังอัตโนมัติแล้ว"); }; }
