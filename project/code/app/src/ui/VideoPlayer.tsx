import { CloudAlert } from "lucide-react";
import { useRef, useState } from "react";

interface Highlight {
    start: number;
    end: number;
    label: string;
}

interface Props {
    videoUrl: string;
    minTime: number;
    maxTime: number;
    pausePoints?: number[];
    highlights?: Highlight[];
}

/**
 * This is a component for showing a subset of a larger video. It also supports
 * pause points and timeline highlights.
 */
export default function VideoPlayer(props: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(props.minTime);
    const togglePlay = () => {
        if (isPlaying) {
            videoRef.current!.pause();
            setIsPlaying(false);
        } else {
            if (currentTime >= props.maxTime) {
                videoRef.current!.currentTime = props.minTime;
            }
            videoRef.current!.play();
            setIsPlaying(true);
        }
    };
    const getPercentage = (time: number) => {
        return ((time - props.minTime) / (props.maxTime - props.minTime)) * 100;
    };
    return (
        <div
            className={
                "w-full mx-0 my-auto sm:p-3 bg-base-300 rounded" +
                (isLoading ? " loading" : "")
            }
        >
            <div className="relative w-full">
                <video
                    ref={videoRef}
                    src={props.videoUrl}
                    onLoadedMetadata={() => {
                        videoRef.current!.currentTime = props.minTime;
                        setIsLoading(false);
                        setIsError(false);
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setIsError(true);
                    }}
                    onTimeUpdate={() => {
                        const videoTime = videoRef.current!.currentTime;
                        if (videoTime >= props.maxTime) {
                            videoRef.current!.pause();
                            videoRef.current!.currentTime = props.maxTime;
                            setIsPlaying(false);
                            setCurrentTime(props.maxTime);
                        } else if (videoTime < props.minTime) {
                            videoRef.current!.currentTime = props.minTime;
                            setCurrentTime(props.minTime);
                        } else {
                            for (const point of props.pausePoints ?? []) {
                                if (currentTime < point && point <= videoTime) {
                                    videoRef.current!.pause();
                                    setIsPlaying(false);
                                }
                            }
                            setCurrentTime(videoTime);
                        }
                    }}
                    onClick={togglePlay}
                    className={
                        "w-full cursor-pointer rounded" + (isError ? " " : "")
                    }
                    style={{ aspectRatio: 1.78 }}
                />
                {isError && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <CloudAlert className="text-orange-400 w-16 h-16 mb-3" />
                            <p>Sorry, this video failed to load.</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="pt-1">
                <div
                    className="relative h-3 bg-content/10 rounded-full mt-1 mb-2"
                    onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percentage = (e.clientX - rect.left) / rect.width;
                        const newTime =
                            props.minTime +
                            percentage * (props.maxTime - props.minTime);
                        videoRef.current!.currentTime = newTime;
                        setCurrentTime(newTime);
                    }}
                >
                    <div className="relative h-full w-full rounded-full overflow-clip">
                        <div
                            className="h-full bg-primary/70"
                            style={{ width: `${getPercentage(currentTime)}%` }}
                        />
                        {(props.highlights ?? []).map((range, index) => (
                            <div
                                key={`highlight-${index}`}
                                title={range.label}
                                className="absolute top-0 h-full bg-blue-500 opacity-60 cursor-help"
                                style={{
                                    left: `${getPercentage(range.start)}%`,
                                    width: `${getPercentage(props.minTime + range.end - range.start)}%`,
                                }}
                            />
                        ))}
                    </div>
                    {(props.pausePoints ?? []).map((point, index) => (
                        <div
                            key={`pause-${index}`}
                            className="absolute -top-0.5 -bottom-0.5 w-1.5 bg-red-600 -translate-x-1/2"
                            style={{ left: `${getPercentage(point)}%` }}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <button
                        onClick={togglePlay}
                        className="w-32 h-8 bg-primary/70 cursor-pointer border-0 rounded text-base-50"
                    >
                        {isPlaying
                            ? "Pause"
                            : currentTime >= props.maxTime
                              ? "Restart"
                              : "Play"}
                    </button>
                    <span className="text-sm font-mono">
                        {currentTime.toFixed(1)}s
                    </span>
                </div>
            </div>
        </div>
    );
}
