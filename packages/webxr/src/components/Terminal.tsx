import * as THREE from 'three'
import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useThree, ReactThreeFiber } from 'react-three-fiber'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

const meshProps = {}

const classes = [
	'.xterm-selection-layer',
	'.xterm-link-layer',
	'.xterm-text-layer',
	'.xterm-cursor-layer',
]

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

		term.onKey((key) => {
			const char = key.domEvent.key
			if (char === 'Enter') {
				console.log('Enter pressed')
				prompt()
			} else {
				term.write(char)
				console.log(char)
			}
		})

		classes.map((className, index) => {
			const material = materials[index]
			const canvas: HTMLCanvasElement = el.querySelector(className)
			const texture = new THREE.Texture(canvas)

			material.setValues({ map: texture, transparent: true })
		})

		// TODO: @Amit, please fix this
		term.onSelectionChange(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		term.onRender(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		term.onCursorMove(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		term.onLineFeed(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
		term.onKey(() => {
			materials.map((material) => (material.map.needsUpdate = true))
		})
	}, [materials])

	return (
		<>
			{classes.map((_, index) => (
				<mesh
					key={index}
					position={position}
					{...meshProps}
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
