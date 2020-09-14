import React from 'react'
import { Vector3, Color3 } from '@babylonjs/core'

const FocusIndicator = ({
  focus = false,
  position,
  width,
  height,
}: {
  focus?: boolean
  position: Vector3
  width: number
  height: number
}) => {
  return (
    <>
      {!focus ? undefined : (
        <box
          name='indicator'
          size={0.2}
          position={
            new Vector3(
              position.x - width / 2,
              position.y - height / 2,
              position.z
            )
          }
        >
          <standardMaterial
            name='indicator-material'
            diffuseColor={Color3.Red()}
            specularColor={Color3.Black()}
          />
        </box>
      )}
    </>
  )
}

export default FocusIndicator
