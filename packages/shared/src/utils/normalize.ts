/** Normalize free-text answers for comparison. */
export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .replace(/\s+/g, " ");
}

export function answersMatch(expected: string, actual: string): boolean {
  return normalizeAnswer(expected) === normalizeAnswer(actual);
}

export function anyAnswerMatches(
  expected: string[],
  actual: string
): boolean {
  return expected.some((e) => answersMatch(e, actual));
}
