module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'jsdoc',
        'eslint-plugin-tsdoc'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jsdoc/recommended'
    ],
    "rules": {
        "semi": "off",
        "@typescript-eslint/semi": ["error"],

        "indent": "off",
        "@typescript-eslint/indent": ["error", 4],

        "no-loop-func": "off",
        "@typescript-eslint/no-loop-func": ["warn"],

        "func-call-spacing": "off",
        "@typescript-eslint/func-call-spacing": ["error", "never"],

        "keyword-spacing": "off",
        "@typescript-eslint/keyword-spacing": ["error", {
            "before": true,
            "after": true,
            "overrides":{
                "if":{
                    "after": false
                },
                "for":{
                    "after": false
                },
                "while":{
                    "after": false
                }
            }
        }],

        "function-paren-newline": ["error", { "minItems": 4 }],
        "eol-last": ["error", "always"],
        "no-trailing-spaces": ["error"],
        "no-multi-spaces": ["error"],
        "camelcase": ["error"],
        "new-parens": ["error"],
        "multiline-comment-style": ["error", "separate-lines"],
        "no-inline-comments": "error",
        "capitalized-comments": ["error"],
        "no-lonely-if": ["error"],
        "linebreak-style": ["error", "unix"],
        "func-style": ["error", "declaration"],
        "no-unneeded-ternary": ["error"],
        "one-var": ["error", "never"],
        "prefer-object-spread": ["error"],
        "sort-imports": ["error"],
        "space-infix-ops": ["error"],
        "space-unary-ops": ["error", {"words": true, "nonwords": false}],
        "switch-colon-spacing": ["error", {"after": true, "before": false}],
        "space-in-parens": ["error", "never"],
        "semi-style": ["error", "last"],
        "padded-blocks": ["error", "never"],
        "operator-assignment": ["error", "always"],
        "no-unreachable": "error",
        "no-unreachable-loop": "error",
        "getter-return": ["error", { "allowImplicit": false }],
        "comma-style": ["error", "last"],
        "comma-spacing": ["error", { "before": false, "after": true }],

        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": ["error"],

        "no-dupe-class-members": "off",
        "@typescript-eslint/no-dupe-class-members": ["error"],

        "no-duplicate-imports": "off",
        "@typescript-eslint/no-duplicate-imports": ["error"],

        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": ["error"],

        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],

        "quotes": "off",
        "@typescript-eslint/quotes": ["error", "double"],

        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": ["error", "never"],

        "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1, "maxBOF": 0 }],

        "no-extra-parens": "off",
        "@typescript-eslint/no-extra-parens": ["error"],

        "no-extra-semi": "off",
        "@typescript-eslint/no-extra-semi": ["error"],

        "no-magic-numbers": "off",
        "@typescript-eslint/no-magic-numbers": ["error", { "ignore": [0, 1], "ignoreEnums": true }],

        "lines-between-class-members": "off",
        "@typescript-eslint/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],

        "comma-dangle": "off",
        "@typescript-eslint/comma-dangle": ["error", "always-multiline"],

        "brace-style": "off",
        "@typescript-eslint/brace-style": ["error", "1tbs"],
        
        "jsdoc/require-jsdoc": ["error", {'require': {
            ArrowFunctionExpression: false,
            FunctionDeclaration: true,
            FunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            MethodDefinition: true,
          }, 
          'checkGetters': true,
          'checkSetters': true,
          'enableFixer': true,
          'checkConstructors': false
          }
        ],
        "jsdoc/require-returns-description": "error",
        "jsdoc/require-returns-type": "off",
        "jsdoc/require-returns": "error",
        "jsdoc/require-param": ["error", {
            'checkConstructors': false,
            'checkDestructured': false
        }],
        "jsdoc/require-param-type": 0,
        "jsdoc/check-param-names": ["error", {
            'checkDestructured': false
        }],
        "jsdoc/check-tag-names": ["warn", {
            "definedTags": ["packageDocumentation"]
        }],
        "tsdoc/syntax": "error",
    },
   "settings": {
        "jsdoc": {
            "mode": "typescript",
        }
    }
};