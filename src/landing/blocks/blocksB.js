import { Agenda } from "./Agenda";
import { Compare } from "./Compare";
import { Custom } from "./Custom";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Testimonials } from "./Testimonials";
import { VideoTestimonials } from "./VideoTestimonials";

export { Agenda, Compare, Custom, Faq, FinalCta, Footer, Gallery, Testimonials, VideoTestimonials };

export const BLOCKS_B = Object.freeze({
  agenda: Agenda,
  compare: Compare,
  testimonials: Testimonials,
  videoTestimonials: VideoTestimonials,
  gallery: Gallery,
  faq: Faq,
  finalCta: FinalCta,
  footer: Footer,
  custom: Custom,
});

export default BLOCKS_B;
