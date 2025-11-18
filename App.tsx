import React, { useState, useCallback } from 'react';
import { Scene } from './types';
import SceneIntro from './components/SceneIntro';
import Scene1 from './components/Scene1';
import Scene2 from './components/Scene2';
import Scene3 from './components/Scene3';
import SceneDressUp from './components/SceneDressUp';
import SceneFood from './components/SceneFood';
import Scene4 from './components/Scene4';
import Scene5 from './components/Scene5';
import SecretScene from './components/SecretScene';
import AnimatedCursor from './components/common/AnimatedCursor';
import AudioPlayer from './components/AudioPlayer';

const App: React.FC = () => {
  const [scene, setScene] = useState<Scene>(Scene.Intro);
  const [sceneHistory, setSceneHistory] = useState<Scene[]>([]);
  const [stylizedImageUrl, setStylizedImageUrl] = useState<string | null>(null);
  const [playMusic, setPlayMusic] = useState(false);


  const goToScene = useCallback((targetScene: Scene) => {
    // Start music after the intro scene completes
    if (targetScene !== Scene.Intro && !playMusic) {
      setPlayMusic(true);
    }
    setSceneHistory(prev => [...prev, scene]);
    setScene(targetScene);
  }, [scene, playMusic]);

  const goBack = useCallback(() => {
    if (sceneHistory.length > 0) {
      const lastScene = sceneHistory[sceneHistory.length - 1];
      setSceneHistory(prev => prev.slice(0, -1));
      setScene(lastScene);
    }
  }, [sceneHistory]);
  
  const handlePhotoStyled = (stylizedUrl: string) => {
    setStylizedImageUrl(stylizedUrl);
    goToScene(Scene.Cake);
  };
  
  const handleDressUpComplete = (imageUrl: string) => {
    setStylizedImageUrl(imageUrl); // Update the image with the new dress
    goToScene(Scene.Food);
  }


  const renderScene = () => {
    switch (scene) {
      case Scene.Intro:
        return <SceneIntro onNext={() => goToScene(Scene.Landing)} />;
      case Scene.Landing:
        return <Scene1 onNext={() => goToScene(Scene.Photo)} />;
      case Scene.Photo:
        return <Scene2 onNext={handlePhotoStyled} />;
      case Scene.Cake:
        return <Scene3 stylizedImageUrl={stylizedImageUrl} onNext={() => goToScene(Scene.DressUp)} />;
      case Scene.DressUp:
        return <SceneDressUp personImageUrl={stylizedImageUrl} onNext={handleDressUpComplete} />;
      case Scene.Food:
        return <SceneFood onNext={() => goToScene(Scene.Spinner)} />;
      case Scene.Spinner:
        return <Scene4 onNext={() => goToScene(Scene.Closing)} />;
      case Scene.Closing:
        return <Scene5 onUnlock={() => goToScene(Scene.Secret)} />;
      case Scene.Secret:
        return <SecretScene />;
      default:
        return <SceneIntro onNext={() => goToScene(Scene.Landing)} />;
    }
  };
  
  const backgroundClass = scene === Scene.Intro || scene === Scene.Closing || scene === Scene.Secret
    ? 'bg-gradient-to-b from-[#1e293b] to-[#475569]'
    : 'bg-gradient-to-br from-[#FFDAB9] to-[#FFFDD0]';

  return (
    <div className={`relative w-screen h-screen overflow-hidden transition-colors duration-1000 ${backgroundClass}`}>
      <AudioPlayer play={playMusic} volume={0.5} />
      <AnimatedCursor />
      {scene !== Scene.Intro && scene !== Scene.Secret && (
        <button
          onClick={goBack}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full text-2xl flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Go back"
        >
          ⬅️
        </button>
      )}
      
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        {renderScene()}
      </div>
    </div>
  );
};

export default App;