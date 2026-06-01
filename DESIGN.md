---
name: Robot Website Design System
description: Clean, restrained equipment borrowing system for students and lab members.
---

<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Robot Website

## 1. Overview

**Creative North Star: "The Modern Workspace"**

ระบบมีการออกแบบที่เน้นความสว่าง สะอาดตา (Restrained) โดยใช้พื้นที่สีขาวและสีเทาเป็นหลัก เพื่อขับเน้นเฉพาะข้อมูลที่สำคัญ การโต้ตอบกับผู้ใช้ (Motion) จะเป็นไปอย่างนุ่มนวลและตอบสนองทันที (Responsive) แต่ไม่มากเกินความจำเป็น ระบบนี้ปฏิเสธการใช้รูปแบบที่ดูเป็น "งานที่สร้างด้วย AI ทั่วไป (AI Cliches)" อย่างเช่น พื้นหลังไล่สีม่วง/น้ำเงิน, glassmorphism ที่ไม่จำเป็น หรือกล่องขอบมนหนาๆ

**Key Characteristics:**
- **Restrained Color:** คลีน สว่าง ใช้สีส้มแต้มเฉพาะจุดสำคัญ
- **Familiar Typography:** เรียบง่าย อ่านง่ายแบบดั้งเดิม
- **Responsive Feel:** นุ่มนวลตอน Hover แต่ไม่กวนสายตา

## 2. Colors

กลยุทธ์สีของระบบคือการใช้ความเรียบง่าย (Restrained) โดยมี **สีส้ม (Orange)** เป็นสีหลัก (Primary) บนพื้นหลังโทนสว่าง/เทา

### Primary
- **Orange** ([to be resolved during implementation]): ใช้สำหรับปุ่มกดหลัก (Primary Actions) และจุดที่ต้องการดึงดูดสายตาอย่างแท้จริง

### Neutral
- **White/Gray** ([to be resolved during implementation]): สีพื้นหลัง สีข้อความ และสีเส้นขอบ

### Named Rules
**The Restrained Rule.** สีหลัก (สีส้ม) ต้องมีพื้นที่รวมบนหน้าจอน้อยกว่า 10% เสมอ ปล่อยให้พื้นที่ส่วนใหญ่เป็นสีขาวหรือเทาเพื่อให้ข้อมูลโดดเด่นขึ้นมาเอง

## 3. Typography

**Display Font:** Inter / Noto Sans Thai
**Body Font:** Inter / Noto Sans Thai

**Character:** ทันสมัย เรียบง่าย เป็นมิตรกับผู้อ่านทุกกลุ่ม (Single Sans direction)
*[font pairing to be chosen at implementation]*

### Hierarchy
- **Display**: [to be resolved during implementation]
- **Headline**: [to be resolved during implementation]
- **Title**: [to be resolved during implementation]
- **Body**: [to be resolved during implementation]
- **Label**: [to be resolved during implementation]

## 4. Elevation

พื้นผิวโดยทั่วไปจะแบนราบ (Flat by default) อาศัยการแบ่งแยกส่วนประกอบด้วยสีพื้นหลังที่ต่างกันเล็กน้อย หรือเส้นขอบบางๆ (Tonal Layering) เงาจะปรากฏเฉพาะเมื่อมีการโต้ตอบ (เช่น Hover บนปุ่ม/การ์ด) หรือเมื่อมีหน้าต่างซ้อนทับ (Modal) เท่านั้น

## 6. Do's and Don'ts

### Do:
- **Do** ใช้พื้นที่สีขาว (Whitespace) เพื่อจัดกลุ่มข้อมูลแทนการใช้กรอบหรือเส้นคั่นเสมอ
- **Do** ใช้สีส้มเฉพาะจุดที่เป็น Action สำคัญเท่านั้น

### Don't:
- **Don't** ใช้สไตล์การออกแบบที่ดูเป็น AI มากเกินไป (เช่น Gradient Text สีม่วง/น้ำเงิน, เงาฟุ้งๆ วงกว้าง (Ghost-card), หรือการทำขอบมนขนาดใหญ่เกินจริง (Border-radius: 32px+))
- **Don't** ใช้แอนิเมชันตกแต่งที่ไม่ได้เกิดจากการโต้ตอบโดยตรงของผู้ใช้
- **Don't** ใช้ข้อมูลอัดแน่นเกินไป (Overwhelming) หรือใช้สีสันที่ฉูดฉาดเกินไปจนลดความน่าเชื่อถือ
