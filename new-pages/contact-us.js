/* ==========================================================================
   Contact us (versions A, B, C). No dependencies.

   HOW SENDING WORKS ON THE LIVE SITE
   The form is Shopify's standard contact form:
     <form action="/contact" method="post"> with hidden form_type=contact and utf8,
     fields contact[topic], contact[order_number], contact[name], contact[email], contact[body].
   Shopify emails each submission to the store contact email (hello@poorly-pet.com) and
   redirects back to the page with ?contact_posted=true, which is picked up below to show
   the success state.
   Set LIVE = true in the theme so a valid form is submitted for real. In this preview
   (LIVE = false) validation runs and the success state is shown without sending.

   PHOTO UPLOADS: Shopify's standard contact form does not accept file attachments, so the
   contact[photo] field is ignored by Shopify. To receive photos, add a form app that supports
   attachments, or ask customers to reply to our email with their photo. See report.
   ========================================================================== */
(function(){
  'use strict';
  var LIVE = false;
  var MAX_MB = 10;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var ORDER_RE = /^#?\s?\d{3,8}$/;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- copy email buttons ---------- */
  function copyText(t){
    if(navigator.clipboard && window.isSecureContext){return navigator.clipboard.writeText(t)}
    return new Promise(function(res,rej){
      var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();
      try{document.execCommand('copy')?res():rej()}catch(e){rej(e)}
      document.body.removeChild(ta);
    });
  }
  document.querySelectorAll('[data-ct-copy]').forEach(function(b){
    var l=b.querySelector('[data-ct-copy-l]'),t;
    b.setAttribute('aria-label','Copy email address');
    b.addEventListener('click',function(){
      copyText(b.getAttribute('data-ct-copy')).then(function(){
        b.classList.add('is-done');l.textContent='Copied';
      },function(){l.textContent='Press Ctrl+C'}).then(function(){
        clearTimeout(t);t=setTimeout(function(){b.classList.remove('is-done');l.textContent='Copy'},2400);
      });
    });
  });

  var form=document.querySelector('[data-ct-form]');
  if(!form)return;
  var wrap=form.closest('[data-ct-wrap]');
  var ok=wrap.querySelector('[data-ct-ok]');
  var sum=form.querySelector('[data-ct-sum]');
  var topic=form.querySelector('#ct-topic');
  var orderWrap=form.querySelector('[data-ct-order]');
  var hint=form.querySelector('[data-ct-hint]');
  var msg=form.querySelector('#ct-msg');
  var count=form.querySelector('[data-ct-count]');
  var photo=form.querySelector('#ct-photo');
  var fileBox=form.querySelector('[data-ct-file]');
  var chosen=form.querySelector('[data-ct-chosen]');
  var thumb=form.querySelector('[data-ct-thumb]');
  var fname=form.querySelector('[data-ct-fname]');
  var inc=document.querySelector('[data-ct-inc]');
  var incH=document.querySelector('[data-ct-inc-h]');

  /* ---------- topic-specific help ---------- */
  var HINTS={
    order:'Add your order number if you have it and we can check it straight away. Want to follow a parcel? <a href="track-my-order-a.html">Track my order</a>.',
    returns:'Tell us which items and why. If something arrived damaged or faulty, a photo helps us sort it quickly.',
    product:'Tell us your dog\'s age, breed and what you\'re seeing, and we\'ll suggest what might help.',
    wheelchair:'Include your dog\'s weight, breed and measurements. A side-on photo of your dog standing helps us check the fit.',
    trade:'Tell us about your organisation, the products you\'re interested in and rough quantities.',
    other:''
  };
  var INCLUDE={
    '':{h:'What to include',l:['Your order number, if it\'s about an order','What\'s happened, in a sentence or two','A photo, if something arrived damaged']},
    order:{h:'For an order or delivery',l:['Your order number (it starts with #)','The name and postcode on the order','What\'s wrong: late, missing or a change you need']},
    returns:{h:'For a return',l:['Your order number','Which items you\'d like to return','Whether they\'re unopened, or faulty or damaged','A photo if something is faulty or damaged']},
    product:{h:'For product advice',l:['Your dog\'s age, breed and weight','What you\'re seeing and for how long','Anything your vet has already said','Products you\'ve already tried']},
    wheelchair:{h:'For wheelchair sizing',l:['Your dog\'s breed and weight','The measurements the size chart asks for','Which legs need support','A side-on photo of your dog standing']},
    trade:{h:'For trade or wholesale',l:['Your organisation\'s name','The products you\'re interested in','Rough quantities and how often']},
    other:{h:'What to include',l:['What it\'s about, in a sentence or two','Your order number, if it\'s about an order']}
  };
  function topicKey(){var o=topic.options[topic.selectedIndex];return (o&&o.getAttribute('data-k'))||''}
  function onTopic(){
    var k=topicKey();
    var showOrder=(k==='order'||k==='returns');
    if(showOrder&&orderWrap.hidden){orderWrap.hidden=false}
    else if(!showOrder){orderWrap.hidden=true;var oi=orderWrap.querySelector('input');oi.value='';setErr('order','')}
    if(HINTS[k]){hint.innerHTML=HINTS[k];hint.hidden=false}else{hint.hidden=true;hint.innerHTML=''}
    if(inc){var d=INCLUDE[k]||INCLUDE[''];incH.textContent=d.h;inc.innerHTML=d.l.map(function(x){return '<li>'+x+'</li>'}).join('')}
  }
  topic.addEventListener('change',function(){onTopic();if(touched.topic)check('topic')});

  /* ---------- validation ---------- */
  var touched={};
  var FIELDS={
    topic:{el:topic,label:'Topic',test:function(){return topic.value?'':'Choose what your message is about.'}},
    order:{el:form.querySelector('#ct-order'),label:'Order number',test:function(){
      if(orderWrap.hidden)return '';var v=this.el.value.trim();
      return (!v||ORDER_RE.test(v))?'':'Order numbers look like #1234. Check your confirmation email, or leave this blank.'}},
    name:{el:form.querySelector('#ct-name'),label:'Your name',test:function(){return this.el.value.trim()?'':'Enter your name.'}},
    email:{el:form.querySelector('#ct-email'),label:'Email address',test:function(){
      var v=this.el.value.trim();if(!v)return 'Enter your email address so we can reply.';
      return EMAIL_RE.test(v)?'':'Enter an email address like name@example.com.'}},
    message:{el:msg,label:'Your message',test:function(){
      var v=msg.value.trim();if(!v)return 'Tell us how we can help.';
      return v.length<10?'Add a little more detail so we can help (at least 10 characters).':''}},
    photo:{el:photo,label:'Photo',test:function(){
      var f=photo.files&&photo.files[0];if(!f)return '';
      if(!/^image\//.test(f.type)&&!/\.(heic|heif)$/i.test(f.name))return 'Choose a photo (JPG, PNG or HEIC).';
      return f.size>MAX_MB*1024*1024?'That photo is over '+MAX_MB+'MB. Try a smaller one.':''}}
  };
  function box(k){return form.querySelector('[data-f="'+k+'"]')}
  function setErr(k,m){
    var f=FIELDS[k],b=box(k),e=form.querySelector('#'+f.el.id+'-e');
    if(e)e.textContent=m;
    if(m){f.el.setAttribute('aria-invalid','true')}else{f.el.removeAttribute('aria-invalid')}
    if(b){b.classList.toggle('has-err',!!m);b.classList.toggle('is-ok',!m&&k!=='photo'&&k!=='order'&&!!(f.el.value||'').trim())}
  }
  function check(k){var m=FIELDS[k].test();setErr(k,m);return m}
  Object.keys(FIELDS).forEach(function(k){
    var el=FIELDS[k].el;if(!el||k==='photo'||k==='topic')return;
    el.addEventListener('blur',function(){if(el.value.trim())touched[k]=true;if(touched[k])check(k)});
    el.addEventListener('input',function(){if(touched[k])check(k)});
  });
  topic.addEventListener('blur',function(){if(touched.topic)check('topic')});

  /* message counter */
  function updCount(){count.textContent=msg.value.length+' / '+msg.maxLength}
  msg.addEventListener('input',updCount);updCount();

  /* ---------- photo ---------- */
  var objUrl;
  function showFile(){
    var f=photo.files&&photo.files[0];
    if(objUrl){URL.revokeObjectURL(objUrl);objUrl=null}
    touched.photo=true;var m=check('photo');
    if(!f||m){chosen.hidden=true;fileBox.hidden=false;if(m)photo.value='';return}
    objUrl=URL.createObjectURL(f);thumb.src=objUrl;
    thumb.onerror=function(){thumb.removeAttribute('src')};
    fname.innerHTML='';fname.appendChild(document.createTextNode(f.name));
    var sm=document.createElement('small');sm.textContent=(f.size/1024/1024).toFixed(1)+'MB';fname.appendChild(sm);
    chosen.hidden=false;fileBox.hidden=true;
  }
  photo.addEventListener('change',showFile);
  chosen.querySelector('[data-ct-remove]').addEventListener('click',function(){
    photo.value='';if(objUrl){URL.revokeObjectURL(objUrl);objUrl=null}
    chosen.hidden=true;fileBox.hidden=false;setErr('photo','');photo.focus();
  });
  ['dragenter','dragover'].forEach(function(e){fileBox.addEventListener(e,function(){fileBox.classList.add('is-over')})});
  ['dragleave','drop'].forEach(function(e){fileBox.addEventListener(e,function(){fileBox.classList.remove('is-over')})});

  /* ---------- submit ---------- */
  form.addEventListener('submit',function(ev){
    var errs=[];
    Object.keys(FIELDS).forEach(function(k){touched[k]=true;var m=check(k);if(m)errs.push([k,m])});
    if(errs.length){
      ev.preventDefault();
      var ul=sum.querySelector('ul');ul.innerHTML='';
      errs.forEach(function(x){
        var li=document.createElement('li'),a=document.createElement('a');
        a.href='#'+FIELDS[x[0]].el.id;a.textContent=x[1];
        a.addEventListener('click',function(e){e.preventDefault();FIELDS[x[0]].el.focus()});
        li.appendChild(a);ul.appendChild(li);
      });
      sum.hidden=false;
      sum.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});
      sum.focus({preventScroll:true});
      return;
    }
    sum.hidden=true;
    if(LIVE)return; /* let the browser POST to /contact */
    ev.preventDefault();
    var btn=form.querySelector('[data-ct-send]');btn.disabled=true;btn.textContent='Sending';
    setTimeout(function(){showOk({
      name:FIELDS.name.el.value.trim(),email:FIELDS.email.el.value.trim(),
      topic:topic.value,order:orderWrap.hidden?'':FIELDS.order.el.value.trim()
    });btn.disabled=false;btn.textContent='Send message'},reduce?0:450);
  });

  function showOk(d){
    var first=(d.name||'').split(/\s+/)[0];
    ok.querySelector('[data-ct-okname]').textContent=first?', '+first:'';
    ok.querySelector('[data-ct-okmail]').textContent=d.email||'your email address';
    ok.querySelector('[data-ct-oktopic]').textContent=d.topic||'General enquiry';
    var orow=ok.querySelector('[data-ct-okorderrow]');
    orow.hidden=!d.order;ok.querySelector('[data-ct-okorder]').textContent=d.order?(d.order.charAt(0)==='#'?d.order:'#'+d.order):'';
    form.hidden=true;
    var h=wrap.querySelector('#ct-form-h');if(h)h.parentNode.hidden=true;
    ok.hidden=false;
    ok.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
    ok.focus({preventScroll:true});
  }
  ok.querySelector('[data-ct-again]').addEventListener('click',function(){
    form.reset();touched={};
    Object.keys(FIELDS).forEach(function(k){setErr(k,'')});
    chosen.hidden=true;fileBox.hidden=false;updCount();onTopic();
    ok.hidden=true;form.hidden=false;
    var h=wrap.querySelector('#ct-form-h');if(h)h.parentNode.hidden=false;
    topic.focus();
  });

  /* ---------- pick a topic from elsewhere (B's tiles, ?topic= links) ---------- */
  function setTopic(k,focus){
    for(var i=0;i<topic.options.length;i++){if(topic.options[i].getAttribute('data-k')===k){topic.selectedIndex=i;break}}
    onTopic();setErr('topic','');
    if(focus){
      var target=wrap;
      target.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
      var next=(k==='order'||k==='returns')?FIELDS.order.el:FIELDS.name.el;
      setTimeout(function(){next.focus({preventScroll:true})},reduce?0:400);
    }
  }
  var qs=new URLSearchParams(location.search);
  if(qs.get('topic'))setTopic(qs.get('topic'),false);
  if(qs.get('contact_posted')==='true')showOk({name:'',email:'',topic:'',order:''});

  /* version B: topic tiles open an answer panel */
  var tiles=document.querySelectorAll('[data-ct-tile]');
  tiles.forEach(function(t){
    t.addEventListener('click',function(){
      var k=t.getAttribute('data-ct-tile'),open=t.getAttribute('aria-expanded')==='true';
      tiles.forEach(function(x){x.setAttribute('aria-expanded','false')});
      document.querySelectorAll('[data-ct-ans]').forEach(function(a){a.hidden=true});
      if(!open){
        t.setAttribute('aria-expanded','true');
        var a=document.getElementById('ct-ans-'+k);a.hidden=false;
        var r=a.getBoundingClientRect();
        if(r.bottom>window.innerHeight)a.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});
      }
    });
  });
  document.querySelectorAll('[data-ct-ask]').forEach(function(b){
    b.addEventListener('click',function(){setTopic(b.getAttribute('data-ct-ask'),true)});
  });

  /* version C: "Use the contact form" focuses the topic */
  document.querySelectorAll('[data-ct-jump]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();wrap.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});
      setTimeout(function(){topic.focus({preventScroll:true})},reduce?0:400);
    });
  });

  onTopic();
})();
