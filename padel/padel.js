/* PADEL shared components: header, footer, brand rail, product cards */
const BRANDS=['Bullpadel','Nox','Adidas Padel','Head','Babolat','StarVie','Siux','Varlion','Black Crown','Drop Shot','Vibor-A','Wilson','Royal Padel','Kombat','Joola','Selkirk'];

// lvl: 1 starter, 2 club, 3 competitive
const PRODUCTS=[
  {b:'Bullpadel',n:'Vertex 04 Hybrid',p:289,l:3,t:'New season',s:'padel'},
  {b:'Nox',n:'AT10 Genius 18K',p:269,w:299,l:3,s:'padel'},
  {b:'Head',n:'Speed Motion 2026',p:189,l:2,t:'Staff pick',s:'padel'},
  {b:'Babolat',n:'Counter Veron',p:149,l:2,s:'padel'},
  {b:'Adidas Padel',n:'Match Light 3.3',p:79,l:1,t:'Best for beginners',s:'padel'},
  {b:'StarVie',n:'Aquila Soft',p:119,w:139,l:1,s:'padel'},
  {b:'Siux',n:'Electra ST3 Pro',p:249,l:3,t:'Low stock',s:'padel'},
  {b:'Drop Shot',n:'Canyon 2.0',p:69,l:1,s:'padel'},
  {b:'Joola',n:'Perseus 16mm',p:199,l:3,t:'Pickleball',s:'pickle'},
  {b:'Head',n:'Radical Tour Pickle',p:89,l:2,s:'pickle'},
  {b:'Selkirk',n:'SLK Neo Starter Set',p:59,l:1,t:'Pickleball',s:'pickle'},
  {b:'Varlion',n:'LW Carbon Difusor',p:169,l:2,s:'padel'}
];

const LEVELS={
  1:{k:'Starter',h:'Just starting out',d:'Forgiving round shapes, soft foam and lighter frames. Built to make your first season fun.',r:'£40 to £120'},
  2:{k:'Club',h:'Playing every week',d:'Hybrid shapes with more bite. For players who have found their game and want more from it.',r:'£120 to £220'},
  3:{k:'Competitive',h:'Tournament ready',d:'Diamond shapes, carbon faces and stiff cores. Maximum power for players who can control it.',r:'£200 and up'}
};

const ARROW='<svg class="arrow" viewBox="0 0 16 10" fill="none"><path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" stroke-width="1.6"/></svg>';

function card(x){
  const bars=[1,2,3].map(i=>`<b class="${i<=x.l?'on':''}"></b>`).join('');
  return `<a class="card" href="#"><div class="im"><span class="note">Product image</span>${x.t?`<span class="tag${/New|Low/.test(x.t)?' hot':''}">${x.t}</span>`:''}<span class="lvl" title="${LEVELS[x.l].k}">${bars}</span><span class="quick">Quick add</span></div>
  <div class="meta"><span class="br">${x.b}</span><span class="pr">£${x.p}${x.w?`<s>£${x.w}</s>`:''}</span><span class="nm">${x.n}</span></div></a>`;
}

function mount(){
  const ann=document.querySelector('[data-ann]');
  if(ann){const m=['Free UK delivery over £75','Over 40 European brands in one place','Demo rackets before you buy','Free returns within 30 days','Expert fitting by level'];
    ann.innerHTML=`<div class="rail">${[...m,...m,...m,...m].map(t=>`<span>${t}</span>`).join('')}</div>`;}
  const hdr=document.querySelector('[data-hdr]');
  if(hdr){hdr.innerHTML=`<div class="wrap in"><nav><a href="#">Padel</a><a href="#">Pickleball</a><a href="#">Shop by level</a><a href="#">Brands</a><a href="#">Sale</a></nav><button class="burger" aria-label="Menu"></button>
    <a class="logo" href="index.html">PADEL<i>.</i></a><div class="tools"><a href="#">Search</a><a href="#">Account</a><a class="bag" href="#">Bag 0</a></div></div>`;
    if(hdr.classList.contains('over')){const a=document.querySelector('[data-ann]'),f=()=>{hdr.classList.toggle('solid',scrollY>innerHeight*.8);hdr.style.top=Math.max(0,(a?a.offsetHeight:0)-scrollY)+'px';};addEventListener('scroll',f,{passive:true});f();}}
  document.querySelectorAll('[data-brands]').forEach(el=>{el.innerHTML=`<div class="rail">${[...BRANDS,...BRANDS].map(b=>`<span>${b}</span>`).join('')}</div>`;});
  document.querySelectorAll('[data-products]').forEach(el=>{
    const q=el.dataset.products; let list=PRODUCTS;
    if(q==='pickle')list=PRODUCTS.filter(p=>p.s==='pickle');
    else if(/^[123]$/.test(q))list=PRODUCTS.filter(p=>p.l==q&&p.s==='padel');
    else if(q==='new')list=PRODUCTS.filter(p=>p.s==='padel').slice(0,8);
    const n=+el.dataset.count||list.length; el.innerHTML=list.slice(0,n).map(card).join('');});
  const news=document.querySelector('[data-news]');
  if(news){news.innerHTML=`<div class="wrap in"><h2 class="d">Get on<br>the list<span class="acc">.</span></h2><div><p style="color:#BDBDBD;max-width:460px;margin-bottom:28px">New drops from across Europe, early access to sale and a level guide written by coaches. One email a week, no filler.</p><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Done'"><input type="email" placeholder="Your email" required><button>Sign up</button></form><small>You can unsubscribe whenever you like.</small></div></div>`;}
  const ftr=document.querySelector('[data-ftr]');
  if(ftr){const col=(h,l)=>`<div><h4 class="lbl">${h}</h4><ul>${l.map(x=>`<li><a href="#">${x}</a></li>`).join('')}</ul></div>`;
    ftr.innerHTML=`<div class="wrap"><div class="cols"><div><p style="max-width:300px">The best padel and pickleball gear from across Europe, picked by players and sorted by level.</p></div>${col('Shop',['Padel rackets','Pickleball paddles','Shoes','Bags','Balls','Apparel'])}${col('By level',['Starter','Club','Competitive','Racket finder'])}${col('Help',['Delivery','Returns','Racket demos','Contact'])}${col('Follow',['Instagram','TikTok','YouTube','Strava'])}</div>
    <div class="big">PADEL<i>.</i></div><div class="base"><span>© 2026 PADEL</span><span>Privacy  ·  Terms  ·  Cookies</span></div></div>`;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
}
document.addEventListener('DOMContentLoaded',mount);
