 function settings(basePath) {
    basePath = basePath ? basePath : process.cwd();
     return {
        sass: basePath + '/src/sass/**/*.scss',
        entryFile: basePath + '/src/jsx/Promo.jsx',
        extensions: ['.jsx'],
        autoprefixerLevel: ['last 3 versions', 'Android >= 4.3', 'iOS >= 7'],
        babelPresets: ['babel-preset-es2015', 'babel-preset-react'],
        staticFiles: {
            images: basePath + '/src/images/**/*',
            videos: basePath + '/src/video/**/*',
            javascript: basePath + '/src/js/**/*',
            html: basePath + '/src/index.html',
            json: basePath + '/src/*.json'
        }
    };
 }

module.exports = settings;