// @ts-check
const { app, BrowserWindow } = require('electron');

// app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');

let window;
app.once('ready', () => {
  window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false,
    webPreferences: {
      offscreen: true,
      transparent: true,
    },
  });

  window.loadURL('https://github.com');
  window.webContents.setFrameRate(60);

  console.log('electron window started');
});

var io = require('socket.io')(3001, { origins: '*:*'});

io.on('connection', socket => {
  console.log('connection');

  window.webContents.on('paint', (event, dirty, image) => {
    // console.log('paint');
    // socket.emit('paint', image.toBitmap());
    socket.emit('paint', image.toPNG());
    // socket.emit('paint', image.toJPEG(20));
  });

  socket.on('move', () => {
    window.webContents.setZoomLevel(Math.random() * 0.1);
  });

  socket.on('event', event => {
    console.log('event', event)
    window.webContents.sendInputEvent(event);
  });
});

// const exitEvents = [
//   `exit`,
//   `SIGINT`,
//   `SIGUSR1`,
//   `SIGUSR2`,
//   `uncaughtException`,
//   `SIGTERM`,
// ];
// exitEvents.forEach(eventType => {
//   process.on(eventType, () => {
//     console.log('shit');
//   });
// });
