import fastifyConfig from '../config/fastifyConfig'

/**
 * The tables consist of the following naming structure: `<prefix>-<stage>-<suffix>`
 * @param tableNameSuffix suffix of the table name which represents the item name
 * @returns `string` with `<prefix>-<stage>-<suffix>`
 */
export const tableName = ({ tableNameSuffix }: { tableNameSuffix: string }) => {
  return [fastifyConfig.register.dynamoDbPrefix, tableNameSuffix].join('-')
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
