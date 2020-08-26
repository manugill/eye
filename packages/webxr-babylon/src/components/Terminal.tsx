import React, {
  useEffect,
  useMemo,
  useRef,
  MutableRefObject,
  useState,
} from 'react';
import { useAsyncMemo } from 'use-async-memo';
import { useBabylonScene, useClick, CreatedInstance } from 'react-babylonjs';
import { Vector3, Texture, DynamicTexture } from '@babylonjs/core';

import createTerminal from '../fn/createTerminal';
import FocusIndicator from './FocusIndicator';

type DynamicTextureRef = MutableRefObject<CreatedInstance<DynamicTexture>>;

const USE_XTERM_WEBGL = true;

(window as any).terminals = [];

const ComponentTerminal = ({
  position = new Vector3(0, 0, 0),
  width = 8,
  height = 4,
  fontSize = 20,
  sizeMultiplier = 1,
  focus = false,
  setFocus = () => undefined,
}: {
  position?: Vector3;
  width?: number;
  height?: number;
  fontSize?: number;
  sizeMultiplier?: number;
  focus?: boolean;
  setFocus?: () => void;
}) => {
  const scene = useBabylonScene();

  const textureRefs = [...Array(USE_XTERM_WEBGL ? 4 : 3)].map(
    useRef,
  ) as DynamicTextureRef[];

  // create terminal
  const termData = useMemo(() => {
    const [terminal, element] = createTerminal(
      {
        fontSize: fontSize * sizeMultiplier,
        useWebgl: USE_XTERM_WEBGL,
      },
      (element) => {
        element.style.width = `${width * 100 * sizeMultiplier}px`;
        element.style.height = `${height * 100 * sizeMultiplier}px`;
      },
    );

    (window as any).terminals.push(terminal); //

    const prompt = () => terminal.write('\r\n' + '$ ');
    terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ 😃  ');
    terminal.onKey((key) => {
      var char = key.domEvent.key;
      // console.log(key);
      if (char === '' || char === 'Enter') {
        console.log('Enter pressed');
        prompt();
      } else {
        terminal.write(char);
      }
    });

    const screenElement = element.querySelector('.xterm-screen');
    return {
      terminal,
      element,
      canvasElements: [...screenElement.querySelectorAll('canvas')],

      // the actual created terminal size is different
      // slightly smaller than first defined
      width: screenElement.clientWidth / 100 / sizeMultiplier,
      height: screenElement.clientHeight / 100 / sizeMultiplier,
    };
  }, []);

  const w = termData?.width || width;
  const h = termData?.height || height;

  if (termData) {
    const core = (termData.terminal as any)._core;
    console.log('termData', termData.terminal);
    // console.log("_onRefreshRequest", core._renderService);
    core._onRender._listeners.push((...params) => {
      //  console.log("params", params);
    });
  }

  useEffect(() => {
    console.log('focus1', focus);

    if (!termData) return;

    const { terminal } = termData;

    textureRefs
      .map((ref) => ref.current?.hostInstance)
      .filter((texture) => !!texture)
      .forEach((texture, index) => {
        const updateTexture = () => {
          texture.update();
        };
        updateTexture();

        terminal.onRender(() => {
          updateTexture();
        });
        terminal.onSelectionChange(() => {
          updateTexture();
          console.log('selection change');
        });
      });
  }, [termData]);

  const [clickRef] = useClick((action) => {
    setFocus();
    // console.log('termData', termData);

    const { pickedPoint } = scene.pick(scene.pointerX, scene.pointerY);

    const x = pickedPoint.x - position.x + w / 2;
    const y = -pickedPoint.y + position.y + h / 2;
    const xPx = x * 100 * sizeMultiplier;
    const yPx = y * 100 * sizeMultiplier;
  });

  return (
    <>
      <FocusIndicator focus={focus} position={position} width={w} height={h} />
      <plane
        ref={clickRef}
        name="plane"
        width={w}
        height={h}
        position={position}
      >
        <standardMaterial name="material">
          <baseTexture />
        </standardMaterial>
      </plane>

      {termData?.canvasElements.map((ref, i) => {
        // console.log("canvasElements", termData.canvasElements);
        return (
          <plane key={i} name="plane" width={w} height={h} position={position}>
            <standardMaterial
              name="material"
              useAlphaFromDiffuseTexture={true}
              backFaceCulling={false}
            >
              <dynamicTexture
                ref={textureRefs[i]}
                name="texture"
                assignTo="diffuseTexture"
                hasAlpha={true}
                generateMipMaps={true}
                // giving the canvas element to options key automatically attaches it to the dynamic texture (saves us a bunch of work)
                // https://github.com/BabylonJS/Babylon.js/blob/master/src/Materials/Textures/dynamicTexture.ts#L44
                options={termData.canvasElements[i]}
                // options={{}}
              />
            </standardMaterial>
          </plane>
        );
      })}
    </>
  );
};

export default ComponentTerminal;
