import c3s from './c3s.js';
import {generateUniquePrefix} from './c3s.js';

const TRIALS = 10;

testAll();

function testAll() {
  testPrefix();
}

function testPrefix() {
  let trials = TRIALS;
  while(trials--) {
    console.log(`Prefix ${generateUniquePrefix()}`);
  }
}

