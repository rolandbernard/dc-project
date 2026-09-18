import { Link, useParams } from "react-router";

import ContentWrap from "../ui/ContentWrap";
import { useSparqlQuery } from "../api";

const PREFIX = "http://rolandb.com/ontologies/dc#";
const RENAME = [
    ["#type", "Is A"],
    ["#istatCode", "ISTAT Code"],
    ["#belongsTo", "Belongs To"],
    ["#infrastructureIn", "Infrastructure In"],
    ["#hazardZoneIn", "Hazard Zone In"],
    ["#isExposedTo", "Is Exposed To"],
    ["#zipCode", "ZIP Code"],
    ["#districtCode", "Code"],
    ["#infrastructureCode", "Code"],
    ["#hazardCode", "Code"],
    ["#nameIt", "Name (IT)"],
    ["#nameDe", "Name (DE)"],
    ["#nameLd", "Name (LD)"],
    ["#districtNameIt", "Name (IT)"],
    ["#districtNameDe", "Name (DE)"],
    ["#typeNameIt", "Type Name (IT)"],
    ["#typeNameDe", "Type Name (DE)"],
    ["#dangerNameIt", "Danger Name (IT)"],
    ["#dangerNameDe", "Danger Name (DE)"],
    ["#processNameIt", "Process Name (IT)"],
    ["#processNameDe", "Process Name (DE)"],
    ["#municipalityArea", "Area", " m²"],
    ["#hazardArea", "Area", " m²"],
    ["#lineLength", "Length", " m"],
    ["#geometry", "Geometry"],
];

/**
 * This is a page for showing the metadata and contents of a single object.
 */
export default function ObjectPage() {
    const params = useParams();
    const results = useSparqlQuery(`
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?property ?value WHERE {
  <${params.iri}> ?property ?value .
}`);
    console.log(results);
    return (
        <ContentWrap>
            <div className="grow w-full h-full mb-10">
                <article
                    className="rounded-xl bg-base-300/40 overflow-hidden mt-6"
                    style={{ viewTransitionName: "object" }}
                >
                    <div className="flex flex-row items-center p-3">
                        <div className="flex flex-wrap gap-3 min-h-16">
                            {results?.results.bindings
                                .filter(
                                    b =>
                                        !b.property!.value.endsWith(
                                            "#intersectsWith",
                                        ),
                                )
                                .toSorted(
                                    (a, b) =>
                                        RENAME.findIndex(([n]) =>
                                            a.property!.value.endsWith(n!),
                                        ) -
                                        RENAME.findIndex(([n]) =>
                                            b.property!.value.endsWith(n!),
                                        ),
                                )
                                .map(b => {
                                    const rename = RENAME.find(([n]) =>
                                        b.property!.value.endsWith(n!),
                                    );
                                    return (
                                        <div className="p-2 flex flex-col border border-border/50 rounded-box min-w-0 bg-base-200">
                                            <div className="text-xs pb-1">
                                                {rename?.[1] ??
                                                    b.property!.value.replaceAll(
                                                        PREFIX,
                                                        "",
                                                    )}
                                            </div>
                                            <span className="select-text">
                                                {b.value!.type === "uri" &&
                                                !b.property!.value.endsWith(
                                                    "#type",
                                                ) ? (
                                                    <Link
                                                        to={`/object/${encodeURIComponent(b.value!.value)}`}
                                                        className="underline text-primary dark:hover:text-primary/90 hover:text-primary/75"
                                                    >
                                                        {b.value!.value.replaceAll(
                                                            PREFIX,
                                                            "",
                                                        )}
                                                    </Link>
                                                ) : rename?.[2] ? (
                                                    Math.round(
                                                        parseFloat(
                                                            b.value!.value,
                                                        ),
                                                    ) + rename[2]
                                                ) : (
                                                    b.value!.value.replaceAll(
                                                        PREFIX,
                                                        "",
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </article>
            </div>
        </ContentWrap>
    );
}
