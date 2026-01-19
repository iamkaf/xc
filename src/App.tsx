import { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { InputView } from './routes/InputView';
import { ExplanationView } from './routes/ExplanationView';
import { HistoryPanel } from './components/HistoryPanel';
import './App.css';

interface Explanation {
	id: string;
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

	const handleExplain = useCallback(async (code: string, language: string, onNavigate?: (id: string) => void) => {
		setIsLoading(true);
		setError(null);

		// Create a new explanation with empty content immediately
		const newExplanation: Explanation = {
			id: Date.now().toString(),
			code,
			language,
			explanation: '',
			timestamp: Date.now(),
		};

		setExplanations(prev => [newExplanation, ...prev]);

		try {
			const response = await fetch('/api/explain', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, language }),
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

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				// SSE format can have multi-line JSON, so we need to accumulate data: "data: {...json}"
				// We'll process each SSE message by accumulating lines until we get complete JSON
				let sseMessage = '';

				for (const line of lines) {
					if (!line) continue;

					if (line.startsWith('data: ')) {
						// Start of a new SSE message
						sseMessage = line.slice(5); // Everything after "data:"
					} else if (sseMessage) {
						// Continuation of the SSE message
						sseMessage += '\n' + line;
					} else {
						// Not SSE data (shouldn't happen in well-formed SSE)
						continue;
					}

					// Check if we have a complete SSE message
					if (sseMessage.trim().endsWith('}')) {
						try {
							const parsed = JSON.parse(sseMessage);
							const content = parsed.choices?.[0]?.delta?.content;
							if (content) {
								setExplanations(prev =>
									prev.map(exp =>
										exp.id === newExplanation.id
											? { ...exp, explanation: exp.explanation + content }
											: exp
									)
								);
							}
						} catch (e) {
							// If JSON parsing fails, log the raw message for debugging
							console.warn('Failed to parse SSE message:', sseMessage, e);
						}
						sseMessage = ''; // Reset for next message
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
