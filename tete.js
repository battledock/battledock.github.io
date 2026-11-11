/* ===== EMPREINTES (posées par outils/empreintes.js) ===== */
window.EMPREINTES={"actors.js":"e003fe9b","affiches.js":"e688b397","anim.js":"959eb24b","bagages.js":"a7c9c5b1","bleudechauffe.js":"52336040","blocus.js":"b1955c97","carnet.js":"e5c4318f","carte.js":"d4a0d441","circuit.js":"bbe91d4f","classement.js":"64dec30e","coquille.js":"6cb3ae61","corniche.js":"5fb591fb","courses.js":"e21a59d3","douglas.js":"580a3c87","embarquement.js":"60b703be","ferme.js":"98823e58","joliette.js":"d383f7ad","labo.js":"237a2be4","maintenance.js":"7ecffd5c","moteur.css":"0bfeb23f","moteur.js":"20cb800b","personnage.js":"1471b652","plage.js":"e668cd50","plateau.js":"e5be62d2","pokedock.js":"fee9c87d","pokedock_hw.js":"f7b629c6","pole.js":"f1ba484e","port.js":"75c5b326","portique.js":"169b5aaf","quai.js":"0cb524ab","reglages.js":"c923afda","render.js":"1a395854","responsive.css":"caca6b41","retour.js":"6c72c050","sac.js":"ed9690d2","saisissage.js":"9778778b","session.js":"b36fa1f2","stade.js":"99f89b0a","surprise.js":"c6737cb1","sw.js":"4b426b28","telephone.js":"d16cb6bb","terrasses.js":"e0656f0c","tokyo.js":"c6dade53","tvjeu.js":"3ca4c209","twists.js":"24b81001","vacations.js":"605b7324","vestiaire.js":"d26d170f","voitures.js":"fa3b8d68"};
/* ===== fin des empreintes ===== */
/* LA TÊTE DE PAGE, commune à toutes les pages du jeu : la version et
   le cache, puis les gestes du navigateur qu'on neutralise (sélection,
   menu contextuel, pincement, zoom clavier). Ces trois morceaux
   vivaient en clair dans jeu.html. */
(function(){var champ=function(t){return t&&t.closest&&t.closest('input,textarea,[contenteditable="true"]');};
['selectstart','copy','cut','contextmenu','dragstart'].forEach(function(k){document.addEventListener(k,function(e){if(!champ(e.target))e.preventDefault();},{capture:true});});})();
(function(){
var MA_VERSION='2026-10-31-1800';
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
/* (écran « navigateur trop ancien » retiré) */
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
