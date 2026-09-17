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
    ["What are all of the municipalities?", ""],
    ["What are all of the infrastructure assets?", ""],
    ["What are all of the hazard zones?", ""],
    ["Which infrastructure assets are exposed to hazards?", ""],
    [
        "Which water-related infrastructure nodes are located within high risk landslide zones?",
        "",
    ],
    [
        "What are the infrastructure lines that intersect with avalanche-prone areas?",
        "",
    ],
    [
        "In a given Municipality, how many electricity lines are currently situated in a hazard zone?",
        "",
    ],
    [
        "Which municipalities have the highest count of infrastructure elements exposed to natural hazards?",
        "",
    ],
    [
        "Municipalities with the largest area subject to natural hazards of high or very high danger level?",
        "",
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
export interface QueryFilters {
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
    const onlyMunicipality = infraTypes.length + hazardTypes.length === 0;
    const selectClause = [
        groupByMunicipality && !onlyMunicipality
            ? "?municipality (SAMPLE(?nameIt) AS ?nameIt) (SAMPLE(?nameDe) AS ?nameDe) " +
              "(SAMPLE(?nameLd) AS ?nameLd) (SAMPLE(?municipGeometry) AS ?municipGeometry)"
            : "?municipality ?nameIt ?nameDe ?nameLd" +
              (onlyMunicipality ? " ?municipGeometry" : ""),
    ];
    const whereConditions = [
        "?municipality a :Municipality ;\n" +
            (groupByMunicipality || onlyMunicipality
                ? "        :geometry ?municipGeometry ; \n"
                : "") +
            "        :nameIt ?nameIt ;\n" +
            "        :nameDe ?nameDe .",
        "OPTIONAL { ?municipality :nameLd ?nameLd . }",
    ];
    if (municipalities.length !== 0) {
        whereConditions.push(
            `VALUES ?municipality {${municipalities.map(iri => `<${iri}>`).join(" ")}}`,
        );
    }
    if (infraTypes.length !== 0) {
        const postfix = infraTypes.length === 2 ? "" : infraTypes[0];
        if (groupByMunicipality) {
            selectClause.push(
                "(COUNT(DISTINCT ?infrastructure) AS ?count) (SUM(?length) AS ?length)",
            );
            whereConditions.push(
                `?infrastructure a :Infrastructure${postfix} ;\n` +
                    "        :infrastructureIn ?municipality .",
            );
        } else {
            selectClause.push(
                "?infrastructure ?kindDe ?kindIt ?length ?infraGeometry",
            );
            whereConditions.push(
                `?infrastructure a :Infrastructure${postfix} ;\n` +
                    "        :infrastructureIn ?municipality ;\n" +
                    "        :typeNameIt ?kindIt ;\n" +
                    "        :typeNameDe ?kindDe ;\n" +
                    "        :geometry ?infraGeometry .",
            );
        }
        whereConditions.push(
            "OPTIONAL { ?infrastructure :lineLength ?length. }",
        );
        if (domains.length === 1) {
            whereConditions.push(
                `?infrastructure a :${domains[0]}Infrastructure .`,
            );
        } else if (domains.length !== 0) {
            whereConditions.push(
                "?infrastructure a ?domain .",
                `VALUES ?domain {${domains.map(d => `:${d}Infrastructure`).join(" ")}}`,
            );
        }
    }
    if (hazardTypes.length !== 0) {
        const prefix = hazardTypes.length === 2 ? "Hazard" : hazardTypes[0];
        if (infraTypes.length === 0) {
            if (groupByMunicipality) {
                selectClause.push(
                    "(COUNT(DISTINCT ?hazard) AS ?count) (SUM(?area) AS ?area)",
                );
                whereConditions.push(
                    `?hazard a :${prefix}Zone ;\n` +
                        "        :hazardZoneIn ?municipality .",
                );
            } else {
                selectClause.push(
                    "?hazard ?processDe ?processIt ?dangerDe ?dangerIt ?area ?hazardGeometry",
                );
                whereConditions.push(
                    `?hazard a :${prefix}Zone ;\n` +
                        "        :hazardZoneIn ?municipality ;\n" +
                        "        :processNameIt ?processDe ;\n" +
                        "        :processNameDe ?processIt ;\n" +
                        "        :dangerNameIt ?dangerDe ;\n" +
                        "        :dangerNameDe ?dangerIt ;\n" +
                        "        :geometry ?hazardGeometry .",
                );
            }
            whereConditions.push("OPTIONAL { ?hazard :hazardArea ?area. }");
        } else {
            whereConditions.push(`?hazard a :${prefix}Zone .`);
        }
        if (dangerLevels.length === 1) {
            whereConditions.push(`?hazard a :${dangerLevels[0]}DangerZone .`);
        } else if (dangerLevels.length !== 0) {
            whereConditions.push(
                "?hazard a ?dangerLevel .",
                `VALUES ?dangerLevel {${dangerLevels.map(d => `:${d}DangerZone`).join(" ")}}`,
            );
        }
    }
    if (infraTypes.length !== 0 && hazardTypes.length !== 0) {
        whereConditions.push("?infrastructure :isExposedTo ?hazard .");
    }
    const groupByClause = groupByMunicipality ? "GROUP BY ?municipality" : "";
    const orderByClause = "";
    const limitClause = limit >= 0 ? `LIMIT ${limit}` : "";
    // Assemble the final SPARQL query.
    return `
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ${selectClause.join(" ")}
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
    area?: number;
    geometry?: string;
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
    geometry?: string;
}

/**
 * Infrastructure information returned by the dynamic queries.
 */
export interface Infrastructure {
    iri: string;
    kind_de: string;
    kind_it: string;
    geometry?: string;
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
    count?: number;
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
                iri: row.municipality!.value,
                name_de: row.nameIt!.value,
                name_it: row.nameDe!.value,
                name_ld: row.nameLd?.value,
                area: row.municipArea && parseFloat(row.municipArea.value),
                geometry: row.municipGeometry?.value,
            },
            hazard: row.hazard && {
                iri: row.hazard.value,
                process_de: row.processDe!.value,
                process_it: row.processIt!.value,
                danger_de: row.dangerDe!.value,
                danger_it: row.dangerIt!.value,
                geometry: row.hazardGeometry?.value,
            },
            area: row.area && parseFloat(row.area.value),
            infrastructure: row.infrastructure && {
                iri: row.infrastructure.value,
                kind_de: row.kindDe!.value,
                kind_it: row.kindIt!.value,
                geometry: row.infraGeometry?.value,
            },
            length: row.length && parseFloat(row.length.value),
            count: row.count && parseInt(row.count.value),
        }))
    );
}
