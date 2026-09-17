import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useParam } from "../hooks";

import type { QueryResult } from "../api";

interface InnerProps {
    data: undefined | QueryResult[];
    from: number;
    to: number;
    onAtEnd?: (atEnd: boolean) => void;
}

export function InnerTableView(props: InnerProps) {
    const len = props.to - props.from;
    const rawResults = props.data && props.data.slice(props.from, props.to + 1);
    const loaded = !!rawResults;
    const [atEnd, results] = useMemo(() => {
        let atEnd = true;
        const rows = [...Array(len)] as (undefined | QueryResult)[];
        (rawResults ?? []).forEach((row, i) => {
            if (i >= props.from && i < props.to) {
                rows[i - props.from] = row;
            } else if (i >= props.to) {
                atEnd = false;
            }
        });
        return [atEnd, rows];
    }, [rawResults, props.from, props.to, len]);
    const { onAtEnd } = props;
    useEffect(() => {
        if (loaded || !atEnd) {
            onAtEnd?.(atEnd);
        }
    }, [loaded, atEnd, onAtEnd]);
    return (
        <div
            className={
                "flex-1 min-h-0 overflow-hidden grid auto-rows-fr " +
                (props.from + 10 < 100
                    ? "grid-cols-[3em_1fr]"
                    : props.from + 10 < 1000
                      ? "grid-cols-[3.5em_1fr]"
                      : props.from + 10 < 10000
                        ? "grid-cols-[4em_1fr]"
                        : props.from + 10 < 100000
                          ? "grid-cols-[4.5em_1fr]"
                          : "grid-cols-[5em_1fr]") +
                (loaded ? "" : " loading")
            }
        >
            {results.map((r, i) =>
                r ? (
                    <>
                        <div className="min-h-0 flex flex-row justify-end items-center contain-strict">
                            {props.from + i + 1}
                        </div>
                        {r.municipality.name_de}
                    </>
                ) : (
                    <div
                        key={i}
                        className="flex justify-center items-center text-content/80 col-span-2"
                    >
                        {loaded
                            ? (i === 0 || results[i - 1]) &&
                              results.slice(i + 1).every(r => !r)
                                ? "At the end."
                                : ""
                            : i ==
                                Math.trunc(
                                    results.length -
                                        results.filter(r => !r).length / 2,
                                )
                              ? "Loading..."
                              : ""}
                    </div>
                ),
            )}
        </div>
    );
}

interface Props {
    name: string;
    data: undefined | QueryResult[];
}

export default function TableView(props: Props) {
    const [start, setStart] = useParam<number>(`${props.name}start`, 0);
    const [pageInput, setPageInput] = useState<string | null>(null);
    const [atEnd, setAtEnd] = useState(false);
    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <InnerTableView
                data={props.data}
                from={start}
                to={start + 10}
                onAtEnd={e => setAtEnd(e)}
            />
            <div className="grow-0 flex flex-row items-center justify-center text-sm">
                <button
                    className="flex items-center justify-center w-8 h-8 mx-1 not-disabled:cursor-pointer
                        rounded-box not-disabled:hover:bg-content/10 not-disabled:dark:hover:bg-content/15 border
                        border-transparent active:border-content/10 disabled:text-transparent"
                    disabled={start === 0}
                    onClick={_e => {
                        const newStart = Math.max(0, start - 10);
                        setStart(newStart);
                        setPageInput(null);
                    }}
                >
                    <ArrowLeft />
                </button>
                <div className="flex flex-row relative items-center overflow-hidden">
                    <input
                        value={
                            pageInput === null
                                ? (start + 1).toString()
                                : pageInput
                        }
                        onChange={e => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                                setStart(Math.max(0, value - 1));
                                setPageInput(null);
                            } else {
                                setPageInput(e.target.value);
                            }
                        }}
                        className="block text-right w-32 pr-16.5 border-2 border-border
                            outline-none text-sm rounded-field focus-visible:border-primary
                            hover:bg-content/3 dark:hover:bg-content/8 pb-0.5"
                    />
                    <div className="absolute h-full w-1/2 top-0 right-0 flex justify-between items-center whitespace-nowrap pb-0.5 select-none">
                        - {start + 10}
                    </div>
                </div>
                <button
                    className="flex items-center justify-center w-8 h-8 mx-1 not-disabled:cursor-pointer
                        rounded-box not-disabled:hover:bg-content/10 not-disabled:dark:hover:bg-content/15 border
                        border-transparent active:border-content/10 disabled:text-transparent"
                    disabled={atEnd}
                    onClick={_e => {
                        const newStart = start + 10;
                        setStart(newStart);
                        setPageInput(null);
                    }}
                >
                    <ArrowRight />
                </button>
            </div>
        </div>
    );
}
