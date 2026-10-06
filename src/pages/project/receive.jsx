import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Page, Card, Btn, FormBuilder, useForm, alertSuccess } from "../../components/kit";
import { BackButton, ProjectInfoPanel, StepRibbon } from "../shared";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";

const schema = [
  { name: "project_receivedate", label: "วันที่รับเอกสาร", type: "date", col: 6, required: true, msg: "กรุณาระบุวันที่รับเอกสาร" },
  { name: "project_receivename", label: "ผู้รับเอกสาร", type: "textarea", col: 12, required: true, msg: "กรุณาระบุผู้รับเอกสาร" },
];

const Receive = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const p = db.getSync("project", id);
  const { values, setValues, errors, check } = useForm(schema);
  useEffect(() => {
    if (p) setValues({ project_receivedate: p.project_receivedate, project_receivename: p.project_receivename });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    if (!check()) return;
    await db.update("project", id, { ...values, edit_users: user.id });
    await alertSuccess("บันทึกสำเร็จ");
    history.push("/project");
  };

  return (
    <Page title="บันทึกรับเอกสารโครงการ" actions={<><StepRibbon n={4} tone="blue" /><BackButton to="/project" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card title="ข้อมูลการรับเอกสาร" icon="pi pi-inbox">
          <FormBuilder fields={schema} values={values} setValues={setValues} errors={errors} />
          <div className="mt-4 flex gap-2">
            <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
            <BackButton />
          </div>
        </Card>
      </div>
    </Page>
  );
};

export default Receive;
