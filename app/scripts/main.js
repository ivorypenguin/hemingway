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
        ice: './ice.min',
        socket: 'http://ivorypenguin.com:9999/socket.io/socket.io',
        datachannel: 'http://ivorypenguin.com:9999/datachannel.io/datachannel.io'
    }
});

require([
    'backbone',
    'ice',
    'socket',
    'datachannel'
], function (Backbone) {
    Backbone.history.start();

   // jQuery(function() {
        // hemingway.getCursorPos();
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
                var range = this._ice.getCurrentRange();
                var change = this._ice.getChange();
                var textToSend = String.fromCharCode(e.which);
                if (!e.shiftKey)  {
                    textToSend = textToSend.toLowerCase();
                }
                var actionType = (e.keyCode == 8) ? 'delete' : 'insert';
                var synergyData = {startOffset: range.startOffset, 
                                   endOffset: range.endOffset, 
                                   html: range.toHtml(), 
                                   text: textToSend, 
                                   parentId: range.startContainer.parentNode.id,
                                   action: actionType
                                   }
                //console.log(this._ice.env);
                //console.log(range.startContainer.parentNode.id);
                //console.log("shift: " + e.shiftKey)
                //console.log(JSON.stringify(range));
                console.log(range);
                hemingway.send(synergyData);
                //console.log("Changed: " + change.startOffset + " to " + change.endOffset);
                //console.log(JSON.stringify(synergyData));
               return true;
            },
            nodeInserted: function(node, range) {
                //console.log("inserted: ");
                //console.dir(node);
                //console.log(range);
                //var data = {"text": node.textContent, "action": "ins"}
                //hemingway.send(data);
                return true;
            },
            nodeCreated: function(node, options) {
                //console.log("created: ");
                //console.dir(node);
                //console.dir(options);
                //hemingway.send({'element': node, 'settings': options});
                return true;
            }

        };
        ice.dom.noInclusionInherits(IceHemingwayPlugin, ice.IcePlugin);
        exports._plugin.IceHemingwayPlugin = IceHemingwayPlugin;

    }).call(ice); 

    var hemingway = (function () {
        var init,
            tracker,
            sendChatMessage,
            sendData,
            dataChannel,
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
                plugins: ['IceEmdashPlugin', 'IceCopyPastePlugin', 'IceHemingwayPlugin']
            });
            // setup and start event handling for track changes
            tracker.startTracking();

            window.tracker = tracker; 

            dataChannel = new DataChannel({
                socketServer: 'http://ivorypenguin.com:9999'
            });

            dataChannel.join('room');
            
            dataChannel.in("room").on("action", function(data) {
                //tracker.insert(data.text);
                // ice._plugin.IceHemingwayPlugin.prototype.boom(data)
                // var range = document.createRange(document.getElementById('editor'), data.startOffset);
                // var range = document.createRange(document.getElementById(data.parentId), data.startOffset);
                // range.setEnd(data.endOffset);
                var range = tracker.selection.getRangeAt(data.startOffset);

                console.log("offsets: " + data.startOffset + ", " + data.endOffset);
                console.log(range);
                range.setStart(range.startContainer, data.startOffset);
                range.setEnd(range.endContainer, data.endOffset);
                range.collapse(true);
                console.log(range);
                if (data.action === 'delete') {
                    tracker.deleteContents(true, range);
                } else {
                    tracker.insert(document.createTextNode(data.text), range );
                }
            });
            
            dataChannel.in("room").on("chat", function(data) {
                console.log(data);
            });
        }
        
        sendData = function (data) {
            dataChannel.in("room").emit("action", data);
        };
        
        sendChatMessage = function (data) {
            dataChannel.in("room").emit("chat", data);
        };

        init();
        
        return {
            send: sendData,
            chat: sendChatMessage,
            getCursorPos: getCursorPos
        }
    })();
    window.hemingway = hemingway;
});
