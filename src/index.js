import * as Papa from "papaparse";

window.onload = (event) => {
    var filePicker = document.getElementById("csvPicker");
    filePicker.addEventListener("change", loadCSVs, false);
};

var allRows = [];

function loadCSVs() {
    let csvFiles = this.files;
    for (const csvFile of csvFiles) {
        Papa.parse(csvFile, {
            header: true,
            complete : function(results) {
                allRows.push(results.data);
                console.log("Another CSV file added");
                allRows = allRows.flat();
                console.log(allRows.length);
            }
        });
    }
}

export default allRows;
