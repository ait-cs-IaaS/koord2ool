/**
 * This function iterates over an array and provides elements in pairs.
 * If the provided array is empty or only consists of one array, this
 * function will not generate anything.
 *
 * @param ary the array to iterate over.
 *
 * @example
 * const myArray = [1, 2, 3, 4, 5, 6];
 * for (const [a, b] of pairwise(myArray)) {
 *   // [a, b] will be [1, 2], [2, 3], [3, 4], etc.
 *   console.log(`Elements: ${a} and ${b}`);
 * }
 */
export function* pairwise<T>(ary: T[]): Generator<[T, T]> {
  for (let i = 1; i < ary.length; i++) {
    yield [ary[i - 1], ary[i]];
  }
}
