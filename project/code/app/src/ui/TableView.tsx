import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useParam } from "../hooks";

import { detectResultType, municipalityLabel, type QueryResult } from "../api";
import { Link } from "react-router";

/** The number of rows to show per page. */
const STEP = 20;

interface RowProps {
    row: QueryResult;
}

function TableRow(props: RowProps) {
    const type = detectResultType([props.row]);
    return (
        <div className="min-h-0 grid grid-cols-[1fr_2fr] not-sm:grid-cols-2 p-1 text-content">
            {type !== "unknown" && (
                <>
                    <div
                        className="overflow-hidden text-ellipsis whitespace-nowrap px-2"
                        title={municipalityLabel(props.row.municipality)}
                    >
                        <Link
                            to={`/object/${encodeURIComponent(props.row.municipality.iri)}`}
                            className="underline text-primary dark:hover:text-primary/90 hover:text-primary/75"
                        >
                            {props.row.municipality.name_de}
                        </Link>
                    </div>
                    {type === "infra" ? (
                        <div className="px-2 grid grid-cols-[2fr_1fr]">
                            <div
                                className="overflow-hidden text-ellipsis whitespace-nowrap"
                                title={`${props.row.infrastructure!.kind_de} - ${props.row.infrastructure!.kind_it}`}
                            >
                                <Link
                                    to={`/object/${encodeURIComponent(props.row.infrastructure!.iri)}`}
                                    className="underline text-primary dark:hover:text-primary/90 hover:text-primary/75"
                                >
                                    {props.row.infrastructure!.kind_de}
                                </Link>
                            </div>
                            <div className="whitespace-nowrap flex flex-row justify-end not-sm:hidden">
                                {props.row.length
                                    ? `${Math.round(props.row.length)} m`
                                    : "NODE"}
                            </div>
                        </div>
                    ) : type === "hazard" ? (
                        <div className="px-2 grid grid-cols-[4fr_1fr] not-md:grid-cols-1">
                            <div
                                className="overflow-hidden text-ellipsis whitespace-nowrap flex flex-row justify-between"
                                title={
                                    `${props.row.hazard!.process_de} - ${props.row.hazard!.process_it}\n` +
                                    `${props.row.hazard!.danger_de} - ${props.row.hazard!.danger_it}`
                                }
                            >
                                <Link
                                    to={`/object/${encodeURIComponent(props.row.hazard!.iri)}`}
                                    className="underline text-primary dark:hover:text-primary/90 hover:text-primary/75"
                                >
                                    {props.row.hazard!.process_de}
                                </Link>
                                <span className="ms-2 not-sm:hidden">
                                    {props.row
                                        .hazard!.danger_de.replaceAll(
                                            "Untersucht und nicht",
                                            "Nicht",
                                        )
                                        .replaceAll(/ \(H[234]\)/g, "")}
                                </span>
                            </div>
                            <div className="whitespace-nowrap flex flex-row justify-end not-md:hidden">
                                {`${Math.round(props.row.area!)} m²`}
                            </div>
                        </div>
                    ) : type === "group-infra" ? (
                        <div className="px-2 grid grid-cols-3 not-sm:grid-cols-2">
                            <div className="whitespace-nowrap flex flex-row justify-end pe-4">
                                {props.row.count}
                            </div>
                            <div className="whitespace-nowrap flex flex-row justify-end">
                                {`${Math.round(props.row.length ?? 0)} m`}
                            </div>
                        </div>
                    ) : type === "group-hazard" ? (
                        <div className="px-2 grid grid-cols-3 not-sm:grid-cols-2">
                            <div className="whitespace-nowrap flex flex-row justify-end pe-4">
                                {props.row.count}
                            </div>
                            <div className="whitespace-nowrap flex flex-row justify-end">
                                {`${Math.round(props.row.area! / 1_0_000) / 100} km²`}
                            </div>
                        </div>
                    ) : (
                        <div className="px-2 grid grid-cols-[1fr_2fr] not-sm:grid-cols-1">
                            <div className="whitespace-nowrap not-sm:hidden flex flex-row justify-end me-8">
                                {`${Math.round(props.row.municipality.area! / 1_00_000) / 10} km²`}
                            </div>
                            <div
                                className="overflow-hidden text-ellipsis whitespace-nowrap"
                                title={`${props.row.district!.name_de} - ${props.row.district!.name_it}`}
                            >
                                <Link
                                    to={`/object/${encodeURIComponent(props.row.district!.iri)}`}
                                    className="underline text-primary dark:hover:text-primary/90 hover:text-primary/75"
                                >
                                    {props.row.district!.name_de}
                                </Link>
                            </div>
                        </div>
                    )}{" "}
                </>
            )}
        </div>
    );
}

interface InnerProps {
    data: undefined | QueryResult[];
    from: number;
    to: number;
    onAtEnd?: (atEnd: boolean) => void;
}

function InnerTableView(props: InnerProps) {
    const len = props.to - props.from;
    const rawResults = props.data && props.data.slice(props.from, props.to + 1);
    const loaded = !!rawResults;
    const [atEnd, results] = useMemo(() => {
        let atEnd = true;
        const rows = [...Array(len)] as (undefined | QueryResult)[];
        (rawResults ?? []).forEach((row, i) => {
            if (i < len) {
                rows[i] = row;
            } else if (i >= len) {
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
    const type = detectResultType(props.data);
    return (
        <div
            className={
                "flex-1 min-h-0 overflow-hidden grid auto-rows-fr " +
                (props.from + STEP < 100
                    ? "grid-cols-[3em_1fr]"
                    : props.from + STEP < 1000
                      ? "grid-cols-[3.5em_1fr]"
                      : props.from + STEP < 10000
                        ? "grid-cols-[4em_1fr]"
                        : props.from + STEP < 100000
                          ? "grid-cols-[4.5em_1fr]"
                          : "grid-cols-[5em_1fr]") +
                (loaded ? "" : " loading")
            }
        >
            <div className="min-h-0 flex flex-row justify-end items-center text-content/60 font-bold">
                #
            </div>
            <div className="min-h-0 grid grid-cols-[1fr_2fr] not-sm:grid-cols-2 p-1 text-content/60 font-bold">
                {type !== "unknown" && (
                    <>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap px-2">
                            Municipality
                        </div>
                        {type === "infra" ? (
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap px-2">
                                Infrastructure
                            </div>
                        ) : type === "hazard" ? (
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap px-2">
                                Hazard
                            </div>
                        ) : type === "group-infra" ? (
                            <div className="px-2 grid grid-cols-3 not-sm:grid-cols-2">
                                <div className="whitespace-nowrap flex flex-row justify-end pe-4">
                                    Count
                                </div>
                                <div className="whitespace-nowrap flex flex-row justify-end">
                                    Length
                                </div>
                            </div>
                        ) : type === "group-hazard" ? (
                            <div className="px-2 grid grid-cols-3 not-sm:grid-cols-2">
                                <div className="whitespace-nowrap flex flex-row justify-end pe-4">
                                    Count
                                </div>
                                <div className="whitespace-nowrap flex flex-row justify-end">
                                    Area
                                </div>
                            </div>
                        ) : (
                            <div className="px-2 grid grid-cols-[1fr_2fr] not-sm:grid-cols-1">
                                <div className="whitespace-nowrap not-sm:hidden flex flex-row justify-end me-8">
                                    Area
                                </div>
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                    District
                                </div>
                            </div>
                        )}{" "}
                    </>
                )}
            </div>
            {results.map((r, i) =>
                r ? (
                    <>
                        <div className="min-h-0 flex flex-row justify-end items-center text-content/60">
                            {props.from + i + 1}
                        </div>
                        <TableRow row={r} />
                    </>
                ) : (
                    <div
                        key={i}
                        className="flex justify-center items-center text-content/60 col-span-2 p-1"
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
    const [rawStart, setStart] = useParam<number>(`${props.name}start`, 0);
    const start = props.data
        ? Math.min(rawStart, props.data?.length - 1)
        : rawStart;
    const [pageInput, setPageInput] = useState<string | null>(null);
    const [atEnd, setAtEnd] = useState(false);
    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <InnerTableView
                data={props.data}
                from={start}
                to={start + STEP}
                onAtEnd={e => setAtEnd(e)}
            />
            <div className="grow-0 flex flex-row items-center justify-center text-sm">
                <button
                    className="flex items-center justify-center w-8 h-8 mx-1 not-disabled:cursor-pointer
                        rounded-box not-disabled:hover:bg-content/10 not-disabled:dark:hover:bg-content/15 border
                        border-transparent active:border-content/10 disabled:text-transparent"
                    disabled={start === 0}
                    onClick={_e => {
                        const newStart = Math.max(0, start - STEP);
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
                        className="block text-right w-32 pr-21 border-2 border-border
                            outline-none text-sm rounded-field focus-visible:border-primary
                            hover:bg-content/3 dark:hover:bg-content/8 pb-0.5"
                    />
                    <div className="absolute h-full w-2/3 top-0 right-0 flex justify-between items-center whitespace-nowrap pb-0.5 select-none">
                        - {Math.min(start + STEP, props.data?.length ?? start)}{" "}
                        / {props.data?.length ?? "?"}
                    </div>
                </div>
                <button
                    className="flex items-center justify-center w-8 h-8 mx-1 not-disabled:cursor-pointer
                        rounded-box not-disabled:hover:bg-content/10 not-disabled:dark:hover:bg-content/15 border
                        border-transparent active:border-content/10 disabled:text-transparent"
                    disabled={atEnd}
                    onClick={_e => {
                        const newStart = start + STEP;
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
