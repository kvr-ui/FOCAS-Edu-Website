import { useRef, useState } from "react";

/**
 * Horizontal snap-scrolling photo carousel with prev/next buttons.
 * `images` is a list of { src, alt }; `accent` colours the nav buttons.
 */
export default function ImageCarousel({ images, accent = "#0f6e56" }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);

  const scrollTo = (index) => {
    if (trackRef.current) {
      trackRef.current.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const prev = () => { const n = (current - 1 + images.length) % images.length; setCurrent(n); scrollTo(n); };
  const next = () => { const n = (current + 1) % images.length; setCurrent(n); scrollTo(n); };

  return (
    <>
      <style>{`
        .photo-track { display:flex; overflow-x:auto; gap:16px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:4px; }
        .photo-track::-webkit-scrollbar { display:none; }
        .photo-slide { flex:0 0 85vw; max-width:420px; scroll-snap-align:center; }
        @media (min-width:768px) { .photo-slide { flex:0 0 calc(40% - 10px); max-width:none; } }
        .photo-nav-btn { width:44px; height:44px; border-radius:50%; border:none; background:${accent}; color:white; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s,transform 0.15s; }
        .photo-nav-btn:hover { filter:brightness(.88); transform:scale(1.08); }
        .photo-nav-btn:active { transform:scale(0.95); }
      `}</style>

      <div ref={trackRef} className="photo-track">
        {images.map((img, i) => (
          <div key={img.src} className="photo-slide rounded-2xl overflow-hidden border border-gray-200 shadow-md flex-shrink-0 bg-gray-100">
            <img src={img.src} alt={img.alt} loading={i < 3 ? "eager" : "lazy"} className="w-full block object-cover" style={{ aspectRatio: "3/2" }} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-5">
        <button className="photo-nav-btn" onClick={prev} aria-label="Previous">‹</button>
        <button className="photo-nav-btn" onClick={next} aria-label="Next">›</button>
      </div>
    </>
  );
}
