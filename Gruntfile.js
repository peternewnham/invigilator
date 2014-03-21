module.exports = function (grunt) {

	'use strict';

	// Force use of Unix newlines
	grunt.util.linefeed = '\n';

	// Project configuration.
	grunt.initConfig({

		// clean the build dir
		clean: {
			build: {
				src: [ 'build/' ]
			}
		},

		// copy dev files to dist
		copy: {

			manifest: {
				expand: true,
				cwd: 'src/',
				src: 'manifest.json',
				dest: 'build/'
			},

			locales: {
				expand: true,
				cwd: 'src/_locales/',
				src: '**',
				dest: 'build/_locales/'
			},

			images: {
				expand: true,
				cwd: 'src/',
				src: [
					'icons/**',
					'images/**'
				],
				dest: 'build/'
			},

			popup: {
				expand: true,
				cwd: 'src/popup/',
				src: 'popup.html',
				dest: 'build/'
			},

			vendor_js: {
				files: {
					'build/vendor/jquery.js': 'bower_components/jquery/dist/jquery.min.js',
					'build/vendor/jquery.min.map': 'bower_components/jquery/dist/jquery.min.map',
					'build/vendor/moment.js': 'bower_components/momentjs/min/moment-with-langs.min.js',
					'build/vendor/bootstrap.js': 'bower_components/bootstrap/dist/js/bootstrap.min.js'
				}
			},

			vendor_fonts: {
				expand: true,
				cwd: 'bower_components/bootstrap/fonts/',
				src: [
					'*'
				],
				dest: 'build/vendor/fonts/'
			}

		},

		less: {
			popup: {
				files: {
					'build/popup.css': 'src/popup/less/popup.less'
				}
			}
		},

		uglify: {
			background_dev: {
				options: {
					mangle: false,
					compress: false,
					beautify: true
				},
				files: {
					'build/background.js': [
						'src/background/**/*.js',
						'src/common/**/*.js'
					]
				}
			},
			popup_dev: {
				options: {
					mangle: false,
					compress: false,
					beautify: true
				},
				files: {
					'build/popup.js': [
						'src/popup/**/*.js',
						'src/common/**/*.js'
					]
				}
			},
			build: {
				options: {
					mangle: false,
					compress: true,
					beautify: false
				},
				files: {
					'build/background.js': 'src/background/**/*.js',
					'build/popup.js': 'src/popup/js/**/*.js'
				}
			}

		},

		watch: {

			manifest: {
				files: 'src/manifest.json',
				tasks: ['copy:manifest']
			},

			locales: {
				files: 'src/_locales/**',
				tasks: ['copy:locales']
			},

			images: {
				files: [
					'src/icons/**',
					'src/images/**'
				],
				tasks: ['copy:images']
			},

			background_js: {
				files: [
					'src/background/**/*.js',
					'src/common/**/*.js'
				],
				tasks: ['uglify:background_dev']
			},

			popup_js: {
				files: [
					'src/popup/js/**/*.js',
					'src/common/**/*.js'
				],
				tasks: ['uglify:popup_dev']
			},

			popup_html: {
				files: 'src/popup/popup.html',
				tasks: ['copy:popup']
			},

			popup_less: {
				files: 'src/popup/less/**/*.less',
				tasks: ['less:popup']
			}

		},

		zip: {
			test: {
				cwd: 'build/',
				src: 'build/**/*',
				dest: 'copyplus.zip'
			}
		}

	});


	// autoload tasks
	require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

	// build pretty js
	grunt.registerTask('js_dev', [
		'uglify:background_dev',
		'uglify:popup_dev'
	]);

	// build ugly js
	grunt.registerTask('js_build', [
		'uglify:build'
	]);

	/*
	 * Initialisation task
	 * Removes previous builds and generates a new one
	 */
	grunt.registerTask('init', [
		'clean',
		'copy',
		'js_dev',
		'less'
	]);

	grunt.registerTask('publish', [
		'clean',
		'copy',
		'js_build',
		'less'
	]);

	/*
	 * Default task
	 * Rebuild and watch for changes
	 */
	grunt.registerTask('default', [
		'init',
		'watch'
	]);

};