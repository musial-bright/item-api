// `.env` sets ENVIRONMENT=development for `npm run server`, but `testlocal`
// must run against the `*-test-*` tables that `db-reset` provisions.
process.env.ENVIRONMENT = 'test'
