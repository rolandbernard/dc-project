import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import Header from "../ui/Header";

/**
 * This page should never be seen. It is just here to catch and display errors
 * in a more friendly manner. The information shown depends on the type of error
 * we are dealing with.
 */
export default function ErrorPage() {
    const error = useRouteError();
    return (
        <div className="min-h-dvh overflow-x-hidden flex flex-col">
            <Header />
            <div className="flex flex-col min-h-0 grow justify-center items-center">
                <div className="text-5xl pb-8 flex flex-col items-center max-w-[50vw]">
                    {isRouteErrorResponse(error) ? (
                        <>
                            <div className="pb-1 text-center">
                                {error.status} {error.statusText}
                            </div>
                            <p className="text-sm text-center">{error.data}</p>
                        </>
                    ) : error instanceof Error ? (
                        <>
                            <div className="pb-1 text-center">
                                Internal Error
                            </div>
                            <p className="text-sm pb-4 text-center">
                                {error.message}
                            </p>
                            <pre className="text-xs max-h-[50vh] overflow-scroll max-w-[50vw]">
                                {error.stack}
                            </pre>
                        </>
                    ) : error instanceof Response ? (
                        <>
                            <div className="pb-1 text-center">
                                {error.status} {error.statusText}
                            </div>
                        </>
                    ) : (
                        "Unknown Error"
                    )}
                </div>
                <Link
                    viewTransition
                    to="/"
                    className="text-sm underline text-primary dark:hover:text-primary/90 hover:text-primary/75"
                >
                    Get Back to Home
                </Link>
            </div>
        </div>
    );
}
