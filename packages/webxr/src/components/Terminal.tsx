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
	// const mesh = meshRef.current as any

	const materialRef = useCallback((material) => {
		console.log('material', material)

		const el = document.querySelector('#terminal1')
		var term = new Terminal({
			allowTransparency: true,
		})

		term.open(el)
		term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

		const canvas: HTMLCanvasElement = el.querySelector('.xterm-text-layer')
		const texture = new THREE.Texture(canvas)

		material.setValues({ map: texture })
		texture.needsUpdate = true
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
				<meshBasicMaterial attach='material' color='red' ref={materialRef} />
			</mesh>
		</>
	)
}

export default ComponentTerminal
