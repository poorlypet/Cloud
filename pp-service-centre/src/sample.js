// Sample customer emails used in step 1 so the portal can be tried before Gmail is connected.
// Step 2 replaces this with the real inbox. Gaps a person must fill in are written as [[KEY|Label]].
const m = (mins) => (now) => new Date(now - mins * 60000).toISOString();

export const THREADS = (now) => [
  {
    id: "t-1001",
    category: "customer",
    status: "needs_reply",
    priority: "urgent",
    priorityReason: "Angry, mentions a chargeback and a public review",
    sentiment: "angry",
    flags: ["Complaint", "Chargeback threat", "Review threat"],
    received: m(95)(now),
    from: { name: "Helen Marsh", email: "helen.marsh@example.com" },
    subject: "Absolutely disgusted. Third email, still no answer",
    messages: [
      { from: "customer", name: "Helen Marsh", at: m(4320)(now), body: "Hi, my order #1431 was meant to arrive on Monday for my dog Barney who has just had surgery. It has not come. Can you tell me where it is please?" },
      { from: "us", name: "Poorly Pet", at: m(4100)(now), body: "Hi Helen, thank you for getting in touch. I'm sorry for the wait. We are checking with the courier and will be back to you shortly." },
      { from: "customer", name: "Helen Marsh", at: m(95)(now), body: "It is now FIVE days late and nobody has come back to me. Barney needs that recovery suit now, not next week. This is the worst service I have had. If I do not have a full refund and an actual answer by tomorrow I will dispute the payment with my bank and leave reviews everywhere. Sort it out." }
    ],
    summary: {
      order_number: "#1431", order_date: "14 Oct 2026", issue: "Recovery suit for Barney is 5 days late, customer has had no reply to her last two emails",
      wants: "A full refund and an answer by tomorrow", pet: "Barney (dog, recovering from surgery)",
      points: ["Courier shows the parcel stuck at a depot since Tuesday", "She has emailed three times and was answered once", "Threatens a bank dispute and public reviews"]
    },
    decision: { key: "offer", question: "What are we offering Helen?", help: "She asked for a full refund. Choose what we will do and the reply is written around it.", options: [
      { key: "refund", label: "Full refund now" }, { key: "reship", label: "Send a replacement by express courier" }, { key: "choice", label: "Offer her the choice of both" }
    ] },
    draft: null,
    suggestedDrafts: {
      refund: "Hi Helen,\n\nI am so sorry. You asked a simple question, and you were left waiting for days while Barney needed his recovery suit. That is not the service we want to give you, and I understand why you are upset.\n\nI have looked into order #1431. The parcel has been held at the courier depot since Tuesday. Your tracking number is [[TRACKING_NUMBER|Tracking number]] and the courier has told us [[COURIER_UPDATE|What the courier has told us]].\n\nWe are refunding your order in full. The refund of [[REFUND_AMOUNT|Refund amount]] will show on your card within 3 to 5 working days.\n\nPlease do reply to me directly if there is anything else I can do for you and Barney. I hope he is feeling better soon.\n\nKind regards",
      reship: "Hi Helen,\n\nI am so sorry. You asked a simple question, and you were left waiting for days while Barney needed his recovery suit. That is not the service we want to give you, and I understand why you are upset.\n\nI have looked into order #1431. The original parcel has been held at the courier depot since Tuesday, so we are sending a replacement recovery suit today by express courier at no cost to you. Your new tracking number is [[TRACKING_NUMBER|New tracking number]] and it is due with you on [[DELIVERY_DATE|Expected delivery date]].\n\nIf the first parcel turns up, you are welcome to keep it. There is no need to send anything back.\n\nPlease do reply to me directly if there is anything else I can do for you and Barney.\n\nKind regards",
      choice: "Hi Helen,\n\nI am so sorry. You asked a simple question, and you were left waiting for days while Barney needed his recovery suit. That is not the service we want to give you, and I understand why you are upset.\n\nI have looked into order #1431. The parcel has been held at the courier depot since Tuesday. I would like you to choose how we put this right:\n\n1. A full refund of [[REFUND_AMOUNT|Refund amount]], back to your card within 3 to 5 working days.\n2. A replacement sent today by express courier at no cost to you.\n\nJust reply with 1 or 2 and I will sort it straight away.\n\nKind regards"
    },
    customer: {
      name: "Helen Marsh", since: "2024", spend: 312.4, mood: "Upset", pets: ["Barney (dog)"], pastEmails: 4,
      orders: [{ number: "#1431", date: "14 Oct 2026", total: 46.99, status: "In transit, delayed", items: ["Medical recovery suit, size L"], tracking: "Evri, held at depot since Tue" },
               { number: "PP-9870", date: "3 Jun 2026", total: 89.5, status: "Delivered", items: ["Joint supplement x2", "Orthopaedic bed"], tracking: "Delivered 6 Jun" }]
    }
  },
  {
    id: "t-1002",
    category: "customer",
    status: "needs_reply",
    priority: "high",
    priorityReason: "Parcel 4 days late, waiting 3 hours",
    sentiment: "upset",
    flags: ["Late delivery"],
    received: m(190)(now),
    from: { name: "Aisha Rahman", email: "aisha.r@example.com" },
    subject: "Where is my order #1466?",
    messages: [{ from: "customer", name: "Aisha Rahman", at: m(190)(now), body: "Hello, I ordered a ramp for my Labrador Kito on the 20th and it still has not arrived. The tracking page just says label created. Could you let me know when I can expect it? Thanks, Aisha" }],
    summary: {
      order_number: "#1466", order_date: "20 Oct 2026", issue: "Ramp not delivered, tracking has not moved since the label was created",
      wants: "To know when it will arrive", pet: "Kito (Labrador)",
      points: ["Order is paid and marked fulfilled", "The tracking number is missing from our record, so it needs to be added before replying"]
    },
    decision: null,
    draft: "Hi Aisha,\n\nThank you for getting in touch, and I am sorry you have been left waiting for Kito's ramp.\n\nI have checked order #1466. It left us on [[DISPATCH_DATE|Dispatch date]] and your tracking number is [[TRACKING_NUMBER|Tracking number]]. The courier is showing [[COURIER_STATUS|Latest courier status]], so you should have it by [[DELIVERY_DATE|Expected delivery date]].\n\nIf it has not arrived by then, reply to this email and I will chase the courier for you straight away.\n\nKind regards",
    customer: {
      name: "Aisha Rahman", since: "2025", spend: 118.0, mood: "Neutral", pets: ["Kito (Labrador)"], pastEmails: 1,
      orders: [{ number: "#1466", date: "20 Oct 2026", total: 79.0, status: "Fulfilled, no tracking on record", items: ["Folding dog ramp 151cm"], tracking: "Not recorded" }]
    }
  },
  {
    id: "t-1003",
    category: "customer",
    status: "needs_reply",
    priority: "high",
    priorityReason: "Damaged item with photos, wants a fix",
    sentiment: "upset",
    flags: ["Damaged item"],
    received: m(310)(now),
    from: { name: "Tom Whitaker", email: "tom.w@example.com" },
    subject: "Hock brace arrived torn",
    messages: [{ from: "customer", name: "Tom Whitaker", at: m(310)(now), body: "Hi, the hock brace I ordered for Biscuit arrived this morning and the strap is torn where it joins the main part. I have attached photos. I do not know if you would rather send a new one or refund me, I just need something that works as she is limping badly. Thanks, Tom", attachments: [{ name: "torn-strap.jpg", note: "Photo 1: strap torn clean through at the stitching" }, { name: "packaging.jpg", note: "Photo 2: box looks undamaged" }] }],
    summary: {
      order_number: "#1459", order_date: "19 Oct 2026", issue: "Brace strap is torn at the stitching on arrival",
      wants: "A working brace, either a replacement or a refund", pet: "Biscuit (limping)",
      points: ["Photos show a manufacturing fault, the box was undamaged", "Customer is flexible about replacement or refund", "Dog is in discomfort so speed matters"]
    },
    decision: { key: "offer", question: "What are we offering Tom?", help: "He is happy with either. Choose what we will do.", options: [
      { key: "replace", label: "Send a replacement" }, { key: "refund", label: "Refund the brace" }
    ] },
    draft: null,
    suggestedDrafts: {
      replace: "Hi Tom,\n\nThank you for the photos, and I am sorry the brace arrived like that. I can see the strap has torn at the stitching, so that is a fault on our side and not anything you did.\n\nWe are sending a replacement today, free of charge, with express delivery so Biscuit is not waiting. Your tracking number is [[TRACKING_NUMBER|Tracking number]].\n\nThere is no need to send the damaged one back. I hope Biscuit is feeling more comfortable soon.\n\nKind regards",
      refund: "Hi Tom,\n\nThank you for the photos, and I am sorry the brace arrived like that. I can see the strap has torn at the stitching, so that is a fault on our side and not anything you did.\n\nI have refunded the brace in full, [[REFUND_AMOUNT|Refund amount]], and it will be back on your card within 3 to 5 working days. There is no need to send the damaged one back.\n\nI hope Biscuit is feeling more comfortable soon.\n\nKind regards"
    },
    customer: {
      name: "Tom Whitaker", since: "2026", spend: 64.99, mood: "Neutral", pets: ["Biscuit (dog)"], pastEmails: 0,
      orders: [{ number: "#1459", date: "19 Oct 2026", total: 64.99, status: "Delivered today", items: ["Hock brace, size M"], tracking: "Delivered 22 Oct" }]
    }
  },
  {
    id: "t-1004",
    category: "customer",
    status: "needs_reply",
    priority: "normal",
    priorityReason: "Return request",
    sentiment: "neutral",
    flags: ["Return"],
    received: m(520)(now),
    from: { name: "Priya Shah", email: "priya.shah@example.com" },
    subject: "Can I return the joint chews?",
    messages: [{ from: "customer", name: "Priya Shah", at: m(520)(now), body: "Hi there, I bought the joint chews for Mango last week but she will not eat them at all. Can I send them back for a refund? The tub is unopened apart from one chew. Thanks, Priya" }],
    summary: {
      order_number: "#1441", order_date: "15 Oct 2026", issue: "Dog will not eat the joint chews, wants to return them",
      wants: "A refund for the chews", pet: "Mango (dog)",
      points: ["Bought 7 days ago", "Tub opened, one chew taken, and consumables may not be returnable", "Needs a decision on what to offer"]
    },
    decision: { key: "offer", question: "What are we offering Priya?", help: "Opened supplements are not normally returnable. Choose what we will do.", options: [
      { key: "refund", label: "Refund as a goodwill gesture" }, { key: "swap", label: "Swap for a different flavour" }, { key: "decline", label: "Politely decline, explain why" }
    ] },
    draft: null,
    suggestedDrafts: {
      refund: "Hi Priya,\n\nThank you for letting me know, and I am sorry Mango did not take to the joint chews.\n\nAs it has only been a week, I am happy to refund you as a goodwill gesture. I have refunded [[REFUND_AMOUNT|Refund amount]] and it will be back on your card within 3 to 5 working days. There is no need to send the tub back.\n\nIf you would like help finding something Mango will enjoy, just reply and I will happily suggest an option.\n\nKind regards",
      swap: "Hi Priya,\n\nThank you for letting me know, and I am sorry Mango did not take to the joint chews.\n\nWe would be glad to swap them for a different flavour. Mango's pick of [[REPLACEMENT_FLAVOUR|Which flavour]] is on its way, and your tracking number is [[TRACKING_NUMBER|Tracking number]]. There is no need to send the first tub back.\n\nKind regards",
      decline: "Hi Priya,\n\nThank you for letting me know, and I am sorry Mango did not take to the joint chews.\n\nBecause supplements are consumable, we cannot take back a tub once it has been opened. I am sorry I cannot do more on this occasion. If it would help, I am happy to suggest a powder or a different flavour that dogs who are fussy about chews often prefer.\n\nKind regards"
    },
    customer: {
      name: "Priya Shah", since: "2025", spend: 210.5, mood: "Happy", pets: ["Mango (dog)"], pastEmails: 2,
      orders: [{ number: "#1441", date: "15 Oct 2026", total: 27.99, status: "Delivered", items: ["Joint chews, 120 pack"], tracking: "Delivered 18 Oct" }]
    }
  },
  {
    id: "t-1005",
    category: "customer",
    status: "needs_reply",
    priority: "normal",
    priorityReason: "Subscription change",
    sentiment: "neutral",
    flags: ["Subscription"],
    received: m(700)(now),
    from: { name: "Mark Ellison", email: "mark.ellison@example.com" },
    subject: "Skip my next delivery",
    messages: [{ from: "customer", name: "Mark Ellison", at: m(700)(now), body: "Hello, can you skip my next Subscribe & Save delivery please? We are away until mid November. Thanks, Mark" }],
    summary: {
      order_number: "Subscription SUB-2231", order_date: "Started 2 Mar 2026", issue: "Wants the next subscription delivery skipped",
      wants: "Skip one delivery, away until mid November", pet: "Not mentioned",
      points: ["Next delivery is due soon", "Needs the new delivery date adding after the skip is done"]
    },
    decision: null,
    draft: "Hi Mark,\n\nNo problem at all. I have skipped your next Subscribe & Save delivery, so nothing will be sent while you are away.\n\nYour next delivery is now due on [[NEXT_DELIVERY_DATE|New delivery date]]. If you would like it earlier or later, just reply and I will change it.\n\nEnjoy your trip.\n\nKind regards",
    customer: {
      name: "Mark Ellison", since: "2026", spend: 156.0, mood: "Neutral", pets: [], pastEmails: 1,
      orders: [{ number: "SUB-2231", date: "Started 2 Mar 2026", total: 31.2, status: "Active, next due 28 Oct", items: ["Salmon oil, monthly"], tracking: "n/a" }]
    }
  },
  {
    id: "t-1006",
    category: "customer",
    status: "needs_reply",
    priority: "low",
    priorityReason: "Pre-sale question",
    sentiment: "neutral",
    flags: ["Pre-sale"],
    received: m(930)(now),
    from: { name: "Caroline Doyle", email: "c.doyle@example.com" },
    subject: "Will the neck brace fit my 4kg cat?",
    messages: [{ from: "customer", name: "Caroline Doyle", at: m(930)(now), body: "Hi, I am looking at the Balto neck brace for my cat Pickle who has had a dental operation. She weighs about 4kg and is quite small. Which size would you recommend and how quickly could it arrive? Thank you, Caroline" }],
    summary: {
      order_number: "None yet", order_date: "n/a", issue: "Size advice for a neck brace for a small cat",
      wants: "Which size to order and delivery time", pet: "Pickle (cat, 4kg, after a dental operation)",
      points: ["New customer, no orders", "Needs a measurement of Pickle's neck before recommending a size", "Free delivery over 39 pounds, otherwise standard delivery"]
    },
    decision: null,
    draft: "Hi Caroline,\n\nThank you for getting in touch, and I hope Pickle is recovering well after her operation.\n\nThe best way to choose is by her neck measurement, as weight alone can be misleading. If you can measure around her neck, just behind the ears, and let me know the number in centimetres, I will tell you exactly which size to order.\n\nFor delivery, orders are dispatched within 1 to 2 working days and arrive in [[DELIVERY_TIME|Standard delivery time]]. Delivery is free on orders over 39 pounds.\n\nKind regards",
    customer: { name: "Caroline Doyle", since: "New", spend: 0, mood: "Neutral", pets: ["Pickle (cat)"], pastEmails: 0, orders: [] }
  },
  {
    id: "t-1007",
    category: "customer",
    status: "needs_reply",
    priority: "low",
    priorityReason: "Happy customer",
    sentiment: "happy",
    flags: ["Thank you"],
    received: m(1500)(now),
    from: { name: "Janet Owusu", email: "janet.o@example.com" },
    subject: "Thank you!",
    messages: [{ from: "customer", name: "Janet Owusu", at: m(1500)(now), body: "Just wanted to say thank you. The recovery suit for Bramble arrived the next day and fits perfectly. She is so much more comfortable. Will definitely order again. Janet" }],
    summary: { order_number: "#1419", order_date: "12 Oct 2026", issue: "None, a thank you", wants: "Nothing, just happy", pet: "Bramble", points: ["Fast delivery, perfect fit", "A good moment to ask for a review"] },
    decision: null,
    draft: "Hi Janet,\n\nThank you so much for taking the time to write, this really made our day. I am so glad the suit fits Bramble well and that she is more comfortable.\n\nIf you have a spare minute, a short review would help other owners find what they need. No pressure at all, and thank you again.\n\nKind regards",
    customer: { name: "Janet Owusu", since: "2026", spend: 46.99, mood: "Happy", pets: ["Bramble (dog)"], pastEmails: 1, orders: [{ number: "#1419", date: "12 Oct 2026", total: 46.99, status: "Delivered", items: ["Medical recovery suit, size M"], tracking: "Delivered 13 Oct" }] }
  },
  {
    id: "t-2001",
    category: "supplier",
    status: "ignored",
    priority: "low",
    priorityReason: "Supplier invoice",
    sentiment: "neutral",
    flags: [],
    received: m(240)(now),
    from: { name: "Karnlea Accounts", email: "accounts@supplier.example" },
    subject: "Invoice 2290 for October",
    messages: [{ from: "customer", name: "Karnlea Accounts", at: m(240)(now), body: "Please find attached invoice 2290 for October supplies. Payment terms 30 days." }],
    summary: { order_number: "n/a", order_date: "n/a", issue: "Supplier invoice", wants: "Payment", pet: "n/a", points: [] },
    decision: null, draft: null,
    why: "Sent by a supplier about an invoice, not a customer",
    customer: null
  },
  {
    id: "t-2002",
    category: "marketing",
    status: "ignored",
    priority: "low",
    priorityReason: "Marketing email",
    sentiment: "neutral",
    flags: [],
    received: m(660)(now),
    from: { name: "RankBoost SEO", email: "hello@seo-offers.example" },
    subject: "Get your shop to page 1 of Google",
    messages: [{ from: "customer", name: "RankBoost SEO", at: m(660)(now), body: "We can get your website to the top of Google in 30 days. Reply for a free audit." }],
    summary: { order_number: "n/a", order_date: "n/a", issue: "Cold sales email", wants: "A sales call", pet: "n/a", points: [] },
    decision: null, draft: null,
    why: "Unsolicited marketing, no order or customer link",
    customer: null
  }
];
