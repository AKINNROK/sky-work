// ===== บันทึกการประชุมย้อนหลัง: ไทม์ไลน์แยกตามการประชุม (v14.14.67) =====
// หน้า การประชุม → การ์ด "บันทึกการประชุมย้อนหลัง" · เลือกการประชุม (HAI Meeting, HR-Weekly …) → ไทม์ไลน์ทุกครั้ง ใหม่→เก่า พร้อมสรุปมติ
// เปิดบันทึก → แถบด้านบนมี ‹ ครั้งก่อน · ครั้งถัดไป › · การ์ดการประชุมมีปุ่ม "📚 ไทม์ไลน์บันทึก"
const MTL={sel:(()=>{ try{ return localStorage.getItem("sw-mtl")||""; }catch(e){ return ""; } })(),q:""};
const MTL_K="บันทึกการประชุม";
const mtlDate=n=>n.mtgd||n.date||(n.opened||"").slice(0,10)||"";
function mtlItems(){ return items.filter(t=>isMeet(t)&&!isTrain(t)); }
function mtlKey(n,ms){ ms=ms||mtlItems();
 if(n.mtg&&ms.some(t=>t._id===n.mtg))return n.mtg;
 const tt=(n.title||"").toLowerCase(); let best=null;
 ms.forEach(t=>{ const s=(t.title||"").trim().toLowerCase(); if(s.length>=3&&tt.includes(s)&&(!best||s.length>best.title.length))best=t; });
 return best?best._id:"_other"; }
function mtlGroups(){ const ms=mtlItems(), G=new Map();
 notes.filter(n=>n.kind!==INKKIND&&(n.mtg||n.kind===MTL_K)).forEach(n=>{ const k=mtlKey(n,ms); if(!G.has(k)){ const t=ms.find(x=>x._id===k); G.set(k,{key:k,t,label:t?t.title:"ประชุมอื่น ๆ (ไม่ได้ผูกกับการประชุม)",list:[]}); } G.get(k).list.push(n); });
 const out=[...G.values()]; out.forEach(g=>g.list.sort((a,b)=>mtlDate(a)<mtlDate(b)?1:mtlDate(a)>mtlDate(b)?-1:0)); out.forEach(g=>g.last=mtlDate(g.list[0]));
 return out.sort((a,b)=>a.key==="_other"?1:b.key==="_other"?-1:(a.last<b.last?1:-1)); }
function mtlSnip(n){ const raw=n.fmt==="h"?ntClean(n.body||""):esc(n.body||"").replace(/\n/g,"<br>"); const d=document.createElement("div"); d.innerHTML=raw;
 const hs=[...d.querySelectorAll("h2,h3,p,div,li,b,strong")].filter(x=>/มติ|ข้อสรุป|สรุป/.test(x.textContent)&&x.textContent.length<60);
 let txt=""; const h=hs[0]&&(hs[0].closest("h2,h3,p,div,li")||hs[0]);
 if(h&&h!==d){ let x=h.nextElementSibling, k=0; while(x&&k<6&&!/^H[23]$/.test(x.tagName)){ txt+=" "+x.textContent; x=x.nextElementSibling; k++; } txt=txt.trim(); if(txt)txt="มติ: "+txt; }
 if(!txt)txt=d.textContent.replace(/^\s*ประชุม:.*?(ผู้เข้าร่วม:[^\n]*)?/,"");
 txt=txt.replace(/\s+/g," ").trim(); return txt.length>180?txt.slice(0,180)+"…":txt; }
const mtlDay=iso=>{ if(!iso)return{d:"—",m:""}; const x=new Date(iso+"T00:00:00"); return {d:x.getDate(),m:MTH[x.getMonth()]+" "+String((x.getFullYear()+543)%100).padStart(2,"0")}; };
function mtlCard(){ const G=mtlGroups(); if(!G.length)return `<div class="card span4" id="mtl"><h2>📚 บันทึกการประชุมย้อนหลัง</h2><div class="empty">ยังไม่มีบันทึกการประชุม — เปิดการประชุม (เช่น HAI Meeting) แล้วกด “📝 จดบันทึกประชุม” บันทึกจะมารวมเป็นไทม์ไลน์ที่นี่</div></div>`;
 let g=G.find(x=>x.key===MTL.sel)||G[0]; const q=MTL.q.trim().toLowerCase();
 const L=g.list.filter(n=>!q||((n.title||"")+" "+ntPlain(n)).toLowerCase().includes(q));
 const chips=G.map(x=>`<button type="button" class="mtl-chip${x===g?" on":""}" data-mtl="${esc(x.key)}">${esc(x.label)} <b>${x.list.length}</b></button>`).join("");
 const rows=L.map((n,i)=>{ const D=mtlDay(mtlDate(n)), s=mtlSnip(n); return `<div class="mtl-it" data-mtlo="${n._id}" role="button" tabindex="0">
  <div class="mtl-d"><b>${D.d}</b><span>${esc(D.m)}</span></div><i class="mtl-dot${i===0&&!q?" new":""}"></i>
  <div class="mtl-tx"><div class="t1">${esc(n.title||"ไม่มีชื่อ")}${i===0&&!q?' <span class="tag sky">ล่าสุด</span>':""}</div>${s?`<div class="t2">${esc(s)}</div>`:""}</div></div>`; }).join("");
 return `<div class="card span4" id="mtl"><h2>📚 บันทึกการประชุมย้อนหลัง <small>เลือกการประชุมเพื่อดูไทม์ไลน์ทุกครั้ง · ${notes.filter(n=>n.mtg||n.kind===MTL_K).length} บันทึก</small></h2>
 <div class="mtl-chips">${chips}</div>
 <div class="mtl-bar"><b>${esc(g.label)}</b><span>${g.list.length} ครั้ง${g.list.length?" · ล่าสุด "+esc(fmtDate(g.last))+" "+(new Date(g.last).getFullYear()+543):""}</span>
  <input type="search" id="mtl-q" placeholder="ค้นในบันทึกของการประชุมนี้" value="${esc(MTL.q)}">
  ${g.t?`<button type="button" class="btn ghost sm" data-mtlcard="${g.t._id}">เปิดการประชุม / จดครั้งใหม่</button>`:""}</div>
 <div class="mtl-tl">${rows||`<div class="empty">ไม่พบบันทึกที่ตรงกับ “${esc(MTL.q)}”</div>`}</div></div>`; }
{ const _m=meet; meet=function(){ let h=_m.apply(this,arguments); try{ h=h.replace('<div class="toolbar">','<div class="toolbar"><button type="button" class="btn ghost sm" data-mtljump>📚 บันทึกประชุมย้อนหลัง</button> '); const i=h.lastIndexOf("</div>"); return i>0?h.slice(0,i)+mtlCard()+h.slice(i):h+mtlCard(); }catch(e){ console.error(e); return h; } }; }
function mtlPick(k){ MTL.sel=k; MTL.q=""; try{ localStorage.setItem("sw-mtl",k); }catch(e){} const c=el("mtl"); if(c){ const t=document.createElement("div"); t.innerHTML=mtlCard(); c.replaceWith(t.firstElementChild); mtlWire(); } }
function mtlWire(){ const q=el("mtl-q"); if(q&&!q._w){ q._w=1; q.addEventListener("input",()=>{ MTL.q=q.value; const pos=q.selectionStart; const c=el("mtl"), t=document.createElement("div"); t.innerHTML=mtlCard(); c.replaceWith(t.firstElementChild); mtlWire(); const nq=el("mtl-q"); nq.focus(); try{ nq.setSelectionRange(pos,pos); }catch(e){} }); } }
function mtlGo(k){ const d=el("cardlg"); if(d&&d.open)d.close(); const v=el("nvdlg"); if(v&&v.open)v.close(); MTL.sel=k; MTL.q=""; try{ localStorage.setItem("sw-mtl",k); }catch(e){}
 view="meet"; renderNav(); render(); setTimeout(()=>{ const c=el("mtl"); if(c)c.scrollIntoView({behavior:"smooth",block:"start"}); },60); }
document.addEventListener("click",e=>{ const t=e.target; if(!t.closest)return;
 if(t.closest("[data-mtljump]")){ const m=el("mtl"); if(m)m.scrollIntoView({behavior:"smooth",block:"start"}); return; }
 const c=t.closest("[data-mtl]"); if(c){ mtlPick(c.dataset.mtl); return; }
 const o=t.closest("[data-mtlo]"); if(o){ const n=notes.find(x=>x._id===o.dataset.mtlo); if(n)viewNote(n); return; }
 const k=t.closest("[data-mtlcard]"); if(k){ const it=items.find(x=>x._id===k.dataset.mtlcard); if(it)openCard(it); } });
document.addEventListener("keydown",e=>{ if(e.key!=="Enter")return; const o=e.target.closest&&e.target.closest("[data-mtlo]"); if(o)o.click(); });
{ const _w=wire; wire=function(){ _w.apply(this,arguments); if(view==="meet")mtlWire(); }; }
// เปิดบันทึก → ครั้งก่อน / ครั้งถัดไป / ไทม์ไลน์
{ const _v=viewNote; viewNote=function(n){ const r=_v.apply(this,arguments); try{ if(!n||!(n.mtg||n.kind===MTL_K))return r; const k=mtlKey(n), g=mtlGroups().find(x=>x.key===k); if(!g)return r;
  const i=g.list.findIndex(x=>x._id===n._id), older=g.list[i+1], newer=g.list[i-1];
  let x=el("nv-mtg"); if(!x){ const b=el("nvb"); if(!b)return r; x=document.createElement("div"); x.id="nv-mtg"; x.className="nv-mtg"; x.innerHTML=`📚 <b>${esc(g.label)}</b>`; b.parentNode.insertBefore(x,b); }
  const nav=document.createElement("span"); nav.className="mtl-nav";
  nav.innerHTML=`<button type="button" class="btn ghost sm" ${older?"":"disabled"} title="${older?esc(older.title||""):"ไม่มีครั้งก่อนหน้า"}">‹ ครั้งก่อน</button><span class="mtl-pos">${i+1>0?(g.list.length-i)+"/"+g.list.length:""}</span><button type="button" class="btn ghost sm" ${newer?"":"disabled"} title="${newer?esc(newer.title||""):"นี่คือครั้งล่าสุด"}">ครั้งถัดไป ›</button><button type="button" class="btn ghost sm">ไทม์ไลน์</button>`;
  const bs=nav.querySelectorAll("button"); bs[0].onclick=()=>older&&viewNote(older); bs[1].onclick=()=>newer&&viewNote(newer); bs[2].onclick=()=>mtlGo(k);
  const last=x.querySelector("button:last-of-type"); x.insertBefore(nav,last&&last.parentNode===x?last:null); }catch(e){ console.error(e); } return r; }; }
// การ์ดการประชุม → ปุ่มไทม์ไลน์
{ const _c=openCard; openCard=function(t){ const r=_c.apply(this,arguments); try{ if(!t||!isMeet(t)||isTrain(t))return r; const f=document.querySelector("#cardlg .dlg-f"); if(!f)return r; f.querySelectorAll(".mtlbtn").forEach(b=>b.remove());
  const g=mtlGroups().find(x=>x.key===t._id); if(!g||!g.list.length)return r;
  const b=document.createElement("button"); b.type="button"; b.className="btn ghost xcard mtlbtn"; b.textContent="📚 ไทม์ไลน์บันทึก ("+g.list.length+")"; b.onclick=()=>mtlGo(t._id); f.insertBefore(b,el("vc-edit2")); }catch(e){ console.error(e); } return r; }; }
