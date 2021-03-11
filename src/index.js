import * as Papa from "papaparse";
import cytoscape from "cytoscape";

window.onload = (event) => {
    var filePicker = document.getElementById("csvPicker");
    filePicker.addEventListener("change", loadCSVs, false);
};

var allRows = [];
var cy;

function loadCSVs() {
    let csvFiles = Array.from(this.files);
    Promise.all(csvFiles
                .map(csvFile => new Promise(
                        (resolve, reject) =>
                        Papa.parse(csvFile, {
                            header: true,
                            complete : resolve,
                            error : reject}))
                        .then(
                            function(results) {
                                for (var result of results.data) {
                                    result["Competition Name"] = csvFile.name.substring(0, csvFile.name.length - 4);
                                }
                                console.log(results.data);
                                allRows.push(results.data);
                                console.log("Another CSV file added");
                                allRows = allRows.flat();
                                console.log(allRows.length);
                            })))
        .then(function(results) {
            setUpGraph(allRows);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function setUpGraph (nodes) {
    const competitions = Array.from(new Set(nodes.map(row => row["Competition Name"])));

    var graphElements = competitions.map(function(competitionName) {
        return {
            data : {
                id: competitionName,
                competition: true
            },
            style : {
                'background-color' : 'orange'
            }
        };
    });

    var i = 0;
    for (let node of nodes) {
        if (node["City"] != undefined) {
            if (node["MediaWiki Title"].length == 2) {
                console.log(node["City"]);
            }
            graphElements.push({
                data : {
                    id : node["MediaWiki Title"],
                    city : node["City"],
                    country : node["Org Country"]
                }
            });
        }
        graphElements.push({
            data : {
                id: i,
                source: node["MediaWiki Title"],
                target: node["Competition Name"]},
            style: {
                'line-color' : ((node["Admin Review Status"] == "Valid" || node["Valid_Submission"] == "True") ? 'green' : 'red')
            }
        });
        i += 1;
    }

    cy = cytoscape({
        container : document.getElementById("graph"),
        elements: graphElements,
        layout: {
            name: 'cose',
            nodeOverlap: 50,
            nodeRepulsion: 20
        },
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'blue'
                }
            },
            {
                selector: 'node[competition]',
                style: {
                    'label': 'data(id)',
                }
            },
            {
                selector: 'edge',
                style: {
                    'line-color' : 'green'
                }
            }
        ]
    });

    cy.nodes().on('click', function(e){
        var ele = e.target;
        document.getElementById("info").innerHTML =
            "<table>" +
            "<tr>" + "<td>" + "Submission Title: " + ele.id() + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "City: " + ele._private.data.city + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "Country: " + ele._private.data.country + "</td>" + "</tr>" +
            "</table>";
    });

    document.getElementById("groups").addEventListener("change", groupBy);

}

function getNodesToGroupAround(fieldName, type) {
    const nodes = Array.from(new Set(allRows.map(row => row[fieldName])));

    var graphElements = nodes.map(function(instanceName) {
        var ele = {
            data : {
                id: instanceName,
                competition: true
            },
            style : {
                'background-color' : 'orange'
            }
        };
        ele.data[type] = true;
        return ele;
    });
    return graphElements;
}

function getEdges(fieldName) {
    var i = 0;
    var graphElements = [];
    for(let node of allRows) {
        graphElements.push({
            data : {
                id: i,
                source: node["MediaWiki Title"],
                target: node[fieldName]}
        });
        i += 1;
    }
    return graphElements;
}

function getSubmissionNodes() {
    var i = 0;
    var graphElements = [];
    for (let node of allRows) {
        if (node["City"] != undefined) {
            if (node["MediaWiki Title"].length == 2) {
                console.log(node["City"]);
            }
            graphElements.push({
                data : {
                    id : node["MediaWiki Title"],
                    city : node["City"],
                    country : node["Org Country"]
                }
            });
        }
        graphElements.push({
            data : {
                id: i,
                source: node["MediaWiki Title"],
                target: node["Competition Name"]},
            style: {
                'line-color' : ((node["Admin Review Status"] == "Valid" || node["Valid_Submission"] == "True") ? 'green' : 'red')
            }
        });
        i += 1;
    }
    return graphElements;
}

function groupBy() {
    let group = document.getElementById("groups").value;
    if(group == "city") {
        cy.remove("node[competition]");
        let cityNodeEles = getNodesToGroupAround("City", group);
        let cityEdgeEles = getEdges("City");
        cy.add(cityNodeEles);
        cy.add(cityEdgeEles);
        const layout = cy.layout({
            name: "cose"
        });
        cy.animate();
        layout.run();
    } else if (group == "competition") {
        cy.remove("node[city]");
        let competitionNodeEles = getNodesToGroupAround("Competition Name", group);
        let submissionNodes = getSubmissionNodes();
        let competitionEdgeEles = getEdges("Competition Name");
        cy.add(competitionNodeEles);
        cy.add(submissionNodes);
        cy.add(competitionEdgeEles);
        const layout = cy.layout({
            name: "cose"
        });
        cy.animate();
        layout.run();
    }
}
