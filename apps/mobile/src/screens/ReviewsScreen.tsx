import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { useFocusEffect } from "@react-navigation/native";
import { api, type QuestionType } from "../api";

type Review = {
  cardId: string;
  prompt: string;
  type: QuestionType;
  options?: string[] | null;
  pairs?: { left: string[]; right: string[] } | null;
  speakText?: string | null;
  locale?: string | null;
  hint?: string | null;
};

export function ReviewsScreen({ onUser }: { onUser?: (u: Awaited<ReturnType<typeof api.stats>>["user"]) => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setError("");
    Promise.all([api.reviews(), api.stats()])
      .then(([r, s]) => {
        setReviews(r.reviews);
        onUser?.(s.user);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [onUser]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const current = reviews[0];
  const usedRight = useMemo(() => new Set(Object.values(pairs)), [pairs]);

  async function submit(value?: unknown) {
    if (!current || busy) return;
    const payload =
      value !== undefined
        ? value
        : current.type === "MATCH"
          ? pairs
          : answer;
    if (
      (typeof payload === "string" && !payload.trim()) ||
      (current.type === "MATCH" &&
        current.pairs &&
        current.pairs.left.some((l) => !(payload as Record<string, string>)[l]))
    ) {
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const result = await api.answerReview(current.cardId, { answer: payload });
      if (result.correct) {
        setMsg(`Correct! +${result.xpEarned || 0} XP`);
      } else if (typeof result.expected === "object" && !Array.isArray(result.expected)) {
        setMsg(
          `Not quite — ${Object.entries(result.expected)
            .map(([k, v]) => `${k}→${v}`)
            .join(", ")}`
        );
      } else {
        setMsg(
          `Not quite — ${Array.isArray(result.expected) ? result.expected[0] : result.expected}`
        );
      }
      setAnswer("");
      setPairs({});
      setMatchLeft(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <Text style={styles.brand}>Walky Talky</Text>
      <Text style={styles.h1}>Reviews</Text>
      <Text style={styles.sub}>Due SRS cards from your lessons.</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!msg && <Text style={styles.okMsg}>{msg}</Text>}

      {!current ? (
        <Text style={styles.empty}>No reviews due. Nice work!</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.type}>{current.type}</Text>
          <Text style={styles.prompt}>{current.prompt}</Text>
          {!!current.hint && <Text style={styles.hint}>Hint: {current.hint}</Text>}

          {current.type === "LISTEN" && (
            <Pressable
              style={styles.listenBtn}
              onPress={() =>
                Speech.speak(current.speakText || current.prompt, {
                  language: current.locale || "es-ES",
                  rate: 0.9,
                })
              }
            >
              <Text style={styles.listenText}>▶ Play audio</Text>
            </Pressable>
          )}

          {current.type === "MCQ" &&
            current.options?.map((opt) => (
              <Pressable
                key={opt}
                disabled={busy}
                style={styles.option}
                onPress={() => submit(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}

          {(current.type === "FILL_BLANK" ||
            current.type === "TRANSLATE" ||
            current.type === "LISTEN") && (
            <>
              <TextInput
                style={styles.input}
                value={answer}
                onChangeText={setAnswer}
                editable={!busy}
                placeholder="Type your answer"
              />
              <Pressable
                style={styles.btn}
                disabled={busy || !answer.trim()}
                onPress={() => submit()}
              >
                <Text style={styles.btnText}>CHECK</Text>
              </Pressable>
            </>
          )}

          {current.type === "MATCH" && current.pairs && (
            <>
              {current.pairs.left.map((item) => (
                <Pressable
                  key={item}
                  disabled={busy || !!pairs[item]}
                  style={[
                    styles.option,
                    matchLeft === item && styles.selected,
                    !!pairs[item] && styles.matched,
                  ]}
                  onPress={() => setMatchLeft(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {pairs[item] ? (
                    <Text style={styles.sub}>→ {pairs[item]}</Text>
                  ) : null}
                </Pressable>
              ))}
              {current.pairs.right.map((item) => (
                <Pressable
                  key={`r-${item}`}
                  disabled={busy || usedRight.has(item) || !matchLeft}
                  style={[styles.option, usedRight.has(item) && { opacity: 0.4 }]}
                  onPress={() => {
                    if (!matchLeft) return;
                    setPairs({ ...pairs, [matchLeft]: item });
                    setMatchLeft(null);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.btn}
                disabled={
                  busy || current.pairs.left.some((l) => !pairs[l])
                }
                onPress={() => submit()}
              >
                <Text style={styles.btnText}>CHECK</Text>
              </Pressable>
            </>
          )}

          <Text style={styles.remaining}>
            {reviews.length} card{reviews.length === 1 ? "" : "s"} remaining
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  brand: { fontSize: 28, fontWeight: "900", color: "#58cc02" },
  h1: { marginTop: 12, fontSize: 22, fontWeight: "900" },
  sub: { marginTop: 4, fontWeight: "700", color: "#777" },
  error: { marginTop: 12, color: "#ff4b4b", fontWeight: "800" },
  okMsg: { marginTop: 12, color: "#58cc02", fontWeight: "800" },
  empty: { marginTop: 40, fontWeight: "800", color: "#777" },
  card: { marginTop: 20 },
  type: { fontWeight: "800", color: "#afafaf", fontSize: 12 },
  prompt: { marginTop: 8, fontSize: 24, fontWeight: "900" },
  hint: { marginTop: 8, fontWeight: "700", color: "#1cb0f6" },
  listenBtn: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#1cb0f6",
    backgroundColor: "#ddf4ff",
    borderRadius: 16,
    padding: 14,
  },
  listenText: { fontWeight: "900", color: "#1cb0f6", textAlign: "center" },
  option: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  selected: { borderColor: "#1cb0f6", backgroundColor: "#ddf4ff" },
  matched: { borderColor: "#58cc02", backgroundColor: "#d7ffb8" },
  optionText: { fontWeight: "800", fontSize: 17 },
  input: {
    marginTop: 14,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    fontWeight: "800",
    fontSize: 18,
  },
  btn: {
    marginTop: 12,
    backgroundColor: "#58cc02",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "900" },
  remaining: { marginTop: 16, fontWeight: "700", color: "#777" },
});
