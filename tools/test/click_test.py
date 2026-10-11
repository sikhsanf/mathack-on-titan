import sys
from playwright.sync_api import sync_playwright
W,H=390,440
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':W,'height':H+20})
    pg.goto('file:///home/claude/mathack/test/harness.html')
    pg.evaluate("document.getElementById('f').style.width='%dpx';document.getElementById('f').style.height='%dpx'"%(W,H))
    pg.wait_for_timeout(800)
    for lv,no in [('k',8),('k',12),('k',18),('k',21),('prak',2)]:
        pg.evaluate("EV.length=0;cmd({type:'ask',level:'%s',no:%d,idx:0})"%(lv,no));pg.wait_for_timeout(300)
        fr=pg.frames[1]
        print(lv,no,fr.evaluate("Array.from(document.querySelectorAll('#stageArea button, #stageArea [onclick], .bond-choice, .bubble')).map(e=>e.className+':'+e.textContent.trim().slice(0,6)).slice(0,12)"))
        # try clicking each bubble/choice
        for sel in ['.bubble','.bond-choice','.choice-pill','.np-key[data-k="1"]']:
            n=fr.locator(sel).count()
            if n:
                fr.locator(sel).first.click(timeout=2000);pg.wait_for_timeout(300)
                print('  clicked',sel,pg.evaluate('EV.map(e=>e.type+(e.ok!==undefined?":"+e.ok:""))'))
                break
    b.close()
