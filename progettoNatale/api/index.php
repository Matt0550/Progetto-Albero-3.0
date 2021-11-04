<?php
header("Content-type: application/json; charset=utf-8");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT');

function led($pin, $status) {
    $url = "192.168.1.25/leds";
    $data = array('gpio'=>$pin,'status'=>$status);
    $data_json = json_encode($data);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_json)));
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
    $response  = curl_exec($ch);

    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if($httpcode == 200) {
        return true;
    } else {
        return false;
    }
    
}

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    
    if(isset($_GET['option'])) {
        $option = $_GET['option'];
    
        if ($option == "status") {
            if(isset($_GET['url'])) {
        
                $url = $_GET['url'];
            
                $options = array(
                    CURLOPT_RETURNTRANSFER => true,   // return web page
                    CURLOPT_HEADER         => false,  // don't return headers
                    CURLOPT_CONNECTTIMEOUT => 2,    // time-out on connect
                    CURLOPT_TIMEOUT        => 2,    // time-out on response
                ); 
            
                $ch = curl_init($url);
                curl_setopt_array($ch, $options);
    
                $content  = curl_exec($ch);
    
                curl_close($ch);
                if($content == true) {
                    http_response_code(200);
                    $data = ['online' => true, 'status' => "success", 'code' => 200];   
                } else {
                    http_response_code(200);
                    $data = ['offline' => false, 'status' => "timeout", 'code' => 200];   
                }
            }

        } else if ($option == "led") {
            $url = "192.168.1.25/leds";
            
            $options = array(
                CURLOPT_RETURNTRANSFER => true,   // return web page
                CURLOPT_HEADER         => false,  // don't return headers
                CURLOPT_CONNECTTIMEOUT => 2,    // time-out on connect
                CURLOPT_TIMEOUT        => 2,    // time-out on response
            ); 
        
            $ch = curl_init($url);
            curl_setopt_array($ch, $options);

            $content  = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            curl_close($ch);
            if($httpcode == 200) {
                http_response_code(200);
                $data = ['message' => json_decode($content, true), 'status' => "success", 'code' => 200];   
            } else {
                http_response_code(503);
                $data = ['status' => "error", 'message' => 'Falied to connect to server', 'code' => 503];    
            }
        

        } else {
            http_response_code(404);
            $data = ['status' => "error", 'message' => 'Option not valid or not found', 'code' => 404];
        }
    } else {
        http_response_code(404);
        $data = ['status' => "error", 'message' => 'Option not valid or not found', 'code' => 404];
    }

} else if ($_SERVER['REQUEST_METHOD'] == "PUT") {

    if(isset($_GET['option'])) {
        $option = $_GET['option'];
    
        if ($option == "led") {
            if(isset($_GET['pin'])) {
                $pin = $_GET['pin'];
            
                if(isset($_GET['state'])) {
                    $state = $_GET['state'];

                    if(led($pin, $state)) {
                        http_response_code(200);
                        $data = ['status' => "success", 'code' => 200];  
                    } else {
                        http_response_code(503);
                        $data = ['status' => "error", 'message' => 'Falied to connect to server', 'code' => 503];    
                    }
                    
                } else {
                    http_response_code(404);
                    $data = ['status' => "error", 'message' => 'Status not valid or not found', 'code' => 404];
                }

            } else {
                http_response_code(404);
                $data = ['status' => "error", 'message' => 'PIN not valid or not found', 'code' => 404];
            }

        } else {
            http_response_code(404);
            $data = ['status' => "error", 'message' => 'Option not valid or not found', 'code' => 404];
        }
    } else {
        http_response_code(404);
        $data = ['status' => "error", 'message' => 'Option not valid or not found', 'code' => 404];
    }

} else {    
    http_response_code(405);
    header('Allow: GET'); 
    $data = ['status' => "error", 'message' => "HTTP/1.1 405 Method Not Allowed", 'code' => 405];
}

echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
?>