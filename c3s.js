const FULL_LABEL = 'c3s-unique-';
const LABEL_LEN = 3;
const LABEL = FULL_LABEL.slice(0,LABEL_LEN);
const PREFIX_LEN = 10 + LABEL_LEN;
const PREFIX_BASE = 36;

import {resetRules} from './resetRules.js';
import {T} from '../jtype-system/t.js';

T.defCollection("Prefix", {
  container: T`Array`,
  member: T`String`
}, {verify: i => i.length > 0 });

let counter = 1;

export default c3s;

Object.assign(c3s,{scope,rescope});

function c3s(parts, ...values) {
  // not sure what this does yet
  // but as an object c3s exports scope and rescope to allow components
  // to request stylesheets be scoped to them
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

export function findStyleSheet(url) {
  url = getURL(url);
  return [...document.styleSheets].find(({href}) => href == url);
}

export function isStyleSheetAccessible(ss) {
  try {
    console.log(ss.cssRules);
    return true;
  } catch(e) {
    return false;
  }
}

// it may actually be better to clone the sheet using
// a style element rather than cloning using the link 
// which may both rely on and recause a network request
export function cloneStyleSheet(ss) {
  const newNode = ss.ownerNode.cloneNode(true);
  document.head.insertAdjacentElement('beforeEnd', newNode);
  ss.ownerNode.remove();
  return newNode;
}

export function addResetRules(ss) {
  
  resetRules.forEach(rule => {
    ss.insertRule(rule);
  });
}

// combinator can also be empty string ALL rules are to apply to component container
// but generally this is no. 
export function prefixAllrules(ss, prefix, combinator = ' ') {
  console.log(ss);
  [...ss.cssRules].forEach(rule => {
    const selectors = rule.selectorText.split(/,/g);
    const prefixedSelectors = selectors.map(sel => `${prefix}${combinator}${sel}`);
    rule.selectorText = prefixedSelectors.join(', ');
  });
}

export function scopeStyleSheet(url,prefix,combinator = ' ') {
  const ss = findStyleSheet(url);
  if ( !isStyleSheetAccessible(ss) ) {
    throw new TypeError(`Only CORS stylesheets can be scoped, because cross-origin rules cannot be accessed.`);
  }
  const scopedSS = cloneStyleSheet(ss);
  addResetRules(scopedSS.sheet);
  prefixAllrules(scopedSS.sheet,prefix, combinator);
  return scopedSS;
}

export function scope(url) {
  const prefix = generateUniquePrefix().prefix[0];
  return {scopedSheet: scopeStyleSheet(url,'.' + prefix), prefix};
}

// used when the first scoping didn't work and we need to add more prefix to increase specificity
// if this ever occurs
// which is why we use '' combinator to add to the prefix of the already scoped sheet
export function rescope({scopedSheet, prefix:existingPrefix}) {
  const prefix = generateUniquePrefix().prefix[0];
  const combinator = '';
  prefixAllrules(scopedSS,prefix,combinator);
  return {scopedSheet: scopedSS, prefix: prefix + existingPrefix};
}

export function getURL(uri) {
  const link = document.createElement('a');
  link.href = uri;
  return link.href;
}
