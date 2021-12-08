int leds[] = {31, 32, 35, 36, 39, 40, 43, 44, 47, 48, 51, 52};
int pin, stato;
String filtro_pin, filtro_stato, segnale;
int leds_len = sizeof(leds)/sizeof(leds[0]);

void setup() {
  for(int i = 0; i < leds_len; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], HIGH);
  }
  Serial.begin(9600);
  Serial1.begin(9600);
}

void loop() {
  if(Serial1.available()){
    segnale = Serial1.readString();
    Serial.println(segnale);
    filtro_pin = segnale[0];
    if(isdigit(segnale[1])){
      filtro_pin += segnale[1];
      filtro_stato = segnale[3];
      stato = filtro_stato.toInt();
    } else{
      filtro_stato = segnale[2];
      stato = filtro_stato.toInt();
    }
    pin = filtro_pin.toInt();

    if(pin == 99 && stato == 1) {
      for(int i = 0; i < leds_len; i++) {
        digitalWrite(leds[i], HIGH);
      }
    } else if(pin == 99 && stato == 0) {
      for(int i = 0; i < leds_len; i++) {
        digitalWrite(leds[i], LOW);
      }
    } else {
        digitalWrite(pin, stato);
    }
  }
}