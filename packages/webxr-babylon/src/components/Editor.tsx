import React, { useState, useRef } from "react";
import { Engine, Scene } from "react-babylonjs";
import { Vector3, Color4 } from "@babylonjs/core";
import { Primrose } from "primrose/primrose.js";
const Editor = function () {
  const editor = new Primrose({
    width: 2048,
    height: 2048,
    scaleFactor: 1,
    fontSize: 24,
  });
  editor.value = "code";
  console.log(editor.value);

  return (
    <>
      <plane
        name="plane"
        width={10}
        height={9}
        rotation={new Vector3(0.5, 0, 0)}
        position={new Vector3(0, 0, 0)}
      >
        <standardMaterial
          name="material"
          useAlphaFromDiffuseTexture={true}
          backFaceCulling={false}
        >
          <dynamicTexture
            name="texture"
            assignTo="diffuseTexture"
            hasAlpha={true}
            generateMipMaps={true}
            options={editor.canvas}
          />
        </standardMaterial>
      </plane>
    </>
  );
};
