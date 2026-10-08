import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api, type LessonSessionState } from "../api";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

export function LessonScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const [session, setSession] = useState<LessonSessionState | null>(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [expected, setExpected] = useState("");
  const [next, setNext] = useState<LessonSessionState | null>(null);
  const [done, setDone] = useState<{ xp: number; level?: number } | null>(null);
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());

  useEffect(() => {
    api
      .startLesson(lessonId)
      .then((r) => {
        setSession(r.session);
        startedAt.current = Date.now();
      })
      .catch((e) => setError(e.message));
  }, [lessonId]);

  async function submit(answer: string) {
    if (!session?.question || feedback) return;
    const result = await api.answer(session.sessionId, {
      questionId: session.question.id,
      answer,
      responseMs: Date.now() - startedAt.current,
    });
    setFeedback(result.correct ? "correct" : "wrong");
    if (!result.correct && result.expected) {
      setExpected(
        Array.isArray(result.expected) ? result.expected[0] : result.expected
      );
    }
    if (result.sessionComplete) {
      setDone({
        xp: result.xpEarned || 0,
        level: result.leveledUp ? result.newLevel : undefined,
      });
    } else if (result.session) {
      setSession({ ...session, heartsRemaining: result.heartsRemaining });
      setNext(result.session);
    }
  }

  function continueNext() {
    if (done) {
      navigation.goBack();
      return;
    }
    if (next) {
      setSession(next);
      setNext(null);
      setSelected("");
      setFeedback(null);
      setExpected("");
      startedAt.current = Date.now();
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading...</Text>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.center}>
        <Text style={styles.brand}>Lesson complete!</Text>
        <Text style={styles.h1}>+{done.xp} XP</Text>
        {done.level != null && (
          <Text style={styles.muted}>Level up → {done.level}</Text>
        )}
        <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>CONTINUE</Text>
        </Pressable>
      </View>
    );
  }

  const q = session.question;
  const progress =
    ((session.currentIndex + (feedback ? 1 : 0)) /
      Math.max(1, session.totalQuestions)) *
    100;

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.close}>×</Text>
        </Pressable>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${Math.min(100, progress)}%` }]} />
        </View>
        <Text style={styles.heart}>❤ {session.heartsRemaining}</Text>
      </View>
      <Text style={styles.type}>
        {q?.type === "MCQ" ? "MULTIPLE CHOICE" : "FILL IN THE BLANK"}
      </Text>
      <Text style={styles.prompt}>{q?.prompt}</Text>
      {q?.type === "MCQ" &&
        q.options?.map((opt) => (
          <Pressable
            key={opt}
            disabled={!!feedback}
            onPress={() => {
              setSelected(opt);
              submit(opt);
            }}
            style={[
              styles.option,
              selected === opt && feedback === "correct" && styles.ok,
              selected === opt && feedback === "wrong" && styles.bad,
            ]}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
      {q?.type === "FILL_BLANK" && (
        <>
          <TextInput
            style={styles.input}
            value={selected}
            editable={!feedback}
            onChangeText={setSelected}
            placeholder="Type your answer"
          />
          {!feedback && (
            <Pressable
              style={styles.btn}
              onPress={() => submit(selected)}
              disabled={!selected.trim()}
            >
              <Text style={styles.btnText}>CHECK</Text>
            </Pressable>
          )}
        </>
      )}
      {feedback && (
        <View
          style={[styles.footer, feedback === "correct" ? styles.okBg : styles.badBg]}
        >
          <Text style={styles.footerText}>
            {feedback === "correct" ? "Nice!" : `Answer: ${expected}`}
          </Text>
          <Pressable style={styles.btn} onPress={continueNext}>
            <Text style={styles.btnText}>CONTINUE</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  close: { fontSize: 28, fontWeight: "900", color: "#777", width: 28 },
  barBg: {
    flex: 1,
    height: 14,
    backgroundColor: "#e5e5e5",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#58cc02" },
  heart: { fontWeight: "800", color: "#ff4b4b" },
  type: { marginTop: 20, fontWeight: "800", color: "#afafaf", fontSize: 12 },
  prompt: { marginTop: 8, fontSize: 24, fontWeight: "900", marginBottom: 20 },
  option: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  optionText: { fontWeight: "800", fontSize: 17 },
  ok: { borderColor: "#58cc02", backgroundColor: "#d7ffb8" },
  bad: { borderColor: "#ff4b4b", backgroundColor: "#ffdfe0" },
  input: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#58cc02",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "900" },
  footer: {
    marginTop: "auto",
    borderRadius: 16,
    padding: 16,
  },
  okBg: { backgroundColor: "#d7ffb8" },
  badBg: { backgroundColor: "#ffdfe0" },
  footerText: { fontWeight: "900", fontSize: 18, marginBottom: 8 },
  brand: { fontSize: 36, fontWeight: "900", color: "#58cc02" },
  h1: { fontSize: 22, fontWeight: "900", marginTop: 12 },
  muted: { fontWeight: "700", color: "#777", marginTop: 8 },
  error: { color: "#ff4b4b", fontWeight: "800" },
});
