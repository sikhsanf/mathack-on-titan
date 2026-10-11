#!/usr/bin/env python3
"""Turn the wife's math app (math_app_v1-14.html) into an embeddable question engine.
Output: src/engine.html  (no PNG icons -> emoji fallback; only world-1 halaman; bridge to parent via postMessage)
Usage: build_engine.py <path to original html>
"""
import re, json, sys

SRC = sys.argv[1]
MAX_NO = int(sys.argv[2]) if len(sys.argv) > 2 else 30   # halaman 1..30 = stages 1-3 = world 1

t = open(SRC, encoding='utf-8').read()

# 1. strip the 346 base64 PNG icons (-> emoji fallback built into the app)
t = re.sub(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', 'data:,', t)
t = re.sub(r'const ICON_IMG_BY_LABEL = \{.*?\};', 'const ICON_IMG_BY_LABEL = {};', t, flags=re.S)
t = re.sub(r'const ICON_IMG_BY_GLYPH = \{.*?\};', 'const ICON_IMG_BY_GLYPH = {};', t, flags=re.S)

# 2. keep only world-1 halaman in the embedded JSON
for k in ('prak', 'k'):
    m = re.search(r'(<script id="all-content-%s" type="application/json">)(.*?)(</script>)' % k, t, re.S)
    data = json.loads(m.group(2))
    data = [h for h in data if h['no'] <= MAX_NO]
    t = t[:m.start(2)] + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + t[m.end(2):]

# 3. embed-mode CSS
EMBED_CSS = """
<style id="embed-css">
html.embed, html.embed body{background:transparent !important;min-height:0 !important;overflow-x:hidden;}
html.embed body{background-attachment:scroll !important;}
.embed .topbar,.embed .bg-decor,.embed #landscapeLock,.embed .stage-topbar,.embed .item-counter,
.embed .page-topic,.embed #stageControls,.embed #feedbackZone,.embed .modal-backdrop,.embed #print-root{display:none !important;}
.embed #app{display:block !important;}
.embed main,.embed #main{padding:0 !important;margin:0 !important;max-width:none !important;}
.embed .screen{padding:0 !important;}
.embed .page-card{margin:0 !important;box-shadow:none !important;background:transparent !important;padding:6px 8px 14px !important;}
.embed .page-instr{margin:0 0 4px !important;font-size:clamp(1rem,2.4vw,1.2rem) !important;text-align:center;}
.embed .stage-area{margin-top:6px !important;min-height:0 !important;gap:12px !important;}
.embed .tenframe{width:min(100%,520px) !important;}
@media screen and (orientation:portrait) and (max-width:900px){ .embed #app{display:block !important;} }
</style>
"""
t = t.replace('</head>', EMBED_CSS + '</head>', 1)

# 4. bridge code, injected inside the app IIFE in place of the splash boot
BRIDGE = r"""
/* ===== Mathack bridge: run the app headless as a question engine ===== */
(function(){
  document.documentElement.classList.add('embed');
  state.activeProfile = {name:'', age:5, avatar:'', lang:'id', level:'k', createdAt:0,
    progress:{starsByStage:{}, completedStages:[], badges:[], resume:{}}};
  try{ SoundFX.setMuted(true); }catch(e){}
  try{ applyStaticI18N(); }catch(e){}
  showScreen('screen-stage');
  function post(o){ try{ parent.postMessage(Object.assign({mx:'evt'}, o), '*'); }catch(e){} }
  // the app reports every answer through showFeedback(correct) -> forward it, no banners / next buttons
  showFeedback = function(correct, ctx){ post({type:'result', ok: !!correct}); };
  goNextItem = function(){};
  function ask(level, no, idx){
    var hal = ALL_CONTENT[level].filter(function(h){ return h.no === no; })[0];
    if(!hal){ post({type:'error', msg:'no halaman '+level+' '+no}); return; }
    state.mapLevel = level;
    state.stagePlay = {stage: hal.stage, level: level, halaman: [hal], halIdx: 0, itemIdx: idx|0, wrong: 0, streak: 0};
    showScreen('screen-stage');
    try{ renderStagePage(); }catch(e){ post({type:'error', msg:String(e && e.stack || e)}); return; }
    var ha = document.getElementById('stageArea'); if(ha) ha.scrollTop = 0; window.scrollTo(0,0);
    post({type:'asked', level: level, no: no, idx: idx|0,
          topik: hal.topik, instruksi: hal.instruksiLayar || hal.instruksi,
          cara: hal.cara, aktivitas: hal.aktivitas, konsep: hal.konsep});
  }
  window.addEventListener('message', function(e){
    var m = e.data; if(!m || m.mx !== 'cmd') return;
    if(m.type === 'lang'){ state.activeProfile.lang = m.lang; try{ applyStaticI18N(); }catch(_){} }
    else if(m.type === 'ask'){ ask(m.level, m.no, m.idx); }
    else if(m.type === 'clear'){ var a = document.getElementById('stageArea'); if(a) a.innerHTML = ''; }
    else if(m.type === 'meta'){ // content catalog for the parent: halaman -> item count + mech kinds
      var out = {};
      Object.keys(ALL_CONTENT).forEach(function(lv){ out[lv] = ALL_CONTENT[lv].map(function(h){
        return {no:h.no, stage:h.stage, topik:h.topik, n:h.items.length}; }); });
      post({type:'meta', data: out});
    }
  });
  post({type:'ready'});
})();
"""
assert t.count('\nrunSplash();\n') == 1
t = t.replace('\nrunSplash();\n', BRIDGE + '\n')

open('src/engine.html', 'w', encoding='utf-8').write(t)
print('engine.html', len(t), 'bytes')
