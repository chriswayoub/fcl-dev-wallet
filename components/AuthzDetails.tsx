/** @jsxImportSource theme-ui */
import useAuthzContext from "hooks/useAuthzContext"
import {useState} from "react"
import {Box, Button} from "theme-ui"
import {SXStyles} from "types"
import AuthzDetailsTable, {
  AuthzDetailsAccount,
  AuthzDetailsRow,
} from "./AuthzDetailsTable"
import Code from "./Code"

type TabKey = "transaction" | "details"

const TABS: {key: TabKey; label: string}[] = [
  {key: "transaction", label: "Authorize Transaction"},
  {key: "details", label: "Details"},
]

const styles: SXStyles = {
  tabs: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mt: 3,
    mb: 3,
  },
  button: {
    fontSize: [1, 3],
    mx: 3,
    color: "gray.300",
    borderBottom: "2px solid",
    borderColor: "transparent",
  },
  buttonActive: {
    color: "black",
    borderColor: "black",
  },
  scrollableContent: {
    mx: -30,
    maxHeight: 220,
    overflowY: "auto",
  },
}

function AuthzDetails() {
  const {
    proposer,
    payer,
    authorizers,
    proposalKey,
    computeLimit,
    refBlock,
    args,
    cadence,
  } = useAuthzContext()
  const [activeTab, setActiveTab] = useState<"transaction" | "details">(
    "transaction"
  )
  return (
    <div>
      <div role="tablist" aria-label="Authorization Details" sx={styles.tabs}>
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <Button
              variant="unstyled"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              aria-controls={`${tab.key}-tab`}
              aria-selected={active}
              disabled={active}
              tabIndex={active ? -1 : undefined}
              sx={{...styles.button, ...(active ? styles.buttonActive : {})}}
            >
              {tab.label}
            </Button>
          )
        })}
      </div>
      <div sx={styles.scrollableContent}>
        <div sx={{px: 30}}>
          <div
            tabIndex={0}
            role="tabpanel"
            id="transaction-tab"
            aria-labelledby="transaction"
            hidden={activeTab !== "transaction"}
          >
            <AuthzDetailsTable>
              <AuthzDetailsRow>
                <td>Proposer</td>
                <td>
                  <AuthzDetailsAccount account={proposer} />
                </td>
              </AuthzDetailsRow>
              <AuthzDetailsRow>
                <td>Payer</td>
                <td>
                  <AuthzDetailsAccount account={payer} />
                </td>
              </AuthzDetailsRow>
              <AuthzDetailsRow>
                <td>Authorizers</td>
                <td>
                  {authorizers.map(authorizer => (
                    <AuthzDetailsAccount
                      account={authorizer}
                      key={authorizer.address}
                    />
                  ))}
                </td>
              </AuthzDetailsRow>
            </AuthzDetailsTable>
            <Box mt={3} mb={-20}>
              <Code title="Arguments" value={JSON.stringify(args, null, 2)} />
              <Code title="Script Source Code" value={cadence} />
            </Box>
          </div>
          <div
            tabIndex={0}
            role="tabpanel"
            id="details-tab"
            aria-labelledby="details"
            hidden={activeTab !== "details"}
            sx={{mb: 20}}
          >
            <AuthzDetailsTable>
              <AuthzDetailsRow>
                <td>Proposal Key</td>
                <td>{proposalKey.keyId}</td>
              </AuthzDetailsRow>
              <AuthzDetailsRow>
                <td>Sequence #</td>
                <td>{proposalKey.sequenceNum}</td>
              </AuthzDetailsRow>
              <AuthzDetailsRow>
                <td>Gas Limit</td>
                <td>{computeLimit}</td>
              </AuthzDetailsRow>
              <AuthzDetailsRow>
                <td>Reference Block</td>
                <td sx={{width: 180, overflowWrap: "anywhere"}}>{refBlock}</td>
              </AuthzDetailsRow>
            </AuthzDetailsTable>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthzDetails