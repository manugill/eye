const { app, BrowserWindow } = require('electron');

let window;
app.once('ready', () => {
  window = new BrowserWindow({
    width: 1080,
    height: 640,
    show: false,
    frame: false,
    webPreferences: {
      offscreen: true,
      transparent: true,
    },
  });

  window.loadURL('https://github.com');
  window.webContents.setFrameRate(15);

  console.log('electron window started');
});

var io = require('socket.io')(3001);

io.on('connection', socket => {
  console.log('connection');

  window.webContents.on('paint', (event, dirty, image) => {
    console.log('paint');
    socket.emit('paint', image.toBitmap());
    // socket.emit('paint', image.toPNG());
    // socket.emit('paint', image.toJPEG(100));
  });

  socket.on('move', () => {
    window.webContents.setZoomLevel(Math.random());
  });

  socket.on('event', event => {
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
