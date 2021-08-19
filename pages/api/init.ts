import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import FCLContract from "cadence/contracts/FCL.cdc"
import initTransaction from "cadence/transactions/init.cdc"
import {NextApiRequest, NextApiResponse} from "next"
import {accountLabelGenerator} from "src/accountGenerator"
import {authz} from "src/authz"
import {SERVICE_ACCOUNT_LABEL} from "src/constants"
import {encodeServiceKey} from "src/crypto"
import fclConfig from "src/fclConfig"
import getConfig from "next/config"


const init = async (serverRuntimeConfig: any, publicRuntimeConfig: any) => {
  fclConfig(
    serverRuntimeConfig.flowAccessNode,
    publicRuntimeConfig.flowAccountAddress
  )

  const autoGeneratedLabels = [
    ...Array(serverRuntimeConfig.flowInitAccountsNo),
  ].map((_n, i) => accountLabelGenerator(i))
  const initAccountsLabels = [SERVICE_ACCOUNT_LABEL, ...autoGeneratedLabels]

  const authorization = await authz(
    publicRuntimeConfig.flowAccountAddress,
    serverRuntimeConfig.flowAccountKeyId,
    serverRuntimeConfig.flowAccountPrivateKey
  )

  try {
    const txId = await fcl
      .send([
        fcl.transaction(initTransaction),
        fcl.args([
          fcl.arg(Buffer.from(FCLContract, "utf8").toString("hex"), t.String),
          fcl.arg(
            encodeServiceKey(serverRuntimeConfig.flowAccountPublicKey),
            t.String
          ),
          fcl.arg(initAccountsLabels, t.Array(t.String)),
        ]),
        fcl.proposer(authorization),
        fcl.payer(authorization),
        fcl.authorizations([authorization]),
        fcl.limit(200),
      ])
      .then(fcl.decode)
    // eslint-disable-next-line no-console
    const txStatus = await fcl.tx(txId).onceSealed()
    // eslint-disable-next-line no-console
    console.log("TX:SEALED", txStatus)

    fcl
      .account(publicRuntimeConfig.flowAccountAddress)
      .then((d: {contracts: Record<string, unknown>}) => {
        // eslint-disable-next-line no-console
        console.log("ACCOUNT", Object.keys(d.contracts))
      })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("TX:ERROR", error)
  }
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  const {serverRuntimeConfig, publicRuntimeConfig} = getConfig()

  await init(serverRuntimeConfig, publicRuntimeConfig)

  res.status(200).json({
    foo: "bar",
  })
}
