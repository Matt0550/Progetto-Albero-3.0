#include <stdio.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#define HTTP_REST_PORT 80
#define WIFI_RETRY_DELAY 500
#define MAX_WIFI_INIT_RETRY 50
HTTPClient http;
WiFiClient client;
struct Led {
    byte gpio;
    byte status;
} led_resource;

const char* wifi_ssid = "";
const char* wifi_passwd = "";

// Set your Static IP address
IPAddress local_IP(192, 168, 1, 25);
// Set your Gateway IP address
IPAddress gateway(192, 168, 1, 1);

IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8); // optional
IPAddress secondaryDNS(8, 8, 4, 4); // optional

int pinGPIO[] = {2, 13, 15};

ESP8266WebServer http_rest_server(HTTP_REST_PORT);

void init_led_resource()
{
    led_resource.gpio = 0;
    led_resource.status = LOW;
}

int init_wifi() {
    int retries = 0;

    Serial.println("Connecting to WiFi AP..........");

    WiFi.mode(WIFI_STA);
    WiFi.begin(wifi_ssid, wifi_passwd);
    if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
      Serial.println("STA Failed to configure");
    }
    // check the status of WiFi connection to be WL_CONNECTED
    while ((WiFi.status() != WL_CONNECTED) && (retries < MAX_WIFI_INIT_RETRY)) {
        retries++;
        delay(WIFI_RETRY_DELAY);
        Serial.print("#");
    }
    return WiFi.status(); // return the WiFi connection status
}

void get_leds() {
    http_rest_server.sendHeader("Access-Control-Allow-Origin", "*");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    JsonObject& pins = root.createNestedObject("pins");
    String json;

    int pinGPIOLEN = sizeof(pinGPIO)/sizeof(pinGPIO[0]);
    for(int i = 0; i < pinGPIOLEN; i++) {
      int state = digitalRead(pinGPIO[i]);

      JsonObject& pin = pins.createNestedObject(String(pinGPIO[i]));
      pin["pin"] = pinGPIO[i];
      pin["state"] = state;
      pin["connected"] = true;

      root.prettyPrintTo(Serial);
      json = "";
      root.prettyPrintTo(json);

    }
    http_rest_server.send(200, "application/json", json);      
}

void json_to_resource(JsonObject& jsonBody) {
    int gpio, status;

    gpio = jsonBody["gpio"];
    status = jsonBody["status"];

    Serial.println(gpio);
    Serial.println(status);

    led_resource.gpio = gpio;
    led_resource.status = status;
}

void post_put_leds() {
    http_rest_server.sendHeader("Access-Control-Allow-Origin", "*");
    StaticJsonBuffer<500> jsonBuffer;
    String post_body = http_rest_server.arg("plain");
    Serial.println(post_body);

    JsonObject& jsonBody = jsonBuffer.parseObject(http_rest_server.arg("plain"));

    Serial.print("HTTP Method: ");
    Serial.println(http_rest_server.method());
    
    if (!jsonBody.success()) {
        Serial.println("error in parsin json body");
        http_rest_server.send(400);
    }
    else {   
        if (http_rest_server.method() == HTTP_POST) {
          http_rest_server.send(405);   
        }
        else if (http_rest_server.method() == HTTP_PUT) {
          json_to_resource(jsonBody);
          http_rest_server.sendHeader("Location", "/leds/" + String(led_resource.gpio));
          http_rest_server.send(200);
          pinMode(led_resource.gpio, OUTPUT);
          digitalWrite(led_resource.gpio, led_resource.status);
           
        }
    }
}
void config_rest_server_routing() {
    http_rest_server.on("/", HTTP_GET, []() {
        http_rest_server.send(200, "text/html",
            "Welcome to the ESP8266 REST Web Server");
    });
    http_rest_server.on("/leds", HTTP_GET, get_leds);
    http_rest_server.on("/leds", HTTP_POST, post_put_leds);
    http_rest_server.on("/leds", HTTP_PUT, post_put_leds);
}

void setup(void) {
    Serial.begin(115200);

    init_led_resource();
    if (init_wifi() == WL_CONNECTED) {
        Serial.print("Connetted to ");
        Serial.print(wifi_ssid);
        Serial.print("--- IP: ");
        Serial.println(WiFi.localIP());
    }
    else {
        Serial.print("Error connecting to: ");
        Serial.println(wifi_ssid);
    }

    config_rest_server_routing();

    http_rest_server.begin();
    Serial.println("HTTP REST Server Started");
    Serial.println("Checking GPIO PIN");
    int pinGPIOLEN = sizeof(pinGPIO)/sizeof(pinGPIO[0]);
    for(int i = 0; i < pinGPIOLEN; i++) {
      int state = digitalRead(pinGPIO[i]);
      Serial.println((String)"Led "+pinGPIO[i]+": "+state);
    }
}

void loop(void) {
    http_rest_server.handleClient();
}
