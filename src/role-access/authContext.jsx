import { createContext, useContext } from "react"

const authContext = createContext({
  authcertifying: true,
  authenticated: false,
  permissions: [],
  user: {},
  byear: new Date().getFullYear(),
  _handleLogin: () => { },
  _handleLogout: () => { },
  _initiateAuthentication: () => { },
  _setByear: () => { },
  _refreshUser: () => { },
})

export const AuthProvider = authContext.Provider
export const AuthConsumer = authContext.Consumer
export const useAuth = () => useContext(authContext)
