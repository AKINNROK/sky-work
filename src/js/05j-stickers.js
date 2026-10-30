// ===== สติกเกอร์สถานะงานแบบขยับได้ (ด่วน · HOT · เสร็จแล้ว ฯลฯ) =====
// ใช้ 3 ที่: ① ติดที่รายการงาน (items.stk = ["hot","done:e"…]) ② แทรกในตัวแก้ไข “เขียนบันทึก” (span[data-stk]) ③ วางบนสมุด/กระดาน (ลายเส้นชนิด "k")
// รหัส "hot" = ป้ายพร้อมข้อความ · "hot:e" = อีโมจิเดี่ยว ๆ ไม่มีป้าย — ภาพขยับด้วย CSS (ปิดอัตโนมัติถ้าเครื่องตั้งค่าลดการเคลื่อนไหว) ส่วนในไฟล์ PDF/รูปส่งออกจะเป็นภาพนิ่ง
const STK=[
{k:"urgent",e:"🚨",l:"ด่วน",c:"#dc2626",f:"#fff",a:"pulse"},
{k:"hot",e:"🔥",l:"HOT",c:"#ea580c",f:"#fff",a:"flame"},
{k:"asap",e:"⚡",l:"ด่วนมาก",c:"#f59e0b",f:"#1d1d1f",a:"zap"},
{k:"due",e:"⏰",l:"ใกล้กำหนด",c:"#be123c",f:"#fff",a:"shake"},
{k:"imp",e:"❗",l:"สำคัญ",c:"#b91c1c",f:"#fff",a:"pulse"},
{k:"doing",e:"🚧",l:"กำลังทำ",c:"#0284c7",f:"#fff",a:"bounce"},
{k:"wait",e:"⏳",l:"รอ",c:"#7c3aed",f:"#fff",a:"flip"},
{k:"reply",e:"💬",l:"รอตอบ",c:"#4f46e5",f:"#fff",a:"bounce"},
{k:"review",e:"👀",l:"รอตรวจ",c:"#0d9488",f:"#fff",a:"look"},
{k:"done",e:"✅",l:"เสร็จแล้ว",c:"#16a34a",f:"#fff",a:"pop"},
{k:"new",e:"🆕",l:"ใหม่",c:"#2563eb",f:"#fff",a:"wiggle"},
{k:"star",e:"⭐",l:"เด่น",c:"#eab308",f:"#1d1d1f",a:"spin"},
{k:"warn",e:"⚠️",l:"ระวัง",c:"#f59e0b",f:"#1d1d1f",a:"blink"},
{k:"go",e:"🚀",l:"เริ่มแล้ว",c:"#7c3aed",f:"#fff",a:"float"},
{k:"money",e:"💰",l:"งบ",c:"#15803d",f:"#fff",a:"bounce"},
{k:"idea",e:"💡",l:"ไอเดีย",c:"#facc15",f:"#1d1d1f",a:"blink"},
{k:"win",e:"🎉",l:"สำเร็จ!",c:"#db2777",f:"#fff",a:"wiggle"},
{k:"love",e:"❤️",l:"ชอบ",c:"#e11d48",f:"#fff",a:"beat"},
{k:"cancel",e:"❌",l:"ยกเลิก",c:"#6b7280",f:"#fff",a:"none"},
{k:"lock",e:"🔒",l:"ปิดงาน",c:"#374151",f:"#fff",a:"none"},
// ชุดอีโมจิขยับ (ไอคอนเดี่ยว ไม่มีป้าย)
{k:"thumb",e:"👍",l:"ดีมาก",c:"#2563eb",f:"#fff",a:"pop",o:1},{k:"clap",e:"👏",l:"ปรบมือ",c:"#2563eb",f:"#fff",a:"wiggle",o:1},{k:"pray",e:"🙏",l:"ขอบคุณ",c:"#2563eb",f:"#fff",a:"float",o:1},
{k:"smile",e:"😀",l:"ยิ้ม",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"lol",e:"😂",l:"ขำ",c:"#2563eb",f:"#fff",a:"shake",o:1},{k:"cool",e:"😎",l:"เท่",c:"#2563eb",f:"#fff",a:"pop",o:1},
{k:"think",e:"🤔",l:"คิด",c:"#2563eb",f:"#fff",a:"look",o:1},{k:"shock",e:"😱",l:"ตกใจ",c:"#2563eb",f:"#fff",a:"zap",o:1},{k:"eyeh",e:"😍",l:"รัก",c:"#2563eb",f:"#fff",a:"beat",o:1},
{k:"muscle",e:"💪",l:"สู้ๆ",c:"#2563eb",f:"#fff",a:"pop",o:1},{k:"spark",e:"✨",l:"ประกาย",c:"#2563eb",f:"#fff",a:"blink",o:1},{k:"boom",e:"💥",l:"ปัง",c:"#2563eb",f:"#fff",a:"zap",o:1},
{k:"bell",e:"🔔",l:"แจ้งเตือน",c:"#2563eb",f:"#fff",a:"shake",o:1},{k:"pin",e:"📌",l:"ปักหมุด",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"mega",e:"📢",l:"ประกาศ",c:"#2563eb",f:"#fff",a:"wiggle",o:1},
{k:"trophy",e:"🏆",l:"รางวัล",c:"#2563eb",f:"#fff",a:"pop",o:1},{k:"hund",e:"💯",l:"เต็ม 100",c:"#2563eb",f:"#fff",a:"beat",o:1},{k:"coffee",e:"☕",l:"พักก่อน",c:"#2563eb",f:"#fff",a:"float",o:1},
{k:"cake",e:"🎂",l:"วันเกิด",c:"#2563eb",f:"#fff",a:"wiggle",o:1},{k:"luck",e:"🍀",l:"โชคดี",c:"#2563eb",f:"#fff",a:"spin",o:1},{k:"sun",e:"☀️",l:"แจ่มใส",c:"#2563eb",f:"#fff",a:"spin",o:1},
{k:"rain",e:"🌧️",l:"อุปสรรค",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"eyes",e:"👀",l:"จับตา",c:"#2563eb",f:"#fff",a:"look",o:1},{k:"run",e:"🏃",l:"รีบ",c:"#2563eb",f:"#fff",a:"hop",o:1},{k:"bomb",e:"💣",l:"เสี่ยง",c:"#2563eb",f:"#fff",a:"shake",o:1}];
const stkDef=key=>{ const [k]=String(key||"").split(":"); return STK.find(x=>x.k===k)||null; };
const stkValid=key=>/^[a-z]{2,8}(:e)?$/.test(String(key||""))&&!!stkDef(key);
const stkIsE=key=>String(key||"").endsWith(":e");
function stkInner(key){ const d=stkDef(key); if(!d)return ""; return stkIsE(key)?`<i>${d.e}</i>`:`<i>${d.e}</i><b>${esc(d.l)}</b>`; }
function stkHtml1(key){ const d=stkDef(key); if(!d)return ""; const e=stkIsE(key); return `<span class="stk stk-${d.a}${e?" stk-e":""}"${e?"":` style="background:${d.c};color:${d.f}"`} title="${esc(d.l)}">${stkInner(key)}</span>`; }
function stkHtml(t){ const a=t&&Array.isArray(t.stk)?t.stk.filter(stkValid):[]; return a.length?`<span class="stks">${a.map(stkHtml1).join("")}</span>`:""; }
function stkPlainLabel(key){ const d=stkDef(key); return d?d.l:""; }
// สร้าง element สำหรับแทรกในบันทึก
function stkNode(key){ const s=document.createElement("span"); s.className="stk stk-"+stkDef(key).a+(stkIsE(key)?" stk-e":""); if(!stkIsE(key)){ const d=stkDef(key); s.style.background=d.c; s.style.color=d.f; } s.setAttribute("data-stk",key); s.setAttribute("contenteditable","false"); s.innerHTML=stkInner(key); return s; }

// ---------- ① ฟอร์มรายการงาน ----------
let formStk=[];
function stkPickerHtml(sel,attr){ const chip=(k,e)=>{ const key=k+(e?":e":""), on=sel.includes(key); return `<button type="button" class="stkc${on?" on":""}" ${attr}="${key}" title="${esc(stkDef(key).l)}">${stkHtml1(key)}</button>`; };
 return `<div class="stkpick">${STK.filter(d=>!d.o).map(d=>chip(d.k,0)).join("")}</div><div class="stkpick" style="margin-top:6px">${STK.map(d=>chip(d.k,1)).join("")}</div>`; }
function stkPickerPaint(){ const b=el("f-stk"); if(b)b.innerHTML=stkPickerHtml(formStk,"data-fstk"); }
(function(){ const b=el("f-stk"); if(!b)return; b.addEventListener("click",e=>{ const x=e.target.closest("[data-fstk]"); if(!x)return; const k=x.dataset.fstk, i=formStk.indexOf(k); if(i>=0)formStk.splice(i,1); else{ if(formStk.length>=4){ setFoot("ติดสติกเกอร์ได้สูงสุด 4 อัน"); return; } formStk.push(k); } stkPickerPaint(); }); })();

// ---------- ② เขียนบันทึก ----------
const neStkHtml=()=>`<div class="nepl">สติกเกอร์สถานะ (แตะเพื่อแทรกตรงเคอร์เซอร์)</div><div class="stkpick" style="max-width:340px">${STK.filter(d=>!d.o).map(d=>`<button type="button" class="stkc" data-stkp="${d.k}">${stkHtml1(d.k)}</button>`).join("")}</div><div class="stkpick" style="max-width:340px;margin-top:6px">${STK.map(d=>`<button type="button" class="stkc" data-stkp="${d.k}:e">${stkHtml1(d.k+":e")}</button>`).join("")}</div>`;
function neStkInsert(key){ if(!stkValid(key))return; neRestore(); neInsertNode(stkNode(key),true); }

// ---------- ③ สมุดเขียนมือ / กระดานกว้าง ----------
// ลายเส้น {t:"k",k:"hot",p:[x1,y1,0,x2,y2,0],r?,lk?} — วาดนิ่งลง canvas (ใช้ตอนส่งออก/รูปย่อ) และบนจอใช้ element ขยับซ้อนทับแทน
function inkStkDraw(ctx,s,k,dx,dy){
 const d=stkDef(s.k); if(!d)return; const p=s.p, x0=Math.min(p[0],p[3]), y0=Math.min(p[1],p[4]), w=Math.abs(p[3]-p[0]), h=Math.abs(p[4]-p[1]); if(w<2||h<2)return; const e=stkIsE(s.k);
 ctx.save(); if(s.r){ const cx=(x0+w/2+dx)*k, cy=(y0+h/2+dy)*k; ctx.translate(cx,cy); ctx.rotate(s.r); ctx.translate(-cx,-cy); }
 const X=(x0+dx)*k, Y=(y0+dy)*k, W=w*k, H=h*k; ctx.textBaseline="middle";
 if(e){ ctx.font=(Math.min(W,H)*.8)+"px \"Apple Color Emoji\",\"Segoe UI Emoji\",\"Noto Color Emoji\",sans-serif"; ctx.textAlign="center"; ctx.fillText(d.e,X+W/2,Y+H/2+H*.04); ctx.restore(); return; }
 ctx.shadowColor="rgba(0,0,0,.25)"; ctx.shadowBlur=H*.1; ctx.shadowOffsetY=H*.04; ctx.fillStyle=d.c; const r=H/2; ctx.beginPath(); ctx.moveTo(X+r,Y); ctx.lineTo(X+W-r,Y); ctx.arc(X+W-r,Y+r,r,-Math.PI/2,Math.PI/2); ctx.lineTo(X+r,Y+H); ctx.arc(X+r,Y+r,r,Math.PI/2,Math.PI*1.5); ctx.closePath(); ctx.fill(); ctx.shadowColor="transparent";
 ctx.font=(H*.5)+"px \"Apple Color Emoji\",\"Segoe UI Emoji\",\"Noto Color Emoji\",sans-serif"; ctx.textAlign="left"; ctx.fillStyle="#fff"; ctx.fillText(d.e,X+H*.22,Y+H/2+H*.03);
 let fs=H*.4; ctx.font="700 "+fs+"px Sarabun,\"Noto Sans Thai\",sans-serif"; const avail=W-H*1.05-H*.22; const tw=ctx.measureText(d.l).width; if(tw>avail&&avail>0){ fs*=avail/tw; ctx.font="700 "+fs+"px Sarabun,\"Noto Sans Thai\",sans-serif"; }
 ctx.fillStyle=d.f; ctx.textAlign="left"; ctx.fillText(d.l,X+H*1.0,Y+H/2+H*.03); ctx.restore();
}
function inkStkSync(){
 const pg=el("ink-pg"); if(!pg)return; let L=el("ink-stkl"); if(!L){ L=document.createElement("div"); L.id="ink-stkl"; L.className="ink-stkl"; pg.appendChild(L); }
 const S=ink.note&&ink.pages[ink.cur]?ink.pages[ink.cur].strokes:[], hide=ink.drag&&ink.drag.hide, base=el("ink-base"); if(!base||!base.width){ L.innerHTML=""; L._h=""; return; }
 const f=base.clientWidth/base.width, [ox,oy]=inkO(), kk=ink.k*f, vw=base.clientWidth/kk, vh=base.clientHeight/kk; let html="";
 S.forEach((s,i)=>{ if(s.t!=="k"||(hide&&hide.has(i)))return; const d=stkDef(s.k); if(!d)return; const p=s.p, x0=Math.min(p[0],p[3])+ox, y0=Math.min(p[1],p[4])+oy, w=Math.abs(p[3]-p[0]), h=Math.abs(p[4]-p[1]), e=stkIsE(s.k);
  if(x0>vw+60||y0>vh+60||x0+w<-60||y0+h<-60)return;
  html+=`<span class="stk stk-${d.a}${e?" stk-e":""}" style="left:${x0.toFixed(1)}px;top:${y0.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;font-size:${(h*(e?.8:.4)).toFixed(1)}px;${e?"":`background:${d.c};color:${d.f};`}${s.r?`transform:rotate(${s.r}rad);`:""}">${stkInner(s.k)}</span>`; });
 L.style.transform="scale("+kk+")"; if(L._h!==html){ L.innerHTML=html; L._h=html; }
}
function inkStkMenu(a){ inkPop(`<div class="ink-ph">สติกเกอร์สถานะ (แตะเพื่อวางกลางหน้าจอ แล้วลากย้าย/ย่อขยายได้)</div><div class="stkpick" style="max-width:330px">${STK.filter(d=>!d.o).map(d=>`<button type="button" class="stkc" data-istk="${d.k}">${stkHtml1(d.k)}</button>`).join("")}</div><div class="stkpick" style="max-width:330px;margin-top:6px">${STK.map(d=>`<button type="button" class="stkc" data-istk="${d.k}:e">${stkHtml1(d.k+":e")}</button>`).join("")}</div>`,a); }
function inkStkAdd(key){
 const d=stkDef(key); if(!d||!ink.note)return; const st=el("ink-stage"), r=st.getBoundingClientRect(), [cx0,cy0]=inkToPage({clientX:r.left+r.width/2,clientY:r.top+r.height/2});
 const pg=inkPage(), n=pg.strokes.filter(s=>s.t==="k").length%6, cx=cx0+n*22, cy=cy0+n*22; const viewH=ink.board?st.clientHeight/ink.z:INK_H, h=Math.max(44,Math.min(120,viewH*.085)), e=stkIsE(key), w=e?h:h*(1.25+.5*Math.min(9,[...d.l].filter(c=>!/[ัิ-ฺ็-๎]/.test(c)).length));
 const o={t:"k",k:key,c:"#000",w:0,p:[+(cx-w/2).toFixed(1),+(cy-h/2).toFixed(1),0,+(cx+w/2).toFixed(1),+(cy+h/2).toFixed(1),0]};
 const next=[...pg.strokes,o], idx=new Set([pg.strokes.length]); ink.tool="lasso"; inkCommit(next,true); ink.sel={idx,box:inkBBox(next,idx)}; inkDrawSel(); inkToolbar(); inkClosePop();
}
(function(){ const dlg=el("inkdlg"); if(!dlg)return; dlg.addEventListener("click",e=>{ const b=e.target.closest("[data-istk]"); if(b){ e.stopPropagation(); inkStkAdd(b.dataset.istk); } }); })();
