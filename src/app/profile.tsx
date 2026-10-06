import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

const BACKGROUND = "#E7EDF6";
const BLUE = "#3B5CCC";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#AEB8C5";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  //  Logged-in account data
  const { account } = useAuth();

  const displayName = account?.fullName?.trim() || "Nimal Perera";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 28,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/*  Header */}
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
            size={24}
            tintColor={TEXT}
          />
        </Pressable>

        <Text style={styles.title}>My Profile</Text>

        <Pressable
          style={styles.headerButton}
          onPress={() => {
            // Settings screen will be connected later
            console.log("Open settings");
          }}
          hitSlop={8}
        >
          <SymbolView
            name={{
              ios: "gearshape",
              android: "settings",
              web: "settings",
            }}
            size={24}
            tintColor={TEXT}
          />
        </Pressable>
      </View>

      {/* Profile information */}
      <View style={styles.profileSection}>
        <Image
          source={
            account?.avatarUrl
              ? { uri: account.avatarUrl }
              : require("@/assets/images/app-logo.png")
          }
          style={styles.avatar}
          contentFit="cover"
        />

        <Text style={styles.name}>{displayName}</Text>

        <Text style={styles.role}>
          {account?.role
            ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
            : "Student"}
        </Text>
      </View>

      {/*  Personal Information
          Opens the profile details screen */}
      <ProfileMenuItem
        label="Personal Information"
        onPress={() => router.push("/profile-details")}
      />

      {/* Book reservation
          Route can be connected when their screen path is confirmed */}
      <ProfileMenuItem
        label="Book Reservation"
        onPress={() => {
          console.log("Open book reservation");
        }}
      />

      {/* Seat reservation
          Route can be connected when their screen path is confirmed */}
      <ProfileMenuItem
        label="Seat Reservation"
        onPress={() => {
          console.log("Open seat reservation");
        }}
      />

      {/* Room reservation
          Route can be connected when their screen path is confirmed */}
      <ProfileMenuItem
        label="Room reservation"
        onPress={() => {
          console.log("Open room reservation");
        }}
      />

      {/*  Change Password */}
      <ProfileMenuItem
        label="Change Password"
        onPress={() => router.push("/change-password")}
      />

      {/*  Settings / appearance */}
      <ProfileMenuItem
        label="App appearance"
        onPress={() => {
          console.log("Open app appearance");
        }}
      />

      {/* Notification settings */}
      <ProfileMenuItem
        label="Notification Preferences"
        onPress={() => {
          console.log("Open notification preferences");
        }}
      />
    </ScrollView>
  );
}

type ProfileMenuItemProps = {
  label: string;
  onPress: () => void;
};

function ProfileMenuItem({ label, onPress }: ProfileMenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.menuText}>{label}</Text>

      <SymbolView
        name={{
          ios: "chevron.right",
          android: "chevron_right",
          web: "chevron_right",
        }}
        size={20}
        tintColor={TEXT}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: TEXT,
  },

  profileSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#FFFFFF",
  },

  name: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "500",
    color: TEXT,
  },

  role: {
    marginTop: -1,
    fontSize: 17,
    color: MUTED,
  },

  menuItem: {
    minHeight: 52,

    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 7,

    paddingHorizontal: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 9,
  },

  menuItemPressed: {
    opacity: 0.7,
  },

  menuText: {
    flex: 1,
    fontSize: 17,
    color: TEXT,
  },
});
