import os,sys,base64,json,urllib.request,time
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
import gql as G
T='/home/user/Cloud/luxury/theme'; tid=open('/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad/theme_id.txt').read().strip()
only=sys.argv[1:]
files=[]
for root,_,fs in os.walk(T):
    for f in fs:
        p=os.path.join(root,f); rel=os.path.relpath(p,T)
        if only and not any(rel.startswith(o) for o in only): continue
        b=open(p,'rb').read()
        files.append({'filename':rel,'body':{'type':'BASE64','value':base64.b64encode(b).decode()} if rel.endswith('.png') else {'type':'TEXT','value':b.decode()}})
order=lambda f:(0 if f['filename'].startswith(('assets','snippets','config/settings_schema','locales')) else 1 if f['filename'].startswith('sections') else 2 if f['filename'].startswith('layout') else 3)
files.sort(key=order)
M='mutation($id:ID!,$f:[OnlineStoreThemeFilesUpsertFileInput!]!){themeFilesUpsert(themeId:$id,files:$f){upsertedThemeFiles{filename} userErrors{filename message}}}'
def call(f):
    for a in range(6):
        try:
            r=urllib.request.Request(f'https://{G.SHOP}/admin/api/{G.VER}/graphql.json',data=json.dumps({'query':M,'variables':{'id':tid,'f':[f]}}).encode(),headers={'Content-Type':'application/json','X-Shopify-Access-Token':G.TOK})
            return json.load(urllib.request.urlopen(r,timeout=120))
        except Exception as e:
            time.sleep(2*(a+1))
    return {'errors':'network failed 6 times'}
ok=0;fails=[]
for f in files:
    d=call(f)
    if d.get('errors'): fails.append((f['filename'],str(d['errors'])[:200])); continue
    u=d['data']['themeFilesUpsert']
    if u['userErrors']: fails.append((f['filename'],u['userErrors'][0]['message'][:400])); continue
    ok+=1
print('ok',ok,'of',len(files))
for x in fails: print('FAIL',*x)
