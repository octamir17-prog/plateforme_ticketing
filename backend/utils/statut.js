function deriverStatutTicket(technicienId, statutAffectation) {
  if (statutAffectation === 'CLOTUREE') {
    return 'CLOTURE';
  }

  if (statutAffectation === 'EN_TRAITEMENT') {
    return 'EN_COURS';
  }

  if (technicienId) {
    return 'AFFECTE';
  }

  return 'SOUMIS';
}

module.exports = { deriverStatutTicket };