// @ts-check
const { app, BrowserWindow } = require("electron");
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} = require("electron-devtools-installer");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("force-device-scale-factor", "1");

const createWindow = ({
  url = undefined,
  width = "1200",
  height = "800",
  frameRate = 60,
} = {}) => {
  const size = { width: parseInt(width), height: parseInt(height) };
  const options = {
    ...size,
    show: false,
    frame: false,
    transparent: true,
    acceptFirstMouse: true,
    disableAutoHideCursor: true,
    webPreferences: {
      offscreen: true,
      scrollBounce: true,
      backgroundThrottling: false,
    },
  };
  const window = new BrowserWindow(options);

  if (url) window.loadURL(url);
  window.webContents.setFrameRate(frameRate);

  // otherwise the screenshots on windows are less the scrollbar which sucks
  window.webContents.on("did-finish-load", function () {
    window.webContents.insertCSS("::-webkit-scrollbar { display: none; }");
  });

  return window;
};

var io = require("socket.io")(3001, { origins: "*:*" });

app.once("ready", () => {
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  extensions.forEach((ref) =>
    installExtension(ref)
      .then((name) => console.log("added extension:", name, ref))
      .catch((err) => console.log("could not load extension:", ref, err))
  );

  console.log("electron ready, listening for connections...");
  io.on("connection", onConnection);
});

const paintEmitter = (socket) => (webContents, devTools = false) => {
  const window = BrowserWindow.fromWebContents(webContents);

  let paintTimeouts = [];
  const clearTimeouts = () => {
    for (let i = 0; i < paintTimeouts.length; i++) {
      clearTimeout(paintTimeouts[i]);
    }
  };

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

  webContents.on("paint", (_, rect, image) => {
    if (rect.width === 0 || rect.height === 0) {
      // console.log('empty frame ignored', rect);
      return;
    }
    const bounds = window.getBounds();
    const isFullPaint =
      bounds.width === rect.width && bounds.height == rect.height;
    const paint = newPaint(image, rect, isFullPaint ? 20 : undefined);
    if (isFullPaint) {
      clearTimeouts();
      paintTimeouts = [
        setTimeout(
          () =>
            socket.volatile.emit("paint", {
              devTools,
              paint: newPaint(image, rect),
            }),
          200
        ),
      ];
    }
    if (!isPaintChanged(paint)) {
      // console.log('duplicate paint ignored');
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
    // console.log('paint emitted', rect);
    socket.volatile.emit("paint", { devTools, paint });
  });

  return [clearTimeouts];
};

const onConnection = (socket) => {
  const query = socket.request._query;
  console.log("connection! query:", query);
  const window = createWindow(query);
  let devToolsWindow = undefined;

  const [clearTimeouts] = paintEmitter(socket)(window.webContents);
  let clearTimeoutsDevTools = () => undefined;

  socket.on("disconnect", (reason) => {
    console.log("disconnected, destroying page in 10...");
    setTimeout(() => {
      console.log("page destroyed!");
      window.webContents.closeDevTools();
      window.destroy();
      if (devToolsWindow) devToolsWindow.destroy();
    }, 10000);
  });

  socket.on("open-devtools", () => {
    // open dev tools in another window
    devToolsWindow = createWindow({ ...query, url: undefined });
    window.webContents.setDevToolsWebContents(devToolsWindow.webContents);
    window.webContents.openDevTools({ mode: "detach" });
  });

  socket.on("close-devtools", () => {
    window.webContents.closeDevTools();
    if (devToolsWindow) devToolsWindow.destroy();
  });

  window.webContents.on("devtools-opened", (...params) => {
    console.log("params", params, window.webContents.devToolsWebContents);
    [clearTimeoutsDevTools] = paintEmitter(socket)(
      window.webContents.devToolsWebContents,
      true
    );
  });

  socket.on("move", () => {
    window.webContents.setZoomLevel(Math.random() * 0.1);
  });

  socket.on("event", ({ devTools = false, ...event }) => {
    const webContents = devTools
      ? window.webContents.devToolsWebContents
      : window.webContents;

    if (!webContents) return;

    if (event.type === "mouseDown") console.log("event", query.url, event);
    if (event.type === "char" || event.type === "keyDown")
      console.log("event", event);
    webContents.focus();
    webContents.sendInputEvent(event);
    if (devTools) clearTimeoutsDevTools();
    else clearTimeouts();
    webContents.invalidate();
  });
};
