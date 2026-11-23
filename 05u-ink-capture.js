// ===== 1) คลุมเพื่อเปลี่ยนสี  2) แคปหน้าจอเฉพาะส่วน (กระดานกว้าง · สมุดเขียนมือ) =====
// (1) เมื่อมีของที่คลุมไว้ (เครื่องมือคลุม/ย้าย) แถบสีจะกลายเป็น “เปลี่ยนสีที่เลือก” กดสีเดียวเปลี่ยนทั้งหมดที่คลุม (undo ได้)
// (2) ไอคอนกล้อง: ลากกรอบเลือกส่วนที่ต้องการ → ได้ภาพ PNG คมชัดจากข้อมูลจริง (ไม่มีแถบเครื่องมือ/ไม้บรรทัดติด) → ดาวน์โหลด/แชร์/คัดลอก
const _inkTb5u=inkToolbar;
inkToolbar=function(){
 _inkTb5u.apply(this,arguments);
 const box=el("ink-colors"); if(!box)return;
 if(ink.sel&&["lasso","move"].includes(ink.tool)){
  const pick=(ink.sel.idx.size===1?[...ink.sel.idx].map(i=>inkPage().strokes[i]):[]).map(s=>s&&s.c)[0];
  box.innerHTML=`<span class="ink-selcl">เปลี่ยนสีที่เลือก</span>`+INK_PEN.map(c=>`<button type="button" class="ink-c${pick&&pick.toLowerCase()===c?" on":""}" data-selcol="${c}" style="background:${c}" aria-label="เปลี่ยนเป็นสี ${c}"></button>`).join("")+`<button type="button" class="ink-c ink-cmore" data-selmore="1" title="สีเพิ่มเติม" aria-label="สีเพิ่มเติม">＋</button>`;
 }
};
function inkSelRecolor(c){ if(!ink.sel||!/^#[0-9a-fA-F]{6}$/.test(c))return; inkSelApply(s=>(s&&s.c&&s.t!=="i")?{...s,c}:s); }
function inkSelColorMenu(a){
 const sw=c=>`<button type="button" class="ink-c" data-sfc="${c}" style="background:${c}" aria-label="สี ${c}"></button>`;
 inkPop(`<div class="ink-ph">เปลี่ยนสีที่คลุมไว้</div><div class="ink-row ink-cgrid">${(typeof INK_PEN_ALL!=="undefined"?INK_PEN_ALL:INK_PEN).map(sw).join("")}</div>
<div class="ink-row" style="margin-top:8px"><label class="ink-opt" style="cursor:pointer">🎨 เลือกสีเอง <input type="color" id="ink-scust" value="#2563eb" style="width:30px;height:24px;border:0;padding:0;background:none"></label></div>`,a);
 const c=el("ink-scust"); if(c)c.addEventListener("change",()=>{ inkSelRecolor(c.value); if(typeof inkRecentPut==="function")inkRecentPut(c.value); inkClosePop(); });
}
// ---------- แคปเฉพาะส่วน ----------
const CAP={on:false,box:null,url:null};
INK_ACTS.push(["cap","แคปหน้าจอเฉพาะส่วน (ลากกรอบเลือก)",'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>']);
const _inkAct5u=inkAct;
inkAct=function(k,b){ if(k==="cap"){ CAP.on?inkCapStop():inkCapStart(); return; } return _inkAct5u.apply(this,arguments); };
function inkCapStop(){ CAP.on=false; const o=el("ink-cap"); if(o)o.remove(); }
function inkCapStart(){
 inkClosePop(); inkCapStop(); CAP.on=true; ink.rc=null;
 const st=el("ink-stage"), r=st.getBoundingClientRect(), o=document.createElement("div"); o.id="ink-cap"; o.className="ink-cap";
 o.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
 o.innerHTML=`<div class="ink-caph">ลากกรอบครอบส่วนที่ต้องการแคป <button type="button" class="btn sm ghost" data-capx="1">ยกเลิก</button></div><div class="ink-capb" hidden></div>`;
 el("inkdlg").appendChild(o);
 const bx=o.querySelector(".ink-capb"); let d=null;
 const rel=e=>{ const q=o.getBoundingClientRect(); return [Math.max(0,Math.min(q.width,e.clientX-q.left)),Math.max(0,Math.min(q.height,e.clientY-q.top))]; };
 o.addEventListener("pointerdown",e=>{ if(e.target.closest("[data-capx]"))return; e.preventDefault(); e.stopPropagation(); try{ o.setPointerCapture(e.pointerId); }catch(er){} const p=rel(e); d={id:e.pointerId,x:p[0],y:p[1],cx:e.clientX,cy:e.clientY}; bx.hidden=false; bx.style.cssText=`left:${p[0]}px;top:${p[1]}px;width:0;height:0`; });
 o.addEventListener("pointermove",e=>{ if(!d||e.pointerId!==d.id)return; e.preventDefault(); const p=rel(e), x=Math.min(d.x,p[0]), y=Math.min(d.y,p[1]); bx.style.cssText=`left:${x}px;top:${y}px;width:${Math.abs(p[0]-d.x)}px;height:${Math.abs(p[1]-d.y)}px`; });
 const end=async e=>{ if(!d||e.pointerId!==d.id)return; const a=d; d=null; if(Math.abs(e.clientX-a.cx)<14||Math.abs(e.clientY-a.cy)<14){ bx.hidden=true; return; }
  ink.rc=null; const p1=inkToPage({clientX:a.cx,clientY:a.cy}), p2=inkToPage({clientX:e.clientX,clientY:e.clientY}); inkCapStop(); await inkCapRender([Math.min(p1[0],p2[0]),Math.min(p1[1],p2[1]),Math.max(p1[0],p2[0]),Math.max(p1[1],p2[1])]); };
 o.addEventListener("pointerup",end); o.addEventListener("pointercancel",()=>{ d=null; bx.hidden=true; });
 o.querySelector("[data-capx]").onclick=inkCapStop;
}
async function inkCapRender(b){
 try{
  await inkImgsReady();
  let [x0,y0,x1,y1]=b; if(!ink.board){ x0=Math.max(0,x0); y0=Math.max(0,y0); x1=Math.min(INK_W,x1); y1=Math.min(INK_H,y1); }
  const w=x1-x0, h=y1-y0; if(w<6||h<6){ inkStatus&&inkStatus("กรอบเล็กเกินไป ลองลากใหม่","bad"); return; }
  const k=Math.max(.3,Math.min(3,2800/Math.max(w,h))); let c;
  if(ink.board){ c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k)); inkRenderTo(c.getContext("2d"),k,ink.pages[0].strokes,null,{board:true,ox:-x0,oy:-y0,w,h}); }
  else{ const full=inkPageCanvas(inkPage(),Math.round(INK_W*k)); c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k)); c.getContext("2d").drawImage(full,Math.round(x0*k),Math.round(y0*k),c.width,c.height,0,0,c.width,c.height); }
  const blob=await inkBlob(c,"image/png"); if(!blob)throw new Error("สร้างภาพไม่สำเร็จ");
  inkCapShow(blob,c.width,c.height);
 }catch(e){ tell("<b>แคปไม่สำเร็จ</b><div class=\"hint\">"+esc(String(e&&e.message||e))+"</div>"); }
}
function inkCapShow(blob,w,h){
 const old=el("ink-capv"); if(old)old.remove(); if(CAP.url)try{ URL.revokeObjectURL(CAP.url); }catch(e){}
 const url=CAP.url=URL.createObjectURL(blob), p=n=>String(n).padStart(2,"0"), d=new Date();
 const name=((el("ink-title")&&el("ink-title").value.trim())||"sky-plan").replace(/[\\/:*?"<>|]+/g,"-")+"-capture-"+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"-"+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+".png";
 const file=new File([blob],name,{type:"image/png"}), canShare=!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[file]}));
 const o=document.createElement("div"); o.id="ink-capv"; o.className="ink-ocr";
 o.innerHTML=`<div class="ocr-box"><b>แคปแล้ว ✓</b> <span class="hint" style="margin:0">${w}×${h}px · ${(blob.size/1024).toFixed(0)} KB</span>
<div class="ink-cappv"><img alt="ภาพที่แคป" src="${url}"></div>
<div class="ocr-btns"><button type="button" class="btn" data-cv="dl">ดาวน์โหลด</button>${canShare?`<button type="button" class="btn ghost" data-cv="sh">แชร์</button>`:""}<button type="button" class="btn ghost" data-cv="cp">คัดลอกรูป</button><button type="button" class="btn ghost" data-cv="re">แคปใหม่</button><button type="button" class="btn ghost" data-cv="x">ปิด</button></div></div>`;
 el("inkdlg").appendChild(o); o.addEventListener("pointerdown",e=>e.stopPropagation());
 o.addEventListener("click",async e=>{ const b=e.target.closest("button[data-cv]"); if(!b){ if(e.target===o)o.remove(); return; } const k=b.dataset.cv;
  if(k==="x")o.remove(); else if(k==="re"){ o.remove(); inkCapStart(); }
  else if(k==="dl"){ const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); b.textContent="ดาวน์โหลดแล้ว ✓"; }
  else if(k==="sh"){ try{ await navigator.share({files:[file],title:name}); }catch(er){ if(er&&er.name!=="AbortError")b.textContent="แชร์ไม่สำเร็จ"; } }
  else if(k==="cp"){ try{ await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]); b.textContent="คัดลอกแล้ว ✓"; }catch(er){ b.textContent="เครื่องนี้คัดลอกรูปไม่ได้ — ใช้ดาวน์โหลด"; } } });
}
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("button"); if(!b||!el("inkdlg")||!el("inkdlg").contains(b))return;
 if(b.dataset.selcol){ e.stopPropagation(); inkSelRecolor(b.dataset.selcol); return; }
 if(b.dataset.selmore){ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("#ink-scust")){ inkClosePop(); return; } inkSelColorMenu(b); return; }
},true);
