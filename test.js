import c3s from './c3s.js';
import {generateUniquePrefix, extendPrefix, scope} from './c3s.js';

const TRIALS = 10;

let prefixes = [];

//testAll();

function testAll() {
  testPrefix();
  testExtendPrefix();
  testScope('crazy.css');
}

function testPrefix() {
  let trials = TRIALS;
  while(trials--) {
    let prefix = generateUniquePrefix();
    console.log(`Prefix ${JSON.stringify(prefix)}`);
    prefixes.push(prefix);
  }
}

function testExtendPrefix() {
  for( const p of prefixes ) {
    extendPrefix(p);
    console.log(`Extended prefix ${JSON.stringify(p)}`);
  }
}

function testScope(uri) {
  const {prefix} = scope(uri);
  const affectedElement = document.querySelector('.scoped-element');
  affectedElement.classList.add(prefix);
}

