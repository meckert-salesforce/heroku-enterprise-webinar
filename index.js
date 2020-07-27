var _ = require('lodash');
var fs = require('fs');
var http = require('http');
var express = require('express');
const asyncHandler = require('express-async-handler');
const { Client } = require('pg');


var port = process.env.PORT || 8080;

var app = express();
app.use(express.static('web'));

try {

    const pgClient = new Client({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    pgClient.connect();

    createSampleData(pgClient);

    app.get('/services/tables', asyncHandler(async (_req, res, _next) => {        
        let result = await pgClient.query(
            `SELECT schemaname, tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname <> 'pg_catalog'
            AND schamename <> 'information_schema';
        `);

        console.log(result);
        let tables = _.map(result.rows, row => (row.schemaname + "." + row.tablename) );
        console.log(tables);
        res.send(tables);
    }));

    app.get('/services/tables/:tablename', function(req, res) {        
        let [schemaname, tablename] = req.params.tablename.split('.');        
        console.log(`schemaname: ${schemaname}, tablename: ${tablename}`);
        /*
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
        */
    });

    var server = http.createServer(app);
    server.listen(port);
}
catch(err) {
    console.log("Error starting up.");
    console.log(err);
}

async function createSampleData(pgClient) {
    try {
        await pgClient.query("BEGIN");
        await pgClient.query("DROP TABLE IF EXISTS machines");
        await pgClient.query(
            `CREATE TABLE machines(
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
                ('United Oil & Gas Corp.',              '2015-04-17', 'Emca', '3000')
            `);
        await pgClient.query("COMMIT");
    }
    catch(err) {
        console.log("Error creating sample data.");
        console.log(err);
    }
}