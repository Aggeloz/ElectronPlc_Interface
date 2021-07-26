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
    // let data = [];
    varName = [];
    varType = [];
    varMemory = [];
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
    // data.push(varName, varType, varMemory);
    parseDb(varName, varType, varMemory, basename(filePath).replace('.txt', '').toUpperCase()).then(all => {
        console.log(all);
    });
    // console.log(varName, varMemory, varType);
};



async function parseDb(varName, varType, varMemory, db) {
    // data.push(varName, varType, varMemory);
    let indexMemory = new Decimal(0.0);

    console.log(varName);
    console.log(varName[0]);
    for (let i = 0; i < varName.length; i++) {
        // First if from old parsing method
        if (varType[i] === 'X' && indexMemory % 1 === 0) {
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory + '.0';
            indexMemory = indexMemory.plus(varMemory[i])
            // console.log(parseFloat(indexMemory));
        }
        // Second if from old parsing method
        else if (varType[i] === 'X' && (varType[i - 1] === 'X' || varType[i + 1] === 'X')) {
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory;
            indexMemory = indexMemory.plus(varMemory[i]);
            // console.log(parseFloat(indexMemory));
        }
        // Third if from old parsing methon
        else if (varType[i] === 'BYTE' && varType[i + 1] === 'WORD') {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory;
            indexMemory = indexMemory.plus(varMemory[i]);
            // console.log(parseFloat(indexMemory));
        }
        // Fourth if from old parsing method
        else if (varType[i] === 'BYTE' && varType[i + 1] === 'BYTE') {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory;
            indexMemory = indexMemory.plus(varMemory[i]);
            indexMemory = indexMemory.plus(1);
            // console.log(parseFloat(indexMemory));
        }
        // Fifth if from old parsing method
        else if ((varType[i] === 'INT' || varType[i] === 'DINT' || varType[i] === 'REAL' || varType[i] === 'TIME' || varType[i] === 'USINT') && (indexMemory !== undefined && indexMemory % 1 !== 0)) {
            indexMemory = Decimal.ceil(indexMemory);
            indexMemory = indexMemory.plus(1);
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory;
            indexMemory = indexMemory.plus(varMemory[i]);
            // console.log(parseFloat(indexMemory));
        }
        else if ((varType[i] === 'BYTE' && varType[i - 1] === 'INT')) {
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory;
            indexMemory = indexMemory.plus(2);
        }
        // Sixth if from old parsing method
        else {
            indexMemory = Decimal.ceil(indexMemory);
            dbVars[(varName[i])] = db + ',' + varType[i] + indexMemory;
            indexMemory = indexMemory.plus(varMemory[i]);
            // console.log('Variable mem:', varMemory[i]);
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