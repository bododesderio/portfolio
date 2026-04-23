/**
 * Login layout — overrides the parent admin shell so the login page renders
 * with no sidebar/topbar/breadcrumb. Root layout still provides <html>/<body>,
 * fonts, theme provider, toaster, and JSON-LD.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
