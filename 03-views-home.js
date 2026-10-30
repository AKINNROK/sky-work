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
