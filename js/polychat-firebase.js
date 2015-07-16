var Polychat = function() {

  var self = this;
  self.name = 'Anonymous';
  self.user = null;
  self.messages = null;
  self.typingInterval = null;

  self.connect = function() {

    var fb = new Firebase('https://dpe-polychat.firebaseio.com/');
    var users = fb.child('users');

    self.user = users.child(self.name);
    self.user.set(false);
    self.user.onDisconnect().remove();
    users.on('value', function(snapshot) {
      self.onUsers(snapshot.val());
    });

    self.messages = fb.child('messages');
    self.messages.limitToLast(4).on('child_added', function(snapshot) {
      self.onMessage(snapshot.val());
    });

  };

  self.onUsers = function(users) {
    console.log(users);
  };

  self.onMessage = function(message) {
    console.log(message.name + ': ' + message.text);
  };

  self.send = function(text) {
    if (self.messages != null) {
      self.messages.push({type: 'message', name: self.name, text: text});
    }
  };

  self.typing = function() {
    if (self.user != null) {
      if (self.typingInterval == null) {
        self.user.set(true);
      } else {
        clearTimeout(self.typingInterval);
      }
      self.typingInterval = setTimeout(function() {
        self.typingInterval = null;
        self.user.set(false);
      }, 3000);
    }
  };

};