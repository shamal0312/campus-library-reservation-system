import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
  type NotificationItem,
} from "@/services/notifications";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  function handleDeleteNotification(item: NotificationItem) {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id);
            setErrorMessage(null);

            const result = await deleteNotification(item.id);

            setDeletingId(null);

            if (!result.success) {
              setErrorMessage(result.error ?? "Could not delete notification.");
              return;
            }

            setNotifications((current) =>
              current.filter((notification) => notification.id !== item.id),
            );
          },
        },
      ],
    );
  }

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
            size={20}
            tintColor={NAVY}
          />
        </Pressable>
      </View>

      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <SymbolView
            name={{
              ios: "bell.badge.fill",
              android: "notifications",
              web: "notifications",
            }}
            size={30}
            tintColor={BLUE}
          />
        </View>

        <Text style={styles.introTitle}>Library Notifications</Text>

        <Text style={styles.introText}>
          Stay updated with your reservations, reminders and library notices.
        </Text>
      </View>

      {!isLoading && !errorMessage && notifications.length > 0 ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{notifications.length}</Text>
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.centerState}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="large" color={BLUE} />
          </View>

          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <SymbolView
              name={{
                ios: "exclamationmark.circle.fill",
                android: "error",
                web: "error",
              }}
              size={30}
              tintColor="#DC2626"
            />
          </View>

          <Text style={styles.errorTitle}>Something went wrong</Text>

          <Text style={styles.errorText}>{errorMessage}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            onPress={loadNotifications}
          >
            <SymbolView
              name={{
                ios: "arrow.clockwise",
                android: "refresh",
                web: "refresh",
              }}
              size={18}
              tintColor="#FFFFFF"
            />

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
              size={31}
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
            <View
              key={item.id}
              style={[styles.card, !item.is_read && styles.unreadCard]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.notificationContent,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => handleNotificationPress(item)}
              >
                <View
                  style={[
                    styles.iconBox,
                    !item.is_read && styles.unreadIconBox,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "bell.fill",
                      android: "notifications",
                      web: "notifications",
                    }}
                    size={21}
                    tintColor={BLUE}
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text
                      style={[
                        styles.cardTitle,
                        !item.is_read && styles.unreadTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    {!item.is_read ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                  </Text>

                  <View style={styles.timeRow}>
                    <SymbolView
                      name={{
                        ios: "clock",
                        android: "schedule",
                        web: "schedule",
                      }}
                      size={13}
                      tintColor={MUTED}
                    />

                    <Text style={styles.time}>
                      {formatNotificationTime(item.created_at)}
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                ]}
                onPress={() => handleDeleteNotification(item)}
                disabled={deletingId === item.id}
                hitSlop={6}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <SymbolView
                    name={{
                      ios: "trash",
                      android: "delete",
                      web: "delete",
                    }}
                    size={19}
                    tintColor="#DC2626"
                  />
                )}
              </Pressable>
            </View>
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
    paddingHorizontal: 20,
    flexGrow: 1,
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

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
  },

  introCard: {
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

  introIcon: {
    width: 70,
    height: 70,

    borderRadius: 23,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  introTitle: {
    marginTop: 13,

    fontSize: 19,
    fontWeight: "800",

    color: NAVY,
  },

  introText: {
    marginTop: 6,

    maxWidth: 290,

    fontSize: 13,
    lineHeight: 19,

    textAlign: "center",

    color: MUTED,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",

    color: NAVY,
  },

  countBadge: {
    marginLeft: 8,

    minWidth: 24,
    height: 24,

    paddingHorizontal: 7,

    borderRadius: 12,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 11,
    fontWeight: "800",

    color: BLUE,
  },

  list: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 14,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,

    elevation: 2,
  },

  unreadCard: {
    backgroundColor: "#F8FBFF",
    borderColor: "#CFE5FF",
  },

  cardPressed: {
    opacity: 0.75,
  },

  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  deleteButton: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FEF2F2",

    marginLeft: 4,
  },

  deleteButtonPressed: {
    backgroundColor: "#FEE2E2",
  },

  iconBox: {
    width: 46,
    height: 46,

    borderRadius: 15,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",
  },

  unreadIconBox: {
    backgroundColor: LIGHT_BLUE,
  },

  cardContent: {
    flex: 1,

    marginLeft: 12,
    marginRight: 8,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    flex: 1,

    fontSize: 15,
    fontWeight: "700",

    color: NAVY,
  },

  unreadTitle: {
    fontWeight: "800",
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

    fontSize: 12,
    lineHeight: 18,

    color: MUTED,
  },

  timeRow: {
    marginTop: 8,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  time: {
    fontSize: 11,

    color: MUTED,
  },

  centerState: {
    flex: 1,

    minHeight: 370,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 28,
  },

  loadingIcon: {
    width: 74,
    height: 74,

    borderRadius: 24,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: BORDER,

    elevation: 2,
  },

  stateText: {
    marginTop: 10,

    maxWidth: 280,

    fontSize: 13,
    lineHeight: 20,

    color: MUTED,

    textAlign: "center",
  },

  emptyIcon: {
    width: 76,
    height: 76,

    borderRadius: 25,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 15,

    fontSize: 18,
    fontWeight: "800",

    color: NAVY,
  },

  errorIcon: {
    width: 72,
    height: 72,

    borderRadius: 24,

    backgroundColor: "#FEF2F2",

    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    marginTop: 15,

    fontSize: 18,
    fontWeight: "800",

    color: NAVY,
  },

  errorText: {
    marginTop: 7,

    fontSize: 13,
    lineHeight: 20,

    color: "#DC2626",

    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,

    minHeight: 44,

    paddingHorizontal: 18,

    borderRadius: 14,

    backgroundColor: BLUE,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  retryButtonPressed: {
    opacity: 0.85,
  },

  retryButtonText: {
    color: "#FFFFFF",

    fontSize: 14,
    fontWeight: "700",
  },
});
