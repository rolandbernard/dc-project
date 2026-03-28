import { Link } from "react-router";
import { Dices } from "lucide-react";

import SearchBar from "./GlobalSearch";
import ThemeSelector from "./ThemeSelector";
import { useRandom } from "../api";

interface Props {
    minimal?: boolean;
}

/**
 * This is the header component of the applications. It has two modes. The normal
 * mode used on all but one of the pages, and the minimal mode which is used on
 * the home page. The minimal mode only shows the theme selector and has no background.
 * The normal mode instead includes additionally a background, the logo, and the
 * search bar.
 */
export default function Header(props: Props) {
    if (props.minimal) {
        return (
            <div
                key="min"
                className="absolute z-1 top-0 right-0 h-18 flex flex-row items-center px-px"
            >
                <ThemeSelector />
            </div>
        );
    } else {
        let random = useRandom();
        return (
            <div key="max z-1">
                <div className="h-18" />
                <div
                    id="header"
                    className="fixed top-0 left-0 w-full px-px bg-base-50 focus-within:top-0! select-none z-1"
                    style={{ transitionDuration: "300ms" }}
                >
                    <nav
                        className="w-full z-10 h-18 box-content border-border/50 bg-base-50 border-b flex flex-row items-center"
                        style={{ viewTransitionName: "header-area" }}
                    >
                        <div className="grow w-full ms-4">
                            {!props.minimal && (
                                <div className="max-w-[max(var(--container-4xl),min(var(--container-5xl),72vw))] transition-none!">
                                    <div
                                        className="w-full flex flex-row items-center justify-end max-w-3xl xl:max-w-5xl mx-auto"
                                        style={{
                                            transitionProperty: "max-width",
                                        }}
                                    >
                                        <Link
                                            to="/"
                                            className="flex items-center space-x-3 text-xl font-bold whitespace-nowrap not-sm:max-w-0 max-w-34 overflow-hidden ms-auto"
                                            style={{
                                                transitionProperty: "max-width",
                                                viewTransitionName: "logo",
                                            }}
                                            viewTransition
                                        >
                                            EK100 AA V
                                        </Link>
                                        <div
                                            className="flex-1 w-full ms-4 not-sm:ms-0 max-w-3xl flex flex-row items-center"
                                            style={{
                                                transitionProperty: "margin",
                                            }}
                                        >
                                            <SearchBar />
                                            <Link
                                                to={`/sample/${random}`}
                                                className={
                                                    "text-sm flex shrink-0 grow-0 ms-4 items-center " +
                                                    "justify-center w-10 h-10 cursor-pointer " +
                                                    "rounded-box hover:bg-content/6 dark:hover:bg-content/10 border " +
                                                    "border-transparent active:border-content/10" +
                                                    (random
                                                        ? ""
                                                        : " loading pointer-events-none")
                                                }
                                                viewTransition
                                                style={{
                                                    viewTransitionName:
                                                        "random",
                                                }}
                                            >
                                                <Dices className="w-6 h-6" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <ThemeSelector />
                    </nav>
                </div>
            </div>
        );
    }
}
