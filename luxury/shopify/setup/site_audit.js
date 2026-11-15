const {chromium}=require('playwright');const fs=require('fs');
const menu=JSON.parse(fs.readFileSync(__dirname+'/menu_urls.json')).map(x=>x[2]).filter(u=>u.startsWith('/'));
const extra=['/','/search?q=collar','/cart','/account/login','/pages/our-story','/pages/brands','/pages/happy-dogs','/policies/privacy-policy','/policies/refund-policy','/policies/terms-of-service','/policies/shipping-policy','/collections/all','/collections/cloud7','/blogs/news'];
const urls=[...new Set([...extra,...menu])];
const PH=/lorem|ipsum|placeholder|coming soon|TBC|TODO|example\.com|0000 000|123 Fake|your (email|brand|store) here|\bundefined\b|\bNaN\b|Liquid error|Translation missing|My Store/i;
(async()=>{const b=await chromium.launch();const out=[];let k=0;const hashLinks=new Set(),ext=new Set();
async function w(){const p=await b.newPage({viewport:{width:1440,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message.slice(0,70)));
 while(k<urls.length){const u=urls[k++];er.length=0;let st=0;
  try{const r=await p.goto('https://www.axelandhound.com'+u,{waitUntil:'load',timeout:45000});st=r&&r.status();await p.waitForTimeout(700)}catch(e){out.push([u,'LOAD FAIL']);continue}
  const r=await p.evaluate((src)=>{const PH=new RegExp(src,'i');const t=document.body.innerText;const I=[];
   const m=t.match(new RegExp('.{0,40}('+src+').{0,40}','i'));if(m)I.push('TEXT: '+m[0].replace(/\s+/g,' '));
   const cards=document.querySelectorAll('.card, .pc, [class*="product-card"], .g4 > *').length;
   if(/\/collections\//.test(location.pathname)&&/no products|0 products|nothing here|empty/i.test(t))I.push('EMPTY COLLECTION PAGE');
   const br=[...document.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth===0&&i.src&&!i.src.startsWith('data:')).map(i=>i.src.slice(-50));if(br.length)I.push('BROKEN IMG '+br.slice(0,2).join(','));
   const blank=[...document.querySelectorAll('[data-ah].ah-blank')].map(e=>e.dataset.ah);if(blank.length)I.push('EMPTY PHOTO SLOTS '+blank.length+': '+blank.slice(0,4).join(','));
   const hash=[...document.querySelectorAll('a[href="#"], a[href=""]')].map(a=>a.textContent.trim().slice(0,30)).filter(Boolean);
   const ext=[...document.querySelectorAll('a[href^="http"]')].map(a=>a.href).filter(h=>!/axelandhound|shopify/.test(h));
   return {I,hash,ext,title:document.title}},PH.source);
  if(st>=400)r.I.push('HTTP '+st);if(er.length)r.I.push('JS '+er.join('|'));
  r.hash.forEach(h=>hashLinks.add(h));r.ext.forEach(h=>ext.add(h));
  if(r.I.length)out.push([u,r.I.join(' ; ')]);}
 await p.close()}
await Promise.all([w(),w(),w(),w()]);
console.log('pages',urls.length);out.forEach(o=>console.log(o[0],'|',o[1]));
console.log('DEAD # LINKS',[...hashLinks].join(' / '));console.log('EXTERNAL',[...ext].join(' '));await b.close()})();
