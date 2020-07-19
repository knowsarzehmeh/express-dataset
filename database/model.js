var db = require('./db');

/*  var schema is used for convenience to get column names in updateRow() */

var schema = {
  actors: ['id', 'name', 'avatar_url', 'created_at'],
  repos: ['id', 'name', 'url', 'actor_id', 'created_at'],
  events: ['id', 'type', 'created_at', 'actor_id', 'repo_id'],
};

/* CRUD functions: readTable, createRow, updateRow, deleteRow             */

function readTable(table, cb) {
  let sql = `SELECT * FROM ${table}`;
  let data = {};
  db.all(sql, function (err, rows) {
    /* Return all results of query */ if (err)
      throw err; /* If there's an error, terminate app */
    rows.forEach(function (row) {
      /* For each row matching the query */ data[
        row.id
      ] = {}; /* init row id as top-level key */
      Object.keys(row).forEach(function (k) {
        /* For each column of row */ data[row.id][k] = unescape(
          row[k]
        ); /* add the key-value pair */
      });
    });
    cb(data); /* data = { id: { "colname" : value }, ... }, id2: ... } */
  });
}

function createRow(table, cb) {
  let sql = `INSERT INTO ${table} DEFAULT VALUES`;
  db.run(sql, cb);
}

function updateRow(table, rb, cb) {
  var pairs = ''; /* for constructing 'identifier = value, ...' */
  for (field of schema[table].slice(1)) {
    /* for every column except id */
    if (pairs) pairs += ', '; /* insert comma unless string is empty */
    pairs += `${field} = '${escape(rb[field])}'`; /* column = 'value' */
  }
  let sql = `UPDATE ${table} SET ${pairs} WHERE id = ?`; /* ? = rb['id'] */
  db.run(sql, rb['id'], cb);
}

function deleteRow(table, id, cb) {
  let sql = `DELETE FROM ${table} WHERE id = ${id};`;
  db.run(sql, cb);
}

module.exports = {
  schema,
  readTable,
  createRow,
  updateRow,
  deleteRow,
};
