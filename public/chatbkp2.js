chatBoxColorClasses = ['button-warning','button-success','button-secondary'];
connectedPeers = {};
peername = "";
peerId = "";
i = 0;

peer = null;

createPeer = function createPeer(selfId) {
    if(selfId === null) {
        return;
    }
    peer = new Peer(selfId, {
        host: PEERSERVER,
        port: PORT,
        path: PATH,
        debug: 3/*,
        config: {
            'iceServers': [{
                url: 'stun:stun.l.google.com:19302'
            }]
        }*/
    });
    peer.on('open', function(id) {
        peername = Meteor.user().profile.name;
        peerId = id;
    });
    peer.on('connection', connect);
    peer.on('error', function(err) {
        console.log('Peer Error Type: ' + err.type);
        if (err.type === 'unavailable-id') {
            peer.reconnect();
        }
        /*destroyPeer();
        createPeer(Meteor.userid);*/
    });
    return true;
}

// Handle a connection object.
function connect(c) {
    // Handle a chat connection.
    if (c.label === 'chat') {
        var username = "";
        var userid = c.peer;
        var chatBox = null;
        var chatBoxDiv = null;
        var messageBox = null;

        Meteor.call('getUsrDtls', userid,
            function(error, result) {
                if(error != null) {
                    console.log("Error while getting user details - " + error.reason)
                } else {
                    username = result.profile.name;
                    var now = new Date();
                    $("#activeChats").prepend('<form class="pure-form" id="chatForm_' + userid + '">'
                        + '<div id="cb_' + userid + '"><button class="pure-button '
                        + chatBoxColorClasses[i % 3] + ' full-width" onclick="return showHide(\'chatBoxDiv_' + userid +'\');">'
                        + username + '</button><div id="chatBoxDiv_' + userid
                        + '" data-chatwith="' + userid + '" style="display: none;" class="chatBoxDiv">'
                        + '<div id="msgBox_' + userid + '" class="msgListBox"><em><small> Chat started at ' + formatDate(now) +'.</small></em></div>'
                        + '<input type="text" class="pure-input" placeholder="Type Your Message" id="chatBox_'
                        + userid + '" /><button class="pure-button sendBtn" id="sendBtn_' + userid + '">YO</button></div></div></form>');
                    i++;
                    $("#olUsersList").slideUp();
                    $(document).on('click', "#sendBtn_" + userid, function(e) {
                        doNothing(e);
                        var pid = ('' + this.id).split('_')[1];
                        var msg = $("#chatBox_" + pid).val();
                        c.send("<p><strong>" + peername +":</strong> " + msg + "</p>");
                        messageBox.append("<p><strong>You:</strong> " + msg + "</p>");
                        messageBox.scrollTop(messageBox[0].scrollHeight);
                        $("#chatBox_" + pid).val("");
                        return false;
                    });

                    chatBox = $("#cb_" + userid);
                    chatBoxDiv = $("#chatBoxDiv_" + userid);
                    messageBox = $("#msgBox_" + userid);
                    chatBoxDiv.slideDown();
                }
            });
        
        c.on('data', function(data) {
            messageBox.append(data);
            messageBox.scrollTop(messageBox[0].scrollHeight);
            chatBoxDiv.slideDown();
            document.getElementById("messagetone").play();
        });
        c.on('close', function() {
            alert(username + ' has left the chat.');
            chatBox.remove();
            delete connectedPeers[c.peer];
        });
    }
}
// $(document).ready(function() {
//     $(document).on('click', ".startChatBtn", function(e) {
//         console.log(e);
//     });
// });
startChat = function startChat(requestedPeer) {
    if (!connectedPeers[requestedPeer]) {
        c = peer.connect(requestedPeer, {
            label: 'chat',
            serialization: 'none',
            reliable: false,
            metadata: {
                message: 'hi i want to chat with you!'
            }
        });
        c.on('open', function() {
            connect(c);
        });
        c.on('error', function(err) {
            alert(err);
        });
    }
    connectedPeers[requestedPeer] = 1;
}
function closeAllConnections() {
    eachActiveConnection(function(c) {
        c.close();
    });
}
function eachActiveConnection(fn) {
    var actives = $('.chatBoxDiv');
    var checkedIds = {};
    actives.each(function() {
        var peerId = $(this).attr('data-chatwith');

        if (!checkedIds[peerId]) {
            var conns = peer.connections[peerId];
            for (var i = 0, ii = conns.length; i < ii; i += 1) {
                var conn = conns[i];
                fn(conn, $(this));
            }
        }
        checkedIds[peerId] = 1;
    });
}
destroyPeer = function destroyPeer() {
    closeAllConnections();
    if (peer !== null && !peer.destroyed) {
        peer.destroy();
    }
    peer = null;
}
function doNothing(e) {
    e.preventDefault();
    e.stopPropagation();
}
window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
        Meteor.logout();
    }
};
showHide = function showHide(id) {
    $("#" + id).slideToggle();
    return false;
}
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
formatDate = function formatDate(date) {
    var dateStr = '';
    dateStr = dateStr + date.getDate() + '-' + months[date.getMonth()] + '-' + date.getFullYear();
    dateStr = dateStr + ', ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    return dateStr;
}