export interface SiteConfig {
  name: string;
  tagline: string;
  url: string;
  description: string;
  email: string;
  lang: 'en' | 'es';
  homeHref: string;
  libraryHref: string;
  browseBooksLabel: string;
  langSwitch: { href: string; label: string };
  social: { instagram: string; facebook: string; pinterest: string };
  nav: { label: string; href: string }[];
  footerTagline: string;
  quickLinksHeading: string;
  stayLoopHeading: string;
  stayLoopText: string;
  connectHeading: string;
  affiliateDisclosureShort: string;
  footerLinks: {
    quickLinks: { label: string; href: string }[];
    legal: { label: string; href: string }[];
  };
}

export const SITE: SiteConfig = {
  name: 'Mighty Little Bookshelf',
  tagline: 'Helping little readers understand big medical experiences.',
  url: 'https://mightylittlebookshelf.com',
  description:
    "A curated library of children's books about medical diagnoses, hospital stays, surgery, the NICU, cancer, heart conditions, feeding tubes, grief, and more.",
  email: 'hello@mightylittlebookshelf.com',
  lang: 'en',
  homeHref: '/',
  libraryHref: '/library/',
  browseBooksLabel: 'Browse Books',
  langSwitch: { href: '/es/', label: 'Español' },
  social: {
    instagram: 'https://instagram.com/mightylittlebookshelf',
    facebook: 'https://facebook.com/mightylittlebookshelf',
    pinterest: 'https://pinterest.com/mightylittlebookshelf',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Book Library', href: '/library/' },
    { label: 'Topics', href: '/topics/' },
    { label: 'For Hospitals', href: '/for-hospitals/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ],
  footerTagline:
    "We're here to help families and caregivers find the perfect books for life's toughest moments and the brave little hearts who live them.",
  quickLinksHeading: 'Quick Links',
  stayLoopHeading: 'Stay in the Loop',
  stayLoopText: 'Get new book picks, helpful tips, and resources delivered to your inbox.',
  connectHeading: "Let's Connect",
  affiliateDisclosureShort:
    'Affiliate Disclosure: As an Amazon Associate, we earn from qualifying purchases. This helps support our mission at no extra cost to you. Thank you!',
  footerLinks: {
    quickLinks: [
      { label: 'Book Library', href: '/library/' },
      { label: 'Topics', href: '/topics/' },
      { label: 'For Hospitals & Healthcare Teams', href: '/for-hospitals/' },
      { label: 'About', href: '/about/' },
      { label: 'Contact', href: '/contact/' },
    ],
    legal: [
      { label: 'Affiliate Disclosure', href: '/affiliate-disclosure/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
    ],
  },
};

export const SITE_ES: SiteConfig = {
  name: 'Mighty Little Bookshelf',
  tagline: 'Ayudando a los pequeños lectores a entender grandes experiencias médicas.',
  url: 'https://mightylittlebookshelf.com',
  description:
    'Una biblioteca seleccionada de libros infantiles sobre diagnósticos médicos, hospitalización, cirugía, UCIN, cáncer, cardiología, sondas de alimentación, duelo y más.',
  email: 'hello@mightylittlebookshelf.com',
  lang: 'es',
  homeHref: '/es/',
  libraryHref: '/es/library/',
  browseBooksLabel: 'Ver Libros',
  langSwitch: { href: '/', label: 'English' },
  social: {
    instagram: 'https://instagram.com/mightylittlebookshelf',
    facebook: 'https://facebook.com/mightylittlebookshelf',
    pinterest: 'https://pinterest.com/mightylittlebookshelf',
  },
  nav: [
    { label: 'Inicio', href: '/es/' },
    { label: 'Biblioteca de Libros', href: '/es/library/' },
    { label: 'Temas', href: '/es/topics/' },
    { label: 'Acerca de', href: '/es/about/' },
    { label: 'Contacto', href: '/es/contact/' },
  ],
  footerTagline:
    'Estamos aquí para ayudar a familias y cuidadores a encontrar los libros perfectos para los momentos más difíciles de la vida y para los corazones valientes que los viven.',
  quickLinksHeading: 'Enlaces Rápidos',
  stayLoopHeading: 'Mantente al Día',
  stayLoopText: 'Recibe nuevas recomendaciones de libros, consejos útiles y recursos en tu correo.',
  connectHeading: 'Conéctate',
  affiliateDisclosureShort:
    'Divulgación de Afiliados: Como Afiliados de Amazon, ganamos con las compras que califican. Esto ayuda a apoyar nuestra misión sin costo adicional para ti. ¡Gracias!',
  footerLinks: {
    quickLinks: [
      { label: 'Biblioteca de Libros', href: '/es/library/' },
      { label: 'Temas', href: '/es/topics/' },
      { label: 'Acerca de', href: '/es/about/' },
      { label: 'Contacto', href: '/es/contact/' },
    ],
    legal: [
      { label: 'Divulgación de Afiliados', href: '/es/affiliate-disclosure/' },
      { label: 'Política de Privacidad', href: '/es/privacy-policy/' },
    ],
  },
};
