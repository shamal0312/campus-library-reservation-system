import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

const BLUE = "#3B5CCC";
const BACKGROUND = "#E7EDF6";
const FIELD_BACKGROUND = "#DDE3EA";
const TEXT = "#111827";
const MUTED = "#6B7280";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();

  const [fullName, setFullName] = useState(account?.fullName ?? "");
  const [userId] = useState(account?.universityId ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");

  function handleSaveChanges() {
    console.log({
      fullName,
      userId,
      email,
      phone,
    });
  }

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
      <View style={styles.header}>
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
            size={22}
            tintColor={TEXT}
          />
        </Pressable>

        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={
              account?.avatarUrl
                ? { uri: account.avatarUrl }
                : require("@/assets/images/app-logo.png")
            }
            style={styles.avatar}
          />

          <Pressable style={styles.editAvatarButton}>
            <SymbolView
              name={{
                ios: "pencil",
                android: "edit",
                web: "edit",
              }}
              size={16}
              tintColor={BLUE}
            />
          </Pressable>
        </View>

        <Text style={styles.profileName}>{fullName || "Nimal Perera"}</Text>

        <Text style={styles.roleText}>
          {account?.role
            ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
            : "Student"}
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Full Name</Text>

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
          placeholderTextColor={MUTED}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>User ID</Text>

        <View style={styles.readOnlyField}>
          <Text
            style={[styles.readOnlyText, !userId && styles.placeholderText]}
          >
            {userId || "IT23764556"}
          </Text>

          <SymbolView
            name={{
              ios: "lock.fill",
              android: "lock",
              web: "lock",
            }}
            size={15}
            tintColor="#A0A8B5"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          placeholderTextColor={MUTED}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Phone Number</Text>

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor={MUTED}
          keyboardType="phone-pad"
        />
      </View>

      <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: TEXT,
  },

  headerSpacer: {
    width: 40,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 18,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFFFFF",
  },

  editAvatarButton: {
    position: "absolute",
    right: -2,
    bottom: 3,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5DCE5",
  },

  profileName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "500",
    color: TEXT,
  },

  roleText: {
    marginTop: -1,
    fontSize: 16,
    color: MUTED,
  },

  fieldGroup: {
    marginBottom: 13,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT,
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderRadius: 6,
    backgroundColor: FIELD_BACKGROUND,
    borderWidth: 1,
    borderColor: "#B9C2CE",
    paddingHorizontal: 12,
    fontSize: 15,
    color: TEXT,
  },

  readOnlyField: {
    height: 50,
    borderRadius: 6,
    backgroundColor: FIELD_BACKGROUND,
    borderWidth: 1,
    borderColor: "#B9C2CE",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  readOnlyText: {
    fontSize: 15,
    color: "#6B7280",
  },

  placeholderText: {
    color: "#8B93A1",
  },

  saveButton: {
    height: 54,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
