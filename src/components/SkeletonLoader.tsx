import './ExplanationDisplay.css';

export function SkeletonLoader() {
	return (
		<div className="skeleton-loader">
			<div className="skeleton-panel">
				<div className="skeleton-header" />
				<div className="skeleton-lines">
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
				</div>
			</div>
			<div className="skeleton-panel">
				<div className="skeleton-header" />
				<div className="skeleton-lines">
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
					<div className="skeleton-line" />
				</div>
			</div>
		</div>
	);
}
