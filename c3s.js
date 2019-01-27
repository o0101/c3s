const FULL_LABEL = 'c3s-unique-';
const LABEL_LEN = 3;
const LABEL = FULL_LABEL.slice(0,LABEL_LEN);
const PREFIX_LEN = 10 + LABEL_LEN;
const PREFIX_BASE = 36;

import {T} from './externals.js';

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
  const ssFound = Array.from(document.styleSheets).find(({href}) => href == url);
  if ( !ssFound ) {
    const qsFound = document.querySelector(`link[href="${url}"]`);
    return qsFound && qsFound;
  } else return ssFound.ownerNode;
}

export function isStyleSheetAccessible(ss) {
  try {
    Array.from(ss.sheet.cssRules);
    return true;
  } catch(e) {
    return false;
  }
}

// it may actually be better to clone the sheet using
// a style element rather than cloning using the link 
// which may both rely on and recause a network request
export function cloneStyleSheet(ss) {
  const newNode = ss.cloneNode(true);
  newNode.dataset.scoped = true;
  document.head.insertAdjacentElement('beforeEnd', newNode);
  ss.remove();
  return newNode;
}

export function prefixAllRules(ss, prefix, combinator = ' ') {
  const lastRuleIndex = ss.cssRules.length - 1;
  let i = lastRuleIndex;

  while(i >= 0) {
    const lastRule = ss.cssRules[lastRuleIndex];
    if ( lastRule.type == CSSRule.STYLE_RULE ) {
      prefixStyleRule(lastRule, ss, lastRuleIndex, prefix, combinator)
    } else if ( lastRule.type == CSSRule.MEDIA_RULE ) {
      const rules = Array.from(lastRule.cssRules);
      const lastIndex = rules.length - 1;
      for ( const rule of rules ) {
        prefixStyleRule(rule, lastRule, lastIndex, prefix, combinator);
      }
      ss.deleteRule(lastRuleIndex);
      ss.insertRule(lastRule.cssText, 0);
    }
    i--;
  }
}

function prefixStyleRule(lastRule, ss, lastRuleIndex, prefix, combinator) {
  let newRuleText = lastRule.cssText;
  const {selectorText} = lastRule;
  const selectors = selectorText.split(/\s*,\s*/g);
  const modifiedSelectors = selectors.map(sel => {
    // we also need to insert prefix BEFORE any descendent combinators
    const firstDescendentIndex = sel.indexOf(' ');
    if ( firstDescendentIndex > -1 ) {
      const firstSel = sel.slice(0, firstDescendentIndex);
      const restSel = sel.slice(firstDescendentIndex);
      // we also need to insert prefix BEFORE any pseudo selectors 
        // NOTE: the following indexOf test will BREAK if selector contains a :
        // such as [ns\\:name="scoped-name"]
      const firstPseudoIndex = firstSel.indexOf(':');
      if ( firstPseudoIndex > -1 ) {
        const [pre, post] = [ firstSel.slice(0, firstPseudoIndex ), firstSel.slice(firstPseudoIndex) ];
        return `${pre}${prefix}${post}${restSel}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
      } else return `${firstSel}${prefix}${restSel}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
    } else {
      const firstPseudoIndex = sel.indexOf(':');
      if ( firstPseudoIndex > -1 ) {
        const [pre, post] = [ sel.slice(0, firstPseudoIndex ), sel.slice(firstPseudoIndex) ];
        return `${pre}${prefix}${post}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
      } else return `${sel}${prefix}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
    }
  });
  const ruleBlock = newRuleText.slice(newRuleText.indexOf('{'));
  const newRuleSelectorText = modifiedSelectors.join(', ');
  newRuleText = `${newRuleSelectorText} ${ruleBlock}`;
  ss.deleteRule(lastRuleIndex);
  ss.insertRule(newRuleText, 0);
}

export async function scopeStyleSheet(url,prefix,combinator = ' ') {
  const ss = findStyleSheet(url);

  if ( ! ss ) {
    throw new TypeError(`Stylesheet with URI ${url} cannot be found.`);
  }

  const isKnownAccessible = isStyleSheetAccessible(ss);

  if ( ! isKnownAccessible ) {
    return new Promise(res => {
      ss.onload = () => {
        const isAccessible = isStyleSheetAccessible(ss);
        if ( ! isAccessible ) {
          throw new TypeError(`Non CORS sheet at ${url} cannot have its rules accessed so cannot be scoped.`);
        }
        const scopedSS = cloneStyleSheet(ss);
        scopedSS.onload = () => {
          prefixAllRules(scopedSS.sheet,prefix, combinator);
        };
        res(scopedSS);
      };
    });
  } else {
    const scopedSS = cloneStyleSheet(ss);
    scopedSS.onload = () => {
      prefixAllRules(scopedSS.sheet,prefix, combinator);
    };
    return scopedSS;
  }
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
  prefixAllRules(scopedSS,prefix,combinator);
  return {scopedSheet: scopedSS, prefix: prefix + existingPrefix};
}

export function getURL(uri) {
  const link = document.createElement('a');
  link.href = uri;
  return link.href;
}
