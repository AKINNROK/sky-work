// ===== กู้เวอร์ชันสมุด/กระดาน =====
// เก็บ “ภาพถ่ายของหน้า” ลง rows(kind "inkver") อัตโนมัติ: ก่อนแก้ครั้งแรกของรอบเปิดใช้ · ทุก ~12 นาทีที่ยังแก้อยู่ · ก่อนล้างหน้า/ลบหน้า · ก่อนกู้
// เก็บล่าสุดไม่เกิน 24 ชุดต่อสมุด · กดกู้ที่เมนู ⋯ › “กู้เวอร์ชันเก่า” (กู้แล้วย้อนกลับด้วยปุ่ม ↶ ได้ และมีสำเนา “ก่อนกู้” ให้อีกชั้น)
const INKVER_MAX=24, INKVER_GAP=12*60*1000, INKVER_BYTES=2600000;
const INKVER_TAG={start:"ก่อนแก้ในรอบนี้",auto:"บันทึกอัตโนมัติ",clear:"ก่อนล้าง",del:"หน้าที่ลบไป",pre:"ก่อนกู้เวอร์ชัน"};
const inkVerId=(note,pid,tag,n)=>["inkver",note,pid,Date.now().toString(36),n,tag].join("~");
async function inkVerPut(pid,strokes,tag){
 try{ if(!SB||!uid||!ink.note||!Array.isArray(strokes)||!strokes.length)return false;
  ink.verLast=ink.verLast||{}; if(ink.verLast[pid]===strokes)return false;
  const json=JSON.stringify(strokes); if(json.length>INKVER_BYTES)return false;
  const id=inkVerId(ink.note._id,pid,tag,strokes.length);
  const {error}=await SB.from("rows").upsert({id,uid,kind:"inkver",data:{noteId:ink.note._id,pid,strokes,at:new Date().toISOString(),n:strokes.length,tag},updated_at:new Date().toISOString()});
  if(error)return false; ink.verLast[pid]=strokes; inkVerPrune(); return true; }catch(e){ return false; } }
async function inkVerPrune(){
 try{ const {data}=await SB.from("rows").select("id,updated_at").eq("uid",uid).eq("kind","inkver").like("id","inkver~"+ink.note._id+"~%").order("updated_at",{ascending:false}).limit(200);
  const extra=(data||[]).slice(INKVER_MAX); for(const r of extra)await SB.from("rows").delete().eq("uid",uid).eq("id",r.id); }catch(e){} }
// เรียกจาก inkSave ก่อนบันทึกหน้าที่แก้ไข: เก็บสถานะที่อยู่ในฐานข้อมูลตอนนี้ (p.saved)
async function inkVerBeforeSave(p){
 const now=Date.now(); if(!p.saved||!p.saved.length)return; if(p.snapAt&&now-p.snapAt<INKVER_GAP)return;
 const first=!p.snapAt; p.snapAt=now; await inkVerPut(p.id,p.saved,first?"start":"auto"); }
// ก่อนล้าง/ลบ: เก็บสถานะปัจจุบัน
function inkVerNow(pg,tag){ if(pg&&pg.strokes&&pg.strokes.length)inkVerPut(pg.id,pg.strokes,tag); }
async function inkVerPurgeNote(noteId){ try{ const {data}=await SB.from("rows").select("id").eq("uid",uid).eq("kind","inkver").like("id","inkver~"+noteId+"~%").limit(300); for(const r of (data||[]))await SB.from("rows").delete().eq("uid",uid).eq("id",r.id); }catch(e){} }
// ---------- หน้าต่างเลือกเวอร์ชัน ----------
function inkVerOv(){ let o=el("ver-ov"); if(!o){ o=document.createElement("div"); o.id="ver-ov"; o.className="ink-ocr"; el("inkdlg").appendChild(o); o.addEventListener("pointerdown",e=>e.stopPropagation()); o.addEventListener("click",e=>{ if(e.target===o)inkVerClose(); }); } return o; }
function inkVerClose(){ const o=el("ver-ov"); if(o)o.remove(); }
const inkVerWhen=iso=>{ try{ const d=new Date(iso); return d.toLocaleDateString("th-TH",{day:"numeric",month:"short"})+" "+d.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } };
async function inkVerOpen(){
 if(!SB||!ink.note)return; inkClosePop(); await inkSave(true); const o=inkVerOv();
 o.innerHTML=`<div class="ocr-box"><div class="ocr-spin"></div><b>กำลังโหลดเวอร์ชันที่เก็บไว้…</b></div>`;
 try{ const {data,error}=await SB.from("rows").select("id,updated_at").eq("uid",uid).eq("kind","inkver").like("id","inkver~"+ink.note._id+"~%").order("updated_at",{ascending:false}).limit(60); if(error)throw error;
  const have=new Set(ink.pages.map(p=>p.id)), cur=inkPage().id;
  const L=(data||[]).map(r=>{ const [,,pid,,n,tag]=r.id.split("~"); return {id:r.id,pid,n:+n||0,tag,at:r.updated_at}; }).filter(v=>v.pid===cur||!have.has(v.pid));
  inkVerList(L); }catch(e){ o.innerHTML=`<div class="ocr-box"><b>โหลดรายการไม่สำเร็จ</b><div class="hint" style="margin:8px 0 12px">${esc(e.message||String(e))}</div><button type="button" class="btn ghost" data-vc="x" style="width:100%">ปิด</button></div>`; o.querySelector("[data-vc=x]").onclick=inkVerClose; } }
function inkVerList(L){
 const o=inkVerOv(); const cur=inkPage().id;
 o.innerHTML=`<div class="ocr-box"><b>🕘 กู้เวอร์ชันเก่า</b><div class="hint" style="margin:4px 0 10px;line-height:1.6">${ink.board?"เวอร์ชันของกระดานนี้":"เวอร์ชันของหน้า "+(ink.cur+1)+" และหน้าที่เคยลบไป"} · ระบบเก็บให้อัตโนมัติ (ล่าสุด ${INKVER_MAX} ชุด) · กู้แล้วกด ↶ ย้อนกลับได้</div>
 <div class="ver-list">${L.length?L.map((v,i)=>`<button type="button" class="ver-it" data-vi="${i}"><b>${esc(inkVerWhen(v.at))}</b><span>${v.n} ชิ้น · ${esc(INKVER_TAG[v.tag]||"บันทึกอัตโนมัติ")}${v.pid!==cur?" · หน้าที่ลบไป":""}</span></button>`).join(""):`<div class="hint" style="padding:10px 2px;line-height:1.7">ยังไม่มีเวอร์ชันที่เก็บไว้ — ระบบจะเริ่มเก็บเมื่อแก้งานหลังจากนี้ (ครั้งแรกที่บันทึกในรอบเปิดใช้ และทุก ~12 นาที)</div>`}</div>
 <button type="button" class="btn ghost" data-vc="x" style="width:100%;margin-top:12px">ปิด</button></div>`;
 o.onclick=e=>{ if(e.target===o){ inkVerClose(); return; } const b=e.target.closest("button"); if(!b)return; e.stopPropagation(); if(b.dataset.vc==="x")inkVerClose(); else if(b.dataset.vi!=null)inkVerPreview(L,+b.dataset.vi); };
}
async function inkVerPreview(L,i){
 const v=L[i], o=inkVerOv(); o.innerHTML=`<div class="ocr-box"><div class="ocr-spin"></div><b>กำลังเปิดตัวอย่าง…</b></div>`;
 try{ const {data,error}=await SB.from("rows").select("data").eq("uid",uid).eq("id",v.id); if(error)throw error; const S=data&&data[0]&&data[0].data&&data[0].data.strokes; if(!Array.isArray(S))throw new Error("ไม่พบข้อมูลเวอร์ชันนี้");
  const cv=document.createElement("canvas"); const W=560, H=ink.board?340:Math.round(560*INK_H/INK_W*.62);
  if(ink.board&&S.length){ const ids=new Set(S.map((_,j)=>j)), bb=inkBBox(S,ids), w=Math.max(80,bb[2]-bb[0]+80), h=Math.max(60,bb[3]-bb[1]+80), k=Math.min(W/w,H/h); cv.width=Math.round(w*k); cv.height=Math.round(h*k); inkRenderTo(cv.getContext("2d"),k,S,null,{board:true,ox:-(bb[0]-40),oy:-(bb[1]-40),w,h,noStk:1}); }
  else{ const pg=ink.pages.find(p=>p.id===v.pid), k=H/INK_H; cv.width=Math.round(INK_W*k); cv.height=Math.round(INK_H*k); inkRenderTo(cv.getContext("2d"),k,S,null,{tpl:pg&&pg.tpl,noStk:1}); }
  o.innerHTML=`<div class="ocr-box"><b>${esc(inkVerWhen(v.at))}</b> <span class="hint">· ${S.length} ชิ้น · ${esc(INKVER_TAG[v.tag]||"")}</span><div class="ver-pv"></div>
  <div class="ocr-btns"><button type="button" class="btn" data-vc="go">กู้เวอร์ชันนี้</button><button type="button" class="btn ghost" data-vc="back">กลับ</button></div><div class="hint" style="margin-top:8px;line-height:1.6">${v.pid===inkPage().id?"งานปัจจุบันของหน้านี้จะถูกแทนที่ (เก็บสำเนา “ก่อนกู้” ไว้ให้ และกด ↶ ย้อนกลับได้)":"จะเพิ่มเป็นหน้าใหม่ต่อจากหน้านี้"}</div></div>`;
  o.querySelector(".ver-pv").appendChild(cv);
  o.onclick=e=>{ if(e.target===o){ inkVerClose(); return; } const b=e.target.closest("button"); if(!b)return; e.stopPropagation(); if(b.dataset.vc==="back")inkVerList(L); else if(b.dataset.vc==="go")inkVerRestore(v,S); };
 }catch(e){ o.innerHTML=`<div class="ocr-box"><b>เปิดตัวอย่างไม่สำเร็จ</b><div class="hint" style="margin:8px 0 12px">${esc(e.message||String(e))}</div><button type="button" class="btn ghost" data-vc="x" style="width:100%">ปิด</button></div>`; o.querySelector("[data-vc=x]").onclick=inkVerClose; } }
async function inkVerRestore(v,S){
 const pg=inkPage(); await inkVerPut(pg.id,pg.strokes,"pre");
 if(v.pid===pg.id){ inkCommit(S.map(s=>s)); }
 else{ ink.pages.splice(ink.cur+1,0,{id:inkUid(),strokes:S,dirty:true,tpl:null}); ink.cur++; ink.sel=null; ink.metaDirty=true; ink.undo=[]; ink.redo=[]; inkRedraw(); inkOverClear(); inkToolbar(); inkDirty(); }
 if(typeof inkImgLoadAll==="function")inkImgLoadAll();
 inkVerClose(); inkStatus("กู้เวอร์ชันแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2400);
}
(function(){ const d=el("inkdlg"); if(d)d.addEventListener("close",inkVerClose); })();
