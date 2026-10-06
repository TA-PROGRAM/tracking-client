import React, { useState, useEffect } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { UserModel, RoleModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
let user_data = localStorage.getItem("session-user");
const { firstname, lastname, role_id } = JSON.parse(user_data);

const user_model = new UserModel();
const role_model = new RoleModel();

const Insert = () => {
  const [state, setState] = useState({
    user_id: "",
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    is_active: "",
    create_by: firstname + " " + lastname,
    role_id: "",
  });
  const history = useHistory();
  useEffect(() => {
    const fetchData = async () => {
      const role = await role_model.getRoleBy();
      setState({ ...state, role: role.data });
    };
    fetchData();
  }, []);
  const handleInput = (e, name) => {
    let updateState = { ...state };
    updateState[name] = e;
    setState(updateState);
  };

const handleSubmit = async () => {

  const finalRoleId =
    role_id === 1   // ถ้าเป็น super admin
      ? state.role_id    // ใช้ค่าที่เลือก
      : 7;               // ถ้าไม่ใช่ บังคับเป็น 7

  const dataInsert = {
    user_id: state.user_id,
    username: state.username,
    password: state.password,
    firstname: state.firstname,
    lastname: state.lastname,
    is_active: state.is_active,
    create_by: state.create_by,
    role_id: finalRoleId,
  };

  const res = await user_model.insertUser(dataInsert);

  if (res.require) {
    Swal.fire({
      title: "เพิ่มรายการเรียบร้อย",
      icon: "success",
      showConfirmButton: false,
      timer: 2000,
    }).then(() => history.push("/user"));
  } else {
    Swal.fire({
      title: "เกิดข้อผิดพลาด !!!",
      text: "ไม่สามารถทำรายการได้กรุณาติดต่อแอดมิน !!!",
      icon: "error",
    });
  }
};

  return (
    <div className="flex justify-center mt-8 items-center">
      <div className=" w-auto h-auto bg-slate-200 rounded-xl shadow-lg px-5 py-5">
        <div className="grid grid-cols">
          <div className="flex flex-col ">
            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col">
                <label>Username</label>
                <InputText
                  className="h-10 w-80"
                  placeholder="กรุณาระบุ Username"
                  onChange={(e) => handleInput(e.target.value, "username")}
                />
              </div>
              <div className="flex flex-col">
                <label>Password</label>
                <InputText
                  className="h-10 w-80"
                  placeholder="กรุณาระบุรหัสผ่าน"
                  onChange={(e) => handleInput(e.target.value, "password")}
                />
              </div>
              <div className="flex flex-col">
                <label>ชื่อ</label>
                <InputText
                  className="h-10 w-80"
                  placeholder="กรุณาระบุชื่อ"
                  onChange={(e) => handleInput(e.target.value, "firstname")}
                />
              </div>
              <div className="flex flex-col">
                <label>สกุล</label>
                <InputText
                  className="h-10 w-80"
                  placeholder="กรุณาระบุนามสกุล"
                  onChange={(e) => handleInput(e.target.value, "lastname")}
                />
              </div>
              {role_id === 1 && (
                <div className="flex flex-col">
                  <label>สิทธิ์</label>
                  <Dropdown
                    value={state.role_id}
                    options={state.role}
                    onChange={(e) => {
                      setState({ ...state, role_id: e.value });
                    }}
                    optionValue="role_id"
                    optionLabel="role_name"
                    placeholder="เลือกสิทธิ์"
                    className="h-10 w-80"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-14 gap-4">
          <Button
            label="บันทึก"
            className="h-9"
            onClick={() => handleSubmit()}
          />
          <Button
            label="ยกเลิก"
            severity="info"
            onClick={() => history.push("/user")}
            outlined
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
};
export default Insert;
