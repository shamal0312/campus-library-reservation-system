import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme: keyof typeof Colors = scheme === 'dark' || scheme === 'light' ? scheme : 'light';

  return Colors[theme];
}
