const {chromium}=require('playwright');
const B='https://www.axelandhound.com', Q='preview_theme_id=213937881478';
const pages=['/','/pages/our-story','/pages/happy-dogs','/pages/track-order','/collections/cloud7'];
(async()=>{
 const br=await chromium.launch(); const out={}; const errs=[];
 for(const w of [1440,390]){
  const ctx=await br.newContext({viewport:{width:w,height:900}});
  const pg=await ctx.newPage();
  for(const u of pages){
   await pg.goto(B+u+(u.includes('?')?'&':'?')+Q,{waitUntil:'networkidle',timeout:90000}).catch(()=>{});
   const html=await pg.content(); if(/Liquid error|Liquid syntax/i.test(html)) errs.push(u);
   if(w==1440 && u=='/'){
     for(const k of ['new','beds','walking','coats','dining','play','travel','cats','gifts']){
       await pg.hover(`.nl[data-k="${k}"]`).catch(()=>{}); await pg.waitForTimeout(900);
       const r=await pg.$$eval(`#mp-${k} [data-ah]`,els=>els.map(e=>{const b=e.getBoundingClientRect();return [e.dataset.ah,Math.round(b.width),Math.round(b.height)]}));
       r.forEach(([f,a,b])=>{(out[f]=out[f]||{page:'Menu',url:'/'})['d']=[a,b]});
     }
   }
   const r=await pg.$$eval('[data-ah]',els=>els.map(e=>{const b=e.getBoundingClientRect();return [e.dataset.ah,Math.round(b.width),Math.round(b.height),e.tagName]}));
   for(const [f,a,b,t] of r){ if(f.startsWith('menu-')) continue; const o=(out[f]=out[f]||{url:u,tag:t}); const key=w==1440?'d':'m'; if(!o[key]||a>o[key][0]) o[key]=[a,b]; }
  }
  await ctx.close();
 }
 console.log(JSON.stringify({out,errs}));
 await br.close();
})();
