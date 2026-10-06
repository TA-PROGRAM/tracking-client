// Public front site (root index.php + src/*.php)
import React, { useMemo, useState } from "react";
import { Link, Route, Switch, useHistory, useLocation, useParams } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataList, Card, useFilters } from "../../components/kit";
import { FilterBar, SimpleTable } from "../shared";
import { ProjectQr } from "../shared/qr";
import db from "../../mock/db";
import { activeByear, ampurNames, lookupOptions, paidOf } from "../../mock/tracking";
import { money, num, thDateShort, beYear } from "../../utils/format";

const BYEAR_KEY = "public-byear";
const usePublicYear = () => {
  const [y, setY] = useState(() => Number(sessionStorage.getItem(BYEAR_KEY)) || activeByear());
  return [y, (v) => { sessionStorage.setItem(BYEAR_KEY, v); setY(v); }];
};
const nm = (t, id) => db.getSync(t, id)?.name || "-";
const projects = () => db.findSync("project", { flag: 1 });

const visit = (page) => db.insert("visitors_table", { visitor_page: page, visitor_system: "project", visitor_session: sessionStorage.getItem("vs") || (sessionStorage.setItem("vs", Math.random().toString(36).slice(2)), sessionStorage.getItem("vs")) });

const Shell = ({ children, byear, setByear }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const years = db.findSync("project_byear").slice().sort((a, b) => b.byear - a.byear).map((y) => ({ label: `ปีงบประมาณ ${y.byear + 543}`, value: y.byear }));
  const menu = [
    { to: "/public", icon: "pi pi-home", label: "เมนูหลัก" },
    { to: "/public/project-bureau", icon: "pi pi-chart-pie", label: "แยกตามหน่วยงาน" },
    { to: "/public/project-worktype", icon: "pi pi-chart-pie", label: "แยกตามงาน" },
    { to: "/public/project-expenses-group", icon: "pi pi-chart-pie", label: "แยกตามหมวดรายจ่าย" },
    { to: "/public/project-expenses-type", icon: "pi pi-chart-pie", label: "แยกตามประเภทรายจ่าย" },
    { to: "/public/project-plan", icon: "pi pi-tags", label: "แผนโครงการ 5 ปี" },
  ];
  return (
    <div className="min-h-screen bg-pink-50/40">
      <header className="no-print sticky top-0 z-50 flex h-14 items-center justify-between bg-gradient-to-r from-pink-600 to-rose-600 px-4 text-white shadow">
        <div className="flex items-center gap-3">
          <button type="button" className="lg:hidden" onClick={() => setOpen(!open)}>
            <i className="pi pi-bars" />
          </button>
          <Link to="/public" className="flex items-center gap-2 font-bold">
            <img src="/img/logo-korat-secare.png" alt="" className="h-8 w-8 rounded-full bg-white p-0.5" />
            อบจ.นครราชสีมา
          </Link>
        </div>
        <div className="text-sm">
          <i className="pi pi-tags mr-1" />
          ระบบบริหารงานโครงการ
        </div>
      </header>
      <div className="flex">
        <aside className={`no-print fixed inset-y-0 top-14 z-40 w-64 border-r bg-white p-3 transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="space-y-1 text-sm">
            {menu.map((m) => (
              <Link key={m.to} to={m.to} onClick={() => setOpen(false)} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${location.pathname === m.to ? "bg-pink-50 font-semibold text-pink-700" : "text-slate-700 hover:bg-slate-50"}`}>
                <i className={m.icon} />
                {m.label}
              </Link>
            ))}
            <div className="px-3 pt-3 text-xs text-slate-400">
              <i className="pi pi-sync mr-1" />
              เปลี่ยนปีงบประมาณ
            </div>
            <div className="px-2">
              <Dropdown value={byear} options={years} onChange={(e) => setByear(e.value)} className="w-full" />
            </div>
            <a href="https://kpaoplan.koratpao.go.th/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">
              <i className="pi pi-tags" />
              แผนพัฒนาท้องถิ่น 5 ปี
            </a>
            <Link to="/complaint-form" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">
              <i className="pi pi-megaphone" />
              แจ้งข้อร้องเรียน
            </Link>
            <a href="#/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">
              <i className="pi pi-sign-in" />
              เข้าสู่ระบบ
            </a>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          {children}
          <footer className="no-print mt-8 text-center text-xs text-slate-400">©2021 อบจ.นครราชสีมา</footer>
        </main>
      </div>
    </div>
  );
};

const Heading = ({ children }) => <h1 className="mb-4 text-xl font-bold text-pink-700">{children}</h1>;

const Home = ({ byear }) => {
  const history = useHistory();
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);
  const [f, setF] = useFilters("public-home", {});
  const filters = { ...f, ...(qs.get("worktype") ? { worktype: Number(qs.get("worktype")) } : {}), ...(qs.get("bureau") ? { bureau: Number(qs.get("bureau")) } : {}), ...(qs.get("expenses_group") ? { expenses_group: Number(qs.get("expenses_group")) } : {}), ...(qs.get("expenses_type") ? { expenses_type: Number(qs.get("expenses_type")) } : {}) };
  const rows = useMemo(
    () =>
      projects().filter(
        (p) =>
          p.project_byear === byear &&
          (!filters.bureau || String(p.bureau_id) === String(filters.bureau)) &&
          (!filters.worktype || String(p.worktype_id) === String(filters.worktype)) &&
          (!filters.expenses_group || String(p.expenses_group) === String(filters.expenses_group)) &&
          (!filters.expenses_type || String(p.expenses_type) === String(filters.expenses_type)) &&
          (!filters.road || (p.road || "").includes(filters.road)) &&
          (!filters.place || (p.project_place || "").includes(filters.place)) &&
          (!filters.search || p.project_name.includes(filters.search)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byear, JSON.stringify(filters)],
  );
  const budget = rows.reduce((s, p) => s + num(p.budget_approve), 0);
  return (
    <>
      <Heading>ระบบบริหารงานโครงการ อบจ.นครราชสีมา | Korat PAO Project Tracking ปีงบ {byear + 543}</Heading>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card bodyClass="p-5">
          <div className="text-sm text-slate-500"><i className="pi pi-list mr-1 text-emerald-600" />จำนวนโครงการ</div>
          <div className="mt-1 text-3xl font-bold">{rows.length.toLocaleString()} <span className="text-base font-normal text-slate-500">โครงการ</span></div>
        </Card>
        <Card bodyClass="p-5">
          <div className="text-sm text-slate-500"><i className="pi pi-money-bill mr-1 text-emerald-600" />งบประมาณอนุมัติ</div>
          <div className="mt-1 text-3xl font-bold">{money(budget)} <span className="text-base font-normal text-slate-500">บาท</span></div>
        </Card>
      </div>
      <FilterBar fields={[{ name: "bureau", label: "หน่วยงาน", type: "select", options: lookupOptions("bureau") }, "worktype", "expenses_group", "expenses_type", "road", "place", "search"]} value={filters} onChange={(v) => { if (loc.search) history.replace("/public"); setF(v); }} />
      <div className="mt-4">
        <DataList
          value={rows}
          onRowClick={(p) => history.push(`/public/project-detail/${p.id}`)}
          columns={[
            { header: "ลำดับ", type: "index" },
            { field: "project_name", header: "ชื่อโครงการ", body: (p) => <span className="text-blue-700">{p.project_name}</span>, style: { minWidth: "20rem" } },
            { field: "project_date", header: "วันที่โครงการ", body: (p) => thDateShort(p.project_date) },
            { header: "หน่วยงาน", body: (p) => nm("bureau", p.bureau_id) },
            { header: "งาน", body: (p) => nm("work_type", p.worktype_id) },
            { field: "budget_approve", header: "งบประมาณ", type: "money" },
            { header: "ดู", body: () => <i className="pi pi-clipboard text-cyan-600" /> },
          ]}
        />
      </div>
    </>
  );
};

const KV = ({ rows }) => (
  <table className="w-full text-sm">
    <tbody>
      {rows.map((r, i) => (
        <tr key={i} className="border-b border-slate-100">
          {r.map((c, j) =>
            j % 2 === 0 ? (
              <th key={j} className="w-40 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">{c}</th>
            ) : (
              <td key={j} className="px-3 py-2" colSpan={r.length === 2 ? 3 : 1}>{c ?? "-"}</td>
            ),
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

const basicRows = (p, money0) => [
  ["วันที่รับโครงการ", thDateShort(p.project_date), "ปีงบประมาณ", beYear(p.project_byear)],
  ["หน่วยงาน", nm("bureau", p.bureau_id), "งาน", nm("work_type", p.worktype_id)],
  ["หมวดรายจ่าย", nm("expenses_group", p.expenses_group), "ประเภทรายจ่าย", nm("expenses_type", p.expenses_type)],
  ["ถนน", p.road],
  ["สถานที่", p.project_place],
  ["อำเภอ", ampurNames(p.id)],
  [money0 ? "งบประมาณ(บาท)" : "งบประมาณ", `${money(p.budget_approve)}${money0 ? " บาท" : ""}`],
];

const Detail = () => {
  const { id } = useParams();
  const p = db.getSync("project", id);
  if (!p) return <div>ไม่พบข้อมูลโครงการ</div>;
  const st = db.findSync("project_status", { project_id: p.id, flag: 1 }).sort((a, b) => a.status_numb - b.status_numb);
  const files = db.findSync("project_files", { project_id: p.id, flag: 1 }).filter((f) => ["tor", "supplies", "win", "pricecenter", "contract"].includes(f.file_type));
  const pays = db.findSync("project_payment", { project_id: p.id, flag: 1 });
  const paid = paidOf(p.id);
  const timeline = [
    { label: "อนุมัติโครงการ", date: p.add_date, done: String(p.project_purchase) === "1" },
    { label: "อนุมัติจัดซื้อ", date: p.purchase_approvedate, done: String(p.purchase_approve) === "1" },
    { label: "จัดซื้อจัดจ้าง", date: p.supplies_approvedate, done: String(p.supplies_approve) === "1" },
    { label: "ดำเนินการตรวจรับ", date: p.contract_approvedate, done: String(p.contract_approve) === "1" },
    { label: "การเงิน", date: pays[pays.length - 1]?.payment_date, done: num(p.purchase_winprice) !== 0 && paid >= num(p.purchase_winprice) - num(String(p.fine_status) === "1" ? p.fine_pay : 0) },
  ];
  return (
    <>
      <Heading>ระบบบริหารงานโครงการ อบจ.นครราชสีมา (Korat-POA Project Tracking)</Heading>
      <div className="space-y-4">
        <Card title={p.project_name} icon="pi pi-list">
          <KV rows={basicRows(p)} />
        </Card>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card title="สถานะโครงการ" icon="pi pi-list">
            <SimpleTable head={["ลำดับ", "วันที่", "ดำเนินการ", "เพิ่มเติม"]} rows={st.map((r) => [r.status_numb, thDateShort(r.status_date), nm("project_status_type", r.status_id), r.status_remark || "-"])} />
          </Card>
          <Card title="ไฟล์แนบโครงการ" icon="pi pi-copy">
            <SimpleTable
              head={["ลำดับ", "วันที่อัพโหลด", "ประเภทไฟล์", "ชื่อไฟล์", "ดาวน์โหลด"]}
              rows={files.map((f, i) => [i + 1, thDateShort(f.add_date), nm("files_type", f.file_type), f.name, f.url ? <a key="d" href={f.url} download={f.name} className="text-emerald-600"><i className="pi pi-download" /></a> : <i key="d" className="pi pi-download text-slate-300" />])}
            />
          </Card>
        </div>
        <Card title="ติดตามโครงการ" icon="pi pi-map-marker">
          <ol className="relative mx-auto max-w-2xl border-l-2 border-pink-100 pl-6">
            {timeline.map((t, i) => (
              <li key={i} className="mb-6 last:mb-0">
                <span className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${t.done ? "bg-emerald-500" : "bg-slate-300"}`}>{i + 1}</span>
                <div className={t.done ? "font-semibold text-slate-800" : "text-slate-400"}>{t.label}</div>
                <div className="text-xs text-slate-400">{t.done ? thDateShort(t.date) : "รอดำเนินการ"}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
};

const Cer = () => {
  const { id } = useParams();
  const p = db.getSync("project", id);
  if (!p) return <div>ไม่พบข้อมูลโครงการ</div>;
  return (
    <>
      <Heading>สรุปข้อมูลโครงการ</Heading>
      <Card>
        <div id="printableArea">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="text-lg font-semibold">
              <i className="pi pi-check mr-2 text-emerald-600" />
              {p.project_name}
            </div>
            {String(p.qrcode_gen) === "1" && <ProjectQr id={p.id} size={120} />}
          </div>
          <KV
            rows={[
              ...basicRows(p, true),
              ["ประเภทการจัดหา", nm("purchase_type", p.purchase_type), "เลขที่สัญญา", p.contract_number || "-"],
              ["วันที่เริ่มสัญญา", thDateShort(p.contract_startdate), "วันที่จบสัญญา", thDateShort(p.contract_enddate)],
              ["ระยะเวลา(วัน)", p.contract_numdate ?? "-"],
              ["ระยะเวลารับประกัน(ปี)", p.warranty ? `${p.warranty} ปี` : "-", "วันที่หมดประกัน", thDateShort(p.warranty_expire)],
              ["วันส่งมอบงาน", thDateShort(p.contract_receivedate), "วันกรรมการตรวจรับ", thDateShort(p.contract_boarddate)],
              ["ผู้ชนะ", nm("company", p.purchase_winname)],
              ["ราคาชนะราคา(บาท)", `${money(p.purchase_winprice, 0)} บาท`],
            ]}
          />
        </div>
        <div className="no-print mt-4 flex justify-center gap-2">
          <Button icon="pi pi-print" label="Print" onClick={() => window.print()} />
          <Link to="/complaint-form">
            <Button icon="pi pi-megaphone" label="แจ้งเรื่องร้องเรียน" severity="danger" />
          </Link>
        </div>
      </Card>
    </>
  );
};

const QrPrint = () => {
  const { id } = useParams();
  const p = db.getSync("project", id);
  if (!p) return null;
  return (
    <>
      <Heading>QRCODE : ข้อมูลโครงการ</Heading>
      <Card>
        <div className="mx-auto flex max-w-[21cm] flex-col items-center gap-4 py-6">
          <ProjectQr id={p.id} size={520} />
          <div className="text-center text-xl font-semibold">{p.project_name}</div>
        </div>
        <div className="no-print text-center">
          <Button icon="pi pi-print" label="Print" onClick={() => window.print()} />
        </div>
      </Card>
    </>
  );
};

const FivePlan = ({ byear }) => {
  const [f, setF] = useFilters("public-plan5", {});
  const rows = db.findSync("project_plan", { flag: 1 }).filter((p) => (!f.worktype || String(p.worktype_id) === String(f.worktype)) && (!f.expenses_group || String(p.expenses_group) === String(f.expenses_group)) && (!f.expenses_type || String(p.expenses_type) === String(f.expenses_type)) && (!f.search || p.project_name.includes(f.search)));
  const ys = ["y61", "y62", "y63", "y64", "y65"];
  return (
    <>
      <Heading>ระบบบริหารงานโครงการ อบจ.นครราชสีมา | Korat PAO Project Tracking ปีงบ {byear + 543}</Heading>
      <Card bodyClass="p-5" className="mb-4 max-w-md">
        <div className="text-sm text-slate-500"><i className="pi pi-tags mr-1 text-emerald-600" />แผนโครงการ 5 ปี ปีงบประมาณ 2561 - 2565</div>
        <div className="mt-1 text-3xl font-bold">{rows.length.toLocaleString()} <span className="text-base font-normal text-slate-500">โครงการ</span></div>
      </Card>
      <FilterBar fields={["worktype", "expenses_group", "expenses_type", "search"]} value={f} onChange={setF} />
      <div className="mt-4">
        <DataList
          value={rows}
          columns={[
            { header: "ลำดับ", type: "index" },
            { field: "pid", header: "รหัสโครงการ" },
            { field: "project_name", header: "ชื่อโครงการ", style: { minWidth: "18rem" } },
            { header: "งาน", body: (p) => nm("work_type", p.worktype_id) },
            { header: "หมวดรายจ่าย", body: (p) => nm("expenses_group", p.expenses_group) },
            { header: "ประเภทรายจ่าย", body: (p) => nm("expenses_type", p.expenses_type) },
            ...ys.map((y) => ({ field: y, header: `ปี 25${y.slice(1)}`, body: (p) => <div className="text-right">{money(p[y])}</div> })),
          ]}
        />
      </div>
    </>
  );
};

const SUMMARY = {
  "project-bureau": { x: "หน่วยงาน", table: "bureau", key: "bureau_id", q: "bureau" },
  "project-worktype": { x: "งาน", table: "work_type", key: "worktype_id", q: "worktype" },
  "project-expenses-group": { x: "หมวดรายจ่าย", table: "expenses_group", key: "expenses_group", q: "expenses_group" },
  "project-expenses-type": { x: "ประเภทรายจ่าย", table: "expenses_type", key: "expenses_type", q: "expenses_type" },
};
const Summary = ({ kind, byear }) => {
  const c = SUMMARY[kind];
  const ps = projects().filter((p) => p.project_byear === byear);
  const rows = db
    .findSync(c.table, { flag: 1 })
    .map((g) => {
      const list = ps.filter((p) => p[c.key] === g.id);
      return { g, count: list.length, budget: list.reduce((s, p) => s + num(p.budget_approve), 0) };
    })
    .filter((r) => r.count > 0);
  const tc = rows.reduce((s, r) => s + r.count, 0);
  const tb = rows.reduce((s, r) => s + r.budget, 0);
  const max = Math.max(1, ...rows.map((r) => r.budget));
  return (
    <>
      <Heading>สรุปจำนวนโครงการ (แยกตาม{c.x}) ปีงบ {byear + 543}</Heading>
      <Card>
        <SimpleTable
          head={["ลำดับ", c.x, { label: "จำนวนโครงการ", className: "text-center" }, { label: "งบประมาณอนุมัติ", className: "text-right" }, "สัดส่วนงบ", { label: "ดู", className: "text-center" }]}
          rows={[
            ...rows.map((r, i) => [
              i + 1,
              r.g.name,
              r.count,
              money(r.budget),
              <div key="b" className="h-2 w-40 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-pink-500" style={{ width: `${(r.budget / max) * 100}%` }} /></div>,
              <Link key="v" to={`/public?${c.q}=${r.g.id}`} className="text-cyan-600"><i className="pi pi-clipboard" /></Link>,
            ]),
            ["", <b key="t">รวมทั้งหมด</b>, <b key="c">{tc}</b>, <b key="m">{money(tb)}</b>, "", <Link key="v" to="/public" className="text-cyan-600"><i className="pi pi-clipboard" /></Link>],
          ]}
        />
      </Card>
    </>
  );
};

const PublicSite = () => {
  const [byear, setByear] = usePublicYear();
  const location = useLocation();
  React.useEffect(() => {
    visit(location.pathname);
  }, [location.pathname]);
  return (
    <Shell byear={byear} setByear={setByear}>
      <Switch>
        <Route path="/public/project-detail/:id" component={Detail} />
        <Route path="/public/project-cer/:id" component={Cer} />
        <Route path="/public/project-qrcode/:id" component={QrPrint} />
        <Route path="/public/project-plan" render={() => <FivePlan byear={byear} />} />
        {Object.keys(SUMMARY).map((k) => (
          <Route key={k} path={`/public/${k}`} render={() => <Summary kind={k} byear={byear} />} />
        ))}
        <Route exact path="/public" render={() => <Home byear={byear} />} />
        <Route render={() => <Card title="ไม่พบหน้าที่ต้องการ 404" />} />
      </Switch>
    </Shell>
  );
};

export default PublicSite;
