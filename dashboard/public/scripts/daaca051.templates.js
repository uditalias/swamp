app.run(['$templateCache', function($templateCache){   'use strict';

  $templateCache.put('pages/404/404.html',
    ""
  );


  $templateCache.put('pages/root/rootView.html',
    "<div class=root-container><div ng-repeat=\"(id,service) in services\"><ng-include src=\"'components/service_row_summary/serviceRowSummary.html'\"></div><ul><li ng-repeat=\"err in errorLogs\">{{err.time.format('DD/MM/YYYY HH:mm')}} - {{err.text}}</li></ul>--<ul><li ng-repeat=\"out in outLogs\">{{out.time.format('DD/MM/YYYY HH:mm')}} - {{out.text}}</li></ul></div>"
  );


  $templateCache.put('components/footer/footer.html',
    ""
  );


  $templateCache.put('components/header/header.html',
    "<div class=\"header-inner flex\"><div class=flex-1><h1>Swamp <span>Dashboard</span></h1></div><div class=\"\"><button class=\"btn btn-green margin-right-2\" ng-click=startAll()><i class=\"fa fa-play\"></i> Start all</button> <button class=\"btn btn-yellow margin-right-2\" ng-click=restartAll()><i class=\"fa fa-refresh\"></i> Restart all running</button> <button class=\"btn btn-red\" ng-click=stopAll()><i class=\"fa fa-stop\"></i> Stop all running</button></div></div>"
  );


  $templateCache.put('components/service_row_summary/serviceRowSummary.html',
    "<div>[{{service.pid}}] {{service.name}} cpu: {{service.monitor.cpu|number:4}}% memory: {{service.monitor.memory}} ({{bytesToSize(service.monitor.memory)}}) state: {{service.state}} isRunning: {{service.isRunning}} <button class=\"btn btn-red\" ng-click=serviceActions.stop(service)><i class=\"fa fa-stop\"></i> Stop</button> <button class=\"btn btn-green\" ng-click=serviceActions.start(service)><i class=\"fa fa-play\"></i> Start</button> <button class=\"btn btn-yellow\" ng-click=serviceActions.restart(service)><i class=\"fa fa-refresh\"></i> Restart</button> started: {{service.uptime}}<div><ul><li ng-repeat=\"out_log in service.errorLogData.getAll()\"><pre>{{out_log.text}}</pre></li></ul></div></div>"
  );
} ]);