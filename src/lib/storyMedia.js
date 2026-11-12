// Success-story videos (students' result testimonials).
//
// The originals were 8–94 MB files on CloudFront
// (https://da3m0k666tznr.cloudfront.net/Successful_stories/<Name>.mp4).
// They are now in Bunny Stream (library focas_library), which serves smaller
// MP4 versions that play on every device:
//   240p ≈ 1.5–4 MB, 360p ≈ 2.5–6 MB, 480p ≈ 5–13 MB, 720p ≈ 11–23 MB
//
// To add a story: upload the video to Bunny, add its video ID below, and
// create a poster (see storyPoster).
const BUNNY = "https://vz-1b4abbd6-5f1.b-cdn.net";

const STORY_BUNNY_IDS = {
  Gayathri: "13a0c311-bfcb-40ae-ba6d-4485e9fd8822",
  HariniAiswariya: "829b3ccd-ce6d-494e-8e75-1d4175ec00cd",
  Jeshurun: "4ce81b8b-a66f-4786-8ece-d91ab20854cd",
  Marimuthu: "5724c91c-4cd2-46e5-a23d-45275d209f5a",
  Saishruthi: "063b2926-9d3f-4939-96af-defb17476aef",
  Sridevi: "231912a4-0424-44fb-b465-5780b448520b",
};

// "https://…/Successful_stories/Sridevi.mp4" or "Sridevi" → "Sridevi"
function storyName(urlOrName) {
  return urlOrName?.split("/").pop()?.split(/[.#?]/)[0];
}

/**
 * Bunny MP4 URL for a success story. Accepts the old CloudFront URL or just the
 * name. `resolution`: 240 | 360 | 480 (all exist for every story; 720 does not).
 * Unknown videos are returned unchanged.
 */
export function storyVideo(urlOrName, resolution = 480) {
  const id = STORY_BUNNY_IDS[storyName(urlOrName)];
  return id ? `${BUNNY}/${id}/play_${resolution}p.mp4` : urlOrName;
}

/**
 * Poster image for a success story: a ~30 KB frame of the video in
 * public/stories-assets/<Name>.webp. With a poster the <video> can use
 * preload="none", so nothing downloads until the visitor presses play.
 *
 * New poster:
 *   ffmpeg -ss 0.5 -i <video-url> -frames:v 1 -vf scale=480:-2 -c:v libwebp -quality 70 public/stories-assets/<Name>.webp
 */
export function storyPoster(urlOrName) {
  const name = storyName(urlOrName);
  return STORY_BUNNY_IDS[name] ? `/stories-assets/${name}.webp` : undefined;
}

// Audit intro video (/counselling "Confused about your last attempt strategy?"
// section and the /focas hero popup). Bunny only has 240p/360p for it because
// the original is 360p.
export const AUDIT_VIDEO = `${BUNNY}/c7f2e4f1-290f-42a8-98a7-d38d1a6d196e/play_360p.mp4`;
