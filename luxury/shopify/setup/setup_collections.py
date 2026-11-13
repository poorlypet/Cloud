import sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from gql import gql
import catalog as C
PUB='gid://shopify/Publication/550919111046'
M='''mutation($input:CollectionInput!){collectionCreate(input:$input){collection{id handle} userErrors{field message}}}'''
PUBM='''mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}'''
have=set()
cur=None
while True:
    d=gql('query($c:String){collections(first:250,after:$c){nodes{handle} pageInfo{hasNextPage endCursor}}}',{'c':cur})['collections']
    have|={n['handle'] for n in d['nodes']}
    if not d['pageInfo']['hasNextPage']: break
    cur=d['pageInfo']['endCursor']
made=0
for h,t,slug,top,f in C.COLLS:
    if h in have: continue
    inp={'title':C.txt(t),'handle':h,'descriptionHtml':f'<p>{C.CTEXT[slug][0]}</p>','sortOrder':'BEST_SELLING',
         'ruleSet':{'appliedDisjunctively':False,'rules':[{'column':'TAG','relation':'EQUALS','condition':h}]},
         'templateSuffix':None}
    r=gql(M,{'input':inp})['collectionCreate']
    if r['userErrors']: print('FAIL',h,r['userErrors']); continue
    gql(PUBM,{'id':r['collection']['id'],'input':[{'publicationId':PUB}]})
    made+=1
print('created',made,'of',len(C.COLLS))
