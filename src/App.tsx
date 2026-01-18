import { useState, useCallback, useEffect } from 'react';
import { AlertCircle, Menu, X } from 'lucide-react';
import { CodeInput } from './components/CodeInput';
import { ExplanationDisplay } from './components/ExplanationDisplay';
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

function App() {
	const [explanations, setExplanations] = useState<Explanation[]>([]);
	const [currentExplanation, setCurrentExplanation] = useState<Explanation | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

	// Save history to localStorage whenever it changes
	useEffect(() => {
		if (explanations.length > 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(explanations));
		}
	}, [explanations]);

	const handleExplain = useCallback(async (code: string, language: string) => {
		setIsLoading(true);
		setError(null);

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

			const data = await response.json() as { explanation: string };

			const newExplanation: Explanation = {
				id: Date.now().toString(),
				code,
				language,
				explanation: data.explanation,
				timestamp: Date.now(),
			};

			setExplanations(prev => [newExplanation, ...prev]);
			setCurrentExplanation(newExplanation);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to get explanation';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleSelectHistory = useCallback((explanation: Explanation) => {
		setCurrentExplanation(explanation);
		setError(null);
		setIsMobileMenuOpen(false);
	}, []);

	return (
		<div className="app">
			<header className="app-header">
				<button
					className="hamburger-button"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					aria-label="Toggle menu"
				>
					{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
				<h1 className="app-title">XC</h1>
			</header>

			<div className="app-layout">
				{isMobileMenuOpen && (
					<div
						className="mobile-drawer-overlay"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
				)}

				<aside className={`history-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
					<HistoryPanel
						explanations={explanations}
						onSelect={handleSelectHistory}
						selectedId={currentExplanation?.id}
					/>
				</aside>

				<main className="main-content">
					{error && (
						<div className="error-banner">
							<AlertCircle size={16} />
							<span>{error}</span>
						</div>
					)}

					{!currentExplanation ? (
						<CodeInput onExplain={handleExplain} isLoading={isLoading} />
					) : (
						<ExplanationDisplay explanation={currentExplanation} />
					)}

					{currentExplanation && (
						<div className="new-explanation-container">
							<CodeInput onExplain={handleExplain} isLoading={isLoading} compact />
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

export default App;
