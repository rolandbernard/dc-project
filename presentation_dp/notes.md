* Title
* Introduction
    * Given some data in a database table, we want to describe the syntactic structure in the columns.
    * This is a single-column analysis.
    * Given a set of strings we want a description of a language containing them.
* Motivation
    * Summarized information about column contents.
    * More efficient to handle than the complete dataset.
    * Syntactic patterns can reveal semantic types. e.g.:
        * [0-1]\d/[0-1]\d/[1-2]\d\d\d is likely a date attribute.
* Motivating Applications
    * Automatically labeling columns.
    * Comparing similarity of attributes.
    * Syntax-Based Outlier detection.
* Why is this a Difficult Problem?
    * We only have access only to positive examples.
    * We can just OR all of the examples, but that would not be informative.
    * Syntactic description should be:
        * Compact and interpretable by humans
        * Efficient to learn
        * Comparable
* Why not use Regular Expressions?
    * Inference of minimal regular expressions is NP-hard.
    * Existing algorithms are too slow.
    * Regular expressions are more expressive than needed.
    * Real database columns often have:
        * Low variety of lengths.
        * Few structural variations.
        * Mostly finite languages.
* XTRUCTURE Architecture
    * Less expressive than regular expressions.
        * Can represent finite subset of regular expressions.
    * Three levels of representation:
        * Branch layer.
        * Token layer.
        * Symbol layer.
* XTRUCTURE Architecture -- Symbol Layer
    * Bottom layer of the structure.
    * Represented by a distribution over characters.
    * Not just the set of possible characters, but also their frequencies.
* XTRUCTURE Architecture -- Token Layer
    * A fixed length sequence of symbols.
    * Tokens separated by delimiters, e.g., '/', '.', or '-'.
* XTRUCTURE Architecture -- Branch Layer
    * Multiple delimiter separated tokens per-branch.
    * Branches only at the top level.
    * Branching the only mechanism for variable-length.
* Learning Process
    * Iterative process by added one tuple at a time:
        * Compute fit of new tuple with existing branches.
        * If below a threshold, merge into best branch.
        * Otherwise, create a new branch for the tuple.
    * Repeat for all tuples in the column.
* Learning Process -- Branch and Merge
    * The branching threshold is an unintuitive hyperparameter.
        * Replace it with a maximum branch factor.
    * Initialize with low branching threshold.
    * Once maximum branch factor is exceeded, merge the two most similar branches.
    * Update branching threshold to be the distance between the just merged branches.
    * Can build multiple structures in parallel and then merge at the end.
* Fit Scoring Explained
    * Determine how well a string fits an XTRUCTURE
    * Symbol-level scoring: Based on exact including or character class matching.
    * Token-level distance: Sum of symbol scoring with penalty for length mismatch.
    * Branch-level distance: Minimum among all branches.
* Representation and Character Classes
    * To represent XTRUCTUREs in human readable for we need to decide on how to represent the symbol layer.
    * Use X² test to decide whether to:
        * A single character,
        * a predefined character class (e.g., digit), or
        * use an OR list of characters
* Comparing XTRUCTUREs
    * Need to compare XTRUCTUREs for label assignment and attribute comparison.
    * Comparison between A and B computes two numbers:
        * How well do tuples generated from A fit into B.
        * And vice versa.
    * Estimation based on random sampling.
* LSH for Approximate Similarity Search
    * For finding similar attributes all-pairs comparison is too expensive.
    * Generate sets triples (character, hinge, position) from XTRUCTUREs.
    * Use MinHash for approximate Jaccard index over those sets.
* Evaluation -- Automatic Label Assignment
    * Match XTRUCTUREs to library of regex-label pairs.
    * Assignment compared to manually assigned ground truth.
    * 94% accuracy across three different datasets.
* Evaluation -- Attribute Similarity Search
    * Finds similar columns in datasets.
    * Compared to manually labeled ground truth.
    * Compares both all-pairs distance and LSH-based approximation:
        * Both reach about 80% F1-score at best.
* Evaluation -- Syntax-Based Outlier Detection
    * Outlier detection based:
        * Fit XTRUCTURE on subsets of data.
        * Check how well other samples fit the XTRUCTURE.
        * Outliers fir badly into the structure.
    * Very high precision and recall on evaluated datasets.
* Strengths
    * Fast pattern learning.
    * Human-readable outputs.
    * Supports probabilistic generation.
* Limitations
    * Cannot represent cyclic languages.
    * Cannot handle highly unstructured text.
    * Sensitive to rare branching structures.
* Quiz
