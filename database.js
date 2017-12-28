var loki = require('lokijs');

var db = new loki('loki.json');

var users = db.addCollection('users');

users.insert({name: 'Timur', sername: 'Fatykhov', email: 'fatykhov.timur.m@gmail.com'});