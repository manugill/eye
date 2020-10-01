import React, { useState } from 'react'
import { Engine, Scene } from 'react-babylonjs'
import { Vector3 } from '@babylonjs/core'

import Terminal from './Terminal'
// import Browser from './Browser'
import Editor from './Editor'

const cameraPosition = new Vector3(0, 0, -10)
const lightVectors = [
  Vector3.Up(),
  Vector3.Down(),
  Vector3.Left(),
  Vector3.Right(),
]

export type ViewProps = {
  position?: Vector3
  width?: number
  height?: number
  fontSize?: number
  scaleFactor?: number
  focus?: boolean
  setFocus?: () => void
}

const App = () => {
  const [focus, setFocus] = useState(undefined)

  const focusProps = (name: string) => ({
    setFocus: () => focus !== name && setFocus(name),
    focus: focus === name,
  })

  return (
    <Engine canvasId='main-canvas' antialias={true}>
      <Scene
        onPointerDown={(e, pickResult) => {
          if (!pickResult.hit) setFocus(false)
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

        {/* <Terminal
          position={new Vector3(0, 0, 0)}
          {...focusProps('terminal-1')}
        /> */}

        <Editor {...focusProps('editor-1')} />
      </Scene>
    </Engine>
  )
}

export default App
