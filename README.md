# Visualization of GWAS catalog.

Refer -- [file headers for GWAS catalog](https://www.ebi.ac.uk/gwas/docs/fileheaders)

## Nodes :
* **green** -- set of studies that have same set of mapped traits - EFO
* **white** -- a target
* **red** -- the disease/trait mainly covered in a study
* **yellow** -- other traits

## Links :
* **red-green** -- association of a disease/trait(*red*) to EFO(*green*).
* **yellow-green** -- association of mapped traits(*yellow*) to EFO(*green*).
* **white-green** -- association of a target(*white*) to EFO(*green*).

## Associations :
* **red** -- All studies that cover the trait/disease(*red*), and their associated targets(*white*) and other traits(*yellow*).
* **white** -- All studies that cover this target(*white*), and their associated traits/diseases(*red*) and other traits(*yellow*).
* **green** -- All traits(*yellow*), traits/diseases(*red*) and targets(*white*) associated with the set of similar studies this EFO(*green*) represents.
* **yellow** -- Associated EFO(*green*), all diseases/traits and targets associated with that EFO, and all 1st order associations of this trait with other traits(*yellow*).


## Allowed interactions :
* Moving the mouse to a region zooms it.
* Hover over a node to focus on a node and its associations.
* Double-click on a node to view only its associations, hide everything else. Double-click again to go back into original mode.
* Drag the node to a different region, it stays fixed to this new location, double-click to release.

## Live visualization link :
http://rawgit.com/kunal15595/cttv/gh-pages/

## Example :
Screenshot showing exclusive mode(exclusive on trait - "alcohol drinking")
![Associations](associate.png?raw=true "Associations")

Screenshot showing focus mode(focused on a study)
![Associations](study.png?raw=true "Associations")

## TODO :
* A search capability for entire catalog.
* The database is huge, I'm just taking a random 5% of it. Try to work on a larger part.
