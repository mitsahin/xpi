import {
  gradeQuestionAnswer,
  type QuestionType,
} from "@walky-talky/shared";

export function gradeLessonAnswer(
  type: QuestionType,
  answerJson: unknown,
  submitted: unknown
) {
  return gradeQuestionAnswer(type, answerJson, submitted);
}
