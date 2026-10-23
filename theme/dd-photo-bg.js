/* Danish Design photos: blend the pale lilac studio backdrop into the page's green card */
(function(){
  if(!window.LIVE_PRODUCT||window.LIVE_PRODUCT.vendor!=="Danish Design")return;
  document.documentElement.classList.add("dd-pdp");
  var seen={};
  function sample(img){
    var src=img.currentSrc||img.src; if(!src||img.dataset.ddp)return; img.dataset.ddp="1";
    var key=src.split("?")[0]; if(key in seen){ if(seen[key])img.classList.add("ddp"); return; }
    var t=new Image(); t.crossOrigin="anonymous";
    t.onload=function(){
      try{
        var c=document.createElement("canvas"),w=24,h=24; c.width=w;c.height=h;
        var x=c.getContext("2d"); x.drawImage(t,0,0,w,h);
        var pts=[[1,1],[w-2,1],[1,h-2],[w-2,h-2],[w>>1,1],[1,h>>1],[w-2,h>>1]],ok=0;
        pts.forEach(function(p){var d=x.getImageData(p[0],p[1],1,1).data;
          if(d[0]>236&&d[1]>234&&d[2]>240&&d[2]-d[1]>=2&&d[2]-d[1]<=14)ok++;});
        seen[key]=ok>=5; if(seen[key])img.classList.add("ddp");
      }catch(e){seen[key]=false;}
    };
    t.onerror=function(){seen[key]=false;};
    t.src=src;
  }
  function scan(){document.querySelectorAll(".n2-gal img").forEach(sample);}
  var mo=new MutationObserver(function(){scan();});
  function start(){scan();mo.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

/* Colour variants: show the photo that belongs to the chosen variant (the theme event only carries the variant title). */
(function(){
  function key(u){return String(u||"").split("?")[0].split("/").pop().replace(/_\d+x\d*(?=\.)/,"").toLowerCase()}
  document.addEventListener("n2:variant",function(e){
    var LP=window.LIVE_PRODUCT;
    if(!LP||!e.detail||!e.detail.title)return;
    var v=(LP.variants||[]).filter(function(x){return x.title===e.detail.title})[0];
    var fi=v&&(v.featured_image||(v.featured_media&&v.featured_media.preview_image));
    if(!fi||!fi.src)return;
    var k=key(fi.src),idx=-1;
    [].slice.call(document.querySelectorAll(".n2-slide img")).forEach(function(im,i){if(idx<0&&key(im.currentSrc||im.src)===k)idx=i});
    if(idx<0)return;
    var th=document.querySelector('.n2-th[data-gi="'+idx+'"]');
    if(th)th.click();
  });
})();
