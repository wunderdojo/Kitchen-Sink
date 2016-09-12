/* 
 * Package changes for release and trigger automatic update
 */

module.exports = function (grunt) {
    
    //setup file list for copying/ not copying for the final zip file
    files_list=[
        '**',
        '!node_modules/**',
        '!.git/**',
        '!README.md',
        '!Gruntfile.js',
        '!package.json',
        '!.gitignore',
        '!.gitmodules',
        '!.composer.*',
        '!composer.*',
        //- skip any existing zip files
        '!*.zip'
        //- only package minified js
        //'!js/**/*[!min].js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            //- deletes the release folder
            release: [
                'release/'
            ]
        },
        copy: {
            release: {
                options: {
                    mode: 0777 //- copies existing permissions. could also set the mode, ie: 777
                },
                src: files_list,
                dest: 'release/<%= pkg.name %>/'
            }
        },
        compress: {
            release: {
                options:{
                    archive: "<%= pkg.name %>.zip",
                    mode: 'zip'
                    },
                files: [{ 
                        cwd: 'release/', 
                        expand: true,
                        src: ['**/*']
                    } ]    
            }
        },
        chmod: {
            options: {
                    mode: '777'
                },
            release:{
                files: {
                    src: ["release/<%= pkg.name %>.zip"]
                }
            }
        },
        insert_timestamp: {
            //- datetime PST
            pst:{
                options: {
                    prepend: true,
                    append: false,
                    format: 'yyyy-mm-dd HH:MM:ss',
                    template: '{timestamp}',
                    datetime: new Date(),
                    insertNewlines: false
                }
            },
            //- datetime GMT
            gmt:{
                options:{
                    prepend: true,
                    append: false,
                    format: 'yyyy-mm-dd HH:MM:ss o',
                    template: '{timestamp}',
                    datetime: new Date(),
                    insertNewlines: false
                }      
            }
        },
        sshconfig:{
            wunderdojo: {
                host: 'wunderdojo.com',
                username: 'wunder',
                privateKey: grunt.file.read('/home/jamie/.ssh/dojo_rsa'),
                passphrase: '<%= pkg.passphrase %>'
            },
            integral: {
                host: 'integralwp.com',
                username: 'integral',
                privateKey: grunt.file.read('/home/jamie/.ssh/msplash_root_rsa'),
               // passphrase: '<%= pkg.passphrase %>'
            }
        },
        sshexec:{
            options:{
                config: 'integral'
            },
            dev:{
                command: [
                    'cd /home/integral/www',
                    'wp --skip-themes=enfold post meta update <%= pkg.dev_download_id %> _edd_sl_version <%= pkg.version %>',
                    'wp --skip-themes=enfold post update <%=pkg.dev_download_id %> --post_modified=<%= insert_timestamp.pst.options.template %>',
                    'wp --skip-themes=enfold post update <%=pkg.dev_download_id %> --post_modified_gmt=<%= insert_timestamp.gmt.options.template %>'
            ].join('&&')
            },
            release:{
                command: [
                    'cd /home/integral/www',
                    'wp --skip-themes=enfold post meta update <%= pkg.download_id %> _edd_sl_version <%= pkg.version %>',
                    'wp --skip-themes=enfold post update <%=pkg.dev_download_id %> --post_modified=<%= insert_timestamp.pst.options.template %>',
                    'wp --skip-themes=enfold post update <%=pkg.dev_download_id %> --post_modified_gmt=<%= insert_timestamp.gmt.options.template %>'
            ].join('&&')
            }
        },
        gitcheckout:{
            dev:{
                options:{
                    branch: 'dev'
                }
            },
            release:{
                options:{
                    branch: 'master'
                }
            }
        },
        gitadd:{
            task:{
                options:{
                  verbose: true,
                  force: true,
                  all: true,
                  cwd: './'
              }
          }
        },
        gitcommit: {
            commit: {
                options: {
                    message: 'Repository updated on ' + grunt.template.today(),
                    noVerify: true,
                    noStatus: false,
                    allowEmpty: true
                },
                files: {
                    src: './'
                }
            }
        },
        gitpush: {
            dev:{
                options: {
                    tags:false,
                    remote: 'origin',
                    branch: 'dev'
                }
            },
            release:{
                options:{
                    tags:false,
                    remote: 'origin',
                    branch: 'master'
                }
            }
        },
        replace: {
				readme_txt: {
					src: ['readme.txt'],
					overwrite: true,
					replacements: [{
							from: /Stable tag: (.*)/,
							to: "Stable tag: <%= pkg.version %>"
						}]

				},
				plugin_php: {
					src: ['integral-mailchimp.php'],
					overwrite: true,
					replacements: [{
							from: /Version:\s*(.*)/,
							to: "Version: <%= pkg.version %>"
						},
						{
							from: /PLUGIN_VERSION = \'\s*(.*)\'/,
							to: "PLUGIN_VERSION = '<%= pkg.version %>'"
						}]
				},
				dev_config_php: {
					src: ['config.php'],
					overwrite: true,
					replacements: [{
							from: /const\sPLUGIN_VERSION\s=\s'(.*)';/,
							to: "const PLUGIN_VERSION = '<%= pkg.version %>';"
						},
						{
							from: /const\sPLUGIN_EDD_NAME\s=\s\'(.*)\'/,
							to: "const PLUGIN_EDD_NAME = '<%= pkg.dev_edd_name %>'"
						}]
				},
				config_php: {
					src: ['config.php'],
					overwrite: true,
					replacements: [{
							from: /const\sPLUGIN_VERSION\s=\s'(.*)';/,
							to: "const PLUGIN_VERSION = '<%= pkg.version %>';"
						},
						{
							from: /const\sPLUGIN_EDD_NAME\s=\s\'(.*)\'/,
							to: "const PLUGIN_EDD_NAME = '<%= pkg.edd_name %>'"
						}]
				}
        },
        cssmin:{
            dev: {
                files: [{
                    expand: true,
                    report: 'min',
                    cwd: 'css/',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css/',
                    ext: '.min.css',
                    extDot: 'last'
                }]
            },
            release: {
               files: [{
                   expand: true,
                   report: 'min',
                   cwd: 'css/',
                   src: ['*.css', '!*.min.css'],
                   dest: 'css/',
                   ext: '.min.css',
                   extDot: 'last'
               }]
           }
        },
        uglify:{
            dev:{
                files:[{
                    expand: true,
                    cwd: 'js/',
                    src: '**/*[!min].js',
                    dest: 'js/',
                    ext: '.min.js',
                    extDot: 'last'
                }]
            },
            release:{
                files:[{
                    expand: true,
                    cwd: 'js/',
                    src: '**/*[!min].js',
                    dest: 'js/',
                    ext: '.min.js',
                    extDot: 'last'
                }]
            }
        },
        /**
         * Not used now but useful to change the text domain to something other than integral
         * https://github.com/cedaro/grunt-wp-i18n/blob/develop/docs/addtextdomain.md
            addtextdomain: {
                options: {
                    i18nToolsPath: '', // Path to the i18n tools directory.
                    textdomain: '',    // Project text domain.
                    updateDomains: []  // List of text domains to replace.
                },
                target: {
                    files: {}
                }
            }
         */
        //- https://github.com/cedaro/grunt-wp-i18n/blob/develop/docs/makepot.md
        //- WP documentation: https://codex.wordpress.org/I18n_for_WordPress_Developers
        //- http://stephenharris.info/grunt-wordpress-development-iii-tasks-for-internationalisation/
        makepot: {
            target: {
                options: {
                    type: 'wp-plugin',
                    cwd: '',
                    domainPath: '/languages',

                    mainFile: 'kitchensink.php',
                    potFilename: 'kitchensink.pot',
                    potHeaders: {
                        poedit: true,
                        'x-poedit-keywordslist': true,
                        'report-msgid-bugs-to': 'https://github.com/wunderdojo/kitchensink/issues',
                        'language-team': 'wunderdojo <support@wunderdojo.com>',
                        'last-translator': 'wunderdojo <support@wunderdojo.com>',
                        'x-generator': 'wunderdojo Build System',
                        'language': 'en_US'
                    },
                   /** processPot: function (pot, options) {
                        pot.headers['report-msgid-bugs-to'] = 'http://integralwp.com/support/contact-us/';
                        pot.headers['language-team'] = 'Team Name <team@example.com>';
                        return pot;
                    },*/
                    updateTimestamp: true,
                    updatePoFiles: true
                    
                }
            }
        },
        checktextdomain: {
            options:{
                text_domain: 'dojo-ks',
                correct_domain: true, //- Will correct missing/variable domains
                keywords: [ //- WordPress localisation functions
                    '__:1,2d',
                    '_e:1,2d',
                    '_x:1,2c,3d',
                    'esc_html__:1,2d',
                    'esc_html_e:1,2d',
                    'esc_html_x:1,2c,3d',
                    'esc_attr__:1,2d', 
                    'esc_attr_e:1,2d', 
                    'esc_attr_x:1,2c,3d', 
                    '_ex:1,2c,3d',
                    '_n:1,2,4d', 
                    '_nx:1,2,4c,5d',
                    '_n_noop:1,2,3d',
                    '_nx_noop:1,2,3c,4d'
                ],
            },
            files: {
                src:  [ '**/*.php', '!node_modules/**'], //All php files
                expand: true,
            },
        },
        po2mo: {
            files: {
                src: 'languages/*.po',
                expand: true
            }
        }
    });

    //- load modules
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-chmod');
    //- https://github.com/gruntjs/grunt-contrib-cssmin
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    //- config options: https://github.com/mscdex/ssh2#connection-methods
	//- https://github.com/spmjs/grunt-scp
    grunt.loadNpmTasks('grunt-scp');
    //- https://github.com/chuckmo/grunt-ssh
    grunt.loadNpmTasks('grunt-ssh');
    //- https://github.com/rubenv/grunt-git
    grunt.loadNpmTasks('grunt-git');         
	//- https://github.com/yoniholmes/grunt-text-replace
    grunt.loadNpmTasks('grunt-text-replace');
    //- https://github.com/gruntjs/grunt-contrib-uglify
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-remove');
    //- https://github.com/cedaro/grunt-wp-i18n
    grunt.loadNpmTasks('grunt-wp-i18n');
    //-http://stephenharris.info/grunt-wordpress-development-iii-tasks-for-internationalisation/
    grunt.loadNpmTasks('grunt-po2mo');
    //- https://github.com/stephenharris/grunt-checktextdomain
    grunt.loadNpmTasks('grunt-checktextdomain'); 
    //- https://www.npmjs.com/package/grunt-insert-timestamp
    grunt.loadNpmTasks('grunt-insert-timestamp');
    
    
    //- testing dev tasks
    //- Should clean dev; update version numbers; minimize css and js; check for any problems with i18n; make an updated POT file; update po & mo files; git add/commit/push to branch dev; copy; compress; scp to integral; update db version number
    grunt.registerTask('devRelease', ['clean:dev', 'dev_version_number', 'cssmin:dev', 'uglify:dev', 'checktextdomain', 'makepot', 'po2mo', 'devGit', 'copy:dev', 'compress:dev', 'chmod', 'scp:dev', 'sshexec:dev']);
    
    //- release tasks
    grunt.registerTask('productionRelease', ['clean:release', 'version_number', 'cssmin:release', 'uglify:release', 'checktextdomain', 'makepot', 'po2mo', 'releaseGit', 'copy:release', 'compress:release', 'chmod', 'scp:release', 'sshexec:release']);

    //- register git tasks
    grunt.registerTask('devGit', ['gitcheckout:dev', 'gitadd', 'gitcommit',  'gitpush:dev']);
    //grunt.registerTask('releaseGit', ['gitcheckout:release', 'gitadd', 'gitcommit',  'gitpush:release']);
    grunt.registerTask('releaseGit', ['gitadd', 'gitcommit',  'gitpush:dev']);
 
    //- update version number in various files for dev release
    grunt.registerTask('dev_version_number', ['replace:readme_txt', 'replace:plugin_php', 'replace:dev_config_php']);
	
	//- update version number in various files for production release
    grunt.registerTask('version_number', ['replace:readme_txt', 'replace:plugin_php', 'replace:config_php']);
    
    //- copy the zip to the integral server via scp
    grunt.registerTask('remote', ['scp']);

};
