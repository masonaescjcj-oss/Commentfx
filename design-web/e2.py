# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'/home/user/Commentfx/design-web')
from _e import *

# ============================================================ BROKERS
BK=[(1,'E','#FFD84D','#0D1421','Exness',['GB','CY','SC'],'8.9','0.7','$10','1:2000','Normal','g','Fastest verified withdrawals — 18 min median',1),
    (2,'IC','#14304F','#fff','IC Markets',['AU','CY','SC'],'8.7','0.1','$200','1:500','Normal','g','Lowest EUR/USD spread of all 42 brokers',1),
    (3,'PP','#3E6FD9','#fff','Pepperstone',['AU','GB','CY'],'8.4','0.6','$0','1:500','Normal','g','Best execution record under news volatility',0),
    (4,'RB','#7C5CD6','#fff','RoboForex',['BZ'],'7.9','1.1','$10','1:2000','Normal','g','High leverage · offshore licence only',0),
    (5,'AL','#D4404F','#fff','Alpari',['MU'],'7.4','1.2','$20','1:1000','12 slow-withdrawal reports','w','No compensation fund behind client money',0),
    (6,'FX','#1F8A70','#fff','FXTM',['CY','ZA','MU'],'7.2','1.3','$50','1:1000','Normal','g','Multilingual support across 20 languages',0),
    (7,'LF','#2FA97C','#fff','LiteFinance',['CY','VC'],'6.8','1.4','$50','1:1000','MT5 outage · 47 reports','r','Built-in copy trading',0),
    (8,'OC','#C4762C','#fff','OctaFX',['CY','SC'],'6.5','1.6','$25','1:1000','Normal','g','No commission on standard accounts',0)]
bk=''
for rk,ini,bg,fg,nm,fl,sc,sp_,mind,lev,st,stk,why,ck in BK:
    bk+=('<div class="rw" style="align-items:flex-start;gap:10px;padding:14px 0">'
      '<span class="rk%s" style="padding-top:8px">%d</span>'
      '<div class="sq" style="background:%s;color:%s;width:40px;height:40px;border-radius:12px;font-size:13px">%s</div>'
      '<div style="flex:1;min-width:0">'
      '<div style="display:flex;align-items:center;gap:7px">'
      '<span class="t1" style="font-size:15.5px;font-weight:700">%s</span>'
      '<div class="sp"></div><span class="sc" style="font-size:17px">%s</span></div>'
      '<div style="display:flex;align-items:center;gap:9px;margin:6px 0">%s</div>'
      '<div class="t2" style="margin-bottom:8px">%s</div>'
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">'
      '<span class="tg">Spread <b class="n" style="color:var(--ink)">%s</b></span>'
      '<span class="tg">Min <b class="n" style="color:var(--ink)">%s</b></span>'
      '<span class="tg">Leverage <b class="n" style="color:var(--ink)">%s</b></span></div>'
      '<div style="display:flex;align-items:center;gap:8px"><span class="tg %s">%s</span>'
      '<div class="sp"></div><span class="t2" style="display:inline-flex;align-items:center;gap:6px">Compare %s</span></div>'
      '</div></div>')%(' top' if rk<=3 else '',rk,bg,fg,ini,nm,sc,
        ''.join('<span style="display:inline-flex;align-items:center;gap:4px">%s<span class="t2 n">%s</span></span>'
                %(flag(f,16,11),REG[f]) for f in fl), why, sp_, mind, lev, stk, st, cbox(ck))

METH=[('Regulation & licensing','25%','#0D1421'),('Trading cost','20%','#0D1421'),
      ('Withdrawal speed','20%','#0D1421'),('Execution & uptime','15%','#58667E'),
      ('Verified reviews','10%','#58667E'),('Corporate transparency','10%','#58667E')]
meth=''.join('<div><div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px">'
  '<span style="font-size:12.5px">%s</span><div class="sp"></div><span class="n t2" style="font-weight:700">%s</span></div>'
  '<div class="bar" style="height:4px;border-radius:99px;background:var(--card3);overflow:hidden">'
  '<i style="display:block;height:100%%;width:%s;background:%s;border-radius:99px"></i></div></div>'%(n,w,w,c) for n,w,c in METH)

body='''<div class="pg" style="width:390px;height:2220px">
%s
<div class="bd">
  %s
  %s
  <div class="cd p0" style="padding:2px 16px">%s</div>
  <div class="btn2">Show 34 more brokers</div>
  <div class="cd">
    <div class="ch"><b>How the score is built</b></div>
    <div style="display:flex;flex-direction:column;gap:10px">%s</div>
    <div style="margin-top:13px;padding:11px 12px;background:var(--brbg);border-radius:11px;display:flex;gap:9px">
      %s<span class="t2" style="color:var(--br2);line-height:1.7">No broker can buy its rank. The "Open account" links are affiliate links — the order of this list is not.</span></div>
  </div>
</div></div>'''%(header('Brokers'),
  intro('Forex broker rankings','42',
        'Every broker with an active licence, ranked on live spreads, real withdrawal times and verified user reports — not on who pays us.','brokers'),
  chips([('Low spread',1),('Tier-1 regulated',0),('Scalping allowed',0),('Swap-free',0),('MT5',0),('Min under $50',0)]),
  bk, meth, ico(I['shld'],16,'var(--br)'))
write('Brokers.dc.html',body)

# ============================================================ EXCHANGES
EX=[(1,'B','#F0B90B','#0D1421','Binance','Global','0.10%','8.9','g','Yes','$41.2B','Deepest order books in every major pair'),
    (2,'CB','#1652F0','#fff','Coinbase','US · EU','0.60%','8.7','g','Public','$3.1B','Publicly listed — audited financials'),
    (3,'KR','#5741D9','#fff','Kraken','Global','0.26%','8.5','g','Yes','$1.4B','Longest run with no major security breach'),
    (4,'BY','#F7A600','#0D1421','Bybit','Global','0.10%','8.2','g','Yes','$12.8B','Strongest derivatives liquidity outside Binance'),
    (5,'OK','#1A1A1A','#fff','OKX','Global','0.08%','8.0','g','Yes','$9.4B','Lowest taker fee of the top ten'),
    (6,'MX','#00B897','#fff','MEXC','Global','0.02%','7.3','w','Partial','$4.6B','Fastest new-token listings — thinner books')]
ex=''
for rk,ini,bg,fg,nm,reach,fee,sc,stk,por,vol,why in EX:
    ex+=('<div class="rw" style="align-items:flex-start;gap:10px;padding:13px 0">'
      '<span class="rk%s" style="padding-top:8px">%d</span>'
      '<div class="sq" style="background:%s;color:%s;width:40px;height:40px;border-radius:12px;font-size:13px">%s</div>'
      '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px">'
      '<span class="t1" style="font-size:15.5px;font-weight:700">%s</span>'
      '<div class="sp"></div><span class="sc" style="font-size:17px">%s</span></div>'
      '<div class="t2" style="margin:5px 0 8px">%s</div>'
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">'
      '<span class="tg">%s</span><span class="tg">Taker <b class="n" style="color:var(--ink)">%s</b></span>'
      '<span class="tg">Vol <b class="n" style="color:var(--ink)">%s</b></span></div>'
      '<span class="tg %s">Proof of reserves: %s</span></div></div>'
      )%(' top' if rk<=3 else '',rk,bg,fg,ini,nm,sc,why,reach,fee,vol,stk,por)

body='''<div class="pg" style="width:390px;height:1620px">
%s
<div class="bd">
  %s
  %s
  <div class="cd p0" style="padding:2px 16px">%s</div>
  <div class="btn2">Show 18 more exchanges</div>
  <div class="cd">
    <div class="ch"><b>What we check</b></div>
    <div class="kv"><span>Proof of reserves</span><b class="t2">On-chain attestation, refreshed weekly</b></div>
    <div class="kv"><span>Real taker fee</span><b class="t2">Fee actually charged at the lowest tier</b></div>
    <div class="kv"><span>Withdrawal status</span><b class="t2">Per-network, from user reports</b></div>
    <div class="kv"><span>Incident history</span><b class="t2">Breaches, halts and the response</b></div>
  </div>
</div></div>'''%(header('Exchanges'),
  intro('Crypto exchange rankings','24',
        'Ranked on proof of reserves, the fee you are actually charged, and withdrawal status reported by real users.','exchanges'),
  chips([('Proof of reserves',1),('Spot',0),('Derivatives',0),('Lowest fee',0),('No KYC tier',0)]), ex)
write('Exchanges.dc.html',body)
