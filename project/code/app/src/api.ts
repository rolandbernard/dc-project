import { useEffect } from "react";
import { useStateWithDep } from "./hooks";
import { NruCache } from "./util";

/** All of the possible pre-build suggestions to setup the application. */
const allSuggestions: [string, string][] = [
    [
        "Which water-related infrastructure nodes are located within high risk landslide zones?",
        "?a",
    ],
    [
        "What are the infrastructure lines that intersect with avalanche-prone areas?",
        "?b",
    ],
    [
        "In a given Municipality, how many electricity lines are currently situated in a hazard zone?",
        "?c",
    ],
    [
        "Which municipalities have the highest count of infrastructure elements exposed to natural hazards?",
        "?d",
    ],
    [
        "Municipalities with the largest area subject to natural hazards of high or very high danger level?",
        "?e",
    ],
];

/**
 * This is a React hook that can be used to get quick picker query suggestions.
 * The results are returned in no particular order, and the user should make sure
 * to order them appropriately.
 *
 * @returns A list of suggestions in arbitrary order.
 */
export function useSuggestions() {
    return allSuggestions;
}
