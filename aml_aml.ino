int leds[] = {45, 41};
String test = "";

void setup() {
  int leds_len = sizeof(leds)/sizeof(leds[0]);
  for(int i = 0; i < leds_len; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], HIGH);
  }
  Serial.begin(9600);
  Serial1.begin(115200);
}

void loop() {
  while(Serial1.available()){
    test = test + char(Serial1.read());
    Serial.println(test);
  }
  test = "";
}
