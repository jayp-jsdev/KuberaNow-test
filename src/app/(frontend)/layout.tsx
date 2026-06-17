import React from 'react'
import { rootMetadata } from '@/lib/seo'
import { buildSiteJsonLd } from '@/lib/structuredData'
import JsonLd from './components/JsonLd/JsonLd'
import NavigationScrollManager from './components/NavigationScrollManager/NavigationScrollManager'
import SiteLayoutShell from './components/SiteLayoutShell/SiteLayoutShell'
import './globals.css'
import './legacy.css'

export const metadata = rootMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JsonLd data={buildSiteJsonLd()} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NavigationScrollManager />
        <main id="main-content">
          <SiteLayoutShell>{children}</SiteLayoutShell>
        </main>
      </body>
    </html>
  )
}
