import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb'

import { createTables } from './createTable/createTables'
import { deleteTables } from './deleteTables'

const run = async () => {
  try {
    await deleteTables()
  } catch (e) {
    if (e instanceof ResourceNotFoundException) {
      await createTables()
    }
    return
  }

  await createTables()
}

run()
