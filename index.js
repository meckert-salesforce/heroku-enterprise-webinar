var _ = require('lodash');
var fs = require('fs');
var http = require('http');
var express = require('express');
const { Client } = require('pg')
const pgClient = new Client()

var port = process.env.PORT || 8080;

var app = express();
app.use(express.static('web'));

pgClient.connect({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

createSampleData();

app.get('/services/tables', function(req, res) {
    let result = await pgClient.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\';');
    await pgClient.end();
    
    console.log(result);

    /*
    var tables = [];
    pgClient.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\';')
    .on('row', function(row) {
        tables.push( row.tablename );
    })
    .on('end', function(result) {
        res.send(tables);
    });*/
    res.send(result);
});

app.get('/services/tables/:tablename', function(req, res) {
    var tablename = req.params.tablename;        
    var result = { columns: [], rows: [] };

    pgClient.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\';', function(error, alltables) {
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

var server = http.createServer(app);
server.listen(port);

function createSampleData() {
    await pgClient.query("BEGIN");
    await pgClient.query(
        `CREATE OR ALTER TABLE machines(
            machine_id SERIAL PRIMARY KEY,
            customer TEXT,            
            install_date DATE,
            manufacturer TEXT,
            model TEXT
        )`);
    await pgClient.query(
        `INSERT INTO machines(customer, install_date, manufacturer, model) VALUES
            ('Burlington Textiles Corp of America', '2010-07-27', 'Acme', 'Model A'),
            ('Burlington Textiles Corp of America', '2013-08-25', 'Acme', 'Model A+'),
            ('Burlington Textiles Corp of America', '2014-07-23', 'Emca', '2000'),
            ('Dickenson plc',                       '2018-08-29', 'Acme', 'Model A+'),
            ('Dickenson plc',                       '2015-07-02', 'Emca', '2010'),
            ('Express Logistics and Transport',     '2019-01-27', 'Acme', 'Model N'),
            ('Express Logistics and Transport',     '2018-04-13', 'Emca', '3000'),
            ('Express Logistics and Transport',     '2017-04-22', 'Emca', '3000+'),
            ('Pyramid Construction Inc.',           '2015-07-11', 'Acme', 'Model X'),
            ('Pyramid Construction Inc.',           '2013-01-04', 'Emca', '2000'),
            ('United Oil & Gas Corp.',              '2015-04-17', 'Emca', '3000'),
        `);
    await pgClient.query("COMMIT");
    pgClient.end();
}