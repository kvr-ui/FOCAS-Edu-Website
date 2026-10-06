import VideoCarousel from "../../components/shared/VideoCarousel";
import { Reveal } from "../ui";

const directUrl = /^(?:(?:https?:)?\/\/|\/|data:|blob:)/i;

function videoSource(video, baseUrl) {
  if (typeof video === "string") {
    if (directUrl.test(video)) return { src: video };
    return baseUrl ? { src: `${baseUrl}/${video}/playlist.m3u8` } : null;
  }
  if (!video || typeof video !== "object") return null;

  const id = video.id ?? video.videoId;
  const src = video.src ?? video.url ?? (id && baseUrl ? `${baseUrl}/${id}/playlist.m3u8` : "");
  if (!src) return null;

  let poster = video.poster ?? video.thumbnail;
  if (poster && !directUrl.test(poster) && id && baseUrl) poster = `${baseUrl}/${id}/${poster}`;
  return poster ? { src, poster } : { src };
}

/**
 * Bunny-hosted video testimonial carousel using the shared VideoCarousel.
 * @param {{ section?: { id?: string, eyebrow?: string, title?: string, sub?: string, videos?: Array<string | { id?: string, videoId?: string, src?: string, url?: string, poster?: string, thumbnail?: string }>, videoIds?: string[], items?: Array<object>, bunnyBaseUrl?: string, cdnBaseUrl?: string }, id?: string, eyebrow?: string, title?: string, sub?: string, videos?: Array<string | object>, videoIds?: string[], items?: Array<object>, bunnyBaseUrl?: string, cdnBaseUrl?: string, onRegister?: () => void }} props
 */
export function VideoTestimonials({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const rawVideos = Array.isArray(config.videos)
    ? config.videos
    : Array.isArray(config.videoIds)
      ? config.videoIds
    : Array.isArray(config.items)
      ? config.items
      : [];
  const baseUrl = String(config.bunnyBaseUrl ?? config.cdnBaseUrl ?? config.bunnyHost ?? config.pullZone ?? "").replace(/\/$/, "");
  const videos = rawVideos.map((video) => videoSource(video, baseUrl)).filter(Boolean);
  if (!config.eyebrow && !config.title && !config.sub && videos.length === 0) return null;

  return (
    <section id={config.id ?? id} className="bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {(config.eyebrow || config.title || config.sub) && (
          <Reveal className="mb-10 text-center">
            {config.eyebrow && (
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em]" style={{ color: "var(--lp-accent)" }}>
                {config.eyebrow}
              </p>
            )}
            {config.title && <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{config.title}</h2>}
            {config.sub && <p className="mt-3 text-lg text-slate-500">{config.sub}</p>}
          </Reveal>
        )}
        {videos.length > 0 && (
          <Reveal>
            <VideoCarousel videos={videos} accent="var(--lp-accent)" />
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default VideoTestimonials;
