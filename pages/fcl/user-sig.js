import {useEffect, useState} from "react"
import * as fcl from "@onflow/fcl"
import css from "../../styles/base.module.css"
import {Header} from "../../src/comps/header.comp.js"
import {WalletUtils} from "@onflow/fcl"

export default function UserSign() {
  const [signable, setSignable] = useState(null)

  useEffect(() => {
    const callback = data => {
      setSignable(data.body)
    }

    const unsubscribe = WalletUtils.onMessageFromFCL(
      "FCL:FRAME:READY:RESPONSE",
      callback
    )
    WalletUtils.sendMsgToFCL("FCL:FRAME:READY")

    return () => unsubscribe()
  }, [])

  async function signUserMessage() {
    const signature = await fetch("/api/user-sig", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(signable),
    })
      .then(d => d.json())
      .then(({addr, keyId, signature}) => {
        WalletUtils.sendMsgToFCL("FCL:FRAME:RESPONSE", {
          f_type: "PollingResponse",
          f_vsn: "1.0.0",
          status: "APPROVED",
          reason: null,
          data: {
            f_type: "CompositeSignature",
            f_vsn: "1.0.0",
            addr: fcl.sansPrefix(addr),
            keyId: Number(keyId),
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
        subHeader="Sign message to prove you have access to this wallet."
      />
      <h4>This won’t cost you any Flow.</h4>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Key Id</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={css.bold}>{fcl.withPrefix(signable?.data.addr)}</td>
            <td>{signable?.data.keyId}</td>
            <td>{signable?.message}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="1">
              <button
                onClick={() => WalletUtils.sendMsgToFCL("FCL:VIEW:CLOSE")}
              >
                Decline
              </button>
            </td>
            <td colSpan="1"></td>
            <td colSpan="1">
              <button onClick={signUserMessage}>Approve</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
