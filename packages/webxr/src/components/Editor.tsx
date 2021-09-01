import { Primrose } from 'primrose'
import React, { useMemo, useEffect, useRef, useCallback } from 'react'
import useMergedRef from '@react-hook/merged-ref'
import * as THREE from 'three'
import { ViewProps } from './App'
import { TextureLoader, Texture, Mesh, MeshBasicMaterial } from 'three'
import { useLoader, ReactThreeFiber } from 'react-three-fiber'
import img from './logo512.png'

const defaultText = `
function testDemo(scene) {
   // 🐔🥚🥚🥚
   // 🥚🐔🥚🥚
   // 🥚🥚🐔🥚
   // 🥚🥚🥚🐔

   var GRASS = "../shared_assets/images/grass.png",
   ROCK = "../shared_assets/images/rock.png",
   SAND = "../shared_assets/images/sand.png",
   WATER = "../shared_assets/images/water.png",
   DECK = "../shared_assets/images/deck.png",
   WIDTH = 5,
   HEIGHT = 5,
   DEPTH = 5,
   MIDX = WIDTH / 2 - 5,
   MIDY = HEIGHT / 2,
   MIDZ = DEPTH / 2,
   start = hub()
     .addTo(scene)
     .at(-MIDX, 0, -DEPTH - 2);
     const balls = [];

     for (var i = 0; i < 10; ++i) {
       balls.push(
         brick(DECK).addTo(start).at(number(WIDTH), number(HEIGHT), number(DEPTH))
       );

       balls[i].velocity = v3(number(WIDTH), number(HEIGHT), number(DEPTH));
     }

     function update(dt) {
       for (var i = 0; i < balls.length; ++i) {
         var ball = balls[i],
           p = ball.position,
           v = ball.velocity;
         p.add(v.clone().multiplyScalar(dt));
         if ((p.x < 0 && v.x < 0) || (WIDTH <= p.x && v.x > 0)) {
           v.x *= -1;
         }
         if ((p.y < 1 && v.y < 0) || (HEIGHT <= p.y && v.y > 0)) {
           v.y *= -1;
         }
         if ((p.z < 0 && v.z < 0) || (DEPTH <= p.z && v.z > 0)) {
           v.z *= -1;
         }
       }
     }

}`

const Editor = ({
	position = [0, 0, 0],
	width = 16,
	height = 8,
	scaleFactor = 1,
	fontSize = 16,
	focus = false,
	setFocus = () => undefined,
	url = 'https://github.com',
	resolution = [1080, 1080],
	size = [1.08 * 2, 1.08 * 2],
	meshProps = {},
}: ViewProps) => {
	const textureRef = useRef<MeshBasicMaterial>()
	const meshRef = useRef<Mesh>()

	// create editor
	const editor = useMemo(() => {
		const editor = new Primrose({
			width: width * 100,
			height: height * 100,
			scaleFactor,
			fontSize,
		})

		editor.value = defaultText
		return editor
	}, [])

	useEffect(() => {
		const canvas = editor.canvas as OffscreenCanvas
		const context = canvas.getContext('2d')
		const material = textureRef.current
		const mesh = meshRef.current

		console.log('texture--', material)
		const updateTexture = async () => {
			// @TODO: We need to improve the performance as blob conversion is expensive

			const blob = await canvas.convertToBlob()
			const blobUrl = URL.createObjectURL(blob)

			const loader = new THREE.TextureLoader()
			const texture = loader.load(blobUrl)
			material.setValues({ map: texture })
		}

		updateTexture()

		// Primrose tells us when it has refreshed, we don't need to do it every frame.
		editor.addEventListener('update', () => updateTexture())

		Primrose.add(mesh, editor)
	}, [])

	// handle mouse events
	// const [actionManagerRef] = useActionManager({
	// 	OnPickDownTrigger: () => {
	// 		setFocus()

	// 		const uv = pointerPosition()
	// 		if (!uv) return
	// 		editor.mouse.readDownEventUV({ uv })
	// 	},
	// 	OnPickUpTrigger: () => {
	// 		const uv = pointerPosition()
	// 		if (!uv) return
	// 		editor.mouse.readUpEventUV({ uv })
	// 	},
	// 	OnPointerOutTrigger: () => {
	// 		if (Primrose.hoveredControl !== null) editor.mouse.readOutEventUV()
	// 	},
	// })
	// useEffect(() => {
	// 	if (!!Primrose.focusedControl && !focus) Primrose.focusedControl.blur()
	// }, [focus])

	// const multiRef = useMergedRef<any>(actionManagerRef, planeRef)
	// const sizeProps = { width, height, position }

	return (
		<>
			{/* <mesh ref={meshRef}>
				<boxBufferGeometry args={[1, 1, 1]} />
				<meshBasicMaterial attach='material'>
					<texture ref={textureRef} />
				</meshBasicMaterial>
			</mesh> */}
			<mesh position={position} {...meshProps} ref={meshRef}>
				<planeGeometry attach='geometry' args={size} />
				<meshBasicMaterial attach='material' color='white' ref={textureRef} />
			</mesh>
		</>
	)
}

export default Editor
