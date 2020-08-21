import React, { useEffect, useRef, MutableRefObject } from 'react';
import { useAsyncMemo } from 'use-async-memo';
import { CreatedInstance } from 'react-babylonjs';
import { Vector3, Texture, DynamicTexture } from '@babylonjs/core';

import createTerminal from '../fn/createTerminal';

type DynamicTextureRef = MutableRefObject<CreatedInstance<DynamicTexture>>;

const USE_XTERM_WEBGL = true;

const ComponentTerminal = ({
  width = 8,
  height = 4,
  fontSize = 20,
  sizeMultiplier = 1,
}) => {
  const textureRefs = [...Array(USE_XTERM_WEBGL ? 4 : 3)].map(
    useRef,
  ) as DynamicTextureRef[];

  // create terminal
  const termData = useAsyncMemo(async () => {
    const [terminal, element] = await createTerminal(
      {
        fontSize: fontSize * sizeMultiplier,
        useWebgl: USE_XTERM_WEBGL,
      },
      (element) => {
        element.style.width = `${width * 100 * sizeMultiplier}px`;
        element.style.height = `${height * 100 * sizeMultiplier}px`;
      },
    );

    const prompt = () => terminal.write('\r\n' + '$ ');
    terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ 😃  ');
    terminal.onKey((key) => {
      var char = key.domEvent.key;
      console.log(key);
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

  if (termData) {
    const core = (termData.terminal as any)._core;
    console.log('termData', termData.terminal);
    console.log('_onRefreshRequest', core._renderService);
    core._onRender._listeners.push((...params) => {
      console.log('params', params);
    });
  }

  useEffect(() => {
    if (!termData) return;

    const { terminal } = termData;

    textureRefs
      .map((ref) => ref.current?.hostInstance)
      .filter((texture) => !!texture)
      .forEach((texture, index) => {
        const updateTexture = () => texture.update();
        updateTexture();

        terminal.onRender(() => updateTexture());
        terminal.onSelectionChange(() => {
          updateTexture();
          console.log('selection change');
        });
      });
  }, [termData]);

  return (
    <>
      {termData?.canvasElements.map((ref, i) => {
        console.log('canvasElements', termData.canvasElements);
        return (
          <plane
            key={i}
            name="plane"
            width={termData?.width || width}
            height={termData?.height || height}
            position={new Vector3(0, -2, 0)}
          >
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
