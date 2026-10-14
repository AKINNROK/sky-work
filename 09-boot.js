function gate(mode){
gateMode=mode;
const b=el("gatebody");
if(mode==="setup"){
el("gateh").textContent="เชื่อมต่อฐานข้อมูลครั้งแรก";
b.innerHTML=`<div class="f"><label for="g-url">Project URL จาก Supabase</label>
<input id="g-url" placeholder="https://xxxxx.supabase.co" value="${esc(cfg.url)}"></div>
<div class="f" style="margin-top:12px"><label for="g-key">anon public key (หรือ Publishable key)</label>
<input id="g-key" placeholder="eyJhbGciOi... หรือ sb_publishable_..." value="${esc(cfg.key)}"></div>
<div class="hint">หาได้ที่ <b>Supabase › Settings (รูปเฟือง) › API Keys</b><br>
• <b>Project URL</b> อยู่แถวบนของหน้าเดียวกัน หรือกดปุ่ม <b>Connect</b> ด้านบนสุดของโปรเจกต์<br>
• ใช้ได้ทั้ง <b>anon public</b> (ขึ้นต้น eyJ…) และ <b>Publishable</b> (ขึ้นต้น sb_publishable_…) — คีย์สองแบบนี้ปลอดภัยสำหรับใส่ในหน้าเว็บ<br>
• <b style="color:var(--over)">ห้ามใช้ service_role หรือ secret key เด็ดขาด</b> — คีย์พวกนั้นข้ามการป้องกันทั้งหมด<br>
ใส่ครั้งเดียวต่อเครื่อง เก็บไว้ในเครื่องนี้เท่านั้น</div>`;
el("gatego").textContent="เชื่อมต่อ";
}else if(mode==="newpass"){
el("gateh").textContent="ตั้งรหัสผ่านใหม่";
b.innerHTML=`<div class="f"><label for="g-new">รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)</label><input id="g-new" type="password" autocomplete="new-password"></div>
<div id="g-msg"></div>`;
el("gatego").textContent="บันทึกรหัสผ่านใหม่";
}else if(mode==="login"){
el("gateh").textContent="เข้าสู่ระบบ Sky Work";
b.innerHTML=`<div class="f"><label for="g-mail">อีเมล</label><input id="g-mail" type="email" autocomplete="email"></div>
<div class="f" style="margin-top:12px"><label for="g-pass">รหัสผ่าน</label><input id="g-pass" type="password" autocomplete="current-password"></div>
<div class="hint">เครื่องนี้จะจำไว้ ไม่ต้องล็อกอินอีก · <b>เคยมีบัญชีแล้วให้กด “เข้าสู่ระบบ” เท่านั้น</b> (ข้อมูลทั้งหมดอยู่ในบัญชีเดิม)</div>
<div id="g-msg"></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
<button type="button" class="gcbtn" id="g-forgot">ลืมรหัสผ่าน</button>
<button type="button" class="gcbtn" id="g-signup">สมัครบัญชีใหม่ (ครั้งแรกเท่านั้น)</button>
<button type="button" class="gcbtn" id="g-resend" hidden>ส่งอีเมลยืนยันอีกครั้ง</button></div>`;
el("gatego").textContent="เข้าสู่ระบบ";
const msg=el("g-msg"), val=()=>({email:el("g-mail").value.trim(),password:el("g-pass").value});
const say=(cls,t)=>{msg.innerHTML=`<div class="banner ${cls}">${t}</div>`;};
el("g-forgot").onclick=async()=>{ const {email}=val(); if(!email){say("bad","ใส่อีเมลก่อน แล้วกด “ลืมรหัสผ่าน” อีกครั้งค่ะ");el("g-mail").focus();return;}
 say("","กำลังส่งลิงก์…"); const r=await SB.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
 if(r.error){say("bad",esc(r.error.message));return;}
 say("ok","ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่ <b>"+esc(email)+"</b> แล้วค่ะ (ถ้าไม่เห็น ดูในสแปม) — กดลิงก์ในอีเมลแล้วตั้งรหัสใหม่ได้เลย"); };
el("g-resend").onclick=async()=>{ const {email}=val(); if(!email)return; const r=await SB.auth.resend({type:"signup",email}); say(r.error?"bad":"ok",r.error?esc(r.error.message):"ส่งอีเมลยืนยันอีกครั้งแล้วค่ะ ตรวจกล่องจดหมาย/สแปม"); };
el("g-signup").onclick=async()=>{ const {email,password}=val();
 if(!email||password.length<6){say("bad","ใส่อีเมลและตั้งรหัสผ่านอย่างน้อย 6 ตัวก่อน แล้วกด “สมัครบัญชีใหม่”");return;}
 say("","กำลังสมัคร…"); const r=await SB.auth.signUp({email,password});
 if(r.error){say("bad",esc(r.error.message));return;}
 if(r.data&&r.data.user&&Array.isArray(r.data.user.identities)&&!r.data.user.identities.length){ say("bad","อีเมลนี้<b>มีบัญชีอยู่แล้ว</b>ค่ะ — ไม่ต้องสมัครใหม่ กด “เข้าสู่ระบบ” หรือ “ลืมรหัสผ่าน” แทน"); return; }
 if(r.data&&r.data.session){ el("gate").close(); boot(); return; }
 say("ok","สมัครแล้ว! ตรวจอีเมลเพื่อกดยืนยัน แล้วกลับมากด “เข้าสู่ระบบ” ค่ะ"); el("g-resend").hidden=false; };
}
if(!el("gate").open)el("gate").showModal();
}
el("gatego").onclick=async()=>{
if(gateMode==="setup"){
const url=el("g-url").value.trim().replace(/\/$/,""), key=el("g-key").value.trim();
if(!url||!key)return;
cfg={url,key}; try{localStorage.setItem("sw-cfg",JSON.stringify(cfg));}catch(e){}
el("gate").close(); boot(); return;
}
if(gateMode==="newpass"){
const pw=el("g-new").value, m=el("g-msg");
if(pw.length<6){m.innerHTML=`<div class="banner bad">รหัสผ่านอย่างน้อย 6 ตัวค่ะ</div>`;return;}
const r=await SB.auth.updateUser({password:pw});
if(r.error){m.innerHTML=`<div class="banner bad">${esc(r.error.message)}</div>`;return;}
try{ history.replaceState(null,"",location.pathname); }catch(e){}
el("gate").close(); tell("<b>ตั้งรหัสผ่านใหม่แล้วค่ะ</b><div style=\"font-size:13px;margin-top:8px\">ครั้งต่อไปเข้าด้วยรหัสใหม่นี้</div>"); return;
}
const email=el("g-mail").value.trim(), password=el("g-pass").value;
const msg=el("g-msg");
if(!email||password.length<6){msg.innerHTML=`<div class="banner bad">ใส่อีเมลและรหัสผ่านอย่างน้อย 6 ตัวค่ะ</div>`;return;}
msg.innerHTML=`<div class="banner">กำลังเข้าสู่ระบบ…</div>`;
const {error}=await SB.auth.signInWithPassword({email,password});
if(error){
const m2=String(error.message||"");
if(/not confirmed/i.test(m2)){ msg.innerHTML=`<div class="banner bad">อีเมลนี้<b>ยังไม่ได้ยืนยัน</b> — เปิดอีเมลหา “Confirm your signup” แล้วกดลิงก์ (ดูในสแปมด้วย) หรือกดส่งอีเมลยืนยันอีกครั้งด้านล่าง</div>`; if(el("g-resend"))el("g-resend").hidden=false; }
else if(/invalid login/i.test(m2)){ msg.innerHTML=`<div class="banner bad"><b>อีเมลหรือรหัสผ่านไม่ถูกต้อง</b> — ลองพิมพ์ใหม่อีกครั้ง ถ้าจำรหัสไม่ได้กด “ลืมรหัสผ่าน” (ไม่ต้องสมัครใหม่ ข้อมูลเดิมอยู่ในบัญชีเดิม)</div>`; }
else msg.innerHTML=`<div class="banner bad">${esc(m2)}</div>`;
return; }
el("gate").close(); boot();
};
async function signOut(){ if(SB)await SB.auth.signOut(); location.reload(); }
addEventListener("resize",()=>{if(view==="all")render();});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
window.__skyBoot=1;
boot();
