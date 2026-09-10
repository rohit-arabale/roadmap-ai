import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function SimpleMarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="text-sm leading-relaxed sm:text-base max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold text-brand-700">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 text-xl font-bold text-brand-700">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 text-lg font-bold text-brand-700">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold text-brand-600">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
          code: ({ children }) => (
            <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">{children}</code>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
