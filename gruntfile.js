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
			}
		},

		watch: {
			stylesheets: {
				files: 'source/css/*.css',
				tasks: [ 'stylesheets' ]
			},

			scripts: {
				files: [ 'source/js/*.js', 'source/js/*/*.js' ],
				tasks: [ 'scripts' ]
			},

			html: {
				files: [ 'source/*.html', '!source/js/*.js', '!source/css/*.css' ],
				tasks: [ 'copy' ]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
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
		[ "uglify", "clean:scripts" ]
	);

	grunt.registerTask(
		'build',
		"Compiles all of the assets and copies the files to the build directory.",
		[ "clean:build", "copy", "stylesheets", "scripts" ]
	);

	grunt.registerTask(
		'default',
		"Watches the project for changes, automatically builds them.",
		[ 'build', 'watch' ]
	);
};
