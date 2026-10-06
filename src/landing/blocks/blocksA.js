import { CountdownBlock } from "./Countdown";
import { HeroBlock } from "./Hero";
import { HighlightsBlock } from "./Highlights";
import { HowItWorksBlock } from "./HowItWorks";
import { TickerBlock } from "./Ticker";
import { WhatYouGetBlock } from "./WhatYouGet";

export {
  CountdownBlock,
  HeroBlock,
  HighlightsBlock,
  HowItWorksBlock,
  TickerBlock,
  WhatYouGetBlock,
};

export const BLOCKS_A = Object.freeze({
  hero: HeroBlock,
  ticker: TickerBlock,
  countdown: CountdownBlock,
  highlights: HighlightsBlock,
  whatYouGet: WhatYouGetBlock,
  howItWorks: HowItWorksBlock,
});

export default BLOCKS_A;
