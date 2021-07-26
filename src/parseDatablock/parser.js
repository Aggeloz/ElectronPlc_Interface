const rules = require('./dbRules');
const Decimal = require('decimal.js');
const fs = require('fs');


let dbVars = {};

async function giveFileGetBlock(filePath) {
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
                        console.log(editedContent);
                        // varName.push(editedContent);
                        // varType.push(rules.types[i]);
                        // varMemory.push(rules.memory[i]);
                    }
                }
            }

        }
    });
};










module.exports = {
    giveFileGetBlock: giveFileGetBlock,
};