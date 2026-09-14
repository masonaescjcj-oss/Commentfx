# -*- coding: utf-8 -*-
import sys, re; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *

# ============================================================= WEB HOME
tick=''.join('<span style="display:inline-flex;gap:6px;align-items:center;font-size:11.5px;color:var(--ink2);flex:none">%s <b class="n %s" style="font-weight:700">%s</b></span>'%t
  for t in [('BTC','up','$67,412 ▲1.8%'),('ETH','dn','$3,204 ▼0.6%'),('XAUUSD','up','2,412.30 ▲0.4%'),('EURUSD','dn','1.0842 ▼0.1%'),
            ('DXY','up','104.62 ▲0.2%'),('SOL','up','$158.9 ▲4.1%'),('USDT/IRR','up','62,410 ▲0.4%'),('US30','dn','38,942 ▼0.3%')])
links=''.join('<span style="font-size:13.5px;color:%s;font-weight:%s">%s</span>'%('var(--ink)' if i==0 else 'var(--ink2)','700' if i==0 else '500',t)
  for i,t in enumerate(['هوم','بروکرها','پراپ‌ها','صرافی‌ها','کوین‌ها','سیگنال‌ها','تقویم','مقالات']))

def mrow(sym,nm,col,pts,c,pr,ch,up):
    return ('<div class="rw"><div class="av" style="background:%s">%s</div><div style="min-width:0"><div class="t1">%s</div>'
      '<div class="t2 n">%s</div></div><div class="sp"></div>%s<div style="text-align:left">'
      '<div class="n t1" style="font-weight:700">%s</div><div class="n t2 %s" style="font-weight:600">%s</div></div></div>'
      )%(col,sym[0],nm,sym,spark(pts,c,58,24),pr,'up' if up else 'dn',ch)
mkt=(mrow('BTC','Bitcoin','#F7931A',[30,28,31,29,33,35,34,37,36,39],'#3DD68C','$67,412','+1.82%',1)
 +mrow('ETH','Ethereum','#627EEA',[40,39,41,38,37,38,36,35,36,34],'#FF6B6B','$3,204','−0.61%',0)
 +mrow('XAUUSD','Gold','#D9B071',[30,31,30,32,33,32,34,33,35,36],'#3DD68C','2,412.30','+0.41%',1)
 +mrow('SOL','Solana','#9945FF',[20,22,21,25,27,26,30,33,32,36],'#3DD68C','$158.9','+4.10%',1)
 +mrow('EUR','EUR/USD','#5FC9C0',[35,34,36,33,32,33,31,30,31,29],'#FF6B6B','1.0842','−0.12%',0))

BK=[('E','#FFD84D','Exness',['FCA','CySEC','FSA'],'0.7','8.9','عادی','var(--up)'),
    ('IC','#2E3A4D','IC Markets',['ASIC','CySEC'],'0.1','8.7','عادی','var(--up)'),
    ('AM','#4A7BD9','Amarkets',['FSC-MU'],'0.9','8.1','عادی','var(--up)'),
    ('AL','#D94A5C','Alpari',['FSC-MU'],'1.2','7.4','۱۲ گزارش تأخیر','var(--wn)'),
    ('LF','#3FA98C','LiteFinance',['CySEC'],'1.4','6.8','اختلال MT5','var(--dn)')]
bk=''.join('<div class="rw"><div class="av" style="background:%s">%s</div>'
  '<div style="min-width:0"><div class="t1 n">%s</div><div style="display:flex;gap:4px;margin-top:3px">%s</div></div>'
  '<div class="sp"></div><div style="display:flex;align-items:center;gap:5px;margin-left:18px"><i style="width:6px;height:6px;border-radius:50%%;background:%s"></i><span class="t2">%s</span></div>'
  '<div style="text-align:left;margin-left:18px"><div class="n t1" style="font-weight:700">%s</div><div class="t2">EURUSD</div></div>'
  '<span class="sc">%s</span></div>'%(c,i,n,' '.join('<span class="tg">%s</span>'%r for r in rg),sc_,st,sp_,s)
  for i,c,n,rg,sp_,s,st,sc_ in BK)

EVW=[('16:00','USD',3,'var(--dn)','NFP · اشتغال غیرکشاورزی','185K / 216K',1),
     ('16:00','USD',3,'var(--dn)','نرخ بیکاری','3.9% / 3.9%',0),
     ('17:45','USD',2,'var(--wn)','PMI خدمات','51.2 / 51.7',0),
     ('21:00','USD',1,'var(--mut)','دکل‌های نفتی','486 / 484',0)]
evw=''.join('<div class="rw" style="%s"><span class="n t2" style="width:40px;flex:none;%s">%s</span>'
  '<span class="n t2" style="width:32px;flex:none;font-weight:700">%s</span>'
  '<div style="display:flex;gap:2px;flex:none">%s</div>'
  '<span style="font-size:12.5px;flex:1;font-weight:%s">%s</span><span class="n t2">%s</span></div>'
  %('background:var(--dns);margin:0 -8px;padding:9px 8px;border-radius:9px;border-bottom:0' if hl else '',
    'color:var(--dn);font-weight:700' if hl else '', tm, cur,
    ''.join('<i style="width:4px;height:10px;border-radius:1px;background:%s;display:block"></i>'%(c if k<im else 'var(--ln)') for k in range(3)),
    '700' if hl else '500', nm, val) for tm,cur,im,c,nm,val,hl in EVW)

NW=[('رگولاتوری','CySEC لایسنس یک بروکر بزرگ را تعلیق کرد؛ برداشت‌ها متوقف شد','۱۲ دقیقه پیش','#2A3446'),
    ('کریپتو','ورودی ETF بیت‌کوین سومین روز متوالی مثبت شد','۱ ساعت پیش','#14332A'),
    ('پراپ','FTMO قانون consistency را تغییر داد — چه کسانی متأثر می‌شوند','۳ ساعت پیش','#332914')]
nw=''.join('<div class="rw" style="align-items:flex-start"><div style="width:62px;height:48px;border-radius:9px;background:%s;flex:none"></div>'
  '<div><div style="font-size:12.5px;font-weight:600;line-height:1.6">%s</div><div class="t2" style="margin-top:3px">%s · %s</div></div></div>'
  %(bg,t,cat,ago) for cat,t,ago,bg in NW)

body = '''<div style="width:1440px;height:1180px;background:var(--bg);display:flex;flex-direction:column;overflow:hidden">
  <div style="display:flex;gap:26px;padding:9px 36px;border-bottom:1px solid var(--ln);background:var(--sf);overflow:hidden;flex:none">%s</div>
  <div style="display:flex;align-items:center;gap:26px;padding:16px 36px;border-bottom:1px solid var(--ln);flex:none">
    <div class="lg" style="font-size:19px"><span class="lgm" style="width:30px;height:30px;border-radius:10px 10px 3px 10px;font-size:11px">FX</span>CommentFX</div>
    <div style="display:flex;gap:22px;align-items:center">%s</div>
    <div class="sp"></div>
    <div style="display:flex;align-items:center;gap:9px;background:var(--sf);border:1px solid var(--ln);border-radius:11px;padding:8px 14px;width:250px;color:var(--mut)">%s<span style="font-size:12.5px">جستجوی بروکر، کوین، تریدر…</span></div>
    <span style="font-size:13px;color:var(--ink2)">ورود</span>
    <div class="btn" style="padding:9px 20px;font-size:13px;border-radius:10px">ثبت‌نام</div>
  </div>
  <div style="flex:1;padding:22px 36px;display:flex;flex-direction:column;gap:14px;overflow:hidden">

    <div style="display:flex;gap:14px">
      <div class="cd" style="flex:2.1;background:linear-gradient(120deg,#1B2331,#12171F);border-color:#2C3648;padding:18px 20px">
        <div class="ch"><b style="font-size:15px">رادار ریسک امروز</b><span class="lv"><i></i>زنده · ۲۲ شهریور</span></div>
        <div style="display:flex;align-items:flex-end;gap:16px">
          <div class="n" style="font-size:62px;font-weight:800;letter-spacing:-.05em;line-height:.85">72</div>
          <div style="padding-bottom:8px"><div class="t2">/100</div><div style="font-size:15px;font-weight:800;color:var(--dn)">ریسک بالا</div></div>
          <div style="flex:1;padding-bottom:6px">
            <div style="height:7px;border-radius:99px;background:linear-gradient(to left,var(--up),var(--wn),var(--dn));position:relative">
              <i style="position:absolute;top:-5px;right:72%%;width:17px;height:17px;border-radius:50%%;background:var(--ink);border:4px solid #161D28;transform:translateX(50%%)"></i></div>
            <div style="display:flex;gap:6px;margin-top:13px">
              <span class="tg" style="border-color:#4A2B2B;color:var(--dn);background:var(--dns)">NFP · 16:00</span>
              <span class="tg" style="border-color:#4A3E22;color:var(--wn);background:var(--wns)">آنلاک ARB $420M</span>
              <span class="tg">انقضای آپشن BTC $4.2B</span><span class="tg">فاندینگ SOL غیرعادی</span></div></div>
          <div style="text-align:left;padding-bottom:6px"><div class="t2">تا NFP</div>
            <div class="n" style="font-size:26px;font-weight:800;color:var(--br);letter-spacing:-.03em">01:28</div></div>
        </div>
      </div>
      <div class="cd" style="flex:.62"><div class="t2">ترس و طمع</div>
        <div class="n up" style="font-size:34px;font-weight:800;letter-spacing:-.04em;margin:4px 0 2px">64</div>
        <div class="t2">طمع · دیروز ۵۸</div></div>
      <div class="cd" style="flex:.62"><div class="t2">تتر / تومان</div>
        <div class="n" style="font-size:34px;font-weight:800;letter-spacing:-.04em;margin:4px 0 2px">62,410</div>
        <div class="t2 up">+0.4%% · میانگین ۶ صرافی</div></div>
      <div class="cd" style="flex:.62"><div class="t2">جلسهٔ فعال</div>
        <div style="font-size:26px;font-weight:800;margin:6px 0 2px;color:var(--up)">لندن</div>
        <div class="t2">نیویورک ۱:۲۸ دیگر</div></div>
    </div>

    <div style="display:flex;gap:14px;flex:1">
      <div class="cd" style="flex:1;padding-bottom:8px"><div class="ch"><b>بازار</b><a>همه ›</a></div>%s</div>
      <div class="cd" style="flex:1"><div class="ch"><b>تقویم امروز</b><a>هفته ›</a></div>%s
        <div style="margin-top:11px;padding:10px 12px;background:var(--sf2);border-radius:10px;font-size:11.5px;color:var(--ink2);line-height:1.75">
          <b style="color:var(--br)">یعنی چه:</b> زیر ۱۵۰K یعنی بازار قطع نرخ سپتامبر را قیمت‌گذاری می‌کند — دلار ضعیف، طلا بالا.</div></div>
      <div class="cd" style="flex:1;padding-bottom:8px"><div class="ch"><b>اخبار</b><a>همه ›</a></div>%s</div>
    </div>

    <div style="display:flex;gap:14px;flex:1">
      <div class="cd" style="flex:1.9;padding-bottom:8px"><div class="ch"><b>بروکرها · اسپرد زنده</b><a>مقایسه و فیلتر ›</a></div>%s
        <div class="t2" style="margin-top:9px">امتیاز از ۶ مؤلفهٔ عمومی — هیچ‌وقت با پول تغییر نمی‌کند. <a style="font-size:11px">روش‌شناسی</a></div></div>
      <div class="cd" style="flex:1">
        <div class="ch"><b>سیگنال‌های زنده</b><a>لیدربورد ›</a></div>
        <div style="border:1px solid var(--ln);border-radius:11px;padding:11px 12px;margin-bottom:9px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
            <span class="n" style="font-size:13px;font-weight:800">XAUUSD</span>
            <span style="font-size:10.5px;font-weight:800;padding:1px 8px;border-radius:6px;background:var(--ups);color:var(--up)">خرید</span>
            <div class="sp"></div><span class="n t2" style="font-weight:600">@mehran_fx</span>
            <span class="tg g">۶۸٪ · ۱۴۲</span></div>
          <div style="display:flex;gap:14px" class="t2">ورود <b class="n" style="color:var(--ink2)">2,408</b> · SL <b class="n dn">2,396</b> · TP <b class="n up">2,431</b> · R <b class="n" style="color:var(--br)">1.9</b></div></div>
        <div style="border:1px solid var(--ln);border-radius:11px;padding:11px 12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
            <span class="n" style="font-size:13px;font-weight:800">BTCUSDT</span>
            <span style="font-size:10.5px;font-weight:800;padding:1px 8px;border-radius:6px;background:var(--dns);color:var(--dn)">فروش</span>
            <div class="sp"></div><span class="n t2" style="font-weight:600">@sara.trades</span>
            <span class="tg g">۶۱٪ · ۸۹</span></div>
          <div style="display:flex;gap:14px" class="t2">ورود <b class="n" style="color:var(--ink2)">67,900</b> · SL <b class="n dn">68,600</b> · TP <b class="n up">66,100</b> · R <b class="n" style="color:var(--br)">2.6</b></div></div>
        <div class="t2" style="margin-top:9px">هر سیگنال بعد از ثبت قفل می‌شود و با فید قیمت امتیاز می‌گیرد.</div></div>
    </div>
  </div>
</div>''' % (tick, links, ico(I['srch'],16), mkt, evw, nw, bk)
write('WebHome.dc.html', body)
