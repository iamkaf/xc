import { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { InputView } from './routes/InputView';
import { ExplanationView } from './routes/ExplanationView';
import { HistoryPanel } from './components/HistoryPanel';
import './App.css';

interface Explanation {
	id: string;
	title?: string;
	code: string;
	language: string;
	explanation: string;
	timestamp: number;
}

const STORAGE_KEY = 'xc-history';

// Simple debounce hook
function useDebounce<T extends (...args: never[]) => void>(callback: T, delay: number): T {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	return useCallback((...args: Parameters<T>) => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => callback(...args), delay);
	}, [callback, delay]) as T;
}

interface LayoutProps {
	explanations: Explanation[];
	children: React.ReactNode;
}

function Layout({ explanations, children }: LayoutProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const hamburgerRef = useRef<HTMLButtonElement>(null);

	const closeMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(false);
		hamburgerRef.current?.focus();
	}, []);

	return (
		<div className="app">
			<header className="app-header">
				<button
					ref={hamburgerRef}
					className="hamburger-button"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					aria-label="Toggle menu"
				>
					{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
				<a href="/" className="app-title" aria-label="Go back to input">
					XC
				</a>
			</header>

			<div className="app-layout">
				{isMobileMenuOpen && (
					<div
						className="mobile-drawer-overlay"
						onClick={closeMobileMenu}
					/>
				)}

				<aside className={`history-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
					<HistoryPanel explanations={explanations} />
				</aside>

				<main className="main-content">
					{children}
				</main>
			</div>
		</div>
	);
}

function App() {
	const [explanations, setExplanations] = useState<Explanation[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Debounced save function
	const debouncedSave = useDebounce((data: Explanation[]) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch (error) {
			console.error('Failed to save history:', error);
		}
	}, 500);

	// Load history from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as Explanation[];
				setExplanations(parsed);
			}
		} catch (error) {
			console.error('Failed to load history:', error);
		}
	}, []);

	// Save history to localStorage whenever it changes (debounced)
	useEffect(() => {
		if (explanations.length > 0) {
			debouncedSave(explanations);
		}
	}, [explanations, debouncedSave]);

	const handleExplain = useCallback(async (code: string, initialLanguage: string, onNavigate?: (id: string) => void) => {
		setIsLoading(true);
		setError(null);

		// Create a new explanation with empty content immediately
		const newExplanation: Explanation = {
			id: Date.now().toString(),
			code,
			language: initialLanguage,
			explanation: '',
			timestamp: Date.now(),
		};

		setExplanations(prev => [newExplanation, ...prev]);

		try {
			const response = await fetch('/api/explain', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, language: initialLanguage }),
			});

			if (!response.ok) {
				const data = await response.json() as { error?: string };
				throw new Error(data.error || `Server error: ${response.status}`);
			}

			// Read the stream
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('No response body');
			}

			let accumulatedJson = '';
			let sseBuffer = '';
			let streamBuffer = '';

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				streamBuffer += chunk;
				const lines = streamBuffer.split('\n');
				streamBuffer = lines.pop() || '';

				for (const line of lines) {
					if (!line) continue;

					if (line.startsWith('data: ')) {
						sseBuffer = line.slice(5);
					} else if (sseBuffer) {
						sseBuffer += '\n' + line;
					} else {
						continue;
					}

					if (sseBuffer.trim().endsWith('}')) {
						try {
							const parsed = JSON.parse(sseBuffer);
							const content = parsed.choices?.[0]?.delta?.content;
							
							if (content) {
								accumulatedJson += content;

								// Extract fields from the accumulated JSON string
								let title = '';
								let language = initialLanguage;
								let explanation = '';

								// Extract title (regex to match "title": "...")
								const titleMatch = /"title"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(accumulatedJson);
								if (titleMatch) title = titleMatch[1];

								// Extract language
								const langMatch = /"language"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(accumulatedJson);
								if (langMatch) language = langMatch[1];

								// Extract explanation
								const expMatch = /"explanation"\s*:\s*"/.exec(accumulatedJson);
								if (expMatch) {
									const startIndex = expMatch.index + expMatch[0].length;
									let contentSlice = accumulatedJson.slice(startIndex);
									
									// Try to find the end of the JSON string
									// We look for the sequence quote + optional space + closing brace
									// But strictly speaking, we just want to render what we have so far
									// taking care of escaped characters.
									
									// If the JSON is complete or this field is closed, we might see `"` followed by `}` or `,`
									// Since "explanation" is the last field, we look for `"}`
									const endMatch = /"[\s\r\n]*}/.exec(contentSlice);
									if (endMatch) {
										contentSlice = contentSlice.slice(0, endMatch.index);
									}
									
									// decode the partial string
									explanation = contentSlice
										.replace(/\\n/g, '\n')
										.replace(/\\"/g, '"')
										.replace(/\\\\/g, '\\')
										.replace(/\\t/g, '\t');
								}

								setExplanations(prev =>
									prev.map(exp =>
										exp.id === newExplanation.id
											? { ...exp, title, language, explanation }
											: exp
									)
								);
							}
						} catch (e) {
							console.warn('Failed to parse SSE message:', sseBuffer, e);
						}
						sseBuffer = '';
					}
				}
			}

			// Trigger navigation callback after streaming completes
			if (onNavigate) {
				onNavigate(newExplanation.id);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to get explanation';
			setError(message);
			// Remove the failed explanation from history
			setExplanations(prev => prev.filter(exp => exp.id !== newExplanation.id));
		} finally {
			setIsLoading(false);
		}
	}, []);

	return (
		<BrowserRouter>
			<Layout explanations={explanations}>
				<Routes>
					<Route path="/" element={<InputView onExplain={handleExplain} isLoading={isLoading} error={error} />} />
					<Route path="/explain/:id" element={<ExplanationView explanations={explanations} />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
}

export default App;
