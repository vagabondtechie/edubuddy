Meteor.methods({
	addNewGrp: function(grpName, grpDesc, owner, members, privacy) {
		Groups.insert({
			grpName: grpName,
			grpDesc: grpDesc,
			createdBy: Meteor.userId(),
			owner: owner,
			members: members,
			privacy: privacy,
			membersCount: 1
		});
	},
	searchGrps: function(grpName) {
		var grps = Groups.find({grpName: new RegExp(grpName, "i")}).fetch();
		// grps[0].isMember = "false";
		var me;
		if((me = Meteor.users.findOne(this.userId))) {
			var email = me.emails[0].address;
			var found;
			for(i = 0; i < grps.length; i++) {
				found = false;
				for(j = 0; j < grps[i].members.length; j++) {
					if(grps[i].members[j] == email) {
						found = true;
						break;
					}
				}
				if(found) {
					grps[i].isMember = true;
				} else {
					grps[i].isMember = false;
				}
			}
		}
		return grps;
	},
	joinGroup: function(grpId) {
		var me;
		if((me = Meteor.users.findOne(this.userId))) {
			Groups.update(Groups.findOne(grpId), {$addToSet: {members: me.emails[0].address}});
			return "Joined group successfully.";
		}
		return "Couldn't join group. Please try again later.";
	},
	addTopic: function(grpId, grpName, subject, view) {
		var me;
		if((me = Meteor.users.findOne(this.userId))) {
			var now = new Date();
			var topicId = Topics.insert({
					groupId: grpId,
					groupName: grpName,
					startedBy: me.profile.name,
					startedWhen: now,
					lastUpdatedBy:  me.profile.name,
					lastUpdatedWhen: now,
					views: 1,
					subject: subject
				});
			var topicReplyId = TopicReplies.insert({
					topicId: topicId,
					reply: view,
					who: me.profile.name,
					when: now,
					whistles: []
				});
		}
	},
	replyToTopic: function(topicId, reply) {
		var me;
		if((me = Meteor.users.findOne(this.userId))) {
			var now = new Date();
			Topics.update({_id: topicId},
				{$set: {
						lastUpdatedBy: me.profile.name,
						lastUpdatedWhen: now
					}});
			TopicReplies.insert({
				topicId: topicId,
				reply: reply,
				who: me.profile.name,
				when: now,
				whistles: []
			});
		}
	},
	topicViewed: function(topicId) {
		if(this.userId) {
			Topics.update({_id: topicId}, {$inc: {views: 1}});
		}
	},
	updateUserName: function(name) {
		if(this.userId) {
			Meteor.users.update({_id: this.userId}, { $set: {"profile.name": name}});
			OnlineUsers.upsert({userId: this.userId}, {userId: this.userId, username: name});
		}
	},
	updateStatus: function(status) {
		if(this.userId) {
			Meteor.users.update({_id: this.userId}, { $set: {"profile.status": status}});
		}
	},
	setOnline: function(peerId, isOnline) {
		if(this.userId) {
			if(isOnline) {
				var user = Meteor.users.findOne(this.userId);
				OnlineUsers.remove({userId: this.userId});
				OnlineUsers.insert({userId: this.userId, username: user.profile.name, peerId: peerId});
			} else {
				OnlineUsers.remove({userId: this.userId});
			}
		}
	},
	getUsrDtls: function(peerId) {
		if(this.userId) {
			var peer = OnlineUsers.findOne({peerId: peerId});
			var user = Meteor.users.findOne({_id: peer.userId});
			return user;
		}
	},
	addWhistle: function(email, replyId) {
		if(this.userId) {
			TopicReplies.update({_id: replyId}, {$addToSet: {whistles: email}});
		}
	},
	addNewTask: function(task, priority) {
		if(this.userId) {
			Tasks.insert({
				whose: this.userId,
				task: task,
				createdOn: new Date(),
				done: false,
				completedOn: '',
				priority: priority
			});
			return "New item added successfully.";
		}
		return "Could not save the item.";
	}
});