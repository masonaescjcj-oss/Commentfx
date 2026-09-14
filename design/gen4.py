# -*- coding: utf-8 -*-
import sys; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *

# ============================================================= COIN
pts=[34,31,29,32,28,26,29,27,24,28,33,31,36,39,37,42,45,43,47,44,48,52,50,55,53,57]
vol=''.join('<div style="flex:1;height:%dpx;background:var(--sf3);border-radius:2px 2px 0 0"></div>'%h for h in [9,14,11,20,13,8,17,26,12,10,22,15,9,13,28,18,11,16,9,24,13,19,11,15,21,12])
seg=''.join('<div class="%s">%s</div>'%('on' if t=='24س' else '',t) for t in ['1س','24س','7ر','30ر','1س','همه'])
body = '''<div class="ph" style="width:390px;height:900px">
  <div class="hd"><div class="ic">%s</div>
    <div style="display:flex;align-items:center;gap:7px"><div style="width:24px;height:24px;border-radius:50%%;background:#F7931A;display:grid;place-items:center;font-size:12px;color:#0B0E14;font-weight:800">₿</div>
    <span class="n" style="font-size:15px;font-weight:800">BTC</span><span class="tg" style="border-color:var(--br2);color:var(--br)">#1</span></div>
    <div class="sp"></div><div class="ic">%s</div><div class="ic">%s</div></div>
  <div style="display:flex;border-bottom:1px solid var(--ln);flex:none;padding:0 10px">%s</div>
  <div style="padding:16px 16px 0;flex:none">
    <div class="t2">بیت‌کوین</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:2px">
      <span class="n" style="font-size:33px;font-weight:800;letter-spacing:-.04em">$67,412</span>
      <span class="pl u" style="font-size:12.5px;padding:3px 9px">▲ 1.82%%</span></div>
    <div class="t2 n" style="margin-top:4px">2,412,300 تومان · <span class="up">+0.4%%</span></div>
  </div>
  <div style="padding:14px 16px 0;flex:none"><div class="seg">%s</div></div>
  <div style="padding:14px 16px 0;flex:none;position:relative">
    <div class="n" style="position:absolute;left:22px;top:10px;font-size:10px;color:var(--mut)">$68,900</div>
    <div class="n" style="position:absolute;left:22px;bottom:44px;font-size:10px;color:var(--mut)">$64,100</div>
    %s
    <div style="display:flex;gap:2px;align-items:flex-end;height:30px;margin-top:6px">%s</div>
    <div style="display:flex;justify-content:space-between;margin-top:5px" class="t2 n">
      <span>18:00</span><span>00:00</span><span>06:00</span><span>12:00</span></div>
  </div>
  <div style="padding:16px 16px 0;flex:none"><div class="btn">کجا بخرم؟</div></div>
  <div style="padding:14px 16px 0;flex:none">
    <div class="cd">
      <div class="ch"><b>آمار</b><a>همه ›</a></div>
      <div class="t2" style="margin-bottom:6px">بازهٔ ۲۴ ساعته</div>
      <div style="height:5px;border-radius:99px;background:var(--sf3);position:relative;margin-bottom:6px">
        <div style="position:absolute;right:0;width:62%%;height:100%%;background:linear-gradient(to left,var(--br),var(--br2));border-radius:99px"></div>
        <i style="position:absolute;right:62%%;top:-4px;width:13px;height:13px;border-radius:50%%;background:var(--ink);border:3px solid var(--sf);transform:translateX(50%%)"></i></div>
      <div style="display:flex;justify-content:space-between" class="t2 n"><span>$64,100</span><span>$68,900</span></div>
      <div style="margin-top:10px">
        <div class="kv"><span>ارزش بازار</span><b class="n">$1.33T</b></div>
        <div class="kv"><span>حجم ۲۴ ساعته</span><b class="n">$41.2B</b></div>
        <div class="kv"><span>عرضهٔ در گردش</span><b class="n">19.7M BTC</b></div>
      </div>
    </div>
  </div>
  %s
</div>''' % (ico(I['back'],19), ico(I['srch'],19), ico(I['star'],19),
  ''.join('<div style="padding:12px 10px;font-size:12.5px;%s">%s</div>'%('color:var(--br);font-weight:700;border-bottom:2px solid var(--br)' if i==0 else 'color:var(--mut)',t) for i,t in enumerate(['نمای کلی','بازارها','آنلاک','سیگنال','اخبار'])),
  seg, spark(pts,'#3DD68C',342,130,True,2.1), vol, tabbar('chart'))
write('Coin.dc.html', body)

# ============================================================= SIGNALS
SG=[('XAUUSD','خرید','b','@mehran_fx','۶۸٪','۱۴۲','2,408','2,396','2,431','1.9','H1','۱۸ دقیقه','TP1 خورد · +۱.۰R','var(--up)',68),
    ('BTCUSDT','فروش','s','@sara.trades','۶۱٪','۸۹','67,900','68,600','66,100','2.6','H4','۴۱ دقیقه','در جریان','var(--br)',34),
    ('EURUSD','خرید','b','@nima.pips','۵۴٪','۲۱۰','1.0836','1.0812','1.0890','2.2','M30','۲ ساعت','SL خورد · −۱.۰R','var(--dn)',100)]
sg=''
for pair,dirn,dc,who,wr,cnt,en,sl,tp,r,tf,ago,stat,stc,prog in SG:
    sg += ('<div class="cd" style="margin-bottom:10px">'
     '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
     '<span class="n" style="font-size:15px;font-weight:800">%s</span>'
     '<span style="font-size:11px;font-weight:800;padding:2px 9px;border-radius:7px;background:%s;color:%s">%s</span>'
     '<div class="sp"></div><span class="t2 n">%s</span></div>'
     '<div style="display:flex;align-items:center;gap:7px;padding-bottom:10px;border-bottom:1px solid var(--ln)">'
     '<div style="width:24px;height:24px;border-radius:50%%;background:var(--sf3);flex:none"></div>'
     '<span class="n" style="font-size:12px;font-weight:600">%s</span>'
     '<span class="tg g" style="display:inline-flex;gap:3px;align-items:center">%s %s · %s سیگنال</span></div>'
     '<div style="display:flex;gap:9px;margin:10px 0">'
       '<div style="flex:1"><div class="t2" style="font-size:9.5px">ورود</div><div class="n" style="font-size:13px;font-weight:700">%s</div></div>'
       '<div style="flex:1"><div class="t2" style="font-size:9.5px">حد ضرر</div><div class="n dn" style="font-size:13px;font-weight:700">%s</div></div>'
       '<div style="flex:1"><div class="t2" style="font-size:9.5px">حد سود</div><div class="n up" style="font-size:13px;font-weight:700">%s</div></div>'
       '<div style="flex:.7"><div class="t2" style="font-size:9.5px">R</div><div class="n" style="font-size:13px;font-weight:700;color:var(--br)">%s</div></div>'
       '<div style="flex:.7"><div class="t2" style="font-size:9.5px">تایم</div><div class="n" style="font-size:13px;font-weight:700">%s</div></div></div>'
     '<div style="height:4px;border-radius:99px;background:var(--sf3);overflow:hidden;margin-bottom:7px">'
     '<div style="height:100%%;width:%d%%;background:%s;border-radius:99px"></div></div>'
     '<div style="font-size:11.5px;font-weight:600;color:%s">%s</div></div>'
     ) % (pair, 'var(--ups)' if dc=='b' else 'var(--dns)', 'var(--up)' if dc=='b' else 'var(--dn)', dirn,
          ago, who, ico(I['chk'],9,'var(--up)',3), wr, cnt, en, sl, tp, r, tf, prog, stc, stc, stat)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><b style="font-size:17px;font-weight:800">سیگنال‌ها</b><div class="sp"></div><div class="ic">%s</div><div class="ic">%s</div></div>
  <div style="padding:2px 16px 12px;flex:none"><div class="seg">
    <div class="on">فید زنده</div><div>لیدربورد</div><div>دنبال‌شده‌ها</div></div></div>
  <div class="fl" style="padding:0 16px 12px;flex:none"><span class="on">همه</span><span>طلا</span><span>کریپتو</span><span>فارکس</span><span>شاخص</span></div>
  <div style="flex:1;padding:0 16px;overflow:hidden">%s</div>
  <div style="padding:0 16px 12px;flex:none"><div class="btn">%s ثبت سیگنال</div></div>
  %s
</div>''' % (ico(I['filt'],19), ico(I['bell'],19), sg, ico(I['plus'],17), tabbar('sig'))
write('Signals.dc.html', body)

# ============================================================= CHAT
MSG=[('ع','#4A7BD9','ali.gold','14:18','قبل NFP کسی پوزیشن نگه می‌داره؟',None,0),
     ('م','#2E7D6B','mehran_fx','14:21','نصف حجم بستم، SL بقیه رو بردم روی نقطهٔ ورود',None,1),
     ('ن','#8A6BD9','nina.t','14:24','۲۴۰۰ حمایت خیلی قویه. زیرش بره من شورت می‌گیرم',None,0),
     ('م','#2E7D6B','mehran_fx','14:29','',('XAUUSD','خرید','2,408','2,396','2,431'),1),
     ('س','#D97A4A','sara.trades','14:31','R خوبیه ولی تا خبر ۹۰ دقیقه مونده، ریسکش بالاست',None,0)]
msgs=''
for ini,col,nm,tm,txt,sig,me in MSG:
    inner = ''
    if txt:
        inner = '<div style="font-size:13px;color:var(--ink2);line-height:1.75">%s</div>' % txt
    if sig:
        inner += ('<div style="background:var(--sf2);border:1px solid var(--br2);border-radius:11px;padding:10px 11px;margin-top:2px">'
          '<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px">'
          '<span class="n" style="font-size:13px;font-weight:800">%s</span>'
          '<span style="font-size:10px;font-weight:800;padding:1px 8px;border-radius:6px;background:var(--ups);color:var(--up)">%s</span>'
          '<div class="sp"></div><span class="t2" style="font-size:9.5px">سنجاق‌شده</span></div>'
          '<div style="display:flex;gap:12px" class="t2">ورود <b class="n" style="color:var(--ink2)">%s</b> · SL <b class="n dn">%s</b> · TP <b class="n up">%s</b></div></div>') % sig
    msgs += ('<div style="display:flex;gap:9px;padding:9px 0;align-items:flex-start">'
      '<div style="width:28px;height:28px;border-radius:50%%;background:%s;display:grid;place-items:center;font-size:12px;font-weight:700;flex:none">%s</div>'
      '<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">'
      '<span class="n" style="font-size:12px;font-weight:700;color:%s">%s</span>%s<span class="t2 n" style="font-size:9.5px">%s</span></div>%s</div></div>'
      ) % (col, ini, 'var(--br)' if me else 'var(--ink2)', nm,
           ('<span class="tg g" style="display:inline-flex;gap:2px;align-items:center">%s ۶۸٪</span>'%ico(I['chk'],8,'var(--up)',3)) if me else '', tm, inner)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><div class="ic">%s</div>
    <div><div style="font-size:15px;font-weight:700">اتاق طلا</div>
    <div class="t2" style="display:flex;align-items:center;gap:5px"><i style="width:6px;height:6px;border-radius:50%%;background:var(--up);display:block"></i>۳۱۲ آنلاین</div></div>
    <div class="sp"></div><div class="ic">%s</div></div>
  <div style="margin:0 16px 6px;padding:9px 11px;background:var(--dns);border:1px solid #4A2B2B;border-radius:11px;display:flex;align-items:center;gap:8px;flex:none">
    %s<span style="font-size:11.5px;color:var(--dn);font-weight:600">NFP تا ۱:۲۸ دیگر</span>
    <div class="sp"></div><span class="t2" style="font-size:10px">اتاق رویداد باز می‌شود</span></div>
  <div style="flex:1;padding:0 16px;overflow:hidden">%s</div>
  <div style="padding:10px 16px 12px;flex:none;border-top:1px solid var(--ln)">
    <div style="display:flex;align-items:center;gap:9px;background:var(--sf);border:1px solid var(--ln);border-radius:13px;padding:9px 13px">
      %s<span class="t2" style="flex:1;font-size:12.5px">پیام بنویس…</span>%s</div>
    <div class="t2" style="text-align:center;margin-top:7px;font-size:10px">حالت آهسته فعال است — هر ۱۵ ثانیه یک پیام</div>
  </div>
</div>''' % (ico(I['back'],19), ico(I['glob'],19), ico(I['alert'],15,'var(--dn)'), msgs, ico(I['plus'],17), ico(I['send'],18,'var(--br)'))
write('Chat.dc.html', body)
