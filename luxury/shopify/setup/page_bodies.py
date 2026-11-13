import sys,re
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from bs4 import BeautifulSoup
from gql import gql
L='/home/user/Cloud/luxury/'
def body(path):
    s=BeautifulSoup(open(L+path).read(),'html.parser')
    m=s.select_one('.dw-main')
    for h in m.select('.dw-help,.dw-btns'): h.decompose()
    for t in m.find_all(True):
        for a in list(t.attrs):
            if a not in ('href','colspan','scope'): del t.attrs[a]
        if t.name=='a' and t.get('href','').endswith('.html'):
            n=t['href'].split('/')[-1][:-5]
            t['href']={'delivery':'/pages/delivery','returns':'/pages/returns','contact':'/pages/contact','privacy':'/pages/privacy-policy','track3':'/pages/track-order','acs-signin':'/account/login'}.get(n,'/pages/'+n)
    for t in m.find_all(['section','div','span']): t.unwrap()
    for t in m.find_all('h2'): pass
    return str(m.decode_contents()).replace('\n','')
B={
 'delivery':body('signed-off/delivery.html'),'returns':body('signed-off/returns.html'),'faqs':body('signed-off/faqs.html'),
 'privacy-policy':body('pages/privacy.html'),'terms-and-conditions':body('pages/terms.html'),'cookie-policy':body('pages/cookies.html'),'accessibility':body('pages/accessibility.html'),
 'track-order':'<p>Your dispatch email has a tracking link that follows your parcel all the way to your door.</p><p>If you have an account, <a href="/account/login">sign in</a> to see every order and its tracking. If you checked out as a guest, use the link in your order confirmation email to see its status at any time.</p><h2>Can&rsquo;t find it?</h2><p><a href="/pages/contact">Contact us</a> with your order number and we&rsquo;ll check where it is for you.</p>',
 'brands':'<p>We work directly with a small number of makers across Europe, chosen slowly and lived with at home before we stock them.</p><h2>Cloud7</h2><p>Coats and beds from a Berlin studio that has dressed city dogs for twenty years.</p><h2>More makers coming soon</h2><p>We&rsquo;re adding the rest of our makers as their pieces arrive.</p>',
 'happy-dogs':'<p>Every week our customers send us photos of their dogs in their new coats, on their new beds and carrying their new toys around the house. A few of our favourites will appear here soon.</p><p>Tag us on Instagram to be featured.</p>',
 'reviews':'<p>Every review is collected and verified independently by Trustpilot.</p><p>Bought something from us? We&rsquo;d love to know how it&rsquo;s going.</p>',
}
pages={n['handle']:n['id'] for n in gql('{pages(first:50){nodes{id handle}}}')['pages']['nodes']}
for h,html in B.items():
    if h not in pages: print('missing',h); continue
    r=gql('mutation($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){userErrors{message}}}',{'id':pages[h],'p':{'body':html}})['pageUpdate']
    print(h,len(html),r['userErrors'])
