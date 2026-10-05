import { useRef, useState } from "react";

/**
 * Horizontal snap-scrolling testimonial video carousel with prev/next buttons.
 * `videos` is a list of { src, poster } (Bunny CDN HLS playlists + thumbnails);
 * `accent` colours the nav buttons.
 */
export default function VideoCarousel({ videos, accent = "#0f6e56" }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);

  const scrollTo = (index) => {
    if (trackRef.current) {
      trackRef.current.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const prev = () => { const n = (current - 1 + videos.length) % videos.length; setCurrent(n); scrollTo(n); };
  const next = () => { const n = (current + 1) % videos.length; setCurrent(n); scrollTo(n); };

  return (
    <>
      <style>{`
        .gallery-track { display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:4px; }
        .gallery-track::-webkit-scrollbar { display:none; }
        .gallery-slide { flex:0 0 85vw; max-width:400px; scroll-snap-align:center; min-height:550px; }
        @media (min-width:768px) { .gallery-slide { flex:0 0 calc(40% - 10px); max-width:none; min-height:550px; } }
        .gallery-nav-btn { width:44px; height:44px; border-radius:50%; border:none; background:${accent}; color:white; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s,transform 0.15s; }
        .gallery-nav-btn:hover { filter:brightness(.88); transform:scale(1.08); }
        .gallery-nav-btn:active { transform:scale(0.95); }
      `}</style>

      <div ref={trackRef} className="gallery-track">
        {videos.map((v, i) => (
          <div key={i} className="gallery-slide rounded-2xl overflow-hidden border border-gray-200 shadow-md flex-shrink-0" style={{ background: "#111" }}>
            <video src={v.src} poster={v.poster} controls className="w-full object-cover block" style={{ aspectRatio: "16/6", minHeight: "550px" }} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-5">
        <button className="gallery-nav-btn" onClick={prev} aria-label="Previous">‹</button>
        <button className="gallery-nav-btn" onClick={next} aria-label="Next">›</button>
      </div>
    </>
  );
}
