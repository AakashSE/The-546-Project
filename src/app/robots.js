export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/checkout/'],
        },
        sitemap: 'https://the546project.com/sitemap.xml',
    }
}
