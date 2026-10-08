import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND = "#F4F7FB";
const PRIMARY = "#4F6FD8";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#E1E7F0";

export default function GetStartedScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const heroHeight = Math.min(Math.max(height * 0.4, 240), 330);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Image
        source={require("@/assets/images/library-aisle.jpg")}
        style={[
          styles.libraryImage,
          {
            height: heroHeight,
          },
        ]}
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

        <View style={styles.textSection}>
          <Text style={styles.title}>Smart Library</Text>

          <Text style={styles.subtitle}>Your Learning Space</Text>

          <Text style={styles.tagline}>Anytime, Anywhere</Text>

          <Text style={styles.description}>
            Reserve your study space and manage your library activities easily
            in one place.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>

        <Text style={styles.footerText}>Knowledge for a Brighter Tomorrow</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: BACKGROUND,
  },

  libraryImage: {
    width: "100%",
  },

  contentSection: {
    flexGrow: 1,

    marginTop: -36,

    paddingTop: 62,
    paddingHorizontal: 24,
    paddingBottom: 20,

    alignItems: "center",

    backgroundColor: BACKGROUND,

    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },

  logoContainer: {
    position: "absolute",
    top: -42,

    width: 84,
    height: 84,

    borderRadius: 24,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#64748B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 5,
  },

  logo: {
    width: 60,
    height: 60,
  },

  textSection: {
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: TEXT,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 7,

    fontSize: 16,
    fontWeight: "600",

    color: PRIMARY,
    textAlign: "center",
  },

  tagline: {
    marginTop: 6,

    fontSize: 14,
    fontWeight: "500",

    color: MUTED,
    textAlign: "center",
  },

  description: {
    marginTop: 18,

    maxWidth: 330,

    fontSize: 13,
    lineHeight: 20,

    color: MUTED,
    textAlign: "center",
  },

  button: {
    width: "100%",
    height: 54,

    marginTop: 30,

    borderRadius: 14,

    backgroundColor: PRIMARY,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,

    elevation: 4,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  footerText: {
    marginTop: 17,

    fontSize: 11,
    fontWeight: "500",

    color: MUTED,
    textAlign: "center",
  },
});
