import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api, type LessonSessionState } from "../api";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

export function LessonScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const [session, setSession] = useState<LessonSessionState | null>(null);
  const [resumed, setResumed] = useState(false);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [expected, setExpected] = useState("");
  const [next, setNext] = useState<LessonSessionState | null>(null);
  const [done, setDone] = useState<{ xp: number; level?: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const startedAt = useRef(Date.now());

  useEffect(() => {
    api
      .startLesson(lessonId)
      .then((r) => {
        setSession(r.session);
        setResumed(r.resumed);
        startedAt.current = Date.now();
      })
      .catch((e) => setError(e.message));
  }, [lessonId]);

  const usedRight = useMemo(() => new Set(Object.values(pairs)), [pairs]);

  async function submit(answer: unknown) {
    if (!session?.question || feedback || busy) return;
    setBusy(true);
    try {
      const result = await api.answer(session.sessionId, {
        questionId: session.question.id,
        answer,
        responseMs: Date.now() - startedAt.current,
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (!result.correct && result.expected) {
        if (typeof result.expected === "object" && !Array.isArray(result.expected)) {
          setExpected(
            Object.entries(result.expected)
              .map(([k, v]) => `${k}→${v}`)
              .join(", ")
          );
        } else {
          setExpected(
            Array.isArray(result.expected) ? result.expected[0] : result.expected
          );
        }
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
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
      setPairs({});
      setMatchLeft(null);
      setResumed(false);
      startedAt.current = Date.now();
    }
  }

  async function restart() {
    setBusy(true);
    try {
      const r = await api.startLesson(lessonId, { forceNew: true });
      setSession(r.session);
      setResumed(false);
      setFeedback(null);
      setExpected("");
      setSelected("");
      setPairs({});
      setMatchLeft(null);
      setDone(null);
      setNext(null);
      startedAt.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>BACK</Text>
        </Pressable>
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
  const textTypes =
    q?.type === "FILL_BLANK" || q?.type === "TRANSLATE" || q?.type === "LISTEN";

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

      {resumed && (
        <View style={styles.resumeRow}>
          <Text style={styles.resume}>Resumed session</Text>
          <Pressable onPress={restart} disabled={busy}>
            <Text style={styles.restart}>RESTART</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.type}>{q?.type ?? "QUESTION"}</Text>
      <Text style={styles.prompt}>{q?.prompt}</Text>
      {!!q?.hint && <Text style={styles.hint}>Hint: {q.hint}</Text>}

      {q?.type === "LISTEN" && (
        <Pressable
          style={styles.listenBtn}
          onPress={() =>
            Speech.speak(q.speakText || q.prompt, {
              language: q.locale || "es-ES",
              rate: 0.9,
            })
          }
        >
          <Text style={styles.listenText}>▶ Play audio</Text>
        </Pressable>
      )}

      {q?.type === "MCQ" &&
        q.options?.map((opt) => (
          <Pressable
            key={opt}
            disabled={!!feedback || busy}
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

      {textTypes && (
        <>
          <TextInput
            style={styles.input}
            value={selected}
            editable={!feedback && !busy}
            onChangeText={setSelected}
            placeholder="Type your answer"
          />
          {!feedback && (
            <Pressable
              style={styles.btn}
              onPress={() => submit(selected)}
              disabled={!selected.trim() || busy}
            >
              <Text style={styles.btnText}>CHECK</Text>
            </Pressable>
          )}
        </>
      )}

      {q?.type === "MATCH" && q.pairs && !feedback && (
        <View style={styles.matchRow}>
          <View style={styles.matchCol}>
            {q.pairs.left.map((item) => (
              <Pressable
                key={item}
                disabled={!!pairs[item] || busy}
                onPress={() => setMatchLeft(item)}
                style={[
                  styles.option,
                  matchLeft === item && styles.selected,
                  !!pairs[item] && styles.ok,
                ]}
              >
                <Text style={styles.optionText}>{item}</Text>
                {pairs[item] ? (
                  <Text style={styles.muted}>→ {pairs[item]}</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
          <View style={styles.matchCol}>
            {q.pairs.right.map((item) => (
              <Pressable
                key={item}
                disabled={usedRight.has(item) || !matchLeft || busy}
                onPress={() => {
                  if (!matchLeft) return;
                  const nextPairs = { ...pairs, [matchLeft]: item };
                  setPairs(nextPairs);
                  setMatchLeft(null);
                }}
                style={[styles.option, usedRight.has(item) && styles.lockedOpt]}
              >
                <Text style={styles.optionText}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.btn}
            disabled={
              busy ||
              q.pairs.left.some((l) => !pairs[l])
            }
            onPress={() => submit(pairs)}
          >
            <Text style={styles.btnText}>CHECK</Text>
          </Pressable>
        </View>
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
  resumeRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resume: { fontWeight: "800", color: "#1cb0f6" },
  restart: { fontWeight: "900", color: "#777", fontSize: 12 },
  type: { marginTop: 20, fontWeight: "800", color: "#afafaf", fontSize: 12 },
  prompt: { marginTop: 8, fontSize: 24, fontWeight: "900", marginBottom: 12 },
  hint: { fontWeight: "700", color: "#1cb0f6", marginBottom: 10 },
  listenBtn: {
    borderWidth: 2,
    borderColor: "#1cb0f6",
    backgroundColor: "#ddf4ff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  listenText: { fontWeight: "900", color: "#1cb0f6", textAlign: "center" },
  option: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  optionText: { fontWeight: "800", fontSize: 17 },
  selected: { borderColor: "#1cb0f6", backgroundColor: "#ddf4ff" },
  ok: { borderColor: "#58cc02", backgroundColor: "#d7ffb8" },
  bad: { borderColor: "#ff4b4b", backgroundColor: "#ffdfe0" },
  lockedOpt: { opacity: 0.4 },
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
  matchRow: { marginTop: 4 },
  matchCol: { marginBottom: 4 },
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
  muted: { fontWeight: "700", color: "#777", marginTop: 4 },
  error: { color: "#ff4b4b", fontWeight: "800", marginBottom: 12 },
});
