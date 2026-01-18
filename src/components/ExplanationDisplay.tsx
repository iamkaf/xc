import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';
import './ExplanationDisplay.css';

// Register languages for highlighting
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);

interface ExplanationDisplayProps {
	explanation: {
		code: string;
		language: string;
		explanation: string;
	};
}

export function ExplanationDisplay({ explanation }: ExplanationDisplayProps) {
	const codeBlockRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		// Highlight the main code block
		if (codeBlockRef.current) {
			const codeElement = codeBlockRef.current.querySelector('code');
			if (codeElement) {
				hljs.highlightElement(codeElement);
			}
		}
	}, [explanation.code, explanation.language]);

	return (
		<div className="explanation-display">
			<div className="code-panel">
				<div className="panel-header">
					<span className="panel-title">Code</span>
					<span className="language-badge">{explanation.language}</span>
				</div>
				<pre ref={codeBlockRef} className="code-block">
					<code className={`language-${explanation.language}`}>
						{explanation.code}
					</code>
				</pre>
			</div>

			<div className="explanation-panel">
				<div className="panel-header">
					<span className="panel-title">Explanation</span>
				</div>
				<div className="explanation-content">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={{
							code({ node, inline, className, children, ...props }) {
								const match = /language-(\w+)/.exec(className || '');
								const lang = match ? match[1] : '';

								if (!inline && lang) {
									return (
										<code className={className} {...props} ref={(codeEl) => {
											if (codeEl) hljs.highlightElement(codeEl);
										}}>
											{children}
										</code>
									);
								}

								return <code className={className} {...props}>{children}</code>;
							},
						}}
					>
						{explanation.explanation}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
