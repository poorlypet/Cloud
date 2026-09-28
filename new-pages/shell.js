/* Preview-only header behaviour: open a mega menu on hover or click, close on Escape. */
(function(){
  var items=document.querySelectorAll('#navlist > li');
  function closeAll(){document.querySelectorAll('.mega.open').forEach(function(m){m.classList.remove('open')});document.querySelectorAll('.nv[aria-expanded="true"]').forEach(function(b){b.setAttribute('aria-expanded','false')})}
  items.forEach(function(li){
    var b=li.querySelector('button.nv'),m=li.querySelector('.mega');if(!b||!m)return;
    function open(){closeAll();m.classList.add('open');b.setAttribute('aria-expanded','true')}
    li.addEventListener('mouseenter',open);li.addEventListener('mouseleave',closeAll);
    b.addEventListener('click',function(){m.classList.contains('open')?closeAll():open()});
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll()});
  var i=0,ui=document.querySelectorAll('.util .ui');
  if(ui.length>1)setInterval(function(){ui[i].classList.remove('show');i=(i+1)%ui.length;ui[i].classList.add('show')},4000);
})();
