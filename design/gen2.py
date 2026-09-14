# -*- coding: utf-8 -*-
import sys; sys.path.insert(0, '/home/user/Commentfx/design')
from _common import *

stars = lambda n: ''.join('<svg width="12" height="12" viewBox="0 0 24 24" fill="%s" stroke="none"><path d="m12 3 2.6 5.6 6 .8-4.4 4.3 1.1 6.1L12 17l-5.3 2.8 1.1-6.1L3.4 9.4l6-.8L12 3Z"/></svg>' % ('#D9B071' if i<n else '#2A3342') for i in range(5))

# score bars
SB = [('رگولیشن و لایسنس','25٪',9.4,'var(--up)'),('هزینهٔ معامله','20٪',9.1,'var(--up)'),
      ('سرعت برداشت','20٪',9.6,'var(--up)'),('اجرا و پایداری','15٪',8.2,'var(--br)'),
      ('نظرات تأییدشده','10٪',8.0,'var(--br)'),('شفافیت شرکتی','10٪',7.1,'var(--wn)')]
sb = ''
for nm,wt,v,c in SB:
    sb += ('<div style="padding:7px 0"><div style="display:flex;align-items:baseline;gap:7px;margin-bottom:5px">'
      '<span style="font-size:12.5px">%s</span><span class="t2 n">%s</span><div class="sp"></div>'
      '<span class="n" style="font-size:13px;font-weight:800;color:%s">%s</span></div>'
      '<div style="height:5px;border-radius:99px;background:var(--sf3);overflow:hidden">'
      '<div style="height:100%%;width:%s%%;background:%s;border-radius:99px"></div></div></div>') % (nm,wt,c,('%.1f'%v),v*10,c)

# entity rows
ENT = [('Exness (SC) Ltd','سیشل','FSA-SC','شما اینجا','هیچ حفاظتی ندارد',1),
       ('Exness (CY) Ltd','قبرس','CySEC','—','صندوق ICF تا €۲۰٬۰۰۰',0),
       ('Exness (UK) Ltd','انگلیس','FCA','—','صندوق FSCS تا £۸۵٬۰۰۰',0)]
ent = ''
for nm,cty,reg,tag,prot,me in ENT:
    if me:
        ent += ('<div style="border:1.5px solid var(--wn);background:var(--wns);border-radius:12px;padding:11px 12px;margin-bottom:7px">'
          '<div style="display:flex;align-items:center;gap:7px"><span class="n" style="font-size:13px;font-weight:800">%s</span>'
          '<span class="tg" style="border-color:var(--br2);color:var(--br)">%s</span><div class="sp"></div>'
          '<span style="font-size:10.5px;font-weight:800;color:#0B0E14;background:var(--wn);padding:2px 8px;border-radius:6px">%s</span></div>'
          '<div style="display:flex;align-items:center;gap:6px;margin-top:7px">%s<span style="font-size:11.5px;color:var(--wn);font-weight:600">%s</span></div>'
          '<div class="t2" style="margin-top:3px">کشور ثبت: %s</div></div>') % (nm,reg,tag,ico(I['alert'],14,'var(--wn)',2),prot,cty)
    else:
        ent += ('<div style="border:1px solid var(--ln);border-radius:12px;padding:10px 12px;margin-bottom:7px;opacity:.62">'
          '<div style="display:flex;align-items:center;gap:7px"><span class="n" style="font-size:12.5px;font-weight:700">%s</span>'
          '<span class="tg">%s</span></div>'
          '<div style="display:flex;align-items:center;gap:6px;margin-top:6px">%s<span style="font-size:11px;color:var(--up)">%s</span></div></div>'
          ) % (nm,reg,ico(I['shld'],13,'var(--up)',2),prot)

# spreads
SP = [('EURUSD','0.7','0.9','۳','var(--up)'),('XAUUSD','1.4','1.8','۵','var(--up)'),
      ('GBPUSD','1.1','1.2','۷','var(--br)'),('BTCUSD','24','31','۲','var(--up)')]
spr = ''
for sym,live,avg,rank,c in SP:
    spr += ('<div class="kv"><span class="n" style="color:var(--ink);font-weight:600">%s</span>'
      '<div class="sp"></div><span class="t2 n" style="margin-left:14px">میانگین ۳۰ روز %s</span>'
      '<b class="n" style="font-size:14px;color:%s;margin-left:10px">%s</b>'
      '<span class="tg" style="border-color:var(--br2);color:var(--br)">رتبه %s</span></div>') % (sym,avg,c,live,rank)

# withdrawal distribution
dist = [('زیر ۱۵د',62),('۱۵–۶۰د',24),('۱–۶س',9),('بالای ۶س',5)]
wd = ''.join('<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">'
   '<div class="n" style="font-size:10.5px;color:var(--ink2);font-weight:700">%d%%</div>'
   '<div style="width:100%%;height:%dpx;border-radius:5px 5px 0 0;background:linear-gradient(to top,var(--br2),var(--br))"></div>'
   '<div class="t2" style="font-size:9.5px">%s</div></div>' % (p, 14+p*0.85, lbl) for lbl,p in dist)

# reviews
REV = [('م','#4A7BD9','مهران ر.','۴ روز پیش',5,'برداشت تتر در کمتر از ۱۰ دقیقه انجام شد. اسپرد طلا موقع خبر باز می‌شود ولی در حد معقول.','حساب استاندارد · ۸ ماه',None),
       ('ن','#8A6BD9','نیما ک.','۲ هفته پیش',3,'اجرا سریع است اما در NFP اسلیپیج زیادی داشتم. پشتیبانی فارسی جواب داد ولی کند.','حساب سنت · ۳ ماه','ممنون از بازخوردتان. در زمان انتشار اخبار، اسپرد شناور است؛ پیشنهاد می‌کنیم از حساب Raw استفاده کنید.')]
rev = ''
for ini,col,nm,dt,st,txt,meta,reply in REV:
    rp = ''
    if reply:
        rp = ('<div style="margin-top:9px;padding:9px 11px;background:var(--sf2);border-right:2px solid var(--br);border-radius:0 9px 9px 0">'
          '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">%s<span style="font-size:11px;font-weight:700;color:var(--br)">پاسخ رسمی Exness</span></div>'
          '<div class="t2" style="color:var(--ink2);line-height:1.7">%s</div></div>') % (ico(I['shld'],12,'var(--br)',2), reply)
    rev += ('<div style="padding:12px 0;border-bottom:1px solid var(--ln)">'
      '<div style="display:flex;align-items:center;gap:8px">'
      '<div style="width:28px;height:28px;border-radius:50%%;background:%s;display:grid;place-items:center;font-size:12px;font-weight:700;flex:none">%s</div>'
      '<div><div style="display:flex;align-items:center;gap:5px"><span class="t1">%s</span>'
      '<span class="tg g" style="display:inline-flex;align-items:center;gap:3px">%s مشتری تأییدشده</span></div>'
      '<div class="t2">%s</div></div><div class="sp"></div><div style="display:flex;gap:1.5px">%s</div></div>'
      '<div style="font-size:12.5px;color:var(--ink2);line-height:1.8;margin-top:8px">%s</div>'
      '<div class="t2" style="margin-top:5px">%s</div>%s</div>'
      ) % (col,ini,nm,ico(I['chk'],9,'var(--up)',3),dt,stars(st),txt,meta,rp)

# alternatives
ALT = [('IC','#2E3A4D','IC Markets','اسپرد کمتر (0.1) · حداقل $200','8.7'),
       ('AM','#4A7BD9','Amarkets','واریز ریالی مستقیم','8.1'),
       ('RB','#8A6BD9','RoboForex','اهرم بالاتر · بدون FCA','7.9')]
alt = ''.join('<div class="rw"><div class="av" style="background:%s">%s</div>'
  '<div style="min-width:0"><div class="t1 n">%s</div><div class="t2">%s</div></div>'
  '<div class="sp"></div><span class="sc">%s</span>%s</div>' % (c,i,n,d,s,ico(I['fwd'],15,'var(--mut)'))
  for i,c,n,d,s in ALT)

body = '''<div class="ph" style="width:390px;height:2440px">
  <div style="background:linear-gradient(165deg,#1B2331 0%%,#12171F 62%%);padding:16px 16px 18px;flex:none;border-bottom:1px solid var(--ln)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div class="ic" style="background:rgba(255,255,255,.05)">%s</div><div class="sp"></div>
      <div class="ic" style="background:rgba(255,255,255,.05)">%s</div>
      <div class="ic" style="background:rgba(255,255,255,.05)">%s</div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:13px">
      <div style="width:58px;height:58px;border-radius:17px;background:#FFD84D;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:19px;color:#0B0E14;flex:none">E</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="n" style="font-size:21px;font-weight:800;letter-spacing:-.03em">Exness</span>
          <span class="t2" style="font-size:12px">اکسنس</span></div>
        <div style="display:flex;gap:4px;margin-top:7px;flex-wrap:wrap">
          <span class="tg" style="border-color:#3A4759">FCA · ۷۳۰۷۲۹</span><span class="tg" style="border-color:#3A4759">CySEC · ۱۷۸/۱۲</span><span class="tg" style="border-color:#3A4759">FSA-SC</span></div>
      </div>
      <div style="text-align:center;flex:none">
        <div class="n" style="font-size:30px;font-weight:800;color:var(--br);letter-spacing:-.04em;line-height:1">8.9</div>
        <div class="t2" style="font-size:10px">از ۱۰</div></div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:14px;padding:8px 11px;background:var(--ups);border:1px solid #2E4A3C;border-radius:10px">
      <i style="width:7px;height:7px;border-radius:50%%;background:var(--up);flex:none"></i>
      <span style="font-size:11.5px;color:var(--up);font-weight:600">وضعیت ۲۴ ساعت اخیر: عادی</span>
      <div class="sp"></div><span class="t2">۰ گزارش اختلال</span></div>
  </div>

  <div style="display:flex;border-bottom:1px solid var(--ln);flex:none">%s</div>

  <div style="display:flex;gap:9px;padding:13px 16px;flex:none">
    <div class="btn" style="flex:2">افتتاح حساب</div>
    <div class="btn2" style="flex:1">%s مقایسه</div>
  </div>
  <div class="t2" style="padding:0 16px 12px;text-align:center;flex:none;font-size:10px">با کلیک روی این دکمه ممکن است کمیسیون دریافت کنیم — امتیاز بالا از این بابت تغییر نمی‌کند.</div>

  <div style="display:flex;flex-direction:column;gap:11px;padding:0 16px 16px">

    <div class="cd"><div class="ch"><b>امتیاز تفکیکی</b><a>روش‌شناسی ›</a></div>%s</div>

    <div class="cd" style="border-color:var(--br2)">
      <div class="ch"><b>شما زیر کدام شرکت ثبت می‌شوید؟</b></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span class="t2">کشور اقامت</span>
        <div style="display:inline-flex;align-items:center;gap:6px;background:var(--sf2);border:1px solid var(--ln);border-radius:9px;padding:6px 11px;font-size:12.5px;font-weight:600">ایران %s</div>
      </div>%s
      <div class="t2" style="margin-top:4px;line-height:1.75">بروکر تبلیغ FCA می‌کند، ولی کاربران خارج از اروپا زیر شرکت سیشل ثبت می‌شوند. در صورت اختلاف، مرجع رسیدگی FSA سیشل است.</div>
    </div>

    <div class="cd"><div class="ch"><b>اسپرد زنده</b><span class="lv"><i></i>به‌روز</span></div>%s
      <div class="t2" style="margin-top:9px">میانگین از حساب دمو · هر ۶۰ ثانیه · رتبه در میان ۴۲ بروکر</div></div>

    <div class="cd">
      <div class="ch"><b>زمان واقعی برداشت</b><span class="t2 n">۳۴۰ گزارش · ۹۰ روز</span></div>
      <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:14px">
        <div class="n" style="font-size:32px;font-weight:800;letter-spacing:-.04em;line-height:1;color:var(--up)">18</div>
        <div style="padding-bottom:3px"><div style="font-size:13px;font-weight:700">دقیقه</div><div class="t2">میانهٔ زمان برداشت</div></div>
      </div>
      <div style="display:flex;gap:7px;align-items:flex-end;height:100px">%s</div>
      <div style="margin-top:12px;border-top:1px solid var(--ln);padding-top:10px">
        <div class="kv"><span>تتر (TRC20)</span><b class="n up">~۱۲ دقیقه</b></div>
        <div class="kv"><span>صرافی ریالی واسط</span><b class="n" style="color:var(--wn)">~۲ ساعت</b></div>
        <div class="kv"><span>Perfect Money</span><b class="n up">~۲۰ دقیقه</b></div>
      </div>
    </div>

    <div class="cd"><div class="ch"><b>نظرات تأییدشده</b><a>۲۱۴ نظر ›</a></div>
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:10px;border-bottom:1px solid var(--ln)">
        <div class="n" style="font-size:26px;font-weight:800;letter-spacing:-.03em">4.3</div>
        <div><div style="display:flex;gap:2px">%s</div><div class="t2">فقط از کاربرانی که استیتمنت آپلود کرده‌اند</div></div>
      </div>%s</div>

    <div class="cd" style="padding-bottom:6px"><div class="ch"><b>جایگزین‌ها</b></div>%s</div>
  </div>
</div>''' % (ico(I['back'],19), ico(I['star'],19), ico(I['glob'],19),
  ''.join('<div style="flex:1;text-align:center;padding:12px 4px;font-size:12.5px;%s">%s</div>' %
     ('color:var(--br);font-weight:700;border-bottom:2px solid var(--br)' if i==0 else 'color:var(--mut)', t)
     for i,t in enumerate(['نمای کلی','اسپرد','برداشت','نظرات','مقالات'])),
  ico(I['plus'],15), sb,
  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  ent, spr, wd, stars(4), rev, alt)
write('BrokerDetail.dc.html', body)
