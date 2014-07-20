module.exports = function(grunt) {
	var buildjs = 'build/js/*/*.js';
	var buildcss = 'build/css/*.css';

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
				src: [ buildcss, '!build/application.css' ]
			},
			scripts: {
				src: [ buildjs, '!build/application.js', '!build/js/*.js' ]
			}
		},

		cssmin: {
			build: {
				files: {
					'build/application.css': [ buildcss ]
				}
			}
		},

		uglify: {
			build: {
				options: {
					mangle: false
				},
				files: {
					'build/application.js': [ buildjs ]
				}
			}
		},

		watch: {
			stylesheets: {
				files: 'source/css/*.css',
				tasks: [ 'stylesheets' ]
			},

			scripts: {
				files: 'source/js/*.js',
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
