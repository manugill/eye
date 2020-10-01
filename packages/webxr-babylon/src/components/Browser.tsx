import React, { useEffect, useMemo, useRef } from 'react'
import { useAsyncMemo } from 'use-async-memo'
import { useBabylonScene, useClick, CreatedInstance } from 'react-babylonjs'
import { Vector3, Texture, DynamicTexture } from '@babylonjs/core'

import { ViewProps } from './App'
import FocusIndicator from './FocusIndicator'
import createTerminal from '../fn/createTerminal'

const USE_XTERM_WEBGL = true

const ComponentTerminal = ({
  position = new Vector3(0, 0, 0),
  width = 8,
  height = 4,
  fontSize = 20,
  scaleFactor = 1,
  focus = false,
  setFocus = () => undefined,
}: ViewProps) => {
  const scene = useBabylonScene()

  const textureRef = useRef<CreatedInstance<DynamicTexture>>()

  // create browser
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

    //  (window as any).terminals.push(terminal); //

    const prompt = () => terminal.write('\r\n' + '$ ')
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

    terminal.attachCustomKeyEventHandler((event) => {
      if (event.code === 'KeyA') {
        console.log('event', event)
        return false
      }

      // window.keyboard.keydownHandler(e);
      return true
    })

    const screenElement = element.querySelector('.xterm-screen')
    return {
      terminal,
      element,
      canvasElements: [...screenElement.querySelectorAll('canvas')],

      // the actual created terminal size is different
      // slightly smaller than first defined
      width: screenElement.clientWidth / 100 / scaleFactor,
      height: screenElement.clientHeight / 100 / scaleFactor,
    }
  }, [])

  const w = termData?.width || width
  const h = termData?.height || height

  useEffect(() => {
    if (!termData) return

    const { terminal } = termData
    const texture = textureRef.current?.hostInstance

    const updateTexture = () => {
      texture.update()
    }
    updateTexture()

    terminal.onRender(() => {
      updateTexture()
      //console.log("focus1", terminal);
    })
    terminal.onSelectionChange(() => {
      updateTexture()
      // console.log("selection change");
    })
  }, [termData])

  const [clickRef] = useClick((action) => {
    setFocus()
    // console.log('termData', termData);

    const { pickedPoint } = scene.pick(scene.pointerX, scene.pointerY)

    const x = pickedPoint.x - position.x + w / 2
    const y = -pickedPoint.y + position.y + h / 2
    const xPx = x * 100 * scaleFactor
    const yPx = y * 100 * scaleFactor
  })

  return (
    <>
      <FocusIndicator focus={focus} position={position} width={w} height={h} />
      <plane
        ref={clickRef}
        name='plane'
        width={w}
        height={h}
        position={position}
      >
        <standardMaterial name='material'>
          <baseTexture />
        </standardMaterial>
      </plane>

      {termData?.canvasElements.map((ref, i) => {
        // console.log("canvasElements", termData.canvasElements);
        return (
          <plane key={i} name='plane' width={w} height={h} position={position}>
            <standardMaterial
              name='material'
              useAlphaFromDiffuseTexture={true}
              backFaceCulling={false}
            >
              <dynamicTexture
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
