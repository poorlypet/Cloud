import sys
sys.path.insert(0,'.')
from gql import gql
import catalog as C
PAGES=[('Help','help','help'),('Delivery','delivery','delivery'),('Returns & refunds','returns','returns'),('FAQs','faqs','faqs'),('Our story','our-story','story'),('Reviews','reviews','reviews'),
 ('Contact us','contact','contact'),('Track an order','track-order','track-order'),('Brands we stock','brands','brands'),('Happy dogs','happy-dogs','happy-dogs'),
 ('Privacy policy','privacy-policy','privacy'),('Terms & conditions','terms-and-conditions','terms'),('Cookie policy','cookie-policy','cookies'),('Accessibility','accessibility','accessibility')]
have={n['handle']:n['id'] for n in gql('{pages(first:100){nodes{id handle}}}')['pages']['nodes']}
PID={}
for t,h,suf in PAGES:
    if h in have: PID[h]=have[h]; continue
    r=gql('''mutation($p:PageCreateInput!){pageCreate(page:$p){page{id} userErrors{field message}}}''',{'p':{'title':t,'handle':h,'isPublished':True,'templateSuffix':suf,'body':''}})['pageCreate']
    if r['userErrors']: print(h,r['userErrors']); continue
    PID[h]=r['page']['id']
print('pages',len(PID))
# collections by handle
cid={};cur=None
while True:
    d=gql('query($c:String){collections(first:250,after:$c){nodes{id handle} pageInfo{hasNextPage endCursor}}}',{'c':cur})['collections']
    cid.update({n['handle']:n['id'] for n in d['nodes']})
    if not d['pageInfo']['hasNextPage']: break
    cur=d['pageInfo']['endCursor']
def col(t,h,items=None): return {'title':t,'type':'COLLECTION','resourceId':cid[h],'url':f'/collections/{h}','items':items or []}
def page(t,h): return {'title':t,'type':'PAGE','resourceId':PID[h],'url':f'/pages/{h}','items':[]}
NAV=[('New in','new-in'),('Beds','beds'),('Walking','walking'),('Coats','coats'),('Dining','dining'),('Play','play'),('Travel','travel'),('Cats','cats'),('Gifts','gifts')]
main=[]
for t,h in NAV:
    slug={v:k for k,v in C.TOPH.items()}[h]
    subs=[col(C.txt(tt),hh) for hh,tt,s,top,f in C.COLLS if s==slug and not top]
    main.append(col(t,h,subs))
MENUS=[('Main menu','main-menu',main),
 ('Footer: Shop','footer-shop',[col('New in','new-in'),col('Winter Sale','sale'),col('Beds','beds'),col('Walking','walking'),col('Coats','coats'),col('Gifts','gifts')]),
 ('Footer: Help','footer-help',[page('Help','help'),page('Contact us','contact'),page('Delivery','delivery'),page('Returns','returns'),page('Track an order','track-order'),page('FAQs','faqs')]),
 ('Footer: About','footer-about',[page('Our story','our-story'),page('Brands we stock','brands'),page('Reviews','reviews'),page('Happy dogs','happy-dogs')]),
 ('Footer: Legal','footer-legal',[page('Privacy','privacy-policy'),page('Terms','terms-and-conditions'),page('Cookies','cookie-policy'),page('Accessibility','accessibility')])]
exist={n['handle']:n['id'] for n in gql('{menus(first:50){nodes{id handle}}}')['menus']['nodes']}
for t,h,items in MENUS:
    if h in exist:
        r=gql('''mutation($id:ID!,$t:String!,$h:String,$i:[MenuItemUpdateInput!]!){menuUpdate(id:$id,title:$t,handle:$h,items:$i){userErrors{field message}}}''',{'id':exist[h],'t':t,'h':h,'i':items})['menuUpdate']
    else:
        r=gql('''mutation($t:String!,$h:String!,$i:[MenuItemCreateInput!]!){menuCreate(title:$t,handle:$h,items:$i){userErrors{field message}}}''',{'t':t,'h':h,'i':items})['menuCreate']
    print(h,r['userErrors'])
