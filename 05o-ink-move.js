// ===== เครื่องมือเคลื่อนย้าย (Move Tool แบบ Photoshop) — กระดานกว้าง & สมุดเขียนมือ =====
// • แตะ/ลากที่วัตถุใดก็ได้ = เลือกแล้วย้ายทันที (ไม่ต้องลาสโซ่) · Shift = เพิ่มเข้าที่เลือก · Alt/Option หรือปุ่ม “ทำสำเนา” = ลากแล้วได้สำเนา
// • ลูกศรบนคีย์บอร์ด = ขยับทีละนิด (Shift = ทีละมาก) · ปุ่ม V = สลับมาใช้เครื่องมือนี้ · ติดเส้นไกด์/ไม้บรรทัดได้
ink.mvAuto=(()=>{ try{ return localStorage.getItem("sw-ink-mva")!=="0"; }catch(e){ return true; } })();   // true = เลือกวัตถุใต้นิ้วอัตโนมัติ · false = ย้ายสิ่งที่เลือกอยู่จากตรงไหนก็ได้
ink.mvDup=0;
function inkMoveSave(){ try{ localStorage.setItem("sw-ink-mva",ink.mvAuto?"1":"0"); }catch(e){} }
function inkTopHit(S,x,y){ for(let q=S.length-1;q>=0;q--){ if(inkHit(S[q],x,y,10*inkPx()))return q; } return -1; }
function inkMoveStart(e,x,y,idx,dup){ ink.drag={mode:"move",id:e.pointerId,sx:x,sy:y,dx:0,dy:0,hide:dup?new Set():idx,dup:dup?1:0}; inkRedraw(); inkDrawSel(); }
// คืน true ถ้ารับเหตุการณ์ไปแล้ว
function inkMoveDown(e,x,y){
 const pg=inkPage(), S=pg.strokes, dup=!!(e.altKey||ink.mvDup), add=!!(e.shiftKey||e.ctrlKey||e.metaKey);
 const hit=inkTopHit(S,x,y);
 if(ink.sel&&inkSelLocked&&inkSelLocked()){ if(hit<0||!ink.sel.idx.has(hit)){ ink.sel=null; inkToolbar(); inkOverClear(); inkRedraw(); } else return true; }
 if(ink.sel&&!add){
  const inSel=hit>=0&&ink.sel.idx.has(hit);
  if(inSel||hit<0){ const b=ink.sel.box, pad=8, inBox=x>=b[0]-pad&&x<=b[2]+pad&&y>=b[1]-pad&&y<=b[3]+pad;
   if(inSel||inBox||!ink.mvAuto){ // จุดจับ (หมุน/ย่อขยาย) ก่อน ไม่เจอก็ย้ายทั้งชุดที่เลือก
    const keep=ink.sel; if(inkSelDown(e,x,y,false)){ if(ink.drag&&ink.drag.mode==="move"&&dup){ ink.drag.hide=new Set(); ink.drag.dup=1; inkRedraw(); inkDrawSel(); } return true; }
    if(!ink.mvAuto&&keep){ ink.sel=keep; inkToolbar(); inkMoveStart(e,x,y,keep.idx,dup); return true; } } }
 }
 if(hit>=0){
  let idx; if(add&&ink.sel){ idx=new Set(ink.sel.idx); if(idx.has(hit)&&!dup){ const rm=new Set(); inkExpandSel(rm,S,hit); rm.forEach(i=>idx.delete(i)); if(!idx.size){ ink.sel=null; inkToolbar(); inkRedraw(); inkDrawSel(); return true; } ink.sel={idx,box:inkBBox(S,idx)}; inkToolbar(); inkRedraw(); inkDrawSel(); return true; } inkExpandSel(idx,S,hit); }
  else{ idx=new Set(); inkExpandSel(idx,S,hit); }
  ink.sel={idx,box:inkBBox(S,idx)}; inkToolbar(); inkMoveStart(e,x,y,idx,dup); return true; }
 if(ink.sel){ ink.sel=null; inkToolbar(); inkOverClear(); inkRedraw(); }
 return false;
}
function inkMoveDup(d){
 const pg=inkPage(), S=pg.strokes, ids=[...ink.sel.idx].sort((a,b)=>a-b), gm=new Map();
 const cp=ids.map(i=>{ const s=S[i], o={...s,p:s.p.map((v,j)=>+(v+(j%3===0?d.dx:j%3===1?d.dy:0)).toFixed(1))}; if(o.id)o.id="q"+Math.random().toString(36).slice(2,8); if(o.fm&&o.fm.ids&&!o.fm.tp)o.fm={...o.fm}; delete o.lk; if(s.g){ if(!gm.has(s.g))gm.set(s.g,"g"+Math.random().toString(36).slice(2,8)); o.g=gm.get(s.g); } return o; });
 const next=[...S,...cp], idx=new Set(cp.map((_,j)=>S.length+j)); inkCommit(next,true); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar();
 inkStatus("ทำสำเนาแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },1600);
}
// ---------- ขยับด้วยลูกศร ----------
function inkNudge(dx,dy){
 if(!ink.sel||(inkSelLocked&&inkSelLocked()))return; const pg=inkPage(), idx=ink.sel.idx;
 const next=pg.strokes.map((s,i)=>idx.has(i)?{...s,p:s.p.map((v,j)=>+(v+(j%3===0?dx:j%3===1?dy:0)).toFixed(1))}:s); const b=ink.sel.box;
 const now=Date.now(), N=ink.nudge; ink.sel={idx,box:[b[0]+dx,b[1]+dy,b[2]+dx,b[3]+dy]};
 if(N&&N.pg===pg&&now-N.t<900){ pg.strokes=next; pg.dirty=true; N.t=now; inkRedraw(); inkOverClear(); inkDrawSel(); inkDirty(); }   // กดค้าง/กดถี่ = นับเป็นการย้อนครั้งเดียว
 else{ inkCommit(next,true); ink.nudge={pg,t:now}; }
}
document.addEventListener("keydown",e=>{
 if(!ink.note||!el("inkdlg").open||e.metaKey||e.ctrlKey||ink.ta)return; const a=document.activeElement, tg=a&&a.tagName; if(tg==="INPUT"||tg==="TEXTAREA"||tg==="SELECT"||(a&&a.isContentEditable))return;
 const k=e.key;
 if(k==="v"||k==="V"){ if(e.altKey)return; e.preventDefault(); const pt=ink.tool; ink.tool="move"; if(pt!=="move"&&!["lasso","move"].includes(pt))ink.sel=null; inkOverClear(); inkDrawSel(); inkToolbar(); return; }
 if(!ink.sel)return; const st=e.shiftKey?10:1;
 if(k==="ArrowLeft"){ e.preventDefault(); inkNudge(-st,0); } else if(k==="ArrowRight"){ e.preventDefault(); inkNudge(st,0); } else if(k==="ArrowUp"){ e.preventDefault(); inkNudge(0,-st); } else if(k==="ArrowDown"){ e.preventDefault(); inkNudge(0,st); }
});
// ---------- แถบตัวเลือกของเครื่องมือ ----------
(function(){ const f=inkSizesHtml; inkSizesHtml=function(){ if(ink.tool!=="move")return f.apply(this,arguments);
 return `<button type="button" class="ink-opt ink-bb${ink.mvAuto?" on":""}" id="ink-mva" title="เปิด = แตะวัตถุไหนก็เลือกแล้วย้ายได้เลย · ปิด = ย้ายสิ่งที่เลือกอยู่ จากตรงไหนก็ลากได้">${ink.mvAuto?"✓ เลือกอัตโนมัติ":"ย้ายที่เลือก (ปิดเลือกอัตโนมัติ)"}</button><button type="button" class="ink-opt ink-bb${ink.mvDup?" on":""}" id="ink-mvd" title="เปิด = ลากแล้วได้สำเนา (หรือกด Alt/Option ค้างตอนลาก)">${ink.mvDup?"✓ ทำสำเนาตอนลาก":"⧉ ทำสำเนาตอนลาก"}</button><span class="hint" style="font-size:12px;margin:0 6px">Shift = เลือกเพิ่ม · ลูกศร = ขยับทีละนิด</span>`; }; })();
(function(){ const sz=el("ink-sizes"); if(sz)sz.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return;
 if(b.id==="ink-mva"){ e.stopPropagation(); ink.mvAuto=!ink.mvAuto; inkMoveSave(); inkToolbar(); } else if(b.id==="ink-mvd"){ e.stopPropagation(); ink.mvDup=ink.mvDup?0:1; inkToolbar(); } },true); })();
(function(){ const f=inkToolbar; inkToolbar=function(){ const r=f.apply(this,arguments); const s=el("ink-stage"); if(s)s.style.cursor=ink.tool==="move"?"move":""; return r; }; })();
