import React, { useState } from "react";
import { Engine, Scene } from "react-babylonjs";
import { Vector3 } from "@babylonjs/core";
import Hotkeys from "react-hot-keys";

import Terminal from "./Terminal";

const lightVectors = [
  Vector3.Up(),
  Vector3.Down(),
  Vector3.Left(),
  Vector3.Right(),
];

const keyboardInput = (input) => {
  var output = {
    1: function () {
      return console.log("onKeyDown", input);
    },
    2: function () {
      return console.log("onKeyUp");
    },
  };
  return output[input.type]();
};

const MouseInput = (input) => {
  console.log("mouse", input.type);
};

const App = () => {
  const [mouseInput, setMouseInput] = useState(undefined);

  return (
    <Engine canvasId="main-canvas" antialias={true}>
      <Scene
        onKeyboardObservable={(e) => {
          keyboardInput(e);
        }}
        onPrePointerObservable={(e) => {
          setMouseInput(e.type);
        }}
        onMeshPicked={(...params) => {
          //   console.log("onMeshPicked", ...params);
        }}
        onSceneMount={(...params) => {
          //   console.log("onSceneMount", ...params);
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
        <Terminal focus={mouseInput} />
      </Scene>
    </Engine>
  );
};

export default App;
