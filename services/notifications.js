'use strict';

var _ = require('lodash');

let events = {}

class Notifications {
    static pub(eventName) {
        if (!_.isEmpty(events[eventName])) {
            events[eventName].map((callback) => {
                if (_.isFunction(callback)) {
                    callback();
                }
            });
        }
    }

    static sub(eventName, callback) {
        if (_.isEmpty(events[eventName])) {
            events[eventName] = [];
        }

        if (!_.isFunction(callback)) {
            return ;
        }

        events[eventName].push(callback);
    }   

    static remove(eventName, func) {
        let callbacks = events[eventName].filter((cb) => {
            return cb.toString() != func.toString();
        });

        if (callbacks.length <= 0) {
            delete events[eventName];
            return ;
        }

        events[eventName] = callbacks;
    }
}

module.exports = Notifications;