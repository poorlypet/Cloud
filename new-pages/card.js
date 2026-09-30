/* PPCard: renders the one site product card. Requires products.js; uses offers.js if loaded.
   PPCard.html(p, {tab:'Category name'}) returns the <article class="pk"> markup.
   Rows: badge(s) / image / brand / name / rating or "No reviews yet" / one info line (offer, else "helps") / price / button. */
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function money(n){return '£'+Number(n).toFixed(2)}
  function stars(r){var f=Math.round(r*2)/2,s='';for(var i=1;i<=5;i++)s+=(f>=i?'★':(f>=i-.5?'★':'☆'));return s}
  function html(p,o){
    o=o||{};
    var O=window.PPOffers, badge=O&&O.badge(p), lines=O?O.lines(p):[];
    var tabs='<div class="tabs">'+(badge?'<span class="tab sale">'+esc(badge)+'</span>':'')+(o.tab&&!badge?'<span class="tab">'+esc(o.tab)+'</span>':'')+'</div>';
    var img=p.img||p.cdn;
    var well='<a class="well'+(img?'':' noimg')+'" href="'+(o.href||'#')+'" tabindex="-1" aria-hidden="true">'+(img?'<img src="'+esc(img)+'" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">':'')+'</a>';
    var rev=p.reviewCount?'<span class="rev"><span class="stars" aria-hidden="true">'+stars(p.rating||0)+'</span>'+(p.rating||0).toFixed(1)+' <em>('+p.reviewCount+')</em></span>':'<span class="rev none">No reviews yet</span>';
    var line=lines.length?'<span class="line offer">'+esc(lines[0])+'</span>':'<span class="line">'+esc(o.helps||'')+'</span>';
    var price='<div class="price"><span class="now">'+money(p.price)+'</span>'+(p.compareAt&&p.compareAt>p.price?'<s class="was">'+money(p.compareAt)+'</s>':'')+'</div>';
    return '<article class="pk">'+tabs+well+'<div class="body"><span class="brand">'+esc(p.brand||'')+'</span><a class="name" href="'+(o.href||'#')+'">'+esc(p.title)+'</a>'+rev+line+price+'<button class="btn" type="button" data-add="'+esc(p.handle)+'">Add to basket</button></div></article>';
  }
  window.PPCard={html:html,stars:stars,money:money};
})();
