// ===== นำเข้า PDF → สมุดเขียนมือ (v14.14.61) =====
// แต่ละหน้า PDF แปลงเป็นรูป (pdf.js ของ Mozilla — vendor/pdfjs ไม่พึ่ง CDN) วางเป็น "รูปล็อก" เต็มหน้า → เขียน/ไฮไลต์/พิมพ์/สติกเกอร์ทับได้
// ลบ/ลาสโซ่ไม่โดนหน้า PDF (ล็อก) · ส่งออกเป็น PDF ใหม่ (พร้อมสิ่งที่จด) ที่ ส่งออก / Drive · ไม่ได้แก้ตัวอักษรต้นฉบับใน PDF
const PDFJS_SRC="vendor/pdfjs/pdf.js", PDFJS_WORKER="vendor/pdfjs/pdf.worker.js", PDF_MAXP=60;
let pdfjsP=null;
function pdfjsLoad(){ if(window.pdfjsLib&&window.pdfjsLib.getDocument)return Promise.resolve(window.pdfjsLib); if(pdfjsP)return pdfjsP;
 pdfjsP=new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=PDFJS_SRC+"?v="+APP_VERSION;
  s.onload=()=>{ const L=window.pdfjsLib; if(!L||!L.getDocument){ pdfjsP=null; rej(new Error("โหลดตัวอ่าน PDF ไม่สำเร็จ")); return; } L.GlobalWorkerOptions.workerSrc=PDFJS_WORKER+"?v="+APP_VERSION; res(L); };
  s.onerror=()=>{ pdfjsP=null; rej(new Error("โหลดตัวอ่าน PDF ไม่สำเร็จ — ตรวจการเชื่อมต่อเน็ตแล้วลองใหม่")); }; document.head.appendChild(s); }); return pdfjsP; }
async function pdfPageImg(pdf,n){ const pg=await pdf.getPage(n), v=pg.getViewport({scale:1}), sc=Math.min(3,1600/Math.max(v.width,v.height)), vp=pg.getViewport({scale:sc});
 const c=document.createElement("canvas"); c.width=Math.max(1,Math.round(vp.width)); c.height=Math.max(1,Math.round(vp.height)); const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height);
 await pg.render({canvasContext:x,viewport:vp}).promise; let q=.82, src=c.toDataURL("image/jpeg",q); while(src.length>750000&&q>.45){ q-=.12; src=c.toDataURL("image/jpeg",q); }
 try{ pg.cleanup(); }catch(e){} c.width=c.height=1; return {src,w:vp.width,h:vp.height}; }
async function pdfOpen(file){ if(!file)throw new Error("ไม่พบไฟล์"); if(file.size>80e6)throw new Error("ไฟล์ใหญ่เกิน 80 MB — แยกไฟล์ก่อนนำเข้า");
 const L=await pdfjsLoad(); try{ return await L.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise; }
 catch(e){ if(e&&e.name==="PasswordException")throw new Error("PDF นี้ตั้งรหัสผ่านไว้ — เปิดด้วยโปรแกรมอื่นแล้วบันทึกแบบไม่มีรหัสผ่านก่อน"); throw new Error("อ่านไฟล์ PDF ไม่ได้ (ไฟล์อาจเสีย)"); } }
// นำเข้าเข้าสมุดที่เปิดอยู่: หน้าแรกใช้หน้าปัจจุบันถ้ายังว่าง ที่เหลือเพิ่มต่อจากหน้าปัจจุบัน · กระดานกว้าง: เรียงหน้าลงด้านล่างจุดที่ดูอยู่
async function inkPdfImport(file){ if(!ink.note)return;
 let pdf; inkStatus("กำลังเปิด PDF…","busy"); try{ pdf=await pdfOpen(file); }catch(e){ inkStatus("",""); tell("<b>นำเข้า PDF ไม่สำเร็จ</b><div style=\"font-size:13px;margin-top:8px\">"+esc(e.message||e)+"</div>"); return; }
 let n=pdf.numPages; if(n>PDF_MAXP){ if(!await ask(`PDF นี้มี <b>${n}</b> หน้า — นำเข้าได้ครั้งละ ${PDF_MAXP} หน้า<br>นำเข้าหน้า 1–${PDF_MAXP} ก่อนไหมคะ?<div style="font-size:12.5px;margin-top:8px;color:var(--ink-3)">หน้าที่เหลือ แยกไฟล์แล้วนำเข้าเพิ่มทีหลังได้</div>`,"นำเข้า "+PDF_MAXP+" หน้า")){ inkStatus("",""); return; } n=PDF_MAXP; }
 const nm=String(file.name||"PDF").replace(/\.pdf$/i,""); let done=0, by=null;
 if(ink.board){ const st=el("ink-stage"); by={x:ink.vx+st.clientWidth/ink.z/2, y:ink.vy+40}; }
 try{ for(let i=1;i<=n;i++){ inkStatus(`กำลังนำเข้า PDF หน้า ${i}/${n}…`,"busy");
   const q=await pdfPageImg(pdf,i), id="i"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); await inkImgSet(id,q.src); inkImgDirty.add(id);
   let x0,y0,w,h;
   if(ink.board){ w=900; h=w*q.h/q.w; x0=by.x-w/2; y0=by.y; by.y+=h+40; }
   else{ const s=Math.min(INK_W/q.w,INK_H/q.h); w=q.w*s; h=q.h*s; x0=(INK_W-w)/2; y0=q.w>q.h?0:(INK_H-h)/2; }   // แนวนอน (สไลด์) ชิดบน เหลือที่จดด้านล่าง
   const s={t:"i",id,c:"#000",w:0,lk:1,pdf:nm.slice(0,60)+" · หน้า "+i,p:[+x0.toFixed(1),+y0.toFixed(1),0,+(x0+w).toFixed(1),+(y0+h).toFixed(1),0]};
   if(ink.board){ const pg=inkPage(); pg.strokes=[...pg.strokes,s]; pg.dirty=true; }
   else if(i===1&&!inkPage().strokes.length){ const pg=inkPage(); pg.strokes=[s]; pg.dirty=true; }
   else{ ink.pages.splice(ink.cur+1,0,{id:inkUid(),strokes:[s],dirty:true,tpl:null}); ink.cur++; }
   done++; if(i%4===0){ inkRedraw(); await new Promise(r=>setTimeout(r,0)); } } }
 catch(e){ tell("<b>นำเข้าได้ "+done+" จาก "+n+" หน้า</b><div style=\"font-size:13px;margin-top:8px\">"+esc(e.message||String(e))+"</div>"); }
 finally{ try{ pdf.destroy(); }catch(e){} }
 if(!done){ inkStatus("",""); return; }
 if(!ink.board&&done>1)ink.cur=Math.max(0,ink.cur-done+1);   // กลับไปหน้าแรกของ PDF
 ink.sel=null; ink.metaDirty=true; inkOverClear(); inkRedraw(); inkToolbar(); if(typeof inkThumbsPaint==="function")try{ inkThumbsPaint(); }catch(e){}
 inkDirty(); inkStatus(`นำเข้า PDF ${done} หน้าแล้ว — เขียน/ไฮไลต์/พิมพ์ทับได้เลย`,"ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },4000); }
// สร้างสมุดใหม่จากไฟล์ PDF (ปุ่มในหน้าบันทึก)
async function inkPdfNew(file){ const title=String(file.name||"PDF").replace(/\.pdf$/i,"").slice(0,80)||"PDF";
 try{ await pdfjsLoad(); }catch(e){ tell("<b>นำเข้า PDF ไม่สำเร็จ</b><div style=\"font-size:13px;margin-top:8px\">"+esc(e.message)+"</div>"); return; }
 await inkNew({mode:"page",tpl:"blank",title});
 for(let t=0;t<80;t++){ if(ink.note&&ink.pages.length&&inkLive().title===title)break; await new Promise(r=>setTimeout(r,100)); }
 if(!ink.note){ tell("เปิดสมุดใหม่ไม่สำเร็จ ลองอีกครั้งนะคะ"); return; }
 if(el("ink-title"))el("ink-title").value=title; inkPdfImport(file); }
function pdfPick(cb){ let f=el("pdf-in"); if(!f){ f=document.createElement("input"); f.type="file"; f.id="pdf-in"; f.accept="application/pdf,.pdf"; f.hidden=true; document.body.appendChild(f); }
 f.onchange=()=>{ const x=f.files&&f.files[0]; f.value=""; if(x)cb(x); }; f.click(); }
// ⋯ ในสมุด
{ const _m=inkMoreMenu; inkMoreMenu=function(a){ const r=_m.apply(this,arguments); try{ const p=el("ink-pop"), o=p&&p.querySelector('[data-imore="ocr"]'); if(p&&!p.querySelector('[data-imore="pdf"]')){ const b=document.createElement("button"); b.type="button"; b.className="ink-mi"; b.setAttribute("data-imore","pdf"); b.textContent=ink.board?"📄 นำเข้า PDF (วางบนกระดาน)":"📄 นำเข้า PDF (เพิ่มเป็นหน้า)"; p.insertBefore(b,o||p.firstChild); } }catch(e){} return r; }; }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest('[data-imore="pdf"]'); if(!b)return; e.preventDefault(); e.stopImmediatePropagation(); inkClosePop(); pdfPick(inkPdfImport); },true);
// ลากไฟล์ PDF มาวางบนสมุด
(function(){ const st=el("ink-stage"); if(!st)return; st.addEventListener("drop",e=>{ const fs=[...((e.dataTransfer&&e.dataTransfer.files)||[])].filter(f=>/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)); if(!ink.note||!fs.length)return; e.preventDefault(); e.stopImmediatePropagation(); inkPdfImport(fs[0]); },true); })();
// ปุ่มในหน้าบันทึก
{ const _nv=noteView; noteView=function(){ const h=_nv.apply(this,arguments); return h.replace('<button class="btn ghost" id="addInk"','<button class="btn ghost" id="addPdf" title="นำเข้า PDF เป็นสมุดเขียนมือ — จด/ไฮไลต์/พิมพ์ทับ แล้วส่งออกเป็น PDF ใหม่">'+svg('<path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.5 3.5V9H19"/><path d="M9 14h6M9 17h4"/>',18)+'<span>นำเข้า PDF</span></button><button class="btn ghost" id="addInk"'); }; }
{ const _w=wire; wire=function(){ _w.apply(this,arguments); if(el("addPdf"))el("addPdf").onclick=()=>pdfPick(inkPdfNew); }; }
