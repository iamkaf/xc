import { useParams } from 'react-router-dom';
import { ExplanationDisplay } from '../components/ExplanationDisplay';

interface Explanation {
	id: string;
	code: string;
	language: string;
	explanation: string;
	timestamp: number;
}

interface ExplanationViewProps {
	explanations: Explanation[];
}

export function ExplanationView({ explanations }: ExplanationViewProps) {
	const { id } = useParams<{ id: string }>();

	const explanation = explanations.find(e => e.id === id);

	if (!explanation) {
		return (
			<div className="not-found">
				<h2>Explanation Not Found</h2>
				<p>This explanation doesn't exist or has been deleted.</p>
				<a href="/" className="back-button">
					Go Back Home
				</a>
			</div>
		);
	}

	return <ExplanationDisplay explanation={explanation} />;
}
