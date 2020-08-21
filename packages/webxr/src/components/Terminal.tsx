import * as THREE from 'three'
<<<<<<< HEAD
import React, { useEffect, useRef, useMemo } from 'react'
=======
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
>>>>>>> 1d26d4080b636e410d4c938ffbecfa5cea6bcc7f
import { useThree, ReactThreeFiber } from 'react-three-fiber'

import createTerminal from '../fn/createTerminal'

const meshProps = {}

var term = new Terminal({
	allowTransparency: true,
	cursorBlink: true,
})
var prompt = () => {
	var shellprompt = '$ '
	term.write('\r\n' + shellprompt)
}
const el = document.querySelector('#terminal1')
term.open(el)

term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

const classes = [
	'.xterm-selection-layer',
	'.xterm-link-layer',
	'.xterm-text-layer',
	'.xterm-cursor-layer',
]

// term.onData((data) => {
// 	console.log(data)
// })

const ComponentTerminal = ({
	size = [720, 480],
	position = [-375, 100, -500],
}) => {
	const refs = classes.map(() => useRef())
	const materials = refs.map((ref) => ref.current)
	// console.log('materials', materials)
	// const addMaterial = (material) => setMaterials([...materials, material])

	useMemo(() => {
		if (materials.some((material) => !material)) {
			// do not run until all materials are ready (i.e. not undefined)
			return undefined
		}

		const { terminal, element } = createTerminal()

		terminal.write('hello')

		setInterval(() => terminal.write('2'), 1000)

		terminal.onKey((key) => {
			console.log('char', key.domEvent.key, key)

			const char = key.domEvent.key
			if (char === 'Enter') {
				console.log('Enter pressed')
				// prompt()
			} else {
				terminal.write(char)
				console.log(char)
			}
		})

		classes.map((className, index) => {
			const material = materials[index]
			const canvas: HTMLCanvasElement = element.querySelector(className)
			const texture = new THREE.Texture(canvas)

			material.setValues({ map: texture, transparent: true })
		})

		terminal.onSelectionChange(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		terminal.onRender(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		terminal.onCursorMove(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		terminal.onLineFeed(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		terminal.onKey(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		term.onData(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
	}, [materials])

	return (
		<>
			{classes.map((_, index) => (
				<mesh
					key={index}
					position={position}
					// raycast={raycast}
				>
					<planeGeometry attach='geometry' args={size} />
					<meshBasicMaterial attach='material' ref={refs[index]} />
				</mesh>
			))}
		</>
	)
}

export default ComponentTerminal
