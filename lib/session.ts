export const CLIENT_RESERVATION_TOKEN_KEY = "wedding-gift-reservation-token";
export const CLIENT_AUDIO_STATE_KEY = "wedding-audio-state";

export function getClientTokenScript() {
  return `(() => {
    const key = ${JSON.stringify(CLIENT_RESERVATION_TOKEN_KEY)};
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""));
    }
  })();`;
}
