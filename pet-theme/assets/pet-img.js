/* Poorly Pet: cat side product photos on cards.
   Studio photos come with grey or gradient backgrounds. This evens the background out to white as each card scrolls into view,
   so every card is a clean square. The product page gallery is already handled by dd-photo-bg.js. */
(function(){
  if(!(window.PET&&window.PET.isCat))return;
  function norm(src,cb,maxW){var t=new Image;t.crossOrigin="anonymous",t.onload=function(){try{var s=Math.min(1,(maxW||1e3)/t.naturalWidth),w=Math.max(16,Math.round(t.naturalWidth*s)),h=Math.max(16,Math.round(t.naturalHeight*s)),c=document.createElement("canvas");c.width=w,c.height=h;var x=c.getContext("2d");x.drawImage(t,0,0,w,h);var L=x.getImageData(2,0,1,h).data,R=x.getImageData(w-3,0,1,h).data,bg=[],y,k,bad=0,minc=255,maxd=0;for(y=0;y<h;y++){var o=y*4;if(L[o+3]<250||R[o+3]<250)return cb(null);var dd=0,row=[];for(k=0;k<3;k++)dd=Math.max(dd,Math.abs(L[o+k]-R[o+k])),row.push((L[o+k]+R[o+k])/2),minc=Math.min(minc,row[k]);dd>12&&bad++,bg.push(row)}if(minc<200||bad>h*.04)return cb(null);var win=Math.max(3,Math.round(h/40)),sm=[],a,b,sum,n;for(y=0;y<h;y++){a=Math.max(0,y-win),b=Math.min(h-1,y+win);var r=[0,0,0];n=0;for(var j=a;j<=b;j++){for(k=0;k<3;k++)r[k]+=bg[j][k];n++}sm.push([r[0]/n,r[1]/n,r[2]/n])}var white=!0;for(y=0;y<h;y++)if(sm[y][0]<250||sm[y][1]<250||sm[y][2]<250){white=!1;break}if(white)return cb("white");var im=x.getImageData(0,0,w,h),d=im.data,i,p=0,rr,gg,bb;for(y=0;y<h;y++){rr=255/sm[y][0],gg=255/sm[y][1],bb=255/sm[y][2];for(var xx=0;xx<w;xx++)d[p]=Math.min(255,d[p]*rr),d[p+1]=Math.min(255,d[p+1]*gg),d[p+2]=Math.min(255,d[p+2]*bb),p+=4}x.putImageData(im,0,0),c.toBlob(function(bl){cb(bl?URL.createObjectURL(bl):null)},"image/jpeg",.93)}catch(e){cb(null)}},t.onerror=function(){cb(null)},t.src=src}
  var SEL=".pk .well img,.pb-gim img,.cl-cw img",seen=new WeakSet(),io=null;
  function run(img){
    if(seen.has(img))return;seen.add(img);
    var src=img.currentSrc||img.src;if(!src||src.indexOf("blob:")===0||src.indexOf("data:")===0)return;
    norm(src,function(r){if(r&&r!=="white"){img.removeAttribute("srcset");img.src=r}img.classList.add("pp-norm")},700);
  }
  function watch(root){
    [].forEach.call((root||document).querySelectorAll(SEL),function(img){
      if(seen.has(img))return;
      if(io)io.observe(img);else run(img);
    });
  }
  if("IntersectionObserver"in window)io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);run(e.target)}})},{rootMargin:"300px"});
  watch();
  if(window.MutationObserver)new MutationObserver(function(){watch()}).observe(document.documentElement,{childList:true,subtree:true});
})();
