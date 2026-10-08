import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";

export default function ProfileDetailsScreen() {
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
      return;
    }

    router.replace("/register");
  }

  const displayName = account?.fullName || "Library User";

  const roleLabel =
    account?.role === "student"
      ? "Student"
      : account?.role === "lecturer"
        ? "Lecturer"
        : "User";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <SymbolView
            name={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "arrow_back",
            }}
            size={22}
            tintColor={NAVY}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Personal Information</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarOuter}>
          <Image
            source={
              account?.avatarUrl
                ? { uri: account.avatarUrl }
                : require("@/assets/images/app-logo.png")
            }
            style={styles.avatar}
            contentFit="cover"
          />
        </View>

        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

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

      <Pressable
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/account/edit-profile")}
      >
        <SymbolView
          name={{
            ios: "pencil",
            android: "edit",
            web: "edit",
          }}
          size={19}
          tintColor="#FFFFFF"
        />

        <Text style={styles.editButtonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutPressed,
          isSigningOut && styles.disabledButton,
        ]}
        onPress={handleLogout}
        disabled={isSigningOut}
      >
        <SymbolView
          name={{
            ios: "rectangle.portrait.and.arrow.right",
            android: "logout",
            web: "logout",
          }}
          size={19}
          tintColor="#DC2626"
        />

        <Text style={styles.logoutText}>
          {isSigningOut ? "Signing out..." : "Log Out"}
        </Text>
      </Pressable>
    </ScrollView>
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
        <SymbolView name={icon} size={20} tintColor={BLUE} />
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
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 20,
  },

  headerButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  headerSpacer: {
    width: 42,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: NAVY,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingVertical: 22,
    paddingHorizontal: 20,

    alignItems: "center",

    borderWidth: 1,
    borderColor: BORDER,

    marginBottom: 24,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,

    elevation: 3,
  },

  avatarOuter: {
    width: 96,
    height: 96,

    borderRadius: 48,

    padding: 4,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 88,
    height: 88,

    borderRadius: 44,

    backgroundColor: "#FFFFFF",
  },

  name: {
    marginTop: 13,

    fontSize: 22,
    fontWeight: "800",

    color: NAVY,

    textAlign: "center",
  },

  roleBadge: {
    marginTop: 7,

    paddingHorizontal: 14,
    paddingVertical: 5,

    borderRadius: 14,

    backgroundColor: LIGHT_BLUE,
  },

  roleText: {
    fontSize: 12,
    fontWeight: "700",

    color: BLUE,
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 9,

    fontSize: 16,
    fontWeight: "800",

    color: NAVY,
  },

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 15,
  },

  infoIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,

    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 12,

    color: MUTED,

    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "700",

    color: NAVY,
  },

  divider: {
    height: 1,

    backgroundColor: "#EEF2F6",

    marginLeft: 54,
  },

  errorBox: {
    marginTop: 16,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    padding: 12,

    borderRadius: 14,

    backgroundColor: "#FEF2F2",

    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,

    fontSize: 13,

    color: "#DC2626",
  },

  editButton: {
    marginTop: 22,

    height: 52,

    borderRadius: 16,

    backgroundColor: BLUE,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    shadowColor: "#2F80ED",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 3,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: "700",

    color: "#FFFFFF",
  },

  logoutButton: {
    marginTop: 12,

    height: 52,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#FECACA",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  logoutPressed: {
    backgroundColor: "#FFF7F7",
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
