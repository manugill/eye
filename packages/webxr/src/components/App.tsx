import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { WebGLRenderer } from 'three'
import io from 'socket.io-client'

function Stars() {
	let group = useRef()
	let theta = 0
	useFrame(() => {
		// Some things maybe shouldn't be declarative, we're in the render-loop here with full access to the instance
		const r = 5 * Math.sin(THREE.Math.degToRad((theta += 0.01)))
		const s = Math.cos(THREE.Math.degToRad(theta * 2))
		group.current.rotation.set(r, r, r)
		group.current.scale.set(s, s, s)
	})

	const [geo, mat, coords] = useMemo(() => {
		const geo = new THREE.SphereBufferGeometry(1, 10, 10)
		const mat = new THREE.MeshBasicMaterial({
			color: new THREE.Color('lightpink'),
		})
		const coords = new Array(1000)
			.fill()
			.map(i => [
				Math.random() * 800 - 400,
				Math.random() * 800 - 400,
				Math.random() * 800 - 400,
			])
		return [geo, mat, coords]
	}, [])

	return (
		<group ref={group}>
			{coords.map(([p1, p2, p3], i) => (
				<mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
			))}
		</group>
	)
}

function Browser() {
	console.log('hello')

	const socket = useMemo(() => io('http://localhost:3001'), undefined)
	const geometry = useMemo(() => new THREE.PlaneGeometry(1080, 640), undefined)
	const material = useMemo(() => {
		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color('lightpink'),
			side: THREE.DoubleSide,
		})

		socket.on('paint', buffer => {
			// bitmap
			const imageData = new ImageData(new Uint8ClampedArray(buffer), 1080, 640)
			material.setValues({ map: new THREE.CanvasTexture(imageData) })
			//
			// png
			// const blob = new Blob([buffer], { type: 'image/bmp' })
			// const url = URL.createObjectURL(blob)
			// // console.log('buffer', buffer, blob, url)
			// let img = new Image()
			// img.onload = () => {
			// 	// console.log('img', img)
			// 	material.setValues({ map: new THREE.CanvasTexture(img) })
			// }
			// img.src = url
			//
			// jpeg handling
			// let img = new Image()
			// img.onload = () => {
			// 	material.setValues({ map: new THREE.CanvasTexture(img) })
			// }
			// img.src = URL.createObjectURL(new Blob([buffer], { type: 'image/jpeg' }))
		})

		socket.emit('move')
		setTimeout(() => socket.emit('move'), 500)

		var size = 20000
		var data = new Uint8Array(3 * size)
		for (var i = 0; i < size; i++) {
			var stride = i * 3
			data[stride] = 255
			data[stride + 1] = 0
			data[stride + 2] = 0
		}
		const texture = new THREE.DataTexture(data, 100, 100, THREE.RGBFormat)
		material.map = texture

		return material
	}, undefined)

	return (
		<mesh
			geometry={geometry}
			material={material}
			position={[0, 0, -600]}
			onClick={({ nativeEvent }) => {
				console.log('nativeEvent', nativeEvent)
				socket.emit('event', nativeEvent)
			}}
			onWheel={({ nativeEvent }) => {
				console.log('wheel spins', nativeEvent)
				// console.log('eventObj', protoObject(nativeEvent))
				// socket.emit('event', protoObject(nativeEvent))
			}}
		/>
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
	return (
		<Canvas
			vr
			camera={{ position: [0, 0, 0] }}
			onCreated={context => {
				console.log('context', context)
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
			<Browser />
		</Canvas>
	)
}
