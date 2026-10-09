import { Pressable, StyleSheet, Text, View } from "react-native";

/** Light brand splash — not a heavy marketing shell; learn UI stays Duolingo-like. */
export function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Walky Talky</Text>
      <Text style={styles.line}>Micro-lessons that move with you.</Text>
      <Pressable style={styles.btn} onPress={onContinue}>
        <Text style={styles.btnText}>START LEARNING</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#eef6ea",
  },
  brand: {
    fontSize: 64,
    fontWeight: "900",
    color: "#58cc02",
    letterSpacing: -2,
  },
  line: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1712",
    maxWidth: 280,
  },
  btn: {
    marginTop: 32,
    alignSelf: "flex-start",
    backgroundColor: "#58cc02",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  btnText: { color: "#fff", fontWeight: "900" },
});
