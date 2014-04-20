app.run(['$templateCache', function($templateCache){   'use strict';

  $templateCache.put('pages/404/404.html',
    ""
  );


  $templateCache.put('pages/root/rootView.html',
    "<div class=root-container><div class=title>Services</div><div class=\"table-header flex\"><div class=flex-1>Name</div><div class=\"flex-1 hidden-md\">PID</div><div class=flex-1>CPU Usage</div><div class=flex-1>Memory Usage</div><div class=flex-1>Status</div><div class=flex-1>Started</div><div class=flex-1>Actions</div></div><div ng-repeat=\"(id,service) in services\"><ng-include src=\"'components/service_row_summary/serviceRowSummary.html'\"></div></div>"
  );


  $templateCache.put('components/footer/footer.html',
    ""
  );


  $templateCache.put('components/header/header.html',
    "<div class=\"header-inner flex\"><div class=flex-1><h1>Swamp <span>Dashboard</span></h1></div><div class=\"flex flex-pack-center\"><button class=\"btn btn-green margin-right-2\" ng-click=startAll()><i class=\"fa fa-play\"></i> Start all</button> <button class=\"btn btn-yellow margin-right-2\" ng-click=restartAll()><i class=\"fa fa-refresh\"></i> Restart all running</button> <button class=\"btn btn-red\" ng-click=stopAll()><i class=\"fa fa-stop\"></i> Stop all running</button></div></div>"
  );


  $templateCache.put('components/service_row_summary/serviceRowSummary.html',
    "<div class=service-summary><div class=\"service-summary-row flex flex-align-center\" ng-class=\"{ 'running': service.state == SERVICE_STATE.RUN, 'stopped': service.state == SERVICE_STATE.STOP, 'restarted': service.state == SERVICE_STATE.RESTART, 'toggle': toggleService }\"><div class=flex-1 ng-click=\"toggleService = !toggleService\">{{service.name}}</div><div class=\"flex-1 hidden-md\" ng-click=\"toggleService = !toggleService\">{{service.pid || '-'}}</div><div class=flex-1 ng-click=\"toggleService = !toggleService\">{{service.monitor.cpu|number:2}}%</div><div class=flex-1 ng-click=\"toggleService = !toggleService\">{{service.monitor.memory|number}}b ({{bytesToSize(service.monitor.memory)}})</div><div class=flex-1 ng-click=\"toggleService = !toggleService\"><span ng-if=\"service.state == SERVICE_STATE.RUN\">Running</span> <span ng-if=\"service.state == SERVICE_STATE.RESTART\">Restarting...</span> <span ng-if=\"service.state == SERVICE_STATE.STOP\">Stopped</span></div><div class=flex-1 ng-click=\"toggleService = !toggleService\">{{service.uptime || '-'}}</div><div class=\"flex-1 flex\"><button class=\"btn btn-green flex-1 margin-right-1\" ng-disabled=\"service.state == SERVICE_STATE.RUN || service.state == SERVICE_STATE.RESTART\" ng-click=serviceActions.start(service)><i class=\"fa fa-play\"></i></button> <button class=\"btn btn-red flex-1 margin-right-1\" ng-disabled=\"service.state == SERVICE_STATE.STOP || service.state == SERVICE_STATE.RESTART\" ng-click=serviceActions.stop(service)><i class=\"fa fa-stop\"></i></button> <button class=\"btn btn-yellow flex-1\" ng-disabled=\"service.state == SERVICE_STATE.STOP\" ng-click=serviceActions.restart(service)><i class=\"fa fa-refresh\"></i></button></div></div><div class=\"service-info padding-2\" ng-if=toggleService><div class=\"header flex flex-align-center\"><div class=flex-1><div class=\"service-name text-24\">{{service.name}}</div><div class=\"service-description text-16\" ng-if=service.description>{{service.description}}</div></div><div><button class=\"btn btn-blue margin-right-1\"><i class=\"fa fa-list-alt\"></i></button> <button class=\"btn btn-red\"><i class=\"fa fa-list-alt\"></i></button></div></div></div></div>"
  );
} ]);