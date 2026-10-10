import { Image } from "expo-image";

import { router } from "expo-router";

import { SymbolView } from "expo-symbols";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomNavBar from "@/components/BottomNavBar";

import { useAppearance } from "@/contexts/appearance-context";

import { useAuth } from "@/contexts/auth-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const { account } = useAuth();

  const { theme } = useAppearance();

  const displayName = account?.fullName?.trim() || "Nimal Perera";

  const displayRole = account?.role
    ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
    : "Student";

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={[
              styles.headerButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
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
              tintColor={theme.text}
            />
          </Pressable>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            My Profile
          </Text>

          <Pressable
            style={[
              styles.headerButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => {
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
              size={22}
              tintColor={theme.text}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarOuter,
              {
                backgroundColor: theme.primarySoft,
              },
            ]}
          >
            <Image
              source={
                account?.avatarUrl
                  ? { uri: account.avatarUrl }
                  : require("@/assets/images/app-logo.png")
              }
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.surface,
                },
              ]}
              contentFit="cover"
            />
          </View>

          <Text
            style={[
              styles.name,
              {
                color: theme.text,
              },
            ]}
          >
            {displayName}
          </Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: theme.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                styles.role,
                {
                  color: theme.primary,
                },
              ]}
            >
              {displayRole}
            </Text>
          </View>

          <Pressable
            style={[
              styles.editProfileButton,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => router.push("/account/edit-profile")}
          >
            <SymbolView
              name={{
                ios: "pencil",
                android: "edit",
                web: "edit",
              }}
              size={16}
              tintColor={theme.primary}
            />

            <Text
              style={[
                styles.editProfileText,
                {
                  color: theme.primary,
                },
              ]}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Account
        </Text>

        <View
          style={[
            styles.menuGroup,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ProfileMenuItem
            label="Personal Information"
            icon={{
              ios: "person.text.rectangle",
              android: "badge",
              web: "badge",
            }}
            onPress={() => router.push("/account/profile-details")}
          />

          <Divider />

          <ProfileMenuItem
            label="Change Password"
            icon={{
              ios: "lock.fill",
              android: "lock",
              web: "lock",
            }}
            onPress={() => router.push("/account/change-password")}
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Reservations
        </Text>

        <View
          style={[
            styles.menuGroup,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ProfileMenuItem
            label="Book Reservation"
            icon={{
              ios: "book.fill",
              android: "menu_book",
              web: "menu_book",
            }}
            onPress={() => {
              console.log("Open book reservation");
            }}
          />

          <Divider />

          <ProfileMenuItem
            label="Seat Reservation"
            icon={{
              ios: "chair.fill",
              android: "chair",
              web: "chair",
            }}
            onPress={() => {
              console.log("Open seat reservation");
            }}
          />

          <Divider />

          <ProfileMenuItem
            label="Room Reservation"
            icon={{
              ios: "door.left.hand.open",
              android: "meeting_room",
              web: "meeting_room",
            }}
            onPress={() => {
              console.log("Open room reservation");
            }}
          />
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Preferences
        </Text>

        <View
          style={[
            styles.menuGroup,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <ProfileMenuItem
            label="App Appearance"
            icon={{
              ios: "paintbrush.fill",
              android: "palette",
              web: "palette",
            }}
            onPress={() => router.push("/account/app-appearance")}
          />

          <Divider />

          <ProfileMenuItem
            label="Notification Preferences"
            icon={{
              ios: "bell.badge.fill",
              android: "notifications",
              web: "notifications",
            }}
            onPress={() => router.push("/account/notification-preferences")}
          />
        </View>
      </ScrollView>

      <BottomNavBar active="profile" />
    </View>
  );
}

type MenuIcon = {
  ios:
    | "person.text.rectangle"
    | "lock.fill"
    | "book.fill"
    | "chair.fill"
    | "door.left.hand.open"
    | "paintbrush.fill"
    | "bell.badge.fill";

  android:
    | "badge"
    | "lock"
    | "menu_book"
    | "chair"
    | "meeting_room"
    | "palette"
    | "notifications";

  web:
    | "badge"
    | "lock"
    | "menu_book"
    | "chair"
    | "meeting_room"
    | "palette"
    | "notifications";
};

type ProfileMenuItemProps = {
  label: string;
  icon: MenuIcon;
  onPress: () => void;
};

function ProfileMenuItem({ label, icon, onPress }: ProfileMenuItemProps) {
  const { theme } = useAppearance();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && {
          backgroundColor: theme.surfaceSecondary,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIconBox,
          {
            backgroundColor: theme.primarySoft,
          },
        ]}
      >
        <SymbolView name={icon} size={20} tintColor={theme.primary} />
      </View>

      <Text
        style={[
          styles.menuText,
          {
            color: theme.text,
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.chevronBox,
          {
            backgroundColor: theme.surfaceSecondary,
          },
        ]}
      >
        <SymbolView
          name={{
            ios: "chevron.right",
            android: "chevron_right",
            web: "chevron_right",
          }}
          size={18}
          tintColor={theme.primary}
        />
      </View>
    </Pressable>
  );
}

function Divider() {
  const { theme } = useAppearance();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme.border,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
  },

  profileCard: {
    borderRadius: 24,

    paddingVertical: 22,
    paddingHorizontal: 20,

    alignItems: "center",

    borderWidth: 1,

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

    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 88,
    height: 88,

    borderRadius: 44,
  },

  name: {
    marginTop: 13,

    fontSize: 22,
    fontWeight: "800",

    textAlign: "center",
  },

  roleBadge: {
    marginTop: 7,

    paddingHorizontal: 14,
    paddingVertical: 5,

    borderRadius: 14,
  },

  role: {
    fontSize: 12,
    fontWeight: "700",
  },

  editProfileButton: {
    marginTop: 15,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 16,
    paddingVertical: 9,

    borderRadius: 18,

    borderWidth: 1,
  },

  editProfileText: {
    fontSize: 13,
    fontWeight: "700",
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 9,

    fontSize: 16,
    fontWeight: "800",
  },

  menuGroup: {
    borderRadius: 20,

    borderWidth: 1,

    overflow: "hidden",

    marginBottom: 22,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  menuItem: {
    minHeight: 64,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
  },

  menuIconBox: {
    width: 40,
    height: 40,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  menuText: {
    flex: 1,

    fontSize: 15,
    fontWeight: "600",
  },

  chevronBox: {
    width: 32,
    height: 32,

    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    marginLeft: 66,
  },
});
