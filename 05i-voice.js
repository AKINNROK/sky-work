// ===== พิมพ์ตามเสียงพูด (Web Speech API) — ใช้ได้ทั้งในสมุดเขียนมือ/กระดาน และตัวแก้ไข “เขียนบันทึก” =====
// รองรับ: Chrome / Edge / Safari (iPad ใน Safari ปกติ) · แอปที่เพิ่มลงหน้าจอโฮมของ iOS บางรุ่นยังไม่รองรับ → แนะนำใช้ปุ่มไมค์บนคีย์บอร์ดแทน
const VOICE={rec:null,on:false,lang:"th-TH",target:null,chip:null,interim:"",err:0};
try{ const l=localStorage.getItem("sw-voice-lang"); if(l==="en-US"||l==="th-TH")VOICE.lang=l; }catch(e){}
const voiceSupported=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
function voiceChip(host){
 let c=VOICE.chip; if(c&&c.parentNode!==host){ c.remove(); c=null; }
 if(!c){ c=document.createElement("div"); c.className="ink-voice"; c.setAttribute("role","status");
  c.innerHTML=`<i></i><span class="vtx">กำลังฟัง… พูดได้เลย</span><button type="button" data-vl>${VOICE.lang==="th-TH"?"ไทย":"EN"}</button><button type="button" data-vs>หยุด</button>`;
  c.addEventListener("mousedown",e=>e.preventDefault()); c.addEventListener("pointerdown",e=>e.stopPropagation());
  c.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; e.stopPropagation(); if(b.hasAttribute("data-vs"))voiceStop(); else if(b.hasAttribute("data-vl")){ VOICE.lang=VOICE.lang==="th-TH"?"en-US":"th-TH"; try{ localStorage.setItem("sw-voice-lang",VOICE.lang); }catch(er){} b.textContent=VOICE.lang==="th-TH"?"ไทย":"EN"; const t=VOICE.target; if(VOICE.on){ voiceStop(true); setTimeout(()=>voiceStart(t),250); } } });
  host.appendChild(c); VOICE.chip=c; }
 return c;
}
function voiceSay(t){ if(VOICE.chip){ const v=VOICE.chip.querySelector(".vtx"); if(v)v.textContent=t; } }
// เบราว์เซอร์บางตัว (เช่น Safari บน iPad) ไม่ส่งผล “สุดท้าย” จนกว่าจะหยุดพูดนาน/กดหยุด → ข้อความค้างแค่บนแถบเสียง
// จึงเก็บข้อความชั่วคราวไว้ แล้วใส่ลงงานเมื่อเงียบ ~1.4 วินาที / กดหยุด / เปลี่ยนภาษา
function voiceFlush(){ clearTimeout(VOICE.ft); const t=(VOICE.pending||"").trim(); VOICE.pending=""; const T=VOICE.target; if(t&&T){ try{ T.onText(t); }catch(er){} voiceSay("กำลังฟัง… พูดได้เลย"); return true; } return false; }
function voiceStop(keepChip){
 voiceFlush(); VOICE.on=false; const r=VOICE.rec; VOICE.rec=null; if(r){ try{ r.onend=null; r.onresult=null; r.onerror=null; r.abort(); }catch(e){} }
 if(!keepChip&&VOICE.chip){ VOICE.chip.remove(); VOICE.chip=null; } const t=VOICE.target; if(!keepChip)VOICE.target=null; if(t&&t.onStop&&!keepChip)t.onStop();
}
// target = {host:อีลิเมนต์ dialog ที่จะแสดงแถบ, onText(text), onStop?()}
function voiceStart(target){
 if(!voiceSupported()){ return false; }
 voiceStop(true); const SR=window.SpeechRecognition||window.webkitSpeechRecognition; let rec;
 try{ rec=new SR(); }catch(e){ return false; }
 VOICE.target=target; VOICE.on=true; VOICE.rec=rec; VOICE.err=0; rec.lang=VOICE.lang; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1;
 voiceChip(target.host); voiceSay("กำลังฟัง… พูดได้เลย");
 rec.onresult=ev=>{ let interim="", fin=""; for(let i=ev.resultIndex;i<ev.results.length;i++){ const r=ev.results[i], t=r[0].transcript; if(r.isFinal)fin+=t; else interim+=t; }
  if(fin.trim()){ clearTimeout(VOICE.ft); VOICE.pending=""; try{ target.onText(fin.trim()); }catch(er){} }
  VOICE.pending=interim; voiceSay(interim?("… "+interim):"กำลังฟัง… พูดได้เลย"); clearTimeout(VOICE.ft);
  if(interim.trim())VOICE.ft=setTimeout(()=>{ if(VOICE.rec===rec&&voiceFlush()){ try{ rec.abort(); }catch(e){} } },1400); };   // ใส่ข้อความที่ค้าง แล้วเริ่มฟังรอบใหม่ (กันซ้ำ)
 rec.onerror=ev=>{ const er=ev.error;
  if(er==="not-allowed"||er==="service-not-allowed"){ voiceStop(); tell("<b>ยังไม่ได้อนุญาตให้ใช้ไมโครโฟน</b><div class=\"hint\" style=\"margin:8px 0 0\">เปิดสิทธิ์ไมค์ให้เว็บนี้ในการตั้งค่าเบราว์เซอร์ แล้วลองใหม่ค่ะ · หรือใช้ปุ่มไมค์บนคีย์บอร์ดของเครื่องแทนได้</div>"); }
  else if(er==="network"){ voiceStop(); tell("<b>พิมพ์ตามเสียงต้องใช้อินเทอร์เน็ต</b><div class=\"hint\" style=\"margin:8px 0 0\">เบราว์เซอร์ส่งเสียงไปแปลงเป็นข้อความที่เซิร์ฟเวอร์ — ตรวจสัญญาณแล้วลองใหม่ค่ะ</div>"); }
  else if(er==="language-not-supported"){ voiceStop(); tell("<b>เครื่องนี้ไม่รองรับภาษานี้</b>"); }
  else VOICE.err++; };
 rec.onend=()=>{ if(!VOICE.on||VOICE.rec!==rec)return; voiceFlush(); if(VOICE.err>6){ voiceStop(); return; } setTimeout(()=>{ if(VOICE.on&&VOICE.rec===rec){ try{ rec.start(); }catch(e){} } },200); };   // หยุดเองเมื่อเงียบนาน → เริ่มฟังต่อ
 try{ rec.start(); }catch(e){ voiceStop(); return false; }
 return true;
}
function voiceNoSupport(){ tell("<b>เบราว์เซอร์นี้ยังพิมพ์ตามเสียงในแอปไม่ได้</b><div style=\"font-size:13.5px;margin-top:8px;line-height:1.8\">ใช้ <b>ปุ่มไมค์บนคีย์บอร์ด</b> ของ iPad/มือถือ (กดช่องข้อความ แล้วแตะรูปไมค์ 🎤 มุมล่างคีย์บอร์ด) พูดได้ทันที — หรือเปิด Sky Work ใน Safari / Chrome ปกติ (ไม่ใช่ไอคอนหน้าจอโฮม) จะใช้ปุ่มไมค์ในแอปได้</div>"); }

// ---------- สมุดเขียนมือ / กระดาน: เติมเป็นกล่องข้อความ ----------
function inkVoiceToggle(){
 if(VOICE.on){ voiceStop(); ink.voiceOn=false; inkToolbar(); return; }
 if(!voiceSupported()){ voiceNoSupport(); const c=ink.lastPt||[80,160]; setTimeout(()=>{ ink.tool="text"; inkToolbar(); inkTextEdit(-1,c[0],c[1]); },50); return; }
 ink.voiceObj=null; const S=ink.sel&&ink.sel.idx.size===1?inkPage().strokes[[...ink.sel.idx][0]]:null; if(S&&S.t==="x")ink.voiceObj=S;
 const ok=voiceStart({host:el("inkdlg"),onText:inkVoiceText,onStop:()=>{ ink.voiceOn=false; ink.voiceObj=null; inkToolbar(); }});
 if(!ok){ voiceNoSupport(); return; } ink.voiceOn=true; inkToolbar();
}
function inkVoiceText(txt){
 if(!ink.note)return; const pg=inkPage(), S=pg.strokes; let at=ink.voiceObj?S.indexOf(ink.voiceObj):-1;
 if(at>=0){ const old=S[at], o=inkMkText(old.p[0],old.p[1],(old.tx?old.tx+"\n":"")+txt,old.fs,old.c,old.g,old.bg); ink.voiceObj=o; const next=S.map((s,i)=>i===at?o:s);
  if(ink.sel&&ink.sel.idx.has(at))ink.sel={idx:ink.sel.idx,box:inkBBox(next,ink.sel.idx)}; inkCommit(next,!!ink.sel); return; }
 const st=el("ink-stage"), r=st.getBoundingClientRect(); let x,y;
 const lp=ink.lastPt, v0=inkToPage({clientX:r.left+40,clientY:r.top+70}), v1=inkToPage({clientX:r.right-60,clientY:r.bottom-60});
 if(lp&&lp[0]>=v0[0]&&lp[0]<=v1[0]&&lp[1]>=v0[1]&&lp[1]<=v1[1]){ x=lp[0]; y=lp[1]; } else{ x=v0[0]; y=v0[1]; }
 const fs=ink.size.text; for(let n=0;n<40;n++){ const hit=S.some(q=>{ const b=inkBB(q); return !(b[2]<x||b[0]>x+fs*8||b[3]<y||b[1]>y+fs*1.5); }); if(!hit)break; y+=fs*1.6; }   // ไม่ซ้อนทับของเดิม
 const o=inkMkText(x,y,txt,fs,ink.color.pen); ink.voiceObj=o; inkCommit([...S,o]); { const idx=new Set([S.length]); ink.sel={idx,box:inkBBox(inkPage().strokes,idx)}; inkDrawSel(); inkToolbar(); } inkStatus("เติมข้อความจากเสียงแล้ว","ok");
}
// ---------- ตัวแก้ไข “เขียนบันทึก” ----------
function neVoiceBtns(on){ document.querySelectorAll('#ntool [data-ne="mic"],#ne-micbtn').forEach(b=>b.classList.toggle("on",!!on)); const m=el("ne-micbtn"); if(m)m.textContent=on?"⏹ หยุดฟัง":"🎤 พูดให้พิมพ์"; }
function neVoiceToggle(){
 if(VOICE.on){ voiceStop(); return; }
 if(!voiceSupported()){ voiceNoSupport(); setTimeout(()=>{ try{ NE().focus(); }catch(e){} },300); return; }
 neSave(); const host=el("ndlg");
 const ok=voiceStart({host,onText:txt=>{ neRestore(); document.execCommand("insertText",false,txt+" "); neSave(); },onStop:()=>neVoiceBtns(false)});
 if(!ok){ voiceNoSupport(); return; } neVoiceBtns(true);
}
(function(){ const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="mic"]'); if(b){ e.stopImmediatePropagation(); neVoiceToggle(); } },true); const m=el("ne-micbtn"); if(m){ m.addEventListener("mousedown",e=>e.preventDefault()); m.addEventListener("click",()=>{ neSave(); neVoiceToggle(); }); } })();
// ปิดไมค์เมื่อปิดสมุด/หน้าต่างบันทึก
["inkdlg","ndlg"].forEach(id=>{ const d=el(id); if(d)d.addEventListener("close",()=>{ if(VOICE.on)voiceStop(); }); });
