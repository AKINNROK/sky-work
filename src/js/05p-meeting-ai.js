// ===== สรุปประชุม → แตกเป็นงาน (AI) — กระดานกว้าง · สมุดเขียนมือ · เขียนบันทึก =====
// AI อ่านข้อความ (และลายมือในรูป ถ้ามี) → สรุป · มติ · รายการงาน (ใคร/ทำอะไร/เมื่อไร) → ผู้ใช้ติ๊ก/แก้ แล้วกดสร้างงานจริงใน Sky Work
// ใช้ /api/ai เดิม และ aiRun({type:"add_task"}) เดิม (มีตัวตรวจสอบข้อมูลอยู่แล้ว) — AI ไม่เขียนข้อมูลเอง ต้องกดยืนยันทุกครั้ง
const ACT_SYS=(today,wd)=>`คุณคือผู้ช่วยเลขาประชุมของ HR (LeKise Group) งาน: อ่านบันทึกประชุม/โน้ต (อาจมีรูปลายมือแนบ) แล้วสรุปเป็น JSON เท่านั้น
วันนี้คือ ${today} (วัน${wd}) — ใช้แปลงวันที่แบบสัมพัทธ์ เช่น “ศุกร์นี้” “สัปดาห์หน้า” “สิ้นเดือน” เป็น YYYY-MM-DD
รูปแบบคำตอบ (ห้ามมีข้อความอื่นนอก JSON):
{"title":"ชื่อเรื่อง/หัวข้อประชุม สั้นๆ","summary":"สรุป 2-4 ประโยค","decisions":["มติ/ข้อตกลง"],"tasks":[{"title":"งานที่ต้องทำ (ขึ้นต้นด้วยกริยา กระชับ)","owner":"ชื่อผู้รับผิดชอบ หรือ \\"\\"","date":"YYYY-MM-DD หรือ \\"\\"","why":"เหตุผล/บริบทสั้นๆ หรือ \\"\\""}]}
กติกา: ใช้เฉพาะข้อมูลที่มีในบันทึก ห้ามแต่งงานหรือชื่อคนเพิ่ม · owner ใส่เฉพาะเมื่อมีระบุชื่อชัดเจน ไม่ชัดให้เว้นว่าง · date ใส่เฉพาะเมื่อมีกำหนดหรือพอเทียบได้ ไม่ชัดเว้นว่าง · รวมงานซ้ำเป็นข้อเดียว · ไม่เกิน 15 งาน · ภาษาไทย · ถ้าไม่มีงานให้ tasks เป็น []`;
const actToday=()=>{ const d=new Date(), p=n=>String(n).padStart(2,"0"); return {iso:d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()),wd:["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"][d.getDay()]}; };
const ACT={ctx:null,data:null,src:null};
function actOv(host){ let o=el("act-ov"); if(!o){ o=document.createElement("div"); o.id="act-ov"; o.className="ink-ocr act-ov"; host.appendChild(o); o.addEventListener("pointerdown",e=>e.stopPropagation()); o.addEventListener("click",e=>{ if(e.target===o&&o.dataset.st!=="load")actClose(); }); } return o; }
function actClose(){ const o=el("act-ov"); if(o)o.remove(); }
function actMsg(host,html){ const o=actOv(host); o.dataset.st="msg"; o.innerHTML=`<div class="ocr-box">${html}<button type="button" class="btn ghost" data-ac="x" style="width:100%;margin-top:14px">ปิด</button></div>`; o.querySelector("[data-ac=x]").onclick=actClose; }
// ---------- รวบรวมเนื้อหา ----------
function actFromNote(){ const NEe=NE(); const sel=getSelection(); let tx=(sel&&!sel.isCollapsed&&NEe.contains(sel.anchorNode))?sel.toString():""; const whole=!tx.trim(); if(whole)tx=NEe.innerText||""; const title=(el("n-title")&&el("n-title").value)||""; return {ctx:"note",text:tx.trim().slice(0,14000),title,whole,img:null}; }
function actFromInk(){
 const pg=inkPage(); if(!pg)return null; const S=pg.strokes; const idx=(ink.sel&&ink.sel.idx.size)?ink.sel.idx:null; const pick=idx?[...idx].map(i=>S[i]).filter(Boolean):S;
 const txs=pick.filter(s=>s.t==="x"&&s.tx).sort((a,b)=>(Math.abs(a.p[1]-b.p[1])<12?a.p[0]-b.p[0]:a.p[1]-b.p[1])).map(s=>s.tx);
 const hasHand=pick.some(s=>s.t==="p"||s.t==="s"); let img=null;
 if(hasHand){ try{ const cvs=idx?(inkOcrCanvas(S,idx)||{}).canvas:(ink.board?inkBoardCanvas(1600):inkPageCanvas(pg,1400)); if(cvs)img=cvs.toDataURL("image/jpeg",.82).split(",")[1]; }catch(e){} }
 return {ctx:"ink",text:txs.join("\n").slice(0,14000),title:(el("ink-title").value||"").trim(),whole:!idx,img,hasHand}; }
// ---------- เรียก AI ----------
async function actRun(kind){
 const src=kind==="note"?actFromNote():actFromInk(); const host=el(kind==="note"?"ndlg":"inkdlg");
 if(!src||(!src.text&&!src.img)){ actMsg(host,`<b>ยังไม่มีเนื้อหาให้สรุป</b><div class="hint" style="margin:8px 0 0;line-height:1.7">${kind==="note"?"พิมพ์บันทึกประชุมก่อน (หรือเลือกข้อความที่ต้องการ) แล้วกดอีกครั้งค่ะ":"เขียนหรือพิมพ์บันทึกในหน้านี้ก่อน (หรือลาสโซ่เลือกเฉพาะส่วนที่ต้องการ) แล้วกดอีกครั้งค่ะ"}</div>`); return; }
 ACT.src=src; actOv(host).dataset.st="load"; actOv(host).innerHTML=`<div class="ocr-box"><div class="ocr-spin"></div><b>กำลังอ่านและสรุปบันทึก…</b><div class="hint" style="margin:6px 0 0">${src.img?"รวมลายมือในรูปด้วย · ":""}ใช้เวลาราว 5–20 วินาที</div></div>`;
 try{
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const t=actToday(), ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),70000);
  const body={system:ACT_SYS(t.iso,t.wd),context:"",max_tokens:2200,messages:[{role:"user",content:(src.title?"หัวข้อ: "+src.title+"\n":"")+(src.text?"เนื้อหาบันทึก:\n"+src.text:"(ไม่มีข้อความพิมพ์ — อ่านจากรูปลายมือที่แนบ)")+"\n\nสรุปเป็น JSON ตามรูปแบบที่กำหนด"}]};
  if(src.img)body.images=[{media:"image/jpeg",data:src.img}];
  const r=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(body)});
  clearTimeout(tm); const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(r.status===503?"ยังไม่ได้ตั้งค่าระบบ AI ที่ Vercel (ต้องมี ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)":(j.message||("ผิดพลาด "+r.status)));
  if(!el("act-ov"))return; const d=aiJsonOf(j.text); if(!d||typeof d!=="object"||Array.isArray(d))throw new Error("AI ตอบกลับในรูปแบบที่อ่านไม่ได้ ลองอีกครั้งค่ะ");
  const clean=v=>String(v==null?"":v).trim();
  ACT.data={title:clean(d.title).slice(0,120)||src.title||"สรุปประชุม",summary:clean(d.summary).slice(0,1500),decisions:(Array.isArray(d.decisions)?d.decisions:[]).map(clean).filter(Boolean).slice(0,12),tasks:(Array.isArray(d.tasks)?d.tasks:[]).slice(0,15).map(t=>({title:clean(t&&t.title).slice(0,200),owner:clean(t&&t.owner).slice(0,60),date:/^\d{4}-\d{2}-\d{2}$/.test(clean(t&&t.date))?clean(t.date):"",why:clean(t&&t.why).slice(0,300),on:true})).filter(t=>t.title)};
  actPaint(host);
 }catch(e){ actMsg(host,`<b>สรุปไม่สำเร็จ</b><div class="hint" style="margin:8px 0 0;line-height:1.7">${esc(e&&e.name==="AbortError"?"รอนานเกินไป ลองใหม่อีกครั้งค่ะ":(e.message||String(e)))}</div>`); }
}
// ---------- หน้าต่างผลลัพธ์ ----------
function actPaint(host){
 const D=ACT.data, o=actOv(host); o.dataset.st="ok"; const gs=(typeof groups!=="undefined"?groups:[]);
 const rows=D.tasks.map((t,i)=>`<div class="act-row"><label class="act-ck"><input type="checkbox" data-ai="${i}" ${t.on?"checked":""} aria-label="เลือกงานที่ ${i+1}"></label><div class="act-f"><input type="text" class="act-t" data-at="${i}" value="${esc(t.title)}" aria-label="ชื่องาน"><div class="act-s"><input type="text" data-ao="${i}" value="${esc(t.owner)}" placeholder="ผู้รับผิดชอบ" aria-label="ผู้รับผิดชอบ"><input type="date" data-ad="${i}" value="${esc(t.date)}" aria-label="กำหนดเสร็จ"></div>${t.why?`<div class="act-w">${esc(t.why)}</div>`:""}</div></div>`).join("");
 o.innerHTML=`<div class="ocr-box act-box"><b>🧾 ${esc(D.title)}</b>
 ${D.summary?`<div class="act-sum">${esc(D.summary).replace(/\n/g,"<br>")}</div>`:""}
 ${D.decisions.length?`<div class="act-h">มติ / ข้อตกลง</div><ul class="act-ul">${D.decisions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
 <div class="act-h">งานที่ต้องทำ ${D.tasks.length?`<small>(ติ๊กเลือก · แก้ไขได้ก่อนสร้าง)</small>`:""}</div>
 ${rows||`<div class="hint" style="margin:4px 0 8px">ไม่พบรายการงานในบันทึกนี้</div>`}
 ${D.tasks.length?`<div class="act-grp"><label>หมวดงาน <select id="act-track">${gs.map(g=>`<option value="${esc(g.key)}"${g.key==="ops"?" selected":""}>${esc(g.label||g.key)}</option>`).join("")}</select></label></div>`:""}
 <div class="ocr-btns">${D.tasks.length?`<button type="button" class="btn" data-ac="mk" id="act-mk">สร้างงาน</button>`:""}<button type="button" class="btn ghost" data-ac="ins">แทรกสรุปลงหน้า</button><button type="button" class="btn ghost" data-ac="cp">คัดลอกสรุป</button><button type="button" class="btn ghost" data-ac="x">ปิด</button></div><div id="act-res" class="hint" style="margin-top:8px"></div></div>`;
 const cnt=()=>{ const n=D.tasks.filter(t=>t.on&&t.title.trim()).length, b=el("act-mk"); if(b){ b.textContent=n?`สร้างงาน ${n} รายการ`:"ยังไม่ได้เลือกงาน"; b.disabled=!n; } }; cnt();
 o.addEventListener("input",e=>{ const g=e.target; const k=g.dataset; if(k.at!=null)D.tasks[+k.at].title=g.value; else if(k.ao!=null)D.tasks[+k.ao].owner=g.value; else if(k.ad!=null)D.tasks[+k.ad].date=g.value; cnt(); });
 o.addEventListener("change",e=>{ const g=e.target; if(g.dataset.ai!=null){ D.tasks[+g.dataset.ai].on=g.checked; cnt(); } });
 o.onclick=async e=>{ const b=e.target.closest("button"); if(!b)return; const a=b.dataset.ac; if(!a)return; e.stopPropagation();
  if(a==="x")actClose(); else if(a==="cp"){ try{ await navigator.clipboard.writeText(actText()); b.textContent="คัดลอกแล้ว ✓"; }catch(er){ b.textContent="คัดลอกไม่ได้"; } }
  else if(a==="ins")actInsert(b); else if(a==="mk")actCreate(b); };
}
function actText(){ const D=ACT.data; const L=[D.title]; if(D.summary)L.push("",D.summary); if(D.decisions.length){ L.push("","มติ / ข้อตกลง"); D.decisions.forEach(x=>L.push("• "+x)); } const T=D.tasks.filter(t=>t.title.trim()); if(T.length){ L.push("","งานที่ต้องทำ"); T.forEach(t=>L.push("☐ "+t.title+(t.owner?" — "+t.owner:"")+(t.date?" ("+fmtDate(t.date)+")":""))); } return L.join("\n"); }
function actInsert(btn){
 if(ACT.src.ctx==="note"){ const D=ACT.data, h=`<h3>${esc(D.title)}</h3>${D.summary?`<p>${esc(D.summary)}</p>`:""}${D.decisions.length?`<p><b>มติ / ข้อตกลง</b></p><ul>${D.decisions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}${D.tasks.length?`<p><b>งานที่ต้องทำ</b></p><ul class="ck">${D.tasks.filter(t=>t.title.trim()).map(t=>`<li data-c="0">${esc(t.title)}${t.owner?" — "+esc(t.owner):""}${t.date?" ("+esc(fmtDate(t.date))+")":""}</li>`).join("")}</ul>`:""}`;
  NE().focus(); const r=document.createRange(); r.selectNodeContents(NE()); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("insertHTML",false,"<p><br></p>"+h); neSave(); }
 else{ ink.voiceObj=null; ink.sel=null; inkVoiceText(actText()); }
 btn.textContent="แทรกแล้ว ✓"; btn.disabled=true; }
async function actCreate(btn){
 const D=ACT.data, sel=D.tasks.filter(t=>t.on&&t.title.trim()); if(!sel.length)return; btn.disabled=true; btn.textContent="กำลังสร้าง…";
 const track=(el("act-track")||{}).value, from=ACT.src.title||D.title; let ok=0, bad=[];
 for(const t of sel){ try{ await aiRun({type:"add_task",title:t.title.trim(),date:t.date||"",owner:t.owner.trim(),track,why:t.why,note:"จากบันทึกประชุม: "+from}); ok++; }catch(e){ bad.push(t.title.slice(0,30)+" ("+(e.message||"ผิดพลาด")+")"); } }
 const res=el("act-res"); if(res)res.innerHTML=`<b style="color:var(--done,#1a7f4b)">สร้างงานแล้ว ${ok} รายการ ✓</b> ดูได้ที่หน้างาน/ปฏิทิน`+(bad.length?`<div style="color:var(--over,#c0392b);margin-top:4px">ไม่สำเร็จ ${bad.length}: ${esc(bad.join(" · "))}</div>`:"");
 btn.textContent=ok?"สร้างแล้ว ✓":"ลองใหม่"; btn.disabled=!!ok; if(ok)try{ tell&&0; }catch(e){}
}
// ---------- ปุ่ม ----------
(function(){ const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="act"]'); if(b){ e.stopImmediatePropagation(); neSave(); actRun("note"); } },true);
 ["inkdlg","ndlg"].forEach(id=>{ const d=el(id); if(d)d.addEventListener("close",actClose); }); })();
