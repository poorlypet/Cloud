// Open one product page per family and fit in a normal browser and keep the size chart the page itself loads.
const {chromium}=require('playwright');
const fs=require('fs');
const reps=JSON.parse(fs.readFileSync(__dirname+'/chart_reps.json'));
const outF=__dirname+'/charts.json';
const out=fs.existsSync(outF)?JSON.parse(fs.readFileSync(outF)):{};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1300,height:900}});
  await ctx.route(/\.(png|jpe?g|webp|gif|mp4|woff2?)(\?|$)/,r=>r.abort());
  let n=0;
  for(const h of reps){
    if(out[h]!==undefined) continue;
    let p;
    try{
    p=await ctx.newPage();
    let got=null;
    p.on('response',async r=>{ if(/getSizingChart/.test(r.url())){ try{ got=await r.json(); }catch(e){} } });
    try{ await p.goto('https://cloud7.de/en-gb/products/'+h,{waitUntil:'domcontentloaded',timeout:60000}); }catch(e){}
    await p.waitForTimeout(2500);
    try{ await p.click('[data-kiwi-trigger]',{timeout:8000}); }catch(e){}
    for(let i=0;i<30&&!got;i++) await p.waitForTimeout(500);
    out[h]=got&&got.sizings?got.sizings:[];
    await p.close();
    }catch(e){ console.log('skip',h,String(e).slice(0,80)); try{await p.close()}catch(_){}; continue; }
    if(++n%10==0){ fs.writeFileSync(outF,JSON.stringify(out)); console.log(n,new Date().toISOString()); }
  }
  fs.writeFileSync(outF,JSON.stringify(out)); console.log('done',Object.keys(out).length);
  await b.close();
})();
