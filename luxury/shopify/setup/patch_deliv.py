p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'; s = open(p).read()
old_a = '<div class="ztp" role="tabpanel" hidden><p>Free UK standard delivery on orders over £75.'
a = s.find(old_a); b = s.find('</div>', a) + 6
assert a > 0
NEW = r'''<div class="ztp" role="tabpanel" hidden><div class="dl7">
{%- assign tl = product.title | downcase -%}{%- assign big = false -%}{%- if tl contains 'bed' or tl contains 'cushion' or tl contains 'sofa' or tl contains 'basket' -%}{%- assign big = true -%}{%- endif -%}
<div class="dl7-now" data-dl7><span class="dl7-ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/></svg></span><div><b data-dl7-head>Order by 2pm on a working day and it leaves us the same day</b><span data-dl7-eta></span></div></div>
<div class="dl7-free">{%- if product.price >= 7500 -%}<b>This piece qualifies for free UK delivery.</b>{%- else -%}{%- assign gap = 7500 | minus: product.price -%}Add <b>{{ gap | money_without_trailing_zeros }}</b> more for free UK delivery.{%- endif -%}<span class="dl7-bar"><i style="width:{%- if product.price >= 7500 -%}100{%- else -%}{{ product.price | times: 100 | divided_by: 7500 }}{%- endif -%}%"></i></span></div>
<table class="dl7-t"><thead><tr><th>UK service</th><th>Arrives</th><th>Cost</th></tr></thead><tbody>
<tr><td>Standard, tracked</td><td>2–4 working days</td><td>£4.95 <small>Free over £75</small></td></tr>
<tr><td>Express</td><td>Next working day <small>Order by 2pm</small></td><td>£7.95</td></tr>
<tr><td>Nominated day</td><td>A working day you choose, up to 14 days ahead</td><td>£9.95</td></tr>
</tbody></table>
{%- if big -%}<p class="dl7-n"><b>Beds travel by specialist courier.</b> You get a one-hour delivery window by text on the morning of delivery, and can rearrange it from the text.</p>{%- endif -%}
<p class="dl7-n">Highlands and Islands, Northern Ireland, Scilly and the Channel Islands: allow 1–2 extra working days. We ship worldwide, and international costs and times are shown at checkout.</p>
<h4 class="dl7-h">Returns &amp; exchanges</h4>
<ul class="dl7-r">
<li><b>14 days</b><span>to change your mind, from the day after delivery</span></li>
<li><b>Free</b><span>UK returns with a prepaid label</span></li>
<li><b>Exchanges</b><span>for another size or colour, sent as soon as yours is on its way back</span></li>
<li><b>30 days</b><span>to reject a faulty item for a full refund</span></li>
</ul>
<p class="dl7-n">Return anything unworn, with its tags. Refunds go back to your original payment method within 14 days of your return reaching us.{%- if tl contains 'shampoo' or tl contains 'balm' or tl contains 'treat' or tl contains 'chew' or tl contains 'spray' -%} Grooming products and treats can only be returned unopened.{%- endif -%}</p>
<p class="dl7-l"><a href="/pages/delivery">Delivery information</a><a href="/pages/returns">Returns &amp; refunds</a><a href="/pages/contact">Ask us a question</a></p>
</div></div>'''
s = s[:a] + NEW + s[b:]
CSS = r'''
.dl7{display:grid;gap:16px}
.dl7-now{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;background:#F3F3EF;border-radius:4px}
.dl7-now b{display:block;font-weight:600;font-size:14px;line-height:1.4}
.dl7-now span[data-dl7-eta]{display:block;font-size:13.5px;color:#5c5f55;margin-top:2px}
.dl7-ic{color:#4A5233;flex:none;margin-top:1px}
.dl7-free{font-size:13.5px}
.dl7-bar{display:block;height:3px;background:#E4E4DE;margin-top:8px;border-radius:2px;overflow:hidden}.dl7-bar i{display:block;height:100%;background:#4A5233}
.dl7-t{width:100%;border-collapse:collapse;font-size:13.5px}
.dl7-t th{text-align:left;font:600 11px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#6b6e63;padding:0 8px 10px 0;border-bottom:1px solid #E4E4DE}
.dl7-t td{padding:11px 8px 11px 0;border-bottom:1px solid #EDEDE8;vertical-align:top}
.dl7-t td:last-child{white-space:nowrap}
.dl7-t small{display:block;color:#6b6e63;font-size:12px;margin-top:2px}
.dl7-n{font-size:13.5px;color:#4d5047;margin:0}
.dl7-h{font:600 11.5px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;margin:8px 0 0}
.dl7-r{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dl7-r li{border:1px solid #E4E4DE;border-radius:4px;padding:12px 14px;display:flex;flex-direction:column;gap:3px;font-size:13px;color:#4d5047}
.dl7-r li b{font:400 22px/1.1 var(--display);color:var(--ink)}
.dl7-l{display:flex;flex-wrap:wrap;gap:8px 20px;margin:0;font-size:13px}
.dl7-l a{text-decoration:underline;text-underline-offset:3px}
'''
s = s.replace('.pd-gw{margin-top:clamp(48px,6vw,96px)}', '.pd-gw{margin-top:clamp(48px,6vw,96px)}' + CSS, 1)
JS = r'''<script>
(function(){var el=document.querySelector('[data-dl7]');if(!el)return;
function uk(){var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});return o}
function addWd(d,n){d=new Date(d);while(n>0){d.setDate(d.getDate()+1);var w=d.getDay();if(w&&w<6)n--}return d}
function fmt(d){return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
function run(){var o=uk(),wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday),h=+o.hour,m=+o.minute,today=new Date(+o.year,+o.month-1,+o.day),
work=wd>0&&wd<6,before=work&&h<14,ship=before?today:addWd(today,1),
head=el.querySelector('[data-dl7-head]'),eta=el.querySelector('[data-dl7-eta]');
if(before){var left=(14*60)-(h*60+m);head.textContent='Order in the next '+(left>=60?Math.floor(left/60)+' hr '+(left%60)+' min':left+' min')+' and it leaves us today';}
else head.textContent='Order now and it leaves us '+(Math.round((ship-today)/864e5)===1?'tomorrow':'on '+ship.toLocaleDateString('en-GB',{weekday:'long'}));
eta.textContent='Standard UK delivery arrives '+fmt(addWd(ship,2))+' – '+fmt(addWd(ship,4))+'. Express arrives '+fmt(addWd(ship,1))+'.';}
run();setInterval(run,60000);})();
</script>'''
s = s.replace('<dialog class="zlb"', JS + '<dialog class="zlb"', 1)
open(p, 'w').write(s); print('ok')
