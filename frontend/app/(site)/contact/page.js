import ContactForm from '@/components/site/ContactForm';
import { PageHeader } from '@/components/site/Bits';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Contact us',
  description: 'Send a story tip, a correction or a partnership enquiry to The National Mail newsroom.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact the newsroom" description="Story tips, corrections, partnerships or a hello. Our team replies within two working days." color="#B4232A" />
      <div className="container-site grid gap-14 py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="space-y-8 lg:col-span-5">
          <div>
            <h2 className="font-serif text-xl font-semibold">Email</h2>
            <p className="mt-1 text-ink-700">
              <a href={`mailto:${site.email}`} className="text-post hover:underline">{site.email}</a>
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold">Corrections</h2>
            <p className="mt-1 text-ink-700">Spotted an error? Include the story link and what needs fixing. We update the story and note the change.</p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold">Newsroom</h2>
            <p className="mt-1 text-ink-700">The National Mail<br />Indore, Madhya Pradesh, India</p>
          </div>
        </aside>
      </div>
    </>
  );
}
