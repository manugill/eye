import * as THREE from 'three'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useThree, ReactThreeFiber } from 'react-three-fiber'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import { WebglAddon } from 'xterm-addon-webgl'

const position = [-300, 2, -500]
const size = [600, 600]

const ComponentTerminal = () => {
	const [material, setMaterial] = useState([])

	const meshRef = useCallback((mesh: THREE.Mesh) => {
		console.log('mesh', mesh)

		const el = document.querySelector('#terminal1')
		var term = new Terminal({
			allowTransparency: true,
		})
		term.open(el)
		// term.loadAddon(new WebglAddon())
		term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

		// const classes = ['canvas:not(.xterm-link-layer):not(.xterm-cursor-layer)']
		const classes = ['.xterm-selection-layer', '.xterm-text-layer']

		const textures = classes.map((className) => {
			const canvas: HTMLCanvasElement = el.querySelector(className)
			console.log('canvas', canvas)
			const texture = new THREE.Texture(canvas)
			texture.needsUpdate = true

			return texture
		})

		const materials = textures.map((texture) => {
			const material = new THREE.MeshBasicMaterial()
			material.setValues({ map: texture })
			return material
		})

		term.onSelectionChange(() => {
			console.log('onRender')
			textures.forEach((texture) => (texture.needsUpdate = true))
		})

		setMaterial(materials)
	}, [])

	return (
		<>
			<mesh
				position={position}
				material={material}
				ref={meshRef}
				// raycast={raycast}
			>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' color='red' />
			</mesh>
		</>
	)
}

export default ComponentTerminal
