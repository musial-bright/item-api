// Quiets "JR_IAM_CONFIG environment variable is not set" noise during `npm run test`:
// unit tests never set JR_* env vars, but an empty config is a valid value.
process.env.JR_IAM_CONFIG = process.env.JR_IAM_CONFIG || '{}'
