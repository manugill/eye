import React, { useState, useRef } from 'react'
import { Engine, Scene, useBabylonScene } from 'react-babylonjs'
import { Vector3 } from '@babylonjs/core'
import Hotkeys from 'react-hot-keys'

import Terminal from './Terminal'
import Editor from './Editor'

const cameraPosition = new Vector3(0, 0, -10)
const lightVectors = [
  Vector3.Up(),
  Vector3.Down(),
  Vector3.Left(),
  Vector3.Right(),
]

const keyboardInput = (input) => {
  var output = {
    1: function () {
      return console.log('onKeyDown', input)
    },
    2: function () {
      return console.log('onKeyUp')
    },
  }
  return output[input.type]()
}

const mouseInput = (input) => {
  console.log('mouse', input)
}

const App = () => {
  const [focus, setFocus] = useState(undefined)
  const [scene, setScene] = useState(undefined)
  const [pointerMove, setPointerMove] = useState(undefined)
  const [pointerDown, setPointerDown] = useState(undefined)
  const [pointerUp, setPointerUp] = useState(undefined)

  const resetPointer = () => {
    setPointerDown(undefined)
    setPointerUp(undefined)
  }

  const focusProps = (name: string) => ({
    setFocus: () => focus !== name && setFocus(name),
    focus: focus === name,
  })

  function mousemovef() {
    var pickResult = scene.pick(scene.pointerX, scene.pointerY)

    console.log(pickResult)
  }

  return (
    <Engine canvasId='main-canvas' antialias={true}>
      <Scene
        onKeyboardObservable={(e) => {
          keyboardInput(e)
        }}
        onPointerMove={(e, pickResult, pointerType) => {
          //console.log(pickResult);
          //setPointerMove(e);
          //mousemovef();
          //resetPointer();
        }}
        onPointerUp={(e, pickResult) => {
          // console.log(pickResult);
          //setPointerUp(pickResult);
        }}
        onPointerDown={
          (e, pickResult) => {
            // console.log(pickResult);
            // console.log(e);

            setPointerDown(pickResult)
          }
          // !scene
          //   ? undefined
          //   : (e) => {
          //       setPointerDown(e);
          //       const { pickedPoint } = scene.pick(e.x, e.y);
          //       if (!pickedPoint) setFocus(undefined);
          //     }
        }
        // onMeshPicked={(...params) => {
        //   console.log('onMeshPicked', ...params);
        // }}
        onSceneMount={({ scene }) => {
          setScene(scene)
        }}
      >
        <followCamera
          name='camera1'
          position={cameraPosition}
          setTarget={[Vector3.Zero()]}
        />

        {lightVectors.map((vector, i) => (
          <hemisphericLight
            key={i}
            name='light'
            intensity={0.5}
            direction={vector}
          />
        ))}

        <Editor
          pointerMove={pointerMove}
          pointerDown={pointerDown}
          pointerUp={pointerUp}
        />

        {/* <Terminal
          position={new Vector3(2, -3, 5)}
          {...focusProps("terminal-1")}
        />
        <Terminal
          position={new Vector3(0, 2, 0)}
          {...focusProps("terminal-2")}
        /> */}
      </Scene>
    </Engine>
  )
}

export default App
