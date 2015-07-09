/* global require, process */

"use strict";

var _ = require("lodash");
var LineByLineReader = require('line-by-line');

// TODO with no arguments, read from STDIN
if (process.argv.length < 3) {
    console.log('This script requires one argument, the filename of the input JSON');
    process.exit(1);
}

var fileName = process.argv[2];
var ret = {
    'ditems': [],
    'themes': [],
    'perspectives': []
};
var raw = {};  // parsed JSON from input file
var internal, external, links;

var lr = new LineByLineReader(fileName);

// TODO error handling

lr.on('line', function(line) {
    // console.log(line);
    // pick out the sections we need
    raw = JSON.parse(line);
    internal = raw.extended_internal_dependencies;
    external = raw.extended_external_dependencies;

    // insert into output record
    links = []; // reset for each line of input

    internal.forEach(function(dep) {
        // we'll clean up duplicates at the end
        ret.themes.push({
            'type': 'theme',
            'name': dep.dep_name
        });
        links.push(dep.dep_name);
    });

    external.forEach(function(dep) {
        ret.perspectives.push({
            'type': 'perspective',
            'name': dep.dep_name
        });
        links.push(dep.dep_name);
    });

    ret.ditems.push({
        'type': 'ditem',
        'name': raw.repo_name,
        'links': links
    });
});

lr.on('end', function() {
    // Until ES6, we don't have a standard Set type
    // The simplest solution is to remove duplicates after all insert operations.
    // Sorting, then eliminating duplicates is asymptotically faster than eliminating duplicates without sorting.
    // Keeping the list sorted and never storing duplicates would use less memory, but it's a little more complex.
    ret.themes = _.uniq(_.sortBy(ret.themes, 'name'), true, 'name');
    ret.perspectives = _.uniq(_.sortBy(ret.perspectives, 'name'), true, 'name');
    console.log(JSON.stringify(ret));
});