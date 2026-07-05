// ===== DONNÉES =====
const pageData = {
  title: 'Nos pâtisseries',
  backLink: {
    href: '../O2Passions.html',
    label: 'Retourner à la page précédente'
  },
  heroImage: {
    src: 'ImagesPatisseries/gateaux.jpg',
    alt: 'Pâtisseries Ô2 Passions',
    width: 1460,
    height: 1350
  },
  categories: [
    {
      categoryName: 'Entremets',
      products: [
        {
          name: 'Trois-chocolat',
          image: {
            src: 'ImagesPatisseries/trois-choc.png',
            alt: 'Trois-chocolat',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Fraisiers',
          image: {
            src: 'ImagesPatisseries/fraisier.png',
            alt: 'Fraisiers',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Paris-brest',
          image: {
            src: 'ImagesPatisseries/Paris-brest.png',
            alt: 'Paris-brest',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Paris-brest Pistache',
          image: {
            src: 'ImagesPatisseries/Paris-brestPistache.png',
            alt: 'Paris-brest Pistache',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        }
      ]
    },
    {
      categoryName: 'Tartes',
      products: [
        {
          name: 'Tarte rustique',
          image: {
            src: 'ImagesPatisseries/tarteRustique.png',
            alt: 'Tarte rustique',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Tarte fraises',
          image: {
            src: 'ImagesPatisseries/tarteFraise.png',
            alt: 'Tarte fraises',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Tarte framboises',
          image: {
            src: 'ImagesPatisseries/tarteFramboises.png',
            alt: 'Tarte framboises',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Tarte fruits-frais',
          image: {
            src: 'ImagesPatisseries/tarteFruits-frais.png',
            alt: 'Tarte fruits-frais',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Tarte citron',
          image: {
            src: 'ImagesPatisseries/tarteCitron.png',
            alt: 'Tarte citron',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        },
        {
          name: 'Tarte chocolat',
          image: {
            src: 'ImagesPatisseries/tarteChocolat.png',
            alt: 'Tarte chocolat',
            width: 150,
            height: 150
          },
          items: ['4 personnes', '6 personnes', '8 personnes']
        }
      ]
    },
    {
      categoryName: 'Individuel',
      isSingleProduct: true,
      products: [
        {
          name: 'Produits individuels',
          image: {
            src: 'ImagesPatisseries/individuel.png',
            alt: 'Produits individuels',
            width: 150,
            height: 150
          },
          items: [
            'éclair chocolat',
            'éclair café',
            'choux à la crème',
            'paris-brest',
            'paris-brest pistache',
            'tartelette abricot-coco',
            'tartelette amandine-poire',
            'tartelette crumble',
            'tartelette rustique',
            'tartelette fraises',
            'tartelette framboises',
            'tartelette fruits-frais',
            'tartelette citron',
            'tartelette chocolat'
          ]
        }
      ]
    }
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

function createProductItem(product) {
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

  const heading = document.createElement('h1');
  heading.textContent = 'Nos différents produits:';
  main.appendChild(heading);

  pageData.categories.forEach(category => {
    const categoryHeading = document.createElement('h1');
    categoryHeading.textContent = category.categoryName + ':';
    main.appendChild(categoryHeading);

    category.products.forEach(product => {
      main.appendChild(createProductItem(product));
    });

    if (!category.isSingleProduct) {
      const br = document.createElement('br');
      main.appendChild(br);
    }
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
