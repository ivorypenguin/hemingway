/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone-amd/backbone',
        underscore: '../bower_components/underscore-amd/underscore',
        ice: './ice.min'
    }
});

require([
    'backbone',
    'ice'
], function (Backbone) {
    Backbone.history.start();

    jQuery(function() {
        var tracker = new ice.InlineChangeEditor({
            // element to track - ice will make it contenteditable
            element: document.getElementById('editor'),
            // tell ice to setup/handle events on the `element`
            handleEvents: true,
            // set a user object to associate with each change
            currentUser: { id: 1, name: 'Tutor' }
        });
        // setup and start event handling for track changes
        tracker.startTracking();
        
        window.tracker = tracker;
    });
});
