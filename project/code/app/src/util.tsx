/**
 * Compute a form of minimum edit distance between the text and a given query.
 * This is not a standard edit distance because different situations are given
 * different weights.
 *
 * @param text The text to match.
 * @param query The query to match against
 * @returns An array containing the distance of the match and an array of indices
 *          in the text that match the query.
 */
function minEditMatch(text: string, query: string) {
    const dist = [...Array(text.length + 1)].map(() => [
        ...Array(query.length + 1),
    ]);
    const prevs = [...Array(text.length + 1)].map(() => [
        ...Array(query.length + 1),
    ]);
    for (let j = 0; j <= query.length; j++) {
        for (let i = 0; i <= text.length; i++) {
            if (i === 0 && j === 0) {
                dist[0]![0] = 0;
                continue;
            }
            let [prev, best] = [[i, j], Infinity];
            if (i !== 0) {
                const d =
                    dist[i - 1]![j] +
                    (j === 0
                        ? query.length > 3
                            ? 0.5
                            : 1
                        : j === query.length
                          ? query.length > 3
                              ? 0.1
                              : 0.5
                          : j > 3
                            ? j > 5
                                ? 1
                                : 2
                            : 3);
                if (d < best) {
                    [prev, best] = [[i - 1, j], d];
                }
            }
            if (j !== 0) {
                const d = dist[i]![j - 1] + (j > 3 ? (j > 5 ? 1 : 2) : 3);
                if (d < best) {
                    [prev, best] = [[i, j - 1], d];
                }
            }
            if (i !== 0 && j !== 0 && text[i - 1] === query[j - 1]) {
                const d = dist[i - 1]![j - 1];
                if (d < best) {
                    [prev, best] = [[i - 1, j - 1], d];
                }
            }
            dist[i]![j] = best;
            prevs[i]![j] = prev;
        }
    }
    const path = [] as number[];
    let [i, j] = [text.length, query.length];
    while (i != 0 && j != 0) {
        const [ni, nj] = prevs[i]![j];
        if (i !== ni && j !== nj && path[path.length - 1] !== ni) {
            path.push(ni);
        }
        [i, j] = [ni, nj];
    }
    return [dist[text.length]![query.length], path.reverse()] as [
        number,
        number[],
    ];
}

/**
 * Match a text with a query by treating tokens of both individually.
 *
 * @param text The test to be matched.
 * @param query The query it is to be matched against.
 * @returns An array containing all of the indices in the text than have been
 *          matched to the query in some way.
 */
function multiTokenMatch(text: string, query: string) {
    const queryTokens = [...query.toLowerCase().matchAll(/\w+/g)].map(
        e => e[0],
    );
    const textTokens = text.toLowerCase().split(/\W/);
    let offset = 0;
    const matches: number[] = [];
    for (const token of textTokens) {
        let bestMatch: number[] = [];
        let bestScore = token.length;
        for (const qt of queryTokens) {
            const [score, match] = minEditMatch(token, qt);
            if (
                score < bestScore &&
                score < Math.min(token.length, qt.length) / 2
            ) {
                bestScore = score;
                bestMatch = match;
            }
        }
        for (const i of bestMatch) {
            matches.push(offset + i);
        }
        offset += token.length + 1;
    }
    return matches;
}

/**
 * Match a text with a query. This is intended for the suggestions, rather than
 * the highlighting in the search results.
 *
 * @param text The test to be matched.
 * @param query The query it is to be matched against.
 * @returns An array containing all of the indices in the text than have been
 *          matched to the query in some way.
 */
function suggestionsMatch(text: string, query: string) {
    const queryTokens = [...query.toLowerCase().matchAll(/\w+/g)].map(
        e => e[0],
    );
    const textTokens = text.toLowerCase().split(/\W/);
    let totalScore = 0;
    const matches: number[] = [];
    for (const qt of queryTokens) {
        let bestMatch: number[] = [];
        let bestScore = Infinity;
        let offset = 0;
        for (const token of textTokens) {
            const [score, match] = minEditMatch(token, qt);
            if (score < bestScore) {
                bestScore = score;
                bestMatch = match.map(m => m + offset);
            }
            offset += token.length + 1;
        }
        totalScore += bestScore;
        matches.push(...bestMatch);
    }
    return [totalScore, [...new Set(matches)].toSorted((a, b) => a - b)] as [
        number,
        number[],
    ];
}

/**
 * Score how well the text fits the query. The result is a value between zero
 * and one, where zero means no match and one means identical.
 *
 * @param text The text to match.
 * @param query The query to match against
 * @returns A number indicating the quality of the matching.
 */
export function scoreQuery(text: string, query: string) {
    const [score, _] = suggestionsMatch(text, query);
    return 1 / (score + 1);
}

/**
 * Create a list of react nodes where those parts of the text that match the
 * query are highlighted in bold and underlined.
 *
 * @param text The test to generate the highlighting of.
 * @param query The query to highligh the match of.
 * @param style The style that should be applied to the matching spans.
 * @returns An array of react nodes.
 */
export function boldQuery(
    text: string,
    query: string,
    style: string = "font-semibold underline",
    suggestion: boolean = false,
) {
    const match = suggestion
        ? suggestionsMatch(text, query)[1]
        : multiTokenMatch(text, query);
    if (match.length === 0) {
        return <span key="query-highlight">{text}</span>;
    } else {
        const parts = [];
        let start = 0;
        let last = 0;
        for (const t of match) {
            if (t > last) {
                if (last > start) {
                    const part = text.substring(start, last);
                    parts.push(
                        <span key={part + start} className={style}>
                            {part}
                        </span>,
                    );
                }
                const part = text.substring(last, t);
                parts.push(<span key={part + last}>{part}</span>);
                start = t;
            }
            last = t + 1;
        }
        if (last > start) {
            const part = text.substring(start, last);
            parts.push(
                <span key={part + start} className={style}>
                    {part}
                </span>,
            );
        }
        if (text.length > last) {
            const part = text.substring(last, text.length);
            parts.push(<span key={part + last}>{part}</span>);
        }
        return <span key="query-highlight">{parts}</span>;
    }
}

/**
 * This is a function to be used as a sorting comparator that sorts first by the
 * alphabetic portion of the string and then by the numeric one.
 *
 * @param a The first string of the comparison.
 * @param b The second string of the comparison:
 * @returns An integer -1, 0, or 1 depending on whether `a` is smaller, equal, or
 *          greater than `b` respectively.
 */
export function sortNamesWithNumbers(a: string, b: string) {
    const matchA = a.match(/^([a-zA-Z]+)([0-9]+)$/);
    const matchB = b.match(/^([a-zA-Z]+)([0-9]+)$/);
    if ((matchA?.[1] ?? "") > (matchB?.[1] ?? "")) {
        return 1;
    } else if ((matchA?.[1] ?? "") < (matchB?.[1] ?? "")) {
        return -1;
    } else {
        const intA = parseInt(matchA?.[2] ?? "0");
        const intB = parseInt(matchB?.[2] ?? "0");
        if (intA > intB) {
            return 1;
        } else if (intA < intB) {
            return -1;
        } else {
            return 0;
        }
    }
}

/**
 * A simple implementation of a cache with Not Recently Used replacement policy.
 */
export class NruCache<K, V> {
    queue: (K | undefined)[];
    idx: number;
    map: Map<K, V>;
    used: Set<K>;

    /**
     * Construct a new cache with the given capacity. The capacity is the
     * maximum number of elements it will hold before removing some.
     *
     * @param capacity The capacity of the cache.
     */
    constructor(capacity: number) {
        this.queue = Array(capacity);
        this.idx = 0;
        this.map = new Map();
        this.used = new Set();
    }

    /**
     * Retrieve the element in the cache at the given index, or return undefined
     * if no element is cached for the key.
     *
     * @param key The key to query.
     * @returns The value cached for that key or undefined.
     */
    get(key: K) {
        this.used.add(key);
        return this.map.get(key);
    }

    /**
     * Cache a new value for a given key, possibly evicting not recently used
     * parts of the cache to make room.
     *
     * @param key The key to cache the value by.
     * @param value The value to cache.
     */
    set(key: K, value: V) {
        if (!this.map.has(key)) {
            while (
                this.queue[this.idx] !== undefined &&
                this.used.has(this.queue[this.idx]!)
            ) {
                this.used.delete(this.queue[this.idx]!);
                this.idx = (this.idx + 1) % this.queue.length;
            }
            if (this.queue[this.idx] !== undefined) {
                this.map.delete(this.queue[this.idx]!);
            }
            this.queue[this.idx] = key;
            this.idx = (this.idx + 1) % this.queue.length;
        }
        this.map.set(key, value);
        this.used.add(key);
    }

    keys() {
        return [...this.map.keys()];
    }
}
