"use strict";var app=angular.module("swamp",["ngCookies","ngResource","ngSanitize","ui.router","ui.bootstrap","Scope.safeApply","Scope.onReady","swamp.config","swamp.filters","swamp.controllers","swamp.directives","swamp.services"]);angular.module("swamp.config",[]),angular.module("swamp.filters",[]),angular.module("swamp.controllers",[]),angular.module("swamp.directives",[]),angular.module("swamp.services",[]),app.run(["$rootScope",function(){}]),app.run([function(){}]),angular.module("swamp.config").constant("env",{name:"production"}),app.config(["env",function(){}]),app.config(["$locationProvider","$urlRouterProvider",function(a,b){a.html5Mode(!1).hashPrefix("!"),b.otherwise("/")}]),angular.module("swamp.config").constant("EVENTS",{}),String.prototype.format=function(){var a=arguments;return this.replace(/{(\d+)}/g,function(b,c){return"undefined"!=typeof a[c]?a[c]:b})},_.mixin({deepFind:function(a,b,c){var d,e,f,g=0;for(d=b&&b.split("."),e=d&&d.length;e>g&&a;){if(f=d[g],g++,g>=e&&null!=c)return void(a[f]=c);a=a[f]}return e>g&&(a=null),a}}),_.mixin({pushAll:function(a,b){a.push.apply(a,b)}}),_.mixin({emptyArray:function(a){a.length=0}}),_.mixin({nextPrevPageParser:function(a){var b={},c=a._resultmeta||a;return c.next&&(b.next=_.parseInt(/\w*page=(\d+)/i.exec(c.next)[1])),c.previous&&(b.prev=_.parseInt(/\w*page=(\d+)/i.exec(c.previous)[1])),b}}),_.mixin({cloneArray:function(a){return a.slice(0)}}),_.mixin({throttleStore:function(a,b,c){var d=[],e=_.throttle(function(){a(_.cloneArray(d)),_.emptyArray(d)},b,c);return function(a){_.pushAll(d,a),e()}}}),_.mixin({arrayRemoveItem:function(a,b){var c=a.indexOf(b);-1!=c&&a.splice(c,1)}}),_.mixin({getUrls:function(a){for(var b,c,d=/((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,e=[];c=a.match(d);)b=c[0],e.push(b),a=a.replace(b,"");return e}}),_.mixin({guid:function(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).substr(-4)}}),_.mixin({bytesToSize:function(a){var b=1e3,c=["Bytes","KB","MB","GB","TB"];if(0===a)return"0 Bytes";var d=parseInt(Math.floor(Math.log(a)/Math.log(b)),10);return(a/Math.pow(b,d)).toPrecision(3)+" "+c[d]}}),_.mixin({toArray:function(a){var b=[],a=a||{};return _.forEach(a,function(a){b.push(a)}),b}}),angular.module("swamp.filters").filter("trim",[function(){return function(a,b){return b=b||220,null!==a&&void 0!==a?a.length>=b?[a.substring(0,b),"..."].join(""):a:void 0}}]),angular.module("swamp.services").service("npmService",["$http","$q",function(a,b){function c(a,b){b=b.data;var c=b["dist-tags"].latest,d=b.versions[c];a.resolve(d)}function d(a,b){a.reject(b)}this.getLastVersionPackage=function(e){var f=b.defer();return a.jsonp("http://registry.npmjs.org/"+e+"/?jsonp=JSON_CALLBACK").then(c.bind(this,f)).catch(d.bind(this,f)),f.promise}}]),angular.module("swamp.directives").directive("swPerfectScrollbar",["$parse",function(a){return{restrict:"A",priority:100,link:function(b,c,d){function e(){g=setTimeout(function(){c.is(":visible")&&(h=!0,c.find(".ps-scrollbar-x-rail, .ps-scrollbar-y-rail").css({display:"block",opacity:"0.9"}),c.perfectScrollbar("update")),!h&&e()},f)}var f=500,g=null,h=!1;if(c.perfectScrollbar({wheelSpeed:a(d.wheelSpeed)()||50,wheelPropagation:a(d.wheelPropagation)()||!1,minScrollbarLength:a(d.minScrollbarLength)()||!1,suppressScrollX:a(d.suppressScrollX)()||!1,suppressScrollY:a(d.suppressScrollY)()||!1}),d.scrollPositionOutside){var i=parseInt(c.css("padding-right")),j=parseInt(c.css("margin-right"));c.css("padding-right",i+15+"px"),c.css("margin-right",j-15+"px")}d.scrollDisplayed&&e(),c.find(d.refreshOnChange).resize(function(){c.scrollTop(0).perfectScrollbar("update")}),b.updateScroll=function(){c.scrollTop(0).perfectScrollbar("update")},b.$on("$destroy",function(){c.perfectScrollbar("destroy"),c.remove(),c=null})}}}]),angular.module("swamp.directives").directive("swCheckbox",[function(){return{restrict:"E",scope:{checked:"=ngModel",label:"=checkboxLabel",onCheckStateChange:"&"},templateUrl:"directives/checkbox/checkbox.html",link:function(a){a.onCheckStateChange&&a.$watch(function(){return a.checked},function(b){a.onCheckStateChange({state:b})})}}}]),angular.module("swamp.directives").directive("swScrollState",["$rootScope",function(a){return{restrict:"A",scope:{onScroll:"&onPageScroll"},link:function(b,c,d){function e(){var c=window.scrollY>f;c!=g&&(b.onScroll&&b.onScroll({state:c}),g=c,a.$safeApply())}var f=d.scrollOffset?parseInt(d.scrollOffset):100,g=!1;$(window).on("scroll",e),b.$on("$destroy",function(){$(window).off("scroll",e),c.remove(),c=null})}}}]),angular.module("swamp.directives").directive("swFocusBool",["$timeout",function(a){return{restrict:"A",link:function(b,c,d){b.$watch(d.swFocusBool,function(b){b&&a(function(){c.focus()})})}}}]),angular.module("swamp.directives").directive("swFullScreen",["$timeout",function(a){return{restrict:"E",transclude:!0,replace:!0,template:"<div ng-transclude></div>",link:function(b,c,d){function e(){var a=$(window).outerWidth(!0),b=$(window).outerHeight(!0);f>b&&(b=f),c.css({width:a,height:b})}var f=isNaN(d.minHeight)?!1:d.minHeight;$(window).on("resize",e),a(e,10),b.$on("$destroy",function(){$(window).off("resize",e)})}}}]),angular.module("swamp.directives").directive("swStretch",["$timeout","$rootScope",function(a){return{restrict:"A",priority:-1,link:function(b,c){function d(){var a=c.parent().outerWidth(!0),b=c.parent().outerHeight(!0);a>b?(c.css({width:"100%",height:"auto"}),b>c.outerHeight(!0)&&c.css({width:"auto",height:"100%"})):(c.css({width:"auto",height:"100%"}),a>c.outerWidth(!0)&&c.css({width:"100%",height:"auto"}))}c.parent().css("overflow","hidden"),$(window).on("resize",d),a(d,10),b.$on("$destroy",function(){$(window).off("resize",d)})}}}]),angular.module("swamp.directives").directive("swTerminal",[function(){return{restrict:"E",transclude:!0,replace:!0,templateUrl:"directives/terminal/terminal.html"}}]),angular.module("swamp.controllers").controller("mainController",["$scope","$rootScope","$location","$anchorScroll","$state",function(a,b,c,d,e){a.pageScrolled=!1,a.onScroll=function(b){a.pageScrolled=b},a.scrollTop=function(){$(document.body).animate({scrollTop:0},200)},a.goToAnchor=function(a){c.hash(a),d()},a.stateTab=function(a){return a==e.current.name}}]),angular.module("swamp.controllers").controller("404Controller",["$scope",function(){}]),app.config(["$stateProvider",function(a){a.state("404",{url:"/404/",templateUrl:"pages/404/404.html",controller:"404Controller"})}]),angular.module("swamp.controllers").controller("homeController",["$scope","$location","$anchorScroll","npmService",function(a,b,c,d){function e(b){a.package=b}a.package=null,d.getLastVersionPackage("swamp").then(e),a.goToAnchor=function(a){b.hash(a),c()}}]),app.config(["$stateProvider",function(a){a.state("home",{url:"/",templateUrl:"pages/home/home.html",controller:"homeController"})}]),angular.module("swamp.controllers").controller("changelogController",["$scope","$location","$anchorScroll",function(a,b,c){a.goToAnchor=function(a){b.hash(a),c()}}]),app.config(["$stateProvider",function(a){a.state("changelog",{url:"/changelog/",templateUrl:"pages/changelog/changelog.html",controller:"changelogController"})}]),angular.module("swamp.controllers").controller("cliController",["$scope","$location","$anchorScroll",function(a,b,c){a.goToAnchor=function(a){b.hash(a),c()}}]),app.config(["$stateProvider",function(a){a.state("cli",{url:"/cli/",templateUrl:"pages/cli/cli.html",controller:"cliController"})}]),angular.module("swamp.controllers").controller("pluginsController",["$scope","$location","$anchorScroll",function(a,b,c){a.goToAnchor=function(a){b.hash(a),c()}}]),app.config(["$stateProvider",function(a){a.state("plugins",{url:"/plugins/",templateUrl:"pages/plugins/plugins.html",controller:"pluginsController"})}]),angular.module("swamp.controllers").controller("docsController",["$scope","$location","$anchorScroll",function(a,b,c){a.goToAnchor=function(a){b.hash(a),c()}}]),app.config(["$stateProvider",function(a){a.state("docs",{url:"/docs/",templateUrl:"pages/docs/docs.html",controller:"docsController"})}]),angular.module("swamp.controllers").controller("dashboardController",["$scope","$location","$anchorScroll",function(a,b,c){a.goToAnchor=function(a){b.hash(a),c()}}]),app.config(["$stateProvider",function(a){a.state("dashboard",{url:"/dashboard/",templateUrl:"pages/dashboard/dashboard.html",controller:"dashboardController"})}]);