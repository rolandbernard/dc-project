import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

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

type ParamType = string[] | number[] | string | number;

function encodeParam<T extends ParamType>(obj: T) {
    if (obj instanceof Array) {
        return "[" + obj.map(e => e.toString()).join(",") + "]";
    } else {
        return obj.toString();
    }
}

function isNumber(str: string) {
    for (let i = 0; i < str.length; i++) {
        if (
            str.codePointAt(i)! < 48 ||
            str.codePointAt(i)! > 57 ||
            str.codePointAt(i) === 45
        ) {
            return false;
        }
    }
    return true;
}

function decodeParam<T extends ParamType>(val: string) {
    if (val[0] === "[") {
        const array = val
            .substring(1, val.length - 1)
            .split(",")
            .filter(e => e.length !== 0)
            .map(e => (isNumber(e) ? parseInt(e) : e));
        return array as T;
    } else {
        return (isNumber(val) ? parseInt(val) : val) as T;
    }
}

function getUrlWithQuery(q: URLSearchParams) {
    const href = document.location.href;
    const hashIdx = href.indexOf("#");
    if (hashIdx >= 0) {
        const idx = href.indexOf("?", hashIdx);
        if (idx >= 0) {
            return q.size === 0
                ? href.slice(0, idx)
                : href.slice(0, idx + 1) + q.toString();
        } else {
            return q.size === 0 ? href : href + "?" + q.toString();
        }
    } else {
        return q.size === 0 ? href : href + "#/?" + q.toString();
    }
}

function getCurrentQuery() {
    const href = document.location.href;
    const hashIdx = href.indexOf("#");
    if (hashIdx >= 0) {
        const idx = href.indexOf("?", hashIdx);
        if (idx >= 0) {
            return new URLSearchParams(href.slice(idx));
        } else {
            return new URLSearchParams();
        }
    } else {
        return new URLSearchParams();
    }
}

/**
 * This a hook that get a parameter value from the search parameters and also
 * provides a good way to change them easily.
 *
 * @param name The parameter name to use.
 * @param def The default value in case the parameter is missing.
 * @returns
 */
export function useParam<T extends ParamType>(
    name: string,
    def: T,
): [T, (v: T) => void] {
    const location = useLocation();
    const defValue = useMemo(() => encodeParam(def), [def]);
    const [value, setInnerValue] = useState(() =>
        decodeParam<T>(getCurrentQuery().get(name) ?? defValue),
    );
    useEffect(() => {
        setInnerValue(decodeParam<T>(getCurrentQuery().get(name) ?? defValue));
    }, [location.search, defValue, name]);
    const setValue = useCallback(
        (v: T) => {
            let newValue: string | null = encodeParam(v);
            if (newValue == defValue) {
                newValue = null;
            }
            const query = getCurrentQuery();
            if (query.get(name) != newValue) {
                setInnerValue(v);
                if (newValue) {
                    query.set(name, newValue);
                } else {
                    query.delete(name);
                }
                document.location.replace(getUrlWithQuery(query));
            }
        },
        [name, defValue],
    );
    return [value, setValue];
}
