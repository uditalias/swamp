$(function(){function a(){var a=g.val().trim(),c=h.val().trim();b(!a||!c)}function b(a){i.attr("disabled",a)}function c(){}function d(){window.postMessage("cancel","*")}function e(){f.text(location.origin),g.on("keyup",a),h.on("keyup",a),i.on("click",c),j.on("click",d),b(!0)}var f=$("#swamp_url"),g=$("#swamp_username"),h=$("#swamp_password"),i=$("#connect_btn"),j=$("#cancel_btn");e()});