const { default: knex } = require("knex");
let hi = {"data": "1"};
function createBlockSchema(db, blockObj) {
    db.schema.hasTable('BlockValues').then(function (exists) {
        if (!exists) {
            return db.schema.createTable('BlockValues', function (table) {
                table.json('values');
                table.increments(); // integer id
            }).then(function () {
                return db("BlockValues").insert({values: blockObj})
            });
        } else {
            db('BlockValues').where('id', 1).update({
                values: blockObj
            }).then().catch(function (err) {
                console.log(err);
                return;
            });
        }
    });
}



module.exports = {
    createBlockSchema: createBlockSchema,
}