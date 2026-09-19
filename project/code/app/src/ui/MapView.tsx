import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { wktToGeoJSON } from "@terraformer/wkt";
import type { GeoJSON as GeoJSONType, Geometry } from "geojson";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useColorTheme } from "../hooks";

export interface MapFeature {
    id: number;
    name: string;
    wkt: string;
    meta?: Record<string, any>;
}

interface ControllerProps {
    selectedGeoJson: GeoJSONType | null;
    allFeatures: { geoJson: GeoJSONType }[];
}

/**
 * Helper component to programmatically fly to / focus selected geometry.
 */
function MapController(props: ControllerProps) {
    const map = useMap();
    useEffect(() => {
        if (props.selectedGeoJson) {
            const layer = L.geoJSON(props.selectedGeoJson);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                    map.flyTo(bounds.getNorthEast(), 14, { duration: 0.2 });
                } else {
                    map.flyToBounds(bounds, {
                        padding: [50, 50],
                        duration: 0.2,
                    });
                }
            }
        } else if (props.allFeatures.length > 0) {
            const featureGroup = L.featureGroup();
            props.allFeatures.forEach(geoJson => {
                featureGroup.addLayer(L.geoJSON(geoJson.geoJson));
            });
            const allBounds = featureGroup.getBounds();
            if (allBounds.isValid()) {
                map.flyToBounds(allBounds, {
                    padding: [10, 10],
                    duration: 0.2,
                });
            }
        }
    }, [props.selectedGeoJson, props.allFeatures, map]);
    return null;
}

interface Props {
    features: undefined | MapFeature[];
    onFeatureSelect?: (feature: number | null) => void;
    selectedId?: number | null;
}

export default function MapView(props: Props) {
    const theme = useColorTheme();
    const parsedFeatures = useMemo(
        () =>
            props.features?.map(item => ({
                ...item,
                geoJson: {
                    type: "Feature",
                    properties: { id: item.id, name: item.name },
                    geometry: wktToGeoJSON(item.wkt) as Geometry,
                } as GeoJSONType,
            })),
        [props.features],
    );
    const activeFeature = useMemo(
        () => parsedFeatures?.find(f => f.id === props.selectedId),
        [parsedFeatures, props.selectedId],
    );
    const [selColor, mainColor] = ["#ffff00", "#3b82f6"];
    return (
        <div
            className={"h-128 w-full" + (!props.features ? " loading" : "")}
            onClick={e => {
                if ((e.target as HTMLElement).tagName === "DIV") {
                    props.onFeatureSelect?.(null);
                }
            }}
        >
            <MapContainer
                center={[0, 0]}
                zoom={10}
                maxZoom={14}
                style={{
                    width: "100%",
                    height: "100%",
                    transition: "none",
                }}
            >
                <TileLayer
                    url={
                        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_" +
                        { light: "Light", dark: "Dark" }[theme] +
                        "_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    }
                />
                {parsedFeatures?.map(item => {
                    const isSelected = item.id === props.selectedId;
                    return (
                        <GeoJSON
                            key={item.id}
                            data={item.geoJson}
                            pointToLayer={(_, latlng) => {
                                return L.circleMarker(latlng, {
                                    radius: isSelected ? 8 : 6,
                                    color: isSelected ? selColor : mainColor,
                                    fillColor: isSelected
                                        ? selColor
                                        : mainColor,
                                    weight: isSelected ? 3 : 1.5,
                                    opacity: 1,
                                    fillOpacity: 0.8,
                                });
                            }}
                            style={() => ({
                                color: isSelected ? selColor : mainColor,
                                fillColor: isSelected ? selColor : mainColor,
                                fillOpacity: isSelected ? 0.5 : 0.3,
                                weight:
                                    (isSelected ? 7 : 5) +
                                    (item.wkt.includes("LINE") ? 2 : 0),
                                opacity: 1,
                            })}
                            onEachFeature={(_, layer) => {
                                layer.on({
                                    click: e => {
                                        L.DomEvent.stopPropagation(e);
                                        props.onFeatureSelect?.(item.id);
                                    },
                                });
                            }}
                        />
                    );
                })}
                <MapController
                    selectedGeoJson={activeFeature?.geoJson || null}
                    allFeatures={parsedFeatures ?? []}
                />
            </MapContainer>
        </div>
    );
}
