import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
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

  const { account, updateProfile, uploadAvatar } = useAuth();

  const [fullName, setFullName] = useState(account?.fullName ?? "");

  const [userId] = useState(account?.universityId ?? "");

  const [email, setEmail] = useState(account?.email ?? "");

  const [phone, setPhone] = useState(account?.phone ?? "");

  const [avatarUri, setAvatarUri] = useState(account?.avatarUrl ?? "");

  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const [avatarMimeType, setAvatarMimeType] = useState("image/jpeg");

  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePickAvatar() {
    setErrorMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photos to update your profile picture.",
      );

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,

      aspect: [1, 1],

      quality: 0.8,

      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const selectedImage = result.assets[0];

    if (!selectedImage) {
      setErrorMessage("Could not select the image.");

      return;
    }

    setAvatarUri(selectedImage.uri);

    if (selectedImage.base64) {
      setAvatarBase64(selectedImage.base64);
    } else {
      setAvatarBase64(null);
    }

    if (selectedImage.mimeType) {
      setAvatarMimeType(selectedImage.mimeType);
    } else {
      setAvatarMimeType("image/jpeg");
    }
  }

  async function handleSaveChanges() {
    setErrorMessage(null);

    const trimmedFullName = fullName.trim();

    const trimmedEmail = email.trim();

    const trimmedPhone = phone.trim();

    if (!trimmedFullName) {
      setErrorMessage("Please enter your full name.");

      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email.");

      return;
    }

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");

      return;
    }

    if (!trimmedPhone) {
      setErrorMessage("Please enter your phone number.");

      return;
    }

    setIsSaving(true);

    let avatarUrl = account?.avatarUrl ?? undefined;

    const selectedNewAvatar = avatarUri && avatarUri !== account?.avatarUrl;

    if (selectedNewAvatar) {
      if (!avatarBase64) {
        setIsSaving(false);

        setErrorMessage("Could not prepare the selected image for upload.");

        return;
      }

      const avatarResult = await uploadAvatar(avatarBase64, avatarMimeType);

      if (avatarResult.error || !avatarResult.avatarUrl) {
        setIsSaving(false);

        setErrorMessage(
          avatarResult.error ?? "Could not upload profile image.",
        );

        return;
      }

      avatarUrl = avatarResult.avatarUrl;
    }

    const result = await updateProfile({
      fullName: trimmedFullName,
      email: trimmedEmail,
      phone: trimmedPhone,
      avatarUrl,
    });

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error);

      return;
    }

    Alert.alert(
      "Profile Updated",
      "Your profile has been updated successfully.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
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
      keyboardShouldPersistTaps="handled"
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
              avatarUri
                ? {
                    uri: avatarUri,
                  }
                : require("@/assets/images/app-logo.png")
            }
            style={styles.avatar}
          />

          <Pressable
            style={styles.editAvatarButton}
            onPress={handlePickAvatar}
            disabled={isSaving}
          >
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
          editable={!isSaving}
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
          editable={!isSaving}
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
          editable={!isSaving}
        />
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.saveButton, isSaving && styles.disabledButton]}
        onPress={handleSaveChanges}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Text>
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

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  errorText: {
    fontSize: 13,
    color: "#DC2626",
  },

  saveButton: {
    height: 54,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
