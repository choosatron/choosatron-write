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
				src: [ 'build/header.min.js', 'build/body.min.js', 'build/background.js', 'build/app', 'build/assets', '!build/app.min.js' ]
			},
			libs: {
				src: [ 'build/lib', '!build/lib.min.js' ]
			}
		},

		copy: {
			build: {
				files: [
					{cwd: 'source',
					src: [ '**' ],
					dest: 'build',
					flatten: false,
					expand: true},

					{cwd: './',
					src: [ '**/*.ttf', '**/*.woff' ],
					dest: 'build/fonts/',
					flatten: true,
					expand: true},

					{cwd: 'source',
					src: [ 'assets/img/*' ],
					dest: 'build/img/',
					flatten: true,
					expand: true},

					{cwd: 'source',
					src: [ 'assets/bin/*.bin' ],
					dest: 'build/bin/',
					flatten: true,
					expand: true},

					{cwd: 'source',
					src: ['app/**/*.html'],
					dest: 'build/templates/',
					flatten: true,
					expand: true,
					filter: 'isFile'}
				],
			}
		},

		'bower-install-simple': {
			options: {
				directory: 'build/lib'
			}
		},

		wiredep: {
			target: {
				src: [
					'build/*.html'
				],
				cwd: '.',
				directory: 'build/lib/'
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
					'build/app.min.css': [ 'build/assets/css/*.css', '!build/assets/css/app-ui.css', 'build/assets/css/app-ui.css' ]
				}
			}
		},

		uglify: {
			build: {
				options: {
					mangle: false
				},
				files: {
					'build/header.min.js': ['build/app/app.modules.js', 'build/app/app.configs.js', 'build/app/app.routes.js', 'build/app/app.constants.js'],
					'build/body.min.js': ['build/app/**/*.js', '!build/app/app.*.js'],
					'build/assets.min.js': 'build/assets/js/*.js',
					'build/background.min.js': 'build/background.js'
				}
			},
			debug: {
				options: {
					mangle: false,
					beautify: true,
					compress: false
				},
				files: {
					'build/header.min.js': ['build/app/app.modules.js', 'build/app/app.configs.js', 'build/app/app.routes.js', 'build/app/app.constants.js'],
					'build/body.min.js': ['build/app/**/*.js', '!build/app/app.*.js'],
					'build/assets.min.js': 'build/assets/js/*.js',
					'build/background.min.js': 'build/background.js'
				}
			}
		},

		watch: {
			stylesheets: {
				files: 'source/assets/css/*.css',
				tasks: [ 'stylesheets', 'wiredep' ]
			},

			scripts: {
				files: [ 'source/app/**/*.js' ],
				tasks: [ 'copy', 'debug-scripts', 'wiredep' ]
			},

			html: {
				files: [ 'source/app/**/*.html' ],
				tasks: [ 'debug' ]
			}
		},

		jshint: {
			debug: {
				src: [ 'source/**/*.js' ]
			},
			build: {
				src: [ 'build/app.min.js' ]
			}
		},

		concat: {
			options: {
				// define a string to put between each file in the concatenated output
				separator: ';'
			},
			scripts: {
				// the files to concatenate
				src: ['build/header.min.js', 'build/body.min.js'],
				// the location of the resulting JS file
				dest: 'build/app.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-bower-install-simple');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-wiredep');

	grunt.registerTask(
		'stylesheets',
		"Compiles the stylesheets",
		[ "cssmin", "clean:stylesheets" ]
	);

	grunt.registerTask(
		'scripts',
		"Compiles the javascript files",
		[ "jshint:build", "uglify:build", "concat:scripts", "clean:scripts",  ]
	);

	grunt.registerTask(
		'debug-scripts',
		"Beautifies the javascript files",
		[ "jshint:debug", "uglify:debug", "concat:scripts", "clean:scripts" ]
	);

	grunt.registerTask(
		'bower',
		"Install 3rd-party dependencies",
		[ 'bower-install-simple' ]
	);

	grunt.registerTask(
		'optimize',
		"Replaces included files with the minified versions.",
		[ "useminPrepare", "concat:generated", "cssmin:generated", "uglify:generated", "usemin", "clean:libs" ]
	);

	grunt.registerTask(
		'build',
		"Compiles all of the assets and copies the files to the build directory.",
		[ "clean:build", "copy", "stylesheets", "scripts", "bower", "wiredep", "optimize" ]
	);

	grunt.registerTask(
		'debug',
		"Creates a debug version all of the assets and copies the files to the build directory.",
		[ "clean:build", "copy", "stylesheets", "debug-scripts", "bower", "wiredep" ]
	);

	grunt.registerTask(
		'default',
		"Watches the project for changes, automatically builds them.",
		[ "debug", "watch" ]
	);
};
