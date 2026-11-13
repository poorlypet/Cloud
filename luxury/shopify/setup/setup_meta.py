import sys,json
sys.path.insert(0,'.')
from gql import gql
d=gql('''mutation{metaobjectDefinitionCreate(definition:{type:"product_detail",name:"Product detail",displayNameKey:"title",access:{storefront:PUBLIC_READ},fieldDefinitions:[
 {key:"title",name:"Title",type:"single_line_text_field"},{key:"text",name:"Text",type:"multi_line_text_field"},{key:"image",name:"Image",type:"file_reference"}]}){metaobjectDefinition{id} userErrors{field message code}}}''')
r=d['metaobjectDefinitionCreate']; print(r['userErrors'])
did=r['metaobjectDefinition']['id'] if r['metaobjectDefinition'] else gql('{metaobjectDefinitionByType(type:"product_detail"){id}}')['metaobjectDefinitionByType']['id']
M='''mutation($d:MetafieldDefinitionInput!){metafieldDefinitionCreate(definition:$d){createdDefinition{id} userErrors{field message code}}}'''
for dd in [
 {'name':'Details','namespace':'custom','key':'details','ownerType':'PRODUCT','type':'list.metaobject_reference','validations':[{'name':'metaobject_definition_id','value':did}],'description':'The four details shown under the product, each with a title, short text and an optional image.'},
 {'name':'Materials and care','namespace':'custom','key':'materials_care','ownerType':'PRODUCT','type':'multi_line_text_field','description':'One line per point, shown in the Materials & care tab.'},
 {'name':'Size guide','namespace':'custom','key':'size_guide','ownerType':'PRODUCT','type':'multi_line_text_field','description':'One size per line: Size | Back length cm | Chest cm | Neck cm. First line is the header.'},
 {'name':'Features','namespace':'custom','key':'features','ownerType':'PRODUCT','type':'list.single_line_text_field','description':'Bullet points shown under the description.'}]:
    dd['access']={'storefront':'PUBLIC_READ'}
    print(dd['key'],gql(M,{'d':dd})['metafieldDefinitionCreate']['userErrors'])
# fill the puffer as an example
pid=gql('{productByHandle(handle:"dog-coat-dachshund-puffer"){id}}')['productByHandle']['id']
DET=[('Cut for a long back','A longer body and a shorter chest panel follow the dachshund line, so the coat covers the whole back without bunching at the front legs.'),
     ('A high, soft collar','The collar stands up to keep the neck warm and folds down on milder days. It sits clear of the ears and never rubs.'),
     ('Short belly panel','The underside is cut short and close, so it stays dry and out of the way on short legs and long walks.'),
     ('Harness opening','A neat opening on the back lets you clip a lead to a harness worn underneath, without taking the coat off.')]
ids=[]
for i,(t,x) in enumerate(DET):
    r=gql('''mutation($m:MetaobjectCreateInput!){metaobjectCreate(metaobject:$m){metaobject{id} userErrors{field message}}}''',{'m':{'type':'product_detail','handle':f'puffer-{i+1}','fields':[{'key':'title','value':t},{'key':'text','value':x}]}})['metaobjectCreate']
    if r['metaobject']: ids.append(r['metaobject']['id'])
    else: print(r['userErrors'])
SG="Size | Back length | Chest | Neck\nXS | 30 cm | 40–46 cm | 26 cm\nS | 35 cm | 46–52 cm | 30 cm\nM | 40 cm | 52–58 cm | 34 cm\nL | 45 cm | 58–64 cm | 38 cm\nXL | 50 cm | 64–70 cm | 42 cm"
r=gql('''mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{field message}}}''',{'m':[
 {'ownerId':pid,'namespace':'custom','key':'details','type':'list.metaobject_reference','value':json.dumps(ids)},
 {'ownerId':pid,'namespace':'custom','key':'size_guide','type':'multi_line_text_field','value':SG},
 {'ownerId':pid,'namespace':'custom','key':'materials_care','type':'multi_line_text_field','value':'Outer: 100% recycled polyester, water-repellent\nFill: recycled polyester wadding\nLining: soft polyester\nMachine wash at 30°C, do not tumble dry'},
 {'ownerId':pid,'namespace':'custom','key':'features','type':'list.single_line_text_field','value':json.dumps(['Longer back and shorter chest panel, cut for dachshunds','High collar that folds down on milder days','Opening on the back for a harness or lead','Water-repellent, recycled outer and fill'])}]})
print('set',r['metafieldsSet']['userErrors'])
