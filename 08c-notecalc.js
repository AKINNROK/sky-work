// ===== เขียนบันทึก: สูตรในตาราง + พิมพ์ = ได้ผลทันที (ใช้ตัวคำนวณจาก 05l-calc.js) =====
// ---------- เขียนบันทึก: = ต่อท้ายนิพจน์ได้ผลทันที · ช่องตารางพิมพ์ =SUM(B2:B5) ได้ ----------
let neFxCur=null;
const neFxNum=c=>{ const t=c._fv!=null&&c===neFxCur?c._fv:c.textContent; const n=calcNums(t); return n.length?n[0]:null; };
function neFxAll(){ const NEe=NE(); if(!NEe)return;
 NEe.querySelectorAll("table").forEach(tb=>{ const cells=[...tb.querySelectorAll("td[data-f],th[data-f]")]; if(!cells.length)return;
  const cellFn=(c,r)=>{ const row=tb.rows[r-1], cl=row&&row.cells[c-1]; return cl?neFxNum(cl):null; };
  for(let pass=0;pass<3;pass++)cells.forEach(c=>{ if(c===neFxCur)return; let t; try{ t=calcFmt(calcEval(c.getAttribute("data-f").slice(1),{cell:cellFn})); }catch(e){ t="#ERR"; } if(c.textContent!==t)c.textContent=t; }); }); }
function neFxLeave(){ const c=neFxCur; neFxCur=null; if(!c||!NE().contains(c))return; const t=c.textContent.trim(); if(/^=.+/.test(t))c.setAttribute("data-f",t.slice(0,120)); else c.removeAttribute("data-f"); neFxAll(); }
function neFxEnter(c){ neFxCur=c; if(c){ const f=c.getAttribute("data-f"); if(f){ c._fv=c.textContent; c.textContent=f; neFocusCell(c,true); } } }
(function(){ const NEe=NE(); if(!NEe)return;
 document.addEventListener("selectionchange",()=>{ const d=el("ndlg"); if(!d||!d.open)return; const c=neCell(); if(c===neFxCur)return; neFxLeave(); neFxEnter(c); });
 NEe.addEventListener("focusout",()=>{ setTimeout(()=>{ if(!NEe.contains(document.activeElement))neFxLeave(); },0); });
 NEe.addEventListener("input",e=>{
  if(e.inputType==="insertText"&&e.data==="="){ const s=getSelection(); if(s.rangeCount&&s.isCollapsed){ const n=s.anchorNode; if(n&&n.nodeType===3){ const before=n.data.slice(0,s.anchorOffset), line=before.split("\n").pop(); const out=calcAutoLine(line); if(out!=null&&!/^=/.test(line.trim())){ const add=out.slice(line.length); document.execCommand("insertText",false,add); } } } }
  neFxAll(); });
 const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="calc"]'); if(b){ e.stopImmediatePropagation(); calcOpenNote(); } },true);
})();
