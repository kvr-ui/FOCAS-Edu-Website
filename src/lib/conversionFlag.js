// One-shot "the user just completed the form/payment" flag, carried to the
// success page via sessionStorage. The success page fires its conversion event
// (CompleteRegistration / Purchase) only when the flag is present, then clears
// it — so a refresh or a direct visit to the success URL is never counted.

export const REGISTRATION_KEY = "focas_registration_pending";
export const WORKOUT_REGISTRATION_KEY = "focas_workout_registration_pending";
export const CAREER_PURCHASE_KEY = "focas_career_purchase_pending";

/** Set the flag. Returns false if sessionStorage is unavailable. */
export function markConversion(key, value = "1") {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Read and clear the flag. Returns the stored value, or null if absent. */
export function takeConversion(key) {
  try {
    const value = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}
