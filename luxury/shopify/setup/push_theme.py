import os, sys, json, base64
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from gql import gql
T='/home/user/Cloud/luxury/theme'
S='/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad'
only=sys.argv[1:]
idf=S+'/theme_id.txt'
if os.path.exists(idf): tid=open(idf).read().strip()
else:
    src=[t for t in gql('{themes(first:20){nodes{id name role}}}')['themes']['nodes'] if t['role']=='MAIN'][0]['id']
    r=gql('mutation($id:ID!,$n:String){themeDuplicate(id:$id,name:$n){newTheme{id name role} userErrors{field message}}}',{'id':src,'n':'Axel & Hound'})['themeDuplicate']
    print(r); tid=r['newTheme']['id']; open(idf,'w').write(tid)
    # clear the copied files so only ours remain
    names=[];cur=None
    while True:
        d=gql('query($id:ID!,$c:String){theme(id:$id){files(first:250,after:$c){nodes{filename} pageInfo{hasNextPage endCursor}}}}',{'id':tid,'c':cur})['theme']['files']
        names+=[n['filename'] for n in d['nodes']]
        if not d['pageInfo']['hasNextPage']: break
        cur=d['pageInfo']['endCursor']
    keep={'config/settings_data.json','config/settings_schema.json','layout/theme.liquid'}
    dels=[n for n in names if n not in keep]
    for i in range(0,len(dels),50):
        r=gql('mutation($id:ID!,$f:[String!]!){themeFilesDelete(themeId:$id,files:$f){userErrors{field message}}}',{'id':tid,'f':dels[i:i+50]})
        print('deleted',len(dels[i:i+50]),r['themeFilesDelete']['userErrors'][:2])
files=[]
for root,_,fs in os.walk(T):
    for f in fs:
        p=os.path.join(root,f); rel=os.path.relpath(p,T)
        if only and not any(rel.startswith(o) for o in only): continue
        b=open(p,'rb').read()
        if rel.endswith(('.png','.jpg','.gif','.woff2')): files.append({'filename':rel,'body':{'type':'BASE64','value':base64.b64encode(b).decode()}})
        else: files.append({'filename':rel,'body':{'type':'TEXT','value':b.decode()}})
# layouts and snippets first so templates that use them validate
order=lambda f:(0 if f['filename'].startswith(('assets','snippets','config/settings_schema')) else 1 if f['filename'].startswith('layout') else 2 if f['filename'].startswith('sections') else 3)
files.sort(key=order)
bad=0
for i in range(0,len(files),25):
    r=gql('mutation($id:ID!,$f:[OnlineStoreThemeFilesUpsertFileInput!]!){themeFilesUpsert(themeId:$id,files:$f){upsertedThemeFiles{filename} userErrors{filename field message code}}}',{'id':tid,'f':files[i:i+25]})
    if not r: bad+=1; continue
    for e in r['themeFilesUpsert']['userErrors']: bad+=1; print('ERR',e['filename'],e['message'][:300])
print('uploaded',len(files),'files, errors',bad,'theme',tid)
