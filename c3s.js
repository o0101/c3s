const FULL_LABEL = 'c3s-unique-';
const LABEL_LEN = 3;
const LABEL = FULL_LABEL.slice(0,LABEL_LEN);
const PREFIX_LEN = 10 + LABEL_LEN;
const PREFIX_BASE = 36;

let counter = 1;

export default c3s;

Object.assign(c3s,{});

function c3s() {
}

export function generateUniquePrefix() {
  counter += 3;
  const number = counter*Math.random()*performance.now()*(+ new Date); 
  return (LABEL + number.toString(PREFIX_BASE).replace(/\./,'')).slice(0,PREFIX_LEN);
}

