import * as THREE from 'three'

export const cursor = new THREE.Vector3(0, 0, -0.5)
const sizer = 1000 // just an arbitrary number that seems ok in speed

export const eventToZ = (event: React.WheelEvent<any>) => {
	const newZ = cursor.z + event.deltaY / sizer
	cursor.setZ(newZ)
}

export const eventToXY = (event: React.PointerEvent<any>) => {
	// we can't rely on the current clientX/Y  mouse location cause pointer can be locked
	// we get the mouse x/y (-1 to 1) from three's context
	// and convert it to pixels same values as clientX/Y
	const pixelX = (cursor.x + 1) * sizer
	const pixelY = (cursor.y + 1) * sizer
	const movedPixelX = pixelX + event.movementX
	const movedPixelY = pixelY - event.movementY
	cursor.setX(movedPixelX / sizer - 1)
	cursor.setY(movedPixelY / sizer - 1)
}
