export const allEqual = <T> (array: Array<T>): boolean => {
  return array.every((val, _i, arr) => val === arr[0])
}
