import json,sys,os,shutil,time
R='/home/claude/mathack/';S=R+'src/';ez='/home/claude/sikhsanf/ezventure/ui-kit/'
rd=lambda f:open(S+f,encoding='utf8').read()
engjs=json.dumps(rd('engine.html')).replace('</','<\\/')
js=rd('kit.js')+'\n'+rd('p1_data.js')+'\n'+rd('p2_three.js')+'\nconst ENGINE_HTML='+engjs+';\n'+rd('p3_flow.js')
three=open(R+'node_modules/three/build/three.min.js',encoding='utf8').read()
head=('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">'
 '<title>Mathack on Titan</title><meta name="theme-color" content="#bfe8ff">'
 '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" type="image/png" href="favicon.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">'
 '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Mathack"><meta name="apple-mobile-web-app-status-bar-style" content="default">')
html='<!doctype html><html lang="id"><head>'+head+open(ez+'fonts.html').read()+'<style>'+open(ez+'ezui.css').read()+'\n'+rd('game.css')+'</style></head><body>'+rd('body.html')+'<script>'+three+'</script><script>'+open(ez+'ezui.js').read()+'</script><script>'+js+'</script></body></html>'
D=R+'dist/';shutil.rmtree(D,ignore_errors=True);os.makedirs(D)
open(D+'index.html','w',encoding='utf8').write(html)
for f in os.listdir(R+'pwa'):shutil.copy(R+'pwa/'+f,D+f)
sw=open(D+'sw.js').read().replace('__VER__','mx-'+str(int(time.time())));open(D+'sw.js','w').write(sw)
print('dist',len(html)//1024,'KB')
