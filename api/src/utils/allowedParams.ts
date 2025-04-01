export const allowedParams = ({
  allowed,
  attributes,
}: {
  allowed: string[]
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  attributes: Record<string, any>
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
}): Record<string, any> => {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const allowedAttributes: Record<string, any> = {}
  Object.keys(attributes).forEach((key) => {
    if (allowed.includes(key)) {
      allowedAttributes[key] = attributes[key]
    }
  })

  return allowedAttributes
}
