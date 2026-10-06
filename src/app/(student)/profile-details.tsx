import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { account, signOut } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setErrorMessage(null);
    setIsSigningOut(true);

    const result = await signOut();

    setIsSigningOut(false);

    if (result.error) {
      setErrorMessage(result.error);
    }
  }

  const displayName = account?.fullName || "Library User";

  const roleLabel =
    account?.role === "student"
      ? "Student"
      : account?.role === "lecturer"
        ? "Lecturer"
        : "User";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("");

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop: insets.top + 20,
          },
        ]}
      >
        {/* Back to main profile menu */}
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={24}
              tintColor="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.headerTitle}>My Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "SL"}</Text>
        </View>

        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.card}>
          <ProfileInfoRow
            icon={{
              ios: "person.fill",
              android: "person",
              web: "person",
            }}
            label="Full Name"
            value={displayName}
          />

          <View style={styles.divider} />

          <ProfileInfoRow
            icon={{
              ios: "envelope.fill",
              android: "mail",
              web: "mail",
            }}
            label="Email"
            value={account?.email || "Not available"}
          />

          <View style={styles.divider} />

          <ProfileInfoRow
            icon={{
              ios: "person.text.rectangle",
              android: "badge",
              web: "badge",
            }}
            label="University ID"
            value={account?.universityId || "Not available"}
          />

          <View style={styles.divider} />

          <ProfileInfoRow
            icon={{
              ios: "phone.fill",
              android: "call",
              web: "call",
            }}
            label="Phone Number"
            value={account?.phone || "Not available"}
          />
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <SymbolView
              name={{
                ios: "exclamationmark.circle.fill",
                android: "error",
                web: "error",
              }}
              size={18}
              tintColor="#DC2626"
            />

            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Navigate to edit profile screen */}
        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        >
          <SymbolView
            name={{
              ios: "pencil",
              android: "edit",
              web: "edit",
            }}
            size={20}
            tintColor="#FFFFFF"
          />

          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>

        <Pressable
          style={[styles.logoutButton, isSigningOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={isSigningOut}
        >
          <SymbolView
            name={{
              ios: "rectangle.portrait.and.arrow.right",
              android: "logout",
              web: "logout",
            }}
            size={20}
            tintColor="#DC2626"
          />

          <Text style={styles.logoutText}>
            {isSigningOut ? "Signing out..." : "Log Out"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

type ProfileInfoRowProps = {
  icon: {
    ios: any;
    android: any;
    web: any;
  };
  label: string;
  value: string;
};

function ProfileInfoRow({ icon, label, value }: ProfileInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <SymbolView name={icon} size={20} tintColor="#2563EB" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  headerSpacer: {
    width: 40,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  roleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  errorBox: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
  },

  editButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  logoutButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },
});
