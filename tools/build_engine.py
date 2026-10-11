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
EMBED_CSS = EMBED_CSS.replace('</style>', open('/home/claude/mathack/src/engine_theme.css').read()+'</style>')
t = t.replace('</head>', EMBED_CSS + '</head>', 1)

# 4. bridge code, injected inside the app IIFE in place of the splash boot
BRIDGE = r"""

  /* 1-to-1 pairing widget for "Kelinci=3, Wortel=2" (the source app only printed this as text) */
  var PAIR_EMO = {'kelinci':'🐰','wortel':'🥕'};
  function mechGenChoice(hal, item, area){
    var m = /^\s*([^=,]+?)\s*=\s*(\d+)\s*,\s*([^=,]+?)\s*=\s*(\d+)\s*$/.exec(item.prompt||'');
    var A = m && PAIR_EMO[m[1].toLowerCase()], B = m && PAIR_EMO[m[3].toLowerCase()];
    if(!m || item.visual || !A || !B) return mechGenChoice0(hal, item, area);
    var na = +m[2], nb = +m[4], need = Math.min(na, nb), made = 0, sel = null;
    var w = document.createElement('div'); w.className = 'pairw';
    var r1 = document.createElement('div'), r2 = document.createElement('div'); r1.className = r2.className = 'prow';
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    function mk(emo, row, side){ var d = document.createElement('div'); d.className = 'pi'; d.textContent = emo; d.dataset.side = side; d.onclick = function(){ tap(d); }; row.appendChild(d); return d; }
    for(var i=0;i<na;i++) mk(A, r1, 'a'); for(var j=0;j<nb;j++) mk(B, r2, 'b');
    w.appendChild(svg); w.appendChild(r1); w.appendChild(r2);
    var hint = document.createElement('div'); hint.className = 'pairhint'; hint.textContent = (state.activeProfile && state.activeProfile.lang === 'en') ? 'Tap a ' + A + ' then a ' + B + ' to pair them' : 'Sentuh ' + A + ' lalu ' + B + ' untuk memasangkan';
    area.appendChild(w); area.appendChild(hint);
    var holder = document.createElement('div'); holder.style.display = 'none'; area.appendChild(holder);
    mechGenChoice0(hal, Object.assign({}, item, {prompt: ''}), holder);
    function center(el){ var a = el.getBoundingClientRect(), b = w.getBoundingClientRect(); return [a.left - b.left + a.width/2, a.top - b.top + a.height/2]; }
    function tap(d){
      if(d.classList.contains('done')) return;
      if(!sel || sel.dataset.side === d.dataset.side){ if(sel) sel.classList.remove('sel'); sel = d; d.classList.add('sel'); return; }
      var x = sel, y = d; sel.classList.remove('sel'); sel = null;
      x.classList.add('done'); y.classList.add('done');
      var p = center(x), q = center(y), ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', p[0]); ln.setAttribute('y1', p[1]); ln.setAttribute('x2', q[0]); ln.setAttribute('y2', q[1]); svg.appendChild(ln);
      made++;
      if(made >= need){ hint.style.display = 'none'; holder.style.display = 'block'; }
    }
  }
/* ===== Mathack bridge: run the app headless as a question engine ===== */
(function(){
  document.documentElement.classList.add('embed');
  state.activeProfile = {name:'', age:5, avatar:'', lang:'id', level:'k', createdAt:0,
    progress:{starsByStage:{}, completedStages:[], badges:[], resume:{}}};
  try{ SoundFX.setMuted(true); }catch(e){}
  try{ applyStaticI18N(); }catch(e){}
  showScreen('screen-stage');
  /* dashed outlines -> soft holes */
  function holify(){ document.querySelectorAll('#stageArea *').forEach(function(el){ if(el.classList.contains('hole')||el.tagName==='svg'||el.closest('svg')) return; var cs=getComputedStyle(el); if(cs.borderTopStyle==='dashed'||cs.borderBottomStyle==='dashed'){ if(parseFloat(cs.borderBottomWidth)>=2 && cs.borderTopStyle==='dashed') el.classList.add('hole'); else el.style.borderBottomColor='var(--ink)'; } }); }
  new MutationObserver(function(){ clearTimeout(holify.h); holify.h=setTimeout(holify,30); }).observe(document.body,{childList:true,subtree:true});
  /* fit content to the panel: highlighter span + auto zoom + gentle centering */
  function fit(){
    var pi=document.getElementById('pageInstr');
    if(pi && !pi.querySelector('.hl') && pi.textContent.trim()){ pi.innerHTML='<span class="hl">'+pi.innerHTML+'</span>'; }
    var app=document.getElementById('app'); if(!app) return;
    document.body.style.zoom=1;
    var need=Math.max(app.scrollHeight, document.documentElement.scrollHeight), avail=window.innerHeight;
    if(need>avail+2){ document.body.style.zoom=Math.max(.5, (avail-4)/need); }
  }
  var fitT; function fitSoon(){ clearTimeout(fitT); fitT=setTimeout(fit,40); }
  new MutationObserver(function(){ fitSoon(); }).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize', function(){ setTimeout(fit,60); });
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
    fit(); setTimeout(fit,120); setTimeout(fit,400); setTimeout(fit,900);
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
t = t.replace('family=Baloo+2:','family=Patrick+Hand&family=Baloo+2:',1)
t = t.replace('function mechGenChoice(hal, item, area){','function mechGenChoice0(hal, item, area){',1)
t = t.replace("if(opts.onTap) opts.onTap();\n    }", "if(opts.onTap) opts.onTap(); else if(opts.dropTargets && opts.dropTargets.length === 1 && opts.onDrop) opts.onDrop(opts.dropTargets[0]);\n    }",1)
t = t.replace('\nrunSplash();\n', BRIDGE + '\n')

open('src/engine.html', 'w', encoding='utf-8').write(t)
print('engine.html', len(t), 'bytes')
