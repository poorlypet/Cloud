// Rendered text of each supplier product page (tabs and accordions opened), for dimensions, size charts and descriptions.
const {chromium}=require('playwright');const fs=require('fs');
const P=JSON.parse(fs.readFileSync(__dirname+'/fresh_products.json'));const I=JSON.parse(fs.readFileSync(__dirname+'/strict_issues.json'));
const want=new Set([...I['desc'],...I['no dimensions (one size)'],...I['size rows without numbers'].map(x=>x.split(' ')[0]),...I['materials']]);
const jobs=P.filter(p=>want.has(p.handle)&&p.src&&p.src.value).map(p=>[p.handle,p.src.value]);
const out=fs.existsSync(__dirname+'/src_text.json')?JSON.parse(fs.readFileSync(__dirname+'/src_text.json')):{};
(async()=>{const b=await chromium.launch();let k=0;
async function w(){const p=await b.newPage({viewport:{width:1300,height:900}});
 while(k<jobs.length){const [h,u]=jobs[k++];if(out[h])continue;
  try{await p.goto(u,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(2500);
   await p.evaluate(()=>{document.querySelectorAll('details').forEach(d=>d.open=true);document.querySelectorAll('[aria-expanded="false"]').forEach(e=>{try{e.click()}catch(x){}})});await p.waitForTimeout(800);
   const t=await p.evaluate(()=>{const m=document.querySelector('main')||document.body;return m.innerText});
   const imgs=await p.$$eval('img',a=>a.map(i=>i.currentSrc||i.src).filter(s=>/size|talla|guide|medid|chart/i.test(s)));
   out[h]={url:u,text:t.slice(0,12000),imgs};}catch(e){out[h]={url:u,err:String(e).slice(0,80)}}
 }await p.close()}
await Promise.all([w(),w(),w(),w()]);fs.writeFileSync(__dirname+'/src_text.json',JSON.stringify(out));
console.log('fetched',Object.keys(out).length,'of',jobs.length,'errors',Object.values(out).filter(x=>x.err).length);await b.close()})();
