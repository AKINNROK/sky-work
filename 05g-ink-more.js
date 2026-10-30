// ===== สมุดเขียนมือ: รูปภาพ · ล็อก · ลำดับชั้น · เลเซอร์ · เทป · ลิงก์ (ต่อจาก 05b/05e/05f) =====
// รูปภาพ: {t:"i",id,p:[x1,y1,0,x2,y2,0],r?,lk?,a?}  ข้อมูลภาพเก็บแยกที่ rows(kind "nimg", id "inkimg-<id>") — ลายเส้นเก็บแค่รหัสอ้างอิง
// เทป:   {t:"t",c,w,m:"free"|"line",p:[...],o?:1 (เปิดเผยของใต้เทป)}
// ลิงก์: u:{k:"url"|"pg"|"bm",v}
const INK_LASER=["#ff2d2d","#ff9500","#22c55e","#2563eb","#a855f7","#ec4899"];
const INK_TAPE=["#ffe14d","#ff9ec7","#8ec9ff","#7ee08f","#ffb36b","#c9a7ff","#e5e7eb","#1d1d1f"];
const INK_STICKY=["#fff59d","#ffd6e0","#c8f0d0","#cfe8ff","#ffe0b3","#e5d4ff"];
Object.assign(ink.color,{laser:INK_LASER[0],tape:INK_TAPE[0],sticky:INK_STICKY[0]});
(function(){ const cs=ink.colorSaved; if(!cs)return; if(INK_LASER.includes(cs.laser))ink.color.laser=cs.laser; if(INK_TAPE.includes(cs.tape))ink.color.tape=cs.tape; if(INK_STICKY.includes(cs.sticky))ink.color.sticky=cs.sticky; })();

// ---------- ตัวช่วยเรื่องสถานะการเลือก ----------
function inkSelLocked(){ if(!ink.sel||!ink.sel.idx.size)return false; const S=inkPage().strokes; return [...ink.sel.idx].every(i=>S[i]&&S[i].lk); }
function inkSelHasLink(){ if(!ink.sel)return false; const S=inkPage().strokes; return [...ink.sel.idx].some(i=>S[i]&&S[i].u); }
function inkFlat(s){ return (s.t==="i"||s.t==="k")?inkImgFlat(s):inkShapeFlat(s); }

// ---------- รูปภาพ ----------
const INK_IMGS=new Map(), inkImgDirty=new Set();
function inkImgRec(id){ let r=INK_IMGS.get(id); if(!r){ r={id,el:null,ok:false,p:null,src:""}; INK_IMGS.set(id,r); } return r; }
function inkImgSet(id,src){ const r=inkImgRec(id); r.src=src; r.p=new Promise(res=>{ const im=new Image(); im.onload=()=>{ r.el=im; r.ok=true; res(true); try{ if(ink.note){ inkRedrawSoon(); } }catch(e){} }; im.onerror=()=>{ r.ok=false; r.bad=true; res(false); }; im.src=src; }); return r.p; }
async function inkImgLoadAll(){
 if(!SB||!ink.note)return; const ids=new Set(); ink.pages.forEach(pg=>pg.strokes.forEach(s=>{ if(s.t==="i"&&!(INK_IMGS.get(s.id)&&INK_IMGS.get(s.id).p))ids.add(s.id); }));
 if(!ids.size)return; const arr=[...ids];
 try{ for(let i=0;i<arr.length;i+=4){ const part=arr.slice(i,i+4); const {data,error}=await SB.from("rows").select("id,data").eq("uid",uid).in("id",part.map(x=>"inkimg-"+x)); if(error)throw error;
   (data||[]).forEach(r=>{ const id=String(r.id).replace(/^inkimg-/,""); if(r.data&&r.data.d)inkImgSet(id,r.data.d); });
   part.forEach(id=>{ const r=inkImgRec(id); if(!r.p){ r.bad=true; } }); } }catch(e){}
}
async function inkImgsReady(){ const ps=[]; ink.pages.forEach(pg=>pg.strokes.forEach(s=>{ if(s.t==="i"){ const r=INK_IMGS.get(s.id); if(r&&r.p)ps.push(r.p); } })); await Promise.all(ps); }
async function inkImgFlush(){
 if(!inkImgDirty.size)return; const ids=[...inkImgDirty];
 for(const id of ids){ const r=INK_IMGS.get(id); if(!r||!r.src){ inkImgDirty.delete(id); continue; }
  const {error}=await SB.from("rows").upsert({id:"inkimg-"+id,uid,kind:"nimg",data:{d:r.src,note:ink.note._id},updated_at:new Date().toISOString()}); if(error)throw error; inkImgDirty.delete(id); }
}
function inkImgFlat(s){ const p=s.p, cx=(p[0]+p[3])/2, cy=(p[1]+p[4])/2, co=Math.cos(s.r||0), si=Math.sin(s.r||0), o=[];
 [[p[0],p[1]],[p[3],p[1]],[p[3],p[4]],[p[0],p[4]]].forEach(([x,y])=>{ o.push(cx+(x-cx)*co-(y-cy)*si,cy+(x-cx)*si+(y-cy)*co,0); }); return o; }
function inkImgHit(s,x,y,r){ const p=s.p, cx=(p[0]+p[3])/2, cy=(p[1]+p[4])/2, co=Math.cos(-(s.r||0)), si=Math.sin(-(s.r||0)), dx=x-cx, dy=y-cy, lx=dx*co-dy*si, ly=dx*si+dy*co;
 return Math.abs(lx)<=Math.abs(p[3]-p[0])/2+r*.3&&Math.abs(ly)<=Math.abs(p[4]-p[1])/2+r*.3; }
function inkImgDraw(ctx,s,k,dx,dy){
 const p=s.p, x0=Math.min(p[0],p[3]), y0=Math.min(p[1],p[4]), w=Math.abs(p[3]-p[0]), h=Math.abs(p[4]-p[1]); if(w<1||h<1)return;
 ctx.save(); if(s.r){ const cx=(x0+w/2+dx)*k, cy=(y0+h/2+dy)*k; ctx.translate(cx,cy); ctx.rotate(s.r); ctx.translate(-cx,-cy); }
 const r=INK_IMGS.get(s.id), X=(x0+dx)*k, Y=(y0+dy)*k;
 if(r&&r.ok){ if(s.a!=null)ctx.globalAlpha=s.a; ctx.imageSmoothingQuality="high"; ctx.drawImage(r.el,X,Y,w*k,h*k); }
 else{ ctx.fillStyle="#e5e7eb"; ctx.fillRect(X,Y,w*k,h*k); ctx.strokeStyle="#9ca3af"; ctx.lineWidth=Math.max(1,k); ctx.strokeRect(X,Y,w*k,h*k); ctx.fillStyle="#6b7280"; ctx.font=Math.max(10,Math.min(18*k,h*k/3))+"px sans-serif"; ctx.textBaseline="middle"; ctx.textAlign="center"; ctx.fillText(r&&r.bad?"(โหลดรูปไม่ได้)":"กำลังโหลดรูป…",X+w*k/2,Y+h*k/2); }
 ctx.restore();
}
// ย่อรูปก่อนเก็บ: ด้านยาวสุด ≤1600px · PNG/WebP/GIF ที่มีความโปร่งใสคง PNG (ถ้าไม่ใหญ่เกิน) ไม่งั้น JPEG
function inkImgScale(file){
 return new Promise((res,rej)=>{ const u=URL.createObjectURL(file), im=new Image();
  im.onload=()=>{ try{ const w=im.naturalWidth, h=im.naturalHeight; let sc=Math.min(1,1600/Math.max(w,h)); const c=document.createElement("canvas"); let out="";
   const alpha=/png|webp|gif/i.test(file.type);
   for(let t=0;t<5;t++){ c.width=Math.max(1,Math.round(w*sc)); c.height=Math.max(1,Math.round(h*sc)); const x=c.getContext("2d");
    if(alpha){ x.clearRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); out=c.toDataURL("image/png"); if(out.length<900000)break; }
    x.globalCompositeOperation="destination-over"; x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.globalCompositeOperation="source-over";
    if(!alpha){ x.drawImage(im,0,0,c.width,c.height); }
    out=c.toDataURL("image/jpeg",.85); if(out.length<750000)break; sc*=.8; }
   URL.revokeObjectURL(u); res({src:out,w:im.naturalWidth,h:im.naturalHeight}); }catch(e){ URL.revokeObjectURL(u); rej(e); } };
  im.onerror=()=>{ URL.revokeObjectURL(u); rej(new Error("อ่านรูปไม่ได้")); }; im.src=u; });
}
async function inkImgAdd(files){
 if(!ink.note)return; files=[...files].filter(f=>/^image\//.test(f.type)); if(!files.length)return;
 inkStatus("กำลังเตรียมรูป…","busy"); const pg=inkPage(), st=el("ink-stage"), r=st.getBoundingClientRect();
 const [cx,cy]=inkToPage({clientX:r.left+r.width/2,clientY:r.top+r.height/2}); const viewW=ink.board?st.clientWidth/ink.z:INK_W, viewH=ink.board?st.clientHeight/ink.z:INK_H;
 const made=[]; let off=0;
 for(const f of files){ try{ const q=await inkImgScale(f); const id="i"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
   await inkImgSet(id,q.src); inkImgDirty.add(id);
   let w=viewW*(ink.board?.4:.55), h=w*q.h/q.w; const mh=viewH*.6; if(h>mh){ h=mh; w=h*q.w/q.h; }
   const x0=cx-w/2+off, y0=cy-h/2+off; off+=28; made.push({t:"i",id,c:"#000",w:0,p:[+x0.toFixed(1),+y0.toFixed(1),0,+(x0+w).toFixed(1),+(y0+h).toFixed(1),0]}); }catch(e){ tell("<b>แทรกรูปไม่สำเร็จ</b><div class=\"hint\">"+esc(e.message||"อ่านไฟล์ไม่ได้")+"</div>"); } }
 if(!made.length){ inkStatus("",""); return; }
 const next=[...pg.strokes,...made], idx=new Set(made.map((_,j)=>pg.strokes.length+j)); ink.tool="lasso"; inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
 inkStatus("แทรกรูปแล้ว — ลากย้าย · มุมขวาล่างย่อ/ขยาย · วงกลมบนหมุน","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },3500);
}
document.addEventListener("paste",e=>{ if(!ink.note||!el("inkdlg").open||ink.ta)return; const fs=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(f=>/^image\//.test(f.type)); if(fs.length){ e.preventDefault(); inkImgAdd(fs); } });
(function(){ const st=el("ink-stage"); if(!st)return; st.addEventListener("dragover",e=>{ if(ink.note&&e.dataTransfer&&[...e.dataTransfer.types].includes("Files"))e.preventDefault(); });
 st.addEventListener("drop",e=>{ if(!ink.note||!e.dataTransfer||!e.dataTransfer.files.length)return; e.preventDefault(); inkImgAdd(e.dataTransfer.files); });
 el("ink-imgf").addEventListener("change",e=>{ const fs=[...e.target.files]; e.target.value=""; if(fs.length)inkImgAdd(fs); }); })();

// ---------- ปุ่มลัดบนแถบเครื่องมือ (รูป / ไมค์) ----------
function inkAct(k,btn){ if(k==="stk"){ const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-istk]")){ inkClosePop(); return; } inkStkMenu(btn); return; } if(k==="img"){ el("ink-imgf").click(); } else if(k==="mic"&&typeof inkVoiceToggle==="function"){ inkVoiceToggle(); } else if(k==="calc"&&typeof calcOpenInk==="function"){ calcOpenInk(); } else if(k==="ruler"&&typeof inkRulMenu==="function"){ inkRulMenu(btn); } else if(k==="ai"&&typeof hlpToggle==="function"){ inkClosePop(); hlpToggle(el("inkdlg")); } }

// ---------- ล็อก · ลำดับชั้น ----------
function inkLockToggle(){ if(!ink.sel)return; const pg=inkPage(), idx=ink.sel.idx, all=[...idx].every(i=>pg.strokes[i]&&pg.strokes[i].lk);
 const next=pg.strokes.map((s,i)=>{ if(!idx.has(i))return s; const o={...s}; if(all)delete o.lk; else o.lk=1; return o; }); inkCommit(next,true); inkDrawSel();
 inkStatus(all?"ปลดล็อกแล้ว":"ล็อกแล้ว — ย้าย/ลบไม่ได้ จนกว่าจะปลดล็อก (แตะที่ของล็อกด้วยเครื่องมือเลือกเพื่อปลด)","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },3200); }
function inkZMenu(a){ inkPop(`<div class="ink-ph">ลำดับชั้น (หน้า/หลัง)</div><button type="button" class="ink-mi" data-sz="front">⬆ ส่งไปหน้าสุด</button><button type="button" class="ink-mi" data-sz="fwd">↑ เลื่อนขึ้น 1 ชั้น</button><button type="button" class="ink-mi" data-sz="back1">↓ เลื่อนลง 1 ชั้น</button><button type="button" class="ink-mi" data-sz="back">⬇ ส่งไปหลังสุด</button>`,a); }
function inkReorder(op){
 if(!ink.sel)return; const pg=inkPage(), S=pg.strokes, n=S.length; let arr=S.map((s,i)=>({s,sel:ink.sel.idx.has(i)}));
 if(op==="front")arr=[...arr.filter(o=>!o.sel),...arr.filter(o=>o.sel)]; else if(op==="back")arr=[...arr.filter(o=>o.sel),...arr.filter(o=>!o.sel)];
 else if(op==="fwd"){ for(let i=n-2;i>=0;i--)if(arr[i].sel&&!arr[i+1].sel){ const t=arr[i]; arr[i]=arr[i+1]; arr[i+1]=t; } }
 else if(op==="back1"){ for(let i=1;i<n;i++)if(arr[i].sel&&!arr[i-1].sel){ const t=arr[i]; arr[i]=arr[i-1]; arr[i-1]=t; } }
 const idx=new Set(); arr.forEach((o,i)=>{ if(o.sel)idx.add(i); }); const next=arr.map(o=>o.s); inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar();
}

// ---------- เลเซอร์พอยน์เตอร์ (ไม่บันทึกลงสมุด) ----------
const inkLz={pts:[],raf:0,life:1200};
function inkLaserAdd(x,y,down){ const t=performance.now(); inkLz.pts.push({x,y,t}); if(inkLz.pts.length>260)inkLz.pts.shift(); ink.laserDown=down===1; if(!inkLz.raf)inkLz.raf=requestAnimationFrame(inkLaserLoop); }
function inkLaserLoop(){
 inkLz.raf=0; const c=el("ink-laser"); if(!c||!ink.note){ inkLz.pts=[]; return; } const ctx=c.getContext("2d"), now=performance.now(), k=ink.k, [ox,oy]=inkO();
 ctx.clearRect(0,0,c.width,c.height); inkLz.pts=inkLz.pts.filter(p=>now-p.t<inkLz.life); const P=inkLz.pts; if(!P.length)return;
 const col=ink.color.laser, wd=Math.max(2,(ink.size.laser||6)*k*1.2); ctx.save(); ctx.lineCap="round"; ctx.lineJoin="round";
 for(let i=1;i<P.length;i++){ const a=1-(now-P[i].t)/inkLz.life; if(a<=0)continue; ctx.globalAlpha=Math.max(0,a*.9); ctx.strokeStyle=col; ctx.shadowColor=col; ctx.shadowBlur=wd*2.2; ctx.lineWidth=wd*(.35+.65*a);
  ctx.beginPath(); ctx.moveTo((P[i-1].x+ox)*k,(P[i-1].y+oy)*k); ctx.lineTo((P[i].x+ox)*k,(P[i].y+oy)*k); ctx.stroke(); }
 const h=P[P.length-1], ha=1-(now-h.t)/inkLz.life; if(ha>0){ ctx.globalAlpha=Math.min(1,ha*1.4); ctx.shadowBlur=wd*3; ctx.shadowColor=col; ctx.fillStyle=col; ctx.beginPath(); ctx.arc((h.x+ox)*k,(h.y+oy)*k,wd*1.15,0,6.283); ctx.fill(); ctx.shadowBlur=0; ctx.fillStyle="#fff"; ctx.globalAlpha=Math.min(1,ha*1.4)*.9; ctx.beginPath(); ctx.arc((h.x+ox)*k,(h.y+oy)*k,wd*.45,0,6.283); ctx.fill(); }
 ctx.restore(); inkLz.raf=requestAnimationFrame(inkLaserLoop);
}
function inkLaserClear(){ inkLz.pts=[]; const c=el("ink-laser"); if(c)c.getContext("2d").clearRect(0,0,c.width,c.height); }

// ---------- เทป ----------
function inkTapeDraw(ctx,s,k,dx,dy){
 const p=s.p, n=Math.floor(p.length/3); if(n<2)return; const X=i=>(p[i*3]+dx)*k, Y=i=>(p[i*3+1]+dy)*k;
 ctx.save(); ctx.lineCap="butt"; ctx.lineJoin="round"; ctx.globalAlpha=s.o?.2:.96; ctx.strokeStyle=s.c; ctx.lineWidth=Math.max(1,s.w*k);
 ctx.beginPath(); ctx.moveTo(X(0),Y(0)); if(n===2)ctx.lineTo(X(1),Y(1)); else{ for(let i=1;i<n-1;i++)ctx.quadraticCurveTo(X(i),Y(i),(X(i)+X(i+1))/2,(Y(i)+Y(i+1))/2); ctx.lineTo(X(n-1),Y(n-1)); } ctx.stroke();
 if(!s.o){ ctx.globalAlpha=.16; ctx.strokeStyle="#fff"; ctx.lineWidth=Math.max(1,s.w*k*.55); ctx.stroke(); }          // แถบสว่างกลางเทป ให้ดูเป็นเทปจริง
 ctx.restore();
}
function inkTapeTap(x,y){ const pg=inkPage(); for(let q=pg.strokes.length-1;q>=0;q--){ const s=pg.strokes[q]; if(s.t==="t"&&inkHit(s,x,y,3)){ const next=pg.strokes.map((v,i)=>{ if(i!==q)return v; const o={...v}; if(o.o)delete o.o; else o.o=1; return o; }); inkCommit(next); inkStatus(next[q].o?"เปิดเทปแล้ว (แตะอีกครั้งเพื่อปิดบัง)":"ปิดเทปกลับแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },1800); return true; } } return false; }

// ---------- ลิงก์ ----------
function inkLinkMenu(a){
 const pg=inkPage(), has=inkSelHasLink();
 inkPop(`<div class="ink-ph">ใส่ลิงก์ให้สิ่งที่เลือก</div><input id="ink-lurl" class="ink-sinp" placeholder="วางลิงก์เว็บ เช่น https://…" inputmode="url" autocapitalize="off" autocorrect="off" style="margin-bottom:6px"><button type="button" class="ink-mi" data-lk="url">🌐 ตั้งเป็นลิงก์เว็บ</button>
${ink.board?"":`<div class="ink-ph">ไปหน้า…</div><div class="ink-row">${ink.pages.map((p,i)=>`<button type="button" class="ink-opt" data-lk="pg" data-v="${p.id}">หน้า ${i+1}</button>`).join("")}</div>`}
${(ink.bm||[]).length?`<div class="ink-ph">ไปบุ๊กมาร์ก…</div>${ink.bm.map(b=>`<button type="button" class="ink-mi" data-lk="bm" data-v="${b.id}">🔖 ${esc(b.l)}</button>`).join("")}`:""}
${has?`<button type="button" class="ink-mi danger" data-lk="del">เอาลิงก์ออก</button>`:""}
<div class="hint" style="margin:8px 4px 0;font-size:12px">ใช้ลิงก์: เลือกเครื่องมือ “เลื่อนหน้า” (มือ) หรือโหมดนำเสนอ แล้วแตะที่ชิ้นงาน</div>`,a);
}
function inkLinkSet(u){ inkSelApply(s=>{ const o={...s}; if(u)o.u=u; else delete o.u; return o; }); inkClosePop(); inkStatus(u?"ใส่ลิงก์แล้ว":"เอาลิงก์ออกแล้ว","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2000); }
function inkLinkGo(u){
 if(!u)return;
 if(u.k==="url"){ let h=String(u.v||""); if(!/^[a-z][a-z0-9+.-]*:/i.test(h))h="https://"+h; if(/^(https?:|mailto:|tel:)/i.test(h)){ try{ window.open(h,"_blank","noopener"); }catch(e){} } }
 else if(u.k==="pg"){ const i=ink.pages.findIndex(p=>p.id===u.v); if(i>=0)inkGo(i); }
 else if(u.k==="bm"){ const b=(ink.bm||[]).find(x=>x.id===u.v); if(b&&typeof inkBmGo==="function")inkBmGo(b); }
}
function inkLinkTap(e){
 if(!ink.note)return false; const [x,y]=inkToPage(e), pg=inkPage();
 for(let q=pg.strokes.length-1;q>=0;q--){ const s=pg.strokes[q]; if(s.u&&inkHit0(s,x,y,12*inkPx())){ inkLinkGo(s.u); return true; } } return false;
}

(function inkMoreWire(){
 const dlg=el("inkdlg"); if(!dlg)return;
 el("ink-sellock").onclick=inkLockToggle;
 el("ink-selz").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-sz]")){ inkClosePop(); return; } if(ink.sel)inkZMenu(e.currentTarget); };
 el("ink-sellink").onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-lk]")){ inkClosePop(); return; } if(ink.sel)inkLinkMenu(e.currentTarget); };
 dlg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return;
  if(b.dataset.sz){ inkReorder(b.dataset.sz); inkClosePop(); return; }
  if(b.dataset.lk){ const k=b.dataset.lk; if(k==="url"){ const v=(el("ink-lurl").value||"").trim(); if(!v)return; inkLinkSet({k:"url",v}); } else if(k==="del")inkLinkSet(null); else inkLinkSet({k,v:b.dataset.v}); return; } });
 // ซ่อน/เคลียร์เลเซอร์เมื่อเปลี่ยนเครื่องมือ
 dlg.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b&&b.dataset.itool&&b.dataset.itool!=="laser")inkLaserClear(); });
})();
