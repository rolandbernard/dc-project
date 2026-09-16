import ContentWrap from "../ui/ContentWrap";
import SearchSelect from "../ui/SearchSelect";

import { useMunicipalities } from "../api";
import { useParam } from "../hooks";
import { boldQuery } from "../util";

const INFRA_TYPES = ["Line", "Node"];
const HAZARD_TYPES = ["Landslide", "Avalanche"];
const DOMAINS = ["Water", "Energy", "Waste", "Communication"];
const DANGER_LEVELS = ["Low", "Medium", "High", "VeryHigh"];
const AGGREGATE = ["Count", "Sum Area", "Sum Length"];
const SORT_ORDER = ["Ascending", "Descending"];

interface SearchInputProps<V> {
    options: undefined | V[];
    selected: undefined | string[];
    setSelected: (ids: string[]) => void;
    id: (row: V) => string;
    name: (row: V) => string;
    object: string;
    objects?: string;
}

function SearchInput<V>(props: SearchInputProps<V>) {
    return (
        <SearchSelect
            ident={`${props.object}-filter`}
            find={ids =>
                props.options &&
                ids.map(id => props.options!.find(m => props.id(m) === id)!)
            }
            options={() => props.options}
            id={props.id}
            name={props.name}
            selected={props.selected ?? []}
            onChange={e => props.setSelected(e)}
            output={(row, query) =>
                boldQuery(row.label, query, "font-semibold underline")
            }
            className="block w-full"
            placeholder={`Filter by ${props.object}...`}
            suppress={false}
            object={props.object}
            objects={props.objects}
        />
    );
}

/**
 * This is a page for allowing the user to performing a query.
 */
export default function QueryPage() {
    const [infraTypes, setInfraTypes] = useParam("infraTypes", INFRA_TYPES);
    const [hazardTypes, setHazardTypes] = useParam("hazardTypes", HAZARD_TYPES);
    const [domains, setDomains] = useParam("domains", [] as string[]);
    const [dangerLevels, setDangerLevels] = useParam(
        "dangerLevels",
        [] as string[],
    );
    const [municipIds, setMunicipIds] = useParam("municipIds", [] as string[]);
    const [groupBy, setGroupBy] = useParam("groupBy", 0);
    const [aggregate, setAggregate] = useParam("aggregate", "Count");
    const [order, setOrder] = useParam("order", "Ascending");
    const [limit, setLimit] = useParam("limit", -1);
    const municips = useMunicipalities();
    return (
        <ContentWrap>
            <div className="grow w-full h-full mb-10">
                <article
                    className="rounded-xl bg-base-300/40 mt-6"
                    style={{ viewTransitionName: "article" }}
                >
                    <div className="p-8">
                        <span>
                            <SearchInput
                                options={INFRA_TYPES}
                                selected={infraTypes}
                                setSelected={setInfraTypes}
                                id={row => row}
                                name={row => row}
                                object="infrastructure type"
                            />
                        </span>
                        <span
                            className={
                                infraTypes.length === 0 ? "disabled" : ""
                            }
                        >
                            <SearchInput
                                options={DOMAINS}
                                selected={domains}
                                setSelected={setDomains}
                                id={row => row}
                                name={row => row}
                                object="domain"
                            />
                        </span>
                        <span>
                            <SearchInput
                                options={HAZARD_TYPES}
                                selected={hazardTypes}
                                setSelected={setHazardTypes}
                                id={row => row}
                                name={row => row}
                                object="hazard type"
                            />
                        </span>
                        <span
                            className={
                                hazardTypes.length === 0 ? "disabled" : ""
                            }
                        >
                            <SearchInput
                                options={DANGER_LEVELS}
                                selected={dangerLevels}
                                setSelected={setDangerLevels}
                                id={row => row}
                                name={row => row}
                                object="danger level"
                            />
                        </span>
                        <span>
                            <SearchInput
                                options={municips}
                                selected={municipIds}
                                setSelected={setMunicipIds}
                                id={row => row.iri}
                                name={row =>
                                    `${row.name_de} - ${row.name_it}` +
                                    (row.name_ld === undefined
                                        ? ""
                                        : ` - ${row.name_ld}`)
                                }
                                object="municipality"
                                objects="municipalities"
                            />
                        </span>
                    </div>
                </article>
            </div>
        </ContentWrap>
    );
}
