import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "../routes";

const loading = (
  <div className="flex justify-center pt-16 text-slate-400">
    <i className="pi pi-spin pi-spinner text-3xl" />
  </div>
);

const NotFound = () => (
  <div className="p-10 text-center">
    <div className="text-5xl font-bold text-pink-600">404</div>
    <div className="mt-2 text-slate-500">ไม่พบหน้าที่ต้องการ หรือคุณไม่มีสิทธิ์เข้าถึงเมนูนี้</div>
  </div>
);

const TheContent = (props) => {
  const { PERMISSIONS, USER, sidebarCollapsed } = props;
  const allowed = (key) => !key || key === "profile" || (PERMISSIONS || []).some((m) => m.module === key);

  return (
    <div className={`flex-grow pt-[76px] transition-all duration-300 ${sidebarCollapsed ? "xl:ml-[92px] xl:w-[calc(100%-92px)]" : "xl:ml-[260px] xl:w-[calc(100%-260px)]"}`}>
      <Suspense fallback={loading}>
        <Switch>
          <Redirect exact from="/" to="/dashboard" />
          {routes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              exact={route.exact}
              render={(p) => (allowed(route.key) ? <route.component {...p} SESSION={{ USER }} /> : <NotFound />)}
            />
          ))}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </div>
  );
};

export default React.memo(TheContent);
