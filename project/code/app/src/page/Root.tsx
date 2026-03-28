import { useLayoutEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";

import Header from "../ui/Header";

/**
 * This is a wrapper around all normal pages. It's main purpose is to add the
 * header onto every page. The header moves out of the way when scrolling down,
 * and reappears on its own when scrolling back up.
 */
export default function Root() {
    const location = useLocation();
    useLayoutEffect(() => {
        let lastScrollY = window.scrollY;
        const listener = () => {
            const elem = document.querySelector("#header") as HTMLDivElement;
            if (elem) {
                if (
                    window.scrollY < elem.clientHeight / 2 ||
                    window.scrollY <= lastScrollY
                ) {
                    elem.style.top = "0px";
                } else {
                    elem.style.top = `-${elem.clientHeight + 10}px`;
                }
            }
            lastScrollY = window.scrollY;
        };
        listener();
        addEventListener("scroll", listener);
        return () => {
            removeEventListener("scroll", listener);
        };
    }, [location]);
    return (
        <div className="min-h-dvh flex flex-col">
            <Header minimal={location.pathname === "/"} />
            <Outlet />
            <ScrollRestoration />
        </div>
    );
}
