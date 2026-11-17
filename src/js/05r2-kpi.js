// ===== KPI รายเดือน (Project Hub) — ผูกทีมย่อย→KPI หลัก · ประวัติรายเดือน · ชนิดเป้า · สถานะส่งอัปเดต · สรุปรายเดือน =====
// ข้อมูลอยู่ใน items[proj].kpis[]: {id,name,target,actual,unit,dir,team,parent,ptype,calc,hist:{"YYYY-MM":{v,n}}}
const KMT={last:"ผลล่าสุด / ณ สิ้นเดือน",cum:"สะสม (รวมทุกเดือนที่กรอก)",month:"รายเดือน (วัดผลแต่ละเดือน)"};
const KMS={last:"ผลล่าสุด",cum:"สะสม",month:"รายเดือน"};
const KM={shut:{},id:null,pid:null,mo:"",kp:null,tm:0,dirty:false,ver:0,map:false,live:null};
const kmMo=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
const kmAdd=(mo,n)=>{ const [y,m]=mo.split("-").map(Number); return kmMo(new Date(y,m-1+n,1)); };
const kmLabel=mo=>{ const [y,m]=mo.split("-").map(Number); return MTH[m-1]+" "+(y+543); };
const kmFmt=n=>n===null||n===undefined?"–":(Math.round(n*100)/100).toLocaleString("en-US",{maximumFractionDigits:2});
const kmEnt=(k,mo)=>(k.hist&&k.hist[mo])||null;
const kmHas=(k,mo)=>{ const e=kmEnt(k,mo); return !!(e&&String(e.v==null?"":e.v).trim()!==""); };
const kmRows=k=>Object.keys(k.hist||{}).sort().map(mo=>[mo,phNum(k.hist[mo].v)]).filter(x=>x[1]!==null);
function kmActAt(k,mo){ const r=kmRows(k).filter(x=>x[0]<=mo); if(!r.length)return null;
 if(k.ptype==="cum")return r.reduce((s,x)=>s+x[1],0);
 if(k.ptype==="month"){ const e=r.find(x=>x[0]===mo); return e?e[1]:null; }
 return r[r.length-1][1]; }
function kmSync(k){ const r=kmRows(k); if(!r.length)return; const a=k.ptype==="cum"?r.reduce((s,x)=>s+x[1],0):r[r.length-1][1]; k.actual=String(Math.round(a*100)/100); }
function kmAvg(ks,t,mo){ return phWavg(ks,k=>phKpiPct(k,t,mo)); }
// ถึงรอบวัดเดือนนี้ไหม: m=ทุกเดือน · q=ทุก 3 เดือน (ก.พ./พ.ค./ส.ค./พ.ย.) · once=เดือนสิ้นสุดโปรเจค
function kmDue(k,mo,t){ const f=k.freq||"m"; if(f==="m")return true; if(f==="q")return +mo.slice(5)%3===2; return !!(t&&t.pend&&kmMo(phD0(t.pend))===mo); }
const kmNeed=(g,mo,t)=>g.ks.filter(k=>!k.calc&&(kmDue(k,mo,t)||kmHas(k,mo)));
function kmPass(k,mo){ const r=kmRows(k).filter(x=>x[0]<=mo); return [r.filter(x=>{ const p=phKpiPct({target:k.target,dir:k.dir,actual:String(x[1])}); return p!==null&&p>=100; }).length,r.length]; }
function kmSpark(k,mo){ const a=kmRows(k).filter(x=>x[0]<=mo).slice(-6).map(x=>x[1]); if(a.length<2)return "";
 const w=64,h=18,p=2,mn=Math.min(...a),mx=Math.max(...a),sp=mx-mn||1;
 const pts=a.map((v,i)=>[p+i*(w-2*p)/(a.length-1),h-p-((v-mn)/sp)*(h-2*p)]);
 return `<svg class="km-sp" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><polyline fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" points="${pts.map(q=>q[0].toFixed(1)+","+q[1].toFixed(1)).join(" ")}"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="2.2" fill="var(--accent)"/></svg>`; }

// ---------- เลือกโปรเจค / ข้อมูลทำงาน ----------
function kmSel(L){ let t=L.find(x=>x._id===KM.id);
 if(!t){ t=L.find(x=>(x.kteams||[]).length)||L.find(x=>(x.kpis||[]).length)||L[0]; KM.id=t?t._id:null; }
 return t; }
function kmData(t){ if(!KM.kp||KM.pid!==t._id||(!KM.tm&&!KM.dirty)){ KM.kp=JSON.parse(JSON.stringify(t.kpis||[])); KM.kp.forEach(k=>{ if(!k.id)k.id="k"+Math.random().toString(36).slice(2,8); }); KM.pid=t._id; }
 return Object.assign({},t,{kpis:KM.kp}); }
const kmParent=(t,k)=>(t.kpis||[]).find(x=>!x.team&&x.id===k.parent);

// ---------- ส่วนแสดงผล ----------
function kmChip(g,f,n){ const c=f===n?"ok":f===0?"bad":"mid"; return {c,h:`<i></i>${esc(g.name||"ทีม")} ${f}/${n}${f===n?" ✓":f===0?" ยังไม่ส่ง":""}`}; }
function kmAcell(k,t,mo){ const p=phKpiPct(k,t,mo); let tx="";
 if(k.calc)tx="จากทีมย่อย";
 else if(k.ptype==="cum"){ const a=kmActAt(k,mo); tx=a===null?"":"สะสม "+kmFmt(a)+(k.unit?" "+k.unit:""); }
 else if(k.ptype==="month"){ const [a,b]=kmPass(k,mo); tx=b?"ผ่านเป้า "+a+"/"+b+" เดือน":""; }
return `<div class="ph-bar sm"><i style="width:${Math.min(100,p||0)}%;background:${phKc(p)}"></i></div><b style="color:${phKc(p)}">${p===null?"–":p+"%"}</b>${!k.team&&p!==null?`<span class="km-sc">Score ${phScore(p)}</span>`:""}${tx?`<small>${esc(tx)}</small>`:""}`; }
function kmRow(k,t,mo){ const e=kmEnt(k,mo), pe=kmEnt(k,kmAdd(mo,-1)), pa=kmParent(t,k), kids=(t.kpis||[]).filter(x=>x.team&&x.parent===k.id).length;
 return `<div class="km-r${k.calc?" calc":""}" data-kr="${esc(k.id)}"><div class="km-n"${k.def?` title="${esc(k.def)}"`:""}><b>${k.code?`<em class="km-code">${esc(k.code)}</em> `:""}${esc(k.name||"(ยังไม่ตั้งชื่อ)")}</b><small>${k.base!==""&&k.base!=null?"Baseline "+esc(k.base)+" → ":""}เป้า ${k.target!==""&&k.target!=null?esc(k.target)+" "+esc(k.unit||""):"–"} ${k.dir==="down"?"↓":"↑"} · ${KMS[k.ptype||"last"]}${k.w?" · น้ำหนัก "+esc(k.w)+"%":""}${(k.freq||"m")!=="m"?" · วัด"+(k.freq==="q"?"ทุก 3 เดือน":"ครั้งเดียว"):""}${k.team?` · → ${pa?esc(pa.name):`<em class="warn">ยังไม่ผูก KPI หลัก</em>`}`:""}</small>${k.src||k.dep?`<small class="km-src">${k.src?"ข้อมูลจาก "+esc(k.src):""}${k.src&&k.dep?" · ":""}${k.dep?"ร่วมกับ "+esc(k.dep):""}</small>`:""}${!k.calc&&!kmDue(k,mo,t)?`<small class="km-nd">ไม่ถึงรอบวัดเดือนนี้ (กรอกได้ถ้ามีข้อมูล)</small>`:""}</div>
${k.calc?`<div class="km-calc">คำนวณจากทีมย่อย ${kids} ข้อ ไม่ต้องกรอก</div>`
 :`<div class="km-p"><small>เดือนก่อน</small><b>${pe&&String(pe.v).trim()!==""?esc(pe.v):"–"}</b>${kmSpark(k,mo)}</div><input class="ph-in km-v" inputmode="decimal" data-kmv="${esc(k.id)}" value="${esc(e?e.v:"")}" placeholder="ผลเดือนนี้"><input class="ph-in km-nt" data-kmn="${esc(k.id)}" value="${esc(e&&e.n||"")}" placeholder="หมายเหตุ / อุปสรรค">`}
<div class="km-a" data-kma="${esc(k.id)}">${kmAcell(k,t,mo)}</div></div>`; }
function kmMap(t){ const G=phKGroups(t), mains=G[0].ks, teams=G.slice(1);
 if(!mains.length)return `<div class="card"><h2>ตารางโยง KPI</h2><div class="ph-hint">ยังไม่มี KPI หลักของโปรเจค — เพิ่มในกลุ่ม “ภาพรวมโปรเจค” (เปิดโปรเจคจากหน้าการ์ด) แล้วผูก KPI ของทีมย่อยเข้ามา</div></div>`;
 const orph=teams.flatMap(g=>g.ks.filter(k=>!mains.some(m=>m.id===k.parent)).map(k=>({g,k}))), un=mains.filter(m=>!(t.kpis||[]).some(x=>x.team&&x.parent===m.id));
 return `<div class="card"><h2>ตารางโยง KPI <small>KPI หลัก × ทีมย่อย · ช่องที่ขีด “—” = ทีมนั้นยังไม่มี KPI ที่สนับสนุนข้อนี้</small></h2>
<div class="km-mapw"><table class="km-map"><thead><tr><th>KPI หลัก</th><th>ผลรวม</th>${teams.map(g=>`<th>${esc(g.name||"ทีม")}</th>`).join("")}</tr></thead><tbody>
${mains.map(m=>{ const p=phKpiPct(m,t); return `<tr><td>${esc(m.name||"(ยังไม่ตั้งชื่อ)")}</td><td style="color:${phKc(p)};font-weight:700">${p===null?"–":p+"%"}</td>${teams.map(g=>{ const ks=g.ks.filter(k=>k.parent===m.id); if(!ks.length)return `<td class="gap">—</td>`; const a=kmAvg(ks,t); return `<td><b>${ks.length}</b> ข้อ <span style="color:${phKc(a)}">${a===null?"":a+"%"}</span></td>`; }).join("")}</tr>`; }).join("")}</tbody></table></div>
${un.length?`<div class="km-warn">KPI หลักที่ยังไม่มีทีมไหนสนับสนุน: <b>${un.map(m=>esc(m.name||"(ไม่มีชื่อ)")).join(", ")}</b></div>`:""}
${orph.length?`<div class="km-warn">KPI ทีมย่อยที่ยังไม่ผูก KPI หลัก (${orph.length} ข้อ): ${orph.slice(0,12).map(x=>esc((x.g.name||"ทีม")+" › "+(x.k.name||"ไม่มีชื่อ"))).join(" · ")}${orph.length>12?" …":""}<br><small>เปิดโปรเจค → ช่อง “สนับสนุน KPI หลัก” ในแต่ละข้อ (หรือใช้ปุ่ม วางหลายข้อ แล้วเลือกผูกทั้งก้อน)</small></div>`:`<div class="km-ok">✓ KPI ทุกข้อของทีมย่อยผูกกับ KPI หลักแล้ว</div>`}</div>`; }
function kmView(L){
 if(!L.length)return `<div class="card"><div class="empty">ไม่มีโปรเจคที่กำลังทำ</div></div>`;
 const t0=kmSel(L); if(!KM.mo)KM.mo=kmMo(new Date());
 const t=kmData(t0), mo=KM.mo, G=phKGroups(t), has=(t.kpis||[]).length;
 const chips=G.map(g=>{ const nd=kmNeed(g,mo,t), f=nd.filter(k=>kmHas(k,mo)).length; if(!nd.length)return ""; const c=kmChip(g,f,nd.length); return `<span class="km-st ${c.c}" data-kmst="${g.id}">${c.h}</span>`; }).join("");
 const secs=G.filter(g=>g.ks.length).map(g=>{ const nd=kmNeed(g,mo,t), f=nd.filter(k=>kmHas(k,mo)).length, av=kmAvg(g.ks,t,mo);
  return `<div class="card km-g" data-kg="${g.id}"><div class="km-gh" data-kmgt="${g.id}" role="button" tabindex="0"><i class="km-ar">${KM.shut[g.id]?"▸":"▾"}</i><b>${esc(g.name||"ทีม")}</b>${nd.length?`<span class="km-gs" data-kgs="${g.id}">ส่งแล้ว ${f}/${nd.length}</span>`:""}<span class="ph-kga" data-kga="${g.id}" style="color:${phKc(av)}">${av===null?"–":av+"%"}</span></div>
${KM.shut[g.id]?"":`<div class="km-hd"><span>KPI</span><span>เดือนก่อน</span><span>ผลเดือนนี้</span><span>หมายเหตุ</span><span>เทียบเป้า</span></div>${g.ks.map(k=>kmRow(k,t,mo)).join("")}`}</div>`; }).join("");
 return `<div class="card km-top"><div class="km-ctl">${L.length>1?`<select class="ph-in km-pj" data-kmp>${L.map(x=>`<option value="${x._id}"${x._id===t._id?" selected":""}>${esc(x.title)}</option>`).join("")}</select>`:`<b class="km-pt">${esc(t.title)}</b>`}
<div class="km-mo"><button class="btn ghost sm" data-kmmo="-1" aria-label="เดือนก่อน">◀</button><b>${kmLabel(mo)}</b><button class="btn ghost sm" data-kmmo="1" aria-label="เดือนถัดไป">▶</button><button class="btn ghost sm" data-kmmo="now">เดือนนี้</button></div></div>
${chips?`<div class="km-chips">${chips}</div>`:""}
<div class="km-act"><button class="btn ghost sm" data-kmmap>${KM.map?"ซ่อน":"ดู"}ตารางโยง KPI</button><button class="btn sm" data-kmsum>สรุปประจำเดือน</button></div>
<div class="ph-hint">กรอกผลของเดือนที่เลือกได้เลย บันทึกอัตโนมัติ · ใส่ “-” = เดือนนี้ไม่มีข้อมูล (นับว่าส่งแล้ว) · ตั้งชนิดเป้าและผูก KPI หลักได้ในหน้าโปรเจค</div></div>
${KM.map?kmMap(t):""}
${has?secs:`<div class="card"><div class="empty">โปรเจคนี้ยังไม่มี KPI — เปิดโปรเจคจากหน้าการ์ดเพื่อเพิ่ม KPI ภาพรวมและทีมย่อย</div></div>`}`; }

// ---------- กรอก / บันทึก ----------
function kmInput(n){ const f=n.dataset.kmv!==undefined?"v":"n", id=f==="v"?n.dataset.kmv:n.dataset.kmn, k=(KM.kp||[]).find(x=>x.id===id); if(!k)return;
 const mo=KM.mo, had=k.hist&&Object.keys(k.hist).length; const h=(k.hist=k.hist||{}); const e=h[mo]||(h[mo]={v:"",n:""}); e[f]=n.value;
 if(!String(e.v).trim()&&!String(e.n||"").trim())delete h[mo]; if(!Object.keys(h).length)delete k.hist;
 kmSync(k); if(had&&!kmRows(k).length)k.actual="";
 KM.live={f,id,val:n.value}; KM.dirty=true; KM.ver++; clearTimeout(KM.tm); KM.tm=setTimeout(kmSave,600); kmRefresh(); }
async function kmSave(){ clearTimeout(KM.tm); KM.tm=0; const id=KM.pid, kp=KM.kp; if(!id||!kp)return; const v=KM.ver;
 await phSave(id,{kpis:JSON.parse(JSON.stringify(kp))}); if(v===KM.ver){ KM.dirty=false; setFoot("บันทึก KPI แล้ว"); } }
function kmRefresh(){ const t0=items.find(x=>x._id===KM.pid); if(!t0)return; const t=kmData(t0), mo=KM.mo, G=phKGroups(t), $=s=>document.querySelector(s);
 G.forEach(g=>{ g.ks.forEach(k=>{ const c=$('[data-kma="'+k.id+'"]'); if(c)c.innerHTML=kmAcell(k,t,mo); });
  const nd=kmNeed(g,mo,t), f=nd.filter(k=>kmHas(k,mo)).length, av=kmAvg(g.ks,t,mo);
  const st=$('[data-kmst="'+g.id+'"]'); if(st&&nd.length){ const c=kmChip(g,f,nd.length); st.className="km-st "+c.c; st.innerHTML=c.h; }
  const gs=$('[data-kgs="'+g.id+'"]'); if(gs)gs.textContent="ส่งแล้ว "+f+"/"+nd.length;
  const ga=$('[data-kga="'+g.id+'"]'); if(ga){ ga.textContent=av===null?"–":av+"%"; ga.style.color=phKc(av); } }); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&KM.tm)kmSave(); });

// ---------- สรุปประจำเดือน ----------
function kmSumData(t,mo){ const G=phKGroups(t), prev=kmAdd(mo,-1), mains=G[0].ks, teams=G.slice(1);
 const sub=m=>teams.map(g=>({g,ks:g.ks.filter(k=>k.parent===m.id)})).filter(x=>x.ks.length);
 const nd=g=>kmNeed(g,mo,t);
 return {
  เดือน:kmLabel(mo),
  การส่งข้อมูล:G.filter(g=>nd(g).length).map(g=>({ทีม:g.name,ส่งแล้ว:nd(g).filter(k=>kmHas(k,mo)).length,ทั้งหมด:nd(g).length})),
  KPIหลัก:mains.map(m=>{ const p=phKpiPct(m,t,mo), pp=phKpiPct(m,t,prev), a=kmActAt(m,mo); return {ชื่อ:m.name,เป้า:m.target,หน่วย:m.unit||"",ชนิด:KMS[m.ptype||"last"],ผลเดือนนี้:m.calc?"จากทีมย่อย":(a===null?"":kmFmt(a)),เปอร์เซ็นต์:p,เดือนก่อน:pp,ทีมที่สนับสนุน:sub(m).map(x=>({ทีม:x.g.name,ข้อ:x.ks.length,เฉลี่ย:kmAvg(x.ks,t,mo)}))}; }),
  ทีมย่อย:teams.map(g=>({ทีม:g.name,เฉลี่ย:kmAvg(g.ks,t,mo)})),
  ต่ำกว่าเป้า:G.flatMap(g=>g.ks.filter(k=>!k.calc).map(k=>({g,k,p:phKpiPct(k,t,mo)}))).filter(x=>x.p!==null&&x.p<80&&kmHas(x.k,mo)).map(x=>({ทีม:x.g.name,ชื่อ:x.k.name,ผล:(kmEnt(x.k,mo)||{}).v,เป้า:x.k.target,หน่วย:x.k.unit||"",เปอร์เซ็นต์:x.p,หมายเหตุ:(kmEnt(x.k,mo)||{}).n||""})),
  หมายเหตุทีม:G.flatMap(g=>g.ks.map(k=>({g,k,n:((kmEnt(k,mo)||{}).n||"").trim()}))).filter(x=>x.n).map(x=>({ทีม:x.g.name,ชื่อ:x.k.name,ข้อความ:x.n})),
  ยังไม่ผูกKPIหลัก:teams.reduce((s,g)=>s+g.ks.filter(k=>!mains.some(m=>m.id===k.parent)).length,0),
  KPIหลักที่ไม่มีทีมสนับสนุน:mains.filter(m=>!sub(m).length).map(m=>m.name)}; }
function kmSumText(t,mo){ const D=kmSumData(t,mo), L=[], d=x=>x===null||x===undefined?"":x;
 L.push("สรุป KPI "+t.title+" ประจำเดือน "+D.เดือน, "");
 const miss=D.การส่งข้อมูล.filter(x=>x.ส่งแล้ว<x.ทั้งหมด);
 L.push("การส่งข้อมูล: "+(D.การส่งข้อมูล.map(x=>x.ทีม+" "+x.ส่งแล้ว+"/"+x.ทั้งหมด+(x.ส่งแล้ว===x.ทั้งหมด?" ✓":"")).join(" · ")||"—"));
 if(miss.length)L.push("ยังส่งไม่ครบ: "+miss.map(x=>x.ทีม+" (ค้าง "+(x.ทั้งหมด-x.ส่งแล้ว)+")").join(", "));
 if(D.KPIหลัก.length){ L.push("","KPI หลัก:"); D.KPIหลัก.forEach(m=>{ const dl=(m.เปอร์เซ็นต์!==null&&m.เดือนก่อน!==null)?(m.เปอร์เซ็นต์>m.เดือนก่อน?" ▲ +"+(m.เปอร์เซ็นต์-m.เดือนก่อน):m.เปอร์เซ็นต์<m.เดือนก่อน?" ▼ "+(m.เปอร์เซ็นต์-m.เดือนก่อน):" ▬ เท่าเดือนก่อน")+" จากเดือนก่อน":"";
  L.push("• "+m.ชื่อ+" — "+(m.ผลเดือนนี้!==""?m.ผลเดือนนี้+" / ":"เป้า ")+d(m.เป้า)+" "+m.หน่วย+" ("+(m.เปอร์เซ็นต์===null?"ยังไม่มีข้อมูล":m.เปอร์เซ็นต์+"%")+")"+dl);
  if(m.ทีมที่สนับสนุน.length)L.push("   สนับสนุนโดย: "+m.ทีมที่สนับสนุน.map(x=>x.ทีม+" ("+x.ข้อ+" ข้อ, "+(x.เฉลี่ย===null?"–":x.เฉลี่ย+"%")+")").join(" · ")); }); }
 if(D.ทีมย่อย.length)L.push("","ทีมย่อย (% เฉลี่ยของเดือน): "+D.ทีมย่อย.map(x=>x.ทีม+" "+(x.เฉลี่ย===null?"–":x.เฉลี่ย+"%")).join(" · "));
 if(D.ต่ำกว่าเป้า.length)L.push("","KPI ต่ำกว่าเป้า (<80%):",...D.ต่ำกว่าเป้า.slice(0,15).map(x=>"• "+x.ทีม+" › "+x.ชื่อ+" "+d(x.ผล)+"/"+d(x.เป้า)+" "+x.หน่วย+" ("+x.เปอร์เซ็นต์+"%)"+(x.หมายเหตุ?" — "+x.หมายเหตุ:"")));
 const nt=D.หมายเหตุทีม.filter(x=>!D.ต่ำกว่าเป้า.some(y=>y.ทีม===x.ทีม&&y.ชื่อ===x.ชื่อ));
 if(nt.length)L.push("","หมายเหตุ/อุปสรรคจากทีม:",...nt.slice(0,12).map(x=>"• "+x.ทีม+" › "+x.ชื่อ+": "+x.ข้อความ));
 if(D.KPIหลักที่ไม่มีทีมสนับสนุน.length)L.push("","⚠ KPI หลักที่ยังไม่มีทีมไหนสนับสนุน: "+D.KPIหลักที่ไม่มีทีมสนับสนุน.join(", "));
 if(D.ยังไม่ผูกKPIหลัก)L.push("⚠ KPI ทีมย่อยที่ยังไม่ผูก KPI หลัก: "+D.ยังไม่ผูกKPIหลัก+" ข้อ");
 return L.join("\n"); }
async function kmAi(box,btn,t,mo){
 btn.disabled=true; btn.textContent="AI กำลังเรียบเรียง…";
 try{
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),70000);
  const sys="คุณคือผู้ช่วยฝ่าย HR ของ LeKise Group เขียนสรุป KPI ประจำเดือนของโปรเจคเสนอผู้บริหาร เป็นภาษาไทย กระชับ ไม่เกิน 250 คำ โครงสร้าง: (1) ภาพรวม KPI หลักเทียบเดือนก่อน (2) ทีมที่ไปได้ดี / ทีมที่ต้องช่วย และทีมที่ยังส่งข้อมูลไม่ครบ (3) อุปสรรคที่ทีมแจ้ง (4) สิ่งที่ผู้บริหารควรตัดสินใจหรือช่วยปลดล็อก ใช้เฉพาะข้อมูลที่ให้ ห้ามแต่งตัวเลขหรือข้อเท็จจริงเพิ่ม ถ้าข้อมูลไม่พอให้บอกตรง ๆ";
  const r=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:sys,context:"",max_tokens:1400,messages:[{role:"user",content:"โปรเจค: "+t.title+"\nข้อมูล KPI (JSON):\n"+JSON.stringify(kmSumData(t,mo)).slice(0,14000)}]})});
  clearTimeout(tm); const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(r.status===503?"ยังไม่ได้ตั้งค่า AI ที่ Vercel (ANTHROPIC_API_KEY) — ใช้สรุปอัตโนมัติด้านบนแทนได้ค่ะ":(j.message||("ผิดพลาด "+r.status)));
  if(!j.text)throw new Error("AI ไม่ตอบกลับ");
  box.value=j.text.trim(); btn.textContent="เรียบเรียงใหม่ด้วย AI";
 }catch(e){ tell("<b>AI สรุปไม่สำเร็จ</b><div class=\"hint\" style=\"line-height:1.7\">"+esc(e&&e.name==="AbortError"?"รอนานเกินไป ลองใหม่ค่ะ":(e.message||String(e)))+"</div>"); btn.textContent="ให้ AI เรียบเรียง"; }
 btn.disabled=false; }
function kmSummary(){ const t0=items.find(x=>x._id===KM.pid); if(!t0)return; if(KM.tm)kmSave(); const t=kmData(t0), mo=KM.mo;
 const d=xDlg("kmsum","min(760px,96vw)");
 d.innerHTML=`<div class="dlg-h">สรุป KPI ประจำเดือน ${kmLabel(mo)}</div><div class="dlg-b" style="grid-template-columns:1fr"><div class="hint" style="margin:0">สร้างจากข้อมูลที่กรอกจริงทันที (แก้ไขได้) — กด “ให้ AI เรียบเรียง” เพื่อให้เป็นภาษาผู้บริหาร (ต้องตั้ง AI ที่ Vercel ไว้)</div><textarea class="ph-in" id="kmsum-t" rows="18"></textarea></div>
<div class="dlg-f"><button class="btn ghost" id="kmsum-ai">ให้ AI เรียบเรียง</button><button class="btn ghost" id="kmsum-cp">คัดลอก</button><button class="btn" id="kmsum-x">ปิด</button></div>`;
 el("kmsum-t").value=kmSumText(t,mo);
 el("kmsum-x").onclick=()=>d.close();
 el("kmsum-ai").onclick=()=>kmAi(el("kmsum-t"),el("kmsum-ai"),t,mo);
 el("kmsum-cp").onclick=async()=>{ const v=el("kmsum-t").value; try{ await navigator.clipboard.writeText(v); }catch(e){ el("kmsum-t").select(); document.execCommand("copy"); } setFoot("คัดลอกสรุปแล้ว"); };
 d.showModal(); }

// ---------- wire ----------
function kmWire(){
 document.querySelectorAll("[data-kmmo]").forEach(n=>n.onclick=()=>{ KM.live=null; const v=n.dataset.kmmo; KM.mo=v==="now"?kmMo(new Date()):kmAdd(KM.mo,+v); render(); });
 document.querySelectorAll("[data-kmp]").forEach(n=>n.onchange=()=>{ KM.live=null; if(KM.tm)kmSave(); KM.id=n.value; KM.kp=null; render(); });
 document.querySelectorAll("[data-kmgt]").forEach(n=>n.onclick=()=>{ KM.live=null; KM.shut[n.dataset.kmgt]=!KM.shut[n.dataset.kmgt]; render(); });
 document.querySelectorAll("[data-kmmap]").forEach(n=>n.onclick=()=>{ KM.live=null; KM.map=!KM.map; render(); });
 document.querySelectorAll("[data-kmsum]").forEach(n=>n.onclick=()=>{ KM.live=null; kmSummary(); });
 document.querySelectorAll("[data-kmv],[data-kmn]").forEach(n=>{ n.oninput=()=>kmInput(n);
  n.onfocus=()=>{ KM.live={f:n.dataset.kmv!==undefined?"v":"n",id:n.dataset.kmv||n.dataset.kmn,val:n.value}; };
  n.onblur=e=>{ if(e.relatedTarget&&!e.relatedTarget.matches("[data-kmv],[data-kmn]"))KM.live=null; };
  n.onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); const a=[...document.querySelectorAll("[data-kmv]")], i=a.indexOf(n); if(n.dataset.kmv!==undefined&&a[i+1])a[i+1].focus(); else n.blur(); } }; });
 // คืนโฟกัสถ้าหน้าถูกวาดใหม่ระหว่างพิมพ์ (เช่น ข้อมูลซิงก์กลับมา)
 const L=KM.live; if(L){ const n=document.querySelector("[data-km"+L.f+'="'+L.id+'"]'); if(n&&document.activeElement!==n){ if(n.value!==L.val)n.value=L.val; n.focus(); try{ n.setSelectionRange(n.value.length,n.value.length); }catch(e){} } }
}
