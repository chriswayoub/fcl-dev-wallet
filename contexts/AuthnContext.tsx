import useConnectedAppConfig, {
  ConnectedAppConfig,
} from "hooks/useConnectedAppConfig"
import React, {createContext, useEffect, useState} from "react"
import {paths} from "src/constants"
import useSwr, {mutate} from "swr"

type AuthnContextType = {
  connectedAppConfig: ConnectedAppConfig
  appScopes: string[]
  initError: string | null
}

export const AuthnContext = createContext<AuthnContextType>({
  connectedAppConfig: {} as ConnectedAppConfig,
  appScopes: [],
  initError: null,
})

export function AuthnContextProvider({children}: {children: React.ReactNode}) {
  const isInit = useSwr<boolean>(paths.apiIsInit)
  const {connectedAppConfig, appScopes} = useConnectedAppConfig()
  const [error, setError] = useState<string | null>(null)

  const initializeWallet = () => {
    setError(null)
    fetch(paths.apiInit, {
      method: "POST",
    })
      .then(() => {
        mutate(paths.apiIsInit)
        mutate(paths.apiAccounts)
      })
      .catch(() => {
        setError("Dev Wallet initialization failed.")
      })
  }

  useEffect(() => {
    if (isInit.data === false) initializeWallet()
  }, [isInit])

  if (!isInit.data || !connectedAppConfig) return null
  const value = {connectedAppConfig, appScopes, initError: error}

  return <AuthnContext.Provider value={value}>{children}</AuthnContext.Provider>
}
