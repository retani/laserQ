var ps = require('ps-node');
 
kill_say = function (){
    ps.lookup({
        command: 'say',
        arguments: '',
        }, function(err, resultList ) {
        if (err) {
            throw new Error( err );
        }
     
        resultList.forEach(function( process ){
            if( process ){
     
                console.log( 'prepare kill PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );

                ps.kill( process.pid, function( err ) {
                    if (err) {
                        throw new Error( err );
                    }
                    else {
                        console.log( 'Process %s has been killed!', pid );
                    }
                });
            }
        });
    });
}


module.exports = { kill_say: kill_say};