import GlobalSearch from "../ui/GlobalSearch";

/**
 * This is the index pages (at the root path `/`) of the application. It contains
 * one big search bar in the middle of the screen which which a user can start
 * to select one of the predefined queries.
 */
export default function HomePage() {
    return (
        <div
            className="grow w-full h-full bg-base-50 flex flex-col items-center justify-center"
            style={{ viewTransitionName: "header-area" }}
        >
            <div className="w-1/2 max-w-3xl min-w-[min(100%,var(--container-lg))] px-4 flex flex-col justify-center items-center">
                <div
                    className="flex flex-col items-center justify-center space-x-3 font-bold whitespace-nowrap mb-16 w-fit select-none"
                    style={{ viewTransitionName: "logo" }}
                >
                    <div className="text-4xl not-md:text-3xl max-sm:text-xl">
                        Infrastructure Risk Exposure Analyzer
                    </div>
                </div>
                <GlobalSearch autoFocus={true} />
            </div>
        </div>
    );
}
