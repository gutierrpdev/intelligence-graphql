const { parse } = require('json2csv');
 
function convertToCSV(objArray) {
    const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;

    let fields = [];
    // retrieve all fields from data.
    for(let i = 0; i < array.length; i++){
        for(let index in array[i]){
            if(!fields.includes(index)){
               fields.push(index);
            }
        }
    }
    
    // sort field names by name.
    fields.sort((a, b) => {
        if(a == "_userId") return -1;
        else if(b == "_userId") return 1;
        else return a < b;
    });

    let str = "";
    // populate first line with headers.
    for(let i = 0; i < fields.length; i++){
        if (str != "") str += ",";
        str += fields[i];
    }
    // change line.
    str += "\r\n";

    for (let i = 0; i < array.length; i++) {
        let line = "";
        for (let j = 0; j < fields.length; j++) {
            if (line != "") line += ",";
            // if object contains property, add it to line as is
            if(array[i].hasOwnProperty(fields[j])){
                line += array[i][fields[j]];
            }
            // otherwise add a 0 value.
            else{
                line += 0;
            }
        }
        // change line.
        str += line + "\r\n";
    }
    return str;
}


/**
 *
*/
function exportCSVFile(items, fileName, response) {
    response.setHeader('Content-disposition', 'attachment; filename=' + fileName + '.csv');
    response.writeHead(200, {
        'Content-Type': 'text/csv'
    });
    response.write(convertToCSV(items));
    return response;
}

module.exports = exportCSVFile;
