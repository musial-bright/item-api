import { expect, describe, it, jest, beforeEach } from '@jest/globals'
import requestPresigner from '@aws-sdk/s3-request-presigner'

import { generateSignedUploadUrl } from '../../service/S3FileService'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
  }
})

const pretendSignedData = [
  'X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD',
  'X-Amz-Credential=ASIA3FLD26NALOGDNOZ6%2F20251013%2Feu-central-1%2Fs3%2Faws4_request',
  'X-Amz-Date=20251013T054204Z',
].join('&')

describe('generateSignedUploadUrl', () => {
  beforeEach(() => {
    jest.spyOn(requestPresigner, 'getSignedUrl').mockImplementation(
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      async (_client: any, command: any, _options?: any) => {
        const bucketName = command?.input?.Bucket
        const key = command?.input?.Key
        return `https://mocked-signed-url.com/${bucketName}/${key}?${pretendSignedData}`
      },
    )
  })

  describe('without empty parameters', () => {
    it('gets error when filename is empty', async () => {
      await expect(
        generateSignedUploadUrl({
          path: '',
          filename: '',
          contentType: '',
        }),
      ).rejects.toThrow('filename is empty')
    })

    it('gets error when contentType is empty', async () => {
      await expect(
        generateSignedUploadUrl({
          path: '',
          filename: 'some-filename.png',
          contentType: '',
        }),
      ).rejects.toThrow('contentType is empty')
    })
  })

  describe('with all parameters', () => {
    it('gets a uploadUrl and ttl but no downloadUrl', async () => {
      const { downloadUrl, uploadUrl, ttl } = await generateSignedUploadUrl({
        path: 'email-download',
        filename: 'service-report.pdf',
        contentType: 'application/pdf',
      })

      const expectedFilePathUrl = [
        'https://mocked-signed-url.com',
        'bd-servicenet-files',
        'test',
        'files',
        'email-download',
      ].join('/')

      const expectedFileName = 'service-report.pdf'

      const expectedUploadUrl = [
        expectedFilePathUrl,
        expectedFileName + '?' + pretendSignedData,
      ].join('/')

      expect(downloadUrl).toBeUndefined()
      expect(uploadUrl).toEqual(expectedUploadUrl)
      expect(ttl).toEqual(5 * 60)
    })

    it('gets a downloadUrl (because publicRead), uploadUrl and ttl', async () => {
      const { downloadUrl, uploadUrl, ttl } = await generateSignedUploadUrl({
        path: 'email-download',
        filename: 'service-report.pdf',
        contentType: 'application/pdf',
        options: { publicRead: true },
      })

      const expectedFilePathUrl = [
        'https://mocked-signed-url.com',
        'bd-servicenet-files',
        'test',
        'files',
        'email-download',
      ].join('/')

      const expectedFileName = 'service-report.pdf'

      const expectedDownloadUrl = [expectedFilePathUrl, expectedFileName].join(
        '/',
      )

      const expectedUploadUrl = [
        expectedFilePathUrl,
        expectedFileName + '?' + pretendSignedData,
      ].join('/')

      expect(downloadUrl).toEqual(expectedDownloadUrl)
      expect(uploadUrl).toEqual(expectedUploadUrl)
      expect(ttl).toEqual(5 * 60)
    })
  })
})
