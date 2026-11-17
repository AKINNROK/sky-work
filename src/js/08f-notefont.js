// ===== ฟอนต์ + ขนาดตัวอักษรในหน้าเขียนบันทึก =====
// เลือกข้อความ → เปลี่ยนเฉพาะส่วนที่เลือก (span data-ff / data-fs) · ไม่เลือก → ปรับทั้งบันทึก (note.nf / note.ns)
const NE_FONTS=[["sarabun","Sarabun","ค่าเริ่มต้น อ่านง่าย","Sarabun"],["mitr","Mitr","หัวข้อ หนา เด่น","Mitr"],["prompt","Prompt","ทันสมัย","Prompt"],["kanit","Kanit","เรียบ คม","Kanit"],["niramit","Niramit","เรียวสุภาพ","Niramit"],["notosans","Noto Sans Thai","มาตรฐาน","'Noto Sans Thai'"],["plex","IBM Plex Sans Thai","ทางการ","'IBM Plex Sans Thai'"],["pridi","Pridi","มีหัว แบบหนังสือ","Pridi"],["mali","Mali","ลายมือ น่ารัก","Mali"],["itim","Itim","ลายมือ","Itim"]];
const NE_FKEYS=new Set(NE_FONTS.map(f=>f[0]));
const NE_FSIZES=[["เล็ก",12],["ปกติ",15],["ใหญ่",19],["ใหญ่มาก",26],["หัวข้อ",34]];
(function(){ const st=document.createElement("style"); st.id="nefont-css";
 st.textContent=NE_FONTS.map(f=>`[data-ff="${f[0]}"],[data-nf="${f[0]}"]{font-family:${f[3]},"Sarabun",system-ui,sans-serif}`).join("\n"); document.head.appendChild(st); })();
let neFScope="all";
function neNoteFontSet(key,px){ const n=NE(); if(!n)return; if(key&&NE_FKEYS.has(key))n.setAttribute("data-nf",key); else n.removeAttribute("data-nf");
 if(px>=9&&px<=72){ n.setAttribute("data-ns",px); n.style.fontSize=px+"px"; } else{ n.removeAttribute("data-ns"); n.style.fontSize=""; } }
function neViewFont(n){ const v=el("nvb"); if(!v)return; if(n&&n.nf&&NE_FKEYS.has(n.nf))v.setAttribute("data-nf",n.nf); else v.removeAttribute("data-nf"); v.style.fontSize=(n&&n.ns>=9&&n.ns<=72)?n.ns+"px":""; }
const neSelHas=()=>{ const s=getSelection(); return !!(neRange&&!neRange.collapsed&&NE().contains(neRange.commonAncestorContainer)); };
function neCurSize(){ if(neFScope==="all"){ return Math.round(parseFloat(getComputedStyle(NE()).fontSize)||15); }
 let n=neRange&&neRange.startContainer; if(n&&n.nodeType===1&&neRange.startOffset<n.childNodes.length)n=n.childNodes[neRange.startOffset]; if(n&&n.nodeType===3)n=n.parentElement; return Math.round(parseFloat(getComputedStyle(n&&n.nodeType===1?n:NE()).fontSize)||15); }
function neFBarHtml(){ return `<div class="nefbar-l" id="nefbar-sc">ฟอนต์ · ใช้กับ ทั้งบันทึก</div><div class="nefbar-r">
<div class="nefbar-f">${NE_FONTS.map(f=>`<button type="button" data-ffk="${f[0]}" title="${f[1]} · ${f[2]}" style="font-family:${f[3]},Sarabun,sans-serif">${f[1].replace(" Sans Thai","")}</button>`).join("")}<button type="button" data-ffk="" class="rs" title="กลับเป็นฟอนต์เริ่มต้น">รีเซ็ต</button></div>
<div class="nefbar-s"><button type="button" data-fsz="-2" aria-label="ลดขนาด">A−</button><b id="nefs-v">15</b><button type="button" data-fsz="2" aria-label="เพิ่มขนาด">A+</button>${NE_FSIZES.map(x=>`<button type="button" data-fsz="=${x[1]}" title="${x[1]}px">${x[0]}</button>`).join("")}<button type="button" data-fsz="0" class="rs" title="กลับเป็นขนาดมาตรฐาน">รีเซ็ต</button></div></div>`; }
function neFBarSync(){ const bar=el("nefbar"); if(!bar)return; const sel=neSelHas(); neFScope=sel?"sel":"all";
 const sc=el("nefbar-sc"); if(sc)sc.innerHTML="ฟอนต์ · ใช้กับ <b>"+(sel?"ข้อความที่เลือก":"ทั้งบันทึก")+"</b>"+(sel?"":" <small>(ลากเลือกข้อความเพื่อเปลี่ยนเฉพาะส่วน)</small>");
 let cur=NE().getAttribute("data-nf")||"sarabun";
 if(sel){ let n=neRange.startContainer; if(n&&n.nodeType===1&&neRange.startOffset<n.childNodes.length)n=n.childNodes[neRange.startOffset]; if(n&&n.nodeType===3)n=n.parentElement; const a=n&&n.closest?n.closest("[data-ff]"):null; if(a&&NE().contains(a))cur=a.getAttribute("data-ff"); }
 bar.querySelectorAll("[data-ffk]").forEach(b=>b.classList.toggle("on",!!b.dataset.ffk&&b.dataset.ffk===cur));
 const v=el("nefs-v"); if(v)v.textContent=neCurSize(); }
function neSpanTidy(){ NE().querySelectorAll("span:not([class])").forEach(sp=>{ if(!sp.getAttribute("style")&&!sp.getAttribute("data-ff")&&!sp.getAttribute("data-fs")&&!sp.hasAttribute("data-stk")){ while(sp.firstChild)sp.parentNode.insertBefore(sp.firstChild,sp); sp.remove(); } }); }
function neReselect(list){ if(!list.length)return; const r=document.createRange(); r.setStartBefore(list[0]); r.setEndAfter(list[list.length-1]); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
function neFlatten(){ ["data-fs","data-ff"].forEach(at=>NE().querySelectorAll("span["+at+"]").forEach(k=>{ let o=k.parentElement; while(o&&o!==NE()&&o.tagName==="SPAN"&&o.childNodes.length===1){ if(o.hasAttribute(at)){ o.removeAttribute(at); if(at==="data-fs"){ o.style.fontSize=""; if(!o.getAttribute("style"))o.removeAttribute("style"); } } o=o.parentElement; } })); }
function neApplyFont(key){
 neFScope=neSelHas()?"sel":"all";
 if(neFScope==="all"){ neNoteFontSet(key,+NE().getAttribute("data-ns")||0); neHistPush(); return; }
 neRestore(); const s0=NE().innerHTML;
 if(!key){ const r=getSelection().getRangeAt(0); NE().querySelectorAll("[data-ff]").forEach(sp=>{ if(r.intersectsNode(sp))sp.removeAttribute("data-ff"); }); }
 else{ document.execCommand("styleWithCSS",false,false); document.execCommand("fontName",false,"nefx__");
  const made=[]; NE().querySelectorAll('font[face="nefx__"]').forEach(f=>{ const sp=document.createElement("span"); sp.setAttribute("data-ff",key); while(f.firstChild)sp.appendChild(f.firstChild); f.replaceWith(sp); sp.querySelectorAll("[data-ff]").forEach(x=>x.removeAttribute("data-ff")); made.push(sp); }); neReselect(made); }
 neFlatten(); neSpanTidy(); neSave(); neState(); neHistPush(); }
function neApplySize(arg){
 neFScope=neSelHas()?"sel":"all";
 let cur=neCurSize(), px= arg==="0"?0 : arg[0]==="="?+arg.slice(1) : cur+(+arg);
 px=px?Math.max(9,Math.min(72,px)):0;
 if(neFScope==="all"){ neNoteFontSet(NE().getAttribute("data-nf")||"",px); }
 else{ neRestore();
  if(!px){ const r=getSelection().getRangeAt(0); NE().querySelectorAll("[data-fs]").forEach(sp=>{ if(r.intersectsNode(sp)){ sp.removeAttribute("data-fs"); sp.style.fontSize=""; if(!sp.getAttribute("style"))sp.removeAttribute("style"); } }); }
  else{ document.execCommand("styleWithCSS",false,false); document.execCommand("fontSize",false,"7");
   const made=[]; NE().querySelectorAll('font[size="7"]').forEach(f=>{ const sp=document.createElement("span"); made.push(sp); sp.setAttribute("data-fs",px); sp.style.fontSize=px+"px"; while(f.firstChild)sp.appendChild(f.firstChild); f.replaceWith(sp);
    sp.querySelectorAll("[data-fs]").forEach(x=>{ x.removeAttribute("data-fs"); x.style.fontSize=""; if(!x.getAttribute("style"))x.removeAttribute("style"); }); }); neReselect(made); }
  neFlatten(); neSpanTidy(); neSave(); neState(); }
 neHistPush(); const v=el("nefs-v"); if(v)v.textContent=px||neCurSize(); }
function neHistPush(){ try{ if(typeof neSnap==="function")neSnap(); }catch(e){} try{ if(typeof drLater==="function")drLater(); }catch(e){} }
(function(){ const nt=el("ntool"); if(!nt)return;
 const bar=document.createElement("div"); bar.id="nefbar"; bar.className="nefbar"; bar.innerHTML=neFBarHtml(); nt.insertBefore(bar,nt.firstChild);
 bar.addEventListener("mousedown",e=>{ e.preventDefault(); });
 bar.addEventListener("click",e=>{ const b=e.target.closest("[data-ffk],[data-fsz]"); if(!b)return; e.preventDefault(); neSave(); neFScope=neSelHas()?"sel":"all";
  if(b.dataset.ffk!==undefined)neApplyFont(b.dataset.ffk); else neApplySize(b.dataset.fsz); neFBarSync(); });
 let raf=0; document.addEventListener("selectionchange",()=>{ if(!el("ndlg").open)return; const s=getSelection(); if(s.rangeCount&&NE().contains(s.getRangeAt(0).commonAncestorContainer)){ neSave(); cancelAnimationFrame(raf); raf=requestAnimationFrame(neFBarSync); } });
 const _o=openNote; openNote=function(n){ const r=_o.apply(this,arguments); try{ neNoteFontSet(n&&n.nf||"",n&&n.ns||0); neRange=null; neFBarSync(); }catch(e){} return r; };
 const _v=viewNote; viewNote=function(n){ const r=_v.apply(this,arguments); try{ neViewFont(n); }catch(e){} return r; };
})();
