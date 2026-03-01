import { useState, useCallback } from 'react';
import { VerificationStatus } from '@/components/verification/VerificationBadge';
import { apiFetch } from '@/lib/apiClient';

interface AIResponse {
    provider: string;
    model_name: string;
    content: string;
    latency_ms: number;
}

export function useConsensusStream() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [responses, setResponses] = useState<AIResponse[]>([]);
    const [synthesized, setSynthesized] = useState<string>('');
    const [status, setStatus] = useState<VerificationStatus | 'pending'>('pending');
    const [score, setScore] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const streamQuery = useCallback(async (query: string, endpoint: string, token: string) => {
        setIsStreaming(true);
        setLoading(true);
        setResponses([]);
        setSynthesized('');
        setStatus('pending');
        setScore(undefined);
        setError(null);

        try {
            const response = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ query })
            });

            if (!response.ok) throw new Error('Failed to initiate stream');
            if (!response.body) throw new Error('ReadableStream not supported in this browser.');

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                const lines = chunkValue.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace('data: ', ''));

                            // Handling multiple events in SSE
                            if (data.type === 'model_response') {
                                setResponses(prev => [...prev, data.data]);
                            } else if (data.type === 'consensus') {
                                setScore(data.data.score);
                                setStatus(data.data.status);
                                // Set synthesis if provided directly 
                                if (data.data.synthesized) setSynthesized(data.data.synthesized);
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Streaming error');
        } finally {
            setIsStreaming(false);
            setLoading(false);
        }
    }, []);

    return { streamQuery, isStreaming, responses, synthesized, status, score, loading, error };
}
