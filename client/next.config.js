/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/service", destination: "/support/guide", permanent: false },
      { source: "/faq", destination: "/support/faq", permanent: false },
      { source: "/inquiry", destination: "/support/inquiry", permanent: false },
      { source: "/notice", destination: "/support/notice", permanent: false },
      { source: "/notice/:id", destination: "/support/notice/:id", permanent: false },
    ];
  },
};

module.exports = nextConfig;
