const electronPath = require('electron');
const proc = require('child_process');

// will print something similar to /Users/maf/.../Electron
// console.log(electron);

// spawn Electron
const child = proc.spawn(electronPath, ['electron-test.js']);

// console.log('child', child);
child.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});
