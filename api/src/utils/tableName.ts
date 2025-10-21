import { currentEnvironment } from '../config/variableConfig'
import fastifyConfig from '../config/fastifyConfig'

const stage = currentEnvironment()

/**
 * The tables consist of the following naming structure: `<prefix>-<stage>-<suffix>`
 * @param tableNameSuffix suffix of the table name which represents the item name
 * @returns `string` with `<prefix>-<stage>-<suffix>`
 */
export const tableName = ({ tableNameSuffix }: { tableNameSuffix: string }) => {
  return [fastifyConfig.register.prefix, stage, tableNameSuffix].join('-')
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
