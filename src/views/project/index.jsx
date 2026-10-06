import React from 'react'
import { Route, Switch } from 'react-router-dom'

const Insert = React.lazy(() => import('./insert'))
const Update = React.lazy(() => import('./update'))
const View = React.lazy(() => import('./view'))

const Permission = ({ SESSION }) => {
  const { permission_view, permission_manage } = SESSION.PERMISSION
  return (
    <Switch>
      {permission_view === 1  ? <Route path={`/project/update/:uuid`} render={props => <Update {...props} {...SESSION} />} />: null}
      {permission_view === 1  ? <Route path={`/project/insert`} render={props => <Insert {...props} {...SESSION} />} />: null}
      {permission_view === 1  ? <Route path={`/`} render={props => <View {...props} {...SESSION} />} />: null}

    </Switch>
  )
}

export default Permission