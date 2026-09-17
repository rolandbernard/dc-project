import { useEffect } from "react";
import { useStateWithDep } from "./hooks";
import { NruCache } from "./util";

/**
 * Interface of value bindings returned by the SPARQL endpoint.
 */
export interface SparqlBindingValue {
    type: "uri" | "literal" | "bnode";
    value: string;
    datatype?: string;
}

/**
 * A binding containing multiple value bindings returned by the SPARQL endpoint.
 */
export interface SparqlBinding {
    [key: string]: SparqlBindingValue | undefined;
}

/**
 * Header returned by the Ontop SPARQL endpoint.
 */
export interface SparqlHead {
    vars: string[];
}

/**
 * Results returned by the SPARQL endpoint.
 */
export interface SparqlResults {
    bindings: SparqlBinding[];
}

/**
 * Format of the complete SPARQL response that is returned by the SPARQL endpoint.
 */
export interface SparqlQueryResponse {
    head: SparqlHead;
    results: SparqlResults;
}

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

/**
 * Determine the URL that the API will be available at. This is basically just
 * to allow local development server of Vite to still work by accessing a different
 * port for the API.
 *
 * @returns The URL with which to connect to the API.
 */
function getApiUrl() {
    let url;
    const params = new URLSearchParams(document.location.search);
    if (params.has("api")) {
        url = params.get("api")!;
    } else {
        if (document.location.hostname == "localhost") {
            url = "http://localhost:8887/sparql";
        } else {
            url = `${document.location.protocol}//${document.location.host}/sparql`;
        }
    }
    return url;
}

/**
 * A very simple cache for the queries. This only caches exact matches in the
 * query and only keeps the last 16 most recently used queries.
 */
const queryCache = new NruCache<string, SparqlQueryResponse>(16);

/**
 * React hook for performing the given SPARQL query on the Ontop endpoint and
 * return the results once the request finishes.
 *
 * @param query The SPARQL query of execute or retrieve for.
 * @returns `undefined` while loading, and a `SparqlQueryResponse` otherwise.
 */
export function useSparqlQuery(query: string) {
    const [result, setResult] = useStateWithDep<
        SparqlQueryResponse | undefined
    >(() => queryCache.get(query), [query]);
    useEffect(() => {
        const result = queryCache.get(query);
        if (!result) {
            const controller = new AbortController();
            fetch(getApiUrl(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/sparql-query",
                    Accept: "application/sparql-results+json",
                },
                body: query,
                signal: controller.signal,
            })
                .then(async response => {
                    if (!response.ok) {
                        console.error("API request failed", response.status);
                    } else {
                        const result = await response.json();
                        if (!controller.signal.aborted) {
                            queryCache.set(query, result);
                            setResult(result);
                        }
                    }
                })
                .catch(e => {
                    if (
                        !(e instanceof DOMException) ||
                        e.name !== "AbortError"
                    ) {
                        console.error("API request failed", e);
                    }
                });
            return () => controller.abort();
        } else {
            setResult(result);
        }
    }, [query, setResult]);
    return result;
}

/**
 * Municipality that is queried for allowing the user to select them in the
 * municipality configuration of the query builder.
 */
export interface SimpleMunicipality {
    iri: string;
    name_de: string;
    name_it: string;
    name_ld?: string;
}

/**
 * Convert a municipality to a human readable label of the municipalities name.
 *
 * @param municip
 * @returns
 */
export function municipalityLabel(municip: SimpleMunicipality) {
    return (
        `${municip.name_de} - ${municip.name_it}` +
        (municip.name_ld === undefined ? "" : ` - ${municip.name_ld}`)
    );
}

/**
 * React hook to load all of the available municipalities in the dataset using
 * a SPARQL query to the Ontop endpoint.
 *
 * @returns The municipalities present in the dataset or `undefined` while leading.
 */
export function useMunicipalities() {
    const result = useSparqlQuery(`
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT ?municipality ?nameIt ?nameDe ?nameLd
WHERE {
    ?municipality a :Municipality ;
        :nameIt ?nameIt ;
        :nameDe ?nameDe .
    OPTIONAL { ?municipality :nameLd ?nameLd . }
}
`);
    return (
        result &&
        result.results.bindings.map(row => ({
            iri: row.municipality!.value,
            name_de: row.nameIt!.value,
            name_it: row.nameDe!.value,
            name_ld: row.nameLd?.value,
        }))
    );
}

/**
 * The set of query parameters for the generation of the dynamic SPARQL query
 * that is being generated in the frontend based on user settings.
 */
interface QueryFilters {
    infraTypes?: ("Line" | "Node")[];
    hazardTypes?: ("Landslide" | "Avalanche")[];
    domains?: ("Energy" | "Communication" | "Water" | "Waste")[];
    dangerLevels?: ("Low" | "Medium" | "High" | "VeryHigh")[];
    municipalities?: string[];
    groupByMunicipality?: boolean;
    limit?: number;
}

/**
 * Dynamically generate a SPARQL query that is configured based on the
 * configuration done by the user of the application.
 *
 * @param config The configuration parameters to use.
 * @returns A valid SPARQL query for the given configuration.
 */
export function buildDynamicSparql(config: QueryFilters) {
    const {
        infraTypes = ["Line", "Node"],
        hazardTypes = ["Landslide", "Avalanche"],
        domains = [],
        dangerLevels = [],
        municipalities = [],
        groupByMunicipality = false,
        limit = -1,
    } = config;
    let selectClause = "";
    let whereConditions = [] as string[];
    let groupByClause = "";
    let orderByClause = "";
    let limitClause = limit >= 0 ? `LIMIT ${limit}` : "";
    // Assemble the final SPARQL query.
    return `
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT ${selectClause}
WHERE {
    ${whereConditions.join("\n    ")}
}
${groupByClause}
${orderByClause}
${limitClause}`.trim();
}

/**
 * Municipality information returned by the dynamic queries.
 */
export interface Municipality {
    iri: string;
    name_de: string;
    name_it: string;
    name_ld?: string;
    area: number;
    geometry: string;
}

/**
 * Hazard information returned by the dynamic queries.
 */
export interface Hazard {
    iri: string;
    process_de: string;
    process_it: string;
    danger_de: string;
    danger_it: string;
    geometry: string;
}

/**
 * Infrastructure information returned by the dynamic queries.
 */
export interface Infrastructure {
    iri: string;
    kind_de: string;
    kind_it: string;
    geometry: string;
}

/**
 * The results of the dynamic query, reshaped to be more easily used for the
 * purposes of the later display in the application.
 */
export interface QueryResult {
    municipality: Municipality;
    hazard?: Hazard;
    area?: number;
    infrastructure?: Infrastructure;
    length?: number;
}

/**
 * Dynamically generate a SPARQL query and execute it to get the results. Results
 * are transformed into an instance of `QueryResult` before being returned to
 * the caller.
 *
 * @param config The configuration parameters to use.
 * @returns `undefined` while loading and the resit rows otherwise.
 */
export function useDynamicQuery(
    config: QueryFilters,
): undefined | QueryResult[] {
    const result = useSparqlQuery(buildDynamicSparql(config));
    return (
        result &&
        result.results.bindings.map(row => ({
            municipality: {
                iri: "",
                name_de: "",
                name_it: "",
                name_ld: "",
                area: 0,
                geometry: "",
            },
            hazard: {
                iri: "",
                process_de: "",
                process_it: "",
                danger_de: "",
                danger_it: "",
                geometry: "",
            },
            area: 0,
            infrastructure: {
                iri: "",
                kind_de: "",
                kind_it: "",
                geometry: "",
            },
            length: 0,
        }))
    );
}
