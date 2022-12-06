const hound = require('hound');
const hbjs = require('handbrake-js')
const {
    createSpinner
} = require('nanospinner')
const chalk = require('chalk');
const path = require('path');
var figlet = require('figlet');
var watcher = hound.watch(__dirname + '/videos');
figlet('VideoConverterJS', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        return;
    }
    console.log(data)
    console.log(chalk.blue('Watching ') + __dirname + '/videos' + chalk.red('!'));
});

/**
 * Watch Dir
 */
watcher.on('create', function(file, stats) {
    filename = path.parse(file).name
    mux = 0;
    /**
     * New file found
     */
    console.log(chalk.blue('New file ') + chalk.red(file));

    /**
     * Setup handbrake spinner
     */
    var handbrakespinner = createSpinner('Spawning Handbrake').start()

    /**
     * Set options for handbrake
     * preset: Very Fast 720p30
     * more info on presets: https://handbrake.fr/docs/en/1.0.0/technical/official-presets.html
     */
    var options = {
        input: file,
        output: __dirname + '/complete/' + filename + '.m4v',
        preset: 'Very Fast 480p30'
    }
    /**
     * Spawn handbrakejs 
     */
    hbjs.spawn(options)
        .on('start', data => {
            /**
             * Update handbrakespinner & create encoding spinner
             */
            handbrakespinner.success();
            encodespinner = createSpinner('Encoding').start()
        })
        .on('error', err => {
            /**
             * Error
             */
            handbrakespinner.error()
        })
        .on('progress', progress => {

            /**
             * Check if muxing and update spinners.
             */
            if (progress.task == 'Muxing' && mux == 0) {
                mux = 1;
                encodespinner.success();
                muxingspinner = createSpinner('Muxing').start()
            }

            if (progress.percentComplete == 100) {
                /**
                 * Complete update muxing spinner or encoding spinner
                 */
                if (mux == 1) {
                    muxingspinner.success();
                } else {
                    encodespinner.success();
                }
                console.log(chalk.green('Complete'));
            }
        })

});

watcher.on('change', function(file, stats) {
    //console.log(file+' changed');
})