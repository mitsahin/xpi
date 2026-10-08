import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gradeLessonAnswer } from "../../engines/lesson";

describe("gradeLessonAnswer", () => {
  it("grades MCQ / fill / translate with normalization", () => {
    assert.equal(
      gradeLessonAnswer("MCQ", "Hola", "hola").correct,
      true
    );
    assert.equal(
      gradeLessonAnswer("FILL_BLANK", ["Buenos", "buenos"], "BUENOS").correct,
      true
    );
    assert.equal(
      gradeLessonAnswer("TRANSLATE", ["Buenas noches"], "buenas  noches").correct,
      true
    );
    assert.equal(
      gradeLessonAnswer("LISTEN", ["Gracias"], "adios").correct,
      false
    );
  });

  it("grades MATCH maps regardless of key casing", () => {
    const expected = { Hola: "Hello", Adiós: "Goodbye" };
    assert.equal(
      gradeLessonAnswer("MATCH", expected, {
        hola: "hello",
        Adiós: "Goodbye",
      }).correct,
      true
    );
    assert.equal(
      gradeLessonAnswer("MATCH", expected, {
        Hola: "Hello",
      }).correct,
      false
    );
  });
});
