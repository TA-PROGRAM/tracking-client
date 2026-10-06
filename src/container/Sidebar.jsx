import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import accessMenu from "./menu";

function Sidebar(props) {
  const { menuItems } = accessMenu({ PERMISSIONS: props.PERMISSIONS });
  const history = useHistory();
  const location = useLocation();
  const isCollapsed = props.sidebarCollapsed;
  const activeModule = menuItems.find((m) => location.pathname === m.to || location.pathname.startsWith(`${m.to}/`))?.module;
  const [open, setOpen] = useState(activeModule);
  useEffect(() => setOpen(activeModule), [activeModule]);

  const go = (to) => {
    history.push(to);
    if (props.mobileOpen) props.handleSidebarToggle();
  };

  return (
    <>
      {props.mobileOpen && <button type="button" className="fixed inset-0 z-[920] bg-slate-950/40 backdrop-blur-[2px] xl:hidden" onClick={props.handleSidebarToggle} />}

      <aside
        className={`fixed left-0 top-0 z-[930] h-screen border-r border-slate-200 bg-white shadow-2xl shadow-slate-200/60 transition-all duration-300 ${isCollapsed ? "w-[92px]" : "w-[260px]"} ${
          props.mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-4 py-5">
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between gap-3"}`}>
              <Link to="/dashboard" className="min-w-0">
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-700 shadow-lg shadow-pink-200/70">
                    <img src="/img/logo-korat-secare.png" alt="อบจ.นครราชสีมา" className="h-9 w-9 object-contain" />
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0">
                      <div className="truncate text-base font-bold text-slate-900">อบจ.นครราชสีมา</div>
                      <div className="truncate text-xs text-slate-500">Korat PAO Project Tracking</div>
                    </div>
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={props.handleSidebarCollapse}
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 xl:inline-flex"
              >
                <i className={`pi ${isCollapsed ? "pi-angle-right" : "pi-angle-left"}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            {!isCollapsed && <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">เมนูหลัก</div>}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeModule === item.module;
                const expanded = open === item.module && item.children && !isCollapsed;
                return (
                  <div key={item.module}>
                    <button
                      type="button"
                      title={isCollapsed ? item.name : ""}
                      onClick={() => (item.children && !isCollapsed ? setOpen(open === item.module ? null : item.module) : go(item.to))}
                      className={`group flex w-full items-center rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ${isCollapsed ? "justify-center" : "gap-3"} ${
                        isActive ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-100" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700 group-hover:bg-white"}`}>
                        <i className={`${item.icon} text-base`} />
                      </div>
                      {!isCollapsed && (
                        <>
                          <div className="min-w-0 flex-1 truncate text-sm font-semibold">{item.name}</div>
                          <i className={`pi ${item.children ? (expanded ? "pi-angle-down" : "pi-angle-right") : "pi-angle-right"} text-xs ${isActive ? "text-white" : "text-slate-300"}`} />
                        </>
                      )}
                    </button>
                    {expanded && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l border-pink-100 pl-3">
                        {item.children.map((c) => (
                          <button
                            key={c.to}
                            type="button"
                            onClick={() => go(c.to)}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${location.pathname === c.to ? "bg-pink-50 font-semibold text-pink-700" : "text-slate-600 hover:bg-slate-50"}`}
                          >
                            <i className={`${c.icon} text-xs`} />
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 p-4">
            {!isCollapsed ? (
              <>
                <button type="button" onClick={() => go("/profile")} className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left hover:bg-slate-100">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white">
                    {props.USER?.avatar?.url ? <img src={props.USER.avatar.url} alt="" className="h-full w-full object-cover" /> : <i className="pi pi-user" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{props.USER?.name}</div>
                    <div className="truncate text-xs text-slate-500">{props.USER?.role_title}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={props.handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <i className="pi pi-sign-out" />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <button type="button" title="ออกจากระบบ" onClick={props.handleLogout} className="flex w-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-rose-600 transition hover:bg-rose-100">
                <i className="pi pi-sign-out" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
