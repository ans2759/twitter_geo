const spawn = require('child_process').spawn;
const MongoDb = require('mongodb');
const MongoClient = MongoDb.MongoClient;

const URL = 'mongodb://localhost:27017';
const DB_NAME = 'test';

exports.archive = () => {
    const args = ['--db', 'test', '--collection', 'archive', '--out', './resources', '--gzip'];
    const mongodump = spawn('mongodump', args);

    mongodump.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    mongodump.stderr.on('error', function (data) {
        console.log('stderr: ' + data);
        kill();
    });
    mongodump.on('exit', function (code) {
        console.log('mongodump exited with code ' + code);
        if (code === 0) {
            deleteArchive()
        }
        kill();
    });

    const kill = () => {
        mongodump.kill('SIGINT')
    };

    const deleteArchive = () => {
        MongoClient.connect(URL).then((client) => {
            const db = client.db(DB_NAME);
            db.collection('archive').deleteMany().then(() => {
                console.log("Archive deleted successfully");
                client.close()
            }, (error) => {
                console.error(error);
                client.close()
            });
        });
    };
};