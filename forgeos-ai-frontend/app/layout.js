
import './globals.css'

export const metadata = {
  title: 'ForgeOS AI',
  description: 'Elite AI Life Operating System'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
