import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, visible]. `visible` flips to true the first time the element
 * scrolls into view and stays true (the observer disconnects after that).
 * Same behaviour as the hand-written one in the legacy manual page.
 */
export function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default useInView;
