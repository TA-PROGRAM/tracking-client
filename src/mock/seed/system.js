// Users, roles, menus, settings. Mock login accounts: see README (all passwords are "1234").
export const users_role = [
  { id: 1, role: "admin", name: "ผู้ดูแลระบบ", permiss: "1,2,3,4,5,6,7,8,9,10,11,12", active: 1 },
  { id: 2, role: "orgadmin", name: "ผู้ดูแลระบบหน่วยงาน", permiss: "1,2,3,4,5,6,7,8,9,11,12", active: 1 },
  { id: 3, role: "user", name: "เจ้าหน้าที่หน่วยงาน (เจ้าของโครงการ)", permiss: "1,2,3", active: 1 },
  { id: 4, role: "purchase", name: "เจ้าหน้าที่อนุมัติจัดซื้อ/จัดจ้าง", permiss: "1,2,4", active: 1 },
  { id: 5, role: "supplies", name: "เจ้าหน้าที่พัสดุ", permiss: "1,2,5", active: 1 },
  { id: 6, role: "contract", name: "กรรมการตรวจรับ/เจ้าหน้าที่สัญญา", permiss: "1,2,6", active: 1 },
  { id: 7, role: "finance", name: "เจ้าหน้าที่การเงิน", permiss: "1,2,7", active: 1 },
  { id: 9, role: "executive", name: "ผู้บริหาร", permiss: "1,2,3,4,5,6,7,9", active: 1 },
  { id: 11, role: "central", name: "เจ้าหน้าที่ส่วนกลาง", permiss: "1,2,3,4,5,6,7,8", active: 1 },
  { id: 12, role: "qrcode", name: "เจ้าหน้าที่ QR Code", permiss: "1,8", active: 1 },
];

// roles that see every bureau (legacy hard-coded list)
export const ADMIN_ROLES = [1, 2, 9, 11];
export const QR_ADMIN_ROLES = [1, 2, 9, 11, 12];

// top menu (users_permiss) with sub menus (users_subpermiss)
export const users_permiss = [
  { id: 1, name: "หน้าหลัก", module: "dashboard", url: "/dashboard", icon: "pi pi-home", order: 1, flag: 1 },
  { id: 2, name: "ข้อมูลโครงการ", module: "project", url: "/project", icon: "pi pi-list", order: 2, flag: 1 },
  { id: 3, name: "แผนดำเนินโครงการ", module: "project-plan", url: "/project-plan", icon: "pi pi-calendar", order: 3, flag: 1 },
  { id: 4, name: "จัดซื้อ/จัดจ้าง", module: "purchase", url: "/purchase", icon: "pi pi-shopping-cart", order: 4, flag: 1 },
  { id: 5, name: "จัดหาพัสดุ", module: "supplies", url: "/supplies", icon: "pi pi-box", order: 5, flag: 1 },
  { id: 6, name: "ดำเนินการ/ตรวจรับ", module: "contract", url: "/contract", icon: "pi pi-file-check", order: 6, flag: 1 },
  { id: 7, name: "การเงิน", module: "finance", url: "/finance", icon: "pi pi-wallet", order: 7, flag: 1 },
  { id: 8, name: "QR Code โครงการ", module: "qrcode-gen", url: "/qrcode-gen", icon: "pi pi-qrcode", order: 8, flag: 1 },
  { id: 9, name: "เรื่องร้องเรียน", module: "complaint", url: "/complaint", icon: "pi pi-megaphone", order: 9, flag: 1 },
  { id: 10, name: "ประสานงาน", module: "coordinate", url: "/coordinate", icon: "pi pi-comments", order: 10, flag: 1 },
  { id: 11, name: "ผู้ใช้งานระบบ", module: "users", url: "/users", icon: "pi pi-users", order: 11, flag: 1 },
  { id: 12, name: "ตั้งค่าระบบ", module: "systems", url: "/systems", icon: "pi pi-cog", order: 12, flag: 1 },
];

export const users_subpermiss = [
  { id: 1, m_id: 2, page: "", title: "ข้อมูลโครงการทั้งหมด", icon: "pi pi-list", order: 1, flag: 1 },
  { id: 2, m_id: 2, page: "add", title: "เพิ่มโครงการ", icon: "pi pi-plus", order: 2, flag: 1 },
  { id: 3, m_id: 3, page: "", title: "ข้อมูลแผนดำเนินโครงการทั้งหมด", icon: "pi pi-list", order: 1, flag: 1 },
  { id: 4, m_id: 3, page: "gantt", title: "แผนดำเนินโครงการ (Gantt)", icon: "pi pi-chart-bar", order: 2, flag: 1 },
  { id: 5, m_id: 3, page: "five-year", title: "แผนโครงการ 5 ปี", icon: "pi pi-table", order: 3, flag: 1 },
  { id: 6, m_id: 5, page: "", title: "ข้อมูลโครงการจัดหาพัสดุ", icon: "pi pi-list", order: 1, flag: 1 },
  { id: 7, m_id: 5, page: "company", title: "ข้อมูลผู้ประกอบการ/ผู้ชนะ", icon: "pi pi-building", order: 2, flag: 1 },
  { id: 8, m_id: 6, page: "", title: "ข้อมูลดำเนินการ/ตรวจรับ", icon: "pi pi-list", order: 1, flag: 1 },
  { id: 9, m_id: 6, page: "deliver", title: "ส่งมอบงาน/ตรวจรับ", icon: "pi pi-truck", order: 2, flag: 1 },
  { id: 11, m_id: 12, page: "system", title: "ตั้งค่าระบบ", icon: "pi pi-cog", order: 1, flag: 1 },
  { id: 12, m_id: 12, page: "org", title: "ข้อมูลหน่วยงาน", icon: "pi pi-building", order: 2, flag: 1 },
  { id: 13, m_id: 12, page: "bureau", title: "ข้อมูลหน่วยงานย่อย", icon: "pi pi-sitemap", order: 3, flag: 1 },
  { id: 14, m_id: 12, page: "byear", title: "ข้อมูลปีงบประมาณ", icon: "pi pi-calendar", order: 4, flag: 1 },
  { id: 15, m_id: 12, page: "expenses-group", title: "ข้อมูลหมวดรายจ่าย", icon: "pi pi-th-large", order: 5, flag: 1 },
  { id: 16, m_id: 12, page: "expenses-type", title: "ข้อมูลประเภทค่าใช้จ่าย", icon: "pi pi-tags", order: 6, flag: 1 },
  { id: 17, m_id: 12, page: "equipment-type", title: "ประเภทอุปกรณ์", icon: "pi pi-box", order: 7, flag: 1 },
];

const u = (id, username, name, role_id, bureau_id, extra = {}) => ({
  id,
  username,
  password: "1234",
  name,
  shortname: name.split(" ")[0].replace(/^(นาย|นางสาว|นาง)/, ""),
  role_id,
  org_id: 1,
  bureau_id,
  cid: `13099${String(id).padStart(8, "0")}`,
  telephone: `08${String(10000000 + id * 1234567).slice(0, 8)}`,
  email: `${username}@koratpao.go.th`,
  avatar: null,
  status: 1,
  last_login: null,
  ...extra,
});

export const users = [
  u(1, "admin", "นายผู้ดูแล ระบบ", 1, 6),
  u(2, "orgadmin", "นางสาวสุภาพร ศรีสุข", 2, 1),
  u(3, "user", "นายสมชาย ใจดี", 3, 3),
  u(4, "purchase", "นางวันเพ็ญ มีทรัพย์", 4, 7),
  u(5, "supplies", "นายประเสริฐ พัสดุดี", 5, 7),
  u(6, "contract", "นายวิชัย ตรวจรับ", 6, 3),
  u(7, "finance", "นางสาวกาญจนา การเงิน", 7, 2),
  u(8, "executive", "นายบริหาร ก้าวหน้า", 9, 1),
  u(9, "central", "นางสาวส่วนกลาง ประสาน", 11, 6),
  u(10, "qrcode", "นายคิวอาร์ โค้ด", 12, 6),
  u(11, "edu", "นางสาวการศึกษา ดีเด่น", 3, 4),
  u(12, "health", "นายสาธารณสุข สุขภาพดี", 3, 5, { status: 0 }),
];

export const settings = [
  { id: 1, name: "cfg_site_title", value: "ระบบบริหารงานโครงการ อบจ.นครราชสีมา" },
  { id: 2, name: "cfg_app_name", value: "Korat PAO Project Tracking" },
  { id: 3, name: "cfg_app_nickname", value: "Project Tracking" },
  { id: 4, name: "cfg_site_meta_title", value: "ระบบบริหารงานโครงการ อบจ.นครราชสีมา (Korat-POA Project Tracking)" },
  { id: 5, name: "cfg_site_meta_description", value: "ติดตามโครงการ อบจ.นครราชสีมา" },
  { id: 6, name: "cfg_site_meta_keywords", value: "อบจ.นครราชสีมา, โครงการ, tracking" },
  { id: 7, name: "cfg_site_meta_author", value: "อบจ.นครราชสีมา" },
  { id: 8, name: "cfg_homepage_content", value: "<p>ยินดีต้อนรับสู่ระบบบริหารงานโครงการ</p>" },
  { id: 9, name: "cfg_footer_content", value: "2021 © อบจ.นครราชสีมา" },
  { id: 10, name: "cfg_line_notify_key", value: "" },
  { id: 11, name: "cfg_logo_image", value: null },
];

// LINE notify messages are not sent in the mock; they are logged here for inspection
export const notify_log = [];
export const visitors_table = [];
export const users_login = [];
