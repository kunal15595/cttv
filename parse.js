Papa.SCRIPT_PATH = "./papaparse.js";


var oReq = new XMLHttpRequest();
oReq.addEventListener("load", initParse);

// remote
oReq.open("GET", "http://rawgit.com/kunal15595/cttv/gh-pages/gwas_catalog_v1.0.1-associations_e84_r2016-03-13.tsv");

// localhost
// oReq.open("GET", "http://localhost/cttv/gwas_catalog_v1.0.1-associations_e84_r2016-03-13.tsv");

oReq.send();


function initParse() {
    Papa.parse(this.responseText, {
        header: true,
        delimiter: "\t",
        worker: true,
        dynamicTyping: true,
        step: function(row, parser) {

            if (Math.random() < 0.85)
                return;

            if (nodeId > 800)
                return;

            var mappedTraits = row.data[0]['MAPPED_TRAIT'].split(',');

            if (mappedTraits.length > 8 || mappedTraits.length < 2)
                return;

            // console.log(row.data[0]['INTERGENIC_ENSEMBL'], row.data[0]['SNP_GENE_IDS_ENSEMBL'], row.data[0]['ENSEMBL_UPSTREAM_GENE_ID']);
            // console.log(row.data[0]['INTERGENIC_ENTREZ'], row.data[0]['SNP_GENE_IDS_ENTREZ'], row.data[0]['ENTREZ_UPSTREAM_GENE_ID']);
            // console.log("Row:", row.data[0]['STRONGEST SNP-RISK ALLELE']);
            // console.log(row.data[0]['CHR_ID'], row.data[0]['CHR_POS'],  row.data[0]['REGION']);
            // console.log(row.data[0]['CHR_POS'] + ': :' + row.data[0]['CHR_ID']);

            var linkSource, linkTarget, linkGene;

            if (!traits.hasOwnProperty(row.data[0]['DISEASE/TRAIT'])) {
                traits[row.data[0]['DISEASE/TRAIT']] = nodeId;
                linkSource = nodeId;
                nodes.push({
                    "type": "trait",
                    "id": nodeId++,
                    "label": "Trait: " + row.data[0]['DISEASE/TRAIT'],
                    "class": "node trait",
                    "r": radius - .75,
                    "charge": -100,
                    "friction": 0.3,
                    "chargeDistance": 20,
                    "gene2genes": []
                });


            } else {
                linkSource = traits[row.data[0]['DISEASE/TRAIT']];
            }

            if (!targets.hasOwnProperty(row.data[0]['SNP_ID_CURRENT'])) {
                targets[row.data[0]['SNP_ID_CURRENT']] = nodeId;
                linkTarget = nodeId;
                nodes.push({
                    "type": "target",
                    "id": nodeId++,
                    "label": "Target: " + row.data[0]['SNP_ID_CURRENT'],
                    "class": "node target",
                    "r": radius - .75,
                    "charge": -100,
                    "friction": 0.3,
                    "chargeDistance": 20,
                    "gene2genes": []
                });
            } else {
                linkTarget = targets[row.data[0]['SNP_ID_CURRENT']];
            }

            var nodesInStudy = [];

            for (var i = mappedTraits.length - 1; i >= 0; i--) {
                if (!genes.hasOwnProperty(mappedTraits[i])) {
                    genes[mappedTraits[i]] = nodeId;
                    linkGene = nodeId;
                    nodes.push({
                        "type": "gene",
                        "id": nodeId++,
                        "label": mappedTraits[i],
                        "r": 2,
                        "region": mappedTraits[i],
                        "class": "node gene",
                        "charge": -50,
                        "friction": 0.9,
                        "chargeDistance": 50,
                        "gene2genes": []
                    });
                } else {
                    linkGene = genes[mappedTraits[i]];
                }
                nodesInStudy.push(linkGene);

            }
            nodesInStudy.sort();

            if (nodesInStudy.length > 1) {
                var connectingNodeId;

                if (!gene2genes.hasOwnProperty(nodesInStudy)) {
                    gene2genes[nodesInStudy] = nodeId;
                    connectingNodeId = nodeId;

                    nodes.push({
                        "type": "gene2gene",
                        "id": nodeId++,
                        "label": "Study: " + row.data[0]['STUDY'],
                        "region": mappedTraits[i],
                        "class": "node gene2gene",
                        "r": Math.log(1 + row.data[0]['PVALUE_MLOG']),
                        "charge": -50,
                        "friction": 0.6,
                        "chargeDistance": 50,
                        "genes": [],
                        "traits": [],
                        "targets": []
                    });
                    for (var i = nodesInStudy.length - 1; i >= 0; i--) {
                        links.push({
                            "source": connectingNodeId,
                            "target": nodesInStudy[i],
                            "class": "link gg",
                            "linkStrength": 1,
                            "linkDistance": 5
                        });
                        nodes[nodesInStudy[i]].gene2genes.push(nodes[connectingNodeId]);
                        nodes[connectingNodeId].genes.push(nodes[nodesInStudy[i]]);
                    }
                } else {
                    connectingNodeId = gene2genes[nodesInStudy];
                }

                links.push({
                    "source": linkSource,
                    "target": connectingNodeId,
                    "class": "link sg",
                    "linkStrength": 0.2,
                    "linkDistance": 50
                });
                links.push({
                    "source": connectingNodeId,
                    "target": linkTarget,
                    "class": "link gt",
                    "linkStrength": 0.2,
                    "linkDistance": 50
                });
                nodes[linkSource].gene2genes.push(nodes[connectingNodeId]);
                nodes[linkTarget].gene2genes.push(nodes[connectingNodeId]);

                nodes[connectingNodeId].traits.push(nodes[linkSource]);
                nodes[connectingNodeId].targets.push(nodes[linkTarget]);


            }

        },
        complete: function() {
            console.log("Database reading completed!");
            // console.log(links);
            viz();
        }
    });


}

/*

Sample Data (One entry of database) :

	95% CI (TEXT): "[1.23-1.73]"
	CHR_ID: 21
	CHR_POS: 39008323
	CNV: "N"
	CONTEXT: "intron_variant"
	DATE: "07-Dec-2006"
	DATE ADDED TO CATALOG: "25-Nov-2008"
	DISEASE/TRAIT: "Nicotine dependence"
	ENSEMBL_DOWNSTREAM_GENE_DISTANCE: ""
	ENSEMBL_DOWNSTREAM_GENE_ID: ""
	ENSEMBL_MAPPED_GENE: "AF064858.11"
	ENSEMBL_UPSTREAM_GENE_DISTANCE: ""
	ENSEMBL_UPSTREAM_GENE_ID: ""
	ENTREZ_DOWNSTREAM_GENE_DISTANCE: ""
	ENTREZ_DOWNSTREAM_GENE_ID: ""
	ENTREZ_MAPPED_GENE: "LOC102724740"
	ENTREZ_UPSTREAM_GENE_DISTANCE: ""
	ENTREZ_UPSTREAM_GENE_ID: ""
	FIRST AUTHOR: "Bierut LJ"
	INITIAL SAMPLE DESCRIPTION: "482 European ancestry cases, 466 European ancestry controls"
	INTERGENIC_ENSEMBL: 0
	INTERGENIC_ENTREZ: 0
	JOURNAL: "Hum Mol Genet"
	LINK: "http://europepmc.org/abstract/MED/17158188"
	MAPPED_TRAIT: "nicotine dependence"
	MAPPED_TRAIT_URI: "http://www.ebi.ac.uk/efo/EFO_0003768"
	MERGED: 0
	OR or BETA: 1.46
	P-VALUE: 0.000002
	P-VALUE (TEXT): ""
	PLATFORM [SNPS PASSING QC]: "Perlegen [2.4 million] (pooled)"
	PUBMEDID: 17158188
	PVALUE_MLOG: 5.698970004336019
	REGION: "21q22.2"
	REPLICATION SAMPLE DESCRIPTION: "568 European ancestry cases, 413 European ancestry controls"
	REPORTED GENE(S): "NR"
	RISK ALLELE FREQUENCY: 0.4
	SNPS: "rs2836823"
	SNP_GENE_IDS_ENSEMBL: "ENSG00000237721"
	SNP_GENE_IDS_ENTREZ: 102724740
	SNP_ID_CURRENT: 2836823
	STRONGEST SNP-RISK ALLELE: "rs2836823-T"
	STUDY: "Novel genes identified in a high-density genome wide association study for nicotine dependence."

	--------------------------------------

	CHR_ID: 21
	CHR_POS: 39008323
	CNV: "N"
	CONTEXT: "intron_variant"
	DISEASE/TRAIT: "Nicotine dependence"
	ENSEMBL_MAPPED_GENE: "AF064858.11"
	ENTREZ_MAPPED_GENE: "LOC102724740"
	INTERGENIC_ENSEMBL: 0
	INTERGENIC_ENTREZ: 0
	MAPPED_TRAIT: "nicotine dependence"
	MERGED: 0
	OR or BETA: 1.46
	P-VALUE: 0.000002
	P-VALUE (TEXT): ""
	PVALUE_MLOG: 5.698970004336019
	REGION: "21q22.2"
	REPORTED GENE(S): "NR"
	RISK ALLELE FREQUENCY: 0.4
	SNPS: "rs2836823"
	SNP_GENE_IDS_ENSEMBL: "ENSG00000237721"
	SNP_GENE_IDS_ENTREZ: 102724740
	SNP_ID_CURRENT: 2836823
	STRONGEST SNP-RISK ALLELE: "rs2836823-T"
*/
