/**
 * FounderBrief design tokens — STRICT 4-color system.
 *
 *   #DAF7F3  base canvas of every screen
 *   #FFFFFF  cards, bubbles, inputs, top bar pill, navbar surface
 *   #FBFF28  accent: primary CTA, active/selected states, progress fill
 *   #1C2120  all text, icons, user bubbles, dark action buttons
 *
 * Greys are NOT new colours: they are #1C2120 at reduced opacity.
 */
export const COLORS = {
  bg: "#DAF7F3",
  white: "#FFFFFF",
  accent: "#FBFF28",
  ink: "#1C2120",
  inkMuted: "rgba(28, 33, 32, 0.62)",
  inkSoft: "rgba(28, 33, 32, 0.46)",
  inkFaint: "rgba(28, 33, 32, 0.24)",
  inkTrack: "rgba(28, 33, 32, 0.14)",
  inkWash: "rgba(28, 33, 32, 0.07)",
  whiteTint: "rgba(255, 255, 255, 0.55)",
  whiteSoft: "#EDFBF9",
  whiteOnInk: "rgba(255, 255, 255, 0.72)",
  scrim: "rgba(28, 33, 32, 0.30)",
} as const;

export const SHADOW = "0 6px 14px rgba(28, 33, 32, 0.10)";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.founderbreif.app";
