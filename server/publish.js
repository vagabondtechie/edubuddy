Meteor.publish('groups', function() {
	var owner = this.userId;
	if(this.userId) {
		var user = Meteor.users.findOne(this.userId);
		return Groups.find({$or: [{"createdBy": this.userId}, {"members": user.emails[0].address}]},{});
	} else {
		this.ready();
	}
});
Meteor.publish('topics', function() {
	var owner = this.userId;
	if(this.userId) {
		// var user = Meteor.users.findOne(this.userId);
		return Topics.find({},{sort: {lastUpdatedWhen: -1, views: -1}});
	} else {
		this.ready();
	}
});
Meteor.publish('topicreplies', function() {
	var owner = this.userId;
	if(this.userId) {
		return TopicReplies.find({},{sort: {when: 1}});
	} else {
		this.ready();
	}
});
Meteor.publish('onlineUsers', function() {
	var owner = this.userId;
	if(this.userId) {
		return OnlineUsers.find({userId: {$ne: this.userId}});
	} else {
		this.ready();
	}
});
Meteor.publish('mytasks', function() {
	var owner = this.userId;
	if(this.userId) {
		return Tasks.find({whose: this.userId});
	} else {
		this.ready();
	}
});