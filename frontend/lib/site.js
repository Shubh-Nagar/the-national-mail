export const site = {
  name: 'The National Mail',
  tagline: 'Stories from every pin code',
  description:
    'The National Mail reports on the people, ideas and communities quietly solving problems across India, from changemakers and innovators to heritage, health and the environment.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_IN',
  twitter: '@thenationalmail',
  email: 'editor@nationalmail.in',
  social: [
    { name: 'Instagram', href: 'https://instagram.com/' },
    { name: 'YouTube', href: 'https://youtube.com/' },
    { name: 'X', href: 'https://x.com/' },
    { name: 'Facebook', href: 'https://facebook.com/' },
    { name: 'LinkedIn', href: 'https://linkedin.com/' },
  ],
};
