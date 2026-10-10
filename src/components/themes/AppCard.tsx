import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useAppearance } from "@/contexts/appearance-context";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AppCard({ children, style }: Props) {
  const { theme } = useAppearance();

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
