"use strict";var streamerService=function(){function a(a,b,c){this._serviceId=a,this._ioType="STDOUT"==b?"out":"error",this._xhr=null,this._dataCallback=c||function(){},this._createXhrObject()}function b(b,c,d){e||(e=!0,f=new a(b,c,d))}function c(a){e&&f.poll(a)}function d(a){$.get(window.socketConnectionString+"io/"+f.getServiceId()+"/"+f.getIOType()+"/list/",function(b){a&&a(b)})}a.prototype._createXhrObject=function(){this._xhr=new XMLHttpRequest,this._xhr.onload=this._onLoad.bind(this),this._xhr.onloadend=this._onLoadEnd.bind(this),this._xhr.onreadystatechange=this._onXhrStateChanged.bind(this)},a.prototype.poll=function(a){this._xhr.open("GET",this._getStreamUri(a),!0),this._xhr.send(null)},a.prototype._onLoad=function(){this._dataCallback&&this._dataCallback(this._xhr.responseText)},a.prototype._onLoadEnd=function(){},a.prototype._onXhrStateChanged=function(){4==this._xhr.readyState},a.prototype._getStreamUri=function(a){return window.socketConnectionString+"io/"+this._serviceId+"/"+this._ioType+"/stream/"+(a?"?fileName="+a:"")},a.prototype.getIOType=function(){return this._ioType},a.prototype.getServiceId=function(){return this._serviceId};var e=!1,f=null;return{initialize:b,getSTDFilesList:d,poll:c}}();$(function(){function a(){$(document.body).toggleClass("opened")}var b=$(".side-menu-toggle"),c=$(".io-container");b.on("click",a),c.on("click",function(){$(document.body).hasClass("opened")&&a()}),$(document).on("keydown",function(b){27==b.which&&$(document.body).hasClass("opened")&&a()})}),$(function(){function a(a){h.text(h.text()+a)}function b(a){i.find("li").removeClass("selected"),$(this).addClass("selected"),j.hide(),j.find("span").text(a),j.show(),e(a)}function c(a){i.find("li").off("click"),i.empty(),_.forEach(a.data,function(a){var c=$("<li />");c.text(a),c.on("click",b.bind(c,a)),c.appendTo(i)})}function d(){h.text("")}function e(a){d(),streamerService.poll(a)}function f(a){$("html").hasClass("light")?(k.find("span").text("ON"),a&&$.cookie(l,1,{expires:365,path:"/"})):(k.find("span").text("OFF"),a&&$.cookie(l,0,{expires:365,path:"/"}))}function g(){f(!1),k.on("click",function(){$("html").toggleClass("light"),f(!0)});var b=$.cookie(l);b&&1==parseInt(b)&&k.trigger("click"),streamerService.initialize(window.serviceId,window.ioType,a),streamerService.getSTDFilesList(c),e()}var h=$(".io-container pre"),i=$(".aside-content ul"),j=$(".selected-file"),k=$(".theme-switch"),l="iostreamtheme";g()});