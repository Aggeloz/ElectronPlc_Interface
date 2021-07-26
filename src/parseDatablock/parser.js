const rules = require('./dbRules');
const Decimal = require('decimal.js');
const fs = require('fs');
const { basename } = require('path');


let dbVars = {};

async function giveFileGetBlock(filePath) {
    dbVars = {};
    let data = [];
    let varName = [];
    let varType = [];
    let varMemory = [];
    fs.readFile(filePath, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            return;
        } else {
            var part = data.substring(
                data.lastIndexOf("STRUCT ") + "STRUCT ".length,
                data.lastIndexOf("END_STRUCT;")
            );
            
            let txt = part.split('\n');
            let editedContent;
            for (let j = 0; j < txt.length; j++) {
                for (let i = 0; i < rules.memory.length; i++) {
                    if (txt[j].includes(rules.names[i])) {
                        editedContent = txt[j].replace(' ' + rules.names[i], '');
                        editedContent = editedContent.replace(/"/gi, '');
                        editedContent = editedContent.replace(/;/gi, '');
                        editedContent = editedContent.replace('      ', '');
                        editedContent = editedContent.replace(/\s/gi, '');
                        varName.push(editedContent);
                        varType.push(rules.types[i]);
                        varMemory.push(rules.memory[i]);
                        
                        // console.log(editedContent);
                        
                    }
                }
            }
        }
    });
    // console.log(varName, varMemory, varType);
    data.push(varName,varType,varMemory);
    parseDb(data, basename(filePath).replace('.txt', '').toUpperCase()).then(all => {
        console.log(all);
    });
};



async function parseDb(data, db) {
    let indexMemory = new Decimal(0.0);
    console.log(data.length);

    for (let i = 0; i < data[0].length; i++) {
        // First if from old parsing method
        if (data[1][i] === 'X' && indexMemory % 1 === 0) {
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory + '.0';
            indexMemory = indexMemory.plus(data[2][i])
            // console.log(parseFloat(indexMemory));
        }
        // Second if from old parsing method
        else if (data[1][i] === 'X' && (data[1][i - 1] === 'X' || data[1][i + 1] === 'X')) {
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory;
            indexMemory = indexMemory.plus(data[2][i]);
            // console.log(parseFloat(indexMemory));
        }
        // Third if from old parsing methon
        else if (data[1][i] === 'BYTE' && data[1][i + 1] === 'WORD') {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory;
            indexMemory = indexMemory.plus(data[2][i]);
            // console.log(parseFloat(indexMemory));
        }
        // Fourth if from old parsing method
        else if (data[1][i] === 'BYTE' && data[1][i + 1] === 'BYTE') {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory;
            indexMemory = indexMemory.plus(data[2][i]);
            indexMemory = indexMemory.plus(1);
            // console.log(parseFloat(indexMemory));
        }
        // Fifth if from old parsing method
        else if ((data[1][i] === 'INT' || data[1][i] === 'DINT' || data[1][i] === 'REAL' || data[1][i] === 'TIME' || data[1][i] === 'USINT') && (indexMemory !== undefined && indexMemory % 1 !== 0)) {
            indexMemory = Decimal.ceil(indexMemory);
            indexMemory = indexMemory.plus(1);
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory;
            indexMemory = indexMemory.plus(data[2][i]);
            // console.log(parseFloat(indexMemory));
        }
        else if ((data[1][i] === 'BYTE' && data[1][i - 1] === 'INT')) {
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory;
            indexMemory = indexMemory.plus(2);
        }
        // Sixth if from old parsing method
        else {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(data[0][i])] = db + ',' + data[1][i] + indexMemory;
            indexMemory = indexMemory.plus(data[2][i]);
            // console.log('Variable mem:', data[2][i]);
            // console.log('Point:', parseFloat(indexMemory));
        }
        console.log(dbVars);
    }
    // console.log(dbVars);
    // console.log('Index Memory Decimal:', parseFloat(indexMemory));
    return dbVars;
}






module.exports = {
    giveFileGetBlock: giveFileGetBlock,
};