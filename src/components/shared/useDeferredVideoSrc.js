import { useEffect, useState } from "react";

/**
 * Returns `url` only after the page has finished loading, and only for the copy
 * of a hero video that is actually shown (pages render one copy for mobile and
 * one for desktop). Until then it returns undefined, so the <video> shows its
 * poster image instead of downloading megabytes of video while the page's own
 * code and the Meta Pixel are still loading.
 *
 *   desktop = true  → only on screens ≥ 1024px (Tailwind `lg`)
 *   desktop = false → only on screens < 1024px
 *
 * If the screen later crosses the breakpoint (tablet rotated, window resized),
 * the newly visible copy gets its video too. Once set, the src is kept.
 */
export default function useDeferredVideoSrc(url, desktop) {
  const [src, setSrc] = useState(undefined);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    let loaded = document.readyState === "complete";
    const update = () => {
      if (loaded && mq.matches === desktop) setSrc(url);
    };
    const onLoad = () => { loaded = true; update(); };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    update();
    // addListener: Safari < 14 has no addEventListener on MediaQueryList.
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      window.removeEventListener("load", onLoad);
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, [url, desktop]);
  return src;
}
