/**
 * admin-orders.js — consultation et suivi des commandes en back-office (US-09).
 */

import {
  api, ApiError, formaterPrix, formaterDate, formaterDateHeure, echapper,
  afficherMessage, LIBELLES_STATUT, LIBELLES_PAIEMENT, LIBELLES_RECEPTION,
} from '../../js/api.js';

const STATUTS = ['PENDING', 'IN_PREPARATION', 'READY', 'IN_DELIVERY', 'COMPLETED', 'CANCELLED'];

function construireRequete() {
  const params = new URLSearchParams();
  const statut = document.getElementById('filtre-statut');
  const mode = document.getElementById('filtre-mode');
  const dateDebut = document.getElementById('filtre-date-debut');
  const dateFin = document.getElementById('filtre-date-fin');

  if (statut && statut.value) params.set('status', statut.value);
  if (mode && mode.value) params.set('receptionMode', mode.value);
  if (dateDebut && dateDebut.value) params.set('dateFrom', dateDebut.value);
  if (dateFin && dateFin.value) params.set('dateTo', dateFin.value);

  const chaine = params.toString();
  return chaine ? `/admin/orders?${chaine}` : '/admin/orders';
}

export async function chargerCommandes() {
  const conteneur = document.getElementById('tableau-commandes');
  if (!conteneur) return;

  conteneur.innerHTML = '<p class="chargement">Chargement…</p>';

  try {
    const commandes = await api.get(construireRequete());

    if (commandes.length === 0) {
      conteneur.innerHTML = '<p class="vide">Aucune commande ne correspond à ces critères.</p>';
      return;
    }

    const lignes = commandes
      .map((c) => {
        const produits = (c.items || [])
          .map((i) => `<li>${i.quantity} × ${echapper(i.product_name)}</li>`)
          .join('');

        const adresse = c.reception_mode === 'DELIVERY' && c.delivery_address
          ? `<p style="margin:8px 0 0"><strong>Adresse :</strong> ${echapper(c.delivery_address)}</p>`
          : '';

        const options = STATUTS
          .map((s) => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${LIBELLES_STATUT[s]}</option>`)
          .join('');

        return `
        <tr>
          <td><code>${echapper(String(c.id).slice(0, 8))}</code></td>
          <td>${echapper(`${c.first_name || ''} ${c.last_name || ''}`.trim())}</td>
          <td>${formaterDate(c.scheduled_date)}<br><small class="texte-doux">${echapper(c.scheduled_time_slot || '')}</small></td>
          <td>${echapper(LIBELLES_RECEPTION[c.reception_mode] || c.reception_mode)}</td>
          <td>${formaterPrix(c.total_amount)}</td>
          <td><span class="badge badge-${echapper(c.payment_status)}">${echapper(LIBELLES_PAIEMENT[c.payment_status] || c.payment_status)}</span></td>
          <td><span class="badge badge-${echapper(c.status)}">${echapper(LIBELLES_STATUT[c.status] || c.status)}</span></td>
          <td><button class="btn btn-secondaire btn-petit" data-detail="${echapper(c.id)}">Détail</button></td>
        </tr>
        <tr class="cache" data-ligne-detail="${echapper(c.id)}">
          <td colspan="8" style="background:var(--brun-100)">
            <div class="entre-deux" style="align-items:flex-start">
              <div>
                <p style="margin:0 0 6px"><strong>Commande passée le</strong> ${formaterDateHeure(c.created_at)}</p>
                <p style="margin:0 0 6px"><strong>Client :</strong> ${echapper(c.email || '')}</p>
                <strong>Produits</strong>
                <ul style="margin:6px 0 0;padding-left:20px">${produits}</ul>
                ${adresse}
              </div>
              <div style="min-width:260px">
                <div class="champ">
                  <label for="statut-${echapper(c.id)}">Statut de la commande</label>
                  <select id="statut-${echapper(c.id)}" data-select-statut="${echapper(c.id)}">${options}</select>
                </div>
                <div class="barre-actions">
                  <button class="btn btn-petit" data-enregistrer="${echapper(c.id)}">Enregistrer</button>
                  <button class="btn btn-danger btn-petit" data-annuler="${echapper(c.id)}">Annuler la commande</button>
                </div>
              </div>
            </div>
          </td>
        </tr>`;
      })
      .join('');

    conteneur.innerHTML = `
      <div class="tableau-defilant">
        <table class="tableau">
          <thead>
            <tr>
              <th>N°</th><th>Client</th><th>Retrait / livraison</th><th>Mode</th>
              <th>Total</th><th>Paiement</th><th>Statut</th><th></th>
            </tr>
          </thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>`;

    brancherActions(conteneur);
  } catch (erreur) {
    conteneur.innerHTML = '<p class="vide">Impossible de charger les commandes.</p>';
  }
}

function brancherActions(conteneur) {
  conteneur.querySelectorAll('[data-detail]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const ligne = conteneur.querySelector(`[data-ligne-detail="${bouton.dataset.detail}"]`);
      ligne.classList.toggle('cache');
    });
  });

  conteneur.querySelectorAll('[data-enregistrer]').forEach((bouton) => {
    bouton.addEventListener('click', async () => {
      const id = bouton.dataset.enregistrer;
      const select = conteneur.querySelector(`[data-select-statut="${id}"]`);
      bouton.disabled = true;
      try {
        await api.patch(`/admin/orders/${id}`, { status: select.value });
        afficherMessage('#message', 'Statut mis à jour.', 'succes');
        chargerCommandes();
      } catch (erreur) {
        afficherMessage('#message', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
        bouton.disabled = false;
      }
    });
  });

  conteneur.querySelectorAll('[data-annuler]').forEach((bouton) => {
    bouton.addEventListener('click', async () => {
      const motif = window.prompt('Motif de l\'annulation :');
      if (motif === null) return;
      try {
        await api.post(`/admin/orders/${bouton.dataset.annuler}/cancel`, { reason: motif });
        afficherMessage('#message', 'Commande annulée.', 'succes');
        chargerCommandes();
      } catch (erreur) {
        afficherMessage('#message', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
      }
    });
  });
}

export function initialiserFiltres() {
  ['filtre-statut', 'filtre-mode', 'filtre-date-debut', 'filtre-date-fin'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', chargerCommandes);
  });

  const reinit = document.getElementById('bouton-reinitialiser');
  if (reinit) {
    reinit.addEventListener('click', () => {
      ['filtre-statut', 'filtre-mode', 'filtre-date-debut', 'filtre-date-fin'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      chargerCommandes();
    });
  }

  const select = document.getElementById('filtre-statut');
  if (select) {
    select.innerHTML =
      '<option value="">Tous les statuts</option>' +
      STATUTS.map((s) => `<option value="${s}">${LIBELLES_STATUT[s]}</option>`).join('');
  }
}

/* ---------------------------------------------- Tableau de bord */

export async function chargerStatistiques() {
  const conteneur = document.getElementById('grille-stats');
  if (!conteneur) return;

  try {
    const [commandes, produits] = await Promise.all([
      api.get('/admin/orders'),
      api.get('/admin/products'),
    ]);

    const aujourdhui = new Date().toISOString().split('T')[0];
    const enCours = commandes.filter((c) => ['PENDING', 'IN_PREPARATION', 'READY', 'IN_DELIVERY'].includes(c.status));
    const duJour = commandes.filter((c) => String(c.scheduled_date).startsWith(aujourdhui));
    const chiffreAffaires = commandes
      .filter((c) => c.payment_status === 'PAID')
      .reduce((acc, c) => acc + Number(c.total_amount), 0);

    const stats = [
      { valeur: commandes.length, libelle: 'Commandes au total' },
      { valeur: enCours.length, libelle: 'Commandes en cours' },
      { valeur: duJour.length, libelle: 'Prévues aujourd\'hui' },
      { valeur: produits.filter((p) => p.is_available).length, libelle: 'Produits actifs' },
      { valeur: formaterPrix(chiffreAffaires), libelle: 'Chiffre d\'affaires encaissé' },
    ];

    conteneur.innerHTML = stats
      .map(
        (s) => `
        <div class="carte-stat">
          <div class="valeur">${echapper(s.valeur)}</div>
          <div class="libelle">${echapper(s.libelle)}</div>
        </div>`
      )
      .join('');
  } catch (erreur) {
    conteneur.innerHTML = '<p class="vide">Impossible de charger les statistiques.</p>';
  }
}
