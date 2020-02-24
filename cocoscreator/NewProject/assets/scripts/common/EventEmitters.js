/**
 * Created by litengfei on 16/10/16.
 */
var UnitTools = require("UnitTools");
//var UnitTools = require("./UnitTools.js");
function EventEmitters()
{
    this.events = {};
}
EventEmitters.prototype.on = function(eName,callback)
{
    var cbs = null;
    if(UnitTools.hasKey(this.events,eName)){
        cbs = this.events[eName];
    }else{
        cbs = this.events[eName] = [];
    }
    cbs.push(callback);
}
EventEmitters.prototype.emit = function(eName)
{
    var args = Array.prototype.slice.call(arguments,1,arguments.length);
    UnitTools.forEach(this.events[eName],function(key,value)
    {
        value.apply(value,args);
    });
}

EventEmitters.prototype.remove = function(callback)
{

    var self = this;
    var rmA = {};
    for(var key in this.events)
    {
        var nameEvents = this.events[key];
        for(var key1 in nameEvents){
            var oneCb = nameEvents[key1];
            if(oneCb == callback) {
                UnitTools.getOrCreateArrayInJson(key,rmA).push(oneCb);
            }
        }

    }
    UnitTools.forEach(rmA,function(key,value)
    {
        UnitTools.removeArray(self.events[key],[callback]);
    });
}

EventEmitters.prototype.off = function(callback){
    this.remove(callback);
}
EventEmitters.prototype.removeEvent = function(eName)
{
    UnitTools.remove(this.events,eName);
}

module.exports = EventEmitters;

// var test = function(){
//     var event = new EventEmitters();
//     var a = function () {
//
//     }.bind(this);
//
//     var b = function () {
//
//     }.bind(this);
//     event.on("a",a);
//     event.on("a",b);
//     console.log(event.events);
//
//     event.off(a);
//     event.off(b);
//     console.log(event.events);
// }
//
// test();