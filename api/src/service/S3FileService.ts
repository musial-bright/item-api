import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { currentEnvironment } from '../config/variableConfig'
import { envS3FileBucket, envS3Region } from '../config/envVariables'
import { cleanArray } from '../utils/arrayTools'
import { formatUTCDate } from '../utils/dateFormatter'

const Defaults = {
  prefixPath: 'files',
  expiresInSec: 5 * 60, //sec
}

type SignedUploadUrl = {
  uploadUrl: string
  ttl: number
  downloadUrl?: string
}

export type GenerateSignedUploadUrlConfig = {
  publicRead: boolean
}

export const filePath = (
  path: string,
  filename: string,
  dateNowInFileName: boolean = false,
): string => {
  const filePathParts: string[] = []
  const stage = currentEnvironment()
  if (stage !== 'production') {
    filePathParts.push(stage)
  }

  const fileNameParts: string[] = []
  if (dateNowInFileName) {
    const date = formatUTCDate(new Date())
    fileNameParts.push(date)
  }
  fileNameParts.push(filename)

  return cleanArray([
    ...filePathParts,
    Defaults.prefixPath,
    path,
    filename,
  ]).join('/')
}

export const generateSignedUploadUrl = async ({
  path,
  filename,
  contentType,
  options,
}: {
  path: string
  filename: string
  contentType: string
  options?: GenerateSignedUploadUrlConfig
}): Promise<SignedUploadUrl> => {
  if (filename.trim().length === 0) {
    throw Error('filename is empty')
  }

  if (contentType.trim().length === 0) {
    throw Error('contentType is empty')
  }

  const s3 = new S3Client({ region: envS3Region() })

  const commandDefinition: PutObjectCommandInput = {
    Bucket: envS3FileBucket(),
    Key: filePath(path, filename),
    ContentType: contentType,
  }
  if (options && options.publicRead) {
    commandDefinition['ACL'] = 'public-read'
  }
  const command = new PutObjectCommand(commandDefinition)

  const url = await getSignedUrl(s3, command, {
    expiresIn: Defaults.expiresInSec,
  })

  const signedUrl: SignedUploadUrl = {
    uploadUrl: url,
    ttl: Defaults.expiresInSec,
  }

  if (options && options.publicRead) {
    signedUrl.downloadUrl = url.split('?')[0]
  }

  return signedUrl
}
