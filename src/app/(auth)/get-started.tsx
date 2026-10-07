import { router } from "expo-router";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/library-aisle.jpg")}
          style={styles.libraryImage}
          resizeMode="cover"
        />

        <View style={styles.contentSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/app-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Smart Library</Text>

          <Text style={styles.subtitle}>Your Learning Space</Text>

          <Text style={styles.tagline}>Anytime , Anywhere</Text>

          <View style={styles.spacer} />

          <Pressable
            style={styles.button}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>

          <Text style={styles.footerText}>
            Knowledge for a Brighter Tomorrow
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E5EBF4",
  },

  container: {
    flex: 1,
    backgroundColor: "#E5EBF4",
  },

  libraryImage: {
    width: "100%",
    height: "46%",
  },

  contentSection: {
    flex: 1,
    marginTop: -48,
    paddingTop: 62,
    paddingHorizontal: 26,
    paddingBottom: 24,
    alignItems: "center",

    backgroundColor: "#E5EBF4",

    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },

  logoContainer: {
    position: "absolute",
    top: -40,

    width: 82,
    height: 82,

    borderRadius: 24,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#D8E0EC",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 6,
  },

  logo: {
    width: 60,
    height: 60,
  },

  title: {
    marginTop: 4,

    fontSize: 24,
    fontWeight: "800",

    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,

    fontSize: 15,
    fontWeight: "500",

    color: "#374151",
    textAlign: "center",
  },

  tagline: {
    marginTop: 9,

    fontSize: 14,
    fontWeight: "400",

    color: "#374151",
    textAlign: "center",
  },

  spacer: {
    flex: 1,
  },

  button: {
    width: "100%",
    height: 54,

    borderRadius: 11,

    backgroundColor: "#3F5FBF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#3F5FBF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,

    elevation: 4,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "700",

    color: "#FFFFFF",
  },

  footerText: {
    marginTop: 15,

    fontSize: 10,
    fontWeight: "400",

    color: "#374151",
    textAlign: "center",
  },
});
