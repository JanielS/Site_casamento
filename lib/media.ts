import { defaultSettings, mediaPaths } from "@/lib/constants";
import type { SiteSettings } from "@/lib/types";

export function getMediaForSettings(settings: SiteSettings = defaultSettings) {
  return {
    audio: settings.audioUrl || mediaPaths.audio,
    video: settings.videoUrl || mediaPaths.video,
    heroImage: settings.heroImageUrl || mediaPaths.heroImage,
    confirmationImage: settings.confirmationImageUrl || mediaPaths.confirmationImage,
    presentsImage: settings.presentsImageUrl || mediaPaths.presentsImage
  };
}
