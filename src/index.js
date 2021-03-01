import * as Papa from "papaparse";

window.onload = (event) => {
    var filePicker = document.getElementById("csvPicker");
    filePicker.addEventListener("change", loadCSVs, false);
};

var allRows = [];

function loadCSVs() {
    let csvFiles = Array.from(this.files);
    console.log(csvFiles);
    Promise.all(csvFiles
                .map(
                    csvFile =>
                    new Promise(
                        (resolve, reject) =>
                        Papa.parse(csvFile, {
                            header: true,
                            complete : resolve,
                            error : reject}))
                        .then(
                            function(results) {
                                allRows.push(results.data);
                                console.log("Another CSV file added");
                                allRows = allRows.flat();
                                console.log(allRows.length);
                            })))
        .then(function(results) {
            console.log(allRows[3000]);
            setUpGraph(allRows);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function setUpGraph (nodes) {

    var dots = [
        [
            'digraph  {',
            '    node [style="filled"]',
        ],
    ];

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function addDot(dot) {
        let mediaWikiTitle = dot["MediaWiki Title"]
            ?
            dot["MediaWiki Title"].trim()
            .replace(/[^a-zA-Z0-9]/g, '')
            :
             "undefined";
        dots[0].push('    ' + mediaWikiTitle + ' [fillcolor="#2ca02c", shape="circle"]');
    }

    let allRowsLength = allRows.length;
    for(var i = 0; i < 100; i++) {
        let rowIndex = getRandomInt(allRowsLength);
        addDot(allRows[rowIndex]);
    }

    // allRows.forEach(row => addDot(row));

    dots[0].push('}');

    var dotIndex = 0;
    var graphviz = d3.select("#graph").graphviz()
        .logEvents(false)
        .on("initEnd", render);

    function render() {
        var dotLines = dots[dotIndex];
        var dot = dotLines.join('');
        graphviz
            .renderDot(dot)
            .on("end", function () {
                dotIndex = (dotIndex + 1) % dots.length;
                render();
            });
    }

}

export default allRows;
