module.exports = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          {key: "Access-Control-Allow-Credentials", value: "true"},
          {key: "Access-Control-Allow-Origin", value: "*"},
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ]
  },
  webpack: (config, _options) => {
    config.module.rules.push({
      test: /\.cdc/,
      type: "asset/source",
    })
    return config
  },
  serverRuntimeConfig: {
    flowAccessNode: process.env.FLOW_ACCESS_NODE,
    flowAccountKeyId: process.env.FLOW_ACCOUNT_KEY_ID,
    flowAccountPrivateKey: process.env.FLOW_ACCOUNT_PRIVATE_KEY,
    flowAccountPublicKey: process.env.FLOW_ACCOUNT_PUBLIC_KEY,
    flowInitAccountsNo: process.env.FLOW_INIT_ACCOUNTS,
  },
  publicRuntimeConfig: {
    flowAccountAddress: process.env.FLOW_ACCOUNT_ADDRESS,
    baseUrl: process.env.BASE_URL,
    avatarUrl: process.env.FLOW_AVATAR_URL,
    contractFungibleToken: process.env.CONTRACT_FUNGIBLE_TOKEN,
    contractFlowToken: process.env.CONTRACT_FLOW_TOKEN,
    contractFUSD: process.env.CONTRACT_FUSD,
    tokenAmountFLOW: process.env.TOKEN_AMOUNT_FLOW,
    tokenAmountFUSD: process.env.TOKEN_AMOUNT_FUSD,
  },
}
