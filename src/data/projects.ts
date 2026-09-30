export interface Project {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  company: string;
  category: string;
  period: string;
  theme: string;
  visual: 'agents' | 'performance' | 'memory' | 'billing' | 'retrieval';
  description: string;
  contribution: string;
  tags: string[];
  takeaway: string;
  sections: { label: string; title: string; paragraphs: string[] }[];
  outcomes: string[];
  evidenceNote?: string;
}

export const projects: Project[] = [
  {
    slug: 'agents-in-the-real-world',
    number: '01',
    title: 'AI that meets people where they work.',
    shortTitle: 'Agents, out in the world.',
    company: 'Notch',
    category: 'AI product engineering',
    period: '2026',
    theme: 'slate',
    visual: 'agents',
    description:
      'Bringing a creative agent into MCP hosts and Slack. In August 2026, MCP-origin sessions produced 1,326 completed ads.',
    contribution:
      'Full-stack implementation across agent tools, external-host interfaces, identity and asynchronous status delivery.',
    tags: ['MCP', 'Slack', 'TypeScript', 'Agent workflows'],
    takeaway:
      'A good agent interface makes the next step obvious, even when the work takes minutes.',
    sections: [
      {
        label: 'The problem',
        title: 'A model response is only part of the experience.',
        paragraphs: [
          'Generating an ad is a long-running workflow. Inside an external chat host, users need to know whether the agent is working, waiting for an answer or blocked. Repeated tool calls made progress noisy, while different host capabilities made the same result card behave differently.',
          'There was also a more important question than which model to call: which workspace owns this work, and whose credits should it use?',
        ],
      },
      {
        label: 'My contribution',
        title: 'Follow the work, preserve the context.',
        paragraphs: [
          'I implemented self-updating result cards, host-specific compatibility handling and structured credit-block responses. Where supported, the card followed progress itself; when it stopped, the conversation could resume following the run.',
          'For Slack, I worked on mapping messages to real users and routing responses by turn identity. Concurrent requests needed their own threads, and a failed handoff could not leave a conversation mapped to a session that never started.',
          'The experience included explicit workspace selection, useful recovery actions and rich creative results. The UI had to tell the truth about whether a message had actually been processed.',
        ],
      },
      {
        label: 'The judgment call',
        title: 'Fallbacks need a reason.',
        paragraphs: [
          'A rich-message fallback is helpful when a platform rejects a layout. It is risky after an ambiguous network failure: the first message may already have arrived. I narrowed retries to the failures where a second attempt was justified.',
          'Interoperability meant checking capabilities and preserving a working fallback, rather than assuming every host implemented the same interface.',
        ],
      },
    ],
    outcomes: [
      'The MCP integration I contributed to supported 1,326 completed ads in August 2026: 1,189 static ads and 137 video ads.',
      'Result cards followed generation progress and surfaced workspace selection, credit blocks and recovery actions inside the host.',
      'Concurrent Slack requests retained separate thread identities; failed handoffs did not leave a conversation attached to a session that never started.',
    ],
    evidenceNote:
      'Evidence: internal production usage analysis for August 2026, attributing completed ads to MCP-origin sessions. The count excludes repeat render versions and describes usage of a product built by a team.',
  },
  {
    slug: 'a-conversation-that-keeps-up',
    number: '02',
    title: 'A conversation that keeps up.',
    shortTitle: 'Make the long chat feel light.',
    company: 'Notch',
    category: 'Performance & interaction',
    period: '2026',
    theme: 'ink',
    visual: 'performance',
    description:
      'Reduced cold timeline-row derivation from 268 ms to 2.4 ms on a 3,150-item benchmark, alongside rendering and history-loading fixes.',
    contribution:
      'Investigation and implementation across React rendering, timeline derivation and paginated history delivery.',
    tags: ['React', 'Virtualization', 'Profiling', 'WebSockets'],
    takeaway:
      'The number of messages was the wrong measure. The cost of each message was the clue.',
    sections: [
      {
        label: 'The problem',
        title: 'Hidden content was still doing work.',
        paragraphs: [
          'A long conversation became unresponsive when opened. The text was not the main cost: its activity history held media elements and complex previews. Collapsed sections hid their contents visually while keeping those elements mounted.',
          'Rendering the whole timeline and transferring the full history added separate costs. Fixing just one would leave the others behind.',
        ],
      },
      {
        label: 'My contribution',
        title: 'Bound the work at three different layers.',
        paragraphs: [
          'I unmounted collapsed activity content, virtualized the timeline and introduced a recent-history snapshot with older turns loaded incrementally. Page boundaries preserved complete user turns so related cards stayed together.',
          'Profiling then exposed repeated derived work. A helper was rebuilding a shared media index for individual items. Caching pure calculations by timeline identity let the row model and rendering reuse the same result.',
          'Malformed preview data also needed isolation. One unreadable row should not prevent the rest of the conversation from loading.',
        ],
      },
      {
        label: 'The tradeoff',
        title: 'Fast, with the behavior accounted for.',
        paragraphs: [
          'Unmounting removed a collapse animation. Loading partial history changed when older choices appeared. I treated those as explicit behavior changes and retained a way to disable history paging independently.',
          'On a 3,150-item benchmark, cold timeline-row derivation fell from 268 ms to 2.4 ms. That is a measurement of one function, not a claim that the entire application became 112 times faster.',
        ],
      },
    ],
    outcomes: [
      'Reduced cold timeline-row derivation from 268 ms to 2.4 ms on the same 3,150-item benchmark.',
      'The original branch froze on a staging clone of the affected conversation; the changed branch remained usable with the same messages and media.',
      'Collapsed activity stopped mounting media, the timeline rendered a bounded window, and older history loaded incrementally.',
    ],
    evidenceNote:
      'Evidence: before-and-after function timings and a staging reproduction recorded during implementation. The timing measures timeline-row derivation, not overall page-load time or production-wide latency.',
  },
  {
    slug: 'memory-with-a-paper-trail',
    number: '03',
    title: 'Memory with a paper trail.',
    shortTitle: 'Make the knowledge visible.',
    company: 'Notch',
    category: 'Knowledge & agent systems',
    period: '2026',
    theme: 'graphite',
    visual: 'memory',
    description:
      'Built document-to-memory workflows supporting eight upload formats and files up to 50 MB, with visible processing and explicit saves.',
    contribution:
      'Document ingestion, explicit memory writes, persistent import feedback and referenced brand-knowledge interfaces.',
    tags: ['Agent memory', 'Async jobs', 'Provenance', 'Full-stack'],
    takeaway: 'Reading a document, remembering it and using it are three different decisions.',
    sections: [
      {
        label: 'The problem',
        title: '“Uploaded” did not mean “understood.”',
        paragraphs: [
          'Users could provide a document without a clear view of what happened next. Background work needed visible progress, and the resulting memory needed more than a list of filenames.',
          'Automatic persistence also creates a product problem: not everything shared in a conversation belongs in a brand’s long-term knowledge.',
        ],
      },
      {
        label: 'My contribution',
        title: 'Separate the steps. Show the outcome.',
        paragraphs: [
          'I worked on document uploads, bounded text extraction and an explicit save-to-memory flow. Import jobs reported what was created, updated, skipped or failed, including individual documents inside an archive.',
          'Creating a durable job before handing off work made downstream failures visible and retryable. A successful import that found nothing useful was represented differently from an error.',
          'I also built knowledge views that paired live structured records with generated prose and references. A later revision made rewriting explicit, with an update-available state when the underlying content changed.',
        ],
      },
      {
        label: 'The judgment call',
        title: 'Generation should have a clear owner.',
        paragraphs: [
          'Opening a knowledge page should be a read. Generating a new synthesis should be an intentional action with a visible result. That boundary made the experience easier to reason about and avoided unnecessary regeneration.',
          'Deterministic structure kept the page useful even before prose generation succeeded. The model enriched the interface without becoming its only source of coherence.',
        ],
      },
    ],
    outcomes: [
      'Added support for eight upload formats—PDF, DOCX, RTF, TXT, Markdown, CSV, JSON and ZIP—with a 50 MB upload limit.',
      'Imports reported created, updated, skipped and failed documents, including individual files within an archive; failures remained visible for retry.',
      'Reading a document kept it in temporary context until an explicit save. Generated summaries linked back to the underlying knowledge records.',
    ],
    evidenceNote:
      'Evidence: the shipped upload contract and import workflow. The format count and size limit describe supported capability; adoption and time saved were not measured in this case study.',
  },
  {
    slug: 'money-access-and-state',
    number: '04',
    title: 'Money, access and the state between.',
    shortTitle: 'Keep the promises consistent.',
    company: 'Notch',
    category: 'Backend & product systems',
    period: '2026',
    theme: 'stone',
    visual: 'billing',
    description:
      'Keeping subscriptions, purchased credits and agent access consistent through retries and changing plans.',
    contribution:
      'Subscription and entitlement workflows, atomic capacity checks, persistent credits and customer-facing billing flows.',
    tags: ['Stripe', 'PostgreSQL', 'Concurrency', 'State machines'],
    takeaway:
      'A payment, an entitlement and permission to run are related facts. They are not the same fact.',
    sections: [
      {
        label: 'The problem',
        title: 'Pricing changes travel through the whole product.',
        paragraphs: [
          'Trials, paid add-ons, bundled agents and top-up credits each affected checkout, database state, runtime access and the interface. A retry or a partial failure could leave those surfaces telling different stories.',
          'Checking a limit before creating a resource was not enough when two requests could pass that check together.',
        ],
      },
      {
        label: 'My contribution',
        title: 'Make the invariants explicit.',
        paragraphs: [
          'I implemented billing and entitlement changes across service boundaries and customer-facing flows. Atomic checks protected capacity during concurrent provisioning, while reconciliation handled plan changes.',
          'Payment operations needed idempotency and a compensation path when a later step failed. Cancellation could not report success while a billing update had failed elsewhere.',
          'For top-up credits, I used a persistent ledger with deduplicated writes, a clear spend order and consumption that stayed correct across monthly resets.',
        ],
      },
      {
        label: 'The tradeoff',
        title: 'Design for the gap between systems.',
        paragraphs: [
          'A payment provider and an application database cannot share a local transaction. The design needs a way to recognize an incomplete operation, retry safely or compensate.',
          'I worked backward from the guarantees customers needed: purchased credits remain available, plan changes reconcile correctly and a retry does not create a duplicate charge.',
        ],
      },
    ],
    outcomes: [
      'Capacity checks ran atomically with provisioning, closing the gap where concurrent requests could both pass the same limit check.',
      'Billing retries reused idempotency keys, and later-step failures had a compensation path. Cancellation did not report success after a failed billing update.',
      'Top-up credits used deduplicated ledger entries and remained available across monthly renewals, with an explicit spend order.',
    ],
  },
  {
    slug: 'code-with-context',
    number: '05',
    title: 'Code suggestions that know the project.',
    shortTitle: 'Give the prompt a codebase.',
    company: 'DhiWise · WiseGPT',
    category: 'Developer tools & retrieval',
    period: '2023–2025',
    theme: 'smoke',
    visual: 'retrieval',
    description:
      'A VS Code assistant grounded in a developer’s project, supported by retrieval and embedding pipelines.',
    contribution:
      'AI coding-assistant development, code-context retrieval, embedding pipelines and Python/Node.js backend services.',
    tags: ['RAG', 'Embeddings', 'VS Code', 'Python'],
    takeaway:
      'Useful code generation starts before the model call, with the context you can give it.',
    sections: [
      {
        label: 'The problem',
        title: 'A prompt cannot describe every convention.',
        paragraphs: [
          'A developer’s project contains patterns and relationships that a standalone question leaves out. Personalized suggestions require a way to find the relevant code and bring that context into the generation workflow.',
        ],
      },
      {
        label: 'My contribution',
        title: 'Connect the editor to the project’s knowledge.',
        paragraphs: [
          'At DhiWise, I built WiseGPT, an AI-powered VS Code extension for generating code from the developer’s own project context.',
          'My work included vector-embedding and retrieval pipelines combining full-text search and nearest-neighbor retrieval, with recursive embeddings representing relationships across the codebase.',
          'I also developed Python and Node.js backend services that supported the generative AI workflow.',
        ],
      },
      {
        label: 'The lesson',
        title: 'Retrieval is part of the product.',
        paragraphs: [
          'Working on code-context systems shaped how I approach agent memory today. What enters the model’s context matters as much as the phrasing of the prompt.',
          'The editor, retrieval service and generation step had to work together as one developer experience, with project context carried through each boundary.',
        ],
      },
    ],
    outcomes: [
      'Delivered code generation inside VS Code using context retrieved from the developer’s own project.',
      'Combined full-text search and nearest-neighbor retrieval to supply relevant code to the generation workflow.',
      'Connected the editor, retrieval pipeline and Python/Node.js services into a single code-suggestion workflow.',
    ],
  },
];
