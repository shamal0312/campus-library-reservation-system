import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomNavBar from "@/components/BottomNavBar";
import AppScreen from "@/components/themes/AppScreen";
import { useAppearance } from "@/contexts/appearance-context";

export default function AllReservationsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();

  return (
    <AppScreen>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={20}
              tintColor={theme.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              All Reservations
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Manage your library reservations
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionLabel,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          RESERVATION CATEGORIES
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.categoryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            pressed && styles.categoryCardPressed,
          ]}
          onPress={() => router.push("/booking/reservations")}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: theme.primarySoft,
              },
            ]}
          >
            <SymbolView
              name={{
                ios: "chair.fill",
                android: "chair",
                web: "chair",
              }}
              size={28}
              tintColor={theme.primary}
            />
          </View>

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Seat & Room Reservations
            </Text>

            <Text
              style={[
                styles.cardDescription,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              View and manage your seat and study room bookings.
            </Text>

            <View style={styles.cardTags}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.primarySoft,
                  },
                ]}
              >
                <SymbolView
                  name={{
                    ios: "chair.fill",
                    android: "chair",
                    web: "chair",
                  }}
                  size={13}
                  tintColor={theme.primary}
                />

                <Text
                  style={[
                    styles.tagText,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  Seats
                </Text>
              </View>

              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.primarySoft,
                  },
                ]}
              >
                <SymbolView
                  name={{
                    ios: "door.left.hand.open",
                    android: "meeting_room",
                    web: "meeting_room",
                  }}
                  size={13}
                  tintColor={theme.primary}
                />

                <Text
                  style={[
                    styles.tagText,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  Study Rooms
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.arrowBox,
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
              size={20}
              tintColor={theme.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.categoryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            pressed && styles.categoryCardPressed,
          ]}
          onPress={() => router.push("/(student)/book/reservations" as never)}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: theme.primarySoft,
              },
            ]}
          >
            <SymbolView
              name={{
                ios: "book.fill",
                android: "menu_book",
                web: "menu_book",
              }}
              size={28}
              tintColor={theme.primary}
            />
          </View>

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Book Reservations
            </Text>

            <Text
              style={[
                styles.cardDescription,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              View your reserved books and manage existing reservations.
            </Text>

            <View style={styles.cardTags}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.primarySoft,
                  },
                ]}
              >
                <SymbolView
                  name={{
                    ios: "book.fill",
                    android: "menu_book",
                    web: "menu_book",
                  }}
                  size={13}
                  tintColor={theme.primary}
                />

                <Text
                  style={[
                    styles.tagText,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  Books
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.arrowBox,
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
              size={20}
              tintColor={theme.textSecondary}
            />
          </View>
        </Pressable>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.primarySoft,
            },
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              {
                backgroundColor: theme.surface,
              },
            ]}
          >
            <SymbolView
              name={{
                ios: "info.circle.fill",
                android: "info",
                web: "info",
              }}
              size={20}
              tintColor={theme.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Reservation Management
            </Text>

            <Text
              style={[
                styles.infoText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Select a reservation category above to view more details and
              manage your bookings.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar active="home" />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  pressed: {
    opacity: 0.75,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  categoryCard: {
    minHeight: 160,
    borderRadius: 22,
    borderWidth: 1,

    padding: 16,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  categoryCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 11,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 12,
  },

  tagText: {
    fontSize: 10,
    fontWeight: "700",
  },

  arrowBox: {
    width: 38,
    height: 38,
    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 10,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",

    padding: 15,

    borderRadius: 18,

    marginTop: 8,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  infoText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});
