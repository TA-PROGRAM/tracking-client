import React from "react";
import { Route, Switch } from "react-router-dom";

const List = React.lazy(() => import("./list"));
const Form = React.lazy(() => import("./form"));
const Log = React.lazy(() => import("./log"));
const Gis = React.lazy(() => import("./gis"));
const GisForm = React.lazy(() => import("./gis-form"));
const History = React.lazy(() => import("./history"));
const Receive = React.lazy(() => import("./receive"));

const ProjectModule = () => (
  <Switch>
    <Route path="/project/add" component={Form} />
    <Route path="/project/edit/:id" component={Form} />
    <Route path="/project/log/:id" component={Log} />
    <Route path="/project/gis/:id/add" component={GisForm} />
    <Route path="/project/gis/:id/edit/:oid" component={GisForm} />
    <Route path="/project/gis/:id" component={Gis} />
    <Route path="/project/audit/:id" render={(p) => <History {...p} kind="audit" />} />
    <Route path="/project/approve/:id" render={(p) => <History {...p} kind="approve" />} />
    <Route path="/project/receive/:id" component={Receive} />
    <Route path="/project" component={List} />
  </Switch>
);

export default ProjectModule;
