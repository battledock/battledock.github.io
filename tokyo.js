/* ================= TOKYO, CARTE VIDE (900 x 900) =================
   Une carte blanche : un sol nu, les bords qui retiennent le joueur, la sortie
   vers le port à l'ouest. Rien d'autre : les immeubles, la rangée des boutiques
   et le concessionnaire sont dans l'historique (34e0ea0), à reposer ici.
   L'ancienne carte est gardée dans l'historique git. */

const TK={
  bati:0,                         /* pas de façades du fond */
  rangee:0, bas:900,              /* pas de rangée de boutiques */
  blocs:[],                       /* rien ne barre le passage */
  porte:null,                     /* pas d'armurerie */
  concessionPorte:null,           /* pas de concessionnaire */
  sortie:{x:60,y0:296,y1:420},    /* la sortie, à l'ouest : vers le port */
  arrivee:[84,360]
};

function bloqueTokyo(x,y){
  if(x<6||x>MONDE_L-6)return true;
  if(y<6||y>MONDE_H-6)return true;
  return false;
}

/* le sol nu : un quadrillage très discret, pour voir la taille de la carte */
function construireSolTokyo(){
  const W=MONDE_L,H=MONDE_H;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  g.fillStyle='#2a2936';g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,255,255,.03)';
  for(let x=0;x<W;x+=50)g.fillRect(x,0,1,H);
  for(let y=0;y<H;y+=50)g.fillRect(0,y,W,1);
  return c;
}

function semerDecorTokyo(){}

/* arrivée : à l'entrée ouest, près du panneau du port. */
function poserTokyo(){
  const [dx,dy]=degager(TK.arrivee[0],TK.arrivee[1]);
  joueur.x=dx;joueur.y=dy;e.ext={x:dx,y:dy};e.extc='tokyo';e.carte='tokyo';
  try{sauver();}catch(x){}
}

;({TK,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo})
