/* =====================================================================
   LE CORDON — LE SON

   AUCUN FICHIER. Tout est synthetise au vol : une rumeur de foule faite
   de bruit filtre, des impacts, des sifflets. Pourquoi : un jeu
   d'arcade qui se charge en deux secondes ne peut pas attendre trois
   cents kilo-octets de MP3, et un chemin de ressource casse est un
   silence qu'on ne remarque qu'en production.

   LA REGLE DU NAVIGATEUR MOBILE : aucun son n'est permis avant que le
   joueur ait touche l'ecran. On ne cree donc le contexte qu'au premier
   doigt, et tout ce qui precede est ignore sans erreur.

   LA RUMEUR SUIT LA SIMULATION : son volume vient du nombre de corps au
   contact et sa couleur de la tension. Ce n'est pas une boucle qui
   tourne dans le vide, c'est un indicateur de plus.
   ===================================================================== */
(function(){
'use strict';
var SON={ok:false, ctx:null, coupe:false};

function ctx(){
  if(SON.ctx)return SON.ctx;
  var C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;
  try{SON.ctx=new C();}catch(e){return null;}
  return SON.ctx;
}

/* LE BRUIT, fabrique une fois et reutilise : une seconde de bruit blanc
   en boucle coute un tampon, pas un calcul par image. */
function tampon(){
  if(SON.buf)return SON.buf;
  var c=ctx(); if(!c)return null;
  var n=c.sampleRate*2, b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
  SON.buf=b; return b;
}

SON.demarrer=function(){
  var c=ctx(); if(!c)return false;
  if(c.state==='suspended')c.resume();
  if(SON.ok)return true;
  var b=tampon(); if(!b)return false;
  /* la rumeur : du bruit passe dans un filtre passe-bas, dont la
     frequence monte avec la tension — une foule tendue est plus aigue */
  SON.src=c.createBufferSource(); SON.src.buffer=b; SON.src.loop=true;
  SON.flt=c.createBiquadFilter(); SON.flt.type='lowpass';
  SON.flt.frequency.value=320; SON.flt.Q.value=0.8;
  SON.gain=c.createGain(); SON.gain.gain.value=0;
  SON.sortie=c.createGain(); SON.sortie.gain.value=0.5;
  SON.src.connect(SON.flt); SON.flt.connect(SON.gain);
  SON.gain.connect(SON.sortie); SON.sortie.connect(c.destination);
  SON.src.start(0);
  SON.ok=true;
  return true;
};

SON.pause=function(p){
  var c=SON.ctx; if(!c||!SON.ok)return;
  try{ if(p&&c.state==='running')c.suspend(); else if(!p&&c.state==='suspended')c.resume(); }catch(e){}
};
SON.muet=function(m){
  SON.coupe=!!m;
  if(SON.sortie)SON.sortie.gain.value=m?0:0.5;
};

/* LA RUMEUR, mise a jour quatre fois par seconde et pas soixante : une
   rampe d'un quart de seconde s'entend mieux qu'un saut par image, et
   coute quinze fois moins. */
SON.rumeur=function(force,tension){
  if(!SON.ok||SON.coupe)return;
  var c=SON.ctx, t=c.currentTime;
  var v=Math.min(0.32,force*0.0022);
  try{
    SON.gain.gain.setTargetAtTime(v,t,0.25);
    SON.flt.frequency.setTargetAtTime(300+tension*900,t,0.4);
  }catch(e){}
};

/* UN COUP : une enveloppe courte sur du bruit ou sur une onde. C'est
   tout ce qu'il faut pour une detonation, un sifflet, un choc. */
function coup(o){
  if(!SON.ok||SON.coupe)return;
  var c=SON.ctx, t=c.currentTime;
  var g=c.createGain(), f=c.createBiquadFilter();
  f.type=o.type||'bandpass'; f.frequency.value=o.freq||600; f.Q.value=o.q||1;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(o.vol||0.3,t+(o.att||0.004));
  g.gain.exponentialRampToValueAtTime(0.0008,t+(o.dur||0.3));
  var src;
  if(o.onde){
    src=c.createOscillator(); src.type=o.onde;
    src.frequency.setValueAtTime(o.freq||600,t);
    if(o.vers)src.frequency.exponentialRampToValueAtTime(o.vers,t+(o.dur||0.3));
  }else{
    src=c.createBufferSource(); src.buffer=tampon(); src.loop=true;
  }
  src.connect(f); f.connect(g); g.connect(SON.sortie);
  src.start(t); src.stop(t+(o.dur||0.3)+0.05);
}

SON.effet=function(k){
  if(!SON.ok||SON.coupe)return;
  if(k==='grenade')  {coup({freq:220,q:0.7,vol:0.42,dur:0.9,type:'lowpass'});
                      coup({freq:1800,q:0.6,vol:0.16,dur:0.5,type:'highpass'});}
  else if(k==='sifflet'){coup({onde:'square',freq:2100,vers:2500,vol:0.10,dur:0.26,type:'bandpass',q:6});}
  else if(k==='ordre') {coup({onde:'square',freq:700,vers:900,vol:0.07,dur:0.08,type:'bandpass',q:4});}
  else if(k==='clic')  {coup({onde:'square',freq:420,vol:0.05,dur:0.04,type:'bandpass',q:3});}
  else if(k==='charge'){coup({freq:140,q:0.6,vol:0.3,dur:0.55,type:'lowpass'});}
  else if(k==='verre') {coup({freq:3200,q:0.9,vol:0.26,dur:0.45,type:'highpass'});}
  else if(k==='gagne') {coup({onde:'triangle',freq:520,vers:780,vol:0.14,dur:0.5,type:'lowpass',q:1});}
  else if(k==='perdu') {coup({onde:'triangle',freq:300,vers:120,vol:0.16,dur:0.9,type:'lowpass',q:1});}
};

window.CORDON_SON=SON;
})();
