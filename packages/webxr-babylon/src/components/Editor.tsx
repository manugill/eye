import React, { useMemo, useEffect, useRef } from 'react'
import { useBabylonScene, CreatedInstance } from 'react-babylonjs'
import { Vector3, Texture, DynamicTexture, Plane } from '@babylonjs/core'
import { Primrose } from 'primrose'
import useMergedRef from '@react-hook/merged-ref'

import { ViewProps } from './App'
import FocusIndicator from './FocusIndicator'
import { useActionManager } from '../fn/useActionManager.hook'

type DynamicTextureRef = CreatedInstance<DynamicTexture>
type TextureRef = CreatedInstance<Texture>
type PlaneRef = CreatedInstance<Plane>

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
  position = new Vector3(0, 0, 0),
  width = 16,
  height = 8,
  scaleFactor = 1,
  fontSize = 16,
  focus = false,
  setFocus = () => undefined,
}: ViewProps) => {
  const scene = useBabylonScene()
  const pointerPosition = () =>
    scene.pick(scene.pointerX, scene.pointerY).getTextureCoordinates()

  const dynamicTextureRef = useRef<DynamicTextureRef>()
  const textureRef = useRef<TextureRef>()
  const planeRef = useRef<PlaneRef>()

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

  // handle re-renders
  useEffect(() => {
    const canvas = editor.canvas as OffscreenCanvas
    const context = canvas.getContext('2d')
    const dynamicTexture = dynamicTextureRef.current?.hostInstance
    const texture = textureRef.current?.hostInstance
    const plane = planeRef.current.hostInstance

    console.log('dynamicTexture', dynamicTexture)

    const updateTexture = async () => {
      // @TODO: We need to improve the performance as blob conversion is expensive
      const imageData = context.getImageData(0, 0, 800, canvas.height)
      const blob = await canvas.convertToBlob()
      const blobUrl = URL.createObjectURL(blob)
      texture.updateURL(blobUrl)
    }

    updateTexture()

    // Primrose tells us when it has refreshed, we don't need to do it every frame.
    editor.addEventListener('update', () => updateTexture())

    Primrose.add(plane, editor)
  }, [])

  // handle mouse events
  const [actionManagerRef] = useActionManager({
    OnPickDownTrigger: () => {
      setFocus()

      const uv = pointerPosition()
      if (!uv) return
      editor.mouse.readDownEventUV({ uv })
    },
    OnPickUpTrigger: () => {
      const uv = pointerPosition()
      if (!uv) return
      editor.mouse.readUpEventUV({ uv })
    },
    OnPointerOutTrigger: () => {
      if (Primrose.hoveredControl !== null) editor.mouse.readOutEventUV()
    },
  })
  useEffect(() => {
    if (!!Primrose.focusedControl && !focus) Primrose.focusedControl.blur()
  }, [focus])

  const multiRef = useMergedRef<any>(actionManagerRef, planeRef)
  const sizeProps = { width, height, position }
  return (
    <>
      <FocusIndicator focus={focus} {...sizeProps} />

      <plane ref={multiRef} name='plane' {...sizeProps}>
        <pointerDragBehavior
          moveAttached={false}
          onDragObservable={() => {
            const uv = pointerPosition()
            if (!uv) return
            editor.mouse.readMoveEventUV({ uv })
          }}
        />
        <standardMaterial
          name='material'
          useAlphaFromDiffuseTexture={true}
          backFaceCulling={false}
        >
          <texture
            ref={textureRef}
            hasAlpha={true}
            assignTo='diffuseTexture'
            url={'IMAGE_HERE'}
          />
        </standardMaterial>
      </plane>

      {/* <plane name='plane2' {...sizeProps}>
        <standardMaterial
          name='material'
          useAlphaFromDiffuseTexture={true}
          backFaceCulling={false}
        >
          <dynamicTexture
            ref={dynamicTextureRef}
            name='texture2'
            assignTo='diffuseTexture'
            hasAlpha={true}
            generateMipMaps={true}
            options={editor.canvas}
          />
        </standardMaterial>
      </plane> */}
    </>
  )
}

export default Editor
