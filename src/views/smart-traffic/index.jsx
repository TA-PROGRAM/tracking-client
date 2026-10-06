import React from 'react'
import { Route, Switch } from 'react-router-dom'

const View = React.lazy(() => import('./view'))
const Cctv = React.lazy(() => import('./cctv')
)
const Permission = ({ SESSION }) => {
  return (
    <Switch>
      <Route path={`/smart-traffic/cctv`} render={props => <Cctv {...props} {...SESSION} />} />
      <Route path={`/`} render={props => <View {...props} {...SESSION} />} />

    </Switch>
  )
}

export default Permission