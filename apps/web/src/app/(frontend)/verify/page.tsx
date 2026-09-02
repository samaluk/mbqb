import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

import { VerifyForm } from './VerifyForm'

export const metadata = { title: 'Verify Membership' }

export default function VerifyPage() {
  return (
    <PageShell className="grid grid-cols-verify items-start gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-4">
      <div>
        <PageKicker>Membership</PageKicker>
        <PageTitle>Verify active membership.</PageTitle>
        <PageLede>
          Enter a member identifier to confirm active community membership status. The public result
          never exposes member names or internal details.
        </PageLede>
      </div>
      <VerifyForm />
    </PageShell>
  )
}
