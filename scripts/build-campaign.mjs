import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sessions } from '../content/campaigns/message-in-a-bottle/sessions.mjs';

const root=process.cwd();
const src=path.join(root,'content/campaigns/message-in-a-bottle');
const dest=path.join(root,'public/campaigns/message-in-a-bottle-module');
mkdirSync(dest,{recursive:true});
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const read=name=>readFileSync(path.join(src,name+'.md'),'utf8');
const sessionText=s=>`## Session ${s.id} - ${s.title}\n\n**${s.act}.** ${s.purpose}\n\n### Opening\n\n> ${s.readAloud}\n\n### Essential clues\n\n${s.essentialClues.map(x=>'- '+x).join('\n')}\n\n${s.clock?`### Visible clock: ${s.clock.label}\n\n**${s.clock.max} boxes.** ${s.clock.trigger} **At the limit:** ${s.clock.consequence}\n\n`:''}${s.scenes.map((x,i)=>`### ${i+1}. ${x.title}\n\n**Offer:** ${x.prompt}\n\n${x.procedure}\n\n**Clue:** ${x.clue}`).join('\n\n')}\n\n### Outcomes\n\n**Success:** ${s.outcomes.success}\n\n**Partial success:** ${s.outcomes.partial}\n\n**Failure route:** ${s.outcomes.failure}\n\n### Before the next gathering\n\n${s.next}`;
const body=[read('introduction'),...sessions.map(sessionText),read('appendix')].join('\n\n');
const notice=read('appendix').split('**Required Savage Worlds Fan License notice:**')[1].split('[Pinnacle')[0].trim();
const handouts=read('handouts')+'\n\n## Credits and fan notice\n\nCampaign and handout direction: Austen Tucker-Crowder. Human-directed AI tools assisted writing and assembly. This is a free, unofficial, unplaytested fan edition requiring the SWADE core rules.\n\n'+notice;
const md=text=>renderToStaticMarkup(React.createElement(Markdown,{remarkPlugins:[remarkGfm],components:{h2:({children})=>React.createElement('h2',{id:slug(children),className:String(children).startsWith('Session ')?'session-start':''},children)}},text));
const cover=player=>`<header class="cover"><p class="eyebrow">Free fan edition 0.1 · ${player?'Player handouts':'GM edition · Full spoilers'}</p><h1>Message in a Bottle</h1><p class="subtitle">Eight gatherings. One city. Nobody gets to own the people inside it.</p><img class="cover-art" src="assets/chicago-snowglobe.webp" alt="Chicago’s illuminated skyline inside a snow globe, an illustration of the campaign’s central reveal."><p>For Savage Worlds Adventure Edition<br>Campaign by Austen Tucker-Crowder</p><img class="fan-logo" src="assets/savage-worlds-fan.png" alt="Savage Worlds Fan product logo"><p class="small">Requires the SWADE core rules. Unofficial, unplaytested fan edition. AI assistance disclosed in the credits.</p></header>`;
const head=(title,description,indexable=false)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="${indexable?'index, follow':'noindex, follow'}"><link rel="stylesheet" href="module.css"></head>`;
writeFileSync(path.join(dest,'module.md'),'# Message in a Bottle\n\n'+body);
writeFileSync(path.join(dest,'handouts.md'),'# Message in a Bottle - player handouts\n\n'+handouts);
writeFileSync(path.join(dest,'campaign.json'),JSON.stringify({version:1,title:'Message in a Bottle',sessions},null,2)+'\n');
const nav=`<nav class="document-nav" aria-label="Module"><a href="./">GM runner</a><a href="../../downloads/message-in-a-bottle-module.pdf">GM module PDF</a><a href="handouts.html">Player handouts</a><a href="https://work.thearcades.me/blog/the-work-didnt-disappear">The essay</a></nav>`;
writeFileSync(path.join(dest,'module.html'),head('Message in a Bottle - free SWADE campaign','A free eight-gathering fan campaign for Savage Worlds Adventure Edition.')+`<body><a class="skip-link" href="#module">Skip to module</a>${nav}${cover(false)}<main id="module" class="document" tabindex="-1">${md(body)}</main><footer>${nav}</footer></body></html>`);
// Player handouts must not carry the GM reveal image or GM subtitle on their cover.
const playerCover=cover(true).replace(/<img class="cover-art"[^>]*>/,'').replace('Eight gatherings. One city. Nobody gets to own the people inside it.','Reunion sheet, discovered documents, route card, and session record.');
writeFileSync(path.join(dest,'handouts.html'),head('Message in a Bottle - player handouts','Player handouts; reveal the later sheets only when directed by the GM.')+`<body><a class="skip-link" href="#handouts">Skip to handouts</a>${nav}${playerCover}<main id="handouts" class="document handouts" tabindex="-1">${md(handouts)}</main></body></html>`);
if(process.argv.includes('--pdf')){
 const {chromium}=await import('@playwright/test');const browser=await chromium.launch();const page=await browser.newPage();
 const output=process.argv.find(a=>a.startsWith('--output-dir='))?.split('=')[1]??path.join(root,'public/downloads');mkdirSync(output,{recursive:true});
 for(const [file,name] of [['module.html','message-in-a-bottle-module'],['handouts.html','message-in-a-bottle-player-handouts']]){
  await page.goto('file://'+path.join(dest,file));
  await page.pdf({path:path.join(output,name+'.pdf'),format:'A4',tagged:true,outline:true,printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:9px;width:100%;text-align:center;color:#222">Message in a Bottle · Fan edition 0.1 · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',margin:{top:'16mm',bottom:'19mm',left:'17mm',right:'17mm'}});
  copyFileSync(path.join(output,name+'.pdf'),path.join(root,'public/downloads',name+'.pdf'));
 }
 await browser.close();
}
console.log(`Campaign built: ${sessions.length} sessions, ${sessions.reduce((n,s)=>n+s.scenes.length,0)} scene cards.`);
