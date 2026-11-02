const key = "invitation-full-motion";
const changeEvent = "invitation-motion-preference";
let sessionOverride: boolean | null = null;

export function subscribeToFullMotion(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getFullMotion() {
  try {
    return sessionOverride ?? window.localStorage.getItem(key) === "true";
  } catch (error) {
    console.warn("Motion preference storage unavailable; using this tab's preference.", error);
    return sessionOverride ?? false;
  }
}

export function setFullMotion(enabled: boolean) {
  try {
    if (enabled) window.localStorage.setItem(key, "true");
    else window.localStorage.removeItem(key);
    sessionOverride = null;
  } catch (error) {
    sessionOverride = enabled;
    console.warn("Could not save motion preference; it will apply to this tab only.", error);
  }
  window.dispatchEvent(new Event(changeEvent));
}
