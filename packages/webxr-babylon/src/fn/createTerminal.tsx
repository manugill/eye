import { Terminal, ITerminalOptions } from 'xterm';
import { WebglAddon } from 'xterm-addon-webgl';
import * as WebfontAddon from 'xterm-webfont';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const parent = document.querySelector('#terminals');

export default (
  terminalOptions: ITerminalOptions & { useWebgl?: boolean },
  onElement?: (element: HTMLDivElement) => void,
): [Terminal, HTMLDivElement] => {
  const element = document.createElement('div');
  parent.appendChild(element);

  if (onElement) onElement(element);

  const { useWebgl, ...options } = terminalOptions;
  var terminal = new Terminal({
    allowTransparency: true,
    cursorBlink: true,
    fontFamily: 'Fira Code',
    theme: {
      background: 'rgba(0, 0, 0, 0)',
    },
    ...options,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new WebfontAddon());

  terminal.open(element);

  if (useWebgl) terminal.loadAddon(new WebglAddon());

  fitAddon.fit();

  return [terminal, element];
};

export const createTerminalWithWebfont = async (
  terminalOptions: ITerminalOptions & { useWebgl?: boolean },
  onElement?: (element: HTMLDivElement) => void,
): Promise<[Terminal, HTMLDivElement]> => {
  const element = document.createElement('div');
  parent.appendChild(element);

  if (onElement) onElement(element);

  const { useWebgl, ...options } = terminalOptions;
  var terminal = new Terminal({
    allowTransparency: true,
    cursorBlink: true,
    fontFamily: 'Fira Code',
    theme: {
      background: 'rgba(0, 0, 0, 0)',
    },
    ...options,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new WebfontAddon());

  // the custom font loading requires awaiting
  await (terminal as any).loadWebfontAndOpen(element);

  if (useWebgl) terminal.loadAddon(new WebglAddon());

  fitAddon.fit();

  return [terminal, element];
};
