function create_ball(id, X, Y) {
    var svg = document.getElementsByTagName("svg")[0];
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute("d", "M 103.32283 380.76376 A 16.263779 17.220472 0 1 1  70.795273,380.76376 A 16.263779 17.220472 0 1 1  103.32283 380.76376 z");
    path.setAttribute("style", "fill:url(#radialGradient14);fill-opacity:1.0000000;fill-rule:evenodd;stroke:#000000;stroke-width:1.0000000pt;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1.0000000");
    path.setAttribute("transform", "translate("+X+","+Y+")");
    path.setAttribute("id", id.toString());

    var pathElement = svg.appendChild(path);
    var state = false;

    $("#"+id.toString()).click(function(){
        var element = svg.getElementById(id.toString());
        console.log("Id: " + id + " click!");
        if(state == false) {
            state = true;
            element.style.opacity='0.5';
            $.ajax({
                url: 'process.php?pin='+id+'&status=0',
            });
                

        } else {
            state = false;
            element.style.opacity='1';
            $.ajax({
                url: 'process.php?pin='+id+'&status=1',
            });                    
        }
    });
}

$("#path2806").click(function() {
    var state = false;
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

function refresh_ball() {
    $.getJSON("leds.json", function(result){
        $.each(result, function(index, val){
            console.log(index, val);
            console.log("Id: "+ val.id + " X: "+ val.X + " Y: " + val.Y+ " Visible: "+ val.visible);
            create_ball(val.id, val.X, val.Y);
            
        });
    }).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });
}

function edit_ball(id, visible) {
    $.getJSON("leds.json", function(result){
        result[id].visible = visible;
        if (result[id].visible === false) {
            var svg = document.getElementsByTagName("svg")[0];
            var element = svg.getElementById(id.toString());
            element.style.display="none";
            console.log("Hide ball " + id);

        } else {
            var svg = document.getElementsByTagName("svg")[0];
            var element = svg.getElementById(id.toString());
            element.style.display="block";
            console.log("Hide ball " + id);
        }


    }).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });
    
}


$.getJSON("leds.json", function(result){
    $.each(result, function(index, val){
        console.log(index, val);
        console.log("Id: "+ val.id + " X: "+ val.X + " Y: " + val.Y+ " Visible: "+ val.visible);
        create_ball(val.id, val.X, val.Y);
        
    });
}).fail(function (jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });
