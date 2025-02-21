export function sumArray<T>(
  array: T[],
  functionName: (item: T) => number
) {
  return array.reduce((acc, item) => acc + functionName(item), 0);
}