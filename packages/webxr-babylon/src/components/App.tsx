import React from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core';

import Terminal from './Terminal';

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
        <hemisphericLight
          name="light1"
          intensity={0.7}
          direction={Vector3.Up()}
        />
        <hemisphericLight
          name="light1"
          intensity={0.7}
          direction={Vector3.Down()}
        />
        <hemisphericLight
          name="light1"
          intensity={0.7}
          direction={Vector3.Left()}
        />
        <hemisphericLight
          name="light1"
          intensity={0.7}
          direction={Vector3.Right()}
        />

        <Terminal />
      </Scene>
    </Engine>
  );
};

export default App;
