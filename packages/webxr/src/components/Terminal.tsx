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

	const material1Ref = useCallback((material1) => {
		

		const el = document.querySelector('#terminal1')
		var term = new Terminal({
			allowTransparency: true,
		})

		term.open(el)
		term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

		const canvas1: HTMLCanvasElement = el.querySelector('.xterm-text-layer')
		const texture1 = new THREE.Texture(canvas1)
		
		material1.setValues({ map: texture1 , transparent: true})
		texture1.needsUpdate = true

	},[])
	
	const material2Ref = useCallback((material2) => {
		

		const el = document.querySelector('#terminal1')
		const canvas2: HTMLCanvasElement = el.querySelector('.xterm-selection-layer')
		const texture2 = new THREE.Texture(canvas2)
		material2.setValues({ map: texture2 , transparent: true})
		texture2.needsUpdate = true

	
	},[])
	const material3Ref = useCallback((material3) => {
		

		const el = document.querySelector('#terminal1')
		const canvas3: HTMLCanvasElement = el.querySelector('.xterm-link-layer')
		const texture3 = new THREE.Texture(canvas3)
		material3.setValues({ map: texture3 , transparent: true})
		texture3.needsUpdate = true

	
	},[])
	const material4Ref = useCallback((material4) => {
		

		const el = document.querySelector('#terminal1')
		const canvas4: HTMLCanvasElement = el.querySelector('.xterm-cursor-layer')
		const texture4 = new THREE.Texture(canvas4)
		material4.setValues({ map: texture4 , transparent: true})
		texture4.needsUpdate = true

	
	},[])

	
	

	return (
		<>
			<mesh
				position={position}
				{...meshProps}
				ref={meshRef}
				// raycast={raycast}
			>
				<planeGeometry attach='geometry' args={size} />
				
				<meshBasicMaterial attach='material1' ref={material1Ref} />
				<meshBasicMaterial attach='material2' ref={material2Ref} />
				<meshBasicMaterial attach='material3' ref={material3Ref} />
				<meshBasicMaterial attach='material4' ref={material4Ref} />
				
			</mesh>
		</>
	)
}

export default ComponentTerminal
