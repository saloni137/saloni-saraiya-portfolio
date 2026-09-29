import type { APIRoute } from 'astro';
import { experience, profile, skills } from '../data/profile';
import { projects } from '../data/projects';

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const content = `# ${profile.name}

> ${profile.description}

Saloni has worked in software engineering since 2020 and in applied AI since 2023. Her work spans product interfaces, backend services, AI workflows and production reliability.

Experience:
${experience.map((job) => `- ${job.role} at ${job.company} (${job.dates}): ${job.summary}`).join('\n')}

Skills: ${skills.flatMap((group) => group.items).join(', ')}.

At Agentic Studio, Saloni contributed to EasyGen from the start, working across most features. The portfolio describes her contributions within teams. The confidential freelance project is anonymized; client identity and implementation details are not public. Case-study diagrams are conceptual illustrations, not product screenshots. Performance measurements are scoped to the specific benchmark described in the relevant case study.

## Portfolio

- [Homepage](${url('/')}): Introduction, selected work, engineering notes and contact details.
- [Resume](${url('/resume/')}): Career history, contributions, skills and education; includes a printable version.

## Case studies

${projects.map((project) => `- [${project.title}](${url(`/work/${project.slug}/`)}): ${project.description} Contribution: ${project.contribution}`).join('\n')}

## Contact

- [Email Saloni](mailto:${profile.email}): Professional inquiries.
- [Book a 30-minute conversation](${profile.calendly}): Availability and scheduling.
- [LinkedIn](${profile.linkedin}): Professional profile.
- [GitHub](${profile.github}): Public repositories.

## Optional

- [EasyGen](https://easygen.io/): Public product Saloni contributed to while at Agentic Studio.
- [Sitemap](${url('/sitemap.xml')}): Index of public portfolio pages.
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
