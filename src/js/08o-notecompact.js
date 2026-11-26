// ===== หน้าเขียนบันทึก: แถบเครื่องมือกะทัดรัด (v14.14.63) =====
// โหมดย่อ (ค่าเริ่มต้น): ฟอนต์/ขนาด 1 แถว + เครื่องมือ 1 แถว (เลื่อนซ้าย-ขวาได้) · ซ่อนแถว "เนื้อหา / พูดให้พิมพ์" (มีปุ่ม 🎤 พูด ในแถบแล้ว)
// ประเภท + วันที่ อยู่แถวเดียวกัน → พื้นที่พิมพ์เนื้อหาเพิ่มขึ้นมาก · ปุ่ม "▾ ทั้งหมด / ▴ ย่อ" สลับกลับแบบเดิมได้ (จำค่าไว้ในเครื่อง)
const NTC_K="sw-ntc";
const ntcOn=()=>{ try{ return localStorage.getItem(NTC_K)!=="0"; }catch(e){ return true; } };
(function(){ const nt=el("ntool"), dlg=el("ndlg"); if(!nt||!dlg)return;
 const row=document.createElement("div"); row.className="ntrow"; row.id="ntrow";
 [...nt.children].forEach(c=>{ if(c.id!=="nefbar"&&!c.classList.contains("netbar"))row.appendChild(c); });
 const tg=document.createElement("button"); tg.type="button"; tg.id="ntc-tg"; tg.className="ntc-tg"; row.insertBefore(tg,row.firstChild);
 const nb=nt.querySelector(".netbar"); nt.insertBefore(row,nb||null);
 const paint=()=>{ const on=ntcOn(); dlg.classList.toggle("ncompact",on); tg.textContent=on?"▾ ทั้งหมด":"▴ ย่อ"; tg.title=on?"แสดงเครื่องมือทั้งหมดแบบหลายแถว":"ย่อเครื่องมือให้เหลือ 2 แถว (พื้นที่พิมพ์มากขึ้น)"; };
 tg.addEventListener("mousedown",e=>e.preventDefault());
 tg.addEventListener("click",e=>{ e.preventDefault(); e.stopImmediatePropagation(); try{ localStorage.setItem(NTC_K,ntcOn()?"0":"1"); }catch(x){} paint(); });
 paint();
})();
