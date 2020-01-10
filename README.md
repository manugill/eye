# Versions

- Node: 11.6.0
  - This is cause exokit currently requires that version to run locally (for the vm-one module).
  - Also theia can only run on 11 (or 10).
- Three.js 0.103.0
  - All further versions use the new navigator.xr.requestSession function which isn't available with exokit's version of Chrome used in Electron.
