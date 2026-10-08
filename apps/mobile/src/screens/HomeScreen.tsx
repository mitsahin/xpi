import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, type AuthUser, type PublicLesson } from "../api";
import type { RootStackParamList } from "../types";

export function HomeScreen({ user }: { user: AuthUser }) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [streak, setStreak] = useState(0);
  const [todayXp, setTodayXp] = useState(0);
  const [goal, setGoal] = useState(user.dailyXpGoal);

  const load = useCallback(() => {
    Promise.all([api.lessons(), api.stats()]).then(([l, s]) => {
      setLessons(l.lessons);
      setStreak(s.streak.currentStreak);
      setTodayXp(s.streak.todayXp);
      setGoal(s.streak.dailyXpGoal);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <Text style={styles.brand}>x-pi</Text>
      <View style={styles.row}>
        <Text style={styles.stat}>🔥 {streak}</Text>
        <Text style={styles.stat}>💎 {user.xp} XP</Text>
        <Text style={styles.stat}>❤ {user.hearts}</Text>
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
      <Text style={styles.h1}>Spanish Basics</Text>
      {lessons.map((lesson) => (
        <Pressable
          key={lesson.id}
          disabled={lesson.locked}
          onPress={() => nav.navigate("Lesson", { lessonId: lesson.id })}
          style={[
            styles.card,
            lesson.locked && styles.locked,
            lesson.completed && styles.done,
          ]}
        >
          <Text style={styles.cardTitle}>
            {lesson.locked ? "🔒 " : lesson.completed ? "★ " : "▶ "}
            {lesson.title}
          </Text>
          <Text style={styles.cardSub}>
            +{lesson.xpReward} XP · {lesson.description}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  brand: { fontSize: 28, fontWeight: "900", color: "#58cc02" },
  row: { flexDirection: "row", gap: 16, marginTop: 12 },
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
  h1: { marginTop: 24, marginBottom: 12, fontSize: 22, fontWeight: "900" },
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
  cardTitle: { fontWeight: "900", fontSize: 17 },
  cardSub: { marginTop: 4, fontWeight: "600", color: "#777" },
});
