const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

// Define a task to compile your SCSS files
gulp.task('sass', function () {
  return gulp.src('assets/*.scss') // Source folder containing the SCSS files
    .pipe(sass().on('error', sass.logError)) // Compile SCSS to CSS and log errors
    .pipe(gulp.dest('assets')); // Destination folder for the compiled CSS files
});

// Watch task to automatically compile SCSS when changes are made
gulp.task('watch', function () {
  gulp.watch('assets/*.scss', gulp.series('sass'));
});

// Default task (run with 'gulp')
gulp.task('default', gulp.series('sass', 'watch'));
