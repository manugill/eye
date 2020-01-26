// @ts-check
const { app, BrowserWindow, nativeImage } = require('electron');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');

let window;

app.once('ready', () => {
  window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true,
      scrollBounce: true,
      backgroundThrottling: false,
    },
  });

  window.loadURL('https://codepen.io/Danil89/details/EOjMvb');
  window.webContents.setFrameRate(60);

  console.log('electron window started');
});

var io = require('socket.io')(3001, { origins: '*:*' });

io.on('connection', socket => {
  console.log('connection');

  let lastTimeouts = [];
  let lastFullPaint = {
    time: Date.now(),
    rect: { x: 0, y: 0, width: 0, height: 0 },
  };

  const newPaint = (image, rect, quality = 100) => ({
    time: Date.now(),
    rect,
    image,
    buffer: image.crop(rect).toJPEG(quality),
  });
  const isPaintChanged = (paint, lastPaint = lastFullPaint) =>
    paint.rect.x !== lastPaint.rect.x ||
    paint.rect.y !== lastPaint.rect.y ||
    paint.rect.width !== lastPaint.rect.width ||
    paint.rect.height !== lastPaint.rect.height ||
    (lastPaint.buffer && !paint.buffer.equals(lastPaint.buffer));

  // has better framerate
  window.webContents.on('paint', (_, rect, image) => {
    if (rect.width === 0 || rect.height === 0) {
      console.log('EMPTY FRAME IGNORED', rect);
      return;
    }
    const bounds = window.getBounds();
    const isFullPaint =
      bounds.width === rect.width && bounds.height == rect.height;
    const paint = newPaint(image, rect, isFullPaint ? 20 : undefined);
    if (isFullPaint) {
      for (let i = 0; i < lastTimeouts.length; i++) {
        clearTimeout(lastTimeouts[i]);
      }
      lastTimeouts = [
        setTimeout(() => socket.emit('paint', newPaint(image, rect)), 200),
      ];
    }
    if (!isPaintChanged(paint)) {
      console.log('duplicate paint ignore');
      return;
    }
    if (isFullPaint) lastFullPaint = paint;
    // console.log(
    //   '  - timings',
    //   paint.time,
    //   lastPaint.time,
    //   paint.time - lastPaint.time,
    //   Date.now() - paint.time,
    // );
    console.log('on paint', rect);
    socket.emit('paint', paint);
  });

  socket.on('move', () => {
    window.webContents.setZoomLevel(Math.random() * 0.1);
  });

  socket.on('event', event => {
    // console.log('event', event.type, event.button, event.x, event.y)
    // console.log('event', event.type, Date.now() - event.time);
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
