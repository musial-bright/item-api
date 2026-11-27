const audience: Record<string, string> = {
  fallback: 'https://api.justrelate.com',
  'http://localhost:3000': 'https://api.justrelate.com',
}

const config = {
  jr: {
    accountId: process.env.JR_ACCOUNT_ID as string,
    instanceId: process.env.JR_INSTANCE_ID as string,
  },
  jrIam: {
    audience,
    iamUrl: 'https://api.justrelate.com/iam',
    tokenUrl: 'https://api.justrelate.com/iam/token',
    tokenKey: process.env.JR_TOKEN_KEY as string,
    tokenSecret: process.env.JR_TOKEN_SECRET as string,
  },
}

export default config
