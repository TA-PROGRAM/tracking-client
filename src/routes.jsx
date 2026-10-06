// routes.jsx — key = users_permiss.module (menu permission)
import React from "react";

const routes = [
  { path: "/dashboard", key: "dashboard", component: React.lazy(() => import("./pages/dashboard")) },
  { path: "/project", key: "project", component: React.lazy(() => import("./pages/project")) },
  { path: "/project-plan", key: "project-plan", component: React.lazy(() => import("./pages/project-plan")) },
  { path: "/purchase", key: "purchase", component: React.lazy(() => import("./pages/purchase")) },
  { path: "/supplies", key: "supplies", component: React.lazy(() => import("./pages/supplies")) },
  { path: "/contract", key: "contract", component: React.lazy(() => import("./pages/contract")) },
  { path: "/finance", key: "finance", component: React.lazy(() => import("./pages/finance")) },
  { path: "/qrcode-gen", key: "qrcode-gen", component: React.lazy(() => import("./pages/qrcode-gen")) },
  { path: "/complaint", key: "complaint", component: React.lazy(() => import("./pages/complaint")) },
  { path: "/coordinate", key: "coordinate", component: React.lazy(() => import("./pages/coordinate")) },
  { path: "/users", key: "users", component: React.lazy(() => import("./pages/users")) },
  { path: "/systems", key: "systems", component: React.lazy(() => import("./pages/systems")) },
  { path: "/profile", key: "profile", component: React.lazy(() => import("./pages/users/profile")) },
];

export default routes;
