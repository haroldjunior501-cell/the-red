/**
 * Génère des SVG maillots réalistes (soccer-jersey) → src/generated/nationalKitSvgs.ts
 * Usage : npm run assets:kits
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.self = window;
globalThis.Node = window.Node;
globalThis.HTMLElement = window.HTMLElement;

const SVG_NS = 'http://www.w3.org/2000/svg';
const createElementNS = window.document.createElementNS.bind(window.document);
window.document.createElementNS = (ns, name, ...args) => {
  const el = createElementNS(ns, name, ...args);
  if (ns === SVG_NS && typeof el.getBBox !== 'function') {
    el.getBBox = () => ({ x: 42, y: 26, width: 16, height: 18 });
  }
  return el;
};

const require = createRequire(import.meta.url);
const SoccerJersey = require('soccer-jersey/dist/soccer-jersey.min.js');

const KIT_STYLES = {
  FRA: { shirtColor: '#002395', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  FR: { shirtColor: '#002395', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  BRA: { shirtColor: '#FFDF00', sleeveColor: '#009B3A', shirtStyle: 'plain', textColor: '#009B3A' },
  BR: { shirtColor: '#FFDF00', sleeveColor: '#009B3A', shirtStyle: 'plain', textColor: '#009B3A' },
  ARG: {
    shirtColor: '#74ACDF',
    sleeveColor: '#000000',
    shirtStyle: 'striped',
    shirtStyleColor: '#FFFFFF',
    textColor: '#000000',
  },
  AR: {
    shirtColor: '#74ACDF',
    sleeveColor: '#000000',
    shirtStyle: 'striped',
    shirtStyleColor: '#FFFFFF',
    textColor: '#000000',
  },
  ESP: { shirtColor: '#AA151B', sleeveColor: '#F1BF00', shirtStyle: 'plain', textColor: '#FFFFFF' },
  ES: { shirtColor: '#AA151B', sleeveColor: '#F1BF00', shirtStyle: 'plain', textColor: '#FFFFFF' },
  GER: { shirtColor: '#FFFFFF', sleeveColor: '#000000', shirtStyle: 'plain', textColor: '#111111' },
  DE: { shirtColor: '#FFFFFF', sleeveColor: '#000000', shirtStyle: 'plain', textColor: '#111111' },
  ENG: { shirtColor: '#FFFFFF', sleeveColor: '#CF081F', shirtStyle: 'plain', textColor: '#CF081F' },
  'GB-ENG': { shirtColor: '#FFFFFF', sleeveColor: '#CF081F', shirtStyle: 'plain', textColor: '#CF081F' },
  POR: { shirtColor: '#006600', sleeveColor: '#FF0000', shirtStyle: 'plain', textColor: '#FFFFFF' },
  PT: { shirtColor: '#006600', sleeveColor: '#FF0000', shirtStyle: 'plain', textColor: '#FFFFFF' },
  MAR: { shirtColor: '#C1272D', sleeveColor: '#006233', shirtStyle: 'plain', textColor: '#FFFFFF' },
  MA: { shirtColor: '#C1272D', sleeveColor: '#006233', shirtStyle: 'plain', textColor: '#FFFFFF' },
  JPN: { shirtColor: '#003087', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  JP: { shirtColor: '#003087', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  USA: {
    shirtColor: '#FFFFFF',
    sleeveColor: '#BF0A30',
    shirtStyle: 'striped',
    shirtStyleColor: '#002868',
    textColor: '#002868',
  },
  US: {
    shirtColor: '#FFFFFF',
    sleeveColor: '#BF0A30',
    shirtStyle: 'striped',
    shirtStyleColor: '#002868',
    textColor: '#002868',
  },
  MEX: { shirtColor: '#006847', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  MX: { shirtColor: '#006847', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  SEN: { shirtColor: '#FFFFFF', sleeveColor: '#00853F', shirtStyle: 'plain', textColor: '#00853F' },
  SN: { shirtColor: '#FFFFFF', sleeveColor: '#00853F', shirtStyle: 'plain', textColor: '#00853F' },
  URU: {
    shirtColor: '#5EB6E4',
    sleeveColor: '#FFFFFF',
    shirtStyle: 'striped',
    shirtStyleColor: '#000000',
    textColor: '#000000',
  },
  UY: {
    shirtColor: '#5EB6E4',
    sleeveColor: '#FFFFFF',
    shirtStyle: 'striped',
    shirtStyleColor: '#000000',
    textColor: '#000000',
  },
  NED: { shirtColor: '#FF6600', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  NL: { shirtColor: '#FF6600', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  BEL: {
    shirtColor: '#000000',
    sleeveColor: '#FF0000',
    shirtStyle: 'two-color',
    shirtStyleColor: '#FFDF00',
    shirtStyleDirection: 'vertical',
    textColor: '#FFFFFF',
  },
  BE: {
    shirtColor: '#000000',
    sleeveColor: '#FF0000',
    shirtStyle: 'two-color',
    shirtStyleColor: '#FFDF00',
    shirtStyleDirection: 'vertical',
    textColor: '#FFFFFF',
  },
  ITA: { shirtColor: '#003399', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  IT: { shirtColor: '#003399', sleeveColor: '#FFFFFF', shirtStyle: 'plain', textColor: '#FFFFFF' },
  CRO: {
    shirtColor: '#FFFFFF',
    sleeveColor: '#FF0000',
    shirtStyle: 'checkered',
    shirtStyleColor: '#FF0000',
    textColor: '#FF0000',
  },
  HR: {
    shirtColor: '#FFFFFF',
    sleeveColor: '#FF0000',
    shirtStyle: 'checkered',
    shirtStyleColor: '#FF0000',
    textColor: '#FF0000',
  },
  COL: { shirtColor: '#FCD116', sleeveColor: '#003893', shirtStyle: 'plain', textColor: '#003893' },
  CO: { shirtColor: '#FCD116', sleeveColor: '#003893', shirtStyle: 'plain', textColor: '#003893' },
  GK: {
    shirtColor: '#FF6600',
    sleeveColor: '#1a1a2e',
    shirtStyle: 'two-color',
    shirtStyleColor: '#1a1a2e',
    shirtStyleDirection: 'vertical',
    textColor: '#FFFFFF',
  },
  DEFAULT: {
    shirtColor: '#1c2a42',
    sleeveColor: '#ffffff',
    shirtStyle: 'plain',
    textColor: '#ffffff',
  },
};

function normalizeSvgForNative(svg) {
  return svg
    .replace(/url\(&quot;#([^&]+)&quot;\)/g, 'url(#$1)')
    .replace(/url\("#([^"]+)"\)/g, 'url(#$1)');
}

function stripJerseyNumber(svg) {
  return svg.replace(/<text[\s\S]*?<\/text>/gi, '');
}

function drawSvg(style) {
  const raw = SoccerJersey.draw(
    {
      shirtText: '8',
      shirtColor: style.shirtColor,
      sleeveColor: style.sleeveColor,
      shirtStyle: style.shirtStyle,
      shirtStyleColor: style.shirtStyleColor,
      shirtStyleDirection: style.shirtStyleDirection,
      textColor: style.textColor ?? '#FFFFFF',
      textOutlineColor: '#000000',
    },
    false
  );
  return normalizeSvgForNative(stripJerseyNumber(raw));
}

function escapeForTs(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

const svgs = {};
for (const [code, style] of Object.entries(KIT_STYLES)) {
  svgs[code] = drawSvg(style);
  console.log('generated', code);
}

const outDir = join(process.cwd(), 'src', 'generated');
mkdirSync(outDir, { recursive: true });

const entries = Object.entries(svgs)
  .map(([k, v]) => `  ${JSON.stringify(k)}: \`${escapeForTs(v)}\`,`)
  .join('\n');

const content = `/** Fichier auto-généré — ne pas éditer. Lance : npm run assets:kits */
export const NATIONAL_KIT_SVGS: Record<string, string> = {
${entries}
};
`;

writeFileSync(join(outDir, 'nationalKitSvgs.ts'), content, 'utf8');
console.log('wrote src/generated/nationalKitSvgs.ts');
