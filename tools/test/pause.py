from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1200)
    pg.click('#b-play');pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(500)
    pg.fill('#in-name','Z');pg.click('#st-ok');pg.wait_for_timeout(500)
    pg.click('#b-go');pg.evaluate('startStage(0)');pg.wait_for_timeout(1500)
    pg.click('#p-pause');pg.wait_for_timeout(500);print('play paused',pg.evaluate('__G.paused'));pg.screenshot(path='shots/pause_play.png')
    pg.click('#pa-resume');pg.evaluate('__G.hx=26')
    for i in range(60):
        if pg.evaluate('(__G.D&&__G.D.state)||null')=='ask':break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1200)
    pg.click('#d-pausebtn');pg.wait_for_timeout(500);print('duel paused',pg.evaluate('__G.paused'));pg.screenshot(path='shots/pause_duel.png')
    pg.click('#pa-resume');pg.wait_for_timeout(300);print('resumed',pg.evaluate('__G.paused'))
    b.close()
