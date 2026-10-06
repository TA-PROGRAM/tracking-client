import * as lookups from "./lookups";
import * as system from "./system";
import * as projects from "./projects";

const complaint = [
  ["ถนนชำรุดเป็นหลุมบ่อ", "ถนนหน้าโรงเรียนบ้านหัวทะเลเป็นหลุมลึก รถจักรยานยนต์ล้มบ่อย", "สมหญิง รักดี", 14.975512, 102.101234, 3, "2026-08-14T09:12:33"],
  ["ไฟส่องสว่างดับ", "ไฟถนนสาย นม.ถ.1-0150 ดับทั้งแนว ประมาณ 1 กม.", "ประยุทธ์ มีสุข", 15.012101, 102.050122, 2, "2026-09-02T19:40:10"],
  ["น้ำท่วมขังถนน", "ฝนตกแล้วน้ำท่วมขังสูง ระบายไม่ทัน", "อรทัย แสงทอง", 14.881002, 102.021998, 1, "2026-09-21T07:05:51"],
  ["ขอให้ตัดกิ่งไม้", "กิ่งไม้บังป้ายจราจรทางโค้ง อันตราย", "วิทยา คงมั่น", 14.952211, 101.998762, 4, "2026-09-28T13:22:01"],
  ["สะพานไม้ชำรุด", "สะพานข้ามลำห้วยไม้ผุ เด็กนักเรียนใช้สัญจรทุกวัน", "บุญเรือน ใจงาม", 15.201388, 102.494091, 1, "2026-10-03T08:15:00"],
].map(([title, detail, username, lat, lng, status, date], i) => ({
  id: i + 1,
  org_id: 1,
  complaint_title: title,
  complaint_detail: detail,
  complaint_username: username,
  complaint_cid: `13099001${String(23456 + i * 111).padStart(5, "0")}`,
  complaint_telephone: `08${String(91234567 + i * 1111111).slice(0, 8)}`,
  latitude: lat,
  longitude: lng,
  complaint_status: status,
  images: [],
  flag: 1,
  add_date: date,
}));

const complaint_audit = [
  { id: 1, complaint_id: 1, audit_date: "2026-08-14", audit_status: 1, audit_desc: "<p>รับเรื่องและส่งต่อกองช่าง</p>", flag: 1, add_users: 9 },
  { id: 2, complaint_id: 1, audit_date: "2026-08-20", audit_status: 2, audit_desc: "<p>ลงพื้นที่สำรวจ</p>", flag: 1, add_users: 6 },
  { id: 3, complaint_id: 1, audit_date: "2026-09-05", audit_status: 3, audit_desc: "<p>ซ่อมแซมผิวจราจรเรียบร้อย</p>", flag: 1, add_users: 6 },
  { id: 4, complaint_id: 2, audit_date: "2026-09-03", audit_status: 1, audit_desc: "<p>รับเรื่อง</p>", flag: 1, add_users: 9 },
  { id: 5, complaint_id: 2, audit_date: "2026-09-10", audit_status: 2, audit_desc: "<p>สั่งซื้อหลอดไฟทดแทน</p>", flag: 1, add_users: 6 },
  { id: 6, complaint_id: 4, audit_date: "2026-09-29", audit_status: 4, audit_desc: "<p>ส่งต่อแขวงทางหลวงชนบท</p>", flag: 1, add_users: 9 },
];

const coordinate_main = [
  { id: 1, service_date: "2026-07-03", org_id: 1, service_title: "ขอความช่วยเหลือซ่อมแซมบ้านจากวาตภัย", service_desc: "<p>หลังคาบ้านพังเสียหายจากพายุฤดูร้อน</p>", prename: 1, fname: "สมชาย", lname: "ใจดี", telephone: "0812345678", house: "45/2", community: "ชุมชนหัวทะเล", road: "ถนนมิตรภาพ", village: "05", changwat: "30", ampur: "3001", tambon: "300109", flag: 1, add_users: 9, add_date: "2026-07-03T10:22:00" },
  { id: 2, service_date: "2026-08-11", org_id: 1, service_title: "ขอรถบรรทุกน้ำช่วยภัยแล้ง", service_desc: "<p>หมู่บ้านขาดแคลนน้ำอุปโภคบริโภค</p>", prename: 3, fname: "มณี", lname: "ศรีงาม", telephone: "0897654321", house: "12", community: "บ้านหนองบัว", road: "", village: "07", changwat: "30", ampur: "3014", tambon: "301402", flag: 1, add_users: 9, add_date: "2026-08-11T14:05:00" },
  { id: 3, service_date: "2026-09-18", org_id: 1, service_title: "ขอรับการสนับสนุนเก้าอี้รถเข็นผู้พิการ", service_desc: "<p>ผู้ป่วยติดเตียง ต้องการรถเข็น 1 คัน</p>", prename: 2, fname: "บุญมา", lname: "ทองดี", telephone: "0861112233", house: "99", community: "บ้านโนนสูง", road: "", village: "02", changwat: "30", ampur: "3010", tambon: "301001", flag: 1, add_users: 2, add_date: "2026-09-18T09:00:00" },
];

const coordinate_data = [
  { id: 1, service_id: 1, service_status: 1, service_desc: "<p>ประสานกองช่างลงพื้นที่สำรวจความเสียหาย</p>", flag: 1, add_users: 9, add_date: "2026-07-04T09:30:00" },
  { id: 2, service_id: 1, service_status: 1, service_desc: "<p>มอบวัสดุซ่อมแซมหลังคาเรียบร้อย</p>", flag: 1, add_users: 9, add_date: "2026-07-12T15:10:00" },
  { id: 3, service_id: 2, service_status: 1, service_desc: "<p>จัดรถบรรทุกน้ำ 2 เที่ยว</p>", flag: 1, add_users: 9, add_date: "2026-08-12T11:00:00" },
];

const seed = {
  ...lookups,
  ...system,
  ...projects,
  complaint,
  complaint_audit,
  coordinate_main,
  coordinate_data,
};
delete seed.ADMIN_ROLES;
delete seed.QR_ADMIN_ROLES;

export default seed;
