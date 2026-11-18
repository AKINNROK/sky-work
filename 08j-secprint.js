// ===== พิมพ์ตารางนัดหน้าเดียวต่อผู้บริหาร (รายวัน A4 แนวตั้ง / รายสัปดาห์ A4 แนวนอน) — ใช้ "พิมพ์" แล้วเลือก Save as PDF ได้ =====
// อ่านอย่างเดียว · ปุ่ม "พิมพ์ตาราง" ในหน้าเลขาฯ (ต้องปลด PIN) · ทุกท่าน = 1 หน้าต่อท่าน
const SP={ex:"",mode:"day",date:"",free:false,extra:true,trip:true};
const spDate=iso=>{ const d=+iso.slice(8), m=+iso.slice(5,7)-1, y=+iso.slice(0,4)+543; return DOWFULL[secDow(iso)]+"ที่ "+d+" "+MTHFULL[m]+" "+y; };
const spShort=iso=>+iso.slice(8)+" "+MTH[+iso.slice(5,7)-1];
const spTm=r=>(r.st||"")+(r.en&&r.en!==r.st?"–"+r.en:"");
const spAppts=(ex,iso)=>secApptsOn(iso).filter(r=>r.ex===ex&&SEC_OK(r)).sort((a,b)=>(a.st||"").localeCompare(b.st||""));
function spExtras(ex){ if(!SP.extra)return "";
 const T=secToday(), docs=secs.filter(r=>r.t==="doc"&&r.ex===ex&&r.status==="wait").sort((a,b)=>(a.due||"9").localeCompare(b.due||"9")).slice(0,8);
 const dirs=secs.filter(r=>r.t==="dir"&&r.ex===ex&&r.status!=="done").sort((a,b)=>(a.due||"9").localeCompare(b.due||"9")).slice(0,8);
 if(!docs.length&&!dirs.length)return "";
 const blk=(h,rows,cols)=>rows.length?`<div class="psx"><h3>${h} (${rows.length})</h3><table class="pst sm"><tbody>${rows.map(r=>`<tr><td>${esc(r.title)}${r.urgent?" 🔥":""}</td><td>${esc(cols(r))}</td><td class="r${r.due&&r.due<T?" late":""}">${r.due?"ครบ "+spShort(r.due):""}</td></tr>`).join("")}</tbody></table></div>`:"";
 return `<div class="psxs">${blk("เอกสารรอลงนาม",docs,r=>r.from||"")}${blk("งานสั่งการที่ค้าง",dirs,r=>r.owner?"ผู้รับผิดชอบ "+r.owner:"")}</div>`; }
function spFoot(){ const n=new Date(); return `<footer>พิมพ์เมื่อ ${n.getDate()} ${MTH[n.getMonth()]} ${n.getFullYear()+543} ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")} น. · Sky Work · เอกสารลับเฉพาะผู้บริหาร</footer>`; }
function spDay(ex,iso){ const e=secEx1(ex)||{name:"",color:"#555"}, L=spAppts(ex,iso), tr=SP.trip?secTrip1(ex,iso):null; let rows=[];
 L.forEach(r=>rows.push({a:secMin(r.st)==null?-1:secMin(r.st),h:`<tr><td class="tm">${esc(spTm(r)||"ทั้งวัน")}</td><td><b>${esc(r.title)}</b>${r.status==="pending"?` <span class="tg">รอตอบรับ</span>`:""}${r.rep?" ↻":""}${r.note?`<small>${esc(r.note)}</small>`:""}</td><td>${esc(r.with||"")}</td><td>${esc(r.place||"")}</td><td class="lv">${+r.buf&&secMin(r.st)!=null?"ออก "+secHM(Math.max(0,secMin(r.st)-(+r.buf))):""}</td></tr>`}));
 if(SP.free&&!tr&&secDow(iso)>0&&secDow(iso)<6)secFree(ex,iso,30).forEach(g=>rows.push({a:g[0]-.5,h:`<tr class="fr"><td class="tm">${secHM(g[0])}–${secHM(g[1])}</td><td colspan="4">ว่าง</td></tr>`}));
 rows.sort((x,y)=>x.a-y.a);
 const lines=Array.from({length:5},()=>`<div class="ln"></div>`).join("");
 return `<section class="psh day"><header><div><h1>กำหนดการประจำวัน</h1><div class="who"><i style="background:${e.color||"#555"}"></i>${esc(e.name)}</div></div><div class="dt"><b>${spDate(iso)}</b><small>${L.length} นัด</small></div></header>
${tr?`<div class="ptrip">✈ ระหว่างเดินทาง: ${esc(tr.dest||"")}${tr.purpose?" — "+esc(tr.purpose):""} (${spShort(tr.from)}${tr.to&&tr.to!==tr.from?"–"+spShort(tr.to):""})</div>`:""}
<table class="pst"><thead><tr><th style="width:15%">เวลา</th><th>เรื่อง</th><th style="width:20%">ผู้ร่วม/ผู้มาพบ</th><th style="width:17%">สถานที่</th><th style="width:11%">ออกเดินทาง</th></tr></thead><tbody>${rows.length?rows.map(x=>x.h).join(""):`<tr><td colspan="5" class="empty">ไม่มีนัดหมาย</td></tr>`}</tbody></table>
${spExtras(ex)}<div class="psn"><h3>บันทึกเพิ่มเติม</h3>${lines}</div>${spFoot()}</section>`; }
function spWeek(ex,iso){ const e=secEx1(ex)||{name:"",color:"#555"}, w0=secWkStart(iso), days=Array.from({length:7},(_,i)=>secAdd(w0,i)); let tot=0;
 const cols=days.map(d=>{ const L=spAppts(ex,d), tr=SP.trip?secTrip1(ex,d):null; tot+=L.length; const we=secDow(d)===0||secDow(d)===6;
  return `<div class="wc${we?" we":""}"><div class="wh"><small>${DOW[secDow(d)]}</small><b>${+d.slice(8)}</b></div>${tr?`<div class="wt">✈ ${esc(tr.dest||"")}</div>`:""}${L.map(r=>`<div class="wi"><b>${esc(spTm(r)||"ทั้งวัน")}</b>${esc(r.title)}${r.status==="pending"?" (รอตอบรับ)":""}${(r.place||r.with)?`<small>${esc([r.place,r.with&&"พบ "+r.with].filter(Boolean).join(" · "))}</small>`:""}${+r.buf?`<small>ออก ${secHM(Math.max(0,(secMin(r.st)||0)-(+r.buf)))}</small>`:""}</div>`).join("")}</div>`; }).join("");
 return `<section class="psh week"><header><div><h1>กำหนดการประจำสัปดาห์</h1><div class="who"><i style="background:${e.color||"#555"}"></i>${esc(e.name)}</div></div><div class="dt"><b>${spShort(days[0])} – ${spShort(days[6])} ${+days[6].slice(0,4)+543}</b><small>${tot} นัด</small></div></header>
<div class="wg">${cols}</div>${spExtras(ex)}${spFoot()}</section>`; }
function spBuild(){ const iso=SP.date||secToday(), ids=SP.ex==="all"?secEx.map(e=>e.id):[SP.ex].filter(Boolean); return ids.map(id=>SP.mode==="week"?spWeek(id,iso):spDay(id,iso)).join(""); }
function spOpen(){ if(!secEx.length){ tell("ยังไม่มีผู้บริหาร — เพิ่มที่ปุ่ม “ผู้บริหาร” ก่อนนะคะ"); return; }
 if(!SP.date)SP.date=SEC.day||secToday(); if(!SP.ex||(SP.ex!=="all"&&!secEx1(SP.ex)))SP.ex=SEC.ex!=="all"&&secEx1(SEC.ex)?SEC.ex:secEx[0].id;
 const d=xDlg("secprint","min(820px,96vw)");
 const ui=()=>{ d.innerHTML=`<div class="dlg-h">พิมพ์ตารางนัด / บันทึกเป็น PDF</div><div class="dlg-b" style="grid-template-columns:1fr 1fr">
<div class="f"><label for="sp-ex">ผู้บริหาร</label><select class="ph-in" id="sp-ex">${secEx.map(e=>`<option value="${e.id}"${SP.ex===e.id?" selected":""}>${esc(e.name)}</option>`).join("")}${secEx.length>1?`<option value="all"${SP.ex==="all"?" selected":""}>ทุกท่าน (1 หน้า/ท่าน)</option>`:""}</select></div>
<div class="f"><label for="sp-mode">รูปแบบ</label><select class="ph-in" id="sp-mode"><option value="day"${SP.mode==="day"?" selected":""}>รายวัน (A4 แนวตั้ง)</option><option value="week"${SP.mode==="week"?" selected":""}>รายสัปดาห์ (A4 แนวนอน)</option></select></div>
<div class="f"><label for="sp-date">${SP.mode==="week"?"สัปดาห์ที่มีวันที่":"วันที่"}</label><input class="ph-in" type="date" id="sp-date" value="${esc(SP.date)}"></div>
<div class="f"><label>ตัวเลือก</label><div class="sp-ck"><label><input type="checkbox" id="sp-extra"${SP.extra?" checked":""}> เอกสารรอลงนาม + งานสั่งการ</label><label><input type="checkbox" id="sp-trip"${SP.trip?" checked":""}> ทริป</label>${SP.mode==="day"?`<label><input type="checkbox" id="sp-free"${SP.free?" checked":""}> ช่วงว่าง</label>`:""}</div></div>
<div class="f wide"><label>ตัวอย่าง</label><div class="sp-prev" id="sp-prev">${spBuild()}</div></div></div>
<div class="dlg-f"><button type="button" class="btn ghost" id="sp-no">ปิด</button><button type="button" class="btn" id="sp-go">${svg('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',17)}พิมพ์ / บันทึก PDF</button></div>`;
  const re=()=>{ ui(); };
  el("sp-ex").onchange=e=>{ SP.ex=e.target.value; re(); }; el("sp-mode").onchange=e=>{ SP.mode=e.target.value; re(); }; el("sp-date").onchange=e=>{ if(e.target.value)SP.date=e.target.value; re(); };
  el("sp-extra").onchange=e=>{ SP.extra=e.target.checked; re(); }; el("sp-trip").onchange=e=>{ SP.trip=e.target.checked; re(); }; if(el("sp-free"))el("sp-free").onchange=e=>{ SP.free=e.target.checked; re(); };
  el("sp-no").onclick=()=>d.close(); el("sp-go").onclick=spPrint; };
 d.onclose=()=>{ d.innerHTML=""; }; ui(); if(!d.open)d.showModal(); }
function spPrint(){ let s=el("psheet"); if(!s){ s=document.createElement("div"); s.id="psheet"; document.body.appendChild(s); }
 s.innerHTML=spBuild(); let pg=el("psheet-pg"); if(!pg){ pg=document.createElement("style"); pg.id="psheet-pg"; document.head.appendChild(pg); }
 pg.textContent=`@page{size:A4 ${SP.mode==="week"?"landscape":"portrait"};margin:10mm}`; document.body.classList.add("psheet-on");
 const done=()=>{ document.body.classList.remove("psheet-on"); s.innerHTML=""; window.removeEventListener("afterprint",done); };
 window.addEventListener("afterprint",done); setTimeout(()=>{ try{ window.print(); }catch(e){ done(); } },80); }
{ const _sv=secView; secView=function(){ const h=_sv.apply(this,arguments); return SEC.unl&&secEx.length?h.replace('<button class="btn ghost" id="secEx">','<button class="btn ghost" id="secPrint">🖨 พิมพ์ตาราง</button><button class="btn ghost" id="secEx">'):h; }; }
{ const _w=wire; wire=function(){ _w.apply(this,arguments); if(el("secPrint"))el("secPrint").onclick=spOpen; }; }
