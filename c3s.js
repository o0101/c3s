const FULL_LABEL = 'c3s-unique-';
const LABEL_LEN = 3;
const LABEL = FULL_LABEL.slice(0,LABEL_LEN);
const PREFIX_LEN = 10 + LABEL_LEN;
const PREFIX_BASE = 36;

import {T} from '../jtype-system/t.js';

T.defCollection("Prefix", {
  container: T`Array`,
  member: T`String`
}, {verify: i => i.length > 0 });

let counter = 1;

export default c3s;

Object.assign(c3s,{});

function c3s() {
}

export function generateUniquePrefix() {
  counter += 3;
  const number = counter*Math.random()*performance.now()*(+ new Date); 
  const prefixString = (LABEL + number.toString(PREFIX_BASE).replace(/\./,'')).slice(0,PREFIX_LEN);
  return { prefix: [prefixString] };
}

export function extendPrefix({prefix:existingPrefix}) {
  T.guard(T`Prefix`, existingPrefix);
  existingPrefix.push(generateUniquePrefix().prefix[0]);
}

