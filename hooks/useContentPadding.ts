/**
 * Hook for consistent content container padding across screens.
 * Uses safe area insets + lib/screenLayout constants so one change updates all.
 */

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CONTENT_PADDING_HORIZONTAL,
  CONTENT_PADDING_TOP_EXTRA,
  CONTENT_PADDING_BOTTOM_EXTRA,
  STACK_CONTENT_PADDING_TOP,
} from "@/lib/screenLayout";

export type ContentPaddingOptions = {
  /** Use for tab root screens (Dashboard, Insights index, Profile index). Default true. */
  withTopInset?: boolean;
  /** Use for stack sub-screens that have a header (e.g. Settings, Privacy, Wearables). */
  stackScreen?: boolean;
  /** Override extra top (default from constants). */
  extraTop?: number;
  /** Override bottom extra (default from constants). */
  extraBottom?: number;
};

/**
 * Returns style object for ScrollView contentContainerStyle (or main container).
 * Use the same hook everywhere so padding is consistent and easy to change.
 */
export function useContentPadding(options: ContentPaddingOptions = {}) {
  const insets = useSafeAreaInsets();
  const {
    withTopInset = true,
    stackScreen = false,
    extraTop,
    extraBottom,
  } = options;

  const top = stackScreen
    ? (extraTop ?? STACK_CONTENT_PADDING_TOP)
    : (insets.top + (extraTop ?? CONTENT_PADDING_TOP_EXTRA));
  const bottom = insets.bottom + (extraBottom ?? CONTENT_PADDING_BOTTOM_EXTRA);

  return {
    paddingTop: top,
    paddingBottom: bottom,
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
  };
}
