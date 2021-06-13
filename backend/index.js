var express = require('express');
var mysql = require('./dbcon.js');
var CORS = require('cors');  // Needed since backend and frontend are in two different locations

var app = express();
app.use(CORS());
let port = process.env.PORT;
if (port == null || port == ""){
  port = 4593;
}
app.set('port', port);
app.use(express.urlencoded({ extended:false }));
app.use(express.json());

// Get query
const getAllQuery = 'SELECT * FROM tickets';

//  Add row query
const insertQuery = "INSERT INTO tickets (`name`, `subject`, `issue`, `contact`, `status`, `date`) VALUES (?, ?, ?, ?, ?, ?)";

// Simple update is used so the entire row needs to be updated
const updateQuery = "UPDATE tickets SET name=?, subject=?, issue=?, contact=?, status=?, date=? WHERE id=? ";

// Delete query only needs row id, MIGHT NOT NEED THIS
const deleteQuery = "DELETE FROM tickets WHERE id=?";

// Mainly used for debugging
const dropTableQuery = "DROP TABLE IF EXISTS tickets";

const createTableQuery = `CREATE TABLE tickets(
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            name VARCHAR(255) NOT NULL,
                            subject VARCHAR(255) NOT NULL,
                            issue VARCHAR(255) NOT NULL,
                            contact VARCHAR(255) NOT NULL,
                            status BOOLEAN,
                            date DATE);`;

// Used to get the current state of the database after making changes, functions the same as get request logic.
const getAllData = (res, next) => {
  mysql.pool.query(getAllQuery, (err, rows, fields) => {
    if (err){
      next(err);
      return;
    }
    res.json({"rows":rows});
  })
}                  

// Populates database on arrival to page
app.get('/',function(req,res,next){
  mysql.pool.query(getAllQuery, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
    res.json({"rows":rows});
  });
});

// Add new row to database, taking form values from request body to use in insert query
// Dynamically updates table data
app.post('/', (req,res,next) => {
  // Destructures properties from request body into variables named the same
  var {name, subject, issue, contact, status, date} = req.body;
 
  mysql.pool.query(insertQuery, [name, subject, issue, contact, status, date], (err, result) => {
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});

// Deletes a row in the db, the row is specified in the query as the key of id and its value
// Updates table data
app.delete('/', (req,res,next) => {
  var context = {};
  mysql.pool.query(deleteQuery, [req.query.id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});

// Edits a row in the db, the input values from the edited row are passed in the body and the id is passed in the query string
// Updates table data
app.put('/', (req,res,next) => {
  var {name, subject, issue, contact, status, date} = req.body;

  mysql.pool.query(updateQuery,
    [name, subject, issue, contact, status, date, req.query.id],
    (err, result) => {
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});

// Reset tickets table, mainly used for debugging
app.get('/reset-table',function(req,res,next){
  mysql.pool.query(dropTableQuery, function(err){
    var createString = createTableQuery;
    mysql.pool.query(createString, function(err){
      res.send('RESET')
    })
  });
});

// 404 Error handling
app.use(function(req,res){
  res.status(404);
  res.send('404');
});

// 500 Error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.send('500');
});

// Start message for debugging, although currently running on forever
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
