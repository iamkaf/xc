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
					messages: [
						{
							role: 'system',
							content: 'You are a code explanation assistant. Explain the given code snippet clearly and concisely. Focus on what the code does, how it works, and any important patterns or concepts. Use markdown formatting. Be direct and technical - assume the reader is a developer. Start with an executive summary followed by the full explanation. Don\'t offer follow ups as this is a one-off interaction.',
						},
						{
							role: 'user',
							content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
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
