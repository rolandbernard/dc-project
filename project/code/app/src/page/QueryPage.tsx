import ContentWrap from "../ui/ContentWrap";
import SearchSelect from "../ui/SearchSelect";

import {
    municipalityLabel,
    useDynamicQuery,
    useMunicipalities,
    type QueryFilters,
} from "../api";
import { useParam } from "../hooks";
import { boldQuery } from "../util";
import TableView from "../ui/TableView";

const INFRA_TYPES = ["Line", "Node"];
const HAZARD_TYPES = ["Landslide", "Avalanche"];
const DOMAINS = ["Water", "Energy", "Waste", "Communication"];
const DANGER_LEVELS = ["Low", "Medium", "High", "VeryHigh"];

interface SearchInputProps<V> {
    options: undefined | V[];
    selected: undefined | string[];
    setSelected: (ids: string[]) => void;
    id: (row: V) => string;
    name: (row: V) => string;
    object: string;
    objects?: string;
}

function SearchFilter<V>(props: SearchInputProps<V>) {
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
    const [groupBy, setGroupBy] = useParam("groupBy", 0 as number);
    const municips = useMunicipalities();
    const results = useDynamicQuery({
        infraTypes: infraTypes,
        hazardTypes: hazardTypes,
        domains: domains,
        dangerLevels: dangerLevels,
        municipalities: municipIds,
        groupByMunicipality: !!groupBy,
    } as QueryFilters);
    return (
        <ContentWrap>
            <div className="grow w-full h-full mb-10">
                <article
                    className="rounded-xl bg-base-300/40 mt-6"
                    style={{ viewTransitionName: "article" }}
                >
                    <div className="p-8 flex flex-col gap-1">
                        <div className="text-sm flex flex-col items-start justify-end pt-0.5 px-1">
                            <div className="pe-3 text-xs whitespace-nowrap select-none">
                                Infrastructure Type
                            </div>
                            <SearchFilter
                                options={INFRA_TYPES}
                                selected={infraTypes}
                                setSelected={setInfraTypes}
                                id={row => row}
                                name={row => row}
                                object="infrastructure type"
                            />
                        </div>
                        <div
                            className={
                                "text-sm flex flex-col items-start justify-end pt-0.5 px-1 " +
                                (infraTypes.length === 0 ? "disabled" : "")
                            }
                        >
                            <div className="pe-3 text-xs whitespace-nowrap select-none">
                                Infrastructure Domain
                            </div>
                            <SearchFilter
                                options={DOMAINS}
                                selected={domains}
                                setSelected={setDomains}
                                id={row => row}
                                name={row => row}
                                object="domain"
                            />
                        </div>
                        <div className="text-sm flex flex-col items-start justify-end pt-0.5 px-1">
                            <div className="pe-3 text-xs whitespace-nowrap select-none">
                                Hazard Type
                            </div>
                            <SearchFilter
                                options={HAZARD_TYPES}
                                selected={hazardTypes}
                                setSelected={setHazardTypes}
                                id={row => row}
                                name={row => row}
                                object="hazard type"
                            />
                        </div>
                        <div
                            className={
                                "text-sm flex flex-col items-start justify-end pt-0.5 px-1 " +
                                (hazardTypes.length === 0 ? "disabled" : "")
                            }
                        >
                            <div className="pe-3 text-xs whitespace-nowrap select-none">
                                Danger Level
                            </div>
                            <SearchFilter
                                options={DANGER_LEVELS}
                                selected={dangerLevels}
                                setSelected={setDangerLevels}
                                id={row => row}
                                name={row => row}
                                object="danger level"
                            />
                        </div>
                        <div className="text-sm flex flex-col items-start justify-end pt-0.5 px-1">
                            <div className="pe-3 text-xs whitespace-nowrap select-none">
                                Municipality
                            </div>
                            <SearchFilter
                                options={municips}
                                selected={municipIds}
                                setSelected={setMunicipIds}
                                id={row => row.iri}
                                name={municipalityLabel}
                                object="municipality"
                                objects="municipalities"
                            />
                        </div>
                        <div className="text-sm flex flex-col items-start justify-end pt-0.5 px-1">
                            <label
                                htmlFor="group-by-municip"
                                className="flex flex-row items-center cursor-pointer select-none
                                           rounded-field hover:bg-content/10 px-2 not-xl:px-2 py-px"
                            >
                                <input
                                    id="group-by-municip"
                                    className="w-4 h-4 appearance-none border border-border bg-base-200
                                               checked:bg-primary cursor-pointer shrink-0"
                                    type="checkbox"
                                    checked={groupBy !== 0}
                                    onChange={e => {
                                        setGroupBy(e.target.checked ? 1 : 0);
                                    }}
                                />
                                <div
                                    className="pl-2 overflow-hidden overflow-ellipsis whitespace-nowrap
                                               py-0.5 text-content/95"
                                    title="Group the outputs based on municipality?"
                                >
                                    Group by Municipality
                                </div>
                            </label>
                        </div>
                    </div>
                    <TableView name="table" data={results} />
                </article>
            </div>
        </ContentWrap>
    );
}
