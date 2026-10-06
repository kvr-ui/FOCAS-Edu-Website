import { useEffect, useState } from "react";

/** True once window.scrollY exceeds `offset` (passive scroll listener). */
export function useScrolledPast(offset) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const handler = () => setPast(window.scrollY > offset);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [offset]);
  return past;
}

export function scrollToId(id) {
  if (!id || typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
