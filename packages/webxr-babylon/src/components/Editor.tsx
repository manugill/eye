import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  MutableRefObject,
} from 'react'
import {
  useBabylonScene,
  Engine,
  Scene,
  CreatedInstance,
  useClick,
} from 'react-babylonjs'
import {
  Vector3,
  Vector2,
  Color4,
  Texture,
  DynamicTexture,
  Plane,
} from '@babylonjs/core'
import { Primrose } from 'primrose'
import useMergedRef from '@react-hook/merged-ref'

import { useActionManager } from '../fn/useActionManager.hook'
import FocusIndicator from './FocusIndicator'
import defaultText from './defaultText'

type TextureRef = CreatedInstance<Texture>
type DynamicTextureRef = CreatedInstance<DynamicTexture>
type PlaneRef = CreatedInstance<Plane>

const Editor = ({
  position = new Vector3(0, 0, 0),
  width = 8,
  height = 8,
  focus = false,
  setFocus = () => undefined,
}: any) => {
  const scene = useBabylonScene()
  const pointerPosition = () => {
    const pickResult = scene.pick(scene.pointerX, scene.pointerY)
    return pickResult.getTextureCoordinates()
  }

  const textureRef = useRef<TextureRef>()
  const dynamicTextureRef = useRef<DynamicTextureRef>()
  const planeRef = useRef<PlaneRef>()

  const editor = useMemo(() => {
    const editor = new Primrose({
      width: width * 100,
      height: height * 100,
      scaleFactor: 1,
      fontSize: 16,
    })

    editor.value = defaultText

    return editor
  }, [])

  useEffect(() => {
    const canvas = editor.canvas as OffscreenCanvas
    const context = canvas.getContext('2d')
    const texture = textureRef.current?.hostInstance
    const dynamicTexture = dynamicTextureRef.current?.hostInstance
    const plane = planeRef.current.hostInstance

    console.log('textures', textureRef.current, dynamicTextureRef.current)
    console.log('context', context)
    console.log('plane', plane)
    console.log('dyanmicTexture canvas', (dynamicTexture as any)?._canvas)

    const updateTexture = async () => {
      // @TODO: We need to improve the performance as blob conversion is expensive
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      console.log('canvas image data')
      const blob = await canvas.convertToBlob()
      const blobUrl = URL.createObjectURL(blob)
      texture.updateURL(blobUrl)
    }

    updateTexture()

    // Primrose tells us when it has refreshed, we don't need
    // to do it every frame.
    editor.addEventListener('update', function () {
      updateTexture()
    })

    // @Gagan: Do all the primrose magic in here
    Primrose.add(plane, editor)
  }, [])

  useEffect(() => {
    console.log('focused', focus)
    if (!!Primrose.focusedControl && !focus) {
      Primrose.focusedControl.blur()
    }
  }, [focus])

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
      if (Primrose.hoveredControl != null) {
        editor.mouse.readOutEventUV()
      }
    },
  })

  const multiRef = useMergedRef(actionManagerRef, planeRef as any)
  return (
    <>
      <FocusIndicator
        focus={focus}
        position={position}
        width={width}
        height={height}
      />
      <plane
        ref={multiRef}
        name='plane'
        width={width}
        height={height}
        position={position}
      >
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

      {/* <plane
        name='plane2'
        width={width}
        height={height}
        position={new Vector3(8, 0, 0)}
      >
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
