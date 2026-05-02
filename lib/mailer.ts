export async function sendBlockedClientAlert({
  name,
  email,
  title,
  startTime,
}: {
  name: string
  email: string
  title: string | null
  startTime: string | null
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const dateStr = startTime
    ? new Date(startTime).toLocaleString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        timeZone: 'Europe/Paris',
      })
    : 'Date inconnue'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Electrolyse Signature <noreply@electrolyse-signature.vercel.app>',
      to: ['electrolyse.signature@gmail.com'],
      subject: '⚠️ Nouvelle demande — client bloqué',
      html: `
        <p>Une cliente bloquée vient de prendre rendez-vous.</p>
        <ul>
          <li><strong>Nom :</strong> ${name}</li>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Prestation :</strong> ${title ?? '—'}</li>
          <li><strong>Date :</strong> ${dateStr}</li>
        </ul>
        <p>
          <a href="https://electrolyse-signature.vercel.app/admin/annulations">
            Voir le tableau de bord →
          </a>
        </p>
      `,
    }),
  })
}
