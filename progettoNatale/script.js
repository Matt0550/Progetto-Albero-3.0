var localApi = "./api/";
var publicApi = "10.3.1.25";


$(function () {
    $('[data-toggle="tooltip"]').tooltip();
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

function power_ball(led, state) {
    $.ajax({
        type: "PUT",
        url: localApi+'?option=led&pin='+led+'&state='+state,
        success: function() {
            if(led == 99 && state == 1) {
                console.log("Accensione di tutti i led");
            } else if(led == 99 && state == 0) {
                console.log("Spegnimento di tutti i led");
            } else {
                if(state == 1) {
                    console.log("Turn ON led " + led);
                } else {
                    console.log("Turn OFF led " + led);
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            $("#api_status").text("Offline");
            $("#api_status").removeClass("ping-success");
            $("#api_status").addClass("ping-error");
            toast("Notifica di sistema", "L'API server non risponde. Verifica connessione di rete e alimentazione", "bg-danger");
        }
    });
}

function create_ball(id, X, Y) {
    var svg = document.getElementsByTagName("svg")[0];
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var element = svg.getElementById(id.toString());
    path.setAttribute("d", "M 103.32283 380.76376 A 16.263779 17.220472 0 1 1  70.795273,380.76376 A 16.263779 17.220472 0 1 1  103.32283 380.76376 z");
    path.setAttribute("style", "fill:url(#radialGradient14);fill-opacity:1.0000000;fill-rule:evenodd;stroke:#000000;stroke-width:1.0000000pt;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1.0000000;");
    path.setAttribute("transform", "translate("+X+","+Y+")");
    path.setAttribute("class", "ball");
    path.setAttribute("id", id.toString());

    var pathElement = svg.appendChild(path);

    $("#"+id.toString()).click(function(){
        var element = svg.getElementById(id.toString());
        var opacity = element.style.opacity;
        $("#ultimo_led_acceso").text(id);

        if(opacity == "1") {
            element.style.opacity='0.5';
            power_ball(id, 0);

        } else {
            element.style.opacity='1';
            power_ball(id, 1);               
        }
    });

    $('.ball').tooltip({
        title: "Led " + id,
        html: true,
        'container': 'body',
        'placement': 'bottom'
    });
    
}


function AllLedOnOff(state) {
    power_ball(99, state);
    $.getJSON("leds.json", function(result){
        $.each(result, function(index, val){
            var svg = document.getElementsByTagName("svg")[0];
            if(state === 1) {
                var element = svg.getElementById(val.id.toString());
                element.style.opacity='1';
            } else if(state === 0) {
                var element = svg.getElementById(val.id.toString());
                element.style.opacity='0.5';
            }
        });
    });
}

function loader_text(text) {
    $("#text-loader").fadeOut("fast", function() {
        $(this).text(text);
    }).fadeIn();
}

$("#path2806").click(function() {
    var svg = document.getElementsByTagName("svg")[0];
    var element = svg.getElementById("path2806");
    var opacity = element.style.opacity;

    console.log("Id: cometa click!");

    if(opacity == "1") {
        element.style.opacity='0.5';

    } else {
        element.style.opacity='1';             
    }
});

$.getJSON("./api/?option=status&url="+ publicApi +"/leds", function(data) {
    if (data.online === true) {
        $("#api_status").text("Online");
        $("#api_status").removeClass("ping-error");
        $("#api_status").addClass("ping-success");

        $.getJSON("leds.json", function(result){
            $.each(result, function(index, val){
                create_ball(val.id, val.X, val.Y);
                var svg = document.getElementsByTagName("svg")[0];
                var element = svg.getElementById(val.id.toString());
            });
        });
        AllLedOnOff(1);

    } else {
        $("#api_status").text("Offline");
        $("#api_status").removeClass("ping-success");
        $("#api_status").addClass("ping-error");
        toast("Notifica di sistema", "L'API server non risponde. Verifica connessione di rete e alimentazione", "bg-danger");

    }
    console.log(data);
}).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });


$(document).ready(function() {
    loader_text("Caricamento UI");
    $(".overlay").fadeOut("fast").remove();
});
