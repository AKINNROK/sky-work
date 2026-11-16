// ===== เลขาผู้บริหารระดับสูง — ตารางคิว · คำขอเข้าพบ · เอกสารรอลงนาม · ทริป & งานสั่งการ (หลายท่าน + PIN) =====
// ข้อมูลอยู่ในตาราง rows kind="sec" (1 แถว = 1 รายการ, field t = appt|req|doc|trip|dir, ex = id ผู้บริหาร) · รายชื่อผู้บริหาร meta/secex · PIN meta/secpin
// PIN เป็นการล็อกหน้าจอของแอป (กันคนที่หยิบเครื่องไปเปิดดู) — ไม่ใช่การเข้ารหัสฐานข้อมูล
const SEC={tab:"queue",ex:"all",day:"",unl:false,last:Date.now(),fails:0,until:0,hid:0,rq:"open"};
const SEC_COL=["#2f80c8","#2e9e6b","#e08a1e","#c94c4c","#8a5cc7","#3aa5a5","#d1568f","#6b7a89"];
const SEC_TABS=[["queue","ตารางคิว"],["req","คำขอเข้าพบ"],["doc","รอลงนาม"],["trip","ทริป & สั่งการ"]];
const APST={confirmed:["ยืนยันแล้ว","s-done"],pending:["รอตอบรับ","s-wait"],moved:["เลื่อน","s-over"],cancelled:["ยกเลิก","s-over"]};
const RQST={new:["รอจัดคิว","s-wait"],hold:["พักไว้","s-wait"],booked:["จัดคิวแล้ว","s-done"],declined:["ปฏิเสธ/เลื่อน","s-over"]};
const URG={high:["ด่วน","s-over"],normal:["ปกติ","s-wait"],low:["ไม่เร่ง","s-done"]};
const secToday=()=>isoOf(new Date());
const secAdd=(iso,n)=>{ const d=new Date(iso+"T00:00:00"); d.setDate(d.getDate()+n); return isoOf(d); };
const secDow=iso=>new Date(iso+"T00:00:00").getDay();
const secMin=s=>{ const m=/^(\d{1,2}):(\d{2})/.exec(s||""); return m?(+m[1])*60+(+m[2]):null; };
const secHM=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
const secEx1=id=>secEx.find(x=>x.id===id);
const secExName=id=>{ const e=secEx1(id); return e?e.name:"(ไม่พบผู้บริหาร)"; };
const secExChip=id=>{ const e=secEx1(id); return e?`<b class="sec-chip" style="--c:${e.color||"#6b7a89"}">${esc(e.name)}</b>`:""; };
const secR=(t)=>secs.filter(r=>r.t===t&&(SEC.ex==="all"||r.ex===SEC.ex));
// ---------- PIN ----------
async function secHash(pin,salt){ const s=salt+":"+pin;
 try{ if(window.crypto&&crypto.subtle){ const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); } }catch(e){}
 let h=5381; for(const c of s)h=((h<<5)+h+c.charCodeAt(0))|0; return "x"+h; }
const secHasPin=()=>!!(secPin&&secPin.hash);
function secScrub(){ ["secdlg","secxdlg"].forEach(id=>{ const d=el(id); if(d){ try{ if(d.open)d.close(); }catch(e){} d.innerHTML=""; } }); const c=el("cdlg"); if(c&&!c.open&&el("cmsg"))el("cmsg").innerHTML=""; }
function secLock(){ SEC.unl=false; secScrub(); if(view==="sec")render(); }
function secTouch(){ if(SEC.unl)SEC.last=Date.now(); }
document.addEventListener("pointerdown",secTouch,true); document.addEventListener("keydown",secTouch,true);
setInterval(()=>{ if(SEC.unl&&Date.now()-SEC.last>5*60*1000){ SEC.unl=false; secScrub(); if(view==="sec")render(); } },15000);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden")SEC.hid=Date.now(); else if(SEC.unl&&SEC.hid&&Date.now()-SEC.hid>2*60*1000){ SEC.unl=false; secScrub(); if(view==="sec")render(); } });
async function secTryPin(pin){
 if(Date.now()<SEC.until)return "ลองผิดหลายครั้ง รออีก "+Math.ceil((SEC.until-Date.now())/1000)+" วินาทีค่ะ";
 const h=await secHash(pin,secPin.salt||"");
 if(h===secPin.hash){ SEC.unl=true; SEC.fails=0; SEC.last=Date.now(); render(); return ""; }
 SEC.fails++; if(SEC.fails>=5){ SEC.until=Date.now()+30000; SEC.fails=0; return "ผิดครบ 5 ครั้ง ล็อก 30 วินาทีค่ะ"; }
 return "PIN ไม่ถูกต้อง (เหลืออีก "+(5-SEC.fails)+" ครั้ง)";
}
async function secSetPin(pin){ const salt=Math.random().toString(36).slice(2,10)+Date.now().toString(36); const hash=await secHash(pin,salt); await DB.doc("meta/secpin").set({salt,hash,at:new Date().toISOString()}); }
function secLockView(){
 const has=secHasPin();
 return header("เลขาผู้บริหาร","ข้อมูลส่วนนี้ล็อกด้วย PIN",false)+`<div class="card sec-lock"><div class="sec-lk">${svg('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',34)}</div>
<h2 style="text-align:center">${has?"ใส่ PIN เพื่อเปิด":"ตั้ง PIN ครั้งแรก"}</h2>
${has?`<input class="ph-in sec-pin" id="secPin1" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="• • • •"><div id="secMsg" class="sec-msg"></div><button class="btn" id="secGo" style="width:100%">เปิด</button><div style="text-align:center;margin-top:14px"><a id="secForget" class="ph-hint" style="cursor:pointer;text-decoration:underline">ลืม PIN?</a></div>`
:`<div class="hint" style="text-align:center;margin:0 0 10px">ตั้ง PIN 4–8 หลัก ใช้ร่วมกันทุกเครื่องที่ล็อกอินบัญชีนี้</div><input class="ph-in sec-pin" id="secPin1" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="PIN ใหม่"><input class="ph-in sec-pin" id="secPin2" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="ยืนยัน PIN อีกครั้ง" style="margin-top:8px"><div id="secMsg" class="sec-msg"></div><button class="btn" id="secGo" style="width:100%">ตั้ง PIN และเปิด</button>`}
<div class="hint" style="text-align:center;margin-top:16px;line-height:1.7">PIN ช่วยกันคนที่หยิบเครื่องที่ล็อกอินค้างไว้มาเปิดดู · ล็อกเองอัตโนมัติเมื่อไม่ได้แตะ 5 นาที<br>ไม่ใช่การเข้ารหัสฐานข้อมูล</div></div>`;
}
// ---------- ฟอร์มกลาง ----------
function secForm(title,fields,vals,o){
 o=o||{}; return new Promise(res=>{
  const d=xDlg("secdlg","min(580px,96vw)"); let done=false;
  const f=x=>{ const v=vals[x.k]==null?"":vals[x.k]; const id="sf-"+x.k; let inp;
   if(x.type==="select")inp=`<select class="ph-in" id="${id}">${x.opts.map(([a,b])=>`<option value="${esc(a)}"${String(v)===String(a)?" selected":""}>${esc(b)}</option>`).join("")}</select>`;
   else if(x.type==="textarea")inp=`<textarea class="ph-in" id="${id}" rows="2" placeholder="${esc(x.ph||"")}">${esc(v)}</textarea>`;
   else inp=`<input class="ph-in" id="${id}" type="${x.type||"text"}" value="${esc(v)}" placeholder="${esc(x.ph||"")}"${x.type==="number"?' inputmode="numeric"':""}>`;
   return `<div class="f${x.wide?" wide":""}"><label for="${id}">${esc(x.l)}${x.req?" *":""}</label>${inp}</div>`; };
  d.innerHTML=`<div class="dlg-h">${esc(title)}</div><div class="dlg-b">${fields.map(f).join("")}${o.note?`<div class="f wide hint" style="margin:0">${o.note}</div>`:""}</div><div class="dlg-f">${o.del?`<button type="button" class="btn ghost" id="sf-del" style="margin-right:auto;color:var(--over)">ลบ</button>`:""}<button type="button" class="btn ghost" id="sf-no">ยกเลิก</button><button type="button" class="btn" id="sf-ok">บันทึก</button></div>`;
  const out=()=>{ const r={}; fields.forEach(x=>{ let v=el("sf-"+x.k).value; if(x.type!=="textarea")v=v.trim(); r[x.k]=v; }); return r; };
  const fin=v=>{ if(done)return; done=true; d.close(); res(v); };
  el("sf-no").onclick=()=>fin(null);
  el("sf-ok").onclick=()=>{ const r=out(); const bad=fields.find(x=>x.req&&!r[x.k]); if(bad){ el("sf-"+bad.k).focus(); return; } fin(r); };
  if(o.del)el("sf-del").onclick=()=>fin({__del:true});
  d.onclose=()=>{ if(!done){ done=true; res(null); } };
  d.showModal();
 });
}
const secExOpts=()=>secEx.map(e=>[e.id,e.name]);
async function secPut(rec){
 try{ const id=rec._id, d=Object.assign({},rec); delete d._id; await DB.collection("sec").doc(id).set(d); return true; }
 catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return false; }
}
async function secDel(rec){ if(!(await ask("ลบรายการนี้ถาวรเลยไหมคะ?<br><small>(ส่วนเลขาฯ ไม่มีถังขยะ)</small>","ลบ")))return false; try{ await DB.collection("sec").doc(rec._id).delete(); return true; }catch(e){ return false; } }
const secNew=(t,extra)=>Object.assign({_id:uuid(),t,ex:SEC.ex!=="all"?SEC.ex:(secEx[0]&&secEx[0].id)||"",at:new Date().toISOString()},extra||{});
// ---------- คิว / ช่องว่าง ----------
const WH=[510,1050];
function secBlocks(ex,iso,skip){ return secs.filter(r=>r.t==="appt"&&r.ex===ex&&r.date===iso&&r.status!=="cancelled"&&r.status!=="moved"&&r._id!==skip).map(r=>{ const a=secMin(r.st); if(a===null)return null; const b=secMin(r.en); return {a:a-(+r.buf||0),b:b!==null?b:a+60,r}; }).filter(Boolean).sort((x,y)=>x.a-y.a); }
const secTrip1=(ex,iso)=>secs.find(r=>r.t==="trip"&&r.ex===ex&&r.status!=="cancelled"&&r.from&&r.from<=iso&&iso<=(r.to||r.from));
function secConf(r){ const a=secMin(r.st); if(a===null||r.status==="cancelled"||r.status==="moved")return []; const b0=secMin(r.en), b=b0!==null?b0:a+60, a2=a-(+r.buf||0);
 return secBlocks(r.ex,r.date,r._id).filter(x=>a2<x.b&&b>x.a).map(x=>x.r); }
function secFree(ex,iso,min){ min=min||30; let cur=WH[0]; const out=[]; secBlocks(ex,iso).forEach(x=>{ if(x.a-cur>=min)out.push([cur,x.a]); cur=Math.max(cur,x.b); }); if(WH[1]-cur>=min)out.push([cur,WH[1]]); return out; }
function secSuggest(ex,fromIso,dur,buf){ dur=dur||60; buf=buf||0; for(let i=0;i<30;i++){ const d=secAdd(fromIso,i), w=secDow(d); if(w===0||w===6||secTrip1(ex,d))continue; const g=secFree(ex,d,dur+buf).find(x=>x[1]-x[0]>=dur+buf); if(g)return {date:d,st:secHM(g[0]+buf),en:secHM(g[0]+buf+dur)}; } return null; }
const secApptRow=r=>{ const cf=secConf(r), st=APST[r.status]||APST.confirmed;
 return `<div class="li sec-ap${r.status==="cancelled"?" off":""}" data-secedit="${r._id}"><div class="ic" style="background:var(--accent-soft);color:var(--accent);font-size:12.5px;line-height:1.25">${esc(r.st||"—")}${r.en?"<br>"+esc(r.en):""}</div>
<div class="tx"><div class="t1">${esc(r.title)} ${SEC.ex==="all"?secExChip(r.ex):""}</div><div class="t2">${r.with?"พบ "+esc(r.with)+" · ":""}${r.place?esc(r.place)+" · ":""}${+r.buf?"เผื่อเดินทาง "+r.buf+" น. · ":""}${esc(r.note||"")}${cf.length?` <b style="color:var(--over)">⚠ ชนกับ ${esc(cf.map(x=>x.title).join(", "))}</b>`:""}</div></div><span class="pill ${st[1]}">${st[0]}</span></div>`; };
// ---------- หน้าหลัก ----------
function secView(){
 if(!SEC.unl)return secLockView();
 if(!SEC.day)SEC.day=secToday();
 const T=secToday(), mine=r=>SEC.ex==="all"||r.ex===SEC.ex;
 const tdA=secs.filter(r=>r.t==="appt"&&mine(r)&&r.date===T&&r.status!=="cancelled"&&r.status!=="moved").sort((a,b)=>(a.st||"").localeCompare(b.st||""));
 const nowM=new Date().getHours()*60+new Date().getMinutes(), nxt=tdA.find(r=>(secMin(r.st)||0)>=nowM);
 const docs=secs.filter(r=>r.t==="doc"&&mine(r)&&r.status==="wait"), docLate=docs.filter(r=>r.due&&r.due<T);
 const reqs=secs.filter(r=>r.t==="req"&&mine(r)&&r.status==="new");
 const dirs=secs.filter(r=>r.t==="dir"&&mine(r)&&r.status!=="done"), dirLate=dirs.filter(r=>r.due&&r.due<T);
 const tabs=SEC_TABS.map(([k,l])=>{ const n=k==="req"?reqs.length:k==="doc"?docs.length:k==="trip"?dirs.length:0; return `<button data-sect="${k}" aria-pressed="${SEC.tab===k}">${l}${n?` <span class="sec-n">${n}</span>`:""}</button>`; }).join("");
 const exb=secEx.length?`<div class="seg sec-exs"><button data-secx="all" aria-pressed="${SEC.ex==="all"}">ทุกท่าน</button>${secEx.map(e=>`<button data-secx="${e.id}" aria-pressed="${SEC.ex===e.id}"><i style="background:${e.color||"#6b7a89"}"></i>${esc(e.name)}</button>`).join("")}</div>`:"";
 let body;
 if(!secEx.length)body=`<div class="card"><div class="empty">เริ่มจากเพิ่มผู้บริหารที่ดูแลก่อนนะคะ<br><button class="btn" id="secExAdd0" style="margin-top:14px">เพิ่มผู้บริหารท่านแรก</button></div></div>`;
 else body=SEC.tab==="req"?secReqView():SEC.tab==="doc"?secDocView():SEC.tab==="trip"?secTripView():secQueueView();
 return header("เลขาผู้บริหาร","ตารางคิว · คำขอเข้าพบ · เอกสารรอลงนาม · ทริปและงานสั่งการ",false).replace(/<\/div>\s*$/,`<div class="ph-hb"><button class="btn ghost" id="secEx">ผู้บริหาร</button><button class="btn ghost" id="secChg">เปลี่ยน PIN</button><button class="btn" id="secLk">${svg('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',16)}<span>ล็อก</span></button></div></div>`)+
 (secEx.length?`<div class="ph-stat">
<div class="ph-s" data-sect="queue"><b>${tdA.length}</b><span>นัดวันนี้</span></div>
<div class="ph-s" data-sect="queue"><b style="font-size:20px">${nxt?esc(nxt.st):"—"}</b><span>${nxt?esc(nxt.title).slice(0,24):"นัดถัดไป"}</span></div>
<div class="ph-s" data-sect="req"><b${reqs.length?` style="color:#d99a14"`:""}>${reqs.length}</b><span>คำขอรอจัดคิว</span></div>
<div class="ph-s" data-sect="doc"><b${docLate.length?` style="color:var(--over)"`:""}>${docs.length}</b><span>รอลงนาม${docLate.length?` (เกิน ${docLate.length})`:""}</span></div>
<div class="ph-s" data-sect="trip"><b${dirLate.length?` style="color:var(--over)"`:""}>${dirs.length}</b><span>งานสั่งการค้าง${dirLate.length?` (เกิน ${dirLate.length})`:""}</span></div></div>
<div class="toolbar" style="flex-wrap:wrap;gap:10px">${exb}<div class="seg">${tabs}</div></div>`:"")+body;
}
function secQueueView(){
 const T=secToday(), day=SEC.day, w0=secAdd(day,-((secDow(day)+6)%7)), days=[0,1,2,3,4,5,6].map(i=>secAdd(w0,i));
 const cnt=iso=>secs.filter(r=>r.t==="appt"&&(SEC.ex==="all"||r.ex===SEC.ex)&&r.date===iso&&r.status!=="cancelled"&&r.status!=="moved").length;
 const trip=iso=>(SEC.ex==="all"?secEx:[secEx1(SEC.ex)]).filter(Boolean).some(e=>secTrip1(e.id,iso));
 const list=secs.filter(r=>r.t==="appt"&&(SEC.ex==="all"||r.ex===SEC.ex)&&r.date===day).sort((a,b)=>(a.st||"").localeCompare(b.st||""));
 const tr=(SEC.ex==="all"?secEx:[secEx1(SEC.ex)]).filter(Boolean).map(e=>({e,t:secTrip1(e.id,day)})).filter(x=>x.t);
 const free=SEC.ex!=="all"&&!tr.length&&secDow(day)!==0&&secDow(day)!==6?secFree(SEC.ex,day,30):null;
 return `<div class="card"><div class="sec-wk"><button class="btn ghost sm" data-secwk="-7">‹</button>
<div class="sec-days">${days.map(d=>`<button data-secday="${d}" aria-pressed="${d===day}" class="${d===T?"today":""}"><small>${DOW[secDow(d)]}</small><b>${+d.slice(8)}</b><span>${cnt(d)||""}${trip(d)?"✈":""}</span></button>`).join("")}</div>
<button class="btn ghost sm" data-secwk="7">›</button><button class="btn ghost sm" data-secwk="0">วันนี้</button></div>
<div class="sec-dh"><h2>${DOWFULL[secDow(day)]}ที่ ${+day.slice(8)} ${MTHFULL[+day.slice(5,7)-1]} <small>${list.filter(r=>r.status!=="cancelled").length} นัด</small></h2><div><button class="btn ghost sm" id="secCopy">คัดลอกกำหนดการ</button> <button class="btn sm" id="secAddAp">+ เพิ่มนัด</button></div></div>
${tr.map(x=>`<div class="sec-trip">✈ ${esc(x.e.name)} ติดทริป ${esc(x.t.dest||"")} (${fmtDate(x.t.from)}${x.t.to&&x.t.to!==x.t.from?" – "+fmtDate(x.t.to):""})</div>`).join("")}
<div class="list">${list.map(secApptRow).join("")||`<div class="empty">ยังไม่มีนัดในวันนี้</div>`}</div>
${free?`<div class="sec-free"><b>ช่องว่าง (ไม่ชนนัด/เผื่อเดินทางแล้ว):</b> ${free.length?free.map(g=>`<button class="sec-fb" data-secfree="${g[0]}|${g[1]}">${secHM(g[0])}–${secHM(g[1])}</button>`).join(" "):"เต็ม"}<div class="ph-hint" style="margin-top:6px">แตะช่วงเวลาเพื่อลงนัดตรงนั้น · เวลาทำการ ${secHM(WH[0])}–${secHM(WH[1])}</div></div>`:(SEC.ex==="all"?`<div class="ph-hint" style="margin-top:12px">เลือกผู้บริหารรายท่านด้านบนเพื่อดูช่องว่างในตาราง</div>`:"")}</div>`;
}
function secReqView(){
 const rows=secR("req"), open=rows.filter(r=>r.status==="new"||r.status==="hold").sort((a,b)=>({high:0,normal:1,low:2}[a.urg||"normal"]-{high:0,normal:1,low:2}[b.urg||"normal"])||(a.want||"9").localeCompare(b.want||"9"));
 const closed=rows.filter(r=>r.status==="booked"||r.status==="declined").sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,12);
 const row=r=>{ const s=RQST[r.status]||RQST.new, u=URG[r.urg||"normal"];
  return `<div class="li sec-rq" data-secedit="${r._id}"><div class="tx"><div class="t1">${esc(r.who||"(ไม่ระบุผู้ขอ)")} — ${esc(r.topic||"")} ${SEC.ex==="all"?secExChip(r.ex):""}</div><div class="t2">${r.dur||60} นาที${r.want?" · อยากพบ "+(/^\d{4}-\d\d-\d\d$/.test(r.want)?fmtDate(r.want):esc(r.want)):""}${r.note?" · "+esc(r.note):""}</div></div>
<span class="pill ${u[1]}">${u[0]}</span><span class="pill ${s[1]}">${s[0]}</span>${r.status==="new"||r.status==="hold"?`<button class="btn sm" data-secbook="${r._id}">จัดลงคิว</button><button class="btn sm ghost" data-secrq="${r._id}|hold" title="พักไว้">พัก</button><button class="btn sm ghost" data-secrq="${r._id}|declined" title="ปฏิเสธ/เลื่อน">ปฏิเสธ</button>`:""}</div>`; };
 return `<div class="card"><div class="sec-dh"><h2>กล่องรอจัดคิว <small>${open.length} รายการ</small></h2><button class="btn sm" id="secAddRq">+ รับคำขอ</button></div>
<div class="list">${open.map(row).join("")||`<div class="empty">ไม่มีคำขอค้าง</div>`}</div>
${closed.length?`<h3 class="ph-h" style="margin-top:18px">ดำเนินการแล้ว (ล่าสุด)</h3><div class="list">${closed.map(row).join("")}</div>`:""}</div>`;
}
function secDocView(){
 const T=secToday(), rows=secR("doc"), wait=rows.filter(r=>r.status==="wait").sort((a,b)=>(a.due||"9").localeCompare(b.due||"9")), done=rows.filter(r=>r.status!=="wait").sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,10);
 const row=r=>{ const late=r.status==="wait"&&r.due&&r.due<T, age=r.rcv?Math.max(0,Math.round((new Date(T)-new Date(r.rcv))/864e5)):null; const lab={wait:["รอลงนาม","s-wait"],signed:["ลงนามแล้ว","s-done"],returned:["ส่งกลับแก้ไข","s-over"]}[r.status]||["รอลงนาม","s-wait"];
  return `<div class="li" data-secedit="${r._id}"><div class="tx"><div class="t1">${r.urgent==="1"?"🔴 ":""}${esc(r.title)} ${SEC.ex==="all"?secExChip(r.ex):""}</div><div class="t2">${r.from?"จาก "+esc(r.from)+" · ":""}${age!==null&&r.status==="wait"?"รอมา "+age+" วัน · ":""}${r.due?(late?`<b style="color:var(--over)">เกินกำหนด ${fmtDate(r.due)}</b>`:"ต้องการภายใน "+fmtDate(r.due)):""}${r.note?" · "+esc(r.note):""}</div></div><span class="pill ${lab[1]}">${lab[0]}</span>${r.status==="wait"?`<button class="okbtn" data-secdoc="${r._id}|signed" title="ลงนามแล้ว">${svg(ICON.check,15)}</button><button class="btn sm ghost" data-secdoc="${r._id}|returned">ส่งกลับ</button>`:""}</div>`; };
 return `<div class="card"><div class="sec-dh"><h2>เอกสารรอผู้บริหาร <small>${wait.length} รายการ</small></h2><button class="btn sm" id="secAddDoc">+ เพิ่มเอกสาร</button></div>
<div class="list">${wait.map(row).join("")||`<div class="empty">ไม่มีเอกสารค้าง</div>`}</div>${done.length?`<h3 class="ph-h" style="margin-top:18px">ดำเนินการแล้ว (ล่าสุด)</h3><div class="list">${done.map(row).join("")}</div>`:""}</div>`;
}
function secTripView(){
 const T=secToday(), trips=secR("trip").sort((a,b)=>(a.from||"").localeCompare(b.from||"")), up=trips.filter(r=>(r.to||r.from||"9")>=T&&r.status!=="cancelled"), past=trips.filter(r=>!up.includes(r)).reverse().slice(0,6);
 const dirs=secR("dir").sort((a,b)=>(a.status==="done")-(b.status==="done")||(a.due||"9").localeCompare(b.due||"9"));
 const trow=r=>{ const s={plan:["วางแผน","s-wait"],booked:["จองแล้ว","s-done"],done:["เสร็จสิ้น","s-done"],cancelled:["ยกเลิก","s-over"]}[r.status]||["วางแผน","s-wait"]; const n=r.from?daysTo(phD0(r.from)):null;
  return `<div class="li" data-secedit="${r._id}"><div class="ic" style="background:var(--accent-soft);color:var(--accent)">${r.from?(+r.from.slice(8))+"<br>"+MTH[+r.from.slice(5,7)-1]:"—"}</div><div class="tx"><div class="t1">✈ ${esc(r.dest||"")} ${SEC.ex==="all"?secExChip(r.ex):""}</div><div class="t2">${r.to&&r.to!==r.from?"ถึง "+fmtDate(r.to)+" · ":""}${r.purpose?esc(r.purpose)+" · ":""}${n!==null&&n>=0&&r.status!=="cancelled"?"อีก "+n+" วัน · ":""}${esc(r.detail||"")}</div></div><span class="pill ${s[1]}">${s[0]}</span></div>`; };
 const drow=r=>{ const late=r.status!=="done"&&r.due&&r.due<T; return `<div class="li" data-secedit="${r._id}"><div class="tx"><div class="t1">${esc(r.title)} ${SEC.ex==="all"?secExChip(r.ex):""}</div><div class="t2">${r.owner?"ผู้รับผิดชอบ <b>"+esc(r.owner)+"</b> · ":'<b style="color:#d99a14">ยังไม่ระบุผู้รับผิดชอบ</b> · '}${r.given?"สั่งเมื่อ "+fmtDate(r.given)+" · ":""}${r.due?(late?`<b style="color:var(--over)">เกินกำหนด ${fmtDate(r.due)}</b>`:"กำหนด "+fmtDate(r.due)):"ไม่มีกำหนด"}${r.note?" · "+esc(r.note):""}</div></div>
<span class="pill ${r.status==="done"?"s-done":late?"s-over":"s-wait"}">${r.status==="done"?"เสร็จแล้ว":late?"เกินกำหนด":"ค้างอยู่"}</span>${r.status!=="done"?`<button class="okbtn" data-secdir="${r._id}" title="เสร็จแล้ว">${svg(ICON.check,15)}</button>`:""}</div>`; };
 return `<div class="ph-2"><div class="card"><div class="sec-dh"><h2>ทริป / การเดินทาง</h2><button class="btn sm" id="secAddTrip">+ เพิ่มทริป</button></div><div class="list">${up.map(trow).join("")||`<div class="empty">ไม่มีทริปที่จะถึง</div>`}</div>${past.length?`<h3 class="ph-h" style="margin-top:14px">ผ่านมาแล้ว</h3><div class="list">${past.map(trow).join("")}</div>`:""}</div>
<div class="card"><div class="sec-dh"><h2>งานสั่งการ / ติดตาม <small>${dirs.filter(r=>r.status!=="done").length} ค้าง</small></h2><button class="btn sm" id="secAddDir">+ เพิ่มงานสั่งการ</button></div><div class="list">${dirs.map(drow).join("")||`<div class="empty">ยังไม่มีงานสั่งการ</div>`}</div></div></div>`;
}
// ---------- แก้ไขรายการ ----------
const AP_F=[{k:"ex",l:"ผู้บริหาร",type:"select",opts:[]},{k:"title",l:"เรื่อง/ชื่อนัด",req:1,wide:1},{k:"date",l:"วันที่",type:"date",req:1},{k:"st",l:"เริ่ม",type:"time",req:1},{k:"en",l:"สิ้นสุด",type:"time"},{k:"buf",l:"เผื่อเวลาเดินทางก่อนนัด",type:"select",opts:[["0","ไม่เผื่อ"],["15","15 นาที"],["30","30 นาที"],["45","45 นาที"],["60","1 ชั่วโมง"],["90","1.5 ชั่วโมง"]]},{k:"with",l:"ผู้มาพบ/ผู้ร่วมประชุม"},{k:"place",l:"สถานที่"},{k:"status",l:"สถานะ",type:"select",opts:Object.entries(APST).map(([a,b])=>[a,b[0]])},{k:"note",l:"หมายเหตุ",type:"textarea",wide:1}];
async function secEditAp(rec,isNew,after){
 const F=AP_F.map(f=>f.k==="ex"?Object.assign({},f,{opts:secExOpts()}):f);
 const v=await secForm(isNew?"เพิ่มนัดหมาย":"แก้ไขนัดหมาย",F,Object.assign({buf:"0",status:"confirmed"},rec),{del:!isNew});
 if(!v)return; if(v.__del){ if(await secDel(rec))setFoot("ลบนัดแล้ว"); return; }
 const next=Object.assign({},rec,v,{buf:+v.buf||0});
 if(next.en&&secMin(next.en)<=secMin(next.st)){ tell("เวลาสิ้นสุดต้องหลังเวลาเริ่มค่ะ"); return secEditAp(Object.assign({},rec,v),isNew,after); }
 const tp=secTrip1(next.ex,next.date); const cf=secConf(next);
 if(tp||cf.length){ const m=[]; if(tp)m.push("ผู้บริหารติดทริป "+esc(tp.dest||"")+" วันนั้น"); if(cf.length)m.push("ชนกับ "+cf.map(x=>"<b>"+esc(x.title)+"</b> ("+esc(x.st)+")").join(", ")); if(!(await ask("<b>ตรวจพบปัญหา</b><br>"+m.join("<br>")+"<br>บันทึกต่อไหมคะ?","บันทึกต่อ")))return; }
 if(await secPut(next)){ SEC.day=next.date; if(SEC.ex!=="all"&&next.ex!==SEC.ex)SEC.ex=next.ex; setFoot("บันทึกนัดแล้ว"); if(after)after(next); }
}
async function secEdit(id){
 const r=secs.find(x=>x._id===id); if(!r)return; const ex={ex:secExOpts()};
 if(r.t==="appt")return secEditAp(r,false);
 if(r.t==="req"){ const v=await secForm("คำขอเข้าพบ",[{k:"ex",l:"ผู้บริหาร",type:"select",opts:ex.ex},{k:"who",l:"ผู้ขอพบ",req:1},{k:"topic",l:"เรื่อง",req:1,wide:1},{k:"urg",l:"ความเร่งด่วน",type:"select",opts:[["high","ด่วน"],["normal","ปกติ"],["low","ไม่เร่ง"]]},{k:"dur",l:"ใช้เวลา (นาที)",type:"number"},{k:"want",l:"อยากพบช่วงไหน",type:"date"},{k:"status",l:"สถานะ",type:"select",opts:Object.entries(RQST).map(([a,b])=>[a,b[0]])},{k:"note",l:"หมายเหตุ",type:"textarea",wide:1}],r,{del:1});
  if(!v)return; if(v.__del){ await secDel(r); return; } await secPut(Object.assign({},r,v,{dur:+v.dur||60})); return; }
 if(r.t==="doc"){ const v=await secForm("เอกสารรอผู้บริหาร",[{k:"ex",l:"ผู้บริหาร",type:"select",opts:ex.ex},{k:"title",l:"ชื่อเอกสาร",req:1,wide:1},{k:"from",l:"ส่งมาจาก (ฝ่าย/คน)"},{k:"rcv",l:"วันที่รับ",type:"date"},{k:"due",l:"ต้องการภายใน",type:"date"},{k:"urgent",l:"ด่วนมาก",type:"select",opts:[["","ปกติ"],["1","ด่วนมาก"]]},{k:"status",l:"สถานะ",type:"select",opts:[["wait","รอลงนาม"],["signed","ลงนามแล้ว"],["returned","ส่งกลับแก้ไข"]]},{k:"note",l:"หมายเหตุ",type:"textarea",wide:1}],r,{del:1});
  if(!v)return; if(v.__del){ await secDel(r); return; } await secPut(Object.assign({},r,v)); return; }
 if(r.t==="trip"){ const v=await secForm("ทริป / การเดินทาง",[{k:"ex",l:"ผู้บริหาร",type:"select",opts:ex.ex},{k:"dest",l:"จุดหมาย",req:1},{k:"purpose",l:"วัตถุประสงค์"},{k:"from",l:"ไป",type:"date",req:1},{k:"to",l:"กลับ",type:"date"},{k:"status",l:"สถานะ",type:"select",opts:[["plan","วางแผน"],["booked","จองแล้ว"],["done","เสร็จสิ้น"],["cancelled","ยกเลิก"]]},{k:"detail",l:"เที่ยวบิน/ที่พัก/ผู้ติดตาม",type:"textarea",wide:1}],r,{del:1,note:"ช่วงทริปจะกันไม่ให้ระบบแนะนำนัดในวันนั้น และเตือนเมื่อลงนัดชนทริป"});
  if(!v)return; if(v.__del){ await secDel(r); return; } if(v.to&&v.to<v.from){ tell("วันกลับต้องไม่ก่อนวันไปค่ะ"); return; } await secPut(Object.assign({},r,v)); return; }
 if(r.t==="dir"){ const v=await secForm("งานสั่งการ",[{k:"ex",l:"ผู้บริหารที่สั่ง",type:"select",opts:ex.ex},{k:"title",l:"สิ่งที่สั่ง",req:1,wide:1},{k:"owner",l:"ผู้รับผิดชอบ"},{k:"given",l:"วันที่สั่ง",type:"date"},{k:"due",l:"กำหนดเสร็จ",type:"date"},{k:"status",l:"สถานะ",type:"select",opts:[["open","ค้างอยู่"],["done","เสร็จแล้ว"]]},{k:"note",l:"หมายเหตุ/ผลการติดตาม",type:"textarea",wide:1}],r,{del:1});
  if(!v)return; if(v.__del){ await secDel(r); return; } await secPut(Object.assign({},r,v,v.status==="done"&&r.status!=="done"?{doneAt:secToday()}:{})); return; }
}
async function secAdd1(t,pre){
 if(t==="appt"){ return secEditAp(secNew("appt",Object.assign({date:SEC.day||secToday(),st:"09:00",en:"10:00",status:"confirmed",buf:"0"},pre)),true); }
 const base=secNew(t,pre);
 if(t==="req")base.status="new",base.urg="normal",base.dur=60;
 if(t==="doc")base.status="wait",base.rcv=secToday();
 if(t==="trip")base.status="plan";
 if(t==="dir")base.status="open",base.given=secToday();
 return secEditTmp(base);
}
async function secEditTmp(rec){
 // ใช้ secEdit แต่ถ้ากดยกเลิกจะไม่เขียนอะไร (รายการยังไม่ถูกบันทึกลง DB)
 const t=rec.t, ex=secExOpts();
 const spec={req:["คำขอเข้าพบ",[{k:"ex",l:"ผู้บริหาร",type:"select",opts:ex},{k:"who",l:"ผู้ขอพบ",req:1},{k:"topic",l:"เรื่อง",req:1,wide:1},{k:"urg",l:"ความเร่งด่วน",type:"select",opts:[["high","ด่วน"],["normal","ปกติ"],["low","ไม่เร่ง"]]},{k:"dur",l:"ใช้เวลา (นาที)",type:"number"},{k:"want",l:"อยากพบช่วงไหน",type:"date"},{k:"note",l:"หมายเหตุ",type:"textarea",wide:1}]],
 doc:["เพิ่มเอกสารรอผู้บริหาร",[{k:"ex",l:"ผู้บริหาร",type:"select",opts:ex},{k:"title",l:"ชื่อเอกสาร",req:1,wide:1},{k:"from",l:"ส่งมาจาก (ฝ่าย/คน)"},{k:"rcv",l:"วันที่รับ",type:"date"},{k:"due",l:"ต้องการภายใน",type:"date"},{k:"urgent",l:"ด่วนมาก",type:"select",opts:[["","ปกติ"],["1","ด่วนมาก"]]},{k:"note",l:"หมายเหตุ",type:"textarea",wide:1}]],
 trip:["เพิ่มทริป",[{k:"ex",l:"ผู้บริหาร",type:"select",opts:ex},{k:"dest",l:"จุดหมาย",req:1},{k:"purpose",l:"วัตถุประสงค์"},{k:"from",l:"ไป",type:"date",req:1},{k:"to",l:"กลับ",type:"date"},{k:"status",l:"สถานะ",type:"select",opts:[["plan","วางแผน"],["booked","จองแล้ว"]]},{k:"detail",l:"เที่ยวบิน/ที่พัก/ผู้ติดตาม",type:"textarea",wide:1}]],
 dir:["เพิ่มงานสั่งการ",[{k:"ex",l:"ผู้บริหารที่สั่ง",type:"select",opts:ex},{k:"title",l:"สิ่งที่สั่ง",req:1,wide:1},{k:"owner",l:"ผู้รับผิดชอบ"},{k:"given",l:"วันที่สั่ง",type:"date"},{k:"due",l:"กำหนดเสร็จ",type:"date"},{k:"note",l:"หมายเหตุ",type:"textarea",wide:1}]]}[t];
 const v=await secForm(spec[0],spec[1],rec); if(!v)return false;
 if(t==="trip"&&v.to&&v.to<v.from){ tell("วันกลับต้องไม่ก่อนวันไปค่ะ"); return false; }
 const out=Object.assign({},rec,v,t==="req"?{dur:+v.dur||60}:{}); delete out.__del;
 if(await secPut(out)){ setFoot("บันทึกแล้ว"); return out; } return false;
}
async function secBook(id){
 const r=secs.find(x=>x._id===id); if(!r)return; const dur=+r.dur||60;
 const sg=secSuggest(r.ex,(r.want&&/^\d{4}-\d\d-\d\d$/.test(r.want)&&r.want>=secToday())?r.want:secToday(),dur,0);
 const pre={ex:r.ex,title:r.topic||"พบ "+r.who,with:r.who,status:"confirmed",buf:"0"}; if(sg){ pre.date=sg.date; pre.st=sg.st; pre.en=sg.en; } else { pre.date=secToday(); pre.st="09:00"; pre.en=secHM(540+dur); }
 await secEditAp(secNew("appt",pre),true,async ap=>{ await secPut(Object.assign({},r,{status:"booked",apId:ap._id})); setFoot("จัดลงคิวแล้ว · "+fmtDate(ap.date)+" "+ap.st); });
}
// ---------- จัดการผู้บริหาร ----------
function secExMgr(){
 const d=xDlg("secxdlg","min(560px,96vw)");
 const paint=()=>{ d.innerHTML=`<div class="dlg-h">ผู้บริหารที่ดูแล</div><div class="dlg-b" style="grid-template-columns:1fr">${secEx.map((e,i)=>`<div class="ph-kr" style="grid-template-columns:22px 1fr 1fr auto"><i style="background:${e.color};width:18px;height:18px;border-radius:50%;display:block;cursor:pointer" data-xc="${i}" title="เปลี่ยนสี"></i><input class="ph-in" data-xn="${i}" value="${esc(e.name)}" placeholder="ชื่อ/ชื่อเรียก"><input class="ph-in" data-xt="${i}" value="${esc(e.title||"")}" placeholder="ตำแหน่ง"><button class="ph-x" data-xd="${i}" title="ลบ">×</button></div>`).join("")||`<div class="ph-hint">ยังไม่มีผู้บริหาร</div>`}
 <div class="ph-add"><input class="ph-in nm" id="xnew" placeholder="เพิ่มผู้บริหาร เช่น คุณสมชาย"><input class="ph-in nm" id="xnewt" placeholder="ตำแหน่ง (ไม่บังคับ)"><button class="btn ghost sm" id="xadd">เพิ่ม</button></div></div><div class="dlg-f"><button class="btn" id="xok">เสร็จ</button></div>`;
  d.querySelectorAll("[data-xn],[data-xt]").forEach(n=>n.onchange=async()=>{ const i=+(n.dataset.xn||n.dataset.xt), l=secEx.map(x=>Object.assign({},x)); if(n.dataset.xn!==undefined){ if(!n.value.trim()){ n.value=l[i].name; return; } l[i].name=n.value.trim(); } else l[i].title=n.value.trim(); await secSaveEx(l); });
  d.querySelectorAll("[data-xc]").forEach(n=>n.onclick=async()=>{ const i=+n.dataset.xc, l=secEx.map(x=>Object.assign({},x)); l[i].color=SEC_COL[(SEC_COL.indexOf(l[i].color)+1)%SEC_COL.length]; await secSaveEx(l); paint(); });
  d.querySelectorAll("[data-xd]").forEach(n=>n.onclick=async()=>{ const i=+n.dataset.xd, e=secEx[i], c=secs.filter(r=>r.ex===e.id).length; if(c){ tell("ลบไม่ได้ค่ะ — ท่านนี้ยังมีข้อมูล "+c+" รายการ ลบรายการเหล่านั้นก่อน"); return; } if(!(await ask("ลบ “"+esc(e.name)+"” ออกจากรายชื่อ?","ลบ")))return; const l=secEx.filter((_,j)=>j!==i); await secSaveEx(l); if(SEC.ex===e.id)SEC.ex="all"; paint(); d.showModal&&!d.open&&d.showModal(); });
  el("xadd").onclick=async()=>{ const nm=el("xnew").value.trim(); if(!nm){ el("xnew").focus(); return; } await secSaveEx([...secEx,{id:"x"+Date.now().toString(36),name:nm,title:el("xnewt").value.trim(),color:SEC_COL[secEx.length%SEC_COL.length]}]); paint(); };
  el("xok").onclick=()=>d.close(); };
 d.onclose=()=>render(); paint(); d.showModal();
}
async function secSaveEx(l){ secEx=l; try{ await DB.doc("meta/secex").set({list:l}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } }
function secCopyDay(){
 const day=SEC.day, L=secs.filter(r=>r.t==="appt"&&(SEC.ex==="all"||r.ex===SEC.ex)&&r.date===day&&r.status!=="cancelled"&&r.status!=="moved").sort((a,b)=>(a.st||"").localeCompare(b.st||""));
 const t=["กำหนดการ "+DOWFULL[secDow(day)]+"ที่ "+(+day.slice(8))+" "+MTHFULL[+day.slice(5,7)-1]+" "+(+day.slice(0,4)+543)+(SEC.ex!=="all"?" — "+secExName(SEC.ex):"")].concat(L.map(r=>"• "+r.st+(r.en?"–"+r.en:"")+" "+r.title+(r.with?" (พบ "+r.with+")":"")+(r.place?" @"+r.place:"")+(SEC.ex==="all"?" ["+secExName(r.ex)+"]":"")),L.length?[]:["ไม่มีนัดหมาย"]).join("\n");
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>setFoot("คัดลอกกำหนดการแล้ว"),()=>{ tell("<b>กำหนดการ</b><pre style=\"white-space:pre-wrap;font:inherit;margin-top:8px\">"+esc(t)+"</pre>"); });
}
// ---------- ผูกเหตุการณ์ ----------
function secWire(){
 if(view!=="sec")return;
 const on=(id,f)=>{ const n=el(id); if(n)n.onclick=f; };
 if(!SEC.unl){
  const go=async()=>{ const m=el("secMsg"); const p1=(el("secPin1").value||"").trim();
   if(secHasPin()){ if(!p1)return; const e=await secTryPin(p1); if(e&&m){ m.textContent=e; el("secPin1").value=""; } return; }
   const p2=(el("secPin2").value||"").trim(); if(!/^\d{4,8}$/.test(p1)){ m.textContent="PIN ต้องเป็นตัวเลข 4–8 หลักค่ะ"; return; } if(p1!==p2){ m.textContent="PIN สองช่องไม่ตรงกัน"; return; }
   try{ await secSetPin(p1); SEC.unl=true; SEC.last=Date.now(); render(); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } };
  on("secGo",go); document.querySelectorAll(".sec-pin").forEach(n=>n.onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); go(); } });
  on("secForget",async()=>{ if(await ask("<b>รีเซ็ต PIN</b><br>ข้อมูลเลขาฯ จะไม่หาย แต่ PIN จะถูกล้างและต้องตั้งใหม่ ทำได้เฉพาะคนที่ล็อกอินแอปนี้อยู่","รีเซ็ต PIN")){ try{ await DB.doc("meta/secpin").set({salt:"",hash:"",at:new Date().toISOString()}); render(); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } } });
  return; }
 on("secLk",secLock); on("secEx",secExMgr); on("secExAdd0",secExMgr);
 on("secChg",async()=>{ const p=await askText("ตั้ง PIN ใหม่ (ตัวเลข 4–8 หลัก)","","เปลี่ยน PIN"); if(p===null)return; if(!/^\d{4,8}$/.test(p)){ tell("PIN ต้องเป็นตัวเลข 4–8 หลักค่ะ"); return; } await secSetPin(p); setFoot("เปลี่ยน PIN แล้ว"); });
 document.querySelectorAll("[data-sect]").forEach(n=>n.onclick=()=>{ SEC.tab=n.dataset.sect; render(); });
 document.querySelectorAll("[data-secx]").forEach(n=>n.onclick=()=>{ SEC.ex=n.dataset.secx; render(); });
 document.querySelectorAll("[data-secday]").forEach(n=>n.onclick=()=>{ SEC.day=n.dataset.secday; render(); });
 document.querySelectorAll("[data-secwk]").forEach(n=>n.onclick=()=>{ const v=+n.dataset.secwk; SEC.day=v?secAdd(SEC.day||secToday(),v):secToday(); render(); });
 document.querySelectorAll("[data-secedit]").forEach(n=>n.onclick=e=>{ if(e.target.closest("button"))return; secEdit(n.dataset.secedit); });
 document.querySelectorAll("[data-secfree]").forEach(n=>n.onclick=()=>{ const [a,b]=n.dataset.secfree.split("|").map(Number); secAdd1("appt",{date:SEC.day,st:secHM(a),en:secHM(Math.min(b,a+60))}); });
 document.querySelectorAll("[data-secbook]").forEach(n=>n.onclick=e=>{ e.stopPropagation(); secBook(n.dataset.secbook); });
 document.querySelectorAll("[data-secrq]").forEach(n=>n.onclick=async e=>{ e.stopPropagation(); const [id,st]=n.dataset.secrq.split("|"), r=secs.find(x=>x._id===id); if(r)await secPut(Object.assign({},r,{status:st})); });
 document.querySelectorAll("[data-secdoc]").forEach(n=>n.onclick=async e=>{ e.stopPropagation(); const [id,st]=n.dataset.secdoc.split("|"), r=secs.find(x=>x._id===id); if(r){ await secPut(Object.assign({},r,{status:st,doneAt:secToday()})); setFoot(st==="signed"?"บันทึกว่าลงนามแล้ว":"ส่งกลับแก้ไขแล้ว"); } });
 document.querySelectorAll("[data-secdir]").forEach(n=>n.onclick=async e=>{ e.stopPropagation(); const r=secs.find(x=>x._id===n.dataset.secdir); if(r){ await secPut(Object.assign({},r,{status:"done",doneAt:secToday()})); setFoot("ปิดงานสั่งการแล้ว"); } });
 on("secAddAp",()=>secAdd1("appt")); on("secAddRq",()=>secAdd1("req")); on("secAddDoc",()=>secAdd1("doc")); on("secAddTrip",()=>secAdd1("trip")); on("secAddDir",()=>secAdd1("dir")); on("secCopy",secCopyDay);
}
{ const _w=wire; wire=function(){ _w.apply(this,arguments); try{ projWire(); }catch(e){ console.error(e); } try{ secWire(); }catch(e){ console.error(e); } }; }
