import React from 'react'
import { Route, Switch } from 'react-router-dom'

const View = React.lazy(() => import('./view'))
const Permission = ({ SESSION }) => {
  const { permission_view, permission_manage } = SESSION.PERMISSION
  return (
    <Switch>
       {permission_view === 1  ? <Route path={`/`} render={props => <View {...props} {...SESSION} />} />: null}
    </Switch>
  )
}

export default Permission