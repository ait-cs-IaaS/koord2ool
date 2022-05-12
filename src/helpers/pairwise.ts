export function* pairwise<T>(ary: T[]): Generator<[T, T]> {
  for (let i = 1; i < ary.length; i++) {
    yield [ary[i - 1], ary[i]];
  }
}
