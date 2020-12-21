module.exports = {
  parser: 'babel-eslint',
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  extends: [
    'eslint:recommended',
    'prettier',
    'prettier/react',
    'plugin:react/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['react', 'react-hooks', 'import', 'prettier'],
  rules: {
    'no-unexpected-multiline': 2,
    'no-eval': 1,
    'default-case': 1,

    // Import-specific rules
    'import/no-default-export': 2, // Prohibit default exports
    'import/no-duplicates': 2, // Reports if a resolved path is imported more than once.

    // React-specific Rules
    'react-hooks/rules-of-hooks': 2, // hook rules
    'react/jsx-closing-bracket-location': 1, // alignment
    'react/jsx-closing-tag-location': 1, // alignment
    'react/jsx-wrap-multilines': 1, // alignment
    'react/jsx-boolean-value': 1, // Enforce boolean attributes notation in JSX
    'react/no-array-index-key': 1, // array index cannot be used as key
    'react/prop-types': 0, // not using prop-types
    'react/jsx-pascal-case': 2 // use pascal case for jsx
  }
}
