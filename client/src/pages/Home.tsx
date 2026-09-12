import { useCallback, useEffect, useState } from "react";
import Overlay, { useLocalEventBridge } from "@/components/Overlay";
import { loadSettings, type OverlayEvent, type OverlaySettings } from "@/lib/overlay";

export default function Home() {
  const [settings, setSettings] = useState<OverlaySettings>(loadSettings);
  const [event, setEvent] = useState<OverlayEvent | null>(null);
  const onEvent = useCallback((next: OverlayEvent) => setEvent(next), []);
  useLocalEventBridge(onEvent);

  useEffect(() => {
    const handleSettings = (event: Event) => setSettings((event as CustomEvent<OverlaySettings>).detail);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "live-overlay-settings-v1" && event.newValue) {
        try { setSettings((current) => ({ ...current, ...JSON.parse(event.newValue as string) })); } catch { /* keep the last valid config */ }
      }
    };
    window.addEventListener("overlay-settings-change", handleSettings);
    window.addEventListener("storage", handleStorage);
    return () => { window.removeEventListener("overlay-settings-change", handleSettings); window.removeEventListener("storage", handleStorage); };
  }, []);

  return <main className="sharing-page"><Overlay settings={settings} event={event} /><a className="admin-escape" href="/admin.html">Admin</a></main>;
}
