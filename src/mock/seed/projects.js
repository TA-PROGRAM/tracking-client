// Generated project data covering every workflow step (deterministic RNG so data is stable)
let s = 20260601;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const dt = (date, h = 9) => `${date}T${String(h).padStart(2, "0")}:${String(int(0, 59)).padStart(2, "0")}:00`;

export const purchase_type = [
  { id: 1, name: "วิธีเฉพาะเจาะจง" },
  { id: 2, name: "วิธีประกวดราคาอิเล็กทรอนิกส์ (e-bidding)" },
  { id: 3, name: "วิธีคัดเลือก" },
  { id: 4, name: "วิธีตลาดอิเล็กทรอนิกส์ (e-market)" },
];
export const board_type = [
  { id: 1, name: "ประธานกรรมการ" },
  { id: 2, name: "กรรมการ" },
  { id: 3, name: "กรรมการและเลขานุการ" },
  { id: 4, name: "ผู้ควบคุมงาน" },
];
export const files_type = [
  { id: "pricecenter", name: "ราคากลาง" },
  { id: "tor", name: "TOR" },
  { id: "supplies", name: "ประกาศรายชื่อผู้เสนอราคา" },
  { id: "win", name: "ประกาศรายชื่อผู้ชนะ" },
  { id: "contract", name: "สัญญาลงนามแล้ว" },
  { id: "sendto", name: "หนังสือส่งมอบงาน" },
  { id: "receive", name: "เอกสารตรวจรับงาน" },
];
export const company_type = [
  { id: 1, name: "บุคคล" },
  { id: 2, name: "นิติบุคคล" },
];

export const company = [
  ["หจก.โคราชก่อสร้าง", 2, "0303556001234", "นายวิชัย ศรีสวัสดิ์", "044-123456", "123 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.นครราชสีมา"],
  ["บริษัท ราชสีมาวิศวกรรม จำกัด", 2, "0305559004321", "นางสาวพิมพ์ใจ วงศ์ทอง", "044-246810", "88/9 ถ.สุรนารายณ์ ต.จอหอ อ.เมือง จ.นครราชสีมา"],
  ["หจก.ปากช่องการโยธา", 2, "0303560007788", "นายธนากร มั่นคง", "044-311222", "45 ม.3 ต.หนองสาหร่าย อ.ปากช่อง จ.นครราชสีมา"],
  ["บริษัท อีสานคอมพิวเตอร์ จำกัด", 2, "0305561001122", "นายภูมิ ไอที", "044-555666", "200 ถ.ช้างเผือก ต.ในเมือง อ.เมือง จ.นครราชสีมา"],
  ["หจก.พิมายรุ่งเรือง", 2, "0303558003344", "นางสายสุนีย์ รุ่งเรือง", "044-471234", "9 ม.1 ต.ในเมือง อ.พิมาย จ.นครราชสีมา"],
  ["นายสมศักดิ์ ช่างดี", 1, "3300100223344", "นายสมศักดิ์ ช่างดี", "081-7654321", "12 ม.5 ต.โนนสูง อ.โนนสูง จ.นครราชสีมา"],
  ["บริษัท สีคิ้วแอสฟัลท์ จำกัด", 2, "0305562009988", "นายอนันต์ ถนนดี", "044-290111", "77 ม.2 ต.ลาดบัวขาว อ.สีคิ้ว จ.นครราชสีมา"],
  ["ร้านโชคชัยเครื่องเขียน", 1, "3301200556677", "นางมาลี โชคดี", "089-1122334", "5 ถ.ราษฎร์ ต.โชคชัย อ.โชคชัย จ.นครราชสีมา"],
].map(([name, type, code, contact, tel, addr], i) => ({ id: i + 1, org_id: 1, type, name, code, contact, telephone: tel, address: addr, flag: 1 }));

const NAMES = [
  ["โครงการก่อสร้างถนนลาดยางแอสฟัลท์ติก สายบ้านหนองระเวียง - บ้านโคกกรวด", 1, 3, 2, "ถนนสาย นม.ถ.1-0023", "บ้านหนองระเวียง หมู่ 5 ต.หนองระเวียง"],
  ["โครงการซ่อมสร้างผิวจราจรแอสฟัลท์ติกคอนกรีต สายบ้านด่านเกวียน - บ้านโชคชัย", 2, 3, 2, "ถนนสาย นม.ถ.1-0045", "ต.ด่านเกวียน อ.โชคชัย"],
  ["โครงการก่อสร้างถนนคอนกรีตเสริมเหล็ก สายบ้านดอนหวาย - บ้านโนนสูง", 1, 3, 2, "ถนนสาย นม.ถ.1-0102", "บ้านดอนหวาย หมู่ 2 ต.ดอนหวาย"],
  ["โครงการขุดลอกอ่างเก็บน้ำบ้านหนองบัว", 3, 3, 2, "-", "บ้านหนองบัว หมู่ 7 ต.ตะคุ อ.ปักธงชัย"],
  ["โครงการก่อสร้างฝายน้ำล้น ลำห้วยสามบาท", 3, 3, 2, "-", "ต.หมูสี อ.ปากช่อง"],
  ["โครงการปรับปรุงอาคารเรียน โรงเรียนบ้านหัวทะเล", 4, 3, 2, "ถนนมิตรภาพ", "โรงเรียนบ้านหัวทะเล ต.หัวทะเล อ.เมือง"],
  ["โครงการก่อสร้างอาคารศูนย์พัฒนาเด็กเล็ก บ้านมะเริง", 4, 3, 2, "ถนนเลี่ยงเมือง", "ต.มะเริง อ.เมือง"],
  ["โครงการจัดซื้อเครื่องคอมพิวเตอร์สำหรับงานประมวลผล", 5, 3, 1, "-", "สำนักงาน อบจ.นครราชสีมา"],
  ["โครงการจัดซื้อรถบรรทุกน้ำ ขนาด 6,000 ลิตร", 5, 3, 1, "-", "กองช่าง อบจ.นครราชสีมา"],
  ["โครงการบำรุงรักษาถนนลูกรัง สายบ้านกุดน้อย - บ้านลาดบัวขาว", 2, 2, 4, "ถนนสาย นม.ถ.1-0210", "ต.กุดน้อย อ.สีคิ้ว"],
  ["โครงการก่อสร้างระบบประปาหมู่บ้าน บ้านโบสถ์", 3, 3, 2, "-", "บ้านโบสถ์ หมู่ 4 ต.โบสถ์ อ.พิมาย"],
  ["โครงการซ่อมแซมสะพาน คสล. ข้ามลำตะคอง", 2, 3, 2, "ถนนสาย นม.ถ.1-0077", "ต.ลาดบัวขาว อ.สีคิ้ว"],
  ["โครงการจัดซื้อครุภัณฑ์การแพทย์ โรงพยาบาลส่งเสริมสุขภาพตำบล", 5, 3, 1, "-", "รพ.สต. ในเขต อ.ปากช่อง"],
  ["โครงการก่อสร้างลานกีฬาอเนกประสงค์ บ้านโคกสูง", 4, 3, 2, "-", "บ้านโคกสูง ต.โคกสูง อ.เมือง"],
  ["โครงการติดตั้งไฟฟ้าส่องสว่างพลังงานแสงอาทิตย์ สายบ้านจอหอ", 1, 3, 2, "ถนนสาย นม.ถ.1-0150", "ต.จอหอ อ.เมือง"],
  ["โครงการจัดซื้อวัสดุสำนักงาน ประจำปีงบประมาณ", 5, 2, 3, "-", "สำนักปลัด อบจ.นครราชสีมา"],
  ["โครงการก่อสร้างรางระบายน้ำ คสล. ชุมชนหัวทะเล", 1, 3, 2, "ถนนหัวทะเล", "ชุมชนหัวทะเล อ.เมือง"],
  ["โครงการปรับปรุงห้องปฏิบัติการวิทยาศาสตร์ โรงเรียนในสังกัด อบจ.", 4, 3, 2, "-", "โรงเรียนในสังกัด อบจ. อ.บัวใหญ่"],
  ["โครงการเสริมผิวแอสฟัลท์ติก สายบ้านกระโทก - บ้านพลับพลา", 2, 3, 2, "ถนนสาย นม.ถ.1-0181", "ต.กระโทก อ.โชคชัย"],
  ["โครงการก่อสร้างสระเก็บน้ำประจำไร่นา บ้านสัมฤทธิ์", 3, 3, 2, "-", "บ้านสัมฤทธิ์ ต.สัมฤทธิ์ อ.พิมาย"],
];

const BOARD_PEOPLE = ["นายสมพงษ์ วิศวกร", "นางสาวรัชนี ตรวจงาน", "นายบุญมี ช่างโยธา", "นายเกียรติ ควบคุม", "นางอรุณี บัญชีดี", "นายวีระ มั่นใจ"];

export const project = [];
export const project_ampur = [];
export const project_status = [];
export const project_approve_hist = [];
export const project_log = [];
export const project_map = [];
export const project_files = [];
export const project_board = [];
export const project_payment = [];
export const eq_code = [];

let fileId = 1, logId = 1, boardId = 1, payId = 1, mapId = 1, ampId = 1;
const codeSeq = {};
const log = (pid, act, date, user) => project_log.push({ id: logId++, project_id: pid, act, add_date: dt(date, int(8, 16)), add_users: user });
const file = (pid, type, date, user) =>
  project_files.push({ id: fileId++, project_id: pid, file_type: type, name: `${files_type.find((f) => f.id === type).name}-${pid}.pdf`, size: int(80000, 900000), url: null, add_date: dt(date), add_users: user, flag: 1 });

// stage: 1 project only, 2 purchase approved..., 5 paid
const YEARS = [2024, 2025, 2026];
let id = 1;
YEARS.forEach((byear) => {
  const count = byear === 2026 ? 26 : 18;
  for (let i = 0; i < count; i++) {
    const [baseName, worktype, eg, et, road, place] = NAMES[(i + byear) % NAMES.length];
    const bureau = worktype === 5 ? pick([1, 2, 5, 7]) : worktype === 4 ? pick([3, 4]) : 3;
    const fyStart = new Date(`${byear - 1}-10-01`);
    const pdate = addDays(fyStart, int(0, byear === 2026 ? 200 : 300));
    const budget = worktype === 5 ? int(15, 250) * 10000 : int(50, 1200) * 10000;
    const key = `${byear}-${eg}`;
    codeSeq[key] = (codeSeq[key] || 0) + 1;
    const code = `${byear + 543}-${String(eg).padStart(2, "0")}-${String(codeSeq[key]).padStart(5, "0")}`;
    const owner = bureau === 4 ? 11 : 3;

    // older years mostly finished, current year spread over all steps
    const r = rnd();
    let stage;
    if (byear === 2024) stage = r < 0.75 ? 5 : r < 0.9 ? 4 : 3;
    else if (byear === 2025) stage = r < 0.4 ? 5 : r < 0.6 ? 4 : r < 0.75 ? 3 : r < 0.9 ? 2 : 1;
    else stage = r < 0.12 ? 5 : r < 0.27 ? 4 : r < 0.47 ? 3 : r < 0.67 ? 2 : r < 0.85 ? 1 : 0;
    // stage 0 = waiting purchase approval decision ('' ), stage -1 = not approved
    const notApproved = byear === 2026 && i % 13 === 7;

    const p = {
      id,
      project_code: code,
      project_byear: byear,
      project_date: pdate,
      project_startdate: addDays(pdate, 15),
      project_enddate: addDays(pdate, int(120, 300)),
      project_name: `${baseName}${i >= NAMES.length ? " (ระยะที่ 2)" : ""}`,
      bureau_id: bureau,
      worktype_id: worktype,
      expenses_group: eg,
      expenses_type: et,
      budget_type: pick([1, 1, 1, 2, 3, 5]),
      budget_approve: budget,
      road,
      project_place: place,
      changwat: "30",
      org_id: 1,
      project_status: 3,
      project_approve: 2,
      project_purchase: notApproved ? "0" : stage >= 1 ? "1" : "",
      project_purchase_unapprove: notApproved ? "งบประมาณไม่เพียงพอ ให้ทบทวนรายละเอียดโครงการ" : "",
      project_refid: 0,
      purchase_pricecenter: stage >= 1 ? budget : 0,
      purchase_detail: "",
      purchase_approve: "0",
      purchase_approvedate: null,
      purchase_approveusers: null,
      purchase_type: null,
      egp_code: "",
      contract_number: "",
      purchase_winname: null,
      purchase_winprice: 0,
      contract_startdate: null,
      contract_enddate: null,
      contract_numdate: null,
      contract_receivedate: null,
      contract_boarddate: null,
      contract_realdate: null,
      warranty: null,
      warranty_expire: null,
      supplies_approve: "0",
      supplies_approvedate: null,
      supplies_approveusers: null,
      fine_rate: 0,
      fine_day: 0,
      fine_pay: 0,
      fine_status: "0",
      fine_desc: "",
      contract_approve: "0",
      contract_approvedate: null,
      contract_approveusers: null,
      comment_parcel: "",
      comment_parcel_date: null,
      comment_head: "",
      comment_head_date: null,
      comment_inspector: "",
      comment_inspector_date: null,
      project_receivedate: null,
      project_receivename: "",
      qrcode_gen: "1",
      qrcode_date: dt(pdate),
      qrcode_users: 1,
      flag: 1,
      add_date: dt(pdate),
      add_users: owner,
    };

    // amphoe
    const amps = new Set([pick(["3001", "3007", "3010", "3014", "3015", "3020", "3021"])]);
    if (rnd() < 0.25) amps.add(pick(["3001", "3002", "3012", "3018"]));
    amps.forEach((a) => project_ampur.push({ id: ampId++, project_id: id, ampur: a, changwat: "30", flag: 1 }));

    project_status.push({ id: project_status.length + 1, project_id: id, status_numb: 1, status_id: 3, status_date: pdate, status_remark: "รับโครงการ", flag: 1 });
    project_approve_hist.push({ id: project_approve_hist.length + 1, project_id: id, approve_numb: 1, approve_id: 2, approve_date: pdate, approve_remark: "", flag: 1 });
    log(id, "เพิ่มโครงการ", pdate, owner);

    if (rnd() < 0.7) {
      const lat = 14.97 + (rnd() - 0.5) * 0.8;
      const lng = 102.1 + (rnd() - 0.5) * 1.0;
      project_map.push({ id: mapId++, project_id: id, latitude: +lat.toFixed(6), longitude: +lng.toFixed(6), remark: "จุดเริ่มต้นโครงการ", flag: 1, add_date: dt(pdate), add_users: owner });
      log(id, "เพิ่มพิกัดโครงการ", pdate, owner);
    }

    let d = pdate;
    if (stage >= 1) {
      d = addDays(d, int(5, 20));
      p.purchase_detail = "<p>ใช้ราคากลางตามหลักเกณฑ์กรมบัญชีกลาง</p>";
      file(id, "pricecenter", d, 4);
      file(id, "tor", d, 4);
      log(id, "บันทึกข้อมูลจัดซื้อจัดจ้าง", d, 4);
    }
    if (stage >= 2) {
      d = addDays(d, int(3, 15));
      Object.assign(p, { purchase_approve: "1", purchase_approvedate: d, purchase_approveusers: 4 });
      log(id, "บันทึกอนุมัติจัดหาพัสดุ", d, 4);
    }
    if (stage >= 3) {
      d = addDays(d, int(10, 30));
      const comp = worktype === 5 ? pick([4, 8]) : pick([1, 2, 3, 5, 6, 7]);
      const days = worktype === 5 ? int(30, 60) : int(90, 180);
      const start = d;
      const end = addDays(start, days - 1);
      Object.assign(p, {
        purchase_type: budget > 500000 ? 2 : pick([1, 4]),
        egp_code: `6${String(byear).slice(2)}${String(int(1000000, 9999999))}`,
        contract_number: `${String(int(1, 199))}/${byear + 543}`,
        purchase_winname: comp,
        purchase_winprice: Math.round(budget * (0.9 + rnd() * 0.09)),
        contract_startdate: start,
        contract_enddate: end,
        contract_numdate: days,
        contract_receivedate: end,
        warranty: worktype === 5 ? 1 : 2,
        supplies_approve: "2",
      });
      ["supplies", "win", "contract"].forEach((t) => file(id, t, d, 5));
      const n = int(3, 4);
      for (let b = 0; b < n; b++)
        project_board.push({ id: boardId++, project_id: id, name: BOARD_PEOPLE[(id + b) % BOARD_PEOPLE.length], cid: `3300${String(int(100000000, 999999999))}`, type: b === 0 ? 1 : b === n - 1 ? 3 : 2, flag: 1, add_date: dt(d), add_users: 5 });
      log(id, "บันทึกข้อมูลจัดหาพัสดุ", d, 5);
      log(id, "บันทึกข้อมูลผู้ชนะ", d, 5);
      log(id, "บันทึกกรรมการ", d, 5);
    }
    if (stage >= 4) {
      d = addDays(d, int(1, 5));
      const approveDate = d;
      Object.assign(p, { supplies_approve: "1", supplies_approvedate: approveDate, supplies_approveusers: 5 });
      p.warranty_expire = addDays(approveDate, 365 * p.warranty);
      log(id, "บันทึกอนุมัติตรวจรับงาน", d, 5);
      // delivery: some late
      const late = rnd() < 0.3 ? int(1, 15) : 0;
      const real = addDays(p.contract_enddate, late - int(0, 3) * (late ? 0 : 1));
      if (stage >= 5 || rnd() < 0.6) {
        Object.assign(p, { contract_realdate: real, contract_boarddate: addDays(real, int(2, 7)) });
        if (late) {
          const rate = 0.1;
          let perDay = (p.purchase_winprice * rate) / 100;
          if (perDay > 0 && perDay < 100) perDay = 100;
          Object.assign(p, { fine_rate: rate, fine_day: late, fine_pay: +(perDay * late).toFixed(2), fine_status: "1", fine_desc: `ส่งมอบล่าช้า ${late} วัน` });
        }
        file(id, "sendto", real, 6);
        file(id, "receive", p.contract_boarddate, 6);
        log(id, "บันทึกข้อมูลสัญญา/ตรวจรับ", p.contract_boarddate, 6);
      }
      if (rnd() < 0.5) Object.assign(p, { comment_parcel: "ตรวจสอบเอกสารครบถ้วน", comment_parcel_date: dt(d, 10) });
      if (rnd() < 0.5) Object.assign(p, { comment_head: "งานแล้วเสร็จตามแบบ", comment_head_date: dt(d, 11) });
    }
    if (stage >= 5) {
      d = addDays(p.contract_boarddate || d, int(3, 10));
      Object.assign(p, { contract_approve: "1", contract_approvedate: d, contract_approveusers: 6, comment_inspector: "ตรวจรับเรียบร้อย", comment_inspector_date: dt(d, 14) });
      log(id, "บันทึกอนุมัติชำระเงิน", d, 6);
      const total = p.fine_status === "1" ? p.purchase_winprice - p.fine_pay : p.purchase_winprice;
      // some fully paid, some partially, some not yet
      const pr = rnd();
      if (pr < 0.65) {
        if (total > 1000000 && rnd() < 0.5) {
          const half = Math.round(total / 2);
          project_payment.push({ id: payId++, project_id: id, payment_date: addDays(d, 5), payment_method: 1, payment_amount: half, payment_remark: "งวดที่ 1", flag: 1, add_users: 7 });
          project_payment.push({ id: payId++, project_id: id, payment_date: addDays(d, 25), payment_method: 1, payment_amount: +(total - half).toFixed(2), payment_remark: "งวดที่ 2", flag: 1, add_users: 7 });
        } else project_payment.push({ id: payId++, project_id: id, payment_date: addDays(d, 7), payment_method: 2, payment_amount: +total.toFixed(2), payment_remark: "", flag: 1, add_users: 7 });
        log(id, "บันทึกข้อมูลจ่ายเงิน", addDays(d, 7), 7);
        if (worktype === 5) eq_code.push({ id: eq_code.length + 1, project_id: id, eq_code: `7440-001-${String(id).padStart(4, "0")}/${String(byear + 543).slice(2)}`, flag: 1 });
      } else if (pr < 0.8) {
        project_payment.push({ id: payId++, project_id: id, payment_date: addDays(d, 5), payment_method: 1, payment_amount: Math.round(total * 0.4), payment_remark: "งวดที่ 1", flag: 1, add_users: 7 });
        log(id, "บันทึกข้อมูลจ่ายเงิน", addDays(d, 5), 7);
      }
    }
    project.push(p);
    id++;
  }
});

// annual operating plan (project_plan_main)
export const project_plan_main = [];
let planId = 1;
[2025, 2026, 2027].forEach((byear) => {
  for (let i = 0; i < 12; i++) {
    const [name, worktype, eg, et, , place] = NAMES[(i * 3 + byear) % NAMES.length];
    const sm = pick([10, 11, 12, 1, 2, 3, 4]);
    const len = int(1, 6);
    const em = ((sm - 1 + len) % 12) + 1;
    project_plan_main.push({
      id: planId++,
      project_byear: byear,
      project_name: name,
      work_typeid: worktype,
      expenses_group: eg,
      expenses_type: et,
      bureau_id: worktype === 4 ? 4 : 3,
      budget: int(50, 900) * 10000,
      project_startmonth: String(sm).padStart(2, "0"),
      project_startweek: int(1, 4),
      project_endmonth: String(em).padStart(2, "0"),
      project_endweek: int(1, 4),
      project_priority: int(1, 3),
      plan_typeid: worktype === 4 ? 2 : 1,
      mission: int(1, 4),
      project_type: int(1, 2),
      stag_id: worktype === 4 ? 2 : 1,
      strategy: "-",
      project_condition: 1,
      project_activity: "สำรวจ ออกแบบ จัดซื้อจัดจ้าง และดำเนินการก่อสร้าง",
      project_place: place,
      remark: "",
      org_id: 1,
      flag: 1,
      add_users: 3,
    });
  }
});
// link some 2026 projects to plans
project.filter((p) => p.project_byear === 2026).slice(0, 8).forEach((p, i) => (p.project_refid = 13 + i));

// legacy 5-year plan (project_plan)
export const project_plan = NAMES.slice(0, 15).map(([name, worktype, eg, et], i) => {
  const base = int(30, 500) * 10000;
  return { id: i + 1, pid: `P${String(i + 1).padStart(4, "0")}`, project_name: name, worktype_id: worktype, expenses_group: eg, expenses_type: et, y61: base, y62: i % 3 ? base : 0, y63: i % 2 ? base * 1.1 : 0, y64: base * 0.8, y65: i % 4 ? base : 0, flag: 1 };
});
