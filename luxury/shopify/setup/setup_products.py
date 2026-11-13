import json, re, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from gql import gql
import catalog as C

LOC='gid://shopify/Location/130063040902'
PUB='gid://shopify/Publication/550919111046'
SUBS={}  # category slug -> [(handle, title)]
for h,t,slug,top,f in C.COLLS:
    if not top: SUBS.setdefault(slug,[]).append((h,t))
OVR={'cat-beds':['bed'],'cat-toys':['mouse'],'cat-bowls':['bowl'],'cat-trees':['tree'],'scratchers':['scratcher'],'window-perches':['perch'],'felt-collection':['felt'],'oak-collection':['oak'],
     'grooming':['towel','comb','balm'],'brushes':['brush'],'shampoo':['shampoo'],'plush-toys':['plush','fox','lamb'],'rope-toys':['rope'],'balls':['ball'],'chew-toys':['chew'],'puzzle-toys':['puzzle'],
     'wool-felt-collection':['felt'],'natural-rubber-collection':['rubber'],'carriers':['carrier'],'car-seats':['car seat'],'travel-beds':['travel bed'],'travel-bowls':['folding bowl','bottle'],
     'weekends-away':['weekend','blanket'],'long-drives':['car seat','boot liner'],'city-days':['carrier','bottle'],'canvas-collection':['canvas'],'bowls':['bowl'],'bowl-stands':['stand'],
     'placemats':['placemat'],'treat-jars':['treat jar'],'food-storage':['storage'],'blankets-and-cushions':['throw','blanket','cushion'],'heritage-leather-collection':['leather collar','poop bag'],
     'field-collection':['waxed','tweed'],'city-collection':['rope','harness'],'gift-sets':['set','box'],'for-the-new-puppy':['puppy'],'gifts-for-their-people':['mug'],'christmas':['winter gift'],'birthdays':['plush','gift card'],'gotcha-day':['puppy','throw']}
def kws(h,t):
    if h in OVR: return OVR[h]
    b=t.lower().replace(' collection','')
    return [b,b[:-1] if b.endswith('s') else b]
def tags_for(slug,name,price,was,extra=()):
    n=C.txt(name).lower(); tg={slug if slug in C.TOPH.values() else C.TOPH.get(slug,slug)}
    tg.add(C.TOPH.get(slug,slug))
    for h,t in SUBS.get(slug,[]):
        if any(k and k in n for k in kws(h,t)): tg.add(h)
    if was: tg.add('sale')
    tg.update(extra)
    return sorted(tg)

PRODUCTS=[]
# coats: the Cloud7 range, with sizes
SZ={'xs':'XS','s':'S','m':'M','l':'L','xl':'XL'}
SIZE_TAG={'xs':['puppy','petite-up-to-5kg'],'s':['small-5-to-10kg'],'m':['medium-10-to-25kg'],'l':['large-25-to-40kg'],'xl':['giant-40kg-and-over']}
FIT={'dachshund':'dachshund','whippet':'whippet-and-greyhound','standard':'standard-fit'}
TYPE={'winter':['coats'],'raincoats':['raincoats'],'knitwear':['knitwear']}
DESC={'puffer':'A warm, lightweight puffer cut for the long back and short legs of a dachshund. The high collar keeps the neck warm, the belly panel stays out of the way on walks, and it packs down small.',
      'alaska':'A light, weatherproof coat that&rsquo;s warm enough to stand still in. The high collar keeps the wind off the neck, and the cut gives a full range of movement on long walks.',
      'raincoat':'A fully waterproof raincoat with taped seams and a soft lining, cut to cover the back and chest without restricting movement.'}
seen=set()
for i,(n,img,flip,pr,was,cols,sz,fit,ty) in enumerate(C.P):
    if n in seen: continue
    seen.add(n)
    sizes=[SZ[x] for x in sz.split()]
    extra={FIT[fit]}|{t for x in sz.split() for t in SIZE_TAG[x]}|set(TYPE.get(ty,[]))
    nl=n.lower()
    if 'puffer' in nl: extra|={'quilted','new-in','bestsellers'}
    if 'snood' in nl: extra|={'snoods','merino'}
    if 'jumper' in nl: extra|={'knitwear','new-knitwear','merino','new-in'}
    if 'waxed' in nl: extra|={'waxed-cotton-coats'}
    if 'quilted' in nl: extra|={'quilted'}
    d=DESC['puffer'] if 'puffer' in nl else DESC['alaska'] if 'alaska' in nl else DESC['raincoat'] if 'rain' in nl else C.CTEXT['coats'][0]
    brand='Cloud7' if any(k in nl for k in ['dublin','alaska','puffer']) else 'Axel &amp; Hound'
    PRODUCTS.append(dict(title=n,vendor=brand,type='Coats',slug='coats',price=pr,was=was,colours=cols,sizes=sizes,desc=d,tags=tags_for('coats',n,pr,was,extra)))
# everything else: colour options only
NEWIN={'beds':'new-beds','walking':'new-collars-and-leads','cats':'new-for-cats'}
for cat,items in C.PRODS.items():
    if cat=='gifts': continue
    for j,(n,img,pr,was,cols,brand) in enumerate(items):
        if n in seen: continue
        seen.add(n)
        extra=set()
        if j<2 and cat in NEWIN: extra|={'new-in',NEWIN[cat]}
        if j==0: extra.add('bestsellers')
        nl=C.txt(n).lower()
        if cat=='play': extra.add('adult')
        if 'orthopaedic' in nl: extra.add('senior')
        if 'puppy' in nl: extra|={'puppy','for-the-new-puppy'}
        if cat in ('beds','walking','play','dining'): extra.add('gifts-for-dogs')
        if cat=='cats': extra.add('gifts-for-cats')
        if pr<50: extra.add('under-50')
        if pr<100: extra.add('under-100')
        PRODUCTS.append(dict(title=n,vendor=brand,type=cat.title(),slug=cat,price=pr,was=was,colours=cols,sizes=[],desc=C.CTEXT[cat][0],tags=tags_for(cat,n,pr,was,extra)))
for (n,img,pr,was,cols,brand) in [x for x in C.PRODS['gifts'] if x[0]!='Gift Card']:
    if n in seen:
        for p in PRODUCTS:
            if p['title']==n: p['tags']=sorted(set(p['tags'])|{'gifts'})
        continue
    seen.add(n)
    PRODUCTS.append(dict(title=n,vendor=brand,type='Gifts',slug='gifts',price=pr,was=was,colours=cols,sizes=[],desc=C.CTEXT['gifts'][0],tags=tags_for('gifts',n,pr,was,{'christmas'} if 'Winter' in n else set())))

M='''mutation($input:ProductSetInput!,$sync:Boolean){productSet(input:$input,synchronous:$sync){product{id handle} userErrors{field message}}}'''
PUBM='''mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}'''
def run(dry=False):
    have={n['handle'] for n in (gql('{products(first:250){nodes{handle}}}') or {}).get('products',{}).get('nodes',[])}
    made=0
    for p in PRODUCTS:
        h=C.slugify(C.txt(p['title']))
        if h in have: continue
        opts=[{'name':'Colour','values':[{'name':c} for c in p['colours']]}]
        if p['sizes']: opts.append({'name':'Size','values':[{'name':s} for s in p['sizes']]})
        variants=[]
        for ci,c in enumerate(p['colours']):
            for s in (p['sizes'] or [None]):
                ov=[{'optionName':'Colour','name':c}]+([{'optionName':'Size','name':s}] if s else [])
                q=0 if (s=='L' and ci==0 and 'Puffer' in p['title']) else 8
                v={'optionValues':ov,'price':f"{p['price']:.2f}",'inventoryItem':{'tracked':True},'inventoryQuantities':[{'locationId':LOC,'name':'available','quantity':q}]}
                if p['was']: v['compareAtPrice']=f"{p['was']:.2f}"
                variants.append(v)
        inp={'title':C.txt(p['title']),'handle':h,'vendor':C.txt(p['vendor']),'productType':p['type'],'tags':p['tags'],'status':'ACTIVE',
             'descriptionHtml':f"<p>{p['desc']}</p>",'productOptions':opts,'variants':variants}
        if dry: print(inp['title'],inp['tags'],len(variants)); continue
        d=gql(M,{'input':inp,'sync':True})
        r=d['productSet'] if d else None
        if not r or r['userErrors']: print('FAIL',p['title'],r and r['userErrors']); continue
        gql(PUBM,{'id':r['product']['id'],'input':[{'publicationId':PUB}]})
        made+=1; print('ok',inp['title'])
    print('created',made,'of',len(PRODUCTS))
if __name__=='__main__': run(dry='dry' in sys.argv)
