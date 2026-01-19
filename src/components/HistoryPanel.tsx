import { Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './HistoryPanel.css';

interface Explanation {
	id: string;
	code: string;
	language: string;
	explanation: string;
	timestamp: number;
}

interface HistoryPanelProps {
	explanations: Explanation[];
}

export function HistoryPanel({ explanations }: HistoryPanelProps) {
	const location = useLocation();

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
		return date.toLocaleDateString();
	};

	const getCodePreview = (code: string) => {
		const lines = code.trim().split('\n');
		return lines[0]?.substring(0, 40) + (lines[0]?.length > 40 ? '...' : '');
	};

	// Get current ID from URL path
	const getCurrentId = () => {
		const match = location.pathname.match(/\/explain\/(.+)/);
		return match ? match[1] : null;
	};

	return (
		<div className="history-panel">
			<div className="history-header">
				<Clock size={16} />
				<span>History</span>
			</div>

			{explanations.length === 0 ? (
				<div className="history-empty" role="status">
					No explanations yet
				</div>
			) : (
				<div className="history-list" role="listbox" aria-label="Explanation history">
					{explanations.map((explanation) => (
						<Link
							key={explanation.id}
							to={`/explain/${explanation.id}`}
							className={`history-item ${explanation.id === getCurrentId() ? 'selected' : ''}`}
							role="option"
							aria-selected={explanation.id === getCurrentId()}
							aria-label={`${explanation.language} code, ${formatTimestamp(explanation.timestamp)}`}
						>
							<div className="history-item-meta">
								<span className="history-language">{explanation.language}</span>
								<span className="history-time">{formatTimestamp(explanation.timestamp)}</span>
							</div>
							<div className="history-item-preview">{getCodePreview(explanation.code)}</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
