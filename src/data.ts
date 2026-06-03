import { Product, DeliveryZone } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Robe d\'été Jaune Vintage',
    price: 6500,
    originalPrice: 18000,
    description: 'Une superbe robe longue jaune soleil, idéale pour les sorties ensoleillées à Assinie. Tissu léger et fluide, coupe très flatteuse.',
    category: 'Femme',
    size: 'M',
    brand: 'Zara Vintage',
    state: 'Très bon état',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600'
    ],
    sellerName: 'Awa de Cocody',
    sellerPhone: '0708091011',
    sellerCity: 'Cocody, Abidjan',
    createdAt: '2026-06-01T10:00:00Z',
    isPopular: true
  },
  {
    id: 'prod-2',
    title: 'Veste Bomber en Cuir Marron',
    price: 15000,
    originalPrice: 45000,
    description: 'Veste vintage en cuir véritable de couleur marron foncé. Coupe décontractée style rétro 90s, robuste et pleine de caractère.',
    category: 'Homme',
    size: 'L',
    brand: 'Schott Vintage',
    state: 'Comme neuf',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600'
    ],
    sellerName: 'Junior le Chiffonnier',
    sellerPhone: '0544556677',
    sellerCity: 'Marcory, Abidjan',
    createdAt: '2026-06-02T14:30:00Z',
    isPopular: true
  },
  {
    id: 'prod-3',
    title: 'Chemise en Soie Motif Tropical',
    price: 4500,
    originalPrice: 12500,
    description: 'Chemise à manches courtes ultra-stylée pour vos soirées branchées en Zone 4. Douce sur la peau et très respirante.',
    category: 'Homme',
    size: 'M',
    brand: 'H&M Trend',
    state: 'Très bon état',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600'
    ],
    sellerName: 'Boutique Blaise Vintage',
    sellerPhone: '0102030405',
    sellerCity: 'Plateau, Abidjan',
    createdAt: '2026-05-30T17:00:00Z'
  },
  {
    id: 'prod-4',
    title: 'Sac à Main de Luxe en Cuir Noir',
    price: 25000,
    originalPrice: 85000,
    description: 'Magnifique sac à main vintage de luxe, cuir structuré. En excellent état avec de très légères marques d\'usage sur le fermoir doré.',
    category: 'Premium',
    size: 'Unique',
    brand: 'Lancel Paris',
    state: 'Très bon état',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600'
    ],
    sellerName: 'Chic Madame Riviera',
    sellerPhone: '0707070707',
    sellerCity: 'Cocody Riviera, Abidjan',
    createdAt: '2026-06-03T09:15:00Z',
    isPopular: true
  },
  {
    id: 'prod-5',
    title: 'Blazer Croisé Ivoire Elégant',
    price: 9000,
    originalPrice: 32000,
    description: 'Blazer chic couleur ivoire de haute couture de seconde main. Parfait pour une silhouette de femme d\'affaires influente à Abidjan.',
    category: 'Premium',
    size: 'S',
    brand: 'Massimo Dutti',
    state: 'Comme neuf',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600'
    ],
    sellerName: 'Sonia Dressing',
    sellerPhone: '0585253545',
    sellerCity: 'Yopougon, Abidjan',
    createdAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'prod-6',
    title: 'Robe Wax Moderne d\'Abidjan',
    price: 8000,
    originalPrice: 20000,
    description: 'Une robe en pagne Wax authentique, confectionnée sur mesure mais jamais portée. Coupe moderne avec épaules dénudées.',
    category: 'Femme',
    size: 'L',
    brand: 'Styliste Local',
    state: 'Comme neuf',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600'
    ],
    sellerName: 'Sonia Dressing',
    sellerPhone: '0585253545',
    sellerCity: 'Yopougon, Abidjan',
    createdAt: '2026-06-02T11:45:00Z',
    isPopular: true
  },
  {
    id: 'prod-7',
    title: 'Sweat à Capuche Vert Forêt',
    price: 5000,
    originalPrice: 15000,
    description: 'Hoodie confortable épais, parfait pour les soirées fraîches ou la saison des pluies à Abidjan. Coupe oversize.',
    category: 'Homme',
    size: 'XL',
    brand: 'Champion Vintage',
    state: 'Bon état',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600'
    ],
    sellerName: 'Junior le Chiffonnier',
    sellerPhone: '0544556677',
    sellerCity: 'Marcory, Abidjan',
    createdAt: '2026-05-28T08:00:00Z'
  },
  {
    id: 'prod-8',
    title: 'Salopette en Jean pour Enfant',
    price: 3500,
    originalPrice: 9500,
    description: 'Adorable salopette en jean de marque pour enfant de 4 à 5 ans. Tissu robuste et ajustable.',
    category: 'Enfant',
    size: '4-5 ans',
    brand: 'OshKosh B\'gosh',
    state: 'Très bon état',
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600'
    ],
    sellerName: 'Maman Rose Boutique',
    sellerPhone: '0711223344',
    sellerCity: 'Koumassi, Abidjan',
    createdAt: '2026-06-02T16:00:00Z'
  },
  {
    id: 'prod-9',
    title: 'Lunettes Vintage Cat-Eye',
    price: 3000,
    originalPrice: 10000,
    description: 'Lunettes de soleil rétro à monture léopard rouge et verres teintés sombres. Apporte une touche rétro irrésistible.',
    category: 'Accessoires',
    size: 'Unique',
    brand: 'Retro CI',
    state: 'Très bon état',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600'
    ],
    sellerName: 'Awa de Cocody',
    sellerPhone: '0708091011',
    sellerCity: 'Cocody, Abidjan',
    createdAt: '2026-06-03T11:00:00Z'
  }
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  { name: 'Cocody (Deux Plateaux, Angré, Palmerie, Riviera)', price: 1500, time: '24-48h' },
  { name: 'Marcory (Zone 4, Bietry, Résidentiel)', price: 1500, time: '24-48h' },
  { name: 'Plateau (Quartier des affaires)', price: 1500, time: '24h' },
  { name: 'Treichville / Koumassi', price: 1500, time: '24-48h' },
  { name: 'Yopougon (Maroc, Selmer, Niangon)', price: 2000, time: '24-48h' },
  { name: 'Adjamé / Abobo / Anyama', price: 2000, time: '48h' },
  { name: 'Port-Bouët / Gonzagueville', price: 2000, time: '24-48h' },
  { name: 'Grand-Bassam', price: 3000, time: '48-72h' },
  { name: 'Yamoussoukro (Expédition UTB / Massa)', price: 3000, time: '48h à récupérer' },
  { name: 'Bouaké (Expédition sécurisée)', price: 4000, time: '48h à récupérer' },
  { name: 'San Pédro (Expédition maritime/route)', price: 4000, time: '72h à récupérer' }
];
