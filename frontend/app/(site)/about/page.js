import Link from 'next/link';
import { PageHeader } from '@/components/site/Bits';
import { site } from '@/lib/site';

export const metadata = {
  title: 'About us',
  description: `What ${site.name} covers, how we report, and how to reach our newsroom.`,
  alternates: { canonical: '/about' },
};

const principles = [
  {
    title: 'We report on solutions, not just problems',
    body: 'Every story asks what is working, who made it work, and what it would take to repeat it somewhere else.',
  },
  {
    title: 'We go to the place',
    body: 'Our reporters travel to the village, the workshop or the classroom. If we have not seen it or spoken to the people involved, we do not publish it.',
  },
  {
    title: 'We show our numbers',
    body: 'When a story makes a claim about impact, we say where the number comes from and who measured it.',
  },
  {
    title: 'We correct mistakes in the open',
    body: 'If we get something wrong, we fix it and add a note to the story saying what changed.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About The National Mail" description={site.description} color="#B4232A" />
      <div className="container-site grid gap-14 py-14 lg:grid-cols-12">
        <div className="article-body prose prose-mail max-w-none lg:col-span-7">
          <p>
            The National Mail began with a simple observation: some of the most useful journalism in India is about people who are already fixing things.
            A retired postman running a mobile library. A village that brought its lake back. Two engineers who built a sensor farmers can actually afford.
          </p>
          <p>
            These stories rarely make the front page, but they travel. Readers share them with their families, copy the ideas in their own towns, and write to us
            asking how to help. We exist to find more of them, report them carefully, and deliver them to every pin code.
          </p>
          <h2>What we cover</h2>
          <p>
            Changemakers, the environment, innovation, rural India, culture and heritage, health, education and travel. Our reporters and contributors work
            from more than a dozen states, and a good share of our best stories come from readers.
          </p>
        </div>
        <aside className="lg:col-span-5">
          <h2 className="mb-6 font-serif text-2xl font-semibold">How we work</h2>
          <ul className="space-y-6">
            {principles.map((p) => (
              <li key={p.title} className="border-l-2 border-post pl-4">
                <h3 className="font-serif text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-ink-700">{p.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-lg bg-letter p-6">
            <h2 className="font-serif text-xl font-semibold">Know a story we should tell?</h2>
            <p className="mt-1 text-ink-700">Tell us who is involved and where. We read every message.</p>
            <Link href="/contact" className="btn-primary mt-4">Share a story</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
