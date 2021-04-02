import * as Papa from "papaparse";
import cytoscape from "cytoscape";

window.onload = (event) => {
    var filePicker = document.getElementById("csvPicker");
    filePicker.addEventListener("change", loadCSVs, false);
};

const groupIDtoColumnNameMap = {
    "city": "City",
    "state": "State / Province",
    "country": "Country",
    "competition": "Competition Name"
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
                        complete: resolve,
                        error: reject
                    }))
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

function setUpGraph(nodes) {
    const competitions = Array.from(new Set(nodes.map(row => row["Competition Name"])));

    var graphElements = competitions.map(function(competitionName) {
        return {
            data: {
                id: competitionName,
                competition: true
            },
            style: {
                'background-color': 'orange'
            }
        };
    });

    var i = 0;
    for (let node of nodes) {
        if (node["Org UID"] != "" && node["Org UID"] != undefined) {
            graphElements.push({
                data: {
                    id: node["Org UID"],
                    city: node["City"],
                    country: node["Country"],
                    state: node["State / Province"]
                }
            });

            let edgeStyle = {};
            if (node["Admitted"] == "True") {
                edgeStyle["line-color"] = "green";
            } else if (node["Admitted"] == "False") {
                edgeStyle["line-color"] = "red";
            } else {
                edgeStyle["line-color"] = "gray";
            }
            graphElements.push({
                data: {
                    id: i,
                    source: node["Org UID"],
                    target: node["Competition Name"]
                },
                style: edgeStyle
            });
        }

        i += 1;
    }

    cy = cytoscape({
        container: document.getElementById("graph"),
        elements: graphElements,
        layout: {
            name: 'cose',
            nodeOverlap: 50,
            nodeRepulsion: 20
        },
        style: [{
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
                    'line-color': 'green'
                }
            }
        ]
    });

    cy.nodes().on('click', function(e) {
        var ele = e.target;
        document.getElementById("info").innerHTML =
            "<table>" +
            "<tr>" + "<td>" + "Org Name: " + ele.id() + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "City: " + ele._private.data.city + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "State / Province: " + ele._private.data.state + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "Country: " + ele._private.data.country + "</td>" + "</tr>" +
            "</table>";
    });

    document.getElementById("groups").addEventListener("change", groupBy);

}

function getNodesToGroupAround(fieldName, type) {
    const nodes = Array.from(new Set(allRows.map(row => row[fieldName])));

    var graphElements = nodes.map(function(instanceName) {
        var ele = {
            data: {
                id: instanceName,
                competition: true
            },
            style: {
                'background-color': 'orange'
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
    for (let node of allRows) {
        if (node["Org UID"] != "" && node["Org UID"] != undefined) {
            graphElements.push({
                data: {
                    id: i,
                    source: node["Org UID"],
                    target: node[fieldName]
                }
            });
        }
        i += 1;
    }
    return graphElements;
}

function getSubmissionNodes() {
    var i = 0;
    var graphElements = [];
    for (let node of allRows) {
        if (node["City"] != undefined) {
            if (node["Org UID"].length == 2) {
                console.log(node["City"]);
            }
            graphElements.push({
                data: {
                    id: node["Org UID"],
                    city: node["City"],
                    country: node["Country"],
                    state: node["State / Province"]
                }
            });
        }
        graphElements.push({
            data: {
                id: i,
                source: node["Org UID"],
                target: node["Competition Name"]
            },
            style: {
                'line-color': ((node["Admin Review Status"] == "Valid" || node["Valid_Submission"] == "True") ? 'green' : 'red')
            }
        });
        i += 1;
    }
    return graphElements;
}

function groupBy() {
    let group = document.getElementById("groups").value;
    let groupIDs = Object.keys(groupIDtoColumnNameMap);
    if (!groupIDs.includes(group)) {
        alert("Not a valid group");
        return;
    }

    let groupsToRemove = groupIDs.filter((g) => g != group);
    for (let g of groupsToRemove) {
        cy.remove("node[" + g + "]");
    }
    let newNodeEles = getNodesToGroupAround(groupIDtoColumnNameMap[group], group);
    let newEdgeEles = getEdges(groupIDtoColumnNameMap[group]);
    cy.add(newNodeEles);
    cy.add(newEdgeEles);
    const layout = cy.layout({
        name: "cose"
    });
    layout.run();

}
