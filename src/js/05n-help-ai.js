// ===== ผู้ช่วย AI ในหน้ากระดานกว้าง / สมุดเขียนมือ / เขียนบันทึก — ถามหาเครื่องมือ ให้สอนใช้ ชี้ปุ่มให้ดู =====
// ใช้ /api/ai เดิม (คีย์อยู่ฝั่งเซิร์ฟเวอร์) · ถ้า AI ใช้ไม่ได้ จะค้นหาจากคู่มือในแอปให้แทน (ไม่ต้องใช้เน็ต)
// รูปแบบ KB: [id, ชื่อ, selector, วิธีใช้, คำค้น]
const HLP_INK=[
 ["pen","ปากกา",'[data-itool="pen"]',"เขียน/วาดอิสระ · เปลี่ยนสีที่แถบสีใต้แถบเครื่องมือ · ปรับความหนาด้วยแถบเลื่อน · เมนู “ปากกา ▾” เลือกชนิดหัว (ปากกาลูกลื่น ดินสอ พู่กัน ฯลฯ) · วาดแล้วหยุดค้างปลายเส้นครู่หนึ่ง = จัดเป็นเส้นตรง/วงกลม/สี่เหลี่ยมเป๊ะให้ · เริ่มเขียนติดเส้นไกด์ = ลากตรงตามเส้น","ปากกา เขียน วาด สี ความหนา ดินสอ พู่กัน เส้นตรง"],
 ["shape","รูปทรง",'[data-itool="shape"]',"ลากสร้างเส้นตรง ลูกศร สี่เหลี่ยม วงกลม สามเหลี่ยม ฯลฯ · เลือกชนิด/เติมสี/เส้นประได้ในแถบที่โผล่ · กด Shift ค้างเพื่อให้เป๊ะ · หมุน/ย่อขยายได้ด้วยจุดจับหลังเลือก","รูปทรง สี่เหลี่ยม วงกลม ลูกศร กรอบ เส้นตรง กล่อง"],
 ["hl","ไฮไลต์",'[data-itool="hl"]',"ปากกาไฮไลต์โปร่งแสง ขีดทับข้อความ/ตัวเลขได้ · เปลี่ยนสีและความหนาได้","ไฮไลต์ ขีดทับ เน้น มาร์คเกอร์"],
 ["eraser","ยางลบ",'[data-itool="eraser"]',"ลบเส้น · เลือกโหมดลบเป็นช่วง หรือลบทั้งเส้นได้ในแถบขนาด · ปรับขนาดยางลบได้ · ย้อนกลับได้ด้วยปุ่ม ↶","ยางลบ ลบ ลบเส้น ลบทิ้ง"],
 ["text","ข้อความ",'[data-itool="text"]',"แตะที่หน้าแล้วพิมพ์ · พิมพ์ 1+1= แล้วได้ผลทันที · ปรับขนาดตัวอักษรที่แถบขนาด · แตะข้อความเดิมเพื่อแก้ · เลือกแล้วกด “🎨 แต่ง” เปลี่ยนสี/ขนาด","ข้อความ พิมพ์ ตัวอักษร ตัวหนังสือ text กล่องข้อความ"],
 ["move","เคลื่อนย้าย (Move)",'[data-itool="move"]',"แบบ Photoshop: แตะ/ลากวัตถุใดก็ได้เพื่อย้ายทันที ไม่ต้องลาสโซ่ · Shift = เลือกเพิ่ม · Alt/Option หรือปุ่ม “ทำสำเนาตอนลาก” = ลากแล้วได้สำเนา · ปุ่มลูกศรบนคีย์บอร์ด = ขยับทีละนิด (Shift = ทีละมาก) · ปุ่ม V = สลับมาเครื่องมือนี้ · ติดเส้นไกด์ได้ · ปิด “เลือกอัตโนมัติ” เพื่อย้ายของที่เลือกอยู่จากตรงไหนก็ได้","เคลื่อนย้าย ย้าย move ขยับ ลาก photoshop ปุ่ม v ลูกศร สำเนา"],
 ["lasso","เลือก/ย้าย (ลาสโซ่)",'[data-itool="lasso"]',"ลากวงรอบสิ่งที่ต้องการเลือก หรือแตะเส้นเดี่ยวๆ · ลากเพื่อย้าย · จุดมุม/ขอบ = ย่อขยาย · จุดวงกลมบนหัว = หมุน · เมื่อเลือกแล้วจะมีปุ่มเพิ่ม: แต่ง คัดลอก ตัด วาง สำเนา ล็อก ลำดับ ลิงก์ จัดแนว ลบ ฯลฯ","เลือก ย้าย ลาสโซ่ ขยับ หมุน ย่อ ขยาย จัดกลุ่ม"],
 ["laser","เลเซอร์พอยน์เตอร์",'[data-itool="laser"]',"ชี้ให้ดูแบบเลเซอร์ที่จางหายเอง ไม่ทิ้งรอยบนงาน · เปลี่ยนสีได้ · ใช้ตอนนำเสนอ/ประชุม","เลเซอร์ ชี้ นำเสนอ ประชุม pointer"],
 ["tape","เทป",'[data-itool="tape"]',"ปิดบังข้อความเหมือนแปะเทป · เลือกสีและโหมด “อิสระ”หรือ“แนวตรง” ที่แถบขนาด · แตะที่เทปอีกครั้งเพื่อเปิด/ปิดทับ (ท่องจำ/ปิดคำตอบ)","เทป ปิดบัง ซ่อน ปิดคำตอบ ปิดทับ"],
 ["sticky","โน้ตแปะ",'[data-itool="sticky"]',"แตะที่หน้าเพื่อสร้างกระดาษโน้ตสี พิมพ์ข้อความได้ · เปลี่ยนสีกระดาษที่แถบสี หรือเลือกแล้ว “🎨 แต่ง”","โน้ตแปะ สติ๊กกี้ โพสต์อิท กระดาษโน้ต sticky"],
 ["hand","เลื่อนหน้า (มือ)",'[data-itool="hand"]',"ใช้นิ้ว/เมาส์ลากเลื่อนหน้า · แตะลิงก์ที่ใส่ไว้เพื่อกระโดดไปหน้า/เว็บ · (สองนิ้ว = ซูม/เลื่อนได้ทุกเครื่องมืออยู่แล้ว)","เลื่อน มือ pan ลาก ซูม"],
 ["img","แทรกรูปภาพ",'[data-iact="img"]',"เลือกรูปจากเครื่อง หรือวาง (Ctrl+V) / ลากไฟล์ใส่หน้า · ย่อขยาย หมุน ล็อก ลำดับหน้า-หลังได้เหมือน Goodnotes","รูป รูปภาพ แทรกรูป ภาพ รูปถ่าย"],
 ["stk","สติกเกอร์สถานะ",'[data-iact="stk"]',"แปะสติกเกอร์ขยับได้ เช่น ด่วน HOT เสร็จแล้ว รอ · แตะเพื่อวางกลางจอ แล้วลากย้าย/ย่อขยายได้","สติกเกอร์ อีโมจิ ด่วน hot เสร็จ สถานะ ขยับ"],
 ["mic","พิมพ์ตามเสียงพูด",'[data-iact="mic"]',"กดแล้วพูด ข้อความจะเติมเป็นกล่องข้อความบนหน้า · สลับไทย/EN ที่แถบเสียง · iPad แบบไอคอนหน้าจอโฮมอาจใช้ไม่ได้ → ใช้ไมค์บนคีย์บอร์ดแทน","ไมค์ เสียง พูด พิมพ์ตามเสียง บันทึกเสียง"],
 ["calc","เครื่องคิดเลข",'[data-iact="calc"]',"เครื่องคิดเลขลอย + − × ÷ % ( ) · ใส่ผลลัพธ์ลงหน้า · ถ้าเลือกกล่องตัวเลขไว้ จะมีปุ่มรวม/เฉลี่ย · พิมพ์ในกล่องข้อความ 1200+350*2= ได้ผลต่อท้ายทันที","เครื่องคิดเลข คำนวณ บวก ลบ คูณ หาร เปอร์เซ็นต์ สูตร"],
 ["ruler","ไม้บรรทัด/เส้นไกด์",'[data-iact="ruler"]',"เมนูไม้บรรทัด: ซ่อน/แสดง ปิดเปิดแม่เหล็ก ลบไกด์ทั้งหมด · ลากจากขอบบน (แนวนอน) หรือขอบซ้าย (แนวตั้ง) เพื่อวางเส้นไกด์ · ลากจุดสามเหลี่ยมกลับไปที่ไม้บรรทัดเพื่อลบ","ไม้บรรทัด ไกด์ เส้นช่วย เส้นทาบ ruler guide ตรง"],
 ["act","สรุปประชุม→งาน",'[data-iact="act"]',"AI อ่านสิ่งที่เขียน/พิมพ์ในหน้านี้ (รวมลายมือถ้ามี · ลาสโซ่เลือกเฉพาะส่วนได้) แล้วสรุป มติ และรายการงาน (ใคร/อะไร/เมื่อไร) ให้ติ๊กเลือก-แก้ไข แล้วกดสร้างงานเข้า Sky Work ได้เลย · ไม่สร้างเองถ้าไม่ได้กดยืนยัน","สรุป ประชุม งาน action item แตกงาน มติ รายงานการประชุม เลขา สร้างงาน"],
 ["ai","ผู้ช่วย AI",'[data-iact="ai"]',"ปุ่มนี้เอง — ถามหาเครื่องมือหรือให้สอนใช้งานได้","ช่วย ผู้ช่วย ai สอน ถาม"],
 ["undo","ย้อนกลับ",'#ink-undo',"ย้อนการกระทำล่าสุด (Ctrl+Z)","ย้อน undo ยกเลิก"],
 ["redo","ทำซ้ำ",'#ink-redo',"ทำซ้ำสิ่งที่ย้อนไป (Ctrl+Shift+Z)","ทำซ้ำ redo"],
 ["sidebtn","สารบัญ / หน้าย่อ / ค้นหา",'#ink-sidebtn',"เปิดแถบข้างซ้าย: หน้าย่อ (จัดเรียง/ทำสำเนา/ลบหน้า) · หัวข้อ/บุ๊กมาร์ก · ค้นหาข้อความที่พิมพ์ในสมุด","สารบัญ หน้าย่อ ค้นหา บุ๊กมาร์ก หัวข้อ เรียงหน้า"],
 ["presbtn","โหมดนำเสนอ",'#ink-presbtn',"ซ่อนแถบเครื่องมือ ใช้เลเซอร์ชี้ · ลูกศรซ้ายขวาเปลี่ยนหน้า · ออกด้วยปุ่มบนแถบเล็ก/Esc","นำเสนอ present สไลด์ เต็มจอ"],
 ["finger","นิ้ววาด: อัตโนมัติ/ปิด/เปิด",'#ink-finger',"ตั้งว่านิ้วจะเขียนไหม · “อัตโนมัติ” = ถ้าใช้ Apple Pencil นิ้วจะเลื่อนหน้า · เปิด = นิ้วเขียนได้","นิ้ว เขียนด้วยนิ้ว pencil ฝ่ามือ"],
 ["tpl","กระดาษ / เทมเพลต / ปก",'#ink-tpl',"เปลี่ยนลายกระดาษ (เส้นบรรทัด ตาราง จุด) สีกระดาษ ปกสมุด ตั้งค่าเริ่มต้น · เทมเพลตสำเร็จรูป เช่น ค่าใช้จ่ายรายเดือน OKR SWOT Kanban","กระดาษ เทมเพลต template พื้นหลัง ตาราง เส้นบรรทัด ปก สีกระดาษ"],
 ["zfit","พอดีหน้า / ซูม",'#ink-zfit',"− ซูมออก · ⛶ พอดีหน้า · + ซูมเข้า · หรือบีบสองนิ้ว/ Ctrl+ล้อเมาส์","ซูม ขยาย ย่อ พอดี zoom"],
 ["expb","ส่งออก / Drive",'#ink-exp-b',"ส่งออกเป็น PDF หรือ PNG แล้วแชร์/บันทึกลง Google Drive/ดาวน์โหลด (ไม่มีเส้นไกด์ในไฟล์)","ส่งออก export pdf png ดาวน์โหลด drive แชร์ พิมพ์ save บันทึกเป็นไฟล์"],
 ["more","เมนู ⋯ เพิ่มเติม",'#ink-more',"เพิ่มหน้า ล้างหน้า ลบหน้า ปักหมุด ย้ายโฟลเดอร์ ย้ายไปถังขยะ ปรับปลายเส้นล่วงหน้า วัดความลื่น","เพิ่มเติม เพิ่มหน้า ลบหน้า ล้าง ถังขยะ โฟลเดอร์ ปักหมุด ลบสมุด"],
 ["ver","กู้เวอร์ชันเก่า",'#ink-more',"กด ⋯ › “🕘 กู้เวอร์ชันเก่า”: เลือกเวอร์ชันที่ระบบเก็บให้อัตโนมัติ (ก่อนแก้ในรอบนี้ ทุก ~12 นาที ก่อนล้าง/ลบหน้า) ดูตัวอย่างแล้วกู้กลับได้ · หน้าที่ลบไปก็กู้เป็นหน้าใหม่ได้ · กู้ผิดกด ↶ ย้อนได้","กู้ ย้อนหลัง เวอร์ชัน หาย ลบผิด กู้คืน ย้อนกลับ history backup"],
 ["pages","แถบหน้าด้านล่าง",'#ink-pages',"เปลี่ยนหน้า (ตัวเลข) · ＋หน้าใหม่ · ▦ เทมเพลตของหน้านั้น (เฉพาะสมุด)","หน้า เพิ่มหน้า หน้าใหม่ เปลี่ยนหน้า"],
 ["selfmt","🎨 แต่ง (ที่เลือก)",'#ink-selfmt',"โผล่เมื่อเลือกของ: เปลี่ยนสี ความหนา ขนาดตัวอักษร พื้นโน้ตแปะ รูปทรง","แต่ง เปลี่ยนสี สีตัวอักษร ขนาดตัวอักษร"],
 ["selgrp","จัดกลุ่ม",'#ink-selgrp',"โผล่เมื่อเลือกหลายอย่าง: รวมให้เลือก/ย้ายพร้อมกัน","จัดกลุ่ม group รวม"],
 ["selaln","จัดแนว",'#ink-selaln',"โผล่เมื่อเลือกหลายอย่าง: จัดชิดซ้าย/ขวา/กลาง กระจายระยะเท่ากัน","จัดแนว จัดเรียง กระจาย align กึ่งกลาง"],
 ["selcopy","คัดลอก/ตัด/วาง/สำเนา",'#ink-selcopy',"โผล่เมื่อเลือกของ: คัดลอก ตัด วาง (ข้ามหน้าได้) สำเนา (Ctrl+C / X / V)","คัดลอก copy ตัด วาง paste สำเนา ก๊อป"],
 ["sellock","ล็อก",'#ink-sellock',"ล็อกของให้ย้ายหรือลบโดยไม่ตั้งใจไม่ได้ · ใช้ล็อกเทมเพลต/พื้นหลัง","ล็อก lock ปลดล็อก ตรึง"],
 ["selz","ลำดับชั้น",'#ink-selz',"ส่งไปหน้าสุด/หลังสุด/ขึ้น/ลง เมื่อของทับกัน","ลำดับ ชั้น หน้า หลัง ทับ"],
 ["sellink","ลิงก์",'#ink-sellink',"ใส่ลิงก์ที่ของที่เลือก: เว็บ / ไปหน้าอื่น / บุ๊กมาร์ก — แตะด้วยเครื่องมือมือหรือโหมดนำเสนอ","ลิงก์ link url เชื่อม"],
 ["selshape","✨ จัดรูปทรง",'#ink-selshape',"แปลงเส้นที่วาดคร่าวๆ เป็นรูปทรงเป๊ะ (เส้นตรง วงกลม สี่เหลี่ยม สามเหลี่ยม)","จัดรูปทรง เส้นตรง เป๊ะ วงกลม"],
 ["seltxt","Aa ลายมือ→ตัวพิมพ์",'#ink-seltxt',"โผล่เมื่อลาสโซ่ลายมือ: ให้ AI อ่านลายมือไทย/อังกฤษเป็นข้อความพิมพ์ แก้ก่อนวางได้ (แทนที่ หรือวางไว้ใต้ลายมือ)","ลายมือ ตัวพิมพ์ แปลง ocr อ่านลายมือ ถอดข้อความ"],
 ["selcalc","Σ ผูกสูตร",'#ink-selcalc',"โผล่เมื่อเลือกกล่องข้อความที่มีตัวเลข: รวม เฉลี่ย สูงสุด ต่ำสุด ผลต่าง % — ผลอัปเดตเองเมื่อแก้ตัวเลข","ผูกสูตร สูตร รวม เฉลี่ย excel ผลรวม คำนวณอัตโนมัติ"],
 ["seledit","✎ แก้ข้อความ",'#ink-seledit',"โผล่เมื่อเลือกกล่องข้อความ 1 อัน: เปิดแก้ข้อความ (หรือแตะซ้ำที่ข้อความ)","แก้ข้อความ แก้ไข"],
 ["seldel","ลบที่เลือก",'#ink-seldel',"ลบของที่เลือก (หรือกด Delete)","ลบที่เลือก ลบ delete"]
];
const HLP_NOTE=[
 ["act","สรุป→งาน",'[data-ne="act"]',"AI อ่านบันทึกนี้ (หรือเฉพาะข้อความที่เลือก) แล้วสรุป มติ และรายการงาน (ใคร/อะไร/เมื่อไร) ให้ติ๊กเลือก-แก้ไข แล้วกดสร้างงานเข้า Sky Work ได้เลย · แทรกสรุปกลับลงบันทึกได้","สรุป ประชุม งาน action item แตกงาน มติ รายงานการประชุม สร้างงาน"],
 ["ai","ผู้ช่วย AI",'[data-ne="ai"]',"ปุ่มนี้เอง — ถามหาเครื่องมือหรือให้สอนใช้งานได้","ช่วย ผู้ช่วย ai สอน ถาม"],
 ["undo","ย้อนกลับ / ทำซ้ำ",'[data-ne="undo"]',"ย้อน (Ctrl+Z) / ทำซ้ำ (Ctrl+Shift+Z)","ย้อน undo redo ทำซ้ำ"],
 ["h2","หัวข้อใหญ่/ย่อย",'[data-ne="h2"]',"H2 = หัวข้อใหญ่ · H3 = หัวข้อย่อย (เลือกบรรทัดนั้นก่อน)","หัวข้อ heading ใหญ่ ย่อย"],
 ["bold","ตัวหนา เอียง ขีดเส้นใต้ ขีดฆ่า ตัวบาง",'[data-ne="bold"]',"เลือกข้อความแล้วกด B / I / U / S / ตัวบาง (Ctrl+B, I, U)","ตัวหนา bold เอียง italic ขีดเส้นใต้ ขีดฆ่า ตัวบาง"],
 ["ul","บูเลต / เลขข้อ",'[data-ne="ul"]',"รายการหัวข้อย่อยแบบจุด หรือเลขข้อ · Tab/Shift+Tab ย่อหน้า","บูเลต bullet เลขข้อ รายการ ลิสต์ ย่อหน้า"],
 ["ck","รายการช่องติ๊ก (To-do)",'[data-ne="ck"]',"สร้างรายการทำ ติ๊กที่ช่องสี่เหลี่ยมเมื่อเสร็จ","ติ๊ก to-do checklist ทำ เช็คลิสต์ checkbox"],
 ["hr","เส้นคั่น",'[data-ne="hr"]',"แทรกเส้นคั่นแนวนอน","เส้นคั่น แบ่ง"],
 ["indent","ย่อหน้า",'[data-ne="indent"]',"เลื่อนเข้า/ออกทางขวา-ซ้าย (Tab / Shift+Tab)","ย่อหน้า เยื้อง indent tab"],
 ["color","สีตัวอักษร / ไฮไลต์",'[data-ne="color"]',"เลือกข้อความก่อน แล้วเลือกสีตัวอักษรหรือสีไฮไลต์","สี ไฮไลต์ ตัวอักษร เน้น"],
 ["img","แนบรูป",'[data-ne="img"]',"แนบรูปจากเครื่อง (ย่อให้อัตโนมัติ) หรือวางจากคลิปบอร์ด · แตะรูปเพื่อปรับขนาด 33/50/100%","รูป รูปภาพ แนบ ภาพ"],
 ["mic","พิมพ์ตามเสียงพูด",'[data-ne="mic"]',"กดแล้วพูด ข้อความถูกพิมพ์ตรงเคอร์เซอร์ · กดอีกครั้งเพื่อหยุด · มีปุ่ม “🎤 พูดให้พิมพ์” ใกล้ช่องเนื้อหาด้วย","ไมค์ เสียง พูด พิมพ์ตามเสียง"],
 ["calc","เครื่องคิดเลข",'[data-ne="calc"]',"เครื่องคิดเลขลอย · พิมพ์ 1200+350*2= ได้ผลต่อท้าย · เลือกตัวเลขแล้วเปิด จะมีปุ่มรวม/เฉลี่ย","เครื่องคิดเลข คำนวณ บวก ลบ คูณ หาร %"],
 ["stk","สติกเกอร์สถานะ",'[data-ne="stk"]',"แทรกสติกเกอร์ขยับได้ (ด่วน HOT เสร็จแล้ว…) ลงในข้อความ","สติกเกอร์ อีโมจิ ด่วน hot สถานะ"],
 ["table","ตาราง",'[data-ne="table"]',"แทรกตาราง (วางข้อมูลจาก Excel ได้เลย) · แตะในช่องแล้วมีเมนูเพิ่ม/ลบแถว-คอลัมน์ สีช่อง จัดชิด · พิมพ์สูตรในช่อง เช่น =SUM(B2:B5) =B2*C2 · ช่วง A1:A5 · ผลอัปเดตเองเมื่อแก้เลข","ตาราง table excel สูตร sum รวม แถว คอลัมน์ ช่อง"],
 ["link","แนบลิงก์",'[data-ne="link"]',"เลือกข้อความแล้วกดเพื่อใส่ลิงก์ให้ข้อความนั้น","ลิงก์ link url เว็บ"],
 ["clear","ล้างรูปแบบ",'[data-ne="clear"]',"ล้างสี/ตัวหนา/ฯลฯ ของข้อความที่เลือก","ล้างรูปแบบ clear"],
 ["hist","กู้เวอร์ชัน",'[data-ne="hist"]',"เปิดเวอร์ชันที่เคยบันทึกไว้ เพื่อกู้ข้อความกลับ","เวอร์ชัน กู้ ประวัติ history ย้อนหลัง หาย"],
 ["micbtn","🎤 พูดให้พิมพ์",'#ne-micbtn',"ปุ่มใหญ่ใกล้ช่องเนื้อหา ใช้เหมือนปุ่มไมค์ในแถบเครื่องมือ","ไมค์ เสียง พูด"]
];
const HLP={ctx:null,open:false,busy:false,msgs:{ink:[],note:[]},spk:(()=>{ try{ return localStorage.getItem("sw-hlp-spk")!=="0"; }catch(e){ return true; } })(),listening:false,viaVoice:false};
const hlpKB=()=>HLP.ctx==="note"?HLP_NOTE:HLP_INK;
function hlpCtx(){ return el("ndlg")&&el("ndlg").open?"note":"ink"; }
function hlpState(){
 if(HLP.ctx==="note"){ const c=(typeof neCell==="function")?neCell():null; return "หน้าที่เปิด: เขียนบันทึก (ตัวแก้ไขข้อความ) · เคอร์เซอร์"+(c?"อยู่ในช่องตาราง":"อยู่ในเนื้อหาทั่วไป"); }
 const pg=inkPage&&inkPage(); const n=pg?pg.strokes.length:0, sel=ink.sel?ink.sel.idx.size:0, tn={pen:"ปากกา",shape:"รูปทรง",hl:"ไฮไลต์",eraser:"ยางลบ",text:"ข้อความ",lasso:"เลือก/ย้าย",laser:"เลเซอร์",tape:"เทป",sticky:"โน้ตแปะ",hand:"มือ"}[ink.tool]||ink.tool;
 return "หน้าที่เปิด: "+(ink.board?"กระดานกว้าง (ผืนผ้าใบไม่จำกัด)":"สมุดเขียนมือ หน้า "+(ink.cur+1)+"/"+ink.pages.length)+" · เครื่องมือตอนนี้: "+tn+" · ของบนหน้า "+n+" ชิ้น · เลือกอยู่ "+sel+" ชิ้น"+(inkPage()&&inkPage().gd&&inkPage().gd.length?" · มีเส้นไกด์ "+inkPage().gd.length+" เส้น":""); }
function hlpSystem(){
 const kb=hlpKB(), page=HLP.ctx==="note"?"เขียนบันทึก":(ink.board?"กระดานกว้าง":"สมุดเขียนมือ");
 const list=kb.map(k=>`{{${k[0]}}} ${k[1]} — ${k[3]}`).join("\n");
 return `คุณคือ “ผู้ช่วยสอนใช้งาน Sky Work” (แอปจัดการงาน/บันทึกของ HR) ผู้ใช้เปิดหน้า “${page}” อยู่และขอให้ช่วยหาเครื่องมือหรือสอนใช้งาน
กติกา: ตอบเป็นภาษาไทย สั้น กระชับ เป็นขั้นตอนเมื่อสอน (ไม่เกิน ~8 บรรทัด) ใช้ภาษาง่ายๆ ผู้ใช้ไม่ใช่โปรแกรมเมอร์ · ห้ามแต่งฟีเจอร์ที่ไม่มีในรายการ ถ้าไม่มีให้บอกตรงๆ และเสนอทางที่ใกล้เคียงที่สุด
เมื่อพูดถึงเครื่องมือ/ปุ่มที่มีในรายการ ให้ใส่รหัสในวงเล็บปีกกาคู่ เช่น {{pen}} เพื่อให้แอปแสดงปุ่ม “ชี้ให้ดู” (ใช้เฉพาะรหัสที่มีในรายการนี้ ใส่ทุกครั้งที่อ้างถึงปุ่ม)
ปุ่มที่ขึ้นต้น “โผล่เมื่อ…” จะไม่เห็นจนกว่าจะเลือกของตามเงื่อนไข ให้บอกขั้นตอนเลือกก่อน
รายการเครื่องมือในหน้านี้ (รหัส ชื่อ — วิธีใช้):
${list}
ถ้าผู้ใช้ขอให้ “สอนใช้หน้านี้” ให้สรุปภาพรวม 4-6 ข้อที่ใช้บ่อยที่สุด แล้วชวนถามต่อ`;
}
// ---------- ค้นหาในคู่มือ (ใช้เมื่อ AI ใช้ไม่ได้) ----------
function hlpLocal(q){
 const t=String(q||"").toLowerCase().replace(/[?？!]/g,"").trim(), ws=t.split(/\s+/).filter(w=>w.length>0);
 const sc=HLP.ctx==="note"?HLP_NOTE:HLP_INK; const res=sc.map(k=>{ const hay=(k[1]+" "+k[4]+" "+k[3]).toLowerCase(); let s=0; ws.forEach(w=>{ if(hay.includes(w))s+=w.length>2?3:1; }); k[4].toLowerCase().split(/\s+/).forEach(w=>{ if(w.length>1&&t.includes(w))s+=4; }); return [s,k]; }).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,3);
 if(!res.length)return "ยังหาปุ่มที่ตรงกับคำถามไม่เจอค่ะ ลองบอกว่าอยากทำอะไร เช่น “ลบเส้น” “แทรกรูป” “คำนวณเลข” “ทำให้เป็นเส้นตรง”";
 return "ลองดูปุ่มเหล่านี้ค่ะ:\n"+res.map(([,k])=>"• "+k[1]+" {{"+k[0]+"}}\n  "+k[3]).join("\n");
}
// ---------- แสดงผล ----------
function hlpFmt(t){ let h=esc(String(t||"")).replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>"); const kb=hlpKB();
 h=h.replace(/\{\{([a-z0-9]+)\}\}/g,(m,id)=>{ const k=kb.find(x=>x[0]===id); return k?`<button type="button" class="hlp-chip" data-hid="${id}">👆 ชี้ให้ดู: ${esc(k[1])}</button>`:""; });
 return h.replace(/\n/g,"<br>"); }
function hlpPaint(){ const b=el("hlp-body"); if(!b)return; const arr=HLP.msgs[HLP.ctx]; 
 b.innerHTML=(arr.length?"":`<div class="hlp-hi"><b>ถามได้เลยค่ะ ✨</b><div class="hint" style="margin:4px 0 10px;line-height:1.6">หาเครื่องมือที่ไม่เจอ หรือให้สอนวิธีใช้ของหน้านี้ — ฉันจะบอกพร้อมปุ่ม “ชี้ให้ดู” ว่าอยู่ตรงไหน<br>🎤 <b>กดไมค์ครั้งเดียวแล้วพูดได้เลย</b> เช่น “ลบเส้นยังไง” หรือสั่ง “ใช้ปากกา”</div><div class="hlp-sug">${hlpSugs().map(s=>`<button type="button" data-hs="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`)+
 arr.map(m=>`<div class="hlp-m ${m.r==="u"?"u":"a"}">${m.r==="u"?esc(m.t).replace(/\n/g,"<br>"):hlpFmt(m.t)}</div>`).join("")+(HLP.busy?`<div class="hlp-m a"><span class="hlp-dots"><i></i><i></i><i></i></span></div>`:"");
 b.scrollTop=b.scrollHeight; }
function hlpSugs(){ return HLP.ctx==="note"?["สอนใช้หน้านี้","ทำตารางคิดเลขอัตโนมัติยังไง","ทำรายการติ๊กถูกยังไง","พูดให้พิมพ์ได้ไหม"]:["สอนใช้หน้านี้","อยากลบเส้นที่เขียนผิด","ทำให้เป็นเส้นตรงเป๊ะยังไง","แปลงลายมือเป็นตัวพิมพ์ยังไง","แทรกรูปภาพยังไง"]; }
function hlpClose(){ const p=el("hlp"); if(p)p.remove(); HLP.open=false; hlpShutUp(); if(HLP.listening&&typeof voiceStop==="function")voiceStop(); HLP.listening=false; }
function hlpOpen(host){
 if(el("hlp")){ hlpClose(); return; } HLP.ctx=hlpCtx(); HLP.open=true; const p=document.createElement("div"); p.id="hlp"; p.className="hlp";
 p.innerHTML=`<div class="hlp-h"><b>✨ ผู้ช่วย Sky Work <small>${HLP.ctx==="note"?"เขียนบันทึก":(ink.board?"กระดานกว้าง":"สมุดเขียนมือ")}</small></b><span><button type="button" data-hc="spk" id="hlp-spk" title="อ่านคำตอบออกเสียง (เมื่อถามด้วยเสียง)">🔊</button><button type="button" data-hc="clr" title="ล้างบทสนทนา">ล้าง</button><button type="button" data-hc="x" aria-label="ปิด">✕</button></span></div><div id="hlp-body" class="hlp-body"></div>
 <form class="hlp-f" id="hlp-form"><button type="button" class="hlp-mic" id="hlp-mic" data-hmic="1" aria-label="กดแล้วพูดสั่ง" title="กดครั้งเดียว แล้วพูดได้เลย">🎤</button><textarea id="hlp-in" rows="1" placeholder="พิมพ์ หรือกด 🎤 แล้วพูด" aria-label="ถามผู้ช่วย"></textarea><button type="submit" class="hlp-send" aria-label="ส่ง">ส่ง</button></form>`;
 (host||el(HLP.ctx==="note"?"ndlg":"inkdlg")).appendChild(p);
 p.addEventListener("pointerdown",e=>e.stopPropagation()); p.addEventListener("mousedown",e=>{ if(!e.target.closest("textarea"))e.preventDefault(); });
 p.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b)return; e.stopPropagation();
  if(b.dataset.hmic)hlpMic(); else if(b.dataset.hc==="spk"){ HLP.spk=!HLP.spk; try{ localStorage.setItem("sw-hlp-spk",HLP.spk?"1":"0"); }catch(er){} if(!HLP.spk)hlpShutUp(); hlpSpkPaint(); }
  else if(b.dataset.hc==="x")hlpClose(); else if(b.dataset.hc==="clr"){ HLP.msgs[HLP.ctx]=[]; hlpPaint(); }
  else if(b.dataset.hs)hlpAsk(b.dataset.hs); else if(b.dataset.hid)hlpPoint(b.dataset.hid); });
 const ta=el("hlp-in"); ta.addEventListener("keydown",e=>{ e.stopPropagation(); if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); el("hlp-form").requestSubmit(); } else if(e.key==="Escape"){ hlpClose(); } });
 ta.addEventListener("input",()=>{ ta.style.height="auto"; ta.style.height=Math.min(110,ta.scrollHeight)+"px"; });
 el("hlp-form").addEventListener("submit",e=>{ e.preventDefault(); const v=ta.value.trim(); if(!v)return; ta.value=""; ta.style.height="auto"; hlpAsk(v); });
 hlpPaint(); hlpSpkPaint(); setTimeout(()=>{ try{ if(!HLP.noFocus)ta.focus(); }catch(e){} },80);
}
// ---------- ชี้ให้ดู ----------
function hlpPoint(id){
 const k=hlpKB().find(x=>x[0]===id); if(!k)return; let t=null; try{ t=document.querySelector(k[2]); }catch(e){}
 const vis=t&&t.offsetParent!==null&&!t.hidden&&t.getClientRects().length;
 if(!vis){ const why=/^sel|^seltxt|^selcalc/.test(id)?"ปุ่มนี้จะโผล่เมื่อเลือกของก่อน (ใช้เครื่องมือ “เลือก/ย้าย” ล้อมของที่ต้องการ)":(HLP.ctx==="note"?"ปุ่มนี้ยังไม่แสดงตอนนี้ ลองเลื่อนแถบเครื่องมือดูค่ะ":"ปุ่มนี้ยังไม่แสดงตอนนี้ (ลองกด ⋯ เมนูเพิ่มเติม หรือเลื่อนแถบเครื่องมือ)"); HLP.msgs[HLP.ctx].push({r:"a",t:why}); hlpPaint(); return; }
 try{ t.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"}); }catch(e){}
 document.querySelectorAll(".hlp-pulse").forEach(n=>n.classList.remove("hlp-pulse")); void t.offsetWidth; t.classList.add("hlp-pulse"); setTimeout(()=>t.classList.remove("hlp-pulse"),4200);
}
// ---------- สั่งด้วยเสียง: กดปุ่ม 🎤 ครั้งเดียว แล้วพูด → ส่งคำถาม/คำสั่งอัตโนมัติ ----------
function hlpSpkPaint(){ const b=el("hlp-spk"); if(b){ b.textContent=HLP.spk?"🔊":"🔇"; b.classList.toggle("off",!HLP.spk); } }
function hlpMicPaint(){ const b=el("hlp-mic"); if(b){ b.classList.toggle("on",!!HLP.listening); b.textContent=HLP.listening?"⏹":"🎤"; b.setAttribute("aria-label",HLP.listening?"หยุดฟัง":"กดแล้วพูดสั่ง"); } }
function hlpMic(){
 if(HLP.listening){ voiceStop(); HLP.listening=false; hlpMicPaint(); return; }
 if(typeof voiceSupported!=="function"||!voiceSupported()){ voiceNoSupport(); return; }
 if(VOICE.on){ voiceStop(); if(HLP.ctx!=="note"){ ink.voiceOn=false; try{ inkToolbar(); }catch(e){} } else if(typeof neVoiceBtns==="function")neVoiceBtns(false); }
 hlpShutUp(); const host=el(HLP.ctx==="note"?"ndlg":"inkdlg"); let got=false;
 const ok=voiceStart({host,onText:txt=>{ if(got)return; got=true; HLP.listening=false; setTimeout(()=>{ voiceStop(); hlpMicPaint(); },0); HLP.viaVoice=true; hlpAsk(txt,true); },onStop:()=>{ HLP.listening=false; hlpMicPaint(); }});
 if(!ok){ voiceNoSupport(); return; } HLP.listening=true; hlpMicPaint();
}
function hlpShutUp(){ try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){} }
function hlpSpeak(t){ if(!HLP.spk||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return; try{ const clean=String(t).replace(/\{\{[a-z0-9]+\}\}/g,"").replace(/\([^)]*AI ยังไม่พร้อม[^)]*\)/g,"").replace(/[•*_`]/g," ").replace(/\s+/g," ").trim().slice(0,420); if(!clean)return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(clean); u.lang="th-TH"; u.rate=1.02; const v=(speechSynthesis.getVoices()||[]).find(x=>/^th/i.test(x.lang)); if(v)u.voice=v; speechSynthesis.speak(u); }catch(e){} }
// คำสั่งตรง (ไม่ต้องรอ AI): “ใช้ปากกา” “เปลี่ยนเป็นยางลบ” “ย้อนกลับ” “ซูมพอดีหน้า” ฯลฯ — เฉพาะในสมุด/กระดาน
const HLP_TOOLWORDS=[["pen","ปากกา"],["shape","รูปทรง"],["hl","ไฮไลต์|ไฮไลท์|มาร์คเกอร์"],["eraser","ยางลบ|ลบเส้น"],["text","ข้อความ|พิมพ์ตัวอักษร"],["lasso","ลาสโซ่|เลือกหลายอัน"],["move","เคลื่อนย้าย|ย้ายของ|มูฟ"],["laser","เลเซอร์"],["tape","เทป"],["sticky","โน้ตแปะ|กระดาษโน้ต|สติ๊กกี้"],["hand","เลื่อนหน้า|มือ"]];
function hlpCommand(q){
 if(HLP.ctx==="note")return null; const t=String(q||"").trim().replace(/\s+/g,""); if(!t||t.length>40)return null;
 const verb=/^(ช่วย)?(ขอ|ให้|เปลี่ยนเป็น|เปลี่ยนไปใช้|เปลี่ยนไป|สลับเป็น|สลับไปใช้|สลับไป|เลือก|ใช้|เปิด|หยิบ|ไปที่)/.test(t);
 if(/^(ช่วย)?(ย้อนกลับ|ย้อน|ยกเลิกที่ทำ|อันดู)$/.test(t)){ try{ inkUndo(); }catch(e){ return null; } return "ย้อนกลับให้แล้วค่ะ"; }
 if(/^(ช่วย)?(ทำซ้ำ|ย้อนกลับไปข้างหน้า)$/.test(t)){ try{ inkUndo(true); }catch(e){ return null; } return "ทำซ้ำให้แล้วค่ะ"; }
 if(/(ซูมพอดี|พอดีหน้า|พอดีจอ)/.test(t)){ const z=el("ink-zfit"); if(z){ z.click(); return "ปรับให้พอดีหน้าแล้วค่ะ"; } }
 if(/^(ซูมเข้า|ขยายหน้า)$/.test(t)){ const z=el("ink-zin"); if(z){ z.click(); return "ซูมเข้าให้แล้วค่ะ"; } }
 if(/^(ซูมออก|ย่อหน้า)$/.test(t)){ const z=el("ink-zout"); if(z){ z.click(); return "ซูมออกให้แล้วค่ะ"; } }
 if(/^(ช่วย)?(ลบที่เลือก|ลบอันนี้|ลบเลย)$/.test(t)&&ink.sel){ const d=el("ink-seldel"); if(d&&!d.hidden){ d.click(); return "ลบที่เลือกให้แล้วค่ะ (ย้อนกลับได้)"; } }
 if(!verb&&t.length>14)return null;
 for(const [k,w] of HLP_TOOLWORDS){ if(new RegExp("("+w+")").test(t)&&(verb||t.length<=10)){ const b=document.querySelector('[data-itool="'+k+'"]'); if(b){ const nm=(INK_TOOLS.find(x=>x[0]===k)||[])[1]||k; b.click(); setTimeout(()=>hlpPoint(k),150); return "เปลี่ยนเป็นเครื่องมือ “"+nm.split(" ")[0]+"” ให้แล้วค่ะ {{"+k+"}}"; } } }
 return null;
}
// ---------- ถาม AI ----------
async function hlpAsk(q,viaVoice){
 const arr=HLP.msgs[HLP.ctx]; if(HLP.busy)return; const voice=!!(viaVoice||HLP.viaVoice); HLP.viaVoice=false; arr.push({r:"u",t:q});
 const cmd=hlpCommand(q); if(cmd){ arr.push({r:"a",t:cmd}); hlpPaint(); if(voice)hlpSpeak(cmd); return; }
 HLP.busy=true; hlpPaint();
 let out=""; try{
  let token=""; try{ const {data:{session}}=await SB.auth.getSession(); token=session?session.access_token:""; }catch(e){}
  const turns=[]; arr.slice(-9).forEach(m=>{ const role=m.r==="u"?"user":"assistant"; if(turns.length&&turns[turns.length-1].role===role)turns[turns.length-1].content+="\n"+m.t; else turns.push({role,content:m.t}); });
  while(turns.length&&turns[0].role!=="user")turns.shift();
  const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),45000);
  const r=await fetch("/api/ai",{method:"POST",signal:ctl.signal,headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({system:hlpSystem(),context:hlpState(),max_tokens:800,messages:turns})});
  clearTimeout(tm); const j=await r.json().catch(()=>({})); if(!r.ok)throw new Error(j.message||("HTTP "+r.status)); out=String(j.text||"").trim(); if(!out)throw new Error("empty");
 }catch(e){ out=hlpLocal(q)+"\n\n(ตอนนี้ AI ยังไม่พร้อมใช้งาน เลยค้นจากคู่มือในแอปให้แทนค่ะ"+(e&&e.message&&!/empty|abort/i.test(e.message)?" — "+String(e.message).slice(0,90):"")+")"; }
 HLP.busy=false; if(HLP.open){ arr.push({r:"a",t:out}); hlpPaint(); if(voice){ hlpSpeak(out); const m=out.match(/\{\{([a-z0-9]+)\}\}/); if(m&&!/^(ai)$/.test(m[1]))setTimeout(()=>hlpPoint(m[1]),400); } }
}
// ---------- ปุ่มเปิด ----------
function hlpToggle(host){ if(el("hlp")&&el("hlp").parentNode===host){ hlpClose(); return; } hlpClose(); hlpOpen(host); }
[["inkdlg","ink"],["ndlg","note"]].forEach(([id,c])=>{ const d=el(id); if(d)d.addEventListener("close",()=>{ hlpClose(); HLP.msgs[c]=[]; }); });   // ปิดสมุด/บันทึก = เริ่มบทสนทนาใหม่
(function(){ const nt=el("ntool"); if(nt)nt.addEventListener("click",e=>{ const b=e.target.closest('[data-ne="ai"]'); if(b){ e.stopImmediatePropagation(); hlpToggle(el("ndlg")); } },true); })();
