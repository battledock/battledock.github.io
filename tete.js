/* LA TÊTE DE PAGE, commune à toutes les pages du jeu : la version et
   le cache, puis les gestes du navigateur qu'on neutralise (sélection,
   menu contextuel, pincement, zoom clavier). Ces trois morceaux
   vivaient en clair dans jeu.html. */
(function(){var champ=function(t){return t&&t.closest&&t.closest('input,textarea,[contenteditable="true"]');};
['selectstart','copy','cut','contextmenu','dragstart'].forEach(function(k){document.addEventListener(k,function(e){if(!champ(e.target))e.preventDefault();},{capture:true});});})();
(function(){
var MA_VERSION='2026-10-23-1500';
window.MA_VERSION=MA_VERSION;          /* visible par tout le jeu (les réglages l'affichent) */
/* LE DRAPEAU EST PAR PAGE. Il etait commun a tout le site : des que
   index.html s'etait recharge une fois pour la version du jour, il
   ecrivait « bdl.version.vue = <version> », et jeu.html — reste en
   cache sur une vieille version — lisait ce meme drapeau, croyait
   s'etre deja recharge, et ne se rechargeait jamais. On jouait une
   ancienne version pour toujours, dans cet onglet. */
var cle='bdl.version.vue:'+location.pathname.split('?')[0];
function verifier(){
fetch('version.json?t='+Date.now(),{cache:'no-store'})
.then(function(r){return r.json();})
.then(function(d){
if(!d||!d.v)return;
try{localStorage.setItem('bdl.v',d.v);}catch(e){}
if(d.v===MA_VERSION)return;
var deja=null;
try{deja=sessionStorage.getItem(cle);}catch(e){}
/* on ne bloque que si l'on a DÉJÀ rechargé pour CETTE version-là :
   sinon, une fois la première mise à jour vue, plus aucune autre ne passait. */
if(deja===d.v)return;
try{sessionStorage.setItem(cle,d.v);}catch(e){}
var q=new URLSearchParams(location.search);q.set('v',d.v);
var u=location.pathname.split('?')[0]+'?'+q.toString();   /* on garde la carte : sinon un voyage vers la ferme ou la forêt revenait au port */
location.replace(u);
})
.catch(function(){});
}
verifier();
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){
if(window.__JEU_DEMARRE)return;
var d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:9999;background:#1d1a14;color:#f2e8d0;display:flex;align-items:center;justify-content:center;padding:24px;font:16px Georgia,serif;text-align:center;line-height:1.5';
d.innerHTML='<div><b style="font-size:20px">Ton navigateur est trop ancien pour Battle Dock</b><br><br>Mets à jour <b>Chrome</b> ou <b>Samsung Internet</b> depuis le Play Store, puis rouvre le jeu.<br><br><small style="opacity:.7">'+(navigator.userAgent||'').replace(/[<>]/g,'').slice(0,160)+'</small></div>';
document.body.appendChild(d);
},1500);});
var vu=Date.now();
document.addEventListener('visibilitychange',function(){
if(document.visibilityState!=='visible')return;
if(Date.now()-vu<60000)return;
vu=Date.now();verifier();
});
})();
(function(){var non=function(e){e.preventDefault();};
['gesturestart','gesturechange','gestureend'].forEach(function(t){document.addEventListener(t,non,{passive:false});});
document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});
window.addEventListener('wheel',function(e){if(e.ctrlKey)e.preventDefault();},{passive:false});
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&['+','-','=','0'].indexOf(e.key)>=0)e.preventDefault();});})();
