import { useState, useCallback, useRef } from 'react';
import { Code2, Loader2, Shuffle } from 'lucide-react';
import { hljs } from '../utils/highlightLoader';
import 'highlight.js/styles/github-dark.css';
import './CodeInput.css';

interface CodeExample {
	title: string;
	code: string;
}

const EXAMPLES: CodeExample[] = [
	{
		title: 'Gaming - XP System',
		code: `function calculateLevel(currentXP: number): number {
	const baseXP = 100;
	const growthFactor = 1.5;
	let level = 1;
	let requiredXP = baseXP;

	while (currentXP >= requiredXP) {
		currentXP -= requiredXP;
		level++;
		requiredXP = Math.floor(baseXP * Math.pow(growthFactor, level - 1));
	}

	return level;
}`
	},
	{
		title: 'Language Learning - Spaced Repetition',
		code: `class Flashcard {
	constructor(
		public word: string,
		public translation: string,
		private easeFactor: number = 2.5,
		private interval: number = 0,
		private repetitions: number = 0
	) {}

	review(quality: number): void {
		// quality: 0-5 (0=complete failure, 5=perfect response)
		if (quality >= 3) {
			this.repetitions++;
			this.interval = this.repetitions === 1
				? 1
				: this.repetitions === 2
				? 6
				: Math.round(this.interval * this.easeFactor);
		} else {
			this.repetitions = 0;
			this.interval = 1;
		}

		this.easeFactor = Math.max(
			1.3,
			this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
		);
	}

	getNextReviewDate(): Date {
		return new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);
	}
}`
	},
	{
		title: 'API - REST Endpoint',
		code: `app.get('/api/users/:id/posts', async (req, res) => {
	try {
		const { id } = req.params;
		const { limit = 10, offset = 0, sort = 'desc' } = req.query;

		// Validate user exists
		const user = await db.users.findOne({ id });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Fetch posts with pagination
		const posts = await db.posts.find({
			userId: id,
			published: true
		})
		.sort({ createdAt: sort })
		.limit(parseInt(limit as string))
		.skip(parseInt(offset as string))
		.toArray();

		// Get total count for pagination metadata
		const total = await db.posts.countDocuments({
			userId: id,
			published: true
		});

		res.json({
			data: posts,
			meta: {
				total,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				hasMore: parseInt(offset as string) + posts.length < total
			}
		});
	} catch (error) {
		console.error('Error fetching user posts:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});`
	},
	{
		title: 'Web Dev - Custom Hook',
		code: `function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Usage example for search input
function SearchComponent() {
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	useEffect(() => {
		if (debouncedSearchTerm) {
			// Perform expensive search operation
			fetchResults(debouncedSearchTerm);
		}
	}, [debouncedSearchTerm]);

	return (
		<input
			type="text"
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
			placeholder="Search..."
		/>
	);
}`
	},
	{
		title: 'Games - Game Loop',
		code: `class Game {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private lastTime = 0;
	private running = false;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')!;
	}

	start(): void {
		if (this.running) return;
		this.running = true;
		this.lastTime = performance.now();
		requestAnimationFrame((t) => this.loop(t));
	}

	stop(): void {
		this.running = false;
	}

	private loop(currentTime: number): void {
		if (!this.running) return;

		const deltaTime = (currentTime - this.lastTime) / 1000;
		this.lastTime = currentTime;

		this.update(deltaTime);
		this.render();

		requestAnimationFrame((t) => this.loop(t));
	}

	protected update(dt: number): void {
		// Override in subclass
	}

	protected render(): void {
		// Override in subclass
	}
}`
	},
	{
		title: 'MMORPG - Character Stats',
		code: `interface CharacterStats {
	strength: number;
	dexterity: number;
	intelligence: number;
	vitality: number;
	luck: number;
}

class Character {
	public level: number;
	public experience: number;
	public baseStats: CharacterStats;
	public equipment: { [slot: string]: Equipment | null };

	constructor(
		public name: string,
		public classType: 'warrior' | 'mage' | 'rogue' | 'cleric'
	) {
		this.level = 1;
		this.experience = 0;
		this.baseStats = this.getDefaultStats(classType);
		this.equipment = {
			head: null,
			chest: null,
			legs: null,
			weapon: null,
			shield: null,
			accessory: null
		};
	}

	private getDefaultStats(classType: string): CharacterStats {
		const statTable: Record<string, CharacterStats> = {
			warrior: { strength: 15, dexterity: 10, intelligence: 5, vitality: 12, luck: 8 },
			mage: { strength: 5, dexterity: 8, intelligence: 18, vitality: 8, luck: 11 },
			rogue: { strength: 10, dexterity: 18, intelligence: 8, vitality: 9, luck: 15 },
			cleric: { strength: 8, dexterity: 8, intelligence: 14, vitality: 14, luck: 10 }
		};
		return statTable[classType];
	}

	getEffectiveStats(): CharacterStats {
		const effective = { ...this.baseStats };

		// Add equipment bonuses
		Object.values(this.equipment).forEach(item => {
			if (item) {
				effective.strength += item.stats.strength || 0;
				effective.dexterity += item.stats.dexterity || 0;
				effective.intelligence += item.stats.intelligence || 0;
				effective.vitality += item.stats.vitality || 0;
				effective.luck += item.stats.luck || 0;
			}
		});

		return effective;
	}

	gainExperience(amount: number): void {
		this.experience += amount;
		const xpNeeded = this.getXPForLevel(this.level + 1);

		if (this.experience >= xpNeeded) {
			this.levelUp();
		}
	}

	private getXPForLevel(level: number): number {
		return Math.floor(100 * Math.pow(1.5, level - 1));
	}

	private levelUp(): void {
		this.level++;
		this.baseStats.vitality += 2;
		this.baseStats.strength += 1;
		this.baseStats.dexterity += 1;
		this.baseStats.intelligence += 1;
		console.log(\`\${this.name} leveled up to \${this.level}!\`);
	}
}`
	},
	{
		title: 'Final Fantasy - ATB System',
		code: `class ATBBattle {
	private participants: BattleParticipant[];
	private turnQueue: BattleParticipant[] = [];

	constructor(participants: BattleParticipant[]) {
		this.participants = participants;
		this.participants.forEach(p => p.resetATB());
	}

	update(): void {
		// Update ATB bars for all participants
		this.participants.forEach(p => {
			if (p.isAlive() && !p.isCharging()) {
				p.fillATB();
			}
		});

		// Check for full ATB bars
		this.participants
			.filter(p => p.isATBFull() && !this.turnQueue.includes(p))
			.forEach(p => this.turnQueue.push(p));

		// Process turn queue
		if (this.turnQueue.length > 0) {
			this.processTurn();
		}
	}

	private processTurn(): void {
		const actor = this.turnQueue.shift()!;

		if (actor.isPlayer()) {
			// Wait for player input
			this.waitForPlayerInput(actor);
		} else {
			// AI action
			const action = actor.selectAction();
			const target = this.selectTarget(action);
			action.execute(actor, target);
			actor.resetATB();
		}
	}

	private waitForPlayerInput(actor: BattleParticipant): void {
		// UI shows action menu
		// When player selects action:
		actor.onActionSelected = (action: Action, target: BattleParticipant) => {
			action.execute(actor, target);
			actor.resetATB();
		};
	}

	private selectTarget(action: Action): BattleParticipant {
		const validTargets = this.participants.filter(p =>
			action.isValidTarget(p)
		);
		return validTargets[Math.floor(Math.random() * validTargets.length)];
	}
}

interface BattleParticipant {
	hp: number;
	maxHp: number;
	atbValue: number;
	speed: number;
	isPlayer: boolean;

	resetATB(): void;
	fillATB(): void;
	isATBFull(): boolean;
	isCharging(): boolean;
	isAlive(): boolean;
	selectAction(): Action;
}`
	},
	{
		title: 'Royalty - Succession Logic',
		code: `type RelationType = 'parent' | 'child' | 'spouse' | 'sibling';

interface Person {
	id: string;
	name: string;
	birthYear: number;
	deathYear?: number;
	gender: 'male' | 'female';
	relations: Map<RelationType, Set<string>>;
}

class RoyalLine {
	private people: Map<string, Person> = new Map();
	private monarchy: Set<string> = new Set(); // Current royal family

	addPerson(person: Person): void {
		this.people.set(person.id, person);
	}

	setMonarch(personId: string): void {
		this.monarchy.clear();
		this.expandRoyalFamily(personId);
	}

	private expandRoyalFamily(personId: string): void {
		if (this.monarchy.has(personId)) return;

		const person = this.people.get(personId);
		if (!person) return;

		this.monarchy.add(personId);

		// Add immediate family
		const relations = person.relations;
		['parent', 'spouse', 'child', 'sibling'].forEach(type => {
			relations.get(type)?.forEach(id => {
				this.expandRoyalFamily(id);
			});
		});
	}

	getSuccessionLine(): Person[] {
		const successors: Person[] = [];
		const visited = new Set<string>();

		// Find current monarch or most recent
		const monarchId = this.findMonarch();
		if (!monarchId) return successors;

		this.traverseSuccession(monarchId, visited, successors);
		return successors;
	}

	private traverseSuccession(
		personId: string,
		visited: Set<string>,
		successors: Person[]
	): void {
		if (visited.has(personId)) return;
		visited.add(personId);

		const person = this.people.get(personId);
		if (!person || !this.isInLine(person)) return;

		// Primogeniture: sons before daughters, ordered by age
		const children = Array.from(person.relations.get('child') || [])
			.map(id => this.people.get(id))
			.filter(p => p && this.isInLine(p))
			.sort((a, b) => {
				if (a!.gender !== b!.gender) {
					return a!.gender === 'male' ? -1 : 1;
				}
				return a!.birthYear - b!.birthYear;
			});

		children.forEach(child => {
			if (child) {
				successors.push(child);
				this.traverseSuccession(child.id, visited, successors);
			}
		});
	}

	private isInLine(person: Person): boolean {
		// Person must be in monarchy and alive
		return this.monarchy.has(person.id) && !person.deathYear;
	}

	private findMonarch(): string | null {
		// Return most senior living royal
		const royals = Array.from(this.monarchy)
			.map(id => this.people.get(id))
			.filter(p => p && !p.deathYear);

		if (royals.length === 0) return null;

		royals.sort((a, b) => a!.birthYear - b!.birthYear);
		return royals[0]!.id;
	}
}`
	},
	{
		title: 'Tea - Brewing Calculator',
		code: `type TeaType = 'black' | 'green' | 'white' | 'oolong' | 'herbal' | 'puerh';

interface TeaProfile {
	name: string;
	temperature: number; // Celsius
	steepTime: number; // Seconds
	resteeps: number[];
}

class TeaBrewer {
	private static readonly TEA_PROFILES: Record<TeaType, TeaProfile> = {
		black: {
			name: 'Black Tea',
			temperature: 100,
			steepTime: 210,
			resteeps: [210, 240, 270]
		},
		green: {
			name: 'Green Tea',
			temperature: 80,
			steepTime: 120,
			resteeps: [90, 60, 45]
		},
		white: {
			name: 'White Tea',
			temperature: 75,
			steepTime: 180,
			resteeps: [200, 220, 240]
		},
		oolong: {
			name: 'Oolong Tea',
			temperature: 90,
			steepTime: 180,
			resteeps: [60, 60, 90, 120]
		},
		herbal: {
			name: 'Herbal Tea',
			temperature: 100,
			steepTime: 300,
			resteeps: [360, 420]
		},
		puerh: {
			name: 'Pu-erh Tea',
			temperature: 100,
			steepTime: 30,
			resteeps: [30, 30, 45, 60, 90, 120]
		}
	};

	private currentSteep = 0;

	getBrewingInstructions(teaType: TeaType, steepNumber: number): TeaProfile {
		const profile = TeaBrewer.TEA_PROFILES[teaType];
		const maxResteeps = profile.resteeps.length;

		if (steepNumber === 0) {
			return {
				name: profile.name,
				temperature: profile.temperature,
				steepTime: profile.steepTime,
				resteeps: profile.resteeps
			};
		}

		if (steepNumber > maxResteeps) {
			// Tea is exhausted
			return {
				name: \`\${profile.name} (Exhausted)\`,
				temperature: profile.temperature,
				steepTime: profile.resteeps[maxResteeps],
				resteeps: []
			};
		}

		return {
			name: \`\${profile.name} (Steep \${steepNumber + 1})\`,
			temperature: profile.temperature,
			steepTime: profile.resteeps[steepNumber - 1],
			resteeps: profile.resteeps.slice(steepNumber)
		};
	}

	calculateBrewRatio(grams: number, milliliters: number): number {
		// Traditional brewing ratio
		return grams / milliliters;
	}

	recommendBrewRatio(teaType: TeaType): { grams: number; milliliters: number } {
		const ratios: Record<TeaType, { grams: number; milliliters: number }> = {
			black: { grams: 3, milliliters: 200 },
			green: { grams: 2, milliliters: 200 },
			white: { grams: 2.5, milliliters: 200 },
			oolong: { grams: 5, milliliters: 150 },
			herbal: { grams: 3, milliliters: 250 },
			puerh: { grams: 7, milliliters: 150 }
		};
		return ratios[teaType];
	}
}

// Usage
const brewer = new TeaBrewer();
const instructions = brewer.getBrewingInstructions('oolong', 2);
console.log(\`Brew \${instructions.name} at \${instructions.temperature}°C for \${instructions.steepTime}s\`);`
	}
];

interface CodeInputProps {
	onExplain: (code: string, language: string) => void;
	isLoading: boolean;
	compact?: boolean;
	hiddenDuringLoad?: boolean;
}

export function CodeInput({ onExplain, isLoading, compact = false, hiddenDuringLoad = false }: CodeInputProps) {
	const [code, setCode] = useState('');
	const [language, setLanguage] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);
	const [exampleIndex, setExampleIndex] = useState(-1);
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

	const handleLoadExample = useCallback(() => {
		const nextIndex = (exampleIndex + 1) % EXAMPLES.length;
		setExampleIndex(nextIndex);
		handleCodeChange(EXAMPLES[nextIndex].code);
	}, [exampleIndex, handleCodeChange]);

	const currentExample = exampleIndex >= 0 ? EXAMPLES[exampleIndex] : null;

	return (
		<div
			className={`code-input ${compact ? 'compact' : ''} ${isDragging ? 'dragging' : ''} ${hiddenDuringLoad && isLoading ? 'visually-hidden' : ''}`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{!compact && (
				<div className="code-input-header">
					<Code2 size={16} />
					<span>
						{currentExample ? (
							<>Example: {currentExample.title}</>
						) : (
							'Paste code or drop a file'
						)}
					</span>
					<div className="header-actions">
						<button
							type="button"
							onClick={handleLoadExample}
							className="example-button"
							title="Load example"
							aria-label="Load code example"
						>
							<Shuffle size={14} />
							<span>Example</span>
						</button>
						<kbd>Ctrl+Enter</kbd>
					</div>
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
				aria-label="Code input"
			/>

			<div className="code-input-footer">
				{compact && (
					<button
						type="button"
						onClick={handleLoadExample}
						className="example-button"
						title="Load example"
						aria-label="Load code example"
					>
						<Shuffle size={14} />
						<span>Example</span>
					</button>
				)}

				{language && (
					<span className="language-badge">
						{language}
					</span>
				)}

				<button
					onClick={handleExplain}
					disabled={!code.trim() || !language || isLoading}
					className="explain-button"
					aria-label="Explain code"
				>
					{isLoading ? (
						<>
							<Loader2 size={16} className="spinner" />
							Explaining...
							<span className="sr-only">Explaining code, please wait</span>
						</>
					) : (
						'Explain'
					)}
				</button>
			</div>
		</div>
	);
}
