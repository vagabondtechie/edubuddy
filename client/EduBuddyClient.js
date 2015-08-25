var USEREMAIL = "useremail";
Template.body.helpers({
	userEmail: function() {
		return Session.get(USEREMAIL);
	}
});
Template.leftmenu.events({
	'click #signout': function(event) {
		clickedSignout = 1;
		destroyPeer();
		Router.go("home");
		Meteor.logout();
	},
	'click .leftLink': function(event, template) {
		template.$(".selectedLink").removeClass("selectedLink");
		$(event.target).addClass("selectedLink");
	}

});
Template.authLayout.helpers({
	onlineUsers: function() {
		return OnlineUsers.find({});
	}
});
Template.login.events({
	'click button': function(event, template) {
		var email = template.$("#email").val();
		var password = template.$("#password").val();
		template.$("#msg").html("");
		Meteor.loginWithPassword(email, password, function(error) {
			if(error != null) {
				template.$("#msg").html(error.reason);
			} else {
				Meteor.logoutOtherClients();
				Session.set(USEREMAIL, Meteor.user().emails[0].address);
				createPeer();
				Router.go("userhome");
			}
		});
		return false;		
	}
});
Template.recoverPwd.events({
	'click button': function(event, template) {
		var email = template.$("#email").val();	
		if(email == null || email === "") {
			alert("Please enter your login email address.");
		} else {
			Accounts.forgotPassword({email: email}, function(err) {
				if(typeof err !== 'undefined' && err !== null) {
					template.$("#msg").html(err);
					return false;
				} else {
					template.$("#msg").html("A password recovery mail has been sent to your email address.");
				}
			});
		}

		return false;
	}
});
Template.groups.helpers({
	myGrps: function() {
		return Groups.find({});
	}
});
Template.userhome.events({
	'click #myName': function(event, template) {
		var name = "";
		while(name === "") {
			name = prompt("Whats your name?", this.me.profile.name);
		}
		if(name !== null) {
			Meteor.call('updateUserName', name, function(error, result) {
			if(error != null) {
				alert(error.reason);
			}
		});
		}
	},
	'click #myStatus': function(event, template) {
		var status = "";
		while(status === "") {
			status = prompt("Whats on your mind?");
		}
		if(status !== null) {
			Meteor.call('updateStatus', status, function(error, result) {
			if(error != null) {
				alert(error.reason);
			}
		});
		}
	},
});
Template.groups.events({
	'click button': function(event, template) {
		//alert(Meteor.user().emails[0].address);
		var grpName = template.$("#grpName").val();
		var grpDesc = template.$("#grpDesc").val();
		template.$("#msg").html("");
		if(!grpName || !grpDesc) {
			template.$("#msg").html("Please enter group name and description.");
			return false;
		}
		var email = Meteor.user().emails[0].address;
		Meteor.call('addNewGrp', grpName, grpDesc, email, [email,], 'public');
		template.$("#grpName").val("");
		template.$("#grpDesc").val("");
		return false;
	}
});
Template.createAc.events({
	'click button': function(event, template) {
		var username = template.$("#username").val();
		var loginPwd = template.$("#loginPwd").val();
		template.$("#msg").html("");
		if(!username || !loginPwd) {
			template.$("#msg").html("Please enter a username and your login password.");
			return false;
		}
		Accounts.createUser({email: username, password: loginPwd,
			profile: {name: 'Click To Set Name', status: 'Hey there. I am a proud EduBuddy user.'}},
			function(err) {
				if(typeof err !== 'undefined' && err !== null) {
					template.$("#msg").html(err.reason);
					return false;
				}
				createPeer();
				Session.set(USEREMAIL, Meteor.user().emails[0].address);
				Router.go("userhome");
			});
		return false;
	}
});
Template.newGroup.events({
	'submit form': function(event, template) {
		var grpName = template.$("#grpName").val();
		var grpDesc = template.$("#grpDesc").val();
		var owner = Meteor.user().emails[0].address;
		template.$("#msg").html("");
		if(grpName === null || grpDesc === null || grpName === "" || grpDesc === "") {
			template.$("#msg").html("Please enter group name and group description.");
			return false;
		} else {
			Meteor.call('addNewGrp', grpName, grpDesc, owner,
				[owner, ], 'public');
			Router.go("groups");
			return false;
		}
	}
});
Template.thisGroup.events({
	'click #newTopic': function(event, template) {
		Session.set("grpIdForTopic", this._id);
		Session.set("grpNameForTopic", this.grpName);
	},
});
Template.searchGrps.helpers({
	groupsList: function() {
		return Session.get("searchedGroups");
	}
});
Template.searchGrps.events({
	'submit form': function(event, template) {
		var grpName = template.$("#grpName").val();
		template.$("#msg").html("");
		Session.set("searchedGroups", {});
		Meteor.call('searchGrps', grpName, function(error, result) {
			if(error != null) {
				template.$("#msg").html(error.reason);
			} else {
				Session.set("searchedGroups", result);
			}
		});
		return false;
	},
	'click .jngrp': function(event, template) {
		Meteor.call('joinGroup', this._id, function(error, message) {
			if(error != null) {
				template.$("#msg").html(error.reason);
			} else {
				template.$("form").submit();
				template.$("#msg").html(message);
			}
		});
		return false;
	}
});
Template.topics.helpers({
	topics: function() {
		return Topics.find({}).fetch();
	}
});
Template.topics.events({
	'submit form': function(event, template) {
		var subject = template.$("#subject").val();
		var yourview = template.$("#yourview").val();

		Meteor.call('addTopic', 
			Session.get("grpIdForTopic"),
			Session.get("grpNameForTopic"),
			subject, yourview,
			function(error, result) {
				if(error != null) {
					template.$("#msg").html(error.reason);
				} else {
					template.$("#msg").html("Topic added successfully. Let the discussions begin...");
					template.$("#subject").val("");
					template.$("#yourview").val("");
				}
			});
		return false;
	},
	'click .topicLnk': function() {
		Meteor.call('topicViewed', 
			this._id,
			function(error, result) {
				// Write logic, if required
			});
	}
});
Template.viewTopic.events({
	'submit form': function(event, template) {
		var reply = template.$("#topicAnswer").val();
		Meteor.call('replyToTopic',
			this.topic._id,
			reply,
			function(error, result) {
				if(error != null) {
					template.$("#msg").html(error.reason);
				} else {
					template.$("#topicAnswer").val("");
				}
			});
		return false;
	},
	'click #siti': function(event, template) {
		document.getElementById("speakloud").play();
		Meteor.call('addWhistle',
			Meteor.user().emails[0].address,
			this._id,
			function(error, result) {
				if(error != null) {
					template.$("#msg").html(error.reason);
				}
			});
	}
});
Template.searchGrps.events({

});
Template.utilities.events({
	'click #speakBtn': function(event, template) {
		var text = template.$("#text2speech").val();
		if(text === null || text.trim() === "") {
			return false;
		}
		var link = 'https://translate.google.co.in/translate_tts?ie=UTF-8&tl=en&q=' + text;
		var src = template.$("#mp3voice").attr(
			"src", link);

		var audioplayer = document.getElementById("speakloud");
		audioplayer.src = 'https://translate.google.co.in/translate_tts?ie=UTF-8&tl=en&q=' + text;
		audioplayer.load();
		audioplayer.play();
	},
	'submit form': function(event, template) {
		event.preventDefault();
		var task = template.$("#todo").val();
		if (task === null || task.trim() === "") {
			return false;
		}
		Meteor.call('addNewTask',
			task,
			'normal',
			function(error, result) {
				if(error != null) {
					template.$("#msg").html(error.reason);
				} else {
					template.$("#todo").val("");
					template.$("#msg").html(result);
					Meteor.setTimeout(function() {
						template.$("#msg").html("");
					}, 2000);
				}
			});
	}
});
Template.utilities.helpers({
	myTasks: function() {
		return Tasks.find({}, {sort: [["createdOn", "desc"]]});
	}
});
// Template.searchGrps.created = function() {
// 	alert("HEllo");
// 	Session.set("searchedGroups", {});
// }