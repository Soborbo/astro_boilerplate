import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site.config';

export const GET: APIRoute = () => {
  const { name, tagline, company, url, seo } = siteConfig;
  
  const llmsTxt = `# ${name}

> ${tagline}

${seo.defaultDescription}

## Kapcsolat

- **Cégnév**: ${company.legalName}
- **Telefon**: ${company.contact.phone}
- **Email**: ${company.contact.email}
- **Cím**: ${company.address.street}, ${company.address.postalCode} ${company.address.city}, ${company.address.countryName}

## Nyitvatartás

${company.openingHours.map(oh => `- ${oh.days}: ${oh.hours}`).join('\n')}

## Szolgáltatások

<!-- TESTRE SZABANDÓ: Add hozzá a szolgáltatásaidat -->
- [Szolgáltatás 1](${url}/szolgaltatas-1): Rövid leírás
- [Szolgáltatás 2](${url}/szolgaltatas-2): Rövid leírás
- [Szolgáltatás 3](${url}/szolgaltatas-3): Rövid leírás

## Fontos oldalak

- [Főoldal](${url}/)
- [Árak](${url}/arak)
- [Rólunk](${url}/rolunk)
- [Kapcsolat](${url}/kapcsolat)
- [GYIK](${url}/gyik)

## Közösségi média

${company.social.facebook ? `- [Facebook](${company.social.facebook})` : ''}
${company.social.instagram ? `- [Instagram](${company.social.instagram})` : ''}
${company.social.linkedin ? `- [LinkedIn](${company.social.linkedin})` : ''}

## Jogi információk

- Cégjegyzékszám: ${company.registrationNumber}
- Adószám: ${company.vatNumber}
`;

  return new Response(llmsTxt.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
