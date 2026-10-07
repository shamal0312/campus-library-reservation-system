import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    getNotifications,
    markNotificationAsRead,
    type NotificationItem,
} from "@/services/notifications";

const BACKGROUND = "#E7EDF6";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BLUE = "#3B5CCC";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await getNotifications();

    if (result.error) {
      setErrorMessage(result.error);
      setNotifications([]);
    } else {
      setNotifications(result.notifications);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleNotificationPress(item: NotificationItem) {
    if (!item.is_read) {
      const result = await markNotificationAsRead(item.id);

      if (!result.error) {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === item.id
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification,
          ),
        );
      }
    }

    router.push({
      pathname: "/account/notification-details",
      params: {
        title: item.title,
        message: item.message,
        time: formatNotificationTime(item.created_at),
      },
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 30,
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
            size={24}
            tintColor={TEXT}
          />
        </Pressable>

        <Text style={styles.title}>Notifications</Text>

        <Pressable
          style={styles.headerButton}
          onPress={loadNotifications}
          hitSlop={8}
        >
          <SymbolView
            name={{
              ios: "arrow.clockwise",
              android: "refresh",
              web: "refresh",
            }}
            size={21}
            tintColor={TEXT}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage}</Text>

          <Pressable style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIcon}>
            <SymbolView
              name={{
                ios: "bell.slash",
                android: "notifications_off",
                web: "notifications_off",
              }}
              size={32}
              tintColor={BLUE}
            />
          </View>

          <Text style={styles.emptyTitle}>No Notifications</Text>

          <Text style={styles.stateText}>
            Your reservation notifications will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.card,
                !item.is_read && styles.unreadCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.iconCircle}>
                <SymbolView
                  name={{
                    ios: "bell.fill",
                    android: "notifications",
                    web: "notifications",
                  }}
                  size={22}
                  tintColor={BLUE}
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  {!item.is_read ? <View style={styles.unreadDot} /> : null}
                </View>

                <Text style={styles.message}>{item.message}</Text>

                <Text style={styles.time}>
                  {formatNotificationTime(item.created_at)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function formatNotificationTime(createdAt: string) {
  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return "";
  }

  const now = new Date();
  const difference = now.getTime() - createdDate.getTime();

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return createdDate.toLocaleDateString();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 18,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: TEXT,
  },

  list: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D9E0EA",
  },

  unreadCard: {
    backgroundColor: "#F4F7FF",
  },

  cardPressed: {
    opacity: 0.75,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginLeft: 8,
  },

  message: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },

  time: {
    marginTop: 8,
    fontSize: 11,
    color: "#9CA3AF",
  },

  centerState: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  stateText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DCE6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#DC2626",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 14,
    backgroundColor: BLUE,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
