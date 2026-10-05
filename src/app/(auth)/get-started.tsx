import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <LinearGradient
        colors={["#EFF6FF", "#FFFFFF", "#F8FAFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.topSection}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <SymbolView
                name={{
                  ios: "books.vertical.fill",
                  android: "menu_book",
                  web: "menu_book",
                }}
                size={28}
                tintColor="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>SLIIT Library</Text>
              <Text style={styles.brandSubtitle}>Learning Commons</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroIconCircle}>
                <SymbolView
                  name={{
                    ios: "books.vertical.fill",
                    android: "local_library",
                    web: "local_library",
                  }}
                  size={46}
                  tintColor="#FFFFFF"
                />
              </View>

              <Text style={styles.heroTitle}>Your Library, Simplified</Text>

              <Text style={styles.heroDescription}>
                Reserve books, find available reading seats, and request study
                rooms from one place.
              </Text>

              <View style={styles.featureRow}>
                <View style={styles.featureChip}>
                  <SymbolView
                    name={{
                      ios: "book.fill",
                      android: "book",
                      web: "book",
                    }}
                    size={17}
                    tintColor="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Books</Text>
                </View>

                <View style={styles.featureChip}>
                  <SymbolView
                    name={{
                      ios: "chair.fill",
                      android: "event_seat",
                      web: "event_seat",
                    }}
                    size={17}
                    tintColor="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Seats</Text>
                </View>

                <View style={styles.featureChip}>
                  <SymbolView
                    name={{
                      ios: "person.3.fill",
                      android: "groups",
                      web: "groups",
                    }}
                    size={17}
                    tintColor="#FFFFFF"
                  />
                  <Text style={styles.featureText}>Study Rooms</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.welcomeTitle}>Welcome to SLIIT Library</Text>

          <Text style={styles.welcomeDescription}>
            Access library services quickly and manage your reservations with
            your SLIIT account.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/login")}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>

              <SymbolView
                name={{
                  ios: "arrow.right",
                  android: "arrow_forward",
                  web: "arrow_forward",
                }}
                size={20}
                tintColor="#FFFFFF"
              />
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.createAccountButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.createAccountText}>Create a New Account</Text>
          </Pressable>

          <Text style={styles.accountHint}>
            Use your SLIIT university email to continue
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  background: {
    flex: 1,
    paddingHorizontal: 22,
  },

  topSection: {
    flex: 1,
    paddingTop: 24,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },

  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  brandSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },

  heroCard: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#1D4ED8",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },

  heroGradient: {
    minHeight: 330,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  heroIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },

  heroDescription: {
    marginTop: 12,
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 23,
    color: "#EAF2FF",
    textAlign: "center",
  },

  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 26,
  },

  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  bottomSection: {
    paddingTop: 28,
    paddingBottom: 24,
  },

  welcomeTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  welcomeDescription: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  primaryButton: {
    height: 54,
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
  },

  primaryGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  createAccountButton: {
    height: 52,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE4F2",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  createAccountText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },

  accountHint: {
    marginTop: 16,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
});
