/* ===== Mathack on Titan — game flow ===== */
const G={mode:'title',slot:null,si:-1,hero:null,petM:null,petId:-1,homeObj:null,world:null,stageIdx:0,tIdx:0,titans:[],mascot:null,
  hx:0,hy:0,hvy:0,onGround:true,walking:false,paused:false,jumpReq:false,
  atkT:-1,atkSpawned:false,hurt:0,faint:false,cheer:0,proj:null,D:null,runCoins:0,runWrong:0,runRight:0,defaultLook:{g:0,skin:1,hair:0,hs:0,outfit:0,hat:0,pet:0},
  edit:null,tipT:0};
const ENG={ready:false,meta:false,frame:null,loaded:false};
let CAT=null,TT=0,lastT=performance.now();
const SPEED=3.6;

/* ---------- helpers ---------- */
function toast(msg,ms){const e=$('#toast');e.textContent=msg;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),ms||2200);}
const SCREENS=['s-title','s-slots','s-home','s-map','s-play','s-duel','s-parent'];
function showScreen(id){SCREENS.forEach(s=>$('#'+s).classList.toggle('show',s===id));}
function applyLang(){
  document.documentElement.lang=LANG;
  $('#t-tag').textContent=t('tagline');$('#b-play').textContent='▶ '+t('play');$('#t-slots').textContent=t('slots');
  $('#b-slots-back').textContent='← '+t('back');$('#b-style').textContent='👕 '+t('homeStyle');$('#b-go').textContent='▶ '+t('homePlay');$('#b-parent').textContent=t('parentBtn');$('#b-coop').textContent='👨‍👩‍👦 '+t('coop');$('#co-title').textContent='👨‍👩‍👦 '+t('coopTitle');$('#co-close').textContent=t('close');$('#co-sim').textContent=t('coopSim');
  $('#b-lang').textContent=LANG.toUpperCase();$('#b-lang2').textContent=LANG.toUpperCase();
  $('#st-back').textContent=t('cancel');$('#st-ok').textContent='✓ '+t('done');
  $('#p-jump').textContent='⤒ '+t('jump');setWalkUI();$('#pa-title').textContent=t('paused');$('#pa-quit').textContent=t('quit');$('#pa-resume').textContent='▶ '+t('resume');
  $('#r-again').textContent=t('again');$('#r-map').textContent=t('toMap');
  $('#pr-title').textContent='👨‍👩‍👧 '+t('pTitle');$('#pr-close').textContent=t('close');$('#pr-add').textContent='+ '+t('pAdd');
  $('#g-title').textContent='🔒 '+t('gTitle');$('#g-cancel').textContent=t('cancel');$('#g-ok').textContent=t('gCheck');
  $('#c-no').textContent=t('cancel');$('#c-yes').textContent=t('delete');$('#rot-t').textContent=t('rotate');
  if(G.slot)refreshHomeHud();
  if(ENG.ready)engCmd({type:'lang',lang:LANG});
  if($('#s-slots').classList.contains('show'))renderSlots();
  if($('#s-map').classList.contains('show'))renderMap();
  if($('#d-style').classList.contains('show')&&G.edit)renderStyle(true);
}
function setLang(l){LANG=l;DB.lang=l;saveDB();applyLang();}
function nameOf(kind,i){const T=TX[LANG];if(kind==='hat')return T.hatNames[i]||'';if(kind==='out')return T.outNames[i];if(kind==='pet')return T.petNames[i];if(kind==='titan')return T.titanNames[i];return '';}

/* ---------- engine (the wife's question app, in an iframe) ---------- */
function engCmd(o){try{ENG.frame.contentWindow.postMessage(Object.assign({mx:'cmd'},o),'*');}catch(e){}}
function engInit(){
  const f=document.createElement('iframe');f.id='eng';f.setAttribute('title','questions');f.srcdoc=ENGINE_HTML;
  $('#duelPanel').insertBefore(f,$('#duelPanel .cover'));ENG.frame=f;
}
addEventListener('message',e=>{
  const m=e.data;if(!m||m.mx!=='evt')return;
  if(m.type==='ready'){ENG.ready=true;engCmd({type:'lang',lang:LANG});engCmd({type:'meta'});}
  else if(m.type==='meta'){CAT=m.data;ENG.meta=true;}
  else if(m.type==='result'){if(G.mode==='duel'&&G.D&&G.D.state==='ask')onAnswer(!!m.ok);}
  else if(m.type==='error'){console.warn('engine',m.msg);if(G.mode==='duel'&&G.D&&G.D.state==='ask')setTimeout(nextQ,30);}
  else if(m.type==='asked'){if(G.D)G.D.info=m;}
});
function pickQ(){
  const lvl=G.slot.lvl,st=STAGES[G.stageIdx].id,D=G.D;
  let hals=(CAT&&CAT[lvl]||[]).filter(h=>h.stage===st);
  if(!hals.length)hals=Array.from({length:10},(_,i)=>({no:(st-1)*10+i+1,n:5}));
  const c=[];let tot=0;
  hals.forEach(h=>{for(let i=0;i<(h.n||5);i++){const k=lvl+':'+h.no+':'+i;if(D.recent.includes(k))continue;const w=1+2*Math.min(4,G.slot.miss[lvl+':'+h.no]||0);tot+=w;c.push({no:h.no,idx:i,k,w});}});
  let r=Math.random()*tot,q=c[0];for(const x of c){r-=x.w;if(r<=0){q=x;break;}}
  D.recent.push(q.k);if(D.recent.length>10)D.recent.shift();
  return {level:lvl,no:q.no,idx:q.idx};
}

/* ---------- sky ---------- */
const SKYC={};
function skyTex(top,bot){const k=top+bot;if(SKYC[k])return SKYC[k];const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,top);g.addColorStop(.7,bot);g.addColorStop(1,bot);x.fillStyle=g;x.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return SKYC[k]=t;}
let SUN=null;
function ensureSun(){if(SUN)return;SUN=new THREE.Group();[[14,'#fff7c2',.35],[9,'#ffe98a',.55],[5.5,'#ffd84a',1]].forEach(a=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a[0],a[0],1),new THREE.MeshBasicMaterial({color:a[1],transparent:a[2]<1,opacity:a[2],fog:false,depthWrite:false}));SUN.add(m);});scene.add(SUN);}
function fxFlash(cls){const e=$('#fx');e.className='';void e.offsetWidth;e.className=cls;}
/* ---------- scene objects ---------- */
function rebuildHero(look){
  if(G.hero){scene.remove(G.hero.root);disposeGroup(G.hero.root);}
  G.hero=buildKid(look);scene.add(G.hero.root);
  if(G.petId!==look.pet){if(G.petM){scene.remove(G.petM.root);disposeGroup(G.petM.root);G.petM=null;}G.petId=look.pet;if(look.pet>0){G.petM=petModel(look.pet);scene.add(G.petM.root);}}
}
function curLook(){return G.edit?G.edit.look:(G.slot?G.slot.look:G.defaultLook);}
function initScenes(){
  G.homeObj=buildHome();scene.add(G.homeObj.g);
  G.chase=buildChase();scene.add(G.chase.g);
  G.chaseT=buildTitan(Object.assign({},TITANS.tunas,{s:.85}));G.chaseT.root.rotation.y=Math.PI/2;G.chase.g.add(G.chaseT.root);
  G.pals=[];G.palSig='';
  G.parent=null;
  rebuildHero(G.defaultLook);
}
function rebuildPals(){
  const fr=(G.slot&&G.slot.prog.friends)||[],sig=G.si+':'+fr.join(',');if(sig===G.palSig)return;G.palSig=sig;
  (G.pals||[]).forEach(m=>{scene.remove(m.root);disposeGroup(m.root);});G.pals=[];
  const MS=[[-2.1,-.7],[2.2,-1.1],[-2.7,-2.7],[2.9,-3.0],[-1.0,-4.3],[1.5,-4.8],[-3.3,-5.2],[3.5,-5.6]];
  const TS=[[-3.1,-8.5],[3.5,-9.2],[.2,-12]];
  let mi=0,ti=0;
  fr.forEach(k=>{
    if(MONDEF[k]){const p=MS[mi++%MS.length];const m=buildMonster(k,.85);m.root.position.set(p[0],0,p[1]);m.root.rotation.y=p[0]<0?.7:-.7;m.star.visible=false;scene.add(m.root);G.pals.push(m);}
    else if(TITANS[k]){const p=TS[ti++%TS.length];const T=buildTitan(Object.assign({},TITANS[k],{s:.55}));T.root.position.set(p[0],0,p[1]);T.root.rotation.y=p[0]<0?.5:-.5;T.wave=1;T.key=T.dkey=k;T.star.visible=false;scene.add(T.root);G.pals.push(T);}
  });
  if(G.mode)setVisible(G.mode);
}
function addFriend(k){const f=G.slot.prog.friends;if(f.includes(k))return false;f.push(k);saveDB();return true;}
function setVisible(mode){
  const home=mode==='title'||mode==='slots'||mode==='home'||mode==='edit';
  const play=mode==='play'||mode==='duel'||mode==='result';
  const chase=mode==='title'||mode==='slots';
  G.homeObj.g.visible=mode==='home'||mode==='edit'||mode==='parent';G.chase.g.visible=chase;G.pals.forEach(m=>m.root.visible=mode==='home'||mode==='edit'||mode==='parent');if(G.parent)G.parent.root.visible=mode==='home'||mode==='parent'||mode==='play'||mode==='duel'||mode==='result';
  if(G.world)G.world.g.visible=play;G.titans.forEach(T=>{if(!T.gone||T.follow)T.root.visible=play;});
  if(G.mapObj)G.mapObj.g.visible=mode==='map';
  const showHero=home||play||mode==='map'||mode==='parent';G.hero.root.visible=showHero;if(G.petM)G.petM.root.visible=showHero;
  ensureSun();SUN.visible=play&&!!G.world;
  scene.background=play&&G.world?skyTex('#6fb0df',STAGES[G.stageIdx].fog):skyTex('#86bde6','#d8ecf5');
  scene.fog=play&&G.world?new THREE.Fog(STAGES[G.stageIdx].fog,45,130):new THREE.Fog('#cfe3ee',40,100);
}
function setMode(m){
  G.mode=m;setVisible(m);coopPush();
  if(m==='title'||m==='slots'||m==='home'||m==='edit'||m==='parent'){AU.kind='home';}else if(m==='play')AU.kind='walk';else if(m==='duel')AU.kind='duel';
}

/* ---------- title / slots ---------- */
function goTitle(){
  setMode('title');showScreen('s-title');EZUI.hide('d-style');
  const lk=(DB.last>=0&&DB.slots[DB.last])?DB.slots[DB.last].look:G.defaultLook;rebuildHero(lk);
  heroHome();homeCam(true);
}
function homeCam(snap){
  const pt=innerHeight>innerWidth;
  if(G.mode==='title'||G.mode==='slots'){camTo(pt?-.5:-.6,pt?3.4:3.3,pt?9.5:11.5,pt?-.5:-.6,pt?3.4:2.4,0,3,snap);return;}
  const px=G.parent?.9:0;camTo(px+(pt?-.2:0),3.1,pt?9.2:10,px+(pt?-.2:0),1.7,.6,3,snap);}
function heroHome(){
  const r=G.hero.root,pa=!!G.parent;r.position.set(pa?-.5:.6,0,1.0);r.rotation.y=pa?.5:.35;r.scale.setScalar(1);
  if(G.petM){G.petM.root.position.set(pa?-2.1:2.0,0,1.6);G.petM.root.rotation.y=pa?.6:-.3;}
  if(G.parent){G.parent.root.scale.setScalar(1.28);G.parent.root.position.set(1.5,0,.8);G.parent.root.rotation.y=-.35;}
}
function renderSlots(){
  const row=$('#slotrow');row.innerHTML='';
  DB.slots.forEach((s,i)=>{
    const d=document.createElement('div');d.className='slot'+(s?'':' empty');
    if(s){const stars=Object.values(s.prog.stars).reduce((a,b)=>a+b,0);
      d.innerHTML='<div class="av">'+(s.look.g?'👧':'👦')+'</div><div class="nm"></div><div class="mt">'+(s.lvl==='prak'?'Pra-K':'K')+' · ⭐ '+stars+' · 🪙 '+s.coins+'</div><button class="del" aria-label="del">✕</button>';
      d.querySelector('.nm').textContent=s.name;
      d.querySelector('.del').onclick=ev=>{ev.stopPropagation();confirmDel(i);};
      d.onclick=()=>pickSlot(i);
    }else{d.innerHTML='<div class="av">➕</div><div class="nm">'+t('newChar')+'</div>';d.onclick=()=>newChar(i);}
    row.appendChild(d);
  });
}
function openSlots(){setMode('slots');showScreen('s-slots');renderSlots();SFX.tap();}
function confirmDel(i){
  $('#c-title').textContent=t('delTitle');$('#c-body').textContent=t('delBody');
  $('#c-yes').onclick=()=>{DB.slots[i]=null;if(DB.last===i)DB.last=-1;saveDB();EZUI.hide('d-confirm');renderSlots();};
  $('#c-no').onclick=()=>EZUI.hide('d-confirm');EZUI.show('d-confirm');
}
function pickSlot(i){
  G.si=i;G.slot=DB.slots[i];DB.last=i;saveDB();
  rebuildHero(G.slot.look);goHome();
}
function newChar(i){
  G.si=i;const base=sanSlot({name:'',lvl:'k',look:Object.assign({},G.defaultLook),coins:40});
  G.edit={isNew:true,slotIndex:i,look:Object.assign({},base.look),tmp:base,tab:'hair',orig:null};
  rebuildHero(G.edit.look);openStyleUI();
}

/* ---------- home ---------- */
function refreshHomeHud(){
  coopPush();
  if(G.slot&&$('#h-wtitle')){const st=Object.values(G.slot.prog.stars||{}).reduce((a,b)=>a+b,0),tot=STAGES.length*3;$('#h-wtitle').textContent='🌼 '+t('wTitle');$('#h-wbar').style.width=Math.round(st/tot*100)+'%';$('#h-wstars').textContent='⭐ '+st+' / '+tot+'  ·  '+t('stagesLeft');}
  coopUI();$('#h-name').textContent=(G.slot.look.g?'👧 ':'👦 ')+G.slot.name;$('#h-coins').textContent='🪙 '+G.slot.coins;$('#m-coins').textContent='🪙 '+G.slot.coins;$('#p-coins').textContent='🪙 '+G.slot.coins;}
/* ---------- co-op (PeerJS): child phone = host with a code, parent phone = guest with perks ---------- */
const CODE_AL='ABCDEFGHJKMNPQRSTUVWXYZ23456789',PEER_PRE='mxt-';
const PQ=new URLSearchParams(location.search);
const PEER_OPTS=PQ.get('peerhost')?{host:PQ.get('peerhost'),port:+(PQ.get('peerport')||9000),path:'/',secure:PQ.get('peersecure')==='1',debug:0}:{debug:0};
const COOP={role:null,st:'idle',code:'',peer:null,conn:null,err:'',perks:{heal:2,power:2,shield:2,gift:1},buff:{power:false,shield:false},lastPerk:0,lastPush:0,pt:0,remote:null};
const PERK_MAX={heal:2,power:2,shield:2,gift:1};
function mkCode(){let s='';for(let i=0;i<5;i++)s+=CODE_AL[Math.floor(Math.random()*CODE_AL.length)];return s;}
function csend(c,o){if(c&&c.open){try{c.send(o);}catch(e){}}}
function parentLook(ic){const dad=ic==='👨';return {g:dad?0:1,skin:1,hair:0,hs:dad?0:2,outfit:dad?1:3,hat:0,pet:0};}
function resetPerks(){COOP.perks=Object.assign({},PERK_MAX);COOP.buff={power:false,shield:false};}
/* --- host side (child phone) --- */
function coopHostStart(tries){
  tries=tries||0;if(COOP.peer&&COOP.role==='host')return;
  if(typeof Peer==='undefined'){COOP.st='err';COOP.err='net';renderCoopDlg();return;}
  COOP.role='host';COOP.st='wait';COOP.err='';COOP.code=mkCode();renderCoopDlg();
  let p;try{p=new Peer(PEER_PRE+COOP.code,PEER_OPTS);}catch(e){COOP.st='err';COOP.err='net';renderCoopDlg();return;}
  COOP.peer=p;
  p.on('open',()=>{COOP.st='wait';renderCoopDlg();});
  p.on('error',err=>{
    if(err&&err.type==='unavailable-id'&&tries<4){try{p.destroy();}catch(e){}COOP.peer=null;COOP.role=null;coopHostStart(tries+1);return;}
    COOP.st='err';COOP.err='net';try{p.destroy();}catch(e){}COOP.peer=null;COOP.role=null;renderCoopDlg();
  });
  p.on('disconnected',()=>{try{p.reconnect();}catch(e){}});
  p.on('connection',c=>{
    c.on('data',d=>hostData(c,d));
    c.on('close',()=>{if(COOP.conn===c){COOP.conn=null;coopLeave();}});
    c.on('error',()=>{});
  });
}
function hostData(c,d){
  if(!d||typeof d!=='object')return;
  if(d.t==='hello'){
    if(COOP.conn&&COOP.conn!==c&&COOP.conn.open){csend(c,{t:'busy'});setTimeout(()=>{try{c.close();}catch(e){}},400);return;}
    COOP.conn=c;resetPerks();
    coopJoin({name:String(d.name||'').slice(0,12)||(LANG==='id'?'Mama':'Mom'),ic:d.ic==='👨'?'👨':'👩'});
    csend(c,{t:'welcome',name:G.slot?G.slot.name:'',look:G.slot?G.slot.look:G.defaultLook,lang:LANG});
    coopPush(true);
  }else if(c===COOP.conn){
    if(d.t==='perk')applyPerk(String(d.k));
    else if(d.t==='cheer')applyCheer(String(d.e||'').slice(0,4));
    else if(d.t==='bye'){COOP.conn=null;coopLeave();}
  }
}
function coopState(){
  const D=G.D;
  return {mode:G.mode,stage:(G.stageIdx|0)+1,hearts:D?D.hearts:3,hp:D?D.hp:0,max:D?D.max:0,foe:D?nameOf('titan',D.T.dkey):'',coins:G.slot?G.slot.coins:0,name:G.slot?G.slot.name:'',perks:COOP.perks,buff:COOP.buff};
}
function coopPush(now){
  if(!COOP.conn||!COOP.conn.open)return;
  const n=Date.now();
  if(!now&&n-COOP.lastPush<120){clearTimeout(COOP.pt);COOP.pt=setTimeout(()=>coopPush(true),130);return;}
  COOP.lastPush=n;csend(COOP.conn,{t:'state',s:coopState()});
}
function perkFx(k){
  SFX.ok();const p=G.parent?G.parent.root.position:{x:G.hx,z:0};G.parentWave=1.6;
  const col={heal:['#ff6b8f','#ffd0dc'],power:['#ffe45a','#ff9a2a'],shield:['#7ec8ff','#ffffff'],gift:['#ffd84a','#ffffff']}[k]||['#fff'];
  const hx=G.mode==='home'?(G.hero.root.position.x):G.hx;
  burst(hx,2,G.hero.root.position.z,col,22,5,.8,5,.2);
  if(G.mode==='duel'||G.mode==='play')floatMsg({heal:'💗',power:'⚡',shield:'🛡',gift:'🎁 +10'}[k]||'✨');
  else toast({heal:'💗',power:'⚡',shield:'🛡',gift:'🎁 +10'}[k]||'✨',1200);
}
function applyPerk(k){
  const P=COOP.perks;if(!(k in P)||P[k]<=0)return;
  const now=Date.now();if(now-COOP.lastPerk<900)return;
  const D=G.D,duel=G.mode==='duel'&&D&&!G.paused;
  if(k==='heal'){if(!duel||D.hearts>=3)return;D.hearts++;renderDuelHud();}
  else if(k==='power'){if(!duel||COOP.buff.power)return;COOP.buff.power=true;renderDuelHud();}
  else if(k==='shield'){if(!duel||COOP.buff.shield)return;COOP.buff.shield=true;renderDuelHud();}
  else if(k==='gift'){if(!G.slot)return;G.slot.coins+=10;saveDB();refreshHomeHud();}
  else return;
  P[k]--;COOP.lastPerk=now;perkFx(k);coopPush(true);
}
function applyCheer(e){
  if(!e)return;G.parentWave=1.4;SFX.coin();
  const hx=G.mode==='home'?G.hero.root.position.x:G.hx;burst(hx,2.4,G.hero.root.position.z,['#ffe45a','#ff6b8f','#fff'],12,4,.8,4,.18);
  if(G.mode==='duel'||G.mode==='play')floatMsg(e);else toast(e,1000);
}
function coopJoin(pr){
  if(G.parent)coopLeave(true);
  const kid=buildKid(parentLook(pr.ic));kid.root.scale.setScalar(1.28);scene.add(kid.root);
  G.parent=kid;G.parentInfo=pr;G.parentWave=2.6;setVisible(G.mode);
  heroHome();homeCam();
  if(G.mode==='home'){const p=kid.root.position;confetti(p.x,2.4,p.z);}
  SFX.win();COOP.st='on';coopUI();renderCoopDlg();toast((pr.ic||'👩')+' '+pr.name+' '+t('coopJoined'),2200);
}
function coopLeave(quiet){
  if(G.parent){scene.remove(G.parent.root);disposeGroup(G.parent.root);G.parent=null;G.parentInfo=null;}
  COOP.buff={power:false,shield:false};if(COOP.st==='on')COOP.st='wait';
  if(!quiet){if(G.mode==='home'){heroHome();homeCam();}coopUI();renderCoopDlg();if(G.D)renderDuelHud();}
}
function coopUI(){
  const b=$('#h-coop');if(!b)return;
  if(G.parent){b.textContent=(G.parentInfo.ic||'👩')+' '+G.parentInfo.name+' '+t('coopOn');b.classList.add('on');$('#b-coop').textContent='👨‍👩‍👦 ✓';}
  else{b.classList.remove('on');$('#b-coop').textContent='👨‍👩‍👦 '+t('coop');}
}
function renderCoopDlg(){
  if(!$('#d-coop').classList.contains('show'))return;
  const b=$('#co-body'),sim=$('#co-sim');
  if(G.parent){b.innerHTML='<div style="font-size:48px">'+(G.parentInfo.ic||'👩')+'</div><div class="mono" style="margin:8px 0">'+G.parentInfo.name+' '+t('coopOn')+'</div>';sim.style.display='';sim.textContent=t('coopEnd');sim.className='pill warn';}
  else if(COOP.st==='err'){b.innerHTML='<div class="mono" style="color:#c0392b">'+t('coopErrNet')+'</div>';sim.style.display='';sim.textContent=t('coopRetry');sim.className='pill go';}
  else{b.innerHTML='<div class="mono" style="margin-bottom:6px">'+t('coopHow')+'</div><div class="coopcode" id="co-code">'+(COOP.code||'·····')+'</div><div class="mono coopdots" style="margin:8px 0">'+t('coopWait')+'</div><div class="mono" style="font-size:13px;opacity:.7;margin-top:6px">'+t('coopProto')+'</div>';sim.style.display='none';}
}
function openCoop(){SFX.tap();coopHostStart();EZUI.show('d-coop');renderCoopDlg();}
$('#b-coop').onclick=openCoop;
$('#co-x').onclick=$('#co-close').onclick=()=>EZUI.hide('d-coop');
$('#co-sim').onclick=()=>{
  if(G.parent){csend(COOP.conn,{t:'bye'});try{COOP.conn&&COOP.conn.close();}catch(e){}COOP.conn=null;coopLeave();}
  else if(COOP.st==='err'){coopHostStart();}
};
/* --- guest side (parent phone) --- */
const JN={sel:0,err:'',busy:false};
function openJoin(){SFX.tap();JN.err='';JN.busy=false;renderJoin();EZUI.show('d-join');}
function renderJoin(){
  const b=$('#jn-body'),ok=$('#jn-ok');$('#jn-title').textContent='👨‍👩 '+t('jnTitle');$('#jn-cancel').textContent=t('cancel');ok.textContent=t('jnGo');
  if(!DB.parents.length){b.innerHTML='<div class="mono">'+t('jnNone')+'</div><div style="margin-top:12px"><button class="pill go" id="jn-make">+ '+t('jnMake')+'</button></div>';ok.style.display='none';$('#jn-make').onclick=()=>{const left=Math.ceil((GATE.lockUntil-Date.now())/1000);openGate(left>0?left:0);};return;}
  ok.style.display='';if(JN.sel>=DB.parents.length)JN.sel=0;
  const keepCode=$('#jn-code')?$('#jn-code').value:'';
  b.innerHTML='<div class="mono">'+t('jnWho')+'</div><div class="jnacc">'+DB.parents.map((p,i)=>'<button data-i="'+i+'" class="'+(i===JN.sel?'on':'')+'">'+(p.ic||'👩')+' <span></span></button>').join('')+'</div>'
   +'<div class="mono" style="margin-top:6px">'+t('jnGate')+'</div><div class="gq" id="jn-q" style="font:800 26px var(--f-display);margin:6px 0">'+genGate()+'</div><input class="txt" id="jn-a" inputmode="numeric" placeholder="'+t('gAns')+'">'
   +'<div class="mono" style="margin-top:10px">'+t('jnCode')+'</div><input class="txt code" id="jn-code" maxlength="5" autocapitalize="characters" autocomplete="off" placeholder="•••••"><div class="jnerr" id="jn-err"></div>';
  b.querySelectorAll('.jnacc button').forEach((e,i)=>{e.querySelector('span').textContent=DB.parents[i].name;e.onclick=()=>{JN.sel=i;b.querySelectorAll('.jnacc button').forEach((x,j)=>x.classList.toggle('on',j===i));};});
  $('#jn-code').value=keepCode;$('#jn-err').textContent=JN.err?t(JN.err):'';
}
$('#jn-x').onclick=$('#jn-cancel').onclick=()=>{EZUI.hide('d-join');guestClose();};
$('#jn-ok').onclick=()=>{
  if(JN.busy)return;
  const left=Math.ceil((GATE.lockUntil-Date.now())/1000);if(left>0){JN.err='';$('#jn-err').textContent=t('gWait').replace('{n}',left);return;}
  const v=parseInt($('#jn-a').value,10);
  if(v!==GATE.ans){GATE.wrong++;SFX.bad();if(GATE.wrong>=3){GATE.wrong=0;GATE.lockUntil=Date.now()+30000;}JN.err='jnWrong';renderJoin();return;}
  GATE.wrong=0;
  const code=($('#jn-code').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<5){$('#jn-err').textContent=t('jnNocode');return;}
  guestConnect(code,DB.parents[JN.sel]);
};
function guestClose(){
  const p=COOP.peer,c=COOP.conn;if(COOP.role==='guest'){COOP.peer=null;COOP.conn=null;COOP.role=null;try{c&&c.close();}catch(e){}try{p&&p.destroy();}catch(e){}}
  JN.busy=false;
}
function guestFail(key){guestClose();JN.err=key;JN.busy=false;if($('#d-join').classList.contains('show'))renderJoin();}
function guestConnect(code,pr){
  if(typeof Peer==='undefined'){guestFail('jnNet');return;}
  guestClose();JN.busy=true;$('#jn-err').textContent=t('jnConn');COOP.role='guest';
  let p;try{p=new Peer(PEER_OPTS);}catch(e){guestFail('jnNet');return;}
  COOP.peer=p;const to=setTimeout(()=>guestFail('jnTimeout'),14000);
  p.on('error',e=>{clearTimeout(to);guestFail(e&&e.type==='peer-unavailable'?'jnNocode':'jnNet');});
  p.on('open',()=>{
    const c=p.connect(PEER_PRE+code,{reliable:true});COOP.conn=c;
    c.on('open',()=>csend(c,{t:'hello',name:pr.name,ic:pr.ic,v:1}));
    c.on('data',d=>{clearTimeout(to);guestData(d,pr);});
    c.on('close',()=>{if(COOP.role==='guest'){clearTimeout(to);guestEnd(true);}});
    c.on('error',()=>{});
  });
}
function guestData(d,pr){
  if(!d||typeof d!=='object')return;
  if(d.t==='welcome'){
    EZUI.hide('d-join');JN.busy=false;
    COOP.remote={name:d.name||'',look:d.look,state:null,me:pr};
    const lk=sanLook(d.look);rebuildHero(lk);
    if(G.parent){scene.remove(G.parent.root);disposeGroup(G.parent.root);}
    const kid=buildKid(parentLook(pr.ic));kid.root.scale.setScalar(1.28);scene.add(kid.root);G.parent=kid;G.parentInfo=pr;G.parentWave=2;
    setMode('parent');showScreen('s-parent');heroHome();homeCam(true);renderParent();
  }else if(d.t==='busy'){guestFail('jnBusy');}
  else if(d.t==='state'&&COOP.remote){COOP.remote.state=d.s;renderParent();}
  else if(d.t==='bye'){guestEnd(true);}
}
function sanLook(l){l=l||{};return {g:l.g===1?1:0,skin:clamp(l.skin|0,0,SKINS-1),hair:clamp(l.hair|0,0,HAIR_COLORS-1),hs:clamp(l.hs|0,0,HAIR_STYLES-1),outfit:clamp(l.outfit|0,0,OUTFITS.length-1),hat:HATLIST.includes(l.hat|0)?(l.hat|0):0,pet:clamp(l.pet|0,0,9)};}
function guestEnd(remoteClosed){
  const c=COOP.conn;if(!remoteClosed)csend(c,{t:'bye'});
  guestClose();COOP.remote=null;
  if(G.parent){scene.remove(G.parent.root);disposeGroup(G.parent.root);G.parent=null;G.parentInfo=null;}
  goTitle();if(remoteClosed)toast(t('jnClosed'),2200);
}
$('#pc-leave').onclick=()=>{SFX.tap();guestEnd(false);};
$('#b-parent').onclick=openJoin;
const PK_ICON={
 heal:'<svg viewBox="0 0 56 56"><path d="M28 48 C10 35 6 24 12 16 C17 10 25 12 28 19 C31 12 39 10 44 16 C50 24 46 35 28 48 Z" fill="#fff" stroke="#2b2350" stroke-width="3.4" stroke-linejoin="round"/></svg>',
 power:'<svg viewBox="0 0 56 56"><path d="M32 6 L12 32 H26 L22 50 L44 22 H30 Z" fill="#fff" stroke="#2b2350" stroke-width="3.4" stroke-linejoin="round"/></svg>',
 shield:'<svg viewBox="0 0 56 56"><path d="M28 6 L47 13 V28 C47 39 39 46 28 51 C17 46 9 39 9 28 V13 Z" fill="#fff" stroke="#2b2350" stroke-width="3.4" stroke-linejoin="round"/></svg>',
 gift:'<svg viewBox="0 0 56 56"><rect x="9" y="22" width="38" height="25" rx="4" fill="#fff" stroke="#2b2350" stroke-width="3.4" stroke-linejoin="round"/><rect x="6" y="14" width="44" height="10" rx="3" fill="#fff" stroke="#2b2350" stroke-width="3.4" stroke-linejoin="round"/><path d="M28 14 V47 M28 14 C22 4 14 8 19 14 M28 14 C34 4 42 8 37 14" fill="none" stroke="#2b2350" stroke-width="3.4" stroke-linecap="round"/></svg>'};
function renderParent(){
  const R=COOP.remote;if(!R)return;const s=R.state||{mode:'home',hearts:3,hp:0,max:0,perks:PERK_MAX,buff:{}};
  const nm=s.name||R.name||'';$('#pc-name').textContent=nm;
  const md=s.mode,duel=md==='duel';
  const key={play:'pcWalk',duel:'pcDuel',home:'pcHome',map:'pcMap',result:'pcResult',title:'pcTitle',slots:'pcTitle',edit:'pcHome'}[md]||'pcHome';
  $('#pc-status').textContent=nm+' '+t(key)+(duel&&s.foe?' '+s.foe:'');
  $('#pc-hearts').textContent=duel?'❤️'.repeat(s.hearts)+'🤍'.repeat(Math.max(0,3-s.hearts))+(s.buff&&s.buff.power?' ⚡':'')+(s.buff&&s.buff.shield?' 🛡':''):'';
  $('#pc-hp').innerHTML=duel?Array.from({length:s.max||0},(_,i)=>'<i class="'+(i<s.hp?'on':'')+'"></i>').join(''):'';
  const P=s.perks||PERK_MAX,lab={heal:'pkHeal',power:'pkPower',shield:'pkShield',gift:'pkGift'};
  $('#pc-perks').innerHTML=['heal','power','shield','gift'].map(k=>{
    const need=k!=='gift',off=P[k]<=0||(need&&!duel)||(k==='heal'&&s.hearts>=3)||(k==='power'&&s.buff&&s.buff.power)||(k==='shield'&&s.buff&&s.buff.shield);
    return '<button class="perk '+k+'" data-k="'+k+'"'+(off?' disabled':'')+'>'+PK_ICON[k]+'<span>'+t(lab[k])+'</span><i class="cnt">'+P[k]+'</i></button>';}).join('');
  $('#pc-perks').querySelectorAll('.perk').forEach(e=>e.onclick=()=>{if(e.disabled)return;csend(COOP.conn,{t:'perk',k:e.dataset.k});G.parentWave=1.2;SFX.tap();});
  $('#pc-note').textContent=duel?t('pcNote'):t('pcHint');
}
$('#pc-cheer').innerHTML=['👏','⭐','❤️','🎉'].map(e=>'<button data-e="'+e+'">'+e+'</button>').join('');
$('#pc-cheer').querySelectorAll('button').forEach(b=>b.onclick=()=>{csend(COOP.conn,{t:'cheer',e:b.dataset.e});G.parentWave=1;SFX.tap();});

/* ---------- friends on the homepage: tap to talk ---------- */
const PAL_RC=new THREE.Raycaster(),PAL_V=new THREE.Vector2();
function monVoice(key){
  const c=aCtx();if(!c)return;const n=c.currentTime;
  switch(key){
    case 'sprout':tone(900,n,.07,'triangle',.11,1300);tone(1100,n+.11,.09,'triangle',.11,1500);break;
    case 'jelly':tone(260,n,.3,'sine',.16,520);tone(520,n+.28,.22,'sine',.1,300);break;
    case 'bunny':tone(700,n,.1,'sine',.11,900);tone(820,n+.13,.12,'sine',.11,1050);break;
    case 'bee':tone(220,n,.4,'sawtooth',.06,270);tone(226,n,.4,'sawtooth',.05,262);noise(n,.35,.04,2600);break;
    case 'moth':noise(n,.25,.07,3600);tone(1200,n,.22,'sine',.05,1700);break;
    case 'shroom':tone(200,n,.22,'sine',.18,540);tone(540,n+.2,.2,'sine',.1,260);break;
    case 'matahari':tone(110,n,.55,'sawtooth',.08,160);tone(55,n,.55,'sine',.16,80);break;
    case 'madu':tone(135,n,.5,'triangle',.14,95);tone(70,n+.05,.5,'sine',.14,60);break;
    case 'raja':tone(95,n,.3,'sawtooth',.07,150);tone(150,n+.3,.4,'triangle',.12,100);break;
    default:tone(600,n,.15,'triangle',.1,800);
  }
}
function palBubble(p){
  const T=TX[LANG],L=T.pbub;let k;do{k=(Math.random()*L.length)|0;}while(k===G.palLast&&L.length>1);G.palLast=k;
  const b=$('#pal-bubble');b.innerHTML='<b></b><span></span>';b.firstChild.textContent=nameOf('titan',p.key||p.dkey||'');b.lastChild.textContent=L[k];
  b.classList.remove('on');void b.offsetWidth;b.classList.add('on');G.bub={p,t:2.8};
}
function palTap(p){
  p.rt=.0001;p.taps=(p.taps||0)+1;monVoice(p.key||p.dkey);
  const h=p.isMon?p.def.h*p.baseS:6.6*p.baseS+1.2;
  burst(p.root.position.x,p.root.position.y+h*.8,p.root.position.z+.4,['#ff8fb0','#ff5c8a','#fff'],8,2.4,.9,3,.2);
  if(p.taps%5===0){confetti(p.root.position.x,h,p.root.position.z);SFX.ok();}
  palBubble(p);
}
cv.addEventListener('pointerdown',e=>{
  if(G.mode!=='home'||!G.pals||!G.pals.length)return;
  const r=cv.getBoundingClientRect();PAL_V.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
  PAL_RC.setFromCamera(PAL_V,cam);
  const hit=PAL_RC.intersectObjects(G.pals.map(p=>p.root),true)[0];if(!hit)return;
  let o=hit.object;while(o){const p=G.pals.find(q=>q.root===o);if(p){palTap(p);return;}o=o.parent;}
});
function palTick(dt){
  G.pals.forEach(p=>{
    if(p.y0===undefined){p.y0=p.root.rotation.y;}
    if(p.rt>0){p.rt+=dt/.9;const u=Math.min(1,p.rt);
      p.root.position.y=Math.sin(u*Math.PI*(p.isMon?2:1))*(p.isMon?.9:.45);
      p.root.rotation.y=p.y0*(1-u)+(p.isMon?Math.PI*2*u:0);
      if(!p.isMon){p.happy=1;}
      if(u>=1){p.rt=0;p.root.position.y=0;p.root.rotation.y=p.y0*0+0;p.y0=0;if(!p.isMon)p.happy=0;}}
  });
  const b=G.bub,el=$('#pal-bubble');
  if(b){b.t-=dt;
    const p=b.p,h=(p.isMon?p.def.h*p.baseS:6.6*p.baseS+1.2)+.5,v=new THREE.Vector3(p.root.position.x,p.root.position.y+h,p.root.position.z).project(cam);
    el.style.left=((v.x*.5+.5)*100)+'%';el.style.top=((-v.y*.5+.5)*100)+'%';
    if(b.t<=0||G.mode!=='home'){el.classList.remove('on');G.bub=null;}}
}
function goHome(){
  rebuildPals();
  G.hero.root.scale.setScalar(1);
  setMode('home');showScreen('s-home');EZUI.hide('d-style');G.edit=null;
  refreshHomeHud();heroHome();homeCam();
}

/* ---------- thumbnails (offscreen render of hair / hats / outfits / pets) ---------- */
let TR=null,TS=null,TCAM=null;const THC={};
function thumbInit(){
  try{TR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(e){TR=false;return;}
  TR.setPixelRatio(1);TR.setSize(112,112);TR.outputEncoding=THREE.sRGBEncoding;TS=new THREE.Scene();
  TS.add(new THREE.HemisphereLight(0xffffff,0xb0c8a0,1.0));const d=new THREE.DirectionalLight(0xffffff,.7);d.position.set(-3,6,8);TS.add(d);
  TCAM=new THREE.PerspectiveCamera(30,1,.1,60);
}
function thumb(kind,id,look){
  const L=Object.assign({},look);
  let key=kind+id;
  if(kind==='hs'){L.hs=id;L.hat=0;key+='|'+L.hair+'|'+L.skin;}
  else if(kind==='hat'){L.hat=id;key+='|'+L.hair+'|'+L.skin+'|'+L.hs;}
  else if(kind==='outfit'){L.outfit=id;L.hat=0;key+='|'+L.skin+'|'+L.g;}
  if(THC[key])return THC[key];
  if(TR===null)thumbInit();if(!TR)return '';
  let obj,cy,dist;
  if(kind==='pet'){const P=petModel(id);obj=P.root;cy=.55;dist=4.6;}
  else{const K=buildKid(L);obj=K.root;if(kind==='outfit'){cy=.95;dist=6.2;}else{cy=1.5;dist=4.5;}K.root.traverse(o=>{});}
  TS.add(obj);TCAM.position.set(0,cy+.15,dist);TCAM.lookAt(0,cy,0);
  TR.render(TS,TCAM);const url=TR.domElement.toDataURL('image/png');TS.remove(obj);
  return THC[key]=url;
}
/* ---------- style editor / creator ---------- */
function slotRef(){return G.edit.isNew?G.edit.tmp:G.slot;}
function openStyleUI(){
  setMode('edit');SCREENS.forEach(x=>$('#'+x).classList.remove('show'));EZUI.show('d-style');
  const ed=G.edit;$('#st-title').textContent=ed.isNew?('✨ '+t('newChar')):('👕 '+t('homeStyle'));
  $('#st-back').onclick=()=>{
    if(ed.isNew){EZUI.hide('d-style');G.edit=null;openSlots();goTitleHeroReset();}
    else{G.slot.look=Object.assign({},ed.orig);rebuildHero(G.slot.look);goHome();}
  };
  $('#st-ok').onclick=()=>{
    if(ed.isNew){
      const nm=($('#in-name')&&$('#in-name').value||'').trim();
      if(!nm){toast(t('gNeedName'));return;}
      const s=ed.tmp;s.name=nm.slice(0,16);s.look=Object.assign({},ed.look);DB.slots[ed.slotIndex]=s;G.slot=s;G.si=ed.slotIndex;DB.last=G.si;saveDB();goHome();
    }else{G.slot.look=Object.assign({},ed.look);saveDB();goHome();}
  };
  renderStyle(false);
  camStyle();
}
function goTitleHeroReset(){rebuildHero((DB.last>=0&&DB.slots[DB.last])?DB.slots[DB.last].look:G.defaultLook);heroHome();}
function camStyle(){
  const r=G.hero.root;r.position.set(0,0,1.6);r.rotation.y=.25;if(G.petM){G.petM.root.position.set(1.7,0,2.1);G.petM.root.rotation.y=-.2;}
  const W=innerWidth,H=innerHeight,fovT=Math.tan(19*Math.PI/180),dist=8.2,visW=2*dist*fovT*(W/H);
  if(H>W){r.position.set(-.5,0,1.6);if(G.petM)G.petM.root.position.set(1.2,0,2.1);camTo(.3,2.6,8.2,.3,1.3,1.6,4);}
  else camTo(-visW*.23,3.1,dist+1.6,-visW*.23,1.5,1.6,4);
}
function renderStyle(keepScroll){
  const ed=G.edit,S=slotRef(),body=$('#st-body');
  const scroll=keepScroll&&$('#st-grid')?$('#st-grid').scrollTop:0;
  let h='';
  if(ed.isNew){
    const nm=$('#in-name')?$('#in-name').value:'';
    h+='<div class="row"><label>'+t('name')+'</label><input class="txt" id="in-name" maxlength="16" placeholder="'+t('namePh')+'"></div>';
    h+='<div class="row"><div class="seg" id="sg-g"><button data-v="0" class="'+(ed.look.g===0?'on':'')+'">👦 '+t('boy')+'</button><button data-v="1" class="'+(ed.look.g===1?'on':'')+'">👧 '+t('girl')+'</button></div>';
    h+='<div class="seg" id="sg-l"><button data-v="prak" class="'+(S.lvl==='prak'?'on':'')+'">'+t('lvPrak')+'</button><button data-v="k" class="'+(S.lvl==='k'?'on':'')+'">'+t('lvK')+'</button></div></div>';
  }else h+='<div class="row mono" style="font-size:16px">🪙 '+S.coins+'</div>';
  const tabs=[['hair','hair'],['hairc','hairc'],['skin','skin'],['shirt','shirt'],['hat','hat'],['pet','pet']];
  h+='<div class="tabs" id="st-tabs">'+tabs.map(x=>'<button class="tab'+(ed.tab===x[0]?' on':'')+'" data-tab="'+x[0]+'">'+t(x[1])+'</button>').join('')+'</div>';
  h+='<div class="grid" id="st-grid">'+gridHTML()+'</div>';
  const keep=ed.isNew&&$('#in-name')?$('#in-name').value:'';
  body.innerHTML=h;if(ed.isNew&&$('#in-name'))$('#in-name').value=keep||ed.name||'';
  if(ed.isNew&&$('#in-name'))$('#in-name').oninput=e=>{ed.name=e.target.value;};
  $('#st-grid').scrollTop=scroll;
}
function gridHTML(){
  const ed=G.edit,S=slotRef(),L=ed.look;let h='';
  const card=(kind,id,inner,own,price,on)=>'<div class="ccard'+(on?' on':'')+(own?'':' lock')+'" data-k="'+kind+'" data-id="'+id+'">'+inner+(own?'':'<span class="pr">🪙'+price+'</span>')+'</div>';
  const im=(k,i)=>'<img class="th" alt="" src="'+thumb(k,i,L)+'">';
  if(ed.tab==='hair')HSG[L.g?1:0].forEach(i=>{h+=card('hs',i,im('hs',i)+'<span>'+(TX[LANG].hsNames[i]||'')+'</span>',true,0,L.hs===i);});
  else if(ed.tab==='hairc')for(let i=0;i<HAIR_COLORS;i++)h+=card('hair',i,'<div class="sw" style="background:'+HAIR[i]+'"></div>',true,0,L.hair===i);
  else if(ed.tab==='skin')for(let i=0;i<SKINS;i++)h+=card('skin',i,'<div class="sw" style="background:'+SKIN[i]+'"></div>',true,0,L.skin===i);
  else if(ed.tab==='shirt')OUTFITS.forEach((o,i)=>{h+=card('outfit',i,im('outfit',i)+'<span>'+nameOf('out',i)+'</span>',S.own.outfit.includes(i),o.price,L.outfit===i);});
  else if(ed.tab==='hat')HATLIST.forEach(i=>{h+=card('hat',i,(i?im('hat',i):'<span class="e">🚫</span>')+'<span>'+(i?nameOf('hat',i):t('none'))+'</span>',S.own.hat.includes(i),HAT_PRICE[i],L.hat===i);});
  else if(ed.tab==='pet')for(let i=0;i<10;i++)h+=card('pet',i,(i?im('pet',i):'<span class="e">🚫</span>')+'<span>'+(i?nameOf('pet',i):t('none'))+'</span>',S.own.pet.includes(i),PET_PRICE[i]+(i===5?0:0),L.pet===i);
  return h;
}
function equip(kind,id){
  const ed=G.edit,S=slotRef();
  const priceOf={outfit:i=>OUTFITS[i].price,hat:i=>HAT_PRICE[i],pet:i=>PET_PRICE[i]};
  const ownKey={outfit:'outfit',hat:'hat',pet:'pet'};
  if(ownKey[kind]){
    const own=S.own[ownKey[kind]];
    if(!own.includes(id)){
      const p=priceOf[kind](id);
      if(kind==='pet'&&id===5&&p===0){toast(TX[LANG].petGift+' ('+STAGES[0].key+')');return;}
      if(S.coins<p){toast(t('notEnough'));SFX.bad();return;}
      S.coins-=p;own.push(id);SFX.coin();toast(t('bought'),1200);
    }
  }
  ed.look[kind]=id;
  if(kind==='pet'){G.petId=-2;}
  rebuildHero(ed.look);camStyle();
  if(!ed.isNew)saveDB();
  renderStyle(true);
}
$('#st-body').addEventListener('click',e=>{
  if(!G.edit)return;SFX.tap();
  const tab=e.target.closest('[data-tab]');if(tab){G.edit.tab=tab.dataset.tab;renderStyle(false);return;}
  const c=e.target.closest('.ccard');if(c){const k=c.dataset.k,id=+c.dataset.id;equip(k,id);return;}
  const sg=e.target.closest('#sg-g button');if(sg){G.edit.look.g=+sg.dataset.v;G.edit.look.hs=G.edit.look.g?2:0;G.edit.look.hat=G.edit.look.hat;rebuildHero(G.edit.look);camStyle();renderStyle(true);return;}
  const sl=e.target.closest('#sg-l button');if(sl){G.edit.tmp.lvl=sl.dataset.v;renderStyle(true);return;}
});

/* ---------- map ---------- */
function stageOpen(i){return i===0||DB.slots[G.si]&&G.slot.prog.done.includes(STAGES[i-1].id);}
function mapPos(){return innerHeight>innerWidth?[[-3.4,0,7.5],[3.6,0,0],[-3,0,-7.5]]:[[-8,0,2.5],[0,0,-2.5],[8,0,2.5]];}
function buildMapObj(){
  if(G.mapObj){scene.remove(G.mapObj.g);disposeGroup(G.mapObj.g);G.mapObj=null;}
  const pos=mapPos(),open=STAGES.map((_,i)=>stageOpen(i)),done=STAGES.map(st=>G.slot.prog.done.includes(st.id));
  const M=buildMapWorld(pos,open,done);M.titans=[];
  STAGES.forEach((st,i)=>{const boss=st.titans[st.titans.length-1];const T=buildTitan(Object.assign({},TITANS[boss.d],{s:.62}));T.root.position.set(pos[i][0]+(i===0?1.1:0),.6,pos[i][2]-.3);if(!open[i])addPadlock(T.root,0,3.2,1.2);T.root.children.forEach(()=>{});M.g.add(T.root);M.titans.push(T);if(done[i])T.happy=1;});
  M.pos=pos;M.cur=Math.max(0,STAGES.findIndex((st,i)=>open[i]&&!done[i]));if(M.cur<0)M.cur=0;
  scene.add(M.g);G.mapObj=M;
}
function openMap(){
  if(G.mapObj)G.mapObj.g.visible=false;
  buildMapObj();setMode('map');showScreen('s-map');
  const M=G.mapObj;rebuildHero(G.slot.look);G.hero.root.rotation.y=.2;G.hero.root.scale.setScalar(1.15);
  const p=M.pos[M.cur];G.hero.root.position.set(p[0]+2.4,.6,p[2]+1.2);if(G.petM){G.petM.root.position.set(p[0]+3.9,.6,p[2]+1.8);G.petM.root.rotation.y=.4;}
  AU.kind='home';renderMap();
  camTo(M.cx,innerHeight>innerWidth?14:12,M.cz+(innerHeight>innerWidth?12:11),M.cx,0,M.cz,3,true);
}
function renderMap(){
  $('#m-title').textContent='🌼 '+t('mapTitle');refreshHomeHud();
  const p=$('#m-path');p.innerHTML='';
  STAGES.forEach((st,i)=>{
    const open=stageOpen(i),done=G.slot.prog.done.includes(st.id),n=G.slot.prog.stars[st.id]||0;
    const d=document.createElement('div');d.className='node'+(open?'':' lock')+(done?' done':'');
    const STAR=k=>'<svg class="'+(k<=n?'on':'off')+'" viewBox="0 0 24 24"><path d="M12 2.2l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.1 6 20.5l1.4-6.7-5-4.6 6.7-.8z"/></svg>';
    const LOCK='<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fff"/><path d="M8 10.5V8a4 4 0 018 0v2.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="15.5" r="1.6" fill="#8d88b0"/></svg>';
    const CHK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.6L19 7.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    d.innerHTML='<div class="disc">'+(open?(done?CHK:(i+1)):LOCK)+'</div><div class="lbl"></div><div class="st">'+[1,2,3].map(STAR).join('')+'</div>';
    d.querySelector('.lbl').textContent=t(st.key);
    d.onclick=()=>{if(!open){toast(t('locked'));SFX.bad();return;}SFX.tap();startStage(i);};
    p.appendChild(d);
  });
}
function placeMapNodes(){
  if(!G.mapObj)return;const W=innerWidth,H=innerHeight,v=new THREE.Vector3();
  $$('#m-path .node').forEach((el,i)=>{const p=G.mapObj.pos[i];v.set(p[0],4.6,p[2]).project(cam);el.style.left=((v.x*.5+.5)*W)+'px';el.style.top=((-v.y*.5+.5)*H)+'px';});
}

/* ---------- stage / walking ---------- */
function clearWorld(){
  if(G.world){scene.remove(G.world.g);disposeGroup(G.world.g);G.world=null;}
  G.titans.forEach(T=>{scene.remove(T.root);disposeGroup(T.root);});G.titans=[];
  if(G.proj){scene.remove(G.proj.m);G.proj=null;}
}
function startStage(i){
  clearWorld();G.stageIdx=i;const st=STAGES[i];
  G.world=buildWorld(st);scene.add(G.world.g);
  st.titans.forEach((tt,k)=>{
    const T=tt.m?buildMonster(tt.d,1.7):buildTitan(Object.assign({},TITANS[tt.d]));T.root.position.set(tt.x,0,0);T.root.rotation.y=-Math.PI/2;T.x=tt.x;T.q=tt.q;T.gone=false;T.boss=!tt.m&&!!TITANS[tt.d].boss;T.dkey=tt.d;T.dying=false;scene.add(T.root);G.titans.push(T);
  });
  resetPerks();coopPush();G.go=false;G.everWalked=false;G.tIdx=0;G.hx=0;G.hy=0;G.hvy=0;G.onGround=true;G.jumpReq=false;G.walking=true;G.paused=false;G.D=null;
  G.atkT=-1;G.hurt=0;G.faint=false;G.cheer=0;G.runCoins=0;G.runWrong=0;G.runRight=0;VPW=1;
  rebuildHero(G.slot.look);G.hero.root.rotation.y=Math.PI/2;G.hero.root.scale.setScalar(1);
  setMode('play');showScreen('s-play');refreshHomeHud();
  {const P=$('#duelPanel');P.classList.remove('flip','lockq','show');void P.offsetWidth;P.classList.add('walk','show');}setWalkUI();
  camTo(4.5,3.4,11,3.6,1.7,0,8,true);
  $('#p-fill').style.width='0%';
  EZUI.hide('d-result');
}
function showTip(s,ms){const e=$('#p-tip');e.textContent=s;e.classList.add('on');clearTimeout(showTip.h);showTip.h=setTimeout(()=>e.classList.remove('on'),ms);}
$('#p-jump').addEventListener('pointerdown',e=>{e.preventDefault();G.jumpReq=true;});
const IC_FEET='<svg viewBox="0 0 56 56"><g fill="#fff" stroke="#2b2350" stroke-width="3.2" stroke-linejoin="round"><ellipse cx="19" cy="38" rx="8.5" ry="11.5" transform="rotate(-8 19 38)"/><circle cx="12" cy="21" r="3.4"/><circle cx="19.5" cy="17.5" r="3.4"/><circle cx="27" cy="20" r="3.4"/><ellipse cx="39" cy="30" rx="8.5" ry="11.5" transform="rotate(8 39 30)"/><circle cx="32" cy="12" r="3.4"/><circle cx="39.5" cy="9.5" r="3.4"/><circle cx="47" cy="13" r="3.4"/></g></svg>';
const IC_STOP='<svg viewBox="0 0 56 56"><rect x="11" y="11" width="34" height="34" rx="9" fill="#fff" stroke="#2b2350" stroke-width="3.6" stroke-linejoin="round"/></svg>';
const IC_JUMP='<svg viewBox="0 0 56 56"><path d="M28 7 L47 28 H36 V40 H20 V28 H9 Z" fill="#fff" stroke="#2b2350" stroke-width="3.6" stroke-linejoin="round"/><rect x="13" y="46" width="30" height="5" rx="2.5" fill="#2b2350"/></svg>';
function setWalkUI(){const w=$('#w-walk');if(!w)return;w.classList.toggle('on',!!G.go);w.innerHTML=(G.go?IC_STOP:IC_FEET)+'<span>'+(G.go?t('stopW'):t('walk'))+'</span>';$('#w-jump').innerHTML=IC_JUMP+'<span>'+t('jump')+'</span>';w.classList.toggle('pulse',!G.go&&G.mode==='play'&&!G.everWalked);$('#w-tip').textContent=G.go?t('tapJump'):t('tapWalk');}
$('#w-walk').addEventListener('pointerdown',e=>{e.preventDefault();if(G.mode!=='play'||G.paused)return;G.go=!G.go;G.everWalked=true;SFX.tap();setWalkUI();});
$('#w-jump').addEventListener('pointerdown',e=>{e.preventDefault();if(G.mode!=='play'||G.paused)return;G.jumpReq=true;});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp')G.jumpReq=true;});

function updatePlay(dt){
  const h=G.hero,st=STAGES[G.stageIdx];
  const T=G.titans[G.tIdx];
  const mv=G.walking&&G.go;
  if(G.walking&&G.go){
    G.hx+=SPEED*dt;
    if(T&&G.hx>=T.x-5.4){G.hx=T.x-5.4;G.walking=false;startDuel();}
    else if(!T&&G.hx>=st.len+8){G.walking=false;}
  }
  if(G.jumpReq){G.jumpReq=false;if(G.onGround&&G.walking){G.hvy=9.2;G.onGround=false;SFX.jump();}}
  if(!G.onGround){G.hvy-=26*dt;G.hy+=G.hvy*dt;if(G.hy<=0){G.hy=0;G.hvy=0;G.onGround=true;}}
  // coins
  G.world.coins.forEach(c=>{
    if(c.got)return;c.m.rotation.y+=dt*3;
    if(Math.abs(G.hx-c.x)<.75&&Math.abs(G.hy+.9-c.y)<1.1){c.got=true;c.m.visible=false;G.slot.coins++;G.runCoins++;SFX.coin();burst(c.x,c.y,0,['#ffd84a','#fff3a0'],8,3,.5,6,.12);$('#p-coins').textContent='🪙 '+G.slot.coins;}
  });
  $('#p-fill').style.width=clamp(G.hx/st.len*100,0,100)+'%';
  G.dustT=(G.dustT||0)-dt;if(mv&&G.onGround&&G.dustT<=0){G.dustT=.22;burst(G.hx-.3,.1,.1,['#f0dc9a','#fff3c8'],3,1.4,.5,-1,.14);}
  placeHero(dt,{moving:mv&&G.onGround,air:!G.onGround});
  {const pt=innerHeight>innerWidth;camTo(G.hx+(pt?1.7:4.5),pt?3.1:3.4,pt?9.6:11,G.hx+(pt?1.0:3.6),1.6,0,5);}
}
function placeHero(dt,a){
  const h=G.hero;h.root.position.set(G.hx,G.hy,0);
  const A=Object.assign({spd:4.2,atk:-1,hurt:0,cheer:0,faint:G.faint,wave:false},a||{});
  if(G.atkT>=0)A.atk=G.atkT;if(G.hurt>0)A.hurt=G.hurt;if(G.cheer>0)A.cheer=G.cheer;
  animKid(h,A,dt,TT);
  if(G.parent){const duel=G.mode==='duel',P=G.parent.root,kk=1-Math.exp(-dt*5);P.scale.setScalar(duel?1.9:1.28);P.position.x+=((G.hx-(duel?.7:2.0))-P.position.x)*kk;P.position.z+=((duel?-2.4:-1.1)-P.position.z)*kk;P.position.y=G.hy*.3;P.rotation.y=Math.PI/2;animKid(G.parent,{moving:!!(a&&a.moving),air:!!(a&&a.air),spd:4.2,wave:G.parentWave>0,cheer:0,atk:-1,hurt:0,faint:false},dt,TT);G.parentWave=Math.max(0,(G.parentWave||0)-dt);}
  if(G.petM){const P=G.petM.root;const tx=G.hx-1.9,tz=.6;P.position.x+=(tx-P.position.x)*(1-Math.exp(-dt*5));P.position.z+=(tz-P.position.z)*(1-Math.exp(-dt*5));P.position.y=G.hy*.4;P.rotation.y=Math.PI/2;petAnim(G.petM,!!(a&&a.moving),TT);}
}

/* ---------- duel ---------- */
function startDuel(){
  fxFlash('zoom');
  const T=G.titans[G.tIdx];
  G.D={T,hp:T.q,max:T.q,hearts:3,state:'intro',recent:[],q:null,right:0,wrong:0,t:0};
  setMode('duel');showScreen('s-duel');VPW=1;
  $('#d-tname').textContent=nameOf('titan',T.dkey);renderDuelHud();
  T.wave=0;T.root.rotation.y=-.95;
  const s=T.baseS,hN=T.isMon?3.3*s+1.6:6.6*s+1.2;
  G.D.cam=T.isMon?[G.hx+2.6,hN*.42,Math.max(13,hN*2.1),G.hx+2.6,hN*.38,0]:[G.hx+2.9,hN*.44,Math.max(18,hN*2.0),G.hx+2.9,hN*.4,0];
  G.go=false;G.hy=0;G.hvy=0;G.onGround=true;G.jumpReq=false;setWalkUI();
  const P=$('#duelPanel');P.classList.add('lockq');
  floatMsg(T.isMon?t('monAppear'):t('tipTitan').split('!')[0]+'!');
  setTimeout(()=>{if(!G.D||G.mode!=='duel')return;P.classList.remove('walk');P.classList.add('show','flip');setTimeout(nextQ,350);},900);
}
function syncPanel(on){
  const P=$('#duelPanel');
  if(!on){VPW=1;return;}
  requestAnimationFrame(()=>{const r=P.getBoundingClientRect();VPW=clamp(r.left/innerWidth,.3,1);});
  VPW=.46;
}
function renderDuelHud(){
  const D=G.D;$('#d-hearts').textContent='❤️'.repeat(D.hearts)+'🤍'.repeat(3-D.hearts)+(COOP.buff.power?' ⚡':'')+(COOP.buff.shield?' 🛡':'');coopPush();
  $('#d-hp').innerHTML=Array.from({length:D.max},(_,i)=>'<i class="'+(i<D.hp?'on':'')+'"></i>').join('');
}
function floatMsg(s,col){
  const e=$('#d-float');e.textContent=s;e.style.left=(innerHeight>innerWidth?50:VPW*50)+'%';e.style.top=innerHeight>innerWidth?'30%':'26%';e.style.transform='translateX(-50%)';
  e.classList.remove('go');void e.offsetWidth;e.classList.add('go');
}
function nextQ(){
  const D=G.D;if(!D||G.mode!=='duel'||G.paused)return;
  if(D.hp<=0)return;
  if(!ENG.ready||!CAT){D.waitT=setTimeout(nextQ,300);return;}
  D.q=pickQ();D.state='ask';
  $('#duelPanel').classList.remove('lockq');
  {const f=ENG.frame;f.classList.remove('turn');void f.offsetWidth;f.classList.add('turn');}
  engCmd({type:'ask',level:D.q.level,no:D.q.no,idx:D.q.idx});
}
function onAnswer(ok){
  const D=G.D;D.state='resolve';$('#duelPanel').classList.add('lockq');
  const key=D.q.level+':'+D.q.no,m=G.slot.miss;
  if(ok){D.right++;G.runRight++;if(m[key])m[key]=Math.max(0,m[key]-1);heroAttack();}
  else{D.wrong++;G.runWrong++;m[key]=Math.min(8,(m[key]||0)+1);titanStomp();}
  saveDB();
}
function heroAttack(){
  const D=G.D;G.atkT=0;G.atkSpawned=false;SFX.throw();
  D.state='attack';
}
function titanStomp(){
  const D=G.D;D.T.stomp=0;D.state='stomp';D.stompHit=false;floatMsg(t('miss'));SFX.bad();
}
function updateDuel(dt){
  const D=G.D,T=D.T;
  G.hero.root.rotation.y=Math.PI/2;G.hero.root.scale.setScalar(1.7);
  // hero attack
  if(G.atkT>=0){
    G.atkT+=dt/.75;
    if(G.atkT>=.55&&!G.atkSpawned){
      G.atkSpawned=true;
      const m=makeApple();
      const from=new THREE.Vector3(G.hx+1.2,2.6,0),to=new THREE.Vector3();foeTarget(T,to);
      m.position.copy(from);scene.add(m);G.proj={m,from,to,t:0};
    }
    if(G.atkT>=1)G.atkT=-1;
  }
  if(G.proj){
    const P=G.proj;P.t+=dt/.42;const u=Math.min(1,P.t);
    P.m.position.lerpVectors(P.from,P.to,u);P.m.position.y+=Math.sin(u*Math.PI)*1.2;P.m.rotation.x+=dt*14;P.m.rotation.y+=dt*10;
    if(Math.random()<.7)burst(P.m.position.x,P.m.position.y,P.m.position.z,['#ffe45a','#fff'],1,1,.35,0,.12);
    if(u>=1){scene.remove(P.m);G.proj=null;titanHit();}
  }
  // titan stomp
  if(T.stomp>=0){
    T.stomp+=dt/1.0;
    if(T.stomp>=.5&&!D.stompHit){
      D.stompHit=true;SFX.stomp();CAM.shake=.5;G.hurt=1;fxFlash('hurt');
      burst(G.hx+1,.2,0,['#c9a06a','#9a6b3f','#fff'],14,4,.6,12,.2);
      if(COOP.buff.shield){COOP.buff.shield=false;burst(G.hx+1,2,0,['#7ec8ff','#fff'],18,4,.7,3,.2);floatMsg('🛡');renderDuelHud();}
      else{D.hearts--;renderDuelHud();}
      if(D.hearts<=0){D.state='faint';G.faint=true;D.t=0;toast(t('faint'),2400);}
    }
    if(T.stomp>=1){T.stomp=-1;if(D.state==='stomp'){setTimeout(nextQ,350);D.state='wait';}}
  }
  if(G.hurt>0)G.hurt=Math.max(0,G.hurt-dt*1.6);
  if(D.state==='faint'){D.t+=dt;if(D.t>2){G.faint=false;D.hearts=3;D.state='wait';renderDuelHud();SFX.ok();setTimeout(nextQ,400);}}
  if(D.state==='win'){D.t+=dt;if(D.t>2.6){endDuel();return;}}
  if(G.cheer>0)G.cheer=Math.max(0,G.cheer-dt*.8);
  placeHero(dt,{moving:false});
  camTo.apply(null,D.cam.concat([6]));
}
function foeTarget(T,out){
  if(T.isMon){const p=new THREE.Vector3();T.root.getWorldPosition(p);out.set(p.x,p.y+T.def.h*.55*T.baseS+(T.g.position.y||0),p.z);return out;}
  return titanStarWorld(T,out);
}
function makeApple(){
  const g=new THREE.Group(),bx=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.18}));m.position.set(x,y,z);g.add(m);return m;};
  bx(.62,.5,.62,0xe0352f,0,0,0);bx(.5,.18,.5,0xc12822,0,-.3,0);bx(.5,.16,.5,0xf0584c,0,.3,0);bx(.08,.2,.08,0x6b4423,0,.5,0);bx(.26,.1,.14,0x5ec24a,.16,.5,0);
  g.scale.setScalar(1.15);return g;
}
function titanHit(){
  const D=G.D,T=D.T;T.hit=1;T.flash=1;SFX.hit();CAM.shake=.35;fxFlash('hit');
  const p=new THREE.Vector3();foeTarget(T,p);burst(p.x,p.y,p.z,['#e0352f','#ff7a6a','#fff3d0','#5ec24a'],18,4.5,.7,6,.16);
  const dmg=COOP.buff.power?2:1;COOP.buff.power=false;D.hp=Math.max(0,D.hp-dmg);renderDuelHud();floatMsg(dmg>1?'⚡ '+t('hit'):t('hit'));
  if(D.hp<=0){
    D.state='win';D.t=0;T.tame=true;T.star.visible=false;T.happy=1;G.cheer=1;
    SFX.win();const bonus=T.boss?25:8;winFx(T,bonus,addFriend(T.dkey)?nameOf('titan',T.dkey):'');
    G.slot.coins+=bonus;G.runCoins+=bonus;saveDB();
  }else{D.state='wait';setTimeout(nextQ,800);}
}
/* ---------- victory fx ---------- */
const FXS=[];
function winPop(main,sub){const g=$('#game');[[main,''],[sub,' sub']].forEach(a=>{if(!a[0])return;const e=document.createElement('div');e.className='winpop'+a[1];e.textContent=a[0];g.appendChild(e);setTimeout(()=>e.remove(),1900);});}
function winFx(T,bonus,friend){
  const p=new THREE.Vector3();T.root.getWorldPosition(p);const cy=T.isMon?1.6:4.2;
  // shockwave rings
  [0,.18].forEach((dl,i)=>{const m=new THREE.Mesh(new THREE.RingGeometry(.8,1.1,28),new THREE.MeshBasicMaterial({color:i?0xffffff:0xffe45a,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(p.x,.12,p.z);m.scale.setScalar(.01);scene.add(m);FXS.push({k:'ring',m,t:-dl});});
  // star burst + confetti
  burst(p.x,p.y+cy,p.z,['#ffe45a','#fff3a0','#ffffff','#ff9a2a'],34,8,.9,4,.26);
  confetti(p.x,p.y+cy,p.z);
  // coins fly to the hero
  const n=T.boss?10:6;
  for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.12),new THREE.MeshBasicMaterial({color:0xffd23a}));
    m.position.set(p.x,p.y+cy,p.z);m.visible=false;scene.add(m);
    FXS.push({k:'coin',m,t:-.25-i*.09,from:new THREE.Vector3(p.x,p.y+cy,p.z),vx:(Math.random()-.5)*2.4,vz:(Math.random()-.5)*1.6,lift:2+Math.random()*1.4});}
  burst(p.x,p.y+cy,p.z,['#ff8fb0','#ff5c8a','#ffffff'],16,3.2,1.1,3,.22);
  winPop(t(T.isMon?'winMon':'titanDown'),'+'+bonus+' 🪙'+(friend?'  ·  🤝 '+friend:''));
  G.cheer=1;
}
function fxTick(dt){
  for(let i=FXS.length-1;i>=0;i--){const o=FXS[i];o.t+=dt;if(o.t<0)continue;
    if(o.k==='ring'){const u=Math.min(1,o.t/.7);o.m.scale.setScalar(.3+u*9);o.m.material.opacity=.9*(1-u);if(u>=1){scene.remove(o.m);o.m.geometry.dispose();o.m.material.dispose();FXS.splice(i,1);}}
    else if(o.k==='coin'){o.m.visible=true;const u=Math.min(1,o.t/.75);const e=u*u*(3-2*u);
      const tx=G.hx+.3,ty=2.2+G.hy,tz=0;
      o.m.position.set(lerp(o.from.x+o.vx*u,tx,e),lerp(o.from.y,ty,e)+Math.sin(u*Math.PI)*o.lift,lerp(o.from.z+o.vz*u,tz,e));o.m.rotation.y+=dt*14;
      if(u>=1){burst(tx,ty,0,['#ffd84a','#fff3a0'],6,2.6,.4,4,.1);SFX.coin();scene.remove(o.m);o.m.geometry.dispose();o.m.material.dispose();FXS.splice(i,1);}}
  }
}
function updateFollowers(dt){
  const k=1-Math.exp(-dt*3.2);
  G.titans.filter(T=>T.follow).forEach((T,i)=>{
    const R=T.root,tx=G.hx+2.1+i*1.5,tz=i%2?2.6:1.6;
    R.position.x+=(tx-R.position.x)*k;R.position.z+=(tz-R.position.z)*k;R.position.y=0;
    R.rotation.y=Math.PI/2;R.scale.setScalar(R.scale.x+(.55-R.scale.x)*k);
    if(G.cheer>0&&G.mode!=='duel')T.happy=1;else if(G.mode!=='duel')T.happy=0;
  });
}
function endDuel(){
  const T=G.D.T;if(T.isMon){T.follow=true;T.happy=0;T.fk=G.titans.filter(x=>x.follow).length-1;}else T.happy=1;G.D=null;G.hero.root.scale.setScalar(1);VPW=1;
  G.tIdx++;
  if(G.tIdx>=G.titans.length){$('#duelPanel').classList.remove('show','lockq','flip','walk');stageClear();return;}
  {const P=$('#duelPanel');P.classList.remove('flip','lockq');P.classList.add('walk');}G.go=false;setWalkUI();
  setMode('play');showScreen('s-play');G.walking=true;G.cheer=0;G.faint=false;
  refreshHomeHud();camTo(G.hx+(innerHeight>innerWidth?1.7:4.5),3.2,innerHeight>innerWidth?9.6:11,G.hx+(innerHeight>innerWidth?1.0:3.6),1.7,0,3);
}

/* ---------- stage clear ---------- */
function stageClear(){
  const st=STAGES[G.stageIdx],S=G.slot;
  const w=G.runWrong,stars=w<=1?3:w<=5?2:1;
  S.prog.stars[st.id]=Math.max(S.prog.stars[st.id]||0,stars);
  const first=!S.prog.done.includes(st.id);if(first)S.prog.done.push(st.id);
  const bonus=stars*10;S.coins+=bonus;S.plays++;
  let gift='';
  if(first&&st.reward&&st.reward.pet&&!S.own.pet.includes(st.reward.pet)){S.own.pet.push(st.reward.pet);gift='🐾 '+t('petGift')+' '+nameOf('pet',st.reward.pet);}
  saveDB();refreshHomeHud();
  setMode('result');SFX.win();confetti(G.hx+2,3,0);
  $('#r-title').textContent=t('stageClear');
  $('#r-stars').innerHTML=[1,2,3].map(k=>'<span class="'+(k<=stars?'':'off')+'">⭐</span>').join('');
  $('#r-rw').innerHTML='<span class="badge coin">🪙 +'+(G.runCoins+bonus)+'</span>';
  $('#r-extra').textContent=gift;
  const i=G.stageIdx;
  $('#r-again').onclick=()=>{EZUI.hide('d-result');startStage(i);};
  $('#r-map').onclick=()=>{EZUI.hide('d-result');clearWorld();openMap();};
  setTimeout(()=>EZUI.show('d-result'),1200);
}

/* ---------- pause ---------- */
function doPause(){if(G.paused||(G.mode!=='play'&&G.mode!=='duel'))return;G.paused=true;EZUI.show('d-pause');SFX.tap();}
$('#p-pause').onclick=doPause;
$('#pa-resume').onclick=()=>{G.paused=false;EZUI.hide('d-pause');if(G.mode==='duel'&&G.D&&G.D.state==='wait')nextQ();};
$('#pa-quit').onclick=()=>{G.paused=false;EZUI.hide('d-pause');saveDB();G.D=null;$('#duelPanel').classList.remove('show','lockq','flip','walk');VPW=1;clearWorld();openMap();};

/* ---------- parent menu + gate ---------- */
const GATE={wrong:0,lockUntil:0,ans:0};
function genGate(){
  const r=Math.random(),R=(a,b)=>a+((Math.random()*(b-a+1))|0);let q,a;
  if(r<.34){const x=R(23,89),y=R(6,9),z=R(11,49);q=x+' × '+y+' + '+z+' = ?';a=x*y+z;}
  else if(r<.67){const x=R(120,480),y=R(35,99),k=R(3,7);q='('+x+' − '+y+') × '+k+' = ?';a=(x-y)*k;}
  else{const k=R(12,19),n=R(13,29);q=k+' × '+n+' = ?';a=k*n;}
  GATE.ans=a;return q;
}
function renderParents(){
  const b=$('#pr-body');
  b.innerHTML=(DB.parents.length?DB.parents.map(p=>'<div class="row"><span class="badge">'+(p.ic||'👩')+' <b></b></span></div>').join(''):'<div class="mono">'+t('pEmpty')+'</div>')+'<div class="mono" style="margin-top:10px;font-size:14px;opacity:.8">'+t('pSoon')+'</div>';
  b.querySelectorAll('b').forEach((e,i)=>{e.textContent=DB.parents[i].name;});
  $('#pr-add').style.display=DB.parents.length>=2?'none':'';
}
function openParent(){SFX.tap();renderParents();EZUI.show('d-parent');}
$('#pr-x').onclick=$('#pr-close').onclick=()=>EZUI.hide('d-parent');
$('#pr-add').onclick=()=>{
  if(DB.parents.length>=2){toast(t('gMax'));return;}
  const left=Math.ceil((GATE.lockUntil-Date.now())/1000);
  openGate(left>0?left:0);
};
function openGate(lock){
  const b=$('#g-body');
  if(lock>0){b.innerHTML='<div class="mono">'+t('gWait').replace('{n}',lock)+'</div>';$('#g-ok').style.display='none';}
  else{
    $('#g-ok').style.display='';
    b.innerHTML='<div class="mono" style="margin-bottom:8px">'+t('gBody')+'</div><div class="row"><label>'+t('name')+'</label><input class="txt" id="g-name" maxlength="12" placeholder="'+t('gName')+'"></div><div class="gq" id="g-q" style="font:800 clamp(24px,6vmin,38px) var(--f-display);text-align:center;margin:10px 0">'+genGate()+'</div><div class="row"><label>'+t('gAns')+'</label><input class="txt" id="g-a" inputmode="numeric" pattern="[0-9]*" autocomplete="off"></div>';
  }
  EZUI.show('d-gate');
}
$('#g-x').onclick=$('#g-cancel').onclick=()=>EZUI.hide('d-gate');
$('#g-ok').onclick=()=>{
  const nm=($('#g-name').value||'').trim();if(!nm){toast(t('gNeedName'));return;}
  const v=parseInt($('#g-a').value,10);
  if(v===GATE.ans){
    DB.parents.push({id:Date.now().toString(36),name:nm,ic:DB.parents.length?'👨':'👩'});saveDB();GATE.wrong=0;
    EZUI.hide('d-gate');renderParents();toast(t('gOk'));SFX.ok();if($('#d-join').classList.contains('show')){JN.err='';renderJoin();}
  }else{
    GATE.wrong++;SFX.bad();
    if(GATE.wrong>=3){GATE.wrong=0;GATE.lockUntil=Date.now()+30000;openGate(30);}
    else{toast(t('gWrong'));$('#g-q').textContent=genGate();$('#g-a').value='';}
  }
};
(function(){ // long-press gear
  const g=$('#b-gear');let h=null;
  const st=()=>{clearTimeout(h);h=setTimeout(()=>{h=null;openParent();},1500);g.classList.add('hold');};
  const en=()=>{clearTimeout(h);g.classList.remove('hold');if(h){}};
  g.addEventListener('pointerdown',st);['pointerup','pointerleave','pointercancel'].forEach(ev=>g.addEventListener(ev,en));
  g.addEventListener('click',()=>toast(t('pHold')));
})();

/* ---------- buttons ---------- */
$('#b-play').onclick=()=>{aResume();openSlots();};
$('#b-slots-back').onclick=()=>{SFX.tap();goTitle();};
$('#b-lang').onclick=$('#b-lang2').onclick=()=>{SFX.tap();setLang(LANG==='id'?'en':'id');};
$('#b-mute').onclick=$('#b-mute2').onclick=()=>{setMuted(!AU.muted);$('#b-mute2').textContent=AU.muted?'🔇':'🔊';};
$('#b-style').onclick=()=>{SFX.tap();const lk=Object.assign({},G.slot.look);G.edit={isNew:false,look:Object.assign({},lk),orig:lk,tab:'hair'};openStyleUI();};
$('#b-go').onclick=()=>{SFX.tap();openMap();};
$('#m-back').onclick=()=>{SFX.tap();clearWorld();rebuildHero(G.slot.look);goHome();};
$('#d-pausebtn').onclick=doPause;

/* ---------- main loop ---------- */
function updateChase(dt){
  const C=G.chase,T=G.chaseT;C.off+=7.2*dt;
  C.sc.forEach(s=>{s.o.position.x=((s.x0-C.off*s.k)%C.L+C.L)%C.L-C.L/2;});
  G.cht=(G.cht||0)+dt;const jp=(G.cht%3.6)/.75;const hy=jp<1?Math.sin(jp*Math.PI)*1.7:0;
  const h=G.hero.root;h.position.set(1.8,hy,.6);h.rotation.y=Math.PI/2;h.scale.setScalar(1);
  animKid(G.hero,{moving:hy<=.02,air:hy>.02,spd:7},dt,TT);
  if(G.petM){const P=G.petM.root;P.position.set(.2,hy*.5,1.1);P.rotation.y=Math.PI/2;petAnim(G.petM,true,TT);}
  animTitan(T,dt,TT);
  const ph=TT*4.6,sw=Math.sin(ph);
  T.root.position.set(-2.9+Math.sin(TT*.7)*.6,Math.abs(Math.cos(ph))*.45,-.2);
  T.armR.rotation.x=sw*1.1;T.armL.rotation.x=-sw*1.1;T.legs[0].rotation.x=sw*.7;T.legs[1].rotation.x=-sw*.7;T.body.rotation.x=-.1;
  G.stompT=(G.stompT||0)-dt;if(G.stompT<=0){G.stompT=.34;burst(T.root.position.x+.6,.1,.2,['#cdb27a','#e8d49a','#fff'],4,2,.5,-1,.22);CAM.shake=Math.max(CAM.shake,.09);}
  G.pals.forEach(p=>p.root.visible=false);
}
function updateIdle(dt){
  const m=G.mode;
  G.hero.root.visible=true;
  animKid(G.hero,{moving:false,wave:m==='title',atk:-1,hurt:0,cheer:0,faint:false},dt,TT);
  if(G.petM)petAnim(G.petM,false,TT);
  G.homeObj.clouds.forEach(c=>{c.g.position.x=((c.x0+TT*c.sp+20)%44)-20;});
  G.pals.forEach(p=>animFoe(p,dt,TT));palTick(dt);
  if(G.parent){animKid(G.parent,{moving:false,wave:G.parentWave>0,atk:-1,hurt:0,cheer:G.parentWave>0?0:0,faint:false},dt,TT);G.parentWave=Math.max(0,(G.parentWave||0)-dt);}
  if(m==='title'||m==='slots')updateChase(dt);
}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;TT+=dt;
  const m=G.mode;
  if(!G.paused){
    if(m==='play')updatePlay(dt);
    else if(m==='duel'&&G.D)updateDuel(dt);
    else if(m==='result'){placeHero(dt,{moving:false});}
    else if(m==='map'&&G.mapObj){animKid(G.hero,{moving:false,wave:true,atk:-1,hurt:0,cheer:0,faint:false},dt,TT);if(G.petM)petAnim(G.petM,false,TT);G.mapObj.titans.forEach(T=>animTitan(T,dt,TT));G.mapObj.clouds.forEach(c=>{c.g.position.x=c.x0+Math.sin(TT*c.sp)*3;});}
    else if(m==='title'||m==='slots'||m==='home'||m==='edit'||m==='parent')updateIdle(dt);
    if(m==='play'||m==='duel'||m==='result')updateFollowers(dt);
    G.titans.forEach(T=>animFoe(T,dt,TT));
    if(G.world){G.world.clouds.forEach(c=>{c.g.position.x=c.x0+Math.sin(TT*c.sp)*3;});G.world.pol.forEach(o=>{o.m.position.y=o.y+Math.sin(TT*1.3+o.ph)*.35;o.m.position.x=o.x+Math.sin(TT*.7+o.ph)*.5;});}
    sunFollow(m==='play'||m==='duel'||m==='result'?G.hx:0,0);
    partTick(dt);fxTick(dt);
  }
  if(SUN&&SUN.visible){SUN.position.set(CAM.p.x+30,34,-90);}
  // camera
  const k=1-Math.exp(-CAM.k*dt);CAM.p.lerp(CAM.tp,k);CAM.l.lerp(CAM.tl,k);
  CAM.shake=Math.max(0,CAM.shake-dt*1.5);
  cam.position.copy(CAM.p);if(CAM.shake>0){cam.position.x+=(Math.random()-.5)*CAM.shake;cam.position.y+=(Math.random()-.5)*CAM.shake;}
  cam.lookAt(CAM.l);
  const W=innerWidth,H=innerHeight,port=H>W;let vx=0,vy=0,vw=W,vh=H,ref=m==='map'?1.3:1.6;
  if((m==='duel'&&G.D)||m==='play'){const P=$('#duelPanel');ref=m==='play'?1.25:1;
    if(P.classList.contains('show')){const r=P.getBoundingClientRect();if(port){vh=Math.round(clamp(r.top+30,H*.3,H));vy=H-vh;}else vw=Math.round(clamp(r.left+30,W*.3,W));}
    else if(port){vh=Math.round(H*.48);vy=H-vh;}else vw=Math.round(W*.48);}
  else if((m==='edit'||m==='parent')&&port){const r=(m==='edit'?$('#d-style .panel'):$('#pc-panel')).getBoundingClientRect();ref=1;vh=Math.round(clamp(r.top+30,H*.3,H));vy=H-vh;}
  VPW=vw/W;
  cam.aspect=vw/vh;cam.updateProjectionMatrix();
  if(cam.aspect<ref){const f=Math.min(m==='play'?1.6:(m==='map'?2.4:((m==='title'||m==='slots')?(port?2.3:3.4):2.6)),ref/cam.aspect);cam.position.sub(CAM.l).multiplyScalar(f).add(CAM.l);}
  cam.lookAt(CAM.l);
  if(vw<W||vh<H){renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);renderer.setClearColor(0xd8ecf5,1);renderer.clear();}
  renderer.setScissorTest(true);renderer.setViewport(0,vy,vw,vh);renderer.setScissor(0,vy,vw,vh);
  renderer.render(scene,cam);
  if(m==='map')placeMapNodes();
}

/* ---------- boot ---------- */
(function boot(){
  loadDB();
  LANG=DB.lang||((navigator.language||'id').toLowerCase().startsWith('id')?'id':'en');
  AU.muted=!!DB.muted;
  initScenes();engInit();applyLang();$('#b-mute').textContent=AU.muted?'🔇':'🔊';$('#b-mute2').textContent=AU.muted?'🔇':'🔊';
  $('#ver').textContent='prototype v1.2';
  addEventListener('resize',()=>{if($('#s-map').classList.contains('show'))openMap();});
  if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
  goTitle();
  requestAnimationFrame(frame);
  setTimeout(()=>{const l=$('#loading');l.style.opacity=0;setTimeout(()=>l.style.display='none',450);},500);
  const first=()=>{aResume();bgmStart(AU.kind);};['pointerdown','touchstart','keydown'].forEach(e=>addEventListener(e,first,{passive:true}));
  window.__G=G;
})();
