import { currentEnvironemnt } from '../config/variableConfig'
import fastifyConfig from '../config/fastifyConfig'

const stage = currentEnvironemnt()

export const tableName = ({ tableNameSuffix }: { tableNameSuffix: string }) => {
  return `${fastifyConfig.register.prefix}-${stage}-${tableNameSuffix}`
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
