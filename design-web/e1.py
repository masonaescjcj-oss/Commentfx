# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'/home/user/Commentfx/design-web')
from _e import *

def coinrow(sym,nm,col,ch,pts,c,pr,chg,up):
    return ('<div class="rw"><div class="av" style="background:%s">%s</div>'
      '<div style="min-width:0"><div class="t1">%s</div><div class="t2 n">%s</div></div>'
      '<div class="sp"></div>%s<div style="text-align:right;min-width:78px">'
      '<div class="n t1" style="font-weight:700">%s</div><div class="n pls %s">%s</div></div></div>'
      )%(col,ch,nm,sym,spark(pts,c,58,26),pr,'up' if up else 'dn',chg)

market=(coinrow('BTC','Bitcoin','#F7931A','₿',[30,28,31,29,33,35,34,37,36,39],'#14B87C','$67,412','+1.82%',1)
 +coinrow('ETH','Ethereum','#627EEA','Ξ',[40,39,41,38,37,38,36,35,36,34],'#E0393F','$3,204','−0.61%',0)
 +coinrow('XAUUSD','Gold','#C8A24A','Au',[30,31,30,32,33,32,34,33,35,36],'#14B87C','2,412.30','+0.41%',1)
 +coinrow('SOL','Solana','#9945FF','S',[20,22,21,25,27,26,30,33,32,36],'#14B87C','$158.90','+4.10%',1)
 +coinrow('EURUSD','Euro / Dollar','#2C6FD1','€',[35,34,36,33,32,33,31,30,31,29],'#E0393F','1.0842','−0.12%',0))

REG={'GB':'FCA','CY':'CySEC','SC':'FSA','AU':'ASIC','MU':'FSC','BZ':'FSC','ZA':'FSCA','VC':'FSA','MT':'MFSA'}
BK=[(1,'E','#FFD84D','#0D1421','Exness',['GB','CY','SC'],'8.9','0.7','Normal','var(--up)','Fastest verified withdrawals — 18 min median'),
    (2,'IC','#14304F','#fff','IC Markets',['AU','CY','SC'],'8.7','0.1','Normal','var(--up)','Lowest EUR/USD spread of all 42 brokers'),
    (3,'PP','#3E6FD9','#fff','Pepperstone',['AU','GB','CY'],'8.4','0.6','Normal','var(--up)','Best execution record under news volatility'),
    (4,'AL','#D4404F','#fff','Alpari',['MU'],'7.4','1.2','12 slow-withdrawal reports','var(--wn)','Offshore licence only — no compensation fund')]
bk=''
for rk,ini,bg,fg,nm,fl,sc,sp_,st,stc,why in BK:
    bk+=('<div class="rw" style="align-items:flex-start"><span class="rk%s">%d</span>'
      '<div class="sq" style="background:%s;color:%s">%s</div>'
      '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px">'
      '<span class="t1" style="font-weight:700">%s</span><span style="display:inline-flex;gap:3px">%s</span>'
      '<div class="sp"></div><span class="sc">%s</span></div>'
      '<div class="t2" style="margin:3px 0 5px">%s</div>'
      '<div style="display:flex;align-items:center;gap:9px">'
      '<span class="tg">Spread <b class="n" style="color:var(--ink)">%s</b></span>'
      '<span style="display:inline-flex;align-items:center;gap:4px"><i style="width:6px;height:6px;border-radius:50%%;background:%s;display:block"></i>'
      '<span class="t2" style="color:%s">%s</span></span></div></div></div>'
      )%(' top' if rk<=3 else '',rk,bg,fg,ini,nm,''.join(flag(f,15,11) for f in fl),sc,why,sp_,stc,
         'var(--ink3)' if stc=='var(--up)' else stc,st)

EX=[(1,'B','#F0B90B','#0D1421','Binance','0.10%','8.9','g','Proof of reserves'),
    (2,'CB','#1652F0','#fff','Coinbase','0.60%','8.7','g','Public company'),
    (3,'KR','#5741D9','#fff','Kraken','0.26%','8.5','g','Proof of reserves'),
    (4,'BY','#F7A600','#0D1421','Bybit','0.10%','8.2','g','Proof of reserves')]
ex=''.join('<div class="rw"><span class="rk%s">%d</span>'
  '<div class="sq" style="background:%s;color:%s">%s</div>'
  '<div style="min-width:0"><div class="t1" style="font-weight:700">%s</div>'
  '<div class="t2">Taker fee %s</div></div><div class="sp"></div>'
  '<span class="tg %s">%s</span><span class="sc">%s</span></div>'
  %(' top' if r<=3 else '',r,bg,fg,i,n,fee,k,note,s) for r,i,bg,fg,n,fee,s,k,note in EX)

MM=[('WIFHAT','#7C5CD6','W','Solana','1d','+86%',1,[('LP locked','g'),('Mint revoked','g'),('Top10 18%','g')],'82','g'),
    ('PEPE2','#2FA97C','P','Solana','3h','+412%',1,[('LP locked','g'),('Mint revoked','g'),('Top10 41%','w')],'68','w'),
    ('DOGEKING','#C0392B','D','BSC','40m','−31%',0,[('Honeypot risk','r'),('Top10 88%','r')],'14','r')]
mm=''.join('<div class="rw" style="align-items:flex-start">'
  '<div class="av" style="background:%s">%s</div><div style="flex:1;min-width:0">'
  '<div style="display:flex;align-items:center;gap:7px"><span class="t1" style="font-weight:700">%s</span>'
  '<span class="t2">%s · %s old</span><div class="sp"></div><span class="n pls %s">%s</span></div>'
  '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">%s'
  '<span class="tg b">Safety %s</span></div></div></div>'
  %(c,ini,n,ch,age,'up' if up else 'dn',chg,''.join('<span class="tg %s">%s</span>'%(k,t) for t,k in chips),sec)
  for n,c,ini,ch,age,chg,up,chips,sec,seck in MM)

NW=[('Decrypt','CySEC suspends a major broker licence; withdrawals frozen','12 min ago','linear-gradient(135deg,#1E3A5F,#0F1E33)'),
    ('Bloomberg','Bitcoin ETF sees a third straight day of net inflows','1 hr ago','linear-gradient(135deg,#14533C,#0B2A20)'),
    ('Reuters','FTMO changes its consistency rule — who it affects','3 hrs ago','linear-gradient(135deg,#5A3A14,#2E1E0B)')]
nw=''.join('<div class="rw" style="align-items:flex-start">'
  '<div style="flex:1;min-width:0"><div class="t2" style="margin-bottom:4px">%s</div>'
  '<div style="font-size:13.5px;font-weight:600;line-height:1.55;letter-spacing:-.01em">%s</div>'
  '<div class="t2" style="margin-top:5px">%s</div></div>'
  '<div style="width:74px;height:60px;border-radius:11px;background:%s;flex:none"></div></div>'
  %(src,t,ago,bg) for src,t,ago,bg in NW)

body='''<div class="pg" style="width:390px;height:3060px">
%s
<div class="bd">
  <div style="border-radius:var(--r);overflow:hidden;position:relative;height:210px;box-shadow:var(--sh);
       background:linear-gradient(150deg,#22304A 0%%,#121B2C 55%%,#0B1220 100%%)">
    <div style="position:absolute;inset:0;background:radial-gradient(120%% 80%% at 20%% 0%%,rgba(168,117,40,.28),transparent 60%%)"></div>
    <div style="position:absolute;inset:auto 0 0 0;padding:16px 17px 17px;background:linear-gradient(to top,rgba(6,10,18,.94),rgba(6,10,18,.5) 55%%,transparent)">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px">
        <span style="font-size:10.5px;font-weight:700;color:#0D1421;background:#fff;padding:2px 8px;border-radius:6px">INVESTIGATION</span>
        <span style="font-size:11px;color:rgba(255,255,255,.7)">12 min ago</span></div>
      <div class="dp" style="font-size:20px;font-weight:700;color:#fff;line-height:1.32;text-wrap:balance">
        Which brokers advertise an FCA licence but register you offshore?</div></div></div>

  <div style="display:flex;gap:11px">
    <div class="cd" style="flex:1;padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">
        <div class="av" style="background:#F7931A;width:30px;height:30px">₿</div><span class="t2 n">BTC</span></div>
      <div class="t2">Bitcoin</div>
      <div class="n dp" style="font-size:24px;font-weight:700;margin:1px 0 9px">$67,412</div>
      <span class="pl u">▲ 1.82%%</span></div>
    <div class="cd" style="flex:1;padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">
        <div class="av" style="background:#C8A24A;width:30px;height:30px;font-size:11px">Au</div><span class="t2 n">XAU</span></div>
      <div class="t2">Gold</div>
      <div class="n dp" style="font-size:24px;font-weight:700;margin:1px 0 9px">2,412.30</div>
      <span class="pl u">▲ 0.41%%</span></div>
  </div>

  <div class="cd">
    <div class="ch"><b>Top brokers</b><a>Full ranking %s</a></div>%s
    <div style="margin-top:12px;padding-top:11px;border-top:1px solid var(--line2);display:flex;align-items:center;gap:8px">
      %s<span class="t2" style="line-height:1.6">Scores come from six public components and never change for money.</span></div>
  </div>

  <div class="cd p0" style="overflow:hidden">
    <div style="padding:15px 16px 12px;display:flex;align-items:center;gap:10px">
      <div class="av" style="background:#F7931A;width:34px;height:34px;font-size:14px">₿</div>
      <div><div style="display:flex;align-items:baseline;gap:6px">
        <span class="t1" style="font-size:15px;font-weight:700">Bitcoin</span><span class="t2 n">BTC</span></div>
        <div style="display:flex;align-items:center;gap:9px;margin-top:2px">
          <span class="n dp" style="font-size:25px;font-weight:700">$67,412</span>
          <span class="pl u">▲ 1.82%%</span></div></div></div>
    <div style="padding:0 0 2px">%s</div>
    <div style="display:flex;border-top:1px solid var(--line2)">
      <div style="flex:1;padding:13px 16px"><div class="t2">Market cap</div>
        <div class="n" style="font-size:14px;font-weight:700;margin-top:1px">$1,331,042,806</div></div>
      <div style="flex:1;padding:13px 16px;border-left:1px solid var(--line2)"><div class="t2">24h volume</div>
        <div class="n" style="font-size:14px;font-weight:700;margin-top:1px">$41,392,793,845</div></div></div>
  </div>

  <div class="cd"><div class="ch"><b>Markets</b><a>All %s</a></div>%s</div>
  <div class="cd"><div class="ch"><b>Top exchanges</b><a>Full ranking %s</a></div>%s</div>

  <div class="cd">
    <div class="ch"><b>Memecoin radar</b><span class="lv"><i></i>last 24h</span></div>%s
    <div style="margin-top:12px;padding:10px 12px;background:var(--wnbg);border-radius:11px;display:flex;gap:8px">
      %s<span class="t2" style="color:#8A6420;line-height:1.65">Safety is a contract audit, not a price call. A high score can still go to zero.</span></div>
  </div>

  <div class="cd"><div class="ch"><b>News</b><a>All %s</a></div>%s</div>

  <div class="cd">
    <div class="ch"><b>Today's calendar</b><a>This week %s</a></div>
    <div style="background:var(--dnbg);border-radius:12px;padding:11px 12px;display:flex;align-items:center;gap:11px;margin-bottom:10px">
      <div style="text-align:center;flex:none"><div class="n" style="font-size:13px;font-weight:800;color:var(--dn)">16:00</div>
        <div class="t2" style="font-size:9.5px;color:var(--dn)">in 1:28</div></div>
      <div style="width:1px;height:30px;background:rgba(224,57,63,.22);flex:none"></div>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700">US Non-Farm Payrolls</div>
        <div class="t2 n" style="margin-top:1px">Forecast 185K · Previous 216K</div></div>
      <span class="tg r">High</span></div>
    <div class="rw"><div class="n t2" style="width:40px;flex:none">17:45</div><span class="tg">USD</span>
      <span style="font-size:13px;flex:1">Services PMI</span><span class="n t2">51.2 / 51.7</span></div>
    <div class="rw"><div class="n t2" style="width:40px;flex:none">21:00</div><span class="tg">USD</span>
      <span style="font-size:13px;flex:1">Baker Hughes rig count</span><span class="n t2">486 / 484</span></div>
  </div>
</div></div>'''%(header(''),ico(I['fwd'],13),bk,ico(I['shld'],15,'var(--ink3)'),
  spark([26,24,27,25,29,31,28,33,30,35,33,38,36,41,39,44,42,47,45,50],'#14B87C',390,96,True,2.2),
  ico(I['fwd'],13),market,ico(I['fwd'],13),ex,mm,ico(I['alert'],15,'var(--wn)'),ico(I['fwd'],13),nw,ico(I['fwd'],13))
write('Main.dc.html',body)
