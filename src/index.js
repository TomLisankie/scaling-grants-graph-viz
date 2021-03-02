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
            console.log(allRows[2000]);
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

    function addCompetitionDot(competitionName) {
        dots[0].push('    ' + competitionName + ' [fillcolor="#3498eb", shape="circle"]');
    }

    let competitions = ["LFC100Change2017", "LFC100Change2020", "Climate2030", "ECW2020", "EO2020", "LLIIA2020", "LoneStar2020"];

    for (let competition of competitions) {
        addCompetitionDot(competition);
    }

    var mediaWikiTitles = [];
    function addOrgDot(dot) {
        let mediaWikiTitle = dot["MediaWiki Title"]
            ?
            dot["MediaWiki Title"].trim()
            .replace(/[^a-zA-Z0-9]/g, '')
            :
            "undefined";
        mediaWikiTitles.push(mediaWikiTitle);
        dots[0].push('    ' + mediaWikiTitle + ' [fillcolor="#2ca02c", shape="circle"]');
    }

    let maxNodeCount = 100;
    let allRowsLength = allRows.length;
    for(var i = 0; i < maxNodeCount; i++) {
        let rowIndex = getRandomInt(allRowsLength);
        addOrgDot(allRows[rowIndex]);
    }

    function addConnections() {
        let mediaWikiTitlesLength = mediaWikiTitles.length;
        for (var i = 0; i < mediaWikiTitlesLength; i++) {
            let competitionIndex = getRandomInt(competitions.length);
            dots[0].push('    ' + mediaWikiTitles[i] + ' -> ' + competitions[competitionIndex]);
            console.log('    ' + mediaWikiTitles[i] + ' -> ' + competitions[competitionIndex]);
        }
    }

    addConnections();

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
