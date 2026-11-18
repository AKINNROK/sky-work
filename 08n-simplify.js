// ===== รอบ C: ลดความซับซ้อน (v14.14.56) =====
// C11 ภาพรวม = ตัวเลข · วันนี้ = สิ่งที่ต้องทำ (แถบสรุปลิงก์เดียวในภาพรวม) · C12 เมนูจัดกลุ่ม + เมนูเต็มมีชื่อบนมือถือ
// C13 ฟอร์มสั้นลง (สติกเกอร์พับเก็บ · ผู้รับผิดชอบ/วันที่ขึ้นไปใต้ชื่องาน · ปุ่มเพิ่มในหน้าประชุม/อบรมเปิดฟอร์มตรง)
// C14 ปุ่มลัด: เลื่อนวัน (การ์ดงาน) · ต่ออายุแล้ว (กฎหมาย) · ✓ ปิดงานในหน้าวันนี้ · C15 จัดหน้าตั้งค่า · C16 งบอนุมัติแยกจากงบที่งานขอ · C17 คู่มือเริ่มต้น
// ---------- C11 ----------
function homeStrip(){ const w=dueSoon(7), pr=prepDue(3), q1=(typeof matrixItems==="function"?matrixItems().filter(t=>quadOf(t)==="q1"&&isOpenStatus(t.status)):[]).length;
 const ap=typeof tdSecOk==="function"&&tdSecOk()?secApptsOn(secToday()).filter(r=>SEC_OK(r)).length:0;
 const bits=[[w.late.length,"ค้าง/เลยกำหนด","bad"],[w.soon.length,"ครบใน 7 วัน",""],[pr.length,"ต้องเตรียมประชุม","bad"],[q1,"ช่อง 1 สำคัญ+ด่วน",""],[ap,"นัดผู้บริหารวันนี้",""]].filter(x=>x[0]);
 return `<div class="card span4 hstrip" data-go="today" role="button" tabindex="0"><b>สิ่งที่ต้องทำ</b>${bits.length?bits.map(([n,l,c])=>`<span class="${c}"><b>${n}</b> ${l}</span>`).join(""):`<span>ไม่มีงานค้างหรือใกล้ครบ 🎉</span>`}<em>ไปหน้า “วันนี้” →</em></div>`; }
// ---------- C12 เมนู ----------
const NAVG=[["ประจำวัน",["cal","today"]],["งาน HR",["home","all","matrix","gaps","meet","train","dsd","legal"]],["บริหาร & เลขาฯ",["budget","exec","proj","sec"]],["เครื่องมือ",["idx","note","ai","set"]]];
{ const ord=NAVG.flatMap(g=>g[1]), ix=k=>{ const i=ord.indexOf(k); return i<0?99:i; }; VIEWS.sort((a,b)=>ix(a[0])-ix(b[0])); TABS.sort((a,b)=>ix(a)-ix(b)); }
function menuSheet(){ const d=xDlg("menusheet","min(520px,96vw)"); d.className="menusheet";
 d.innerHTML=`<div class="dlg-h">เมนูทั้งหมด</div><div class="dlg-b" style="display:block">${NAVG.map(([g,ks])=>`<div class="ms-g"><small>${g}</small><div class="ms-grid">${ks.map(k=>{ const v=VIEWS.find(x=>x[0]===k); return v?`<button type="button" data-msv="${k}" aria-current="${k===view}">${svg(ICON[k]||ICON.all,20)}<span>${esc(v[1])}</span></button>`:""; }).join("")}</div></div>`).join("")}
<div class="ms-g"><div class="ms-grid"><button type="button" data-msv="__find">${svg(ICON.find,20)}<span>ค้นหาข้ามระบบ</span></button></div></div></div><div class="dlg-f"><button class="btn ghost" data-msv="__close">ปิด</button></div>`;
 d.onclick=e=>{ const b=e.target.closest("[data-msv]"); if(e.target===d){ d.close(); return; } if(!b)return; const k=b.dataset.msv; d.close(); if(k==="__find"){ gsOpen(); return; } if(k==="__close")return; view=k; R.pq=""; renderNav(); render(); window.scrollTo(0,0); };
 d.showModal(); }
{ const _rn=renderNav; renderNav=function(){ _rn.apply(this,arguments);
  const n=el("nav"); if(n)NAVG.forEach(([g,ks])=>{ const b=n.querySelector(`button[data-v="${ks[0]}"]`); if(b&&!(b.previousElementSibling&&b.previousElementSibling.classList.contains("navg"))){ const h=document.createElement("div"); h.className="navg"; h.textContent=g; n.insertBefore(h,b); } });
  const tb=el("tabbar"); if(tb){ NAVG.slice(1).forEach(([g,ks])=>{ const b=tb.querySelector(`button[data-v="${ks[0]}"]`); if(b&&!(b.previousElementSibling&&b.previousElementSibling.classList.contains("tbsep"))){ const s=document.createElement("i"); s.className="tbsep"; tb.insertBefore(s,b); } });
   if(!tb.querySelector(".tbmenu")){ const m=document.createElement("button"); m.type="button"; m.className="tbmenu"; m.title="เมนูทั้งหมด (มีชื่อ)"; m.setAttribute("aria-label","เมนูทั้งหมด"); m.innerHTML=svg('<path d="M4 7h16M4 12h16M4 17h16"/>',19)+"<span>เมนู</span>"; m.onclick=e=>{ e.stopPropagation(); menuSheet(); }; tb.insertBefore(m,tb.firstChild); } } }; }
// ---------- C13 ฟอร์ม ----------
let formTidyDone=false;
function formTidy(){ if(formTidyDone)return; const sw=el("stk-wrap"), title=el("f-title"); if(!sw||!title)return; formTidyDone=true;
 const tg=document.createElement("div"); tg.className="f wide"; tg.id="stk-tg"; tg.innerHTML=`<button type="button" class="btn ghost sm" id="stk-tgb"></button>`; sw.parentNode.insertBefore(tg,sw);
 el("stk-tgb").onclick=()=>{ sw.hidden=!sw.hidden; stkTgPaint(); };
 const tf=title.closest(".f"), ow=el("f-owner")&&el("f-owner").closest(".f"), dt=el("f-date")&&el("f-date").closest(".f");
 if(tf&&dt){ tf.parentNode.insertBefore(dt,tf.nextSibling); if(ow)tf.parentNode.insertBefore(ow,dt); } }
function stkTgPaint(){ const sw=el("stk-wrap"), b=el("stk-tgb"); if(!sw||!b)return; const n=(typeof formStk!=="undefined"&&formStk.length)||0; b.textContent=sw.hidden?"＋ สติกเกอร์สถานะ"+(n?" ("+n+")":""):"− ซ่อนสติกเกอร์"; }
{ const _o=open_; open_=function(t){ formTidy(); const r=_o.apply(this,arguments); const sw=el("stk-wrap"); if(sw){ sw.hidden=!((typeof formStk!=="undefined")&&formStk.length); stkTgPaint(); } return r; }; }
{ const _p=openPick; openPick=function(){ if(view==="meet"){ pickKind("meet"); return; } if(view==="train"||view==="dsd"){ pickKind("train"); return; } return _p.apply(this,arguments); }; }
// ---------- C14 ปุ่มลัด ----------
async function postpone(t,iso){ if(!iso)return; try{ await DB.collection("items").doc(t._id).set({date:iso},{merge:true}); setFoot("เลื่อน “"+t.title+"” ไป "+fmtDate(iso)+" แล้ว"); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); return; } const c=el("cardlg"); if(c&&c.open)c.close(); }
{ const _c=openCard; openCard=function(t,occ){ const r=_c.apply(this,arguments); try{ const b=el("vc-body"); const old=el("pp-row"); if(old)old.remove();
  if(b&&t&&!rr(t)&&isOpenStatus(t.status)&&kindOfItem(t)!=="proj"){ const base=(t.date&&t.date>isoOf(new Date()))?t.date:isoOf(new Date()), add=n=>{ const d=new Date(base+"T00:00:00"); d.setDate(d.getDate()+n); return isoOf(d); };
   const x=document.createElement("div"); x.id="pp-row"; x.className="pp-row"; const late=t.date&&t.date<isoOf(new Date());
   x.innerHTML=`<span>${late?"⏰ เลยกำหนด — ":""}เลื่อนวัน:</span><button type="button" data-pp="${add(1)}">พรุ่งนี้</button><button type="button" data-pp="${add(7)}">+1 สัปดาห์</button><button type="button" data-pp="${add(30)}">+1 เดือน</button><label>เลือกวัน <input type="date" id="pp-d"></label>`;
   b.insertBefore(x,b.firstChild); x.querySelectorAll("[data-pp]").forEach(btn=>btn.onclick=()=>postpone(t,btn.dataset.pp)); el("pp-d").onchange=e=>postpone(t,e.target.value); } }catch(e){ console.error(e); } return r; }; }
async function legalRenew(L){ const today=isoOf(new Date()); const v=await secForm("ต่ออายุแล้ว · "+L.title,[{k:"issued",l:"วันที่ต่ออายุ / ออกใหม่",type:"date",req:1},...(+L.cycle?[]:[{k:"expires",l:"วันหมดอายุใหม่",type:"date"}]),{k:"person",l:"ผู้รับผิดชอบ"}],{issued:today,expires:"",person:L.person||""},{note:+L.cycle?"รอบถัดไปคำนวณจากวันที่ออก + รอบทบทวน ("+L.cycle+" เดือน) ให้อัตโนมัติ":"ใส่วันหมดอายุใหม่ตามเอกสาร"});
 if(!v)return; const p={issued:v.issued,person:v.person}; if(!+L.cycle)p.expires=v.expires||null;
 try{ await DB.collection("legal").doc(L._id).set(p,{merge:true}); setFoot("บันทึกการต่ออายุ “"+L.title+"” แล้ว"); const c=el("cardlg"); if(c&&c.open)c.close(); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } }
{ const _l=openLegalCard; openLegalCard=function(L){ const r=_l.apply(this,arguments); try{ const f=document.querySelector("#cardlg .dlg-f"); if(f&&L&&!L.lifetime){ f.querySelectorAll(".xcard").forEach(b=>b.remove()); const b=document.createElement("button"); b.type="button"; b.className="btn xcard"; b.textContent="✓ ต่ออายุแล้ว"; b.onclick=()=>legalRenew(L); f.insertBefore(b,el("vc-edit2")); } }catch(e){} return r; }; }
async function tdDone(spec){ const [id,iso]=spec.split("|"), t=items.find(x=>x._id===id); if(!t)return;
 try{ if(iso&&rr(t)){ const p=occPatch(t,iso,STATUS_DONE), {_id,...rest}=t; await saveItem({...rest,...p},_id); } else await DB.collection("items").doc(id).set({status:STATUS_DONE},{merge:true}); setFoot("ปิดงาน “"+t.title+"” แล้ว ✓ (เปิดกลับได้ในการ์ดงาน)"); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } }
// ---------- C15 ตั้งค่า ----------
{ const i=SETTABS.findIndex(x=>x[0]==="import"); if(i>=0)SETTABS[i][1]="สำรอง & นำเข้า"; const j=SETTABS.findIndex(x=>x[0]==="types"); if(j>=0)SETTABS[j][1]="ประเภท & ป้าย"; }
function cutCard(h,marker){ const m=h.indexOf(marker); if(m<0)return null; const st=h.lastIndexOf('<div class="card"',m); if(st<0)return null; let i=st,dep=0; const re=/<div\b|<\/div>/g; re.lastIndex=st; let x;
 while((x=re.exec(h))){ dep+=x[0]==="</div>"?-1:1; if(dep===0){ i=re.lastIndex; return {card:h.slice(st,i),rest:h.slice(0,st)+h.slice(i)}; } } return null; }
const _themeOrig=setTheme_;
setTheme_=function(){ const h=_themeOrig.apply(this,arguments), c=cutCard(h,"<h2>ป้ายกำกับ"); return c?c.rest:h; };
{ const _y=setTypes; setTypes=function(){ const h=_y.apply(this,arguments); let c=null; try{ c=cutCard(_themeOrig(),"<h2>ป้ายกำกับ"); }catch(e){} return c?h+c.card:h; }; }
{ const _r=setRemind; setRemind=function(){ const can="Notification" in window, perm=can?Notification.permission:"no";
  const row=(ok,t,d)=>`<div class="rm-ov"><b class="${ok?"ok":""}">${ok?"✓":"○"}</b><div><b>${t}</b><small>${d}</small></div></div>`;
  return `<div class="card" style="margin-bottom:16px"><h2>การเตือนทำงานยังไง <small>มี 4 ชั้น ใช้อันไหนก็ได้</small></h2>
${row(true,"1. แถบเตือนในแอป","เห็นเองเมื่อเปิดแอป — หน้า “วันนี้” รวมทุกเรื่องที่ต้องทำ (ไม่ต้องตั้งค่า)")}
${row(perm==="granted","2. แจ้งเตือนบนเครื่องนี้","เด้งที่เครื่องวันละครั้งตอนเปิดแอป + เตือนก่อนนัดตอนแอปเปิดอยู่ — "+(perm==="granted"?"เปิดแล้ว":"ยังไม่เปิด (การ์ดด้านล่าง)"))}
${row(typeof PUSH!=="undefined"&&PUSH.here,"3. แจ้งเตือนนอกแอป (Push)","สรุปเช้า 08:00 แม้ปิดแอป — "+(typeof PUSH!=="undefined"&&PUSH.here?"เปิดบนเครื่องนี้แล้ว":"ยังไม่เปิดบนเครื่องนี้"))}
${row(false,"4. เตือนก่อนนัดตอนปิดแอป","ต้องตั้งตัวยิงฟรีที่ cron-job.org (ไม่บังคับ) — ดูการ์ด “เตือนก่อนนัดผู้บริหาร & KPI”")}</div>`+_r.apply(this,arguments); }; }
// ---------- C16 งบอนุมัติ vs งบที่งานขอ ----------
function budApproved(y){ const f=budFlow(y); let ap=0,task=0,act=0; Object.values(f).forEach(r=>{ ap+=r.ceil||0; task+=r.task.reduce((a,b)=>a+b,0)+r.taskNoM; act+=r.actY; }); return {f,ap,task,act}; }
{ const _b=budget; budget=function(){ const h=_b.apply(this,arguments); const y=R.year, A=budApproved(y); if(!A.ap)return h;
  const pa=Math.round(A.act/A.ap*100), over=A.task>A.ap;
  const bar=`<div class="banner${A.act>A.ap?" bad":over?"":" ok"} bud-ap">💰 <span><b>งบอนุมัติรวม ${baht(A.ap)} ฿</b> (ตั้งค่า › หมวด GL) · ใช้จริง ${baht(A.act)} ฿ = <b>${pa}% ของงบอนุมัติ</b>${over?` · ⚠ งานต่าง ๆ ลงงบรวม ${baht(A.task)} ฿ <b>เกินงบอนุมัติ ${baht(A.task-A.ap)} ฿</b>`:` · งานลงงบรวม ${baht(A.task)} ฿`}</span></div>`;
  return h.replace('<div class="dash">',bar+'<div class="dash">'); }; }
function budRowsPaint(){ if(view!=="budget")return; const f=budFlow(R.year);
 document.querySelectorAll('.glrow[data-list^="gl:"]').forEach(r=>{ if(r.querySelector(".gl-ap"))return; const k=r.dataset.list.slice(3), x=f[k]; if(!x||!x.ceil)return; const task=x.task.reduce((a,b)=>a+b,0)+x.taskNoM;
  const s=document.createElement("div"); s.className="gl-ap"; s.innerHTML=`อนุมัติ <b>${baht(x.ceil)}</b> ฿ · ใช้จริง ${baht(x.actY)} ฿ (${Math.round(x.actY/x.ceil*100)}% ของอนุมัติ)${task>x.ceil?` · <b class="late">งานลงงบรวม ${baht(task)} ฿ เกินอนุมัติ ${baht(task-x.ceil)}</b>`:""}`; r.appendChild(s); }); }
// ---------- C17 คู่มือเริ่มต้น ----------
const ONB_K="sw-onb";
function onbSteps(){ const st=()=>{ try{ return window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true; }catch(e){ return false; } };
 return [["เพิ่มงานแรก",items.length>0,()=>openPick()],["ตั้งหมวดงบ (GL) + งบอนุมัติ",gls.length>0,()=>{ view="set"; settab="gl"; }],["ลงทะเบียนกฎหมาย / ใบอนุญาต",legal.length>0,()=>{ view="legal"; }],
  ["ตั้ง PIN + รายชื่อผู้บริหาร (ถ้าใช้ส่วนเลขาฯ)",secHasPin()&&secEx.length>0,()=>{ view="sec"; }],["เปิดการแจ้งเตือน",("Notification" in window&&Notification.permission==="granted")||pushSubs.length>0,()=>{ view="set"; settab="remind"; }],
  ["สำรองข้อมูลครั้งแรก",!!bkAt,()=>{ view="set"; settab="import"; }],["ติดตั้งเป็นแอปบน iPad",st(),()=>tell("<b>ติดตั้งเป็นแอป</b><div style=\"font-size:13.5px;margin-top:8px;line-height:1.8\">Safari › ปุ่มแชร์ (สี่เหลี่ยมมีลูกศร) › <b>เพิ่มไปยังหน้าจอโฮม</b> แล้วเปิดจากไอคอน Sky Work — จะได้แจ้งเตือนและเต็มจอ</div>")]]; }
const onbHidden=()=>{ try{ return localStorage.getItem(ONB_K)==="hide"; }catch(e){ return false; } };
function onbCard(force){ const S=onbSteps(), d=S.filter(x=>x[1]).length; if(!force&&(onbHidden()||d===S.length))return "";
 return `<div class="card onb"><div class="onb-h"><h2>เริ่มต้นใช้งาน <small>${d}/${S.length} ขั้น</small></h2><button class="btn ghost sm" id="onbHide">ซ่อน</button></div><div class="ph-bar sm"><i style="width:${Math.round(d/S.length*100)}%;background:var(--ok)"></i></div>
<div class="onb-l">${S.map((x,i)=>`<button type="button" class="onb-i${x[1]?" ok":""}" data-onb="${i}"><b>${x[1]?"✓":i+1}</b><span>${esc(x[0])}</span>${x[1]?"":"<em>ไปทำ →</em>"}</button>`).join("")}</div></div>`; }
{ const _tv=todayView; todayView=function(){ const h=_tv.apply(this,arguments), c=onbCard(); return c?h.replace('<div class="td-g">',c+'<div class="td-g">'):h; }; }
{ const _c=setConnect; setConnect=function(){ return `<div class="card" style="margin-bottom:16px"><h2>คู่มือเริ่มต้น</h2><div class="hint" style="margin:4px 0 10px">รายการตั้งค่าที่ควรทำ — ซ่อนจากหน้า “วันนี้” ไปแล้วเปิดดูได้ที่นี่</div>${onbCard(true).replace('<div class="card onb">','<div class="onb">').replace('<button class="btn ghost sm" id="onbHide">ซ่อน</button>',onbHidden()?'<button class="btn ghost sm" id="onbShow">แสดงในหน้าวันนี้อีกครั้ง</button>':"")}</div>`+_c.apply(this,arguments); }; }
// ---------- ผูกปุ่ม ----------
{ const _w=wire; wire=function(){ _w.apply(this,arguments);
  document.querySelectorAll("[data-tddone]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); b.disabled=true; tdDone(b.dataset.tddone); });
  document.querySelectorAll(".hstrip[data-go]").forEach(n=>{ n.onclick=()=>{ view=n.dataset.go; renderNav(); render(); window.scrollTo(0,0); }; n.onkeydown=e=>{ if(e.key==="Enter")n.onclick(); }; });
  document.querySelectorAll("[data-onb]").forEach(b=>b.onclick=()=>{ const s=onbSteps()[+b.dataset.onb]; if(!s)return; s[2](); renderNav(); render(); window.scrollTo(0,0); });
  if(el("onbHide"))el("onbHide").onclick=()=>{ try{ localStorage.setItem(ONB_K,"hide"); }catch(e){} render(); };
  if(el("onbShow"))el("onbShow").onclick=()=>{ try{ localStorage.removeItem(ONB_K); }catch(e){} render(); };
  try{ budRowsPaint(); }catch(e){ console.error(e); } }; }
