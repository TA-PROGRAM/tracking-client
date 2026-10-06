import React from "react";
import "./App.css";
import "./style";
import { HashRouter, Route, Switch } from "react-router-dom";
import Auth from "./components/auth/Auth";
import { ThaiCalendar } from "./components/customComponent";

const Layout = React.lazy(() => import("./container/layout"));
const PublicSite = React.lazy(() => import("./pages/public"));
const ComplaintForm = React.lazy(() => import("./pages/public/complaint-form"));

ThaiCalendar();

// Legacy QR codes point to ?p=project-cer&projectid=<base64>; map them to the hash routes
const legacyRedirect = () => {
  const q = new URLSearchParams(window.location.search);
  const p = q.get("p");
  if (!p) return;
  let id = q.get("projectid") || "";
  try {
    id = atob(id);
  } catch {
    /* plain id */
  }
  window.history.replaceState(null, "", `${window.location.pathname}#/public/${p}${id ? `/${id}` : ""}`);
};
legacyRedirect();

function App() {
  return (
    <HashRouter>
      <React.Suspense fallback={null}>
        <Switch>
          <Route path="/public" render={(props) => <PublicSite {...props} />} />
          <Route path="/complaint-form" render={(props) => <ComplaintForm {...props} />} />
          <Route
            path="/"
            render={(props) => (
              <Auth>
                <Layout {...props} />
              </Auth>
            )}
          />
        </Switch>
      </React.Suspense>
    </HashRouter>
  );
}

export default App;
