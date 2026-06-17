import React from 'react'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import SiteLayoutGrid from '../SiteLayoutGrid/SiteLayoutGrid'
import { AuthProvider } from '../auth/AuthProvider/AuthProvider'
import { getLayoutShellData } from '@/lib/sidebar'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

type Props = {
  children: React.ReactNode
}

export default async function SiteLayoutShell({ children }: Props) {
  const [{ sidebarData, categories, adminUrl }, currentUser] = await Promise.all([
    getLayoutShellData(),
    getCurrentUser(),
  ])

  const initialUser = currentUser
    ? {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role,
      preferences: currentUser.preferences,
      savedArticles: currentUser.savedArticles,
    }
    : null

  return (
    <AuthProvider initialUser={initialUser}>
      <Navbar adminUrl={adminUrl} categories={categories} />
      <SiteLayoutGrid sidebarData={sidebarData}>{children}</SiteLayoutGrid>
      <Footer />
    </AuthProvider>
  )
}
