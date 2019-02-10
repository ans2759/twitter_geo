const { fork } = require('child_process');


const startIndexBuilderProcess = function (timeout) {
    const child = fork('./database/indexBuilder.js', {execArgv: ['--inspect']});
    child.send("Start");

    child.on('message', (m) => {
        console.log('PARENT got message:', m);
    });

    child.on('error', (e) => {
        console.log('Error:', e);
    });

    child.on('exit', function (code, signal) {
        console.log('child process exited with ' +
            `code ${code} and signal ${signal}`);
        setTimeout(function() {
            startIndexBuilderProcess(timeout);
        }, timeout ? timeout : 60000);
    });
};

exports.startIndexBuilderProcess = startIndexBuilderProcess;