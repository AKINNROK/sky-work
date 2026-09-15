const APP_VERSION="4.1"; const APP_DATE="15 ก.ย. 2026";
const MTH=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MTHFULL=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DOW=["อา","จ","อ","พ","พฤ","ศ","ส"];
const STATUS=["รอดำเนินการ","กำลังดำเนินการ","เสร็จสิ้น"];
const DEFAULT_GROUPS=[
{key:"train_law",label:"อบรมตามกฎหมาย"},{key:"train_in",label:"อบรมภายใน"},
{key:"train_out",label:"อบรมภายนอก"},{key:"project",label:"โปรเจคเสริม"},
{key:"monthly",label:"งานประจำเดือน"},{key:"annual",label:"กิจกรรมประจำปี"},
{key:"ops",label:"งานประจำ/ต่ออายุ"},{key:"secretary",label:"งานเลขา"},
{key:"recruit",label:"งานสรรหา"},{key:"idea",label:"ไอเดีย"}];
const TRAIN_PRESET=[{key:"train_law",label:"อบรมตามกฎหมาย"},{key:"train_in",label:"อบรมภายใน"},{key:"train_out",label:"อบรมภายนอก"},{key:"project",label:"โปรเจคเสริม"},{key:"monthly",label:"งานประจำเดือน"},{key:"annual",label:"กิจกรรมประจำปี"}];
const DSD=["ไม่ต้องยื่น","รอยื่น","ยื่นแล้ว","อนุมัติแล้ว","ไม่ผ่าน"];
const dsdCls=d=>d==="อนุมัติแล้ว"?"s-done":d==="ยื่นแล้ว"?"s-run":d==="ไม่ผ่าน"?"s-over":"s-wait";
const DEFAULT_COMPANIES=[{key:"lkl",label:"LeKise (LKL)"},{key:"lks",label:"LeKise Solar (LKS)"},{key:"lsc",label:"LSC Center"}];
const ICON={
home:'<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',
all:'<path d="M4 7h16M4 12h16M4 17h10"/>',
cal:'<rect x="3.5" y="5" width="17" height="15" rx="4.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
budget:'<path d="M12 4v16"/><path d="M16 8c0-2-2-3-4-3s-4 1-4 3 2 2.6 4 3 4 1 4 3-2 3-4 3-4-1-4-3"/>',
train:'<path d="M12 4 2.5 9 12 14l9.5-5L12 4z"/><path d="M6.5 11.2V16c0 1.5 2.6 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-4.8"/><path d="M21.5 9v5"/>',
meet:'<circle cx="9" cy="8" r="2.8"/><circle cx="16.5" cy="9.5" r="2.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16.5 14c2.4 0 4 1.7 4 4"/>',
pipeline:'<circle cx="6.5" cy="7" r="2.6"/><circle cx="17.5" cy="17" r="2.6"/><path d="M9 7h4a4 4 0 0 1 4 4v3"/>',
set:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.6-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 3a2 2 0 1 1 4 0 1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21 11a2 2 0 1 1 0 4z"/>',
check:'<path d="M5 13l4 4 10-10"/>',
clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
bell:'<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 19a2 2 0 0 0 3 0"/>',
up:'<path d="M12 19V5M6 11l6-6 6 6"/>', down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
link:'<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.8 4.7a4 4 0 1 1 5.7 5.7L16.6 12"/><path d="M13 17.5l-1.8 1.8a4 4 0 1 1-5.7-5.7L7.4 12"/>',
file:'<path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.5 3.5V9H19"/>',
phone:'<rect x="7" y="2.5" width="10" height="19" rx="3"/><path d="M11 18.5h2"/>',
laptop:'<rect x="4" y="5" width="16" height="11" rx="2.5"/><path d="M2.5 19.5h19"/>'
};
const VIEWS=[["home","ภาพรวม"],["all","งานทั้งหมด"],["meet","การประชุม"],["train","ฝึกอบรม"],["cal","ปฏิทิน"],["budget","งบประมาณ"],["set","ตั้งค่า"]];
const TABS=["home","all","meet","train","cal","set"];
const SETTABS=[["groups","กลุ่มงาน"],["companies","บริษัท"],["gl","หมวด GL"],["theme","ธีมสี"],["remind","เตือน & ปฏิทิน"],["import","นำเข้า CSV"],["connect","การเชื่อมต่อ"]];
const PALETTES=[
{key:"cumulus", name:"เมฆกลางคืน", note:"ฟ้าเทาสุขุม", ramp:["#DAE1E9","#AEBECD","#90A5BA","#5B7BAA","#124E82"]},
{key:"above",   name:"เหนือหมู่เมฆ", note:"ฟ้าสดใส", ramp:["#F2F8FF","#D7E7F7","#7FC1EE","#4A93D4","#2A5E96"]},
{key:"clearday",name:"ฟ้าใสตอนเช้า", note:"โปร่งเบา", ramp:["#EAF4FD","#C9E4F8","#9BD0F0","#5BA8E0","#24618F"]},
{key:"starsea", name:"ทะเลดาว",     note:"คราม-ม่วงลึก", ramp:["#C8DDF5","#88A5E0","#3A60A0","#4D4177","#0B1838"]},
{key:"nightsky",name:"ท้องฟ้ายามค่ำ",note:"น้ำเงินเข้ม", ramp:["#D9E1E8","#A3B1C6","#4E5D6C","#00558C","#004C71"]},
{key:"cleancool",name:"ใสเย็นตา",   note:"ฟ้าอมเขียว", ramp:["#DDEFF7","#ACEBFF","#5EBFE0","#0195D5","#2F7184"]},
{key:"oceanbreeze",name:"Ocean Breeze",note:"ทะเลอ่อนโยน",ramp:["#E7F4FA","#CDE9F3","#A7D8E8","#7CC0DB","#3E7E9C"]},
{key:"lavender",name:"Lavender Cloud",note:"ม่วงละมุน", ramp:["#F1ECFA","#DAC4E8","#C5BFE3","#A08BD0","#5B4A86"]},
{key:"sakura",  name:"Sakura Blossom",note:"ชมพูหวานละมุน",ramp:["#FDEFF2","#F9D7DF","#F5AAC8","#E68AA6","#8C4A63"]},
{key:"peach",   name:"Peach Sorbet", note:"พีชอบอุ่น",   ramp:["#FDF1E7","#F8DCC6","#F0B38B","#E08A5E","#7A4A32"]},
{key:"pistachio",name:"Pistachio Dream",note:"เขียวใบไม้อ่อน",ramp:["#EFF6E9","#D2F0D5","#BBBE92","#8BB5B2","#4C6B4F"]},
{key:"mocha",   name:"Mocha Latte",  note:"น้ำตาลอุ่น",   ramp:["#F6EFE8","#E8C1AF","#DBA396","#A88070","#5A4035"]},
{key:"mint",    name:"Sky Mint",     note:"มินต์สดชื่น",  ramp:["#DFFAFB","#B9F3FC","#5CE1E6","#2BB8C4","#1F3A60"]},
{key:"morning", name:"เช้าอบอุ่น",    note:"ครีมฟ้า",      ramp:["#FDF3E8","#F6E1CD","#DCC7B4","#9FB0C4","#4E6580"]},
{key:"lemon",   name:"Lemon Meringue",note:"เหลืองสดใส",  ramp:["#FDF8E3","#FAF19F","#F3C669","#D9A23C","#6B5326"]},
{key:"berry",   name:"Berry Smoothie",note:"ม่วงเบอร์รี่", ramp:["#F6EDF8","#E7C1ED","#DEC6E5","#BA98E1","#5C3E76"]}
];
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hex2(a),B=hex2(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("");};
const lum=h=>{const[r,g,b]=hex2(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b;};
function isNight(){
const h=new Date().getHours();
return theme.mode==="dark" ? true : theme.mode==="light" ? false : (h>=18||h<6);
}
function applyTheme(){
const p=PALETTES.find(x=>x.key===theme.preset)||PALETTES[0];
const c=(theme.preset==="custom"&&theme.custom&&theme.custom.length===5)?theme.custom:p.ramp;
const [c1,c2,c3,c4,c5]=c, s=document.documentElement.style, set=(k,v)=>s.setProperty(k,v);
const night=isNight();
if(night){
const base=mix(c5,"#070d16",.55);
set("--paper",base);
set("--card",mix(c5,"#0d1520",.34));
set("--line",mix(c5,"#0d1520",.12)); set("--line-2",mix(c5,"#0d1520",.24));
set("--ink",mix(c1,"#ffffff",.35)); set("--ink-2",mix(c2,c1,.4)); set("--ink-3",mix(c3,c2,.35));
set("--accent",lum(c2)>.55?c2:mix(c2,"#ffffff",.35)); set("--accent-2",c3);
set("--accent-soft",mix(c5,"#0d1520",.05));
set("--sky",c4); set("--sky-soft",c3);
set("--sh-s","0 2px 6px -2px rgba(0,0,0,.45)");
set("--sh-m","0 8px 22px -12px rgba(0,0,0,.75)");
set("--sh-l","0 20px 48px -22px rgba(0,0,0,.9)");
set("--ok-soft",mix("#1a9f86","#0d1520",.72)); set("--ok",mix("#1a9f86","#ffffff",.35));
set("--run-soft",mix("#e0932b","#0d1520",.74)); set("--run",mix("#e0932b","#ffffff",.3));
set("--wait-soft",mix(c5,"#0d1520",.2)); set("--wait",mix(c3,"#ffffff",.2));
set("--over-soft",mix("#e0606d","#0d1520",.74)); set("--over",mix("#e0606d","#ffffff",.28));
document.documentElement.style.colorScheme="dark";
}else{
set("--paper",mix(c1,"#ffffff",.55)); set("--card","#ffffff");
set("--line",mix(c1,"#ffffff",.3)); set("--line-2",mix(c1,"#ffffff",.55));
set("--ink",mix(c5,"#0b1a2a",.12)); set("--ink-2",mix(c5,c3,.45)); set("--ink-3",mix(c3,c4,.3));
set("--accent",c5); set("--accent-2",c4); set("--accent-soft",mix(c2,"#ffffff",.4));
set("--sky",lum(c4)<.62?c4:c5); set("--sky-soft",c2);
set("--sh-s","0 2px 6px -2px rgba(18,58,94,.12)");
set("--sh-m","0 6px 20px -10px rgba(18,58,94,.28)");
set("--sh-l","0 18px 44px -22px rgba(18,58,94,.45)");
set("--ok","#1a9f86"); set("--ok-soft","#dff4ef");
set("--run","#e0932b"); set("--run-soft","#fcefdb");
set("--wait","#8fa3ba"); set("--wait-soft","#e9eff5");
set("--over","#e0606d"); set("--over-soft","#fbe5e8");
document.documentElement.style.colorScheme="light";
}
}
setInterval(()=>{ if(theme.mode==="auto"){ const n=isNight(); if(n!==applyTheme._last){ applyTheme._last=n; applyTheme(); } } },60000);
let DB=null, items=[], ledger=[], view="home", settab="groups", editing=null, editingTx=null;
let groups=DEFAULT_GROUPS.slice(), companies=DEFAULT_COMPANIES.slice(), gls=[];
let theme={preset:"cumulus",custom:null,mode:"auto"};
try{const t=localStorage.getItem("hr-theme");if(t)theme=JSON.parse(t);}catch(e){}
const THISYEAR=new Date().getFullYear();
const DOWFULL=["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const NTH=[[1,"ที่ 1"],[2,"ที่ 2"],[3,"ที่ 3"],[4,"ที่ 4"],[5,"ที่ 5"],[-1,"สุดท้าย"]];
const FREQ=[["none","ไม่เกิดซ้ำ"],["day","ทุกวัน"],["week","ทุกสัปดาห์"],["monthday","ทุกเดือน (ตามวันที่)"],["monthnth","ทุกเดือน (ตามวันในสัปดาห์)"],["year","ทุกปี"]];
const rr=t=>(t&&t.rrule&&t.rrule.freq&&t.rrule.freq!=="none")?t.rrule:null;
function nthOfMonth(d){ return Math.floor((d.getDate()-1)/7)+1; }
function isLastWeek(d){ return d.getDate()+7>new Date(d.getFullYear(),d.getMonth()+1,0).getDate(); }
function occursOn(t,d){
const R2=rr(t);
if(R2){
const start=t.date?new Date(t.date):null;
if(start&&d<new Date(start.getFullYear(),start.getMonth(),start.getDate()))return false;
if(R2.freq==="day")return true;
if(R2.freq==="week")return (R2.weekdays||[]).includes(d.getDay());
if(R2.freq==="monthday")return d.getDate()===(+R2.monthday||(start?start.getDate():1));
if(R2.freq==="monthnth"){
if(!(R2.weekdays||[]).includes(d.getDay()))return false;
const ns=R2.nth&&R2.nth.length?R2.nth:[1];
return ns.some(n=>n===-1?isLastWeek(d):nthOfMonth(d)===n);
}
if(R2.freq==="year"){ if(!start)return false;
return d.getMonth()===start.getMonth()&&d.getDate()===start.getDate(); }
return false;
}
if(t.date){const x=new Date(t.date);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()&&x.getDate()===d.getDate();}
return false;
}
function occDays(t,y,m){
const out=[],last=new Date(y,m+1,0).getDate();
for(let i=1;i<=last;i++){const d=new Date(y,m,i); if(occursOn(t,d))out.push(i);}
return out;
}
function rruleText(t){
const R2=rr(t); if(!R2)return "";
const wd=(R2.weekdays||[]).map(i=>DOWFULL[i]).join(", ");
if(R2.freq==="day")return "ทุกวัน";
if(R2.freq==="week")return "ทุกสัปดาห์ · "+(wd||"—");
if(R2.freq==="monthday")return "ทุกเดือน วันที่ "+(R2.monthday||"—");
if(R2.freq==="monthnth"){const ns=(R2.nth||[]).map(n=>(NTH.find(x=>x[0]===n)||["",""])[1]).join(" และ ");
return "ทุกเดือน "+(wd||"—")+" "+(ns||"ที่ 1");}
if(R2.freq==="year")return "ทุกปี"+(t.date?" · "+fmtDate(t.date):"");
return "";
}
function nextOcc(t,from){
const d=new Date(from||new Date()); d.setHours(0,0,0,0);
if(!rr(t))return t.date?new Date(t.date):null;
for(let i=0;i<800;i++){ if(occursOn(t,d))return new Date(d); d.setDate(d.getDate()+1); }
return null;
}
let R={year:THISYEAR, scope:"year", month:new Date().getMonth(), selDay:null, calMode:"month", budScope:"year", budMonth:new Date().getMonth()};
const F={q:"",track:"",type:"",status:"",company:""};
const el=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const baht=n=>(+n||0).toLocaleString("th-TH",{maximumFractionDigits:0});
const kbaht=n=>n>=1000000?(n/1000000).toFixed(1)+"ล.":n>=1000?Math.round(n/1000)+"พ.":String(Math.round(n));
const budgetOf=t=>(+t.b1||0)+(+t.b2||0);
const sCls=s=>s==="เสร็จสิ้น"?"s-done":s==="กำลังดำเนินการ"?"s-run":"s-wait";
const sColor=s=>s==="เสร็จสิ้น"?"var(--ok)":s==="กำลังดำเนินการ"?"var(--run)":"var(--wait)";
const visible=a=>a.filter(x=>!x.hidden);
const gLabel=k=>(groups.find(g=>g.key===k)||{}).label||k||"ไม่ระบุกลุ่ม";
const cLabel=k=>(companies.find(g=>g.key===k)||{}).label||k||"—";
const glLabel=k=>{const g=gls.find(x=>x.key===k);return g?(g.code?g.code+" · ":"")+g.label:(k||"ไม่ระบุ GL");};
const isMeet=t=>!!(t&&(t.meet||/ประชุม|meeting/i.test((t.title||"")+" "+(t.type||""))));
const hhmm=v=>/^\d{1,2}:\d{2}$/.test(v||"")?(v.length===4?"0"+v:v):"";
const tShow=v=>hhmm(v)?hhmm(v)+" น.":"";
const prepDate=t=>{const d=dueDate(t); if(!d||!(+t.prepDays))return null;
const p=new Date(d); p.setDate(p.getDate()-(+t.prepDays)); return p;};
const isTrain=t=>!!(t&&(t.train||/^train_/.test(t.track||"")||/อบรม/.test(gLabel(t.track))));
const trainKind=t=>t.track==="train_law"||/กฎหมาย/.test(gLabel(t.track))?"กฎหมาย":t.track==="train_out"||/ภายนอก/.test(gLabel(t.track))?"ภายนอก":"ภายใน";
const dueDate=t=>{const R2=rr(t); if(R2)return nextOcc(t); return t.date?new Date(t.date):null;};
const daysTo=d=>{const a=new Date();a.setHours(0,0,0,0);return Math.round((d-a)/864e5);};
const svg=(p,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const types=()=>[...new Set(items.map(t=>t.type).filter(Boolean))].sort();
const monthsOf=t=>{
const R2=rr(t);
if(R2){const y=(typeof R!=="undefined"&&R.year)||THISYEAR;
return [0,1,2,3,4,5,6,7,8,9,10,11].filter(m=>occDays(t,y,m).length).map(m=>m+1);}
if(Array.isArray(t.months)&&t.months.length)return t.months;
if(t.date)return[new Date(t.date).getMonth()+1];
if(t.recurring)return[1,2,3,4,5,6,7,8,9,10,11,12];
return[];
};
const fmtDate=d=>{if(!d)return"";const x=new Date(d);return x.getDate()+" "+MTH[x.getMonth()];};
const weekOf=d=>{const x=new Date(d),s=new Date(x.getFullYear(),0,1);return Math.ceil(((x-s)/864e5+s.getDay()+1)/7);};
const nowWeek=weekOf(new Date());
function inScope(t){
if(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==R.year)return false;
if(R.scope==="year")return true;
const ms=monthsOf(t);
if(R.scope==="month")return ms.includes(R.month+1);
if(R.scope==="week"){
if(t.date)return weekOf(t.date)===nowWeek;
return !!t.recurring||ms.includes(new Date().getMonth()+1);
}
return true;
}
function yearList(){
const ys=new Set([THISYEAR,THISYEAR+1,R.year]);
items.forEach(t=>{if(t.date)ys.add(new Date(t.date).getFullYear());});
ledger.forEach(x=>{if(x.date)ys.add(new Date(x.date).getFullYear());});
return [...ys].filter(y=>y>2000&&y<2100).sort();
}
const yearSel=id=>`<select id="${id}" style="border:0;background:var(--card);border-radius:999px;padding:8px 14px;font-weight:600;box-shadow:var(--sh-s)">${yearList().map(y=>`<option value="${y}"${y===R.year?" selected":""}>พ.ศ. ${y+543} · ${y}</option>`).join("")}</select>`;
const scopeLabel=()=>R.scope==="year"?"ทั้งปี "+(R.year+543):R.scope==="month"?MTHFULL[R.month]:"สัปดาห์นี้";
function scopeBar(id){
return `${yearSel("yrSel")} <div class="seg" id="${id}">
<button data-sc="year" aria-pressed="${R.scope==="year"}">รายปี</button>
<button data-sc="month" aria-pressed="${R.scope==="month"}">รายเดือน</button>
<button data-sc="week" aria-pressed="${R.scope==="week"}">รายสัปดาห์</button>
${R.scope==="month"?`<select id="scMonth" style="border:0;background:var(--card);border-radius:999px;padding:6px 12px">${MTHFULL.map((m,i)=>`<option value="${i}"${i===R.month?" selected":""}>${m}</option>`).join("")}</select>`:""}
</div>`;
}
function donut(parts,centerTop,centerSub){
const tot=parts.reduce((s,p)=>s+p.v,0)||1, R2=52, C=2*Math.PI*R2; let off=0;
const arcs=parts.filter(p=>p.v>0).map(p=>{
const len=p.v/tot*C;
const a=`<circle cx="70" cy="70" r="${R2}" fill="none" stroke="${p.c}" stroke-width="20"
stroke-dasharray="${Math.max(len-3,1)} ${C-Math.max(len-3,1)}" stroke-dashoffset="${-off}"
stroke-linecap="round" transform="rotate(-90 70 70)"><title>${esc(p.n)}: ${p.v}</title></circle>`;
off+=len; return a;}).join("");
return `<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="สัดส่วนงาน">
<circle cx="70" cy="70" r="${R2}" fill="none" stroke="var(--line-2)" stroke-width="20"/>${arcs}
<text x="70" y="66" text-anchor="middle" font-size="26" font-weight="600" fill="var(--ink)" font-family="Mitr,sans-serif">${centerTop}</text>
<text x="70" y="86" text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="Sarabun,sans-serif">${centerSub}</text></svg>`;
}
function bars(vals,labels,fmt,hi){
const max=Math.max(...vals,1), W=430, H=150, bw=W/vals.length;
return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="กราฟรายเดือน">
<line x1="0" y1="118" x2="${W}" y2="118" stroke="var(--line-2)" stroke-width="1.5"/>
${vals.map((v,i)=>{
const h=Math.max(v/max*104,v>0?5:0), x=i*bw+bw*.2, y=118-h, on=i===hi;
return `<g><rect x="${x}" y="${y}" width="${bw*.6}" height="${h}" rx="5" fill="${on?"var(--accent)":"var(--accent-2)"}" opacity="${on?1:.55}"><title>${labels[i]}: ${fmt(v)}</title></rect>
${v>0?`<text x="${x+bw*.3}" y="${y-5}" text-anchor="middle" font-size="9.5" fill="var(--ink-3)" font-family="Sarabun,sans-serif">${fmt(v)}</text>`:""}
<text x="${x+bw*.3}" y="134" text-anchor="middle" font-size="9.5" fill="${on?"var(--accent)":"var(--ink-3)"}" font-family="Sarabun,sans-serif">${labels[i]}</text></g>`;}).join("")}
</svg>`;
}
function dualBars(inc,exp,labels,hi){
const max=Math.max(...inc,...exp,1), W=430, H=155, bw=W/12;
return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="รายรับรายจ่ายรายเดือน">
<line x1="0" y1="120" x2="${W}" y2="120" stroke="var(--line-2)" stroke-width="1.5"/>
${labels.map((l,i)=>{
const hi2=Math.max(inc[i]/max*98,inc[i]>0?4:0), he=Math.max(exp[i]/max*98,exp[i]>0?4:0);
const x=i*bw+bw*.14, w=bw*.34;
return `<g><rect x="${x}" y="${120-hi2}" width="${w}" height="${hi2}" rx="4" fill="var(--ok)"><title>${l} รายรับ: ${baht(inc[i])}</title></rect>
<rect x="${x+w+2}" y="${120-he}" width="${w}" height="${he}" rx="4" fill="var(--accent-2)"><title>${l} รายจ่าย: ${baht(exp[i])}</title></rect>
<text x="${i*bw+bw*.5}" y="136" text-anchor="middle" font-size="9.5" fill="${i===hi?"var(--accent)":"var(--ink-3)"}" font-family="Sarabun,sans-serif">${l}</text></g>`;}).join("")}
</svg>`;
}
const CFG_BAKED={url:"",key:""};
let cfg=CFG_BAKED.url?CFG_BAKED:(()=>{try{return JSON.parse(localStorage.getItem("sw-cfg")||"null")||{url:"",key:""}}catch(e){return{url:"",key:""}}})();
let SB=null, uid=null;
const cache={items:new Map(),ledger:new Map(),meta:new Map()};
const listeners={items:[],ledger:[],meta:new Map()};
const snapDoc=(id,d)=>({id,exists:!!d,data:()=>d,metadata:{fromCache:false,hasPendingWrites:false}});
const emit=coll=>{
const docs=[...cache[coll].entries()].map(([id,d])=>snapDoc(id,d));
listeners[coll].forEach(cb=>cb({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{}}));
};
const emitMeta=id=>{(listeners.meta.get(id)||[]).forEach(cb=>cb(snapDoc(id,cache.meta.get(id))));};
const uuid=()=>crypto.randomUUID?crypto.randomUUID():"id"+Date.now()+Math.random().toString(36).slice(2);
let lastErr=null;
async function up(coll,id,data){
const prev=cache[coll].get(id);
cache[coll].set(id,data); coll==="meta"?emitMeta(id):emit(coll);
const {error}=await SB.from("rows").upsert({id,uid,kind:coll,data,updated_at:new Date().toISOString()});
if(error){
lastErr=error;
if(prev===undefined)cache[coll].delete(id); else cache[coll].set(id,prev);
coll==="meta"?emitMeta(id):emit(coll);
setFoot("บันทึกไม่สำเร็จ","var(--over)");
render();
throw error;
}
lastErr=null;
return id;
}
async function del(coll,id){
cache[coll].delete(id); coll==="meta"?emitMeta(id):emit(coll);
await SB.from("rows").delete().eq("id",id).eq("uid",uid);
}
const DBShim={
doc(path){const[c,i]=path.split("/");const coll=c==="meta"?"meta":c;
return {id:i,path,
get:async()=>snapDoc(i,cache[coll].get(i)),
set:d=>up(coll,i,d), update:d=>up(coll,i,Object.assign({},cache[coll].get(i)||{},d)),
delete:()=>del(coll,i),
onSnapshot:cb=>{ if(coll==="meta"){const a=listeners.meta.get(i)||[];a.push(cb);listeners.meta.set(i,a);cb(snapDoc(i,cache.meta.get(i)));}
return ()=>{}; }};},
collection(name){return {
doc:id=>DBShim.doc(name+"/"+(id||uuid())),
add:async d=>{const id=uuid();await up(name,id,d);return{id};},
onSnapshot:(cb,err)=>{listeners[name].push(cb);emit(name);return()=>{};}};}
};
async function loadAll(){
const {data,error}=await SB.from("rows").select("id,kind,data").eq("uid",uid);
if(error){setFoot("โหลดข้อมูลไม่ได้","var(--over)");return;}
cache.items.clear();cache.ledger.clear();cache.meta.clear();
data.forEach(r=>cache[r.kind]?.set(r.id,r.data));
emit("items");emit("ledger");[...cache.meta.keys()].forEach(emitMeta);
["groups","companies","gl","theme"].forEach(emitMeta);
}
function liveSync(){
SB.channel("rows-"+uid).on("postgres_changes",{event:"*",schema:"public",table:"rows",filter:"uid=eq."+uid},p=>{
const r=p.new&&p.new.id?p.new:p.old;
if(!r)return;
if(p.eventType==="DELETE")cache[r.kind]?.delete(r.id); else cache[r.kind]?.set(r.id,r.data);
r.kind==="meta"?emitMeta(r.id):emit(r.kind);
render();
}).subscribe();
}
async function boot(){
applyTheme(); renderNav(); render();
if(!cfg.url||!cfg.key){ gate("setup"); return; }
SB=supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true}});
const {data:{session}}=await SB.auth.getSession();
if(!session){ gate("login"); return; }
uid=session.user.id; DB=DBShim;
el("gate").close();
sub("meta/groups",d=>{if(Array.isArray(d.list)&&d.list.length)groups=d.list;});
sub("meta/companies",d=>{if(Array.isArray(d.list))companies=d.list;});
sub("meta/gl",d=>{if(Array.isArray(d.list))gls=d.list;});
sub("meta/theme",d=>{if(d.preset){theme={preset:d.preset,custom:d.custom||null,mode:d.mode||"auto"};applyTheme();}});
DBShim.collection("items").onSnapshot(s=>{
items=s.docs.map(d=>Object.assign({_id:d.id},d.data()));
if(!gls.length&&items.length)seedGL();
setFoot(items.length+" งาน · ซิงก์แล้ว"); render();});
DBShim.collection("ledger").onSnapshot(s=>{
ledger=s.docs.map(d=>Object.assign({_id:d.id},d.data())); render();});
setFoot("กำลังโหลด…");
await loadAll(); liveSync();
setFoot(items.length+" งาน · ซิงก์แล้ว");
try{ notifyToday(false); }catch(e){}
}
function sub(path,fn){ DBShim.doc(path).onSnapshot(s=>{ if(s.exists){fn(s.data());render();} }); }
let sync={txt:"กำลังโหลด…",color:""};
function setFoot(txt,color){
sync={txt,color:color||""};
el("foot").innerHTML=`<span class="dotlive"${color?` style="background:${color}"`:""}></span>${txt}`;
el("mfoot").textContent=txt;
paintSync();
}
function paintSync(){
document.querySelectorAll(".syncchip").forEach(n=>{
n.innerHTML=`<span class="dotlive"${sync.color?` style="background:${sync.color}"`:""}></span>${esc(sync.txt)}`;
});
}
const syncChip=()=>`<span class="syncchip"><span class="dotlive"></span>${esc(sync.txt)}</span>`;
function seedGL(){
const found={};
items.forEach(t=>[t.gl1,t.gl2].forEach(g=>{ g=(g||"").trim(); if(!g)return;
const m=g.match(/^(\d{6,9})\s*[:.]?\s*(.*)$/); const code=m?m[1]:"", label=(m?m[2]:g).trim()||g;
const key=code||label.slice(0,18);
if(!found[key])found[key]={key,code,label,budget:0};
}));
items.forEach(t=>{
const put=(g,b)=>{g=(g||"").trim();if(!g||!b)return;const m=g.match(/^(\d{6,9})/);const key=m?m[1]:g.slice(0,18);if(found[key])found[key].budget+=+b||0;};
put(t.gl1,t.b1); put(t.gl2,t.b2);
});
gls=Object.values(found).sort((a,b)=>b.budget-a.budget);
if(gls.length&&DB)DB.doc("meta/gl").set({list:gls});
}
const glKeyOf=g=>{g=(g||"").trim();if(!g)return"";const m=g.match(/^(\d{6,9})/);return m?m[1]:g.slice(0,18);};
const saveMeta=async(k,list)=>{ if(!DB)return; try{ await DB.doc("meta/"+k).set({list}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); } };
async function saveItem(data,id){ if(!DB)throw new Error("ยังไม่ได้เชื่อมต่อฐานข้อมูล"); return id?await DB.collection("items").doc(id).set(data):await DB.collection("items").add(data); }
function renderNav(){
const bs=el("brandsub"); if(bs)bs.textContent="เวอร์ชัน "+APP_VERSION;
el("nav").innerHTML=VIEWS.map(([k,l])=>`<button data-v="${k}" aria-current="${k===view}">${svg(ICON[k==="cal"?"cal":k])}<span>${l}</span></button>`).join("");
el("tabbar").innerHTML=TABS.map(k=>{const l=VIEWS.find(v=>v[0]===k)[1];
return `<button data-v="${k}" aria-current="${k===view}">${svg(ICON[k],21)}${l}</button>`;}).join("");
const go=e=>{const b=e.target.closest("button");if(!b)return;view=b.dataset.v;renderNav();render();window.scrollTo(0,0);};
el("nav").onclick=go; el("tabbar").onclick=go;
}
function render(){
el("view").innerHTML={home,all,meet,train,cal:calView,budget,pipeline,set:setView}[view]();
paintSync(); wire();
}
function header(title,sub,btn=true){
return `<div class="head"><div><h1>${title}</h1><div class="sub">${sub} · ${syncChip()}</div></div>
${btn?`<button class="btn addbtn" id="add">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มงาน</span></button>`:""}</div>`;
}
function liRow(t,showDate){
const ms=monthsOf(t), d=t.date?fmtDate(t.date).split(" "):null;
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--line-2);color:${sColor(t.status)}">${(()=>{const n=rr(t)?nextOcc(t):null;
if(n)return n.getDate()+"<br>"+MTH[n.getMonth()];
return d?`${d[0]}<br>${d[1]}`:(ms.length>1?"ประจำ":"—");})()}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${rruleText(t)?esc(rruleText(t))+" · ":""}${esc(gLabel(t.track))}${t.company?" · "+esc(cLabel(t.company)):""}${t.owner?" · "+esc(t.owner):""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;
}
function prepDue(days){
days=days||7;
return items.filter(t=>isMeet(t)&&t.status!=="เสร็จสิ้น"&&+t.prepDays>0)
.map(t=>({t,p:prepDate(t),d:dueDate(t)}))
.filter(x=>x.p&&x.d&&daysTo(x.d)>=0&&daysTo(x.p)<=days)
.sort((a,b)=>a.p-b.p);
}
function dueSoon(days){
days=days||7;
const late=[], soon=[];
items.forEach(t=>{ if(t.status==="เสร็จสิ้น")return;
const d=dueDate(t); if(!d)return; const n=daysTo(d);
if(n<0&&!rr(t))late.push(t); else if(n>=0&&n<=days)soon.push(t); });
const by=(a,b)=>dueDate(a)-dueDate(b);
return {late:late.sort(by),soon:soon.sort(by)};
}
function icsText(){
const pad=n=>String(n).padStart(2,"0");
const stamp=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
const esc2=v=>String(v||"").replace(/[\\;,]/g,m=>"\\"+m).replace(/\n/g," ");
const out=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Sky Work//TH","CALSCALE:GREGORIAN","X-WR-CALNAME:Sky Work"];
const now=new Date(), seen=new Set();
items.forEach(t=>{
const ds=[];
if(rr(t)){ for(let k=0;k<14;k++){ const m=new Date(R.year,new Date().getMonth()+k,1);
occDays(t,m.getFullYear(),m.getMonth()).forEach(d=>ds.push(new Date(m.getFullYear(),m.getMonth(),d))); } }
else if(t.date)ds.push(new Date(t.date));
ds.slice(0,60).forEach(d=>{
const uidv=(t._id+"-"+stamp(d)); if(seen.has(uidv))return; seen.add(uidv);
const end=new Date(d.getTime()+864e5);
const tm=hhmm(t.time);
const dt=tm?("DTSTART:"+stamp(d)+"T"+tm.replace(":","")+"00\r\nDTEND:"+stamp(d)+"T"+pad((+tm.slice(0,2)+1)%24)+tm.slice(3)+"00")
:("DTSTART;VALUE=DATE:"+stamp(d)+"\r\nDTEND;VALUE=DATE:"+stamp(end));
if(+t.prepDays>0){ const pd=new Date(d); pd.setDate(pd.getDate()-(+t.prepDays));
out.push("BEGIN:VEVENT","UID:"+uidv+"-prep@skywork","DTSTAMP:"+stamp(now)+"T090000Z",
"DTSTART;VALUE=DATE:"+stamp(pd),"DTEND;VALUE=DATE:"+stamp(new Date(pd.getTime()+864e5)),
"SUMMARY:"+esc2("[เตรียมข้อมูล] "+t.title),
"DESCRIPTION:"+esc2((t.prepNote||"เตรียมข้อมูลก่อนประชุม")+" · ประชุม "+stamp(d)),
"BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY","DESCRIPTION:"+esc2("เตรียมข้อมูล "+t.title),"END:VALARM","END:VEVENT"); }
out.push("BEGIN:VEVENT","UID:"+uidv+"@skywork","DTSTAMP:"+stamp(now)+"T090000Z",dt,
"SUMMARY:"+esc2((isTrain(t)?"[อบรม] ":isMeet(t)?"[ประชุม] ":"")+t.title),
"DESCRIPTION:"+esc2([gLabel(t.track),t.place,t.attendees,t.company?cLabel(t.company):"",t.owner,t.note].filter(Boolean).join(" · ")),
"BEGIN:VALARM","TRIGGER:-P2D","ACTION:DISPLAY","DESCRIPTION:"+esc2(t.title),"END:VALARM","END:VEVENT");
});});
out.push("END:VCALENDAR");
return out.join("\r\n");
}
function downloadICS(){
const a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([icsText()],{type:"text/calendar;charset=utf-8"}));
a.download="sky-work.ics"; document.body.appendChild(a); a.click();
setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
}
async function notifyToday(force){
if(!("Notification" in window))return false;
if(Notification.permission!=="granted"){ if(!force)return false;
const p=await Notification.requestPermission(); if(p!=="granted")return false; }
const key="sw-notified-"+new Date().toDateString();
if(!force){ try{ if(localStorage.getItem(key))return true; }catch(e){} }
const w=dueSoon(2), pr=prepDue(2);
const n=w.late.length+w.soon.length+pr.length;
if(n)new Notification("Sky Work",{body:[w.late.length?`เลยกำหนด ${w.late.length} งาน`:"",w.soon.length?`ครบกำหนดใน 2 วัน ${w.soon.length} งาน`:"",pr.length?`ต้องเตรียมข้อมูลประชุม ${pr.length} รายการ`:""].filter(Boolean).join(" · "),icon:"icon-192.png"});
else if(force)new Notification("Sky Work",{body:"ไม่มีงานที่ครบกำหนดใน 2 วันนี้ 🎉",icon:"icon-192.png"});
try{localStorage.setItem(key,"1");}catch(e){}
return true;
}
function home(){
const now=new Date();
const scoped=items.filter(inScope);
const A=scoped.filter(t=>t.track!=="idea");
const cnt=s=>A.filter(t=>t.status===s).length;
const done=cnt("เสร็จสิ้น"), run=cnt("กำลังดำเนินการ"), wait=cnt("รอดำเนินการ");
const bud=scoped.reduce((s,t)=>s+budgetOf(t),0), act=scoped.reduce((s,t)=>s+(+t.actual||0),0);
const over=items.filter(t=>budgetOf(t)>0&&(+t.actual||0)>budgetOf(t));
const up=items.filter(t=>t.date&&new Date(t.date)>=new Date(now.toDateString())&&t.status!=="เสร็จสิ้น")
.sort((a,b)=>a.date<b.date?-1:1).slice(0,6);
const pct=A.length?Math.round(done/A.length*100):0;
const byMonth=MTH.map((_,i)=>items.filter(t=>monthsOf(t).includes(i+1)).length);
return header("สวัสดีค่ะ วิม 👋","Sky Work · ทุกงานรวมที่เดียว ซิงก์ทุกเครื่อง")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(()=>{const w=dueSoon();
const pr=prepDue(3);
return (pr.length?`<div class="banner bad">${svg(ICON.meet,19)} ต้องเตรียมข้อมูลก่อนประชุม <b>${pr.length}</b> รายการ — ${esc(pr.slice(0,2).map(x=>x.t.title).join(" · "))}${pr.length>2?" …":""}</div>`:"")
+(w.late.length?`<div class="banner bad">${svg(ICON.bell,19)} เลยกำหนดแล้ว <b>${w.late.length}</b> งาน — ${esc(w.late.slice(0,2).map(t=>t.title).join(" · "))}${w.late.length>2?" …":""}</div>`:"")
+(w.soon.length?`<div class="banner">${svg(ICON.bell,19)} ครบกำหนดใน 7 วัน <b>${w.soon.length}</b> งาน — ${esc(w.soon.slice(0,2).map(t=>t.title).join(" · "))}${w.soon.length>2?" …":""}</div>`:"");})()+
(over.length?`<div class="banner">${svg(ICON.bell,19)} มี ${over.length} งานที่ใช้งบเกินแผน — ดูที่หน้างบประมาณ</div>`:"")+
`<div class="dash">
<div class="card hero span2"><div class="lab">ความคืบหน้า · ${scopeLabel()}</div>
<div class="big">${pct}%</div>
<div class="meta"><span>เสร็จแล้ว ${done} งาน</span><span>เหลืออีก ${A.length-done} งาน</span></div>
<div class="prog"><i style="width:${pct}%"></i></div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> กำลังดำเนินการ</div>
<div class="v">${run}</div><div class="d">รอเริ่มอีก ${wait} งาน</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> งบคงเหลือ · ${scopeLabel()}</div>
<div class="v">${baht(bud-act)}</div><div class="d">ใช้ไป ${baht(act)} จาก ${baht(bud)}</div>
<div class="bar"><i class="${act>bud?"hot":""}" style="width:${bud?Math.min(100,act/bud*100):0}%"></i></div></div>
<div class="card span2"><h2>สัดส่วนสถานะงาน <small>${scopeLabel()} · ${A.length} งาน</small></h2>
<div class="donutwrap">
${donut([{n:"เสร็จสิ้น",v:done,c:"var(--ok)"},{n:"กำลังดำเนินการ",v:run,c:"var(--run)"},{n:"รอดำเนินการ",v:wait,c:"var(--wait)"}],A.length,"งานทั้งหมด")}
<div class="dlist">
<div><i style="background:var(--ok)"></i>เสร็จสิ้น<b>${done}</b></div>
<div><i style="background:var(--run)"></i>กำลังดำเนินการ<b>${run}</b></div>
<div><i style="background:var(--wait)"></i>รอดำเนินการ<b>${wait}</b></div></div></div></div>
<div class="card span2"><h2>จำนวนงานรายเดือน <small>ทั้งปี ${R.year+543}</small></h2>
${bars(byMonth,MTH,v=>v||"",now.getMonth())}</div>
<div class="card span2"><h2>งานใน${scopeLabel()} <small>${scoped.filter(t=>t.status!=="เสร็จสิ้น").length} รายการที่ยังไม่ปิด</small></h2>
<div class="list">${scoped.filter(t=>t.status!=="เสร็จสิ้น").slice(0,6).map(t=>liRow(t)).join("")||`<div class="empty">ไม่มีงานค้างในช่วงนี้ 🎉</div>`}</div></div>
<div class="card span2"><h2>กำหนดการถัดไป <small>เรียงตามวันที่</small></h2>
<div class="list">${up.map(t=>liRow(t,true)).join("")||`<div class="empty">ยังไม่มีงานที่ระบุวันที่</div>`}</div></div>
</div>`;
}
function all(){
const list=items.filter(inScope).filter(t=>
(!F.track||t.track===F.track)&&(!F.type||t.type===F.type)&&(!F.status||t.status===F.status)&&
(!F.company||t.company===F.company)&&
(!F.q||(t.title+" "+(t.note||"")+" "+(t.owner||"")+" "+(t.code||"")+" "+glLabel(glKeyOf(t.gl1))).toLowerCase().includes(F.q.toLowerCase())))
.sort((a,b)=>(a.date||"9999")<(b.date||"9999")?-1:1);
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const mobile=matchMedia("(max-width:820px)").matches;
return header("งานทั้งหมด",`${list.length} จาก ${items.length} รายการ · แตะเพื่อแก้ไข`)+
`<div class="toolbar">${scopeBar("sc1")}</div>
<div class="toolbar">
<input type="search" id="q" placeholder="ค้นหางาน / ผู้รับผิดชอบ" value="${esc(F.q)}">
<select id="fl-company">${opt([["","ทุกบริษัท"],...visible(companies).map(c=>[c.key,c.label])],F.company)}</select>
<select id="fl-track">${opt([["","ทุกกลุ่ม"],...visible(groups).map(g=>[g.key,g.label])],F.track)}</select>
<select id="fl-type">${opt([["","ทุกประเภท"],...types().map(t=>[t,t])],F.type)}</select>
<select id="fl-status">${opt([["","ทุกสถานะ"],...STATUS.map(s=>[s,s])],F.status)}</select>
</div>`+
(mobile
? `<div class="card"><div class="list">${list.map(t=>liRow(t,true)).join("")||`<div class="empty">ไม่พบงานตามเงื่อนไขนี้</div>`}</div></div>`
: `<div class="tblwrap"><table>
<thead><tr><th>งาน</th><th>บริษัท</th><th>กลุ่ม</th><th>เวลา</th><th>ผู้รับผิดชอบ</th><th style="text-align:right">งบ</th><th style="text-align:right">ใช้จริง</th><th>สถานะ</th></tr></thead>
<tbody>${list.map(t=>`<tr data-id="${t._id}">
<td><div style="font-weight:600">${esc(t.title)}</div>${t.note?`<div class="t-note">${esc(t.note)}</div>`:""}</td>
<td>${esc(t.company?cLabel(t.company):"—")}</td>
<td><span class="tag sky">${esc(gLabel(t.track))}</span></td>
<td class="num">${rr(t)?esc(rruleText(t)):(t.date?fmtDate(t.date):esc(t.recurring||"—"))}</td>
<td>${esc(t.owner||"—")}</td>
<td class="num">${budgetOf(t)?baht(budgetOf(t)):"—"}</td>
<td class="num"${(+t.actual||0)>budgetOf(t)&&budgetOf(t)?' style="color:var(--over);font-weight:600"':""}>${t.actual?baht(t.actual):"—"}</td>
<td><span class="pill ${sCls(t.status)}">${esc(t.status)}</span></td></tr>`).join("")}</tbody></table>
${list.length?"":`<div class="card"><div class="empty">ไม่พบงานตามเงื่อนไขนี้</div></div>`}</div>`);
}
function tasksOnDay(y,m,d){
const dt=new Date(y,m,d);
return items.filter(t=>occursOn(t,dt));
}
function calView(){
const today=new Date(), m=R.month, y=R.year;
const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
const recurring=items.filter(t=>!rr(t)&&!t.date&&monthsOf(t).includes(m+1));
const cells=[];
for(let i=0;i<first;i++)cells.push(`<div class="day blank"></div>`);
for(let d=1;d<=days;d++){
const ts=tasksOnDay(y,m,d);
const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
const sel=R.selDay===d;
cells.push(`<div class="day${isToday?" today":""}${sel?" sel":""}" data-day="${d}">
<span class="dn">${d}</span>
<span class="dots">${ts.slice(0,4).map(t=>`<i style="background:${sColor(t.status)}" title="${esc(t.title)}"></i>`).join("")}</span>
${ts.length>4?`<span class="more">+${ts.length-4}</span>`:""}</div>`);
}
const selTasks=R.selDay?tasksOnDay(y,m,R.selDay):[];
return header("ปฏิทิน","แตะวันที่เพื่อดูงานของวันนั้น · จุดสีคือสถานะงาน")+
`<div class="toolbar">
<div class="seg" id="calmode">
<button data-cm="month" aria-pressed="${R.calMode==="month"}">รายเดือน</button>
<button data-cm="year" aria-pressed="${R.calMode==="year"}">ทั้งปี</button></div>
${R.calMode==="month"?`<div class="seg"><button id="pm">‹</button>
<select id="calMonth" style="border:0;background:var(--card);border-radius:999px;padding:6px 14px;font-weight:600">${MTHFULL.map((x,i)=>`<option value="${i}"${i===m?" selected":""}>${x} ${y+543}</option>`).join("")}</select>
<button id="nm">›</button></div>${yearSel("yrSel2")}`:""}
</div>`+
(R.calMode==="month"
? `<div class="dash">
<div class="card span3"><h2>${MTHFULL[m]} ${y+543} <small>${items.filter(t=>occDays(t,y,m).length).length} งานในเดือนนี้</small></h2>
<div class="mcal">${DOW.map(d=>`<div class="dh">${d}</div>`).join("")}${cells.join("")}</div>
<div class="legend" style="margin-top:14px">
<span><i style="background:var(--ok)"></i>เสร็จสิ้น</span>
<span><i style="background:var(--run)"></i>กำลังดำเนินการ</span>
<span><i style="background:var(--wait)"></i>รอดำเนินการ</span></div></div>
<div class="card">
<h2>${R.selDay?`วันที่ ${R.selDay} ${MTH[m]}`:"งานประจำเดือนนี้"}</h2>
<div class="list">${
R.selDay
? (selTasks.map(t=>liRow(t)).join("")||`<div class="empty">วันนี้ไม่มีงานที่กำหนดไว้<br><span style="font-size:12.5px">กด “เพิ่มงาน” เพื่อใส่งานใหม่</span></div>`)
: (recurring.map(t=>liRow(t)).join("")||`<div class="empty">ไม่มีงานประจำในเดือนนี้</div>`)}</div>
${R.selDay?`<button class="btn ghost sm" id="clearDay" style="margin-top:12px">ดูงานประจำเดือนแทน</button>`:""}
</div></div>`
: yearGrid());
}
function yearGrid(){
const now=new Date().getMonth()+1;
const list=items.filter(t=>monthsOf(t).length).sort((a,b)=>monthsOf(a)[0]-monthsOf(b)[0]);
return `<div class="card">
<div class="legend">
<span><i style="background:var(--ok)"></i>เสร็จสิ้น</span>
<span><i style="background:var(--run)"></i>กำลังดำเนินการ</span>
<span><i style="background:var(--wait)"></i>รอดำเนินการ</span></div>
<div class="cal"><div class="calgrid">
<div class="mh" style="text-align:left">งาน</div>${MTH.map((x,i)=>`<div class="mh${i+1===now?" now":""}">${x}</div>`).join("")}
${list.map(t=>{const ms=monthsOf(t);return `<div class="cname" data-id="${t._id}">${esc(t.title)}</div>`+
MTH.map((_,i)=>`<div class="cell${i+1===now?" now":""}">${ms.includes(i+1)?`<span class="dot" style="background:${sColor(t.status)}"></span>`:""}</div>`).join("");}).join("")}
</div></div></div>`;
}
function ledgerIn(scope,month){
return ledger.filter(x=>{
if(!x.date)return false;
const d=new Date(x.date);
if(d.getFullYear()!==R.year)return false;
if(scope==="month")return d.getMonth()===month;
if(scope==="week")return weekOf(x.date)===nowWeek;
return true;
});
}
function budget(){
const scope=R.budScope, m=R.budMonth;
const tx=ledgerIn(scope,m);
const inc=tx.filter(x=>x.kind==="income").reduce((s,x)=>s+(+x.amount||0),0);
const exp=tx.filter(x=>x.kind!=="income").reduce((s,x)=>s+(+x.amount||0),0);
const inYear=items.filter(t=>!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==R.year));
const taskPlan={}, spentByGL={}, planByGL={};
const add=(o,k,v)=>{if(!v)return;o[k]=(o[k]||0)+v;};
inYear.forEach(t=>{
const k1=glKeyOf(t.gl1)||"", k2=glKeyOf(t.gl2)||"";
add(taskPlan,k1,+t.b1||0); add(taskPlan,k2||k1,+t.b2||0);
add(spentByGL,k1,+t.actual||0);
});
gls.forEach(g=>{ planByGL[g.key]=Math.max(+g.budget||0, taskPlan[g.key]||0); });
Object.keys(taskPlan).forEach(k=>{ if(planByGL[k]==null)planByGL[k]=taskPlan[k]; });
ledger.filter(x=>x.kind!=="income"&&x.date&&new Date(x.date).getFullYear()===R.year)
 .forEach(x=>add(spentByGL,x.gl||"",+x.amount||0));
const keys=[...new Set([...gls.map(g=>g.key),...Object.keys(planByGL),...Object.keys(spentByGL)])]
 .filter(k=>planByGL[k]||spentByGL[k]);
const B=keys.reduce((s,k)=>s+(planByGL[k]||0),0);
const A=keys.reduce((s,k)=>s+(spentByGL[k]||0),0);
const noGL=inYear.filter(t=>budgetOf(t)>0&&!glKeyOf(t.gl1)&&!glKeyOf(t.gl2)).length;
const ceilOnly=gls.filter(g=>(+g.budget||0)>(taskPlan[g.key]||0)&&(+g.budget||0)>0).length;
const monthsInc=MTH.map((_,i)=>ledger.filter(x=>x.date&&x.kind==="income"&&new Date(x.date).getMonth()===i&&new Date(x.date).getFullYear()===R.year).reduce((s,x)=>s+(+x.amount||0),0));
const monthsExp=MTH.map((_,i)=>ledger.filter(x=>x.date&&x.kind!=="income"&&new Date(x.date).getMonth()===i&&new Date(x.date).getFullYear()===R.year).reduce((s,x)=>s+(+x.amount||0),0));
const pct=B?Math.min(100,Math.round(A/B*100)):0;
const recent=tx.slice().sort((a,b)=>a.date<b.date?1:-1).slice(0,10);
return `<div class="head"><div><h1>งบประมาณ & บัญชี</h1><div class="sub">ตั้งงบรายปีต่อหมวด GL แล้วแท็กค่าใช้จ่ายเข้าหมวดได้เลย · ${syncChip()}</div></div>
<button class="btn addbtn" id="addTx">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>บันทึกเงิน</span></button></div>
<div class="toolbar"><div class="seg" id="budsc">
<button data-bs="year" aria-pressed="${scope==="year"}">รายปี</button>
<button data-bs="month" aria-pressed="${scope==="month"}">รายเดือน</button>
<button data-bs="week" aria-pressed="${scope==="week"}">รายสัปดาห์</button>
${scope==="month"?`<select id="budMonth" style="border:0;background:var(--card);border-radius:999px;padding:6px 12px">${MTHFULL.map((x,i)=>`<option value="${i}"${i===m?" selected":""}>${x}</option>`).join("")}</select>`:""}
</div></div>
<div class="dash">
<div class="card hero span2"><div class="lab">ใช้ไปแล้วจากงบทั้งปี ${R.year+543}</div>
<div class="big">${pct}%</div>
<div class="meta"><span>ใช้จริง ${baht(A)} ฿</span><span>งบตั้งไว้ ${baht(B)} ฿</span></div>
<div class="prog"><i style="width:${pct}%"></i></div></div>
<div class="card stat"><div class="k"><span class="ic" style="background:var(--ok-soft);color:var(--ok)">${svg(ICON.up,16)}</span> รายรับ</div>
<div class="v" style="color:var(--ok)">${baht(inc)}</div><div class="d">${scope==="year"?"ทั้งปี":scope==="month"?MTHFULL[m]:"สัปดาห์นี้"}</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.down,16)}</span> รายจ่าย</div>
<div class="v">${baht(exp)}</div><div class="d">สุทธิ ${baht(inc-exp)} ฿</div></div>
<div class="card span2"><h2>รายรับ – รายจ่ายรายเดือน <small>ปี ${R.year+543}</small></h2>
${dualBars(monthsInc,monthsExp,MTH,new Date().getMonth())}
<div class="legend"><span><i style="background:var(--ok)"></i>รายรับ</span><span><i style="background:var(--accent-2)"></i>รายจ่าย</span></div></div>
<div class="card span2"><h2>รายการล่าสุด <small>${tx.length} รายการในช่วงนี้</small></h2>
<div class="list">${recent.map(x=>`<div class="li" data-tx="${x._id}">
<div class="ic" style="background:${x.kind==="income"?"var(--ok-soft)":"var(--line-2)"};color:${x.kind==="income"?"var(--ok)":"var(--accent)"}">${svg(x.kind==="income"?ICON.up:ICON.down,16)}</div>
<div class="tx"><div class="t1">${esc(x.note||glLabel(x.gl))}</div>
<div class="t2">${fmtDate(x.date)} · ${esc(glLabel(x.gl))}${x.company?" · "+esc(cLabel(x.company)):""}</div></div>
<b style="color:${x.kind==="income"?"var(--ok)":"inherit"};font-variant-numeric:tabular-nums">${x.kind==="income"?"+":"−"}${baht(x.amount)}</b></div>`).join("")
||`<div class="empty">ยังไม่มีรายการในช่วงนี้<br><span style="font-size:12.5px">กด “บันทึกเงิน” เพื่อเพิ่มรายรับหรือรายจ่าย</span></div>`}</div></div>
<div class="card span4"><h2>งบตามหมวด GL <small>ใช้จริง / งบที่ตั้งไว้ · รวมงบจากงานและงบที่ตั้งเองในหน้าตั้งค่า</small></h2>
${keys.length?keys.sort((x,y)=>(planByGL[y]||0)-(planByGL[x]||0)).map(k=>{
const a=spentByGL[k]||0,b=planByGL[k]||0,p=b?Math.min(100,a/b*100):(a?100:0);
const nm=k?glLabel(k):"ยังไม่ระบุหมวด GL";
return `<div class="glrow"><div class="top"><span>${esc(nm)}</span>
<span class="amt"${a>b&&b?' style="color:var(--over);font-weight:600"':""}>${baht(a)} / ${baht(b)}</span></div>
<div class="bar"><i class="${a>b&&b?"hot":""}" style="width:${p}%"></i></div></div>`;}).join("")
:`<div class="empty">ยังไม่มีงบในปีนี้ — ใส่งบในงานแต่ละงาน หรือเพิ่มหมวด GL ที่หน้าตั้งค่า</div>`}
${noGL?`<div class="hint">มี <b>${noGL}</b> งานที่ใส่งบไว้แต่ยังไม่ได้เลือกหมวด GL — เปิดงานแล้วเลือกหมวด เพื่อให้ยอดแยกตามหมวดได้</div>`:""}
</div>
</div>`;
}
function pipeline(){
const g=k=>items.filter(t=>t.track===k&&inScope(t));
const card=t=>`<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${svg(ICON.pipeline,17)}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div><div class="t2">${esc(t.note||t.group||gLabel(t.track))}</div></div>
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;
const block=(title,key)=>`<div class="card span2"><h2>${esc(title)} <small>${g(key).length} รายการ</small></h2>
<div class="list">${g(key).map(card).join("")||`<div class="empty">ยังไม่มีงานในกลุ่มนี้</div>`}</div></div>`;
const extra=groups.filter(x=>!["annual"].includes(x.key));
return header("โปรเจค & กลุ่มงาน","ทุกกลุ่มที่ไม่ใช่งานประจำปี อยู่ฐานข้อมูลเดียวกัน")+
`<div class="toolbar">${scopeBar("sc1")}</div>
<div class="dash">${extra.map(x=>block(x.label,x.key)).join("")}</div>`;
}
function meet(){
const ms=items.filter(t=>isMeet(t));
const scoped=ms.filter(inScope);
const withNext=ms.map(t=>({t,d:dueDate(t),p:prepDate(t)})).filter(x=>x.d);
const today=new Date(); today.setHours(0,0,0,0);
const upcoming=withNext.filter(x=>daysTo(x.d)>=0&&daysTo(x.d)<=14).sort((a,b)=>a.d-b.d);
const prep=withNext.filter(x=>x.p&&x.t.status!=="เสร็จสิ้น"&&daysTo(x.d)>=0).sort((a,b)=>a.p-b.p);
const prepNow=prep.filter(x=>daysTo(x.p)<=0), prepSoon=prep.filter(x=>daysTo(x.p)>0&&daysTo(x.p)<=7);
const routine=ms.filter(t=>rr(t)).sort((a,b)=>(nextOcc(a)||0)-(nextOcc(b)||0));
const oneoff=ms.filter(t=>!rr(t)&&t.date).sort((a,b)=>a.date<b.date?-1:1);
const row=(t,d,p)=>{const n=d?daysTo(d):null;
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${tShow(t.time)?`<b style="color:var(--accent)">${tShow(t.time)}</b> · `:""}${rruleText(t)?esc(rruleText(t))+" · ":""}${n!=null?(n===0?"วันนี้":n===1?"พรุ่งนี้":n<0?"ผ่านไปแล้ว":"อีก "+n+" วัน"):""}${t.place?" · "+esc(t.place):""}${t.attendees?" · "+esc(t.attendees):""}</div></div>
${p?`<span class="tag${daysTo(p)<=0?"":" sky"}" ${daysTo(p)<=0?'style="background:var(--over-soft);color:var(--over);font-weight:600"':""}>เตรียม ${daysTo(p)<=0?"แล้ว!":"อีก "+daysTo(p)+" ว."}</span>`:""}
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;};
const prepRow=x=>`<div class="li" data-id="${x.t._id}">
<div class="ic" style="background:${daysTo(x.p)<=0?"var(--over-soft)":"var(--run-soft)"};color:${daysTo(x.p)<=0?"var(--over)":"var(--run)"}">${x.p.getDate()}<br>${MTH[x.p.getMonth()]}</div>
<div class="tx"><div class="t1">${esc(x.t.title)}</div>
<div class="t2">ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${tShow(x.t.time)?" "+tShow(x.t.time):""} · เตรียมล่วงหน้า ${x.t.prepDays} วัน${x.t.prepNote?" · "+esc(x.t.prepNote):""}</div></div>
<span class="pill ${daysTo(x.p)<=0?"s-wait":sCls(x.t.status)}">${daysTo(x.p)<0?"เลยวันเตรียม "+(-daysTo(x.p))+" วัน":daysTo(x.p)===0?"เตรียมวันนี้":"อีก "+daysTo(x.p)+" วัน"}</span></div>`;
const byDow=DOWFULL.map((_,i)=>routine.filter(t=>(t.rrule.weekdays||[]).includes(i)).length);
return header("การประชุม","ประชุมประจำ ประชุมเฉพาะกิจ และงานที่ต้องเตรียมข้อมูลก่อนประชุม")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(prepNow.length?`<div class="banner bad">${svg(ICON.bell,19)} ถึงกำหนดเตรียมข้อมูลแล้ว <b>${prepNow.length}</b> การประชุม — ${esc(prepNow.slice(0,2).map(x=>x.t.title).join(" · "))}${prepNow.length>2?" …":""}</div>`:"")+
(prepSoon.length?`<div class="banner">${svg(ICON.clock,19)} ใกล้ถึงวันเตรียมข้อมูล <b>${prepSoon.length}</b> การประชุมใน 7 วัน</div>`:"")+
`<div class="dash">
<div class="card hero span2"><div class="lab">การประชุม · ${scopeLabel()}</div>
<div class="big">${scoped.length}</div>
<div class="meta"><span>ประชุมประจำ ${routine.length} รายการ</span><span>เฉพาะกิจ ${oneoff.length} รายการ</span></div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> ต้องเตรียมข้อมูล</div>
<div class="v">${prep.length}</div><div class="d">${prepNow.length?`ถึงกำหนดแล้ว ${prepNow.length}`:"ยังไม่ถึงกำหนด"}</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.cal,16)}</span> ใน 14 วันข้างหน้า</div>
<div class="v">${upcoming.length}</div><div class="d">ครั้งถัดไป ${upcoming[0]?upcoming[0].d.getDate()+" "+MTH[upcoming[0].d.getMonth()]:"—"}</div></div>
<div class="card span2"><h2>ต้องเตรียมข้อมูลก่อนประชุม <small>เรียงตามวันที่ต้องเริ่มเตรียม</small></h2>
<div class="list">${prep.slice(0,10).map(prepRow).join("")||`<div class="empty">ยังไม่มีการประชุมที่ตั้งวันเตรียมข้อมูลไว้ — เปิดการประชุมแล้วใส่ “เตรียมล่วงหน้า (วัน)”</div>`}</div></div>
<div class="card span2"><h2>ตารางประชุม 14 วันข้างหน้า <small>${upcoming.length} ครั้ง</small></h2>
<div class="list">${upcoming.slice(0,12).map(x=>row(x.t,x.d,x.p)).join("")||`<div class="empty">ไม่มีการประชุมใน 14 วันนี้</div>`}</div></div>
<div class="card span2"><h2>ประชุมประจำรายสัปดาห์ <small>กระจายตามวัน</small></h2>
${bars(byDow,DOW,v=>v||"",new Date().getDay())}</div>
<div class="card span2"><h2>ประชุมประจำทั้งหมด <small>${routine.length} รายการ</small></h2>
<div class="list">${routine.map(t=>row(t,dueDate(t),prepDate(t))).join("")||`<div class="empty">ยังไม่มีประชุมประจำ — เพิ่มงานแล้วตั้ง “การเกิดซ้ำ”</div>`}</div></div>
<div class="card span4"><h2>ประชุมเฉพาะกิจ <small>${oneoff.length} รายการ</small></h2>
<div class="list">${oneoff.slice(0,20).map(t=>row(t,dueDate(t),prepDate(t))).join("")||`<div class="empty">ยังไม่มี</div>`}</div></div>
</div>`;
}
function train(){
const ty=items.filter(t=>isTrain(t)&&inScope(t));
const sum=(a,k)=>a.reduce((x,t)=>x+(+t[k]||0),0);
const pax=sum(ty,"pax"), hrs=ty.reduce((x,t)=>x+(+t.hours||0)*(+t.pax||1),0);
const cost=ty.reduce((x,t)=>x+((+t.actual||0)||budgetOf(t)),0);
const done=ty.filter(t=>t.status==="เสร็จสิ้น").length;
const kinds=["กฎหมาย","ภายใน","ภายนอก"];
const byKind=k=>ty.filter(t=>trainKind(t)===k);
const dsdList=d=>items.filter(t=>isTrain(t)&&(t.dsd||"")===d&&inScope(t));
const waiting=dsdList("รอยื่น"), sent=dsdList("ยื่นแล้ว"), okd=dsdList("อนุมัติแล้ว"), bad=dsdList("ไม่ผ่าน");
const lawLate=byKind("กฎหมาย").filter(t=>{const d=dueDate(t);return t.status!=="เสร็จสิ้น"&&d&&daysTo(d)<0;});
const byMonth=MTH.map((_,i)=>items.filter(t=>isTrain(t)&&monthsOf(t).includes(i+1)).length);
const card=t=>{const d=dueDate(t);
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${esc(trainKind(t))}${t.vendor?" · "+esc(t.vendor):""}${t.pax?" · "+t.pax+" คน":""}${t.hours?" · "+t.hours+" ชม.":""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
${t.dsd&&t.dsd!=="ไม่ต้องยื่น"?`<span class="tag sky">กรมพัฒฯ ${esc(t.dsd)}</span>`:""}
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;};
const board=(title,arr,note)=>`<div class="card span2"><h2>${esc(title)} <small>${arr.length} หลักสูตร</small></h2>
<div class="list">${arr.map(card).join("")||`<div class="empty">${esc(note||"ยังไม่มีรายการ")}</div>`}</div></div>`;
return header("ฝึกอบรม","หลักสูตรทั้งหมด ผู้เข้าอบรม ชั่วโมง และสถานะการยื่นกรมพัฒนาฝีมือแรงงาน")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(lawLate.length?`<div class="banner bad">${svg(ICON.bell,19)} อบรมตามกฎหมาย ${lawLate.length} หลักสูตรเลยกำหนดแล้วและยังไม่ปิดงาน</div>`:"")+
(waiting.length?`<div class="banner">${svg(ICON.bell,19)} รอยื่นกรมพัฒฯ ${waiting.length} หลักสูตร</div>`:"")+
`<div class="dash">
<div class="card hero span2"><div class="lab">หลักสูตร · ${scopeLabel()}</div>
<div class="big">${ty.length}</div>
<div class="meta"><span>ปิดงานแล้ว ${done}</span><span>คงเหลือ ${ty.length-done}</span></div>
<div class="prog"><i style="width:${ty.length?Math.round(done/ty.length*100):0}%"></i></div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.train,16)}</span> ผู้เข้าอบรม</div>
<div class="v">${baht(pax)}</div><div class="d">รวม ${baht(Math.round(hrs))} คน-ชั่วโมง</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> ค่าอบรมต่อหัว</div>
<div class="v">${pax?baht(Math.round(cost/pax)):"—"}</div><div class="d">ค่าใช้จ่ายรวม ${baht(cost)} ฿</div></div>
<div class="card span2"><h2>สัดส่วนประเภทหลักสูตร <small>${ty.length} หลักสูตร</small></h2>
<div class="donutwrap">
${donut(kinds.map((k,i)=>({n:k,v:byKind(k).length,c:["var(--over)","var(--accent)","var(--run)"][i]})),ty.length,"หลักสูตร")}
<div class="dlist">${kinds.map((k,i)=>`<div><i style="background:${["var(--over)","var(--accent)","var(--run)"][i]}"></i>${k}<b>${byKind(k).length}</b></div>`).join("")}</div></div></div>
<div class="card span2"><h2>แผนอบรมรายเดือน <small>ทั้งปี ${R.year+543}</small></h2>
${bars(byMonth,MTH,v=>v||"",new Date().getMonth())}</div>
<div class="card span4"><h2>กรมพัฒนาฝีมือแรงงาน <small>สถานะการยื่นรับรองหลักสูตร</small></h2>
<div class="legend" style="margin:10px 0 2px">
<span><i style="background:var(--wait)"></i>รอยื่น ${waiting.length}</span>
<span><i style="background:var(--run)"></i>ยื่นแล้ว ${sent.length}</span>
<span><i style="background:var(--ok)"></i>อนุมัติแล้ว ${okd.length}</span>
${bad.length?`<span><i style="background:var(--over)"></i>ไม่ผ่าน ${bad.length}</span>`:""}</div>
<div class="list">${[...waiting,...sent,...bad].map(card).join("")||`<div class="empty">ไม่มีหลักสูตรที่ค้างยื่น 🎉</div>`}</div></div>
${board("อบรมตามกฎหมาย",byKind("กฎหมาย"),"ยังไม่มีหลักสูตรตามกฎหมายในช่วงนี้")}
${board("อบรมภายใน",byKind("ภายใน"))}
${board("อบรมภายนอก",byKind("ภายนอก"))}
</div>`;
}
function setView(){
const body={groups:setGroups,companies:setCompanies,gl:setGL,theme:setTheme_,remind:setRemind,import:setImport,connect:setConnect}[settab]();
return header("ตั้งค่า","ทุกอย่างที่ปรับได้อยู่ในนี้ · เปลี่ยนแล้วมีผลทุกหน้าและทุกเครื่อง",false)+
`<div class="toolbar"><div class="seg" id="settabs">
${SETTABS.map(([k,l])=>`<button data-st="${k}" aria-pressed="${k===settab}">${l}</button>`).join("")}
</div></div>${body}`;
}
const ICON_UP='<path d="M12 19V5M6 11l6-6 6 6"/>', ICON_DN='<path d="M12 5v14M6 13l6 6 6-6"/>';
const ICON_EYE='<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>';
const ICON_EYEOFF='<path d="M4 4l16 16"/><path d="M9.9 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.3 4M6.3 8A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.7-.5"/>';
function moveBtns(kind,i,n,hidden){
return `<button class="iconbtn" data-mv="${kind}:${i}:-1" ${i===0?"disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,15)}</button>
<button class="iconbtn" data-mv="${kind}:${i}:1" ${i===n-1?"disabled":""} title="เลื่อนลง">${svg(ICON_DN,15)}</button>
<button class="iconbtn${hidden?"":" on"}" data-hide="${kind}:${i}" title="${hidden?"กดเพื่อแสดง":"กดเพื่อซ่อน"}">${svg(hidden?ICON_EYEOFF:ICON_EYE,15)}</button>`;
}
const nameInput=(attr,key,val)=>`<input class="nm" ${attr}="${esc(key)}" value="${esc(val)}" aria-label="ชื่อ ${esc(val)}">`;
function setRemind(){
const w=dueSoon(14);
const can="Notification" in window;
const st=can?Notification.permission:"no";
return `<div class="card"><h2>เตือนงานที่ใกล้ถึงกำหนด <small>ช่วง 14 วันข้างหน้า</small></h2>
<div class="list">${[...w.late,...w.soon].slice(0,12).map(t=>{const d=dueDate(t),n=daysTo(d);
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--line-2);color:${n<0?"var(--over)":sColor(t.status)}">${d.getDate()}<br>${MTH[d.getMonth()]}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div><div class="t2">${n<0?"เลยกำหนด "+(-n)+" วัน":n===0?"ครบกำหนดวันนี้":"อีก "+n+" วัน"} · ${esc(gLabel(t.track))}</div></div>
<span class="pill ${n<0?"s-wait":sCls(t.status)}">${esc(t.status)}</span></div>`;}).join("")||`<div class="empty">ไม่มีงานครบกำหนดใน 14 วันนี้ 🎉</div>`}</div>
<div class="hint">รายการนี้จะขึ้นเป็นแถบเตือนที่หน้าภาพรวมด้วย</div></div>
<div class="card" style="margin-top:16px"><h2>แจ้งเตือนบนเครื่องนี้</h2>
<div class="hint" style="margin-top:6px">เปิดครั้งเดียว ระบบจะเด้งเตือนวันละครั้งเมื่อเปิดแอป ถ้ามีงานครบกำหนดใน 2 วัน</div>
<div class="addg"><button class="btn${st==="granted"?" ghost":""}" id="notifOn">${svg(ICON.bell,17)}${st==="granted"?"ทดสอบแจ้งเตือน":"เปิดการแจ้งเตือน"}</button></div>
${st==="denied"?`<div class="banner bad" style="margin-top:12px">เบราว์เซอร์ปิดการแจ้งเตือนของเว็บนี้ไว้ — เปิดใหม่ได้ที่รูปแม่กุญแจหน้าช่อง URL</div>`:""}
${can?"":`<div class="banner bad" style="margin-top:12px">เครื่องนี้ไม่รองรับการแจ้งเตือน ใช้วิธีซิงก์เข้าปฏิทินด้านล่างแทนค่ะ</div>`}</div>
<div class="card" style="margin-top:16px"><h2>ซิงก์เข้า Google Calendar</h2>
<div class="hint" style="margin-top:6px">ดาวน์โหลดไฟล์ปฏิทิน (.ics) ที่รวมงานทุกงานที่มีวันที่ รวมงานที่ตั้งเกิดซ้ำล่วงหน้า 14 เดือน พร้อมเตือนล่วงหน้า 2 วัน</div>
<div class="addg"><button class="btn" id="icsgo">${svg(ICON.cal,17)}ดาวน์โหลดไฟล์ปฏิทิน (.ics)</button></div>
<div class="code">Google Calendar → Settings → Import &amp; export → Import → เลือกไฟล์ sky-work.ics → Import
มือถือ: เปิดไฟล์ .ics แล้วเลือก "เพิ่มลงในปฏิทิน"</div>
<div class="hint">เพิ่มงานใหม่แล้วดาวน์โหลดใหม่ได้ ระบบใส่รหัสงานกำกับไว้ ปฏิทินจะอัปเดตทับของเดิม ไม่ซ้ำซ้อน</div></div>`;
}
function setGroups(){
return `<div class="card"><h2>กลุ่มงาน <small>${groups.length} กลุ่ม</small></h2>
<div class="rows">${groups.map((g,i)=>{const n=items.filter(t=>t.track===g.key).length;
return `<div class="rw${g.hidden?" off":""}">${nameInput("data-ren",g.key,g.label)}<span class="gc">${n} งาน</span>
${moveBtns("groups",i,groups.length,g.hidden)}
<button class="btn danger sm" data-delg="${esc(g.key)}">ลบ</button></div>`;}).join("")}</div>
<div class="addg"><input id="newg" placeholder="ชื่อกลุ่มใหม่ เช่น งานฝึกอบรม">
<button class="btn" id="addg">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มกลุ่ม</button></div>
${TRAIN_PRESET.every(x=>groups.some(g=>g.label===x.label))?"":`<div class="addg" style="margin-top:10px"><button class="btn ghost" id="preset">${svg(ICON.train,17)}เพิ่มชุดกลุ่มงานฝึกอบรม (${esc(TRAIN_PRESET.filter(x=>!groups.some(g=>g.label===x.label)).map(x=>x.label).join(", "))})</button></div>`}
<div class="hint">พิมพ์ทับเพื่อแก้ชื่อ · ปุ่มลูกศรเลื่อนลำดับ (อันที่ใช้บ่อยไว้บนสุด) · ปุ่มรูปตาซ่อนกลุ่มที่ไม่ได้ใช้ออกจากตัวเลือกทุกหน้า โดยไม่ลบข้อมูล · ลบได้เฉพาะกลุ่มที่ไม่มีงานเหลือ</div></div>`;
}
function setCompanies(){
return `<div class="card"><h2>บริษัทในเครือ <small>${companies.length} บริษัท</small></h2>
<div class="rows">${companies.map((c,i)=>{const n=items.filter(t=>t.company===c.key).length;
return `<div class="rw${c.hidden?" off":""}">${nameInput("data-renc",c.key,c.label)}<span class="gc">${n} งาน</span>
${moveBtns("companies",i,companies.length,c.hidden)}
<button class="btn danger sm" data-delc="${esc(c.key)}">ลบ</button></div>`;}).join("")||`<div class="empty">ยังไม่มีบริษัท</div>`}</div>
<div class="addg"><input id="newc" placeholder="ชื่อบริษัท เช่น LeKise Trading">
<button class="btn" id="addc">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มบริษัท</button></div>
<div class="hint">เรียงลำดับและซ่อนได้เหมือนกลุ่มงาน · ที่ซ่อนไว้จะไม่ขึ้นในตัวเลือกตอนเพิ่มงานและบันทึกเงิน</div></div>`;
}
function setGL(){
const tot=gls.reduce((s,g)=>s+(+g.budget||0),0);
return `<div class="card"><h2>หมวดงบประมาณ (GL) <small>${gls.length} หมวด · รวม ${baht(tot)} ฿</small></h2>
<div class="rows">${gls.map((g,i)=>`<div class="rw${g.hidden?" off":""}">
<input class="glcode" data-renc2="${esc(g.key)}" value="${esc(g.code||"")}" placeholder="รหัส GL" aria-label="รหัส GL">
${nameInput("data-reng",g.key,g.label)}
<input type="number" class="glb" data-glb="${esc(g.key)}" value="${+g.budget||0}" aria-label="งบ ${esc(g.label)}">
${moveBtns("gl",i,gls.length,g.hidden)}
<button class="btn danger sm" data-delgl="${esc(g.key)}">ลบ</button></div>`).join("")||`<div class="empty">ยังไม่มีหมวด GL</div>`}</div>
<div class="addg">
<input id="glcode" placeholder="รหัส GL เช่น 785000000" style="max-width:190px">
<input id="glname" placeholder="ชื่อหมวด เช่น ค่าอบรมและสัมมนา">
<input id="glbud" type="number" placeholder="งบทั้งปี" style="max-width:150px">
<button class="btn" id="addgl">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มหมวด</button></div>
<div class="hint">แก้รหัส ชื่อ หรืองบได้ในช่อง กดนอกช่องแล้วบันทึกทันที · เลื่อนลำดับให้หมวดที่ใช้บ่อยอยู่บนสุด · หมวดที่ซ่อนจะไม่ขึ้นในตัวเลือก แต่ตัวเลขยังรวมอยู่ในสรุปงบ</div></div>`;
}
function setTheme_(){
const cur=theme.preset;
const custom=(theme.custom&&theme.custom.length===5)?theme.custom:PALETTES[0].ramp;
const night=isNight();
return `<div class="card"><h2>โหมดกลางวัน / กลางคืน <small>${night?"ตอนนี้: กลางคืน 🌙":"ตอนนี้: กลางวัน ☀️"}</small></h2>
<div class="seg" id="modeseg" style="margin-top:10px">
<button data-md="auto" aria-pressed="${theme.mode==="auto"}">ตามเวลา</button>
<button data-md="light" aria-pressed="${theme.mode==="light"}">สว่างเสมอ</button>
<button data-md="dark" aria-pressed="${theme.mode==="dark"}">มืดเสมอ</button></div>
<div class="hint">โหมด “ตามเวลา” จะสลับเป็นธีมมืดอัตโนมัติช่วง 18:00–06:00 ตามนาฬิกาของเครื่อง และเปลี่ยนให้เองระหว่างเปิดแอปค้างไว้</div></div>
<div class="card" style="margin-top:16px"><h2>ชุดสีสำเร็จ <small>${PALETTES.length} ชุด</small></h2>
<div class="swgrid">${PALETTES.map(p=>`<button class="swcard${cur===p.key?" on":""}" data-pal="${p.key}">
<div class="sw">${p.ramp.map(c=>`<span style="background:${c}"></span>`).join("")}</div>
<div class="swname">${esc(p.name)}${cur===p.key?" ✓":""}</div><div class="swnote">${esc(p.note)}</div>
<div class="swhex">${p.ramp.map(c=>c.slice(1)).join(" · ")}</div></button>`).join("")}</div></div>
<div class="card" style="margin-top:16px"><h2>ผสมสีเอง <small>ซ้ายอ่อนสุด → ขวาเข้มสุด</small></h2>
<div class="mixer">${custom.map((c,i)=>`<label class="mixc"><input type="color" id="cc${i}" value="${c}">
<span>${["อ่อนสุด","อ่อน","กลาง","เข้ม","เข้มสุด"][i]}</span></label>`).join("")}</div>
<div class="addg"><button class="btn" id="useCustom">${svg(ICON.check,17)}ใช้สีชุดนี้</button>
<button class="btn ghost" id="fromCur">ดึงค่าจากชุดที่ใช้อยู่</button></div></div>`;
}
function setImport(){
return `<div class="card"><h2>นำเข้างานจากไฟล์ CSV</h2>
<div id="impstat">${impPill()}</div>
<div class="hint" style="margin-top:2px">เปิดไฟล์ Excel แล้ว Save As → CSV UTF-8 หรือ Google Sheets → ดาวน์โหลด → CSV แล้วอัปโหลดที่นี่</div>
<div class="addg"><input type="file" id="csvfile" accept=".csv,text/csv" style="background:var(--paper);padding:9px 14px"></div>
<div class="hint">หรือวางข้อความ CSV ลงช่องนี้</div>
<textarea class="csv" id="csvtext" placeholder="ชื่องาน,กลุ่ม,ประเภท,สถานะ,ผู้รับผิดชอบ,วันที่,บริษัท,หมวด GL,งบ,ใช้จริง,ผู้เข้าอบรม,ชั่วโมง,วิทยากร/สถาบัน,กรมพัฒฯ,รายละเอียด"></textarea>
<div class="addg"><button class="btn" id="csvgo">${svg(ICON.file,17)}ตรวจสอบและนำเข้า</button>
<button class="btn ghost" id="csvsample">ใส่ตัวอย่าง</button></div>
<div id="csvout"></div>
<h2 style="margin-top:22px">รูปแบบไฟล์</h2>
<div class="hint" style="margin-top:0">บรรทัดแรกต้องเป็นหัวคอลัมน์ ตามชื่อนี้ (ลำดับสลับได้ ขาดคอลัมน์ไหนก็ได้ ยกเว้น <b>ชื่องาน</b>)</div>
<div class="code">ชื่องาน,กลุ่ม,ประเภท,สถานะ,ผู้รับผิดชอบ,วันที่,บริษัท,หมวด GL,งบ,ใช้จริง,ผู้เข้าอบรม,ชั่วโมง,วิทยากร/สถาบัน,กรมพัฒฯ,รายละเอียด
อบรมดับเพลิงขั้นต้น,อบรมตามกฎหมาย,อบรม,รอดำเนินการ,วิม,2026-07-16,LeKise (LKL),781800000 ค่าฝึกอบรม,37800,0,120,6,สถาบันความปลอดภัย,รอยื่น,จองวิทยากรแล้ว
ตรวจสุขภาพประจำปี,งานประจำเดือน,สวัสดิการ,รอดำเนินการ,ขวัญ / วิม,2026-08-20,LeKise (LKL),780900100 สวัสดิการ,160000,0,,,,,</div>
<div class="hint">
• <b>วันที่</b> ใช้รูปแบบ ปี-เดือน-วัน เช่น 2026-07-16 (เว้นว่างได้ถ้าเป็นงานประจำ)<br>
• <b>กลุ่ม</b> และ <b>บริษัท</b> พิมพ์ชื่อให้ตรงกับที่ตั้งไว้ในหน้าตั้งค่า ถ้าไม่ตรงระบบจะสร้างให้ใหม่<br>
• <b>สถานะ</b> ใช้ได้ 3 แบบ: รอดำเนินการ / กำลังดำเนินการ / เสร็จสิ้น<br>
• <b>หมวด GL</b> ใส่ "รหัส ชื่อหมวด" หรือชื่อหมวดอย่างเดียวก็ได้ ถ้ายังไม่มีระบบจะสร้างให้<br>
• <b>ผู้เข้าอบรม / ชั่วโมง / วิทยากร/สถาบัน / กรมพัฒฯ</b> ใส่เฉพาะงานอบรม (กรมพัฒฯ ใช้ได้: ไม่ต้องยื่น / รอยื่น / ยื่นแล้ว / อนุมัติแล้ว / ไม่ผ่าน)<br>
• กลุ่มที่มีคำว่า "อบรม" ระบบจะนับเป็นงานฝึกอบรมให้อัตโนมัติ<br>
• งานเดิมจะไม่ถูกลบ ระบบเพิ่มต่อท้ายเสมอ
</div></div>`;
}
function setConnect(){
const ua=navigator.userAgent;
const isMobile=/iPhone|iPad|iPod|Android/i.test(ua);
const dev=isMobile?(/iPad/i.test(ua)?"แท็บเล็ต / iPad":"มือถือ"):"โน้ตบุ๊ก / คอมพิวเตอร์";
const os=/iPhone|iPad|iPod/i.test(ua)?"iOS":/Android/i.test(ua)?"Android":/Mac/i.test(ua)?"macOS":/Win/i.test(ua)?"Windows":"อื่นๆ";
const on=!!DB;
return `<div class="banner ${on?"ok":"bad"}">${svg(on?ICON.check:ICON.bell,19)}
${on?"เชื่อมต่อฐานข้อมูลสำเร็จ · ข้อมูลซิงก์อัตโนมัติทุกเครื่อง":"ยังเชื่อมต่อฐานข้อมูลไม่ได้ · ตอนนี้แก้ไขข้อมูลไม่ได้"}</div>
<div id="health"></div>
<div class="dash">
<div class="card stat"><div class="k"><span class="ic">${svg(isMobile?ICON.phone:ICON.laptop,16)}</span> เครื่องที่ใช้อยู่</div>
<div class="v" style="font-size:19px">${dev}</div><div class="d">ระบบ ${os} · หน้าจอ ${innerWidth}×${innerHeight}</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.link,16)}</span> สถานะซิงก์</div>
<div class="v" style="font-size:19px;color:${on?"var(--ok)":"var(--over)"}">${on?"ออนไลน์":"ออฟไลน์"}</div>
<div class="d">${on?"บันทึกแล้วเห็นทุกเครื่องทันที":"ตรวจการเชื่อมต่ออินเทอร์เน็ต"}</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.check,16)}</span> เวอร์ชันแอป</div>
<div class="v" style="font-size:19px">${APP_VERSION}</div><div class="d">อัปเดต ${APP_DATE}</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.file,16)}</span> ข้อมูลบนเซิร์ฟเวอร์</div>
<div class="v" style="font-size:19px">${items.length} งาน · ${ledger.length} รายการเงิน</div>
<div class="d">${groups.length} กลุ่ม · ${gls.length} หมวด GL · ${companies.length} บริษัท</div></div>
<div class="card span4"><h2>แอปนี้ทำงานยังไง</h2>
<div class="hint" style="margin-top:0">
Sky Work เป็นเว็บแอปของวิมเอง ติดตั้งบน <b>Vercel</b> และเก็บข้อมูลบน <b>Supabase</b> — เปิดจากไอคอนบนหน้าจอได้เลย
ไม่ต้องผ่านแอปไหน แก้จากมือถือแล้วโน้ตบุ๊กเห็นทันทีเพราะข้อมูลอยู่ฐานข้อมูลกลางชุดเดียวกัน<br><br>
ข้อมูลผูกกับบัญชีที่ล็อกอิน คนอื่นเปิดลิงก์โดยไม่มีรหัสผ่านก็ไม่เห็นข้อมูล · เครื่องนี้จำการล็อกอินไว้แล้ว ไม่ต้องกรอกซ้ำ<br><br>
แนะนำให้กดดาวน์โหลด CSV เก็บไว้เดือนละครั้ง เป็นสำเนาสำรองไว้อุ่นใจค่ะ
</div>
<div class="addg"><button class="btn" id="selftest">${svg(ICON.check,17)}ทดสอบการบันทึกข้อมูล</button>
<button class="btn ghost" id="expTasks">${svg(ICON.file,17)}ดาวน์โหลดงานเป็น CSV</button>
<button class="btn ghost" id="expLedger">ดาวน์โหลดรายการเงิน</button>
<button class="btn ghost" id="signout">ออกจากระบบ</button></div>
<div id="csvout2"></div></div>
</div>`;
}
function explainErr(e){
const msg=String((e&&(e.message||e.hint))||""), code=String((e&&e.code)||"");
const box=(t,f)=>({title:t,fix:f,raw:msg+(code?" (code "+code+")":"")});
if(code==="PGRST205"||/schema cache/i.test(msg)||code==="42P01"||/relation .* does not exist/i.test(msg))
return box("ยังไม่มีตาราง rows ในฐานข้อมูล",
 "เปิด Supabase → SQL Editor → New query → วางไฟล์ <b>supabase/schema.sql</b> ทั้งหมด → กด Run<br>ต้องเห็นผลลัพธ์ <b>setup_ok = true</b><br>ถ้ารันแล้วยังไม่หาย ให้เช็กว่า Project URL ในหน้าตั้งค่าตรงกับโปรเจคที่รัน SQL หรือเปล่า");
if(code==="42501"||/row-level security/i.test(msg))
return box("ฐานข้อมูลปฏิเสธการเขียน (RLS)",
 "policy ยังไม่ถูกสร้าง หรือสร้างไม่ครบ — รัน <b>supabase/schema.sql</b> ซ้ำอีกครั้ง แล้วลองใหม่");
if(code==="PGRST301"||/JWT|token is expired|invalid claim/i.test(msg))
return box("เซสชันหมดอายุ","กดออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้งค่ะ");
if(code==="23505")return box("มีข้อมูลรหัสนี้อยู่แล้ว","ลองนำเข้าใหม่อีกครั้ง");
if(code==="23514")return box("ค่าในคอลัมน์ไม่ผ่านเงื่อนไข","รัน schema.sql เวอร์ชันล่าสุด (ตัวเก่าจำกัดค่า kind ไว้)");
if(/Failed to fetch|NetworkError|fetch/i.test(msg))
return box("ต่ออินเทอร์เน็ตหรือ Supabase ไม่ได้","ตรวจสัญญาณเน็ต หรือโปรเจค Supabase อาจถูกพักการใช้งาน (paused) — เข้าไปกด Restore ที่หน้า Dashboard");
return box("บันทึกไม่สำเร็จ","", msg);
}
function errBox(e){const x=explainErr(e);
return `<div class="banner bad" style="display:block">${svg(ICON.bell,19)} <b>${esc(x.title)}</b>
${x.fix?`<div style="font-size:13px;margin-top:8px;line-height:1.7">${x.fix}</div>`:""}
<div style="font-size:11.5px;margin-top:8px;opacity:.75;font-family:var(--mono)">${esc(x.raw)}</div></div>`;}
let imp={state:"idle",ok:0,fail:0,total:0,msg:"",at:""};
function impPill(){
const map={idle:["s-wait","รอดำเนินการ"],run:["s-run","กำลังดำเนินการ"],done:["s-done","ดำเนินการเสร็จสิ้น"],fail:["s-run","เสร็จสิ้นบางส่วน"]};
const [cls,label]=map[imp.state]||map.idle;
let detail="";
if(imp.state==="run")detail=`กำลังบันทึก ${imp.ok+imp.fail} จาก ${imp.total} รายการ`;
else if(imp.state==="done")detail=`นำเข้าแล้ว ${imp.ok} รายการ${imp.at?" · "+imp.at:""}`;
else if(imp.state==="fail")detail=`สำเร็จ ${imp.ok} · ล้มเหลว ${imp.fail}${imp.at?" · "+imp.at:""}`;
else detail="ยังไม่ได้เริ่มนำเข้า";
const pct=imp.total?Math.round((imp.ok+imp.fail)/imp.total*100):0;
return `<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--paper);border-radius:var(--r-sm);padding:13px 16px;margin-top:12px">
<span class="pill ${cls}">${label}</span>
<span style="font-size:13.5px;color:var(--ink-2)">${esc(detail)}</span>
${imp.state==="run"?`<div class="bar" style="flex:1;min-width:120px;margin:0"><i style="width:${pct}%"></i></div>`:""}
</div>${imp.msg?`<div style="font-size:12.5px;color:var(--ink-3);margin-top:8px">${imp.msg}</div>`:""}`;
}
function paintImp(){const n=el("impstat");if(n)n.innerHTML=impPill();}
async function checkHealth(){
const box=el("health"); if(!box)return;
const line=(ok,t,d)=>`<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0">
<span style="color:${ok?"var(--ok)":"var(--over)"};flex:none;margin-top:2px">${svg(ok?ICON.check:ICON.bell,16)}</span>
<div><div style="font-size:13.5px;font-weight:600">${esc(t)}</div>${d?`<div style="font-size:12.5px;color:var(--ink-3)">${d}</div>`:""}</div></div>`;
box.innerHTML=`<div class="card" style="margin-bottom:16px"><h2>ตรวจสอบระบบ</h2><div class="hint" style="margin-top:0">กำลังตรวจ…</div></div>`;
let html="", fatal=null;
html+=line(!!SB,"เชื่อมต่อ Supabase", SB?"ใส่ค่า URL และ key ครบแล้ว":"ยังไม่ได้ตั้งค่า");
html+=line(!!uid,"เข้าสู่ระบบ", uid?"บัญชี "+esc(String(uid).slice(0,8))+"…":"ยังไม่ได้ล็อกอิน");
if(SB&&uid){
const r=await SB.from("rows").select("id",{count:"exact",head:true}).eq("uid",uid);
if(r.error){ html+=line(false,"ตาราง rows ในฐานข้อมูล","อ่านไม่ได้"); fatal=r.error; }
else{
html+=line(true,"ตาราง rows ในฐานข้อมูล","อ่านได้ · มี "+(r.count||0)+" แถวของบัญชีนี้");
const id="healthcheck-"+Date.now();
const w=await SB.from("rows").upsert({id,uid,kind:"items",data:{title:"__healthcheck__",track:"annual",status:"รอดำเนินการ",months:[]},updated_at:new Date().toISOString()});
if(w.error){ html+=line(false,"สิทธิ์เขียนข้อมูล","เขียนไม่ได้"); fatal=fatal||w.error; }
else{ html+=line(true,"สิทธิ์เขียนข้อมูล","เขียนและลบทดสอบสำเร็จ"); await SB.from("rows").delete().eq("id",id).eq("uid",uid); }
}}
box.innerHTML=`<div class="card" style="margin-bottom:16px"><h2>ตรวจสอบระบบ <small>${fatal?"พบปัญหา":"ปกติทั้งหมด"}</small></h2>
<div style="margin-top:6px">${html}</div>${fatal?`<div style="margin-top:12px">${errBox(fatal)}</div>`:""}</div>`;
}
let cResolve=null;
function ask(msg,yes="ยืนยัน"){
el("cmsg").innerHTML=msg; el("cyes").textContent=yes;
el("cyes").style.display=""; el("cno").textContent="ยกเลิก";
el("cdlg").showModal();
return new Promise(r=>{cResolve=r;});
}
function tell(msg){
el("cmsg").innerHTML=msg; el("cyes").style.display="none"; el("cno").textContent="ปิด";
el("cdlg").showModal();
return new Promise(r=>{cResolve=r;});
}
el("cyes").onclick=()=>{el("cdlg").close();cResolve&&cResolve(true);};
el("cno").onclick=()=>{el("cdlg").close();cResolve&&cResolve(false);};
function wire(){
el("add")&&(el("add").onclick=()=>open_(null));
el("addTx")&&(el("addTx").onclick=()=>openTx(null));
document.querySelectorAll("[data-id]").forEach(n=>n.onclick=()=>{
const t=items.find(x=>x._id===n.dataset.id); if(t)open_(t);});
document.querySelectorAll("[data-tx]").forEach(n=>n.onclick=()=>{
const t=ledger.find(x=>x._id===n.dataset.tx); if(t)openTx(t);});
const sc=el("sc1");
if(sc){sc.onclick=e=>{const b=e.target.closest("button[data-sc]");if(!b)return;R.scope=b.dataset.sc;render();};
el("scMonth")&&(el("scMonth").onchange=e=>{R.month=+e.target.value;render();});}
["yrSel","yrSel2"].forEach(id=>{const n=el(id); if(n)n.onchange=e=>{R.year=+e.target.value;R.selDay=null;render();};});
const bs=el("budsc");
if(bs){bs.onclick=e=>{const b=e.target.closest("button[data-bs]");if(!b)return;R.budScope=b.dataset.bs;render();};
el("budMonth")&&(el("budMonth").onchange=e=>{R.budMonth=+e.target.value;render();});}
el("calmode")&&(el("calmode").onclick=e=>{const b=e.target.closest("button[data-cm]");if(!b)return;R.calMode=b.dataset.cm;R.selDay=null;render();});
el("calMonth")&&(el("calMonth").onchange=e=>{R.month=+e.target.value;R.selDay=null;render();});
el("pm")&&(el("pm").onclick=()=>{R.month=(R.month+11)%12;R.selDay=null;render();});
el("nm")&&(el("nm").onclick=()=>{R.month=(R.month+1)%12;R.selDay=null;render();});
el("clearDay")&&(el("clearDay").onclick=()=>{R.selDay=null;render();});
document.querySelectorAll("[data-day]").forEach(n=>n.onclick=()=>{
const d=+n.dataset.day; R.selDay=R.selDay===d?null:d; render();});
el("settabs")&&(el("settabs").onclick=e=>{const b=e.target.closest("button[data-st]");if(!b)return;settab=b.dataset.st;render();});
const bind=(id,key)=>{const n=el(id);if(!n)return;n.oninput=n.onchange=()=>{
F[key]=n.value;const p=n.selectionStart,srch=n.type==="search";render();
const m=el(id);if(m&&srch){m.focus();m.setSelectionRange(p,p);}};};
bind("q","q");bind("fl-track","track");bind("fl-type","type");bind("fl-status","status");bind("fl-company","company");
el("modeseg")&&(el("modeseg").onclick=async e=>{
const b=e.target.closest("button[data-md]"); if(!b)return;
await setTheme({preset:theme.preset,custom:theme.custom,mode:b.dataset.md});});
document.querySelectorAll("[data-mv]").forEach(b=>b.onclick=async()=>{
const [kind,i,d]=b.dataset.mv.split(":"); const arr=kind==="groups"?groups:kind==="companies"?companies:gls;
const a=+i, t=a+(+d); if(t<0||t>=arr.length)return;
const tmp=arr[a]; arr[a]=arr[t]; arr[t]=tmp;
render(); await saveMeta(kind==="gl"?"gl":kind,arr);});
document.querySelectorAll("[data-hide]").forEach(b=>b.onclick=async()=>{
const [kind,i]=b.dataset.hide.split(":"); const arr=kind==="groups"?groups:kind==="companies"?companies:gls;
const o=arr[+i]; if(!o)return; o.hidden=!o.hidden;
render(); await saveMeta(kind==="gl"?"gl":kind,arr);});
document.querySelectorAll("[data-pal]").forEach(b=>b.onclick=()=>setTheme({preset:b.dataset.pal,custom:theme.custom}));
if(el("useCustom")){
el("useCustom").onclick=()=>setTheme({preset:"custom",custom:[0,1,2,3,4].map(i=>el("cc"+i).value)});
el("fromCur").onclick=()=>{const p=PALETTES.find(x=>x.key===theme.preset);
(p?p.ramp:(theme.custom||PALETTES[0].ramp)).forEach((c,i)=>el("cc"+i).value=c);};
}
if(el("addg")){
el("addg").onclick=async()=>{const v=el("newg").value.trim();if(!v)return;
if(groups.some(g=>g.label===v)){tell("มีกลุ่มชื่อนี้แล้วค่ะ");return;}
groups=[...groups,{key:"g"+Date.now().toString(36),label:v}];el("newg").value="";render();await saveMeta("groups",groups);};
el("newg").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();el("addg").click();}};
}
document.querySelectorAll("[data-ren]").forEach(n=>n.onchange=async()=>{
const g=groups.find(x=>x.key===n.dataset.ren), v=n.value.trim();
if(!g||!v){render();return;} g.label=v; await saveMeta("groups",groups); render();});
document.querySelectorAll("[data-delg]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delg,n=items.filter(t=>t.track===k).length;
if(n){tell("กลุ่มนี้ยังมี <b>"+n+"</b> งานอยู่ ย้ายงานออกก่อนนะคะ");return;}
if(groups.length<=1)return;
if(!await ask("ลบกลุ่ม “"+esc(gLabel(k))+"” ใช่ไหมคะ?","ลบกลุ่ม"))return;
groups=groups.filter(g=>g.key!==k);render();await saveMeta("groups",groups);});
if(el("addc")){
el("addc").onclick=async()=>{const v=el("newc").value.trim();if(!v)return;
companies=[...companies,{key:"c"+Date.now().toString(36),label:v}];el("newc").value="";render();await saveMeta("companies",companies);};
el("newc").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();el("addc").click();}};
}
document.querySelectorAll("[data-renc]").forEach(n=>n.onchange=async()=>{
const c=companies.find(x=>x.key===n.dataset.renc), v=n.value.trim();
if(!c||!v){render();return;} c.label=v; await saveMeta("companies",companies); render();});
document.querySelectorAll("[data-delc]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delc,n=items.filter(t=>t.company===k).length;
if(n){tell("บริษัทนี้ยังมี <b>"+n+"</b> งานผูกอยู่ค่ะ");return;}
if(!await ask("ลบบริษัท “"+esc(cLabel(k))+"” ใช่ไหมคะ?","ลบบริษัท"))return;
companies=companies.filter(c=>c.key!==k);render();await saveMeta("companies",companies);});
if(el("addgl")){
el("addgl").onclick=async()=>{
const code=el("glcode").value.trim(), label=el("glname").value.trim(), b=+el("glbud").value||0;
if(!label&&!code){tell("ใส่ชื่อหมวดหรือรหัส GL อย่างน้อยหนึ่งอย่างค่ะ");return;}
const key=code||label.slice(0,18);
if(gls.some(g=>g.key===key)){tell("มีหมวดนี้แล้วค่ะ");return;}
gls=[...gls,{key,code,label:label||code,budget:b}];
el("glcode").value=el("glname").value=el("glbud").value="";
render();await saveMeta("gl",gls);};
}
document.querySelectorAll("[data-glb]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.glb);if(!g)return;
g.budget=+n.value||0;await saveMeta("gl",gls);render();});
document.querySelectorAll("[data-reng]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.reng), v=n.value.trim();
if(!g||!v){render();return;} g.label=v; await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-renc2]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.renc2);if(!g)return;
g.code=n.value.trim(); await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-delgl]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delgl,n=ledger.filter(x=>x.gl===k).length;
if(n){tell("หมวดนี้มี <b>"+n+"</b> รายการเงินผูกอยู่ค่ะ ลบหรือย้ายรายการก่อนนะคะ");return;}
if(!await ask("ลบหมวด “"+esc(glLabel(k))+"” ใช่ไหมคะ?","ลบหมวด"))return;
gls=gls.filter(g=>g.key!==k);render();await saveMeta("gl",gls);});
if(el("csvgo")){
el("csvgo").onclick=()=>importCSV(el("csvtext").value);
el("csvsample").onclick=()=>{el("csvtext").value=
"ชื่องาน,กลุ่ม,ประเภท,สถานะ,ผู้รับผิดชอบ,วันที่,บริษัท,หมวด GL,งบ,ใช้จริง,ผู้เข้าอบรม,ชั่วโมง,วิทยากร/สถาบัน,กรมพัฒฯ,รายละเอียด\nปฐมนิเทศพนักงานใหม่,อบรมภายใน,อบรม,กำลังดำเนินการ,วิม,2026-10-05,LeKise (LKL),781800000 ค่าฝึกอบรม,0,0,15,3,ฝ่าย HR,ไม่ต้องยื่น,ทุกต้นเดือน";};
el("csvfile").onchange=e=>{const f=e.target.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{el("csvtext").value=r.result;importCSV(r.result);};r.readAsText(f,"utf-8");};
}
el("expTasks")&&(el("expTasks").onclick=()=>exportCSV("skywork-tasks",
["ชื่องาน","กลุ่ม","ประเภท","สถานะ","ผู้รับผิดชอบ","วันที่","บริษัท","หมวด GL","งบ","ใช้จริง","เวลา","สถานที่","ผู้เข้าร่วม","เตรียมล่วงหน้า(วัน)","สิ่งที่ต้องเตรียม","ผู้เข้าอบรม","ชั่วโมง","วิทยากร/สถาบัน","กรมพัฒฯ","การเกิดซ้ำ","รายละเอียด"],
items.map(t=>[t.title,gLabel(t.track),t.type,t.status,t.owner,t.date||t.recurring,cLabel(t.company),
t.gl1?glLabel(glKeyOf(t.gl1)):"",budgetOf(t),t.actual,t.time||"",t.place||"",t.attendees||"",t.prepDays||"",t.prepNote||"",t.pax||"",t.hours||"",t.vendor||"",t.dsd||"",rruleText(t),t.note])));
if(el("health"))checkHealth();
el("selftest")&&(el("selftest").onclick=async()=>{
const out=el("csvout2"); out.innerHTML=`<div class="banner">กำลังทดสอบ…</div>`;
const id="selftest-"+Date.now();
const w=await SB.from("rows").upsert({id,uid,kind:"items",data:{title:"__ทดสอบระบบ__",track:"annual",status:"รอดำเนินการ",months:[]},updated_at:new Date().toISOString()});
if(w.error){out.innerHTML=errBox(w.error);return;}
const rd=await SB.from("rows").select("id",{count:"exact",head:true}).eq("uid",uid);
await SB.from("rows").delete().eq("id",id).eq("uid",uid);
out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} เขียน อ่าน และลบข้อมูลได้ปกติ · ตอนนี้มี ${rd.count!=null?rd.count-1:"?"} แถวบนเซิร์ฟเวอร์</div>`;
});
el("icsgo")&&(el("icsgo").onclick=downloadICS);
el("notifOn")&&(el("notifOn").onclick=async()=>{
const ok=await notifyToday(true);
if(!ok)tell("เบราว์เซอร์ไม่อนุญาตให้แจ้งเตือนค่ะ — เปิดสิทธิ์ที่รูปแม่กุญแจหน้าช่อง URL แล้วลองใหม่ หรือใช้วิธีซิงก์เข้า Google Calendar แทน");
render();});
el("preset")&&(el("preset").onclick=async()=>{
TRAIN_PRESET.forEach(x=>{ if(!groups.some(g=>g.label===x.label))groups.push({key:x.key,label:x.label}); });
render(); await saveMeta("groups",groups);});
el("signout")&&(el("signout").onclick=async()=>{if(await ask("ออกจากระบบเครื่องนี้ใช่ไหมคะ?","ออกจากระบบ"))signOut();});
el("expLedger")&&(el("expLedger").onclick=()=>exportCSV("skywork-ledger",
["วันที่","ประเภท","หมวด GL","จำนวนเงิน","บริษัท","รายละเอียด"],
ledger.map(x=>[x.date,x.kind==="income"?"รายรับ":"รายจ่าย",glLabel(x.gl),x.amount,cLabel(x.company),x.note])));
}
function parseRecur(v){
v=String(v||"").trim(); if(!v)return null;
const dow=["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
if(/^ทุกวัน$/.test(v))return {freq:"day",weekdays:[],nth:[],monthday:null};
if(/ทุกปี/.test(v))return {freq:"year",weekdays:[],nth:[],monthday:null};
const md=v.match(/ทุกเดือน.*?(\d{1,2})|ทุกวันที่\s*(\d{1,2})/);
if(md)return {freq:"monthday",weekdays:[],nth:[],monthday:+(md[1]||md[2])};
const wd=dow.map((d,i)=>v.includes(d)?i:-1).filter(i=>i>=0);
if(wd.length){
const nth=[]; const nm=v.match(/ที่\s*([1-5](\s*(และ|,)\s*[1-5])*)/);
if(nm)nm[1].split(/และ|,/).forEach(x=>{const n=+x.trim(); if(n)nth.push(n);});
if(/สุดท้าย/.test(v))nth.push(-1);
return nth.length?{freq:"monthnth",weekdays:wd,nth,monthday:null}:{freq:"week",weekdays:wd,nth:[],monthday:null};
}
return null;
}
function sniffDelim(txt){
const line=txt.split(/\r?\n/).find(l=>l.trim())||"";
const n=c=>(line.split(c).length-1);
const cand=[[",",n(",")],["\t",n("\t")],[";",n(";")],["|",n("|")]].sort((a,b)=>b[1]-a[1]);
return cand[0][1]>0?cand[0][0]:",";
}
function parseCSV(txt,D){
txt=String(txt).replace(/^\uFEFF/,"");
D=D||sniffDelim(txt);
const rows=[];let row=[],cur="",q=false;
for(let i=0;i<txt.length;i++){const c=txt[i];
if(q){ if(c==='"'&&txt[i+1]==='"'){cur+='"';i++;} else if(c==='"'){q=false;} else cur+=c; }
else if(c==='"')q=true;
else if(c===D){row.push(cur);cur="";}
else if(c==="\n"){row.push(cur);rows.push(row);row=[];cur="";}
else if(c!=="\r")cur+=c;}
if(cur||row.length){row.push(cur);rows.push(row);}
return rows.filter(r=>r.some(c=>c.trim()));
}
async function importCSV(txt){
const out=el("csvout"); if(!txt.trim()){out.innerHTML=`<div class="banner bad">ยังไม่มีข้อมูลให้นำเข้าค่ะ</div>`;return;}
imp={state:"run",ok:0,fail:0,total:0,msg:"",at:""}; paintImp();
const COLS=["ชื่องาน","กลุ่ม","ประเภท","สถานะ","ผู้รับผิดชอบ","วันที่","บริษัท","งบ","ใช้จริง","รายละเอียด"];
const rows=parseCSV(txt);
let head=rows[0].map(h=>h.replace(/\uFEFF/g,"").trim());
let body=rows.slice(1), noHead=false;
if(head.indexOf("ชื่องาน")<0){ head=COLS.slice(); body=rows; noHead=true; }
const idx=n=>head.indexOf(n);
const get=(r,n)=>{const i=idx(n);return i<0?"":String(r[i]==null?"":r[i]).trim();};
let added=0, failed=0, firstErr=null, newG=[], newC=[], newGL=[];
imp.total=body.length; paintImp();
for(const r of body){
const title=get(r,"ชื่องาน"); if(!title)continue;
let gl=get(r,"กลุ่ม")||"งานประจำปี";
let g=groups.find(x=>x.label===gl);
if(!g){g={key:"g"+Date.now().toString(36)+added,label:gl};groups.push(g);newG.push(gl);}
let co=get(r,"บริษัท"), c=null;
if(co){c=companies.find(x=>x.label===co);
if(!c){c={key:"c"+Date.now().toString(36)+added,label:co};companies.push(c);newC.push(co);}}
const date=get(r,"วันที่");
let glKey="";
const glRaw=get(r,"หมวด GL")||get(r,"GL")||get(r,"รหัส GL");
if(glRaw){
const m=glRaw.match(/^(\d{6,9})/); const code=m?m[1]:"";
const label=(glRaw.replace(/^\d{6,9}\s*[:.\-]?\s*/,"")||glRaw).trim();
let g=gls.find(x=>(code&&x.key===code)||x.label===label||(x.code&&x.code===code));
if(!g){ g={key:code||label.slice(0,18),code,label:label||code,budget:0}; gls.push(g); newGL.push(g.label); }
glKey=g.key;
}
try{
await saveItem({
title, track:g.key, type:get(r,"ประเภท"), status:STATUS.includes(get(r,"สถานะ"))?get(r,"สถานะ"):"รอดำเนินการ",
owner:get(r,"ผู้รับผิดชอบ"), date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null,
recurring:/^\d{4}-\d{2}-\d{2}$/.test(date)?null:(date||null),
company:c?c.key:"", gl1:glKey, b1:+get(r,"งบ")||0, gl2:"", b2:0,
actual:+get(r,"ใช้จริง")||0, code:"", note:get(r,"รายละเอียด"), group:"",
rrule:parseRecur(get(r,"การเกิดซ้ำ")),
meet:/ประชุม/.test(get(r,"กลุ่ม")+get(r,"ประเภท")+title)||!!get(r,"เวลา"),
time:get(r,"เวลา"), place:get(r,"สถานที่"), attendees:get(r,"ผู้เข้าร่วม"),
prepDays:+get(r,"เตรียมล่วงหน้า(วัน)")||+get(r,"เตรียมล่วงหน้า")||0, prepNote:get(r,"สิ่งที่ต้องเตรียม"),
pax:+get(r,"ผู้เข้าอบรม")||0, hours:+get(r,"ชั่วโมง")||0,
vendor:get(r,"วิทยากร/สถาบัน")||get(r,"วิทยากร"), dsd:DSD.includes(get(r,"กรมพัฒฯ"))?get(r,"กรมพัฒฯ"):"",
train:/อบรม/.test(g.label)||!!get(r,"ผู้เข้าอบรม"),
months:/^\d{4}-\d{2}-\d{2}$/.test(date)?[new Date(date).getMonth()+1]:[]
});
added++;
}catch(e){ failed++; if(!firstErr)firstErr=e; }
imp.ok=added; imp.fail=failed; paintImp();
}
try{ if(newG.length)await saveMeta("groups",groups); if(newC.length)await saveMeta("companies",companies); if(newGL.length)await saveMeta("gl",gls); }catch(e){ if(!firstErr)firstErr=e; }
let verify="";
try{ const {count,error}=await SB.from("rows").select("id",{count:"exact",head:true}).eq("uid",uid).eq("kind","items");
 if(!error)verify=` · ตรวจสอบบนเซิร์ฟเวอร์แล้วมี ${count} งาน`; }catch(e){}
const now=new Date();
imp.ok=added; imp.fail=failed;
imp.at=now.getDate()+" "+MTH[now.getMonth()]+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
imp.state=failed?"fail":"done";
imp.msg=verify?esc(verify.replace(" · ","")):"";
paintImp();
if(failed){
out.innerHTML=`<div class="banner bad" style="margin-bottom:10px">นำเข้าได้ ${added} งาน · <b>ล้มเหลว ${failed} งาน</b></div>`+errBox(firstErr||{});
}else{
out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} นำเข้าสำเร็จ ${added} งาน${noHead?" (ไม่พบบรรทัดหัวตาราง ระบบอ่านตามลำดับคอลัมน์มาตรฐานให้)":""}${verify}${newG.length?` · สร้างกลุ่มใหม่: ${esc(newG.join(", "))}`:""}${newC.length?` · สร้างบริษัทใหม่: ${esc(newC.join(", "))}`:""}${newGL.length?` · สร้างหมวด GL ใหม่ ${newGL.length} หมวด`:""}</div>`;
el("csvtext").value="";
}
}
function exportCSV(name,head,rows){
const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
const csv="\ufeff"+[head.map(q).join(","),...rows.map(r=>r.map(q).join(","))].join("\n");
const a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
a.download=name+"-"+R.year+".csv"; document.body.appendChild(a); a.click();
setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
const out=el("csvout2"); if(out)out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} ดาวน์โหลดไฟล์แล้วค่ะ</div>`;
}
async function setTheme(t){
t.mode=t.mode||theme.mode||"auto"; theme=t; applyTheme._last=isNight(); applyTheme(); render();
try{localStorage.setItem("hr-theme",JSON.stringify(t));}catch(e){}
if(DB) await DB.doc("meta/theme").set({preset:t.preset,custom:t.custom||null,mode:t.mode||"auto"});
}
function fill(sel,arr,val){el(sel).innerHTML=arr.map(([v,l])=>`<option value="${esc(v)}"${v===val?" selected":""}>${esc(l)}</option>`).join("");}
function syncFreq(){
const f=el("f-freq").value;
el("wrap-wd").hidden=!(f==="week"||f==="monthnth");
el("wrap-nth").hidden=(f!=="monthnth");
el("wrap-md").hidden=(f!=="monthday");
el("wrap-recur").hidden=(f!=="none");
const dl=el("f-date").parentElement.querySelector("label");
if(dl)dl.textContent=(f==="none")?"วันที่":"วันที่เริ่มต้น";
}
function open_(t){
editing=t;
el("dlgh").textContent=t?"แก้ไขงาน":"เพิ่มงานใหม่";
el("del").style.display=t?"":"none";
fill("f-company",[["","— ไม่ระบุ —"],...visible(companies).map(c=>[c.key,c.label])],t?.company||"");
fill("f-track",visible(groups).map(g=>[g.key,g.label]),t?.track||groups[0]?.key);
fill("f-status",STATUS.map(x=>[x,x]),t?.status||"รอดำเนินการ");
const glopts=[["","— ไม่ผูกหมวด —"],...visible(gls).map(g=>[g.key,glLabel(g.key)])];
fill("f-gl1",glopts,glKeyOf(t?.gl1)); fill("f-gl2",glopts,glKeyOf(t?.gl2));
el("typelist").innerHTML=types().map(x=>`<option value="${esc(x)}">`).join("");
el("f-type").value=t?.type||"";
el("f-title").value=t?.title||""; el("f-owner").value=t?.owner||"";
el("f-date").value=t?.date||""; el("f-recur").value=t?.recurring||"";
const RU=(t&&t.rrule)||{freq:"none",weekdays:[],nth:[1],monthday:""};
fill("f-freq",FREQ,RU.freq||"none");
el("f-wd").innerHTML=DOW.map((d,i)=>`<label><input type="checkbox" class="wd" value="${i}"${(RU.weekdays||[]).includes(i)?" checked":""}>${d}.</label>`).join("");
el("f-nth").innerHTML=NTH.map(([v,l])=>`<label><input type="checkbox" class="nth" value="${v}"${(RU.nth||[]).includes(v)?" checked":""}>${l}</label>`).join("");
el("f-md").value=RU.monthday||"";
syncFreq();
el("f-meet").checked=isMeet(t||{});
el("f-time").value=t?.time||""; el("f-place").value=t?.place||"";
el("f-att").value=t?.attendees||""; el("f-prepd").value=t?.prepDays||"";
el("f-prepn").value=t?.prepNote||"";
syncMeet();
el("f-train").checked=isTrain(t||{});
el("f-pax").value=t?.pax||""; el("f-hours").value=t?.hours||"";
el("f-vendor").value=t?.vendor||"";
fill("f-dsd",[["","— ไม่ระบุ —"],...DSD.map(x=>[x,x])],t?.dsd||"");
syncTrain();
el("f-b1").value=t?.b1||""; el("f-b2").value=t?.b2||"";
el("f-actual").value=t?.actual||""; el("f-code").value=t?.code||"";
el("f-note").value=t?.note||"";
const ms=t?.months||[];
el("f-months").innerHTML=MTH.map((m,i)=>`<label><input type="checkbox" value="${i+1}"${ms.includes(i+1)?" checked":""}>${m}</label>`).join("");
el("dlg").showModal();
}
function syncMeet(){ el("wrap-meet").hidden=!el("f-meet").checked; }
el("f-meet").onchange=syncMeet;
function syncTrain(){ el("wrap-train").hidden=!el("f-train").checked; }
el("f-train").onchange=syncTrain;
el("f-track").addEventListener("change",()=>{ const g=groups.find(x=>x.key===el("f-track").value);
if(g&&/อบรม/.test(g.label)&&!el("f-train").checked){ el("f-train").checked=true; syncTrain(); } });
el("f-freq").onchange=syncFreq;
el("cancel").onclick=()=>el("dlg").close();
el("save").onclick=async()=>{
if(!el("f-title").value.trim()){el("f-title").focus();return;}
const data={
title:el("f-title").value.trim(), company:el("f-company").value,
track:el("f-track").value, type:el("f-type").value.trim(),
status:el("f-status").value, owner:el("f-owner").value.trim(),
date:el("f-date").value||null, recurring:el("f-recur").value.trim()||null,
rrule:(()=>{const f=el("f-freq").value; if(f==="none")return null;
return {freq:f,
weekdays:[...el("f-wd").querySelectorAll("input:checked")].map(i=>+i.value),
nth:[...el("f-nth").querySelectorAll("input:checked")].map(i=>+i.value),
monthday:+el("f-md").value||null};})(),
gl1:el("f-gl1").value, b1:+el("f-b1").value||0,
gl2:el("f-gl2").value, b2:+el("f-b2").value||0,
actual:+el("f-actual").value||0, code:el("f-code").value.trim(),
meet:el("f-meet").checked, time:hhmm(el("f-time").value), place:el("f-place").value.trim(),
attendees:el("f-att").value.trim(), prepDays:+el("f-prepd").value||0, prepNote:el("f-prepn").value.trim(),
train:el("f-train").checked, pax:+el("f-pax").value||0, hours:+el("f-hours").value||0,
vendor:el("f-vendor").value.trim(), dsd:el("f-dsd").value,
note:el("f-note").value.trim(), group:editing?.group||"",
months:[...el("f-months").querySelectorAll("input:checked")].map(i=>+i.value)
};
el("dlg").close();
try{ await saveItem(data,editing?._id); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); }
};
el("del").onclick=async()=>{
if(!editing)return;
const t=editing; el("dlg").close();
if(!await ask("ลบงาน “"+esc(t.title)+"” ออกจากระบบใช่ไหมคะ?","ลบงาน"))return;
await DB.collection("items").doc(t._id).delete();
};
function openTx(x){
editingTx=x;
el("tdlgh").textContent=x?"แก้ไขรายการเงิน":"บันทึกรายการเงิน";
el("tdel").style.display=x?"":"none";
el("t-kind").value=x?.kind||"expense";
el("t-date").value=x?.date||new Date().toISOString().slice(0,10);
fill("t-gl",visible(gls).length?visible(gls).map(g=>[g.key,glLabel(g.key)]):[["","— ยังไม่มีหมวด GL —"]],x?.gl||"");
el("t-amount").value=x?.amount||"";
fill("t-company",[["","— ไม่ระบุ —"],...visible(companies).map(c=>[c.key,c.label])],x?.company||"");
fill("t-task",[["","— ไม่ผูกงาน —"],...items.map(t=>[t._id,t.title])],x?.taskId||"");
el("t-note").value=x?.note||"";
el("tdlg").showModal();
}
el("tcancel").onclick=()=>el("tdlg").close();
el("tsave").onclick=async()=>{
const amt=+el("t-amount").value||0;
if(!amt){el("t-amount").focus();return;}
const data={kind:el("t-kind").value, date:el("t-date").value, gl:el("t-gl").value,
amount:amt, company:el("t-company").value, taskId:el("t-task").value, note:el("t-note").value.trim()};
el("tdlg").close();
if(!DB)return;
try{ editingTx?await DB.collection("ledger").doc(editingTx._id).set(data):await DB.collection("ledger").add(data); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); }
};
el("tdel").onclick=async()=>{
if(!editingTx)return;
const x=editingTx; el("tdlg").close();
if(!await ask("ลบรายการเงินนี้ใช่ไหมคะ?","ลบรายการ"))return;
await DB.collection("ledger").doc(x._id).delete();
};
let gateMode="setup";
function gate(mode){
gateMode=mode;
const b=el("gatebody");
if(mode==="setup"){
el("gateh").textContent="เชื่อมต่อฐานข้อมูลครั้งแรก";
b.innerHTML=`<div class="f"><label for="g-url">Project URL จาก Supabase</label>
<input id="g-url" placeholder="https://xxxxx.supabase.co" value="${esc(cfg.url)}"></div>
<div class="f" style="margin-top:12px"><label for="g-key">anon public key</label>
<input id="g-key" placeholder="eyJhbGciOi..." value="${esc(cfg.key)}"></div>
<div class="hint">หาได้ที่ Supabase › Project Settings › API · ใส่ครั้งเดียวต่อเครื่อง</div>`;
el("gatego").textContent="เชื่อมต่อ";
}else if(mode==="login"){
el("gateh").textContent="เข้าสู่ระบบ Sky Work";
b.innerHTML=`<div class="f"><label for="g-mail">อีเมล</label><input id="g-mail" type="email" autocomplete="email"></div>
<div class="f" style="margin-top:12px"><label for="g-pass">รหัสผ่าน</label><input id="g-pass" type="password" autocomplete="current-password"></div>
<div class="hint">ครั้งแรกกด “สมัคร/เข้าสู่ระบบ” ระบบจะสร้างบัญชีให้อัตโนมัติ · เครื่องนี้จะจำไว้ ไม่ต้องล็อกอินอีก</div>
<div id="g-msg"></div>`;
el("gatego").textContent="สมัคร / เข้าสู่ระบบ";
}
if(!el("gate").open)el("gate").showModal();
}
el("gatego").onclick=async()=>{
if(gateMode==="setup"){
const url=el("g-url").value.trim().replace(/\/$/,""), key=el("g-key").value.trim();
if(!url||!key)return;
cfg={url,key}; try{localStorage.setItem("sw-cfg",JSON.stringify(cfg));}catch(e){}
el("gate").close(); boot(); return;
}
const email=el("g-mail").value.trim(), password=el("g-pass").value;
const msg=el("g-msg");
if(!email||password.length<6){msg.innerHTML=`<div class="banner bad">ใส่อีเมลและรหัสผ่านอย่างน้อย 6 ตัวค่ะ</div>`;return;}
msg.innerHTML=`<div class="banner">กำลังเข้าสู่ระบบ…</div>`;
let {error}=await SB.auth.signInWithPassword({email,password});
if(error){ const r=await SB.auth.signUp({email,password});
if(r.error){msg.innerHTML=`<div class="banner bad">${esc(r.error.message)}</div>`;return;}
const again=await SB.auth.signInWithPassword({email,password});
if(again.error){msg.innerHTML=`<div class="banner ok">สมัครแล้ว! ตรวจอีเมลเพื่อยืนยัน แล้วกลับมาเข้าสู่ระบบอีกครั้งค่ะ</div>`;return;}
}
el("gate").close(); boot();
};
async function signOut(){ if(SB)await SB.auth.signOut(); location.reload(); }
addEventListener("resize",()=>{if(view==="all")render();});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
boot();
