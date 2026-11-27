// Free OpenRouter Models Curated List
export const FREE_MODELS = [
    {
        id: 'openrouter/free',
        name: 'Free Auto Router',
        provider: 'OpenRouter',
        supportsVision: true,
        contextLength: '200K',
        description: 'Auto-selects best available healthy free model',
        supportedFormats: 'Images (.png, .jpg, .webp), PDFs, Text & Code (.py, .js, .txt, .md, .json, etc.)',
        details: 'Dynamically routes prompts to the best performing healthy free model currently available on OpenRouter.',
        tags: ['vision', 'general']
    },
    {
        id: 'liquid/lfm-3-1.7b:free',
        name: 'LFM 3 1.7B',
        provider: 'Liquid AI',
        supportsVision: false,
        contextLength: '256K',
        description: 'Agentic tool & reasoning text model (1.7B)',
        supportedFormats: 'Text & Code (.txt, .md, .py, .js, .json, .csv, .html)',
        details: 'Ultra-efficient 1.7B text model optimized for autonomous agents, function/tool calling, and structured output generation with built-in reasoning.',
        tags: ['reasoning', 'agentic', 'text']
    },
    {
        id: 'recursive/flint-v1.0:free',
        name: 'Flint v1.0',
        provider: 'Recursive',
        supportsVision: false,
        contextLength: '256K',
        description: 'MoE coding agent model (40B / 2.5B active)',
        supportedFormats: 'Code & Text (.py, .js, .ts, .jsx, .tsx, .json, .md, .sql, etc.)',
        details: 'Mixture-of-Experts coding specialist (40B total, 2.5B active) trained via autoresearch for codebase exploration, refactoring, bug fixes, and unit testing.',
        tags: ['coding', 'text']
    },
    {
        id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
        name: 'Nemotron 3 Ultra (550B)',
        provider: 'NVIDIA',
        supportsVision: false,
        contextLength: '1M',
        description: 'Frontier reasoning & orchestration MoE (550B)',
        supportedFormats: 'Text & Code (.txt, .md, .py, .js, .json, .csv, .html, etc.)',
        details: 'Frontier 550B MoE (55B active) with hybrid Transformer-Mamba architecture and thinking trace for advanced multi-step reasoning, agent orchestration, and enterprise RAG.',
        tags: ['reasoning', 'text', '1m']
    },
    {
        id: 'particle-ai/particle-1:free',
        name: 'Particle-1',
        provider: 'Particle AI',
        supportsVision: true,
        contextLength: '1M',
        description: 'Agentic coding & vision with 1M context',
        supportedFormats: 'Images (.png, .jpg, .webp), PDFs, Text & Code (.py, .js, .ts, .txt, etc.)',
        details: 'Agentic coding and multimodal model featuring a massive 1M token context window for large repository inspection and visual reasoning.',
        tags: ['coding', 'vision', '1m']
    },
    {
        id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        name: 'Nemotron 3 Nano Omni',
        provider: 'NVIDIA',
        supportsVision: true,
        contextLength: '256K',
        description: 'Omni Multimodal (Vision & Audio)',
        supportedFormats: 'Images (.png, .jpg, .webp), Audio, Text & Code files',
        details: 'Omni-modal architecture (30B total, 3B active) handling simultaneous vision, audio perception, and step-by-step reasoning.',
        tags: ['reasoning', 'vision', 'omni']
    },
    {
        id: 'nvidia/nemotron-3.5-lightning:free',
        name: 'Nemotron 3.5 Lightning',
        provider: 'NVIDIA',
        supportsVision: false,
        contextLength: '1M',
        description: 'High-throughput 1M context text model',
        supportedFormats: 'Text & Code (.txt, .md, .py, .js, .json, .csv, etc.)',
        details: 'High-throughput text generation engine optimized for low-latency batch processing and large text analysis.',
        tags: ['text', '1m']
    },
    {
        id: 'baidu/ernie-5.5-flash-preview:free',
        name: 'ERNIE 5.5 Flash',
        provider: 'Baidu',
        supportsVision: false,
        contextLength: '1M',
        description: 'Baidu foundation text model with 1M context',
        supportedFormats: 'Text & Code (.txt, .md, .py, .js, .json, .csv, etc.)',
        details: 'Foundation text model with 1M token context for long document synthesis and multilingual comprehension.',
        tags: ['text', '1m']
    },
    {
        id: 'google/gemma-4-31b-it:free',
        name: 'Gemma 4 31B',
        provider: 'Google',
        supportsVision: true,
        contextLength: '262K',
        description: 'Multimodal (Text, Image, Video) - Fast & Capable',
        supportedFormats: 'Images (.png, .jpg, .webp), Video frames, Text & Code',
        details: 'Google 31B instruction-tuned multimodal model delivering strong visual understanding, video reasoning, and text processing.',
        tags: ['vision']
    },
    {
        id: 'nvidia/nemotron-3.5-super-vl:free',
        name: 'Nemotron 3.5 Super VL',
        provider: 'NVIDIA',
        supportsVision: true,
        contextLength: '1M',
        description: 'Vision & Video with 1M context',
        supportedFormats: 'Images (.png, .jpg, .webp), Video frames, Text & Code',
        details: 'High-capacity visual language model featuring 1M context for extensive multi-image and video analysis.',
        tags: ['vision', '1m']
    },
    {
        id: 'google/gemma-4-26b-a4b-it:free',
        name: 'Gemma 4 26B A4B',
        provider: 'Google',
        supportsVision: true,
        contextLength: '262K',
        description: 'Multimodal Mixture-of-Experts',
        supportedFormats: 'Images (.png, .jpg, .webp), Text & Code files',
        details: 'Google multimodal MoE model offering high compute efficiency with visual reasoning capabilities.',
        tags: ['vision']
    },
    {
        id: 'inclusionai/ling-3.2-flash:free',
        name: 'Ling 3.2 Flash',
        provider: 'inclusionAI',
        supportsVision: true,
        contextLength: '1M',
        description: 'Reasoning & vision with 1M context',
        supportedFormats: 'Images (.png, .jpg, .webp), Text & Code files',
        details: 'Fast multimodal reasoning model with 1M context designed for complex reasoning over images and long texts.',
        tags: ['vision', 'reasoning', '1m']
    }
];

export const DEFAULT_MODEL_ID = 'openrouter/free';

let currentAbortController = null;

/**
 * Aborts any currently active OpenRouter generation request
 */
export const abortCurrentRequest = () => {
    if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
    }
};

/**
 * Returns a guaranteed valid free model ID
 * @param {string} [modelId]
 * @returns {string}
 */
export const getValidModelId = (modelId) => {
    if (modelId && FREE_MODELS.some(m => m.id === modelId)) {
        return modelId;
    }
    return DEFAULT_MODEL_ID;
};

/**
 * Call OpenRouter Chat Completions API with auto-fallback for rate-limited models and abort signal support
 * @param {Object} params
 * @param {string} [params.model] - Model ID (defaults to DEFAULT_MODEL_ID)
 * @param {Array} params.messages - Array of chat messages
 * @param {number} [params.temperature=0.7] - Sampling temperature
 * @param {AbortSignal} [params.signal] - Optional external AbortSignal
 * @returns {Promise<string>}
 */
export const callOpenRouterChat = async ({
    model = DEFAULT_MODEL_ID,
    messages = [],
    temperature = 0.7,
    signal
}) => {
    const isRoot = !signal;
    if (isRoot) {
        currentAbortController = new AbortController();
    }
    const activeSignal = signal || currentAbortController?.signal;

    try {
        const validModel = getValidModelId(model);
        const apiKey = import.meta.env?.VITE_OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('VITE_OPENROUTER_API_KEY is not defined in environment variables.');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location?.origin : 'http://localhost:5173',
            'X-Title': 'LexaAI'
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers,
            signal: activeSignal,
            body: JSON.stringify({
                model: validModel,
                messages,
                temperature
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errorMessage = errData?.error?.message || `OpenRouter API Error: ${response.status} ${response.statusText}`;

            // If upstream provider returned 429 (rate-limited) or 503 (unavailable), auto-fallback to openrouter/free
            if ((response.status === 429 || response.status === 503) && validModel !== 'openrouter/free') {
                console.warn(`Model ${validModel} returned ${response.status}. Automatically routing to openrouter/free...`);
                return await callOpenRouterChat({
                    model: 'openrouter/free',
                    messages,
                    temperature,
                    signal: activeSignal
                });
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const content = choice?.message?.content || choice?.message?.reasoning || '';
        if (!content.trim()) {
            return '*(No text returned by the model)*';
        }
        return content;
    } finally {
        if (isRoot) {
            currentAbortController = null;
        }
    }
};
