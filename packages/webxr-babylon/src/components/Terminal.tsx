import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  MutableRefObject,
} from 'react';
import { useAsyncMemo } from 'use-async-memo';
import { CreatedInstance } from 'react-babylonjs';
import { Vector3, Texture, DynamicTexture } from '@babylonjs/core';

import createTerminal from '../fn/createTerminal';

type TextureRef = MutableRefObject<CreatedInstance<Texture>>;
type DynamicTextureRef = MutableRefObject<CreatedInstance<DynamicTexture>>;

const classes = [
  '.xterm-text-layer',
  '.xterm-selection-layer',
  '.xterm-link-layer',
  '.xterm-cursor-layer',
];

const ComponentTerminal = ({
  width = 8,
  height = 4,
  fontSize = 20,
  sizeMultiplier = 1,
}) => {
  const textureRefs = classes.map(useRef) as TextureRef[];
  const dynamicTextureRefs = classes.map(useRef) as DynamicTextureRef[];

  // create terminal
  const termData = useAsyncMemo(async () => {
    const [terminal, element] = await createTerminal(
      {
        fontSize: fontSize * sizeMultiplier,
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

      // the actual created terminal size is different
      // slightly smaller than first defined
      width: screenElement.clientWidth / 100 / sizeMultiplier,
      height: screenElement.clientHeight / 100 / sizeMultiplier,
    };
  }, []);

  console.log('termData', termData);

  useEffect(() => {
    if (!termData) return;

    const { terminal, element, width, height } = termData;
    const textures = textureRefs.map((ref) => ref.current.hostInstance);
    const dynamicTextures = dynamicTextureRefs.map(
      (ref) => ref.current.hostInstance,
    );
    console.log('hello', ...textures, textures[0]);

    classes.forEach((className, index) => {
      const canvas: HTMLCanvasElement = element.querySelector(className);
      const context = canvas.getContext('2d');
      const texture = textures[index];
      const dynamicTexture = dynamicTextures[index];

      const updateTexture = () => {
        const imageData = context.getImageData(0, 0, width * 100, height * 100);
        console.log('imageData', imageData);

        // update basic texture (slow as it requires a data url conversion)
        const dataUrl = canvas.toDataURL();
        let img = new Image();
        texture.updateURL(dataUrl);

        // setup dynamic texture (WIP, not working, but should be faster)
        const dynamicTextureContext = dynamicTexture.getContext();
        dynamicTextureContext.putImageData(imageData, 0, 0);
        dynamicTexture.update();
      };

      updateTexture();

      terminal.onRender(() => updateTexture());
      if (className === '.xterm-selection-layer')
        terminal.onSelectionChange(() => {
          updateTexture();
          console.log('selection change');
        });
      // terminal.onCursorMove(() => updateTexture());
      // terminal.onLineFeed(() => updateTexture());
      // terminal.onKey(() => updateTexture());
    });
  }, [termData]);

  return (
    <>
      {textureRefs.map((ref, i) => (
        <plane
          key={i}
          name="plane"
          width={termData?.width || width}
          height={termData?.height || height}
          position={new Vector3(0, -2, 0)}
        >
          <standardMaterial
            useAlphaFromDiffuseTexture={true}
            name="material"
            backFaceCulling={false}
          >
            <texture
              ref={ref}
              hasAlpha={true}
              assignTo="diffuseTexture"
              url={'IMAGE_HERE'}
            />
          </standardMaterial>
        </plane>
      ))}

      {dynamicTextureRefs.map((ref, i) => (
        <plane
          key={i}
          name="plane"
          width={termData?.width || width}
          height={termData?.height || height}
          position={new Vector3(0, 2, 0)}
        >
          <standardMaterial
            useAlphaFromDiffuseTexture={true}
            name="material"
            backFaceCulling={false}
          >
            <dynamicTexture
              assignTo="diffuseTexture"
              name="texture"
              ref={ref}
              generateMipMaps={true}
              options={{ alpha: true }}
            />
          </standardMaterial>
        </plane>
      ))}
    </>
  );
};

export default ComponentTerminal;
