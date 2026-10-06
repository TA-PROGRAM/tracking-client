import React from "react";
import { useParams } from "react-router-dom";
import { Page, Card } from "../../components/kit";
import { BackButton, SimpleTable } from "../shared";
import db from "../../mock/db";
import { userName } from "../../mock/tracking";
import { thDate } from "../../utils/format";

const Log = () => {
  const { id } = useParams();
  const p = db.getSync("project", id);
  const rows = db.findSync("project_log", { project_id: Number(id) }).sort((a, b) => String(a.add_date).localeCompare(String(b.add_date)));
  return (
    <Page title="ประวัติการทำรายการ" subtitle={p?.project_name} actions={<BackButton />}>
      <Card>
        <SimpleTable head={["ลำดับ", "วันที่ทำรายการ", "ผู้ทำรายการ", "ทำรายการ"]} rows={rows.map((r, i) => [i + 1, thDate(r.add_date, { time: true }), userName(r.add_users), r.act])} />
      </Card>
    </Page>
  );
};

export default Log;
