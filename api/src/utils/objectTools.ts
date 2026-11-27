// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPlainObject = (value: any): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Deeply merges `override` on top of `base`, keeping `base`'s nested defaults for any property `override` doesn't set. */
export const deepMerge = <T extends Record<string, unknown>>(
  base: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override: Record<string, any>,
): T => {
  const result: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    result[key] =
      isPlainObject(value) && isPlainObject(result[key])
        ? deepMerge(result[key] as Record<string, unknown>, value)
        : value
  }

  return result as T
}
