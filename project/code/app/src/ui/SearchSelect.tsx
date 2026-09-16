import { type ReactNode } from "react";

import SearchBar, { type SearchEntry } from "./SearchBar";

interface Props<V> {
    ident: string;
    find: (ids: string[]) => undefined | V[];
    options: () => undefined | V[];
    id: (row: V) => string;
    name: (row: V) => string;
    output: (row: SearchEntry<V>, query: string) => ReactNode;
    selected: string[];
    onChange?: (selection: string[]) => void;
    prefix?: ReactNode;
    placeholder?: string;
    object?: string;
    objects?: string;
    className?: string;
    suppress?: boolean;
    limit?: number;
    debounce?: number;
    rtl?: boolean;
}

export default function SearchSelect<V>(props: Props<V>) {
    const selected = props.find(props.selected);
    return (
        <SearchBar
            name={props.ident}
            options={() => {
                const result = props.options();
                return (
                    result &&
                    result.map(v => ({
                        label: props.name(v),
                        value: v,
                    }))
                );
            }}
            match={(row, query) => {
                if (query.length === 0) {
                    return 1;
                } else {
                    const name = props.name(row.value);
                    return name.toLowerCase().includes(query)
                        ? 1 / (1 + Math.abs(name.length - query.length))
                        : 0;
                }
            }}
            output={(row, query) => (
                <label
                    key={props.id(row.value)}
                    htmlFor={props.ident + "-" + props.id(row.value)}
                    className="flex flex-row items-center cursor-pointer select-none hover:bg-content/15 px-2 not-xl:px-2 py-px"
                >
                    <input
                        id={props.ident + "-" + props.id(row.value)}
                        className="w-4 h-4 appearance-none border border-border bg-base-200
                            checked:bg-primary cursor-pointer shrink-0"
                        type="checkbox"
                        checked={props.selected.some(
                            r => r === props.id(row.value),
                        )}
                        onChange={e => {
                            if (props.onChange) {
                                const id = props.id(row.value);
                                const without = props.selected.filter(
                                    r => r !== id,
                                );
                                if (e.target.checked) {
                                    props.onChange([...without, id]);
                                } else {
                                    props.onChange(without);
                                }
                            }
                        }}
                    />
                    <div
                        className={
                            "pl-2 overflow-hidden overflow-ellipsis whitespace-nowrap py-0.5 " +
                            (props.rtl ? " text-left" : "")
                        }
                        style={props.rtl ? { direction: "rtl" } : undefined}
                        title={props.name(row.value)}
                    >
                        {props.output(row, query)}
                    </div>
                </label>
            )}
            placeholder={
                props.selected.length === 0
                    ? props.placeholder
                    : props.selected.length <= 4 && selected !== undefined
                      ? "Selected " +
                        selected.map(r => props.name(r)).join(", ")
                      : "Selected " +
                        props.selected.length +
                        " " +
                        (props.object
                            ? props.selected.length === 1
                                ? props.object
                                : (props.objects ?? props.object + "s")
                            : "") +
                        "."
            }
            placeholderItalic={props.selected.length === 0}
            className={
                (props.className ?? "") +
                (selected !== undefined ? "" : " loading")
            }
            suppress={props.suppress}
            limit={props.limit ?? Math.max(10, selected?.length ?? 0)}
            debounce={props.debounce}
            default={(selected ?? []).map(v => ({
                label: props.name(v),
                value: v,
            }))}
        />
    );
}
