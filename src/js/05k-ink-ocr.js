// ===== ลายมือ → ตัวพิมพ์ (ลาสโซ่เลือกลายมือ แล้วให้ AI อ่านเป็นข้อความ) =====
// ใช้ /api/ai (ANTHROPIC_API_KEY เก็บฝั่งเซิร์ฟเวอร์เท่านั้น) · ส่งเฉพาะรูปของลายมือที่เลือก ไม่ส่งทั้งสมุด
const INK_OCR_SYS="คุณคือเครื่องอ่านลายมือ (OCR) สำหรับภาษาไทยและอังกฤษ งานเดียวของคุณคือถอดข้อความจากลายมือในรูปให้ตรงตามที่เขียนที่สุด\n- ตอบเฉพาะข้อความที่ถอดได้ ห้ามมีคำอธิบาย คำนำ หรือเครื่องหมายคำพูดครอบ\n- รักษาการขึ้นบรรทัดตามที่เห็นในรูป (หนึ่งบรรทัดในรูป = หนึ่งบรรทัดในคำตอบ)\n- สัญลักษณ์หัวข้อ เช่น •, -, 1., ☐ ให้คงไว้ตามที่เขียน\n- ถ้าอ่านคำไหนไม่ออกจริงๆ ให้ใส่ [?] แทนคำนั้น อย่าเดาจนเกินจริง\n- ถ้าไม่มีข้อความเลย ให้ตอบว่า (ไม่พบข้อความ)";
function inkOcrCanvas(S,idx){
 const strokes=[...idx].map(i=>S[i]).filter(s=>s&&(s.t==="p"||s.t==="s"||s.t==="x"));
 if(!strokes.length)return null;
 const ids=new Set(strokes.map((_,i)=>i)); const bb=inkBBox(strokes,ids); const pad=28, w=bb[2]-bb[0]+pad*2, h=bb[3]-bb[1]+pad*2;
 let k=Math.min(1800/w,1800/h,2.5); if(h*k<140)k=Math.min(2.5,140/h); k=Math.max(.25,k);
 const c=document.createElement("canvas"); c.width=Math.max(8,Math.ceil(w*k)); c.height=Math.max(8,Math.ceil(h*k));
 const ctx=c.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,c.width,c.height);
 strokes.forEach(s=>{ const q={...s,c:"#000"}; if(q.t==="p")q.w=Math.max(2.4,s.w||2); delete q.r; delete q.lk; inkStroke(ctx,q,k,-bb[0]+pad,-bb[1]+pad); });
 return {canvas:c,bb,n:strokes.length,hasHand:strokes.some(s=>s.t==="p"||s.t==="s")};
}
function inkOcrClose(){ const o=el("ink-ocr"); if(o)o.remove(); }
function inkOcrUi(state,txt,ctxo){
 let o=el("ink-ocr"); if(!o){ o=document.createElement("div"); o.id="ink-ocr"; o.className="ink-ocr"; el("inkdlg").appendChild(o);
  o.addEventListener("pointerdown",e=>e.stopPropagation()); o.addEventListener("click",e=>{ if(e.target===o&&o.dataset.st!=="load")inkOcrClose(); }); }
 o.dataset.st=state;
 if(state==="load"){ o.innerHTML=`<div class="ocr-box"><div class="ocr-spin"></div><b>กำลังอ่านลายมือ…</b><div class="hint" style="margin:6px 0 0">ใช้เวลาราว 3–10 วินาที</div></div>`; return; }
 if(state==="err"){ o.innerHTML=`<div class="ocr-box"><b>อ่านลายมือไม่สำเร็จ</b><div class="hint" style="margin:8px 0 14px;line-height:1.7">${esc(txt)}</div><button type="button" class="btn ghost" data-oc="x" style="width:100%">ปิด</button></div>`; o.querySelector("[data-oc=x]").onclick=inkOcrClose; return; }
 o.innerHTML=`<div class="ocr-box"><b>ข้อความที่อ่านได้</b><div class="hint" style="margin:4px 0 8px">ตรวจ/แก้ไขได้ก่อนวาง · คำที่อ่านไม่ออกจะเป็น [?]</div>
 <img class="ocr-img" alt="" src="${ctxo.thumb}"><textarea id="ink-ocr-ta" rows="6" spellcheck="false">${esc(txt)}</textarea>
 <div class="ocr-btns"><button type="button" class="btn" data-oc="rep">แทนที่ลายมือ</button><button type="button" class="btn ghost" data-oc="bes">วางไว้ใต้ลายมือ</button><button type="button" class="btn ghost" data-oc="cp">คัดลอก</button><button type="button" class="btn ghost" data-oc="x">ยกเลิก</button></div></div>`;
 const ta=el("ink-ocr-ta"); o.querySelector("[data-oc=x]").onclick=inkOcrClose;
 o.querySelector("[data-oc=cp]").onclick=async e=>{ try{ await navigator.clipboard.writeText(ta.value); e.target.textContent="คัดลอกแล้ว ✓"; }catch(er){ ta.select(); try{ document.execCommand("copy"); e.target.textContent="คัดลอกแล้ว ✓"; }catch(e2){} } };
 o.querySelector("[data-oc=rep]").onclick=()=>inkOcrPlace(ta.value,ctxo,true);
 o.querySelector("[data-oc=bes]").onclick=()=>inkOcrPlace(ta.value,ctxo,false);
 setTimeout(()=>{ try{ ta.focus(); }catch(e){} },60);
}
function inkOcrPlace(txt,c,replace){
 txt=String(txt||"").replace(/\r/g,"").trim(); if(!txt){ inkOcrClose(); return; }
 const pg=inkPage(); if(!pg){ inkOcrClose(); return; } const S=pg.strokes;
 // ตำแหน่ง id เดิม (ถ้าหน้าถูกแก้ระหว่างรอ AI ให้จับด้วยอ้างอิงอ็อบเจ็กต์)
 const gone=new Set(); if(replace)c.refs.forEach(r=>{ const i=S.indexOf(r); if(i>=0&&!r.lk)gone.add(i); });
 const L=txt.split("\n").length, hh=c.bb[3]-c.bb[1]; let fs=Math.round(hh/Math.max(1,L)/1.5); fs=Math.max(18,Math.min(64,fs||24));
 const col=(c.refs.find(r=>r.t==="p"&&r.c)||{}).c||ink.color.pen||"#1d1d1f";
 const dark=/^#([0-9a-f]{6})$/i.test(col)&&(parseInt(col.slice(1,3),16)*.3+parseInt(col.slice(3,5),16)*.59+parseInt(col.slice(5,7),16)*.11)<190;
 const x=c.bb[0], y=replace?c.bb[1]:c.bb[3]+fs*.5;
 const o=inkMkText(x,y,txt,fs,dark?col:"#1d1d1f");
 const keep=S.filter((_,i)=>!gone.has(i)); const next=[...keep,o];
 inkCommit(next); const idx=new Set([next.length-1]); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar();
 inkOcrClose(); inkStatus(replace?"แปลงเป็นตัวพิมพ์แล้ว (ยกเลิกได้ด้วย Undo)":"วางข้อความไว้ใต้ลายมือแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2600);
}
async function inkOcrRun(){
 if(!ink.sel||!ink.note){ inkStatus("ลาสโซ่เลือกลายมือก่อน แล้วกดปุ่มนี้","bad"); return; }
 const pg=inkPage(), S=pg.strokes, ids=[...ink.sel.idx]; const r=inkOcrCanvas(S,ink.sel.idx);
 if(!r){ inkStatus("ที่เลือกไม่มีลายมือ — ใช้ลาสโซ่ล้อมลายมือที่ต้องการแปลง","bad"); return; }
 const refs=ids.map(i=>S[i]).filter(Boolean);
 const thumb=(()=>{ const t=document.createElement("canvas"), m=Math.min(1,520/r.canvas.width,160/r.canvas.height); t.width=Math.max(1,Math.round(r.canvas.width*m)); t.height=Math.max(1,Math.round(r.canvas.height*m)); t.getContext("2d").drawImage(r.canvas,0,0,t.width,t.height); return t.toDataURL("image/jpeg",.7); })();
 const c={bb:r.bb,refs,thumb}; inkOcrUi("load");
 try{
  const data=r.canvas.toDataURL("image/jpeg",.88).split(",")[1];
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),60000);
  const resp=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:INK_OCR_SYS,context:"",max_tokens:1500,images:[{media:"image/jpeg",data}],messages:[{role:"user",content:"ถอดข้อความจากลายมือในรูปนี้"}]})});
  clearTimeout(tm); const j=await resp.json().catch(()=>({}));
  if(!resp.ok){ const m=resp.status===503?"ยังไม่ได้ตั้งค่าระบบ AI ที่ Vercel (ต้องมี ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY) — ตั้งเสร็จแล้วใช้ได้เลย":(j.message||("ผิดพลาด "+resp.status)); throw new Error(m); }
  let t=String(j.text||"").trim(); if(!el("ink-ocr"))return;   // ผู้ใช้กดปิดไปแล้ว
  if(!t||/^\(ไม่พบข้อความ\)$/.test(t)){ inkOcrUi("err","ไม่พบข้อความในส่วนที่เลือก — ลองเขียนให้ชัดขึ้น หรือล้อมให้ครบทั้งบรรทัด"); return; }
  if(typeof calcAutoText==="function")t=calcAutoText(t);   // บรรทัดที่ลงท้ายด้วย = คำนวณให้เลย
  inkOcrUi("ok",t,c);
 }catch(e){ inkOcrUi("err",e&&e.name==="AbortError"?"รอนานเกินไป ลองใหม่อีกครั้งค่ะ":(e.message||String(e))); }
}
(function(){ const b=el("ink-seltxt"); if(b)b.onclick=e=>{ e.stopPropagation(); inkOcrRun(); }; const d=el("inkdlg"); if(d)d.addEventListener("close",inkOcrClose); })();
// แสดงปุ่มเมื่อมีสิ่งที่เลือก (ต่อท้าย inkSelBtns เดิม)
(function(){ const f=inkSelBtns; inkSelBtns=function(){ f.apply(this,arguments); const b=el("ink-seltxt"); if(!b)return; const on=!!ink.sel&&ink.note; let has=false; if(on){ const pg=inkPage(), S=pg?pg.strokes:[]; has=[...ink.sel.idx].some(i=>S[i]&&(S[i].t==="p"||S[i].t==="s")); } b.hidden=!has; }; })();
