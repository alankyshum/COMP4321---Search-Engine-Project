const gulp = require('gulp')
  , sass = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer');

gulp.task('build:scss', function () {
  return gulp.src('src/scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions']
  }))
  .pipe(gulp.dest('./css'))
});

gulp.task('build', ['build:scss'] , null);
gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', ['build:scss']);
});
