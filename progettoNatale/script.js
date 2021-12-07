var localApi = "./api/";
var publicApi = "192.168.1.25";

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
            if(state == 1) {
                console.log("Turn ON led " + led);
            } else {
                console.log("Turn OFF led " + led);
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
    var state = false;
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
        $("#ultimo_led_acceso").text(id);

        if(state == false) {
            state = true;
            element.style.opacity='0.5';
            power_ball(id, state);

        } else {
            state = false;
            element.style.opacity='1';
            power_ball(id, state);               
        }
    });



    $('.ball').tooltip({
        title: "Led " + id,
        html: true,
        'container': 'body',
        'placement': 'bottom'
    });
    
}

$.getJSON("./api/?option=status&url="+ publicApi +"/leds", function(data) {
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

function disco() {
    power_ball(99, 1)
}

function loader_text(text, loading_number, loading_number_max, time_max) {
    $("#text-loader").fadeOut("fast", function() {
        $(this).text(text + " (" + loading_number + "/"+ loading_number_max + ")");
        $("#time-loader").text("Tempo stimato: "+time_max).fadeIn("fast");

    }).fadeIn();
}
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

$(document).ready(function() {
    $(".overlay").fadeIn("fast");
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
    
    var time = 500;
    var i = 1;
    var x = 0;

    $.getJSON("leds.json", function(result){
        $.each(result, function(index, val){
            x++;
            var second_time = time;
            setTimeout(function() {
                create_ball(val.id, val.X, val.Y);
                var svg = document.getElementsByTagName("svg")[0];
                var element = svg.getElementById(val.id.toString());
                power_ball(val.id, 1);
                loader_text("Accensione led " + val.id, i++, x, millisToMinutesAndSeconds(time));
                if(i==x+1) {
                    $(".overlay").fadeOut("slow");
                }
            }, time);
            time += 1200;
        });
    });

});
