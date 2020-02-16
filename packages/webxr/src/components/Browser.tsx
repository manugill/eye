import * as THREE from 'three'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useThree, ReactThreeFiber } from 'react-three-fiber'
import io from 'socket.io-client'

import vrRaycast, { isClosest } from './vrRaycast'

const keyboardEvent = event => {
	const keyFilter = ['Control', 'Shift', 'Alt', 'Meta', 'Command']
	const keys = [
		event.ctrlKey && 'Control',
		event.shiftKey && 'Shift',
		event.altKey && 'Alt',
		event.metaKey && 'Command',
		keyFilter.some(k => k === event.key)
			? undefined
			: event.key.startsWith('Arrow')
			? event.key.substr(5)
			: event.key,
	].filter(k => !!k)
	return {
		keyCode: keys.join('+'),

		type:
			event.type === 'keyup'
				? 'keyUp'
				: event.type === 'keydown'
				? 'keyDown'
				: 'char',
	}
}

const mouseEvent = mesh => (resolution, event) => {
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
	position = [0, 0, 0],
	meshProps = {},
}: {
	url?: string
	resolution?: [number, number]
	size?: [number, number]
	position?: ReactThreeFiber.Vector3
	meshProps?: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
}) => {
	const context = useThree()
	console.log('context', context)

	const meshRef = useRef()
	const mesh = meshRef.current as any

	const meshDevToolsRef = useRef()
	const meshDevTools = meshDevToolsRef.current as any

	const propDeps = [url, resolution[0], resolution[1]]
	const socket = useMemo(
		() =>
			io('http://localhost:3001', {
				transports: ['websocket', 'polling'],
				query: `width=${resolution[0]}&height=${resolution[1]}&url=${url}`,
			}),
		[],
	)

	const materialFunction = (isDevTools = false) => material => {
		if (!material) return
		console.log('actualling creating material', material)
		// const mesh = material.parent

		// an image texture has to be loaded to use copyTextureToTexture
		// may be a data texture works too but I didn't know how to use it
		const loader = new THREE.TextureLoader()
		const texture = loader.load(
			`https://images.unsplash.com/source-404?fit=crop&fm=jpg&q=60&w=${resolution[0]}&h=${resolution[1]}`,
			texture => {
				socket.on('paint', ({ devTools, paint: { time, buffer, rect } }) => {
					if (devTools !== isDevTools) return
					const receivedTime = Date.now()
					// console.log('devTools', devTools, time)

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

				socket.emit('move')
				setTimeout(() => socket.emit('move'), 500)
				setTimeout(() => socket.emit('move'), 100)

				texture.minFilter = THREE.LinearFilter
				texture.generateMipmaps = false
			},
		)
		material.setValues({ map: texture })
	}
	const materialRef = useCallback(materialFunction(), [])
	const materialDevToolsRef = useCallback(materialFunction(true), [])

	const raycast = useMemo(() => vrRaycast(context), [context])

	const makeProps = (devTools = false) => {
		console.log('devTools hello', devTools)
		const emit = event => socket.emit('event', { ...event, devTools })
		const m = devTools ? meshDevTools : mesh
		const mouse = mouseEvent(m)
		const eventProps = {
			onKeyDown: event => {
				const keyEvent = keyboardEvent(event)
				console.log('onKeyDown', keyEvent, m)
				emit(keyEvent)
				if (keyEvent.keyCode.length === 1)
					emit({
						...keyEvent,
						type: 'char',
						devTools,
					})
			},
			onKeyUp: event => {
				const keyEvent = keyboardEvent(event)
				emit(keyEvent)
			},
			onPointerMove: event => {
				if (!isClosest(m)) return
				emit({
					type: 'mouseMove',
					...mouse(resolution, event),
				})
			},
			onPointerDown: event => {
				if (!isClosest(m)) return
				console.log('onPointerDown', mouse(resolution, event))
				emit({
					type: 'mouseDown',
					...mouse(resolution, event),
				})
			},
			onPointerUp: event => {
				if (!isClosest(m)) return
				emit({
					type: 'mouseUp',
					...mouse(resolution, event),
				})
			},
			onPointerOut: event => {
				// if (!isClosest(m)) return
				emit({
					type: 'mouseLeave',
					...mouse(resolution, event),
				})
			},
			onPointerOver: event => {
				if (!isClosest(m)) return
				emit({
					type: 'mouseEnter',
					...mouse(resolution, event),
				})
			},
			onWheel: event => {
				if (!isClosest(m)) return
				emit({
					type: 'mouseWheel',
					...mouse(resolution, event),
					deltaX: (event as any).deltaX,
					deltaY: (event as any).deltaY,
				})
			},
		}

		// make sure to online fire events when this is the "closest" item
		// for (var key in eventProps) {
		// 	eventProps[key] = event => {
		// 		if (key !== 'onPointerOut' && !isClosest(m)) return
		// 		eventProps[key](event)
		// 	}
		// }

		return eventProps
	}

	return (
		<>
			<mesh
				position={position}
				{...meshProps}
				ref={meshRef}
				raycast={raycast}
				{...makeProps()}>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' color='white' ref={materialRef} />
			</mesh>
			<mesh
				position={[position[0] + size[0] + 0.1, position[1], position[2]]}
				{...meshProps}
				ref={meshDevToolsRef}
				raycast={raycast}
				{...makeProps(true)}>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial
					attach='material'
					color='white'
					ref={materialDevToolsRef}
				/>
			</mesh>
		</>
	)
}

export default Browser
