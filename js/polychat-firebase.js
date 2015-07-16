var Polychat = function() {

  var self = this;
  self.name = 'Anonymous';
  self.users = {};
  self.user = null;
  self.messages = null;
  self.typingInterval = null;

  self.connect = function() {

    var fb = new Firebase('https://dpe-polychat.firebaseio.com/');
    var users = fb.child('users');

    self.user = users.child(self.name);
    self.user.set(false);
    self.user.onDisconnect().remove();
    users.once('value', function(snapshot) {
      self.users = snapshot.val();
      self.onUsers(self.users);
    });

    users.on('child_added', function(snapshot) {
      var name = snapshot.key();
      self.users[name] = false;
      self.onJoin(name);
      self.onUsers(self.users);
    });

    users.on('child_removed', function(snapshot) {
      var name = snapshot.key();
      delete self.users[name]
      self.onLeave(name);
      self.onUsers(self.users);
    });

    users.on('child_changed', function(snapshot) {
      var name = snapshot.key();
      var typing = snapshot.val();
      self.users[name] = typing;
      self.onChange(name, typing);
      self.onUsers(self.users);
    });

    self.messages = fb.child('messages');
    self.messages.limitToLast(4).on('child_added', function(snapshot) {
      var message = snapshot.val();
      self.onMessage(message.name, message.text);
    });

  };

  self.onUsers = function(users) {
    console.log('Users changed:', users);
  };

  self.onJoin = function(name) {
    self.onMessage(name, 'joins');
  };

  self.onLeave = function(name) {
    self.onMessage(name, 'leaves');
  };

  self.onChange = function(name, typing) {
    self.onMessage(name, typing ? 'is typing' : 'stopped typing');
  };

  self.onMessage = function(name, text) {
    console.log(name + ': ' + text);
  };

  self.send = function(text) {
    if (self.messages != null) {
      self.messages.push({type: 'message', name: self.name, text: text});
    }
  };

  self.typing = function(typing) {
    var clear = function() {
      self.typingInterval = null;
      self.user.set(false);
    };
    if (self.user != null) {
      if (self.typingInterval != null) {
        clearTimeout(self.typingInterval);
      }
      if (typing) {
        if (self.typingInterval == null) {
          self.user.set(true);
        }
        self.typingInterval = setTimeout(clear, 3000);
      } else {
        clear();
      }
    }
  };

};