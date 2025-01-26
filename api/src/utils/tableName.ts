import { currentEnvironemnt } from '../config/variableConfig'

const stage = currentEnvironemnt()

export const tableName = ({ tableNameSuffix }: { tableNameSuffix: string }) => {
  return `item-api-${stage}-${tableNameSuffix}`
}

export const tableIndexName = ({
  tableNameSuffix,
  indexNameSuffix,
}: {
  tableNameSuffix: string
  indexNameSuffix: string
}) => {
  return [
    tableName({ tableNameSuffix: tableNameSuffix }),
    indexNameSuffix,
  ].join('-')
}
