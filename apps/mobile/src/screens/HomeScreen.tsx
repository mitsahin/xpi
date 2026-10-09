import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { api, type AuthUser, type PublicLesson } from "../api";
import type { RootStackParamList } from "../types";

type TabRoutes = {
  Learn: undefined;
  Review: undefined;
  Profile: undefined;
};

export function HomeScreen({
  user,
  onUser,
}: {
  user: AuthUser;
  onUser?: (u: AuthUser) => void;
}) {
  const nav = useNavigation<NavigationProp<TabRoutes & RootStackParamList>>();
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [streak, setStreak] = useState(0);
  const [freezes, setFreezes] = useState(0);
  const [todayXp, setTodayXp] = useState(0);
  const [goal, setGoal] = useState(user.dailyXpGoal);
  const [liveUser, setLiveUser] = useState(user);
  const [dueReviews, setDueReviews] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setError("");
    setLoading(true);
    Promise.all([api.lessons(), api.stats(), api.reviews()])
      .then(([l, s, r]) => {
        setLessons(l.lessons);
        setStreak(s.streak.currentStreak);
        setFreezes(s.streak.freezesAvailable ?? 0);
        setTodayXp(s.streak.todayXp);
        setGoal(s.streak.dailyXpGoal);
        setLiveUser(s.user);
        setDueReviews(r.reviews.length);
        onUser?.(s.user);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [onUser]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const units = useMemo(() => {
    return lessons.reduce<Record<number, PublicLesson[]>>((acc, l) => {
      (acc[l.unitOrder] ||= []).push(l);
      return acc;
    }, {});
  }, [lessons]);

  const currentId =
    lessons.find((l) => !l.locked && !l.completed)?.id ??
    lessons.find((l) => l.hasActiveSession)?.id ??
    null;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <Text style={styles.brand}>Walky Talky</Text>
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.stat}>🔥 {streak}</Text>
        <Text style={styles.stat}>❄️ {freezes}</Text>
        <Text style={styles.stat}>💎 {liveUser.xp} XP</Text>
        <Text style={styles.stat}>❤ {liveUser.hearts}</Text>
      </View>
      <Text style={styles.goal}>
        Daily goal {todayXp}/{goal} XP
      </Text>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(100, (todayXp / Math.max(1, goal)) * 100)}%` },
          ]}
        />
      </View>
      {dueReviews > 0 && (
        <Pressable
          style={styles.reviewBanner}
          onPress={() => nav.navigate("Review")}
        >
          <Text style={styles.reviewText}>
            ↻ {dueReviews} review{dueReviews === 1 ? "" : "s"} due — Practice →
          </Text>
        </Pressable>
      )}
      <Text style={styles.h1}>Spanish Basics</Text>
      <Text style={styles.sub}>Follow the path. Earn XP. Keep your streak.</Text>
      {loading && lessons.length === 0 ? (
        <View style={styles.centerPad}>
          <ActivityIndicator color="#58cc02" />
          <Text style={styles.muted}>Loading your path...</Text>
        </View>
      ) : null}
      {!loading && !error && lessons.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No lessons yet</Text>
          <Text style={styles.muted}>
            Your course path will show up here once content is available.
          </Text>
        </View>
      ) : null}
      {Object.entries(units).map(([unit, items]) => {
        const doneCount = items.filter((l) => l.completed).length;
        return (
          <View key={unit} style={styles.unitBlock}>
            <View style={styles.unitRow}>
              <Text style={styles.unitBadge}>Unit {unit}</Text>
              <Text style={styles.muted}>
                {doneCount}/{items.length} done
              </Text>
            </View>
            {items.map((lesson) => {
              const isCurrent = lesson.id === currentId;
              return (
                <Pressable
                  key={lesson.id}
                  disabled={lesson.locked}
                  onPress={() => nav.navigate("Lesson", { lessonId: lesson.id })}
                  style={[
                    styles.card,
                    lesson.locked && styles.locked,
                    lesson.completed && styles.done,
                    isCurrent && styles.current,
                  ]}
                >
                  <Text style={styles.cardTitle}>
                    {lesson.locked
                      ? "🔒 "
                      : lesson.hasActiveSession
                        ? "↻ "
                        : lesson.completed
                          ? "★ "
                          : "▶ "}
                    {lesson.title}
                  </Text>
                  <Text style={styles.cardSub}>
                    +{lesson.xpReward} XP
                    {lesson.stars > 0 ? ` · ${"★".repeat(lesson.stars)}` : ""}
                    {lesson.hasActiveSession ? " · resume" : ""}
                    {isCurrent && !lesson.completed ? " · up next" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  brand: { fontSize: 28, fontWeight: "900", color: "#58cc02" },
  row: { flexDirection: "row", gap: 16, marginTop: 12, flexWrap: "wrap" },
  stat: { fontWeight: "800", fontSize: 16 },
  goal: { marginTop: 14, fontWeight: "700", color: "#777" },
  barBg: {
    height: 12,
    backgroundColor: "#e5e5e5",
    borderRadius: 99,
    marginTop: 6,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#58cc02" },
  reviewBanner: {
    marginTop: 14,
    borderWidth: 2,
    borderColor: "#ce82ff",
    backgroundColor: "#f3e8ff",
    borderRadius: 16,
    padding: 14,
  },
  reviewText: { fontWeight: "800", color: "#7c3aed" },
  h1: { marginTop: 24, marginBottom: 4, fontSize: 22, fontWeight: "900" },
  sub: { fontWeight: "700", color: "#777", marginBottom: 12 },
  unitBlock: { marginBottom: 16 },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  unitBadge: {
    backgroundColor: "#58cc02",
    color: "#fff",
    overflow: "hidden",
    fontWeight: "900",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: "uppercase" as const,
  },
  card: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#f7fff0",
  },
  done: { borderColor: "#58cc02" },
  locked: { opacity: 0.5, backgroundColor: "#f5f5f5" },
  current: { borderColor: "#1cb0f6", borderWidth: 3 },
  cardTitle: { fontWeight: "900", fontSize: 17 },
  cardSub: { marginTop: 4, fontWeight: "600", color: "#777" },
  errorBox: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#ff4b4b",
    backgroundColor: "#fff0f0",
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: "#ff4b4b", fontWeight: "800" },
  retry: { marginTop: 6, fontWeight: "900", color: "#915f10", textDecorationLine: "underline" },
  centerPad: { paddingVertical: 28, alignItems: "center", gap: 10 },
  emptyBox: {
    marginTop: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fafafa",
  },
  emptyTitle: { fontWeight: "900", fontSize: 18, marginBottom: 6 },
  muted: { fontWeight: "700", color: "#777" },
});
