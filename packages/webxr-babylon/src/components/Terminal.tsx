import React from "react";
import { Engine, Scene } from "react-babylonjs";
import {
  Vector3,
  ArcRotateCamera,
  MeshBuilder,
  HemisphericLight,
} from "@babylonjs/core";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const classes = [
  ".xterm-selection-layer",
  ".xterm-link-layer",
  ".xterm-text-layer",
  ".xterm-cursor-layer",
];

function meshPicked(mesh) {
  console.log("mesh picked:", mesh);
}

function onSceneMount(e) {
  const { canvas, scene } = e;

  // Scene to build your environment, Canvas to attach your camera to...
  var camera = new ArcRotateCamera("Camera", 0, 1.05, 6, Vector3.Zero(), scene);
  //camera.attachControl(canvas);

  // setup your scene here
  MeshBuilder.CreateBox("box", { size: 3 }, scene);
  new HemisphericLight("light", Vector3.Up(), scene);

  var term = new Terminal({
    allowTransparency: true,
    cursorBlink: true,
  });
  var prompt = () => {
    var shellprompt = "$ ";
    term.write("\r\n" + shellprompt);
  };
  const el = document.querySelector("#terminal");
  term.open(document.querySelector("#terminal"));

  term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
  term.onKey((key) => {
    var char = key.domEvent.key;
    console.log(key);
    if (char === "") {
      console.log("Enter pressed");
      prompt();
    } else {
      term.write(char);
    }
  });
  //   // in your own render loop, you can add updates to ECS libraries or other tricks.
  //   scene.getEngine().runRenderLoop(() => {
  //     if (scene) {
  //       scene.render();
  //     }
  //   });
}
const ComponentTerminal = () => {
  return (
    <Engine
      canvasId="sample-canvas"
      width={window.innerWidth / 2}
      height={window.innerHeight / 2}
    >
      <Scene onMeshPicked={meshPicked} onSceneMount={onSceneMount}>
        <plane name="dialog" size={2} position={new Vector3(0, 1.5, 0)}></plane>
      </Scene>
    </Engine>
  );
};

export default ComponentTerminal;
