/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['firebase', 'undici', '@firebase/auth'],
    webpack: (config) => {
        config.module.rules.push({
            test: /\.js$/,
            include: /node_modules\/undici/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        '@babel/plugin-transform-private-methods',
                        '@babel/plugin-transform-class-properties',
                        '@babel/plugin-transform-private-property-in-object'
                    ]
                }
            }
        });
        return config;
    },
};

module.exports = nextConfig;
