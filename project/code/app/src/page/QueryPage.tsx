import ContentWrap from "../ui/ContentWrap";
import SearchSelect from "../ui/SearchSelect";

import { useMunicipalities } from "../api";
import { useParam } from "../hooks";
import { boldQuery } from "../util";

/**
 * This is a page for allowing the user to performing a query.
 */
export default function QueryPage() {
    const [municipIds, setMunicipIds] = useParam("municipIds", [] as string[]);
    const municips = useMunicipalities();
    return (
        <ContentWrap>
            <div className="grow w-full h-full mb-10">
                <article
                    className="rounded-xl bg-base-300/40 mt-6"
                    style={{ viewTransitionName: "article" }}
                >
                    <div className="p-8">
                        <SearchSelect
                            ident="municipality-filter"
                            find={ids =>
                                municips &&
                                ids.map(
                                    id => municips!.find(m => m.iri === id)!,
                                )
                            }
                            options={() => municips}
                            id={row => row.iri}
                            name={row =>
                                `${row.name_de} - ${row.name_it}` +
                                (row.name_ld === undefined
                                    ? ""
                                    : ` - ${row.name_ld}`)
                            }
                            selected={municipIds}
                            onChange={e => setMunicipIds(e)}
                            output={(row, query) =>
                                boldQuery(
                                    row.label,
                                    query,
                                    "font-semibold underline",
                                )
                            }
                            className="block w-full"
                            placeholder="Filter by municipality..."
                            suppress={false}
                            object="municipality"
                            objects="municipalities"
                        />
                    </div>
                </article>
            </div>
        </ContentWrap>
    );
}
