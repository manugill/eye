import { Primrose } from 'primrose'
import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { ViewProps } from './App'
import { TextureLoader, Texture, Mesh, MeshBasicMaterial } from 'three'
import { useLoader, useThree, ReactThreeFiber } from '@react-three/fiber'
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
  scaleFactor = 4, // 4.0 is probably overkill. note: 2.0 seems to be buggy
  fontSize = 12,
  focus = false,
  setFocus = () => undefined,
  size = [1.08 * 2, 1.08 * 2],
  meshProps = {},
}: ViewProps) => {
  const textureRef = useRef<MeshBasicMaterial>()
  const meshRef = useRef<Mesh>()
  const context = useThree()

  // create editor
  const editor = useMemo(() => {
    const editor = new Primrose({
      width: size[0],
      height: size[1],
      scaleFactor,
      fontSize,
    })

    editor.value = defaultText
    return editor
  }, [])

  useEffect(() => {
    const canvas = editor.canvas as HTMLCanvasElement // this is actually an OffscreenCanvas but the typing sucks
    const material = textureRef.current
    const mesh = meshRef.current

    const updateTexture = () => {
      const t = new THREE.CanvasTexture(canvas)
      material.setValues({ map: t })
    }

    // Primrose tells us when it has refreshed, we don't need to do it every frame.
    editor.addEventListener('update', () => updateTexture())

    Primrose.add(mesh, editor)
  }, [])

  useEffect(() => {
    if (editor.focused && !focus) Primrose.focusedControl.blur()
  }, [focus])

  return (
    <>
      {/* <mesh ref={meshRef}>
				<boxBufferGeometry args={[1, 1, 1]} />
				<meshBasicMaterial attach='material'>
					<texture ref={textureRef} />
				</meshBasicMaterial>
			</mesh> */}
      <mesh
        position={position}
        {...meshProps}
        ref={meshRef}
        onPointerOver={({ uv }) => editor.mouse.readOverEventUV({ uv })}
        onPointerOut={({ uv }) => editor.mouse.readOutEventUV({ uv })}
        onPointerMove={({ uv }) => editor.mouse.readMoveEventUV({ uv })}
        onPointerUp={({ uv }) => editor.mouse.readUpEventUV({ uv })}
        onPointerDown={({ uv }) => {
          if (!focus) setFocus()
          editor.mouse.readDownEventUV({ uv })
        }}
      >
        <planeBufferGeometry attach='geometry' args={size} />
        <meshBasicMaterial attach='material' ref={textureRef} />
      </mesh>
    </>
  )
}

export default Editor
