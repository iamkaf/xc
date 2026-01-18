import hljs from 'highlight.js/lib/core';

// Always-register common languages for auto-detection
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import bash from 'highlight.js/lib/languages/bash';

// Register common languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('bash', bash);

const loadedLanguages = new Set<string>([
	'javascript',
	'typescript',
	'python',
	'go',
	'rust',
	'bash'
]);

export async function loadLanguage(lang: string): Promise<void> {
	if (loadedLanguages.has(lang)) return;

	try {
		const module = await import(`highlight.js/lib/languages/${lang}`);
		hljs.registerLanguage(lang, module.default);
		loadedLanguages.add(lang);
	} catch (error) {
		console.warn(`Failed to load language: ${lang}`, error);
	}
}

export { hljs };
