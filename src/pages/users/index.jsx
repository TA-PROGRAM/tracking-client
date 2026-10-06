// ผู้ใช้งานระบบ
import React, { useEffect, useMemo } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, alertError, Badge } from "../../components/kit";
import { FilterBar, BackButton } from "../shared";
import { IconAction, name } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { lookupOptions } from "../../mock/tracking";

export const Avatar = ({ u, size = "h-12 w-12" }) => (
  <div className={`${size} flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500`}>{u?.avatar?.url ? <img src={u.avatar.url} alt="" className="h-full w-full object-cover" /> : <i className="pi pi-user" />}</div>
);

const List = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { data, loading } = useTable("users");
  const [f, setF] = useFilters("users", {});
  const rows = useMemo(
    () =>
      data
        .filter((u) => Number(user.role_id) === 1 || u.org_id === user.org_id)
        .filter((u) => !f.dept_id || String(u.bureau_id) === String(f.dept_id))
        .filter((u) => !f.search || u.name.includes(f.search))
        .sort((a, b) => b.id - a.id),
    [data, f, user],
  );
  return (
    <Page title="ผู้ใช้งานระบบ" actions={<Btn tone="success" icon="pi pi-plus-circle" label="เพิ่มผู้ใช้" onClick={() => history.push("/users/add")} />}>
      <FilterBar fields={[{ name: "dept_id", label: "หน่วยงานรอง", type: "select", options: lookupOptions("bureau", "ระบุ") }, { name: "search", label: "ชื่อผู้ใช้งาน", type: "text" }]} value={f} onChange={setF} />
      <DataList
        loading={loading}
        value={rows}
        onRowClick={(u) => history.push(`/users/edit/${u.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          { header: "โปรไฟล์", body: (u) => <Avatar u={u} /> },
          { field: "name", header: "ชื่อ-สกุล", body: (u) => <div>{u.name}<div className="text-xs text-slate-400">เลขบัตร : {u.cid}</div></div> },
          { field: "username", header: "username" },
          { header: "หน่วยงานหลัก", body: (u) => name("org", u.org_id) },
          { header: "หน่วยงานรอง", body: (u) => name("bureau", u.bureau_id) },
          { header: "สิทธิ์ใช้งาน", body: (u) => name("users_role", u.role_id) },
          { header: "สถานะ", body: (u) => (String(u.status) === "1" ? <Badge color="green">เปิดใช้งาน</Badge> : <Badge color="red">ปิดใช้งาน</Badge>) },
          { header: "จัดการ", body: (u) => <IconAction icon="pi pi-pencil" title="แก้ไข" onClick={() => history.push(`/users/edit/${u.id}`)} /> },
        ]}
      />
    </Page>
  );
};

export const userSchema = (me, { isEdit, profile }) => {
  const lock = profile;
  return [
    {
      title: "ข้อมูลผู้ใช้งาน",
      icon: "pi pi-user",
      fields: [
        { name: "name", label: "ชื่อ-สกุล", type: "text", col: 6, required: true, msg: "กรุณาระบุชื่อ-สกุล" },
        { name: "shortname", label: "ชื่อย่อ", type: "text", col: 2 },
        { name: "cid", label: "เลขบัตรประชาชน", type: "text", col: 4, maxLength: 13, help: "เลขที่บัตรประชาชน 13 หลัก" },
        { name: "org_id", label: "หน่วยงานหลัก", type: "select", col: 6, required: true, msg: "กรุณาระบุหน่วยงาน", disabled: lock, options: () => db.findSync("org", { flag: 1 }).filter((o) => Number(me.role_id) === 1 || o.id === me.org_id).map((o) => ({ label: o.name, value: o.id })) },
        { name: "bureau_id", label: "หน่วยงานรอง", type: "select", col: 6, disabled: lock, source: { table: "bureau", where: { flag: 1 } } },
        { name: "telephone", label: "โทรศัพท์", type: "text", col: 6, maxLength: 10, required: true, msg: "กรุณาระบุโทรศัพท์", help: "หมายเลขโทรศัพท์ 10 หลัก" },
        { name: "email", label: "email", type: "text", col: 6 },
        { name: "username", label: "Username", type: "text", col: 6, required: true, msg: "กรุณาระบุ Username", disabled: isEdit, help: "ภาษาอังกฤษเท่านั้น" },
        { name: "password", label: "Password", type: "password", col: 6, required: !isEdit, msg: "กรุณาระบุ Password", help: isEdit ? "เว้นว่างไว้ กรณีที่ไม่ต้องการเปลี่ยน" : "ไม่น้อยกว่า 8 อักษร" },
      ],
    },
    {
      title: "สิทธิ์และสถานะ",
      icon: "pi pi-key",
      fields: [
        { name: "avatar", label: "รูปโปรไฟล์", type: "image", col: 4, help: ".jpg .png เท่านั้น" },
        { name: "role_id", label: "สิทธิ์ใช้งาน", type: "select", col: 4, required: true, msg: "กรุณาระบุสิทธิ์ใช้งาน", disabled: lock, options: () => db.findSync("users_role", { active: 1 }).filter((r) => Number(me.role_id) === 1 || r.id !== 1).map((r) => ({ label: r.name, value: r.id })) },
        { name: "status", label: "สถานะใช้งาน", type: "select", col: 4, required: true, disabled: lock, options: [{ label: "เปิดใช้งาน", value: 1 }, { label: "ปิดใช้งาน", value: 0 }] },
      ],
    },
  ];
};

export const saveUser = async ({ id, values, me }) => {
  if (!/^[A-Za-z0-9._-]+$/.test(values.username || "")) {
    alertError("กรุณาระบุ Username", "ภาษาอังกฤษเท่านั้น");
    return false;
  }
  const dup = db.findSync("users", { username: values.username }).find((u) => String(u.id) !== String(id));
  if (dup) {
    alertError("ไม่สามารถบันทึกข้อมูลได้", "Username นี้มีในระบบแล้ว");
    return false;
  }
  const data = { ...values, cid: String(values.cid || "").replace(/-/g, ""), telephone: String(values.telephone || "").replace(/\s/g, "") };
  if (id && !data.password) delete data.password;
  if (id) await db.update("users", id, { ...data, edit_users: me.id });
  else await db.insert("users", { ...data, last_login: null, add_users: me.id });
  return true;
};

const Form = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user, _refreshUser } = useAuth();
  const schema = userSchema(user, { isEdit: !!id });
  const { values, setValues, errors, check } = useForm(schema, { org_id: user.org_id, status: 1 });
  useEffect(() => {
    if (id) {
      const u = db.getSync("users", id);
      if (u) setValues({ ...u, password: "" });
    }
  }, [id, setValues]);
  const save = async () => {
    if (!check()) return;
    if (!(await saveUser({ id, values, me: user }))) return;
    if (String(id) === String(user.id)) _refreshUser();
    await alertSuccess("บันทึกสำเร็จ");
    history.push("/users");
  };
  return (
    <Page title={`${id ? "แก้ไข" : "เพิ่ม"}ผู้ใช้งาน`} breadcrumb={["ผู้ใช้งานระบบ"]} actions={<BackButton to="/users" />}>
      <Card>
        <FormBuilder sections={schema} values={values} setValues={setValues} errors={errors} />
        <div className="mt-5 flex gap-2">
          <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
          <BackButton />
        </div>
      </Card>
    </Page>
  );
};

const UsersModule = () => (
  <Switch>
    <Route path="/users/add" component={Form} />
    <Route path="/users/edit/:id" component={Form} />
    <Route path="/users" component={List} />
  </Switch>
);

export { Form as UserForm };
export default UsersModule;
