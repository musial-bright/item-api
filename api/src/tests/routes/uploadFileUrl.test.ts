import { expect, describe, it, jest } from '@jest/globals'
import requestPresigner from '@aws-sdk/s3-request-presigner'

import fastifyConfig from '../../config/fastifyConfig'

import service from '../../service'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
  }
})

// allow general api access
jest.mock('../../service/authorizationService', () => {
  const original = jest.requireActual<
    typeof import('../../service/authorizationService')
  >('../../service/authorizationService')

  return {
    ...original,
    authorizationGuard: jest.fn().mockReturnValue(undefined),
  }
})

const pretendSignedData = [
  'X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD',
  'X-Amz-Credential=ASIA3FLD26NALOGDNOZ6%2F20251013%2Feu-central-1%2Fs3%2Faws4_request',
  'X-Amz-Date=20251013T054204Z',
].join('&')

describe('routes', () => {
  describe(`POST /${fastifyConfig.register.prefix}/upload-file-url`, () => {
    describe('without required payload', () => {
      it('gets 400 bad request error code', async () => {
        const response = await service.inject({
          method: 'POST',
          url: `/${fastifyConfig.register.prefix}/upload-file-url`,
          body: {},
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('with valid payload', () => {
      it('gets 200 response with upload_file_url and ttl', async () => {
        jest.spyOn(requestPresigner, 'getSignedUrl').mockImplementation(
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          async (_client: any, command: any, _options?: any) => {
            const bucketName = command?.input?.Bucket
            const key = command?.input?.Key
            return `https://mocked-signed-url.com/${bucketName}/${key}?${pretendSignedData}`
          },
        )

        const response = await service.inject({
          method: 'POST',
          url: `/${fastifyConfig.register.prefix}/upload-file-url`,
          body: {
            path: 'email-download',
            filename: 'service-report.pdf',
            content_type: 'application/pdf',
          },
        })

        expect(response.statusCode).toBe(200)

        const expectedFilePathUrl = [
          'https://mocked-signed-url.com',
          's3bucket',
          'test',
          'files',
          'email-download',
        ].join('/')

        const expectedFileName = 'service-report.pdf'

        const expectedDownloadUrl = [
          expectedFilePathUrl,
          expectedFileName,
        ].join('/')

        const expectedUploadUrl = [
          expectedFilePathUrl,
          expectedFileName + '?' + pretendSignedData,
        ].join('/')

        const body = JSON.parse(response.body)
        const downloadUrl = body.download_file_url
        const uploadUrl = body.upload_file_url
        const ttl = body.ttl

        expect(downloadUrl).toEqual(expectedDownloadUrl)
        expect(uploadUrl).toEqual(expectedUploadUrl)
        expect(ttl).toEqual(5 * 60)
      })
    })
  })
})
