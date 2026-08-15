import { defaultSettings, mediaPaths } from "@/lib/constants";
import type { SiteSettings } from "@/lib/types";

function getExtension(url: string) {
  const cleanUrl = url.split("?")[0] ?? url;
  const match = cleanUrl.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? "";
}

export function getMediaForSettings(settings: SiteSettings = defaultSettings) {
  return {
    audio: settings.audioUrl || mediaPaths.audio,
    video: settings.videoUrl || mediaPaths.video,
    heroImage: settings.heroImageUrl || mediaPaths.heroImage,
    confirmationImage: settings.confirmationImageUrl || mediaPaths.confirmationImage,
    presentsImage: settings.presentsImageUrl || mediaPaths.presentsImage
  };
}

export function getMediaType(url: string) {
  const extension = getExtension(url);
  if (extension === "mov" || extension === "qt") {
    return "video/quicktime";
  }
  if (extension === "mp4" || extension === "m4v") {
    return "video/mp4";
  }
  if (extension === "webm") {
    return "video/webm";
  }
  if (extension === "mp3") {
    return "audio/mpeg";
  }
  if (extension === "ogg") {
    return "audio/ogg";
  }
  return "application/octet-stream";
}
