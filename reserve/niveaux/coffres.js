/* les coffres en pixel art (grille 32×27) */
function px(rows,pal){let s='';rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const c=pal[r[x]];if(c)s+='<rect x="'+x+'" y="'+y+'" width="1.02" height="1.02" fill="'+c+'"/>';}});return '<svg viewBox="0 0 32 27" shape-rendering="crispEdges">'+s+'</svg>';}
const CH=[
"................................",
"....kkkkkkkkkkkkkkkkkkkkkkkk....",
"...kLLLLLLLLLLLLLLLLLLLLLLLLk...",
"..kLlllllllllllllllllllllllllk..",
"..kLlddddddddddddddddddddddllk..",
"..kmmllllllllllllllllllllllmmk..",
"..kmMlllllllllllllllllllllllMmk.",
"..kmmddddddddddddddddddddddmmk..",
"..kBBBBBBBBBBBqqqqBBBBBBBBBBBk..",
"..kbbbbbbbbbbqQQQQqbbbbbbbbbbk..",
"..kmmPPPPPPPPqQssQqPPPPPPPPmmk..",
"..kmMpppppppppqQQqppppppppppMk..",
"..kmmpppppppppqqqqpppppppppmmk..",
"..kPPPPPPPPPPPPPPPPPPPPPPPPPPk..",
"..kppppppppppppppppppppppppppk..",
"..kddddddddddddddddddddddddddk..",
"..kmmPPPPPPPPPPPPPPPPPPPPPPmmk..",
"..kmMppppppppppppppppppppppMmk..",
"..kmmppppppppppppppppppppppmmk..",
"..kPPPPPPPPPPPPPPPPPPPPPPPPPPk..",
"..kppppppppppppppppppppppppppk..",
"..kddddddddddddddddddddddddddk..",
"..kmmBBBBBBBBBBBBBBBBBBBBBBmmk..",
"..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..",
"...oooooooooooooooooooooooooo...",
"................................",
"................................"];
const P_BOIS={k:'#3a2408',L:'#d8a060',l:'#b07a40',d:'#7a4a20',m:'#8a8e96',M:'#d8dce4',B:'#5a3a1a',b:'#7a5030',q:'#3a2408',Q:'#e8c06a',s:'#3a2408',P:'#b07a40',p:'#9a6434',o:'rgba(0,0,0,.25)'};
const P_MALLE={k:'#0e1e30',L:'#5aa0e0',l:'#2a6ab8',d:'#163a6a',m:'#c8a24a',M:'#fff0b0',B:'#e8c06a',b:'#c8a24a',q:'#3a2408',Q:'#ffe08a',s:'#3a2408',P:'#2a6ab8',p:'#1f5a9a',o:'rgba(0,0,0,.25)'};
const P_BONNE={k:'#4a2a08',L:'#fff3b8',l:'#f4d070',d:'#c8962a',m:'#fff6d8',M:'#ffffff',B:'#7a2a8a',b:'#9a3aa8',q:'#3a0a4a',Q:'#e070ff',s:'#ffd0ff',P:'#f0c040',p:'#e0aa30',o:'rgba(0,0,0,.25)'};
window.COFFRES={bois:px(CH,P_BOIS),malle:px(CH,P_MALLE),bonne:px(CH,P_BONNE)};
