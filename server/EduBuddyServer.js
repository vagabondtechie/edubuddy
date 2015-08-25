Meteor.startup(function() {
	process.env.MAIL_URL = 'smtp://postmaster%40abhishekmaharana.in:0s7oj13oqlq8@smtp.mailgun.org:587/';
    Accounts.emailTemplates.from = "EduBuddy <admin@abhishekmaharana.in>";
    Accounts.emailTemplates.siteName = "Edubuddy.in";
    OnlineUsers.remove({});
    Meteor.users.update({},{$set: {"services.resume.loginTokens": []}},{multi: true})
});

Meteor.setTimeout(function() {
	// Email.send({
 //        to: 'abhishek.vicky87@gmail.com',
 //        from: 'EduBuddy@abhishekmaharana.in',
 //        subject: 'Suswagatam',
 //        text: 'Welcome to the world of EduBuddy. The World of Collaborative Learning.'
 //    });
	// Groups.insert({grpName: 'LP Discussion Group', grpDesc: 'This group intends to discussion the beauty of LP.',
	// 	owner: 'abhishek.vicky87@gmail.com', membersCount: 1, members: ['abhishek.vicky87@gmail.com']});
	// Groups.insert({grpName: 'DAA Discussion Group', grpDesc: 'This group intends to discussion the beauty of DAA.',
	// 	owner: 'abhishek.vicky87@gmail.com', membersCount: 1, members: ['abhishek.vicky87@gmail.com']});	
	
}, 5000	);