import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  MutableRefObject,
} from 'react';
import { Engine, Scene, CreatedInstance } from 'react-babylonjs';
import { Vector3, Color4, Texture, DynamicTexture } from '@babylonjs/core';
import { Primrose } from 'primrose/primrose.js';

type TextureRef = CreatedInstance<Texture>;
type DynamicTextureRef = CreatedInstance<DynamicTexture>;

const Editor = ({ width = 8, height = 8 }) => {
  const textureRef = useRef<TextureRef>();
  const dynamicTextureRef = useRef<DynamicTextureRef>();

  const editor = useMemo(() => {
    return new Primrose({
      width: width * 100,
      height: height * 100,
      scaleFactor: 2,
      fontSize: 16,
    });
  }, []);

  useEffect(() => {
    const canvas = editor.canvas as OffscreenCanvas;
    const context = canvas.getContext('2d');
    const texture = textureRef.current.hostInstance;

    console.log('textures', textureRef.current, dynamicTextureRef.current);
    console.log('context', context);

    const updateTexture = async () => {
      const blob = await canvas.convertToBlob();
      const blobUrl = URL.createObjectURL(blob);
      texture.updateURL(blobUrl);
    };

    updateTexture();

    // @Gagan: Do all the primrose magic in here
  }, []);

  return (
    <>
      <plane
        name="plane"
        width={4}
        height={4}
        rotation={new Vector3(0, 0, 0)}
        position={new Vector3(4, -2.1, 0)}
      >
        <standardMaterial
          name="material"
          useAlphaFromDiffuseTexture={true}
          backFaceCulling={false}
        >
          <texture
            ref={textureRef}
            hasAlpha={true}
            assignTo="diffuseTexture"
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
  );
};

export default Editor;
