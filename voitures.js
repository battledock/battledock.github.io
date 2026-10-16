/* VOITURES EN PIXEL ART. Une voiture est une pile de couches PNG (même taille, mêmes coordonnées) :
   la peinture et les vitres sont en niveaux de gris, teintés au moment de l'affichage ;
   les pièces (roues, ailerons, pare-chocs, capot, jupes) se superposent sans rien retoucher. */
const VOITURES={dossier:'assets/voitures/coupe/',cache:{},teintes:{}};

/* une couche, chargée une seule fois */
function voitureCharger(nom){
  if(!VOITURES.cache[nom])VOITURES.cache[nom]=new Promise((ok,ko)=>{
    const im=new Image();
    im.onload=()=>ok(im);
    im.onerror=()=>ko(new Error('couche manquante : '+nom));
    im.src=VOITURES.dossier+nom+'.png';});
  return VOITURES.cache[nom];
}

/* teinte une couche : en dessous de la luminosité de base, on assombrit ; au-dessus, on éclaircit */
function voitureTeinter(img,couleur,base){
  const cle=img.src+'|'+couleur+'|'+base;
  if(VOITURES.teintes[cle])return VOITURES.teintes[cle];
  const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;
  const g=cv.getContext('2d');g.drawImage(img,0,0);
  const d=g.getImageData(0,0,cv.width,cv.height);
  const c=[1,3,5].map(i=>parseInt(couleur.substr(i,2),16));
  for(let i=0;i<d.data.length;i+=4){
    if(d.data[i+3]===0)continue;
    const v=d.data[i];
    let r,gg,b;
    if(v>=base){const f=(v-base)/(255-base);r=c[0]+(255-c[0])*f;gg=c[1]+(255-c[1])*f;b=c[2]+(255-c[2])*f;}
    else{const f=v/base;r=c[0]*f;gg=c[1]*f;b=c[2]*f;}
    d.data[i]=r;d.data[i+1]=gg;d.data[i+2]=b;
  }
  g.putImageData(d,0,0);
  VOITURES.teintes[cle]=cv;
  return cv;
}

const VOITURES_DEFAUT={peinture:'#c8102e',vitres:'#1f3352',roues:'origine',aileron:'aucun',pareChocs:'origine',capot:'origine',jupes:'origine'};

/* la liste des couches d'une voiture, du fond vers le dessus */
function voitureCouches(cfg){
  const c={...VOITURES_DEFAUT,...cfg},out=[];
  const add=(nom,teinte,base)=>out.push({nom,teinte,base});
  if(c.jupes==='sport')add('jupes_sport',c.peinture,200);
  add('peinture',c.peinture,200);
  if(c.pareChocs==='sport')add('pare-chocs_sport',c.peinture,200);
  if(c.capot==='prise')add('capot_prise',c.peinture,200);
  add('vitres',c.vitres,128);
  add('fixe');
  if(c.aileron!=='aucun')add('aileron_'+c.aileron);
  add('roues_'+c.roues);
  return out;
}

/* dessine la voiture sur un contexte, à la position (x,y), zoomée par 'zoom' */
async function voitureDessiner(ctx,x,y,cfg,zoom){
  zoom=zoom||1;
  const couches=voitureCouches(cfg);
  const imgs=await Promise.all(couches.map(k=>voitureCharger(k.nom)));
  ctx.save();ctx.imageSmoothingEnabled=false;
  couches.forEach((k,i)=>{
    const src=k.teinte?voitureTeinter(imgs[i],k.teinte,k.base):imgs[i];
    ctx.drawImage(src,x,y,imgs[i].width*zoom,imgs[i].height*zoom);
  });
  ctx.restore();
}
