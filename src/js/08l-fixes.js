// ===== รอบแก้จากการทดสอบแบบผู้ใช้ (v14.14.54+) =====
// A1 ประชุมที่ถูกบันทึกเป็นอบรม (บั๊กฟอร์มเดิม: กลุ่มเริ่มต้นตกที่ "อบรมตามกฎหมาย") → ตรวจหา + แก้ให้เมื่อผู้ใช้กดยืนยัน
// A2 ค่าใช้จ่ายนับซ้ำ: ถ้ามีบันทึกเงินผูกกับงาน ระบบใช้ยอดบันทึกเงินเป็น "ใช้จริง" ของงาน (actOf/actOwn ใน 03-views-home.js) + คำอธิบายในฟอร์ม
const mtFix=()=>items.filter(t=>t.status!==STATUS_CANCEL&&(t.meet===true||(/ประชุม|meeting/i.test(t.type||"")))&&(t.train===true||/^train_/.test(t.track||""))
 &&!(+t.pax)&&!(+t.hours)&&!(t.vendor||"").trim()&&!t.course&&!t.dsd&&!t.batch&&!t.dsdOpenDate&&!t.dsdCertDate);
function mtFixBanner(){ const L=mtFix(); if(!L.length)return "";
 return `<div class="banner bad" style="margin:0 0 14px">⚠ พบ <b>${L.length}</b> การประชุมที่ถูกบันทึกเป็น “งานอบรม” (จากบั๊กฟอร์มเพิ่มประชุมเวอร์ชันก่อน) — ทำให้ยอดอบรมเกินจริง <button class="btn sm" id="mtFixGo" style="margin-left:auto">ตรวจและแก้</button></div>`; }
async function mtFixRun(){ const L=mtFix(); if(!L.length)return; const ng=neutralGroup();
 const ok=await ask(`แก้ ${L.length} รายการนี้ให้เป็น “การประชุม” (ไม่นับเป็นอบรม) และย้ายไปกลุ่ม “${esc(gLabel(ng))}”?<div style="font-size:13px;margin-top:10px;max-height:40vh;overflow:auto;text-align:left;line-height:1.8">${L.map(t=>"• "+esc(t.title)+(t.date?" ("+fmtDate(t.date)+")":"")).join("<br>")}</div><div style="font-size:12.5px;margin-top:8px;color:var(--ink-3)">เปลี่ยนแค่ประเภท/กลุ่มงาน ข้อมูลอื่นเหมือนเดิม · แก้กลับเองได้ในฟอร์ม</div>`,"แก้ทั้งหมด");
 if(!ok)return; let n=0; for(const t of L){ try{ await DB.collection("items").doc(t._id).set({train:false,meet:true,track:ng,type:t.type||"ประชุม"},{merge:true}); n++; }catch(e){} }
 setFoot("แก้ประเภทการประชุมแล้ว "+n+" รายการ"); render(); }
{ const _t=train; train=function(){ const h=_t.apply(this,arguments); const b=mtFixBanner(); return b?h.replace(/(<\/div>\s*)(<div class="toolbar")/,"$1"+b+"$2"):h; }; }
{ const _m=meet; meet=function(){ const h=_m.apply(this,arguments); const b=mtFixBanner(); return b?h.replace(/(<\/div>\s*)(<div class="toolbar")/,"$1"+b+"$2"):h; }; }
// A2 คำอธิบายในฟอร์ม: ช่อง "ใช้จริง" ของงาน และ "ผูกกับงาน" ในบันทึกเงิน
{ const _o=open_; open_=function(t){ const r=_o.apply(this,arguments); try{ const a=el("f-actual"); if(a){ let h=el("f-actual-h"); if(!h){ h=document.createElement("div"); h.id="f-actual-h"; h.className="hint"; h.style.marginTop="6px"; a.parentNode.appendChild(h); }
  const l=t?txLinkedSum(t):0; h.innerHTML=l?`มี <b>บันทึกเงินผูกกับงานนี้ ${baht(l)} ฿</b> — ระบบใช้ยอดนี้เป็น “ใช้จริง” (ไม่นับช่องนี้ซ้ำ)`:"ถ้าจะบันทึกค่าใช้จ่ายเป็นรายการ (ใบเสร็จหลายใบ) ใช้ “บันทึกเงิน” แล้วผูกกับงานนี้แทนได้ — ระบบจะไม่นับซ้ำ"; a.style.opacity=l?".55":""; } }catch(e){} return r; }; }
{ const _x=openTx; openTx=function(){ const r=_x.apply(this,arguments); try{ const s=el("t-task"); if(s&&!el("t-task-h")){ const h=document.createElement("div"); h.id="t-task-h"; h.className="hint"; h.style.marginTop="6px"; h.textContent="ผูกกับงานแล้ว ยอดนี้จะเป็น “ใช้จริง” ของงานนั้น (แทนช่องใช้จริงในงาน ไม่นับซ้ำ)"; s.parentNode.appendChild(h); } }catch(e){} return r; }; }
{ const _w=wire; wire=function(){ _w.apply(this,arguments); if(el("mtFixGo"))el("mtFixGo").onclick=mtFixRun; }; }
