import * as THREE from 'three'
import React, { useState, useRef, useMemo } from 'react'
import { Canvas, CanvasContext } from 'react-three-fiber'
import { WebGLRenderer } from 'three'
import io from 'socket.io-client'

const mouseCoords = (mesh, e) => {
	const x = mesh.geometry.parameters.width / 2 + e.point.x
	const y = mesh.geometry.parameters.height / 2 + (-e.point.y)
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
	}
}

function Browser() {
	const meshRef = useRef()
	const mesh = meshRef.current as any

	const socket = useMemo(() => io('http://localhost:3001'), undefined)
	const geometry = useMemo(() => new THREE.PlaneGeometry(1200, 800), undefined)
	const material = useMemo(() => {
		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color('lightpink'),
			side: THREE.DoubleSide,
		})

		socket.on('paint', buffer => {
			// bitmap
			// console.log('buffer', buffer)
			// const imageData = new ImageData(new Uint8ClampedArray(buffer), 1080, 640)
			// console.log('-- imageData', imageData)
			// material.setValues({ map: new THREE.CanvasTexture(imageData) })
			//
			// png or jpeg
			let img = new Image()
			img.onload = () =>
				material.setValues({ map: new THREE.CanvasTexture(img) })
			img.src = URL.createObjectURL(new Blob([buffer]))
		})

		socket.emit('move')
		setTimeout(() => socket.emit('move'), 500)

		return material
	}, undefined)



	return (
		<>
			<mesh
				ref={meshRef}
				geometry={geometry}
				material={material}
				position={[0, 0, -600]}
				onPointerMove={e => {
					socket.emit('event', { type: 'mouseMove', ...mouseCoords(mesh, e) })
				}}
				onPointerDown={e => {
					socket.emit('event', { type: 'mouseDown', ...mouseCoords(mesh, e) })
				}}
				onPointerUp={e => {
					socket.emit('event', { type: 'mouseUp', ...mouseCoords(mesh, e) })
				}}
				onPointerOut={e => {
					socket.emit('event', { type: 'mouseLeave', ...mouseCoords(mesh, e) })
				}}
				onPointerOver={e => {
					socket.emit('event', { type: 'mouseEnter', ...mouseCoords(mesh, e) })
				}}
				onWheel={e => {
					socket.emit('event', {
						type: 'mouseWheel',
						...mouseCoords(mesh, e),
						deltaX: e.deltaX,
						deltaY: e.deltaY,
					})
				}}
			/>
		</>
	)
}

// other stuff
const createButton = function(
	renderer: WebGLRenderer,
	sessionCallback = undefined,
) {
	var currentSession

	function showEnterVR(/*device*/) {
		function onSessionStarted(session) {
			session.addEventListener('end', onSessionEnded)

			renderer.xr.setSession(session)
			button.textContent = 'EXIT VR'

			currentSession = session
			if (sessionCallback) sessionCallback(session)
		}

		function onSessionEnded(/*event*/) {
			if (currentSession)
				currentSession.removeEventListener('end', onSessionEnded)

			button.textContent = 'ENTER VR'

			currentSession = null
			if (sessionCallback) sessionCallback(null)
		}

		button.style.display = ''

		button.style.cursor = 'pointer'
		button.style.left = 'calc(50% - 50px)'
		button.style.width = '200px'

		button.textContent = 'ENTER VR'

		button.onmouseenter = function() {
			button.style.opacity = '1.0'
		}

		button.onmouseleave = function() {
			button.style.opacity = '0.5'
		}

		var sessionInit = {
			optionalFeatures: ['local-floor', 'bounded-floor'],
		}

		function requestSession() {
			if (!currentSession) {
				// WebXR's requestReferenceSpace only works if the corresponding feature
				// was requested at session creation time. For simplicity, just ask for
				// the interesting ones as optional features, but be aware that the
				// requestReferenceSpace call will fail if it turns out to be unavailable.
				// ('local' is always available for immersive sessions and doesn't need to
				// be requested separately.)
				navigator.xr
					.requestSession('immersive-vr', sessionInit)
					.then(onSessionStarted)
			}
		}

		button.onclick = function() {
			if (!currentSession) {
				requestSession()
			} else {
				currentSession.end()
			}
		}
	}

	function disableButton() {
		button.style.display = ''

		button.style.cursor = 'auto'
		button.style.left = 'calc(50% - 75px)'
		button.style.width = '150px'

		button.onmouseenter = null
		button.onmouseleave = null

		button.onclick = null
	}

	function showWebXRNotFound() {
		disableButton()

		button.textContent = 'VR NOT SUPPORTED'
	}

	function stylizeElement(element) {
		element.style.position = 'absolute'
		element.style.bottom = '20px'
		element.style.padding = '12px 6px'
		element.style.border = '1px solid #fff'
		element.style.borderRadius = '4px'
		element.style.background = 'rgba(0,0,0,0.75)'
		element.style.color = '#fff'
		element.style.font = 'normal 13px sans-serif'
		element.style.textAlign = 'center'
		element.style.opacity = '0.5'
		element.style.outline = 'none'
		element.style.zIndex = '999'
	}

	if ('xr' in navigator) {
		var button = document.createElement('button')
		button.style.display = 'none'

		stylizeElement(button)

		navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
			supported ? showEnterVR() : showWebXRNotFound()
		})

		return button
	} else {
		var message = document.createElement('a')
		message.href = 'https://immersiveweb.dev/'

		if (window.isSecureContext === false) {
			message.innerHTML = 'WEBXR NEEDS HTTPS' // TODO Improve message
		} else {
			message.innerHTML = 'WEBXR NOT AVAILABLE'
		}

		message.style.left = 'calc(50% - 90px)'
		message.style.width = '180px'
		message.style.textDecoration = 'none'

		stylizeElement(message)

		return message
	}
}

export default function App() {
	const [context, setContext] = useState<CanvasContext>(undefined)
	return (
		<Canvas
			vr
			camera={{ position: [0, 0, 0] }}
			onCreated={context => {
				setContext(context)
				document.body.appendChild(createButton(context.gl))
			}}>
			<ambientLight intensity={0.5} />
			<spotLight
				intensity={0.6}
				position={[30, 30, 50]}
				angle={0.2}
				penumbra={1}
				castShadow
			/>
			<Browser context={context} />
		</Canvas>
	)
}
