import sys
from playwright.sync_api import sync_playwright
W,H=830,450
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':W,'height':H})
    pg.goto('file:///home/claude/mathack/test/harness.html')
    pg.evaluate("document.getElementById('f').style.width='%dpx';document.getElementById('f').style.height='%dpx'"%(W,H))
    pg.wait_for_timeout(800)
    for no in range(1,13):
        pg.evaluate("cmd({type:'ask',level:'k',no:%d,idx:0})"%no);pg.wait_for_timeout(900)
        t=pg.frame_locator('#f').locator('#tfGrid').count()
        if t: pg.screenshot(path='shots/wide_tf.png');print('tf at',no);break
    b.close()
