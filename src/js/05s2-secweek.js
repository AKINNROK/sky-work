// ===== เลขาผู้บริหาร — ตารางสัปดาห์ 7 วัน (เริ่มวันอาทิตย์/จันทร์เลือกได้) · ปฏิทินย่อ · คัดลอกนัด/คัดลอกทั้งวัน-ทั้งสัปดาห์ไปวันอื่น =====
const SEC_OK=r=>r.status!=="cancelled"&&r.status!=="moved";
const secMine=r=>SEC.ex==="all"||r.ex===SEC.ex;
const secHay=r=>[r.title,r.with,r.place,r.note].join(" ").toLowerCase();
const secWs=()=>{ try{ return localStorage.getItem("sw-sec-ws")==="1"?1:0; }catch(e){ return 0; } };
const secWkStart=iso=>secAdd(iso,-((secDow(iso)-secWs()+7)%7));
const secDayLbl=iso=>+iso.slice(8)+" "+MTH[+iso.slice(5,7)-1];
function secWeekCount(){ const w0=secWkStart(secToday()); let n=0; for(let i=0;i<7;i++)n+=secApptsOn(secAdd(w0,i)).filter(r=>secMine(r)&&SEC_OK(r)).length; return n; }

// ---------- บัตรนัด / คอลัมน์วัน ----------
function secCard(r,iso){ const cf=secConf(r), st=APST[r.status]||APST.confirmed, e=secEx1(r.ex), col=(e&&e.color)||"#6b7a89";
 return `<div class="sec-card${r.status==="cancelled"?" off":""}" style="--c:${col}" data-secedit="${r._id}" data-secocc="${iso}" tabindex="0">
<div class="sec-ct"><b>${esc(r.title)}</b><button type="button" class="sec-cp" data-seccp="${r._id}|${iso}" title="คัดลอกนัดนี้ไปวันอื่น" aria-label="คัดลอกนัดนี้">⧉</button></div>
<div class="sec-cm">🕘 ${esc(r.st||"—")}${r.en?" – "+esc(r.en):""}${r.rep?` <span class="sec-rp" title="${esc(secRepTxt(r))}">↻ ${esc(secRepTxt(r).split(" · ")[0])}</span>`:""}</div>
${r.with?`<div class="sec-cm">👤 ${esc(r.with)}</div>`:""}${r.place?`<div class="sec-cm">📍 ${esc(r.place)}</div>`:""}${+r.buf?`<div class="sec-cm">🚗 เผื่อเดินทาง ${r.buf} น.</div>`:""}${r.note?`<div class="sec-cm sec-nt">${esc(r.note)}</div>`:""}
<div class="sec-cf">${SEC.ex==="all"?secExChip(r.ex):""}${r.status!=="confirmed"?`<span class="pill ${st[1]}">${st[0]}</span>`:""}${cf.length?`<b class="sec-bad">⚠ ชน ${esc(cf.map(x=>x.title).join(", "))}</b>`:""}</div></div>`; }
function secUpcoming(){ const T=secToday(), lim=secAdd(T,45), lim2=secAdd(T,14), it=[];
 secs.forEach(r=>{ if(!secMine(r))return;
  if(r.t==="trip"&&r.status!=="cancelled"&&r.status!=="done"&&r.from&&((r.from>=T&&r.from<=lim)||(r.from<T&&(r.to||r.from)>=T)))it.push({d:r.from<T?T:r.from,t:"✈ ทริป "+(r.dest||""),s:fmtDate(r.from)+(r.to&&r.to!==r.from?" – "+fmtDate(r.to):""),tab:"trip",r});
  if(r.t==="doc"&&r.status==="wait"&&r.due&&r.due<=lim2)it.push({d:r.due<T?T:r.due,t:"✍ ลงนาม: "+(r.title||""),s:(r.due<T?"เกินกำหนด ":"ครบ ")+fmtDate(r.due),bad:r.due<T,tab:"doc",r});
  if(r.t==="dir"&&r.status!=="done"&&r.due&&r.due<=lim2)it.push({d:r.due<T?T:r.due,t:"📌 สั่งการ: "+(r.title||""),s:(r.due<T?"เกินกำหนด ":"ครบ ")+fmtDate(r.due),bad:r.due<T,tab:"trip",r});
  if(r.t==="req"&&r.status==="new"&&r.want&&r.want>=T&&r.want<=lim)it.push({d:r.want,t:"คำขอพบ: "+(r.who||""),s:"อยากพบ "+fmtDate(r.want),tab:"req",r}); });
 it.sort((a,b)=>a.d.localeCompare(b.d)); if(!it.length)return "";
 return `<div class="sec-up"><h3 class="ph-h">ทริป & กำหนดการที่กำลังจะมาถึง</h3><div class="sec-ups">${it.slice(0,14).map(i=>`<button type="button" class="sec-u${i.bad?" bad":""}" data-sect="${i.tab}"><span class="sec-ud"><b>${+i.d.slice(8)}</b>${MTH[+i.d.slice(5,7)-1]}</span><span class="sec-ui"><b>${esc(i.t)}</b><small>${esc(i.s)} ${SEC.ex==="all"?secExChip(i.r.ex):""}</small></span></button>`).join("")}</div></div>`; }
function secMini(){ const base=SEC.mini||SEC.day.slice(0,7), [y,m]=base.split("-").map(Number), ws=secWs(), first=new Date(y,m-1,1), lead=(first.getDay()-ws+7)%7, st=secAdd(isoOf(first),-lead);
 const T=secToday(), wk0=secWkStart(SEC.day), wk1=secAdd(wk0,6);
 const cells=Array.from({length:42},(_,i)=>secAdd(st,i)).map(iso=>{ const n=secApptsOn(iso).filter(r=>secMine(r)&&SEC_OK(r)).length, out=+iso.slice(5,7)!==m;
  return `<button type="button" data-secday="${iso}" class="${out?"out ":""}${iso===T?"today ":""}${iso===SEC.day?"sel ":""}${iso>=wk0&&iso<=wk1?"inwk ":""}">${+iso.slice(8)}${n?`<i></i>`:""}</button>`; }).join("");
 return `<div class="sec-mh"><button type="button" class="btn ghost sm" data-secmini="-1">‹</button><b>${MTHFULL[m-1]} ${y+543}</b><button type="button" class="btn ghost sm" data-secmini="1">›</button></div>
<div class="sec-mg sec-mw">${[0,1,2,3,4,5,6].map(i=>`<span>${DOW[(ws+i)%7]}</span>`).join("")}</div><div class="sec-mg">${cells}</div><div class="ph-hint" style="margin-top:6px">จุดใต้วันที่ = มีนัด · แถบสีอ่อน = สัปดาห์ที่กำลังดู</div>`; }

// ---------- หน้าตารางคิว (แทนของเดิม) ----------
function secQueueView(){
 const T=secToday(), day=SEC.day, w0=secWkStart(day), days=[0,1,2,3,4,5,6].map(i=>secAdd(w0,i)), w6=days[6];
 const exs=(SEC.ex==="all"?secEx:[secEx1(SEC.ex)]).filter(Boolean), q=(SEC.q||"").trim().toLowerCase();
 const dayList=iso=>secApptsOn(iso).filter(r=>secMine(r)&&(!q||secHay(r).includes(q))).sort((a,b)=>(a.st||"").localeCompare(b.st||""));
 const col=iso=>{ const L=dayList(iso), tr=exs.map(e=>({e,t:secTrip1(e.id,iso)})).filter(x=>x.t), n=L.filter(SEC_OK).length;
  return `<div class="sec-col${iso===T?" today":""}${iso===day?" sel":""}"><div class="sec-ch" data-secday="${iso}" role="button" tabindex="0"><span class="sec-dn">${+iso.slice(8)}</span><div><b>${DOWFULL[secDow(iso)]}</b><small>${n?n+" นัด":"ไม่มีนัด"}${+iso.slice(5,7)!==+day.slice(5,7)?" · "+MTH[+iso.slice(5,7)-1]:""}</small></div></div>
${tr.map(x=>`<div class="sec-tripc">✈ ${exs.length>1?esc(x.e.name)+": ":""}${esc(x.t.dest||"ทริป")}</div>`).join("")}
<div class="sec-cl">${L.map(r=>secCard(r,iso)).join("")||`<div class="sec-none">—</div>`}</div>
<button type="button" class="sec-add" data-secaddday="${iso}">+ เพิ่มนัด</button></div>`; };
 const tr=exs.map(e=>({e,t:secTrip1(e.id,day)})).filter(x=>x.t);
 const free=SEC.ex!=="all"&&!tr.length&&secDow(day)!==0&&secDow(day)!==6?secFree(SEC.ex,day,30):null;
 const nDay=secApptsOn(day).filter(r=>secMine(r)&&SEC_OK(r)).length;
 const hits=q?secs.filter(r=>r.t==="appt"&&secMine(r)&&secHay(r).includes(q)).sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,30):[];
 return `${secUpcoming()}
<div class="card sec-board"><div class="sec-bh"><div class="sec-wr"><button class="btn ghost sm" data-secwk="-7" aria-label="สัปดาห์ก่อน">‹</button><h2>${secDayLbl(w0)} – ${secDayLbl(w6)} ${+w6.slice(0,4)+543}</h2><button class="btn ghost sm" data-secwk="7" aria-label="สัปดาห์ถัดไป">›</button><button class="btn ghost sm" data-secwk="0">วันนี้</button></div>
<div class="sec-bo"><label class="sec-gt">ไปวันที่ <input type="date" id="secGo" value="${day}"></label><label class="sec-gt">เริ่มสัปดาห์ <select id="secWs"><option value="0"${secWs()===0?" selected":""}>อาทิตย์</option><option value="1"${secWs()===1?" selected":""}>จันทร์</option></select></label></div></div>
<div class="sec-bt"><button class="btn sm" id="secAddAp">+ เพิ่มนัด</button><button class="btn ghost sm" id="secCopyTo" title="คัดลอกนัดของวันที่เลือก (หรือทั้งสัปดาห์) ไปวางวันอื่น">คัดลอกไปวันอื่น</button><button class="btn ghost sm" id="secCopy" title="คัดลอกกำหนดการวันที่เลือกเป็นข้อความ เพื่อวางใน LINE/อีเมล">คัดลอกเป็นข้อความ</button><span class="ph-hint">แตะวันที่หัวคอลัมน์เพื่อเลือกวัน · แตะนัดเพื่อแก้ไข · ⧉ = คัดลอกนัดนั้น</span></div>
<div class="sec-wkw"><div class="sec-wk7">${days.map(col).join("")}</div></div></div>
${q?`<div class="card"><h2>ผลค้นหา “${esc(SEC.q)}” <small>${hits.length} รายการ${hits.length===30?"+":""}</small></h2><div class="list">${hits.map(r=>`<div class="li sec-ap" data-secedit="${r._id}" data-secocc="${r.date}"><div class="ic" style="background:var(--accent-soft);color:var(--accent);font-size:12px;line-height:1.25">${r.date?secDayLbl(r.date).replace(" ","<br>"):"—"}</div><div class="tx"><div class="t1">${esc(r.title)} ${SEC.ex==="all"?secExChip(r.ex):""}${r.rep?` <span class="sec-rp">↻</span>`:""}</div><div class="t2">${esc(r.st||"")}${r.en?"–"+esc(r.en):""}${r.with?" · พบ "+esc(r.with):""}${r.place?" · "+esc(r.place):""}${r.rep?" · "+esc(secRepTxt(r)):""}</div></div><button class="btn ghost sm" data-secday="${r.date}">ดูวันนั้น</button></div>`).join("")||`<div class="empty">ไม่พบนัดที่ตรงกับคำค้น</div>`}</div></div>`:""}
<div class="sec-lower"><div class="card sec-mini">${secMini()}</div>
<div class="card sec-seld"><div class="sec-dh"><h2>${DOWFULL[secDow(day)]}ที่ ${+day.slice(8)} ${MTHFULL[+day.slice(5,7)-1]} <small>${nDay} นัด</small></h2><button class="btn sm" id="secAddAp2">+ เพิ่มนัดวันนี้</button></div>
${tr.map(x=>`<div class="sec-trip">✈ ${esc(x.e.name)} ติดทริป ${esc(x.t.dest||"")} (${fmtDate(x.t.from)}${x.t.to&&x.t.to!==x.t.from?" – "+fmtDate(x.t.to):""})</div>`).join("")}
${free?`<div class="sec-free"><b>ช่องว่าง (ไม่ชนนัด/เผื่อเดินทางแล้ว):</b> ${free.length?free.map(g=>`<button class="sec-fb" data-secfree="${g[0]}|${g[1]}">${secHM(g[0])}–${secHM(g[1])}</button>`).join(" "):"เต็ม"}<div class="ph-hint" style="margin-top:6px">แตะช่วงเวลาเพื่อลงนัดตรงนั้น · เวลาทำการ ${secHM(WH[0])}–${secHM(WH[1])}</div></div>`:(SEC.ex==="all"?`<div class="ph-hint" style="margin-top:12px">เลือกผู้บริหารรายท่านด้านบนเพื่อดูช่องว่างในตาราง</div>`:"")}
<div class="ph-hint" style="margin-top:10px">นัดที่ต้องมาทุกวัน/สัปดาห์/เดือน/ปี → ตอนเพิ่มนัดเลือก “ทำซ้ำ” ครั้งเดียว ไม่ต้องบุ๊คใหม่ · นัดซ้ำมีเครื่องหมาย ↻ · แก้/ลบได้ทั้งชุดหรือเฉพาะวัน</div></div></div>`;
}

// ---------- คัดลอกนัด / คัดลอกกำหนดการไปวันอื่น ----------
function secCopyOpen(mode,rec){
 const day=SEC.day, d=xDlg("seccp","min(600px,96vw)"), S={scope:"day",dates:[]};
 const exf=r=>secMine(r)&&SEC_OK(r), w0=()=>secWkStart(day), wk=()=>mode==="day"&&S.scope==="week";
 const sources=()=>mode==="one"?[rec]:wk()?[0,1,2,3,4,5,6].flatMap(i=>secApptsOn(secAdd(w0(),i)).filter(exf)):secApptsOn(day).filter(exf);
 const baseD=()=>mode==="one"?rec.date:wk()?w0():day;
 const plan=()=>{ const out=[],skip=[],srcs=sources();
  S.dates.forEach(t=>{ const off=wk()?Math.round((new Date(secWkStart(t)+"T00:00:00")-new Date(w0()+"T00:00:00"))/864e5):0;
   srcs.forEach(r=>{ const nd=wk()?secAdd(r.date,off):t, same=x=>x.ex===r.ex&&x.title===r.title&&x.st===r.st;
    if(secApptsOn(nd).some(same)||out.some(x=>x.date===nd&&same(x))){ skip.push(r); return; }
    const n=Object.assign({},r,{_id:uuid(),date:nd,at:new Date().toISOString(),copiedFrom:r._id}); ["_od","_ser","rep","repn","repend","repx"].forEach(k=>delete n[k]); out.push(n); }); });
  return {out,skip,bad:out.filter(n=>secConf(n).length||secTrip1(n.ex,n.date))}; };
 const addD=iso=>{ if(iso&&S.dates.indexOf(iso)<0){ S.dates.push(iso); S.dates.sort(); } };
 const paint=()=>{ const {out,skip,bad}=plan(), srcN=sources().length, b=baseD();
  const quick=wk()?[["สัปดาห์หน้า","7"],["อีก 2 สัปดาห์","14"],["4 สัปดาห์ถัดไป","7,14,21,28"]]:[["พรุ่งนี้ (+1 วัน)","1"],["+1 สัปดาห์","7"],["+2 สัปดาห์","14"],["+1 เดือน","30"],["ทุกสัปดาห์ ×4","7,14,21,28"]];
  d.innerHTML=`<div class="dlg-h">${mode==="one"?"คัดลอกนัดนี้ไปวันอื่น":"คัดลอกกำหนดการไปวันอื่น"}</div><div class="dlg-b" style="grid-template-columns:1fr">
${mode==="one"?`<div class="sec-cpi"><b>${esc(rec.title)}</b><small>${fmtDate(rec.date)} · ${esc(rec.st||"")}${rec.en?"–"+esc(rec.en):""}${rec.with?" · พบ "+esc(rec.with):""}</small></div>`
:`<div class="f"><label for="cp-scope">คัดลอกอะไร</label><select class="ph-in" id="cp-scope"><option value="day"${S.scope==="day"?" selected":""}>ทั้งวันที่ ${secDayLbl(day)}</option><option value="week"${S.scope==="week"?" selected":""}>ทั้งสัปดาห์ ${secDayLbl(w0())} – ${secDayLbl(secAdd(w0(),6))}</option></select><div class="hint" style="margin:6px 0 0">ต้นทาง ${srcN} นัด${SEC.ex!=="all"?" ของ "+esc(secExName(SEC.ex)):" (ทุกท่าน)"} · นัดซ้ำ (↻) จะถูกคัดลอกเป็นนัดเดี่ยว</div></div>`}
<div class="f"><label for="cp-date">${wk()?"วางในสัปดาห์ที่มีวันที่":"วางในวันที่"}</label><div class="sec-cpd"><input type="date" class="ph-in" id="cp-date"><button type="button" class="btn ghost sm" id="cp-add">เพิ่มวัน</button></div>
<div class="sec-cpq">${quick.map(([l,v])=>`<button type="button" class="sec-fb" data-cpq="${v}">${l}</button>`).join("")}</div></div>
<div class="sec-chips">${S.dates.map((t,i)=>`<span class="sec-dc">${fmtDate(t)} (${DOW[secDow(t)]})<button type="button" data-cpx="${i}" aria-label="เอาออก">×</button></span>`).join("")||`<span class="ph-hint">ยังไม่ได้เลือกวัน — เลือกจากช่องวันที่หรือปุ่มลัดด้านบน (เลือกได้หลายวัน)</span>`}</div>
${S.dates.length?`<div class="sec-cpp">จะสร้าง <b>${out.length}</b> นัด${skip.length?` · ข้าม ${skip.length} (มีนัดเดียวกัน วัน-เวลาเดียวกันอยู่แล้ว)`:""}${bad.length?` · <b class="sec-bad">⚠ ชน/ตรงทริป ${bad.length}</b>`:""}</div>`:""}</div>
<div class="dlg-f"><button type="button" class="btn ghost" id="cp-no">ยกเลิก</button><button type="button" class="btn" id="cp-ok"${out.length?"":" disabled"}>คัดลอก ${out.length} นัด</button></div>`;
  const sc=el("cp-scope"); if(sc)sc.onchange=()=>{ S.scope=sc.value; paint(); };
  el("cp-add").onclick=()=>{ const v=el("cp-date").value; if(!v){ el("cp-date").focus(); return; } addD(v); paint(); };
  d.querySelectorAll("[data-cpq]").forEach(x=>x.onclick=()=>{ x.dataset.cpq.split(",").forEach(o=>addD(secAdd(b,+o))); paint(); });
  d.querySelectorAll("[data-cpx]").forEach(x=>x.onclick=()=>{ S.dates.splice(+x.dataset.cpx,1); paint(); });
  el("cp-no").onclick=()=>d.close();
  el("cp-ok").onclick=async()=>{ const P=plan(); if(!P.out.length)return;
   if(P.bad.length&&!(await ask("พบ <b>"+P.bad.length+"</b> นัดที่ชนกับนัดอื่นหรือตรงช่วงทริป<br>คัดลอกต่อไหมคะ?","คัดลอกต่อ")))return;
   d.close(); let ok=0; for(const n of P.out){ if(await secPut(n))ok++; setFoot("กำลังคัดลอก "+ok+"/"+P.out.length+" …"); }
   SEC.day=S.dates[0]; render(); tell("<b>คัดลอกแล้ว "+ok+" นัด</b> ไป "+S.dates.length+" วัน"+(P.skip.length?"<div style=\"font-size:13px;margin-top:8px\">ข้าม "+P.skip.length+" นัดที่มีอยู่แล้ว</div>":"")+"<div style=\"font-size:13px;margin-top:8px\">เปิดแต่ละนัดเพื่อแก้เวลา/รายละเอียดได้เลยค่ะ</div>"); }; };
 paint(); d.showModal(); }

// ---------- ผูกเหตุการณ์ของหน้าใหม่ ----------
function secWire2(){
 if(view!=="sec"||!SEC.unl)return; const on=(id,f)=>{ const n=el(id); if(n)n.onclick=f; };
 on("secCopyTo",()=>secCopyOpen("day")); on("secAddAp2",()=>secAdd1("appt"));
 document.querySelectorAll("[data-secaddday]").forEach(n=>n.onclick=e=>{ e.stopPropagation(); SEC.day=n.dataset.secaddday; secAdd1("appt",{date:n.dataset.secaddday}); });
 document.querySelectorAll("[data-seccp]").forEach(n=>n.onclick=e=>{ e.stopPropagation(); const [id,iso]=n.dataset.seccp.split("|"), r=secs.find(x=>x._id===id); if(r)secCopyOpen("one",r.rep?Object.assign({},r,{date:iso,_od:iso,_ser:true}):r); });
 document.querySelectorAll("[data-secday]").forEach(n=>{ const o=n.onclick; n.onclick=ev=>{ SEC.mini=""; if(o)o.call(n,ev); }; n.onkeydown=ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); n.click(); } }; });
 document.querySelectorAll("[data-secmini]").forEach(n=>n.onclick=()=>{ const base=SEC.mini||SEC.day.slice(0,7), [y,m]=base.split("-").map(Number), nd=new Date(y,m-1+(+n.dataset.secmini),1); SEC.mini=nd.getFullYear()+"-"+String(nd.getMonth()+1).padStart(2,"0"); render(); });
 const go=el("secGo"); if(go)go.onchange=()=>{ if(go.value){ SEC.day=go.value; SEC.mini=""; render(); } };
 const ws=el("secWs"); if(ws)ws.onchange=()=>{ try{ localStorage.setItem("sw-sec-ws",ws.value); }catch(e){} render(); };
 const qi=el("secQ"); if(qi){ qi.oninput=()=>{ SEC.q=qi.value; clearTimeout(SEC.qt); SEC.qt=setTimeout(()=>{ render(); const i=el("secQ"); if(i){ i.focus(); try{ i.setSelectionRange(i.value.length,i.value.length); }catch(e){} } },280); }; }
}
{ const _sw=secWire; secWire=function(){ _sw.apply(this,arguments); try{ secWire2(); }catch(e){ console.error(e); } }; }
