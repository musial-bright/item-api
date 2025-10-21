export const cleanArray = (arr: string[]): string[] => {
  return arr
    .map((item) =>
      item
        .trim()
        .replace(/[/\s]+$/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase(),
    )
    .filter((item) => item.length > 0)
}
