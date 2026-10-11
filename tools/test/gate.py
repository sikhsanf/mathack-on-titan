from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1200)
    pg.click('#b-parent');pg.wait_for_timeout(400);pg.click('#jn-make');pg.wait_for_timeout(400)
    pg.click('#g-who button >> nth=1');pg.fill('#g-name','Papa');pg.screenshot(path='shots/gate.png')
    pg.fill('#g-a',str(pg.evaluate('GATE.ans')));pg.click('#g-ok');pg.wait_for_timeout(500)
    print(pg.evaluate('JSON.stringify(DB.parents)'),errs);b.close()
