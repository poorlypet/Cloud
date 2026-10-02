# Cut a cartoon character out of its background using its closed dark outline,
# and export the outline as centre-line polylines for a pen draw-on effect.
import sys, json, numpy as np, cv2
from PIL import Image
from skimage.morphology import skeletonize

def line_mask(rgb):
    r,g,b = [rgb[...,i].astype(int) for i in range(3)]
    lum = .299*r+.587*g+.114*b
    return (lum < 80) & ((r-b) > 22)

def cut(src, out_png, out_json, seed_pts=None, scale=1.0):
    im = np.array(Image.open(src).convert('RGB'))
    H,W = im.shape[:2]
    ln = line_mask(im).astype(np.uint8)
    ln = cv2.morphologyEx(ln, cv2.MORPH_CLOSE, np.ones((5,5),np.uint8))
    barrier = cv2.dilate(ln, np.ones((5,5),np.uint8))
    # flood the background from the border over non-barrier pixels
    ff = (barrier*255).astype(np.uint8).copy()
    mask = np.zeros((H+2,W+2),np.uint8)
    for (x,y) in [(0,0),(W-1,0),(0,H-1),(W-1,H-1),(W//2,0),(W//2,H-1),(0,H//2),(W-1,H//2)]:
        if ff[y,x]==0: cv2.floodFill(ff, mask, (x,y), 128)
    bg = (ff==128)
    dog = ~bg
    # keep the largest component only
    n,lab,st,_ = cv2.connectedComponentsWithStats(dog.astype(np.uint8),8)
    k = 1+np.argmax(st[1:,cv2.CC_STAT_AREA]); dog = lab==k
    # fill holes
    dog = dog.astype(np.uint8)
    cnts,_ = cv2.findContours(dog, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    full = np.zeros_like(dog); cv2.drawContours(full, cnts, -1, 1, -1)
    # shrink the flood barrier back so the edge sits on the outline's outer edge
    full = cv2.erode(full, np.ones((3,3),np.uint8))
    alpha = cv2.GaussianBlur(full.astype(np.float32)*255,(3,3),0)
    x,y,w,h = cv2.boundingRect(full)
    pad=12; x0,y0=max(0,x-pad),max(0,y-pad); x1,y1=min(W,x+w+pad),min(H,y+h+pad)
    rgba = np.dstack([im, alpha.astype(np.uint8)])[y0:y1,x0:x1]
    Image.fromarray(rgba).save(out_png)
    # centre lines of the outline inside the character
    lm = (line_mask(im) & (full>0))[y0:y1,x0:x1]
    lm = cv2.morphologyEx(lm.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3,3),np.uint8))
    dist = cv2.distanceTransform(lm, cv2.DIST_L2, 3)
    sk = skeletonize(lm>0)
    paths = trace(sk, dist)
    json.dump({'w':int(x1-x0),'h':int(y1-y0),'crop':[int(x0),int(y0)],'paths':paths}, open(out_json,'w'))
    print(out_png, rgba.shape, 'paths', len(paths), 'pts', sum(len(p['d']) for p in paths))

NB = [(-1,-1),(0,-1),(1,-1),(-1,0),(1,0),(-1,1),(0,1),(1,1)]
def trace(sk, dist):
    H,W = sk.shape
    pts = set(zip(*np.nonzero(sk)))
    def nbrs(p):
        y,x=p; return [(y+dy,x+dx) for dx,dy in NB if (y+dy,x+dx) in pts]
    deg = {p:len(nbrs(p)) for p in pts}
    visited=set(); out=[]
    def walk(start):
        path=[start]; visited.add(start); cur=start
        while True:
            nx=[q for q in nbrs(cur) if q not in visited]
            if not nx: break
            # prefer straight continuation
            if len(path)>1:
                py,px=path[-2]; cy,cx=cur; dy,dx=cy-py,cx-px
                nx.sort(key=lambda q:-( (q[0]-cy)*dy+(q[1]-cx)*dx ))
            cur=nx[0]; visited.add(cur); path.append(cur)
            if deg[cur]>2: break
        return path
    starts=[p for p in pts if deg[p]==1]+[p for p in pts if deg[p]>2]
    for s in starts:
        while any(q not in visited for q in nbrs(s)):
            if s not in visited: visited.add(s)
            nx=[q for q in nbrs(s) if q not in visited][0]
            p=walk_from(s,nx,visited,nbrs,deg); 
            if len(p)>6: out.append(p)
    for p in list(pts):
        if p not in visited:
            q=walk(p)
            if len(q)>6: out.append(q)
    res=[]
    for p in out:
        a=np.array([[x,y] for y,x in p],np.float32)
        a=cv2.approxPolyDP(a.reshape(-1,1,2),1.2,False).reshape(-1,2)
        wid=float(np.median([dist[y,x] for y,x in p]))*2
        res.append({'d':[[int(x),int(y)] for x,y in a],'w':round(max(wid,3),1),'n':len(p)})
    # order: long strokes first, top to bottom-ish so the drawing reads naturally
    res.sort(key=lambda r:(min(pt[1] for pt in r['d'])//120, -r['n']))
    return res

def walk_from(s,first,visited,nbrs,deg):
    path=[s,first]; visited.add(first); cur=first
    while deg[cur]<=2:
        nx=[q for q in nbrs(cur) if q not in visited]
        if not nx: break
        cur=nx[0]; visited.add(cur); path.append(cur)
    return path

if __name__=='__main__':
    cut(sys.argv[1], sys.argv[2], sys.argv[3])
