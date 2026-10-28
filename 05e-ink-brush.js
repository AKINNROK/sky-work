// ===== หัวปากกาหลายแบบ + รูปทรงมาตรฐาน (ใช้ร่วมกับ 05b-ink.js) =====
// ลายเส้น: {t:"p",c,w,v,p:[x,y,แรงกด,…], b:"หัวปากกา", a:ความทึบ 0-1}  ·  รูปทรง: {t:"s",sh,c,w,a,f:0|1|2,d:0|1,p:[x1,y1,0,x2,y2,0]}
// ข้อมูลเก่า (ไม่มี b) = ปากกาปกติ เปิดได้เหมือนเดิม
const INK_BRUSHES=[
{k:"pen",n:"ปากกา",w:3.5},{k:"calli",n:"คอแร้ง",w:9},{k:"pencil",n:"ดินสอ",w:4.5},{k:"crayon",n:"สีเทียน",w:11},{k:"brush",n:"พู่กัน",w:12},
{k:"air",n:"แอร์บรัช (ฟุ้ง)",w:26},{k:"spray",n:"สเปรย์พ่น",w:24},{k:"blur",n:"เบลอ",w:16},{k:"water",n:"สีน้ำ",w:26},{k:"sketch",n:"สเก็ต",w:4}];
const INK_SHAPES=[["line","เส้นตรง"],["arrow","ลูกศร"],["darrow","ลูกศรสองหัว"],["rect","สี่เหลี่ยม"],["rrect","สี่เหลี่ยมมน"],["ellipse","วงกลม/วงรี"],["triangle","สามเหลี่ยม"],["diamond","ข้าวหลามตัด"],["pentagon","ห้าเหลี่ยม"],["hexagon","หกเหลี่ยม"],["star","ดาว"],["heart","หัวใจ"],["plus","กากบาท"]];
Object.assign(ink,{snap:1,brush:"pen",size:{pen:3.5,hl:18,eraser:18,shape:3.5},alpha:1,shape:"rect",fill:0,dash:0,lock:0});
function inkSetSave(){ try{ localStorage.setItem("sw-ink-set",JSON.stringify({brush:ink.brush,size:ink.size,alpha:ink.alpha,shape:ink.shape,fill:ink.fill,dash:ink.dash,lock:ink.lock,snap:ink.snap,color:ink.color})); }catch(e){} }
(function(){ try{ const o=JSON.parse(localStorage.getItem("sw-ink-set")||"null"); if(!o)return;
if(INK_BRUSHES.some(b=>b.k===o.brush))ink.brush=o.brush; if(o.size)["pen","hl","eraser","shape"].forEach(k=>{ if(+o.size[k]>0)ink.size[k]=+o.size[k]; });
if(o.alpha>=.1&&o.alpha<=1)ink.alpha=+o.alpha; if(INK_SHAPES.some(s=>s[0]===o.shape))ink.shape=o.shape; ink.fill=[0,1,2].includes(o.fill)?o.fill:0; ink.dash=o.dash?1:0; ink.lock=o.lock?1:0; ink.snap=o.snap===0?0:1;
if(o.color){ if(INK_PEN.includes(o.color.pen))ink.color.pen=o.color.pen; if(INK_HL.includes(o.color.hl))ink.color.hl=o.color.hl; } }catch(e){} })();

// ---------- เครื่องมือช่วย ----------
function inkRgb(c){ c=String(c||"#000").replace("#",""); if(c.length===3)c=c.split("").map(x=>x+x).join(""); const n=parseInt(c,16)||0; return [(n>>16)&255,(n>>8)&255,n&255]; }
const inkRgba=(c,a)=>{ const [r,g,b]=inkRgb(c); return `rgba(${r},${g},${b},${a})`; };
function inkRng(seed){ let a=seed|0; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; }; }
const inkSeed=s=>Math.round(s.p[0]*7.13+s.p[1]*13.7)|0;
const inkDev=(s,k,dx,dy)=>{ const p=s.p,n=Math.floor(p.length/3),o=new Array(n); for(let i=0;i<n;i++)o[i]=[(p[i*3]+dx)*k,(p[i*3+1]+dy)*k]; return o; };
function inkTrace(ctx,P){ const n=P.length; ctx.beginPath(); ctx.moveTo(P[0][0],P[0][1]); if(n===2){ ctx.lineTo(P[1][0],P[1][1]); return; }
for(let i=1;i<n-1;i++)ctx.quadraticCurveTo(P[i][0],P[i][1],(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2); ctx.lineTo(P[n-1][0],P[n-1][1]); }
function inkWalk(P,step,fn){ let acc=0; fn(P[0][0],P[0][1],0); for(let i=1;i<P.length;i++){ const x0=P[i-1][0],y0=P[i-1][1],x1=P[i][0],y1=P[i][1],L=Math.hypot(x1-x0,y1-y0); if(!L)continue; let d=step-acc; while(d<=L){ const t=d/L; fn(x0+(x1-x0)*t,y0+(y1-y0)*t,i-1+t); d+=step; } acc=L-(d-step); } }
// แรงกดที่ใช้วาด: ถ้าไม่มีแรงกดจริง (เมาส์/นิ้ว) จำลองจากความเร็ว — ช้า = หนา เร็ว = บาง
function inkPrs(s){ const p=s.p,n=Math.floor(p.length/3),o=new Array(n);
if(s.v){ for(let i=0;i<n;i++)o[i]=p[i*3+2]; return o; }
const l=new Array(n).fill(0); for(let i=1;i<n;i++)l[i]=Math.hypot(p[i*3]-p[i*3-3],p[i*3+1]-p[i*3-2]); if(n>1)l[0]=l[1];
for(let i=0;i<n;i++){ const m=((i>0?l[i-1]:l[i])+l[i]+(i<n-1?l[i+1]:l[i]))/3; o[i]=Math.max(.28,Math.min(1,1.1-m/28)); }
for(let r=0;r<2;r++)for(let i=1;i<n-1;i++)o[i]=(o[i-1]+2*o[i]+o[i+1])/4;
return o; }
const inkPatC=new Map(), inkStC=new Map();
function inkPat(ctx,c,kind){ const key=c+kind; let p=inkPatC.get(key); if(p)return p;
if(inkPatC.size>40)inkPatC.clear();
const S=64,t=document.createElement("canvas"); t.width=t.height=S; const x=t.getContext("2d"), im=x.createImageData(S,S), [r,g,b]=inkRgb(c), rn=inkRng(kind==="crayon"?7:3), cell=kind==="crayon"?2:1, cov=kind==="crayon"?.8:.7;
for(let y=0;y<S;y+=cell)for(let xx=0;xx<S;xx+=cell){ const a=rn()<cov?Math.round(255*(.5+.5*rn())):0; for(let yy=0;yy<cell;yy++)for(let x2=0;x2<cell;x2++){ const i=((y+yy)*S+xx+x2)*4; im.data[i]=r; im.data[i+1]=g; im.data[i+2]=b; im.data[i+3]=a; } }
x.putImageData(im,0,0); p=ctx.createPattern(t,"repeat"); inkPatC.set(key,p); return p; }
function inkStamp(c,R){ R=Math.min(256,Math.max(4,Math.ceil(R/4)*4)); const key=c+"|"+R; let t=inkStC.get(key); if(t)return t;
if(inkStC.size>80)inkStC.clear();
t=document.createElement("canvas"); t.width=t.height=R*2; const x=t.getContext("2d"), g=x.createRadialGradient(R,R,0,R,R,R);
g.addColorStop(0,inkRgba(c,1)); g.addColorStop(.35,inkRgba(c,.6)); g.addColorStop(1,inkRgba(c,0)); x.fillStyle=g; x.fillRect(0,0,R*2,R*2); inkStC.set(key,t); return t; }
function inkShadowStroke(ctx,P,color,lw,blur,alpha){
const OFF=ctx.canvas.width+lw+blur*2+120; ctx.save(); ctx.translate(-OFF,0); ctx.shadowColor=color; ctx.shadowBlur=blur; ctx.shadowOffsetX=OFF; ctx.shadowOffsetY=0;
ctx.strokeStyle=color; ctx.globalAlpha=alpha; ctx.lineWidth=lw; ctx.lineCap="round"; ctx.lineJoin="round"; inkTrace(ctx,P); ctx.stroke(); ctx.restore(); }

// ---------- วาดตามหัวปากกา ----------
function inkStroke(ctx,s,k,dx,dy){
dx=dx||0; dy=dy||0;
if(s.t==="s")return inkShapeDraw(ctx,s,k,dx,dy);
const b=s.t==="h"?"pen":(s.b||"pen"), a=s.t==="h"||s.a==null?1:s.a;
if(b==="pen"&&a>=1)return inkStroke0(ctx,s,k,dx,dy);
if(a<1&&(b==="pen"||b==="calli"||b==="brush"||b==="sketch"||b==="pencil"||b==="crayon")){
// ความทึบ < 100%: วาดเต็มทึบลงผืนชั่วคราวก่อน แล้วค่อยวางด้วยความโปร่ง (กันจุดทับซ้อนเข้มเป็นข้อ ๆ)
const bb=inkBB(s), pad=4+s.w*k*.6, X0=Math.max(0,Math.floor((bb[0]+dx)*k-pad)), Y0=Math.max(0,Math.floor((bb[1]+dy)*k-pad)), X1=Math.min(ctx.canvas.width,Math.ceil((bb[2]+dx)*k+pad)), Y1=Math.min(ctx.canvas.height,Math.ceil((bb[3]+dy)*k+pad));
if(X1<=X0||Y1<=Y0)return;
const t=document.createElement("canvas"); t.width=X1-X0; t.height=Y1-Y0; const tc=t.getContext("2d");
if(b==="pen")inkStroke0(tc,s,k,dx-X0/k,dy-Y0/k); else inkBrushDraw(tc,s,b,k,dx-X0/k,dy-Y0/k,1);
ctx.save(); ctx.globalAlpha=a; ctx.drawImage(t,X0,Y0); ctx.restore(); return; }
inkBrushDraw(ctx,s,b,k,dx,dy,a);
}
function inkBrushDraw(ctx,s,b,k,dx,dy,a){
const P=inkDev(s,k,dx,dy), n=P.length; if(!n)return; const w=s.w*k;
ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round"; ctx.strokeStyle=s.c; ctx.fillStyle=s.c;
if(n===1){
if(b==="air"||b==="blur"||b==="water"||b==="spray"){ const R=Math.max(2,w*(b==="blur"?.9:1)); ctx.globalAlpha=.55*a; ctx.drawImage(inkStamp(s.c,R),P[0][0]-R,P[0][1]-R,R*2,R*2); }
else{ ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(P[0][0],P[0][1],Math.max(.8,w/2),0,6.283); ctx.fill(); }
ctx.restore(); return; }
if(b==="calli"){
const pr=inkPrs(s), ang=-.72, ux=Math.cos(ang), uy=Math.sin(ang); ctx.globalAlpha=a; ctx.lineWidth=.6;
const hf=i=>(w/2)*(s.v?(.45+pr[i]*.9):1);
for(let i=1;i<n;i++){ const h0=hf(i-1),h1=hf(i); ctx.beginPath(); ctx.moveTo(P[i-1][0]+ux*h0,P[i-1][1]+uy*h0); ctx.lineTo(P[i][0]+ux*h1,P[i][1]+uy*h1); ctx.lineTo(P[i][0]-ux*h1,P[i][1]-uy*h1); ctx.lineTo(P[i-1][0]-ux*h0,P[i-1][1]-uy*h0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
}
else if(b==="pencil"||b==="crayon"){
ctx.strokeStyle=inkPat(ctx,s.c,b); ctx.globalAlpha=a*(b==="crayon"?.95:.9);
if(s.v){ const pr=inkPrs(s); for(let i=1;i<n;i++){ ctx.lineWidth=Math.max(.8,w*(.45+.9*(pr[i]+pr[i-1])/2)); ctx.beginPath(); ctx.moveTo(P[i-1][0],P[i-1][1]); ctx.lineTo(P[i][0],P[i][1]); ctx.stroke(); } }
else{ ctx.lineWidth=Math.max(.8,w); inkTrace(ctx,P); ctx.stroke(); }
}
else if(b==="brush"){
let Q=P; for(let r=0;r<(n>4?2:1);r++){ Q=Q.map((q,i)=>(i===0||i===Q.length-1)?q:[(Q[i-1][0]+2*q[0]+Q[i+1][0])/4,(Q[i-1][1]+2*q[1]+Q[i+1][1])/4]); }
const pr=inkPrs(s), W=Q.map((_,i)=>Math.max(.5,w*(.3+.95*pr[i])*Math.min(1,.3+.7*Math.min(i/5,(n-1-i)/7))));
const Lp=[], Rp=[];
for(let i=0;i<n;i++){ const a0=Q[Math.max(0,i-1)], a1=Q[Math.min(n-1,i+1)]; let tx=a1[0]-a0[0], ty=a1[1]-a0[1]; const l=Math.hypot(tx,ty)||1; tx/=l; ty/=l; const nx=-ty, ny=tx, h=W[i]/2; Lp.push([Q[i][0]+nx*h,Q[i][1]+ny*h]); Rp.push([Q[i][0]-nx*h,Q[i][1]-ny*h]); }
ctx.globalAlpha=a; ctx.beginPath(); ctx.moveTo(Lp[0][0],Lp[0][1]); for(let i=1;i<n;i++)ctx.lineTo(Lp[i][0],Lp[i][1]); for(let i=n-1;i>=0;i--)ctx.lineTo(Rp[i][0],Rp[i][1]); ctx.closePath(); ctx.fill();
ctx.lineWidth=.7; ctx.stroke();
ctx.beginPath(); ctx.arc(Q[0][0],Q[0][1],W[0]/2,0,6.283); ctx.arc(Q[n-1][0],Q[n-1][1],W[n-1]/2,0,6.283); ctx.fill();
}
else if(b==="air"){
const R=Math.max(3,w), st=Math.max(1.2,R*.13), pr=s.v?inkPrs(s):null;
inkWalk(P,st,(x,y,t)=>{ const q=pr?pr[Math.min(n-1,Math.round(t))]:.75; ctx.globalAlpha=Math.min(1,.17*a*(.35+.9*q)); ctx.drawImage(inkStamp(s.c,R),x-R,y-R,R*2,R*2); });
}
else if(b==="spray"){
const rn=inkRng(inkSeed(s)), R=Math.max(3,w*.6), st=Math.max(1,w*.2), m=Math.min(28,Math.ceil(3+w*.28)), ds=Math.max(.9,k*.9);
ctx.globalAlpha=.75*a;
inkWalk(P,st,(x,y)=>{ for(let j=0;j<m;j++){ const r=Math.sqrt(rn())*R, th=rn()*6.283; ctx.fillRect(x+Math.cos(th)*r,y+Math.sin(th)*r,ds,ds); } });
}
else if(b==="blur"){
inkShadowStroke(ctx,P,s.c,Math.max(1,w*.5),Math.max(2,w*.95),.95*a); inkShadowStroke(ctx,P,s.c,Math.max(1,w*.5),Math.max(2,w*.95),.7*a);
}
else if(b==="water"){
inkShadowStroke(ctx,P,s.c,Math.max(1,w),Math.max(2,w*.5),.34*a);
ctx.globalAlpha=.2*a; ctx.lineWidth=Math.max(1,w*.78); inkTrace(ctx,P); ctx.stroke();
}
else if(b==="sketch"){
const amp=Math.max(.7,w*.5);
for(let j=0;j<3;j++){ const rn=inkRng(inkSeed(s)+j*977); let jx=0,jy=0; const Q=P.map(q=>{ jx=Math.max(-amp,Math.min(amp,jx+(rn()-.5)*amp*.9)); jy=Math.max(-amp,Math.min(amp,jy+(rn()-.5)*amp*.9)); return [q[0]+jx,q[1]+jy]; });
ctx.globalAlpha=a*(j===0?.85:.5); ctx.lineWidth=Math.max(.7,w*(j===0?.38:.3)); inkTrace(ctx,Q); ctx.stroke(); }
}
else{ ctx.restore(); return inkStroke0(ctx,s,k,dx,dy); }
ctx.restore();
}

// ---------- รูปทรง ----------
function inkFit(U,L,T,Rr,B){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; U.forEach(q=>{ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); }); const sx=(Rr-L)/((x1-x0)||1), sy=(B-T)/((y1-y0)||1); return U.map(q=>[L+(q[0]-x0)*sx,T+(q[1]-y0)*sy]); }
const inkNgon=(n,a0)=>{ const o=[]; for(let i=0;i<=n;i++){ const t=a0+i*6.283185/n; o.push([Math.cos(t),Math.sin(t)]); } return o; };
// คืน {lines:[polyline,…], closed} พิกัดหน้ากระดาน
function inkShapePolys(s,N){
const g=inkShapePolys0(s,N), r=s.r;
if(!r||s.sh==="line"||s.sh==="arrow"||s.sh==="darrow")return g;
const cx=(s.p[0]+s.p[3])/2, cy=(s.p[1]+s.p[4])/2, co=Math.cos(r), si=Math.sin(r);
return {closed:g.closed,lines:g.lines.map(L=>L.map(q=>[cx+(q[0]-cx)*co-(q[1]-cy)*si,cy+(q[0]-cx)*si+(q[1]-cy)*co]))};
}
function inkShapeFlat(s){ const o=[]; inkShapePolys(s,32).lines.forEach(L=>L.forEach(q=>o.push(q[0],q[1],0))); return o; }
function inkShapePolys0(s,N){
const p=s.p, x0=p[0],y0=p[1],x1=p[3],y1=p[4], L=Math.min(x0,x1),Rr=Math.max(x0,x1),T=Math.min(y0,y1),B=Math.max(y0,y1), cx=(L+Rr)/2, cy=(T+B)/2, W=Rr-L, H=B-T;
switch(s.sh){
case "line":return {lines:[[[x0,y0],[x1,y1]]],closed:false};
case "arrow":case "darrow":{ const len=Math.hypot(x1-x0,y1-y0)||1, hl=Math.min(len*.5,Math.max(14,s.w*4.5)), an=Math.atan2(y1-y0,x1-x0), hd=(tx,ty,a)=>[[tx-hl*Math.cos(a-.45),ty-hl*Math.sin(a-.45)],[tx,ty],[tx-hl*Math.cos(a+.45),ty-hl*Math.sin(a+.45)]];
const ls=[[[x0,y0],[x1,y1]],hd(x1,y1,an)]; if(s.sh==="darrow")ls.push(hd(x0,y0,an+Math.PI)); return {lines:ls,closed:false}; }
case "rect":return {lines:[[[L,T],[Rr,T],[Rr,B],[L,B],[L,T]]],closed:true};
case "rrect":{ const r=Math.min(W,H)*.22, o=[], arc=(ccx,ccy,a0)=>{ for(let i=0;i<=6;i++){ const a=a0+i*Math.PI/12; o.push([ccx+r*Math.cos(a),ccy+r*Math.sin(a)]); } };
arc(Rr-r,T+r,-Math.PI/2); arc(Rr-r,B-r,0); arc(L+r,B-r,Math.PI/2); arc(L+r,T+r,Math.PI); o.push(o[0]); return {lines:[o],closed:true}; }
case "ellipse":{ const o=[]; for(let i=0;i<=N;i++){ const t=i*6.283185/N; o.push([cx+W/2*Math.cos(t),cy+H/2*Math.sin(t)]); } return {lines:[o],closed:true}; }
case "triangle":return {lines:[[[cx,T],[Rr,B],[L,B],[cx,T]]],closed:true};
case "diamond":return {lines:[[[cx,T],[Rr,cy],[cx,B],[L,cy],[cx,T]]],closed:true};
case "pentagon":return {lines:[inkFit(inkNgon(5,-Math.PI/2),L,T,Rr,B)],closed:true};
case "hexagon":return {lines:[inkFit(inkNgon(6,0),L,T,Rr,B)],closed:true};
case "star":{ const U=[]; for(let i=0;i<=10;i++){ const t=-Math.PI/2+i*Math.PI/5, r=i%2?.42:1; U.push([r*Math.cos(t),r*Math.sin(t)]); } return {lines:[inkFit(U,L,T,Rr,B)],closed:true}; }
case "heart":{ const U=[]; for(let i=0;i<=48;i++){ const t=i*6.283185/48; U.push([16*Math.pow(Math.sin(t),3),-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))]); } return {lines:[inkFit(U,L,T,Rr,B)],closed:true}; }
case "plus":{ const a=.33,b=.67,U=[[a,0],[b,0],[b,a],[1,a],[1,b],[b,b],[b,1],[a,1],[a,b],[0,b],[0,a],[a,a],[a,0]]; return {lines:[inkFit(U,L,T,Rr,B)],closed:true}; }
}
return {lines:[[[x0,y0],[x1,y1]]],closed:false};
}
function inkShapeDraw(ctx,s,k,dx,dy){
const p=s.p; if(p.length<6)return;
const N=Math.max(24,Math.min(240,Math.ceil((Math.abs(p[3]-p[0])+Math.abs(p[4]-p[1]))*k/7))), g=inkShapePolys(s,N), a=s.a==null?1:s.a;
const tr=poly=>{ poly.forEach((q,i)=>i?ctx.lineTo((q[0]+dx)*k,(q[1]+dy)*k):ctx.moveTo((q[0]+dx)*k,(q[1]+dy)*k)); };
ctx.save(); ctx.lineJoin="round"; ctx.lineCap=s.d?"butt":"round"; ctx.strokeStyle=s.c; ctx.fillStyle=s.c; ctx.lineWidth=Math.max(.8,s.w*k);
if(g.closed&&s.f){ ctx.globalAlpha=a*(s.f===2?1:.2); ctx.beginPath(); tr(g.lines[0]); ctx.closePath(); ctx.fill(); }
ctx.globalAlpha=a; if(s.d)ctx.setLineDash([Math.max(3,s.w*2.6)*k,Math.max(3,s.w*2)*k]);
ctx.beginPath(); tr(g.lines[0]); if(g.closed)ctx.closePath(); ctx.stroke();
ctx.setLineDash([]); ctx.lineCap="round"; for(let i=1;i<g.lines.length;i++){ ctx.beginPath(); tr(g.lines[i]); ctx.stroke(); }
ctx.restore();
}
function inkShapeHit(s,x,y,r){
const g=inkShapePolys(s,40), rr=r+s.w/2;
for(const L of g.lines)for(let i=1;i<L.length;i++)if(inkSegDist(x,y,L[i-1][0],L[i-1][1],L[i][0],L[i][1])<=rr)return true;
return !!(g.closed&&s.f&&inkInPoly(g.lines[0],x,y));
}
function inkShapeConstrain(s,force){
if(!(ink.lock||force))return; const p=s.p, dx=p[3]-p[0], dy=p[4]-p[1];
if(s.sh==="line"||s.sh==="arrow"||s.sh==="darrow"){ const len=Math.hypot(dx,dy), an=Math.round(Math.atan2(dy,dx)/(Math.PI/12))*(Math.PI/12); p[3]=+(p[0]+len*Math.cos(an)).toFixed(1); p[4]=+(p[1]+len*Math.sin(an)).toFixed(1); }
else{ const m=Math.max(Math.abs(dx),Math.abs(dy)); p[3]=+(p[0]+(dx<0?-m:m)).toFixed(1); p[4]=+(p[1]+(dy<0?-m:m)).toFixed(1); }
}
function inkShapeFinish(s){ const p=s.p; if(Math.abs(p[3]-p[0])<6&&Math.abs(p[4]-p[1])<6){ const line=s.sh==="line"||s.sh==="arrow"||s.sh==="darrow"; p[3]=+(p[0]+140).toFixed(1); p[4]=+(p[1]+(line?0:120)).toFixed(1); } }

// ---------- แถบเครื่องมือ + เมนูลอย ----------
function inkSizesHtml(){
const t=ink.tool; if(!["pen","shape","hl","eraser"].includes(t))return "";
const key=inkSizeKey(), v=ink.size[key], rg={pen:[1,60],shape:[1,40],hl:[4,70],eraser:[4,90]}[key]; let h="";
if(t==="pen"){ const b=INK_BRUSHES.find(x=>x.k===ink.brush)||INK_BRUSHES[0]; h+=`<button type="button" class="ink-opt ink-bb" id="ink-brushb" title="เปลี่ยนหัวปากกา (ดินสอ พู่กัน สเปรย์ ฯลฯ)">🖌 ${esc(b.n)} ▾</button>`; }
if(t==="shape"){ const b=INK_SHAPES.find(x=>x[0]===ink.shape)||INK_SHAPES[0]; h+=`<button type="button" class="ink-opt ink-bb" id="ink-shapeb" title="เลือกรูปทรง">◇ ${esc(b[1])} ▾</button>`; }
h+=`<span class="ink-szw" title="ปรับขนาด"><i class="ink-szd" id="ink-szd" style="${inkDotStyle(v)}"></i><input type="range" id="ink-sz" min="${rg[0]}" max="${rg[1]}" step="0.5" value="${v}" aria-label="ขนาดเส้น"><b id="ink-szv">${v}</b></span>`;
return h;
}
const inkDotStyle=v=>{ const d=Math.max(3,Math.min(24,v)); return `width:${d}px;height:${d}px`; };
function inkPrevCanvas(draw){ const c=document.createElement("canvas"); c.width=240; c.height=88; const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,240,88); draw(x); return c; }
function inkBrushMenu(a){
inkPop(`<div class="ink-ph">หัวปากกา</div><div class="ink-bgrid">${INK_BRUSHES.map(b=>`<button type="button" class="ink-bc${ink.brush===b.k?" on":""}" data-ibrush="${b.k}"><canvas width="240" height="88" data-bprev="${b.k}"></canvas><span>${esc(b.n)}</span></button>`).join("")}</div>
<div class="ink-ph">ความทึบ <b id="ink-alv">${Math.round(ink.alpha*100)}%</b></div><input type="range" id="ink-al" class="ink-wide" min="10" max="100" step="5" value="${Math.round(ink.alpha*100)}" aria-label="ความทึบ">
<div class="ink-row" style="margin-top:8px"><button type="button" class="ink-opt${ink.snap?" on":""}" data-isnap="1" title="วาดวงกลม/สี่เหลี่ยม/สามเหลี่ยม/เส้นตรง แล้วค้างปากกาไว้ปลายเส้น ระบบจะจัดให้เป็นรูปเป๊ะ">✨ ค้างปากกาท้ายเส้น = จัดเป็นรูปทรง</button></div>
<div class="hint" style="margin:8px 0 0;font-size:12px;max-width:300px">เลือกหัวปากกาแล้วปรับขนาดที่แถบสไลเดอร์ · ขนาดและหัวปากกาถูกจำไว้ให้ครั้งต่อไป</div>`,a);
document.querySelectorAll("#ink-pop [data-bprev]").forEach(cv=>{ const b=INK_BRUSHES.find(x=>x.k===cv.dataset.bprev), x=cv.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,240,88);
const p=[]; for(let i=0;i<=26;i++){ const t=i/26; p.push(14+t*92,22+Math.sin(t*6.283)*12,+(.25+.75*Math.sin(t*3.1416)).toFixed(2)); }
inkStroke(x,{t:"p",b:b.k,c:"#1d1d1f",w:Math.min(b.w,b.k==="air"||b.k==="spray"||b.k==="water"?13:b.k==="blur"?9:8),v:1,p},2,0,0); });
}
function inkShapeMenu(a){
inkPop(`<div class="ink-ph">รูปทรง</div><div class="ink-bgrid sh">${INK_SHAPES.map(([k,n])=>`<button type="button" class="ink-bc${ink.shape===k?" on":""}" data-ishape="${k}"><canvas width="120" height="88" data-sprev="${k}"></canvas><span>${esc(n)}</span></button>`).join("")}</div>
<div class="ink-ph">การเติมสี</div><div class="ink-row">${[[0,"ไม่เติม"],[1,"เติมโปร่ง"],[2,"เติมทึบ"]].map(([v,l])=>`<button type="button" class="ink-opt${ink.fill===v?" on":""}" data-ifill="${v}">${l}</button>`).join("")}</div>
<div class="ink-ph">ลักษณะเส้น</div><div class="ink-row"><button type="button" class="ink-opt${ink.dash?" on":""}" data-idash="1">เส้นประ</button><button type="button" class="ink-opt${ink.lock?" on":""}" data-ilock="1">ล็อกสัดส่วน / มุม 15°</button></div>
<div class="ink-ph">ความทึบ <b id="ink-alv">${Math.round(ink.alpha*100)}%</b></div><input type="range" id="ink-al" class="ink-wide" min="10" max="100" step="5" value="${Math.round(ink.alpha*100)}" aria-label="ความทึบ">
<div class="hint" style="margin:8px 0 0;font-size:12px;max-width:300px">ลากเพื่อวาดรูปทรง (แตะเฉยๆ = วางรูปขนาดมาตรฐาน) · ใช้ “เลือก/ย้าย” แล้วแตะรูปเพื่อย้าย · ลากจุดกลมมุมขวาล่างเพื่อย่อ/ขยาย · ลากจุดน้ำเงินด้านบนเพื่อหมุน</div>`,a);
document.querySelectorAll("#ink-pop [data-sprev]").forEach(cv=>{ const x=cv.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,120,88);
inkStroke(x,{t:"s",sh:cv.dataset.sprev,c:"#1d1d1f",w:3,f:ink.fill,d:ink.dash,p:[24,16,0,96,70,0]},1,0,0); });
}
(function inkBrushWire(){
const dlg=el("inkdlg"); if(!dlg)return;
dlg.addEventListener("click",e=>{
const b=e.target.closest("button"); if(!b)return;
if(b.id==="ink-brushb"){ const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-ibrush]")){ inkClosePop(); return; } e.stopPropagation(); inkBrushMenu(b); return; }
if(b.id==="ink-shapeb"){ const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-ishape]")){ inkClosePop(); return; } e.stopPropagation(); inkShapeMenu(b); return; }
if(b.dataset.ibrush){ ink.brush=b.dataset.ibrush; ink.size.pen=(INK_BRUSHES.find(x=>x.k===ink.brush)||{}).w||3.5; inkSetSave(); inkClosePop(); inkToolbar(); return; }
if(b.dataset.isnap){ ink.snap=ink.snap?0:1; inkSetSave(); inkBrushMenu(el("ink-brushb")||b); return; }
if(b.dataset.ishape){ ink.shape=b.dataset.ishape; inkSetSave(); inkClosePop(); inkToolbar(); return; }
if(b.dataset.ifill!=null&&b.dataset.ifill!==""){ ink.fill=+b.dataset.ifill; inkSetSave(); inkShapeMenu(el("ink-shapeb")||b); return; }
if(b.dataset.idash){ ink.dash=ink.dash?0:1; inkSetSave(); inkShapeMenu(el("ink-shapeb")||b); return; }
if(b.dataset.ilock){ ink.lock=ink.lock?0:1; inkSetSave(); inkShapeMenu(el("ink-shapeb")||b); return; }
});
dlg.addEventListener("input",e=>{
const t=e.target;
if(t.id==="ink-sz"){ const v=+t.value; ink.size[inkSizeKey()]=v; el("ink-szv").textContent=v; el("ink-szd").style.cssText=inkDotStyle(v); inkSetSave(); }
else if(t.id==="ink-al"){ ink.alpha=+t.value/100; el("ink-alv").textContent=Math.round(t.value)+"%"; inkSetSave(); }
});
})();

// ---------- หมุนรูปที่เลือก ----------
function inkRotated(s,cx,cy,th){
const co=Math.cos(th), si=Math.sin(th), R=(x,y)=>[cx+(x-cx)*co-(y-cy)*si,cy+(x-cx)*si+(y-cy)*co];
if(s.t==="s"&&s.sh!=="line"&&s.sh!=="arrow"&&s.sh!=="darrow"){
const mx=(s.p[0]+s.p[3])/2, my=(s.p[1]+s.p[4])/2, [nx,ny]=R(mx,my), r=(((s.r||0)+th)%6.283185307+6.283185307)%6.283185307;
const o={...s,p:[+(nx+s.p[0]-mx).toFixed(1),+(ny+s.p[1]-my).toFixed(1),0,+(nx+s.p[3]-mx).toFixed(1),+(ny+s.p[4]-my).toFixed(1),0]}; if(r>.001&&r<6.282)o.r=+r.toFixed(4); else delete o.r; return o; }
const p=s.p.slice(); for(let i=0;i<p.length;i+=3){ const q=R(p[i],p[i+1]); p[i]=+q[0].toFixed(1); p[i+1]=+q[1].toFixed(1); }
return {...s,p};
}

// ---------- จัดเส้นที่วาดมือให้เป็นรูปทรง (เส้นตรง · วงกลม/วงรี · สี่เหลี่ยม · สามเหลี่ยม) ----------
function inkObb(Q){
const fit=th=>{ const c=Math.cos(th), s=Math.sin(th); let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const q of Q){ const x=q[0]*c+q[1]*s, y=-q[0]*s+q[1]*c; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } return {th,w:x1-x0,h:y1-y0,area:(x1-x0)*(y1-y0),mx:(x0+x1)/2,my:(y0+y1)/2}; };
let best=null; for(let a=-45;a<45;a+=3){ const f=fit(a*Math.PI/180); if(!best||f.area<best.area)best=f; }
for(let a=best.th*180/Math.PI-3;a<=best.th*180/Math.PI+3;a+=.5){ const f=fit(a*Math.PI/180); if(f.area<best.area)best=f; }
const c=Math.cos(best.th), s=Math.sin(best.th); best.cx=best.mx*c-best.my*s; best.cy=best.mx*s+best.my*c; return best;
}
function inkDP(P,eps){ const keep=new Array(P.length).fill(false); keep[0]=keep[P.length-1]=true;
(function rec(a,b){ let m=-1,d=0; for(let i=a+1;i<b;i++){ const x=inkSegDist(P[i][0],P[i][1],P[a][0],P[a][1],P[b][0],P[b][1]); if(x>d){ d=x; m=i; } } if(m>=0&&d>eps){ keep[m]=true; rec(a,m); rec(m,b); } })(0,P.length-1);
return P.filter((_,i)=>keep[i]); }
function inkRecog(s){
const p=s.p, n=Math.floor(p.length/3); if(n<8)return null;
let P=[]; for(let i=0;i<n;i++)P.push([p[i*3],p[i*3+1]]);
let len=0; for(let i=1;i<n;i++)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); if(len<60)return null;
const A=P[0], B=P[n-1], gap=Math.hypot(B[0]-A[0],B[1]-A[1]);
if(gap>.2*len){
 if(gap<.85*len)return null;
 let dev=0; for(const q of P)dev=Math.max(dev,inkSegDist(q[0],q[1],A[0],A[1],B[0],B[1])); if(dev>.07*gap)return null;
 let x1=B[0], y1=B[1]; const ang=Math.atan2(B[1]-A[1],B[0]-A[0]), g=Math.round(ang/(Math.PI/12))*(Math.PI/12); if(Math.abs(ang-g)<.07){ x1=A[0]+gap*Math.cos(g); y1=A[1]+gap*Math.sin(g); }
 return {sh:"line",p:[+A[0].toFixed(1),+A[1].toFixed(1),0,+x1.toFixed(1),+y1.toFixed(1),0]}; }
// รูปปิด
if(P.length>160){ const st=P.length/160; P=Array.from({length:160},(_,i)=>P[Math.floor(i*st)]); }
const ob=inkObb(P); if(ob.w<24||ob.h<24)return null;
const diag=Math.hypot(ob.w,ob.h);
// จำนวนมุม
const dp=inkDP(P.concat([P[0]]),.045*diag); let V=dp.slice(0,-1);
for(let it=0;it<3&&V.length>3;it++){ const keep=V.filter((v,i)=>{ const a=V[(i+V.length-1)%V.length], b=V[(i+1)%V.length]; const t=Math.abs(Math.atan2((v[0]-a[0])*(b[1]-v[1])-(v[1]-a[1])*(b[0]-v[0]),(v[0]-a[0])*(b[0]-v[0])+(v[1]-a[1])*(b[1]-v[1]))); return t>.5; }); if(keep.length===V.length)break; V=keep; }
// สามเหลี่ยม
if(V.length===3){
 let bi=0,bl=0; for(let i=0;i<3;i++){ const a=V[i], b=V[(i+1)%3], l=Math.hypot(b[0]-a[0],b[1]-a[1]); if(l>bl){ bl=l; bi=i; } }
 const a=V[bi], b=V[(bi+1)%3], ap=V[(bi+2)%3], mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=(b[0]-a[0])/bl, dy=(b[1]-a[1])/bl;
 let nx=-dy, ny=dx; if((ap[0]-mx)*nx+(ap[1]-my)*ny<0){ nx=-nx; ny=-ny; } const h=(ap[0]-mx)*nx+(ap[1]-my)*ny; if(h<20)return null;
 let r=Math.atan2(nx,-ny); const g=Math.round(r/(Math.PI/12))*(Math.PI/12); if(Math.abs(r-g)<.1)r=g;
 const cx=mx+nx*h/2, cy=my+ny*h/2; return {sh:"triangle",p:[+(cx-bl/2).toFixed(1),+(cy-h/2).toFixed(1),0,+(cx+bl/2).toFixed(1),+(cy+h/2).toFixed(1),0],r:r%6.283185||0}; }
// วงรี / สี่เหลี่ยม
const co=Math.cos(ob.th), si=Math.sin(ob.th), hw=ob.w/2, hh=ob.h/2; let e=0, rs=0;
for(const q of P){ const x=(q[0]-ob.cx)*co+(q[1]-ob.cy)*si, y=-(q[0]-ob.cx)*si+(q[1]-ob.cy)*co; e+=Math.abs(Math.hypot(x/hw,y/hh)-1); rs+=Math.min(hw-Math.abs(x),hh-Math.abs(y))/((hw+hh)/2); }
e/=P.length; rs=Math.abs(rs)/P.length;
let sh=null; if(V.length===4&&rs<.085&&rs<e)sh="rect"; else if(e<.1&&e<rs)sh="ellipse"; else if(rs<.06)sh="rect";
if(!sh)return null;
let w=ob.w,h=ob.h,th=ob.th; if(Math.abs(th)<.09)th=0;
if(Math.abs(w-h)/Math.max(w,h)<.09){ w=h=(w+h)/2; if(sh==="ellipse")th=0; }
return {sh,p:[+(ob.cx-w/2).toFixed(1),+(ob.cy-h/2).toFixed(1),0,+(ob.cx+w/2).toFixed(1),+(ob.cy+h/2).toFixed(1),0],r:th};
}
function inkToShapeStroke(s){
const g=inkRecog(s); if(!g)return null;
const soft=["air","spray","blur","water"].includes(s.b||"pen");
const o={t:"s",sh:g.sh,c:s.c,w:soft?Math.min(s.w,5):s.w,p:g.p}; if(g.r){ const r=((g.r%6.283185307)+6.283185307)%6.283185307; if(r>.001&&r<6.282)o.r=+r.toFixed(4); } if(s.a!=null&&s.a<1)o.a=s.a; return o;
}
function inkSelToShape(){
if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx; let n=0;
const next=pg.strokes.map((s,i)=>{ if(!idx.has(i)||s.t!=="p")return s; const o=inkToShapeStroke(s); if(o){ n++; return o; } return s; });
if(!n){ inkStatus("ไม่พบรูปทรงที่จัดได้ — ลองวาดให้เป็นรูปปิดหรือเส้นตรงที่ชัดขึ้น","bad"); setTimeout(()=>inkStatus("",""),2600); return; }
ink.sel={idx,box:inkBBox(next,idx)}; inkCommit(next,true); inkStatus("จัดเป็นรูปทรงแล้ว "+n+" รูป","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("บันทึกแล้ว ✓","ok"); },2200);
}
// ค้างปากกาท้ายเส้นประมาณ 0.7 วินาที = จัดเป็นรูปทรงทันที (ลากต่อได้ถ้าเป็นเส้นตรง)
function inkHoldArm(e){
const d=ink.drag; if(!d||d.mode!=="draw"||d.snap||d.s.t!=="p"||!ink.snap||ink.tool!=="pen")return;
const px=inkPx(), cx=e.clientX, cy=e.clientY;
if(d.hx==null||Math.hypot(cx-d.hx,cy-d.hy)>4){ d.hx=cx; d.hy=cy; clearTimeout(d.holdT); d.holdT=setTimeout(()=>{
 if(ink.drag!==d||d.snap)return; const o=inkToShapeStroke(d.s); if(!o)return;
 d.s=o; d.snap=true; d.inc=false; d.reg=null; inkOverClear(); try{ navigator.vibrate&&navigator.vibrate(12); }catch(er){} inkLiveStroke(); },800); }
}
