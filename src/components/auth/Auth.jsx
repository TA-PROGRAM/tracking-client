import React, { Component } from "react";
import Swal from "sweetalert2";
import { AuthProvider } from "../../role-access/authContext";
import Authoring from "./Authoring";
import db from "../../mock/db";
import { activeByear } from "../../mock/tracking";

// Mock authentication: users live in the mock `users` table (see src/mock/seed).
const SESSION_KEY = "session-user-id";
const BYEAR_KEY = "session-byear";

class Auth extends Component {
  state = {
    authcertifying: true,
    authenticated: false,
    permissions: [],
    user: {},
    byear: Number(localStorage.getItem(BYEAR_KEY)) || activeByear(),
  };

  componentDidMount() {
    this._initiateAuthentication();
  }

  _buildSession = (user) => {
    const role = db.getSync("users_role", user.role_id) || {};
    const org = db.getSync("org", user.org_id) || {};
    const dept = db.getSync("bureau", user.bureau_id) || {};
    const menuIds = String(user.permiss || role.permiss || "")
      .split(",")
      .map((x) => Number(x.trim()))
      .filter(Boolean);
    const permissions = db.findSync("users_permiss", { flag: 1 }).filter((m) => menuIds.includes(m.id));
    return {
      user: { ...user, password: undefined, role_title: role.name, org_name: org.name, dept_name: dept.name },
      permissions,
    };
  };

  _checkLogin = async ({ username, password }) => {
    const res = await db.list("users", { username });
    const user = (res.data || []).find((u) => u.password === password);
    if (!user) {
      this.setState({ authcertifying: false }, () =>
        Swal.fire({ title: "ไม่สามารถล็อคอินได้ !", text: "โปรดตรวจสอบชื่อผู้ใช้และรหัสผ่านของคุณ", icon: "warning" }),
      );
      return;
    }
    if (String(user.status) !== "1") {
      this.setState({ authcertifying: false }, () =>
        Swal.fire({ title: "ไม่สามารถล็อคอินได้ !", text: "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน", icon: "warning" }),
      );
      return;
    }
    localStorage.setItem(SESSION_KEY, user.id);
    db.update("users", user.id, { last_login: new Date().toISOString() });
    this.setState({ authcertifying: false, authenticated: true, ...this._buildSession(user) });
  };

  _initiateAuthentication = () => {
    const id = localStorage.getItem(SESSION_KEY);
    const user = id && db.getSync("users", id);
    if (user) this.setState({ authcertifying: false, authenticated: true, ...this._buildSession(user) });
    else this.setState({ authcertifying: false });
  };

  _refreshUser = () => {
    const user = db.getSync("users", this.state.user.id);
    if (user) this.setState(this._buildSession(user));
  };

  _handleLogin = (data) => !this.state.authcertifying && this.setState({ authcertifying: true }, () => this._checkLogin(data));

  _handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.hash = "#/";
    window.location.reload();
  };

  _setByear = (byear) => {
    localStorage.setItem(BYEAR_KEY, byear);
    this.setState({ byear: Number(byear) });
  };

  render() {
    return (
      <AuthProvider
        value={{
          ...this.state,
          _handleLogin: this._handleLogin,
          _handleLogout: this._handleLogout,
          _initiateAuthentication: this._initiateAuthentication,
          _setByear: this._setByear,
          _refreshUser: this._refreshUser,
        }}
      >
        {this.state.authcertifying ? <Authoring /> : this.props.children}
      </AuthProvider>
    );
  }
}

export default Auth;
