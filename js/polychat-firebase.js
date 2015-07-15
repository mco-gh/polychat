var Polychat = function() {

	var self = this;
	self.fb = null;
	self.name = 'Anonymous';
	self.users = {};
	self.typingTimeout = 3000;
	self.lastKeyPress = new Date();

	self.connect = function(name) {
		self.fb = new Firebase('https://dpe-polychat.firebaseio.com/');
		self.fb.on('child_added', function(snapshot) {
			var message = snapshot.val();
			switch (message.type) {
                case 'join':
                    // User joined.
                    self.onJoin(message.name);
                    break;
                case 'message':
                    // Got a chat message.
                    self.onMessage(message.name, message.text);
                    break;
				case 'typing':
  					if (!self.users[message.name]) {
						// Got a typing event when user isn't typing,
						// run the typing handler.
  						self.onTyping(message.name);
  					} else {
						// Got a typing event when user is already typing,
						// cancel the scheduled handler for typing stopping.
  						clearTimeout(self.users[message.name]);
  					}
  					// Schedule the handler for typing stopping.
						self.users[message.name] = setTimeout(function() {
							delete self.users[message.name];
							self.onTypingStop(message.name);
						}, self.typingTimeout);
					break;
			};
		});
        self.fb.push({type: 'join', name: self.name});
	};

    self.onMessage = function(name, text) {
        console.log(name + ': ' + text);
    };

    self.onJoin = function(name) {
        self.onMessage(name, ' joined');
    };

	self.onTyping = function(name) {
		self.onMessage(name, 'is typing');
	};

	self.onTypingStop = function(name) {
		self.onMessage(name, 'stopped typing');
	};

	self.send = function(text) {
		if (self.fb != null) {
			self.fb.push({type: 'message', name: self.name, text: text});
		}
	};

	self.typing = function() {
		var now = new Date();
		console.log((now - self.lastKeyPress));
		if (self.fb != null && (now - self.lastKeyPress) > 1000 ) {
			self.lastKeyPress = now;
			self.fb.push({type: 'typing', name: self.name});
		}
	};

};