import type { ReactNode } from "react";

interface Props {
    className?: string;
    children?: ReactNode;
}

/**
 * This is a small component for aligning the content of the page with the position
 * of the search bar in the header. We have a maximum size for the page content,
 * and starting at a certain size we prefer to keep the content to the left of
 * center.
 */
export default function ContentWrap(props: Props) {
    return (
        <div
            className={
                "grow flex flex-col bg-base-100 px-px " +
                (props.className ?? "")
            }
        >
            <div className="grow h-full mx-4 max-w-[calc(max(100%-var(--spacing)*20,var(--container-3xl)))] flex flex-col transition-none!">
                <div className="min-h-full max-w-[max(var(--container-4xl),min(var(--container-5xl),72vw))] grow flex flex-col transition-none!">
                    <div
                        className="h-full w-full max-w-3xl xl:max-w-5xl mx-auto grow flex flex-col"
                        style={{ transitionProperty: "max-width" }}
                    >
                        <div className="flex-1 h-full w-full max-w-3xl ms-auto grow flex flex-col">
                            {props.children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
