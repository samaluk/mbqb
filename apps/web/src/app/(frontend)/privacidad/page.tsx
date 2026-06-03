import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

export default function PrivacidadPage() {
  return (
    <PageShell>
      <PageKicker>Privacidad</PageKicker>
      <PageTitle>Privacidad y servicios externos.</PageTitle>
      <PageLede>
        MBQB usa proveedores de hosting, base de datos, medios, analitica anonima, embeds de YouTube
        y enlaces a WhatsApp para operar el sitio.
      </PageLede>
    </PageShell>
  )
}
