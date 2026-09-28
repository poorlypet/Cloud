/* ==========================================================================
   Sustainability (versions A, B, C). Needs products.js (window.PP_PRODUCTS).

   "Sustainable choices" are built only from the Shopify tags already on each
   product (snapshot in products.js). Nothing is added or inferred: a product is in
   a group only if its listing carries one of that group's tags.
     natural  : natural, natural-ingredients, 100-natural, natural-treat(s),
                natural-chew, natural-grooming, natural-peanut-butter, natural-cheese-topper
     uk       : made-in-uk
     vegan    : vegan, plant-based
     organic  : organic            (not organic-sulphur, which is an ingredient)
     compost  : compostable, biodegradable, eco-friendly
   ========================================================================== */
(function(){
  'use strict';
  var P=(window.PP_PRODUCTS||[]);
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function money(n){return '£'+n.toFixed(2)}

  var GROUPS=[
    {k:'natural',n:'Natural ingredients',re:/^(natural|natural-ingredients|100-natural|natural-treats?|natural-chew|natural-grooming|natural-peanut-butter|natural-cheese-topper)$/},
    {k:'uk',n:'Made in the UK',re:/^made-in-uk$/},
    {k:'vegan',n:'Vegan or plant-based',re:/^(vegan|plant-based)$/},
    {k:'organic',n:'Organic',re:/^organic$/},
    {k:'compost',n:'Compostable or biodegradable',re:/^(compostable|biodegradable|eco-friendly)$/}
  ];
  P.forEach(function(p){
    var t=(p.tags||[]).map(function(x){return String(x).toLowerCase()});
    p._su={};GROUPS.forEach(function(g){if(t.some(function(x){return g.re.test(x)}))p._su[g.k]=1});
  });
  var ALL=P.filter(function(p){return Object.keys(p._su).length});
  function score(p){return (p.rating||0)*Math.log(2+(p.reviewCount||0))+(Object.keys(p._su).length*.3)}
  ALL.sort(function(a,b){return score(b)-score(a)||a.title.localeCompare(b.title)});
  function inG(k){return k==='all'?ALL.slice():ALL.filter(function(p){return p._su[k]})}
  var BRANDS={};ALL.forEach(function(p){BRANDS[p.brand]=(BRANDS[p.brand]||0)+1});

  /* ---------- the site's product card (.pk) ---------- */
  function stars(r){var h='<span class="stars" aria-hidden="true">';for(var i=1;i<=5;i++){var f=r-(i-1);h+=f>=1?'<i class="on"></i>':f>0?'<i class="part" style="--f:'+Math.round(f*100)+'%"></i>':'<i></i>'}return h+'</span>'}
  function rev(p){
    if(!p.rating)return '<span class="rev none" aria-hidden="true"></span>';
    var n=p.reviewCount||0;
    return '<a class="rev" href="#">'+stars(p.rating)+'<span>'+(Math.round(p.rating*10)/10)+' <em>('+n+' review'+(n===1?'':'s')+')</em></span></a>';
  }
  function tabFor(p){for(var i=0;i<GROUPS.length;i++){if(p._su[GROUPS[i].k]&&GROUPS[i].k!=='natural')return GROUPS[i].n}return p._su.natural?'Natural':''}
  function pk(p){
    var s=p.img||'',sale=p.compareAt&&p.compareAt>p.price,tab=tabFor(p);
    return '<article class="pk">'+(tab?'<span class="tab">'+esc(tab)+'</span>':'')+
      '<a class="well" href="#" aria-label="'+esc(p.title)+'">'+(s?'<img src="'+esc(s)+'" alt="" loading="lazy" data-su-img>':'<span class="su-noimg" aria-hidden="true"></span>')+'</a>'+
      '<div class="body"><span class="brand">'+esc(p.brand)+'</span><a class="name" href="#">'+esc(p.title)+'</a>'+rev(p)+
      '<div class="price"><span class="now">'+money(p.price)+'</span>'+(sale?'<span class="was">'+money(p.compareAt)+'</span><span class="save">Save '+Math.round((1-p.price/p.compareAt)*100)+'%</span>':'')+'</div>'+
      '<button class="btn" type="button" data-add="'+esc(p.handle)+'">Add to basket</button></div></article>';
  }
  /* blocked or missing photos fall back to the flat placeholder */
  document.addEventListener('error',function(e){
    var t=e.target;
    if(t&&t.tagName==='IMG'&&t.hasAttribute('data-su-img')){var s=document.createElement('span');s.className='su-noimg';s.setAttribute('aria-hidden','true');t.parentNode.replaceChild(s,t)}
  },true);
  /* preview basket: bump the header count and confirm on the button */
  var inBasket=0;
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.su [data-add]');if(!b)return;
    inBasket++;$$('.cnt[data-count]').forEach(function(c){c.textContent=inBasket;c.setAttribute('data-n',inBasket)});
    b.classList.add('is-added');b.textContent='Added';
    setTimeout(function(){b.classList.remove('is-added');b.textContent='Add to basket'},1800);
  });

  /* ---------- counts anywhere on the page ---------- */
  $$('[data-su-count]').forEach(function(el){
    var k=el.getAttribute('data-su-count');
    el.textContent=k==='brands'?Object.keys(BRANDS).length:inG(k).length;
  });

  /* ---------- A: chips + grid ---------- */
  var chipsBox=$('[data-su-chips]');
  if(chipsBox){
    var gridA=$('[data-su-grid]'),moreA=$('[data-su-more]'),statusA=$('[data-su-status]'),cur='all',shown=8,STEP=8;
    chipsBox.innerHTML=[{k:'all',n:'All'}].concat(GROUPS).map(function(g){
      return '<button class="su-chip" type="button" data-k="'+g.k+'" aria-pressed="'+(g.k==='all')+'">'+esc(g.n)+' <span>'+inG(g.k).length+'</span></button>';
    }).join('');
    function drawA(){
      var list=inG(cur);
      gridA.innerHTML=list.slice(0,shown).map(pk).join('');
      var g=GROUPS.filter(function(x){return x.k===cur})[0];
      statusA.textContent='Showing '+Math.min(shown,list.length)+' of '+list.length+' products'+(g?' tagged '+g.n.toLowerCase():'');
      moreA.hidden=shown>=list.length;
    }
    chipsBox.addEventListener('click',function(e){
      var b=e.target.closest('.su-chip');if(!b)return;
      cur=b.getAttribute('data-k');shown=8;
      $$('.su-chip',chipsBox).forEach(function(c){c.setAttribute('aria-pressed',String(c===b))});
      drawA();
    });
    $('button',moreA).addEventListener('click',function(){shown+=STEP;drawA()});
    drawA();
  }

  /* ---------- B: facets, sort, grid ---------- */
  var facets=$('[data-su-facets]');
  if(facets){
    var gridB=$('[data-su-grid]'),moreB=$('[data-su-more]'),statusB=$('[data-su-status]'),sortSel=$('[data-su-sort]'),shownB=12;
    var sel={g:{},b:{}};
    var brandList=Object.keys(BRANDS).sort(function(a,b){return BRANDS[b]-BRANDS[a]||a.localeCompare(b)});
    $('[data-su-fg="g"]',facets).insertAdjacentHTML('beforeend',GROUPS.map(function(g,i){
      return '<label><input type="checkbox" value="'+g.k+'" data-f="g">'+esc(g.n)+'<span>'+inG(g.k).length+'</span></label>';
    }).join(''));
    $('[data-su-fg="b"]',facets).insertAdjacentHTML('beforeend',brandList.map(function(b,i){
      return '<label'+(i>=8?' data-extra hidden':'')+'><input type="checkbox" value="'+esc(b)+'" data-f="b">'+esc(b)+'<span>'+BRANDS[b]+'</span></label>';
    }).join('')+(brandList.length>8?'<button class="su-fmore" type="button" data-su-fmore aria-expanded="false">Show all '+brandList.length+' brands</button>':''));
    function listB(){
      var gk=Object.keys(sel.g),bk=Object.keys(sel.b);
      var l=ALL.filter(function(p){return (!gk.length||gk.some(function(k){return p._su[k]}))&&(!bk.length||sel.b[p.brand])});
      var s=sortSel.value;
      if(s==='low')l.sort(function(a,b){return a.price-b.price});
      else if(s==='high')l.sort(function(a,b){return b.price-a.price});
      else if(s==='rated')l.sort(function(a,b){return (b.rating||0)-(a.rating||0)||(b.reviewCount||0)-(a.reviewCount||0)});
      return l;
    }
    function drawB(){
      var l=listB();
      gridB.innerHTML=l.length?l.slice(0,shownB).map(pk).join(''):'';
      $('[data-su-empty]').hidden=!!l.length;
      statusB.textContent=l.length+' product'+(l.length===1?'':'s');
      moreB.hidden=shownB>=l.length;
      $('[data-su-more-t]',moreB).textContent='Showing '+Math.min(shownB,l.length)+' of '+l.length;
      var n=Object.keys(sel.g).length+Object.keys(sel.b).length;
      $$('[data-su-clear]').forEach(function(c){c.hidden=!n});
      var t=$('[data-su-ftoggle]');if(t)$('span',t).textContent=n?' ('+n+')':'';
    }
    facets.addEventListener('change',function(e){
      var i=e.target;if(!i.matches('input[data-f]'))return;
      var m=sel[i.getAttribute('data-f')];if(i.checked)m[i.value]=1;else delete m[i.value];
      shownB=12;drawB();
    });
    facets.addEventListener('click',function(e){
      var b=e.target.closest('[data-su-fmore]');if(!b)return;
      var open=b.getAttribute('aria-expanded')!=='true';
      $$('[data-extra]',facets).forEach(function(l){l.hidden=!open});
      b.setAttribute('aria-expanded',String(open));b.textContent=open?'Show fewer brands':'Show all '+brandList.length+' brands';
    });
    $$('[data-su-clear]').forEach(function(c){c.addEventListener('click',function(){
      sel={g:{},b:{}};$$('input[data-f]',facets).forEach(function(i){i.checked=false});shownB=12;drawB();
    })});
    sortSel.addEventListener('change',function(){shownB=12;drawB()});
    $('button',moreB).addEventListener('click',function(){shownB+=12;drawB()});
    var tg=$('[data-su-ftoggle]');
    if(tg)tg.addEventListener('click',function(){var o=!facets.classList.contains('open');facets.classList.toggle('open',o);tg.setAttribute('aria-expanded',String(o))});
    drawB();
  }

  /* ---------- C: one product rail per group (the site's .railwrap) ---------- */
  var railUps=[];
  $$('[data-su-rail]').forEach(function(box){
    var k=box.getAttribute('data-su-rail'),list=inG(k).slice(0,10);
    box.innerHTML='<div class="railwrap su-rw"><div class="rail prail" tabindex="0" aria-label="'+esc(box.getAttribute('data-label')||'Products')+'">'+list.map(pk).join('')+'</div>'+
      '<div class="scroller"><button class="sarr prev" type="button" aria-label="Scroll back" disabled><span>←</span></button><div class="track"><i></i></div><button class="sarr next" type="button" aria-label="Scroll forward"><span>→</span></button></div></div>';
    var w=$('.railwrap',box),r=$('.rail',w),pv=$('.sarr.prev',w),nx=$('.sarr.next',w),th=$('.track i',w),tr=$('.track',w);
    function up(){
      var max=r.scrollWidth-r.clientWidth,vis=r.scrollWidth?r.clientWidth/r.scrollWidth:1;
      th.style.width=Math.min(100,vis*100)+'%';
      th.style.left=(max>0?r.scrollLeft/max*(1-vis)*100:0)+'%';
      pv.disabled=r.scrollLeft<=2;nx.disabled=r.scrollLeft>=max-2;
      $('.scroller',w).style.visibility=max<=2?'hidden':'';
    }
    function by(d){r.scrollBy({left:d*r.clientWidth*.85,behavior:RM?'auto':'smooth'})}
    pv.addEventListener('click',function(){by(-1)});nx.addEventListener('click',function(){by(1)});
    tr.addEventListener('click',function(e){var b=tr.getBoundingClientRect();r.scrollTo({left:(e.clientX-b.left)/b.width*(r.scrollWidth-r.clientWidth),behavior:RM?'auto':'smooth'})});
    r.addEventListener('scroll',up,{passive:true});railUps.push(up);up();
  });
  if(railUps.length)window.addEventListener('resize',function(){railUps.forEach(function(f){f()})});

  /* ---------- A: contents list highlights the section in view ---------- */
  var toc=$('[data-su-toc]');
  if(toc&&'IntersectionObserver' in window){
    var links=$$('a',toc),map={};
    links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){links.forEach(function(a){a.classList.remove('on')});var a=map[e.target.id];if(a)a.classList.add('on')}
    })},{rootMargin:'-20% 0px -70% 0px'});
    Object.keys(map).forEach(function(id){var s=document.getElementById(id);if(s)io.observe(s)});
  }
})();
