// ===== iPad: กันจอขาว/ข้อมูลหาย (v14.14.65) =====
// จากวิดีโอ: (1) แตะ/เขียน Scribble ในบันทึก → จอซูมเข้าเอง (ฟอนต์เล็กกว่า 16px × ซูมแอป) → แก้ใน <head> (maximum-scale=1 เฉพาะ iOS)
// (2) สลับภาษาคีย์บอร์ดตอนจอซูมอยู่ → หน้าเว็บขาวทั้งจอ = iPadOS ปิดหน้าเพราะหน่วยความจำเต็ม
//   แก้: ปิดเบลอพื้นหลังหน้าต่างบน iOS · คืนหน่วยความจำ canvas ของสมุดเมื่อปิดสมุด · เก็บร่างทันทีเมื่อแอปถูกพักไว้
//   และถ้าเปิดแอปใหม่แล้วมีบันทึกที่ยังไม่ได้กดบันทึก → ขึ้นแถบ "เปิดต่อ" กู้คืนให้ทันที
(function(){
 const d=el("inkdlg");
 if(d)d.addEventListener("close",()=>{ try{ ["ink-base","ink-over","ink-pred","ink-laser"].forEach(id=>{ const c=el(id); if(c){ c.width=1; c.height=1; } }); ink.rc=null; }catch(e){} });
 const flush=()=>{ try{ if(typeof DR!=="undefined"&&DR.cur&&typeof drStore==="function")drStore(); }catch(e){} };
 addEventListener("pagehide",flush); document.addEventListener("visibilitychange",()=>{ if(document.hidden)flush(); });
})();
function drResumeList(){ const out=[]; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(!k||k.indexOf("sw-dr:ndlg:")!==0)continue;
 const v=JSON.parse(localStorage.getItem(k)||"null"); if(!v||!v.snap)continue; const age=Date.now()-new Date(v.at).getTime(); if(!(age>=0&&age<3*864e5))continue;
 const f=v.snap.f||v.snap.fields||{}, h=v.snap.h||v.snap.html||{}; const title=(f["n-title"]||"").trim(), body=String(h["n-body"]||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
 if(!title&&!body)continue; out.push({key:k.slice(6),at:v.at,title:title||body.slice(0,30)}); } }catch(e){} return out.sort((a,b)=>a.at<b.at?1:-1); }
function drResumeOpen(r){ const id=r.key.slice(5); let n=null; if(id!=="new"){ n=(notes||[]).find(x=>x._id===id); if(!n){ setFoot("ยังโหลดบันทึกนี้ไม่เสร็จ — ลองอีกครั้งในอีกสักครู่"); return; } }
 openNote(n); let t=0; const iv=setInterval(()=>{ t++; const b=document.querySelector('#ndlg .dr-bar.has [data-dr="restore"]'); if(b){ clearInterval(iv); b.click(); } else if(t>20)clearInterval(iv); },100); }
function drResumeBar(){ if(el("ndlg")&&el("ndlg").open)return; const L=drResumeList(); const old=el("drres"); if(old)old.remove(); if(!L.length)return;
 const r=L[0], b=document.createElement("div"); b.id="drres"; b.className="drres"; b.setAttribute("role","status");
 b.innerHTML=`📝 มีบันทึกที่ยังไม่ได้กดบันทึก <b>${esc(r.title)}</b> <span style="opacity:.75">(${esc(drHM(r.at))})</span><button type="button" data-dg="go">เปิดต่อ</button><button type="button" class="ghost" data-dg="no">ภายหลัง</button>`;
 b.addEventListener("click",e=>{ const x=e.target.closest("[data-dg]"); if(!x)return; b.remove(); if(x.dataset.dg==="go")drResumeOpen(r); });
 document.body.appendChild(b); }
setTimeout(()=>{ try{ drResumeBar(); }catch(e){ console.error(e); } },3500);
