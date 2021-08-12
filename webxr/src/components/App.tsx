import React, { useRef } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Browser from './Browser'
import CursorSprite from './CursorSprite'
import Layout from './Layout'

extend({ OrbitControls })

const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls class.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  const {
    camera,
    gl: { domElement },
  } = useThree()

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef<any>()
  useFrame(() => controls?.current?.update())
  return React.createElement('orbitControls', {
    ref: controls,
    args: [camera, domElement],
    enableZoom: false,
    maxAzimuthAngle: Math.PI / 4,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Math.PI / 4,
    minPolarAngle: 0,
  })
}

const App = () => {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <CameraControls />

      {/* <CursorSprite /> */}
      {/* <Layout /> */}
      <Browser />
    </Canvas>
  )
}

export default App
