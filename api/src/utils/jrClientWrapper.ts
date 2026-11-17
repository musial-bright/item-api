import { createServiceToken } from '../service/iam/jrIamServiceToken'

/**
 * Client for JustRelate services. The wrapper will automatically
 * take care of a service token.
 * @param fnc `fetch` function
 * @returns `Response`
 * @example
 *   const response = await jrClientWrapper((accessToken: string) => fetch(url, {
 *     method: 'GET',
 *     headers: {
 *       Accept: 'application/json',
 *       Authorization: `Bearer ${accessToken}`,
 *       'Content-Type': 'application/json',
 *     },
 *   }))
 */
export const jrClientWrapper = async (
  fnc: (accessToken: string) => Promise<Response>,
) => {
  const { access_token } = await createServiceToken()

  try {
    const response = await fnc(access_token)
    if (response.status !== 401) {
      return response
    }
  } catch (e) {
    console.log('jrClientWrapper error:', e)
  }

  const newServiceToken = await createServiceToken(true)

  return fnc(newServiceToken.access_token)
}
