import { useMemo } from 'react';
import './CodeTheme.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function CodeBlock({ code, language = 'javascript', showLineNumbers = false }: CodeBlockProps) {
  const languageClass = `language-${language}`;

  const codeLines = useMemo((): string[] => {
    if (!code) return [];
    return code.split('\n');
  }, [code]);

  const highlightedCode = useMemo((): string[] => {
    if (!code) return [];
    return codeLines.map((line: string): string => {
      const escaped = escapeHtml(line);
      let highlightedLine = escaped;

      if (language === 'javascript' || language === 'jsx' || language === 'typescript' || language === 'tsx') {
        highlightedLine = highlightedLine.replace(
          /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|extends|async|await)\b/g,
          '<span class="token keyword">$1</span>'
        );
        highlightedLine = highlightedLine.replace(
          /(&quot;|&#039;|`)(.*?)\1/g,
          '<span class="token string">$1$2$1</span>'
        );
        highlightedLine = highlightedLine.replace(
          /(\/\/.*)/g,
          '<span class="token comment">$1</span>'
        );
        highlightedLine = highlightedLine.replace(
          /\b(\d+)\b/g,
          '<span class="token number">$1</span>'
        );
      } else if (language === 'html' || language === 'xml') {
        highlightedLine = highlightedLine.replace(
          /(&lt;[/\w\s]*&gt;)/g,
          '<span class="token tag">$1</span>'
        );
      }

      return highlightedLine;
    });
  }, [codeLines, language, code]);

  if (!code) return null;

  return (
    <div className="code-block-wrapper rounded-lg overflow-hidden font-mono text-sm">
      <div className="flex">
        {showLineNumbers && (
          <div className="line-numbers py-3 px-2 text-right select-none bg-gray-800 text-gray-500">
            {codeLines.map((_, i) => (
              <div key={i} className="line-number">{i + 1}</div>
            ))}
          </div>
        )}
        <pre className="flex-1 overflow-x-auto p-3 bg-gray-900 text-gray-200" tabIndex={0} aria-label={`Code block in ${language}`}>
          <code className={languageClass}>
            {highlightedCode.map((line, i) => (
              <div key={i} className="code-line" dangerouslySetInnerHTML={{ __html: line || ' ' }} />
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
