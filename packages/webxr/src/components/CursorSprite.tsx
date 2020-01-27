import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader, useFrame, useThree } from 'react-three-fiber'

import { cursor } from './cursor'
import pointerImg from '../static/redball.png'

const CursorSprite = () => {
	const context = useThree()
	const texture = useLoader(THREE.TextureLoader, pointerImg)
	const spriteRef = useRef()
	const geometryRef = useRef()

	useFrame(() => {
		// console.log('cursor', cursor.x, cursor.y, cursor.z)
		if (spriteRef.current) {
			const sprite = spriteRef.current as any
			sprite.position.x = cursor.x
			sprite.position.y = cursor.y
			sprite.position.z = cursor.z
			sprite.needsUpdate = true
		}
		if (geometryRef.current) {
			const isXr = context.gl.xr.isPresenting
			const camera = isXr
				? context.gl.xr.getCamera(context.camera)
				: context.camera
			const cameraL = isXr ? (camera as any).cameras[0] : camera
			// console.log('camera', camera.position, cameraL.position)
			const geometry = geometryRef.current as any
			geometry.vertices[0].set(
				camera.position.x,
				camera.position.y,
				camera.position.z,
			)
			geometry.vertices[1] = cursor
			geometry.vertices[2].set(
				cursor.x - camera.position.x,
				cursor.y,
				cursor.z - camera.position.z,
			)
			console.log('geometry', camera.position, cursor, geometry.vertices[2])
			geometry.verticesNeedUpdate = true
		}
	})

	return (
		<>
			<sprite ref={spriteRef} scale={[0.1, 0.1]}>
				<spriteMaterial attach='material' map={texture} />
			</sprite>
			<line>
				<geometry
					attach='geometry'
					vertices={[
						new THREE.Vector3(0, 0, 0),
						new THREE.Vector3(0, 0, 0),
						new THREE.Vector3(0, 0, 0),
					]}
					ref={geometryRef}
				/>
				<lineBasicMaterial attach='material' color={new THREE.Color('red')} />
			</line>
		</>
	)
}

export default CursorSprite
