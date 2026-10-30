// ===== ไม้บรรทัด + เส้นไกด์ (แบบ Photoshop) — กระดานกว้าง & สมุดเขียนมือ =====
// ลากจากไม้บรรทัดด้านบน → เส้นไกด์แนวนอน · จากไม้บรรทัดด้านซ้าย → เส้นไกด์แนวตั้ง · ลากเส้น (จุดสามเหลี่ยมบนไม้บรรทัด) กลับไปที่ไม้บรรทัดเพื่อลบ
// แม่เหล็ก: ปากกา/ไฮไลต์/เทปที่เริ่มเขียนใกล้เส้น = ลากเป็นเส้นตรงตามไกด์ · รูปทรง/ข้อความ/ของที่ย้าย ดูดเข้าเส้น · ไกด์ไม่ถูกพิมพ์/ส่งออก
const RUL_S=22, GD_C="#00a8e8";
ink.rul=(()=>{ try{ return localStorage.getItem("sw-ink-rul")!=="0"; }catch(e){ return true; } })();
ink.gds=(()=>{ try{ return localStorage.getItem("sw-ink-gds")!=="0"; }catch(e){ return true; } })();
const inkGdList=()=>{ const pg=inkPage(); return pg?(pg.gd||(pg.gd=[])):[]; };
function inkGdMap(){ const m={}; ink.pages.forEach(p=>{ if(p.gd&&p.gd.length)m[p.id]=p.gd.map(g=>({o:g.o,v:g.v})); }); return m; }
function inkGdChanged(){ ink.metaDirty=true; inkDirty(); }
function inkRulMap(){ ink.rc=null; const a=inkToPage({clientX:0,clientY:0}), b=inkToPage({clientX:1000,clientY:1000}); const sx=(b[0]-a[0])/1000, sy=(b[1]-a[1])/1000; return {a,sx,sy,x:v=>(v-a[0])/sx,y:v=>(v-a[1])/sy}; }
function inkRulDraw(){
 const cv=el("ink-rul"); if(!cv)return; const on=!!(ink.rul&&ink.note&&!ink.pres&&inkPage()); ["ink-rul-h","ink-rul-v","ink-rul-c"].forEach(id=>{ const e=el(id); if(e)e.hidden=!on; });
 const st=el("ink-stage"), W=st.clientWidth, H=st.clientHeight, d=Math.min(window.devicePixelRatio||1,2);
 if(cv.width!==Math.round(W*d)||cv.height!==Math.round(H*d)){ cv.width=Math.round(W*d); cv.height=Math.round(H*d); cv.style.width=W+"px"; cv.style.height=H+"px"; }
 const x=cv.getContext("2d"); x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,W,H); if(!on||!W||!H)return;
 const r=st.getBoundingClientRect(), M=inkRulMap(), S=RUL_S, gd=inkGdList();
 // เส้นไกด์
 gd.forEach(g=>{ const p=g.o==="v"?M.x(g.v)-r.left:M.y(g.v)-r.top; x.save(); x.strokeStyle=g.dead?"#e5484d":GD_C; x.lineWidth=1; if(g.dead)x.setLineDash([5,4]); x.beginPath(); if(g.o==="v"){ x.moveTo(Math.round(p)+.5,S); x.lineTo(Math.round(p)+.5,H); } else{ x.moveTo(S,Math.round(p)+.5); x.lineTo(W,Math.round(p)+.5); } x.stroke(); x.restore(); });
 // แถบไม้บรรทัด
 x.fillStyle="rgba(247,248,250,.96)"; x.fillRect(0,0,W,S); x.fillRect(0,0,S,H); x.strokeStyle="rgba(90,105,130,.45)"; x.lineWidth=1; x.beginPath(); x.moveTo(S+.5,0); x.lineTo(S+.5,H); x.moveTo(0,S+.5); x.lineTo(W,S+.5); x.stroke();
 x.fillStyle="#e3e7ee"; x.fillRect(0,0,S,S);
 const stepOf=u=>{ for(const s of [10,20,50,100,200,500,1000,2000,5000,10000])if(s*u>=56)return s; return 20000; };
 x.font="9.5px system-ui,sans-serif"; x.fillStyle="#4b5566"; x.strokeStyle="#6b7686"; x.textBaseline="top";
 { const u=1/Math.abs(M.sx), big=stepOf(u), mn=big/5, v0=M.a[0]+r.left*M.sx, v1=v0+W*M.sx; x.beginPath();
  for(let v=Math.ceil(v0/mn)*mn;v<=v1;v+=mn){ const px=M.x(v)-r.left; if(px<S)continue; const mj=Math.abs(v/big-Math.round(v/big))<1e-6; if(!mj&&mn*u<5)continue; const p=Math.round(px)+.5; x.moveTo(p,S); x.lineTo(p,mj?S-12:S-6); }
  x.stroke(); for(let v=Math.ceil(v0/big)*big;v<=v1;v+=big){ const px=M.x(v)-r.left; if(px<S+2)continue; x.fillText(String(Math.round(v)),px+3,1); } }
 { const u=1/Math.abs(M.sy), big=stepOf(u), mn=big/5, v0=M.a[1]+r.top*M.sy, v1=v0+H*M.sy; x.beginPath();
  for(let v=Math.ceil(v0/mn)*mn;v<=v1;v+=mn){ const py=M.y(v)-r.top; if(py<S)continue; const mj=Math.abs(v/big-Math.round(v/big))<1e-6; if(!mj&&mn*u<5)continue; const p=Math.round(py)+.5; x.moveTo(S,p); x.lineTo(mj?S-12:S-6,p); }
  x.stroke(); for(let v=Math.ceil(v0/big)*big;v<=v1;v+=big){ const py=M.y(v)-r.top; if(py<S+2)continue; x.save(); x.translate(1,py-3); x.rotate(-Math.PI/2); x.fillText(String(Math.round(v)),0,0); x.restore(); } }
 // จุดจับ (สามเหลี่ยม) ของไกด์บนไม้บรรทัด
 gd.forEach(g=>{ x.fillStyle=g.dead?"#e5484d":GD_C; x.beginPath(); if(g.o==="v"){ const p=M.x(g.v)-r.left; if(p<S)return; x.moveTo(p-5,0); x.lineTo(p+5,0); x.lineTo(p,8); } else{ const p=M.y(g.v)-r.top; if(p<S)return; x.moveTo(0,p-5); x.lineTo(0,p+5); x.lineTo(8,p); } x.closePath(); x.fill(); });
 x.fillStyle="#4b5566"; x.font="12px system-ui,sans-serif"; x.textBaseline="middle"; x.textAlign="center"; x.fillText("📏",S/2,S/2+1);
}
function inkRulWire(){
 const st=el("ink-stage"); if(!st||st.__rul)return; st.__rul=1;
 [["ink-rul-h","h"],["ink-rul-v","v"]].forEach(([id,kind])=>{ const s=el(id); if(!s)return;
  s.addEventListener("pointerdown",e=>{ if(e.button>0)return; e.preventDefault(); e.stopPropagation(); const M=inkRulMap(), arr=inkGdList(), host=kind==="h"?"v":"h";
   let g=null,best=10; arr.forEach(q=>{ if(q.o!==host)return; const pos=host==="v"?M.x(q.v):M.y(q.v), d=Math.abs(pos-(host==="v"?e.clientX:e.clientY)); if(d<best){ best=d; g=q; } });
   const isNew=!g; if(isNew)g={o:kind==="h"?"h":"v",v:0};
   try{ s.setPointerCapture(e.pointerId); }catch(er){}
   const mv=ev=>{ const rr=st.getBoundingClientRect(), inside=(ev.clientY-rr.top<RUL_S)||(ev.clientX-rr.left<RUL_S), A=inkGdList();
    if(!inside){ if(isNew&&A.indexOf(g)<0)A.push(g); const pt=inkToPageRc(ev); g.v=Math.round((g.o==="v"?pt[0]:pt[1])*2)/2; g.dead=0; }
    else{ if(isNew){ const i=A.indexOf(g); if(i>=0)A.splice(i,1); } else g.dead=1; }
    inkRulDraw(); };
   const up=ev=>{ s.removeEventListener("pointermove",mv); s.removeEventListener("pointerup",up); s.removeEventListener("pointercancel",up); try{ s.releasePointerCapture(e.pointerId); }catch(er){}
    const A=inkGdList(); if(g.dead){ const i=A.indexOf(g); if(i>=0)A.splice(i,1); } delete g.dead; inkRulDraw(); inkGdChanged(); };
   s.addEventListener("pointermove",mv); s.addEventListener("pointerup",up); s.addEventListener("pointercancel",up); });
 });
 const c=el("ink-rul-c"); if(c)c.addEventListener("click",e=>{ e.stopPropagation(); inkRulMenu(c); });
}
const inkToPageRc=e=>{ ink.rc=null; return inkToPage(e); };
function inkRulMenu(a){
 const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-rul]")){ inkClosePop(); return; } const n=(ink.note&&inkPage())?inkGdList().length:0;
 inkPop(`<div class="ink-ph">ไม้บรรทัด / เส้นไกด์</div>
 <button type="button" class="ink-mi" data-rul="show">${ink.rul?"✓ แสดงไม้บรรทัด (แตะเพื่อซ่อน)":"แสดงไม้บรรทัด"}</button>
 <button type="button" class="ink-mi" data-rul="snap">${ink.gds?"✓ แม่เหล็กไกด์ เปิดอยู่":"แม่เหล็กไกด์ ปิดอยู่ (แตะเพื่อเปิด)"}</button>
 <button type="button" class="ink-mi" data-rul="clr"${n?"":" disabled"}>ลบไกด์ทั้งหมดในหน้านี้ (${n})</button>
 <div class="hint" style="margin:6px 10px 4px;font-size:12px;line-height:1.6;max-width:270px">ลากจากไม้บรรทัด <b>ด้านบน</b> = เส้นนอน · จาก <b>ด้านซ้าย</b> = เส้นตั้ง<br>จะย้ายเส้น: ลากจุดสามเหลี่ยมบนไม้บรรทัด · จะลบ: ลากกลับไปวางที่ไม้บรรทัด<br>เริ่มเขียนติดเส้น = ปากกาลากตรงตามเส้นให้</div>`,a);
}
(function(){ const pop=el("ink-pop"); if(pop)pop.addEventListener("click",e=>{ const b=e.target.closest("[data-rul]"); if(!b||b.disabled)return; e.stopPropagation(); const k=b.dataset.rul;
 if(k==="show"){ ink.rul=!ink.rul; try{ localStorage.setItem("sw-ink-rul",ink.rul?"1":"0"); }catch(er){} }
 else if(k==="snap"){ ink.gds=!ink.gds; try{ localStorage.setItem("sw-ink-gds",ink.gds?"1":"0"); }catch(er){} }
 else if(k==="clr"){ const pg=inkPage(); if(pg&&pg.gd&&pg.gd.length){ pg.gd=[]; inkGdChanged(); } }
 inkClosePop(); inkRulDraw(); if(k!=="clr")inkRulMenu(el("ink-rul-c").hidden?el("ink-stage"):el("ink-rul-c")); });
 inkRulWire(); })();
// ---------- แม่เหล็ก ----------
const inkGdOn=()=>!!(ink.rul&&ink.gds&&ink.note&&!ink.pres&&inkPage()&&inkPage().gd&&inkPage().gd.length);
function inkGdNear(x,y){ const th=8*inkPx(); let bx=null,by=null,dx=th,dy=th; inkPage().gd.forEach(g=>{ if(g.o==="v"){ const d=Math.abs(g.v-x); if(d<dx){ dx=d; bx=g.v; } } else{ const d=Math.abs(g.v-y); if(d<dy){ dy=d; by=g.v; } } }); return [bx,by]; }
function inkGdDown(e,pt){ ink.gdLk=null; if(!inkGdOn())return pt; const t=ink.tool; let [x,y]=pt;
 if(t==="pen"||t==="hl"||t==="tape"){ const [bx,by]=inkGdNear(x,y); if(bx!=null||by!=null){ ink.gdLk={x:bx,y:by}; if(bx!=null)x=bx; if(by!=null)y=by; } }
 else if(t==="shape"||t==="text"||t==="sticky"){ const [bx,by]=inkGdNear(x,y); if(bx!=null)x=bx; if(by!=null)y=by; }
 return [x,y]; }
function inkGdMove(pt,d){ if(!inkGdOn())return pt; let [x,y]=pt;
 if(d.mode==="draw"&&d.s){ if(d.s.t==="s"){ const [bx,by]=inkGdNear(x,y); if(bx!=null)x=bx; if(by!=null)y=by; }
  else if(ink.gdLk&&(d.s.t==="p"||d.s.t==="h"||(d.s.t==="t"&&d.s.m!=="line"))){ if(ink.gdLk.x!=null)x=ink.gdLk.x; if(ink.gdLk.y!=null)y=ink.gdLk.y; } }
 else if(d.mode==="move"&&ink.sel){ const b=ink.sel.box, th=8*inkPx(), dx=x-d.sx, dy=y-d.sy; let ax=null,ay=null,bx=th,by=th;
  inkPage().gd.forEach(g=>{ if(g.o==="v"){ [b[0]+dx,(b[0]+b[2])/2+dx,b[2]+dx].forEach(c=>{ const k=g.v-c; if(Math.abs(k)<bx){ bx=Math.abs(k); ax=k; } }); } else{ [b[1]+dy,(b[1]+b[3])/2+dy,b[3]+dy].forEach(c=>{ const k=g.v-c; if(Math.abs(k)<by){ by=Math.abs(k); ay=k; } }); } });
  if(ax!=null)x+=ax; if(ay!=null)y+=ay; }
 return [x,y]; }
// ---------- เชื่อมกับระบบเดิม ----------
(function(){ const a=inkApply; inkApply=function(){ const r=a.apply(this,arguments); inkRulDraw(); return r; };
 const b=inkRedraw; inkRedraw=function(){ const r=b.apply(this,arguments); inkRulDraw(); return r; }; })();
