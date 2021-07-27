function createBlockSchema(blockObj, db) {
    console.log(blockObj);
    db
        .select('*')
        .from("TestTable")
        .then(function (users) {
            console.log(users);
        })
        .catch(err => console.log(err.stack, "Here"));
}

module.exports = {
    createBlockSchema: createBlockSchema,
}