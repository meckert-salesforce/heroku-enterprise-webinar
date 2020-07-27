var _ = require('lodash');
var fs = require('fs');
var http = require('http');
var express = require('express');
var pg = require('pg');

var port = process.env.PORT || 8080;

var app = express();
app.use(express.static('web'));

pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;

    app.get('/services/tables', function(req, res) {
        var tables = [];
        client.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\';')
        .on('row', function(row) {
            tables.push( row.tablename );
        })
        .on('end', function(result) {
            res.send(tables);
        });
    });

    app.get('/services/tables/:tablename', function(req, res) {
        var tablename = req.params.tablename;        
        var result = { columns: [], rows: [] };

        client.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\';', function(error, alltables) {
            if(!_.some(alltables.rows, {tablename: tablename})) {
                res.send("ERROR: unkown table");
                return;
            }

            client.query(
                'SELECT column_name FROM information_schema.columns ' +
                'WHERE table_schema=\'public\' AND table_name=\''+tablename+'\'',
                function(error, columns) {
                    result.columns = _.map(columns.rows, 'column_name');

                    client.query('SELECT * FROM '+tablename+';', function(error, rows) {
                        result.rows = rows.rows;
                        res.send(result);
                    });
                }
            );
        });
    });
});

var server = http.createServer(app);
server.listen(port);
