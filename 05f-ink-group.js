// ---------- กลุ่ม · ข้อความ · แต่งสิ่งที่เลือก · สำเนา · จัดแนว (สมุดเขียนมือ / กระดานกว้าง) ----------
const INK_FONT='"Sarabun","Noto Sans Thai","Prompt",system-ui,-apple-system,"Segoe UI",sans-serif';
function inkExpandSel(idx,strokes,q){ idx.add(q); const g=strokes[q]&&strokes[q].g; if(!g)return idx; strokes.forEach((s,i)=>{ if(s.g===g)idx.add(i); }); return idx; }
// หน่วย = กลุ่ม (ถ้ามี g) หรือเส้นเดี่ยว
function inkUnits(strokes,idx){ const m=new Map(), out=[]; [...idx].sort((a,b)=>a-b).forEach(i=>{ const g=strokes[i].g; if(g){ if(!m.has(g)){ const u=[]; m.set(g,u); out.push(u); } m.get(g).push(i); } else out.push([i]); }); return out; }
function inkSelBtns(){
const sel=ink.sel, on=!!sel, pg=on?inkPage():null, S=on?pg.strokes:[], ids=on?[...sel.idx]:[];
const units=on?inkUnits(S,sel.idx):[], hasG=ids.some(i=>S[i]&&S[i].g);
const g=el("ink-selgrp"); if(!g)return;
g.hidden=!on||(units.length<2&&!hasG); g.textContent=hasG&&units.length===1?"เลิกกลุ่ม":(hasG?"เลิกกลุ่ม":"จัดกลุ่ม");
el("ink-selfmt").hidden=!on; el("ink-seldup").hidden=!on; el("ink-selcopy").hidden=!on; el("ink-selcut").hidden=!on; el("ink-selpaste").hidden=!(ink.clip&&ink.clip.length); el("ink-selaln").hidden=!on||units.length<2;
el("ink-seledit").hidden=!(on&&ids.length===1&&S[ids[0]]&&S[ids[0]].t==="x");
if(el("ink-sellock")){ const allLk=on&&ids.every(i=>S[i]&&S[i].lk); el("ink-sellock").hidden=!on; el("ink-sellock").textContent=allLk?"🔓 ปลดล็อก":"🔒 ล็อก"; el("ink-selz").hidden=!on||allLk; el("ink-sellink").hidden=!on; }
}
function inkGroupToggle(){
if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx, hasG=[...idx].some(i=>pg.strokes[i].g);
const gid=hasG?null:"g"+Math.random().toString(36).slice(2,8);
const next=pg.strokes.map((s,i)=>{ if(!idx.has(i))return s; const o={...s}; if(gid)o.g=gid; else delete o.g; return o; });
inkCommit(next,true); inkStatus(hasG?"เลิกกลุ่มแล้ว":"จัดกลุ่มแล้ว — เลือก/ย้ายพร้อมกันเสมอ","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("","") },2200);
}
// ---------- ข้อความ ----------
let inkTMc=null;
function inkTextMeasure(s){ if(!inkTMc)inkTMc=document.createElement("canvas").getContext("2d"); const c=inkTMc, fs=s.fs||24; c.font=fs+"px "+INK_FONT; const L=String(s.tx||"").split("\n"); let w=0; L.forEach(l=>{ w=Math.max(w,c.measureText(l).width); });
 let W=Math.max(fs*.6,+w.toFixed(1)), H=+(L.length*fs*1.35).toFixed(1);
 if(s.bg){ const pd=fs*.55; W=Math.max(W+pd*2,fs*6.4); H=Math.max(H+pd*2,fs*4); }
 return [W,H]; }
function inkTextDraw(ctx,s,k,dx,dy){
const fs=(s.fs||24)*k, L=String(s.tx||"").split("\n"); ctx.save(); ctx.font=fs+"px "+INK_FONT; ctx.fillStyle=s.c||"#1d1d1f"; ctx.textBaseline="top";
let ox=(s.p[0]+dx)*k, oy=(s.p[1]+dy)*k;
if(s.bg){ const x0=(s.p[0]+dx)*k, y0=(s.p[1]+dy)*k, w=(s.p[3]-s.p[0])*k, h=(s.p[4]-s.p[1])*k, r=Math.min(w,h)*.06; ctx.save(); ctx.shadowColor="rgba(0,0,0,.22)"; ctx.shadowBlur=7*k; ctx.shadowOffsetY=2.5*k; ctx.fillStyle=s.bg; ctx.beginPath(); ctx.moveTo(x0+r,y0); ctx.lineTo(x0+w-r,y0); ctx.quadraticCurveTo(x0+w,y0,x0+w,y0+r); ctx.lineTo(x0+w,y0+h-r*3); ctx.lineTo(x0+w-r*3,y0+h); ctx.lineTo(x0+r,y0+h); ctx.quadraticCurveTo(x0,y0+h,x0,y0+h-r); ctx.lineTo(x0,y0+r); ctx.quadraticCurveTo(x0,y0,x0+r,y0); ctx.fill(); ctx.restore();
 ctx.save(); ctx.fillStyle="rgba(0,0,0,.10)"; ctx.beginPath(); ctx.moveTo(x0+w-r*3,y0+h); ctx.lineTo(x0+w,y0+h-r*3); ctx.lineTo(x0+w-r*3,y0+h-r*3); ctx.closePath(); ctx.fill(); ctx.restore();
 const pd=(s.fs||24)*.55*k; ox+=pd; oy+=pd; }
L.forEach((l,i)=>ctx.fillText(l,ox,oy+i*fs*1.35)); ctx.restore();
}
function inkMkText(x,y,tx,fs,c,g,bg){ const o={t:"x",c,w:1,fs,tx,p:[+x.toFixed(1),+y.toFixed(1),0,0,0,0]}; if(g)o.g=g; if(bg)o.bg=bg; const m=inkTextMeasure(o); o.p[3]=+(x+m[0]).toFixed(1); o.p[4]=+(y+m[1]).toFixed(1); return o; }
function inkPageToScreen(x,y){ const c=el("ink-over"), r=c.getBoundingClientRect(), [ox,oy]=inkO(), d=window.devicePixelRatio||1; return [r.left+(x+ox)*ink.k/d, r.top+(y+oy)*ink.k/d]; }
function inkTextAt(x,y,sticky){
const pg=inkPage(); let hi=-1; for(let q=pg.strokes.length-1;q>=0;q--){ const s=pg.strokes[q]; if(s.t==="x"&&inkHit(s,x,y,6)){ hi=q; break; } }
inkTextEdit(hi>=0?hi:-1,x,y,sticky?ink.color.sticky:null);
}
function inkTextEdit(i,x,y,bgNew){
inkTextClose(true); const pg=inkPage(), old=i>=0?pg.strokes[i]:null, bg=old?old.bg:bgNew, fs=old?old.fs:(bg?ink.size.sticky:ink.size.text), col=old?old.c:(bg?"#1d1d1f":ink.color.pen), pdd=bg?fs*.55:0;
const px=(old?old.p[0]:x)+pdd, py=(old?old.p[1]:y)+pdd, [sx,sy]=inkPageToScreen(px,py), d=window.devicePixelRatio||1, z=ink.k/d;
const ta=document.createElement("textarea"); ta.id="ink-ta"; ta.value=old?old.tx:""; ta.rows=Math.max(1,(ta.value.split("\n").length)); ta.placeholder="พิมพ์ข้อความ…";
ta.style.cssText=`position:fixed;z-index:30;left:${sx}px;top:${sy}px;min-width:${Math.max(140,fs*z*6)}px;max-width:70vw;font:${fs*z}px/1.35 ${INK_FONT};color:${col};background:rgba(255,255,255,.88);border:1.5px dashed #2563eb;border-radius:6px;padding:0;margin:0;outline:none;resize:both;overflow:hidden;-webkit-user-select:text;user-select:text`;
el("inkdlg").appendChild(ta); ink.ta={ta,i,x:px-pdd,y:py-pdd,bg:bgNew||null}; ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length);
const fit=()=>{ ta.style.height="auto"; ta.style.height=ta.scrollHeight+"px"; }; fit(); ta.addEventListener("input",fit);
ta.addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.preventDefault(); inkTextClose(false); } else if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); inkTextClose(true); } e.stopPropagation(); });
ta.addEventListener("blur",()=>setTimeout(()=>{ if(ink.ta&&ink.ta.ta===ta)inkTextClose(true); },120));
}
function inkTextClose(commit){
const T=ink.ta; if(!T)return; ink.ta=null; const tx=T.ta.value.replace(/\s+$/,""); T.ta.remove(); if(!commit)return;
const pg=inkPage(), old=T.i>=0?pg.strokes[T.i]:null;
if(!tx){ if(old){ inkCommit(pg.strokes.filter((_,j)=>j!==T.i)); } return; }
if(old){ if(old.tx===tx)return; const o=inkMkText(old.p[0],old.p[1],tx,old.fs,old.c,old.g,old.bg); if(old.id)o.id=old.id; if(old.lk)o.lk=old.lk; inkCommit(pg.strokes.map((s,j)=>j===T.i?o:s)); return; }
{ const o=T.bg?inkMkText(T.x,T.y,tx,ink.size.sticky,"#1d1d1f",null,T.bg):inkMkText(T.x,T.y,tx,ink.size.text,ink.color.pen); inkCommit([...pg.strokes,o]); }
}
// ---------- แต่งสิ่งที่เลือก ----------
function inkSelApply(fn){ if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx; const next=pg.strokes.map((s,i)=>idx.has(i)?fn(s):s); ink.sel={idx,box:inkBBox(next,idx)}; inkCommit(next,true); }
function inkSelFmtMenu(a){
const pg=inkPage(), ids=[...ink.sel.idx], S=ids.map(i=>pg.strokes[i]), hasT=S.some(s=>s.t==="x"), hasO=S.some(s=>s.t!=="x"), hasS=S.some(s=>s.t==="s");
const w0=Math.round((S.find(s=>s.t!=="x")||{w:3}).w*2)/2, f0=Math.round((S.find(s=>s.t==="x")||{fs:26}).fs);
inkPop(`<div class="ink-ph">สี</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px">${INK_PEN.map(c=>`<button type="button" class="ink-c" data-sfc="${c}" style="background:${c}" aria-label="สี ${c}"></button>`).join("")}</div>
${hasO?`<div class="ink-ph">ความหนาเส้น <b id="ink-sfwv">${w0}</b></div><input type="range" id="ink-sfw" class="ink-wide" min="1" max="40" step="0.5" value="${w0}">`:""}
${hasT?`<div class="ink-ph">ขนาดตัวอักษร <b id="ink-sffv">${f0}</b></div><input type="range" id="ink-sff" class="ink-wide" min="10" max="120" step="1" value="${f0}">`:""}
${hasT?`<div class="ink-ph">พื้นโน้ตแปะ</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px"><button type="button" class="ink-opt" data-sfb="">ไม่มีพื้น</button>${INK_STICKY.map(c=>`<button type="button" class="ink-c" data-sfb="${c}" style="background:${c}" aria-label="พื้น ${c}"></button>`).join("")}</div>`:""}
${hasS?`<div class="ink-ph">เปลี่ยนรูปทรง</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px">${INK_SHAPES.map(([k,n])=>`<button type="button" class="ink-opt" data-sfs="${k}">${esc(n)}</button>`).join("")}</div>`:""}`,a);
}
function inkAlignMenu(a){
inkPop(`<div class="ink-ph">จัดแนว (ตามกรอบของที่เลือก)</div><div class="ink-row" style="flex-wrap:wrap;max-width:300px">${[["l","ชิดซ้าย"],["cx","กึ่งกลางแนวนอน"],["r","ชิดขวา"],["t","ชิดบน"],["cy","กึ่งกลางแนวตั้ง"],["b","ชิดล่าง"]].map(([k,n])=>`<button type="button" class="ink-opt" data-saln="${k}">${n}</button>`).join("")}</div>
<div class="ink-ph">กระจายระยะเท่ากัน (ต้อง 3 ชิ้น/กลุ่มขึ้นไป)</div><div class="ink-row"><button type="button" class="ink-opt" data-saln="dh">แนวนอน</button><button type="button" class="ink-opt" data-saln="dv">แนวตั้ง</button></div>`,a);
}
function inkAlign(op){
if(!ink.sel)return; const pg=inkPage(), S=pg.strokes, units=inkUnits(S,ink.sel.idx); if(units.length<2)return;
const bb=units.map(u=>inkBBox(S,new Set(u))), B=[Math.min(...bb.map(b=>b[0])),Math.min(...bb.map(b=>b[1])),Math.max(...bb.map(b=>b[2])),Math.max(...bb.map(b=>b[3]))];
const mv=units.map(()=>[0,0]);
if(op==="dh"||op==="dv"){ if(units.length<3)return; const ax=op==="dh"?0:1; const ord=units.map((u,i)=>i).sort((a,b)=>bb[a][ax]-bb[b][ax]); const tot=ord.reduce((s,i)=>s+(bb[i][ax+2]-bb[i][ax]),0), gap=((B[ax+2]-B[ax])-tot)/(units.length-1); let pos=B[ax]; ord.forEach(i=>{ mv[i][ax]=pos-bb[i][ax]; pos+=(bb[i][ax+2]-bb[i][ax])+gap; }); }
else units.forEach((u,i)=>{ const b=bb[i]; if(op==="l")mv[i][0]=B[0]-b[0]; else if(op==="r")mv[i][0]=B[2]-b[2]; else if(op==="cx")mv[i][0]=(B[0]+B[2])/2-(b[0]+b[2])/2; else if(op==="t")mv[i][1]=B[1]-b[1]; else if(op==="b")mv[i][1]=B[3]-b[3]; else if(op==="cy")mv[i][1]=(B[1]+B[3])/2-(b[1]+b[3])/2; });
const dm=new Map(); units.forEach((u,i)=>u.forEach(q=>dm.set(q,mv[i])));
const next=S.map((s,i)=>{ const m=dm.get(i); return m&&(m[0]||m[1])?{...s,p:s.p.map((v,j)=>+(v+(j%3===0?m[0]:j%3===1?m[1]:0)).toFixed(1))}:s; });
ink.sel={idx:ink.sel.idx,box:inkBBox(next,ink.sel.idx)}; inkCommit(next,true);
}
function inkDuplicate(){
if(!ink.sel)return; const pg=inkPage(), S=pg.strokes, ids=[...ink.sel.idx].sort((a,b)=>a-b), gm=new Map(), off=24;
const cp=ids.map(i=>{ const s=S[i], o={...s,p:s.p.map((v,j)=>+(v+(j%3===0||j%3===1?off:0)).toFixed(1))}; if(s.g){ if(!gm.has(s.g))gm.set(s.g,"g"+Math.random().toString(36).slice(2,8)); o.g=gm.get(s.g); } return o; });
const next=[...S,...cp], idx=new Set(cp.map((_,j)=>S.length+j)); inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
}
// ---------- คัดลอก / ตัด / วาง ----------
function inkCopy(cut){
if(!ink.sel)return; const pg=inkPage(), ids=[...ink.sel.idx].sort((a,b)=>a-b);
ink.clip=ids.map(i=>JSON.parse(JSON.stringify(pg.strokes[i]))); ink.clipN=0;
inkStatus((cut?"ตัด":"คัดลอก")+"แล้ว "+ids.length+" ชิ้น — กด วาง ได้เลย","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2200);
if(cut){ const idx=ink.sel.idx; inkCommit(pg.strokes.filter((_,i)=>!idx.has(i))); } else inkToolbar();
}
function inkPaste(){
if(!ink.clip||!ink.clip.length)return; const pg=inkPage(), S=pg.strokes, gm=new Map(); ink.clipN=(ink.clipN||0)+1; const off=24*ink.clipN;
const cp=ink.clip.map(s=>{ const o={...s,p:s.p.map((v,j)=>+(v+(j%3===0||j%3===1?off:0)).toFixed(1))}; if(s.g){ if(!gm.has(s.g))gm.set(s.g,"g"+Math.random().toString(36).slice(2,8)); o.g=gm.get(s.g); } return o; });
const next=[...S,...cp], idx=new Set(cp.map((_,j)=>S.length+j)); ink.tool="lasso"; inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
}
(function inkGroupWire(){
const dlg=el("inkdlg"); if(!dlg)return;
el("ink-selgrp").onclick=inkGroupToggle; el("ink-selcopy").onclick=()=>inkCopy(false); el("ink-selcut").onclick=()=>inkCopy(true); el("ink-selpaste").onclick=inkPaste; el("ink-seldup").onclick=inkDuplicate;
el("ink-selfmt").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-sfc]")){ inkClosePop(); return; } if(ink.sel)inkSelFmtMenu(e.currentTarget); };
el("ink-selaln").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-saln]")){ inkClosePop(); return; } if(ink.sel)inkAlignMenu(e.currentTarget); };
el("ink-seledit").onclick=()=>{ if(!ink.sel)return; const i=[...ink.sel.idx][0], s=inkPage().strokes[i]; if(s&&s.t==="x")inkTextEdit(i,s.p[0],s.p[1]); };
dlg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return;
if(b.dataset.sfc){ const c=b.dataset.sfc; inkSelApply(s=>({...s,c})); return; }
if(b.dataset.sfb!=null){ const bg=b.dataset.sfb; inkSelApply(s=>{ if(s.t!=="x")return s; const o={...s}; if(bg){ o.bg=bg; if(o.c==="#ffffff")o.c="#1d1d1f"; } else delete o.bg; o.p=[...s.p]; const m=inkTextMeasure(o); o.p[3]=+(o.p[0]+m[0]).toFixed(1); o.p[4]=+(o.p[1]+m[1]).toFixed(1); return o; }); return; }
if(b.dataset.sfs){ const k=b.dataset.sfs; inkSelApply(s=>s.t==="s"?{...s,sh:k}:s); return; }
if(b.dataset.saln){ inkAlign(b.dataset.saln); inkClosePop(); return; } });
dlg.addEventListener("input",e=>{ const t=e.target; if(t.id==="ink-sfw")el("ink-sfwv").textContent=t.value; else if(t.id==="ink-sff")el("ink-sffv").textContent=t.value; });
dlg.addEventListener("change",e=>{ const t=e.target;
if(t.id==="ink-sfw"){ const v=+t.value; inkSelApply(s=>s.t==="x"?s:{...s,w:v}); }
else if(t.id==="ink-sff"){ const v=+t.value; inkSelApply(s=>{ if(s.t!=="x")return s; const o={...s,fs:v}; const m=inkTextMeasure(o); o.p=[...s.p]; o.p[3]=+(o.p[0]+m[0]).toFixed(1); o.p[4]=+(o.p[1]+m[1]).toFixed(1); return o; }); } });
})();

// Shift ค้าง = ล็อกสัดส่วน (สี่เหลี่ยมจัตุรัส/วงกลม/เส้น 15°) เหมือน Photoshop
window.addEventListener("keydown",e=>{ if(e.key==="Shift")ink.shift=true; }); window.addEventListener("keyup",e=>{ if(e.key==="Shift")ink.shift=false; }); window.addEventListener("blur",()=>{ ink.shift=false; });
