const APP_VERSION="14.9.1"; const APP_DATE="14 ต.ค. 2026";
const MTH=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MTHFULL=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DOW=["อา","จ","อ","พ","พฤ","ศ","ส"];
const STATUS=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","กำลังดำเนินการ","เสร็จสิ้น","ยกเลิก"];
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
const VIEWS=[["home","ภาพรวม"],["all","งานทั้งหมด"],["matrix","Matrix งาน"],["gaps","งานค้างข้อมูล"],["cal","ปฏิทิน"],["budget","งบประมาณ"],["exec","รายงานผู้บริหาร"],["meet","การประชุม"],["train","ฝึกอบรม"],["dsd","กรมพัฒนาฯ"],["legal","กฎหมาย"],["idx","Index Online"],["note","บันทึก & ไอเดีย"],["ai","ผู้ช่วย AI"],["set","ตั้งค่า"]];
const TABS=["home","all","matrix","gaps","cal","budget","exec","meet","train","dsd","legal","idx","note","ai","set"];
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
const occDone=(t,d)=>(((t&&t.done)||[]).includes(isoOf(d)));
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
const list=occList(t,new Date(from.getFullYear(),from.getMonth(),1),18).filter(d=>!occDone(t,d)&&!occSkip(t,d));
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
return gColor(t.track)||sColor(t.status); };
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
function dualBars(inc,exp,labels,hi,n1="รายรับ",n2="รายจ่าย",c1="var(--ok)",c2="var(--accent-2)"){
const max=Math.max(...inc,...exp,1), W=430, H=155, bw=W/12;
return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="รายรับรายจ่ายรายเดือน">
<line x1="0" y1="120" x2="${W}" y2="120" stroke="var(--line-2)" stroke-width="1.5"/>
${labels.map((l,i)=>{
const hi2=Math.max(inc[i]/max*98,inc[i]>0?4:0), he=Math.max(exp[i]/max*98,exp[i]>0?4:0);
const x=i*bw+bw*.14, w=bw*.34;
return `<g><rect x="${x}" y="${120-hi2}" width="${w}" height="${hi2}" rx="4" fill="${c1}"><title>${l} ${n1}: ${baht(inc[i])}</title></rect>
<rect x="${x+w+2}" y="${120-he}" width="${w}" height="${he}" rx="4" fill="${c2}"><title>${l} ${n2}: ${baht(exp[i])}</title></rect>
<text x="${i*bw+bw*.5}" y="136" text-anchor="middle" font-size="9.5" fill="${i===hi?"var(--accent)":"var(--ink-3)"}" font-family="Sarabun,sans-serif">${l}</text></g>`;}).join("")}
</svg>`;
}
const CFG_BAKED={url:"",key:""};
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
