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

    watch: {
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
  grunt.loadNpmTasks("grunt-contrib-watch");
  // grunt.loadNpmTasks("grunt-nsp");

  // grunt.registerTask("doc", ["jsdoc"]);
  // grunt.registerTask("validate", ["tslint"]);
  // grunt.registerTask("validate", ["tslint", "nsp"]);

  grunt.registerTask("default", ["validate", "ts"]);
};
