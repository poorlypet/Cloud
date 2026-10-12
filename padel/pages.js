/* PADEL store pages. Reads window.PG {t: type, v: version}, renders into #pg-root.
   Built from the homepage and product page blocks. Needs classic.js first. */
(()=>{
const G=window.PG,K=window.PADEL;const {M,P,card,stars,IMG,LVL,gbp,hasImg,tpLogo,STORE,PAYM}=K;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const V=G.v||1;
/* store policy, one place for every page */
const POL={free:STORE.freeOver,std:'£4.95',stdTime:'3 to 5 working days',remote:'4 to 7 working days',days:14,refund:'5 working days',hours:'Monday to Friday, 9am to 5pm'};
const ARW=K.ARW||'→';
const money=n=>'£'+n.toFixed(2);
const rk=P.filter(x=>x.c==='racket');
const byName=n=>P.find(x=>x.n===n);
const ACC=P.filter(x=>['acc','ball','bag'].includes(x.c)).sort((a,b)=>a.p-b.p);
const sv=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${p}</svg>`;
const IC={truck:sv('<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),ret:sv('<path d="M4 9h11a5 5 0 010 10H9"/><path d="M8 5L4 9l4 4"/>'),pin:sv('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),card:sv('<rect x="2.5" y="5" width="19" height="14"/><path d="M2.5 10h19"/>'),rk:sv('<ellipse cx="10" cy="9" rx="6" ry="7"/><path d="M14 14l6 7"/>'),user:sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),bag:sv('<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2"/>'),shoe:sv('<path d="M2 17h20v3H2zM2 17l2-9 5 2 3 3 8 1 2 3"/>'),tape:sv('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'),mail:sv('<rect x="2.5" y="5" width="19" height="14"/><path d="M3 6l9 7 9-7"/>'),srch:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'};

/* ---------- blocks, homepage vocabulary ---------- */
const NOTE=n=>`<span class="note">Photo: ${n}</span>`;
const PH=(n,c='')=>`<div class="pph ${c}">${NOTE(n)}</div>`;
const SH=(t,p,b,h='#')=>`<div class="sh"><div class="shl"><h2>${t}</h2>${p?`<p>${p}</p>`:''}</div>${b?`<a class="shbtn" href="${h}">${b} ${ARW}</a>`:''}</div>`;
const SEC=(inner,c='')=>`<section class="sec sx-sec ${c}"><div class="wrap">${inner}</div></section>`;
const crumbs=(...a)=>`<div class="wrap"><nav class="crumbs"><a href="./home.html">Home</a><span>/</span>${a.slice(0,-1).map(x=>`<a href="#">${x}</a><span>/</span>`).join('')}<span>${a[a.length-1]}</span></nav></div>`;
const HERO=o=>`<section class="sxh ${o.c||''}"><div class="wrap"><div class="fbox">${PH(o.n,'fill')}<div class="in"><div class="tx">${o.pre||''}${o.k?`<small>${o.k}</small>`:''}<h1>${o.t}</h1>${o.p?`<p>${o.p}</p>`:''}${o.x||''}</div>${o.cta?`<a class="btn hor" href="${o.href||'#'}">${o.cta}</a>`:''}</div></div></div></section>`;
/* black stage with one big word, the reviews page treatment */
const STAGE=(w,cap,c='')=>`<section class="stage ${c}"><div class="wrap"><h1 class="bw" style="--n:${Math.max(...w.split('|').map(s=>s.length))}">${w.split('|').map(s=>`<span>${s}</span>`).join('')}</h1>${cap?`<div class="scap">${cap}</div>`:''}</div></section>`;
const TITLE=(k,t,p,x='')=>`<section class="sxtitle"><div class="wrap">${k?`<small>${k}</small>`:''}<h1>${t}</h1>${p?`<p>${p}</p>`:''}${x}</div></section>`;
const BARS=l=>`<div class="three sx3" style="grid-template-columns:repeat(${l.length},minmax(0,1fr))">${l.map(t=>`<a href="#">${t}${ARW}</a>`).join('')}</div>`;
const TILES=(l,c='c3')=>`<div class="ctiles ${c} sxt">${l.map(([t,n,s])=>`<a class="ct ca" href="#">${NOTE(n)}<span class="cap"><b>${t}</b>${s?`<span>${s}</span>`:''}</span><span class="arw">${ARW}</span></a>`).join('')}</div>`;
const PT=(c,k,t,l,n,p)=>`<a class="pt ${c}" href="#">${NOTE(n)}<small>${k}</small><h3>${t}</h3>${p?`<p class="pp">${p}</p>`:''}<span class="ul">${l}</span></a>`;
const BENTO=(a,b,c)=>`<div class="promo3">${PT('big',...a)}${PT('',...b)}${PT('',...c)}</div>`;
const GUIDES=[['Buying guide','Choosing your first racket','6 min','player choosing between rackets'],['Technique','The bandeja, step by step','4 min','player hitting a bandeja at the net'],['Beginners','Padel rules made simple','3 min','court from behind the glass'],['Kit care','Make your racket last','3 min','racket with protector tape'],['Buying guide','Round, teardrop or diamond?','5 min','three racket shapes side by side'],['Footwear','Choosing padel shoes','5 min','shoe sole on court'],['Technique','Getting the most from the glass','4 min','player playing off the back wall'],['Beginners','Your first padel lesson','4 min','coach with beginners']];
const GT=l=>`<div class="gtiles">${l.map(([t,h,m,n])=>`<a class="gt2" href="#"><span class="note">Photo: ${n}</span><span class="gtag">${t}</span><div class="gb"><h3>${h}</h3><span class="gm">${m} read ${ARW}</span></div></a>`).join('')}</div>`;
const GRID=l=>`<div class="grid">${l.map(card).join('')}</div>`;
const FAQP=(l,n)=>`<div class="faqp"><div>${FAQ(l)}</div>${PH(n,'fp')}</div>`;
const FAQ=l=>`<div class="sxfaq">${l.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
const KL='<img class="klb" src="media/klarna-badge.png" alt="Klarna">';
const SRCH=(ph,id='')=>`<form class="sxs" onsubmit="event.preventDefault()">${IC.srch}<input ${id?`id="${id}"`:''} placeholder="${ph}" aria-label="${ph}"><button class="btn hor">Search</button></form>`;
const STILL=()=>SEC(`<div class="still"><div><h2>Still need help?</h2><p>Our team is here ${POL.hours}. We usually reply within one working day.</p></div><a class="btn" href="#">Contact us</a></div>`);
const HELP=()=>SEC(`<div class="sxhelp">${PH('our customer team at their desks','hp')}<div><h2>Still need a hand?</h2><p>Our team are players too. We are here ${POL.hours} and usually reply within one working day.</p><div class="ia"><a class="btn" href="#">Contact us</a><a class="ul" href="#">Visit the help centre</a></div></div></div>`);

/* ---------- questions, one source for every page ---------- */
const FQ=[
 ['Orders','bag','order confirmation on a phone',[
  ['Can I change or cancel my order?','Contact us as soon as you can. If your order has not been packed yet we can change or cancel it for you.'],
  ['I have not had my confirmation email','Check your junk folder first. If it is not there, contact us with the email address you used and we will resend it.'],
  ['Do I need an account to order?','No. You can check out as a guest and still track your order. An account lets you see past orders and save your addresses.'],
  ['Can I add something to an order I have placed?','We cannot add items once an order is placed. Place a second order and contact us, and if both are going to the same address we will try to send them together.'],
  ['Is everything on the website in stock?','If you can add it to your bag, it is in stock and ready to send. Sold out sizes and products are clearly marked.'],
  ['Do your prices include VAT?','Yes. Every price on the website includes VAT.']]],
 ['Delivery','truck','courier van on a street',[
  ['How much is delivery?',`Standard UK delivery is free on orders over £${POL.free}. Below that it is ${POL.std}.`],
  ['How long will my order take?',`Most UK addresses get their order in ${POL.stdTime}. The Highlands, Islands and Northern Ireland take ${POL.remote}.`],
  ['How do I track my order?','We email you a tracking link as soon as your parcel leaves us. You can also enter your order number on our Track my order page.'],
  ['Do you deliver outside the UK?','Not at the moment. We deliver to UK addresses only.'],
  ['What if I am not in?','The courier will leave a card or message you with options to rearrange delivery or collect your parcel.'],
  ['Will my racket arrive in a box?','Yes. Every racket is checked and packed in a rigid box, never a bag.'],
  ['My parcel arrived damaged','Contact us with your order number and a photo of the parcel and item. We will put it right.']]],
 ['Returns','ret','shoes going back into their box',[
  ['How long do I have to return something?',`${POL.days} days from the day your order arrives. Items need to be unused and in their original packaging.`],
  ['Do I pay for returns?','Send your return with any tracked service. If something is faulty or we sent the wrong item, we cover the cost.'],
  ['When will I get my money back?',`Within ${POL.refund} of your return reaching us, back to the card or account you paid with.`],
  ['Can I exchange an item?','The quickest way is to return the item and place a new order for the one you want, so you are not waiting on an exchange.'],
  ['Can I return a racket I have played with?','We can only accept rackets that are unused, with the protective film still on the face. Not sure which racket suits you? Ask us before you order.'],
  ['What if my item is faulty?','Contact us with your order number and photos of the fault. Your statutory rights are not affected.'],
  ['I paid with Klarna. How do refunds work?','Once we process your return, Klarna updates your payment plan and refunds anything you have already paid.']]],
 ['Payment and Klarna','card','paying on a phone at checkout',[
  ['Which payment methods do you accept?','Visa, Mastercard, American Express, PayPal, Apple Pay and Klarna.'],
  ['When will I be charged?','We take payment when you place your order. With Klarna, the first of your three payments is taken when you order.'],
  ['Is it safe to pay on your website?','Payments are handled by our payment providers. We never see or store your full card details.'],
  ['Can I pay with Klarna?','Yes. Choose Klarna at checkout to split the cost into 3 interest free payments.'],
  ['Does Klarna cost anything?','Pay in 3 is interest free. Klarna explains everything, including what happens if a payment is late, before you confirm.'],
  ['Who can use Klarna?','Klarna is for UK residents over 18 and is subject to status. Klarna decides at checkout.']]],
 ['Rackets','rk','wall of rackets in store',[
  ['Which racket should I start with?','A round racket with a soft core. The sweet spot is bigger and it is far easier to control while you learn.'],
  ['Round, teardrop or diamond?','Round shapes keep the weight low for control. Diamond shapes put the weight in the head for power. Teardrop sits in between.'],
  ['How heavy should my racket be?','Most players use a racket between 355 and 375g. Lighter rackets are quicker to swing and kinder on the arm.'],
  ['Soft or hard core?','Soft cores give the ball more pace at slower swings and are comfortable on the arm. Hard cores give strong hitters more control.'],
  ['Fibreglass or carbon face?','Fibreglass is softer and more forgiving. Carbon is stiffer and more precise, and suits players who hit harder.'],
  ['What do the level tags mean?','Every racket is tagged Beginner, Intermediate or Advanced based on its shape, weight and core, so you can compare like for like.'],
  ['Does my racket come with a cover?','Some do. Check the specifications on the product page. You can add a racket cover to your bag if yours does not.'],
  ['How long will a racket last?','It depends how often you play. Protector tape on the frame and keeping it out of hot cars will help it last longer.']]],
 ['Shoes and clothing','shoe','padel shoe sole on court',[
  ['Do I need padel shoes?','Yes. Padel shoes have a herringbone or omni sole that grips artificial grass. Running shoes slide.'],
  ['How do padel shoes fit?','Most fit true to size. If you are between sizes or have wide feet, go half a size up.'],
  ['Herringbone or omni sole?','Herringbone suits most artificial grass courts. Omni soles grip better on courts with a lot of sand.'],
  ['How do I choose my clothing size?','Every clothing product page has the brand\'s own size chart. If you are between sizes, the reviews often say how it fits.']]],
 ['Accessories and care','tape','grips and protector tape',[
  ['How often should I change my overgrip?','Regular players change it every few weeks, or as soon as it starts to feel slippery.'],
  ['What is frame protector tape for?','It protects the top of the frame from scrapes on the floor and glass. Most players fit it to a new racket straight away.'],
  ['How should I store my racket?','Keep it in a cover, out of direct sun and never in a hot car. Heat can damage the core.'],
  ['Can I use tennis balls for padel?','Padel balls are slightly smaller and lower pressure than tennis balls. Use padel balls for the right bounce.']]],
 ['My account','user','signing in on a laptop',[
  ['How do I reset my password?','Choose Forgotten password on the sign in page and we will email you a link to reset it.'],
  ['How do I update my details?','Sign in and go to My account to update your name, email address and saved addresses.'],
  ['How do I stop marketing emails?','Use the unsubscribe link at the bottom of any email from us.'],
  ['How do I close my account?','Contact us from the email address on your account and we will close it for you.']]]];
const QA=(c,i)=>FQ.find(f=>f[0]===c)[3][i];

/* ---------- reviews (final) ---------- */
const RVD=[['Great advice on my first racket','Told them I had been playing for six months and asked what to buy. The racket they suggested has made a real difference.','Hannah R.',2,5,'Speed Motion 2026'],['Arrived quickly and well packed','Ordered on Monday and was playing with it by Wednesday. Came in a proper box with no marks.','Tom W.',4,5,''],['Best range I have found','Every brand I was looking for, with the specs laid out clearly so it was easy to compare.','Priya S.',8,5,'Vertex 04 Hybrid 2026'],['Easy exchange on shoes','First pair was a size small. Sending them back was simple and the new pair came within days.','Marcus L.',13,4,'Vertex 24 Shoe'],['Proper padel people','You can tell the team play. Asked about grip sizes and got a clear answer the same day.','Ellie B.',16,5,''],['Great price on last season','Picked up last season\'s AT10 in the sale. Exactly as described.','Dan P.',22,5,'AT10 Genius 18K'],['Grip is spot on','Good grip on our club courts and comfortable from the first session.','Laura M.',27,5,'Vertex 24 Shoe'],['Changed my address quickly','Needed to change my delivery address and they updated it the same morning.','Ravi K.',35,5,''],['Good racket, slow courier','Racket is brilliant. Delivery took a day longer than I hoped but the tracking kept me updated.','Sam O.',41,4,'Hack 03 Comfort'],['Perfect for my level','Moved up from a beginner racket and this gives me more power without feeling hard to control.','Chris D.',52,5,'Speed Motion 2026'],['Helpful size advice','Was not sure between two sizes. The team told me how the shoe fits and they were right.','Nina F.',64,5,''],['Overgrips in the right colour','Small order but packed just as well as my racket was. Will order again.','Joe H.',78,5,'GB 1200 Overgrip 3 Pack'],['Not for me','The racket was too head heavy for my game. The return was straightforward though.','Alex T.',95,3,'Vertex 04 Hybrid 2026'],['Quick refund','Sent a bag back unused and the refund was with me within the week.','Becky G.',120,4,''],['My whole club shops here','Recommended by our coach and now half the club buys from here.','Owen J.',150,5,''],['Lovely balance','Easy to manoeuvre at the net and still has enough for overheads.','Elena R.',190,5,'Delta Pro'],['Box was damaged','Outer box was crushed on arrival. Racket was fine and the team checked in to make sure.','Mark W.',240,2,''],['Spot on again','Third order now. Same quality every time.','Kate S.',300,5,'']];
const ago=d=>d<2?'Yesterday':d<7?`${d} days ago`:d<30?`${Math.round(d/7)} week${Math.round(d/7)>1?'s':''} ago`:d<365?`${Math.round(d/30)} month${Math.round(d/30)>1?'s':''} ago`:'Over a year ago';
const RST=n=>`<span class="rst s${n}">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</span>`;
const RC=([h,p,n,d,s,pr])=>{const x=pr&&byName(pr);return `<article class="tpc"><div class="tpt">${RST(s)}<span class="ver">Verified</span></div><h4>${h}</h4><p>${p}</p><div class="tpw2"><b>${n}</b><span>${ago(d)}</span></div>${x?`<div class="tpb"><i>${hasImg(x)?`<img src="${IMG}" alt="">`:''}</i><span>Bought <b>${x.b} ${x.n}</b></span></div>`:''}</article>`;};
const RS={sort:'new',star:'',date:'',shown:9};
function rvRender(){const g=$('#rvg');if(!g)return;let l=RVD.filter(r=>(!RS.star||r[4]===+RS.star)&&(!RS.date||r[3]<=+RS.date));
 l.sort({new:(a,b)=>a[3]-b[3],old:(a,b)=>b[3]-a[3],high:(a,b)=>b[4]-a[4]||a[3]-b[3],low:(a,b)=>a[4]-b[4]||a[3]-b[3]}[RS.sort]);
 g.innerHTML=l.length?l.slice(0,RS.shown).map(RC).join(''):`<div class="rv0"><b>No reviews match those filters.</b><button class="ul" data-rclear>Clear filters</button></div>`;
 $('#rvn').textContent=`Showing ${Math.min(RS.shown,l.length)} of ${l.length} reviews`;
 $('#rvm').innerHTML=l.length>RS.shown?`<button class="btn ol" data-rmore>Show more reviews</button>`:'';
 $$('[data-rstar]').forEach(b=>b.classList.toggle('on',b.dataset.rstar===RS.star));}
function reviews(){
 const cap=`<div class="rcap">${RST(5)}<p><b>${STORE.tpScore} out of 5</b> from ${STORE.tpCount} reviews on ${tpLogo}</p><a class="cue" href="#rvb">Read the reviews <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 4v15M6 13l6 6 6-6"/></svg></a></div>`;
 const dist=`<div class="rdist">${[[5,82],[4,12],[3,3],[2,1],[1,2]].map(([s,p])=>`<button data-rstar="${s}"><span>${s} star${s>1?'s':''}</span><i><em class="s${s}" style="width:${p}%"></em></i><b>${p}%</b></button>`).join('')}</div>`;
 const head=`<div class="rvtop"><div class="sc"><span class="tpl">${tpLogo}</span><div class="ex"><b>Excellent</b>${RST(5)}</div><p>${STORE.tpScore} out of 5 based on <a href="#">${STORE.tpCount} reviews</a></p><div class="ia"><a class="btn ol" href="#">Write a review</a><a class="btn tpg" href="#">See all on Trustpilot</a></div></div>${dist}</div>`;
 const sel=(id,l,lab)=>`<label class="sel"><select id="${id}" aria-label="${lab}">${l.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
 const fil=`<div class="rvfil">${sel('rsort',[['new','Most recent'],['old','Oldest first'],['high','Highest rated'],['low','Lowest rated']],'Sort reviews')}${sel('rstar',[['','All star ratings'],...[5,4,3,2,1].map(s=>[s,`${s} star${s>1?'s':''}`])],'Star rating')}${sel('rdate',[['','Any time'],['30','Last 30 days'],['90','Last 3 months'],['365','Last 12 months']],'Date')}<span class="rvn" id="rvn"></span></div>`;
 const stage=`<section class="stage vk stk"><video autoplay muted loop playsinline poster="media/rally.jpg" src="media/rally.mp4"></video><div class="ko"><h1 class="bw" style="--n:9">EXCELLENT</h1></div><div class="vkcap">${cap}</div><span class="vn">Video: customer clips, replace with your own</span></section>`;
 return [stage,`<div class="rvbody" id="rvb">${SEC(head+fil+`<div class="rvgrid" id="rvg"></div><div class="more1" id="rvm"></div><p class="fine">Sample reviews. The live page pulls them from Trustpilot.</p>`)}${SEC(SH('Our best rated rackets','Five stars from the players who bought them.','Shop rackets')+GRID([...rk].sort((a,b)=>((b.i*7)%5)-((a.i*7)%5)).slice(0,4)))}</div>`];}

/* ---------- klarna, three heroes, one body ---------- */
function klarna(){
 const shelf=l=>`<div class="grid kgrid">${l.map(x=>card(x).replace('</div></a>',`<div class="k3">${KL}<span>3 × <b>${money(x.p/3)}</b></span></div></div></a>`)).join('')}</div>`;
 const how=SEC(SH('How Pay in 3 works','Three payments, thirty days apart.')+TILES([['Choose Klarna at checkout','Klarna selected at checkout on a phone','Pick Pay in 3 when you pay'],['Pay a third today','first payment confirmation','The rest is split in two'],['Play while you pay','player with a new racket on court','Klarna takes the rest every 30 days']]));
 const faq=SEC(SH('Klarna questions')+FAQP(FQ[3][3].slice(3).concat([['How do I manage my payments?','In the Klarna app or on the Klarna website. You can see what is due and pay early if you want to.'],QA('Returns',6)]),'player checking the Klarna app courtside')+`<p class="kleg">18+, UK residents only. Pay in 3 is an unregulated credit agreement. Borrowing more than you can afford or paying late may negatively impact your financial status and ability to obtain credit. Subject to status. T&amp;Cs apply.</p>`,'" id="kfaq');
 return [crumbs('Help','Pay with Klarna'),HERO({c:'kh',n:'player paying on a phone at the club',pre:KL,t:'Serve now. Pay later.',p:'Split the cost of your new kit into 3 interest free payments.'}),SEC(SH('Pay in 3 on any racket','The price you see, split into three.','Shop rackets')+shelf(rk.slice(0,8))),how,faq];}

/* ---------- delivery ---------- */
function delivery(){
 const prices=`<div class="dprice">${[[`Orders over £${POL.free}`,'Free'],[`Orders under £${POL.free}`,POL.std]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b><span>Standard UK delivery, ${POL.stdTime}</span></div>`).join('')}</div><p class="dnote">Highlands, Islands and Northern Ireland take ${POL.remote}, at the same price. We deliver to UK addresses only.</p>`;
 const pack=SEC(`<div class="dsplit">${PH('racket being packed into a rigid box','sp')}<div><small>How we pack</small><h2>Every racket boxed, never bagged</h2><p>We check every racket before it leaves us and pack it in a rigid box, so it arrives exactly as it left the brand. You get a tracking link by email as soon as it is on its way.</p><a class="btn" href="#">Track my order</a></div></div>`);
 return [crumbs('Help','Delivery'),TITLE('Delivery',`Free UK delivery over £${POL.free}`,'Tracked to your door, with every racket boxed.').replace('class="sxtitle"','class="sxtitle one"'),SEC(`<div class="dck"><div><h2>When will it arrive?</h2><p>Enter your postcode for an estimated delivery date.</p></div><div><form id="ck" class="ckf"><input id="pc" placeholder="Your postcode" aria-label="Postcode" required><button class="btn hor">Check</button></form><div class="ckr" id="ckr"></div></div></div>`,'pt0'),SEC(prices),pack,SEC(SH('Delivery questions')+FAQP(FQ[1][3],'courier handing over a parcel'))];}

/* ---------- returns (final) ---------- */
function returns(){
 const form=`<div class="sxform" id="rform"><h2>Start a return</h2><p>Enter your order number and the email address you used, then choose what is going back.</p><form onsubmit="event.preventDefault();this.closest('.sxform').classList.add('done')"><label>Order number<input required placeholder="For example PAD12345"></label><label>Email address<input type="email" required placeholder="The one you used at checkout"></label><button class="btn hor">Find my order</button></form><div class="ok"><b>Order found.</b> Choose the items you want to send back and we will email your returns label.</div></div>`;
 return [crumbs('Help','Returns'),HERO({n:'returns being checked in our warehouse',k:'Returns',t:'Not right? Send it back.',p:`${POL.days} days to return anything unused. Refunds within ${POL.refund}.`,cta:'Start a return',href:'#rform'}),SEC(`<div class="sxsplit">${form}${PH('parcel being packed for return','sp')}</div>`),SEC(SH('Sending something back','It takes a few minutes, all online.')+TILES([['Start online','returns page on a laptop','Order number and email'],['Pack it up','item going back into its box','Unused, with tags and packaging'],['Send it back','parcel at a post office counter','Any tracked service']])),SEC(SH('Returns questions')+FAQP(FQ[2][3],'returned shoes being checked')),HELP()];}

/* ---------- track my order (final) ---------- */
const ORD=[byName('Speed Motion 2026'),byName('GB 1200 Overgrip 3 Pack')].filter(Boolean);
function track(){
 const steps=['Order placed','Packed','On its way','Out for delivery','Delivered'];
 const status=`<div class="ocard flat"><div class="oh"><div>${ORD.map(x=>`<i class="th">${hasImg(x)?`<img src="${IMG}" alt="">`:''}</i>`).join('')}</div><div><b>${ORD.length} items</b><span>Tracked delivery</span></div><span class="pill">On its way</span></div><div class="ob"><i style="width:50%"></i></div><div class="ol">${steps.map((s,k)=>`<span class="${k<=2?'on':''}">${s}</span>`).join('')}</div></div>`;
 return [crumbs('Help','Track my order'),`<section class="sxeta"><div class="wrap"><div class="etabox trk" id="trk"><div class="et"><div class="s0"><small>Track my order</small><h1>Where is my order?</h1><p>Enter your order number and the email address or postcode you used at checkout.</p><form class="tfx" id="tkf"><label>Order number<input required placeholder="For example PAD12345"></label><label>Email or postcode<input required placeholder="As used at checkout"></label><button class="btn hor">Track my order</button></form></div><div class="s1"><small>Order PAD12345</small><h1>Arriving Thursday</h1><p>Your parcel is with the courier and on its way.</p>${status}<div class="ia"><a class="btn hor" href="#">Track with the courier</a><button class="ul" type="button" data-tkback>Track another order</button></div></div></div>${PH('parcel being handed over at a front door','map')}</div></div></section>`,SEC(SH('Need something else?')+BARS(['Delivery information','Start a return','Contact us'])),SEC(SH('Popular right now','The rackets players are buying this week.','Shop rackets')+GRID(rk.slice(4,8)))];}

/* ---------- FAQs ---------- */
const fcat=(f,k)=>`<button class="fcat ${k?'':'on'}" data-fc="${k}">${NOTE(f[2])}<span class="cap"><b>${f[0]}</b><span>${f[3].length} questions</span></span></button>`;
const qcard=(c,i)=>`<button class="qc" data-q="${c}:${i}"><b>${FQ[c][3][i][0]}</b><span>Read answer ${ARW}</span></button>`;
const qgrid=c=>`<div class="qhd"><h2>${FQ[c][0]}</h2><span>${FQ[c][3].length} questions</span></div><div class="qgrid">${FQ[c][3].map((q,i)=>qcard(c,i)).join('')}</div>`;
const qexp=c=>`<div class="qhd"><h2>${FQ[c][0]}</h2><span>${FQ[c][3].length} questions</span></div><div class="qx">${FQ[c][3].map(([q,a])=>`<details class="qxc"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
function faqs(){
 const total=FQ.reduce((a,f)=>a+f[3].length,0);
 const drawer=`<div class="fqd" id="fqd"><div class="pn"><button class="x" data-fqx aria-label="Close"></button><div id="fqdb"></div></div></div>`;
 if(V===1)return [crumbs('Help','FAQs'),TITLE('FAQs','Questions and answers',`${total} answers about orders, delivery, returns, payment and kit.`,SRCH('Search all questions','fqq')),SEC(`<div class="fcats">${FQ.map((f,k)=>fcat(f,k)).join('')}</div>`,'pt0'),SEC(`<div id="fqa">${qgrid(0)}</div>`),STILL(),drawer];
 if(V===2)return [crumbs('Help','FAQs'),TITLE('FAQs','How can we help?',`${total} answers, sorted by topic.`,SRCH('Search all questions','fqq')),SEC(`<div class="fq2"><nav class="fside">${FQ.map((f,k)=>`<button class="fsc ${k?'':'on'}" data-fc="${k}">${IC[f[1]]}<span><b>${f[0]}</b><small>${f[3].length} questions</small></span></button>`).join('')}</nav><div id="fqa">${qexp(0)}</div></div>`,'pt0'),STILL()];
 return [crumbs('Help','FAQs'),TITLE('FAQs','Questions and answers',`${total} answers. Pick a topic or search.`,SRCH('Search all questions','fqq')),SEC(`<div id="fqr"></div><div class="fqbig">${FQ.map((f,k)=>`<div class="fb">${PH(f[2],'fbp')}<div class="fbt"><div class="fbh">${IC[f[1]]}<h3>${f[0]}</h3></div>${f[3].slice(0,3).map((q,i)=>`<button class="fbq" data-q="${k}:${i}">${q[0]}${ARW}</button>`).join('')}<button class="ul" data-fall="${k}">See all ${f[3].length} questions</button></div></div>`).join('')}</div>`,'pt0'),STILL(),drawer];}
function fqOpen(c,i){const f=FQ[c],[q,a]=f[3][i];$('#fqdb').innerHTML=`<small>${f[0]}</small><h3>${q}</h3><p>${a}</p><div class="fqhl">Was this helpful? <button class="ul" data-hf>Yes</button><button class="ul" data-hf>No</button></div><div class="fqrel"><b>More about ${f[0].toLowerCase()}</b>${f[3].map((x,j)=>j===i?'':`<button class="rq" data-q="${c}:${j}">${x[0]}</button>`).join('')}</div>`;$('#fqd').classList.add('on');}
function fqAll(c){const f=FQ[c];$('#fqdb').innerHTML=`<small>${f[3].length} questions</small><h3>${f[0]}</h3><div class="fqrel">${f[3].map((x,j)=>`<button class="rq" data-q="${c}:${j}">${x[0]}</button>`).join('')}</div>`;$('#fqd').classList.add('on');}
function fqSearch(q){q=q.trim().toLowerCase();const hits=[];FQ.forEach((f,c)=>f[3].forEach(([x,a],i)=>{if(q&&(x+' '+a).toLowerCase().includes(q))hits.push([c,i]);}));
 if(V===3){$('#fqr').innerHTML=q?`<div class="qhd"><h2>Results for “${q}”</h2><span>${hits.length} found</span></div><div class="qgrid">${hits.map(([c,i])=>qcard(c,i)).join('')||'<p>No matches. Try another word or pick a topic below.</p>'}</div>`:'';return;}
 const on=+(($('.fcat.on,.fsc.on')||{dataset:{fc:0}}).dataset.fc);
 if(!q){$('#fqa').innerHTML=V===1?qgrid(on):qexp(on);return;}
 $('#fqa').innerHTML=`<div class="qhd"><h2>Results for “${q}”</h2><span>${hits.length} found</span></div>`+(V===1?`<div class="qgrid">${hits.map(([c,i])=>qcard(c,i)).join('')}</div>`:`<div class="qx">${hits.map(([c,i])=>`<details class="qxc"><summary>${FQ[c][3][i][0]}</summary><p>${FQ[c][3][i][1]}</p></details>`).join('')}</div>`);}

/* ---------- help ---------- */
const TOP=[['pin','Track my order','Where is my parcel?'],['ret','Returns',`${POL.days} days on anything unused`],['truck','Delivery',`Free over £${POL.free}`],['card','Payment and Klarna','Ways to pay'],['rk','Choosing a racket','Find the right one'],['user','My account','Orders and details']];
function help(){
 const pop=[QA('Delivery',2),QA('Delivery',0),QA('Returns',0),QA('Rackets',0),QA('Payment and Klarna',4)];
 const act=[...TOP.slice(0,4),['mail','Contact us',POL.hours]];
 return [crumbs('Help'),SEC(`<div class="h3c"><div class="hl"><small>Help centre</small><h1>How can we help?</h1>${SRCH('Search help')}<div class="hpop"><b>Popular right now</b>${pop.map(([q])=>`<a href="#">${q}</a>`).join('')}</div></div><div class="hact">${act.map(([i,h,p],k)=>`<a class="${k?'':'dk'}" href="#">${IC[i]}<span><b>${h}</b><small>${p}</small></span>${ARW}</a>`).join('')}</div></div>`,'pt8')];}

/* ---------- about ---------- */
function about(){
 const zoom=`<section class="zm" id="zm"><div class="st" id="zst"><video autoplay muted loop playsinline poster="media/court.jpg" src="media/court.mp4"></video><div class="mask" id="zmk"><span id="zw">PADEL</span></div><div class="shade" id="zsh"></div><div class="end" id="zen"><div class="wrap"><h1>Europe's best padel brands, in one UK store</h1><div class="sstar">${RST(5)}<span><b>Excellent</b> on Trustpilot</span></div></div></div><span class="vn">Video: brand film, replace with your own</span></div></section>`;
 return [zoom,`<section class="wst sxw"><div class="wrap"><p><span>We don't make rackets.</span><span>We stock over 40 of Europe's best padel brands.</span></p></div></section>`,'<div data-m="logostrip"></div>',SEC(SH('Behind the store')+BENTO(['Our warehouse','Where every order is checked','Delivery and packing','warehouse shelves of racket boxes','Every racket is checked by hand before it is boxed and sent.'],['Our team','Players, not just staff','Contact the team','team on court after work'],['Our guides','Written by players','The padel guide','team filming a racket review'])),'<div class="rgap"></div>',M.rated()];}

/* ---------- the padel guide (final) ---------- */
function guide(){
 const lv=`<div class="lsplit glv">${[[1,'New','Light, forgiving round rackets that are easy to swing.','first lesson, coach feeding balls'],[2,'Improving','Hybrid shapes that add power without losing control.','club doubles at dusk'],[3,'Competing','Diamond shapes and firm cores for maximum power.','tournament smash at the net']].map(([l,h,p,n])=>`<a class="lp" href="#g${l}">${NOTE(n)}<small>${LVL[l]}</small><h3>${h}</h3><p>${p}</p><div class="row"><span class="btn wh">Read the guides</span></div></a>`).join('')}</div>`;
 return [crumbs('The padel guide'),TITLE('The padel guide','Start where you are','Pick your level for the guides that matter to you.'),`<section class="sec sx-sec pt0">${lv}</section>`,...[[1,'New to padel','Rules, your first racket and what to wear.',[2,0,7,5]],[2,'Playing every week','More power and better positioning.',[4,6,1,3]],[3,'Playing to win','Tactics, firmer cores and kit care.',[1,6,4,3]]].map(([l,t,p,ix])=>SEC(SH(t,p,`Shop ${LVL[l].toLowerCase()} rackets`)+GT(ix.map(i=>GUIDES[i])),`" id="g${l}`))];}

/* ---------- brands ---------- */
const BRANDS=[...new Set(['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie','Siux','Wilson','Dunlop','Drop Shot','Black Crown','Varlion','Kombat','Royal Padel',...P.map(x=>x.b)])].sort();
const bcount=b=>P.filter(x=>x.b===b).length;
const bc=b=>bcount(b)?`${bcount(b)} products`:'Coming soon';
const POPB=['Bullpadel','Nox','Head','Babolat','Adidas Padel','StarVie'];
function brands(){
 const L=[...new Set(BRANDS.map(b=>b[0]))];
 if(V===1)return [STAGE('BRANDS',`<p class="scl">Over 40 of Europe's best padel brands, in one place</p>`),SEC(`<div class="bfind"><form class="sxs" onsubmit="event.preventDefault()">${IC.srch}<input id="bq" placeholder="Find a brand" aria-label="Find a brand"></form></div><div class="bgrid">${BRANDS.map(b=>`<a href="#" data-bn="${b.toLowerCase()}"><span class="lg">Logo: ${b}</span><span class="nm"><b>${b}</b><small>${bc(b)}</small></span></a>`).join('')}</div>`)];
 if(V===2)return [crumbs('Brands'),TITLE('Brands','Shop by brand','The names players trust, from Spain\'s biggest to specialist makers.'),SEC(`<div class="bfeat2">${POPB.map((b,k)=>`<a class="${k<2?'big':''}" href="#">${NOTE(b+' campaign')}<span class="lg">Logo: ${b}</span><span class="go">Shop ${b} ${ARW}</span></a>`).join('')}</div>`,'pt0'),SEC(SH('All brands A to Z')+`<div class="bcols">${L.map(c=>`<div><h3>${c}</h3>${BRANDS.filter(b=>b[0]===c).map(b=>`<a href="#">${b}<span>${bcount(b)||''}</span></a>`).join('')}</div>`).join('')}</div>`)];
 const order=[...POPB,...BRANDS.filter(b=>!POPB.includes(b))];
 return [crumbs('Brands'),TITLE('Brands','Our brands',`${BRANDS.length} brands, from first rackets to tour models.`),SEC(`<div class="bbar2"><span>${BRANDS.length} brands</span><label class="sel"><select id="bsort" aria-label="Sort brands"><option value="pop">Most popular</option><option value="az">A to Z</option></select></label></div><div class="bcards" id="bcards">${order.map(b=>`<a class="bcd" href="#" data-bn="${b}">${PH(b+' campaign','bp')}<span class="lg">Logo: ${b}</span><div class="bt"><b>${b}</b><span>${bc(b)}</span></div><span class="sh2">Shop ${ARW}</span></a>`).join('')}</div>`,'pt0')];}

/* ---------- bag ---------- */
const CI=[['Speed Motion 2026',1],['GB 1200 Overgrip 3 Pack',2],['Padel Racket Cover',1]].map(([n,q])=>({x:byName(n),q})).filter(c=>c.x);
const EXP=`<div class="expr"><button class="xp pp" aria-label="PayPal">${PAYM&&PAYM.PayPal||'PayPal'}</button><button class="xp ap" aria-label="Apple Pay">${PAYM&&PAYM['Apple Pay']||'Apple Pay'}</button></div>`;
const IMGB=x=>hasImg(x)?`<img src="${IMG}" alt="${x.b} ${x.n}">`:`<span class="note">Photo: ${x.n}</span>`;
function cart(){
 const t=CI.reduce((a,c)=>a+c.x.p*c.q,0),free=t>=POL.free,n=CI.reduce((a,c)=>a+c.q,0),tot=t+(free||!CI.length?0:4.95);
 const opt=x=>x.l?`${LVL[x.l]}, ${x.sh}`:x.c==='shoe'?'UK 9':'One size';
 const qsel=c=>`<label class="qsel"><span>Qty</span><select data-qs="${c.x.i}" aria-label="Quantity">${[1,2,3,4,5,6,7,8,9,10].map(k=>`<option ${k===c.q?'selected':''}>${k}</option>`).join('')}</select></label>`;
 const step=c=>`<div class="qty2"><button data-cq="-1" aria-label="Less">−</button><span>${c.q}</span><button data-cq="1" aria-label="More">+</button></div>`;
 const fd=`<p class="fd2 ${free?'ok':''}">${IC.truck}<span>${free?'You have <b>free UK delivery</b>':`Spend <b>${money(POL.free-t)}</b> more for free UK delivery`}</span></p>`;
 const totals=`<div class="r"><span>Subtotal</span><b>${money(t)}</b></div><div class="r"><span>Delivery</span><b>${free?'Free':POL.std}</b></div><div class="r tot"><span>Total</span><b>${money(tot)}</b></div>`;
 const pay=`<a class="btn big co" href="#">Checkout</a>${EXP}<div class="kln">${KL}<span>Or 3 interest free payments of <b>${money(tot/3)}</b></span></div>`;
 const empty=`<div class="bempty"><h2>Your bag is empty</h2><a class="btn" href="#">Shop rackets</a></div>`;
 const recs=SEC(SH('You might also need','','Shop accessories')+`<div class="grid g4s">${ACC.slice(0,4).map(card).join('')}</div>`);
 if(V===1){const row=c=>`<div class="br1" data-ci="${c.x.i}"><a class="im" href="#">${IMGB(c.x)}</a><div class="nf"><a href="#" class="nm">${c.x.b} ${c.x.n}</a><span class="op">${opt(c.x)}</span><span class="up">${gbp(c.x.p)} each</span></div>${qsel(c)}<b class="pr">${gbp(c.x.p*c.q)}</b><button class="rmx" data-rm2 aria-label="Remove ${c.x.n}"></button></div>`;
  return [crumbs('Bag'),SEC(`<div class="bh2"><h1>Your bag <span>(${n})</span></h1><a class="ul" href="#">Continue shopping</a></div><div class="bl2"><div class="items">${CI.length?CI.map(row).join(''):empty}</div><aside class="sm2">${fd}${totals}${pay}</aside></div>`,'pt8'),recs];}
 if(V===2){const row=c=>`<div class="br2" data-ci="${c.x.i}"><a class="im" href="#">${IMGB(c.x)}</a><div class="nf"><span class="br">${c.x.b}</span><a href="#" class="nm">${c.x.n}</a><span class="op">${opt(c.x)}</span><div class="ac">${step(c)}<button class="ul" data-rm2>Remove</button></div></div><b class="pr">${gbp(c.x.p*c.q)}</b></div>`;
  return [crumbs('Bag'),SEC(`<div class="bl2 v2"><div><h1 class="bt2">Your bag</h1><div class="items">${CI.length?CI.map(row).join(''):empty}</div></div><aside class="sm2 grey"><h2>Summary</h2>${totals}${fd}${pay}<ul class="tr2"><li>${IC.ret}${POL.days} day returns on anything unused</li><li>${IC.card}Secure checkout</li></ul></aside></div>`,'pt8'),recs];}
 const row=c=>`<div class="br3" data-ci="${c.x.i}"><a class="im" href="#">${IMGB(c.x)}</a><div class="nf"><a href="#" class="nm">${c.x.n}</a><span class="op">${c.x.b}, ${opt(c.x)}</span></div>${step(c)}<b class="pr">${gbp(c.x.p*c.q)}</b><button class="rmx" data-rm2 aria-label="Remove ${c.x.n}"></button></div>`;
 return [crumbs('Bag'),SEC(`<div class="bl2 v3"><div><div class="bh3"><h1>Bag</h1><span>${n} item${n===1?'':'s'}</span></div><div class="items bx3">${CI.length?CI.map(row).join(''):empty}</div></div><aside class="sm2 line">${totals}${fd}${pay}</aside></div>`,'pt8'),recs];}

const R={reviews,klarna,delivery,returns,track,faqs,help,about,guide,brands,cart};
function zoom(){const H=$('#zm');if(!H)return;const st=$('#zst'),hh=($('.hdr')||{offsetHeight:0}).offsetHeight;st.style.top=hh+'px';st.style.height=`calc(100svh - ${hh}px)`;const W=$('#zw'),MK=$('#zmk');const f=()=>{const r=H.getBoundingClientRect(),p=Math.min(Math.max((hh-r.top)/(H.offsetHeight-st.offsetHeight),0),1);W.style.transform=`scale(${1+p*p*p*40})`;MK.style.opacity=1-Math.min(Math.max((p-.45)/.25,0),1);const on=p>.7;$('#zen').classList.toggle('on',on);$('#zsh').classList.toggle('on',on);};addEventListener('scroll',f,{passive:true});addEventListener('resize',f);f();}
function render(){const root=$('#pg-root');root.className=`pg sx pg-${G.t} v${V}`;root.innerHTML=R[G.t]().join('');
 $$('[data-m]',root).forEach(el=>{if(M[el.dataset.m])el.outerHTML=M[el.dataset.m]({...el.dataset});});
 if(G.t==='reviews')rvRender();
 if(G.t==='about')zoom();}
const wd=(d,n)=>{const x=new Date(d);let k=0;while(k<n){x.setDate(x.getDate()+1);if(x.getDay()%6)k++;}return x;};
document.addEventListener('submit',e=>{
 if(e.target.id==='tkf'){e.preventDefault();$('#trk').classList.add('on');return;}
 if(e.target.id!=='ck')return;e.preventDefault();const pc=$('#pc').value.trim().toUpperCase();const remote=/^(HS|ZE|KW1[5-7]|IV4[1-9]|PA[2-7]\d|PH4[1-4]|BT)/.test(pc);const a=wd(new Date(),remote?4:3),b=wd(new Date(),remote?7:5);const f=d=>d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});$('#ckr').innerHTML=`<b>${f(a)} to ${f(b)}</b><span>Standard UK delivery to ${pc}. Free on orders over £${POL.free}.</span>`;$('#ckr').classList.add('on');});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.qs){const c=CI.find(c=>c.x.i===+t.dataset.qs);c.q=+t.value;render();return;}
 if(t.id==='rsort'){RS.sort=t.value;rvRender();}
 if(t.id==='rstar'){RS.star=t.value;RS.shown=9;rvRender();}
 if(t.id==='rdate'){RS.date=t.value;RS.shown=9;rvRender();}
 if(t.id==='bsort'){const c=$('#bcards');const rank=b=>{const i=POPB.indexOf(b);return i<0?99:i;};[...c.children].sort((a,b)=>t.value==='az'?a.dataset.bn.localeCompare(b.dataset.bn):rank(a.dataset.bn)-rank(b.dataset.bn)||a.dataset.bn.localeCompare(b.dataset.bn)).forEach(x=>c.appendChild(x));}});
document.addEventListener('click',e=>{if(e.target.id==='fqd'){e.target.classList.remove('on');return;}const t=e.target.closest('button');if(!t)return;
 if(t.dataset.rstar){RS.star=RS.star===t.dataset.rstar?'':t.dataset.rstar;$('#rstar').value=RS.star;RS.shown=9;rvRender();return;}
 if(t.dataset.rmore!==undefined){RS.shown+=9;rvRender();return;}
 if(t.dataset.rclear!==undefined){RS.star='';RS.date='';$('#rstar').value='';$('#rdate').value='';rvRender();return;}
 if(t.dataset.fc!==undefined){$$('[data-fc]').forEach(b=>b.classList.toggle('on',b===t));const q=$('#fqq');if(q)q.value='';$('#fqa').innerHTML=V===1?qgrid(+t.dataset.fc):qexp(+t.dataset.fc);if(V===1)$('#fqa').scrollIntoView({behavior:'smooth',block:'start'});return;}
 if(t.dataset.q){const [c,i]=t.dataset.q.split(':').map(Number);fqOpen(c,i);return;}
 if(t.dataset.fall!==undefined){fqAll(+t.dataset.fall);return;}
 if(t.dataset.fqx!==undefined){$('#fqd').classList.remove('on');return;}
 if(t.dataset.hf!==undefined){t.parentElement.textContent='Thanks for letting us know.';return;}
 if(t.dataset.tkback!==undefined){$('#trk').classList.remove('on');return;}
 if(t.dataset.cq){const i=+t.closest('[data-ci]').dataset.ci,c=CI.find(c=>c.x.i===i);c.q=Math.max(1,c.q+ +t.dataset.cq);render();return;}
 if(t.dataset.rm2!==undefined){const i=+t.closest('[data-ci]').dataset.ci;CI.splice(CI.findIndex(c=>c.x.i===i),1);render();return;}
});
document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='fqq')fqSearch(t.value);
 if(t.id==='bq'){const q=t.value.trim().toLowerCase();$$('.bgrid a').forEach(a=>a.style.display=!q||a.dataset.bn.includes(q)?'':'none');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=$('#fqd');if(d)d.classList.remove('on');}});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
})();
