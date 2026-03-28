/* eslint-disable react-hooks/refs */

import { useState, type ReactNode } from "react";
import { useParams } from "react-router";

import { useSample, videoUrlFromId } from "../api";

import ContentWrap from "../ui/ContentWrap";
import VideoPlayer from "../ui/VideoPlayer";

interface SpoilerProps {
    children: ReactNode;
}

/**
 * A small component that hides its contents until the user clicks on it.
 */
function Spoiler(props: SpoilerProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    return (
        <span
            onClick={() => {
                if (!isRevealed) {
                    setIsRevealed(true);
                }
            }}
            title={!isRevealed ? "Click to reveal!" : ""}
            className={
                !isRevealed
                    ? "py-1 bg-black text-transparent cursor-pointer select-none rounded"
                    : "py-1 rounded"
            }
        >
            {props.children}
        </span>
    );
}

/**
 * This is a page for showing the metadata and contents of a single sample.
 */
export default function SamplePage() {
    const params = useParams();
    const sampleId = params["id"]!;
    const sample = useSample(sampleId);
    // TODO: make these configurable.
    const historyDuration = 16;
    const anticipationTime = 1;
    if (sample === null) {
        // The API finished loading but the article is missing.
        throw new Response("Missing Sample", {
            status: 404,
            statusText: "Not Found",
        });
    }
    if (sample === undefined) {
        // Sample is still loading, show some placeholder in the meantime.
        return (
            <ContentWrap key={sampleId}>
                <div className="grow w-full h-full mb-10">
                    <div className="rounded-xl overflow-hidden mt-6 loading p-8">
                        <div className="h-8 bg-base-300 rounded w-full"></div>
                        <div className="h-6 bg-base-300 rounded mt-3 w-3/4"></div>
                        <div className="h-6 bg-base-300 rounded mt-3 w-2/3"></div>
                        <div className="h-100 bg-base-300 rounded mt-10 w-full"></div>
                    </div>
                </div>
            </ContentWrap>
        );
    } else {
        return (
            <ContentWrap key={sampleId}>
                <div className="grow w-full h-full mb-10">
                    <article
                        className="rounded-xl bg-base-300/40 overflow-hidden mt-6"
                        style={{ viewTransitionName: "article" }}
                    >
                        <div className="p-8 not-md:p-4 not-sm:p-2 flex flex-row not-md:flex-col items-center justify-between not-md:items-start">
                            <div className="flex flex-row items-center">
                                <span className="text-sm font-bold text-content/70 me-2 not-md:w-24">
                                    Sample ID
                                </span>
                                <span>{sample.id}</span>
                            </div>
                            <div className="flex flex-row items-center">
                                <span className="text-sm font-bold text-content/70 me-2 not-md:w-24">
                                    Target Time
                                </span>
                                <span>
                                    {sample.start}s - {sample.end}s
                                </span>
                            </div>
                            <div className="flex flex-row items-center">
                                <span className="text-sm font-bold text-content/70 me-2 not-md:w-24">
                                    Label
                                </span>
                                <span>
                                    <Spoiler>{sample.label}</Spoiler>
                                </span>
                            </div>
                        </div>
                        <div className="p-5 not-md:p-1 not-sm:p-2 flex flex-row not-md:flex-col items-center justify-between not-md:items-start">
                            <VideoPlayer
                                videoUrl={videoUrlFromId(sample.id)}
                                minTime={Math.max(
                                    0,
                                    sample.start -
                                        historyDuration -
                                        anticipationTime,
                                )}
                                maxTime={sample.end}
                                pausePoints={[
                                    Math.max(
                                        0,
                                        sample.start - anticipationTime,
                                    ),
                                ]}
                                highlights={[
                                    {
                                        start: sample.start,
                                        end: sample.end,
                                        label: "Target Action",
                                    },
                                ]}
                            />
                        </div>
                    </article>
                </div>
            </ContentWrap>
        );
    }
}
