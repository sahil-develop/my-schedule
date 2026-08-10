import Link from 'next/link';
import { Briefcase, Code2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tilt3D } from '@/components/marketing/Tilt3D';

const STACK: Record<string, string[]> = {
  Languages: ['JavaScript', 'TypeScript', 'Python'],
  Backend: ['Node.js', 'NestJS', 'Express', 'FastAPI', 'Django', 'Flask', 'GraphQL'],
  'AI / LLM': ['OpenAI', 'Groq', 'LangChain', 'ChromaDB', 'RAG', 'MCP', 'Tool Calling', 'Vector Databases'],
  'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
  Data: ['PostgreSQL', 'MongoDB', 'Redis', 'RabbitMQ'],
};

const PROJECTS = [
  {
    title: 'AI Order Chat System',
    description: 'Multi-tenant AI-powered customer support platform.',
    tags: ['Groq LLM', 'Tool Calling', 'ChromaDB (RAG)', 'Session Memory', 'Smart Order Cancellation'],
  },
  {
    title: 'ADR Automation Platform',
    description: 'Enterprise-grade dispute resolution platform supporting 25+ services.',
    tags: ['Case Management', 'RBAC', 'Billing & Invoicing', 'Zoom Integration', 'QuickBooks Integration'],
  },
  {
    title: 'HR Policy RAG System',
    description: 'AI assistant that answers HR policy questions via Retrieval-Augmented Generation.',
    tags: ['LangChain', 'ChromaDB', 'Semantic Search', 'LLM Integration'],
  },
];

const IMPACT = [
  { value: '27,000+', label: 'users served in production' },
  { value: '40%', label: 'faster API response times' },
  { value: '3+ yrs', label: 'shipping backend systems' },
  { value: '25+', label: 'services on one platform' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <section className="text-center">
        <Tilt3D max={6} className="mx-auto inline-block rounded-full">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-semibold text-white shadow-xl shadow-indigo-500/30">
            S
          </div>
        </Tilt3D>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Hi, I&apos;m Sahil 👋</h1>
        <p className="mt-2 text-lg font-medium text-primary">
          Backend Engineer • AI Engineer • Cloud &amp; Distributed Systems
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          I build scalable backend systems, event-driven microservices, and AI-powered applications that run in
          production — not just in notebooks.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" asChild>
            <a href="https://sahil-who-develops.vercel.app/" target="_blank" rel="noreferrer">
              <Globe className="h-4 w-4" />
              Portfolio
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://www.linkedin.com/in/sahil02824/" target="_blank" rel="noreferrer">
              <Briefcase className="h-4 w-4" />
              LinkedIn
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://github.com/sahil-develop" target="_blank" rel="noreferrer">
              <Code2 className="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Backend Engineer with <strong className="text-foreground">3+ years of experience</strong> designing and
          shipping scalable APIs, distributed systems, and cloud-native platforms. Over the last year, I&apos;ve been
          pushing that experience into AI — building production RAG pipelines, LLM-powered support systems, and
          tool-calling agents on top of the same backend fundamentals: reliability, observability, and clean
          architecture.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          I care about systems that hold up under real traffic, not just demos — this app is one of them.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {IMPACT.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
            <p className="text-2xl font-semibold text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Tech stack</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(STACK).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
              <p className="w-40 flex-shrink-0 text-sm font-medium text-muted-foreground">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Featured projects</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PROJECTS.map((project) => (
            <div key={project.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold">{project.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-indigo-500 to-violet-600 p-10 text-center shadow-xl shadow-indigo-500/20">
        <p className="text-lg font-medium text-white">
          Open to <strong>Backend Engineer</strong>, <strong>AI Engineer</strong>, <strong>Platform Engineer</strong>,
          and <strong>Cloud Engineering</strong> roles.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/pricing">Try Productivity OS</Link>
        </Button>
      </section>
    </div>
  );
}
