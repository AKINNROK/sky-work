// ===== Tooltip กลาง: ใส่ data-tip="บรรทัด1\nบรรทัด2" ที่ element ไหนก็ได้ (รวมถึงกราฟ SVG) =====
// บรรทัดแรก = หัวข้อ (ตัวหนา) · บรรทัดที่ขึ้นต้นด้วย "• " = รายการย่อย · บรรทัด "ชื่อ|ค่า" = แถวตัวเลข
function tipAttr(...lines){
const s=lines.flat(Infinity).filter(x=>x!==undefined&&x!==null&&x!==""&&x!==false).join("\n");
return s?` data-tip="${String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}"`:"";
}
// รายการย่อยสำหรับ tooltip: โชว์สูงสุด max รายการ แล้วสรุป "และอีก N"
function tipList(arr,f,max){
max=max||8; f=f||(t=>t.title||"");
const a=(arr||[]).slice(0,max).map(x=>"• "+f(x));
if((arr||[]).length>max)a.push("…และอีก "+(arr.length-max)+" รายการ");
return a;
}
let _tipEl=null, _tipFor=null, _touchAt=0;
function tipBox(){ if(!_tipEl){ _tipEl=document.createElement("div"); _tipEl.id="tip"; _tipEl.setAttribute("role","tooltip"); _tipEl.hidden=true; document.body.appendChild(_tipEl);} return _tipEl; }
function tipHide(){ if(_tipEl)_tipEl.hidden=true; _tipFor=null; }
function tipShow(target,x,y){
const raw=target.getAttribute("data-tip"); if(!raw)return;
const b=tipBox();
if(_tipFor!==target){
_tipFor=target; b.textContent="";
raw.split("\n").forEach((ln,i)=>{
const d=document.createElement("div");
if(i===0){ d.className="th"; d.textContent=ln; }
else if(ln.startsWith("• ")){ d.className="tl"; d.textContent=ln.slice(2); }
else if(ln.includes("|")&&!ln.startsWith("…")){ const k=ln.indexOf("|"); d.className="tr"; const a=document.createElement("span"); a.textContent=ln.slice(0,k); const v=document.createElement("b"); v.textContent=ln.slice(k+1); d.append(a,v); }
else { d.className="tn"; d.textContent=ln; }
b.appendChild(d); });
}
b.hidden=false;
const r=b.getBoundingClientRect(), W=innerWidth, H=innerHeight;
let L=x+14, T=y+16;
if(L+r.width>W-8)L=Math.max(8,x-r.width-14);
if(T+r.height>H-8)T=Math.max(8,y-r.height-14);
b.style.left=L+"px"; b.style.top=T+"px";
}
function tipAnchor(t){ const r=t.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }
document.addEventListener("mouseover",e=>{ if(Date.now()-_touchAt<900)return; const t=e.target.closest&&e.target.closest("[data-tip]"); if(t)tipShow(t,e.clientX,e.clientY); else tipHide(); });
document.addEventListener("mousemove",e=>{ if(Date.now()-_touchAt<900)return; if(!_tipFor||!_tipEl||_tipEl.hidden)return; const t=e.target.closest&&e.target.closest("[data-tip]"); if(t&&t===_tipFor)tipShow(t,e.clientX,e.clientY); });
document.addEventListener("mouseout",e=>{ if(Date.now()-_touchAt<900)return; if(!e.relatedTarget)tipHide(); });
document.addEventListener("focusin",e=>{ const t=e.target.closest&&e.target.closest("[data-tip]"); if(t){ const [x,y]=tipAnchor(t); tipShow(t,x,y); } });
document.addEventListener("focusout",()=>tipHide());
// มือถือ/ทัช: แตะที่กราฟเพื่อดู แตะที่อื่นเพื่อปิด
document.addEventListener("touchstart",e=>{ _touchAt=Date.now(); const t=e.target.closest&&e.target.closest("[data-tip]"); if(t){ const p=e.touches[0]; if(_tipFor===t){tipHide();} else tipShow(t,p.clientX,p.clientY); } else tipHide(); },{passive:true});
window.addEventListener("scroll",tipHide,{passive:true});
document.addEventListener("keydown",e=>{ if(e.key==="Escape")tipHide(); });
const APP_VERSION="14.14.27"; const APP_DATE="30 ต.ค. 2026";
const MTH=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MTHFULL=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DOW=["อา","จ","อ","พ","พฤ","ศ","ส"];
const STATUS=["รอดำเนินการ","กำลังดำเนินการ","เสร็จสิ้น","ยกเลิก"];
// "อยู่ระหว่างดำเนินการ" (ของเดิม) = "กำลังดำเนินการ" — รวมเป็นอันเดียวตอนโหลดข้อมูล
const normSt=s=>s==="อยู่ระหว่างดำเนินการ"?"กำลังดำเนินการ":s;
const STATUS_DONE="เสร็จสิ้น", STATUS_CANCEL="ยกเลิก";
const isOpenStatus=x=>x!==STATUS_DONE&&x!==STATUS_CANCEL;
const TAGCOLORS=[
"#9e1f52","#d92662","#e08a86","#d40000","#f2542d","#ef7d1a","#f28c00","#f5b921",
"#dcc63a","#c3d33f","#8fbf3f","#1a7a3c","#35c491",
"#12a08a","#159ee8","#3d86d6","#7f8fd0","#3b49b5","#b3a9ea","#9d6fc4","#9412c4",
"#8a6a55","#5b5b5b","#b3a99a","#6b7785","#d6549b"];
const tagDefs=()=>{
const base=(tagList||[]).map(x=>typeof x==="string"?{name:x,color:"",track:""}:{name:x.name,color:x.color||"",track:x.track||""}).filter(x=>x.name);
const extra=[...new Set(items.map(t=>(t.tag||"").trim()).filter(Boolean))].filter(n=>!base.some(b=>b.name===n)).sort()
.map(name=>({name,color:(items.find(x=>(x.tag||"").trim()===name&&x.color)||{}).color||""}));
return [...base,...extra];};
const tagsOf=()=>tagDefs().map(x=>x.name);
const tagColor=name=>{const d=tagDefs().find(x=>x.name===name);
const g=d&&groups.find(x=>x.key===d.track); return (g&&g.color)||"";};
const tagTrack=name=>{const d=tagDefs().find(x=>x.name===name);return d?d.track:"";};
const tagsFor=tr=>tagDefs().filter(x=>!x.track||x.track===tr).map(x=>x.name);
const tagUsed=name=>items.filter(t=>(t.tag||"").trim()===name).length;
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
// หมวดทักษะ + รูปแบบการอบรม — ค่าตั้งต้น แก้/เพิ่ม/ลบได้ในตั้งค่า › หลักสูตรอบรม
const SKILLS_BASE=["Soft Skill","Hard Skill","Safety"];
const MODES_BASE=["In-House","Public","OJT","Online","สัมมนา","อื่นๆ"];
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
gaps:'<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
matrix:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
home:'<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',
all:'<path d="M4 7h16M4 12h16M4 17h10"/>',
cal:'<rect x="3.5" y="5" width="17" height="15" rx="4.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
exec:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
ai:'<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
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
const VIEWS=[["cal","ปฏิทิน"],["home","ภาพรวม"],["all","งานทั้งหมด"],["matrix","Matrix งาน"],["gaps","งานค้างข้อมูล"],["budget","งบประมาณ"],["exec","รายงานผู้บริหาร"],["meet","การประชุม"],["train","ฝึกอบรม"],["dsd","กรมพัฒนาฯ"],["legal","กฎหมาย"],["idx","Index Online"],["note","บันทึก & ไอเดีย"],["ai","ผู้ช่วย AI"],["set","ตั้งค่า"]];
const TABS=["cal","home","all","matrix","gaps","budget","exec","meet","train","dsd","legal","idx","note","ai","set"];
const TABLABEL={gaps:"ค้างข้อมูล",home:"ภาพรวม",all:"งาน",meet:"ประชุม",train:"อบรม",dsd:"กรมพัฒฯ",legal:"กฎหมาย",idx:"Index",note:"บันทึก",cal:"ปฏิทิน",matrix:"Matrix",budget:"งบ",exec:"ผู้บริหาร",ai:"AI",set:"ตั้งค่า"};
const SETTABS=[["companies","บริษัท"],["groups","กลุ่มงาน"],["types","ประเภทงาน"],["courses","หลักสูตรอบรม"],["gl","หมวด GL"],["theme","ธีมสี"],["remind","เตือน & ปฏิทิน"],["import","นำเข้า CSV"],["trash","ถังขยะ"],["connect","การเชื่อมต่อ"]];
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
// หน้าที่ของแต่ละช่องในจานผสมสี [ชื่อสั้น, คำอธิบายใต้ช่อง, คำอธิบายเต็ม]
const MIXROLE=[
["อ่อนสุด","พื้นหลัง","<b>พื้นหลังของหน้า</b> · พื้นช่องกรอก · เส้นคั่นตาราง — ควรอ่อนมากเกือบขาว ถ้าเข้มไปจะแสบตา"],
["อ่อน","พื้นป้าย","<b>พื้นของป้ายกำกับและแถบไฮไลต์</b> (เช่น พื้นหลังเดือนปัจจุบันในปฏิทิน) — อ่อนแต่พอเห็นว่าต่างจากพื้นหลัง"],
["กลาง","ตัวหนังสือรอง","<b>ตัวหนังสือรองและคำอธิบาย</b> (สีเทาๆ ใต้หัวข้อ) · จุดสีเล็กๆ — ต้องไม่อ่อนจนอ่านไม่ออก"],
["เข้ม","เส้นขอบ/สีรอง","<b>เส้นขอบตอนคลิกช่องกรอก</b> · สีรองในไล่เฉดของปุ่มและกราฟ — เป็นตัวเชื่อมระหว่างอ่อนกับเข้มสุด"],
["เข้มสุด","ตัวหนังสือหลัก","<b>ตัวหนังสือหลัก</b> · <b>ปุ่มหลัก ลิงก์ และเมนูที่ถูกเลือก</b> — ตัวนี้กำหนดบุคลิกของทั้งระบบ ควรเข้มพอให้อ่านบนพื้นขาวสบายตา"]];
function applyTheme(){
const p=PALETTES.find(x=>x.key===theme.preset)||PALETTES[0];
const c=(theme.preset==="custom"&&theme.custom&&theme.custom.length===5)?theme.custom:p.ramp;
const [c1,c2,c3,c4,c5]=c, s=document.documentElement.style, set=(k,v)=>s.setProperty(k,v);
const night=isNight();
document.documentElement.setAttribute("data-night",night?"1":"0");
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
if(curHL()==="p"){
 // สไตล์พาสเทล: ค่าเริ่มต้น (เมฆกลางคืน) คงโทนครีมเดิม · ชุดสีอื่นผสมโทนของชุดนั้นเข้าไปทั้งพื้น การ์ด ปุ่ม และเมนู
 const w=theme.preset==="cumulus"?0:.6, T=b=>mix(b,c2,w), P=mix(c2,"#ffffff",.38);
 set("--paper",mix("#F6F4EE",mix(c1,"#ffffff",.55),w)); set("--card","#ffffff");
 set("--line",mix("#E9E5DA",c1,w*.9)); set("--line-2",mix("#F2EFE7",c1,w*.7)); set("--line-3",mix("#EDEAE2",c1,w*.8));
 set("--ink",mix("#22262b",c5,w*.45)); set("--ink-2",mix("#5d6570",c5,w*.4)); set("--ink-3",mix("#69717c",c5,w*.3));
 set("--accent-soft",mix("#F0EDE4",c2,w*.8)); set("--seg-bg",mix("#EEEBE2",c1,w*.7));
 set("--pa-s",w?P:"#D9ECF8"); set("--pa-y",T("#FFEFC2")); set("--pa-p",T("#FADCE1")); set("--pa-m",T("#DAF0E2")); set("--pa-o",T("#FDE4D0")); set("--pa-l",T("#E6E0F7"));
 set("--dk",w?mix(c5,"#14181d",.4):"#23272c"); set("--dk-h",w?mix(c5,"#14181d",.15):"#3b4148");
}
set("--ok","#1a9f86"); set("--ok-soft","#dff4ef");
set("--run","#e0932b"); set("--run-soft","#fcefdb");
set("--wait","#8fa3ba"); set("--wait-soft","#e9eff5");
set("--over","#e0606d"); set("--over-soft","#fbe5e8");
document.documentElement.style.colorScheme="light";
}
try{ const vars={}; for(let i=0;i<s.length;i++){const n=s[i]; if(n.startsWith("--")&&n!=="--zf")vars[n]=s.getPropertyValue(n);}
localStorage.setItem("sw-vars",JSON.stringify({vars,cs:s.colorScheme,mode:theme.mode||"auto",night})); }catch(e){}
}
setInterval(()=>{ if(theme.mode==="auto"){ const n=isNight(); if(n!==applyTheme._last){ applyTheme._last=n; applyTheme(); } } },60000);
let LOADING=true;
let DB=null, items=[], ledger=[], view="home", settab="companies", editing=null, editingTx=null;
let groups=DEFAULT_GROUPS.slice(), companies=DEFAULT_COMPANIES.slice(), gls=[];
let typeList=[], tagList=[], courses=[], skillList=[], modeList=[];
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
if(R2&&occSkip(t,d))return false;
if(R2&&R2.until&&isoOf(d)>R2.until)return false;
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
var INKDEF={};
let R={pq:"", calGroup:"track", year:THISYEAR, scope:"year", month:new Date().getMonth(), selDay:null, calMode:"month", budScope:"year", budMonth:new Date().getMonth()};
const F={q:"",track:"",type:"",status:"",company:"",grp:"time"};
const el=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const baht=n=>(+n||0).toLocaleString("th-TH",{maximumFractionDigits:0});
const kbaht=n=>n>=1000000?(n/1000000).toFixed(1)+"ล.":n>=1000?Math.round(n/1000)+"พ.":String(Math.round(n));
const budgetOf=t=>(+t.b1||0)+(+t.b2||0);
// GL ที่งานนี้ผูกไว้ ไม่สนว่าหลักหรือรอง — ช่องไหนที่เลือกไว้ถือว่าใช้ได้หมด
const glKeysOf=t=>[glKeyOf(t.gl1)||"",glKeyOf(t.gl2)||""].filter(Boolean);
const hasGL=t=>glKeysOf(t).length>0;
// งบของงานที่ตกเข้าหมวด k (ช่องที่ไม่ได้เลือก GL จะไปรวมกับช่องที่เลือกไว้)
function glShare(t,k){
const k1=glKeyOf(t.gl1)||"", k2=glKeyOf(t.gl2)||"";
const b1=+t.b1||0, b2=+t.b2||0;
let v=0;
if((k1||k2)===k)v+=b1;
if((k2||k1)===k)v+=b2;
return v;}
const sCls=x=>x==="เสร็จสิ้น"?"s-done":x==="ยกเลิก"?"s-cancel":x==="กำลังดำเนินการ"?"s-run":x==="อยู่ระหว่างดำเนินการ"?"s-mid":"s-wait";
const sColor=x=>x==="เสร็จสิ้น"?"var(--ok)":x==="ยกเลิก"?"var(--ink-3)":x==="กำลังดำเนินการ"?"var(--run)":x==="อยู่ระหว่างดำเนินการ"?"var(--sky)":"var(--wait)";
const visible=a=>a.filter(x=>!x.hidden);
const G_AUTO=["#3d86d6","#12a08a","#ef7d1a","#9d6fc4","#d6549b","#8fbf3f","#e0606d","#2bb3c9","#b3a99a","#7f8fd0"];
const gTagColor=k=>{const g=groups.find(x=>x.key===k); if(g&&g.color)return g.color; const i=groups.findIndex(x=>x.key===k); return i<0?"var(--wait)":G_AUTO[i%G_AUTO.length];};
const gChip=k=>{const c=gTagColor(k); return `<span class="tag gtag" style="background:color-mix(in srgb,${c} 16%,transparent)"><i style="background:${c}"></i>${esc(gLabel(k))}</span>`;};
const gLabel=k=>(groups.find(g=>g.key===k)||{}).label||k||"ไม่ระบุกลุ่ม";
const isGroupCo=c=>!!(c&&c.isGroup);
const realCos=()=>visible(companies).filter(c=>!isGroupCo(c));
const groupCos=()=>visible(companies).filter(isGroupCo);
const childrenOf=g=>visible(companies).filter(c=>!isGroupCo(c)&&c.parent===g.key);
const cLabel=k=>(companies.find(g=>g.key===k)||{}).label||k||"—";
const glLabel=k=>{const g=gls.find(x=>x.key===k);return g?(g.dept?g.dept+" · ":"")+(g.code?g.code+" · ":"")+g.label:(k||"ไม่ระบุ GL");};
const isMeet=t=>!!(t&&(t.meet||/ประชุม|meeting/i.test((t.title||"")+" "+(t.type||""))));
const hhmm=v=>/^\d{1,2}:\d{2}$/.test(v||"")?(v.length===4?"0"+v:v):"";
const tShow=v=>hhmm(v)?hhmm(v)+" น.":"";
const prepDate=t=>{const d=dueDate(t); if(!d||!(+t.prepDays))return null;
const p=new Date(d); p.setDate(p.getDate()-(+t.prepDays)); return p;};
const isTrain=t=>!!(t&&(t.train||/^train_/.test(t.track||"")||/อบรม/.test(gLabel(t.track))||/อบรม|training/i.test(t.type||"")));
// ป้ายกลุ่มย่อยของงานอบรม = ประเภทงานที่ตั้งไว้ในตั้งค่า (ถ้าไม่ได้ตั้ง ใช้ชื่อกลุ่มงาน)
const trainKind=t=>(t.type||"").trim()||gLabel(t.track)||"ยังไม่ระบุประเภท";
// "อบรมตามกฎหมาย" = กลุ่มงานหรือประเภทงานที่มีคำว่า กฎหมาย
// บังคับตามกฎหมาย: หลักสูตรชนะประเภทงาน · ประเภทงานเป็นตาข่ายกันพลาดของรุ่นที่ยังไม่ผูกรหัส
const isLawTrain=t=>{const c=crsOf(crsCodeOf(t))||crsByName((t||{}).title);
if(c&&(c.law===true||c.law===false))return c.law;
const d=typeDef(t.type); if(d)return !!d.law||/กฎหมาย/.test(d.name);
return /กฎหมาย/.test((t.type||"")+" "+gLabel(t.track));};
const isLawItem=t=>isLawTrain(t);
const lawSrc=t=>{const c=crsOf(crsCodeOf(t))||crsByName((t||{}).title);
return (c&&(c.law===true||c.law===false))?"หลักสูตร":"ประเภทงาน";};
const isoOf=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
// ===== สถานะรายรอบ (แบบ Google Calendar) =====
// งานที่เกิดซ้ำ: แต่ละวันมีสถานะของตัวเอง เก็บใน t.ov[วันที่]={status} (เสร็จสิ้นเก็บใน t.done[] เหมือนเดิม)
// ถ้าไม่ได้ตั้งเฉพาะวัน ใช้สถานะรวมของซีรีส์ (t.status) · ยกเลิกทั้งซีรีส์ = t.status ยกเลิก · "รอบนี้และต่อจากนี้" = rrule.until
const isoDate=iso=>{const [y,m,d]=String(iso).split("-").map(Number); return new Date(y,(m||1)-1,d||1);};
const serDefault=t=>{const s=normSt(t.status); return s===STATUS_CANCEL?STATUS_CANCEL:(s==="กำลังดำเนินการ"?s:"รอดำเนินการ");};
function occStat(t,d){
if(!rr(t))return normSt(t.status);
const iso=isoOf(d), o=(t.ov||{})[iso];
if(o&&o.status)return normSt(o.status);
if((t.done||[]).includes(iso))return STATUS_DONE;
return serDefault(t);
}
const occDone=(t,d)=>rr(t)?occStat(t,d)===STATUS_DONE:(((t&&t.done)||[]).includes(isoOf(d)));
const occCancel=(t,d)=>rr(t)&&occStat(t,d)===STATUS_CANCEL;
// สีของจุดในวันนั้น: ปิดแล้ว=เขียว · ยกเลิก=เทา · ยังเปิดและเลยวัน=แดง · อื่นๆตามสถานะ
function occColor(t,d){
const st=occStat(t,d); if(st===STATUS_DONE)return sColor(st); if(st===STATUS_CANCEL)return sColor(st);
const today=new Date(); today.setHours(0,0,0,0);
return d<today?"var(--over)":sColor(st);
}
// แพตช์ข้อมูลเมื่อเปลี่ยนสถานะ "เฉพาะรอบนี้"
function occPatch(t,iso,status){
const ov={...(t.ov||{})}; const done=(t.done||[]).filter(x=>x!==iso);
delete ov[iso];
if(status===STATUS_DONE)done.push(iso);
else if(status!==serDefault(t)||t.status===STATUS_CANCEL)ov[iso]={status};
const p={ov,done};
if(t.status===STATUS_CANCEL&&status!==STATUS_CANCEL){ p.status="รอดำเนินการ"; if(status==="รอดำเนินการ")delete ov[iso]; }
return p;
}
function occPrevDay(iso){ const d=isoDate(iso); d.setDate(d.getDate()-1); return isoOf(d); }
// งดรอบนี้ (ไม่จัดสัปดาห์นี้) — ไม่กระทบรอบอื่น
const occSkip=(t,d)=>(((t&&t.skip)||[]).includes(isoOf(d)));
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
const list=occList(t,new Date(from.getFullYear(),from.getMonth(),1),18).filter(d=>!occDone(t,d)&&!occSkip(t,d)&&!occCancel(t,d));
const past=list.filter(d=>d<today);
return past.length?past[0]:(list.find(d=>d>=today)||null);
}
function occState(t){
if(t.status===STATUS_CANCEL)return {label:STATUS_CANCEL,cls:"s-cancel",recur:false,d:null};
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
const gColor=k=>{const g=groups.find(x=>x.key===k);return (g&&g.color)||"";};
// ลำดับสี: สีที่ตั้งในงาน → สีของป้ายกำกับ → สีของกลุ่มงาน → สีตามสถานะ
// กฎเดียว: สีของงาน = สีกลุ่มงาน (ถ้ากลุ่มยังไม่ตั้งสี ใช้สีตามสถานะ)
const QCOL={q1:"#E5636F",q2:"#5B9BD5",q3:"#F0B429",q4:"#A8A59B"};
const calColor=()=>{try{return localStorage.getItem("sw-calcolor")||"";}catch(e){return "";}};
const dotCol=(t,def)=>calColor()==="matrix"?(QCOL[quadOf(t)]||"var(--line)"):def;
const itemColor=t=>{ if(!t)return sColor("");
return sColor(t.status); };
const svg=(p,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
// ทะเบียนหลักสูตร — รหัสรันอัตโนมัติ กันคีย์มือผิด
const CRSPREFIX="TRN";
function nextCourseCode(){
let n=0;
courses.forEach(c=>{const m=String(c.code||"").match(/(\d+)\s*$/); if(m)n=Math.max(n,+m[1]);});
return CRSPREFIX+"-"+String(n+1).padStart(3,"0");
}
const crsOf=code=>courses.find(c=>c.code===code)||null;
const crsLabel=code=>{const c=crsOf(code);return c?c.code+" · "+c.name:(code||"");};
// หาโค้ดหลักสูตรของงานหนึ่ง: ยึดที่ผูกไว้ก่อน ถ้าไม่มีให้จับคู่จากชื่อ (ข้อมูลเก่าที่พิมพ์เอง)
const crsByName=nm=>courses.find(c=>c.name.trim()===String(nm||"").trim());
const crsCodeOf=t=>(t.course||"").trim()||((crsByName(t.title)||{}).code||"");
const crsBatches=code=>items.filter(t=>isTrain(t)&&crsCodeOf(t)===code);
const batchNo=v=>{const m=String(v||"").match(/(\d+)/); return m?+m[1]:0;};
const batchLabel=(sample,n)=>{const s0=String(sample||"").trim();
return /\d/.test(s0)?s0.replace(/\d+/,String(n)):(s0?s0+" "+n:String(n));};
// ประเภท/รูปแบบ/ชั่วโมง: ยึดค่าที่กรอกในงานก่อน ถ้าเว้นไว้ให้ดึงจากทะเบียนหลักสูตร
// ทะเบียนหมวดทักษะ / รูปแบบ — ของที่ใช้อยู่จริงในข้อมูลจะถูกเติมเข้ามาให้เองไม่ให้ตกหล่น
const listOf=(saved,base,pick)=>{
const b=(saved.length?saved:base).map(x=>typeof x==="string"?x:(x&&x.name)||"").filter(Boolean);
const used=[...new Set([...courses.map(pick),...items.map(pick)].map(x=>String(x||"").trim()).filter(Boolean))];
return [...b,...used.filter(x=>!b.includes(x))];};
const skills=()=>listOf(skillList,SKILLS_BASE,x=>x&&x.skill);
const modes=()=>listOf(modeList,MODES_BASE,x=>x&&x.mode);
const skillColor=n=>SKILLC[n]||TAGCOLORS[(skills().indexOf(n)+3)%TAGCOLORS.length]||"var(--wait)";
const modeColor=n=>MODEC[n]||TAGCOLORS[(modes().indexOf(n)+7)%TAGCOLORS.length]||"var(--wait)";
const skillUsed=n=>courses.filter(c=>(c.skill||"")===n).length+items.filter(t=>(t.skill||"")===n).length;
const modeUsed=n=>courses.filter(c=>(c.mode||"")===n).length+items.filter(t=>(t.mode||"")===n).length;
const crsMeta=t=>crsOf(crsCodeOf(t))||crsByName((t||{}).title)||{};
const skillOf=t=>((t&&t.skill||"").trim())||crsMeta(t).skill||"";
const modeOf=t=>((t&&t.mode||"").trim())||crsMeta(t).mode||"";
const hoursOf=t=>+(t&&t.hours)||+crsMeta(t).hours||0;
// นับหลักสูตรไม่ซ้ำจากรายการอบรม (ยึดรหัสหลักสูตรก่อน ถ้าไม่มีใช้ชื่อ)
const crsChip=t=>{const c=crsCodeOf(t);
return c?`<b style="font-family:var(--mono);color:var(--accent)">${esc(c)}</b>${t.batch?" "+esc(t.batch):""} · `:"";};
const courseKey=t=>crsCodeOf(t)||(t.title||"").trim()||(t.code||"").trim();
const uniqCourses=arr=>new Set(arr.map(courseKey).filter(Boolean)).size;
const TYPEBASE=["อบรม","ประชุม","โปรเจค","กิจกรรม","งานประจำ/ต่ออายุ","เอกสารราชการ","สุขภาพ","อื่นๆ"];
const typeUsed=x=>items.filter(t=>(t.type||"")===x).length;
const tName=x=>typeof x==="string"?x:(x&&x.name)||"";
const tTrack=x=>(typeof x==="string"?"":(x&&x.track)||"");
const tLaw=x=>typeof x==="string"?false:!!(x&&x.law);
// รายการประเภทแบบเต็ม [{name,track,law}] — track ว่าง = ใช้ได้ทุกกลุ่มงาน · law = บังคับตามกฎหมาย
const typeDefs=()=>{
const base=(typeList.length?typeList:TYPEBASE).map(x=>({name:tName(x),track:tTrack(x),law:tLaw(x)})).filter(x=>x.name);
const extra=[...new Set(items.map(t=>t.type).filter(Boolean))].filter(x=>!base.some(b=>b.name===x)).sort().map(name=>({name,track:"",law:false}));
return [...base,...extra];};
const typeDef=nm=>typeDefs().find(x=>x.name===String(nm||"").trim())||null;
const lawTypes=()=>typeDefs().filter(x=>x.law).map(x=>x.name);
const types=()=>typeDefs().map(x=>x.name);
// ประเภทที่ใช้ได้กับกลุ่มงานนั้น: ของกลุ่มนั้น + ที่ไม่ผูกกลุ่ม
const typesFor=tr=>typeDefs().filter(x=>!x.track||x.track===tr).map(x=>x.name);
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
const weekDays=()=>{const t0=new Date();t0.setHours(0,0,0,0);const s0=new Date(t0);s0.setDate(t0.getDate()-t0.getDay());
return [0,1,2,3,4,5,6].map(i=>{const d=new Date(s0);d.setDate(s0.getDate()+i);return d;});};
const DAYTH=["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
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
// เลื่อนไปปีไหนก็ได้ — รายการจะขยายตามปีที่กำลังดูเสมอ (แบบ Google Calendar)
for(let y=Math.min(THISYEAR-3,R.year-5);y<=Math.max(THISYEAR+5,R.year+5);y++)ys.add(y);
items.forEach(t=>{if(t.date)ys.add(new Date(t.date).getFullYear());});
ledger.forEach(x=>{if(x.date)ys.add(new Date(x.date).getFullYear());});
return [...ys].filter(y=>y>2000&&y<2100).sort();
}
const yearSel=id=>`<span class="yrnav"><button class="iconbtn" data-yr="-1" title="ปีก่อนหน้า">‹</button><select id="${id}" style="border:0;background:var(--card);border-radius:999px;padding:8px 14px;font-weight:600;box-shadow:var(--sh-s)">${yearList().map(y=>`<option value="${y}"${y===R.year?" selected":""}>พ.ศ. ${y+543} · ${y}</option>`).join("")}</select><button class="iconbtn" data-yr="1" title="ปีถัดไป">›</button>${R.year!==THISYEAR?`<button class="gcbtn" data-yr="0" title="กลับไปปีปัจจุบัน">วันนี้</button>`:""}</span>`;
const scopeLabel=()=>R.scope==="year"?"ทั้งปี "+(R.year+543):R.scope==="month"?MTHFULL[R.month]:"สัปดาห์นี้";
// ช่องค้นหาประจำหน้า
const pqBox=(ph)=>`<input type="search" id="pq" placeholder="${esc(ph||"ค้นหาในหน้านี้")}" value="${esc(R.pq||"")}" style="flex:1;min-width:180px;background:var(--card);border:0;border-radius:999px;padding:9px 16px;box-shadow:var(--sh-s)">`;
const pqHit=(...parts)=>{const q=(R.pq||"").trim().toLowerCase(); if(!q)return true;
return parts.filter(Boolean).join(" ").toLowerCase().includes(q);};
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
const pctOf=p=>Math.round(p.v/tot*1000)/10;
const arcs=parts.filter(p=>p.v>0).map(p=>{
const len=p.v/tot*C;
const a=`<circle cx="70" cy="70" r="${R2}" fill="none" stroke="${p.c}" stroke-width="20"
stroke-dasharray="${Math.max(len-3,1)} ${C-Math.max(len-3,1)}" stroke-dashoffset="${-off}"
stroke-linecap="round" transform="rotate(-90 70 70)"${tipAttr(p.n+" · "+p.v+" ("+pctOf(p)+"%)",p.tip)}></circle>`;
off+=len; return a;}).join("");
return `<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="สัดส่วน">
<circle cx="70" cy="70" r="${R2}" fill="none" stroke="var(--line-2)" stroke-width="20"/>${arcs}
<text x="70" y="66" text-anchor="middle" font-size="26" font-weight="600" fill="var(--ink)" font-family="Mitr,sans-serif">${centerTop}</text>
<text x="70" y="86" text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="Sarabun,sans-serif">${centerSub}</text></svg>`;
}
// tooltip ของแถวในคำอธิบายโดนัท (ใช้ข้อความเดียวกับชิ้นโดนัท)
const donutTip=(parts,p)=>{const tot=parts.reduce((s,x)=>s+x.v,0)||1; return tipAttr(p.n+" · "+p.v+" ("+Math.round(p.v/tot*1000)/10+"%)",p.tip);};
// bars(ค่า, ป้ายแกน, รูปแบบตัวเลข, เดือนที่เน้น, tips[i] = บรรทัดรายละเอียดเพิ่มเติม (array หรือ string), unit = หน่วย เช่น "งาน")
function bars(vals,labels,fmt,hi,tips,unit,sumLabel){
const max=Math.max(...vals,1), W=430, H=150, bw=W/vals.length, tot=vals.reduce((a,b)=>a+b,0);
return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="กราฟแท่ง">
<line x1="0" y1="118" x2="${W}" y2="118" stroke="var(--line-2)" stroke-width="1.5"/>
${vals.map((v,i)=>{
const h=Math.max(v/max*104,v>0?5:0), x=i*bw+bw*.2, y=118-h, on=i===hi;
const head=labels[i]+" · "+(fmt(v)||0)+(unit?" "+unit:"")+(tot&&v?" ("+Math.round(v/tot*1000)/10+"% ของ"+(sumLabel||"ทั้งหมด")+")":"");
return `<g><rect class="chartcol" x="${i*bw}" y="0" width="${bw}" height="134"${tipAttr(head,(tips&&tips[i])||(v?"":"ไม่มีรายการ"))}/>
<rect x="${x}" y="${y}" width="${bw*.6}" height="${h}" rx="5" fill="${on?"var(--accent)":"var(--accent-2)"}" opacity="${on?1:.55}" pointer-events="none"></rect>
${v>0?`<text x="${x+bw*.3}" y="${y-5}" text-anchor="middle" font-size="9.5" fill="var(--ink-3)" font-family="Sarabun,sans-serif" pointer-events="none">${fmt(v)}</text>`:""}
<text x="${x+bw*.3}" y="134" text-anchor="middle" font-size="9.5" fill="${on?"var(--accent)":"var(--ink-3)"}" font-family="Sarabun,sans-serif" pointer-events="none">${labels[i]}</text></g>`;}).join("")}
</svg>`;
}
// dualBars: tips(i) → บรรทัดเพิ่มเติมของเดือนที่ i (array)
function dualBars(inc,exp,labels,hi,n1="รายรับ",n2="รายจ่าย",c1="var(--ok)",c2="var(--accent-2)",tips,diffLabel){
const max=Math.max(...inc,...exp,1), W=430, H=155, bw=W/12;
return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="กราฟแท่งคู่รายเดือน">
<line x1="0" y1="120" x2="${W}" y2="120" stroke="var(--line-2)" stroke-width="1.5"/>
${labels.map((l,i)=>{
const hi2=Math.max(inc[i]/max*98,inc[i]>0?4:0), he=Math.max(exp[i]/max*98,exp[i]>0?4:0);
const x=i*bw+bw*.14, w=bw*.34, dif=inc[i]-exp[i];
const head=[l,n1+"|"+baht(inc[i])+" ฿",n2+"|"+baht(exp[i])+" ฿",(diffLabel||"ผลต่าง")+"|"+(dif<0?"−":dif>0?"+":"")+baht(Math.abs(dif))+" ฿"];
return `<g><rect class="chartcol" x="${i*bw}" y="0" width="${bw}" height="138"${tipAttr(head,tips&&(typeof tips==="function"?tips(i):tips[i]))}/>
<rect x="${x}" y="${120-hi2}" width="${w}" height="${hi2}" rx="4" fill="${c1}" pointer-events="none"></rect>
<rect x="${x+w+2}" y="${120-he}" width="${w}" height="${he}" rx="4" fill="${c2}" pointer-events="none"></rect>
<text x="${i*bw+bw*.5}" y="136" text-anchor="middle" font-size="9.5" fill="${i===hi?"var(--accent)":"var(--ink-3)"}" font-family="Sarabun,sans-serif" pointer-events="none">${l}</text></g>`;}).join("")}
</svg>`;
}
const CFG_BAKED={url:"https://bakdblnqllcoltbgbwpe.supabase.co",key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJha2RibG5xbGxjb2x0Ymdid3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTEwMjAsImV4cCI6MjEwNDA4NzAyMH0.gUz4M0BW1c62dnwGwmFNLbGNKOXUVs--TFuvD7TSsLQ"};
let cfg=CFG_BAKED.url?CFG_BAKED:(()=>{try{return JSON.parse(localStorage.getItem("sw-cfg")||"null")||{url:"",key:""}}catch(e){return{url:"",key:""}}})();
let SB=null, uid=null;
let hrdata={manpower:{},certified:{},dsd:{},subsidy:{pct:70,rate:200}};
let legal=[], idx=[], notes=[];
const TRASH={items:[],ledger:[],legal:[],index:[],note:[]};
const TRASH_DAYS=30;
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
set:(d,o)=>up(coll,i,o&&o.merge?Object.assign({},cache[coll].get(i)||{},d):d), update:d=>up(coll,i,Object.assign({},cache[coll].get(i)||{},d)),
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
const {data,error}=await SB.from("rows").select("id,kind,data").eq("uid",uid).neq("kind","ink").neq("kind","nimg");
if(error){setFoot("โหลดข้อมูลไม่ได้","var(--over)");return;}
cache.items.clear();cache.ledger.clear();cache.meta.clear();
data.forEach(r=>cache[r.kind]?.set(r.id,r.data));
emit("items");emit("ledger");emit("legal");emit("index");emit("note");[...cache.meta.keys()].forEach(emitMeta);
["groups","companies","gl","theme","hr"].forEach(emitMeta);
}
function liveSync(){
SB.channel("rows-"+uid).on("postgres_changes",{event:"*",schema:"public",table:"rows",filter:"uid=eq."+uid},p=>{
const r=p.new&&p.new.id?p.new:p.old;
if(!r||r.kind==="ink"||r.kind==="nimg")return;
if(p.eventType==="DELETE")cache[r.kind]?.delete(r.id); else cache[r.kind]?.set(r.id,r.data);
r.kind==="meta"?emitMeta(r.id):emit(r.kind);
render();
}).subscribe();
}
async function boot(){
LOADING=true; applyTheme(); renderNav(); render();
try{ await boot2(); } finally { if(LOADING){ LOADING=false; render(); } }
}
async function boot2(){
if(!cfg.url||!cfg.key){ gate("setup"); return; }
SB=supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true}});
SB.auth.onAuthStateChange(ev=>{ if(ev==="PASSWORD_RECOVERY")setTimeout(()=>gate("newpass"),0); });
const {data:{session}}=await SB.auth.getSession();
if(!session){ gate("login"); return; }
uid=session.user.id; DB=DBShim;
el("gate").close();
sub("meta/groups",d=>{if(Array.isArray(d.list)&&d.list.length)groups=d.list;});
sub("meta/companies",d=>{if(Array.isArray(d.list))companies=d.list;});
sub("meta/gl",d=>{seedGL._done=true; if(Array.isArray(d.list))gls=d.list;});
sub("meta/types",d=>{if(Array.isArray(d.list))typeList=d.list;});
sub("meta/tags",d=>{if(Array.isArray(d.list))tagList=d.list;});
sub("meta/courses",d=>{if(Array.isArray(d.list))courses=d.list;});
sub("meta/skills",d=>{if(Array.isArray(d.list))skillList=d.list;});
sub("meta/modes",d=>{if(Array.isArray(d.list))modeList=d.list;});
sub("meta/nfolders",d=>{if(Array.isArray(d.list))noteFolders=d.list;});
sub("meta/inkdef",d=>{ if(d&&typeof d==="object")INKDEF=d; });
sub("meta/idxcats",d=>{if(Array.isArray(d.list))idxCats=d.list;});
sub("meta/tpls",d=>{ if(Array.isArray(d.list))tpls=d.list; });
sub("meta/pushsubs",d=>{ if(Array.isArray(d.list)){ pushSubs=d.list; pushHere(); } });
sub("meta/bk",d=>{ const l=d.list; bkAt=(l&&l[0]&&l[0].at)||""; if(view==="home"&&!LOADING)render(); });
sub("meta/hr",d=>{hrdata={manpower:d.manpower||{},certified:d.certified||{},dsd:d.dsd||{},subsidy:d.subsidy||{pct:70,rate:200}};});
sub("meta/theme",d=>{if(d.preset){theme={preset:d.preset,custom:d.custom||null,mode:d.mode||"auto"};try{localStorage.setItem("hr-theme",JSON.stringify(theme));}catch(e){} applyTheme();}});
const splitTrash=(docs,key)=>{const all=docs.map(d=>Object.assign({},d.data(),{_id:d.id}));
TRASH[key]=all.filter(t=>t._trash).sort((a,b)=>String(b._trash).localeCompare(String(a._trash)));
return all.filter(t=>!t._trash);};
DBShim.collection("items").onSnapshot(s=>{
items=splitTrash(s.docs,"items").filter(t=>!isSysRow(t));
items.forEach(t=>{ if(t.status)t.status=normSt(t.status); });
maybeSeedGL(); autoPurgeTrash();
setFoot(items.length+" งาน · ซิงก์แล้ว"); render();});
DBShim.collection("index").onSnapshot(s=>{ idx=splitTrash(s.docs,"index"); render();});
DBShim.collection("note").onSnapshot(s=>{ notes=splitTrash(s.docs,"note"); render();});
DBShim.collection("legal").onSnapshot(s=>{ legal=splitTrash(s.docs,"legal"); render();});
DBShim.collection("ledger").onSnapshot(s=>{ ledger=splitTrash(s.docs,"ledger"); render();});
setFoot("กำลังโหลด…");
await loadAll(); liveSync(); LOADING=false; render();
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
// แผนงบรายเดือนแยกบริษัท: g.plan[ปี][บริษัท] = [12 เดือน]
const glPlan=(g,y)=>((g&&g.plan&&g.plan[y])||{});
const glPlanMonths=(g,y,ck)=>{const a=glPlan(g,y)[ck]; return Array.isArray(a)?a.map(v=>+v||0):Array(12).fill(0);};
const hasPlan=(g,y)=>Object.values(glPlan(g,y)).some(a=>Array.isArray(a)&&a.some(v=>+v));
// งบรวม: ระบุเดือน (m) และ/หรือบริษัท (ck) ได้ — ถ้าไม่มีแผนรายเดือน ใช้ก้อนรายปีเดิม
const glBudget=(g,y,m,ck)=>{ if(!g)return 0;
if(hasPlan(g,y)){
const P=glPlan(g,y);
const keys=ck?[ck]:Object.keys(P);
return keys.reduce((s2,k)=>{const arr=glPlanMonths(g,y,k);
return s2+(m==null?arr.reduce((a,b)=>a+b,0):(+arr[m]||0));},0);}
if(ck)return 0;
const yr=(g.budgets&&typeof g.budgets==="object"&&g.budgets[y]!=null)?+g.budgets[y]||0
:((!g.budgets&&+g.budget&&y===THISYEAR)?+g.budget:0);
return m==null?yr:Math.round(yr/12);};
const setGlPlan=(g,y,ck,arr)=>{g.plan=g.plan||{}; g.plan[y]=g.plan[y]||{};
if(arr.some(v=>+v))g.plan[y][ck]=arr.map(v=>+v||0); else delete g.plan[y][ck];
if(!Object.keys(g.plan[y]).length)delete g.plan[y];
g.budgets=g.budgets&&typeof g.budgets==="object"?g.budgets:{};
const t=glBudget(g,y); if(t)g.budgets[y]=t; else delete g.budgets[y];
g.budget=g.budgets[THISYEAR]||0;};
const setGlBudget=(g,y,v)=>{ if(!g.budgets||typeof g.budgets!=="object"){ g.budgets = (+g.budget)?{[THISYEAR]:+g.budget}:{}; }
if(v)g.budgets[y]=v; else delete g.budgets[y]; g.budget=g.budgets[THISYEAR]||0; };
const glYears=g=>[...new Set([...Object.keys((g&&g.budgets)||{}),...Object.keys((g&&g.plan)||{})])].map(Number).filter(y=>glBudget(g,y)).sort();
const glKeyOf=g=>{g=(g||"").trim();if(!g)return"";const m=g.match(/^(\d{6,9})/);return m?m[1]:g.slice(0,18);};
const mpOf=(c,y)=>+((hrdata.manpower[c]||{})[y])||0;
const certOf=(c,y)=>{const v=(hrdata.certified[c]||{})[y]; return v==null?null:+v||0;};
const saveHR=async()=>{ if(!DB)return; try{ await DB.doc("meta/hr").set({manpower:hrdata.manpower,certified:hrdata.certified,dsd:hrdata.dsd,subsidy:hrdata.subsidy}); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?'<div style="font-size:13px;margin-top:8px;line-height:1.7">'+x.fix+"</div>":"")); } };
const dsdRec=(c,y)=>((hrdata.dsd||{})[c]||{})[y]||null;
const dsdList=y=>visible(companies).filter(c=>!isGroupCo(c)&&dsdRec(c.key,y));
const LAWPCT=50;
// ---------- เตือนประจำปีของกรมพัฒนาฯ ----------
// ผลงานปี Y ต้องยื่นขอรับรอง/ขอเงินอุดหนุนภายใน 31 ส.ค. ปี Y+1 · รอบเตรียม สท.2 เริ่ม 17 พ.ย.
function dsdYearClock(){
const today=new Date(); today.setHours(0,0,0,0);
const y0=today.getFullYear();
const augThis=new Date(y0,7,31);
const perfYear=(today<=augThis)?y0-1:y0;      // ปีผลงานที่ยังยื่นได้อยู่
const due=new Date(perfYear+1,7,31);          // 31 ส.ค.
const left=Math.round((due-today)/86400000);
const prep=new Date(perfYear,10,17);          // 17 พ.ย. = เริ่มรอบเตรียม
return {today,perfYear,due,left,prep,inPrep:today>=prep};
}
const st2Done=r=>(r&&(r.st2==="ได้รับการรับรองแล้ว"));
const st2Sent=r=>(r&&(r.st2==="ยื่นแล้ว รอผลพิจารณา"||r.st2==="ได้รับการรับรองแล้ว"));
function dsdAnnualBanner(){
const C=dsdYearClock();
const cos=visible(companies).filter(c=>!isGroupCo(c));
if(!cos.length)return "";
const pendingOf=y=>cos.filter(c=>{const r=dsdRec(c.key,y); return r&&!st2Sent(r);});
const rowOf=(c,y,p,pc)=>({t1:cLabel(c.key),t2:"ผลงานปี "+(y+543)+" · สท.2: "+((dsdRec(c.key,y)||{}).st2||"ยังไม่เริ่ม"),
d:"สท.2",c:"var(--over-soft)",ic:"var(--over)",p,pc});
let out="";
// 1) ปีที่เลยเส้นตาย 31 ส.ค. ไปแล้วแต่ยังไม่ได้ยื่น
const allYears=[...new Set(Object.values(hrdata.dsd||{}).flatMap(o=>Object.keys(o||{}).map(Number)))]
.filter(y=>y&&y<C.perfYear).sort();
const lateRows=[];
allYears.forEach(y=>pendingOf(y).forEach(c=>{
const dd=Math.round((C.today-new Date(y+1,7,31))/86400000);
lateRows.push(rowOf(c,y,"เลย "+dd+" วัน","s-over"));}));
if(lateRows.length)
out+=`<div class="banner bad" ${regList("st2Late","สท.2 ที่เลยเส้นตาย 31 ส.ค. แล้ว",lateRows)}>${svg(ICON.bell,19)}
<b>มี ${lateRows.length} รายการที่เลยเส้นตาย 31 ส.ค. แล้วแต่ยังไม่ได้ยื่น สท.2</b> — ปีผลงาน ${allYears.map(y=>y+543).join(", ")} · ยื่นช้ามีสิทธิ์ถูกประเมินเงินสมทบเต็มจำนวน ตรวจด่วน</div>`;
// 2) ปีผลงานที่กำลังจะถึงเส้นตาย
const p=pendingOf(C.perfYear);
if(p.length&&C.left<=120)
out+=`<div class="banner ${C.left<=30?"bad":""}" ${regList("st2Soon","ต้องยื่น สท.2 ของผลงานปี "+(C.perfYear+543),p.map(c=>rowOf(c,C.perfYear,C.left+" วัน",C.left<=30?"s-over":"s-run")))}>${svg(ICON.clock,19)}
เหลือ <b>${C.left} วัน</b> ถึง <b>31 ส.ค. ${C.perfYear+544}</b> — เส้นตายยื่นขอรับรอง/ขอเงินอุดหนุนของผลงานปี ${C.perfYear+543} · ยังค้าง ${p.length} บริษัท</div>`;
// 3) รอบเตรียมประจำปี เริ่ม 17 พ.ย.
const y0=C.today.getFullYear();
if(C.today>=new Date(y0,10,17)&&pendingOf(y0).length)
out+=`<div class="banner">${svg(ICON.file,19)} ถึงรอบ <b>เตรียม สท.2 ของผลงานปี ${y0+543}</b> แล้ว (เริ่ม 17 พ.ย.) — รวบรวมรายชื่อผู้ผ่านการฝึก · ขอข้อมูล สปส. · กรอกในระบบออนไลน์ · ยื่นให้ทันก่อน 31 ส.ค. ${y0+544}</div>`;
return out;
}

// ขั้นตอนตามกรมพัฒนาฯ: ยื่น ยป. ก่อนฝึก → ฝึก → ยื่นรับรองรุ่น/รง.1
// เลขคำขอ ยป. — ถ้ารุ่นไม่ได้ใส่เอง ใช้ของหลักสูตร
// คำขอ ยป. ของหลักสูตร แยกรายปี — ทุกปีต้องยื่นเปิดหลักสูตรใหม่ เลขจึงไม่ซ้ำกัน
const crsYear=t=>{const d=t.date||t.dsdEnd; return d?new Date(d).getFullYear():(typeof R!=="undefined"?R.year:THISYEAR);};
const crsFiling=(code,y)=>(((crsOf(code)||{}).filings)||{})[y]||{};
const ypNoOf=t=>(t.dsdOpenNo||"").trim()||(crsFiling(crsCodeOf(t),crsYear(t)).openNo||"").trim();
const ypDateOf=t=>t.dsdOpenDate||crsFiling(crsCodeOf(t),crsYear(t)).openDate||null;
const ypKind=t=>t.yp||crsFiling(crsCodeOf(t),crsYear(t)).yp||((crsOf(crsCodeOf(t))||{}).yp||"");
function ypState(t){
const today=new Date(); today.setHours(0,0,0,0);
const lead=ypLead(ypKind(t));
const start=t.date?new Date(t.date):null;
const end=t.dsdEnd?new Date(t.dsdEnd):start;
// 1) ยังไม่ยื่นเปิดหลักสูตร
if(!ypNoOf(t)&&!ypDateOf(t)){
if(!start)return {step:"ยังไม่กำหนดวันฝึก",cls:"s-wait",n:null};
const due=dAdd(t.date,-lead), n=dDiff(due,today);
return {step:(ypKind(t)||"ยป.")+" · ต้องยื่นก่อนฝึก "+lead+" วัน",cls:n<0?"s-over":n<=7?"s-run":"s-wait",n,due,
msg:n<0?"เลยกำหนดยื่นก่อนฝึกแล้ว "+(-n)+" วัน":"ต้องยื่น ยป. ภายใน "+n+" วัน"};}
// 2) ยื่นเปิดแล้ว แต่ยังไม่ได้เลขคำขอรับรองรุ่น
if(!t.dsdCertNo){
let due=null,note="";
if(t.dsdCertDate){ due=dAdd(t.dsdCertDate,30); note="นับ 30 วันจากวันที่ยื่นรับรองรุ่น"; }
else if(end){ const d60=dAdd(end.toISOString().slice(0,10),60);
const cap=new Date(end.getFullYear()+1,0,15); due=d60<cap?d60:cap; note="รง.1 ภายใน 60 วันหลังฝึกเสร็จ แต่ไม่เกิน 15 ม.ค."; }
if(!due)return {step:"รอฝึก / รอยื่นรับรองรุ่น",cls:"s-wait",n:null};
const n=dDiff(due,today);
return {step:"ต้องยื่นรับรองรุ่น / รง.1",cls:n<0?"s-over":n<=14?"s-run":"s-mid",n,due,note,
msg:n<0?"เลยกำหนดยื่นรับรองรุ่นแล้ว "+(-n)+" วัน — ยื่นย้อนหลังไม่ได้":"เหลือ "+n+" วันต้องยื่นรับรองรุ่น"};}
return {step:"ยื่นครบขั้นตอนแล้ว",cls:"s-done",n:null};
}
const st2Cls=x=>x==="ได้รับการรับรองแล้ว"?"s-done":x==="ไม่ผ่าน / ต้องแก้ไข"?"s-cancel":x==="ยื่นแล้ว รอผลพิจารณา"?"s-mid":(!x||x==="ยังไม่เริ่ม")?"s-wait":"s-run";
const YP=[["","— ไม่ระบุ —"],["ยป.1","ยป.1 · หลักสูตรใหม่ ยื่นครั้งแรก (ก่อนฝึก 30 วัน)"],["ยป.2","ยป.2 · e-learning ของบริษัท (ก่อนฝึก 30 วัน)"],["ยป.3","ยป.3 · ส่งลูกจ้างไปฝึกภายนอก (ก่อนฝึก 15 วัน)"],["ยป.4","ยป.4 · หลักสูตรเดิม/ของกรมฯ (ก่อนฝึก 30 วัน)"]];
const ypLead=y=>y==="ยป.3"?15:30;
const dAdd=(iso,n)=>{const d=new Date(iso); d.setDate(d.getDate()+n); return d;};
const dDiff=(a,b)=>Math.round((a-b)/86400000);
const ST2=["ยังไม่เริ่ม","รวบรวมรายชื่อผู้ผ่านการฝึก","ขอข้อมูล สปส. จากประกันสังคม","กรอก/อัปโหลดในระบบออนไลน์","ยื่นแล้ว รอผลพิจารณา","ได้รับการรับรองแล้ว","ไม่ผ่าน / ต้องแก้ไข"];
const subPct=()=>+((hrdata.subsidy||{}).pct)||70;
const subRate=()=>+((hrdata.subsidy||{}).rate)||200;
const STD_RATE=1000, STD_CAP=100000, FUND_PCT=10;
function subsidyOf(k,r){
const base=k.avg*subPct()/100;
const excess=Math.max(0,Math.floor(k.C-base));
const amount=excess*subRate();
const stdN=0;
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
const trainRows=(c,y)=>items.filter(t=>isTrain(t)&&(t.company||"")===c&&t.status==="เสร็จสิ้น"
&&(()=>{const d=dueDate(t);return d?d.getFullYear()===y:false;})());
const trainedPax=(c,y)=>trainRows(c,y).reduce((n,t)=>n+(+t.pax||0),0);
// เฉพาะรุ่นที่ยื่นกรมฯ และได้รับอนุมัติ — ตัวนี้คือตัวที่นับเข้าเกณฑ์ได้จริง
const trainedPaxDsd=(c,y)=>trainRows(c,y).filter(t=>t.dsd==="อนุมัติแล้ว"||t.dsdCertNo).reduce((n,t)=>n+(+t.pax||0),0);
const saveMeta=async(k,list)=>{ if(!DB)return; try{ await DB.doc("meta/"+k).set({list}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); } };
// ---------- ถังขยะ: ลบแล้วกู้คืนได้ 30 วัน ----------
const TRKIND={items:"งาน",ledger:"รายการเงิน",legal:"กฎหมาย/ใบรับรอง",index:"Index Online",note:"บันทึก"};
const trashAll=()=>Object.entries(TRASH).flatMap(([k,a])=>a.map(t=>({coll:k,t})));
const trashDays=t=>Math.floor((Date.now()-new Date(t._trash||Date.now()))/86400000);
const trashLeft=t=>Math.max(0,TRASH_DAYS-trashDays(t));
const trashTitle=(k,t)=>k==="ledger"?((t.note||t.title||"รายการเงิน")+(t.amount?" · "+baht(t.amount)+" ฿":"")):(t.title||"(ไม่มีชื่อ)");
async function softDel(coll,row){
if(!DB)throw new Error("ยังไม่ได้เชื่อมต่อฐานข้อมูล");
const d=Object.assign({},row); delete d._id;
d._trash=new Date().toISOString();
await DB.collection(coll).doc(row._id).set(d);
setFoot("ย้ายไปถังขยะแล้ว · กู้คืนได้ใน "+TRASH_DAYS+" วัน (ตั้งค่า › ถังขยะ)");
}
async function trashRestore(coll,row){
const d=Object.assign({},row); delete d._id; delete d._trash;
await DB.collection(coll).doc(row._id).set(d);
setFoot("กู้คืนแล้ว");
}
async function trashPurge(coll,id){ await DB.collection(coll).doc(id).delete(); }
let purgeRan=false;
async function autoPurgeTrash(){
if(purgeRan||!DB)return; purgeRan=true;
const old=trashAll().filter(({t})=>trashDays(t)>=TRASH_DAYS);
for(const {coll,t} of old){ try{ await trashPurge(coll,t._id); }catch(e){} }
if(old.length)setFoot("ล้างถังขยะที่เกิน "+TRASH_DAYS+" วันแล้ว "+old.length+" รายการ");
}
async function saveItem(data,id){ if(!DB)throw new Error("ยังไม่ได้เชื่อมต่อฐานข้อมูล"); if(data&&"_id" in data)delete data._id; return id?await DB.collection("items").doc(id).set(data):await DB.collection("items").add(data); }
async function hardRefresh(){
setFoot("กำลังรีเฟรช…");
try{ if(window.caches){ const ks=await caches.keys(); await Promise.all(ks.filter(k=>/skywork/i.test(k)).map(k=>caches.delete(k))); } }catch(e){}
try{ if(navigator.serviceWorker){ const rs=await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r=>r.update().catch(()=>{}))); } }catch(e){}
const u=new URL(location.href); u.searchParams.set("r",Date.now()); location.replace(u.toString());
}
const ZOOMS=[["85","เล็ก"],["90","กลาง (แนะนำ)"],["100","ปกติ"]];
const curZoom=()=>{try{return localStorage.getItem("sw-zoom")||"90";}catch(e){return "90";}};
function setZoom(v){ try{localStorage.setItem("sw-zoom",v);}catch(e){} const z=(+v||90)/100, r=document.documentElement; r.style.zoom=z; r.style.setProperty("--zf",z); }
const HLS=[["p","พาสเทล (ตามแบบอ้างอิง)","พื้นครีม การ์ดสีพาสเทลแยกตามหมวด ปุ่ม/เมนูที่เลือกเป็นสีดำมน ใช้ได้เฉพาะโหมดสว่าง"],["b","เรียบ มินิมอล","สีทึบเดียว ไม่มีไล่เฉด ไม่มีเงา"],["c","ขาว + ขอบบาง","การ์ดสีขาว ตัวเลขสีธีม ปุ่มพื้นอ่อน"],["a","แบบเดิม","ไล่เฉดเข้ม มีเงา"]];
const curHL=()=>{try{return localStorage.getItem("sw-hl")||"p";}catch(e){return "p";}};
function setHL(v){ try{localStorage.setItem("sw-hl",v);}catch(e){} document.documentElement.setAttribute("data-hl",v); applyTheme(); }
function setTb(hide){ document.documentElement.classList.toggle("tbh",!!hide); try{localStorage.setItem("sw-tbh",hide?"1":"0");}catch(e){} }
function renderNav(){
const bs=el("brandsub"); if(bs)bs.textContent="เวอร์ชัน "+APP_VERSION; const mv=el("mver"); if(mv)mv.textContent="v"+APP_VERSION;
el("nav").innerHTML=VIEWS.map(([k,l])=>`<button data-v="${k}" aria-current="${k===view}">${svg(ICON[k==="cal"?"cal":k])}<span>${l}</span></button>`).join("");
el("tabbar").innerHTML=TABS.map(k=>{const l=TABLABEL[k]||VIEWS.find(v=>v[0]===k)[1];
return `<button data-v="${k}" aria-current="${k===view}" title="${esc(VIEWS.find(v=>v[0]===k)[1])}">${svg(ICON[k],19)}<span>${l}</span></button>`;}).join("")
+`<button class="tbhide" id="tbtoggle" title="ซ่อนแถบเมนู" aria-label="ซ่อนแถบเมนู">${svg('<path d="M15 6l-6 6 6 6"/>',16)}</button>`;
const go=e=>{const b=e.target.closest("button");if(!b)return; if(b.id==="tbtoggle"){setTb(true);return;} if(!b.dataset.v)return; view=b.dataset.v;R.pq="";renderNav();render();window.scrollTo(0,0);};
el("nav").onclick=go; el("tabbar").onclick=go;
if(el("tbshow"))el("tbshow").onclick=()=>setTb(false);
const fb=el("aifab"); if(fb){ if(!fb.innerHTML)fb.innerHTML=svg(ICON.ai,24); fb.hidden=(view==="ai"); aiPopRender(); if(!fb._w){fb._w=1; fb.onclick=aiPopToggle;} }
["brandBtn","brandBtnM"].forEach(id=>{const n=el(id); if(!n||n._wired)return; n._wired=1;
n.onclick=hardRefresh;
n.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();hardRefresh();}};});
}
let LISTBOX={};
function regList(key,title,rows){ LISTBOX[key]={title,rows}; return `data-list="${esc(key)}"`; }
function openListBox(key){
const L=LISTBOX[key]; if(!L||!L.rows.length)return;
el("pdlgh").textContent=L.title;
const clk=r=>!!(r.id||r.tx||r.lg);
const anyClk=L.rows.some(clk);
let seenClk=false, seenStatic=false;
el("pdlgb").innerHTML=`<div class="list">${L.rows.map((r,i)=>{
let pre="";
if(clk(r)&&!seenClk){ seenClk=true; if(seenStatic)pre=`<div class="lsec">งาน / รายการที่นับรวมในหมวดนี้ · แตะเพื่อเปิดดูการ์ด</div>`; }
if(!clk(r)){ seenStatic=true; }
return pre+`<div class="li${clk(r)?"":" static"}"${clk(r)?` data-pick="${i}"`:""}>
<div class="ic" style="background:${r.c||"var(--line-2)"};color:${r.ic||"var(--ink-2)"}">${r.d||"—"}</div>
<div class="tx"><div class="t1">${esc(r.t1)}</div><div class="t2">${esc(r.t2||"")}</div></div>
<span class="pill ${r.pc||"s-wait"}">${esc(r.p||"แก้ไข")}</span>${clk(r)?`<span class="lchev">›</span>`:""}</div>`;}).join("")}</div>
${anyClk&&!seenStatic?`<div class="hint">แตะรายการเพื่อเปิดดู</div>`:""}`;
el("pdlgb").querySelectorAll("[data-pick]").forEach(n=>n.onclick=()=>{
const r=L.rows[+n.dataset.pick]; el("pdlg").close();
if(r.id){const t=items.find(x=>x._id===r.id); if(t)openCard(t);}
else if(r.tx){const x=ledger.find(v=>v._id===r.tx); if(x)openTxCard(x);}
else if(r.lg){const g=legal.find(x=>x._id===r.lg); if(g)openLegalCard(g);}
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
if(typeof ink!=="undefined"&&ink.note&&document.body.classList.contains("ink-on")){ return; }       // กำลังเขียนสมุด: ไม่วาดหน้าแอปข้างหลังซ้ำ (จะวาดใหม่ตอนปิดสมุด)
LISTBOX={};
if(LOADING){ el("view").innerHTML=`<div class="head"><div><h1>กำลังโหลดข้อมูล…</h1><div class="sub">กำลังดึงข้อมูลล่าสุดจากระบบ · ${syncChip()}</div></div></div>
<div class="dash"><div class="card hero span2 sk" style="height:150px"></div><div class="card stat sk" style="height:150px"></div><div class="card stat sk" style="height:150px"></div>
<div class="card span4 sk" style="height:220px"></div></div>`; paintSync(); return; }
el("view").innerHTML={home,all,matrix:matrixView,gaps:gapsView,meet,train,dsd:dsdView,legal:legalView,idx:idxView,note:noteView,cal:calView,budget,exec:execView,ai:aiView,pipeline,set:setView}[view]();
paintSync(); wire(); if(AI.open)aiPopRender(); pushPlanKick();
}
function header(title,sub,btn=true){
const lab=(view==="train"||view==="dsd")?"เพิ่มหลักสูตร":view==="meet"?"เพิ่มการประชุม":"เพิ่มงาน";
return `<div class="head"><div><h1>${title}</h1><div class="sub">${sub} · ${syncChip()}</div></div>
${btn?`<button class="btn addbtn" id="add">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>${lab}</span></button>`:""}</div>`;
}
// occD = วันที่ที่กำลังดูอยู่ (เช่นกดวันในปฏิทิน) → งานซ้ำจะแสดงสถานะของ "วันนั้น" ไม่ใช่สถานะรวม
function liRow(t,showDate,occD){
const ms=monthsOf(t), d=t.date?fmtDate(t.date).split(" "):null;
const OC=(occD&&rr(t))?occD:null, ost=OC?occStat(t,OC):null;
return `<div class="li" data-id="${t._id}"${OC?` data-occ="${isoOf(OC)}"`:""}>
<div class="ic" style="background:var(--line-2);color:${OC?occColor(t,OC):sColor(t.status)}">${(()=>{const n=OC?OC:(rr(t)?dueDate(t):null);
if(n)return n.getDate()+"<br>"+MTH[n.getMonth()];
return d?`${d[0]}<br>${d[1]}`:(ms.length>1?"ประจำ":"—");})()}</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2">${(()=>{const cc=crsCodeOf(t);return cc?`<b style="font-family:var(--mono);color:var(--accent)">${esc(cc)}</b>${t.batch?" "+esc(t.batch):""} · `:"";})()}${quadOf(t)?`<b class="qtag q-${quadOf(t)}">${quadOf(t).slice(1)} ${esc(quadInfo(quadOf(t))[1])}</b> `:""}${t.tag?`<b style="color:${tagColor(t.tag)||itemColor(t)}">● ${esc(t.tag)}</b> · `:""}${rruleText(t)?esc(rruleText(t))+" · ":""}<span class="gdot" style="background:${gTagColor(t.track)}"></span>${esc(gLabel(t.track))}${t.company?" · "+esc(cLabel(t.company)):""}${t.owner?" · "+esc(t.owner):""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
${OC?(()=>{const od=OC<new Date(new Date().setHours(0,0,0,0))&&isOpenStatus(ost);
return `<span class="pill ${od?"s-over":sCls(ost)}">${esc(od?"ค้างรอบนี้":ost)}</span>`+(ost===STATUS_CANCEL?"":`<button class="okbtn${ost===STATUS_DONE?" on":""}" data-done="${t._id}|${isoOf(OC)}" title="${ost===STATUS_DONE?"ยกเลิกการปิดรอบ ":"ปิดรอบวันที่ "}${OC.getDate()} ${MTH[OC.getMonth()]}">${svg(ICON.check,15)}</button>`);})():(()=>{const S=occState(t);
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
function homeQ1(){
const mi=matrixItems().filter(inScope), q1=mi.filter(t=>quadOf(t)==="q1").sort((x,y)=>mxDl(x).n-mxDl(y).n), un=mi.filter(t=>!quadOf(t)).length;
const cn=k=>mi.filter(t=>quadOf(t)===k).length;
const late=q1.filter(t=>mxDl(t).n<0).length;
return `<div class="card span4 mxhome"><h2><span>ทำเลยวันนี้ <small>ช่อง 1 · สำคัญ + เร่งด่วน</small></span>
<span class="mxchips">${QUADS.map((x,i)=>`<i class="mc${i+1}"${tipAttr(i+1+". "+x[1]+" · "+x[2]+" — "+cn(x[0])+" งาน",tipList(mi.filter(t=>quadOf(t)===x[0]),t=>t.title,5))}>${i+1} · ${cn(x[0])}</i>`).join("")}${un?`<i class="mc0"${tipAttr("ยังไม่จัดลำดับ — "+un+" งาน",tipList(mi.filter(t=>!quadOf(t)),t=>t.title,5),"ไปจัดที่หน้า Matrix งาน")}>? · ${un}</i>`:""}</span></h2>
${q1.length?`<div class="mxlist" style="max-height:none">${q1.slice(0,5).map(t=>{const dl=mxDl(t);return `<div class="mxc" data-id="${t._id}"><div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2"><span class="${dl.cls}">${esc(dl.txt)}</span>${t.owner?`<span>· ${esc(t.owner)}</span>`:""}</div></div>`;}).join("")}</div>
<div class="sub" style="margin-top:8px">${q1.length>5?`และอีก ${q1.length-5} งาน · `:""}${late?`เลย Deadline แล้ว ${late} งาน · `:""}<a class="lklink" ${jump("matrix")} style="cursor:pointer">เปิด Matrix งาน →</a></div>`
:`<div class="sub" style="padding:6px 0 2px">${un?`ยังไม่มีงานในช่อง 1 · มี <b>${un} งาน</b> ที่ยังไม่ได้จัดลำดับ — `:"ยังไม่มีงานในช่อง 1 ✨ · "}<a class="lklink" ${jump("matrix")} style="cursor:pointer">เปิด Matrix งาน →</a></div>`}</div>`;
}
function home(){
const now=new Date();
const scoped=items.filter(inScope);
const A=scoped.filter(t=>t.track!=="idea"&&t.status!==STATUS_CANCEL);
const cnt=s=>A.filter(t=>t.status===s).length;
const done=cnt("เสร็จสิ้น"), run=cnt("กำลังดำเนินการ"), wait=cnt("รอดำเนินการ");
const cancelled=scoped.filter(t=>t.status===STATUS_CANCEL).length;
const bud=scoped.reduce((s,t)=>s+budgetOf(t),0), act=scoped.reduce((s,t)=>s+(+t.actual||0),0);
const over=items.filter(t=>budgetOf(t)>0&&(+t.actual||0)>budgetOf(t));
const up=items.filter(t=>t.date&&new Date(t.date)>=new Date(now.toDateString())&&isOpenStatus(t.status))
.sort((a,b)=>a.date<b.date?-1:1).slice(0,6);
const pct=A.length?Math.round(done/A.length*100):0;
const byMonth=MTH.map((_,i)=>items.filter(t=>monthsOf(t).includes(i+1)).length);
const byMonthTip=MTH.map((_,i)=>tipList(items.filter(t=>monthsOf(t).includes(i+1)),t=>t.title+(t.status?" · "+t.status:"")));
const stParts=[{n:"เสร็จสิ้น",v:done,c:"var(--ok)",tip:tipList(A.filter(t=>t.status==="เสร็จสิ้น"))},{n:"กำลังดำเนินการ",v:run,c:"var(--run)",tip:tipList(A.filter(t=>t.status==="กำลังดำเนินการ"))},{n:"รอดำเนินการ",v:wait,c:"var(--wait)",tip:tipList(A.filter(t=>t.status==="รอดำเนินการ"))}];
const stCancel={n:"ยกเลิก",v:cancelled,c:"var(--ink-3)",tip:tipList(scoped.filter(t=>t.status===STATUS_CANCEL))};
return header("สวัสดีค่ะ วิม 👋","Sky Work · ทุกงานรวมที่เดียว ซิงก์ทุกเครื่อง")+
`<div class="toolbar">${scopeBar("sc1")}</div>`+bkBanner()+
(()=>{const lw=items.filter(t=>isLawItem(t)&&isOpenStatus(t.status)&&(()=>{const d=dueDate(t);return d&&daysTo(d)<0;})());
return lw.length?`<div class="banner bad" ${regList("hLaw","งานบังคับตามกฎหมายที่เลยกำหนดแล้ว",lw.map(t=>{const d=dueDate(t);return {id:t._id,
t1:t.title,t2:`${(t.type||"").trim()||gLabel(t.track)}${t.company?" · "+cLabel(t.company):""} · ตั้งธงจาก${lawSrc(t)}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--over-soft)",ic:"var(--over)",
p:"เลย "+(-daysTo(d))+" วัน",pc:"s-over"};}))}>${svg(ICON.legal,19)} ⚖︎ งาน<b>บังคับตามกฎหมาย</b> ${lw.length} รายการเลยกำหนดแล้วและยังไม่ปิดงาน</div>`:"";})()+
dsdAnnualBanner()+
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
budBanner(THISYEAR)+
`<div class="dash">
${homeQ1()}
<div class="card hero span2"${tipAttr("ความคืบหน้า · "+scopeLabel()+" · "+pct+"%","เสร็จสิ้น|"+done+" งาน","กำลังดำเนินการ|"+run+" งาน","รอดำเนินการ|"+wait+" งาน",cancelled?"ยกเลิก|"+cancelled+" งาน (ไม่นับ)":"","คิดจาก งานเสร็จ ÷ งานทั้งหมด ไม่รวมงานที่ยกเลิกและไอเดีย")}><div class="lab">ความคืบหน้า · ${scopeLabel()}</div>
<div class="big">${pct}%</div>
<div class="meta"><span>เสร็จแล้ว ${done} งาน</span><span>เหลืออีก ${A.length-done} งาน</span></div>
<div class="prog"><i style="width:${pct}%"></i></div></div>
<div class="card stat" ${jump("all",{F:{status:"กำลังดำเนินการ"}})}${tipAttr("กำลังดำเนินการ · "+run+" งาน",tipList(A.filter(t=>t.status==="กำลังดำเนินการ"),t=>t.title+(t.owner?" · "+t.owner:"")),wait?"รอเริ่มอีก "+wait+" งาน":"")}><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> กำลังดำเนินการ</div>
<div class="v">${run}</div><div class="d">รอเริ่มอีก ${wait} งาน · แตะเพื่อดูรายการ</div></div>
<div class="card stat" ${jump("budget")}${tipAttr("งบคงเหลือ · "+scopeLabel(),"งบที่ตั้งไว้|"+baht(bud)+" ฿","ใช้จริง|"+baht(act)+" ฿","คงเหลือ|"+(bud-act<0?"เกิน ":"")+baht(Math.abs(bud-act))+" ฿","ใช้ไป|"+(bud?Math.round(act/bud*100):0)+"%",over.length?"มี "+over.length+" งานใช้เกินงบของงานนั้น":"","(รวมงบ GL หลัก+รอง ของงานในช่วงที่เลือก)")}><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> งบคงเหลือ · ${scopeLabel()}</div>
<div class="v">${baht(bud-act)}</div><div class="d">ใช้ไป ${baht(act)} จาก ${baht(bud)}</div>
<div class="bar"><i class="${act>bud?"hot":""}" style="width:${bud?Math.min(100,act/bud*100):0}%"></i></div></div>
<div class="card span4"><h2>สรุปทุกหมวด <small>แตะการ์ดเพื่อไปดูที่มาของตัวเลข · ${scopeLabel()}</small></h2>
<div class="modgrid">
${(()=>{
const ms=items.filter(t=>isMeet(t)&&inScope(t)), pr=prepDue(7);
const tr=items.filter(t=>isTrain(t)&&inScope(t)&&t.status!==STATUS_CANCEL);
const pax=tr.reduce((n,t)=>n+(+t.pax||0),0);
const dsdWait=items.filter(t=>isTrain(t)&&t.dsd==="รอยื่น"&&t.status!==STATUS_CANCEL).length;
const lgLate=legal.filter(L=>legalState(L).k==="late").length;
const lgSoon=legal.filter(L=>legalState(L).k==="soon").length;
const lgNo=legal.filter(L=>legalState(L).k==="noperson").length;
const need=dsdList(R.year).map(c=>dsdCalc(dsdRec(c.key,R.year)).need).reduce((a,b)=>a+b,0);
const card=(icon,name,big,sub,go,warn)=>`<div class="mod${warn?" warn":""}" ${go}${tipAttr(name+" · "+String(big).replace(/<[^>]+>/g,""),String(sub).replace(/<[^>]+>/g,""),"แตะเพื่อเปิดหน้านี้")}>
<div class="modh"><span class="ic">${svg(icon,16)}</span>${name}</div>
<div class="modv">${big}</div><div class="mods">${sub}</div></div>`;
return [
card(ICON.all,"งานทั้งหมด",A.length,`ค้าง ${A.length-done} · เสร็จ ${done}${cancelled?" · ยกเลิก "+cancelled:""}`,jump("all")),
card(ICON.meet,"การประชุม",ms.length,pr.length?`ต้องเตรียมข้อมูล ${pr.length} รายการ`:"ไม่มีที่ต้องเตรียม",jump("meet"),pr.length),
card(ICON.train,"ฝึกอบรม",uniqCourses(tr)+" หลักสูตร",`${tr.length} รุ่น · ผู้เข้าอบรม ${baht(pax)} คน${dsdWait?" · รอยื่นกรมพัฒฯ "+dsdWait:""}`,jump("train"),dsdWait),
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
${donut(stParts,A.length,"งานทั้งหมด")}
<div class="dlist">
<div ${jump("all",{F:{status:"เสร็จสิ้น"}})}${donutTip(stParts,stParts[0])}><i style="background:var(--ok)"></i>เสร็จสิ้น<b>${done}</b></div>
<div ${jump("all",{F:{status:"กำลังดำเนินการ"}})}${donutTip(stParts,stParts[1])}><i style="background:var(--run)"></i>กำลังดำเนินการ<b>${run}</b></div>
<div ${jump("all",{F:{status:"รอดำเนินการ"}})}${donutTip(stParts,stParts[2])}><i style="background:var(--wait)"></i>รอดำเนินการ<b>${wait}</b></div>
${cancelled?`<div ${jump("all",{F:{status:"ยกเลิก"}})}${tipAttr("ยกเลิก · "+cancelled+" งาน (ไม่นับในโดนัท)",stCancel.tip)}><i style="background:var(--ink-3)"></i>ยกเลิก<b>${cancelled}</b></div>`:""}</div></div></div>
<div class="card span2"><h2>จำนวนงานรายเดือน <small>ทั้งปี ${R.year+543}</small></h2>
${bars(byMonth,MTH,v=>v||"",now.getMonth(),byMonthTip,"งาน","งานทั้งปี")}
<div class="hint" style="margin:6px 0 0">เลื่อนเมาส์/แตะที่แท่งเพื่อดูว่ามีงานอะไรบ้าง · งานประจำที่เกิดหลายเดือนนับซ้ำทุกเดือนที่มี</div></div>
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
(!F.q||(t.title+" "+(t.note||"")+" "+(t.why||"")+" "+(t.how||"")+" "+(t.owner||"")+" "+(t.code||"")+" "+glLabel(glKeyOf(t.gl1))).toLowerCase().includes(F.q.toLowerCase())))
.sort((a,b)=>(a.date||"9999")<(b.date||"9999")?-1:1);
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const mobile=matchMedia("(max-width:820px)").matches;
// ---- แบ่งกลุ่มการแสดงผล ----
const timeBucket=t=>{
if(R.scope==="week"){
const d=rr(t)?weekDays().find(x=>occursOn(t,x)):(t.date?new Date(t.date):null);
return d?{k:isoOf(d),lab:"วัน"+DAYTH[d.getDay()]+" "+d.getDate()+" "+MTH[d.getMonth()],c:d.toDateString()===new Date().toDateString()?"var(--accent)":""}
:{k:"zz",lab:"ไม่ระบุวัน",c:""};}
if(R.scope==="month"){
const days=rr(t)?occDays(t,R.year,R.month):(t.date&&new Date(t.date).getMonth()===R.month&&new Date(t.date).getFullYear()===R.year?[new Date(t.date).getDate()]:[]);
if(!days.length)return {k:"zz",lab:"ไม่ระบุวันในเดือนนี้",c:""};
const w=Math.min(5,Math.ceil(days[0]/7));
return {k:"w"+w,lab:"สัปดาห์ที่ "+w,sub:"วันที่ "+((w-1)*7+1)+"–"+(w===5?"สิ้นเดือน":w*7),c:""};}
if(rr(t))return {k:"zr",lab:"งานประจำ · เกิดซ้ำ",sub:"ไม่ผูกกับเดือนใดเดือนหนึ่ง",c:""};
const ms=monthsOf(t); if(!ms.length)return {k:"zz",lab:"ยังไม่ได้ลงวันที่",c:""};
return {k:String(ms[0]).padStart(2,"0"),lab:MTHFULL[ms[0]-1],c:ms[0]-1===new Date().getMonth()&&R.year===THISYEAR?"var(--accent)":""};};
const bucket=t=>{
if(F.grp==="track"){const g=groups.find(x=>x.key===t.track);
return {k:g?String(groups.indexOf(g)).padStart(3,"0"):"zzz",lab:g?g.label:"ยังไม่ระบุกลุ่มงาน",c:g?gTagColor(g.key):""};}
if(F.grp==="status"){const i=STATUS.indexOf(t.status);
return {k:String(i<0?9:i),lab:t.status||"ไม่ระบุสถานะ",c:sColor(t.status)};}
if(F.grp==="company"){const c=companies.find(x=>x.key===t.company);
return {k:c?String(companies.indexOf(c)).padStart(3,"0"):"zzz",lab:c?c.label:"ยังไม่ระบุบริษัท",c:""};}
if(F.grp==="type")return {k:(t.type||"zzz").trim()||"zzz",lab:(t.type||"").trim()||"ยังไม่ระบุประเภท",c:""};
return timeBucket(t);};
// ในแต่ละกลุ่ม เรียงให้ประเภทเดียวกันอยู่ติดกัน (ยกเว้นแบ่งตามช่วงเวลา ที่ต้องเรียงตามวัน)
const tyOrder=types();
const tyRank=t=>{const i=tyOrder.indexOf((t.type||"").trim()); return i<0?999:i;};
const dayKey=t=>t.date||"9999";
const subSort=(a,b)=>{
if(F.grp==="time"||F.grp==="type")return dayKey(a)<dayKey(b)?-1:dayKey(a)>dayKey(b)?1:0;
const r=tyRank(a)-tyRank(b); if(r)return r;
const n=(a.type||"").localeCompare(b.type||"","th"); if(n)return n;
return dayKey(a)<dayKey(b)?-1:1;};
const secs=[];
if(F.grp){const m=new Map();
list.forEach(t=>{const b=bucket(t); if(!m.has(b.k))m.set(b.k,{...b,rows:[]}); m.get(b.k).rows.push(t);});
secs.push(...[...m.values()].sort((a,b)=>String(a.k)<String(b.k)?-1:1));
secs.forEach(g=>{g.rows.sort(subSort);
g.kinds=[...new Set(g.rows.map(t=>(t.type||"").trim()||"—"))];});}
const money=arr=>arr.reduce((a,t)=>a+budgetOf(t),0);
const hd=g=>`${g.c?`<i style="background:${g.c}"></i>`:""}${esc(g.lab)}${g.sub?` <span style="color:var(--ink-3);font-weight:400;font-size:12px">${esc(g.sub)}</span>`:""}`;
const meta=g=>`${(g.kinds&&g.kinds.length>1&&F.grp!=="type")?g.kinds.length+" ประเภท · ":""}${g.rows.length} งาน${money(g.rows)?" · งบ "+baht(money(g.rows))+" ฿":""}`;
const GRPS=[["time","ช่วงเวลา"],["track","กลุ่มงาน"],["type","ประเภทงาน"],["status","สถานะ"],["company","บริษัท"],["","ไม่แบ่ง"]];
const row=(t,sep)=>`<tr data-id="${t._id}"${sep?' class="tysep"':""}>
<td><span class="tag">${esc(t.type||"—")}</span></td>
<td><div style="font-weight:600">${esc(t.title)}${stkHtml(t)}</div>
${(()=>{const cc=crsCodeOf(t); return cc?`<div class="t-note"><b style="font-family:var(--mono);color:var(--accent)">${esc(cc)}</b>${t.batch?" · "+esc(t.batch):""}</div>`:"";})()}
${(()=>{const k=kindOfItem(t);
if(k==="proj"){const n=(t.ms||[]).length,d=(t.ms||[]).filter(x=>x&&x.d).length;
const pg=(t.prog!==undefined&&t.prog!==null&&t.prog!=="")?+t.prog:(n?Math.round(d/n*100):null);
return pg===null&&!n?"":`<div class="t-note">ความคืบหน้า <b>${pg||0}%</b>${n?` · ขั้นตอน ${d}/${n}`:""}${t.pend?" · เสร็จ "+fmtDate(t.pend):""}</div>`;}
if(k==="act"){const p=+t.apaxreal||0,g=+t.apax||0,n=(t.aprep||[]).length,d=(t.aprep||[]).filter(x=>x&&x.d).length;
return (p||g||n)?`<div class="t-note">${(p||g)?`ผู้เข้าร่วม ${p?baht(p):"—"}${g?" / "+baht(g):""} คน`:""}${n?(p||g?" · ":"")+`ของที่เตรียม ${d}/${n}`:""}</div>`:"";}
return "";})()}
${t.note?`<div class="t-note">${esc(t.note)}</div>`:""}${w5Line(t)}</td>
<td>${esc(t.company?cLabel(t.company):"—")}</td>
<td>${gChip(t.track)}</td>
<td class="num">${rr(t)?esc(rruleText(t)):(t.date?fmtDate(t.date):esc(t.recurring||"—"))}</td>
<td>${esc(t.owner||"—")}</td>
<td class="num">${budgetOf(t)?baht(budgetOf(t)):"—"}</td>
<td class="num"${(+t.actual||0)>budgetOf(t)&&budgetOf(t)?' style="color:var(--over);font-weight:600"':""}>${t.actual?baht(t.actual):"—"}</td>
<td>${(()=>{const S=rr(t)?occState(t):null; return S?`<span class="pill ${S.cls}" title="สถานะรอบที่ใกล้ที่สุด — สถานะรายวันดูที่ปฏิทิน/การ์ด">${esc(S.label)}</span>`:`<span class="pill ${sCls(t.status)}">${esc(t.status)}</span>`;})()}</td></tr>`;
const table=body=>`<div class="tblwrap"><table>
<thead><tr><th>ประเภท</th><th>งาน</th><th>บริษัท</th><th>กลุ่ม</th><th>เวลา</th><th>ผู้รับผิดชอบ</th><th style="text-align:right">งบ</th><th style="text-align:right">ใช้จริง</th><th>สถานะ</th></tr></thead>
<tbody>${body}</tbody></table>
${list.length?"":`<div class="card"><div class="empty">ไม่พบงานตามเงื่อนไขนี้</div></div>`}</div>`;
return header("งานทั้งหมด",`${list.length} จาก ${items.length} รายการ${F.grp&&secs.length?" · "+secs.length+" กลุ่ม":""} · แตะเพื่อแก้ไข`)+
`<div class="toolbar">${scopeBar("sc1")}</div>
<div class="toolbar filters">
<input type="search" id="q" placeholder="ค้นหางาน / ผู้รับผิดชอบ" value="${esc(F.q)}">
<select id="fl-company">${opt([["","ทุกบริษัท"],...visible(companies).map(c=>[c.key,c.label])],F.company)}</select>
<select id="fl-track">${opt([["","ทุกกลุ่ม"],...visible(groups).map(g=>[g.key,g.label])],F.track)}</select>
<select id="fl-type">${(()=>{
const base=F.track?typesFor(F.track):types();
const used=[...new Set(items.filter(t=>!F.track||t.track===F.track).map(t=>(t.type||"").trim()).filter(Boolean))];
const l2=[...new Set([...base,...used])];
return opt([["",F.track?"ทุกประเภทในกลุ่มนี้":"ทุกประเภท"],...l2.map(t=>[t,t])],l2.includes(F.type)?F.type:"");})()}</select>
<select id="fl-status">${opt([["","ทุกสถานะ"],...STATUS.map(s=>[s,s])],F.status)}</select>
</div>
<div class="toolbar" style="margin-top:-6px">
<span style="font-size:13px;color:var(--ink-3)">แบ่งกลุ่มตาม</span>
<div class="seg" id="grpseg">${GRPS.map(([v,l])=>`<button data-grp="${v}" aria-pressed="${F.grp===v}">${l}</button>`).join("")}</div>
</div>`+
(mobile
? (F.grp&&secs.length
 ? `<div class="card">${secs.map(g=>`<div class="grphead">${hd(g)}<b>${meta(g)}</b></div>
<div class="list">${g.rows.map(t=>liRow(t,true)).join("")}</div>`).join("")}</div>`
 : `<div class="card"><div class="list">${list.map(t=>liRow(t,true)).join("")||`<div class="empty">ไม่พบงานตามเงื่อนไขนี้</div>`}</div></div>`)
: (F.grp&&secs.length
 ? table(secs.map(g=>`<tr class="grph"><td colspan="9">${hd(g)}<span class="n">${meta(g)}</span></td></tr>`
+g.rows.map((t,i)=>row(t,i>0&&F.grp!=="type"&&F.grp!=="time"&&(t.type||"")!==(g.rows[i-1].type||""))).join("")).join(""))
 : table(list.map(row).join(""))));
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
const dtD=new Date(y,m,d), stOn=t=>occStat(t,dtD);
const dayTip=tipAttr(d+" "+MTHFULL[m]+" "+(y+543)+(ts.length?" · "+ts.length+" งาน":" · ไม่มีงาน"),ts.length?["เสร็จสิ้น|"+ts.filter(t=>stOn(t)===STATUS_DONE).length,"กำลังดำเนินการ|"+ts.filter(t=>stOn(t)==="กำลังดำเนินการ").length,"รอดำเนินการ|"+ts.filter(t=>stOn(t)==="รอดำเนินการ").length,ts.some(t=>stOn(t)===STATUS_CANCEL)?"ยกเลิก|"+ts.filter(t=>stOn(t)===STATUS_CANCEL).length:""]:"",tipList(ts,t=>t.title+" · "+stOn(t),6));
cells.push(`<div class="day${isToday?" today":""}${sel?" sel":""}" data-day="${d}"${dayTip}>
<span class="dn">${d}</span>
<span class="dots">${ts.slice(0,4).map(t=>{const dt=new Date(y,m,d);const cl=dotCol(t,calColor()==="group"?gTagColor(t.track):(rr(t)?occColor(t,dt):itemColor(t)));
return `<i style="background:${cl}"></i>`;}).join("")}</span>
${ts.length>4?`<span class="more">+${ts.length-4}</span>`:""}</div>`);
}
const selTasks=R.selDay?tasksOnDay(y,m,R.selDay):[];
return header("ปฏิทิน","แตะวันที่เพื่อดูงานของวันนั้น · จุดสีคือสถานะงาน")+
`<div class="toolbar">
<div class="seg" id="calmode">
<button data-cm="month" aria-pressed="${R.calMode==="month"}">รายเดือน</button>
<button data-cm="year" aria-pressed="${R.calMode==="year"}">ทั้งปี</button></div>
<div class="seg" id="calcol" title="สีจุดในปฏิทิน"><button data-cc="" aria-pressed="${calColor()===""}">สีตามสถานะ</button>
<button data-cc="group" aria-pressed="${calColor()==="group"}">สีตามกลุ่มงาน</button>
<button data-cc="matrix" aria-pressed="${calColor()==="matrix"}">สีตาม Matrix</button></div>
${R.calMode==="year"?yearSel("yrSel2"):""}
${R.calMode==="month"?`<div class="seg"><button id="pm">‹</button>
<select id="calMonth" style="border:0;background:var(--card);border-radius:999px;padding:6px 14px;font-weight:600">${MTHFULL.map((x,i)=>`<option value="${i}"${i===m?" selected":""}>${x} ${y+543}</option>`).join("")}</select>
<button id="nm">›</button></div>${yearSel("yrSel2")}`:""}
</div>`+
(R.calMode==="month"
? `<div class="dash calw">
<div class="card span3"><h2>${MTHFULL[m]} ${y+543} <small>${items.filter(t=>occDays(t,y,m).length).length} งานในเดือนนี้</small></h2>
<div class="mcal">${DOW.map(d=>`<div class="dh">${d}</div>`).join("")}${cells.join("")}</div>
${calColor()==="matrix"
?`<div class="legend" style="margin-top:14px">${QUADS.map((x,i)=>`<span><i style="background:${QCOL[x[0]]}"></i>${i+1} ${x[1]}</span>`).join("")}<span><i style="background:var(--line)"></i>ยังไม่จัดลำดับ</span></div>`
:calColor()==="group"
?`<div class="legend" style="margin-top:14px">${visible(groups).map(g=>`<span><i style="background:${gTagColor(g.key)}"></i>${esc(g.label)}</span>`).join("")}</div>`
:`<div class="legend" style="margin-top:14px">
<span><i style="background:var(--ok)"></i>เสร็จสิ้น</span>
<span><i style="background:var(--run)"></i>กำลังดำเนินการ</span>
<span><i style="background:var(--wait)"></i>รอดำเนินการ</span>
<span><i style="background:var(--over)"></i>ค้างรอบที่ผ่านมา</span></div>`}</div>
<div class="card calpanel">
<h2>${R.selDay?`วันที่ ${R.selDay} ${MTH[m]}`:"งานประจำเดือนนี้"}</h2>
<div class="list">${
R.selDay
? (selTasks.map(t=>liRow(t,false,new Date(y,m,R.selDay))).join("")||`<div class="empty">วันนี้ไม่มีงานที่กำหนดไว้<br><span style="font-size:12.5px">กด “เพิ่มงาน” เพื่อใส่งานใหม่</span></div>`)
: (recurring.map(t=>liRow(t)).join("")||`<div class="empty">ไม่มีงานประจำในเดือนนี้</div>`)}</div>
${R.selDay?`<div class="addg" style="margin-top:12px">
<button class="btn sm" id="addOnDay">${svg('<path d="M12 5v14M5 12h14"/>',16)}เพิ่มงานวันที่ ${R.selDay} ${MTH[m]}</button>
<button class="btn ghost sm" id="clearDay">ดูงานประจำเดือนแทน</button></div>`:""}
</div></div>`
: yearGrid());
}
// สถานะของงานเฉพาะ "เดือนนั้น" — งานที่เกิดซ้ำต้องดูรายรอบ ไม่ใช่สถานะรวม
function monthState(t,y,m){
if(t.status===STATUS_CANCEL)return {c:sColor(STATUS_CANCEL),n:"ยกเลิก"};
if(!rr(t))return {c:sColor(t.status),n:t.status};
const days=occDays(t,y,m);
if(!days.length)return {c:sColor(t.status),n:t.status};
const today=new Date(); today.setHours(0,0,0,0);
const ds=days.map(i=>new Date(y,m,i));
const done=ds.filter(d=>occDone(t,d)).length;
const cx=ds.filter(d=>occCancel(t,d)).length;
const open=ds.filter(d=>!occDone(t,d)&&!occSkip(t,d)&&!occCancel(t,d));
const late=open.filter(d=>d<today).length;
if(!open.length)return {c:sColor(done?STATUS_DONE:STATUS_CANCEL),n:done?"ปิดครบ "+done+" รอบ"+(cx?" · ยกเลิก "+cx:""):(cx?"ยกเลิกทุกรอบ":"งดทุกรอบ")};
if(late)return {c:"var(--over)",n:"ค้าง "+late+" รอบ"+(done?" · ปิดแล้ว "+done:"")+(cx?" · ยกเลิก "+cx:"")};
if(done)return {c:sColor("กำลังดำเนินการ"),n:"ปิดแล้ว "+done+"/"+ds.length+" รอบ"};
return {c:sColor("รอดำเนินการ"),n:"ยังไม่ถึงรอบ ("+ds.length+" รอบ)"};
}
function yearGrid(){
const thisYear=new Date().getFullYear();
const now=(R.year===thisYear)?new Date().getMonth()+1:0;
const list=items.filter(t=>monthsOf(t).length&&!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==R.year))
.sort((a,b)=>monthsOf(a)[0]-monthsOf(b)[0]);
const head=`<div class="mh" style="text-align:left">งาน</div>${MTH.map((x,i)=>`<div class="mh${i+1===now?" now":""}">${x}</div>`).join("")}`;
// แถวสรุปจำนวนงานรายเดือน (ทุกหมวดรวมกัน) ใต้หัวตาราง
const totRow=`<div class="msum" style="text-align:left">รวมทุกหมวด <span>${list.length} งาน</span></div>`+
MTH.map((_,i)=>{const n=list.filter(t=>monthsOf(t).includes(i+1)).length;
const L=list.filter(t=>monthsOf(t).includes(i+1));
return `<div class="msum${i+1===now?" now":""}"${tipAttr(MTHFULL[i]+" · "+n+" งาน",n?["เสร็จสิ้น|"+L.filter(t=>t.status===STATUS_DONE).length,"กำลังดำเนินการ|"+L.filter(t=>t.status==="กำลังดำเนินการ").length,"รอดำเนินการ|"+L.filter(t=>t.status==="รอดำเนินการ").length,tipList(L,t=>t.title+" · "+t.status,8)]:"ไม่มีงาน")}>${n||"—"}</div>`;}).join("");
// แยกตามกลุ่มงาน: แสดงทุกกลุ่มที่ตั้งไว้ (รวมกลุ่มที่ยังไม่มีงาน) + กองงานที่ไม่มีกลุ่ม/กลุ่มถูกลบ
const orphan=list.filter(t=>!t.track||!groups.some(g=>g.key===t.track));
const buckets=[...groups.map(x=>[x.label,x.key,x.hidden]),...(orphan.length?[["ยังไม่ระบุกลุ่มงาน","__none__",false]]:[])];
const rows=buckets.map(([name,key,hid])=>{
const g=(key==="__none__")?orphan:list.filter(t=>t.track===key);

return `<div class="cgroup${g.length?"":" zero"}"><span class="tagdot" style="background:${gTagColor(key)};width:10px;height:10px;display:inline-block;margin-right:6px"></span>${esc(name)}${hid?' <small style="color:var(--ink-3)">· ซ่อนอยู่</small>':""} <span>${g.length?g.length:"ยังไม่มีงาน"}</span></div>`+
MTH.map((_,i)=>`<div class="cgroup gcell${i+1===now?" now":""}"${(()=>{const L=g.filter(t=>monthsOf(t).includes(i+1));return L.length?tipAttr(name+" · "+MTHFULL[i]+" · "+L.length+" งาน",tipList(L,t=>t.title+" · "+t.status,8)):"";})()}>${(()=>{const n=g.filter(t=>monthsOf(t).includes(i+1)).length;return n||"";})()}</div>`).join("")+
g.map(t=>{const ms=monthsOf(t);return `<div class="cname" data-id="${t._id}">${esc(t.title)}</div>`+
MTH.map((_,i)=>`<div class="cell${i+1===now?" now":""}">${ms.includes(i+1)
?(()=>{const S=monthState(t,R.year,i);
return `<span class="mark"${tipAttr(t.title,"กลุ่มงาน|"+gLabel(t.track),MTHFULL[i]+"|"+S.n,"สถานะงาน|"+t.status,t.owner?"ผู้รับผิดชอบ|"+t.owner:"")}>
<i class="mdot" style="background:${S.c}"></i><i class="mbar" style="background:${dotCol(t,gTagColor(t.track))}"></i></span>`;})():""}</div>`).join("");}).join("");
}).join("");
return `<div class="card">
<div class="legend">
<span style="color:var(--ink-3)">จุดกลม = สถานะ · ขีด = กลุ่มงาน:</span>
<span><i style="background:var(--ok)"></i>เสร็จสิ้น</span>
<span><i style="background:var(--run)"></i>กำลังดำเนินการ</span>
<span><i style="background:var(--wait)"></i>รอดำเนินการ</span>
<span style="margin-left:auto;color:var(--ink-3)">แยกตามกลุ่มงาน · ${groups.length} กลุ่ม · ${list.length} งานในปี ${R.year+543}</span></div>
${(()=>{const gs=visible(groups);
return gs.length?`<div class="legend" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line-2)">
<span style="color:var(--ink-3)">สีของกลุ่มงาน:</span>${gs.map(g=>`<span><i style="background:${gTagColor(g.key)}"></i>${esc(g.label)}</span>`).join("")}</div>`:"";})()}
${(()=>{const tg=[...new Set(list.map(t=>(t.tag||"").trim()).filter(Boolean))];
return tg.length?`<div class="legend" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line-2)">${tg.map(n=>`<span><i style="background:${tagColor(n)||"var(--ink-3)"}"></i>${esc(n)}</span>`).join("")}</div>`:"";})()}
<div class="cal"><div class="calgrid">${head}${totRow}${rows||`<div style="grid-column:1/-1"><div class="empty">ไม่มีงานในปีนี้</div></div>
`}</div></div></div>
${(()=>{const all=items.filter(t=>!isSysRow(t));
const noDate=all.filter(t=>!monthsOf(t).length).length;
const other=all.filter(t=>monthsOf(t).length&&t.date&&!rr(t)&&new Date(t.date).getFullYear()!==R.year).length;
const cancel=list.filter(t=>t.status===STATUS_CANCEL).length;
return `<div class="hint" style="display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center">
<b>ทั้งหมด ${all.length} งาน</b>
<span>· แสดงในปี ${R.year+543} <b>${list.length}</b></span>
${other?`<span>· อยู่ปีอื่น <b>${other}</b> <button class="lklink" data-goyear="1" style="border:0;background:none;padding:0;font:inherit;cursor:pointer">เปลี่ยนปีด้านบนเพื่อดู</button></span>`:""}
${noDate?`<span>· <b>${noDate}</b> งานยังไม่ได้ใส่วันที่/รอบซ้ำ จึงไม่ขึ้นปฏิทิน <button class="lklink" id="goNoDate" style="border:0;background:none;padding:0;font:inherit;cursor:pointer">ดูรายการ</button></span>`:""}
${cancel?`<span>· รวมงานที่ยกเลิก <b>${cancel}</b></span>`:""}
</div>`;})()}`;
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
const BUD_WARN=80; // เตือนเมื่อใช้ถึง % นี้ของงบ (ก่อนเกินจริง)
// เดือนสุดท้ายที่นับเป็น "สะสมถึงตอนนี้" (-1 = ปีอนาคต ยังไม่มียอดสะสม)
function budCut(y,scope,m){ if(scope==="month")return m; if(y<THISYEAR)return 11; if(y>THISYEAR)return -1; return new Date().getMonth(); }
// รวมแผนงบ + ยอดใช้จริงรายเดือนต่อหมวด GL ไว้ที่เดียว (ใช้ทั้งหน้างบและแบนเนอร์หน้าแรก)
function budFlow(y){
const rows={}, Z=()=>Array(12).fill(0);
const row=k=>rows[k]||(rows[k]={k,plan:Z(),task:Z(),act:Z(),taskNoM:0,actNoM:0,ceil:0});
gls.forEach(g=>{const r=row(g.key); r.ceil=glBudget(g,y); for(let m=0;m<12;m++)r.plan[m]=glBudget(g,y,m);});
const monthOf=t=>{const d=dueDate(t)||(t.date?new Date(t.date):null); return d&&d.getFullYear()===y?d.getMonth():-1;};
items.filter(t=>!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==y)).forEach(t=>{
const k1=glKeyOf(t.gl1)||"", k2=glKeyOf(t.gl2)||"", m=monthOf(t), live=t.status!==STATUS_CANCEL;
const put=(k,bd,ac)=>{const r=row(k); if(m>=0){r.task[m]+=bd;r.act[m]+=ac;}else{r.taskNoM+=bd;r.actNoM+=ac;}};
put(k1||k2, live?(+t.b1||0):0, +t.actual||0);
if(+t.b2)put(k2||k1, live?(+t.b2||0):0, 0);
});
ledger.filter(x=>x.kind!=="income"&&x.date&&new Date(x.date).getFullYear()===y)
.forEach(x=>{row(x.gl||"").act[new Date(x.date).getMonth()]+=(+x.amount||0);});
const sum=a=>a.reduce((s2,v)=>s2+v,0);
Object.values(rows).forEach(r=>{
r.eff=r.plan.map((p,m)=>Math.max(p,r.task[m])); // แต่ละเดือน: แผนของหมวด หรืองบรวมของงาน แล้วแต่อันไหนมากกว่า (ไม่บวกซ้ำ)
r.planY=Math.max(sum(r.eff), r.ceil, sum(r.task)+r.taskNoM);
r.actY=sum(r.act)+r.actNoM; });
return rows;}
function budStat(r,cut,month){
const sm=(a,to)=>to<0?0:a.slice(0,to+1).reduce((x,v)=>x+v,0);
const plan=month==null?r.planY:r.eff[month], act=month==null?r.actY:r.act[month];
const ytdP=sm(r.eff,cut), ytdA=sm(r.act,cut);
const pct=plan?act/plan*100:0;
const lvl=!plan?(act?"nob":""):pct>=100?"over":pct>=BUD_WARN?"warn":"";
return {plan,act,left:plan-act,pct,lvl,ytdP,ytdA,pace:!!(plan&&ytdP>0&&ytdA>ytdP&&lvl===""&&month==null)};}
function budAlerts(y){
const flow=budFlow(y), cut=budCut(y,"year",0), out={over:[],near:[],pace:[]};
Object.values(flow).forEach(r=>{const s=budStat(r,cut,null); if(!s.plan)return;
const o={k:r.k,s}; if(s.lvl==="over")out.over.push(o); else if(s.lvl==="warn")out.near.push(o); else if(s.pace)out.pace.push(o);});
return out;}
function budBanner(y){
const A=budAlerts(y), n=A.over.length+A.near.length+A.pace.length; if(!n)return "";
const nm=k=>k?glLabel(k):"ยังไม่ระบุหมวด GL";
const mk=(arr,lab,pc)=>arr.map(o=>({t1:nm(o.k),t2:`ใช้ ${baht(o.s.act)} จากงบ ${baht(o.s.plan)} ฿ · ${o.s.left>=0?"คงเหลือ "+baht(o.s.left):"เกิน "+baht(-o.s.left)} ฿`+(o.s.pace?` · สะสมถึงเดือนนี้ใช้ ${baht(o.s.ytdA)} จากแผน ${baht(o.s.ytdP)}`:""),
d:Math.round(o.s.pct)+"%",p:lab,pc,c:pc==="s-over"?"var(--over-soft)":"var(--run-soft)",ic:pc==="s-over"?"var(--over)":"var(--run)"}));
const rows=[...mk(A.over,"เกินงบ","s-over"),...mk(A.near,"ใกล้เต็ม","s-run"),...mk(A.pace,"เร็วกว่าแผน","s-run")];
const bits=[A.over.length?`เกินงบแล้ว <b>${A.over.length}</b> หมวด`:"",A.near.length?`ใกล้เต็ม (≥${BUD_WARN}%) <b>${A.near.length}</b> หมวด`:"",A.pace.length?`ใช้เร็วกว่าแผนสะสม <b>${A.pace.length}</b> หมวด`:""].filter(Boolean);
return `<div class="banner${A.over.length?" bad":""}" ${regList("bAlert"+y,"งบประมาณที่ควรจับตา · ปี "+(y+543),rows)}>${svg(ICON.budget,19)} งบ GL ${y+543}: ${bits.join(" · ")}</div>`;}
function budget(){
const scope=R.budScope, m=R.budMonth, y=R.year;
const tx=ledgerIn(scope,m);
const inc=tx.filter(x=>x.kind==="income").reduce((s,x)=>s+(+x.amount||0),0);
const exp=tx.filter(x=>x.kind!=="income").reduce((s,x)=>s+(+x.amount||0),0);
const inYear=items.filter(t=>!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==y));
const flow=budFlow(y), cut=budCut(y,scope,m), mSel=scope==="month"?m:null;
const st={}; Object.values(flow).forEach(r=>{st[r.k]=budStat(r,cut,mSel);});
const keys=Object.keys(st).filter(k=>st[k].plan||st[k].act);
const B=keys.reduce((s,k)=>s+st[k].plan,0), A=keys.reduce((s,k)=>s+st[k].act,0);
const ytdB=keys.reduce((s,k)=>s+st[k].ytdP,0), ytdA=keys.reduce((s,k)=>s+st[k].ytdA,0);
const noGL=inYear.filter(t=>(budgetOf(t)>0||(+t.actual||0)>0)&&!hasGL(t)).length;
const monthsInc=MTH.map((_,i)=>ledger.filter(x=>x.date&&x.kind==="income"&&new Date(x.date).getMonth()===i&&new Date(x.date).getFullYear()===y).reduce((s,x)=>s+(+x.amount||0),0));
const monthsExp=MTH.map((_,i)=>ledger.filter(x=>x.date&&x.kind!=="income"&&new Date(x.date).getMonth()===i&&new Date(x.date).getFullYear()===y).reduce((s,x)=>s+(+x.amount||0),0));
const planM=MTH.map((_,i)=>Object.values(flow).reduce((s,r)=>s+r.eff[i],0));
const actM=MTH.map((_,i)=>Object.values(flow).reduce((s,r)=>s+r.act[i],0));
const txOfMonth=(i,kind)=>ledger.filter(x=>x.date&&(kind==="income"?x.kind==="income":x.kind!=="income")&&new Date(x.date).getMonth()===i&&new Date(x.date).getFullYear()===y).sort((a,b)=>(+b.amount||0)-(+a.amount||0));
const incTip=i=>{const a=txOfMonth(i,"income"),b=txOfMonth(i,"exp"); return [a.length?"รายรับ "+a.length+" รายการ":"ไม่มีรายรับ",...tipList(a,x=>(x.note||glLabel(x.gl))+" · "+baht(x.amount)+" ฿",5),b.length?"รายจ่าย "+b.length+" รายการ":"ไม่มีรายจ่าย",...tipList(b,x=>(x.note||glLabel(x.gl))+" · "+baht(x.amount)+" ฿",5),"(เฉพาะที่บันทึกในปุ่ม “บันทึกเงิน”)"];};
const planTip=i=>{const rs=Object.values(flow).filter(r=>r.eff[i]||r.act[i]).sort((a,b)=>(b.eff[i]-a.eff[i])||(b.act[i]-a.act[i])); return [rs.length?rs.length+" หมวด GL ในเดือนนี้ (เรียงตามแผน)":"ไม่มีหมวด GL ที่มีแผน/ใช้จริงเดือนนี้",...tipList(rs,r=>(r.k?glLabel(r.k):"ยังไม่ระบุหมวด GL")+" — แผน "+baht(r.eff[i])+" / ใช้ "+baht(r.act[i]),7),"ผลต่าง = แผน − ใช้จริง (บวก=ยังเหลือ, ลบ=เกินแผน)"];};
const rawPct=B?Math.round(A/B*100):0, pct=Math.min(100,rawPct);
const heroTag=!B?"":rawPct>=100?`<span class="bchip over onhero">เกินงบแล้ว</span>`:rawPct>=BUD_WARN?`<span class="bchip warn onhero">ใกล้เต็ม</span>`:"";
const recent=tx.slice().sort((a,b)=>a.date<b.date?1:-1).slice(0,10);
return `<div class="head"><div><h1>งบประมาณ & บัญชี</h1><div class="sub">ตั้งงบรายปีต่อหมวด GL แล้วแท็กค่าใช้จ่ายเข้าหมวดได้เลย · ${syncChip()}</div></div>
<button class="btn addbtn" id="addTx">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>บันทึกเงิน</span></button></div>
<div class="toolbar">${yearSel("yrSelB")} <div class="seg" id="budsc">
<button data-bs="year" aria-pressed="${scope==="year"}">รายปี</button>
<button data-bs="month" aria-pressed="${scope==="month"}">รายเดือน</button>
<button data-bs="week" aria-pressed="${scope==="week"}">รายสัปดาห์</button>
${scope==="month"?`<select id="budMonth" style="border:0;background:var(--card);border-radius:999px;padding:6px 12px">${MTHFULL.map((x,i)=>`<option value="${i}"${i===m?" selected":""}>${x}</option>`).join("")}</select>`:""}
</div></div>
${budBanner(y)}
<div class="dash">
<div class="card hero span2"${tipAttr("ใช้ไปแล้ว "+rawPct+"% ของงบ","งบตั้งไว้|"+baht(B)+" ฿","ใช้จริง|"+baht(A)+" ฿",(B-A>=0?"คงเหลือ|":"เกินงบ|")+baht(Math.abs(B-A))+" ฿",cut>=0&&ytdB?"สะสมถึง "+MTHFULL[cut]+"|ใช้ "+baht(ytdA)+" จากแผน "+baht(ytdB):"","จำนวนหมวด GL ที่มีงบ|"+keys.length)}><div class="lab">ใช้ไปแล้วจาก${scope==="month"?"งบเดือน"+MTHFULL[m]+" "+(y+543):"งบทั้งปี "+(y+543)} ${heroTag}</div>
<div class="big">${rawPct}%</div>
<div class="meta"><span>ใช้จริง ${baht(A)} ฿</span><span>งบตั้งไว้ ${baht(B)} ฿</span><span>${B-A>=0?"คงเหลือ "+baht(B-A):"เกินงบ "+baht(A-B)} ฿</span></div>
${cut>=0&&ytdB?`<div class="meta" style="margin-top:4px"><span>สะสมถึง ${MTHFULL[cut]}: แผน ${baht(ytdB)} · ใช้ ${baht(ytdA)} ฿ (${Math.round(ytdA/ytdB*100)}% ของแผนสะสม)</span></div>`:""}
<div class="prog"><i style="width:${pct}%"></i></div></div>
<div class="card stat"${tipAttr("รายรับ · "+(scope==="year"?"ทั้งปี":scope==="month"?MTHFULL[m]:"สัปดาห์นี้"),tx.filter(x=>x.kind==="income").length+" รายการ · รวม "+baht(inc)+" ฿",tipList(tx.filter(x=>x.kind==="income").sort((a,b)=>(+b.amount||0)-(+a.amount||0)),x=>(x.note||glLabel(x.gl))+" · "+baht(x.amount)+" ฿",6))}><div class="k"><span class="ic" style="background:var(--ok-soft);color:var(--ok)">${svg(ICON.up,16)}</span> รายรับ</div>
<div class="v" style="color:var(--ok)">${baht(inc)}</div><div class="d">${scope==="year"?"ทั้งปี":scope==="month"?MTHFULL[m]:"สัปดาห์นี้"}</div></div>
<div class="card stat"${tipAttr("รายจ่าย · "+(scope==="year"?"ทั้งปี":scope==="month"?MTHFULL[m]:"สัปดาห์นี้"),tx.filter(x=>x.kind!=="income").length+" รายการ · รวม "+baht(exp)+" ฿",tipList(tx.filter(x=>x.kind!=="income").sort((a,b)=>(+b.amount||0)-(+a.amount||0)),x=>(x.note||glLabel(x.gl))+" · "+baht(x.amount)+" ฿",6),"สุทธิ (รับ−จ่าย)|"+(inc-exp<0?"−":"")+baht(Math.abs(inc-exp))+" ฿")}><div class="k"><span class="ic">${svg(ICON.down,16)}</span> รายจ่าย</div>
<div class="v">${baht(exp)}</div><div class="d">สุทธิ ${baht(inc-exp)} ฿</div></div>
<div class="card span2"><h2>รายรับ – รายจ่ายรายเดือน <small>ปี ${y+543}</small></h2>
${dualBars(monthsInc,monthsExp,MTH,new Date().getMonth(),"รายรับ","รายจ่าย","var(--ok)","var(--accent-2)",incTip,"สุทธิ")}
<div class="legend"><span><i style="background:var(--ok)"></i>รายรับ</span><span><i style="background:var(--accent-2)"></i>รายจ่าย</span></div></div>
<div class="card span2"><h2>แผนงบ – ใช้จริงรายเดือน <small>ทุกหมวด GL · ปี ${y+543}</small></h2>
${dualBars(planM,actM,MTH,scope==="month"?m:new Date().getMonth(),"แผนงบ","ใช้จริง","var(--sky)","var(--accent)",planTip,"แผน−ใช้จริง")}
<div class="legend"><span><i style="background:var(--sky)"></i>แผนงบ</span><span><i style="background:var(--accent)"></i>ใช้จริง (งาน + บันทึกเงิน)</span></div></div>
<div class="card span4"><h2>งบตามหมวด GL <small>แผน / ใช้จริง / คงเหลือ · แตะแถวเพื่อดูรายเดือนและที่มาของตัวเลข</small></h2>
<div class="glfix"><button class="btn sm" id="glGo">✎ แก้ไขหมวด GL / ตั้งงบ</button><span class="hint" style="margin:0;align-self:center">เพิ่ม · แก้ชื่อ · รหัส GL · งบรายเดือน ทำที่ ตั้งค่า › หมวดงบประมาณ</span></div>
<div class="hint" style="margin:2px 0 10px">
<b>งบที่ตั้งไว้</b> = แต่ละเดือนใช้ค่าที่มากกว่าระหว่าง “แผนงบเดือนนั้นของหมวด (หน้าตั้งค่า)” กับ “ผลรวมช่องงบของงานที่ตกเดือนนั้น” (ไม่บวกซ้ำ) · งานที่ยกเลิกไม่นับงบ<br>
<b>ใช้จริง</b> = ช่องใช้จริงของงาน (นับในเดือนของวันครบกำหนด) + รายจ่ายที่บันทึกในหน้านี้ ที่แท็กหมวดเดียวกัน<br>
<b>เตือน</b> ใกล้เต็มเมื่อใช้ ≥${BUD_WARN}% · เกินงบเมื่อ ≥100% · “เร็วกว่าแผน” = ยอดสะสมถึงเดือนนี้เกินแผนสะสม ทั้งที่ยังไม่ถึง ${BUD_WARN}% ของทั้งปี · เส้นขีดบนแถบ = จุดที่ควรอยู่ตามแผนสะสม</div>
${keys.length?keys.sort((x,z)=>(st[z].plan-st[x].plan)||(st[z].act-st[x].act)).map(k=>{
const s=st[k], r=flow[k];
const p=s.plan?Math.min(100,s.act/s.plan*100):(s.act?100:0);
const nm=k?glLabel(k):"ยังไม่ระบุหมวด GL";
const tks=inYear.filter(t=>k?(glKeysOf(t).includes(k)&&(glShare(t,k)+(+t.actual||0))>0)
:(!hasGL(t)&&((+t.b1||0)+(+t.b2||0)+(+t.actual||0))>0));
const txs=ledger.filter(x=>(x.gl||"")===k&&x.date&&new Date(x.date).getFullYear()===y);
const mrows=[];
r.eff.forEach((e,i)=>{ if(!e&&!r.act[i])return; const lf=e-r.act[i];
mrows.push({t1:MTHFULL[i]+" "+(y+543),t2:`แผน ${baht(e)} ฿ · ใช้จริง ${baht(r.act[i])} ฿`,d:MTH[i],p:lf>=0?"เหลือ "+baht(lf):"เกิน "+baht(-lf),pc:lf>=0?"s-done":"s-over",c:"var(--accent-soft)",ic:"var(--accent)"}); });
if(r.taskNoM||r.actNoM)mrows.push({t1:"ไม่ระบุเดือน (งานประจำ/ยังไม่ใส่วันที่)",t2:`งบ ${baht(r.taskNoM)} ฿ · ใช้จริง ${baht(r.actNoM)} ฿ — นับเฉพาะยอดทั้งปี`,d:"—",p:"ทั้งปี",pc:"s-mid",c:"var(--accent-soft)",ic:"var(--accent)"});
const rowsL=[...mrows,
...tks.map(t=>{const d=dueDate(t);const mine=k?glShare(t,k):budgetOf(t);
const mineAct=(k?((glKeyOf(t.gl1)||glKeyOf(t.gl2))===k):!hasGL(t))?(+t.actual||0):0;
return {id:t._id,t1:t.title,t2:`งบ ${baht(mine)} ฿${mineAct?` · ใช้จริง ${baht(mineAct)} ฿`:""}${t.company?" · "+cLabel(t.company):""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",p:t.status,pc:sCls(t.status)};}),
...txs.map(x=>({tx:x._id,t1:x.note||(x.kind==="income"?"รายรับ":"รายจ่าย"),
t2:`บันทึกเงิน${x.company?" · "+cLabel(x.company):""}`,d:x.date?`${new Date(x.date).getDate()}<br>${MTH[new Date(x.date).getMonth()]}`:"—",
p:(x.kind==="income"?"+":"-")+baht(x.amount)+" ฿",pc:x.kind==="income"?"s-done":"s-run",c:"var(--run-soft)",ic:"var(--run)"}))];
const lk=regList("gl:"+k,esc(nm)+" · ปี "+(y+543),rowsL);
const chip=s.lvl==="over"?`<span class="bchip over">เกินงบ</span>`:s.lvl==="warn"?`<span class="bchip warn">ใกล้เต็ม ${Math.round(s.pct)}%</span>`
:s.lvl==="nob"?`<span class="bchip nob">ยังไม่ได้ตั้งงบ</span>`:s.pace?`<span class="bchip warn">เร็วกว่าแผน</span>`:`<span class="bchip">${Math.round(s.pct)}%</span>`;
const pacePos=(mSel==null&&s.plan&&s.ytdP&&cut>=0)?Math.min(100,s.ytdP/s.plan*100):null;
const glTip=tipAttr(nm,"งบตั้งไว้|"+baht(s.plan)+" ฿","ใช้จริง|"+baht(s.act)+" ฿ ("+Math.round(s.pct)+"%)",(s.left>=0?"คงเหลือ|":"เกินงบ|")+baht(Math.abs(s.left))+" ฿",pacePos!=null?"แผนสะสมถึง "+MTHFULL[cut]+"|"+baht(s.ytdP)+" ฿ (ขีดบนแถบ)":"",pacePos!=null?"ใช้สะสมถึง "+MTHFULL[cut]+"|"+baht(s.ytdA)+" ฿":"",tks.length+" งาน · "+txs.length+" รายการเงิน ที่นับรวม","แตะแถวเพื่อดูรายเดือน");
return `<div class="glrow" ${lk} style="cursor:pointer"${glTip}>
<div class="top"><span>${esc(nm)} <small style="color:var(--ink-3);font-weight:400">${tks.length+txs.length?`· ${tks.length} งาน${txs.length?` · ${txs.length} รายการเงิน`:""}`:""}</small></span>
<span class="amt"${s.lvl==="over"?' style="color:var(--over);font-weight:600"':""}>${baht(s.act)} / ${baht(s.plan)} ›</span></div>
<div class="bar"${glTip}><i class="${s.lvl==="over"?"hot":s.lvl==="warn"?"warn":""}" style="width:${p}%"></i>${pacePos!=null?`<u class="pace" style="left:${pacePos}%" title="แผนสะสมถึง ${MTHFULL[cut]}"></u>`:""}</div>
<div class="sub">${chip}<span>${s.left>=0?"คงเหลือ "+baht(s.left):"เกิน "+baht(-s.left)} ฿</span>${s.plan&&cut>=0&&s.ytdP?`<span>สะสมถึง ${MTH[cut]}: ใช้ ${baht(s.ytdA)} จากแผน ${baht(s.ytdP)} ฿ (${Math.round(s.ytdA/s.ytdP*100)}%)</span>`:""}</div></div>`;}).join("")
:`<div class="empty">ยังไม่มีงบในปีนี้ — ใส่งบในงานแต่ละงาน หรือเพิ่มหมวด GL ที่หน้าตั้งค่า</div>`}
${noGL?`<div class="hint">มี <b>${noGL}</b> งานที่ใส่งบไว้แต่ยังไม่ได้เลือกหมวด GL — เปิดงานแล้วเลือกหมวด เพื่อให้ยอดแยกตามหมวดได้</div>`:""}
</div>
<div class="card span4"><h2>รายการล่าสุด <small>${tx.length} รายการในช่วงนี้</small></h2>
<div class="list">${recent.map(x=>`<div class="li" data-tx="${x._id}">
<div class="ic" style="background:${x.kind==="income"?"var(--ok-soft)":"var(--line-2)"};color:${x.kind==="income"?"var(--ok)":"var(--accent)"}">${svg(x.kind==="income"?ICON.up:ICON.down,16)}</div>
<div class="tx"><div class="t1">${esc(x.note||glLabel(x.gl))}</div>
<div class="t2">${fmtDate(x.date)} · ${esc(glLabel(x.gl))}${x.company?" · "+esc(cLabel(x.company)):""}</div></div>
<b style="color:${x.kind==="income"?"var(--ok)":"inherit"};font-variant-numeric:tabular-nums">${x.kind==="income"?"+":"−"}${baht(x.amount)}</b></div>`).join("")
||`<div class="empty">ยังไม่มีรายการในช่วงนี้<br><span style="font-size:12.5px">กด “บันทึกเงิน” เพื่อเพิ่มรายรับหรือรายจ่าย</span></div>`}</div></div>
</div>`;
}
// ---------- รายงานผู้บริหาร: สรุปหน้าเดียว พิมพ์/เซฟ PDF ได้ ดึงจากข้อมูลจริงทุกหมวด ----------
function execData(y){
const inYr=t=>!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==y);
const A=items.filter(t=>!isSysRow(t)&&inYr(t)&&t.track!=="idea"&&t.status!==STATUS_CANCEL);
const done=A.filter(t=>t.status===STATUS_DONE).length;
const flow=budFlow(y), cut=budCut(y,"year",0);
const gl=Object.values(flow).map(r=>({k:r.k,s:budStat(r,cut,null)})).filter(x=>x.s.plan||x.s.act)
.sort((a,b)=>(b.s.plan-a.s.plan)||(b.s.act-a.s.act));
const B=gl.reduce((n,x)=>n+x.s.plan,0), Ac=gl.reduce((n,x)=>n+x.s.act,0);
const ytdB=gl.reduce((n,x)=>n+x.s.ytdP,0), ytdA=gl.reduce((n,x)=>n+x.s.ytdA,0);
const tr=items.filter(t=>isTrain(t)&&inYr(t)&&t.status!==STATUS_CANCEL&&(()=>{const d=dueDate(t)||(t.date?new Date(t.date):null);return d&&d.getFullYear()===y;})());
const trDone=tr.filter(t=>t.status===STATUS_DONE);
const train={n:tr.length,done:trDone.length,pax:trDone.reduce((n,t)=>n+(+t.pax||0),0),hrs:trDone.reduce((n,t)=>n+(+hoursOf(t)||0)*(+t.pax||0),0),
cost:tr.reduce((n,t)=>n+((+t.actual||0)||budgetOf(t)),0)};
const dsd=dsdList(y).map(c=>({c,k:dsdCalc(dsdRec(c.key,y))})).filter(x=>x.k.avg);
const late=items.filter(t=>!isSysRow(t)&&isOpenStatus(t.status)&&(()=>{const d=dueDate(t);return d&&daysTo(d)<0;})()).sort((a,b)=>dueDate(a)-dueDate(b));
const lawLate=late.filter(isLawItem);
const lg=legal.map(L=>({L,st:legalState(L)}));
const alerts=budAlerts(y);
return {y,A,done,flow,cut,gl,B,Ac,ytdB,ytdA,trainN:train,dsd,late,lawLate,lgLate:lg.filter(x=>x.st.k==="late"),lgSoon:lg.filter(x=>x.st.k==="soon"),alerts};
}
function execHeadlines(D){
const L=[], nm=k=>k?glLabel(k):"ยังไม่ระบุหมวด GL";
const pct=D.A.length?Math.round(D.done/D.A.length*100):0;
L.push({c:"ok",t:`<b>งาน:</b> ปี ${D.y+543} เสร็จแล้ว ${D.done} จาก ${D.A.length} งาน (${pct}%)${D.late.length?` · <b>เลยกำหนด ${D.late.length} งาน</b>`:" · ไม่มีงานเลยกำหนด"}`});
if(D.B){const p=Math.round(D.Ac/D.B*100);
L.push({c:p>=100?"bad":p>=BUD_WARN?"warn":"ok",t:`<b>งบ:</b> ใช้ ${baht(D.Ac)} จากงบ ${baht(D.B)} ฿ (${p}%) · คงเหลือ ${D.B-D.Ac>=0?baht(D.B-D.Ac):"เกิน "+baht(D.Ac-D.B)} ฿`+(D.cut>=0&&D.ytdB?` · สะสมถึงเดือนนี้ใช้ ${Math.round(D.ytdA/D.ytdB*100)}% ของแผนสะสม`:"")});}
else L.push({c:"warn",t:"<b>งบ:</b> ยังไม่มีงบตั้งไว้ในปีนี้ — ตั้งงบที่หน้าตั้งค่า → หมวด GL หรือใส่งบในงาน"});
const a=D.alerts;
if(a.over.length)L.push({c:"bad",t:`<b>เกินงบ:</b> ${a.over.map(o=>esc(nm(o.k))+" ("+Math.round(o.s.pct)+"%)").join(", ")}`});
if(a.near.length)L.push({c:"warn",t:`<b>ใกล้เต็ม (≥${BUD_WARN}%):</b> ${a.near.map(o=>esc(nm(o.k))+" ("+Math.round(o.s.pct)+"%)").join(", ")}`});
if(a.pace.length)L.push({c:"warn",t:`<b>ใช้เร็วกว่าแผนสะสม:</b> ${a.pace.map(o=>esc(nm(o.k))).join(", ")}`});
if(D.trainN.n)L.push({c:"ok",t:`<b>อบรม:</b> ${D.trainN.n} รุ่น (จัดแล้ว ${D.trainN.done}) · ผู้เข้าอบรมแล้ว ${baht(D.trainN.pax)} คน · ค่าใช้จ่ายรวม ${baht(D.trainN.cost)} ฿`});
const sh=D.dsd.filter(x=>x.k.need>0);
if(sh.length)L.push({c:"warn",t:`<b>เกณฑ์ฝึกอบรมตามกฎหมาย (กรมพัฒนาฯ):</b> ${sh.length} บริษัทยังต้องฝึกเพิ่ม รวม ${sh.reduce((n,x)=>n+x.k.need,0)} คน — เป็นตัวเลขจากข้อมูลที่กรอกในระบบ ควรตรวจกับเว็บกรมฯ ก่อนตัดสินใจ`});
if(D.lawLate.length)L.push({c:"bad",t:`<b>งานบังคับตามกฎหมายเลยกำหนด:</b> ${D.lawLate.length} งาน — ${esc(D.lawLate.slice(0,3).map(t=>t.title).join(" · "))}${D.lawLate.length>3?" …":""}`});
if(D.lgLate.length||D.lgSoon.length)L.push({c:D.lgLate.length?"bad":"warn",t:`<b>ใบรับรอง/คำสั่งแต่งตั้ง:</b> เกินกำหนด ${D.lgLate.length} · ใกล้ครบใน 90 วัน ${D.lgSoon.length}`});
return L;
}
function execView(){
const y=R.year, D=execData(y), H=execHeadlines(D);
const pct=D.A.length?Math.round(D.done/D.A.length*100):0, bp=D.B?Math.round(D.Ac/D.B*100):0;
const nm=k=>k?glLabel(k):"ยังไม่ระบุหมวด GL";
const chip=s=>s.lvl==="over"?`<span class="bchip over">เกินงบ</span>`:s.lvl==="warn"?`<span class="bchip warn">ใกล้เต็ม</span>`:s.lvl==="nob"?`<span class="bchip nob">ไม่ได้ตั้งงบ</span>`:s.pace?`<span class="bchip warn">เร็วกว่าแผน</span>`:`<span class="bchip">ปกติ</span>`;
const today=new Date();
return `<div class="head"><div><h1>รายงานผู้บริหาร</h1><div class="sub">สรุปหน้าเดียวจากข้อมูลจริงในระบบ · ${syncChip()}</div></div>
<div class="noprint" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="execCsv">${svg(ICON.file,17)}<span>ตารางงบ .csv</span></button>
<button class="btn addbtn" id="execPrint">${svg(ICON.file,17)}<span>พิมพ์ / เซฟ PDF</span></button></div></div>
<div class="toolbar noprint">${yearSel("yrSelB")}</div>
<div class="printhead">LeKise Group · HR — รายงานผู้บริหาร ปี ${y+543} · ข้อมูล ณ ${today.getDate()} ${MTHFULL[today.getMonth()]} ${today.getFullYear()+543}</div>
<div class="dash">
<div class="card hero span2"${tipAttr("ความคืบหน้างานปี "+(y+543)+" · "+pct+"%","เสร็จสิ้น|"+D.done+" งาน","ยังไม่เสร็จ|"+(D.A.length-D.done)+" งาน","เลยกำหนดแล้ว|"+D.late.length+" งาน",tipList(D.late,t=>t.title,4),"คิดจากงานเสร็จ ÷ งานทั้งปี ไม่รวมยกเลิก/ไอเดีย")}><div class="lab">ความคืบหน้างานปี ${y+543}</div><div class="big">${pct}%</div>
<div class="meta"><span>เสร็จ ${D.done} งาน</span><span>เหลือ ${D.A.length-D.done} งาน</span><span>เลยกำหนด ${D.late.length}</span></div>
<div class="prog"><i style="width:${pct}%"></i></div></div>
<div class="card stat"${tipAttr("งบใช้ไป ปี "+(y+543)+" · "+(D.B?bp+"%":"—"),"งบตั้งไว้|"+baht(D.B)+" ฿","ใช้จริง|"+baht(D.Ac)+" ฿",(D.B-D.Ac>=0?"คงเหลือ|":"เกินงบ|")+baht(Math.abs(D.B-D.Ac))+" ฿","หมวด GL ที่มีงบ/ใช้จริง|"+D.gl.length,D.alerts&&D.alerts.over.length?"เกินงบ "+D.alerts.over.length+" หมวด":"")}><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> งบใช้ไป</div>
<div class="v"${bp>=100?' style="color:var(--over)"':""}>${D.B?bp+"%":"—"}</div><div class="d">${baht(D.Ac)} จาก ${baht(D.B)} ฿</div></div>
<div class="card stat"${tipAttr("อบรมปี "+(y+543),"รุ่นทั้งหมด|"+D.trainN.n,"จัดแล้ว (เสร็จสิ้น)|"+D.trainN.done+" รุ่น","ผู้เข้าอบรมรวม|"+baht(D.trainN.pax)+" คน","ชั่วโมงอบรมรวม (ชม.×คน)|"+baht(D.trainN.hrs),"ค่าใช้จ่าย (ใช้จริง หรืองบถ้ายังไม่มี)|"+baht(D.trainN.cost)+" ฿")}><div class="k"><span class="ic">${svg(ICON.train,16)}</span> อบรมปีนี้</div>
<div class="v">${D.trainN.n}</div><div class="d">จัดแล้ว ${D.trainN.done} รุ่น · ${baht(D.trainN.pax)} คน</div></div>
<div class="card span4"><h2>ประเด็นสำคัญ <small>สรุปให้อัตโนมัติจากข้อมูล ณ วันนี้</small></h2>
<div class="exlist">${H.map(h=>`<div class="exrow ${h.c}"><i></i><span>${h.t}</span></div>`).join("")}</div></div>
<div class="card span4"><h2>งบประมาณตามหมวด GL <small>ปี ${y+543} · แผน / ใช้จริง / คงเหลือ</small></h2>
${D.gl.length?`<div class="tblwrap wide"><table><thead><tr><th>หมวด GL</th><th class="num">งบตั้งไว้</th><th class="num">ใช้จริง</th><th class="num">คงเหลือ</th><th class="num">% ใช้</th><th>สถานะ</th></tr></thead><tbody>
${D.gl.map(x=>`<tr${tipAttr(nm(x.k),"งบตั้งไว้|"+baht(x.s.plan)+" ฿","ใช้จริง|"+baht(x.s.act)+" ฿ ("+(x.s.plan?Math.round(x.s.pct)+"%":"—")+")",(x.s.left>=0?"คงเหลือ|":"เกินงบ|")+baht(Math.abs(x.s.left))+" ฿",D.cut>=0&&x.s.ytdP?"สะสมถึง "+MTH[D.cut]+"|ใช้ "+baht(x.s.ytdA)+" จากแผน "+baht(x.s.ytdP):"",x.s.lvl==="over"?"สถานะ: ใช้เกินงบแล้ว":x.s.lvl==="warn"?"สถานะ: ใกล้เต็ม (≥"+BUD_WARN+"%)":x.s.lvl==="nob"?"สถานะ: มียอดใช้แต่ยังไม่ได้ตั้งงบ":x.s.pace?"สถานะ: ใช้เร็วกว่าแผนสะสม":"สถานะ: ปกติ")}><td>${esc(nm(x.k))}</td><td class="num">${baht(x.s.plan)}</td><td class="num">${baht(x.s.act)}</td>
<td class="num"${x.s.left<0?' style="color:var(--over);font-weight:600"':""}>${x.s.left<0?"−"+baht(-x.s.left):baht(x.s.left)}</td>
<td class="num">${x.s.plan?Math.round(x.s.pct)+"%":"—"}</td><td>${chip(x.s)}</td></tr>`).join("")}
<tr style="font-weight:700;border-top:2px solid var(--line)"><td>รวม</td><td class="num">${baht(D.B)}</td><td class="num">${baht(D.Ac)}</td><td class="num">${D.B-D.Ac<0?"−"+baht(D.Ac-D.B):baht(D.B-D.Ac)}</td><td class="num">${D.B?bp+"%":"—"}</td><td></td></tr>
</tbody></table></div>`:`<div class="empty">ยังไม่มีงบในปีนี้</div>`}</div>
<div class="card span2"><h2>เกณฑ์ฝึกอบรมตามกฎหมาย <small>รายบริษัท · ปี ${y+543}</small></h2>
${D.dsd.length?`<div class="tblwrap"><table><thead><tr><th>บริษัท</th><th class="num">พนักงานเฉลี่ย</th><th class="num">นับได้ (C)</th><th class="num">% </th><th class="num">ต้องเพิ่ม</th></tr></thead><tbody>
${D.dsd.map(x=>`<tr><td>${esc(cLabel(x.c.key))}</td><td class="num">${x.k.avg}</td><td class="num">${x.k.C}</td><td class="num">${x.k.pct}%</td>
<td class="num"${x.k.need>0?' style="color:var(--over);font-weight:600"':""}>${x.k.need}</td></tr>`).join("")}</tbody></table></div>
<div class="hint">เป็นตัวเลขที่กรอกในระบบ — เกณฑ์/สิทธิประโยชน์แต่ละปีอาจเปลี่ยน ตรวจกับกรมฯ ก่อนยื่นจริง</div>`:`<div class="empty">ยังไม่มีข้อมูลพนักงานเฉลี่ยของปีนี้</div>`}</div>
<div class="card span2"><h2>งานที่เลยกำหนด <small>${D.late.length} งาน · เก่าสุดก่อน</small></h2>
<div class="list">${D.late.slice(0,8).map(t=>{const d=dueDate(t);return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--over-soft);color:var(--over)">${d.getDate()}<br>${MTH[d.getMonth()]}</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div><div class="t2">${esc(gLabel(t.track))}${t.company?" · "+esc(cLabel(t.company)):""}${t.owner?" · "+esc(t.owner):""}</div></div>
<span class="pill s-over">เลย ${-daysTo(d)} วัน</span></div>`;}).join("")||`<div class="empty">ไม่มีงานเลยกำหนด 🎉</div>`}</div>
${D.late.length>8?`<div class="hint">แสดง 8 จาก ${D.late.length} งาน — ดูทั้งหมดที่หน้างานทั้งหมด</div>`:""}</div>
</div>`;
}
function execCsv(){
const D=execData(R.year), nm=k=>k?glLabel(k):"ยังไม่ระบุหมวด GL";
exportCSV("budget-by-GL",["หมวด GL","งบตั้งไว้","ใช้จริง","คงเหลือ","% ใช้","สถานะ"],
[...D.gl.map(x=>[nm(x.k),x.s.plan,x.s.act,x.s.left,x.s.plan?Math.round(x.s.pct):"",x.s.lvl==="over"?"เกินงบ":x.s.lvl==="warn"?"ใกล้เต็ม":x.s.lvl==="nob"?"ไม่ได้ตั้งงบ":x.s.pace?"เร็วกว่าแผน":"ปกติ"]),
["รวม",D.B,D.Ac,D.B-D.Ac,D.B?Math.round(D.Ac/D.B*100):"",""]]);
}
// ---------- 5W1H: Why / Who / Where / How เสริมจาก What (ชื่องาน) และ When (Deadline) ----------
const W5K=["why","inv","whr","how"];
const w5Txt=v=>String(v==null?"":v).trim();
const w5Has=t=>!!t&&W5K.some(k=>w5Txt(t[k]));
function w5Miss(t,kind){
const m=[]; if(!w5Txt(t.why))m.push("Why"); if(!w5Txt(t.owner)&&!w5Txt(t.inv))m.push("Who");
if(!t.date&&!t.rrule&&!t.recurring)m.push("When");
if((kind||"task")==="task"&&!w5Txt(t.whr))m.push("Where"); if(!w5Txt(t.how))m.push("How"); return m; }
function w5Line(t){ if(!w5Has(t))return "";
const p=[["Why",t.why],["Who",t.inv],["Where",t.whr]].filter(x=>w5Txt(x[1])).map(x=>`<b>${x[0]}</b> ${esc(w5Txt(x[1]).slice(0,60))}`);
const h=w5Txt(t.how); if(h)p.push(`<b>How</b> ${esc(h.split("\n")[0].slice(0,60))}`);
return `<div class="w5line">${p.join(" · ")}</div>`; }
async function aiAskText(system,context,userText){
let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system,context,messages:[{role:"user",content:userText}]})});
const j=await r.json().catch(()=>({}));
if(!r.ok)throw new Error(j.message||("ผิดพลาด "+r.status));
return j.text||""; }
function aiJsonOf(txt){
const s0=String(txt||""), m=s0.match(/```(?:json)?\s*([\s\S]*?)```/i), body=m?m[1]:s0;
const i=body.search(/[\[{]/); if(i<0)return null; const close=body[i]==="["?"]":"}", j=body.lastIndexOf(close); if(j<i)return null;
try{ return JSON.parse(body.slice(i,j+1)); }catch(e){ return null; } }
const W5_SYS=["คุณช่วยเติมรายละเอียด 5W1H ของงาน HR ให้วิม (HR, LeKise Group) จากข้อมูลที่ให้มาเท่านั้น",
"ตอบเป็น JSON ล้วนๆ ไม่มีข้อความอื่น ภาษาไทย สั้นกระชับ ใช้คีย์ตามที่ขอ",
"ห้ามแต่งข้อเท็จจริง: ชื่อคน ตัวเลข วันที่ ลิงก์ ถ้าข้อมูลไม่พอให้ใส่ \"\" — ช่อง why/how ให้ร่างจากหลักสามัญของงาน HR ได้แต่ต้องเป็นข้อเสนอเชิงกว้าง",
"how ให้เป็นขั้นตอนสั้นๆ ขึ้นบรรทัดใหม่ทีละข้อ ไม่เกิน 5 ข้อ"].join("\n");
// ---------- ผู้ช่วย AI: สรุป · จัดแผน · เตือนงาน · เสนอการแก้ (ต้องกดยืนยันเสมอ) ----------
const AI_SYSTEM=[
"คุณคือผู้ช่วย HR ประจำตัวของวิม (HR, LeKise Group) ในแอป Sky Work",
"สไตล์: ตอบภาษาไทย กระชับแบบผู้บริหาร พูดตรง วิเคราะห์ได้ และเสนอสิ่งที่ควรทำต่อเป็นข้อๆ",
"กติกา:",
"- ใช้เฉพาะข้อมูลในส่วน [ข้อมูลในระบบ] ห้ามเดาหรือแต่งตัวเลข ถ้าไม่มีข้อมูลให้บอกตรงๆ ว่าไม่มี",
"- เกณฑ์/เงินอุดหนุนของกรมพัฒนาฝีมือแรงงานเปลี่ยนได้ทุกปี ห้ามยืนยันว่าจะได้เงินคืนแน่นอน ให้แนะนำตรวจกับเจ้าหน้าที่กรมฯ",
"- ห้ามเสนอลบข้อมูล",
"- ถ้าต้องการให้แอปแก้ข้อมูล ให้ใส่บล็อกต่อไปนี้ท้ายคำตอบเท่านั้น (และอธิบายเหตุผลในเนื้อความด้วย):",
"```actions",
"[{\"type\":\"set_status\",\"id\":\"<id จากข้อมูล>\",\"status\":\"เสร็จสิ้น\",\"why\":\"เหตุผลสั้นๆ\"}]",
"```",
"ชนิดที่ใช้ได้: set_status(id,status) · move_date(id,date เป็น YYYY-MM-DD คือ Deadline ใหม่) · set_owner(id,owner) · set_quad(id,quad เป็น q1|q2|q3|q4) · add_task(title,date=Deadline,track?,company?,owner?,note?,quad?,why?,inv?,whr?,how?) · set_w5(id,why?,inv?,whr?,how?) เติมรายละเอียด 5W1H ให้งานเดิม · add_note(title,body)",
"5W1H ของงาน: What=ชื่องาน · Why=วัตถุประสงค์ (why) · Who=ผู้รับผิดชอบ (owner) + ผู้เกี่ยวข้อง/ผู้อนุมัติ (inv) · When=Deadline · Where=สถานที่/ระบบ/ลิงก์ (whr) · How=ขั้นตอน (how) — ก่อนเสนอ add_task ให้ตรวจ Who/When/Why ถ้าขาดตัวใดให้ถามกลับครั้งเดียวสั้นๆ โดยระบุว่าขาดอะไร (ยกเว้นผู้ใช้บอก “เพิ่มเลย”) · Where/How ใส่เมื่ออนุมานได้จากที่ผู้ใช้บอก ห้ามแต่งชื่อคน ตัวเลข ลิงก์",
"Eisenhower Matrix ของงาน: q1=ทำเลย (สำคัญ+เร่งด่วน) · q2=วางแผน (สำคัญ ไม่เร่งด่วน) · q3=มอบหมาย (ไม่สำคัญ แต่เร่งด่วน) · q4=ไว้ทีหลัง/ตัดทิ้ง · ช่อง “Deadline” = วันที่ต้องเสร็จของงาน",
"เกณฑ์ช่วยจัดลำดับ: เร่งด่วน = เลย Deadline หรือครบภายใน ~3 วัน · สำคัญ = กระทบกฎหมาย งบประมาณ ผู้บริหาร ความปลอดภัย หรือเป้าหมายของ HR · เมื่อเสนอ set_quad ให้ใส่ why ที่อ้างข้อมูลจริง (Deadline/ผู้รับผิดชอบ/ประเภท) และเสนอครั้งละไม่เกิน 12 งาน เริ่มจากงานที่ Deadline ใกล้ที่สุด",
"ช่อง 3 (มอบหมาย) ควรมีผู้รับผิดชอบ ถ้ายังไม่มีให้ถามผู้ใช้ว่าจะมอบให้ใคร ห้ามเดาชื่อคน · ห้ามเดา Deadline ถ้าผู้ใช้ไม่ได้บอกให้ถามกลับ · วันที่แบบสัมพัทธ์ (พรุ่งนี้/ศุกร์หน้า) ให้คำนวณจาก “วันนี้” ในข้อมูล",
"id ต้องคัดลอกจากข้อมูลเท่านั้น status ต้องเป็นหนึ่งใน: "+STATUS.join(" / "),
"- เสนอการแก้เฉพาะเมื่อผู้ใช้ขอ หรือชัดเจนว่ามีประโยชน์ ผู้ใช้จะเป็นคนกดยืนยันเอง"].join("\n");
const AI_CHIPS=["สรุปภาพรวมสัปดาห์นี้","งานไหนเสี่ยงเลยกำหนด ควรทำอะไรก่อน","สรุปงบ GL ตอนนี้ หมวดไหนต้องจับตา","จัดแผนงานสัปดาห์หน้าให้หน่อย","มีอะไรต้องเตือนหรือเตรียมก่อนประชุมบ้าง","สรุปงานอบรมและเกณฑ์กรมพัฒนาฯ"];
let AI={msgs:[],busy:false,live:null,model:"",draft:"",pending:null,flash:"",open:false,listening:false,vnote:""};
const AI_CMDS=[
{k:"/สรุป",d:"สรุปภาพรวมสัปดาห์นี้",btn:"สรุปสัปดาห์นี้",q:"สรุปภาพรวมสัปดาห์นี้ให้หน่อย: งานที่ต้องทำ งานเสี่ยง และสิ่งที่ควรทำก่อน"},
{k:"/เลยกำหนด",d:"งานเลยกำหนด + ควรทำอะไรก่อน",btn:"งานเลยกำหนด",q:"งานไหนเลยกำหนดหรือเสี่ยงเลยกำหนด เรียงตามความเร่งด่วน แล้วเสนอว่าควรทำอะไรก่อน"},
{k:"/งบ",d:"สรุปงบ GL หมวดที่ต้องจับตา",btn:"งบ GL",q:"สรุปงบ GL ตอนนี้ หมวดไหนใกล้เต็มหรือเกินงบ ต้องจับตาอะไร"},
{k:"/ประชุม",d:"ประชุมที่ใกล้ถึง + สิ่งที่ต้องเตรียม",btn:"ประชุมใกล้ถึง",q:"ประชุมที่ใกล้ถึงมีอะไรบ้าง และต้องเตรียมอะไรก่อน"},
{k:"/แผน",d:"จัดแผนงานสัปดาห์หน้า",btn:"แผนสัปดาห์หน้า",q:"ช่วยจัดแผนงานสัปดาห์หน้าให้ โดยดูงานที่ใกล้ครบกำหนดและงานที่ค้าง"},
{k:"/ใบรับรอง",d:"ใบรับรอง/คำสั่งแต่งตั้งที่ใกล้หมด",btn:"ใบรับรองใกล้หมด",q:"ใบรับรองหรือคำสั่งแต่งตั้งอะไรที่เกินกำหนดหรือใกล้ครบ ควรทำอะไรต่อ"},
{k:"/จัดลำดับ",d:"ช่วยจัดงานที่ยังไม่จัดเข้า Matrix",btn:"จัด Matrix",q:"ช่วยจัดลำดับงานที่ยังไม่จัดเข้า Eisenhower Matrix โดยเริ่มจากงานที่ Deadline ใกล้สุด เสนอเป็นการ์ด set_quad พร้อมเหตุผลสั้นๆ"},
{k:"/ด่วน",d:"งานที่ต้องทำเลยตอนนี้",btn:"งานต้องทำเลย",q:"ตอนนี้มีงานอะไรที่ควรทำเลย (สำคัญ+เร่งด่วน) บ้าง เรียงลำดับ และถ้ามีงานที่ยังไม่จัดลำดับแต่ควรอยู่ช่อง 1 ให้เสนอ set_quad"},
{k:"/ส่งต่อ",d:"งานที่ควรมอบหมาย + ภาระงานรายคน",q:"ดูภาระงานรายผู้รับผิดชอบ และงานช่อง 3 (มอบหมาย) แนะนำว่างานไหนควรส่งต่อให้ใคร (ถ้าไม่มีข้อมูลคนให้ถามกลับ อย่าเดาชื่อ)"},
{k:"/เพิ่มงาน",a:"ชื่องาน Deadline",d:"เพิ่มงานใหม่ (พิมพ์ชื่อ+Deadline ต่อท้าย) · AI ตรวจ 5W1H ให้",q:"เพิ่มงานใหม่: {a}\nตรวจ 5W1H ก่อน: ถ้าขาด Who/When/Why ให้ถามกลับสั้นๆ ครั้งเดียว ถ้าครบพอให้เสนอการ์ด add_task (ใส่ why/inv/whr/how เท่าที่อนุมานได้) พร้อมเสนอ quad และเหตุผลสั้นๆ"},
{k:"/5w1h",d:"ตรวจงานที่ข้อมูล 5W1H ไม่ครบ + เสนอเติม",btn:"ตรวจ 5W1H",q:"ดูหัวข้อ “งานที่ 5W1H ยังไม่ครบ” แล้วเลือกงานที่สำคัญที่สุดไม่เกิน 8 งาน เสนอการ์ด set_w5 เติม why/how/whr เท่าที่อนุมานได้จากชื่อและข้อมูลในระบบ (ห้ามแต่งชื่อคน/ตัวเลข) ส่วน Who/When ที่ขาดให้ถามฉัน"},
{k:"/รายงาน",d:"สรุปงานสัปดาห์ตามกรอบ 5W1H",btn:"สรุป 5W1H",q:"สรุปงานสัปดาห์นี้และสัปดาห์หน้าเป็นตาราง 5W1H สำหรับนำเสนอผู้บริหาร: What | Why | Who | When | Where | How — เฉพาะงานช่อง 1-2 ของ Matrix งานเลย Deadline และงานที่ใกล้ครบ ช่องไหนไม่มีข้อมูลให้ใส่ “—” แล้วปิดท้ายด้วยข้อเสนอ 3 ข้อ"},
{k:"/เสร็จ",a:"ชื่องาน",d:"ทำเครื่องหมายงานว่าเสร็จ",q:"ทำเครื่องหมายงานนี้เป็นเสร็จสิ้น: {a}\nเสนอเป็นการ์ด set_status (ถ้าหางานไม่เจอหรือคลุมเครือ ให้ถามกลับ)"},
{k:"/เลื่อน",a:"ชื่องาน วันที่ใหม่",d:"เลื่อนวันงาน",q:"เลื่อนวันงาน: {a}\nเสนอเป็นการ์ด move_date (ถ้าหางานไม่เจอหรือคลุมเครือ ให้ถามกลับ)"},
{k:"/มอบ",a:"ชื่องาน ชื่อคน",d:"มอบหมายผู้รับผิดชอบ",q:"มอบหมายงาน: {a}\nเสนอเป็นการ์ด set_owner (ถ้าหางานไม่เจอหรือคลุมเครือ ให้ถามกลับ)"},
{k:"/โน้ต",a:"หัวข้อ เนื้อหา",d:"จดบันทึกลงหน้า บันทึก & ไอเดีย",q:"จดบันทึก: {a}\nเสนอเป็นการ์ด add_note"},
{k:"/ไป",a:"ชื่อหน้า",d:"ไปหน้าอื่น เช่น /ไป งบ",local:"nav"},
{k:"/ล้าง",d:"ล้างแชท",local:"clear"},
{k:"/ช่วย",d:"ดูคำสั่งทั้งหมด",local:"help"}];
const AI_BTNS=AI_CMDS.filter(c=>c.btn);
const AI_NAV=[["gaps",/ค้างข้อมูล|ข้อมูลไม่ครบ|5w1h/i],["home",/ภาพรวม|หน้าแรก|โฮม|home/i],["all",/งานทั้งหมด|งานทั้ง|รายการงาน/],["cal",/ปฏิทิน/],["matrix",/matrix|เมทริกซ์|ไอเซนฮาวเวอร์|eisenhower|จัดลำดับ/i],["budget",/งบ/],["exec",/รายงาน|ผู้บริหาร/],["meet",/ประชุม/],["train",/ฝึกอบรม|อบรม/],["dsd",/กรมพัฒนา|พัฒนาฝีมือ|dsd/i],["legal",/กฎหมาย/],["idx",/index|อินเด็กซ์/i],["note",/บันทึก|ไอเดีย|โน้ต/],["ai",/ผู้ช่วย|เอไอ|\bai\b/i],["set",/ตั้งค่า|เซ็ต/]];
function aiNavTo(name){ const n=String(name||"").trim(); if(!n)return null; const hit=AI_NAV.find(([k,re])=>re.test(n)); return hit?hit[0]:null; }
function aiGo(k){ view=k; R.pq=""; renderNav(); render(); window.scrollTo(0,0); aiPopRender(); }
const aiSys=t=>{ AI.msgs.push({role:"sys",text:t}); aiSave(); };
// คืน true ถ้าจัดการเองในแอปแล้ว (ไม่ต้องส่งให้ AI)
function aiLocal(q){
const m=q.match(/^(?:\/ไป|ไปหน้า|ไปที่|ไป|เปิดหน้า|เปิด)\s*(.+)$/);
if(m){ const k=aiNavTo(m[1]); if(k){ AI.msgs.push({role:"user",text:q}); aiSys("เปิดหน้า “"+(VIEWS.find(v=>v[0]===k)||[0,k])[1]+"” ให้แล้ว"); aiGo(k); return true; }
 if(q[0]==="/"){ AI.msgs.push({role:"user",text:q}); aiSys("ไม่พบหน้า “"+m[1]+"” — ลอง /ไป งบ · /ไป ประชุม · /ไป ปฏิทิน"); return true; } }
return false;
}
// ตีความคำสั่ง / → {done:true} หรือ {q:ข้อความที่จะส่งให้ AI, show:ข้อความที่โชว์}
function aiSlash(q){
const sp=q.indexOf(" "), key=sp<0?q:q.slice(0,sp), arg=sp<0?"":q.slice(sp+1).trim();
const c=AI_CMDS.find(x=>x.k===key);
if(!c){ AI.msgs.push({role:"user",text:q}); aiSys("ไม่รู้จักคำสั่ง “"+key+"” — พิมพ์ /ช่วย ดูคำสั่งทั้งหมด"); return {done:true}; }
if(c.local==="nav"){ if(!aiLocal(q)){ AI.msgs.push({role:"user",text:q}); aiSys("พิมพ์ชื่อหน้าต่อท้าย เช่น /ไป งบ"); } return {done:true}; }
if(c.local==="clear"){ AI.msgs=[]; AI.pending=null; aiSave(); return {done:true}; }
if(c.local==="help"){ AI.msgs.push({role:"user",text:q}); aiSys("คำสั่งลัด: "+AI_CMDS.map(x=>x.k+(x.a?" <"+x.a+">":"")+" = "+x.d).join(" · ")+"\nสั่งด้วยเสียงก็ได้ เช่น “ไปหน้างบ” “สรุปงานสัปดาห์นี้”"); return {done:true}; }
if(c.a&&!arg){ AI.draft=c.k+" "; AI.msgs.push({role:"user",text:q}); aiSys("พิมพ์ต่อท้ายด้วย: "+c.a+" เช่น "+c.k+" "+c.a); AI.draft=c.k+" "; return {done:true}; }
return {q:c.q.replace("{a}",arg),show:q};
}
function aiRefresh(){ if(view==="ai")render(); aiPopRender(); }

try{ AI.msgs=JSON.parse(localStorage.getItem("sw-ai")||"[]").slice(-30); }catch(e){}
const aiSave=()=>{ try{localStorage.setItem("sw-ai",JSON.stringify(AI.msgs.slice(-30)));}catch(e){} };
async function aiPing(){
try{ const r=await fetch("/api/ai",{cache:"no-store"}); if(!r.ok)throw 0; const j=await r.json(); AI.live=!!j.ready; AI.model=j.model||""; }
catch(e){ AI.live=false; }
aiRefresh(); }
function aiContext(){
const y=THISYEAR, D=execData(y), now=new Date();
const lawTag=t=>isLawItem(t)?" [กฎหมาย]":"";
const QN={q1:"1 ทำเลย",q2:"2 วางแผน",q3:"3 มอบหมาย",q4:"4 ไว้ทีหลัง"};
const row=t=>{const d=dueDate(t); return [t._id,(t.title||"")+lawTag(t),(t.type||gLabel(t.track)),t.company?cLabel(t.company):"-",t.owner||"-",d?isoOf(d):"-",t.status,budgetOf(t)||"-",t.actual||"-",QN[quadOf(t)]||"-"].join(" | ");};
const live=items.filter(t=>!isSysRow(t));
const open=live.filter(t=>isOpenStatus(t.status));
const soon=open.filter(t=>{const d=dueDate(t);return d&&daysTo(d)>=0&&daysTo(d)<=14;}).sort((a,b)=>dueDate(a)-dueDate(b));
const seen=new Set([...D.late,...soon].map(t=>t._id));
const going=open.filter(t=>!seen.has(t._id)&&(t.status==="กำลังดำเนินการ"||t.status==="อยู่ระหว่างดำเนินการ"));
const meets=open.filter(t=>isMeet(t)&&(()=>{const d=dueDate(t);return d&&daysTo(d)>=0&&daysTo(d)<=30;})()).sort((a,b)=>dueDate(a)-dueDate(b));
const nm=k=>k?glLabel(k):"ยังไม่ระบุหมวด GL";
const L=[];
L.push(`วันนี้: ${isoOf(now)} (วัน${DOWFULL[now.getDay()]}) · ปี ${y+543}`);
L.push(`งานในปีนี้ที่ยังเปิดอยู่ ${open.length} งาน · เลยกำหนด ${D.late.length} · ครบใน 14 วัน ${soon.length}`);
L.push("\n== งานเลย Deadline (id | ชื่อ | ประเภท | บริษัท | ผู้รับผิดชอบ | Deadline | สถานะ | งบ | ใช้จริง | Matrix) ==");
D.late.slice(0,40).forEach(t=>L.push(row(t))); if(!D.late.length)L.push("(ไม่มี)");
{ const mi=matrixItems(); const cn=k=>mi.filter(t=>quadOf(t)===k).length, un=mi.filter(t=>!quadOf(t));
const noDl=mi.filter(t=>!dueDate(t));
L.push(`\n== Eisenhower Matrix (งานที่ยังเปิด ไม่รวมประชุม/อบรม) ==\nช่อง 1 ทำเลย (สำคัญ+เร่งด่วน) ${cn("q1")} · ช่อง 2 วางแผน (สำคัญ ไม่เร่งด่วน) ${cn("q2")} · ช่อง 3 มอบหมาย (ไม่สำคัญ แต่เร่งด่วน) ${cn("q3")} · ช่อง 4 ไว้ทีหลัง ${cn("q4")} · ยังไม่จัดลำดับ ${un.length} · ไม่มี Deadline ${noDl.length}`);
const q1=mi.filter(t=>quadOf(t)==="q1").slice(0,15); if(q1.length){ L.push("งานช่อง 1 ทำเลย:"); q1.forEach(t=>L.push(row(t))); }
const unS=un.sort((x,y)=>(dueDate(x)||new Date(8e15))-(dueDate(y)||new Date(8e15))).slice(0,25); if(unS.length){ L.push("งานที่ยังไม่จัดลำดับ (เรียงตาม Deadline):"); unS.forEach(t=>L.push(row(t))); }
const own={}; mi.forEach(t=>{const o=(t.owner||"").trim()||"(ยังไม่ระบุผู้รับผิดชอบ)"; own[o]=own[o]||{n:0,late:0}; own[o].n++; const d=dueDate(t); if(d&&daysTo(d)<0)own[o].late++;});
L.push("ภาระงานรายผู้รับผิดชอบ (ผู้รับผิดชอบ | งานเปิด | เลย Deadline): "+(Object.entries(own).sort((x,y)=>y[1].n-x[1].n).slice(0,12).map(([k,v])=>k+" | "+v.n+" | "+v.late).join(" ; ")||"(ไม่มี)")); }
{ const mi=matrixItems(), qo={q1:0,q2:1,q3:2,q4:3};
const need=mi.map(t=>({t,m:w5Miss(t,"task")})).filter(x=>x.m.length).sort((x,y)=>((qo[quadOf(x.t)]??9)-(qo[quadOf(y.t)]??9))||((dueDate(x.t)||new Date(8e15))-(dueDate(y.t)||new Date(8e15)))).slice(0,20);
L.push(`\n== 5W1H ==\nงานเปิดทั้งหมด ${mi.length} · ข้อมูล 5W1H ครบ ${mi.length-mi.filter(t=>w5Miss(t,"task").length).length} · ยังไม่ครบ ${mi.filter(t=>w5Miss(t,"task").length).length}`);
if(need.length){ L.push("งานที่ 5W1H ยังไม่ครบ (id | ชื่อ | Matrix | Deadline | ขาด):"); need.forEach(x=>L.push([x.t._id,x.t.title,QN[quadOf(x.t)]||"-",(dueDate(x.t)?isoOf(dueDate(x.t)):"-"),x.m.join(",")].join(" | "))); }
const have=mi.filter(w5Has).sort((x,y)=>(dueDate(x)||new Date(8e15))-(dueDate(y)||new Date(8e15))).slice(0,20);
if(have.length){ L.push("รายละเอียด 5W1H ที่กรอกไว้ (id | ชื่อ | Why | Who(ผู้เกี่ยวข้อง) | Where | How):"); have.forEach(t=>L.push([t._id,t.title,t.why||"-",t.inv||"-",t.whr||"-",String(t.how||"-").replace(/\n+/g," / ")].join(" | "))); } }
L.push("\n== งานครบ Deadline ใน 14 วัน ==");
soon.slice(0,40).forEach(t=>L.push(row(t))); if(!soon.length)L.push("(ไม่มี)");
L.push("\n== งานที่กำลังทำ (ที่ยังไม่อยู่ข้างบน) ==");
going.slice(0,25).forEach(t=>L.push(row(t))); if(!going.length)L.push("(ไม่มี)");
L.push("\n== ประชุมใน 30 วัน ==");
meets.slice(0,15).forEach(t=>L.push(row(t)+(t.prepNote?" | เตรียม: "+t.prepNote:""))); if(!meets.length)L.push("(ไม่มี)");
L.push(`\n== งบตามหมวด GL ปี ${y+543} (หมวด | งบตั้งไว้ | ใช้จริง | คงเหลือ | %ใช้ | สถานะ) ==`);
D.gl.slice(0,30).forEach(x=>L.push([nm(x.k),x.s.plan,x.s.act,x.s.left,x.s.plan?Math.round(x.s.pct)+"%":"-",x.s.lvl==="over"?"เกินงบ":x.s.lvl==="warn"?"ใกล้เต็ม":x.s.pace?"เร็วกว่าแผน":x.s.lvl==="nob"?"ไม่ได้ตั้งงบ":"ปกติ"].join(" | ")));
if(!D.gl.length)L.push("(ยังไม่มีงบ)");
L.push(`รวมงบ ${D.B} · ใช้จริง ${D.Ac}`);
L.push(`\n== อบรมปี ${y+543} ==\nรุ่นทั้งหมด ${D.trainN.n} · จัดแล้ว ${D.trainN.done} · ผู้เข้าอบรมแล้ว ${D.trainN.pax} คน · ค่าใช้จ่ายรวม ${D.trainN.cost}`);
L.push("เกณฑ์ฝึกอบรมตามกฎหมาย รายบริษัท (บริษัท | พนักงานเฉลี่ย | นับได้ C | % | ต้องเพิ่ม) — ตัวเลขที่กรอกเอง ไม่ใช่ข้อมูลทางการ:");
D.dsd.forEach(x=>L.push([cLabel(x.c.key),x.k.avg,x.k.C,x.k.pct+"%",x.k.need].join(" | "))); if(!D.dsd.length)L.push("(ไม่มีข้อมูล)");
L.push("\n== ใบรับรอง/คำสั่งแต่งตั้ง ที่เกินกำหนดหรือใกล้ครบ 90 วัน ==");
[...D.lgLate,...D.lgSoon].slice(0,15).forEach(x=>L.push(`${x.L.title} | ${(x.L.comps||[]).map(cLabel).join(",")||"-"} | ${x.L.person||"ยังไม่มีผู้รับผิดชอบ"} | ${x.st.t}`));
if(!D.lgLate.length&&!D.lgSoon.length)L.push("(ไม่มี)");
L.push("\n== กลุ่มงานที่ใช้ได้กับ add_task (key = ชื่อ) ==\n"+groups.map(g=>g.key+" = "+g.label).join(" · "));
L.push("บริษัท (key = ชื่อ): "+realCos().map(c=>c.key+" = "+c.label).join(" · "));
return L.join("\n").slice(0,30000);
}
function aiParse(txt){
let actions=[]; let clean=String(txt||"");
const m=clean.match(/```actions\s*([\s\S]*?)```/i);
if(m){ try{ const a=JSON.parse(m[1].trim()); if(Array.isArray(a))actions=a.filter(x=>x&&typeof x==="object").slice(0,12).map(x=>({...x,state:"pending"})); }catch(e){} clean=clean.replace(m[0],"").trim(); }
return {text:clean,actions};
}
const AI_TYPES=["set_status","move_date","set_owner","set_quad","set_w5","add_task","add_note"];
function aiCheck(a){
const t=a.id?items.find(x=>x._id===a.id):null;
if(!AI_TYPES.includes(a.type))return "ชนิดการแก้ที่แอปไม่รองรับ";
if(["set_status","move_date","set_owner","set_quad","set_w5"].includes(a.type)&&!t)return "ไม่พบงานนี้ในระบบ (id ไม่ตรง)";
if(a.type==="set_status"&&!STATUS.includes(a.status))return "สถานะไม่ถูกต้อง";
if(a.type==="move_date"){ if(!/^\d{4}-\d{2}-\d{2}$/.test(a.date||"")||isNaN(new Date(a.date)))return "วันที่ไม่ถูกต้อง"; if(rr(t))return "เป็นงานเกิดซ้ำ — เลื่อนวันที่ทั้งชุดไม่ได้ ให้แก้เองในงานนั้น"; }
if(a.type==="set_owner"&&!String(a.owner||"").trim())return "ไม่มีชื่อผู้รับผิดชอบ";
if(a.type==="set_quad"&&!quadInfo(a.quad))return "ช่อง Matrix ไม่ถูกต้อง";
if(a.type==="set_w5"&&!W5K.some(k=>w5Txt(a[k])))return "ไม่มีรายละเอียด 5W1H ให้เติม";
if(a.type==="set_quad"&&(isMeet(t)||isTrain(t)))return "ประชุม/อบรมไม่อยู่ใน Matrix";
if((a.type==="add_task"||a.type==="add_note")&&!String(a.title||"").trim())return "ไม่มีชื่อ";
if(a.type==="add_task"&&a.date&&!/^\d{4}-\d{2}-\d{2}$/.test(a.date))return "วันที่ไม่ถูกต้อง";
return "";
}
function aiDescribe(a){
const t=a.id?items.find(x=>x._id===a.id):null, q=v=>"“"+esc(v||"")+"”";
switch(a.type){
case "set_status":return `เปลี่ยนสถานะ ${q(t&&t.title)}: ${esc(t?t.status:"?")} → <b>${esc(a.status)}</b>`;
case "move_date":return `เลื่อน Deadline ${q(t&&t.title)}: ${t&&t.date?fmtDate(t.date):"—"} → <b>${a.date?fmtDate(a.date):"?"}</b>`;
case "set_quad":{const qi=quadInfo(a.quad); return `จัด ${q(t&&t.title)} เข้าช่อง <b>${qi?esc(a.quad.slice(1)+" "+qi[1]):"?"}</b>${t&&quadOf(t)?" (เดิม "+esc(quadInfo(quadOf(t))[1])+")":""}`;}
case "set_w5":return `เติม 5W1H ให้ ${q(t&&t.title)}: ${W5K.filter(k=>w5Txt(a[k])).map(k=>({why:"Why",inv:"Who",whr:"Where",how:"How"}[k])+" “"+esc(w5Txt(a[k]).slice(0,70))+"”").join(" · ")}`;
case "set_owner":return `มอบหมาย ${q(t&&t.title)} ให้ <b>${esc(a.owner)}</b>`;
case "add_task":return `เพิ่มงานใหม่ ${q(a.title)}${a.date?" · กำหนด <b>"+fmtDate(a.date)+"</b>":""}${a.owner?" · "+esc(a.owner):""}`;
case "add_note":return `เพิ่มบันทึก ${q(a.title)}`;}
return "การแก้ที่ไม่รู้จัก";
}
async function aiRun(a){
const bad=aiCheck(a); if(bad)throw new Error(bad);
if(a.type==="set_status")await DB.collection("items").doc(a.id).set({status:a.status},{merge:true});
else if(a.type==="move_date")await DB.collection("items").doc(a.id).set({date:a.date},{merge:true});
else if(a.type==="set_owner")await DB.collection("items").doc(a.id).set({owner:String(a.owner).trim()},{merge:true});
else if(a.type==="set_quad")await DB.collection("items").doc(a.id).set({quad:a.quad},{merge:true});
else if(a.type==="set_w5"){ const d={}; W5K.forEach(k=>{ if(w5Txt(a[k]))d[k]=w5Txt(a[k]).slice(0,600); }); await DB.collection("items").doc(a.id).set(d,{merge:true}); }
else if(a.type==="add_task"){
const track=groups.some(g=>g.key===a.track)?a.track:(groups.find(g=>g.key==="ops")||groups[0]).key;
const company=companies.some(c=>c.key===a.company)?a.company:"";
await saveItem({title:String(a.title).trim(),kind:"task",track,type:"",status:"รอดำเนินการ",date:a.date||null,company,owner:String(a.owner||"").trim(),note:String(a.note||"").trim()+(a.note?"\n":"")+"(เพิ่มโดยผู้ช่วย AI)",quad:quadInfo(a.quad)?a.quad:"",why:w5Txt(a.why).slice(0,400),inv:w5Txt(a.inv).slice(0,200),whr:w5Txt(a.whr).slice(0,300),how:w5Txt(a.how).slice(0,600)});}
else if(a.type==="add_note")await DB.collection("note").add({title:String(a.title).trim(),kind:"โน้ต",date:null,tag:"AI",body:String(a.body||""),color:"",pin:false});
}
const AI_SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const aiMd=t=>esc(t).replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>");
function aiChatHTML(p){
const live=AI.live, msgs=AI.msgs;
const msgHTML=msgs.map((m,i)=>m.role==="user"?`<div class="aib u">${esc(m.show||m.text)}</div>`
:m.role==="sys"?`<div class="aisys">${esc(m.text).replace(/\n/g,"<br>")}</div>`
:`<div class="aib a">${aiMd(m.text)}${(m.actions||[]).map((a,j)=>{const bad=a.state==="pending"?aiCheck(a):"";
return `<div class="aiact ${a.state}"><div class="aid">${aiDescribe(a)}${a.why?`<div class="aiwhy">${esc(a.why)}</div>`:""}${bad?`<div class="aiwhy" style="color:var(--over)">ทำไม่ได้: ${esc(bad)}</div>`:""}${a.state==="error"?`<div class="aiwhy" style="color:var(--over)">ไม่สำเร็จ: ${esc(a.err||"")}</div>`:""}</div>
${a.state==="pending"?`<button class="btn sm" data-aiok="${i}:${j}"${bad?" disabled":""}>ทำตามนี้</button><button class="btn sm ghost" data-aiskip="${i}:${j}">ข้าม</button>`:`<span class="pill ${a.state==="done"?"s-done":"s-wait"}">${a.state==="done"?"ทำแล้ว":a.state==="skipped"?"ข้ามแล้ว":"ไม่สำเร็จ"}</span>`}</div>`;}).join("")}</div>`).join("");
const first=!msgs.length?`<div class="aisys">สวัสดีค่ะวิม 👋 ถามหรือสั่งได้เลย — พิมพ์ <b>/</b> เพื่อดูคำสั่งลัด หรือกดไมค์พูดได้ ถ้าเสนอให้แก้งาน จะขึ้นเป็นการ์ดให้กดยืนยันเองทุกครั้ง</div>`:"";
const mic=AI_SR?`<button class="aimic${AI.listening?" on":""}" id="${p}mic" title="สั่งด้วยเสียง" aria-label="สั่งด้วยเสียง">${svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',20)}</button>`:"";
return `<div class="aistatus">${live?`<span class="bchip">พร้อมใช้งานในแอป</span> <span>${esc(AI.model)}</span>`:`<span class="bchip warn">โหมดคัดลอก–วาง</span> <span>ยังไม่ได้เชื่อม API · ใช้แชท Claude ปกติได้เลย</span> <button class="gcbtn" id="${p}Ping">ตรวจการเชื่อมต่อใหม่</button>`}</div>
<div class="aimsgs" id="${p}msgs">${first}${msgHTML}${AI.busy?`<div class="aisys">กำลังคิด…</div>`:""}</div>
<div class="aichips">${AI_BTNS.map((c,i)=>`<button class="gcbtn" data-aichip="${i}" title="${esc(c.k+" · "+c.d)}">${esc(c.btn)}</button>`).join("")}</div>
<div class="aivnote" id="${p}vnote">${esc(AI.vnote||"")}</div>
<div class="aiinw"><div class="aimenu" id="${p}menu" hidden></div>
<div class="aiin"><textarea id="${p}q" rows="2" placeholder="${live?"พิมพ์คำถาม / สั่งงาน หรือพิมพ์ / ดูคำสั่งลัด":"พิมพ์คำถาม หรือ / ดูคำสั่งลัด (ส่ง = คัดลอกไปวางใน Claude)"}">${esc(AI.draft)}</textarea>
${mic}<button class="btn" id="${p}send"${AI.busy?" disabled":""}>${live?"ส่ง":"คัดลอกคำถาม"}</button></div></div>
${!live&&AI.pending?`<div class="aipaste"><b>ขั้นต่อไป:</b> ${AI.flash?esc(AI.flash):"คัดลอกแล้ว"} → ไปวางที่แชท Claude → ก๊อปคำตอบกลับมาวางตรงนี้
<textarea id="${p}Paste" rows="4" placeholder="วางคำตอบของ Claude ที่นี่"></textarea>
<div style="display:flex;gap:8px;margin-top:8px"><button class="btn sm" id="${p}PasteGo">แสดงคำตอบในแชท</button><button class="btn sm ghost" id="${p}CopyAgain">คัดลอกอีกครั้ง</button></div></div>`:""}`;
}
function aiView(){
if(AI.live===null){AI.live=false; aiPing();}
const live=AI.live, msgs=AI.msgs;
const msgHTML=msgs.map((m,i)=>m.role==="user"?`<div class="aib u">${esc(m.text)}</div>`
:m.role==="sys"?`<div class="aisys">${esc(m.text)}</div>`
:`<div class="aib a">${aiMd(m.text)}${(m.actions||[]).map((a,j)=>{const bad=a.state==="pending"?aiCheck(a):"";
return `<div class="aiact ${a.state}"><div class="aid">${aiDescribe(a)}${a.why?`<div class="aiwhy">${esc(a.why)}</div>`:""}${bad?`<div class="aiwhy" style="color:var(--over)">ทำไม่ได้: ${esc(bad)}</div>`:""}${a.state==="error"?`<div class="aiwhy" style="color:var(--over)">ไม่สำเร็จ: ${esc(a.err||"")}</div>`:""}</div>
${a.state==="pending"?`<button class="btn sm" data-aiok="${i}:${j}"${bad?" disabled":""}>ทำตามนี้</button><button class="btn sm ghost" data-aiskip="${i}:${j}">ข้าม</button>`:`<span class="pill ${a.state==="done"?"s-done":"s-wait"}">${a.state==="done"?"ทำแล้ว":a.state==="skipped"?"ข้ามแล้ว":"ไม่สำเร็จ"}</span>`}</div>`;}).join("")}</div>`).join("");
const first=!msgs.length?`<div class="aisys">สวัสดีค่ะวิม 👋 ถามได้เลย เช่น “สรุปงานสัปดาห์นี้” “งบหมวดไหนต้องระวัง” หรือ “จัดแผนงานสัปดาห์หน้า” — ถ้าผมเสนอให้แก้งาน จะขึ้นเป็นการ์ดให้กดยืนยันเองทุกครั้ง</div>`:"";
return `<div class="head"><div><h1>ผู้ช่วย AI</h1><div class="sub">สรุป · จัดแผน · เตือนงาน · เสนอการแก้ให้กดยืนยัน · ${syncChip()}</div></div>
<div class="noprint"><button class="btn ghost" id="aiClear">ล้างแชท</button></div></div>
<div class="card aiwrap">${aiChatHTML("ai")}</div>
<div class="card" style="margin-top:16px"><h2>ความเป็นส่วนตัวและการตั้งค่า</h2>
<details class="foldbox"><summary>ข้อมูลอะไรถูกส่งออกไปบ้าง</summary><div class="hint">ส่งเฉพาะสรุปที่แอปรวบรวม: รายการงานที่ยังไม่เสร็จ (ชื่อ ผู้รับผิดชอบ กำหนด งบ) งบตามหมวด GL สรุปอบรม/เกณฑ์กรมพัฒนาฯ แบบตัวเลขรวม และสถานะใบรับรอง — <b>ไม่มีรายชื่อหรือข้อมูลรายบุคคลของพนักงาน</b> (ระบบไม่ได้เก็บอยู่แล้ว) โหมดฝัง AI จะส่งไปยัง Anthropic ผ่านเซิร์ฟเวอร์ของคุณเอง ส่วนโหมดคัดลอก–วาง คุณเป็นคนวางเองในแชท Claude</div></details>
<details class="foldbox"><summary>วิธีเปิดโหมดฝัง AI (ตอบในแอปเลย)</summary><div class="hint">
1) สมัคร/ล็อกอิน <b>console.anthropic.com</b> → API keys → สร้าง key (เสียค่าใช้จ่ายตามการใช้งาน แยกจากแพ็กเกจแชท) · ตั้งวงเงินรายเดือนไว้กันพลาดได้<br>
2) Vercel → โปรเจคของคุณ → Settings → Environment Variables → เพิ่ม 3 ตัว: <b>ANTHROPIC_API_KEY</b> (key ข้อ 1) · <b>SUPABASE_URL</b> (Project URL) · <b>SUPABASE_ANON_KEY</b> (anon public key)<br>
3) กด Redeploy แล้วกลับมาหน้านี้ กด “ตรวจการเชื่อมต่อใหม่”<br>
<b>อย่าวาง API key ในแชท ในไฟล์ app.js หรือในหน้าแอป</b> — ใส่ที่ Vercel ที่เดียว · ตัวแปรเสริม: ALLOWED_EMAILS (จำกัดอีเมลที่ใช้ได้) · AI_MODEL (ชื่อรุ่นโมเดล)</div></details></div>`;
}
async function aiSend(q){
q=(q||"").trim(); if(!q||AI.busy)return;
AI.draft=""; let show="";
if(q[0]==="/"){ const r=aiSlash(q); if(r.done){ aiRefresh(); return; } show=r.show; q=r.q; }
else if(aiLocal(q)){ aiRefresh(); return; }
AI.msgs.push({role:"user",text:q,show:show||undefined}); aiSave();
if(!AI.live){ AI.pending=q; AI.flash=await aiCopyPrompt()?"คัดลอกข้อมูล+คำถามให้แล้ว":"คัดลอกอัตโนมัติไม่สำเร็จ กด “คัดลอกอีกครั้ง”"; aiRefresh(); return; }
AI.busy=true; aiRefresh();
try{
let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
const turns=[]; AI.msgs.filter(m=>m.role==="user"||m.role==="assistant").slice(-12).forEach(m=>{const c=m.text||""; if(turns.length&&turns[turns.length-1].role===m.role)turns[turns.length-1].content+="\n"+c; else turns.push({role:m.role,content:c});});
const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:AI_SYSTEM,context:aiContext(),messages:turns})});
const j=await r.json().catch(()=>({}));
if(!r.ok)throw new Error(j.message||("ผิดพลาด "+r.status));
const p=aiParse(j.text); AI.msgs.push({role:"assistant",text:p.text||"(ไม่มีข้อความตอบกลับ)",actions:p.actions});
}catch(e){ AI.msgs.push({role:"sys",text:"ติดต่อ AI ไม่สำเร็จ: "+(e.message||e)}); }
AI.busy=false; aiSave(); aiRefresh();
}
function aiPromptText(){
const hist=AI.msgs.filter(m=>m.role==="user"||m.role==="assistant").slice(-9,-1).map(m=>(m.role==="user"?"วิม: ":"ผู้ช่วย: ")+m.text).join("\n");
const last=[...AI.msgs].reverse().find(m=>m.role==="user");
return AI_SYSTEM+"\n\n[ข้อมูลในระบบ]\n"+aiContext()+(hist?"\n\n[บทสนทนาก่อนหน้า]\n"+hist:"")+"\n\n[คำถามล่าสุดของวิม]\n"+(last?last.text:"");
}
async function aiCopyPrompt(){
const t=aiPromptText();
try{ await navigator.clipboard.writeText(t); return true; }catch(e){}
try{ const ta=document.createElement("textarea"); ta.value=t; ta.style.cssText="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); const ok=document.execCommand("copy"); ta.remove(); return ok; }catch(e){ return false; }
}
function aiVoiceUI(){
document.querySelectorAll(".aimic").forEach(b=>b.classList.toggle("on",!!AI.listening));
document.querySelectorAll(".aivnote").forEach(n=>n.textContent=AI.vnote||"");
}
let aiRec=null;
function aiMic(p){
if(!AI_SR){ AI.vnote="เบราว์เซอร์นี้ไม่รองรับสั่งด้วยเสียง (ใช้ Chrome / Edge / Safari)"; aiVoiceUI(); return; }
if(AI.listening){ try{aiRec&&aiRec.stop();}catch(e){} return; }
const r=new AI_SR(); aiRec=r; r.lang="th-TH"; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
const base=(AI.draft||"").trim(); let fin="", heard=false;
const put=t=>{ const v=(base?base+" ":"")+t; AI.draft=v; const q=el(p+"q"); if(q)q.value=v; };
r.onstart=()=>{ AI.listening=true; AI.vnote="🎤 กำลังฟัง… พูดได้เลย"; aiVoiceUI(); };
r.onresult=e=>{ let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const t=e.results[i][0].transcript; if(e.results[i].isFinal)fin+=t; else interim+=t; } heard=true; put((fin+interim).trim()); };
r.onerror=e=>{ AI.vnote=e.error==="not-allowed"||e.error==="service-not-allowed"?"ยังไม่ได้อนุญาตไมโครโฟน — กดอนุญาตที่เบราว์เซอร์แล้วลองใหม่":e.error==="no-speech"?"ไม่ได้ยินเสียง ลองกดไมค์แล้วพูดใหม่":e.error==="aborted"?"":"ไมค์ผิดพลาด: "+e.error; };
r.onend=()=>{ AI.listening=false; aiRec=null; const t=(AI.draft||"").trim();
 if(heard&&t){ if(AI.live||/^(ไป|เปิด)/.test(t)||t[0]==="/"){ AI.vnote="ได้ยินว่า: “"+t+"” — กำลังส่ง"; aiVoiceUI(); aiSend(t); setTimeout(()=>{AI.vnote="";aiVoiceUI();},2500); return; } AI.vnote="ได้ยินว่า: “"+t+"” — แก้ได้แล้วกดส่ง"; }
 else if(!AI.vnote||/^🎤/.test(AI.vnote))AI.vnote="";
 aiVoiceUI(); };
try{ r.start(); }catch(e){ AI.listening=false; AI.vnote="เริ่มฟังไม่สำเร็จ ลองใหม่"; aiVoiceUI(); }
}
function aiMenuUpdate(p,v){
const m=el(p+"menu"); if(!m)return;
if(!v||v[0]!=="/"||/\s/.test(v.trim())&&v.trim().indexOf(" ")>-1&&AI_CMDS.some(c=>v.startsWith(c.k+" "))){ m.hidden=true; m.innerHTML=""; return; }
const f=AI_CMDS.filter(c=>c.k.startsWith(v.trim())||v.trim()==="/");
if(!f.length){ m.hidden=true; m.innerHTML=""; return; }
m.hidden=false; m.innerHTML=f.map(c=>`<button type="button" data-aicmd="${esc(c.k)}"><b>${esc(c.k)}</b>${c.a?` <i>${esc(c.a)}</i>`:""}<span>${esc(c.d)}</span></button>`).join("");
m.querySelectorAll("[data-aicmd]").forEach(b=>b.onmousedown=e=>{ e.preventDefault(); const c=AI_CMDS.find(x=>x.k===b.dataset.aicmd); m.hidden=true;
 if(c.a){ AI.draft=c.k+" "; const q=el(p+"q"); if(q){q.value=AI.draft;q.focus();} } else aiSend(c.k); });
}
function aiWireChat(root,p){
if(!root)return;
const q=el(p+"q");
if(q){ q.oninput=()=>{AI.draft=q.value; aiMenuUpdate(p,q.value);};
 q.onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); const m=el(p+"menu"); const v=q.value.trim();
  if(m&&!m.hidden&&!AI_CMDS.some(c=>v===c.k||v.startsWith(c.k+" "))){ const b=m.querySelector("[data-aicmd]"); if(b){ b.onmousedown({preventDefault(){}}); return; } }
  aiSend(q.value); } else if(e.key==="Escape"){ const m=el(p+"menu"); if(m&&!m.hidden){ m.hidden=true; e.stopPropagation(); } } }; }
const sd=el(p+"send"); if(sd)sd.onclick=()=>aiSend(q?q.value:"");
const mc=el(p+"mic"); if(mc)mc.onclick=()=>aiMic(p);
root.querySelectorAll("[data-aichip]").forEach(b=>b.onclick=()=>aiSend(AI_BTNS[+b.dataset.aichip].k));
const pg=el(p+"Ping"); if(pg)pg.onclick=()=>aiPing();
const ca=el(p+"CopyAgain"); if(ca)ca.onclick=async()=>{AI.flash=(await aiCopyPrompt())?"คัดลอกให้อีกครั้งแล้ว":"คัดลอกไม่สำเร็จ ลองใหม่"; aiRefresh();};
const pgo=el(p+"PasteGo"); if(pgo)pgo.onclick=()=>{ const v=(el(p+"Paste").value||"").trim(); if(!v)return; const r=aiParse(v); AI.msgs.push({role:"assistant",text:r.text||"(ไม่มีข้อความ)",actions:r.actions}); AI.pending=null; aiSave(); aiRefresh(); };
root.querySelectorAll("[data-aiskip]").forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.aiskip.split(":").map(Number); AI.msgs[i].actions[j].state="skipped"; aiSave(); aiRefresh();});
root.querySelectorAll("[data-aiok]").forEach(b=>b.onclick=async()=>{const [i,j]=b.dataset.aiok.split(":").map(Number); const a=AI.msgs[i].actions[j];
try{ await aiRun(a); a.state="done"; }catch(e){ a.state="error"; a.err=e.message||String(e); } aiSave(); aiRefresh();});
const box=el(p+"msgs"); if(box)box.scrollTop=box.scrollHeight;
}
function aiWire(){
aiWireChat(el("view"),"ai");
el("aiClear")&&(el("aiClear").onclick=()=>{AI.msgs=[];AI.pending=null;aiSave();aiRefresh();});
}
// ---- หน้าต่างผู้ช่วยลอย (อยู่ทุกหน้า ไม่ต้องย้ายไปหน้า AI)
function aiPopRender(){
const pop=el("aipop"); if(!pop)return;
const show=AI.open&&view!=="ai"&&!LOADING;
pop.hidden=!show; const fb=el("aifab"); if(fb){ fb.hidden=(view==="ai"); fb.classList.toggle("open",show); fb.setAttribute("aria-expanded",show?"true":"false"); }
if(!show){ if(AI.listening){try{aiRec&&aiRec.stop();}catch(e){}} return; }
if(AI.live===null){AI.live=false; aiPing();}
const hadFocus=document.activeElement&&document.activeElement.id==="afq"; const caret=hadFocus?document.activeElement.selectionStart:0;
pop.innerHTML=`<div class="aipoph"><b>${svg(ICON.ai,16)} ผู้ช่วย AI</b><span class="grow"></span>
<button class="aipb" id="afFull" title="เปิดเต็มหน้า" aria-label="เปิดเต็มหน้า">${svg('<path d="M14 4h6v6M20 4l-8 8M10 20H4v-6M4 20l8-8"/>',16)}</button>
<button class="aipb" id="afClear" title="ล้างแชท" aria-label="ล้างแชท">${svg('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',16)}</button>
<button class="aipb" id="afClose" title="ปิด" aria-label="ปิด">${svg('<path d="M6 6l12 12M18 6L6 18"/>',16)}</button></div>
<div class="aipopb">${aiChatHTML("af")}</div>`;
aiWireChat(pop,"af");
el("afFull").onclick=()=>{ AI.open=false; aiGo("ai"); };
el("afClear").onclick=()=>{AI.msgs=[];AI.pending=null;aiSave();aiRefresh();};
el("afClose").onclick=()=>{ AI.open=false; aiPopRender(); };
if(hadFocus){ const q=el("afq"); if(q){q.focus(); try{q.setSelectionRange(caret,caret);}catch(e){}} }
}
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&AI.open&&view!=="ai"&&!e.defaultPrevented){ AI.open=false; aiPopRender(); } });
function aiPopToggle(){ AI.open=!AI.open; aiPopRender(); if(AI.open){ const q=el("afq"); if(q)q.focus(); } }

function matrixItems(){ return items.filter(t=>!isSysRow(t)&&isOpenStatus(t.status)&&!isMeet(t)&&!isTrain(t)); }
function mxDl(t){ const d=dueDate(t); if(!d)return {txt:"ยังไม่มี Deadline",cls:"",n:1e9};
const n=daysTo(d); return {txt:(n<0?"เลย "+(-n)+" วัน · ":n===0?"วันนี้ · ":n===1?"พรุ่งนี้ · ":n<=7?"อีก "+n+" วัน · ":"")+fmtDate(isoOf(d)),cls:n<0?"late":n<=2?"soon":"",n}; }
function gapsView(){
const F2=R.gapF||"", qo={q1:0,q2:1,q3:2,q4:3};
const rows=matrixItems().map(t=>({t,m:w5Miss(t,"task")})).sort((x,y)=>((qo[quadOf(x.t)]??9)-(qo[quadOf(y.t)]??9))||(mxDl(x.t).n-mxDl(y.t).n));
const bad=rows.filter(x=>x.m.length), full=rows.length-bad.length, pct=rows.length?Math.round(full/rows.length*100):100;
const cnt=k=>bad.filter(x=>x.m.includes(k)).length, shown=F2?bad.filter(x=>x.m.includes(F2)):bad;
const KEYS=[["Why","ทำไม"],["Who","ใคร"],["When","เมื่อไหร่"],["Where","ที่ไหน"],["How","อย่างไร"]];
const row=x=>{ const t=x.t, dl=mxDl(t), q=quadOf(t);
return `<div class="li" data-id="${t._id}"><div class="ic" style="background:var(--line-2);color:var(--ink-2)">${x.m.length}<br>ช่อง</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2">${q?`<b class="qtag q-${q}">${q.slice(1)} ${esc(quadInfo(q)[1])}</b> · `:""}<span class="${dl.cls}">${esc(dl.txt)}</span>${t.owner?" · "+esc(t.owner):""}${t.company?" · "+esc(cLabel(t.company)):""}</div>
<div class="gapchips">${x.m.map(k=>`<b>ขาด ${k}</b>`).join("")}</div></div><span class="pill s-wait">เติม</span></div>`; };
return header("งานค้างข้อมูล","งานที่ข้อมูล 5W1H ยังไม่ครบ · แตะงานเพื่อเติม (Where นับเฉพาะงานทั่วไป)",false)+
`<div class="head" style="margin-top:-6px"><div></div><button class="btn addbtn" id="add">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มงาน</span></button></div>
<div class="dash"><div class="card hero span2"${tipAttr("งานเปิดที่ข้อมูลครบ 5W1H · "+pct+"%","ครบทั้ง 5W1H|"+full+" งาน","ยังไม่ครบ|"+bad.length+" งาน","งานเปิดทั้งหมด|"+rows.length,...KEYS.map(([k,l])=>"ขาด "+k+" ("+l+")|"+cnt(k)+" งาน"),"งานเปิด = ยังไม่เสร็จ/ไม่ยกเลิก ไม่รวมประชุมและอบรม")}><div class="lab">งานเปิดที่ข้อมูลครบ 5W1H</div><div class="big">${pct}%</div>
<div class="meta"><span>ครบ ${full}</span><span>ยังไม่ครบ ${bad.length}</span><span>ทั้งหมด ${rows.length}</span></div></div>
<div class="card span2"><div class="lab" style="font-size:13px;color:var(--ink-3)">ขาดอะไรมากสุด (แตะเพื่อกรอง)</div>
<div class="gapf" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">${KEYS.map(([k,l])=>`<button type="button" class="gcbtn${F2===k?" on":""}" data-gapf="${k}"${tipAttr(k+" · "+l+" — ขาด "+cnt(k)+" งาน",tipList(bad.filter(x=>x.m.includes(k)),x=>x.t.title,6),"แตะเพื่อกรองเฉพาะงานที่ขาดข้อนี้")}>${k} · ${l} <b>${cnt(k)}</b></button>`).join("")}${F2?`<button type="button" class="gcbtn" data-gapf="">ล้างตัวกรอง</button>`:""}</div>
<div style="margin-top:12px"><button type="button" class="btn sm" id="gapAI">✨ ให้ AI เสนอเติมให้ (/5w1h)</button></div></div></div>
<div class="card"><h2>${F2?"ขาด "+F2:"รอเติมข้อมูล"} <small>${shown.length} งาน · เรียงตาม Matrix แล้ว Deadline</small></h2>
<div class="list">${shown.map(row).join("")||`<div class="empty">${rows.length?"ข้อมูลครบทุกงานแล้ว 🎉":"ยังไม่มีงานเปิด"}</div>`}</div></div>`;
}
function matrixView(){
const list=matrixItems().sort((x,y)=>mxDl(x).n-mxDl(y).n);
const by=k=>list.filter(t=>quadOf(t)===k), none=list.filter(t=>!quadOf(t));
const card=t=>{ const dl=mxDl(t), q=quadOf(t); return `<div class="mxc" data-mx="${t._id}">
<div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2"><span class="${dl.cls}">${esc(dl.txt)}</span>${t.owner?`<span>· ${esc(t.owner)}</span>`:""}${t.company?`<span>· ${esc(cLabel(t.company))}</span>`:""}</div>
<div class="mxmv"><span>ย้ายไป</span>${QUADS.map((x,i)=>`<button type="button" class="b${i+1}${q===x[0]?" cur":""}" data-qm="${t._id}:${x[0]}" title="${esc(x[1]+" · "+x[2])}">${i+1}</button>`).join("")}${q?`<button type="button" class="bx" data-qm="${t._id}:" title="ถอดออกจาก Matrix">ล้าง</button>`:""}</div></div>`; };
return header("Matrix งาน","จัดลำดับงานตามความสำคัญ × ความเร่งด่วน (Eisenhower) · แตะเลข 1–4 เพื่อย้ายช่อง",false)+
`<div class="head" style="margin-top:-6px"><div></div><button class="btn addbtn" id="add">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มงาน</span></button></div>
<div class="mxgrid">${QUADS.map((x,i)=>{const L=by(x[0]); return `<div class="mxq ${x[0]}"><h3>${i+1}. ${x[1]} <small>${x[2]}</small><span class="mxn"${tipAttr(i+1+". "+x[1]+" · "+x[2]+" — "+L.length+" งาน",L.filter(t=>mxDl(t).n<0).length?"เลย Deadline แล้ว|"+L.filter(t=>mxDl(t).n<0).length+" งาน":"",tipList(L,t=>t.title+" · "+mxDl(t).txt,6))}>${L.length}</span></h3>
<div class="mxh">${x[4]}</div>
<div class="mxlist">${L.map(card).join("")||`<div class="empty" style="color:inherit;opacity:.6">ยังไม่มีงานในช่องนี้</div>`}</div></div>`;}).join("")}</div>
<div class="mxtray"><h2 style="font-family:var(--head);font-size:16px;margin:0 0 4px">ยังไม่จัดลำดับ <small style="font-family:var(--sans);font-weight:400;color:var(--ink-3)">${none.length} งาน · เรียงตาม Deadline</small></h2>
<div class="sub" style="margin-bottom:10px">เลือกช่อง 1–4 ที่ท้ายแต่ละงาน หรือพิมพ์ <b>/จัดลำดับ</b> ในผู้ช่วย AI ให้ช่วยเสนอก็ได้ (คุณกดยืนยันเอง)</div>
<div class="mxlist">${none.slice(0,40).map(card).join("")||`<div class="empty">จัดครบทุกงานแล้ว 🎉</div>`}${none.length>40?`<div class="sub" style="text-align:center">…และอีก ${none.length-40} งาน (เลือก Deadline ใกล้สุดมาให้ก่อน)</div>`:""}</div></div>`;
}
function pipeline(){
const g=k=>items.filter(t=>t.track===k&&inScope(t));
const card=t=>`<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${svg(ICON.pipeline,17)}</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div><div class="t2">${esc(t.note||t.group||gLabel(t.track))}</div></div>
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
// รายการที่ยกเลิกแล้วไม่ต้องเข้าคิวเตือน/ตารางล่วงหน้า
const withNext=ms.filter(t=>t.status!==STATUS_CANCEL).map(t=>({t,d:dueDate(t),p:prepDate(t)})).filter(x=>x.d);
const today=new Date(); today.setHours(0,0,0,0);
const upcoming=withNext.filter(x=>daysTo(x.d)>=0&&daysTo(x.d)<=14).sort((a,b)=>a.d-b.d);
const prep=withNext.filter(x=>x.p&&isOpenStatus(x.t.status)&&daysTo(x.d)>=0).sort((a,b)=>a.p-b.p);
const prepNow=prep.filter(x=>daysTo(x.p)<=0), prepSoon=prep.filter(x=>daysTo(x.p)>0&&daysTo(x.p)<=7);
const routine=ms.filter(t=>rr(t)).sort((a,b)=>(nextOcc(a)||0)-(nextOcc(b)||0));
const oneoff=ms.filter(t=>!rr(t)&&t.date).sort((a,b)=>a.date<b.date?-1:1);
const row=(t,d,p)=>{const n=d?daysTo(d):null;
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2">${tShow(t.time)?`<b style="color:var(--accent)">${tShow(t.time)}</b> · `:""}${rruleText(t)?esc(rruleText(t))+" · ":""}${n!=null?(n===0?"วันนี้":n===1?"พรุ่งนี้":n<0?"ผ่านไปแล้ว":"อีก "+n+" วัน"):""}${t.place?" · "+esc(t.place):""}${t.attendees?" · "+esc(t.attendees):""}</div></div>
${p&&isOpenStatus(t.status)?`<span class="tag${daysTo(p)<=0?"":" sky"}" ${daysTo(p)<=0?'style="background:var(--over-soft);color:var(--over);font-weight:600"':""}>เตรียม ${daysTo(p)<=0?"แล้ว!":"อีก "+daysTo(p)+" ว."}</span>`:""}
${(()=>{const S=occState(t);
return `<span class="pill ${S.cls}">${esc(S.label)}</span>`+
(S.recur&&S.d?`<button class="okbtn" data-done="${t._id}|${isoOf(S.d)}" title="ปิดรอบ ${S.d.getDate()} ${MTH[S.d.getMonth()]}">${svg(ICON.check,15)}</button>
<button class="okbtn skipnow" data-skipnow="${t._id}|${isoOf(S.d)}" title="งดรอบ ${S.d.getDate()} ${MTH[S.d.getMonth()]} (ไม่จัดรอบนี้)">งด</button>`:"");})()}</div>`;};
const prepRow=x=>`<div class="li" data-id="${x.t._id}">
<div class="ic" style="background:${daysTo(x.p)<=0?"var(--over-soft)":"var(--run-soft)"};color:${daysTo(x.p)<=0?"var(--over)":"var(--run)"}">${x.p.getDate()}<br>${MTH[x.p.getMonth()]}</div>
<div class="tx"><div class="t1">${esc(x.t.title)}</div>
<div class="t2">ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${tShow(x.t.time)?" "+tShow(x.t.time):""} · เตรียมล่วงหน้า ${x.t.prepDays} วัน${x.t.prepNote?" · "+esc(x.t.prepNote):""}</div></div>
<span class="pill ${daysTo(x.p)<=0?"s-wait":sCls(x.t.status)}">${daysTo(x.p)<0?"เลยวันเตรียม "+(-daysTo(x.p))+" วัน":daysTo(x.p)===0?"เตรียมวันนี้":"อีก "+daysTo(x.p)+" วัน"}</span></div>`;
const byDow=DOWFULL.map((_,i)=>routine.filter(t=>(t.rrule.weekdays||[]).includes(i)).length);
const byDowTip=DOWFULL.map((d,i)=>tipList(routine.filter(t=>(t.rrule.weekdays||[]).includes(i)),t=>(tShow(t.time)?tShow(t.time)+" ":"")+t.title+" · "+rruleText(t),7));
return header("การประชุม","ประชุมประจำ ประชุมเฉพาะกิจ และงานที่ต้องเตรียมข้อมูลก่อนประชุม")+
`<div class="toolbar">${scopeBar("sc1")} ${pqBox("ค้นหาการประชุม / ผู้เข้าร่วม / สถานที่")}</div>`+
(prepNow.length?`<div class="banner bad" ${regList("prepNow","ถึงกำหนดเตรียมข้อมูลแล้ว",prepNow.map(x=>({id:x.t._id,
t1:x.t.title,t2:`ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${tShow(x.t.time)?" "+tShow(x.t.time):""}${x.t.prepNote?" · "+x.t.prepNote:""}`,
d:`${x.p.getDate()}<br>${MTH[x.p.getMonth()]}`,c:"var(--over-soft)",ic:"var(--over)",
p:daysTo(x.p)<0?"เลย "+(-daysTo(x.p))+" วัน":"วันนี้",pc:"s-over"})))}>${svg(ICON.bell,19)} ถึงกำหนดเตรียมข้อมูลแล้ว <b>${prepNow.length}</b> การประชุม — ${esc(prepNow.slice(0,2).map(x=>x.t.title).join(" · "))}${prepNow.length>2?" …":""}</div>`:"")+
(prepSoon.length?`<div class="banner" ${regList("prepSoon","ใกล้ถึงวันเตรียมข้อมูล",prepSoon.map(x=>({id:x.t._id,
t1:x.t.title,t2:`ประชุม ${x.d.getDate()} ${MTH[x.d.getMonth()]}${x.t.prepNote?" · "+x.t.prepNote:""}`,
d:`${x.p.getDate()}<br>${MTH[x.p.getMonth()]}`,c:"var(--run-soft)",ic:"var(--run)",p:"อีก "+daysTo(x.p)+" วัน",pc:"s-run"})))}>${svg(ICON.clock,19)} ใกล้ถึงวันเตรียมข้อมูล <b>${prepSoon.length}</b> การประชุมใน 7 วัน</div>`:"")+
`<div class="dash">
<div class="card hero span2"${tipAttr("การประชุม · "+scopeLabel()+" · "+scoped.length+" รายการ","ประชุมประจำ (เกิดซ้ำ)|"+routine.length+" รายการ","ประชุมเฉพาะกิจ (วันเดียว)|"+oneoff.length+" รายการ","ยกเลิกแล้ว|"+scoped.filter(t=>t.status===STATUS_CANCEL).length)}><div class="lab">การประชุม · ${scopeLabel()}</div>
<div class="big">${scoped.length}</div>
<div class="meta"><span>ประชุมประจำ ${routine.length} รายการ</span><span>เฉพาะกิจ ${oneoff.length} รายการ</span></div></div>
<div class="card stat"${tipAttr("ต้องเตรียมข้อมูลก่อนประชุม · "+prep.length+" รายการ",prepNow.length?"ถึงกำหนดเตรียมแล้ว|"+prepNow.length:"ยังไม่ถึงกำหนดเตรียม",tipList(prep,x=>x.t.title+" · เริ่มเตรียม "+fmtDate(isoOf(x.p)),6))}><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> ต้องเตรียมข้อมูล</div>
<div class="v">${prep.length}</div><div class="d">${prepNow.length?`ถึงกำหนดแล้ว ${prepNow.length}`:"ยังไม่ถึงกำหนด"}</div></div>
<div class="card stat"${tipAttr("ประชุมใน 14 วันข้างหน้า · "+upcoming.length+" ครั้ง",tipList(upcoming,x=>fmtDate(isoOf(x.d))+" "+(tShow(x.t.time)?tShow(x.t.time)+" ":"")+x.t.title,7))}><div class="k"><span class="ic">${svg(ICON.cal,16)}</span> ใน 14 วันข้างหน้า</div>
<div class="v">${upcoming.length}</div><div class="d">ครั้งถัดไป ${upcoming[0]?upcoming[0].d.getDate()+" "+MTH[upcoming[0].d.getMonth()]:"—"}</div></div>
<div class="card span2"><h2>ต้องเตรียมข้อมูลก่อนประชุม <small>เรียงตามวันที่ต้องเริ่มเตรียม</small></h2>
<div class="list">${prep.slice(0,10).map(prepRow).join("")||`<div class="empty">ยังไม่มีการประชุมที่ตั้งวันเตรียมข้อมูลไว้ — เปิดการประชุมแล้วใส่ “เตรียมล่วงหน้า (วัน)”</div>`}</div></div>
<div class="card span2"><h2>ตารางประชุม 14 วันข้างหน้า <small>${upcoming.length} ครั้ง</small></h2>
<div class="list">${upcoming.slice(0,12).map(x=>row(x.t,x.d,x.p)).join("")||`<div class="empty">ไม่มีการประชุมใน 14 วันนี้</div>`}</div></div>
<div class="card span2"><h2>ประชุมประจำรายสัปดาห์ <small>กระจายตามวัน</small></h2>
${bars(byDow.map(v=>v),DOW,v=>v||"",new Date().getDay(),byDowTip,"รายการ","ประชุมประจำ")}</div>
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
const ty=items.filter(t=>isTrain(t)&&inScope(t)&&pqHit(t.title,t.batch,t.course,t.code,ypNoOf(t),t.dsdCertNo,t.company&&cLabel(t.company)));
const byDsdStatus=d=>items.filter(t=>isTrain(t)&&(t.dsd||"")===d&&inScope(t));
const waiting=byDsdStatus("รอยื่น"), sent=byDsdStatus("ยื่นแล้ว"), okd=byDsdStatus("อนุมัติแล้ว"), bad=byDsdStatus("ไม่ผ่าน");
const need=dsdList(R.year).map(c=>dsdCalc(dsdRec(c.key,R.year)).need).reduce((a,b)=>a+b,0);
const card=t=>{const d=dueDate(t);
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2">${crsChip(t)}${t.company?esc(cLabel(t.company))+" · ":""}${esc(t.batch||"ยังไม่ระบุรุ่น")}${t.pax?" · "+t.pax+" คน":""}</div></div>
${t.dsd&&t.dsd!=="ไม่ต้องยื่น"?`<span class="tag sky">${esc(t.dsd)}</span>`:""}
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;};
const dl=ty.filter(t=>t.dsd&&t.dsd!=="ไม่ต้องยื่น"||ypNoOf(t)||t.dsdCertNo);
const dlOpen=dl.filter(t=>t.status!==STATUS_CANCEL);
const late=dlOpen.map(t=>({t,y:ypState(t)})).filter(x=>x.y.n!=null&&x.y.n<0);
const soon=dlOpen.map(t=>({t,y:ypState(t)})).filter(x=>x.y.n!=null&&x.y.n>=0&&x.y.n<=14);
const mkRows=arr=>arr.map(({t,y})=>({id:t._id,t1:t.title,
t2:`${crsCodeOf(t)?crsCodeOf(t)+" · ":""}${t.company?cLabel(t.company)+" · ":""}${t.batch||"ยังไม่ระบุรุ่น"} · ${y.step}${y.note?" · "+y.note:""}`,
d:y.due?`${y.due.getDate()}<br>${MTH[y.due.getMonth()]}`:"—",p:y.msg||"",pc:y.cls,
c:y.cls==="s-over"?"var(--over-soft)":"var(--run-soft)",ic:y.cls==="s-over"?"var(--over)":"var(--run)"}));
const now=new Date(), yearEndLeft=Math.round((new Date(R.year,11,31)-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);
const anyShort=dsdList(R.year).some(c=>{const k=dsdCalc(dsdRec(c.key,R.year));return k.avg&&k.need>0;});
return header("กรมพัฒนาฝีมือแรงงาน","เกณฑ์ 50% ต่อปี และทะเบียนการยื่นรับรองหลักสูตร")+
`<div class="toolbar">${scopeBar("sc1")} ${pqBox("ค้นหาหลักสูตร / เลขคำขอ / บริษัท")}</div>`+
dsdAnnualBanner()+
(late.length?`<div class="banner bad" ${regList("ypLate","เลยกำหนดยื่นตามขั้นตอนกรมพัฒนาฯ",mkRows(late))}>${svg(ICON.bell,19)} เลยกำหนดยื่นแล้ว <b>${late.length}</b> หลักสูตร — ยื่นย้อนหลังไม่ได้ ตรวจด่วน</div>`:"")+
(soon.length?`<div class="banner" ${regList("ypSoon","ใกล้ถึงกำหนดยื่น (ภายใน 14 วัน)",mkRows(soon))}>${svg(ICON.clock,19)} ใกล้ถึงกำหนดยื่น <b>${soon.length}</b> หลักสูตร ภายใน 14 วัน</div>`:"")+
((now.getMonth()>=10&&yearEndLeft>=0&&anyShort&&now.getFullYear()===R.year)
?`<div class="banner bad">${svg(ICON.bell,19)} เหลือ <b>${yearEndLeft}</b> วันถึง 31 ธ.ค. ${R.year+543} — ยังไม่ครบเกณฑ์ 50% และเลยสิ้นปีจะยื่นรับรองของปีนี้ไม่ได้อีก</div>`:"")+
(waiting.length?`<div class="banner" ${regList("dsdWait","หลักสูตรที่รอยื่นกรมพัฒนาฯ",waiting.map(t=>{const d=dueDate(t);return {id:t._id,
t1:t.title,t2:`${crsCodeOf(t)?crsCodeOf(t)+" · ":""}${t.company?cLabel(t.company)+" · ":""}${t.batch||"ยังไม่ระบุรุ่น"}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--run-soft)",ic:"var(--run)",p:"รอยื่น",pc:"s-run"};}))}>${svg(ICON.bell,19)} รอยื่นกรมพัฒฯ <b>${waiting.length}</b> หลักสูตร</div>`:"")+
(need?`<div class="banner bad">${svg(ICON.bell,19)} ยังไม่ถึงเกณฑ์ 50% — ต้องฝึกอีกรวม <b>${baht(need)}</b> คน</div>`:"")+
`<div class="dash">
${(()=>{const T=dsdTotals(R.year);
const pass=T.pct>=50;
return `<div class="card hero span2" style="padding-bottom:20px"${tipAttr("สรุปเกณฑ์กรมพัฒนาฯ ปี "+(R.year+543)+" · "+(T.mp?T.pct+"%":"—"),"พนักงานเฉลี่ยรวม|"+baht(T.mp)+" คน","เกณฑ์กฎหมาย "+LAWPCT+"%|"+baht(T.target)+" คน","ทำได้แล้ว (C)|"+baht(T.C)+" คน",T.need?"ขาดถึงเกณฑ์|"+baht(T.need)+" คน":"ครบเกณฑ์แล้ว",T.goalTarget>T.target?"เป้าที่ตั้งเอง "+T.goalPct+"%|"+baht(T.goalTarget)+" คน":"","ผ่านเกณฑ์|"+T.done+" จาก "+T.n+" แห่ง",T.subTotal?"เงินอุดหนุนคาดว่าได้|"+baht(T.subTotal)+" ฿":"","C = จำนวนคนที่นับได้ว่าผ่านการฝึกตามเงื่อนไขกรมฯ (กรอกที่ตารางด้านล่าง)")}>
<div class="lab">สรุปเกณฑ์กรมพัฒนาฝีมือแรงงาน · ปี ${R.year+543} · ${T.n} สถานประกอบกิจการ</div>
<div style="display:flex;flex-wrap:wrap;gap:14px 20px;align-items:flex-end;margin-top:4px;position:relative;z-index:1">
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
<div class="prog goalbar" style="height:12px;margin-top:10px"${tipAttr("ทำได้ "+T.pct+"% ของลูกจ้างทั้งหมด","ขีดที่ "+LAWPCT+"%|เกณฑ์ตามกฎหมาย",T.goalPct>LAWPCT?"ขีดที่ "+T.goalPct+"%|เป้าที่ตั้งเอง":"",T.need?"ยังขาดอีก "+baht(T.need)+" คน ถึงจะครบเกณฑ์":"ครบเกณฑ์แล้ว")}>
<i style="width:${Math.min(100,T.pct)}%;background:${T.pct>=T.goalPct?"#8ef0c8":pass?"#bfe9ff":"#ffd08a"}"></i>
<u style="left:${LAWPCT}%"></u>${T.goalPct>LAWPCT?`<u class="g2" style="left:${Math.min(100,T.goalPct)}%"></u>`:""}</div>
<div style="display:flex;font-size:11.5px;opacity:.9;margin-top:6px;position:relative;height:16px">
<span style="position:absolute;left:0">0%</span>
<span style="position:absolute;left:${LAWPCT}%;transform:translateX(-50%)">กฎหมาย ${LAWPCT}%</span>
${T.goalPct>LAWPCT?`<span style="position:absolute;left:${Math.min(96,T.goalPct)}%;transform:translateX(-50%);color:#ffe7a8;font-weight:600">เป้าเรา ${T.goalPct}%</span>`:""}
<span style="position:absolute;right:0">100%</span></div>
<div style="font-size:11.5px;opacity:.8;margin-top:7px">
${T.updated?`ข้อมูลอัปเดตล่าสุด ${fmtStamp(T.updated)}`:"ยังไม่เคยบันทึกข้อมูล — กด “แก้ไข” ในตารางด้านล่าง"}</div></div>
<div class="card span2" style="align-self:stretch"><h2>ความคืบหน้ารายบริษัท <small>เทียบเป้า 50%</small></h2>
<div class="cgrid2">
${T.rows.length?T.rows.map(({c,k})=>{const p=k.avg?Math.min(100,Math.round(k.pct)):0;
const st=k.avg?(k.pct>=k.goal?"var(--ok)":k.pct>=LAWPCT?"var(--accent)":"var(--over)"):"var(--ink-3)";
return `<div class="glrow"${tipAttr(c.label+" · "+(k.avg?k.pct+"%":"ยังไม่มีข้อมูล"),"พนักงานเฉลี่ย|"+baht(k.avg)+" คน","เกณฑ์ "+LAWPCT+"%|"+baht(k.target)+" คน","ทำได้ (C)|"+baht(k.C)+" คน",k.need?"ขาดถึงเกณฑ์|"+baht(k.need)+" คน":"ครบเกณฑ์แล้ว",k.goal>LAWPCT?"เป้าตั้งเอง "+k.goal+"%|"+baht(k.goalTarget)+" คน"+(k.needGoal?" (ขาด "+baht(k.needGoal)+")":" ✓"):"","แตะแถวไม่ได้ — แก้ตัวเลขที่ตารางด้านล่าง")}><div class="top"><span>${esc(c.label)}${k.goal>LAWPCT?` <small style="color:var(--ink-3);font-weight:400">· เป้า ${k.goal}%</small>`:""}</span>
<span class="amt" style="color:${st};font-weight:600">${k.avg?k.pct+"%":"—"}</span></div>
<div class="bar goalbar"><i class="${k.avg&&k.pct<LAWPCT?"hot":""}" style="width:${p}%;${k.avg&&k.pct>=k.goal?"background:var(--ok)":""}"></i>
<u style="left:${LAWPCT}%"></u>${k.goal>LAWPCT?`<u class="g2" style="left:${Math.min(100,k.goal)}%"></u>`:""}</div>
<div class="t-note" style="margin-top:4px">ทำได้ ${baht(k.C)} · เกณฑ์ ${baht(k.target)} คน${k.need?` (ขาด ${baht(k.need)})`:" ✓"}${k.goal>LAWPCT?` · เป้าเรา ${baht(k.goalTarget)} คน${k.needGoal?` (ขาด ${baht(k.needGoal)})`:" ✓"}`:""}</div></div>`;}).join("")
:`<div class="empty">ยังไม่มีสถานประกอบกิจการ — กด “เพิ่มสถานประกอบกิจการ” ด้านล่าง</div>`}</div></div>
<div class="card span4"><h2>เงินอุดหนุนกองทุนพัฒนาฝีมือแรงงาน <small>ผลงานปี ${R.year+543} → ยื่นภายใน 31 ส.ค. ${R.year+544}</small></h2>
${(()=>{const T=dsdTotals(R.year);
const rows=T.rows.filter(x=>x.k.avg||x.k.sub.stdN||x.k.sub.fundPaid);
return `<details class="foldbox"><summary>วิธีคิดเงินอุดหนุน 3 ช่องทาง</summary><div class="hint" style="margin:8px 0 2px">
<b>ช่องทางที่ 1 — ฝึกอบรมเกิน ${subPct()}%</b> &nbsp;(ส่วนที่เกิน) × ${baht(subRate())} ฿ ต่อคน · นับ<b>คนไม่ซ้ำ</b> เริ่มนับตั้งแต่คนที่เกิน ${subPct()}% เป็นต้นไป<br>
<b>ช่องทางที่ 2 — ทดสอบมาตรฐานฝีมือแรงงานแห่งชาติ</b> &nbsp;จำนวนคนที่ผ่านทดสอบ × ${baht(STD_RATE)} ฿ (ต้องจ่ายค่าจ้างตามมาตรฐานฝีมือไม่น้อยกว่า 180 วันก่อนยื่น · <b>ไม่เกินปีละ ${baht(STD_CAP)} ฿</b>)<br>
<b>ช่องทางที่ 3 — คืนเงินสมทบ ${FUND_PCT}%</b> &nbsp;เงินสมทบที่นำส่งกองทุน × ${FUND_PCT}% (กรณีปีที่ผ่านมาส่งเงินสมทบ แล้วปีถัดมาพัฒนาครบตามสัดส่วน)</div></details>
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
<div class="card span2"><h2>สถานะการยื่นหลักสูตร <small>${uniqCourses(ty)} หลักสูตร · ${ty.length} รุ่นในปีนี้</small></h2>
<div class="donutwrap">
${(()=>{const parts=[{n:"อนุมัติแล้ว",v:okd.length,c:"var(--ok)",tip:tipList(okd,t=>(crsCodeOf(t)?crsCodeOf(t)+" ":"")+t.title+(t.batch?" "+t.batch:""))},{n:"ยื่นแล้ว (รอผล)",v:sent.length,c:"var(--run)",tip:tipList(sent,t=>(crsCodeOf(t)?crsCodeOf(t)+" ":"")+t.title+(t.batch?" "+t.batch:""))},
{n:"รอยื่น",v:waiting.length,c:"var(--wait)",tip:tipList(waiting,t=>(crsCodeOf(t)?crsCodeOf(t)+" ":"")+t.title+(t.batch?" "+t.batch:""))},{n:"ไม่ผ่าน",v:bad.length,c:"var(--over)",tip:tipList(bad,t=>(crsCodeOf(t)?crsCodeOf(t)+" ":"")+t.title+(t.batch?" "+t.batch:""))}].filter(p=>p.v);
const tot=parts.reduce((a,b)=>a+b.v,0);
return (tot?donut(parts,tot,"หลักสูตร"):`<div class="empty" style="flex:1">ยังไม่มีหลักสูตรที่ต้องยื่น</div>`)+
`<div class="dlist">${parts.map(p=>`<div${donutTip(parts,p)}><i style="background:${p.c}"></i>${p.n}<b>${p.v}</b></div>`).join("")}
${tot?`<div${tipAttr("คืบหน้า "+Math.round((okd.length/tot)*100)+"%","อนุมัติแล้ว "+okd.length+" จาก "+tot+" หลักสูตร/รุ่นที่ต้องยื่น")} style="border-top:1px solid var(--line-2);padding-top:8px;margin-top:2px"><i style="background:transparent"></i>คืบหน้า<b>${Math.round((okd.length/tot)*100)}%</b></div>`:""}</div>`;})()}
</div></div>`;})()}
<div class="card span4"><h2>เกณฑ์กรมพัฒนาฝีมือแรงงาน ปี ${R.year+543} <small>โครงสร้างตามแบบยื่นของกรมฯ · เฉลี่ยจากจำนวนพนักงานรายเดือน</small></h2>
<div class="tblwrap wide"><table>
<thead><tr><th>สถานประกอบกิจการ</th><th style="text-align:right">พนักงานเฉลี่ย</th><th style="text-align:right">เกณฑ์ 50%</th><th style="text-align:right">เป้าที่ตั้งเอง</th>
<th style="text-align:right"${tipAttr("A · ส่งฝึกแล้ว","จำนวนครั้งที่ส่งลูกจ้างเข้าฝึกทั้งหมด (นับตามรายชื่อ)")}>A ส่งฝึกแล้ว</th><th style="text-align:right"${tipAttr("B · ฝึกซ้ำ (ครั้ง)","จำนวนครั้งที่คนเดิมฝึกซ้ำ — ไม่นับเป็นคนใหม่")}>B ฝึกซ้ำ (ครั้ง)</th><th style="text-align:right"${tipAttr("C = A − B","จำนวนคนไม่ซ้ำที่นับได้","ใช้เทียบกับเกณฑ์ 50% ของพนักงานเฉลี่ย")}>C = A−B</th>
<th style="text-align:right"${tipAttr("คิดเป็น %","C ÷ พนักงานเฉลี่ย × 100","เทียบกับเกณฑ์ "+LAWPCT+"% ตามกฎหมาย")}>คิดเป็น %</th><th style="text-align:right">ต้องฝึกอีก</th><th>สถานะ</th><th>สท.2</th><th></th></tr></thead>
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
<td><span class="pill ${st2Cls(r.st2)}">${esc(r.st2||ST2[0])}</span>${r.st2date?`<div class="t-note">${fmtDate(r.st2date)}</div>`:""}${r.st2no?`<div class="t-note" style="font-family:var(--mono);font-size:11.5px">${esc(r.st2no)}</div>`:""}</td>
<td><button class="btn ghost sm" data-dsd="${esc(c.key)}">แก้ไข</button></td></tr>`;}).join("")
:`<tr><td colspan="12"><div class="empty">ยังไม่มีสถานประกอบกิจการในปีนี้ — กด “เพิ่มสถานประกอบกิจการ” ด้านล่าง<br>
<span style="font-size:12.5px">ใส่เฉพาะนิติบุคคลที่ยื่นกรมพัฒนาฯ เท่านั้น (กลุ่มบริษัทอย่าง LKG ไม่ต้องใส่)</span></div></td></tr>`;})()}
</tbody></table></div>
<div class="addg"><button class="btn ghost" id="dsdAdd">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มสถานประกอบกิจการ</button>
${Object.keys(hrdata.dsd||{}).some(k=>dsdRec(k,R.year-1))?`<button class="btn ghost" id="dsdCopy">คัดลอกโครงจากปี ${R.year+542}</button>`:""}</div>
<details class="foldbox"><summary>วิธีอ่านตารางนี้</summary><div class="hint"><b>พนักงานเฉลี่ย</b> คิดจากเดือนที่กรอกตัวเลขไว้เท่านั้น เดือนที่ยังไม่ถึงหรือเว้นว่างจะไม่ถูกนำมาหาร (ตรงกับวิธีของกรมฯ)<br>
<b>C = A − B</b> คือจำนวนที่นับได้จริงหลังตัดคนที่ฝึกซ้ำออก · <b>คิดเป็น %</b> = C ÷ พนักงานเฉลี่ย<br>
ตัวเลขในระบบเป็นของคุณเอง ใช้เทียบกับหน้าเว็บกรมฯ ได้ แต่ไม่ได้ดึงจากกรมฯ อัตโนมัติ</div></details></div>
<div class="card span4"><h2>ทะเบียนการยื่นหลักสูตร <small>เรียงตามรหัสหลักสูตร → บริษัท → รุ่น · ยื่นเปิดหลักสูตร → ยื่นรับรองรุ่น</small></h2>
<div class="tblwrap wide"><table><thead><tr><th>หลักสูตร</th><th>บริษัท</th><th>รุ่น</th>
<th>แบบ</th><th>ยื่นเปิดหลักสูตร</th><th>เลขคำขอเปิด</th><th>ยื่นรับรองรุ่น</th><th>เลขคำขอรับรอง</th><th style="text-align:right">คน</th><th>ขั้นตอน / กำหนด</th><th>สถานะ</th></tr></thead><tbody>
${(()=>{const dl=ty.filter(t=>t.dsd&&t.dsd!=="ไม่ต้องยื่น"||ypNoOf(t)||t.dsdCertNo);
// เรียง: รหัสหลักสูตร → บริษัท → เลขรุ่น → วันที่ฝึกเสร็จ (รุ่นของหลักสูตรเดียวกันอยู่ติดกันเสมอ)
const bn=t=>{const m=String(t.batch||"").match(/\d+/); return m?+m[0]:9999;};
const ck=t=>crsCodeOf(t)||"zzz "+(t.title||"");
dl.sort((a,b)=>ck(a).localeCompare(ck(b),"th")||String(cLabel(a.company||"")).localeCompare(String(cLabel(b.company||"")),"th")
||bn(a)-bn(b)||String(a.dsdEnd||a.date||"9999").localeCompare(String(b.dsdEnd||b.date||"9999")));
return dl.length?dl.map((t,i)=>{
const first=i===0||ck(dl[i-1])!==ck(t);
const nb=crsCodeOf(t)?crsBatches(crsCodeOf(t)).length:0;
const seq=nb>1?dl.filter(x=>ck(x)===ck(t)).indexOf(t)+1:0;
return `<tr data-id="${t._id}"${first&&i?' class="tysep"':""}>
<td>${first?`<div style="font-weight:600">${esc(t.course?crsOf(t.course)?.name||t.title:t.title)}</div>
<div class="t-note">${t.course?`<b>${esc(t.course)}</b>`:(t.code?esc(t.code):"ยังไม่ผูกทะเบียน")}${nb>1?` · หลักสูตรนี้มี ${nb} รุ่น`:""}</div>`
:`<div class="t-note" style="padding-left:14px">↳ ${esc(crsCodeOf(t)||"")} · รุ่นถัดไป</div>`}</td>
<td>${esc(t.company?cLabel(t.company):"—")}</td><td>${esc(t.batch||"—")}${seq?`<div class="t-note">ลำดับที่ ${seq}</div>`:""}</td>
<td>${esc(ypKind(t)||"—")}${!t.yp&&ypKind(t)?`<div class="t-note">จากหลักสูตร</div>`:""}</td>
<td class="num">${ypDateOf(t)?fmtDate(ypDateOf(t)):"—"}</td><td style="font-family:var(--mono);font-size:12.5px">${esc(ypNoOf(t)||"—")}</td>
<td class="num">${t.dsdCertDate?fmtDate(t.dsdCertDate):"—"}</td><td style="font-family:var(--mono);font-size:12.5px">${esc(t.dsdCertNo||"—")}</td>
<td class="num">${t.pax||"—"}</td>
<td>${(()=>{const y=ypState(t);return `<span class="pill ${y.cls}">${esc(y.step)}</span>`
+(y.due?`<div class="t-note">${y.msg?esc(y.msg):""}${y.due?" · ถึง "+fmtDate(y.due.toISOString().slice(0,10)):""}</div>`:"");})()}</td>
<td><span class="pill ${dsdCls(t.dsd)}">${esc(t.dsd||"—")}</span></td></tr>`;}).join("")
:`<tr><td colspan="11"><div class="empty">ยังไม่มีหลักสูตรที่ต้องยื่น — เปิดหลักสูตรแล้วเลือกสถานะกรมพัฒฯ</div></td></tr>`;})()}
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
const hit=t=>pqHit(t.title,t.batch,t.vendor,t.course,t.code,t.company&&cLabel(t.company),skillOf(t),modeOf(t),t.type,crsCodeOf(t));
const ty=items.filter(t=>isTrain(t)&&inScope(t)&&hit(t));
// รุ่นที่ยกเลิกไม่ถูกนับเป็นผลงาน/ค่าใช้จ่าย แต่ยังโชว์ในรายการ
const live=ty.filter(t=>t.status!==STATUS_CANCEL);
const sum=(a,k)=>a.reduce((x,t)=>x+(+t[k]||0),0);
const pax=sum(live,"pax"), hrs=live.reduce((x,t)=>x+hoursOf(t)*(+t.pax||1),0);
const nCourse=uniqCourses(live);
const cost=live.reduce((x,t)=>x+((+t.actual||0)||budgetOf(t)),0);
const done=live.filter(t=>t.status===STATUS_DONE).length;
const cancel=ty.length-live.length;
const byDsdStatus=d=>items.filter(t=>isTrain(t)&&(t.dsd||"")===d&&inScope(t)&&t.status!==STATUS_CANCEL);
const waiting=byDsdStatus("รอยื่น"), sent=byDsdStatus("ยื่นแล้ว"), okd=byDsdStatus("อนุมัติแล้ว"), bad=byDsdStatus("ไม่ผ่าน");
const lawLate=live.filter(t=>isLawTrain(t)).filter(t=>{const d=dueDate(t);return isOpenStatus(t.status)&&d&&daysTo(d)<0;});
// กราฟรายเดือน: ทั้งปีที่เลือก ตามตัวกรองค้นหา ไม่รวมรุ่นที่ยกเลิก
const yearTy=items.filter(t=>isTrain(t)&&t.status!==STATUS_CANCEL&&hit(t)&&!(t.date&&!rr(t)&&new Date(t.date).getFullYear()!==R.year));
const byMonth=MTH.map((_,i)=>yearTy.filter(t=>monthsOf(t).includes(i+1)).length);
const noDate=yearTy.filter(t=>!monthsOf(t).length);
const trLine=t=>(crsCodeOf(t)?crsCodeOf(t)+" ":"")+t.title+(t.batch?" "+t.batch:"")+(t.pax?" · "+t.pax+" คน":"")+(t.status===STATUS_DONE?" ✓":"");
const byMonthTip=MTH.map((_,i)=>{const L=yearTy.filter(t=>monthsOf(t).includes(i+1)); const c=uniqCourses(L); return [L.length?"หลักสูตร|"+c+" หลักสูตร":"",L.length?"ผู้เข้าอบรมรวม|"+L.reduce((x,t)=>x+(+t.pax||0),0)+" คน":"",L.length?"ปิดงานแล้ว|"+L.filter(t=>t.status===STATUS_DONE).length+" รุ่น":"",tipList(L,trLine,8)];});
const paxOf=a=>a.reduce((x,t)=>x+(+t.pax||0),0);
const card=t=>{const d=dueDate(t);
return `<div class="li" data-id="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(t.title)}${stkHtml(t)}</div>
<div class="t2">${crsChip(t)}${skillOf(t)?esc(skillOf(t))+" · ":""}${modeOf(t)?esc(modeOf(t))+" · ":""}${esc(trainKind(t))}${t.vendor?" · "+esc(t.vendor):""}${t.pax?" · "+t.pax+" คน":""}${hoursOf(t)?" · "+hoursOf(t)+" ชม.":""}${budgetOf(t)?" · "+baht(budgetOf(t))+" ฿":""}</div></div>
${isLawTrain(t)?`<span class="tag" style="background:var(--over-soft);color:var(--over)" title="บังคับตามกฎหมาย (ตั้งจาก${lawSrc(t)})">⚖︎ กฎหมาย</span>`:""}
${t.dsd&&t.dsd!=="ไม่ต้องยื่น"?`<span class="tag sky">กรมพัฒฯ ${esc(t.dsd)}</span>`:""}
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;};
const board=(title,arr,note)=>`<div class="card span2"><h2>${esc(title)}${arr.some(isLawTrain)?` <span class="tag" style="background:var(--over-soft);color:var(--over)">ตามกฎหมาย</span>`:""} <small>${uniqCourses(arr)} หลักสูตร · ${arr.length} รุ่น</small></h2>
<div class="list">${arr.map(card).join("")||`<div class="empty">${esc(note||"ยังไม่มีรายการ")}</div>`}</div></div>`;
return header("ฝึกอบรม","หลักสูตรทั้งหมด ผู้เข้าอบรม ชั่วโมง และสถานะการยื่นกรมพัฒนาฝีมือแรงงาน")+
`<div class="toolbar">${scopeBar("sc1")} ${pqBox("ค้นหาหลักสูตร / รุ่น / วิทยากร / รหัส")}</div>`+
(lawLate.length?`<div class="banner bad" ${regList("lawLate","อบรมตามกฎหมายที่เลยกำหนด",lawLate.map(t=>{const d=dueDate(t);return {id:t._id,
t1:t.title,t2:`${crsCodeOf(t)?crsCodeOf(t)+(t.batch?" "+t.batch:"")+" · ":""}${trainKind(t)}${t.company?" · "+cLabel(t.company):""}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",c:"var(--over-soft)",ic:"var(--over)",
p:d?"เลย "+(-daysTo(d))+" วัน":"—",pc:"s-over"};}))}>${svg(ICON.bell,19)} อบรมตามกฎหมาย ${lawLate.length} หลักสูตรเลยกำหนดแล้วและยังไม่ปิดงาน</div>`:"")+
`<div class="dash">
<div class="card hero span2"${tipAttr("หลักสูตร · "+scopeLabel()+" · "+nCourse+" หลักสูตร","รุ่นทั้งหมด (ไม่รวมยกเลิก)|"+live.length+" รุ่น","ปิดงานแล้ว|"+done+" รุ่น ("+(live.length?Math.round(done/live.length*100):0)+"%)","คงเหลือ|"+(live.length-done)+" รุ่น",cancel?"ยกเลิก|"+cancel+" รุ่น (ไม่นับในตัวเลข)":"",lawLate.length?"อบรมตามกฎหมายที่เลยกำหนด|"+lawLate.length+" รุ่น":"","รอยื่นกรมพัฒนาฯ|"+waiting.length+" · ยื่นแล้ว "+sent.length+" · อนุมัติ "+okd.length+" · ไม่ผ่าน "+bad.length)}><div class="lab">หลักสูตร · ${scopeLabel()}</div>
<div class="big">${nCourse}</div>
<div class="meta"><span>${live.length} รุ่น</span><span>ปิดงานแล้ว ${done}</span><span>คงเหลือ ${live.length-done}</span>${cancel?`<span>ยกเลิก ${cancel}</span>`:""}</div>
<div class="prog"${tipAttr("ปิดงานแล้ว "+done+" จาก "+live.length+" รุ่น ("+(live.length?Math.round(done/live.length*100):0)+"%)",tipList(live.filter(t=>t.status!==STATUS_DONE),trLine,6))}><i style="width:${live.length?Math.round(done/live.length*100):0}%"></i></div></div>
<div class="card stat"${tipAttr("ผู้เข้าอบรม · "+baht(pax)+" คน","คน-ชั่วโมงรวม|"+baht(Math.round(hrs)),"เฉลี่ยต่อรุ่น|"+(live.length?Math.round(pax/live.length*10)/10:0)+" คน",tipList(live.filter(t=>+t.pax).sort((a,b)=>(+b.pax)-(+a.pax)),trLine,6))}><div class="k"><span class="ic">${svg(ICON.train,16)}</span> ผู้เข้าอบรม</div>
<div class="v">${baht(pax)}</div><div class="d">รวม ${baht(Math.round(hrs))} คน-ชั่วโมง</div></div>
<div class="card stat"${tipAttr("ค่าอบรมต่อหัว · "+(pax?baht(Math.round(cost/pax))+" ฿":"—"),"ค่าใช้จ่ายรวม|"+baht(cost)+" ฿","ผู้เข้าอบรม|"+baht(pax)+" คน","คิดจากยอดจ่ายจริง ถ้ายังไม่มีใช้งบที่ตั้งไว้",tipList(live.filter(t=>(+t.actual||0)||budgetOf(t)).sort((a,b)=>((+b.actual||0)||budgetOf(b))-((+a.actual||0)||budgetOf(a))),t=>trLine(t)+" · "+baht((+t.actual||0)||budgetOf(t))+" ฿",5))}><div class="k"><span class="ic">${svg(ICON.budget,16)}</span> ค่าอบรมต่อหัว</div>
<div class="v">${pax?baht(Math.round(cost/pax)):"—"}</div><div class="d">ค่าใช้จ่ายรวม ${baht(cost)} ฿</div></div>
<div class="card span2"><h2>หมวดทักษะ <small>ดึงจากทะเบียนหลักสูตรถ้าไม่ได้กรอกในงาน</small></h2>
<div class="donutwrap">
${(()=>{const n=k=>live.filter(t=>skillOf(t)===k).length, un=live.filter(t=>!skillOf(t)).length;
const mk=(k,a)=>({v:a.length,tip:["หลักสูตร|"+uniqCourses(a)+" หลักสูตร","ผู้เข้าอบรม|"+paxOf(a)+" คน",tipList(a,trLine,6)]});
const parts=[...skills().filter(k=>n(k)).map(k=>({n:k,c:skillColor(k),...mk(k,live.filter(t=>skillOf(t)===k))})),...(un?[{n:"ยังไม่ระบุ",c:"var(--wait)",...mk("",live.filter(t=>!skillOf(t)))}]:[])];
return donut(parts,live.length,"รุ่น")+
`<div class="dlist">${parts.map(p=>`<div${donutTip(parts,p)} ${p.n==="ยังไม่ระบุ"?"":regList("sk:"+p.n,"หมวดทักษะ · "+p.n,live.filter(t=>skillOf(t)===p.n).map(t=>{const d=dueDate(t);return {id:t._id,t1:t.title,
t2:`${modeOf(t)||"ยังไม่ระบุรูปแบบ"}${t.company?" · "+cLabel(t.company):""}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",p:t.status,pc:sCls(t.status)};}))}><i style="background:${p.c}"></i>${esc(p.n)}<b>${p.v}</b></div>`).join("")}</div>`;})()}
</div></div>
<div class="card span2"><h2>รูปแบบการอบรม <small>ดึงจากทะเบียนหลักสูตรถ้าไม่ได้กรอกในงาน</small></h2>
<div class="donutwrap">
${(()=>{const n=k=>live.filter(t=>modeOf(t)===k).length, un=live.filter(t=>!modeOf(t)).length;
const mk=a=>({v:a.length,tip:["หลักสูตร|"+uniqCourses(a)+" หลักสูตร","ผู้เข้าอบรม|"+paxOf(a)+" คน",tipList(a,trLine,6)]});
const parts=[...modes().filter(k=>n(k)).map(k=>({n:k,c:modeColor(k),...mk(live.filter(t=>modeOf(t)===k))})),...(un?[{n:"ยังไม่ระบุ",c:"var(--wait)",...mk(live.filter(t=>!modeOf(t)))}]:[])];
return donut(parts,live.length,"รุ่น")+
`<div class="dlist">${parts.map(p=>`<div${donutTip(parts,p)} ${p.n==="ยังไม่ระบุ"?"":regList("md:"+p.n,"รูปแบบการอบรม · "+p.n,live.filter(t=>modeOf(t)===p.n).map(t=>{const d=dueDate(t);return {id:t._id,t1:t.title,
t2:`${skillOf(t)||"ยังไม่ระบุหมวดทักษะ"}${t.vendor?" · "+t.vendor:""}${t.pax?" · "+t.pax+" คน":""}`,
d:d?`${d.getDate()}<br>${MTH[d.getMonth()]}`:"—",p:t.status,pc:sCls(t.status)};}))}><i style="background:${p.c}"></i>${esc(p.n)}<b>${p.v}</b></div>`).join("")}</div>`;})()}
</div></div>
<div class="card span2"><h2>แผนอบรมรายเดือน <small>ทั้งปี ${R.year+543} · ${byMonth.reduce((a,b)=>a+b,0)} รุ่นที่ลงวันแล้ว</small></h2>
${bars(byMonth,MTH,v=>v||"",new Date().getMonth(),byMonthTip,"รุ่น","รุ่นทั้งปี")}
${noDate.length?`<div class="hint" style="cursor:pointer" ${regList("trNoDate","รุ่นอบรมที่ยังไม่ได้ลงวันที่",noDate.map(t=>({id:t._id,
t1:t.title,t2:`${crsCodeOf(t)?crsCodeOf(t)+" · ":""}${trainKind(t)}${t.company?" · "+cLabel(t.company):""}${t.pax?" · "+t.pax+" คน":""}`,
d:"—",p:t.status,pc:sCls(t.status)})))}>อีก <b>${noDate.length}</b> รุ่นยังไม่ได้ลงวันที่ จึงไม่ขึ้นในกราฟนี้ — กดเพื่อดูและเติมวันที่</div>`:""}</div>
${(()=>{const order=types(); const keys=[...new Set(ty.map(t=>trainKind(t)))]
.sort((a,b)=>{const A=order.indexOf(a),B=order.indexOf(b);return (A<0?99:A)-(B<0?99:B);});
if(!keys.length)return `<div class="card span2"><h2>รายการอบรม</h2><div class="empty">ยังไม่มีหลักสูตรในช่วงนี้</div></div>`;
return keys.map(k=>board(k,ty.filter(t=>trainKind(t)===k))).join("");})()}
</div>`;
}
function legalView(){
const fc=R.legalComp||"", fk=R.legalCat||"";
const list=legal.filter(L=>(!fc||(L.comps||[]).includes(fc))&&(!fk||L.cat===fk)&&pqHit(L.title,L.owner,L.no,L.cat,L.note))
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
<div class="card hero span2"${tipAttr("รายการที่ต้องดูแล · "+legal.length,"เรียบร้อย|"+legal.filter(L=>st(L).k==="ok").length,"เกินกำหนด|"+late.length,"ใกล้ครบ 90 วัน|"+soon.length,"ยังไม่มีผู้รับผิดชอบ/ข้อมูล|"+noP.length)}><div class="lab">รายการที่ต้องดูแล</div>
<div class="big">${legal.length}</div>
<div class="meta"><span>เรียบร้อย ${legal.filter(L=>st(L).k==="ok").length}</span><span>ต้องจัดการ ${late.length+soon.length+noP.length}</span></div>
<div class="prog"${tipAttr("เรียบร้อย "+legal.filter(L=>st(L).k==="ok").length+" จาก "+legal.length+" รายการ ("+(legal.length?Math.round(legal.filter(L=>st(L).k==="ok").length/legal.length*100):0)+"%)","ที่ยังไม่เรียบร้อย:",tipList(legal.filter(L=>st(L).k!=="ok"),L=>L.title+" · "+st(L).t,6))}><i style="width:${legal.length?Math.round(legal.filter(L=>st(L).k==="ok").length/legal.length*100):0}%"></i></div></div>
<div class="card stat"${tipAttr("เกินกำหนด · "+late.length+" รายการ",tipList(late,L=>L.title+(legalDue(L)?" · ครบ "+fmtDate(legalDue(L)):""),7),"ใกล้ครบ 90 วัน|"+soon.length+" รายการ",tipList(soon,L=>L.title+(legalDue(L)?" · ครบ "+fmtDate(legalDue(L)):""),4))}><div class="k"><span class="ic" style="background:var(--over-soft);color:var(--over)">${svg(ICON.bell,16)}</span> เกินกำหนด</div>
<div class="v" style="color:${late.length?"var(--over)":"inherit"}">${late.length}</div><div class="d">ใกล้ครบอีก ${soon.length} รายการ</div></div>
<div class="card stat"${tipAttr("ยังไม่มีผู้รับผิดชอบ · "+noP.length+" จาก "+legal.length+" รายการ",tipList(noP,L=>L.title+((L.comps||[]).length?" · "+(L.comps||[]).map(cLabel).join(", "):""),8))}><div class="k"><span class="ic">${svg(ICON.meet,16)}</span> ยังไม่มีผู้รับผิดชอบ</div>
<div class="v">${noP.length}</div><div class="d">จาก ${legal.length} รายการ</div></div>
<div class="card span4">
<div class="toolbar">${pqBox("ค้นหารายการกฎหมาย / ผู้รับผิดชอบ")}
<select id="lg-comp">${opt([["","ทุกบริษัท"],...visible(companies).map(c=>[c.key,c.label])],fc)}</select>
<select id="lg-cat">${(()=>{
const inCo=legal.filter(L=>!fc||(L.comps||[]).includes(fc));
const used=[...new Set(inCo.map(L=>L.cat).filter(Boolean))];
const list=fc?LEGALCAT.filter(x=>used.includes(x)):LEGALCAT;
return opt([["",fc?"ทุกหมวดของบริษัทนี้":"ทุกหมวด"],...list.map(x=>[x,x])],list.includes(fk)?fk:"");})()}</select>
<span style="font-size:13px;color:var(--ink-3)">${list.length} รายการ</span></div>
<div class="tblwrap"><table>
<thead><tr><th>รายการ</th><th>บริษัทที่ต้องมี</th><th>ผู้รับผิดชอบ</th><th>วันที่ออก</th><th>ครบกำหนด</th><th>สถานะ</th></tr></thead>
<tbody>${list.map(row).join("")||`<tr><td colspan="6"><div class="empty">ยังไม่มีรายการ — กด “เพิ่มรายการ” หรือ นำเข้า CSV ที่หน้าตั้งค่า</div></td></tr>`}</tbody></table></div></div>
</div>`;
}
const IDXSTATUS=["ใช้งานอยู่","กำลังพัฒนา","ไม่ได้ใช้งาน"];
let idxCats=[];
let tpls=[], bkAt="", pushSubs=[];
let IDXFOLD=new Set(); try{ IDXFOLD=new Set(JSON.parse(localStorage.getItem("sw-idxfold")||"[]")); }catch(e){}
const idxSaveFold=()=>{ try{localStorage.setItem("sw-idxfold",JSON.stringify([...IDXFOLD]));}catch(e){} };
const IDX_NONE="__none";
// ลำดับลิงก์: ord = ลำดับในหมวด, fo = ลำดับในแถบ "ใช้บ่อย" · ไม่มีค่า = ต่อท้ายเรียงตามชื่อ
const idxSortFn=(a,b)=>{const A=a.ord==null?1e9:+a.ord,B=b.ord==null?1e9:+b.ord; return A!==B?A-B:((a.title||"")<(b.title||"")?-1:1);};
const idxFavSortFn=(a,b)=>{const A=a.fo==null?1e9:+a.fo,B=b.fo==null?1e9:+b.fo; return A!==B?A-B:((a.title||"")<(b.title||"")?-1:1);};
const ixStar=x=>`<button type="button" class="ixstar${x.fav?" on":""}" data-stop="1" data-ixfav="${x._id}" title="${x.fav?"เอาออกจากทางลัด “ใช้บ่อย”":"ปักเป็นทางลัด “ใช้บ่อย”"}" aria-pressed="${!!x.fav}">${svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>',16)}</button>`;
const ixHost=u=>{try{return new URL(u).hostname;}catch(e){return "";}};
const ixHash=s=>{let h=0; for(const ch of String(s||"")) h=(h*31+ch.codePointAt(0))>>>0; return h;};
function ixTile(x,i,n,sortOn){
const col=G_AUTO[ixHash(x.title)%G_AUTO.length], host=ixHost(x.url), init=(String(x.title||"?").trim().match(/[A-Za-z0-9ก-๙]/)||["?"])[0].toUpperCase();
const ic=`<span class="qli" style="background:${col}"><b>${esc(init)}</b>${host?`<img src="https://www.google.com/s2/favicons?domain=${esc(host)}&sz=64" alt="" loading="lazy" onerror="this.remove()">`:""}</span>`;
const tip=tipAttr(x.title,x.group?"หมวด|"+x.group:"",x.owner?"ผู้ดูแล|"+x.owner:"",x.iuse?x.iuse:"",x.url?"เปิด "+x.url.replace(/^https?:\/\//,"").slice(0,50):"ยังไม่ได้ใส่ลิงก์ — แตะเพื่อดูรายละเอียด");
const main=x.url&&!sortOn?`<a class="qlb" href="${esc(x.url)}" target="_blank" rel="noopener" data-stop="1"${tip}>${ic}<span class="qlt">${esc(x.title)}</span></a>`
:`<button type="button" class="qlb" data-ix="${x._id}"${sortOn?"":tip}>${ic}<span class="qlt">${esc(x.title)}</span></button>`;
return `<div class="qlk${sortOn?" sorting":""}"${sortOn?` draggable="true" data-dnd="f" data-id="${x._id}"`:""}>${main}${sortOn?`<div class="qlctl" data-stop="1"><button type="button" class="iconbtn sm" data-ixfmv="${x._id}:-1" ${i===0?"disabled":""} title="เลื่อนไปก่อน">${svg('<path d="M15 6l-6 6 6 6"/>',14)}</button><button type="button" class="iconbtn sm" data-ixfmv="${x._id}:1" ${i===n-1?"disabled":""} title="เลื่อนไปหลัง">${svg('<path d="M9 6l6 6-6 6"/>',14)}</button><button type="button" class="iconbtn sm" data-ixfav="${x._id}" title="เอาออกจากทางลัด">${svg('<path d="M6 6l12 12M18 6L6 18"/>',14)}</button></div>`:""}</div>`;
}
function ixQuick(favs,sortOn){
if(!idx.length)return "";
if(!favs.length)return `<div class="card span4 qlinks"><h2>ใช้บ่อย <small>ทางลัดไปยังลิงก์ที่ใช้ทุกวัน</small></h2><div class="hint" style="margin:0">กดดาว ☆ หน้ารายการด้านล่างเพื่อปักเป็นไอคอนทางลัดที่นี่ — แตะไอคอนเพื่อเปิดลิงก์ได้ทันที</div></div>`;
return `<div class="card span4 qlinks"><h2>ใช้บ่อย <small>${favs.length} ทางลัด · แตะไอคอนเพื่อเปิดลิงก์${sortOn?" · ลากหรือกด ◀ ▶ เพื่อเรียง":""}</small></h2>
<div class="qlgrid">${favs.map((x,i)=>ixTile(x,i,favs.length,sortOn)).join("")}</div></div>`;
}
const idxCatNames=()=>{ const used=[...new Set(idx.map(x=>(x.group||"").trim()).filter(Boolean))]; const base=[...new Set(idxCats.filter(Boolean))]; return [...base,...used.filter(g=>!base.includes(g)).sort()]; };
// ===== Index: ปักดาว / เรียงลำดับ / ลากวาง =====
const ixFail=e=>{ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); };
async function ixToggleFav(id){
const x=idx.find(v=>v._id===id); if(!x)return;
const d=x.fav?{fav:false}:{fav:true,fo:Math.max(0,...idx.filter(v=>v.fav).map(v=>+v.fo||0))+10};
Object.assign(x,d); render();
try{ await DB.collection("index").doc(id).set(d,{merge:true}); }catch(e){ ixFail(e); }
}
// scope "c" = ลำดับในหมวดเดียวกัน · "f" = ลำดับในแถบใช้บ่อย
function ixScopeList(scope,id){
if(scope==="f")return idx.filter(v=>v.fav).sort(idxFavSortFn);
const x=idx.find(v=>v._id===id); const g=(x?.group||"").trim();
return idx.filter(v=>(v.group||"").trim()===g).sort(idxSortFn);
}
async function ixWrite(list,scope){
const f=scope==="f"?"fo":"ord";
try{ await Promise.all(list.map((x,i)=>x[f]===(i+1)*10?null:DB.collection("index").doc(x._id).set({[f]:(i+1)*10},{merge:true}))); }catch(e){ ixFail(e); }
}
function ixMove(scope,id,dir){
const list=ixScopeList(scope,id), i=list.findIndex(v=>v._id===id); if(i<0)return;
const [it]=list.splice(i,1);
const to=dir==="top"?0:Math.max(0,Math.min(list.length,i+(+dir)));
list.splice(to,0,it);
list.forEach((x,k)=>x[scope==="f"?"fo":"ord"]=(k+1)*10);
ixWrite(list,scope); render();
}
function ixDnd(){
let drag=null;
const clear=()=>document.querySelectorAll(".dropat,.dragging").forEach(n=>n.classList.remove("dropat","dragging"));
document.querySelectorAll("[data-dnd]").forEach(n=>{
n.ondragstart=e=>{ drag=n; n.classList.add("dragging"); try{e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",n.dataset.id);}catch(err){} };
n.ondragend=()=>{ drag=null; clear(); };
n.ondragover=e=>{ if(!drag||drag===n||drag.dataset.dnd!==n.dataset.dnd||(n.dataset.dnd==="c"&&drag.dataset.grp!==n.dataset.grp))return; e.preventDefault(); document.querySelectorAll(".dropat").forEach(m=>m.classList.remove("dropat")); n.classList.add("dropat"); };
n.ondrop=e=>{ if(!drag||drag===n||drag.dataset.dnd!==n.dataset.dnd)return; e.preventDefault();
const scope=n.dataset.dnd, list=ixScopeList(scope,n.dataset.id);
if(scope==="c"&&drag.dataset.grp!==n.dataset.grp){ clear(); return; }
const a=list.findIndex(v=>v._id===drag.dataset.id), b=list.findIndex(v=>v._id===n.dataset.id);
if(a<0||b<0){ clear(); return; }
const [it]=list.splice(a,1); list.splice(b,0,it);
list.forEach((x,k)=>x[scope==="f"?"fo":"ord"]=(k+1)*10);
drag=null; clear(); ixWrite(list,scope); render(); };
});
}
function idxView(){
const sortOn=!!R.idxSort;
const fs2=sortOn?"":(R.idxStatus||""), q=sortOn?"":(R.idxQ||"").trim().toLowerCase();
const cats=idxCatNames();
const match=x=>(!fs2||(x.status||"ใช้งานอยู่")===fs2)&&(!q||[x.title,x.url,x.owner,x.detail,x.note,x.group,x.iuse,x.iwho,x.iwhen].join(" ").toLowerCase().includes(q));
const sortT=idxSortFn;
const favs=idx.filter(x=>x.fav).sort(idxFavSortFn);
const secs=[...cats.map(c=>({key:c,label:c,all:idx.filter(x=>(x.group||"").trim()===c).sort(sortT)})),{key:IDX_NONE,label:"ไม่ระบุหมวด",all:idx.filter(x=>!(x.group||"").trim()).sort(sortT)}]
.map(s2=>({...s2,list:s2.all.filter(match)})).filter(s2=>s2.all.length||(s2.key!==IDX_NONE&&!q&&!fs2));
const shown=secs.filter(s2=>!(q||fs2)||s2.list.length);
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const active=idx.filter(x=>(x.status||"ใช้งานอยู่")==="ใช้งานอยู่").length;
const total=shown.reduce((n,s2)=>n+s2.list.length,0);
const folded=s2=>!(q||fs2)&&IDXFOLD.has(s2.key);
const row=(x,i,arr,key)=>`<tr data-ix="${x._id}"${sortOn?` draggable="true" data-dnd="c" data-grp="${esc(key===IDX_NONE?"":key)}" data-id="${x._id}"`:""}>
<td class="ixc" data-stop="1">${sortOn?`<span class="drag" title="ลากแถวเพื่อย้าย">⠿</span><button type="button" class="iconbtn sm" data-ixmv="${x._id}:top" ${i===0?"disabled":""} title="ย้ายไปบนสุด">${svg('<path d="M6 4h12M12 20V9M7 13l5-5 5 5"/>',14)}</button><button type="button" class="iconbtn sm" data-ixmv="${x._id}:-1" ${i===0?"disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,14)}</button><button type="button" class="iconbtn sm" data-ixmv="${x._id}:1" ${i===arr.length-1?"disabled":""} title="เลื่อนลง">${svg(ICON_DN,14)}</button>`:""}${ixStar(x)}</td>
<td><div style="font-weight:600">${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener" data-stop="1" class="lklink">${esc(x.title)}</a>`:esc(x.title)}</div>
${x.url?`<div class="t-note lkurl">${svg(ICON.link,12)} ${esc((x.url||"").replace(/^https?:\/\//,"").slice(0,48))}</div>`:`<div class="t-note">ยังไม่ได้ใส่ลิงก์ — แตะแถวเพื่อดู/ใส่</div>`}
${x.note?`<div class="t-note">${esc(x.note)}</div>`:""}${(x.iuse||x.iwho||x.iwhen)?`<div class="ixuse">${[x.iuse&&`<b>ใช้ทำ</b> ${esc(x.iuse)}`,x.iwho&&`<b>ใคร</b> ${esc(x.iwho)}`,x.iwhen&&`<b>เมื่อ</b> ${esc(x.iwhen)}`].filter(Boolean).join(" · ")}</div>`:""}</td>
<td>${esc(x.owner||"—")}</td>
<td><div class="t-note">${esc(x.detail||"—")}</div></td>
<td><span class="pill ${(x.status||"ใช้งานอยู่")==="ใช้งานอยู่"?"s-done":(x.status==="กำลังพัฒนา"?"s-run":"s-cancel")}">${esc(x.status||"ใช้งานอยู่")}</span></td></tr>`;
return header("Index Online","ทะเบียนเอกสารและเว็บไซต์ที่ HR ใช้งาน · รวมลิงก์ไว้ที่เดียว",false)+
`<div class="head" style="margin-top:-6px"><div></div>
<button class="btn addbtn" id="addIdx">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มรายการ</span></button></div>
<div class="dash">
<div class="card hero span2"${tipAttr("ทะเบียนทั้งหมด · "+idx.length+" รายการ",...IDXSTATUS.map(k=>k+"|"+idx.filter(x=>(x.status||"ใช้งานอยู่")===k).length),"หมวดหมู่|"+cats.length,...cats.slice(0,8).map(c=>c+"|"+idx.filter(x=>(x.group||"").trim()===c).length+" รายการ"))}><div class="lab">ทะเบียนทั้งหมด</div><div class="big">${idx.length}</div>
<div class="meta"><span>ใช้งานอยู่ ${active}</span><span>${cats.length} หมวดหมู่</span></div></div>
<div class="card stat"${tipAttr("มีลิงก์แล้ว · "+idx.filter(x=>x.url).length+" จาก "+idx.length+" รายการ","ยังไม่มีลิงก์:",tipList(idx.filter(x=>!x.url),x=>x.title,7))}><div class="k"><span class="ic">${svg(ICON.link,16)}</span> มีลิงก์แล้ว</div>
<div class="v">${idx.filter(x=>x.url).length}</div><div class="d">จาก ${idx.length} รายการ · ที่เหลือใส่ลิงก์เพิ่มได้</div></div>
<div class="card stat"${tipAttr("ผู้ดูแล · "+[...new Set(idx.map(x=>(x.owner||"").trim()).filter(Boolean))].length+" คน",...[...new Set(idx.map(x=>(x.owner||"").trim()).filter(Boolean))].slice(0,8).map(o=>o+"|"+idx.filter(x=>(x.owner||"").trim()===o).length+" รายการ"))}><div class="k"><span class="ic">${svg(ICON.meet,16)}</span> ผู้ดูแล</div>
<div class="v">${[...new Set(idx.map(x=>(x.owner||"").trim()).filter(Boolean))].length}</div><div class="d">คน</div></div>
${ixQuick(favs,sortOn)}
<div class="card span4">
${sortOn?`<div class="hint" style="margin-bottom:10px"><b>โหมดจัดเรียง</b> — ลากแถว (⠿) หรือกด ▲ ▼ / ⤒ ย้ายไปบนสุด · ลำดับบันทึกอัตโนมัติ · ตัวกรองค้นหาพักไว้ชั่วคราว · เปิด/ปิดหมวดได้ตามปกติ</div>`:""}
<div class="toolbar" style="margin-bottom:10px">
<input type="search" id="ix-q" placeholder="ค้นหาชื่อ / ลิงก์ / ผู้ดูแล" value="${esc(R.idxQ||"")}">
<select id="ix-status">${opt([["","ทุกสถานะ"],...IDXSTATUS.map(x=>[x,x])],fs2)}</select>
<span style="font-size:13px;color:var(--ink-3)">${total} รายการ</span>
<span style="flex:1"></span>
<button class="gcbtn${sortOn?" on":""}" id="ix-sort" title="ลากหรือกดลูกศรเพื่อเรียงลำดับลิงก์ในแต่ละหมวด และเรียงไอคอนทางลัด">${svg('<path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/>',13)} ${sortOn?"เสร็จสิ้นการจัดเรียง":"จัดเรียง"}</button>
<button class="gcbtn" id="ix-collapse" title="ดูเฉพาะชื่อหมวดหมู่">ย่อทั้งหมด</button>
<button class="gcbtn" id="ix-expand" title="เปิดดูรายการทุกหมวด">ขยายทั้งหมด</button>
<button class="gcbtn" id="ix-cats">${svg('<path d="M4 7h16M4 12h16M4 17h10"/>',13)} จัดการหมวดหมู่</button></div>
${shown.map(s2=>{ const f=folded(s2), nUrl=s2.all.filter(x=>x.url).length; return `<div class="ixsec${f?" folded":""}">
<button type="button" class="ixsh" data-ixfold="${esc(s2.key)}" aria-expanded="${!f}">
<span class="chev">${svg('<path d="M9 6l6 6-6 6"/>',16)}</span><b>${esc(s2.label)}</b>
<span class="ixn">${(q||fs2)?s2.list.length+" / "+s2.all.length:s2.all.length} รายการ${nUrl?` · ${nUrl} ลิงก์`:""}</span></button>
${f?"":`<div class="tblwrap"><table>
<thead><tr><th class="ixc"></th><th>สารบัญ / ระบบ</th><th>ผู้ดูแล</th><th>รายละเอียด</th><th>สถานะ</th></tr></thead>
<tbody>${s2.list.map((x,i,arr)=>row(x,i,arr,s2.key)).join("")||`<tr><td colspan="5"><div class="empty">ยังไม่มีรายการในหมวดนี้ — กด “เพิ่มรายการ” แล้วเลือกหมวดนี้</div></td></tr>`}</tbody></table></div>`}</div>`; }).join("")
||`<div class="empty">${idx.length?"ไม่พบรายการที่ตรงกับตัวกรอง":"ยังไม่มีรายการ — กด “เพิ่มรายการ” หรือ นำเข้า CSV (หัวคอลัมน์แรก “สารบัญ”)"}</div>`}
</div>
</div>`;
}
function paintIxCats(){
const names=idxCatNames(); const cnt=c=>idx.filter(x=>(x.group||"").trim()===c).length;
el("ixc-rows").innerHTML=names.map((c,i)=>`<div class="ixcrow"><input data-ixcn="${i}" value="${esc(c)}" aria-label="ชื่อหมวด">
<span class="n">${cnt(c)} รายการ</span>
<button type="button" class="iconbtn" data-ixcm="${i}:-1" ${i===0?"disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,15)}</button>
<button type="button" class="iconbtn" data-ixcm="${i}:1" ${i===names.length-1?"disabled":""} title="เลื่อนลง">${svg(ICON_DN,15)}</button>
<button type="button" class="btn danger sm" data-ixcd="${i}">ลบ</button></div>`).join("")||`<div class="empty">ยังไม่มีหมวดหมู่ — เพิ่มด้านล่างได้เลย</div>`;
}
async function idxSaveCats(list){ idxCats=list; try{ await saveMeta("idxcats",idxCats); }catch(e){} }
function openIxCats(){ paintIxCats(); el("ixcdlg").showModal(); }
el("ixc-close").onclick=()=>el("ixcdlg").close();
el("ixc-add").onclick=async()=>{ const v=el("ixc-new").value.trim(); if(!v){el("ixc-new").focus();return;}
const names=idxCatNames(); if(names.includes(v)){ tell("มีหมวด “"+esc(v)+"” อยู่แล้วค่ะ"); return; }
el("ixc-new").value=""; await idxSaveCats([...names,v]); paintIxCats(); render(); };
el("ixc-new").onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); el("ixc-add").click(); } };
el("ixc-rows").addEventListener("change",async e=>{ const inp=e.target.closest("[data-ixcn]"); if(!inp)return;
const names=idxCatNames(), old=names[+inp.dataset.ixcn], nv=inp.value.trim();
if(!nv||nv===old){ inp.value=old; return; }
if(names.includes(nv)){ tell("มีหมวด “"+esc(nv)+"” อยู่แล้วค่ะ"); inp.value=old; return; }
const next=names.slice(); next[+inp.dataset.ixcn]=nv; await idxSaveCats(next);
if(IDXFOLD.has(old)){ IDXFOLD.delete(old); IDXFOLD.add(nv); idxSaveFold(); }
for(const x of idx.filter(x=>(x.group||"").trim()===old)){ try{ await DB.collection("index").doc(x._id).set({group:nv},{merge:true}); }catch(err){} }
paintIxCats(); render(); });
el("ixc-rows").addEventListener("click",async e=>{
const mv=e.target.closest("[data-ixcm]"), dl=e.target.closest("[data-ixcd]");
if(mv){ const [i,d]=mv.dataset.ixcm.split(":").map(Number); const n=idxCatNames(); const j=i+d; if(j<0||j>=n.length)return; [n[i],n[j]]=[n[j],n[i]]; await idxSaveCats(n); paintIxCats(); render(); return; }
if(dl){ const names=idxCatNames(), c=names[+dl.dataset.ixcd]; const k=idx.filter(x=>(x.group||"").trim()===c).length;
 el("ixcdlg").close();
 const ok=await ask("ลบหมวด “"+esc(c)+"” ใช่ไหมคะ?"+(k?`<div style="font-size:13px;margin-top:8px;line-height:1.7">ลิงก์ในหมวดนี้ ${k} รายการ <b>จะไม่ถูกลบ</b> แต่จะย้ายไปอยู่ “ไม่ระบุหมวด” — ไปเลือกหมวดใหม่ทีหลังได้</div>`:""),"ลบหมวด");
 if(ok){ await idxSaveCats(names.filter(x=>x!==c)); IDXFOLD.delete(c); idxSaveFold();
  for(const x of idx.filter(x=>(x.group||"").trim()===c)){ try{ await DB.collection("index").doc(x._id).set({group:""},{merge:true}); }catch(err){} } render(); }
 openIxCats(); } });
// ---- เนื้อหาบันทึกแบบจัดรูปแบบ (fmt:"h" = HTML ที่ผ่านตัวกรอง; ไม่มี fmt = ข้อความล้วนแบบเดิม)
const NT_OK={B:1,STRONG:1,I:1,EM:1,U:1,S:1,H2:1,H3:1,UL:1,OL:1,LI:1,P:1,DIV:1,BR:1,SPAN:1,BLOCKQUOTE:1,HR:1,A:1,TABLE:1,TBODY:1,THEAD:1,TR:1,TD:1,TH:1,IMG:1};
const NT_BG=new Set(["y","g","b","r","p","o","x"]);
function ntRgb(c){ c=String(c||"").trim().toLowerCase(); if(/^#[0-9a-f]{6}$/.test(c))return c; const m=c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/); return m?"#"+[m[1],m[2],m[3]].map(v=>Math.min(255,+v).toString(16).padStart(2,"0")).join(""):""; }
function ntClean(html){
const d=document.createElement("div"); d.innerHTML=String(html||"");
d.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach(n=>n.remove());
(function walk(p){ [...p.childNodes].forEach(n=>{
 if(n.nodeType===3)return;
 if(n.nodeType!==1){ n.remove(); return; }
 if(!NT_OK[n.tagName]){ while(n.firstChild)p.insertBefore(n.firstChild,n); n.remove(); return; }
 const T=n.tagName;
 if(T==="A"){ const h=n.getAttribute("href")||""; [...n.attributes].forEach(at=>n.removeAttribute(at.name));
  if(/^(https?:\/\/|mailto:|tel:)/i.test(h)){ n.setAttribute("href",h); n.setAttribute("target","_blank"); n.setAttribute("rel","noopener noreferrer"); walk(n); return; }
  while(n.firstChild)p.insertBefore(n.firstChild,n); n.remove(); return; }
 if(T==="IMG"){ const nid=n.getAttribute("data-nid")||"", src=n.getAttribute("src")||"", w=n.getAttribute("data-w")||"";
  [...n.attributes].forEach(at=>n.removeAttribute(at.name));
  if(/^nimg-[a-z0-9]{6,24}$/.test(nid))n.setAttribute("data-nid",nid);
  else if(src.length<900000&&/^data:image\/(jpeg|png|webp|gif);base64,[a-z0-9+\/=]+$/i.test(src))n.setAttribute("src",src);
  else{ n.remove(); return; }
  if(/^(33|50|100)$/.test(w))n.setAttribute("data-w",w); return; }
 if(T==="SPAN"&&n.hasAttribute("data-stk")){ const sk=n.getAttribute("data-stk"); if(typeof stkValid==="function"&&stkValid(sk)){ const nn=stkNode(sk); n.replaceWith(nn); return; } n.remove(); return; }
 const cls=(T==="SPAN"&&n.classList.contains("lt"))?"lt":(T==="UL"&&n.classList.contains("ck"))?"ck":(T==="TABLE")?"nt":"";
 let col="",bg="",dc="",di="",dbg="",da="",dta="",dh="",df="";
 if(T==="SPAN"){ col=ntRgb(n.style.color); bg=ntRgb(n.style.backgroundColor); }
 if(T==="LI"&&n.getAttribute("data-c")==="1")dc="1";
 if(/^(P|DIV|H2|H3|BLOCKQUOTE)$/.test(T)&&/^[1-6]$/.test(n.getAttribute("data-i")||""))di=n.getAttribute("data-i");
 if((T==="TD"||T==="TH")&&NT_BG.has(n.getAttribute("data-bg")||""))dbg=n.getAttribute("data-bg");
 if((T==="TD"||T==="TH")&&/^[lcr]$/.test(n.getAttribute("data-a")||""))da=n.getAttribute("data-a");
 if(T==="TABLE"&&/^[lcr]$/.test(n.getAttribute("data-ta")||""))dta=n.getAttribute("data-ta");
 if((T==="TD"||T==="TH")&&n.getAttribute("data-h")==="1")dh="1";
 if((T==="TD"||T==="TH")&&/^=.{1,120}$/.test(n.getAttribute("data-f")||""))df=n.getAttribute("data-f");
 [...n.attributes].forEach(at=>n.removeAttribute(at.name));
 if(cls)n.className=cls;
 if(col||bg)n.setAttribute("style",(col?"color:"+col+";":"")+(bg?"background-color:"+bg+";":""));
 if(dc)n.setAttribute("data-c",dc); if(di)n.setAttribute("data-i",di); if(dbg)n.setAttribute("data-bg",dbg); if(da)n.setAttribute("data-a",da); if(dta)n.setAttribute("data-ta",dta); if(dh)n.setAttribute("data-h",dh); if(df)n.setAttribute("data-f",df);
 if(T==="SPAN"&&!cls&&!col&&!bg){ while(n.firstChild)p.insertBefore(n.firstChild,n); n.remove(); return; }
 walk(n); }); })(d);
return d.innerHTML;
}
const ntPlain=(n,withUrl)=>{ if(!n)return""; if(n.fmt!=="h")return n.body||"";
const d0=document.createElement("div"); d0.innerHTML=ntClean(n.body||"");
d0.querySelectorAll("table").forEach(t=>{ const p=document.createElement("p"); p.textContent=[...t.rows].map(r=>[...r.cells].filter(c=>!c.hasAttribute("data-h")).map(c=>c.textContent.replace(/\s+/g," ").trim()).join(" | ")).join("\n"); t.replaceWith(p); });
d0.querySelectorAll("ul.ck>li").forEach(li=>li.insertBefore(document.createTextNode(li.getAttribute("data-c")==="1"?"☑ ":"☐ "),li.firstChild));
d0.querySelectorAll("img").forEach(i=>i.replaceWith(document.createTextNode("[รูป]")));
d0.querySelectorAll("span[data-stk]").forEach(i=>i.replaceWith(document.createTextNode(" ["+(typeof stkPlainLabel==="function"?stkPlainLabel(i.getAttribute("data-stk")):"")+"] ")));
const d=document.createElement("div"); d.innerHTML=d0.innerHTML.replace(/<\/(p|div|li|h2|h3|blockquote)>|<br\s*\/?>/gi,"$&\n");
if(withUrl)d.querySelectorAll("a[href]").forEach(a=>{ const h=a.getAttribute("href"); if(a.textContent.trim()!==h)a.textContent=a.textContent+" ("+h+")"; });
return (d.textContent||"").replace(/\n{3,}/g,"\n\n").trim(); };
const ntHtml=n=>n&&n.fmt==="h"?ntClean(n.body||""):esc((n&&n.body)||"").replace(/\n/g,"<br>");
const NOTEKIND=["บันทึกการประชุม","โน้ต","ไอเดีย"];
const NOTEKIND_ALL=()=>[...NOTEKIND,INKKIND];
function noteView(){
const fk=R.noteKind||"", q=(R.noteQ||"").toLowerCase();
const list=notes.filter(n=>(!fk||n.kind===fk)&&noteFolderFilter(n)&&(!q||((n.title||"")+" "+ntPlain(n)+" "+(n.tag||"")).toLowerCase().includes(q)))
.sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||((b.date||"")<(a.date||"")?-1:1));
const opt=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${sel===v?" selected":""}>${esc(l)}</option>`).join("");
const cnt=k=>notes.filter(n=>n.kind===k).length;
return header("บันทึก & ไอเดีย","บันทึกการประชุม โน้ตประจำวัน และไอเดียที่ยังไม่ได้ทำ",false)+
`<div class="head" style="margin-top:-6px"><div></div>
<span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="addBoard" title="กระดานกว้างไม่จำกัด เขียน/วาดได้อิสระ เลื่อนและซูมได้">${svg('<circle cx="12" cy="12" r="9"/><path d="M8 12c0-2 1.5-3 2.7-3 1.8 0 2.3 3 4.3 3 1.2 0 2-.8 2-2"/>',18)}<span>กระดานกว้าง</span></button>
<button class="btn ghost" id="addInk" title="สมุดเขียนมือ ใช้ Apple Pencil วาด/เขียนได้ ส่งออก PDF ลง Google Drive">${svg('<path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/>',18)}<span>สมุดเขียนมือ</span></button>
<button class="btn addbtn" id="addNote">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เขียนบันทึก</span></button></span></div>
<div class="dash">
<div class="card hero span2"${tipAttr("บันทึกทั้งหมด · "+notes.length+" รายการ",...NOTEKIND.map(k=>k+"|"+cnt(k)+" รายการ"),"ปักหมุด|"+notes.filter(n=>n.pin).length)}><div class="lab">บันทึกทั้งหมด</div><div class="big">${notes.length}</div>
<div class="meta">${NOTEKIND_ALL().map(k=>`<span>${k} ${cnt(k)}</span>`).join("")}</div></div>
<div class="card stat"${tipAttr("ปักหมุดไว้ · "+notes.filter(n=>n.pin).length+" รายการ",tipList(notes.filter(n=>n.pin),n=>n.title||"(ไม่มีชื่อ)",7))}><div class="k"><span class="ic">${svg(ICON.bell,16)}</span> ปักหมุดไว้</div>
<div class="v">${notes.filter(n=>n.pin).length}</div><div class="d">ขึ้นบนสุดเสมอ</div></div>
<div class="card stat"${tipAttr("บันทึกล่าสุด",tipList(notes.slice().sort((a,b)=>(b.date||"")<(a.date||"")?-1:1),n=>(n.date||"—")+" · "+(n.title||"(ไม่มีชื่อ)"),5))}><div class="k"><span class="ic">${svg(ICON.clock,16)}</span> บันทึกล่าสุด</div>
<div class="v" style="font-size:17px">${notes.length?esc((notes.slice().sort((a,b)=>(b.date||"")<(a.date||"")?-1:1)[0].date||"—")):"—"}</div><div class="d">วันที่ล่าสุด</div></div>
<div class="card span4">
${noteFolderBar()}
<div class="toolbar" style="margin-bottom:6px">
<input type="search" id="nt-q" placeholder="ค้นหาในบันทึก" value="${esc(R.noteQ||"")}">
<select id="nt-kind">${opt([["","ทุกประเภท"],...NOTEKIND_ALL().map(x=>[x,x])],fk)}</select></div>
<div class="notegrid">${list.map(n=>`<div class="notecard" data-nt="${n._id}" style="border-left:5px solid ${n.color||"var(--accent-2)"}">
<div class="nh"><span class="tag${n.kind==="ไอเดีย"||n.kind===INKKIND?" sky":""}">${esc(n.kind||"โน้ต")}</span>
${n.pin?`<span class="tag sky">ปักหมุด</span>`:""}${noteFolderTag(n)}
<span style="margin-left:auto;font-size:12px;color:var(--ink-3)">${esc(n.date||"")}</span>
<button class="ntedit" data-ntmv="${n._id}" title="ย้ายไปโฟลเดอร์" aria-label="ย้ายไปโฟลเดอร์">${svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',14)}</button>
<button class="ntedit" data-ntedit="${n._id}" title="แก้ไข" aria-label="แก้ไข">${svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',14)}</button></div>
<div class="nt1">${esc(n.title||"(ไม่มีหัวข้อ)")}</div>
<div class="nb">${n.kind===INKKIND?(n.thumb?`${n.cover?`<div class="inkcv" style="--cv:${esc(n.cover)}">`:""}<img class="ink-th" src="${esc(n.thumb)}" alt="ตัวอย่างหน้าแรก">${n.cover?"</div>":""}<div class="t-note" style="margin-top:6px">${n.pages||1} หน้า · แตะเพื่อเปิดเขียนต่อ</div>`:`<div class="t-note">สมุดเปล่า · ${n.pages||1} หน้า</div>`):(()=>{const t=ntPlain(n); return esc(t.slice(0,180))+(t.length>180?"…":"");})()}</div>
${n.tag?`<div class="t-note" style="margin-top:6px">#${esc(n.tag)}</div>`:""}</div>`).join("")
||`<div class="empty">ยังไม่มีบันทึก — กด “เขียนบันทึก”</div>`}</div></div>
</div>`;
}
function setView(){
const body={groups:setGroups,companies:setCompanies,types:setTypes,courses:setCourses,gl:setGL,theme:setTheme_,remind:setRemind,import:setImport,trash:setTrash,connect:setConnect}[settab]();
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
// ===== สมุดเขียนมือ (แบบ GoodNotes) — วาด/เขียนด้วย Apple Pencil, หลายหน้า, ส่งออก PDF =====
// เก็บ: โน้ต (kind "note", kind:INKKIND) = ข้อมูลสมุด (ชื่อ, ลำดับหน้า pageIds, กระดาษ, รูปย่อ)
//       ลายเส้นแต่ละหน้า = แถวแยก kind "ink" id "ink-<pageId>" (โหลดเฉพาะตอนเปิดสมุด ไม่โหลดตอนเปิดแอป)
const INKKIND="สมุดเขียนมือ";
const INK_W=1000, INK_H=1414;                      // หน้ากระดาษ A4 (หน่วยเสมือน)
const INK_PEN=["#1d1d1f","#2563eb","#dc2626","#16a34a","#ea7a1a","#7c3aed","#db2777","#6b7280"];
const INK_HL=["#ffe14d","#7ee08f","#ff9ec7","#8ec9ff","#ffb36b","#c9a7ff"];
const INK_SIZES={pen:[2,3.5,5.5,9],hl:[12,18,26,36],eraser:[10,18,30,48]};
const INK_PAPER=[["#ffffff","ขาว"],["#fbf6e9","ครีม"],["#fff7d6","เหลืองอ่อน"],["#eef5ff","ฟ้าอ่อน"],["#e9f7ef","เขียวอ่อน"],["#fdeef4","ชมพูอ่อน"],["#f1f1ee","เทาอ่อน"]];
const INK_TPL=[["blank","ว่าง"],["lines","เส้นบรรทัด"],["grid","ตาราง"],["dots","จุด"]];
const ink={open:false,note:null,pages:[],cur:0,tool:"pen",color:{pen:INK_PEN[0],hl:INK_HL[0]},sizeIx:{pen:1,hl:1,eraser:1},
board:false,vx:-60,vy:-60,fingerMode:"auto",penSeen:false,penDown:false,penUpAt:0,z:1,tx:0,ty:0,fit:1,k:1,undo:[],redo:[],sel:null,
ptrs:new Map(),drag:null,saveT:null,saving:false,saveErr:false,zoomBak:null,pdf:null};
const inkUid=()=>"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const inkPage=()=>ink.pages[ink.cur];
const inkO=()=>ink.board?[-ink.vx,-ink.vy]:[0,0];                 // ชดเชยตำแหน่งมุมมอง (กระดานกว้าง)
const inkBBs=new WeakMap();
function inkBB(s){ let b=inkBBs.get(s); if(b&&b.n!==s.p.length)b=null; if(!b){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; const p=(s.r&&(s.t==="s"||s.t==="i"||s.t==="k"))?inkFlat(s):s.p,pad=(s.t==="s"?Math.max(s.w,16):(s.b&&s.b!=="pen"?s.w*1.6:s.w/2))+1; for(let j=0;j<p.length;j+=3){ if(p[j]<x0)x0=p[j]; if(p[j]>x1)x1=p[j]; if(p[j+1]<y0)y0=p[j+1]; if(p[j+1]>y1)y1=p[j+1]; } b=[x0-pad,y0-pad,x1+pad,y1+pad]; b.n=s.p.length; inkBBs.set(s,b);} return b; }
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
strokes.forEach((s,i)=>{ if(skip&&skip.has(i))return; if(o.noStk&&s.t==="k")return;
if(o.board){ const b=inkBB(s); if(b[2]<-ox||b[0]>-ox+o.w||b[3]<-oy||b[1]>-oy+o.h)return; }
inkStroke(ctx,s,k,ox,oy); });
}
function inkOpt(){ if(ink.board){ const c=el("ink-base"); return {board:true,ox:-ink.vx,oy:-ink.vy,w:c.width/ink.k,h:c.height/ink.k,noStk:1}; } const pg=inkPage(); return {tpl:pg&&pg.tpl,noStk:1}; }
function inkRedraw(){
const pg=inkPage(); if(!pg)return;
const c=el("ink-base"), ctx=c.getContext("2d");
inkRenderTo(ctx,ink.k,pg.strokes,ink.drag&&ink.drag.hide,inkOpt());
if(typeof inkStkSync==="function")inkStkSync();
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
if(c.width!==bw||c.height!==bh){ ["ink-base","ink-over","ink-pred","ink-laser"].forEach(id=>{ el(id).width=bw; el(id).height=bh; }); }
ink.k=dpr*ink.z; inkRedrawSoon(); if(typeof inkStkSync==="function")inkStkSync(); inkZoomLabel(); return; }
ink.fit=Math.min((sw-16)/INK_W,(sh-16)/INK_H);
const s=ink.fit*ink.z, w=INK_W*s, h=INK_H*s;
ink.tx=w<=sw?(sw-w)/2:Math.min(40,Math.max(sw-w-40,ink.tx));
ink.ty=h<=sh?(sh-h)/2:Math.min(40,Math.max(sh-h-40,ink.ty));
const pg=el("ink-pg"); pg.style.cssText=`left:${ink.tx}px;top:${ink.ty}px;width:${w}px;height:${h}px`; if(typeof inkStkSync==="function"){ const bb=el("ink-base"); if(bb.width)el("ink-stkl")&&(el("ink-stkl").style.transform="scale("+(w/INK_W)+")"); }
clearTimeout(ink.rsT); ink.rsT=setTimeout(inkResize,ink.fast?60:140);
}
function inkResize(){
if(ink.board){ inkApply(); return; }
const pgw=el("ink-pg").clientWidth, pgh=el("ink-pg").clientHeight; if(!pgw)return;
let dpr=Math.min(window.devicePixelRatio||1,2), bw=Math.round(pgw*dpr), bh=Math.round(pgh*dpr);
const cap=8e6; if(bw*bh>cap){ const f=Math.sqrt(cap/(bw*bh)); bw=Math.round(bw*f); bh=Math.round(bh*f); }
["ink-base","ink-over","ink-pred","ink-laser"].forEach(id=>{ const c=el(id); if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;} });
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
const c=el("ink-base"), [ox,oy]=inkO(); inkStroke(c.getContext("2d"),s,ink.k,ox,oy);   // วาดจากข้อมูลเส้นเสมอ (ไม่อ่านภาพกลับจาก canvas ชั้นบน — บน Windows/Chrome ชนิด desynchronized อ่านกลับได้ภาพว่าง ทำให้เส้นหายหลังยกปากกา)
inkOverClear(); inkUndoState(); inkDirty();
}
function inkUndoState(){ el("ink-undo").disabled=!ink.undo.length; el("ink-redo").disabled=!ink.redo.length; el("ink-seldel").hidden=!ink.sel; el("ink-selshape").hidden=!ink.sel; if(typeof inkSelBtns==="function")inkSelBtns(); }
function inkUndo(redo){
const from=redo?ink.redo:ink.undo, to=redo?ink.undo:ink.redo; const h=from.pop(); if(!h)return;
if(h.p>=ink.pages.length)return;
const pg=ink.pages[h.p]; to.push({p:h.p,s:pg.strokes}); pg.strokes=h.s; pg.dirty=true; ink.sel=null;
if(h.p!==ink.cur)inkGo(h.p); else{ inkRedraw(); inkOverClear(); } inkToolbar(); inkDirty();
}

// ---------- ปากกา / ยางลบ / บ่วงเลือก ----------
const inkSizeKey=()=>({hl:"hl",eraser:"eraser",shape:"shape",text:"text",tape:"tape",laser:"laser",sticky:"sticky"})[ink.tool]||"pen";
const inkColKey=()=>({hl:"hl",tape:"tape",laser:"laser",sticky:"sticky"})[ink.tool]||"pen";
const inkSize=()=>ink.size[inkSizeKey()];
const inkPx=()=>ink.board?1/ink.z:1/(ink.fit*ink.z);          // หน่วยหน้ากระดาษต่อ 1 พิกเซลหน้าจอ
const inkFinger=()=>ink.fingerMode==="on"||(ink.fingerMode==="auto"&&!ink.penSeen);
function inkSegDist(px,py,ax,ay,bx,by){ const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy; let t=l?((px-ax)*dx+(py-ay)*dy)/l:0; t=Math.max(0,Math.min(1,t)); const x=ax+t*dx-px,y=ay+t*dy-py; return Math.sqrt(x*x+y*y); }
function inkHit(s,x,y,r){ if(s.lk)return false; return inkHit0(s,x,y,r); }
function inkHit0(s,x,y,r){ if(s.t==="i"||s.t==="k")return inkImgHit(s,x,y,r); if(s.t==="x"){ const q=s.p, pd=Math.max(2,r*.3); return x>=Math.min(q[0],q[3])-pd&&x<=Math.max(q[0],q[3])+pd&&y>=Math.min(q[1],q[4])-pd&&y<=Math.max(q[1],q[4])+pd; } if(s.t==="s")return inkShapeHit(s,x,y,r); const p=s.p, n=Math.floor(p.length/3), rr=r+s.w/2;
if(n===1)return Math.hypot(p[0]-x,p[1]-y)<=rr;
for(let i=1;i<n;i++)if(inkSegDist(x,y,p[(i-1)*3],p[(i-1)*3+1],p[i*3],p[i*3+1])<=rr)return true; return false; }
function inkInPoly(poly,x,y){ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c; } return c; }
function inkBBox(strokes,idxs){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; idxs.forEach(i=>{const s=strokes[i],p=(s.r&&(s.t==="s"||s.t==="i"||s.t==="k"))?inkFlat(s):s.p,pad=s.w/2; for(let j=0;j<p.length;j+=3){ x0=Math.min(x0,p[j]-pad);x1=Math.max(x1,p[j]+pad);y0=Math.min(y0,p[j+1]-pad);y1=Math.max(y1,p[j+1]+pad);} }); return [x0,y0,x1,y1]; }
function inkScaled(s,ax,ay,f,fy){ const fx=f; fy=fy==null?f:fy;
 if((s.t==="s"||s.t==="i"||s.t==="k")&&s.r&&s.sh!=="line"&&s.sh!=="arrow"&&s.sh!=="darrow"&&fx!==fy){ // รูปที่หมุนอยู่: ยืดตามแกนของรูป (ประมาณ)
  const p=s.p, mx=(p[0]+p[3])/2, my=(p[1]+p[4])/2, cx=ax+(mx-ax)*fx, cy=ay+(my-ay)*fy, co=Math.cos(s.r), si=Math.sin(s.r);
  const hw=Math.abs(p[3]-p[0])/2*Math.hypot(fx*co,fy*si), hh=Math.abs(p[4]-p[1])/2*Math.hypot(fx*si,fy*co), sx=p[3]>=p[0]?1:-1, sy=p[4]>=p[1]?1:-1;
  return {...s,p:[+(cx-sx*hw).toFixed(1),+(cy-sy*hh).toFixed(1),0,+(cx+sx*hw).toFixed(1),+(cy+sy*hh).toFixed(1),0]}; }
 const o={...s,p:s.p.map((v,j)=>j%3===0?+(ax+(v-ax)*fx).toFixed(1):j%3===1?+(ay+(v-ay)*fy).toFixed(1):v)};
 if(s.t==="x"){ o.fs=Math.max(6,+(s.fs*(fx+fy)/2).toFixed(1)); const m=inkTextMeasure(o); o.p[3]=+(o.p[0]+m[0]).toFixed(1); o.p[4]=+(o.p[1]+m[1]).toFixed(1); }
 return o; }
function inkDrawSel(){
const c=el("ink-over"); if(!c||!ink.sel){ return; }
const ctx=c.getContext("2d"), k=ink.k, d=ink.drag, [ox,oy]=inkO(), pg=inkPage(); let b=ink.sel.box, dx=0, dy=0, f=1, fy=1;
if(d&&d.mode==="move"){ dx=d.dx; dy=d.dy; } else if(d&&d.mode==="scale"){ f=d.fx; fy=d.fy; }
const bcx=(b[0]+b[2])/2, bcy=(b[1]+b[3])/2;
if(d&&d.mode==="rot"&&d.th)ink.sel.idx.forEach(i=>inkStroke(ctx,inkRotated(pg.strokes[i],bcx,bcy,d.th),k,ox,oy));
ctx.clearRect(0,0,c.width,c.height);
if(dx||dy)ink.sel.idx.forEach(i=>inkStroke(ctx,pg.strokes[i],k,dx+ox,dy+oy));
if(f!==1||fy!==1){ ink.sel.idx.forEach(i=>inkStroke(ctx,inkScaled(pg.strokes[i],b[0],b[1],f,fy),k,ox,oy)); b=[b[0],b[1],b[0]+(b[2]-b[0])*f,b[1]+(b[3]-b[1])*fy]; }
ctx.save(); ctx.setLineDash([8*k,6*k]); ctx.strokeStyle="#2563eb"; ctx.lineWidth=Math.max(1.5,1.6*k);
const pad=6; ctx.strokeRect((b[0]+dx+ox-pad)*k,(b[1]+dy+oy-pad)*k,(b[2]-b[0]+pad*2)*k,(b[3]-b[1]+pad*2)*k);
if(inkSelLocked()){ ctx.setLineDash([]); ctx.fillStyle="#6b7280"; ctx.font=Math.max(14,18*inkPx()*k)+"px sans-serif"; ctx.fillText("🔒",(b[0]+ox-pad)*k+4,(b[1]+oy-pad)*k+Math.max(16,20*inkPx()*k)); ctx.restore(); return; }
if(inkSelHasLink()){ ctx.setLineDash([]); ctx.font=Math.max(13,16*inkPx()*k)+"px sans-serif"; ctx.fillText("🔗",(b[2]+ox+pad)*k-Math.max(16,20*inkPx()*k),(b[1]+oy-pad)*k-4); }
ctx.setLineDash([]); ctx.fillStyle="#fff"; ctx.lineWidth=Math.max(2,2*k); const hx=(b[2]+dx+ox+pad)*k, hy=(b[3]+dy+oy+pad)*k, hr=Math.max(6*k,8*inkPx()*k);
ctx.beginPath(); ctx.arc(hx,hy,hr,0,6.283); ctx.fill(); ctx.stroke();
const sq=hr*.8, mxh=(b[0]+b[2])/2+dx+ox, myh=(b[1]+b[3])/2+dy+oy; ctx.beginPath(); ctx.rect(hx-sq,myh*k-sq,sq*2,sq*2); ctx.rect(mxh*k-sq,hy-sq,sq*2,sq*2); ctx.fill(); ctx.stroke();
const rx=(bcx+dx+ox)*k, ry=(b[1]+dy+oy-pad-34*inkPx())*k; ctx.beginPath(); ctx.moveTo(rx,(b[1]+dy+oy-pad)*k); ctx.lineTo(rx,ry); ctx.stroke(); ctx.beginPath(); ctx.arc(rx,ry,hr,0,6.283); ctx.fillStyle="#2563eb"; ctx.fill(); ctx.strokeStyle="#fff"; ctx.stroke();
ctx.beginPath(); ctx.arc(rx,ry,hr*.5,.4,5.4); ctx.strokeStyle="#fff"; ctx.lineWidth=Math.max(1.5,1.6*k); ctx.stroke(); ctx.restore();
}
function inkSelDown(e,x,y,allowAdd){
const b=ink.sel.box,pad=8;
if(inkSelLocked()){ if(x>=b[0]-pad&&x<=b[2]+pad&&y>=b[1]-pad&&y<=b[3]+pad)return true; ink.sel=null; inkToolbar(); inkOverClear(); inkRedraw(); return false; }
if(Math.hypot(x-(b[0]+b[2])/2,y-(b[1]-6-34*inkPx()))<=20*inkPx()){ ink.drag={mode:"rot",id:e.pointerId,th:0,cx:(b[0]+b[2])/2,cy:(b[1]+b[3])/2,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return true; }
if(Math.hypot(x-(b[2]+6),y-(b[3]+6))<=20*inkPx()){ ink.drag={mode:"scale",axis:"xy",id:e.pointerId,x0:b[0],y0:b[1],fx:1,fy:1,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return true; }
if(Math.hypot(x-(b[2]+6),y-(b[1]+b[3])/2)<=18*inkPx()){ ink.drag={mode:"scale",axis:"x",id:e.pointerId,x0:b[0],y0:b[1],fx:1,fy:1,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return true; }
if(Math.hypot(x-(b[0]+b[2])/2,y-(b[3]+6))<=18*inkPx()){ ink.drag={mode:"scale",axis:"y",id:e.pointerId,x0:b[0],y0:b[1],fx:1,fy:1,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return true; } if(allowAdd){ const pg0=inkPage(); let hi=-1; for(let q=pg0.strokes.length-1;q>=0;q--){ if(inkHit(pg0.strokes[q],x,y,10*inkPx())){ hi=q; break; } }
 if(hi>=0&&!ink.sel.idx.has(hi)){ const idx=new Set(ink.sel.idx); inkExpandSel(idx,pg0.strokes,hi); ink.sel={idx,box:inkBBox(pg0.strokes,idx)}; inkToolbar(); ink.drag={mode:"move",id:e.pointerId,sx:x,sy:y,dx:0,dy:0,hide:idx}; inkRedraw(); inkDrawSel(); return true; } }
if(x>=b[0]-pad&&x<=b[2]+pad&&y>=b[1]-pad&&y<=b[3]+pad){ ink.drag={mode:"move",id:e.pointerId,sx:x,sy:y,dx:0,dy:0,hide:ink.sel.idx}; inkRedraw(); inkDrawSel(); return true; } ink.sel=null; inkToolbar(); inkOverClear(); inkRedraw(); return false;
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
const canDraw=ink.tool!=="hand"&&e.button!==1&&(t==="pen"||t==="mouse"||(t==="touch"&&(inkFinger()||ink.tool==="laser")));
if(!canDraw){ ink.drag={mode:"pan",id:e.pointerId,x:e.clientX,y:e.clientY,tx:ink.tx,ty:ink.ty,vx:ink.vx,vy:ink.vy}; return; }
inkClosePop();
const [x,y]=(typeof inkGdDown==="function"?inkGdDown(e,inkToPage(e)):inkToPage(e)), pr=t==="pen"?(e.pressure||.5):.5; ink.lastPt=[x,y];
if(ink.tool==="move"){ if(inkMoveDown(e,x,y))return; ink.drag={mode:"pan",id:e.pointerId,x:e.clientX,y:e.clientY,tx:ink.tx,ty:ink.ty,vx:ink.vx,vy:ink.vy}; return; }
if(ink.tool==="eraser"){ ink.drag={mode:"erase",id:e.pointerId,del:new Set(),x,y,part:ink.ersPart?1:0,cur:inkPage().strokes,ch:0}; inkEraseAt(x,y); return; }
if(ink.tool==="lasso"){
if(ink.sel&&inkSelDown(e,x,y,true))return;
{ const pg0=inkPage(); let hi=-1; for(let q=pg0.strokes.length-1;q>=0;q--){ if(inkHit(pg0.strokes[q],x,y,10*inkPx())){ hi=q; break; } }
 if(hi>=0){ const idx=new Set([hi]); inkExpandSel(idx,pg0.strokes,hi); ink.sel={idx,box:inkBBox(pg0.strokes,idx)}; inkToolbar(); ink.drag={mode:"move",id:e.pointerId,sx:x,sy:y,dx:0,dy:0,hide:idx}; inkRedraw(); inkDrawSel(); return; } }
{ let lk=-1; const pg1=inkPage(); for(let q=pg1.strokes.length-1;q>=0;q--){ const s1=pg1.strokes[q]; if(s1.lk&&inkHit0(s1,x,y,10*inkPx())){ lk=q; break; } } ink.drag={mode:"lasso",id:e.pointerId,poly:[[x,y]],lk}; }
inkOverClear(); return; }
if(ink.tool==="text"||ink.tool==="sticky"){ ink.drag={mode:"text",id:e.pointerId,x,y,sticky:ink.tool==="sticky"?1:0}; return; }
if(ink.tool==="laser"){ ink.drag={mode:"laser",id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:0}; inkLaserAdd(x,y,1); return; }
if(ink.tool==="shape"){ if(ink.sel&&inkSelDown(e,x,y))return; const s={t:"s",sh:ink.shape,c:ink.color.pen,w:ink.size.shape,p:[+x.toFixed(1),+y.toFixed(1),0,+x.toFixed(1),+y.toFixed(1),0]}; if(ink.alpha<1)s.a=ink.alpha; if(ink.fill)s.f=ink.fill; if(ink.dash)s.d=1; ink.drag={mode:"draw",id:e.pointerId,s,pmin:0,pmax:0,t0:e.timeStamp}; inkLiveStroke(); return; }
ink.lastPt=[x,y];
if(ink.tool==="tape"){ const tn={t:"t",c:ink.color.tape,w:ink.size.tape,m:ink.tapeMode==="line"?"line":"free",p:[+x.toFixed(1),+y.toFixed(1),.5]}; ink.drag={mode:"draw",id:e.pointerId,s:tn,pmin:.5,pmax:.5,t0:e.timeStamp,ptype:t,inc:false,x0:x,y0:y}; inkLiveStroke(); return; }
const ns={t:ink.tool==="hl"?"h":"p",c:ink.color[ink.tool==="hl"?"hl":"pen"],w:inkSize(),v:0,p:[+x.toFixed(1),+y.toFixed(1),+pr.toFixed(2)]};
if(ink.tool==="pen"){ if(ink.brush!=="pen")ns.b=ink.brush; if(ink.alpha<1)ns.a=ink.alpha; }
ink.drag={mode:"draw",id:e.pointerId,t0:e.timeStamp,s:ns,pmin:pr,pmax:pr,ptype:t,inc:ink.tool==="pen"&&!ns.b&&!ns.a};
inkLiveStroke();
}
function inkMove(e){
const v=ink.ptrs.get(e.pointerId); const d=ink.drag;
if(v){ v.x=e.clientX; v.y=e.clientY; }
if(!d){ if(ink.tool==="laser"&&e.pointerType!=="touch"&&ink.note){ const [hx,hy]=inkToPage(e); inkLaserAdd(hx,hy,0); } return; }
if(d.mode==="pinch"){
const ts=[...ink.ptrs.values()].filter(q=>q.type==="touch"); if(ts.length<2)return;
const dist=Math.hypot(ts[0].x-ts[1].x,ts[0].y-ts[1].y), cx=(ts[0].x+ts[1].x)/2, cy=(ts[0].y+ts[1].y)/2;
if(ink.pinch){ ink.fast=1; if(ink.board){ ink.vx-=(cx-ink.pinch.cx)/ink.z; ink.vy-=(cy-ink.pinch.cy)/ink.z; } else{ ink.tx+=cx-ink.pinch.cx; ink.ty+=cy-ink.pinch.cy; } inkZoomAt(dist/ink.pinch.dist,cx,cy); ink.fast=0; }
ink.pinch={dist,cx,cy}; return; }
if(e.pointerId!==d.id)return;
if(d.mode==="pan"){ if(ink.board){ ink.vx=d.vx-(e.clientX-d.x)/ink.z; ink.vy=d.vy-(e.clientY-d.y)/ink.z; } else{ ink.tx=d.tx+(e.clientX-d.x); ink.ty=d.ty+(e.clientY-d.y); } inkApply(); return; }
const evs=(e.getCoalescedEvents&&e.getCoalescedEvents())||[]; const list=evs.length?evs:[e];
for(const ev of list){
const [x,y]=(typeof inkGdMove==="function"?inkGdMove(inkToPage(ev),d):inkToPage(ev));
if(d.mode==="draw"&&d.snap){ if(d.s.sh==="line"){ d.s.p[3]=+x.toFixed(1); d.s.p[4]=+y.toFixed(1); inkShapeConstrain(d.s,1); } continue; }
if(d.mode==="draw"&&d.s.t==="s"){ d.s.p[3]=+x.toFixed(1); d.s.p[4]=+y.toFixed(1); inkShapeConstrain(d.s,ev.shiftKey||e.shiftKey||ink.shift); continue; }
if(d.mode==="draw"&&d.s.t==="t"&&d.s.m==="line"){ let X=x,Y=y; const x0=d.x0,y0=d.y0, dx=X-x0, dy=Y-y0; if(Math.hypot(dx,dy)>1){ let a=Math.atan2(dy,dx); const st=Math.PI/12, g=Math.round(a/st)*st; if(ev.shiftKey||e.shiftKey||ink.shift||Math.abs(a-g)<.05){ const L=Math.hypot(dx,dy); X=x0+Math.cos(g)*L; Y=y0+Math.sin(g)*L; } } d.s.p=[d.s.p[0],d.s.p[1],.5,+X.toFixed(1),+Y.toFixed(1),.5]; continue; }
if(d.mode==="draw"){ const p=d.s.p, lx=p[p.length-3], ly=p[p.length-2]; if(Math.hypot(x-lx,y-ly)<0.7)continue;
const pr=e.pointerType==="pen"?(ev.pressure||e.pressure||.5):.5; (d.hist||(d.hist=[])).push([x,y,ev.timeStamp]); if(d.hist.length>6)d.hist.shift(); p.push(+x.toFixed(1),+y.toFixed(1),+pr.toFixed(2)); d.pmin=Math.min(d.pmin,pr); d.pmax=Math.max(d.pmax,pr); }
else if(d.mode==="erase"){ inkEraseAt(x,y); }
else if(d.mode==="laser"){ inkLaserAdd(x,y,1); if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>6)d.moved=1; }
else if(d.mode==="lasso"){ d.poly.push([x,y]); }
else if(d.mode==="move"){ d.dx=x-d.sx; d.dy=y-d.sy; }
else if(d.mode==="rot"){ let th=Math.atan2(x-d.cx,d.cy-y); const g=Math.round(th/(Math.PI/12))*(Math.PI/12); if(Math.abs(th-g)<.06)th=g; d.th=th; }
else if(d.mode==="scale"){ const b=ink.sel.box, bw=b[2]-b[0]||1, bh=b[3]-b[1]||1, cl=v=>Math.max(.05,Math.min(20,v)); if(d.axis==="x"){ d.fx=cl((x-d.x0)/bw); d.fy=(e.shiftKey||ink.shift)?d.fx:1; } else if(d.axis==="y"){ d.fy=cl((y-d.y0)/bh); d.fx=(e.shiftKey||ink.shift)?d.fy:1; } else{ const dd=bw*bw+bh*bh||1, f=cl(((x-d.x0)*bw+(y-d.y0)*bh)/dd); d.fx=d.fy=f; } }
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
if(d.mode==="draw"&&d.s.t==="s"){ inkShapeFinish(d.s); inkCommitAppend(d.s); { const pg1=inkPage(), li=pg1.strokes.length-1; if(li>=0&&pg1.strokes[li]===d.s){ const idx=new Set([li]); ink.tool="lasso"; ink.sel={idx,box:inkBBox(pg1.strokes,idx)}; inkOverClear(); inkDrawSel(); inkToolbar(); } } }
else if(d.mode==="rot"){ if(Math.abs(d.th)>.01){ const idx=ink.sel.idx, pg=inkPage(); const next=pg.strokes.map((s,i)=>idx.has(i)?inkRotated(s,d.cx,d.cy,d.th):s); ink.sel={idx,box:inkBBox(next,idx)}; inkCommit(next,true); } else{ inkRedraw(); inkDrawSel(); } }
else if(d.mode==="scale"){ if(Math.abs(d.fx-1)>.01||Math.abs(d.fy-1)>.01){ const idx=ink.sel.idx, pg=inkPage(), b=ink.sel.box; const next=pg.strokes.map((s,i)=>idx.has(i)?inkScaled(s,b[0],b[1],d.fx,d.fy):s); ink.sel={idx,box:[b[0],b[1],b[0]+(b[2]-b[0])*d.fx,b[1]+(b[3]-b[1])*d.fy]}; if(idx.size===1){ const q=next[[...idx][0]]; if(q&&q.t==="s")inkRememberShape(q); } inkCommit(next,true); } else{ inkRedraw(); inkDrawSel(); } }
else if(d.mode==="draw"&&d.s.t==="t"){ const s=d.s, L=s.p.length>=6?Math.hypot(s.p[s.p.length-3]-s.p[0],s.p[s.p.length-2]-s.p[1]):0; if(L<5&&s.p.length<=9){ inkOverClear(); if(!inkTapeTap(s.p[0],s.p[1]))inkRedraw(); return; } inkCommitAppend(s,false); }
else if(d.mode==="draw"){ const s=d.s; s.v=(d.pmax-d.pmin>0.12&&e.pointerType==="pen")?1:0; inkCommitAppend(s,!!(d.inc&&!d.snap&&!ink.sel&&d.li>=Math.floor(s.p.length/3))); }
else if(d.mode==="text"){ ink.drag=null; inkTextAt(d.x,d.y,d.sticky); return; }
else if(d.mode==="laser"){ ink.laserDown=false; if(!d.moved&&ink.pres)inkLinkTap(e); return; }
else if(d.mode==="pan"){ if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<6&&(ink.tool==="hand"||ink.pres))inkLinkTap(e); return; }
else if(d.mode==="erase"){ if(d.part){ if(d.ch)inkCommit(d.cur); else{ inkOverClear(); inkRedraw(); } } else if(d.del.size){ inkCommit(inkPage().strokes.filter((_,i)=>!d.del.has(i))); } else{ inkOverClear(); inkRedraw(); } }
else if(d.mode==="lasso"){ inkLassoDone(d.poly,d.lk); }
else if(d.mode==="move"){ if(d.dup&&Math.abs(d.dx)+Math.abs(d.dy)>1){ inkMoveDup(d); return; } if(Math.abs(d.dx)+Math.abs(d.dy)>1){ const idx=ink.sel.idx, pg=inkPage();
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
function inkLassoDone(poly,lk){
inkOverClear(); const pg=inkPage(); const idx=new Set();
if(poly.length<=6){ const [tx,ty]=poly[0]; for(let i=pg.strokes.length-1;i>=0;i--){ if(inkHit(pg.strokes[i],tx,ty,10*inkPx())){ idx.add(i); break; } } if(!idx.size&&lk>=0&&lk<pg.strokes.length)idx.add(lk); }
else pg.strokes.forEach((s,i)=>{ if(s.lk)return; if(s.t==="s"||s.t==="i"||s.t==="k"){ const q=inkBB(s); if(inkInPoly(poly,(q[0]+q[2])/2,(q[1]+q[3])/2))idx.add(i); return; } const n=s.p.length/3; let inn=0; for(let j=0;j<n;j++)if(inkInPoly(poly,s.p[j*3],s.p[j*3+1]))inn++; if(inn/n>=.5)idx.add(i); });
[...idx].forEach(q=>inkExpandSel(idx,pg.strokes,q)); ink.sel=idx.size?{idx,box:inkBBox(pg.strokes,idx)}:null; inkDrawSel(); inkToolbar();
}
// ลบเป็นจุด (แบบยางลบใน Photoshop): ตัดเส้นเป็นท่อน ลบเฉพาะช่วงที่ถูกยางลบทับ
function inkSplitErase(s,x,y,r){
 if(s.t==="x"||s.t==="i"||s.t==="k")return [];
 let src=s;
 if(s.t==="s"){ const g=inkShapePolys(s,40); const out=[]; g.lines.forEach(L=>{ if(L.length<2)return; const p=[]; L.forEach(q=>p.push(q[0],q[1],1)); out.push({t:"p",c:s.c,w:s.w,p,...(s.a!=null?{a:s.a}:{})}); }); const res=[]; out.forEach(o=>{ if(inkHit(o,x,y,r)){ const q=inkSplitErase(o,x,y,r); (q||[]).forEach(v=>res.push(v)); } else res.push(o); }); return res; }
 const p=s.p, n=Math.floor(p.length/3), rr=r+s.w/2, step=Math.max(1.5,rr/2.5), pts=[];
 for(let i=0;i<n;i++){ const X=p[i*3],Y=p[i*3+1],P=p[i*3+2]; if(i>0){ const ax=p[i*3-3],ay=p[i*3-2],ap=p[i*3-1], len=Math.hypot(X-ax,Y-ay);
  if(len>step&&inkSegDist(x,y,ax,ay,X,Y)<=rr+2){ const m=Math.ceil(len/step); for(let j=1;j<m;j++){ const t=j/m; pts.push([ax+(X-ax)*t,ay+(Y-ay)*t,ap+(P-ap)*t]); } } }
  pts.push([X,Y,P]); }
 const res=[]; let cur=[]; const flush=()=>{ if(cur.length>=2){ const q=[]; cur.forEach(v=>q.push(+v[0].toFixed(1),+v[1].toFixed(1),+(+v[2]).toFixed(2))); res.push({...src,p:q}); } cur=[]; };
 pts.forEach(v=>{ if(Math.hypot(v[0]-x,v[1]-y)<=rr)flush(); else cur.push(v); }); flush();
 return res;
}
function inkEraseAt(x,y){
const d=ink.drag, pg=inkPage(), r=inkSize(); let ch=false;
if(d.part){ const out=[]; d.cur.forEach(s=>{ if(inkHit(s,x,y,r)){ ch=true; inkSplitErase(s,x,y,r).forEach(v=>out.push(v)); } else out.push(s); });
 if(ch){ d.cur=out; d.ch=1; const c=el("ink-base"); inkRenderTo(c.getContext("2d"),ink.k,d.cur,null,inkOpt()); }
 const o=el("ink-over"), ctx=o.getContext("2d"), k=ink.k, [ox,oy]=inkO(); ctx.clearRect(0,0,o.width,o.height);
 ctx.save(); ctx.strokeStyle="rgba(80,80,80,.7)"; ctx.fillStyle="rgba(255,255,255,.35)"; ctx.lineWidth=Math.max(1,1.3*k); ctx.beginPath(); ctx.arc((x+ox)*k,(y+oy)*k,r*k,0,6.283); ctx.fill(); ctx.stroke(); ctx.restore(); return; }
pg.strokes.forEach((s,i)=>{ if(!d.del.has(i)&&inkHit(s,x,y,r)){ d.del.add(i); ch=true; } });
if(ch){ const c=el("ink-base"); inkRenderTo(c.getContext("2d"),ink.k,pg.strokes,d.del,inkOpt()); }
const o=el("ink-over"), ctx=o.getContext("2d"), k=ink.k, [ox,oy]=inkO(); ctx.clearRect(0,0,o.width,o.height);
ctx.save(); ctx.strokeStyle="rgba(80,80,80,.7)"; ctx.fillStyle="rgba(255,255,255,.35)"; ctx.lineWidth=Math.max(1,1.3*k); ctx.beginPath(); ctx.arc((x+ox)*k,(y+oy)*k,r*k,0,6.283); ctx.fill(); ctx.stroke(); ctx.restore();
}

// ---------- แถบเครื่องมือ ----------
const INK_TOOLS=[["pen","ปากกา",'<path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/>'],["shape","รูปทรง",'<rect x="3.5" y="4" width="10" height="10" rx="1.5"/><circle cx="15.5" cy="15.5" r="5"/>'],["hl","ไฮไลต์",'<path d="M9 4l11 11-5 5L4 9z"/><path d="M4 20h6"/>'],["eraser","ยางลบ",'<path d="M7 20h12M4.5 14.5L13 6l5 5-8.5 8.5H6z"/>'],["text","ข้อความ",'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'],["lasso","เลือก/ย้าย",'<path d="M12 4c5 0 8 2 8 5s-3 5-8 5-8-2-8-5 3-5 8-5z" stroke-dasharray="3 3"/><path d="M9 14c-1 3 0 5 3 6"/>'],["move","เคลื่อนย้าย (V) — แตะ/ลากวัตถุใดก็ได้เพื่อย้าย ไม่ต้องลาสโซ่ · Alt = ทำสำเนา · ลูกศร = ขยับทีละนิด",'<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'],["laser","เลเซอร์พอยน์เตอร์",'<circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'],["tape","เทป (ปิดบัง/ไฮไลต์)",'<path d="M4 9l11-4 5 5-4 11H6z" fill="none"/><path d="M8 12l5 5M10.5 9.5l5 5"/>'],["sticky","โน้ตแปะ",'<path d="M5 4h14v10l-6 6H5z"/><path d="M13 20v-6h6"/>'],["hand","เลื่อนหน้า",'<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-1V6a1.5 1.5 0 0 1 3 0v7c0 4-2 7-6 7-3 0-4-2-6-5l-1-2a1.5 1.5 0 0 1 2.5-1.5L8 14"/>']];
const INK_ACTS=[["img","แทรกรูปภาพจากเครื่อง",'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-5 4 4 3-3 4 4"/>'],["stk","สติกเกอร์สถานะ (ด่วน HOT เสร็จแล้ว…) ขยับได้",'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c1 1.6 2.2 2.4 3.5 2.4s2.5-.8 3.5-2.4M9 9.5h.01M15 9.5h.01"/>'],["mic","พิมพ์ตามเสียงพูด",'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>'],["calc","เครื่องคิดเลข (+ − × ÷ %) · ใส่ผลลงหน้า · พิมพ์ 1+1= ได้ผลทันที",'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 15h.01M12 15h.01M15.5 15h.01"/>'],["ruler","ไม้บรรทัด / เส้นไกด์ (ลากจากขอบบน/ซ้ายมาวางทาบ ลากกลับเพื่อลบ)",'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>'],["ai","ผู้ช่วย AI — ถามหาเครื่องมือ / ให้สอนใช้งานหน้านี้",'<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>']];
function inkToolbar(){
const tb=el("ink-tools");
tb.innerHTML=INK_TOOLS.map(([k,l,p])=>`<button type="button" class="ink-b${ink.tool===k?" on":""}" data-itool="${k}" title="${l}" aria-label="${l}" aria-pressed="${ink.tool===k}">${svg(p,20)}</button>`).join("")+INK_ACTS.map(([k,l,p])=>`<button type="button" class="ink-b${k==="mic"&&ink.voiceOn?" on":""}" data-iact="${k}" title="${l}" aria-label="${l}">${svg(p,20)}</button>`).join("");
const key=inkColKey();
const showColor=["pen","hl","shape","text","laser","tape","sticky"].includes(ink.tool);
el("ink-colors").innerHTML=showColor?({hl:INK_HL,laser:INK_LASER,tape:INK_TAPE,sticky:INK_STICKY}[ink.tool]||INK_PEN).map(c=>`<button type="button" class="ink-c${ink.color[key]===c?" on":""}" data-icolor="${c}" style="background:${c}" aria-label="สี ${c}"></button>`).join(""):"";
el("ink-sizes").innerHTML=inkSizesHtml();
el("ink-undo").disabled=!ink.undo.length; el("ink-redo").disabled=!ink.redo.length;
el("ink-seldel").hidden=!ink.sel; el("ink-selshape").hidden=!ink.sel; if(typeof inkSelBtns==="function")inkSelBtns();
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
<div class="ink-row" style="margin-top:6px"><label class="ink-opt" style="cursor:pointer">🎨 เลือกสีเอง <input type="color" data-ipaperc value="${nt.paper||"#ffffff"}" style="width:26px;height:22px;border:0;padding:0;background:none"></label></div>
<div class="ink-row" style="margin-top:8px"><button type="button" class="ink-opt" data-idef="1">⭐ ตั้งเป็นค่าเริ่มต้นของ${ink.board?"กระดานใหม่ (ลาย+สีนี้)":"สมุดใหม่ (สีนี้)"}</button></div>${(()=>{ const d=INKDEF[ink.board?"board":"book"]; return d?`<div class="hint" style="margin:4px 4px 0;font-size:12px">ค่าเริ่มต้นตอนนี้: ${esc(d.tpl?(INK_TPL.find(x=>x[0]===d.tpl)||[0,d.tpl])[1]+" · ":"")}สี ${esc((INK_PAPER.find(x=>x[0]===d.paper)||[0,d.paper||"ขาว"])[1])} · <button type="button" class="ink-opt" data-idef="0" style="padding:2px 8px">ล้างค่า</button></div>`:`<div class="hint" style="margin:4px 4px 0;font-size:12px">ตั้งแล้วใช้กับ${ink.board?"กระดานใหม่":"สมุดใหม่"}ทุกครั้ง ทุกเครื่อง ไม่ต้องปรับซ้ำ</div>`; })()}
<div class="ink-ph">ปกสมุด (แสดงที่การ์ดในหน้าบันทึก)</div><div class="ink-row"><button type="button" class="ink-opt${!nt.cover?" on":""}" data-icover="">ไม่มีปก</button>${INK_COVERS.map(c=>`<button type="button" class="ink-c${nt.cover===c?" on":""}" data-icover="${c}" style="background:${c}" aria-label="ปก ${c}"></button>`).join("")}</div>
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
await inkImgFlush();
const dirty=ink.pages.filter(p=>p.dirty);
for(const p of dirty){
const payload={noteId:ink.note._id,strokes:p.strokes};
if(ink.board&&!ink.bigWarn&&p.strokes.reduce((a,s)=>a+s.p.length,0)>600000){ ink.bigWarn=1; tell("<b>กระดานนี้ใหญ่มากแล้ว</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">แนะนำให้เริ่มกระดานใหม่สำหรับงานต่อไป เพื่อให้เปิด/บันทึกได้เร็วค่ะ</div>"); }
const {error}=await SB.from("rows").upsert({id:"ink-"+p.id,uid,kind:"ink",data:payload,updated_at:new Date().toISOString()});
if(error)throw error; p.dirty=false; }
const nt=inkLive();
const ptpl={}; ink.pages.forEach(p=>{ if(p.tpl)ptpl[p.id]=p.tpl; });
const d={pages:ink.pages.length,pageIds:ink.pages.map(p=>p.id),ptpl,bm:ink.bm||[],gd:(typeof inkGdMap==="function"?inkGdMap():{}),...((final||!nt.thumb)?{thumb:inkThumb()}:{}),updated:new Date().toISOString(),title:(el("ink-title").value||"").trim()||nt.title||("สมุดเขียนมือ "+fmtDate(new Date().toISOString().slice(0,10)))};
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
tpl:spec.tpl||(board?((INKDEF.board&&INKDEF.board.tpl)||"grid"):"lines"),paper:spec.paper||(INKDEF[board?"board":"book"]&&INKDEF[board?"board":"book"].paper)||"#ffffff",thumb:"",folder};
try{ const r=await DB.collection("note").add(doc); inkOpen({...doc,_id:r.id},true); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
}
async function inkOpen(n,fresh){
ink.note=n; ink.board=n.mode==="board"; ink.pages=[]; ink.cur=0; ink.undo=[]; ink.redo=[]; ink.sel=null; ink.drag=null; ink.ptrs.clear(); ink.z=1; ink.tx=0; ink.ty=0; ink.vx=-60; ink.vy=-60; ink.dirtyAny=false; ink.bigWarn=0; ink.bm=(n.bm||[]).slice(); ink.pres=false; el("inkdlg").classList.remove("pres"); if(typeof inkSideClose==="function")inkSideClose();
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
ink.pages=ids.map(i=>({id:i,strokes:((rows["ink-"+i]||{}).strokes)||[],dirty:false,tpl:(n.ptpl&&n.ptpl[i])||null,gd:((n.gd&&n.gd[i])||[]).filter(g=>g&&(g.o==="v"||g.o==="h")&&isFinite(g.v)).map(g=>({o:g.o,v:+g.v}))}));
if(ink.board&&ink.pages[0].strokes.length){ const b=inkAllBox(); const st=el("ink-stage"); ink.vx=b[0]-60; ink.vy=b[1]-60; ink.z=Math.max(.2,Math.min(1,Math.min(st.clientWidth/(b[2]-b[0]+120),st.clientHeight/(b[3]-b[1]+120)))); }
el("ink-load").hidden=true; inkStatus(fresh?"สมุดใหม่":"บันทึกแล้ว ✓",fresh?"":"ok"); inkImgLoadAll();
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
await inkSave(true); await inkImgsReady();
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
el("inkdlg").addEventListener("cancel",e=>{ e.preventDefault(); if(ink.pres){ inkPresExit(); return; } if(!el("ink-side").hidden){ inkSideClose(); return; } if(!el("ink-exp").hidden){ el("ink-exp").hidden=true; return; } if(!el("ink-pop").hidden){ inkClosePop(); return; } inkClose(); });
el("ink-undo").onclick=()=>inkUndo(false); el("ink-redo").onclick=()=>inkUndo(true);
el("ink-selshape").onclick=()=>inkSelToShape();
el("ink-seldel").onclick=()=>{ if(!ink.sel)return; const idx=ink.sel.idx; inkCommit(inkPage().strokes.filter((_,i)=>!idx.has(i))); };
el("ink-finger").onclick=()=>{ ink.fingerMode={auto:"on",on:"off",off:"auto"}[ink.fingerMode]; if(ink.fingerMode==="auto")ink.penSeen=false; inkSetSave(); inkToolbar(); };
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
if(b.dataset.itool){ const pt=ink.tool; ink.tool=b.dataset.itool; if(pt!==ink.tool&&!(["lasso","move"].includes(pt)&&["lasso","move"].includes(ink.tool)))ink.sel=null; inkOverClear(); inkDrawSel(); inkToolbar(); }
else if(b.dataset.icolor){ ink.color[inkColKey()]=b.dataset.icolor; inkSetSave(); inkToolbar(); if(ink.pres&&typeof inkPresBar==="function")inkPresBar(); }
else if(b.dataset.iact){ inkAct(b.dataset.iact,b); }
else if(b.dataset.ipage){ inkGo(+b.dataset.ipage); }
else if(b.id==="ink-prev")inkGo(ink.cur-1); else if(b.id==="ink-next")inkGo(ink.cur+1); else if(b.id==="ink-addpage")inkAddPage(); else if(b.id==="ink-addtpl")inkGallery("add");
else if(b.dataset.idef!=null){ const k=ink.board?"board":"book", nt=inkLive(); const nd={...INKDEF}; if(b.dataset.idef==="1")nd[k]={...(ink.board?{tpl:nt.tpl||"grid"}:{}),paper:nt.paper||"#ffffff"}; else delete nd[k]; INKDEF=nd; try{ await DB.doc("meta/inkdef").set(nd); }catch(er){ tell("<b>บันทึกค่าเริ่มต้นไม่สำเร็จ</b>"); } inkTplMenu(el("ink-tpl")); if(b.dataset.idef==="1")inkStatus("ตั้งเป็นค่าเริ่มต้นแล้ว ✓","ok"); }
else if(b.dataset.icover!=null){ const d={cover:b.dataset.icover}; Object.assign(ink.note,d); try{ await DB.collection("note").doc(ink.note._id).set(d,{merge:true}); }catch(er){} inkTplMenu(el("ink-tpl")); }
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
const tg=e.target&&e.target.tagName; if(m&&!ink.ta&&tg!=="INPUT"&&tg!=="TEXTAREA"&&["c","x","v"].includes(e.key.toLowerCase())){ const k=e.key.toLowerCase(); if(k==="v"){ if(ink.clip&&ink.clip.length){ e.preventDefault(); inkPaste(); } } else if(ink.sel){ e.preventDefault(); inkCopy(k==="x"); } return; }
if(m&&e.key.toLowerCase()==="z"){ e.preventDefault(); inkUndo(e.shiftKey); } else if(m&&e.key.toLowerCase()==="y"){ e.preventDefault(); inkUndo(true); }
else if((e.key==="Delete"||e.key==="Backspace")&&ink.sel&&document.activeElement!==el("ink-title")&&tg!=="INPUT"&&tg!=="TEXTAREA"){ e.preventDefault(); el("ink-seldel").click(); } });
})();
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
default: if(typeof inkTplDraw2==="function")inkTplDraw2(ctx,t.k,t,{C,X,T,L,R,CB,LINES,SEC,HEAD,d0,mn,dw,byear,MTH}); break;
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
el("tg-body").innerHTML=quick+grp("Planner")+grp("แบบฟอร์มทำงาน")+grp("วางแผน & วิเคราะห์")+grp("HR & ทีม")+grp("ติดตามผล")+opts;
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
// ---------- โฟลเดอร์จัดระเบียบ Note ----------
let noteFolders=[];                      // [{id,name,color}]
const FLD_COLORS=["#2f80c8","#2e9e6b","#e08a1e","#c94c4c","#8a5cc7","#3aa5a5","#d1568f","#6b7a89"];
const folderOf=key=>noteFolders.find(f=>f.id===key);
const folderName=key=>{ const f=folderOf(key); return f?f.name:"(ไม่พบโฟลเดอร์)"; };
const fldCount=key=>notes.filter(n=>key==="__none"?!n.folder||!folderOf(n.folder):n.folder===key).length;
async function fldSave(list){ noteFolders=list; await saveMeta("nfolders",noteFolders); }
function askText(msg,def="",yes="ตกลง"){
el("cmsg").innerHTML=msg+`<div style="margin-top:14px"><input id="ctext" maxlength="60" value="${esc(def)}" style="width:100%;background:var(--paper);border:0;border-radius:var(--r-xs);padding:12px 14px;font-size:15px"></div>`;
el("cyes").textContent=yes; el("cyes").style.display=""; el("cno").textContent="ยกเลิก";
el("cdlg").showModal(); setTimeout(()=>{ const i=el("ctext"); if(i){ i.focus(); i.select(); i.onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); el("cyes").click(); } }; } },30);
return new Promise(r=>{ cResolve=v=>r(v?((el("ctext")&&el("ctext").value)||"").trim():null); });
}
async function fldCreate(name){
name=(name||"").trim(); if(!name)return null;
const ex=noteFolders.find(f=>f.name===name); if(ex)return ex.id;
const f={id:"f"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,color:FLD_COLORS[noteFolders.length%FLD_COLORS.length]};
await fldSave([...noteFolders,f]); return f.id;
}
// เลือกโฟลเดอร์ปลายทาง — คืน id | "" (ไม่อยู่โฟลเดอร์) | null (ยกเลิก)
async function pickFolder(cur){
const opts=`<option value="">— ไม่อยู่ในโฟลเดอร์ —</option>`+noteFolders.map(f=>`<option value="${esc(f.id)}"${f.id===cur?" selected":""}>📁 ${esc(f.name)}</option>`).join("")+`<option value="__new">＋ สร้างโฟลเดอร์ใหม่…</option>`;
const v=await askPick("ย้ายไปโฟลเดอร์ไหนคะ?",opts,"ย้าย");
if(v===null)return null;
if(v==="__new"){ const nm=await askText("ตั้งชื่อโฟลเดอร์ใหม่","","สร้างและย้าย"); if(!nm)return null; return await fldCreate(nm); }
return v;
}
async function noteMoveTo(ids,folder){
for(const id of ids){ try{ await DB.collection("note").doc(id).set({folder},{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; } }
setFoot(folder?"ย้ายไปโฟลเดอร์ “"+folderName(folder)+"” แล้ว":"เอาออกจากโฟลเดอร์แล้ว");
}
function noteFolderBar(){
const cur=R.noteFolder||"";
const chip=(key,label,n,col)=>`<button type="button" class="fchip${cur===key?" on":""}" data-fld="${esc(key)}"${key&&key!=="__none"?` data-fdrop="${esc(key)}"`:key==="__none"?` data-fdrop=""`:""}>${col?`<i style="background:${col}"></i>`:""}<span>${esc(label)}</span><b>${n}</b></button>`;
return `<div class="fbar" id="fbar">${chip("","ทั้งหมด",notes.length)}${noteFolders.map(f=>chip(f.id,f.name,fldCount(f.id),f.color)).join("")}${noteFolders.length?chip("__none","ยังไม่จัดโฟลเดอร์",fldCount("__none")):""}
<button type="button" class="fchip add" id="fld-add">＋ โฟลเดอร์</button>${noteFolders.length?`<button type="button" class="fchip add" id="fld-mng">จัดการ</button>`:""}</div>`;
}
function noteFolderTag(n){ const f=n.folder&&folderOf(n.folder); return f?`<span class="tag" style="background:${f.color}22;color:${f.color}" title="โฟลเดอร์">📁 ${esc(f.name)}</span>`:""; }
function noteFolderFilter(n){ const c=R.noteFolder||""; if(!c)return true; if(c==="__none")return !n.folder||!folderOf(n.folder); return n.folder===c; }
function fldManage(){
const box=el("fl-list");
box.innerHTML=noteFolders.length?noteFolders.map((f,i)=>`<div class="flrow"><i style="background:${f.color}"></i><input class="nm" data-flname="${esc(f.id)}" value="${esc(f.name)}" aria-label="ชื่อโฟลเดอร์"><span class="flc">${fldCount(f.id)} รายการ</span>
<button class="iconbtn" data-flmv="${i}:-1" ${i===0?"disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,15)}</button><button class="iconbtn" data-flmv="${i}:1" ${i===noteFolders.length-1?"disabled":""} title="เลื่อนลง">${svg(ICON_DN,15)}</button>
<button class="iconbtn" data-flcol="${esc(f.id)}" title="เปลี่ยนสี">🎨</button><button class="iconbtn" data-fldel="${esc(f.id)}" title="ลบโฟลเดอร์" style="color:var(--over)">✕</button></div>`).join(""):`<div class="empty">ยังไม่มีโฟลเดอร์</div>`;
box.querySelectorAll("[data-flname]").forEach(i=>i.onchange=async()=>{ const nm=i.value.trim(); if(!nm){ fldManage(); return; } await fldSave(noteFolders.map(f=>f.id===i.dataset.flname?{...f,name:nm}:f)); });
box.querySelectorAll("[data-flmv]").forEach(b=>b.onclick=async()=>{ const [i,d]=b.dataset.flmv.split(":").map(Number), a=noteFolders.slice(), j=i+d; if(j<0||j>=a.length)return; [a[i],a[j]]=[a[j],a[i]]; await fldSave(a); fldManage(); });
box.querySelectorAll("[data-flcol]").forEach(b=>b.onclick=async()=>{ const f=folderOf(b.dataset.flcol), k=(FLD_COLORS.indexOf(f.color)+1)%FLD_COLORS.length; await fldSave(noteFolders.map(x=>x.id===f.id?{...x,color:FLD_COLORS[k]}:x)); fldManage(); });
box.querySelectorAll("[data-fldel]").forEach(b=>b.onclick=async()=>{
const f=folderOf(b.dataset.fldel), n=notes.filter(x=>x.folder===f.id);
el("fldlg").close();
const ok=await ask(`ลบโฟลเดอร์ “${esc(f.name)}” ใช่ไหมคะ?<div class="hint">บันทึกในโฟลเดอร์ ${n.length} รายการจะ <b>ไม่ถูกลบ</b> แค่ย้ายไปเป็น “ยังไม่จัดโฟลเดอร์”</div>`,"ลบโฟลเดอร์");
if(ok){ await noteMoveTo(n.map(x=>x._id),""); await fldSave(noteFolders.filter(x=>x.id!==f.id)); if(R.noteFolder===f.id)R.noteFolder=""; render(); }
if(noteFolders.length){ fldManage(); el("fldlg").showModal(); }
});
}
async function fldNew(andPick){
const nm=await askText("ตั้งชื่อโฟลเดอร์ใหม่ เช่น “ประชุมประจำเดือน” “งานสรรหา”","","สร้างโฟลเดอร์");
if(!nm)return null; const id=await fldCreate(nm); if(andPick){ R.noteFolder=id; render(); } return id;
}
function noteFolderWire(){
document.querySelectorAll("[data-fld]").forEach(b=>b.onclick=()=>{ R.noteFolder=b.dataset.fld; render(); });
el("fld-add")&&(el("fld-add").onclick=()=>fldNew(true));
el("fld-mng")&&(el("fld-mng").onclick=()=>{ fldManage(); el("fldlg").showModal(); });
document.querySelectorAll("[data-ntmv]").forEach(b=>b.onclick=async e=>{
e.stopPropagation(); const n=notes.find(v=>v._id===b.dataset.ntmv); if(!n)return;
const v=await pickFolder(n.folder||""); if(v===null)return; await noteMoveTo([n._id],v); });
// ลากการ์ดไปวางบนชิปโฟลเดอร์ (คอมพิวเตอร์) — บนมือถือ/ไอแพดใช้ปุ่ม “ย้าย”
document.querySelectorAll(".notecard[data-nt]").forEach(c=>{ c.draggable=true; c.ondragstart=e=>{ e.dataTransfer.setData("text/plain",c.dataset.nt); e.dataTransfer.effectAllowed="move"; c.classList.add("dragging"); }; c.ondragend=()=>c.classList.remove("dragging"); });
document.querySelectorAll("[data-fdrop]").forEach(z=>{
z.ondragover=e=>{ e.preventDefault(); z.classList.add("over"); }; z.ondragleave=()=>z.classList.remove("over");
z.ondrop=async e=>{ e.preventDefault(); z.classList.remove("over"); const id=e.dataTransfer.getData("text/plain"); if(id&&notes.some(n=>n._id===id))await noteMoveTo([id],z.dataset.fdrop); };
});
}
(function(){ if(!el("fldlg"))return; el("fl-close").onclick=()=>el("fldlg").close(); el("fl-new").onclick=async()=>{ el("fldlg").close(); await fldNew(false); fldManage(); el("fldlg").showModal(); }; })();
// ===== หัวปากกาหลายแบบ + รูปทรงมาตรฐาน (ใช้ร่วมกับ 05b-ink.js) =====
// ลายเส้น: {t:"p",c,w,v,p:[x,y,แรงกด,…], b:"หัวปากกา", a:ความทึบ 0-1}  ·  รูปทรง: {t:"s",sh,c,w,a,f:0|1|2,d:0|1,p:[x1,y1,0,x2,y2,0]}
// ข้อมูลเก่า (ไม่มี b) = ปากกาปกติ เปิดได้เหมือนเดิม
const INK_BRUSHES=[
{k:"pen",n:"ปากกา",w:3.5},{k:"calli",n:"คอแร้ง",w:9},{k:"pencil",n:"ดินสอ",w:4.5},{k:"crayon",n:"สีเทียน",w:11},{k:"brush",n:"พู่กัน",w:12},
{k:"air",n:"แอร์บรัช (ฟุ้ง)",w:26},{k:"spray",n:"สเปรย์พ่น",w:24},{k:"blur",n:"เบลอ",w:16},{k:"water",n:"สีน้ำ",w:26},{k:"sketch",n:"สเก็ต",w:4}];
const INK_SHAPES=[["line","เส้นตรง"],["arrow","ลูกศร"],["darrow","ลูกศรสองหัว"],["rect","สี่เหลี่ยม"],["rrect","สี่เหลี่ยมมน"],["ellipse","วงกลม/วงรี"],["triangle","สามเหลี่ยม"],["diamond","ข้าวหลามตัด"],["pentagon","ห้าเหลี่ยม"],["hexagon","หกเหลี่ยม"],["star","ดาว"],["heart","หัวใจ"],["plus","กากบาท"]];
Object.assign(ink,{ersPart:1,snap:1,brush:"pen",size:{pen:3.5,hl:18,eraser:18,shape:3.5,text:26,tape:28,laser:6,sticky:22},tapeMode:"free",alpha:1,shape:"rect",fill:0,dash:0,lock:0});
function inkSetSave(){ try{ localStorage.setItem("sw-ink-set",JSON.stringify({brush:ink.brush,size:ink.size,alpha:ink.alpha,shape:ink.shape,fill:ink.fill,dash:ink.dash,lock:ink.lock,snap:ink.snap,ep:ink.ersPart,lsh:ink.lastSh,color:ink.color,tm:ink.tapeMode,fm:ink.fingerMode})); }catch(e){} }
(function(){ try{ const o=JSON.parse(localStorage.getItem("sw-ink-set")||"null"); if(!o)return;
if(INK_BRUSHES.some(b=>b.k===o.brush))ink.brush=o.brush; if(o.size)["pen","hl","eraser","shape","text","tape","laser","sticky"].forEach(k=>{ if(+o.size[k]>0)ink.size[k]=+o.size[k]; }); if(o.tm==="line")ink.tapeMode="line"; if(["auto","on","off"].includes(o.fm))ink.fingerMode=o.fm;
if(o.alpha>=.1&&o.alpha<=1)ink.alpha=+o.alpha; if(INK_SHAPES.some(s=>s[0]===o.shape))ink.shape=o.shape; ink.fill=[0,1,2].includes(o.fill)?o.fill:0; ink.dash=o.dash?1:0; ink.lock=o.lock?1:0; ink.snap=o.snap===0?0:1; ink.ersPart=o.ep===0?0:1; if(o.lsh&&o.lsh.w>5&&o.lsh.h>5)ink.lastSh={w:+o.lsh.w,h:+o.lsh.h};
if(o.color){ if(INK_PEN.includes(o.color.pen))ink.color.pen=o.color.pen; if(INK_HL.includes(o.color.hl))ink.color.hl=o.color.hl; ink.colorSaved=o.color; } }catch(e){} })();

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
if(s.t==="x")return inkTextDraw(ctx,s,k,dx,dy);
if(s.t==="i")return inkImgDraw(ctx,s,k,dx,dy);
if(s.t==="k")return inkStkDraw(ctx,s,k,dx,dy);
if(s.t==="t")return inkTapeDraw(ctx,s,k,dx,dy);
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
function inkShapeFinish(s){ const p=s.p, line=s.sh==="line"||s.sh==="arrow"||s.sh==="darrow";
if(Math.abs(p[3]-p[0])<6&&Math.abs(p[4]-p[1])<6){ const L=ink.lastSh||{w:140,h:120}; p[3]=+(p[0]+L.w).toFixed(1); p[4]=+(p[1]+(line?0:L.h)).toFixed(1); }   // แตะเฉยๆ = วางด้วยขนาดล่าสุดที่ใช้
else inkRememberShape(s); }
function inkRememberShape(s){ const line=s.sh==="line"||s.sh==="arrow"||s.sh==="darrow", w=Math.abs(s.p[3]-s.p[0]), h=Math.abs(s.p[4]-s.p[1]), L=ink.lastSh||{w:140,h:120}; if(Math.max(w,h)<6)return; ink.lastSh={w:+Math.max(w,6).toFixed(1),h:line?L.h:+Math.max(h,6).toFixed(1)}; inkSetSave(); }

// ---------- แถบเครื่องมือ + เมนูลอย ----------
function inkSizesHtml(){
const t=ink.tool; if(!["pen","shape","hl","eraser","text","tape","laser","sticky"].includes(t))return "";
const key=inkSizeKey(), v=ink.size[key], rg={pen:[1,60],shape:[1,40],hl:[4,70],eraser:[4,90],text:[10,120],tape:[8,90],laser:[3,18],sticky:[12,60]}[key]; let h="";
if(t==="tape")h+=`<button type="button" class="ink-opt ink-bb" id="ink-tapem" title="เทปแบบอิสระ ลากตามมือ / แบบแนวตรง (ลากเป็นเส้นตรง ล็อกมุม 15°)">${ink.tapeMode==="line"?"📏 แนวตรง":"✍ อิสระ"} ⇄</button>`;
if(t==="pen"){ const b=INK_BRUSHES.find(x=>x.k===ink.brush)||INK_BRUSHES[0]; h+=`<button type="button" class="ink-opt ink-bb" id="ink-brushb" title="เปลี่ยนหัวปากกา (ดินสอ พู่กัน สเปรย์ ฯลฯ)">🖌 ${esc(b.n)} ▾</button>`; }
if(t==="shape"){ const b=INK_SHAPES.find(x=>x[0]===ink.shape)||INK_SHAPES[0]; h+=`<button type="button" class="ink-opt ink-bb" id="ink-shapeb" title="เลือกรูปทรง">◇ ${esc(b[1])} ▾</button>`; }
if(t==="eraser")h+=`<button type="button" class="ink-opt ink-bb" id="ink-ersm" title="สลับโหมดยางลบ: ลบเป็นจุดแบบ Photoshop / ลบทั้งเส้น">${ink.ersPart?"◔ ลบเป็นจุด":"▭ ลบทั้งเส้น"} ⇄</button>`;
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
if(b.id==="ink-tapem"){ ink.tapeMode=ink.tapeMode==="line"?"free":"line"; inkSetSave(); inkToolbar(); return; }
if(b.id==="ink-ersm"){ ink.ersPart=ink.ersPart?0:1; inkSetSave(); inkToolbar(); return; }
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
if(s.t==="x"){ const mx=(s.p[0]+s.p[3])/2, my=(s.p[1]+s.p[4])/2, [nx,ny]=R(mx,my); return {...s,p:s.p.map((v,j)=>j%3===0?+(v+nx-mx).toFixed(1):j%3===1?+(v+ny-my).toFixed(1):v)}; }
if((s.t==="s"&&s.sh!=="line"&&s.sh!=="arrow"&&s.sh!=="darrow")||s.t==="i"||s.t==="k"){
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
// ---------- กลุ่ม · ข้อความ · แต่งสิ่งที่เลือก · สำเนา · จัดแนว (สมุดเขียนมือ / กระดานกว้าง) ----------
const INK_FONT='"Sarabun","Noto Sans Thai","Prompt",system-ui,-apple-system,"Segoe UI",sans-serif';
function inkExpandSel(idx,strokes,q){ idx.add(q); const g=strokes[q]&&strokes[q].g; if(!g)return idx; strokes.forEach((s,i)=>{ if(s.g===g)idx.add(i); }); return idx; }
// หน่วย = กลุ่ม (ถ้ามี g) หรือเส้นเดี่ยว
function inkUnits(strokes,idx){ const m=new Map(), out=[]; [...idx].sort((a,b)=>a-b).forEach(i=>{ const g=strokes[i].g; if(g){ if(!m.has(g)){ const u=[]; m.set(g,u); out.push(u); } m.get(g).push(i); } else out.push([i]); }); return out; }
function inkSelBtns(){
const sel=ink.sel, on=!!sel, pg=on?inkPage():null, S=on?pg.strokes:[], ids=on?[...sel.idx]:[];
const units=on?inkUnits(S,sel.idx):[], hasG=ids.some(i=>S[i]&&S[i].g);
const g=el("ink-selgrp"); if(!g)return;
g.hidden=!on||(units.length<2&&!hasG); g.textContent=hasG&&units.length===1?"เลิกกลุ่ม":(hasG?"เลิกกลุ่ม":"จัดกลุ่ม");
el("ink-selfmt").hidden=!on; el("ink-seldup").hidden=!on; el("ink-selcopy").hidden=!on; el("ink-selcut").hidden=!on; el("ink-selpaste").hidden=!(ink.clip&&ink.clip.length); el("ink-selaln").hidden=!on||units.length<2;
el("ink-seledit").hidden=!(on&&ids.length===1&&S[ids[0]]&&S[ids[0]].t==="x");
if(el("ink-sellock")){ const allLk=on&&ids.every(i=>S[i]&&S[i].lk); el("ink-sellock").hidden=!on; el("ink-sellock").textContent=allLk?"🔓 ปลดล็อก":"🔒 ล็อก"; el("ink-selz").hidden=!on||allLk; el("ink-sellink").hidden=!on; }
}
function inkGroupToggle(){
if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx, hasG=[...idx].some(i=>pg.strokes[i].g);
const gid=hasG?null:"g"+Math.random().toString(36).slice(2,8);
const next=pg.strokes.map((s,i)=>{ if(!idx.has(i))return s; const o={...s}; if(gid)o.g=gid; else delete o.g; return o; });
inkCommit(next,true); inkStatus(hasG?"เลิกกลุ่มแล้ว":"จัดกลุ่มแล้ว — เลือก/ย้ายพร้อมกันเสมอ","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("","") },2200);
}
// ---------- ข้อความ ----------
let inkTMc=null;
function inkTextMeasure(s){ if(!inkTMc)inkTMc=document.createElement("canvas").getContext("2d"); const c=inkTMc, fs=s.fs||24; c.font=fs+"px "+INK_FONT; const L=String(s.tx||"").split("\n"); let w=0; L.forEach(l=>{ w=Math.max(w,c.measureText(l).width); });
 let W=Math.max(fs*.6,+w.toFixed(1)), H=+(L.length*fs*1.35).toFixed(1);
 if(s.bg){ const pd=fs*.55; W=Math.max(W+pd*2,fs*6.4); H=Math.max(H+pd*2,fs*4); }
 return [W,H]; }
function inkTextDraw(ctx,s,k,dx,dy){
const fs=(s.fs||24)*k, L=String(s.tx||"").split("\n"); ctx.save(); ctx.font=fs+"px "+INK_FONT; ctx.fillStyle=s.c||"#1d1d1f"; ctx.textBaseline="top";
let ox=(s.p[0]+dx)*k, oy=(s.p[1]+dy)*k;
if(s.bg){ const x0=(s.p[0]+dx)*k, y0=(s.p[1]+dy)*k, w=(s.p[3]-s.p[0])*k, h=(s.p[4]-s.p[1])*k, r=Math.min(w,h)*.06; ctx.save(); ctx.shadowColor="rgba(0,0,0,.22)"; ctx.shadowBlur=7*k; ctx.shadowOffsetY=2.5*k; ctx.fillStyle=s.bg; ctx.beginPath(); ctx.moveTo(x0+r,y0); ctx.lineTo(x0+w-r,y0); ctx.quadraticCurveTo(x0+w,y0,x0+w,y0+r); ctx.lineTo(x0+w,y0+h-r*3); ctx.lineTo(x0+w-r*3,y0+h); ctx.lineTo(x0+r,y0+h); ctx.quadraticCurveTo(x0,y0+h,x0,y0+h-r); ctx.lineTo(x0,y0+r); ctx.quadraticCurveTo(x0,y0,x0+r,y0); ctx.fill(); ctx.restore();
 ctx.save(); ctx.fillStyle="rgba(0,0,0,.10)"; ctx.beginPath(); ctx.moveTo(x0+w-r*3,y0+h); ctx.lineTo(x0+w,y0+h-r*3); ctx.lineTo(x0+w-r*3,y0+h-r*3); ctx.closePath(); ctx.fill(); ctx.restore();
 const pd=(s.fs||24)*.55*k; ox+=pd; oy+=pd; }
L.forEach((l,i)=>ctx.fillText(l,ox,oy+i*fs*1.35)); ctx.restore();
}
function inkMkText(x,y,tx,fs,c,g,bg){ const o={t:"x",c,w:1,fs,tx,p:[+x.toFixed(1),+y.toFixed(1),0,0,0,0]}; if(g)o.g=g; if(bg)o.bg=bg; const m=inkTextMeasure(o); o.p[3]=+(x+m[0]).toFixed(1); o.p[4]=+(y+m[1]).toFixed(1); return o; }
function inkPageToScreen(x,y){ const c=el("ink-over"), r=c.getBoundingClientRect(), [ox,oy]=inkO(), d=window.devicePixelRatio||1; return [r.left+(x+ox)*ink.k/d, r.top+(y+oy)*ink.k/d]; }
function inkTextAt(x,y,sticky){
const pg=inkPage(); let hi=-1; for(let q=pg.strokes.length-1;q>=0;q--){ const s=pg.strokes[q]; if(s.t==="x"&&inkHit(s,x,y,6)){ hi=q; break; } }
inkTextEdit(hi>=0?hi:-1,x,y,sticky?ink.color.sticky:null);
}
function inkTextEdit(i,x,y,bgNew){
inkTextClose(true); const pg=inkPage(), old=i>=0?pg.strokes[i]:null, bg=old?old.bg:bgNew, fs=old?old.fs:(bg?ink.size.sticky:ink.size.text), col=old?old.c:(bg?"#1d1d1f":ink.color.pen), pdd=bg?fs*.55:0;
const px=(old?old.p[0]:x)+pdd, py=(old?old.p[1]:y)+pdd, [sx,sy]=inkPageToScreen(px,py), d=window.devicePixelRatio||1, z=ink.k/d;
const ta=document.createElement("textarea"); ta.id="ink-ta"; ta.value=old?old.tx:""; ta.rows=Math.max(1,(ta.value.split("\n").length)); ta.placeholder="พิมพ์ข้อความ…";
ta.style.cssText=`position:fixed;z-index:30;left:${sx}px;top:${sy}px;min-width:${Math.max(140,fs*z*6)}px;max-width:70vw;font:${fs*z}px/1.35 ${INK_FONT};color:${col};background:rgba(255,255,255,.88);border:1.5px dashed #2563eb;border-radius:6px;padding:0;margin:0;outline:none;resize:both;overflow:hidden;-webkit-user-select:text;user-select:text`;
el("inkdlg").appendChild(ta); ink.ta={ta,i,x:px-pdd,y:py-pdd,bg:bgNew||null}; ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length);
const fit=()=>{ ta.style.height="auto"; ta.style.height=ta.scrollHeight+"px"; }; fit(); ta.addEventListener("input",fit);
ta.addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.preventDefault(); inkTextClose(false); } else if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); inkTextClose(true); } e.stopPropagation(); });
ta.addEventListener("blur",()=>setTimeout(()=>{ if(ink.ta&&ink.ta.ta===ta)inkTextClose(true); },120));
}
function inkTextClose(commit){
const T=ink.ta; if(!T)return; ink.ta=null; const tx=T.ta.value.replace(/\s+$/,""); T.ta.remove(); if(!commit)return;
const pg=inkPage(), old=T.i>=0?pg.strokes[T.i]:null;
if(!tx){ if(old){ inkCommit(pg.strokes.filter((_,j)=>j!==T.i)); } return; }
if(old){ if(old.tx===tx)return; const o=inkMkText(old.p[0],old.p[1],tx,old.fs,old.c,old.g,old.bg); if(old.id)o.id=old.id; if(old.lk)o.lk=old.lk; inkCommit(pg.strokes.map((s,j)=>j===T.i?o:s)); return; }
{ const o=T.bg?inkMkText(T.x,T.y,tx,ink.size.sticky,"#1d1d1f",null,T.bg):inkMkText(T.x,T.y,tx,ink.size.text,ink.color.pen); inkCommit([...pg.strokes,o]); }
}
// ---------- แต่งสิ่งที่เลือก ----------
function inkSelApply(fn){ if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx; const next=pg.strokes.map((s,i)=>idx.has(i)?fn(s):s); ink.sel={idx,box:inkBBox(next,idx)}; inkCommit(next,true); }
function inkSelFmtMenu(a){
const pg=inkPage(), ids=[...ink.sel.idx], S=ids.map(i=>pg.strokes[i]), hasT=S.some(s=>s.t==="x"), hasO=S.some(s=>s.t!=="x"), hasS=S.some(s=>s.t==="s");
const w0=Math.round((S.find(s=>s.t!=="x")||{w:3}).w*2)/2, f0=Math.round((S.find(s=>s.t==="x")||{fs:26}).fs);
inkPop(`<div class="ink-ph">สี</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px">${INK_PEN.map(c=>`<button type="button" class="ink-c" data-sfc="${c}" style="background:${c}" aria-label="สี ${c}"></button>`).join("")}</div>
${hasO?`<div class="ink-ph">ความหนาเส้น <b id="ink-sfwv">${w0}</b></div><input type="range" id="ink-sfw" class="ink-wide" min="1" max="40" step="0.5" value="${w0}">`:""}
${hasT?`<div class="ink-ph">ขนาดตัวอักษร <b id="ink-sffv">${f0}</b></div><input type="range" id="ink-sff" class="ink-wide" min="10" max="120" step="1" value="${f0}">`:""}
${hasT?`<div class="ink-ph">พื้นโน้ตแปะ</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px"><button type="button" class="ink-opt" data-sfb="">ไม่มีพื้น</button>${INK_STICKY.map(c=>`<button type="button" class="ink-c" data-sfb="${c}" style="background:${c}" aria-label="พื้น ${c}"></button>`).join("")}</div>`:""}
${hasS?`<div class="ink-ph">เปลี่ยนรูปทรง</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px">${INK_SHAPES.map(([k,n])=>`<button type="button" class="ink-opt" data-sfs="${k}">${esc(n)}</button>`).join("")}</div>`:""}`,a);
}
function inkAlignMenu(a){
inkPop(`<div class="ink-ph">จัดแนว (ตามกรอบของที่เลือก)</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px">${[["l","ชิดซ้าย"],["cx","กึ่งกลางแนวนอน"],["r","ชิดขวา"],["t","ชิดบน"],["cy","กึ่งกลางแนวตั้ง"],["b","ชิดล่าง"]].map(([k,n])=>`<button type="button" class="ink-opt" data-saln="${k}">${n}</button>`).join("")}</div>
<div class="ink-ph">กระจายระยะเท่ากัน (ต้อง 3 ชิ้น/กลุ่มขึ้นไป)</div><div class="ink-row"><button type="button" class="ink-opt" data-saln="dh">แนวนอน</button><button type="button" class="ink-opt" data-saln="dv">แนวตั้ง</button></div>`,a);
}
function inkAlign(op){
if(!ink.sel)return; const pg=inkPage(), S=pg.strokes, units=inkUnits(S,ink.sel.idx); if(units.length<2)return;
const bb=units.map(u=>inkBBox(S,new Set(u))), B=[Math.min(...bb.map(b=>b[0])),Math.min(...bb.map(b=>b[1])),Math.max(...bb.map(b=>b[2])),Math.max(...bb.map(b=>b[3]))];
const mv=units.map(()=>[0,0]);
if(op==="dh"||op==="dv"){ if(units.length<3)return; const ax=op==="dh"?0:1; const ord=units.map((u,i)=>i).sort((a,b)=>bb[a][ax]-bb[b][ax]); const tot=ord.reduce((s,i)=>s+(bb[i][ax+2]-bb[i][ax]),0), gap=((B[ax+2]-B[ax])-tot)/(units.length-1); let pos=B[ax]; ord.forEach(i=>{ mv[i][ax]=pos-bb[i][ax]; pos+=(bb[i][ax+2]-bb[i][ax])+gap; }); }
else units.forEach((u,i)=>{ const b=bb[i]; if(op==="l")mv[i][0]=B[0]-b[0]; else if(op==="r")mv[i][0]=B[2]-b[2]; else if(op==="cx")mv[i][0]=(B[0]+B[2])/2-(b[0]+b[2])/2; else if(op==="t")mv[i][1]=B[1]-b[1]; else if(op==="b")mv[i][1]=B[3]-b[3]; else if(op==="cy")mv[i][1]=(B[1]+B[3])/2-(b[1]+b[3])/2; });
const dm=new Map(); units.forEach((u,i)=>u.forEach(q=>dm.set(q,mv[i])));
const next=S.map((s,i)=>{ const m=dm.get(i); return m&&(m[0]||m[1])?{...s,p:s.p.map((v,j)=>+(v+(j%3===0?m[0]:j%3===1?m[1]:0)).toFixed(1))}:s; });
ink.sel={idx:ink.sel.idx,box:inkBBox(next,ink.sel.idx)}; inkCommit(next,true);
}
function inkDuplicate(){
if(!ink.sel)return; const pg=inkPage(), S=pg.strokes, ids=[...ink.sel.idx].sort((a,b)=>a-b), gm=new Map(), off=24;
const cp=ids.map(i=>{ const s=S[i], o={...s,p:s.p.map((v,j)=>+(v+(j%3===0||j%3===1?off:0)).toFixed(1))}; if(s.g){ if(!gm.has(s.g))gm.set(s.g,"g"+Math.random().toString(36).slice(2,8)); o.g=gm.get(s.g); } return o; });
const next=[...S,...cp], idx=new Set(cp.map((_,j)=>S.length+j)); inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
}
// ---------- คัดลอก / ตัด / วาง ----------
function inkCopy(cut){
if(!ink.sel)return; const pg=inkPage(), ids=[...ink.sel.idx].sort((a,b)=>a-b);
ink.clip=ids.map(i=>JSON.parse(JSON.stringify(pg.strokes[i]))); ink.clipN=0;
inkStatus((cut?"ตัด":"คัดลอก")+"แล้ว "+ids.length+" ชิ้น — กด วาง ได้เลย","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2200);
if(cut){ const idx=ink.sel.idx; inkCommit(pg.strokes.filter((_,i)=>!idx.has(i))); } else inkToolbar();
}
function inkPaste(){
if(!ink.clip||!ink.clip.length)return; const pg=inkPage(), S=pg.strokes, gm=new Map(); ink.clipN=(ink.clipN||0)+1; const off=24*ink.clipN;
const cp=ink.clip.map(s=>{ const o={...s,p:s.p.map((v,j)=>+(v+(j%3===0||j%3===1?off:0)).toFixed(1))}; if(s.g){ if(!gm.has(s.g))gm.set(s.g,"g"+Math.random().toString(36).slice(2,8)); o.g=gm.get(s.g); } return o; });
const next=[...S,...cp], idx=new Set(cp.map((_,j)=>S.length+j)); ink.tool="lasso"; inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
}
(function inkGroupWire(){
const dlg=el("inkdlg"); if(!dlg)return;
el("ink-selgrp").onclick=inkGroupToggle; el("ink-selcopy").onclick=()=>inkCopy(false); el("ink-selcut").onclick=()=>inkCopy(true); el("ink-selpaste").onclick=inkPaste; el("ink-seldup").onclick=inkDuplicate;
el("ink-selfmt").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-sfc]")){ inkClosePop(); return; } if(ink.sel)inkSelFmtMenu(e.currentTarget); };
el("ink-selaln").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-saln]")){ inkClosePop(); return; } if(ink.sel)inkAlignMenu(e.currentTarget); };
el("ink-seledit").onclick=()=>{ if(!ink.sel)return; const i=[...ink.sel.idx][0], s=inkPage().strokes[i]; if(s&&s.t==="x")inkTextEdit(i,s.p[0],s.p[1]); };
dlg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return;
if(b.dataset.sfc){ const c=b.dataset.sfc; inkSelApply(s=>({...s,c})); return; }
if(b.dataset.sfb!=null){ const bg=b.dataset.sfb; inkSelApply(s=>{ if(s.t!=="x")return s; const o={...s}; if(bg){ o.bg=bg; if(o.c==="#ffffff")o.c="#1d1d1f"; } else delete o.bg; o.p=[...s.p]; const m=inkTextMeasure(o); o.p[3]=+(o.p[0]+m[0]).toFixed(1); o.p[4]=+(o.p[1]+m[1]).toFixed(1); return o; }); return; }
if(b.dataset.sfs){ const k=b.dataset.sfs; inkSelApply(s=>s.t==="s"?{...s,sh:k}:s); return; }
if(b.dataset.saln){ inkAlign(b.dataset.saln); inkClosePop(); return; } });
dlg.addEventListener("input",e=>{ const t=e.target; if(t.id==="ink-sfw")el("ink-sfwv").textContent=t.value; else if(t.id==="ink-sff")el("ink-sffv").textContent=t.value; });
dlg.addEventListener("change",e=>{ const t=e.target;
if(t.id==="ink-sfw"){ const v=+t.value; inkSelApply(s=>s.t==="x"?s:{...s,w:v}); }
else if(t.id==="ink-sff"){ const v=+t.value; inkSelApply(s=>{ if(s.t!=="x")return s; const o={...s,fs:v}; const m=inkTextMeasure(o); o.p=[...s.p]; o.p[3]=+(o.p[0]+m[0]).toFixed(1); o.p[4]=+(o.p[1]+m[1]).toFixed(1); return o; }); } });
})();

// Shift ค้าง = ล็อกสัดส่วน (สี่เหลี่ยมจัตุรัส/วงกลม/เส้น 15°) เหมือน Photoshop
window.addEventListener("keydown",e=>{ if(e.key==="Shift")ink.shift=true; }); window.addEventListener("keyup",e=>{ if(e.key==="Shift")ink.shift=false; }); window.addEventListener("blur",()=>{ ink.shift=false; });
// ===== สมุดเขียนมือ: รูปภาพ · ล็อก · ลำดับชั้น · เลเซอร์ · เทป · ลิงก์ (ต่อจาก 05b/05e/05f) =====
// รูปภาพ: {t:"i",id,p:[x1,y1,0,x2,y2,0],r?,lk?,a?}  ข้อมูลภาพเก็บแยกที่ rows(kind "nimg", id "inkimg-<id>") — ลายเส้นเก็บแค่รหัสอ้างอิง
// เทป:   {t:"t",c,w,m:"free"|"line",p:[...],o?:1 (เปิดเผยของใต้เทป)}
// ลิงก์: u:{k:"url"|"pg"|"bm",v}
const INK_LASER=["#ff2d2d","#ff9500","#22c55e","#2563eb","#a855f7","#ec4899"];
const INK_TAPE=["#ffe14d","#ff9ec7","#8ec9ff","#7ee08f","#ffb36b","#c9a7ff","#e5e7eb","#1d1d1f"];
const INK_STICKY=["#fff59d","#ffd6e0","#c8f0d0","#cfe8ff","#ffe0b3","#e5d4ff"];
Object.assign(ink.color,{laser:INK_LASER[0],tape:INK_TAPE[0],sticky:INK_STICKY[0]});
(function(){ const cs=ink.colorSaved; if(!cs)return; if(INK_LASER.includes(cs.laser))ink.color.laser=cs.laser; if(INK_TAPE.includes(cs.tape))ink.color.tape=cs.tape; if(INK_STICKY.includes(cs.sticky))ink.color.sticky=cs.sticky; })();

// ---------- ตัวช่วยเรื่องสถานะการเลือก ----------
function inkSelLocked(){ if(!ink.sel||!ink.sel.idx.size)return false; const S=inkPage().strokes; return [...ink.sel.idx].every(i=>S[i]&&S[i].lk); }
function inkSelHasLink(){ if(!ink.sel)return false; const S=inkPage().strokes; return [...ink.sel.idx].some(i=>S[i]&&S[i].u); }
function inkFlat(s){ return (s.t==="i"||s.t==="k")?inkImgFlat(s):inkShapeFlat(s); }

// ---------- รูปภาพ ----------
const INK_IMGS=new Map(), inkImgDirty=new Set();
function inkImgRec(id){ let r=INK_IMGS.get(id); if(!r){ r={id,el:null,ok:false,p:null,src:""}; INK_IMGS.set(id,r); } return r; }
function inkImgSet(id,src){ const r=inkImgRec(id); r.src=src; r.p=new Promise(res=>{ const im=new Image(); im.onload=()=>{ r.el=im; r.ok=true; res(true); try{ if(ink.note){ inkRedrawSoon(); } }catch(e){} }; im.onerror=()=>{ r.ok=false; r.bad=true; res(false); }; im.src=src; }); return r.p; }
async function inkImgLoadAll(){
 if(!SB||!ink.note)return; const ids=new Set(); ink.pages.forEach(pg=>pg.strokes.forEach(s=>{ if(s.t==="i"&&!(INK_IMGS.get(s.id)&&INK_IMGS.get(s.id).p))ids.add(s.id); }));
 if(!ids.size)return; const arr=[...ids];
 try{ for(let i=0;i<arr.length;i+=4){ const part=arr.slice(i,i+4); const {data,error}=await SB.from("rows").select("id,data").eq("uid",uid).in("id",part.map(x=>"inkimg-"+x)); if(error)throw error;
   (data||[]).forEach(r=>{ const id=String(r.id).replace(/^inkimg-/,""); if(r.data&&r.data.d)inkImgSet(id,r.data.d); });
   part.forEach(id=>{ const r=inkImgRec(id); if(!r.p){ r.bad=true; } }); } }catch(e){}
}
async function inkImgsReady(){ const ps=[]; ink.pages.forEach(pg=>pg.strokes.forEach(s=>{ if(s.t==="i"){ const r=INK_IMGS.get(s.id); if(r&&r.p)ps.push(r.p); } })); await Promise.all(ps); }
async function inkImgFlush(){
 if(!inkImgDirty.size)return; const ids=[...inkImgDirty];
 for(const id of ids){ const r=INK_IMGS.get(id); if(!r||!r.src){ inkImgDirty.delete(id); continue; }
  const {error}=await SB.from("rows").upsert({id:"inkimg-"+id,uid,kind:"nimg",data:{d:r.src,note:ink.note._id},updated_at:new Date().toISOString()}); if(error)throw error; inkImgDirty.delete(id); }
}
function inkImgFlat(s){ const p=s.p, cx=(p[0]+p[3])/2, cy=(p[1]+p[4])/2, co=Math.cos(s.r||0), si=Math.sin(s.r||0), o=[];
 [[p[0],p[1]],[p[3],p[1]],[p[3],p[4]],[p[0],p[4]]].forEach(([x,y])=>{ o.push(cx+(x-cx)*co-(y-cy)*si,cy+(x-cx)*si+(y-cy)*co,0); }); return o; }
function inkImgHit(s,x,y,r){ const p=s.p, cx=(p[0]+p[3])/2, cy=(p[1]+p[4])/2, co=Math.cos(-(s.r||0)), si=Math.sin(-(s.r||0)), dx=x-cx, dy=y-cy, lx=dx*co-dy*si, ly=dx*si+dy*co;
 return Math.abs(lx)<=Math.abs(p[3]-p[0])/2+r*.3&&Math.abs(ly)<=Math.abs(p[4]-p[1])/2+r*.3; }
function inkImgDraw(ctx,s,k,dx,dy){
 const p=s.p, x0=Math.min(p[0],p[3]), y0=Math.min(p[1],p[4]), w=Math.abs(p[3]-p[0]), h=Math.abs(p[4]-p[1]); if(w<1||h<1)return;
 ctx.save(); if(s.r){ const cx=(x0+w/2+dx)*k, cy=(y0+h/2+dy)*k; ctx.translate(cx,cy); ctx.rotate(s.r); ctx.translate(-cx,-cy); }
 const r=INK_IMGS.get(s.id), X=(x0+dx)*k, Y=(y0+dy)*k;
 if(r&&r.ok){ if(s.a!=null)ctx.globalAlpha=s.a; ctx.imageSmoothingQuality="high"; ctx.drawImage(r.el,X,Y,w*k,h*k); }
 else{ ctx.fillStyle="#e5e7eb"; ctx.fillRect(X,Y,w*k,h*k); ctx.strokeStyle="#9ca3af"; ctx.lineWidth=Math.max(1,k); ctx.strokeRect(X,Y,w*k,h*k); ctx.fillStyle="#6b7280"; ctx.font=Math.max(10,Math.min(18*k,h*k/3))+"px sans-serif"; ctx.textBaseline="middle"; ctx.textAlign="center"; ctx.fillText(r&&r.bad?"(โหลดรูปไม่ได้)":"กำลังโหลดรูป…",X+w*k/2,Y+h*k/2); }
 ctx.restore();
}
// ย่อรูปก่อนเก็บ: ด้านยาวสุด ≤1600px · PNG/WebP/GIF ที่มีความโปร่งใสคง PNG (ถ้าไม่ใหญ่เกิน) ไม่งั้น JPEG
function inkImgScale(file){
 return new Promise((res,rej)=>{ const u=URL.createObjectURL(file), im=new Image();
  im.onload=()=>{ try{ const w=im.naturalWidth, h=im.naturalHeight; let sc=Math.min(1,1600/Math.max(w,h)); const c=document.createElement("canvas"); let out="";
   const alpha=/png|webp|gif/i.test(file.type);
   for(let t=0;t<5;t++){ c.width=Math.max(1,Math.round(w*sc)); c.height=Math.max(1,Math.round(h*sc)); const x=c.getContext("2d");
    if(alpha){ x.clearRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); out=c.toDataURL("image/png"); if(out.length<900000)break; }
    x.globalCompositeOperation="destination-over"; x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.globalCompositeOperation="source-over";
    if(!alpha){ x.drawImage(im,0,0,c.width,c.height); }
    out=c.toDataURL("image/jpeg",.85); if(out.length<750000)break; sc*=.8; }
   URL.revokeObjectURL(u); res({src:out,w:im.naturalWidth,h:im.naturalHeight}); }catch(e){ URL.revokeObjectURL(u); rej(e); } };
  im.onerror=()=>{ URL.revokeObjectURL(u); rej(new Error("อ่านรูปไม่ได้")); }; im.src=u; });
}
async function inkImgAdd(files){
 if(!ink.note)return; files=[...files].filter(f=>/^image\//.test(f.type)); if(!files.length)return;
 inkStatus("กำลังเตรียมรูป…","busy"); const pg=inkPage(), st=el("ink-stage"), r=st.getBoundingClientRect();
 const [cx,cy]=inkToPage({clientX:r.left+r.width/2,clientY:r.top+r.height/2}); const viewW=ink.board?st.clientWidth/ink.z:INK_W, viewH=ink.board?st.clientHeight/ink.z:INK_H;
 const made=[]; let off=0;
 for(const f of files){ try{ const q=await inkImgScale(f); const id="i"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
   await inkImgSet(id,q.src); inkImgDirty.add(id);
   let w=viewW*(ink.board?.4:.55), h=w*q.h/q.w; const mh=viewH*.6; if(h>mh){ h=mh; w=h*q.w/q.h; }
   const x0=cx-w/2+off, y0=cy-h/2+off; off+=28; made.push({t:"i",id,c:"#000",w:0,p:[+x0.toFixed(1),+y0.toFixed(1),0,+(x0+w).toFixed(1),+(y0+h).toFixed(1),0]}); }catch(e){ tell("<b>แทรกรูปไม่สำเร็จ</b><div class=\"hint\">"+esc(e.message||"อ่านไฟล์ไม่ได้")+"</div>"); } }
 if(!made.length){ inkStatus("",""); return; }
 const next=[...pg.strokes,...made], idx=new Set(made.map((_,j)=>pg.strokes.length+j)); ink.tool="lasso"; inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
 inkStatus("แทรกรูปแล้ว — ลากย้าย · มุมขวาล่างย่อ/ขยาย · วงกลมบนหมุน","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },3500);
}
document.addEventListener("paste",e=>{ if(!ink.note||!el("inkdlg").open||ink.ta)return; const fs=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(f=>/^image\//.test(f.type)); if(fs.length){ e.preventDefault(); inkImgAdd(fs); } });
(function(){ const st=el("ink-stage"); if(!st)return; st.addEventListener("dragover",e=>{ if(ink.note&&e.dataTransfer&&[...e.dataTransfer.types].includes("Files"))e.preventDefault(); });
 st.addEventListener("drop",e=>{ if(!ink.note||!e.dataTransfer||!e.dataTransfer.files.length)return; e.preventDefault(); inkImgAdd(e.dataTransfer.files); });
 el("ink-imgf").addEventListener("change",e=>{ const fs=[...e.target.files]; e.target.value=""; if(fs.length)inkImgAdd(fs); }); })();

// ---------- ปุ่มลัดบนแถบเครื่องมือ (รูป / ไมค์) ----------
function inkAct(k,btn){ if(k==="stk"){ const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-istk]")){ inkClosePop(); return; } inkStkMenu(btn); return; } if(k==="img"){ el("ink-imgf").click(); } else if(k==="mic"&&typeof inkVoiceToggle==="function"){ inkVoiceToggle(); } else if(k==="calc"&&typeof calcOpenInk==="function"){ calcOpenInk(); } else if(k==="ruler"&&typeof inkRulMenu==="function"){ inkRulMenu(btn); } else if(k==="ai"&&typeof hlpToggle==="function"){ inkClosePop(); hlpToggle(el("inkdlg")); } }

// ---------- ล็อก · ลำดับชั้น ----------
function inkLockToggle(){ if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx, all=[...idx].every(i=>pg.strokes[i]&&pg.strokes[i].lk);
 const next=pg.strokes.map((s,i)=>{ if(!idx.has(i))return s; const o={...s}; if(all)delete o.lk; else o.lk=1; return o; }); inkCommit(next,true); inkDrawSel();
 inkStatus(all?"ปลดล็อกแล้ว":"ล็อกแล้ว — ย้าย/ลบไม่ได้ จนกว่าจะปลดล็อก (แตะที่ของล็อกด้วยเครื่องมือเลือกเพื่อปลด)","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },3200); }
function inkZMenu(a){ inkPop(`<div class="ink-ph">ลำดับชั้น (หน้า/หลัง)</div><button type="button" class="ink-mi" data-sz="front">⬆ ส่งไปหน้าสุด</button><button type="button" class="ink-mi" data-sz="fwd">↑ เลื่อนขึ้น 1 ชั้น</button><button type="button" class="ink-mi" data-sz="back1">↓ เลื่อนลง 1 ชั้น</button><button type="button" class="ink-mi" data-sz="back">⬇ ส่งไปหลังสุด</button>`,a); }
function inkReorder(op){
 if(!ink.sel)return; const pg=inkPage(), S=pg.strokes, n=S.length; let arr=S.map((s,i)=>({s,sel:ink.sel.idx.has(i)}));
 if(op==="front")arr=[...arr.filter(o=>!o.sel),...arr.filter(o=>o.sel)]; else if(op==="back")arr=[...arr.filter(o=>o.sel),...arr.filter(o=>!o.sel)];
 else if(op==="fwd"){ for(let i=n-2;i>=0;i--)if(arr[i].sel&&!arr[i+1].sel){ const t=arr[i]; arr[i]=arr[i+1]; arr[i+1]=t; } }
 else if(op==="back1"){ for(let i=1;i<n;i++)if(arr[i].sel&&!arr[i-1].sel){ const t=arr[i]; arr[i]=arr[i-1]; arr[i-1]=t; } }
 const idx=new Set(); arr.forEach((o,i)=>{ if(o.sel)idx.add(i); }); const next=arr.map(o=>o.s); inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
}

// ---------- เลเซอร์พอยน์เตอร์ (ไม่บันทึกลงสมุด) ----------
const inkLz={pts:[],raf:0,life:1200};
function inkLaserAdd(x,y,down){ const t=performance.now(); inkLz.pts.push({x,y,t}); if(inkLz.pts.length>260)inkLz.pts.shift(); ink.laserDown=down===1; if(!inkLz.raf)inkLz.raf=requestAnimationFrame(inkLaserLoop); }
function inkLaserLoop(){
 inkLz.raf=0; const c=el("ink-laser"); if(!c||!ink.note){ inkLz.pts=[]; return; } const ctx=c.getContext("2d"), now=performance.now(), k=ink.k, [ox,oy]=inkO();
 ctx.clearRect(0,0,c.width,c.height); inkLz.pts=inkLz.pts.filter(p=>now-p.t<inkLz.life); const P=inkLz.pts; if(!P.length)return;
 const col=ink.color.laser, wd=Math.max(2,(ink.size.laser||6)*k*1.2); ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
 for(let i=1;i<P.length;i++){ const a=1-(now-P[i].t)/inkLz.life; if(a<=0)continue; ctx.globalAlpha=Math.max(0,a*.9); ctx.strokeStyle=col; ctx.shadowColor=col; ctx.shadowBlur=wd*2.2; ctx.lineWidth=wd*(.35+.65*a);
  ctx.beginPath(); ctx.moveTo((P[i-1].x+ox)*k,(P[i-1].y+oy)*k); ctx.lineTo((P[i].x+ox)*k,(P[i].y+oy)*k); ctx.stroke(); }
 const h=P[P.length-1], ha=1-(now-h.t)/inkLz.life; if(ha>0){ ctx.globalAlpha=Math.min(1,ha*1.4); ctx.shadowBlur=wd*3; ctx.shadowColor=col; ctx.fillStyle=col; ctx.beginPath(); ctx.arc((h.x+ox)*k,(h.y+oy)*k,wd*1.15,0,6.283); ctx.fill(); ctx.shadowBlur=0; ctx.fillStyle="#fff"; ctx.globalAlpha=Math.min(1,ha*1.4)*.9; ctx.beginPath(); ctx.arc((h.x+ox)*k,(h.y+oy)*k,wd*.45,0,6.283); ctx.fill(); }
 ctx.restore(); inkLz.raf=requestAnimationFrame(inkLaserLoop);
}
function inkLaserClear(){ inkLz.pts=[]; const c=el("ink-laser"); if(c)c.getContext("2d").clearRect(0,0,c.width,c.height); }

// ---------- เทป ----------
function inkTapeDraw(ctx,s,k,dx,dy){
 const p=s.p, n=Math.floor(p.length/3); if(n<2)return; const X=i=>(p[i*3]+dx)*k, Y=i=>(p[i*3+1]+dy)*k;
 ctx.save(); ctx.lineCap="butt"; ctx.lineJoin="round"; ctx.globalAlpha=s.o?.2:.96; ctx.strokeStyle=s.c; ctx.lineWidth=Math.max(1,s.w*k);
 ctx.beginPath(); ctx.moveTo(X(0),Y(0)); if(n===2)ctx.lineTo(X(1),Y(1)); else{ for(let i=1;i<n-1;i++)ctx.quadraticCurveTo(X(i),Y(i),(X(i)+X(i+1))/2,(Y(i)+Y(i+1))/2); ctx.lineTo(X(n-1),Y(n-1)); } ctx.stroke();
 if(!s.o){ ctx.globalAlpha=.16; ctx.strokeStyle="#fff"; ctx.lineWidth=Math.max(1,s.w*k*.55); ctx.stroke(); }          // แถบสว่างกลางเทป ให้ดูเป็นเทปจริง
 ctx.restore();
}
function inkTapeTap(x,y){ const pg=inkPage(); for(let q=pg.strokes.length-1;q>=0;q--){ const s=pg.strokes[q]; if(s.t==="t"&&inkHit(s,x,y,3)){ const next=pg.strokes.map((v,i)=>{ if(i!==q)return v; const o={...v}; if(o.o)delete o.o; else o.o=1; return o; }); inkCommit(next); inkStatus(next[q].o?"เปิดเทปแล้ว (แตะอีกครั้งเพื่อปิดบัง)":"ปิดเทปกลับแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },1800); return true; } } return false; }

// ---------- ลิงก์ ----------
function inkLinkMenu(a){
 const pg=inkPage(), has=inkSelHasLink();
 inkPop(`<div class="ink-ph">ใส่ลิงก์ให้สิ่งที่เลือก</div><input id="ink-lurl" class="ink-sinp" placeholder="วางลิงก์เว็บ เช่น https://…" inputmode="url" autocapitalize="off" autocorrect="off" style="margin-bottom:6px"><button type="button" class="ink-mi" data-lk="url">🌐 ตั้งเป็นลิงก์เว็บ</button>
${ink.board?"":`<div class="ink-ph">ไปหน้า…</div><div class="ink-row">${ink.pages.map((p,i)=>`<button type="button" class="ink-opt" data-lk="pg" data-v="${p.id}">หน้า ${i+1}</button>`).join("")}</div>`}
${(ink.bm||[]).length?`<div class="ink-ph">ไปบุ๊กมาร์ก…</div>${ink.bm.map(b=>`<button type="button" class="ink-mi" data-lk="bm" data-v="${b.id}">🔖 ${esc(b.l)}</button>`).join("")}`:""}
${has?`<button type="button" class="ink-mi danger" data-lk="del">เอาลิงก์ออก</button>`:""}
<div class="hint" style="margin:8px 4px 0;font-size:12px">ใช้ลิงก์: เลือกเครื่องมือ “เลื่อนหน้า” (มือ) หรือโหมดนำเสนอ แล้วแตะที่ชิ้นงาน</div>`,a);
}
function inkLinkSet(u){ inkSelApply(s=>{ const o={...s}; if(u)o.u=u; else delete o.u; return o; }); inkClosePop(); inkStatus(u?"ใส่ลิงก์แล้ว":"เอาลิงก์ออกแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2000); }
function inkLinkGo(u){
 if(!u)return;
 if(u.k==="url"){ let h=String(u.v||""); if(!/^[a-z][a-z0-9+.-]*:/i.test(h))h="https://"+h; if(/^(https?:|mailto:|tel:)/i.test(h)){ try{ window.open(h,"_blank","noopener"); }catch(e){} } }
 else if(u.k==="pg"){ const i=ink.pages.findIndex(p=>p.id===u.v); if(i>=0)inkGo(i); }
 else if(u.k==="bm"){ const b=(ink.bm||[]).find(x=>x.id===u.v); if(b&&typeof inkBmGo==="function")inkBmGo(b); }
}
function inkLinkTap(e){
 if(!ink.note)return false; const [x,y]=inkToPage(e), pg=inkPage();
 for(let q=pg.strokes.length-1;q>=0;q--){ const s=pg.strokes[q]; if(s.u&&inkHit0(s,x,y,12*inkPx())){ inkLinkGo(s.u); return true; } } return false;
}

(function inkMoreWire(){
 const dlg=el("inkdlg"); if(!dlg)return;
 el("ink-sellock").onclick=inkLockToggle;
 el("ink-selz").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-sz]")){ inkClosePop(); return; } if(ink.sel)inkZMenu(e.currentTarget); };
 el("ink-sellink").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-lk]")){ inkClosePop(); return; } if(ink.sel)inkLinkMenu(e.currentTarget); };
 dlg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return;
  if(b.dataset.sz){ inkReorder(b.dataset.sz); inkClosePop(); return; }
  if(b.dataset.lk){ const k=b.dataset.lk; if(k==="url"){ const v=(el("ink-lurl").value||"").trim(); if(!v)return; inkLinkSet({k:"url",v}); } else if(k==="del")inkLinkSet(null); else inkLinkSet({k,v:b.dataset.v}); return; } });
 // ซ่อน/เคลียร์เลเซอร์เมื่อเปลี่ยนเครื่องมือ
 dlg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b&&b.dataset.itool&&b.dataset.itool!=="laser")inkLaserClear(); });
})();
// ===== สมุดเขียนมือ: แผงข้าง (หน้าย่อ · สารบัญ/บุ๊กมาร์ก · ค้นหา) + โหมดนำเสนอ + ปกสมุด =====
const INK_COVERS=["#124E82","#0f766e","#b45309","#9d174d","#6d28d9","#374151","#15803d","#be123c"];
ink.sideTab="pages"; ink.bm=[];
const inkSideEl=()=>el("ink-side");
function inkSideClose(){ const s=inkSideEl(); if(s)s.hidden=true; const b=el("ink-sidebtn"); if(b)b.classList.remove("on"); }
function inkSideOpen(tab){
 const s=inkSideEl(); if(!s)return; inkClosePop(); const tp=document.querySelector("#inkdlg .ink-top"), d=el("inkdlg").getBoundingClientRect(), r=tp.getBoundingClientRect();
 s.style.top=Math.max(0,r.bottom-d.top)+"px"; s.style.bottom=(el("ink-pages").offsetHeight||0)+"px";
 if(tab)ink.sideTab=tab; if(ink.board&&ink.sideTab==="pages")ink.sideTab="outline";
 s.hidden=false; el("ink-sidebtn").classList.add("on"); inkSideRender();
}
function inkSideToggle(){ const s=inkSideEl(); if(!s.hidden){ inkSideClose(); return; } inkSideOpen(); }
function inkSideRender(){
 const s=inkSideEl(); if(!s||s.hidden)return; const tabs=[...(ink.board?[]:[["pages","หน้า"]]),["outline","สารบัญ"],["search","ค้นหา"]];
 s.innerHTML=`<div class="ink-stabs">${tabs.map(([k,l])=>`<button type="button" data-stab="${k}" class="${ink.sideTab===k?"on":""}">${l}</button>`).join("")}<button type="button" data-stab="x" style="flex:none;width:38px" aria-label="ปิด">✕</button></div><div class="ink-sbody" id="ink-sbody"></div>`;
 const bd=el("ink-sbody");
 if(ink.sideTab==="pages")inkSidePages(bd); else if(ink.sideTab==="outline")inkSideOutline(bd); else inkSideSearch(bd);
}
// ----- หน้าย่อ -----
function inkSidePages(bd){
 bd.innerHTML=ink.pages.map((p,i)=>`<div class="ink-th2${i===ink.cur?" on":""}" data-sgo="${i}"><canvas width="168" height="${Math.round(168*INK_H/INK_W)}" data-thc="${i}"></canvas><div class="m"><b>หน้า ${i+1}${(ink.bm||[]).some(b=>b.pid===p.id)?" 🔖":""}</b>${p.strokes.length} ชิ้น
<div class="a"><button type="button" data-sp="up" data-i="${i}" ${i===0?"disabled":""} title="เลื่อนขึ้น">↑</button><button type="button" data-sp="dn" data-i="${i}" ${i===ink.pages.length-1?"disabled":""} title="เลื่อนลง">↓</button><button type="button" data-sp="dup" data-i="${i}" title="ทำสำเนาหน้า">⎘ สำเนา</button><button type="button" data-sp="del" data-i="${i}" ${ink.pages.length<2?"disabled":""} title="ลบหน้า">🗑</button></div></div></div>`).join("")+`<button type="button" class="ink-opt" data-sp="add" style="width:100%;justify-content:center;margin-top:6px">＋ เพิ่มหน้าใหม่ต่อจากหน้านี้</button>`;
 const cs=[...bd.querySelectorAll("canvas[data-thc]")]; let n=0;
 const next=()=>{ const c=cs[n++]; if(!c||!ink.note||inkSideEl().hidden)return; const pg=ink.pages[+c.dataset.thc]; if(pg){ try{ const t=inkPageCanvas(pg,168); c.getContext("2d").drawImage(t,0,0,c.width,c.height); }catch(e){} } setTimeout(next,0); };
 setTimeout(next,0);
}
async function inkSidePageOp(op,i){
 const pgs=ink.pages;
 if(op==="add"){ inkAddPage(); inkSideRender(); return; }
 if(op==="up"||op==="dn"){ const j=op==="up"?i-1:i+1; if(j<0||j>=pgs.length)return; const cur=ink.pages[ink.cur]; [pgs[i],pgs[j]]=[pgs[j],pgs[i]]; ink.cur=pgs.indexOf(cur); }
 else if(op==="dup"){ const src=pgs[i], np={id:inkUid(),strokes:JSON.parse(JSON.stringify(src.strokes)),dirty:true,tpl:src.tpl||null}; pgs.splice(i+1,0,np); ink.cur=i+1; }
 else if(op==="del"){ if(pgs.length<2)return; if(!await ask("ลบหน้า "+(i+1)+" ใช่ไหมคะ? ลายเส้นในหน้านี้จะหายไป","ลบหน้านี้"))return; const p=pgs.splice(i,1)[0]; ink.cur=Math.min(Math.max(0,ink.cur>i?ink.cur-1:ink.cur),pgs.length-1); ink.bm=(ink.bm||[]).filter(b=>b.pid!==p.id); try{ await SB.from("rows").delete().eq("uid",uid).eq("id","ink-"+p.id); }catch(e){} }
 ink.undo=[]; ink.redo=[]; ink.sel=null; ink.metaDirty=true; inkRedraw(); inkOverClear(); inkToolbar(); inkDirty(); inkSideRender();
}
// ----- สารบัญ / บุ๊กมาร์ก -----
function inkBmGo(b){
 if(b.pid){ const i=ink.pages.findIndex(p=>p.id===b.pid); if(i>=0)inkGo(i); }
 else{ ink.z=b.z||1; ink.vx=b.vx; ink.vy=b.vy; ink.sel=null; inkOverClear(); inkApply(); }
 if(innerWidth<760)inkSideClose(); else inkSideRender();
}
function inkBmAdd(label){
 const id="b"+Date.now().toString(36)+Math.random().toString(36).slice(2,4); const n=(ink.bm||[]).length+1;
 const b=ink.board?{id,l:label||("จุดที่ "+n),vx:+ink.vx.toFixed(1),vy:+ink.vy.toFixed(1),z:+ink.z.toFixed(3)}:{id,l:label||("หน้า "+(ink.cur+1)),pid:inkPage().id};
 (ink.bm=ink.bm||[]).push(b); ink.metaDirty=true; inkDirty(); inkSideRender();
}
function inkHeadings(){ const out=[]; ink.pages.forEach((pg,i)=>pg.strokes.forEach((s,si)=>{ if(s.t==="x"&&!s.bg&&(s.fs||0)>=40&&String(s.tx||"").trim())out.push({i,si,t:String(s.tx).split("\n")[0].trim()}); })); return out; }
function inkSideOutline(bd){
 const bm=ink.bm||[], H=inkHeadings();
 bd.innerHTML=`<div class="ink-ph">บุ๊กมาร์ก</div><div style="display:flex;gap:6px;margin-bottom:8px"><input id="ink-bmn" class="ink-sinp" style="margin:0;flex:1" placeholder="ชื่อบุ๊กมาร์ก (ไม่ใส่ก็ได้)"><button type="button" class="ink-opt" data-bm="add">＋ ปักตรงนี้</button></div>
${bm.length?bm.map(b=>`<div class="ink-sr" data-bmgo="${b.id}">🔖 ${esc(b.l)}<small>${b.pid?"หน้า "+(ink.pages.findIndex(p=>p.id===b.pid)+1):"ตำแหน่งบนกระดาน"}</small><span style="float:right;margin-top:-30px"><button type="button" class="ink-opt" data-bm="ren" data-id="${b.id}" style="padding:4px 8px">✎</button> <button type="button" class="ink-opt" data-bm="del" data-id="${b.id}" style="padding:4px 8px">✕</button></span></div>`).join(""):`<div class="hint" style="margin:0 0 8px">ยังไม่มีบุ๊กมาร์ก — กด “ปักตรงนี้” ที่${ink.board?"ตำแหน่งที่ดูอยู่":"หน้านี้"}</div>`}
<div class="ink-ph" style="margin-top:12px">หัวข้อในสมุด (ข้อความตัวใหญ่ ≥ 40)</div>
${H.length?H.map(h=>`<div class="ink-sr" data-hgo="${h.i}:${h.si}">${esc(h.t.slice(0,60))}<small>${ink.board?"บนกระดาน":"หน้า "+(h.i+1)}</small></div>`).join(""):`<div class="hint" style="margin:0">พิมพ์ข้อความด้วยเครื่องมือ “ข้อความ” ขนาด 40 ขึ้นไป จะขึ้นเป็นหัวข้อให้อัตโนมัติ</div>`}`;
}
// ----- ค้นหา -----
function inkSideSearch(bd){
 bd.innerHTML=`<input id="ink-sq" class="ink-sinp" placeholder="ค้นหาข้อความในสมุด…" value="${esc(ink.sq||"")}" autocomplete="off"><div id="ink-sres"></div><div class="hint" style="margin:8px 0 0;font-size:12px">ค้นได้เฉพาะข้อความที่พิมพ์ (กล่องข้อความ · โน้ตแปะ · พิมพ์ตามเสียง) · ลายมือยังค้นหาไม่ได้</div>`;
 inkSearchRun(); const q=el("ink-sq"); setTimeout(()=>{ try{ q.focus(); }catch(e){} },30);
}
function inkSearchRun(){
 const q=(el("ink-sq")?el("ink-sq").value:"").trim(), box=el("ink-sres"); if(!box)return; ink.sq=q; if(!q){ box.innerHTML=""; return; }
 const ql=q.toLowerCase(), R=[];
 ink.pages.forEach((pg,i)=>pg.strokes.forEach((s,si)=>{ if(s.t==="x"){ const t=String(s.tx||""), j=t.toLowerCase().indexOf(ql); if(j>=0)R.push({i,si,t,j}); } }));
 (ink.bm||[]).forEach(b=>{ if(String(b.l).toLowerCase().includes(ql))R.push({bm:b,t:b.l,j:String(b.l).toLowerCase().indexOf(ql)}); });
 const hl=(t,j)=>{ const a=Math.max(0,j-18), seg=t.slice(a,j+q.length+40).replace(/\n/g," "); const k=j-a; return (a?"…":"")+esc(seg.slice(0,k))+"<mark>"+esc(seg.slice(k,k+q.length))+"</mark>"+esc(seg.slice(k+q.length)); };
 box.innerHTML=R.length?R.slice(0,60).map(r=>r.bm?`<div class="ink-sr" data-bmgo="${r.bm.id}">🔖 ${hl(r.t,r.j)}<small>บุ๊กมาร์ก</small></div>`:`<div class="ink-sr" data-hgo="${r.i}:${r.si}">${hl(r.t,r.j)}<small>${ink.board?"บนกระดาน":"หน้า "+(r.i+1)}</small></div>`).join(""):`<div class="hint" style="margin:0">ไม่พบ “${esc(q)}”</div>`;
}
function inkJumpTo(i,si){
 if(!ink.board&&i!==ink.cur)inkGo(i); const pg=inkPage(), s=pg.strokes[si]; if(!s)return;
 const bb=inkBB(s); if(ink.board){ const st=el("ink-stage"); ink.vx=(bb[0]+bb[2])/2-st.clientWidth/ink.z/2; ink.vy=(bb[1]+bb[3])/2-st.clientHeight/ink.z/2; inkApply(); }
 ink.tool="lasso"; const idx=new Set(); inkExpandSel(idx,pg.strokes,si); ink.sel={idx,box:inkBBox(pg.strokes,idx)}; inkRedraw(); inkOverClear(); inkDrawSel(); inkToolbar();
 if(innerWidth<760)inkSideClose();
}
// ----- นำเสนอ -----
function inkPresBar(){
 const b=el("ink-presbar"); if(!b)return; if(!ink.pres){ b.hidden=true; return; }
 b.hidden=false; b.innerHTML=`<button type="button" data-pres="exit" aria-label="ออกจากโหมดนำเสนอ">✕ ออก</button>`+(ink.board?"":`<button type="button" data-pres="prev" ${ink.cur===0?"disabled":""} aria-label="หน้าก่อนหน้า">◀</button><span style="font-size:13px;white-space:nowrap">${ink.cur+1} / ${ink.pages.length}</span><button type="button" data-pres="next" ${ink.cur===ink.pages.length-1?"disabled":""} aria-label="หน้าถัดไป">▶</button>`)
 +INK_LASER.map(c=>`<button type="button" class="ink-c${ink.color.laser===c?" on":""}" data-plc="${c}" style="background:${c}" aria-label="สีเลเซอร์ ${c}"></button>`).join("")+`<button type="button" data-pres="tool" class="${ink.tool==="hand"?"on":""}" title="สลับ เลเซอร์ ⇄ เลื่อนหน้า/แตะลิงก์">${ink.tool==="hand"?"✋":"🔴"}</button>`;
}
function inkPresEnter(){
 if(ink.pres||!ink.note)return; inkClosePop(); inkSideClose(); ink.pres=true; ink.preTool=ink.tool; ink.tool="laser"; ink.sel=null; inkOverClear(); inkTextClose&&inkTextClose(true);
 el("inkdlg").classList.add("pres"); try{ const d=el("inkdlg"); if(d.requestFullscreen&&!document.fullscreenElement)d.requestFullscreen().catch(()=>{}); }catch(e){}
 if(!ink.board){ ink.z=1; ink.tx=0; ink.ty=0; } setTimeout(()=>{ inkApply(); inkResize(); },60); inkPresBar(); inkToolbar();
}
function inkPresExit(){
 if(!ink.pres)return; ink.pres=false; ink.tool=ink.preTool||"pen"; inkLaserClear(); el("inkdlg").classList.remove("pres"); inkPresBar();
 try{ if(document.fullscreenElement)document.exitFullscreen().catch(()=>{}); }catch(e){} setTimeout(()=>{ inkApply(); inkResize(); },60); inkToolbar();
}
document.addEventListener("fullscreenchange",()=>{ if(!document.fullscreenElement&&ink.pres)inkPresExit(); });

(function inkSideWire(){
 const dlg=el("inkdlg"); if(!dlg)return;
 el("ink-sidebtn").onclick=e=>{ e.stopPropagation(); inkSideToggle(); };
 el("ink-presbtn").onclick=e=>{ e.stopPropagation(); inkPresEnter(); };
 dlg.addEventListener("click",async e=>{
  const b=e.target.closest("button,.ink-sr,.ink-th2"); if(!b)return;
  if(b.dataset.stab){ if(b.dataset.stab==="x")inkSideClose(); else{ ink.sideTab=b.dataset.stab; inkSideRender(); } return; }
  if(b.dataset.sp){ e.stopPropagation(); await inkSidePageOp(b.dataset.sp,+b.dataset.i); return; }
  if(b.dataset.bm){ e.stopPropagation(); const k=b.dataset.bm;
   if(k==="add"){ inkBmAdd((el("ink-bmn").value||"").trim()); }
   else if(k==="del"){ ink.bm=ink.bm.filter(x=>x.id!==b.dataset.id); ink.metaDirty=true; inkDirty(); inkSideRender(); }
   else if(k==="ren"){ const x=ink.bm.find(v=>v.id===b.dataset.id); const v=x&&window.prompt("ชื่อบุ๊กมาร์ก",x.l); if(v&&v.trim()){ x.l=v.trim(); ink.metaDirty=true; inkDirty(); inkSideRender(); } } return; }
  if(b.dataset.bmgo){ const x=(ink.bm||[]).find(v=>v.id===b.dataset.bmgo); if(x)inkBmGo(x); return; }
  if(b.dataset.hgo){ const [i,si]=b.dataset.hgo.split(":").map(Number); inkJumpTo(i,si); return; }
  if(b.dataset.sgo!=null&&b.classList.contains("ink-th2")){ inkGo(+b.dataset.sgo); if(innerWidth<760)inkSideClose(); else inkSideRender(); return; }
  if(b.dataset.pres){ const k=b.dataset.pres; if(k==="exit")inkPresExit(); else if(k==="prev"){ inkGo(ink.cur-1); inkPresBar(); } else if(k==="next"){ inkGo(ink.cur+1); inkPresBar(); } else if(k==="tool"){ ink.tool=ink.tool==="hand"?"laser":"hand"; inkLaserClear(); inkPresBar(); } return; }
  if(b.dataset.plc){ ink.color.laser=b.dataset.plc; inkSetSave(); inkPresBar(); return; }
 });
 dlg.addEventListener("input",e=>{ if(e.target.id==="ink-sq")inkSearchRun(); });
 dlg.addEventListener("change",async e=>{ const t=e.target; if(t.dataset&&t.dataset.ipaperc){ const d={paper:t.value}; Object.assign(ink.note,d); try{ await DB.collection("note").doc(ink.note._id).set(d,{merge:true}); }catch(er){} inkRedraw(); } });
 document.addEventListener("keydown",e=>{ if(!ink.note||!el("inkdlg").open||!ink.pres)return; const k=e.key;
  if(k==="ArrowRight"||k==="PageDown"||k===" "||k==="ArrowDown"){ e.preventDefault(); if(!ink.board){ inkGo(ink.cur+1); inkPresBar(); } }
  else if(k==="ArrowLeft"||k==="PageUp"||k==="ArrowUp"){ e.preventDefault(); if(!ink.board){ inkGo(ink.cur-1); inkPresBar(); } } });
})();
// ===== พิมพ์ตามเสียงพูด (Web Speech API) — ใช้ได้ทั้งในสมุดเขียนมือ/กระดาน และตัวแก้ไข “เขียนบันทึก” =====
// รองรับ: Chrome / Edge / Safari (iPad ใน Safari ปกติ) · แอปที่เพิ่มลงหน้าจอโฮมของ iOS บางรุ่นยังไม่รองรับ → แนะนำใช้ปุ่มไมค์บนคีย์บอร์ดแทน
const VOICE={rec:null,on:false,lang:"th-TH",target:null,chip:null,interim:"",err:0};
try{ const l=localStorage.getItem("sw-voice-lang"); if(l==="en-US"||l==="th-TH")VOICE.lang=l; }catch(e){}
const voiceSupported=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
function voiceChip(host){
 let c=VOICE.chip; if(c&&c.parentNode!==host){ c.remove(); c=null; }
 if(!c){ c=document.createElement("div"); c.className="ink-voice"; c.setAttribute("role","status");
  c.innerHTML=`<i></i><span class="vtx">กำลังฟัง… พูดได้เลย</span><button type="button" data-vl>${VOICE.lang==="th-TH"?"ไทย":"EN"}</button><button type="button" data-vs>หยุด</button>`;
  c.addEventListener("mousedown",e=>e.preventDefault()); c.addEventListener("pointerdown",e=>e.stopPropagation());
  c.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; e.stopPropagation(); if(b.hasAttribute("data-vs"))voiceStop(); else if(b.hasAttribute("data-vl")){ VOICE.lang=VOICE.lang==="th-TH"?"en-US":"th-TH"; try{ localStorage.setItem("sw-voice-lang",VOICE.lang); }catch(er){} b.textContent=VOICE.lang==="th-TH"?"ไทย":"EN"; const t=VOICE.target; if(VOICE.on){ voiceStop(true); setTimeout(()=>voiceStart(t),250); } } });
  host.appendChild(c); VOICE.chip=c; }
 return c;
}
function voiceSay(t){ if(VOICE.chip){ const v=VOICE.chip.querySelector(".vtx"); if(v)v.textContent=t; } }
// เบราว์เซอร์บางตัว (เช่น Safari บน iPad) ไม่ส่งผล “สุดท้าย” จนกว่าจะหยุดพูดนาน/กดหยุด → ข้อความค้างแค่บนแถบเสียง
// จึงเก็บข้อความชั่วคราวไว้ แล้วใส่ลงงานเมื่อเงียบ ~1.4 วินาที / กดหยุด / เปลี่ยนภาษา
function voiceFlush(){ clearTimeout(VOICE.ft); const t=(VOICE.pending||"").trim(); VOICE.pending=""; const T=VOICE.target; if(t&&T){ try{ T.onText(t); }catch(er){} voiceSay("กำลังฟัง… พูดได้เลย"); return true; } return false; }
function voiceStop(keepChip){
 voiceFlush(); VOICE.on=false; const r=VOICE.rec; VOICE.rec=null; if(r){ try{ r.onend=null; r.onresult=null; r.onerror=null; r.abort(); }catch(e){} }
 if(!keepChip&&VOICE.chip){ VOICE.chip.remove(); VOICE.chip=null; } const t=VOICE.target; if(!keepChip)VOICE.target=null; if(t&&t.onStop&&!keepChip)t.onStop();
}
// target = {host:อีลิเมนต์ dialog ที่จะแสดงแถบ, onText(text), onStop?()}
function voiceStart(target){
 if(!voiceSupported()){ return false; }
 voiceStop(true); const SR=window.SpeechRecognition||window.webkitSpeechRecognition; let rec;
 try{ rec=new SR(); }catch(e){ return false; }
 VOICE.target=target; VOICE.on=true; VOICE.rec=rec; VOICE.err=0; rec.lang=VOICE.lang; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1;
 voiceChip(target.host); voiceSay("กำลังฟัง… พูดได้เลย");
 rec.onresult=ev=>{ let interim="", fin=""; for(let i=ev.resultIndex;i<ev.results.length;i++){ const r=ev.results[i], t=r[0].transcript; if(r.isFinal)fin+=t; else interim+=t; }
  if(fin.trim()){ clearTimeout(VOICE.ft); VOICE.pending=""; try{ target.onText(fin.trim()); }catch(er){} }
  VOICE.pending=interim; voiceSay(interim?("… "+interim):"กำลังฟัง… พูดได้เลย"); clearTimeout(VOICE.ft);
  if(interim.trim())VOICE.ft=setTimeout(()=>{ if(VOICE.rec===rec&&voiceFlush()){ try{ rec.abort(); }catch(e){} } },1400); };   // ใส่ข้อความที่ค้าง แล้วเริ่มฟังรอบใหม่ (กันซ้ำ)
 rec.onerror=ev=>{ const er=ev.error;
  if(er==="not-allowed"||er==="service-not-allowed"){ voiceStop(); tell("<b>ยังไม่ได้อนุญาตให้ใช้ไมโครโฟน</b><div class=\"hint\" style=\"margin:8px 0 0\">เปิดสิทธิ์ไมค์ให้เว็บนี้ในการตั้งค่าเบราว์เซอร์ แล้วลองใหม่ค่ะ · หรือใช้ปุ่มไมค์บนคีย์บอร์ดของเครื่องแทนได้</div>"); }
  else if(er==="network"){ voiceStop(); tell("<b>พิมพ์ตามเสียงต้องใช้อินเทอร์เน็ต</b><div class=\"hint\" style=\"margin:8px 0 0\">เบราว์เซอร์ส่งเสียงไปแปลงเป็นข้อความที่เซิร์ฟเวอร์ — ตรวจสัญญาณแล้วลองใหม่ค่ะ</div>"); }
  else if(er==="language-not-supported"){ voiceStop(); tell("<b>เครื่องนี้ไม่รองรับภาษานี้</b>"); }
  else VOICE.err++; };
 rec.onend=()=>{ if(!VOICE.on||VOICE.rec!==rec)return; voiceFlush(); if(VOICE.err>6){ voiceStop(); return; } setTimeout(()=>{ if(VOICE.on&&VOICE.rec===rec){ try{ rec.start(); }catch(e){} } },200); };   // หยุดเองเมื่อเงียบนาน → เริ่มฟังต่อ
 try{ rec.start(); }catch(e){ voiceStop(); return false; }
 return true;
}
function voiceNoSupport(){ tell("<b>เบราว์เซอร์นี้ยังพิมพ์ตามเสียงในแอปไม่ได้</b><div style=\"font-size:13.5px;margin-top:8px;line-height:1.8\">ใช้ <b>ปุ่มไมค์บนคีย์บอร์ด</b> ของ iPad/มือถือ (กดช่องข้อความ แล้วแตะรูปไมค์ 🎤 มุมล่างคีย์บอร์ด) พูดได้ทันที — หรือเปิด Sky Work ใน Safari / Chrome ปกติ (ไม่ใช่ไอคอนหน้าจอโฮม) จะใช้ปุ่มไมค์ในแอปได้</div>"); }

// ---------- สมุดเขียนมือ / กระดาน: เติมเป็นกล่องข้อความ ----------
function inkVoiceToggle(){
 if(VOICE.on){ voiceStop(); ink.voiceOn=false; inkToolbar(); return; }
 if(!voiceSupported()){ voiceNoSupport(); const c=ink.lastPt||[80,160]; setTimeout(()=>{ ink.tool="text"; inkToolbar(); inkTextEdit(-1,c[0],c[1]); },50); return; }
 ink.voiceObj=null; const S=ink.sel&&ink.sel.idx.size===1?inkPage().strokes[[...ink.sel.idx][0]]:null; if(S&&S.t==="x")ink.voiceObj=S;
 const ok=voiceStart({host:el("inkdlg"),onText:inkVoiceText,onStop:()=>{ ink.voiceOn=false; ink.voiceObj=null; inkToolbar(); }});
 if(!ok){ voiceNoSupport(); return; } ink.voiceOn=true; inkToolbar();
}
function inkVoiceText(txt){
 if(!ink.note)return; const pg=inkPage(), S=pg.strokes; let at=ink.voiceObj?S.indexOf(ink.voiceObj):-1;
 if(at>=0){ const old=S[at], o=inkMkText(old.p[0],old.p[1],(old.tx?old.tx+"\n":"")+txt,old.fs,old.c,old.g,old.bg); ink.voiceObj=o; if(old.id)o.id=old.id; const next=S.map((s,i)=>i===at?o:s);
  if(ink.sel&&ink.sel.idx.has(at))ink.sel={idx:ink.sel.idx,box:inkBBox(next,ink.sel.idx)}; inkCommit(next,!!ink.sel); return; }
 const st=el("ink-stage"), r=st.getBoundingClientRect(); let x,y;
 const lp=ink.lastPt, v0=inkToPage({clientX:r.left+40,clientY:r.top+70}), v1=inkToPage({clientX:r.right-60,clientY:r.bottom-60});
 if(lp&&lp[0]>=v0[0]&&lp[0]<=v1[0]&&lp[1]>=v0[1]&&lp[1]<=v1[1]){ x=lp[0]; y=lp[1]; } else{ x=v0[0]; y=v0[1]; }
 const fs=ink.size.text; for(let n=0;n<40;n++){ const hit=S.some(q=>{ const b=inkBB(q); return !(b[2]<x||b[0]>x+fs*8||b[3]<y||b[1]>y+fs*1.5); }); if(!hit)break; y+=fs*1.6; }   // ไม่ซ้อนทับของเดิม
 const o=inkMkText(x,y,txt,fs,ink.color.pen); ink.voiceObj=o; inkCommit([...S,o]); { const idx=new Set([S.length]); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar(); } inkStatus("เติมข้อความจากเสียงแล้ว","ok");
}
// ---------- ตัวแก้ไข “เขียนบันทึก” ----------
function neVoiceBtns(on){ document.querySelectorAll('#ntool [data-ne="mic"],#ne-micbtn').forEach(b=>b.classList.toggle("on",!!on)); const m=el("ne-micbtn"); if(m)m.textContent=on?"⏹ หยุดฟัง":"🎤 พูดให้พิมพ์"; }
function neVoiceToggle(){
 if(VOICE.on){ voiceStop(); return; }
 if(!voiceSupported()){ voiceNoSupport(); setTimeout(()=>{ try{ NE().focus(); }catch(e){} },300); return; }
 neSave(); const host=el("ndlg");
 const ok=voiceStart({host,onText:txt=>{ neRestore(); document.execCommand("insertText",false,txt+" "); neSave(); },onStop:()=>neVoiceBtns(false)});
 if(!ok){ voiceNoSupport(); return; } neVoiceBtns(true);
}
(function(){ const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="mic"]'); if(b){ e.stopImmediatePropagation(); neVoiceToggle(); } },true); const m=el("ne-micbtn"); if(m){ m.addEventListener("mousedown",e=>e.preventDefault()); m.addEventListener("click",()=>{ neSave(); neVoiceToggle(); }); } })();
// ปิดไมค์เมื่อปิดสมุด/หน้าต่างบันทึก
["inkdlg","ndlg"].forEach(id=>{ const d=el(id); if(d)d.addEventListener("close",()=>{ if(VOICE.on)voiceStop(); }); });
// ===== สติกเกอร์สถานะงานแบบขยับได้ (ด่วน · HOT · เสร็จแล้ว ฯลฯ) =====
// ใช้ 3 ที่: ① ติดที่รายการงาน (items.stk = ["hot","done:e"…]) ② แทรกในตัวแก้ไข “เขียนบันทึก” (span[data-stk]) ③ วางบนสมุด/กระดาน (ลายเส้นชนิด "k")
// รหัส "hot" = ป้ายพร้อมข้อความ · "hot:e" = อีโมจิเดี่ยว ๆ ไม่มีป้าย — ภาพขยับด้วย CSS (ปิดอัตโนมัติถ้าเครื่องตั้งค่าลดการเคลื่อนไหว) ส่วนในไฟล์ PDF/รูปส่งออกจะเป็นภาพนิ่ง
const STK=[
{k:"urgent",e:"🚨",l:"ด่วน",c:"#dc2626",f:"#fff",a:"pulse"},
{k:"hot",e:"🔥",l:"HOT",c:"#ea580c",f:"#fff",a:"flame"},
{k:"asap",e:"⚡",l:"ด่วนมาก",c:"#f59e0b",f:"#1d1d1f",a:"zap"},
{k:"due",e:"⏰",l:"ใกล้กำหนด",c:"#be123c",f:"#fff",a:"shake"},
{k:"imp",e:"❗",l:"สำคัญ",c:"#b91c1c",f:"#fff",a:"pulse"},
{k:"doing",e:"🚧",l:"กำลังทำ",c:"#0284c7",f:"#fff",a:"bounce"},
{k:"wait",e:"⏳",l:"รอ",c:"#7c3aed",f:"#fff",a:"flip"},
{k:"reply",e:"💬",l:"รอตอบ",c:"#4f46e5",f:"#fff",a:"bounce"},
{k:"review",e:"👀",l:"รอตรวจ",c:"#0d9488",f:"#fff",a:"look"},
{k:"done",e:"✅",l:"เสร็จแล้ว",c:"#16a34a",f:"#fff",a:"pop"},
{k:"new",e:"🆕",l:"ใหม่",c:"#2563eb",f:"#fff",a:"wiggle"},
{k:"star",e:"⭐",l:"เด่น",c:"#eab308",f:"#1d1d1f",a:"spin"},
{k:"warn",e:"⚠️",l:"ระวัง",c:"#f59e0b",f:"#1d1d1f",a:"blink"},
{k:"go",e:"🚀",l:"เริ่มแล้ว",c:"#7c3aed",f:"#fff",a:"float"},
{k:"money",e:"💰",l:"งบ",c:"#15803d",f:"#fff",a:"bounce"},
{k:"idea",e:"💡",l:"ไอเดีย",c:"#facc15",f:"#1d1d1f",a:"blink"},
{k:"win",e:"🎉",l:"สำเร็จ!",c:"#db2777",f:"#fff",a:"wiggle"},
{k:"love",e:"❤️",l:"ชอบ",c:"#e11d48",f:"#fff",a:"beat"},
{k:"cancel",e:"❌",l:"ยกเลิก",c:"#6b7280",f:"#fff",a:"none"},
{k:"lock",e:"🔒",l:"ปิดงาน",c:"#374151",f:"#fff",a:"none"},
// ชุดอีโมจิขยับ (ไอคอนเดี่ยว ไม่มีป้าย)
{k:"thumb",e:"👍",l:"ดีมาก",c:"#2563eb",f:"#fff",a:"pop",o:1},{k:"clap",e:"👏",l:"ปรบมือ",c:"#2563eb",f:"#fff",a:"wiggle",o:1},{k:"pray",e:"🙏",l:"ขอบคุณ",c:"#2563eb",f:"#fff",a:"float",o:1},
{k:"smile",e:"😀",l:"ยิ้ม",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"lol",e:"😂",l:"ขำ",c:"#2563eb",f:"#fff",a:"shake",o:1},{k:"cool",e:"😎",l:"เท่",c:"#2563eb",f:"#fff",a:"pop",o:1},
{k:"think",e:"🤔",l:"คิด",c:"#2563eb",f:"#fff",a:"look",o:1},{k:"shock",e:"😱",l:"ตกใจ",c:"#2563eb",f:"#fff",a:"zap",o:1},{k:"eyeh",e:"😍",l:"รัก",c:"#2563eb",f:"#fff",a:"beat",o:1},
{k:"muscle",e:"💪",l:"สู้ๆ",c:"#2563eb",f:"#fff",a:"pop",o:1},{k:"spark",e:"✨",l:"ประกาย",c:"#2563eb",f:"#fff",a:"blink",o:1},{k:"boom",e:"💥",l:"ปัง",c:"#2563eb",f:"#fff",a:"zap",o:1},
{k:"bell",e:"🔔",l:"แจ้งเตือน",c:"#2563eb",f:"#fff",a:"shake",o:1},{k:"pin",e:"📌",l:"ปักหมุด",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"mega",e:"📢",l:"ประกาศ",c:"#2563eb",f:"#fff",a:"wiggle",o:1},
{k:"trophy",e:"🏆",l:"รางวัล",c:"#2563eb",f:"#fff",a:"pop",o:1},{k:"hund",e:"💯",l:"เต็ม 100",c:"#2563eb",f:"#fff",a:"beat",o:1},{k:"coffee",e:"☕",l:"พักก่อน",c:"#2563eb",f:"#fff",a:"float",o:1},
{k:"cake",e:"🎂",l:"วันเกิด",c:"#2563eb",f:"#fff",a:"wiggle",o:1},{k:"luck",e:"🍀",l:"โชคดี",c:"#2563eb",f:"#fff",a:"spin",o:1},{k:"sun",e:"☀️",l:"แจ่มใส",c:"#2563eb",f:"#fff",a:"spin",o:1},
{k:"rain",e:"🌧️",l:"อุปสรรค",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"eyes",e:"👀",l:"จับตา",c:"#2563eb",f:"#fff",a:"look",o:1},{k:"run",e:"🏃",l:"รีบ",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"bomb",e:"💣",l:"เสี่ยง",c:"#2563eb",f:"#fff",a:"shake",o:1}];
const stkDef=key=>{ const [k]=String(key||"").split(":"); return STK.find(x=>x.k===k)||null; };
const stkValid=key=>/^[a-z]{2,8}(:e)?$/.test(String(key||""))&&!!stkDef(key);
const stkIsE=key=>String(key||"").endsWith(":e");
function stkInner(key){ const d=stkDef(key); if(!d)return ""; return stkIsE(key)?`<i>${d.e}</i>`:`<i>${d.e}</i><b>${esc(d.l)}</b>`; }
function stkHtml1(key){ const d=stkDef(key); if(!d)return ""; const e=stkIsE(key); return `<span class="stk stk-${d.a}${e?" stk-e":""}"${e?"":` style="background:${d.c};color:${d.f}"`} title="${esc(d.l)}">${stkInner(key)}</span>`; }
function stkHtml(t){ const a=t&&Array.isArray(t.stk)?t.stk.filter(stkValid):[]; return a.length?`<span class="stks">${a.map(stkHtml1).join("")}</span>`:""; }
function stkPlainLabel(key){ const d=stkDef(key); return d?d.l:""; }
// สร้าง element สำหรับแทรกในบันทึก
function stkNode(key){ const s=document.createElement("span"); s.className="stk stk-"+stkDef(key).a+(stkIsE(key)?" stk-e":""); if(!stkIsE(key)){ const d=stkDef(key); s.style.background=d.c; s.style.color=d.f; } s.setAttribute("data-stk",key); s.setAttribute("contenteditable","false"); s.innerHTML=stkInner(key); return s; }

// ---------- ① ฟอร์มรายการงาน ----------
let formStk=[];
function stkPickerHtml(sel,attr){ const chip=(k,e)=>{ const key=k+(e?":e":""), on=sel.includes(key); return `<button type="button" class="stkc${on?" on":""}" ${attr}="${key}" title="${esc(stkDef(key).l)}">${stkHtml1(key)}</button>`; };
 return `<div class="stkpick">${STK.filter(d=>!d.o).map(d=>chip(d.k,0)).join("")}</div><div class="stkpick" style="margin-top:6px">${STK.map(d=>chip(d.k,1)).join("")}</div>`; }
function stkPickerPaint(){ const b=el("f-stk"); if(b)b.innerHTML=stkPickerHtml(formStk,"data-fstk"); }
(function(){ const b=el("f-stk"); if(!b)return; b.addEventListener("click",e=>{ const x=e.target.closest("[data-fstk]"); if(!x)return; const k=x.dataset.fstk, i=formStk.indexOf(k); if(i>=0)formStk.splice(i,1); else{ if(formStk.length>=4){ setFoot("ติดสติกเกอร์ได้สูงสุด 4 อัน"); return; } formStk.push(k); } stkPickerPaint(); }); })();

// ---------- ② เขียนบันทึก ----------
const neStkHtml=()=>`<div class="nepl">สติกเกอร์สถานะ (แตะเพื่อแทรกตรงเคอร์เซอร์)</div><div class="stkpick" style="max-width:340px">${STK.filter(d=>!d.o).map(d=>`<button type="button" class="stkc" data-stkp="${d.k}">${stkHtml1(d.k)}</button>`).join("")}</div><div class="stkpick" style="max-width:340px;margin-top:6px">${STK.map(d=>`<button type="button" class="stkc" data-stkp="${d.k}:e">${stkHtml1(d.k+":e")}</button>`).join("")}</div>`;
function neStkInsert(key){ if(!stkValid(key))return; neRestore(); neInsertNode(stkNode(key),true); }

// ---------- ③ สมุดเขียนมือ / กระดานกว้าง ----------
// ลายเส้น {t:"k",k:"hot",p:[x1,y1,0,x2,y2,0],r?,lk?} — วาดนิ่งลง canvas (ใช้ตอนส่งออก/รูปย่อ) และบนจอใช้ element ขยับซ้อนทับแทน
function inkStkDraw(ctx,s,k,dx,dy){
 const d=stkDef(s.k); if(!d)return; const p=s.p, x0=Math.min(p[0],p[3]), y0=Math.min(p[1],p[4]), w=Math.abs(p[3]-p[0]), h=Math.abs(p[4]-p[1]); if(w<2||h<2)return; const e=stkIsE(s.k);
 ctx.save(); if(s.r){ const cx=(x0+w/2+dx)*k, cy=(y0+h/2+dy)*k; ctx.translate(cx,cy); ctx.rotate(s.r); ctx.translate(-cx,-cy); }
 const X=(x0+dx)*k, Y=(y0+dy)*k, W=w*k, H=h*k; ctx.textBaseline="middle";
 if(e){ ctx.font=(Math.min(W,H)*.8)+"px \"Apple Color Emoji\",\"Segoe UI Emoji\",\"Noto Color Emoji\",sans-serif"; ctx.textAlign="center"; ctx.fillText(d.e,X+W/2,Y+H/2+H*.04); ctx.restore(); return; }
 ctx.shadowColor="rgba(0,0,0,.25)"; ctx.shadowBlur=H*.1; ctx.shadowOffsetY=H*.04; ctx.fillStyle=d.c; const r=H/2; ctx.beginPath(); ctx.moveTo(X+r,Y); ctx.lineTo(X+W-r,Y); ctx.arc(X+W-r,Y+r,r,-Math.PI/2,Math.PI/2); ctx.lineTo(X+r,Y+H); ctx.arc(X+r,Y+r,r,Math.PI/2,Math.PI*1.5); ctx.closePath(); ctx.fill(); ctx.shadowColor="transparent";
 ctx.font=(H*.5)+"px \"Apple Color Emoji\",\"Segoe UI Emoji\",\"Noto Color Emoji\",sans-serif"; ctx.textAlign="left"; ctx.fillStyle="#fff"; ctx.fillText(d.e,X+H*.22,Y+H/2+H*.03);
 let fs=H*.4; ctx.font="700 "+fs+"px Sarabun,\"Noto Sans Thai\",sans-serif"; const avail=W-H*1.05-H*.22; const tw=ctx.measureText(d.l).width; if(tw>avail&&avail>0){ fs*=avail/tw; ctx.font="700 "+fs+"px Sarabun,\"Noto Sans Thai\",sans-serif"; }
 ctx.fillStyle=d.f; ctx.textAlign="left"; ctx.fillText(d.l,X+H*1.0,Y+H/2+H*.03); ctx.restore();
}
function inkStkSync(){
 const pg=el("ink-pg"); if(!pg)return; let L=el("ink-stkl"); if(!L){ L=document.createElement("div"); L.id="ink-stkl"; L.className="ink-stkl"; pg.appendChild(L); }
 const S=ink.note&&ink.pages[ink.cur]?ink.pages[ink.cur].strokes:[], hide=ink.drag&&ink.drag.hide, base=el("ink-base"); if(!base||!base.width){ L.innerHTML=""; L._h=""; return; }
 const f=base.clientWidth/base.width, [ox,oy]=inkO(), kk=ink.k*f, vw=base.clientWidth/kk, vh=base.clientHeight/kk; let html="";
 S.forEach((s,i)=>{ if(s.t!=="k"||(hide&&hide.has(i)))return; const d=stkDef(s.k); if(!d)return; const p=s.p, x0=Math.min(p[0],p[3])+ox, y0=Math.min(p[1],p[4])+oy, w=Math.abs(p[3]-p[0]), h=Math.abs(p[4]-p[1]), e=stkIsE(s.k);
  if(x0>vw+60||y0>vh+60||x0+w<-60||y0+h<-60)return;
  html+=`<span class="stk stk-${d.a}${e?" stk-e":""}" style="left:${x0.toFixed(1)}px;top:${y0.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;font-size:${(h*(e?.8:.4)).toFixed(1)}px;${e?"":`background:${d.c};color:${d.f};`}${s.r?`transform:rotate(${s.r}rad);`:""}">${stkInner(s.k)}</span>`; });
 L.style.transform="scale("+kk+")"; if(L._h!==html){ L.innerHTML=html; L._h=html; }
}
function inkStkMenu(a){ inkPop(`<div class="ink-ph">สติกเกอร์สถานะ (แตะเพื่อวางกลางหน้าจอ แล้วลากย้าย/ย่อขยายได้)</div><div class="stkpick" style="max-width:330px">${STK.filter(d=>!d.o).map(d=>`<button type="button" class="stkc" data-istk="${d.k}">${stkHtml1(d.k)}</button>`).join("")}</div><div class="stkpick" style="max-width:330px;margin-top:6px">${STK.map(d=>`<button type="button" class="stkc" data-istk="${d.k}:e">${stkHtml1(d.k+":e")}</button>`).join("")}</div>`,a); }
function inkStkAdd(key){
 const d=stkDef(key); if(!d||!ink.note)return; const st=el("ink-stage"), r=st.getBoundingClientRect(), [cx0,cy0]=inkToPage({clientX:r.left+r.width/2,clientY:r.top+r.height/2});
 const pg=inkPage(), n=pg.strokes.filter(s=>s.t==="k").length%6, cx=cx0+n*22, cy=cy0+n*22; const viewH=ink.board?st.clientHeight/ink.z:INK_H, h=Math.max(44,Math.min(120,viewH*.085)), e=stkIsE(key), w=e?h:h*(1.25+.5*Math.min(9,[...d.l].filter(c=>!/[ัิ-ฺ็-๎]/.test(c)).length));
 const o={t:"k",k:key,c:"#000",w:0,p:[+(cx-w/2).toFixed(1),+(cy-h/2).toFixed(1),0,+(cx+w/2).toFixed(1),+(cy+h/2).toFixed(1),0]};
 const next=[...pg.strokes,o], idx=new Set([pg.strokes.length]); ink.tool="lasso"; inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar(); inkClosePop();
}
(function(){ const dlg=el("inkdlg"); if(!dlg)return; dlg.addEventListener("click",e=>{ const b=e.target.closest("[data-istk]"); if(b){ e.stopPropagation(); inkStkAdd(b.dataset.istk); } }); })();
// ===== ลายมือ → ตัวพิมพ์ (ลาสโซ่เลือกลายมือ แล้วให้ AI อ่านเป็นข้อความ) =====
// ใช้ /api/ai (ANTHROPIC_API_KEY เก็บฝั่งเซิร์ฟเวอร์เท่านั้น) · ส่งเฉพาะรูปของลายมือที่เลือก ไม่ส่งทั้งสมุด
const INK_OCR_SYS="คุณคือเครื่องอ่านลายมือ (OCR) สำหรับภาษาไทยและอังกฤษ งานเดียวของคุณคือถอดข้อความจากลายมือในรูปให้ตรงตามที่เขียนที่สุด\n- ตอบเฉพาะข้อความที่ถอดได้ ห้ามมีคำอธิบาย คำนำ หรือเครื่องหมายคำพูดครอบ\n- รักษาการขึ้นบรรทัดตามที่เห็นในรูป (หนึ่งบรรทัดในรูป = หนึ่งบรรทัดในคำตอบ)\n- สัญลักษณ์หัวข้อ เช่น •, -, 1., ☐ ให้คงไว้ตามที่เขียน\n- ถ้าอ่านคำไหนไม่ออกจริงๆ ให้ใส่ [?] แทนคำนั้น อย่าเดาจนเกินจริง\n- ถ้าไม่มีข้อความเลย ให้ตอบว่า (ไม่พบข้อความ)";
function inkOcrCanvas(S,idx){
 const strokes=[...idx].map(i=>S[i]).filter(s=>s&&(s.t==="p"||s.t==="s"||s.t==="x"));
 if(!strokes.length)return null;
 const ids=new Set(strokes.map((_,i)=>i)); const bb=inkBBox(strokes,ids); const pad=28, w=bb[2]-bb[0]+pad*2, h=bb[3]-bb[1]+pad*2;
 let k=Math.min(1800/w,1800/h,2.5); if(h*k<140)k=Math.min(2.5,140/h); k=Math.max(.25,k);
 const c=document.createElement("canvas"); c.width=Math.max(8,Math.ceil(w*k)); c.height=Math.max(8,Math.ceil(h*k));
 const ctx=c.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,c.width,c.height);
 strokes.forEach(s=>{ const q={...s,c:"#000"}; if(q.t==="p")q.w=Math.max(2.4,s.w||2); delete q.r; delete q.lk; inkStroke(ctx,q,k,-bb[0]+pad,-bb[1]+pad); });
 return {canvas:c,bb,n:strokes.length,hasHand:strokes.some(s=>s.t==="p"||s.t==="s")};
}
function inkOcrClose(){ const o=el("ink-ocr"); if(o)o.remove(); }
function inkOcrUi(state,txt,ctxo){
 let o=el("ink-ocr"); if(!o){ o=document.createElement("div"); o.id="ink-ocr"; o.className="ink-ocr"; el("inkdlg").appendChild(o);
  o.addEventListener("pointerdown",e=>e.stopPropagation()); o.addEventListener("click",e=>{ if(e.target===o&&o.dataset.st!=="load")inkOcrClose(); }); }
 o.dataset.st=state;
 if(state==="load"){ o.innerHTML=`<div class="ocr-box"><div class="ocr-spin"></div><b>กำลังอ่านลายมือ…</b><div class="hint" style="margin:6px 0 0">ใช้เวลาราว 3–10 วินาที</div></div>`; return; }
 if(state==="err"){ o.innerHTML=`<div class="ocr-box"><b>อ่านลายมือไม่สำเร็จ</b><div class="hint" style="margin:8px 0 14px;line-height:1.7">${esc(txt)}</div><button type="button" class="btn ghost" data-oc="x" style="width:100%">ปิด</button></div>`; o.querySelector("[data-oc=x]").onclick=inkOcrClose; return; }
 o.innerHTML=`<div class="ocr-box"><b>ข้อความที่อ่านได้</b><div class="hint" style="margin:4px 0 8px">ตรวจ/แก้ไขได้ก่อนวาง · คำที่อ่านไม่ออกจะเป็น [?]</div>
 <img class="ocr-img" alt="" src="${ctxo.thumb}"><textarea id="ink-ocr-ta" rows="6" spellcheck="false">${esc(txt)}</textarea>
 <div class="ocr-btns"><button type="button" class="btn" data-oc="rep">แทนที่ลายมือ</button><button type="button" class="btn ghost" data-oc="bes">วางไว้ใต้ลายมือ</button><button type="button" class="btn ghost" data-oc="cp">คัดลอก</button><button type="button" class="btn ghost" data-oc="x">ยกเลิก</button></div></div>`;
 const ta=el("ink-ocr-ta"); o.querySelector("[data-oc=x]").onclick=inkOcrClose;
 o.querySelector("[data-oc=cp]").onclick=async e=>{ try{ await navigator.clipboard.writeText(ta.value); e.target.textContent="คัดลอกแล้ว ✓"; }catch(er){ ta.select(); try{ document.execCommand("copy"); e.target.textContent="คัดลอกแล้ว ✓"; }catch(e2){} } };
 o.querySelector("[data-oc=rep]").onclick=()=>inkOcrPlace(ta.value,ctxo,true);
 o.querySelector("[data-oc=bes]").onclick=()=>inkOcrPlace(ta.value,ctxo,false);
 setTimeout(()=>{ try{ ta.focus(); }catch(e){} },60);
}
function inkOcrPlace(txt,c,replace){
 txt=String(txt||"").replace(/\r/g,"").trim(); if(!txt){ inkOcrClose(); return; }
 const pg=inkPage(); if(!pg){ inkOcrClose(); return; } const S=pg.strokes;
 // ตำแหน่ง id เดิม (ถ้าหน้าถูกแก้ระหว่างรอ AI ให้จับด้วยอ้างอิงอ็อบเจ็กต์)
 const gone=new Set(); if(replace)c.refs.forEach(r=>{ const i=S.indexOf(r); if(i>=0&&!r.lk)gone.add(i); });
 const L=txt.split("\n").length, hh=c.bb[3]-c.bb[1]; let fs=Math.round(hh/Math.max(1,L)/1.5); fs=Math.max(18,Math.min(64,fs||24));
 const col=(c.refs.find(r=>r.t==="p"&&r.c)||{}).c||ink.color.pen||"#1d1d1f";
 const dark=/^#([0-9a-f]{6})$/i.test(col)&&(parseInt(col.slice(1,3),16)*.3+parseInt(col.slice(3,5),16)*.59+parseInt(col.slice(5,7),16)*.11)<190;
 const x=c.bb[0], y=replace?c.bb[1]:c.bb[3]+fs*.5;
 const o=inkMkText(x,y,txt,fs,dark?col:"#1d1d1f");
 const keep=S.filter((_,i)=>!gone.has(i)); const next=[...keep,o];
 inkCommit(next); const idx=new Set([next.length-1]); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar();
 inkOcrClose(); inkStatus(replace?"แปลงเป็นตัวพิมพ์แล้ว (ยกเลิกได้ด้วย Undo)":"วางข้อความไว้ใต้ลายมือแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2600);
}
async function inkOcrRun(){
 if(!ink.sel||!ink.note){ inkStatus("ลาสโซ่เลือกลายมือก่อน แล้วกดปุ่มนี้","bad"); return; }
 const pg=inkPage(), S=pg.strokes, ids=[...ink.sel.idx]; const r=inkOcrCanvas(S,ink.sel.idx);
 if(!r){ inkStatus("ที่เลือกไม่มีลายมือ — ใช้ลาสโซ่ล้อมลายมือที่ต้องการแปลง","bad"); return; }
 const refs=ids.map(i=>S[i]).filter(Boolean);
 const thumb=(()=>{ const t=document.createElement("canvas"), m=Math.min(1,520/r.canvas.width,160/r.canvas.height); t.width=Math.max(1,Math.round(r.canvas.width*m)); t.height=Math.max(1,Math.round(r.canvas.height*m)); t.getContext("2d").drawImage(r.canvas,0,0,t.width,t.height); return t.toDataURL("image/jpeg",.7); })();
 const c={bb:r.bb,refs,thumb}; inkOcrUi("load");
 try{
  const data=r.canvas.toDataURL("image/jpeg",.88).split(",")[1];
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),60000);
  const resp=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:INK_OCR_SYS,context:"",max_tokens:1500,images:[{media:"image/jpeg",data}],messages:[{role:"user",content:"ถอดข้อความจากลายมือในรูปนี้"}]})});
  clearTimeout(tm); const j=await resp.json().catch(()=>({}));
  if(!resp.ok){ const m=resp.status===503?"ยังไม่ได้ตั้งค่าระบบ AI ที่ Vercel (ต้องมี ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY) — ตั้งเสร็จแล้วใช้ได้เลย":(j.message||("ผิดพลาด "+resp.status)); throw new Error(m); }
  let t=String(j.text||"").trim(); if(!el("ink-ocr"))return;   // ผู้ใช้กดปิดไปแล้ว
  if(!t||/^\(ไม่พบข้อความ\)$/.test(t)){ inkOcrUi("err","ไม่พบข้อความในส่วนที่เลือก — ลองเขียนให้ชัดขึ้น หรือล้อมให้ครบทั้งบรรทัด"); return; }
  if(typeof calcAutoText==="function")t=calcAutoText(t);   // บรรทัดที่ลงท้ายด้วย = คำนวณให้เลย
  inkOcrUi("ok",t,c);
 }catch(e){ inkOcrUi("err",e&&e.name==="AbortError"?"รอนานเกินไป ลองใหม่อีกครั้งค่ะ":(e.message||String(e))); }
}
(function(){ const b=el("ink-seltxt"); if(b)b.onclick=e=>{ e.stopPropagation(); inkOcrRun(); }; const d=el("inkdlg"); if(d)d.addEventListener("close",inkOcrClose); })();
// แสดงปุ่มเมื่อมีสิ่งที่เลือก (ต่อท้าย inkSelBtns เดิม)
(function(){ const f=inkSelBtns; inkSelBtns=function(){ f.apply(this,arguments); const b=el("ink-seltxt"); if(!b)return; const on=!!ink.sel&&ink.note; let has=false; if(on){ const pg=inkPage(), S=pg?pg.strokes:[]; has=[...ink.sel.idx].some(i=>S[i]&&(S[i].t==="p"||S[i].t==="s")); } b.hidden=!has; }; })();
// ===== เครื่องคิดเลข + สูตร (กระดานกว้าง · สมุดเขียนมือ · เขียนบันทึก) =====
// 1) calcEval: ตัวคำนวณนิพจน์ (ไม่ใช้ eval) รองรับ + − × ÷ ^ % ( ) และฟังก์ชัน SUM AVG MIN MAX COUNT PRODUCT ROUND ABS SQRT (+ชื่อไทย รวม เฉลี่ย สูงสุด ต่ำสุด)
// 2) พิมพ์ "1200+350*2=" ได้ผลต่อท้ายทันที  3) เครื่องคิดเลขลอย  4) ลาสโซ่ตัวเลข → ผูกสูตรสด (ink)  5) รวมยอดอัตโนมัติในเทมเพลตค่าใช้จ่าย  6) สูตรในตารางของ “เขียนบันทึก”
const CALC_FN={SUM:a=>a.reduce((x,y)=>x+y,0),AVG:a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,MIN:a=>a.length?Math.min(...a):0,MAX:a=>a.length?Math.max(...a):0,COUNT:a=>a.length,PRODUCT:a=>a.reduce((x,y)=>x*y,1)};
const CALC_ALIAS={AVERAGE:"AVG",MEAN:"AVG","รวม":"SUM","เฉลี่ย":"AVG","สูงสุด":"MAX","ต่ำสุด":"MIN","นับ":"COUNT","คูณ":"PRODUCT"};
const calcDigits=s=>String(s).replace(/[๐-๙]/g,d=>"๐๑๒๓๔๕๖๗๘๙".indexOf(d));
function calcNorm(s){ s=calcDigits(s).replace(/[×✕]/g,"*").replace(/[÷∕]/g,"/").replace(/[−–—]/g,"-").replace(/[（]/g,"(").replace(/[）]/g,")").replace(/，/g,",");
 if(!/[A-Za-z฀-๿]/.test(s)){ let p; do{ p=s; s=s.replace(/(\d),(\d{3})(?!\d)/g,"$1$2"); }while(s!==p); } return s; }
// opts.cell(colIndex1,row1) → number|null (สำหรับอ้างอิงช่อง เช่น B3, A1:A5)
function calcEval(src,opts){
 const s=calcNorm(src); let i=0; const cell=opts&&opts.cell;
 const ws=()=>{ while(i<s.length&&/\s/.test(s[i]))i++; };
 const err=m=>{ throw new Error(m||"สูตรไม่ถูกต้อง"); };
 const colNum=L=>{ let n=0; for(const ch of L.toUpperCase())n=n*26+(ch.charCodeAt(0)-64); return n; };
 function expr(){ let a=term(); for(;;){ ws(); const c=s[i]; if(c==="+"||c==="-"){ i++; const b=term(); const f=b.p?(c==="+"?1+b.v:1-b.v):0; a={v:b.p?a.v*f:(c==="+"?a.v+b.v:a.v-b.v)}; } else break; } return a; }
 function term(){ let a=pow(); for(;;){ ws(); const c=s[i]; if(c==="*"||c==="/"){ i++; const b=pow(); if(c==="/"&&b.v===0)err("หารด้วยศูนย์"); a={v:c==="*"?a.v*b.v:a.v/b.v}; } else break; } return a; }
 function pow(){ const a=un(); ws(); if(s[i]==="^"){ i++; const b=pow(); return {v:Math.pow(a.v,b.v)}; } return a; }
 function un(){ ws(); if(s[i]==="-"){ i++; const a=un(); return {v:-a.v}; } if(s[i]==="+"){ i++; return un(); } return post(); }
 function post(){ let a=prim(); ws(); while(s[i]==="%"){ i++; a={v:a.v/100,p:1}; ws(); } return a; }
 function ref(){ const m=/^([A-Za-z]{1,2})(\d{1,3})/.exec(s.slice(i)); if(!m||!cell)return null; i+=m[0].length; return [colNum(m[1]),+m[2]]; }
 function rangeOrExpr(out){ ws(); const save=i, a=ref(); if(a){ ws(); if(s[i]===":"){ i++; ws(); const b=ref(); if(!b)err(); for(let r=Math.min(a[1],b[1]);r<=Math.max(a[1],b[1]);r++)for(let c=Math.min(a[0],b[0]);c<=Math.max(a[0],b[0]);c++){ const v=cell(c,r); if(v!=null)out.push(v); } return; } } i=save; out.push(expr().v); }
 function prim(){ ws(); const rest=s.slice(i); let m;
  if(s[i]==="("){ i++; const a=expr(); ws(); if(s[i]!==")")err("วงเล็บไม่ครบ"); i++; return {v:a.v}; }
  if((m=/^(\d+(\.\d*)?|\.\d+)/.exec(rest))){ i+=m[0].length; return {v:parseFloat(m[0])}; }
  if((m=/^[A-Za-zก-๏]+(?=\s*\()/.exec(rest))){ i+=m[0].length; ws(); i++; let nm=m[0].toUpperCase(); nm=CALC_ALIAS[nm]||CALC_ALIAS[m[0]]||nm; const args=[];
   ws(); if(s[i]===")"){ i++; } else{ for(;;){ rangeOrExpr(args); ws(); if(s[i]===","||s[i]===";"){ i++; continue; } if(s[i]===")"){ i++; break; } err("วงเล็บไม่ครบ"); } }
   if(CALC_FN[nm])return {v:CALC_FN[nm](args)};
   if(nm==="ROUND")return {v:(()=>{ const k=Math.pow(10,args[1]||0); return Math.round(args[0]*k)/k; })()};
   if(nm==="ABS")return {v:Math.abs(args[0])}; if(nm==="SQRT"){ if(args[0]<0)err("รากของค่าติดลบ"); return {v:Math.sqrt(args[0])}; }
   err("ไม่รู้จักฟังก์ชัน "+m[0]); }
  if(cell&&/^[A-Za-z]{1,2}\d{1,3}/.test(rest)){ const r=ref(); const v=cell(r[0],r[1]); return {v:v==null?0:v}; }
  err(); }
 const r=expr(); ws(); if(i<s.length)err(); if(!isFinite(r.v))err("คำนวณไม่ได้"); return Math.round(r.v*1e9)/1e9;
}
function calcFmt(n){ if(!isFinite(n))return "—"; n=Math.round(n*1e8)/1e8; return n.toLocaleString("en-US",{maximumFractionDigits:4}); }
function calcTry(s){ try{ if(!String(s||"").trim())return null; return calcEval(s); }catch(e){ return null; } }
// หาเลขทั้งหมดในข้อความ (รองรับ 1,200 · -5 · เลขไทย)
function calcNums(tx){ const m=calcDigits(tx||"").match(/-?\d[\d,]*(?:\.\d+)?|-?\.\d+/g)||[]; return m.map(x=>parseFloat(x.replace(/,/g,""))).filter(isFinite); }
const calcSum=a=>a.reduce((x,y)=>x+y,0);

// ---------- พิมพ์ “1200+350*2=” ได้ผลต่อท้าย ----------
const CALC_CH="0-9๐-๙().,%+\\-−*\\/^×÷ ";
function calcAutoLine(line){
 if(!/=\s*$/.test(line))return null; let body=line.replace(/\s*=\s*$/,""); let k=body.length;
 while(k>0&&new RegExp("^["+CALC_CH+"]$").test(body[k-1]))k--;
 let ex=body.slice(k); if(!ex.trim())return null;
 for(let n=0;n<5;n++){ const t=ex.trim().replace(/^[+*\/^×÷.,%\s]+/,""); if(/[+\-−*\/^×÷%]/.test(t.replace(/^[-−]/,""))&&/[0-9๐-๙]/.test(t)){ const v=calcTry(t); if(v!=null)return body.replace(/\s+$/,"")+"="+calcFmt(v); }
  const sp=ex.search(/\s\S/); if(sp<0)break; ex=ex.slice(sp+1); }
 return null;
}
function calcAutoText(tx){ let ch=false; const out=String(tx).split("\n").map(l=>{ const r=calcAutoLine(l); if(r!=null){ ch=true; return r; } return l; }); return ch?out.join("\n"):tx; }

// ---------- เครื่องคิดเลขลอย ----------
const CALC={exp:"",done:false,host:null,ins:null};
function calcPopEl(){ return el("calc-pop"); }
function calcClose(){ const p=calcPopEl(); if(p)p.remove(); CALC.ins=null; }
function calcSync(){ const inp=el("calc-in"); if(!inp)return; if(inp.value!==CALC.exp)inp.value=CALC.exp; const v=calcTry(CALC.exp), r=el("calc-res"); const plain=/^-?[\d.]+$/.test(CALC.exp.trim()); r.textContent=v==null?(CALC.exp.trim()?"…":" "):(plain&&!CALC.done?" ":"= "+calcFmt(v)); }
function calcKey(k){
 if(k==="C"){ CALC.exp=""; CALC.done=false; }
 else if(k==="⌫"){ CALC.exp=CALC.exp.slice(0,-1); CALC.done=false; }
 else if(k==="="){ const v=calcTry(CALC.exp); if(v!=null){ CALC.last={e:CALC.exp,r:v}; CALC.exp=String(v); CALC.done=true; } else{ const r=el("calc-res"); if(r)r.textContent="สูตรไม่ถูกต้อง"; return; } }
 else{ if(CALC.done&&/^[0-9.(]$/.test(k))CALC.exp=""; CALC.done=false; CALC.exp+=k; }
 calcSync();
}
function calcOpen(o){ // o={host, insert(txt), nums?:[number]}
 calcClose(); const p=document.createElement("div"); p.id="calc-pop"; p.className="calc-pop"; CALC.exp=""; CALC.done=false; CALC.last=null; CALC.ins=o.insert;
 const keys=["C","(",")","⌫","7","8","9","÷","4","5","6","×","1","2","3","−","0",".","%","+"];
 const st=o.nums&&o.nums.length?`<div class="calc-st"><span>ที่เลือก ${o.nums.length} ตัว</span><button type="button" data-cs="${calcSum(o.nums)}">รวม ${calcFmt(calcSum(o.nums))}</button><button type="button" data-cs="${calcSum(o.nums)/o.nums.length}">เฉลี่ย ${calcFmt(calcSum(o.nums)/o.nums.length)}</button><button type="button" data-cs="${Math.max(...o.nums)}">สูงสุด ${calcFmt(Math.max(...o.nums))}</button><button type="button" data-cs="${Math.min(...o.nums)}">ต่ำสุด ${calcFmt(Math.min(...o.nums))}</button></div>`:"";
 p.innerHTML=`<div class="calc-h"><b>🧮 เครื่องคิดเลข</b><button type="button" data-cc="x" aria-label="ปิด">✕</button></div>
 <input id="calc-in" inputmode="none" autocomplete="off" spellcheck="false" placeholder="พิมพ์ หรือกดเลข เช่น 1200+350*2" aria-label="นิพจน์">
 <div id="calc-res" class="calc-res"> </div>${st}
 <div class="calc-keys">${keys.map(k=>`<button type="button" data-ck="${k}" class="${/[0-9.]/.test(k)?"n":(k==="C"||k==="⌫"||k==="("||k===")")?"f":"o"}">${k}</button>`).join("")}<button type="button" data-ck="=" class="eq">=</button></div>
 <div class="calc-ins"><button type="button" data-cc="r">ใส่ผลลัพธ์</button><button type="button" data-cc="e">ใส่สูตร+ผล</button><button type="button" data-cc="cp">คัดลอก</button></div>`;
 o.host.appendChild(p); calcSync();
 p.addEventListener("pointerdown",e=>e.stopPropagation()); p.addEventListener("mousedown",e=>{ if(!e.target.closest("input"))e.preventDefault(); });
 const inp=el("calc-in"); inp.addEventListener("input",()=>{ CALC.exp=inp.value; CALC.done=false; calcSync(); }); inp.addEventListener("keydown",e=>{ e.stopPropagation(); if(e.key==="Enter"){ e.preventDefault(); calcKey("="); } else if(e.key==="Escape"){ calcClose(); } });
 p.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; e.stopPropagation();
  if(b.dataset.ck){ calcKey(b.dataset.ck); return; }
  if(b.dataset.cs){ if(CALC.done)CALC.exp=""; CALC.done=false; CALC.exp+=calcFmt(+b.dataset.cs).replace(/,/g,""); calcSync(); return; }
  const c=b.dataset.cc; if(c==="x"){ calcClose(); return; }
  let v=calcTry(CALC.exp); if(v==null){ const r=el("calc-res"); r.textContent="ยังไม่มีผลลัพธ์"; return; }
  const exp=CALC.done&&CALC.last?CALC.last.e:CALC.exp, txt=c==="e"?(exp.trim()+" = "+calcFmt(v)):calcFmt(v);
  if(c==="cp"){ (async()=>{ try{ await navigator.clipboard.writeText(calcFmt(v).replace(/,/g,"")); b.textContent="คัดลอกแล้ว ✓"; }catch(er){ b.textContent="คัดลอกไม่ได้"; } })(); return; }
  if(CALC.ins)CALC.ins(txt); });
 // ลากย้ายได้
 const h=p.querySelector(".calc-h"); h.addEventListener("pointerdown",e=>{ if(e.target.closest("button"))return; const r=p.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; h.setPointerCapture(e.pointerId);
  const mv=ev=>{ p.style.left=Math.max(0,Math.min(innerWidth-60,ev.clientX-dx))+"px"; p.style.top=Math.max(0,Math.min(innerHeight-60,ev.clientY-dy))+"px"; p.style.right="auto"; p.style.bottom="auto"; };
  const up=()=>{ h.removeEventListener("pointermove",mv); h.removeEventListener("pointerup",up); }; h.addEventListener("pointermove",mv); h.addEventListener("pointerup",up); });
 return p;
}
function calcOpenInk(){
 const nums=[]; if(ink.sel&&ink.note){ const S=inkPage().strokes; ink.sel.idx.forEach(i=>{ const s=S[i]; if(s&&s.t==="x")nums.push(...calcNums(s.tx)); }); }
 calcOpen({host:el("inkdlg"),nums,insert:txt=>{ const S=ink.sel&&ink.sel.idx.size===1?inkPage().strokes[[...ink.sel.idx][0]]:null; ink.voiceObj=(S&&S.t==="x"&&!S.fm)?S:null; inkVoiceText(txt); ink.voiceObj=null; }});
}
function calcOpenNote(){
 neSave(); const sel=getSelection(); const nums=(sel&&!sel.isCollapsed&&NE().contains(sel.anchorNode))?calcNums(sel.toString()):[];
 calcOpen({host:el("ndlg"),nums,insert:txt=>{ neRestore(); document.execCommand("insertText",false,txt); neSave(); }});
}
["inkdlg","ndlg"].forEach(id=>{ const d=el(id); if(d)d.addEventListener("close",calcClose); });

// ---------- ink: พิมพ์ในกล่องข้อความแล้วได้ผลทันทีเมื่อกด = ----------
(function(){ const f=inkTextEdit; inkTextEdit=function(){ const r=f.apply(this,arguments); const T=ink.ta; if(T&&T.ta&&!T.ta.__calc){ T.ta.__calc=1; const ta=T.ta;
  ta.addEventListener("input",e=>{ if(ta.selectionStart!==ta.value.length||!/=\s*$/.test(ta.value))return; const lines=ta.value.split("\n"), last=lines[lines.length-1], out=calcAutoLine(last); if(out!=null){ lines[lines.length-1]=out; ta.value=lines.join("\n"); ta.setSelectionRange(ta.value.length,ta.value.length); ta.dispatchEvent(new Event("input")); } }); }
  return r; }; })();

// ---------- ink: ผูกสูตรสด (ลาสโซ่ตัวเลข → รวม/เฉลี่ย/…) ----------
const CALC_OPS={sum:{lb:"รวม",t:"ผลรวม",f:v=>calcSum(v)},avg:{lb:"เฉลี่ย",t:"ค่าเฉลี่ย",f:v=>calcSum(v)/v.length},max:{lb:"สูงสุด",t:"ค่าสูงสุด",f:v=>Math.max(...v)},min:{lb:"ต่ำสุด",t:"ค่าต่ำสุด",f:v=>Math.min(...v)},cnt:{lb:"จำนวน",t:"นับจำนวน",f:v=>v.length},prod:{lb:"คูณ",t:"ผลคูณ",f:v=>v.reduce((a,b)=>a*b,1)},
 diff:{lb:"คงเหลือ",t:"ตัวแรก − ตัวที่เหลือ (เช่น งบ − ใช้ไป)",f:v=>v[0]-calcSum(v.slice(1)),min2:2},div:{lb:"หาร",t:"ตัวแรก ÷ ตัวที่สอง",f:v=>v[1]===0?NaN:v[0]/v[1],min2:2},pct:{lb:"เป็น",t:"% = ตัวแรก ÷ ตัวที่สอง × 100",f:v=>v[1]===0?NaN:v[0]/v[1]*100,min2:2,sfx:"%"}};
function calcFmText(fm,vals){ const op=CALC_OPS[fm.f]; if(!op||!vals.length||(op.min2&&vals.length<2))return (fm.lb||"")+" —"; const r=op.f(vals); return (fm.lb||op.lb)+" "+(isFinite(r)?calcFmt(r)+(op.sfx||""):"—"); }
const calcSrcVal=q=>{ const n=calcNums(q.tx); return n.length?calcSum(n):null; };
function calcOrder(arr){ return arr.slice().sort((a,b)=>{ const fa=Math.max(a.fs||24,12); if(Math.abs(a.p[1]-b.p[1])<fa*.8)return a.p[0]-b.p[0]; return a.p[1]-b.p[1]; }); }
function calcRebuild(s,text,x,y){ const o=inkMkText(x==null?s.p[0]:x,y==null?s.p[1]:y,text,s.fs,s.c,s.g,s.bg); ["fm","id","lk","u"].forEach(k=>{ if(s[k]!=null)o[k]=s[k]; }); return o; }
function calcLinkPass(arr){ let out=arr, ch=false; const byId=new Map(); arr.forEach(s=>{ if(s&&s.id)byId.set(s.id,s); });
 arr.forEach((s,i)=>{ if(!s||s.t!=="x"||!s.fm||!s.fm.ids)return; const srcs=calcOrder(s.fm.ids.map(id=>byId.get(id)).filter(q=>q&&q.t==="x"&&q!==s)); const vals=srcs.map(calcSrcVal).filter(v=>v!=null);
  const tx=calcFmText(s.fm,vals); if(tx!==s.tx){ if(!ch){ out=arr.slice(); ch=true; } const o=calcRebuild(s,tx); out[i]=o; byId.set(o.id,o); } });
 return {out,ch}; }
// เทมเพลตค่าใช้จ่ายรายเดือน: รวมยอดคอลัมน์จำนวนเงิน → ช่อง “ใช้ไปแล้ว” “คงเหลือ” และ “รวมทั้งเดือน”
const CALC_TPL={budget:{box:[50,270,490],bx:[128,204],amt:[700,850],ay:[250,1352],tot:[700,1352,150,44]}};
function calcTplPass(arr,tpl){ const G=CALC_TPL[tpl]; if(!G)return arr;
 const user=arr.filter(s=>s&&s.t==="x"&&!s.fm); const num=s=>{ const n=calcNums(s.tx); return n.length?calcSum(n):null; };
 const inB=s=>s.p[0]>=G.box[0]-2&&s.p[0]<G.box[0]+210&&s.p[1]>=G.bx[0]-6&&s.p[1]<G.bx[1];
 const inA=s=>s.p[0]>=G.amt[0]-2&&s.p[0]<G.amt[1]&&s.p[1]>=G.ay[0]&&s.p[1]<G.ay[1]+6;
 const bs=user.filter(inB).map(num).filter(v=>v!=null), as=user.filter(inA).map(num).filter(v=>v!=null);
 const want=[]; const fs=26;
 if(as.length){ const total=calcSum(as); want.push({tp:"total",v:total,c:"#1f6f80",right:[G.amt[1]-10,G.tot[1]+(G.tot[3]-fs*1.35)/2]}); want.push({tp:"used",v:total,c:"#d9692f",mid:[G.box[1]+105,164]});
  if(bs.length){ const rem=calcSum(bs)-total; want.push({tp:"remain",v:rem,c:rem<0?"#c0392b":"#2e8b57",mid:[G.box[2]+105,164]}); } }
 let out=arr, ch=false; const has=new Map(); arr.forEach((s,i)=>{ if(s&&s.fm&&s.fm.tp)has.set(s.fm.tp,i); });
 const drop=new Set(); has.forEach((i,tp)=>{ if(!want.some(w=>w.tp===tp))drop.add(i); });
 if(drop.size){ out=arr.filter((_,i)=>!drop.has(i)); ch=true; has.clear(); out.forEach((s,i)=>{ if(s&&s.fm&&s.fm.tp)has.set(s.fm.tp,i); }); }
 want.forEach(w=>{ const tx=calcFmt(w.v), proto={t:"x",fs,c:w.c,p:[0,0,0,0,0,0],tx}; const m=inkTextMeasure(proto); const x=w.right?w.right[0]-m[0]:w.mid[0]-m[0]/2, y=w.right?w.right[1]:w.mid[1];
  const i=has.get(w.tp), old=i!=null?out[i]:null;
  if(old&&old.tx===tx&&old.c===w.c&&Math.abs(old.p[0]-x)<1&&Math.abs(old.p[1]-y)<1)return;
  const o=inkMkText(x,y,tx,fs,w.c); o.fm={tp:w.tp}; if(!ch){ out=out.slice(); ch=true; } if(i!=null)out[i]=o; else{ out.push(o); has.set(w.tp,out.length-1); } });
 return out; }
function calcRefresh(next){ if(!Array.isArray(next))return next; let a=next;
 if(a.some(s=>s&&s.fm&&s.fm.ids)){ for(let n=0;n<4;n++){ const r=calcLinkPass(a); a=r.out; if(!r.ch)break; } }
 const pg=inkPage(), tpl=(pg&&pg.tpl)||inkLive().tpl||""; if(CALC_TPL[tpl])a=calcTplPass(a,tpl); return a; }
(function(){ const f=inkCommit; inkCommit=function(next,keepSel){ return f.call(this,calcRefresh(next),keepSel); }; })();

function calcSelSrc(){ if(!ink.sel||!ink.note)return []; const S=inkPage().strokes; return [...ink.sel.idx].filter(i=>S[i]&&S[i].t==="x"&&calcNums(S[i].tx).length); }
function inkCalcMenu(a){
 const S=inkPage().strokes, src=calcSelSrc(); if(!src.length){ inkStatus("ลาสโซ่ล้อมกล่องข้อความที่มีตัวเลขก่อน (ลายมือให้กด Aa ลายมือ→ตัวพิมพ์ ก่อน)","bad"); return; }
 const vals=calcOrder(src.map(i=>S[i])).map(calcSrcVal);
 inkPop(`<div class="ink-ph">ผูกสูตร · ${vals.length} กล่อง · ผลรวมตอนนี้ ${calcFmt(calcSum(vals))}</div><div class="hint" style="margin:0 10px 6px;font-size:12px;max-width:290px">ผลจะอัปเดตเองเมื่อแก้ตัวเลขต้นทาง</div>`+Object.keys(CALC_OPS).map(k=>`<button type="button" class="ink-mi" data-cop="${k}"${CALC_OPS[k].min2&&vals.length<2?" disabled":""}>${CALC_OPS[k].t}</button>`).join(""),a);
}
function inkCalcMake(op){
 const pg=inkPage(), S=pg.strokes, src=calcSelSrc(); if(!src.length)return; const rid=()=>"q"+Math.random().toString(36).slice(2,8);
 const next=S.slice(), ids=[]; const ordered=calcOrder(src.map(i=>S[i]));
 ordered.forEach(q=>{ const i=S.indexOf(q); let o=next[i]; if(!o.id){ o={...o,id:rid()}; next[i]=o; } ids.push(o.id); });
 const bb=inkBBox(S,ink.sel.idx), fs=Math.round(ordered.reduce((a,q)=>a+(q.fs||24),0)/ordered.length);
 const fm={f:op,ids,lb:CALC_OPS[op].lb}; const o=inkMkText(bb[0],bb[3]+14,calcFmText(fm,ordered.map(calcSrcVal).filter(v=>v!=null)),fs,"#0f766e"); o.fm=fm; o.id=rid();
 inkClosePop(); inkCommit([...next,o]); const idx=new Set([inkPage().strokes.length-1]); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar();
 inkStatus("ผูกสูตรแล้ว — แก้ตัวเลขต้นทาง ผลเปลี่ยนเอง","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2600);
}
(function(){ const b=el("ink-selcalc"); if(b)b.onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-cop]")){ inkClosePop(); return; } inkCalcMenu(e.currentTarget); };
 const pop=el("ink-pop"); if(pop)pop.addEventListener("click",e=>{ const b=e.target.closest("[data-cop]"); if(!b||b.disabled)return; e.stopPropagation(); inkCalcMake(b.dataset.cop); });
 const f=inkSelBtns; inkSelBtns=function(){ f.apply(this,arguments); const c=el("ink-selcalc"); if(c)c.hidden=!(ink.sel&&ink.note&&calcSelSrc().length); }; })();

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
// ===== ผู้ช่วย AI ในหน้ากระดานกว้าง / สมุดเขียนมือ / เขียนบันทึก — ถามหาเครื่องมือ ให้สอนใช้ ชี้ปุ่มให้ดู =====
// ใช้ /api/ai เดิม (คีย์อยู่ฝั่งเซิร์ฟเวอร์) · ถ้า AI ใช้ไม่ได้ จะค้นหาจากคู่มือในแอปให้แทน (ไม่ต้องใช้เน็ต)
// รูปแบบ KB: [id, ชื่อ, selector, วิธีใช้, คำค้น]
const HLP_INK=[
 ["pen","ปากกา",'[data-itool="pen"]',"เขียน/วาดอิสระ · เปลี่ยนสีที่แถบสีใต้แถบเครื่องมือ · ปรับความหนาด้วยแถบเลื่อน · เมนู “ปากกา ▾” เลือกชนิดหัว (ปากกาลูกลื่น ดินสอ พู่กัน ฯลฯ) · วาดแล้วหยุดค้างปลายเส้นครู่หนึ่ง = จัดเป็นเส้นตรง/วงกลม/สี่เหลี่ยมเป๊ะให้ · เริ่มเขียนติดเส้นไกด์ = ลากตรงตามเส้น","ปากกา เขียน วาด สี ความหนา ดินสอ พู่กัน เส้นตรง"],
 ["shape","รูปทรง",'[data-itool="shape"]',"ลากสร้างเส้นตรง ลูกศร สี่เหลี่ยม วงกลม สามเหลี่ยม ฯลฯ · เลือกชนิด/เติมสี/เส้นประได้ในแถบที่โผล่ · กด Shift ค้างเพื่อให้เป๊ะ · หมุน/ย่อขยายได้ด้วยจุดจับหลังเลือก","รูปทรง สี่เหลี่ยม วงกลม ลูกศร กรอบ เส้นตรง กล่อง"],
 ["hl","ไฮไลต์",'[data-itool="hl"]',"ปากกาไฮไลต์โปร่งแสง ขีดทับข้อความ/ตัวเลขได้ · เปลี่ยนสีและความหนาได้","ไฮไลต์ ขีดทับ เน้น มาร์คเกอร์"],
 ["eraser","ยางลบ",'[data-itool="eraser"]',"ลบเส้น · เลือกโหมดลบเป็นช่วง หรือลบทั้งเส้นได้ในแถบขนาด · ปรับขนาดยางลบได้ · ย้อนกลับได้ด้วยปุ่ม ↶","ยางลบ ลบ ลบเส้น ลบทิ้ง"],
 ["text","ข้อความ",'[data-itool="text"]',"แตะที่หน้าแล้วพิมพ์ · พิมพ์ 1+1= แล้วได้ผลทันที · ปรับขนาดตัวอักษรที่แถบขนาด · แตะข้อความเดิมเพื่อแก้ · เลือกแล้วกด “🎨 แต่ง” เปลี่ยนสี/ขนาด","ข้อความ พิมพ์ ตัวอักษร ตัวหนังสือ text กล่องข้อความ"],
 ["move","เคลื่อนย้าย (Move)",'[data-itool="move"]',"แบบ Photoshop: แตะ/ลากวัตถุใดก็ได้เพื่อย้ายทันที ไม่ต้องลาสโซ่ · Shift = เลือกเพิ่ม · Alt/Option หรือปุ่ม “ทำสำเนาตอนลาก” = ลากแล้วได้สำเนา · ปุ่มลูกศรบนคีย์บอร์ด = ขยับทีละนิด (Shift = ทีละมาก) · ปุ่ม V = สลับมาเครื่องมือนี้ · ติดเส้นไกด์ได้ · ปิด “เลือกอัตโนมัติ” เพื่อย้ายของที่เลือกอยู่จากตรงไหนก็ได้","เคลื่อนย้าย ย้าย move ขยับ ลาก photoshop ปุ่ม v ลูกศร สำเนา"],
 ["lasso","เลือก/ย้าย (ลาสโซ่)",'[data-itool="lasso"]',"ลากวงรอบสิ่งที่ต้องการเลือก หรือแตะเส้นเดี่ยวๆ · ลากเพื่อย้าย · จุดมุม/ขอบ = ย่อขยาย · จุดวงกลมบนหัว = หมุน · เมื่อเลือกแล้วจะมีปุ่มเพิ่ม: แต่ง คัดลอก ตัด วาง สำเนา ล็อก ลำดับ ลิงก์ จัดแนว ลบ ฯลฯ","เลือก ย้าย ลาสโซ่ ขยับ หมุน ย่อ ขยาย จัดกลุ่ม"],
 ["laser","เลเซอร์พอยน์เตอร์",'[data-itool="laser"]',"ชี้ให้ดูแบบเลเซอร์ที่จางหายเอง ไม่ทิ้งรอยบนงาน · เปลี่ยนสีได้ · ใช้ตอนนำเสนอ/ประชุม","เลเซอร์ ชี้ นำเสนอ ประชุม pointer"],
 ["tape","เทป",'[data-itool="tape"]',"ปิดบังข้อความเหมือนแปะเทป · เลือกสีและโหมด “อิสระ”หรือ“แนวตรง” ที่แถบขนาด · แตะที่เทปอีกครั้งเพื่อเปิด/ปิดทับ (ท่องจำ/ปิดคำตอบ)","เทป ปิดบัง ซ่อน ปิดคำตอบ ปิดทับ"],
 ["sticky","โน้ตแปะ",'[data-itool="sticky"]',"แตะที่หน้าเพื่อสร้างกระดาษโน้ตสี พิมพ์ข้อความได้ · เปลี่ยนสีกระดาษที่แถบสี หรือเลือกแล้ว “🎨 แต่ง”","โน้ตแปะ สติ๊กกี้ โพสต์อิท กระดาษโน้ต sticky"],
 ["hand","เลื่อนหน้า (มือ)",'[data-itool="hand"]',"ใช้นิ้ว/เมาส์ลากเลื่อนหน้า · แตะลิงก์ที่ใส่ไว้เพื่อกระโดดไปหน้า/เว็บ · (สองนิ้ว = ซูม/เลื่อนได้ทุกเครื่องมืออยู่แล้ว)","เลื่อน มือ pan ลาก ซูม"],
 ["img","แทรกรูปภาพ",'[data-iact="img"]',"เลือกรูปจากเครื่อง หรือวาง (Ctrl+V) / ลากไฟล์ใส่หน้า · ย่อขยาย หมุน ล็อก ลำดับหน้า-หลังได้เหมือน Goodnotes","รูป รูปภาพ แทรกรูป ภาพ รูปถ่าย"],
 ["stk","สติกเกอร์สถานะ",'[data-iact="stk"]',"แปะสติกเกอร์ขยับได้ เช่น ด่วน HOT เสร็จแล้ว รอ · แตะเพื่อวางกลางจอ แล้วลากย้าย/ย่อขยายได้","สติกเกอร์ อีโมจิ ด่วน hot เสร็จ สถานะ ขยับ"],
 ["mic","พิมพ์ตามเสียงพูด",'[data-iact="mic"]',"กดแล้วพูด ข้อความจะเติมเป็นกล่องข้อความบนหน้า · สลับไทย/EN ที่แถบเสียง · iPad แบบไอคอนหน้าจอโฮมอาจใช้ไม่ได้ → ใช้ไมค์บนคีย์บอร์ดแทน","ไมค์ เสียง พูด พิมพ์ตามเสียง บันทึกเสียง"],
 ["calc","เครื่องคิดเลข",'[data-iact="calc"]',"เครื่องคิดเลขลอย + − × ÷ % ( ) · ใส่ผลลัพธ์ลงหน้า · ถ้าเลือกกล่องตัวเลขไว้ จะมีปุ่มรวม/เฉลี่ย · พิมพ์ในกล่องข้อความ 1200+350*2= ได้ผลต่อท้ายทันที","เครื่องคิดเลข คำนวณ บวก ลบ คูณ หาร เปอร์เซ็นต์ สูตร"],
 ["ruler","ไม้บรรทัด/เส้นไกด์",'[data-iact="ruler"]',"เมนูไม้บรรทัด: ซ่อน/แสดง ปิดเปิดแม่เหล็ก ลบไกด์ทั้งหมด · ลากจากขอบบน (แนวนอน) หรือขอบซ้าย (แนวตั้ง) เพื่อวางเส้นไกด์ · ลากจุดสามเหลี่ยมกลับไปที่ไม้บรรทัดเพื่อลบ","ไม้บรรทัด ไกด์ เส้นช่วย เส้นทาบ ruler guide ตรง"],
 ["ai","ผู้ช่วย AI",'[data-iact="ai"]',"ปุ่มนี้เอง — ถามหาเครื่องมือหรือให้สอนใช้งานได้","ช่วย ผู้ช่วย ai สอน ถาม"],
 ["undo","ย้อนกลับ",'#ink-undo',"ย้อนการกระทำล่าสุด (Ctrl+Z)","ย้อน undo ยกเลิก"],
 ["redo","ทำซ้ำ",'#ink-redo',"ทำซ้ำสิ่งที่ย้อนไป (Ctrl+Shift+Z)","ทำซ้ำ redo"],
 ["sidebtn","สารบัญ / หน้าย่อ / ค้นหา",'#ink-sidebtn',"เปิดแถบข้างซ้าย: หน้าย่อ (จัดเรียง/ทำสำเนา/ลบหน้า) · หัวข้อ/บุ๊กมาร์ก · ค้นหาข้อความที่พิมพ์ในสมุด","สารบัญ หน้าย่อ ค้นหา บุ๊กมาร์ก หัวข้อ เรียงหน้า"],
 ["presbtn","โหมดนำเสนอ",'#ink-presbtn',"ซ่อนแถบเครื่องมือ ใช้เลเซอร์ชี้ · ลูกศรซ้ายขวาเปลี่ยนหน้า · ออกด้วยปุ่มบนแถบเล็ก/Esc","นำเสนอ present สไลด์ เต็มจอ"],
 ["finger","นิ้ววาด: อัตโนมัติ/ปิด/เปิด",'#ink-finger',"ตั้งว่านิ้วจะเขียนไหม · “อัตโนมัติ” = ถ้าใช้ Apple Pencil นิ้วจะเลื่อนหน้า · เปิด = นิ้วเขียนได้","นิ้ว เขียนด้วยนิ้ว pencil ฝ่ามือ"],
 ["tpl","กระดาษ / เทมเพลต / ปก",'#ink-tpl',"เปลี่ยนลายกระดาษ (เส้นบรรทัด ตาราง จุด) สีกระดาษ ปกสมุด ตั้งค่าเริ่มต้น · เทมเพลตสำเร็จรูป เช่น ค่าใช้จ่ายรายเดือน OKR SWOT Kanban","กระดาษ เทมเพลต template พื้นหลัง ตาราง เส้นบรรทัด ปก สีกระดาษ"],
 ["zfit","พอดีหน้า / ซูม",'#ink-zfit',"− ซูมออก · ⛶ พอดีหน้า · + ซูมเข้า · หรือบีบสองนิ้ว/ Ctrl+ล้อเมาส์","ซูม ขยาย ย่อ พอดี zoom"],
 ["expb","ส่งออก / Drive",'#ink-exp-b',"ส่งออกเป็น PDF หรือ PNG แล้วแชร์/บันทึกลง Google Drive/ดาวน์โหลด (ไม่มีเส้นไกด์ในไฟล์)","ส่งออก export pdf png ดาวน์โหลด drive แชร์ พิมพ์ save บันทึกเป็นไฟล์"],
 ["more","เมนู ⋯ เพิ่มเติม",'#ink-more',"เพิ่มหน้า ล้างหน้า ลบหน้า ปักหมุด ย้ายโฟลเดอร์ ย้ายไปถังขยะ ปรับปลายเส้นล่วงหน้า วัดความลื่น","เพิ่มเติม เพิ่มหน้า ลบหน้า ล้าง ถังขยะ โฟลเดอร์ ปักหมุด ลบสมุด"],
 ["pages","แถบหน้าด้านล่าง",'#ink-pages',"เปลี่ยนหน้า (ตัวเลข) · ＋หน้าใหม่ · ▦ เทมเพลตของหน้านั้น (เฉพาะสมุด)","หน้า เพิ่มหน้า หน้าใหม่ เปลี่ยนหน้า"],
 ["selfmt","🎨 แต่ง (ที่เลือก)",'#ink-selfmt',"โผล่เมื่อเลือกของ: เปลี่ยนสี ความหนา ขนาดตัวอักษร พื้นโน้ตแปะ รูปทรง","แต่ง เปลี่ยนสี สีตัวอักษร ขนาดตัวอักษร"],
 ["selgrp","จัดกลุ่ม",'#ink-selgrp',"โผล่เมื่อเลือกหลายอย่าง: รวมให้เลือก/ย้ายพร้อมกัน","จัดกลุ่ม group รวม"],
 ["selaln","จัดแนว",'#ink-selaln',"โผล่เมื่อเลือกหลายอย่าง: จัดชิดซ้าย/ขวา/กลาง กระจายระยะเท่ากัน","จัดแนว จัดเรียง กระจาย align กึ่งกลาง"],
 ["selcopy","คัดลอก/ตัด/วาง/สำเนา",'#ink-selcopy',"โผล่เมื่อเลือกของ: คัดลอก ตัด วาง (ข้ามหน้าได้) สำเนา (Ctrl+C / X / V)","คัดลอก copy ตัด วาง paste สำเนา ก๊อป"],
 ["sellock","ล็อก",'#ink-sellock',"ล็อกของให้ย้ายหรือลบโดยไม่ตั้งใจไม่ได้ · ใช้ล็อกเทมเพลต/พื้นหลัง","ล็อก lock ปลดล็อก ตรึง"],
 ["selz","ลำดับชั้น",'#ink-selz',"ส่งไปหน้าสุด/หลังสุด/ขึ้น/ลง เมื่อของทับกัน","ลำดับ ชั้น หน้า หลัง ทับ"],
 ["sellink","ลิงก์",'#ink-sellink',"ใส่ลิงก์ที่ของที่เลือก: เว็บ / ไปหน้าอื่น / บุ๊กมาร์ก — แตะด้วยเครื่องมือมือหรือโหมดนำเสนอ","ลิงก์ link url เชื่อม"],
 ["selshape","✨ จัดรูปทรง",'#ink-selshape',"แปลงเส้นที่วาดคร่าวๆ เป็นรูปทรงเป๊ะ (เส้นตรง วงกลม สี่เหลี่ยม สามเหลี่ยม)","จัดรูปทรง เส้นตรง เป๊ะ วงกลม"],
 ["seltxt","Aa ลายมือ→ตัวพิมพ์",'#ink-seltxt',"โผล่เมื่อลาสโซ่ลายมือ: ให้ AI อ่านลายมือไทย/อังกฤษเป็นข้อความพิมพ์ แก้ก่อนวางได้ (แทนที่ หรือวางไว้ใต้ลายมือ)","ลายมือ ตัวพิมพ์ แปลง ocr อ่านลายมือ ถอดข้อความ"],
 ["selcalc","Σ ผูกสูตร",'#ink-selcalc',"โผล่เมื่อเลือกกล่องข้อความที่มีตัวเลข: รวม เฉลี่ย สูงสุด ต่ำสุด ผลต่าง % — ผลอัปเดตเองเมื่อแก้ตัวเลข","ผูกสูตร สูตร รวม เฉลี่ย excel ผลรวม คำนวณอัตโนมัติ"],
 ["seledit","✎ แก้ข้อความ",'#ink-seledit',"โผล่เมื่อเลือกกล่องข้อความ 1 อัน: เปิดแก้ข้อความ (หรือแตะซ้ำที่ข้อความ)","แก้ข้อความ แก้ไข"],
 ["seldel","ลบที่เลือก",'#ink-seldel',"ลบของที่เลือก (หรือกด Delete)","ลบที่เลือก ลบ delete"]
];
const HLP_NOTE=[
 ["ai","ผู้ช่วย AI",'[data-ne="ai"]',"ปุ่มนี้เอง — ถามหาเครื่องมือหรือให้สอนใช้งานได้","ช่วย ผู้ช่วย ai สอน ถาม"],
 ["undo","ย้อนกลับ / ทำซ้ำ",'[data-ne="undo"]',"ย้อน (Ctrl+Z) / ทำซ้ำ (Ctrl+Shift+Z)","ย้อน undo redo ทำซ้ำ"],
 ["h2","หัวข้อใหญ่/ย่อย",'[data-ne="h2"]',"H2 = หัวข้อใหญ่ · H3 = หัวข้อย่อย (เลือกบรรทัดนั้นก่อน)","หัวข้อ heading ใหญ่ ย่อย"],
 ["bold","ตัวหนา เอียง ขีดเส้นใต้ ขีดฆ่า ตัวบาง",'[data-ne="bold"]',"เลือกข้อความแล้วกด B / I / U / S / ตัวบาง (Ctrl+B, I, U)","ตัวหนา bold เอียง italic ขีดเส้นใต้ ขีดฆ่า ตัวบาง"],
 ["ul","บูเลต / เลขข้อ",'[data-ne="ul"]',"รายการหัวข้อย่อยแบบจุด หรือเลขข้อ · Tab/Shift+Tab ย่อหน้า","บูเลต bullet เลขข้อ รายการ ลิสต์ ย่อหน้า"],
 ["ck","รายการช่องติ๊ก (To-do)",'[data-ne="ck"]',"สร้างรายการทำ ติ๊กที่ช่องสี่เหลี่ยมเมื่อเสร็จ","ติ๊ก to-do checklist ทำ เช็คลิสต์ checkbox"],
 ["hr","เส้นคั่น",'[data-ne="hr"]',"แทรกเส้นคั่นแนวนอน","เส้นคั่น แบ่ง"],
 ["indent","ย่อหน้า",'[data-ne="indent"]',"เลื่อนเข้า/ออกทางขวา-ซ้าย (Tab / Shift+Tab)","ย่อหน้า เยื้อง indent tab"],
 ["color","สีตัวอักษร / ไฮไลต์",'[data-ne="color"]',"เลือกข้อความก่อน แล้วเลือกสีตัวอักษรหรือสีไฮไลต์","สี ไฮไลต์ ตัวอักษร เน้น"],
 ["img","แนบรูป",'[data-ne="img"]',"แนบรูปจากเครื่อง (ย่อให้อัตโนมัติ) หรือวางจากคลิปบอร์ด · แตะรูปเพื่อปรับขนาด 33/50/100%","รูป รูปภาพ แนบ ภาพ"],
 ["mic","พิมพ์ตามเสียงพูด",'[data-ne="mic"]',"กดแล้วพูด ข้อความถูกพิมพ์ตรงเคอร์เซอร์ · กดอีกครั้งเพื่อหยุด · มีปุ่ม “🎤 พูดให้พิมพ์” ใกล้ช่องเนื้อหาด้วย","ไมค์ เสียง พูด พิมพ์ตามเสียง"],
 ["calc","เครื่องคิดเลข",'[data-ne="calc"]',"เครื่องคิดเลขลอย · พิมพ์ 1200+350*2= ได้ผลต่อท้าย · เลือกตัวเลขแล้วเปิด จะมีปุ่มรวม/เฉลี่ย","เครื่องคิดเลข คำนวณ บวก ลบ คูณ หาร %"],
 ["stk","สติกเกอร์สถานะ",'[data-ne="stk"]',"แทรกสติกเกอร์ขยับได้ (ด่วน HOT เสร็จแล้ว…) ลงในข้อความ","สติกเกอร์ อีโมจิ ด่วน hot สถานะ"],
 ["table","ตาราง",'[data-ne="table"]',"แทรกตาราง (วางข้อมูลจาก Excel ได้เลย) · แตะในช่องแล้วมีเมนูเพิ่ม/ลบแถว-คอลัมน์ สีช่อง จัดชิด · พิมพ์สูตรในช่อง เช่น =SUM(B2:B5) =B2*C2 · ช่วง A1:A5 · ผลอัปเดตเองเมื่อแก้เลข","ตาราง table excel สูตร sum รวม แถว คอลัมน์ ช่อง"],
 ["link","แนบลิงก์",'[data-ne="link"]',"เลือกข้อความแล้วกดเพื่อใส่ลิงก์ให้ข้อความนั้น","ลิงก์ link url เว็บ"],
 ["clear","ล้างรูปแบบ",'[data-ne="clear"]',"ล้างสี/ตัวหนา/ฯลฯ ของข้อความที่เลือก","ล้างรูปแบบ clear"],
 ["hist","กู้เวอร์ชัน",'[data-ne="hist"]',"เปิดเวอร์ชันที่เคยบันทึกไว้ เพื่อกู้ข้อความกลับ","เวอร์ชัน กู้ ประวัติ history ย้อนหลัง หาย"],
 ["micbtn","🎤 พูดให้พิมพ์",'#ne-micbtn',"ปุ่มใหญ่ใกล้ช่องเนื้อหา ใช้เหมือนปุ่มไมค์ในแถบเครื่องมือ","ไมค์ เสียง พูด"]
];
const HLP={ctx:null,open:false,busy:false,msgs:{ink:[],note:[]},spk:(()=>{ try{ return localStorage.getItem("sw-hlp-spk")!=="0"; }catch(e){ return true; } })(),listening:false,viaVoice:false};
const hlpKB=()=>HLP.ctx==="note"?HLP_NOTE:HLP_INK;
function hlpCtx(){ return el("ndlg")&&el("ndlg").open?"note":"ink"; }
function hlpState(){
 if(HLP.ctx==="note"){ const c=(typeof neCell==="function")?neCell():null; return "หน้าที่เปิด: เขียนบันทึก (ตัวแก้ไขข้อความ) · เคอร์เซอร์"+(c?"อยู่ในช่องตาราง":"อยู่ในเนื้อหาทั่วไป"); }
 const pg=inkPage&&inkPage(); const n=pg?pg.strokes.length:0, sel=ink.sel?ink.sel.idx.size:0, tn={pen:"ปากกา",shape:"รูปทรง",hl:"ไฮไลต์",eraser:"ยางลบ",text:"ข้อความ",lasso:"เลือก/ย้าย",laser:"เลเซอร์",tape:"เทป",sticky:"โน้ตแปะ",hand:"มือ"}[ink.tool]||ink.tool;
 return "หน้าที่เปิด: "+(ink.board?"กระดานกว้าง (ผืนผ้าใบไม่จำกัด)":"สมุดเขียนมือ หน้า "+(ink.cur+1)+"/"+ink.pages.length)+" · เครื่องมือตอนนี้: "+tn+" · ของบนหน้า "+n+" ชิ้น · เลือกอยู่ "+sel+" ชิ้น"+(inkPage()&&inkPage().gd&&inkPage().gd.length?" · มีเส้นไกด์ "+inkPage().gd.length+" เส้น":""); }
function hlpSystem(){
 const kb=hlpKB(), page=HLP.ctx==="note"?"เขียนบันทึก":(ink.board?"กระดานกว้าง":"สมุดเขียนมือ");
 const list=kb.map(k=>`{{${k[0]}}} ${k[1]} — ${k[3]}`).join("\n");
 return `คุณคือ “ผู้ช่วยสอนใช้งาน Sky Work” (แอปจัดการงาน/บันทึกของ HR) ผู้ใช้เปิดหน้า “${page}” อยู่และขอให้ช่วยหาเครื่องมือหรือสอนใช้งาน
กติกา: ตอบเป็นภาษาไทย สั้น กระชับ เป็นขั้นตอนเมื่อสอน (ไม่เกิน ~8 บรรทัด) ใช้ภาษาง่ายๆ ผู้ใช้ไม่ใช่โปรแกรมเมอร์ · ห้ามแต่งฟีเจอร์ที่ไม่มีในรายการ ถ้าไม่มีให้บอกตรงๆ และเสนอทางที่ใกล้เคียงที่สุด
เมื่อพูดถึงเครื่องมือ/ปุ่มที่มีในรายการ ให้ใส่รหัสในวงเล็บปีกกาคู่ เช่น {{pen}} เพื่อให้แอปแสดงปุ่ม “ชี้ให้ดู” (ใช้เฉพาะรหัสที่มีในรายการนี้ ใส่ทุกครั้งที่อ้างถึงปุ่ม)
ปุ่มที่ขึ้นต้น “โผล่เมื่อ…” จะไม่เห็นจนกว่าจะเลือกของตามเงื่อนไข ให้บอกขั้นตอนเลือกก่อน
รายการเครื่องมือในหน้านี้ (รหัส ชื่อ — วิธีใช้):
${list}
ถ้าผู้ใช้ขอให้ “สอนใช้หน้านี้” ให้สรุปภาพรวม 4-6 ข้อที่ใช้บ่อยที่สุด แล้วชวนถามต่อ`;
}
// ---------- ค้นหาในคู่มือ (ใช้เมื่อ AI ใช้ไม่ได้) ----------
function hlpLocal(q){
 const t=String(q||"").toLowerCase().replace(/[?？!]/g,"").trim(), ws=t.split(/\s+/).filter(w=>w.length>0);
 const sc=HLP.ctx==="note"?HLP_NOTE:HLP_INK; const res=sc.map(k=>{ const hay=(k[1]+" "+k[4]+" "+k[3]).toLowerCase(); let s=0; ws.forEach(w=>{ if(hay.includes(w))s+=w.length>2?3:1; }); k[4].toLowerCase().split(/\s+/).forEach(w=>{ if(w.length>1&&t.includes(w))s+=4; }); return [s,k]; }).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,3);
 if(!res.length)return "ยังหาปุ่มที่ตรงกับคำถามไม่เจอค่ะ ลองบอกว่าอยากทำอะไร เช่น “ลบเส้น” “แทรกรูป” “คำนวณเลข” “ทำให้เป็นเส้นตรง”";
 return "ลองดูปุ่มเหล่านี้ค่ะ:\n"+res.map(([,k])=>"• "+k[1]+" {{"+k[0]+"}}\n  "+k[3]).join("\n");
}
// ---------- แสดงผล ----------
function hlpFmt(t){ let h=esc(String(t||"")).replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>"); const kb=hlpKB();
 h=h.replace(/\{\{([a-z0-9]+)\}\}/g,(m,id)=>{ const k=kb.find(x=>x[0]===id); return k?`<button type="button" class="hlp-chip" data-hid="${id}">👆 ชี้ให้ดู: ${esc(k[1])}</button>`:""; });
 return h.replace(/\n/g,"<br>"); }
function hlpPaint(){ const b=el("hlp-body"); if(!b)return; const arr=HLP.msgs[HLP.ctx]; 
 b.innerHTML=(arr.length?"":`<div class="hlp-hi"><b>ถามได้เลยค่ะ ✨</b><div class="hint" style="margin:4px 0 10px;line-height:1.6">หาเครื่องมือที่ไม่เจอ หรือให้สอนวิธีใช้ของหน้านี้ — ฉันจะบอกพร้อมปุ่ม “ชี้ให้ดู” ว่าอยู่ตรงไหน<br>🎤 <b>กดไมค์ครั้งเดียวแล้วพูดได้เลย</b> เช่น “ลบเส้นยังไง” หรือสั่ง “ใช้ปากกา”</div><div class="hlp-sug">${hlpSugs().map(s=>`<button type="button" data-hs="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`)+
 arr.map(m=>`<div class="hlp-m ${m.r==="u"?"u":"a"}">${m.r==="u"?esc(m.t).replace(/\n/g,"<br>"):hlpFmt(m.t)}</div>`).join("")+(HLP.busy?`<div class="hlp-m a"><span class="hlp-dots"><i></i><i></i><i></i></span></div>`:"");
 b.scrollTop=b.scrollHeight; }
function hlpSugs(){ return HLP.ctx==="note"?["สอนใช้หน้านี้","ทำตารางคิดเลขอัตโนมัติยังไง","ทำรายการติ๊กถูกยังไง","พูดให้พิมพ์ได้ไหม"]:["สอนใช้หน้านี้","อยากลบเส้นที่เขียนผิด","ทำให้เป็นเส้นตรงเป๊ะยังไง","แปลงลายมือเป็นตัวพิมพ์ยังไง","แทรกรูปภาพยังไง"]; }
function hlpClose(){ const p=el("hlp"); if(p)p.remove(); HLP.open=false; hlpShutUp(); if(HLP.listening&&typeof voiceStop==="function")voiceStop(); HLP.listening=false; }
function hlpOpen(host){
 if(el("hlp")){ hlpClose(); return; } HLP.ctx=hlpCtx(); HLP.open=true; const p=document.createElement("div"); p.id="hlp"; p.className="hlp";
 p.innerHTML=`<div class="hlp-h"><b>✨ ผู้ช่วย Sky Work <small>${HLP.ctx==="note"?"เขียนบันทึก":(ink.board?"กระดานกว้าง":"สมุดเขียนมือ")}</small></b><span><button type="button" data-hc="spk" id="hlp-spk" title="อ่านคำตอบออกเสียง (เมื่อถามด้วยเสียง)">🔊</button><button type="button" data-hc="clr" title="ล้างบทสนทนา">ล้าง</button><button type="button" data-hc="x" aria-label="ปิด">✕</button></span></div><div id="hlp-body" class="hlp-body"></div>
 <form class="hlp-f" id="hlp-form"><button type="button" class="hlp-mic" id="hlp-mic" data-hmic="1" aria-label="กดแล้วพูดสั่ง" title="กดครั้งเดียว แล้วพูดได้เลย">🎤</button><textarea id="hlp-in" rows="1" placeholder="พิมพ์ หรือกด 🎤 แล้วพูด" aria-label="ถามผู้ช่วย"></textarea><button type="submit" class="hlp-send" aria-label="ส่ง">ส่ง</button></form>`;
 (host||el(HLP.ctx==="note"?"ndlg":"inkdlg")).appendChild(p);
 p.addEventListener("pointerdown",e=>e.stopPropagation()); p.addEventListener("mousedown",e=>{ if(!e.target.closest("textarea"))e.preventDefault(); });
 p.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; e.stopPropagation();
  if(b.dataset.hmic)hlpMic(); else if(b.dataset.hc==="spk"){ HLP.spk=!HLP.spk; try{ localStorage.setItem("sw-hlp-spk",HLP.spk?"1":"0"); }catch(er){} if(!HLP.spk)hlpShutUp(); hlpSpkPaint(); }
  else if(b.dataset.hc==="x")hlpClose(); else if(b.dataset.hc==="clr"){ HLP.msgs[HLP.ctx]=[]; hlpPaint(); }
  else if(b.dataset.hs)hlpAsk(b.dataset.hs); else if(b.dataset.hid)hlpPoint(b.dataset.hid); });
 const ta=el("hlp-in"); ta.addEventListener("keydown",e=>{ e.stopPropagation(); if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); el("hlp-form").requestSubmit(); } else if(e.key==="Escape"){ hlpClose(); } });
 ta.addEventListener("input",()=>{ ta.style.height="auto"; ta.style.height=Math.min(110,ta.scrollHeight)+"px"; });
 el("hlp-form").addEventListener("submit",e=>{ e.preventDefault(); const v=ta.value.trim(); if(!v)return; ta.value=""; ta.style.height="auto"; hlpAsk(v); });
 hlpPaint(); hlpSpkPaint(); setTimeout(()=>{ try{ if(!HLP.noFocus)ta.focus(); }catch(e){} },80);
}
// ---------- ชี้ให้ดู ----------
function hlpPoint(id){
 const k=hlpKB().find(x=>x[0]===id); if(!k)return; let t=null; try{ t=document.querySelector(k[2]); }catch(e){}
 const vis=t&&t.offsetParent!==null&&!t.hidden&&t.getClientRects().length;
 if(!vis){ const why=/^sel|^seltxt|^selcalc/.test(id)?"ปุ่มนี้จะโผล่เมื่อเลือกของก่อน (ใช้เครื่องมือ “เลือก/ย้าย” ล้อมของที่ต้องการ)":(HLP.ctx==="note"?"ปุ่มนี้ยังไม่แสดงตอนนี้ ลองเลื่อนแถบเครื่องมือดูค่ะ":"ปุ่มนี้ยังไม่แสดงตอนนี้ (ลองกด ⋯ เมนูเพิ่มเติม หรือเลื่อนแถบเครื่องมือ)"); HLP.msgs[HLP.ctx].push({r:"a",t:why}); hlpPaint(); return; }
 try{ t.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"}); }catch(e){}
 document.querySelectorAll(".hlp-pulse").forEach(n=>n.classList.remove("hlp-pulse")); void t.offsetWidth; t.classList.add("hlp-pulse"); setTimeout(()=>t.classList.remove("hlp-pulse"),4200);
}
// ---------- สั่งด้วยเสียง: กดปุ่ม 🎤 ครั้งเดียว แล้วพูด → ส่งคำถาม/คำสั่งอัตโนมัติ ----------
function hlpSpkPaint(){ const b=el("hlp-spk"); if(b){ b.textContent=HLP.spk?"🔊":"🔇"; b.classList.toggle("off",!HLP.spk); } }
function hlpMicPaint(){ const b=el("hlp-mic"); if(b){ b.classList.toggle("on",!!HLP.listening); b.textContent=HLP.listening?"⏹":"🎤"; b.setAttribute("aria-label",HLP.listening?"หยุดฟัง":"กดแล้วพูดสั่ง"); } }
function hlpMic(){
 if(HLP.listening){ voiceStop(); HLP.listening=false; hlpMicPaint(); return; }
 if(typeof voiceSupported!=="function"||!voiceSupported()){ voiceNoSupport(); return; }
 if(VOICE.on){ voiceStop(); if(HLP.ctx!=="note"){ ink.voiceOn=false; try{ inkToolbar(); }catch(e){} } else if(typeof neVoiceBtns==="function")neVoiceBtns(false); }
 hlpShutUp(); const host=el(HLP.ctx==="note"?"ndlg":"inkdlg"); let got=false;
 const ok=voiceStart({host,onText:txt=>{ if(got)return; got=true; HLP.listening=false; setTimeout(()=>{ voiceStop(); hlpMicPaint(); },0); HLP.viaVoice=true; hlpAsk(txt,true); },onStop:()=>{ HLP.listening=false; hlpMicPaint(); }});
 if(!ok){ voiceNoSupport(); return; } HLP.listening=true; hlpMicPaint();
}
function hlpShutUp(){ try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){} }
function hlpSpeak(t){ if(!HLP.spk||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return; try{ const clean=String(t).replace(/\{\{[a-z0-9]+\}\}/g,"").replace(/\([^)]*AI ยังไม่พร้อม[^)]*\)/g,"").replace(/[•*_`]/g," ").replace(/\s+/g," ").trim().slice(0,420); if(!clean)return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(clean); u.lang="th-TH"; u.rate=1.02; const v=(speechSynthesis.getVoices()||[]).find(x=>/^th/i.test(x.lang)); if(v)u.voice=v; speechSynthesis.speak(u); }catch(e){} }
// คำสั่งตรง (ไม่ต้องรอ AI): “ใช้ปากกา” “เปลี่ยนเป็นยางลบ” “ย้อนกลับ” “ซูมพอดีหน้า” ฯลฯ — เฉพาะในสมุด/กระดาน
const HLP_TOOLWORDS=[["pen","ปากกา"],["shape","รูปทรง"],["hl","ไฮไลต์|ไฮไลท์|มาร์คเกอร์"],["eraser","ยางลบ|ลบเส้น"],["text","ข้อความ|พิมพ์ตัวอักษร"],["lasso","ลาสโซ่|เลือกหลายอัน"],["move","เคลื่อนย้าย|ย้ายของ|มูฟ"],["laser","เลเซอร์"],["tape","เทป"],["sticky","โน้ตแปะ|กระดาษโน้ต|สติ๊กกี้"],["hand","เลื่อนหน้า|มือ"]];
function hlpCommand(q){
 if(HLP.ctx==="note")return null; const t=String(q||"").trim().replace(/\s+/g,""); if(!t||t.length>40)return null;
 const verb=/^(ช่วย)?(ขอ|ให้|เปลี่ยนเป็น|เปลี่ยนไปใช้|เปลี่ยนไป|สลับเป็น|สลับไปใช้|สลับไป|เลือก|ใช้|เปิด|หยิบ|ไปที่)/.test(t);
 if(/^(ช่วย)?(ย้อนกลับ|ย้อน|ยกเลิกที่ทำ|อันดู)$/.test(t)){ try{ inkUndo(); }catch(e){ return null; } return "ย้อนกลับให้แล้วค่ะ"; }
 if(/^(ช่วย)?(ทำซ้ำ|ย้อนกลับไปข้างหน้า)$/.test(t)){ try{ inkUndo(true); }catch(e){ return null; } return "ทำซ้ำให้แล้วค่ะ"; }
 if(/(ซูมพอดี|พอดีหน้า|พอดีจอ)/.test(t)){ const z=el("ink-zfit"); if(z){ z.click(); return "ปรับให้พอดีหน้าแล้วค่ะ"; } }
 if(/^(ซูมเข้า|ขยายหน้า)$/.test(t)){ const z=el("ink-zin"); if(z){ z.click(); return "ซูมเข้าให้แล้วค่ะ"; } }
 if(/^(ซูมออก|ย่อหน้า)$/.test(t)){ const z=el("ink-zout"); if(z){ z.click(); return "ซูมออกให้แล้วค่ะ"; } }
 if(/^(ช่วย)?(ลบที่เลือก|ลบอันนี้|ลบเลย)$/.test(t)&&ink.sel){ const d=el("ink-seldel"); if(d&&!d.hidden){ d.click(); return "ลบที่เลือกให้แล้วค่ะ (ย้อนกลับได้)"; } }
 if(!verb&&t.length>14)return null;
 for(const [k,w] of HLP_TOOLWORDS){ if(new RegExp("("+w+")").test(t)&&(verb||t.length<=10)){ const b=document.querySelector('[data-itool="'+k+'"]'); if(b){ const nm=(INK_TOOLS.find(x=>x[0]===k)||[])[1]||k; b.click(); setTimeout(()=>hlpPoint(k),150); return "เปลี่ยนเป็นเครื่องมือ “"+nm.split(" ")[0]+"” ให้แล้วค่ะ {{"+k+"}}"; } } }
 return null;
}
// ---------- ถาม AI ----------
async function hlpAsk(q,viaVoice){
 const arr=HLP.msgs[HLP.ctx]; if(HLP.busy)return; const voice=!!(viaVoice||HLP.viaVoice); HLP.viaVoice=false; arr.push({r:"u",t:q});
 const cmd=hlpCommand(q); if(cmd){ arr.push({r:"a",t:cmd}); hlpPaint(); if(voice)hlpSpeak(cmd); return; }
 HLP.busy=true; hlpPaint();
 let out=""; try{
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const turns=[]; arr.slice(-9).forEach(m=>{ const role=m.r==="u"?"user":"assistant"; if(turns.length&&turns[turns.length-1].role===role)turns[turns.length-1].content+="\n"+m.t; else turns.push({role,content:m.t}); });
  while(turns.length&&turns[0].role!=="user")turns.shift();
  const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),45000);
  const r=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:hlpSystem(),context:hlpState(),max_tokens:800,messages:turns})});
  clearTimeout(tm); const j=await r.json().catch(()=>({})); if(!r.ok)throw new Error(j.message||("HTTP "+r.status)); out=String(j.text||"").trim(); if(!out)throw new Error("empty");
 }catch(e){ out=hlpLocal(q)+"\n\n(ตอนนี้ AI ยังไม่พร้อมใช้งาน เลยค้นจากคู่มือในแอปให้แทนค่ะ"+(e&&e.message&&!/empty|abort/i.test(e.message)?" — "+String(e.message).slice(0,90):"")+")"; }
 HLP.busy=false; if(HLP.open){ arr.push({r:"a",t:out}); hlpPaint(); if(voice){ hlpSpeak(out); const m=out.match(/\{\{([a-z0-9]+)\}\}/); if(m&&!/^(ai)$/.test(m[1]))setTimeout(()=>hlpPoint(m[1]),400); } }
}
// ---------- ปุ่มเปิด ----------
function hlpToggle(host){ if(el("hlp")&&el("hlp").parentNode===host){ hlpClose(); return; } hlpClose(); hlpOpen(host); }
[["inkdlg","ink"],["ndlg","note"]].forEach(([id,c])=>{ const d=el(id); if(d)d.addEventListener("close",()=>{ hlpClose(); HLP.msgs[c]=[]; }); });   // ปิดสมุด/บันทึก = เริ่มบทสนทนาใหม่
(function(){ const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="ai"]'); if(b){ e.stopImmediatePropagation(); hlpToggle(el("ndlg")); } },true); })();
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
// ---------- แจ้งเตือนนอกแอป (Web Push) ----------
const PUSH={checked:false,ready:false,cron:false,key:"",busy:false,msg:"",here:false,ep:"",gen:null};
const pushOK=()=>("serviceWorker" in navigator)&&("PushManager" in window)&&("Notification" in window);
const pushU8=b=>{ const s0=(b+"=".repeat((4-b.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/"), r=atob(s0); return Uint8Array.from([...r].map(c=>c.charCodeAt(0))); };
async function pushToken(){ try{ const {data:{session}}=await SB.auth.getSession(); return session?session.access_token:""; }catch(e){ return ""; } }
async function pushHere(){ try{ if(!pushOK()){ PUSH.here=false; return; } const reg=await navigator.serviceWorker.getRegistration(); const sb=reg&&await reg.pushManager.getSubscription(); PUSH.ep=sb?sb.endpoint:""; PUSH.here=!!(sb&&pushSubs.some(x=>x.endpoint===sb.endpoint)); }catch(e){ PUSH.here=false; } }
async function pushPing(){
PUSH.checked=true;
try{ const r=await fetch("/api/push",{cache:"no-store"}); const j=await r.json(); PUSH.ready=!!j.ready; PUSH.cron=!!j.cron; PUSH.key=j.publicKey||""; }catch(e){ PUSH.ready=false; PUSH.cron=false; }
await pushHere(); if(view==="set")render(); }
function pushPlanBuild(){
const L=[];
items.filter(t=>!isSysRow(t)&&isOpenStatus(t.status)).forEach(t=>{ const d=dueDate(t); if(!d)return; const n=daysTo(d); if(n<-60||n>14)return; L.push({d:isoOf(d),t:String(t.title||"").slice(0,60),lw:isLawItem(t)?1:0}); });
legal.forEach(g=>{ const d=legalDue(g); if(!d)return; const n=daysTo(d); if(n<-60||n>14)return; L.push({d:isoOf(d),t:String(g.title||"").slice(0,60),lw:1}); });
L.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0); return L.slice(0,80);
}
let pushLast="", pushT=null;
async function pushPlanSave(){
if(!DB||!pushSubs.length)return;
const l=pushPlanBuild(), h=JSON.stringify(l); if(h===pushLast)return; pushLast=h;
try{ await DB.doc("meta/pushplan").set({list:l,at:new Date().toISOString()}); }catch(e){ pushLast=""; }
}
function pushPlanKick(){ if(!pushSubs.length||LOADING)return; clearTimeout(pushT); pushT=setTimeout(pushPlanSave,6000); }
async function pushOn(){
PUSH.busy=true; PUSH.msg=""; render();
try{
if(!pushOK())throw new Error("เบราว์เซอร์นี้ไม่รองรับ (iPhone: กด Share → Add to Home Screen แล้วเปิดจากไอคอนก่อน)");
if(!PUSH.key)throw new Error("ยังไม่ได้ตั้งค่า VAPID ที่ Vercel");
const perm=await Notification.requestPermission(); if(perm!=="granted")throw new Error("เบราว์เซอร์ไม่อนุญาตการแจ้งเตือน — เปิดสิทธิ์ที่รูปแม่กุญแจหน้าช่อง URL");
const reg=await navigator.serviceWorker.ready; let sb=await reg.pushManager.getSubscription();
if(!sb)sb=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushU8(PUSH.key)});
const j=sb.toJSON(), rec={endpoint:j.endpoint,keys:j.keys,at:new Date().toISOString(),ua:(navigator.userAgent||"").slice(0,80)};
pushSubs=[...pushSubs.filter(x=>x.endpoint!==rec.endpoint),rec]; await saveMeta("pushsubs",pushSubs);
pushLast=""; await pushPlanSave(); await pushHere();
PUSH.msg="เปิดแล้ว ✓ กด “ส่งทดสอบ” เพื่อลองได้เลย";
}catch(e){ PUSH.msg="ไม่สำเร็จ: "+(e.message||e); }
PUSH.busy=false; render();
}
async function pushOff(){
PUSH.busy=true; render();
try{ const reg=await navigator.serviceWorker.getRegistration(); const sb=reg&&await reg.pushManager.getSubscription(); const ep=sb?sb.endpoint:PUSH.ep; if(sb)await sb.unsubscribe();
pushSubs=pushSubs.filter(x=>x.endpoint!==ep); await saveMeta("pushsubs",pushSubs); PUSH.here=false; PUSH.msg="ปิดแจ้งเตือนนอกแอปบนเครื่องนี้แล้ว"; }
catch(e){ PUSH.msg="ไม่สำเร็จ: "+(e.message||e); }
PUSH.busy=false; render();
}
async function pushCall(action){
PUSH.busy=true; PUSH.msg=""; render();
try{ await pushPlanSave();
const r=await fetch("/api/push",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+await pushToken()},body:JSON.stringify({action})});
const j=await r.json().catch(()=>({})); if(!r.ok)throw new Error(j.message||("ผิดพลาด "+r.status));
PUSH.msg=j.sent?("ส่งแล้ว "+j.sent+" เครื่อง"+(j.failed?" · ไม่สำเร็จ "+j.failed:"")+" — ดูที่แถบแจ้งเตือนของเครื่อง"):("ส่งไม่สำเร็จ"+(j.failed?" "+j.failed+" เครื่อง (เครื่องที่หมดอายุจะถูกล้างออกอัตโนมัติรอบถัดไป)":""));
}catch(e){ PUSH.msg="ไม่สำเร็จ: "+(e.message||e); }
PUSH.busy=false; render();
}
async function pushGenKeys(){
PUSH.busy=true; render();
try{ const r=await fetch("/api/push?genkeys=1",{cache:"no-store"}); const j=await r.json(); if(!j.privateKey)throw new Error("สร้างคีย์ไม่ได้ (อาจตั้งค่าไว้แล้ว)"); PUSH.gen=j; }
catch(e){ PUSH.msg="ไม่สำเร็จ: "+(e.message||e); }
PUSH.busy=false; render();
}
function pushCard(){
if(!PUSH.checked){ PUSH.checked=true; pushPing(); }
const sup=pushOK(), n=pushSubs.length, dis=PUSH.busy?" disabled":"";
let body="";
if(!sup)body=`<div class="banner bad" style="margin-top:12px">เครื่อง/เบราว์เซอร์นี้ไม่รองรับ Push (iPhone ต้องติดตั้งแอปลงหน้าจอหลักก่อน: Share → Add to Home Screen แล้วเปิดจากไอคอน)</div>`;
else if(!PUSH.ready)body=`<div class="banner" style="margin-top:12px">ยังไม่ได้ตั้งค่าฝั่งเซิร์ฟเวอร์ — ทำครั้งเดียวประมาณ 5 นาที</div>
<div class="hint" style="margin-top:8px;line-height:1.8">1) กดสร้างคีย์ด้านล่าง → คัดลอก 2 ค่า<br>2) Vercel → โปรเจค → Settings → Environment Variables → เพิ่ม <b>VAPID_PUBLIC_KEY</b> และ <b>VAPID_PRIVATE_KEY</b> (ต้องมี <b>SUPABASE_URL</b> + <b>SUPABASE_ANON_KEY</b> อยู่แล้วจากตอนตั้งผู้ช่วย AI)<br>3) ให้สรุปเช้าอัตโนมัติ เพิ่ม <b>SUPABASE_SERVICE_ROLE_KEY</b> (Supabase → Project Settings → API → service_role) และ <b>CRON_SECRET</b> (พิมพ์รหัสอะไรก็ได้ยาวๆ)<br>4) กด Redeploy แล้วกลับมาหน้านี้ (<b>อย่าวางคีย์ในแชทหรือไฟล์ในแอป</b>)</div>
<div class="addg"><button class="btn" id="pushGen"${dis}>สร้างคีย์ VAPID</button><button class="btn ghost" id="pushPing">ตรวจการตั้งค่าใหม่</button></div>
${PUSH.gen?`<div class="code" id="pushKeys">VAPID_PUBLIC_KEY=${esc(PUSH.gen.publicKey)}\nVAPID_PRIVATE_KEY=${esc(PUSH.gen.privateKey)}</div><div class="hint">คีย์นี้แสดงแค่ในหน้านี้ ไม่ถูกเก็บที่ไหน — คัดลอกไปใส่ Vercel แล้วปิดหน้านี้ได้</div><div class="addg"><button class="btn sm ghost" id="pushCopy">คัดลอก 2 บรรทัด</button></div>`:""}`;
else body=`<div class="meta" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><span class="bchip">เซิร์ฟเวอร์พร้อม</span><span class="bchip${PUSH.here?"":" warn"}">${PUSH.here?"เครื่องนี้เปิดอยู่":"เครื่องนี้ยังไม่เปิด"}</span><span class="bchip">${n} เครื่องที่ลงทะเบียน</span><span class="bchip${PUSH.cron?"":" warn"}">${PUSH.cron?"สรุปเช้าอัตโนมัติ 08:00":"สรุปเช้ายังไม่เปิด"}</span></div>
<div class="addg">${PUSH.here?`<button class="btn ghost" id="pushOff"${dis}>ปิดบนเครื่องนี้</button>`:`<button class="btn" id="pushOn"${dis}>${svg(ICON.bell,17)}เปิดแจ้งเตือนบนเครื่องนี้</button>`}
<button class="btn ghost" id="pushTest"${dis}>ส่งทดสอบ</button><button class="btn ghost" id="pushDigest"${dis}>ส่งสรุปเช้านี้ตอนนี้</button></div>
${PUSH.cron?"":`<div class="hint" style="margin-top:8px">ส่งทดสอบได้แล้ว แต่ “สรุปอัตโนมัติทุกเช้า” ต้องเพิ่ม <b>SUPABASE_SERVICE_ROLE_KEY</b> และ <b>CRON_SECRET</b> ที่ Vercel แล้ว Redeploy</div>`}`;
return `<div class="card" style="margin-top:16px"><h2>แจ้งเตือนนอกแอป (Push) <small>เด้งเข้าเครื่องแม้ปิดแอป</small></h2>
<div class="hint" style="margin-top:6px">ทุกเช้า 08:00 (เวลาไทย) ส่งสรุป เลยกำหนด · วันนี้ · ใน 3 วัน ·  ข้อมูลที่ใช้คือรายการที่แอปบันทึกไว้ล่าสุดตอนเปิดใช้งาน (ปิดงานในแอปแล้วจะอัปเดตเอง)</div>
${body}${PUSH.msg?`<div class="banner ${/^ไม่สำเร็จ/.test(PUSH.msg)?"bad":"ok"}" style="margin-top:12px">${esc(PUSH.msg)}</div>`:""}</div>`;
}
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
${pushCard()}
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
return `<div class="rw${g.hidden?" off":""}">
<span class="tagdot" style="background:${gTagColor(g.key)}"></span>
${nameInput("data-ren",g.key,g.label)}
<span class="swrow">${["",...TAGCOLORS].map(c=>`<button class="sw1${(g.color||"")===c?" on":""}" data-gcol="${esc(g.key)}|${c}" title="${c||"ตามสถานะ"}" style="background:${c||"transparent"};${c?"":"border:2px dashed var(--line)"}"></button>`).join("")}</span>
<button class="gcbtn" data-see="track:${esc(g.key)}" title="ดูงานในกลุ่มนี้">${n} งาน</button>
<button class="iconbtn" data-move="track:${esc(g.key)}" title="ย้ายงานทั้งหมดไปกลุ่มอื่น"${n?"":" disabled"}>${svg(ICON_MOVE,15)}</button>
${moveBtns("groups",i,groups.length,g.hidden)}
<button class="btn danger sm" data-delg="${esc(g.key)}">ลบ</button></div>`;}).join("")}</div>
<div class="addg"><input id="newg" placeholder="ชื่อกลุ่มใหม่ เช่น งานฝึกอบรม">
<button class="btn" id="addg">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มกลุ่ม</button></div>
${TRAIN_PRESET.every(x=>groups.some(g=>g.label===x.label))?"":`<div class="addg" style="margin-top:10px"><button class="btn ghost" id="preset">${svg(ICON.train,17)}เพิ่มชุดกลุ่มงานฝึกอบรม (${esc(TRAIN_PRESET.filter(x=>!groups.some(g=>g.label===x.label)).map(x=>x.label).join(", "))})</button></div>`}
<div class="hint"><b>สีของกลุ่มงาน = สีเดียวของระบบ</b> ทุกงานในกลุ่มนี้ขึ้นสีนี้ในปฏิทินและทุกหน้า · ช่องประ = ใช้สีตามสถานะ<br>
พิมพ์ทับเพื่อแก้ชื่อ · ปุ่มลูกศรเลื่อนลำดับ (อันที่ใช้บ่อยไว้บนสุด) · ปุ่มรูปตาซ่อนกลุ่มที่ไม่ได้ใช้ออกจากตัวเลือกทุกหน้า โดยไม่ลบข้อมูล · ลบได้เฉพาะกลุ่มที่ไม่มีงานเหลือ</div></div>`;
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
let tyQ="", tyShut={}, crsQ="", crsShut={}, bkMsg="";
function setTypes(){
const defs=typeDefs(), list=defs.map(x=>x.name);
const none=items.filter(t=>!t.type).length;
const row=(D,i,up,dn)=>{const x=D.name, tr=D.track, n=typeUsed(x);
return `<div class="rw" data-tyname="${esc(x.toLowerCase())}">${nameInput("data-rent",x,x)}
<select class="cosel" data-trt="${esc(x)}" title="ย้ายประเภทนี้ไปอยู่ใต้กลุ่มงานอื่น">
<option value="">— ทุกกลุ่มงาน —</option>
${groups.map(g=>`<option value="${esc(g.key)}"${tr===g.key?" selected":""}>${esc(g.label)}</option>`).join("")}
</select>
<button class="gcbtn" data-see="type:${esc(x)}" title="ดูงานที่ใช้ประเภทนี้"${n?"":" disabled"}>${n} งาน</button>
<button class="iconbtn${D.law?" law":""}" data-tlaw="${esc(x)}" aria-pressed="${!!D.law}" title="${D.law?"บังคับตามกฎหมาย — ระบบจะเตือนเมื่อเลยกำหนด (กดเพื่อปิด)":"กดเพื่อตั้งเป็น “บังคับตามกฎหมาย”"}">${svg(ICON.legal,15)}</button>
<button class="iconbtn" data-movet="${esc(x)}" title="ย้ายงานทั้งหมดไปประเภทอื่น"${n?"":" disabled"}>${svg(ICON_MOVE,15)}</button>
<button class="iconbtn" data-mvt="${i}:${up}"${up<0?" disabled":""} title="เลื่อนขึ้นในกลุ่มนี้">${svg(ICON_UP,15)}</button>
<button class="iconbtn" data-mvt="${i}:${dn}"${dn<0?" disabled":""} title="เลื่อนลงในกลุ่มนี้">${svg(ICON_DN,15)}</button>
<button class="btn danger sm" data-delt="${esc(x)}">ลบ</button></div>`;};
const pairs=defs.map((D,i)=>[D,i]);
const orph=pairs.filter(([D])=>D.track&&!groups.some(g=>g.key===D.track));
const buckets=[...groups.map(g=>[g.key,g.label,g.color||""]),["","ใช้ได้ทุกกลุ่มงาน",""],...(orph.length?[["__x__","กลุ่มงานที่ถูกลบไปแล้ว",""]]:[])];
const blank=[];
const secs=buckets.map(([k,lab,col])=>{
const mine=k==="__x__"?orph:pairs.filter(([D])=>(D.track||"")===k);
if(!mine.length){if(k)blank.push(lab);return "";}
const idx=mine.map(([,i])=>i);
const tasks=mine.reduce((a,[D])=>a+typeUsed(D.name),0);
const body=mine.map(([D,i],p)=>row(D,i,p>0?idx[p-1]:-1,p<idx.length-1?idx[p+1]:-1)).join("");
return `<details class="tysec"${tyShut[k]?"":" open"} data-tysec="${esc(k)}">
<summary><span class="tydot" style="background:${col||"var(--line-2)"}"></span>${esc(lab)}
<em>${mine.length} ประเภท${tasks?" · "+tasks+" งาน":""}</em></summary>
<div class="rows">${body}</div></details>`;}).join("");
const nLaw=defs.filter(x=>x.law).length;
return `<div class="card"><h2>ประเภทงาน <small>${list.length} ประเภท · ใช้อยู่ ${items.filter(t=>t.type).length} งาน${nLaw?" · บังคับตามกฎหมาย "+nLaw:""}</small></h2>
<div class="addg"><input id="newt" placeholder="ชื่อประเภทใหม่ เช่น ตรวจประเมิน">
<select id="newtg"><option value="">— ใช้ได้ทุกกลุ่มงาน —</option>${groups.map(g=>`<option value="${esc(g.key)}">อยู่ใต้ ${esc(g.label)}</option>`).join("")}</select>
<label class="lawchk" title="งานที่กฎหมายบังคับให้ต้องทำ เช่น ดับเพลิง · ที่อับอากาศ · อนุรักษ์พลังงาน"><input type="checkbox" id="newtlaw"> บังคับตามกฎหมาย</label>
<button class="btn" id="addt">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มประเภท</button></div>
<div class="tybar"><input id="tyfind" value="${esc(tyQ)}" placeholder="พิมพ์ค้นหาประเภท…" autocomplete="off">
<button class="gcbtn" id="tyexp">เปิดทุกกลุ่ม</button><button class="gcbtn" id="tycol">ย่อทุกกลุ่ม</button></div>
${secs||`<div class="empty">ยังไม่มีประเภท</div>`}
${blank.length?`<div class="hint">กลุ่มที่ยังไม่มีประเภทย่อย: ${blank.map(esc).join(" · ")} — เพิ่มได้จากช่องด้านล่าง</div>`:""}
${none?`<div class="hint">มี <b>${none}</b> งานที่ยังไม่ได้ระบุประเภท — เปิดงานแล้วเลือกประเภทได้เลย</div>`:""}
<div class="hint"><b>กลุ่มงาน</b> คือกองใหญ่ · <b>ประเภทงาน</b> คือชนิดย่อยในกองนั้น — ช่องที่สองบอกว่าประเภทนี้อยู่ใต้กลุ่มไหน ตอนเพิ่มงานระบบจะโชว์เฉพาะประเภทของกลุ่มที่เลือก (บวกกับประเภทที่ตั้งเป็น “ใช้ได้ทุกกลุ่มงาน”)<br>
ปุ่มโล่ <b>⚖︎</b> ท้ายแถว = ตั้งประเภทนั้นเป็น <b>บังคับตามกฎหมาย</b> — งานอบรมในประเภทนี้จะถูกเฝ้าวันครบกำหนด และขึ้นแถบเตือนสีแดงในหน้าฝึกอบรมเมื่อเลยกำหนดแล้วยังไม่ปิดงาน · ใช้เป็น <b>ตาข่ายกันพลาดระดับกอง</b> เพราะถ้าหลักสูตรนั้นตั้งค่าไว้เองใน <b>ทะเบียนหลักสูตรอบรม</b> ระบบจะยึดของหลักสูตรก่อนเสมอ (แม่นกว่า)<br>
พิมพ์ทับเพื่อแก้ชื่อ — งานทุกงานที่ใช้ประเภทนั้นจะเปลี่ยนตามให้อัตโนมัติ · กดจำนวนงานเพื่อดูว่างานไหนใช้อยู่ · ปุ่มลูกศรจัดลำดับในตัวเลือกตอนเพิ่มงาน · ลบได้เฉพาะประเภทที่ไม่มีงานเหลือ (ใช้ปุ่มย้ายก่อน)</div></div>`;
}
function setCourses(){
const row=(c,i,up,dn)=>{const bs=crsBatches(c.code), pax=bs.reduce((a,t)=>a+(+t.pax||0),0);
return `<div class="rw${c.hidden?" off":""}" data-crsname="${esc((c.code+" "+c.name).toLowerCase())}">
<button class="crscode" data-crsopen="${esc(c.code)}" title="ดูรายละเอียดหลักสูตร">${esc(c.code)}</button>
${nameInput("data-rencrs",c.code,c.name)}
<select class="cosel" data-crsskill="${esc(c.code)}" title="หมวดทักษะ (Soft / Hard / Safety …)">
<option value="">— หมวดทักษะ —</option>${skills().map(x=>`<option value="${esc(x)}"${c.skill===x?" selected":""}>${esc(x)}</option>`).join("")}</select>
<select class="cosel" data-crsmode="${esc(c.code)}" title="รูปแบบการอบรม">
<option value="">— รูปแบบ —</option>${modes().map(x=>`<option value="${esc(x)}"${c.mode===x?" selected":""}>${esc(x)}</option>`).join("")}</select>
<input type="number" class="glb" data-crshr="${esc(c.code)}" value="${c.hours||""}" placeholder="ชม." title="ชั่วโมงต่อคน" min="0" step="0.5">
<select class="cosel${c.law===true?" lawsel":""}" data-crslaw="${esc(c.code)}" title="หลักสูตรนี้บังคับตามกฎหมายไหม — ถ้าเลือกไว้ จะชนะค่าที่ตั้งในประเภทงาน">
<option value=""${c.law===undefined||c.law===null?" selected":""}>— ตามประเภทงาน —</option>
<option value="1"${c.law===true?" selected":""}>⚖︎ บังคับตามกฎหมาย</option>
<option value="0"${c.law===false?" selected":""}>ไม่บังคับ</option></select>
<button class="gcbtn" data-see="crs:${esc(c.code)}" title="ดูรุ่นทั้งหมดของหลักสูตรนี้"${bs.length?"":" disabled"}>${bs.length} รุ่น${pax?" · "+pax+" คน":""}</button>
<button class="iconbtn" data-mvc="${i}:${up}"${up<0?" disabled":""} title="เลื่อนขึ้นในหมวดนี้">${svg(ICON_UP,15)}</button>
<button class="iconbtn" data-mvc="${i}:${dn}"${dn<0?" disabled":""} title="เลื่อนลงในหมวดนี้">${svg(ICON_DN,15)}</button>
<button class="iconbtn${c.hidden?"":" on"}" data-hide="courses:${i}" title="${c.hidden?"กดเพื่อแสดง":"กดเพื่อซ่อน"}">${svg(c.hidden?ICON_EYEOFF:ICON_EYE,15)}</button>
<button class="btn danger sm" data-delcrs="${esc(c.code)}">ลบ</button></div>`;};
const pairs=courses.map((c,i)=>[c,i]);
const blank=[];
const secs=[...skills().map(k=>[k,k,skillColor(k)]),["","ยังไม่ระบุหมวดทักษะ",""]].map(([k,lab,col])=>{
const mine=pairs.filter(([c])=>(c.skill||"")===k);
if(!mine.length){if(k)blank.push(lab);return "";}
const idx=mine.map(([,i])=>i);
const bs=mine.reduce((a,[c])=>a+crsBatches(c.code).length,0);
const law=mine.filter(([c])=>c.law===true).length;
return `<details class="tysec"${crsShut[k]?"":" open"} data-crssec="${esc(k)}">
<summary><span class="tydot" style="background:${col||"var(--line-2)"}"></span>${esc(lab)}
<em>${mine.length} หลักสูตร${bs?" · "+bs+" รุ่น":""}${law?" · ⚖︎ "+law:""}</em></summary>
<div class="rows">${mine.map(([c,i],p)=>row(c,i,p>0?idx[p-1]:-1,p<idx.length-1?idx[p+1]:-1)).join("")}</div></details>`;}).join("");
const nLaw=courses.filter(c=>c.law===true).length;
const miniList=(kind,label,arr,usedFn,colFn,ph)=>`<div class="card" style="margin-top:16px">
<h2>${esc(label)} <small>${arr.length} รายการ</small></h2>
<div class="addg" style="margin-top:10px"><input id="new${kind}" placeholder="${esc(ph)}">
<button class="btn" id="add${kind}">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่ม</button></div>
<div class="rows">${arr.map((x,i)=>{const n=usedFn(x);
return `<div class="rw"><span class="tydot" style="background:${colFn(x)}"></span>
${nameInput("data-ren"+kind,x,x)}
<span class="gc">${n?"ใช้อยู่ "+n+" รายการ":"ยังไม่มีใครใช้"}</span>
<button class="iconbtn" data-mvl="${kind}:${i}:-1"${i===0?" disabled":""} title="เลื่อนขึ้น">${svg(ICON_UP,15)}</button>
<button class="iconbtn" data-mvl="${kind}:${i}:1"${i===arr.length-1?" disabled":""} title="เลื่อนลง">${svg(ICON_DN,15)}</button>
<button class="btn danger sm" data-del${kind}="${esc(x)}">ลบ</button></div>`;}).join("")}</div></div>`;
return `<div class="card"><h2>ทะเบียนหลักสูตรอบรม <small>${courses.length} หลักสูตร · ${items.filter(t=>isTrain(t)&&t.course).length} รุ่นที่ผูกไว้${nLaw?" · บังคับตามกฎหมาย "+nLaw:""}</small></h2>
<div class="addg">
<span class="crscode" id="crsnext">${esc(nextCourseCode())}</span>
<input id="newcrs" placeholder="ชื่อหลักสูตร เช่น หลักการทำงานของ LeKise Group">
<select id="newcrssk"><option value="">— หมวดทักษะ —</option>${skills().map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}</select>
<button class="btn" id="addcrs">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มหลักสูตร</button></div>
<div class="tybar"><input id="crsfind" value="${esc(crsQ)}" placeholder="พิมพ์ค้นหารหัสหรือชื่อหลักสูตร…" autocomplete="off">
<button class="gcbtn" id="crsexp">เปิดทุกหมวด</button><button class="gcbtn" id="crscol">ย่อทุกหมวด</button></div>
${secs||`<div class="empty">ยังไม่มีหลักสูตรในทะเบียน — เพิ่มด้านล่าง ระบบจะรันรหัสให้เอง</div>`}
${blank.length?`<div class="hint">หมวดที่ยังไม่มีหลักสูตร: ${blank.map(esc).join(" · ")}</div>`:""}
${(()=>{const un=items.filter(t=>isTrain(t)&&!t.course&&crsByName(t.title));
return un.length?`<div class="banner" style="margin-top:14px">${svg(ICON.bell,17)} มี <b>${un.length}</b> รายการอบรมที่ชื่อตรงกับทะเบียน แต่ยังไม่ได้ผูกรหัสไว้ในข้อมูล
<button class="btn sm" id="crslink" style="margin-left:auto">ผูกรหัสให้อัตโนมัติ</button></div>`:"";})()}
<div class="hint"><b>รหัสหลักสูตรรันอัตโนมัติ</b> (${CRSPREFIX}-001, -002, …) แก้ชื่อได้ แต่รหัสล็อกไว้เพื่อไม่ให้หลักสูตรเดียวกันมีหลายรหัส<br>
เวลาเพิ่มงานอบรม ให้เลือกหลักสูตรจากทะเบียนนี้ แล้วใส่แค่ <b>รุ่นที่</b> · หนึ่งหลักสูตรมีกี่รุ่นก็ได้ ระบบนับ “หลักสูตร” แบบไม่ซ้ำ และนับ “รุ่น” แยกให้<br>
หมวดทักษะ/รูปแบบ/ชั่วโมง ที่ตั้งไว้ตรงนี้จะเติมให้อัตโนมัติตอนเลือกหลักสูตร · ลบได้เฉพาะหลักสูตรที่ยังไม่มีรุ่นผูกอยู่<br>
ช่อง <b>⚖︎ บังคับตามกฎหมาย</b> คือตัวจริงที่แม่นที่สุด เพราะกฎหมายบังคับเป็นราย “หลักสูตร” ไม่ใช่รายกอง — <b>ค่าที่ตั้งตรงนี้ชนะค่าในตั้งค่า › ประเภทงานเสมอ</b> · ปล่อยเป็น “ตามประเภทงาน” ไว้ ระบบจะไปใช้ธงของประเภทงานแทน (ตาข่ายกันพลาดสำหรับรุ่นที่ยังไม่ผูกรหัสหลักสูตร)</div></div>
${miniList("sk","หมวดทักษะ",skills(),skillUsed,skillColor,"เช่น Leadership, ISO, ภาษา")}
${miniList("md","รูปแบบการอบรม",modes(),modeUsed,modeColor,"เช่น Zoom, E-Learning, ดูงานนอกสถานที่")}
<div class="hint"><b>หมวดทักษะ</b> = จัดกลุ่มว่าหลักสูตรนั้นพัฒนาอะไร (Soft / Hard / Safety …) ใช้ทำโดนัทในหน้าฝึกอบรม — <b>คนละตัวกับ “ประเภทงาน”</b> ในตั้งค่าอีกแท็บ ซึ่งเป็นชนิดย่อยของงานทั้งระบบ (ประชุม/อบรม/โปรเจค) ไม่ได้ใช้เฉพาะหลักสูตร<br>
<b>รูปแบบการอบรม</b> = จัดที่ไหนอย่างไร (In-House / Public / Online …) · ทั้งสองรายการนี้แก้ชื่อ เพิ่ม ลบ และจัดลำดับได้ตามใจ ระบบจะดึงไปใส่ในตัวเลือกทุกหน้าให้เอง · ชื่อที่มีข้อมูลใช้อยู่จะไม่หายแม้ลบออกจากทะเบียน</div>`;
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
<button class="gcbtn glb" data-glplan="${esc(g.key)}" title="ตั้งงบรายเดือนแยกบริษัท">${glBudget(g,y)?baht(glBudget(g,y))+" ฿":"ตั้งงบ "+(y+543)}</button>
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
return `<div class="card"><h2>ขนาดหน้าจอ <small>ใช้เฉพาะเครื่องนี้</small></h2>
<div class="seg" id="zoomseg" style="margin-top:10px">${ZOOMS.map(([v,l])=>`<button data-zm="${v}" aria-pressed="${curZoom()===v}">${l} · ${v}%</button>`).join("")}</div>
<div class="hint">ย่อทั้งหน้าให้เห็นเนื้อหาต่อหน้ามากขึ้น แยกตามเครื่อง (คอมกับมือถือตั้งไม่เหมือนกันได้)</div></div>
<div class="card" style="margin-top:16px"><h2>สไตล์ปุ่ม · เมนูที่เลือก · การ์ดเด่น <small>ใช้เฉพาะเครื่องนี้</small></h2>
<div class="seg" id="hlseg" style="margin-top:10px;flex-wrap:wrap">${HLS.map(([v,l])=>`<button data-hl="${v}" aria-pressed="${curHL()===v}">${l}</button>`).join("")}</div>
<div class="hint">${esc((HLS.find(x=>x[0]===curHL())||HLS[0])[2])} · ลองกดสลับดูได้เลย เห็นผลทันที</div></div>
<div class="card" style="margin-top:16px"><h2>โหมดกลางวัน / กลางคืน <small>${night?"ตอนนี้: กลางคืน 🌙":"ตอนนี้: กลางวัน ☀️"}</small></h2>
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
<div class="card" style="margin-top:16px"><h2>ผสมสีเอง <small>ซ้ายอ่อนสุด → ขวาเข้มสุด · แต่ละช่องคุมคนละหน้าที่</small></h2>
<div class="mixer">${custom.map((c,i)=>`<label class="mixc"><input type="color" id="cc${i}" value="${c}">
<span><b>${MIXROLE[i][0]}</b>${MIXROLE[i][1]}</span></label>`).join("")}</div>
<div class="mixprev" id="mixprev">
<div class="mp-card" id="mp-card">
<div class="mp-h" id="mp-h">ตัวอย่างการ์ด</div>
<div class="mp-s" id="mp-s">ตัวหนังสือรอง · คำอธิบายใต้หัวข้อ</div>
<div class="mp-row"><span class="mp-chip" id="mp-chip">ป้ายกำกับ</span>
<span class="mp-btn" id="mp-btn">ปุ่มหลัก</span>
<span class="mp-in" id="mp-in">ช่องกรอก</span></div></div></div>
<div class="addg"><button class="btn" id="useCustom">${svg(ICON.check,17)}ใช้สีชุดนี้</button>
<button class="btn ghost" id="fromCur">ดึงค่าจากชุดที่ใช้อยู่</button></div>
<div class="hint"><b>หน้าที่ของแต่ละช่อง (โหมดกลางวัน)</b><br>
${MIXROLE.map((r,i)=>`<b>${i+1}. ${r[0]}</b> — ${r[2]}`).join("<br>")}<br><br>
<b>โหมดกลางคืนจะสลับหน้าที่กัน</b> — ช่อง <b>เข้มสุด</b> กลายเป็นพื้นหลัง และช่อง <b>อ่อนสุด/อ่อน</b> กลายเป็นตัวหนังสือ ระบบคำนวณให้เองไม่ต้องตั้งสองชุด<br>
<b>สีสถานะ</b> (เขียว=เสร็จ · ส้ม=กำลังทำ · แดง=เลยกำหนด · เทา=รอ) <b>ไม่ขึ้นกับชุดสีนี้</b> ตรึงไว้ให้อ่านง่ายเสมอ · ส่วนสีของกลุ่มงานตั้งแยกที่หัวข้อด้านบน</div></div>
<div class="card" style="margin-top:16px"><h2>ป้ายกำกับ <small>${tagDefs().length} ป้าย · ใช้ค้นหาและจัดหมวดย่อย</small></h2>
<div class="rows">${tagDefs().map((g,i)=>{const n=tagUsed(g.name);
return `<div class="rw">
<span class="tagdot" style="background:${tagColor(g.name)||"var(--wait)"}"></span>
${nameInput("data-rentag",g.name,g.name)}
<select class="cosel" data-tagtrack="${esc(g.name)}" title="ป้ายนี้ใช้กับกลุ่มงานไหน">
<option value="">— ใช้ได้ทุกกลุ่มงาน —</option>
${groups.map(x=>`<option value="${esc(x.key)}"${g.track===x.key?" selected":""}>อยู่ใต้ ${esc(x.label)}</option>`).join("")}
</select>
<button class="gcbtn" data-see="tag:${esc(g.name)}" title="ดูงานที่ติดป้ายนี้"${n?"":" disabled"}>${n} งาน</button>
<button class="btn danger sm" data-deltag="${esc(g.name)}">ลบ</button></div>`;}).join("")||`<div class="empty">ยังไม่มีป้ายกำกับ</div>`}</div>
<div class="addg"><input id="newtag" placeholder="ชื่อป้ายใหม่ เช่น ความปลอดภัย">
<select id="newtagg"><option value="">— ใช้ได้ทุกกลุ่มงาน —</option>${groups.map(x=>`<option value="${esc(x.key)}">อยู่ใต้ ${esc(x.label)}</option>`).join("")}</select>
<button class="btn" id="addtag">${svg('<path d="M12 5v14M5 12h14"/>',17)}เพิ่มป้าย</button></div>
<div class="hint">ป้ายกำกับเป็น <b>คำค้น/หมวดย่อย</b> ของงาน เช่น “ความปลอดภัย” “ผู้บริหาร” — ไม่มีสีของตัวเอง สีในปฏิทินมาจากกลุ่มงานเสมอ<br>
เลือกกลุ่มให้ป้ายได้ ตอนเพิ่มงานระบบจะโชว์เฉพาะป้ายของกลุ่มนั้น (บวกป้ายกลาง) · ลบป้ายไม่ลบงาน</div></div>`;
}
function setTrash(){
const all=trashAll();
const groupsT=Object.keys(TRASH).filter(k=>TRASH[k].length);
const row=({coll,t})=>{const left=trashLeft(t), d=trashDays(t);
return `<div class="rw">
<span class="tag">${esc(TRKIND[coll]||coll)}</span>
<div class="gn">${esc(trashTitle(coll,t))}
<div class="t-note">ลบเมื่อ ${esc(new Date(t._trash).toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"}))} · ${d===0?"วันนี้":d+" วันก่อน"}</div></div>
<span class="gc" style="${left<=7?"color:var(--over);font-weight:600":""}">เหลือ ${left} วัน</span>
<button class="btn sm" data-restore="${esc(coll)}:${esc(t._id)}">กู้คืน</button>
<button class="btn danger sm" data-purge="${esc(coll)}:${esc(t._id)}">ลบถาวร</button></div>`;};
return `<div class="card"><h2>ถังขยะ <small>${all.length} รายการ · ลบอัตโนมัติเมื่อครบ ${TRASH_DAYS} วัน</small></h2>
<div class="hint" style="margin-top:2px">ทุกอย่างที่กดลบในระบบจะมาพักที่นี่ก่อน <b>${TRASH_DAYS} วัน</b> แล้วค่อยหายถาวร — กู้คืนได้ทุกเมื่อ ของที่กู้กลับจะไปอยู่ที่เดิมพร้อมข้อมูลครบเหมือนเดิม</div>
${all.length?`<div class="tybar" style="margin-top:12px"><span style="font-size:13px;color:var(--ink-3)">${groupsT.map(k=>TRKIND[k]+" "+TRASH[k].length).join(" · ")}</span>
<button class="btn danger sm" id="trashEmpty" style="margin-left:auto">ล้างถังขยะทั้งหมด</button></div>
<div class="rows">${all.map(row).join("")}</div>`
:`<div class="empty">ถังขยะว่าง — ยังไม่มีอะไรถูกลบ 🎉</div>`}
<div class="hint">ถ้าอยากได้สำเนาเก็บไว้นานกว่านี้ ใช้ <b>สำรองข้อมูลทั้งหมด (.json)</b> ที่แท็บนำเข้า CSV — ไฟล์สำรองไม่มีวันหมดอายุ</div></div>`;
}
function setImport(){
return `<div class="card"><h2>สำรองข้อมูล & กู้คืน <small>ลบไปแล้วกู้กลับได้ ถ้ามีไฟล์สำรอง</small></h2>
<div class="hint" style="margin-top:2px">ของที่กดลบจะพักใน<b>ถังขยะ ${TRASH_DAYS} วัน</b> (ตั้งค่า › ถังขยะ) ก่อนหายถาวร — ส่วนไฟล์สำรองเก็บได้ไม่มีวันหมดอายุ และกู้ได้แม้ลบถาวรไปแล้ว แนะนำกดสำรองสัปดาห์ละครั้ง หรือก่อนลบอะไรเป็นชุดใหญ่</div>
<div class="addg">
<button class="btn" id="bkdown">${svg(ICON.file,17)}สำรองข้อมูลทั้งหมด (.json)</button>
<input type="file" id="bkfile" accept=".json,application/json" style="background:var(--paper);padding:9px 14px">
<button class="btn ghost" id="bkgo">กู้คืนจากไฟล์</button></div>
<div id="bkout">${bkMsg}</div>
<div class="hint">ไฟล์สำรองมีครบทุกอย่าง: งาน · การเงิน · กฎหมาย · Index · บันทึก · บริษัท/กลุ่มงาน/ประเภทงาน/หมวด GL/ทะเบียนหลักสูตร/หมวดทักษะ/รูปแบบ · ตัวเลขกรมพัฒนาฯ · ธีมสี<br>
<b>กู้คืน = เติมกลับเท่านั้น</b> รายการที่หายไปจะกลับมา รายการที่มีอยู่แล้วจะถูกเขียนทับด้วยค่าในไฟล์ · ของใหม่ที่เพิ่มหลังวันสำรองจะไม่ถูกลบทิ้ง</div></div>
<div class="card" style="margin-top:16px"><h2>นำเข้างานจากไฟล์ CSV</h2>
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
• <b>สถานะ</b> ใช้ได้ 4 แบบ: รอดำเนินการ / กำลังดำเนินการ / เสร็จสิ้น / ยกเลิก (“อยู่ระหว่างดำเนินการ” ของเดิมถูกรวมเป็น “กำลังดำเนินการ” แล้ว)<br>
• <b>หมวด GL</b> ใส่ "รหัส ชื่อหมวด" หรือชื่อหมวดอย่างเดียวก็ได้ ถ้ายังไม่มีระบบจะสร้างให้<br>
• งานที่ใช้งบ 2 ก้อน ใส่ <b>หมวด GL รอง</b> กับ <b>งบรอง</b> เพิ่มได้ (เช่น BB-HR-CT กับ HR-LSC)<br>
• <b>ผู้เข้าอบรม / ชั่วโมง / วิทยากร/สถาบัน / กรมพัฒฯ</b> ใส่เฉพาะงานอบรม (กรมพัฒฯ ใช้ได้: ไม่ต้องยื่น / รอยื่น / ยื่นแล้ว / อนุมัติแล้ว / ไม่ผ่าน)<br>
• กลุ่มที่มีคำว่า "อบรม" ระบบจะนับเป็นงานฝึกอบรมให้อัตโนมัติ<br>
• งานเดิมจะไม่ถูกลบ ระบบเพิ่มต่อท้ายเสมอ<br>
• ถ้าหัวคอลัมน์แรกเป็น <b>ชื่อรายการ</b> ระบบจะถือว่าเป็นทะเบียนกฎหมาย/ใบรับรอง และนำเข้าไปที่เมนู “กฎหมาย” ให้เอง<br>
• ถ้ามีคอลัมน์ <b>สารบัญ</b> ระบบจะนำเข้าไปที่เมนู “Index Online” ให้เอง
</div></div>`;
}
async function verCheck(){
const box=el("verchk"); if(!box)return;
try{
 const r=await fetch("sw.js?v="+Date.now(),{cache:"no-store"}); const t=await r.text(); const m=t.match(/skywork-([\d.]+)/); if(!m){ box.textContent=""; return; }
 // อ่านเลขเวอร์ชันจากไฟล์ app.js จริงบนเซิร์ฟเวอร์ (เฉพาะส่วนหัว) — กันกรณีอัปโหลดขึ้น GitHub ไม่ครบ (sw.js ใหม่ แต่ app.js ยังเก่า)
 let av=""; try{ const ra=await fetch("app.js?c="+Date.now(),{cache:"no-store"}); const rd=ra.body&&ra.body.getReader?ra.body.getReader():null; let txt=""; if(rd){ const {value}=await rd.read(); try{ rd.cancel(); }catch(e){} txt=new TextDecoder().decode(value||new Uint8Array()); } else txt=(await ra.text()).slice(0,2000); const mv=txt.match(/APP_VERSION="([\d.]+)"/); av=mv?mv[1]:""; }catch(e){}
 if(av&&av!==m[1]){ box.innerHTML=`<span style="color:var(--over);font-weight:600">อัปโหลดขึ้น GitHub ไม่ครบ</span> — ไฟล์ <b>app.js</b> บนเซิร์ฟเวอร์ยังเป็น v${esc(av)} แต่ sw.js เป็น v${esc(m[1])}<br><span style="font-size:12.5px">ให้อัปไฟล์ <b>app.js</b> และ <b>index.html</b> (ที่อยู่ชั้นนอกสุดของซิป) ขึ้น GitHub ซ้ำอีกครั้ง รอ Vercel ขึ้น Ready แล้วค่อยรีเฟรช</span>`; return; }
 const sv=av||m[1], same=sv===APP_VERSION;
 box.innerHTML=same?`<span style="color:var(--ok);font-weight:600">✓ เป็นเวอร์ชันล่าสุดแล้ว</span> (เซิร์ฟเวอร์ v${esc(sv)})`:`<span style="color:var(--over);font-weight:600">มีเวอร์ชันใหม่ v${esc(sv)}</span> — กด “รีเฟรชเป็นเวอร์ชันล่าสุด” ได้เลยค่ะ`;
}catch(e){ box.textContent="ตรวจเวอร์ชันบนเซิร์ฟเวอร์ไม่ได้ (ออฟไลน์?)"; }
}
function setConnect(){
setTimeout(()=>{ verCheck(); const b=el("verRefresh"); if(b)b.onclick=hardRefresh; },60);
const ua=navigator.userAgent;
const isMobile=/iPhone|iPad|iPod|Android/i.test(ua);
const dev=isMobile?(/iPad/i.test(ua)?"แท็บเล็ต / iPad":"มือถือ"):"โน้ตบุ๊ก / คอมพิวเตอร์";
const os=/iPhone|iPad|iPod/i.test(ua)?"iOS":/Android/i.test(ua)?"Android":/Mac/i.test(ua)?"macOS":/Win/i.test(ua)?"Windows":"อื่นๆ";
const on=!!DB;
return `<div class="banner ${on?"ok":"bad"}">${svg(on?ICON.check:ICON.bell,19)}
${on?"เชื่อมต่อฐานข้อมูลสำเร็จ · ข้อมูลซิงก์อัตโนมัติทุกเครื่อง":"ยังเชื่อมต่อฐานข้อมูลไม่ได้ · ตอนนี้แก้ไขข้อมูลไม่ได้"}</div>
<div class="card verbox" style="margin-bottom:14px"><div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:space-between">
<div><div class="k" style="color:var(--ink-3);font-size:13px">เวอร์ชันแอปที่เครื่องนี้ใช้อยู่</div>
<div style="font-family:var(--head);font-size:30px;font-weight:600;line-height:1.2">v${APP_VERSION}</div>
<div class="t-note">อัปเดต ${APP_DATE} · ${dev}</div>
<div id="verchk" class="t-note" style="margin-top:6px">กำลังตรวจเวอร์ชันล่าสุดบนเซิร์ฟเวอร์…</div></div>
<button class="btn" id="verRefresh">รีเฟรชเป็นเวอร์ชันล่าสุด</button></div></div>
<div id="health"></div>
<div class="dash">
<div class="card stat"${tipAttr("เครื่องที่ใช้อยู่ · "+dev,"ระบบ|"+os,"หน้าจอ|"+innerWidth+"×"+innerHeight)}><div class="k"><span class="ic">${svg(isMobile?ICON.phone:ICON.laptop,16)}</span> เครื่องที่ใช้อยู่</div>
<div class="v" style="font-size:19px">${dev}</div><div class="d">ระบบ ${os} · หน้าจอ ${innerWidth}×${innerHeight}</div></div>
<div class="card stat"${tipAttr("สถานะซิงก์ · "+(on?"ออนไลน์":"ออฟไลน์"),on?"บันทึกแล้วเห็นทุกเครื่องทันที":"ตรวจการเชื่อมต่ออินเทอร์เน็ต")}><div class="k"><span class="ic">${svg(ICON.link,16)}</span> สถานะซิงก์</div>
<div class="v" style="font-size:19px;color:${on?"var(--ok)":"var(--over)"}">${on?"ออนไลน์":"ออฟไลน์"}</div>
<div class="d">${on?"บันทึกแล้วเห็นทุกเครื่องทันที":"ตรวจการเชื่อมต่ออินเทอร์เน็ต"}</div></div>
<div class="card stat"${tipAttr("เวอร์ชันแอป · "+APP_VERSION,"อัปเดต|"+APP_DATE)}><div class="k"><span class="ic">${svg(ICON.check,16)}</span> เวอร์ชันแอป</div>
<div class="v" style="font-size:19px">${APP_VERSION}</div><div class="d">อัปเดต ${APP_DATE}</div></div>
<div class="card stat"${tipAttr("ข้อมูลบนเซิร์ฟเวอร์","งาน|"+items.length,"รายการเงิน|"+ledger.length,"กลุ่มงาน|"+groups.length,"หมวด GL|"+gls.length,"บริษัท|"+companies.length)}><div class="k"><span class="ic">${svg(ICON.file,16)}</span> ข้อมูลบนเซิร์ฟเวอร์</div>
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
// ---------- สำรองข้อมูล: สร้างไฟล์ / ดาวน์โหลด / ตัวเตือนรายสัปดาห์ ----------
function bkPack(){
const strip=a=>a.map(x=>{const o=Object.assign({},x); const id=o._id; delete o._id; return {id,data:o};});
return {app:"sky-work",version:APP_VERSION,at:new Date().toISOString(),
items:strip(items),ledger:strip(ledger),legal:strip(legal),index:strip(idx),note:strip(notes),
meta:{groups,companies,gl:gls,types:typeDefs(),tags:tagDefs(),courses,skills:skills(),modes:modes(),idxcats:idxCats,nfolders:noteFolders,tpls,
hr:{manpower:hrdata.manpower,certified:hrdata.certified,dsd:hrdata.dsd,subsidy:hrdata.subsidy},theme}};
}
function bkDownload(){
const pack=bkPack(), a=document.createElement("a");
a.href=URL.createObjectURL(new Blob([JSON.stringify(pack,null,1)],{type:"application/json"}));
a.download="sky-work-backup-"+isoOf(new Date())+".json"; document.body.appendChild(a); a.click();
setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},900);
bkAt=pack.at; try{ localStorage.removeItem("sw-bksnooze"); }catch(e){}
saveMeta("bk",[{at:pack.at}]);
return pack;
}
const BK_DAYS=7;
function bkDaysAgo(){ if(!bkAt)return null; const d=Math.floor((Date.now()-new Date(bkAt).getTime())/864e5); return isNaN(d)?null:d; }
function bkBanner(){
if(items.length+notes.length<5)return "";
const ago=bkDaysAgo(); if(ago!==null&&ago<BK_DAYS)return "";
try{ const sn=localStorage.getItem("sw-bksnooze"); if(sn&&sn>isoOf(new Date()))return ""; }catch(e){}
return `<div class="banner bkb">${svg(ICON.file,19)} <span>${ago===null?"ยังไม่เคย<b>สำรองข้อมูล</b>เลย":"ไม่ได้<b>สำรองข้อมูล</b>มา <b>"+ago+" วัน</b>แล้ว"} — ข้อมูลอยู่ที่เดียว กดสำรองไว้อุ่นใจ (ได้ไฟล์ .json เก็บเอง)</span>
<span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="bkNow">สำรองเลย</button><button class="btn ghost sm" id="bkLater">เตือนพรุ่งนี้</button></span></div>`;
}
function wire(){
el("pushOn")&&(el("pushOn").onclick=pushOn); el("pushOff")&&(el("pushOff").onclick=pushOff);
el("pushTest")&&(el("pushTest").onclick=()=>pushCall("test")); el("pushDigest")&&(el("pushDigest").onclick=()=>pushCall("digest"));
el("pushGen")&&(el("pushGen").onclick=pushGenKeys); el("pushPing")&&(el("pushPing").onclick=pushPing);
el("pushCopy")&&(el("pushCopy").onclick=async()=>{ try{ await navigator.clipboard.writeText(el("pushKeys").innerText); setFoot("คัดลอกคีย์แล้ว"); }catch(e){ setFoot("คัดลอกไม่ได้ — ลากเลือกข้อความเอง"); } });
document.querySelectorAll("[data-gapf]").forEach(b=>b.onclick=()=>{ R.gapF=b.dataset.gapf===R.gapF?"":b.dataset.gapf; render(); });
if(el("gapAI"))el("gapAI").onclick=()=>{ AI.open=false; aiGo("ai"); aiSend("/5w1h"); };
if(el("bkNow"))el("bkNow").onclick=()=>{ const p=bkDownload(); setFoot("สำรองแล้ว "+(p.items.length+p.ledger.length+p.legal.length+p.index.length+p.note.length)+" รายการ"); render(); };
if(el("bkLater"))el("bkLater").onclick=()=>{ const d=new Date(); d.setDate(d.getDate()+1); try{ localStorage.setItem("sw-bksnooze",isoOf(d)); }catch(e){} render(); };
document.querySelectorAll("[data-go]").forEach(n=>{n.style.cursor="pointer";
n.onclick=e=>{e.stopPropagation();
try{const d=JSON.parse(n.dataset.go);
 if(d.id){const t=items.find(x=>x._id===d.id); if(t){openCard(t);return;}}
 if(d.lg){const L=legal.find(x=>x._id===d.lg); if(L){openLegalCard(L);return;}}
 goTo(d.v,{F:d.F,R:d.R});}catch(err){}};});
document.querySelectorAll("[data-list]").forEach(n=>{n.style.cursor="pointer";
n.onclick=e=>{e.stopPropagation();openListBox(n.dataset.list);};});
el("pclose")&&(el("pclose").onclick=()=>el("pdlg").close());
document.querySelectorAll("[data-skipnow]").forEach(b=>b.onclick=async e=>{
e.stopPropagation();
const [id,iso]=b.dataset.skipnow.split("|");
const t=items.find(x=>x._id===id); if(!t)return;
const skip=[...(t.skip||[])];
const i=skip.indexOf(iso); if(i>=0)skip.splice(i,1); else skip.push(iso);
const {_id,...rest}=t;
try{ await saveItem({...rest,skip},_id); setFoot(i>=0?"กลับมาจัดรอบนี้ตามเดิม":"งดรอบ "+iso+" แล้ว รอบอื่นไม่กระทบ"); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); }
});
document.querySelectorAll("[data-done]").forEach(b=>b.onclick=async e=>{
e.stopPropagation();
const [id,iso]=b.dataset.done.split("|");
const t=items.find(x=>x._id===id); if(!t)return;
const patchD=occPatch(t,iso,occStat(t,isoDate(iso))===STATUS_DONE?"รอดำเนินการ":STATUS_DONE);
const {_id,...rest}=t;
try{ await saveItem({...rest,...patchD},_id); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); }
});
el("add")&&(el("add").onclick=()=>openPick());
el("addTx")&&(el("addTx").onclick=()=>openTx(null));
el("addLegal")&&(el("addLegal").onclick=()=>openLegal(null));
el("addIdx")&&(el("addIdx").onclick=()=>openIdx(null));
document.querySelectorAll("[data-mx]").forEach(n=>n.onclick=e=>{
const qm=e.target.closest("[data-qm]");
if(qm){ e.stopPropagation(); const [id,q]=qm.dataset.qm.split(":"); DB.collection("items").doc(id).set({quad:q||""},{merge:true}).catch(err=>{const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>");}); return; }
const t=items.find(v=>v._id===n.dataset.mx); if(t)openCard(t);});
el("addNote")&&(el("addNote").onclick=()=>openNote(null));
document.querySelectorAll("[data-ix]").forEach(n=>n.onclick=e=>{
if(e.target.closest("[data-stop]"))return;
const x=idx.find(v=>v._id===n.dataset.ix); if(x)openIdxCard(x);});
el("addInk")&&(el("addInk").onclick=()=>inkGallery("new"));
el("addBoard")&&(el("addBoard").onclick=()=>inkNew({mode:"board"}));
noteFolderWire();
document.querySelectorAll("[data-nt]").forEach(n=>n.onclick=e=>{
const x=notes.find(v=>v._id===n.dataset.nt); if(!x)return;
if(x.kind===INKKIND){ inkOpen(x); return; }
if(e.target.closest("[data-ntedit]")){ openNote(x); return; }
viewNote(x);});
el("ix-q")&&(el("ix-q").oninput=e=>{const v=e.target.value,p=e.target.selectionStart;R.idxQ=v;render();const m=el("ix-q"); if(m){m.focus();m.setSelectionRange(p,p);}});
el("ix-sort")&&(el("ix-sort").onclick=()=>{ R.idxSort=!R.idxSort; render(); });
document.querySelectorAll("[data-ixfav]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); ixToggleFav(b.dataset.ixfav); });
document.querySelectorAll("[data-ixmv]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const [id,d]=b.dataset.ixmv.split(":"); ixMove("c",id,d); });
document.querySelectorAll("[data-ixfmv]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); const [id,d]=b.dataset.ixfmv.split(":"); ixMove("f",id,d); });
ixDnd();
el("ix-collapse")&&(el("ix-collapse").onclick=()=>{ IDXFOLD=new Set([...idxCatNames(),IDX_NONE]); idxSaveFold(); render(); });
el("ix-expand")&&(el("ix-expand").onclick=()=>{ IDXFOLD=new Set(); idxSaveFold(); render(); });
el("ix-cats")&&(el("ix-cats").onclick=openIxCats);
document.querySelectorAll("[data-ixfold]").forEach(b=>b.onclick=()=>{ const k=b.dataset.ixfold; IDXFOLD.has(k)?IDXFOLD.delete(k):IDXFOLD.add(k); idxSaveFold(); render(); });
el("ix-status")&&(el("ix-status").onchange=e=>{R.idxStatus=e.target.value;render();});
el("nt-kind")&&(el("nt-kind").onchange=e=>{R.noteKind=e.target.value;render();});
el("pq")&&(el("pq").oninput=e=>{const v=e.target.value,p2=e.target.selectionStart;R.pq=v;render();
const m=el("pq"); if(m){m.focus();m.setSelectionRange(p2,p2);}});
el("nt-q")&&(el("nt-q").oninput=e=>{const v=e.target.value,p=e.target.selectionStart;R.noteQ=v;render();
const m=el("nt-q"); if(m){m.focus();m.setSelectionRange(p,p);}});
document.querySelectorAll("[data-lg]").forEach(n=>n.onclick=()=>{
const L=legal.find(x=>x._id===n.dataset.lg); if(L)openLegalCard(L);});
el("lg-comp")&&(el("lg-comp").onchange=e=>{R.legalComp=e.target.value;
const inCo=legal.filter(L=>!R.legalComp||(L.comps||[]).includes(R.legalComp));
if(R.legalCat&&!inCo.some(L=>L.cat===R.legalCat))R.legalCat="";
render();});
el("lg-cat")&&(el("lg-cat").onchange=e=>{R.legalCat=e.target.value;render();});
document.querySelectorAll("[data-id]").forEach(n=>{ if(n.dataset.nolink)return; n.onclick=()=>{
const t=items.find(x=>x._id===n.dataset.id); if(t)openCard(t,n.dataset.occ||"");};});
document.querySelectorAll("[data-tx]").forEach(n=>n.onclick=()=>{
const t=ledger.find(x=>x._id===n.dataset.tx); if(t)openTxCard(t);});
const sc=el("sc1");
if(sc){sc.onclick=e=>{const b=e.target.closest("button[data-sc]");if(!b)return;R.scope=b.dataset.sc;render();};
el("scMonth")&&(el("scMonth").onchange=e=>{R.month=+e.target.value;render();});}
["yrSel","yrSel2","yrSelB"].forEach(id=>{const n=el(id); if(n)n.onchange=e=>{R.year=+e.target.value;R.selDay=null;render();};});
document.querySelectorAll("[data-yr]").forEach(b=>b.onclick=()=>{
const d=+b.dataset.yr; R.year=d?Math.min(2199,Math.max(1900,R.year+d)):THISYEAR; R.selDay=null; render();});
const bs=el("budsc");
if(bs){bs.onclick=e=>{const b=e.target.closest("button[data-bs]");if(!b)return;R.budScope=b.dataset.bs;render();};
el("budMonth")&&(el("budMonth").onchange=e=>{R.budMonth=+e.target.value;render();});}
el("goNoDate")&&(el("goNoDate").onclick=()=>{
LISTBOX["noDate"]={title:"งานที่ยังไม่ได้ใส่วันที่หรือรอบซ้ำ",rows:items.filter(t=>!isSysRow(t)&&!monthsOf(t).length).map(t=>({
id:t._id,t1:t.title,t2:`${gLabel(t.track)}${t.company?" · "+cLabel(t.company):""}${t.owner?" · "+t.owner:""}`,
d:"—",p:t.status,pc:sCls(t.status)}))};
openListBox("noDate");});
el("calcol")&&(el("calcol").onclick=e=>{const b=e.target.closest("button[data-cc]");if(!b)return; try{localStorage.setItem("sw-calcolor",b.dataset.cc);}catch(err){} render();});
el("calmode")&&(el("calmode").onclick=e=>{const b=e.target.closest("button[data-cm]");if(!b)return;R.calMode=b.dataset.cm;R.selDay=null;render();});
el("calMonth")&&(el("calMonth").onchange=e=>{R.month=+e.target.value;R.selDay=null;render();});
el("pm")&&(el("pm").onclick=()=>{R.month=(R.month+11)%12;R.selDay=null;render();});
el("nm")&&(el("nm").onclick=()=>{R.month=(R.month+1)%12;R.selDay=null;render();});
el("clearDay")&&(el("clearDay").onclick=()=>{R.selDay=null;render();});
el("addOnDay")&&(el("addOnDay").onclick=()=>openPick());
if(el("addtag")){
el("addtag").onclick=async()=>{const v=el("newtag").value.trim();
if(!v){tell("ใส่ชื่อป้ายก่อนนะคะ");return;}
if(tagsOf().includes(v)){tell("มีป้ายนี้แล้วค่ะ");return;}
tagList=[...tagDefs(),{name:v,color:"",track:(el("newtagg")?el("newtagg").value:"")}]; el("newtag").value=""; render(); await saveMeta("tags",tagList);};}
el("fixcolor")&&(el("fixcolor").onclick=async()=>{
const list=items.filter(t=>t.color&&t.track&&gColor(t.track)&&t.color!==gColor(t.track));
if(!list.length)return;
if(!await ask(`ล้างสีเฉพาะตัวของ <b>${list.length}</b> งาน ให้กลับไปใช้สีของกลุ่มงาน ใช่ไหมคะ?<div style="font-size:13px;margin-top:8px">ข้อมูลอื่นไม่เปลี่ยน · ถ้าอยากให้งานไหนสีต่างจากกลุ่ม ตั้งใหม่ทีหลังได้</div>`,"ใช้สีตามกลุ่ม"))return;
let ok=0;
for(const t of list){ try{ const {_id,...r}=t; await saveItem(Object.assign({},r,{color:""}),_id); ok++; }catch(e){}
setFoot("กำลังปรับสี "+ok+"/"+list.length+" …"); }
render(); tell("<b>ปรับแล้ว "+ok+" งาน</b> ตอนนี้สีในปฏิทินตรงกับกลุ่มงานทั้งหมด");});
document.querySelectorAll("[data-gcol]").forEach(b=>b.onclick=async()=>{
const [k,c]=b.dataset.gcol.split("|");
const g=groups.find(x=>x.key===k); if(!g)return;
g.color=c; render(); await saveMeta("groups",groups);});
document.querySelectorAll("[data-tagtrack]").forEach(n=>n.onchange=async()=>{
const nm=n.dataset.tagtrack;
tagList=tagDefs().map(x=>x.name===nm?{name:x.name,color:x.color,track:n.value}:x);
render(); await saveMeta("tags",tagList);});

document.querySelectorAll("[data-rentag]").forEach(n=>n.onchange=async()=>{
const from=n.dataset.rentag, to=n.value.trim();
if(!to||to===from||!tagsOf().includes(from)||renameLock){render();return;}
if(tagsOf().includes(to)){tell("มีป้าย “"+esc(to)+"” อยู่แล้วค่ะ");render();return;}
renameLock=true; setTimeout(()=>renameLock=false,800);
tagList=tagDefs().map(x=>x.name===from?{name:to,color:x.color,track:x.track}:x);
await saveMeta("tags",tagList);
const list=items.filter(t=>(t.tag||"").trim()===from);
for(const t of list){try{const {_id,...rest}=t; await saveItem(Object.assign({},rest,{tag:to}),_id);}catch(e){}}
render(); setFoot("เปลี่ยนชื่อป้ายและอัปเดต "+list.length+" งานแล้ว");});
document.querySelectorAll("[data-deltag]").forEach(b=>b.onclick=async()=>{
const nm=b.dataset.deltag, n=tagUsed(nm);
if(!await ask("ลบป้าย “"+esc(nm)+"”"+(n?` — ป้ายจะหายจาก <b>${n}</b> งานด้วย`:"")+" ใช่ไหมคะ?","ลบป้าย"))return;
tagList=tagDefs().filter(x=>x.name!==nm); await saveMeta("tags",tagList);
const list=items.filter(t=>(t.tag||"").trim()===nm);
for(const t of list){try{const {_id,...rest}=t; await saveItem(Object.assign({},rest,{tag:""}),_id);}catch(e){}}
render();});
document.querySelectorAll("[data-day]").forEach(n=>n.onclick=()=>{
const d=+n.dataset.day; R.selDay=R.selDay===d?null:d; render();});
document.querySelectorAll("[data-restore]").forEach(b=>b.onclick=async()=>{
const [coll,id]=b.dataset.restore.split(":");
const t=(TRASH[coll]||[]).find(x=>x._id===id); if(!t)return;
await trashRestore(coll,t); render();});
document.querySelectorAll("[data-purge]").forEach(b=>b.onclick=async()=>{
const [coll,id]=b.dataset.purge.split(":");
const t=(TRASH[coll]||[]).find(x=>x._id===id); if(!t)return;
if(!await ask("ลบ “"+esc(trashTitle(coll,t))+"” <b>ถาวร</b> ใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--over)\">กู้กลับไม่ได้อีกแล้ว</div>","ลบถาวร"))return;
await trashPurge(coll,id); render();});
if(el("trashEmpty"))el("trashEmpty").onclick=async()=>{
const all=trashAll();
if(!await ask("ล้างถังขยะทั้งหมด <b>"+all.length+"</b> รายการ ใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--over)\">กู้กลับไม่ได้อีกแล้ว</div>","ล้างถังขยะ"))return;
let n=0; for(const {coll,t} of all){ try{ await trashPurge(coll,t._id); n++; setFoot("กำลังล้าง "+n+"/"+all.length+" …"); }catch(e){} }
render(); setFoot("ล้างถังขยะแล้ว "+n+" รายการ");};
el("settabs")&&(el("settabs").onclick=e=>{const b=e.target.closest("button[data-st]");if(!b)return;settab=b.dataset.st;healthState="idle";R.pq="";render();});
const bind=(id,key)=>{const n=el(id);if(!n)return;n.oninput=n.onchange=()=>{
F[key]=n.value;const p=n.selectionStart,srch=n.type==="search";render();
const m=el(id);if(m&&srch){m.focus();m.setSelectionRange(p,p);}};};
el("fl-track")&&(el("fl-track").addEventListener("change",()=>{
const v=el("fl-track").value;
if(F.type&&v&&!typesFor(v).includes(F.type)&&!items.some(t=>t.track===v&&(t.type||"")===F.type))F.type="";
}));
el("grpseg")&&(el("grpseg").onclick=e=>{const b=e.target.closest("button[data-grp]"); if(!b)return;
F.grp=b.dataset.grp; render();});
bind("q","q");bind("fl-track","track");bind("fl-type","type");bind("fl-status","status");bind("fl-company","company");
if(view==="ai")aiWire();
el("hlseg")&&(el("hlseg").onclick=e=>{const b=e.target.closest("button[data-hl]"); if(!b)return; setHL(b.dataset.hl); render();});
el("zoomseg")&&(el("zoomseg").onclick=e=>{const b=e.target.closest("button[data-zm]"); if(!b)return; setZoom(b.dataset.zm); render();});
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
F.q="";F.track="";F.type="";F.status="";F.company="";
if(k==="tag"||k==="crs")F.q=v; else F[k]=v;
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
let renameLock=false;
async function retagType(from,to){
const list=items.filter(t=>(t.type||"")===from);
let ok=0,fail=0,err=null;
for(const t of list){
try{ const {_id,...rest}=t; await saveItem(Object.assign({},rest,{type:to}),_id); ok++; }catch(e){ fail++; if(!err)err=e; }
setFoot("กำลังย้าย "+ok+"/"+list.length+" …");}
return {ok,fail,err,n:list.length};
}
async function saveTypes(){ await saveMeta("types",types()); }
el("crslink")&&(el("crslink").onclick=async()=>{
const un=items.filter(t=>isTrain(t)&&!t.course&&crsByName(t.title));
if(!un.length)return;
if(!await ask(`ผูกรหัสหลักสูตรให้ <b>${un.length}</b> รายการที่ชื่อตรงกับทะเบียน ใช่ไหมคะ?<div style="font-size:13px;margin-top:8px">ระบบจะเติมเฉพาะช่องรหัสหลักสูตร ไม่แก้ข้อมูลอื่น</div>`,"ผูกรหัส"))return;
let ok=0;
for(const t of un){ const c=crsByName(t.title); if(!c)continue;
try{ const {_id,...r}=t; await saveItem(Object.assign({},r,{course:c.code,code:t.code||c.code}),_id); ok++; }catch(e){}
setFoot("กำลังผูก "+ok+"/"+un.length+" …"); }
render(); tell("<b>ผูกรหัสแล้ว "+ok+" รายการ</b>");});
if(el("addcrs")){
el("addcrs").onclick=async()=>{
const nm=el("newcrs").value.trim(); if(!nm){tell("ใส่ชื่อหลักสูตรก่อนนะคะ");return;}
if(courses.some(c=>c.name===nm)){tell("มีหลักสูตรชื่อนี้แล้วค่ะ — ถ้าเป็นรุ่นใหม่ ให้ไปเพิ่มงานอบรมแล้วเลือกหลักสูตรนี้แทน");return;}
courses=[...courses,{code:nextCourseCode(),name:nm,skill:(el("newcrssk")?el("newcrssk").value:"")||"",mode:"",hours:0}];
el("newcrs").value=""; render(); await saveMeta("courses",courses);};}
// ค้นหา / ย่อ-ขยาย หมวดในทะเบียนหลักสูตร
const cf=el("crsfind");
if(cf){const run=()=>{const q=cf.value.trim().toLowerCase();
document.querySelectorAll("[data-crssec]").forEach(sec=>{let hit=0;
sec.querySelectorAll("[data-crsname]").forEach(r=>{const ok=!q||r.dataset.crsname.includes(q); r.hidden=!ok; if(ok)hit++;});
sec.hidden=!!q&&!hit; if(q&&hit)sec.open=true;});};
cf.oninput=()=>{crsQ=cf.value; run();}; if(crsQ)run();}
if(el("crsexp"))el("crsexp").onclick=()=>document.querySelectorAll("[data-crssec]").forEach(x=>{x.open=true;crsShut[x.dataset.crssec]=0;});
if(el("crscol"))el("crscol").onclick=()=>document.querySelectorAll("[data-crssec]").forEach(x=>{x.open=false;crsShut[x.dataset.crssec]=1;});
document.querySelectorAll("[data-crssec]").forEach(x=>x.addEventListener("toggle",()=>{crsShut[x.dataset.crssec]=x.open?0:1;}));
document.querySelectorAll("[data-mvc]").forEach(b=>b.onclick=async()=>{
const [i,t]=b.dataset.mvc.split(":").map(Number);
if(t<0||t>=courses.length||i<0||i>=courses.length)return;
const tmp=courses[i]; courses[i]=courses[t]; courses[t]=tmp;
render(); await saveMeta("courses",courses);});
// ทะเบียนหมวดทักษะ / รูปแบบการอบรม
const saveL=async(kind,arr)=>{ if(kind==="sk"){skillList=arr; await saveMeta("skills",arr);} else {modeList=arr; await saveMeta("modes",arr);} };
[["sk",skills,"skill"],["md",modes,"mode"]].forEach(([kind,getter,field])=>{
const addBtn=el("add"+kind), inp=el("new"+kind);
if(addBtn)addBtn.onclick=async()=>{const v=(inp.value||"").trim();
if(!v){tell("พิมพ์ชื่อก่อนนะคะ");return;}
if(getter().includes(v)){tell("มีรายการนี้อยู่แล้วค่ะ");return;}
const arr=[...getter(),v]; inp.value=""; render(); await saveL(kind,arr);};
document.querySelectorAll("[data-ren"+kind+"]").forEach(n=>n.onchange=async()=>{
const from=n.dataset["ren"+kind], to=n.value.trim();
if(!to||to===from){render();return;}
if(getter().includes(to)){tell("มีรายการ “"+esc(to)+"” อยู่แล้วค่ะ");render();return;}
const arr=getter().map(x=>x===from?to:x);
await saveL(kind,arr);
let ok=0; const targets=[...courses.filter(c=>(c[field]||"")===from),...items.filter(t=>(t[field]||"")===from)];
for(const c of courses)if((c[field]||"")===from)c[field]=to;
await saveMeta("courses",courses);
for(const t of items.filter(t=>(t[field]||"")===from)){
try{ await DB.collection("items").doc(t._id).set({[field]:to},{merge:true}); ok++; }catch(e){}}
render(); setFoot("เปลี่ยนชื่อและอัปเดต "+(targets.length)+" รายการแล้ว");});
document.querySelectorAll("[data-del"+kind+"]").forEach(b=>b.onclick=async()=>{
const nm=b.dataset["del"+kind];
const n=kind==="sk"?skillUsed(nm):modeUsed(nm);
if(n&&!await ask("“"+esc(nm)+"” มี <b>"+n+"</b> รายการใช้อยู่ค่ะ ลบออกจากทะเบียนแล้วชื่อนี้จะยังติดอยู่กับข้อมูลเดิม (และจะโผล่ในทะเบียนอีกครั้งอัตโนมัติ) — ลบต่อไหมคะ?","ลบรายการ"))return;
const arr=getter().filter(x=>x!==nm); render(); await saveL(kind,arr);});});
document.querySelectorAll("[data-mvl]").forEach(b=>b.onclick=async()=>{
const [kind,i,d]=b.dataset.mvl.split(":"); const arr=kind==="sk"?skills():modes();
const a=+i,t=a+(+d); if(t<0||t>=arr.length)return;
const tmp=arr[a]; arr[a]=arr[t]; arr[t]=tmp;
render(); await saveL(kind,arr);});
document.querySelectorAll("[data-crsopen]").forEach(b2=>b2.onclick=()=>openCrs(b2.dataset.crsopen));
document.querySelectorAll("[data-rencrs]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.rencrs), v=n.value.trim(); if(!c||!v){render();return;}
c.name=v; render(); await saveMeta("courses",courses);});
document.querySelectorAll("[data-crsskill]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crsskill); if(!c)return; c.skill=n.value; await saveMeta("courses",courses);});
document.querySelectorAll("[data-crsmode]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crsmode); if(!c)return; c.mode=n.value; await saveMeta("courses",courses);});
document.querySelectorAll("[data-crshr]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crshr); if(!c)return; c.hours=+n.value||0; await saveMeta("courses",courses);});
document.querySelectorAll("[data-crslaw]").forEach(n=>n.onchange=async()=>{
const c=crsOf(n.dataset.crslaw); if(!c)return;
if(n.value==="")delete c.law; else c.law=n.value==="1";
render(); await saveMeta("courses",courses);
setFoot(c.law===true?"“"+c.name+"” ตั้งเป็นบังคับตามกฎหมายแล้ว":c.law===false?"“"+c.name+"” ตั้งเป็นไม่บังคับแล้ว":"“"+c.name+"” กลับไปใช้ค่าตามประเภทงาน");});
document.querySelectorAll("[data-delcrs]").forEach(b=>b.onclick=async()=>{
const code=b.dataset.delcrs, n=crsBatches(code).length;
if(n){tell("หลักสูตรนี้มี <b>"+n+"</b> รุ่นผูกอยู่ค่ะ ลบหรือย้ายรุ่นก่อนนะคะ");return;}
if(!await ask("ลบหลักสูตร “"+esc(crsLabel(code))+"” ใช่ไหมคะ?","ลบหลักสูตร"))return;
courses=courses.filter(c=>c.code!==code); render(); await saveMeta("courses",courses);});
if(el("addt")){
el("addt").onclick=async()=>{
const v=el("newt").value.trim(); if(!v){tell("ใส่ชื่อประเภทก่อนนะคะ");return;}
if(types().includes(v)){tell("มีประเภทนี้แล้วค่ะ");return;}
typeList=[...typeDefs(),{name:v,track:el("newtg").value||"",law:el("newtlaw")&&el("newtlaw").checked}]; el("newt").value=""; render(); await saveMeta("types",typeList);};
}
document.querySelectorAll("[data-rent]").forEach(n=>n.onchange=async()=>{
const from=n.dataset.rent, to=n.value.trim();
if(!to||to===from){render();return;}
if(!types().includes(from)||renameLock){render();return;}   // เปลี่ยนไปแล้ว / event ซ้ำ — ไม่ต้องเตือน
renameLock=true; setTimeout(()=>renameLock=false,800);
if(types().includes(to)){tell("มีประเภท “"+esc(to)+"” อยู่แล้วค่ะ ถ้าต้องการรวมเข้าด้วยกันให้ใช้ปุ่มย้ายงานแทน");render();return;}
const used=typeUsed(from);
typeList=typeDefs().map(x=>x.name===from?{name:to,track:x.track,law:x.law}:x);
await saveMeta("types",typeList);
if(used){const r=await retagType(from,to);
render();
if(r.fail)tell("<b>เปลี่ยนชื่อแล้ว แต่ย้ายงานได้ "+r.ok+"/"+r.n+"</b>"+errBox(r.err));
else setFoot("เปลี่ยนชื่อประเภทและอัปเดต "+r.ok+" งานแล้ว");}
else render();});
document.querySelectorAll("[data-movet]").forEach(b=>b.onclick=async()=>{
const from=b.dataset.movet, n=typeUsed(from);
if(!n){tell("ไม่มีงานให้ย้ายค่ะ");return;}
const opts=types().filter(x=>x!==from).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")+`<option value="">— ไม่ระบุประเภท —</option>`;
const to=await askPick(`ย้ายงานทั้งหมด <b>${n}</b> รายการ จากประเภท “${esc(from)}” ไปที่`,opts,"ย้ายงาน");
if(to===null)return;
const r=await retagType(from,to); render();
if(r.fail)tell("<b>ย้ายได้ "+r.ok+" · ไม่สำเร็จ "+r.fail+"</b>"+errBox(r.err));
else tell("<b>ย้ายเรียบร้อย "+r.ok+" รายการ</b>");});
document.querySelectorAll("[data-delt]").forEach(b=>b.onclick=async()=>{
const x=b.dataset.delt, n=typeUsed(x);
if(n){tell("ประเภทนี้มี <b>"+n+"</b> งานใช้อยู่ค่ะ กดปุ่มย้ายงานไปประเภทอื่นก่อนนะคะ");return;}
if(!await ask("ลบประเภท “"+esc(x)+"” ใช่ไหมคะ?","ลบประเภท"))return;
typeList=typeDefs().filter(y=>y.name!==x); render(); await saveMeta("types",typeList);});
document.querySelectorAll("[data-trt]").forEach(n=>n.onchange=async()=>{
const nm=n.dataset.trt;
typeList=typeDefs().map(x=>x.name===nm?{name:x.name,track:n.value,law:x.law}:x);
render(); await saveMeta("types",typeList);});
document.querySelectorAll("[data-tlaw]").forEach(b=>b.onclick=async()=>{
const nm=b.dataset.tlaw;
typeList=typeDefs().map(x=>x.name===nm?{name:x.name,track:x.track,law:!x.law}:x);
render(); await saveMeta("types",typeList);
setFoot(typeDef(nm)&&typeDef(nm).law?"ตั้ง “"+nm+"” เป็นงานบังคับตามกฎหมายแล้ว":"ยกเลิกสถานะบังคับตามกฎหมายของ “"+nm+"” แล้ว");});
document.querySelectorAll("[data-mvt]").forEach(b=>b.onclick=async()=>{
const [i,t]=b.dataset.mvt.split(":").map(Number);
const arr=typeDefs(); if(t<0||t>=arr.length||i<0||i>=arr.length)return;
const tmp=arr[i]; arr[i]=arr[t]; arr[t]=tmp;
typeList=arr; render(); await saveMeta("types",typeList);});
const tyf=el("tyfind");
if(tyf){const run=()=>{const q=tyf.value.trim().toLowerCase();
document.querySelectorAll("[data-tysec]").forEach(s=>{
let hit=0; s.querySelectorAll("[data-tyname]").forEach(r=>{
const ok=!q||r.dataset.tyname.includes(q); r.hidden=!ok; if(ok)hit++;});
s.hidden=!!q&&!hit; if(q&&hit)s.open=true;});};
tyf.oninput=()=>{tyQ=tyf.value; run();}; if(tyQ)run();}
const tyx=el("tyexp"), tyc=el("tycol");
if(tyx)tyx.onclick=()=>document.querySelectorAll("[data-tysec]").forEach(s=>{s.open=true;tyShut[s.dataset.tysec]=0;});
if(tyc)tyc.onclick=()=>document.querySelectorAll("[data-tysec]").forEach(s=>{s.open=false;tyShut[s.dataset.tysec]=1;});
document.querySelectorAll("[data-tysec]").forEach(s=>s.addEventListener("toggle",()=>{tyShut[s.dataset.tysec]=s.open?0:1;}));
document.querySelectorAll("[data-mv]").forEach(b=>b.onclick=async()=>{
const [kind,i,d]=b.dataset.mv.split(":"); const arr=kind==="groups"?groups:kind==="companies"?companies:kind==="courses"?courses:gls;
const a=+i, t=a+(+d); if(t<0||t>=arr.length)return;
const tmp=arr[a]; arr[a]=arr[t]; arr[t]=tmp;
render(); await saveMeta(kind==="gl"?"gl":kind,arr);});
document.querySelectorAll("[data-hide]").forEach(b=>b.onclick=async()=>{
const [kind,i]=b.dataset.hide.split(":"); const arr=kind==="groups"?groups:kind==="companies"?companies:kind==="courses"?courses:gls;
const o=arr[+i]; if(!o)return; o.hidden=!o.hidden;
render(); await saveMeta(kind==="gl"?"gl":kind,arr);});
document.querySelectorAll("[data-pal]").forEach(b=>b.onclick=()=>setTheme({preset:b.dataset.pal,custom:theme.custom}));
if(el("useCustom")){
function paintMixPrev(){
if(!el("mixprev"))return;
const c=[0,1,2,3,4].map(i=>el("cc"+i).value);
const S=(id,k,v)=>{const n=el(id); if(n)n.style[k]=v;};
el("mixprev").style.background=mix(c[0],"#ffffff",.55);
S("mp-card","background","#ffffff");
S("mp-card","boxShadow","0 6px 20px -10px rgba(18,58,94,.28)");
S("mp-h","color",mix(c[4],"#0b1a2a",.12));
S("mp-s","color",mix(c[2],c[3],.3));
S("mp-chip","background",mix(c[1],"#ffffff",.4)); S("mp-chip","color",c[4]);
S("mp-btn","background","linear-gradient(135deg,"+(lum(c[3])<.62?c[3]:c[4])+","+c[4]+")");
S("mp-in","background",mix(c[0],"#ffffff",.55)); S("mp-in","boxShadow","inset 0 0 0 2px "+c[3]);
S("mp-in","color",mix(c[4],"#0b1a2a",.12));}
[0,1,2,3,4].forEach(i=>{const n=el("cc"+i); if(n)n.oninput=paintMixPrev;});
paintMixPrev();
el("useCustom").onclick=()=>setTheme({preset:"custom",custom:[0,1,2,3,4].map(i=>el("cc"+i).value)});
el("fromCur").onclick=()=>{const p=PALETTES.find(x=>x.key===theme.preset);
(p?p.ramp:(theme.custom||PALETTES[0].ramp)).forEach((c,i)=>el("cc"+i).value=c); paintMixPrev();};
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
let key=(dept?dept+"|":"")+(code||label.slice(0,18));
if(gls.some(g=>(g.dept||"")===dept&&(g.code||"")===code&&g.label===(label||code))){
tell("มีหมวดนี้แล้วค่ะ <div style=\"font-size:13px;margin-top:8px\">ซ้ำทั้ง Budget Dept. รหัส GL และชื่อหมวด — ถ้าตั้งใจแยกก้อนงบ ให้ใส่ Budget Dept. หรือชื่อหมวดให้ต่างกันค่ะ</div>");return;}
if(gls.some(g=>g.key===key)){let i=2; while(gls.some(g=>g.key===key+"#"+i))i++; key=key+"#"+i;}
gls=[...gls,{key,code,dept,label:label||code,budget:0,budgets:b?{[(R.glYear||R.year)]:b}:{}}];
el("gldept").value=el("glcode").value=el("glname").value=el("glbud").value="";
render();await saveMeta("gl",gls);};
}
el("glGo")&&(el("glGo").onclick=()=>{view="set";settab="gl";renderNav();render();window.scrollTo(0,0);});
document.querySelectorAll("[data-glplan]").forEach(n=>n.onclick=()=>openGlPlan(n.dataset.glplan));
el("glYearSel")&&(el("glYearSel").onchange=e=>{R.glYear=+e.target.value;render();});
el("glCopy")&&(el("glCopy").onclick=async()=>{
const y=R.glYear||R.year, from=y-1;
const n=gls.filter(g=>glBudget(g,from)).length;
if(!n){tell("ปี "+(from+543)+" ยังไม่มีงบให้คัดลอกค่ะ");return;}
if(!await ask(`คัดลอกงบ <b>${n}</b> หมวด จากปี ${from+543} มาทับปี ${y+543} ใช่ไหมคะ?`,"คัดลอก"))return;
gls.forEach(g=>{ if(!glBudget(g,from))return;
if(hasPlan(g,from)){const P=glPlan(g,from); Object.keys(P).forEach(ck=>setGlPlan(g,y,ck,glPlanMonths(g,from,ck)));}
else{g.budgets=g.budgets&&typeof g.budgets==="object"?g.budgets:{}; g.budgets[y]=glBudget(g,from); g.budget=g.budgets[THISYEAR]||0;}});
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
["ชื่องาน","กลุ่ม","ประเภท","สถานะ","ผู้รับผิดชอบ","วันที่","บริษัท","หมวด GL","งบ","หมวด GL รอง","งบรอง","ใช้จริง","เวลา","สถานที่","ผู้เข้าร่วม","เตรียมล่วงหน้า(วัน)","สิ่งที่ต้องเตรียม","ป้ายกำกับ","สี","ผู้เข้าอบรม","ชั่วโมง","หมวดทักษะ","รูปแบบการอบรม","วิทยากร/สถาบัน","กรมพัฒฯ","รหัสหลักสูตร","รุ่นที่","แบบที่ยื่น","วันที่ฝึกเสร็จ","วันที่ยื่นเปิดหลักสูตร","เลขคำขอเปิด","วันที่ยื่นรับรองรุ่น","เลขคำขอรับรอง","การเกิดซ้ำ","รายละเอียด"],
items.map(t=>[t.title,gLabel(t.track),t.type,t.status,t.owner,t.date||t.recurring,cLabel(t.company),
t.gl1?glLabel(glKeyOf(t.gl1)):"",+t.b1||"",t.gl2?glLabel(glKeyOf(t.gl2)):"",+t.b2||"",t.actual,t.time||"",t.place||"",t.attendees||"",t.prepDays||"",t.prepNote||"",t.tag||"",t.color||"",t.pax||"",t.hours||"",t.skill||"",t.mode||"",t.vendor||"",t.dsd||"",t.course||"",t.batch||"",t.yp||"",t.dsdEnd||"",t.dsdOpenDate||"",t.dsdOpenNo||"",t.dsdCertDate||"",t.dsdCertNo||"",rruleText(t),t.note])));
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
// ---- สำรอง / กู้คืน ----
if(el("bkdown"))el("bkdown").onclick=()=>{
const pack=bkDownload();
const n=pack.items.length+pack.ledger.length+pack.legal.length+pack.index.length+pack.note.length;
bkMsg=`<div class="banner ok" style="margin-top:12px">${svg(ICON.file,17)} สำรองแล้ว <b>${n}</b> รายการ + การตั้งค่าทั้งหมด — เก็บไฟล์ไว้ใน Google Drive หรือที่ปลอดภัยนะคะ</div>`; render();};
if(el("bkgo"))el("bkgo").onclick=async()=>{
const f=el("bkfile").files&&el("bkfile").files[0];
if(!f){tell("เลือกไฟล์สำรอง (.json) ก่อนนะคะ");return;}
let pack; try{ pack=JSON.parse(await f.text()); }catch(e){ tell("<b>อ่านไฟล์ไม่ได้</b><div style=\"font-size:13px;margin-top:6px\">ไฟล์อาจไม่ใช่ไฟล์สำรองของ Sky Work</div>"); return; }
if(!pack||pack.app!=="sky-work"){tell("<b>ไม่ใช่ไฟล์สำรองของ Sky Work</b>");return;}
const cnt=["items","ledger","legal","index","note"].reduce((a,k)=>a+((pack[k]||[]).length),0);
if(!await ask("ไฟล์นี้สำรองไว้เมื่อ <b>"+esc(new Date(pack.at||Date.now()).toLocaleString("th-TH"))+"</b> มี <b>"+cnt+"</b> รายการ<br>กู้คืนแบบ<b>เติมกลับ</b> — ของที่ลบไปจะกลับมา ของที่มีอยู่จะถูกเขียนทับด้วยค่าในไฟล์ ของใหม่ที่เพิ่มหลังวันสำรองจะไม่ถูกลบ<br>ดำเนินการต่อไหมคะ?","กู้คืนข้อมูล"))return;
let ok=0,fail=0;
for(const [coll,key] of [["items","items"],["ledger","ledger"],["legal","legal"],["index","index"],["note","note"]]){
for(const r of (pack[key]||[])){
try{ await DB.collection(coll).doc(r.id).set(r.data); ok++; }catch(e){ fail++; }
if(ok%25===0)setFoot("กำลังกู้คืน "+ok+"/"+cnt+" …");}}
const M=pack.meta||{};
try{
if(Array.isArray(M.groups)&&M.groups.length){groups=M.groups; await saveMeta("groups",groups);}
if(Array.isArray(M.companies)){companies=M.companies; await saveMeta("companies",companies);}
if(Array.isArray(M.gl)){gls=M.gl; await saveMeta("gl",gls);}
if(Array.isArray(M.types)){typeList=M.types; await saveMeta("types",typeList);}
if(Array.isArray(M.tags)){tagList=M.tags; await saveMeta("tags",tagList);}
if(Array.isArray(M.courses)){courses=M.courses; await saveMeta("courses",courses);}
if(Array.isArray(M.skills)){skillList=M.skills; await saveMeta("skills",skillList);}
if(Array.isArray(M.modes)){modeList=M.modes; await saveMeta("modes",modeList);}
if(Array.isArray(M.idxcats)){idxCats=M.idxcats; await saveMeta("idxcats",idxCats);}
if(Array.isArray(M.nfolders)){noteFolders=M.nfolders; await saveMeta("nfolders",noteFolders);}
if(Array.isArray(M.tpls)){tpls=M.tpls; await saveMeta("tpls",tpls);}
if(M.hr){hrdata=Object.assign(hrdata,M.hr); await saveHR();}
}catch(e){fail++;}
bkMsg=`<div class="banner ${fail?"bad":"ok"}" style="margin-top:12px">กู้คืนสำเร็จ <b>${ok}</b> รายการ${fail?" · พลาด "+fail:""} + การตั้งค่าทั้งหมด</div>`;
render();};
el("icsgo")&&(el("icsgo").onclick=downloadICS);
el("execPrint")&&(el("execPrint").onclick=()=>window.print());
el("execCsv")&&(el("execCsv").onclick=execCsv);
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
notes.map(n=>[n.title,n.kind,n.date,n.tag,ntPlain(n,true)])));
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
title, track:g.key, type:get(r,"ประเภท"), status:STATUS.includes(normSt(get(r,"สถานะ")))?normSt(get(r,"สถานะ")):"รอดำเนินการ",
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
skill:(get(r,"หมวดทักษะ")||get(r,"ประเภทการอบรม")||"").trim(),
mode:(get(r,"รูปแบบการอบรม")||"").trim(),
course:(()=>{const v=get(r,"รหัสหลักสูตร").trim(); if(v)return v;
const nm=get(r,"ชื่องาน").trim(); const c2=courses.find(x=>x.name===nm); return c2?c2.code:"";})(),
batch:get(r,"รุ่นที่"), yp:get(r,"แบบที่ยื่น"), dsdEnd:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ฝึกเสร็จ"))?get(r,"วันที่ฝึกเสร็จ"):null, dsdOpenDate:/^\d{4}-\d{2}-\d{2}$/.test(get(r,"วันที่ยื่นเปิดหลักสูตร"))?get(r,"วันที่ยื่นเปิดหลักสูตร"):null,
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
function syncCrsName(){
const v=el("f-course").value, linked=!!crsOf(v);
const w=el("f-title").closest(".f");
if(w)w.hidden=linked&&!el("wrap-course").hidden;
const lb=el("lbl-title");
if(lb)lb.textContent=(v==="__newcrs__")?"ชื่อหลักสูตรใหม่":(formCtx==="train"?"ชื่อหลักสูตร":"ชื่องาน");
if(v==="__newcrs__"&&el("f-title"))setTimeout(()=>el("f-title").focus(),60);
}
function paintCrsHint(){
const code=el("f-course").value, c=crsOf(code);
if(code==="__newcrs__"){el("f-crshint").innerHTML="พิมพ์ชื่อหลักสูตรในช่องด้านล่าง — ระบบจะรันรหัสให้อัตโนมัติตอนกดบันทึก และเพิ่มเข้าทะเบียนให้เอง";return;}
if(!c){el("f-crshint").innerHTML="เลือกหลักสูตรจากทะเบียนเพื่อให้ระบบนับ “หลักสูตร” ไม่ซ้ำ แล้วใส่แค่รุ่นที่ · จัดการทะเบียนที่ ตั้งค่า → หลักสูตรอบรม";return;}
const bs=crsBatches(c.code).filter(x=>x._id!==(editing&&editing._id));
el("f-crshint").innerHTML=`รหัส <b>${esc(c.code)}</b> · หลักสูตรนี้มีอยู่แล้ว <b>${bs.length}</b> รุ่น`
+(bs.length?" ("+bs.map(x=>esc(x.batch||"ไม่ระบุรุ่น")).slice(0,6).join(", ")+")":"")
+(c.hours?` · ชั่วโมงมาตรฐาน ${c.hours} ชม.`:"");
}
function paintTagOpts(cur){
const tr=el("f-track")?el("f-track").value:"";
const list=tagsFor(tr);
if(cur&&!list.includes(cur))list.unshift(cur);
fill("f-tag",[["","— ไม่มีป้าย —"],...list.map(x=>[x,x])],cur||"");
}
function paintTypeOpts(cur){
const tr=el("f-track")?el("f-track").value:"";
const list=typesFor(tr);
if(cur&&!list.includes(cur))list.unshift(cur);
fill("f-type",[["","— ไม่ระบุ —"],...list.map(x=>[x,x])],cur||"");
}
function fill(sel,arr,val){el(sel).innerHTML=arr.map(([v,l])=>`<option value="${esc(v)}"${v===val?" selected":""}${/^__hd__/.test(v)?" disabled":""}>${esc(l)}</option>`).join("");}
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
el("wrap-until").hidden=(f==="none");
const dl=el("f-date").parentElement.querySelector("label");
if(dl)dl.textContent=(f==="none")?"วันที่":"วันที่เริ่มต้น";
}
let formCtx="", formKind="", msDraft=[], apDraft=[];
const KINDG={train:/อบรม|training/i,meet:/ประชุม|meeting/i,proj:/โปรเจค|โครงการ|project/i,act:/กิจกรรม|event/i};
const kindGroup=k=>(visible(groups).find(g=>KINDG[k]&&KINDG[k].test(g.label))||{}).key||"";
const kindOfItem=t=>{
if(!t)return "";
if(t.kind)return t.kind;
if(isTrain(t))return "train"; if(isMeet(t))return "meet";
const s2=(t.type||"")+" "+gLabel(t.track);
if(KINDG.proj.test(s2))return "proj"; if(KINDG.act.test(s2))return "act";
return "";};
const QUADS=[["q1","ทำเลย","สำคัญ · เร่งด่วน","#F8D7DC","ทำเองทันที — ตั้ง Deadline ภายใน 1–2 วัน"],
["q2","วางแผน","สำคัญ · ไม่เร่งด่วน","#D6E6F5","กำหนดช่วงเวลาไว้ล่วงหน้า ก่อนจะลุกลามเป็นงานด่วน"],
["q3","มอบหมาย","ไม่สำคัญ · เร่งด่วน","#FBE8BC","ส่งต่อให้คนอื่น — ใส่ผู้รับผิดชอบ แล้วติดตามตาม Deadline"],
["q4","ไว้ทีหลัง","ไม่สำคัญ · ไม่เร่งด่วน","#E7E5DE","ทำเมื่อว่าง หรือพิจารณาตัดทิ้ง"]];
const quadOf=t=>QUADS.some(q=>q[0]===(t&&t.quad))?t.quad:"";
const quadInfo=k=>QUADS.find(q=>q[0]===k);
let genMode=false, curQuad="", backable=false;
const KINDLAB={train:"หลักสูตรอบรม",meet:"การประชุม",proj:"โปรเจค",act:"กิจกรรม",task:"งาน"};
function openPick(){
["meet","train","proj","act","task","note"].forEach(k=>{const n=el("pi-"+k);
if(n)n.innerHTML=svg({meet:ICON.meet,train:ICON.train,proj:ICON.budget,act:ICON.cal,task:ICON.all,note:ICON.note}[k]||ICON.all,17);});
paintTpl(); el("pickdlg").showModal();}
function pickKind(k){
el("pickdlg").close();
if(k==="note"){ openNote(null); return; }
formKind=k; open_(null,k,true);}
// เช็กลิสต์ย่อย (ขั้นตอนโปรเจค / ของที่ต้องเตรียม)
const chkList=a=>(Array.isArray(a)?a:[]).map(x=>typeof x==="string"?{t:x,d:false}:{t:(x&&x.t)||"",d:!!(x&&x.d)}).filter(x=>x.t);
function paintChk(which){
const arr=which==="ms"?msDraft:apDraft, box=el(which==="ms"?"ms-list":"ap-list"); if(!box)return;
box.innerHTML=arr.length?arr.map((x,i)=>`<label class="chkrow${x.d?" on":""}">
<input type="checkbox" data-chk="${which}:${i}"${x.d?" checked":""}><span>${esc(x.t)}</span>
<button type="button" data-chkdel="${which}:${i}" title="ลบข้อนี้">×</button></label>`).join("")
:`<div class="hint" style="margin:0">ยังไม่มีรายการ — พิมพ์ด้านล่างแล้วกดเพิ่ม</div>`;
box.querySelectorAll("[data-chk]").forEach(n=>n.onchange=()=>{
const [w,i]=n.dataset.chk.split(":"); const a=w==="ms"?msDraft:apDraft;
a[+i].d=n.checked; paintChk(w); if(w==="ms")syncProg();});
box.querySelectorAll("[data-chkdel]").forEach(n=>n.onclick=()=>{
const [w,i]=n.dataset.chkdel.split(":"); const a=w==="ms"?msDraft:apDraft;
a.splice(+i,1); paintChk(w); if(w==="ms")syncProg();});}
function syncProg(){
const n=msDraft.length, d=msDraft.filter(x=>x.d).length;
if(n){ el("f-prog").value=Math.round(d/n*100); }
const v=Math.max(0,Math.min(100,+el("f-prog").value||0));
if(el("f-progbar"))el("f-progbar").style.width=v+"%";}
function syncAper(){
const b=(+el("f-b1").value||0)+(+el("f-b2").value||0), real=+el("f-apaxreal").value||0, plan=+el("f-apax").value||0;
const n=real||plan, box=el("f-aper"); if(!box)return;
box.textContent=(b&&n)?baht(Math.round(b/n))+" ฿ / คน"+(real?" (จากคนจริง)":" (จากเป้าหมาย)"):"—";}
function syncKind(){
const k=formKind||kindOfItem(editing)||(()=>{const s2=(el("f-type").value||"")+" "+((groups.find(x=>x.key===el("f-track").value)||{}).label||"");
return KINDG.proj.test(s2)?"proj":KINDG.act.test(s2)?"act":"";})();
const on=(ids,show)=>ids.forEach(id=>{const n=el(id); if(n)n.hidden=!show;});
on(["wrap-proj","wrap-proj1","wrap-proj2","wrap-proj3","wrap-proj4","wrap-proj5","wrap-proj6","wrap-ms"],k==="proj");
on(["wrap-act","wrap-act1","wrap-act2","wrap-act3","wrap-act4","wrap-act5","wrap-act6","wrap-act7","wrap-aprep"],k==="act");
el("sec-proj").hidden=k!=="proj"; el("sec-act").hidden=k!=="act";
if(k==="proj")syncProg(); if(k==="act")syncAper();}
function open_(t,kind,fromPick){
backable=!!fromPick&&!t;
const preDate=(!t&&view==="cal"&&R.selDay)?`${R.year}-${String(R.month+1).padStart(2,"0")}-${String(R.selDay).padStart(2,"0")}`:"";
editing=t;
formKind = kind || kindOfItem(t) || "";
formCtx = (formKind==="train"||formKind==="meet") ? formKind
: (t ? (isTrain(t)?"train":isMeet(t)?"meet":"") : ((view==="train"||view==="dsd")?"train":view==="meet"?"meet":""));
genMode=formKind==="task";
if(genMode)formCtx="";
if(!formKind&&formCtx)formKind=formCtx;
el("dlgh").textContent=(t?"แก้ไข":"เพิ่ม")+(KINDLAB[formKind]||(t?"งาน":"งานใหม่"));
el("lbl-title").textContent=formCtx==="train"?"ชื่อหลักสูตร":"ชื่องาน";
el("lbl-code").textContent=formCtx==="train"?"รหัสหลักสูตร":"รหัสอ้างอิง (ไม่บังคับ)";
el("f-code").placeholder=formCtx==="train"?"เช่น TRN-2026-014":"เช่น 1.0 หรือเลขที่เอกสาร";
el("wrap-flags").hidden=!!formCtx;
el("del").style.display=t?"":"none";
fill("f-company",[["","— ไม่ระบุ —"],...visible(companies).map(c=>[c.key,c.label])],t?.company||"");
fill("f-track",visible(groups).map(g=>[g.key,g.label]),t?.track||
(genMode?((visible(groups).find(g=>!/อบรม|training|ประชุม|meeting|โปรเจค|โครงการ|project|กิจกรรม|event/i.test(g.label))||{}).key||""):(formKind?kindGroup(formKind):""))||
(formCtx==="train"?kindGroup("train"):formCtx==="meet"?kindGroup("meet"):"")||groups[0]?.key);
fill("f-status",STATUS.map(x=>[x,x]),t?.status||"รอดำเนินการ");
const glopts=[["","— ไม่ผูกหมวด —"],...visible(gls).map(g=>[g.key,glLabel(g.key)])];
fill("f-gl1",glopts,glKeyOf(t?.gl1)); fill("f-gl2",glopts,glKeyOf(t?.gl2));
paintTypeOpts(t?.type||(formCtx==="train"?"อบรม":formCtx==="meet"?"ประชุม":""));

el("f-title").value=t?.title||""; el("f-owner").value=t?.owner||""; formStk=(t&&Array.isArray(t.stk)?t.stk.filter(stkValid):[]).slice(0,4); stkPickerPaint();
el("f-date").value=t?.date||preDate||""; el("f-recur").value=t?.recurring||"";
const RU=(t&&t.rrule)||{freq:"none",weekdays:[],nth:[1],monthday:""};
fill("f-freq",FREQ,RU.freq||"none");
el("f-wd").innerHTML=DOW.map((d,i)=>`<label><input type="checkbox" class="wd" value="${i}"${(RU.weekdays||[]).includes(i)?" checked":""}>${d}.</label>`).join("");
el("f-nth").innerHTML=NTH.map(([v,l])=>`<label><input type="checkbox" class="nth" value="${v}"${(RU.nth||[]).includes(v)?" checked":""}>${l}</label>`).join("");
el("f-md").value=RU.monthday||""; el("f-until").value=RU.until||"";
syncFreq();
el("f-meet").checked=genMode?false:(formCtx?formCtx==="meet":isMeet(t||{}));
el("f-time").value=t?.time||""; el("f-place").value=t?.place||"";
el("f-att").value=t?.attendees||""; el("f-prepd").value=t?.prepDays||"";
el("f-prepn").value=t?.prepNote||"";
syncMeet();
el("f-train").checked=genMode?false:(formCtx?formCtx==="train":isTrain(t||{}));
el("f-tplace").value=t?.place||"";
fill("f-skill",[["","— ยังไม่ระบุ —"],...skills().map(v=>[v,v])],t?.skill||(t?"":guessSkill({title:el("f-title").value,type:el("f-type").value,track:el("f-track").value})));
fill("f-mode",[["","— ยังไม่ระบุ —"],...modes().map(v=>[v,v])],t?.mode||"");
el("f-batch").value=t?.batch||"";
el("f-batches").value=(t&&+t.batches>1)?t.batches:"";
el("f-dsdopen").value=t?.dsdOpenDate||"";
(()=>{const cur=t?.course||"";
fill("f-course",[["__newcrs__","＋ หลักสูตรใหม่ (รันรหัสให้อัตโนมัติ)"],["","— ไม่ผูกทะเบียน (พิมพ์ชื่อเอง) —"],
...(()=>{const vs=visible(courses), out=[];
[...skills(),""].forEach(k=>{const g=vs.filter(c=>(c.skill||"")===k); if(!g.length)return;
out.push(["__hd__"+(k||"none"),"———— "+(k||"ยังไม่ระบุหมวดทักษะ")+" ————"]);
g.forEach(c=>out.push([c.code,c.code+" · "+c.name]));});
return out;})()],cur);
el("f-crscode").value=cur||""; paintCrsHint(); syncCrsName();})();
fill("f-yp",YP,t?.yp||""); el("f-dsdend").value=t?.dsdEnd||"";
el("f-dsdopenno").value=t?.dsdOpenNo||""; el("f-dsdcert").value=t?.dsdCertDate||"";
el("f-dsdcertno").value=t?.dsdCertNo||"";
el("f-pax").value=t?.pax||""; el("f-hours").value=t?.hours||"";
el("f-vendor").value=t?.vendor||"";
fill("f-dsd",[["","— ไม่ระบุ —"],...DSD.map(x=>[x,x])],t?.dsd||"");
if(!t)el("f-train").checked=genMode?false:((formCtx==="train")||trainish());
syncTrain(); if(typeof syncBatches==="function")syncBatches();
el("f-b1").value=t?.b1||""; el("f-b2").value=t?.b2||"";
el("f-actual").value=t?.actual||""; el("f-code").value=t?.code||"";
el("f-note").value=t?.note||"";
el("f-why").value=t?.why||""; el("f-inv").value=t?.inv||""; el("f-whr").value=t?.whr||""; el("f-how").value=t?.how||"";
el("wrap-5w").open=!!(genMode||w5Has(t));
paintTagOpts((t?.tag||"").trim());


el("f-pstart").value=t?.pstart||""; el("f-pend").value=t?.pend||"";
el("f-powner").value=t?.team||""; el("f-prog").value=(t&&t.prog!==undefined&&t.prog!==null&&t.prog!=="")?t.prog:"";
el("f-pgoal").value=t?.pgoal||""; el("f-prisk").value=t?.prisk||"";
el("f-astart").value=t?.astart||""; el("f-aend").value=t?.aend||"";
el("f-aplace").value=t?.aplace||""; el("f-apax").value=t?.apax||""; el("f-apaxreal").value=t?.apaxreal||"";
el("f-aorg").value=t?.aorg||"";
msDraft=chkList(t&&t.ms); apDraft=chkList(t&&t.aprep);
paintChk("ms"); paintChk("ap"); syncKind();
curQuad=quadOf(t); paintQuad(); syncGen();
const ms=t?.months||[];
occSkipDraft=[...((t&&t.skip)||[])]; occShowAll=false;
paintOccs(t); syncStatusLabel();
el("f-months").innerHTML=MTH.map((m,i)=>`<label><input type="checkbox" value="${i+1}"${ms.includes(i+1)?" checked":""}>${m}</label>`).join("");
foldInit(t); el("dlg").showModal();
}
function paintQuad(){
const box=el("f-quad"); if(!box)return;
box.querySelectorAll("[data-q]").forEach(b=>b.classList.toggle("on",b.dataset.q===curQuad));
const q=quadInfo(curQuad); el("f-quadhint").textContent=q?q[1]+" · "+q[4]:"ยังไม่จัดลำดับ — แตะช่องที่เหมาะกับงานนี้ (แตะซ้ำเพื่อยกเลิก)";
}
const DL_CHIPS=[["วันนี้",0],["พรุ่งนี้",1],["ใน 3 วัน",3],["ใน 1 สัปดาห์",7],["ใน 2 สัปดาห์",14],["สิ้นเดือน",-1]];
function syncGen(){
const lab=document.querySelector('label[for="f-date"]'); if(lab)lab.textContent=genMode?"Deadline":"วันที่";
const showQ=!(el("f-train").checked||el("f-meet").checked);
el("wrap-quad").hidden=!showQ;
el("f-dlchips").hidden=!genMode;
if(genMode){ el("wrap-flags").hidden=true; el("wrap-course").hidden=true; el("wrap-train").hidden=true; el("wrap-meet").hidden=true; }
el("back").hidden=!backable;
el("tplsave").hidden=!genMode;
syncW5();
}
// ---------- แม่แบบงาน (เก็บ 5W1H ไว้ใช้ซ้ำ) ----------
const TPL_KEYS=["title","track","company","type","owner","quad","why","inv","whr","how","note","tag"];
function paintTpl(){
const box=el("tplbox"); if(!box)return;
box.innerHTML=tpls.length?`<div class="tplh">แม่แบบงานของฉัน <small>แตะเพื่อเริ่มจากแม่แบบ</small></div>
<div class="tplrows">${tpls.map(tp=>`<div class="tplrow"><button type="button" class="tplgo" data-tpl="${esc(tp.id)}"><b>★ ${esc(tp.name)}</b><i>${esc([gLabel((tp.t||{}).track),(tp.t||{}).owner,(tp.t||{}).why].filter(Boolean).join(" · ").slice(0,70))}</i></button><button type="button" class="tpldel" data-tpldel="${esc(tp.id)}" title="ลบแม่แบบนี้" aria-label="ลบแม่แบบ">×</button></div>`).join("")}</div>`
:`<div class="hint" style="margin:0">ยังไม่มีแม่แบบ — เปิดฟอร์ม “เพิ่มงานทั่วไป” กรอกให้ครบ แล้วกด 💾 บันทึกเป็นแม่แบบ งานที่ทำซ้ำจะได้ไม่ต้องกรอก 5W1H ใหม่</div>`;
box.querySelectorAll("[data-tpl]").forEach(b=>b.onclick=()=>{ const tp=tpls.find(x=>x.id===b.dataset.tpl); if(tp){ el("pickdlg").close(); openFromTpl(tp); } });
box.querySelectorAll("[data-tpldel]").forEach(b=>b.onclick=async()=>{ const tp=tpls.find(x=>x.id===b.dataset.tpldel); if(!tp)return;
if(!await ask("ลบแม่แบบ “"+esc(tp.name)+"” ใช่ไหมคะ? (งานที่เคยสร้างจากแม่แบบนี้ไม่หาย)","ลบแม่แบบ"))return;
tpls=tpls.filter(x=>x.id!==tp.id); await saveMeta("tpls",tpls); paintTpl(); });
}
function openFromTpl(tp){
const T=tp.t||{};
open_(null,"task",true);
const setSel=(id,v)=>{ const n=el(id); if(n&&v!==undefined&&[...n.options].some(o=>o.value===v))n.value=v; };
el("f-title").value=T.title||tp.name||""; setSel("f-track",T.track); setSel("f-company",T.company||""); setSel("f-type",T.type||""); setSel("f-tag",T.tag||"");
el("f-owner").value=T.owner||""; el("f-note").value=T.note||"";
el("f-why").value=T.why||""; el("f-inv").value=T.inv||""; el("f-whr").value=T.whr||""; el("f-how").value=T.how||"";
curQuad=quadInfo(T.quad)?T.quad:""; paintQuad(); el("wrap-5w").open=true; syncW5();
setFoot("เริ่มจากแม่แบบ “"+tp.name+"” — ตั้ง Deadline แล้วบันทึกได้เลย");
}
el("tplsave").onclick=()=>{ if(!el("f-title").value.trim()){ el("f-title").focus(); return; } el("tps-name").value=el("f-title").value.trim(); el("tpsdlg").showModal(); el("tps-name").select(); };
el("tps-cancel").onclick=()=>el("tpsdlg").close();
el("tps-ok").onclick=async()=>{
const nm=el("tps-name").value.trim(); if(!nm){ el("tps-name").focus(); return; }
const t={title:el("f-title").value.trim(),track:el("f-track").value,company:el("f-company").value,type:(el("f-type").value==="__new__"?"":el("f-type").value),owner:el("f-owner").value.trim(),quad:curQuad,why:el("f-why").value.trim(),inv:el("f-inv").value.trim(),whr:el("f-whr").value.trim(),how:el("f-how").value.trim(),note:el("f-note").value.trim(),tag:el("f-tag").value};
const ex=tpls.find(x=>x.name===nm); const rec={id:ex?ex.id:"tp"+Date.now().toString(36),name:nm,t};
tpls=ex?tpls.map(x=>x===ex?rec:x):[...tpls,rec];
el("tpsdlg").close(); await saveMeta("tpls",tpls); setFoot((ex?"อัปเดต":"บันทึก")+"แม่แบบ “"+nm+"” แล้ว");
};
const w5Kind=()=>el("f-meet").checked?"meet":el("f-train").checked?"train":"task";
const W5LAB={
task:["Why · ทำไมต้องทำ","เช่น กฎหมายกำหนด / ผู้บริหารสั่ง / ลดความเสี่ยง","Who · ผู้เกี่ยวข้อง / ผู้อนุมัติ","เช่น อนุมัติโดยหัวหน้า HR · ประสานฝ่ายบัญชี","How · ขั้นตอน / เช็กลิสต์","1) … 2) … 3) …"],
train:["Why · ทักษะที่ขาด / วัตถุประสงค์","เช่น พนักงานใหม่ยังขาดทักษะความปลอดภัย","Who · กลุ่มเป้าหมาย","เช่น พนักงานฝ่ายผลิต กะเช้า","How · วิธีฝึก / เนื้อหา","เช่น บรรยาย 3 ชม. + ฝึกปฏิบัติ"],
meet:["Why · วัตถุประสงค์การประชุม","เช่น อนุมัติงบ / ติดตามความคืบหน้า","Who · ผู้ตัดสินใจ / ผู้ที่ต้องเข้า","เช่น MD, ผอ.ฝ่าย","How · วาระ / ผลที่ต้องได้","เช่น 1) รายงาน 2) ตัดสินใจ"]};
function syncW5(){
const k=w5Kind(), L=W5LAB[k];
el("lbl-why").textContent=L[0]; el("f-why").placeholder=L[1]; el("lbl-inv").textContent=L[2]; el("f-inv").placeholder=L[3]; el("lbl-how").textContent=L[4]; el("f-how").placeholder=L[5];
el("wrap-whr").hidden=k!=="task"; el("f-whr").placeholder="เช่น ห้องประชุม 2 · ระบบ HRIS · ลิงก์เอกสาร";
w5Live();
}
function w5Live(){
const k=w5Kind(), t={why:el("f-why").value,inv:el("f-inv").value,whr:el("f-whr").value,how:el("f-how").value,owner:el("f-owner").value,date:el("f-date").value,rrule:el("f-freq").value!=="none"?1:null};
const m=w5Miss(t,k), total=k==="task"?6:5, filled=total-m.length-(el("f-title").value.trim()?0:1);
el("w5sum").textContent="5W1H · รายละเอียดงาน (ไม่บังคับ) — ครบ "+filled+"/"+total;
el("w5hint").textContent=filled>=total?"ครบ 5W1H แล้ว ✓":"ยังขาด: "+[...(el("f-title").value.trim()?[]:["What"]),...m].join(", ");
}
el("dlg").addEventListener("input",w5Live); el("dlg").addEventListener("change",()=>{ if(el("dlg").open)syncW5(); });
el("w5ai").onclick=async()=>{
const hint=el("w5hint"), title=el("f-title").value.trim();
if(!title){ hint.textContent="พิมพ์ชื่องานก่อน แล้วค่อยให้ AI ช่วยเติม"; el("f-title").focus(); return; }
if(AI.live===null)await aiPing();
if(!AI.live){ hint.textContent="ยังไม่ได้เชื่อม AI ในแอป — เปิดโหมดฝัง AI ที่หน้าผู้ช่วย AI ก่อน หรือกรอกเองได้เลย"; return; }
el("w5ai").disabled=true; hint.textContent="AI กำลังร่าง…";
try{
const k=w5Kind(), info=["ชนิดงาน: "+({task:"งานทั่วไป",train:"อบรม",meet:"ประชุม"}[k]),"ชื่องาน: "+title,"ประเภท: "+(el("f-type").value||"-"),"กลุ่มงาน: "+(el("f-track").selectedOptions[0]?.textContent||"-"),"บริษัท: "+(el("f-company").selectedOptions[0]?.textContent||"-"),"ผู้รับผิดชอบ: "+(el("f-owner").value||"-"),"Deadline: "+(el("f-date").value||"-"),"รายละเอียดเดิม: "+(el("f-note").value||"-"),
"ที่กรอกไว้แล้ว — why: "+(el("f-why").value||"-")+" | inv: "+(el("f-inv").value||"-")+" | whr: "+(el("f-whr").value||"-")+" | how: "+(el("f-how").value||"-")].join("\n");
const txt=await aiAskText(W5_SYS,"วันนี้: "+isoOf(new Date()),info+'\nตอบ JSON: {"why":"","inv":"","whr":"","how":""} — inv คือผู้เกี่ยวข้อง/ผู้อนุมัติ/กลุ่มเป้าหมาย (ถ้าไม่รู้ชื่อจริงให้ใส่บทบาท เช่น “หัวหน้าแผนก”) · whr คือสถานที่/ระบบ');
const j=aiJsonOf(txt); if(!j||typeof j!=="object")throw new Error("อ่านคำตอบ AI ไม่ได้ ลองกดอีกครั้ง");
let n=0; [["why","f-why"],["inv","f-inv"],["whr","f-whr"],["how","f-how"]].forEach(([a,b])=>{ if(!el(b).value.trim()&&w5Txt(j[a])&&!(a==="whr"&&k!=="task")){ el(b).value=w5Txt(j[a]).slice(0,600); n++; } });
w5Live(); hint.textContent=n?"AI เติมให้ "+n+" ช่อง — ตรวจก่อนบันทึกนะคะ (เติมเฉพาะช่องที่ว่าง)":"ไม่มีช่องว่างให้เติม หรือข้อมูลยังไม่พอ";
}catch(e){ hint.textContent="ไม่สำเร็จ: "+(e.message||e); }
el("w5ai").disabled=false;
};
el("f-quad").onclick=e=>{ const b=e.target.closest("[data-q]"); if(!b)return; curQuad=curQuad===b.dataset.q?"":b.dataset.q; paintQuad(); };
el("f-dlchips").onclick=e=>{ const b=e.target.closest("[data-dl]"); if(!b)return; const n=+b.dataset.dl, d=new Date(); d.setHours(12,0,0,0);
if(n<0){ d.setMonth(d.getMonth()+1,0); } else d.setDate(d.getDate()+n);
el("f-date").value=isoOf(d); w5Live(); };
el("back").onclick=()=>{ el("dlg").close(); openPick(); };
let occSkipDraft=[], occShowAll=false;
function paintOccs(t){
const wrap=el("wrap-occ");

const R2=(t&&rr(t))||null;
const f=el("f-freq")?el("f-freq").value:"none";
if(!t||!R2||f==="none"){ wrap.hidden=true; el("f-occs").innerHTML=""; return; }
wrap.hidden=false;
const today=new Date(); today.setHours(0,0,0,0);
const st=t.date?new Date(t.date):today;
const from=new Date(Math.min(st.getTime(),today.getTime()));
const yr=(typeof R!=="undefined"&&R.year)||today.getFullYear();
let show;
if(occShowAll){ show=occList(t,new Date(yr,0,1),12).filter(d=>d.getFullYear()===yr); }
else{ const all=occList(t,new Date(from.getFullYear(),from.getMonth()-2,1),16);
const past=all.filter(d=>d<=today).slice(-5), fut=all.filter(d=>d>today).slice(0,4);
show=[...past,...fut]; }
el("occAll").textContent=occShowAll?"แสดงเฉพาะรอบใกล้ๆ":"ดูทุกรอบของปี "+(yr+543);
el("f-occs").innerHTML=show.map(d=>{const iso=isoOf(d), sk=occSkipDraft.includes(iso);
return `<label class="occ${d<=today?"":" fut"}${sk?" skip":""}">
<input type="checkbox" class="oc" value="${iso}"${occDone(t,d)?" checked":""}${sk?" disabled":""}>
<span>${d.getDate()} ${MTH[d.getMonth()]} ${d.getFullYear()+543-2500}</span>
<i>${sk?"งดรอบนี้":occCancel(t,d)?"ยกเลิกแล้ว":(d<today?"ผ่านมาแล้ว":d.getTime()===today.getTime()?"วันนี้":"ยังไม่ถึง")}</i>
<button type="button" class="skipbtn${sk?" on":""}" data-skip="${iso}" title="${sk?"กลับมาจัดตามปกติ":"งดรอบนี้ (ไม่จัด)"}">${sk?"↺ จัดตามเดิม":"งด"}</button></label>`;}).join("")
||`<div class="hint" style="margin:0">ยังไม่มีรอบให้แสดง</div>`;
el("occAll").onclick=ev=>{ev.preventDefault();occShowAll=!occShowAll;paintOccs(t);};
el("occPast").onclick=ev=>{ev.preventDefault();
el("f-occs").querySelectorAll(".oc").forEach(i=>{const d=new Date(i.value);
if(d<=today&&!occSkipDraft.includes(i.value))i.checked=true;});
setFoot("ติ๊กรอบที่ผ่านมาแล้ว — อย่าลืมกดบันทึก");};
el("occClear").onclick=ev=>{ev.preventDefault();
el("f-occs").querySelectorAll(".oc").forEach(i=>i.checked=false);
setFoot("ล้างเครื่องหมายแล้ว — อย่าลืมกดบันทึก");};
el("f-occs").querySelectorAll("[data-skip]").forEach(b=>b.onclick=ev=>{
ev.preventDefault(); ev.stopPropagation();
const iso=b.dataset.skip, i=occSkipDraft.indexOf(iso);
if(i>=0)occSkipDraft.splice(i,1); else occSkipDraft.push(iso);
paintOccs(t);});
}
function syncMeet(){ el("wrap-meet").hidden=!el("f-meet").checked; if(typeof syncGen==="function")syncGen(); }
el("f-meet").onchange=syncMeet;
// งานนี้ถือเป็นงานอบรมไหม — ดูจากกลุ่มงาน / ประเภท / ติ๊กเอง
function trainish(){
const g=groups.find(x=>x.key===el("f-track").value);
return /อบรม|training/i.test((g&&g.label)||"")||/อบรม/.test(el("f-type").value||"");
}
function syncTrain(){
if(genMode&&el("f-train").checked)el("f-train").checked=false;
const on=el("f-train").checked;
el("wrap-train").hidden=!on;
el("wrap-course").hidden=!on;
if(!on&&el("f-course").value){ el("f-course").value=""; el("f-crscode").value=""; }
syncCrsName(); if(typeof syncGen==="function")syncGen();
}
el("f-train").onchange=syncTrain;
// เปลี่ยนกลุ่ม/ประเภท → เปิดหรือปิดส่วนอบรมให้อัตโนมัติ ไม่ต้องนั่งติ๊กเอง
function autoTrain(){
if(genMode){ syncTrain(); return; }
const want=trainish();
if(want!==el("f-train").checked){ el("f-train").checked=want; }
syncTrain();
}
el("f-track").addEventListener("change",()=>paintTypeOpts(el("f-type").value));
el("f-crscode").oninput=()=>{
const q=el("f-crscode").value.trim().toLowerCase(); if(!q)return;
const hit=courses.find(c=>c.code.toLowerCase()===q)||courses.find(c=>c.code.toLowerCase().endsWith(q))
||courses.find(c=>c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q));
if(hit){ el("f-course").value=hit.code; el("f-course").onchange(); }};
el("f-course").onchange=()=>{
const c=crsOf(el("f-course").value);
syncCrsName();
if(c){ el("f-crscode").value=c.code; el("f-title").value=c.name;
if(c.skill)el("f-skill").value=c.skill; if(c.mode)el("f-mode").value=c.mode;
if(c.hours&&!el("f-hours").value)el("f-hours").value=c.hours;
if(!el("f-code").value.trim())el("f-code").value=c.code; }
paintCrsHint();};
el("f-track").addEventListener("change",()=>paintTagOpts(el("f-tag").value));
el("f-track").addEventListener("change",autoTrain);
el("f-track").addEventListener("change",()=>{if(genMode)return; formKind=""; syncKind();});
el("f-type").addEventListener("change",()=>{if(genMode)return; formKind=""; syncKind();});
if(el("ms-add"))el("ms-add").onclick=()=>{const v=el("ms-new").value.trim(); if(!v)return;
msDraft.push({t:v,d:false}); el("ms-new").value=""; paintChk("ms"); syncProg(); el("ms-new").focus();};
if(el("ms-new"))el("ms-new").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault(); el("ms-add").click();}};
if(el("ap-add"))el("ap-add").onclick=()=>{const v=el("ap-new").value.trim(); if(!v)return;
apDraft.push({t:v,d:false}); el("ap-new").value=""; paintChk("ap"); el("ap-new").focus();};
if(el("ap-new"))el("ap-new").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault(); el("ap-add").click();}};
if(el("f-prog"))el("f-prog").oninput=()=>{if(el("f-progbar"))el("f-progbar").style.width=Math.max(0,Math.min(100,+el("f-prog").value||0))+"%";};
["f-apax","f-apaxreal","f-b1","f-b2"].forEach(id=>{const n=el(id); if(n)n.addEventListener("input",syncAper);});
document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>pickKind(b.dataset.pick));
if(el("pickcancel"))el("pickcancel").onclick=()=>el("pickdlg").close();
el("f-type").addEventListener("change",autoTrain);
el("f-freq").onchange=()=>{syncFreq();paintOccs(editing);syncStatusLabel();};
function syncBatches(){
const w=el("wrap-bhint"), h=el("f-bhint"); if(!w||!h)return;
const tot=+el("f-batches").value||0, cur=batchNo(el("f-batch").value)||1;
const miss=[]; for(let i=1;i<=tot;i++)if(i!==cur)miss.push(batchLabel(el("f-batch").value||"รุ่น 1",i));
if(tot>1&&miss.length){w.hidden=false;
h.innerHTML=`บันทึกแล้วระบบจะสร้าง <b>${miss.length} รุ่น</b> ที่เหลือให้เลย (${esc(miss.slice(0,6).join(" · "))}${miss.length>6?" …":""})<br>
รุ่นใหม่จะได้ชื่อหลักสูตร บริษัท กลุ่มงาน วิทยากร และ<b>เลขคำขอเปิดหลักสูตร (ยป.)</b> เหมือนรุ่นนี้ · <b>เว้นวันที่ จำนวนคน และงบไว้ว่าง</b> ให้ไปเติมทีละรุ่น · รุ่นที่มีอยู่แล้วจะไม่ถูกสร้างซ้ำ`;}
else {w.hidden=true; h.innerHTML="";}}
["f-batches","f-batch"].forEach(id=>{const n=el(id); if(n){n.oninput=syncBatches; n.onchange=syncBatches;}});
el("cancel").onclick=()=>el("dlg").close();
el("save").onclick=async()=>{
if(!el("f-title").value.trim()){ foldOpen(el("f-title")); el("f-title").focus();return;}
const data={
title:el("f-title").value.trim(), company:el("f-company").value,
track:el("f-track").value, type:(el("f-type").value==="__new__"?"":el("f-type").value).trim(),
status:el("f-status").value, owner:el("f-owner").value.trim(),
date:el("f-date").value||null, recurring:el("f-recur").value.trim()||null,
rrule:(()=>{const f=el("f-freq").value; if(f==="none")return null;
return {freq:f,
weekdays:[...el("f-wd").querySelectorAll("input:checked")].map(i=>+i.value),
nth:[...el("f-nth").querySelectorAll("input:checked")].map(i=>+i.value),
monthday:+el("f-md").value||null, ...(el("f-until").value?{until:el("f-until").value}:{})};})(),
gl1:el("f-gl1").value, b1:+el("f-b1").value||0,
gl2:el("f-gl2").value, b2:+el("f-b2").value||0,
actual:+el("f-actual").value||0, code:el("f-code").value.trim(), course:el("f-course").value,
meet:el("f-meet").checked, time:hhmm(el("f-time").value),
place:(el("f-train").checked&&!el("f-meet").checked)?el("f-tplace").value.trim():el("f-place").value.trim(),
attendees:el("f-att").value.trim(), prepDays:+el("f-prepd").value||0, prepNote:el("f-prepn").value.trim(),
train:el("f-train").checked, pax:+el("f-pax").value||0, hours:+el("f-hours").value||0,
vendor:el("f-vendor").value.trim(), dsd:el("f-dsd").value,
skill:el("f-skill").value, mode:el("f-mode").value, batch:el("f-batch").value.trim(), batches:+el("f-batches").value||0, yp:el("f-yp").value, dsdEnd:el("f-dsdend").value||null, dsdOpenDate:el("f-dsdopen").value||null, dsdOpenNo:el("f-dsdopenno").value.trim(),
dsdCertDate:el("f-dsdcert").value||null, dsdCertNo:el("f-dsdcertno").value.trim(),
kind:formKind||kindOfItem(editing)||"",
pstart:el("f-pstart").value||null, pend:el("f-pend").value||null, team:el("f-powner").value.trim(),
prog:el("f-prog").value===""?null:Math.max(0,Math.min(100,+el("f-prog").value||0)),
pgoal:el("f-pgoal").value.trim(), prisk:el("f-prisk").value.trim(), ms:msDraft.filter(x=>x.t),
astart:hhmm(el("f-astart").value), aend:hhmm(el("f-aend").value), aplace:el("f-aplace").value.trim(),
apax:+el("f-apax").value||0, apaxreal:+el("f-apaxreal").value||0, aorg:el("f-aorg").value.trim(),
aprep:apDraft.filter(x=>x.t),
note:el("f-note").value.trim(), group:editing?.group||"", quad:curQuad,
why:el("f-why").value.trim(), inv:el("f-inv").value.trim(), whr:el("f-whr").value.trim(), how:el("f-how").value.trim(),
tag:el("f-tag").value.trim(), color:"", stk:formStk.filter(stkValid).slice(0,4),
months:[...el("f-months").querySelectorAll("input:checked")].map(i=>+i.value),
skip:(el("wrap-occ").hidden?(editing?.skip||[]):occSkipDraft.slice()),
ov:(()=>{const ov={...(editing?.ov||{})}; if(!el("wrap-occ").hidden)el("f-occs").querySelectorAll(".oc:checked").forEach(i=>{delete ov[i.value];}); return ov;})(),
done:(()=>{const box=el("f-occs"); if(el("wrap-occ").hidden)return editing?.done||[];
const shown=[...box.querySelectorAll(".oc")].map(i=>i.value);
const keep=(editing?.done||[]).filter(v=>!shown.includes(v));
return [...keep,...[...box.querySelectorAll(".oc:checked")].map(i=>i.value)];})()
};
if(el("f-course").value==="__newcrs__"){
const nm=(data.title||"").trim();
if(!nm){el("f-title").focus();return;}
const dup=courses.find(x=>x.name===nm);
if(dup){ data.course=dup.code; setFoot("มีหลักสูตรนี้อยู่แล้ว — ใช้รหัส "+dup.code); }
else{ const code=nextCourseCode();
courses=[...courses,{code,name:nm,skill:data.skill||"",mode:data.mode||"",hours:data.hours||0}];
data.course=code; if(!data.code)data.code=code;
try{ await saveMeta("courses",courses); }catch(e){}
setFoot("เพิ่มหลักสูตร "+code+" ในทะเบียนแล้ว"); }
}
el("dlg").close();
try{ await saveItem(data,editing?._id); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"+(x.fix?"<div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+x.fix+"</div>":"")+"<div style=\"font-size:11.5px;margin-top:8px;opacity:.7\">"+esc(x.raw)+"</div>"); return; }
// สร้างรุ่นที่เหลือให้อัตโนมัติ — เว้นวันที่ จำนวนคน และงบไว้ว่าง
const tot=+data.batches||0;
if(data.train&&tot>1){
const cur=batchNo(data.batch)||1, code=crsCodeOf(data), made=[], skip=[];
for(let i=1;i<=Math.min(tot,60);i++){
if(i===cur)continue;
const lb=batchLabel(data.batch||"รุ่น 1",i);
const dup=items.some(x=>isTrain(x)&&(code?crsCodeOf(x)===code:(x.title||"").trim()===(data.title||"").trim())
&&(x.company||"")===(data.company||"")&&batchNo(x.batch)===i);
if(dup){skip.push(lb);continue;}
const cp=Object.assign({},data,{batch:lb,date:null,dsdEnd:null,dsdCertDate:null,dsdCertNo:"",
status:"รอดำเนินการ",pax:0,hours:data.hours||0,b1:0,b2:0,actual:0,done:[],skip:[]});
delete cp._id;
try{ await saveItem(cp); made.push(lb); }catch(e){}
setFoot("กำลังสร้างรุ่น "+made.length+"/"+(tot-1)+" …");}
if(made.length)tell("<b>สร้างรุ่นให้แล้ว "+made.length+" รุ่น</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"
+esc(made.join(" · "))+(skip.length?"<br><span style=\"opacity:.7\">ข้ามรุ่นที่มีอยู่แล้ว: "+esc(skip.join(" · "))+"</span>":"")
+"<br>เหลือแค่เปิดแต่ละรุ่นแล้วเติม <b>วันที่ · จำนวนคน · งบ</b> ค่ะ</div>");
else if(skip.length)setFoot("ทุกรุ่นมีอยู่แล้ว ไม่ได้สร้างเพิ่ม");}
};
el("del").onclick=async()=>{
if(!editing)return;
const t=editing; el("dlg").close();
if(!await ask("ย้าย “"+esc(t.title)+"” ไปถังขยะใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--ink-3)\">กู้คืนได้ภายใน 30 วันที่ ตั้งค่า › ถังขยะ</div>","ย้ายไปถังขยะ"))return;
await softDel("items",t);
};
let editingIdx=null, editingNote=null, noteBack=false;
function openIdx(x){
editingIdx=x;
el("idlgh").textContent=x?"แก้ไขรายการ Index":"เพิ่มรายการ Index";
el("idel").style.display=x?"":"none";
el("i-title").value=x?.title||"";
fill("i-group",[["","ไม่ระบุหมวด"],...idxCatNames().map(c=>[c,c]),["__new","＋ สร้างหมวดใหม่…"]],(x?.group||"").trim());
el("i-newwrap").hidden=true; el("i-newcat").value="";
el("i-owner").value=x?.owner||""; el("i-url").value=x?.url||"";
fill("i-status",IDXSTATUS.map(v=>[v,v]),x?.status||"ใช้งานอยู่");
el("i-detail").value=x?.detail||""; el("i-note").value=x?.note||""; el("i-fav").checked=!!x?.fav;
el("i-use").value=x?.iuse||""; el("i-who").value=x?.iwho||""; el("i-when").value=x?.iwhen||"";
el("ixowners").innerHTML=[...new Set(idx.map(v=>(v.owner||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("idlg").showModal();
}
el("icancel").onclick=()=>el("idlg").close();
el("i-group").onchange=()=>{ const n=el("i-group").value==="__new"; el("i-newwrap").hidden=!n; if(n)el("i-newcat").focus(); };
el("isave").onclick=async()=>{
if(!el("i-title").value.trim()){el("i-title").focus();return;}
let grp=el("i-group").value; if(grp==="__new"){ grp=el("i-newcat").value.trim(); if(!grp){el("i-newcat").focus();return;} }
const d={title:el("i-title").value.trim(),group:grp,owner:el("i-owner").value.trim(),
url:el("i-url").value.trim(),status:el("i-status").value,detail:el("i-detail").value.trim(),note:el("i-note").value.trim(),iuse:el("i-use").value.trim(),iwho:el("i-who").value.trim(),iwhen:el("i-when").value.trim()};
if(el("i-fav").checked)d.fav=true;
if(editingIdx){ if(editingIdx.ord!=null)d.ord=editingIdx.ord; if(editingIdx.fo!=null)d.fo=editingIdx.fo; }
else if(d.fav){ d.fo=Math.max(0,...idx.filter(v=>v.fav).map(v=>+v.fo||0))+10; }
if(d.fav&&editingIdx&&!editingIdx.fav&&d.fo==null)d.fo=Math.max(0,...idx.filter(v=>v.fav).map(v=>+v.fo||0))+10;
el("idlg").close();
if(grp&&!idxCatNames().includes(grp)) await idxSaveCats([...idxCatNames(),grp]);
try{ editingIdx? await DB.collection("index").doc(editingIdx._id).set(d) : await DB.collection("index").add(d); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
};
el("idel").onclick=async()=>{ if(!editingIdx)return; const x=editingIdx; el("idlg").close();
if(!await ask("ลบ “"+esc(x.title)+"” ใช่ไหมคะ?","ลบรายการ"))return;
await softDel("index",x);};
let viewingNote=null;
function viewNote(n){
viewingNote=n;
el("nvk").textContent=n.kind||"โน้ต"; el("nvd").textContent=n.date||"";
el("nvt").textContent=n.title||"(ไม่มีหัวข้อ)";
el("nvb").innerHTML=ntHtml(n)||'<span style="color:var(--ink-3)">(ไม่มีเนื้อหา)</span>'; ntHydrate(el("nvb"));
el("nvtag").textContent=n.tag?"#"+n.tag:"";
el("nvpin").textContent=n.pin?"เลิกปักหมุด":"ปักหมุด";
el("nvdlg").querySelector(".nvbar").style.background=n.color||"var(--accent-2)";
el("nvdlg").showModal();
}
el("nvclose").onclick=()=>el("nvdlg").close();
// พิมพ์ / บันทึกเป็น PDF — วาดเนื้อหาลง iframe ที่ซ่อนไว้ แล้วสั่งพิมพ์ (เลือก "บันทึกเป็น PDF" ในหน้าต่างพิมพ์ได้)
function nvPrintMenu(btn){
let m=el("nvpm"); if(m){ m.remove(); return; }
m=document.createElement("div"); m.id="nvpm"; const r=btn.getBoundingClientRect(), z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
m.style.cssText="position:fixed;z-index:70;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.22);padding:8px;display:flex;flex-direction:column;gap:4px;min-width:170px;top:"+(r.bottom+6)+"px;right:"+Math.max(8,innerWidth-r.right)+"px";
const hasTb=/<table/i.test(el("nvb").innerHTML), last=(()=>{ try{ return localStorage.getItem("sw-print-o"); }catch(e){ return null; } })();
m.innerHTML=`<div style="font-size:12px;color:var(--ink-3);padding:2px 8px">พิมพ์ / บันทึกเป็น PDF</div>`+[["p","แนวตั้ง"],["l","แนวนอน"]].map(([k,t])=>`<button type="button" class="btn ghost sm" data-po="${k}" style="justify-content:flex-start">${(last||(hasTb?"l":"p"))===k?"✓ ":""}${t}</button>`).join("");
(el("nvdlg")).appendChild(m);
m.onclick=e=>{ const b=e.target.closest("[data-po]"); if(!b)return; try{ localStorage.setItem("sw-print-o",b.dataset.po); }catch(er){} m.remove(); nvDoPrint(b.dataset.po); };
setTimeout(()=>{ const off=e=>{ if(!m.contains(e.target)){ m.remove(); document.removeEventListener("pointerdown",off,true); } }; document.addEventListener("pointerdown",off,true); },0);
}
el("nvprint").onclick=e=>{ if(viewingNote)nvPrintMenu(e.currentTarget); };
function nvDoPrint(orient){ const n=viewingNote; if(!n)return;
const css=[...document.querySelectorAll("style")].map(x=>x.textContent).join("\n"), hasTb=/<table/i.test(el("nvb").innerHTML);
const f=document.createElement("iframe"); f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden"; document.body.appendChild(f);
const d=f.contentDocument; d.open();
d.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(n.title||"บันทึก")}</title><style>${css}</style><style>@page{size:A4 ${orient==="l"?"landscape":"portrait"};margin:12mm}html,body{background:#fff!important;height:auto!important;overflow:visible!important;color:#111}body{padding:0;margin:0;display:block}.pp-h{font-size:12px;color:#667;margin-bottom:4px}.pp-t{font-size:22px;font-weight:700;margin:0 0 10px}.nrich.view{max-height:none!important;overflow:visible!important;padding:0!important;font-size:14px}.nrich table{page-break-inside:auto}.nrich tr{page-break-inside:avoid}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body><div class="pp-h">${esc(n.kind||"โน้ต")} · ${esc(n.date||"")}${n.tag?" · #"+esc(n.tag):""}</div><h1 class="pp-t">${esc(n.title||"(ไม่มีหัวข้อ)")}</h1><div class="nrich view">${el("nvb").innerHTML}</div></body></html>`);
d.close();
const go=()=>{ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){ window.print(); } setTimeout(()=>f.remove(),60000); };
setTimeout(go,400); }
el("nvtask").onclick=()=>{ const n=viewingNote; if(n){ el("nvdlg").close(); openNote2Task(n); } };
el("nvedit").onclick=()=>{ const n=viewingNote; el("nvdlg").close(); if(n)openNote(n,true); };
el("nvpin").onclick=async()=>{ const n=viewingNote; if(!n)return; el("nvdlg").close(); try{ await DB.collection("note").doc(n._id).set({pin:!n.pin},{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } };
// ---- แปลงบันทึก → งานใน Matrix
let n2tNote=null, n2tRows=[];
function n2tExtract(n){
const d=document.createElement("div"); d.innerHTML=ntHtml(n);
let lines=[...d.querySelectorAll("li")].map(x=>(x.textContent||"").trim());
if(!lines.length)lines=ntPlain(n,true).split(/\n+/).map(s2=>s2.replace(/^[\s\-–•*·☐☑\d.)]+/,"").trim());
return [...new Set(lines.filter(s2=>s2.length>=3))].slice(0,30);
}
function openNote2Task(n){
n2tNote=n; n2tRows=n2tExtract(n).map(t=>({t,on:true,q:"",d:"",o:"",why:"",inv:"",whr:"",how:""}));
el("n2tsrc").textContent=n.title||"(ไม่มีหัวข้อ)";
paintN2T(); el("n2tdlg").showModal();
}
function paintN2T(){
el("n2trows").innerHTML=n2tRows.map((r,i)=>`<div class="n2trow${r.on?"":" off"}">
<label class="n2tck"><input type="checkbox" data-n2t="ck:${i}"${r.on?" checked":""}></label>
<input class="n2tt" data-n2t="t:${i}" value="${esc(r.t)}" aria-label="ชื่องาน">
<select data-n2t="q:${i}" aria-label="Matrix"><option value="">Matrix: ยังไม่จัด</option>${QUADS.map((x,k)=>`<option value="${x[0]}"${r.q===x[0]?" selected":""}>${k+1} ${x[1]}</option>`).join("")}</select>
<input type="date" data-n2t="d:${i}" value="${esc(r.d)}" aria-label="Deadline" title="Deadline">
<input data-n2t="o:${i}" value="${esc(r.o)}" placeholder="ผู้รับผิดชอบ" aria-label="ผู้รับผิดชอบ">${w5Has(r)?`<div class="n2tw5">${w5Line(r).replace(/<\/?div[^>]*>/g,"")}</div>`:""}</div>`).join("")||`<div class="empty">ไม่พบข้อความที่แยกเป็นงานได้ — ลองเขียนเป็นบูเลตทีละข้อในบันทึก</div>`;
const k=n2tRows.filter(r=>r.on&&r.t.trim()).length;
el("n2tgo").textContent="สร้าง "+k+" งาน"; el("n2tgo").disabled=!k;
}
el("n2trows").addEventListener("change",e=>{ if(e.target.tagName==="SELECT"||e.target.type==="date")e.target.dispatchEvent(new Event("input",{bubbles:true})); });
el("n2trows").addEventListener("input",e=>{ const k=e.target.dataset.n2t; if(!k)return; const [f,i]=k.split(":"); const r=n2tRows[+i]; if(!r)return;
 if(f==="ck"){ r.on=e.target.checked; paintN2T(); } else if(f==="t"){ r[f]=e.target.value; const c=n2tRows.filter(x=>x.on&&x.t.trim()).length; el("n2tgo").textContent="สร้าง "+c+" งาน"; el("n2tgo").disabled=!c; } else r[f]=e.target.value; });
el("n2tall").onclick=()=>{ const on=!n2tRows.every(r=>r.on); n2tRows.forEach(r=>r.on=on); paintN2T(); };
el("n2tcancel").onclick=()=>el("n2tdlg").close();
el("n2tai").onclick=async()=>{
const b=el("n2tai"); if(!n2tNote||!n2tRows.length)return;
if(AI.live===null)await aiPing();
if(!AI.live){ tell("<b>ยังไม่ได้เชื่อม AI ในแอป</b><div style=\"font-size:13px;margin-top:8px\">เปิดโหมดฝัง AI ที่หน้าผู้ช่วย AI ก่อน แล้วกลับมากดใหม่ได้ค่ะ — หรือกรอกเองตอนแก้งานแต่ละอัน</div>"); return; }
b.disabled=true; const old=b.textContent; b.textContent="AI กำลังอ่านบันทึก…";
try{
const list=n2tRows.map((r,i)=>i+": "+r.t).join("\n");
const txt=await aiAskText(W5_SYS+"\nงานนี้คือแยกบันทึกเป็นงานย่อย: ให้เติมเฉพาะสิ่งที่เขียนไว้ในบันทึกหรืออนุมานได้ชัดเจน owner ใส่ได้เฉพาะชื่อที่ปรากฏในบันทึก date ใส่ได้เฉพาะเมื่อบันทึกระบุวัน (YYYY-MM-DD, คำนวณจากวันนี้) quad เป็น q1|q2|q3|q4 หรือ \"\"","วันนี้: "+isoOf(new Date()),
"บันทึก: "+(n2tNote.title||"")+"\n"+ntPlain(n2tNote,true).slice(0,6000)+"\n\nรายการงานที่แยกได้:\n"+list+'\n\nตอบ JSON เป็นอาร์เรย์: [{"i":0,"why":"","inv":"","whr":"","how":"","owner":"","date":"","quad":""}]');
const arr=aiJsonOf(txt); if(!Array.isArray(arr))throw new Error("อ่านคำตอบ AI ไม่ได้ ลองกดอีกครั้ง");
let n=0; arr.forEach(o=>{ const r=n2tRows[+o.i]; if(!r)return; let ch=false;
["why","inv","whr","how","owner"].forEach(k=>{ const v=w5Txt(o[k]); const f=k==="owner"?"o":k; if(v&&!w5Txt(r[f])){ r[f]=v.slice(0,500); ch=true; } });
if(/^\d{4}-\d{2}-\d{2}$/.test(o.date||"")&&!r.d){ r.d=o.date; ch=true; }
if(quadInfo(o.quad)&&!r.q){ r.q=o.quad; ch=true; }
if(ch)n++; });
paintN2T(); b.textContent=n?"AI เติมให้ "+n+" งาน ✓":"ข้อมูลในบันทึกยังไม่พอ";
setTimeout(()=>{ b.textContent=old; },3500);
}catch(e){ b.textContent=old; tell("<b>เติม 5W1H ไม่สำเร็จ</b><div style=\"font-size:13px;margin-top:8px\">"+esc(e.message||e)+"</div>"); }
b.disabled=false;
};
el("n2tgo").onclick=async()=>{
const pick=n2tRows.filter(r=>r.on&&r.t.trim()); if(!pick.length||!n2tNote)return;
const tr=(visible(groups).find(g=>!/อบรม|training|ประชุม|meeting|โปรเจค|โครงการ|project|กิจกรรม|event/i.test(g.label))||groups[0]||{}).key||"";
el("n2tgo").disabled=true; let ok=0;
for(const r of pick){
 try{ await saveItem({title:r.t.trim(),kind:"task",track:tr,type:"",status:"รอดำเนินการ",date:r.d||null,company:"",owner:r.o.trim(),quad:r.q,
  note:"จากบันทึก: "+(n2tNote.title||"(ไม่มีหัวข้อ)"),srcNote:n2tNote._id,why:r.why||"",inv:r.inv||"",whr:r.whr||"",how:r.how||""}); ok++; }catch(e){}
}
el("n2tdlg").close();
tell("<b>สร้างงานแล้ว "+ok+" งาน</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">"+(pick.some(r=>r.q)?"ที่เลือกช่อง Matrix ไว้ไปอยู่ในหน้า Matrix งานแล้ว · ":"")+"ที่ยังไม่จัดลำดับอยู่ในถาด “ยังไม่จัดลำดับ”</div>");
};
// ตัวแก้ไขแบบจัดรูปแบบ
const NE=()=>el("n-body");
function neCmd(cmd,val){ NE().focus(); document.execCommand(cmd,false,val||null); neState(); }
function neLight(){
NE().focus(); const s=getSelection(); if(!s.rangeCount)return; const r=s.getRangeAt(0);
let n=s.anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&n.classList&&n.classList.contains("lt")){ while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n); n.remove(); neState(); return; } n=n.parentNode; }
if(r.collapsed||!NE().contains(r.commonAncestorContainer))return;
const sp=document.createElement("span"); sp.className="lt"; sp.appendChild(r.extractContents()); r.insertNode(sp); s.removeAllRanges(); const r2=document.createRange(); r2.selectNodeContents(sp); s.addRange(r2); neState();
}
function neBlock(tag){ NE().focus(); const cur=(document.queryCommandValue("formatBlock")||"").toLowerCase(); document.execCommand("formatBlock",false,cur===tag||cur==="<"+tag+">"?"p":tag); neState(); }
function neState(){
const on=c=>{try{return document.queryCommandState(c);}catch(e){return false;}};
const blk=(document.queryCommandValue("formatBlock")||"").toLowerCase().replace(/[<>]/g,"");
document.querySelectorAll("#ntool [data-ne]").forEach(b=>{ const k=b.dataset.ne; let v=false;
 if(k==="bold")v=on("bold"); else if(k==="italic")v=on("italic"); else if(k==="underline")v=on("underline"); else if(k==="strike")v=on("strikeThrough");
 else if(k==="ul")v=on("insertUnorderedList"); else if(k==="ol")v=on("insertOrderedList");
 else if(k==="h2")v=blk==="h2"; else if(k==="h3")v=blk==="h3"; else if(k==="link")v=!!neLinkAt(); else if(k==="light"){ let n=getSelection().anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&n.classList&&n.classList.contains("lt")){v=true;break;} n=n.parentNode; } }
 b.classList.toggle("on",v); });
if(typeof neExtraState==="function")neExtraState();
}
el("ntool").addEventListener("mousedown",e=>{ if(e.target.closest("[data-ne]"))e.preventDefault(); });
el("ntool").addEventListener("click",e=>{ const b=e.target.closest("[data-ne]"); if(!b)return; const k=b.dataset.ne;
 if(k==="bold")neCmd("bold"); else if(k==="italic")neCmd("italic"); else if(k==="underline")neCmd("underline"); else if(k==="strike")neCmd("strikeThrough");
 else if(k==="link")neLink(); else if(k==="light")neLight(); else if(k==="h2")neBlock("h2"); else if(k==="h3")neBlock("h3");
 else if(k==="ul")neCmd("insertUnorderedList"); else if(k==="ol")neCmd("insertOrderedList"); else if(k==="hr")neCmd("insertHorizontalRule");
 else if(k==="clear"){ neCmd("removeFormat"); document.execCommand("formatBlock",false,"p"); NE().querySelectorAll(".lt").forEach(n=>{while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n);n.remove();}); } });
let lkRange=null, lkEl=null;
function neLinkAt(){ const s=getSelection(); let n=s.anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&n.tagName==="A")return n; n=n.parentNode; } return null; }
function neLink(a){
NE().focus(); const s=getSelection(); lkRange=(s.rangeCount&&NE().contains(s.getRangeAt(0).commonAncestorContainer))?s.getRangeAt(0).cloneRange():null;
lkEl=a||neLinkAt(); const txt=lkEl?lkEl.textContent:(lkRange&&!lkRange.collapsed?lkRange.toString():"");
el("lk-text").value=txt; el("lk-url").value=lkEl?(lkEl.getAttribute("href")||""):"";
el("lk-rm").style.display=lkEl?"":"none"; el("lk-open").style.display=lkEl?"":"none"; el("lkdlgh").textContent=lkEl?"แก้ไขลิงก์":"แนบลิงก์";
el("lkdlg").showModal(); setTimeout(()=>el("lk-url").focus(),30);
}
function lkFix(u){ u=(u||"").trim(); if(!u)return ""; if(/^(https?:\/\/|mailto:|tel:)/i.test(u))return u; return /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(u)?"mailto:"+u:"https://"+u.replace(/^\/+/,""); }
el("lk-cancel").onclick=()=>el("lkdlg").close();
el("lk-open").onclick=()=>{ const u=lkFix(el("lk-url").value); if(u)window.open(u,"_blank","noopener"); };
el("lk-rm").onclick=()=>{ el("lkdlg").close(); if(lkEl&&NE().contains(lkEl)){ while(lkEl.firstChild)lkEl.parentNode.insertBefore(lkEl.firstChild,lkEl); lkEl.remove(); } NE().focus(); neState(); };
el("lk-ok").onclick=()=>{
const u=lkFix(el("lk-url").value); if(!u){ el("lk-url").focus(); return; }
const t=el("lk-text").value.trim()||u.replace(/^(https?:\/\/|mailto:|tel:)/i,"");
el("lkdlg").close(); NE().focus(); const s=getSelection(); s.removeAllRanges(); if(lkRange)s.addRange(lkRange);
if(lkEl&&NE().contains(lkEl)){ lkEl.setAttribute("href",u); lkEl.textContent=t; }
else{ const a=document.createElement("a"); a.href=u; a.textContent=t; const sp=document.createTextNode("\u00A0");
 if(lkRange){ lkRange.deleteContents(); lkRange.insertNode(sp); lkRange.insertNode(a); } else{ NE().appendChild(a); NE().appendChild(sp); }
 const r=document.createRange(); r.setStartAfter(sp); r.collapse(true); s.removeAllRanges(); s.addRange(r); }
neState(); };
el("lk-url").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); el("lk-ok").click(); } });
NE().addEventListener("click",e=>{ const a=e.target.closest&&e.target.closest("a"); if(a&&NE().contains(a)){ e.preventDefault(); if(e.ctrlKey||e.metaKey)window.open(a.href,"_blank","noopener"); else neLink(a); } });
NE().addEventListener("keyup",neState); NE().addEventListener("mouseup",neState);
function openNote(n,fromView){
editingNote=n; noteBack=!!(n&&fromView);
el("ndlgh").textContent=n?"แก้ไขบันทึก":"เขียนบันทึกใหม่";
el("ndel").style.display=n?"":"none";
el("n-title").value=n?.title||"";
fill("n-kind",NOTEKIND.map(v=>[v,v]),n?.kind||"บันทึกการประชุม");
el("n-date").value=n?.date||new Date().toISOString().slice(0,10);
el("n-tag").value=n?.tag||""; NE().innerHTML=n?ntHtml(n):""; ntHydrate(NE()); if(typeof neHideAll==="function")neHideAll(); if(typeof neHistReset==="function")neHistReset();
el("n-pin").checked=!!n?.pin;
el("n-folder").innerHTML=`<option value="">— ไม่อยู่ในโฟลเดอร์ —</option>`+noteFolders.map(f=>`<option value="${esc(f.id)}">📁 ${esc(f.name)}</option>`).join("");
el("n-folder").value=n?(n.folder||""):((R.noteFolder&&R.noteFolder!=="__none")?R.noteFolder:"");
el("n-colors").innerHTML=[["","ค่าเริ่มต้น"],...TAGCOLORS.map(c=>[c,c])].map(([c])=>
`<button type="button" class="sw1${(n?.color||"")===c?" on":""}" data-ncolor="${c}" style="${c?`background:${c}`:"background:var(--line-2)"}">${c?"":"—"}</button>`).join("");
el("n-colors").querySelectorAll("[data-ncolor]").forEach(b=>b.onclick=()=>{
el("n-colors").querySelectorAll("[data-ncolor]").forEach(x=>x.classList.remove("on"));
b.classList.add("on"); el("n-colors").dataset.val=b.dataset.ncolor;});
el("n-colors").dataset.val=n?.color||"";
el("ntaglist").innerHTML=[...new Set(notes.map(v=>(v.tag||"").trim()).filter(Boolean))].map(g=>`<option value="${esc(g)}">`).join("");
el("ndlg").showModal(); neState();
}
el("ncancel").onclick=()=>{ const n=editingNote, back=noteBack; el("ndlg").close(); if(back&&n)viewNote(n); };
el("nsave").onclick=async()=>{
const d={title:el("n-title").value.trim(),kind:el("n-kind").value,date:el("n-date").value||null,
tag:el("n-tag").value.trim(),body:ntClean(NE().innerHTML),fmt:"h",color:el("n-colors").dataset.val||"",pin:el("n-pin").checked,folder:el("n-folder").value||""};
if(!d.title&&!(NE().textContent||"").trim()){el("n-title").focus();return;}
if(editingNote){ const old=editingNote.body||"", prev=editingNote.hist||[];
 if(old!==d.body&&old.length<300000)d.hist=[{at:new Date().toISOString(),t:editingNote.title||"",f:editingNote.fmt||"",b:old},...prev].slice(0,8); else if(prev.length)d.hist=prev; }
const back=noteBack&&editingNote, prevN=editingNote; el("ndlg").close();
if(back)viewNote({...prevN,...d,_id:prevN._id}); // โชว์การ์ดทันที (ไม่รอเซิร์ฟเวอร์) แล้วบันทึกเบื้องหลัง
try{ editingNote? await DB.collection("note").doc(editingNote._id).set(d) : await DB.collection("note").add(d); }
catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); }
};
el("ndel").onclick=async()=>{ if(!editingNote)return; const n=editingNote; el("ndlg").close();
if(!await ask("ลบบันทึกนี้ใช่ไหมคะ?","ลบบันทึก"))return;
await softDel("note",n);};
let editingDsd=null;
let editingCrs=null, crsFilingYear=THISYEAR;
function openCrs(code){
const c=crsOf(code); if(!c)return;
editingCrs=code;
const bs=crsBatches(code).slice().sort((x,y)=>String(x.date||"9999").localeCompare(String(y.date||"9999")));
const pax=bs.reduce((a,t)=>a+(+t.pax||0),0);
const cost=bs.reduce((a,t)=>a+((+t.actual||0)||budgetOf(t)),0);
const yrs=[...new Set(bs.map(t=>t.date?new Date(t.date).getFullYear():null).filter(Boolean))].sort();
el("crsdlgh").textContent=c.code+" · "+c.name;
el("crs-kpi").innerHTML=`<div><span>จำนวนรุ่น</span><b>${bs.length}</b></div>
<div><span>ผู้เข้าอบรมสะสม</span><b>${baht(pax)} คน</b></div>
<div><span>ชั่วโมง/คน</span><b>${c.hours||"—"}</b></div>
<div><span>บังคับตามกฎหมาย</span><b>${c.law===true?"ใช่ (ตั้งที่หลักสูตร)":c.law===false?"ไม่ (ตั้งที่หลักสูตร)":"ตามประเภทงาน"}</b></div>
<div><span>งบ/ใช้จริงรวม</span><b>${baht(cost)} ฿</b></div>
<div><span>ปีที่จัด</span><b>${yrs.length?yrs.map(y=>y+543).join(", "):"—"}</b></div>
<div><span>รับรองแล้ว</span><b>${bs.filter(t=>t.dsdCertNo||t.dsd==="อนุมัติแล้ว").length}/${bs.length} รุ่น</b></div>`;
crsFilingYear=R.year;
paintCrsFiling();
el("crs-rows").innerHTML=bs.map(t=>{const y=ypState(t), d=t.date?new Date(t.date):null;
return `<div class="li" data-crsitem="${t._id}">
<div class="ic" style="background:var(--accent-soft);color:var(--accent)">${d?d.getDate()+"<br>"+MTH[d.getMonth()]:"—"}</div>
<div class="tx"><div class="t1">${esc(crsCodeOf(t)||"")} ${esc(t.batch||"ไม่ระบุรุ่น")}${t.company?" · "+esc(cLabel(t.company)):""}</div>
<div class="t2">${t.pax?t.pax+" คน · ":""}${ypNoOf(t)?"ยป. "+esc(ypNoOf(t))+" · ":""}${t.dsdCertNo?"รับรอง "+esc(t.dsdCertNo):esc(y.step)}</div></div>
<span class="pill ${sCls(t.status)}">${esc(t.status)}</span></div>`;}).join("")||`<div class="empty">ยังไม่มีรุ่นของหลักสูตรนี้</div>`;
el("crsdlg").showModal();
}
el("crscancel").onclick=()=>el("crsdlg").close();
function paintCrsFiling(){
const c=crsOf(editingCrs); if(!c)return;
const f=crsFiling(editingCrs,crsFilingYear);
fill("crs-fyear",yearList().map(y=>[y,"ปี "+(y+543)]),crsFilingYear);
fill("crs-yp",YP,f.yp||c.yp||"");
el("crs-openno").value=f.openNo||""; el("crs-opendate").value=f.openDate||"";
const other=Object.keys(c.filings||{}).filter(y=>+y!==crsFilingYear&&(c.filings[y].openNo||c.filings[y].openDate));
el("crs-fhint").innerHTML=other.length
?"ปีอื่นที่เคยยื่นไว้: "+other.map(y=>`<b>${+y+543}</b> ${esc(c.filings[y].openNo||"—")}`).join(" · ")
:"ยังไม่มีเลขคำขอของปีอื่นในระบบ";
}
el("crs-fyear")&&(el("crs-fyear").onchange=()=>{saveCrsFiling(); crsFilingYear=+el("crs-fyear").value; paintCrsFiling();});
function saveCrsFiling(){
const c=crsOf(editingCrs); if(!c)return;
const no=el("crs-openno").value.trim(), dt=el("crs-opendate").value||"", yp=el("crs-yp").value;
c.filings=c.filings||{};
if(no||dt||yp)c.filings[crsFilingYear]={yp,openNo:no,openDate:dt};
else delete c.filings[crsFilingYear];
}
el("crssave").onclick=async()=>{
if(!crsOf(editingCrs))return;
saveCrsFiling();
el("crsdlg").close(); render(); await saveMeta("courses",courses);};
el("crs-copy").onclick=async()=>{
const code=editingCrs, bs=crsBatches(code); if(!bs.length){tell("ยังไม่มีรุ่นให้คัดลอกค่ะ");return;}
const yNow=Math.max(...bs.map(t=>t.date?new Date(t.date).getFullYear():THISYEAR));
const src=bs.filter(t=>t.date&&new Date(t.date).getFullYear()===yNow);
if(!src.length){tell("รุ่นที่มีอยู่ยังไม่ได้ใส่วันที่ คัดลอกข้ามปีไม่ได้ค่ะ");return;}
el("crsdlg").close();
if(!await ask(`คัดลอก <b>${src.length}</b> รุ่นของปี ${yNow+543} ไปเป็นปี ${yNow+544} ใช่ไหมคะ?<div style="font-size:13px;margin-top:8px">เลื่อนวันที่ +1 ปี · สถานะกลับเป็นรอดำเนินการ · ไม่คัดลอกเลขคำขอและใช้จริง</div>`,"คัดลอก"))return;
let ok=0;
for(const t of src){
const {_id,...r}=t;
const nd=new Date(t.date); nd.setFullYear(nd.getFullYear()+1);
try{ await saveItem(Object.assign({},r,{date:isoOf(nd),status:"รอดำเนินการ",actual:0,done:[],
dsdOpenNo:"",dsdOpenDate:null,dsdCertNo:"",dsdCertDate:null,dsdEnd:null,dsd:"รอยื่น"})); ok++; }catch(e){}
setFoot("กำลังคัดลอก "+ok+"/"+src.length+" …");}
render(); tell("<b>คัดลอกแล้ว "+ok+" รุ่น</b> ไปปี "+(yNow+544)+"<div style=\"font-size:13px;margin-top:8px\">เปิดแต่ละรุ่นเพื่อแก้วันที่จริงได้เลยค่ะ</div>");};
el("crs-rows")&&el("crsdlg").addEventListener("click",e=>{
const n=e.target.closest("[data-crsitem]"); if(!n)return;
const t=items.find(x=>x._id===n.dataset.crsitem); if(!t)return;
el("crsdlg").close(); setTimeout(()=>openCard(t),200);});
let editingGl=null, glDraft=null, glDraftCo="";
function openGlPlan(key){
const g=gls.find(x=>x.key===key); if(!g)return;
const y=R.glYear||R.year;
editingGl={key,y};
glDraft={}; const P=glPlan(g,y); Object.keys(P).forEach(ck=>glDraft[ck]=glPlanMonths(g,y,ck));
const cos=visible(companies).filter(c=>!c.isGroup);
const list=cos.length?cos:companies;
el("gbdlgh").textContent="งบรายเดือน · "+(g.dept?g.dept+" · ":"")+(g.code?g.code+" · ":"")+g.label+" · ปี "+(y+543);
fill("gb-co",list.map(c=>[c.key,c.label]),glDraftCo&&list.some(c=>c.key===glDraftCo)?glDraftCo:list[0]?.key||"");
glDraftCo=el("gb-co").value;
paintGlMonths(); paintGlFlat();
el("gbdlg").showModal();
}
// ยอดรายปีก้อนเดิม (ไม่มีแผนรายเดือน) — แสดงที่มา และให้กดดึงมาเกลี่ยเป็นรายเดือนได้
function paintGlFlat(){
const b=el("gb-flat"); if(!b||!editingGl)return;
const g=gls.find(x=>x.key===editingGl.key), y=editingGl.y;
const flat=g&&!hasPlan(g,y)?glBudget(g,y):0;
const cur=readGlMonths().reduce((s2,v)=>s2+v,0);
if(!flat||cur){ b.hidden=true; b.innerHTML=""; return; }
b.hidden=false;
b.innerHTML=`<div>หมวดนี้มี <b>ยอดรายปี ${baht(flat)} ฿</b> ที่ตั้งไว้แบบก้อนเดียว (จากการตั้งงบรายปีแบบเดิม หรือปุ่ม “คัดลอกงบจากปีก่อน”) — ยังไม่ได้แยกเป็นรายเดือน/รายบริษัท จึงเห็นในรายการแต่ช่องรายเดือนว่าง<br><button type="button" class="btn sm" id="gb-useflat" style="margin-top:8px">ดึง ${baht(flat)} ฿ มาเกลี่ย 12 เดือนให้บริษัทที่เลือก</button> <span style="font-size:12px;opacity:.8">แล้วแก้รายเดือนได้ · ถ้าแบ่งหลายบริษัทให้ใส่ทีละบริษัทให้ยอดรวมเท่ากับก้อนนี้</span></div>`;
el("gb-useflat").onclick=()=>{ const per=Math.round(flat/12); [...el("gb-months").querySelectorAll(".gm")].forEach((i,k)=>i.value=k===11?flat-per*11:per); paintGlSum(); paintGlFlat(); };
}
function readGlMonths(){ return [...el("gb-months").querySelectorAll(".gm")].map(i=>+i.value||0); }
function stashGl(){ if(glDraft&&glDraftCo)glDraft[glDraftCo]=readGlMonths(); }
function paintGlMonths(){
const arr=(glDraft&&glDraft[glDraftCo])||Array(12).fill(0);
el("gb-months").innerHTML=MTH.map((m,i)=>`<label class="mcell"><span>${m}</span><input type="number" min="0" class="gm" value="${arr[i]||""}" placeholder="—"></label>`).join("");
paintGlSum();
}
function paintGlSum(){
const cur=readGlMonths().reduce((a,b)=>a+b,0);
const others=Object.keys(glDraft||{}).filter(k=>k!==glDraftCo).reduce((s2,k)=>s2+(glDraft[k]||[]).reduce((a,b)=>a+(+b||0),0),0);
el("gb-sum").innerHTML=`<div><span>รวมบริษัทนี้</span><b>${baht(cur)} ฿</b></div>
<div><span>บริษัทอื่นที่ตั้งไว้แล้ว</span><b>${baht(others)} ฿</b></div>
<div><span>รวมทั้งหมวดในปีนี้</span><b style="color:var(--accent)">${baht(cur+others)} ฿</b></div>`;
}
el("gb-co").onchange=()=>{ stashGl(); glDraftCo=el("gb-co").value; paintGlMonths(); paintGlFlat(); };
el("gbdlg").addEventListener("input",e=>{ if(e.target.classList.contains("gm")){ paintGlSum(); paintGlFlat(); } });
el("gb-spread").onclick=()=>{
const tot=readGlMonths().reduce((a,b)=>a+b,0);
if(!tot){tell("ใส่ยอดในเดือนใดเดือนหนึ่งก่อน ระบบจะเกลี่ยให้ค่ะ");return;}
const per=Math.round(tot/12);
[...el("gb-months").querySelectorAll(".gm")].forEach((i,k)=>i.value=k===11?tot-per*11:per);
paintGlSum();};
el("gbcancel").onclick=()=>el("gbdlg").close();
el("gbsave").onclick=async()=>{
if(!editingGl)return; stashGl();
const g=gls.find(x=>x.key===editingGl.key); if(!g){el("gbdlg").close();return;}
const y=editingGl.y;
if(g.plan&&g.plan[y])delete g.plan[y];
Object.keys(glDraft).forEach(ck=>setGlPlan(g,y,ck,glDraft[ck]));
el("gbdlg").close(); render(); await saveMeta("gl",gls);};
function openDsd(ck){
const y=R.year, c=companies.find(x=>x.key===ck); if(!c)return;
const r=dsdRec(ck,y)||{id:"",months:Array(12).fill(""),sent:0,repeatPersons:0,repeatTimes:0,passSkill:0,passStd:0};
editingDsd={ck,y};
el("ddlgh").textContent="กรมพัฒนาฯ · "+c.label+" · ปี "+(y+543);
el("d-id").value=r.id||"";
el("d-months").innerHTML=MTH.map((m,i)=>`<label class="mcell"><span>${m}</span><input type="number" min="0" class="dm" value="${(r.months&&r.months[i]!=null&&r.months[i]!=="")?r.months[i]:""}" placeholder="—"></label>`).join("");
el("d-goal").value=(+r.goal&&+r.goal>LAWPCT)?r.goal:"";
el("d-sent").value=r.sent||""; el("d-rp").value=r.repeatPersons||""; el("d-rt").value=r.repeatTimes||"";
el("d-ps").value=r.passSkill||""; el("d-fund").value=r.fundPaid||"";
fill("d-st2",ST2.map(x=>[x,x]),r.st2||ST2[0]);
el("d-st2date").value=r.st2date||""; el("d-st2no").value=r.st2no||""; el("d-st2note").value=r.st2note||"";
const auto=trainedPax(ck,y);
el("d-hint").innerHTML=`ระบบนับผู้เข้าอบรมจากหลักสูตรที่ปิดงานแล้วในปีนี้ได้ <b>${auto}</b> คน — ใช้เทียบได้ แต่เลข A ให้ยึดตามหน้าเว็บกรมฯ`;
syncPassSkill(true);
el("ddel").style.display=dsdRec(ck,y)?"":"none";
paintDsd();
el("ddlg").showModal();
}
function syncPassSkill(fill0){
if(!editingDsd)return;
const A=+el("d-sent").value||0, rt=+el("d-rt").value||0;
const autoP=Math.max(0,A-rt);
if(fill0||!el("d-ps").value||el("d-ps").dataset.auto==="1"){ el("d-ps").value=autoP||""; el("d-ps").dataset.auto="1"; }
const keyed=+el("d-ps").value||0;
const reg=trainedPax(editingDsd.ck,editingDsd.y), regD=trainedPaxDsd(editingDsd.ck,editingDsd.y);
const same=keyed===autoP;
el("d-pshint").innerHTML=`C = A − ครั้งที่ซ้ำ = <b>${baht(autoP)}</b> คน (หัวคนไม่ซ้ำ)`
+(same?"":` · <span style="color:var(--over)">คุณคีย์ ${baht(keyed)} ต่างจากสูตร ${baht(Math.abs(keyed-autoP))} คน</span>`)
+`<br>ทะเบียนหลักสูตร: ปิดงานแล้วรวม <b>${baht(reg)}</b> คน · เฉพาะรุ่นที่กรมฯ รับรองแล้ว <b>${baht(regD)}</b> คน`
+(regD===keyed?' <span style="color:var(--ok)">· ตรงกับที่กรมฯ รับรอง ✓</span>'
:` <span style="color:var(--over)">· ต่างจากที่กรมฯ รับรอง ${baht(Math.abs(regD-keyed))} คน — ตรวจทานอีกครั้ง</span>`);
}
function paintDsd(){
syncPassSkill(false);
const ms=[...el("d-months").querySelectorAll(".dm")].map(i=>+i.value||0);
const k=dsdCalc({months:ms,sent:+el("d-sent").value||0,repeatTimes:+el("d-rt").value||0,goal:+el("d-goal").value||0,fundPaid:+el("d-fund").value||0});
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
el("d-ps").addEventListener("input",()=>{el("d-ps").dataset.auto="0";});
el("ddlg").addEventListener("input",e=>{ if(e.target.closest("#ddlg"))paintDsd(); });
el("dcancel").onclick=()=>el("ddlg").close();
el("dsave").onclick=async()=>{
if(!editingDsd)return;
const {ck,y}=editingDsd;
const months=[...el("d-months").querySelectorAll(".dm")].map(i=>i.value===""?"":(+i.value||0));
hrdata.dsd=hrdata.dsd||{}; hrdata.dsd[ck]=hrdata.dsd[ck]||{};
hrdata.dsd[ck][y]={updatedAt:new Date().toISOString(),id:el("d-id").value.trim(),months,goal:+el("d-goal").value||0,
sent:+el("d-sent").value||0,repeatPersons:+el("d-rp").value||0,repeatTimes:+el("d-rt").value||0,
passSkill:+el("d-ps").value||0,fundPaid:+el("d-fund").value||0,
st2:el("d-st2").value,st2date:el("d-st2date").value,st2no:el("d-st2no").value.trim(),st2note:el("d-st2note").value.trim()};
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
await softDel("legal",L);
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
await softDel("ledger",x);
};
let gateMode="setup";

// ===== การ์ดดูงาน (เปิดงานเดิม → ดูก่อน แล้วกด "แก้ไข" ค่อยเข้าฟอร์ม) =====
let cardItem=null;
// ตัวช่วยสร้างการ์ด (ใช้ร่วมกันทุกหน้า)
const cV=(label,val,wide)=>{
const has=!(val===undefined||val===null||String(val).trim()==="");
return `<div class="vf${wide?" w":""}"><span>${esc(label)}</span><b class="${has?"":"mut"}">${has?esc(String(val)):"—"}</b></div>`;};
const cR=(label,val,wide)=>(val===undefined||val===null||String(val).trim()==="")?"":cV(label,val,wide);
const cH=(label,html,wide)=>`<div class="vf${wide?" w":""}"><span>${esc(label)}</span><b>${html}</b></div>`;
const cS=(title,inner)=>inner.trim()?`<div class="vsec"><h4>${esc(title)}</h4><div class="vgrid">${inner}</div></div>`:"";
let cardCtx=null;
function cardShow(o){
cardCtx=o;
el("vc-kind").textContent=o.kind||""; el("vc-date").textContent=o.date||"";
el("vc-bar").style.background=o.color||"var(--accent-2)";
el("vc-title").textContent=o.title||"(ไม่มีชื่อ)";
el("vc-pills").innerHTML=o.pills||""; el("vc-body").innerHTML=o.body||"";
el("vc-del").style.display=o.del?"":"none";
if(!el("cardlg").open)el("cardlg").showModal();
}
let cardOcc="";   // วันที่ (รอบ) ที่การ์ดกำลังพูดถึง — ใช้กับงานที่เกิดซ้ำ
function openCard(t,occIso){
if(!t)return;
cardItem=t;
const kind=kindOfItem(t)||(isTrain(t)?"train":isMeet(t)?"meet":"");
const V=cV,R_=cR,sec=cS;
let S=occState(t);
// งานเกิดซ้ำ: การ์ดแสดง "รอบวันที่..." พร้อมสถานะของรอบนั้นโดยเฉพาะ
let O=null; cardOcc="";
if(rr(t)){ if(occIso&&occursOn(t,isoDate(occIso)))O=isoDate(occIso); else if(S.d)O=S.d; else{ const l=occList(t,new Date(new Date().getFullYear(),new Date().getMonth()-1,1),6); O=l.find(d=>d>=new Date(new Date().setHours(0,0,0,0)))||l[l.length-1]||null; }
if(O){ cardOcc=isoOf(O); const st=occStat(t,O), od=O<new Date(new Date().setHours(0,0,0,0))&&isOpenStatus(st);
S={label:od?"ค้างรอบนี้":st,cls:od?"s-over":sCls(st),recur:true,d:O,st}; } }
const _kind=KINDLAB[kind]||"งาน", _date=(t.code?t.code+" · ":"")+(O?"รอบวันที่ "+O.getDate()+" "+MTH[O.getMonth()]+" "+(O.getFullYear()+543)+" · "+rruleText(t):(t.date?fmtDate(t.date)+" "+(new Date(t.date).getFullYear()+543):(rr(t)?rruleText(t):"")));
const _pills=`<span class="pill ${S.cls}">${esc(S.label)}</span>`+(quadOf(t)?` <b class="qtag q-${quadOf(t)}">${quadOf(t).slice(1)} ${esc(quadInfo(quadOf(t))[1])}</b>`:"");
const main=R_("บริษัท",t.company?cLabel(t.company):"")+R_("กลุ่มงาน",t.track?gLabel(t.track):"")
+R_("ประเภท",t.type)+R_("ป้ายกำกับ",t.tag)+R_("รหัสอ้างอิง",t.code);
const when=V("ผู้รับผิดชอบ",t.owner)+V(rr(t)?"เริ่ม / วันที่อ้างอิง":"วันที่",t.date?fmtDate(t.date)+" "+(new Date(t.date).getFullYear()+543):"")
+(rr(t)?V("การเกิดซ้ำ",rruleText(t)):R_("รอบงาน",t.recurring))
+(rr(t)&&t.recurring?R_("หมายเหตุรอบงาน",t.recurring):"")
+R_("เดือนที่มีงาน",(t.months||[]).map(m=>MTH[m-1]).join(" "),true);
const meet=isMeet(t)&&kind!=="proj"&&kind!=="act"?sec("ข้อมูลการประชุม",R_("เวลาเริ่ม",tShow(t.time))+R_("สถานที่ / ลิงก์",t.place)+R_("ผู้เข้าร่วม / ประธาน",t.attendees)
+R_("เตรียมข้อมูลล่วงหน้า",+t.prepDays?t.prepDays+" วัน":"")+R_("สิ่งที่ต้องเตรียม",t.prepNote,true)):"";
const train=isTrain(t)&&kind!=="proj"&&kind!=="act"?sec("ข้อมูลการฝึกอบรม",
R_("หลักสูตร",crsCodeOf(t))+R_("รุ่นที่",t.batch?(t.batch+(+t.batches>1?" / "+t.batches:"")):"")
+R_("ผู้เข้าอบรม",t.pax?t.pax+" คน":"")+R_("ชั่วโมงต่อคน",t.hours)+R_("วิทยากร / สถาบัน",t.vendor)+R_("สถานที่",t.place)
+R_("หมวดทักษะ",t.skill)+R_("รูปแบบ",t.mode)+R_("ยื่นกรมพัฒนาฝีมือแรงงาน",t.dsd)+R_("แบบที่ยื่น (ยป.)",t.yp)
+R_("วันที่ฝึกเสร็จสิ้น",t.dsdEnd?fmtDate(t.dsdEnd):"")+R_("วันที่ยื่นขอเปิด",t.dsdOpenDate?fmtDate(t.dsdOpenDate):"")+R_("เลขคำขอเปิด",t.dsdOpenNo)
+R_("วันที่ยื่นรับรองรุ่น",t.dsdCertDate?fmtDate(t.dsdCertDate):"")+R_("เลขคำขอรับรอง",t.dsdCertNo)):"";
const chips=a=>chkList(a).length?`<div class="vf w"><span>${a===t.ms?"ขั้นตอนย่อย":"ของที่ต้องเตรียม"}</span><div class="vchips">${chkList(a).map(x=>`<em>${x.d?"✓ ":"○ "}${esc(x.t)}</em>`).join("")}</div></div>`:"";
const pv=(t.prog!==undefined&&t.prog!==null&&t.prog!=="")?Math.max(0,Math.min(100,+t.prog||0)):null;
const proj=kind==="proj"?sec("รายละเอียดโปรเจค",R_("วันเริ่ม",t.pstart?fmtDate(t.pstart):"")+R_("กำหนดเสร็จ",t.pend?fmtDate(t.pend):"")+R_("ทีมงาน",t.team)
+(pv!==null?`<div class="vf"><span>ความคืบหน้า</span><b>${pv}%</b><div class="vbar"><i style="width:${pv}%"></i></div></div>`:"")
+R_("เป้าหมาย",t.pgoal,true)+R_("อุปสรรค / ความเสี่ยง",t.prisk,true)+chips(t.ms)):"";
const act=kind==="act"?sec("รายละเอียดกิจกรรม",R_("เวลา",(t.astart?tShow(t.astart):"")+(t.aend?" – "+tShow(t.aend):""))+R_("สถานที่",t.aplace)
+R_("ผู้เข้าร่วม (เป้า)",t.apax?t.apax+" คน":"")+R_("ผู้เข้าร่วม (จริง)",t.apaxreal?t.apaxreal+" คน":"")+R_("ผู้จัด / ผู้รับเหมา",t.aorg)+chips(t.aprep)):"";
const glL=(g,b)=>g?`${glLabel(glKeyOf(g))}${+b?" · "+baht(b)+" ฿":""}`:"";
const money=sec("งบประมาณ",R_("หมวด GL หลัก",glL(t.gl1,t.b1),true)+R_("หมวด GL รอง",glL(t.gl2,t.b2),true)
+R_("งบรวม",budgetOf(t)?baht(budgetOf(t))+" ฿":"")+R_("ใช้จริง",+t.actual?baht(t.actual)+" ฿":""));
const k5=isTrain(t)?"train":isMeet(t)?"meet":"task", L5=W5LAB[k5];
const w5=sec("5W1H",R_(L5[0],t.why,true)+R_(L5[2],t.inv,true)+(k5==="task"?R_("Where · สถานที่ / ระบบ / ลิงก์",t.whr,true):"")+R_(L5[4],t.how,true));
const note=R_("",t.note,true)?sec("รายละเอียด",V("หมายเหตุ",t.note,true)):"";
const _o=rr(t)?S.d:null, _isoO=_o?isoOf(_o):"";
const curSt=_o?S.st:normSt(t.status);
const quick=`<div class="vsec vquick"><h4>${_o?`สถานะ · รอบวันที่ ${_o.getDate()} ${MTH[_o.getMonth()]}`:"สถานะ"}${_o?`<span class="vq-nav"><button type="button" data-vqnav="-1" title="รอบก่อนหน้า">${svg('<path d="M15 6l-6 6 6 6"/>',14)}</button><button type="button" data-vqnav="1" title="รอบถัดไป">${svg('<path d="M9 6l6 6-6 6"/>',14)}</button></span>`:""}</h4><div class="vq-row">
${rr(t)&&_o?(curSt!==STATUS_DONE&&curSt!==STATUS_CANCEL?`<button type="button" class="btn vq-big ok" data-vqocc="${_isoO}">${svg(ICON.check,15)} ปิดรอบ ${_o.getDate()} ${MTH[_o.getMonth()]}</button>`:"")
:(!rr(t)&&t.status!==STATUS_DONE?`<button type="button" class="btn vq-big ok" data-vqst="${STATUS_DONE}">${svg(ICON.check,15)} เสร็จแล้ว</button>`:"")}
<div class="vq-chips">${STATUS.map(x=>`<button type="button" class="vq ${sCls(x)}${x===curSt?" on":""}" data-vqst="${x}">${esc(x)}</button>`).join("")}</div></div>
${rr(t)?`<div class="hint" style="margin:6px 0 0;font-size:11.5px">${t.status===STATUS_CANCEL?"ยกเลิกทั้งซีรีส์อยู่ — เลือกสถานะอื่นเพื่อเปิดงานนี้กลับมา · ":""}สถานะมีผลเฉพาะรอบวันที่ ${_o?_o.getDate()+" "+MTH[_o.getMonth()]:"—"} รอบอื่นไม่กระทบ · ตอนกด “ยกเลิก” เลือกได้ว่าจะยกเลิกแค่รอบนี้ หรือรอบนี้เป็นต้นไป หรือทุกรอบ</div>`:""}</div>`;
cardShow({kind:_kind,date:_date,title:t.title,color:({"s-done":"var(--ok)","s-over":"var(--over)","s-run":"var(--run)","s-cancel":"var(--ink-3)"})[S.cls]||"var(--wait)",pills:_pills,body:quick+sec("รายละเอียด",when+main)+meet+train+proj+act+money+w5+note,
edit:()=>open_(t),del:async()=>{
if(!await ask("ย้าย “"+esc(t.title)+"” ไปถังขยะใช่ไหมคะ?<div style=\"font-size:13px;margin-top:8px;color:var(--ink-3)\">กู้คืนได้ภายใน 30 วันที่ ตั้งค่า › ถังขยะ</div>","ย้ายไปถังขยะ"))return;
await softDel("items",t);}});
}
el("vc-close").onclick=()=>el("cardlg").close();
el("vc-edit").onclick=()=>{const k=cardCtx; el("cardlg").close(); if(k&&k.edit)setTimeout(k.edit,60);};
el("vc-del").onclick=()=>{const k=cardCtx; el("cardlg").close(); if(k&&k.del)k.del();};
async function cardSave(patch){
const t=cardItem; if(!t)return;
const {_id,...rest}=t;
const occKeep=cardOcc;
try{ await saveItem({...rest,...patch},_id); }
catch(err){ const x=explainErr(err); tell("<b>"+esc(x.title)+"</b>"); return; }
const f=items.find(x=>x._id===_id)||{...t,...patch,_id};
openCard(f,occKeep);
}
// ถามขอบเขตตอนยกเลิกงานที่เกิดซ้ำ (เหมือน Google Calendar: รอบนี้ / รอบนี้และต่อจากนี้ / ทุกรอบ)
function askScope(title,opts){
el("sc-title").textContent=title;
el("sc-opts").innerHTML=opts.map((o,i)=>`<label class="scopeopt"><input type="radio" name="scopev" value="${esc(o.v)}"${i===0?" checked":""}><span><b>${esc(o.l)}</b>${o.s?`<small>${esc(o.s)}</small>`:""}</span></label>`).join("");
el("scopedlg").showModal();
return new Promise(r=>{ scopeResolve=r; });
}
let scopeResolve=null;
el("sc-ok").onclick=()=>{ const v=(el("sc-opts").querySelector("input:checked")||{}).value||null; el("scopedlg").close(); const r=scopeResolve; scopeResolve=null; r&&r(v); };
el("sc-no").onclick=()=>{ el("scopedlg").close(); const r=scopeResolve; scopeResolve=null; r&&r(null); };
el("scopedlg").addEventListener("cancel",()=>{ const r=scopeResolve; scopeResolve=null; r&&r(null); });
async function cardOccStatus(st){
const t=cardItem; if(!t)return;
const iso=cardOcc; if(!iso){ cardSave({status:st}); return; }
const dl=isoDate(iso), lab=dl.getDate()+" "+MTH[dl.getMonth()]+" "+(dl.getFullYear()+543);
if(st!==STATUS_CANCEL){ cardSave(occPatch(t,iso,st)); return; }
const start=t.date||"";
const v=await askScope("ยกเลิก “"+t.title+"”",[
{v:"this",l:"เฉพาะรอบนี้ ("+lab+")",s:"รอบอื่นๆ ยังอยู่ตามปกติ"},
{v:"following",l:"รอบนี้และรอบต่อจากนี้ทั้งหมด",s:"รอบก่อนหน้าไม่เปลี่ยน · จบการเกิดซ้ำตั้งแต่ "+lab},
{v:"all",l:"ทุกรอบ (ยกเลิกทั้งงาน)",s:"ทุกรอบกลายเป็นยกเลิก"}]);
if(!v)return;
if(v==="this")cardSave(occPatch(t,iso,STATUS_CANCEL));
else if(v==="all")cardSave({status:STATUS_CANCEL});
else{
if(start&&iso<=start)cardSave({status:STATUS_CANCEL});
else cardSave({rrule:{...rr(t),until:occPrevDay(iso)}});
}
}
el("vc-body").onclick=e=>{
const b=e.target.closest("button"); if(!b||!cardItem)return;
if(b.dataset.vqst){ if(rr(cardItem))cardOccStatus(b.dataset.vqst); else cardSave({status:b.dataset.vqst}); }
else if(b.dataset.vqocc){ cardSave(occPatch(cardItem,b.dataset.vqocc,STATUS_DONE)); }
else if(b.dataset.vqnav){ const dir=+b.dataset.vqnav, cur=cardOcc?isoDate(cardOcc):new Date();
const base=new Date(cur.getFullYear(),cur.getMonth()-4,1), l=occList(cardItem,base,9);
const nx=dir<0?l.filter(d=>d<cur).pop():l.find(d=>d>cur);
if(nx)openCard(cardItem,isoOf(nx)); else setFoot("ไม่มีรอบที่"+(dir<0?"ก่อนหน้า":"ถัดไป")+"แล้วค่ะ"); }
};

// ===== การ์ดดู: Index / กฎหมาย / รายการเงิน =====
function openIdxCard(x){
if(!x)return;
const st=x.status||"ใช้งานอยู่";
const pc=st==="ใช้งานอยู่"?"s-done":st==="กำลังพัฒนา"?"s-run":"s-cancel";
const link=x.url?cH("ลิงก์",`<a href="${esc(x.url)}" target="_blank" rel="noopener" class="lklink">${esc(x.url.replace(/^https?:\/\//,"").slice(0,60))}</a>`,true):cV("ลิงก์","",true);
cardShow({kind:"Index Online",date:(x.group||"").trim()||"ไม่ระบุหมวด",title:x.title,
color:st==="ใช้งานอยู่"?"var(--ok)":st==="กำลังพัฒนา"?"var(--run)":"var(--line)",
pills:`<span class="pill ${pc}">${esc(st)}</span>`,
body:cS("ข้อมูลหลัก",link+cR("ผู้ดูแล",x.owner)+cR("หมายเหตุ",x.note))
+cS("ใช้ทำอะไร",cR("ใช้ทำอะไร (What / Why)",x.iuse,true)+cR("ใครใช้",x.iwho)+cR("ใช้เมื่อไหร่",x.iwhen)+cR("ขั้นตอนใช้งาน (How)",x.detail,true)),
edit:()=>openIdx(x),
del:async()=>{ if(!await ask("ลบ “"+esc(x.title)+"” ใช่ไหมคะ?","ลบรายการ"))return; await softDel("index",x);}});
}
function openLegalCard(L){
if(!L)return;
const S=legalState(L), d=legalDue(L);
const cyc=(CYCLES.find(v=>v[0]===String(L.cycle||""))||["",""])[1];
const yr=v=>fmtDate(v)+" "+(new Date(v).getFullYear()+543);
const comps=(L.comps||[]).length?cH("บริษัทที่ต้องมี",`<div class="vchips">${L.comps.map(k=>`<em>${esc(cLabel(k))}</em>`).join("")}</div>`,true):"";
cardShow({kind:"กฎหมาย & ใบรับรอง",date:L.lifetime?"ไม่มีวันหมดอายุ":(d?"ครบกำหนด "+yr(d):""),title:L.title,
color:S.c==="s-over"?"var(--over)":S.c==="s-run"?"var(--run)":S.c==="s-done"?"var(--ok)":"var(--wait)",
pills:`<span class="pill ${S.c}">${esc(S.t)}</span>`+(L.cat?` <span class="tag">${esc(L.cat)}</span>`:""),
body:cS("ผู้รับผิดชอบ",cV("ผู้รับผิดชอบปัจจุบัน",L.person)+cR("ตำแหน่ง / หน่วยงาน",L.unit)+comps)
+cS("วันที่",cR("วันที่ออก / แต่งตั้ง",L.issued?yr(L.issued):"")+cR("ครบกำหนด",L.lifetime?"ไม่มีกำหนด":(d?yr(d):""))+cR("รอบทบทวน / ต่ออายุ",cyc&&String(L.cycle)?cyc:""))
+cS("เงื่อนไขตามกฎหมาย",cR("เงื่อนไข / หมายเหตุ",L.note,true)),
edit:()=>openLegal(L),
del:async()=>{ if(!await ask("ลบรายการ “"+esc(L.title)+"” ใช่ไหมคะ?","ลบรายการ"))return; await softDel("legal",L);}});
}
function openTxCard(x){
if(!x)return;
const inc=x.kind==="income", t=x.taskId?items.find(v=>v._id===x.taskId):null;
cardShow({kind:inc?"รายรับ":"รายจ่าย",date:x.date?fmtDate(x.date)+" "+(new Date(x.date).getFullYear()+543):"",
title:(inc?"+ ":"− ")+baht(x.amount)+" ฿",color:inc?"var(--ok)":"var(--run)",
pills:x.company?`<span class="tag">${esc(cLabel(x.company))}</span>`:"",
body:cS("รายละเอียด",cR("หมวด GL",x.gl?glLabel(x.gl):"",true)+cR("บริษัท",x.company?cLabel(x.company):"")+cR("งานที่ผูกไว้",t?t.title:"")+cR("หมายเหตุ",x.note,true)),
edit:()=>openTx(x),
del:async()=>{ if(!await ask("ลบรายการเงินนี้ใช่ไหมคะ?","ลบรายการ"))return; await softDel("ledger",x);}});
}

// ===== ฟอร์มงาน: พับ/ขยายแต่ละหมวด =====
const foldSecs=()=>[...document.querySelectorAll("#dlg .fsec")];
function foldHdr(sec){ const h=sec.querySelector(".fsh"); return h; }
function foldCount(sec){
let n=0;
sec.querySelectorAll("input,textarea").forEach(i=>{
if(i.closest("[hidden]"))return;
if(i.type==="checkbox"){ if(i.checked&&!i.closest("#f-colors"))n++; return; }
if(i.type==="button"||i.type==="hidden")return;
if(String(i.value||"").trim())n++; });
return n;
}
function foldPaint(sec){
const h=foldHdr(sec); if(!h)return;
let c=h.querySelector(".fcnt"); if(!c){ c=document.createElement("em"); c.className="fcnt"; h.appendChild(c); }
const n=foldCount(sec);
c.textContent=sec.classList.contains("fold")&&n?"กรอกแล้ว "+n+" ช่อง":"";
}
function foldSet(sec,open){
const h=foldHdr(sec); if(!h)return;
sec.classList.toggle("fold",!open);
h.setAttribute("aria-expanded",open?"true":"false");
foldPaint(sec);
}
function foldOpen(elm){ const sec=elm&&elm.closest(".fsec"); if(sec&&sec.classList.contains("fold"))foldSet(sec,true); }
function foldInit(t){
const secs=foldSecs();
secs.forEach(sec=>{
const h=foldHdr(sec); if(!h)return;
const holder=h.parentElement===sec?h:h.parentElement; holder.classList.add("fhold");
h.setAttribute("role","button"); h.setAttribute("tabindex","0");
if(!h._f){ h._f=1;
const tg=()=>{ foldSet(sec,sec.classList.contains("fold")); };
h.onclick=tg; h.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); tg(); } };
}
});
// ค่าเริ่มต้น: หมวดงบ / รายละเอียดเพิ่มเติม พับไว้ถ้ายังว่าง
secs.forEach(sec=>{
const isMoney=!!sec.querySelector("#f-gl1"), isMore=!!sec.querySelector("#wrap-5w");
let open=true;
if(isMoney)open=!!(t&&(t.gl1||t.gl2||+t.b1||+t.b2||+t.actual));
if(isMore)open=!!(genMode||(t&&(t.note||w5Has(t))));
foldSet(sec,open);
});
}
el("dlg").addEventListener("input",e=>{ const s=e.target.closest&&e.target.closest(".fsec"); if(s&&s.classList.contains("fold"))foldPaint(s); });
el("foldAll").onclick=()=>foldSecs().forEach(s=>foldSet(s,false));
el("unfoldAll").onclick=()=>foldSecs().forEach(s=>foldSet(s,true));
// ===== เขียนบันทึก: To-do ติ๊กได้ · ย่อหน้า · สีตัวอักษร · แนบรูป · ตารางแบบ Excel =====
// (ใช้ร่วมกับตัวกรอง ntClean ใน 05-views-more.js — ถ้าเพิ่มรูปแบบใหม่ต้องอนุญาตที่ตัวกรองด้วย)
const NE_COLS=["#dc2626","#ea580c","#ca8a04","#16a34a","#0d9488","#2563eb","#7c3aed","#db2777","#6b7280"];
const NE_HIL=["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#e5e7eb"];
const NE_BG={y:"#fef9c3",g:"#dcfce7",b:"#dbeafe",r:"#fee2e2",p:"#f3e8ff",o:"#ffedd5",x:"#e5e7eb"};
let neRange=null, neScope="cell", neImgSel=null;

// ---------- ตัวช่วยเรื่อง selection ----------
function neIn(tags){ const s=getSelection(); let n=s.anchorNode; while(n&&n!==NE()){ if(n.nodeType===1&&tags.indexOf(n.tagName)>=0)return n; n=n.parentNode; } return null; }
const neCell=()=>neIn(["TD","TH"]);
const neLi=()=>neIn(["LI"]);
function neSave(){ const s=getSelection(); if(s.rangeCount&&NE().contains(s.getRangeAt(0).commonAncestorContainer))neRange=s.getRangeAt(0).cloneRange(); }
function neRestore(){
NE().focus(); const s=getSelection();
if(!neRange||!NE().contains(neRange.commonAncestorContainer)){ neRange=document.createRange(); neRange.selectNodeContents(NE()); neRange.collapse(false); }
s.removeAllRanges(); s.addRange(neRange);
}
function neFocusCell(c,end){ const r=document.createRange(); r.selectNodeContents(c); r.collapse(!end); const s=getSelection(); s.removeAllRanges(); s.addRange(r); try{ c.scrollIntoView({block:"nearest"}); }catch(e){} }

// ---------- เมนูลอย (สี / ตาราง / สีช่อง) ----------
function nePopEl(){
let p=el("nepop"); if(p)return p;
p=document.createElement("div"); p.id="nepop"; p.className="nepop"; p.hidden=true; el("ndlg").appendChild(p);
p.addEventListener("mousedown",e=>{ if(!e.target.closest("input"))e.preventDefault(); });
p.addEventListener("click",nePopClick); return p;
}
function nePopShow(html,anchor,key){
const p=nePopEl(); if(!p.hidden&&p.dataset.for===key){ p.hidden=true; return; }
p.innerHTML=html; p.hidden=false; p.dataset.for=key;
const r=anchor.getBoundingClientRect();
p.style.top=Math.max(8,Math.min(innerHeight-p.offsetHeight-8,r.bottom+6))+"px"; p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.left))+"px";
}
function neHideAll(){ const p=el("nepop"); if(p)p.hidden=true; neImgDeselect(); }
document.addEventListener("pointerdown",e=>{
const p=el("nepop"); if(p&&!p.hidden&&!e.target.closest("#nepop,[data-ne],[data-nt]"))p.hidden=true;
const b=el("neimgbar"); if(b&&!b.hidden&&!e.target.closest("#neimgbar,#n-body img"))neImgDeselect();
},true);
el("ndlg").addEventListener("close",neHideAll);
el("ndlg").addEventListener("scroll",()=>{ const p=el("nepop"); if(p)p.hidden=true; neImgPos(); },true);

const neColorHtml=()=>`<div class="nepl">สีตัวอักษร</div><div class="nesw">${NE_COLS.map(c=>`<button type="button" data-cc="fore:${c}" style="background:${c}" aria-label="สี ${c}"></button>`).join("")}<button type="button" class="nex" data-cc="fore:">ค่าเริ่มต้น</button></div>
<div class="nepl">ไฮไลต์พื้นหลัง</div><div class="nesw">${NE_HIL.map(c=>`<button type="button" data-cc="hil:${c}" style="background:${c}" aria-label="ไฮไลต์ ${c}"></button>`).join("")}<button type="button" class="nex" data-cc="hil:">ไม่มี</button></div>`;
const neTableHtml=()=>`<div class="nepl">แทรกตาราง</div><div class="nrow"><label>แถว <input type="number" id="net-r" min="1" max="50" value="3"></label><label>คอลัมน์ <input type="number" id="net-c" min="1" max="12" value="3"></label></div>
<label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="net-h" checked> แถวแรกเป็นหัวตาราง</label><button type="button" class="go" data-tmake="1">สร้างตาราง</button>`;
const neCellBgHtml=()=>`<div class="nepl">ใส่สีให้</div><div class="nesw">${[["cell","ช่องนี้"],["row","ทั้งแถว"],["col","ทั้งคอลัมน์"]].map(([k,l])=>`<button type="button" class="nex${neScope===k?" on":""}" data-scope="${k}">${l}</button>`).join("")}</div>
<div class="nepl">สี</div><div class="nesw">${Object.keys(NE_BG).map(k=>`<button type="button" data-cbg="${k}" style="background:${NE_BG[k]}" aria-label="สีช่อง"></button>`).join("")}<button type="button" class="nex" data-cbg="">ไม่มีสี</button></div>`;
const neScopeHtml=()=>[["cell","ช่องนี้"],["row","ทั้งแถว"],["col","ทั้งคอลัมน์"]].map(([k,l])=>`<button type="button" class="nex${neScope===k?" on":""}" data-scope="${k}" data-from="align">${l}</button>`).join("");
const neAlignHtml=()=>{ const c=neCell(), tb=c&&c.closest("table"), ta=tb&&tb.getAttribute("data-ta")||"";
return `<div class="nepl">จัดข้อความในช่อง — ใช้กับ</div><div class="nesw">${neScopeHtml()}</div>
<div class="nesw" style="margin-top:6px">${[["l","ชิดซ้าย"],["c","กึ่งกลาง"],["r","ชิดขวา"],["","ค่าเริ่มต้น"]].map(([k,l])=>`<button type="button" class="nex" data-tal="${k}">${l}</button>`).join("")}</div>
<div class="nepl">ตำแหน่งตารางในหน้า</div><div class="nesw">${[["","เต็มความกว้าง"],["l","ชิดซ้าย"],["c","กึ่งกลาง"],["r","ชิดขวา"]].map(([k,l])=>`<button type="button" class="nex${ta===k?" on":""}" data-tpos="${k}">${l}</button>`).join("")}</div>`; };
function neCellsByScope(c){ const tb=c.closest("table"); if(neScope==="row")return [...c.parentNode.cells]; if(neScope==="col")return [...tb.rows].map(r=>r.cells[c.cellIndex]).filter(Boolean); return [c]; }
function neCellAlign(k){ const c=neCell(); if(!c)return; neCellsByScope(c).forEach(x=>{ if(k)x.setAttribute("data-a",k); else x.removeAttribute("data-a"); }); }
function neTablePos(k){ const c=neCell(); if(!c)return; const tb=c.closest("table"); if(k)tb.setAttribute("data-ta",k); else tb.removeAttribute("data-ta"); }
function nePopClick(e){
const b=e.target.closest("button"); if(!b)return;
if(b.dataset.cc!=null){ const [k,v]=b.dataset.cc.split(":"); el("nepop").hidden=true; neColor(k,v); }
else if(b.dataset.tmake){ const r=Math.max(1,Math.min(50,+el("net-r").value||3)), c=Math.max(1,Math.min(12,+el("net-c").value||3)); el("nepop").hidden=true; neInsertTable(Array.from({length:r},()=>Array(c).fill("")),el("net-h").checked); }
else if(b.dataset.scope){ neScope=b.dataset.scope; el("nepop").innerHTML=b.dataset.from==="align"?neAlignHtml():neCellBgHtml(); }
else if(b.dataset.tal!=null){ neCellAlign(b.dataset.tal); el("nepop").hidden=true; }
else if(b.dataset.tpos!=null){ neTablePos(b.dataset.tpos); el("nepop").hidden=true; }
else if(b.dataset.cbg!=null){ neCellBg(b.dataset.cbg); el("nepop").hidden=true; }
else if(b.dataset.stkp){ el("nepop").hidden=true; neStkInsert(b.dataset.stkp); }
}

// ---------- สีตัวอักษร / ไฮไลต์ ----------
function neColor(kind,hex){
neRestore();
if(!hex){ neClearColor(kind==="fore"?"color":"backgroundColor"); neSave(); neState(); return; }
document.execCommand("styleWithCSS",false,true);
if(kind==="fore")document.execCommand("foreColor",false,hex);
else{ document.execCommand("hiliteColor",false,hex); document.execCommand("foreColor",false,"#1f2937"); }
document.execCommand("styleWithCSS",false,false); neSave(); neState();
}
function neClearColor(prop){
const s=getSelection(); if(!s.rangeCount)return; const r=s.getRangeAt(0);
NE().querySelectorAll("span[style]").forEach(sp=>{ if(!r.intersectsNode(sp))return;
 const hadBg=!!sp.style.backgroundColor; sp.style[prop]=""; if(prop==="backgroundColor"&&hadBg)sp.style.color="";
 if(!sp.getAttribute("style")){ sp.removeAttribute("style"); if(!sp.className){ while(sp.firstChild)sp.parentNode.insertBefore(sp.firstChild,sp); sp.remove(); } } });
}

// ---------- ช่องติ๊ก (To-do) ----------
function neCheck(){
NE().focus(); let li=neLi();
if(li&&li.parentNode.tagName==="UL"){ const ul=li.parentNode;
 if(ul.classList.contains("ck")){ ul.classList.remove("ck"); ul.querySelectorAll(":scope>li").forEach(l=>l.removeAttribute("data-c")); } else ul.classList.add("ck"); }
else{ document.execCommand("insertUnorderedList"); li=neLi(); if(li&&li.parentNode.tagName==="UL")li.parentNode.classList.add("ck"); }
neState();
}
function neCkHit(e){
const li=e.target.closest&&e.target.closest("li"); if(!li||e.target!==li)return null;
const ul=li.parentNode; if(!ul||!ul.classList||!ul.classList.contains("ck"))return null;
return e.clientX>li.getBoundingClientRect().left+28?null:li;
}
function neCkToggle(li){ if(li.getAttribute("data-c")==="1")li.removeAttribute("data-c"); else li.setAttribute("data-c","1"); }
async function ntCkSave(){
const n=viewingNote; if(!n||n.fmt!=="h")return; const body=ntClean(el("nvb").innerHTML); n.body=body;
try{ await DB.collection("note").doc(n._id).set({body},{merge:true}); }catch(e){}
}
el("nvb").addEventListener("click",e=>{ const li=neCkHit(e); if(!li)return; neCkToggle(li); ntCkSave(); });

// ---------- ย่อหน้า ----------
function neBlocks(){
const s=getSelection(); if(!s.rangeCount)return []; const r=s.getRangeAt(0);
return [...NE().querySelectorAll("p,div,h2,h3,blockquote")].filter(b=>!b.querySelector("p,div,h2,h3,blockquote,table,ul,ol")&&!b.closest("li")&&r.intersectsNode(b));
}
function neIndent(dir){
NE().focus();
if(neLi()){ document.execCommand(dir>0?"indent":"outdent"); NE().querySelectorAll("ul.ck ul").forEach(u=>u.classList.add("ck")); neState(); return; }
let bl=neBlocks();
if(!bl.length&&!neCell()){ document.execCommand("formatBlock",false,"p"); bl=neBlocks(); }
bl.forEach(b=>{ const v=Math.max(0,Math.min(6,(+b.getAttribute("data-i")||0)+dir)); if(v)b.setAttribute("data-i",v); else b.removeAttribute("data-i"); });
neState();
}

// ---------- ตาราง ----------
function neInsertTable(rows,head){
neRestore(); const cur=neCell(), li=neLi(); let after=null;
if(cur)after=cur.closest("table"); else if(li){ after=li.closest("ul,ol"); while(after.parentNode&&after.parentNode.closest&&after.parentNode.closest("li"))after=after.parentNode.closest("ul,ol"); }

const n=Math.max(...rows.map(r=>r.length));
const html=`<table class="nt" id="ne-new"><tbody>${rows.map((r,i)=>"<tr>"+Array.from({length:n},(_,j)=>{ const t=head&&i===0?"th":"td"; const v=r[j]; return `<${t}>${v?esc(v):"<br>"}</${t}>`; }).join("")+"</tr>").join("")}</tbody></table><p><br></p>`;
if(after){ const w=document.createElement("div"); w.innerHTML=html; after.after(w.querySelector("table"),w.querySelector("p"));
 if(li&&!li.textContent.trim()&&!li.querySelector("img,table")){ const ul=li.parentNode; li.remove(); if(ul&&!ul.children.length)ul.remove(); } }
else document.execCommand("insertHTML",false,html);
const t=el("ne-new"); if(t){ t.removeAttribute("id"); neFocusCell(t.rows[0].cells[0]); }
neState();
}
function neTbOp(op){
const c=neCell(); if(!c)return; const tr=c.parentNode, tb=c.closest("table"), rows=[...tb.rows], ci=c.cellIndex;
const mk=t=>{ const x=document.createElement(t); x.innerHTML="<br>"; return x; };
if(op==="rowa"||op==="rowb"){ const nr=document.createElement("tr"); for(let i=0;i<tr.cells.length;i++){ const x=mk("td"), a=tr.cells[i].getAttribute("data-a"); if(a)x.setAttribute("data-a",a); nr.appendChild(x); } if(op==="rowa")tr.before(nr); else tr.after(nr); }
else if(op==="rowd"){ if(rows.length<=1)tb.remove(); else{ const nx=tr.nextElementSibling||tr.previousElementSibling; tr.remove(); neFocusCell(nx.cells[Math.min(ci,nx.cells.length-1)]); } }
else if(op==="cola"||op==="colb"){ rows.forEach(r=>{ const x=r.cells[ci], n=mk(x&&x.tagName==="TH"?"th":"td"); if(x&&x.getAttribute("data-a"))n.setAttribute("data-a",x.getAttribute("data-a")); if(x){ if(op==="cola")x.before(n); else x.after(n); } else r.appendChild(n); }); }
else if(op==="cold"){ if(tr.cells.length<=1)tb.remove(); else{ const keep=c.nextElementSibling||c.previousElementSibling; rows.forEach(r=>{ if(r.cells[ci])r.cells[ci].remove(); }); neFocusCell(keep); } }
else if(op==="head"){ const r0=rows[0], toTh=r0.cells[0].tagName!=="TH"; [...r0.cells].forEach(x=>{ const n=document.createElement(toTh?"th":"td"); n.innerHTML=x.innerHTML; ["data-bg","data-a"].forEach(a=>{ if(x.getAttribute(a))n.setAttribute(a,x.getAttribute(a)); }); x.replaceWith(n); }); }
else if(op==="hide"){ const vis=rows[0]?[...rows[0].cells].filter(x=>!x.hasAttribute("data-h")).length:0; if(vis<=1){ if(typeof tell==="function")tell("ต้องเหลืออย่างน้อย 1 คอลัมน์ที่แสดงอยู่ค่ะ"); return; } rows.forEach(r=>{ if(r.cells[ci])r.cells[ci].setAttribute("data-h","1"); }); const cs=[...tr.cells], nx=cs.slice(ci+1).find(x=>!x.hasAttribute("data-h"))||cs.slice(0,ci).reverse().find(x=>!x.hasAttribute("data-h")); if(nx)neFocusCell(nx); }
else if(op==="show"){ tb.querySelectorAll("[data-h]").forEach(x=>x.removeAttribute("data-h")); }
else if(op==="tdel"){ tb.remove(); NE().focus(); }
neExtraState();
}
function neCellBg(k){
const c=neCell(); if(!c)return; let cs=[c]; const tb=c.closest("table");
if(neScope==="row")cs=[...c.parentNode.cells]; else if(neScope==="col")cs=[...tb.rows].map(r=>r.cells[c.cellIndex]).filter(Boolean);
cs.forEach(x=>{ if(k)x.setAttribute("data-bg",k); else x.removeAttribute("data-bg"); });
}
function neCellMove(c,dir){
const tb=c.closest("table"), all=[...tb.querySelectorAll("th,td")], i=all.indexOf(c)+dir;
if(i<0)return;
if(i>=all.length){ const tr=c.parentNode; neTbOp("rowb"); const nx=tr.nextElementSibling; if(nx)neFocusCell(nx.cells[0]); return; }
neFocusCell(all[i]);
}
function neCellDown(c){
const tr=c.parentNode, ci=c.cellIndex; let nx=tr.nextElementSibling;
if(!nx){ neTbOp("rowb"); nx=tr.nextElementSibling; }
if(nx)neFocusCell(nx.cells[Math.min(ci,nx.cells.length-1)]);
}
function neFillTable(c,rows){
const tb=c.closest("table"), r0=[...tb.rows].indexOf(c.parentNode), c0=c.cellIndex;
rows.forEach((row,i)=>{
 while(tb.rows.length<=r0+i){ const nr=tb.insertRow(-1); for(let k=0;k<tb.rows[0].cells.length;k++){ const x=document.createElement("td"); x.innerHTML="<br>"; nr.appendChild(x); } }
 row.forEach((v,j)=>{ const need=c0+j+1; [...tb.rows].forEach(r=>{ while(r.cells.length<need){ const x=document.createElement("td"); x.innerHTML="<br>"; r.appendChild(x); } }); tb.rows[r0+i].cells[c0+j].textContent=v; }); });
neFocusCell(c,true);
}
function neParseTSV(t){ t=String(t||"").replace(/\r\n?/g,"\n").replace(/\n+$/,""); if(t.indexOf("\t")<0)return null; return t.split("\n").map(l=>l.split("\t").map(x=>x.replace(/^"([\s\S]*)"$/,"$1").trim())); }
el("netbar").addEventListener("mousedown",e=>{ if(e.target.closest("button"))e.preventDefault(); });
el("netbar").addEventListener("click",e=>{ const b=e.target.closest("[data-nt]"); if(!b)return; const op=b.dataset.nt; if(op==="bg"){ nePopShow(neCellBgHtml(),b,"cellbg"); return; } if(op==="align"){ nePopShow(neAlignHtml(),b,"align"); return; } neTbOp(op); });

// ---------- รูปภาพ ----------
const NIMG=new Map();
async function nimgGet(id){
if(NIMG.has(id))return NIMG.get(id); if(!SB)return "";
try{ const {data,error}=await SB.from("rows").select("id,data").eq("uid",uid).eq("id",id); if(error)throw error; const d=(data&&data[0]&&data[0].data&&data[0].data.d)||""; if(d)NIMG.set(id,d); return d; }catch(e){ return ""; }
}
function ntHydrate(root){
if(!root)return; root.querySelectorAll("img[data-nid]").forEach(async im=>{ if(im.getAttribute("src"))return;
 im.alt="กำลังโหลดรูป…"; const d=await nimgGet(im.getAttribute("data-nid")); if(d&&im.isConnected){ im.src=d; im.alt=""; } else if(!d)im.alt="(โหลดรูปไม่ได้)"; });
}
function neImgScale(file,maxSide,q){
return new Promise((res,rej)=>{ const u=URL.createObjectURL(file), im=new Image();
 im.onload=()=>{ const w=im.naturalWidth, h=im.naturalHeight, c=document.createElement("canvas"); let sc=Math.min(1,maxSide/Math.max(w,h));
  const draw=()=>{ c.width=Math.max(1,Math.round(w*sc)); c.height=Math.max(1,Math.round(h*sc)); const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); return c.toDataURL("image/jpeg",q); };
  let out=draw(), t=0; while(out.length>650000&&t<4){ sc*=.8; q=Math.max(.6,q-.05); out=draw(); t++; }
  URL.revokeObjectURL(u); res(out); };
 im.onerror=()=>{ URL.revokeObjectURL(u); rej(new Error("อ่านรูปไม่ได้")); }; im.src=u; });
}
function neInsertNode(node,tail){
neRestore(); const s=getSelection(); let r=s.getRangeAt(0); r.deleteContents(); r.insertNode(node);
let last=node; if(tail){ const t=document.createTextNode(" "); node.after(t); last=t; }
r=document.createRange(); r.setStartAfter(last); r.collapse(true); s.removeAllRanges(); s.addRange(r); neRange=r.cloneRange();
}
async function neImgInsert(file){
if(!file||!/^image\//.test(file.type))return;
let url; try{ url=await neImgScale(file,1280,.82); }catch(e){ tell("<b>อ่านรูปนี้ไม่ได้ค่ะ</b>"); return; }
const id="nimg-"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4); let ok=false;
if(SB&&uid){ try{ const {error}=await SB.from("rows").upsert({id,uid,kind:"nimg",data:{d:url},updated_at:new Date().toISOString()}); ok=!error; }catch(e){} }
NIMG.set(id,url);
const im=document.createElement("img"); im.src=url; if(ok)im.setAttribute("data-nid",id); im.setAttribute("data-w","50"); im.alt="";
neInsertNode(im,true);
}
async function neImgMany(files){ setFoot("กำลังแนบรูป…"); for(const f of files)await neImgInsert(f); setFoot("แนบรูปแล้ว — กดที่รูปเพื่อปรับขนาด/ลบ"); }
function neImgPos(){ const b=el("neimgbar"); if(!b||b.hidden||!neImgSel)return; const r=neImgSel.getBoundingClientRect(); b.style.top=Math.max(8,r.top-48)+"px"; b.style.left=Math.max(8,Math.min(innerWidth-b.offsetWidth-8,r.left))+"px"; }
function neImgDeselect(){ if(neImgSel)neImgSel.classList.remove("nesel"); neImgSel=null; const b=el("neimgbar"); if(b)b.hidden=true; }
function neImgSelect(im){
neImgDeselect(); neImgSel=im; im.classList.add("nesel"); let b=el("neimgbar");
if(!b){ b=document.createElement("div"); b.id="neimgbar"; b.className="nepop neimgbar";
 b.innerHTML='<button type="button" data-iw="33">เล็ก</button><button type="button" data-iw="50">กลาง</button><button type="button" data-iw="100">ใหญ่</button><button type="button" data-iw="del" class="danger">ลบรูป</button>';
 el("ndlg").appendChild(b); b.addEventListener("mousedown",e=>e.preventDefault());
 b.addEventListener("click",e=>{ const x=e.target.closest("button"); if(!x||!neImgSel)return; if(x.dataset.iw==="del"){ neImgSel.remove(); neImgDeselect(); } else{ neImgSel.setAttribute("data-w",x.dataset.iw); neImgPos(); } }); }
b.hidden=false; neImgPos();
}
el("ne-file").addEventListener("change",e=>{ const fs=[...e.target.files]; e.target.value=""; if(fs.length)neImgMany(fs); });

// ---------- ผูกปุ่ม / คีย์ลัด ----------
el("ntool").addEventListener("click",e=>{
const b=e.target.closest("[data-ne]"); if(!b)return; const k=b.dataset.ne;
if(k==="ck")neCheck(); else if(k==="indent")neIndent(1); else if(k==="outdent")neIndent(-1);
else if(k==="color"){ neSave(); nePopShow(neColorHtml(),b,"color"); }
else if(k==="stk"){ neSave(); nePopShow(neStkHtml(),b,"stk"); }
else if(k==="table"){ neSave(); nePopShow(neTableHtml(),b,"table"); }
else if(k==="img"){ neSave(); el("ne-file").click(); }
else if(k==="clear"){ NE().querySelectorAll("span[style]").forEach(sp=>{ while(sp.firstChild)sp.parentNode.insertBefore(sp.firstChild,sp); sp.remove(); }); }
});
NE().addEventListener("click",e=>{
const t=e.target;
if(t.tagName==="IMG"){ neImgSelect(t); return; } neImgDeselect();
const li=neCkHit(e); if(li)neCkToggle(li);
});
NE().addEventListener("keydown",e=>{
if(e.isComposing||e.keyCode===229)return;
if(e.key==="Tab"){ e.preventDefault(); const c=neCell(); if(c)neCellMove(c,e.shiftKey?-1:1); else neIndent(e.shiftKey?-1:1); return; }
if(e.key==="Enter"&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){ const c=neCell(); if(c){ e.preventDefault(); neCellDown(c); } }
else if(e.key==="Enter"&&e.shiftKey){ const c=neCell(); if(c){ e.preventDefault(); document.execCommand("insertLineBreak"); } }
});
NE().addEventListener("input",e=>{
if(e.inputType==="insertParagraph"){ const li=neLi(); if(li&&li.getAttribute("data-c")==="1"&&li.parentNode.classList&&li.parentNode.classList.contains("ck"))li.removeAttribute("data-c"); }
});
NE().addEventListener("scroll",neImgPos);
NE().addEventListener("paste",e=>{
const cd=e.clipboardData||window.clipboardData; if(!cd)return;
const files=[...(cd.files||[])].filter(f=>/^image\//.test(f.type));
if(files.length){ e.preventDefault(); neSave(); neImgMany(files); return; }
e.preventDefault(); const t=cd.getData("text/plain"), rows=neParseTSV(t);
if(rows&&(rows.length>1||rows[0].length>1)){ const c=neCell(); if(c)neFillTable(c,rows); else{ neSave(); neInsertTable(rows,false); } return; }
document.execCommand("insertText",false,t);
});
NE().addEventListener("drop",e=>{
const fs=[...((e.dataTransfer&&e.dataTransfer.files)||[])].filter(f=>/^image\//.test(f.type)); if(!fs.length)return;
e.preventDefault(); const r=document.caretRangeFromPoint&&document.caretRangeFromPoint(e.clientX,e.clientY); if(r&&NE().contains(r.commonAncestorContainer))neRange=r; neImgMany(fs);
});
NE().addEventListener("dragover",e=>{ if(e.dataTransfer&&[...e.dataTransfer.types].indexOf("Files")>=0)e.preventDefault(); });

// ---------- สถานะแถบเครื่องมือ ----------
function neExtraState(){
const c=neCell(), bar=el("netbar"); bar.hidden=!c;
if(c){ const nh=c.closest("table").rows[0]?[...c.closest("table").rows[0].cells].filter(x=>x.hasAttribute("data-h")).length:0, sb=bar.querySelector('[data-nt="show"]'); if(sb){ sb.hidden=!nh; sb.textContent="แสดงที่ซ่อน ("+nh+")"; } const th=c.closest("table").rows[0].cells[0].tagName==="TH"; const hb=bar.querySelector('[data-nt="head"]'); if(hb)hb.classList.toggle("on",th); }
const li=neLi(), cb=document.querySelector('#ntool [data-ne="ck"]'); if(cb)cb.classList.toggle("on",!!(li&&li.parentNode.classList&&li.parentNode.classList.contains("ck")));
}
document.addEventListener("selectionchange",()=>{ if(el("ndlg").open&&document.activeElement===NE())neExtraState(); });

// ===== ย้อนกลับ / ทำซ้ำ (ประวัติของตัวแก้ไขเอง — ครอบคลุมทั้งพิมพ์ ตาราง รูป ช่องติ๊ก ย่อหน้า สี) =====
const neH={s:[],i:-1,t:0,pend:0,busy:0};
function neSer(){ return NE().innerHTML.replace(/<img\b[^>]*>/g,t=>(/data-nid=/.test(t)?t.replace(/\ssrc="[^"]*"/,""):t).replace(/\sclass="nesel"/,"")); }
function neOffsets(){
const s=getSelection(); if(!s.rangeCount||!NE().contains(s.anchorNode))return null; const r=s.getRangeAt(0);
const pre=(n,o)=>{ const q=document.createRange(); q.selectNodeContents(NE()); q.setEnd(n,o); return q.toString().length; };
try{ return [pre(r.startContainer,r.startOffset),pre(r.endContainer,r.endOffset)]; }catch(e){ return null; }
}
function neSetOffsets(o){
if(!o)return; const w=document.createTreeWalker(NE(),NodeFilter.SHOW_TEXT); let pos=0,a=null,b=null,n;
while((n=w.nextNode())){ const l=n.nodeValue.length; if(a==null&&pos+l>=o[0])a=[n,o[0]-pos]; if(b==null&&pos+l>=o[1]){ b=[n,o[1]-pos]; break; } pos+=l; }
if(!a)return; if(!b)b=a; try{ const r=document.createRange(); r.setStart(a[0],a[1]); r.setEnd(b[0],b[1]); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }catch(e){}
}
function neHistUi(){
const u=document.querySelector('#ntool [data-ne="undo"]'), r=document.querySelector('#ntool [data-ne="redo"]');
if(u)u.disabled=neH.i<=0; if(r)r.disabled=neH.i>=neH.s.length-1;
}
function neSnap(){
clearTimeout(neH.t); neH.pend=0; const h=neSer();
if(neH.i>=0&&neH.s[neH.i].h===h){ neHistUi(); return; }
neH.s.length=neH.i+1; neH.s.push({h,c:neOffsets()});
let tot=neH.s.reduce((a,x)=>a+x.h.length,0); while(neH.s.length>2&&(neH.s.length>150||tot>6e6)){ tot-=neH.s.shift().h.length; }
neH.i=neH.s.length-1; neHistUi();
}
function neFlush(){ if(neH.pend)neSnap(); }
function neHistReset(){ clearTimeout(neH.t); neH.s=[]; neH.i=-1; neH.pend=0; neSnap(); }
function neGo(d){
neFlush(); const k=neH.i+d; if(k<0||k>=neH.s.length)return;
neH.i=k; const st=neH.s[k]; neH.busy=1; neHideAll();
NE().innerHTML=st.h; ntHydrate(NE()); NE().focus(); neSetOffsets(st.c); neH.busy=0; neHistUi(); neState();
}
const neUndo=()=>neGo(-1), neRedo=()=>neGo(1);
// ครอบการแก้ไขที่ทำเองกับ DOM (ไม่มี input event) ให้บันทึกสถานะก่อน/หลัง
function neOp(fn){ return function(...a){ neFlush(); const r=fn.apply(this,a); neSnap(); return r; }; }
neTbOp=neOp(neTbOp); neCellBg=neOp(neCellBg); neCellAlign=neOp(neCellAlign); neTablePos=neOp(neTablePos);
neCheck=neOp(neCheck); neIndent=neOp(neIndent); neInsertTable=neOp(neInsertTable); neFillTable=neOp(neFillTable);
neInsertNode=neOp(neInsertNode); neColor=neOp(neColor); neCkToggle=neOp(neCkToggle);
el("ntool").addEventListener("click",e=>{ const b=e.target.closest("[data-ne]"); if(!b)return; if(b.dataset.ne==="undo")neUndo(); else if(b.dataset.ne==="redo")neRedo(); else if(b.dataset.ne==="hist"){ neSave(); neHistPop(b); } });
NE().addEventListener("input",()=>{ if(neH.busy)return; neH.pend=1; clearTimeout(neH.t); neH.t=setTimeout(neSnap,500); });
NE().addEventListener("beforeinput",e=>{
if(e.inputType==="historyUndo"){ e.preventDefault(); neUndo(); return; }
if(e.inputType==="historyRedo"){ e.preventDefault(); neRedo(); return; }
if(neH.pend&&!/^(insertText|insertCompositionText|deleteContentBackward|deleteContentForward)$/.test(e.inputType))neFlush();
});
NE().addEventListener("keydown",e=>{
if(!(e.ctrlKey||e.metaKey)||e.altKey)return; const k=e.key.toLowerCase();
if(k==="z"){ e.preventDefault(); if(e.shiftKey)neRedo(); else neUndo(); } else if(k==="y"){ e.preventDefault(); neRedo(); }
},true);
// รูป: ปรับขนาด/ลบ ให้เข้าประวัติด้วย
el("ndlg").addEventListener("click",e=>{ if(e.target.closest("#neimgbar button"))setTimeout(neSnap,0); },true);

// ===== ประวัติการบันทึก (กู้เวอร์ชันที่บันทึกไว้ก่อนหน้า) =====
function neHistPop(anchor){
const h=(editingNote&&editingNote.hist)||[];
const fmt=iso=>{ try{ return new Date(iso).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); }catch(e){ return iso; } };
const html=`<div class="nepl">เวอร์ชันที่บันทึกไว้ก่อนหน้า (ล่าสุด ${h.length}/8)</div>`+(h.length?`<div class="nehist">${h.map((v,i)=>`<button type="button" data-hv="${i}"><b>${esc(fmt(v.at))}</b><span>${esc(ntPlain({fmt:v.f,body:v.b}).replace(/\s+/g," ").slice(0,70)||"(ว่าง)")}</span></button>`).join("")}</div><div class="hint" style="margin:8px 0 0;font-size:12px">ระบบเก็บให้ทุกครั้งที่กด “บันทึก” — กดเลือกเพื่อกู้มาแทนเนื้อหาตอนนี้ (ย้อนกลับได้ด้วยปุ่ม ↶)</div>`:`<div class="hint" style="margin:6px 0 0">ยังไม่มีเวอร์ชันเก่า — จะเริ่มเก็บตั้งแต่การบันทึกครั้งถัดไป</div>`);
nePopShow(html,anchor,"hist");
}
el("ndlg").addEventListener("click",async e=>{
const b=e.target.closest("[data-hv]"); if(!b||!editingNote)return; const v=(editingNote.hist||[])[+b.dataset.hv]; if(!v)return;
el("nepop").hidden=true;
if(!await ask("กู้เวอร์ชันนี้มาแทนเนื้อหาตอนนี้ไหมคะ? (ถ้าเปลี่ยนใจกดปุ่มย้อนกลับ ↶ ได้)","กู้เวอร์ชันนี้"))return;
neFlush(); NE().innerHTML=ntHtml({fmt:v.f,body:v.b}); ntHydrate(NE()); neSnap(); NE().focus();
});
// ===== เขียนบันทึก: สูตรในตาราง + พิมพ์ = ได้ผลทันที (ใช้ตัวคำนวณจาก 05l-calc.js) =====
// ---------- เขียนบันทึก: = ต่อท้ายนิพจน์ได้ผลทันที · ช่องตารางพิมพ์ =SUM(B2:B5) ได้ ----------
let neFxCur=null;
const neFxNum=c=>{ const t=c._fv!=null&&c===neFxCur?c._fv:c.textContent; const n=calcNums(t); return n.length?n[0]:null; };
function neFxAll(){ const NEe=NE(); if(!NEe)return;
 NEe.querySelectorAll("table").forEach(tb=>{ const cells=[...tb.querySelectorAll("td[data-f],th[data-f]")]; if(!cells.length)return;
  const cellFn=(c,r)=>{ const row=tb.rows[r-1], cl=row&&row.cells[c-1]; return cl?neFxNum(cl):null; };
  for(let pass=0;pass<3;pass++)cells.forEach(c=>{ if(c===neFxCur)return; let t; try{ t=calcFmt(calcEval(c.getAttribute("data-f").slice(1),{cell:cellFn})); }catch(e){ t="#ERR"; } if(c.textContent!==t)c.textContent=t; }); }); }
function neFxLeave(){ const c=neFxCur; neFxCur=null; if(!c||!NE().contains(c))return; const t=c.textContent.trim(); if(/^=.+/.test(t))c.setAttribute("data-f",t.slice(0,120)); else c.removeAttribute("data-f"); neFxAll(); }
function neFxEnter(c){ neFxCur=c; if(c){ const f=c.getAttribute("data-f"); if(f){ c._fv=c.textContent; c.textContent=f; neFocusCell(c,true); } } }
(function(){ const NEe=NE(); if(!NEe)return;
 document.addEventListener("selectionchange",()=>{ const d=el("ndlg"); if(!d||!d.open)return; const c=neCell(); if(c===neFxCur)return; neFxLeave(); neFxEnter(c); });
 NEe.addEventListener("focusout",()=>{ setTimeout(()=>{ if(!NEe.contains(document.activeElement))neFxLeave(); },0); });
 NEe.addEventListener("input",e=>{
  if(e.inputType==="insertText"&&e.data==="="){ const s=getSelection(); if(s.rangeCount&&s.isCollapsed){ const n=s.anchorNode; if(n&&n.nodeType===3){ const before=n.data.slice(0,s.anchorOffset), line=before.split("\n").pop(); const out=calcAutoLine(line); if(out!=null&&!/^=/.test(line.trim())){ const add=out.slice(line.length); document.execCommand("insertText",false,add); } } } }
  neFxAll(); });
 const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="calc"]'); if(b){ e.stopImmediatePropagation(); calcOpenNote(); } },true);
})();
function gate(mode){
gateMode=mode;
const b=el("gatebody");
if(mode==="setup"){
el("gateh").textContent="เชื่อมต่อฐานข้อมูลครั้งแรก";
b.innerHTML=`<div class="f"><label for="g-url">Project URL จาก Supabase</label>
<input id="g-url" placeholder="https://xxxxx.supabase.co" value="${esc(cfg.url)}"></div>
<div class="f" style="margin-top:12px"><label for="g-key">anon public key (หรือ Publishable key)</label>
<input id="g-key" placeholder="eyJhbGciOi... หรือ sb_publishable_..." value="${esc(cfg.key)}"></div>
<div class="hint">หาได้ที่ <b>Supabase › Settings (รูปเฟือง) › API Keys</b><br>
• <b>Project URL</b> อยู่แถวบนของหน้าเดียวกัน หรือกดปุ่ม <b>Connect</b> ด้านบนสุดของโปรเจกต์<br>
• ใช้ได้ทั้ง <b>anon public</b> (ขึ้นต้น eyJ…) และ <b>Publishable</b> (ขึ้นต้น sb_publishable_…) — คีย์สองแบบนี้ปลอดภัยสำหรับใส่ในหน้าเว็บ<br>
• <b style="color:var(--over)">ห้ามใช้ service_role หรือ secret key เด็ดขาด</b> — คีย์พวกนั้นข้ามการป้องกันทั้งหมด<br>
ใส่ครั้งเดียวต่อเครื่อง เก็บไว้ในเครื่องนี้เท่านั้น</div>`;
el("gatego").textContent="เชื่อมต่อ";
}else if(mode==="newpass"){
el("gateh").textContent="ตั้งรหัสผ่านใหม่";
b.innerHTML=`<div class="f"><label for="g-new">รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)</label><input id="g-new" type="password" autocomplete="new-password"></div>
<div id="g-msg"></div>`;
el("gatego").textContent="บันทึกรหัสผ่านใหม่";
}else if(mode==="login"){
el("gateh").textContent="เข้าสู่ระบบ Sky Work";
b.innerHTML=`<div class="f"><label for="g-mail">อีเมล</label><input id="g-mail" type="email" autocomplete="email"></div>
<div class="f" style="margin-top:12px"><label for="g-pass">รหัสผ่าน</label><input id="g-pass" type="password" autocomplete="current-password"></div>
<div class="hint">เครื่องนี้จะจำไว้ ไม่ต้องล็อกอินอีก · <b>เคยมีบัญชีแล้วให้กด “เข้าสู่ระบบ” เท่านั้น</b> (ข้อมูลทั้งหมดอยู่ในบัญชีเดิม)</div>
<div id="g-msg"></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
<button type="button" class="gcbtn" id="g-forgot">ลืมรหัสผ่าน</button>
<button type="button" class="gcbtn" id="g-signup">สมัครบัญชีใหม่ (ครั้งแรกเท่านั้น)</button>
<button type="button" class="gcbtn" id="g-resend" hidden>ส่งอีเมลยืนยันอีกครั้ง</button></div>`;
el("gatego").textContent="เข้าสู่ระบบ";
const msg=el("g-msg"), val=()=>({email:el("g-mail").value.trim(),password:el("g-pass").value});
const say=(cls,t)=>{msg.innerHTML=`<div class="banner ${cls}">${t}</div>`;};
el("g-forgot").onclick=async()=>{ const {email}=val(); if(!email){say("bad","ใส่อีเมลก่อน แล้วกด “ลืมรหัสผ่าน” อีกครั้งค่ะ");el("g-mail").focus();return;}
 say("","กำลังส่งลิงก์…"); const r=await SB.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
 if(r.error){say("bad",esc(r.error.message));return;}
 say("ok","ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่ <b>"+esc(email)+"</b> แล้วค่ะ (ถ้าไม่เห็น ดูในสแปม) — กดลิงก์ในอีเมลแล้วตั้งรหัสใหม่ได้เลย"); };
el("g-resend").onclick=async()=>{ const {email}=val(); if(!email)return; const r=await SB.auth.resend({type:"signup",email}); say(r.error?"bad":"ok",r.error?esc(r.error.message):"ส่งอีเมลยืนยันอีกครั้งแล้วค่ะ ตรวจกล่องจดหมาย/สแปม"); };
el("g-signup").onclick=async()=>{ const {email,password}=val();
 if(!email||password.length<6){say("bad","ใส่อีเมลและตั้งรหัสผ่านอย่างน้อย 6 ตัวก่อน แล้วกด “สมัครบัญชีใหม่”");return;}
 say("","กำลังสมัคร…"); const r=await SB.auth.signUp({email,password});
 if(r.error){say("bad",esc(r.error.message));return;}
 if(r.data&&r.data.user&&Array.isArray(r.data.user.identities)&&!r.data.user.identities.length){ say("bad","อีเมลนี้<b>มีบัญชีอยู่แล้ว</b>ค่ะ — ไม่ต้องสมัครใหม่ กด “เข้าสู่ระบบ” หรือ “ลืมรหัสผ่าน” แทน"); return; }
 if(r.data&&r.data.session){ el("gate").close(); boot(); return; }
 say("ok","สมัครแล้ว! ตรวจอีเมลเพื่อกดยืนยัน แล้วกลับมากด “เข้าสู่ระบบ” ค่ะ"); el("g-resend").hidden=false; };
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
if(gateMode==="newpass"){
const pw=el("g-new").value, m=el("g-msg");
if(pw.length<6){m.innerHTML=`<div class="banner bad">รหัสผ่านอย่างน้อย 6 ตัวค่ะ</div>`;return;}
const r=await SB.auth.updateUser({password:pw});
if(r.error){m.innerHTML=`<div class="banner bad">${esc(r.error.message)}</div>`;return;}
try{ history.replaceState(null,"",location.pathname); }catch(e){}
el("gate").close(); tell("<b>ตั้งรหัสผ่านใหม่แล้วค่ะ</b><div style=\"font-size:13px;margin-top:8px\">ครั้งต่อไปเข้าด้วยรหัสใหม่นี้</div>"); return;
}
const email=el("g-mail").value.trim(), password=el("g-pass").value;
const msg=el("g-msg");
if(!email||password.length<6){msg.innerHTML=`<div class="banner bad">ใส่อีเมลและรหัสผ่านอย่างน้อย 6 ตัวค่ะ</div>`;return;}
msg.innerHTML=`<div class="banner">กำลังเข้าสู่ระบบ…</div>`;
const {error}=await SB.auth.signInWithPassword({email,password});
if(error){
const m2=String(error.message||"");
if(/not confirmed/i.test(m2)){ msg.innerHTML=`<div class="banner bad">อีเมลนี้<b>ยังไม่ได้ยืนยัน</b> — เปิดอีเมลหา “Confirm your signup” แล้วกดลิงก์ (ดูในสแปมด้วย) หรือกดส่งอีเมลยืนยันอีกครั้งด้านล่าง</div>`; if(el("g-resend"))el("g-resend").hidden=false; }
else if(/invalid login/i.test(m2)){ msg.innerHTML=`<div class="banner bad"><b>อีเมลหรือรหัสผ่านไม่ถูกต้อง</b> — ลองพิมพ์ใหม่อีกครั้ง ถ้าจำรหัสไม่ได้กด “ลืมรหัสผ่าน” (ไม่ต้องสมัครใหม่ ข้อมูลเดิมอยู่ในบัญชีเดิม)</div>`; }
else msg.innerHTML=`<div class="banner bad">${esc(m2)}</div>`;
return; }
el("gate").close(); boot();
};
async function signOut(){ if(SB)await SB.auth.signOut(); location.reload(); }
addEventListener("resize",()=>{if(view==="all")render();});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
window.__skyBoot=1;
boot();
