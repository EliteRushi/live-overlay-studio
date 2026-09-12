export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type OverlayMessage = {
  id: string;
  text: string;
  type: "normal" | "banner" | "popup" | "lower-third" | "full-width";
  duration: number;
  position: Position;
  icon: string;
  enabled: boolean;
};

export type OverlaySettings = {
  profileName: string;
  channelName: string;
  title: string;
  description: string;
  avatarUrl: string;
  showAvatar: boolean;
  showTitle: boolean;
  showLive: boolean;
  liveText: string;
  showViewers: boolean;
  viewers: number;
  viewerFormat: "count" | "watching" | "eye" | "live";
  showComments: boolean;
  maxComments: number;
  commentDuration: number;
  commentAnimation: "fade" | "slide-up" | "slide-left" | "pop" | "none";
  newest: "top" | "bottom";
  usernameSize: number;
  commentSize: number;
  avatarSize: number;
  commentBg: string;
  commentText: string;
  usernameColor: string;
  commentRadius: number;
  commentSpacing: number;
  commentOpacity: number;
  commentShadow: boolean;
  reactionEnabled: boolean;
  reactionIcon: string;
  reactionSize: number;
  reactionFrequency: number;
  reactionDuration: number;
  maxReactions: number;
  reactionOpacity: number;
  reactionPosition: Position;
  showLikes: boolean;
  likeIcon: string;
  likes: number;
  likeFormat: "count" | "compact";
  showSubscribers: boolean;
  subscriberDuration: number;
  subscriberAnimation: "fade" | "slide-up" | "pop";
  subscriberMessage: string;
  subscriberName: string;
  subscriberPosition: Position;
  messages: OverlayMessage[];
  backgroundMode: "gradient" | "solid" | "image";
  backgroundColor: string;
  gradientA: string;
  gradientB: string;
  backgroundImage: string;
  overlayOpacity: number;
  vignette: number;
  brightness: number;
  headerPosition: Position;
  commentPosition: Position;
  messagePosition: Position;
  likePosition: Position;
  fontFamily: "manrope" | "space" | "dm";
};

export type OverlayEvent = {
  id: string;
  type: "comment" | "like" | "subscriber" | "reaction" | "message";
  payload?: Record<string, string | number>;
};

export const SETTINGS_KEY = "live-overlay-settings-v1";
export const EVENT_KEY = "live-overlay-event-v1";

export const defaultComments = [
  { id: "a1", user: "Ashley", message: "Hello everyone!", color: "#8de8bd" },
  { id: "h2", user: "Henry", message: "Amazing stream!", color: "#8ab8ff" },
  { id: "m3", user: "Moon", message: "This setup is clean 🔥", color: "#d5a3ff" },
];

export const defaultSettings: OverlaySettings = {
  profileName: "RUSHISD",
  channelName: "YouTube Live",
  title: "Build in public · live now",
  description: "A polished interactive stream overlay",
  avatarUrl: "",
  showAvatar: true,
  showTitle: true,
  showLive: true,
  liveText: "LIVE",
  showViewers: true,
  viewers: 126,
  viewerFormat: "eye",
  showComments: true,
  maxComments: 5,
  commentDuration: 8,
  commentAnimation: "slide-up",
  newest: "bottom",
  usernameSize: 12,
  commentSize: 15,
  avatarSize: 30,
  commentBg: "rgba(255,255,255,0.10)",
  commentText: "#f9fbff",
  usernameColor: "#b9c7ff",
  commentRadius: 14,
  commentSpacing: 10,
  commentOpacity: 0.96,
  commentShadow: true,
  reactionEnabled: true,
  reactionIcon: "❤️",
  reactionSize: 28,
  reactionFrequency: 3,
  reactionDuration: 8,
  maxReactions: 12,
  reactionOpacity: 0.78,
  reactionPosition: "center-right",
  showLikes: true,
  likeIcon: "♥",
  likes: 126,
  likeFormat: "compact",
  showSubscribers: true,
  subscriberDuration: 6,
  subscriberAnimation: "pop",
  subscriberMessage: "NEW SUBSCRIBER",
  subscriberName: "Alex",
  subscriberPosition: "bottom-center",
  messages: [
    { id: "welcome", text: "WELCOME TO THE LIVE!", type: "banner", duration: 6, position: "bottom-center", icon: "✦", enabled: true },
    { id: "thanks", text: "Thanks for watching", type: "lower-third", duration: 5, position: "bottom-left", icon: "", enabled: false },
  ],
  backgroundMode: "gradient",
  backgroundColor: "#0b1021",
  gradientA: "#101b3b",
  gradientB: "#351943",
  backgroundImage: "",
  overlayOpacity: 0.26,
  vignette: 0.68,
  brightness: 1,
  headerPosition: "top-left",
  commentPosition: "center-left",
  messagePosition: "bottom-center",
  likePosition: "bottom-right",
  fontFamily: "manrope",
};

export function loadSettings(): OverlaySettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: OverlaySettings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("overlay-settings-change", { detail: settings }));
}

export function emitOverlayEvent(event: Omit<OverlayEvent, "id">) {
  const next = { ...event, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` };
  window.localStorage.setItem(EVENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("overlay-event", { detail: next }));
}

export function formatViewers(value: number, format: OverlaySettings["viewerFormat"]) {
  if (format === "watching") return `${value} watching`;
  if (format === "live") return `LIVE • ${value}`;
  if (format === "eye") return `◉ ${value}`;
  return String(value);
}

export function formatLikes(value: number, format: OverlaySettings["likeFormat"]) {
  if (format === "compact" && value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function positionClass(position: Position) {
  return `pos-${position}`;
}

export function fontClass(font: OverlaySettings["fontFamily"]) {
  return `font-${font}`;
}

export function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function applyPreset(name: string, settings: OverlaySettings): OverlaySettings {
  if (name === "Minimal") {
    return { ...settings, showComments: false, reactionEnabled: false, showSubscribers: false, showLikes: false, showTitle: false, overlayOpacity: 0.12 };
  }
  if (name === "Social Style") {
    return { ...settings, reactionEnabled: true, reactionIcon: "💙", commentBg: "rgba(255,255,255,0.14)", commentRadius: 20, showLikes: true };
  }
  if (name === "Clean Professional") {
    return { ...settings, reactionEnabled: false, commentBg: "rgba(255,255,255,0.08)", commentRadius: 10, showTitle: true, fontFamily: "space" };
  }
  return settings;
}
