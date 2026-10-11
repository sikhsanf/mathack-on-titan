/* ===== Mathack on Titan — 3D: renderer, hero, titans, world, home ===== */
const cv=$('#cv');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(38,1.8,.1,300);
scene.add(new THREE.HemisphereLight(0xffffff,0x8f9ab8,.6));
const sun=new THREE.DirectionalLight(0xfff0d0,.62);sun.position.set(-12,22,14);scene.add(sun);scene.add(sun.target);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);const sc_=sun.shadow.camera;sc_.left=-16;sc_.right=16;sc_.top=16;sc_.bottom=-16;sc_.near=1;sc_.far=70;sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;
let _shN=0;
function shadowSweep(){scene.traverse(o=>{if(o.isMesh&&!o.userData.sh){o.userData.sh=1;if(o.material&&!o.material.isMeshBasicMaterial){o.updateWorldMatrix(true,false);o.castShadow=o.matrixWorld.elements[13]<7;o.receiveShadow=true;}}});}
function sunFollow(x,z){sun.target.position.set(x,0,z||0);sun.position.set(x-12,22,(z||0)+14);if(++_shN%20===1)shadowSweep();}

const CAM={p:new THREE.Vector3(0,3,12),l:new THREE.Vector3(0,2,0),tp:new THREE.Vector3(0,3,12),tl:new THREE.Vector3(0,2,0),k:4,shake:0};
function camTo(px,py,pz,lx,ly,lz,k,snap){CAM.tp.set(px,py,pz);CAM.tl.set(lx,ly,lz);CAM.k=k||4;if(snap){CAM.p.copy(CAM.tp);CAM.l.copy(CAM.tl);}}
let VPW=1;   // fraction of the canvas width used by the 3D view (duel = left part)
function resize(){
  const W=innerWidth,H=innerHeight;
  renderer.setSize(W,H,false);
  document.documentElement.style.setProperty('--vh',H*.01+'px');
}
addEventListener('resize',resize);resize();

/* ---------- particles ---------- */
const PART=[],pmat={};
function pm(c){return pmat[c]||(pmat[c]=new THREE.MeshBasicMaterial({color:c}));}
const pgeo=new THREE.BoxGeometry(1,1,1);
function burst(x,y,z,colors,n,sp,life,grav,size){
  for(let i=0;i<n;i++){
    const m=new THREE.Mesh(pgeo,pm(pick(colors)));const s=(size||.18)*rnd(.6,1.3);m.scale.setScalar(s);m.position.set(x,y,z);scene.add(m);
    const a=Math.random()*Math.PI*2,u=rnd(.3,1);
    PART.push({m,vx:Math.cos(a)*sp*u,vy:rnd(.4,1)*sp,vz:Math.sin(a)*sp*u*.5,life:life*rnd(.7,1.1),t:0,g:grav==null?14:grav,rot:rnd(-6,6)});
  }
}
function partTick(dt){
  for(let i=PART.length-1;i>=0;i--){const p=PART[i];p.t+=dt;p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.rotation.x+=p.rot*dt;p.m.rotation.y+=p.rot*dt;
    const k=1-p.t/p.life;if(k<=0){scene.remove(p.m);PART.splice(i,1);}else p.m.scale.setScalar(Math.max(.01,p.m.scale.x*(k<.3?.9:1)));}
}
function confetti(x,y,z){burst(x,y,z,['#ff5d8f','#ffc83a','#3fbf6e','#46a6ff','#a07bff','#ffffff'],46,7,1.6,10,.22);}

/* ---------- kid hero (class-less Ezventure-style voxel kid) ---------- */
function dress(body,o){
  const z=.2;
  switch(o.pat){
   case 'stripe':[.12,.31,.5].forEach(y=>vb(body,.68,.07,.4,o.c2,0,y,0));break;
   case 'star':vb(body,.26,.07,.06,o.c2,0,.38,z);vb(body,.07,.26,.06,o.c2,0,.38,z);[-1,1].forEach(a=>[-1,1].forEach(b=>vb(body,.07,.07,.06,o.c2,a*.09,.38+b*.09,z)));break;
   case 'overall':vb(body,.5,.4,.06,o.c2,0,.2,z);[-1,1].forEach(s=>{vb(body,.1,.36,.42,o.c2,s*.2,.44,0);vb(body,.08,.08,.07,'#ffd84a',s*.2,.5,z+.01);});break;
   case 'vest':vb(body,.2,.17,.06,o.c2,-.18,.18,z);vb(body,.2,.17,.06,o.c2,.18,.18,z);vb(body,.7,.08,.42,o.c2,0,.58,0);break;
   case 'rainbow':['#ff4a4a','#ff9a2a','#ffd84a','#4ac85a','#46a6ff','#a07bff'].forEach((c,i)=>vb(body,.68,.1,.4,c,0,.07+i*.1,0));break;
   case 'hood':vb(body,.5,.2,.24,o.c2,0,.64,-.22);vb(body,.44,.18,.06,o.c2,0,.12,z);break;
  }
}
function buildKid(look){
  const root=new THREE.Group(),model=grp(root,0,0,0);root.add(blob(.8));
  const skin=SKIN[look.skin],hair=HAIR[look.hair],o=OUTFITS[look.outfit],fem=look.g===1,boot='#4a3328';
  const mkLeg=x=>{const g=grp(model,x,.55,0);vb(g,.27,.3,.27,o.pants,0,-.15,0);vb(g,.27,.3,.31,boot,0,-.4,.02);return g;};
  const legL=mkLeg(.16),legR=mkLeg(-.16);
  const body=grp(model,0,.55,0);
  vb(body,fem?.58:.66,.62,.38,o.c,0,.31,0);
  vb(body,.68,.1,.4,'#5a3b2a',0,.05,0);
  dress(body,o);
  if(fem)vb(body,.86,.24,.54,o.pat==='overall'?o.c2:(o.c2&&o.pat!=='star'&&o.pat!=='stripe'?o.c2:o.pants),0,-.1,0);
  const long=o.pat==='hood';
  const mkArm=x=>{const g=grp(body,x,.58,0);vb(g,.22,.3,.24,o.c,0,-.14,0);vb(g,.19,.34,.2,long?o.c:skin,0,-.44,0);if(long)vb(g,.2,.1,.22,skin,0,-.64,0);return g;};
  const armL=mkArm(fem?.39:.43),armR=mkArm(fem?-.39:-.43);
  const head=grp(model,0,1.17,0);
  vb(head,.72,.7,.72,skin,0,.35,0);
  hairStyle(head,hair,look.hs|0);
  [-1,1].forEach(s=>{vb(head,.12,.17,.04,'#1d1630',s*.17,.33,.37);vb(head,.04,.05,.05,'#fff',s*.15,.37,.38);vb(head,.15,.08,.04,'#ff9aa8',s*.27,.2,.37);});
  vb(head,.12,.04,.04,'#8a3a3a',0,.17,.37);
  if(fem){[-1,1].forEach(x=>vb(head,.17,.045,.05,'#1d1630',x*.17,.42,.375));vb(head,.14,.05,.05,'#e0607a',0,.17,.375);}
  else{[-1,1].forEach(x=>vb(head,.17,.05,.05,'#3a2a22',x*.17,.47,.375));}
  if(look.hat>0&&HGB[look.hat])HGB[look.hat](head);
  return {root,model,legL,legR,body,armL,armR,head,ph:0,amp:0,seed:Math.random()*6,look:Object.assign({},look)};
}
/* a: {moving,spd,air,atk(-1|0..1),hurt(0..1),cheer(0..1),faint,wave} */
function animKid(h,a,dt,T){
  h.amp=lerp(h.amp,a.moving?1:0,1-Math.exp(-dt*14));
  if(a.moving)h.ph+=dt*(a.spd||4.5)*2.3;
  const amp=h.amp,sw=Math.sin(h.ph)*amp,idle=1-amp,br=Math.sin(T*2.2+h.seed);
  let lL=sw*.95,lR=-sw*.95,aL=-sw*.8+br*.04*idle,aR=sw*.8-br*.04*idle,zL=.1+amp*.05,zR=-.1-amp*.05;
  let by=Math.abs(Math.cos(h.ph))*.1*amp+br*.012*idle,lean=amp*.14,twist=0,hx=0,hy=Math.sin(T*.9+h.seed)*.18*idle,fall=0;
  if(a.air){lL=-.5;lR=.6;aL=-2.4;aR=-2.2;zL=.5;zR=-.5;lean=.04;}
  if(a.atk>=0){
    const p=a.atk;let u;
    if(p<.38){u=ease(p/.38);aR=lerp(aR,-2.95,u);aL=lerp(aL,.5,u);twist=lerp(0,-.55,u);lean=lerp(lean,-.14,u);}
    else{u=eo(Math.min(1,(p-.38)/.22));const v=ease(Math.max(0,(p-.62)/.38));aR=lerp(lerp(-2.95,-.4,u),aR,v);aL=lerp(lerp(.5,-.5,u),aL,v);twist=lerp(lerp(-.55,.6,u),0,v);lean=lerp(lerp(-.14,.3,u),lean,v);by+=Math.sin(u*Math.PI)*.1*(1-v);}
  }
  if(a.wave){aL=-2.7+Math.sin(T*10)*.35;zL=.55;}
  if(a.hurt>0){const u=a.hurt;lean=-.4*u;aL=-.7*u+aL*(1-u);aR=-.7*u+aR*(1-u);zL=.5;zR=-.5;hx=-.3*u;}
  if(a.cheer>0){const u=Math.sin(a.cheer*Math.PI);aL=aR=-2.9;zL=.35;zR=-.35;by+=u*.5;lL=-.3;lR=.3;}
  if(a.faint){aL=aR=-.3;zL=.8;zR=-.8;lL=.2;lR=-.2;fall=1;lean=0;}
  h.legL.rotation.x=lL;h.legR.rotation.x=lR;
  h.armL.rotation.set(aL,0,zL);h.armR.rotation.set(aR,0,zR);
  h.body.rotation.set(0,twist,0);h.body.scale.y=1+br*.025*idle;
  h.model.rotation.x=fall?lerp(h.model.rotation.x,-1.45,1-Math.exp(-dt*9)):lean;
  h.model.position.y=fall?lerp(h.model.position.y,.25,1-Math.exp(-dt*9)):by;
  h.head.rotation.set(hx,hy-twist*.6,Math.sin(h.ph*2+1)*.04*amp);
}

/* ---------- Titan (cute voxel giants, original designs) ---------- */
function shade(hex,amt){const c=new THREE.Color(hex);const hsl={};c.getHSL(hsl);c.setHSL(hsl.h,hsl.s,clamp(hsl.l+amt,0,1));return '#'+c.getHexString();}
const TACC={
 sprout(H,B,tb){tb(H,.18,.55,.18,'#4aa84a',0,1.95,0);[-1,1].forEach(s=>{const l=tb(H,.7,.13,.35,'#6ed86a',s*.4,2.3,0);l.rotation.z=-s*.5;});},
 tulip(H,B,tb){tb(H,.8,.5,.8,'#e0407a',0,1.95,0);[[-.3,0],[.3,0],[0,.3],[0,-.3]].forEach(p=>tb(H,.28,.45,.28,'#ff6aa0',p[0],2.4,p[1]));tb(H,.16,.4,.16,'#3a9a4a',0,1.8,0);},
 sunflower(H,B,tb){for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const p=tb(H,.5,.22,.6,'#ffd21a',Math.sin(a)*.95,1.9,Math.cos(a)*.95);p.rotation.y=a;}tb(H,1.1,.25,1.1,'#7a4a1a',0,1.95,0);tb(H,.7,.1,.7,'#5a3010',0,2.1,0);
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const p=tb(H,.4,.18,.5,'#ffe45a',Math.sin(a)*.62,2.0,Math.cos(a)*.62);p.rotation.y=a;}},
 bee(H,B,tb){[-1,1].forEach(s=>{tb(H,.1,.6,.1,'#2a2030',s*.4,2.0,.2);tb(H,.28,.28,.28,'#2a2030',s*.4,2.35,.2);});
   [.5,1.3].forEach(y=>tb(B,2.25,.22,1.55,'#2a2030',0,y,0));[-1,1].forEach(s=>tb(B,.1,1.2,.9,'#d8f4ff',s*.4,1.4,-.9,{opacity:.7}));},
 butterfly(H,B,tb){[-1,1].forEach(s=>{tb(H,.1,.6,.1,'#5a3a8a',s*.4,2.0,.2);tb(H,.25,.25,.25,'#ff8fc2',s*.4,2.35,.2);});
   [-1,1].forEach(s=>{const w=tb(B,1.8,1.5,.12,'#b48aff',s*1.2,1.1,-.95);w.rotation.y=-s*.5;const w2=tb(B,1.0,.9,.14,'#ff9fd0',s*1.0,.4,-.95);w2.rotation.y=-s*.5;});},
 honey(H,B,tb){tb(H,2.3,.5,2.1,'#d07a10',0,1.9,0);tb(H,1.7,.4,1.5,'#ffc83a',0,2.3,0);tb(H,.5,.7,.15,'#ffc83a',.8,1.55,.92);tb(H,.5,.5,.15,'#ffc83a',-.5,1.6,.92);
   [-1,1].forEach(s=>{tb(H,.1,.5,.1,'#2a2030',s*.4,2.7,0);tb(H,.28,.28,.28,'#ffd84a',s*.4,3.0,0);});},
 mushroom(H,B,tb){tb(H,2.7,.55,2.5,'#e0453c',0,1.95,0);tb(H,1.9,.5,1.8,'#e0453c',0,2.45,0);[[.7,.5,.7],[-.7,.4,.5],[.2,.3,-.9],[-.3,.7,-.4]].forEach(p=>tb(H,.4,.12,.4,'#fff',p[0],p[1]+2.0,p[2]));},
 snail(H,B,tb){[-1,1].forEach(s=>{tb(H,.1,.7,.1,'#8aa84a',s*.4,2.0,.4);tb(H,.28,.28,.28,'#1d1630',s*.4,2.4,.4);});
   tb(B,1.8,1.8,.7,'#d9a45a',0,1.1,-1.1);tb(B,1.2,1.2,.74,'#f0c880',0,1.1,-1.1);tb(B,.6,.6,.78,'#d9a45a',0,1.1,-1.1);},
 rainbow(H,B,tb){['#ff4a4a','#ff9a2a','#ffd84a','#4ac85a','#46a6ff','#a07bff'].forEach((c,i)=>tb(H,2.1-i*.25,.3,1.9-i*.25,c,0,1.85+i*.28,0));tb(H,.4,.4,.4,'#fff',0,3.65,0,{emissive:'#ffffff'});
   [[-.9,0],[.9,0],[0,.9],[0,-.9]].forEach(p=>{tb(H,.34,.34,.34,'#ff8fc2',p[0],1.95,p[1]);});}
};
function buildTitan(def){
  const s=def.s,root=new THREE.Group();root.add(blob(2.6*s));
  const g=grp(root,0,0,0);g.scale.setScalar(s);
  const c=def.c,b=def.b,dk=shade(c,-.14);
  const tb=(p,w,h,d,col,x,y,z,o)=>vb(p,w,h,d,col,x,y,z,Object.assign({own:true},o||{}));
  const legs=[];[-1,1].forEach(x=>{const l=grp(g,x*.55,1.3,0);tb(l,.8,1.3,.9,dk,0,-.65,0);tb(l,.9,.3,1.15,shade(c,-.28),0,-1.15,.1);legs.push(l);});
  const body=grp(g,0,1.3,0);tb(body,2.2,1.8,1.5,c,0,.9,0);tb(body,1.4,1.2,.1,b,0,.8,.78);
  const mkArm=x=>{const a=grp(body,x,1.65,0);tb(a,.6,1.4,.7,c,0,-.7,0);tb(a,.75,.75,.75,b,0,-1.5,0);return a;};
  const armL=mkArm(1.4),armR=mkArm(-1.4);
  const head=grp(body,0,1.8,.05);tb(head,2.0,1.7,1.8,c,0,.85,0);
  [-1,1].forEach(x=>{tb(head,.55,.62,.1,'#fff',x*.45,.95,.92);tb(head,.3,.36,.12,'#1d1630',x*.45,.92,.95);tb(head,.1,.1,.13,'#fff',x*.45+.08,1.04,.97);
    const br=tb(head,.5,.09,.08,dk,x*.45,1.42,.92);br.rotation.z=x*.18;tb(head,.32,.18,.08,'#ff9aa8',x*.8,.62,.92);tb(head,.2,.36,.3,c,x*1.05,.9,0);});
  tb(head,.5,.1,.08,'#7a2a2a',0,.48,.92);[-1,1].forEach(x=>tb(head,.1,.12,.08,'#7a2a2a',x*.3,.56,.92));
  (TACC[def.k]||TACC.sprout)(head,body,tb);
  const star=grp(g,0,4.1,-1.3);const sm=[[.14,1.0,.3],[.14,.3,1.0],[.14,.55,.55]];
  sm.forEach(a=>vb(star,a[0],a[1],a[2],'#ffe45a',0,0,0,{own:true,emissive:'#ffb000'}));
  const sg=vb(star,.1,1.5,1.5,'#fff3a0',0,0,0,{own:true,opacity:.18,emissive:'#ffd84a'});
  const mats=[];root.traverse(o=>{if(o.material&&o.material.emissive&&!o.parent.isMesh)mats.push(o.material);});
  return {root,g,body,head,armL,armR,legs,star,starGlow:sg,def,mats,seed:Math.random()*6,flash:0,hit:0,defeat:0,stomp:-1,wave:0,happy:0,baseS:s};
}
function titanStarWorld(T,out){T.star.getWorldPosition(out);return out;}
function animTitan(T,dt,time){
  const br=Math.sin(time*1.7+T.seed);
  let lean=0,armR=.1*br,armL=-.1*br,headRx=0,gz=0,by=0,spin=1;
  if(T.stomp>=0){const p=T.stomp;
    if(p<.45){const u=ease(p/.45);armR=lerp(armR,-2.9,u);armL=lerp(armL,-.6,u);lean=-.12*u;}
    else if(p<.62){const u=eo((p-.45)/.17);armR=lerp(-2.9,.35,u);armL=-.6;lean=lerp(-.12,.28,u);by=-.08*u;}
    else{const u=ease((p-.62)/.38);armR=lerp(.35,0,u);armL=lerp(-.6,0,u);lean=lerp(.28,0,u);}
  }
  if(T.hit>0){const u=T.hit;headRx=-.3*u;gz=-.45*u;lean-=.08*u;T.hit=Math.max(0,T.hit-dt*2.6);}
  if(T.wave>0){armL=-2.8+Math.sin(time*9)*.4;}
  if(T.happy>0){by+=Math.abs(Math.sin(time*7))*.25;armL=-2.6+Math.sin(time*9)*.4;armR=2.6*0+(-2.6+Math.sin(time*9+1)*.4);}
  T.body.rotation.x=lean;T.armR.rotation.x=armR;T.armL.rotation.x=armL;
  T.head.rotation.x=headRx+Math.sin(time*1.1+T.seed)*.03;
  T.g.position.z=gz;T.g.position.y=by;T.body.scale.y=1+br*.012;
  const sc=T.baseS*lerp(1,.38,T.defeat);T.g.scale.setScalar(sc);
  T.star.rotation.x+=dt*1.6*spin;T.star.position.y=4.1+Math.sin(time*2.4)*.12;T.star.scale.setScalar(T.defeat>0?Math.max(.01,1-T.defeat*3):1);
  T.starGlow.material.opacity=.14+.1*Math.sin(time*5);
  if(T.flash>0){T.flash=Math.max(0,T.flash-dt*3.2);}
  const f=T.flash;
  T.root.traverse(o=>{if(o.material&&o.material.emissive&&o.material.userData&&!o.material.userData.shared&&o!==T.star&&o.parent!==T.star){o.material.emissive.setRGB(f*.9,f*.7,f*.5);}});
}

/* ---------- world: Padang Bunga ---------- */
function bx(p,w,h,d,c,x,y,z,o){return vb(p,w,h,d,c,x,y,z,o);}
function buildWorld(st){
  const g=new THREE.Group(),R=mulberry(st.id*7919+13),L=st.len+40;
  const cx=L/2-10;
  bx(g,L+60,2,26,st.ground,cx,-1,0);bx(g,L+60,1.4,26,st.dirt,cx,-2.7,0);
  bx(g,L+60,.05,3.2,'#f0dc9a',cx,.03,.4);
  // grass stripes (alternating tone) + path edge
  for(let i=0;i*5<L+60;i++){if(i%2)bx(g,5,.03,26,shade(st.ground,.035),-30+i*5+2.5,.01,0);}
  // distant hills
  for(let i=0;i<14;i++){const w=rnd(14,28),h=rnd(3,7);bx(g,w,h,10,shade(st.ground,-.04-R()*.08),-20+i*(L+60)/13,h/2-1,-24-R()*8);}
  // flowers
  const FC=['#ff5d8f','#ffd84a','#ffffff','#a07bff','#ff9a2a','#46a6ff'];
  const nF=st.id===2?170:130;
  for(let i=0;i<nF;i++){const x=-8+R()*(L+10),z=(R()<.55?-1:1)*(1.6+R()*5.5);const h=.35+R()*.45,col=FC[(R()*FC.length)|0];
    bx(g,.07,h,.07,'#3aa04a',x,h/2,z);bx(g,.26,.26,.26,col,x,h+.1,z);bx(g,.1,.1,.1,'#ffe45a',x,h+.1,z+.14);}
  // bushes & rocks
  for(let i=0;i<34;i++){const x=-8+R()*(L+10),z=(R()<.7?-1:1)*(2.4+R()*6);const s=.5+R()*.6;bx(g,s*1.4,s,s,'#4fb35a',x,s/2,z);bx(g,s,s*.8,s*.9,'#63c76a',x+s*.3,s*.9,z);}
  for(let i=0;i<14;i++){const x=-8+R()*(L+10),z=-(2.5+R()*6);const s=.4+R()*.5;bx(g,s*1.5,s,s,'#b0b6c0',x,s/2,z);}
  // trees
  for(let i=0;i<26;i++){const x=-6+i*(L/26)+R()*3,z=-(4+R()*7);const h=2+R()*1.4;
    bx(g,.6,h,.6,'#8a5a2b',x,h/2,z);const cc=pick(['#3fae5a','#4fc06a','#35a050']);bx(g,2.2,1.5,2.2,cc,x,h+.5,z);bx(g,1.5,1.2,1.5,shade(cc,.06),x,h+1.6,z);}
  // fence pieces
  for(let i=0;i<16;i++){const x=-4+R()*L,z=-2.6-R()*.4;bx(g,.12,.9,.12,'#c9a06a',x,.45,z);bx(g,.12,.9,.12,'#c9a06a',x+1.1,.45,z);bx(g,1.3,.12,.1,'#d9b27a',x+.55,.65,z);bx(g,1.3,.12,.1,'#d9b27a',x+.55,.3,z);}
  if(st.id===2){for(let i=0;i<6;i++){const x=10+i*L/6+R()*4,z=-(3+R()*3);bx(g,.9,1.1,.9,'#f0b830',x,.7,z);bx(g,1.0,.2,1.0,'#d89a20',x,1.3,z);bx(g,.3,.3,.1,'#3a2a10',x,.7,z+.46);}}
  if(st.id===3){for(let i=0;i<9;i++){const x=6+i*L/9+R()*4,z=-(3+R()*4);bx(g,.35,.8,.35,'#fff3d6',x,.4,z);bx(g,1.2,.4,1.1,'#e0453c',x,.95,z);bx(g,1.0,.35,.9,'#e0453c',x,1.25,z);bx(g,.2,.1,.2,'#fff',x+.2,1.0,z+.5);}
    ['#ff4a4a','#ff9a2a','#ffd84a','#4ac85a','#46a6ff','#a07bff'].forEach((c,i)=>{const r=26-i*1.6;for(let k=0;k<=18;k++){const a=Math.PI*k/18;bx(g,1.6,1.6,1.2,c,60+Math.cos(a)*r,Math.sin(a)*r*.62+1,-34);}});}
  // clouds
  const clouds=[];for(let i=0;i<16;i++){const cg=new THREE.Group();const n=3+((R()*3)|0);for(let k=0;k<n;k++)bx(cg,2.2+R()*2,1+R()*.8,1.6+R(),'#ffffff',k*1.8-n,R()*.6,R()*.8,{opacity:.95});cg.position.set(-10+i*(L+30)/15,9+R()*7,-(12+R()*14));g.add(cg);clouds.push({g:cg,sp:.2+R()*.3,x0:cg.position.x});}
  // coins
  const coins=[];
  const cm=(x,y)=>{const m=new THREE.Group();vb(m,.5,.5,.1,'#ffc21a',0,0,0,{emissive:'#a06a00'});vb(m,.3,.3,.12,'#ffe56a',0,0,0,{emissive:'#a08000'});m.position.set(x,y,0);g.add(m);coins.push({m,x,y,got:false});};
  st.titans.forEach((tt,i)=>{const x0=(i?st.titans[i-1].x:0)+8;for(let k=0;k<5;k++)cm(x0+k*1.6,1.0);const x1=x0+11;for(let k=0;k<5;k++)cm(x1+k*1.5,k%2?2.5:2.3);});
  // floating pollen sparkles
  const pol=[];for(let i=0;i<60;i++){const m=new THREE.Mesh(pgeo,pm(i%3?'#fff7b0':'#ffffff'));m.scale.setScalar(.11);m.position.set(-6+R()*(L+10),.6+R()*3.4,-3+R()*8);g.add(m);pol.push({m,x:m.position.x,y:m.position.y,ph:R()*6});}
  return {g,coins,clouds,len:st.len,pol};
}

/* ---------- home (Markas) diorama ---------- */
function buildHome(){
  const g=new THREE.Group();
  bx(g,18,1.4,13,'#7ed957',0,-.7,0);bx(g,18,1.6,13,'#9a6b3f',0,-2.2,0);bx(g,18.4,.3,13.4,'#6bc84a',0,-1.4,0);
  bx(g,9,.05,2.4,'#f0dc9a',1.5,.03,2.2);
  // house
  const h=grp(g,-5.2,0,-2.4);bx(h,3.4,2.5,2.8,'#ffe6c2',0,1.25,0);bx(h,4.0,.5,3.4,'#e0603c',0,2.75,0);bx(h,3.0,.5,2.6,'#e0603c',0,3.25,0);bx(h,2.0,.5,2.0,'#e0603c',0,3.75,0);
  bx(h,.8,1.4,.1,'#8a5a2b',0,.7,1.42);bx(h,.7,.7,.1,'#bfe8ff',-1.0,1.5,1.42);bx(h,.7,.7,.1,'#bfe8ff',1.0,1.5,1.42);bx(h,.15,.15,.1,'#ffd84a',.25,.7,1.5);
  // trees
  const tree=(x,z,s)=>{bx(g,.7*s,2.4*s,.7*s,'#8a5a2b',x,1.2*s,z);bx(g,2.6*s,1.6*s,2.6*s,'#3fae5a',x,3.0*s,z);bx(g,1.8*s,1.3*s,1.8*s,'#56c46a',x,4.1*s,z);};
  tree(-8,1.5,1);tree(7.4,-3,1.2);tree(8,3.2,.9);
  // flowers
  const FC=['#ff5d8f','#ffd84a','#ffffff','#a07bff','#ff9a2a','#46a6ff'];const R=mulberry(77);
  for(let i=0;i<46;i++){const x=-8+R()*16,z=-5.4+R()*10.4;if(Math.abs(z-2.2)<1.4&&x>-3)continue;const hh=.3+R()*.4;bx(g,.07,hh,.07,'#3aa04a',x,hh/2,z);bx(g,.26,.26,.26,pick(FC),x,hh+.1,z);}
  // fence + sign
  for(let i=0;i<7;i++){const x=-6+i*1.6;bx(g,.14,1,.14,'#c9a06a',x,.5,-5.7);bx(g,1.6,.14,.1,'#d9b27a',x+.8,.72,-5.7);}
  bx(g,.18,1.5,.18,'#8a5a2b',4.4,.75,-1.2);bx(g,1.5,.7,.14,'#ffe6c2',4.4,1.5,-1.2);bx(g,1.1,.14,.16,'#e0603c',4.4,1.5,-1.12);
  const clouds=[];for(let i=0;i<7;i++){const cg=new THREE.Group();for(let k=0;k<4;k++)bx(cg,2.2+R()*2,1+R()*.8,1.6,'#fff',k*1.8-3,R()*.6,R()*.8);cg.position.set(-16+i*5.5,8+R()*4,-10-R()*6);g.add(cg);clouds.push({g:cg,sp:.25+R()*.3,x0:cg.position.x});}
  return {g,clouds};
}

/* ---------- landing: endless run with a scrolling meadow ---------- */
function buildChase(){
  const g=new THREE.Group(),R=mulberry(321),L=64,sc=[];
  bx(g,300,2,34,'#62b24a',0,-1,0);bx(g,300,1.4,34,'#7d5430',0,-2.7,0);bx(g,300,.05,3.8,'#e6d29a',0,.03,.6);
  const add=(o,x,k)=>{g.add(o);sc.push({o,x0:x,k:k||1});return o;};
  for(let i=0;i<10;i++){const s=new THREE.Group();bx(s,3.2,.03,34,'#6fbd55',0,.012,0);add(s,i*6.4);}
  const tree=(x,z,s)=>{const t=new THREE.Group();bx(t,.8*s,2.6*s,.8*s,'#7d5430',0,1.3*s,0);bx(t,2.8*s,1.7*s,2.8*s,'#3f9a52',0,3.2*s,0);bx(t,1.9*s,1.4*s,1.9*s,'#58b469',0,4.4*s,0);t.position.z=z;add(t,x);};
  for(let i=0;i<12;i++)tree(i*5.3+R()*2,-4.5-R()*5,.9+R()*.7);
  const FC=['#ff5d8f','#ffd84a','#ffffff','#a07bff','#ff9a2a','#46a6ff'];
  for(let i=0;i<46;i++){const f=new THREE.Group(),hh=.3+R()*.4;bx(f,.07,hh,.07,'#3aa04a',0,hh/2,0);bx(f,.26,.26,.26,pick(FC),0,hh+.1,0);f.position.z=R()<.5?-1.6-R()*2.4:2.8+R()*3.6;add(f,R()*L);}
  for(let i=0;i<8;i++){const r=new THREE.Group();bx(r,.9,.6,.8,'#a9a4b8',0,.3,0);bx(r,.5,.4,.5,'#bdb8cc',.2,.7,.1);r.position.z=3.6+R()*3;add(r,R()*L);}
  for(let i=0;i<7;i++){const cg=new THREE.Group();for(let k=0;k<4;k++)bx(cg,2.2+R()*2,1+R()*.8,1.6,'#fff',k*1.8-3,R()*.6,R()*.8);cg.position.set(0,8+R()*4,-16-R()*6);add(cg,i*9.2,.12);}
  for(let i=0;i<10;i++){const w=rnd(14,26),h=rnd(4,8);const hl=new THREE.Group();bx(hl,w,h,10,shade('#62b24a',-.05-R()*.08),0,h/2-1,0);hl.position.z=-26-R()*6;add(hl,i*6.4,.03);}
  return {g,sc,L,off:0};
}

/* ---------- world map (3D diorama with a winding path) ---------- */
function buildMapWorld(pos,openFlags,doneFlags){
  const g=new THREE.Group(),R=mulberry(4242),clouds=[];
  const zs=pos.map(p=>p[2]),zmin=Math.min.apply(null,zs)-7,zmax=Math.max.apply(null,zs)+7,xs=pos.map(p=>p[0]),xmin=Math.min.apply(null,xs)-9,xmax=Math.max.apply(null,xs)+9;
  const cx=(xmin+xmax)/2,cz=(zmin+zmax)/2,w=xmax-xmin,d=zmax-zmin;
  bx(g,w,1.4,d,'#7ed957',cx,-.7,cz);bx(g,w+.6,.35,d+.6,'#6bc84a',cx,-1.4,cz);bx(g,w,2.2,d,'#9a6b3f',cx,-2.6,cz);bx(g,w-1.5,1.2,d-1.5,'#84582f',cx,-4.2,cz);
  for(let i=0;i*4<w;i++){if(i%2)bx(g,4,.03,d,shade('#7ed957',.04),xmin+i*4+2,.01,cz);}
  // path
  const pts=[];
  for(let k=0;k<pos.length-1;k++){
    const a=pos[k],b=pos[k+1],mx=(a[0]+b[0])/2,mz=(a[2]+b[2])/2,dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz),nx=-dz/L,nz=dx/L,sgn=k%2?1:-1,cxp=mx+nx*3.2*sgn,czp=mz+nz*3.2*sgn;
    const reached=!!doneFlags[k];
    for(let t=0;t<=1;t+=1/(L*.85)){const u=1-t,x=u*u*a[0]+2*u*t*cxp+t*t*b[0],z=u*u*a[2]+2*u*t*czp+t*t*b[2];pts.push([x,z,reached]);}
  }
  pts.forEach((q,i)=>{bx(g,1.5,.06,1.5,q[2]?'#ffd24a':'#efd48a',q[0],.03,q[1]);if(i%3===0){bx(g,.3,.1,.3,q[2]?'#ffb000':'#d9b866',q[0]+.95,.05,q[1]+.2);bx(g,.3,.1,.3,q[2]?'#ffb000':'#d9b866',q[0]-.95,.05,q[1]-.2);}});
  const nearPath=(x,z,r)=>pts.some(q=>Math.hypot(q[0]-x,q[1]-z)<r)||pos.some(p=>Math.hypot(p[0]-x,p[2]-z)<r+1.4);
  // nodes
  const nodes=[],titans=[];
  pos.forEach((p,i)=>{
    const o=grp(g,p[0],0,p[2]);
    bx(o,3.6,.5,3.6,openFlags[i]?'#ffd84a':'#b9b4d0',0,.25,0);bx(o,3.0,.2,3.0,openFlags[i]?'#fff3a0':'#d7d3e8',0,.55,0);
    [-1,1].forEach(a=>[-1,1].forEach(b=>bx(o,.4,.7,.4,openFlags[i]?'#e0a020':'#9a96b8',a*1.7,.35,b*1.7)));
    nodes.push({x:p[0],z:p[2],o});
  });
  // trees / flowers / bushes / fence
  const FC=['#ff5d8f','#ffd84a','#ffffff','#a07bff','#ff9a2a','#46a6ff'];
  for(let i=0;i<46;i++){const x=xmin+1+R()*(w-2),z=zmin+1+R()*(d-2);if(nearPath(x,z,3.4)||z>zmax-6)continue;const h=2.2+R()*1.6,cc=pick(['#3fae5a','#4fc06a','#35a050']);bx(g,.7,h,.7,'#8a5a2b',x,h/2,z);bx(g,2.4,1.6,2.4,cc,x,h+.4,z);bx(g,1.6,1.3,1.6,shade(cc,.06),x,h+1.5,z);}
  for(let i=0;i<150;i++){const x=xmin+.5+R()*(w-1),z=zmin+.5+R()*(d-1);if(nearPath(x,z,1.4))continue;const hh=.35+R()*.45;bx(g,.07,hh,.07,'#3aa04a',x,hh/2,z);bx(g,.28,.28,.28,pick(FC),x,hh+.1,z);bx(g,.1,.1,.1,'#ffe45a',x,hh+.1,z+.15);}
  for(let i=0;i<22;i++){const x=xmin+1+R()*(w-2),z=zmin+1+R()*(d-2);if(nearPath(x,z,1.8))continue;const s=.6+R()*.6;bx(g,s*1.5,s,s,'#4fb35a',x,s/2,z);bx(g,s,s*.8,s*.9,'#63c76a',x+s*.3,s*.9,z);}
  for(let i=0;i<10;i++){const x=xmin+2+i*(w-4)/9,z=zmin+.8;bx(g,.14,1,.14,'#c9a06a',x,.5,z);bx(g,(w-4)/9,.14,.1,'#d9b27a',x+(w-4)/18,.72,z);}
  for(let i=0;i<8;i++){const cg=new THREE.Group();for(let k=0;k<4;k++)bx(cg,2.4+R()*2,1+R()*.8,1.8,'#fff',k*2-3,R()*.6,R()*.8);cg.position.set(xmin-2+R()*(w+4),7+R()*4,zmin-6-R()*6);g.add(cg);clouds.push({g:cg,sp:.2+R()*.3,x0:cg.position.x});}
  return {g,nodes,clouds,cx,cz,w,d};
}
function addPadlock(parent,x,y,z){const o=grp(parent,x,y,z);bx(o,.9,.75,.4,'#9aa0b8',0,0,0);bx(o,.9,.1,.42,'#c8cde0',0,.2,0);bx(o,.15,.55,.15,'#7c829c',-.28,.62,0);bx(o,.15,.55,.15,'#7c829c',.28,.62,0);bx(o,.7,.15,.15,'#7c829c',0,.95,0);bx(o,.14,.2,.44,'#2b2350',0,-.05,0);return o;}
