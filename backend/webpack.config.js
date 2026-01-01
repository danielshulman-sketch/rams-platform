module.exports = function (options) {
    return {
        ...options,
        externals: {
            // Exclude pdf-parse and its native dependencies from webpack bundling
            'pdf-parse': 'commonjs pdf-parse',
        },
    };
};
