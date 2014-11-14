/*
* Improv Johari Grunt file
*/

module.exports = function(grunt) {
    var localSettings = grunt.file.readJSON('deploy/config.json');
    grunt.initConfig({
        /*
        * Shell commands
        */
        exec: {
            /*
            * Create the Meteor bundle file using the demeteorizer NPM package
            */
            create_bundle: {
                cwd: "./app",
                cmd: "demeteorizer --tarball "+localSettings.bundleFile,
                callback: function () {
                    grunt.log.write('Meteor bundle created');
                }
            },
            clean_deploy_target: {
                cwd: localSettings.herokuAppDirectory,
                cmd: "git rm --ignore-unmatch -r .",
                stdout: false,
                stderr: true,
                callback: function () {
                    grunt.log.write('Deleted files under heroku directory using Git remove to ensure clean deployment');
                }
            },
            copy_bundle: {
                cwd: "./app",
                cmd: "mv "+localSettings.bundleFile+' ../'+localSettings.herokuAppDirectory+"/"+localSettings.bundleFile,
                callback: function () {
                    grunt.log.write('Bundle file moved');
                }
            },
            copy_procfile: {
                cwd: "./deploy",
                cmd: "cp Procfile"+' ../'+localSettings.herokuAppDirectory+"/Procfile",
                callback: function () {
                    grunt.log.write('Procfile created');
                }
            },
            unpack: {
                cwd: localSettings.herokuAppDirectory,
                cmd: "tar --strip-components=1 -zxvf "+localSettings.bundleFile,
                callback: function () {
                    grunt.log.write('Bundle unpacked');
                }
            },
            remove_tar: {
                cwd: localSettings.herokuAppDirectory,
                cmd: "rm "+localSettings.bundleFile,
                callback: function () {
                    grunt.log.write('Tar file removed');
                }
            },
            create_node_module_dir: {
                cwd: "./",
                cmd: "mkdir -p "+localSettings.herokuAppDirectory+localSettings.deploymentNodeModulesDirectory,
                callback: function () {
                    grunt.log.write('node module directory created');
                }
            },
            deploy_npm_packages: {
                cwd: localSettings.herokuAppDirectory+localSettings.deploymentNodeModulesDirectory,
                cmd: "npm install",
                callback: function () {
                    grunt.log.write('Node packages needed for host installed');
                }
            },
            add_heroku_repo: {
                cwd: localSettings.herokuAppDirectory,
                cmd: "git add .",
                callback: function () {
                    grunt.log.write('Files added to heroku repository');
                }
            },
            commit_heroku_repo: {
                cwd: localSettings.herokuAppDirectory,
                cmd: "git commit -m 'app deployment'",
                callback: function () {
                    grunt.log.write('Files commited to heroku repository');
                }
            },
            push_heroku_repo: {
                cwd: localSettings.herokuAppDirectory,
                cmd: "git push heroku master",
                callback: function () {
                    grunt.log.write('Files pushed to heroku');
                }
            },

        },

    });

    /*
    * Dependency loading
    */
    grunt.loadNpmTasks('grunt-exec');

    /*
    * Tasks
    */
    grunt.registerTask('default', []);
    grunt.registerTask('deploy', ['exec:create_bundle', 'exec:clean_deploy_target', 'exec:copy_bundle', 'exec:copy_procfile', 'exec:unpack', 'exec:remove_tar', 'exec:create_node_module_dir', 'exec:deploy_npm_packages', 'exec:add_heroku_repo', 'exec:commit_heroku_repo', 'exec:push_heroku_repo']);

};