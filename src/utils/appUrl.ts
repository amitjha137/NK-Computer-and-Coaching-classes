/**
 * URL helper for NK Classes application.
 *
 * URLs in Google AI Studio:
 * 1. Live Working Container URL (Active Dev URL):
 *    https://ais-dev-276va2a53mst5qkit3izru-124887772182.asia-east1.run.app
 *    - This is currently RUNNING and serves the live application.
 *    - Works on laptop browser and any mobile browser logged into the user's Google account.
 *
 * 2. Shared Public Preview URL:
 *    https://ais-pre-276va2a53mst5qkit3izru-124887772182.asia-east1.run.app
 *    - Becomes active on Google Cloud Run ONLY AFTER the user clicks the "Share" button in the AI Studio top bar.
 *    - Until "Share" is clicked, Google returns 404: "The requested URL was not found on this server."
 */

export const DEV_APP_URL = 'https://ais-dev-276va2a53mst5qkit3izru-124887772182.asia-east1.run.app';
export const SHARED_PUBLIC_APP_URL = 'https://ais-pre-276va2a53mst5qkit3izru-124887772182.asia-east1.run.app';

/**
 * Returns the active live container URL (guaranteed to be running on this container).
 */
export function getActiveAppUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin && !origin.includes('null') && origin.startsWith('http')) {
      return origin;
    }
  }
  return DEV_APP_URL;
}

export function getDevAppUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin && !origin.includes('null') && origin.startsWith('http')) {
      return origin;
    }
  }
  return DEV_APP_URL;
}

export function getPublicAppUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin && origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    if (origin && !origin.includes('null') && origin.startsWith('http')) {
      return origin;
    }
  }
  return SHARED_PUBLIC_APP_URL;
}
