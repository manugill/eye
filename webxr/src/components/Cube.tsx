import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

const Cube = (props: any) => {
  const mesh = useRef<any>()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default Cube
