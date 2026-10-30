// ===== เครื่องคิดเลข + สูตร (กระดานกว้าง · สมุดเขียนมือ · เขียนบันทึก) =====
// 1) calcEval: ตัวคำนวณนิพจน์ (ไม่ใช้ eval) รองรับ + − × ÷ ^ % ( ) และฟังก์ชัน SUM AVG MIN MAX COUNT PRODUCT ROUND ABS SQRT (+ชื่อไทย รวม เฉลี่ย สูงสุด ต่ำสุด)
// 2) พิมพ์ "1200+350*2=" ได้ผลต่อท้ายทันที  3) เครื่องคิดเลขลอย  4) ลาสโซ่ตัวเลข → ผูกสูตรสด (ink)  5) รวมยอดอัตโนมัติในเทมเพลตค่าใช้จ่าย  6) สูตรในตารางของ “เขียนบันทึก”
const CALC_FN={SUM:a=>a.reduce((x,y)=>x+y,0),AVG:a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,MIN:a=>a.length?Math.min(...a):0,MAX:a=>a.length?Math.max(...a):0,COUNT:a=>a.length,PRODUCT:a=>a.reduce((x,y)=>x*y,1)};
const CALC_ALIAS={AVERAGE:"AVG",MEAN:"AVG","รวม":"SUM","เฉลี่ย":"AVG","สูงสุด":"MAX","ต่ำสุด":"MIN","นับ":"COUNT","คูณ":"PRODUCT"};
const calcDigits=s=>String(s).replace(/[๐-๙]/g,d=>"๐๑๒๓๔๕๖๗๘๙".indexOf(d));
function calcNorm(s){ s=calcDigits(s).replace(/[×✕]/g,"*").replace(/[÷∕]/g,"/").replace(/[−–—]/g,"-").replace(/[（]/g,"(").replace(/[）]/g,")").replace(/，/g,",");
 if(!/[A-Za-z฀-๿]/.test(s)){ let p; do{ p=s; s=s.replace(/(\d),(\d{3})(?!\d)/g,"$1$2"); }while(s!==p); } return s; }
// opts.cell(colIndex1,row1) → number|null (สำหรับอ้างอิงช่อง เช่น B3, A1:A5)
function calcEval(src,opts){
 const s=calcNorm(src); let i=0; const cell=opts&&opts.cell;
 const ws=()=>{ while(i<s.length&&/\s/.test(s[i]))i++; };
 const err=m=>{ throw new Error(m||"สูตรไม่ถูกต้อง"); };
 const colNum=L=>{ let n=0; for(const ch of L.toUpperCase())n=n*26+(ch.charCodeAt(0)-64); return n; };
 function expr(){ let a=term(); for(;;){ ws(); const c=s[i]; if(c==="+"||c==="-"){ i++; const b=term(); const f=b.p?(c==="+"?1+b.v:1-b.v):0; a={v:b.p?a.v*f:(c==="+"?a.v+b.v:a.v-b.v)}; } else break; } return a; }
 function term(){ let a=pow(); for(;;){ ws(); const c=s[i]; if(c==="*"||c==="/"){ i++; const b=pow(); if(c==="/"&&b.v===0)err("หารด้วยศูนย์"); a={v:c==="*"?a.v*b.v:a.v/b.v}; } else break; } return a; }
 function pow(){ const a=un(); ws(); if(s[i]==="^"){ i++; const b=pow(); return {v:Math.pow(a.v,b.v)}; } return a; }
 function un(){ ws(); if(s[i]==="-"){ i++; const a=un(); return {v:-a.v}; } if(s[i]==="+"){ i++; return un(); } return post(); }
 function post(){ let a=prim(); ws(); while(s[i]==="%"){ i++; a={v:a.v/100,p:1}; ws(); } return a; }
 function ref(){ const m=/^([A-Za-z]{1,2})(\d{1,3})/.exec(s.slice(i)); if(!m||!cell)return null; i+=m[0].length; return [colNum(m[1]),+m[2]]; }
 function rangeOrExpr(out){ ws(); const save=i, a=ref(); if(a){ ws(); if(s[i]===":"){ i++; ws(); const b=ref(); if(!b)err(); for(let r=Math.min(a[1],b[1]);r<=Math.max(a[1],b[1]);r++)for(let c=Math.min(a[0],b[0]);c<=Math.max(a[0],b[0]);c++){ const v=cell(c,r); if(v!=null)out.push(v); } return; } } i=save; out.push(expr().v); }
 function prim(){ ws(); const rest=s.slice(i); let m;
  if(s[i]==="("){ i++; const a=expr(); ws(); if(s[i]!==")")err("วงเล็บไม่ครบ"); i++; return {v:a.v}; }
  if((m=/^(\d+(\.\d*)?|\.\d+)/.exec(rest))){ i+=m[0].length; return {v:parseFloat(m[0])}; }
  if((m=/^[A-Za-zก-๏]+(?=\s*\()/.exec(rest))){ i+=m[0].length; ws(); i++; let nm=m[0].toUpperCase(); nm=CALC_ALIAS[nm]||CALC_ALIAS[m[0]]||nm; const args=[];
   ws(); if(s[i]===")"){ i++; } else{ for(;;){ rangeOrExpr(args); ws(); if(s[i]===","||s[i]===";"){ i++; continue; } if(s[i]===")"){ i++; break; } err("วงเล็บไม่ครบ"); } }
   if(CALC_FN[nm])return {v:CALC_FN[nm](args)};
   if(nm==="ROUND")return {v:(()=>{ const k=Math.pow(10,args[1]||0); return Math.round(args[0]*k)/k; })()};
   if(nm==="ABS")return {v:Math.abs(args[0])}; if(nm==="SQRT"){ if(args[0]<0)err("รากของค่าติดลบ"); return {v:Math.sqrt(args[0])}; }
   err("ไม่รู้จักฟังก์ชัน "+m[0]); }
  if(cell&&/^[A-Za-z]{1,2}\d{1,3}/.test(rest)){ const r=ref(); const v=cell(r[0],r[1]); return {v:v==null?0:v}; }
  err(); }
 const r=expr(); ws(); if(i<s.length)err(); if(!isFinite(r.v))err("คำนวณไม่ได้"); return Math.round(r.v*1e9)/1e9;
}
function calcFmt(n){ if(!isFinite(n))return "—"; n=Math.round(n*1e8)/1e8; return n.toLocaleString("en-US",{maximumFractionDigits:4}); }
function calcTry(s){ try{ if(!String(s||"").trim())return null; return calcEval(s); }catch(e){ return null; } }
// หาเลขทั้งหมดในข้อความ (รองรับ 1,200 · -5 · เลขไทย)
function calcNums(tx){ const m=calcDigits(tx||"").match(/-?\d[\d,]*(?:\.\d+)?|-?\.\d+/g)||[]; return m.map(x=>parseFloat(x.replace(/,/g,""))).filter(isFinite); }
const calcSum=a=>a.reduce((x,y)=>x+y,0);

// ---------- พิมพ์ “1200+350*2=” ได้ผลต่อท้าย ----------
const CALC_CH="0-9๐-๙().,%+\\-−*\\/^×÷ ";
function calcAutoLine(line){
 if(!/=\s*$/.test(line))return null; let body=line.replace(/\s*=\s*$/,""); let k=body.length;
 while(k>0&&new RegExp("^["+CALC_CH+"]$").test(body[k-1]))k--;
 let ex=body.slice(k); if(!ex.trim())return null;
 for(let n=0;n<5;n++){ const t=ex.trim().replace(/^[+*\/^×÷.,%\s]+/,""); if(/[+\-−*\/^×÷%]/.test(t.replace(/^[-−]/,""))&&/[0-9๐-๙]/.test(t)){ const v=calcTry(t); if(v!=null)return body.replace(/\s+$/,"")+"="+calcFmt(v); }
  const sp=ex.search(/\s\S/); if(sp<0)break; ex=ex.slice(sp+1); }
 return null;
}
function calcAutoText(tx){ let ch=false; const out=String(tx).split("\n").map(l=>{ const r=calcAutoLine(l); if(r!=null){ ch=true; return r; } return l; }); return ch?out.join("\n"):tx; }

// ---------- เครื่องคิดเลขลอย ----------
const CALC={exp:"",done:false,host:null,ins:null};
function calcPopEl(){ return el("calc-pop"); }
function calcClose(){ const p=calcPopEl(); if(p)p.remove(); CALC.ins=null; }
function calcSync(){ const inp=el("calc-in"); if(!inp)return; if(inp.value!==CALC.exp)inp.value=CALC.exp; const v=calcTry(CALC.exp), r=el("calc-res"); const plain=/^-?[\d.]+$/.test(CALC.exp.trim()); r.textContent=v==null?(CALC.exp.trim()?"…":" "):(plain&&!CALC.done?" ":"= "+calcFmt(v)); }
function calcKey(k){
 if(k==="C"){ CALC.exp=""; CALC.done=false; }
 else if(k==="⌫"){ CALC.exp=CALC.exp.slice(0,-1); CALC.done=false; }
 else if(k==="="){ const v=calcTry(CALC.exp); if(v!=null){ CALC.last={e:CALC.exp,r:v}; CALC.exp=String(v); CALC.done=true; } else{ const r=el("calc-res"); if(r)r.textContent="สูตรไม่ถูกต้อง"; return; } }
 else{ if(CALC.done&&/^[0-9.(]$/.test(k))CALC.exp=""; CALC.done=false; CALC.exp+=k; }
 calcSync();
}
function calcOpen(o){ // o={host, insert(txt), nums?:[number]}
 calcClose(); const p=document.createElement("div"); p.id="calc-pop"; p.className="calc-pop"; CALC.exp=""; CALC.done=false; CALC.last=null; CALC.ins=o.insert;
 const keys=["C","(",")","⌫","7","8","9","÷","4","5","6","×","1","2","3","−","0",".","%","+"];
 const st=o.nums&&o.nums.length?`<div class="calc-st"><span>ที่เลือก ${o.nums.length} ตัว</span><button type="button" data-cs="${calcSum(o.nums)}">รวม ${calcFmt(calcSum(o.nums))}</button><button type="button" data-cs="${calcSum(o.nums)/o.nums.length}">เฉลี่ย ${calcFmt(calcSum(o.nums)/o.nums.length)}</button><button type="button" data-cs="${Math.max(...o.nums)}">สูงสุด ${calcFmt(Math.max(...o.nums))}</button><button type="button" data-cs="${Math.min(...o.nums)}">ต่ำสุด ${calcFmt(Math.min(...o.nums))}</button></div>`:"";
 p.innerHTML=`<div class="calc-h"><b>🧮 เครื่องคิดเลข</b><button type="button" data-cc="x" aria-label="ปิด">✕</button></div>
 <input id="calc-in" inputmode="none" autocomplete="off" spellcheck="false" placeholder="พิมพ์ หรือกดเลข เช่น 1200+350*2" aria-label="นิพจน์">
 <div id="calc-res" class="calc-res"> </div>${st}
 <div class="calc-keys">${keys.map(k=>`<button type="button" data-ck="${k}" class="${/[0-9.]/.test(k)?"n":(k==="C"||k==="⌫"||k==="("||k===")")?"f":"o"}">${k}</button>`).join("")}<button type="button" data-ck="=" class="eq">=</button></div>
 <div class="calc-ins"><button type="button" data-cc="r">ใส่ผลลัพธ์</button><button type="button" data-cc="e">ใส่สูตร+ผล</button><button type="button" data-cc="cp">คัดลอก</button></div>`;
 o.host.appendChild(p); calcSync();
 p.addEventListener("pointerdown",e=>e.stopPropagation()); p.addEventListener("mousedown",e=>{ if(!e.target.closest("input"))e.preventDefault(); });
 const inp=el("calc-in"); inp.addEventListener("input",()=>{ CALC.exp=inp.value; CALC.done=false; calcSync(); }); inp.addEventListener("keydown",e=>{ e.stopPropagation(); if(e.key==="Enter"){ e.preventDefault(); calcKey("="); } else if(e.key==="Escape"){ calcClose(); } });
 p.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; e.stopPropagation();
  if(b.dataset.ck){ calcKey(b.dataset.ck); return; }
  if(b.dataset.cs){ if(CALC.done)CALC.exp=""; CALC.done=false; CALC.exp+=calcFmt(+b.dataset.cs).replace(/,/g,""); calcSync(); return; }
  const c=b.dataset.cc; if(c==="x"){ calcClose(); return; }
  let v=calcTry(CALC.exp); if(v==null){ const r=el("calc-res"); r.textContent="ยังไม่มีผลลัพธ์"; return; }
  const exp=CALC.done&&CALC.last?CALC.last.e:CALC.exp, txt=c==="e"?(exp.trim()+" = "+calcFmt(v)):calcFmt(v);
  if(c==="cp"){ (async()=>{ try{ await navigator.clipboard.writeText(calcFmt(v).replace(/,/g,"")); b.textContent="คัดลอกแล้ว ✓"; }catch(er){ b.textContent="คัดลอกไม่ได้"; } })(); return; }
  if(CALC.ins)CALC.ins(txt); });
 // ลากย้ายได้
 const h=p.querySelector(".calc-h"); h.addEventListener("pointerdown",e=>{ if(e.target.closest("button"))return; const r=p.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; h.setPointerCapture(e.pointerId);
  const mv=ev=>{ p.style.left=Math.max(0,Math.min(innerWidth-60,ev.clientX-dx))+"px"; p.style.top=Math.max(0,Math.min(innerHeight-60,ev.clientY-dy))+"px"; p.style.right="auto"; p.style.bottom="auto"; };
  const up=()=>{ h.removeEventListener("pointermove",mv); h.removeEventListener("pointerup",up); }; h.addEventListener("pointermove",mv); h.addEventListener("pointerup",up); });
 return p;
}
function calcOpenInk(){
 const nums=[]; if(ink.sel&&ink.note){ const S=inkPage().strokes; ink.sel.idx.forEach(i=>{ const s=S[i]; if(s&&s.t==="x")nums.push(...calcNums(s.tx)); }); }
 calcOpen({host:el("inkdlg"),nums,insert:txt=>{ const S=ink.sel&&ink.sel.idx.size===1?inkPage().strokes[[...ink.sel.idx][0]]:null; ink.voiceObj=(S&&S.t==="x"&&!S.fm)?S:null; inkVoiceText(txt); ink.voiceObj=null; }});
}
function calcOpenNote(){
 neSave(); const sel=getSelection(); const nums=(sel&&!sel.isCollapsed&&NE().contains(sel.anchorNode))?calcNums(sel.toString()):[];
 calcOpen({host:el("ndlg"),nums,insert:txt=>{ neRestore(); document.execCommand("insertText",false,txt); neSave(); }});
}
["inkdlg","ndlg"].forEach(id=>{ const d=el(id); if(d)d.addEventListener("close",calcClose); });

// ---------- ink: พิมพ์ในกล่องข้อความแล้วได้ผลทันทีเมื่อกด = ----------
(function(){ const f=inkTextEdit; inkTextEdit=function(){ const r=f.apply(this,arguments); const T=ink.ta; if(T&&T.ta&&!T.ta.__calc){ T.ta.__calc=1; const ta=T.ta;
  ta.addEventListener("input",e=>{ if(ta.selectionStart!==ta.value.length||!/=\s*$/.test(ta.value))return; const lines=ta.value.split("\n"), last=lines[lines.length-1], out=calcAutoLine(last); if(out!=null){ lines[lines.length-1]=out; ta.value=lines.join("\n"); ta.setSelectionRange(ta.value.length,ta.value.length); ta.dispatchEvent(new Event("input")); } }); }
  return r; }; })();

// ---------- ink: ผูกสูตรสด (ลาสโซ่ตัวเลข → รวม/เฉลี่ย/…) ----------
const CALC_OPS={sum:{lb:"รวม",t:"ผลรวม",f:v=>calcSum(v)},avg:{lb:"เฉลี่ย",t:"ค่าเฉลี่ย",f:v=>calcSum(v)/v.length},max:{lb:"สูงสุด",t:"ค่าสูงสุด",f:v=>Math.max(...v)},min:{lb:"ต่ำสุด",t:"ค่าต่ำสุด",f:v=>Math.min(...v)},cnt:{lb:"จำนวน",t:"นับจำนวน",f:v=>v.length},prod:{lb:"คูณ",t:"ผลคูณ",f:v=>v.reduce((a,b)=>a*b,1)},
 diff:{lb:"คงเหลือ",t:"ตัวแรก − ตัวที่เหลือ (เช่น งบ − ใช้ไป)",f:v=>v[0]-calcSum(v.slice(1)),min2:2},div:{lb:"หาร",t:"ตัวแรก ÷ ตัวที่สอง",f:v=>v[1]===0?NaN:v[0]/v[1],min2:2},pct:{lb:"เป็น",t:"% = ตัวแรก ÷ ตัวที่สอง × 100",f:v=>v[1]===0?NaN:v[0]/v[1]*100,min2:2,sfx:"%"}};
function calcFmText(fm,vals){ const op=CALC_OPS[fm.f]; if(!op||!vals.length||(op.min2&&vals.length<2))return (fm.lb||"")+" —"; const r=op.f(vals); return (fm.lb||op.lb)+" "+(isFinite(r)?calcFmt(r)+(op.sfx||""):"—"); }
const calcSrcVal=q=>{ const n=calcNums(q.tx); return n.length?calcSum(n):null; };
function calcOrder(arr){ return arr.slice().sort((a,b)=>{ const fa=Math.max(a.fs||24,12); if(Math.abs(a.p[1]-b.p[1])<fa*.8)return a.p[0]-b.p[0]; return a.p[1]-b.p[1]; }); }
function calcRebuild(s,text,x,y){ const o=inkMkText(x==null?s.p[0]:x,y==null?s.p[1]:y,text,s.fs,s.c,s.g,s.bg); ["fm","id","lk","u"].forEach(k=>{ if(s[k]!=null)o[k]=s[k]; }); return o; }
function calcLinkPass(arr){ let out=arr, ch=false; const byId=new Map(); arr.forEach(s=>{ if(s&&s.id)byId.set(s.id,s); });
 arr.forEach((s,i)=>{ if(!s||s.t!=="x"||!s.fm||!s.fm.ids)return; const srcs=calcOrder(s.fm.ids.map(id=>byId.get(id)).filter(q=>q&&q.t==="x"&&q!==s)); const vals=srcs.map(calcSrcVal).filter(v=>v!=null);
  const tx=calcFmText(s.fm,vals); if(tx!==s.tx){ if(!ch){ out=arr.slice(); ch=true; } const o=calcRebuild(s,tx); out[i]=o; byId.set(o.id,o); } });
 return {out,ch}; }
// เทมเพลตค่าใช้จ่ายรายเดือน: รวมยอดคอลัมน์จำนวนเงิน → ช่อง “ใช้ไปแล้ว” “คงเหลือ” และ “รวมทั้งเดือน”
const CALC_TPL={budget:{box:[50,270,490],bx:[128,204],amt:[700,850],ay:[250,1352],tot:[700,1352,150,44]}};
function calcTplPass(arr,tpl){ const G=CALC_TPL[tpl]; if(!G)return arr;
 const user=arr.filter(s=>s&&s.t==="x"&&!s.fm); const num=s=>{ const n=calcNums(s.tx); return n.length?calcSum(n):null; };
 const inB=s=>s.p[0]>=G.box[0]-2&&s.p[0]<G.box[0]+210&&s.p[1]>=G.bx[0]-6&&s.p[1]<G.bx[1];
 const inA=s=>s.p[0]>=G.amt[0]-2&&s.p[0]<G.amt[1]&&s.p[1]>=G.ay[0]&&s.p[1]<G.ay[1]+6;
 const bs=user.filter(inB).map(num).filter(v=>v!=null), as=user.filter(inA).map(num).filter(v=>v!=null);
 const want=[]; const fs=26;
 if(as.length){ const total=calcSum(as); want.push({tp:"total",v:total,c:"#1f6f80",right:[G.amt[1]-10,G.tot[1]+(G.tot[3]-fs*1.35)/2]}); want.push({tp:"used",v:total,c:"#d9692f",mid:[G.box[1]+105,164]});
  if(bs.length){ const rem=calcSum(bs)-total; want.push({tp:"remain",v:rem,c:rem<0?"#c0392b":"#2e8b57",mid:[G.box[2]+105,164]}); } }
 let out=arr, ch=false; const has=new Map(); arr.forEach((s,i)=>{ if(s&&s.fm&&s.fm.tp)has.set(s.fm.tp,i); });
 const drop=new Set(); has.forEach((i,tp)=>{ if(!want.some(w=>w.tp===tp))drop.add(i); });
 if(drop.size){ out=arr.filter((_,i)=>!drop.has(i)); ch=true; has.clear(); out.forEach((s,i)=>{ if(s&&s.fm&&s.fm.tp)has.set(s.fm.tp,i); }); }
 want.forEach(w=>{ const tx=calcFmt(w.v), proto={t:"x",fs,c:w.c,p:[0,0,0,0,0,0],tx}; const m=inkTextMeasure(proto); const x=w.right?w.right[0]-m[0]:w.mid[0]-m[0]/2, y=w.right?w.right[1]:w.mid[1];
  const i=has.get(w.tp), old=i!=null?out[i]:null;
  if(old&&old.tx===tx&&old.c===w.c&&Math.abs(old.p[0]-x)<1&&Math.abs(old.p[1]-y)<1)return;
  const o=inkMkText(x,y,tx,fs,w.c); o.fm={tp:w.tp}; if(!ch){ out=out.slice(); ch=true; } if(i!=null)out[i]=o; else{ out.push(o); has.set(w.tp,out.length-1); } });
 return out; }
function calcRefresh(next){ if(!Array.isArray(next))return next; let a=next;
 if(a.some(s=>s&&s.fm&&s.fm.ids)){ for(let n=0;n<4;n++){ const r=calcLinkPass(a); a=r.out; if(!r.ch)break; } }
 const pg=inkPage(), tpl=(pg&&pg.tpl)||inkLive().tpl||""; if(CALC_TPL[tpl])a=calcTplPass(a,tpl); return a; }
(function(){ const f=inkCommit; inkCommit=function(next,keepSel){ return f.call(this,calcRefresh(next),keepSel); }; })();

function calcSelSrc(){ if(!ink.sel||!ink.note)return []; const S=inkPage().strokes; return [...ink.sel.idx].filter(i=>S[i]&&S[i].t==="x"&&calcNums(S[i].tx).length); }
function inkCalcMenu(a){
 const S=inkPage().strokes, src=calcSelSrc(); if(!src.length){ inkStatus("ลาสโซ่ล้อมกล่องข้อความที่มีตัวเลขก่อน (ลายมือให้กด Aa ลายมือ→ตัวพิมพ์ ก่อน)","bad"); return; }
 const vals=calcOrder(src.map(i=>S[i])).map(calcSrcVal);
 inkPop(`<div class="ink-ph">ผูกสูตร · ${vals.length} กล่อง · ผลรวมตอนนี้ ${calcFmt(calcSum(vals))}</div><div class="hint" style="margin:0 10px 6px;font-size:12px;max-width:290px">ผลจะอัปเดตเองเมื่อแก้ตัวเลขต้นทาง</div>`+Object.keys(CALC_OPS).map(k=>`<button type="button" class="ink-mi" data-cop="${k}"${CALC_OPS[k].min2&&vals.length<2?" disabled":""}>${CALC_OPS[k].t}</button>`).join(""),a);
}
function inkCalcMake(op){
 const pg=inkPage(), S=pg.strokes, src=calcSelSrc(); if(!src.length)return; const rid=()=>"q"+Math.random().toString(36).slice(2,8);
 const next=S.slice(), ids=[]; const ordered=calcOrder(src.map(i=>S[i]));
 ordered.forEach(q=>{ const i=S.indexOf(q); let o=next[i]; if(!o.id){ o={...o,id:rid()}; next[i]=o; } ids.push(o.id); });
 const bb=inkBBox(S,ink.sel.idx), fs=Math.round(ordered.reduce((a,q)=>a+(q.fs||24),0)/ordered.length);
 const fm={f:op,ids,lb:CALC_OPS[op].lb}; const o=inkMkText(bb[0],bb[3]+14,calcFmText(fm,ordered.map(calcSrcVal).filter(v=>v!=null)),fs,"#0f766e"); o.fm=fm; o.id=rid();
 inkClosePop(); inkCommit([...next,o]); const idx=new Set([inkPage().strokes.length-1]); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar();
 inkStatus("ผูกสูตรแล้ว — แก้ตัวเลขต้นทาง ผลเปลี่ยนเอง","ok"); setTimeout(()=>{ if(!ink.saveT)inkStatus("",""); },2600);
}
(function(){ const b=el("ink-selcalc"); if(b)b.onclick=e=>{ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("[data-cop]")){ inkClosePop(); return; } inkCalcMenu(e.currentTarget); };
 const pop=el("ink-pop"); if(pop)pop.addEventListener("click",e=>{ const b=e.target.closest("[data-cop]"); if(!b||b.disabled)return; e.stopPropagation(); inkCalcMake(b.dataset.cop); });
 const f=inkSelBtns; inkSelBtns=function(){ f.apply(this,arguments); const c=el("ink-selcalc"); if(c)c.hidden=!(ink.sel&&ink.note&&calcSelSrc().length); }; })();

