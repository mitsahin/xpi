import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, type AuthUser } from "../api";

export function AuthScreen({
  onAuth,
}: {
  onAuth: (token: string, user: AuthUser) => void;
}) {
  const [email, setEmail] = useState("demo@x-pi.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await api.login({ email, password });
      const access = res.accessToken || res.token;
      await AsyncStorage.setItem("xpi_token", access);
      if (res.refreshToken) {
        await AsyncStorage.setItem("xpi_refresh", res.refreshToken);
      }
      onAuth(access, res.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>x-pi</Text>
      <Text style={styles.sub}>Learn in streaks. Level up daily.</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.btn} onPress={login} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>LOG IN</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f7fff0",
  },
  brand: {
    fontSize: 56,
    fontWeight: "900",
    color: "#58cc02",
    textAlign: "center",
  },
  sub: {
    marginTop: 8,
    marginBottom: 28,
    textAlign: "center",
    fontWeight: "700",
    color: "#777",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontWeight: "700",
  },
  btn: {
    backgroundColor: "#58cc02",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  error: { color: "#ff4b4b", fontWeight: "700", marginBottom: 8 },
});
