int led_verifica[] = {39, 38};
int leds[] = {45, 40};

void setup() {

  pinMode(34, OUTPUT);
  pinMode(30, OUTPUT);

  int leds_len = sizeof(leds)/sizeof(leds[0]);
  for(int i = 0; i < leds_len; i++) {
    pinMode(leds[i], OUTPUT);
    pinMode(led_verifica[i], INPUT);
    digitalWrite(leds[i], HIGH);
  }
  Serial.begin(9600);
  Serial1.begin(9600);
}

String stato_led_prima = "collegato";

void loop() {
  if(Serial1.available()) {
      Serial.println(Serial1.read());
  }
  int stato_led = 0;
  int led_verifica_len = sizeof(led_verifica)/sizeof(led_verifica[0]);
  
  for(int i = 0; i < led_verifica_len; i++) {
    if (digitalRead(led_verifica[i])) { 
      stato_led = digitalRead(led_verifica[i]);
      Serial.println(stato_led);
      
      if (stato_led == 1 && stato_led_prima == "collegato") {
        Serial.println("Scollegato");
        Serial.println((String)"Led "+leds[i]+": "+stato_led);
        digitalWrite(34, HIGH);
        delay(300);
        Serial1.println((String)"Led_"+leds[i]+"_"+stato_led+"_"+stato_led_prima);
        stato_led_prima = "scollegato";
        
      } else if(stato_led == 1 && stato_led_prima == "scollegato") {
        Serial.println("Collegato");
        Serial.println((String)"Led "+leds[i]+": "+stato_led);
        digitalWrite(34, HIGH);
        delay(300);
        Serial1.println((String)"Led_"+leds[i]+"_"+stato_led+"_"+stato_led_prima);
        stato_led_prima = "collegato";

      }
      
    } else {
      digitalWrite(34, LOW);
      
    }
  }
}
