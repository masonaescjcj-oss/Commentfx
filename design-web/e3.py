# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'/home/user/Commentfx/design-web')
from _e import *

# ============================================================ PROP FIRMS
PP=[(1,'FT','#1F6B5A','#fff','FTMO','Forex','10% / 5% / 10%','$155','90%','1–2 days','9.0','g','No rule changes since June','2-step'),
    (2,'FN','#3E5AD4','#fff','FundedNext','Forex','8% / 5% / 10%','$99','95%','2–4 days','8.6','w','Consistency rule added to phase 2','2-step'),
    (3,'TS','#7C5CD6','#fff','Topstep','Futures','—','$165','90%','1–3 days','8.3','g','No rule changes','1-step'),
    (4,'T5','#C4762C','#fff','The5%ers','Forex','6% / 4% / 8%','$260','100%','3–5 days','7.8','w','2 late-payout reports','Scaling'),
    (5,'BR','#2FA97C','#fff','Breakout','Crypto','10% / 6% / 12%','$95','80%','2–5 days','7.1','g','No rule changes','1-step')]
pp=''
for rk,ini,bg,fg,nm,mkt,rules,fee,split,pay,sc,stk,note,stage in PP:
    pp+=('<div class="rw" style="align-items:flex-start;gap:10px;padding:14px 0">'
      '<span class="rk%s" style="padding-top:8px">%d</span>'
      '<div class="sq" style="background:%s;color:%s;width:40px;height:40px;border-radius:12px;font-size:12.5px">%s</div>'
      '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px">'
      '<span class="t1" style="font-size:15.5px;font-weight:700">%s</span>'
      '<span class="tg">%s</span><span class="tg">%s</span>'
      '<div class="sp"></div><span class="sc" style="font-size:17px">%s</span></div>'
      '<div style="display:flex;gap:7px;margin:10px 0 9px">'
      '<div style="flex:1;background:var(--card2);border-radius:10px;padding:8px 9px">'
      '<div class="t2" style="font-size:9.5px">Challenge fee</div><div class="n" style="font-size:14px;font-weight:800;color:var(--br)">%s</div></div>'
      '<div style="flex:1;background:var(--card2);border-radius:10px;padding:8px 9px">'
      '<div class="t2" style="font-size:9.5px">Profit split</div><div class="n" style="font-size:14px;font-weight:700">%s</div></div>'
      '<div style="flex:1.1;background:var(--card2);border-radius:10px;padding:8px 9px">'
      '<div class="t2" style="font-size:9.5px">Payout time</div><div class="n" style="font-size:14px;font-weight:700">%s</div></div></div>'
      '<div class="kv" style="padding:5px 0;border-bottom:0"><span>Target / daily DD / max DD</span><b class="n">%s</b></div>'
      '<div style="display:flex;align-items:center;gap:7px;margin-top:5px">%s<span class="tg %s">%s</span></div>'
      '</div></div>')%(' top' if rk<=3 else '',rk,bg,fg,ini,nm,mkt,stage,sc,fee,split,pay,rules,
        ico(I['doc'],13,'var(--ink3)'),stk,note)

body='''<div class="pg" style="width:390px;height:1930px">
%s
<div class="bd">
  %s
  %s
  <div class="cd p0" style="padding:2px 16px">%s</div>
  <div class="btn2">Show 12 more firms</div>
  <div class="cd">
    <div class="ch"><b>Rule change log</b><span class="lv"><i></i>90 days</span></div>
    <div class="rw" style="align-items:flex-start"><div class="t2 n" style="width:56px;flex:none">10 Sep</div>
      <div><div style="font-size:12.5px;font-weight:600">FundedNext</div>
      <div class="t2" style="margin-top:1px">Consistency rule added to phase 2</div></div></div>
    <div class="rw" style="align-items:flex-start"><div class="t2 n" style="width:56px;flex:none">24 Aug</div>
      <div><div style="font-size:12.5px;font-weight:600">The5%%ers</div>
      <div class="t2" style="margin-top:1px">Max drawdown cut from 5%% to 4%%</div></div></div>
    <div class="rw" style="align-items:flex-start"><div class="t2 n" style="width:56px;flex:none">15 Aug</div>
      <div><div style="font-size:12.5px;font-weight:600">FTMO</div>
      <div class="t2" style="margin-top:1px">Weekend holding allowed on swing accounts</div></div></div>
    <div class="t2" style="margin-top:11px;line-height:1.75">Prop rules change monthly and are rarely announced. This log is generated automatically by diffing each firm's own rules page.</div>
  </div>
</div></div>'''%(header('Prop Firms'),
  intro('Prop firm rankings','17',
        'Forex, futures and crypto funding challenges — ranked with verified payout proof and an automatic rule-change log.','firms'),
  chips([('Forex',1),('Crypto',0),('Futures',0),('1-step',0),('No time limit',0)]), pp)
write('Props.dc.html',body)

# ============================================================ MEMECOINS
MM=[(1,'WIFHAT','#7C5CD6','W','Solana','1 day','+86%',1,'82','g','$1.2M','4,120',
     [('LP locked 12mo','g'),('Mint revoked','g'),('Top10 18%','g'),('0% tax','g')]),
    (2,'PEPE2','#2FA97C','P','Solana','3 hours','+412%',1,'68','w','$840K','1,930',
     [('LP locked 3mo','g'),('Mint revoked','g'),('Top10 41%','w'),('2% tax','w')]),
    (3,'BONKAI','#D98324','B','Base','6 hours','+128%',1,'54','w','$310K','870',
     [('LP locked 1mo','w'),('Mint active','r'),('Top10 52%','w')]),
    (4,'DOGEKING','#C0392B','D','BSC','40 min','−31%',0,'14','r','$42K','190',
     [('Honeypot risk','r'),('LP unlocked','r'),('Top10 88%','r')])]
mm=''
for rk,nm,col,ini,chain,age,chg,up,sec,seck,liq,hold,ch in MM:
    c={'g':'var(--up)','w':'var(--wn)','r':'var(--dn)'}[seck]
    mm+=('<div class="rw" style="align-items:flex-start;gap:10px;padding:14px 0">'
      '<span class="rk" style="padding-top:8px">%d</span>'
      '<div class="av" style="background:%s;width:40px;height:40px;font-size:14px">%s</div>'
      '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px">'
      '<span class="t1" style="font-size:15.5px;font-weight:700">%s</span><span class="tg">%s</span>'
      '<div class="sp"></div><span class="n pls %s" style="font-size:13.5px">%s</span></div>'
      '<div style="display:flex;align-items:center;gap:11px;margin:7px 0 9px">'
      '<span class="t2">Age <b style="color:var(--ink2)">%s</b></span>'
      '<span class="t2">Liquidity <b class="n" style="color:var(--ink2)">%s</b></span>'
      '<span class="t2">Holders <b class="n" style="color:var(--ink2)">%s</b></span></div>'
      '<div style="display:flex;align-items:center;gap:9px;background:var(--card2);border-radius:10px;padding:8px 11px;margin-bottom:8px">'
      '<span class="t2" style="flex:none">Safety</span>'
      '<div style="flex:1;height:5px;border-radius:99px;background:var(--card3);overflow:hidden">'
      '<i style="display:block;height:100%%;width:%s%%;border-radius:99px;background:%s"></i></div>'
      '<span class="n" style="font-size:13px;font-weight:800;color:%s;flex:none">%s</span></div>'
      '<div style="display:flex;gap:4px;flex-wrap:wrap">%s</div></div></div>'
      )%(rk,col,ini,nm,chain,'up' if up else 'dn',chg,age,liq,hold,sec,c,c,sec,
         ''.join('<span class="tg %s">%s</span>'%(k,t) for t,k in ch))

body='''<div class="pg" style="width:390px;height:1640px">
%s
<div class="bd">
  %s
  <div class="seg"><div class="on">Safest</div><div>Top gainers</div><div>Newest</div><div>Volume</div></div>
  %s
  <div class="cd p0" style="padding:2px 16px">%s</div>
  <div class="cd" style="background:#FFF9EC;box-shadow:none;border:1px solid #F3E3C2">
    <div style="display:flex;gap:11px">%s
      <div><div style="font-size:14px;font-weight:700;color:var(--wn);margin-bottom:6px">A safety score is not a buy signal</div>
      <div class="t2" style="color:#8A6420;line-height:1.8">The number comes from the contract alone: liquidity lock, mint authority, holder concentration and swap tax. A token scoring 82 can still go to zero. Anything under $10K liquidity is never indexed.</div></div></div>
  </div>
  <div class="cd">
    <div class="ch"><b>What gets checked</b></div>
    <div class="kv"><span>Honeypot</span><b class="t2">Simulated sell transaction</b></div>
    <div class="kv"><span>Liquidity lock</span><b class="t2">Lock contract and duration</b></div>
    <div class="kv"><span>Mint authority</span><b class="t2">Can new supply be printed</b></div>
    <div class="kv"><span>Holder concentration</span><b class="t2">Share held by the top 10 wallets</b></div>
    <div class="kv"><span>Buy / sell tax</span><b class="t2">Percentage taken on each swap</b></div>
  </div>
</div></div>'''%(header('Memecoins'),
  intro('Memecoin radar','314',
        'Fresh tokens on Solana, Base and BSC with an automatic contract audit — sorted by safety, not by hype.','tokens'),
  chips([('Solana',1),('Base',0),('BSC',0),('Liquidity over $100K',0),('LP locked',0)]), mm,
  ico(I['alert'],18,'var(--wn)'))
write('Memecoins.dc.html',body)
