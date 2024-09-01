/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "循環参照が検知されました。",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-orphans",
      comment: "このモジュールはどこからも参照されていません。",
      severity: "error",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|cts|mts|json)$", // dot files
          "[.]d[.]ts$", // TypeScript declaration files
          "(^|/)tsconfig[.]json$", // TypeScript config
          "(^|/)(?:babel|webpack)[.]config[.](?:js|cjs|mjs|ts|cts|mts|json)$", // other configs
        ],
      },
      to: {},
    },
    {
      name: "not-to-spec",
      comment: "テストファイルをimportするのは禁止しています。",
      severity: "error",
      from: {},
      to: {
        path: "[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx|ls|coffee|litcoffee|coffee[.]md)$",
      },
    },
  ],
  options: {
    /* Which modules not to follow further when encountered */
    doNotFollow: {
      /* path: an array of regular expressions in strings to match against */
      path: ["node_modules"],
    },

    /* prefix for links in html and svg output (e.g. 'https://github.com/you/yourrepo/blob/develop/'
       to open it on your online repo or `vscode://file/${process.cwd()}/` to
       open it in visual studio code),
     */
    prefix: "https://github.com/TakanoriOnuma/depcruise-visualizer/blob/main/",

    /* false (the default): ignore dependencies that only exist before typescript-to-javascript compilation
       true: also detect dependencies that only exist before typescript-to-javascript compilation
       "specify": for each dependency identify whether it only exists before compilation or also after
     */
    tsPreCompilationDeps: true,

    /* TypeScript project file ('tsconfig.json') to use for
       (1) compilation and
       (2) resolution (e.g. with the paths property)

       The (optional) fileName attribute specifies which file to take (relative to
       dependency-cruiser's current working directory). When not provided
       defaults to './tsconfig.json'.
     */
    tsConfig: {
      fileName: "tsconfig.json",
    },
    reporterOptions: {
      dot: {
        /* pattern of modules that can be consolidated in the detailed
           graphical dependency graph. The default pattern in this configuration
           collapses everything in node_modules to one folder deep so you see
           the external modules, but not the innards your app depends upon.
         */
        collapsePattern: "node_modules/(?:@[^/]+/[^/]+|[^/]+)",

        /* Options to tweak the appearance of your graph.See
           https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#reporteroptions
           for details and some examples. If you don't specify a theme
           don't worry - dependency-cruiser will fall back to the default one.
        */
        // theme: {
        //   graph: {
        //     /* splines: "ortho" will give you straight lines at the expense of
        //                 being slow to render on big graphs
        //        splines: "true" will give you bezier curves which are faster
        //                 but might not look as nice
        //    */
        //     splines: "true"
        //   },
        // }
      },
    },
  },
};
