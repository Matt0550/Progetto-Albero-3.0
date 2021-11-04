$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

function toast(title, info, color) {
    var statusToast = document.getElementById('statusToast')
    var toast = new bootstrap.Toast(document.getElementById('statusToast'));
    $("#statusToastTitle").text(" "+title);
    $("#statusToastInfo").text(info);

    $(statusToast).removeClass("bg-primary");
    $("#statusToastHeader").removeClass("bg-primary");

    $(statusToast).addClass(color);
    $("#statusToastHeader").addClass(color);


    toast.show();

}

function create_ball(id, X, Y) {
    var svg = document.getElementsByTagName("svg")[0];
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var element = svg.getElementById(id.toString());
    path.setAttribute("d", "M 103.32283 380.76376 A 16.263779 17.220472 0 1 1  70.795273,380.76376 A 16.263779 17.220472 0 1 1  103.32283 380.76376 z");
    path.setAttribute("style", "fill:url(#radialGradient14);fill-opacity:1.0000000;fill-rule:evenodd;stroke:#000000;stroke-width:1.0000000pt;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1.0000000;display:none");
    path.setAttribute("transform", "translate("+X+","+Y+")");
    path.setAttribute("class", "ball");
    path.setAttribute("id", id.toString());

    var pathElement = svg.appendChild(path);
    var state = false;

    $.getJSON("http://192.168.1.25/leds", function(result) {
        if(result.pins[id].state == 1) {
            state = false;

        } else {
            state = true;
        }
    });

    $("#"+id.toString()).click(function(){
        var element = svg.getElementById(id.toString());
        $("#ultimo_led_acceso").text(id);

        if(state == false) {
            state = true;
            element.style.opacity='0.5';
            $.ajax({
                type: "PUT",
                url: './api/?option=led&pin='+id+'&state=0',
                success: function() {
                    console.log("Turn OFF led " + id);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    $("#api_status").text("Offline");
                    $("#api_status").removeClass("ping-success");
                    $("#api_status").addClass("ping-error");
                    toast("Notifica di sistema", "L'API server non risponde. Verifica connessione di rete e alimentazione", "bg-danger");
                }
            });

        } else {
            state = false;
            element.style.opacity='1';
            $.ajax({
                type: "PUT",
                url: './api/?option=led&pin='+id+'&state=1',
                success: function() {
                    console.log("Turn ON led " + id);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    $("#api_status").text("Offline");
                    $("#api_status").removeClass("ping-success");
                    $("#api_status").addClass("ping-error");
                    toast("Notifica di sistema", "L'API server non risponde. Verifica connessione di rete e alimentazione", "bg-danger");
                }
            });                    
        }
    });

    $.getJSON("http://192.168.1.25/leds", function(result) {
        $.each(result.pins, function(index, val) {
            var svg = document.getElementsByTagName("svg")[0];
            var element = svg.getElementById(val.pin.toString());
            if (val.state == 1) {
                element.style.opacity='1';
            } else {
                element.style.opacity='0.5';
            }
        });
    });

    $('.ball').tooltip({
        title: "Led " + id,
        html: true,
        'container': 'body',
        'placement': 'bottom'
    });
    
}

function delete_ball(id) {
    $(id).remove();
}

function edit_ball(id, visible) {
    $.getJSON("leds.json", function(result){
        result[id].visible = visible;
        var svg = document.getElementsByTagName("svg")[0];
        var element = svg.getElementById(id.toString());
        if (result[id].visible === false) {
            element.style.display="none";
            console.log("Hide ball " + id);

        } else {
            element.style.display="block";
            console.log("Show ball " + id);
        }


    }).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });
    
}




$.getJSON("./api/?option=status&url=192.168.1.25/leds", function(data) {
    if (data.online === true) {
        $("#api_status").text("Online");
        $("#api_status").removeClass("ping-error");
        $("#api_status").addClass("ping-success");
    } else {
        $("#api_status").text("Offline");
        $("#api_status").removeClass("ping-success");
        $("#api_status").addClass("ping-error");
        toast("Notifica di sistema", "L'API server non risponde. Verifica connessione di rete e alimentazione", "bg-danger");

    }
    console.log(data);
}).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });


$(document).ready(function() {
    var state = false;

    $("#path2806").click(function() {
        var svg = document.getElementsByTagName("svg")[0];
        var element = svg.getElementById("path2806");

        console.log("Id: cometa click! State: " + state);

        if(state == false) {
            state = true;
            element.style.opacity='0.5';

        } else {
            state = false;
            element.style.opacity='1';             
        }
    });
    
    $.ajax({
        url: "http://192.168.1.25/leds",
        dataType: 'json',
        success: function(result) {
            $.each(result.pins, function(index, val) {
                $.getJSON("leds.json", function(result){
                    $.each(result, function(index1, val1){
                        if(val.pin == val1.id) {
                            create_ball(val1.id, val1.X, val1.Y);
                            var svg = document.getElementsByTagName("svg")[0];
                            var element = svg.getElementById(val.pin.toString());

                            if(val.connected == true) {
                                edit_ball(val1.id, true);
                                if (val.state == 1) {
                                    element.style.opacity='1';
                                    
                                } else {
                                    element.style.opacity='0.5';
                                }
                            } else {
                                edit_ball(val1.id, false);
                            }


            
                        }
                    });
                }).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });
    
            });
        },
        error: function(xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        },
        timeout: 3000 //3 second timeout
    });

});


function refresh_ball() {
    $.getJSON("http://192.168.1.25/leds", function(result) {
        $.each(result.pins, function(index, val) {
            $.getJSON("leds.json", function(result){
                $.each(result, function(index1, val1){
                    if(val.pin == val1.id) {
                        create_ball(val1.id, val1.X, val1.Y);

                        if(val.connected == true) {
                            edit_ball(val1.id, true);
                        } else {
                            edit_ball(val1.id, false);
                        }
                        var svg = document.getElementsByTagName("svg")[0];
                        var element = svg.getElementById(val.pin.toString());
                        if (val.state == 1) {
                            element.style.opacity='1';
                        } else {
                            element.style.opacity='0.5';
                        }
        
                    }
                });
            }).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });

        });
    }).fail(function (jqXHR, textStatus, errorThrown) {console.log("fail " + errorThrown);});
}