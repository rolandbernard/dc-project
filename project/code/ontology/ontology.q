[QueryGroup="TESTING"] @collection [[
[QueryItem="LIST-DISTRICT"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?district ?name {
  ?district a :District ; :districtNameDe ?name .
}
[QueryItem="LIST-MUNICIPALITY"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?municipality ?name {
  ?municipality a :Municipality ; :nameDe ?name .
}
[QueryItem="LIST-INFRASTRUCTURE"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?infrastructure ?kind {
  ?infrastructure a :Infrastructure ; :typeNameDe ?kind .
}
[QueryItem="LIST-HAZARD"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?hazard ?process ?danger {
  ?hazard a :HazardZone ; :processNameDe ?process  ; :dangerNameDe ?danger .
}
[QueryItem="INTERSECTS"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?municipality ?hazard ?process ?danger {
  ?hazard a :HighDangerZone;
    :processNameDe ?process ;
    :dangerNameDe ?danger.
  ?municipality a :Municipality ;
    :intersectsWith ?hazard .
}
]]
[QueryItem="QUERY1"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?waterNode ?landslideZone
WHERE {
  # Water infrastructure node
  ?waterNode a :InfrastructureNode, :WaterInfrastructure.

  # Landslide zone with high or very high danger level
  ?landslideZone a :LandslideZone , ?dangerType .
  FILTER (?dangerType IN (:HighDangerZone, :VeryHighDangerZone))

  # Exposure intersection
  ?waterNode :isExposedTo ?landslideZone .
}
[QueryItem="QUERY2"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT DISTINCT ?infraLine ?avalancheZone
WHERE {
  ?infraLine a :InfrastructureLine .
  ?avalancheZone a :AvalancheZone .
  
  # Link between infrastructure line and the hazard zone
  ?infraLine :isExposedTo ?avalancheZone .
}
[QueryItem="QUERY3"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT ?municipality (COUNT(DISTINCT ?energyLine) AS ?electricityLineCount)
WHERE {
  # Specify the municipality
  ?municipality a :Municipality ; :nameDe "Bozen" .

  # Infrastructure energy lines in this municipality
  ?energyLine a :InfrastructureLine , :EnergyInfrastructure ;
    :infrastructureIn ?municipality ;
    :isExposedTo ?hazardZone .
              
  # Ensure the hazard zone itself is in the same municipality
  ?hazardZone :hazardZoneIn ?municipality .
}
GROUP BY ?municipality
[QueryItem="QUERY4"]
PREFIX : <http://rolandb.com/ontologies/dc#>

SELECT ?municipality ?municipalityNameDe (COUNT(DISTINCT ?infra) AS ?exposedInfraCount)
WHERE {
  ?municipality a :Municipality ; :nameDe ?municipalityNameDe .
  
  # Infrastructure located in the municipality and exposed to a hazard zone
  ?infra a :Infrastructure ;
    :infrastructureIn ?municipality ;
    :isExposedTo ?hazardZone .
}
GROUP BY ?municipality ?municipalityNameDe
ORDER BY DESC(?exposedInfraCount)