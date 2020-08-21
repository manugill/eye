import { Terminal, ITerminalOptions } from 'xterm';
// import { WebglAddon } from 'xterm-addon-webgl';
import * as WebfontAddon from 'xterm-webfont';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const parent = document.querySelector('#terminals');

export default async (
  terminalOptions: ITerminalOptions,
  onElement?: (element: HTMLDivElement) => void,
): Promise<[Terminal, HTMLDivElement]> => {
  const element = document.createElement('div');
  parent.appendChild(element);

  if (onElement) onElement(element);

  var terminal = new Terminal({
    allowTransparency: true,
    cursorBlink: true,
    fontFamily: 'DM Mono',
    ...terminalOptions,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new WebfontAddon());

  // terminal.open(element);
  // the custom font loading requires awaiting
  await (terminal as any).loadWebfontAndOpen(element);

  fitAddon.fit();

  return [terminal, element];
};
