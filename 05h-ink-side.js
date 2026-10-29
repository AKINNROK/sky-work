// ===== สมุดเขียนมือ: แผงข้าง (หน้าย่อ · สารบัญ/บุ๊กมาร์ก · ค้นหา) + โหมดนำเสนอ + ปกสมุด =====
const INK_COVERS=["#124E82","#0f766e","#b45309","#9d174d","#6d28d9","#374151","#15803d","#be123c"];
ink.sideTab="pages"; ink.bm=[];
const inkSideEl=()=>el("ink-side");
function inkSideClose(){ const s=inkSideEl(); if(s)s.hidden=true; const b=el("ink-sidebtn"); if(b)b.classList.remove("on"); }
function inkSideOpen(tab){
 const s=inkSideEl(); if(!s)return; inkClosePop(); const tp=document.querySelector("#inkdlg .ink-top"), d=el("inkdlg").getBoundingClientRect(), r=tp.getBoundingClientRect();
 s.style.top=Math.max(0,r.bottom-d.top)+"px"; s.style.bottom=(el("ink-pages").offsetHeight||0)+"px";
 if(tab)ink.sideTab=tab; if(ink.board&&ink.sideTab==="pages")ink.sideTab="outline";
 s.hidden=false; el("ink-sidebtn").classList.add("on"); inkSideRender();
}
function inkSideToggle(){ const s=inkSideEl(); if(!s.hidden){ inkSideClose(); return; } inkSideOpen(); }
function inkSideRender(){
 const s=inkSideEl(); if(!s||s.hidden)return; const tabs=[...(ink.board?[]:[["pages","หน้า"]]),["outline","สารบัญ"],["search","ค้นหา"]];
 s.innerHTML=`<div class="ink-stabs">${tabs.map(([k,l])=>`<button type="button" data-stab="${k}" class="${ink.sideTab===k?"on":""}">${l}</button>`).join("")}<button type="button" data-stab="x" style="flex:none;width:38px" aria-label="ปิด">✕</button></div><div class="ink-sbody" id="ink-sbody"></div>`;
 const bd=el("ink-sbody");
 if(ink.sideTab==="pages")inkSidePages(bd); else if(ink.sideTab==="outline")inkSideOutline(bd); else inkSideSearch(bd);
}
// ----- หน้าย่อ -----
function inkSidePages(bd){
 bd.innerHTML=ink.pages.map((p,i)=>`<div class="ink-th2${i===ink.cur?" on":""}" data-sgo="${i}"><canvas width="168" height="${Math.round(168*INK_H/INK_W)}" data-thc="${i}"></canvas><div class="m"><b>หน้า ${i+1}${(ink.bm||[]).some(b=>b.pid===p.id)?" 🔖":""}</b>${p.strokes.length} ชิ้น
<div class="a"><button type="button" data-sp="up" data-i="${i}" ${i===0?"disabled":""} title="เลื่อนขึ้น">↑</button><button type="button" data-sp="dn" data-i="${i}" ${i===ink.pages.length-1?"disabled":""} title="เลื่อนลง">↓</button><button type="button" data-sp="dup" data-i="${i}" title="ทำสำเนาหน้า">⎘ สำเนา</button><button type="button" data-sp="del" data-i="${i}" ${ink.pages.length<2?"disabled":""} title="ลบหน้า">🗑</button></div></div></div>`).join("")+`<button type="button" class="ink-opt" data-sp="add" style="width:100%;justify-content:center;margin-top:6px">＋ เพิ่มหน้าใหม่ต่อจากหน้านี้</button>`;
 const cs=[...bd.querySelectorAll("canvas[data-thc]")]; let n=0;
 const next=()=>{ const c=cs[n++]; if(!c||!ink.note||inkSideEl().hidden)return; const pg=ink.pages[+c.dataset.thc]; if(pg){ try{ const t=inkPageCanvas(pg,168); c.getContext("2d").drawImage(t,0,0,c.width,c.height); }catch(e){} } setTimeout(next,0); };
 setTimeout(next,0);
}
async function inkSidePageOp(op,i){
 const pgs=ink.pages;
 if(op==="add"){ inkAddPage(); inkSideRender(); return; }
 if(op==="up"||op==="dn"){ const j=op==="up"?i-1:i+1; if(j<0||j>=pgs.length)return; const cur=ink.pages[ink.cur]; [pgs[i],pgs[j]]=[pgs[j],pgs[i]]; ink.cur=pgs.indexOf(cur); }
 else if(op==="dup"){ const src=pgs[i], np={id:inkUid(),strokes:JSON.parse(JSON.stringify(src.strokes)),dirty:true,tpl:src.tpl||null}; pgs.splice(i+1,0,np); ink.cur=i+1; }
 else if(op==="del"){ if(pgs.length<2)return; if(!await ask("ลบหน้า "+(i+1)+" ใช่ไหมคะ? ลายเส้นในหน้านี้จะหายไป","ลบหน้านี้"))return; const p=pgs.splice(i,1)[0]; ink.cur=Math.min(Math.max(0,ink.cur>i?ink.cur-1:ink.cur),pgs.length-1); ink.bm=(ink.bm||[]).filter(b=>b.pid!==p.id); try{ await SB.from("rows").delete().eq("uid",uid).eq("id","ink-"+p.id); }catch(e){} }
 ink.undo=[]; ink.redo=[]; ink.sel=null; ink.metaDirty=true; inkRedraw(); inkOverClear(); inkToolbar(); inkDirty(); inkSideRender();
}
// ----- สารบัญ / บุ๊กมาร์ก -----
function inkBmGo(b){
 if(b.pid){ const i=ink.pages.findIndex(p=>p.id===b.pid); if(i>=0)inkGo(i); }
 else{ ink.z=b.z||1; ink.vx=b.vx; ink.vy=b.vy; ink.sel=null; inkOverClear(); inkApply(); }
 if(innerWidth<760)inkSideClose(); else inkSideRender();
}
function inkBmAdd(label){
 const id="b"+Date.now().toString(36)+Math.random().toString(36).slice(2,4); const n=(ink.bm||[]).length+1;
 const b=ink.board?{id,l:label||("จุดที่ "+n),vx:+ink.vx.toFixed(1),vy:+ink.vy.toFixed(1),z:+ink.z.toFixed(3)}:{id,l:label||("หน้า "+(ink.cur+1)),pid:inkPage().id};
 (ink.bm=ink.bm||[]).push(b); ink.metaDirty=true; inkDirty(); inkSideRender();
}
function inkHeadings(){ const out=[]; ink.pages.forEach((pg,i)=>pg.strokes.forEach((s,si)=>{ if(s.t==="x"&&!s.bg&&(s.fs||0)>=40&&String(s.tx||"").trim())out.push({i,si,t:String(s.tx).split("\n")[0].trim()}); })); return out; }
function inkSideOutline(bd){
 const bm=ink.bm||[], H=inkHeadings();
 bd.innerHTML=`<div class="ink-ph">บุ๊กมาร์ก</div><div style="display:flex;gap:6px;margin-bottom:8px"><input id="ink-bmn" class="ink-sinp" style="margin:0;flex:1" placeholder="ชื่อบุ๊กมาร์ก (ไม่ใส่ก็ได้)"><button type="button" class="ink-opt" data-bm="add">＋ ปักตรงนี้</button></div>
${bm.length?bm.map(b=>`<div class="ink-sr" data-bmgo="${b.id}">🔖 ${esc(b.l)}<small>${b.pid?"หน้า "+(ink.pages.findIndex(p=>p.id===b.pid)+1):"ตำแหน่งบนกระดาน"}</small><span style="float:right;margin-top:-30px"><button type="button" class="ink-opt" data-bm="ren" data-id="${b.id}" style="padding:4px 8px">✎</button> <button type="button" class="ink-opt" data-bm="del" data-id="${b.id}" style="padding:4px 8px">✕</button></span></div>`).join(""):`<div class="hint" style="margin:0 0 8px">ยังไม่มีบุ๊กมาร์ก — กด “ปักตรงนี้” ที่${ink.board?"ตำแหน่งที่ดูอยู่":"หน้านี้"}</div>`}
<div class="ink-ph" style="margin-top:12px">หัวข้อในสมุด (ข้อความตัวใหญ่ ≥ 40)</div>
${H.length?H.map(h=>`<div class="ink-sr" data-hgo="${h.i}:${h.si}">${esc(h.t.slice(0,60))}<small>${ink.board?"บนกระดาน":"หน้า "+(h.i+1)}</small></div>`).join(""):`<div class="hint" style="margin:0">พิมพ์ข้อความด้วยเครื่องมือ “ข้อความ” ขนาด 40 ขึ้นไป จะขึ้นเป็นหัวข้อให้อัตโนมัติ</div>`}`;
}
// ----- ค้นหา -----
function inkSideSearch(bd){
 bd.innerHTML=`<input id="ink-sq" class="ink-sinp" placeholder="ค้นหาข้อความในสมุด…" value="${esc(ink.sq||"")}" autocomplete="off"><div id="ink-sres"></div><div class="hint" style="margin:8px 0 0;font-size:12px">ค้นได้เฉพาะข้อความที่พิมพ์ (กล่องข้อความ · โน้ตแปะ · พิมพ์ตามเสียง) · ลายมือยังค้นหาไม่ได้</div>`;
 inkSearchRun(); const q=el("ink-sq"); setTimeout(()=>{ try{ q.focus(); }catch(e){} },30);
}
function inkSearchRun(){
 const q=(el("ink-sq")?el("ink-sq").value:"").trim(), box=el("ink-sres"); if(!box)return; ink.sq=q; if(!q){ box.innerHTML=""; return; }
 const ql=q.toLowerCase(), R=[];
 ink.pages.forEach((pg,i)=>pg.strokes.forEach((s,si)=>{ if(s.t==="x"){ const t=String(s.tx||""), j=t.toLowerCase().indexOf(ql); if(j>=0)R.push({i,si,t,j}); } }));
 (ink.bm||[]).forEach(b=>{ if(String(b.l).toLowerCase().includes(ql))R.push({bm:b,t:b.l,j:String(b.l).toLowerCase().indexOf(ql)}); });
 const hl=(t,j)=>{ const a=Math.max(0,j-18), seg=t.slice(a,j+q.length+40).replace(/\n/g," "); const k=j-a; return (a?"…":"")+esc(seg.slice(0,k))+"<mark>"+esc(seg.slice(k,k+q.length))+"</mark>"+esc(seg.slice(k+q.length)); };
 box.innerHTML=R.length?R.slice(0,60).map(r=>r.bm?`<div class="ink-sr" data-bmgo="${r.bm.id}">🔖 ${hl(r.t,r.j)}<small>บุ๊กมาร์ก</small></div>`:`<div class="ink-sr" data-hgo="${r.i}:${r.si}">${hl(r.t,r.j)}<small>${ink.board?"บนกระดาน":"หน้า "+(r.i+1)}</small></div>`).join(""):`<div class="hint" style="margin:0">ไม่พบ “${esc(q)}”</div>`;
}
function inkJumpTo(i,si){
 if(!ink.board&&i!==ink.cur)inkGo(i); const pg=inkPage(), s=pg.strokes[si]; if(!s)return;
 const bb=inkBB(s); if(ink.board){ const st=el("ink-stage"); ink.vx=(bb[0]+bb[2])/2-st.clientWidth/ink.z/2; ink.vy=(bb[1]+bb[3])/2-st.clientHeight/ink.z/2; inkApply(); }
 ink.tool="lasso"; const idx=new Set(); inkExpandSel(idx,pg.strokes,si); ink.sel={idx,box:inkBBox(pg.strokes,idx)}; inkRedraw(); inkOverClear(); inkDrawSel(); inkToolbar();
 if(innerWidth<760)inkSideClose();
}
// ----- นำเสนอ -----
function inkPresBar(){
 const b=el("ink-presbar"); if(!b)return; if(!ink.pres){ b.hidden=true; return; }
 b.hidden=false; b.innerHTML=`<button type="button" data-pres="exit" aria-label="ออกจากโหมดนำเสนอ">✕ ออก</button>`+(ink.board?"":`<button type="button" data-pres="prev" ${ink.cur===0?"disabled":""} aria-label="หน้าก่อนหน้า">◀</button><span style="font-size:13px;white-space:nowrap">${ink.cur+1} / ${ink.pages.length}</span><button type="button" data-pres="next" ${ink.cur===ink.pages.length-1?"disabled":""} aria-label="หน้าถัดไป">▶</button>`)
 +INK_LASER.map(c=>`<button type="button" class="ink-c${ink.color.laser===c?" on":""}" data-plc="${c}" style="background:${c}" aria-label="สีเลเซอร์ ${c}"></button>`).join("")+`<button type="button" data-pres="tool" class="${ink.tool==="hand"?"on":""}" title="สลับ เลเซอร์ ⇄ เลื่อนหน้า/แตะลิงก์">${ink.tool==="hand"?"✋":"🔴"}</button>`;
}
function inkPresEnter(){
 if(ink.pres||!ink.note)return; inkClosePop(); inkSideClose(); ink.pres=true; ink.preTool=ink.tool; ink.tool="laser"; ink.sel=null; inkOverClear(); inkTextClose&&inkTextClose(true);
 el("inkdlg").classList.add("pres"); try{ const d=el("inkdlg"); if(d.requestFullscreen&&!document.fullscreenElement)d.requestFullscreen().catch(()=>{}); }catch(e){}
 if(!ink.board){ ink.z=1; ink.tx=0; ink.ty=0; } setTimeout(()=>{ inkApply(); inkResize(); },60); inkPresBar(); inkToolbar();
}
function inkPresExit(){
 if(!ink.pres)return; ink.pres=false; ink.tool=ink.preTool||"pen"; inkLaserClear(); el("inkdlg").classList.remove("pres"); inkPresBar();
 try{ if(document.fullscreenElement)document.exitFullscreen().catch(()=>{}); }catch(e){} setTimeout(()=>{ inkApply(); inkResize(); },60); inkToolbar();
}
document.addEventListener("fullscreenchange",()=>{ if(!document.fullscreenElement&&ink.pres)inkPresExit(); });

(function inkSideWire(){
 const dlg=el("inkdlg"); if(!dlg)return;
 el("ink-sidebtn").onclick=e=>{ e.stopPropagation(); inkSideToggle(); };
 el("ink-presbtn").onclick=e=>{ e.stopPropagation(); inkPresEnter(); };
 dlg.addEventListener("click",async e=>{
  const b=e.target.closest("button,.ink-sr,.ink-th2"); if(!b)return;
  if(b.dataset.stab){ if(b.dataset.stab==="x")inkSideClose(); else{ ink.sideTab=b.dataset.stab; inkSideRender(); } return; }
  if(b.dataset.sp){ e.stopPropagation(); await inkSidePageOp(b.dataset.sp,+b.dataset.i); return; }
  if(b.dataset.bm){ e.stopPropagation(); const k=b.dataset.bm;
   if(k==="add"){ inkBmAdd((el("ink-bmn").value||"").trim()); }
   else if(k==="del"){ ink.bm=ink.bm.filter(x=>x.id!==b.dataset.id); ink.metaDirty=true; inkDirty(); inkSideRender(); }
   else if(k==="ren"){ const x=ink.bm.find(v=>v.id===b.dataset.id); const v=x&&window.prompt("ชื่อบุ๊กมาร์ก",x.l); if(v&&v.trim()){ x.l=v.trim(); ink.metaDirty=true; inkDirty(); inkSideRender(); } } return; }
  if(b.dataset.bmgo){ const x=(ink.bm||[]).find(v=>v.id===b.dataset.bmgo); if(x)inkBmGo(x); return; }
  if(b.dataset.hgo){ const [i,si]=b.dataset.hgo.split(":").map(Number); inkJumpTo(i,si); return; }
  if(b.dataset.sgo!=null&&b.classList.contains("ink-th2")){ inkGo(+b.dataset.sgo); if(innerWidth<760)inkSideClose(); else inkSideRender(); return; }
  if(b.dataset.pres){ const k=b.dataset.pres; if(k==="exit")inkPresExit(); else if(k==="prev"){ inkGo(ink.cur-1); inkPresBar(); } else if(k==="next"){ inkGo(ink.cur+1); inkPresBar(); } else if(k==="tool"){ ink.tool=ink.tool==="hand"?"laser":"hand"; inkLaserClear(); inkPresBar(); } return; }
  if(b.dataset.plc){ ink.color.laser=b.dataset.plc; inkSetSave(); inkPresBar(); return; }
 });
 dlg.addEventListener("input",e=>{ if(e.target.id==="ink-sq")inkSearchRun(); });
 dlg.addEventListener("change",async e=>{ const t=e.target; if(t.dataset&&t.dataset.ipaperc){ const d={paper:t.value}; Object.assign(ink.note,d); try{ await DB.collection("note").doc(ink.note._id).set(d,{merge:true}); }catch(er){} inkRedraw(); } });
 document.addEventListener("keydown",e=>{ if(!ink.note||!el("inkdlg").open||!ink.pres)return; const k=e.key;
  if(k==="ArrowRight"||k==="PageDown"||k===" "||k==="ArrowDown"){ e.preventDefault(); if(!ink.board){ inkGo(ink.cur+1); inkPresBar(); } }
  else if(k==="ArrowLeft"||k==="PageUp"||k==="ArrowUp"){ e.preventDefault(); if(!ink.board){ inkGo(ink.cur-1); inkPresBar(); } } });
})();
