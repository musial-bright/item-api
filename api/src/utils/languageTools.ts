export const allEqual = <T>(array: Array<T>): boolean => {
  return array.every((val, _i, arr) => val === arr[0])
}

export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim() !== ''
}

export const getValidDate = (dateString: string): Date | undefined => {
  const date = new Date(dateString)

  return !isNaN(date.getTime()) ? date : undefined
}
