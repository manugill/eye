import * as THREE from 'three'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useThree, ReactThreeFiber } from 'react-three-fiber'

import createTerminal from '../fn/createTerminal'

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
