// ===== ความทนทาน: คิวเซฟตอนออฟไลน์ · แจ้งเวอร์ชันใหม่ · สำรอง/กู้คืนครบทุกอย่าง (สมุดเขียนมือ รูป เลขาฯ) =====
// 1) เซฟตอนเน็ตหลุด → เก็บคิวในเครื่อง (localStorage "sw-wq") แล้วส่งให้เองเมื่อออนไลน์ (ถ้าแก้ซ้ำรายการเดิม = ค่าล่าสุดชนะ)
// 2) ตรวจ sw.js ล่าสุดเทียบกับเวอร์ชันที่เปิดอยู่ → ขึ้นแถบ "มีเวอร์ชันใหม่ [อัปเดตเลย]"
// 3) bkDownload()/กู้คืน ครอบคลุม ink + nimg + sec (ของเดิมสำรองไม่ครบ) และอ่านไฟล์สำรองฝั่งเซิร์ฟเวอร์ (pack.rows)
const WQK="sw-wq";
const wqGet=()=>{ try{ return JSON.parse(localStorage.getItem(WQK)||"[]"); }catch(e){ return []; } };
const wqSet=a=>{ try{ localStorage.setItem(WQK,JSON.stringify(a)); return true; }catch(e){ return false; } };
const isNetErr=e=>{ const m=String((e&&(e.message||e.details||e.code))||e||""); return !navigator.onLine||/failed to fetch|networkerror|network request failed|load failed|fetch failed|timed? ?out|econn/i.test(m); };
function wqPush(it){ it.uid=uid; it.at=Date.now(); const q=wqGet().filter(x=>!(x.uid===uid&&x.coll===it.coll&&x.id===it.id)); q.push(it); return wqSet(q); }
let wqBusy=false;
async function wqFlush(){ if(wqBusy||!SB||!uid)return; if(!wqGet().some(x=>x.uid===uid)){ wqPaint(); return; } wqBusy=true; wqPaint();
 try{ for(const it of wqGet().filter(x=>x.uid===uid)){
   let r; try{ r=it.op==="del"?await SB.from("rows").delete().eq("id",it.id).eq("uid",uid):await SB.from("rows").upsert({id:it.id,uid,kind:it.coll,data:it.data,updated_at:new Date().toISOString()}); }catch(e){ r={error:e}; }
   if(r&&r.error){ if(isNetErr(r.error))break; const q=wqGet(); const m=q.find(x=>x.uid===uid&&x.coll===it.coll&&x.id===it.id); if(m){ m.fails=(m.fails||0)+1; if(m.fails>=3){ wqSet(q.filter(x=>x!==m)); tell("<b>ส่งข้อมูลที่ค้างไม่สำเร็จ 1 รายการ</b><div style=\"font-size:13px;margin-top:8px\">ระบบลองแล้ว 3 ครั้ง — ตรวจสิทธิ์/ตั้งค่าฐานข้อมูล</div>"); } else wqSet(q); } continue; }
   wqSet(wqGet().filter(x=>!(x.uid===it.uid&&x.coll===it.coll&&x.id===it.id&&x.at===it.at))); }
 }finally{ wqBusy=false; wqPaint(); const n=wqGet().filter(x=>x.uid===uid).length; if(!n&&navigator.onLine)setFoot("ส่งข้อมูลที่ค้างครบแล้ว · ซิงก์แล้ว"); } }
function wqReapply(){ wqGet().filter(x=>x.uid===uid).forEach(it=>{ if(!cache[it.coll])return; if(it.op==="del")cache[it.coll].delete(it.id); else cache[it.coll].set(it.id,it.data); }); ["items","ledger","legal","index","note","sec"].forEach(c=>emit(c)); [...cache.meta.keys()].forEach(emitMeta); }
function wqPaint(){ let b=el("offb"); if(!b){ b=document.createElement("div"); b.id="offb"; b.setAttribute("role","status"); document.body.appendChild(b); }
 const n=wqGet().filter(x=>x.uid===uid).length, off=!navigator.onLine;
 if(!off&&!n){ b.hidden=true; return; } b.hidden=false; b.className=off?"off":"sync";
 b.innerHTML=off?`📴 ออฟไลน์${n?` — เก็บไว้ในเครื่องแล้ว <b>${n}</b> รายการ จะส่งให้อัตโนมัติเมื่อมีเน็ต`:" — ดูข้อมูลเดิมได้ แต่ยังบันทึกใหม่ไม่ถึงเซิร์ฟเวอร์"}`:`⏳ กำลังส่งข้อมูลที่ค้าง <b>${n}</b> รายการ…`; }
// เขียนข้อมูลผ่าน up()/del() เดิม + คิวออฟไลน์
async function up(coll,id,data){
 const prev=cache[coll].get(id);
 cache[coll].set(id,data); coll==="meta"?emitMeta(id):emit(coll);
 let error=null; try{ const r=await SB.from("rows").upsert({id,uid,kind:coll,data,updated_at:new Date().toISOString()}); error=r.error; }catch(e){ error=e; }
 if(error){
  if(isNetErr(error)&&wqPush({op:"set",coll,id,data})){ wqPaint(); setFoot("ออฟไลน์ — เก็บไว้ในเครื่องแล้ว จะส่งให้เมื่อมีเน็ต","var(--run)"); return id; }
  lastErr=error;
  if(prev===undefined)cache[coll].delete(id); else cache[coll].set(id,prev);
  coll==="meta"?emitMeta(id):emit(coll);
  setFoot("บันทึกไม่สำเร็จ · แตะดูสาเหตุ","var(--over)"); render(); throw error; }
 lastErr=null; if(sync.color)setFoot(items.length+" งาน · ซิงก์แล้ว"); return id; }
async function del(coll,id){
 cache[coll].delete(id); coll==="meta"?emitMeta(id):emit(coll);
 try{ const r=await SB.from("rows").delete().eq("id",id).eq("uid",uid); if(r&&r.error&&isNetErr(r.error)){ wqPush({op:"del",coll,id}); wqPaint(); } }
 catch(e){ if(isNetErr(e)){ wqPush({op:"del",coll,id}); wqPaint(); } } }
{ const _la=loadAll; loadAll=async function(){ const r=await _la.apply(this,arguments); try{ wqReapply(); wqFlush(); }catch(e){ console.error(e); } return r; }; }
window.addEventListener("online",()=>{ wqPaint(); setFoot("กลับมาออนไลน์แล้ว"); wqFlush(); verCheck(); });
window.addEventListener("offline",()=>{ wqPaint(); setFoot("ออฟไลน์","var(--run)"); });
setInterval(()=>{ if(navigator.onLine&&wqGet().length)wqFlush(); },25000);
// ---------- แจ้งเวอร์ชันใหม่ ----------
const verNum=v=>String(v).split(".").map(x=>+x||0);
const verGt=(a,b)=>{ const x=verNum(a),y=verNum(b); for(let i=0;i<3;i++){ if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0); } return false; };
let verShown="";
async function verCheck(){ try{ if(!navigator.onLine)return; const r=await fetch("sw.js?v="+Date.now(),{cache:"no-store"}); if(!r.ok)return; const m=(await r.text()).match(/skywork-(\d+\.\d+\.\d+)/); if(m&&verGt(m[1],APP_VERSION)&&verShown!==m[1])verBanner(m[1]); }catch(e){} }
function verBanner(v){ verShown=v; let b=el("verb"); if(!b){ b=document.createElement("div"); b.id="verb"; b.setAttribute("role","status"); document.body.appendChild(b); }
 b.hidden=false; b.innerHTML=`🆕 มีเวอร์ชันใหม่ <b>${esc(v)}</b> <button type="button" id="verGo">อัปเดตเลย</button><button type="button" id="verLater" class="ghost">ภายหลัง</button>`;
 el("verGo").onclick=()=>{ if(typeof hardRefresh==="function")hardRefresh(); else location.reload(); }; el("verLater").onclick=()=>{ b.hidden=true; }; }
document.addEventListener("visibilitychange",()=>{ if(!document.hidden)verCheck(); });
setTimeout(verCheck,8000); setInterval(verCheck,30*60*1000);
// ---------- สำรอง/กู้คืนให้ครบ ----------
async function bkFetchKinds(kinds){ const out=[]; for(const kind of kinds){ for(let from=0;;from+=40){ const {data,error}=await SB.from("rows").select("id,kind,data").eq("uid",uid).eq("kind",kind).range(from,from+39); if(error)throw error; (data||[]).forEach(r=>out.push({id:r.id,kind:r.kind,data:r.data})); if(!data||data.length<40)break; } } return out; }
const bkCount=p=>["items","ledger","legal","index","note","sec","raw","rows"].reduce((a,k)=>a+((p&&p[k]||[]).length),0);
async function bkDownload(){
 const pack=bkPack(); try{ pack.raw=await bkFetchKinds(["ink","nimg"]); }catch(e){ pack.rawErr=String((e&&e.message)||e); }
 const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(pack)],{type:"application/json"}));
 a.download="sky-plan-backup-"+isoOf(new Date())+".json"; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },900);
 bkAt=pack.at; try{ localStorage.removeItem("sw-bksnooze"); }catch(e){}
 saveMeta("bk",[{at:pack.at}]);
 if(pack.rawErr)tell("<b>สำรองได้ไม่ครบ</b><div style=\"font-size:13px;margin-top:8px;line-height:1.7\">ส่วนสมุดเขียนมือ/รูปในโน้ตดึงไม่สำเร็จ ("+esc(pack.rawErr)+") — ลองสำรองใหม่อีกครั้งตอนเน็ตดี</div>");
 return pack; }
wqPaint();
