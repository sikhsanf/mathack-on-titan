import sys
from playwright.sync_api import sync_playwright
W,H=int(sys.argv[1]),int(sys.argv[2])
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':W,'height':H})
    pg.goto('file:///home/claude/mathack/test/harness.html')
    pg.evaluate("document.getElementById('f').style.width='%dpx';document.getElementById('f').style.height='%dpx'"%(W,H))
    pg.wait_for_timeout(800)
    f=pg.frame_locator('#f')
    for no in range(1,31):
        pg.evaluate("cmd({type:'ask',level:'k',no:%d,idx:0})"%no);pg.wait_for_timeout(500)
        if f.locator('.bundle-row').count():
            pg.wait_for_timeout(600);pg.screenshot(path='shots/bundle_%d.png'%W);print('bundle at',no)
            print(f.locator('.bundle-box').inner_html()[:500]);break
    b.close()
