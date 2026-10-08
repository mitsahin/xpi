import {
  gradeQuestionAnswer,
  type QuestionType,
} from "@x-pi/shared";

export function gradeLessonAnswer(
  type: QuestionType,
  answerJson: unknown,
  submitted: unknown
) {
  return gradeQuestionAnswer(type, answerJson, submitted);
}
