from playwright.sync_api import sync_playwright
W,H=390,440
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':W,'height':H+20})
    pg.goto('file:///home/claude/mathack/test/harness.html')
    pg.evaluate("document.getElementById('f').style.width='%dpx';document.getElementById('f').style.height='%dpx'"%(W,H));pg.wait_for_timeout(800)
    pg.evaluate("EV.length=0;cmd({type:'ask',level:'k',no:8,idx:0})");pg.wait_for_timeout(400)
    fr=pg.frames[1]
    t=fr.locator('.bond-tile').last.bounding_box();d=fr.locator('#bondBlank').bounding_box()
    fo=pg.locator('#f').bounding_box()
    print(t,d,fo)
    x0=fo['x']+t['x']+t['width']/2;y0=fo['y']+t['y']+t['height']/2;x1=fo['x']+d['x']+d['width']/2;y1=fo['y']+d['y']+d['height']/2
    pg.mouse.move(x0,y0);pg.mouse.down();pg.mouse.move((x0+x1)/2,(y0+y1)/2,steps=5);pg.mouse.move(x1,y1,steps=5);pg.mouse.up();pg.wait_for_timeout(400)
    print(pg.evaluate('JSON.stringify(EV)'))
    print(fr.evaluate("document.getElementById('bondBlank').className+' '+document.getElementById('bondBlank').textContent"))
    b.close()
