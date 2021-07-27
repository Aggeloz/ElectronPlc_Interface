const rules = require('./dbRules');
const Decimal = require('decimal.js');
const fs = require('fs');
const { basename } = require('path');

let varName = [];
let varType = [];
let varMemory = [];
let dbVars = {};

function giveFileGetBlock(filePath) {
    // dbVars = {};
    let allVars = [];
    varName = [];
    varType = [];
    varMemory = [];

    // REMEMBER TO USE FILE READ SYNC 
    let data = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'}).toString();
    let part = data.substring(
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


    allVars.push(varName, varType, varMemory);
    let all = parseDb(allVars, basename(filePath).replace('.txt', '').toUpperCase());
    return all;
};



function parseDb(allVars, db) {
    let indexMemory = new Decimal(0.0);

    for (let i = 0; i < allVars[0].length; i++) {
        // First if from old parsing method
        if (allVars[1][i] === 'X' && indexMemory % 1 === 0) {
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory + '.0';
            indexMemory = indexMemory.plus(allVars[2][i])
            // console.log(parseFloat(indexMemory));
        }
        // This if statement fixes the bit problem
        else if (allVars[1][i] === 'X' && allVars[1][i + 1] === 'X' && Decimal.mod(indexMemory, 1) >= 0.7) {
            console.log(Decimal.mod(indexMemory, 1));
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(0.3);
            console.log(Decimal.mod(indexMemory, 2));
            // console.log(parseFloat(indexMemory));
        }
        // Second if from old parsing method
        else if (allVars[1][i] === 'X' && (allVars[1][i - 1] === 'X' || allVars[1][i + 1] === 'X')) {
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(allVars[2][i]);
            // console.log(parseFloat(indexMemory));
        }
        // Third if from old parsing methon
        else if (allVars[1][i] === 'BYTE' && allVars[1][i + 1] === 'WORD') {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(allVars[2][i]);
            // console.log(parseFloat(indexMemory));
        }
        // Fourth if from old parsing method
        else if (allVars[1][i] === 'BYTE' && allVars[1][i + 1] === 'BYTE') {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(allVars[2][i]);
            indexMemory = indexMemory.plus(1);
            // console.log(parseFloat(indexMemory));
        }
        // Fifth if from old parsing method
        else if ((allVars[1][i] === 'INT' || allVars[1][i] === 'DINT' || allVars[1][i] === 'REAL' || allVars[1][i] === 'TIME' || allVars[1][i] === 'USINT') && (indexMemory !== undefined && indexMemory % 1 !== 0)) {
            indexMemory = Decimal.floor(indexMemory);
            // indexMemory = Decimal.ceil(indexMemory);
            indexMemory = indexMemory.plus(1);
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(allVars[2][i]);
            // console.log(parseFloat(indexMemory));
        }
        else if ((allVars[1][i] === 'BYTE' && allVars[1][i - 1] === 'INT')) {
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(2);
        }
        // Sixth if from old parsing method
        else {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(allVars[0][i])] = db + ',' + allVars[1][i] + indexMemory;
            indexMemory = indexMemory.plus(allVars[2][i]);
            // console.log('Variable mem:', allVars[2][i]);
            // console.log('Point:', parseFloat(indexMemory));
        }
    }
    // console.log(dbVars);
    // console.log('Index Memory Decimal:', parseFloat(indexMemory));
    return dbVars;
}






module.exports = {
    giveFileGetBlock: giveFileGetBlock,
};