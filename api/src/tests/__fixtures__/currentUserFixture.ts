import { CurrentUserType } from '../../decorator/currentUser'

const currentUserStandard: CurrentUserType = {
  identifier: 'abcdfg',
  userinfo: {
    aud: [
      'qqqffffffffffffffffffffffffffqqq',
      'a0b1a5130fc95d8819e9853ac9e7a0b1',
    ],
    email: 'stanley.kubrick@justrelate.com',
    email_verified: true,
    exp: 1744127473,
    iat: 1744126513,
    iss: 'https://iam.justrelate.com/123',
    name: 'Stanlay Kubrick',
    picture:
      'https://lh3.googleusercontent.com/a/ACg8ocLuuLoIA9DR7SVLIRPG1KoQXWFoUqCBa9Zm_dYxNySCAlFjJvb0=s96-c',
    sub: 'abcdfg',
    account_id: 'a0b1a5130fc95d8819e9853ac9e7a0b1',
    account_permissions: [],
    team_ids: [],
    instance_permissions: {},
  },
}

type CurrentUserFixtureRoles = 'no-teams'

export const currentUserFixture = (
  role: CurrentUserFixtureRoles = 'no-teams',
): CurrentUserType => {
  const currentUser = { ...currentUserStandard }

  // add custom teams_id configurations here
  const _configureRole = role

  return currentUser
}
