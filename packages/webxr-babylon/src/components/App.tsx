import React from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core';

import Terminal from './Terminal';

const lightVectors = [
  Vector3.Up(),
  Vector3.Down(),
  Vector3.Left(),
  Vector3.Right(),
];

const App = () => {
  return (
    <Engine canvasId="main-canvas" antialias={true}>
      <Scene
        onMeshPicked={(...params) => {
          console.log('onMeshPicked', ...params);
        }}
        onSceneMount={(...params) => {
          console.log('onSceneMount', ...params);
        }}
      >
        <flyCamera
          name="camera1"
          position={new Vector3(0, 0, -10)}
          setTarget={[Vector3.Zero()]}
        />

        {lightVectors.map((vector, i) => (
          <hemisphericLight
            key={i}
            name="light"
            intensity={0.5}
            direction={vector}
          />
        ))}

        <Terminal />
      </Scene>
    </Engine>
  );
};

export default App;
