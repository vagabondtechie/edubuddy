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
        host: PEERSERVER, port: PORT, path: PATH,
        debug: 3
    });
    peername = Meteor.user().profile.name;
    peer.on('open', function(id) {
        peername = Meteor.user().profile.name;
        peerId = selfId;
    });
    peer.on('connection', setThingsUpForNewConn);
    peer.on('error', function(err) {
        console.log('Peer Error Type: ' + err.type);
        destroyPeer();
        createPeer(Meteor.userid);
    });
    return true;
}
destroyPeer = function destroyPeer() {
    if(connectedPeers !== null && connectedPeers.length > 0) {
        // close all connections....
    }
    if (peer !== null && !peer.destroyed) {
        peer.destroy();
        peer = null;
    }
}
startChat = function startChat(userid) {
    if (peer === null || peer.destroyed) {
        createPeer(Meteor.userid);
    } else if (peer.disconnected) {
        destroyPeer();
        createPeer(Meteor.userid);
    }
    if (!connectedPeers['peer_' + userid]) {
        var connection = peer.connect(userid, {
            label: 'chat',
            serialization: 'none',
            reliable: false,
            metadata: {
                message: 'hi i want to chat with you!', senderName: peername
            }
        });
        connection.on("open", function() {
            setThingsUpForNewConn(connection);
        });
        connection.on("error", function(err) {
            console.log('Connection Error: ' + err);
            alert(connection + "----" + connection.open);
        });
    }
}
function setThingsUpForNewConn(c) {
    var username = "";
    var userid = c.peer;
    var chatBox = null;
    var chatBoxDiv = null;
    var messageBox = null;
    
    connectedPeers['peer_' + c.peer] = 1;
    // userid = c.peer;

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
                    e.preventDefault();
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
    
    c.on("data", function(data) {
        messageBox.append(data);
        messageBox.scrollTop(messageBox[0].scrollHeight);
        chatBoxDiv.slideDown();
        document.getElementById("messagetone").play();
    });
    c.on("close", function() {
        // alert(username + ' has left the chat.');
        chatBox.remove();
        if (c !== null) {
            // redundant code. Here for completeness purpose
            delete connectedPeers['peer_' + c.peer];
            for (i = 0; i < peer.connections[c.peer].length; i++) {
                peer.connections[c.peer][i].close();
            }
            delete peer.connections[c.peer];
        }
    });
}
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