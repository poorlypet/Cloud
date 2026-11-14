const {chromium}=require('playwright');const fs=require('fs');
const A=JSON.parse(fs.readFileSync(__dirname+'/all_products.json'));
const by={};A.forEach(p=>{(by[p.vendor]=by[p.vendor]||[]).push(p)});
const pick=[];Object.values(by).forEach(l=>{const step=Math.max(1,Math.floor(l.length/8));for(let i=0;i<l.length&&pick.length<999;i+=step)pick.push(l[i])});
const ES=/\b(para|con|del|nuestro|nuestra|perro|tamaño|talla|lavar|correa|collar de)\b/i;
(async()=>{const b=await chromium.launch();const out=[];
const N=4;let k=0;
async function worker(){const p=await b.newPage({viewport:{width:1440,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message.slice(0,80)));
 while(k<pick.length){const q=pick[k++];er.length=0;
  try{await p.goto('https://www.axelandhound.com/products/'+q.handle,{waitUntil:'load',timeout:45000});await p.waitForTimeout(800);}catch(e){out.push([q.vendor,q.handle,['LOAD '+e.message.slice(0,60)]]);continue}
  const r=await p.evaluate((ESs)=>{const ES=new RegExp(ESs,'i');const I=[];const html=document.body.innerHTML,txt=document.body.innerText;
   if(/Liquid (error|syntax)|Translation missing|undefined|NaN|\bnull\b|lorem/i.test(txt))I.push('BADTEXT '+(txt.match(/Liquid (error|syntax).{0,40}|Translation missing.{0,30}|\bundefined\b|\bNaN\b|\bnull\b|lorem/i)||[''])[0]);
   const sizes=[...document.querySelectorAll('.szs button[data-s]')].map(b=>b.dataset.s);
   if(sizes.some(s=>/^(one|title|default)/i.test(s)))I.push('SIZE '+sizes.join(','));
   const rows=[...document.querySelectorAll('.zsz tr[data-s]')].map(t=>t.dataset.s);
   if(sizes.length&&!rows.length)I.push('NO SIZE GUIDE');
   const miss=sizes.filter(s=>rows.length&&!rows.includes(s));if(miss.length)I.push('ROW MISSING '+miss.join(','));
   const panes=[...document.querySelectorAll('.ztp')];const desc=(panes[0]||{}).innerText||'';
   if(desc.trim().length<60)I.push('SHORT DESC '+desc.trim().slice(0,40));
   if(ES.test(desc))I.push('SPANISH '+(desc.match(ES)||[''])[0]);
   const mc=(panes[3]||{}).innerText||'';if(/on the label/i.test(mc))I.push('NO MATERIALS');
   const br=[...document.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth===0&&i.getAttribute('src')&&!i.src.startsWith('data:'));if(br.length)I.push('BROKEN IMG '+br.length);
   const h1=(document.querySelector('h1')||{}).textContent||'';if(/\s{2,}|,\s*$|\(\s*\)/.test(h1.trim()))I.push('TITLE '+h1.trim());
   return I},ES.source);
  if(er.length)r.push('JS '+er.join('|'));
  const sib=(q.sib&&q.sib.value)?JSON.parse(q.sib.value).length:0;
  if(sib>1){const n=await p.$$eval('.ah-sibs a, .ah-sibs button, .sw a',x=>x.length).catch(()=>0);if(!n)r.push('NO SWATCH (sib '+sib+')')}
  if(r.length)out.push([q.vendor,q.handle,r]);}
 await p.close()}
await Promise.all(Array.from({length:N},worker));
console.log('checked',pick.length,'with issues',out.length);out.forEach(o=>console.log(o[0],'|',o[1],'|',o[2].join(' ; ')));
await b.close()})();
