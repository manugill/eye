import * as THREE from 'three'
import { SharedCanvasContext } from 'react-three-fiber'
import { cursor } from './cursor'

export const currentIntersects = {}

export default (context: SharedCanvasContext) => {
	const raycaster = new THREE.Raycaster()
	return function(_: THREE.Raycaster, intersects: THREE.Intersection[]): void {
		const raycast = this.constructor.prototype.raycast.bind(this)
		if (!raycast) return

		const isXr = context.gl.xr.isPresenting
		if (!isXr) {
			// fallback to mouse
			raycaster.setFromCamera(context.mouse, context.camera)
		} else {
			// use the pointer to do the thang
			const camera = context.gl.xr.getCamera(context.camera)

			raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld)
			raycaster.ray.direction
				.set(cursor.x, cursor.y, cursor.z)
				.sub(raycaster.ray.origin)
				.normalize()
			raycaster.camera = camera
		}

		raycast(raycaster, intersects)

		if (intersects.length) {
			currentIntersects[this.uuid] = intersects[intersects.length - 1]
		} else {
			delete currentIntersects[this.uuid]
		}
	}
}
