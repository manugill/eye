import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import { Engine, Scene, CreatedInstance } from "react-babylonjs";
import {
  Vector3,
  Color4,
  Texture,
  DynamicTexture,
  Plane,
} from "@babylonjs/core";
import { Primrose } from "primrose/primrose.js";

import defaultText from "./defaultText";

type TextureRef = CreatedInstance<Texture>;
type DynamicTextureRef = CreatedInstance<DynamicTexture>;
type PlaneRef = CreatedInstance<Plane>;

const Editor = ({ width = 8, height = 8, ...options }) => {
  const textureRef = useRef<TextureRef>();
  const dynamicTextureRef = useRef<DynamicTextureRef>();
  const planeRef = useRef<PlaneRef>();

  const editor = useMemo(() => {
    return new Primrose({
      width: width * 100,
      height: height * 100,
      scaleFactor: 1,
      fontSize: 16,
    });
  }, []);

  var tex = defaultText;
  editor.value = tex;

  const pointerDown = options.pointerDown;
  const pointerUp = options.pointerUp;
  if (pointerDown !== undefined) {
    console.log("pointerDown", pointerDown);
    console.log(Primrose.has(pointerDown.pickedMesh));
    console.log(Primrose.get(pointerDown.pickedMesh));
    var curEditor = Primrose.get(pointerDown.pickedMesh);

    if (curEditor !== null) {
      // curEditor.mouse.readDownEventUV(pointerDown);
    } else if (Primrose.focusedControl !== null) {
      Primrose.focusedControl.blur();
    }
  }
  if (pointerUp !== undefined) {
    console.log("pointerUp", pointerUp);
  }

  useEffect(() => {
    const canvas = editor.canvas as OffscreenCanvas;
    const context = canvas.getContext("2d");
    const texture = textureRef.current.hostInstance;
    const plane = planeRef.current.hostInstance;

    console.log("textures", textureRef.current, dynamicTextureRef.current);
    console.log("context", context);
    console.log("plane", plane);

    const updateTexture = async () => {
      const blob = await canvas.convertToBlob();
      const blobUrl = URL.createObjectURL(blob);
      texture.updateURL(blobUrl);
    };

    updateTexture();

    // @Gagan: Do all the primrose magic in here
    Primrose.add(plane, editor);
  }, []);

  return (
    <>
      <plane
        ref={planeRef}
        name="plane"
        width={8}
        height={8}
        rotation={new Vector3(0, 0, 0)}
        position={new Vector3(4, 0, 0)}
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
            url={"IMAGE_HERE"}
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
