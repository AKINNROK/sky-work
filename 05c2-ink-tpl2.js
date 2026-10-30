// ===== เทมเพลทสมุดเขียนมือชุดที่ 2 (อีก 10 แบบ ไม่ซ้ำชุดแรก) — วาดด้วยโค้ดเช่นเดียวกัน =====
INK_TPLS.push(
{k:"okr",n:"OKR รายไตรมาส",g:"วางแผน & วิเคราะห์",d:"เป้าหมายหลัก + KR 4 ข้อ พร้อมแถบความคืบหน้า",need:""},
{k:"swot",n:"SWOT",g:"วางแผน & วิเคราะห์",d:"จุดแข็ง · จุดอ่อน · โอกาส · อุปสรรค + กลยุทธ์",need:""},
{k:"mind",n:"Mind Map",g:"วางแผน & วิเคราะห์",d:"แผนผังความคิด หัวข้อกลาง + 6 กิ่งหลัก",need:""},
{k:"w5h1",n:"5W1H",g:"วางแผน & วิเคราะห์",d:"What · Why · Who · When · Where · How",need:""},
{k:"fish",n:"ก้างปลา (หาสาเหตุ)",g:"วางแผน & วิเคราะห์",d:"วิเคราะห์ต้นเหตุของปัญหา 6 หมวด",need:""},
{k:"interview",n:"ใบประเมินสัมภาษณ์",g:"HR & ทีม",d:"คะแนน 1–5 ตามเกณฑ์ + สรุปผล",need:"date"},
{k:"oneone",n:"1:1 Meeting",g:"HR & ทีม",d:"คุยรายบุคคล: หัวข้อ · Feedback · Action",need:"date"},
{k:"weekrev",n:"ทบทวนสัปดาห์",g:"ติดตามผล",d:"Wins · ติดขัด · บทเรียน · 3 เรื่องสัปดาห์หน้า",need:"date"},
{k:"kanban",n:"Kanban Board",g:"ติดตามผล",d:"To Do · Doing · Review · Done",need:""},
{k:"budget",n:"ค่าใช้จ่ายรายเดือน",g:"ติดตามผล",d:"บันทึกรายจ่ายรายวัน + สรุปงบคงเหลือ",need:"month"});

function inkTplDraw2(ctx,key,t,h){
const {C,X,T,L,R,CB,LINES,SEC,HEAD,d0,mn,dw,byear,MTH}=h, k=X(1);
const dateTxt=d0?`${d0.getDate()} ${mn(d0.getMonth())} ${byear(d0.getFullYear())}`:"วันที่ ____ / ____ / ________";
const FIELD=(s,x,y,w,lw)=>{ T(s,x,y,17,{c:C.acc,w:600}); L(x+(lw||s.length*10.5+14),y+13,x+w,y+13); };
const CURVE=(x1,y1,cx1,cy1,cx2,cy2,x2,y2,col,w)=>{ ctx.beginPath(); ctx.strokeStyle=col; ctx.lineWidth=Math.max(1,w*k); ctx.moveTo(X(x1),X(y1)); ctx.bezierCurveTo(X(cx1),X(cy1),X(cx2),X(cy2),X(x2),X(y2)); ctx.stroke(); };
switch(key){
case "okr":{
HEAD("OKR รายไตรมาส","ไตรมาส ___ / ปี ________");
R(50,132,900,92,{f:C.soft,s:C.acc,r:14,lw:1.6}); T("🎯 Objective · เป้าหมายหลักของไตรมาส",70,156,19,{w:600,c:C.acc,f:"Mitr"}); L(70,205,930,205,"#b8c9ce");
for(let i=0;i<4;i++){ const y=246+i*188;
 R(50,y,900,172,{f:"#fff",s:C.line,r:14});
 R(50,y,64,172,{f:C.acc,s:null,r:14}); T("KR",82,y+60,22,{a:"center",w:600,c:"#fff",f:"Mitr"}); T(i+1,82,y+100,34,{a:"center",w:600,c:"#fff",f:"Mitr"});
 T("ตัวชี้วัด (Key Result)",132,y+26,16,{c:C.mut}); L(132,y+52,930,y+52);
 T("เริ่มต้น",132,y+78,15,{c:C.mut}); L(190,y+90,300,y+90); T("เป้าหมาย",330,y+78,15,{c:C.mut}); L(400,y+90,520,y+90); T("ตอนนี้",550,y+78,15,{c:C.mut}); L(600,y+90,710,y+90); T("ผู้รับผิดชอบ",740,y+78,15,{c:C.mut}); L(820,y+90,930,y+90);
 R(132,y+118,740,18,{f:"#eef2f4",s:C.line,r:9}); for(let p=0;p<=4;p++){ const x=132+740*p/4; L(x,y+114,x,y+142,"#9aa6af",1.2); T(p*25+"%",x,y+156,13,{a:"center",c:C.mut}); }
}
SEC("ข้อเรียนรู้ / อุปสรรค / สิ่งที่ต้องปรับ",50,1018,900); LINES(50,950,1085,6,44);
break; }
case "swot":{
HEAD("SWOT Analysis","หัวข้อ ____________________");
const B=[["S","จุดแข็ง (Strengths)","ปัจจัยภายใน · ข้อดี","#e3f4ea","#2e8b57",50,150],["W","จุดอ่อน (Weaknesses)","ปัจจัยภายใน · ข้อด้อย","#fdece4","#d9692f",510,150],["O","โอกาส (Opportunities)","ปัจจัยภายนอก · โอกาส","#e3edfb","#2f6fc4",50,640],["T","อุปสรรค (Threats)","ปัจจัยภายนอก · ความเสี่ยง","#fbe7ea","#c0394b",510,640]];
B.forEach(([a,n,s,bg,fg,x,y])=>{ R(x,y,440,470,{f:bg,s:fg,r:18,lw:1.6}); T(a,x+40,y+40,48,{w:700,c:fg,f:"Mitr",a:"center"}); T(n,x+80,y+32,21,{w:600,c:fg,f:"Mitr"}); T(s,x+80,y+58,14.5,{c:C.mut}); for(let i=0;i<9;i++){ const yy=y+112+i*40; L(x+22,yy,x+418,yy,"#c4cbd1"); } });
SEC("กลยุทธ์ที่ได้ / ข้อสรุป",50,1148,900); LINES(50,950,1215,3,46);
break; }
case "mind":{
HEAD("Mind Map","หัวข้อ ____________________");
const cx=500, cy=760, cols=["#d1495b","#e08a1e","#c9a400","#2e8b57","#2f7a8c","#7a56c8"];
const N=[[150,380,-1],[500,320,-1],[850,380,1],[150,1140,-1],[500,1200,1],[850,1140,1]];
N.forEach((n,i)=>{ const [x,y]=n; const col=cols[i]; const bx=x<cx?x+110:x-110; CURVE(cx,cy,cx+(x-cx)*.3,cy,x,y+(y<cy?120:-120),x,y+(y<cy?50:-50),col,5); });
N.forEach((n,i)=>{ const [x,y]=n, col=cols[i]; R(x-120,y-40,240,80,{f:col+"22",s:col,r:40,lw:2}); T("หัวข้อย่อย "+(i+1),x,y,18,{a:"center",c:col,w:600,f:"Mitr"});
 for(let j=0;j<3;j++){ const sy=y+(y<cy?-1:1)*(70+j*34)*(1); const yy=y<cy?y-70-j*38:y+70+j*38; L(x-110,yy,x+110,yy,col,1.4); } });
ctx.beginPath(); ctx.ellipse(X(cx),X(cy),X(150),X(80),0,0,Math.PI*2); ctx.fillStyle=C.acc; ctx.fill(); T("หัวข้อกลาง",cx,cy,28,{a:"center",c:"#fff",w:600,f:"Mitr"});
break; }
case "w5h1":{
HEAD("5W1H","เรื่อง ____________________");
const Q=[["What","ทำอะไร","#e3edfb","#2f6fc4"],["Why","ทำไม","#fdece4","#d9692f"],["Who","ใคร","#e3f4ea","#2e8b57"],["When","เมื่อไหร่","#fdf3d8","#b88300"],["Where","ที่ไหน","#f1e7fb","#7a56c8"],["How","อย่างไร","#fbe7ea","#c0394b"]];
Q.forEach(([a,b,bg,fg],i)=>{ const x=50+(i%2)*460, y=140+Math.floor(i/2)*330; R(x,y,440,310,{f:bg,s:fg,r:18,lw:1.5}); T(a,x+22,y+34,30,{w:700,c:fg,f:"Mitr"}); T(b,x+420,y+36,19,{a:"right",c:C.mut}); for(let j=0;j<5;j++)L(x+20,y+90+j*44,x+420,y+90+j*44,"#c4cbd1"); });
SEC("ข้อสรุป / ขั้นตอนต่อไป",50,1148,900); LINES(50,950,1215,3,46);
break; }
case "fish":{
HEAD("ก้างปลา · หาสาเหตุของปัญหา","");
const sy=720; L(60,sy,790,sy,C.acc,6); ctx.beginPath(); ctx.moveTo(X(790),X(sy-26)); ctx.lineTo(X(850),X(sy)); ctx.lineTo(X(790),X(sy+26)); ctx.closePath(); ctx.fillStyle=C.acc; ctx.fill();
R(800,sy-110,150,220,{f:C.soft,s:C.acc,r:16,lw:2}); T("ปัญหา",875,sy-84,20,{a:"center",w:600,c:C.acc,f:"Mitr"}); for(let i=0;i<4;i++)L(814,sy-50+i*36,936,sy-50+i*36);
const bones=[["คน",150,-1],["วิธีการ",400,-1],["เครื่องมือ",650,-1],["วัสดุ/ข้อมูล",150,1],["สภาพแวดล้อม",400,1],["การวัดผล",650,1]];
bones.forEach(([n,x,d])=>{ const ty=sy+d*330; L(x-30,ty,x+110,sy,C.acc,3.2); R(x-100,ty-(d<0?44:0),150,44,{f:C.acc,s:null,r:12}); T(n,x-25,ty-(d<0?22:-22),17,{a:"center",c:"#fff",w:600,f:"Mitr"});
 for(let j=0;j<4;j++){ const yy=sy+d*(70+j*62), xx=x+110-(Math.abs(yy-sy)/330)*140; L(xx-100,yy,xx,yy,"#aeb9c0",1.4); } });
SEC("สาเหตุหลักที่พบ / วิธีแก้",50,1150,900); LINES(50,950,1215,3,46);
break; }
case "interview":{
HEAD("ใบประเมินสัมภาษณ์",dateTxt);
FIELD("ชื่อผู้สมัคร",50,150,520); FIELD("ตำแหน่ง",600,150,350); FIELD("ผู้สัมภาษณ์",50,200,520); FIELD("แผนก",600,200,350);
const cols=[[50,380,"เกณฑ์การประเมิน"],[430,300,"คะแนน (1 น้อย – 5 มาก)"],[730,220,"หมายเหตุ"]];
cols.forEach(([x,w,s])=>{ R(x,246,w,38,{f:C.acc,s:null,r:0}); T(s,x+w/2,265,16,{a:"center",c:"#fff",w:600}); });
const cr=["ความรู้/ทักษะตรงกับตำแหน่ง","ประสบการณ์ทำงาน","การสื่อสาร","ทัศนคติ / ความกระตือรือร้น","การทำงานเป็นทีม","การแก้ปัญหา","เข้ากับวัฒนธรรมองค์กร","ความคาดหวังเงินเดือน / วันเริ่มงาน"];
cr.forEach((s,i)=>{ const y=284+i*64; [[50,380],[430,300],[730,220]].forEach(([x,w])=>R(x,y,w,64,{r:0,s:C.line,f:i%2?"#fafbfb":null})); T(s,64,y+32,16,{c:C.ink}); for(let p=1;p<=5;p++){ const cx=470+(p-1)*54; ctx.beginPath(); ctx.arc(X(cx),X(y+32),X(15),0,Math.PI*2); ctx.strokeStyle="#9aa6af"; ctx.lineWidth=k*1.5; ctx.stroke(); T(p,cx,y+33,14,{a:"center",c:C.mut}); } });
T("คะแนนรวม  ______ / 40",50,832,20,{w:600,c:C.acc,f:"Mitr"});
T("ผลการพิจารณา",50,886,20,{w:600,c:C.acc,f:"Mitr"}); [["ผ่าน",250],["สำรอง",400],["ไม่ผ่าน",570],["นัดสัมภาษณ์รอบ 2",760]].forEach(([s,x])=>{ CB(x,886,24); T(s,x+36,886,18); });
SEC("ความเห็น / จุดเด่น / ข้อสังเกต",50,950,900); LINES(50,950,1018,7,48);
break; }
case "oneone":{
HEAD("1:1 Meeting",dateTxt);
FIELD("พนักงาน",50,150,520); FIELD("หัวหน้า / ผู้คุย",600,150,350,130);
SEC("หัวข้อที่อยากคุยกัน",50,214,430); LINES(50,480,282,5,44);
SEC("ความคืบหน้า / ปัญหาที่เจอ",520,214,430); LINES(520,950,282,5,44);
SEC("Feedback ที่ให้ / ได้รับ",50,520,900); LINES(50,950,588,4,44);
SEC("ความรู้สึก / พลังงานช่วงนี้",50,800,430); for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(X(80+i*80),X(868),X(26),0,Math.PI*2); ctx.strokeStyle="#9aa6af"; ctx.lineWidth=k*1.6; ctx.stroke(); T(["😞","🙁","😐","🙂","😄"][i],80+i*80,869,26,{a:"center"}); }
SEC("เป้าหมายครั้งถัดไป",520,800,430); LINES(520,950,868,2,44);
SEC("Action Items",50,960,900); [[50,40,"#"],[90,470,"สิ่งที่ต้องทำ"],[560,200,"ผู้รับผิดชอบ"],[760,190,"กำหนด"]].forEach(([x,w,s])=>{ R(x,990,w,34,{f:C.soft,s:C.line,r:0}); T(s,x+w/2,1007,15,{a:"center",c:C.acc,w:600}); });
for(let i=0;i<7;i++){ const y=1024+i*46; [[50,40],[90,470],[560,200],[760,190]].forEach(([x,w])=>R(x,y,w,46,{r:0,s:C.line})); T(i+1,70,y+23,14,{a:"center",c:C.mut}); }
break; }
case "weekrev":{
HEAD("ทบทวนสัปดาห์",d0?"สัปดาห์ของ "+dateTxt:"สัปดาห์ที่ ____ · ____ – ____");
SEC("🏆 Wins · สิ่งที่ทำสำเร็จ",50,150,900); LINES(50,950,218,5,42);
SEC("🚧 สิ่งที่ยังไม่เสร็จ / ติดขัด",50,470,430); LINES(50,480,538,5,42);
SEC("💡 บทเรียนที่ได้",520,470,430); LINES(520,950,538,5,42);
SEC("พลังงาน / อารมณ์ของสัปดาห์",50,790,430); for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(X(86+i*86),X(860),X(28),0,Math.PI*2); ctx.strokeStyle="#9aa6af"; ctx.lineWidth=k*1.6; ctx.stroke(); T(i+1,86+i*86,861,20,{a:"center",c:C.mut}); }
SEC("ให้คะแนนสัปดาห์นี้ (1–10)",520,790,430); for(let i=0;i<10;i++){ R(520+i*43,830,38,52,{r:8,s:"#9aa6af"}); T(i+1,539+i*43,857,16,{a:"center",c:C.mut}); }
SEC("🎯 3 เรื่องสำคัญสัปดาห์หน้า",50,960,900); for(let i=0;i<3;i++){ const y=1030+i*66; R(50,y,900,56,{r:12,s:C.line,f:"#fafbfb"}); T(i+1,80,y+28,28,{a:"center",c:C.acc,w:700,f:"Mitr"}); L(110,y+42,930,y+42); }
SEC("ขอบคุณ / ชื่นชมใครหรือเรื่องอะไร",50,1262,900); LINES(50,950,1328,1,44);
break; }
case "kanban":{
HEAD("Kanban Board","โปรเจกต์ ____________________");
const cols=[["To Do · รอทำ","#fdf3d8","#b88300"],["Doing · กำลังทำ","#e3edfb","#2f6fc4"],["Review · รอตรวจ","#f1e7fb","#7a56c8"],["Done · เสร็จแล้ว","#e3f4ea","#2e8b57"]], w=213;
cols.forEach(([n,bg,fg],i)=>{ const x=50+i*(w+16); R(x,134,w,1230,{f:bg,s:null,r:16}); R(x,134,w,48,{f:fg,s:null,r:16}); T(n,x+w/2,159,16.5,{a:"center",c:"#fff",w:600,f:"Mitr"});
 for(let j=0;j<8;j++){ const y=198+j*145; R(x+10,y,w-20,128,{f:"#fff",s:fg+"88",r:12,lw:1.2}); L(x+22,y+44,x+w-22,y+44,"#d3d9de",1); L(x+22,y+78,x+w-22,y+78,"#d3d9de",1); } });
break; }
case "budget":{
const has=t.y!=null;
HEAD("ค่าใช้จ่ายรายเดือน",has?`${mn(t.m)} ${byear(t.y)}`:"เดือน ____________ ปี ________");
[["งบประมาณ",50,"#e3edfb","#2f6fc4"],["ใช้ไปแล้ว",270,"#fdece4","#d9692f"],["คงเหลือ",490,"#e3f4ea","#2e8b57"],["เป้าออม / ตั้งใจ",710,"#f1e7fb","#7a56c8"]].forEach(([s,x,bg,fg])=>{ R(x,128,210,76,{f:bg,s:fg,r:14,lw:1.3}); T(s,x+105,150,16,{a:"center",c:fg,w:600}); L(x+24,188,x+186,188,fg,1.2); });
const cols=[[50,92,"วันที่"],[142,368,"รายการ"],[510,190,"หมวด"],[700,150,"จำนวนเงิน"],[850,100,"หมายเหตุ"]];
cols.forEach(([x,w,s])=>{ R(x,224,w,36,{f:C.acc,s:null,r:0}); T(s,x+w/2,242,16,{a:"center",c:"#fff",w:600}); });
for(let i=0;i<26;i++){ const y=260+i*42; cols.forEach(([x,w])=>R(x,y,w,42,{r:0,s:C.line,f:i%2?"#fafbfb":null})); }
R(50,1352,800,44,{f:C.soft,s:C.acc,r:0}); T("รวมทั้งเดือน",690,1374,18,{a:"right",c:C.acc,w:700,f:"Mitr"}); R(700,1352,150,44,{f:null,s:C.acc,r:0});
break; }
}
}
