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
            console.log(data);
        }
    });
};


module.exports = {
    giveFileGetBlock: giveFileGetBlock,
};