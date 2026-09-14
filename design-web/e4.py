# -*- coding: utf-8 -*-
import sys; sys.path.insert(0,'/home/user/Commentfx/design-web')
from _e import *

MB=[('Regulation & compliance','9.4',94,'var(--up)'),('Trading cost','9.1',91,'var(--up)'),
    ('Withdrawal speed','9.6',96,'var(--up)'),('Execution & uptime','8.2',82,'var(--br)')]
mb=''.join('<div class="mtr" style="flex:1 1 calc(50%% - 5px)">'
  '<div class="bar"><i style="width:%d%%;background:%s"></i></div>'
  '<div style="display:flex;align-items:baseline;gap:6px"><span style="font-size:12.5px;line-height:1.45;flex:1">%s</span>'
  '<span class="n" style="font-size:15px;font-weight:800">%s</span></div></div>'%(p,c,n,v) for n,v,p,c in MB)

RG=[('GB','FCA','730729','Authorised','g','A'),('CY','CySEC','178/12','Authorised','g','A'),
    ('ZA','FSCA','51024','Authorised','g','B'),('SC','FSA Seychelles','SD025','Registered','w','C')]
rg=''.join('<div class="rw" style="gap:10px">'
  '<span style="width:22px;height:20px;border-radius:5px;background:%s;color:%s;display:grid;place-items:center;'
  'font-size:10.5px;font-weight:800;flex:none">%s</span>%s'
  '<div style="min-width:0"><span class="t1" style="font-weight:700">%s</span> '
  '<span class="t2 n">%s</span></div><div class="sp"></div>'
  '<span class="tg %s">%s</span>%s</div>'
  %({'A':'#E4F7EF','B':'#FDF3DC','C':'#F1F2F4'}[g],{'A':'#0F8A5C','B':'#8A5A07','C':'#58667E'}[g],g,
    flag(code,20,14),body_,lic,stk,st,ico(I['fwd'],15,'#C3CAD6')) for code,body_,lic,st,stk,g in RG)

ENT=[('Exness (SC) Ltd','SC','FSA Seychelles','No investor compensation scheme',1),
     ('Exness (CY) Ltd','CY','CySEC','ICF cover up to €20,000',0),
     ('Exness (UK) Ltd','GB','FCA','FSCS cover up to £85,000',0)]
ent=''
for nm,code,reg,prot,me in ENT:
    if me:
        ent+=('<div style="border:1.5px solid var(--wn);background:#FFFBF1;border-radius:13px;padding:12px 13px;margin-bottom:8px">'
          '<div style="display:flex;align-items:center;gap:8px">%s<span class="t1" style="font-weight:700">%s</span>'
          '<div class="sp"></div><span style="font-size:10.5px;font-weight:800;color:#fff;background:var(--wn);padding:2px 9px;border-radius:6px">YOU</span></div>'
          '<div style="display:flex;align-items:center;gap:7px;margin-top:9px">%s'
          '<span style="font-size:12px;color:var(--wn);font-weight:700">%s</span></div>'
          '<div class="t2" style="margin-top:3px">Disputes handled by %s</div></div>'
          )%(flag(code,20,14),nm,ico(I['alert'],15,'var(--wn)',2),prot,reg)
    else:
        ent+=('<div style="border:1px solid var(--line);border-radius:13px;padding:12px 13px;margin-bottom:8px;background:var(--card2)">'
          '<div style="display:flex;align-items:center;gap:8px">%s<span class="t1" style="font-weight:600;color:var(--ink2)">%s</span></div>'
          '<div style="display:flex;align-items:center;gap:7px;margin-top:8px">%s'
          '<span style="font-size:11.5px;color:var(--up)">%s</span></div>'
          '<div class="t2" style="margin-top:3px">Disputes handled by %s</div></div>'
          )%(flag(code,20,14),nm,ico(I['shld'],14,'var(--up)',2),prot,reg)

SP=[('EUR/USD','0.7','0.9','3'),('XAU/USD','1.4','1.8','5'),('GBP/USD','1.1','1.2','7'),('BTC/USD','24','31','2')]
spr=''.join('<div class="rw"><span class="t1" style="font-weight:600;width:78px;flex:none">%s</span>'
  '%s<div class="sp"></div><span class="t2 n" style="margin-right:10px">30d avg %s</span>'
  '<span class="n" style="font-size:15px;font-weight:800;color:var(--up);margin-right:9px">%s</span>'
  '<span class="tg b">#%s</span></div>'%(s,spark([3,4,3,5,4,6,5,4,5,4],'#14B87C',52,20,False,1.6),a,l,r) for s,l,a,r in SP)

dist=[('under 15m',62),('15–60m',24),('1–6h',9),('over 6h',5)]
wd=''.join('<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">'
  '<div class="n" style="font-size:11px;color:var(--ink2);font-weight:700">%d%%</div>'
  '<div style="width:100%%;height:%dpx;border-radius:6px 6px 0 0;background:linear-gradient(to top,#BFE9D8,#14B87C)"></div>'
  '<div class="t2" style="font-size:9.5px">%s</div></div>'%(p,12+p*0.78,l) for l,p in dist)

REV=[('M','#3E6FD9','Marco R.','4 days ago',5,'USDT withdrawal cleared in under 10 minutes. Gold spread widens around news but stays reasonable.','Standard account · 8 months',None),
     ('N','#7C5CD6','Nina K.','2 weeks ago',3,'Execution is fast but I got heavy slippage during NFP. Support replied, just slowly.','Cent account · 3 months',
      'Thanks for the feedback. Spreads are floating during news releases — for news scalping we recommend a Raw account.')]
rev=''
for ini,col,nm,dt,st,txt,meta,reply in REV:
    rp=('<div style="margin-top:10px;padding:10px 12px;background:var(--card2);border-radius:11px">'
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">%s'
      '<span style="font-size:11.5px;font-weight:700">Official reply from Exness</span></div>'
      '<div class="t2" style="color:var(--ink2);line-height:1.8">%s</div></div>')%(ico(I['shld'],13,'var(--br)',2),reply) if reply else ''
    rev+=('<div class="rw" style="flex-direction:column;align-items:stretch;gap:0;padding:14px 0">'
      '<div style="display:flex;align-items:center;gap:10px">'
      '<div class="av" style="background:%s;width:30px;height:30px">%s</div>'
      '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px">'
      '<span class="t1" style="font-size:13.5px">%s</span>'
      '<span class="tg g" style="display:inline-flex;align-items:center;gap:3px">%s Verified</span></div>'
      '<div class="t2">%s</div></div>%s</div>'
      '<div class="t3" style="margin-top:9px">%s</div>'
      '<div class="t2" style="margin-top:5px">%s</div>%s</div>'
      )%(col,ini,nm,ico(I['chk'],9,'var(--up)',3),dt,stars(st,12),txt,meta,rp)

ALT=[('IC','#14304F','#fff','IC Markets','Tighter spread · $200 minimum','8.7'),
     ('PP','#3E6FD9','#fff','Pepperstone','Better news execution','8.4'),
     ('RB','#7C5CD6','#fff','RoboForex','Higher leverage · no FCA','7.9')]
alt=''.join('<div class="rw"><div class="sq" style="background:%s;color:%s">%s</div>'
  '<div style="min-width:0"><div class="t1" style="font-weight:600">%s</div><div class="t2">%s</div></div>'
  '<div class="sp"></div><span class="sc">%s</span>%s</div>'%(bg,fg,i,n,d,s,ico(I['fwd'],15,'#C3CAD6')) for i,bg,fg,n,d,s in ALT)

body='''<div class="pg" style="width:390px;height:3240px">
  <div class="hdr"><div class="hbar">
    <div class="ib" style="margin-left:-6px">%s</div>
    <div class="lg" style="font-size:14px"><span class="lgm" style="width:22px;height:22px;font-size:8px">FX</span>CommentFX</div>
    <div class="sp"></div><div class="ib">%s</div><div class="ib">%s</div></div></div>
<div class="bd">

  <div class="cd">
    <div style="display:flex;gap:14px;align-items:flex-start">
      <div style="width:64px;height:64px;border-radius:16px;background:#FFD84D;display:grid;place-items:center;
           font-weight:800;font-size:23px;color:#0D1421;flex:none">E</div>
      <div style="flex:1;min-width:0">
        <span class="tg b" style="font-size:10px;font-weight:700">WELL-PERFORMING BROKER</span>
        <div class="dp" style="font-size:23px;font-weight:700;margin-top:8px">Exness</div>
        <div style="display:flex;align-items:center;gap:9px;margin-top:7px">
          %s<span class="n" style="font-size:17px;font-weight:800;color:var(--br)">8.9</span>
          <a style="font-size:12px">214 reviews %s</a></div></div></div>
    <div style="display:flex;flex-wrap:wrap;margin-top:15px;border-top:1px solid var(--line2);padding-top:4px">
      <div style="flex:1 1 50%%;padding:8px 0"><div class="t2">Founded</div><div class="n" style="font-size:14px;font-weight:700">2008</div></div>
      <div style="flex:1 1 50%%;padding:8px 0"><div class="t2">Min deposit</div><div class="n" style="font-size:14px;font-weight:700">$10</div></div>
      <div style="flex:1 1 50%%;padding:8px 0"><div class="t2">Headquarters</div><div style="font-size:14px;font-weight:700">Cyprus</div></div>
      <div style="flex:1 1 50%%;padding:8px 0"><div class="t2">Max leverage</div><div class="n" style="font-size:14px;font-weight:700">1:2000</div></div></div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:11px;padding:9px 12px;background:var(--upbg);border-radius:11px">
      <i style="width:7px;height:7px;border-radius:50%%;background:var(--up);flex:none"></i>
      <span style="font-size:12px;color:#0F8A5C;font-weight:700">Status last 24h: normal</span>
      <div class="sp"></div><span class="t2" style="color:#0F8A5C">0 incident reports</span></div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:10px">%s</div>

  <div class="cd" style="padding:4px 16px"><div style="display:flex">%s</div></div>

  <div style="display:flex;gap:10px">
    <div class="btn2" style="flex:1">%s Compare</div>
    <div class="btn" style="flex:1.4">Open account</div></div>
  <div class="t2" style="text-align:center;margin-top:-4px;font-size:10.5px;line-height:1.7">
    Affiliate link. The rank and score above do not change because of it.</div>

  <div class="cd">
    <div class="ch"><b>Regulation</b><span class="t2">4 active licences</span></div>%s
    <div class="t2" style="margin-top:10px;line-height:1.75">Grades A–C reflect how strict the regulator is and what protection it actually gives clients.</div></div>

  <div class="cd" style="border:1.5px solid var(--br);box-shadow:none">
    <div class="ch" style="margin-bottom:11px"><b>Which entity will you be under?</b></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:13px">
      <span class="t2">Your country</span>
      <div style="display:inline-flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--line);
           border-radius:10px;padding:7px 12px;font-size:13px;font-weight:600">%s Singapore %s</div></div>
    %s
    <div class="t2" style="margin-top:4px;line-height:1.8">The FCA licence is shown in the broker's advertising, but clients outside the UK and EEA are onboarded to the Seychelles entity — which means no compensation scheme sits behind your balance.</div></div>

  <div class="cd">
    <div class="ch"><b>Live spreads</b><span class="lv"><i></i>every 60s</span></div>%s
    <div class="t2" style="margin-top:10px">Averaged from a demo account on the London server · rank across all 42 brokers</div></div>

  <div class="cd">
    <div class="ch"><b>Real withdrawal times</b><span class="t2 n">340 reports · 90 days</span></div>
    <div style="display:flex;align-items:flex-end;gap:10px;margin-bottom:16px">
      <div class="n dp" style="font-size:36px;font-weight:700;line-height:1;color:var(--up)">18</div>
      <div style="padding-bottom:4px"><div style="font-size:14px;font-weight:700">minutes</div>
      <div class="t2">median time to withdraw</div></div></div>
    <div style="display:flex;gap:8px;align-items:flex-end;height:96px">%s</div>
    <div style="margin-top:14px;border-top:1px solid var(--line2);padding-top:4px">
      <div class="kv"><span>USDT (TRC20)</span><b class="n up">~12 min</b></div>
      <div class="kv"><span>Bank transfer</span><b class="n" style="color:var(--wn)">~2 hrs</b></div>
      <div class="kv"><span>Card refund</span><b class="n up">~20 min</b></div></div></div>

  <div class="cd">
    <div class="ch"><b>Verified reviews</b><a>See all %s</a></div>
    <div style="display:flex;align-items:center;gap:14px;padding-bottom:12px;border-bottom:1px solid var(--line2)">
      <div class="n dp" style="font-size:32px;font-weight:700">4.3</div>
      <div>%s<div class="t2" style="margin-top:2px">Only from users who uploaded an account statement</div></div></div>
    %s</div>

  <div class="cd"><div class="ch"><b>Alternatives</b></div>%s</div>
</div>

<div style="position:sticky;bottom:0;background:var(--card);border-top:1px solid var(--line);
     padding:11px 16px 14px;display:flex;gap:12px;align-items:center;flex:none">
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:none;padding:0 4px">
    %s<span class="t2" style="font-size:9.5px">Compare</span></div>
  <div class="btn g" style="flex:1;padding:12px">%s Write a review</div>
</div>
</div>'''%(ico(I['back'],19),ico(I['heart'],19),ico(I['share'],19),stars(4,15),ico(I['fwd'],12),mb,
  ''.join('<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0;%s">%s'
    '<span class="t2" style="font-size:11px">%s</span></div>'
    %('border-right:1px solid var(--line2)' if i<2 else '',ico(k,19,'var(--ink2)'),lbl)
    for i,(k,lbl) in enumerate([(I['glob'],'Website'),(I['phone'],'Phone'),(I['mail'],'Contact')])),
  ico(I['scale'],17),rg,flag('SG',18,13),ico(I['down'],12),ent,spr,wd,ico(I['fwd'],12),stars(4,14),rev,alt,
  ico(I['scale'],20,'var(--ink2)'),ico(I['pen'],16,'#fff'))
write('BrokerDetail.dc.html',body)
