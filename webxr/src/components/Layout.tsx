import { Flex, Box } from '@react-three/flex'

import Cube from './Cube'

const Layout = () => (
  <Flex flexDirection='row' align='center' position={[-2, 0, 0]}>
    {/* <Box centerAnchor>
      <Cube />
    </Box> */}
    <Box width='300' height='200' centerAnchor margin={0.1}>
      {(width, height) => <Plane args={[width, height]} />}
    </Box>
    <Box width='200' height='200' centerAnchor margin={0.1}>
      {(width, height) => <Plane args={[width, height]} />}
    </Box>
  </Flex>
)

const Plane = ({ args }: any) => (
  <mesh position={[0, 0, 0]}>
    <planeGeometry attach='geometry' args={args} />
    <meshBasicMaterial attach='material' color='black' />
  </mesh>
)

export default Layout
