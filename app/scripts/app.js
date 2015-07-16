/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
  var chatMessageQueue = [];
  window.customLang = (navigator.browserLanguage || navigator.language ||
          navigator.userLanguage).substr(0,2);

  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  function validate() {
    document.getElementById('#handle').validate();
  }

  var randomCat = function() {
      var cats = ['tabby', 'bengal', 'persian', 'mainecoon', 'ragdoll', 'sphynx', 'siamese', 'korat', 'japanesebobtail', 'abyssinian', 'scottishfold'];
      return cats[(Math.random() * cats.length) >>> 0];
  };

  var randomColor = function() {
      var colors = ['navy', 'slate', 'olive', 'moss', 'chocolate', 'buttercup', 'maroon', 'cerise', 'plum', 'orchid'];
      return colors[(Math.random() * colors.length) >>> 0];
  };

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
    var settings = document.querySelector('#dialog');
    var settingsOK = document.querySelector('#settingsOK');
    var settingsCog = document.querySelector('#settingsCog');
    settings.open();

    var msgList = document.querySelector('#chatMessageList');
    var sendMessageButton = document.querySelector('#sendButton');
    var chatInput = document.querySelector('#input');
    var userHandle = document.querySelector('#handle');
    var content = document.querySelector('#primaryContent');

    var avatar = 'images/' + randomCat() + '.jpg';
    var color = randomColor();
    var userList = document.querySelector('#users');
    var translator = document.querySelector('#translator');
    var languages = document.querySelector('#languages');

    sendMessageButton.addEventListener('click', function(){
      polychat.send(chatInput.value);
      chatInput.value = '';
      chatInput.focus();
    });

    settingsOK.addEventListener('click', function() {
      userHandle.validate();
      polychat.name = userHandle.value;
      console.log('Polychat username:', polychat.name);
      polychat.connect();
    });

    settingsCog.addEventListener('click', function() {
      settings.open();
    });

    // Firebase integration
    var polychat = new Polychat();
    polychat.name = userHandle.value;

    polychat.onMessage = function(name, text) {
      //$('<div/>').text(text).prepend($('<em/>').text(name + ': ')).appendTo(messages);
      //messages[0].scrollTop = messages[0].scrollHeight;

      msgList.addMessage({
        message: text,
        author: name,
        avatar: 'images/' + randomCat() + '.jpg'
      });

      primaryContent.parentElement.scrollTop = primaryContent.scrollHeight + 200;

    };

      polychat.onUsers = function(users) {
        var output = '';
        for (var name in users) {
          output += '<li>' + name;
          if (users[name]) {
            output += ' (typing)';
          }
          output += '</li>';
        }

        userList.innerHTML = '<ul>' + output + '</ul>';
      };

      chatInput.addEventListener('keypress', function(e) {
        var enter = e.keyCode == 13;
        if (enter) {
          polychat.send(chatInput.value);
          chatInput.value = '';
          chatInput.focus();
        }
        polychat.typing(!enter);
      });

      // $('#input').keypress(function (e) {
      //   var enter = e.keyCode == 13;
      //   if (enter) {
      //     polychat.send($('#input').val());
      //     $('#input').val('').focus();
      //   }
      //   polychat.typing(!enter);
      // });

    //

  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('.app-name');
    var middleContainer = document.querySelector('.middle-container');
    var bottomContainer = document.querySelector('.bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

})(document);
