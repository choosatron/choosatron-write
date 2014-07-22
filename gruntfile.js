module.exports = function(grunt) {
	grunt.initConfig({
		copy: {
			build: {
				cwd: 'source',
				src: [ '**' ],
				dest: 'build',
				expand: true
			}
		},

		'bower-install-simple': {
			options: {
				directory: 'build/lib'
			}
		},

		clean: {
			build: {
				src: [ 'build' ]
			},
			stylesheets: {
				src: [ 'build/css', '!build/app.min.css' ]
			},
			scripts: {
				src: [ 'build/js', '!build/app.min.js' ]
			}
		},

		cssmin: {
			build: {
				files: {
					'build/app.min.css': [ 'build/css/*.css' ]
				}
			}
		},

		uglify: {
			build: {
				options: {
					mangle: false
				},
				files: {
					'build/app.min.js': 'build/js/*/*.js',
					'build/background.min.js': 'build/js/background.js'
				}
			},
			debug: {
				options: {
					mangle: false,
					beautify: true,
					compress: false
				},
				files: {
					'build/app.min.js': 'build/js/*/*.js',
					'build/background.min.js': 'build/js/background.js'
				}
			}
		},

		watch: {
			stylesheets: {
				files: 'source/css/*.css',
				tasks: [ 'stylesheets' ]
			},

			scripts: {
				files: [ 'source/js/*.js', 'source/js/*/*.js' ],
				tasks: [ 'debug-scripts' ]
			},

			html: {
				files: [ 'source/*.html', '!source/js/*.js', '!source/css/*.css' ],
				tasks: [ 'copy' ]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower-install-simple');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask(
		'stylesheets',
		"Compiles the stylesheets",
		[ "cssmin", "clean:stylesheets" ]
	);

	grunt.registerTask(
		'scripts',
		"Compiles the javascript files",
		[ "uglify:build", "clean:scripts" ]
	);

	grunt.registerTask(
		'debug-scripts',
		"Beautifies the javascript files",
		[ "uglify:debug", "clean:scripts" ]
	);

	grunt.registerTask(
		'bower-install',
		"Install 3rd-party dependencies",
		[ 'bower-install-simple' ]
	);

	grunt.registerTask(
		'build',
		"Compiles all of the assets and copies the files to the build directory.",
		[ "clean:build", "bower-install", "copy", "stylesheets", "scripts" ]
	);

	grunt.registerTask(
		'debug',
		"Creates a debug version all of the assets and copies the files to the build directory.",
		[ "clean:build", "bower-install", "copy", "stylesheets", "debug-scripts" ]
	);

	grunt.registerTask(
		'default',
		"Watches the project for changes, automatically builds them.",
		[ 'debug', 'watch' ]
	);
};
