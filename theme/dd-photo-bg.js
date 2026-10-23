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
