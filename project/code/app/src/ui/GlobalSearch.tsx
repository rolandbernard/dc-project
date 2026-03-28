import { useMemo, useState } from "react";
import { Form, Link, useNavigate, useSearchParams } from "react-router";
import { Search } from "lucide-react";

import { boldQuery, scoreQuery } from "../util";
import { useSuggestions } from "../api";

interface InnerProps {
    autoFocus?: boolean;
    defaultValue: string;
}

/**
 * This component implements a search bar. The user can enter a query and when
 * submitted it will navigate to the search page using the entered query. The
 * search bar also has a suggestions feature, where while the user is typing,
 * different suggestions are shown below from which the user could choose.
 */
function SearchBar(props: InnerProps) {
    const [[active, hovering], setHovering] = useState<
        [boolean, string | undefined]
    >([false, undefined]);
    const navigate = useNavigate();
    const [query, setQuery] = useState(props.defaultValue);
    const suggestions = useSuggestions();
    const sortedSuggestions = useMemo(() => {
        const small_suggestions = suggestions.filter(e =>
            e.toLowerCase().includes(query.toLowerCase()),
        );
        if (small_suggestions.length >= 1000) {
            small_suggestions.length = 1000;
        }
        const scores = Object.fromEntries(
            small_suggestions.map(t => [t, scoreQuery(t, query)]),
        );
        return small_suggestions
            .sort((a, b) =>
                scores[a]! > scores[b]! ? -1 : scores[a]! < scores[b]! ? 1 : 0,
            )
            .slice(0, Math.min(10, small_suggestions.length));
    }, [suggestions, query]);
    return (
        <div
            id="global-search"
            className="relative w-full h-full z-10"
            style={{ viewTransitionName: "search-bar" }}
        >
            <Form
                viewTransition
                className="flex flex-row items-center"
                onSubmit={e => {
                    e.preventDefault();
                    const value = active && hovering ? hovering : query;
                    for (const s of sortedSuggestions) {
                        if (s.toLowerCase() === value.toLowerCase()) {
                            setQuery("");
                            setHovering([false, undefined]);
                            navigate(`/sample/${s}`);
                            break;
                        }
                    }
                }}
            >
                <div className="relative w-full">
                    <div
                        className={
                            "peer w-full z-1 relative block text-border " +
                            (query.length === 0 || suggestions.length === 0
                                ? "focus-within:text-primary/75"
                                : "")
                        }
                    >
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none ">
                            <Search className="w-5 h-5 stroke-2" />
                        </div>
                        <input
                            id="global-search"
                            name="q"
                            type="text"
                            className={
                                "block w-full ps-10.5 pe-3 border border-border/80 bg-base-300/50 outline-1! outline-transparent! outline-solid! text-content " +
                                "rounded-2xl py-3 placeholder:text-content/65 placeholder:italic hover:bg-base-300 focus:bg-base-300 " +
                                (query.length === 0 || suggestions.length === 0
                                    ? "focus-visible:border-primary/75 focus-visible:outline-primary/75!"
                                    : "focus-within:rounded-b-none")
                            }
                            placeholder="Search for sample name..."
                            value={active && hovering ? hovering : query}
                            autoFocus={props.autoFocus}
                            autoComplete="off"
                            onChange={e => {
                                setQuery(e.target.value);
                                setHovering([false, undefined]);
                            }}
                            onKeyDown={e => {
                                if (e.key === "ArrowUp") {
                                    const idx = hovering
                                        ? sortedSuggestions.indexOf(hovering)
                                        : -1;
                                    if (idx < 0) {
                                        setHovering([
                                            true,
                                            sortedSuggestions[
                                                sortedSuggestions.length - 1
                                            ],
                                        ]);
                                    } else if (idx === 0) {
                                        setHovering([false, undefined]);
                                    } else {
                                        setHovering([
                                            true,
                                            sortedSuggestions[idx - 1],
                                        ]);
                                    }
                                    e.preventDefault();
                                } else if (e.key === "ArrowDown") {
                                    const idx = hovering
                                        ? sortedSuggestions.indexOf(hovering)
                                        : -1;
                                    if (idx < 0) {
                                        setHovering([
                                            true,
                                            sortedSuggestions[0],
                                        ]);
                                    } else if (
                                        idx ===
                                        sortedSuggestions.length - 1
                                    ) {
                                        setHovering([false, undefined]);
                                    } else {
                                        setHovering([
                                            true,
                                            sortedSuggestions[idx + 1],
                                        ]);
                                    }
                                    e.preventDefault();
                                }
                            }}
                        />
                    </div>
                    <div
                        className={
                            "absolute top-0 left-0 right-0 max-h-0 opacity-0 overflow-hidden rounded-2xl shadow-xl dark:shadow-2xl flex flex-col " +
                            (query.trim().length !== 0 &&
                            suggestions.length !== 0
                                ? "focus-within:max-h-128 peer-focus-within:max-h-128 hover:max-h-128 active:max-h-128 " +
                                  "focus-within:opacity-100 peer-focus-within:opacity-100 hover:opacity-100 active:opacity-100"
                                : "")
                        }
                    >
                        <div
                            className="flex-1 flex flex-col w-full bg-base-300 pt-14 pb-2 border border-border/80 rounded-2xl overflow-hidden min-h-0"
                            onMouseLeave={() => setHovering([false, undefined])}
                        >
                            {sortedSuggestions.map(row => (
                                <Link
                                    key={row}
                                    to={`/sample/${encodeURIComponent(row)}`}
                                    viewTransition
                                    className={
                                        "px-3 py-1.5 cursor-pointer block items-center group text-nowrap overflow-hidden text-ellipsis " +
                                        (row === hovering
                                            ? "bg-content/6 dark:bg-content/10"
                                            : "")
                                    }
                                    onMouseEnter={() =>
                                        setHovering([false, row])
                                    }
                                    onClick={() => {
                                        setQuery("");
                                        setHovering([false, undefined]);
                                    }}
                                >
                                    <Search
                                        className={
                                            "inline-block w-4 h-4 text-border stroke-2 ml-px mr-3 " +
                                            (row === hovering
                                                ? "text-content/40"
                                                : "")
                                        }
                                    />
                                    {boldQuery(row, query, undefined, true)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
}

interface Props {
    autoFocus?: boolean;
}

/**
 * This is a minimal wrapper around the search bar whose only job it is to retrieve
 * teh default query from the search bar and give it to the component.
 */
export default function GlobalSearch(props: Props) {
    const [searchParams] = useSearchParams();
    const defaultQuery = searchParams.get("q") ?? "";
    return (
        <SearchBar
            key={defaultQuery}
            defaultValue={defaultQuery}
            autoFocus={props.autoFocus}
        />
    );
}
