import json,datetime,re,html
from gql import gql
SP='/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad/'
M=json.load(open(SP+'measured.json'))['out']
for k,v in json.load(open(SP+'story_m.json')).items():
    M[k]={'d':v.get('1440'),'m':v.get('390') if v.get('390',[0])[0] else None}
BR=[('Cloud7','cloud7'),('Nordog','nordog'),('Tadazhi','tadazhi'),('DVENTOTTO','dventotto'),('Molly and Stitch','molly-and-stitch'),('Pintu','pintu'),('BDEBRUNO','bdebruno'),('Brott Barcelona','brott-barcelona'),('PAIKKA','paikka')]
for n,h in BR: M.setdefault(f'brand-{h}.jpg',{'d':[1440,504],'m':[390,504]})
CTOP=['new-in','beds','walking','coats','dining','play','travel','cats','gifts','sale','sizes','all']
for h in CTOP:
    for k in (1,2): M.setdefault(f'collection-{h}-{k}.mp4',{'d':[660,825],'m':[358,448]})
for n,h in BR: M.setdefault(f'brand-{h}.mp4',{'d':[1440,504],'m':[390,504]})
M['product-film.mp4']={'d':[720,560],'m':[390,420]}
def cap(s): return s[:1].upper()+s[1:]
def where(f):
    b=f.rsplit('.',1)[0]
    W={'home-hero':('Homepage','Full-screen opening film'),'home-cloud7':('Homepage','Cloud7 brand film'),'home-new-puppy':('Homepage','New puppy film'),
       'home-dachshund':('Homepage','Long backs: Dachshund panel'),'home-greyhound-whippet':('Homepage','Long backs: Greyhound & whippet panel'),
       'story-hero':('Our story','Opening film, full width'),'story-close':('Our story','Closing film'),'story-workshops':('Our story','At the workshops'),
       'track-order-hero':('Track your order','Banner at the top'),'product-film':('Every product page','Film beside the brand story')}
    if b in W: return W[b]
    m=re.match(r'home-category-(.+)',b)
    if m: return ('Homepage','Shop by category: '+{'coats':'Coats & knitwear'}.get(m.group(1),cap(m.group(1))))
    m=re.match(r'home-size-(.+)',b)
    if m: return ('Homepage','Shop by size: '+cap(m.group(1))+{'puppy':' (up to 6 months)','petite':' (up to 5kg)','small':' (5 to 10kg)','medium':' (10 to 25kg)','large':' (25 to 40kg)','giant':' (40kg and over)'}[m.group(1)])
    m=re.match(r'happy-dogs-(.+)',b)
    if m:
        pg='Homepage and Happy dogs' if m.group(1) in ('juno','fig','bonnie','ted') else 'Happy dogs'
        return (pg,'Customer film: '+cap(m.group(1)))
    m=re.match(r'menu-new-(.+)',b)
    if m: return ('Menu','New In tile: '+cap(m.group(1).replace('-',' ').replace('collars leads','collars & leads')))
    m=re.match(r'menu-(.+)',b)
    if m: return ('Menu',cap(m.group(1))+' menu photo')
    m=re.match(r'story-collect-(.+)',b)
    if m: return ('Our story','What we collect: '+cap(m.group(1)))
    m=re.match(r'track-order-tile-(.+)',b)
    if m: return ('Track your order','Help tile: '+cap(m.group(1).replace('-',' ')))
    m=re.match(r'brand-(.+)',b)
    if m: return ('Brand page',dict((h,n) for n,h in BR)[m.group(1)]+(' banner film' if f.endswith('.mp4') else ' still, shown until the film plays'))
    m=re.match(r'collection-(.+)-([12])$',b)
    if m:
        k,n=m.group(1),m.group(2)
        lab={'new-in':'New In','sale':'Sale','sizes':'Size collections','all':'Any other collection'}.get(k,cap(k))
        pos='after the 4th product, on the left' if n=='1' else 'after the 14th product, on the right'
        return ('Collection pages',lab+(' and its sub-collections' if k not in ('sale','sizes','all') else '')+': film '+n+', '+pos)
    return ('','')
GROUPS=[
 dict(id='film-wide',kind='Film',title='Wide film',ratio='16:9',px='1920 × 1080',fmt='MP4 (H.264), 10 to 20 seconds, no sound, under 20 MB',
      tip='Keep the dog in the middle third. These play edge to edge and phones crop the sides, so the centre is what everyone sees.',
      files=['home-hero.mp4','home-new-puppy.mp4','story-close.mp4','product-film.mp4']),
 dict(id='film-banner',kind='Film',title='Banner film',ratio='21:9',px='2560 × 1080',fmt='MP4 (H.264), 10 to 20 seconds, no sound, under 25 MB',
      tip='Brand pages open with these, behind the brand name. Shoot wide and keep the action in the centre: phones show a tall slice from the middle.',
      files=[f'brand-{h}.mp4' for n,h in BR]+['home-cloud7.mp4','story-hero.mp4']),
 dict(id='film-portrait',kind='Film',title='Portrait film',ratio='4:5',px='1080 × 1350',fmt='MP4 (H.264), 6 to 15 seconds, no sound, under 10 MB',
      tip='Collection films sit in among the products, the size of four product cards: two per category, the first after the 4th product and the second after the 14th, shared by all its sub-collections. Customer films are one dog each; Juno, Fig, Bonnie and Ted also play on the homepage.',
      files=[f'collection-{h}-{k}.mp4' for h in CTOP for k in (1,2)]+['happy-dogs-juno.mp4','happy-dogs-fig.mp4','happy-dogs-bonnie.mp4','happy-dogs-ted.mp4','happy-dogs-bramble.mp4','happy-dogs-rosie.mp4','happy-dogs-scout.mp4','happy-dogs-bear.mp4','happy-dogs-honey.mp4','happy-dogs-willow.mp4','happy-dogs-mochi.mp4']),
 dict(id='photo-banner',kind='Photo',title='Wide banner',ratio='about 3:1',px='2880 × 1000',fmt='JPG, under 2 MB',
      tip='Brand stills show until the brand film loads, so take them from the same shoot. Leave calm space on the left for the heading. Phones show a tall slice from the centre.',
      files=[f'brand-{h}.jpg' for n,h in BR]+['track-order-hero.jpg']),
 dict(id='photo-square',kind='Photo',title='Square photo',ratio='1:1',px='1600 × 1600',fmt='JPG, under 1 MB',
      tip='The biggest batch. Same light, same background and same distance across a row, so they sit together as a set.',
      files=[f'story-collect-{x}.jpg' for x in ['beds','coats','walking','dining','play','travel']]+[f'menu-new-{x}.jpg' for x in ['beds','collars-leads','knitwear','for-cats']]+
            [f'track-order-tile-{x}.jpg' for x in ['delivery','returns','contact-us']]),
 dict(id='photo-portrait',kind='Photo',title='Homepage tile',ratio='4:5',px='1600 × 2000',fmt='JPG, under 1.5 MB',
      tip='The two sideways-scrolling rows on the homepage: Shop by category and Shop by size. The name sits bottom left in white, so keep that corner darker and uncluttered. For sizes, show a dog of that size.',
      files=[f'home-category-{x}.jpg' for x in ['beds','walking','coats','dining','play','travel','cats','gifts']]+[f'home-size-{x}.jpg' for x in ['puppy','petite','small','medium','large','giant']]),
 dict(id='photo-tall',kind='Photo',title='Tall menu photo',ratio='3:4',px='1200 × 1600',fmt='JPG, under 1 MB',
      tip='Shown on the right of each drop-down menu with a caption over the bottom, so keep the lower quarter quiet.',
      files=[f'menu-{x}.jpg' for x in ['beds','walking','coats','dining','play','travel','cats','gifts']]),
 dict(id='photo-landscape',kind='Photo',title='Landscape photo',ratio='4:3',px='2000 × 1500',fmt='JPG, under 1.5 MB',
      tip='The two Long backs panels on the homepage sit side by side, so shoot them as a pair.',
      files=['home-dachshund.jpg','home-greyhound-whippet.jpg']),
 dict(id='photo-workshop',kind='Photo',title='Workshop photo',ratio='3:2',px='2400 × 1600',fmt='JPG, under 1.5 MB',
      tip='Hands, tools and leather at a maker’s bench. Shown on Our story beside the list of workshops.',
      files=['story-workshops.jpg']),
]
HIDDEN = lambda f: (f.startswith('happy-dogs-') or 'cats' in f or f.startswith('brand-dventotto')
                    or (f.startswith('brand-') and f.endswith('.jpg')) or f.startswith('collection-'))
for g in GROUPS: g['files'] = [f for f in g['files'] if not HIDDEN(f)]
GROUPS = [g for g in GROUPS if g['files'] or g['id'] == 'film-portrait']
# collection films are a shared pool: any film whose name starts with "collection"
for g in GROUPS:
    if g['id'] == 'film-portrait':
        g['tip'] = 'Collection films sit in among the products, the size of four product cards: one after the 4th product and one after the 14th. Any film whose name starts with "collection" joins the pool, and each collection picks two from it, so they mix across the shop. Add more whenever you like.'
        g['files'] = ['collection-*.mp4']
# every named slot in the theme must be in a group
named=set(k for k in M if '.' in k)
grouped=set(f for g in GROUPS for f in g['files'])
missing=set(f for f in named-grouped if not HIDDEN(f))
assert not missing, missing
# what is already in Content > Files, read through the same name map the theme uses
import media_map
MM, _ = media_map.build()
def status(f):
    base = f.rsplit('.', 1)[0]
    if f == 'collection-*.mp4': return ('up', f"{len(MM['pool'])} films in the pool") if MM['pool'] else (None, '')
    if f.endswith('.mp4'):
        if base in MM['films']: return ('up', '')
        if base in MM['stills']: return ('photo', 'Arrived as a photo, not a film. It shows as a still for now.')
        return (None, '')
    return ('up', '') if base in MM['stills'] else (None, '')
for g in GROUPS:
    g['items']=[]
    for f in g['files']:
        pg,spot=where(f); m=M.get(f,{})
        st, note = status(f)
        if f == 'collection-*.mp4': pg, spot, m = 'Collection pages', 'Pool of films shared by every collection', {'d':[660,825],'m':[358,448]}
        g['items'].append(dict(f=f,page=pg,spot=spot,d=m.get('d'),m=m.get('m'),up=st=='up',warn=note if st=='photo' else '',note=note if st=='up' else ''))
    del g['files']
now=datetime.datetime.now(datetime.timezone.utc).astimezone(datetime.timezone(datetime.timedelta(hours=0)))
data=dict(checked=now.strftime('%-d %b %Y, %H:%M UTC'),groups=GROUPS)
tpl=open(SP+'dash_tpl.html').read()
open(SP+'media-dashboard.html','w').write(tpl.replace('/*DATA*/null',json.dumps(data,ensure_ascii=False)))
print(sum(len(g['items']) for g in GROUPS),'files,',sum(1 for g in GROUPS for i in g['items'] if i['up']),'uploaded')
