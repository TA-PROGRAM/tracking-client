// DASHBOARD สรุปข้อมูลโครงการ 3 ปีงบประมาณ (admin/views/main.php)
import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Page, Card, Btn, StatCard, useTable } from "../../components/kit";
import { FilterBar, SimpleTable } from "../shared";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { isAdminRole, bureauOptions } from "../../mock/tracking";
import { money, num } from "../../utils/format";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];
const pct = (a, b) => (a && b ? Math.round((a / b) * 100) : 0);

const metrics = (rows) => {
  const A = rows;
  const B = A.filter((p) => String(p.project_purchase) === "1");
  const C = B.filter((p) => String(p.purchase_approve) === "1");
  const D = C.filter((p) => String(p.supplies_approve) === "1");
  const E = D.filter((p) => String(p.contract_approve) === "1");
  return {
    A_all: A.length,
    A_approved: A.filter((p) => String(p.project_approve) === "2").length,
    A_purch: B.length,
    A_budget: A.reduce((s, p) => s + num(p.budget_approve), 0),
    B_all: B.length,
    B_ok: C.length,
    C_all: C.length,
    C_done: D.length,
    C_wait: C.filter((p) => String(p.supplies_approve || "0") === "0").length,
    C_commit: C.filter((p) => String(p.supplies_approve) === "2").length,
    D_all: D.length,
    D_ok: E.length,
    E_all: E.length,
    E_ok: E.length,
  };
};

const Bar = ({ value, color }) => (
  <div className="mt-1 flex items-center gap-2">
    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
    <span className="w-12 text-right text-sm font-bold" style={{ color }}>
      {value} %
    </span>
  </div>
);

const YearCard = ({ title, items, icon }) => (
  <Card title={title} icon={icon || "pi pi-chart-bar"} bodyClass="p-4">
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i}>
          <div className="text-sm font-semibold text-slate-800">
            <i className="pi pi-arrow-up mr-1 text-xs" style={{ color: it.color }} />
            {it.head}
          </div>
          {it.lines.map((l, j) => (
            <div key={j}>
              {l.text && (
                <button type="button" disabled={!l.onClick} onClick={l.onClick} className={`text-xs ${l.onClick ? "text-slate-500 hover:text-pink-600 hover:underline" : "text-slate-400"}`}>
                  {l.text}
                </button>
              )}
              {l.pct !== undefined && <Bar value={l.pct} color={it.color} />}
            </div>
          ))}
        </div>
      ))}
    </div>
  </Card>
);

const Dashboard = () => {
  const history = useHistory();
  const { user, byear } = useAuth();
  const { data } = useTable("project", { flag: 1 });
  const [f, setF] = useState({});
  const [wtBureau, setWtBureau] = useState({});
  const admin = isAdminRole(user);
  const scoped = useMemo(() => data.filter((p) => admin || String(p.bureau_id) === String(user.bureau_id)), [data, admin, user]);

  const years = [byear, byear - 1, byear - 2];
  const filtered = scoped.filter(
    (p) =>
      (!f.bureau || String(p.bureau_id) === String(f.bureau)) &&
      (!f.worktype || String(p.worktype_id) === String(f.worktype)) &&
      (!f.expenses_group || String(p.expenses_group) === String(f.expenses_group)) &&
      (!f.expenses_type || String(p.expenses_type) === String(f.expenses_type)) &&
      (!f.budget_type || String(p.budget_type) === String(f.budget_type)),
  );
  const perYear = years.map((y) => ({ y, m: metrics(filtered.filter((p) => Number(p.project_byear) === y)) }));
  const go = (module, y, extra = {}) => () => {
    sessionStorage.setItem(`filters:${module}`, JSON.stringify({ ...f, byear: y, ...extra }));
    history.push(`/${module}`);
  };
  const head = (y, n) => `ปีงบ ${y + 543} จำนวน ${n.toLocaleString()} โครงการ`;

  const cur = metrics(scoped.filter((p) => Number(p.project_byear) === byear));

  // per worktype table (current year)
  const payments = db.findSync("project_payment", { flag: 1 });
  const paidBy = (pid) => payments.filter((x) => x.project_id === pid).reduce((s, x) => s + num(x.payment_amount), 0);
  const wtRows = db.findSync("work_type", { flag: 1 }).map((w) => {
    const ps = scoped.filter((p) => Number(p.project_byear) === byear && p.worktype_id === w.id && (!wtBureau.bureau || String(p.bureau_id) === String(wtBureau.bureau)));
    const approve = ps.reduce((s, p) => s + num(p.budget_approve), 0);
    const used = ps.reduce((s, p) => s + paidBy(p.id), 0);
    return { w, count: ps.length, approve, used, balance: approve - used };
  });
  const tot = wtRows.reduce((s, r) => ({ count: s.count + r.count, approve: s.approve + r.approve, used: s.used + r.used, balance: s.balance + r.balance }), { count: 0, approve: 0, used: 0, balance: 0 });
  const bureauLabel = wtBureau.bureau ? db.getSync("bureau", wtBureau.bureau)?.name : "ทุกหน่วยงาน";

  return (
    <Page title="DASHBOARD สรุปข้อมูลโครงการ 3 ปีงบประมาณ" subtitle={`ปีงบประมาณ ${byear - 2 + 543} - ${byear + 543} · เปลี่ยนปีงบได้ที่มุมขวาบน`}>
      <FilterBar fields={["bureau", "worktype", "expenses_group", "expenses_type", "budget_type"]} value={f} onChange={setF} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <YearCard
          title="(1) โครงการทั้งหมด"
          icon="pi pi-list"
          items={perYear.map(({ y, m }, i) => ({ color: COLORS[i], head: head(y, m.A_approved), lines: [{ text: `W-รออนุมัติจัดซื้อจัดจ้าง ${m.A_approved - m.A_purch} โครงการ`, onClick: go("project", y, { purchaseapprove: "pending" }), pct: pct(m.A_purch, m.A_approved) }] }))}
        />
        <YearCard
          title="(2) อนุมัติจัดซื้อจัดจ้าง"
          icon="pi pi-shopping-cart"
          items={perYear.map(({ y, m }, i) => ({ color: COLORS[i], head: head(y, m.B_all), lines: [{ text: `W-รออนุมัติ ${m.B_all - m.B_ok} โครงการ`, onClick: go("purchase", y, { purchaseapprove: "" }), pct: pct(m.B_ok, m.B_all) }] }))}
        />
        <YearCard
          title="(3) จัดซื้อจัดจ้าง"
          icon="pi pi-box"
          items={perYear.map(({ y, m }, i) => ({
            color: COLORS[i],
            head: head(y, m.C_all),
            lines: [
              { text: `W-รอดำเนินการ ${m.C_wait} โครงการ`, onClick: go("supplies", y, { suppliesapprove: "" }), pct: pct(m.C_wait, m.C_all) },
              { text: `C-ก่อหนี้ผูกพัน รอส่งมอบ ${m.C_commit} โครงการ`, onClick: go("supplies", y, { suppliesapprove: "2" }), pct: pct(m.C_commit, m.C_all) },
            ],
          }))}
        />
        <YearCard
          title="(4) ดำเนินการตรวจรับ"
          icon="pi pi-check-square"
          items={perYear.map(({ y, m }, i) => ({ color: COLORS[i], head: head(y, m.D_all), lines: [{ text: `W-รออนุมัติ ${m.D_all - m.D_ok} โครงการ`, onClick: go("contract", y, { contractapprove: "" }), pct: pct(m.D_ok, m.D_all) }] }))}
        />
        <YearCard title="(5) การเงิน" icon="pi pi-wallet" items={perYear.map(({ y, m }, i) => ({ color: COLORS[i], head: head(y, m.E_all), lines: [{ text: " ", pct: pct(m.E_ok, m.E_all) }] }))} />
        <Card title="งบอนุมัติ" icon="pi pi-money-bill" bodyClass="p-4">
          <div className="space-y-4">
            {perYear.map(({ y, m }, i) => (
              <div key={y} className="flex items-center gap-3">
                <i className="pi pi-check-circle text-xl" style={{ color: COLORS[i] }} />
                <div>
                  <div className="text-xs text-slate-500">ปีงบ {y + 543}</div>
                  <div className="text-lg font-bold text-slate-800">{money(m.A_budget)} บาท</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={`สรุปโครงการ ปีงบ ${byear + 543}`} icon="pi pi-chart-line" bodyClass="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard tone="emerald" title="(1) โครงการทั้งหมด" value={`${cur.A_approved} โครงการ`} sub={`W-รออนุมัติจัดซื้อจัดจ้าง ${cur.A_approved - cur.A_purch} · ${pct(cur.A_purch, cur.A_approved)}%`} />
          <StatCard tone="blue" title="(2) อนุมัติจัดซื้อจัดจ้าง" value={`${cur.B_all} โครงการ`} sub={`W-รออนุมัติ ${cur.B_all - cur.B_ok} · ${pct(cur.B_ok, cur.B_all)}%`} />
          <StatCard tone="cyan" title="(3) จัดซื้อจัดจ้าง" value={`${cur.C_all} โครงการ`} sub={`W-รออนุมัติ ${cur.C_all - cur.C_done} · ${pct(cur.C_done, cur.C_all)}%`} />
          <StatCard tone="violet" title="(4) ดำเนินการตรวจรับ" value={`${cur.D_all} โครงการ`} sub={`W-รออนุมัติ ${cur.D_all - cur.D_ok} · ${pct(cur.D_ok, cur.D_all)}%`} />
          <StatCard tone="amber" title="(5) การเงิน" value={`${cur.E_all} โครงการ`} sub={`${pct(cur.E_ok, cur.E_all)}%`} />
          <StatCard tone="pink" title="งบอนุมัติ" value={money(cur.A_budget)} sub="บาท" />
        </div>
      </Card>

      <Card title={`สรุปจำนวนโครงการ (แยกตามงาน) ปีงบ ${byear + 543}`} icon="pi pi-table">
        <div className="mb-3 max-w-sm">
          <FilterBar fields={[{ name: "bureau", label: "หน่วยงาน", type: "select", options: bureauOptions(user) }]} value={wtBureau} onChange={setWtBureau} />
        </div>
        <SimpleTable
          head={["ลำดับ", "หน่วยงาน", "งาน", { label: "จำนวนโครงการ", className: "text-center" }, { label: "งบประมาณอนุมัติ", className: "text-right" }, { label: "งบประมาณใช้ไป", className: "text-right" }, { label: "งบประมาณคงเหลือ", className: "text-right" }, { label: "ดู", className: "text-center" }]}
          rows={[
            ...wtRows.map((r, i) => [
              i + 1,
              bureauLabel,
              r.w.name,
              r.count.toLocaleString(),
              money(r.approve),
              money(r.used),
              money(r.balance),
              <a key="v" href={`#/public?worktype=${r.w.id}`} target="_blank" className="text-rose-600">
                <i className="pi pi-clipboard" />
              </a>,
            ]),
            [
              "",
              "",
              <b key="t">รวมทั้งหมด</b>,
              <b key="c">{tot.count.toLocaleString()}</b>,
              <b key="a">{money(tot.approve)}</b>,
              <b key="u">{money(tot.used)}</b>,
              <b key="b">{money(tot.balance)}</b>,
              <a key="v" href="#/public" target="_blank" className="text-rose-600">
                <i className="pi pi-clipboard" />
              </a>,
            ],
          ]}
        />
      </Card>
      <div className="flex justify-end">
        <Btn tone="outline" icon="pi pi-globe" label="เปิดเว็บไซต์ติดตามโครงการ (ประชาชน)" onClick={() => window.open("#/public", "_blank")} />
      </div>
    </Page>
  );
};

export default Dashboard;
