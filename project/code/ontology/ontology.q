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