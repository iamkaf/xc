import { useState, useCallback, useRef } from 'react';
import { Code2, Loader2 } from 'lucide-react';
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
import './CodeInput.css';

// Register languages for auto-detection
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

interface CodeInputProps {
	onExplain: (code: string, language: string) => void;
	isLoading: boolean;
	compact?: boolean;
}

export function CodeInput({ onExplain, isLoading, compact = false }: CodeInputProps) {
	const [code, setCode] = useState('');
	const [language, setLanguage] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const detectLanguage = useCallback((code: string): string => {
		const result = hljs.highlightAuto(code);
		return result?.language || 'text';
	}, []);

	const handleCodeChange = useCallback((value: string) => {
		setCode(value);
		if (value.trim()) {
			setLanguage(detectLanguage(value));
		} else {
			setLanguage('');
		}
	}, [detectLanguage]);

	const handleExplain = useCallback(() => {
		if (code.trim() && language) {
			onExplain(code, language);
		}
	}, [code, language, onExplain]);

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			handleExplain();
		}
	}, [handleExplain]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith('text/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const content = event.target?.result as string;
				handleCodeChange(content);
			};
			reader.readAsText(file);
		}
	}, [handleCodeChange]);

	return (
		<div
			className={`code-input ${compact ? 'compact' : ''} ${isDragging ? 'dragging' : ''}`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{!compact && (
				<div className="code-input-header">
					<Code2 size={16} />
					<span>Paste code or drop a file</span>
					<kbd>Ctrl+Enter</kbd>
				</div>
			)}

			<textarea
				ref={textareaRef}
				value={code}
				onChange={(e) => handleCodeChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={compact ? 'Paste more code...' : '// Paste your code here...'}
				className="code-textarea"
				disabled={isLoading}
			/>

			<div className="code-input-footer">
				{language && (
					<span className="language-badge">
						{language}
					</span>
				)}

				<button
					onClick={handleExplain}
					disabled={!code.trim() || !language || isLoading}
					className="explain-button"
				>
					{isLoading ? (
						<>
							<Loader2 size={16} className="spinner" />
							Explaining...
						</>
					) : (
						'Explain'
					)}
				</button>
			</div>
		</div>
	);
}
