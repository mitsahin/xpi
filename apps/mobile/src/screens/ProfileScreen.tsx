import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { api, type AuthUser } from "../api";

export function ProfileScreen({
  user,
  onLogout,
  onUser,
}: {
  user: AuthUser;
  onLogout: () => void;
  onUser: (u: AuthUser) => void;
}) {
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [today, setToday] = useState(0);
  const [freezes, setFreezes] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api.stats().then((s) => {
        onUser(s.user);
        setStreak(s.streak.currentStreak);
        setBest(s.streak.longestStreak);
        setToday(s.streak.todayXp);
        setFreezes(s.streak.freezesAvailable ?? 0);
      });
    }, [onUser])
  );

  async function logout() {
    await AsyncStorage.multiRemove(["xpi_token", "xpi_refresh"]);
    onLogout();
  }

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Walky Talky</Text>
      <Text style={styles.name}>{user.displayName}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.grid}>
        <Tile label="Level" value={String(user.level)} />
        <Tile label="XP" value={String(user.xp)} />
        <Tile label="Streak" value={`${streak}d`} />
        <Tile label="Freezes" value={String(freezes)} />
        <Tile label="Best" value={`${best}d`} />
        <Tile label="Today" value={`${today}/${user.dailyXpGoal}`} />
        <Tile label="TZ" value={user.timezone} />
      </View>
      <Pressable style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>LOG OUT</Text>
      </Pressable>
    </View>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", padding: 20 },
  brand: { fontSize: 24, fontWeight: "900", color: "#58cc02" },
  name: { marginTop: 16, fontSize: 28, fontWeight: "900" },
  email: { fontWeight: "700", color: "#777" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 },
  tile: {
    width: "47%",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 14,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#afafaf",
    textTransform: "uppercase",
  },
  tileValue: { marginTop: 4, fontSize: 18, fontWeight: "900" },
  btn: {
    marginTop: 28,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  btnText: { fontWeight: "900", color: "#777" },
});
