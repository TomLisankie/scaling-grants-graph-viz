import * as Papa from "papaparse";
import cytoscape from "cytoscape";

window.onload = (event) => {
    var filePicker = document.getElementById("csvPicker");
    filePicker.addEventListener("change", loadCSVs, false);
};

var allRows = [];
var done = false;
var done2 = false;

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
            data : {id: competitionName}
        };});

    var i = 0;
    for (let node of nodes) {
        graphElements.push({
            data : {
                id : node["MediaWiki Title"],
                city : node["City"],
                country : node["Org Country"]
            }
        });
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

    var cy = cytoscape({
        container : document.getElementById("graph"),
        elements: graphElements,
        layout: {
            name: 'breadthfirst',
            rows: 1
        },
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)',
                    'background-color': 'blue'
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

    console.log(cy.elements());
    cy.nodes().on('click', function(e){
        var ele = e.target;
        document.getElementById("info").innerHTML =
            "<table>" +
            "<tr>" + "<td>" + "Submission Title: " + ele.id() + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "City: " + ele._private.data.city + "</td>" + "</tr>" +
            "<tr>" + "<td>" + "Country: " + ele._private.data.country + "</td>" + "</tr>" +
            "</table>";
        console.log('clicked ' + ele.id());
    });

}

export default allRows;
