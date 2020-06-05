import * as THREE from 'three'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useThree, ReactThreeFiber } from 'react-three-fiber'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

const meshProps = {}
const position = [-300, 2, -500]
const size = [600, 600]

const ComponentTerminal = () => {
	const meshRef = useRef()
	var term = new Terminal({
		allowTransparency: true,
	})
	const el = document.querySelector('#terminal1')
	term.open(el)
	term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
	console.log('AMIt')
	const materialRef1 = useCallback((material) => {
		const canvas: HTMLCanvasElement = el.querySelector('.xterm-selection-layer')
		const texture = new THREE.Texture(canvas)

		material.setValues({ map: texture, transparent: true })
		//TODO: Set Event as per layer
		term.onSelectionChange(() => {
			texture.needsUpdate = true
		})
	}, [])

	const materialRef2 = useCallback((material) => {
		const canvas: HTMLCanvasElement = el.querySelector('.xterm-link-layer')
		const texture = new THREE.Texture(canvas)

		material.setValues({ map: texture, transparent: true })
		//TODO: Set Event as per layer
		term.onSelectionChange(() => {
			texture.needsUpdate = true
		})
	}, [])

	const materialRef3 = useCallback((material) => {
		const canvas: HTMLCanvasElement = el.querySelector('.xterm-text-layer')
		const texture = new THREE.Texture(canvas)

		material.setValues({ map: texture, transparent: true })
		//TODO: Set Event as per layer
		term.onSelectionChange(() => {
			texture.needsUpdate = true
		})
	}, [])

	const materialRef4 = useCallback((material) => {
		const canvas: HTMLCanvasElement = el.querySelector('.xterm-cursor-layer')
		const texture = new THREE.Texture(canvas)

		material.setValues({ map: texture, transparent: true })
		//TODO: Set Event as per layer
		term.onSelectionChange(() => {
			texture.needsUpdate = true
		})
	}, [])
	return (
		<>
			<mesh
				position={position}
				{...meshProps}
				ref={meshRef}
				// raycast={raycast}
			>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' ref={materialRef1} />
			</mesh>
			<mesh
				position={position}
				{...meshProps}
				ref={meshRef}
				// raycast={raycast}
			>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' ref={materialRef2} />
			</mesh>
			<mesh
				position={position}
				{...meshProps}
				ref={meshRef}
				// raycast={raycast}
			>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' ref={materialRef3} />
			</mesh>
			<mesh
				position={position}
				{...meshProps}
				ref={meshRef}
				// raycast={raycast}
			>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' ref={materialRef4} />
			</mesh>
		</>
	)
}

export default ComponentTerminal
