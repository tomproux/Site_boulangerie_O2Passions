// ===== DONNÉES =====
const pageData = {
  title: 'Nos viennoiseries',
  backLink: {
    href: '../O2Passions.html',
    label: 'Retourner à la page précédente'
  },
  heroImage: {
    src: 'ImagesViennoiseries/viennoiseries.jpg',
    alt: 'Viennoiseries Ô2 Passions',
    width: 700,
    height: 700
  },
  products: [

  ]
};

function createHeader() {
  const header = document.createElement('header');

  const backLink = document.createElement('a');
  backLink.href = pageData.backLink.href;
  backLink.textContent = pageData.backLink.label;
  header.appendChild(backLink);

  const title = document.createElement('h1');
  title.textContent = pageData.title;
  header.appendChild(title);

  const hero = document.createElement('img');
  hero.src = pageData.heroImage.src;
  hero.alt = pageData.heroImage.alt;
  hero.width = pageData.heroImage.width;
  hero.height = pageData.heroImage.height;
  header.appendChild(hero);

  return header;
}

function createProductSection(product) {
  const fragment = document.createDocumentFragment();

  const heading = document.createElement('h2');
  heading.textContent = product.name;
  fragment.appendChild(heading);

  const image = document.createElement('img');
  image.src = product.image.src;
  image.alt = product.image.alt;
  image.width = product.image.width;
  image.height = product.image.height;
  fragment.appendChild(image);

  const list = document.createElement('ol');
  product.items.forEach(item => {
    const itemElement = document.createElement('p');
    itemElement.textContent = item;
    list.appendChild(itemElement);
  });
  fragment.appendChild(list);

  return fragment;
}

function createMain() {
  const main = document.createElement('main');

  const title = document.createElement('h1');
  title.textContent = 'Nos différents produits:';
  main.appendChild(title);

  pageData.products.forEach(product => {
    main.appendChild(createProductSection(product));
  });

  return main;
}

function createFooter() {
  return document.createElement('footer');
}

function initPage() {
  const body = document.body;
  body.appendChild(createHeader());
  body.appendChild(createMain());
  body.appendChild(createFooter());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
