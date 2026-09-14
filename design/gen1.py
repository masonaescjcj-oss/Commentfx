# -*- coding: utf-8 -*-
import sys; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *

# ---------------------------------------------------------------- HOME
tick = ''.join('<span style="display:inline-flex;gap:6px;align-items:center;font-size:11px;color:var(--ink2);flex:none">%s <b class="n %s" style="font-weight:700">%s</b></span>' % t
  for t in [('BTC','up','67,412 ▲1.8%'),('ETH','dn','3,204 ▼0.6%'),('XAU','up','2,412.3 ▲0.4%'),('EUR/USD','dn','1.0842 ▼0.1%'),('DXY','up','104.62'),('SOL','up','158.9 ▲4.1%')])

mkt = ''
for nm,sym,col,bg,pts,c,pr,ch,up in [
  ('Bitcoin','BTC','#F7931A','#F7931A',[30,28,31,29,33,35,34,37,36,39],'var(--up)','$67,412','+1.82%',1),
  ('Gold','XAUUSD','#D9B071','#D9B071',[30,31,30,32,33,32,34,33,35,36],'var(--up)','2,412.30','+0.41%',1),
  ('EUR/USD','Forex','#5FC9C0','#5FC9C0',[35,34,36,33,32,33,31,30,31,29],'var(--dn)','1.0842','−0.12%',0)]:
    mkt += ('<div class="rw"><div class="av" style="background:%s">%s</div>'
      '<div style="min-width:0"><div class="t1">%s</div><div class="t2 n">%s</div></div><div class="sp"></div>'
      '%s<div style="text-align:left"><div class="n t1" style="font-weight:700">%s</div>'
      '<div class="n t2 %s" style="font-weight:600">%s</div></div></div>'
      ) % (bg, sym[0], nm, sym, spark(pts,c,52,24), pr, 'up' if up else 'dn', ch)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd">
    <div class="lg"><span class="lgm">FX</span>CommentFX</div><div class="sp"></div>
    <div class="ic">%s</div><div class="ic" style="position:relative">%s<i style="position:absolute;top:8px;right:9px;width:6px;height:6px;border-radius:50%%;background:var(--dn)"></i></div>
  </div>
  <div style="display:flex;gap:16px;padding:0 16px 10px;overflow:hidden;flex:none;border-bottom:1px solid var(--ln)">%s</div>
  <div class="bd" style="padding-top:12px">

    <div class="cd" style="background:linear-gradient(160deg,#18202C,#12161E);border-color:#2C3648">
      <div class="ch"><b>رادار ریسک امروز</b><span class="lv"><i></i>زنده</span></div>
      <div style="display:flex;align-items:flex-end;gap:10px">
        <div class="n" style="font-size:44px;font-weight:800;letter-spacing:-.04em;line-height:.9">72</div>
        <div style="padding-bottom:5px"><div class="n t2" style="font-size:11px">/100</div><div style="font-size:12px;font-weight:700;color:var(--dn)">ریسک بالا</div></div>
        <div class="sp"></div>
        <div style="text-align:left"><div class="t2">تا NFP</div><div class="n" style="font-size:16px;font-weight:800;color:var(--br)">01:28</div></div>
      </div>
      <div style="height:6px;border-radius:99px;background:linear-gradient(to left,var(--up),var(--wn),var(--dn));position:relative;margin:12px 0 10px">
        <i style="position:absolute;top:-4px;right:72%%;width:14px;height:14px;border-radius:50%%;background:var(--ink);border:3px solid #12161E;transform:translateX(50%%)"></i>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <span class="tg" style="border-color:#4A2B2B;color:var(--dn);background:var(--dns)">NFP · 16:00</span>
        <span class="tg" style="border-color:#4A3E22;color:var(--wn);background:var(--wns)">آنلاک ARB $420M</span>
        <span class="tg">انقضای آپشن BTC</span>
      </div>
    </div>

    <div style="display:flex;gap:9px">
      <div class="cd" style="flex:1;padding:11px 12px"><div class="t2">ترس و طمع</div>
        <div class="n up" style="font-size:22px;font-weight:800;letter-spacing:-.03em;margin-top:2px">64</div><div class="t2">طمع</div></div>
      <div class="cd" style="flex:1;padding:11px 12px"><div class="t2">تتر / تومان</div>
        <div class="n" style="font-size:22px;font-weight:800;letter-spacing:-.03em;margin-top:2px">62,410</div><div class="t2 up">+0.4%%</div></div>
      <div class="cd" style="flex:1;padding:11px 12px"><div class="t2">جلسهٔ فعال</div>
        <div style="font-size:17px;font-weight:800;margin-top:4px;color:var(--up)">لندن</div><div class="t2 n">14:32</div></div>
    </div>

    <div class="cd">
      <div class="ch"><b>تقویم امروز</b><a>هفته ›</a></div>
      <div style="background:var(--dns);border:1px solid #4A2B2B;border-radius:10px;padding:9px 10px;display:flex;align-items:center;gap:9px;margin-bottom:8px">
        <div class="n" style="font-size:12px;font-weight:700;color:var(--dn)">16:00</div>
        <div style="display:flex;gap:2px">%s</div>
        <div style="font-size:12.5px;font-weight:600">NFP · اشتغال غیرکشاورزی</div>
        <div class="sp"></div><div class="n t2">185K / 216K</div>
      </div>
      <div style="display:flex;align-items:center;gap:9px;padding:4px 2px"><div class="n t2" style="width:38px">17:45</div>
        <div style="display:flex;gap:2px">%s</div><div style="font-size:12.5px;color:var(--ink2)">PMI خدمات آمریکا</div>
        <div class="sp"></div><div class="n t2">51.2 / 51.7</div></div>
      <div style="margin-top:9px;padding:9px 10px;background:var(--sf2);border-radius:10px;font-size:11.5px;color:var(--ink2);line-height:1.75">
        <b style="color:var(--br)">یعنی چه:</b> زیر ۱۵۰K یعنی بازار قطع نرخ سپتامبر را قیمت‌گذاری می‌کند — دلار ضعیف، طلا بالا.</div>
    </div>

    <div class="cd" style="padding-bottom:6px"><div class="ch"><b>بازار</b><a>همه ›</a></div>%s</div>
  </div>
  %s
</div>''' % (ico(I['srch'],19), ico(I['bell'],19), tick,
   '<i style="width:4px;height:11px;border-radius:1px;background:var(--dn);display:block"></i>'*3,
   '<i style="width:4px;height:11px;border-radius:1px;background:%s;display:block"></i>'%'var(--wn)'*1 + '<i style="width:4px;height:11px;border-radius:1px;background:var(--wn);display:block"></i><i style="width:4px;height:11px;border-radius:1px;background:var(--ln);display:block"></i>',
   mkt, tabbar('home'))
write('Main.dc.html', body)

# ---------------------------------------------------------------- BROKER LIST
BR = [
 ('E','#FFD84D','Exness','اکسنس',['FCA','CySEC','FSA'],'8.9','0.7','up','عادی','var(--up)','$10','1:2000',1),
 ('IC','#2E3A4D','IC Markets','آی‌سی مارکتس',['ASIC','CySEC','FSA'],'8.7','0.1','up','عادی','var(--up)','$200','1:500',1),
 ('AM','#4A7BD9','Amarkets','آمارکتس',['FSC-MU'],'8.1','0.9','up','عادی','var(--up)','$100','1:1000',0),
 ('AL','#D94A5C','Alpari','آلپاری',['FSC-MU'],'7.4','1.2','dn','۱۲ گزارش تأخیر برداشت','var(--wn)','$20','1:1000',0),
 ('LF','#3FA98C','LiteFinance','لایت فایننس',['CySEC','FSC-SVG'],'6.8','1.4','dn','اختلال MT5','var(--dn)','$50','1:1000',0),
 ('RB','#8A6BD9','RoboForex','روبوفارکس',['FSC-BZ'],'7.9','1.1','up','عادی','var(--up)','$10','1:2000',0),
]
rows = ''
for ini,col,en,fa,regs,sc,sp_,d,st,stc,mind,lev,ck in BR:
    regtags = ' '.join('<span class="tg">%s</span>'%r for r in regs)
    box = ('<div style="width:19px;height:19px;border-radius:6px;border:1.5px solid %s;background:%s;display:grid;place-items:center;flex:none;color:#0B0E14">%s</div>'
           % (('var(--br)','var(--br)',ico(I['chk'],12,'#0B0E14',2.6)) if ck else ('var(--ln)','transparent','')))
    rows += ('<div style="display:flex;gap:11px;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--ln)">'
      '%s'
      '<div style="width:38px;height:38px;border-radius:11px;background:%s;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:13px;color:#0B0E14;flex:none">%s</div>'
      '<div style="flex:1;min-width:0">'
        '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:14px;font-weight:700;direction:ltr;font-family:Manrope">%s</span>'
        '<span class="t2">%s</span><div class="sp"></div><span class="sc">%s</span></div>'
        '<div style="display:flex;gap:4px;margin:4px 0 5px;flex-wrap:wrap">%s</div>'
        '<div style="display:flex;align-items:center;gap:11px">'
          '<span class="t2">اسپرد <b class="n %s" style="font-size:12px;font-weight:700">%s</b></span>'
          '<span class="t2">حداقل <b class="n" style="color:var(--ink2)">%s</b></span>'
          '<span class="t2">اهرم <b class="n" style="color:var(--ink2)">%s</b></span>'
          '<div class="sp"></div>'
          '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:6px;height:6px;border-radius:50%%;background:%s;flex:none"></i>'
          '<span class="t2" style="color:%s">%s</span></span></div>'
      '</div></div>') % (box, col, ini, en, fa, sc, regtags, d, sp_, mind, lev, stc, stc if stc!='var(--up)' else 'var(--mut)', st)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><div class="ic">%s</div><b style="font-size:15px;font-weight:700">انتخاب بروکر</b><div class="sp"></div><div class="ic">%s</div></div>
  <div style="padding:0 16px 10px;flex:none">
    <div style="display:flex;align-items:center;gap:9px;background:var(--sf);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;color:var(--mut)">
      %s<span style="font-size:13px">جستجوی بروکر…</span></div>
  </div>
  <div class="fl" style="padding:0 16px 11px;flex:none">
    <span class="on">واریز ریالی</span><span>رگولاتور معتبر</span><span>اسکالپ آزاد</span><span>حساب اسلامی</span><span>MT5</span>
  </div>
  <div style="display:flex;align-items:center;padding:0 16px 4px;flex:none">
    <span class="t2"><b class="n" style="color:var(--ink2)">42</b> بروکر · <b style="color:var(--br)">۱۲</b> با واریز ریالی</span>
    <div class="sp"></div><span class="t2" style="display:inline-flex;gap:5px;align-items:center">مرتب‌سازی: <b style="color:var(--ink2)">امتیاز</b>%s</span>
  </div>
  <div style="flex:1;padding:0 16px;overflow:hidden">%s</div>
  <div style="padding:10px 16px;background:linear-gradient(to top,var(--bg) 70%%,transparent);flex:none;display:flex;gap:9px;align-items:center;margin-top:-14px;position:relative">
    <span class="t2" style="flex:none">۲ بروکر انتخاب شد</span>
    <div class="btn" style="flex:1;padding:11px">مقایسه کن</div>
  </div>
  %s
</div>''' % (ico(I['back'],19), ico(I['filt'],19), ico(I['srch'],17),
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
      rows, tabbar('grid'))
write('Brokers.dc.html', body)
