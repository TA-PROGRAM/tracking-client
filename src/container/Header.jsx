import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { OverlayPanel } from "primereact/overlaypanel";
import { useAuth } from "../role-access/authContext";
import db, { resetDb } from "../mock/db";
import { confirmAction } from "../components/kit";

function Header(props) {
  const { user, byear, _setByear, _handleLogout } = useAuth();
  const history = useHistory();
  const panel = useRef(null);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const years = db
    .findSync("project_byear")
    .slice()
    .sort((a, b) => b.byear - a.byear)
    .map((y) => ({ label: `ปีงบ ${y.byear + 543}`, value: y.byear }));

  return (
    <header
      className={`fixed right-0 top-0 z-[900] h-[76px] border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 ${
        props.sidebarCollapsed ? "left-0 xl:left-[92px]" : "left-0 xl:left-[260px]"
      }`}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={props.handleSidebarToggle} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-sm xl:hidden">
            <i className="pi pi-bars text-base" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold tracking-tight text-slate-900 lg:text-lg">ระบบบริหารงานโครงการ</div>
            <div className="hidden truncate text-xs text-slate-500 sm:block">องค์การบริหารส่วนจังหวัดนครราชสีมา · Korat PAO Project Tracking</div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex" title="เปลี่ยนปีงบแสดงข้อมูล">
            <i className="pi pi-calendar text-pink-600" />
            <Dropdown value={byear} options={years} onChange={(e) => _setByear(e.value)} className="border-none bg-transparent shadow-none" />
          </div>
          <div className="hidden text-right text-xs leading-tight text-slate-500 lg:block">
            <div>{now.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</div>
            <div className="font-semibold text-slate-700">{now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</div>
          </div>
          <button type="button" onClick={(e) => panel.current?.toggle(e)} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-white shadow-lg shadow-slate-200">
            <span className="hidden text-xs opacity-70 sm:inline">สวัสดี,</span>
            <span className="hidden max-w-[10rem] truncate text-sm font-semibold sm:inline">{user?.name}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-sm font-bold">{(user?.shortname || user?.name || "A").slice(0, 1)}</span>
          </button>
          <OverlayPanel ref={panel} className="w-80">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.dept_name}</div>
                <div className="text-xs text-pink-600">{user?.role_title}</div>
              </div>
              <div className="space-y-1 border-t pt-2">
                <button type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50" onClick={() => { panel.current?.hide(); history.push("/profile"); }}>
                  <i className="pi pi-id-card text-emerald-600" />
                  <div>
                    <div className="text-sm font-semibold">ข้อมูลส่วนตัว</div>
                    <div className="text-xs text-slate-400">จัดการข้อมูลส่วนตัว</div>
                  </div>
                </button>
                {[1, 2].includes(Number(user?.role_id)) && (
                  <button type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50" onClick={() => { panel.current?.hide(); history.push(`/systems/org/edit/${user.org_id}`); }}>
                    <i className="pi pi-building" />
                    <div>
                      <div className="text-sm font-semibold">ข้อมูลหน่วยงาน</div>
                      <div className="text-xs text-slate-400">ตั้งค่าข้อมูลหน่วยงาน</div>
                    </div>
                  </button>
                )}
                <button type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50" onClick={() => window.open("#/public", "_blank")}>
                  <i className="pi pi-globe text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold">หน้าเว็บไซต์ประชาชน</div>
                    <div className="text-xs text-slate-400">ระบบติดตามโครงการ (public)</div>
                  </div>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
                  onClick={async () => {
                    if (await confirmAction("รีเซ็ตข้อมูลตัวอย่าง ?", "ข้อมูลที่บันทึกไว้ในเบราว์เซอร์จะถูกล้างและกลับเป็นข้อมูลเริ่มต้น", "รีเซ็ต", "#dc2626")) {
                      resetDb();
                      window.location.reload();
                    }
                  }}
                >
                  <i className="pi pi-database text-amber-600" />
                  <div>
                    <div className="text-sm font-semibold">รีเซ็ต Mock data</div>
                    <div className="text-xs text-slate-400">คืนค่าข้อมูลตัวอย่างเริ่มต้น</div>
                  </div>
                </button>
              </div>
              <button type="button" onClick={_handleLogout} className="w-full rounded-xl bg-rose-50 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100">
                ออกจากระบบ
              </button>
            </div>
          </OverlayPanel>
        </div>
      </div>
    </header>
  );
}

export default Header;
