// ===== รอบ B: เชื่อมข้อมูลข้ามระบบ (v14.14.55) =====
// B4 งบอีเวนต์ → หน้างบ (ผูกหมวด GL; ยอดอนุมัติ/ใช้จริงลงช่องงบของโปรเจค b1/actual/gl1)
// B5 "เพิ่มกิจกรรม" = อีเวนต์ (มีเทมเพลต) · กิจกรรมเดิมแปลงเป็นอีเวนต์ได้จากการ์ด
// B6 ปฏิทินแสดงนัดผู้บริหาร · Action Plan · Milestone · กฎหมายครบกำหนด + ไฟล์ .ics รวมด้วย
// B7 งานสั่งการ → สร้างเป็นงาน HR (ปิดงานแล้วสั่งการปิดตาม) · B8 ประชุม ↔ บันทึกประชุม · B9 การ์ดโปรเจค → Project Hub · B10 รายงานผู้บริหารมีโปรเจค
// ---------- B4 ----------
{ const _s=evSave; evSave=async function(patch){ if(patch&&patch.ev){ const e=patch.ev, B=evBudTot(e);
   if(B.ap||B.plan||B.act){ patch.b1=B.ap||B.plan; patch.actual=B.act; } if(e.gl!==undefined)patch.gl1=e.gl||""; }
  return _s.call(this,patch); }; }
{ const _b=evBud; evBud=function(){ const e=EV.t.ev, h=_b.apply(this,arguments);
  const sel=`<div class="ev-glr"><label>ลงงบในหมวด GL <select class="ph-in" data-s="ev.gl"><option value="">— ยังไม่ผูกหมวด —</option>${visible(gls).map(g=>`<option value="${esc(g.key)}"${(e.gl||glKeyOf(EV.t.gl1))===g.key?" selected":""}>${esc(glLabel(g.key))}</option>`).join("")}</select></label><span class="ph-hint">ยอด “อนุมัติ” (หรือรวมแผน) และ “ใช้จริง” ของหน้านี้ ไปขึ้นในหน้างบประมาณตามหมวดนี้อัตโนมัติ${txLinkedSum(EV.t)?` · <b>มีบันทึกเงินผูกกับโปรเจคนี้ ${baht(txLinkedSum(EV.t))} ฿ — หน้างบใช้ยอดบันทึกเงินแทน</b>`:""}</span></div>`;
  return h.replace('<div class="ev-h"><h3>งบประมาณ แผน vs จริง</h3></div>','<div class="ev-h"><h3>งบประมาณ แผน vs จริง</h3></div>'+sel); }; }
// ---------- B5 ----------
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest('[data-pick="act"]'); if(!b)return; e.preventDefault(); e.stopImmediatePropagation(); const d=el("pickdlg"); if(d&&d.open)d.close(); evCreate(); },true);
function pickActLabel(){ const b=document.querySelector('[data-pick="act"]'); if(!b||b._lb)return; b._lb=1; const bb=b.querySelector("b"), ii=b.querySelector("i"); if(bb)bb.textContent="เพิ่มกิจกรรม / อีเวนต์"; if(ii)ii.textContent="เทมเพลต · กำหนดการ · เช็กลิสต์ · งบ · ผู้ขาย · ผู้เข้าร่วม"; }
async function evConvertAct(t){ const v=await evAsk(t); if(!v)return; const tp=EVT.find(x=>x.k===v.tp), b=evBuild(tp,v);
 b.ev.chk.b=(t.aprep||[]).filter(x=>x&&x.t).map(x=>({id:evId(),t:x.t,done:!!x.d,owner:"",due:""})).concat(b.ev.chk.b);
 if(+t.apaxreal)b.ev.att.show=String(t.apaxreal); if(+t.actual&&!b.ev.bud.some(x=>x.act)){ b.ev.bud[0].act=String(+t.actual); }
 const patch={kind:"proj",ev:b.ev,acts:evActs(t).concat(b.acts),kteams:phKTeams(t).concat(b.teams),ms:chkList(t.ms).concat(b.ms),date:v.date,pend:v.date,pstart:t.pstart||(isoOf(new Date())<v.date?isoOf(new Date()):v.date)};
 try{ await DB.collection("items").doc(t._id).set(patch,{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; }
 const c=el("cardlg"); if(c&&c.open)c.close(); setFoot("แปลงเป็นอีเวนต์แล้ว — อยู่ใน Project Hub"); setTimeout(()=>evOpen(t._id,"ev"),500); }
// ---------- B6 ปฏิทิน ----------
const CALX_K="sw-calx"; const calxOn=()=>{ try{ return localStorage.getItem(CALX_K)!=="0"; }catch(e){ return true; } };
function calExtras(iso){ const out=[];
 if(typeof tdSecOk==="function"&&tdSecOk())secApptsOn(iso).filter(r=>SEC_OK(r)).sort((a,b)=>(a.st||"").localeCompare(b.st||"")).forEach(r=>out.push({k:"sec",c:(secEx1(r.ex)||{}).color||"#8a5cc7",t:(r.st?r.st+" ":"")+r.title,s:secExName(r.ex)+(r.place?" · "+r.place:""),a:`data-cxsec="${r._id}|${iso}"`}));
 phList().filter(t=>t.status!==STATUS_DONE).forEach(t=>{
  evActs(t).filter(a=>a.due===iso&&a.st!=="done").forEach(a=>out.push({k:"ap",c:"#2e9e6b",t:a.title,s:"Action Plan · "+t.title+(a.owner?" · "+a.owner:""),a:`data-evopen="${t._id}"`}));
  chkList(t.ms).filter(m=>m.due===iso&&!m.d).forEach(m=>out.push({k:"ms",c:"#e08a1e",t:"◆ "+m.t,s:"Milestone · "+t.title,a:`data-cxph="${t._id}"`})); });
 legal.forEach(L=>{ const d=legalDue(L); if(d&&isoOf(d)===iso)out.push({k:"lg",c:"var(--over)",t:"⚖ "+L.title,s:"กฎหมาย/ใบอนุญาตครบกำหนด",a:`data-lg="${L._id}"`}); });
 return out; }
const calXRow=x=>`<div class="li cx-r" ${x.a}><div class="ic" style="background:var(--line-2)"><i class="cx-dot" style="background:${x.c}"></i></div><div class="tx"><div class="t1">${esc(x.t)}</div><div class="t2">${esc(x.s)}</div></div></div>`;
function calXPaint(){ if(view!=="cal"||R.calMode!=="month")return; const tb=document.querySelector("#view .toolbar"); const on=calxOn();
 if(tb&&!el("calxT")){ const b=document.createElement("button"); b.id="calxT"; b.className="btn ghost sm"; b.textContent=on?"✓ นัด/แผนงาน":"แสดงนัด/แผนงาน"; b.title="แสดงนัดผู้บริหาร · Action Plan · Milestone · กฎหมาย ในปฏิทิน"; b.onclick=()=>{ try{ localStorage.setItem(CALX_K,on?"0":"1"); }catch(e){} render(); }; tb.appendChild(b); }
 if(!on)return; const lg=document.querySelector(".span3 .legend"); if(lg&&!lg.querySelector(".cx-lg")){ const sp=document.createElement("span"); sp.className="cx-lg"; sp.innerHTML=`<i style="background:#8a5cc7;border-radius:2px"></i>สี่เหลี่ยม = นัดผู้บริหาร · <b style="color:#2e9e6b">■</b> Action Plan · <b style="color:#e08a1e">■</b> Milestone`; lg.appendChild(sp); }
 const y=R.year, m=R.month, P=n=>String(n).padStart(2,"0"); let month=[];
 document.querySelectorAll(".mcal .day[data-day]").forEach(c=>{ const d=+c.dataset.day, iso=y+"-"+P(m+1)+"-"+P(d), X=calExtras(iso); if(!X.length)return; month.push(...X.map(x=>Object.assign({d,iso},x)));
  const s=document.createElement("span"); s.className="xdots"; s.innerHTML=X.slice(0,4).map(x=>`<i style="background:${x.c}"></i>`).join("")+(X.length>4?"+":""); c.appendChild(s); });
 const pn=document.querySelector(".calpanel .list"); if(!pn)return;
 const L=R.selDay?month.filter(x=>x.d===R.selDay):month; if(!L.length)return;
 const box=document.createElement("div"); box.className="cx-box"; box.innerHTML=`<div class="lsec li-hd" style="--c:#8a5cc7"><i></i>${R.selDay?"นัด & กำหนดการอื่นของวันนี้":"นัดผู้บริหาร · Action Plan · Milestone เดือนนี้"} <small>${L.length}</small></div>`+L.slice(0,R.selDay?30:12).map(x=>R.selDay?calXRow(x):calXRow(Object.assign({},x,{s:x.d+" "+MTH[m]+" · "+x.s}))).join("")+(!R.selDay&&L.length>12?`<div class="td-e">…อีก ${L.length-12} รายการ — แตะวันที่เพื่อดู</div>`:"");
 pn.insertBefore(box,pn.firstChild);
 box.querySelectorAll("[data-cxsec]").forEach(n=>n.onclick=()=>{ const [id,iso]=n.dataset.cxsec.split("|"); secView1(id,iso); });
 box.querySelectorAll("[data-cxph]").forEach(n=>n.onclick=()=>phOpen(n.dataset.cxph));
 box.querySelectorAll("[data-evopen]").forEach(n=>n.onclick=()=>evOpen(n.dataset.evopen));
 box.querySelectorAll("[data-lg]").forEach(n=>n.onclick=()=>{ const Lg=legal.find(x=>x._id===n.dataset.lg); if(Lg)openLegalCard(Lg); }); }
const ICSX_K="sw-icsx"; const icsxGet=()=>{ try{ return Object.assign({sec:1,ap:1},JSON.parse(localStorage.getItem(ICSX_K)||"{}")); }catch(e){ return {sec:1,ap:1}; } };
{ const _i=icsText; icsText=function(){ const s=_i.apply(this,arguments), X=icsxGet(), pad=n=>String(n).padStart(2,"0"), st=iso=>iso.replace(/-/g,""), e2=v=>String(v||"").replace(/[\;,]/g,m=>"\\"+m).replace(/\n/g," "), now=st(isoOf(new Date()))+"T090000Z", ev=[];
  const day=(id,iso,sum,desc)=>{ const n=new Date(iso+"T00:00:00"); n.setDate(n.getDate()+1); ev.push("BEGIN:VEVENT","UID:"+id+"@skywork","DTSTAMP:"+now,"DTSTART;VALUE=DATE:"+st(iso),"DTEND;VALUE=DATE:"+st(isoOf(n)),"SUMMARY:"+e2(sum),"DESCRIPTION:"+e2(desc),"END:VEVENT"); };
  if(X.sec){ const T=isoOf(new Date()); for(let i=-7;i<120;i++){ const d=new Date(T+"T00:00:00"); d.setDate(d.getDate()+i); const iso=isoOf(d);
    secApptsOn(iso).filter(r=>SEC_OK(r)).forEach(r=>{ const a=secMin(r.st); if(a==null){ day("sec-"+r._id+"-"+st(iso),iso,"[ผู้บริหาร] "+r.title,secExName(r.ex)); return; } const b=secMin(r.en)!=null?secMin(r.en):a+60;
     ev.push("BEGIN:VEVENT","UID:sec-"+r._id+"-"+st(iso)+"@skywork","DTSTAMP:"+now,"DTSTART:"+st(iso)+"T"+pad(Math.floor(a/60))+pad(a%60)+"00","DTEND:"+st(iso)+"T"+pad(Math.floor(b/60)%24)+pad(b%60)+"00","SUMMARY:"+e2("["+secExName(r.ex)+"] "+r.title),"DESCRIPTION:"+e2([r.with&&"พบ "+r.with,r.place,+r.buf?"เผื่อเดินทาง "+r.buf+" นาที":""].filter(Boolean).join(" · ")),...(r.place?["LOCATION:"+e2(r.place)]:[]),"END:VEVENT"); }); } }
  if(X.ap)phList().filter(t=>t.status!==STATUS_DONE).forEach(t=>{ evActs(t).filter(a=>a.due&&a.st!=="done").forEach(a=>day("ap-"+a.id,a.due,"[Action Plan] "+a.title,t.title+(a.owner?" · "+a.owner:""))); chkList(t.ms).filter(m=>m.due&&!m.d).forEach((m,i)=>day("ms-"+t._id+"-"+i,m.due,"[Milestone] "+m.t,t.title)); });
  return ev.length?s.replace("END:VCALENDAR",ev.join("\r\n")+"\r\nEND:VCALENDAR"):s; }; }
{ const _r=setRemind; setRemind=function(){ const X=icsxGet(); return _r.apply(this,arguments).replace('<div class="addg"><button class="btn" id="icsgo">',`<div class="rm-f" style="margin-top:10px"><label class="rm-ck"><input type="checkbox" id="icsx-sec"${X.sec?" checked":""}> รวมนัดผู้บริหาร</label><label class="rm-ck"><input type="checkbox" id="icsx-ap"${X.ap?" checked":""}> รวม Action Plan / Milestone</label></div><div class="addg"><button class="btn" id="icsgo">`); }; }
// ---------- B7 งานสั่งการ → งาน HR ----------
async function dirToTask(id){ const r=secs.find(x=>x._id===id); if(!r)return; const tid=uuid(), grp=(groups.find(g=>g.key==="secretary")||{}).key||neutralGroup();
 const data={title:r.title,status:"รอดำเนินการ",owner:r.owner||"",date:r.due||null,track:grp,company:"",type:"",quad:"q1",note:"งานสั่งการจาก "+secExName(r.ex)+(r.given?" (สั่งเมื่อ "+fmtDate(r.given)+")":"")+(r.note?" · "+r.note:""),secDir:r._id,months:[]};
 try{ await DB.collection("items").doc(tid).set(data); await secPut(Object.assign({},r,{task:tid})); setFoot("สร้างเป็นงานแล้ว — ปิดงานเมื่อไร งานสั่งการจะปิดตาม"); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } }
let dirSyncBusy=false;
async function dirSync(){ if(dirSyncBusy||!DB||LOADING)return; dirSyncBusy=true; try{
 for(const r of secs.filter(x=>x.t==="dir"&&x.task&&x.status!=="done")){ const t=items.find(i=>i._id===r.task); if(t&&t.status===STATUS_DONE)await secPut(Object.assign({},r,{status:"done",doneAt:secToday()})); } }finally{ dirSyncBusy=false; } }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-secdir]"); if(!b)return; const r=secs.find(x=>x._id===b.dataset.secdir); const t=r&&r.task&&items.find(i=>i._id===r.task); if(t&&isOpenStatus(t.status))DB.collection("items").doc(t._id).set({status:STATUS_DONE},{merge:true}).catch(()=>{}); },true);
function dirPaint(){ if(view!=="sec"||!SEC.unl||SEC.tab!=="trip")return;
 document.querySelectorAll(".li[data-secedit]").forEach(n=>{ const r=secs.find(x=>x._id===n.dataset.secedit); if(!r||r.t!=="dir"||n.querySelector(".dir-t"))return; const t=r.task&&items.find(i=>i._id===r.task);
  const b=document.createElement("button"); b.type="button"; b.className="btn ghost sm dir-t"; b.textContent=t?"งาน: "+(t.status===STATUS_DONE?"เสร็จ ✓":t.status):(r.status==="done"?"":"→ สร้างเป็นงาน HR"); if(!b.textContent)return;
  b.title=t?"เปิดงานที่ผูกไว้":"สร้างงานในระบบงาน (ขึ้นปฏิทิน/งานทั้งหมด/Matrix) แล้วผูกกับงานสั่งการนี้";
  b.onclick=ev=>{ ev.stopPropagation(); if(t)openCard(t); else dirToTask(r._id); }; const tx=n.querySelector(".tx"); (tx||n).appendChild(b); }); }
// ---------- B8 ประชุม ↔ บันทึก · B9 การ์ดโปรเจค · B5 แปลงกิจกรรม ----------
const mtgNotes=t=>notes.filter(n=>n.mtg===t._id);
async function mtgNote(t,occ){ const d=occ||t.date||isoOf(new Date()), ex=notes.find(n=>n.mtg===t._id&&(n.mtgd||n.date)===d); const c=el("cardlg"); if(c&&c.open)c.close();
 if(ex){ viewNote(ex); return; }
 const id=uuid(), body=`<p><b>ประชุม:</b> ${esc(t.title)} · ${fmtDate(d)} ${+d.slice(0,4)+543}${t.time?" · "+esc(t.time)+" น.":""}${t.place?" · "+esc(t.place):""}</p>${t.attendees?`<p><b>ผู้เข้าร่วม:</b> ${esc(t.attendees)}</p>`:""}<h2>วาระ</h2><p><br></p><h2>มติ / ข้อสรุป</h2><p><br></p><h2>งานที่ต้องทำ (ใคร · อะไร · เมื่อไร)</h2><p><br></p>`;
 const n={title:"บันทึกประชุม: "+t.title+" "+fmtDate(d),kind:"บันทึกการประชุม",date:d,fmt:"h",body,mtg:t._id,mtgd:d,opened:isoOf(new Date()),arch:false,tag:"",color:"",pin:false,folder:""};
 try{ await DB.collection("note").doc(id).set(n); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; }
 openNote(Object.assign({_id:id},n)); }
{ const _c=openCard; openCard=function(t,occ){ const r=_c.apply(this,arguments); try{ const f=document.querySelector("#cardlg .dlg-f"); if(!f||!t)return r; f.querySelectorAll(".xcard").forEach(b=>b.remove());
  const add=(txt,fn,cls)=>{ const b=document.createElement("button"); b.type="button"; b.className="btn ghost xcard"+(cls?" "+cls:""); b.textContent=txt; b.onclick=fn; f.insertBefore(b,el("vc-edit2")); };
  const k=kindOfItem(t);
  if(isMeet(t)&&!isTrain(t)){ const n=mtgNotes(t).length; add(n?"📝 บันทึกประชุม ("+n+")":"📝 จดบันทึกประชุม",()=>mtgNote(t,occ)); }
  if(k==="proj"){ add("📊 เปิดใน Project Hub",()=>{ el("cardlg").close(); phOpen(t._id); }); add(t.ev?"🎪 อีเวนต์ / Action Plan":"Action Plan",()=>{ el("cardlg").close(); evOpen(t._id,t.ev?"ev":"ap"); }); }
  if(k==="act")add("🎪 แปลงเป็นอีเวนต์ (เทมเพลต)",()=>evConvertAct(t));
  if(t.secDir){ const s=secs.find(x=>x._id===t.secDir); if(s)add("📌 งานสั่งการ: "+secExName(s.ex),()=>{ el("cardlg").close(); view="sec"; SEC.tab="trip"; renderNav(); render(); }); }
 }catch(e){ console.error(e); } return r; }; }
{ const _v=viewNote; viewNote=function(n){ const r=_v.apply(this,arguments); try{ const b=el("nvb"); let x=el("nv-mtg"); if(x)x.remove(); const t=n&&n.mtg&&items.find(i=>i._id===n.mtg);
  if(b&&t){ x=document.createElement("div"); x.id="nv-mtg"; x.className="nv-mtg"; x.innerHTML=`↩ ประชุม: <b>${esc(t.title)}</b>${n.mtgd?" · "+fmtDate(n.mtgd):""} <button type="button" class="btn ghost sm">เปิดการประชุม</button>`; x.querySelector("button").onclick=()=>{ const d=el("nvdlg")||b.closest("dialog"); if(d&&d.open)d.close(); openCard(t,n.mtgd||""); }; b.parentNode.insertBefore(x,b); } }catch(e){} return r; }; }
// ---------- B10 รายงานผู้บริหาร: โปรเจค ----------
function execProj(){ const L=phList().filter(t=>t.status!==STATUS_DONE); if(!L.length)return "";
 const rows=L.map(t=>({t,r:phRag(t),pg:phProg(t),k:phKpiAvg(t),A:evProg(evActs(t))})).sort((a,b)=>"rygd".indexOf(a.r.k)-"rygd".indexOf(b.r.k));
 return `<div class="card" style="margin-top:16px"><h2>โปรเจค & KPI <small>${L.length} โปรเจคที่กำลังทำ · สถานะ ณ วันนี้</small></h2><div class="tblwrap"><table class="tbl"><thead><tr><th>โปรเจค</th><th>สถานะ</th><th class="num">ความคืบหน้า</th><th class="num">KPI เฉลี่ย</th><th class="num">Action Plan</th><th>กำหนดเสร็จ</th></tr></thead><tbody>
${rows.map(({t,r,pg,k,A})=>`<tr data-cxph="${t._id}" style="cursor:pointer"><td><b>${esc(t.title)}</b>${t.ev?` <small>🎪 ${t.ev.date?fmtDate(t.ev.date):""}</small>`:""}${r.why&&r.why[0]?`<div style="font-size:12px;color:var(--ink-3)">${esc(r.why[0])}</div>`:""}</td><td><span class="ph-rag" style="--c:${RAGC[r.k]}"><i></i>${r.label}</span></td><td class="num">${pg}%</td><td class="num" style="color:${phKc(k)}">${k===null?"–":k+"%"}</td><td class="num">${A.n?A.d+"/"+A.n+(A.late?` <b style="color:var(--over)">(เลย ${A.late})</b>`:""):"–"}</td><td>${t.pend?fmtDate(t.pend):"–"}</td></tr>`).join("")}</tbody></table></div>
<div class="addg noprint"><button class="btn ghost sm" id="execPhSum">${svg(ICON.ai,15)} สรุปโปรเจคแบบละเอียด (Project Hub)</button></div></div>`; }
{ const _e=execView; execView=function(){ return _e.apply(this,arguments)+execProj(); }; }
// ---------- ผูกปุ่ม ----------
{ const _w=wire; wire=function(){ _w.apply(this,arguments); pickActLabel();
  try{ calXPaint(); }catch(e){ console.error(e); } try{ dirPaint(); }catch(e){ console.error(e); } dirSync();
  ["icsx-sec","icsx-ap"].forEach(id=>{ const c=el(id); if(c)c.onchange=()=>{ const X=icsxGet(); X[id.slice(5)]=c.checked?1:0; try{ localStorage.setItem(ICSX_K,JSON.stringify(X)); }catch(e){} }; });
  if(el("execPhSum"))el("execPhSum").onclick=phSummary;
  if(view==="exec")document.querySelectorAll("tr[data-cxph]").forEach(n=>n.onclick=()=>phOpen(n.dataset.cxph)); }; }
