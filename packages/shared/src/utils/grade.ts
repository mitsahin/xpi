import { anyAnswerMatches, answersMatch, normalizeAnswer } from "./normalize";
import type { QuestionType } from "../types";

/** Expected answer shapes stored in Question.answerJson. */
export type ExpectedAnswer =
  | string
  | string[]
  | Record<string, string>
  | [string, string][];

export function asMatchMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  if (Array.isArray(value)) {
    const display: Record<string, string> = {};
    for (const row of value) {
      if (Array.isArray(row) && row.length >= 2) {
        display[String(row[0])] = String(row[1]);
      }
    }
    return display;
  }
  const display: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    display[k] = String(v ?? "");
  }
  return display;
}

/** True when submitted match map equals expected (normalized keys/values). */
export function matchMapsEqual(
  expected: Record<string, string>,
  submitted: Record<string, string>
): boolean {
  const keys = Object.keys(expected);
  if (!keys.length || keys.length !== Object.keys(submitted).length) return false;
  return keys.every((k) => {
    const subKey = Object.keys(submitted).find(
      (sk) => normalizeAnswer(sk) === normalizeAnswer(k)
    );
    if (!subKey) return false;
    return answersMatch(expected[k], submitted[subKey]);
  });
}

export function gradeQuestionAnswer(
  type: QuestionType,
  answerJson: unknown,
  submitted: unknown
): { correct: boolean; expected: string | string[] | Record<string, string> } {
  if (type === "MATCH") {
    const expectedMap = asMatchMap(answerJson);
    const submittedMap = asMatchMap(submitted);
    return {
      correct: matchMapsEqual(expectedMap, submittedMap),
      expected: expectedMap,
    };
  }

  const expectedArr = Array.isArray(answerJson)
    ? (answerJson as string[]).map(String)
    : [String(answerJson ?? "")];
  const text = String(submitted ?? "");
  const correct = anyAnswerMatches(expectedArr, text);
  return {
    correct,
    expected: expectedArr.length === 1 ? expectedArr[0] : expectedArr,
  };
}
