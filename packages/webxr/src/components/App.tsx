import * as THREE from 'three'
import React, { Suspense, useState, useRef, useCallback, useMemo } from 'react'
import { Canvas, CanvasContext, Dom } from 'react-three-fiber'

import Browser from './Browser'
import CursorSprite from './CursorSprite'
import createButton from './createButton'
import { cursor, eventToXY, eventToZ } from './cursor'

export default function App() {
	const [context, setContext] = useState<CanvasContext>()
	const [xr, setXr] = useState()

	return (
		<Canvas
			vr
			onWheel={event => {
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
			onPointerDown={event => {
				if (!context) return
				event.persist()
				context.events.onPointerDown(event)
				if (context.gl.xr.isPresenting) {
					context.gl.domElement.requestPointerLock()
				}
			}}
			onCreated={context => {
				setContext(context)
				const sessionCallback = session => {
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
				<Browser
					{...{
						url: 'https://about.google',
						size: [600, 600],
						meshProps: {
							position: [-300, 2, -500],
						},
					}}
				/>
				<Browser
					{...{
						size: [1080, 1080],
						meshProps: {
							position: [1, 1, -700],
						},
					}}
				/>
				<CursorSprite />
			</Suspense>
		</Canvas>
	)
}
