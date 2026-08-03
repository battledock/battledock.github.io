/* Icônes SVG monochromes (courant: currentColor). Usage : icone("billet") */
const ICONES = {
  batiment:`<path d="M3 20 L3 8 L12 3 L21 8 L21 20 Z M8 20 L8 13 L16 13 L16 20 M6 9.5 L18 9.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,
  pellicule:`<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7 5 L7 19 M17 5 L17 19" stroke="currentColor" stroke-width="1.4"/><path d="M4.2 8 h1.6 M4.2 12 h1.6 M4.2 16 h1.6 M18.2 8 h1.6 M18.2 12 h1.6 M18.2 16 h1.6" stroke="currentColor" stroke-width="1.4"/>`,
  fauteuil:`<path d="M5 11 L5 6 Q5 4.5 6.5 4.5 L17.5 4.5 Q19 4.5 19 6 L19 11 M3.5 11.5 Q3.5 10 5 10 L19 10 Q20.5 10 20.5 11.5 L20.5 15 Q20.5 16.5 19 16.5 L5 16.5 Q3.5 16.5 3.5 15 Z M6 16.5 L6 19.5 M18 16.5 L18 19.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  camera:`<rect x="2.5" y="8" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14.5 12 L21 8.5 L21 17.5 L14.5 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="7" cy="5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12.5" cy="5.4" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/>`,
  etoile:`<path d="M12 3.5 L14.4 9 L20.5 9.6 L15.9 13.6 L17.3 19.5 L12 16.4 L6.7 19.5 L8.1 13.6 L3.5 9.6 L9.6 9 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,
  piece:`<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5 Q9 7.5 9 9.6 Q9 11.4 12 11.9 Q15 12.4 15 14.3 Q15 16.5 12 16.5 M12 6.2 L12 7.5 M12 16.5 L12 17.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  billet:`<path d="M3 8 Q3 7 4 7 L20 7 Q21 7 21 8 L21 10.2 Q19.4 10.6 19.4 12 Q19.4 13.4 21 13.8 L21 16 Q21 17 20 17 L4 17 Q3 17 3 16 L3 13.8 Q4.6 13.4 4.6 12 Q4.6 10.6 3 10.2 Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.5 7 L9.5 17" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2.2"/>`,
  horloge:`<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7 L12 12 L15.5 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  spectateurs:`<circle cx="8.5" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 19 Q3 13.5 8.5 13.5 Q14 13.5 14 19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16.5" cy="8.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15.5 13.9 Q21 14.3 21 19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  journal:`<rect x="3.5" y="5" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M17.5 8 L19.5 8 Q20.5 8 20.5 9 L20.5 17 Q20.5 19 18.5 19 L5 19" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 8.5 L14.5 8.5 M6.5 11.5 L14.5 11.5 M6.5 14.5 L11 14.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  cloche:`<path d="M12 4 Q6.5 4 6.5 10 L6.5 14 L4.8 16.5 L19.2 16.5 L17.5 14 L17.5 10 Q17.5 4 12 4 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19 Q12 20.6 14 19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  maison:`<path d="M4 11 L12 4 L20 11 M6 9.5 L6 20 L18 20 L18 9.5 M10 20 L10 14.5 L14 14.5 L14 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`,
  outil:`<path d="M14.5 6.5 Q14.5 4 17 3.5 L15.5 6 L18 8.5 L20.5 7 Q20 9.5 17.5 9.5 Q16.8 9.5 16.2 9.2 L7 18.4 Q6 19.4 5 18.4 L5.6 19 Q4.6 18 5.6 17 L14.8 7.8 Q14.5 7.2 14.5 6.5 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  porte:`<rect x="6" y="4" width="12" height="17" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="15" cy="12.5" r="1" fill="currentColor"/><path d="M3.5 21 L20.5 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`
};
function icone(nom, cls=""){
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom]||""}</svg>`;
}

/* ---- exports ---- */
export {
  ICONES,
  icone
};
