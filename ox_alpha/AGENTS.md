## OpenSpec
* When creating a `spec.md` file, assign numbers to each requirement and scenario.
* When creating a `design.md` file, include a section with class diagrams in Mermaid format for all classes that are involved in the latest change.  Whenever possible, design decisions should reference the numbered requirements from a `spec.md` file.
* When creating a `proposal.md` file, use Mermaid diagrams for architecture visualizations and flow diagrams instead of ASCII art.
* When creating any diagrams in markdown files, use Mermaid instead of ASCII diagrams, whenever possible.
* When archiving changes, move files and directories using `git mv`.

## Code comments
* Documentation comments should be Javadoc for Java or JSDoc for Javascript/Typescript or Documentation strings for Python.
* All classes must have class level documentation comments.
* All static methods and public methods which exceed 8 lines should have documentation comments.
* Whenever appropriate, add comments tracing back to requirements numbers in the PRD or `spec.md` documents.

## Typescript
* Typescript files should be built using [Vite](https://vite.dev/).
* Unit tests should be implemented using [Vitest](https://vitest.dev/).
* Make good use of object orientation.
* Annotate types everywere.  Avoid using 'any'.
* The tsconfig.json file should have the following properties:
    * target = ES2020
    * module = ESNext

## File changes and git
* When deleting a file in a directory managed by git, always use `git rm` for the deletion.
* When moving or renaming a file (or directory) in a directory managed by git, always use `git mv` for the operation.

