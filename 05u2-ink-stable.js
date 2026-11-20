// ===== สมุดเขียนมือ: กันภาพ "เด้ง" เมื่อแถบเครื่องมือสูงขึ้น/ลดลง + แปลงลายมือทั้งจอ (v14.14.60) =====
// เดิม: เลือกด้วยตัวจับ (ลาสโซ่) → แถบเครื่องมือเพิ่มปุ่ม → พื้นที่วาดถูกดันลง แต่ภาพ/กรอบเลือกไม่ขยับตาม → ทุกอย่างดูเด้ง
// ตอนนี้: เฝ้าขนาด/ตำแหน่งพื้นที่วาด ถ้าขอบบนเลื่อน ชดเชยมุมมองให้ลายเส้นอยู่ที่เดิมบนจอ แล้ววาดใหม่ทั้งภาพและกรอบที่เลือก
(function(){
 const st=el("ink-stage"); if(!st||typeof ResizeObserver!=="function")return; let last=null;
 const chk=()=>{ if(!ink.note||!el("inkdlg")||!el("inkdlg").open){ last=null; return; } const r=st.getBoundingClientRect(); if(!r.width||!r.height)return;
  if(last&&(Math.abs(r.top-last.top)>0.5||Math.abs(r.height-last.h)>0.5||Math.abs(r.width-last.w)>0.5)){ const d=r.top-last.top;
   if(ink.board){ if(d)ink.vy+=d/(ink.z||1); inkApply(); inkRedrawSoon(); }
   else{ const s0=(ink.fit||0)*ink.z, t0=ink.ty, x0=ink.tx; if(d)ink.ty-=d; inkApply(); const s1=(ink.fit||0)*ink.z;   // สมุดแบบหน้า: คงขนาดหน้าเดิม ไม่ให้ย่อ/ขยายตามแถบเครื่องมือ
    if(s0&&s1&&Math.abs(r.width-last.w)<=0.5&&Math.abs(s1-s0)>1e-6){ ink.z=Math.max(.5,Math.min(6,ink.z*s0/s1)); ink.ty=t0-d; ink.tx=x0; inkApply(); if(typeof inkZoomLabel==="function")inkZoomLabel(); } } }
  last={top:r.top,h:r.height,w:r.width}; };
 new ResizeObserver(()=>requestAnimationFrame(chk)).observe(st);
 const top=document.querySelector(".ink-top"); if(top)new ResizeObserver(()=>requestAnimationFrame(chk)).observe(top);
 const d=el("inkdlg"); if(d)d.addEventListener("close",()=>{ last=null; });
})();
// Aa แปลงลายมือที่เห็นบนจอ (ไม่ต้องลาสโซ่ก่อน)
function inkOcrVisible(){ const pg=inkPage(); if(!pg)return; const S=pg.strokes; let vx0=-1e9,vy0=-1e9,vx1=1e9,vy1=1e9;
 if(ink.board){ const c=el("ink-base"); vx0=ink.vx; vy0=ink.vy; vx1=ink.vx+c.width/ink.k; vy1=ink.vy+c.height/ink.k; }
 const idx=new Set(); S.forEach((s,i)=>{ if(!s||!(s.t==="p"||s.t==="s"||s.t==="x"))return; const b=inkBBox(S,new Set([i])); if(b&&b[2]>=vx0&&b[0]<=vx1&&b[3]>=vy0&&b[1]<=vy1)idx.add(i); });
 if(!idx.size){ inkStatus("ไม่พบลายมือบนจอ — เลื่อนให้ลายมือที่ต้องการอยู่ในจอ หรือใช้ตัวจับล้อมเฉพาะส่วน","bad"); return; }
 ink.sel={idx,box:inkBBox(S,idx)}; inkDrawSel(); inkToolbar(); inkOcrRun(); }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest('[data-imore="ocr"]'); if(!b)return; e.preventDefault(); e.stopImmediatePropagation(); inkClosePop(); inkOcrVisible(); },true);
