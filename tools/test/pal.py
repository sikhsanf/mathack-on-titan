from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1200)
    pg.click('#b-play');pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(500)
    pg.fill('#in-name','Z');pg.click('#st-ok');pg.wait_for_timeout(500)
    pg.evaluate("__G.slot.prog.friends.push('sprout','jelly','matahari');goHome()");pg.wait_for_timeout(2500)
    # project pal screen pos
    pos=pg.evaluate("""(()=>{const out=[];__G.pals.forEach(p=>{const h=p.isMon?p.def.h*p.baseS*.5:3;const v=new THREE.Vector3(p.root.position.x,h,p.root.position.z).project(cam);out.push([(v.x*.5+.5)*innerWidth,(-v.y*.5+.5)*innerHeight])});return out})()""")
    print(pos)
    pos[2]=[85,350]
    for i,(x,y) in enumerate(pos):
        pg.mouse.click(x,y);pg.wait_for_timeout(500);pg.screenshot(path=f'shots/pal_{i}.png')
        print(i,pg.evaluate("[document.querySelector('#pal-bubble').textContent,document.querySelector('#pal-bubble').className]"))
    print(errs);b.close()
