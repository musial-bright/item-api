import https from 'https'

import config from '../../config/jrConfig'

type UserInfoType = {
  statusCode: number | undefined
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  data: any
}

export const getUserInfo = async (
  authToken: string,
  params: string,
): Promise<UserInfoType> => {
  const fullUrl = [
    config.jrIam.iamUrl,
    'instances',
    config.jr.instanceId,
    `userinfo?${params}`,
  ].join('/')

  return new Promise((resolve, reject) => {
    const req = https.get(
      fullUrl,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      (res) => {
        let rawData = ''
        const { statusCode } = res

        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          try {
            const data = rawData.length > 0 ? JSON.parse(rawData) : {}
            resolve({
              statusCode,
              data,
            })
          } catch (err) {
            reject(err)
          }
        })
      },
    )
    req.on('error', (err) => {
      reject(err)
    })
  })
}
