// ===== สมุดเขียนมือ: แถบเครื่องมือสูงคงที่ (v14.14.62) =====
// ปัญหา (จากวิดีโอ): เลือกด้วยตัวจับ → ปุ่มของที่เลือก (สี/คัดลอก/ตัด/ล็อก/ลบ…) ต่อท้ายแถบด้านบน → แถบสูงขึ้น 1–2 แถว
// แล้วหดกลับเมื่อยกเลิกเลือก · สลับปากกา↔ตัวจับก็สูง/ต่ำสลับกัน → หน้าจอกระตุกขึ้นลงตลอด
// แก้: (1) ปุ่มของที่เลือกย้ายไปอยู่ "แถบลอย" บนพื้นที่วาด (ไม่ดันหน้าจอ) ขึ้นด้านบน หรือย้ายลงล่างถ้าบังของที่เลือก
//      (2) แถบด้านบนจำความสูงสูงสุดไว้ ไม่หดลงเวลาสลับเครื่องมือ (รีเซ็ตเมื่อเปิดสมุดใหม่/หมุนจอ)
(function(){
 const st=el("ink-stage"), top=document.querySelector(".ink-top"); if(!st||!top)return;
 const bar=document.createElement("div"); bar.id="ink-selbar"; bar.className="ink-selbar"; bar.hidden=true; bar.setAttribute("role","toolbar"); bar.setAttribute("aria-label","จัดการสิ่งที่เลือก");
 const cols=document.createElement("span"); cols.id="ink-selcols"; cols.className="ink-grp"; bar.appendChild(cols);
 ["selfmt","selcopy","selcut","selpaste","seldup","seledit","selcalc","seltxt","selgrp","selaln","sellock","selz","sellink","selshape","seldel"].forEach(k=>{ const b=el("ink-"+k); if(b)bar.appendChild(b); });
 st.appendChild(bar);
 ["pointerdown","pointermove","pointerup","pointercancel"].forEach(t=>bar.addEventListener(t,e=>e.stopPropagation()));
 bar.addEventListener("touchstart",e=>e.stopPropagation(),{passive:true}); bar.addEventListener("wheel",e=>e.stopPropagation(),{passive:true});
 // (2) ความสูงแถบด้านบนไม่หด
 let maxH=0, lastW=0;
 const keep=()=>{ const d=el("inkdlg"); if(!d||!d.open)return; const w=window.innerWidth; if(w!==lastW){ lastW=w; maxH=0; top.style.minHeight=""; }
  const h=top.offsetHeight; if(h>maxH+0.5){ maxH=h; top.style.minHeight=maxH+"px"; } };
 if(typeof ResizeObserver==="function")new ResizeObserver(()=>keep()).observe(top);
 const dlg=el("inkdlg"); if(dlg)dlg.addEventListener("close",()=>{ maxH=0; lastW=0; top.style.minHeight=""; });
 window.inkTopReset=()=>{ maxH=0; lastW=0; top.style.minHeight=""; requestAnimationFrame(keep); };
})();
function inkSelBarPos(){ const bar=el("ink-selbar"); if(!bar||bar.hidden||!ink.sel)return; const st=el("ink-stage"), H=st.clientHeight, b=ink.sel.box; if(!b)return;
 let y0,y1; if(ink.board){ y0=(b[1]-ink.vy)*ink.z; y1=(b[3]-ink.vy)*ink.z; } else{ const s=(ink.fit||1)*ink.z; y0=ink.ty+b[1]*s; y1=ink.ty+b[3]*s; }
 const bh=bar.offsetHeight+16, coverTop=y0<bh+40, coverBot=y1>H-bh-10; bar.classList.toggle("bot",coverTop&&!coverBot); }
function inkSelBarPaint(){ const bar=el("ink-selbar"); if(!bar)return; const box=el("ink-colors"), cols=el("ink-selcols"), on=!!(ink.note&&ink.sel&&!ink.pres);
 if(on&&box&&cols&&["lasso","move"].includes(ink.tool)&&box.querySelector("[data-selcol]")){ cols.innerHTML=box.innerHTML; box.innerHTML=""; } else if(cols)cols.innerHTML="";
 bar.hidden=!on||![...bar.children].some(c=>!c.hidden&&(c.id!=="ink-selcols"||c.innerHTML)); inkSelBarPos(); }
{ const _t=inkToolbar; inkToolbar=function(){ const r=_t.apply(this,arguments); try{ inkSelBarPaint(); }catch(e){ console.error(e); } return r; }; }
{ const _d=inkDrawSel; inkDrawSel=function(){ const r=_d.apply(this,arguments); try{ inkSelBarPos(); }catch(e){} return r; }; }
{ const _o=inkOpen; inkOpen=async function(){ if(window.inkTopReset)window.inkTopReset(); return _o.apply(this,arguments); }; }
