$(function(){function a(){var a=k.val().trim(),c=l.val().trim();b(!a||!c)}function b(a){m.attr("disabled",a)}function c(){o.hide(),p.hide(),q.show();var a=k.val().trim(),b=l.val().trim();$.post("/api/auth/connect/",{username:a,password:b}).success(f).error(g)}function d(){e("swamp_connect_close",{connectionId:u})}function e(a,b){v&&v.postMessage({event:a,payload:b},"*")}function f(a){e("authenticated",{connectionId:u,session:a})}function g(){o.hide(),p.hide(),q.hide(),r.show()}function h(){k.val(""),l.val(""),o.show(),p.show(),q.hide(),r.hide(),b(!0),k.focus()}function i(){j.text(location.origin),k.on("keyup",a),l.on("keyup",a),m.on("click",c),n.on("click",d),t.on("click",d),s.on("click",h),b(!0),window.addEventListener("message",function(a){v=a.source,"connect"==a.data.event&&(u=a.data.payload.connectionId,e("connected",{connectionId:u}))}),h()}var j=$("#swamp_url"),k=$("#swamp_username"),l=$("#swamp_password"),m=$("#connect_btn"),n=$("#cancel_btn"),o=$("#connect_form"),p=$("#connect_actions"),q=$("#connecting"),r=$("#error"),s=$("#try_again"),t=$("#cancel"),u=null,v=null;i()});