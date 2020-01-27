import * as THREE from 'three'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useThree, ReactThreeFiber } from 'react-three-fiber'
import io from 'socket.io-client'

import vrRaycast from './vrRaycast'

const mouseCoords = (mesh, resolution, event) => {
	if (!mesh) return { type: 'mouseMove', x: 0, y: 0, button: 'left' }
	const [w, h] = resolution
	const { width, height } = mesh.geometry.parameters
	const e = event
	const xTrue = e.point.x - mesh.position.x
	const yTrue = e.point.y - mesh.position.y
	const x = w / 2 + xTrue / (width / w)
	const y = h / 2 + -yTrue / (height / h)
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

const Browser = ({
	url = 'https://github.com',
	resolution = [1080, 1080],
	size = [1.08 * 2, 1.08 * 2],
	meshProps = {},
}: {
	url?: string
	resolution?: [number, number]
	size?: [number, number]
	meshProps?: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
}) => {
	const context = useThree()
	console.log('context', context)

	const meshRef = useRef()
	const mesh = meshRef.current as any

	const propDeps = [url, resolution[0], resolution[1]]
	const socket = useMemo(
		() =>
			io('http://localhost:3001', {
				transports: ['websocket', 'polling'],
				query: `width=${resolution[0]}&height=${resolution[1]}&url=${url}`,
			}),
		[],
	)

	const materialRef = useCallback(material => {
		if (!material) return
		console.log('actualling creating material')

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

					const p = new THREE.Vector2(
						rect.x,
						resolution[1] - (rect.y + rect.height),
					)

					// the server returns a jpeg
					const url = URL.createObjectURL(
						new Blob([buffer], { type: 'image/jpeg' }),
					)
					let img = new Image()
					img.onload = () => {
						const loadedTime = Date.now()
						const textureNew = new THREE.CanvasTexture(img)
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

	const raycast = useMemo(() => vrRaycast(context), [context])

	return (
		<>
			<mesh
				{...meshProps}
				ref={meshRef}
				raycast={raycast}
				onPointerMove={event => {
					socket.emit('event', {
						type: 'mouseMove',
						...mouseCoords(mesh, resolution, event),
					})
				}}
				onPointerDown={event => {
					console.log('event', event)
					socket.emit('event', {
						type: 'mouseDown',
						...mouseCoords(mesh, resolution, event),
					})
				}}
				onPointerUp={event => {
					socket.emit('event', {
						type: 'mouseUp',
						...mouseCoords(mesh, resolution, event),
					})
				}}
				onPointerOut={event => {
					socket.emit('event', {
						type: 'mouseLeave',
						...mouseCoords(mesh, resolution, event),
					})
				}}
				onPointerOver={event => {
					socket.emit('event', {
						type: 'mouseEnter',
						...mouseCoords(mesh, resolution, event),
					})
				}}
				onWheel={event => {
					socket.emit('event', {
						type: 'mouseWheel',
						...mouseCoords(mesh, resolution, event),
						deltaX: (event as any).deltaX,
						deltaY: (event as any).deltaY,
					})
				}}>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' ref={materialRef} color='white' />
			</mesh>
		</>
	)
}

export default Browser
