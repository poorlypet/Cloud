import sys,re,json
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from gql import gql
PUB='gid://shopify/Publication/550919111046'
# name, handle, origin, tagline, story paragraphs
B=[
 ('Cloud7','cloud7','Berlin, Germany','Coats, beds and accessories from a Berlin studio, designed to be used every day and kept for years.',
  ['Cloud7 was founded in Berlin in 2010 by fashion designer Petra Jungebluth, who had previously worked for Tommy Hilfiger and Strenesse.',
   'The range covers coats, beds, collars, leads, bowls and accessories, made with small family-run manufacturers from responsibly sourced materials, from organic cotton to recycled fibres. Cloud7 has won the German Brand Award and Muse Design Awards for its coats, beds and carriers.']),
 ('Nordog','nordog','Denmark','Danish collars, harnesses and leads in genuine leather and braided rope, made for the outdoors.',
  ['Nordog is a Danish label making collars, harnesses and leads, alongside treat bags, bowl mats and bed accessories.',
   'Its collars are made in genuine leather and braided rope, built for long walks and everyday wear.']),
 ('Tadazhi','tadazhi','Denmark','Danish design for dogs: coats, knits, beds and carriers in organic and recycled materials.',
  ['Tadazhi is a Danish design company founded in 2019 by Charlotte Ellegaard, inspired by the needs of her own dog.',
   'The range includes water-repellent winter jackets, raincoats, merino wool sweaters, beds, carrier bags, collars and leads, made with organic and recycled materials.']),
 ('DVENTOTTO','dventotto','','Thoughtfully made pieces for dogs and the people who walk them.',
  ['DVENTOTTO makes considered pieces for dogs, chosen for their design and the quality of how they are made.']),
 ('Molly and Stitch','molly-and-stitch','','Handmade leather leads, collars and harnesses in the softest genuine leather.',
  ['Molly and Stitch was founded in 2015 and makes leather leads, collars and harnesses by hand.',
   'Its Butter Leather and Touch of Leather ranges are known for soft, high-quality genuine leather, with leads in city and adjustable lengths.']),
 ('Pintu','pintu','','Pieces for dogs and the home, chosen for their design and how well they are made.',
  ['Pintu makes considered pieces for dogs, chosen for their design and the quality of how they are made.']),
 ('BDEBRUNO','bdebruno','Italy','Collars and beds with removable covers, in soft colours and simple shapes.',
  ['BDEBRUNO makes collars, including martingale styles, and beds with removable covers that are easy to keep fresh.']),
 ('Brott Barcelona','brott-barcelona','Barcelona, Spain','Collars, leads and harnesses made by hand in a workshop near Barcelona.',
  ['Brott Barcelona is an independent label founded in 2010. Every piece is designed and made in its own workshop in Manresa, near Barcelona.',
   'Its martingale collars are the signature, balancing safety and design, alongside printed collars in recycled fabrics, leads, harnesses, clothing and beds.']),
 ('PAIKKA','paikka','Helsinki, Finland','Finnish dogwear designed from the dog&rsquo;s point of view, made for every season.',
  ['PAIKKA was founded in Finland in 2019 by experts in fashion, design, dog sports and physiotherapy, and is based in Helsinki.',
   'Its raincoats, suits, harnesses, leads and recovery wear are designed from the dog&rsquo;s perspective and built for tough Nordic seasons. PAIKKA holds the Design from Finland label and partnered with the Finnish Kennel Club for the 2025 World Dog Show in Helsinki.']),
]
# collection fields for origin and a one-line tagline
for key,name,typ in [('origin','Origin','single_line_text_field'),('tagline','Tagline','single_line_text_field')]:
    r=gql('mutation($d:MetafieldDefinitionInput!){metafieldDefinitionCreate(definition:$d){userErrors{message code}}}',{'d':{'name':name,'namespace':'custom','key':key,'ownerType':'COLLECTION','type':typ,'access':{'storefront':'PUBLIC_READ'}}})
    print('def',key,[e['code'] for e in r['metafieldDefinitionCreate']['userErrors']])
have={}
cur=None
while True:
    d=gql('query($c:String){collections(first:250,after:$c){nodes{id handle} pageInfo{hasNextPage endCursor}}}',{'c':cur})['collections']
    have.update({n['handle']:n['id'] for n in d['nodes']})
    if not d['pageInfo']['hasNextPage']: break
    cur=d['pageInfo']['endCursor']
ids=[]
for name,h,origin,tag,story in B:
    html=''.join(f'<p>{p}</p>' for p in story)
    mf=[{'namespace':'custom','key':'tagline','type':'single_line_text_field','value':tag.replace('&rsquo;','’')}]
    if origin: mf.append({'namespace':'custom','key':'origin','type':'single_line_text_field','value':origin})
    inp={'title':name,'handle':h,'descriptionHtml':html,'templateSuffix':'brand','sortOrder':'BEST_SELLING',
         'ruleSet':{'appliedDisjunctively':False,'rules':[{'column':'VENDOR','relation':'EQUALS','condition':name}]},'metafields':mf}
    if h in have:
        inp['id']=have[h]; inp.pop('ruleSet'); inp.pop('handle')
        r=gql('mutation($i:CollectionInput!){collectionUpdate(input:$i){collection{id} userErrors{message}}}',{'i':inp})['collectionUpdate']
    else:
        r=gql('mutation($i:CollectionInput!){collectionCreate(input:$i){collection{id} userErrors{message}}}',{'i':inp})['collectionCreate']
    if r['userErrors']: print(name,r['userErrors']); continue
    cid=r['collection']['id']; ids.append((name,cid,h))
    gql('mutation($id:ID!,$p:[PublicationInput!]!){publishablePublish(id:$id,input:$p){userErrors{message}}}',{'id':cid,'p':[{'publicationId':PUB}]})
    print('ok',name)
# a Brands menu, used by the Brands page
items=[{'title':n,'type':'COLLECTION','resourceId':c,'url':f'/collections/{h}','items':[]} for n,c,h in ids]
menus={n['handle']:n['id'] for n in gql('{menus(first:50){nodes{id handle}}}')['menus']['nodes']}
if 'brands' in menus:
    r=gql('mutation($id:ID!,$t:String!,$h:String,$i:[MenuItemUpdateInput!]!){menuUpdate(id:$id,title:$t,handle:$h,items:$i){userErrors{message}}}',{'id':menus['brands'],'t':'Brands','h':'brands','i':items})['menuUpdate']
else:
    r=gql('mutation($t:String!,$h:String!,$i:[MenuItemCreateInput!]!){menuCreate(title:$t,handle:$h,items:$i){userErrors{message}}}',{'t':'Brands','h':'brands','i':items})['menuCreate']
print('menu',r['userErrors'])
