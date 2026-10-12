/* Content for the drug-info page (src/app/care/page.tsx). Edit the wording here.
   Text inside **double stars** is highlighted. Keep this to what the prescriber/pharmacist has advised. */

export const MISSED_DOSE = {
  title: "ถ้าลืมกินยาต้องทำอย่างไร?",
  cases: [
    { when: "นึกขึ้นได้ และยังไม่ใกล้เวลามื้อถัดไป", then: "ให้รับประทานทันทีที่นึกได้", icon: "clock" },
    { when: "ใกล้เวลามื้อถัดไปแล้ว", then: "ข้ามมื้อที่ลืม แล้วรับประทานมื้อถัดไปตามเวลาปกติ", icon: "skip" },
  ],
  never: { title: "ห้ามกินยาเพิ่มเป็น 2 เท่า", body: "ไม่ควรกินสองมื้อพร้อมกันเพื่อชดเชยมื้อที่ลืม" },
} as const;

export const CAUTIONS: string[] = [
  "ห้ามหยุดยาเองกะทันหัน อาจเกิดเวียนศีรษะ คลื่นไส้ วิตกกังวล นอนไม่หลับ หรืออาการคล้ายไฟฟ้าช็อต",
  "ยาอาจใช้เวลาหลายสัปดาห์กว่าจะเห็นผลชัดเจน",
  "แจ้งแพทย์หรือเภสัชกรก่อนใช้ร่วมกับยาอื่น โดยเฉพาะ MAOIs, **tramadol**, ยาต้านเศร้าอื่น และสมุนไพร **St. John's wort (Blackmores Hyperiforte)**",
  "**ระวังการดื่มแอลกอฮอล์** และควรติดตามความดันโลหิตตามแพทย์แนะนำ",
];
