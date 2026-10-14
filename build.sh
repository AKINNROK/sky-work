#!/bin/sh
# รวม src/js/01…09 เป็น public/app.js (ไฟล์เดียว) — รันหลังแก้โค้ดใน src/js ทุกครั้ง
cd "$(dirname "$0")" && cat src/js/*.js > public/app.js && echo "built public/app.js ($(wc -l < public/app.js) lines)"
