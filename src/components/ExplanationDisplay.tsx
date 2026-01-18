import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { loadLanguage, hljs } from '../utils/highlightLoader';
import 'highlight.js/styles/github-dark.css';
import './ExplanationDisplay.css';

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
		const highlightCode = async () => {
			if (codeBlockRef.current && explanation.language) {
				await loadLanguage(explanation.language);
				const codeElement = codeBlockRef.current.querySelector('code');
				if (codeElement) {
					hljs.highlightElement(codeElement);
				}
			}
		};

		highlightCode();
	}, [explanation.code, explanation.language]);

	return (
		<div className="explanation-display">
			<div className="code-panel" role="region" aria-label="Code display">
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

			<div className="explanation-panel" role="region" aria-label="Code explanation">
				<div className="panel-header">
					<span className="panel-title">Explanation</span>
				</div>
				<div className="explanation-content">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={
							{
								code(props) {
									const { className, children, ...rest } = props;
									const match = /language-(\w+)/.exec(className || '');
									const lang = match ? match[1] : '';
									const inline = 'inline' in rest && rest.inline;

									if (!inline && lang) {
										return (
											<code className={className} {...rest} ref={(codeEl) => {
												if (codeEl) hljs.highlightElement(codeEl);
											}}>
												{children}
											</code>
										);
									}

									return <code className={className} {...rest}>{children}</code>;
								},
							} as Components
						}
					>
						{explanation.explanation}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
