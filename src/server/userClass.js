export class userClass {
  constructor(names) {
    this.names = names;
  }

  claimUsername(name) {
    if (!name || this.names[name]) {
      return false;
    } else {
      this.names[name] = true;
      return true;
    }
  }

  getGuestName() {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!this.claimUsername(name));

    return name;
  }

  // serialize claimed names as an array
  getUsers() {
    var res = [];
    for (let user in this.names) {
      res.push(user);
    }

    return res;
  }

  freeUser(name) {
    if (this.names[name]) {
      delete this.names[name];
    }
  }

  validateName(name) {
    var filter = [ 
      "Trump","Obama","Gandhi","Johnny Hallyday","APPLICATION BOT","Admin"
    ]

    for (var i=0; i<filter.length; i++) {
        var pattern = new RegExp('\\b' + filter[i] + '\\b', 'gi');
        if(pattern.test(name)){
          return false
        }
    }

    return true
  }
}