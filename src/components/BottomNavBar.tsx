import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppearance } from "@/contexts/appearance-context";

type BottomNavKey = "home" | "seat" | "books" | "profile";

type BottomNavBarProps = {
  active: BottomNavKey;
};

type BottomNavItemProps = {
  label: string;
  ios: "house.fill" | "chair.fill" | "book.fill" | "person.fill";
  android: "home" | "chair" | "menu_book" | "person";
  active?: boolean;
  onPress: () => void;
};

export default function BottomNavBar({ active }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();

  return (
    <View
      style={[
        styles.bottomNav,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: theme.navBackground,
          borderTopColor: theme.border,
        },
      ]}
    >
      <BottomNavItem
        label="Home"
        ios="house.fill"
        android="home"
        active={active === "home"}
        onPress={() => router.replace("/account")}
      />

      <BottomNavItem
        label="Seat"
        ios="chair.fill"
        android="chair"
        active={active === "seat"}
        onPress={() => router.push("/booking")}
      />

      <BottomNavItem
        label="Books"
        ios="book.fill"
        android="menu_book"
        active={active === "books"}
        onPress={() => router.push("/(student)/book" as never)}
      />

      <BottomNavItem
        label="Profile"
        ios="person.fill"
        android="person"
        active={active === "profile"}
        onPress={() => router.push("/account/profile")}
      />
    </View>
  );
}

function BottomNavItem({
  label,
  ios,
  android,
  active = false,
  onPress,
}: BottomNavItemProps) {
  const { theme } = useAppearance();

  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <View
        style={[
          styles.navIconWrapper,
          active && {
            backgroundColor: theme.primarySoft,
          },
        ]}
      >
        <SymbolView
          name={{
            ios,
            android,
            web: android,
          }}
          size={22}
          tintColor={active ? theme.primary : theme.iconInactive}
        />
      </View>

      <Text
        style={[
          styles.navLabel,
          {
            color: active ? theme.primary : theme.iconInactive,
            fontWeight: active ? "800" : "600",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 70,
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },

  navIconWrapper: {
    width: 42,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    fontSize: 10,
  },
});
