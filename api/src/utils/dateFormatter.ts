export const formatUTCDate = (date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    `${date.getUTCFullYear()}-` +
    `${pad(date.getUTCMonth() + 1)}-` +
    `${pad(date.getUTCDate())}_` +
    `${pad(date.getUTCHours())}-` +
    `${pad(date.getUTCMinutes())}`
  )
}
