// Re-read supplier pages, clicking every tab/accordion (Details, Size & fit, Dimensions...) and keeping the text each one reveals.
const {chromium}=require('playwright');const fs=require('fs');
const T=JSON.parse(fs.readFileSync(__dirname+'/src_text.json'));const hs=process.argv.slice(2).length?process.argv.slice(2):JSON.parse(fs.readFileSync(__dirname+'/nodim.json'));
const out={};
(async()=>{const b=await chromium.launch();let k=0;
async function w(){const p=await b.newPage({viewport:{width:1300,height:900}});
 while(k<hs.length){const h=hs[k++];const u=T[h]&&T[h].url;if(!u)continue;
  try{await p.goto(u,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(2500);
   const texts=await p.evaluate(async()=>{const seen=new Set(),acc=[];const RX=/detail|size|fit|dimens|measure|medid|tama|spec|info|material|ingred/i;
    const els=[...document.querySelectorAll('button,summary,[role=tab],a[href^="#"],li,h3,h4,span')].filter(e=>RX.test(e.textContent.trim())&&e.textContent.trim().length<30);
    for(const e of els){try{e.click()}catch(x){}await new Promise(r=>setTimeout(r,250));
     (document.querySelector('main')||document.body).innerText.split('\n').forEach(l=>{l=l.trim();if(l&&!seen.has(l)){seen.add(l);acc.push(l)}})}
    return acc.join('\n')});
   out[h]=texts;}catch(e){out[h]='ERR '+String(e).slice(0,60)}}
 await p.close()}
await Promise.all([w(),w(),w(),w()]);fs.writeFileSync(__dirname+'/src_tabs.json',JSON.stringify(out));console.log('done',Object.keys(out).length);await b.close()})();
