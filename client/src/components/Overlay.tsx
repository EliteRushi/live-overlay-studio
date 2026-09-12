import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultComments,
  emitOverlayEvent,
  formatLikes,
  formatViewers,
  fontClass,
  positionClass,
  type OverlayEvent,
  type OverlaySettings,
} from "@/lib/overlay";

export type CommentItem = { id: string; user: string; message: string; color: string };
export type ReactionItem = { id: string; icon: string; left: number; size: number; duration: number };

const reactionPalette = ["❤️", "👍", "✨", "🔥", "👏", "💙"];

function Avatar({ color, image, size }: { color: string; image?: string; size: number }) {
  if (image) return <img className="avatar" style={{ width: size, height: size }} src={image} alt="" />;
  return <span className="avatar avatar-initial" style={{ width: size, height: size, background: color }}>{"•"}</span>;
}

function makeReaction(settings: OverlaySettings, icon?: string): ReactionItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    icon: icon || settings.reactionIcon,
    left: 12 + Math.random() * 72,
    size: settings.reactionSize + Math.random() * 10 - 5,
    duration: settings.reactionDuration + Math.random() * 2 - 1,
  };
}

export default function Overlay({ settings, event, compact = false }: { settings: OverlaySettings; event?: OverlayEvent | null; compact?: boolean }) {
  const [comments, setComments] = useState<CommentItem[]>(defaultComments);
  const [reactions, setReactions] = useState<ReactionItem[]>(() => Array.from({ length: 5 }, () => makeReaction(settings)));
  const [subscriber, setSubscriber] = useState<{ name: string; id: number } | null>({ name: settings.subscriberName, id: 1 });
  const [message, setMessage] = useState<{ text: string; icon: string; type: string } | null>(() => {
    const first = settings.messages.find((item) => item.enabled);
    return first ? { text: first.text, icon: first.icon, type: first.type } : null;
  });
  const [likes, setLikes] = useState(settings.likes);
  const seenEvent = useRef<string | null>(null);

  useEffect(() => {
    setLikes(settings.likes);
  }, [settings.likes]);

  useEffect(() => {
    if (!event || event.id === seenEvent.current) return;
    seenEvent.current = event.id;
    if (event.type === "comment") {
      const next: CommentItem = {
        id: event.id,
        user: String(event.payload?.user || "Ashley"),
        message: String(event.payload?.message || "Hello everyone!"),
        color: String(event.payload?.color || "#8de8bd"),
      };
      setComments((current) => [...current, next].slice(-Math.max(1, settings.maxComments)));
      window.setTimeout(() => setComments((current) => current.filter((item) => item.id !== next.id)), settings.commentDuration * 1000);
    }
    if (event.type === "like") {
      setLikes((current) => current + 1);
      setReactions((current) => [...current, makeReaction(settings, String(event.payload?.icon || settings.likeIcon))].slice(-settings.maxReactions));
    }
    if (event.type === "reaction") {
      setReactions((current) => [...current, makeReaction(settings, String(event.payload?.icon || settings.reactionIcon))].slice(-settings.maxReactions));
    }
    if (event.type === "subscriber") {
      const next = { name: String(event.payload?.name || settings.subscriberName), id: Date.now() };
      setSubscriber(next);
      window.setTimeout(() => setSubscriber((current) => current?.id === next.id ? null : current), settings.subscriberDuration * 1000);
    }
    if (event.type === "message") {
      const next = { text: String(event.payload?.text || "WELCOME TO THE LIVE!"), icon: String(event.payload?.icon || "✦"), type: String(event.payload?.messageType || "banner") };
      setMessage(next);
      window.setTimeout(() => setMessage((current) => current?.text === next.text ? null : current), Number(event.payload?.duration || 6) * 1000);
    }
  }, [event, settings]);

  useEffect(() => {
    if (!settings.reactionEnabled || compact) return;
    const timer = window.setInterval(() => {
      setReactions((current) => [...current, makeReaction(settings, reactionPalette[Math.floor(Math.random() * reactionPalette.length)])].slice(-settings.maxReactions));
    }, Math.max(1200, settings.reactionFrequency * 1000));
    return () => window.clearInterval(timer);
  }, [settings, compact]);

  const background = useMemo(() => {
    if (settings.backgroundMode === "solid") return settings.backgroundColor;
    if (settings.backgroundMode === "image" && settings.backgroundImage) {
      return `linear-gradient(rgba(5,8,18,${settings.overlayOpacity}), rgba(5,8,18,${settings.overlayOpacity})), url(${settings.backgroundImage}) center / cover`;
    }
    return `linear-gradient(145deg, ${settings.gradientA} 0%, ${settings.gradientB} 100%)`;
  }, [settings]);

  const viewerLabel = formatViewers(settings.viewers, settings.viewerFormat);
  const likeLabel = formatLikes(likes, settings.likeFormat);
  const visibleComments = settings.newest === "top" ? [...comments].reverse() : comments;
  const activeMessage = message || settings.messages.find((item) => item.enabled);

  return (
    <div className={`overlay-stage ${compact ? "is-compact" : ""}`}>
      <div className={`overlay-shell ${fontClass(settings.fontFamily)}`} style={{ background, filter: `brightness(${settings.brightness})` }}>
        <div className="overlay-grain" />
        <div className="overlay-vignette" style={{ opacity: settings.vignette }} />
        <div className="overlay-content">
          <header className={`overlay-header ${positionClass(settings.headerPosition)}`}>
            <div className="profile-lockup">
              {settings.showAvatar && <Avatar color="#635bff" image={settings.avatarUrl} size={34} />}
              <div className="profile-copy">
                <div className="profile-name-row"><strong>{settings.profileName}</strong>{settings.showLive && <span className="live-badge"><i />{settings.liveText}</span>}</div>
                {settings.showTitle && <span className="channel-label">{settings.title}</span>}
              </div>
            </div>
            {settings.showViewers && <span className="viewer-pill">{viewerLabel}</span>}
          </header>

          {settings.reactionEnabled && <div className={`reaction-field ${positionClass(settings.reactionPosition)}`}>
            {reactions.map((reaction) => <span key={reaction.id} className="floating-reaction" style={{ left: `${reaction.left}%`, fontSize: reaction.size, animationDuration: `${reaction.duration}s`, opacity: settings.reactionOpacity }}>{reaction.icon}</span>)}
          </div>}

          {settings.showComments && <section className={`comment-stack ${positionClass(settings.commentPosition)}`} style={{ gap: settings.commentSpacing }}>
            {visibleComments.slice(-settings.maxComments).map((comment) => <article key={comment.id} className={`comment-card anim-${settings.commentAnimation}`} style={{ background: settings.commentBg, color: settings.commentText, borderRadius: settings.commentRadius, opacity: settings.commentOpacity, boxShadow: settings.commentShadow ? "0 14px 30px rgba(0,0,0,.20)" : "none" }}>
              <Avatar color={comment.color} size={settings.avatarSize} />
              <div className="comment-body"><strong style={{ fontSize: settings.usernameSize, color: settings.usernameColor }}>{comment.user}</strong><span style={{ fontSize: settings.commentSize }}>{comment.message}</span></div>
            </article>)}
          </section>}

          {settings.showSubscribers && subscriber && <div className={`subscriber-alert ${positionClass(settings.subscriberPosition)} anim-${settings.subscriberAnimation}`}>
            <span className="alert-kicker">{settings.subscriberMessage}</span>
            <strong>{subscriber.name}</strong>
            <span className="alert-dot" />
          </div>}

          {settings.showLikes && <div className={`like-counter ${positionClass(settings.likePosition)}`}><span>{settings.likeIcon}</span><strong>{likeLabel}</strong><small>likes</small></div>}

          {activeMessage && <div className={`custom-message message-${activeMessage.type} ${positionClass(settings.messagePosition)}`}><span>{activeMessage.icon}</span><strong>{activeMessage.text}</strong></div>}

          <footer className="overlay-footer"><span>LIVE OVERLAY STUDIO</span><span className="footer-line" /><span>1080 × 1920</span></footer>
        </div>
      </div>
    </div>
  );
}

export function useLocalEventBridge(onEvent: (event: OverlayEvent) => void) {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "live-overlay-event-v1" || !event.newValue) return;
      try { onEvent(JSON.parse(event.newValue)); } catch { /* ignore malformed demo events */ }
    };
    const handleLocal = (event: Event) => onEvent((event as CustomEvent<OverlayEvent>).detail);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("overlay-event", handleLocal);
    return () => { window.removeEventListener("storage", handleStorage); window.removeEventListener("overlay-event", handleLocal); };
  }, [onEvent]);
}

export function emitDemoComment(user = "Ashley", message = "Hello everyone!") {
  emitOverlayEvent({ type: "comment", payload: { user, message, color: "#8de8bd" } });
}
