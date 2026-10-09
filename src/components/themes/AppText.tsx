import type { ReactNode } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

import { useAppearance } from "@/contexts/appearance-context";

type Props = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  secondary?: boolean;
};

export default function AppText({ children, style, secondary = false }: Props) {
  const { theme } = useAppearance();

  return (
    <Text
      style={[
        {
          color: secondary ? theme.textSecondary : theme.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
