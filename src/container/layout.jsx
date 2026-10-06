import React, { useState } from "react";
import { Header, Content, Sidebar } from "./index";
import { AuthConsumer } from "../role-access/authContext";
const Login = React.lazy(() => import("../components/Login/Login"));

function Layout(props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <AuthConsumer>
      {({ authenticated, user, permissions, _handleLogout }) =>
        authenticated ? (
          <div>
            <Header
              handleSidebarToggle={handleSidebarToggle}
              sidebarCollapsed={sidebarCollapsed}
            />
            <Sidebar
              mobileOpen={mobileOpen}
              handleSidebarToggle={handleSidebarToggle}
              handleSidebarCollapse={handleSidebarCollapse}
              sidebarCollapsed={sidebarCollapsed}
              USER={user}
              PERMISSIONS={permissions}
              handleLogout={_handleLogout}
            />
            <Content
              USER={user}
              PERMISSIONS={permissions}
              handleLogout={_handleLogout}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        ) : (
          <Login />
        )
      }
    </AuthConsumer>
  );
}

export default Layout;