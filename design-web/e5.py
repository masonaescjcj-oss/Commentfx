# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'/home/user/Commentfx/design-web')
from _e import *

# ===================================================== COIN
pts=[34,31,29,32,28,26,29,27,24,28,33,31,36,39,37,42,45,43,47,44,48,52,50,55,53,57]
vol=''.join('<div style="flex:1;height:%dpx;background:#E6EAF0;border-radius:2px 2px 0 0"></div>'%h
  for h in [9,14,11,20,13,8,17,26,12,10,22,15,9,13,28,18,11,16,9,24,13,19,11,15,21,12])
tabs=''.join('<div style="padding:12px;font-size:13px;%s">%s</div>'
  %('color:var(--ink);font-weight:700;border-bottom:2px solid var(--ink)' if i==0 else 'color:var(--ink3)',t)
  for i,t in enumerate(['Overview','Markets','Where to buy','Unlocks','News']))
seg=''.join('<div class="%s">%s</div>'%('on' if t=='24h' else '',t) for t in ['1h','24h','7d','30d','1y','All'])

body='''<div class="pg" style="width:390px;height:1170px">
  <div class="hdr"><div class="hbar">
    <div class="ib" style="margin-left:-6px">%s</div>
    <div style="display:flex;align-items:center;gap:7px">
      <div class="av" style="background:#F7931A;width:26px;height:26px;font-size:12px">₿</div>
      <span style="font-size:15px;font-weight:800">BTC</span><span class="tg b">#1</span></div>
    <div class="sp"></div><div class="ib">%s</div><div class="ib">%s</div></div>
    <div style="display:flex;padding:0 8px;overflow:hidden">%s</div></div>
<div class="bd">
  <div class="cd">
    <div class="t2">Bitcoin</div>
    <div style="display:flex;align-items:center;gap:11px;margin-top:3px">
      <span class="n dp" style="font-size:33px;font-weight:700">$67,412</span><span class="pl u">▲ 1.82%%</span></div>
    <div class="t2 n" style="margin-top:5px">23.42 ETH · <span class="up">+0.42%%</span></div>
    <div class="seg" style="margin-top:15px">%s</div>
    <div style="margin:15px -4px 0;position:relative">
      <div class="n" style="position:absolute;right:6px;top:2px;font-size:10.5px;color:var(--ink3)">$68,900</div>
      <div class="n" style="position:absolute;right:6px;bottom:46px;font-size:10.5px;color:var(--ink3)">$64,100</div>
      %s
      <div style="display:flex;gap:2px;align-items:flex-end;height:30px;margin-top:8px;padding:0 4px">%s</div>
      <div style="display:flex;justify-content:space-between;padding:6px 6px 0" class="t2 n">
        <span>1 PM</span><span>5 PM</span><span>9 PM</span><span>1 AM</span></div></div>
  </div>
  <div class="btn">Where to buy</div>
  <div class="cd">
    <div class="ch"><b>Statistics</b><a>See all %s</a></div>
    <div class="t2" style="margin-bottom:7px">24h range</div>
    <div style="height:5px;border-radius:99px;background:var(--card3);position:relative;margin-bottom:7px">
      <div style="position:absolute;left:0;width:62%%;height:100%%;background:var(--ink);border-radius:99px"></div>
      <i style="position:absolute;left:62%%;top:-4px;width:13px;height:13px;border-radius:50%%;background:#fff;
         border:3px solid var(--ink);transform:translateX(-50%%)"></i></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px" class="t2 n"><span>$64,100</span><span>$68,900</span></div>
    <div class="kv"><span>Market cap</span><b class="n">$1,331,042,806,220</b></div>
    <div class="kv"><span>24h volume</span><b class="n">$41,392,793,845</b></div>
    <div class="kv"><span>Circulating supply</span><b class="n">19,743,206 BTC</b></div>
    <div class="kv"><span>All-time high</span><b class="n">$73,750</b></div>
  </div>
  <div class="cd">
    <div class="ch"><b>Trade as CFD</b><a>All brokers %s</a></div>
    <div class="rw"><span class="rk top">1</span><div class="sq" style="background:#FFD84D;color:#0D1421">E</div>
      <div style="min-width:0"><div class="t1" style="font-weight:600">Exness</div>
      <div class="t2">Spread <b class="n" style="color:var(--ink2)">24</b> · Leverage <b class="n" style="color:var(--ink2)">1:400</b></div></div>
      <div class="sp"></div><span class="sc">8.9</span></div>
    <div class="rw"><span class="rk top">2</span><div class="sq" style="background:#14304F;color:#fff">IC</div>
      <div style="min-width:0"><div class="t1" style="font-weight:600">IC Markets</div>
      <div class="t2">Spread <b class="n" style="color:var(--ink2)">19</b> · Leverage <b class="n" style="color:var(--ink2)">1:200</b></div></div>
      <div class="sp"></div><span class="sc">8.7</span></div>
  </div>
</div></div>'''%(ico(I['back'],19),ico(I['srch'],19),ico(I['star'],19),tabs,seg,
  spark(pts,'#14B87C',358,148,True,2.3),vol,ico(I['fwd'],12),ico(I['fwd'],12))
write('Coin.dc.html',body)

# ===================================================== WHERE TO BUY
def svc(ini,bg,fg,nm,sub,right,rcol,note=None):
    n2=('<div style="border-top:1px solid var(--line2);margin-top:11px;padding-top:10px" class="t2">%s</div>'%note) if note else ''
    return ('<div class="cd" style="padding:15px 16px;margin-bottom:11px">'
      '<div style="display:flex;align-items:center;gap:13px">'
      '<div class="sq" style="background:%s;color:%s;width:40px;height:40px;border-radius:12px;font-size:13px">%s</div>'
      '<div style="flex:1;min-width:0"><div class="t1" style="font-size:15.5px;font-weight:700">%s</div>'
      '<div class="t2" style="margin-top:1px">%s</div></div>'
      '<span style="font-size:12px;color:%s;font-weight:600;white-space:nowrap;display:inline-flex;align-items:center;gap:5px">%s%s</span>'
      '%s</div>%s</div>')%(bg,fg,ini,nm,sub,rcol,
        '<i style="width:6px;height:6px;border-radius:50%%;background:%s;display:block"></i>'%rcol if right=='Connected' else '',
        right,ico(I['fwd'],17,'#C3CAD6'),n2)

body='''<div class="pg" style="width:390px;height:920px">
  <div class="hdr" style="border-bottom:0"><div class="hbar">
    <div class="ib" style="margin-left:-6px">%s</div><div class="sp"></div><div class="ib">%s</div></div></div>
<div class="bd" style="padding-top:4px">
  <div style="padding:0 2px 4px">
    <h1 class="dp" style="font-size:33px;font-weight:700;margin:0 0 9px;line-height:1.12">Where to buy<br>Bitcoin</h1>
    <p class="t3" style="margin:0">Real fees, funding methods and access status — compared side by side.</p></div>
  <div class="sec">EXCHANGES</div>
  %s%s%s
  <div class="sec">AS A CFD</div>
  %s
  <div class="t2" style="text-align:center;padding:4px 12px;line-height:1.8">
    Ordered by real cost and access status, never by commission. Some links are affiliate links.</div>
</div></div>'''%(ico(I['back'],19),ico(I['share'],19),
  svc('CB','#1652F0','#fff','Coinbase','0.60% taker · card & bank','Connected','#14B87C','Balance: 0.024 BTC ~ $1,617.89'),
  svc('KR','#5741D9','#fff','Kraken','0.26% taker · bank transfer','Link account','#9AA3B5'),
  svc('B','#F0B90B','#0D1421','Binance','0.10% taker · widest pair list','Verify to trade','#BE7A09','Not available to residents of some regions — check before funding'),
  svc('E','#FFD84D','#0D1421','Exness','BTC/USD · spread 24 · leverage 1:400','Score 8.9','#A87528'))
write('WhereToBuy.dc.html',body)

# ===================================================== PRICE ALERT
keys=['1','2','3','4','5','6','7','8','9','.','0','⌫']
pad=''.join('<div style="flex:0 0 33.333%%;text-align:center;padding:16px 0;font-size:23px;font-weight:600;color:%s">%s</div>'
  %('var(--ink3)' if k=='⌫' else 'var(--ink)',k) for k in keys)
body='''<div class="pg" style="width:390px;height:880px;background:var(--card)">
  <div style="display:flex;align-items:center;padding:16px;flex:none;position:relative">
    <div style="display:flex;align-items:center;gap:9px;margin:0 auto">
      <div class="av" style="background:#C8A24A;width:26px;height:26px;font-size:11px">Au</div>
      <span style="font-size:15.5px;font-weight:700">Gold · XAU/USD</span></div>
    <div class="ib" style="position:absolute;right:16px;background:var(--card2)">%s</div></div>
  <div style="padding:28px 20px 0;text-align:center;flex:none">
    <div class="t3">When price is above</div>
    <div class="n dp" style="font-size:52px;font-weight:700;margin:10px 0 18px;line-height:1">2,431.00</div>
    <div class="seg" style="display:inline-flex;width:180px"><div class="on">USD</div><div>EUR</div></div>
    <div class="t2" style="margin-top:20px">Current price <b class="n" style="color:var(--ink2)">2,412.30</b> · distance <b class="n up">+0.77%%</b></div>
  </div>
  <div style="padding:26px 20px 0;flex:none">
    <div class="t2" style="margin-bottom:9px">Alert type</div>
    <div class="seg"><div class="on">Price</div><div>Broker spread</div><div>News</div></div></div>
  <div style="padding:20px 20px 0;flex:none"><div class="btn">Set price alert</div></div>
  <div style="flex:1"></div>
  <div style="display:flex;flex-wrap:wrap;padding:8px 10px 20px;flex:none;border-top:1px solid var(--line)">%s</div>
</div>'''%(ico(I['x'],18),pad)
write('Alert.dc.html',body)

# ===================================================== COMPARE
CMP=[('Overall score','8.9','8.7',1),('Primary regulator','FCA · CySEC','ASIC · CySEC',0),
 ('EUR/USD spread','0.7','0.1',2),('Gold spread','1.4','1.6',1),('Min deposit','$10','$200',1),
 ('Max leverage','1:2000','1:500',1),('Median withdrawal','18 min','4 hrs',1),
 ('Swap-free account','Yes','Yes',0),('Scalping','Allowed','Allowed',0),('Copy trading','Yes','No',1)]
cmp_=''.join('<div style="display:flex;align-items:center;padding:11px 0;border-bottom:1px solid var(--line2)">'
  '<div class="n" style="flex:1;text-align:center;font-size:13px;%s">%s</div>'
  '<div style="width:116px;text-align:center;font-size:11px;color:var(--ink3)">%s</div>'
  '<div class="n" style="flex:1;text-align:center;font-size:13px;%s">%s</div></div>'
  %('font-weight:800;color:var(--br)' if w==1 else 'color:var(--ink2)',a,l,
    'font-weight:800;color:var(--br)' if w==2 else 'color:var(--ink2)',b) for l,a,b,w in CMP)

body='''<div class="pg" style="width:390px;height:935px">
  <div class="hdr"><div class="hbar">
    <div class="ib" style="margin-left:-6px">%s</div>
    <b style="font-size:15.5px;font-weight:700">Compare brokers</b>
    <div class="sp"></div><div class="ib">%s</div></div></div>
<div class="bd">
  <div style="display:flex;align-items:flex-start;gap:10px;padding:2px 0 4px">
    <div style="flex:1;text-align:center">
      <div style="width:48px;height:48px;border-radius:15px;background:#FFD84D;margin:0 auto 8px;display:grid;
           place-items:center;font-weight:800;font-size:17px;color:#0D1421">E</div>
      <div class="t1" style="font-weight:700">Exness</div><div class="t2">3 licences</div></div>
    <div style="width:116px;text-align:center;padding-top:16px">
      <span style="font-size:11px;color:var(--ink3);background:var(--card);border:1px solid var(--line);padding:4px 14px;border-radius:99px">VS</span></div>
    <div style="flex:1;text-align:center">
      <div style="width:48px;height:48px;border-radius:15px;background:#14304F;margin:0 auto 8px;display:grid;
           place-items:center;font-weight:800;font-size:15px;color:#fff">IC</div>
      <div class="t1" style="font-weight:700">IC Markets</div><div class="t2">3 licences</div></div>
  </div>
  <div class="cd p0" style="padding:4px 16px 12px">%s</div>
  <div class="cd" style="border:1.5px solid var(--br);box-shadow:none">
    <div style="display:flex;gap:10px">%s
      <div><div style="font-size:14px;font-weight:700;color:var(--br2);margin-bottom:5px">The short version</div>
      <div class="t2" style="color:var(--ink2);line-height:1.8">Starting small and withdrawing often? Exness — $10 minimum and an 18-minute median payout. Scalping size where every pip of spread counts? IC Markets, provided you can fund $200.</div></div></div></div>
  <div style="display:flex;gap:10px">
    <div class="btn" style="flex:1;font-size:13.5px">Open Exness</div>
    <div class="btn2" style="flex:1">Open IC Markets</div></div>
</div></div>'''%(ico(I['back'],19),ico(I['plus'],19),cmp_,ico(I['scale'],18,'var(--br)'))
write('Compare.dc.html',body)

# ===================================================== ARTICLE
body='''<div class="pg" style="width:390px;height:1785px">
  <div class="hdr"><div class="hbar">
    <div class="ib" style="margin-left:-6px">%s</div>
    <div class="lg" style="font-size:14px"><span class="lgm" style="width:22px;height:22px;font-size:8px">FX</span>CommentFX</div>
    <div class="sp"></div><div class="ib">%s</div><div class="ib">%s</div></div></div>
<div class="bd">
  <div style="padding:2px 2px 0">
    <span class="tg b">REGULATION</span>
    <h1 class="dp" style="font-size:27px;font-weight:700;line-height:1.25;margin:13px 0 0;text-wrap:balance">
      CySEC suspended a major broker's licence — what it actually means for your account</h1>
    <div style="display:flex;align-items:center;gap:11px;margin-top:17px">
      <div class="av" style="background:#3E6FD9;width:34px;height:34px;font-size:13px">R</div>
      <div style="flex:1"><div class="t1" style="font-size:13.5px">Reza Mousavi</div>
      <div class="t2">Regulation analyst · 13 Sep 2026</div></div>
      <span class="t2">6 min read</span></div></div>
  <div style="height:200px;border-radius:var(--r);background:linear-gradient(150deg,#22304A,#0F1A2B);
       position:relative;overflow:hidden;box-shadow:var(--sh)">
    <div style="position:absolute;inset:0;background:radial-gradient(120%% 80%% at 80%% 0%%,rgba(168,117,40,.25),transparent 60%%)"></div>
    <div style="position:absolute;inset:auto 0 0 0;padding:12px 15px;background:linear-gradient(to top,rgba(6,10,18,.85),transparent)">
      <span style="font-size:10.5px;color:rgba(255,255,255,.7)">Image: the Cyprus Securities and Exchange Commission building</span></div></div>
  <div style="font-size:15px;line-height:1.95;color:#28303D;padding:0 2px">
    <p style="margin:0 0 18px">The Cyprus Securities and Exchange Commission suspended the licence of a well-known retail broker on Tuesday. According to the official notice, the decision followed a review of how the firm segregated client funds.</p>
    <div style="border-left:3px solid var(--br);padding:4px 0 4px 15px;margin:0 0 18px">
      <div class="dp" style="font-size:18px;font-weight:600;color:var(--ink);line-height:1.5">A suspension means the broker cannot take on new clients — not that existing client money has disappeared.</div></div>
    <p style="margin:0 0 18px">There is one detail that matters more than the headline: if your account was never opened under the Cypriot entity, this suspension does not touch you directly. It is still a signal worth reading about the group's finances.</p>
    <h2 class="dp" style="font-size:19px;font-weight:700;margin:26px 0 13px;line-height:1.4">How do I find out which entity I'm under?</h2>
    <p style="margin:0 0 18px">The counterparty is named in your Client Agreement. Faster than that: open the broker's page here, find "Which entity will you be under?", and pick your country of residence.</p></div>

  <div class="cd" style="border:1.5px solid var(--br);box-shadow:none">
    <div class="t2" style="margin-bottom:11px">Mentioned in this article</div>
    <div style="display:flex;align-items:center;gap:12px">
      <div class="sq" style="background:#FFD84D;color:#0D1421;width:42px;height:42px;border-radius:13px;font-size:14px">E</div>
      <div style="flex:1"><div class="t1" style="font-size:15px;font-weight:700">Exness</div>
      <div class="t2">4 licences · status normal · score 8.9</div></div></div>
    <div class="btn2" style="margin-top:12px">Check this broker's entity map</div></div>

  <div class="cd">
    <div class="ch"><b>24 comments</b><a>See all %s</a></div>
    <div class="rw" style="align-items:flex-start">
      <div class="av" style="background:#7C5CD6;width:30px;height:30px">H</div>
      <div><div class="t1" style="font-size:13px">Hossein T.</div>
      <div class="t3" style="margin-top:2px">My account is under the Seychelles entity — should I be worried right now?</div></div></div>
    <div class="rw" style="align-items:flex-start">
      <div class="av" style="background:#1F6B5A;width:30px;height:30px">R</div>
      <div><div style="display:flex;align-items:center;gap:6px"><span class="t1" style="font-size:13px">Reza Mousavi</span>
      <span class="tg b">AUTHOR</span></div>
      <div class="t3" style="margin-top:2px">Not yet. But don't postpone any large withdrawal until this is resolved.</div></div></div>
    <div style="display:flex;align-items:center;gap:10px;background:var(--card2);border:1px solid var(--line);
         border-radius:12px;padding:11px 13px;margin-top:12px">%s<span class="t2" style="flex:1">Write a comment…</span></div>
  </div>
</div></div>'''%(ico(I['back'],19),ico(I['heart'],19),ico(I['share'],19),ico(I['fwd'],12),ico(I['pen'],16,'var(--ink3)'))
write('Article.dc.html',body)
