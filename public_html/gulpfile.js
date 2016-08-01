/*eslint-env node*/


var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    maps = require('gulp-sourcemaps'),
    cssnano = require('gulp-cssnano'),
    htmlreplace = require('gulp-html-replace'),
    del = require('del'),
    imageResize = require('gulp-image-resize'),
    imagemin = require('gulp-imagemin'),
    changed = require('gulp-changed'),
    pngquant = require('imagemin-pngquant'),
    chmod = require('gulp-chmod'),
    fs = require('fs'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnext = require('postcss-cssnext'),
    browserSync = require('browser-sync').create();

var resizeImages = function(options) {
    return gulp.src('img/gallery/full_size/*.{jpg,JPG}')
        .pipe(changed('img/gallery/' + options.folder))
        .pipe(imageResize({ width: options.width }))
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(rename(function(path) {
            path.dirname += options.folder;
            path.extname = '.jpg';
            return path;
        }))
        .pipe(gulp.dest('img/gallery'));
};

gulp.task('images1', function() {

    var files = fs.readdirSync('img/gallery/full_size/'),
        index = 1,
        prename = '';

    // here we will find maximum number of index
    // keep in mind that this is very inefficient.
    files.forEach(function(currentFile) {
        var currentIndex = (/^([0-9]+)\.jpg$/i.exec(currentFile) || [, false])[1];
        if (currentIndex && parseInt(currentIndex) >= index) {
            index = ++currentIndex;
        }
    });

    var name = function() {
        if (index < 10) {
            prename = '000';
        } else if (index < 100 && index >= 10) {
            prename = '00';
        } else if (index >= 100) {
            prename = '0';
        }


        return prename + index++;
    };

    return gulp.src('img/new/**.{jpg,JPG}')
        .pipe(chmod(666))
        .pipe(rename(function(path) {
            path.basename = name();
            path.dirname += '/full_size';
            path.extname = '.jpg';
            return path;
        }))
        .pipe(gulp.dest('img/gallery'));
});


gulp.task('images2', function() {


    var small = {
        width: 640,
        folder: '/small'
    };
    var medium = {
        width: 820,
        folder: '/mid'
    };
    var zoom = {
        width: 1290,
        folder: '/zoom'
    };

    return resizeImages(small),
        resizeImages(medium),
        resizeImages(zoom);
});

gulp.task('images3', function() {
    del('img/new/**/*');
});


gulp.task('json', function() {
    gulp.src('img/gallery/**')
        .pipe(require('gulp-filelist')('filelist.json'))
        .pipe(gulp.dest('img'));
});

gulp.task('concatScripts', function() {
    return gulp.src([
            'js/jquery-2.2.0.min.js',
            'js/hammer.min.js',
            'js/vue.min.js',
            'js/vue-router.min.js',
            'js/app.js'
        ])
        .pipe(maps.init())
        .pipe(concat('app.concat.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('js'));
});
gulp.task('minifyScripts', ['concatScripts'], function() {
    return gulp.src('js/app.concat.js')
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('js'));
});
gulp.task('concatCSS', function() {
    return gulp.src([
            'css/normalize.css',
            'css/app.css'
        ])
        .pipe(maps.init())
        .pipe(concat('app.concat.css'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('css'));
});
gulp.task('minifyCSS', ['concatCSS'], function() {
    return gulp.src('css/app.concat.css')
        .pipe(cssnano({ compatibility: 'ie9' }))
        .pipe(rename('app.min.css'))
        .pipe(gulp.dest('css'));
});
gulp.task('build', ['minifyScripts', 'minifyCSS'], function() {
    return gulp.src(['css/app.min.css', 'js/app.min.js', 'js/gallery.json',
            'js/lazysizes.min.js', 'img/gallery/**', 'img/**.{svg,gif,png,jpg}',
            'fonts/**', 'favicon.ico'
        ], { base: './' })
        .pipe(gulp.dest('dist'));
});
gulp.task('replace', function() {
    gulp.src('index.html')
        .pipe(htmlreplace({
            'css': 'css/app.min.css',
            'js': 'js/app.min.js'
        }))
        .pipe(gulp.dest('dist'));
});
gulp.task('clean', ['replace'], function() {
    del(['css/app.*.css*', 'js/app.*.js*']);
});
gulp.task('default', ['build'], function() {
    gulp.start('clean');
});
gulp.task('postcss', function() {
    var processors = [
        autoprefixer({ browsers: ['last 2 versions', '> 5%'] }),
        mqpacker,
        cssnext()
    ];
    return gulp.src('css/app.css')
        .pipe(postcss(processors))
        .pipe(rename('app.post.css'))
        .pipe(gulp.dest('css/'));
});
//Serve development verison 
gulp.task('serve', function() {
    browserSync.init({
        server: './'
        // browser: 'Chrome'

    });
    gulp.watch('js/*.js').on('change', browserSync.reload);
    gulp.watch('*.html').on('change', browserSync.reload);
    gulp.watch('css/*.css').on('change', browserSync.reload);

});