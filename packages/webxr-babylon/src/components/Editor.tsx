import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  MutableRefObject,
} from 'react'
import { Engine, Scene, CreatedInstance, useClick } from 'react-babylonjs'
import {
  Vector3,
  Vector2,
  Color4,
  Texture,
  DynamicTexture,
  Plane,
} from '@babylonjs/core'
import { Primrose } from 'primrose'

import defaultText from './defaultText'

type TextureRef = CreatedInstance<Texture>
type DynamicTextureRef = CreatedInstance<DynamicTexture>
type PlaneRef = CreatedInstance<Plane>

const Editor = ({
  position = new Vector3(4, 0, 0),
  width = 8,
  height = 8,
  pointerMove,
  pointerDown,
  pointerUp,
}: any) => {
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
    const texture = textureRef.current.hostInstance
    const plane = planeRef.current.hostInstance

    console.log('textures', textureRef.current, dynamicTextureRef.current)
    console.log('context', context)
    console.log('plane', plane)

    const updateTexture = async () => {
      // @TODO: We need to improve the performance as blob conversion is expensive
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
    //console.log('pointerDown', pointerDown, pointerUp)

    if (pointerMove !== undefined && null) {
      // console.log('pointerMove', pointerMove)
      var pointUV = new Vector2(
        pointerMove.getTextureCoordinates().x,
        pointerMove.getTextureCoordinates().y
      )

      var curEditor = Primrose.get(pointerMove.pickedMesh)

      if (curEditor !== Primrose.hoveredControl) {
        if (curEditor !== null) {
          curEditor.mouse.readOverEventUV()
        } else if (Primrose.hoveredControl != null) {
          Primrose.hoveredControl.mouse.readOutEventUV()
        }
      }

      if (curEditor !== null) {
        curEditor.mouse.readMoveEventUV({
          uv: pointUV,
        })
      }
    }
    if (pointerDown !== undefined) {
      var pointUV = new Vector2(
        pointerDown.getTextureCoordinates().x,
        pointerDown.getTextureCoordinates().y
      )

      console.log('pointerDown.X', pointerDown.getTextureCoordinates().x)

      var curEditor = Primrose.get(pointerDown.pickedMesh)

      if (curEditor !== null) {
        // @Gagan: The mouse event is not the exact 2d Vector that Primrose is expecting
        // You'll need to transform the pickedPoint object to it
        curEditor.mouse.readDownEventUV({ uv: pointUV })
      } else if (Primrose.focusedControl !== null) {
        Primrose.focusedControl.blur()
      }
    }
    if (pointerUp !== undefined) {
      var pointUV = new Vector2(
        pointerUp.getTextureCoordinates().x,
        pointerUp.getTextureCoordinates().y
      )

      var curEditor = Primrose.get(pointerUp.pickedMesh)

      if (curEditor !== null) {
        curEditor.mouse.readUpEventUV({ uv: pointUV })
      }
    }
  }, [pointerMove, pointerDown, pointerUp])

  return (
    <>
      <plane
        ref={planeRef}
        name='plane'
        width={width}
        height={height}
        rotation={new Vector3(0, 0, 0)}
        position={position}
      >
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

        {/* TODO: Implement this using dynamic textures later to improve perf */}
        {/* <standardMaterial
          name="material"
          useAlphaFromDiffuseTexture={true}
          backFaceCulling={false}
        >
          <dynamicTexture
            ref={dynamicTextureRef}
            name="texture"
            assignTo="diffuseTexture"
            hasAlpha={true}
            generateMipMaps={true}
            options={editor.canvas}
          />
        </standardMaterial> */}
      </plane>
    </>
  )
}

export default Editor
