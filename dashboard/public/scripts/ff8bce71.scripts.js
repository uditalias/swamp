"use strict";var app=angular.module("swamp",["swamp.config","ngCookies","ngResource","ngSanitize","ui.router","ui.bootstrap","Scope.safeApply","Scope.onReady","swamp.filters","swamp.controllers","swamp.directives","swamp.services"]);angular.module("swamp.config",[]),angular.module("swamp.filters",[]),angular.module("swamp.controllers",[]),angular.module("swamp.directives",[]),angular.module("swamp.services",[]),app.run(["socketService","swampManager",function(a,b){b.initialize(),a.setup()}]),angular.module("swamp.config").constant("env",{name:"production",serviceUptimeTickInterval:5e3}),app.config(["env",function(a){"production"==a.name&&(a.socketConnectionString=socketConnectionString)}]),app.config(["$locationProvider","$urlRouterProvider",function(a,b){a.html5Mode(!0),b.otherwise("/404/")}]),angular.module("swamp.config").constant("SOCKET_EVENTS",{CONNECT:"connect",DISCONNECT:"disconnect",MESSAGE:"message",SWAMP_INITIAL:"swamp.initialData",SWAMP_OUT:"swamp.out",SWAMP_ERROR:"swamp.error",SWAMP_RESTART_ALL:"swamp.restartAllRunning",SWAMP_STOP_ALL:"swamp.stopAllRunning",SWAMP_START_ALL:"swamp.startAll",SERVICE_START:"service.start",SERVICE_STOP:"service.stop",SERVICE_RESTART:"service.restart",SERVICE_ERROR:"service.error",SERVICE_OUT:"service.out",SERVICE_MONITOR:"service.monitor"}).constant("EVENTS",{SWAMP_SERVICES_RECEIVED:"event::swamp.services.received",SWAMP_DISCONNECTED:"event::swamp.disconnected",SWAMP_OUT:"event::swamp.out",SWAMP_ERROR:"event::swamp.error",SWAMP_DATA_RECEIVED:"event::swamp.data.received",SERVICE_MONITOR_UPDATE:"event::service.monitor.update",SERVICE_START:"event::service.start",SERVICE_STOP:"event::service.stop",SERVICE_RESTART:"event::service.restart",SERVICE_OUT:"event::service.out",SERVICE_ERROR:"event::service.error",SWAMP_MANAGER_INITIALIZED:"event::swamp.manager.initialized",SWAMP_SERVICES_MANAGER_INITIALIZED:"event::swamp.services.manager.initialized",OPEN_FOOTER_PANEL:"event::open.footer.panel",FOOTER_PANEL_STATE_CHANGE:"event::footer.panel.state.change",SERVICES_FILTER_CHANGE:"event::services.filter.change"}).constant("SERVICE_STATE",{STOP:"service.state.stop",RUN:"service.state.run",RESTART:"service.state.restart"}).constant("CLIENT_REQUEST",{REQUEST_START_SERVICE:"request.start.service",REQUEST_STOP_SERVICE:"request.stop.service",REQUEST_RESTART_SERVICE:"request.restart.service"}).constant("AGGREGATED_LIST_TYPE",{LIFO:1,FIFO:2}).constant("LOG_TYPE",{OUT:"log.out",ERROR:"log.error"}),app.config(["$tooltipProvider",function(a){a.setTriggers({mouseover:"mouseout"})}]),_.mixin({deepFind:function(a,b,c){var d,e,f,g=0;for(d=b&&b.split("."),e=d&&d.length;e>g&&a;){if(f=d[g],g++,g>=e&&null!=c)return void(a[f]=c);a=a[f]}return e>g&&(a=null),a}}),_.mixin({pushAll:function(a,b){a.push.apply(a,b)}}),_.mixin({emptyArray:function(a){a.length=0}}),_.mixin({nextPrevPageParser:function(a){var b={},c=a._resultmeta||a;return c.next&&(b.next=_.parseInt(/\w*page=(\d+)/i.exec(c.next)[1])),c.previous&&(b.prev=_.parseInt(/\w*page=(\d+)/i.exec(c.previous)[1])),b}}),_.mixin({cloneArray:function(a){return a.slice(0)}}),_.mixin({throttleStore:function(a,b,c){var d=[],e=_.throttle(function(){a(_.cloneArray(d)),_.emptyArray(d)},b,c);return function(a){_.pushAll(d,a),e()}}}),_.mixin({arrayRemoveItem:function(a,b){var c=a.indexOf(b);-1!=c&&a.splice(c,1)}}),_.mixin({getUrls:function(a){for(var b,c,d=/((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,e=[];c=a.match(d);)b=c[0],e.push(b),a=a.replace(b,"");return e}}),_.mixin({guid:function(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).substr(-4)}}),_.mixin({bytesToSize:function(a){var b=1e3,c=["Bytes","KB","MB","GB","TB"];if(0===a)return"0 Bytes";var d=parseInt(Math.floor(Math.log(a)/Math.log(b)),10);return(a/Math.pow(b,d)).toPrecision(3)+" "+c[d]}}),_.mixin({toArray:function(a){var b=[],a=a||{};return _.forEach(a,function(a){b.push(a)}),b}}),angular.module("swamp.filters").filter("trim",[function(){return function(a,b){return b=b||220,null!==a&&void 0!==a?a.length>=b?[a.substring(0,b),"..."].join(""):a:void 0}}]),angular.module("swamp.services").factory("swampServicesFactory",["$rootScope","env","SERVICE_STATE","CLIENT_REQUEST","aggregatedDataFactory","AGGREGATED_LIST_TYPE","LOG_TYPE","serializeService",function(a,b,c,d,e,f,g,h){function i(a){this.id=a.id,this.name=a.name,this.description=a.description,this.path=a.path,this.script=a.script,this.isRunning=a.isRunning,this.runningEnvironment=a.runningEnvironment,this.selectedEnvironment=a.runningEnvironment,this.pid=a.pid,this.options=a.options,this.environments=a.environments,this.monitorCpu=a.monitor.cpu,this.monitorMemory=a.monitor.memory,this.monitor=a.monitor,this.state=this.isRunning?c.RUN:c.STOP,this.startTime=a.startTime,this.uptime=null,this._uptimeInterval=null,this._createMonitorDataContainers(),this._createLogDataContainers(this.options.maxLogsToSave),this.isRunning&&this._startUptimeMessageSync(),k.call(this,a.logs)}function j(a){return new i(a)}function k(a){var b,c=this;a.err&&_.forEach(a.err,function(a){b=h.serializeLogData(g.ERROR,a),c.errorLogData.add(b)}),a.out&&_.forEach(a.out,function(a){b=h.serializeLogData(g.OUT,a),c.outLogData.add(b)})}return i.prototype={updateMonitorData:function(b){this.monitor=b,this.cpuData.add(this.monitor.cpu),this.memoryData.add(this.monitor.memory),a.$safeApply()},stop:function(){a.$broadcast(d.REQUEST_STOP_SERVICE,this)},start:function(b){b=b||this.selectedEnvironment,a.$broadcast(d.REQUEST_START_SERVICE,this,b)},restart:function(b){b=b||this.selectedEnvironment,a.$broadcast(d.REQUEST_RESTART_SERVICE,this,b)},forceStop:function(){this._stopUptimeMessageSync(),this.pid=null,this.isRunning=!1,this.startTime=null,this.cpuData.clear(),this.memoryData.clear(),this.monitor.cpu=0,this.monitor.memory=0,this.state=c.STOP,a.$safeApply()},forceStart:function(b){this._startUptimeMessageSync(),this._merge(b),this.state=c.RUN,a.$safeApply()},forceRestart:function(){this.state=c.RESTART,a.$safeApply()},log:function(a,b){var c=h.serializeLogData(a,b);switch(a){case g.OUT:this.outLogData.add(c);break;case g.ERROR:this.errorLogData.add(c)}},clearErrorLogs:function(){this.errorLogData.clear()},clearOutLogs:function(){this.outLogData.clear()},clearLogs:function(){this.clearErrorLogs(),this.clearOutLogs()},dispose:function(){this.forceStop()},_merge:function(a){_.assign(this,a)},_createMonitorDataContainers:function(){this.cpuData=e.create(f.FIFO,100),this.memoryData=e.create(f.FIFO,100)},_createLogDataContainers:function(a){this.outLogData=e.create(f.FIFO,a),this.errorLogData=e.create(f.FIFO,a)},_startUptimeMessageSync:function(){this.uptime=moment(new Date).from(this.startTime),this._uptimeInterval=setTimeout(function(){this._startUptimeMessageSync()}.bind(this),b.serviceUptimeTickInterval)},_stopUptimeMessageSync:function(){clearTimeout(this._uptimeInterval),this._uptimeInterval=null,this.uptime=null}},{create:j}}]),angular.module("swamp.services").factory("aggregatedDataFactory",["AGGREGATED_LIST_TYPE","$rootScope",function(a,b){function c(b,c){this.id=_.guid(),this.type=b||a.FIFO,this.maxItems=c||0,this._data=[]}function d(a,b){return new c(a,b)}return c.prototype={add:function(a){return this._data.push(a),this.maxItems>0&&this.count()>this.maxItems?this._automatedRemove():void b.$safeApply()},remove:function(a){this._data.splice(a,1),b.$safeApply()},get:function(a){return this._data[a]},getAll:function(){return this._data},clear:function(){this._data.length=0,b.$safeApply()},count:function(){return this._data.length},_automatedRemove:function(){switch(this.type){case a.FIFO:this.remove(0);break;case a.LIFO:this.remove(this.count()-1)}}},{create:d}}]),angular.module("swamp.services").service("serializeService",[function(){this.serializeSwampService=function(a){return{id:_.guid(),name:a.name,description:a.description,path:a.path,script:a.script,isRunning:a.isRunning,runningEnvironment:a.runningEnvironment,pid:a.pid,startTime:a.startTime,options:a.options,environments:a.environments,monitorCpu:a.monitor.cpu,monitorMemory:a.monitor.memory,logs:a.logs,monitor:{cpu:0,memory:0}}},this.serializeMonitorData=function(a){return{cpu:a.monitor.cpu,memory:a.monitor.memory}},this.serializeServiceStart=function(a){return{isRunning:a.isRunning,runningEnvironment:a.runningEnvironment,pid:a.pid,startTime:a.startTime}},this.serializeServiceStop=function(a){return{pid:a.pid,startTime:a.startTime}},this.serializeLogData=function(a,b){return{type:a,text:b.text,time:moment(b.time)}}}]),angular.module("swamp.services").service("socketService",["SOCKET_EVENTS","EVENTS","swampServicesManager","serializeService","env","$rootScope",function(a,b,c,d,e,f){this._socket=null,this.setup=function(){this._socket=io.connect(e.socketConnectionString,{reconnect:!1}),this._bindSocketEvents()},this._bindSocketEvents=function(){this._socket.on(a.CONNECT,this._onSocketConnect.bind(this)),this._socket.on(a.DISCONNECT,this._onSocketDisconnect.bind(this)),this._socket.on(a.MESSAGE,this._onSocketMessage.bind(this))},this._emit=function(a,b){b=b||{},a=a.name||a,this._socket.emit(a,b)},this._onSocketConnect=function(){},this._onSocketDisconnect=function(){f.$broadcast(b.SWAMP_DISCONNECTED)},this._onSocketMessage=function(c){if(c&&c.event)switch(c.event){case a.SWAMP_INITIAL:var e=[];_.forEach(c.data.services||[],function(a){e.push(d.serializeSwampService(a))}),f.$broadcast(b.SWAMP_DATA_RECEIVED,c.data.swamp),f.$broadcast(b.SWAMP_SERVICES_RECEIVED,e);break;case a.SWAMP_OUT:var g=c.data.log;f.$broadcast(b.SWAMP_OUT,g);break;case a.SWAMP_ERROR:var g=c.data.log;f.$broadcast(b.SWAMP_ERROR,g);break;case a.SERVICE_MONITOR:var e=d.serializeMonitorData(c.data),h=c.data.name;f.$broadcast(b.SERVICE_MONITOR_UPDATE,h,e);break;case a.SERVICE_START:var e=d.serializeServiceStart(c.data),h=c.data.name;f.$broadcast(b.SERVICE_START,h,e);break;case a.SERVICE_STOP:var e=d.serializeServiceStop(c.data),h=c.data.name;f.$broadcast(b.SERVICE_STOP,h,e);break;case a.SERVICE_RESTART:var h=c.data.name;f.$broadcast(b.SERVICE_RESTART,h);break;case a.SERVICE_OUT:var h=c.data.name,g=c.data.log;f.$broadcast(b.SERVICE_OUT,h,g);break;case a.SERVICE_ERROR:var h=c.data.name,g=c.data.log;f.$broadcast(b.SERVICE_ERROR,h,g)}},f.$on(a.SERVICE_START,this._emit.bind(this)),f.$on(a.SERVICE_STOP,this._emit.bind(this)),f.$on(a.SERVICE_RESTART,this._emit.bind(this)),f.$on(a.SWAMP_STOP_ALL,this._emit.bind(this)),f.$on(a.SWAMP_RESTART_ALL,this._emit.bind(this)),f.$on(a.SWAMP_START_ALL,this._emit.bind(this))}]),angular.module("swamp.services").service("swampManager",["$rootScope","EVENTS","LOG_TYPE","serializeService","aggregatedDataFactory","AGGREGATED_LIST_TYPE",function(a,b,c,d,e,f){function g(a,b){this.log(c.OUT,b)}function h(a,b){this.log(c.ERROR,b)}function i(d,e){var f=this;e.logs&&(_.forEach(e.logs.out||[],function(a){f.log(c.OUT,a)}),_.forEach(e.logs.err||[],function(a){f.log(c.ERROR,a)})),a.$broadcast(b.SWAMP_MANAGER_INITIALIZED)}this.outLogData=null,this.errorLogData=null,this.log=function(a,b){var e=d.serializeLogData(a,b);switch(a){case c.OUT:this.outLogData.add(e);break;case c.ERROR:this.errorLogData.add(e)}},this._createLogDataContainers=function(){this.outLogData=e.create(f.FIFO),this.errorLogData=e.create(f.FIFO)},this.initialize=function(){this._createLogDataContainers()},a.$on(b.SWAMP_OUT,g.bind(this)),a.$on(b.SWAMP_ERROR,h.bind(this)),a.$on(b.SWAMP_DATA_RECEIVED,i.bind(this))}]),angular.module("swamp.services").service("swampServicesManager",["swampServicesFactory","$rootScope","EVENTS","CLIENT_REQUEST","SOCKET_EVENTS","LOG_TYPE","SERVICE_STATE",function(a,b,c,d,e,f){function g(){_.forEach(this._services,function(a){a.dispose(),this.removeById(a.id)}.bind(this))}function h(a,d){_.forEach(d,function(a){this.addServiceByRaw(a)}.bind(this)),b.$broadcast(c.SWAMP_SERVICES_MANAGER_INITIALIZED)}function i(a,b,c){var d=this.getByName(b);d&&d.updateMonitorData(c)}function j(a,b,c){var d=this.getByName(b);d&&d.forceStart(c)}function k(a,b,c){var d=this.getByName(b);d&&d.forceStop(c)}function l(a,b){var c=this.getByName(b);c&&c.forceRestart()}function m(a,b,c){var d=this.getByName(b);d&&d.log(f.OUT,c)}function n(a,b,c){var d=this.getByName(b);d&&d.log(f.ERROR,c)}function o(a,c,d){var f={name:c.name,environment:d};b.$broadcast(e.SERVICE_START,f)}function p(a,c){var d={name:c.name};b.$broadcast(e.SERVICE_STOP,d)}function q(a,c,d){var f={name:c.name,environment:d};b.$broadcast(e.SERVICE_RESTART,f)}function r(){g.call(this)}this._services={},this.addService=function(a){this._services[a.id]=a},this.addServiceByRaw=function(c){this.addService(a.create(c)),b.$safeApply()},this.getAll=function(){return this._services},this.getByName=function(a){for(var b in this._services)if(this._services[b].name==a)return this.getById(b);return null},this.getById=function(a){return this._services[a]||null},this.removeById=function(a){delete this._services[a],b.$safeApply()},this.stopAllRunningServices=function(){b.$broadcast(e.SWAMP_STOP_ALL)},this.restartAllRunningServices=function(){b.$broadcast(e.SWAMP_RESTART_ALL)},this.startAllServices=function(){b.$broadcast(e.SWAMP_START_ALL)},b.$on(c.SWAMP_SERVICES_RECEIVED,h.bind(this)),b.$on(c.SWAMP_DISCONNECTED,r.bind(this)),b.$on(c.SERVICE_MONITOR_UPDATE,i.bind(this)),b.$on(c.SERVICE_START,j.bind(this)),b.$on(c.SERVICE_STOP,k.bind(this)),b.$on(c.SERVICE_RESTART,l.bind(this)),b.$on(c.SERVICE_OUT,m.bind(this)),b.$on(c.SERVICE_ERROR,n.bind(this)),b.$on(d.REQUEST_START_SERVICE,o.bind(this)),b.$on(d.REQUEST_STOP_SERVICE,p.bind(this)),b.$on(d.REQUEST_RESTART_SERVICE,q.bind(this))}]),angular.module("swamp.directives").directive("swPerfectScrollbar",["$parse",function(a){return{restrict:"A",priority:100,link:function(b,c,d){function e(){setTimeout(function(){c.is(":visible")&&(g=!0,c.find(".ps-scrollbar-x-rail, .ps-scrollbar-y-rail").css({display:"block",opacity:"0.9"}),c.perfectScrollbar("update")),!g&&e()},f)}var f=500,g=!1;if(c.perfectScrollbar({wheelSpeed:a(d.wheelSpeed)()||50,wheelPropagation:a(d.wheelPropagation)()||!1,minScrollbarLength:a(d.minScrollbarLength)()||!1,suppressScrollX:a(d.suppressScrollX)()||!1,suppressScrollY:a(d.suppressScrollY)()||!1}),d.scrollPositionOutside){var h=parseInt(c.css("padding-right")),i=parseInt(c.css("margin-right"));c.css("padding-right",h+15+"px"),c.css("margin-right",i-15+"px")}d.scrollDisplayed&&e(),c.find(d.refreshOnChange).resize(function(){c.scrollTop(0).perfectScrollbar("update")})}}}]),angular.module("swamp.directives").directive("swScroll",[function(){return{restrict:"A",scope:{swScroll:"&",autoScrollBottom:"="},link:function(a,b){function c(){j&&clearTimeout(j),j=setTimeout(function(){g!=b.scrollTop()&&a.swScroll&&a.swScroll(),g=b.scrollTop()},500)}function d(){k=setTimeout(function(){b.animate({scrollTop:b[0].scrollHeight},i,"swing"),d()},h)}function e(){clearTimeout(k),k=null}function f(a){a?(b.animate({scrollTop:b[0].scrollHeight},i,"swing"),d()):e()}var g=b.scrollTop(),h=100,i=50,j=(b.height(),null),k=null;a.$watch(function(){return a.autoScrollBottom},function(a){f(a)}),b.on("scroll",c)}}}]),angular.module("swamp.directives").directive("swScrollState",["EVENTS",function(){return{restrict:"A",scope:{onScroll:"&onPageScroll"},link:function(a,b,c){function d(){var b=window.scrollY>e;b!=f&&(a.onScroll&&a.onScroll({state:b}),f=b)}var e=c.scrollOffset?parseInt(c.scrollOffset):100,f=!1;$(window).on("scroll",d),a.$on("$destroy",function(){$(window).off("scroll",d)})}}}]),angular.module("swamp.controllers").controller("headerController",["$scope","$rootScope","EVENTS",function(a,b,c){a.handler={pageScrolled:!1,serviceQuery:""},a.onPageScrolled=function(b){a.handler.pageScrolled=b},a.clearFilter=function(){a.handler.serviceQuery=""},a.$watch(function(){return a.handler.serviceQuery},function(a){b.$broadcast(c.SERVICES_FILTER_CHANGE,a)})}]),angular.module("swamp.controllers").controller("footerController",["$scope","$rootScope","EVENTS","swampManager","swampServicesManager",function(a,b,c,d,e){function f(){a.handler.panelContentHeight=g()}function g(){return $(window).innerHeight()-64}function h(){var b=_.where(a.tabsContent,{active:!0});a.handler.title=b[0].name}function i(b,c){a.setActive(c),a.handler.collapsed=!1}function j(){a.tabsContent.push({id:d.outLogData.id,active:!0,tailed:!1,itemcls:"color-green",name:"Swamp out log",content:d.outLogData}),a.tabsContent.push({id:d.errorLogData.id,active:!1,tailed:!1,itemcls:"color-red",name:"Swamp error log",content:d.errorLogData}),a.handler.initializing=!1}function k(){_.forEach(e.getAll(),function(b){a.tabsContent.push({id:b.outLogData.id,active:!1,tailed:!1,itemcls:"color-green",name:b.name+" out log",content:b.outLogData}),a.tabsContent.push({id:b.errorLogData.id,active:!1,tailed:!1,itemcls:"color-red",name:b.name+" error log",content:b.errorLogData})}),a.handler.initializing=!1}a.handler={collapsed:!0,initializing:!0,title:"",maximized:!1,panelContentHeight:300},a.tabsContent=[],a.setActive=function(b){_.forEach(a.tabsContent,function(c){c.active=b==c.id,c.active&&(a.handler.title=c.name)})},a.toggleView=function(){a.handler.maximized?($(window).off("resize",f),a.handler.panelContentHeight=300):(f(),$(window).on("resize",f)),a.handler.maximized=!a.handler.maximized},a.$watch(function(){return a.handler.collapsed},function(d){d?a.handler.title="":h(),b.$broadcast(c.FOOTER_PANEL_STATE_CHANGE,d)}),b.$on(c.OPEN_FOOTER_PANEL,i),b.$on(c.SWAMP_MANAGER_INITIALIZED,j),b.$on(c.SWAMP_SERVICES_MANAGER_INITIALIZED,k)}]),angular.module("swamp.controllers").controller("asideController",["$scope","$rootScope","EVENTS","swampManager","swampServicesManager",function(a,b,c,d,e){a.restartAll=function(){e.restartAllRunningServices()},a.stopAll=function(){e.stopAllRunningServices()},a.startAll=function(){e.startAllServices()},a.showLog=function(a){var e;e="out"==a?d.outLogData.id:d.errorLogData.id,b.$broadcast(c.OPEN_FOOTER_PANEL,e)}}]),angular.module("swamp.controllers").controller("mainController",["$scope","$rootScope","EVENTS",function(a,b,c){function d(b,c){a.footerOpen=!c}a.footerOpen=!1,b.$on(c.FOOTER_PANEL_STATE_CHANGE,d)}]),app.config(["$stateProvider",function(a){a.state("root",{url:"/",templateUrl:"pages/root/rootView.html",controller:"rootController"})}]),angular.module("swamp.controllers").controller("rootController",["$scope","$rootScope","swampServicesManager","swampManager","SERVICE_STATE","EVENTS",function(a,b,c,d,e,f){function g(b,c){a.handler.servicesFilter=c}function h(){a.services=_.toArray(c.getAll()),a.handler.isLoading=!1}a.handler={servicesFilter:"",orderBy:"name",orderByDir:"",filteredServices:[],isLoading:!0},a.SERVICE_STATE=e,a.services=[],a.serviceActions={start:function(a,b){a.start(b)},stop:function(a){a.stop()},restart:function(a,b){a.restart(b)},showServiceOutLog:function(a){b.$broadcast(f.OPEN_FOOTER_PANEL,a.outLogData.id)},showServiceErrorLog:function(a){b.$broadcast(f.OPEN_FOOTER_PANEL,a.errorLogData.id)}},a.bytesToSize=_.bytesToSize,a.orderBy=function(b){a.handler.orderByDir=a.handler.orderBy==b?"-"==a.handler.orderByDir?"":"-":"",a.handler.orderBy=b},b.$on(f.SERVICES_FILTER_CHANGE,g),b.$on(f.SWAMP_SERVICES_MANAGER_INITIALIZED,h)}]);