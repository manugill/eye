import React, { useRef, useState } from 'react'
import {
  Canvas,
  extend,
  useThree,
  useFrame,
  ReactThreeFiber,
} from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import Browser from './Browser'
import CursorSprite from './CursorSprite'
import Layout from './Layout'
import Editor from './Editor'

extend({ OrbitControls })

export type ViewProps = {
  width?: number
  height?: number
  fontSize?: number
  scaleFactor?: number
  focus?: boolean
  setFocus?: () => void
  url?: string
  resolution?: [number, number]
  size?: [number, number]
  position?: ReactThreeFiber.Vector3
  meshProps?: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
}
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
  const [focus, setFocus] = useState(undefined)

  const focusProps = (name: string) => ({
    setFocus: () => focus !== name && setFocus(name),
    focus: focus === name,
  })
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {/* <CursorSprite /> */}
      {/* <Layout /> */}
      <Editor
        {...focusProps('editor-1')}
        {...{
          size: [540, 540],
          position: [-350, 1, -700],
          meshProps: {},
        }}
      />

      <Browser
        {...{
          size: [270, 270],
          position: [100, 1, -700],
          meshProps: {},
        }}
      />
    </Canvas>
  )
}

export default App
