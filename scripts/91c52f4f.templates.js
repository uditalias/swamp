app.run(['$templateCache', function($templateCache){   'use strict';

  $templateCache.put('pages/404/404.html',
    "<i class=\"fa fa-ambulance\"></i> 404"
  );


  $templateCache.put('pages/changelog/changelog.html',
    "<div class=\"hero-runner flex flex-align-center\"><div class=\"container flex flex-align-center\"><img src=assets/images/swamp_logo.png class=\"margin-right-20 hidden-xs\"><h1 class=\"w700 text-64\">CHANGE LOG</h1></div></div><div class=\"container changelog-container margin-top-60 margin-bottom-100 text-22\"><div class=\"container flex flex-align-center flex-pack-center\" ng-if=isLoading><img src=assets/images/loader.gif></div><div ng-bind-html=CHANGELOG|md2html></div></div>"
  );


  $templateCache.put('pages/cli/cli.html',
    "<div class=\"hero-runner flex flex-align-center\"><div class=\"container flex flex-align-center\"><img src=assets/images/swamp_logo.png class=\"margin-right-20 hidden-xs\"><h1 class=\"w700 text-64\">CLI</h1></div></div>"
  );


  $templateCache.put('pages/dashboard/dashboard.html',
    "<div class=\"hero-runner flex flex-align-center\"><div class=\"container flex flex-align-center\"><img src=assets/images/swamp_logo.png class=\"margin-right-20 hidden-xs\"><h1 class=\"w700 text-64\">DASHBOARD</h1></div></div>"
  );


  $templateCache.put('pages/docs/docs.html',
    "<div class=\"hero-runner flex flex-align-center\"><div class=\"container flex flex-align-center\"><img src=assets/images/swamp_logo.png class=\"margin-right-20 hidden-xs\"><h1 class=\"w700 text-64\">DOCS</h1></div></div>"
  );


  $templateCache.put('pages/home/content/content.html',
    "<div class=\"container margin-bottom-100\"><div class=flex-md><div class=\"flex-1 margin-right-50 margin-top-60\"><h1 class=\"color-logo-brown text-26\">Why using a service runner?</h1><div class=text-16><div class=margin-bottom-10>When developing for the web with node.js, python, ruby etc. most of the time our application uses many services (e.g. web server, socket server, REST api...), everytime we are starting to develop we need to initialize each service separately, if we updates one service, we need to restart it, if we want to change the ENV, we need to restart it, if we want it to run forever and run again just after it’s crash, we need to do it manually, not mentioning the logging overview of our services.. a task which can be very frustrated.</div><div>Swamp to the rescue! with Swamp you can do all of the above and lots of more automatically and in a very convenient way! you can still use your favorite services like Grunt and Bower without any problem.</div></div></div><div class=\"flex-1 margin-top-60\"><h1 class=\"color-logo-brown text-26\">Why Swamp?</h1><div class=text-16><div class=margin-bottom-10>We built Swamp because we were frustrated with supervisor and others: ancient dashboard, having to manually reload the supervisor service when we had an ENV or code change and low visibility to logs and basic monitoring data, especially important when you are doing fast development cycles on a multi processes app.</div><div class=margin-bottom-10>Swamp is still an alpha project, but is already used in some production servers and is quickly moving to stable status.</div><div class=margin-bottom-10>Swamp is built with Appolo a modern Node.js app framework, the dashboard is build with Angular.js . Want to contribute? see the Contributing section further on.</div></div></div></div><div class=\"flex-md margin-top-40\"><div class=flex-1><h1 class=\"color-logo-brown text-32 w400\"><a name=getting-started>Getting Started</a></h1></div></div><div class=\"flex-md margin-top-20\"><div class=\"flex-1 margin-right-50\"><div class=\"text-20 w400 margin-bottom-10\">Install Swamp</div><div class=text-16>Swamp is a command-line tool, install it via NPM.</div></div><div class=flex-1><sw-terminal><pre class=\"padding-top-20 padding-bottom-20\">$ npm install -g swamp</pre></sw-terminal></div></div><div class=\"flex-md margin-top-30\"><div class=\"flex-1 margin-right-50\"><div class=\"text-20 w400 margin-bottom-10\">Creating your first Swamp</div><div class=\"text-16 margin-bottom-10\">Lets create your first swamp, first, create a new directory where your swamp will be located.</div><div class=text-16>Then use the <span class=code>create</span> command to create a <span class=code>Swampfile.js</span> skeleton.</div></div><div class=flex-1><sw-terminal><pre class=padding-top-20><code>$ mkdir ~/myswamp</code></pre><pre class=\"\">$ cd ~/myswamp</pre><pre class=padding-bottom-20>$ swamp create</pre></sw-terminal></div></div><div class=\"flex-md margin-top-30\"><div class=\"flex-1 margin-right-50\"><div class=\"text-20 w400 margin-bottom-10\">Done! Configure the <span class=code>Swampfile.js</span></div><div class=\"text-16 margin-bottom-10\">The <span class=code>Swampfile.js</span> created and now you can follow the <a ui-sref=docs>docs</a> to learn how to config your services.</div><div class=\"text-16 margin-bottom-10\">Also, you can use the <span class=code>$ swamp --help</span> to learn more about the <a ui-sref=cli>Swamp CLI</a> options.</div></div><div class=flex-1><sw-terminal><pre class=\"padding-top-20 padding-bottom-20\"><code class=html>$ swamp --help</code></pre></sw-terminal></div></div></div>"
  );


  $templateCache.put('pages/home/header/header.html',
    "<div class=\"flex home-header position-relative\"><div class=\"container flex flex-vbox padding-bottom-100\"><div class=\"home-title text-center flex-1 flex flex-vbox flex-pack-center flex-align-center\"><div class=margin-top-100><img src=assets/images/swamp_logo.png></div><h2 class=\"text-70 w700\">The Service Runner</h2><h3 class=\"margin-top-10 margin-bottom-70 text-22\">Swamp is a tool for running, managing and monitoring processes.</h3><div class=\"flex-md width-max\"><div class=flex-1></div><button class=\"btn btn-primary flex-md margin-bottom-20 margin-right-10 margin-left-10\"><span class=text-24><i class=\"fa fa-download margin-right-10\"></i>Download &beta;eta</span></button> <button class=\"btn btn flex-md margin-bottom-20 margin-right-10 margin-left-10\" ng-click=\"goToAnchor('getting-started')\"><span class=text-24>Get Started</span></button><div class=flex-1></div></div><div class=\"color-white text-14 opacity-50\" ng-show=package.version>&mdash; v{{package.version}} &mdash;</div></div></div><div class=\"home-header-footer padding-10\"><div class=\"container height-max flex flex-align-center flex-pack-center\"><div class=\"flex-1 hidden-sm hidden-xs\"><span class=margin-right-10><a href=https://www.npmjs.org/package/swamp target=_blank><img src=\"http://img.shields.io/npm/v/swamp.svg?style=flat\"></a></span> <span class=margin-right-10><a href=https://travis-ci.org/uditalias/swamp target=_blank><img src=\"http://img.shields.io/travis/uditalias/swamp.svg?style=flat\"></a></span> <span class=margin-right-10><a href=https://www.npmjs.org/package/swamp target=_blank><img src=\"http://img.shields.io/npm/dm/swamp.svg?style=flat\"></a></span> <span><a href=https://www.gittip.com/uditalias target=_blank><img src=\"http://img.shields.io/gittip/uditalias.svg?style=flat\"></a></span></div><div class=\"flex color-white text-20\"><iframe src=\"http://ghbtns.com/github-btn.html?user=uditalias&repo=swamp&type=fork&count=false\" allowtransparency=true frameborder=0 scrolling=0 width=63 height=20></iframe><iframe src=\"http://ghbtns.com/github-btn.html?user=uditalias&repo=swamp&type=watch&count=false\" allowtransparency=true frameborder=0 scrolling=0 width=50 height=20></iframe></div></div></div></div>"
  );


  $templateCache.put('pages/home/home.html',
    "<div ng-include=\"'pages/home/header/header.html'\"></div><div ng-include=\"'pages/home/content/content.html'\"></div>"
  );


  $templateCache.put('pages/plugins/plugins.html',
    "<div class=\"hero-runner flex flex-align-center\"><div class=\"container flex flex-align-center\"><img src=assets/images/swamp_logo.png class=margin-right-20><h1 class=\"w700 text-64\">PLUGINS</h1></div></div>"
  );


  $templateCache.put('directives/checkbox/checkbox.html',
    "<div class=\"sw-checkbox flex\" ng-click=\"checked = !checked\"><div class=margin-right-1><i class=\"fa fa-check-square-o\" ng-if=checked></i> <i class=\"fa fa-square-o\" ng-if=!checked></i></div><span ng-if=label ng-bind=label></span></div>"
  );


  $templateCache.put('directives/terminal/terminal.html',
    "<div class=sw-terminal><div class=\"sw-terminal-buttons padding-5\"><div class=margin-left-5><i class=\"fa fa-circle\"></i> <i class=\"fa fa-circle\"></i> <i class=\"fa fa-circle\"></i></div></div><div class=sw-terminal-content ng-transclude></div></div>"
  );


  $templateCache.put('components/footer/footer.html',
    "<footer></footer>"
  );


  $templateCache.put('components/header/header.html',
    "<header><div class=container><div class=\"flex flex-align-center\"><div class=\"logo-wrapper flex flex-align-center flex-1\"><div ui-sref=home class=cursor-pointer><h1>Swamp</h1></div></div><div class=header-menu><div class=\"header-menu-large hidden-sm hidden-xs\"><ul class=\"list-unstyled flex\"><li ui-sref=docs ng-class=\"{ 'active': stateTab('docs') }\"><a>Docs</a></li><li ui-sref=cli ng-class=\"{ 'active': stateTab('cli') }\"><a>CLI</a></li><li ui-sref=plugins ng-class=\"{ 'active': stateTab('plugins') }\"><a>Plugins</a></li><li ui-sref=dashboard ng-class=\"{ 'active': stateTab('dashboard') }\"><a>Dashboard</a></li><li ui-sref=changelog ng-class=\"{ 'active': stateTab('changelog') }\"><a>Change Log</a></li></ul></div><div class=\"header-menu-small hidden-lg hidden-md\"><i class=\"fa fa-bars text-28 color-white cursor-pointer\" sw-side-menu sw-side-menu-template-url=components/menu/menu.html></i></div></div></div></div></header>"
  );


  $templateCache.put('components/menu/menu.html',
    "<div class=\"padding-20 side-menu\"><ul class=list-unstyled><li ui-sref=home ng-class=\"{ 'active': stateTab('home') }\"><a><i class=\"fa fa-home\"></i> Home</a></li><li ui-sref=docs ng-class=\"{ 'active': stateTab('docs') }\"><a><i class=\"fa fa-file-text\"></i> Docs</a></li><li ui-sref=cli ng-class=\"{ 'active': stateTab('cli') }\"><a><i class=\"fa fa-terminal\"></i> CLI</a></li><li ui-sref=plugins ng-class=\"{ 'active': stateTab('plugins') }\"><a><i class=\"fa fa-gear\"></i> Plugins</a></li><li ui-sref=dashboard ng-class=\"{ 'active': stateTab('dashboard') }\"><a><i class=\"fa fa-dashboard\"></i> Dashboard</a></li><li ui-sref=changelog ng-class=\"{ 'active': stateTab('changelog') }\"><a><i class=\"fa fa-history\"></i> Change Log</a></li></ul></div>"
  );
} ]);