/* ==================================================================
   Dog health quiz. One script for all three versions.
   The page sets data-hq="a", "b" or "c" on the quiz root.
   Plain vanilla JS, no requests, works from a local file.
   ================================================================== */
(function(){
  'use strict';
  var root=document.querySelector('[data-hq]');
  if(!root)return;
  var V=root.getAttribute('data-hq');
  var app=root.querySelector('[data-hq-app]');
  var live=root.querySelector('.hq-live');
  var LETTERS=['A','B','C','D','E'];

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function say(t){if(!live)return;live.textContent='';setTimeout(function(){live.textContent=t},60)}
  function focusEl(sel){var el=app.querySelector(sel);if(el){el.focus({preventScroll:true});}}
  function scrollToApp(){
    var r=app.getBoundingClientRect();
    if(r.top<0||r.top>window.innerHeight*0.5){
      var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top:window.pageYOffset+r.top-16,behavior:reduce?'auto':'smooth'});
    }
  }
  function links(list){
    return '<div class="hq-links">'+list.map(function(l){return '<a href="#">'+esc(l)+' ›</a>'}).join('')+'</div>';
  }

  /* ================================================================
     A: health check-up
     Levels per area: 0 looking good, 1 keep an eye, 2 worth working on, 3 talk to your vet
     ================================================================ */
  var LEVELS=['Looking good','Keep an eye','Worth working on','Talk to your vet'];
  var AREAS={
    joints:{name:'Joints & mobility',shop:['Mobility & Joint','Rehab','Legs & paws','Back & spine'],
      adv:['Moving well. Keep walks regular rather than long weekend marathons, and keep their weight in check. That does more for joints than anything in a tub.',
           'A little stiffness after rest is often the first sign of joint wear. Shorter, more frequent walks, a supportive bed out of draughts and rugs on slippy floors all help.',
           'Avoiding stairs or jumps usually means something hurts. Ramps, non-slip matting and gentle, steady exercise help, and a joint supplement may be worth discussing with your vet.',
           'Struggling to get up or needing help is a sign of real pain. Book a vet check. There is a lot that can be done for sore joints once you know what you are dealing with.'],
      vet:'Sudden lameness, a leg they will not put down, yelping when touched or wobbly back legs are a same-day vet call.'},
    skin:{name:'Skin & coat',shop:['Skin & Allergies','Skin & coat','Eyes & ears'],
      adv:['Skin sounds comfortable. Keep up regular flea treatment and a brush through, which lets you spot lumps and sore patches early.',
           'A bit of scratching after walks is common. Wipe paws and tummy after walks through grass and check for fleas with a fine comb.',
           'Scratching most days is not normal. Check flea treatment is up to date and think about what changed: food, season, shampoo, bedding. If it is not better in a week or two, see your vet.',
           'Sore, broken or bald skin needs a vet. Itchy dogs can make a small patch much worse in a day, and allergies and infections need the right diagnosis.'],
      vet:'Red, weeping patches that spread fast, a swollen face or hives, or a painful, smelly ear need a vet today.'},
    tummy:{name:'Tummy',shop:['Internal Health','Tummy & gut'],
      adv:['Firm, regular poos are the best daily health check you have. Change food slowly, over a week or so, to keep it that way.',
           'The odd upset is normal, especially after scavenging. Keep an eye on bin raids and rich treats, and make any food change gradually.',
           'Loose stools or wind most weeks suggests the diet or gut is not quite right. A steady, simple diet and fewer extras is a good start. Talk to your vet if it carries on.',
           'Ongoing vomiting or diarrhoea, or blood, needs your vet. Dogs can dehydrate quickly, particularly puppies and older dogs.'],
      vet:'A swollen, tight belly with retching but nothing coming up is an emergency. Ring your vet straight away.'},
    teeth:{name:'Teeth',shop:['Essential Care','Mouth & teeth'],
      adv:['Teeth sound good. Daily brushing with a dog toothpaste is the gold standard, and it keeps them that way.',
           'A little yellow on the back teeth is the start of tartar. Start brushing now, a few seconds a day is enough to begin with, and use dog toothpaste only.',
           'Bad breath and brown tartar usually means gum disease has started. Brushing will not shift hard tartar, so ask your vet about a dental check at the next visit.',
           'Red gums, dropping food or chewing on one side often means mouth pain. Book a vet appointment. Dogs hide dental pain well.'],
      vet:'A swollen face or a lump under the eye can be a tooth root abscess. Call your vet today.'},
    mood:{name:'Mood',shop:['Behaviour & Mood','Behaviour & mood'],
      adv:['Settled and happy. Keep up the walks, sniffing time and play. A tired, busy brain is a calm one.',
           'Worries about fireworks or the vet are very common. Plan ahead: a safe den, the curtains closed and the TV on, and short, happy practice visits to the vet.',
           'A dog who is anxious alone or often on edge is not being naughty, they are struggling. Build up time alone in tiny steps and speak to your vet, who can refer you to a qualified behaviourist.',
           'A sudden change in behaviour, hiding or snapping, is often pain or illness. Book a vet check before assuming it is behavioural.'],
      vet:'If your dog suddenly seems confused, disorientated or collapses, ring your vet straight away.'},
    weight:{name:'Weight',shop:['Internal Health','Whole body'],
      adv:['A healthy weight is one of the best things you can give a dog. It takes pressure off joints, heart and breathing.',
           'Not quite enough exercise to burn off the day. Add a short extra walk or a game, and weigh out food rather than guessing.',
           'A little extra padding. Weigh their food, count treats as part of the daily amount and cut back slowly. Many vet practices run free weight clinics with a nurse.',
           'This is worth a vet visit. Both very thin and very overweight dogs benefit from a plan made with your vet, and unexplained weight loss always needs checking.'],
      vet:'Weight loss you cannot explain, especially with drinking more or eating less, needs a vet appointment.'}
  };
  var ORDER=['joints','skin','tummy','teeth','mood','weight'];

  var AQ=[
    {id:'age',step:'Age',q:'How old is your dog?',hint:'Age changes what is worth watching. Large and giant breeds count as senior sooner, often from around six.',
      o:[{t:'Puppy',d:'Under 1 year'},{t:'Adult',d:'1 to 7 years'},{t:'Senior',d:'7 to 10 years',s:{teeth:1}},{t:'Golden oldie',d:'Over 10 years',s:{teeth:1,joints:1}}]},
    {id:'size',step:'Size',q:'How big is your dog?',hint:'A rough guide is fine. Think of their adult weight.',
      o:[{t:'Small',d:'Under 10kg, like a Jack Russell or Shih Tzu'},{t:'Medium',d:'10 to 25kg, like a Cocker Spaniel or Staffie'},{t:'Large',d:'25 to 45kg, like a Labrador or German Shepherd'},{t:'Giant',d:'Over 45kg, like a Great Dane or Newfoundland'}]},
    {id:'breed',step:'Breed type',q:'Which of these sounds most like your dog?',hint:'Body shape brings its own weak spots. Crossbreeds can take after either side.',
      o:[{t:'Flat-faced',d:'Pug, French Bulldog, Bulldog, Boxer'},{t:'Long back, short legs',d:'Dachshund, Corgi, Basset Hound'},{t:'Working or sporting',d:'Labrador, Spaniel, Collie, Retriever'},{t:'Mixed, or none of these',d:'Crossbreeds and everyone else'}]},
    {id:'walk',step:'Exercise',q:'How much exercise does your dog get on most days?',hint:'Walks, off-lead running and proper play all count. Pottering in the garden does not.',
      o:[{t:'Under 30 minutes',d:'Short strolls, mostly',s:{weight:1}},{t:'30 minutes to an hour',d:'One or two decent walks'},{t:'1 to 2 hours',d:'Busy days out'},{t:'Over 2 hours',d:'A proper athlete'}]},
    {id:'getup',step:'Getting up',q:'How does your dog get going after a long rest?',hint:'Watch first thing in the morning, or after a nap following a walk.',
      o:[{t:'Up and off straight away',d:'No sign of stiffness'},{t:'A bit stiff for a minute',d:'Then walks it off',s:{joints:1}},{t:'Slow and stiff most mornings',d:'Takes a while to loosen up',s:{joints:2}},{t:'Struggles, or needs help',d:'Slips, or has to try more than once',s:{joints:3}}]},
    {id:'stairs',step:'Stairs & jumping',q:'What about stairs, the sofa or jumping into the car?',hint:'Dogs rarely complain. Avoiding things they used to do is often how they tell you.',
      o:[{t:'No problem at all',d:'Up and down happily'},{t:'Thinks twice sometimes',d:'A pause before jumping',s:{joints:1}},{t:'Avoids them now',d:'Waits to be lifted, or goes round',s:{joints:2}},{t:'Yelps, or has suddenly stopped',d:'A change in the last few days',s:{joints:3},urgent:'Sudden yelping or refusing stairs can be back pain, including a slipped disc (IVDD). Ring your vet today and keep your dog calm, off stairs and off furniture until then.'}]},
    {id:'itch',step:'Skin & scratching',q:'How often is your dog scratching, licking or chewing their paws?',hint:'Include rubbing their face on the carpet and scooting along the floor.',
      o:[{t:'Hardly ever',d:'A normal scratch now and then'},{t:'Now and then',d:'Usually after walks',s:{skin:1}},{t:'Most days',d:'You notice it every day',s:{skin:2}},{t:'Constantly',d:'With sore, red or bald patches',s:{skin:3}}]},
    {id:'tummy',step:'Tummy',q:'How is your dog\'s tummy, most of the time?',hint:'Poo tells you a lot. Firm, easy to pick up and the same most days is what you want.',
      o:[{t:'Firm and regular',d:'No complaints'},{t:'The odd upset',d:'Usually after eating something they should not',s:{tummy:1}},{t:'Often loose or windy',d:'Most weeks',s:{tummy:2}},{t:'Ongoing sickness or diarrhoea',d:'Lasting more than a day, or with blood',s:{tummy:3},urgent:'Vomiting or diarrhoea lasting more than a day, any blood, or a dog who seems flat with it, needs a vet today. Keep water available.'}]},
    {id:'teeth',step:'Teeth & breath',q:'Lift their lip. What do you see and smell?',hint:'Look at the big teeth at the back, not just the front ones.',
      o:[{t:'Clean teeth, normal breath',d:'White teeth and pink gums'},{t:'A little yellow at the back',d:'Breath is fine',s:{teeth:1}},{t:'Brown tartar, bad breath',d:'You notice it when they pant',s:{teeth:2}},{t:'Red gums or chewing on one side',d:'Or dropping food',s:{teeth:3}}]},
    {id:'mood',step:'Mood',q:'How would you describe your dog\'s mood lately?',hint:'Think about the last few weeks, not one bad day.',
      o:[{t:'Settled and happy',d:'Their usual self'},{t:'Worried by certain things',d:'Fireworks, the vet, the hoover',s:{mood:1}},{t:'Often anxious or on edge',d:'Or upset when left alone',s:{mood:2}},{t:'A sudden change',d:'Hiding, grumpy or snapping',s:{mood:3}}]},
    {id:'ribs',step:'Weight',q:'Run your hands along their sides. What can you feel?',hint:'Use flat hands and light pressure, then look down at them from above.',
      o:[{t:'Ribs easy to feel',d:'Under a light covering, with a waist from above'},{t:'Ribs need a firm press',d:'The waist is hard to see',s:{weight:2}},{t:'Cannot feel ribs',d:'No waist, fat over the hips',s:{weight:3}},{t:'Ribs and hips stick out',d:'You can see bones easily',s:{weight:3}}]}
  ];

  function runA(){
    var st={i:-1,ans:[],name:''};
    var steps=root.querySelector('.hq-steps');
    function dogName(){return st.name?esc(st.name):'your dog'}
    function drawSteps(){
      if(!steps)return;
      steps.innerHTML=AQ.map(function(q,k){
        var c=k<st.i||st.i>=AQ.length?'hq-done':(k===st.i?'hq-here':'');
        return '<li class="'+c+'"'+(k===st.i?' aria-current="step"':'')+'><i aria-hidden="true"></i>'+esc(q.step)+'</li>';
      }).join('');
    }
    function start(){
      st={i:-1,ans:[],name:st.name};
      drawSteps();
      app.innerHTML='<div class="hq-card hq-a-start"><div>'+
        '<span class="hq-chip">11 questions · about 2 minutes</span>'+
        '<h2 class="hq-q" tabindex="-1" style="margin-top:16px">Let\'s start with <em>who</em> we are checking</h2>'+
        '<p class="hq-hint">Answer for how your dog is on a normal day. You will get a snapshot of six areas, with what to do next for each.</p>'+
        '<form class="hq-a-form" novalidate><div class="hq-field"><label for="hq-name">Your dog\'s name (optional)</label>'+
        '<input id="hq-name" name="name" type="text" maxlength="24" autocomplete="off" placeholder="For example, Biscuit" value="'+esc(st.name)+'"></div>'+
        '<button class="btn sec" type="submit">Start the check-up ›</button></form></div>'+
        '<div><ul class="hq-a-list"><li>Joints & mobility</li><li>Skin & coat</li><li>Tummy</li><li>Teeth</li><li>Mood</li><li>Weight</li></ul>'+
        '<p class="hq-small">This is a guide, not a diagnosis. Nothing we say here replaces your vet.</p></div></div>';
      app.querySelector('form').addEventListener('submit',function(e){
        e.preventDefault();
        st.name=app.querySelector('#hq-name').value.trim().slice(0,24);
        go(0);
      });
    }
    function go(i,noFocus){
      st.i=i;drawSteps();
      if(i>=AQ.length){result();return}
      var q=AQ[i],pct=Math.round(i/AQ.length*100);
      var qt=q.q.replace('your dog',dogName());
      app.innerHTML='<div class="hq-card">'+
        '<div class="hq-top"><span class="hq-count">Question '+(i+1)+' of '+AQ.length+'</span><span class="hq-chip">'+esc(q.step)+'</span></div>'+
        '<div class="hq-bar" role="progressbar" aria-label="Check-up progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div>'+
        '<h2 class="hq-q" id="hq-qh" tabindex="-1">'+qt+'</h2><p class="hq-hint">'+esc(q.hint)+'</p>'+
        '<div class="hq-opts" role="group" aria-labelledby="hq-qh">'+q.o.map(function(o,k){
          return '<button type="button" class="hq-opt" data-k="'+k+'" aria-pressed="'+(st.ans[i]===k)+'"><span class="hq-l" aria-hidden="true">'+LETTERS[k]+'</span><span class="hq-ot"><b>'+esc(o.t)+'</b><span>'+esc(o.d)+'</span></span></button>';
        }).join('')+'</div>'+
        '<div class="hq-foot"><button type="button" class="hq-txtbtn" data-back'+(i===0?' disabled':'')+'>‹ Back</button><button type="button" class="hq-txtbtn" data-restart>Start again</button></div></div>';
      app.querySelectorAll('.hq-opt').forEach(function(b){
        b.addEventListener('click',function(){
          st.ans[i]=+b.getAttribute('data-k');
          app.querySelectorAll('.hq-opt').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
          setTimeout(function(){go(i+1)},220);
        });
      });
      app.querySelector('[data-back]').addEventListener('click',function(){if(i>0)go(i-1)});
      app.querySelector('[data-restart]').addEventListener('click',function(){start();focusEl('.hq-q')});
      if(!noFocus){scrollToApp();focusEl('.hq-q')}
    }
    function result(){
      var lv={},why={},urg=[],notes={};
      ORDER.forEach(function(a){lv[a]=0;why[a]=[];notes[a]=[]});
      AQ.forEach(function(q,k){
        var o=q.o[st.ans[k]];if(!o)return;
        if(o.s)Object.keys(o.s).forEach(function(a){
          if(o.s[a]>lv[a])lv[a]=o.s[a];
          why[a].push(o.t);
        });
        if(o.urgent)urg.push(o.urgent);
      });
      var age=st.ans[0],size=st.ans[1],breed=st.ans[2],walk=st.ans[3];
      if((size===2||size===3)&&age>=2&&lv.joints<1){lv.joints=1;why.joints.push('Large breed, senior')}
      if(breed===1)notes.joints.push('<b>Long-backed breeds</b> are prone to IVDD, a disc problem in the spine. Use ramps, discourage jumping off furniture and use a harness rather than a collar. Sudden back pain, wobbly or dragging back legs is a vet job today.');
      if(breed===2||size>=2)notes.joints.push('<b>Bigger and working breeds</b> are more likely to have hip or elbow problems. Keeping them lean is the single most useful thing you can do.');
      if(age===0)notes.joints.push('<b>Growing puppies</b> do best with short, frequent play and walks. Go easy on lots of stairs, jumping and long runs until they are fully grown, and ask your vet when that is for their breed.');
      if(breed===0){notes.skin.push('<b>Flat-faced breeds</b> need their skin folds cleaned and dried a few times a week, and their eyes checked daily. Noisy breathing, struggling in the heat or tiring quickly are worth raising with your vet.');}
      if(age===0)notes.teeth.push('<b>Puppies</b> swap 28 baby teeth for 42 adult teeth by around six or seven months. Start handling their mouth and brushing now, so it is easy for life.');
      if(size===0&&lv.teeth<3)notes.teeth.push('<b>Small dogs</b> tend to get tartar earlier because their teeth are crowded. Daily brushing matters even more.');
      if(walk===0&&age===3)notes.weight.push('<b>Older dogs</b> often walk less. Gentle, short walks more often, and adjusting food to match, keeps weight steady.');
      if(st.ans[10]===3)notes.weight.push('<b>Very thin</b> dogs can be ill, so rule that out with your vet before simply feeding more.');
      if(walk===0&&lv.mood<1){lv.mood=1;why.mood.push('Under 30 minutes of exercise')}

      var sorted=ORDER.slice().sort(function(a,b){return lv[b]-lv[a]});
      var count=[0,0,0,0];ORDER.forEach(function(a){count[lv[a]]++});
      var nm=st.name?esc(st.name)+'\'s':'Your dog\'s';
      var summary=count[3]?'A few things are worth talking to your vet about. The rest is below, area by area.':(count[2]?'Mostly doing well, with a couple of things worth working on.':(count[1]?'Looking good overall, with one or two things to keep an eye on.':'Looking good across the board. Keep doing what you are doing.'));
      var h='<div class="hq-card">'+
        '<div class="hq-snap-h"><div><span class="hq-kick">Your health snapshot</span><h2 tabindex="-1" style="margin-top:12px">'+nm+' <em>health snapshot</em></h2><p>'+summary+'</p></div>'+
        '<div class="hq-tally">'+[0,1,2,3].filter(function(n){return count[n]}).map(function(n){return '<span class="hq-lv'+n+'"><i aria-hidden="true"></i>'+count[n]+' '+LEVELS[n].toLowerCase()+'</span>'}).join('')+'</div></div>';
      if(urg.length)h+='<div class="hq-urgent" role="alert"><h3>Ring your vet today</h3><ul>'+urg.map(function(u){return '<li>'+esc(u)+'</li>'}).join('')+'</ul></div>';
      h+='<div class="hq-areas">'+sorted.map(function(a){
        var A=AREAS[a],n=lv[a];
        return '<article class="hq-area"><div class="hq-area-h"><h3>'+esc(A.name)+'</h3><span class="hq-st hq-st'+n+'">'+LEVELS[n]+'</span></div>'+
          '<div class="hq-meter" role="img" aria-label="'+esc(A.name)+': '+LEVELS[n]+'">'+[0,1,2,3].map(function(k){return '<i class="'+(k<=n?'on hq-dot'+n:'')+'"></i>'}).join('')+'</div>'+
          '<div class="hq-meter-l" aria-hidden="true"><span>Looking good</span><span>Talk to your vet</span></div>'+
          '<p>'+esc(A.adv[n])+'</p>'+
          (why[a].length?'<p class="hq-based">Based on: <b>'+why[a].map(esc).join('</b>, <b>')+'</b></p>':'')+
          notes[a].map(function(t){return '<p class="hq-note">'+t+'</p>'}).join('')+
          (n>=2?'<div class="hq-vetnote"><span><b>When it is a vet job:</b> '+esc(A.vet)+'</span></div>':'')+
          links(A.shop)+'</article>';
      }).join('')+'</div>'+
        '<div class="hq-res-foot"><p>This snapshot is a starting point, not a diagnosis. If something does not feel right, trust your instinct and speak to your vet. A yearly check-up, or six-monthly for older dogs, catches most things early.</p>'+
        '<div class="hq-actions"><button type="button" class="btn" data-print>Print snapshot</button><button type="button" class="btn sec" data-restart>Start again</button></div></div></div>';
      app.innerHTML=h;
      app.querySelector('[data-restart]').addEventListener('click',function(){start();scrollToApp();focusEl('.hq-q')});
      app.querySelector('[data-print]').addEventListener('click',function(){window.print()});
      scrollToApp();focusEl('.hq-snap-h h2');
      say('Your snapshot is ready.');
    }
    start();
  }

  /* ================================================================
     B: knowledge quiz
     ================================================================ */
  var BQ=[
    {q:'How many teeth does an adult dog have?',tag:'Teeth',o:['28','32','42','48'],a:2,
      why:'Adult dogs have 42 teeth, ten more than we do. Puppies have 28 baby teeth, which are replaced by around six or seven months old.',
      learn:['Mouth & teeth','Essential Care']},
    {q:'What is a normal body temperature for a dog?',tag:'Whole body',o:['36.5 to 37.5°C','38.3 to 39.2°C','39.5 to 40.5°C','Same as ours'],a:1,
      why:'Dogs run warmer than us, at roughly 38.3 to 39.2°C. A reading above about 39.5°C, or below 37.5°C, is worth a call to your vet. A warm ear or dry nose is not a reliable guide, a rectal thermometer is.',
      learn:['Whole body']},
    {q:'Your dog is fast asleep. Roughly how many breaths a minute is normal?',tag:'Breathing',o:['Under 30','40 to 60','60 to 80','Over 100'],a:0,
      why:'A healthy dog at rest or asleep usually breathes fewer than 30 times a minute, often much less. Count one rise and fall of the chest as one breath. A resting rate that stays above that, especially in a dog with a heart condition, is worth ringing your vet about.',
      learn:['Whole body','Internal Health']},
    {q:'True or false: a few grapes or raisins are fine as a treat.',tag:'Toxic foods',tf:true,o:['True','False'],a:1,
      why:'False. Grapes, raisins, sultanas and currants can cause sudden kidney failure in some dogs, and there is no known safe amount. Research points to tartaric acid as the likely cause. If your dog eats any, ring your vet straight away, even if they seem fine.',
      vet:'Grapes, raisins, chocolate and xylitol are all a call to your vet, straight away.',
      learn:['Internal Health','Tummy & gut']},
    {q:'How often should you ideally brush your dog\'s teeth?',tag:'Teeth',o:['Once a month','Once a week','Every day','Only when their breath smells'],a:2,
      why:'Daily brushing is the gold standard, because plaque starts hardening into tartar within a few days. Use a dog toothpaste, never human toothpaste, which can contain xylitol and fluoride.',
      learn:['Mouth & teeth','Essential Care']},
    {q:'What is a hot spot?',tag:'Skin',o:['A patch of sunburnt skin','A red, moist, sore patch of skin that spreads fast','A warm place your dog likes to lie','A sign of a high temperature'],a:1,
      why:'A hot spot, or acute moist dermatitis, is an angry, weeping patch of infected skin. It can grow in hours, often set off by an itch from fleas, allergies or an ear problem, then made worse by licking. Most need a vet to clip, clean and treat them.',
      learn:['Skin & coat','Skin & Allergies']},
    {q:'Which of these can be a sign of IVDD, a disc problem in the spine?',tag:'Back & spine',o:['Reluctance to jump or use stairs','Yelping when picked up','Wobbly or dragging back legs','All of these'],a:3,
      why:'All of these. IVDD is most common in long-backed and short-legged breeds like Dachshunds, French Bulldogs and Corgis, but any dog can get it. It can come on suddenly.',
      vet:'Sudden back pain, wobbly back legs or loss of use of the legs is an emergency. Keep your dog still and ring your vet now.',
      learn:['Back & spine','Mobility & Joint','Neurological']},
    {q:'True or false: a warm, dry nose means your dog is poorly.',tag:'Myths',tf:true,o:['True','False'],a:1,
      why:'False. Noses go warm and dry after sleep, in the sun or by the radiator. Far better clues are appetite, energy, drinking, toilet habits and whether they are behaving like themselves.',
      learn:['Whole body']},
    {q:'Xylitol, a sweetener in some sugar-free gum, sweets and peanut butters, is...',tag:'Toxic foods',o:['Harmless to dogs','Dangerous, even in small amounts','Only a problem for puppies','Good for their teeth'],a:1,
      why:'Xylitol can cause a sudden, dangerous drop in blood sugar in dogs, and liver damage. It is sometimes labelled birch sugar or E967. Check the label of any peanut butter before sharing.',
      vet:'If your dog has eaten something containing xylitol, ring your vet now. Do not wait for signs.',
      learn:['Internal Health']},
    {q:'True or false: you only need to worm your dog when you see worms.',tag:'Prevention',tf:true,o:['True','False'],a:1,
      why:'False. Most worms are never seen in poo. Regular treatment is the way to go, and how often depends on your dog\'s lifestyle. Lungworm, spread by slugs and snails, is found across the UK and not every wormer covers it, so ask your vet which product suits your dog.',
      learn:['Essential Care','Tummy & gut']},
    {q:'Which is the best sign your dog is a healthy weight?',tag:'Weight',o:['You cannot feel their ribs at all','Their ribs are easy to see','You can feel their ribs under a light covering and see a waist','The number on the scales, nothing else'],a:2,
      why:'The hands-on rib check beats the scales. You should feel ribs easily, like the back of your hand, and see a waist from above. Carrying extra weight puts strain on joints, heart and breathing, and it is very common in UK dogs.',
      learn:['Internal Health','Mobility & Joint']}
  ];
  var TIERS=[
    {min:0,t:'Keen to learn',s:'Everyone starts somewhere. Read the answers below. Every one is worth knowing.'},
    {min:5,t:'Good all-rounder',s:'You know the basics well. A few answers below are worth a second look.'},
    {min:8,t:'Sharp-eyed owner',s:'Your dog is in good hands. You clearly pay attention.'},
    {min:11,t:'Top of the class',s:'Full marks. You could teach this. Share it and see how your friends do.'}
  ];

  function runB(){
    var st={i:0,picks:[],score:0};
    var sn=root.querySelector('.hq-score-n'),dots=root.querySelector('.hq-dots'),tip=root.querySelector('.hq-tip');
    function board(){
      if(sn)sn.innerHTML=st.score+'<small>/ '+BQ.length+'</small>';
      if(dots)dots.innerHTML=BQ.map(function(q,k){
        var p=st.picks[k],c=p===undefined?(k===st.i?'hq-cur':''):(p===q.a?'hq-ok':'hq-no');
        return '<i class="'+c+'"></i>';
      }).join('');
      if(dots)dots.setAttribute('aria-label',Object.keys(st.picks).length+' of '+BQ.length+' answered, '+st.score+' right');
    }
    function show(i,noFocus){
      st.i=i;board();
      if(i>=BQ.length){result();return}
      var q=BQ[i];
      app.innerHTML='<div class="hq-card'+(q.tf?' hq-tf':'')+'">'+
        '<div class="hq-top"><span class="hq-count">Question '+(i+1)+' of '+BQ.length+'</span><span class="hq-chip">'+(q.tf?'True or false · ':'')+esc(q.tag)+'</span></div>'+
        '<div class="hq-bar" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="'+BQ.length+'" aria-valuenow="'+i+'"><i style="width:'+Math.round(i/BQ.length*100)+'%"></i></div>'+
        '<h2 class="hq-q" id="hq-qh" tabindex="-1">'+esc(q.q)+'</h2>'+
        '<div class="hq-opts" role="group" aria-labelledby="hq-qh" style="margin-top:22px">'+q.o.map(function(o,k){
          return '<button type="button" class="hq-opt" data-k="'+k+'"><span class="hq-l" aria-hidden="true">'+LETTERS[k]+'</span><span class="hq-ot"><b>'+esc(o)+'</b></span><span class="hq-mark"></span></button>';
        }).join('')+'</div><div class="hq-fbw"></div>'+
        '<div class="hq-foot"><span class="hq-count">Score so far: '+st.score+'</span><button type="button" class="hq-txtbtn" data-restart>Start again</button></div></div>';
      app.querySelectorAll('.hq-opt').forEach(function(b){b.addEventListener('click',function(){answer(+b.getAttribute('data-k'))})});
      app.querySelector('[data-restart]').addEventListener('click',restart);
      if(!noFocus){scrollToApp();focusEl('.hq-q')}
    }
    function answer(k){
      var q=BQ[st.i];if(st.picks[st.i]!==undefined)return;
      st.picks[st.i]=k;var ok=k===q.a;if(ok)st.score++;
      app.querySelectorAll('.hq-opt').forEach(function(b,j){
        b.disabled=true;
        if(j===q.a){b.classList.add('hq-right');b.querySelector('.hq-mark').textContent='Right answer'}
        else if(j===k){b.classList.add('hq-wrong');b.querySelector('.hq-mark').textContent='Your answer'}
      });
      var last=st.i===BQ.length-1;
      app.querySelector('.hq-fbw').innerHTML='<div class="hq-fb'+(ok?'':' hq-fb-no')+'"><h3 tabindex="-1">'+(ok?'Right. ':'Not quite. ')+'The answer is '+esc(q.o[q.a])+'.</h3>'+
        '<p>'+esc(q.why)+'</p>'+(q.vet?'<div class="hq-vetnote"><span><b>Vet job:</b> '+esc(q.vet)+'</span></div>':'')+
        '<p class="hq-small" style="margin-top:12px">Learn more:</p>'+links(q.learn)+
        '<div class="hq-fb-row"><button type="button" class="btn sec" data-next>'+(last?'See my score ›':'Next question ›')+'</button></div></div>';
      app.querySelector('.hq-foot .hq-count').textContent='Score so far: '+st.score;
      app.querySelector('[data-next]').addEventListener('click',function(){show(st.i+1)});
      if(tip)tip.innerHTML='<b>'+(ok?'Nice one':'Worth knowing')+'</b>'+esc(q.why.split('. ')[0].replace(/\.$/,''))+'.';
      board();
      focusEl('.hq-fb h3');
    }
    function tier(){var t=TIERS[0];TIERS.forEach(function(x){if(st.score>=x.min)t=x});return t}
    function result(){
      var t=tier(),n=BQ.length;
      var shareText='I scored '+st.score+' out of '+n+' on the Poorly Pet dog health quiz: '+t.t+'. How well do you know your dog\'s health?';
      app.innerHTML='<div class="hq-card"><div class="hq-share">'+
        '<div class="hq-sc" role="img" aria-label="Result card: '+st.score+' out of '+n+', '+esc(t.t)+'">'+
          '<span class="hq-sc-wm">poorlypet</span>'+
          '<div><span class="hq-sc-k">Dog health quiz</span><div class="hq-sc-n">'+st.score+'<small>/'+n+'</small></div><div class="hq-sc-t">'+esc(t.t)+'</div><p class="hq-sc-s">How well do you know your dog\'s health?</p></div>'+
          '<span class="hq-sc-u">poorly-pet.com</span></div>'+
        '<div class="hq-share-r"><span class="hq-kick">Your result</span><h2 tabindex="-1" style="margin-top:12px">You scored <em>'+st.score+' out of '+n+'</em></h2><p>'+esc(t.s)+'</p>'+
          '<div class="hq-actions"><button type="button" class="btn" data-copy>Copy my score</button><button type="button" class="btn sec" data-restart>Try again</button></div>'+
          '<p class="hq-copied" aria-live="polite"></p>'+
          '<p class="hq-small">Knowing the facts helps you spot problems early. It does not replace your vet. If you are worried about your dog, ring them.</p></div></div>'+
        '<div class="hq-review"><h3>Your answers</h3>'+BQ.map(function(q,k){
          var ok=st.picks[k]===q.a;
          return '<details class="hq-rv"><summary><span class="hq-rvm '+(ok?'hq-ok':'hq-no')+'" aria-hidden="true">'+(k+1)+'</span><span>'+esc(q.q)+'<span class="hq-live">'+(ok?' You got this right.':' You got this wrong.')+'</span></span></summary>'+
            '<div class="hq-rv-b"><p class="hq-you">You said: <b>'+esc(q.o[st.picks[k]])+'</b>'+(ok?'':'. The answer: <b>'+esc(q.o[q.a])+'</b>')+'</p><p>'+esc(q.why)+'</p>'+links(q.learn)+'</div></details>';
        }).join('')+'</div></div>';
      app.querySelector('[data-restart]').addEventListener('click',restart);
      app.querySelector('[data-copy]').addEventListener('click',function(){
        var out=app.querySelector('.hq-copied');
        function done(){out.textContent='Copied. Paste it wherever you like.'}
        function fallback(){
          var ta=document.createElement('textarea');ta.value=shareText;ta.setAttribute('readonly','');ta.style.position='absolute';ta.style.left='-9999px';
          document.body.appendChild(ta);ta.select();
          try{document.execCommand('copy');done()}catch(e){out.textContent=shareText}
          document.body.removeChild(ta);
        }
        if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(shareText).then(done,fallback)}else fallback();
      });
      if(tip)tip.innerHTML='<b>All done</b>Open any answer below to read it again.';
      scrollToApp();focusEl('.hq-share-r h2');
      say('Quiz finished. You scored '+st.score+' out of '+n+'.');
    }
    function restart(){st={i:0,picks:[],score:0};if(tip)tip.innerHTML='<b>Did you know?</b>Most of what a vet checks first, you can check at home: gums, breathing, temperature and weight.';show(0)}
    show(0,true);
  }

  /* ================================================================
     C: spot the sign. Calls: 0 fine, 1 keep an eye, 2 call the vet today
     ================================================================ */
  var CALLS=['Fine','Keep an eye','Call the vet today'];
  var CALLDESC=['Normal dog behaviour. Nothing to do.','Watch for a day or two, make small changes, book in if it carries on.','Ring your vet today for advice or an appointment. Some are ring now.'];
  var CS=[
    {dog:'Pip, 3, Jack Russell',ph:'Terrier sniffing in long grass',t:2,q:'A few sneezes after a sniff',s:'Pip sneezes three or four times after nosing through long grass. A minute later she is fine, sniffing on and eating her tea as normal.',a:0,
      why:'A few sneezes after a good sniff is a dog clearing their nose.',todo:'If sneezing keeps going, comes with pawing at the nose or a nosebleed, or starts suddenly and violently after a walk, think grass seed and call your vet.',sign:'Brief sneezing after sniffing',area:['Eyes & ears']},
    {dog:'Duke, 6, Great Dane',ph:'Large dog standing, belly swollen',t:4,q:'Retching after dinner',s:'An hour after his dinner, Duke is pacing, trying to be sick but nothing comes up, and his belly looks tight and swollen.',a:2,now:true,
      why:'This is the classic picture of bloat (GDV), where the stomach fills with gas and can twist. It is most common in large, deep-chested breeds and can kill within hours.',todo:'Ring your vet or the nearest out-of-hours vet now and set off. Do not wait to see if it settles.',sign:'Retching with nothing coming up, swollen belly',area:['Tummy & gut','Internal Health']},
    {dog:'Rosie, 10, Labrador',ph:'Older Labrador getting out of a bed',t:1,q:'Stiff in the mornings',s:'Rosie is a bit stiff for the first few minutes after getting out of bed. Once she has walked around the garden she moves normally and enjoys her walk.',a:1,
      why:'Stiffness after rest that eases with movement is a very common early sign of arthritis in older dogs.',todo:'Mention it at her next check-up. Meanwhile: a supportive bed, rugs on slippy floors, steady daily walks and keeping her lean. Book sooner if she starts limping or avoiding stairs.',sign:'Stiffness after rest that eases',area:['Legs & paws','Mobility & Joint']},
    {dog:'Ted, 4, Cockapoo',ph:'Dog next to a dropped snack bag',t:2,q:'Ate some raisins',s:'Twenty minutes ago Ted got into a bag of raisins dropped on the floor. You think he ate a small handful. He seems completely fine.',a:2,now:true,
      why:'Raisins and grapes can cause sudden kidney failure in some dogs and there is no known safe amount. Seeming fine means nothing yet.',todo:'Ring your vet now. If they act quickly they can often make him sick to get the raisins out before harm is done.',sign:'Ate grapes, raisins, chocolate or xylitol',area:['Internal Health']},
    {dog:'Bramble, 5, Springer Spaniel',ph:'Spaniel tilting its head',t:3,q:'Sudden head shaking',s:'Straight after a walk through summer meadows, Bramble starts shaking her head hard, holding it tilted to one side and pawing at one ear.',a:2,
      why:'Sudden head shaking after long grass, especially in summer, is very often a grass seed in the ear. The seed can work its way down and damage the eardrum.',todo:'Call your vet today. Do not try to dig it out yourself. From June to September, check ears, paws and armpits after every walk.',sign:'Sudden head shaking or tilt after long grass',area:['Eyes & ears','Paws & Limbs']},
    {dog:'Milo, 2, Labrador',ph:'Young dog asleep on a rug',t:4,q:'Twitching in his sleep',s:'Milo is fast asleep, paws paddling and giving little muffled woofs. When you say his name he wakes, wags and is his normal self straight away.',a:0,
      why:'That is dreaming. Dogs have the same dream sleep we do, and twitching, paddling and soft woofs are normal.',todo:'A seizure is different: the dog cannot be woken, may go stiff, drool or wet themselves, and is often confused afterwards. That is a call to your vet.',sign:'Twitching and woofing in sleep, wakes easily',area:['Behaviour & mood','Neurological']},
    {dog:'Nala, 7, Staffie',ph:'Dog lying in the shade on a warm day',t:3,q:'Heavy panting on a hot day',s:'On a warm afternoon, Nala has come back from a walk panting hard and drooling. She is wobbly on her feet and does not want to settle in the shade.',a:2,now:true,
      why:'This could be heatstroke, which can be fatal. Dogs cannot sweat like we do and overheat fast, especially flat-faced and overweight dogs.',todo:'Move her somewhere cool, offer small sips of water, pour cool (not ice cold) water over her and ring your vet now. On warm days, walk early or late.',sign:'Heavy panting, drooling, wobbly in the heat',area:['Whole body']},
    {dog:'Biscuit, 3, Beagle',ph:'Beagle next to a food bowl',t:2,q:'One soft poo',s:'Biscuit had one soft poo this morning after a new chew yesterday. He is bright, eating, drinking and wants his walk.',a:1,
      why:'A one-off soft poo in a bright dog is usually something they ate, and settles on its own.',todo:'Stick to his usual food and skip the new chew. Call your vet if it carries on past a day, has blood in it, comes with vomiting or he goes quiet. Puppies and older dogs need checking sooner.',sign:'One soft poo in a bright, eating dog',area:['Tummy & gut']},
    {dog:'Maggie, 11, Border Terrier',ph:'Older dog at a water bowl',t:1,q:'Drinking a lot more',s:'Over the last couple of weeks Maggie has been emptying her water bowl much faster than usual and asking to go out for wees more often. It has not been hot.',a:2,
      why:'A clear rise in thirst and weeing in an older dog can be a sign of kidney disease, diabetes or a hormone problem. None are emergencies today, but all are much easier to manage when caught early.',todo:'Call your vet today to book a check. They may ask you to bring a fresh wee sample. Measure how much she drinks in 24 hours if you can.',sign:'Drinking and weeing more than usual',area:['Whole body','Internal Health']},
    {dog:'Frank, 5, Dachshund',ph:'Dachshund standing with a hunched back',t:4,q:'Wobbly back legs',s:'Frank was fine last night. This morning his back legs are wobbly, he is scuffing a back paw and he cried when you picked him up.',a:2,now:true,
      why:'This sounds like a disc problem in his spine (IVDD), common in Dachshunds. Pressure on the spinal cord can get worse quickly, and early treatment makes a real difference.',todo:'Keep him as still as you can, carry him rather than let him walk, and ring your vet now.',sign:'Sudden wobbly back legs, crying when lifted',area:['Back & spine','Neurological']},
    {dog:'Poppy, 6, Shih Tzu',ph:'Close-up of a small dog\'s teeth',t:3,q:'Bad breath and tartar',s:'Poppy\'s breath has become quite smelly and you can see brown tartar on her back teeth. She is eating her dinner and crunching her biscuits as normal.',a:1,
      why:'Bad breath and tartar mean gum disease has started, which is very common in small dogs. It is not urgent, but it will not get better on its own.',todo:'Ask for a dental check at her next vet visit and start daily brushing with dog toothpaste. Book sooner if she drops food, chews on one side or her face swells.',sign:'Bad breath and tartar, still eating well',area:['Mouth & teeth','Essential Care']},
    {dog:'Hector, 4, Greyhound',ph:'Dog grazing on a lawn',t:1,q:'Eating some grass',s:'Hector nibbles some grass on his walk, as he often does, then carries on as normal. He is eating his meals and his poos are normal.',a:0,
      why:'Lots of healthy dogs eat grass now and then. Most of the time it means nothing.',todo:'Keep them off grass that may have been sprayed. If grass eating suddenly becomes frantic, or comes with repeated vomiting, not eating or tummy pain, call your vet.',sign:'Nibbling grass, otherwise normal',area:['Tummy & gut']}
  ];

  function runC(){
    var st={i:0,picks:[]};
    var trail=root.querySelector('.hq-trail');
    function grade(k,q){return k===q.a?'ok':(k>q.a?'safe':'no')}
    function drawTrail(){
      if(!trail)return;
      trail.innerHTML=CS.map(function(q,k){
        var p=st.picks[k];
        return '<i class="'+(p===undefined?(k===st.i?'hq-cur':''):'hq-'+grade(p,q))+'"></i>';
      }).join('');
      var done=st.picks.filter(function(x){return x!==undefined}).length;
      trail.setAttribute('aria-label',done+' of '+CS.length+' cards done');
    }
    function card(i,noFocus){
      st.i=i;drawTrail();
      if(i>=CS.length){result();return}
      var q=CS[i];
      app.innerHTML='<div class="hq-scn">'+
        '<span class="hq-ph hq-t'+q.t+'" data-photo="scenario" data-label="Photo: '+esc(q.ph)+'" aria-hidden="true"></span>'+
        '<div class="hq-scn-b"><div class="hq-top" style="margin:0"><span class="hq-count">Card '+(i+1)+' of '+CS.length+'</span><span class="hq-chip">'+esc(q.dog)+'</span></div>'+
        '<h2 class="hq-q" id="hq-qh" tabindex="-1">'+esc(q.q)+'</h2><p>'+esc(q.s)+'</p>'+
        '<p class="hq-count" id="hq-ask" style="color:var(--teal)">What would you do?</p>'+
        '<div class="hq-calls" role="group" aria-labelledby="hq-ask">'+CALLS.map(function(c,k){
          return '<button type="button" class="hq-call" data-k="'+k+'"><span class="hq-ico hq-ico'+k+'" aria-hidden="true"></span>'+c+'</button>';
        }).join('')+'</div><div class="hq-vw"></div>'+
        '<div class="hq-foot" style="margin-top:4px"><span></span><button type="button" class="hq-txtbtn" data-restart>Start again</button></div></div></div>';
      app.querySelectorAll('.hq-call').forEach(function(b){b.addEventListener('click',function(){pick(+b.getAttribute('data-k'))})});
      app.querySelector('[data-restart]').addEventListener('click',restart);
      if(!noFocus){scrollToApp();focusEl('.hq-q')}
    }
    function pick(k){
      var q=CS[st.i];if(st.picks[st.i]!==undefined)return;
      st.picks[st.i]=k;var g=grade(k,q);
      app.querySelectorAll('.hq-call').forEach(function(b,j){
        b.disabled=true;
        if(j===k)b.classList.add('hq-pick');
        if(j===q.a){b.classList.add('hq-ans');b.insertAdjacentHTML('beforeend','<span class="hq-tag">'+(j===k?'Your call, right':'The right call')+'</span>')}
        else if(j===k)b.insertAdjacentHTML('beforeend','<span class="hq-tag">Your call</span>');
      });
      var head=g==='ok'?'Good call.':(g==='safe'?'A safe call.':'Not this time.');
      var extra=g==='safe'?' Being cautious is never wrong, and your vet would rather hear from you.':'';
      var last=st.i===CS.length-1;
      app.querySelector('.hq-vw').innerHTML='<div class="hq-verdict'+(g==='no'?' hq-v-no':'')+'"><h3 tabindex="-1">'+head+' The call: '+CALLS[q.a]+(q.now?' <span class="hq-now">Ring now</span>':'')+'</h3>'+
        '<p>'+esc(q.why)+extra+'</p><p class="hq-todo"><b>What to do:</b> '+esc(q.todo)+'</p>'+links(q.area)+
        '<div class="hq-fb-row" style="margin-top:4px"><button type="button" class="btn sec" data-next>'+(last?'See my results ›':'Next card ›')+'</button></div></div>';
      app.querySelector('[data-next]').addEventListener('click',function(){card(st.i+1)});
      drawTrail();
      focusEl('.hq-verdict h3');
    }
    function result(){
      var right=0,safe=0,miss=0;
      CS.forEach(function(q,k){var g=grade(st.picks[k],q);if(g==='ok')right++;else if(g==='safe')safe++;else miss++});
      var msg=miss===0?'You did not miss a single sign that needed a vet. That is the part that matters most.':(miss===1?'You missed one sign that needed a vet. Have a look at the red column below.':'You missed '+miss+' signs that needed a vet. The red column below is the one to remember.');
      var h='<div class="hq-c-res-h"><div><span class="hq-kick hq-on-teal" style="color:#fff">Your results</span><h2 tabindex="-1" style="margin-top:12px">You made <em>'+right+' of '+CS.length+'</em> calls right</h2><p>'+msg+' Keep this as a cheat sheet.</p></div>'+
        '<div class="hq-c-stats"><div><b>'+right+'</b><span>right calls</span></div><div><b>'+safe+'</b><span>safe calls</span></div><div><b>'+miss+'</b><span>missed</span></div></div></div>'+
        '<div class="hq-cheat">'+[2,1,0].map(function(c){
          return '<section class="hq-col" aria-labelledby="hq-col'+c+'"><div class="hq-col-h"><span class="hq-ico hq-ico'+c+'" aria-hidden="true"></span><div><h3 id="hq-col'+c+'">'+CALLS[c]+'</h3><p>'+CALLDESC[c]+'</p></div></div>'+
            CS.filter(function(q){return q.a===c}).map(function(q){
              var k=CS.indexOf(q),g=grade(st.picks[k],q);
              var yl=g==='ok'?'You got this right':(g==='safe'?'You were extra cautious':'You said '+CALLS[st.picks[k]].toLowerCase());
              return '<div class="hq-sign"><b>'+esc(q.sign)+(q.now?' <span class="hq-now">Ring now</span>':'')+'</b><span>'+esc(q.why)+'</span><span class="hq-yours hq-'+g+'"><i aria-hidden="true"></i>'+yl+'</span>'+links(q.area)+'</div>';
            }).join('')+'</section>';
        }).join('')+'</div>'+
        '<div class="hq-res-foot"><p>If in doubt, ring. Your vet would always rather hear from you early. Out of hours, your vet\'s phone line will tell you where their emergency cover is.</p><div class="hq-actions"><button type="button" class="btn sec" data-restart>Start again</button></div></div>';
      app.innerHTML=h;
      app.querySelector('[data-restart]').addEventListener('click',restart);
      scrollToApp();focusEl('.hq-c-res-h h2');
      say('All cards done. You made '+right+' of '+CS.length+' calls right.');
    }
    function restart(){st={i:0,picks:[]};card(0)}
    card(0,true);
  }

  if(V==='a')runA();else if(V==='b')runB();else if(V==='c')runC();
})();
