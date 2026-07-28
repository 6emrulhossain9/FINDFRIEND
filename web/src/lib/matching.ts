// Interest score helpers.
//
// The matching engine is intentionally simple in v1: a transparent
// overlap score over the `user_interests` table. The reason we compute
// it in app code (rather than as a Postgres function) is so the
// scoring formula is easy to iterate on without a migration, and so
// it is testable in isolation.
//
// We expose two things:
//   - computeMutualInterests(a, b): symmetric count of shared interest ids
//   - jaccard(a, b): |A ∩ B| / |A ∪ B| (a number in [0, 1])
//
// The Discover page ranks candidates by `jaccard` then by recency of
// onboarding. See /app/discover/page.tsx for the full query.

export type InterestId = string;

export function computeMutualInterests(
  a: readonly InterestId[],
  b: readonly InterestId[],
): { shared: InterestId[]; count: number } {
  if (a.length === 0 || b.length === 0) return { shared: [], count: 0 };
  const setB = new Set(b);
  const shared: InterestId[] = [];
  for (const id of a) {
    if (setB.has(id)) shared.push(id);
  }
  return { shared, count: shared.length };
}

export function jaccard(a: readonly InterestId[], b: readonly InterestId[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const id of setA) {
    if (setB.has(id)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
