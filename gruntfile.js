module.exports = function (grunt) {
  grunt.initConfig({
    // nsp: {
    //   package: grunt.file.readJSON("package.json")
    // },

    //jsdoc config
    jsdoc: {
      dist: {
        src: [
          "README.md",
          "lib/**/*.js",
        ],
        options: {
          destination: "docs",
          template: "node_modules/ink-docstrap/template",
          // configure: "node_modules/ink-docstrap/template/jsdoc.conf.json"
          configure: "jsdoc.json"
        }
      }
    },

    tslint: {
      options: {
        configuration: "tslint.json",
        force: false,
        fix: false
      },
      files: {
        src: [
          "lib/**/*.ts"
        ]
      }
    },

    ts: {
      default: {
        // specifying tsconfig as a boolean will use the "tsconfig.json" in same folder as Gruntfile.js
        tsconfig: true
      }
    },

    watch: {
      ts: {
        files: [
          "lib/**/*.ts",
          "examples/**/*.ts",
          "test/**/*.ts"
        ], // 監視するファイル
        tasks: ["tslint", "ts"] // 実行するタスク
      }
    }

    // // devserver config
    // devserver: {
    //   server: {},
    //   options: {
    //     "base": "docs"
    //   }
    // },
  });

  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-contrib-watch");
  // grunt.loadNpmTasks("grunt-nsp");

  // grunt.registerTask("doc", ["jsdoc"]);
  // grunt.registerTask("validate", ["tslint"]);
  // grunt.registerTask("validate", ["tslint", "nsp"]);

  grunt.registerTask("default", ["validate", "ts"]);
};
