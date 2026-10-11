/* ===== Mathack on Titan — data, i18n, audio, save ===== */
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[(Math.random()*a.length)|0];
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- i18n ---------- */
const TX={
id:{
 tagline:'Petualangan matematika melawan Titan lucu!',play:'Main',slots:'Pilih Karakter',newChar:'Karakter Baru',emptySlot:'Kosong',
 name:'Nama',namePh:'Nama kamu',level:'Level',lvPrak:'Pra-K (3-4 th)',lvK:'K (4-6 th)',boy:'Laki-laki',girl:'Perempuan',
 start:'Mulai',back:'Kembali',close:'Tutup',ok:'OK',cancel:'Batal',save:'Simpan',done:'Selesai',
 hair:'Rambut',hairc:'Warna',skin:'Kulit',shirt:'Baju',hat:'Topi',pet:'Pet',none:'Tidak ada',
 buy:'Beli',owned:'Dimiliki',notEnough:'Koin belum cukup',bought:'Dibeli!',
 homePlay:'Main',homeStyle:'Ganti Gaya',coins:'Koin',parent:'Orang Tua',
 mapTitle:'Padang Bunga',stage:'Stage',locked:'Terkunci',
 st1:'Titan Pertama',st2:'Kebun Madu',st3:'Taman Pelangi',
 coop:'Co-op',coopTitle:'Main bareng Orang Tua',coopHow:'Minta Mama atau Papa buka Mathack di HP-nya, tap tombol 👨‍👩 Orang Tua di layar awal, lalu masukkan kode ini:',coopWait:'Menunggu orang tua join',coopSim:'🧪 Simulasi join',coopOn:'lagi main bareng!',coopEnd:'Selesai Co-op',coopNone:'Belum ada akun orang tua. Tahan tombol ⚙️ selama 1,5 detik untuk menambahkan.',coopProto:'Kedua HP perlu internet.',coopJoined:'join!',wTitle:'Padang Bunga',stagesLeft:'Lanjut petualangan!',close:'Tutup', jnTitle:'Gabung Co-op sebagai Orang Tua',jnNone:'Buat akun orang tua dulu, lalu kamu bisa gabung ke permainan anak.',jnMake:'Buat akun orang tua',jnWho:'Siapa yang bergabung?',jnGate:'Jawab soal ini (khusus orang dewasa):',jnCode:'Kode dari HP anak',jnGo:'Gabung',jnConn:'Menyambung…',jnNocode:'Kode tidak ditemukan. Cek kodenya lagi.',jnNet:'Tidak bisa tersambung. Cek internet kedua HP.',jnBusy:'Sudah ada orang tua yang bergabung.',jnTimeout:'Waktu habis. Pastikan kode benar dan HP anak sedang di layar Co-op.',jnClosed:'Koneksi terputus.',jnWrong:'Jawaban belum tepat.',jnLeave:'Keluar',coopErrNet:'Tidak bisa terhubung ke server. Cek internet.',coopRetry:'Coba lagi',pcWalk:'sedang berjalan',pcHome:'di beranda',pcMap:'memilih stage',pcDuel:'melawan',pcResult:'selesai stage',pcTitle:'di layar awal',pcWait:'Menunggu…',pkHeal:'Nyawa +1',pkPower:'Super',pkShield:'Perisai',pkGift:'Hadiah',pcNote:'Kamu membantu lewat bonus, bukan menjawab soal. Bonus terbatas per stage.',pcHint:'Bonus nyawa, serangan dan perisai hanya bisa dipakai saat anak sedang melawan.',parentBtn:'👨‍👩 Orang Tua', jump:'Lompat',walk:'Jalan',stopW:'Berhenti',tapWalk:'Tap Jalan untuk melangkah!',tapJump:'Tap Lompat untuk ambil koin!',winMon:'Kenyang! Jadi teman!',pause:'Jeda',resume:'Lanjut',quit:'Keluar ke Peta',paused:'Jeda',
 pbub:['Halo, teman! 👋','Aku senang main sama kamu!','Apelnya enak banget tadi 🍎','Ayo petualangan lagi!','Kamu hebat berhitung!','Hehe, geli!','Aku sayang kamu 💛','Hari ini kita main apa?','Kamu pintar sekali!','Yuk hitung bareng: 1, 2, 3!','Aku kenyang dan senang 😊','Kamu teman terbaikku!'],hit:'Nyam!',miss:'Meleset!',faint:'Aduh, pingsan! Ayo bangun lagi!',great:'Hebat!',
 stageClear:'Stage Selesai!',reward:'Hadiah',stars:'Bintang',again:'Main Lagi',toMap:'Ke Peta',next:'Lanjut',
 petGift:'Pet baru untukmu!',monAppear:'Monster lapar!',monDown:'Monster kabur!',pickHair:'Model rambut',titanDown:'Titan jadi teman!',defeated:'sudah jadi teman!',
 delTitle:'Hapus karakter?',delBody:'Semua kemajuan karakter ini akan hilang.',delete:'Hapus',
 rotate:'Putar HP ke posisi mendatar',
 pTitle:'Menu Orang Tua',pHold:'Tahan ikon gear 1,5 detik',pAccounts:'Akun orang tua',pAdd:'Buat akun orang tua',pEmpty:'Belum ada akun orang tua.',
 pSoon:'Co-op dengan orang tua segera hadir. Orang tua nanti bergabung dari HP sendiri untuk membantu anak.',
 gTitle:'Verifikasi Orang Tua',gBody:'Jawab soal ini untuk membuat akun orang tua. Soalnya khusus orang dewasa.',gName:'Nama panggilan (mis. Mama)',gAns:'Jawaban',gCheck:'Periksa',gWrong:'Belum tepat, coba lagi.',gWait:'Terlalu banyak salah. Coba lagi dalam {n} detik.',gMax:'Maksimal 2 akun orang tua.',gOk:'Akun orang tua dibuat!',gNeedName:'Isi nama panggilan dulu.',
 soon:'Segera hadir',sound:'Suara',lang:'Bahasa',loading:'Memuat soal...',
 tipJump:'Tekan Lompat untuk mengambil koin!',tipTitan:'Titan lapar! Jawab soal untuk lempar apel!',
 heartsLeft:'Hati',titanHp:'Kekuatan Titan',
 hatNames:{1:'Pita',2:'Topi Biru',3:'Topi Koki',4:'Mahkota Bunga',5:'Telinga Kucing',6:'Telinga Beruang',8:'Helm Akuarium',10:'Topi Jerami',14:'Topi Bebek',15:'Topi Pesta',16:'Mahkota',17:'Helm',18:'Topi Jamur',19:'Topi Naga',20:'Topi Pelangi'},
 hsNames:['Pendek','Bob','Panjang','Kuncir Kuda','Kuncir Dua','Jabrik','Cepak','Sanggul','Mohawk','Rapi','Gondrong','Pixie'],
 outNames:['Kaos Merah','Kaos Biru','Kaos Hijau','Hoodie Ungu','Bintang Kuning','Garis Pelaut','Overall Jeans','Piyama Bintang','Baju Penjelajah','Baju Pelangi'],
 petNames:['','Kuda','Domba','Beruang','Slime Pelangi','Kucing','Robot','Tupai','Rusa','Rubah'],
 titanNames:{sprout:'Tunas Loncat',jelly:'Jeli Hijau',bee:'Lebah Madu',moth:'Ngengat Bulan',shroom:'Jamur Usil',bunny:'Kelinci Mochi',tunas:'Titan Tunas',tulip:'Titan Tulip',matahari:'Titan Matahari',lebah:'Titan Lebah',kupu:'Titan Kupu-kupu',madu:'Titan Madu',jamur:'Titan Jamur',siput:'Titan Siput',raja:'Raja Bunga'}
},
en:{
 tagline:'A math adventure against cute Titans!',play:'Play',slots:'Choose Character',newChar:'New Character',emptySlot:'Empty',
 name:'Name',namePh:'Your name',level:'Level',lvPrak:'Pre-K (3-4 yrs)',lvK:'K (4-6 yrs)',boy:'Boy',girl:'Girl',
 start:'Start',back:'Back',close:'Close',ok:'OK',cancel:'Cancel',save:'Save',done:'Done',
 hair:'Hair',hairc:'Color',skin:'Skin',shirt:'Outfit',hat:'Hat',pet:'Pet',none:'None',
 buy:'Buy',owned:'Owned',notEnough:'Not enough coins',bought:'Bought!',
 homePlay:'Play',homeStyle:'Style',coins:'Coins',parent:'Parents',
 mapTitle:'Flower Meadow',stage:'Stage',locked:'Locked',
 st1:'First Titan',st2:'Honey Garden',st3:'Rainbow Park',
 coop:'Co-op',coopTitle:'Play with a Parent',coopHow:'Ask Mom or Dad to open Mathack on their phone, tap 👨‍👩 Parents on the title screen, and enter this code:',coopWait:'Waiting for a parent to join',coopSim:'🧪 Simulate join',coopOn:'is playing along!',coopEnd:'End Co-op',coopNone:'No parent account yet. Hold the ⚙️ button for 1.5 seconds to add one.',coopProto:'Both phones need internet.',coopJoined:'joined!',wTitle:'Flower Meadow',stagesLeft:'Keep adventuring!',close:'Close', jnTitle:'Join Co-op as a Parent',jnNone:'Create a parent account first, then you can join your child’s game.',jnMake:'Create parent account',jnWho:'Who is joining?',jnGate:'Answer this (adults only):',jnCode:'Code from your child’s phone',jnGo:'Join',jnConn:'Connecting…',jnNocode:'Code not found. Check the code again.',jnNet:'Could not connect. Check the internet on both phones.',jnBusy:'A parent has already joined.',jnTimeout:'Timed out. Make sure the code is right and the child’s phone is on the Co-op screen.',jnClosed:'Connection lost.',jnWrong:'Not quite right.',jnLeave:'Leave',coopErrNet:'Could not reach the server. Check your internet.',coopRetry:'Try again',pcWalk:'is walking',pcHome:'is at home',pcMap:'is choosing a stage',pcDuel:'is fighting',pcResult:'finished the stage',pcTitle:'is at the title screen',pcWait:'Waiting…',pkHeal:'Heart +1',pkPower:'Super hit',pkShield:'Shield',pkGift:'Gift',pcNote:'You help with bonuses, not by answering. Bonuses are limited per stage.',pcHint:'Heart, hit and shield bonuses only work while your child is in a fight.',parentBtn:'👨‍👩 Parents', jump:'Jump',walk:'Walk',stopW:'Stop',tapWalk:'Tap Walk to move!',tapJump:'Tap Jump to grab coins!',winMon:'Full! New friend!',pause:'Pause',resume:'Resume',quit:'Back to Map',paused:'Paused',
 pbub:['Hi, friend! 👋','I love playing with you!','That apple was so yummy 🍎','Let’s go on an adventure!','You’re great at counting!','Hehe, that tickles!','I like you so much 💛','What shall we play today?','You’re so smart!','Count with me: 1, 2, 3!','I’m full and happy 😊','You’re my best friend!'],hit:'Yum!',miss:'Missed!',faint:'Oops, you fainted! Get up again!',great:'Great!',
 stageClear:'Stage Clear!',reward:'Rewards',stars:'Stars',again:'Play Again',toMap:'To Map',next:'Next',
 petGift:'A new pet for you!',monAppear:'A hungry monster!',monDown:'The monster ran away!',pickHair:'Hairstyle',titanDown:'The Titan is your friend!',defeated:'is your friend now!',
 delTitle:'Delete character?',delBody:'All progress of this character will be lost.',delete:'Delete',
 rotate:'Please rotate your phone to landscape',
 pTitle:'Parent Menu',pHold:'Hold the gear icon for 1.5 seconds',pAccounts:'Parent accounts',pAdd:'Create parent account',pEmpty:'No parent accounts yet.',
 pSoon:'Co-op with parents is coming soon. A parent will join from their own phone to help the child.',
 gTitle:'Parent Check',gBody:'Answer this to create a parent account. This question is for adults.',gName:'Nickname (e.g. Mom)',gAns:'Answer',gCheck:'Check',gWrong:'Not quite, try again.',gWait:'Too many wrong answers. Try again in {n}s.',gMax:'Maximum 2 parent accounts.',gOk:'Parent account created!',gNeedName:'Please enter a nickname first.',
 soon:'Coming soon',sound:'Sound',lang:'Language',loading:'Loading questions...',
 tipJump:'Press Jump to grab coins!',tipTitan:'A hungry Titan! Answer to throw apples!',
 heartsLeft:'Hearts',titanHp:'Titan power',
 hatNames:{1:'Ribbon',2:'Blue Cap',3:'Chef Hat',4:'Flower Crown',5:'Cat Ears',6:'Bear Ears',8:'Aquarium Helmet',10:'Straw Hat',14:'Duck Hat',15:'Party Hat',16:'Crown',17:'Helmet',18:'Mushroom Hat',19:'Dragon Hat',20:'Rainbow Hat'},
 hsNames:['Short','Bob','Long','Ponytail','Twin Tails','Spiky','Buzz','Bun','Mohawk','Neat','Shaggy','Pixie'],
 outNames:['Red Tee','Blue Tee','Green Tee','Purple Hoodie','Yellow Star','Sailor Stripes','Denim Overalls','Star Pajamas','Explorer Vest','Rainbow Tee'],
 petNames:['','Horse','Lamb','Bear','Rainbow Slime','Kitten','Robot','Squirrel','Deer','Fox'],
 titanNames:{sprout:'Hop Sprout',jelly:'Green Jelly',bee:'Honey Bee',moth:'Lunar Moth',shroom:'Cheeky Shroom',bunny:'Mochi Bunny',tunas:'Sprout Titan',tulip:'Tulip Titan',matahari:'Sunflower Titan',lebah:'Bee Titan',kupu:'Butterfly Titan',madu:'Honey Titan',jamur:'Mushroom Titan',siput:'Snail Titan',raja:'Flower King'}
}};
let LANG='id';
const t=k=>{const v=TX[LANG][k];return v===undefined?(TX.id[k]===undefined?k:TX.id[k]):v;};

/* ---------- catalogs ---------- */
const OUTFITS=[
 {c:'#e0603c',pat:'plain',pants:'#46507a',price:0},{c:'#4f7de0',pat:'plain',pants:'#3a3f5c',price:0},
 {c:'#3fb36b',pat:'plain',pants:'#5a4630',price:0},{c:'#9a5de0',pat:'hood',c2:'#7a3dc0',pants:'#3a3560',price:0},
 {c:'#f2c230',pat:'star',c2:'#ffffff',pants:'#4a4f66',price:25},{c:'#ffffff',pat:'stripe',c2:'#3a6fd0',pants:'#2f3a66',price:25},
 {c:'#ffd84a',pat:'overall',c2:'#3a6fd0',pants:'#3a6fd0',price:40},{c:'#2b2a7a',pat:'star',c2:'#ffd84a',pants:'#2b2a7a',price:40},
 {c:'#c9a96a',pat:'vest',c2:'#7a5a2a',pants:'#6a5a3a',price:60},{c:'#ffffff',pat:'rainbow',pants:'#46507a',price:80}];
const HATLIST=[0,1,2,3,4,5,6,8,10,14,15,16,17,18,19,20];
const HAT_PRICE={0:0,1:0,2:0,3:20,4:30,5:30,6:30,8:50,10:20,14:40,15:40,16:80,17:40,18:50,19:70,20:80};
const PET_ICON=['','🐴','🐑','🐻','🌈','🐱','🤖','🐿️','🦌','🦊'];
const PET_PRICE=[0,120,120,150,100,0,180,120,150,150];   // kitten (5) = reward of the first boss
const HSG=[[0,6,5,8,9,10],[1,2,3,4,7,11]];const HAIR_STYLES=12, HAIR_COLORS=5, SKINS=5;
const SKIN_NAMES=null;

/* ---------- world 1 ---------- */
const TITANS={
 tunas:{k:'sprout',c:'#7ed957',b:'#f6f0b0',s:1.7},tulip:{k:'tulip',c:'#ff8fb0',b:'#fff0f4',s:1.7},
 matahari:{k:'sunflower',c:'#a9702f',b:'#e0b26a',s:2.1,boss:1},
 lebah:{k:'bee',c:'#ffd84a',b:'#fff3b0',s:1.7},kupu:{k:'butterfly',c:'#7ab8ff',b:'#e8f2ff',s:1.7},
 madu:{k:'honey',c:'#f0a030',b:'#ffe08a',s:2.1,boss:1},
 jamur:{k:'mushroom',c:'#f2e4d0',b:'#ffffff',s:1.7},siput:{k:'snail',c:'#b8d86a',b:'#f4ffd0',s:1.7},
 raja:{k:'rainbow',c:'#c49bff',b:'#fff0ff',s:2.1,boss:1}};
const STAGES=[
 {id:1,key:'st1',sky:'#6fb4e8',fog:'#cfe4ef',ground:'#62b24a',dirt:'#7d5430',len:100,
  titans:[{x:32,d:'sprout',m:1,q:4},{x:64,d:'jelly',m:1,q:4},{x:96,d:'matahari',q:7}],reward:{pet:5}},
 {id:2,key:'st2',sky:'#72bbea',fog:'#d6e9ef',ground:'#74b948',dirt:'#85592f',len:100,
  titans:[{x:32,d:'bee',m:1,q:4},{x:64,d:'moth',m:1,q:4},{x:96,d:'madu',q:7}]},
 {id:3,key:'st3',sky:'#e8a46a',fog:'#f2d9b8',ground:'#58a85a',dirt:'#704a2c',len:100,
  titans:[{x:32,d:'shroom',m:1,q:5},{x:64,d:'bunny',m:1,q:5},{x:96,d:'raja',q:8}]}];

/* ---------- audio (Web Audio only, no files) ---------- */
const AU={ctx:null,master:null,muted:false,bgmOn:false,timer:null,step:0,kind:'walk'};
function aCtx(){
  if(AU.ctx)return AU.ctx;
  try{const C=window.AudioContext||window.webkitAudioContext;AU.ctx=new C();AU.master=AU.ctx.createGain();AU.master.gain.value=AU.muted?0:1;AU.master.connect(AU.ctx.destination);}catch(e){AU.ctx=null;}
  return AU.ctx;
}
function aResume(){const c=aCtx();if(c&&c.state==='suspended')c.resume();}
function tone(f,t0,d,type,g,slide){
  const c=aCtx();if(!c)return;const o=c.createOscillator(),v=c.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t0+d);
  v.gain.setValueAtTime(0.0001,t0);v.gain.exponentialRampToValueAtTime(g||.12,t0+.015);v.gain.exponentialRampToValueAtTime(.0001,t0+d);
  o.connect(v);v.connect(AU.master);o.start(t0);o.stop(t0+d+.05);
}
function noise(t0,d,g,fc){
  const c=aCtx();if(!c)return;const n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),v=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=fc||900;
  v.gain.value=g||.2;s.connect(f);f.connect(v);v.connect(AU.master);s.start(t0);
}
const SFX={
 tap(){const c=aCtx();if(!c)return;tone(660,c.currentTime,.08,'triangle',.08);},
 jump(){const c=aCtx();if(!c)return;tone(320,c.currentTime,.18,'square',.07,720);},
 coin(){const c=aCtx();if(!c)return;const n=c.currentTime;tone(988,n,.08,'square',.06);tone(1318,n+.07,.16,'square',.06);},
 ok(){const c=aCtx();if(!c)return;const n=c.currentTime;[523,659,784,1047].forEach((f,i)=>tone(f,n+i*.07,.18,'triangle',.12));},
 bad(){const c=aCtx();if(!c)return;const n=c.currentTime;tone(300,n,.25,'sawtooth',.07,150);},
 throw(){const c=aCtx();if(!c)return;tone(500,c.currentTime,.25,'sine',.1,1200);},
 hit(){const c=aCtx();if(!c)return;const n=c.currentTime;noise(n,.25,.25,1200);tone(160,n,.2,'square',.1,70);},
 stomp(){const c=aCtx();if(!c)return;const n=c.currentTime;noise(n,.4,.35,420);tone(90,n,.35,'sine',.25,40);},
 win(){const c=aCtx();if(!c)return;const n=c.currentTime;[523,659,784,659,784,1047,1319].forEach((f,i)=>tone(f,n+i*.1,.28,'triangle',.13));},
 pop(){const c=aCtx();if(!c)return;tone(700,c.currentTime,.12,'sine',.1,1400);}
};
const NF=n=>440*Math.pow(2,(n-69)/12);
const SONGS={
 home:{bpm:92,drums:0,lead:.05,chords:[[48,55,64],[45,52,60],[41,48,57],[43,50,59]],bass:[36,33,29,31],
  mel:[[76,0,79,0,76,74,72,0],[72,0,76,0,74,72,69,0],[69,0,72,0,77,76,72,0],[74,0,71,0,74,76,79,0]]},
 walk:{bpm:120,drums:1,lead:.055,chords:[[48,55,64],[45,52,60],[41,48,57],[43,50,59]],bass:[36,33,29,31],
  mel:[[76,72,76,79,76,72,67,72],[76,72,76,81,76,72,69,72],[77,72,77,81,77,72,69,72],[79,74,79,83,79,74,71,74]]},
 duel:{bpm:132,drums:2,lead:.05,chords:[[45,52,60],[41,48,57],[48,55,64],[43,50,59]],bass:[33,29,36,31],
  mel:[[81,0,76,81,84,81,76,0],[77,0,72,77,81,77,72,0],[79,0,72,76,79,76,72,0],[79,0,74,79,83,79,74,71]]}
};
function bgmNote(f,t0,d,type,g){const c=aCtx();if(!c)return;const o=c.createOscillator(),v=c.createGain();o.type=type;o.frequency.value=f;v.gain.setValueAtTime(.0001,t0);v.gain.exponentialRampToValueAtTime(g,t0+.02);v.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(v);v.connect(AU.bgm);o.start(t0);o.stop(t0+d+.05);}
function bgmHat(t0,g){const c=aCtx();if(!c)return;const n=c.sampleRate*.04|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),f=c.createBiquadFilter(),v=c.createGain();s.buffer=b;f.type='highpass';f.frequency.value=6000;v.gain.value=g;s.connect(f);f.connect(v);v.connect(AU.bgm);s.start(t0);}
function bgmKick(t0,g){const c=aCtx();if(!c)return;const o=c.createOscillator(),v=c.createGain();o.frequency.setValueAtTime(140,t0);o.frequency.exponentialRampToValueAtTime(45,t0+.14);v.gain.setValueAtTime(g,t0);v.gain.exponentialRampToValueAtTime(.0001,t0+.2);o.connect(v);v.connect(AU.bgm);o.start(t0);o.stop(t0+.25);}
function bgmStep(S,step,t0){
  const spb=60/S.bpm/2,bar=(step>>3)&3,beat=step&7,ch=S.chords[bar];
  if(beat===0)ch.forEach(n=>bgmNote(NF(n),t0,spb*7.5,'sine',.028));
  if(beat%4===0)bgmNote(NF(S.bass[bar]),t0,spb*3.6,'triangle',.11);
  else if(S.drums&&beat%2===0)bgmNote(NF(S.bass[bar]+12),t0,spb*1.4,'triangle',.05);
  const m=S.mel[bar][beat];if(m){bgmNote(NF(m),t0,spb*1.7,'triangle',S.lead);bgmNote(NF(m+12),t0,spb*1.2,'sine',S.lead*.35);}
  if(S.drums){if(beat%4===0)bgmKick(t0,.16);if(beat%2===1)bgmHat(t0,S.drums===2?.05:.03);if(S.drums===2&&beat===4)bgmHat(t0,.07);}
}
function bgmStart(kind){
  AU.kind=kind||AU.kind;const c=aCtx();if(!c)return;
  if(!AU.bgm){AU.bgm=c.createGain();AU.bgm.gain.value=.9;AU.bgm.connect(AU.master);}
  if(AU.bgmOn)return;AU.bgmOn=true;AU.step=0;AU.next=c.currentTime+.1;
  clearInterval(AU.timer);
  AU.timer=setInterval(()=>{
    const c2=aCtx();if(!c2||!AU.bgmOn)return;
    const S=SONGS[AU.kind]||SONGS.walk,spb=60/S.bpm/2;
    if(AU.next<c2.currentTime-.5)AU.next=c2.currentTime+.05;
    while(AU.next<c2.currentTime+.25){if(!AU.muted)bgmStep(S,AU.step,AU.next);AU.step=(AU.step+1)&31;AU.next+=spb;}
  },60);
}
function bgmStop(){AU.bgmOn=false;clearInterval(AU.timer);}
document.addEventListener('visibilitychange',()=>{const c=AU.ctx;if(!c)return;if(document.hidden)c.suspend&&c.suspend();else c.resume&&c.resume();});
function setMuted(v){AU.muted=v;if(AU.master)AU.master.gain.value=v?0:1;const b=$('#b-mute');if(b)b.textContent=v?'🔇':'🔊';DB.muted=v;saveDB();}

/* ---------- save (localStorage, in-memory fallback) ---------- */
const KEY='mathack.v1';
let DB={v:1,lang:null,muted:false,last:-1,slots:[null,null,null],parents:[]};
let storageOK=true;try{localStorage.setItem(KEY+'.p','1');localStorage.removeItem(KEY+'.p');}catch(e){storageOK=false;}
function loadDB(){try{const r=localStorage.getItem(KEY);if(r){const j=JSON.parse(r);if(j&&Array.isArray(j.slots)){DB=Object.assign(DB,j);DB.slots=[0,1,2].map(i=>sanSlot(j.slots[i]));if(!Array.isArray(DB.parents))DB.parents=[];}}}catch(e){}}
function saveDB(){try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
function sanSlot(s){
  if(!s||typeof s!=='object')return null;
  const l=s.look||{};
  return {name:String(s.name||'?').slice(0,16),lvl:s.lvl==='prak'?'prak':'k',
    look:{g:l.g===1?1:0,skin:clamp(l.skin|0,0,SKINS-1),hair:clamp(l.hair|0,0,HAIR_COLORS-1),hs:clamp(l.hs|0,0,HAIR_STYLES-1),outfit:clamp(l.outfit|0,0,OUTFITS.length-1),hat:HATLIST.includes(l.hat|0)?(l.hat|0):0,pet:clamp(l.pet|0,0,9)},
    coins:Math.max(0,s.coins|0),
    own:{outfit:Array.isArray(s.own&&s.own.outfit)?s.own.outfit:OUTFITS.map((o,i)=>o.price===0?i:-1).filter(i=>i>=0),
         hat:Array.isArray(s.own&&s.own.hat)?s.own.hat:HATLIST.filter(h=>HAT_PRICE[h]===0),
         pet:Array.isArray(s.own&&s.own.pet)?s.own.pet:[0]},
    prog:{stars:Object.assign({},s.prog&&s.prog.stars),done:Array.isArray(s.prog&&s.prog.done)?s.prog.done:[],friends:Array.isArray(s.prog&&s.prog.friends)?s.prog.friends.filter(x=>typeof x==='string').slice(0,40):[]},
    miss:Object.assign({},s.miss),plays:s.plays|0};
}
function newSlot(name,lvl,look){
  return sanSlot({name,lvl,look,coins:40});
}
