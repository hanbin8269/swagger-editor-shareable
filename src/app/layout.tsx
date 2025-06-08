import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Shareable Swagger Editor | 공유 가능한 API 문서 에디터',
  description: 'OpenAPI JSON을 쿼리 파라미터로 공유할 수 있는 현대적인 Swagger 에디터. 실시간 미리보기와 인터랙티브 API 테스트 기능을 제공합니다.',
  keywords: [
    'swagger', 
    'openapi', 
    'api-documentation', 
    'json-editor', 
    'shareable-links',
    'api-design',
    'swagger-ui',
    'openapi-editor'
  ],
  authors: [{ name: 'Swagger Editor Team' }],
  creator: 'Swagger Editor',
  publisher: 'Swagger Editor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://swagger-editor-shareable.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Shareable Swagger Editor',
    description: 'OpenAPI JSON을 쿼리 파라미터로 공유할 수 있는 현대적인 Swagger 에디터',
    url: 'https://swagger-editor-shareable.vercel.app',
    siteName: 'Shareable Swagger Editor',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shareable Swagger Editor',
    description: 'OpenAPI JSON을 쿼리 파라미터로 공유할 수 있는 현대적인 Swagger 에디터',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}