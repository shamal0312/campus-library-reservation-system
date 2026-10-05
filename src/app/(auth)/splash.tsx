import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/get-started");
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>SL</Text>
      </View>

      <Text style={styles.title}>SLIIT Library</Text>

      <Text style={styles.subtitle}>Learning Commons</Text>

      <View style={styles.divider} />

      <Text style={styles.description}>
        Books • Reading Seats • Study Rooms
      </Text>

      <View style={styles.bottomArea}>
        <View style={styles.loaderTrack}>
          <View style={styles.loaderFill} />
        </View>

        <Text style={styles.loadingText}>
          Preparing your library experience...
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  logoText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: "500",
    color: "#DBEAFE",
    textAlign: "center",
  },

  divider: {
    width: 48,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginVertical: 20,
  },

  description: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EAF2FF",
    textAlign: "center",
    letterSpacing: 0.4,
  },

  bottomArea: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 52,
    alignItems: "center",
  },

  loaderTrack: {
    width: "100%",
    maxWidth: 220,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },

  loaderFill: {
    width: "68%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "#DCE7FF",
    textAlign: "center",
  },
});
