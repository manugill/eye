import * as THREE from 'three'
import React, { Suspense, useState, useRef, useCallback, useMemo } from 'react'
import { Canvas, CanvasContext, Dom, ReactThreeFiber } from 'react-three-fiber'
import Hotkeys from 'react-hot-keys'
import vrRaycast, { focus } from './vrRaycast'

import Browser from './Browser'
import Terminal from './Terminal'
import CursorSprite from './CursorSprite'
import createButton from './createButton'
import { cursor, eventToXY, eventToZ } from './cursor'

import Editor from './Editor'

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

export default function App() {
	const [context, setContext] = useState<CanvasContext>()
	const [xr, setXr] = useState()

	const raycast = useMemo(() => vrRaycast(context), [context])

	const [focus, setFocus] = useState(undefined)

	const focusProps = (name: string) => ({
		setFocus: () => focus !== name && setFocus(name),
		focus: focus === name,
	})

	return (
		<Hotkeys allowRepeat keyName='*'>
			<Canvas
				tabIndex={0}
				vr
				// onBlur={event => {
				// 	event.target.focus()
				// 	console.log('onBlur', event)
				// }}
				onKeyDown={(event) => {
					event.preventDefault()
					event.persist()
					const handler = focus && focus.__handlers && focus.__handlers.keyDown
					if (handler) handler(event)
				}}
				onKeyPress={(event) => {
					event.preventDefault()
					event.persist()
					console.log('onKeyPress', event)
				}}
				onKeyUp={(event) => {
					event.preventDefault()
					event.persist()
					const handler = focus && focus.__handlers && focus.__handlers.keyUp
					if (handler) handler(event)
				}}
				onWheel={(event) => {
					if (!context) return
					event.persist()
					if (event.shiftKey) {
						// move the cursor in z when scrolling with shift
						eventToZ(event)
					} else {
						// otherwise, fire other onWheel events
						context.events.onWheel(event)
					}
				}}
				onPointerDown={(event) => {
					if (!context) return
					event.persist()
					context.events.onPointerDown(event)
					if (context.gl.xr.isPresenting && !document.pointerLockElement) {
						cursor.setX(0)
						cursor.setY(0)
						context.gl.domElement.requestPointerLock()
					}
				}}
				onPointerMove={(event) => {
					if (!context) return
					// event.persist()
					context.events.onPointerMove(event)
					eventToXY(event)
				}}
				onContextMenu={(event) => {
					event.preventDefault()
				}}
				onCreated={(context) => {
					setContext(context)
					const sessionCallback = (session) => {
						cursor.setX(0)
						cursor.setY(0)
						console.log('session', session, context)
						if (session) {
							context.gl.domElement.requestPointerLock()
						} else {
							;(document as any).exitPointerLock()
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
				<Suspense
					fallback={
						<Dom>
							<>loading...</>
						</Dom>
					}>
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

					{/* <Browser
						{...{
							url: 'https://www.google.com',
							size: [600, 600],
							position: [-300, 2, -500],
							meshProps: {},
						}}
					/> */}

					<CursorSprite />
				</Suspense>
			</Canvas>
		</Hotkeys>
	)
}
