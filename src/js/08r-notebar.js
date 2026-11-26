// ===== หน้าเขียนบันทึก: แถบเครื่องมือแถวเดียว + เมนูแบบดรอปดาวน์ (v14.14.67) =====
// เดิม: ฟอนต์ 10 ปุ่ม + ขนาด 7 ปุ่ม เรียงยาว และเครื่องมือ ~30 ปุ่มกระจาย 2 แถว
// ใหม่: ↶ ↷ ⌫ | [Aa ฟอนต์ · ขนาด ▾] | B I U A | ☑ To-do | [¶ ย่อหน้า ▾] [＋ แทรก ▾] [✨ AI ▾] [⋯]
// ปุ่มจริงทุกปุ่มยังเป็นปุ่มเดิม (data-ne) แค่ย้ายเข้าเมนู → ทุกฟังก์ชันทำงานเหมือนเดิม
(function(){ const nt=el("ntool"), dlg=el("ndlg"), fb=el("nefbar"); if(!nt||!dlg)return;
 try{ localStorage.setItem("sw-ntc","1"); }catch(e){} dlg.classList.add("ncompact","nbar2"); const tg=el("ntc-tg"); if(tg)tg.remove();
 const B=k=>nt.querySelector('[data-ne="'+k+'"]');
 const lab={h2:"H1 · หัวข้อใหญ่",h3:"H2 · หัวข้อย่อย",ul:"• รายการ (บูเลต)",ol:"1. เลขข้อ",outdent:"⇤ เลื่อนออก",indent:"⇥ เลื่อนเข้า",fold:"▾ พับ/ขยายทุกหัวข้อ",hr:"— เส้นคั่น",
  img:"🖼 รูปภาพ",table:"▦ ตาราง",link:"🔗 ลิงก์",stk:"🔥 สติกเกอร์สถานะ",calc:"🧮 เครื่องคิดเลข",mic:"🎤 พูดให้พิมพ์",
  ai:"✨ ถาม AI / สอนใช้งาน",act:"🧾 สรุปประชุม → งาน",strike:"<s>S</s> ขีดฆ่า",light:'<span style="font-weight:300">บาง</span> ตัวบาง',clear:"🧹 ล้างรูปแบบ",hist:"🕘 ประวัติเวอร์ชัน"};
 const row=document.createElement("div"); row.className="nb2"; row.id="nb2";
 const sep=()=>{ const s=document.createElement("span"); s.className="sep"; return s; };
 const trig=(id,html,title)=>{ const b=document.createElement("button"); b.type="button"; b.className="nb2-t"; b.id=id; b.innerHTML=html; b.title=title; b.setAttribute("aria-haspopup","menu"); b.setAttribute("aria-expanded","false"); return b; };
 const menus={};
 const menu=(id,keys,cls)=>{ const p=document.createElement("div"); p.className="nb2-pop"+(cls?" "+cls:""); p.id=id; p.hidden=true; p.setAttribute("role","menu");
  keys.forEach(k=>{ const b=B(k); if(!b)return; if(lab[k])b.innerHTML=lab[k]; b.setAttribute("role","menuitem"); p.appendChild(b); }); nt.appendChild(p); menus[id]=p; return p; };
 // แถวหลัก
 ["undo","redo","del"].forEach(k=>{ const b=B(k); if(b)row.appendChild(b); }); const d=B("del"); if(d){ d.textContent="⌫"; }
 row.appendChild(sep());
 const ft=trig("nb2-font",'<span class="nb2-ff">Sarabun</span><span class="nb2-fs">15</span><i>▾</i>',"ฟอนต์และขนาดตัวอักษร"); row.appendChild(ft);
 row.appendChild(sep());
 ["bold","italic","underline","color"].forEach(k=>{ const b=B(k); if(b)row.appendChild(b); });
 row.appendChild(sep());
 const ck=B("ck"); if(ck)row.appendChild(ck);
 const pt=trig("nb2-par","¶ ย่อหน้า <i>▾</i>","หัวข้อ · รายการ · เลขข้อ · เลื่อนเข้า/ออก · เส้นคั่น"); row.appendChild(pt);
 const it=trig("nb2-ins","＋ แทรก <i>▾</i>","รูป · ตาราง · ลิงก์ · สติกเกอร์ · คิดเลข · พูด"); row.appendChild(it);
 const at=trig("nb2-ai","✨ AI <i>▾</i>","ถาม AI · สรุปประชุมเป็นงาน"); row.appendChild(at);
 const mt=trig("nb2-more","⋯","ขีดฆ่า · ตัวบาง · ล้างรูปแบบ · ประวัติ"); mt.classList.add("nb2-dots"); row.appendChild(mt);
 menu("nb2m-par",["h2","h3","ul","ol","outdent","indent","fold","hr"]);
 menu("nb2m-ins",["img","table","link","stk","calc","mic"]);
 menu("nb2m-ai",["ai","act"]);
 menu("nb2m-more",["strike","light","clear","hist"]);
 // ฟอนต์ → แผงเลือก (ใช้ #nefbar เดิม ให้ตัวจัดการเดิมทำงานต่อ)
 if(fb){ fb.classList.add("nb2-pop","nb2-fpop"); fb.hidden=true; fb.setAttribute("role","menu"); nt.appendChild(fb); menus.nefbar=fb; }
 // ลบแถวเดิม/ตัวคั่นที่ว่าง แล้ววางแถวใหม่ไว้บนสุด
 const old=el("ntrow"); if(old){ [...old.children].forEach(c=>{ if(c.matches("button[data-ne]"))menus["nb2m-more"].appendChild(c); }); old.remove(); }
 nt.querySelectorAll(":scope>.sep,:scope>button[data-ne]").forEach(x=>{ if(x.tagName==="BUTTON")menus["nb2m-more"].appendChild(x); else x.remove(); });
 nt.insertBefore(row,nt.firstChild);
 const pairs=[[ft,fb],[pt,menus["nb2m-par"]],[it,menus["nb2m-ins"]],[at,menus["nb2m-ai"]],[mt,menus["nb2m-more"]]];
 const closeAll=ex=>pairs.forEach(([t,p])=>{ if(p&&p!==ex){ p.hidden=true; t.setAttribute("aria-expanded","false"); t.classList.remove("on"); } });
 window.nb2Close=()=>closeAll(null);
 function place(t,p){ p.style.left="0px"; p.style.top="0px"; const o=p.getBoundingClientRect(), z=(p.offsetWidth?o.width/p.offsetWidth:1)||1, r=t.getBoundingClientRect();
  const w=o.width, x=Math.max(8,Math.min(innerWidth-w-8,r.left)), spaceB=innerHeight-r.bottom, h=o.height; let y=r.bottom+4; if(h>spaceB-12&&r.top>spaceB)y=Math.max(8,r.top-4-h);
  p.style.left=((x-o.left)/z)+"px"; p.style.top=((y-o.top)/z)+"px"; p.style.maxHeight=Math.max(160,(y>r.top?innerHeight-y-12:r.top-12))/z+"px"; }
 pairs.forEach(([t,p])=>{ if(!p)return;
  t.addEventListener("mousedown",e=>e.preventDefault());
  t.addEventListener("click",e=>{ e.preventDefault(); e.stopPropagation(); try{ neSave(); }catch(x){} const open=p.hidden; closeAll(); if(!open)return;
   p.hidden=false; t.setAttribute("aria-expanded","true"); t.classList.add("on"); if(p===fb)try{ neFBarSync(); }catch(x){} place(t,p); });
  p.addEventListener("mousedown",e=>{ if(!e.target.closest("input"))e.preventDefault(); });
  // เลือกแล้วปิดเมนู (ยกเว้น A−/A+ ให้กดซ้ำได้)
  p.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; if(b.dataset.fsz==="-2"||b.dataset.fsz==="2")return; setTimeout(()=>{ p.hidden=true; t.setAttribute("aria-expanded","false"); t.classList.remove("on"); },0); }); });
 document.addEventListener("pointerdown",e=>{ if(!e.target.closest(".nb2-pop,.nb2-t"))closeAll(); },true);
 document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&pairs.some(([,p])=>p&&!p.hidden)){ e.preventDefault(); e.stopPropagation(); closeAll(); } },true);
 dlg.addEventListener("close",()=>closeAll());
 const bd=dlg.querySelector(".dlg-b"); if(bd)bd.addEventListener("scroll",()=>closeAll(),{passive:true}); addEventListener("resize",()=>closeAll());
})();
// แผงฟอนต์: หัวแผง + ชื่อฟอนต์ในปุ่มด้านบน
{ const _s=neFBarSync; neFBarSync=function(){ const r=_s.apply(this,arguments); try{ const bar=el("nefbar"), t=el("nb2-font"); if(!bar||!t)return r;
  const on=bar.querySelector("[data-ffk].on"), key=on?on.dataset.ffk:"sarabun", f=NE_FONTS.find(x=>x[0]===key)||NE_FONTS[0];
  const ff=t.querySelector(".nb2-ff"); ff.textContent=f[1].replace(" Sans Thai",""); ff.style.fontFamily=f[3]+",Sarabun,sans-serif";
  t.querySelector(".nb2-fs").textContent=(el("nefs-v")||{}).textContent||"15"; t.classList.toggle("sel",neFScope==="sel");
  t.title="ฟอนต์และขนาด · ใช้กับ"+(neFScope==="sel"?"ข้อความที่เลือก":"ทั้งบันทึก"); }catch(e){} return r; }; }
{ const _o=openNote; openNote=function(){ const r=_o.apply(this,arguments); try{ if(window.nb2Close)nb2Close(); neFBarSync(); }catch(e){} return r; }; }
