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
function setConnect(){
const ua=navigator.userAgent;
const isMobile=/iPhone|iPad|iPod|Android/i.test(ua);
const dev=isMobile?(/iPad/i.test(ua)?"แท็บเล็ต / iPad":"มือถือ"):"โน้ตบุ๊ก / คอมพิวเตอร์";
const os=/iPhone|iPad|iPod/i.test(ua)?"iOS":/Android/i.test(ua)?"Android":/Mac/i.test(ua)?"macOS":/Win/i.test(ua)?"Windows":"อื่นๆ";
const on=!!DB;
return `<div class="banner ${on?"ok":"bad"}">${svg(on?ICON.check:ICON.bell,19)}
${on?"เชื่อมต่อฐานข้อมูลสำเร็จ · ข้อมูลซิงก์อัตโนมัติทุกเครื่อง":"ยังเชื่อมต่อฐานข้อมูลไม่ได้ · ตอนนี้แก้ไขข้อมูลไม่ได้"}</div>
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
meta:{groups,companies,gl:gls,types:typeDefs(),tags:tagDefs(),courses,skills:skills(),modes:modes(),idxcats:idxCats,tpls,
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
