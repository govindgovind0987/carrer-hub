export default function manifest() {
  return {
    name: 'CareerHub — AI-Powered Career Development & Hiring Platform',
    short_name: 'CareerHub',
    description:
      'AI-powered hiring platform for candidates, recruiters, and admins. Streamline your hiring process.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a1a',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
