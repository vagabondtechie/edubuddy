if(Meteor.isClient) {
	Meteor.subscribe("groups");
	Meteor.subscribe("topics");
	Meteor.subscribe("topicreplies");
	Meteor.subscribe("onlineUsers");
	Meteor.subscribe("mytasks");
}

Router.configure({
	layoutTemplate: 'authLayout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loading'
});

Router.route('/', {name: 'home', layoutTemplate: 'layout'});
Router.route('/login', {name: 'login', layoutTemplate: 'layout'});
Router.route('/createAc', {name: 'createAc', layoutTemplate: 'layout'});
Router.route('/recoverPwd', {name: 'recoverPwd', layoutTemplate: 'layout'});

Router.route('/userhome', {name: 'userhome',
	data: function() {
		var myGrps = Groups.find({});
		var me = Meteor.user();
		var tasks = Tasks.find({}, {sort: [["createdOn", "desc"]], limit: 3});
		var topics = Topics.find({}, {sort: [["view", "desc"]], limit: 3});
		console.log(tasks.count());
		return {myGrps: myGrps, me: me, mytasks: tasks, topics: topics};
	}
});
Router.route('/groups');
Router.route('/topics');
Router.route('/topics/:_id', {name: 'viewTopic',
	data: function() {
		var topic = Topics.findOne(this.params._id);
		var replies = TopicReplies.find({topicId: this.params._id}).fetch();		
		return {topic: topic, replies: replies};
	}
});
Router.route('/newGroup');
Router.route('/searchGrps');
Router.route('/groups/:_id', {name: 'thisGroup',
	data: function() {
		return Groups.findOne(this.params._id);
	}
});
Router.route('/tutorials');
Router.route('/utilities');
