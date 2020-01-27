// @ts-check
const { app, BrowserWindow, nativeImage } = require('electron');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');

const createWindow = ({
  url = 'https://github.com',
  width = '1200',
  height = '800',
} = {}) => {
  const window = new BrowserWindow({
    width: parseInt(width),
    height: parseInt(height),
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true,
      scrollBounce: true,
      backgroundThrottling: false,
    },
  });

  window.loadURL(url);
  window.webContents.setFrameRate(60);

  // otherwise the screenshots on windows are less the scrollbar which sucks
  window.webContents.on('did-finish-load', function() {
    window.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
  });

  return window;
};

var io = require('socket.io')(3001, { origins: '*:*' });

app.once('ready', () => {
  console.log('electron ready, listening for connections...');
  io.on('connection', onConnection);
});

const onConnection = socket => {
  const query = socket.request._query;
  console.log('connection! query:', query);
  const window = createWindow(query);

  socket.on('disconnect', reason => {
    console.log('DISCONNECTED, destroying page!');
    window.destroy();
  });

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

  window.webContents.on('paint', (_, rect, image) => {
    if (rect.width === 0 || rect.height === 0) {
      console.log('empty frame ignored', rect);
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
      console.log('duplicate paint ignored');
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
    console.log('paint emitted', rect);
    socket.emit('paint', paint);
  });

  socket.on('move', () => {
    window.webContents.setZoomLevel(Math.random() * 0.1);
  });

  socket.on('event', event => {
    if (event.type === 'mouseDown') console.log('event', query.url, event);
    window.webContents.sendInputEvent(event);
  });
};
