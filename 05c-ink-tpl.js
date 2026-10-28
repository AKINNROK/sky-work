// ===== เทมเพลทสำเร็จรูปสำหรับสมุดเขียนมือ (Planner รายวัน/สัปดาห์/เดือน/ปี + แบบฟอร์มทำงาน) =====
// วาดด้วยโค้ดลงบนหน้ากระดาน 1000×1414 — ใช้ได้ทั้งหน้าจอ, PDF และรูปตัวอย่าง ไม่ต้องเก็บไฟล์รูป
// ข้อมูลเทมเพลทของแต่ละหน้า = {k:"month", y:2026, m:9 (0=ม.ค.), d:30} เก็บใน note.ptpl[pageId]
const INK_TPLS=[
{k:"day",n:"แผนรายวัน",g:"Planner",d:"ตารางเวลา 06–21 น. · 3 สิ่งสำคัญ · To-Do · โน้ต",need:"date"},
{k:"week",n:"แผนรายสัปดาห์",g:"Planner",d:"7 วัน จันทร์–อาทิตย์ + เป้าหมายสัปดาห์",need:"date"},
{k:"month",n:"แผนรายเดือน",g:"Planner",d:"ปฏิทินเดือน + เป้าหมาย + งานสำคัญ",need:"month"},
{k:"year",n:"ปฏิทินรายปี",g:"Planner",d:"ครบ 12 เดือนในหน้าเดียว",need:"year"},
{k:"habit",n:"Habit Tracker",g:"Planner",d:"ติดตามนิสัย/กิจวัตรรายวันตลอดเดือน",need:"month"},
{k:"todo",n:"To-Do List",g:"แบบฟอร์มทำงาน",d:"รายการงาน ความสำคัญ กำหนดส่ง ผู้รับผิดชอบ",need:""},
{k:"meeting",n:"บันทึกการประชุม",g:"แบบฟอร์มทำงาน",d:"วาระ มติ และ Action Items",need:""},
{k:"cornell",n:"Cornell Notes",g:"แบบฟอร์มทำงาน",d:"จดเลคเชอร์/อบรม: คำสำคัญ · บันทึก · สรุป",need:""},
{k:"eisen",n:"Eisenhower Matrix",g:"แบบฟอร์มทำงาน",d:"จัดงานตามด่วน/สำคัญ (เหมือนหน้า Matrix)",need:""},
{k:"project",n:"แผนโครงการ",g:"แบบฟอร์มทำงาน",d:"ขั้นตอน ผู้รับผิดชอบ ไทม์ไลน์ 12 เดือน ความเสี่ยง",need:""}];
const INK_TPLN=k=>((INK_TPLS.find(x=>x.k===k)||{}).n)||k;

function inkTplDraw(ctx,k,t){
const C={ink:"#33414a",mut:"#8a96a0",line:"#d3d9de",acc:"#2f7a8c",soft:"#e8f2f4",red:"#d1495b",wk:"#f6f1ee"};
const X=v=>v*k;
const T=(s,x,y,sz,o)=>{ o=o||{}; ctx.font=`${o.w||400} ${sz*k}px ${o.f||"Sarabun"}, "Noto Sans Thai", sans-serif`; ctx.fillStyle=o.c||C.ink; ctx.textAlign=o.a||"left"; ctx.textBaseline="middle"; ctx.fillText(String(s),X(x),X(y)); };
const L=(x1,y1,x2,y2,c,w,dash)=>{ ctx.beginPath(); ctx.strokeStyle=c||C.line; ctx.lineWidth=Math.max(1,(w||1.2)*k); ctx.setLineDash(dash?dash.map(v=>v*k):[]); ctx.moveTo(X(x1),X(y1)); ctx.lineTo(X(x2),X(y2)); ctx.stroke(); ctx.setLineDash([]); };
const R=(x,y,w,h,o)=>{ o=o||{}; const r=X(o.r==null?10:o.r); ctx.beginPath(); ctx.roundRect?ctx.roundRect(X(x),X(y),X(w),X(h),r):ctx.rect(X(x),X(y),X(w),X(h)); if(o.f){ctx.fillStyle=o.f;ctx.fill();} if(o.s!==null){ctx.strokeStyle=o.s||C.line;ctx.lineWidth=Math.max(1,(o.lw||1.4)*k);ctx.stroke();} };
const CB=(x,y,s)=>R(x,y-s/2,s,s,{r:4,s:"#9aa6af",lw:1.4});
const LINES=(x1,x2,y,n,h)=>{ for(let i=0;i<n;i++)L(x1,y+i*h,x2,y+i*h); };
const SEC=(s,x,y,w)=>{ T(s,x,y,19,{w:600,c:C.acc,f:"Mitr"}); if(w)L(x,y+17,x+w,y+17,C.acc,1.6); };
const HEAD=(title,sub)=>{ T(title,50,66,40,{w:500,f:"Mitr",c:C.acc}); L(50,100,130,100,C.acc,4); if(sub)T(sub,950,70,23,{a:"right",c:C.mut}); };
const d0=(t.y!=null)?new Date(t.y,t.m||0,t.d||1):null;
const mn=m=>MTHFULL[m], dw=i=>DOWFULL[i];
const byear=y=>y+543;
// ----- ปฏิทินเดือน (ใช้ซ้ำใน month / year) -----
const monthCells=(y,m)=>{ const first=new Date(y,m,1).getDay(), dim=new Date(y,m+1,0).getDate(), pdim=new Date(y,m,0).getDate(); const a=[]; for(let i=0;i<42;i++){ const n=i-first+1; a.push(n<1?{n:pdim+n,o:1}:n>dim?{n:n-dim,o:1}:{n}); } return a; };
ctx.save(); ctx.lineCap="round";
switch(t.k){
case "day":{
HEAD("แผนรายวัน",d0?`${dw(d0.getDay())} ${d0.getDate()} ${mn(d0.getMonth())} ${byear(d0.getFullYear())}`:"วันที่ ____ / ____ / ________");
SEC("ตารางเวลา",50,140,510);
for(let h=6;h<=21;h++){ const y=170+(h-6)*58; R(50,y,68,58,{r:0,f:h%2?"#fff":C.soft,s:null}); T(String(h).padStart(2,"0")+":00",84,y+17,15,{a:"center",c:C.mut}); L(50,y+58,560,y+58); L(118,y,118,y+58); L(118,y+29,560,y+29,"#e6eaed",1,[4,5]); }
L(50,170,560,170,C.acc,1.6);
SEC("บันทึกประจำวัน",50,1113,510); LINES(50,560,1175,5,48);
SEC("3 สิ่งสำคัญที่สุดวันนี้",600,140,350); for(let i=0;i<3;i++){ const y=190+i*54; T(i+1,610,y,22,{w:600,c:C.acc,f:"Mitr"}); L(640,y+20,950,y+20); }
SEC("To-Do",600,372,350); for(let i=0;i<9;i++){ const y=420+i*52; CB(604,y,24); L(640,y+22,950,y+22); }
SEC("นัดหมาย / ติดตามเรื่อง",600,892,350); LINES(600,950,945,4,55);
SEC("โน้ต",600,1113,350); LINES(600,950,1175,5,48);
break; }
case "week":{
let sub="สัปดาห์ที่ ______ เดือน __________";
let mon=null; if(d0){ mon=new Date(d0); mon.setDate(mon.getDate()-((mon.getDay()+6)%7)); const e=new Date(mon); e.setDate(e.getDate()+6); sub=`${mon.getDate()} ${MTH[mon.getMonth()]} – ${e.getDate()} ${MTH[e.getMonth()]} ${byear(e.getFullYear())}`; }
HEAD("แผนรายสัปดาห์",sub);
const names=["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์","อาทิตย์"];
for(let i=0;i<7;i++){ const y=135+i*152, we=i>=5; R(50,y,900,142,{f:we?C.wk:"#fff",s:C.line,r:12}); R(50,y,130,142,{f:we?"#efe4de":C.soft,s:C.line,r:12});
T(names[i],115,y+40,23,{a:"center",w:600,c:we?C.red:C.acc,f:"Mitr"});
if(mon){ const dd=new Date(mon); dd.setDate(dd.getDate()+i); T(dd.getDate()+" "+MTH[dd.getMonth()],115,y+82,19,{a:"center",c:C.mut}); }
for(let j=1;j<4;j++)L(200,y+j*35,935,y+j*35); }
SEC("เป้าหมายสัปดาห์นี้",50,1228,560); for(let i=0;i<3;i++){ const y=1275+i*40; CB(54,y,22); L(88,y+16,610,y+16); }
SEC("ทบทวนปลายสัปดาห์",660,1228,290); LINES(660,950,1290,3,44);
break; }
case "month":{
const has=t.y!=null;
HEAD(has?`${mn(t.m)} ${byear(t.y)}`:"แผนรายเดือน",has?"":"เดือน ____________ ปี ________");
const cw=900/7;
for(let i=0;i<7;i++){ R(50+i*cw,140,cw,40,{f:i===0?C.red:C.acc,s:null,r:i===0||i===6?10:0}); T(DOW[i]+".",50+i*cw+cw/2,160,18,{a:"center",c:"#fff",w:600}); }
const cells=has?monthCells(t.y,t.m):[];
for(let r=0;r<6;r++)for(let c=0;c<7;c++){ const x=50+c*cw, y=180+r*140; R(x,y,cw,140,{r:0,s:C.line,f:c===0||c===6?"#fbf8f6":"#fff"});
const q=cells[r*7+c]; if(q)T(q.n,x+10,y+20,q.o?15:22,{c:q.o?"#c0c8ce":(c===0?C.red:C.ink),w:q.o?400:600}); }
SEC("เป้าหมายเดือนนี้",50,1068,430); for(let i=0;i<5;i++){ const y=1115+i*52; CB(54,y,22); L(88,y+18,480,y+18); }
SEC("วันสำคัญ / Deadline",520,1068,430); LINES(520,950,1130,3,48);
SEC("โน้ต",520,1250,430); LINES(520,950,1305,2,48);
break; }
case "year":{
const has=t.y!=null;
HEAD(has?`ปฏิทินปี ${byear(t.y)}`:"ปฏิทินรายปี",has?"":"ปี ________");
const ini=["อา","จ","อ","พ","พฤ","ศ","ส"];
for(let m=0;m<12;m++){ const col=m%3, row=Math.floor(m/3), x0=50+col*300, y0=128+row*312;
T(mn(m),x0+140,y0+14,20,{a:"center",w:600,c:C.acc,f:"Mitr"}); L(x0+10,y0+34,x0+270,y0+34,C.acc,1.4);
for(let i=0;i<7;i++)T(ini[i],x0+10+i*40+20,y0+50,12.5,{a:"center",c:i===0?C.red:C.mut});
const cells=has?monthCells(t.y,m):[]; for(let r=0;r<6;r++)for(let c=0;c<7;c++){ const q=cells[r*7+c]; if(q&&!q.o)T(q.n,x0+10+c*40+20,y0+76+r*34,14.5,{a:"center",c:c===0?C.red:C.ink}); else if(!has)L(x0+18+c*40,y0+76+r*34,x0+42+c*40,y0+76+r*34,"#e6eaed",1); } }
break; }
case "habit":{
const has=t.y!=null, dim=has?new Date(t.y,t.m+1,0).getDate():31;
HEAD("Habit Tracker",has?`${mn(t.m)} ${byear(t.y)}`:"เดือน ____________");
const x0=300, cw=620/31;
R(50,140,240,34,{f:C.acc,s:null,r:8}); T("นิสัย / กิจกรรม",170,157,17,{a:"center",c:"#fff",w:600});
for(let d=1;d<=31;d++){ const x=x0+(d-1)*cw, dd=has?new Date(t.y,t.m,d):null, we=dd&&(dd.getDay()===0||dd.getDay()===6); if(d>dim){ continue; } R(x,140,cw,34,{f:we?"#efe4de":C.soft,s:null,r:0}); T(d,x+cw/2,157,13,{a:"center",c:we?C.red:C.ink}); }
for(let r=0;r<14;r++){ const y=180+r*52; R(50,y,240,52,{r:0,s:C.line}); for(let d=1;d<=dim;d++){ const x=x0+(d-1)*cw, dd=has?new Date(t.y,t.m,d):null, we=dd&&(dd.getDay()===0||dd.getDay()===6); R(x,y,cw,52,{r:0,s:"#e3e8ec",f:we?"#fbf8f6":null}); ctx.beginPath(); ctx.arc(X(x+cw/2),X(y+26),X(6.5),0,6.283); ctx.strokeStyle="#c3ccd3"; ctx.lineWidth=Math.max(1,1.3*k); ctx.stroke(); } }
SEC("ทำได้ดี / สม่ำเสมอ",50,935,280); LINES(50,330,985,4,50);
SEC("อุปสรรค",360,935,280); LINES(360,640,985,4,50);
SEC("เดือนหน้าจะปรับ",670,935,280); LINES(670,950,985,4,50);
break; }
case "todo":{
HEAD("To-Do List",d0?`${d0.getDate()} ${mn(d0.getMonth())} ${byear(d0.getFullYear())}`:"วันที่ ____ / ____ / ________");
const cols=[[50,40,""],[90,470,"งาน"],[560,110,"ความสำคัญ"],[670,130,"กำหนดส่ง"],[800,150,"ผู้รับผิดชอบ"]];
cols.forEach(([x,w,s])=>{ R(x,138,w,38,{f:C.acc,s:null,r:0}); if(s)T(s,x+w/2,157,17,{a:"center",c:"#fff",w:600}); });
for(let i=0;i<26;i++){ const y=176+i*46; cols.forEach(([x,w])=>{ L(x,y+46,x+w,y+46); }); L(90,y,90,y+46); L(560,y,560,y+46); L(670,y,670,y+46); L(800,y,800,y+46); L(950,y,950,y+46); L(50,y,50,y+46); CB(60,y+23,22); }
break; }
case "meeting":{
HEAD("บันทึกการประชุม","");
const f=[["หัวข้อ",150,50],["วัน-เวลา",195,50],["สถานที่",240,50],["ประธาน / ผู้จด",285,50],["ผู้เข้าร่วม",330,50]];
f.forEach(([s,y])=>{ T(s,50,y+12,18,{c:C.acc,w:600}); L(200,y+26,950,y+26); });
SEC("วาระ / ประเด็นที่หารือ",50,398,900); LINES(50,950,462,9,42);
SEC("มติที่ประชุม",50,862,900); LINES(50,950,925,3,44);
SEC("Action Items",50,1068,900);
const ac=[[50,40,"#"],[90,450,"งานที่ต้องทำ"],[540,190,"ผู้รับผิดชอบ"],[730,130,"กำหนด"],[860,90,"เสร็จ"]];
ac.forEach(([x,w,s])=>{ R(x,1095,w,36,{f:C.soft,s:C.line,r:0}); T(s,x+w/2,1113,16,{a:"center",c:C.acc,w:600}); });
for(let i=0;i<6;i++){ const y=1131+i*42; ac.forEach(([x,w])=>R(x,y,w,42,{r:0,s:C.line})); T(i+1,70,y+21,15,{a:"center",c:C.mut}); CB(893,y+21,20); }
break; }
case "cornell":{
HEAD("Cornell Notes","หัวข้อ ____________________ วันที่ ________");
R(50,138,250,38,{f:C.soft,s:null,r:0}); T("คำสำคัญ / คำถาม",175,157,17,{a:"center",c:C.acc,w:600});
R(300,138,650,38,{f:C.acc,s:null,r:0}); T("บันทึก",625,157,17,{a:"center",c:"#fff",w:600});
L(300,176,300,1110,C.acc,1.8); LINES(300,950,222,22,41); L(50,1110,950,1110,C.acc,1.8);
SEC("สรุป",50,1140,900); LINES(50,950,1205,4,44);
break; }
case "eisen":{
HEAD("Eisenhower Matrix","จัดลำดับงานตามความด่วน / ความสำคัญ");
const qx=[110,530], qy=[200,775], qw=420, qh=565;
T("ด่วน",qx[0]+qw/2,172,21,{a:"center",w:600,c:C.red,f:"Mitr"}); T("ไม่ด่วน",qx[1]+qw/2,172,21,{a:"center",w:600,c:C.mut,f:"Mitr"});
[["สำคัญ",qy[0]],["ไม่สำคัญ",qy[1]]].forEach(([s,y])=>{ ctx.save(); ctx.translate(X(78),X(y+qh/2)); ctx.rotate(-Math.PI/2); ctx.font=`600 ${21*k}px Mitr, Sarabun, sans-serif`; ctx.fillStyle=s==="สำคัญ"?C.red:C.mut; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(s,0,0); ctx.restore(); });
const Q=[["1  ทำเลย","ด่วน + สำคัญ","#fde6e6",0,0],["2  วางแผน","สำคัญ ไม่ด่วน","#e3edfb",1,0],["3  มอบหมาย","ด่วน ไม่สำคัญ","#fdf3d8",0,1],["4  ตัดทิ้ง / ทำทีหลัง","ไม่ด่วน ไม่สำคัญ","#ececea",1,1]];
Q.forEach(([a,b,col,i,j])=>{ const x=qx[i], y=qy[j]; R(x,y,qw,qh,{f:col,s:"#c9d0d6",r:16}); T(a,x+18,y+30,22,{w:600,f:"Mitr",c:C.ink}); T(b,x+qw-18,y+31,15,{a:"right",c:C.mut}); for(let n=0;n<10;n++){ const yy=y+80+n*46; CB(x+20,yy,20); L(x+52,yy+14,x+qw-20,yy+14,"#c4cbd1"); } });
break; }
case "project":{
HEAD("แผนโครงการ","");
const f=[["ชื่อโครงการ",145,50,500],["ผู้รับผิดชอบ / ทีม",145,560,390],["เป้าหมาย",190,50,500],["ระยะเวลา",190,560,390],["งบประมาณ",235,50,500],["ผู้อนุมัติ",235,560,390]];
f.forEach(([s,y,x,w])=>{ T(s,x,y+12,17,{c:C.acc,w:600}); L(x+(s.length>9?135:95),y+26,x+w,y+26); });
const x0=440, cw=42;
R(50,285,260,40,{f:C.acc,s:null,r:0}); T("งาน / ขั้นตอน",180,305,17,{a:"center",c:"#fff",w:600});
R(310,285,130,40,{f:C.acc,s:null,r:0}); T("ผู้รับผิดชอบ",375,305,16,{a:"center",c:"#fff",w:600});
for(let m=0;m<12;m++){ R(x0+m*cw,285,cw,40,{f:C.acc,s:"#fff",r:0,lw:.8}); T(MTH[m],x0+m*cw+cw/2,305,13.5,{a:"center",c:"#fff"}); }
for(let r=0;r<15;r++){ const y=325+r*46; R(50,y,260,46,{r:0,s:C.line}); R(310,y,130,46,{r:0,s:C.line}); for(let m=0;m<12;m++)R(x0+m*cw,y,cw,46,{r:0,s:"#e3e8ec",f:m%2?"#fafbfb":null}); }
SEC("Milestones สำคัญ",50,1050,900); LINES(50,950,1100,3,46);
SEC("ความเสี่ยง / อุปสรรค",50,1255,430); LINES(50,480,1305,2,44);
SEC("สิ่งที่ต้องการสนับสนุน",520,1255,430); LINES(520,950,1305,2,44);
break; }
}
ctx.restore();
}

// ---------- แกลเลอรีเทมเพลท ----------
const inkTplPrev=new Map();
function inkTplPreview(key){
if(inkTplPrev.has(key))return inkTplPrev.get(key);
const w=200, k=w/INK_W, c=document.createElement("canvas"); c.width=w; c.height=Math.round(INK_H*k); const x=c.getContext("2d");
const now=new Date(), spec={k:key,y:now.getFullYear(),m:now.getMonth(),d:now.getDate()};
if(["lines","grid","dots","blank"].includes(key)){ inkPaper(x,k,"#ffffff",key); }
else{ x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); inkTplDraw(x,k,spec); }
let u=""; try{ u=c.toDataURL("image/png"); }catch(e){} inkTplPrev.set(key,u); return u;
}
const inkG={mode:"new",sel:"lines"};
function inkGallery(mode){
inkG.mode=mode||"new"; inkG.sel=mode==="add"?"day":"lines";
el("tg-h").textContent=inkG.mode==="add"?"เพิ่มหน้าจากเทมเพลท":"สมุดใหม่ — เลือกกระดาษ / เทมเพลท";
inkGalleryPaint(); el("inktpl").showModal();
if(document.fonts&&document.fonts.load){ Promise.all([document.fonts.load("500 20px Mitr"),document.fonts.load("400 20px Sarabun")]).then(()=>{ inkTplPrev.clear(); if(el("inktpl").open)inkGalleryPaint(); }).catch(()=>{}); }
}
function inkGalleryPaint(){
const sel=inkG.sel, now=new Date();
const card=(k,n,d,badge)=>`<button type="button" class="tg-c${sel===k?" on":""}" data-tg="${k}"><img src="${inkTplPreview(k)}" alt=""><b>${esc(n)}</b><small>${esc(d||"")}</small>${badge?`<em>${esc(badge)}</em>`:""}</button>`;
const quick=inkG.mode==="new"?`<div class="tg-sec">เริ่มต้นเร็ว</div><div class="tg-grid">${[["lines","เส้นบรรทัด","กระดาษมีเส้น"],["blank","กระดาษเปล่า","ว่างทั้งหน้า"],["grid","ตาราง","ช่องสี่เหลี่ยม"],["dots","จุด","กระดาษจุด"]].map(([k,n,d])=>card(k,n,d)).join("")}
<button type="button" class="tg-c${sel==="board"?" on":""}" data-tg="board"><span class="tg-board">∞</span><b>กระดานกว้าง</b><small>เขียนได้ไม่จำกัด เลื่อน/ซูมอิสระ</small></button></div>`:"";
const grp=g=>`<div class="tg-sec">${g}</div><div class="tg-grid">${INK_TPLS.filter(t=>t.g===g).map(t=>card(t.k,t.n,t.d)).join("")}${g==="Planner"?`<button type="button" class="tg-c${sel==="planner"?" on":""}" data-tg="planner"><span class="tg-board">📅</span><b>Planner ประจำปี</b><small>สร้างหลายหน้าให้อัตโนมัติ: ภาพรวมปี + 12 เดือน + รายสัปดาห์/รายวัน</small></button>`:""}</div>`;
const t=INK_TPLS.find(x=>x.k===sel); const yr=now.getFullYear();
const yopt=(v)=>[yr-1,yr,yr+1,yr+2].map(y=>`<option value="${y}"${y===v?" selected":""}>${y+543}</option>`).join("");
const mopt=(v)=>MTHFULL.map((m,i)=>`<option value="${i}"${i===v?" selected":""}>${m}</option>`).join("");
let opts="";
if(sel==="planner"){ opts=`<div class="tg-opt"><label>ปี <select id="tg-y">${yopt(yr)}</select></label>
<label>หน้ารายสัปดาห์ <select id="tg-wk"><option value="">ไม่สร้าง</option><option value="all">ทั้งปี (52 หน้า)</option>${MTHFULL.map((m,i)=>`<option value="${i}">เดือน${m}</option>`).join("")}</select></label>
<label>หน้ารายวัน <select id="tg-dy"><option value="">ไม่สร้าง</option>${MTHFULL.map((m,i)=>`<option value="${i}">ทั้งเดือน${m}</option>`).join("")}</select></label>
<label>ภาพรวมปี + 12 เดือน (สร้างเสมอ)</label></div>`; }
else if(t&&t.need){ opts=`<div class="tg-opt"><label class="chk"><input type="checkbox" id="tg-auto" checked> ใส่วันที่ให้อัตโนมัติ (ไม่ติ๊ก = เว้นว่างให้เขียนเอง)</label>
${t.need==="date"?`<label>วันที่ <input type="date" id="tg-d" value="${now.toISOString().slice(0,10)}"></label>`:""}
${t.need==="month"?`<label>เดือน <select id="tg-m">${mopt(now.getMonth())}</select></label><label>ปี <select id="tg-y">${yopt(yr)}</select></label>`:""}
${t.need==="year"?`<label>ปี <select id="tg-y">${yopt(yr)}</select></label>`:""}</div>`; }
el("tg-body").innerHTML=quick+grp("Planner")+grp("แบบฟอร์มทำงาน")+opts;
el("tg-ok").textContent=inkG.mode==="add"?"เพิ่มหน้านี้":"สร้างสมุด";
}
function inkGalleryPages(){
// คืนรายการหน้า [{k,y,m,d}|null] ตามที่เลือก
const sel=inkG.sel, auto=!el("tg-auto")||el("tg-auto").checked;
const Y=el("tg-y")?+el("tg-y").value:new Date().getFullYear();
if(sel==="planner"){
const out=[{k:"year",y:Y}]; for(let m=0;m<12;m++)out.push({k:"month",y:Y,m});
const wk=el("tg-wk").value, dy=el("tg-dy").value;
if(wk!==""){ const start=new Date(Y,wk==="all"?0:+wk,1); start.setDate(start.getDate()-((start.getDay()+6)%7)); const end=wk==="all"?new Date(Y,11,31):new Date(Y,+wk+1,0);
for(let d=new Date(start);d<=end;d.setDate(d.getDate()+7))out.push({k:"week",y:d.getFullYear(),m:d.getMonth(),d:d.getDate()}); }
if(dy!==""){ const n=new Date(Y,+dy+1,0).getDate(); for(let d=1;d<=n;d++)out.push({k:"day",y:Y,m:+dy,d}); }
return out; }
const t=INK_TPLS.find(x=>x.k===sel); if(!t)return [null];
if(!auto||!t.need)return [{k:t.k}];
if(t.need==="date"){ const v=el("tg-d").value||new Date().toISOString().slice(0,10); const [y,m,d]=v.split("-").map(Number); return [{k:t.k,y,m:m-1,d}]; }
if(t.need==="month")return [{k:t.k,y:Y,m:+el("tg-m").value}];
return [{k:t.k,y:Y}];
}
function inkGalleryTitle(pages){
const sel=inkG.sel, now=new Date();
if(sel==="planner")return "Planner "+(pages[0].y+543);
if(sel==="board")return "กระดานกว้าง";
const t=INK_TPLS.find(x=>x.k===sel); if(!t)return "";
const p=pages[0]||{}; if(p.y!=null){ if(t.need==="month")return t.n+" "+MTHFULL[p.m]+" "+(p.y+543); if(t.need==="year")return t.n+" "+(p.y+543); if(t.need==="date")return t.n+" "+p.d+" "+MTH[p.m]+" "+(p.y+543); }
return t.n;
}
(function inkTplWire(){
if(!el("inktpl"))return;
el("tg-cancel").onclick=()=>el("inktpl").close();
el("tg-body").addEventListener("click",e=>{ const b=e.target.closest("[data-tg]"); if(!b)return; inkG.sel=b.dataset.tg; inkGalleryPaint(); });
el("tg-ok").onclick=async()=>{
const sel=inkG.sel;
if(inkG.mode==="add"){
if(!ink.note||ink.board){ el("inktpl").close(); return; }
const pages=inkGalleryPages(); el("inktpl").close();
if(!pages[0]||!pages[0].k){ inkAddPage(); return; }                       // ลาย pattern ปกติ
pages.forEach((p,i)=>{ if(i===0)inkAddPage(p); else{ ink.pages.splice(ink.cur+1,0,{id:inkUid(),strokes:[],dirty:true,tpl:p}); ink.cur++; } });
ink.metaDirty=true; inkRedraw(); inkToolbar(); inkDirty(); return; }
el("inktpl").close();
if(sel==="board"){ inkNew({mode:"board"}); return; }
if(["lines","blank","grid","dots"].includes(sel)){ inkNew({mode:"page",tpl:sel}); return; }
const pages=inkGalleryPages();
inkNew({mode:"page",tpl:"lines",pages,title:inkGalleryTitle(pages)});
};
})();
