import { useSearchParams } from "react-router";

import ContentWrap from "../ui/ContentWrap";

/**
 * This is a page for showing the metadata and contents of a single sample.
 */
export default function SamplePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    return (
        <ContentWrap>
            <div className="grow w-full h-full mb-10">
                <article
                    className="rounded-xl bg-base-300/40 overflow-hidden mt-6"
                    style={{ viewTransitionName: "article" }}
                >
                    Hello
                </article>
            </div>
        </ContentWrap>
    );
}
