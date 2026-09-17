import { useState, type ReactNode } from "react";

import { useClickOutside } from "../hooks";
import { sort } from "../util";

/**
 * The kind of entry that is searched among in the search entry.
 */
export interface SearchEntry<V> {
    label: string;
    value: V;
}

interface Props<V> {
    name: string;
    options: () => undefined | SearchEntry<V>[];
    match: (row: SearchEntry<V>, query: string) => number;
    output: (row: SearchEntry<V>, query: string) => ReactNode;
    prefix?: ReactNode;
    limit?: number;
    default?: SearchEntry<V>[];
    debounce?: number;
    autoFocus?: boolean;
    placeholder?: string;
    placeholderItalic?: boolean;
    className?: string;
    suppress?: boolean;
}

export default function SearchBar<K>(props: Props<K>) {
    const [query, setQuery] = useState("");
    const lowerQuery = query.toLowerCase();
    const results = props.options();
    const filteredResults = (
        props.suppress !== false && query.length === 0
            ? (props.default ?? [])
            : (results ?? [])
    ).filter(row => props.match(row, lowerQuery) > 0);
    const limit = Math.min(props.limit ?? 10, filteredResults.length);
    const trueResults = sort(
        filteredResults,
        lowerQuery.length === 0 && (results?.length ?? 0) > limit
            ? [
                  row =>
                      props.default?.some(v => v.label == row.label) ? 1 : -1,
                  row => props.match(row, lowerQuery),
              ]
            : [row => props.match(row, lowerQuery)],
        true,
    ).slice(0, limit);
    useClickOutside("div#search-bar-" + props.name, () => setQuery(""));
    return (
        <div
            id={"search-bar-" + props.name}
            className={"relative " + (props.className ?? "")}
        >
            <div className="peer w-full relative block">
                {props.prefix}
                <input
                    type="text"
                    className={
                        "block w-full px-3 py-2 border-2 border-border outline-none text-sm " +
                        "rounded-field focus-visible:border-primary " +
                        "hover:bg-content/3 dark:hover:bg-content/8 " +
                        (props.placeholderItalic !== false
                            ? "placeholder:text-content/80 placeholder:italic "
                            : "placeholder:text-content/95 ")
                    }
                    placeholder={props.placeholder}
                    value={query}
                    autoFocus={props.autoFocus}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>
            {props.suppress === false ||
            (props.default && props.default.length !== 0) ||
            query.length !== 0 ? (
                <div
                    className="absolute inset-y-full end-0 w-full hidden focus-within:block
                               peer-focus-within:block hover:block active:block z-50"
                >
                    <div
                        className={
                            "flex flex-col w-full bg-base-300 rounded-box py-2.5 shadow-xl dark:shadow-2xl " +
                            (results !== undefined ? "" : "loading")
                        }
                    >
                        {trueResults.length ? (
                            trueResults.map(row =>
                                props.output(row, lowerQuery),
                            )
                        ) : (
                            <div className="text-content/80 px-3 not-xl:px-2 py-px text-nowrap overflow-hidden text-ellipsis">
                                {results === undefined
                                    ? "Searching..."
                                    : "No results found."}
                            </div>
                        )}
                    </div>
                </div>
            ) : undefined}
        </div>
    );
}
