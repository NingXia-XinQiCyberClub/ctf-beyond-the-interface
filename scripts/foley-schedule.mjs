// Read animation constants directly: audio follows the rendered 30 fps clock.
import fs from 'node:fs';
import ts from 'typescript';
const parse = p => ts.createSourceFile(p, fs.readFileSync(p, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const range = parse('src/scenes/RangeOperations.tsx');
const declarations = new Map();
function walk(n) { if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) declarations.set(n.name.text, n.initializer); ts.forEachChild(n, walk); }
walk(range);
function value(n) {
  if (ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return ts.isNumericLiteral(n) ? Number(n.text) : n.text;
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(value);
  if (ts.isObjectLiteralExpression(n)) return Object.fromEntries(n.properties.map(p => [p.name.getText().replaceAll('"',''), value(p.initializer)]));
  throw Error(`Unsupported animation constant: ${n.getText()}`);
}
const fps = 30, events = [], add = (frame, kind, label, gain = 1, pan = 0) => events.push({frame, time: frame / fps, kind, label, gain, pan});
const ease = x => { x = Math.max(0, Math.min(1, x)); return x*x*x*(x*(x*6-15)+10); };
const switches = [[10,1],[14,0],[19,1],[24,0],[29,1],[35,0],[38,1]];
const camera = t => { let c = 0; for (const [at,to] of switches) { if(t < at) break; c += (to-c)*ease((t-at)/.6); } return c; };
const pages = [
  ['RED_ACCESS',false,2,14],['RED_TASK',false,14,24],['RED_RETRY',false,24,35],
  ['BLUE_TRACE',true,10,19],['BLUE_BLOCK',true,19,29],['BLUE_FIX',true,29,35],
];
let lastKey = -10;
for(let f=0; f<41*fps; f++) {
  const t=f/fps, c=camera(t);
  for(const [name,blue,start,end] of pages) {
    if(t < start || t >= end || ease((t-start)/.42) < .15) continue;
    // Text starts at x=1222. Require most of it to be inside the viewport.
    const x=(blue?1920:0)+1222-1920*c;
    if(x < -100 || x > 1650) continue;
    for(const line of value(declarations.get(name))) {
      if(line.kind !== 'command') continue;
      const now=Math.max(0,Math.min(line.text.length,Math.floor((t-line.at)*95)));
      const before=Math.max(0,Math.min(line.text.length,Math.floor((t-1/fps-line.at)*95)));
      if(now>before && ease((t-line.at)/.1)>.15 && f-lastKey>=2) {
        add(98*fps+f,'key',`${name}: ${line.text}`, .78, blue?.13:-.13); lastKey=f;
      }
    }
  }
}
// Report bodies use the same typewriter function as the command consoles.
const reports=declarations.get('sections');
if(!ts.isConditionalExpression(reports)) throw Error('Report structure changed');
for(const [start,rows] of [[133,value(reports.whenFalse)],[136,value(reports.whenTrue)]]) {
  for(let f=1;f<90;f++) {
    const t=f/fps;
    const typing=rows.some((r,i)=>{
      const at=.65+i*.38;
      return Math.min(r[2].length,Math.max(0,Math.floor((t-at)*100))) > Math.min(r[2].length,Math.max(0,Math.floor((t-1/fps-at)*100))) && ease((t-at)/.4)>.15;
    });
    // Blue report enters from the right during the horizontal camera move.
    if(typing && f%2===0 && (start===133 || t>.32)) add(start*fps+f,'key','Report body input',.48,start===133?-.1:.1);
  }
}
// Intro command: nine characters per second, exactly as displayed.
for(let i=1;i<='init --attack'.length;i++) add(Math.ceil((.4+i/9)*fps),'key','init --attack',.65);
// Quiet process feedback; no repeated beep for decorative background particles.
for(const t of [.65,1.6,2.5]) add(Math.round(t*fps),'scan','Opening surface scan',.6);
const root=parse('src/Root.tsx'); let chapters;
function findChapters(n) { if(ts.isVariableDeclaration(n)&&n.name.getText()==='CHAPTERS') chapters=n.initializer; ts.forEachChild(n,findChapters); } findChapters(root);
const chapterData=chapters.elements.map(n=>Object.fromEntries(n.properties.filter(p=>['from','timeMap'].includes(p.name.getText())).map(p=>[p.name.getText(),value(p.initializer)])));
function mappedFrame(chapter,source) {
  const {from,timeMap:m}=chapterData.find(c=>c.from===chapter);
  for(let i=1;i<m.length;i++) if(source<=m[i][1]) return Math.round((from+m[i-1][0]+(source-m[i-1][1])/(m[i][1]-m[i-1][1])*(m[i][0]-m[i-1][0]))*fps);
  throw Error('Source event out of chapter');
}
for(let t=4.5;t<10.3;t+=.9) add(mappedFrame(54,t),'scan','Misc pixel scan',.42);
add(mappedFrame(54,10.3),'scanDone','Pixel scan complete',.65);
// These are displayed typewriter outputs, so use lighter data ticks than keys.
for(const [chapter,start,length,rate] of [[10,15.6,10,22],[54,8.8,44,24],[54,11.2,10,13]])
  for(let i=1;i<=length;i+=3) add(mappedFrame(chapter,start+i/rate),'data','Decoded character group',.32);
for(const [at,to] of switches) add((98+at)*fps,'swipe','Red / blue horizontal slide',.6,to? .35:-.35);
add(97*fps,'swipe','Mail to operations slide',.7,-.25);
for(const t of [100,108.35,112.35,117.35,122.35,127.35]) add(Math.round(t*fps),'panel','Console opens',.4);
add(Math.round(108.6*fps),'scan','Blue trace scan',.6);
add(Math.round(110.8*fps),'scanDone','Source session correlated',.6);
add(Math.round(118.5*fps),'shield','Policy barrier activates',.6);
for(const t of [127.6,128.3]) add(Math.round(t*fps),'shield','Authorization hardening lock',.65);
add(Math.round(132.7*fps),'scanDone','Legal traffic retest passed',.4);
add(Math.round(140.75*fps),'data','QR code reveal',.35);
events.sort((a,b)=>a.frame-b.frame);
if(events.some(e=>!Number.isInteger(e.frame)||e.frame<0||e.frame>=4500)) throw Error('Invalid sound frame');
fs.mkdirSync('outputs/sfx-upgrade',{recursive:true});
fs.writeFileSync('outputs/sfx-upgrade/schedule.json',JSON.stringify({fps,events},null,2)+'\n');
console.log(`Aligned foley: ${events.length} events; ${events.filter(e=>e.kind==='key').length} keyboard clicks.`);
