import {useEffect, useState} from "react"
import * as fcl from "@onflow/fcl"
import css from "../../styles/base.module.css"
import {Header} from "../../src/comps/header.comp.js"
import {WalletUtils} from "@onflow/fcl"

const bool = d => {
  return d ? "Yes" : "No"
}

export default function Authz() {
  const [signable, setSignable] = useState(null)

  useEffect(() => {
    const callback = data => {
      setSignable(data.body)
    }

    const unsubscribe = WalletUtils.onFclMessage(
      "FCL:VIEW:READY:RESPONSE",
      callback
    )
    WalletUtils.sendMsgToFCL("FCL:VIEW:READY")

    return () => unsubscribe()
  }, [])

  async function sign() {
    const signature = await fetch("/api/sign", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message: signable?.message}),
    })
      .then(d => d.json())
      .then(({signature}) => {
        WalletUtils.sendMsgToFCL("FCL:VIEW:RESPONSE", {
          f_type: "PollingResponse",
          f_vsn: "1.0.0",
          status: "APPROVED",
          reason: null,
          data: {
            f_type: "CompositeSignature",
            f_vsn: "1.0.0",
            addr: fcl.sansPrefix(signable.addr),
            keyId: Number(signable.keyId),
            signature: signature,
          },
        })
      })
      .catch(d => console.error("FCL-DEV-WALLET FAILED TO SIGN", d))
  }

  return (
    <div className={css.root}>
      <Header
        onClose={() => WalletUtils.sendMsgToFCL("FCL:VIEW:CLOSE")}
        subHeader="Authorize Transaction"
      />
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Key Id</th>
            <th>Proposer</th>
            <th>Payer</th>
            <th>Authorizer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={css.bold}>{fcl.withPrefix(signable?.addr)}</td>
            <td>{signable?.keyId}</td>
            <td>{bool(signable?.roles?.proposer)}</td>
            <td>{bool(signable?.roles?.payer)}</td>
            <td>{bool(signable?.roles?.authorizer)}</td>
          </tr>
          <tr>
            <td colSpan="5">
              <pre>{JSON.stringify(signable?.args, null, 2)}</pre>
            </td>
          </tr>
          <tr>
            <td colSpan="5">
              <pre>{signable?.cadence}</pre>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2">
              <button
                onClick={() => WalletUtils.sendMsgToFCL("FCL:VIEW:CLOSE")}
              >
                Decline
              </button>
            </td>
            <td colSpan="3">
              <button onClick={sign}>Approve</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
