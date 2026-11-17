// ===== ร่างอัตโนมัติ (กันข้อมูลหายตอนเผลอปิด/รีเฟรช) — ฟอร์มเพิ่ม/แก้: งาน, บันทึก, รายการเงิน, กฎหมาย, Index, DSD =====
// ทุก ๆ ไม่กี่วินาทีที่ฟอร์มเปิดอยู่ จะเก็บสำเนาไว้ในเครื่อง (localStorage "sw-dr:…") · เปิดฟอร์มเดิมซ้ำ → ขึ้นแถบ "กู้คืนร่าง"
// กดบันทึกสำเร็จ = ล้างร่าง · กดบันทึกแล้วล้มเหลว = เก็บร่างคืนให้ · ปิดด้วย ยกเลิก/Esc ตอนยังไม่ได้บันทึก = ถามก่อน (เลือกเก็บร่างได้)
const DRF={
 dlg:{save:"save",cancel:"cancel",label:"งาน",key:()=>"dlg:"+(editing?editing._id:"new:"+(formKind||""))},
 ndlg:{save:"nsave",cancel:"ncancel",label:"บันทึก",key:()=>"ndlg:"+(editingNote?editingNote._id:"new")},
 tdlg:{save:"tsave",cancel:"tcancel",label:"รายการเงิน",key:()=>"tdlg:"+(editingTx?(editingTx._id||"x"):"new")},
 ldlg:{save:"lsave",cancel:"lcancel",label:"รายการกฎหมาย",key:()=>"ldlg:"+(editingLegal?(editingLegal._id||"x"):"new")},
 idlg:{save:"isave",cancel:"icancel",label:"Index",key:()=>"idlg:"+(editingIdx?(editingIdx._id||"x"):"new")},
 ddlg:{save:"dsave",cancel:"dcancel",label:"DSD",key:()=>"ddlg:"+(editingDsd?editingDsd.ck+"|"+editingDsd.y:"new")}
};
const DR={cur:null,lastSaved:null,t:null,iv:null};
const drLS={ get(k){ try{ return JSON.parse(localStorage.getItem("sw-dr:"+k)||"null"); }catch(e){ return null; } },
 set(k,v){ try{ localStorage.setItem("sw-dr:"+k,JSON.stringify(v)); return true; }catch(e){ return false; } },
 del(k){ try{ localStorage.removeItem("sw-dr:"+k); }catch(e){} } };
const drSkipIn=n=>{ const t=n.type; return t==="file"||t==="password"||t==="button"||t==="submit"||n.closest(".dr-bar"); };
const drKey=n=>{ const t=n.type; if(n.id)return n.id; if(t==="checkbox"||t==="radio"){ const c=n.closest("[id]"); return (c?c.id:"")+"#"+(n.name||"")+"#"+n.value; } return null; };
function drSnap(id){ const d=el(id), f={}, h={};
 d.querySelectorAll("input,select,textarea").forEach(n=>{ if(drSkipIn(n))return; const k=drKey(n); if(!k)return; f[k]=(n.type==="checkbox"||n.type==="radio")?n.checked:n.value; });
 d.querySelectorAll("[contenteditable]").forEach(n=>{ if(n.id&&n.getAttribute("contenteditable")!=="false")h[n.id]=n.innerHTML; });
 const x={}; if(id==="ndlg"){ x.nf=el("n-body").getAttribute("data-nf")||""; x.ns=el("n-body").getAttribute("data-ns")||""; }
 if(id==="dlg"){ x.ms=msDraft; x.ap=apDraft; x.stk=formStk; x.q=curQuad; x.skip=occSkipDraft; }
 return {f,h,x}; }
function drRestore(id,snap){ const d=el(id), chg=[];
 if(id==="dlg"&&snap.x){ try{ msDraft=snap.x.ms||[]; apDraft=snap.x.ap||[]; formStk=snap.x.stk||[]; if(snap.x.q!==undefined)curQuad=snap.x.q; occSkipDraft=snap.x.skip||[]; paintChk("ms"); paintChk("ap"); stkPickerPaint(); paintQuad(); }catch(e){ console.error(e); } }
 Object.keys(snap.h||{}).forEach(k=>{ const n=el(k); if(n&&d.contains(n)){ n.innerHTML=snap.h[k]; try{ if(typeof ntHydrate==="function")ntHydrate(n); }catch(e){} } });
 d.querySelectorAll("input,select,textarea").forEach(n=>{ if(drSkipIn(n))return; const k=drKey(n); if(!k||!(k in snap.f))return; const v=snap.f[k], cb=(n.type==="checkbox"||n.type==="radio");
  if(cb){ if(n.checked!==v){ n.checked=v; chg.push(n); } } else if(n.value!==v){ n.value=v; chg.push(n); } });
 chg.forEach(n=>{ try{ n.dispatchEvent(new Event("input",{bubbles:true})); n.dispatchEvent(new Event("change",{bubbles:true})); }catch(e){} });
 if(id==="dlg"){ try{ if(typeof syncKind==="function")syncKind(); if(typeof syncGen==="function")syncGen(); if(typeof syncStatusLabel==="function")syncStatusLabel(); }catch(e){} }
 if(id==="ndlg"&&snap.x&&typeof neNoteFontSet==="function")neNoteFontSet(snap.x.nf||"",+snap.x.ns||0);
 if(id==="ndlg"){ try{ if(typeof ntFoldApply==="function")ntFoldApply(el("n-body")); if(typeof neState==="function")neState(); }catch(e){} } }
const drHM=iso=>{ const d=new Date(iso); return isNaN(d)?"":d.toLocaleDateString("th-TH",{day:"numeric",month:"short"})+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
function drBar(){ const c=DR.cur; if(!c)return; const d=el(c.id); let b=d.querySelector(".dr-bar"); if(!b){ b=document.createElement("div"); b.className="dr-bar"; b.innerHTML=`<span class="dr-st" role="status">💾 ร่างอัตโนมัติเปิดอยู่</span><span class="dr-rs" hidden><span class="dr-tx"></span><button type="button" class="dr-b" data-dr="restore">กู้คืนร่าง</button><button type="button" class="dr-b ghost" data-dr="drop">ทิ้งร่าง</button></span>`; (d.querySelector("form")||d).prepend(b);
  b.addEventListener("click",e=>{ const x=e.target.closest("[data-dr]"); if(!x||!DR.cur)return; e.preventDefault(); e.stopPropagation();
   if(x.dataset.dr==="restore"){ const dr=drLS.get(DR.cur.key); if(dr){ drRestore(DR.cur.id,dr.snap); setFoot("กู้คืนร่างแล้ว — ตรวจดูแล้วกดบันทึกได้เลย"); } }
   else drLS.del(DR.cur.key);
   b.querySelector(".dr-rs").hidden=true; b.classList.remove("has"); drStore(); }); }
 return b; }
function drArm(id){ const d=el(id); if(!d||!d.open)return; const F=DRF[id]; if(!F)return;
 DR.cur={id,key:F.key(),base:JSON.stringify(drSnap(id)),last:"",saving:false}; const b=drBar(); b.querySelector(".dr-st").textContent="💾 ร่างอัตโนมัติเปิดอยู่"; b.querySelector(".dr-rs").hidden=true; b.classList.remove("has");
 const dr=drLS.get(DR.cur.key); if(dr&&dr.snap&&JSON.stringify(dr.snap)!==DR.cur.base){ b.querySelector(".dr-tx").textContent="พบร่าง"+F.label+"ที่ยังไม่ได้บันทึก ("+drHM(dr.at)+") "; b.querySelector(".dr-rs").hidden=false; b.classList.add("has"); }
 else if(dr)drLS.del(DR.cur.key); }
function drDirty(){ const c=DR.cur; if(!c||!el(c.id).open)return false; return JSON.stringify(drSnap(c.id))!==c.base; }
function drStore(){ const c=DR.cur; if(!c||c.saving||!el(c.id).open)return; const s=JSON.stringify(drSnap(c.id)); if(s===c.last)return; c.last=s;
 const b=el(c.id).querySelector(".dr-bar");
 if(s===c.base){ if(!(b&&b.classList.contains("has")))drLS.del(c.key); return; }
 if(b&&b.classList.contains("has"))return;           // ยังไม่ตอบแถบกู้คืน: อย่าเขียนทับร่างเดิม
 const ok=drLS.set(c.key,{at:new Date().toISOString(),label:DRF[c.id].label,snap:JSON.parse(s)});
 if(b)b.querySelector(".dr-st").textContent=ok?"💾 เก็บร่างอัตโนมัติแล้ว "+new Date().toTimeString().slice(0,5):"⚠ ร่างใหญ่เกินเก็บอัตโนมัติ — กดบันทึกเอง"; }
function drLater(){ clearTimeout(DR.t); DR.t=setTimeout(drStore,700); }
Object.keys(DRF).forEach(id=>{ const d=el(id); if(!d)return; const F=DRF[id];
 d.addEventListener("input",drLater); d.addEventListener("change",drLater);
 d.addEventListener("click",e=>{ if(!DR.cur||DR.cur.id!==id)return;
  if(e.target.closest("#"+F.save)){ DR.cur.saving=true; DR.lastSaved={id,key:DR.cur.key,snap:drSnap(id),at:Date.now()}; setTimeout(()=>{ if(DR.cur&&el(id).open)DR.cur.saving=false; },500); }
  else if(e.target.closest("#"+F.cancel)&&drDirty()&&!DR.cur.ok){ e.stopPropagation(); e.preventDefault(); drAskClose(id); } },true);
 d.addEventListener("cancel",e=>{ if(DR.cur&&DR.cur.id===id&&drDirty()&&!DR.cur.ok){ e.preventDefault(); drAskClose(id); } });
 d.addEventListener("close",()=>{ if(!DR.cur||DR.cur.id!==id)return; const c=DR.cur;
  if(c.saving&&!(DR.lastSaved&&DR.lastSaved.failed))drLS.del(c.key); else if(c.last&&c.last!==c.base){ /* เก็บร่างไว้ */ }
  const b=d.querySelector(".dr-bar"); if(b)b.remove(); DR.cur=null; }); });
async function drAskClose(id){ const c=DR.cur; drStore();
 const yes=await ask("<b>ยังไม่ได้กดบันทึก</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">ปิดตอนนี้ได้ — ระบบเก็บสิ่งที่กรอกไว้เป็นร่างให้ (14 วัน) เปิดฟอร์มเดิมแล้วกด “กู้คืนร่าง” ได้</div>","ปิด (เก็บร่างไว้)");
 if(!yes||!DR.cur||DR.cur.id!==id)return; DR.cur.ok=true; setFoot("เก็บร่างไว้ให้แล้ว — เปิดฟอร์มเดิมแล้วกด “กู้คืนร่าง”"); el(id).close(); }
{ const _sm=HTMLDialogElement.prototype.showModal; HTMLDialogElement.prototype.showModal=function(){ const r=_sm.apply(this,arguments); if(DRF[this.id]){ const id=this.id; setTimeout(()=>drArm(id),180); } return r; }; }
// บันทึกไม่สำเร็จหลังปิดฟอร์ม → เก็บร่างคืน (explainErr ถูกเรียกในทุกที่ที่บันทึกล้มเหลว)
{ const _ee=explainErr; explainErr=function(){ try{ const l=DR.lastSaved; if(l&&Date.now()-l.at<8000){ drLS.set(l.key,{at:new Date().toISOString(),label:DRF[l.id].label,snap:l.snap}); l.failed=true; setTimeout(()=>setFoot("บันทึกไม่สำเร็จ — เก็บร่างไว้ให้แล้ว เปิดฟอร์มเดิมแล้วกด “กู้คืนร่าง”"),50); } }catch(e){} return _ee.apply(this,arguments); }; }
DR.iv=setInterval(()=>{ if(DR.cur)drStore(); },4000);
document.addEventListener("visibilitychange",()=>{ if(document.hidden)drStore(); }); window.addEventListener("pagehide",drStore);
try{ const lim=Date.now()-14*864e5; Object.keys(localStorage).filter(k=>k.startsWith("sw-dr:")).forEach(k=>{ try{ const v=JSON.parse(localStorage.getItem(k)); if(!v||!v.at||new Date(v.at).getTime()<lim)localStorage.removeItem(k); }catch(e){ localStorage.removeItem(k); } }); }catch(e){}
