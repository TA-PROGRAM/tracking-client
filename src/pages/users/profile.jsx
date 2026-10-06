// ข้อมูลส่วนตัว (users-edit)
import React from "react";
import { Page, Card, Btn, FormBuilder, useForm, alertSuccess } from "../../components/kit";
import { BackButton } from "../shared";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { userSchema, saveUser } from "./index";

const Profile = () => {
  const { user, _refreshUser } = useAuth();
  const schema = userSchema(user, { isEdit: true, profile: true });
  const me = db.getSync("users", user.id) || {};
  const { values, setValues, errors, check } = useForm(schema, { ...me, password: "" });
  const save = async () => {
    if (!check()) return;
    const { name, shortname, telephone, cid, email, password, avatar, username } = values;
    if (!(await saveUser({ id: user.id, values: { name, shortname, telephone, cid, email, password, avatar, username }, me: user }))) return;
    _refreshUser();
    alertSuccess("บันทึกสำเร็จ");
  };
  return (
    <Page title="ข้อมูลส่วนตัว" subtitle="จัดการข้อมูลส่วนตัว" actions={<BackButton />}>
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

export default Profile;
