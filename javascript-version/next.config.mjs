/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  env: {
    NEXT_PUBLIC_PRO_URL: process.env.NEXT_PUBLIC_PRO_URL || 'https://themeselection.com',
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL || 'https://demos.themeselection.com',
    NEXT_PUBLIC_REPO_NAME: process.env.NEXT_PUBLIC_REPO_NAME || 'materio-mui-react-nextjs-admin-template-free'
  },
  experimental: {
    // Suppress punycode deprecation warning
    suppressDeprecationWarnings: true
  }
}

export default nextConfig
