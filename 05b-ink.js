// ===== สมุดเขียนมือ (แบบ GoodNotes) — วาด/เขียนด้วย Apple Pencil, หลายหน้า, ส่งออก PDF =====
// เก็บ: โน้ต (kind "note", kind:INKKIND) = ข้อมูลสมุด (ชื่อ, ลำดับหน้า pageIds, กระดาษ, รูปย่อ)
//       ลายเส้นแต่ละหน้า = แถวแยก kind "ink" id "ink-<pageId>" (โหลดเฉพาะตอนเปิดสมุด ไม่โหลดตอนเปิดแอป)
const INKKIND="สมุดเขียนมือ";
const INK_W=1000, INK_H=1414;                      // หน้ากระดาษ A4 (หน่วยเสมือน)
const INK_PEN=["#1d1d1f","#2563eb","#dc2626","#16a34a","#ea7a1a","#7c3aed","#db2777","#6b7280"];
const INK_HL=["#ffe14d","#7ee08f","#ff9ec7","#8ec9ff","#ffb36b","#c9a7ff"];
const INK_SIZES={pen:[2,3.5,5.5,9],hl:[12,18,26,36],eraser:[10,18,30,48]};
const INK_PAPER=[["#ffffff","ขาว"],["#fbf6e9","ครีม"],["#eef5ff","ฟ้าอ่อน"],["#f1f1ee","เทาอ่อน"]];
const INK_TPL=[["blank","ว่าง"],["lines","เส้นบรรทัด"],["grid","ตาราง"],["dots","จุด"]];
const ink={open:false,note:null,pages:[],cur:0,tool:"pen",color:{pen:INK_PEN[0],hl:INK_HL[0]},sizeIx:{pen:1,hl:1,eraser:1},
board:false,vx:-60,vy:-60,fingerMode:"auto",penSeen:false,penDown:false,penUpAt:0,z:1,tx:0,ty:0,fit:1,k:1,undo:[],redo:[],sel:null,
ptrs:new Map(),drag:null,saveT:null,saving:false,saveErr:false,zoomBak:null,pdf:null};
const inkUid=()=>"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const inkPage=()=>ink.pages[ink.cur];
const inkO=()=>ink.board?[-ink.vx,-ink.vy]:[0,0];                 // ชดเชยตำแหน่งมุมมอง (กระดานกว้าง)
const inkBBs=new WeakMap();
function inkBB(s){ let b=inkBBs.get(s); if(b&&b.n!==s.p.length)b=null; if(!b){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; const p=(s.t==="s"&&s.r)?inkShapeFlat(s):s.p,pad=(s.t==="s"?Math.max(s.w,16):(s.b&&s.b!=="pen"?s.w*1.6:s.w/2))+1; for(let j=0;j<p.length;j+=3){ if(p[j]<x0)x0=p[j]; if(p[j]>x1)x1=p[j]; if(p[j+1]<y0)y0=p[j+1]; if(p[j+1]>y1)y1=p[j+1]; } b=[x0-pad,y0-pad,x1+pad,y1+pad]; b.n=s.p.length; inkBBs.set(s,b);} return b; }
function inkAllBox(){ let b=null; ink.pages.forEach(pg=>pg.strokes.forEach(s=>{ const q=inkBB(s); b=b?[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[2]),Math.max(b[3],q[3])]:q.slice(); })); return b; }
const inkLive=()=>(ink.note&&(notes.find(n=>n._id===ink.note._id)||ink.note))||{};

// ---------- วาดกระดาษ + ลายเส้น ----------
function inkPaper(ctx,k,paper,tpl){
ctx.fillStyle=paper||"#ffffff"; ctx.fillRect(0,0,INK_W*k,INK_H*k);
ctx.save(); ctx.lineWidth=Math.max(1,k*1.1);
if(tpl==="lines"){ ctx.strokeStyle="rgba(90,110,150,.30)"; ctx.beginPath(); for(let y=130;y<INK_H-40;y+=38){ctx.moveTo(40*k,y*k);ctx.lineTo((INK_W-40)*k,y*k);} ctx.stroke();
ctx.strokeStyle="rgba(220,80,80,.30)"; ctx.beginPath(); ctx.moveTo(110*k,60*k); ctx.lineTo(110*k,(INK_H-40)*k); ctx.stroke(); }
else if(tpl==="grid"){ ctx.strokeStyle="rgba(90,110,150,.24)"; ctx.beginPath(); for(let y=34;y<INK_H;y+=34){ctx.moveTo(0,y*k);ctx.lineTo(INK_W*k,y*k);} for(let x=34;x<INK_W;x+=34){ctx.moveTo(x*k,0);ctx.lineTo(x*k,INK_H*k);} ctx.stroke(); }
else if(tpl==="dots"){ ctx.fillStyle="rgba(90,110,150,.42)"; for(let y=34;y<INK_H;y+=34)for(let x=34;x<INK_W;x+=34){ctx.beginPath();ctx.arc(x*k,y*k,Math.max(1,1.5*k),0,6.283);ctx.fill();} }
ctx.restore();
}
function inkStroke0(ctx,s,k,dx,dy){
const p=s.p, n=Math.floor(p.length/3); if(!n)return;
dx=dx||0; dy=dy||0;
ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round"; ctx.strokeStyle=s.c; ctx.fillStyle=s.c;
if(s.t==="h"){ ctx.globalAlpha=.4; ctx.lineCap="butt"; }
const X=i=>(p[i*3]+dx)*k, Y=i=>(p[i*3+1]+dy)*k;
if(n===1){ ctx.beginPath(); ctx.arc(X(0),Y(0),Math.max(.8,s.w*k/2),0,6.283); ctx.fill(); }
else if(s.v&&s.t!=="h"){
// รวมช่วงที่ความหนาใกล้เคียงกันเป็นเส้นเดียว (วาดเร็วขึ้นหลายเท่า หน้าตาเหมือนเดิม)
const qs=Math.max(.2,s.w*k*.1); let run=-1, qw=0, lx=X(0), ly=Y(0);
for(let i=1;i<n;i++){ if(i<n-1&&Math.abs(X(i)-lx)+Math.abs(Y(i)-ly)<1.6)continue; const pr=(p[i*3+2]+p[(i-1)*3+2])/2, lw=Math.max(1,s.w*inkPF(pr)*k), q=Math.round(lw/qs)*qs;
if(run<0){ ctx.lineWidth=q; ctx.beginPath(); ctx.moveTo(lx,ly); qw=q; run=i; }
else if(q!==qw){ ctx.stroke(); ctx.lineWidth=q; ctx.beginPath(); ctx.moveTo(lx,ly); qw=q; }
ctx.lineTo(X(i),Y(i)); lx=X(i); ly=Y(i); }
if(run>=0)ctx.stroke();
}else{
ctx.lineWidth=Math.max(.6,s.w*k); ctx.beginPath(); ctx.moveTo(X(0),Y(0));
if(n===2)ctx.lineTo(X(1),Y(1));
else{ for(let i=1;i<n-1;i++){ ctx.quadraticCurveTo(X(i),Y(i),(X(i)+X(i+1))/2,(Y(i)+Y(i+1))/2); } ctx.lineTo(X(n-1),Y(n-1)); }
ctx.stroke(); }
ctx.restore();
}
// พื้นหลังกระดานกว้าง: ลายจุด/ตาราง/เส้น ไม่มีขอบเขต
function inkBoardBg(ctx,k,paper,tpl,ox,oy,w,h){
ctx.fillStyle=paper||"#ffffff"; ctx.fillRect(0,0,w*k,h*k);
const g=40, S=g*k; if(S<7||!tpl||tpl==="blank")return;
ctx.save(); const x0=Math.floor(-ox/g)*g, y0=Math.floor(-oy/g)*g;
if(tpl==="dots"){ ctx.fillStyle="rgba(90,110,150,.45)"; for(let y=y0;y<-oy+h+g;y+=g)for(let x=x0;x<-ox+w+g;x+=g){ctx.beginPath();ctx.arc((x+ox)*k,(y+oy)*k,Math.max(1,1.6*k),0,6.283);ctx.fill();} }
else{ ctx.strokeStyle="rgba(90,110,150,.25)"; ctx.lineWidth=Math.max(1,k); ctx.beginPath();
for(let y=y0;y<-oy+h+g;y+=g){ctx.moveTo(0,(y+oy)*k);ctx.lineTo(w*k,(y+oy)*k);}
if(tpl==="grid")for(let x=x0;x<-ox+w+g;x+=g){ctx.moveTo((x+ox)*k,0);ctx.lineTo((x+ox)*k,h*k);}
ctx.stroke(); }
ctx.restore();
}
// o = {tpl:เทมเพลทของหน้า} (สมุด) หรือ {board:true,ox,oy,w,h} (กระดานกว้าง)
function inkRenderTo(ctx,k,strokes,skip,o){
o=o||{}; const nt=inkLive();
if(o.board){ inkBoardBg(ctx,k,nt.paper,nt.tpl,o.ox,o.oy,o.w,o.h); }
else if(o.tpl&&typeof inkTplDraw==="function"){ ctx.fillStyle=nt.paper||"#ffffff"; ctx.fillRect(0,0,INK_W*k,INK_H*k); inkTplDraw(ctx,k,o.tpl); }
else inkPaper(ctx,k,nt.paper,nt.tpl);
const ox=o.board?o.ox:0, oy=o.board?o.oy:0;
strokes.forEach((s,i)=>{ if(skip&&skip.has(i))return;
if(o.board){ const b=inkBB(s); if(b[2]<-ox||b[0]>-ox+o.w||b[3]<-oy||b[1]>-oy+o.h)return; }
inkStroke(ctx,s,k,ox,oy); });
}
function inkOpt(){ if(ink.board){ const c=el("ink-base"); return {board:true,ox:-ink.vx,oy:-ink.vy,w:c.width/ink.k,h:c.height/ink.k}; } const pg=inkPage(); return {tpl:pg&&pg.tpl}; }
function inkRedraw(){
const pg=inkPage(); if(!pg)return;
const c=el("ink-base"), ctx=c.getContext("2d");
inkRenderTo(ctx,ink.k,pg.strokes,ink.drag&&ink.drag.hide,inkOpt());
}
let inkRaf=0;
function inkRedrawSoon(){ if(inkRaf)return; inkRaf=requestAnimationFrame(()=>{ inkRaf=0; if(!ink.note)return; inkRedraw(); inkDrawSel(); }); }
// ความกว้างเส้นตามแรงกด: มีพื้นขั้นต่ำ ให้ช่วงแตะลงที่แรงกดยังเบาไม่บางจนมองไม่เห็น
function inkPF(pr){ return .62+.7*Math.pow(Math.max(0,Math.min(1,pr)),.6); }
function inkOverClear(){ const c=el("ink-over"); c.getContext("2d").clearRect(0,0,c.width,c.height); inkPredClear(true); }
function inkPredClear(all){ const c=el("ink-pred"); if(!c)return; const r=ink.predR; if(!r&&!all)return; const x=c.getContext("2d"); if(all||!r)x.clearRect(0,0,c.width,c.height); else x.clearRect(r[0],r[1],r[2]-r[0],r[3]-r[1]); ink.predR=null; }
// วาดปลายเส้นล่วงหน้าเล็กน้อย ให้ปลายปากกาตามทันปลาย Pencil (ลบทิ้งทุกครั้งที่มีจุดจริงมาใหม่)
const INK_LEADS=[[0,"ปิด"],[16,"น้อย"],[30,"ปกติ"],[48,"มาก"]];
ink.lead=(()=>{ try{ const v=localStorage.getItem("sw-ink-lead"); return v==null?0:+v; }catch(e){ return 0; } })();
function inkPredict(e,pen){
const d=ink.drag; if(!d||d.mode!=="draw"||!d.inc||!ink.lead)return; const c=el("ink-pred"); if(!c)return;
inkPredClear(); clearTimeout(ink.predT); ink.predT=setTimeout(()=>inkPredClear(),70); const sk=d.s, p=sk.p, n=Math.floor(p.length/3); if(n<2)return;
let pts=[], span=0; if(e&&e.getPredictedEvents){ try{ const pe=e.getPredictedEvents().slice(0,4); pts=pe.map(inkToPage); if(pe.length)span=Math.max(0,pe[pe.length-1].timeStamp-e.timeStamp); }catch(er){ pts=[]; } }
const bx=p[n*3-3], by=p[n*3-2], h=d.hist||[];
if(h.length>=2){ const a=h[Math.max(0,h.length-4)], z=h[h.length-1], dt=z[2]-a[2];
if(dt>1){ const rest=Math.max(0,ink.lead-span); let vx=(z[0]-a[0])/dt, vy=(z[1]-a[1])/dt; const sp=Math.hypot(vx,vy), mx=40*inkPx();
let len=sp*rest*.8; if(len>mx)len=mx; if(sp>0&&len>.3){ const sx=pts.length?pts[pts.length-1][0]:bx, sy=pts.length?pts[pts.length-1][1]:by; pts.push([sx+vx/sp*len,sy+vy/sp*len]); } } }
if(!pts.length)return;
const ctx=c.getContext("2d"), [ox,oy]=inkO(), k=ink.k, pr=p[n*3-1], lw=Math.max(1,sk.w*(pen?inkPF(pr):1)*k);
ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round"; ctx.strokeStyle=sk.c; ctx.lineWidth=lw; ctx.beginPath(); ctx.moveTo((bx+ox)*k,(by+oy)*k);
let x0=(bx+ox)*k,y0=(by+oy)*k,x1=x0,y1=y0; pts.forEach(q=>{ const X=(q[0]+ox)*k, Y=(q[1]+oy)*k; ctx.lineTo(X,Y); x0=Math.min(x0,X); x1=Math.max(x1,X); y0=Math.min(y0,Y); y1=Math.max(y1,Y); }); ctx.stroke(); ctx.restore();
const g=lw+3; ink.predR=[Math.max(0,Math.floor(x0-g)),Math.max(0,Math.floor(y0-g)),Math.min(c.width,Math.ceil(x1+g)),Math.min(c.height,Math.ceil(y1+g))];
}

// ---------- ตำแหน่ง/ซูม ----------
function inkApply(){
ink.rc=null; if(!ink.ctxd){ ink.ctxd=1; try{ el("ink-over").getContext("2d",{desynchronized:true}); }catch(e){} }
const st=el("ink-stage"), sw=st.clientWidth, sh=st.clientHeight; if(!sw||!sh)return;
if(ink.board){ const pgb=el("ink-pg"); pgb.style.cssText=`left:0;top:0;width:${sw}px;height:${sh}px;--sh:none`;
const c=el("ink-base"), dpr=Math.min(window.devicePixelRatio||1,2), bw=Math.round(sw*dpr), bh=Math.round(sh*dpr);
if(c.width!==bw||c.height!==bh){ ["ink-base","ink-over","ink-pred"].forEach(id=>{ el(id).width=bw; el(id).height=bh; }); }
ink.k=dpr*ink.z; inkRedrawSoon(); inkZoomLabel(); return; }
ink.fit=Math.min((sw-16)/INK_W,(sh-16)/INK_H);
const s=ink.fit*ink.z, w=INK_W*s, h=INK_H*s;
ink.tx=w<=sw?(sw-w)/2:Math.min(40,Math.max(sw-w-40,ink.tx));
ink.ty=h<=sh?(sh-h)/2:Math.min(40,Math.max(sh-h-40,ink.ty));
const pg=el("ink-pg"); pg.style.cssText=`left:${ink.tx}px;top:${ink.ty}px;width:${w}px;height:${h}px`;
clearTimeout(ink.rsT); ink.rsT=setTimeout(inkResize,ink.fast?60:140);
}
function inkResize(){
if(ink.board){ inkApply(); return; }
const pgw=el("ink-pg").clientWidth, pgh=el("ink-pg").clientHeight; if(!pgw)return;
let dpr=Math.min(window.devicePixelRatio||1,2), bw=Math.round(pgw*dpr), bh=Math.round(pgh*dpr);
const cap=8e6; if(bw*bh>cap){ const f=Math.sqrt(cap/(bw*bh)); bw=Math.round(bw*f); bh=Math.round(bh*f); }
["ink-base","ink-over","ink-pred"].forEach(id=>{ const c=el(id); if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;} });
ink.k=bw/INK_W; inkRedraw(); inkDrawSel();
}
function inkZoomAt(f,cx,cy){
const st=el("ink-stage").getBoundingClientRect(), px=cx-st.left, py=cy-st.top;
if(ink.board){ const nz=Math.max(.05,Math.min(8,ink.z*f)); if(nz===ink.z)return; const wx=ink.vx+px/ink.z, wy=ink.vy+py/ink.z; ink.z=nz; ink.vx=wx-px/nz; ink.vy=wy-py/nz; inkApply(); return; }
const nz=Math.max(.5,Math.min(6,ink.z*f)); f=nz/ink.z; if(f===1)return;
ink.tx=px-(px-ink.tx)*f; ink.ty=py-(py-ink.ty)*f; ink.z=nz; inkApply();
}
function inkPanBy(dx,dy){ if(ink.board){ ink.vx-=dx/ink.z; ink.vy-=dy/ink.z; } else{ ink.tx+=dx; ink.ty+=dy; } inkApply(); }
function inkZoomLabel(){ const l=el("ink-zl"); if(l)l.textContent=Math.round(ink.z*100)+"%"; }
const inkToPage=e=>{ const r=ink.rc||(ink.rc=el("ink-pg").getBoundingClientRect());
if(ink.board)return [ink.vx+(e.clientX-r.left)/ink.z,ink.vy+(e.clientY-r.top)/ink.z];
return [(e.clientX-r.left)/r.width*INK_W,(e.clientY-r.top)/r.height*INK_H]; };

// ---------- ประวัติ ย้อนกลับ / ทำซ้ำ ----------
function inkCommit(next,keepSel){
const pg=inkPage(); ink.undo.push({p:ink.cur,s:pg.strokes}); if(ink.undo.length>80)ink.undo.shift(); ink.redo=[];
pg.strokes=next; pg.dirty=true; if(!keepSel)ink.sel=null; inkRedraw(); inkOverClear(); inkDrawSel(); inkToolbar(); inkDirty();
}
function inkCommitAppend(s,fast){
const pg=inkPage(); ink.undo.push({p:ink.cur,s:pg.strokes}); if(ink.undo.length>80)ink.undo.shift(); ink.redo=[];
pg.strokes=[...pg.strokes,s]; pg.dirty=true; ink.sel=null;
const c=el("ink-base"), [ox,oy]=inkO(); if(fast)c.getContext("2d").drawImage(el("ink-over"),0,0); else inkStroke(c.getContext("2d"),s,ink.k,ox,oy);
inkOverClear(); inkUndoState(); inkDirty();
}
function inkUndoState(){ el("ink-undo").disabled=!ink.undo.length; el("ink-redo").disabled=!ink.redo.length; el("ink-seldel").hidden=!ink.sel; el("ink-selshape").hidden=!ink.sel; }
function inkUndo(redo){
const from=redo?ink.redo:ink.undo, to=redo?ink.undo:ink.redo; const h=from.pop(); if(!h)return;
if(h.p>=ink.pages.length)return;
const pg=ink.pages[h.p]; to.push({p:h.p,s:pg.strokes}); pg.strokes=h.s; pg.dirty=true; ink.sel=null;
if(h.p!==ink.cur)inkGo(h.p); else{ inkRedraw(); inkOverClear(); } inkToolbar(); inkDirty();
}

// ---------- ปากกา / ยางลบ / บ่วงเลือก ----------
const inkSizeKey=()=>ink.tool==="hl"?"hl":ink.tool==="eraser"?"eraser":ink.tool==="shape"?"shape":"pen";
const inkSize=()=>ink.size[inkSizeKey()];
const inkPx=()=>ink.board?1/ink.z:1/(ink.fit*ink.z);          // หน่วยหน้ากระดาษต่อ 1 พิกเซลหน้าจอ
const inkFinger=()=>ink.fingerMode==="on"||(ink.fingerMode==="auto"&&!ink.penSeen);
function inkSegDist(px,py,ax,ay,bx,by){ const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy; let t=l?((px-ax)*dx+(py-ay)*dy)/l:0; t=Math.max(0,Math.min(1,t)); const x=ax+t*dx-px,y=ay+t*dy-py; return Math.sqrt(x*x+y*y); }
function inkHit(s,x,y,r){ if(s.t==="s")return inkShapeHit(s,x,y,r); const p=s.p, n=Math.floor(p.length/3), rr=r+s.w/2;
if(n===1)return Math.hypot(p[0]-x,p[1]-y)<=rr;
for(let i=1;i<n;i++)if(inkSegDist(x,y,p[(i-1)*3],p[(i-1)*3+1],p[i*3],p[i*3+1])<=rr)return true; return false; }
function inkInPoly(poly,x,y){ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c; } return c; }
function inkBBox(strokes,idxs){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; idxs.forEach(i=>{const s=strokes[i],p=(s.t==="s"&&s.r)?inkShapeFlat(s):s.p,pad=s.w/2; for(let j=0;j<p.length;j+=3){ x0=Math.min(x0,p[j]-pad);x1=Math.max(x1,p[j]+pad);y0=Math.min(y0,p[j+1]-pad);y1=Math.max(y1,p[j+1]+pad);} }); return [x0,y0,x1,y1]; }
function inkScaled(s,ax,ay,f){ return {...s,p:s.p.map((v,j)=>j%3===0?ax+(v-ax)*f:j%3===1?ay+(v-ay)*f:v)}; }
function inkDrawSel(){
const c=el("ink-over"); if(!c||!ink.sel){ return; }
const ctx=c.getContext("2d"), k=ink.k, d=ink.drag, [ox,oy]=inkO(), pg=inkPage(); let b=ink.sel.box, dx=0, dy=0, f=1;
if(d&&d.mode==="move"){ dx=d.dx; dy=d.dy; } else if(d&&d.mode==="scale"){ f=d.f; }
const bcx=(b[0]+b[2])/2, bcy=(b[1]+b[3])/2;
if(d&&d.mode==="rot"&&d.th)ink.sel.idx.forEach(i=>inkStroke(ctx,inkRotated(pg.strokes[i],bcx,bcy,d.th),k,ox,oy));
ctx.clearRect(0,0,c.width,c.height);
if(dx||dy)ink.sel.idx.forEach(i=>inkStroke(ctx,pg.strokes[i],k,dx+ox,dy+oy));
if(f!==1){ ink.sel.idx.forEach(i=>inkStroke(ctx,inkScaled(pg.strokes[i],b[0],b[1],f),k,ox,oy)); b=[b[0],b[1],b[0]+(b[2]-b[0])*f,b[1]+(b[3]-b[1])*f]; }
ctx.save(); ctx.setLineDash([8*k,6*k]); ctx.strokeStyle="#2563eb"; ctx.lineWidth=Math.max(1.5,1.6*k);
const pad=6; ctx.strokeRect((b[0]+dx+ox-pad)*k,(b[1]+dy+oy-pad)*k,(b[2]-b[0]+pad*2)*k,(b[3]-b[1]+pad*2)*k);
ctx.setLineDash([]); ctx.fillStyle="#fff"; ctx.lineWidth=Math.max(2,2*k); const hx=(b[2]+dx+ox+pad)*k, hy=(b[3]+dy+oy+pad)*k, hr=Math.max(6*k,8*inkPx()*k);
ctx.beginPath(); ctx.arc(hx,hy,hr,0,6.283); ctx.fill(); ctx.stroke();
const rx=(bcx+dx+ox)*k, ry=(b[1]+dy+oy-pad-34*inkPx())*k; ctx.beginPath(); ctx.moveTo(rx,(b[1]+dy+oy-pad)*k); ctx.lineTo(rx,ry); ctx.stroke(); ctx.beginPath(); ctx.arc(rx,ry,hr,0,6.283); ctx.fillStyle="#2563eb"; ctx.fill(); ctx.strokeStyle="#fff"; ctx.stroke();
ctx.beginPath(); ctx.arc(rx,ry,hr*.5,.4,5.4); ctx.strokeStyle="#fff"; ctx.lineWidth=Math.max(1.5,1.6*k); ctx.stroke(); ctx.restore();
}
function inkDown(e){
ink.rc=null; const t=e.pointerType; try{ const gs=getSelection(); if(gs&&gs.rangeCount&&!gs.isCollapsed)gs.removeAllRanges(); }catch(er){} { const a=document.activeElement; if(a&&a!==document.body&&a.blur&&a.id!=="ink-stage")a.blur(); }
if((t==="pen"||t==="mouse")&&ink.drag&&ink.drag.mode==="draw"){ if(inkDiag.on)inkDiag.overlap++; inkUp({pointerId:ink.drag.id,pointerType:t,type:"pointerup",timeStamp:0}); }
if(t==="pen"){ ink.penSeen=true; ink.penDown=true; ink.ptrs.forEach((v,id)=>{ if(v.type==="touch")ink.ptrs.delete(id); }); if(ink.drag&&ink.drag.mode==="pan"||ink.drag&&ink.drag.mode==="pinch")ink.drag=null; }
if(t==="touch"&&(ink.penDown||Date.now()-ink.penUpAt<280))return;      // กันฝ่ามือ
if(t==="mouse"&&e.button!==0&&e.button!==1)return;
try{ el("ink-stage").setPointerCapture(e.pointerId); }catch(er){}
ink.ptrs.set(e.pointerId,{type:t,x:e.clientX,y:e.clientY});
const touchCount=[...ink.ptrs.values()].filter(v=>v.type==="touch").length;
if(touchCount>=2){ ink.drag={mode:"pinch"}; inkOverClear(); inkDrawSel(); ink.pinch=null; return; }       // สองนิ้ว = ซูม/เลื่อน
const canDraw=ink.tool!=="hand"&&e.button!==1&&(t==="pen"||t==="mouse"||(t==="touch"&&inkFinger()));
if(!canDraw){ ink.drag={mode:"pan",id:e.pointerId,x:e.clientX,y:e.clientY,tx:ink.tx,ty:ink.ty,vx:ink.vx,vy:ink.vy}; return; }
inkClosePop();
const [x,y]=inkToPage(e), pr=t==="pen"?(e.pressure||.5):.5;
if(ink.tool==="eraser"){ ink.drag={mode:"erase",id:e.pointerId,del:new Set(),x,y}; inkEraseAt(x,y); return; }
if(ink.tool==="lasso"){
if(ink.sel){ const b=ink.sel.box,pad=8; if(Math.hypot(x-(b[0]+b[2])/2,y-(b[1]-6-34*inkPx()))<=20*inkPx()){ ink.drag={mode:"rot",id:e.pointerId,th:0,cx:(b[0]+b[2])/2,cy:(b[1]+b[3])/2,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return; }
if(Math.hypot(x-(b[2]+6),y-(b[3]+6))<=20*inkPx()){ ink.drag={mode:"scale",id:e.pointerId,x0:b[0],y0:b[1],f:1,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return; } if(x>=b[0]-pad&&x<=b[2]+pad&&y>=b[1]-pad&&y<=b[3]+pad){ ink.drag={mode:"move",id:e.pointerId,sx:x,sy:y,dx:0,dy:0,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return; } ink.sel=null; inkToolbar(); }
ink.drag={mode:"lasso",id:e.pointerId,poly:[[x,y]]}; inkOverClear(); return; }
if(ink.tool==="shape"){ const s={t:"s",sh:ink.shape,c:ink.color.pen,w:ink.size.shape,p:[+x.toFixed(1),+y.toFixed(1),0,+x.toFixed(1),+y.toFixed(1),0]}; if(ink.alpha<1)s.a=ink.alpha; if(ink.fill)s.f=ink.fill; if(ink.dash)s.d=1; ink.drag={mode:"draw",id:e.pointerId,s,pmin:0,pmax:0,t0:e.timeStamp}; inkLiveStroke(); return; }
const ns={t:ink.tool==="hl"?"h":"p",c:ink.color[ink.tool==="hl"?"hl":"pen"],w:inkSize(),v:0,p:[+x.toFixed(1),+y.toFixed(1),+pr.toFixed(2)]};
if(ink.tool==="pen"){ if(ink.brush!=="pen")ns.b=ink.brush; if(ink.alpha<1)ns.a=ink.alpha; }
ink.drag={mode:"draw",id:e.pointerId,t0:e.timeStamp,s:ns,pmin:pr,pmax:pr,ptype:t,inc:ink.tool==="pen"&&!ns.b&&!ns.a};
inkLiveStroke();
}
function inkMove(e){
const v=ink.ptrs.get(e.pointerId); const d=ink.drag;
if(v){ v.x=e.clientX; v.y=e.clientY; }
if(!d)return;
if(d.mode==="pinch"){
const ts=[...ink.ptrs.values()].filter(q=>q.type==="touch"); if(ts.length<2)return;
const dist=Math.hypot(ts[0].x-ts[1].x,ts[0].y-ts[1].y), cx=(ts[0].x+ts[1].x)/2, cy=(ts[0].y+ts[1].y)/2;
if(ink.pinch){ ink.fast=1; if(ink.board){ ink.vx-=(cx-ink.pinch.cx)/ink.z; ink.vy-=(cy-ink.pinch.cy)/ink.z; } else{ ink.tx+=cx-ink.pinch.cx; ink.ty+=cy-ink.pinch.cy; } inkZoomAt(dist/ink.pinch.dist,cx,cy); ink.fast=0; }
ink.pinch={dist,cx,cy}; return; }
if(e.pointerId!==d.id)return;
if(d.mode==="pan"){ if(ink.board){ ink.vx=d.vx-(e.clientX-d.x)/ink.z; ink.vy=d.vy-(e.clientY-d.y)/ink.z; } else{ ink.tx=d.tx+(e.clientX-d.x); ink.ty=d.ty+(e.clientY-d.y); } inkApply(); return; }
const evs=(e.getCoalescedEvents&&e.getCoalescedEvents())||[]; const list=evs.length?evs:[e];
for(const ev of list){
const [x,y]=inkToPage(ev);
if(d.mode==="draw"&&d.snap){ if(d.s.sh==="line"){ d.s.p[3]=+x.toFixed(1); d.s.p[4]=+y.toFixed(1); inkShapeConstrain(d.s,1); } continue; }
if(d.mode==="draw"&&d.s.t==="s"){ d.s.p[3]=+x.toFixed(1); d.s.p[4]=+y.toFixed(1); inkShapeConstrain(d.s); continue; }
if(d.mode==="draw"){ const p=d.s.p, lx=p[p.length-3], ly=p[p.length-2]; if(Math.hypot(x-lx,y-ly)<0.7)continue;
const pr=e.pointerType==="pen"?(ev.pressure||e.pressure||.5):.5; (d.hist||(d.hist=[])).push([x,y,ev.timeStamp]); if(d.hist.length>6)d.hist.shift(); p.push(+x.toFixed(1),+y.toFixed(1),+pr.toFixed(2)); d.pmin=Math.min(d.pmin,pr); d.pmax=Math.max(d.pmax,pr); }
else if(d.mode==="erase"){ inkEraseAt(x,y); }
else if(d.mode==="lasso"){ d.poly.push([x,y]); }
else if(d.mode==="move"){ d.dx=x-d.sx; d.dy=y-d.sy; }
else if(d.mode==="rot"){ let th=Math.atan2(x-d.cx,d.cy-y); const g=Math.round(th/(Math.PI/12))*(Math.PI/12); if(Math.abs(th-g)<.06)th=g; d.th=th; }
else if(d.mode==="scale"){ const b=ink.sel.box, bw=b[2]-b[0], bh=b[3]-b[1], dd=bw*bw+bh*bh||1; d.f=Math.max(.05,Math.min(20,((x-d.x0)*bw+(y-d.y0)*bh)/dd)); }
}
if(d.mode==="draw"){ inkLiveStroke(); inkPredict(e,d.ptype==="pen"); inkHoldArm(e); }
else if(d.mode==="lasso")inkLiveLasso();
else if(d.mode==="move"||d.mode==="scale"||d.mode==="rot")inkDrawSel();
}
function inkUp(e){
const t=ink.ptrs.get(e.pointerId); ink.ptrs.delete(e.pointerId);
if(e.pointerType==="pen"){ ink.penDown=false; ink.penUpAt=Date.now(); }
const d=ink.drag; if(!d)return; clearTimeout(d.holdT);
if(d.mode==="pinch"){ if([...ink.ptrs.values()].filter(q=>q.type==="touch").length<2){ ink.drag=null; ink.pinch=null; } return; }
if(e.pointerId!==d.id)return;
if(e.timeStamp&&d.t0&&e.timeStamp<d.t0-2)return;                // pointerup เก่าของเส้นก่อนหน้า มาช้ากว่า pointerdown ของเส้นใหม่
ink.drag=null;
if(e.type==="pointercancel"&&!(d.mode==="draw"&&d.s.p.length>=6)){ inkOverClear(); inkRedraw(); inkDrawSel(); return; }   // เส้นที่วาดไปแล้ว ถูกยกเลิกกลางคัน → เก็บไว้ ไม่ทิ้ง
if(d.mode==="draw"&&d.s.t==="s"){ inkShapeFinish(d.s); inkCommitAppend(d.s); }
else if(d.mode==="rot"){ if(Math.abs(d.th)>.01){ const idx=ink.sel.idx, pg=inkPage(); const next=pg.strokes.map((s,i)=>idx.has(i)?inkRotated(s,d.cx,d.cy,d.th):s); ink.sel={idx,box:inkBBox(next,idx)}; inkCommit(next,true); } else{ inkRedraw(); inkDrawSel(); } }
else if(d.mode==="scale"){ if(Math.abs(d.f-1)>.01){ const idx=ink.sel.idx, pg=inkPage(), b=ink.sel.box; const next=pg.strokes.map((s,i)=>idx.has(i)?inkScaled(s,b[0],b[1],d.f):s); ink.sel={idx,box:[b[0],b[1],b[0]+(b[2]-b[0])*d.f,b[1]+(b[3]-b[1])*d.f]}; inkCommit(next,true); } else{ inkRedraw(); inkDrawSel(); } }
else if(d.mode==="draw"){ const s=d.s; s.v=(d.pmax-d.pmin>0.12&&e.pointerType==="pen")?1:0; inkCommitAppend(s,!!(d.inc&&!d.snap&&!ink.sel&&d.li>=Math.floor(s.p.length/3))); }
else if(d.mode==="erase"){ if(d.del.size){ inkCommit(inkPage().strokes.filter((_,i)=>!d.del.has(i))); } else{ inkOverClear(); inkRedraw(); } }
else if(d.mode==="lasso"){ inkLassoDone(d.poly); }
else if(d.mode==="move"){ if(Math.abs(d.dx)+Math.abs(d.dy)>1){ const idx=ink.sel.idx, pg=inkPage();
const next=pg.strokes.map((s,i)=>idx.has(i)?{...s,p:s.p.map((v,j)=>+(v+(j%3===0?d.dx:j%3===1?d.dy:0)).toFixed(1))}:s);
const b=ink.sel.box; ink.sel={idx,box:[b[0]+d.dx,b[1]+d.dy,b[2]+d.dx,b[3]+d.dy]}; inkCommit(next,true); } else{ inkRedraw(); inkDrawSel(); } }
}
function inkLiveStroke(){
const d=ink.drag, c=el("ink-over"), ctx=c.getContext("2d"), [ox,oy]=inkO(), k=ink.k, sk=d.s, p=sk.p, n=Math.floor(p.length/3);
if(d.inc&&sk.t==="p"){
// ปากกาธรรมดา: ต่อเส้นเฉพาะช่วงใหม่ (ไม่ล้าง/วาดซ้ำทั้งเส้น)
const pen=d.ptype==="pen"; ctx.save(); ctx.lineCap="round"; ctx.strokeStyle=sk.c; ctx.fillStyle=sk.c;
if(!d.li){ ctx.beginPath(); ctx.arc((p[0]+ox)*k,(p[1]+oy)*k,Math.max(.3,sk.w*(pen?inkPF(p[2]):1)*k/2),0,6.283); ctx.fill(); }
for(let i=Math.max(1,d.li||1);i<n;i++){ const pr=(p[i*3+2]+p[i*3-1])/2; ctx.lineWidth=Math.max(1,sk.w*(pen?inkPF(pr):1)*k); ctx.beginPath(); ctx.moveTo((p[i*3-3]+ox)*k,(p[i*3-2]+oy)*k); ctx.lineTo((p[i*3]+ox)*k,(p[i*3+1]+oy)*k); ctx.stroke(); }
d.li=n; ctx.restore(); return; }
// หัวปากกา/รูปทรงอื่น: ล้างเฉพาะกรอบของเส้น แล้ววาดใหม่
let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(let i=0;i<n;i++){ const x=p[i*3],y=p[i*3+1]; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
const pad=(sk.t==="s"?Math.max(sk.w,16)*2:sk.w*2.2)+6, R=[Math.max(0,Math.floor((x0-pad+ox)*k)),Math.max(0,Math.floor((y0-pad+oy)*k)),Math.min(c.width,Math.ceil((x1+pad+ox)*k)),Math.min(c.height,Math.ceil((y1+pad+oy)*k))];
const u=d.reg?[Math.min(R[0],d.reg[0]),Math.min(R[1],d.reg[1]),Math.max(R[2],d.reg[2]),Math.max(R[3],d.reg[3])]:R; d.reg=R;
ctx.clearRect(u[0],u[1],u[2]-u[0],u[3]-u[1]); inkStroke(ctx,sk,k,ox,oy);
}
function inkLiveLasso(){
const c=el("ink-over"), ctx=c.getContext("2d"), k=ink.k, [ox,oy]=inkO(); ctx.clearRect(0,0,c.width,c.height);
const poly=ink.drag.poly; ctx.save(); ctx.setLineDash([8*k,6*k]); ctx.strokeStyle="#2563eb"; ctx.lineWidth=Math.max(1.5,1.6*k); ctx.fillStyle="rgba(37,99,235,.08)";
ctx.beginPath(); poly.forEach((q,i)=>i?ctx.lineTo((q[0]+ox)*k,(q[1]+oy)*k):ctx.moveTo((q[0]+ox)*k,(q[1]+oy)*k)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function inkLassoDone(poly){
inkOverClear(); const pg=inkPage(); const idx=new Set();
if(poly.length<=6){ const [tx,ty]=poly[0]; for(let i=pg.strokes.length-1;i>=0;i--){ if(inkHit(pg.strokes[i],tx,ty,10*inkPx())){ idx.add(i); break; } } }
else pg.strokes.forEach((s,i)=>{ if(s.t==="s"){ const q=inkBB(s); if(inkInPoly(poly,(q[0]+q[2])/2,(q[1]+q[3])/2))idx.add(i); return; } const n=s.p.length/3; let inn=0; for(let j=0;j<n;j++)if(inkInPoly(poly,s.p[j*3],s.p[j*3+1]))inn++; if(inn/n>=.5)idx.add(i); });
ink.sel=idx.size?{idx,box:inkBBox(pg.strokes,idx)}:null; inkDrawSel(); inkToolbar();
}
function inkEraseAt(x,y){
const d=ink.drag, pg=inkPage(), r=inkSize(); let ch=false;
pg.strokes.forEach((s,i)=>{ if(!d.del.has(i)&&inkHit(s,x,y,r)){ d.del.add(i); ch=true; } });
if(ch){ const c=el("ink-base"); inkRenderTo(c.getContext("2d"),ink.k,pg.strokes,d.del,inkOpt()); }
const o=el("ink-over"), ctx=o.getContext("2d"), k=ink.k, [ox,oy]=inkO(); ctx.clearRect(0,0,o.width,o.height);
ctx.save(); ctx.strokeStyle="rgba(80,80,80,.7)"; ctx.fillStyle="rgba(255,255,255,.35)"; ctx.lineWidth=Math.max(1,1.3*k); ctx.beginPath(); ctx.arc((x+ox)*k,(y+oy)*k,r*k,0,6.283); ctx.fill(); ctx.stroke(); ctx.restore();
}

// ---------- แถบเครื่องมือ ----------
const INK_TOOLS=[["pen","ปากกา",'<path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/>'],["shape","รูปทรง",'<rect x="3.5" y="4" width="10" height="10" rx="1.5"/><circle cx="15.5" cy="15.5" r="5"/>'],["hl","ไฮไลต์",'<path d="M9 4l11 11-5 5L4 9z"/><path d="M4 20h6"/>'],["eraser","ยางลบ",'<path d="M7 20h12M4.5 14.5L13 6l5 5-8.5 8.5H6z"/>'],["lasso","เลือก/ย้าย",'<path d="M12 4c5 0 8 2 8 5s-3 5-8 5-8-2-8-5 3-5 8-5z" stroke-dasharray="3 3"/><path d="M9 14c-1 3 0 5 3 6"/>'],["hand","เลื่อนหน้า",'<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-1V6a1.5 1.5 0 0 1 3 0v7c0 4-2 7-6 7-3 0-4-2-6-5l-1-2a1.5 1.5 0 0 1 2.5-1.5L8 14"/>']];
function inkToolbar(){
const tb=el("ink-tools");
tb.innerHTML=INK_TOOLS.map(([k,l,p])=>`<button type="button" class="ink-b${ink.tool===k?" on":""}" data-itool="${k}" title="${l}" aria-label="${l}" aria-pressed="${ink.tool===k}">${svg(p,20)}</button>`).join("");
const key=ink.tool==="hl"?"hl":"pen";
const showColor=ink.tool==="pen"||ink.tool==="hl"||ink.tool==="shape";
el("ink-colors").innerHTML=showColor?(ink.tool==="hl"?INK_HL:INK_PEN).map(c=>`<button type="button" class="ink-c${ink.color[key]===c?" on":""}" data-icolor="${c}" style="background:${c}" aria-label="สี ${c}"></button>`).join(""):"";
el("ink-sizes").innerHTML=inkSizesHtml();
el("ink-undo").disabled=!ink.undo.length; el("ink-redo").disabled=!ink.redo.length;
el("ink-seldel").hidden=!ink.sel; el("ink-selshape").hidden=!ink.sel;
const fl={auto:"นิ้ว: อัตโนมัติ",on:"นิ้ว: วาดได้",off:"นิ้ว: เลื่อน/ซูม"};
el("ink-finger").textContent=fl[ink.fingerMode]; el("ink-finger").title="Apple Pencil วาดเสมอ · นิ้วใช้ซูม/เลื่อน (กดเพื่อสลับให้นิ้ววาดได้)";
el("ink-stage").style.cursor=ink.tool==="hand"?"grab":ink.tool==="lasso"?"crosshair":"crosshair";
inkPagesBar();
}
function inkPagesBar(){
if(ink.board){ el("ink-pages").innerHTML=`<span class="ink-pinfo" style="margin:0">กระดานกว้าง · ลากด้วยนิ้วเพื่อเลื่อน · ซูมออกเพื่อดูภาพรวม · วาดได้ไม่จำกัด</span><span class="ink-pinfo" id="ink-zl">${Math.round(ink.z*100)}%</span>`; return; }
el("ink-pages").innerHTML=`<button type="button" class="ink-b" id="ink-prev" ${ink.cur===0?"disabled":""} aria-label="หน้าก่อนหน้า">${svg('<path d="M15 6l-6 6 6 6"/>',18)}</button>`
+ink.pages.map((p,i)=>`<button type="button" class="ink-pn${i===ink.cur?" on":""}" data-ipage="${i}">${i+1}</button>`).join("")
+`<button type="button" class="ink-b" id="ink-next" ${ink.cur===ink.pages.length-1?"disabled":""} aria-label="หน้าถัดไป">${svg('<path d="M9 6l6 6-6 6"/>',18)}</button>
<button type="button" class="ink-pn add" id="ink-addpage" title="เพิ่มหน้าว่างต่อจากหน้านี้">＋ หน้าใหม่</button><button type="button" class="ink-pn add" id="ink-addtpl" title="เพิ่มหน้าจากเทมเพลท (Planner รายวัน/สัปดาห์/เดือน ฯลฯ)">▦ เทมเพลท</button>
<span class="ink-pinfo">หน้า ${ink.cur+1} / ${ink.pages.length}</span>`;
}
function inkGo(i){
if(i<0||i>=ink.pages.length)return; ink.cur=i; ink.sel=null; ink.drag=null; inkOverClear(); inkRedraw(); inkToolbar();
}
function inkAddPage(tpl){
ink.pages.splice(ink.cur+1,0,{id:inkUid(),strokes:[],dirty:true,tpl:tpl||null}); ink.cur++; ink.sel=null; ink.metaDirty=true;
inkRedraw(); inkOverClear(); inkToolbar(); inkDirty();
}
// ---------- เมนูลอย ----------
function inkPop(html,anchor){
const p=el("ink-pop"); p.innerHTML=html; p.hidden=false;
const r=anchor.getBoundingClientRect(), W=innerWidth;
p.style.top=(r.bottom+6)+"px"; p.style.maxHeight=Math.max(200,innerHeight-r.bottom-18)+"px"; p.style.overflowY="auto"; p.style.left=Math.max(8,Math.min(W-p.offsetWidth-8,r.right-p.offsetWidth))+"px";
}
function inkClosePop(){ const p=el("ink-pop"); if(p)p.hidden=true; }
function inkTplMenu(a){
const nt=inkLive();
inkPop(`<div class="ink-ph">แบบกระดาษ</div><div class="ink-row">${INK_TPL.map(([k,l])=>`<button type="button" class="ink-opt${(nt.tpl||"lines")===k?" on":""}" data-itpl="${k}">${l}</button>`).join("")}</div>
<div class="ink-ph">สีกระดาษ</div><div class="ink-row">${INK_PAPER.map(([c,l])=>`<button type="button" class="ink-opt${(nt.paper||"#ffffff")===c?" on":""}" data-ipaper="${c}"><i style="background:${c}"></i>${l}</button>`).join("")}</div>
<div class="hint" style="margin:8px 0 0;font-size:12px">มีผลทั้ง${ink.board?"กระดาน":"สมุด (หน้าที่ใช้เทมเพลทสำเร็จรูปคงแบบเดิม ปรับได้เฉพาะสีกระดาษ)"}</div>`,a);
}
function inkMoreMenu(a){
const nt=inkLive();
inkPop(`<button type="button" class="ink-mi" data-imore="pin">${nt.pin?"เลิกปักหมุด":"ปักหมุด"}</button>
<button type="button" class="ink-mi" data-imore="folder">ย้ายไปโฟลเดอร์…${nt.folder?" (ตอนนี้: "+esc(folderName(nt.folder))+")":""}</button>
${ink.board?"":`<button type="button" class="ink-mi" data-imore="addpage">เพิ่มหน้าใหม่ต่อจากหน้านี้</button>`}
<button type="button" class="ink-mi" data-imore="clear">${ink.board?"ล้างกระดานทั้งหมด":"ล้างหน้านี้"}</button>
${ink.board?"":`<button type="button" class="ink-mi danger" data-imore="delpage" ${ink.pages.length<2?"disabled":""}>ลบหน้านี้</button>`}
<button type="button" class="ink-mi" data-imore="scrib">เขียนแล้วเส้นหาย / ตามไม่ทัน? (วิธีแก้บน iPad)</button>
<button type="button" class="ink-mi" data-imore="lead">ปลายเส้นล่วงหน้า (ลดความหน่วง): ${(INK_LEADS.find(x=>x[0]===ink.lead)||INK_LEADS[0])[1]}</button>
<button type="button" class="ink-mi" data-imore="diag">${inkDiag.on?"หยุดวัด + ดูผล":"วัดความลื่น (ทดสอบเขียน)"}</button>
<button type="button" class="ink-mi danger" data-imore="delnote">ลบ${ink.board?"กระดาน":"สมุดทั้งเล่ม"}</button>`,a);
}
// ---------- บันทึกอัตโนมัติ ----------
function inkStatus(t,cls){ const s=el("ink-save"), c="ink-save "+(cls||""); if(s.textContent===t&&s.className===c)return; s.textContent=t; s.className=c; }
function inkDirty(){ ink.saveErr=false; inkStatus("กำลังบันทึก…","busy"); clearTimeout(ink.saveT); ink.saveT=setTimeout(inkAutoSave,2500); }
function inkAutoSave(){ if(ink.drag||Date.now()-(ink.penUpAt||0)<1500){ ink.saveT=setTimeout(inkAutoSave,900); return; } inkSave(); }
function inkThumb(){
const pg=ink.pages[0]; if(!pg)return "";
let c;
if(ink.board){ c=inkBoardCanvas(240); }
else{ const w=240, k=w/INK_W; c=document.createElement("canvas"); c.width=w; c.height=Math.round(INK_H*k); inkRenderTo(c.getContext("2d"),k,pg.strokes,null,{tpl:pg.tpl}); }
try{ return c.toDataURL("image/jpeg",.6); }catch(e){ return ""; }
}
// กระดานกว้าง → ภาพครอบทุกลายเส้น (หรือพื้นที่ 800×600 ถ้ายังว่าง)
function inkBoardCanvas(maxPx){
let b=inkAllBox(); const pad=40; b=b?[b[0]-pad,b[1]-pad,b[2]+pad,b[3]+pad]:[-400,-300,400,300];
let w=b[2]-b[0], h=b[3]-b[1]; if(w<300){ const d=(300-w)/2; b[0]-=d; b[2]+=d; w=300; } if(h<200){ const d=(200-h)/2; b[1]-=d; b[3]+=d; h=200; }
const k=Math.min(maxPx/w,maxPx/h,2.5), c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k));
inkRenderTo(c.getContext("2d"),k,ink.pages[0].strokes,null,{board:true,ox:-b[0],oy:-b[1],w,h}); return c;
}
async function inkSave(final){
if(!ink.note||!SB)return; clearTimeout(ink.saveT);
if(ink.saving){ ink.again=true; return; }
ink.saving=true;
try{
const dirty=ink.pages.filter(p=>p.dirty);
for(const p of dirty){
const payload={noteId:ink.note._id,strokes:p.strokes};
if(ink.board&&!ink.bigWarn&&p.strokes.reduce((a,s)=>a+s.p.length,0)>600000){ ink.bigWarn=1; tell("<b>กระดานนี้ใหญ่มากแล้ว</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">แนะนำให้เริ่มกระดานใหม่สำหรับงานต่อไป เพื่อให้เปิด/บันทึกได้เร็วค่ะ</div>"); }
const {error}=await SB.from("rows").upsert({id:"ink-"+p.id,uid,kind:"ink",data:payload,updated_at:new Date().toISOString()});
if(error)throw error; p.dirty=false; }
const nt=inkLive();
const ptpl={}; ink.pages.forEach(p=>{ if(p.tpl)ptpl[p.id]=p.tpl; });
const d={pages:ink.pages.length,pageIds:ink.pages.map(p=>p.id),ptpl,...((final||!nt.thumb)?{thumb:inkThumb()}:{}),updated:new Date().toISOString(),title:(el("ink-title").value||"").trim()||nt.title||("สมุดเขียนมือ "+fmtDate(new Date().toISOString().slice(0,10)))};
await DB.collection("note").doc(ink.note._id).set(d,{merge:true});
ink.metaDirty=false; inkStatus("บันทึกแล้ว ✓","ok");
}catch(err){ ink.saveErr=true; inkStatus("บันทึกไม่สำเร็จ · แตะเพื่อลองใหม่","bad"); lastErr=err; }
finally{ ink.saving=false; if(ink.again){ ink.again=false; inkSave(); } }
}
// ---------- เปิด / ปิดสมุด ----------
// spec: {mode:"page"|"board", tpl, paper, title, pages:[ {k,y,m,d} | null ], folder}
async function inkNew(spec){
spec=spec||{};
if(!DB){ tell("ยังไม่ได้เชื่อมต่อฐานข้อมูล"); return; }
const board=spec.mode==="board";
const pgs=board?[null]:((spec.pages&&spec.pages.length)?spec.pages:[null]);
const ids=pgs.map(()=>inkUid()), ptpl={}; pgs.forEach((t,i)=>{ if(t)ptpl[ids[i]]=t; });
const folder=spec.folder!==undefined?spec.folder:((R.noteFolder&&R.noteFolder!=="__none")?R.noteFolder:"");
const doc={title:spec.title||"",kind:INKKIND,mode:board?"board":"page",date:new Date().toISOString().slice(0,10),tag:"",color:"",pin:false,fmt:"h",body:"",pages:ids.length,pageIds:ids,ptpl,
tpl:spec.tpl||(board?"grid":"lines"),paper:spec.paper||"#ffffff",thumb:"",folder};
try{ const r=await DB.collection("note").add(doc); inkOpen({...doc,_id:r.id},true); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
}
async function inkOpen(n,fresh){
ink.note=n; ink.board=n.mode==="board"; ink.pages=[]; ink.cur=0; ink.undo=[]; ink.redo=[]; ink.sel=null; ink.drag=null; ink.ptrs.clear(); ink.z=1; ink.tx=0; ink.ty=0; ink.vx=-60; ink.vy=-60; ink.dirtyAny=false; ink.bigWarn=0;
if(ink.board&&!fresh)ink.z=1;
// ซูมทั้งหน้าเป็น 100% ระหว่างเขียน (กันพิกัดปากกาเพี้ยนจากซูมของแอป)
ink.zoomBak=document.documentElement.style.zoom||""; document.documentElement.style.zoom="1"; document.documentElement.style.setProperty("--zf",1);
el("inkdlg").classList.toggle("board",ink.board); document.body.classList.add("ink-on");
el("ink-title").value=n.title||""; el("ink-title").readOnly=true; try{ if(document.activeElement&&document.activeElement!==document.body)document.activeElement.blur(); }catch(e){} el("ink-load").hidden=false; inkStatus(fresh?"สมุดใหม่":"กำลังโหลด…","");
const dlg=el("inkdlg"); if(!dlg.open)dlg.showModal();
const ids=(n.pageIds&&n.pageIds.length)?n.pageIds:[inkUid()];
let rows={};
if(!fresh&&SB){ try{ const {data,error}=await SB.from("rows").select("id,data").eq("uid",uid).eq("kind","ink").in("id",ids.map(i=>"ink-"+i)); if(error)throw error; (data||[]).forEach(r=>rows[r.id]=r.data); }
catch(e){ el("ink-load").hidden=true; inkStatus("โหลดไม่สำเร็จ","bad"); tell("<b>โหลดลายเส้นไม่สำเร็จ</b><div style=\"font-size:13px;margin-top:8px\">ตรวจอินเทอร์เน็ตแล้วเปิดสมุดใหม่อีกครั้งค่ะ — ข้อมูลเดิมยังอยู่ ไม่หาย</div>"); ink.note=null; el("inkdlg").close(); document.documentElement.style.zoom=ink.zoomBak; document.body.classList.remove("ink-on"); return; } }
ink.pages=ids.map(i=>({id:i,strokes:((rows["ink-"+i]||{}).strokes)||[],dirty:false,tpl:(n.ptpl&&n.ptpl[i])||null}));
if(ink.board&&ink.pages[0].strokes.length){ const b=inkAllBox(); const st=el("ink-stage"); ink.vx=b[0]-60; ink.vy=b[1]-60; ink.z=Math.max(.2,Math.min(1,Math.min(st.clientWidth/(b[2]-b[0]+120),st.clientHeight/(b[3]-b[1]+120)))); }
el("ink-load").hidden=true; inkStatus(fresh?"สมุดใหม่":"บันทึกแล้ว ✓",fresh?"":"ok");
inkToolbar(); inkApply(); setTimeout(()=>{ inkApply(); inkResize(); },30);
}
async function inkClose(){
if(!ink.note)return;
const id=ink.note._id; inkClosePop(); clearTimeout(ink.saveT);
const empty=ink.pages.every(p=>!p.strokes.length)&&!(el("ink-title").value||"").trim();
try{
if(empty&&!ink.pages.some(p=>p.dirty)&&ink.pages.length===1&&!(inkLive().thumb)){ await DB.collection("note").doc(id).delete(); }       // สมุดเปล่าที่ไม่ได้ใช้ ไม่เก็บไว้
else{ ink.saving=false; await inkSave(true); }
}catch(e){}
el("inkdlg").close(); document.documentElement.style.zoom=ink.zoomBak||""; document.body.classList.remove("ink-on"); try{ setZoom(curZoom()); }catch(e){}
ink.note=null; ink.pages=[]; ink.board=false; render();
}
// ---------- ส่งออก PDF / รูป ----------
function inkPageCanvas(pg,w){ const k=w/INK_W, c=document.createElement("canvas"); c.width=w; c.height=Math.round(INK_H*k); inkRenderTo(c.getContext("2d"),k,pg.strokes,null,{tpl:pg.tpl}); return c; }
const inkBlob=(c,type,q)=>new Promise(r=>c.toBlob(r,type,q));
async function inkPdf(){
const enc=new TextEncoder(), parts=[]; let len=0; const offs=[];
const push=b=>{ if(typeof b==="string")b=enc.encode(b); parts.push(b); len+=b.length; };
const jp=[]; if(ink.board){ const c=inkBoardCanvas(2400); const b=await inkBlob(c,"image/jpeg",.88); jp.push({w:c.width,h:c.height,pw:595.28,ph:595.28*c.height/c.width,bytes:new Uint8Array(await b.arrayBuffer())}); }
else for(const pg of ink.pages){ const c=inkPageCanvas(pg,1240); const b=await inkBlob(c,"image/jpeg",.88); jp.push({w:c.width,h:c.height,pw:595.28,ph:841.89,bytes:new Uint8Array(await b.arrayBuffer())}); }
const n=jp.length; const obj=(id,fn)=>{ offs[id]=len; push(id+" 0 obj\n"); fn(); push("\nendobj\n"); };
push("%PDF-1.4\n");
obj(1,()=>push("<< /Type /Catalog /Pages 2 0 R >>"));
obj(2,()=>push(`<< /Type /Pages /Count ${n} /Kids [${jp.map((_,i)=>(3+i*3)+" 0 R").join(" ")}] >>`));
jp.forEach((j,i)=>{ const pg=3+i*3, ct=pg+1, im=pg+2, W=j.pw, H=j.ph, c=`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
obj(pg,()=>push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${ct} 0 R /Resources << /XObject << /Im0 ${im} 0 R >> >> >>`));
obj(ct,()=>push(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`));
obj(im,()=>{ push(`<< /Type /XObject /Subtype /Image /Width ${j.w} /Height ${j.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.bytes.length} >>\nstream\n`); push(j.bytes); push("\nendstream"); }); });
const total=3+n*3, xref=len; push(`xref\n0 ${total}\n0000000000 65535 f \n`);
for(let id=1;id<total;id++)push(String(offs[id]).padStart(10,"0")+" 00000 n \n");
push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
return new Blob(parts,{type:"application/pdf"});
}
const inkFileName=ext=>{ const t=((el("ink-title").value||inkLive().title||"สมุดเขียนมือ")+"").replace(/[\\/:*?"<>|]+/g," ").trim().slice(0,60)||"สมุดเขียนมือ"; return t+" "+new Date().toISOString().slice(0,10)+"."+ext; };
async function inkExportMenu(a){
inkPop(`<div class="ink-ph">ส่งออก${ink.board?"กระดานนี้":"สมุดนี้"}</div><button type="button" class="ink-mi" data-iexp="pdf">${ink.board?"PDF ทั้งกระดาน (1 หน้า)":"PDF ทั้งเล่ม ("+ink.pages.length+" หน้า)"}</button>
<button type="button" class="ink-mi" data-iexp="png">${ink.board?"รูปภาพทั้งกระดาน (PNG)":"รูปภาพหน้านี้ (PNG)"}</button>
<div class="hint" style="margin:8px 4px 0;font-size:12px;max-width:260px">ต้องการเก็บใน Google Drive: เลือก PDF → กด “แชร์ / บันทึกลง Drive” → เลือก Drive ในหน้าต่างแชร์ของ iPad</div>`,a);
}
async function inkExport(kind){
inkClosePop();
const box=el("ink-exp"); box.hidden=false; box.innerHTML=`<div class="ink-expc"><b>กำลังสร้างไฟล์…</b><div class="hint">สมุดหลายหน้าอาจใช้เวลาสักครู่</div></div>`;
try{
await inkSave(true);
let blob,name,type;
if(kind==="png"){ blob=await inkBlob(ink.board?inkBoardCanvas(3000):inkPageCanvas(inkPage(),1600),"image/png"); name=inkFileName("png"); type="image/png"; }
else{ blob=await inkPdf(); name=inkFileName("pdf"); type="application/pdf"; }
ink.pdf={blob,name,type};
const file=new File([blob],name,{type}); const canShare=!!(navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share);
box.innerHTML=`<div class="ink-expc"><b>พร้อมแล้ว ✓</b><div class="hint" style="margin:6px 0 12px">${esc(name)} · ${(blob.size/1024/1024).toFixed(2)} MB</div>
${canShare?`<button type="button" class="btn" id="ink-share" style="width:100%;margin-bottom:8px">แชร์ / บันทึกลง Google Drive</button><div class="hint" style="margin:0 0 10px;font-size:12px">ในหน้าต่างแชร์: เลือก “Drive” แล้วเลือกโฟลเดอร์ หรือเลือก “บันทึกลงไฟล์”</div>`:`<div class="hint" style="margin:0 0 10px;font-size:12px">เครื่องนี้ไม่มีหน้าต่างแชร์ — ดาวน์โหลดแล้วอัปโหลดขึ้น Google Drive ได้เลย</div>`}
<button type="button" class="btn ${canShare?"ghost":""}" id="ink-dl" style="width:100%;margin-bottom:8px">ดาวน์โหลดไฟล์</button>
<a class="btn ghost" href="https://drive.google.com/drive/my-drive" target="_blank" rel="noopener" style="display:block;text-align:center;margin-bottom:8px;text-decoration:none">เปิด Google Drive</a>
<button type="button" class="btn ghost" id="ink-expx" style="width:100%">ปิด</button></div>`;
el("ink-expx").onclick=()=>{ box.hidden=true; };
el("ink-dl").onclick=()=>{ const u=URL.createObjectURL(blob), a=document.createElement("a"); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); };
if(canShare)el("ink-share").onclick=async()=>{ try{ await navigator.share({files:[file],title:name}); }catch(e){ if(e&&e.name!=="AbortError")inkStatus("แชร์ไม่สำเร็จ ลองดาวน์โหลดแทน","bad"); } };
}catch(e){ box.innerHTML=`<div class="ink-expc"><b>สร้างไฟล์ไม่สำเร็จ</b><div class="hint">${esc(String(e&&e.message||e))}</div><button type="button" class="btn ghost" id="ink-expx" style="width:100%;margin-top:10px">ปิด</button></div>`; el("ink-expx").onclick=()=>{ box.hidden=true; }; }
}
// ---------- วัดความลื่น (ไว้ส่งผลให้ทีมช่วยตรวจ) ----------
const inkDiag={on:0};
function inkDiagStart(){
Object.assign(inkDiag,{on:1,lag:[],hd:[],hm:[],hu:[],gaps:[],ugap:[],last:0,long:0,longMax:0,t0:performance.now(),ev:{},overlap:0,nodraw:0,dots:0,lastUp:0});
if(!inkDiag.wired){ inkDiag.wired=1; const st=el("ink-stage"); ["pointerdown","pointerup","pointercancel","gotpointercapture","lostpointercapture","pointerleave"].forEach(n=>st.addEventListener(n,e=>{ if(!inkDiag.on)return; const k=n.replace("pointer","p").replace("capture","cap")+":"+e.pointerType; inkDiag.ev[k]=(inkDiag.ev[k]||0)+1; if(e.pointerType==="pen"){ if(n==="pointerup")inkDiag.lastUp=e.timeStamp; else if(n==="pointerdown"&&inkDiag.lastUp)inkDiag.ugap.push(e.timeStamp-inkDiag.lastUp); } },true)); st.addEventListener("touchstart",e=>{ if(inkDiag.on)inkDiag.ev.touchstart=(inkDiag.ev.touchstart||0)+1; },{capture:true,passive:true}); }
try{ inkDiag.po=new PerformanceObserver(l=>l.getEntries().forEach(x=>{ inkDiag.long++; inkDiag.longMax=Math.max(inkDiag.longMax,x.duration); })); inkDiag.po.observe({entryTypes:["longtask"]}); }catch(er){}
const f=t=>{ if(!inkDiag.on)return; const w=ink.drag&&ink.drag.mode==="draw"; if(w&&inkDiag.last)inkDiag.gaps.push(t-inkDiag.last); inkDiag.last=w?t:0; requestAnimationFrame(f); }; requestAnimationFrame(f);
}
function inkDiagTimed(key,fn){ return e=>{ if(!inkDiag.on)return fn(e); const t=performance.now(); if(e.pointerType==="pen"||e.pointerType==="mouse")inkDiag.lag.push(t-e.timeStamp); fn(e); inkDiag[key].push(performance.now()-t); if(key==="hd"&&e.pointerType==="pen"&&!(ink.drag&&ink.drag.mode==="draw"))inkDiag.nodraw++; }; }
function inkDiagReport(){
inkDiag.on=0; try{ inkDiag.po&&inkDiag.po.disconnect(); }catch(er){}
const st=a=>{ if(!a.length)return "ไม่มีข้อมูล"; const s=[...a].sort((x,y)=>x-y), sum=a.reduce((x,y)=>x+y,0); return `n=${a.length} · เฉลี่ย ${(sum/a.length).toFixed(1)} · p95 ${s[Math.floor(s.length*.95)].toFixed(1)} · สูงสุด ${s[s.length-1].toFixed(1)} ms`; };
const slow=inkDiag.gaps.filter(g=>g>24).length, c=el("ink-base"), SS=(ink.pages[ink.cur]?ink.pages[ink.cur].strokes:[]).filter(q=>q.t==="p");
return ["Sky Work v"+APP_VERSION+" · วัดความลื่น "+Math.round((performance.now()-inkDiag.t0)/1000)+" วินาที",
"หน้าจอ: "+innerWidth+"x"+innerHeight+" dpr "+(window.devicePixelRatio||1)+" · แคนวาส "+c.width+"x"+c.height+" · "+(ink.board?"กระดาน":"สมุด")+(window.PointerEvent&&PointerEvent.prototype.getCoalescedEvents?" · coalesced":" · no-coalesced")+(PointerEvent.prototype.getPredictedEvents?" · predicted":" · no-predicted"),
"ปากกาแตะลง (pointerdown): "+st(inkDiag.hd),"ปากกาลาก (pointermove): "+st(inkDiag.hm),"ปากกายก (pointerup+วาดเก็บ): "+st(inkDiag.hu),
"อีเวนต์รอคิวก่อนถูกประมวลผล: "+st(inkDiag.lag),"ช่วงห่างระหว่างเฟรมขณะเขียน: "+st(inkDiag.gaps)+" · เฟรมช้า(>24ms) "+slow+" ครั้ง",
"Long task (>50ms): "+inkDiag.long+" ครั้ง · นานสุด "+inkDiag.longMax.toFixed(0)+" ms",
"อีเวนต์ดิบที่ iPad ส่งมา: "+(Object.keys(inkDiag.ev).sort().map(k=>k+"="+inkDiag.ev[k]).join(" · ")||"-"),"ปากกาแตะลงแต่ไม่เกิดเส้น: "+inkDiag.nodraw+" ครั้ง · แตะลงซ้อนก่อนเส้นเก่าจบ: "+inkDiag.overlap+" ครั้ง","ระยะห่างยกปากกา→แตะลงใหม่ (ms): "+st(inkDiag.ugap),"ลายเส้นในหน้า: "+SS.length+" เส้น · แรงกดจุดแรก<0.15: "+SS.filter(q=>q.p[2]<.15).length+" เส้น · เส้นสั้น(≤3 จุด): "+SS.filter(q=>q.p.length<=9).length+" เส้น","ระยะจุดแรก→จุดสอง (หน่วยหน้ากระดาษ): "+st(SS.map(q=>q.p.length>=6?Math.hypot(q.p[3]-q.p[0],q.p[4]-q.p[1]):0))].join("\n");
}
// ---------- ผูกปุ่ม ----------
(function inkWire(){
const st=el("ink-stage"); if(!st)return;
st.addEventListener("pointerdown",inkDiagTimed("hd",inkDown)); st.addEventListener("pointermove",inkDiagTimed("hm",inkMove));
st.addEventListener("pointerup",inkDiagTimed("hu",inkUp)); st.addEventListener("pointercancel",inkUp);
st.addEventListener("contextmenu",e=>e.preventDefault());
// กัน gesture ของ iPadOS (เลือกคำ/Scribble) แย่งปากการะหว่างเขียนเร็วๆ — เฉพาะ touch ที่เป็น stylus นิ้วยังเลื่อน/แตะปกติ
["touchstart","touchmove"].forEach(n=>st.addEventListener(n,e=>{ const t=e.touches&&e.touches[0]; if(t&&t.touchType==="stylus"&&e.cancelable)e.preventDefault(); },{passive:false}));
st.addEventListener("wheel",e=>{ e.preventDefault(); if(e.ctrlKey||e.metaKey){ inkZoomAt(Math.max(.75,Math.min(1.33,Math.exp(-e.deltaY*.01))),e.clientX,e.clientY); } else{ inkPanBy(-e.deltaX,-e.deltaY); } },{passive:false});
window.addEventListener("resize",()=>{ if(ink.note)inkApply(); });
el("ink-close").onclick=inkClose;
el("inkdlg").addEventListener("close",()=>document.body.classList.remove("ink-on"));
// ห้ามเลือกข้อความในหน้าเขียน: ปากกาแตะซ้ำเร็วๆ ถูกตีความเป็น "แตะสองครั้งเพื่อเลือกคำ" ทำให้เส้นหายและหน้ากระโดด
el("inkdlg").addEventListener("selectstart",e=>{ const t=e.target&&e.target.nodeType===3?e.target.parentNode:e.target; if(!t||!t.closest||!t.closest("input"))e.preventDefault(); });
el("inkdlg").addEventListener("cancel",e=>{ e.preventDefault(); if(!el("ink-exp").hidden){ el("ink-exp").hidden=true; return; } if(!el("ink-pop").hidden){ inkClosePop(); return; } inkClose(); });
el("ink-undo").onclick=()=>inkUndo(false); el("ink-redo").onclick=()=>inkUndo(true);
el("ink-selshape").onclick=()=>inkSelToShape();
el("ink-seldel").onclick=()=>{ if(!ink.sel)return; const idx=ink.sel.idx; inkCommit(inkPage().strokes.filter((_,i)=>!idx.has(i))); };
el("ink-finger").onclick=()=>{ ink.fingerMode={auto:"on",on:"off",off:"auto"}[ink.fingerMode]; if(ink.fingerMode==="auto")ink.penSeen=false; inkToolbar(); };
el("ink-zin").onclick=()=>{ const r=st.getBoundingClientRect(); inkZoomAt(1.25,r.left+r.width/2,r.top+r.height/2); };
el("ink-zout").onclick=()=>{ const r=st.getBoundingClientRect(); inkZoomAt(.8,r.left+r.width/2,r.top+r.height/2); };
el("ink-zfit").onclick=()=>{ if(ink.board){ const b=inkAllBox(), st=el("ink-stage"); if(b){ ink.z=Math.max(.05,Math.min(2,Math.min(st.clientWidth/(b[2]-b[0]+120),st.clientHeight/(b[3]-b[1]+120)))); ink.vx=b[0]-60-(st.clientWidth/ink.z-(b[2]-b[0]+120))/2; ink.vy=b[1]-60-(st.clientHeight/ink.z-(b[3]-b[1]+120))/2; } else{ ink.z=1; ink.vx=-60; ink.vy=-60; } inkApply(); return; } ink.z=1; ink.tx=0; ink.ty=0; inkApply(); };
el("ink-tpl").onclick=e=>{ e.stopPropagation(); inkTplMenu(e.currentTarget); };
el("ink-more").onclick=e=>{ e.stopPropagation(); inkMoreMenu(e.currentTarget); };
el("ink-exp-b").onclick=e=>{ e.stopPropagation(); inkExportMenu(e.currentTarget); };
el("ink-save").onclick=()=>{ if(ink.saveErr)inkSave(); };
el("ink-title").oninput=()=>{ if(ink.note){ ink.metaDirty=true; inkDirty(); } };
// ช่องชื่อสมุดเป็นแบบอ่านอย่างเดียวระหว่างเขียน — กัน Scribble ของ iPad มองว่าทั้งหน้าเป็นที่เขียนข้อความ แล้วแย่งรับเส้นปากกา; แตะที่ชื่อเพื่อแก้ไข
(function(){ const tt=el("ink-title"); tt.addEventListener("click",()=>{ if(tt.readOnly){ tt.blur(); tt.readOnly=false; tt.focus(); } }); tt.addEventListener("blur",()=>{ tt.readOnly=true; }); tt.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); tt.blur(); } }); })();
el("inkdlg").addEventListener("click",async e=>{
const b=e.target.closest("button"); if(!b){ if(!e.target.closest("#ink-pop"))inkClosePop(); return; }
if(b.dataset.itool){ ink.tool=b.dataset.itool; if(ink.tool!=="lasso")ink.sel=null; inkOverClear(); inkDrawSel(); inkToolbar(); }
else if(b.dataset.icolor){ ink.color[ink.tool==="hl"?"hl":"pen"]=b.dataset.icolor; inkSetSave(); inkToolbar(); }
else if(b.dataset.ipage){ inkGo(+b.dataset.ipage); }
else if(b.id==="ink-prev")inkGo(ink.cur-1); else if(b.id==="ink-next")inkGo(ink.cur+1); else if(b.id==="ink-addpage")inkAddPage(); else if(b.id==="ink-addtpl")inkGallery("add");
else if(b.dataset.itpl||b.dataset.ipaper){ const d=b.dataset.itpl?{tpl:b.dataset.itpl}:{paper:b.dataset.ipaper}; Object.assign(ink.note,d); try{ await DB.collection("note").doc(ink.note._id).set(d,{merge:true}); }catch(er){} inkRedraw(); inkTplMenu(el("ink-tpl")); }
else if(b.dataset.iexp){ inkExport(b.dataset.iexp); }
else if(b.dataset.imore){ const m=b.dataset.imore; inkClosePop();
if(m==="diag"){ if(!inkDiag.on){ inkDiagStart(); inkStatus("กำลังวัด… เขียนตามปกติ แล้วกด ⋯ › หยุดวัด","busy"); } else{ const r=inkDiagReport(); inkStatus("วัดเสร็จแล้ว","ok"); tell(`<b>ผลวัดความลื่น</b><div class="hint" style="margin:6px 0">กดคัดลอกแล้วส่งให้ทีมดูได้เลยค่ะ</div><textarea id="diagtx" readonly style="width:100%;height:210px;font:12px/1.6 ui-monospace,monospace;border:1px solid var(--line);border-radius:10px;padding:8px;box-sizing:border-box">${esc(r)}</textarea><button type="button" class="btn" id="diagcp" style="width:100%;margin-top:8px">คัดลอกผล</button>`); setTimeout(()=>{ const b=el("diagcp"); if(b)b.onclick=async()=>{ try{ await navigator.clipboard.writeText(r); b.textContent="คัดลอกแล้ว ✓"; }catch(er){ el("diagtx").select(); b.textContent="เลือกข้อความแล้ว กดคัดลอกเอง"; } }; },50); } }
else if(m==="scrib"){ tell(`<b>เขียนเร็วแล้วบางเส้นหาย?</b><div style="font-size:13.5px;margin-top:10px;line-height:1.85">สาเหตุที่พบบ่อยบน iPad คือ <b>Scribble</b> (ฟีเจอร์แปลงลายมือของ iPadOS) ที่แย่งรับเส้นไปก่อนที่ Safari จะส่งให้แอป เส้นที่ดูคล้ายตัวอักษรจึงถูกกลืนหาย<br><br><b>วิธีแก้:</b> ไปที่ <b>การตั้งค่า › Apple Pencil › Scribble</b> แล้วปิด จากนั้นกลับมาเขียนใหม่<br><br>ลองเทียบกับหน้าทดสอบเปล่า: <b>/pentest.html</b> (ถ้าหน้านั้นก็เส้นหายเหมือนกัน แปลว่าเป็นที่ระบบ ไม่ใช่แอป)</div>`); }
else if(m==="lead"){ const i=INK_LEADS.findIndex(x=>x[0]===ink.lead); ink.lead=INK_LEADS[(i+1)%INK_LEADS.length][0]; try{ localStorage.setItem("sw-ink-lead",String(ink.lead)); }catch(er){} inkPredClear(true); inkStatus("ปลายเส้นล่วงหน้า: "+INK_LEADS.find(x=>x[0]===ink.lead)[1],"ok"); }
else if(m==="pin"){ try{ await DB.collection("note").doc(ink.note._id).set({pin:!inkLive().pin},{merge:true}); }catch(er){} }
else if(m==="addpage")inkAddPage();
else if(m==="folder"){ pickFolder(inkLive().folder||"").then(async v=>{ if(v===null)return; try{ await DB.collection("note").doc(ink.note._id).set({folder:v},{merge:true}); Object.assign(ink.note,{folder:v}); setFoot(v?"ย้ายไปโฟลเดอร์ “"+folderName(v)+"” แล้ว":"เอาออกจากโฟลเดอร์แล้ว"); }catch(er){} }); }
else if(m==="clear"){ if(inkPage().strokes.length&&await ask(ink.board?"ล้างกระดานทั้งหมดใช่ไหมคะ? (ย้อนกลับได้ด้วยปุ่มย้อนกลับ)":"ล้างหน้านี้ใช่ไหมคะ? (ย้อนกลับได้ด้วยปุ่มย้อนกลับ)","ล้าง"))inkCommit([]); }
else if(m==="delpage"){ if(await ask("ลบหน้า "+(ink.cur+1)+" ใช่ไหมคะ? ลายเส้นในหน้านี้จะหายไป","ลบหน้านี้")){ const p=ink.pages.splice(ink.cur,1)[0]; ink.cur=Math.min(ink.cur,ink.pages.length-1); ink.undo=[]; ink.redo=[]; ink.metaDirty=true; try{ await SB.from("rows").delete().eq("uid",uid).eq("id","ink-"+p.id); }catch(er){} inkRedraw(); inkToolbar(); inkDirty(); } }
else if(m==="delnote"){ if(await ask("ย้ายสมุด “"+esc(inkLive().title||"ไม่มีชื่อ")+"” ไปถังขยะใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--ink-3)\">กู้คืนได้ภายใน 30 วันที่ ตั้งค่า › ถังขยะ</div>","ย้ายไปถังขยะ")){ clearTimeout(ink.saveT); const nt=inkLive(); el("inkdlg").close(); document.documentElement.style.zoom=ink.zoomBak||""; document.body.classList.remove("ink-on"); try{ setZoom(curZoom()); }catch(er){} ink.note=null; ink.pages=[]; ink.board=false; try{ await softDel("note",nt); }catch(er){} render(); } } }
});
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&ink.note&&ink.pages.some(p=>p.dirty))inkSave(); });
window.addEventListener("pagehide",()=>{ if(ink.note&&ink.pages.some(p=>p.dirty))inkSave(); });
document.addEventListener("keydown",e=>{ if(!ink.note||!el("inkdlg").open)return; const m=e.metaKey||e.ctrlKey;
if(m&&e.key.toLowerCase()==="z"){ e.preventDefault(); inkUndo(e.shiftKey); } else if(m&&e.key.toLowerCase()==="y"){ e.preventDefault(); inkUndo(true); }
else if((e.key==="Delete"||e.key==="Backspace")&&ink.sel&&document.activeElement!==el("ink-title")){ e.preventDefault(); el("ink-seldel").click(); } });
})();
