import {useEffect, useState} from "react"
import {WalletUtils} from "@onflow/fcl"

export type ConnectedAppConfig = {
  type: string
  body: Record<string, unknown>
  service: Record<string, unknown>
  config: {
    services: {"OpenID.scopes": string}
    app: {
      icon: string
      title: string
    }
  }
}

export default function useConnectedAppConfig() {
  const [connectedAppConfig, setConnectedAppConfig] =
    useState<ConnectedAppConfig | null>(null)

  useEffect(() => {
    function callback(data: ConnectedAppConfig) {
      setConnectedAppConfig(data)
    }

    WalletUtils.ready(callback)
  }, [])

  const appScopes =
    connectedAppConfig?.config?.services?.["OpenID.scopes"]
      ?.trim()
      ?.split(/\s+/) ?? []

  return {connectedAppConfig, appScopes}
}
