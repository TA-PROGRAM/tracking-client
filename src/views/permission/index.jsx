import React from 'react'
import { Route, Switch } from 'react-router-dom'

const Manage = React.lazy(() => import('./manage'))
const View = React.lazy(() => import('./view'))
const Permission = ({ SESSION }) => {
  // const { permission_view, permission_edit, permission_add } = SESSION.PERMISSION
  return (
    <Switch>
      <Route path={`/permission/:id`} render={props => <Manage {...props} {...SESSION} />} />
      <Route path={`/`} render={props => <View {...props} {...SESSION} />} />
    </Switch>
  )
}

export default Permission