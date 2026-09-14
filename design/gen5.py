# -*- coding: utf-8 -*-
import sys; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *

imp=lambda n,c: '<div style="display:flex;gap:2px;flex:none">%s</div>'%''.join('<i style="width:4px;height:11px;border-radius:1px;background:%s;display:block"></i>'%(c if i<n else 'var(--ln)') for i in range(3))

# ============================================================= CALENDAR
days=['ش','ی','د','س','چ','پ','ج']; nums=['۲۰','۲۱','۲۲','۲۳','۲۴','۲۵','۲۶']
strip=''.join('<div style="flex:1;text-align:center;padding:7px 0;border-radius:11px;%s">'
  '<div style="font-size:10px;color:%s">%s</div><div class="n" style="font-size:14px;font-weight:700;margin-top:1px">%s</div>'
  '%s</div>'%(('background:var(--br);color:#0B0E14' if i==2 else ''),
   ('#0B0E14' if i==2 else 'var(--mut)'), d, n,
   ('<i style="width:4px;height:4px;border-radius:50%%;background:%s;display:block;margin:3px auto 0"></i>'%('#0B0E14' if i==2 else 'var(--dn)')) if i in (0,2,4) else '<i style="height:4px;display:block;margin-top:3px"></i>')
  for i,(d,n) in enumerate(zip(days,nums)))

EV=[('10:30','GBP',2,'var(--wn)','تولید ناخالص داخلی ماهانه','0.2%','0.1%','0.3%',0),
    ('13:00','EUR',2,'var(--wn)','سخنرانی لاگارد (ECB)','—','—','—',0),
    ('16:00','USD',3,'var(--dn)','اشتغال غیرکشاورزی (NFP)','—','185K','216K',1),
    ('16:00','USD',3,'var(--dn)','نرخ بیکاری','—','3.9%','3.9%',0),
    ('17:45','USD',2,'var(--wn)','PMI خدمات','—','51.2','51.7',0),
    ('21:00','USD',1,'var(--mut)','تعداد دکل‌های نفتی بیکر هیوز','—','486','484',0)]
ev=''
for tm,cur,im,ic_,nm,act,fc,prev,hl in EV:
    box = 'background:var(--dns);border:1px solid #4A2B2B;border-radius:12px;padding:11px 12px;margin:0 -2px' if hl else 'padding:11px 2px;border-bottom:1px solid var(--ln)'
    cd = ('<div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #4A2B2B">'
       '%s<span style="font-size:11.5px;color:var(--dn);font-weight:700">۱ ساعت و ۲۸ دقیقه مانده</span>'
       '<div class="sp"></div><span class="t2" style="font-size:10px">یادآوری %s</span></div>')%(ico(I['clock'],13,'var(--dn)',2), ico(I['bell'],12,'var(--br)',2)) if hl else ''
    ev += ('<div style="%s"><div style="display:flex;align-items:center;gap:9px">'
      '<span class="n" style="font-size:12px;font-weight:700;color:%s;width:38px;flex:none">%s</span>'
      '<span class="n t2" style="width:30px;flex:none;font-weight:700">%s</span>%s'
      '<span style="font-size:12.5px;font-weight:%s;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">%s</span></div>'
      '<div style="display:flex;gap:14px;margin-top:6px;padding-right:86px" class="t2">'
      'واقعی <b class="n" style="color:var(--ink2)">%s</b> · پیش‌بینی <b class="n" style="color:var(--ink2)">%s</b> · قبلی <b class="n" style="color:var(--ink2)">%s</b></div>%s</div>'
      ) % (box, 'var(--dn)' if hl else 'var(--ink2)', tm, cur, imp(im,ic_), '700' if hl else '500', nm, act, fc, prev, cd)

body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd"><b style="font-size:17px;font-weight:800">تقویم اقتصادی</b><div class="sp"></div><div class="ic">%s</div><div class="ic">%s</div></div>
  <div style="display:flex;gap:4px;padding:2px 14px 12px;flex:none">%s</div>
  <div class="fl" style="padding:0 16px 10px;flex:none"><span class="on">فقط مهم</span><span>USD</span><span>EUR</span><span>بانک مرکزی</span><span>کریپتو</span></div>
  <div style="flex:1;padding:0 16px;overflow:hidden">%s
    <div style="margin-top:12px;padding:11px 13px;background:var(--sf2);border-radius:12px;display:flex;gap:9px">
      %s<div><div style="font-size:12px;font-weight:700;color:var(--br);margin-bottom:3px">یعنی چه</div>
      <div class="t2" style="line-height:1.75">NFP زیر ۱۵۰K → بازار قطع نرخ سپتامبر را قیمت‌گذاری می‌کند: دلار ضعیف، طلا و شاخص‌ها بالا. بالای ۲۵۰K عکس آن.</div></div></div>
  </div>
  %s
</div>''' % (ico(I['filt'],19), ico(I['bell'],19), strip, ev, ico(I['trend'],17,'var(--br)'), tabbar('chart'))
write('Calendar.dc.html', body)

# ============================================================= ALERT (numpad)
keys=['۱','۲','۳','۴','۵','۶','۷','۸','۹','٫','۰','⌫']
pad=''.join('<div style="flex:0 0 33.333%%;text-align:center;padding:15px 0;font-family:Manrope;font-size:23px;font-weight:600;color:%s">%s</div>'
  %('var(--mut)' if k=='⌫' else 'var(--ink)', k) for k in keys)
body = '''<div class="ph" style="width:390px;height:844px">
  <div class="hd" style="padding-top:18px">
    <div style="display:flex;align-items:center;gap:8px;margin:0 auto">
      <div style="width:26px;height:26px;border-radius:50%%;background:#D9B071;display:grid;place-items:center;font-size:12px;color:#0B0E14;font-weight:800">Au</div>
      <span style="font-size:15px;font-weight:700">طلا · XAUUSD</span></div>
    <div class="ic" style="position:absolute;left:16px">%s</div></div>
  <div style="padding:26px 16px 0;text-align:center;flex:none">
    <div class="t2" style="font-size:13px">وقتی قیمت بالاتر رفت از</div>
    <div class="n" style="font-size:50px;font-weight:800;letter-spacing:-.045em;margin:12px 0 14px;line-height:1">2,431.00</div>
    <div style="display:inline-flex;background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:3px">
      <div style="padding:5px 20px;border-radius:7px;background:var(--sf3);font-size:12.5px;font-weight:700">USD</div>
      <div style="padding:5px 20px;font-size:12.5px;color:var(--mut)">تومان</div></div>
    <div class="t2" style="margin-top:16px">قیمت فعلی <b class="n" style="color:var(--ink2)">2,412.30</b> · فاصله <b class="n up">+0.77%%</b></div>
  </div>
  <div style="padding:22px 16px 0;flex:none">
    <div class="t2" style="margin-bottom:8px">نوع هشدار</div>
    <div class="seg"><div class="on">قیمت</div><div>اسپرد بروکر</div><div>خبر مهم</div><div>سیگنال</div></div>
  </div>
  <div style="padding:20px 16px 0;flex:none"><div class="btn">ثبت هشدار</div></div>
  <div class="sp"></div>
  <div style="display:flex;flex-wrap:wrap;padding:0 6px 18px;flex:none;border-top:1px solid var(--ln);padding-top:8px">%s</div>
</div>''' % (ico(I['x'],18), pad)
write('Alert.dc.html', body)

# ============================================================= ARTICLE
body = '''<div class="ph" style="width:390px;height:1240px">
  <div class="hd"><div class="ic">%s</div><div class="sp"></div><div class="ic">%s</div><div class="ic">%s</div></div>
  <div style="padding:4px 16px 0;flex:none">
    <span class="tg" style="border-color:var(--br2);color:var(--br)">رگولاتوری</span>
    <h1 style="font-size:25px;font-weight:800;line-height:1.45;margin:12px 0 0;letter-spacing:-.01em;text-wrap:pretty">
      CySEC لایسنس یک بروکر بزرگ را تعلیق کرد — برای مشتریان ایرانی چه معنایی دارد؟</h1>
    <div style="display:flex;align-items:center;gap:9px;margin:16px 0 18px">
      <div style="width:32px;height:32px;border-radius:50%%;background:#4A7BD9;display:grid;place-items:center;font-size:13px;font-weight:700;flex:none">ر</div>
      <div style="flex:1"><div class="t1">رضا موسوی</div><div class="t2">تحلیلگر رگولاتوری · ۲۲ شهریور ۱۴۰۵</div></div>
      <span class="t2">۶ دقیقه</span></div>
    <div style="height:190px;border-radius:14px;background:linear-gradient(140deg,#2A3446,#161C26);border:1px solid var(--ln);position:relative;overflow:hidden">
      <div style="position:absolute;inset:auto 0 0 0;padding:12px 14px;background:linear-gradient(to top,rgba(11,14,20,.92),transparent)" class="t2">تصویر: ساختمان کمیسیون بورس قبرس</div></div>
  </div>
  <div style="padding:18px 16px 0;font-size:14.5px;line-height:2.05;color:var(--ink2)">
    <p style="margin:0 0 16px">کمیسیون بورس و اوراق بهادار قبرس روز سه‌شنبه لایسنس یکی از بروکرهای شناخته‌شدهٔ بازار را به حالت تعلیق درآورد. طبق اطلاعیهٔ رسمی، این تصمیم پس از بررسی نحوهٔ تفکیک وجوه مشتریان گرفته شده است.</p>
    <div style="border-right:2px solid var(--br);padding:2px 14px 2px 0;margin:0 0 16px">
      <div style="font-size:16px;font-weight:700;color:var(--ink);line-height:1.85">تعلیق یعنی بروکر نمی‌تواند مشتری جدید بگیرد — نه اینکه پول مشتریان فعلی از بین رفته است.</div></div>
    <p style="margin:0 0 16px">برای کاربران ایرانی یک نکتهٔ مهم وجود دارد: اگر حساب شما زیر شرکت قبرسی ثبت نشده باشد، این تعلیق مستقیماً روی حساب شما اثر نمی‌گذارد — ولی نشانهٔ مهمی دربارهٔ وضعیت مالی گروه است.</p>
    <h2 style="font-size:17px;font-weight:700;color:var(--ink);margin:22px 0 12px">چطور بفهمم زیر کدام شرکت هستم؟</h2>
    <p style="margin:0 0 16px">در قرارداد مشتری (Client Agreement) نام شرکت طرف قرارداد نوشته شده است. همچنین می‌توانید از ابزار نقشهٔ Entity در صفحهٔ هر بروکر استفاده کنید.</p>
  </div>
  <div style="padding:4px 16px 0;flex:none">
    <div class="cd" style="border-color:var(--br2);background:linear-gradient(160deg,#1E2431,#13181F)">
      <div class="t2" style="margin-bottom:10px">مرتبط با این مقاله</div>
      <div style="display:flex;align-items:center;gap:11px">
        <div style="width:38px;height:38px;border-radius:11px;background:#FFD84D;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:13px;color:#0B0E14;flex:none">E</div>
        <div style="flex:1"><div class="n" style="font-size:14px;font-weight:700">Exness</div>
        <div class="t2">نقشهٔ Entity · ۳ لایسنس · وضعیت عادی</div></div>
        <span class="sc">8.9</span></div>
      <div class="btn2" style="margin-top:11px">بررسی وضعیت لایسنس‌ها</div></div>
  </div>
  <div style="padding:14px 16px 0;flex:none">
    <div class="cd"><div class="ch"><b>۲۴ نظر</b><a>همه ›</a></div>
      <div class="rw"><div style="width:28px;height:28px;border-radius:50%%;background:#8A6BD9;display:grid;place-items:center;font-size:12px;font-weight:700;flex:none">ح</div>
        <div><div class="t1">حسین ط.</div><div class="t2" style="color:var(--ink2);line-height:1.7;margin-top:2px">من حسابم زیر سیشله، الان باید نگران باشم یا نه؟</div></div></div>
      <div class="rw"><div style="width:28px;height:28px;border-radius:50%%;background:#2E7D6B;display:grid;place-items:center;font-size:12px;font-weight:700;flex:none">ر</div>
        <div><div style="display:flex;align-items:center;gap:5px"><span class="t1">رضا موسوی</span><span class="tg" style="border-color:var(--br2);color:var(--br)">نویسنده</span></div>
        <div class="t2" style="color:var(--ink2);line-height:1.7;margin-top:2px">فعلاً نه. ولی برداشت‌های بزرگ را عقب نیندازید تا وضعیت روشن شود.</div></div></div>
    </div>
  </div>
  %s
</div>''' % (ico(I['back'],19), ico(I['star'],19), ico(I['glob'],19), tabbar('home'))
write('Article.dc.html', body)
