// ===== Project Hub — โปรเจคหลัก: KPI · ความคืบหน้า · รายงานรายสัปดาห์ · ไทม์ไลน์ Gantt · สรุปผู้บริหาร =====
// ใช้ข้อมูลโปรเจคเดิม (items ที่ kind="proj": pstart/pend/prog/ms/prisk) + ฟิลด์ใหม่ kpis[] plog[] rag และ ms[].due
const PH={tab:"cards",flt:"all",id:null,d:null,tm:0};
const RAGL={g:"ตามแผน",y:"เฝ้าระวัง",r:"ต้องช่วย",d:"เสร็จแล้ว"};
const RAGC={g:"var(--ok)",y:"#d99a14",r:"var(--over)",d:"var(--ink-3)"};
const xDlg=(id,w)=>{ let d=el(id); if(!d){ d=document.createElement("dialog"); d.id=id; document.body.appendChild(d); } d.style.width=w||""; return d; };
const phList=()=>items.filter(t=>kindOfItem(t)==="proj"&&t.status!==STATUS_CANCEL);
const phNum=v=>{ const n=parseFloat(String(v==null?"":v).replace(/,/g,"")); return isFinite(n)?n:null; };
const phD0=v=>{ const d=new Date(v); d.setHours(0,0,0,0); return d; };
function phProg(t){ const ms=t.ms||[], n=ms.length, d=ms.filter(x=>x&&x.d).length;
 if(t.prog!==undefined&&t.prog!==null&&t.prog!=="")return Math.max(0,Math.min(100,+t.prog||0));
 return n?Math.round(d/n*100):0; }
function phExpect(t){ if(!t.pstart||!t.pend)return null; const a=phD0(t.pstart), b=phD0(t.pend), n=phD0(new Date()); if(!(b>a))return null; return Math.max(0,Math.min(100,Math.round((n-a)/(b-a)*100))); }
function phKpiPct(k){ const tg=phNum(k.target), ac=phNum(k.actual); if(tg===null||ac===null)return null;
 if(k.dir==="down")return ac<=tg?100:(ac>0?Math.round(tg/ac*100):0);
 return tg===0?(ac>=0?100:0):Math.round(ac/tg*100); }
const phKc=p=>p===null?"var(--wait)":p>=90?"var(--ok)":p>=60?"#d99a14":"var(--over)";
function phKpiAvg(t){ const a=(t.kpis||[]).map(phKpiPct).filter(v=>v!==null); return a.length?Math.round(a.reduce((s,v)=>s+Math.min(v,100),0)/a.length):null; }
function phMsLate(t){ return (t.ms||[]).filter(x=>x&&!x.d&&x.due&&daysTo(phD0(x.due))<0); }
function phRag(t){
 if(t.status===STATUS_DONE)return {k:"d",label:RAGL.d,why:["ปิดโปรเจคแล้ว"]};
 if(t.rag&&RAGL[t.rag]&&t.rag!=="d")return {k:t.rag,label:RAGL[t.rag],why:["ผู้ดูแลตั้งสถานะเอง"],manual:true};
 const pg=phProg(t), ex=phExpect(t), why=[]; let lv=0;
 if(t.pend&&daysTo(phD0(t.pend))<0){ lv=2; why.push("เลยกำหนดมา "+(-daysTo(phD0(t.pend)))+" วัน"); }
 if(ex!==null){ const g=ex-pg; if(g>=25){ lv=Math.max(lv,2); why.push("ช้ากว่าแผน "+g+"%"); } else if(g>=10){ lv=Math.max(lv,1); why.push("ช้ากว่าแผน "+g+"%"); } }
 const ml=phMsLate(t); if(ml.length){ lv=Math.max(lv,ml.length>=2?2:1); why.push("ขั้นตอนเลยกำหนด "+ml.length+" ข้อ"); }
 const ka=phKpiAvg(t); if(ka!==null&&(pg>=90||(t.pend&&daysTo(phD0(t.pend))<0))){ if(ka<50){ lv=Math.max(lv,2); why.push("KPI เฉลี่ย "+ka+"%"); } else if(ka<80){ lv=Math.max(lv,1); why.push("KPI เฉลี่ย "+ka+"%"); } }
 const lg=(t.plog||[])[0]; if(lg&&lg.risk&&String(lg.risk).trim()){ lv=Math.max(lv,1); why.push("มีอุปสรรคในรายงานล่าสุด"); }
 return {k:["g","y","r"][lv],label:RAGL[["g","y","r"][lv]],why:why.length?why:["เดินตามแผน"]};
}
const phLogAge=t=>{ const l=(t.plog||[])[0]; return l&&l.d?-daysTo(phD0(l.d)):null; };
async function phSave(id,patch){ if(!DB)return; try{ await DB.collection("items").doc(id).set(patch,{merge:true}); }catch(e){ const x=explainErr(e); tell("<b>"+esc(x.title)+"</b>"); } }
// ---------- หน้าหลัก ----------
function projView(){
 const L=phList(), open=L.filter(t=>t.status!==STATUS_DONE);
 const rg=L.map(t=>({t,r:phRag(t)}));
 const cnt=k=>rg.filter(x=>x.r.k===k).length;
 const avg=open.length?Math.round(open.reduce((s,t)=>s+phProg(t),0)/open.length):0;
 const kall=open.flatMap(t=>(t.kpis||[]).map(phKpiPct)).filter(v=>v!==null), kok=kall.filter(v=>v>=100).length;
 const stale=open.filter(t=>{ const a=phLogAge(t); return a===null||a>7; }).length;
 const flt=PH.flt;
 const shown=rg.filter(x=>flt==="all"?x.r.k!=="d":x.r.k===flt).sort((a,b)=>"rygd".indexOf(a.r.k)-"rygd".indexOf(b.r.k)||(a.t.pend||"9").localeCompare(b.t.pend||"9"));
 const tabs=[["cards","การ์ดโปรเจค"],["gantt","ไทม์ไลน์ Gantt"],["weekly","รายงานรายสัปดาห์"]];
 const fl=[["all","ที่กำลังทำ"],["r","แดง"],["y","เหลือง"],["g","เขียว"],["d","เสร็จแล้ว"]];
 let body="";
 if(!L.length)body=`<div class="card"><div class="empty">ยังไม่มีโปรเจค — กด “เพิ่มโปรเจค” เพื่อเริ่มติดตาม KPI และความคืบหน้า<br><small>(หรือแก้งานเดิมให้เป็นประเภท “โปรเจค” ก็จะมาอยู่ที่นี่เอง)</small></div></div>`;
 else if(PH.tab==="gantt")body=phGantt(L.filter(t=>t.status!==STATUS_DONE||flt==="d"));
 else if(PH.tab==="weekly")body=phWeekly(open);
 else body=`<div class="seg ph-flt">${fl.map(([k,l])=>`<button data-phf="${k}" aria-pressed="${flt===k}">${l}${k==="all"?"":" "+cnt(k)}</button>`).join("")}</div>
<div class="ph-grid">${shown.map(x=>phCard(x.t,x.r)).join("")||`<div class="card"><div class="empty">ไม่มีโปรเจคในกลุ่มนี้</div></div>`}</div>`;
 return header("Project Hub",open.length+" โปรเจคที่กำลังทำ",false).replace(/<\/div>\s*$/,`<div class="ph-hb"><button class="btn ghost" id="phSum">${svg(ICON.ai,17)}<span>สรุปผู้บริหาร</span></button><button class="btn addbtn" id="phNew">${svg('<path d="M12 5v14M5 12h14"/>',18)}<span>เพิ่มโปรเจค</span></button></div></div>`)+
`<div class="ph-stat">
<div class="ph-s"><b>${avg}%</b><span>ความคืบหน้าเฉลี่ย</span></div>
<div class="ph-s"><b style="color:var(--over)">${cnt("r")}</b><span>ต้องช่วย</span></div>
<div class="ph-s"><b style="color:#d99a14">${cnt("y")}</b><span>เฝ้าระวัง</span></div>
<div class="ph-s"><b style="color:var(--ok)">${cnt("g")}</b><span>ตามแผน</span></div>
<div class="ph-s"><b>${kall.length?kok+"/"+kall.length:"—"}</b><span>KPI ถึงเป้า</span></div>
<div class="ph-s"><b${stale?` style="color:var(--over)"`:""}>${stale}</b><span>ไม่อัปเดตเกิน 7 วัน</span></div></div>
<div class="toolbar"><div class="seg">${tabs.map(([k,l])=>`<button data-pht="${k}" aria-pressed="${PH.tab===k}">${l}</button>`).join("")}</div></div>${body}`;
}
function phCard(t,r){
 const pg=phProg(t), ex=phExpect(t), ks=(t.kpis||[]).slice(0,3), nx=(t.ms||[]).find(x=>x&&!x.d), lg=(t.plog||[])[0], age=phLogAge(t);
 return `<div class="card ph-c" data-phopen="${t._id}" tabindex="0">
<div class="ph-top"><div class="ph-t">${esc(t.title)}</div><span class="ph-rag" style="--c:${RAGC[r.k]}"><i></i>${r.label}</span></div>
<div class="ph-sub">${t.owner?esc(t.owner)+" · ":""}${t.pstart?fmtDate(t.pstart):"?"} – ${t.pend?fmtDate(t.pend):"?"}${t.pend&&r.k!=="d"?(()=>{ const n=daysTo(phD0(t.pend)); return " · "+(n<0?"เลย "+(-n)+" ว.":n===0?"ครบกำหนดวันนี้":"อีก "+n+" วัน"); })():""}</div>
<div class="ph-pr"><div class="ph-bar"><i style="width:${pg}%;background:${RAGC[r.k]}"></i>${ex!==null&&r.k!=="d"?`<u style="left:${ex}%" title="ควรถึง ${ex}% ตามเวลา"></u>`:""}</div><b>${pg}%</b></div>
${ks.length?`<div class="ph-ks">${ks.map(k=>{ const p=phKpiPct(k); return `<div class="ph-k"><span>${esc(k.name||"KPI")}</span><em>${k.actual!==""&&k.actual!=null?esc(k.actual):"–"} / ${k.target!==""&&k.target!=null?esc(k.target):"–"} ${esc(k.unit||"")}</em><div class="ph-bar sm"><i style="width:${Math.min(100,p||0)}%;background:${phKc(p)}"></i></div></div>`; }).join("")}${(t.kpis||[]).length>3?`<small>+${(t.kpis||[]).length-3} KPI</small>`:""}</div>`:`<div class="ph-hint">ยังไม่ตั้ง KPI — เปิดเพื่อเพิ่ม</div>`}
${nx?`<div class="ph-nx">ขั้นต่อไป: <b>${esc(nx.t)}</b>${nx.due?` · ${fmtDate(nx.due)}`:""}</div>`:""}
<div class="ph-ft">${lg?`<span>รายงาน ${fmtDate(lg.d)}${age>7?` · <b style="color:var(--over)">ค้าง ${age} วัน</b>`:""}</span>`:`<span style="color:var(--over)">ยังไม่มีรายงานรายสัปดาห์</span>`}<span class="ph-why">${esc(r.why[0])}</span></div></div>`;
}
// ---------- Gantt ----------
function phGantt(L){
 const D=L.filter(t=>t.pstart&&t.pend&&phD0(t.pend)>=phD0(t.pstart)), U=L.filter(x=>!D.includes(x));
 if(!D.length)return `<div class="card"><div class="empty">ยังไม่มีโปรเจคที่ระบุวันเริ่ม–วันจบ — เปิดโปรเจคแล้วใส่วันที่ก่อนนะคะ</div></div>`;
 const today=phD0(new Date());
 let a=new Date(Math.min(today,...D.map(t=>+phD0(t.pstart)))), b=new Date(Math.max(today,...D.map(t=>+phD0(t.pend))));
 a=new Date(a.getFullYear(),a.getMonth(),1); b=new Date(b.getFullYear(),b.getMonth()+1,0);
 const span=Math.round((b-a)/864e5)+1, pos=d=>((phD0(d)-a)/864e5)/span*100, W=Math.max(760,span*3.4);
 const months=[]; for(let m=new Date(a);m<=b;m=new Date(m.getFullYear(),m.getMonth()+1,1)){ const e=new Date(m.getFullYear(),m.getMonth()+1,0); months.push({l:MTH[m.getMonth()]+(m.getMonth()===0||months.length===0?" "+(m.getFullYear()+543):""),x:pos(m),w:((e-m)/864e5+1)/span*100}); }
 const tl=`left:${pos(today)}%`;
 const rows=D.sort((x,y)=>String(x.pstart).localeCompare(y.pstart)).map(t=>{ const r=phRag(t), pg=phProg(t), l=pos(t.pstart), w=Math.max(0.8,pos(t.pend)+100/span-l);
  const ms=(t.ms||[]).filter(x=>x&&x.due&&phD0(x.due)>=a&&phD0(x.due)<=b);
  return `<div class="ph-gr"><div class="ph-gl" data-phopen="${t._id}">${esc(t.title)}<small>${pg}% · ${r.label}</small></div>
<div class="ph-gt"><div class="ph-gbar" data-phopen="${t._id}" style="left:${l}%;width:${w}%;--c:${RAGC[r.k]}" title="${esc(t.title)} ${fmtDate(t.pstart)}–${fmtDate(t.pend)} · ${pg}%"><i style="width:${pg}%"></i></div>
${ms.map(x=>`<span class="ph-dia${x.d?" ok":phD0(x.due)<today?" late":""}" style="left:${pos(x.due)}%" title="${esc(x.t)} · ${fmtDate(x.due)}"></span>`).join("")}<span class="ph-today" style="${tl}"></span></div></div>`; }).join("");
 return `<div class="card ph-gcard"><div class="ph-gantt"><div style="width:${W+160}px">
<div class="ph-gr ph-gh"><div class="ph-gl"></div><div class="ph-gt">${months.map(m=>`<span class="ph-mo" style="left:${m.x}%;width:${m.w}%">${m.l}</span>`).join("")}</div></div>${rows}</div></div>
<div class="ph-leg"><span><i class="ph-dia"></i> ขั้นตอน (มีกำหนด)</span><span><i class="ph-dia late"></i> ขั้นตอนเลยกำหนด</span><span><i class="ph-tl"></i> วันนี้</span></div>
${U.length?`<div class="ph-hint" style="margin-top:8px">ไม่แสดงในไทม์ไลน์ (ยังไม่มีวันเริ่ม/จบ): ${U.map(t=>`<a data-phopen="${t._id}">${esc(t.title)}</a>`).join(" · ")}</div>`:""}</div>`;
}
// ---------- รายงานรายสัปดาห์ ----------
function phWeekly(L){
 if(!L.length)return `<div class="card"><div class="empty">ไม่มีโปรเจคที่กำลังทำ</div></div>`;
 const rows=L.map(t=>({t,r:phRag(t),l:(t.plog||[])[0],age:phLogAge(t)})).sort((x,y)=>(y.age===null?999:y.age)-(x.age===null?999:x.age));
 return `<div class="card"><h2>รายงานล่าสุดของแต่ละโปรเจค <small>เรียงจากที่ค้างอัปเดตนานสุด</small></h2><div class="ph-wk">${rows.map(({t,r,l,age})=>`<div class="ph-w" data-phopen="${t._id}">
<div class="ph-wh"><b>${esc(t.title)}</b><span class="ph-rag" style="--c:${RAGC[r.k]}"><i></i>${r.label}</span><span class="ph-pc">${phProg(t)}%</span>
<span class="ph-ag${age===null||age>7?" bad":""}">${l?(age===0?"อัปเดตวันนี้":"อัปเดต "+age+" วันก่อน"):"ยังไม่เคยรายงาน"}</span></div>
${l?`<div class="ph-wb">${l.done?`<p><em>ทำแล้ว</em> ${esc(l.done)}</p>`:""}${l.next?`<p><em>ต่อไป</em> ${esc(l.next)}</p>`:""}${l.risk?`<p class="rk"><em>อุปสรรค</em> ${esc(l.risk)}</p>`:""}</div>`:`<div class="ph-hint">กดเพื่อเปิดแล้วบันทึกรายงานสัปดาห์นี้</div>`}</div>`).join("")}</div></div>`;
}
// ---------- กล่องจัดการโปรเจค ----------
function phSpark(logs){ const a=logs.slice(0,12).reverse().map(l=>+l.prog).filter(v=>isFinite(v)); if(a.length<2)return ""; const w=120,h=30,p=3; const pts=a.map((v,i)=>[p+i*(w-2*p)/(a.length-1),h-p-(Math.max(0,Math.min(100,v))/100)*(h-2*p)]);
 return `<svg class="ph-sp" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-label="แนวโน้มความคืบหน้า"><polyline fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.map(q=>q.map(n=>n.toFixed(1)).join(",")).join(" ")}"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="3" fill="var(--accent)"/></svg>`; }
function phOpen(id){
 const t=items.find(x=>x._id===id); if(!t)return;
 PH.id=id; PH.d={kpis:JSON.parse(JSON.stringify(t.kpis||[])),plog:JSON.parse(JSON.stringify(t.plog||[])),ms:chkList(t.ms),rag:t.rag||"",prog:(t.prog!==undefined&&t.prog!==null&&t.prog!=="")?+t.prog:null};
 const d=xDlg("phdlg","min(860px,96vw)"); d.className="phdlg";
 d.onclick=phDlgClick; d.onchange=phDlgChange; d.oninput=e=>{ if(e.target.matches("[data-phnum],[data-phk]"))phDlgChange(e); };
 d.onclose=()=>{ phFlush(); PH.id=null; render(); };
 phPaint(); if(!d.open)d.showModal();
}
function phCur(){ return items.find(x=>x._id===PH.id); }
function phView(){ const t=phCur()||{}; return Object.assign({},t,{kpis:PH.d.kpis,plog:PH.d.plog,ms:PH.d.ms,rag:PH.d.rag,prog:PH.d.prog}); }
function phPersist(){ clearTimeout(PH.tm); PH.tm=setTimeout(phFlush,450); }
function phFlush(){ clearTimeout(PH.tm); PH.tm=0; if(!PH.id||!PH.d)return; const D=PH.d; const patch={kpis:D.kpis.filter(k=>k.name||k.target!==""||k.actual!==""),plog:D.plog.slice(0,80),ms:D.ms.filter(x=>x.t),rag:D.rag}; if(D.prog!==null)patch.prog=D.prog; phSave(PH.id,patch); }
function phHead(){ const v=phView(), r=phRag(v), pg=phProg(v), ex=phExpect(v);
 const h=el("ph-head"); if(!h)return;
 h.innerHTML=`<div class="ph-pr"><div class="ph-bar lg"><i style="width:${pg}%;background:${RAGC[r.k]}"></i>${ex!==null&&r.k!=="d"?`<u style="left:${ex}%"></u>`:""}</div><b>${pg}%</b></div>
<div class="ph-rg2"><span class="ph-rag" style="--c:${RAGC[r.k]}"><i></i>${r.label}</span><small>${esc(r.why.join(" · "))}${ex!==null&&r.k!=="d"?` · ควรถึง ${ex}% ตามเวลา`:""}</small></div>`; }
function phPaint(){
 const d=el("phdlg"), t=phCur(); if(!d||!t)return; const D=PH.d, v=phView();
 const kp=(k,i)=>{ const p=phKpiPct(k); return `<div class="ph-kr" data-ki="${i}"><input class="ph-in nm" data-phk="${i}:name" placeholder="ชื่อ KPI เช่น อัตราการผ่านอบรม" value="${esc(k.name)}">
<input class="ph-in" inputmode="decimal" data-phk="${i}:target" placeholder="เป้า" value="${esc(k.target)}"><input class="ph-in" inputmode="decimal" data-phk="${i}:actual" placeholder="ผลจริง" value="${esc(k.actual)}"><input class="ph-in u" data-phk="${i}:unit" placeholder="หน่วย" value="${esc(k.unit||"")}">
<select class="ph-in" data-phk="${i}:dir"><option value="up"${k.dir!=="down"?" selected":""}>ยิ่งมากยิ่งดี</option><option value="down"${k.dir==="down"?" selected":""}>ยิ่งน้อยยิ่งดี</option></select>
<div class="ph-kb"><div class="ph-bar sm"><i style="width:${Math.min(100,p||0)}%;background:${phKc(p)}"></i></div><b style="color:${phKc(p)}">${p===null?"–":p+"%"}</b></div><button class="ph-x" data-phkdel="${i}" title="ลบ KPI">×</button></div>`; };
 const ms=(x,i)=>`<div class="ph-mr${x.d?" on":""}"><input type="checkbox" data-phm="${i}"${x.d?" checked":""}><span>${esc(x.t)}</span><input type="date" class="ph-in dt" data-phmd="${i}" value="${esc(x.due||"")}"><button class="ph-x" data-phmdel="${i}" title="ลบ">×</button></div>`;
 const logs=D.plog.slice(0,6);
 d.innerHTML=`<div class="dlg-h">${esc(t.title)}</div><div class="dlg-b" style="grid-template-columns:1fr;gap:18px">
<div><div class="ph-meta">${t.owner?esc(t.owner)+" · ":""}${t.pstart?fmtDate(t.pstart):"ยังไม่ระบุวันเริ่ม"} – ${t.pend?fmtDate(t.pend):"ยังไม่ระบุวันจบ"}${t.prisk?` · ความเสี่ยง: ${esc(t.prisk)}`:""}</div>
<div id="ph-head"></div>
<div class="ph-ctl"><label>ความคืบหน้า %<input class="ph-in" type="number" min="0" max="100" data-phnum="prog" value="${phProg(v)}"></label>
<label>สถานะ (ปล่อยอัตโนมัติ หรือเลือกเอง)<select class="ph-in" data-phrag><option value="">อัตโนมัติ</option><option value="g"${D.rag==="g"?" selected":""}>เขียว · ตามแผน</option><option value="y"${D.rag==="y"?" selected":""}>เหลือง · เฝ้าระวัง</option><option value="r"${D.rag==="r"?" selected":""}>แดง · ต้องช่วย</option></select></label></div></div>
<div><h3 class="ph-h">KPI <small>พิมพ์เป้าและผลจริง ระบบคำนวณ % ให้</small></h3><div id="ph-kpis">${D.kpis.map(kp).join("")||`<div class="ph-hint">ยังไม่มี KPI</div>`}</div><button class="btn ghost sm" data-phkadd style="margin-top:8px">+ เพิ่ม KPI</button></div>
<div><h3 class="ph-h">ขั้นตอน / Milestone <small>ใส่วันที่เพื่อให้ขึ้นในไทม์ไลน์</small></h3><div id="ph-ms">${D.ms.map(ms).join("")||`<div class="ph-hint">ยังไม่มีขั้นตอน</div>`}</div>
<div class="ph-add"><input class="ph-in nm" id="ph-msn" placeholder="ชื่อขั้นตอนใหม่"><input type="date" class="ph-in dt" id="ph-msd"><button class="btn ghost sm" data-phmadd>เพิ่ม</button></div></div>
<div><h3 class="ph-h">รายงานประจำสัปดาห์ ${phSpark(D.plog)}</h3>
<div class="ph-lf"><textarea class="ph-in" id="ph-ld" rows="2" placeholder="สัปดาห์นี้ทำอะไรไปบ้าง"></textarea><textarea class="ph-in" id="ph-ln" rows="2" placeholder="สัปดาห์หน้าจะทำอะไร"></textarea><textarea class="ph-in" id="ph-lr" rows="2" placeholder="ติดอะไร / ต้องการให้ผู้บริหารช่วยอะไร (ถ้ามี)"></textarea>
<div class="ph-lr"><label>ความคืบหน้า %<input class="ph-in" type="number" min="0" max="100" id="ph-lp" value="${phProg(v)}"></label><button class="btn" data-phladd>บันทึกรายงาน</button></div></div>
<div class="ph-hist">${logs.map((l,i)=>`<div class="ph-lh"><div><b>${fmtDate(l.d)}</b> · ${l.prog!==undefined&&l.prog!==""?l.prog+"%":""}<button class="ph-x" data-phldel="${i}" title="ลบรายงานนี้">×</button></div>${l.done?`<p><em>ทำแล้ว</em> ${esc(l.done)}</p>`:""}${l.next?`<p><em>ต่อไป</em> ${esc(l.next)}</p>`:""}${l.risk?`<p class="rk"><em>อุปสรรค</em> ${esc(l.risk)}</p>`:""}</div>`).join("")}${D.plog.length>6?`<div class="ph-hint">มีรายงานย้อนหลังอีก ${D.plog.length-6} ฉบับ</div>`:""}</div></div></div>
<div class="dlg-f"><button class="btn ghost" data-phfull>แก้ไขรายละเอียดเต็ม</button><button class="btn" data-phclose>เสร็จ</button></div>`;
 phHead();
}
function phDlgChange(e){
 const n=e.target, D=PH.d; if(!D)return;
 if(n.dataset.phk){ const [i,f]=n.dataset.phk.split(":"); const k=D.kpis[+i]; if(!k)return; k[f]=n.value;
  if(e.type==="change"||f==="dir"){ phPersist(); }
  const row=n.closest(".ph-kr"), p=phKpiPct(k); if(row){ const b=row.querySelector(".ph-kb"); b.innerHTML=`<div class="ph-bar sm"><i style="width:${Math.min(100,p||0)}%;background:${phKc(p)}"></i></div><b style="color:${phKc(p)}">${p===null?"–":p+"%"}</b>`; }
  phHead(); return; }
 if(n.dataset.phm!==undefined){ const m=D.ms[+n.dataset.phm]; if(m){ m.d=n.checked; const a=D.ms.length, c=D.ms.filter(x=>x.d).length; if(a)D.prog=Math.round(c/a*100); phPersist(); phPaint(); } return; }
 if(n.dataset.phmd!==undefined){ const m=D.ms[+n.dataset.phmd]; if(m){ if(n.value)m.due=n.value; else delete m.due; phPersist(); } return; }
 if(n.dataset.phrag!==undefined){ D.rag=n.value; phPersist(); phHead(); return; }
 if(n.dataset.phnum==="prog"){ const v=Math.max(0,Math.min(100,Math.round(+n.value||0))); D.prog=v; if(e.type==="change"){ phPersist(); } phHead(); }
}
async function phDlgClick(e){
 const b=e.target.closest("button"); if(!b)return; const D=PH.d, t=phCur(); if(!D||!t)return;
 if(b.hasAttribute("data-phclose")){ el("phdlg").close(); return; }
 if(b.hasAttribute("data-phfull")){ phFlush(); el("phdlg").close(); setTimeout(()=>open_(items.find(x=>x._id===t._id)||t),50); return; }
 if(b.hasAttribute("data-phkadd")){ D.kpis.push({id:"k"+Date.now().toString(36),name:"",target:"",actual:"",unit:"",dir:"up"}); phPaint(); const r=[...el("phdlg").querySelectorAll(".ph-kr")].pop(); r&&r.querySelector("input").focus(); return; }
 if(b.dataset.phkdel!==undefined){ D.kpis.splice(+b.dataset.phkdel,1); phPersist(); phPaint(); return; }
 if(b.hasAttribute("data-phmadd")){ const v=el("ph-msn").value.trim(); if(!v){ el("ph-msn").focus(); return; } const o={t:v,d:false}; if(el("ph-msd").value)o.due=el("ph-msd").value; D.ms.push(o); const a=D.ms.length, c=D.ms.filter(x=>x.d).length; if(t.prog===undefined||t.prog===null||t.prog==="")D.prog=Math.round(c/a*100); phPersist(); phPaint(); return; }
 if(b.dataset.phmdel!==undefined){ D.ms.splice(+b.dataset.phmdel,1); phPersist(); phPaint(); return; }
 if(b.dataset.phldel!==undefined){ D.plog.splice(+b.dataset.phldel,1); phPersist(); phPaint(); return; }
 if(b.hasAttribute("data-phladd")){
  const done=el("ph-ld").value.trim(), next=el("ph-ln").value.trim(), risk=el("ph-lr").value.trim(); const pr=Math.max(0,Math.min(100,Math.round(+el("ph-lp").value||0)));
  if(!done&&!next&&!risk){ el("ph-ld").focus(); return; }
  const today=isoOf(new Date()); D.plog=D.plog.filter(l=>l.d!==today); D.plog.unshift({d:today,done,next,risk,prog:pr}); D.prog=pr; phPersist(); phPaint(); setFoot("บันทึกรายงานสัปดาห์แล้ว"); return; }
}
// ---------- สรุปผู้บริหาร ----------
function phSummaryData(){ return phList().filter(t=>t.status!==STATUS_DONE).map(t=>{ const r=phRag(t), lg=(t.plog||[])[0]; return {ชื่อ:t.title,ผู้ดูแล:t.owner||"",เริ่ม:t.pstart||"",จบ:t.pend||"",ความคืบหน้า:phProg(t),ควรถึง:phExpect(t),สถานะ:r.label,เหตุผล:r.why.join("; "),KPI:(t.kpis||[]).map(k=>({ชื่อ:k.name,เป้า:k.target,จริง:k.actual,หน่วย:k.unit||"",ถึงเป้า:phKpiPct(k)})),ขั้นตอนค้าง:(t.ms||[]).filter(x=>x&&!x.d).map(x=>x.t+(x.due?" ("+x.due+")":"")),ความเสี่ยง:t.prisk||"",รายงานล่าสุด:lg?{วันที่:lg.d,ทำแล้ว:lg.done,ต่อไป:lg.next,อุปสรรค:lg.risk}:null}; }); }
function phLocalSummary(){
 const L=phList().filter(t=>t.status!==STATUS_DONE); if(!L.length)return "ยังไม่มีโปรเจคที่กำลังทำ";
 const rg=L.map(t=>({t,r:phRag(t)})), by=k=>rg.filter(x=>x.r.k===k);
 const avg=Math.round(L.reduce((s,t)=>s+phProg(t),0)/L.length);
 const ln=x=>"• "+x.t.title+" — "+phProg(x.t)+"%"+(x.t.owner?" ("+x.t.owner+")":"")+" · "+x.r.why.join(", ");
 const out=["สรุปโปรเจค ณ "+fmtDate(new Date())+" "+(new Date().getFullYear()+543),"ทั้งหมด "+L.length+" โปรเจค · ความคืบหน้าเฉลี่ย "+avg+"% · ตามแผน "+by("g").length+" · เฝ้าระวัง "+by("y").length+" · ต้องช่วย "+by("r").length];
 if(by("r").length)out.push("","ต้องการการตัดสินใจ/ช่วยเหลือ:",...by("r").map(ln));
 if(by("y").length)out.push("","เฝ้าระวัง:",...by("y").map(ln));
 if(by("g").length)out.push("","ตามแผน:",...by("g").map(x=>"• "+x.t.title+" — "+phProg(x.t)+"%"));
 const kk=L.flatMap(t=>(t.kpis||[]).map(k=>({t,k,p:phKpiPct(k)}))).filter(x=>x.p!==null&&x.p<80);
 if(kk.length)out.push("","KPI ที่ยังต่ำกว่าเป้า (<80%):",...kk.slice(0,10).map(x=>"• "+x.t.title+" › "+x.k.name+" "+x.k.actual+"/"+x.k.target+" "+(x.k.unit||"")+" ("+x.p+"%)"));
 const st=L.filter(t=>{ const a=phLogAge(t); return a===null||a>7; });
 if(st.length)out.push("","ยังไม่อัปเดตรายงานเกิน 7 วัน: "+st.map(t=>t.title).join(", "));
 return out.join("\n");
}
async function phAiSummary(box,btn){
 btn.disabled=true; btn.textContent="AI กำลังเรียบเรียง…";
 try{
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),70000);
  const sys="คุณคือผู้ช่วยฝ่าย HR ของ LeKise Group เขียนสรุปสถานะโปรเจคเสนอผู้บริหาร เป็นภาษาไทย กระชับ ตรงประเด็น ไม่เกิน 220 คำ โครงสร้าง: (1) ภาพรวม 1-2 ประโยค (2) โปรเจคที่ต้องการให้ผู้บริหารตัดสินใจหรือช่วย พร้อมเหตุผลและสิ่งที่ขอ (3) ความเสี่ยงสำคัญ (4) KPI ที่ต่ำกว่าเป้า (5) สิ่งที่จะเกิดขึ้นใน 2 สัปดาห์ข้างหน้า ใช้เฉพาะข้อมูลที่ให้มา ห้ามแต่งตัวเลขหรือชื่อเพิ่ม ไม่ใช้ตาราง ใช้หัวข้อสั้นๆ และจุด • ได้";
  const r=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:sys,context:"",max_tokens:1400,messages:[{role:"user",content:"วันนี้ "+isoOf(new Date())+"\nข้อมูลโปรเจค (JSON):\n"+JSON.stringify(phSummaryData()).slice(0,14000)}]})});
  clearTimeout(tm); const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(r.status===503?"ยังไม่ได้ตั้งค่า AI ที่ Vercel (ANTHROPIC_API_KEY) — ใช้สรุปอัตโนมัติด้านบนแทนได้ค่ะ":(j.message||("ผิดพลาด "+r.status)));
  if(!j.text)throw new Error("AI ไม่ตอบกลับ");
  box.value=j.text.trim(); btn.textContent="เรียบเรียงใหม่ด้วย AI";
 }catch(e){ tell("<b>AI สรุปไม่สำเร็จ</b><div class=\"hint\" style=\"line-height:1.7\">"+esc(e&&e.name==="AbortError"?"รอนานเกินไป ลองใหม่ค่ะ":(e.message||String(e)))+"</div>"); btn.textContent="ให้ AI เรียบเรียง"; }
 btn.disabled=false;
}
function phSummary(){
 const d=xDlg("phsum","min(720px,96vw)");
 d.innerHTML=`<div class="dlg-h">สรุปโปรเจคสำหรับผู้บริหาร</div><div class="dlg-b" style="grid-template-columns:1fr"><div class="hint" style="margin:0">ด้านล่างสร้างจากข้อมูลจริงในแอปทันที (แก้ไขได้) — กด “ให้ AI เรียบเรียง” เพื่อให้ภาษาลื่นขึ้น AI ใช้เฉพาะข้อมูลที่มี ไม่แต่งเพิ่มค่ะ</div><textarea class="ph-in" id="phsum-t" rows="16" style="font-size:14px;line-height:1.7"></textarea></div>
<div class="dlg-f"><button class="btn ghost" id="phsum-ai">ให้ AI เรียบเรียง</button><button class="btn ghost" id="phsum-cp">คัดลอก</button><button class="btn" id="phsum-x">ปิด</button></div>`;
 el("phsum-t").value=phLocalSummary();
 el("phsum-x").onclick=()=>d.close();
 el("phsum-ai").onclick=()=>phAiSummary(el("phsum-t"),el("phsum-ai"));
 el("phsum-cp").onclick=async()=>{ const v=el("phsum-t").value; try{ await navigator.clipboard.writeText(v); }catch(e){ el("phsum-t").select(); document.execCommand("copy"); } setFoot("คัดลอกสรุปแล้ว"); };
 d.showModal();
}
function projWire(){
 if(view!=="proj")return;
 document.querySelectorAll("[data-phopen]").forEach(n=>{ n.onclick=ev=>{ ev.stopPropagation(); phOpen(n.dataset.phopen); }; n.onkeydown=ev=>{ if(ev.key==="Enter")phOpen(n.dataset.phopen); }; });
 document.querySelectorAll("[data-pht]").forEach(n=>n.onclick=()=>{ PH.tab=n.dataset.pht; render(); });
 document.querySelectorAll("[data-phf]").forEach(n=>n.onclick=()=>{ PH.flt=n.dataset.phf; render(); });
 if(el("phNew"))el("phNew").onclick=()=>open_(null,"proj",true);
 if(el("phSum"))el("phSum").onclick=phSummary;
}
