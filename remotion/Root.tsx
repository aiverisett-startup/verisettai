import React from "react";
import { Composition } from "remotion";
import { VerisettPromo } from "../components/promo/VerisettPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VerisettTeaser"
      component={VerisettPromo}
      durationInFrames={360} // 12 seconds total at 30 fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
