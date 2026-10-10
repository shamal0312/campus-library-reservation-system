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

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";
const FIELD_BACKGROUND = "#F8FAFD";

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
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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

        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarOuter}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require("@/assets/images/app-logo.png")
              }
              style={styles.avatar}
            />
          </View>

          <Pressable
            style={styles.editAvatarButton}
            onPress={handlePickAvatar}
            disabled={isSaving}
          >
            <SymbolView
              name={{
                ios: "camera.fill",
                android: "photo_camera",
                web: "photo_camera",
              }}
              size={16}
              tintColor="#FFFFFF"
            />
          </Pressable>
        </View>

        <Text style={styles.profileName}>{fullName || "Library User"}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {account?.role
              ? account.role.charAt(0).toUpperCase() + account.role.slice(1)
              : "Student"}
          </Text>
        </View>

        <Text style={styles.photoHint}>
          Tap the camera icon to change your profile photo
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Personal Information</Text>

      <View style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>

          <View style={styles.inputWrapper}>
            <SymbolView
              name={{
                ios: "person",
                android: "person",
                web: "person",
              }}
              size={19}
              tintColor={MUTED}
            />

            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor={MUTED}
              editable={!isSaving}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>User ID</Text>

          <View style={styles.readOnlyField}>
            <SymbolView
              name={{
                ios: "person.text.rectangle",
                android: "badge",
                web: "badge",
              }}
              size={19}
              tintColor={MUTED}
            />

            <Text
              style={[styles.readOnlyText, !userId && styles.placeholderText]}
            >
              {userId || "Not available"}
            </Text>

            <SymbolView
              name={{
                ios: "lock.fill",
                android: "lock",
                web: "lock",
              }}
              size={14}
              tintColor="#A0A8B5"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>

          <View style={styles.inputWrapper}>
            <SymbolView
              name={{
                ios: "envelope",
                android: "mail",
                web: "mail",
              }}
              size={19}
              tintColor={MUTED}
            />

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
        </View>

        <View style={[styles.fieldGroup, styles.lastFieldGroup]}>
          <Text style={styles.label}>Phone Number</Text>

          <View style={styles.inputWrapper}>
            <SymbolView
              name={{
                ios: "phone",
                android: "call",
                web: "call",
              }}
              size={19}
              tintColor={MUTED}
            />

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
        </View>
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
          styles.saveButton,
          pressed && styles.saveButtonPressed,
          isSaving && styles.disabledButton,
        ]}
        onPress={handleSaveChanges}
        disabled={isSaving}
      >
        <SymbolView
          name={{
            ios: "checkmark",
            android: "check",
            web: "check",
          }}
          size={19}
          tintColor="#FFFFFF"
        />

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

  title: {
    fontSize: 22,
    fontWeight: "800",

    color: NAVY,
  },

  headerSpacer: {
    width: 42,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingVertical: 20,
    paddingHorizontal: 18,

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

  avatarWrapper: {
    position: "relative",
  },

  avatarOuter: {
    width: 96,
    height: 96,

    borderRadius: 48,

    backgroundColor: LIGHT_BLUE,

    padding: 4,

    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 88,
    height: 88,

    borderRadius: 44,

    backgroundColor: "#FFFFFF",
  },

  editAvatarButton: {
    position: "absolute",

    right: -2,
    bottom: 2,

    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: BLUE,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    elevation: 3,
  },

  profileName: {
    marginTop: 12,

    fontSize: 21,
    fontWeight: "800",

    color: NAVY,

    textAlign: "center",
  },

  roleBadge: {
    marginTop: 6,

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

  photoHint: {
    marginTop: 10,

    maxWidth: 250,

    fontSize: 11,
    lineHeight: 16,

    color: MUTED,

    textAlign: "center",
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 9,

    fontSize: 16,
    fontWeight: "800",

    color: NAVY,
  },

  formCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,

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

  fieldGroup: {
    marginBottom: 14,
  },

  lastFieldGroup: {
    marginBottom: 12,
  },

  label: {
    marginBottom: 7,

    fontSize: 13,
    fontWeight: "700",

    color: NAVY,
  },

  inputWrapper: {
    minHeight: 52,

    borderRadius: 14,

    backgroundColor: FIELD_BACKGROUND,

    borderWidth: 1,
    borderColor: BORDER,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  input: {
    flex: 1,

    minHeight: 50,

    fontSize: 14,

    color: NAVY,
  },

  readOnlyField: {
    minHeight: 52,

    borderRadius: 14,

    backgroundColor: "#F1F4F8",

    borderWidth: 1,
    borderColor: BORDER,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  readOnlyText: {
    flex: 1,

    fontSize: 14,

    color: MUTED,
  },

  placeholderText: {
    color: "#9AA3B2",
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

  saveButton: {
    marginTop: 20,

    height: 52,

    borderRadius: 16,

    backgroundColor: BLUE,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    shadowColor: BLUE,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 3,
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",

    color: "#FFFFFF",
  },
});
