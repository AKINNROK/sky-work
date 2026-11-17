// ===== สีปากกา/ไฮไลต์เพิ่ม: พาเลตเต็ม ~40 สี + สีที่ใช้ล่าสุด + เลือกสีเอง =====
// แถบเครื่องมือยังโชว์ 8 สีหลักเดิม + สีที่เลือกอยู่ (ถ้านอกชุดหลัก) + ปุ่ม ＋ เปิดพาเลตเต็ม · ปุ่มสีในพาเลตใช้ data-icolor เดิม
const INK_PEN_ALL=["#000000","#1d1d1f","#3f3f46","#6b7280","#9ca3af","#d1d5db","#f5f5f5","#ffffff",
 "#7f1d1d","#dc2626","#f87171","#9a3412","#ea580c","#fb923c","#a16207","#eab308","#fde047",
 "#14532d","#16a34a","#4ade80","#115e59","#0d9488","#5eead4","#075985","#0ea5e9","#7dd3fc",
 "#1e3a8a","#2563eb","#60a5fa","#4c1d95","#7c3aed","#a78bfa","#831843","#db2777","#f9a8d4","#78350f","#a16a3a","#d6b48a"];
const INK_HL_ALL=["#ffe14d","#fff59d","#7ee08f","#b9f6ca","#ff9ec7","#ffc2dd","#8ec9ff","#bfe3ff","#ffb36b","#ffd2a6","#c9a7ff","#e1ccff","#ff8a80","#80deea","#d7ccc8","#cfd8dc"];
const INK_HEX=/^#[0-9a-fA-F]{6}$/;
const inkRecent=()=>{ try{ return (JSON.parse(localStorage.getItem("sw-ink-recent")||"[]")||[]).filter(c=>INK_HEX.test(c)).slice(0,8); }catch(e){ return []; } };
function inkRecentPut(c){ if(!INK_HEX.test(c))return; try{ const a=[c.toLowerCase(),...inkRecent().filter(x=>x.toLowerCase()!==c.toLowerCase())].slice(0,8); localStorage.setItem("sw-ink-recent",JSON.stringify(a)); }catch(e){} }
(function(){ try{ const cs=ink.colorSaved; if(cs){ if(INK_HEX.test(cs.pen))ink.color.pen=cs.pen; if(INK_HEX.test(cs.hl))ink.color.hl=cs.hl; } }catch(e){} })();
const _inkTb5t=inkToolbar;
inkToolbar=function(){
 _inkTb5t.apply(this,arguments);
 const box=el("ink-colors"); if(!box||!box.innerHTML)return;
 if(["laser","tape","sticky"].includes(ink.tool))return;
 const key=inkColKey(), base=key==="hl"?INK_HL:INK_PEN, cur=ink.color[key];
 let add="";
 if(cur&&!base.includes(cur))add+=`<button type="button" class="ink-c on" data-icolor="${cur}" style="background:${cur}" aria-label="สี ${cur}"></button>`;
 add+=`<button type="button" class="ink-c ink-cmore" data-icmore="1" title="สีเพิ่มเติม" aria-label="สีเพิ่มเติม">＋</button>`;
 box.insertAdjacentHTML("beforeend",add);
};
function inkColorMenu(a){
 const key=inkColKey(), all=key==="hl"?INK_HL_ALL:INK_PEN_ALL, cur=ink.color[key], rec=inkRecent();
 const sw=c=>`<button type="button" class="ink-c${cur&&cur.toLowerCase()===c.toLowerCase()?" on":""}" data-icolor="${c}" data-icpick="1" style="background:${c}" aria-label="สี ${c}"></button>`;
 inkPop(`<div class="ink-ph">${key==="hl"?"สีไฮไลต์":"สีปากกา"}</div><div class="ink-row ink-cgrid">${all.map(sw).join("")}</div>
${rec.length?`<div class="ink-ph">ใช้ล่าสุด</div><div class="ink-row ink-cgrid">${rec.map(sw).join("")}</div>`:""}
<div class="ink-row" style="margin-top:8px"><label class="ink-opt" style="cursor:pointer">🎨 เลือกสีเอง <input type="color" id="ink-ccust" value="${INK_HEX.test(cur||"")?cur:"#2563eb"}" style="width:30px;height:24px;border:0;padding:0;background:none"></label></div>`,a);
 const c=el("ink-ccust"); if(c){ c.addEventListener("input",()=>{ ink.color[inkColKey()]=c.value; }); c.addEventListener("change",()=>{ ink.color[inkColKey()]=c.value; inkRecentPut(c.value); inkSetSave(); inkToolbar(); inkClosePop(); }); }
}
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("button"); if(!b||!el("inkdlg")||!el("inkdlg").contains(b))return;
 if(b.dataset.icmore){ e.stopPropagation(); const p=el("ink-pop"); if(!p.hidden&&p.querySelector("#ink-ccust")){ inkClosePop(); return; } inkColorMenu(b); return; }
 if(b.dataset.icpick){ const c=b.dataset.icolor; setTimeout(()=>{ inkRecentPut(c); inkClosePop(); },0); }
},true);
