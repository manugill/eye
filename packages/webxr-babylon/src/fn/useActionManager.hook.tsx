import {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Nullable,
  Observer,
  Scene,
  EventState,
  ActionManager,
  ActionEvent,
  ExecuteCodeAction,
  Mesh,
  IAction,
} from '@babylonjs/core'

import { Control } from '@babylonjs/gui/2D/controls/control'

import {
  SceneContext,
  ICustomPropsHandler,
  CustomPropsHandler,
  CreatedInstance,
  MeshEventType,
  Gui2dEventType,
  HoverType,
} from 'react-babylonjs'

export const useActionManager = (
  eventHandlers: any
): [MutableRefObject<CreatedInstance<Mesh | Control | null>>, boolean] => {
  const [value, setValue] = useState(false)

  const ref = useRef<CreatedInstance<Mesh>>(null) as MutableRefObject<
    CreatedInstance<Mesh | Control | null>
  >

  useEffect(() => {
    if (ref.current) {
      const registeredMeshActions: Nullable<IAction>[] = []
      let observer2dGuiEnter: Nullable<Observer<Control>> = null
      let observer2dGuiOut: Nullable<Observer<Control>> = null

      if (ref.current.metadata.isMesh === true) {
        const mesh = ref.current.hostInstance as Mesh

        if (!mesh.actionManager) {
          mesh.actionManager = new ActionManager(mesh.getScene())
        }

        Object.entries(eventHandlers).map(([name, func]) => {
          const action: Nullable<IAction> = mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager[name], (ev) => {
              ;(func as MeshEventType)(ev)
              setValue(true)
            })
          )
          registeredMeshActions.push(action)
        })
      } else {
        console.warn(
          'Can only apply useActionManger to meshes currently.',
          ref.current.metadata
        )
      }

      if (registeredMeshActions.length > 0 || observer2dGuiEnter !== null) {
        return () => {
          if (ref.current) {
            if (registeredMeshActions.length > 0) {
              registeredMeshActions.forEach((action: Nullable<IAction>) => {
                if (action !== null) {
                  const mesh = ref.current.hostInstance as Mesh
                  mesh.actionManager?.unregisterAction(action)
                }
              })
              registeredMeshActions.splice(0, registeredMeshActions.length)
            }
          }
        }
      }
    }
  }, [ref.current])
  // todo: if use ref.current as dep,  duplicate register action.

  return [ref, value]
}
