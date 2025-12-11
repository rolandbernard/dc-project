* Title
* Introduction
    * Goal: Given a column of string in a database table, automatically infer its syntactic structure.
    * This is strictly single-column analysis, no relational context needed.
    * Problem formulation:
        * Given a set of example strings S, produce a compact description of a language that contains them.
        * This description should generalize beyond the examples.
* Motivation
    * Structured summaries of columns are:
        * More compact than full datasets.
        * Easier to compare, search, and interpret.
    * Syntactic patterns can reveal semantic types.
        * Example: [0-1]\d/[0-1]\d/[1-2]\d\d\d is likely a date attribute.
* Motivating Applications
    * Automatic label assignment:
        * Match a column’s pattern to a library of known regex-semantic-label pairs.
    * Attribute similarity comparison:
        * Identify columns with compatible syntactic formats (e.g., potential join keys).
    * Syntax-based outlier detection:
        * Detect malformed or unusual tuples based on poor structural fit.
* Why is this a Difficult Problem?
    * We only have positive examples, i.e., no information about what is not allowed.
    * Naively OR-ing all strings gives a valid description that is useless, i.e., completely non-generalized.
    * Syntactic description should be:
        * Compact
        * Human-interpretable
        * Fast to learn
        * Directly comparable across attributes
* Why not use Regular Expressions?
    * Learning minimal regular expressions is NP-hard.
    * Existing algorithms are too slow.
    * Regular expressions are also more expressive than needed.
    * Real database columns often have:
        * Low variety of lengths.
        * Few structural variations.
        * Mostly finite languages.
* XTRUCTURE Architecture
    * Less expressive than regular expressions.
        * Can represent finite subset of regular expressions.
        * Sufficient for most database attributes.
    * Three levels of representation:
        * Branch layer: Alternative structural formats.
        * Token layer: Sequences split by delimiters.
        * Symbol layer: Distributions over characters.
* XTRUCTURE Architecture -- Symbol Layer
    * The lowest layer, modeling each character position.
    * Stores distribution over characters.
    * Encodes both:
        * Which characters appear.
        * Their frequencies, enabling statistically informed generalization.
* XTRUCTURE Architecture -- Token Layer
    * Represents a fixed-length sequence of symbol layers.
    * Tokens separated by delimiters, e.g., '/', '.', or '-'.
    * Example: "10/12/2018" tokenizes into "10", "12", "2018".
* XTRUCTURE Architecture -- Branch Layer
    * Top layer, representing alternative syntactic formats.
        * Example: dates with 2-digit vs. 4-digit years.
    * Each branch is a sequence of tokens plus delimiters.
    * Only place where variability in length is possible.
* Learning Process
    * Iterative process by added one tuple at a time:
        * Compute fit of new tuple with existing branches.
        * If fir is below a threshold, merge into best branch.
        * Otherwise, create a new branch for the tuple.
    * Repeat for all tuples in the column.
* Learning Process -- Branch and Merge
    * Issue: branching threshold is unintuitive to tune.
        * Solution: user chooses instead a maximum number of branches.
    * Learning process:
        * Start with low initial branching threshold.
        * Whenever branches exceed the maximum:
            * Merge the two most similar branches.
            * Update threshold to the distance between them.
    * Enables parallel learning: independently learned branches can be merged later.
* Fit Scoring Explained
    * Fit score = measure of how well a string matches a XTRUCTURE.
    * Defined at 3 levels:
        * Symbol-level scoring: based on exact match or character class membership.
        * Token-level distance: sum of symbol scoring with penalty for length mismatch.
        * Branch-level distance: minimum distance across branches.
* Representation and Character Classes
    * For human-readability, symbol layers must be serialized.
    * Use an X² test to decide whether to represent as:
        * A single character,
        * A standard character class (e.g., digit), or
        * An OR list of characters.
* Comparing XTRUCTUREs
    * Need to compare XTRUCTUREs for label assignment and attribute comparison.
    * Comparison between A and B yields two scores:
        * How well samples from A fit B.
        * How well samples from B fit A.
    * Estimation based on random sampling.
* LSH for Approximate Similarity Search
    * For finding similar attributes all-pairs comparison is too expensive.
    * Generate sets triples (character, hinge, position) from XTRUCTUREs.
        * Example: "10/12" generates ('1', 0, 0), ('0', 0, 1), ('1', 1, 0), and ('2', 1, 1).
    * Use MinHash for approximate Jaccard index over those sets.
* Evaluation -- Automatic Label Assignment
    * Match XTRUCTUREs to library of regex-label pairs.
    * Assignment compared to manually assigned ground truth.
    * 94% accuracy across three different datasets.
* Evaluation -- Attribute Similarity Search
    * Task is to find similar columns in datasets.
    * Results compared to manually labeled ground truth.
    * Compares both all-pairs distance and LSH-based approximation:
        * Both reach about 80% F1-score at best.
* Evaluation -- Syntax-Based Outlier Detection
    * Outlier detection based:
        * Fit XTRUCTURE on subsets of data.
        * Evaluate how well new samples fit that structure.
        * Outliers fit badly into the structure.
    * Very high precision and recall on evaluated datasets.
* Strengths
    * Fast learning even on large datasets.
    * Human-readable outputs, similar to regular expressions.
    * Supports probabilistic generation.
    * Works with only positive examples.
    * Parallelizable.
* Limitations
    * Cannot represent cyclic languages.
    * Cannot handle highly unstructured text.
    * Sensitive to rare branching structures.
* Quiz
