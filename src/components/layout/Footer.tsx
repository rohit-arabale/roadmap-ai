import { motion } from 'framer-motion';
import { Compass, MessageCircle, Camera, Video, Rss } from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5Z" />
    </svg>
  );
}

interface FooterLinkData {
  label: string;
  href: string;
}

interface FooterColumnData {
  title: string;
  links: FooterLinkData[];
}

const footerColumns: FooterColumnData[] = [
  {
    title: 'Roadmap.ai',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Approach', href: '/approach' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Career Paths', href: '/roadmap' },
      { label: 'Success Stories', href: '/testimonials' },
      { label: 'Blog', href: '/blog' },
      { label: 'Webinars', href: '/webinars' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQs', href: '/faq' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Partnerships', href: '/partnerships' },
    ],
  },
];

const socialLinks: { Icon: React.ComponentType<{ className?: string }>; href: string; label: string }[] = [
  { Icon: MessageCircle, href: '/facebook', label: 'Facebook' },
  { Icon: Rss, href: '/twitter', label: 'Twitter' },
  { Icon: Camera, href: '/instagram', label: 'Instagram' },
  { Icon: Video, href: '/youtube', label: 'YouTube' },
  { Icon: GithubIcon, href: 'https://github.com/rohit-arabale', label: 'GitHub' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-brand-900 py-16 text-white sm:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(50% 60% at 15% 0%, rgba(45, 191, 165, 0.22) 0%, rgba(45, 191, 165, 0) 65%), radial-gradient(45% 50% at 100% 100%, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0) 65%)',
        }}
      />

      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <motion.div
            className="space-y-4 lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-amber-300 ring-1 ring-inset ring-white/15">
                <Compass className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                Roadmap<span className="text-amber-300">.ai</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-teal-100/70">
              AI-guided roadmaps, progress tracking, and resume tools to help you get to your next role with a clear plan.
            </p>
          </motion.div>

          {footerColumns.map((column, index) => (
            <motion.div
              key={column.title}
              className="space-y-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * (index + 1) }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300/90">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block text-sm text-teal-100/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300/90">Connect</h3>
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-teal-100/80 transition-colors duration-200 hover:border-amber-300/50 hover:text-amber-300"
                  aria-label={label}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ y: -2 }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex flex-col items-center gap-2 border-t border-white/10 pt-8 text-center sm:flex-row sm:justify-between sm:text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-teal-100/60">
            &copy; {currentYear} <span className="font-medium text-teal-100/85">Roadmap.ai</span>. All rights reserved.
          </p>
          <p className="text-xs text-teal-100/50">
            Designed &amp; built by{' '}
            <a
              href="https://github.com/rohit-arabale"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-teal-100/80 underline decoration-teal-100/30 underline-offset-2 transition-colors hover:text-amber-300 hover:decoration-amber-300/60"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              Rohit Arabale
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
