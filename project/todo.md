# Data Profiling Part
* Export the datasets of interest and perform Elementary Data Analysis (EDA) by means of either existing tools and libraries or your own EDA algorithm implementations. Report the results of the EDA and comment on them in the final project documentation.
* Design one or more relational databases to structure and store the exported datasets and show how the dependency discovery algorithms (see, UCC, FD, and IND) introduced in the course have been used to extract metadata that supported the database/s designing process.
* The results obtained by profiling the datasets for dependency discovery, and the consequent database schema design choices, must be properly commented in the final project documentation.

# Data Preparation and Integration Part
* Consider the domain (and the data-sets within that domain) that you have chosen for the Data Profiling part, and model the domain by means of an ontology/mediated schema. The ontology should represent all information that is relevant for the domain of interest, and it should be rich enough (at least 10 classes, plus the corresponding object and data properties).
* Represent the ontology/mediated schema using the graphical notation introduced in the course (or similar).
* Represent the ontology in Protégé.
* Consider the relational database (or databases) that you have designed for the Data Profiling module, including the relevant constraints that you have specified and/or extracted from the data.
  Note that the choice of having multiple databases, instead of a single one, has an impact on the technological solution that you will need to deploy. In particular, having multiple databases to integrate implies the necessity to rely on a federation system (like Teiid, Denodo, or Dremio, for instance) as an intermediate layer between the sources and ontop. This is obviously not needed if you work with a single database.
* Design VKG mappings to connect the ontology to the database (or the federated relational schema exposed by the federation system), using the Ontop Plugin for Protégé (or Ontopic Studio).
* Develop an application (e.g., in Java) for your domain that makes use of Ontop as a SPARQL endpoint to query the database through the ontology, extracting information that is of interest for your domain of choice.
  As an example for the kinds of queries that could be posed via your application, you can consider the queries underlying travel booking sites, where some parameters of a request are filled in via a form (e.g., the departure city, departure and arrival date and time, etc.), and answers are retrieved using those parameters. (You have to take into account the SPARQL fragment that is supported by the current version of Ontop.)
