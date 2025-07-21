// TODO: provide from .env
export const endpoint = 'http://localhost:8000'

// export const stage = 'development'
export const stage = 'test'

const tablePrefix = `item-api-${stage}`

export const tableNames = {
  item: `${tablePrefix}-item`,
}
