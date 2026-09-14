# -*- coding: utf-8 -*-
import sys; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *

# ============================================================= COMPARE
CMP = [('امتیاز کل','8.9','8.7',1),('رگولاتور اصلی','FCA · CySEC','ASIC · CySEC',0),
 ('اسپرد EURUSD','0.7','0.1',2),('اسپرد طلا','1.4','1.6',1),('حداقل واریز','$10','$200',1),
 ('اهرم','1:2000','1:500',1),('میانهٔ برداشت','۱۸ دقیقه','۴ ساعت',1),
 ('واریز ریالی','دارد','ندارد',1),('حساب اسلامی','دارد','دارد',0),('اسکالپ','آزاد','آزاد',0)]
cmp_ = ''
for lbl,a,b,win in CMP:
    sa = 'font-weight:800;color:var(--br)' if win==1 else 'color:var(--ink2)'
    sb = 'font-weight:800;color:var(--br)' if win==2 else 'color:var(--ink2)'
    cmp_ += ('<div style="display:flex;align-items:center;padding:11px 0;border-bottom:1px solid var(--ln)">'
      '<div style="flex:1;text-align:center;font-size:12.5px;%s" class="n">%s</div>'
      '<div style="width:112px;text-align:center;font-size:10.5px;color:var(--mut)">%s</div>'
      '<div style="flex:1;text-align:center;font-size:12.5px;%s" class="n">%s</div></div>') % (sa,a,lbl,sb,b)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><div class="ic">%s</div><b style="font-size:15px;font-weight:700">مقایسهٔ بروکر</b><div class="sp"></div><div class="ic">%s</div></div>
  <div style="display:flex;align-items:flex-start;padding:6px 16px 14px;gap:10px;flex:none">
    <div style="flex:1;text-align:center"><div style="width:46px;height:46px;border-radius:14px;background:#FFD84D;margin:0 auto 7px;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:16px;color:#0B0E14">E</div>
      <div class="n" style="font-size:14px;font-weight:700">Exness</div><div class="t2">۳ لایسنس</div></div>
    <div style="width:112px;text-align:center;padding-top:16px"><span style="font-size:11px;color:var(--mut);background:var(--sf);border:1px solid var(--ln);padding:4px 12px;border-radius:99px">در برابر</span></div>
    <div style="flex:1;text-align:center"><div style="width:46px;height:46px;border-radius:14px;background:#2E3A4D;margin:0 auto 7px;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:14px;color:#EEF1F6">IC</div>
      <div class="n" style="font-size:14px;font-weight:700">IC Markets</div><div class="t2">۳ لایسنس</div></div>
  </div>
  <div style="flex:1;padding:0 16px;overflow:hidden">
    <div class="cd" style="padding:4px 14px 10px">%s</div>
    <div style="margin-top:12px;padding:11px 13px;background:var(--brs);border:1px solid var(--br2);border-radius:12px;display:flex;gap:9px">
      %s<div><div style="font-size:12.5px;font-weight:700;color:var(--br);margin-bottom:3px">جمع‌بندی</div>
      <div class="t2" style="line-height:1.75">برای شروع با سرمایهٔ کم و برداشت سریع، Exness. برای اسکالپ با کمترین هزینهٔ اسپرد، IC Markets — به شرط سرمایهٔ بالای $۲۰۰.</div></div></div>
  </div>
  <div style="display:flex;gap:9px;padding:12px 16px;flex:none">
    <div class="btn" style="flex:1;font-size:13px">Exness</div><div class="btn2" style="flex:1">IC Markets</div></div>
  %s
</div>''' % (ico(I['back'],19), ico(I['plus'],19), cmp_, ico(I['trend'],17,'var(--br)'), tabbar('grid'))
write('Compare.dc.html', body)

# ============================================================= PROPS
PR = [('FT','#2E7D6B','FTMO','۱۰٪ / ۵٪ / ۱۰٪','$۱۵۵','۹۰٪','۱–۲ روز','var(--up)','قوانین بدون تغییر از خرداد'),
 ('FN','#4A5FD9','FundedNext','۸٪ / ۵٪ / ۱۰٪','$۹۹','۹۵٪','۲–۴ روز','var(--up)','قانون consistency اضافه شد'),
 ('T5','#D97A4A','The5%ers','۶٪ / ۴٪ / ۸٪','$۲۶۰','۱۰۰٪','۳–۵ روز','var(--wn)','۲ گزارش تأخیر پرداخت'),
 ('TS','#8A6BD9','Topstep','فیوچرز','$۱۶۵','۹۰٪','۱–۳ روز','var(--up)','عادی')]
pr = ''
for ini,col,nm,rules,fee,split,pay,stc,note in PR:
    pr += ('<div style="padding:13px 0;border-bottom:1px solid var(--ln)">'
      '<div style="display:flex;align-items:center;gap:11px">'
      '<div style="width:38px;height:38px;border-radius:11px;background:%s;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:12px;flex:none">%s</div>'
      '<div style="flex:1"><div class="n" style="font-size:14px;font-weight:700">%s</div>'
      '<div class="t2">هدف/دراودان: <b class="n" style="color:var(--ink2)">%s</b></div></div>'
      '<div style="text-align:left"><div class="n" style="font-size:14px;font-weight:800;color:var(--br)">%s</div><div class="t2">هزینهٔ چالش</div></div></div>'
      '<div style="display:flex;gap:7px;margin-top:10px">'
      '<div style="flex:1;background:var(--sf2);border-radius:9px;padding:7px 9px"><div class="t2" style="font-size:9.5px">تقسیم سود</div><div class="n" style="font-size:13px;font-weight:700">%s</div></div>'
      '<div style="flex:1;background:var(--sf2);border-radius:9px;padding:7px 9px"><div class="t2" style="font-size:9.5px">زمان پرداخت</div><div class="n" style="font-size:13px;font-weight:700">%s</div></div>'
      '<div style="flex:1.3;background:var(--sf2);border-radius:9px;padding:7px 9px"><div class="t2" style="font-size:9.5px">لاگ قوانین</div>'
      '<div style="font-size:10.5px;font-weight:600;color:%s;line-height:1.5;margin-top:1px">%s</div></div></div></div>'
      ) % (col,ini,nm,rules,fee,split,pay,stc,note)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><div class="ic">%s</div><b style="font-size:15px;font-weight:700">پراپ فرم‌ها</b><div class="sp"></div><div class="ic">%s</div></div>
  <div class="fl" style="padding:2px 16px 12px;flex:none"><span class="on">فارکس</span><span>کریپتو</span><span>فیوچرز</span><span>بدون زمان</span><span>یک‌مرحله‌ای</span></div>
  <div style="padding:0 16px 12px;flex:none">
    <div class="cd" style="background:linear-gradient(160deg,#1B2331,#12171F);border-color:#2C3648;padding:12px 13px">
      <div style="display:flex;align-items:center;gap:9px">%s
        <div style="flex:1"><div style="font-size:13px;font-weight:700">ماشین‌حساب چالش</div>
        <div class="t2">با وین‌ریت و R خودت، احتمال پاس را ببین</div></div>%s</div></div>
  </div>
  <div style="flex:1;padding:0 16px;overflow:hidden">%s</div>
  %s
</div>''' % (ico(I['back'],19), ico(I['filt'],19), ico(I['trend'],20,'var(--br)'), ico(I['fwd'],16,'var(--mut)'), pr, tabbar('grid'))
write('Props.dc.html', body)

# ============================================================= EXCHANGES / WHERE TO BUY
def svc(ini, col, nm, sub, right, rcol, note=None):
    n2 = ('<div style="border-top:1px solid var(--ln);margin-top:10px;padding-top:9px" class="t2">%s</div>' % note) if note else ''
    return ('<div style="background:var(--sf);border:1px solid var(--ln);border-radius:15px;padding:14px 15px;margin-bottom:10px">'
      '<div style="display:flex;align-items:center;gap:12px">'
      '<div style="width:36px;height:36px;border-radius:11px;background:%s;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:12px;color:#0B0E14;flex:none">%s</div>'
      '<div style="flex:1;min-width:0"><div class="n" style="font-size:15px;font-weight:700">%s</div>'
      '<div class="t2">%s</div></div>'
      '<span style="font-size:11.5px;color:%s;font-weight:600;white-space:nowrap">%s</span>%s</div>%s</div>'
      ) % (col,ini,nm,sub,rcol,right,ico(I['fwd'],17,'var(--mut)'),n2)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><div class="ic">%s</div><div class="sp"></div></div>
  <div style="padding:6px 16px 0;flex:none">
    <h1 style="font-size:30px;font-weight:800;margin:0 0 6px;letter-spacing:-.02em;line-height:1.25">بیت‌کوین را<br>کجا بخرم؟</h1>
    <p class="t2" style="font-size:13px;margin:0 0 20px">مقایسهٔ کارمزد، دسترسی و روش واریز برای کاربران ایران</p>
  </div>
  <div style="flex:1;padding:0 16px;overflow:hidden">
    <div style="font-size:11px;color:var(--mut);font-weight:600;margin-bottom:9px;letter-spacing:.04em">صرافی ریالی</div>
    %s%s
    <div style="font-size:11px;color:var(--mut);font-weight:600;margin:16px 0 9px;letter-spacing:.04em">صرافی جهانی</div>
    %s%s
    <div style="font-size:11px;color:var(--mut);font-weight:600;margin:16px 0 9px;letter-spacing:.04em">به‌صورت CFD</div>
    %s
  </div>
  <div class="t2" style="padding:10px 16px 14px;text-align:center;flex:none;font-size:10px">برخی لینک‌ها افیلیت هستند. ترتیب این فهرست بر اساس کارمزد و دسترسی است، نه کمیسیون.</div>
  %s
</div>''' % (ico(I['x'],19),
  svc('N','#F2C230','Nobitex','کارمزد ۰.۱۵٪ · واریز شبا','متصل','var(--up)','موجودی: ۰.۰۲۴ BTC ~ ۱۰۱٬۲۰۰٬۰۰۰ تومان'),
  svc('W','#4ABF8A','Wallex','کارمزد ۰.۲٪ · واریز شبا','اتصال حساب','var(--mut)'),
  svc('B','#F0B90B','Binance','کارمزد ۰.۱٪ · بدون ریال','نیاز به KYC','var(--wn)','دسترسی از ایران محدود — سابقهٔ فریز حساب گزارش شده'),
  svc('BY','#F7A600','Bybit','کارمزد ۰.۱٪ · P2P','بدون نیاز به KYC','var(--up)'),
  svc('E','#FFD84D','Exness','BTCUSD · اسپرد ۲۴ · اهرم ۱:۴۰۰','امتیاز 8.9','var(--br)'),
  tabbar('chart'))
write('Exchanges.dc.html', body)
