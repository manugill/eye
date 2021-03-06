import React, { useEffect, useMemo, useRef, MutableRefObject } from 'react'
// import { useAsyncMemo } from 'use-async-memo'
import { useBabylonScene, CreatedInstance } from 'react-babylonjs'
import { Vector3, DynamicTexture } from '@babylonjs/core'

import { ViewProps } from './App'
import FocusIndicator from './FocusIndicator'
import createTerminal from '../fn/createTerminal'
import { useActionManager } from '../fn/useActionManager.hook'

type DynamicTextureRef = MutableRefObject<CreatedInstance<DynamicTexture>>

const USE_XTERM_WEBGL = true

const ComponentTerminal = ({
  position = new Vector3(0, 0, 0),
  width = 8,
  height = 4,
  scaleFactor = 1,
  fontSize = 20,
  focus = false,
  setFocus = () => undefined,
}: ViewProps) => {
  const scene = useBabylonScene()
  const pointerPosition = () =>
    scene.pick(scene.pointerX, scene.pointerY).getTextureCoordinates()

  const textureRefs = [...Array(USE_XTERM_WEBGL ? 4 : 3)].map(
    useRef
  ) as DynamicTextureRef[]

  // create terminal
  const termData = useMemo(() => {
    const [terminal, element] = createTerminal(
      {
        fontSize: fontSize * scaleFactor,
        useWebgl: USE_XTERM_WEBGL,
      },
      (element) => {
        element.style.width = `${width * 100 * scaleFactor}px`
        element.style.height = `${height * 100 * scaleFactor}px`
      }
    )

    const prompt = () => terminal.write('\r\n$ ')
    terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ 😃  ')
    terminal.onKey((key) => {
      var char = key.domEvent.key
      // console.log(key);
      if (char === '' || char === 'Enter') {
        console.log('Enter pressed')
        prompt()
      } else {
        terminal.write(char)
      }
    })

    const screenElement = element.querySelector('.xterm-screen')
    return {
      terminal,
      element,
      canvasElements: [...screenElement.querySelectorAll('canvas')],

      // the actual created terminal size is different, slightly smaller than first defined
      width: screenElement.clientWidth / 100 / scaleFactor,
      height: screenElement.clientHeight / 100 / scaleFactor,
    }
  }, [width, height, fontSize, scaleFactor])

  const w = termData?.width || width
  const h = termData?.height || height

  // handle re-renders
  useEffect(() => {
    if (!termData) return
    const { terminal } = termData

    textureRefs
      .map((ref) => ref.current?.hostInstance)
      .filter((texture) => !!texture)
      .forEach((texture) => {
        const updateTexture = () => texture.update()

        updateTexture()
        terminal.onRender(() => updateTexture())
        terminal.onSelectionChange(() => updateTexture())
      })
  }, [termData, textureRefs])

  // handle mouse events
  const [actionManagerRef] = useActionManager({
    OnPickDownTrigger: () => {
      setFocus()
      const uv = pointerPosition()
      if (!uv) return
    },
    // OnPickUpTrigger: () => {
    //   const uv = pointerPosition()
    //   if (!uv) return
    // },
    // OnPointerOutTrigger: () => {},
  })

  const sizeProps = { width: w, height: h, position }
  return (
    <>
      <FocusIndicator focus={focus} position={position} width={w} height={h} />

      <plane ref={actionManagerRef} name='plane' {...sizeProps}>
        <standardMaterial name='material'>
          <baseTexture />
        </standardMaterial>
      </plane>

      {termData?.canvasElements.map((ref, i) => {
        return (
          <plane key={i} name='plane' {...sizeProps}>
            <standardMaterial
              name='material'
              useAlphaFromDiffuseTexture={true}
              backFaceCulling={false}
            >
              <dynamicTexture
                ref={textureRefs[i]}
                name='texture'
                assignTo='diffuseTexture'
                hasAlpha={true}
                generateMipMaps={true}
                // giving the canvas element to options key automatically attaches it to the dynamic texture (saves us a bunch of work)
                // https://github.com/BabylonJS/Babylon.js/blob/master/src/Materials/Textures/dynamicTexture.ts#L44
                options={termData.canvasElements[i]}
                // options={{}}
              />
            </standardMaterial>
          </plane>
        )
      })}
    </>
  )
}

export default ComponentTerminal
