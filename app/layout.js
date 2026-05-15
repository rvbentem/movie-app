import './globals.css'

export const metadata = {
  title: 'Watchlist',
  description: 'Track your IMDb Top 250 movies',
  manifest: '/manifest.json',
  themeColor: '#0f0f0f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Watchlist'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Watchlist" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}