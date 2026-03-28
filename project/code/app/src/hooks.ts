import { useEffect, useState } from "react";

/**
 * This is a hook that will execute a given function whenever some user click
 * outside of the given target selector.
 *
 * @param target A CSS selector within which clicks will not cause the function
 *               to be called.
 * @param func The function to call in case of clicks outside.
 */
export function useClickOutside(target: string, func: () => void) {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!(e.target as HTMLElement)?.closest(target)) {
                func();
            }
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [target, func]);
}

/** The list of listeners currently registered to receive theme changes. */
const themeListeners: Set<(t: string) => void> = new Set();

/**
 * A private helper function for setting the theme. It takes care of persisting
 * the theme in local storage and notifying all local listeners.
 *
 * @param value The name of the theme to set.
 */
function setupTheme(value: string) {
    if (value) {
        if (value === "system") {
            delete localStorage.theme;
        } else {
            localStorage.theme = value;
        }
    }
    for (const handle of themeListeners) {
        handle(value);
    }
    document.documentElement.classList.toggle(
        "dark",
        "theme" in localStorage
            ? localStorage.theme === "dark"
            : matchMedia("(prefers-color-scheme: dark)").matches,
    );
}

/**
 * This is a hook that can be used to observe and modify the current theme status.
 *
 * @returns The currently active theme value, and a function that can be used to
 *          modify the value of the selected theme.
 */
export function useTheme(): [string, (v: string) => void] {
    const [selected, setSelected] = useState(localStorage.theme ?? "system");
    useEffect(() => {
        const handler = () => setSelected(localStorage.theme ?? "system");
        themeListeners.add(handler);
        addEventListener("storage", handler);
        return () => {
            removeEventListener("storage", handler);
            themeListeners.delete(handler);
        };
    }, []);
    return [selected, setupTheme];
}

/**
 * This is a variation of the standard `useState` hook that additionally receives
 * an array of dependencies, and when any of them change the state will be reset
 * to it's default value.
 *
 * @param initial The initial value of the state, and the value used for resets.
 * @param dep An array of dependencies that control when the state resets.
 * @returns An array with the current value and a setter to modify the value.
 */
export function useStateWithDep<T>(initial: () => T, dep: unknown[]) {
    const [prev, setPrev] = useState(dep);
    const [value, setValue] = useState(initial);
    if (prev.length != dep.length || prev.some((v, i) => v != dep[i])) {
        setPrev(dep);
        setValue(initial);
    }
    return [value, setValue] as [T, (v: T) => void];
}
