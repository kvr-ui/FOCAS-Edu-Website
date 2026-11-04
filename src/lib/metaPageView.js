// Meta Pixel PageView for in-app (client-side) navigations.
//
// The first page load is already counted by the base pixel snippet in
// index.html / fs.html (`fbq("track", "PageView")`). This covers every later
// route change, so individual pages must NOT fire their own PageView —
// that would count the same view twice.
//
// router.subscribe() fires on every router state update (not only location
// changes), so only fire when the location actually changes.
export function trackMetaPageViews(router) {
  let lastKey = router.state.location.key;
  return router.subscribe((state) => {
    const key = state.location?.key;
    if (!key || key === lastKey) return;
    lastKey = key;
    window.fbq?.("track", "PageView");
  });
}
