var gulp 			= require('gulp'),
	concat 			= require('gulp-concat'),
	uglify 			= require('gulp-uglify'),
	cleanCSS 		= require('gulp-clean-css'),
	del 			= require('del'),
	ngAnnotate		= require('gulp-ng-annotate'),
	sourcemaps 		= require('gulp-sourcemaps'),
	htmlmin 		= require('gulp-htmlmin'),
	templateCache	= require('gulp-angular-templatecache'),
	inject 			= require('gulp-inject'),
	browserSync 	= require('browser-sync'),
	browserSyncSpa 	= require('browser-sync-spa'),
	mainBowerFiles 	= require('main-bower-files'),
	modRewrite	= require('connect-modrewrite'),

	appCssFiles = './src/**/*.scss',
	appJsFiles = [
		'./src/**/*.module.js',
		'./src/**/*.config.js',
		'./src/**/*.run.js',
		'./src/**/*.provider.js',
		'./src/**/*.filter.js',
		'./src/**/*.directive.js',
		'./src/**/*.service.js',
		'./src/**/*.factory.js',
		'./src/**/*.controller.js'
	],
	indexFile = './src/index.html';


/**
 * CSS tasks
 */
gulp.task('icons', function() {
    return gulp.src('./bower_components/components-font-awesome/fonts/**.*')
       	.pipe(gulp.dest('./dist/fonts'));
});
gulp.task('assets', function() {
    return gulp.src('./src/assets/**')
       	.pipe(gulp.dest('./dist/assets'));
});
gulp.task('vendor', function(){
	
	gulp.src(mainBowerFiles('**/*.css'))
		.pipe(sourcemaps.init())
		.pipe(cleanCSS({compatibility: 'ie8'}, function(details){
			//console.log('[css:vendor:minify] ('+details.name+') Time taken: '+details.stats.timeSpent + ' ms');
		}))
		.pipe(concat('vendor.min.css'))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('dist/css'));

	return gulp.src(mainBowerFiles('**/*.js', {debugging: false}), { read: true })
		.pipe(sourcemaps.init())
		.pipe(uglify({mangle: true}).on('error', function(err) {
			console.log('[Error]', err.toString());
		}))
		.pipe(concat('vendor.min.js'))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('./dist/js'));
})

gulp.task('app',['app:css'], function() {

	return gulp.src(appJsFiles)
		.pipe(sourcemaps.init())
		.pipe(ngAnnotate({remove: true, add: true, single_quotes: true}).on('error', function(Err){
			console.log('[SyntaxError]', Err.message)
		}))
		.pipe(uglify({mangle: true}).on('error', function(err) {
			console.log('[Error]', err.toString());
		}))
		.pipe(concat('app.min.js'))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('app:css', function(){
	gulp.src(appCssFiles)
		.pipe(sourcemaps.init())
		.pipe(cleanCSS({compatibility: 'ie8'}, function(details){
			//console.log('[css:app:minify] ('+details.name+') Time taken: '+details.stats.timeSpent + ' ms');
		}))
		.pipe(concat('app.min.css'))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('templates', function(){
	return gulp.src('./src/app/**/*.html')
		.pipe(htmlmin({
            collapseWhitespace: true,
            maxLineLength     : 120,
            removeComments    : true
        }))
		.pipe(templateCache({
			filename: 'templates.js',
			module: 'ng1-init',
			root: 'app'
		}))
		.pipe(gulp.dest('./dist/'))
});

/**
 * HTML tasks
 */
gulp.task('html', function() {
	var css = gulp.src('./dist/css/*.css', {read: false}),
		vendor = gulp.src('./dist/js/vendor*.js', {read: false}),
		app = gulp.src('./dist/js/app*.js', {read: false});
	return gulp.src(indexFile)
		.pipe(inject(css, {ignorePath: '/dist/', addRootSlash: false}))
		.pipe(inject(vendor, {name: 'vendor', ignorePath: '/dist/',addRootSlash: false}))
		.pipe(inject(app, {name: 'app', ignorePath: '/dist/',addRootSlash: false}))
		.pipe(inject(gulp.src('./dist/templates.js', {read: false}), {name: 'partials', ignorePath: '/dist/',addRootSlash: false
		}))
		.pipe(gulp.dest('./dist/'));
});

/**
 * BUILD tasks
 */
gulp.task('clean', function(cb){
	del([
		'dist/**'
	], cb);
});

gulp.task('browser-sync',['html'], function() {
	return browserSync.init({
		open: false,
		server: {
			baseDir: 'dist',
			middleware: [
				modRewrite([
				  '!\\.\\w+$ /index.html [L]'
				])
			]
		},
		ui: false,
		reloadDelay: 2000,
		reloadOnRestart: true,
		injectChanges: false // inject css changes
	});
});

gulp.task('inject-reload:js',['app','html'], function ()
{
	gulp.start('app');
	gulp.start('html');
  browserSync.reload();
});

gulp.task('inject-reload:css',['app:css'], function ()
{
  browserSync.reload();
});

gulp.task('inject-reload:html', ['templates'], function ()
{
  browserSync.reload();
});

gulp.task('start', ['icons','assets','vendor','app','templates'], function() {
	gulp.watch(['./src/**/*.scss'], ['inject-reload:css']);
	gulp.watch(['./src/**/*.js'], ['inject-reload:js']);
	gulp.watch(['./src/app/**/*.html'], ['inject-reload:html']);
	gulp.start('browser-sync');
});