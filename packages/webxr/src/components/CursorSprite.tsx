import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader, useFrame, useThree } from 'react-three-fiber'

import { cursor } from './cursor'
import { currentIntersects } from './vrRaycast'
import pointerImg from '../static/redball.png'

const CursorSprite = () => {
	const context = useThree()
	const texture = useLoader(THREE.TextureLoader, pointerImg)
	const spriteRef = useRef()
	const geometryRef = useRef()
	const geometry2Ref = useRef()

	useFrame(() => {
		const isXr = context.gl.xr.isPresenting
		const camera = isXr
			? context.gl.xr.getCamera(context.camera)
			: context.camera

		if (spriteRef.current) {
			const sprite = spriteRef.current as any
			const intersects = Object.values<any>(currentIntersects)
			// console.log('intersects', intersects)
			if (intersects.length) {
				const { point } = intersects[0]
				sprite.position.x = point.x
				sprite.position.y = point.y
				sprite.position.z = point.z + 0.01
			} else {
				sprite.position.x = cursor.x
				sprite.position.y = cursor.y
				sprite.position.z = cursor.z
			}
			sprite.needsUpdate = true
		}
		if (geometryRef.current && geometry2Ref.current) {
			const geometry = geometryRef.current as any
			const geometry2 = geometry2Ref.current as any
			// geometry.vertices[0].set(
			// 	camera.position.x,
			// 	camera.position.y,
			// 	camera.position.z - 0.2,
			// )
			// geometry.vertices[1] = cursor

			const A = camera.position
			const B = cursor

			const lenAB = Math.sqrt(
				Math.pow(A.x - B.x, 2) +
					Math.pow(A.y - B.y, 2) +
					Math.pow(A.z - B.z, 2),
			)
			const length = 100
			geometry2.vertices[0] = cursor
			geometry2.vertices[1].set(
				B.x + ((B.x - A.x) / lenAB) * length,
				B.y + ((B.y - A.y) / lenAB) * length,
				B.z + ((B.z - A.z) / lenAB) * length,
			)

			// console.log('camera', camera.position, cameraL.position)
			// console.log('geometry', camera.position, cursor, geometry.vertices[2])
			geometry.verticesNeedUpdate = true
			geometry2.verticesNeedUpdate = true
		}
	})

	return (
		<>
			<sprite ref={spriteRef} scale={[10, 10]}>
				<spriteMaterial attach='material' map={texture} />
			</sprite>
			<line>
				<geometry
					attach='geometry'
					ref={geometryRef}
					vertices={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]}
				/>
				<lineBasicMaterial attach='material' color='white' />
			</line>
			<line>
				<geometry
					attach='geometry'
					ref={geometry2Ref}
					vertices={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]}
				/>
				<lineBasicMaterial attach='material' color='red' />
			</line>
		</>
	)
}

export default CursorSprite
