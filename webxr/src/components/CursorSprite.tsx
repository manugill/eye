import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader, useFrame, useThree } from '@react-three/fiber'

import { cursor } from './cursor'
import { closest } from './vrRaycast'
import pointerImg from '../static/redball.png'

const scale = 4

const CursorSprite = () => {
  const context = useThree()
  const texture = useLoader(THREE.TextureLoader, pointerImg)
  const spriteRef = useRef()
  const geometryRef = useRef()
  const geometry2Ref = useRef()

  useFrame(() => {
    if (!spriteRef.current || !geometryRef.current || !geometry2Ref.current)
      return

    const isXr = context.gl.xr.isPresenting
    const camera = isXr
      ? context.gl.xr.getCamera(context.camera)
      : context.camera

    const A = camera.position
    const B = cursor
    const lenAB = Math.sqrt(
      Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2) + Math.pow(A.z - B.z, 2)
    )
    const length = 100

    const sprite = spriteRef.current as any
    const geometry = geometryRef.current as any
    const geometry2 = geometry2Ref.current as any

    const C = closest() ? closest().point : cursor
    const lenAC = Math.sqrt(
      Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2) + Math.pow(A.z - C.z, 2)
    )
    // console.log('lenAC', lenAC)
    sprite.position.x = C.x
    sprite.position.y = C.y
    sprite.position.z = C.z + 0.75
    sprite.scale.x = lenAC * 0.02
    sprite.scale.y = lenAC * 0.02
    sprite.needsUpdate = true

    // geometry.vertices[0].set(
    // 	camera.position.x,
    // 	camera.position.y,
    // 	camera.position.z - 0.2,
    // )
    // geometry.vertices[1] = cursor

    // geometry2.vertices[0] = cursor
    // geometry2.vertices[1].set(
    //   B.x + ((B.x - A.x) / lenAB) * length,
    //   B.y + ((B.y - A.y) / lenAB) * length,
    //   B.z + ((B.z - A.z) / lenAB) * length
    // )

    // console.log('camera', camera.position, cameraL.position)
    // console.log('geometry', camera.position, cursor, geometry.vertices[2])
    geometry.verticesNeedUpdate = true
    geometry2.verticesNeedUpdate = true
  })

  return (
    <>
      <sprite ref={spriteRef} scale={[0.2, 0.2, 0.2]}>
        <spriteMaterial attach='material' map={texture} />
      </sprite>
      /* TODO: finish porting over from geometry with vertices to bufferGeometry
      & bufferAttribute
      {/* <line>
        <geometry
          attach='geometry'
          ref={geometryRef}
          // vertices={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]}
        />
        <lineBasicMaterial attach='material' color='white' />
      </line>
      <line>
        <bufferGeometry
          attach='geometry'
          ref={geometry2Ref}
          // vertices={}
        >
          <bufferAttribute  />
        </bufferGeometry>
        <lineBasicMaterial attach='material' color='red' />
      </line> */}
    </>
  )
}

export default CursorSprite
