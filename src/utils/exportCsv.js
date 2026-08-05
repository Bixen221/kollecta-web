export function exporterCsv(donnees, colonnes, nomFichier) {
  if (!donnees || donnees.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

  const entetes = colonnes.map(c => c.label).join(',');
  const lignes = donnees.map(item =>
    colonnes.map(c => {
      const valeur = item[c.champ];
      const texte = valeur === null || valeur === undefined ? '' : String(valeur);
      return `"${texte.replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [entetes, ...lignes].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
