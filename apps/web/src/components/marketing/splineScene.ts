/**
 * Spline scene config for the Walky Talky marketing homepage.
 *
 * Community file pages are NOT valid `scene` props for `@splinetool/react-spline`.
 * That package needs Export → Code → `https://prod.spline.design/<id>/scene.splinecode`.
 *
 * The linked Community file ("Googly Eyes") has no public `.splinecode` (confirmed via
 * community-api + Spline docs). Until an Export URL is pasted, we iframe the Community
 * Hana preview (`is2D: true` → `/ui/<uuidFile>?view=preview`).
 */

/** Paste Export → Code URL (or set `VITE_SPLINE_SCENE_URL`) to enable react-spline. */
export const SPLINE_SCENE_URL = (
  import.meta.env.VITE_SPLINE_SCENE_URL as string | undefined
)?.trim() ?? "";

export const COMMUNITY_FILE_ID = "f98bdec5-a9ce-48e7-9929-f04dfae468bb";
/**
 * Preview uuid from `community-api.spline.design/file/open/<communityId>`
 * (not the listing `uuidFile` — that id 403s in the viewer).
 */
export const COMMUNITY_PREVIEW_UUID = "5f189bbc-d747-45fb-a210-0bcf0e27e5df";
export const COMMUNITY_PAGE_URL = `https://app.spline.design/community/file/${COMMUNITY_FILE_ID}`;
/** Hana 2D community preview (not a `.splinecode` URL). */
export const COMMUNITY_PREVIEW_IFRAME = `https://app.spline.design/ui/${COMMUNITY_PREVIEW_UUID}?view=preview`;
export const COMMUNITY_THUMBNAIL = `https://community-filepreview.spline.design/webp-90/${COMMUNITY_FILE_ID}.webp`;
export const COMMUNITY_CREATOR = "anabolio";
