import './globals.css'

import { ClerkProvider } from '@clerk/nextjs';
import Headers from '@/components/headers';

export const metadata = {
  title: 'Emoji Maker',
  description: 'Generate custom emojis using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased font-sans">
          <Headers />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
