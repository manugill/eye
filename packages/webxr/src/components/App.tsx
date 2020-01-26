import * as THREE from 'three'
import React, {
	Suspense,
	useState,
	useRef,
	useCallback,
	useMemo,
	useEffect,
} from 'react'
import {
	Canvas,
	CanvasContext,
	Dom,
	useLoader,
	useCamera,
	useUpdate,
	useThree,
} from 'react-three-fiber'
import io from 'socket.io-client'

import createButton from './createButton'
import pointerImg from '../static/redball.png'

function Sprite({ url, ...props }) {
	const texture = useLoader(THREE.TextureLoader, url)
	console.log('props', props)
	return (
		<sprite scale={[1, 1]} position={[0, 0, -10]} {...props}>
			<spriteMaterial attach='material' map={texture} />
		</sprite>
	)
}
const mouseCoords = (mesh, e) => {
	if (!mesh) return { type: 'mouseMove', x: 0, y: 0, button: 'left' }
	const x = mesh.geometry.parameters.width / 2 + e.point.x
	const y = mesh.geometry.parameters.height / 2 + -e.point.y
	// console.log('coords', e.point, mesh)
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

function Browser() {
	const context = useThree()
	const { mouse } = context
	console.log('context', context)

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

		const loader = new THREE.TextureLoader()
		const texture = loader.load(
			'https://source.unsplash.com/daily/1200x800',
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
							mesh.geometry.parameters.height - (rect.y + rect.height),
						)
						context.gl.copyTextureToTexture(p, textureNew, texture)
						console.log(
							'time diff',
							receivedTime - time,
							loadedTime - time,
							Date.now() - time,
							Date.now() - receivedTime,
							Date.now() - loadedTime,
						)
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
				position={[0, 0, -600]}
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
				<planeGeometry attach='geometry' args={[1200, 800]} />
				<meshBasicMaterial
					ref={materialRef}
					color={new THREE.Color('white')}
					attach='material'
				/>
			</mesh>
		</>
	)
}

export default function App() {
	const { mouse } = useThree()
	const [xr, setXr] = useState<any>(null)

	const updateMousePosition = () => {}

	return (
		<Canvas
			vr
			onCreated={context => {
				const sessionCallback = session => {
					console.log('session', session, context)
					if (context) {
						if (session) {
							context.gl.domElement.requestPointerLock()
						} else {
							;(document as any).exitPointerLock()
						}
					}
					setXr(session)
				}

				document.body.appendChild(createButton(context.gl, sessionCallback))
			}}>
			<ambientLight intensity={0.5} />
			<spotLight
				intensity={0.6}
				position={[30, 30, 50]}
				angle={0.2}
				penumbra={1}
				castShadow
			/>
			<Browser />
			<Suspense fallback={<Dom>loading...</Dom>}>
				<Sprite url={pointerImg} />
			</Suspense>
		</Canvas>
	)
}
