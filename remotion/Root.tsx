import React from 'react';
import { Composition, registerRoot } from 'remotion';

const FPS = 60;
const DURATION_SECONDS = 60;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

// Scene durations in frames - exported for scene components to use
export const SCENE_DURATIONS = {
  problem: 8 * FPS, // 8 seconds
  branchMoment: 4 * FPS, // 4 seconds
  solution: 15 * FPS, // 15 seconds
  exploration: 20 * FPS, // 20 seconds
  mapReveal: 13 * FPS, // 13 seconds
};

interface MainVideoProps {}

const MainVideo: React.FC<MainVideoProps> = () => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: 'bold', color: '#333' }}>
        Expedition AI Video
      </div>
    </div>
  );
};

const Root = () => {
  return (
    <>
      <Composition
        id="ThoughtMapVideo"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

registerRoot(Root);
