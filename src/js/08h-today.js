// ===== หน้า "วันนี้/สัปดาห์นี้" (รวมนัดผู้บริหาร · งาน · KPI ที่ต้องกรอก · เอกสารรอลงนาม · งานสั่งการ · กฎหมายใกล้ครบ) + ค้นหาข้ามระบบ (Ctrl/⌘+K) =====
// อ่านอย่างเดียว ไม่เขียนข้อมูลเอง · ส่วนเลขาฯ แสดงเมื่อปลด PIN แล้ว (หรือไม่ได้ตั้ง PIN) เท่านั้น
const TD={rng:"day"};
try{ const v=localStorage.getItem("sw-tdr"); if(v==="day"||v==="week")TD.rng=v; }catch(e){}
VIEWS.splice(1,0,["today","วันนี้ / สัปดาห์นี้"]); TABS.splice(1,0,"today"); TABLABEL.today="วันนี้";
ICON.today=ICON.cal; ICON.find='<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>';
const tdSecOk=()=>typeof secHasPin==="function"&&(!secHasPin()||SEC.unl);
const tdDays=()=>{ const t=secToday(), n=TD.rng==="week"?7:1; return Array.from({length:n},(_,i)=>secAdd(t,i)); };
const tdDayLbl=(iso,T)=>{ const d=new Date(iso+"T00:00:00"); return iso===T?"วันนี้":iso===secAdd(T,1)?"พรุ่งนี้":DAYTH[d.getDay()]+" "+d.getDate()+" "+MTH[d.getMonth()]; };
const tdLive=(t,iso)=>{ const s=occStat(t,new Date(iso+"T00:00:00")); return s!==STATUS_DONE&&s!==STATUS_CANCEL; };
function tdTasks(){ // งานในช่วง + งานค้าง (เกินกำหนดยังไม่เสร็จ)
 const T=secToday(), days=tdDays(), pool=items.filter(t=>t.track!=="idea"&&kindOfItem(t)!=="proj"&&t.status!==STATUS_CANCEL);
 const by=days.map(iso=>({iso,rows:pool.filter(t=>occursOn(t,new Date(iso+"T00:00:00"))&&tdLive(t,iso))}));
 const seen=new Set(by.flatMap(g=>g.rows.map(t=>t._id)));
 const late=pool.filter(t=>{ if(seen.has(t._id))return false; const d=dueDate(t); if(!d||!isOpenStatus(rr(t)?"x":t.status))return false; return daysTo(d)<0; })
  .sort((a,b)=>dueDate(a)-dueDate(b));
 return {by,late,T}; }
function tdKpi(){ const mo=kmMo(new Date()), out=[];
 phList().filter(t=>t.status!==STATUS_DONE).forEach(t=>{ let miss=0,tot=0; const gs=[];
  phKGroups(t).forEach(g=>{ const nd=kmNeed(g,mo,t); const m=nd.filter(k=>!kmHas(k,mo)); tot+=nd.length; miss+=m.length; if(m.length)gs.push(g.name+" "+m.length); });
  if(miss)out.push({t,miss,tot,gs}); });
 return {mo,rows:out.sort((a,b)=>b.miss-a.miss)}; }
function tdRow(o){ return `<div class="li td-r" ${o.attr}><div class="ic" style="background:var(--line-2);color:${o.col||"var(--accent)"}">${o.ic}</div><div class="tx"><div class="t1">${o.t1}</div><div class="t2">${o.t2||""}</div></div>${o.pill?`<span class="pill ${o.pc||"s-wait"}">${esc(o.pill)}</span>`:""}${o.done?`<button class="okbtn td-ok" data-tddone="${o.done}" title="เสร็จแล้ว" aria-label="ทำเสร็จแล้ว">${svg(ICON.check,15)}</button>`:""}</div>`; }
const tdIc=iso=>{ const d=new Date(iso+"T00:00:00"); return d.getDate()+"<br>"+MTH[d.getMonth()]; };
function tdCard(h,n,body,empty){ return `<div class="card td-c"><h2>${h} <small>${n}</small></h2>${body||`<div class="td-e">${empty||"ไม่มีรายการ"}</div>`}</div>`; }
function todayView(){
 const T=secToday(), days=tdDays(), tk=tdTasks(), ok=tdSecOk(), kp=tdKpi(), wk=TD.rng==="week";
 const nowM=new Date().getHours()*60+new Date().getMinutes();
 // นัดผู้บริหาร
 let apHtml="", apN=0;
 if(ok){ days.forEach(iso=>{ const L=secApptsOn(iso).filter(r=>r.status!=="cancelled"&&r.status!=="moved").sort((a,b)=>(a.st||"").localeCompare(b.st||"")); apN+=L.length;
   if(wk&&L.length)apHtml+=`<div class="lsec">${tdDayLbl(iso,T)}</div>`;
   apHtml+=L.map(r=>{ const m=secMin(r.st), past=iso===T&&m!==null&&m<nowM; return tdRow({attr:`data-tdsec="${r._id}|${iso}"${past?' style="opacity:.55"':""}`,ic:esc(r.st||"ทั้งวัน"),col:(secEx1(r.ex)||{}).color,t1:esc(r.title)+(r.rep?" ↻":""),t2:[secExName(r.ex),r.loc||r.place,r.who].filter(Boolean).map(esc).join(" · "),pill:(APST[r.status]||[""])[0],pc:(APST[r.status]||["","s-wait"])[1]}); }).join(""); }); }
 const apCard=ok?tdCard("นัดผู้บริหาร",apN?apN+" นัด":"",apHtml,"ไม่มีนัดในช่วงนี้"):`<div class="card td-c"><h2>นัดผู้บริหาร <small>🔒 ล็อกด้วย PIN</small></h2><div class="td-e">ข้อมูลเลขาฯ ซ่อนไว้ <button class="btn sm" id="tdUnlock" style="margin-left:8px">ใส่ PIN</button></div></div>`;
 // งาน
 const tRow=(t,iso)=>{ const d=dueDate(t), st=occStat(t,new Date(iso+"T00:00:00")); return tdRow({attr:`data-id="${t._id}" data-occ="${rr(t)?iso:""}"`,ic:tdIc(iso),col:sColor(st),t1:esc(t.title)+(quadOf(t)==="q1"?' <b class="qtag q-q1">1 ทำเลย</b>':""),t2:esc([(typeof gLabel==="function"?gLabel(t.track):""),t.owner||t.person].filter(Boolean).join(" · ")),pill:st,pc:sCls(st),done:(rr(t)?t._id+"|"+iso:t._id+"|")}); };
 let tkHtml=tk.late.length?`<div class="lsec" style="color:var(--over)">ค้าง / เกินกำหนด (${tk.late.length})</div>`+tk.late.slice(0,12).map(t=>{ const d=dueDate(t); return tRow(t,isoOf(d)).replace(/class="pill [^"]*">[^<]*</,`class="pill s-over">เกิน ${-daysTo(d)} วัน<`); }).join("")+(tk.late.length>12?`<div class="td-e">…อีก ${tk.late.length-12} งาน (ดูที่ งานทั้งหมด)</div>`:""):"";
 tk.by.forEach(g=>{ if(wk&&g.rows.length)tkHtml+=`<div class="lsec">${tdDayLbl(g.iso,T)}</div>`; tkHtml+=g.rows.map(t=>tRow(t,g.iso)).join(""); });
 const tkN=tk.by.reduce((s,g)=>s+g.rows.length,0);
 // KPI
 const kpHtml=kp.rows.map(x=>tdRow({attr:`data-tdkpi="${x.t._id}"`,ic:"KPI",t1:esc(x.t.title),t2:esc(x.gs.join(" · ")),pill:"ยังไม่กรอก "+x.miss,pc:"s-run"})).join("");
 // เอกสาร + สั่งการ + กฎหมาย
 const horizon=secAdd(T,wk?7:0);
 let docHtml="",docN=0,dirHtml="",dirN=0;
 if(ok){ const docs=secs.filter(r=>r.t==="doc"&&r.status==="wait").sort((a,b)=>(a.due||"9").localeCompare(b.due||"9")); docN=docs.length;
  docHtml=docs.slice(0,15).map(r=>{ const late=r.due&&r.due<T; return tdRow({attr:`data-tdsd="${r._id}"`,ic:r.due?tdIc(r.due):"—",col:late?"var(--over)":"",t1:esc(r.title)+(r.urgent?" 🔥":""),t2:esc([secExName(r.ex),r.from].filter(Boolean).join(" · ")),pill:late?"เลยกำหนด":r.due&&r.due<=horizon?"ใกล้ครบ":"รอลงนาม",pc:late?"s-over":"s-wait"}); }).join("");
  const dirs=secs.filter(r=>r.t==="dir"&&r.status!=="done").sort((a,b)=>(a.due||"9").localeCompare(b.due||"9")); dirN=dirs.length;
  dirHtml=dirs.slice(0,15).map(r=>{ const late=r.due&&r.due<T; return tdRow({attr:`data-tdsd="${r._id}"`,ic:r.due?tdIc(r.due):"—",col:late?"var(--over)":"",t1:esc(r.title),t2:esc([secExName(r.ex),r.owner&&"ผู้รับผิดชอบ "+r.owner].filter(Boolean).join(" · ")),pill:late?"เลยกำหนด":"ค้างอยู่",pc:late?"s-over":"s-wait"}); }).join(""); }
 const lgs=legal.map(L=>({L,d:legalDue(L)})).filter(x=>x.d&&daysTo(x.d)<=(wk?30:7)).sort((a,b)=>a.d-b.d);
 const lgHtml=lgs.slice(0,10).map(x=>{ const n=daysTo(x.d); return tdRow({attr:`data-lg="${x.L._id}"`,ic:tdIc(isoOf(x.d)),col:n<0?"var(--over)":"",t1:esc(x.L.title),t2:esc(x.L.person?"ผู้รับผิดชอบ "+x.L.person:"ยังไม่มีผู้รับผิดชอบ"),pill:n<0?"เกิน "+(-n)+" วัน":"อีก "+n+" วัน",pc:n<0?"s-over":"s-run"}); }).join("");
 const kpiTot=kp.rows.reduce((s,x)=>s+x.miss,0);
 const sum=`<div class="td-sum">${ok?`<span><b>${apN}</b> นัด</span>`:""}<span><b>${tkN}</b> งาน</span>${tk.late.length?`<span class="bad"><b>${tk.late.length}</b> ค้าง</span>`:""}${kpiTot?`<span class="warn"><b>${kpiTot}</b> KPI รอกรอก</span>`:""}${ok&&docN?`<span><b>${docN}</b> รอลงนาม</span>`:""}${ok&&dirN?`<span><b>${dirN}</b> สั่งการค้าง</span>`:""}</div>`;
 const d0=new Date();
 return header("วันนี้ / สัปดาห์นี้",DAYTH[d0.getDay()]+"ที่ "+d0.getDate()+" "+MTHFULL[d0.getMonth()]+" "+(d0.getFullYear()+543),false)+
 `<div class="toolbar"><div class="seg" id="tdrng"><button data-tdr="day" aria-pressed="${!wk}">วันนี้</button><button data-tdr="week" aria-pressed="${wk}">7 วันข้างหน้า</button></div>
 <button class="btn ghost sm" id="tdFind">${svg(ICON.find,16)} ค้นหาข้ามระบบ <kbd class="td-k">Ctrl/⌘ K</kbd></button></div>${sum}
 <div class="td-g">${apCard}${tdCard("งาน",tkN+tk.late.length?tkN+" งาน"+(tk.late.length?" · ค้าง "+tk.late.length:""):"",tkHtml,"ไม่มีงานในช่วงนี้ 🎉")}
 ${(()=>{ const pr=prepDue(wk?7:2); return pr.length?tdCard("ประชุมที่ต้องเตรียมข้อมูล",pr.length+" รายการ",pr.map(x=>tdRow({attr:`data-id="${x.t._id}"`,ic:tdIc(isoOf(x.p)),col:daysTo(x.p)<0?"var(--over)":"",t1:esc(x.t.title),t2:esc("ประชุม "+fmtDate(x.d)+(x.t.prepNote?" · "+x.t.prepNote:"")),pill:daysTo(x.p)<0?"เลยวันเตรียม":daysTo(x.p)===0?"เตรียมวันนี้":"อีก "+daysTo(x.p)+" วัน",pc:daysTo(x.p)<=0?"s-over":"s-run"})).join("")):""; })()}
 ${tdCard("KPI ที่ต้องกรอก",kp.rows.length?kmLabel(kp.mo):"",kpHtml,"KPI เดือนนี้กรอกครบแล้ว")}
 ${ok?tdCard("เอกสารรอลงนาม",docN?docN+" ฉบับ":"",docHtml,"ไม่มีเอกสารค้าง"):""}${ok?tdCard("งานสั่งการที่ค้าง",dirN?dirN+" เรื่อง":"",dirHtml,"ไม่มีงานสั่งการค้าง"):""}
 ${tdCard("กฎหมาย/ใบอนุญาตใกล้ครบ",lgs.length?lgs.length+" รายการ":"",lgHtml,"ไม่มีรายการใกล้ครบ")}</div>`; }
// ---------- ค้นหาข้ามระบบ ----------
const gsPlain=h=>String(h||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
const gsNorm=s=>String(s||"").toLowerCase();
function gsSnip(text,q){ const t=gsPlain(text), i=gsNorm(t).indexOf(q); if(i<0)return ""; const a=Math.max(0,i-24); return (a?"…":"")+t.slice(a,i+q.length+60)+(t.length>i+q.length+60?"…":""); }
function gsFind(q){ q=gsNorm(q).trim(); if(q.length<1)return []; const out=[];
 const hit=(...f)=>f.some(x=>x!=null&&gsNorm(gsPlain(x)).includes(q));
 const push=(grp,ic,o)=>out.push(Object.assign({grp,ic},o));
 items.forEach(t=>{ if(hit(t.title,t.note,t.owner,t.person,t.desc,t.detail)){ const pj=kindOfItem(t)==="proj"; push(pj?"โปรเจค":"งาน",pj?"📁":"✅",{id:t._id,t1:t.title,t2:[t.date?fmtDate(t.date):"",t.status,t.company].filter(Boolean).join(" · "),sn:gsSnip(t.note||t.desc||t.detail,q),go:()=>{ if(pj){ view="proj"; PH.tab="cards"; renderNav(); render(); } else openCard(t); }}); } });
 notes.forEach(n=>{ if(hit(n.title,n.body,n.tag,(n.tags||[]).join(" "))){ push("บันทึก","📝",{t1:n.title||"(ไม่มีชื่อ)",t2:[n.folder,n.date?fmtDate(n.date):""].filter(Boolean).join(" · ")+(typeof ntArch==="function"&&ntArch(n)?" · อยู่ในคลัง":""),sn:gsSnip(n.body,q),go:()=>{ if(n.kind===INKKIND)inkOpen(n); else viewNote(n); }}); } });
 legal.forEach(L=>{ if(hit(L.title,L.owner,L.no,L.cat,L.note,L.person)){ push("กฎหมาย","⚖️",{t1:L.title,t2:[L.cat,L.person].filter(Boolean).join(" · "),go:()=>openLegalCard(L)}); } });
 idx.forEach(x=>{ if(hit(x.title,x.note,x.url,x.cat)){ push("Index Online","🔗",{t1:x.title,t2:x.cat||"",go:()=>openIdxCard(x)}); } });
 ledger.forEach(x=>{ const gl=x.gl?glLabel(x.gl):""; if(hit(x.note,gl,x.title,x.desc)){ push("งบประมาณ","💰",{t1:x.note||gl||(x.kind==="income"?"รายรับ":"รายจ่าย"),t2:[x.date?fmtDate(x.date):"",gl,x.amount!=null?(x.kind==="income"?"+":"−")+Number(x.amount).toLocaleString("en-US")+" บาท":""].filter(Boolean).join(" · "),go:()=>{ if(typeof openTxCard==="function")openTxCard(x); else { view="budget"; renderNav(); render(); } }}); } });
 if(tdSecOk())secs.forEach(r=>{ if(hit(r.title,r.who,r.topic,r.dest,r.purpose,r.from,r.owner,r.note,r.detail,r.loc,r.place)){ const lbl={appt:"นัดผู้บริหาร",req:"คำขอเข้าพบ",doc:"เอกสารรอลงนาม",trip:"ทริป",dir:"งานสั่งการ"}[r.t]||"เลขาฯ";
   push(lbl,"🗓",{t1:r.title||r.topic||r.dest||"(ไม่มีชื่อ)",t2:[secExName(r.ex),r.date?fmtDate(r.date):r.due?"ครบ "+fmtDate(r.due):"",r.st].filter(Boolean).join(" · "),go:()=>{ if(r.t==="appt")secView1(r._id,r.date||secToday()); else secEdit(r._id); }}); } });
 return out; }
let GS={sel:0,res:[]};
function gsOpen(pref){ const d=xDlg("gsdlg","min(680px,96vw)"); d.className="gsdlg";
 d.innerHTML=`<div class="gs-h">${svg(ICON.find,18)}<input id="gsq" type="search" autocomplete="off" placeholder="ค้นหา งาน · บันทึก · กฎหมาย · Index · งบ${tdSecOk()?" · เลขาฯ":""}…" aria-label="ค้นหาข้ามระบบ"><button type="button" class="btn ghost sm" id="gsx">ปิด</button></div><div id="gsr" class="gs-r"></div><div class="gs-f">↑↓ เลือก · Enter เปิด · Esc ปิด${tdSecOk()?"":" · ข้อมูลเลขาฯ ไม่รวม (ยังล็อก PIN)"}</div>`;
 const q=el("gsq"), paint=()=>{ const v=q.value; GS.res=gsFind(v); GS.sel=0; const box=el("gsr");
  if(!v.trim()){ box.innerHTML=`<div class="td-e">พิมพ์คำที่ต้องการหา — ค้นทั้งชื่อและเนื้อหา</div>`; return; }
  if(!GS.res.length){ box.innerHTML=`<div class="td-e">ไม่พบ “${esc(v)}”</div>`; return; }
  let g="",n=0; box.innerHTML=GS.res.slice(0,60).map((r,i)=>{ const h=r.grp!==g?`<div class="lsec">${esc(r.grp)}</div>`:""; g=r.grp; n++; return h+`<button type="button" class="gs-i${i===0?" on":""}" data-gi="${i}"><span class="gs-ic">${r.ic}</span><span class="tx"><b>${esc(r.t1)}</b><small>${esc(r.t2||"")}</small>${r.sn?`<em>${esc(r.sn)}</em>`:""}</span></button>`; }).join("")+(GS.res.length>60?`<div class="td-e">แสดง 60 จาก ${GS.res.length} — พิมพ์เพิ่มให้แคบลง</div>`:""); };
 const go=i=>{ const r=GS.res[i]; if(!r)return; d.close(); setTimeout(()=>{ try{ r.go(); }catch(e){ console.error(e); } },30); };
 const mark=()=>{ d.querySelectorAll(".gs-i").forEach((b,i)=>b.classList.toggle("on",i===GS.sel)); const b=d.querySelector(".gs-i.on"); if(b)b.scrollIntoView({block:"nearest"}); };
 q.oninput=paint; q.onkeydown=e=>{ const n=Math.min(GS.res.length,60); if(e.key==="ArrowDown"){ e.preventDefault(); GS.sel=Math.min(n-1,GS.sel+1); mark(); } else if(e.key==="ArrowUp"){ e.preventDefault(); GS.sel=Math.max(0,GS.sel-1); mark(); } else if(e.key==="Enter"){ e.preventDefault(); go(GS.sel); } };
 el("gsr").onclick=e=>{ const b=e.target.closest("[data-gi]"); if(b)go(+b.dataset.gi); }; el("gsx").onclick=()=>d.close();
 d.onclick=e=>{ if(e.target===d)d.close(); }; d.onclose=()=>{ d.innerHTML=""; };
 if(!d.open)d.showModal(); if(pref)q.value=pref; paint(); q.focus(); }
document.addEventListener("keydown",e=>{ if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&String(e.key).toLowerCase()==="k"){ if(typeof ink!=="undefined"&&ink.note&&document.body.classList.contains("ink-on"))return; e.preventDefault(); const d=el("gsdlg"); if(d&&d.open){ el("gsq").select(); return; } if(document.querySelector("dialog[open]"))return; gsOpen(); } });
// ---------- ผูกปุ่ม + แทรกเมนู ----------
{ const _w=wire; wire=function(){ _w.apply(this,arguments);
  const q=s=>document.querySelectorAll(s);
  q("[data-tdr]").forEach(b=>b.onclick=()=>{ TD.rng=b.dataset.tdr; try{ localStorage.setItem("sw-tdr",TD.rng); }catch(e){} render(); });
  if(el("tdFind"))el("tdFind").onclick=()=>gsOpen();
  if(el("tdUnlock"))el("tdUnlock").onclick=()=>{ view="sec"; renderNav(); render(); window.scrollTo(0,0); };
  q("[data-tdsec]").forEach(n=>n.onclick=()=>{ const [id,iso]=n.dataset.tdsec.split("|"); secView1(id,iso); });
  q("[data-tdsd]").forEach(n=>n.onclick=()=>secEdit(n.dataset.tdsd));
  q("[data-tdkpi]").forEach(n=>n.onclick=()=>{ KM.id=n.dataset.tdkpi; KM.kp=null; KM.mo=kmMo(new Date()); PH.tab="kpim"; view="proj"; renderNav(); render(); window.scrollTo(0,0); });
 }; }
{ const _rn=renderNav; renderNav=function(){ _rn.apply(this,arguments);
  const n=el("nav"), tb=el("tabbar"); const mk=()=>{ const b=document.createElement("button"); b.type="button"; b.className="gs-btn"; b.title="ค้นหาข้ามระบบ (Ctrl/⌘+K)"; b.innerHTML=svg(ICON.find,19)+"<span>ค้นหา</span>"; b.onclick=()=>gsOpen(); return b; };
  if(n&&!n.querySelector(".gs-btn"))n.insertBefore(mk(),n.firstChild); if(tb&&!tb.querySelector(".gs-btn")){ const h=el("tbtoggle"); h?tb.insertBefore(mk(),h):tb.appendChild(mk()); } }; }
