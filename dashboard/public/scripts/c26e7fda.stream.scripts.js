"use strict";var streamerService=function(){function a(a,b,c){this._serviceId=a,this._ioType="STDOUT"==b?"out":"error",this._xhr=null,this._dataCallback=c||function(){},this._createXhrObject()}function b(b,c,d){e||(e=!0,f=new a(b,c,d))}function c(){e&&f.poll()}function d(a){$.get(window.socketConnectionString+"io/"+f.getServiceId()+"/"+f.getIOType()+"/list/",function(b){a&&a(b)})}a.prototype._createXhrObject=function(){this._xhr=new XMLHttpRequest,this._xhr.onload=this._onLoad.bind(this),this._xhr.onloadend=this._onLoadEnd.bind(this),this._xhr.onreadystatechange=this._onXhrStateChanged.bind(this)},a.prototype.poll=function(){this._xhr.open("GET",this._getStreamUri(),!0),this._xhr.send(null)},a.prototype._onLoad=function(){this._dataCallback&&this._dataCallback(this._xhr.responseText)},a.prototype._onLoadEnd=function(){},a.prototype._onXhrStateChanged=function(){4==this._xhr.readyState},a.prototype._getStreamUri=function(){return window.socketConnectionString+"io/"+this._serviceId+"/"+this._ioType+"/stream/"},a.prototype.getIOType=function(){return this._ioType},a.prototype.getServiceId=function(){return this._serviceId};var e=!1,f=null;return{initialize:b,getSTDFilesList:d,poll:c}}();$(function(){function a(a){e.text(e.text()+a)}function b(a){console.log(a)}function c(){e.text("")}function d(){c(),streamerService.poll()}var e=$(".io-container pre");streamerService.initialize(window.serviceId,window.ioType,a),streamerService.getSTDFilesList(b),d()});