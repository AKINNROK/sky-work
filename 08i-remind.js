// ===== เตือนก่อนนัดผู้บริหาร (เผื่อเวลาเดินทาง) + เตือนกรอก KPI =====
// ตั้งค่า meta/remindcfg {ap,lead,title,kpi,kday} (RMC) · แผนส่งให้เซิร์ฟเวอร์ที่ meta/pushplan {list,ap,cfg,kpi}
// เวลาเตือน = เวลาเริ่มนัด − เวลาเผื่อเดินทางของนัดนั้น (buf) − lead นาที · ในแอป: เช็กทุก 30 วิ · นอกแอป: /api/push?remind=1 (ต้องมีตัวยิงเรียกทุก ~10 นาที ดู README)
const RM_K="sw-aprm";
const rmMs=(iso,st)=>new Date(iso+"T"+st+":00").getTime();
const rmHM=ms=>{ const d=new Date(ms); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
function rmApList(days){ days=days||3; const T=secToday(), out=[];
 for(let i=0;i<days;i++){ const iso=secAdd(T,i);
  secApptsOn(iso).filter(r=>r.status!=="cancelled"&&r.status!=="moved"&&secMin(r.st)!==null).forEach(r=>{ const st=secHM(secMin(r.st));
   out.push({i:r._id,d:iso,st,ms:rmMs(iso,st),t:String(r.title||"").slice(0,60),x:secExName(r.ex).slice(0,30),b:+r.buf||0,pl:String(r.place||"").slice(0,40)}); }); }
 return out.sort((a,b)=>a.ms-b.ms).slice(0,40); }
function rmKpiPlan(){ if(RMC.kpi===0)return null; const k=tdKpi(), n=k.rows.reduce((s,x)=>s+x.miss,0), now=new Date(), mo=kmMo(now);
 const last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(), kd=Math.min(Math.max(+RMC.kday||25,1),last);
 return {n,from:mo+"-"+String(kd).padStart(2,"0"),to:mo+"-"+String(last).padStart(2,"0")}; }
// ตรรกะเดียวกับ buildReminders ใน api/_digest.js (ต้องแก้คู่กัน)
function rmBuild(ap,nowMs,cfg,sent,grace,showTitle){ cfg=cfg||{}; if(cfg.ap===0)return [];
 const lead=cfg.lead==null?30:Math.max(0,+cfg.lead||0), done=new Set(sent||[]), out=[];
 (ap||[]).forEach(x=>{ if(!x||!x.i||!x.ms)return; const b=Math.max(0,+x.b||0), trig=x.ms-(b+lead)*60000, key=x.i+"|"+x.d;
  if(nowMs<trig||nowMs-trig>(grace||15)*60000||nowMs>=x.ms||done.has(key))return;
  const mins=Math.max(1,Math.round((x.ms-nowMs)/60000)), bits=[(showTitle?x.t+(x.x?" · "+x.x:""):"นัดผู้บริหาร")+" เริ่ม "+x.st];
  if(showTitle&&x.pl)bits.push("ที่ "+x.pl); if(b)bits.push("ควรออกเดินทาง "+rmHM(x.ms-b*60000)+" (เผื่อ "+b+" นาที)");
  out.push({key,title:"อีก "+mins+" นาที",body:bits.join(" · "),tag:"skywork-ap-"+key}); });
 return out; }
const rmSentGet=()=>{ try{ const s=JSON.parse(localStorage.getItem(RM_K)||"{}"); return s.day===secToday()?s:{day:secToday(),keys:[],kpi:0}; }catch(e){ return {day:secToday(),keys:[],kpi:0}; } };
const rmSentSet=s=>{ try{ localStorage.setItem(RM_K,JSON.stringify(s)); }catch(e){} };
function rmBanner(it){ let b=el("rmb"); if(!b){ b=document.createElement("div"); b.id="rmb"; b.setAttribute("role","status"); b.setAttribute("aria-live","polite"); document.body.appendChild(b); }
 const d=document.createElement("div"); d.className="rmi"; d.innerHTML=`<span class="rmx">${it.ic||"⏰"}</span><span class="rmt"><b>${esc(it.title)}</b><small>${esc(it.body||"")}</small></span><button type="button" class="rmgo">${esc(it.go||"ดู")}</button><button type="button" class="rmc" aria-label="ปิด">✕</button>`;
 d.querySelector(".rmc").onclick=()=>{ d.remove(); }; d.querySelector(".rmgo").onclick=()=>{ d.remove(); if(it.act)it.act(); };
 b.appendChild(d); while(b.children.length>3)b.firstChild.remove(); }
function rmSys(it){ try{ if(!("Notification" in window)||Notification.permission!=="granted")return; const o={body:it.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:it.tag||"skywork-rm",data:{url:"./"}};
 navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(r=>{ if(r)r.showNotification(it.title,o); else new Notification(it.title,o); }).catch(()=>{}); }catch(e){} }
function rmTick(){ if(LOADING||!DB||document.hidden)return;
 const S=rmSentGet(), now=Date.now();
 if(RMC.ap!==0&&secs.length){ const due=rmBuild(rmApList(2),now,RMC,S.keys,20,RMC.title||tdSecOk());
  due.forEach(r=>{ S.keys.push(r.key); rmBanner({ic:"⏰",title:r.title,body:r.body,go:"วันนี้",act:()=>{ view="today"; renderNav(); render(); }}); rmSys(r); }); if(due.length)rmSentSet(S); }
 if(RMC.kpi!==0&&!S.kpi){ const k=rmKpiPlan(), T=isoOf(new Date());
  if(k&&k.n>0&&T>=k.from&&T<=k.to){ S.kpi=1; rmSentSet(S); const it={title:"KPI รอกรอก "+k.n+" ข้อ",body:"เดือนนี้ยังกรอกไม่ครบ — แตะเพื่อไปกรอก",tag:"skywork-kpi"}; rmBanner({ic:"📊",title:it.title,body:it.body,go:"ไปกรอก",act:()=>{ const r=tdKpi().rows[0]; if(r){ KM.id=r.t._id; KM.kp=null; } KM.mo=kmMo(new Date()); PH.tab="kpim"; view="proj"; renderNav(); render(); }}); rmSys(it); } } }
setInterval(rmTick,30000); setTimeout(rmTick,6000); document.addEventListener("visibilitychange",()=>{ if(!document.hidden)setTimeout(rmTick,800); });
// ---------- แผนส่งให้เซิร์ฟเวอร์ (ขยายจากของเดิม: เพิ่ม ap/cfg/kpi) ----------
async function pushPlanSave(){
 if(!DB||!pushSubs.length)return;
 const doc={list:pushPlanBuild(),ap:rmApList(3),cfg:{ap:RMC.ap,lead:RMC.lead,title:RMC.title,kpi:RMC.kpi},kpi:rmKpiPlan()}, h=JSON.stringify(doc); if(h===pushLast)return; pushLast=h;
 try{ await DB.doc("meta/pushplan").set(Object.assign({},doc,{at:new Date().toISOString()})); }catch(e){ pushLast=""; } }
// ---------- ตั้งค่า ----------
async function rmSave(p){ RMC=Object.assign({},RMC,p); try{ await DB.doc("meta/remindcfg").set(RMC); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } pushLast=""; pushPlanKick(); render(); }
function rmCard(){ const R=RMC, can="Notification" in window&&Notification.permission==="granted";
 return `<div class="card" style="margin-top:16px"><h2>เตือนก่อนนัดผู้บริหาร & KPI <small>เลขาฯ</small></h2>
<div class="rm-f"><label class="rm-ck"><input type="checkbox" id="rm-ap"${R.ap!==0?" checked":""}> เตือนก่อนนัดผู้บริหาร</label>
<span>เตือน <select id="rm-lead">${[0,15,30,45,60,90].map(n=>`<option value="${n}"${+R.lead===n?" selected":""}>${n?n+" นาที":"ตรงเวลาออกเดินทาง"}</option>`).join("")}</select> ก่อน <b>เวลาออกเดินทาง</b></span></div>
<div class="hint" style="margin-top:2px">เวลาออกเดินทาง = เวลาเริ่มนัด − “เผื่อเวลาเดินทาง” ที่กรอกในนัดนั้น (ตัวอย่าง: นัด 10:00 เผื่อ 30 นาที เตือน 30 นาที → เตือนตอน 09:00 บอกให้ออก 09:30)</div>
<div class="rm-f"><label class="rm-ck"><input type="checkbox" id="rm-title"${R.title?" checked":""}> แสดงชื่อนัด/ผู้บริหาร/สถานที่ในแจ้งเตือน</label></div>
<div class="hint" style="margin-top:2px">ปิดไว้ (แนะนำ) = ขึ้นแค่ “นัดผู้บริหาร เริ่ม 10:00” เพราะแจ้งเตือนอาจขึ้นบนหน้าจอล็อก</div>
<div class="rm-f"><label class="rm-ck"><input type="checkbox" id="rm-kpi"${R.kpi!==0?" checked":""}> เตือนกรอก KPI รายเดือน</label>
<span>ตั้งแต่วันที่ <select id="rm-kday">${[15,20,22,25,26,27,28].map(n=>`<option value="${n}"${+R.kday===n?" selected":""}>${n}</option>`).join("")}</select> ของเดือน จนกว่าจะกรอกครบ</span></div>
<div class="addg"><button class="btn ghost" id="rm-test">${svg(ICON.bell,17)}ทดสอบเตือนในแอป</button></div>
<div class="hint"><b>ตอนเปิดแอปอยู่:</b> เด้งแถบเตือนให้เอง${can?" + แจ้งเตือนของเครื่อง":" (เปิด “แจ้งเตือนบนเครื่องนี้” ด้านบนเพื่อให้เด้งที่หน้าจอด้วย)"}<br>
<b>ตอนปิดแอป:</b> สรุปเช้า 08:00 จะบอกจำนวนนัดวันนี้ + KPI ที่รอกรอกให้อัตโนมัติ · ถ้าต้องการให้เตือน “ก่อนนัด” ทั้งที่ปิดแอป ต้องมีตัวยิงเรียก <code>/api/push?remind=1</code> ทุก 10 นาที (ฟรี: cron-job.org) พร้อม header <code>Authorization: Bearer &lt;CRON_SECRET&gt;</code> — ขั้นตอนอยู่ใน README</div></div>`; }
{ const _s=setRemind; setRemind=function(){ return _s.apply(this,arguments)+rmCard(); }; }
{ const _w=wire; wire=function(){ _w.apply(this,arguments);
  if(el("rm-ap"))el("rm-ap").onchange=e=>rmSave({ap:e.target.checked?1:0});
  if(el("rm-lead"))el("rm-lead").onchange=e=>rmSave({lead:+e.target.value});
  if(el("rm-title"))el("rm-title").onchange=e=>rmSave({title:e.target.checked?1:0});
  if(el("rm-kpi"))el("rm-kpi").onchange=e=>rmSave({kpi:e.target.checked?1:0});
  if(el("rm-kday"))el("rm-kday").onchange=e=>rmSave({kday:+e.target.value});
  if(el("rm-test"))el("rm-test").onclick=()=>{ const it={title:"อีก 60 นาที",body:"นัดผู้บริหาร เริ่ม 10:00 · ควรออกเดินทาง 09:30 (เผื่อ 30 นาที)",tag:"skywork-rm-test"}; rmBanner({ic:"⏰",title:it.title+" (ทดสอบ)",body:it.body,go:"ปิด"}); rmSys(it); };
 }; }
