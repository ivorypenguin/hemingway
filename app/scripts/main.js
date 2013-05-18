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

   // jQuery(function() {
        // hemingway.getCursorPos();
        window.hemingway = hemingway;
        jQuery.browser = {
            version: 'p'
        };
    // });

    (function() {

        var exports = this;

        var IceHemingwayPlugin = function(ice_instance) {
            this._ice = ice_instance;
        };

        IceHemingwayPlugin.prototype = {

            keyDown: function(e) {
                var change = this._ice.getCurrentRange();
                //var synergyData = {startOffset: change.startOffset, endOffset: change.endOffset, }
                //console.log(change);
                //console.log("Changed: " + change.startOffset + " to " + change.endOffset);
                //console.log(JSON.stringify(synergyData));
               return true;
            },
            nodeInserted: function(node, range) {
                console.log("inserted: ");
                console.dir(node);
                return true;
            },
            nodeCreated: function(node, options) {
                console.log("created: ");
                console.dir(node);
                console.dir(options)
                return true;
            },

        };

        ice.dom.noInclusionInherits(IceHemingwayPlugin, ice.IcePlugin);
        exports._plugin.IceHemingwayPlugin = IceHemingwayPlugin;

    }).call(ice); 

    var hemingway = (function () {
        var init,
            tracker,
            getCursorPos;

        getCursorPos = function (element) {
            console.log("getCursorPos() call");
            var caretOffset = 0;
            if (typeof window.getSelection != "undefined") {
                var range = window.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
                var textRange = document.selection.createRange();
                var preCaretTextRange = document.body.createTextRange();
                preCaretTextRange.moveToElementText(element);
                preCaretTextRange.setEndPoint("EndToEnd", textRange);
                caretOffset = preCaretTextRange.text.length;
            }
            return caretOffset;
        }

        init = function (argument) {
            console.log("Initilizing hemingway...");
            tracker = new ice.InlineChangeEditor({
                // element to track - ice will make it contenteditable
                element: document.getElementById('editor'),
                // tell ice to setup/handle events on the `element`
                handleEvents: true,
                // set a user object to associate with each change
                currentUser: { id: 1, name: 'Tutor' },
                plugins: ['IceEmdashPlugin', 'IceHemingwayPlugin']
            });
            // setup and start event handling for track changes
            tracker.startTracking();

            window.tracker = tracker; 
        }
        
        init();
        
        return {
            getCursorPos: getCursorPos
        }
    })(); 
});
