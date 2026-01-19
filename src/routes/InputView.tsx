import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeInput } from '../components/CodeInput';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface InputViewProps {
	onExplain: (code: string, language: string, onNavigate?: (id: string) => void) => Promise<void>;
	isLoading: boolean;
	error: string | null;
}

export function InputView({ onExplain, isLoading, error }: InputViewProps) {
	const navigate = useNavigate();

	const handleExplainWithNavigate = useCallback(async (code: string, language: string) => {
		// Pass a callback that will be called after streaming completes
		await onExplain(code, language, (id) => navigate(`/explain/${id}`));
	}, [onExplain, navigate]);

	return (
		<>
			{error && (
				<div className="error-banner">
					<span className="error-icon">⚠</span>
					<span>{error}</span>
				</div>
			)}

			{isLoading && <SkeletonLoader />}
			<CodeInput onExplain={handleExplainWithNavigate} isLoading={isLoading} />
		</>
	);
}
