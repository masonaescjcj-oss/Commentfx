# -*- coding: utf-8 -*-
import sys, re; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *
stars=lambda n: ''.join('<svg width="13" height="13" viewBox="0 0 24 24" fill="%s"><path d="m12 3 2.6 5.6 6 .8-4.4 4.3 1.1 6.1L12 17l-5.3 2.8 1.1-6.1L3.4 9.4l6-.8L12 3Z"/></svg>'%('#D9B071' if i<n else '#2A3342') for i in range(5))

SB=[('رگولیشن و لایسنس','25٪',9.4,'var(--up)'),('هزینهٔ معامله','20٪',9.1,'var(--up)'),('سرعت برداشت','20٪',9.6,'var(--up)'),
    ('اجرا و پایداری','15٪',8.2,'var(--br)'),('نظرات تأییدشده','10٪',8.0,'var(--br)'),('شفافیت شرکتی','10٪',7.1,'var(--wn)')]
sb=''.join('<div style="flex:1"><div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px">'
 '<span style="font-size:12px">%s</span><span class="t2 n">%s</span><div class="sp"></div>'
 '<span class="n" style="font-size:13px;font-weight:800;color:%s">%s</span></div>'
 '<div style="height:5px;border-radius:99px;background:var(--sf3);overflow:hidden"><div style="height:100%%;width:%s%%;background:%s;border-radius:99px"></div></div></div>'
 %(n,w,c,'%.1f'%v,v*10,c) for n,w,v,c in SB)

ENT=[('Exness (SC) Ltd','سیشل','FSA-SC','هیچ حفاظتی ندارد',1),('Exness (CY) Ltd','قبرس','CySEC','صندوق ICF تا €۲۰٬۰۰۰',0),('Exness (UK) Ltd','انگلیس','FCA','صندوق FSCS تا £۸۵٬۰۰۰',0)]
ent=''.join(('<div style="flex:1;border:1.5px solid var(--wn);background:var(--wns);border-radius:12px;padding:13px 14px">'
  '<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px"><span class="n" style="font-size:13.5px;font-weight:800">%s</span>'
  '<span class="tg" style="border-color:var(--br2);color:var(--br)">%s</span><div class="sp"></div>'
  '<span style="font-size:10.5px;font-weight:800;color:#0B0E14;background:var(--wn);padding:2px 9px;border-radius:6px">شما اینجا</span></div>'
  '<div style="display:flex;align-items:center;gap:6px">%s<span style="font-size:11.5px;color:var(--wn);font-weight:600">%s</span></div>'
  '<div class="t2" style="margin-top:4px">ثبت‌شده در %s</div></div>')%(n,r,ico(I['alert'],14,'var(--wn)',2),p,c) if me else
  ('<div style="flex:1;border:1px solid var(--ln);border-radius:12px;padding:13px 14px;opacity:.6">'
  '<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px"><span class="n" style="font-size:13px;font-weight:700">%s</span>'
  '<span class="tg">%s</span></div><div style="display:flex;align-items:center;gap:6px">%s'
  '<span style="font-size:11px;color:var(--up)">%s</span></div><div class="t2" style="margin-top:4px">ثبت‌شده در %s</div></div>')
  %(n,r,ico(I['shld'],13,'var(--up)',2),p,c) for n,c,r,p,me in ENT)

SP=[('EURUSD','0.7','0.9','۳'),('XAUUSD','1.4','1.8','۵'),('GBPUSD','1.1','1.2','۷'),('BTCUSD','24','31','۲'),('US30','1.9','2.2','۱۱')]
spr=''.join('<div class="kv"><span class="n" style="color:var(--ink);font-weight:600;width:88px">%s</span>'
 '%s<div class="sp"></div><span class="t2 n">میانگین ۳۰ روز %s</span>'
 '<b class="n up" style="font-size:14px;margin-left:12px">%s</b>'
 '<span class="tg" style="border-color:var(--br2);color:var(--br)">رتبه %s</span></div>'
 %(s,spark([3,4,3,5,4,6,5,4,5,4],'#3DD68C',72,20,False,1.5),a,l,r) for s,l,a,r in SP)

REV=[('م','#4A7BD9','مهران ر.','۴ روز پیش',5,'برداشت تتر در کمتر از ۱۰ دقیقه انجام شد. اسپرد طلا موقع خبر باز می‌شود ولی در حد معقول.'),
     ('ن','#8A6BD9','نیما ک.','۲ هفته پیش',3,'اجرا سریع است اما در NFP اسلیپیج زیادی داشتم. پشتیبانی فارسی جواب داد ولی کند.')]
rev=''.join('<div style="padding:13px 0;border-bottom:1px solid var(--ln)">'
 '<div style="display:flex;align-items:center;gap:9px"><div style="width:30px;height:30px;border-radius:50%%;background:%s;display:grid;place-items:center;font-size:12px;font-weight:700;flex:none">%s</div>'
 '<span class="t1">%s</span><span class="tg g" style="display:inline-flex;gap:3px;align-items:center">%s مشتری تأییدشده</span>'
 '<div class="sp"></div><div style="display:flex;gap:2px">%s</div><span class="t2">%s</span></div>'
 '<div style="font-size:13px;color:var(--ink2);line-height:1.85;margin-top:8px">%s</div></div>'
 %(c,i,n,ico(I['chk'],9,'var(--up)',3),stars(s),d,t) for i,c,n,d,s,t in REV)

ALT=[('IC','#2E3A4D','IC Markets','اسپرد کمتر · حداقل $200','8.7'),('AM','#4A7BD9','Amarkets','واریز ریالی مستقیم','8.1'),('RB','#8A6BD9','RoboForex','اهرم بالاتر','7.9')]
alt=''.join('<div class="rw"><div class="av" style="background:%s">%s</div><div style="min-width:0">'
 '<div class="t1 n">%s</div><div class="t2">%s</div></div><div class="sp"></div><span class="sc">%s</span></div>'%(c,i,n,d,s) for i,c,n,d,s in ALT)

body = '''<div style="width:1440px;height:1400px;background:var(--bg);display:flex;flex-direction:column;overflow:hidden">
  <div style="display:flex;align-items:center;gap:26px;padding:15px 36px;border-bottom:1px solid var(--ln);flex:none">
    <div class="lg" style="font-size:18px"><span class="lgm" style="width:28px;height:28px;font-size:10px">FX</span>CommentFX</div>
    <div style="display:flex;gap:22px">%s</div><div class="sp"></div>
    <div style="display:flex;align-items:center;gap:9px;background:var(--sf);border:1px solid var(--ln);border-radius:11px;padding:8px 14px;width:230px;color:var(--mut)">%s<span style="font-size:12.5px">جستجو…</span></div>
    <div class="btn" style="padding:9px 20px;font-size:13px;border-radius:10px">ثبت‌نام</div></div>

  <div style="padding:14px 36px 0;flex:none" class="t2">هوم › بروکرها › <span style="color:var(--ink2)">Exness</span></div>

  <div style="display:flex;gap:22px;padding:16px 36px 22px;align-items:flex-start;flex:none">
    <div style="width:82px;height:82px;border-radius:22px;background:#FFD84D;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:27px;color:#0B0E14;flex:none">E</div>
    <div style="flex:1">
      <div style="display:flex;align-items:baseline;gap:10px">
        <span class="n" style="font-size:30px;font-weight:800;letter-spacing:-.03em">Exness</span>
        <span class="t2" style="font-size:14px">اکسنس · تأسیس ۲۰۰۸ · قبرس</span></div>
      <div style="display:flex;gap:5px;margin:11px 0">
        <span class="tg" style="border-color:#3A4759">FCA · ۷۳۰۷۲۹</span><span class="tg" style="border-color:#3A4759">CySEC · ۱۷۸/۱۲</span>
        <span class="tg" style="border-color:#3A4759">FSA-SC · SD025</span><span class="tg" style="border-color:#3A4759">FSCA</span></div>
      <div style="display:flex;gap:22px;margin-top:14px">
        <div><div class="t2">حداقل واریز</div><div class="n" style="font-size:16px;font-weight:700">$10</div></div>
        <div><div class="t2">اهرم</div><div class="n" style="font-size:16px;font-weight:700">1:2000</div></div>
        <div><div class="t2">پلتفرم</div><div style="font-size:15px;font-weight:600">MT4 · MT5 · وب</div></div>
        <div><div class="t2">واریز ریالی</div><div style="font-size:15px;font-weight:600;color:var(--up)">دارد</div></div>
        <div><div class="t2">حساب اسلامی</div><div style="font-size:15px;font-weight:600;color:var(--up)">دارد</div></div></div>
    </div>
    <div class="cd" style="width:290px;flex:none;background:linear-gradient(160deg,#1E2431,#13181F);border-color:#2C3648">
      <div style="display:flex;align-items:flex-end;gap:10px;margin-bottom:12px">
        <div class="n" style="font-size:44px;font-weight:800;color:var(--br);letter-spacing:-.045em;line-height:.9">8.9</div>
        <div style="padding-bottom:4px"><div class="t2">امتیاز CommentFX</div><div style="display:flex;gap:2px;margin-top:2px">%s</div></div></div>
      <div style="display:flex;align-items:center;gap:7px;padding:8px 11px;background:var(--ups);border:1px solid #2E4A3C;border-radius:10px;margin-bottom:12px">
        <i style="width:7px;height:7px;border-radius:50%%;background:var(--up)"></i>
        <span style="font-size:11.5px;color:var(--up);font-weight:600">وضعیت عادی · ۰ گزارش اختلال</span></div>
      <div class="btn">افتتاح حساب</div>
      <div style="display:flex;gap:8px;margin-top:9px"><div class="btn2" style="flex:1">مقایسه</div><div class="btn2" style="flex:1">هشدار اسپرد</div></div>
      <div class="t2" style="margin-top:10px;text-align:center;font-size:10px">لینک افیلیت — امتیاز از این بابت تغییر نمی‌کند.</div></div>
  </div>

  <div style="display:flex;gap:22px;padding:0 36px 28px;flex:1;overflow:hidden">
    <div style="flex:1;display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="cd"><div class="ch"><b>امتیاز تفکیکی</b><a>روش‌شناسی ›</a></div>
        <div style="display:flex;gap:22px">%s</div></div>

      <div class="cd" style="border-color:var(--br2)">
        <div class="ch"><b>شما زیر کدام شرکت ثبت می‌شوید؟</b>
          <div style="display:inline-flex;align-items:center;gap:6px;background:var(--sf2);border:1px solid var(--ln);border-radius:9px;padding:5px 11px;font-size:12.5px;font-weight:600">ایران %s</div></div>
        <div style="display:flex;gap:11px">%s</div>
        <div class="t2" style="margin-top:11px;line-height:1.85">بروکر لایسنس FCA را در تبلیغات نشان می‌دهد، ولی کاربران خارج از اتحادیهٔ اروپا و انگلیس زیر شرکت سیشل ثبت می‌شوند. در صورت اختلاف، مرجع رسیدگی FSA سیشل است و صندوق جبران خسارتی وجود ندارد.</div></div>

      <div class="cd"><div class="ch"><b>اسپرد زنده</b><span class="lv"><i></i>به‌روزرسانی هر ۶۰ ثانیه</span></div>%s
        <div class="t2" style="margin-top:9px">میانگین از حساب دمو روی سرور لندن · رتبه در میان ۴۲ بروکر فهرست‌شده</div></div>

      <div class="cd"><div class="ch"><b>نظرات مشتریان تأییدشده</b><a>۲۱۴ نظر ›</a></div>
        <div style="display:flex;align-items:center;gap:14px;padding-bottom:11px;border-bottom:1px solid var(--ln)">
          <div class="n" style="font-size:30px;font-weight:800;letter-spacing:-.03em">4.3</div>
          <div><div style="display:flex;gap:2px">%s</div>
          <div class="t2">فقط از کاربرانی که استیتمنت حساب آپلود کرده‌اند</div></div></div>%s</div>
    </div>

    <div style="width:290px;flex:none;display:flex;flex-direction:column;gap:14px">
      <div class="cd"><div class="ch"><b>زمان واقعی برداشت</b></div>
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:12px">
          <div class="n up" style="font-size:32px;font-weight:800;letter-spacing:-.04em;line-height:1">18</div>
          <div style="padding-bottom:3px"><div style="font-size:13px;font-weight:700">دقیقه</div><div class="t2">میانه · ۳۴۰ گزارش</div></div></div>
        <div class="kv"><span>تتر (TRC20)</span><b class="n up">~۱۲ دقیقه</b></div>
        <div class="kv"><span>صرافی ریالی</span><b class="n" style="color:var(--wn)">~۲ ساعت</b></div>
        <div class="kv"><span>Perfect Money</span><b class="n up">~۲۰ دقیقه</b></div></div>

      <div class="cd"><div class="ch"><b>تغییرات اخیر</b></div>
        <div style="padding:8px 0;border-bottom:1px solid var(--ln)"><div class="t2 n">۱۲ مهر ۱۴۰۵</div>
          <div style="font-size:12.5px;color:var(--ink2);margin-top:2px">حداقل واریز از $۱۰ به $۵۰ تغییر کرد</div></div>
        <div style="padding:8px 0"><div class="t2 n">۳ مرداد ۱۴۰۵</div>
          <div style="font-size:12.5px;color:var(--ink2);margin-top:2px">لایسنس FSCA آفریقای جنوبی اضافه شد</div></div></div>

      <div class="cd" style="padding-bottom:8px"><div class="ch"><b>جایگزین‌ها</b></div>%s</div>
    </div>
  </div>
</div>''' % (''.join('<span style="font-size:13.5px;color:%s;font-weight:%s">%s</span>'%('var(--br)' if i==1 else 'var(--ink2)','700' if i==1 else '500',t) for i,t in enumerate(['هوم','بروکرها','پراپ‌ها','صرافی‌ها','کوین‌ها','سیگنال‌ها','تقویم','مقالات'])),
  ico(I['srch'],16), stars(4),
  sb, '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  ent, spr, stars(4), rev, alt)
write('WebBroker.dc.html', body)

# ============================================================= LIGHT ALTERNATE
src = open('Brokers.dc.html', encoding='utf-8').read()
LIGHT = ('--bg:#F4F5F8;--sf:#FFFFFF;--sf2:#F8F9FB;--sf3:#EBEEF3;--ln:#E2E6EC;'
         '--ink:#0F1620;--ink2:#3D4A5A;--mut:#7B8799;'
         '--br:#8A6420;--br2:#6C4C16;--brs:#FAF2E2;--tl:#1F7E77;'
         '--up:#0E8A57;--ups:#E3F5EC;--dn:#C93636;--dns:#FBE9E9;--wn:#AE7509;--wns:#FBF1DB;')
src = src.replace('class="ph" style="width:390px;height:844px"',
                  'class="ph" style="width:390px;height:844px;%s"' % LIGHT)
# a couple of atoms that were authored for the dark ground
src = src.replace('background:#2E3A4D;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:13px;color:#0B0E14',
                  'background:#2E3A4D;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:13px;color:#FFFFFF')
open('LightAlt.dc.html','w',encoding='utf-8').write(src)
print('   LightAlt.dc.html', len(src))
