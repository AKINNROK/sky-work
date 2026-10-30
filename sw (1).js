const C="skywork-14.14.23";
const FILES=["./","./index.html","./app.js","./icon-192.png","./logo.png","./manifest.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).catch(()=>{}));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.startsWith("/api/"))return;
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
});
// ---- Web Push (แจ้งเตือนนอกแอป) ----
self.addEventListener("push",e=>{
  let d={}; try{ d=e.data?e.data.json():{}; }catch(_){ d={title:"Sky Work",body:e.data?e.data.text():""}; }
  e.waitUntil(self.registration.showNotification(d.title||"Sky Work",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||"skywork",data:{url:d.url||"./"}}));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close(); const u=(e.notification.data&&e.notification.data.url)||"./";
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{ for(const c of cs){ if("focus" in c)return c.focus(); } return clients.openWindow(u); }));
});
