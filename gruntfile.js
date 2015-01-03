module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			build: {
				src: [ 'build' ]
			},
			stylesheets: {
				src: [ 'build/assets/css', '!build/app.min.css' ]
			},
			scripts: {
				src: [ 'build/app', '!build/app.min.js' ]
			}
		},

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
				directory: 'build/assets/libs'
			}
		},

		wiredep: {
			target: {
				src: [
					'build/*.html'
				],
				cwd: '.',
				directory: 'build/assets/libs/'
			}
		},

		autoprefixer: {
			build: {
				expand: true,
				cwd: 'build',
				src: [ '**/*.css' ],
				dest: 'build'
			}
		},

		useminPrepare: {
			html: 'build/*.html',
			options: {
				dest: 'build'
			}
		},

		usemin: {
			html: 'build/*.html',
			options: {
				dest: 'build'
			}
		},

		cssmin: {
			build: {
				files: {
					'build/app.min.css': [ 'build/assets/css/*.css' ]
				}
			}
		},

		uglify: {
			build: {
				options: {
					mangle: false
				},
				files: {
					'build/app.min.js': 'build/app/*/*.js',
					'build/background.min.js': 'build/assets/js/background.js'
				}
			},
			debug: {
				options: {
					mangle: false,
					beautify: true,
					compress: false
				},
				files: {
					'build/app.min.js': 'build/app/*/*.js',
					'build/background.min.js': 'build/assets/js/background.js'
				}
			}
		},

		watch: {
			stylesheets: {
				files: 'source/assets/css/*.css',
				tasks: [ 'stylesheets' ]
			},

			scripts: {
				files: [ 'source/app/*.js', 'source/app/*/*.js' ],
				tasks: [ 'debug-scripts' ]
			},

			html: {
				files: [ 'source/*.html', '!source/app/*.js', '!source/assets/css/*.css' ],
				tasks: [ 'copy' ]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower-install-simple');
	grunt.loadNpmTasks('grunt-wiredep');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-concat');
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
		'bower',
		"Install 3rd-party dependencies",
		[ 'bower-install-simple', 'wiredep' ]
	);

	grunt.registerTask(
		'optimize',
		"Replaces included files with the minified versions.",
		[ "useminPrepare", "concat:generated", "cssmin:generated", "uglify:generated", "usemin" ]
	);

	grunt.registerTask(
		'build',
		"Compiles all of the assets and copies the files to the build directory.",
		[ "clean:build", "copy", "stylesheets", "scripts", "bower", "optimize" ]
	);

	grunt.registerTask(
		'debug',
		"Creates a debug version all of the assets and copies the files to the build directory.",
		[ "clean:build", "copy", "stylesheets", "debug-scripts", "bower" ]
	);

	grunt.registerTask(
		'default',
		"Watches the project for changes, automatically builds them.",
		[ 'debug', 'watch' ]
	);
};
