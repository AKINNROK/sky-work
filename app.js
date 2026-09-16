const APP_VERSION="7.0"; const APP_DATE="16 ก.ย. 2026";
const MTH=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MTHFULL=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DOW=["อา","จ","อ","พ","พฤ","ศ","ส"];
const STATUS=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","กำลังดำเนินการ","เสร็จสิ้น","ยกเลิก"];
const STATUS_DONE="เสร็จสิ้น", STATUS_CANCEL="ยกเลิก";
const isOpenStatus=x=>x!==STATUS_DONE&&x!==STATUS_CANCEL;
const TAGCOLORS=["#e0606d","#e8743b","#e0932b","#d9c02e","#8fbf3f","#2fa36b","#1a9f86","#2bb3c9",
"#3d86d6","#4a5fc4","#7d5bd0","#b155c4","#d6549b","#8a6a55","#6b7785","#a9a29a"];
const tagsOf=()=>[...new Set(items.map(t=>(t.tag||"").trim()).filter(Boolean))].sort();
const tagColor=name=>{const t=items.find(x=>(x.tag||"").trim()===name&&x.color);return t?t.color:"";};
const DEFAULT_GROUPS=[
{key:"train_law",label:"อบรมตามกฎหมาย"},{key:"train_in",label:"อบรมภายใน"},
{key:"train_out",label:"อบรมภายนอก"},{key:"project",label:"โปรเจคเสริม"},
{key:"monthly",label:"งานประจำเดือน"},{key:"annual",label:"กิจกรรมประจำปี"},
{key:"ops",label:"งานประจำ/ต่ออายุ"},{key:"secretary",label:"งานเลขา"},
{key:"recruit",label:"งานสรรหา"},{key:"idea",label:"ไอเดีย"}];
const TRAIN_PRESET=[{key:"train_law",label:"อบรมตามกฎหมาย"},{key:"train_in",label:"อบรมภายใน"},{key:"train_out",label:"อบรมภายนอก"},{key:"project",label:"โปรเจคเสริม"},{key:"monthly",label:"งานประจำเดือน"},{key:"annual",label:"กิจกรรมประจำปี"}];
const LEGALCAT=["ใบรับรอง / ผู้รับผิดชอบเฉพาะ","คำสั่งแต่งตั้ง / คณะกรรมการ","ข้อกำหนดที่ต้องทำประจำ"];
const CYCLES=[["","ไม่มีรอบทบทวน"],["12","ทบทวนทุก 1 ปี"],["24","ทบทวนทุก 2 ปี"],["36","ต่ออายุทุก 3 ปี"],["60","ต่ออายุทุก 5 ปี"]];
const addMonths=(d,m)=>{const x=new Date(d);x.setMonth(x.getMonth()+ +m);return x;};
const legalDue=L=>{ if(!L)return null;
if(L.expires)return new Date(L.expires);
if(L.issued&&+L.cycle)return addMonths(L.issued,+L.cycle);
return null; };
const legalState=L=>{
const d=legalDue(L), miss=!L.person;
if(d){ const n=daysTo(d);
if(n<0)return {k:"late",t:"เกินกำหนด "+(-n)+" วัน",c:"s-over"};
if(n<=90)return {k:"soon",t:"อีก "+n+" วัน"+(miss?" · ยังไม่มีผู้รับผิดชอบ":""),c:"s-run"};
if(miss)return {k:"noperson",t:"ยังไม่มีผู้รับผิดชอบ",c:"s-wait"};
return {k:"ok",t:"อีก "+n+" วัน",c:"s-done"}; }
if(miss)return {k:"noperson",t:"ยังไม่มีผู้รับผิดชอบ",c:"s-wait"};
if(L.lifetime)return {k:"ok",t:"ไม่มีวันหมดอายุ",c:"s-done"};
return {k:"noperson",t:"ยังไม่ระบุวันครบกำหนด",c:"s-wait"}; };
const SKILLS=["Soft Skill","Hard Skill","Safety"];
const MODES=["In-House","Public","OJT","Online","สัมมนา","อื่นๆ"];
const SKILLC={"Soft Skill":"#3d86d6","Hard Skill":"#7d5bd0","Safety":"#e0606d"};
const MODEC={"In-House":"#2fa36b","Public":"#e0932b","OJT":"#2bb3c9","Online":"#4a5fc4","สัมมนา":"#d6549b","อื่นๆ":"#6b7785"};
const SAFETYRE=/ความปลอดภัย|ดับเพลิง|อพยพ|จป\.?|คปอ|ปั้นจั่น|โฟล์คลิฟท์|forklift|สารเคมี|ไฟฟ้า|ที่สูง|ปฐมพยาบาล|first aid|อัคคีภัย|ก๊าซ|เชื่อม/i;
const guessSkill=t=>{const s2=(t.title||"")+" "+(t.type||"")+" "+gLabel(t.track);
if(SAFETYRE.test(s2))return "Safety";
if(/ภาวะผู้นำ|leadership|สื่อสาร|communication|team|บทบาท|ทัศนคติ|บริการ|mindset|coaching/i.test(s2))return "Soft Skill";
return ""; };
const DSD=["ไม่ต้องยื่น","รอยื่น","ยื่นแล้ว","อนุมัติแล้ว","ไม่ผ่าน"];
const dsdCls=d=>d==="อนุมัติแล้ว"?"s-done":d==="ยื่นแล้ว"?"s-run":d==="ไม่ผ่าน"?"s-over":"s-wait";
const DEFAULT_COMPANIES=[{key:"lkl",label:"LeKise (LKL)"},{key:"lks",label:"LeKise Solar (LKS)"},{key:"lsc",label:"LSC Center"}];
const ICON={
home:'<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',
all:'<path d="M4 7h16M4 12h16M4 17h10"/>',
cal:'<rect x="3.5" y="5" width="17" height="15" rx="4.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
budget:'<path d="M12 4v16"/><path d="M16 8c0-2-2-3-4-3s-4 1-4 3 2 2.6 4 3 4 1 4 3-2 3-4 3-4-1-4-3"/>',
train:'<path d="M12 4 2.5 9 12 14l9.5-5L12 4z"/><path d="M6.5 11.2V16c0 1.5 2.6 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-4.8"/><path d="M21.5 9v5"/>',
idx:'<path d="M4 5.5A2 2 0 0 1 6 3.5h12v17H6a2 2 0 0 1-2-2z"/><path d="M8 8h7M8 12h7"/>',
note:'<path d="M12.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="m15.5 4.8 3.7 3.7L14 13.7l-3.7.4.4-3.7z"/>',
dsd:'<path d="M6.5 3.5h11v17l-5.5-3-5.5 3z"/><path d="M9.4 9.6l2 2 3.2-3.4"/>',
legal:'<path d="M12 3.5 4.5 6.5v5c0 4.4 3.1 8.2 7.5 9.2 4.4-1 7.5-4.8 7.5-9.2v-5L12 3.5z"/><path d="M9.2 12.2l2 2 3.6-3.8"/>',
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
const VIEWS=[["home","ภาพรวม"],["all","งานทั้งหมด"],["cal","ปฏิทิน"],["budget","งบประมาณ"],["meet","การประชุม"],["train","ฝึกอบรม"],["dsd","กรมพัฒนาฯ"],["legal","กฎหมาย"],["idx","Index Online"],["note","บันทึก & ไอเดีย"],["set","ตั้งค่า"]];
const TABS=["home","all","cal","budget","meet","train","dsd","legal","idx","note","set"];
const TABLABEL={home:"ภาพรวม",all:"งาน",meet:"ประชุม",train:"อบรม",dsd:"กรมพัฒฯ",legal:"กฎหมาย",idx:"Index",note:"บันทึก",cal:"ปฏิทิน",budget:"งบ",set:"ตั้งค่า"};
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
const sCls=x=>x==="เสร็จสิ้น"?"s-done":x==="ยกเลิก"?"s-cancel":x==="กำลังดำเนินการ"?"s-run":x==="อยู่ระหว่างดำเนินการ"?"s-mid":"s-wait";
const sColor=x=>x==="เสร็จสิ้น"?"var(--ok)":x==="ยกเลิก"?"var(--ink-3)":x==="กำลังดำเนินการ"?"var(--run)":x==="อยู่ระหว่างดำเนินการ"?"var(--sky)":"var(--wait)";
const visible=a=>a.filter(x=>!x.hidden);
const gLabel=k=>(groups.find(g=>g.key===k)||{}).label||k||"ไม่ระบุกลุ่ม";
const isGroupCo=c=>!!(c&&c.isGroup);
const realCos=()=>visible(companies).filter(c=>!isGroupCo(c));
const groupCos=()=>visible(companies).filter(isGroupCo);
const childrenOf=g=>visible(companies).filter(c=>!isGroupCo(c)&&c.parent===g.key);
const cLabel=k=>(companies.find(g=>g.key===k)||{}).label||k||"—";
const glLabel=k=>{const g=gls.find(x=>x.key===k);return g?(g.code?g.code+" · ":"")+g.label:(k||"ไม่ระบุ GL");};
const isMeet=t=>!!(t&&(t.meet||/ประชุม|meeting/i.test((t.title||"")+" "+(t.type||""))));
const hhmm=v=>/^\d{1,2}:\d{2}$/.test(v||"")?(v.length===4?"0"+v:v):"";
const tShow=v=>hhmm(v)?hhmm(v)+" น.":"";
const prepDate=t=>{const d=dueDate(t); if(!d||!(+t.prepDays))return null;
const p=new Date(d); p.setDate(p.getDate()-(+t.prepDays)); return p;};
const isTrain=t=>!!(t&&(t.train||/^train_/.test(t.track||"")||/อบรม/.test(gLabel(t.track))));
const trainKind=t=>t.track==="train_law"||/กฎหมาย/.test(gLabel(t.track))?"กฎหมาย":t.track==="train_out"||/ภายนอก/.test(gLabel(t.track))?"ภายนอก":"ภายใน";
const isoOf=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const occDone=(t,d)=>(((t&&t.done)||[]).includes(isoOf(d)));
function occList(t,from,months){
const out=[]; const s0=new Date(from);
for(let k=0;k<months;k++){const m=new Date(s0.getFullYear(),s0.getMonth()+k,1);
occDays(t,m.getFullYear(),m.getMonth()).forEach(dd=>out.push(new Date(m.getFullYear(),m.getMonth(),dd)));}
return out.sort((a,b)=>a-b);
}
function nextOpenOcc(t){
const today=new Date(); today.setHours(0,0,0,0);
const st=t.date?new Date(t.date):today;
const from=new Date(Math.min(st.getTime(),today.getTime()));
const list=occList(t,new Date(from.getFullYear(),from.getMonth(),1),18).filter(d=>!occDone(t,d));
const past=list.filter(d=>d<today);
return past.length?past[0]:(list.find(d=>d>=today)||null);
}
function occState(t){
if(!rr(t))return {label:t.status,cls:sCls(t.status),recur:false,d:t.date?new Date(t.date):null};
const d=nextOpenOcc(t);
if(!d)return {label:"ปิดครบทุกรอบแล้ว",cls:"s-done",recur:true,d:null};
const n=daysTo(d);
if(n<0)return {label:"รอบ "+d.getDate()+" "+MTH[d.getMonth()]+" ยังไม่ปิด",cls:"s-over",recur:true,d};
if(n===0)return {label:"รอบวันนี้",cls:"s-run",recur:true,d};
return {label:"อีก "+n+" วัน",cls:"s-wait",recur:true,d};
}
const dueDate=t=>{const R2=rr(t); if(R2)return nextOpenOcc(t); return t.date?new Date(t.date):null;};
const daysTo=d=>{const a=new Date();a.setHours(0,0,0,0);return Math.round((d-a)/864e5);};
const itemColor=t=>t&&t.color?t.color:sColor(t?t.status:"");
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
const ys=new Set([R.year]);
for(let y=THISYEAR-3;y<=THISYEAR+5;y++)ys.add(y);
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
let hrdata={manpower:{},certified:{},dsd:{},subsidy:{pct:70,rate:200}};
let legal=[], idx=[], notes=[];
const cache={items:new Map(),ledger:new Map(),legal:new Map(),index:new Map(),note:new Map(),meta:new Map()};
const listeners={items:[],ledger:[],legal:[],index:[],note:[],meta:new Map()};
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
setFoot("บันทึกไม่สำเร็จ · แตะดูสาเหตุ","var(--over)");
render();
throw error;
}
lastErr=null; if(sync.color)setFoot(items.length+" งาน · ซิงก์แล้ว");
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
const isSysRow=t=>!!(t&&(/^__(healthcheck|ทดสอบระบบ)__$/.test(t.title||"")));
async function purgeSysRows(){
try{
const {data}=await SB.from("rows").select("id,data").eq("uid",uid).eq("kind","items");
const bad=(data||[]).filter(r=>isSysRow(r.data)).map(r=>r.id);
for(let i=0;i<bad.length;i+=200){
await SB.from("rows").delete().eq("uid",uid).in("id",bad.slice(i,i+200));
}
if(bad.length){ bad.forEach(id=>cache.items.delete(id)); emit("items"); render(); }
return bad.length;
}catch(e){ return 0; }
}
async function loadAll(){
const {data,error}=await SB.from("rows").select("id,kind,data").eq("uid",uid);
if(error){setFoot("โหลดข้อมูลไม่ได้","var(--over)");return;}
cache.items.clear();cache.ledger.clear();cache.meta.clear();
data.forEach(r=>cache[r.kind]?.set(r.id,r.data));
emit("items");emit("ledger");emit("legal");emit("index");emit("note");[...cache.meta.keys()].forEach(emitMeta);
["groups","companies","gl","theme","hr"].forEach(emitMeta);
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
sub("meta/gl",d=>{seedGL._done=true; if(Array.isArray(d.list))gls=d.list;});
sub("meta/hr",d=>{hrdata={manpower:d.manpower||{},certified:d.certified||{},dsd:d.dsd||{},subsidy:d.subsidy||{pct:70,rate:200}};});
sub("meta/theme",d=>{if(d.preset){theme={preset:d.preset,custom:d.custom||null,mode:d.mode||"auto"};applyTheme();}});
DBShim.collection("items").onSnapshot(s=>{
items=s.docs.map(d=>Object.assign({},d.data(),{_id:d.id})).filter(t=>!isSysRow(t));
maybeSeedGL();
setFoot(items.length+" งาน · ซิงก์แล้ว"); render();});
DBShim.collection("index").onSnapshot(s=>{
idx=s.docs.map(d=>Object.assign({},d.data(),{_id:d.id})); render();});
DBShim.collection("note").onSnapshot(s=>{
notes=s.docs.map(d=>Object.assign({},d.data(),{_id:d.id})); render();});
DBShim.collection("legal").onSnapshot(s=>{
legal=s.docs.map(d=>Object.assign({},d.data(),{_id:d.id})); render();});
DBShim.collection("ledger").onSnapshot(s=>{
ledger=s.docs.map(d=>Object.assign({},d.data(),{_id:d.id})); render();});
setFoot("กำลังโหลด…");
await loadAll(); liveSync();
setFoot(items.length+" งาน · ซิงก์แล้ว");
const purged=await purgeSysRows();
if(purged)setFoot(items.length+" งาน · ลบรายการทดสอบค้าง "+purged+" แถวแล้ว");
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
n.innerHTML=`<span class="dotlive"${sync.color?` style="background:${sync.color}"`:""}></span>${esc(sync.txt)}${lastErr?" · แตะดูสาเหตุ":""}`;
n.classList.toggle("bad",!!lastErr);
n.onclick=lastErr?showLastErr:null;
});
}
const syncChip=()=>`<span class="syncchip${lastErr?" bad":""}"${lastErr?' role="button" tabindex="0" title="แตะเพื่อดูสาเหตุ"':""}><span class="dotlive"></span>${esc(sync.txt)}${lastErr?" · แตะดูสาเหตุ":""}</span>`;
function showLastErr(){
if(!lastErr){tell("ตอนนี้บันทึกข้อมูลได้ปกติค่ะ");return;}
const x=explainErr(lastErr);
tell("<b>"+esc(x.title)+"</b>"+(x.fix?'<div style="font-size:13px;margin-top:8px;line-height:1.7">'+x.fix+"</div>":"")+
'<div style="font-size:11.5px;margin-top:10px;opacity:.75;font-family:var(--mono);word-break:break-all">'+esc(x.raw)+"</div>"+
'<div style="font-size:12.5px;margin-top:10px">ลองแก้แล้วกด <b>ตั้งค่า → การเชื่อมต่อ → ทดสอบการบันทึกข้อมูล</b> เพื่อตรวจซ้ำได้ค่ะ</div>');
}
function maybeSeedGL(){
// สร้างหมวด GL อัตโนมัติได้ครั้งเดียวเท่านั้น และเฉพาะบัญชีที่ยังไม่เคยมีหมวด GL เลย
if(seedGL._done)return;
if(cache.meta.has("gl")){ seedGL._done=true; return; }   // เคยบันทึกหมวด GL ไว้แล้ว (ถึงจะว่างก็ห้ามสร้างทับ)
if(!items.length)return;
if(gls.length){ seedGL._done=true; return; }
seedGL._done=true;
seedGL();
}
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
const list=Object.values(found).sort((a,b)=>b.budget-a.budget);
if(!list.length)return;
gls=list;
if(DB)DB.doc("meta/gl").set({list:gls});
}
const glBudget=(g,y)=>{ if(!g)return 0;
if(g.budgets&&typeof g.budgets==="object"&&g.budgets[y]!=null)return +g.budgets[y]||0;
if(!g.budgets&&+g.budget)return (y===THISYEAR)?+g.budget:0;
return 0; };
const setGlBudget=(g,y,v)=>{ if(!g.budgets||typeof g.budgets!=="object"){ g.budgets = (+g.budget)?{[THISYEAR]:+g.budget}:{}; }
if(v)g.budgets[y]=v; else delete g.budgets[y]; g.budget=g.budgets[THISYEAR]||0; };
const glYears=g=>Object.keys((g&&g.budgets)||{}).filter(y=>+g.budgets[y]).map(Number).sort();
const glKeyOf=g=>{g=(g||"").trim();if(!g)return"";const m=g.match(/^(\d{6,9})/);return m?m[1]:g.slice(0,18);};
const mpOf=(c,y)=>+((hrdata.manpower[c]||{})[y])||0;
const certOf=(c,y)=>{const v=(hrdata.certified[c]||{})[y]; return v==null?null:+v||0;};
const saveHR=async()=>{ if(!DB)return; try{ await DB.doc("meta/hr").set({manpower:hrdata.manpower,certified:hrdata.certified,dsd:hrdata.dsd,subsidy:hrdata.subsidy}); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?'<div style="font-size:13px;margin-top:8px;line-height:1.7">'+x.fix+"</div>":"")); } };
const dsdRec=(c,y)=>((hrdata.dsd||{})[c]||{})[y]||null;
const dsdList=y=>visible(companies).filter(c=>!isGroupCo(c)&&dsdRec(c.key,y));
const LAWPCT=50;
const subPct=()=>+((hrdata.subsidy||{}).pct)||70;
const subRate=()=>+((hrdata.subsidy||{}).rate)||200;
const STD_RATE=1000, STD_CAP=100000, FUND_PCT=10;
function subsidyOf(k,r){
const base=k.avg*subPct()/100;
const excess=Math.max(0,Math.floor(k.C-base));
const amount=excess*subRate();
const stdN=+((r||{}).stdPass)||0;
const stdAmt=Math.min(stdN*STD_RATE,STD_CAP);
const fundPaid=+((r||{}).fundPaid)||0;
const fundAmt=Math.round(fundPaid*FUND_PCT/100);
return {base:Math.round(base*100)/100,excess,amount,
stdN,stdAmt,fundPaid,fundAmt,total:amount+stdAmt+fundAmt,
nextPerson:k.avg?Math.max(0,Math.ceil(base+1)-k.C):0};
}
const goalOf=r=>{const g=+((r||{}).goal); return (g&&g>=LAWPCT&&g<=100)?g:LAWPCT;};
function dsdCalc(r){
const ms=(r&&r.months)||[];
const vals=ms.map(v=>+v||0).filter(v=>v>0);
const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*100)/100:0;
const target=Math.ceil(avg*LAWPCT/100);
const goal=goalOf(r);
const goalTarget=Math.ceil(avg*goal/100);
const A=+((r||{}).sent)||0, B=+((r||{}).repeatTimes)||0;
const C=Math.max(0,A-B);
const pct=avg?Math.round(C/avg*10000)/100:0;
const need=Math.max(0,target-C);
const needGoal=Math.max(0,goalTarget-C);
const o={avg,target,goal,goalTarget,A,B,C,pct,need,needGoal,months:vals.length};
return Object.assign(o,{sub:subsidyOf(o,r)});
}
const trainedPax=(c,y)=>items.filter(t=>isTrain(t)&&(t.company||"")===c&&t.status==="เสร็จสิ้น"
&&(()=>{const d=dueDate(t);return d?d.getFullYear()===y:false;})()).reduce((n,t)=>n+(+t.pax||0),0);
const saveMeta=async(k,list)=>{ if(!DB)return; try{ await DB.doc("meta/"+k).set({list}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); } };
async function saveItem(data,id){ if(!DB)throw new Error("ยังไม่ได้เชื่อมต่อฐานข้อมูล"); if(data&&"_id" in data)delete data._id; return id?await DB.collection("items").doc(id).set(data):await DB.collection("items").add(data); }
async function hardRefresh(){
setFoot("กำลังรีเฟรช…");
try{ if(window.caches){ const ks=await caches.keys(); await Promise.all(ks.filter(k=>/skywork/i.test(k)).map(k=>caches.delete(k))); } }catch(e){}
try{ if(navigator.serviceWorker){ const rs=await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r=>r.update().catch(()=>{}))); } }catch(e){}
const u=new URL(location.href); u.searchParams.set("r",Date.now()); location.replace(u.toString());
}
function renderNav(){
const bs=el("brandsub"); if(bs)bs.textContent="เวอร์ชัน "+APP_VERSION;
el("nav").innerHTML=VIEWS.map(([k,l])=>`<button data-v="${k}" aria-current="${k===view}">${svg(ICON[k==="cal"?"cal":k])}<span>${l}</span></button>`).join("");
el("tabbar").innerHTML=TABS.map(k=>{const l=TABLABEL[k]||VIEWS.find(v=>v[0]===k)[1];
return `<button data-v="${k}" aria-current="${k===view}" title="${esc(VIEWS.find(v=>v[0]===k)[1])}">${svg(ICON[k],19)}<span>${l}</span></button>`;}).join("");
const go=e=>{const b=e.target.closest("button");if(!b)return;view=b.dataset.v;renderNav();render();window.scrollTo(0,0);};
el("nav").onclick=go; el("tabbar").onclick=go;
["brandBtn","brandBtnM"].forEach(id=>{const n=el(id); if(!n||n._wired)return; n._wired=1;
n.onclick=hardRefresh;
n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();hardRefresh();}};});
}
let LISTBOX={};
function regList(key,title,rows){ LISTBOX[key]={title,rows}; return `data-list="${esc(key)}"`; }
function openListBox(key){
const L=LISTBOX[key]; if(!L||!L.rows.length)return;
el("pdlgh").textContent=L.title;
el("pdlgb").innerHTML=`<div class="list">${L.rows.map((r,i)=>`<div class="li" data-pick="${i}">
<div class="ic" style="background:${r.c||"var(--line-2)"};color:${r.ic||"var(--ink-2)"}">${r.d||"—"}</div>
<div class="tx"><div class="t1">${esc(r.t1)}</div><div class="t2">${esc(r.t2||"")}</div></div>
<span class="pill ${r.pc||"s-wait"}">${esc(r.p||"แก้ไข")}</span></div>`).join("")}</div>
<div class="hint">แตะรายการเพื่อเปิดแก้ไข</div>`;
el("pdlgb").querySelectorAll("[data-pick]").forEach(n=>n.onclick=()=>{
const r=L.rows[+n.dataset.pick]; el("pdlg").close();
if(r.id){const t=items.find(x=>x._id===r.id); if(t)open_(t);}
else if(r.tx){const x=ledger.find(v=>v._id===r.tx); if(x)openTx(x);}
else if(r.lg){const g=legal.find(x=>x._id===r.lg); if(g)openLegal(g);}
});
el("pdlg").showModal();
}
function goTo(v,f){
Object.assign(F,{q:"",track:"",type:"",status:"",company:""},f&&f.F||{});
if(f&&f.R)Object.assign(R,f.R);
view=v; renderNav(); render(); window.scrollTo({top:0,behavior:"smooth"});
}
const jump=(v,payload)=>`data-go="${esc(JSON.stringify({v,...payload||{}}))}"`;
function render(){
LISTBOX={};
el("view").innerHTML={home,all,meet,train,dsd:dsdView,legal:legalView,idx:idxView,note:noteView,cal:calView,budget,pipeline,set:setView}[view]();
paintSync(); wire();
}
function header(title,sub,btn=true){
const lab=(view==="train"||view==="dsd")?"เพิ่มหลักสูตร":view==="meet"?"เพิ่มการประชุม":"เพิ่มงาน";
return `<div class="head"><div><h1>${title}</h1><div class="sub">${sub} · ${syncChip()}</div></div>
${btn?`<button class="btn addbtn" id="add">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>${lab}</span></button>`:""}</div>`;
}
function liRow(t,showDate){
const ms=monthsOf(t), d=t.date?fmtDate(t.date).split(" "):null;
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--line-2);color:${sColor(t.status)}">${(()=>{const n=rr(t)?dueDate(t):null;
if(n)return n.getDate()+"<br>"+MTH[n.getMonth()];
return d?`${d[0]}<br>${d[1]}`:(ms.length>1?"ประจำ":"—");})()}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${t.tag?`<b style="color:${itemColor(t)}">● ${esc(t.tag)}</b> · `:""}${rruleText(t)?esc(rruleText(t))+" · ":""}${esc(gLabel(t.track))}${t.company?" · "+esc(cLabel(t.company)):""}${t.owner?" · "+esc(t.owner):""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
${(()=>{const S=occState(t);
return `<span class="pill ${S.cls}">${esc(S.label)}</span>`+
(S.recur&&S.d&&daysTo(S.d)<=0?`<button class="okbtn" data-done="${t._id}|${isoOf(S.d)}" title="ปิดรอบวันที่ ${S.d.getDate()} ${MTH[S.d.getMonth()]}">${svg(ICON.check,15)}</button>`:"");})()}</div>`;
}
function prepDue(days){
days=days||7;
return items.filter(t=>isMeet(t)&&isOpenStatus(t.status)&&+t.prepDays>0)
.map(t=>({t,p:prepDate(t),d:dueDate(t)}))
.filter(x=>x.p&&x.d&&daysTo(x.d)>=0&&daysTo(x.p)<=days)
.sort((a,b)=>a.p-b.p);
}
function dueSoon(days){
days=days||7;
const late=[], soon=[];
items.forEach(t=>{ if(!isOpenStatus(t.status))return;
const d=dueDate(t); if(!d)return; const n=daysTo(d);
if(n<0)late.push(t); else if(n>=0&&n<=days)soon.push(t); });
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
legal.forEach(L=>{const d=legalDue(L); if(!d)return;
out.push("BEGIN:VEVENT","UID:lg-"+L._id+"@skywork","DTSTAMP:"+stamp(now)+"T090000Z",
"DTSTART;VALUE=DATE:"+stamp(d),"DTEND;VALUE=DATE:"+stamp(new Date(d.getTime()+864e5)),
"SUMMARY:"+esc2("[ครบกำหนด] "+L.title),
"DESCRIPTION:"+esc2([L.unit,L.person,(L.comps||[]).map(cLabel).join(", "),L.note].filter(Boolean).join(" · ")),
"BEGIN:VALARM","TRIGGER:-P30D","ACTION:DISPLAY","DESCRIPTION:"+esc2("ใกล้ครบกำหนด "+L.title),"END:VALARM","END:VEVENT");});
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
const A=scoped.filter(t=>t.track!=="idea"&&t.status!==STATUS_CANCEL);
const cnt=s=>A.filter(t=>t.status===s).length;
const done=cnt("เสร็จสิ้น"), run=cnt("กำลังดำเนินการ"), mid=cnt("อยู่ระหว่างดำเนินการ"), wait=cnt("รอดำเนินการ");
const cancelled=scoped.filter(t=>t.status===STATUS_CANCEL).length;
const bud=scoped.reduce((s,t)=>s+budgetOf(t),0), act=scoped.reduce((s,t)=>s+(+t.actual||0),0);
const over=items.filter(t=>budgetOf(t)>0&&(+t.actual||0)>budgetOf(t));
const up=items.filter(t=>t.date&&new Date(t.date)>=new Date(now.toDateString())&&isOpenStatus(t.status))
.sort((a,b)=>a.date<b.date?-1:1).slice(0,6);
const pct=A.length?Math.round(done/A.length*100):0;
const byMonth=MTH.map((_,i)=>items.filter(t=>monthsOf(t).includes(i+1)).length);
return header("สวัสดีค่ะ วิม 👋","Sky Work · ทุกงานรวมที่เดียว ซิงก์ทุกเครื่อง")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(()=>{const w=dueSoon();
const lg=legal.filter(L=>{const k=legalState(L).k;return k==="late"||k==="soon";});
const pr=prepDue(3);
return (lg.filter(L=>legalState(L).k==="late").length?`<div class="banner bad" ${regList("hLegal","ใบรับรอง/คำสั่งแต่งตั้งที่เกินกำหนด",lg.filter(L=>legalState(L).k==="late").map(L=>{const d=legalDue(L);return {lg:L._id,t1:L.title,
t2:`${(L.comps||[]).map(cLabel).join(", ")||"ไม่ระบุบริษัท"}${L.person?" · "+L.person:" · ยังไม่มีผู้รับผิดชอบ"}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--over-soft)",ic:"var(--over)",p:legalState(L).t,pc:"s-over"};}))}>${svg(ICON.legal,19)} ใบรับรอง/คำสั่งแต่งตั้ง <b>${lg.filter(L=>legalState(L).k==="late").length}</b> รายการเกินกำหนดแล้ว — ดูที่หน้ากฎหมาย</div>`:"")
+(pr.length?`<div class="banner bad" ${regList("hPrep","ต้องเตรียมข้อมูลก่อนประชุม",pr.map(x=>({id:x.t._id,t1:x.t.title,
t2:`ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${x.t.prepNote?" · "+x.t.prepNote:""}`,
d:`${x.p.getDate()}<br>${MTH[x.p.getMonth()]}`,c:"var(--over-soft)",ic:"var(--over)",
p:daysTo(x.p)<0?"เลยวันเตรียม":"เตรียมวันนี้",pc:"s-over"})))}>${svg(ICON.meet,19)} ต้องเตรียมข้อมูลก่อนประชุม <b>${pr.length}</b> รายการ — ${esc(pr.slice(0,2).map(x=>x.t.title).join(" · "))}${pr.length>2?" …":""}</div>`:"")
+(w.late.length?`<div class="banner bad" ${regList("hLate","งานที่เลยกำหนดแล้ว",w.late.map(t=>{const d=dueDate(t);return {id:t._id,t1:t.title,
t2:`${gLabel(t.track)}${t.company?" · "+cLabel(t.company):""}${t.owner?" · "+t.owner:""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--over-soft)",ic:"var(--over)",p:"เลย "+(-daysTo(d))+" วัน",pc:"s-over"};}))}>${svg(ICON.bell,19)} เลยกำหนดแล้ว <b>${w.late.length}</b> งาน — ${esc(w.late.slice(0,2).map(t=>t.title).join(" · "))}${w.late.length>2?" …":""}</div>`:"")
+(w.soon.length?`<div class="banner" ${regList("hSoon","ครบกำหนดใน 7 วัน",w.soon.map(t=>{const d=dueDate(t);return {id:t._id,t1:t.title,
t2:`${gLabel(t.track)}${t.company?" · "+cLabel(t.company):""}${t.owner?" · "+t.owner:""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--run-soft)",ic:"var(--run)",p:"อีก "+daysTo(d)+" วัน",pc:"s-run"};}))}>${svg(ICON.bell,19)} ครบกำหนดใน 7 วัน <b>${w.soon.length}</b> งาน — ${esc(w.soon.slice(0,2).map(t=>t.title).join(" · "))}${w.soon.length>2?" …":""}</div>`:"");})()+
(over.length?`<div class="banner" ${jump("budget")}>${svg(ICON.bell,19)} มี ${over.length} งานที่ใช้งบเกินแผน — ดูที่หน้างบประมาณ</div>`:"")+
`<div class="dash">
<div class="card hero span2"><div class="lab">ความคืบหน้า · ${scopeLabel()}</div>
<div class="big">${pct}%</div>
<div class="meta"><span>เสร็จแล้ว ${done} งาน</span><span>เหลืออีก ${A.length-done} งาน</span></div>
<div class="prog"><i style="width:${pct}%"></i></div></div>
<div class="card stat" ${jump("all",{F:{status:"กำลังดำเนินการ"}})}><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> กำลังดำเนินการ</div>
<div class="v">${run+mid}</div><div class="d">รอเริ่มอีก ${wait} งาน · แตะเพื่อดูรายการ</div></div>
<div class="card stat" ${jump("budget")}><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> งบคงเหลือ · ${scopeLabel()}</div>
<div class="v">${baht(bud-act)}</div><div class="d">ใช้ไป ${baht(act)} จาก ${baht(bud)}</div>
<div class="bar"><i class="${act>bud?"hot":""}" style="width:${bud?Math.min(100,act/bud*100):0}%"></i></div></div>
<div class="card span4"><h2>สรุปทุกหมวด <small>แตะการ์ดเพื่อไปดูที่มาของตัวเลข · ${scopeLabel()}</small></h2>
<div class="modgrid">
${(()=>{
const ms=items.filter(t=>isMeet(t)&&inScope(t)), pr=prepDue(7);
const tr=items.filter(t=>isTrain(t)&&inScope(t));
const pax=tr.reduce((n,t)=>n+(+t.pax||0),0);
const dsdWait=items.filter(t=>isTrain(t)&&t.dsd==="รอยื่น").length;
const lgLate=legal.filter(L=>legalState(L).k==="late").length;
const lgSoon=legal.filter(L=>legalState(L).k==="soon").length;
const lgNo=legal.filter(L=>legalState(L).k==="noperson").length;
const need=dsdList(R.year).map(c=>dsdCalc(dsdRec(c.key,R.year)).need).reduce((a,b)=>a+b,0);
const card=(icon,name,big,sub,go,warn)=>`<div class="mod${warn?" warn":""}" ${go}>
<div class="modh"><span class="ic">${svg(icon,16)}</span>${name}</div>
<div class="modv">${big}</div><div class="mods">${sub}</div></div>`;
return [
card(ICON.all,"งานทั้งหมด",A.length,`ค้าง ${A.length-done} · เสร็จ ${done}${cancelled?" · ยกเลิก "+cancelled:""}`,jump("all")),
card(ICON.meet,"การประชุม",ms.length,pr.length?`ต้องเตรียมข้อมูล ${pr.length} รายการ`:"ไม่มีที่ต้องเตรียม",jump("meet"),pr.length),
card(ICON.train,"ฝึกอบรม",tr.length+" หลักสูตร",`ผู้เข้าอบรม ${baht(pax)} คน${dsdWait?" · รอยื่นกรมพัฒฯ "+dsdWait:""}`,jump("train"),dsdWait),
card(ICON.legal,"กฎหมาย",legal.length,lgLate?`เกินกำหนด ${lgLate} · ใกล้ครบ ${lgSoon}`:(lgNo?`ยังไม่มีผู้รับผิดชอบ ${lgNo}`:"เรียบร้อยทั้งหมด"),jump("legal"),lgLate),
card(ICON.budget,"งบประมาณ",baht(bud-act)+" ฿",`ใช้ไป ${baht(act)} จาก ${baht(bud)}`,jump("budget"),act>bud&&bud>0),
card(ICON.cal,"ปฏิทิน",byMonth.reduce((a,b)=>a+b,0),`งานที่มีกำหนดในปี ${R.year+543}`,jump("cal")),
(()=>{const T=dsdTotals(R.year);
return card(ICON.dsd,"เกณฑ์กรมพัฒนาฯ",T.n?(T.mp?T.pct+"%":"—"):"ยังไม่ตั้งค่า",
T.n?`ทำได้ ${baht(T.C)}/${baht(T.target)} คน${T.need?` · ขาด ${baht(T.need)}`:(T.goalTarget>T.target?(T.needGoal?` · ครบเกณฑ์ · ถึงเป้าเราอีก ${baht(T.needGoal)}`:" · ถึงเป้าที่ตั้งเองแล้ว"):" · ครบเกณฑ์")}`:"เพิ่มสถานประกอบกิจการที่หน้ากรมพัฒนาฯ",
jump("dsd"),T.need);})(),
card(ICON.clock,"เตรียมประชุม",pr.length,pr.length?`ใกล้สุด ${pr[0].t.title.slice(0,18)}`:"ว่าง",jump("meet"),pr.length)
].join("");})()}
</div></div>
<div class="card span2"><h2>สัดส่วนสถานะงาน <small>${scopeLabel()} · ${A.length} งาน</small></h2>
<div class="donutwrap">
${donut([{n:"เสร็จสิ้น",v:done,c:"var(--ok)"},{n:"กำลังดำเนินการ",v:run,c:"var(--run)"},{n:"อยู่ระหว่างดำเนินการ",v:mid,c:"var(--sky)"},{n:"รอดำเนินการ",v:wait,c:"var(--wait)"}],A.length,"งานทั้งหมด")}
<div class="dlist">
<div ${jump("all",{F:{status:"เสร็จสิ้น"}})}><i style="background:var(--ok)"></i>เสร็จสิ้น<b>${done}</b></div>
<div ${jump("all",{F:{status:"กำลังดำเนินการ"}})}><i style="background:var(--run)"></i>กำลังดำเนินการ<b>${run}</b></div>
<div ${jump("all",{F:{status:"อยู่ระหว่างดำเนินการ"}})}><i style="background:var(--sky)"></i>อยู่ระหว่างดำเนินการ<b>${mid}</b></div>
<div ${jump("all",{F:{status:"รอดำเนินการ"}})}><i style="background:var(--wait)"></i>รอดำเนินการ<b>${wait}</b></div>
${cancelled?`<div ${jump("all",{F:{status:"ยกเลิก"}})}><i style="background:var(--ink-3)"></i>ยกเลิก<b>${cancelled}</b></div>`:""}</div></div></div>
<div class="card span2"><h2>จำนวนงานรายเดือน <small>ทั้งปี ${R.year+543}</small></h2>
${bars(byMonth,MTH,v=>v||"",now.getMonth())}</div>
<div class="card span2"><h2>งานใน${scopeLabel()} <small>${scoped.filter(t=>isOpenStatus(t.status)).length} รายการที่ยังไม่ปิด</small></h2>
<div class="list">${scoped.filter(t=>isOpenStatus(t.status)).slice(0,6).map(t=>liRow(t)).join("")||`<div class="empty">ไม่มีงานค้างในช่วงนี้ 🎉</div>`}</div></div>
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
<thead><tr><th>ประเภท</th><th>งาน</th><th>บริษัท</th><th>กลุ่ม</th><th>เวลา</th><th>ผู้รับผิดชอบ</th><th style="text-align:right">งบ</th><th style="text-align:right">ใช้จริง</th><th>สถานะ</th></tr></thead>
<tbody>${list.map(t=>`<tr data-id="${t._id}">
<td><span class="tag">${esc(t.type||"—")}</span></td>
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
<span class="dots">${ts.slice(0,4).map(t=>{const dt=new Date(y,m,d);const cl=rr(t)?(occDone(t,dt)?"var(--ok)":itemColor(t)):itemColor(t);
return `<i style="background:${cl}" title="${esc(t.title)}${rr(t)&&occDone(t,dt)?" · ปิดรอบแล้ว":""}"></i>`;}).join("")}</span>
${ts.length>4?`<span class="more">+${ts.length-4}</span>`:""}</div>`);
}
const selTasks=R.selDay?tasksOnDay(y,m,R.selDay):[];
return header("ปฏิทิน","แตะวันที่เพื่อดูงานของวันนั้น · จุดสีคือสถานะงาน")+
`<div class="toolbar">
<div class="seg" id="calmode">
<button data-cm="month" aria-pressed="${R.calMode==="month"}">รายเดือน</button>
<button data-cm="year" aria-pressed="${R.calMode==="year"}">ทั้งปี</button></div>
${R.calMode==="year"?yearSel("yrSel2"):""}
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
const CATS=[["อบรม",t=>isTrain(t)],["ประชุม",t=>!isTrain(t)&&isMeet(t)],
["โปรเจค",t=>!isTrain(t)&&!isMeet(t)&&/โปรเจค|project/i.test(gLabel(t.track)+" "+(t.type||""))],
["กิจกรรม",t=>!isTrain(t)&&!isMeet(t)&&/กิจกรรม/.test(gLabel(t.track)+" "+(t.type||""))],
["อื่นๆ",()=>true]];
const catOf=t=>(CATS.find(([,f])=>f(t))||CATS[CATS.length-1])[0];
function yearGrid(){
const thisYear=new Date().getFullYear();
const now=(R.year===thisYear)?new Date().getMonth()+1:0;
const list=items.filter(t=>monthsOf(t).length&&!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==R.year))
.sort((a,b)=>monthsOf(a)[0]-monthsOf(b)[0]);
const head=`<div class="mh" style="text-align:left">งาน</div>${MTH.map((x,i)=>`<div class="mh${i+1===now?" now":""}">${x}</div>`).join("")}`;
const rows=CATS.map(([name])=>{
const g=list.filter(t=>catOf(t)===name);
if(!g.length)return "";
return `<div class="cgroup">${esc(name)} <span>${g.length}</span></div>`+
MTH.map((_,i)=>`<div class="cgroup gcell${i+1===now?" now":""}">${(()=>{const n=g.filter(t=>monthsOf(t).includes(i+1)).length;return n||"";})()}</div>`).join("")+
g.map(t=>{const ms=monthsOf(t);return `<div class="cname" data-id="${t._id}">${esc(t.title)}</div>`+
MTH.map((_,i)=>`<div class="cell${i+1===now?" now":""}">${ms.includes(i+1)?`<span class="dot" style="background:${itemColor(t)}" title="${esc(t.tag||t.status)}"></span>`:""}</div>`).join("");}).join("");
}).join("");
return `<div class="card">
<div class="legend">
<span><i style="background:var(--ok)"></i>เสร็จสิ้น</span>
<span><i style="background:var(--run)"></i>กำลังดำเนินการ</span>
<span><i style="background:var(--wait)"></i>รอดำเนินการ</span>
<span style="margin-left:auto;color:var(--ink-3)">แยกตามหมวด · ${list.length} งานในปี ${R.year+543}</span></div>
${(()=>{const tg=[...new Set(list.map(t=>(t.tag||"").trim()).filter(Boolean))];
return tg.length?`<div class="legend" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line-2)">${tg.map(n=>`<span><i style="background:${tagColor(n)||"var(--ink-3)"}"></i>${esc(n)}</span>`).join("")}</div>`:"";})()}
<div class="cal"><div class="calgrid">${head}${rows||`<div style="grid-column:1/-1"><div class="empty">ไม่มีงานในปีนี้</div></div>`}</div></div></div>`;
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
gls.forEach(g=>{ planByGL[g.key]=Math.max(glBudget(g,R.year), taskPlan[g.key]||0); });
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
<div class="toolbar">${yearSel("yrSelB")} <div class="seg" id="budsc">
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
<div class="card span4"><h2>งบตามหมวด GL <small>ใช้จริง / งบที่ตั้งไว้ · แตะแถวเพื่อดูที่มาของตัวเลข</small></h2>
<div class="hint" style="margin:2px 0 10px">
<b>งบที่ตั้งไว้</b> = ค่าที่มากกว่าระหว่าง “งบตั้งต้นที่ตั้งเองในหน้าตั้งค่า” กับ “ผลรวมช่องงบของทุกงานในหมวดนี้” (ไม่บวกซ้ำ)<br>
<b>ใช้จริง</b> = ผลรวมช่องใช้จริงของงาน + รายจ่ายที่บันทึกในหน้านี้ ที่แท็กหมวดเดียวกัน</div>
${keys.length?keys.sort((x,y)=>(planByGL[y]||0)-(planByGL[x]||0)).map(k=>{
const a=spentByGL[k]||0,b=planByGL[k]||0,p=b?Math.min(100,a/b*100):(a?100:0);
const nm=k?glLabel(k):"ยังไม่ระบุหมวด GL";
const g=gls.find(x=>x.key===k);
const ceil=g?glBudget(g,R.year):0;
const tks=inYear.filter(t=>(glKeyOf(t.gl1)===k||glKeyOf(t.gl2)===k)&&((+t.b1||0)+(+t.b2||0)+(+t.actual||0))>0);
const txs=ledger.filter(x=>(x.gl||"")===k&&x.date&&new Date(x.date).getFullYear()===R.year);
const rowsL=[
...(ceil?[{t1:"งบตั้งต้นที่ตั้งไว้เอง (หน้าตั้งค่า → หมวด GL)",t2:`ปี ${R.year+543}`,d:"ตั้ง",p:baht(ceil)+" ฿",pc:"s-mid",c:"var(--accent-soft)",ic:"var(--accent)"}]:[]),
...tks.map(t=>{const d=dueDate(t);const mine=(glKeyOf(t.gl1)===k?+t.b1||0:0)+(glKeyOf(t.gl2)===k?+t.b2||0:0);
return {id:t._id,t1:t.title,t2:`งบ ${baht(mine)} ฿${glKeyOf(t.gl1)===k&&+t.actual?` · ใช้จริง ${baht(t.actual)} ฿`:""}${t.company?" · "+cLabel(t.company):""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",p:t.status,pc:sCls(t.status)};}),
...txs.map(x=>({tx:x._id,t1:x.note||(x.kind==="income"?"รายรับ":"รายจ่าย"),
t2:`บันทึกเงิน${x.company?" · "+cLabel(x.company):""}`,d:x.date?`${new Date(x.date).getDate()}<br>${MTH[new Date(x.date).getMonth()]}`:"—",
p:(x.kind==="income"?"+":"-")+baht(x.amount)+" ฿",pc:x.kind==="income"?"s-done":"s-run",c:"var(--run-soft)",ic:"var(--run)"}))];
const lk=regList("gl:"+k,esc(nm)+" · ปี "+(R.year+543),rowsL);
return `<div class="glrow" ${lk} style="cursor:pointer">
<div class="top"><span>${(()=>{const gg=gls.find(x=>x.key===k);return gg&&gg.dept?`<small style="color:var(--ink-3);font-weight:600">${esc(gg.dept)} · </small>`:"";})()}${esc(nm)} <small style="color:var(--ink-3);font-weight:400">${tks.length+txs.length?`· ${tks.length} งาน${txs.length?` · ${txs.length} รายการเงิน`:""}`:""}</small></span>
<span class="amt"${a>b&&b?' style="color:var(--over);font-weight:600"':""}>${baht(a)} / ${baht(b)} ›</span></div>
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
${(()=>{const S=occState(t);
return `<span class="pill ${S.cls}">${esc(S.label)}</span>`+
(S.recur&&S.d&&daysTo(S.d)<=0?`<button class="okbtn" data-done="${t._id}|${isoOf(S.d)}" title="ปิดรอบนี้">${svg(ICON.check,15)}</button>`:"");})()}</div>`;};
const prepRow=x=>`<div class="li" data-id="${x.t._id}">
<div class="ic" style="background:${daysTo(x.p)<=0?"var(--over-soft)":"var(--run-soft)"};color:${daysTo(x.p)<=0?"var(--over)":"var(--run)"}">${x.p.getDate()}<br>${MTH[x.p.getMonth()]}</div>
<div class="tx"><div class="t1">${esc(x.t.title)}</div>
<div class="t2">ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${tShow(x.t.time)?" "+tShow(x.t.time):""} · เตรียมล่วงหน้า ${x.t.prepDays} วัน${x.t.prepNote?" · "+esc(x.t.prepNote):""}</div></div>
<span class="pill ${daysTo(x.p)<=0?"s-wait":sCls(x.t.status)}">${daysTo(x.p)<0?"เลยวันเตรียม "+(-daysTo(x.p))+" วัน":daysTo(x.p)===0?"เตรียมวันนี้":"อีก "+daysTo(x.p)+" วัน"}</span></div>`;
const byDow=DOWFULL.map((_,i)=>routine.filter(t=>(t.rrule.weekdays||[]).includes(i)).length);
return header("การประชุม","ประชุมประจำ ประชุมเฉพาะกิจ และงานที่ต้องเตรียมข้อมูลก่อนประชุม")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(prepNow.length?`<div class="banner bad" ${regList("prepNow","ถึงกำหนดเตรียมข้อมูลแล้ว",prepNow.map(x=>({id:x.t._id,
t1:x.t.title,t2:`ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${tShow(x.t.time)?" "+tShow(x.t.time):""}${x.t.prepNote?" · "+x.t.prepNote:""}`,
d:`${x.p.getDate()}<br>${MTH[x.p.getMonth()]}`,c:"var(--over-soft)",ic:"var(--over)",
p:daysTo(x.p)<0?"เลย "+(-daysTo(x.p))+" วัน":"วันนี้",pc:"s-over"})))}>${svg(ICON.bell,19)} ถึงกำหนดเตรียมข้อมูลแล้ว <b>${prepNow.length}</b> การประชุม — ${esc(prepNow.slice(0,2).map(x=>x.t.title).join(" · "))}${prepNow.length>2?" …":""}</div>`:"")+
(prepSoon.length?`<div class="banner" ${regList("prepSoon","ใกล้ถึงวันเตรียมข้อมูล",prepSoon.map(x=>({id:x.t._id,
t1:x.t.title,t2:`ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${x.t.prepNote?" · "+x.t.prepNote:""}`,
d:`${x.p.getDate()}<br>${MTH[x.p.getMonth()]}`,c:"var(--run-soft)",ic:"var(--run)",p:"อีก "+daysTo(x.p)+" วัน",pc:"s-run"})))}>${svg(ICON.clock,19)} ใกล้ถึงวันเตรียมข้อมูล <b>${prepSoon.length}</b> การประชุมใน 7 วัน</div>`:"")+
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
function dsdTotals(y){
const L=dsdList(y);
const t={n:L.length,subAmt:0,subExc:0,stdAmt:0,fundAmt:0,subTotal:0,mp:0,target:0,goalTarget:0,A:0,B:0,C:0,need:0,needGoal:0,done:0,doneGoal:0,updated:null,rows:[]};
L.forEach(c=>{const r=dsdRec(c.key,y), k=dsdCalc(r);
t.mp+=k.avg; t.target+=k.target; t.goalTarget+=k.goalTarget; t.A+=k.A; t.B+=k.B; t.C+=k.C; t.need+=k.need; t.needGoal+=k.needGoal;
t.subAmt=(t.subAmt||0)+k.sub.amount; t.subExc=(t.subExc||0)+k.sub.excess;
t.stdAmt=(t.stdAmt||0)+k.sub.stdAmt; t.fundAmt=(t.fundAmt||0)+k.sub.fundAmt; t.subTotal=(t.subTotal||0)+k.sub.total;
if(k.avg&&k.pct>=LAWPCT)t.done++;
if(k.avg&&k.pct>=k.goal)t.doneGoal++;
if(r.updatedAt&&(!t.updated||r.updatedAt>t.updated))t.updated=r.updatedAt;
t.rows.push({c,k,r});});
t.mp=Math.round(t.mp*100)/100;
t.pct=t.mp?Math.round(t.C/t.mp*10000)/100:0;
t.goalPct=t.mp?Math.round(t.goalTarget/t.mp*10000)/100:LAWPCT;
return t;
}
const fmtStamp=iso=>{if(!iso)return "";const d=new Date(iso);
return `${d.getDate()} ${MTH[d.getMonth()]} ${d.getFullYear()+543-2500} เวลา ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;};
function dsdView(){
const ty=items.filter(t=>isTrain(t)&&inScope(t));
const byDsdStatus=d=>items.filter(t=>isTrain(t)&&(t.dsd||"")===d&&inScope(t));
const waiting=byDsdStatus("รอยื่น"), sent=byDsdStatus("ยื่นแล้ว"), okd=byDsdStatus("อนุมัติแล้ว"), bad=byDsdStatus("ไม่ผ่าน");
const need=dsdList(R.year).map(c=>dsdCalc(dsdRec(c.key,R.year)).need).reduce((a,b)=>a+b,0);
const card=t=>{const d=dueDate(t);
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${t.company?esc(cLabel(t.company))+" · ":""}${esc(t.batch||"ยังไม่ระบุรุ่น")}${t.pax?" · "+t.pax+" คน":""}</div></div>
${t.dsd&&t.dsd!=="ไม่ต้องยื่น"?`<span class="tag sky">${esc(t.dsd)}</span>`:""}
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;};
return header("กรมพัฒนาฝีมือแรงงาน","เกณฑ์ 50% ต่อปี และทะเบียนการยื่นรับรองหลักสูตร")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(waiting.length?`<div class="banner" ${regList("dsdWait","หลักสูตรที่รอยื่นกรมพัฒนาฯ",waiting.map(t=>{const d=dueDate(t);return {id:t._id,
t1:t.title,t2:`${t.company?cLabel(t.company)+" · ":""}${t.batch||"ยังไม่ระบุรุ่น"}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--run-soft)",ic:"var(--run)",p:"รอยื่น",pc:"s-run"};}))}>${svg(ICON.bell,19)} รอยื่นกรมพัฒฯ <b>${waiting.length}</b> หลักสูตร</div>`:"")+
(need?`<div class="banner bad">${svg(ICON.bell,19)} ยังไม่ถึงเกณฑ์ 50% — ต้องฝึกอีกรวม <b>${baht(need)}</b> คน</div>`:"")+
`<div class="dash">
${(()=>{const T=dsdTotals(R.year);
const pass=T.pct>=50;
return `<div class="card hero span4" style="padding-bottom:22px">
<div class="lab">สรุปเกณฑ์กรมพัฒนาฝีมือแรงงาน · ปี ${R.year+543} · ${T.n} สถานประกอบกิจการ</div>
<div style="display:flex;flex-wrap:wrap;gap:26px;align-items:flex-end;margin-top:6px;position:relative;z-index:1">
<div><div class="big" style="margin:0">${T.mp?T.pct+"%":"—"}</div>
<div style="font-size:13px;opacity:.9">ของลูกจ้างทั้งหมด · เกณฑ์กฎหมาย ${LAWPCT}%${T.goalPct>LAWPCT?` · เป้าที่ตั้งเอง ${T.goalPct}%`:""}</div></div>
<div class="kpis">
<div><span>พนักงานเฉลี่ยรวม</span><b>${T.mp?baht(T.mp):"—"}</b></div>
<div><span>เป้ากฎหมาย ${LAWPCT}%</span><b>${T.target?baht(T.target):"—"}</b></div>
${T.goalTarget>T.target?`<div><span>เป้าที่ตั้งเอง</span><b style="color:#ffe7a8">${baht(T.goalTarget)}</b></div>`:""}
<div><span>ทำได้แล้ว (C)</span><b>${baht(T.C)}</b></div>
<div><span>ขาดถึงเกณฑ์</span><b>${T.need?baht(T.need)+" คน":"ครบแล้ว ✓"}</b></div>
${T.goalTarget>T.target?`<div><span>ขาดถึงเป้าเรา</span><b style="color:#ffe7a8">${T.needGoal?baht(T.needGoal)+" คน":"ถึงเป้าแล้ว ✓"}</b></div>`:""}
<div><span>ผ่านเกณฑ์</span><b>${T.done}/${T.n} แห่ง</b></div>
<div><span>เงินอุดหนุนคาดว่าได้</span><b style="color:${T.subTotal?"#8ef0c8":"inherit"}">${T.subTotal?baht(T.subTotal)+" ฿":"—"}</b></div>
</div></div>
<div class="prog goalbar" style="height:14px">
<i style="width:${Math.min(100,T.pct)}%;background:${T.pct>=T.goalPct?"#8ef0c8":pass?"#bfe9ff":"#ffd08a"}"></i>
<u style="left:${LAWPCT}%"></u>${T.goalPct>LAWPCT?`<u class="g2" style="left:${Math.min(100,T.goalPct)}%"></u>`:""}</div>
<div style="display:flex;font-size:11.5px;opacity:.9;margin-top:6px;position:relative;height:16px">
<span style="position:absolute;left:0">0%</span>
<span style="position:absolute;left:${LAWPCT}%;transform:translateX(-50%)">กฎหมาย ${LAWPCT}%</span>
${T.goalPct>LAWPCT?`<span style="position:absolute;left:${Math.min(96,T.goalPct)}%;transform:translateX(-50%);color:#ffe7a8;font-weight:600">เป้าเรา ${T.goalPct}%</span>`:""}
<span style="position:absolute;right:0">100%</span></div>
<div style="font-size:12px;opacity:.85;margin-top:10px">
${T.updated?`ข้อมูลอัปเดตล่าสุด ${fmtStamp(T.updated)}`:"ยังไม่เคยบันทึกข้อมูล — กด “แก้ไข” ในตารางด้านล่าง"}</div></div>
<div class="card span2"><h2>ความคืบหน้ารายบริษัท <small>เทียบเป้า 50%</small></h2>
${T.rows.length?T.rows.map(({c,k})=>{const p=k.avg?Math.min(100,Math.round(k.pct)):0;
const st=k.avg?(k.pct>=k.goal?"var(--ok)":k.pct>=LAWPCT?"var(--accent)":"var(--over)"):"var(--ink-3)";
return `<div class="glrow"><div class="top"><span>${esc(c.label)}${k.goal>LAWPCT?` <small style="color:var(--ink-3);font-weight:400">· เป้า ${k.goal}%</small>`:""}</span>
<span class="amt" style="color:${st};font-weight:600">${k.avg?k.pct+"%":"—"}</span></div>
<div class="bar goalbar"><i class="${k.avg&&k.pct<LAWPCT?"hot":""}" style="width:${p}%;${k.avg&&k.pct>=k.goal?"background:var(--ok)":""}"></i>
<u style="left:${LAWPCT}%"></u>${k.goal>LAWPCT?`<u class="g2" style="left:${Math.min(100,k.goal)}%"></u>`:""}</div>
<div class="t-note" style="margin-top:4px">ทำได้ ${baht(k.C)} · เกณฑ์ ${baht(k.target)} คน${k.need?` (ขาด ${baht(k.need)})`:" ✓"}${k.goal>LAWPCT?` · เป้าเรา ${baht(k.goalTarget)} คน${k.needGoal?` (ขาด ${baht(k.needGoal)})`:" ✓"}`:""}</div></div>`;}).join("")
:`<div class="empty">ยังไม่มีสถานประกอบกิจการ — กด “เพิ่มสถานประกอบกิจการ” ด้านล่าง</div>`}</div>
<div class="card span4"><h2>เงินอุดหนุนกองทุนพัฒนาฝีมือแรงงาน <small>ผลงานปี ${R.year+543} → ยื่นภายใน 31 ส.ค. ${R.year+544}</small></h2>
${(()=>{const T=dsdTotals(R.year);
const rows=T.rows.filter(x=>x.k.avg||x.k.sub.stdN||x.k.sub.fundPaid);
return `<div class="hint" style="margin:2px 0 12px">
<b>ช่องทางที่ 1 — ฝึกอบรมเกิน ${subPct()}%</b> &nbsp;(ส่วนที่เกิน) × ${baht(subRate())} ฿ ต่อคน · นับ<b>คนไม่ซ้ำ</b> เริ่มนับตั้งแต่คนที่เกิน ${subPct()}% เป็นต้นไป<br>
<b>ช่องทางที่ 2 — ทดสอบมาตรฐานฝีมือแรงงานแห่งชาติ</b> &nbsp;จำนวนคนที่ผ่านทดสอบ × ${baht(STD_RATE)} ฿ (ต้องจ่ายค่าจ้างตามมาตรฐานฝีมือไม่น้อยกว่า 180 วันก่อนยื่น · <b>ไม่เกินปีละ ${baht(STD_CAP)} ฿</b>)<br>
<b>ช่องทางที่ 3 — คืนเงินสมทบ ${FUND_PCT}%</b> &nbsp;เงินสมทบที่นำส่งกองทุน × ${FUND_PCT}% (กรณีปีที่ผ่านมาส่งเงินสมทบ แล้วปีถัดมาพัฒนาครบตามสัดส่วน)</div>
<div class="tblwrap wide"><table><thead><tr><th>สถานประกอบกิจการ</th><th style="text-align:right">พนักงานเฉลี่ย</th>
<th style="text-align:right">ฐาน ${subPct()}%</th><th style="text-align:right">ผ่านรับรอง (C)</th>
<th style="text-align:right">ส่วนที่เกิน</th><th style="text-align:right">1) อบรมเกิน ${subPct()}%</th>
<th style="text-align:right">2) ทดสอบมาตรฐาน</th><th style="text-align:right">3) คืนเงินสมทบ</th>
<th style="text-align:right">รวมคาดว่าได้</th><th>ถ้าฝึกเพิ่ม</th></tr></thead>
<tbody>${rows.length?rows.map(({c,k})=>`<tr data-nolink="1">
<td><div style="font-weight:600">${esc(c.label)}</div></td>
<td class="num">${k.avg?baht(k.avg):"—"}</td><td class="num">${k.avg?baht(k.sub.base):"—"}</td><td class="num">${baht(k.C)}</td>
<td class="num"${k.sub.excess?' style="color:var(--ok);font-weight:600"':""}>${k.sub.excess?"+"+baht(k.sub.excess):"—"}</td>
<td class="num">${k.sub.amount?baht(k.sub.amount):"—"}</td>
<td class="num">${k.sub.stdAmt?baht(k.sub.stdAmt)+(k.sub.stdN*STD_RATE>STD_CAP?" (เต็มเพดาน)":""):"—"}</td>
<td class="num">${k.sub.fundAmt?baht(k.sub.fundAmt):"—"}</td>
<td class="num" style="font-weight:700;color:${k.sub.total?"var(--ok)":"var(--ink-3)"}">${k.sub.total?baht(k.sub.total)+" ฿":"0 ฿"}</td>
<td class="t-note">${k.sub.excess?`อีก 1 คน = +${baht(subRate())} ฿`:(k.sub.nextPerson?`อีก ${baht(k.sub.nextPerson)} คน จึงเริ่มได้`:"—")}</td></tr>`).join("")
:`<tr><td colspan="10"><div class="empty">ยังไม่มีข้อมูล — ใส่จำนวนพนักงานที่ตารางด้านล่างก่อน</div></td></tr>`}
${rows.length?`<tr data-nolink="1" style="background:var(--line-2)">
<td style="font-weight:700">รวมทุกแห่ง</td><td class="num" style="font-weight:600">${baht(T.mp)}</td><td class="num">—</td>
<td class="num" style="font-weight:600">${baht(T.C)}</td>
<td class="num" style="font-weight:700;color:${T.subExc?"var(--ok)":"inherit"}">${T.subExc?"+"+baht(T.subExc):"—"}</td>
<td class="num" style="font-weight:600">${baht(T.subAmt)}</td><td class="num" style="font-weight:600">${baht(T.stdAmt)}</td>
<td class="num" style="font-weight:600">${baht(T.fundAmt)}</td>
<td class="num" style="font-weight:700;color:${T.subTotal?"var(--ok)":"inherit"}">${baht(T.subTotal)} ฿</td><td></td></tr>`:""}
</tbody></table></div>
<div class="addg" style="margin-top:14px;align-items:center">
<span style="font-size:13px;color:var(--ink-3)">ปรับเกณฑ์ตามประกาศปีนั้น</span>
<input id="sub-pct" type="number" min="1" max="100" value="${subPct()}" style="max-width:100px" aria-label="เปอร์เซ็นต์">
<span style="font-size:13px;color:var(--ink-3)">% · หัวละ</span>
<input id="sub-rate" type="number" min="0" step="10" value="${subRate()}" style="max-width:120px" aria-label="บาทต่อคน">
<span style="font-size:13px;color:var(--ink-3)">บาท</span></div>
<div class="hint">ที่มา: หลักเกณฑ์การให้เงินช่วยเหลือหรืออุดหนุน ตาม พ.ร.บ. ส่งเสริมการพัฒนาฝีมือแรงงาน พ.ศ. 2545 (ข้อ 3, 4, 6)<br>
<b>กำหนดยื่น</b> ภายใน <b>31 สิงหาคม</b> ของทุกปี โดยใช้ผลงานของ<b>ปีที่ผ่านมา</b> · ต้องยื่นประเมินเงินสมทบกองทุนฯ ประจำปีด้วย<br>
ตัวเลขนี้เป็นการประมาณการจากข้อมูลที่คุณกรอก ใช้เตรียมเอกสารและตั้งเป้า ไม่ใช่ยอดที่กรมฯ อนุมัติ ควรตรวจสอบกับเจ้าหน้าที่ก่อนยื่นจริง</div>`;})()}
</div>
<div class="card span2"><h2>สถานะการยื่นหลักสูตร <small>${ty.length} หลักสูตรในปีนี้</small></h2>
<div class="donutwrap">
${(()=>{const parts=[{n:"อนุมัติแล้ว",v:okd.length,c:"var(--ok)"},{n:"ยื่นแล้ว",v:sent.length,c:"var(--run)"},
{n:"รอยื่น",v:waiting.length,c:"var(--wait)"},{n:"ไม่ผ่าน",v:bad.length,c:"var(--over)"}].filter(p=>p.v);
const tot=parts.reduce((a,b)=>a+b.v,0);
return (tot?donut(parts,tot,"หลักสูตร"):`<div class="empty" style="flex:1">ยังไม่มีหลักสูตรที่ต้องยื่น</div>`)+
`<div class="dlist">${parts.map(p=>`<div><i style="background:${p.c}"></i>${p.n}<b>${p.v}</b></div>`).join("")}
${tot?`<div style="border-top:1px solid var(--line-2);padding-top:8px;margin-top:2px"><i style="background:transparent"></i>คืบหน้า<b>${Math.round((okd.length/tot)*100)}%</b></div>`:""}</div>`;})()}
</div></div>`;})()}
<div class="card span4"><h2>เกณฑ์กรมพัฒนาฝีมือแรงงาน ปี ${R.year+543} <small>โครงสร้างตามแบบยื่นของกรมฯ · เฉลี่ยจากจำนวนพนักงานรายเดือน</small></h2>
<div class="tblwrap wide"><table>
<thead><tr><th>สถานประกอบกิจการ</th><th style="text-align:right">พนักงานเฉลี่ย</th><th style="text-align:right">เกณฑ์ 50%</th><th style="text-align:right">เป้าที่ตั้งเอง</th>
<th style="text-align:right">A ส่งฝึกแล้ว</th><th style="text-align:right">B ฝึกซ้ำ (ครั้ง)</th><th style="text-align:right">C = A−B</th>
<th style="text-align:right">คิดเป็น %</th><th style="text-align:right">ต้องฝึกอีก</th><th>สถานะ</th><th></th></tr></thead>
<tbody>${(()=>{const L=dsdList(R.year);
return L.length?L.map(c=>{const r=dsdRec(c.key,R.year), k=dsdCalc(r), auto=trainedPax(c.key,R.year);
const pass=k.pct>=50;
return `<tr data-nolink="1">
<td><div style="font-weight:600">${esc(c.label)}</div>
<div class="t-note">${r.id?"ทะเบียน "+esc(r.id)+" · ":""}กรอกพนักงานแล้ว ${k.months} เดือน${auto&&auto!==k.A?` · ระบบนับจากหลักสูตรได้ ${auto} คน`:""}</div></td>
<td class="num">${k.avg?baht(k.avg):"—"}</td><td class="num">${k.target?baht(k.target):"—"}</td>
<td class="num"${k.goal>LAWPCT?' style="font-weight:600"':""}>${k.avg?(k.goal>LAWPCT?baht(k.goalTarget)+` (${k.goal}%)`:"—"):"—"}</td>
<td class="num">${baht(k.A)}</td><td class="num">${baht(k.B)}</td>
<td class="num" style="font-weight:600">${baht(k.C)}</td>
<td class="num" style="font-weight:600;color:${k.avg?(pass?"var(--ok)":"var(--over)"):"inherit"}">${k.avg?k.pct+"%":"—"}</td>
<td class="num"${k.need?' style="color:var(--over);font-weight:600"':""}>${k.avg?(k.need?baht(k.need)+" คน":(k.needGoal?baht(k.needGoal)+" คน (ถึงเป้า)":"ครบแล้ว")):"—"}</td>
<td><span class="pill ${k.avg?(pass?"s-done":"s-run"):"s-wait"}">${k.avg?(pass?"ผ่านเกณฑ์":"ยังไม่ถึง 50%"):"ยังไม่มีข้อมูล"}</span></td>
<td><button class="btn ghost sm" data-dsd="${esc(c.key)}">แก้ไข</button></td></tr>`;}).join("")
:`<tr><td colspan="11"><div class="empty">ยังไม่มีสถานประกอบกิจการในปีนี้ — กด “เพิ่มสถานประกอบกิจการ” ด้านล่าง<br>
<span style="font-size:12.5px">ใส่เฉพาะนิติบุคคลที่ยื่นกรมพัฒนาฯ เท่านั้น (กลุ่มบริษัทอย่าง LKG ไม่ต้องใส่)</span></div></td></tr>`;})()}
</tbody></table></div>
<div class="addg"><button class="btn ghost" id="dsdAdd">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มสถานประกอบกิจการ</button>
${Object.keys(hrdata.dsd||{}).some(k=>dsdRec(k,R.year-1))?`<button class="btn ghost" id="dsdCopy">คัดลอกโครงจากปี ${R.year+542}</button>`:""}</div>
<div class="hint"><b>พนักงานเฉลี่ย</b> คิดจากเดือนที่กรอกตัวเลขไว้เท่านั้น เดือนที่ยังไม่ถึงหรือเว้นว่างจะไม่ถูกนำมาหาร (ตรงกับวิธีของกรมฯ)<br>
<b>C = A − B</b> คือจำนวนที่นับได้จริงหลังตัดคนที่ฝึกซ้ำออก · <b>คิดเป็น %</b> = C ÷ พนักงานเฉลี่ย<br>
ตัวเลขในระบบเป็นของคุณเอง ใช้เทียบกับหน้าเว็บกรมฯ ได้ แต่ไม่ได้ดึงจากกรมฯ อัตโนมัติ</div></div>
<div class="card span4"><h2>ทะเบียนการยื่นหลักสูตร <small>ยื่นเปิดหลักสูตร → ยื่นรับรองรุ่น</small></h2>
<div class="tblwrap wide"><table><thead><tr><th>หลักสูตร</th><th>บริษัท</th><th>รุ่น</th>
<th>ยื่นเปิดหลักสูตร</th><th>เลขคำขอเปิด</th><th>ยื่นรับรองรุ่น</th><th>เลขคำขอรับรอง</th><th style="text-align:right">คน</th><th>สถานะ</th></tr></thead><tbody>
${(()=>{const dl=ty.filter(t=>t.dsd&&t.dsd!=="ไม่ต้องยื่น"||t.dsdOpenNo||t.dsdCertNo);
return dl.length?dl.map(t=>`<tr data-id="${t._id}">
<td><div style="font-weight:600">${esc(t.title)}</div>${t.code?`<div class="t-note">${esc(t.code)}</div>`:""}</td>
<td>${esc(t.company?cLabel(t.company):"—")}</td><td>${esc(t.batch||"—")}</td>
<td class="num">${t.dsdOpenDate?fmtDate(t.dsdOpenDate):"—"}</td><td style="font-family:var(--mono);font-size:12.5px">${esc(t.dsdOpenNo||"—")}</td>
<td class="num">${t.dsdCertDate?fmtDate(t.dsdCertDate):"—"}</td><td style="font-family:var(--mono);font-size:12.5px">${esc(t.dsdCertNo||"—")}</td>
<td class="num">${t.pax||"—"}</td><td><span class="pill ${dsdCls(t.dsd)}">${esc(t.dsd||"—")}</span></td></tr>`).join("")
:`<tr><td colspan="9"><div class="empty">ยังไม่มีหลักสูตรที่ต้องยื่น — เปิดหลักสูตรแล้วเลือกสถานะกรมพัฒฯ</div></td></tr>`;})()}
</tbody></table></div></div>
<div class="card span4"><h2>สถานะการยื่นรับรองหลักสูตร <small>แตะรายการเพื่อแก้ไข</small></h2>
<div class="legend" style="margin:10px 0 2px">
<span><i style="background:var(--wait)"></i>รอยื่น ${waiting.length}</span>
<span><i style="background:var(--run)"></i>ยื่นแล้ว ${sent.length}</span>
<span><i style="background:var(--ok)"></i>อนุมัติแล้ว ${okd.length}</span>
${bad.length?`<span><i style="background:var(--over)"></i>ไม่ผ่าน ${bad.length}</span>`:""}</div>
<div class="list">${[...waiting,...sent,...bad].map(card).join("")||`<div class="empty">ไม่มีหลักสูตรที่ค้างยื่น 🎉</div>`}</div></div>
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
const byDsdStatus=d=>items.filter(t=>isTrain(t)&&(t.dsd||"")===d&&inScope(t));
const waiting=byDsdStatus("รอยื่น"), sent=byDsdStatus("ยื่นแล้ว"), okd=byDsdStatus("อนุมัติแล้ว"), bad=byDsdStatus("ไม่ผ่าน");
const lawLate=byKind("กฎหมาย").filter(t=>{const d=dueDate(t);return isOpenStatus(t.status)&&d&&daysTo(d)<0;});
const byMonth=MTH.map((_,i)=>items.filter(t=>isTrain(t)&&monthsOf(t).includes(i+1)).length);
const card=t=>{const d=dueDate(t);
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}</div>
<div class="t2">${t.skill?esc(t.skill)+" · ":""}${t.mode?esc(t.mode)+" · ":""}${esc(trainKind(t))}${t.vendor?" · "+esc(t.vendor):""}${t.pax?" · "+t.pax+" คน":""}${t.hours?" · "+t.hours+" ชม.":""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
${t.dsd&&t.dsd!=="ไม่ต้องยื่น"?`<span class="tag sky">กรมพัฒฯ ${esc(t.dsd)}</span>`:""}
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;};
const board=(title,arr,note)=>`<div class="card span2"><h2>${esc(title)} <small>${arr.length} หลักสูตร</small></h2>
<div class="list">${arr.map(card).join("")||`<div class="empty">${esc(note||"ยังไม่มีรายการ")}</div>`}</div></div>`;
return header("ฝึกอบรม","หลักสูตรทั้งหมด ผู้เข้าอบรม ชั่วโมง และสถานะการยื่นกรมพัฒนาฝีมือแรงงาน")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+
(lawLate.length?`<div class="banner bad" ${regList("lawLate","อบรมตามกฎหมายที่เลยกำหนด",lawLate.map(t=>{const d=dueDate(t);return {id:t._id,
t1:t.title,t2:`${trainKind(t)}${t.company?" · "+cLabel(t.company):""}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--over-soft)",ic:"var(--over)",
p:d?"เลย "+(-daysTo(d))+" วัน":"—",pc:"s-over"};}))}>${svg(ICON.bell,19)} อบรมตามกฎหมาย ${lawLate.length} หลักสูตรเลยกำหนดแล้วและยังไม่ปิดงาน</div>`:"")+
`<div class="dash">
<div class="card hero span2"><div class="lab">หลักสูตร · ${scopeLabel()}</div>
<div class="big">${ty.length}</div>
<div class="meta"><span>ปิดงานแล้ว ${done}</span><span>คงเหลือ ${ty.length-done}</span></div>
<div class="prog"><i style="width:${ty.length?Math.round(done/ty.length*100):0}%"></i></div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.train,16)}</span> ผู้เข้าอบรม</div>
<div class="v">${baht(pax)}</div><div class="d">รวม ${baht(Math.round(hrs))} คน-ชั่วโมง</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> ค่าอบรมต่อหัว</div>
<div class="v">${pax?baht(Math.round(cost/pax)):"—"}</div><div class="d">ค่าใช้จ่ายรวม ${baht(cost)} ฿</div></div>
<div class="card span2"><h2>ประเภทการอบรม <small>Soft / Hard / Safety</small></h2>
<div class="donutwrap">
${(()=>{const n=k=>ty.filter(t=>(t.skill||"")===k).length, un=ty.filter(t=>!t.skill).length;
const parts=[...SKILLS.map(k=>({n:k,v:n(k),c:SKILLC[k]})),...(un?[{n:"ยังไม่ระบุ",v:un,c:"var(--wait)"}]:[])];
return donut(parts,ty.length,"หลักสูตร")+
`<div class="dlist">${parts.map(p=>`<div ${p.n==="ยังไม่ระบุ"?"":regList("sk:"+p.n,"ประเภทการอบรม · "+p.n,ty.filter(t=>(t.skill||"")===p.n).map(t=>{const d=dueDate(t);return {id:t._id,t1:t.title,
t2:`${t.mode||"ยังไม่ระบุรูปแบบ"}${t.company?" · "+cLabel(t.company):""}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",p:t.status,pc:sCls(t.status)};}))}><i style="background:${p.c}"></i>${esc(p.n)}<b>${p.v}</b></div>`).join("")}</div>`;})()}
</div></div>
<div class="card span2"><h2>รูปแบบการอบรม <small>In-House · Public · OJT · Online · สัมมนา</small></h2>
<div class="donutwrap">
${(()=>{const n=k=>ty.filter(t=>(t.mode||"")===k).length, un=ty.filter(t=>!t.mode).length;
const parts=[...MODES.filter(k=>n(k)).map(k=>({n:k,v:n(k),c:MODEC[k]})),...(un?[{n:"ยังไม่ระบุ",v:un,c:"var(--wait)"}]:[])];
return donut(parts,ty.length,"หลักสูตร")+
`<div class="dlist">${parts.map(p=>`<div ${p.n==="ยังไม่ระบุ"?"":regList("md:"+p.n,"รูปแบบการอบรม · "+p.n,ty.filter(t=>(t.mode||"")===p.n).map(t=>{const d=dueDate(t);return {id:t._id,t1:t.title,
t2:`${t.skill||"ยังไม่ระบุประเภท"}${t.vendor?" · "+t.vendor:""}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",p:t.status,pc:sCls(t.status)};}))}><i style="background:${p.c}"></i>${esc(p.n)}<b>${p.v}</b></div>`).join("")}</div>`;})()}
</div></div>
<div class="card span2"><h2>แผนอบรมรายเดือน <small>ทั้งปี ${R.year+543}</small></h2>
${bars(byMonth,MTH,v=>v||"",new Date().getMonth())}</div>
${board("อบรมตามกฎหมาย",byKind("กฎหมาย"),"ยังไม่มีหลักสูตรตามกฎหมายในช่วงนี้")}
${board("อบรมภายใน",byKind("ภายใน"))}
${board("อบรมภายนอก",byKind("ภายนอก"))}
</div>`;
}
function legalView(){
const fc=R.legalComp||"", fk=R.legalCat||"";
const list=legal.filter(L=>(!fc||(L.comps||[]).includes(fc))&&(!fk||L.cat===fk))
.sort((a,b)=>{const A=legalDue(a),B=legalDue(b);
if(A&&B)return A-B; if(A)return -1; if(B)return 1; return (a.title||"")<(b.title||"")?-1:1;});
const st=L=>legalState(L);
const late=legal.filter(L=>st(L).k==="late"), soon=legal.filter(L=>st(L).k==="soon");
const noP=legal.filter(L=>st(L).k==="noperson"||st(L).k==="none");
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const row=L=>{const S=st(L), d=legalDue(L);
return `<tr data-lg="${L._id}">
<td><div style="font-weight:600">${esc(L.title)}</div>
<div class="t-note">${esc(L.unit||"")}${L.note?(L.unit?" · ":"")+esc(String(L.note).slice(0,70))+(String(L.note).length>70?"…":""):""}</div></td>
<td>${(L.comps||[]).length?(L.comps||[]).map(k=>`<span class="tag" style="margin:1px">${esc(cLabel(k))}</span>`).join(""):"—"}</td>
<td>${esc(L.person||"—")}</td>
<td class="num">${L.issued?fmtDate(L.issued)+" "+(new Date(L.issued).getFullYear()+543-2500):"—"}</td>
<td class="num">${L.lifetime?"ไม่มีกำหนด":(d?fmtDate(d)+" "+(d.getFullYear()+543-2500):"—")}</td>
<td><span class="pill ${S.c}">${esc(S.t)}</span></td></tr>`;};
return header("กฎหมาย & ใบรับรอง","ใบรับรองผู้รับผิดชอบเฉพาะ คำสั่งแต่งตั้ง และข้อกำหนดที่ต้องทำประจำ",false)+
`<div class="head" style="margin-top:-6px"><div></div>
<button class="btn addbtn" id="addLegal">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มรายการ</span></button></div>`+
(late.length?`<div class="banner bad" ${regList("lgLate","ใบรับรอง/คำสั่งแต่งตั้งที่เกินกำหนด",late.map(L=>{const d=legalDue(L);return {lg:L._id,
t1:L.title,t2:`${(L.comps||[]).map(cLabel).join(", ")||"ไม่ระบุบริษัท"}${L.person?" · "+L.person:" · ยังไม่มีผู้รับผิดชอบ"}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--over-soft)",ic:"var(--over)",p:legalState(L).t,pc:"s-over"};}))}>${svg(ICON.bell,19)} เกินกำหนดแล้ว <b>${late.length}</b> รายการ — ${esc(late.slice(0,2).map(L=>L.title).join(" · "))}${late.length>2?" …":""}</div>`:"")+
(soon.length?`<div class="banner" ${regList("lgSoon","ใกล้ครบกำหนดใน 90 วัน",soon.map(L=>{const d=legalDue(L);return {lg:L._id,
t1:L.title,t2:`${(L.comps||[]).map(cLabel).join(", ")||"ไม่ระบุบริษัท"}${L.person?" · "+L.person:""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--run-soft)",ic:"var(--run)",p:legalState(L).t,pc:"s-run"};}))}>${svg(ICON.clock,19)} ใกล้ครบกำหนดใน 90 วัน <b>${soon.length}</b> รายการ</div>`:"")+
`<div class="dash">
<div class="card hero span2"><div class="lab">รายการที่ต้องดูแล</div>
<div class="big">${legal.length}</div>
<div class="meta"><span>เรียบร้อย ${legal.filter(L=>st(L).k==="ok").length}</span><span>ต้องจัดการ ${late.length+soon.length+noP.length}</span></div>
<div class="prog"><i style="width:${legal.length?Math.round(legal.filter(L=>st(L).k==="ok").length/legal.length*100):0}%"></i></div></div>
<div class="card stat"><div class="k"><span class="ic" style="background:var(--over-soft);color:var(--over)">${svg(ICON.bell,16)}</span> เกินกำหนด</div>
<div class="v" style="color:${late.length?"var(--over)":"inherit"}">${late.length}</div><div class="d">ใกล้ครบอีก ${soon.length} รายการ</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.meet,16)}</span> ยังไม่มีผู้รับผิดชอบ</div>
<div class="v">${noP.length}</div><div class="d">จาก ${legal.length} รายการ</div></div>
<div class="card span4">
<div class="toolbar" style="margin-bottom:6px">
<select id="lg-comp">${opt([["","ทุกบริษัท"],...visible(companies).map(c=>[c.key,c.label])],fc)}</select>
<select id="lg-cat">${opt([["","ทุกหมวด"],...LEGALCAT.map(x=>[x,x])],fk)}</select>
<span style="font-size:13px;color:var(--ink-3)">${list.length} รายการ</span></div>
<div class="tblwrap"><table>
<thead><tr><th>รายการ</th><th>บริษัทที่ต้องมี</th><th>ผู้รับผิดชอบ</th><th>วันที่ออก</th><th>ครบกำหนด</th><th>สถานะ</th></tr></thead>
<tbody>${list.map(row).join("")||`<tr><td colspan="6"><div class="empty">ยังไม่มีรายการ — กด “เพิ่มรายการ” หรือ นำเข้า CSV ที่หน้าตั้งค่า</div></td></tr>`}</tbody></table></div></div>
</div>`;
}
const IDXSTATUS=["ใช้งานอยู่","กำลังพัฒนา","ไม่ได้ใช้งาน"];
function idxView(){
const fg=R.idxGroup||"", fs2=R.idxStatus||"";
const groups2=[...new Set(idx.map(x=>(x.group||"").trim()).filter(Boolean))].sort();
const list=idx.filter(x=>(!fg||x.group===fg)&&(!fs2||(x.status||"ใช้งานอยู่")===fs2))
.sort((a,b)=>((a.group||"")+(a.title||""))<((b.group||"")+(b.title||""))?-1:1);
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const active=idx.filter(x=>(x.status||"ใช้งานอยู่")==="ใช้งานอยู่").length;
return header("Index Online","ทะเบียนเอกสารและเว็บไซต์ที่ HR ใช้งาน · รวมลิงก์ไว้ที่เดียว",false)+
`<div class="head" style="margin-top:-6px"><div></div>
<button class="btn addbtn" id="addIdx">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มรายการ</span></button></div>
<div class="dash">
<div class="card hero span2"><div class="lab">ทะเบียนทั้งหมด</div><div class="big">${idx.length}</div>
<div class="meta"><span>ใช้งานอยู่ ${active}</span><span>${groups2.length} กลุ่มงาน</span></div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.link,16)}</span> มีลิงก์แล้ว</div>
<div class="v">${idx.filter(x=>x.url).length}</div><div class="d">จาก ${idx.length} รายการ · ที่เหลือใส่ลิงก์เพิ่มได้</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.meet,16)}</span> ผู้ดูแล</div>
<div class="v">${[...new Set(idx.map(x=>(x.owner||"").trim()).filter(Boolean))].length}</div><div class="d">คน</div></div>
${(()=>{const withUrl=idx.filter(x=>x.url&&(x.status||"ใช้งานอยู่")!=="ไม่ได้ใช้งาน");
if(!withUrl.length)return `<div class="card span4"><h2>ลิงก์ด่วน</h2>
<div class="empty">ยังไม่มีรายการไหนใส่ลิงก์ไว้ — แตะรายการในตารางด้านล่าง แล้วใส่ลิงก์ในช่อง “ลิงก์”<br>
<span style="font-size:12.5px">ใส่แล้วจะขึ้นเป็นปุ่มกดเปิดได้ทันทีตรงนี้</span></div></div>`;
const byG={}; withUrl.forEach(x=>{const g=x.group||"อื่นๆ";(byG[g]=byG[g]||[]).push(x);});
return `<div class="card span4"><h2>ลิงก์ด่วน <small>${withUrl.length} ลิงก์ · แตะเพื่อเปิดในแท็บใหม่</small></h2>
${Object.keys(byG).sort().map(g=>`<div class="lkgroup"><div class="lkg">${esc(g)}</div>
<div class="lkrow">${byG[g].map(x=>`<a class="lkchip" href="${esc(x.url)}" target="_blank" rel="noopener">
${svg(ICON.link,15)}<span>${esc(x.title)}</span></a>`).join("")}</div></div>`).join("")}</div>`;})()}
<div class="card span4">
<div class="toolbar" style="margin-bottom:6px">
<select id="ix-group">${opt([["","ทุกกลุ่มงาน"],...groups2.map(g=>[g,g])],fg)}</select>
<select id="ix-status">${opt([["","ทุกสถานะ"],...IDXSTATUS.map(x=>[x,x])],fs2)}</select>
<span style="font-size:13px;color:var(--ink-3)">${list.length} รายการ</span></div>
<div class="tblwrap"><table>
<thead><tr><th>สารบัญ / ระบบ</th><th>กลุ่มงาน</th><th>ผู้ดูแล</th><th>รายละเอียด</th><th>สถานะ</th></tr></thead>
<tbody>${list.map(x=>`<tr data-ix="${x._id}">
<td><div style="font-weight:600">${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener" data-stop="1" class="lklink">${esc(x.title)}</a>`:esc(x.title)}</div>
${x.url?`<div class="t-note lkurl">${svg(ICON.link,12)} ${esc((x.url||"").replace(/^https?:\/\//,"").slice(0,48))}</div>`:`<div class="t-note">ยังไม่ได้ใส่ลิงก์ — แตะแถวเพื่อใส่</div>`}
${x.note?`<div class="t-note">${esc(x.note)}</div>`:""}</td>
<td>${esc(x.group||"—")}</td><td>${esc(x.owner||"—")}</td>
<td><div class="t-note">${esc(x.detail||"—")}</div></td>
<td><span class="pill ${(x.status||"ใช้งานอยู่")==="ใช้งานอยู่"?"s-done":(x.status==="กำลังพัฒนา"?"s-run":"s-cancel")}">${esc(x.status||"ใช้งานอยู่")}</span></td>
</tr>`).join("")
||`<tr><td colspan="5"><div class="empty">ยังไม่มีรายการ — กด “เพิ่มรายการ” หรือ นำเข้า CSV (หัวคอลัมน์แรก “สารบัญ”)</div></td></tr>`}</tbody></table></div></div>
</div>`;
}
const NOTEKIND=["บันทึกการประชุม","โน้ต","ไอเดีย"];
function noteView(){
const fk=R.noteKind||"", q=(R.noteQ||"").toLowerCase();
const list=notes.filter(n=>(!fk||n.kind===fk)&&(!q||((n.title||"")+" "+(n.body||"")+" "+(n.tag||"")).toLowerCase().includes(q)))
.sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||((b.date||"")<(a.date||"")?-1:1));
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const cnt=k=>notes.filter(n=>n.kind===k).length;
return header("บันทึก & ไอเดีย","บันทึกการประชุม โน้ตประจำวัน และไอเดียที่ยังไม่ได้ทำ",false)+
`<div class="head" style="margin-top:-6px"><div></div>
<button class="btn addbtn" id="addNote">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เขียนบันทึก</span></button></div>
<div class="dash">
<div class="card hero span2"><div class="lab">บันทึกทั้งหมด</div><div class="big">${notes.length}</div>
<div class="meta">${NOTEKIND.map(k=>`<span>${k} ${cnt(k)}</span>`).join("")}</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.bell,16)}</span> ปักหมุดไว้</div>
<div class="v">${notes.filter(n=>n.pin).length}</div><div class="d">ขึ้นบนสุดเสมอ</div></div>
<div class="card stat"><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> บันทึกล่าสุด</div>
<div class="v" style="font-size:17px">${notes.length?esc((notes.slice().sort((a,b)=>(b.date||"")<(a.date||"")?-1:1)[0].date||"—")):"—"}</div><div class="d">วันที่ล่าสุด</div></div>
<div class="card span4">
<div class="toolbar" style="margin-bottom:6px">
<input type="search" id="nt-q" placeholder="ค้นหาในบันทึก" value="${esc(R.noteQ||"")}">
<select id="nt-kind">${opt([["","ทุกประเภท"],...NOTEKIND.map(x=>[x,x])],fk)}</select></div>
<div class="notegrid">${list.map(n=>`<div class="notecard" data-nt="${n._id}" style="border-left:5px solid ${n.color||"var(--accent-2)"}">
<div class="nh"><span class="tag${n.kind==="ไอเดีย"?" sky":""}">${esc(n.kind||"โน้ต")}</span>
${n.pin?`<span class="tag sky">ปักหมุด</span>`:""}
<span style="margin-left:auto;font-size:12px;color:var(--ink-3)">${esc(n.date||"")}</span></div>
<div class="nt1">${esc(n.title||"(ไม่มีหัวข้อ)")}</div>
<div class="nb">${esc((n.body||"").slice(0,180))}${(n.body||"").length>180?"…":""}</div>
${n.tag?`<div class="t-note" style="margin-top:6px">#${esc(n.tag)}</div>`:""}</div>`).join("")
||`<div class="empty">ยังไม่มีบันทึก — กด “เขียนบันทึก”</div>`}</div></div>
</div>`;
}
function setView(){
const body={groups:setGroups,companies:setCompanies,gl:setGL,theme:setTheme_,remind:setRemind,import:setImport,connect:setConnect}[settab]();
return header("ตั้งค่า","ทุกอย่างที่ปรับได้อยู่ในนี้ · เปลี่ยนแล้วมีผลทุกหน้าและทุกเครื่อง",false)+
`<div class="toolbar"><div class="seg" id="settabs">
${SETTABS.map(([k,l])=>`<button data-st="${k}" aria-pressed="${k===settab}">${l}</button>`).join("")}
</div></div>${body}`;
}
const ICON_MOVE='<path d="M4 12h13"/><path d="M13 7l5 5-5 5"/><path d="M20 5v14"/>';
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
return `<div class="rw${g.hidden?" off":""}">${nameInput("data-ren",g.key,g.label)}
<button class="gcbtn" data-see="track:${esc(g.key)}" title="ดูงานในกลุ่มนี้">${n} งาน</button>
<button class="iconbtn" data-move="track:${esc(g.key)}" title="ย้ายงานทั้งหมดไปกลุ่มอื่น"${n?"":" disabled"}>${svg(ICON_MOVE,15)}</button>
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
return `<div class="rw${c.hidden?" off":""}">${nameInput("data-renc",c.key,c.label)}
<button class="gcbtn" data-see="company:${esc(c.key)}" title="ดูงานของบริษัทนี้">${n} งาน</button>
<button class="iconbtn" data-move="company:${esc(c.key)}" title="ย้ายงานทั้งหมดไปบริษัทอื่น"${n?"":" disabled"}>${svg(ICON_MOVE,15)}</button>
<select class="cosel" data-parent="${esc(c.key)}" title="กลุ่มบริษัท">
<option value="">— บริษัทเดี่ยว —</option>
<option value="__group__"${c.isGroup?" selected":""}>เป็นกลุ่มบริษัท</option>
${companies.filter(x=>x.isGroup&&x.key!==c.key).map(x=>`<option value="${esc(x.key)}"${(!c.isGroup&&c.parent===x.key)?" selected":""}>อยู่ในกลุ่ม ${esc(x.label)}</option>`).join("")}
</select>
${moveBtns("companies",i,companies.length,c.hidden)}
<button class="btn danger sm" data-delc="${esc(c.key)}">ลบ</button></div>`;}).join("")||`<div class="empty">ยังไม่มีบริษัท</div>`}</div>
<div class="addg"><input id="newc" placeholder="ชื่อบริษัท เช่น LeKise Trading">
<button class="btn" id="addc">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มบริษัท</button></div>
<div class="hint">ช่องขวาสุดใช้บอกว่าแถวนั้นเป็น <b>กลุ่มบริษัท</b> (เช่น LeKise Group) หรือเป็นบริษัทที่อยู่ในกลุ่มไหน — หน้าฝึกอบรมจะรวมตัวเลขของกลุ่มให้เอง และยังแยกรายบริษัทไว้สำหรับยื่นกรมพัฒนาฯ<br>
เรียงลำดับและซ่อนได้เหมือนกลุ่มงาน · ที่ซ่อนไว้จะไม่ขึ้นในตัวเลือกตอนเพิ่มงานและบันทึกเงิน</div></div>`;
}
function setGL(){
const y=R.glYear||R.year;
const tot=gls.reduce((s,g)=>s+glBudget(g,y),0);
return `<div class="card"><h2>หมวดงบประมาณ (GL) <small>${gls.length} หมวด · งบปี ${y+543} รวม ${baht(tot)} ฿</small></h2>
<div class="toolbar" style="margin:12px 0 0">
<span style="font-size:13.5px;color:var(--ink-3)">กำลังตั้งงบของปี</span>
<select id="glYearSel" style="border:0;background:var(--paper);border-radius:999px;padding:9px 16px;font-weight:600">
${yearList().map(v=>`<option value="${v}"${v===y?" selected":""}>พ.ศ. ${v+543} · ${v}</option>`).join("")}</select>
<button class="btn ghost sm" id="glCopy">คัดลอกงบจากปี ${y+542} มาใส่ปีนี้</button></div>
<div class="rows">${gls.map((g,i)=>`<div class="rw${g.hidden?" off":""}">
<input class="gldept" data-rend="${esc(g.key)}" value="${esc(g.dept||"")}" placeholder="Budget Dept." aria-label="Budget Department">
<input class="glcode" data-renc2="${esc(g.key)}" value="${esc(g.code||"")}" placeholder="รหัส GL" aria-label="รหัส GL">
${nameInput("data-reng",g.key,g.label)}
<input type="number" class="glb" data-glb="${esc(g.key)}" value="${glBudget(g,y)||""}" placeholder="งบปี ${y+543}" aria-label="งบ ${esc(g.label)} ปี ${y+543}">
<span class="glyears">${(()=>{const ys=glYears(g).filter(v=>v!==y);return ys.length?ys.map(v=>`${v+543}: ${kbaht(glBudget(g,v))}`).join(" · "):"";})()}</span>
${moveBtns("gl",i,gls.length,g.hidden)}
<button class="btn danger sm" data-delgl="${esc(g.key)}">ลบ</button></div>`).join("")||`<div class="empty">ยังไม่มีหมวด GL</div>`}</div>
<div class="addg">
<input id="gldept" placeholder="Budget Dept. เช่น HR" style="max-width:170px">
<input id="glcode" placeholder="รหัส GL เช่น 785000000" style="max-width:190px">
<input id="glname" placeholder="ชื่อหมวด เช่น ค่าอบรมและสัมมนา">
<input id="glbud" type="number" placeholder="งบปี ${y+543}" style="max-width:170px">
<button class="btn" id="addgl">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มหมวด</button></div>
<div class="hint">ช่องแรก <b>Budget Department</b> คือฝ่ายที่เป็นเจ้าของงบก้อนนั้น (เช่น HR, HRD, Admin) · งบแยกตามปี — เปลี่ยนปีด้านบนเพื่อวางงบล่วงหน้าได้เลย ตัวเลขปีอื่นแสดงไว้ข้างช่อง · แก้รหัส ชื่อ หรืองบได้ในช่อง กดนอกช่องแล้วบันทึกทันที · เลื่อนลำดับให้หมวดที่ใช้บ่อยอยู่บนสุด · หมวดที่ซ่อนจะไม่ขึ้นในตัวเลือก แต่ตัวเลขยังรวมอยู่ในสรุปงบ</div></div>`;
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
• งานที่ใช้งบ 2 ก้อน ใส่ <b>หมวด GL รอง</b> กับ <b>งบรอง</b> เพิ่มได้ (เช่น BB-HR-CT กับ HR-LSC)<br>
• <b>ผู้เข้าอบรม / ชั่วโมง / วิทยากร/สถาบัน / กรมพัฒฯ</b> ใส่เฉพาะงานอบรม (กรมพัฒฯ ใช้ได้: ไม่ต้องยื่น / รอยื่น / ยื่นแล้ว / อนุมัติแล้ว / ไม่ผ่าน)<br>
• กลุ่มที่มีคำว่า "อบรม" ระบบจะนับเป็นงานฝึกอบรมให้อัตโนมัติ<br>
• งานเดิมจะไม่ถูกลบ ระบบเพิ่มต่อท้ายเสมอ<br>
• ถ้าหัวคอลัมน์แรกเป็น <b>ชื่อรายการ</b> ระบบจะถือว่าเป็นทะเบียนกฎหมาย/ใบรับรอง และนำเข้าไปที่เมนู “กฎหมาย” ให้เอง<br>
• ถ้ามีคอลัมน์ <b>สารบัญ</b> ระบบจะนำเข้าไปที่เมนู “Index Online” ให้เอง
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
<button class="btn ghost" id="expLegal">ดาวน์โหลดทะเบียนกฎหมาย</button>
<button class="btn ghost" id="expIdx">ดาวน์โหลด Index</button>
<button class="btn ghost" id="expNote">ดาวน์โหลดบันทึก</button>
<button class="btn ghost" id="signout">ออกจากระบบ</button></div>
<div id="csvout2"></div></div>
<div class="card span4" style="box-shadow:inset 0 0 0 2px var(--over-soft)"><h2 style="color:var(--over)">ล้างข้อมูล <small>ใช้เมื่อจะนำเข้าข้อมูลใหม่ทั้งชุด</small></h2>
<div class="hint" style="margin-top:0">ลบข้อมูลของบัญชีนี้ออกจากเซิร์ฟเวอร์ถาวร กู้คืนไม่ได้ · การตั้งค่า (กลุ่มงาน บริษัท หมวด GL ธีมสี) จะไม่ถูกลบ<br>
<b>ดาวน์โหลด CSV เก็บไว้ก่อนทุกครั้ง</b> ปุ่มอยู่ด้านบน</div>
<div class="addg">
<button class="btn danger" id="wipeTasks">ล้างงานทั้งหมด (${items.length} รายการ)</button>
<button class="btn danger" id="wipeLedger">ล้างรายการเงิน (${ledger.length} รายการ)</button>
</div>
<div id="wipeout"></div></div>
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
let healthState="idle";
async function checkHealth(){
const box=el("health"); if(!box)return;
if(healthState==="run")return;
healthState="run";
try{ await runHealth(box); } finally { healthState="done"; }
}
async function runHealth(box){
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
const w=await SB.from("rows").upsert({id,uid,kind:"sys",data:{t:"healthcheck"},updated_at:new Date().toISOString()});
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
function askCode(msg,code,yes="ยืนยันการลบ"){
el("cmsg").innerHTML=msg+`<div style="margin-top:14px"><input id="cinput" placeholder="พิมพ์รหัสยืนยันที่นี่" autocomplete="off"
style="width:100%;background:var(--paper);border:0;border-radius:var(--r-xs);padding:12px 14px;font-size:16px;font-family:var(--mono);box-shadow:inset 0 0 0 1.5px transparent"></div>
<div id="cerr" style="color:var(--over);font-size:13px;margin-top:8px"></div>`;
el("cyes").textContent=yes; el("cyes").style.display=""; el("cno").textContent="ยกเลิก";
el("cdlg").showModal(); setTimeout(()=>el("cinput")&&el("cinput").focus(),80);
codeWanted=code;
return new Promise(r=>{cResolve=r;});
}
let codeWanted=null;
function askPick(msg,optionsHtml,yes="ยืนยัน"){
el("cmsg").innerHTML=msg+`<div style="margin-top:14px"><select id="cpick" style="width:100%;background:var(--paper);border:0;border-radius:var(--r-xs);padding:12px 14px;font-size:15px">${optionsHtml}</select></div>`;
el("cyes").textContent=yes; el("cyes").style.display=""; el("cno").textContent="ยกเลิก";
el("cdlg").showModal();
return new Promise(r=>{cResolve=v=>r(v?(el("cpick")&&el("cpick").value):null);});
}
function tell(msg){
el("cmsg").innerHTML=msg; el("cyes").style.display="none"; el("cno").textContent="ปิด";
el("cdlg").showModal();
return new Promise(r=>{cResolve=r;});
}
el("cyes").onclick=()=>{
if(codeWanted){
const v=(el("cinput")&&el("cinput").value||"").trim();
if(v!==codeWanted){ const e=el("cerr"); if(e)e.textContent="รหัสไม่ตรงค่ะ ต้องพิมพ์ให้ตรงทุกตัวอักษร"; if(el("cinput"))el("cinput").select(); return; }
codeWanted=null;
}
el("cdlg").close();cResolve&&cResolve(true);};
el("cno").onclick=()=>{codeWanted=null;el("cdlg").close();cResolve&&cResolve(false);};
function wire(){
document.querySelectorAll("[data-go]").forEach(n=>{n.style.cursor="pointer";
n.onclick=e=>{e.stopPropagation();
try{const d=JSON.parse(n.dataset.go);
 if(d.id){const t=items.find(x=>x._id===d.id); if(t){open_(t);return;}}
 if(d.lg){const L=legal.find(x=>x._id===d.lg); if(L){openLegal(L);return;}}
 goTo(d.v,{F:d.F,R:d.R});}catch(err){}};});
document.querySelectorAll("[data-list]").forEach(n=>{n.style.cursor="pointer";
n.onclick=e=>{e.stopPropagation();openListBox(n.dataset.list);};});
el("pclose")&&(el("pclose").onclick=()=>el("pdlg").close());
document.querySelectorAll("[data-done]").forEach(b=>b.onclick=async e=>{
e.stopPropagation();
const [id,iso]=b.dataset.done.split("|");
const t=items.find(x=>x._id===id); if(!t)return;
const done=[...(t.done||[])];
const i=done.indexOf(iso); if(i>=0)done.splice(i,1); else done.push(iso);
const {_id,...rest}=t;
try{ await saveItem({...rest,done},_id); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); }
});
el("add")&&(el("add").onclick=()=>open_(null));
el("addTx")&&(el("addTx").onclick=()=>openTx(null));
el("addLegal")&&(el("addLegal").onclick=()=>openLegal(null));
el("addIdx")&&(el("addIdx").onclick=()=>openIdx(null));
el("addNote")&&(el("addNote").onclick=()=>openNote(null));
document.querySelectorAll("[data-ix]").forEach(n=>n.onclick=e=>{
if(e.target.closest("[data-stop]"))return;
const x=idx.find(v=>v._id===n.dataset.ix); if(x)openIdx(x);});
document.querySelectorAll("[data-nt]").forEach(n=>n.onclick=()=>{
const x=notes.find(v=>v._id===n.dataset.nt); if(x)openNote(x);});
el("ix-group")&&(el("ix-group").onchange=e=>{R.idxGroup=e.target.value;render();});
el("ix-status")&&(el("ix-status").onchange=e=>{R.idxStatus=e.target.value;render();});
el("nt-kind")&&(el("nt-kind").onchange=e=>{R.noteKind=e.target.value;render();});
el("nt-q")&&(el("nt-q").oninput=e=>{const v=e.target.value,p=e.target.selectionStart;R.noteQ=v;render();
const m=el("nt-q"); if(m){m.focus();m.setSelectionRange(p,p);}});
document.querySelectorAll("[data-lg]").forEach(n=>n.onclick=()=>{
const L=legal.find(x=>x._id===n.dataset.lg); if(L)openLegal(L);});
el("lg-comp")&&(el("lg-comp").onchange=e=>{R.legalComp=e.target.value;render();});
el("lg-cat")&&(el("lg-cat").onchange=e=>{R.legalCat=e.target.value;render();});
document.querySelectorAll("[data-id]").forEach(n=>{ if(n.dataset.nolink)return; n.onclick=()=>{
const t=items.find(x=>x._id===n.dataset.id); if(t)open_(t);};});
document.querySelectorAll("[data-tx]").forEach(n=>n.onclick=()=>{
const t=ledger.find(x=>x._id===n.dataset.tx); if(t)openTx(t);});
const sc=el("sc1");
if(sc){sc.onclick=e=>{const b=e.target.closest("button[data-sc]");if(!b)return;R.scope=b.dataset.sc;render();};
el("scMonth")&&(el("scMonth").onchange=e=>{R.month=+e.target.value;render();});}
["yrSel","yrSel2","yrSelB"].forEach(id=>{const n=el(id); if(n)n.onchange=e=>{R.year=+e.target.value;R.selDay=null;render();};});
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
el("settabs")&&(el("settabs").onclick=e=>{const b=e.target.closest("button[data-st]");if(!b)return;settab=b.dataset.st;healthState="idle";render();});
const bind=(id,key)=>{const n=el(id);if(!n)return;n.oninput=n.onchange=()=>{
F[key]=n.value;const p=n.selectionStart,srch=n.type==="search";render();
const m=el(id);if(m&&srch){m.focus();m.setSelectionRange(p,p);}};};
bind("q","q");bind("fl-track","track");bind("fl-type","type");bind("fl-status","status");bind("fl-company","company");
el("modeseg")&&(el("modeseg").onclick=async e=>{
const b=e.target.closest("button[data-md]"); if(!b)return;
await setTheme({preset:theme.preset,custom:theme.custom,mode:b.dataset.md});});
document.querySelectorAll("[data-dsd]").forEach(b=>b.onclick=()=>openDsd(b.dataset.dsd));
["sub-pct","sub-rate"].forEach(id=>{const n=el(id); if(!n)return; n.onchange=async()=>{
hrdata.subsidy={pct:+el("sub-pct").value||70,rate:+el("sub-rate").value||200};
render(); await saveHR();};});
el("dsdAdd")&&(el("dsdAdd").onclick=async()=>{
const free=visible(companies).filter(c=>!isGroupCo(c)&&!dsdRec(c.key,R.year));
if(!free.length){tell("ทุกบริษัทมีข้อมูลปีนี้แล้วค่ะ<div style=\"font-size:13px;margin-top:8px\">ถ้าไม่เห็นบริษัทที่ต้องการ ให้ตรวจว่าตั้งเป็น “กลุ่มบริษัท” ไว้หรือเปล่า ที่ ตั้งค่า → บริษัท</div>");return;}
const ck=await askPick("เลือกนิติบุคคลที่ยื่นกรมพัฒนาฯ ในปี "+(R.year+543),
free.map(c=>`<option value="${esc(c.key)}">${esc(c.label)}</option>`).join(""),"เลือก");
if(ck)openDsd(ck);});
el("dsdCopy")&&(el("dsdCopy").onclick=async()=>{
const from=R.year-1, src=Object.keys(hrdata.dsd||{}).filter(k=>dsdRec(k,from));
if(!src.length){tell("ปี "+(from+543)+" ยังไม่มีข้อมูลให้คัดลอกค่ะ");return;}
if(!await ask(`คัดลอกโครง ${src.length} บริษัท จากปี ${from+543} มาปี ${R.year+543} (เอาเฉพาะเลขทะเบียน ไม่เอาตัวเลข) ใช่ไหมคะ?`,"คัดลอก"))return;
src.forEach(k=>{const r=dsdRec(k,from); hrdata.dsd[k]=hrdata.dsd[k]||{};
if(!hrdata.dsd[k][R.year])hrdata.dsd[k][R.year]={id:r.id||"",months:Array(12).fill(""),sent:0,repeatPersons:0,repeatTimes:0,passSkill:0,passStd:0};});
render(); await saveHR();});
document.querySelectorAll("[data-mp]").forEach(n=>n.onchange=async()=>{
const k=n.dataset.mp; hrdata.manpower[k]=hrdata.manpower[k]||{};
const v=+n.value||0; if(v)hrdata.manpower[k][R.year]=v; else delete hrdata.manpower[k][R.year];
render(); await saveHR();});
document.querySelectorAll("[data-cert]").forEach(n=>n.onchange=async()=>{
const k=n.dataset.cert; hrdata.certified[k]=hrdata.certified[k]||{};
if(n.value.trim()==="")delete hrdata.certified[k][R.year]; else hrdata.certified[k][R.year]=+n.value||0;
render(); await saveHR();});
document.querySelectorAll("[data-see]").forEach(b=>b.onclick=()=>{
const [k,v]=b.dataset.see.split(":");
F.q="";F.track="";F.type="";F.status="";F.company="";F[k]=v;
R.scope="year"; view="all"; renderNav(); render(); window.scrollTo(0,0);});
document.querySelectorAll("[data-move]").forEach(b=>b.onclick=async()=>{
const [k,v]=b.dataset.move.split(":");
const list=items.filter(t=>(t[k]||"")===v);
if(!list.length){tell("ไม่มีงานให้ย้ายค่ะ");return;}
const arr=k==="track"?visible(groups):visible(companies);
const opts=arr.filter(x=>x.key!==v).map(x=>`<option value="${esc(x.key)}">${esc(x.label)}</option>`).join("");
if(!opts){tell("ต้องมีปลายทางอย่างน้อย 1 รายการก่อนนะคะ");return;}
const name=k==="track"?gLabel(v):cLabel(v);
const to=await askPick(`ย้ายงานทั้งหมด <b>${list.length}</b> รายการ จาก “${esc(name)}” ไปที่`,opts,"ย้ายงาน");
if(!to)return;
let ok=0,fail=0,err=null;
setFoot("กำลังย้าย 0/"+list.length+" …");
for(const t of list){
try{ const {_id,...rest}=t; await saveItem(Object.assign({},rest,{[k]:to}),_id); ok++; }catch(e){ fail++; if(!err)err=e; }
setFoot("กำลังย้าย "+ok+"/"+list.length+" …");
}
render();
if(fail)tell("<b>ย้ายได้ "+ok+" รายการ · ไม่สำเร็จ "+fail+" รายการ</b>"+errBox(err));
else tell("<b>ย้ายเรียบร้อย "+ok+" รายการ</b><div style=\"font-size:13px;margin-top:8px\">ไปที่ “"+esc(k==="track"?gLabel(to):cLabel(to))+"” แล้วค่ะ</div>");
});
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
document.querySelectorAll("[data-parent]").forEach(n=>n.onchange=async()=>{
const c=companies.find(x=>x.key===n.dataset.parent); if(!c)return;
const v=n.value;
if(v==="__group__"){c.isGroup=true;delete c.parent;}
else{delete c.isGroup; if(v)c.parent=v; else delete c.parent;}
render(); await saveMeta("companies",companies);});
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
const dept=el("gldept").value.trim();
if(!label&&!code){tell("ใส่ชื่อหมวดหรือรหัส GL อย่างน้อยหนึ่งอย่างค่ะ");return;}
const key=code||label.slice(0,18);
if(gls.some(g=>g.key===key)){tell("มีหมวดนี้แล้วค่ะ");return;}
gls=[...gls,{key,code,dept,label:label||code,budget:0,budgets:b?{[(R.glYear||R.year)]:b}:{}}];
el("gldept").value=el("glcode").value=el("glname").value=el("glbud").value="";
render();await saveMeta("gl",gls);};
}
document.querySelectorAll("[data-glb]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.glb);if(!g)return;
setGlBudget(g,R.glYear||R.year,+n.value||0);await saveMeta("gl",gls);render();});
el("glYearSel")&&(el("glYearSel").onchange=e=>{R.glYear=+e.target.value;render();});
el("glCopy")&&(el("glCopy").onclick=async()=>{
const y=R.glYear||R.year, from=y-1;
const n=gls.filter(g=>glBudget(g,from)).length;
if(!n){tell("ปี "+(from+543)+" ยังไม่มีงบให้คัดลอกค่ะ");return;}
if(!await ask(`คัดลอกงบ <b>${n}</b> หมวด จากปี ${from+543} มาทับปี ${y+543} ใช่ไหมคะ?`,"คัดลอก"))return;
gls.forEach(g=>{const v=glBudget(g,from); if(v)setGlBudget(g,y,v);});
render(); await saveMeta("gl",gls);});
document.querySelectorAll("[data-reng]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.reng), v=n.value.trim();
if(!g||!v){render();return;} g.label=v; await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-rend]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.rend);if(!g)return;
g.dept=n.value.trim(); await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-renc2]").forEach(n=>n.onchange=async()=>{
const g=gls.find(x=>x.key===n.dataset.renc2);if(!g)return;
g.code=n.value.trim(); await saveMeta("gl",gls); render();});
document.querySelectorAll("[data-delgl]").forEach(b=>b.onclick=async()=>{
const k=b.dataset.delgl,n=ledger.filter(x=>x.gl===k).length;
if(n){tell("หมวดนี้มี <b>"+n+"</b> รายการเงินผูกอยู่ค่ะ ลบหรือย้ายรายการก่อนนะคะ");return;}
if(!await ask("ลบหมวด “"+esc(glLabel(k))+"” ใช่ไหมคะ?","ลบหมวด"))return;
gls=gls.filter(g=>g.key!==k);seedGL._done=true;render();await saveMeta("gl",gls);});
if(el("csvgo")){
el("csvgo").onclick=()=>importCSV(el("csvtext").value);
el("csvsample").onclick=()=>{el("csvtext").value=
"ชื่องาน,กลุ่ม,ประเภท,สถานะ,ผู้รับผิดชอบ,วันที่,บริษัท,หมวด GL,งบ,ใช้จริง,ผู้เข้าอบรม,ชั่วโมง,วิทยากร/สถาบัน,กรมพัฒฯ,รายละเอียด\nปฐมนิเทศพนักงานใหม่,อบรมภายใน,อบรม,กำลังดำเนินการ,วิม,2026-10-05,LeKise (LKL),781800000 ค่าฝึกอบรม,0,0,15,3,ฝ่าย HR,ไม่ต้องยื่น,ทุกต้นเดือน";};
el("csvfile").onchange=e=>{const f=e.target.files[0];if(!f)return;
const r=new FileReader();r.onload=()=>{el("csvtext").value=r.result;importCSV(r.result);};r.readAsText(f,"utf-8");};
}
el("expTasks")&&(el("expTasks").onclick=()=>exportCSV("skywork-tasks",
["ชื่องาน","กลุ่ม","ประเภท","สถานะ","ผู้รับผิดชอบ","วันที่","บริษัท","หมวด GL","งบ","หมวด GL รอง","งบรอง","ใช้จริง","เวลา","สถานที่","ผู้เข้าร่วม","เตรียมล่วงหน้า(วัน)","สิ่งที่ต้องเตรียม","ป้ายกำกับ","สี","ผู้เข้าอบรม","ชั่วโมง","ประเภทการอบรม","รูปแบบการอบรม","วิทยากร/สถาบัน","กรมพัฒฯ","รุ่นที่","วันที่ยื่นเปิดหลักสูตร","เลขคำขอเปิด","วันที่ยื่นรับรองรุ่น","เลขคำขอรับรอง","การเกิดซ้ำ","รายละเอียด"],
items.map(t=>[t.title,gLabel(t.track),t.type,t.status,t.owner,t.date||t.recurring,cLabel(t.company),
t.gl1?glLabel(glKeyOf(t.gl1)):"",+t.b1||"",t.gl2?glLabel(glKeyOf(t.gl2)):"",+t.b2||"",t.actual,t.time||"",t.place||"",t.attendees||"",t.prepDays||"",t.prepNote||"",t.tag||"",t.color||"",t.pax||"",t.hours||"",t.skill||"",t.mode||"",t.vendor||"",t.dsd||"",t.batch||"",t.dsdOpenDate||"",t.dsdOpenNo||"",t.dsdCertDate||"",t.dsdCertNo||"",rruleText(t),t.note])));
if(el("health")&&healthState!=="done")checkHealth();
el("selftest")&&(el("selftest").onclick=async()=>{
const out=el("csvout2"); out.innerHTML=`<div class="banner">กำลังทดสอบ…</div>`;
const id="selftest-"+Date.now();
const w=await SB.from("rows").upsert({id,uid,kind:"sys",data:{t:"selftest"},updated_at:new Date().toISOString()});
if(w.error){out.innerHTML=errBox(w.error);return;}
const rd=await SB.from("rows").select("id",{count:"exact",head:true}).eq("uid",uid);
await SB.from("rows").delete().eq("id",id).eq("uid",uid);
out.innerHTML=`<div class="banner ok">${svg(ICON.check,19)} เขียน อ่าน และลบข้อมูลได้ปกติ · ตอนนี้มี ${rd.count!=null?rd.count-1:"?"} แถวบนเซิร์ฟเวอร์</div>`;
});
el("icsgo")&&(el("icsgo").onclick=downloadICS);
const wipe=async(kind,label,arr)=>{
const out=el("wipeout");
if(!arr.length){ tell("ยังไม่มี"+label+"ให้ลบค่ะ"); return; }
const CODE="ลบ"+arr.length;
const ok=await askCode(`กำลังจะลบ <b>${label} ${arr.length} รายการ</b> ออกถาวร กู้คืนไม่ได้นะคะ<br><br>
ถ้าแน่ใจแล้ว พิมพ์ <b style="font-family:var(--mono);background:var(--over-soft);color:var(--over);padding:2px 9px;border-radius:8px">${CODE}</b> เพื่อยืนยัน`,CODE);
if(!ok)return;
out.innerHTML=`<div class="banner">กำลังลบ…</div>`;
const {error}=await SB.from("rows").delete().eq("uid",uid).eq("kind",kind);
if(error){ out.innerHTML=errBox(error); return; }
cache[kind].clear(); emit(kind); render();
tell(`<b>ลบ${label}เรียบร้อยแล้ว</b><div style="font-size:13.5px;margin-top:8px;line-height:1.7">ตอนนี้เหลือ 0 รายการ พร้อมนำเข้าข้อมูลชุดใหม่ที่ ตั้งค่า → นำเข้า CSV ค่ะ</div>`);
};
el("wipeTasks")&&(el("wipeTasks").onclick=()=>wipe("items","งาน",items));
el("wipeLedger")&&(el("wipeLedger").onclick=()=>wipe("ledger","รายการเงิน",ledger));
el("notifOn")&&(el("notifOn").onclick=async()=>{
const ok=await notifyToday(true);
if(!ok)tell("เบราว์เซอร์ไม่อนุญาตให้แจ้งเตือนค่ะ — เปิดสิทธิ์ที่รูปแม่กุญแจหน้าช่อง URL แล้วลองใหม่ หรือใช้วิธีซิงก์เข้า Google Calendar แทน");
render();});
el("preset")&&(el("preset").onclick=async()=>{
TRAIN_PRESET.forEach(x=>{ if(!groups.some(g=>g.label===x.label))groups.push({key:x.key,label:x.label}); });
render(); await saveMeta("groups",groups);});
el("signout")&&(el("signout").onclick=async()=>{if(await ask("ออกจากระบบเครื่องนี้ใช่ไหมคะ?","ออกจากระบบ"))signOut();});
el("expIdx")&&(el("expIdx").onclick=()=>exportCSV("skywork-index",
["สารบัญ","กลุ่มงาน","ผู้ดูแล","ลิงก์","สถานะ","รายละเอียดเอกสาร","หมายเหตุ"],
idx.map(x=>[x.title,x.group,x.owner,x.url,x.status,x.detail,x.note])));
el("expNote")&&(el("expNote").onclick=()=>exportCSV("skywork-notes",
["หัวข้อ","ประเภท","วันที่","ป้ายกำกับ","เนื้อหา"],
notes.map(n=>[n.title,n.kind,n.date,n.tag,n.body])));
el("expLegal")&&(el("expLegal").onclick=()=>exportCSV("skywork-legal",
["ชื่อรายการ","หมวด","ตำแหน่ง/หน่วยงาน","บริษัทที่ต้องมี","ผู้รับผิดชอบ","วันที่ออก","วันหมดอายุ","รอบทบทวน(เดือน)","ไม่มีวันหมดอายุ","เงื่อนไข/หมายเหตุ"],
legal.map(L=>[L.title,L.cat,L.unit,(L.comps||[]).map(cLabel).join(", "),L.person,L.issued,L.expires,L.cycle||"",L.lifetime?"TRUE":"",L.note])));
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
if(/ชื่อรายการ/.test(txt.split(/\r?\n/)[0]||""))return importLegal(txt,out);
if(/สารบัญ/.test(txt.split(/\r?\n/)[0]||""))return importIdx(txt,out);
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
const mkGL=raw=>{ raw=(raw||"").trim(); if(!raw)return "";
const m=raw.match(/^(\d{6,9})/); const code=m?m[1]:"";
const label=(raw.replace(/^\d{6,9}\s*[:.\-]?\s*/,"")||raw).trim();
let g=gls.find(x=>(code&&x.key===code)||x.label===label||(x.code&&x.code===code));
if(!g){ g={key:code||label.slice(0,18),code,label:label||code,budget:0,budgets:{}}; gls.push(g); newGL.push(g.label); }
return g.key; };
const gl2Key=mkGL(get(r,"หมวด GL รอง")||get(r,"งบก้อนรอง"));
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
company:c?c.key:"", gl1:glKey, b1:+get(r,"งบ")||0, gl2:gl2Key, b2:+get(r,"งบรอง")||0,
actual:+get(r,"ใช้จริง")||0, code:"", note:get(r,"รายละเอียด"), group:"",
rrule:parseRecur(get(r,"การเกิดซ้ำ")),
meet:/ประชุม/.test(get(r,"กลุ่ม")+get(r,"ประเภท")+title)||!!get(r,"เวลา"),
time:get(r,"เวลา"), place:get(r,"สถานที่"), attendees:get(r,"ผู้เข้าร่วม"),
prepDays:+get(r,"เตรียมล่วงหน้า(วัน)")||+get(r,"เตรียมล่วงหน้า")||0, prepNote:get(r,"สิ่งที่ต้องเตรียม"),
tag:get(r,"ป้ายกำกับ"), color:/^#[0-9a-fA-F]{6}$/.test(get(r,"สี"))?get(r,"สี"):"",
pax:+get(r,"ผู้เข้าอบรม")||0, hours:+get(r,"ชั่วโมง")||0,
vendor:get(r,"วิทยากร/สถาบัน")||get(r,"วิทยากร"), dsd:DSD.includes(get(r,"กรมพัฒฯ"))?get(r,"กรมพัฒฯ"):"",
skill:SKILLS.includes(get(r,"ประเภทการอบรม"))?get(r,"ประเภทการอบรม"):"",
mode:MODES.includes(get(r,"รูปแบบการอบรม"))?get(r,"รูปแบบการอบรม"):"",
batch:get(r,"รุ่นที่"), dsdOpenDate:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ยื่นเปิดหลักสูตร"))?get(r,"วันที่ยื่นเปิดหลักสูตร"):null,
dsdOpenNo:get(r,"เลขคำขอเปิด"), dsdCertDate:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ยื่นรับรองรุ่น"))?get(r,"วันที่ยื่นรับรองรุ่น"):null,
dsdCertNo:get(r,"เลขคำขอรับรอง"),
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
async function importIdx(txt,out){
imp={state:"run",ok:0,fail:0,total:0,msg:"",at:""}; paintImp();
const rows=parseCSV(txt); const head=rows[0].map(h=>h.replace(/\uFEFF/g,"").trim());
const gi=n=>head.indexOf(n), get=(r,n)=>{const i=gi(n);return i<0?"":String(r[i]==null?"":r[i]).trim();};
const body=rows.slice(1); let ok=0,fail=0,err=null; imp.total=body.length; paintImp();
for(const r of body){
const title=get(r,"สารบัญ")||get(r,"ชื่อระบบ"); if(!title)continue;
try{ await DB.collection("index").add({title,group:get(r,"กลุ่มงาน"),owner:get(r,"ผู้ดูแล")||get(r,"ผู้ดูแลเอกสาร / เว็บไซต์"),
url:get(r,"ลิงก์")||get(r,"URL"),status:IDXSTATUS.includes(get(r,"สถานะ"))?get(r,"สถานะ"):"ใช้งานอยู่",
detail:get(r,"รายละเอียดเอกสาร")||get(r,"รายละเอียด"),note:get(r,"หมายเหตุ")}); ok++; }
catch(e){ fail++; if(!err)err=e; }
imp.ok=ok; imp.fail=fail; paintImp(); }
const now=new Date();
imp.at=now.getDate()+" "+MTH[now.getMonth()]+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
imp.state=fail?"fail":"done"; imp.msg="Index Online"; paintImp();
out.innerHTML=fail?`<div class="banner bad">นำเข้าได้ ${ok} · ล้มเหลว ${fail}</div>`+errBox(err||{})
:`<div class="banner ok">${svg(ICON.check,19)} นำเข้า Index Online ${ok} รายการ — ดูที่เมนู “Index Online”</div>`;
if(!fail)el("csvtext").value=""; render();
}
async function importLegal(txt,out){
imp={state:"run",ok:0,fail:0,total:0,msg:"",at:""}; paintImp();
const rows=parseCSV(txt);
const head=rows[0].map(h=>h.replace(/\uFEFF/g,"").trim());
const idx=n=>head.indexOf(n), get=(r,n)=>{const i=idx(n);return i<0?"":String(r[i]==null?"":r[i]).trim();};
const body=rows.slice(1);
let ok=0,fail=0,err=null,newC=[];
imp.total=body.length; paintImp();
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v:null;
for(const r of body){
const title=get(r,"ชื่อรายการ"); if(!title)continue;
const comps=get(r,"บริษัทที่ต้องมี").split(/[,;|]/).map(x=>x.trim()).filter(Boolean).map(lab=>{
let c=companies.find(x=>x.label===lab||x.label.includes(lab));
if(!c){c={key:"c"+Date.now().toString(36)+ok+Math.floor(Math.random()*99),label:lab};companies.push(c);newC.push(lab);}
return c.key;});
const cat=LEGALCAT.includes(get(r,"หมวด"))?get(r,"หมวด"):LEGALCAT[0];
try{ await DB.collection("legal").add({title,cat,unit:get(r,"ตำแหน่ง/หน่วยงาน")||get(r,"หน่วยงาน"),
person:get(r,"ผู้รับผิดชอบ"),comps,issued:iso(get(r,"วันที่ออก")),expires:iso(get(r,"วันหมดอายุ")),
cycle:+get(r,"รอบทบทวน(เดือน)")||0,lifetime:/^(true|1|ใช่|ไม่มีกำหนด)$/i.test(get(r,"ไม่มีวันหมดอายุ")),
note:get(r,"เงื่อนไข/หมายเหตุ")||get(r,"หมายเหตุ")}); ok++; }
catch(e){ fail++; if(!err)err=e; }
imp.ok=ok; imp.fail=fail; paintImp();
}
try{ if(newC.length)await saveMeta("companies",companies); }catch(e){}
const now=new Date();
imp.at=now.getDate()+" "+MTH[now.getMonth()]+" "+String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
imp.state=fail?"fail":"done"; imp.msg="ทะเบียนกฎหมาย"; paintImp();
out.innerHTML=fail?`<div class="banner bad">นำเข้าได้ ${ok} · ล้มเหลว ${fail}</div>`+errBox(err||{})
:`<div class="banner ok">${svg(ICON.check,19)} นำเข้าทะเบียนกฎหมาย ${ok} รายการ${newC.length?" · สร้างบริษัทใหม่ "+esc(newC.join(", ")):""} — ดูที่เมนู “กฎหมาย”</div>`;
if(!fail)el("csvtext").value="";
render();
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
function syncStatusLabel(){
const lb=el("lbl-status"); if(!lb)return;
const on=el("f-freq")&&el("f-freq").value!=="none";
lb.innerHTML=on?'สถานะรวมของรายการ <span style="font-weight:400">— รอบแต่ละครั้งติ๊กที่ “ปิดงานรายรอบ” ด้านล่าง</span>':"สถานะ";
}
function syncFreq(){
const f=el("f-freq").value;
el("wrap-wd").hidden=!(f==="week"||f==="monthnth");
el("wrap-nth").hidden=(f!=="monthnth");
el("wrap-md").hidden=(f!=="monthday");
el("wrap-recur").hidden=(f!=="none");
const dl=el("f-date").parentElement.querySelector("label");
if(dl)dl.textContent=(f==="none")?"วันที่":"วันที่เริ่มต้น";
}
let formCtx="";
function open_(t){
editing=t;
formCtx = t ? (isTrain(t)?"train":isMeet(t)?"meet":"") : ((view==="train"||view==="dsd")?"train":view==="meet"?"meet":"");
el("dlgh").textContent=(t?"แก้ไข":"เพิ่ม")+(formCtx==="train"?"หลักสูตรอบรม":formCtx==="meet"?"การประชุม":(t?"งาน":"งานใหม่"));
el("lbl-title").textContent=formCtx==="train"?"ชื่อหลักสูตร":"ชื่องาน";
el("lbl-code").textContent=formCtx==="train"?"รหัสหลักสูตร":"รหัสอ้างอิง (ไม่บังคับ)";
el("f-code").placeholder=formCtx==="train"?"เช่น TRN-2026-014":"เช่น 1.0 หรือเลขที่เอกสาร";
el("wrap-flags").hidden=!!formCtx;
el("del").style.display=t?"":"none";
fill("f-company",[["","— ไม่ระบุ —"],...visible(companies).map(c=>[c.key,c.label])],t?.company||"");
fill("f-track",visible(groups).map(g=>[g.key,g.label]),t?.track||
(formCtx==="train"?(visible(groups).find(g=>/อบรม/.test(g.label))||{}).key:
 formCtx==="meet"?(visible(groups).find(g=>/ประจำเดือน|ประชุม/.test(g.label))||{}).key:"")||groups[0]?.key);
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
el("f-meet").checked=formCtx?formCtx==="meet":isMeet(t||{});
el("f-time").value=t?.time||""; el("f-place").value=t?.place||"";
el("f-att").value=t?.attendees||""; el("f-prepd").value=t?.prepDays||"";
el("f-prepn").value=t?.prepNote||"";
syncMeet();
el("f-train").checked=formCtx?formCtx==="train":isTrain(t||{});
el("f-tplace").value=t?.place||"";
fill("f-skill",[["","— ยังไม่ระบุ —"],...SKILLS.map(v=>[v,v])],t?.skill||(t?"":guessSkill({title:el("f-title").value,type:el("f-type").value,track:el("f-track").value})));
fill("f-mode",[["","— ยังไม่ระบุ —"],...MODES.map(v=>[v,v])],t?.mode||"");
el("f-batch").value=t?.batch||""; el("f-dsdopen").value=t?.dsdOpenDate||"";
el("f-dsdopenno").value=t?.dsdOpenNo||""; el("f-dsdcert").value=t?.dsdCertDate||"";
el("f-dsdcertno").value=t?.dsdCertNo||"";
el("f-pax").value=t?.pax||""; el("f-hours").value=t?.hours||"";
el("f-vendor").value=t?.vendor||"";
fill("f-dsd",[["","— ไม่ระบุ —"],...DSD.map(x=>[x,x])],t?.dsd||"");
syncTrain();
el("f-b1").value=t?.b1||""; el("f-b2").value=t?.b2||"";
el("f-actual").value=t?.actual||""; el("f-code").value=t?.code||"";
el("f-note").value=t?.note||"";
el("f-tag").value=t?.tag||"";
el("taglist").innerHTML=tagsOf().map(x=>`<option value="${esc(x)}">`).join("");
el("f-colors").innerHTML=[["","ตามสถานะ"],...TAGCOLORS.map(c=>[c,c])].map(([c,lab])=>
`<button type="button" class="sw1${(t?.color||"")===c?" on":""}" data-color="${c}" title="${c?c:"ใช้สีตามสถานะงาน"}"
style="${c?`background:${c}`:"background:var(--line-2)"}">${c?"":"—"}</button>`).join("");
el("f-colors").querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{
el("f-colors").querySelectorAll("[data-color]").forEach(x=>x.classList.remove("on"));
b.classList.add("on"); el("f-colors").dataset.val=b.dataset.color;});
el("f-colors").dataset.val=t?.color||"";
const ms=t?.months||[];
paintOccs(t); syncStatusLabel();
el("f-months").innerHTML=MTH.map((m,i)=>`<label><input type="checkbox" value="${i+1}"${ms.includes(i+1)?" checked":""}>${m}</label>`).join("");
el("dlg").showModal();
}
function paintOccs(t){
const wrap=el("wrap-occ");
const R2=(t&&rr(t))||null;
const f=el("f-freq")?el("f-freq").value:"none";
if(!t||!R2||f==="none"){ wrap.hidden=true; el("f-occs").innerHTML=""; return; }
wrap.hidden=false;
const today=new Date(); today.setHours(0,0,0,0);
const st=t.date?new Date(t.date):today;
const from=new Date(Math.min(st.getTime(),today.getTime()));
const all=occList(t,new Date(from.getFullYear(),from.getMonth()-2,1),16);
const past=all.filter(d=>d<=today).slice(-5), fut=all.filter(d=>d>today).slice(0,4);
const show=[...past,...fut];
el("f-occs").innerHTML=show.map(d=>{const iso=isoOf(d),dn=occDone(t,iso?new Date(iso):d);
return `<label class="occ${d<=today?"":" fut"}"><input type="checkbox" class="oc" value="${iso}"${occDone(t,d)?" checked":""}>
<span>${d.getDate()} ${MTH[d.getMonth()]} ${d.getFullYear()+543-2500}</span>
<i>${d<today?"ผ่านมาแล้ว":d.getTime()===today.getTime()?"วันนี้":"ยังไม่ถึง"}</i></label>`;}).join("")
||`<div class="hint" style="margin:0">ยังไม่มีรอบให้แสดง</div>`;
}
function syncMeet(){ el("wrap-meet").hidden=!el("f-meet").checked; }
el("f-meet").onchange=syncMeet;
function syncTrain(){ el("wrap-train").hidden=!el("f-train").checked; }
el("f-train").onchange=syncTrain;
el("f-track").addEventListener("change",()=>{ const g=groups.find(x=>x.key===el("f-track").value);
if(g&&/อบรม/.test(g.label)&&!el("f-train").checked){ el("f-train").checked=true; syncTrain(); } });
el("f-freq").onchange=()=>{syncFreq();paintOccs(editing);syncStatusLabel();};
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
meet:el("f-meet").checked, time:hhmm(el("f-time").value),
place:(el("f-train").checked&&!el("f-meet").checked)?el("f-tplace").value.trim():el("f-place").value.trim(),
attendees:el("f-att").value.trim(), prepDays:+el("f-prepd").value||0, prepNote:el("f-prepn").value.trim(),
train:el("f-train").checked, pax:+el("f-pax").value||0, hours:+el("f-hours").value||0,
vendor:el("f-vendor").value.trim(), dsd:el("f-dsd").value,
skill:el("f-skill").value, mode:el("f-mode").value, batch:el("f-batch").value.trim(), dsdOpenDate:el("f-dsdopen").value||null, dsdOpenNo:el("f-dsdopenno").value.trim(),
dsdCertDate:el("f-dsdcert").value||null, dsdCertNo:el("f-dsdcertno").value.trim(),
note:el("f-note").value.trim(), group:editing?.group||"",
tag:el("f-tag").value.trim(), color:el("f-colors").dataset.val||"",
months:[...el("f-months").querySelectorAll("input:checked")].map(i=>+i.value),
done:(()=>{const box=el("f-occs"); if(el("wrap-occ").hidden)return editing?.done||[];
const shown=[...box.querySelectorAll(".oc")].map(i=>i.value);
const keep=(editing?.done||[]).filter(v=>!shown.includes(v));
return [...keep,...[...box.querySelectorAll(".oc:checked")].map(i=>i.value)];})()
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
let editingIdx=null, editingNote=null;
function openIdx(x){
editingIdx=x;
el("idlgh").textContent=x?"แก้ไขรายการ Index":"เพิ่มรายการ Index";
el("idel").style.display=x?"":"none";
el("i-title").value=x?.title||""; el("i-group").value=x?.group||"";
el("i-owner").value=x?.owner||""; el("i-url").value=x?.url||"";
fill("i-status",IDXSTATUS.map(v=>[v,v]),x?.status||"ใช้งานอยู่");
el("i-detail").value=x?.detail||""; el("i-note").value=x?.note||"";
el("ixgroups").innerHTML=[...new Set(idx.map(v=>(v.group||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("ixowners").innerHTML=[...new Set(idx.map(v=>(v.owner||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("idlg").showModal();
}
el("icancel").onclick=()=>el("idlg").close();
el("isave").onclick=async()=>{
if(!el("i-title").value.trim()){el("i-title").focus();return;}
const d={title:el("i-title").value.trim(),group:el("i-group").value.trim(),owner:el("i-owner").value.trim(),
url:el("i-url").value.trim(),status:el("i-status").value,detail:el("i-detail").value.trim(),note:el("i-note").value.trim()};
el("idlg").close();
try{ editingIdx? await DB.collection("index").doc(editingIdx._id).set(d) : await DB.collection("index").add(d); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
};
el("idel").onclick=async()=>{ if(!editingIdx)return; const x=editingIdx; el("idlg").close();
if(!await ask("ลบ “"+esc(x.title)+"” ใช่ไหมคะ?","ลบรายการ"))return;
await DB.collection("index").doc(x._id).delete();};
function openNote(n){
editingNote=n;
el("ndlgh").textContent=n?"แก้ไขบันทึก":"เขียนบันทึกใหม่";
el("ndel").style.display=n?"":"none";
el("n-title").value=n?.title||"";
fill("n-kind",NOTEKIND.map(v=>[v,v]),n?.kind||"บันทึกการประชุม");
el("n-date").value=n?.date||new Date().toISOString().slice(0,10);
el("n-tag").value=n?.tag||""; el("n-body").value=n?.body||"";
el("n-pin").checked=!!n?.pin;
el("n-colors").innerHTML=[["","ค่าเริ่มต้น"],...TAGCOLORS.map(c=>[c,c])].map(([c])=>
`<button type="button" class="sw1${(n?.color||"")===c?" on":""}" data-ncolor="${c}" style="${c?`background:${c}`:"background:var(--line-2)"}">${c?"":"—"}</button>`).join("");
el("n-colors").querySelectorAll("[data-ncolor]").forEach(b=>b.onclick=()=>{
el("n-colors").querySelectorAll("[data-ncolor]").forEach(x=>x.classList.remove("on"));
b.classList.add("on"); el("n-colors").dataset.val=b.dataset.ncolor;});
el("n-colors").dataset.val=n?.color||"";
el("ntaglist").innerHTML=[...new Set(notes.map(v=>(v.tag||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("ndlg").showModal();
}
el("ncancel").onclick=()=>el("ndlg").close();
el("nsave").onclick=async()=>{
const d={title:el("n-title").value.trim(),kind:el("n-kind").value,date:el("n-date").value||null,
tag:el("n-tag").value.trim(),body:el("n-body").value,color:el("n-colors").dataset.val||"",pin:el("n-pin").checked};
if(!d.title&&!d.body.trim()){el("n-title").focus();return;}
el("ndlg").close();
try{ editingNote? await DB.collection("note").doc(editingNote._id).set(d) : await DB.collection("note").add(d); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
};
el("ndel").onclick=async()=>{ if(!editingNote)return; const n=editingNote; el("ndlg").close();
if(!await ask("ลบบันทึกนี้ใช่ไหมคะ?","ลบบันทึก"))return;
await DB.collection("note").doc(n._id).delete();};
let editingDsd=null;
function openDsd(ck){
const y=R.year, c=companies.find(x=>x.key===ck); if(!c)return;
const r=dsdRec(ck,y)||{id:"",months:Array(12).fill(""),sent:0,repeatPersons:0,repeatTimes:0,passSkill:0,passStd:0};
editingDsd={ck,y};
el("ddlgh").textContent="กรมพัฒนาฯ · "+c.label+" · ปี "+(y+543);
el("d-id").value=r.id||"";
el("d-months").innerHTML=MTH.map((m,i)=>`<label class="mcell"><span>${m}</span><input type="number" min="0" class="dm" value="${(r.months&&r.months[i]!=null&&r.months[i]!=="")?r.months[i]:""}" placeholder="—"></label>`).join("");
el("d-goal").value=(+r.goal&&+r.goal>LAWPCT)?r.goal:"";
el("d-sent").value=r.sent||""; el("d-rp").value=r.repeatPersons||""; el("d-rt").value=r.repeatTimes||"";
el("d-ps").value=r.passSkill||""; el("d-pd").value=r.passStd||"";
el("d-std").value=r.stdPass||""; el("d-fund").value=r.fundPaid||"";
const auto=trainedPax(ck,y);
el("d-hint").innerHTML=`ระบบนับผู้เข้าอบรมจากหลักสูตรที่ปิดงานแล้วในปีนี้ได้ <b>${auto}</b> คน — ใช้เทียบได้ แต่เลข A ให้ยึดตามหน้าเว็บกรมฯ`;
el("ddel").style.display=dsdRec(ck,y)?"":"none";
paintDsd();
el("ddlg").showModal();
}
function paintDsd(){
const ms=[...el("d-months").querySelectorAll(".dm")].map(i=>+i.value||0);
const k=dsdCalc({months:ms,sent:+el("d-sent").value||0,repeatTimes:+el("d-rt").value||0,goal:+el("d-goal").value||0,stdPass:+el("d-std").value||0,fundPaid:+el("d-fund").value||0});
el("d-calc").innerHTML=`<div class="dcalc">
<div><span>พนักงานเฉลี่ย</span><b>${k.avg?baht(k.avg):"—"}</b></div>
<div><span>เกณฑ์ ${LAWPCT}%</span><b>${k.target?baht(k.target):"—"}</b></div>
${k.goal>LAWPCT?`<div><span>เป้าเรา ${k.goal}%</span><b style="color:var(--accent)">${k.goalTarget?baht(k.goalTarget):"—"}</b></div>`:""}
<div><span>C = A − B</span><b>${baht(k.C)}</b></div>
<div><span>คิดเป็น %</span><b style="color:${k.avg?(k.pct>=50?"var(--ok)":"var(--over)"):"inherit"}">${k.avg?k.pct+"%":"—"}</b></div>
<div><span>ต้องฝึกอีก</span><b style="color:${k.need?"var(--over)":"var(--ok)"}">${k.avg?(k.need?baht(k.need)+" คน":"ครบแล้ว"):"—"}</b></div>
${k.goal>LAWPCT?`<div><span>ถึงเป้าเรา</span><b style="color:${k.needGoal?"var(--accent)":"var(--ok)"}">${k.avg?(k.needGoal?"อีก "+baht(k.needGoal)+" คน":"ถึงแล้ว"):"—"}</b></div>`:""}
<div><span>เงินอุดหนุน (เกิน ${subPct()}%)</span><b style="color:${k.sub.amount?"var(--ok)":"var(--ink-3)"}">${k.avg?(k.sub.amount?baht(k.sub.amount)+" ฿":"ยังไม่ถึงเกณฑ์"):"—"}</b></div>
<div><span>ทดสอบมาตรฐาน</span><b style="color:${k.sub.stdAmt?"var(--ok)":"var(--ink-3)"}">${k.sub.stdAmt?baht(k.sub.stdAmt)+" ฿":"—"}</b></div>
<div><span>คืนเงินสมทบ 10%</span><b style="color:${k.sub.fundAmt?"var(--ok)":"var(--ink-3)"}">${k.sub.fundAmt?baht(k.sub.fundAmt)+" ฿":"—"}</b></div>
<div><span>รวมคาดว่าได้คืน</span><b style="color:${k.sub.total?"var(--ok)":"var(--ink-3)"}">${k.sub.total?baht(k.sub.total)+" ฿":"—"}</b></div></div>`;
}
el("ddlg").addEventListener("input",e=>{ if(e.target.closest("#ddlg"))paintDsd(); });
el("dcancel").onclick=()=>el("ddlg").close();
el("dsave").onclick=async()=>{
if(!editingDsd)return;
const {ck,y}=editingDsd;
const months=[...el("d-months").querySelectorAll(".dm")].map(i=>i.value===""?"":(+i.value||0));
hrdata.dsd=hrdata.dsd||{}; hrdata.dsd[ck]=hrdata.dsd[ck]||{};
hrdata.dsd[ck][y]={updatedAt:new Date().toISOString(),id:el("d-id").value.trim(),months,goal:+el("d-goal").value||0,
sent:+el("d-sent").value||0,repeatPersons:+el("d-rp").value||0,repeatTimes:+el("d-rt").value||0,
passSkill:+el("d-ps").value||0,passStd:+el("d-pd").value||0,
stdPass:+el("d-std").value||0,fundPaid:+el("d-fund").value||0};
el("ddlg").close(); render(); await saveHR();
};
el("ddel").onclick=async()=>{
if(!editingDsd)return; const {ck,y}=editingDsd; el("ddlg").close();
if(!await ask("ลบข้อมูลกรมพัฒนาฯ ของบริษัทนี้ในปี "+(y+543)+" ใช่ไหมคะ?","ลบข้อมูล"))return;
if(hrdata.dsd&&hrdata.dsd[ck])delete hrdata.dsd[ck][y];
render(); await saveHR();
};
let editingLegal=null;
function openLegal(L){
editingLegal=L;
el("ldlgh").textContent=L?"แก้ไขรายการกฎหมาย":"เพิ่มรายการกฎหมาย";
el("ldel").style.display=L?"":"none";
el("l-title").value=L?.title||"";
fill("l-cat",LEGALCAT.map(x=>[x,x]),L?.cat||LEGALCAT[0]);
el("l-unit").value=L?.unit||"";
el("l-person").value=L?.person||"";
el("l-comps").innerHTML=visible(companies).map(c=>`<label class="flag" style="padding:8px 12px"><input type="checkbox" value="${esc(c.key)}"${(L?.comps||[]).includes(c.key)?" checked":""}><span style="font-size:13.5px">${esc(c.label)}</span></label>`).join("")||`<div class="hint" style="margin:0">ยังไม่มีบริษัท เพิ่มที่หน้าตั้งค่า</div>`;
el("l-issued").value=L?.issued||"";
el("l-expires").value=L?.expires||"";
fill("l-cycle",CYCLES,String(L?.cycle||""));
el("l-life").checked=!!L?.lifetime;
el("l-note").value=L?.note||"";
el("ldlg").showModal();
}
el("lcancel").onclick=()=>el("ldlg").close();
el("lsave").onclick=async()=>{
if(!el("l-title").value.trim()){el("l-title").focus();return;}
const data={title:el("l-title").value.trim(), cat:el("l-cat").value, unit:el("l-unit").value.trim(),
person:el("l-person").value.trim(),
comps:[...el("l-comps").querySelectorAll("input:checked")].map(i=>i.value),
issued:el("l-issued").value||null, expires:el("l-expires").value||null,
cycle:+el("l-cycle").value||0, lifetime:el("l-life").checked, note:el("l-note").value.trim()};
el("ldlg").close();
try{ editingLegal? await DB.collection("legal").doc(editingLegal._id).set(data) : await DB.collection("legal").add(data); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?'<div style="font-size:13px;margin-top:8px;line-height:1.7">'+x.fix+"</div>":"")); }
};
el("ldel").onclick=async()=>{
if(!editingLegal)return; const L=editingLegal; el("ldlg").close();
if(!await ask("ลบรายการ “"+esc(L.title)+"” ใช่ไหมคะ?","ลบรายการ"))return;
await DB.collection("legal").doc(L._id).delete();
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
