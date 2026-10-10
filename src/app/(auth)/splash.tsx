import { Image } from "expo-image";
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
      colors={["#EAF4FF", "#DCEBFF", "#CFE3FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoCard}>
        <Image
          source={require("@/assets/images/app-logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <Text style={styles.title}>Smart Library</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#EAF4FF",
  },

  logoCard: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,

    shadowColor: "#7DA7D9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  logo: {
    width: 90,
    height: 90,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2F5DA8",
    letterSpacing: 0.4,
  },
});
