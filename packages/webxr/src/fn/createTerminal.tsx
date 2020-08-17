import { Terminal, ITerminalOptions } from 'xterm'
import { WebglAddon } from 'xterm-addon-webgl'
import 'xterm/css/xterm.css'

const parent = document.querySelector('#terminals')

export default (
	terminalOptions: ITerminalOptions = {
		allowTransparency: true,
		cursorBlink: true,
	},
	onElement?: (element: HTMLDivElement) => void,
	onTerminal?: (terminal: Terminal, element: HTMLDivElement) => void,
) => {
	const element = document.createElement('div')
	parent.appendChild(element)

	if (onElement) onElement(element)

	var terminal = new Terminal(terminalOptions)
	terminal.open(element)

	if (onTerminal) onTerminal(terminal, element)

	return { terminal, element }
}
