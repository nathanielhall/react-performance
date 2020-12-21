module.exports = (api) => {
  const isTest = api.env('test')

  api.cache(true)

  return {
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          targets: {
            esmodules: true
          },
          modules: isTest ? 'commonjs' : false
        }
      ]
    ]
  }
}
