/* =====================================================================
   LE SAISISSAGE (saisissage.js) — poste du nouveau docker. Sur le pont
   garage du ferry, on saisit chaque remorque : on tire les chaînes de
   ses points d'attache vers les anneaux du pont (bien croisées, vers 45°),
   puis on serre chaque chaîne au fusil (gros plan, levier à pomper sans
   dépasser la zone verte) et on visse le tendeur. Chaque remorque saisie
   rend du temps ; le jeu accélère. Indépendant : n'écrit que dans #sai.
   ===================================================================== */
(()=>{
const LW=100;                      /* largeur du pont en unités ; la hauteur suit l'écran */
const SOCIETES=[['GEFCO','#2a6a9a'],['STEF','#2e7d4f'],['MAERSK','#3a8ad0'],['DHL','#e8b830'],['CORSICA LINEA','#c0392b'],['GEODIS','#5a2ab0'],['NORBERT','#e8e4d8'],['TRANSPORTS ROSSI','#8a5a32'],['SNCM FRET','#16a085']];
let RAC=null,CV=null,G=null,RAF=0,DPR=1,VUE=null,J=null;
const hasard=Math.random;
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const tn=(hex,d)=>{const v=parseInt(hex.slice(1),16);const f=k=>Math.max(0,Math.min(255,((v>>k)&255)+d));return 'rgb('+f(16)+','+f(8)+','+f(0)+')';};
function vib(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(x){}}

/* --- les sons --- */
const SON=(()=>{let ac=null,on=true;try{on=localStorage.getItem('sai_son')!=='0';}catch(x){}
 const ctx=()=>{if(!on)return null;try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();}catch(x){return null;}return ac;};
 const note=(f,d,type,vol,glis)=>{const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(glis)o.frequency.exponentialRampToValueAtTime(glis,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.15,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);};
 const bruit=(d,vol,fc,type)=>{const a=ctx();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),q=b.getChannelData(0);for(let i=0;i<n;i++)q[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type=type||'bandpass';f.frequency.value=fc||2000;g.gain.value=vol||.2;s.connect(f);f.connect(g);g.connect(a.destination);s.start();};
 return {get on(){return on;},basculer(){on=!on;try{localStorage.setItem('sai_son',on?'1':'0');}catch(x){}if(on)ctx();return on;},
  maillon(){bruit(.05,.12,3200);note(1800+Math.random()*400,.04,'triangle',.03);},
  accroche(){bruit(.08,.22,1600);note(900,.07,'square',.04,600);},
  cliquet(k){bruit(.025,.1+k*.1,2600+k*1200);},
  bien(q){const f=q>1?[784,988,1175]:[659,784];f.forEach((x,i)=>setTimeout(()=>note(x,.14,'sine',.13),i*70));},
  casse(){bruit(.3,.35,900,'lowpass');note(220,.3,'sawtooth',.08,80);},
  mou(){note(260,.12,'triangle',.08,200);},
  vis(){bruit(.02,.08,4200);},
  verrou(){note(1400,.05,'square',.06);bruit(.06,.2,1800);},
  sirene(){note(196,1.1,'sawtooth',.08,190);note(147,1.1,'sine',.15,145);},
  camion(){bruit(.6,.12,200,'lowpass');},
  fin(){note(392,.18,'triangle',.12);setTimeout(()=>note(523,.18,'triangle',.12),160);setTimeout(()=>note(659,.4,'triangle',.12),320);}};})();

/* --- la partie --- */
function nouvelle(){J={t:90,score:0,combo:0,remorques:0,chaines:0,parfaits:0,casses:0,fini:false,niveau:0,
  rem:null,anneaux:[],drag:null,gros:null,pops:[],parts:[],secousse:0,tuto:false,t0:performance.now(),arrive:0,sirene:false};
 anneaux();nouvelleRemorque();}
function HW(){return VUE?VUE.H:170;}
function anneaux(){const A=[];const H=HW();for(let y=10;y<H-6;y+=13)for(const x of [7,20,80,93])A.push({x,y:y+((x===20||x===80)?6.5:0)});J.anneaux=A.filter(a=>a.y<H-4);}
function nouvelleRemorque(){const H=HW(),s=SOCIETES[(hasard()*SOCIETES.length)|0],L=Math.min(H-34,78+((hasard()*10)|0)),y0=(H-L)/2+2;
 const n=J.niveau;const pts=[{x:39,y:y0+10,av:true},{x:61,y:y0+10,av:true},{x:39,y:y0+L-12,av:false},{x:61,y:y0+L-12,av:false}];
 if(n>=3){pts.push({x:39,y:y0+L*.45,av:true});pts.push({x:61,y:y0+L*.45,av:true});}
 J.rem={nom:s[0],c:s[1],x:39,w:22,y0,L,pts:pts.map(p=>Object.assign(p,{fait:false,anneau:null,q:0})),entree:1,sortie:0};
 J.arrive=1;SON.camion();}

/* --- géométrie d'une chaîne : angle par rapport à l'axe de la remorque, sens, longueur --- */
function juger(p,a){const dx=a.x-p.x,dy=a.y-p.y,d=Math.hypot(dx,dy);
 if(Math.sign(dx)!==(p.x<50?-1:1))return {ok:false,pourquoi:'Vers l’extérieur !'};
 if(p.av&&dy>-2)return {ok:false,pourquoi:'Vers l’avant !'};if(!p.av&&dy<2)return {ok:false,pourquoi:'Vers l’arrière !'};
 if(d<9)return {ok:false,pourquoi:'Trop court'};if(d>36)return {ok:false,pourquoi:'Trop long'};
 if(J.rem.pts.some(q=>q!==p&&q.anneau===a))return {ok:false,pourquoi:'Anneau déjà pris'};
 const ang=Math.atan2(Math.abs(dx),Math.abs(dy))*180/Math.PI;const q=Math.max(0,100-Math.abs(ang-45)*3.2);return {ok:true,ang,q};}

/* --- le gros plan du fusil --- */
function ouvrirGros(p){const n=J.niveau;const w=Math.max(.07,.16-n*.012),z=.5+hasard()*(.36-w);
 J.gros={p,T:0,lev:0,zone:[z,z+w],etape:'fusil',vis:0,visA:null,ap:0,msg:null,coups:0,anim:0,rupture:0};SON.accroche();vib(10);}
function coupDeFusil(){const G2=J.gros;if(!G2||G2.etape!=='fusil')return;const k=G2.lev;if(k<.08){G2.lev=0;return;}
 G2.coups++;G2.T=Math.min(1.2,G2.T+k*.42*(1-G2.T*.55));G2.lev=0;SON.cliquet(Math.min(1,G2.T));vib(8);
 const [a,b]=G2.zone;
 if(G2.T>b){G2.etape='casse';G2.rupture=1;J.casses++;J.combo=0;SON.casse();vib([40,30,60]);J.secousse=.35;G2.msg={t:'CASSÉE !',c:'#ff6a5a'};
  setTimeout(()=>{if(J&&J.gros===G2){G2.T=0;G2.etape='fusil';G2.msg={t:'Nouvelle chaîne : doucement…',c:'#f5d27a'};G2.rupture=0;}},900);return;}
 if(G2.T>=a){const c=(a+b)/2,qual=1-Math.abs(G2.T-c)/((b-a)/2);G2.qual=qual>.45?2:1;G2.etape='vis';G2.msg={t:G2.qual>1?'PARFAIT !':'BIEN',c:G2.qual>1?'#7ee08a':'#f5d27a'};SON.bien(G2.qual);vib(15);return;}
 SON.mou();G2.msg={t:'Encore !',c:'#c8d4e4'};}
function finGros(){const G2=J.gros,p=G2.p;p.fait=true;p.qt=G2.qual;J.chaines++;
 if(G2.qual>1){J.parfaits++;J.combo++;}else J.combo=0;
 const gain=Math.round((p.q*1.2+(G2.qual>1?150:80)+(G2.coups===1?40:0))*Math.min(4,1+J.combo*.5));J.score+=gain;
 J.pops.push({x:p.anneau.x,y:p.anneau.y,t:0,txt:'+'+gain+(J.combo>1?'  ×'+Math.min(4,1+J.combo*.5).toFixed(1).replace('.0',''):''),c:G2.qual>1?'#7ee08a':'#fff'});
 J.gros=null;SON.verrou();vib(12);
 if(J.rem.pts.every(q=>q.fait)){J.remorques++;J.score+=200;J.t=Math.min(99,J.t+Math.max(7,13-J.niveau));J.niveau++;
  J.pops.push({x:50,y:J.rem.y0+J.rem.L/2,t:0,txt:'SAISIE ! +200  ⏱+'+Math.max(7,13-J.niveau+1)+'s',c:'#f5d27a',gros:true});
  for(let i=0;i<26;i++){const an=hasard()*7,v=20+hasard()*40;J.parts.push({x:50,y:J.rem.y0+J.rem.L/2,vx:Math.cos(an)*v,vy:Math.sin(an)*v,t:0,c:i%2?'#f5d27a':'#fff',s:.8+hasard()});}
  J.rem.sortie=.001;setTimeout(()=>{if(J&&!J.fini)nouvelleRemorque();},900);}}

/* --- le dessin du pont --- */
let FOND=null;
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function fond(){const c=document.createElement('canvas');c.width=CV.width;c.height=CV.height;const g=c.getContext('2d');const V=VUE,H=V.H;
 g.setTransform(V.s,0,0,V.s,V.ox,0);const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 /* la tôle verte du pont garage, ses rayures antidérapantes */
 R(-20,0,LW+40,H,'#4f7a5f');for(let y=0;y<H;y+=3.4)for(let x=-20+((y/3.4|0)%2)*2;x<LW+20;x+=4){R(x,y,1.6,.5,'rgba(0,0,0,.07)');}
 for(let i=0;i<260;i++)R(-20+hA(i,1,8)*(LW+40),hA(i,2,8)*H,1.2+hA(i,3,8)*2,.4,'rgba(255,255,255,.05)');
 for(let i=0;i<30;i++){g.fillStyle='rgba(30,40,30,.12)';g.beginPath();g.ellipse(-20+hA(i,4,8)*(LW+40),hA(i,5,8)*H,2+hA(i,6,8)*5,1+hA(i,7,8)*2,0,0,7);g.fill();}
 /* les voies jaunes */
 for(const x of [1,29,71,99])for(let y=0;y<H;y+=7)R(x-.5,y,1,4.4,'#e8c040');
 /* les bords : la coque, les lisses */
 R(-20,0,19,H,'#d8dce2');R(-1.4,0,1.4,H,'#9aa0a6');R(LW+1,0,19,H,'#d8dce2');R(LW,0,1.4,H,'#9aa0a6');
 for(let y=4;y<H;y+=12){R(-12,y,8,5,'#2a5a80');R(LW+4,y,8,5,'#2a5a80');R(-11,y+.6,3,1.2,'rgba(255,255,255,.4)');R(LW+5,y+.6,3,1.2,'rgba(255,255,255,.4)');}
 /* le marquage peint : numéro de voie, flèches de sens */
 g.save();g.fillStyle='rgba(255,236,170,.32)';g.font='900 7px ui-monospace,monospace';g.textAlign='center';g.fillText('VOIE 3',50,H-8);
 for(const y of [H*.18,H*.82]){g.beginPath();g.moveTo(50,y-6);g.lineTo(54,y);g.lineTo(51.4,y);g.lineTo(51.4,y+5);g.lineTo(48.6,y+5);g.lineTo(48.6,y);g.lineTo(46,y);g.closePath();g.fill();}g.restore();
 /* les lampes du plafond : des flaques de lumière chaude */
 for(let y=H*.12;y<H;y+=H*.28)for(const x of [15,85]){const l=g.createRadialGradient(x,y,0,x,y,34);l.addColorStop(0,'rgba(255,236,190,.20)');l.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=l;g.fillRect(x-34,y-34,68,68);}
 const l2=g.createRadialGradient(50,H/2,10,50,H/2,H*.75);l2.addColorStop(0,'rgba(255,240,200,.10)');l2.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=l2;g.fillRect(-20,0,LW+40,H);
 /* les anneaux (œils de saisissage) */
 for(const a of J.anneaux){R(a.x-2.4,a.y-2.4,4.8,4.8,'#3f6650');g.strokeStyle='#2a2e34';g.lineWidth=1.3;g.beginPath();g.arc(a.x,a.y,1.7,0,7);g.stroke();g.strokeStyle='#c8ccd2';g.lineWidth=.7;g.stroke();R(a.x-.4,a.y-2.6,.8,.9,'#8a9098');}
 FOND=c;}
function chaine(g,x1,y1,x2,y2,c,tendu){const d=Math.hypot(x2-x1,y2-y1),n=Math.max(2,Math.floor(d/1.9)),a=Math.atan2(y2-y1,x2-x1);
 const mou=tendu?0:Math.min(2.5,d*.06);
 for(let i=0;i<=n;i++){const t=i/n,sag=Math.sin(t*Math.PI)*mou,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t+sag;g.save();g.translate(x,y);g.rotate(a+(i%2?Math.PI/2:0));
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.beginPath();g.ellipse(.3,.4,1.25,.72,0,0,7);g.stroke();
  g.strokeStyle='#3a3e44';g.lineWidth=1.15;g.beginPath();g.ellipse(0,0,1.25,.72,0,0,7);g.stroke();g.strokeStyle=c||'#c8ccd2';g.lineWidth=.55;g.stroke();g.restore();}}
function fusilPetit(g,x,y,a){g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-1.1,-2.6,2.6,6);g.fillStyle='#c8323a';g.fillRect(-1.3,-3,2.6,6);g.fillStyle='#e85a5a';g.fillRect(-1.3,-3,2.6,.7);g.fillStyle='#e8b830';g.fillRect(-.5,-2.4,1,5);g.restore();}
function remorque(g,r){const x=r.x,y=r.y0+(r.entree>0?r.entree*(HW()):0)-(r.sortie>0?r.sortie*HW()*1.2:0),w=r.w,L=r.L,c=r.c;
 g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+1.6,y+2.4,w,L);
 g.fillStyle=tn(c,-38);g.fillRect(x,y,w,L);g.fillStyle=c;g.fillRect(x+.6,y+.6,w-1.2,L-1.2);g.fillStyle=tn(c,28);g.fillRect(x+.6,y+.6,w-1.2,1);
 g.fillStyle=tn(c,-12);for(let k=y+5;k<y+L-3;k+=4.2)g.fillRect(x+1,k,w-2,.45);
 g.fillStyle=tn(c,-24);g.fillRect(x+.6,y+.6,1,L-1.2);g.fillRect(x+w-1.6,y+.6,1,L-1.2);
 g.save();g.translate(x+w/2,y+L/2);g.rotate(-Math.PI/2);g.fillStyle=(c==='#e8e4d8'||c==='#e8b830')?'rgba(40,40,40,.75)':'rgba(255,255,255,.85)';g.font='900 '+(r.nom.length>9?5:7)+'px ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(r.nom,0,0);g.restore();
 /* l'arrière : feux, butoir, essieux */
 g.fillStyle='#2a2e34';g.fillRect(x+1.5,y+L-3,w-3,2.4);g.fillStyle='#c8323a';g.fillRect(x+1.6,y+L-2.6,2,1);g.fillRect(x+w-3.6,y+L-2.6,2,1);
 g.fillStyle='#1a1a1e';for(const k of [y+L-14,y+L-9.5])for(const sx of [x-1,x+w-.6])g.fillRect(sx,k,1.6,3.6);
 /* le tréteau sous le nez */
 g.fillStyle='#e8b830';g.fillRect(x+w/2-5,y+3,10,2.2);g.fillStyle='#ffd860';g.fillRect(x+w/2-5,y+3,10,.5);g.fillStyle='#5a6068';g.fillRect(x+w/2-.6,y+1.6,1.2,5);
 return y;}
function tracteur(g,x,y){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+1.6,y+2.4,18,16);g.fillStyle='#e8e4d8';g.fillRect(x,y,18,16);g.fillStyle='#c8323a';g.fillRect(x,y,18,2);g.fillStyle='#2a3a4a';g.fillRect(x+2,y+3,14,4);g.fillStyle='#6a90b0';g.fillRect(x+3,y+3.6,12,1);g.fillStyle='#1a1a1e';g.fillRect(x-1,y+4,1.4,4);g.fillRect(x+17.6,y+4,1.4,4);g.fillRect(x-1,y+11,1.4,4);g.fillRect(x+17.6,y+11,1.4,4);}

function dessiner(){const g=G,V=VUE;if(!FOND||FOND.width!==CV.width||FOND.height!==CV.height)fond();
 g.setTransform(1,0,0,1,0,0);let sx=0,sy=0;if(J.secousse>0){sx=(hasard()-.5)*J.secousse*12*DPR;sy=(hasard()-.5)*J.secousse*12*DPR;}
 g.drawImage(FOND,sx,sy);g.setTransform(V.s,0,0,V.s,V.ox+sx,sy);
 const r=J.rem;if(r){const ry=remorque(g,r);const dy=ry-r.y0;
  if(r.entree>0||r.sortie>0)tracteur(g,r.x+r.w/2-9,ry-17);
  /* les chaînes posées et la chaîne qu'on tire */
  for(const p of r.pts){const px=p.x,py=p.y+dy;
   if(p.anneau){chaine(g,px,py,p.anneau.x,p.anneau.y,p.fait?'#d8dce2':'#c8ccd2',p.fait);if(p.fait){const mx=(px+p.anneau.x)/2,my=(py+p.anneau.y)/2;fusilPetit(g,mx,my,Math.atan2(p.anneau.y-py,p.anneau.x-px)+Math.PI/2);}}
   if(!p.anneau&&!(J.drag&&J.drag.p===p)&&r.entree<=0&&r.sortie<=0){const k=.5+.5*Math.sin(performance.now()/200);g.fillStyle='rgba(255,216,96,'+(.25+k*.35)+')';g.beginPath();g.arc(px,py,2.6+k*1.2,0,7);g.fill();}
   g.fillStyle=p.fait?'#7ee08a':'#ffd860';g.fillRect(px-1.3,py-1.3,2.6,2.6);g.fillStyle='#2a2e34';g.fillRect(px-.5,py-.5,1,1);}
  if(J.drag){const d=J.drag,p=d.p,px=p.x,py=p.y+dy;const cible=d.cible;
   if(cible){const ok=d.jug.ok;g.strokeStyle=ok?'rgba(126,224,138,.95)':'rgba(255,106,90,.95)';g.lineWidth=.8;g.beginPath();g.arc(cible.x,cible.y,3.6,0,7);g.stroke();}
   chaine(g,px,py,cible?cible.x:d.x,cible?cible.y:d.y,'#ffe8a0',false);
   /* le guide d'angle */
   if(cible&&d.jug.ok){const a=d.jug.ang;g.fillStyle='rgba(0,0,0,.5)';rr(g,cible.x-7,cible.y-11,14,6,2);g.fill();g.fillStyle=Math.abs(a-45)<8?'#7ee08a':Math.abs(a-45)<18?'#f5d27a':'#ffb08a';g.font='900 4px system-ui,sans-serif';g.textAlign='center';g.fillText(Math.round(a)+'°',cible.x,cible.y-6.6);}
   else if(cible){g.fillStyle='rgba(0,0,0,.55)';rr(g,cible.x-15,cible.y-11,30,6,2);g.fill();g.fillStyle='#ff9a8a';g.font='800 3.4px system-ui,sans-serif';g.textAlign='center';g.fillText(d.jug.pourquoi,cible.x,cible.y-6.8);}}}
 /* éclats et scores volants */
 for(const p of J.parts){g.globalAlpha=Math.max(0,1-p.t/.7);g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);}g.globalAlpha=1;
 for(const p of J.pops){const k=p.t/1.2;g.globalAlpha=Math.max(0,1-k*k);g.font='900 '+(p.gros?7:5)+'px system-ui,sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.55)';g.fillText(p.txt,p.x+.4,p.y-k*10+.4);g.fillStyle=p.c;g.fillText(p.txt,p.x,p.y-k*10);}g.globalAlpha=1;
 if(J.gros)grosPlan(g);
 /* la barre du haut */
 RAC.querySelector('.sc').textContent=J.score.toLocaleString('fr-FR');
 const tt=RAC.querySelector('.tm');tt.textContent='⏱ '+Math.max(0,Math.ceil(J.t))+' s';tt.classList.toggle('urg',J.t<10);
 RAC.querySelector('.rm').textContent='🚛 '+J.remorques;
 RAC.querySelector('.cb').textContent=J.combo>0?'🔥 ×'+Math.min(4,1+J.combo*.5).toFixed(1).replace('.0',''):'🔥 ×1';}

/* --- le gros plan : le fusil, la jauge, le tendeur --- */
function grosPlan(g){const G2=J.gros,W2=CV.width,H2=CV.height,k=Math.min(1,G2.anim);
 g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(8,14,20,'+(.62*k)+')';g.fillRect(0,0,W2,H2);
 const pw=Math.min(W2*.92,H2*.66),ph=pw*1.08,px=(W2-pw)/2,py=(H2-ph)/2+(1-k)*H2*.3;const u=pw/100;
 g.save();g.translate(px,py);g.scale(u,u);
 /* le panneau */
 g.fillStyle='rgba(0,0,0,.4)';rr(g,1,2,100,108,7);g.fill();g.fillStyle='#2f4a3a';rr(g,0,0,100,108,7);g.fill();
 g.save();rr(g,0,0,100,108,7);g.clip();
 for(let y=0;y<108;y+=3)for(let x=((y/3|0)%2)*2;x<100;x+=4){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x,y,1.6,.5);}
 /* le flanc de la remorque, en haut ; la roue à gauche */
 const c=J.rem.c;g.fillStyle=c;g.fillRect(0,0,100,24);g.fillStyle=tn(c,-14);for(let x=0;x<100;x+=6)g.fillRect(x,0,.6,24);g.fillStyle=tn(c,26);g.fillRect(0,0,100,1);g.fillStyle='#1a1a1e';g.fillRect(0,22,100,3);
 g.fillStyle=(c==='#e8e4d8'||c==='#e8b830')?'rgba(40,40,40,.7)':'rgba(255,255,255,.7)';g.font='900 8px ui-monospace,monospace';g.textAlign='right';g.font='900 '+(J.rem.nom.length>10?5.6:8)+'px ui-monospace,monospace';g.fillText(J.rem.nom,97,15);
 g.fillStyle='#1a1a1e';g.beginPath();g.arc(-2,26,12,0,7);g.fill();g.fillStyle='#5a6068';g.beginPath();g.arc(-2,26,5,0,7);g.fill();
 g.fillStyle='#8a9098';g.fillRect(16,22,10,6);g.fillStyle='#5a6068';g.fillRect(19,27,4,3);
 g.restore();
 /* la chaîne : point d'attache -> fusil -> anneau du pont */
 const ax=21,ay=31,rx=44,ry=98,ang=Math.atan2(ry-ay,rx-ax),fx=ax+(rx-ax)*.46,fy=ay+(ry-ay)*.46,ux=Math.cos(ang),uy=Math.sin(ang);
 const tend=G2.T,sh=G2.rupture?Math.sin(performance.now()/20)*1.5:0;
 chaine(g,ax+sh,ay,fx-ux*14+sh,fy-uy*14,'#c8ccd2',tend>.3);
 if(G2.etape!=='casse')chaine(g,fx+ux*14,fy+uy*14,rx,ry,'#c8ccd2',tend>.3);else{chaine(g,fx+ux*14,fy+uy*14,fx+ux*20+6,fy+uy*20,'#c8ccd2',false);chaine(g,rx,ry,rx-4,ry-10,'#c8ccd2',false);}
 g.fillStyle='#3f6650';g.fillRect(rx-5,ry-5,10,10);g.strokeStyle='#2a2e34';g.lineWidth=2;g.beginPath();g.arc(rx,ry,3,0,7);g.stroke();g.strokeStyle='#c8ccd2';g.lineWidth=1;g.stroke();
 /* le fusil, dans l'axe de la chaîne */
 g.save();g.translate(fx,fy);g.rotate(ang-Math.PI/2);
 g.fillStyle='rgba(0,0,0,.35)';rr(g,-5,-13,12,28,2.4);g.fill();g.fillStyle='#8a1a1a';rr(g,-6,-14,12,28,2.4);g.fill();g.fillStyle='#c8323a';rr(g,-5.2,-13.2,10.4,26.4,2);g.fill();g.fillStyle='#e85a5a';g.fillRect(-5,-13,10,1.4);
 g.fillStyle='#2a2e34';g.fillRect(-2.2,-17,4.4,4);g.fillRect(-2.2,13,4.4,4);for(let k=-10;k<11;k+=3.3)g.fillRect(-5.2,k,1.2,1.6);
 g.fillStyle='#e8e4d8';g.font='900 3px system-ui,sans-serif';g.textAlign='center';g.save();g.rotate(Math.PI/2);g.fillText('5 T',0,1);g.restore();
 g.restore();
 /* le levier : pivot sur le fusil, il part vers la droite ; on l'abaisse */
 const pvx=fx+ux*-6,pvy=fy+uy*-6,la=-1.05+G2.lev*1.55;
 g.save();g.translate(pvx,pvy);g.rotate(la);
 g.fillStyle='rgba(0,0,0,.3)';rr(g,0,-1,40,5,1.6);g.fill();g.fillStyle='#c89820';rr(g,-1,-2.4,40,5,1.8);g.fill();g.fillStyle='#e8b830';rr(g,-1,-2.4,40,3.6,1.8);g.fill();g.fillStyle='#ffd860';g.fillRect(1,-2.2,34,.9);
 g.fillStyle='#1a1a1e';rr(g,32,-3.6,11,7.4,2.4);g.fill();g.fillStyle='#3a3e44';rr(g,33,-3,9,2.2,1);g.fill();
 g.restore();g.fillStyle='#5a6068';g.beginPath();g.arc(pvx,pvy,2.6,0,7);g.fill();g.fillStyle='#8a9098';g.beginPath();g.arc(pvx,pvy,1.1,0,7);g.fill();
 /* la jauge de tension */
 const jx=86,jy=34,jh=58;g.fillStyle='#1b2330';rr(g,jx-7,jy-5,16,jh+14,3);g.fill();g.fillStyle='#2e3a4e';g.fillRect(jx-3,jy,8,jh);
 const [za,zb]=G2.zone;const Y=t=>jy+jh-Math.min(1.2,t)/1.2*jh;
 g.fillStyle='#e84a3a';g.fillRect(jx-3,jy,8,Y(zb)-jy);g.fillStyle='#4ac860';g.fillRect(jx-3,Y(zb),8,Y(za)-Y(zb));g.fillStyle='#7ee08a';g.fillRect(jx-3,Y((za+zb)/2)-((Y(za)-Y(zb))*.22),8,(Y(za)-Y(zb))*.44);
 g.fillStyle='rgba(90,150,200,.95)';g.fillRect(jx-3,Y(tend),8,jy+jh-Y(tend));
 if(G2.etape==='fusil'&&G2.lev>0){const nt=Math.min(1.2,tend+G2.lev*.42*(1-tend*.55));g.fillStyle='rgba(255,255,255,.4)';g.fillRect(jx-3,Y(nt),8,Y(tend)-Y(nt));g.fillStyle='#fff';g.fillRect(jx-5,Y(nt)-.4,12,.8);}
 g.fillStyle='#fff';g.fillRect(jx-5,Y(tend)-.6,12,1.2);
 g.fillStyle='#8ab0d8';g.font='800 3.2px system-ui,sans-serif';g.textAlign='center';g.fillText('TENSION',jx+1,jy+jh+6);
 /* le tendeur à visser */
 if(G2.etape==='vis'){const vx=64,vy=82;g.fillStyle='rgba(0,0,0,.55)';rr(g,vx-13,vy-13,26,28,4);g.fill();
  const tours=G2.vis/(Math.PI*2);g.strokeStyle='#2e3a4e';g.lineWidth=2.4;g.beginPath();g.arc(vx,vy,8,0,7);g.stroke();g.strokeStyle='#f5d27a';g.beginPath();g.arc(vx,vy,8,-Math.PI/2,-Math.PI/2+Math.min(1,tours/1.5)*Math.PI*2);g.stroke();
  g.save();g.translate(vx,vy);g.rotate(G2.vis);g.fillStyle='#8a9098';g.fillRect(-1.4,-5,2.8,10);g.fillStyle='#c8ccd2';g.fillRect(-1.4,-5,1,10);g.restore();
  g.fillStyle='#fff';g.font='800 3.4px system-ui,sans-serif';g.textAlign='center';g.fillText('TOURNE ↻',vx,vy+12.4);}
 /* le message */
 if(G2.msg){g.font='900 7px system-ui,sans-serif';g.textAlign='center';const mw=g.measureText(G2.msg.t).width+8;g.fillStyle='rgba(10,16,24,.7)';rr(g,62-mw/2,89,mw,10,5);g.fill();g.fillStyle=G2.msg.c;g.fillText(G2.msg.t,62,96.6);}
 /* l'aide du geste : le doigt sur la poignée qui descend */
 if(G2.etape==='fusil'&&G2.lev===0){const k2=(performance.now()/800)%1;const hx=pvx+Math.cos(-1.05)*38,hy=pvy+Math.sin(-1.05)*38;g.globalAlpha=1-k2;g.fillStyle='#fff';g.beginPath();g.arc(hx+k2*6,hy+k2*30,2.4,0,7);g.fill();g.globalAlpha=1;}
 g.fillStyle='#c8d4e4';g.font='700 3.4px system-ui,sans-serif';g.textAlign='center';
 g.fillText(G2.etape==='vis'?'Fais tourner ton doigt pour visser le tendeur':'Glisse vers le bas pour pomper · arrête-toi dans le vert',50,104.5);
 g.restore();G2.cadre={px,py,u};}

/* --- la boucle --- */
function boucle(t){if(!RAC)return;RAF=requestAnimationFrame(boucle);const dt=Math.min(1/30,(t-(boucle.t||t))/1000);boucle.t=t;if(!J)return;
 if(!J.fini&&!J.tuto){J.t-=dt;if(J.t<=0){J.t=0;finir();}}
 const r=J.rem;if(r){if(r.entree>0)r.entree=Math.max(0,r.entree-dt*1.6);if(r.sortie>0)r.sortie=Math.min(1,r.sortie+dt*1.3);}
 if(J.gros)J.gros.anim=Math.min(1,J.gros.anim+dt*5);
 J.secousse=Math.max(0,J.secousse-dt);
 for(const p of J.parts){p.t+=dt;p.vy+=40*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}J.parts=J.parts.filter(p=>p.t<.7);
 for(const p of J.pops)p.t+=dt;J.pops=J.pops.filter(p=>p.t<1.2);
 dessiner();}
function cadrer(){if(!CV)return;const r=CV.getBoundingClientRect();DPR=Math.min(2.5,window.devicePixelRatio||1);CV.width=Math.round(r.width*DPR);CV.height=Math.round(r.height*DPR);
 const s=CV.width/(LW+6);VUE={s,ox:3*s,H:CV.height/s};FOND=null;if(J){anneaux();}}

/* --- les gestes --- */
function monde(e){const t=e.touches?(e.touches[0]||e.changedTouches[0]):e;const r=CV.getBoundingClientRect();return {x:((t.clientX-r.left)*DPR-VUE.ox)/VUE.s,y:((t.clientY-r.top)*DPR)/VUE.s,sx:(t.clientX-r.left)*DPR,sy:(t.clientY-r.top)*DPR};}
function debut(e){e.preventDefault();if(!J||J.fini||J.tuto||!VUE)return;const m=monde(e);SON.on&&0;
 if(J.gros){const G2=J.gros;G2.d0={sy:m.sy,sx:m.sx,lev:G2.lev};if(G2.etape==='vis'){G2.visP=null;}return;}
 const r=J.rem;if(!r||r.entree>0||r.sortie>0)return;
 let best=null,bd=9;for(const p of r.pts){if(p.anneau)continue;const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<bd){bd=d;best=p;}}
 if(best){J.drag={p:best,x:m.x,y:m.y,cible:null,jug:null,dernier:0};SON.maillon();vib(5);}}
function bouge(e){e.preventDefault();if(!J||!VUE)return;const m=monde(e);
 if(J.gros){const G2=J.gros;if(!G2.d0||!G2.cadre)return;
  if(G2.etape==='fusil'){const dy=(m.sy-G2.d0.sy)/(G2.cadre.u*42);G2.lev=Math.max(0,Math.min(1,dy));if(Math.floor(G2.lev*6)!==G2.cran){G2.cran=Math.floor(G2.lev*6);SON.cliquet(.2);}}
  else if(G2.etape==='vis'){/* on tourne le doigt n'importe où : on compte le virage de la trajectoire */
   const P=G2.visP;if(!P){G2.visP={x:m.sx,y:m.sy,h:null};return;}const dx=m.sx-P.x,dy=m.sy-P.y;if(dx*dx+dy*dy<(6*DPR)**2)return;
   const h=Math.atan2(dy,dx);if(P.h!==null){let d=h-P.h;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;G2.vis+=Math.min(1.2,Math.abs(d));if(Math.floor(G2.vis*3)!==G2.cranV){G2.cranV=Math.floor(G2.vis*3);SON.vis();vib(3);}}
   G2.visP={x:m.sx,y:m.sy,h};if(G2.vis>=Math.PI*3){G2.etape='fini';finGros();}}
  return;}
 const d=J.drag;if(!d)return;d.x=m.x;d.y=m.y;
 const dist=Math.hypot(d.x-d.p.x,d.y-(d.p.y));if(Math.floor(dist/3)!==d.dernier){d.dernier=Math.floor(dist/3);SON.maillon();}
 let best=null,bd=7.5;for(const a of J.anneaux){const q=Math.hypot(a.x-m.x,a.y-m.y);if(q<bd){bd=q;best=a;}}
 if(best!==d.cible){d.cible=best;d.jug=best?juger(d.p,best):null;if(best)vib(4);}}
function fin(e){e.preventDefault();if(!J)return;
 if(J.gros){const G2=J.gros;if(G2.etape==='fusil'&&G2.d0)coupDeFusil();G2.d0=null;G2.visP=null;return;}
 const d=J.drag;J.drag=null;if(!d)return;
 if(d.cible&&d.jug&&d.jug.ok){d.p.anneau=d.cible;d.p.q=d.jug.q;ouvrirGros(d.p);}
 else if(d.cible&&d.jug){J.pops.push({x:d.cible.x,y:d.cible.y,t:0,txt:d.jug.pourquoi,c:'#ff9a8a'});vib(20);}}

/* --- la fin, la paie --- */
let VAC=null;
let VAC_MSG='Connecte-toi pour être payé.';
async function ouvrirVac(){VAC=null;try{const r=await appelRPC('saisie_debut',{});if(r&&r.vacation)VAC=r.vacation;else if(!r||r.erreur!=='connexion')VAC_MSG='La paie du saisissage arrive très bientôt.';}catch(x){VAC_MSG='La paie du saisissage arrive très bientôt.';}}
const eur=c=>(Math.round(c/100)).toLocaleString('fr-FR')+' €';
async function payer(d,sc){const el=d.querySelector('.paie');if(!VAC){el.innerHTML=VAC_MSG;return;}
 const v=VAC;VAC=null;let r=null;try{r=await appelRPC('saisie_fin',{p_vac:v,p_score:sc|0,p_remorques:J.remorques,p_chaines:J.chaines,p_parfaits:J.parfaits});}catch(x){}
 if(!r){el.innerHTML='Paie indisponible pour l’instant.';return;}
 if(r.xp>0){try{e.recolte=(e.recolte||0)+r.xp;if((e.score||0)<e.recolte)e.score=e.recolte;sauver();majHaut();}catch(x){}}
 const xpT=r.xp>0?'<i class="xp">+ '+r.xp+' XP</i>':'';
 if(r.erreur){el.innerHTML=xpT+(r.erreur==='plafond'?'Plafond du jour atteint : pas de paie.':r.erreur==='trop court'?'Vacation trop courte : pas de paie.':r.erreur==='grade'?'Ce poste demande le grade de nouveau docker (niveau 5).':'Pas de paie ('+r.erreur+').');return;}
 el.innerHTML='<span>PAIE DE LA VACATION</span><b>+ '+eur(r.verse)+'</b>'+xpT+(r.facteur<1?'<small>tarif réduit ('+Math.round(r.facteur*100)+' %) : déjà '+(r.faites-1)+' vacations aujourd’hui</small>':'');el.classList.add('ok');
 if(typeof r.euros==='number'){try{e.euros=r.euros;sauver();majHaut();}catch(x){}}}
function finir(){if(J.fini)return;J.fini=true;J.gros=null;J.drag=null;SON.sirene();vib(80);const sc=J.score;let rec=0;try{rec=+(localStorage.getItem('sai_record')||0);if(sc>rec)localStorage.setItem('sai_record',sc);}catch(x){}
 const et=sc>=9000?3:sc>=5000?2:sc>=2200?1:0;const d=document.createElement('div');d.className='fin';
 d.innerHTML='<div class="c"><small>LE FERRY APPAREILLE</small><div class="et">'+[0,1,2].map(i=>'<span class="'+(i<et?'on':'')+'">★</span>').join('')+'</div><h2>'+(et===3?'Saisisseur de légende !':et===2?'Du beau travail, collègue !':et===1?'Ça tient la route':'Faut s’entraîner !')+'</h2>'+
  '<div class="g"><div><b>'+J.remorques+'</b>remorques</div><div><b>'+J.parfaits+'/'+J.chaines+'</b>parfaites</div><div><b>'+J.casses+'</b>cassées</div></div>'+
  '<p class="scf">Score <b>'+sc.toLocaleString('fr-FR')+'</b>'+(sc>rec?' · nouveau record !':rec?' · record '+rec.toLocaleString('fr-FR'):'')+'</p><div class="paie">Calcul de la paie…</div><button class="b1">Nouvelle traversée</button><button class="b2">Retour au quai</button></div>';
 RAC.querySelector('.scene').appendChild(d);payer(d,sc);
 setTimeout(()=>{d.querySelectorAll('.et span.on').forEach((s,i)=>setTimeout(()=>{s.classList.add('pop');vib(10);},i*300));SON.fin();},400);
 d.querySelector('.b1').onclick=()=>{d.remove();nouvelle();majRec();ouvrirVac();};d.querySelector('.b2').onclick=fermer;}
function majRec(){let rec=0;try{rec=+(localStorage.getItem('sai_record')||0);}catch(x){}RAC.querySelector('.rc').textContent='🏆 '+rec.toLocaleString('fr-FR');}
function tuto(){let vu=false;try{vu=localStorage.getItem('sai_tuto')==='1';}catch(x){}if(vu)return;J.tuto=true;
 const d=document.createElement('div');d.className='tuto';
 d.innerHTML='<div class="c"><small>PREMIÈRE VACATION</small><h2>Le saisissage</h2>'+
  '<div class="et2"><span>⛓️</span><p><b>Tire une chaîne</b> d’un point jaune de la remorque jusqu’à un anneau du pont.</p></div>'+
  '<div class="et2"><span>📐</span><p>Vers l’<b>extérieur</b>, l’avant vers l’avant, l’arrière vers l’arrière. <b>45°</b>, c’est parfait.</p></div>'+
  '<div class="et2"><span>🔧</span><p><b>Abaisse le levier du fusil</b> par petits coups : arrête-toi dans le vert, sinon ça casse !</p></div>'+
  '<div class="et2"><span>🔩</span><p><b>Visse le tendeur</b> en tournant le doigt. Chaque remorque saisie rend du temps.</p></div><button class="b1">C’est parti</button></div>';
 RAC.querySelector('.scene').appendChild(d);d.querySelector('.b1').onclick=()=>{try{localStorage.setItem('sai_tuto','1');}catch(x){}d.remove();if(J)J.tuto=false;SON.accroche();};}
function fermer(){if(!RAC)return;cancelAnimationFrame(RAF);const r=RAC;RAC=null;J=null;window.ECRAN_COUVRANT=false;r.classList.remove('on');setTimeout(()=>r.remove(),300);removeEventListener('resize',cadrer);}

const CSS=`#sai{position:fixed;inset:0;z-index:2147482100;display:flex;flex-direction:column;background:#1b2330;font-family:'Baloo 2',system-ui,sans-serif;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .3s;touch-action:none}
#sai.on{opacity:1}#sai *{box-sizing:border-box}
#sai .bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 4px;color:#fff}
#sai .bar b{font:900 19px/1 'Baloo 2',system-ui,sans-serif}#sai .bar small{display:block;font:800 9.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#8ab0d8;margin-bottom:2px}
#sai .sp{flex:1}#sai .x{height:38px;padding:0 15px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font:800 14px 'Baloo 2',system-ui,sans-serif}
#sai .son{width:38px;height:38px;border-radius:19px;border:0;background:#2e3a4e;color:#fff;font-size:16px;padding:0}
#sai .pl{flex:none;display:flex;justify-content:center;gap:6px;padding:4px 10px 8px;color:#fff}
#sai .pl span{background:#2e3a4e;border-radius:14px;padding:4px 10px;font:800 14px 'Baloo 2',system-ui,sans-serif;white-space:nowrap;transition:background .2s}
#sai .pl .tm.urg{background:#a82a2a;animation:saiU .5s ease-in-out infinite}@keyframes saiU{50%{transform:scale(1.08)}}
#sai .scene{flex:1;min-height:0;position:relative}
#sai .scene>canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
#sai .bas{flex:none;position:static;background:#1b2330;box-shadow:none;border:0;border-radius:0;opacity:1;padding:8px 14px calc(10px + env(safe-area-inset-bottom));color:#c8d4e4;font:700 13px/1.25 'Baloo 2',system-ui,sans-serif;text-align:center}
#sai .fin,#sai .tuto{position:absolute;inset:0;background:rgba(10,16,24,.8);display:grid;place-items:center;padding:20px;z-index:3}
#sai .fin .c,#sai .tuto .c{width:min(340px,92vw);background:#f6f1e6;color:#2a2016;border-radius:22px;padding:16px;text-align:center;box-shadow:0 6px 0 #b8a890}
#sai small{font:800 11px 'Baloo 2',system-ui,sans-serif;letter-spacing:2px;color:#8a7a5a}
#sai .fin .et{font-size:38px;line-height:1;margin:4px 0;color:#d8cfbe}#sai .fin .et span{display:inline-block;transition:transform .3s}#sai .fin .et span.pop{color:#f2b030;transform:scale(1.25)}
#sai h2{margin:2px 0 8px;font:900 23px/1.1 'Baloo 2',system-ui,sans-serif}
#sai .fin .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 8px}#sai .fin .g div{background:#fff;border-radius:14px;padding:7px 4px;box-shadow:0 3px 0 #ddd3c0;font:700 11.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#sai .fin .g b{display:block;font:900 18px/1.15 'Baloo 2',system-ui,sans-serif;color:#2a2016}
#sai .fin .scf{margin:4px 0;font:800 16px 'Baloo 2',system-ui,sans-serif}
#sai .fin .paie{margin:6px 0 2px;background:#fff;border-radius:14px;padding:8px;box-shadow:0 3px 0 #ddd3c0;font:700 12.5px 'Baloo 2',system-ui,sans-serif;color:#8a7a5a}#sai .fin .paie.ok{background:#e6f6e8;box-shadow:0 3px 0 #b8dcc0}#sai .fin .paie span{display:block;font:800 10.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:1.6px;color:#3a7a4a}#sai .fin .paie b{display:block;font:900 26px/1.1 'Baloo 2',system-ui,sans-serif;color:#1e6a34}
#sai .fin .paie .xp{display:inline-block;font:900 13px 'Baloo 2',system-ui,sans-serif;font-style:normal;color:#fff;background:#3a8ae8;border-radius:10px;padding:1px 9px;margin:2px 0 4px}#sai .fin .paie small{display:block;font:700 11.5px 'Baloo 2',system-ui,sans-serif;letter-spacing:0;color:#5a7a60}
#sai button.b1,#sai button.b2{width:100%;margin-top:8px;border:0;border-radius:16px;padding:13px;font:800 16px 'Baloo 2',system-ui,sans-serif}#sai .b1{background:linear-gradient(#ffe68a,#f2b030);color:#2a2016;box-shadow:0 4px 0 #a86a10}#sai .b2{background:#fff;color:#2a2016;box-shadow:0 4px 0 #ddd3c0}
#sai .tuto .c{text-align:left}#sai .tuto small,#sai .tuto h2{display:block;text-align:center}
#sai .tuto .et2{display:flex;gap:10px;align-items:center;background:#fff;border-radius:14px;padding:8px 10px;margin-bottom:7px;box-shadow:0 3px 0 #ddd3c0}
#sai .tuto .et2 span{font-size:22px}#sai .tuto .et2 p{margin:0;font:600 13px/1.3 'Baloo 2',system-ui,sans-serif}`;

window.ouvrirSaisissage=function(navire){if(RAC)return;if(!document.getElementById('saiCss')){const s=document.createElement('style');s.id='saiCss';s.textContent=CSS;document.head.appendChild(s);}
 const d=document.createElement('div');d.id='sai';RAC=d;
 d.innerHTML='<div class="bar"><div><small>NOUVEAU DOCKER · '+String(navire||'GARAGE 2').toUpperCase()+'</small><b>Le saisissage</b></div><span class="sp"></span><button class="son">'+(SON.on?'🔊':'🔇')+'</button><button class="x">Quitter</button></div>'+
  '<div class="pl"><span class="tm">⏱ 90 s</span><span>⭐ <i class="sc" style="font-style:normal">0</i></span><span class="rm">🚛 0</span><span class="cb">🔥 ×1</span><span class="rc">🏆 0</span></div>'+
  '<div class="scene"><canvas></canvas></div><div class="bas">Tire les chaînes des points jaunes vers les anneaux, puis serre au fusil.</div>';
 document.body.appendChild(d);CV=d.querySelector('.scene>canvas');G=CV.getContext('2d');
 requestAnimationFrame(()=>{d.classList.add('on');cadrer();nouvelle();majRec();ouvrirVac();tuto();});setTimeout(()=>{if(RAC===d)window.ECRAN_COUVRANT=true;},300);addEventListener('resize',cadrer);
 d.querySelector('.x').onclick=fermer;d.querySelector('.son').onclick=ev=>{ev.currentTarget.textContent=SON.basculer()?'🔊':'🔇';};
 CV.addEventListener('touchstart',debut,{passive:false});CV.addEventListener('touchmove',bouge,{passive:false});CV.addEventListener('touchend',fin,{passive:false});CV.addEventListener('touchcancel',fin,{passive:false});
 CV.addEventListener('mousedown',ev=>{debut(ev);const m=x=>bouge(x),u=x=>{removeEventListener('mousemove',m);removeEventListener('mouseup',u);fin(x);};addEventListener('mousemove',m);addEventListener('mouseup',u);});
 window.__SAI={J:()=>J,V:()=>VUE};
 RAF=requestAnimationFrame(boucle);};
})();
