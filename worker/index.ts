interface Env {
	OPENROUTER_API_KEY: string;
}

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (url.pathname === '/api/explain' && request.method === 'POST') {
			const { code, language } = await request.json() as { code: string; language: string };

			if (!code || typeof code !== 'string') {
				return Response.json({ error: 'code is required' }, { status: 400, headers: corsHeaders });
			}

			if (!language || typeof language !== 'string') {
				return Response.json({ error: 'language is required' }, { status: 400, headers: corsHeaders });
			}

			const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
					'Content-Type': 'application/json',
					'HTTP-Referer': 'https://xc.kaf.sh',
					'X-Title': 'XC (Xplain Code)'
				},
				body: JSON.stringify({
					model: 'google/gemini-2.5-flash-lite',
					stream: true,
					response_format: { type: 'json_object' },
					messages: [
						{
							role: 'system',
							content: 'You are a code explanation assistant. Analyze the given code snippet and return a JSON object with three keys:\n1. "title": A short, descriptive title for the code snippet (max 50 chars).\n2. "language": The programming language of the code (e.g., "typescript", "python").\n3. "explanation": A detailed, clear explanation of what the code does, how it works, and important concepts. Use markdown formatting within this string.\nBe direct and technical.',
						},
						{
							role: 'user',
							content: `Analyze this code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
						},
					],
				}),
			});

			if (!response.ok) {
				return Response.json({ error: 'Failed to get explanation' }, { status: 500, headers: corsHeaders });
			}

			// Stream the response directly
			return new Response(response.body, {
				headers: {
					...corsHeaders,
					'Content-Type': 'text/event-stream',
				},
			});
		}

		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
