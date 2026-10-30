// ===== Tooltip กลาง: ใส่ data-tip="บรรทัด1\nบรรทัด2" ที่ element ไหนก็ได้ (รวมถึงกราฟ SVG) =====
// บรรทัดแรก = หัวข้อ (ตัวหนา) · บรรทัดที่ขึ้นต้นด้วย "• " = รายการย่อย · บรรทัด "ชื่อ|ค่า" = แถวตัวเลข
function tipAttr(...lines){
const s=lines.flat(Infinity).filter(x=>x!==undefined&&x!==null&&x!==""&&x!==false).join("\n");
return s?` data-tip="${String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}"`:"";
}
// รายการย่อยสำหรับ tooltip: โชว์สูงสุด max รายการ แล้วสรุป "และอีก N"
function tipList(arr,f,max){
max=max||8; f=f||(t=>t.title||"");
const a=(arr||[]).slice(0,max).map(x=>"• "+f(x));
if((arr||[]).length>max)a.push("…และอีก "+(arr.length-max)+" รายการ");
return a;
}
let _tipEl=null, _tipFor=null, _touchAt=0;
function tipBox(){ if(!_tipEl){ _tipEl=document.createElement("div"); _tipEl.id="tip"; _tipEl.setAttribute("role","tooltip"); _tipEl.hidden=true; document.body.appendChild(_tipEl);} return _tipEl; }
function tipHide(){ if(_tipEl)_tipEl.hidden=true; _tipFor=null; }
function tipShow(target,x,y){
const raw=target.getAttribute("data-tip"); if(!raw)return;
const b=tipBox();
if(_tipFor!==target){
_tipFor=target; b.textContent="";
raw.split("\n").forEach((ln,i)=>{
const d=document.createElement("div");
if(i===0){ d.className="th"; d.textContent=ln; }
else if(ln.startsWith("• ")){ d.className="tl"; d.textContent=ln.slice(2); }
else if(ln.includes("|")&&!ln.startsWith("…")){ const k=ln.indexOf("|"); d.className="tr"; const a=document.createElement("span"); a.textContent=ln.slice(0,k); const v=document.createElement("b"); v.textContent=ln.slice(k+1); d.append(a,v); }
else { d.className="tn"; d.textContent=ln; }
b.appendChild(d); });
}
b.hidden=false;
const r=b.getBoundingClientRect(), W=innerWidth, H=innerHeight;
let L=x+14, T=y+16;
if(L+r.width>W-8)L=Math.max(8,x-r.width-14);
if(T+r.height>H-8)T=Math.max(8,y-r.height-14);
b.style.left=L+"px"; b.style.top=T+"px";
}
function tipAnchor(t){ const r=t.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }
document.addEventListener("mouseover",e=>{ if(Date.now()-_touchAt<900)return; const t=e.target.closest&&e.target.closest("[data-tip]"); if(t)tipShow(t,e.clientX,e.clientY); else tipHide(); });
document.addEventListener("mousemove",e=>{ if(Date.now()-_touchAt<900)return; if(!_tipFor||!_tipEl||_tipEl.hidden)return; const t=e.target.closest&&e.target.closest("[data-tip]"); if(t&&t===_tipFor)tipShow(t,e.clientX,e.clientY); });
document.addEventListener("mouseout",e=>{ if(Date.now()-_touchAt<900)return; if(!e.relatedTarget)tipHide(); });
document.addEventListener("focusin",e=>{ const t=e.target.closest&&e.target.closest("[data-tip]"); if(t){ const [x,y]=tipAnchor(t); tipShow(t,x,y); } });
document.addEventListener("focusout",()=>tipHide());
// มือถือ/ทัช: แตะที่กราฟเพื่อดู แตะที่อื่นเพื่อปิด
document.addEventListener("touchstart",e=>{ _touchAt=Date.now(); const t=e.target.closest&&e.target.closest("[data-tip]"); if(t){ const p=e.touches[0]; if(_tipFor===t){tipHide();} else tipShow(t,p.clientX,p.clientY); } else tipHide(); },{passive:true});
window.addEventListener("scroll",tipHide,{passive:true});
document.addEventListener("keydown",e=>{ if(e.key==="Escape")tipHide(); });
