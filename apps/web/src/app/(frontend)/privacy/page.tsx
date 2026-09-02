import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageKicker>Privacy</PageKicker>
      <PageTitle>Privacy policy.</PageTitle>
      <PageLede>
        This platform uses essential hosting, database, media, anonymous analytics, and external
        integrations to operate the site.
      </PageLede>
    </PageShell>
  )
}
