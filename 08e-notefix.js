// ===== หน้าเขียนบันทึก: พับ โฟลเดอร์/ป้าย/สี + ปุ่ม ⌫ ลบ (ใช้แทน Delete บนคีย์บอร์ดลอยของ iPad) =====
const nmetaOn=()=>{ try{ return localStorage.getItem("sw-nmeta")==="1"; }catch(e){ return false; } };
function nmetaSum(){ const s=el("nmeta-s"); if(!s)return; const f=el("n-folder"), fo=f&&f.value?(f.options[f.selectedIndex]||{}).text:"", tg=(el("n-tag").value||"").trim(), cl=(el("n-colors").dataset.val||"");
 const parts=[]; if(fo)parts.push(fo.replace(/^[\s ]+/,"")); if(tg)parts.push("# "+tg); s.innerHTML=(esc(parts.join(" · "))||"ยังไม่ได้ตั้ง")+(cl?` <i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${esc(cl)};vertical-align:-1px"></i>`:""); }
function nmetaApply(){ const g=el("nmeta-g"), t=el("nmeta-t"); if(!g||!t)return; const off=nmetaOn(); g.classList.toggle("fold",off); t.setAttribute("aria-expanded",String(!off)); nmetaSum(); }
(function(){ const t=el("nmeta-t"); if(!t)return;
 t.onclick=()=>{ const off=!nmetaOn(); try{ localStorage.setItem("sw-nmeta",off?"1":"0"); }catch(e){} nmetaApply(); };
 ["n-folder","n-tag"].forEach(id=>{ const n=el(id); if(n){ n.addEventListener("change",nmetaSum); n.addEventListener("input",nmetaSum); } });
 const c=el("n-colors"); if(c)c.addEventListener("click",()=>setTimeout(nmetaSum,0));
 const _o=openNote; openNote=function(){ const r=_o.apply(this,arguments); try{ nmetaApply(); }catch(e){} return r; };
 // ปุ่ม ⌫ ลบ: ลบข้อความที่เลือก / ลบถอยหลังทีละตัว · กดค้าง = ลบต่อเนื่อง · ถ้าเลือกรูปอยู่ = ลบรูป
 const nt=el("ntool"); if(!nt)return; let tm=null, iv=null;
 const once=()=>{ const n=NE(); if(!n)return; if(document.activeElement!==n)n.focus();
  if(typeof neImgSel!=="undefined"&&neImgSel){ neImgSel.remove(); neImgDeselect(); return; }
  document.execCommand("delete"); };
 const stop=()=>{ clearTimeout(tm); clearInterval(iv); tm=iv=null; };
 nt.addEventListener("pointerdown",e=>{ const b=e.target.closest('[data-ne="del"]'); if(!b)return; e.preventDefault(); try{ if(typeof neSave==="function")neSave(); }catch(x){} once(); stop(); tm=setTimeout(()=>{ iv=setInterval(once,65); },420); b.dataset.pd="1"; },true);
 ["pointerup","pointercancel","pointerleave"].forEach(ev=>nt.addEventListener(ev,e=>{ if(ev==="pointerleave"&&e.target!==nt&&!e.target.closest('[data-ne="del"]'))return; stop(); },true));
 nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="del"]'); if(!b)return; e.stopImmediatePropagation(); e.preventDefault(); if(b.dataset.pd){ delete b.dataset.pd; return; } once(); },true);
})();
