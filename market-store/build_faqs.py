# Builds assets/faqs-eu.js: the UK faqs.js engine with the EU question set (German and Irish) swapped in.
import json,re
s=open('/tmp/mk/faqs.js').read()
a=s.find('CATS=[')
b=s.find('FAQS=[')
# end of FAQS array
j=b+5;d=0;ins=None;esc=False;k=j
while True:
    c=s[k]
    if ins:
        if esc: esc=False
        elif c=='\\': esc=True
        elif c==ins: ins=None
    else:
        if c in '"\'': ins=c
        elif c=='[': d+=1
        elif c==']':
            d-=1
            if d==0: break
    k+=1
M='<a href="mailto:hello@poorly-pet.com">hello@poorly-pet.com</a>'
def build(de):
    if de:
        cats=[("orders","Bestellung & Versand","Versandkosten, Lieferzeiten und Sendungsverfolgung."),("returns","Rückgabe & Erstattung","Ihr 14-tägiges Widerrufsrecht, Erstattungen und defekte Artikel."),("products","Produkte & Größen","Hilfe bei der Größenwahl und zur Anwendung."),("payments","Zahlung & Rabatte","Zahlungsarten, Abbuchung und Rabattcodes."),("about","Über uns","Wer wir sind und wie Sie uns erreichen.")]
        f=[("orders","Wohin liefern Sie?","<p>Wir liefern nach Deutschland. Alle Bestellungen werden aus Großbritannien versandt.</p>"),
        ("orders","Was kostet der Versand?","<p>Der Versand ist <b>ab 50 € Bestellwert kostenlos</b>. Darunter betragen die Versandkosten 5,99 €. Sie sehen den Betrag an der Kasse, bevor Sie bezahlen.</p>"),
        ("orders","Wie lange dauert die Lieferung?","<p>Die Lieferung dauert in der Regel <b>2 bis 5 Werktage</b>. Ihre Bestellung wird aus Großbritannien versandt, in der Regel innerhalb von 1 bis 2 Werktagen nach Bestelleingang.</p>"),
        ("orders","Wie verfolge ich meine Bestellung?","<p>Sobald Ihre Bestellung versandt ist, erhalten Sie eine E-Mail mit Sendungsverfolgung. Bei Fragen schreiben Sie uns an "+M+".</p>"),
        ("orders","Kann ich meine Bestellung ändern oder stornieren?","<p>Schreiben Sie uns so schnell wie möglich an "+M+". Solange die Bestellung noch nicht versandt ist, ändern oder stornieren wir sie gern.</p>"),
        ("orders","Fallen Zölle oder Einfuhrabgaben an?","<p>Die Preise im Shop sind Endpreise in Euro. Sollte bei Ihrer Sendung dennoch eine Abgabe anfallen, schreiben Sie uns bitte an "+M+", dann kümmern wir uns darum.</p>"),
        ("returns","Wie lauten Ihre Rückgabebedingungen?","<p>Sie haben <b>14 Tage</b> ab Erhalt der Ware Zeit, Ihre Bestellung zu widerrufen. Die Einzelheiten finden Sie auf der Seite Rückgabe und Erstattung.</p>"),
        ("returns","Wie starte ich eine Rückgabe?","<p>Schreiben Sie uns an "+M+" mit Ihrer Bestellnummer. Wir senden Ihnen die Rücksendeadresse und die nächsten Schritte.</p>"),
        ("returns","Kann ich geöffnete Nahrungsergänzungsmittel zurückgeben?","<p>Aus Gründen des Gesundheitsschutzes nehmen wir geöffnete Nahrungsergänzungsmittel und Futter nicht zurück. Ist ein Artikel defekt oder falsch geliefert worden, helfen wir Ihnen selbstverständlich.</p>"),
        ("returns","Wie lange dauert die Erstattung?","<p>Nach Eingang und Prüfung der Rücksendung erstatten wir den Betrag auf die ursprüngliche Zahlungsart. Die Gutschrift dauert in der Regel einige Werktage.</p>"),
        ("products","Wie messe ich meinen Hund für einen Rollstuhl?","<p>Auf der jeweiligen Produktseite finden Sie die Maße, die Sie benötigen. Wenn Sie unsicher sind, schreiben Sie uns an "+M+" und wir helfen bei der Auswahl.</p>"),
        ("products","Wie finde ich die richtige Größe für Orthese, Geschirr oder Genesungsanzug?","<p>Messen Sie Ihren Hund wie auf der Produktseite beschrieben und vergleichen Sie die Werte mit der Größentabelle. Zwischen zwei Größen empfehlen wir die größere.</p>"),
        ("payments","Welche Zahlungsarten akzeptieren Sie?","<p>Sie können mit allen gängigen Karten und weiteren Zahlungsarten bezahlen, die an der Kasse angezeigt werden. Alle Preise sind in Euro.</p>"),
        ("payments","Wie erhalte ich 10 % Rabatt auf meine erste Bestellung?","<p>Tragen Sie den Code <b>POORLY10</b> an der Kasse ein. Den Code erhalten Sie auch, wenn Sie sich am Ende einer Seite für unsere E-Mails anmelden.</p>"),
        ("about","Wie kann ich Sie erreichen?","<p>Schreiben Sie uns an "+M+". Wir antworten in der Regel innerhalb eines Werktags.</p>")]
    else:
        cats=[("orders","Orders & delivery","Delivery costs, dispatch times, tracking and changing an order."),("returns","Returns & refunds","Your 14-day right to cancel, refunds and faulty items."),("products","Products & sizing","Measuring for wheelchairs and supports, and using supplements."),("payments","Payments & discounts","Ways to pay, when you are charged and discount codes."),("about","About us","Who we are and how to reach us.")]
        f=[("orders","Where do you deliver?","<p>We deliver to the Republic of Ireland. All orders are shipped from the UK.</p>"),
        ("orders","How much does delivery cost?","<p>Delivery is <b>free on orders over €50</b>. Below that, delivery is €4.99, shown at checkout before you pay.</p>"),
        ("orders","How long will my order take to arrive?","<p>Delivery takes <b>2 to 5 working days</b>. Your order is shipped from the UK, usually within 1 to 2 working days of your order.</p>"),
        ("orders","How do I track my order?","<p>Once your order ships you will get an email with tracking. If you need help, email "+M+".</p>"),
        ("orders","Can I change or cancel my order?","<p>Email "+M+" as soon as you can. If your order has not shipped we will happily change or cancel it.</p>"),
        ("orders","Will I pay customs or import charges?","<p>The prices in the shop are in euro. If a charge does come up on your parcel, email "+M+" and we will sort it out.</p>"),
        ("returns","What is your returns policy?","<p>You have <b>14 days</b> from receiving your order to cancel it. The full details are on our Returns and refunds page.</p>"),
        ("returns","How do I start a return?","<p>Email "+M+" with your order number and we will send you the return address and next steps.</p>"),
        ("returns","Can I return supplements or other opened items?","<p>For health and safety reasons we cannot take back opened supplements or food. If an item is faulty or the wrong item arrives, we will put it right.</p>"),
        ("returns","How long will my refund take?","<p>Once we receive and check your return we refund the original payment method. It usually takes a few working days to appear.</p>"),
        ("products","How do I measure my dog for a wheelchair?","<p>Each product page shows the measurements you need. If you are unsure, email "+M+" and we will help you choose.</p>"),
        ("products","How do I find the right size for a brace, harness or recovery suit?","<p>Measure your dog as shown on the product page and compare with the size chart. Between two sizes, we suggest the larger one.</p>"),
        ("payments","Which payment methods do you accept?","<p>You can pay with the main cards and the other payment methods shown at checkout. All prices are in euro.</p>"),
        ("payments","How do I get 10% off my first order?","<p>Enter the code <b>POORLY10</b> at checkout. You also get the code when you sign up to our emails at the bottom of any page.</p>"),
        ("about","How can I contact you?","<p>Email "+M+". We usually reply within one working day.</p>")]
    C=json.dumps([{"id":i,"label":l,"blurb":b} for i,l,b in cats],ensure_ascii=False)
    F=json.dumps([{"c":c,"pop":1,"q":q,"a":a} for c,q,a in f],ensure_ascii=False)
    return C,F
cd,fd=build(True);ci,fi=build(False)
head=s[:a]
mid=s[a+len('CATS=['):]  # not used
# replace CATS=[...] and FAQS=[...] by market-aware versions
cats_end=s.find('],M=',a)+1
new=(s[:a]+'CATS=(window.PP_MARKET&&window.PP_MARKET.code==="DE")?'+cd+':'+ci+s[cats_end:b]+'FAQS=(window.PP_MARKET&&window.PP_MARKET.code==="DE")?'+fd+':'+fi+s[k+1:])
# remove sourcemap line
new=re.sub(r'\n//# sourceMappingURL=.*$','',new)
open('assets/faqs-eu.js','w').write(new)
print(len(new))
