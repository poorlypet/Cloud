import os,sys,base64,json,urllib.request,time
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
import gql as G
from gql import gql
T='/home/user/Cloud/luxury/theme-home'
idf='/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad/theme_home_id.txt'
def raw(q,v):
    for a in range(6):
        try:
            r=urllib.request.Request(f'https://{G.SHOP}/admin/api/{G.VER}/graphql.json',data=json.dumps({'query':q,'variables':v}).encode(),headers={'Content-Type':'application/json','X-Shopify-Access-Token':G.TOK})
            return json.load(urllib.request.urlopen(r,timeout=120))
        except Exception as e: time.sleep(2*(a+1))
    return {'errors':'network'}
only=sys.argv[1:]
if os.path.exists(idf): tid=open(idf).read().strip()
else:
    src=[t for t in gql('{themes(first:20){nodes{id role}}}')['themes']['nodes'] if t['role']=='MAIN'][0]['id']
    r=gql('mutation($id:ID!,$n:String){themeDuplicate(id:$id,name:$n){newTheme{id} userErrors{message}}}',{'id':src,'n':'Axel & Hound Home'})['themeDuplicate']
    tid=r['newTheme']['id']; open(idf,'w').write(tid); print('created',tid)
    names=[];cur=None
    while True:
        d=gql('query($id:ID!,$c:String){theme(id:$id){files(first:250,after:$c){nodes{filename} pageInfo{hasNextPage endCursor}}}}',{'id':tid,'c':cur})['theme']['files']
        names+=[n['filename'] for n in d['nodes']]
        if not d['pageInfo']['hasNextPage']: break
        cur=d['pageInfo']['endCursor']
    ours={os.path.relpath(os.path.join(r_,f),T) for r_,_,fs in os.walk(T) for f in fs}
    gone=0
    for n in names:
        if n in ours or n in ('config/settings_data.json','config/settings_schema.json','layout/theme.liquid'): continue
        d=raw('mutation($id:ID!,$f:[String!]!){themeFilesDelete(themeId:$id,files:$f){userErrors{message}}}',{'id':tid,'f':[n]})
        gone+=1
    print('cleared',gone,'old files')
files=[]
for r_,_,fs in os.walk(T):
    for f in fs:
        p=os.path.join(r_,f); rel=os.path.relpath(p,T)
        if only and not any(rel.startswith(o) for o in only): continue
        b=open(p,'rb').read()
        files.append({'filename':rel,'body':{'type':'BASE64','value':base64.b64encode(b).decode()} if rel.endswith(('.png','.jpg')) else {'type':'TEXT','value':b.decode()}})
order=lambda f:(0 if f['filename'].startswith(('assets','snippets','config/settings_schema','locales')) else 1 if f['filename'].startswith('sections') else 2 if f['filename'].startswith('layout') else 3)
files.sort(key=order)
M='mutation($id:ID!,$f:[OnlineStoreThemeFilesUpsertFileInput!]!){themeFilesUpsert(themeId:$id,files:$f){userErrors{filename message}}}'
ok=0
for f in files:
    d=raw(M,{'id':tid,'f':[f]})
    if d.get('errors'): print('FAIL',f['filename'],str(d['errors'])[:200]); continue
    e=d['data']['themeFilesUpsert']['userErrors']
    if e: print('FAIL',f['filename'],e[0]['message'][:400]); continue
    ok+=1
print('ok',ok,'of',len(files),'theme',tid)
