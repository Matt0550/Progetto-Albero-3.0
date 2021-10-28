<?php
function led($pin, $status) {
    $url = "192.168.1.25/leds";
    $data = array('gpio'=>$pin,'status'=>$status);
    $data_json = json_encode($data);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_json)));
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
    $response  = curl_exec($ch);
    curl_close($ch);
    
}

if(isset($_GET['pin'])) {
    $pin = $_GET['pin'];

    if(isset($_GET['status'])) {
        $state = $_GET['status'];

        led($pin, $state);
    }
}
?>