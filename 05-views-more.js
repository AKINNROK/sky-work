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
 let col="",bg="",dc="",di="",dbg="",da="",dta="",dh="";
 if(T==="SPAN"){ col=ntRgb(n.style.color); bg=ntRgb(n.style.backgroundColor); }
 if(T==="LI"&&n.getAttribute("data-c")==="1")dc="1";
 if(/^(P|DIV|H2|H3|BLOCKQUOTE)$/.test(T)&&/^[1-6]$/.test(n.getAttribute("data-i")||""))di=n.getAttribute("data-i");
 if((T==="TD"||T==="TH")&&NT_BG.has(n.getAttribute("data-bg")||""))dbg=n.getAttribute("data-bg");
 if((T==="TD"||T==="TH")&&/^[lcr]$/.test(n.getAttribute("data-a")||""))da=n.getAttribute("data-a");
 if(T==="TABLE"&&/^[lcr]$/.test(n.getAttribute("data-ta")||""))dta=n.getAttribute("data-ta");
 if((T==="TD"||T==="TH")&&n.getAttribute("data-h")==="1")dh="1";
 [...n.attributes].forEach(at=>n.removeAttribute(at.name));
 if(cls)n.className=cls;
 if(col||bg)n.setAttribute("style",(col?"color:"+col+";":"")+(bg?"background-color:"+bg+";":""));
 if(dc)n.setAttribute("data-c",dc); if(di)n.setAttribute("data-i",di); if(dbg)n.setAttribute("data-bg",dbg); if(da)n.setAttribute("data-a",da); if(dta)n.setAttribute("data-ta",dta); if(dh)n.setAttribute("data-h",dh);
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
