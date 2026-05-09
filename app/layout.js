import './globals.css'

export const metadata = {
  title: 'IMDb Tracker',
  description: 'Track your IMDb Top 250 movies',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}