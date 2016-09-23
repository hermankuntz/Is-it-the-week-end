'use strict';
var Alexa = require('alexa-sdk');
var timezones = require('./data/timezones.js');
var cities = require('./data/cities.js');
var answers = require('./data/answers.js');

var APP_ID = 'amzn1.ask.skill.e9fd838d-bb48-42f6-a248-0272a6cd8982';
var SKILL_NAME = 'Is it the weekend';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

function getRandomAnswer(type){
    return answers[type][Math.floor(Math.random()*answers[type].length)].toString();
}

var weekendStartDay = 5;
var weekendStartHour = 18;
var weekendStopDay = 0;
var weekendStopHour = 0;

var handlers = {
    'LaunchRequest': function () {
        console.log('LaunchRequest');
        this.emit('ResponseIntent');
    },
    'IsTheWeekendIntent': function () {
        console.log('IsTheWeekendIntent');
        this.emit('ResponseIntent');
    },
    'ResponseIntent': function () {

        var speechOutput = "";

        var zone = null;
        if(!!this.event.request.intent){
            if(!!this.event.request.intent.slots.CITY.value){
                zone = cities[this.event.request.intent.slots.CITY.value.toString().toLowerCase()];
            }else if(!!this.event.request.intent.slots.ZONE.value){
                zone = this.event.request.intent.slots.ZONE.value.toString().toLowerCase();
            }
        }

        if(!zone){ // no zone found, choose a random city
            var city = Object.keys(cities)[Math.floor(Math.random()*Object.keys(cities).length)];
            var zone = cities[city];
            speechOutput = getRandomAnswer('prefix').format(city, zone);
        }

        var now = new Date()
        now.setHours(now.getHours() + timezones[zone]);

        if(now.getDay() > weekendStopDay && now.getDay() < weekendStartDay){ // from tuesday to thursday
            speechOutput += getRandomAnswer('no');
        }

        if(now.getDay() == weekendStartDay){ // friday

            var hoursBeforeWeekend =  now.getHours() - weekendStartHour;

            if(hoursBeforeWeekend < 0){ speechOutput += getRandomAnswer('not_yet'); }

            if(hoursBeforeWeekend == 0){ speechOutput += getRandomAnswer('yes_now'); }
            
            if(hoursBeforeWeekend > 0){ speechOutput += getRandomAnswer('yes'); }
        }

        if(now.getDay() > weekendStartDay){ // saturday
            speechOutput += getRandomAnswer('yes');
        }

        this.emit(':tell', speechOutput, SKILL_NAME, now);

    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "You can ask me if it is the week end in a city or state. It also works with some countries ... try it!";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }
};

