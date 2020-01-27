import * as THREE from 'three'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useThree } from 'react-three-fiber'
import io from 'socket.io-client'

import whiteImg from '../static/whiteImg.png'

const resolution = [1200, 800]
const size: [number, number] = [0.6, 0.4]
const adjust = [size[0] / resolution[0], size[1] / resolution[1]]

const mouseCoords = (mesh, e) => {
	if (!mesh) return { type: 'mouseMove', x: 0, y: 0, button: 'left' }
	const xTrue = e.point.x + mesh.position.x
	const yTrue = e.point.y - mesh.position.y
	const x = resolution[0] / 2 + xTrue / adjust[0]
	const y = resolution[1] / 2 + -yTrue / adjust[1]
	// console.log('coords', x, y)
	return {
		x,
		y,
		globalX: x,
		globalY: y,
		movementX: e.movementX,
		movementY: e.movementY,
		deltaX: e.deltaX,
		deltaY: e.deltaY,
		wheelTicksX: e.wheelTicksX,
		wheelTicksY: e.wheelTicksY,
		accelerationRatioX: 1,
		accelerationRatioY: 1,
		hasPreciseScrollingDeltas: true,
		canScroll: true,
		clickCount: 1,
		button: e.button === 1 ? 'middle' : e.button === 2 ? 'right' : 'left',
		time: Date.now(),
	}
}

const Browser = () => {
	const context = useThree()
	const { mouse } = context
	console.log('context', mouse, context)

	const meshRef = useRef()
	const mesh = meshRef.current as any
	const [currentMaterial, setMaterial] = useState<any>()

	const socket = useMemo(() => io('http://localhost:3001'), [])

	const materialRef = useCallback(material => {
		if (currentMaterial !== undefined) return
		console.log('actualling creating material')
		setMaterial(material)

		const mesh = material.parent
		console.log('material', material)

		// an image texture has to be loaded to use copyTextureToTexture
		// may be a data texture works too but I didn't know how to use it
		const loader = new THREE.TextureLoader()
		const texture = loader.load(
			`https://images.unsplash.com/source-404?fit=crop&fm=jpg&q=60&w=${resolution[0]}&h=${resolution[1]}`,
			texture => {
				socket.on('paint', ({ time, buffer, rect }) => {
					const receivedTime = Date.now()

					// bitmap
					// bitmap doesn't work on macOS
					// const arr =  new Uint8ClampedArray(buffer)
					// console.log('- clamped', arr)
					// const imageData = new ImageData(arr, rect.width, rect.height)
					// const tNew = new THREE.CanvasTexture(imageData)
					// const p = new THREE.Vector2(rect.x, mesh.geometry.parameters.height -(rect.y + rect.height))
					// // context.gl.copyTextureToTexture(p, tNew, texture)
					// material.setValues({ map: tNew })
					//
					// png or jpeg
					const url = URL.createObjectURL(
						new Blob([buffer], { type: 'image/jpeg' }),
					)

					let img = new Image()
					img.onload = () => {
						const loadedTime = Date.now()
						const textureNew = new THREE.CanvasTexture(img)
						const p = new THREE.Vector2(
							rect.x,
							resolution[1] - (rect.y + rect.height),
						)
						context.gl.copyTextureToTexture(p, textureNew, texture)
					}
					img.src = url
				})

				setTimeout(() => socket.emit('move'), 500)

				texture.minFilter = THREE.LinearFilter
				texture.generateMipmaps = false
			},
		)
		material.setValues({ map: texture })
	}, [])

	// const raycast = useMemo(() => {
	// 	if (!context) return undefined

	// 	// const camera = vr
	// 	// 	? context.gl.xr.getCamera(context.camera).cameras[1]
	// 	// 	: context.camera
	// 	// let raycaster = new THREE.Raycaster()

	// 	console.log('oh yeah, got camera!')
	// 	return function(
	// 		_: THREE.Raycaster,
	// 		intersects: THREE.Intersection[],
	// 	): void {
	// 		if (!vr) {
	// 			raycaster.setFromCamera(mouse, camera)
	// 			const rc = this.constructor.prototype.raycast.bind(this)
	// 			if (rc) rc(raycaster, intersects)
	// 		} else {
	// 			const { domElement } = context.gl
	// 			var rW = camera.viewport.z / domElement.width
	// 			var rH = camera.viewport.w / domElement.height
	// 			var rX = camera.viewport.x / domElement.height
	// 			var rY = camera.viewport.y / domElement.height
	// 			// mouse.x = (x / WIDTH) * 2 - 1
	// 			// mouse.y = -(y / HEIGHT) * 2 + 1
	// 			console.log('ratios', rW, rH, rX, rY, camera.viewport)
	// 			console.log('adjusted x', mouse.x, mouse.x / 0.5 + 1)
	// 			console.log('adjusted y', mouse.y, mouse.y / 1)
	// 			mouse.setX(mouse.x / 0.5 + 1)

	// 			raycaster.setFromCamera(mouse, camera)
	// 			const rc = this.constructor.prototype.raycast.bind(this)
	// 			// console.log('rc', mouse, raycaster)
	// 			if (rc) rc(raycaster, intersects)
	// 		}
	// 	}
	// }, [!!context, vr])

	return (
		<>
			<mesh
				ref={meshRef}
				// raycast={raycast}
				position={[0, 1, -1]}
				onPointerMove={e => {
					socket.emit('event', {
						type: 'mouseMove',
						...mouseCoords(mesh, e),
					})
				}}
				onPointerDown={e => {
					socket.emit('event', {
						type: 'mouseDown',
						...mouseCoords(mesh, e),
					})
				}}
				onPointerUp={e => {
					socket.emit('event', { type: 'mouseUp', ...mouseCoords(mesh, e) })
				}}
				onPointerOut={e => {
					socket.emit('event', {
						type: 'mouseLeave',
						...mouseCoords(mesh, e),
					})
				}}
				onPointerOver={e => {
					socket.emit('event', {
						type: 'mouseEnter',
						...mouseCoords(mesh, e),
					})
				}}
				onWheel={e => {
					socket.emit('event', {
						type: 'mouseWheel',
						...mouseCoords(mesh, e),
						deltaX: (e as any).deltaX,
						deltaY: (e as any).deltaY,
					})
				}}>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial
					attach='material'
					ref={materialRef}
					color={new THREE.Color('white')}
				/>
			</mesh>
		</>
	)
}

export default Browser
