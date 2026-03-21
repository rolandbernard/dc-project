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
]]