import { useEffect, useState } from "react";
import { useStateWithDep } from "./hooks";
import { NruCache } from "./util";
import { useLocation } from "react-router";

/**
 * Represents a sample from the dataset.
 */
export interface Sample {
    /** Unique id within the system. */
    id: string;
    /** Start time of the action in seconds. */
    start: number;
    /** End time of the action in seconds. */
    end: number;
    /** Label describing the action. */
    label: string;
}

/**
 * Extract the video id for the given sample id.
 *
 * @param ud The id of the sample.
 */
export function videoFromId(id: string) {
    return id.substring(0, id.lastIndexOf("_"));
}

/**
 * Construct the video URL for the given sample id.
 *
 * @param ud The id of the sample.
 */
export function videoUrlFromId(id: string) {
    return `https://huggingface.co/datasets/mohammad2012191/epic_kitchens_100_256p/resolve/main/videos/${videoFromId(id)}.MP4`;
}

/**
 * For every line in a response object invoke the given callback. If there is no
 * body, then this function has no effect.
 *
 * @param response The response to read lines from.
 * @param block The function to call for every new line that arrives.
 */
async function bodyLinesDo(
    response: Response,
    block: (v: string) => Promise<void>,
) {
    if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            for (let i = 0; i < lines.length - 1; i++) {
                await block(lines[i]!);
            }
            buffer = lines[lines.length - 1]!;
        }
        if (buffer.length > 0) {
            await block(buffer);
        }
    }
}

/** Cache the suggestions to avoid unnecessary API calls. */
const allSuggestions: Set<string> = new Set();

/**
 * This is a React hook that can be used to get quick search query suggestions.
 * The results are returned in no particular order, and the user should make sure
 * to order them appropriately.
 *
 * @param query The partial query for which we search suggested completions.
 * @returns A list of suggestions in arbitrary order. The list will incrementally
 *          update as new suggestions are received.
 */
export function useSuggestions() {
    const [result, setResult] = useState<string[]>(
        Array.from(allSuggestions.keys()),
    );
    useEffect(() => {
        if (allSuggestions.size === 0) {
            fetch("/data/ID.csv")
                .then(async response => {
                    await bodyLinesDo(response, async row => {
                        const [name, max_idx_str] = row.split(",");
                        const max_idx = parseInt(max_idx_str!);
                        for (let i = 0; i <= max_idx; i++) {
                            allSuggestions.add(`${name}_${i}`);
                        }
                        setResult(Array.from(allSuggestions.keys()));
                    });
                })
                .catch(e => {
                    console.error("API request failed", e);
                });
        }
    }, [setResult]);
    return result;
}

/** We cache samples so that we con't repeatedly request the same. */
const cachedSamples = new NruCache<string, Map<string, Sample>>(16);

/**
 * React hook for retrieving a sample given it's unique identifier.
 *
 * @param id The id of the sample to retrieve.
 * @returns `null` if missing, and a `Sample` instance otherwise.
 */
export function useSample(id: string) {
    const [result, setResult] = useStateWithDep<Sample | undefined | null>(
        () => cachedSamples.get(videoFromId(id))?.get(id),
        [id],
    );
    useEffect(() => {
        const results = cachedSamples.get(videoFromId(id));
        if (!results) {
            const controller = new AbortController();
            fetch(`/data/${videoFromId(id)}.csv`, { signal: controller.signal })
                .then(async response => {
                    if (response.status === 404) {
                        setResult(null);
                    } else {
                        const results = new Map<string, Sample>();
                        await bodyLinesDo(response, async row => {
                            if (!controller.signal.aborted) {
                                const [name, start, end, label] =
                                    row.split(",");
                                const sample = {
                                    id: name!,
                                    start: parseFloat(start!),
                                    end: parseFloat(end!),
                                    label: label!,
                                };
                                if (name === id) {
                                    setResult(sample);
                                }
                                results.set(name!, sample);
                            }
                        });
                        if (!controller.signal.aborted) {
                            cachedSamples.set(videoFromId(id), results);
                            setResult(results.get(id) ?? null);
                        }
                    }
                })
                .catch(e => {
                    if (
                        !(e instanceof DOMException) ||
                        e.name !== "AbortError"
                    ) {
                        console.error("API request failed", e);
                    }
                });
            return () => controller.abort();
        } else {
            setResult(results.get(id) ?? null);
        }
    }, [id, setResult]);
    return result;
}

/**
 * Returns a random sample id.
 *
 * @returns The id of a randomly selected sample.
 */
export function useRandom() {
    const location = useLocation();
    const suggestions = useSuggestions();
    const [result, _] = useStateWithDep<string | undefined>(
        () => suggestions[Math.floor(Math.random() * suggestions.length)],
        [location, suggestions],
    );
    return result;
}
