// ===== DONNÉES =====
const businessData = {
  logo: {
    src: 'Images/logo.png',
    alt: 'Ô2 Passions logo'
  },
  title: 'Ô2 Passions',
  schedules: [
    'Du Mardi au Vendredi: 7h - 19H',
    'Samedi: 7h - 13H30',
    'Dimanche et jours fériés: 7h - 12H30',
    'FERME LUNDI'
  ],
  events: [
    {
      badge: '🏷️ Promotion',
      badgeClass: 'badge-blue',
      title: 'Offre spéciale',
      description: '2 viennoiseries achetées = 1 offerte, tous les samedis matin.',
      date: 'Valable le samedi uniquement'
    },
    {
      badge: '☀️ Saisonnier',
      badgeClass: 'badge-green',
      title: 'Édition été 2025',
      description: 'Nouvelles créations estivales : tartes aux fruits frais, mousses légères et brioches parfumées.',
      date: 'Juin – Août 2025',
      featured: true
    },
    {
      badge: '🚪 Fermeture',
      badgeClass: 'badge-red',
      title: 'Congés annuels',
      description: 'La boutique sera exceptionnellement fermée pour congés annuels.',
      date: 'Du 4 au 18 août 2025'
    },
    {
      badge: '✨ Nouveauté',
      badgeClass: 'badge-amber',
      title: 'Nouveau produit',
      description: 'Découvrez notre nouvelle gamme de pains aux graines : tournesol, lin, pavot.',
      date: 'Disponible dès maintenant'
    }
  ],
  products: [
    {
      title: 'Viennoiseries',
      subtitle: 'Fait Maison',
      description: 'Pour plus d\'informations sur nos viennoiseries, cliquez sur consulter',
      link: 'PageViennoiseries/PageViennoiserie.html'
    },
    {
      title: 'Pains',
      subtitle: 'Fait Maison',
      description: 'Pour plus d\'informations sur nos pains, cliquez sur consulter',
      link: 'PagePains/PagePain.html'
    },
    {
      title: 'Pâtisseries',
      subtitle: 'Fait Maison',
      description: 'Pour plus d\'informations sur nos pâtisseries, cliquez sur consulter',
      link: 'PagePatisseries/PagePatisserie.html'
    },
    {
      title: 'Ventes additionnelles',
      subtitle: 'Fait Maison',
      description: 'Pour plus d\'informations sur nos ventes additionnelles, cliquez sur consulter',
      link: 'PageVentesAdditionnelles/PageVentesAdditionnelles.html'
    }
  ],
  contact: {
    phone: '02 43 98 81 40',
    address: '14 rue des trois marchands',
    socials: [
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/p/O2-Passions-100063792810634/?locale=fr_FR',
        icon: 'Images/facebook.png'
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/prouxanthonyo2passions/',
        icon: 'Images/instagram.png'
      }
    ]
  }
};

// ===== GÉNÉRATEURS DE CONTENU =====

/**
 * Crée l'en-tête de la page
 * @returns {HTMLElement} L'élément header
 */
function createHeader() {
  const header = document.createElement('header');

  const headerDiv = document.createElement('div');

  // Logo
  const logoDiv = document.createElement('div');
  const img = document.createElement('img');
  img.src = businessData.logo.src;
  img.alt = businessData.logo.alt;
  img.width = 700;
  img.height = 700;
  logoDiv.appendChild(img);

  // Section d'informations
  const section = document.createElement('section');

  const h1 = document.createElement('h1');
  h1.textContent = 'Accueil';
  section.appendChild(h1);

  const h3 = document.createElement('h3');
  h3.textContent = 'Horaires:';
  section.appendChild(h3);

  const ol = document.createElement('ol');
  businessData.schedules.forEach(schedule => {
    const p = document.createElement('p');
    p.textContent = schedule;
    ol.appendChild(p);
  });
  section.appendChild(ol);

  headerDiv.appendChild(logoDiv);
  headerDiv.appendChild(section);
  header.appendChild(headerDiv);

  return header;
}

/**
 * Crée une carte d'événement
 * @param {Object} event - Les données de l'événement
 * @returns {HTMLElement} L'élément de la carte d'événement
 */
function createEventCard(event) {
  const card = document.createElement('div');
  card.className = `event-card${event.featured ? ' event-featured' : ''}`;

  if (event.featured) {
    const featured = document.createElement('span');
    featured.className = 'badge-featured';
    featured.textContent = 'En ce moment';
    card.appendChild(featured);
  }

  const badge = document.createElement('div');
  badge.className = `event-badge ${event.badgeClass}`;
  badge.innerHTML = `<span>${event.badge}</span>`;
  card.appendChild(badge);

  const title = document.createElement('h3');
  title.textContent = event.title;
  card.appendChild(title);

  const description = document.createElement('p');
  description.textContent = event.description;
  card.appendChild(description);

  const small = document.createElement('small');
  small.textContent = event.date;
  card.appendChild(small);

  return card;
}

/**
 * Crée la section des événements
 * @returns {HTMLElement} L'élément de la section des événements
 */
function createEventsSection() {
  const section = document.createElement('section');
  section.id = 'evenements';

  const h2 = document.createElement('h2');
  h2.textContent = 'Événements & Actualités';
  section.appendChild(h2);

  const grid = document.createElement('div');
  grid.className = 'evenements-grid';

  businessData.events.forEach(event => {
    grid.appendChild(createEventCard(event));
  });

  section.appendChild(grid);
  return section;
}

/**
 * Crée une section de produit
 * @param {Object} product - Les données du produit
 * @returns {HTMLElement} L'élément de la section produit
 */
function createProductSection(product) {
  const section = document.createElement('section');

  const div = document.createElement('div');

  // Header du produit
  const header = document.createElement('header');

  const h2 = document.createElement('h2');
  h2.textContent = product.title;
  header.appendChild(h2);

  const p = document.createElement('p');
  p.textContent = product.subtitle;
  header.appendChild(p);

  div.appendChild(header);

  // Description
  const descDiv = document.createElement('div');
  const descP = document.createElement('p');
  descP.textContent = product.description;
  descDiv.appendChild(descP);
  div.appendChild(descDiv);

  // Lien
  const link = document.createElement('a');
  link.href = product.link;
  link.textContent = 'Consulter';
  div.appendChild(link);

  section.appendChild(div);
  return section;
}

/**
 * Crée la section principale des produits
 * @returns {HTMLElement} L'élément main
 */
function createMain() {
  const main = document.createElement('main');

  // Section événements
  main.appendChild(createEventsSection());

  // Titre des produits
  const h1 = document.createElement('h1');
  h1.textContent = 'Nos produits';
  main.appendChild(h1);

  // Sections de produits
  businessData.products.forEach(product => {
    main.appendChild(createProductSection(product));
  });

  return main;
}

/**
 * Crée le pied de page
 * @returns {HTMLElement} L'élément footer
 */
function createFooter() {
  const footer = document.createElement('footer');

  const h1 = document.createElement('h1');
  h1.textContent = 'Contact';
  footer.appendChild(h1);

  const ol = document.createElement('ol');

  // Téléphone
  const phoneH3 = document.createElement('h3');
  phoneH3.textContent = 'N° de téléphone:';
  ol.appendChild(phoneH3);

  const phoneP = document.createElement('p');
  phoneP.textContent = businessData.contact.phone;
  ol.appendChild(phoneP);

  // Adresse
  const addressH3 = document.createElement('h3');
  addressH3.textContent = 'Adresse:';
  ol.appendChild(addressH3);

  const addressP = document.createElement('p');
  addressP.textContent = businessData.contact.address;
  ol.appendChild(addressP);

  // Réseaux sociaux
  const socialsH3 = document.createElement('h3');
  socialsH3.textContent = 'Réseaux sociaux:';
  ol.appendChild(socialsH3);

  businessData.contact.socials.forEach(social => {
    const a = document.createElement('a');
    a.href = social.url;

    const img = document.createElement('img');
    img.src = social.icon;
    img.alt = `${social.name} logo`;
    img.width = 60;
    img.height = 60;

    a.appendChild(img);
    ol.appendChild(a);
  });

  footer.appendChild(ol);
  return footer;
}

/**
 * Initialise la page
 */
function initPage() {
  // Crée un conteneur personnalisé ou utilise le body
  const body = document.body;

  // Ajouter un br au début
  const br = document.createElement('br');
  body.appendChild(br);

  // Construire la page
  body.appendChild(createHeader());
  body.appendChild(createMain());
  body.appendChild(createFooter());
}

// ===== INITIALISATION =====
// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
