import * as THREE from 'three';
import {Terminal} from 'xterm';

const Terminalx = ({
    domElement = ''
}:{
    domElement?:string
} )=> {
    const termimal = new Terminal();
    const div = document.createElement('div');
    termimal.open(div);
    termimal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
    console.log("Amit-Success");
    document.body.appendChild(div);
}

export default Terminalx;