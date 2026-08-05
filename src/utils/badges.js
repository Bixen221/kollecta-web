export function getBadgeMembre(user) {
  const nbDons = user.nb_dons || 0;
  const note = parseFloat(user.note_moyenne) || 0;
  const dateInscription = user.cree_le ? new Date(user.cree_le) : null;
  const joursDepuisInscription = dateInscription
    ? Math.floor((new Date() - dateInscription) / (1000 * 60 * 60 * 24))
    : 999;

  if (nbDons >= 5 && note >= 4.5) {
    return { label: 'Membre de confiance', emoji: '🏆', couleur: 'var(--or)', bg: 'var(--orl)' };
  }
  if (nbDons >= 2) {
    return { label: 'Membre actif', emoji: '⭐', couleur: 'var(--gr)', bg: 'var(--grl)' };
  }
  if (joursDepuisInscription <= 30) {
    return { label: 'Nouveau membre', emoji: '🌱', couleur: 'var(--bleuh)', bg: 'rgba(38,99,235,0.1)' };
  }
  return null;
}
