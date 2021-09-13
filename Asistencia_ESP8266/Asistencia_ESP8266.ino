#include <SPI.h>
#include <MFRC522.h>

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#include <LiquidCrystal_I2C.h>

//NodeMCU mapping
static const uint8_t D3   = 0;
static const uint8_t D4   = 2;
static const uint8_t D8   = 15;

constexpr uint8_t RST_PIN = D3; //RST
constexpr uint8_t SS_PIN = D4; //SDA
constexpr uint8_t BZ_PIN = D8; //Buzzer
String tag;

MFRC522 mfrc522(SS_PIN, RST_PIN);

LiquidCrystal_I2C lcd(0x27, 16, 2);

const char* ssid = "";
const char* password = "";
const char* url = "http://school-database-project.glitch.me/punchIn";
String data;

void setup() {
  Serial.begin(9600);
  pinMode(BZ_PIN, OUTPUT);
  SPI.begin();
  lcd.begin(16,2);
  lcd.init();
  mfrc522.PCD_Init();
  mfrc522.PCD_DumpVersionToSerial();
  lcd.backlight();
  lcd.setCursor(1, 0);
  lcd.print("CONECTANDO A");
  lcd.setCursor(3, 1);
  lcd.print("INTERNET");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  lcd.clear();
  lcd.setCursor(3, 0);
  lcd.print("CONECTADO");
  delay(1000);
  lcd.clear();
  lcd.setCursor(4, 0);
  lcd.print("PASE SU");
  lcd.setCursor(4, 1);
  lcd.print("TARJETA");
  Serial.print("Looking for card...");
}

void loop() {
  if ( ! mfrc522.PICC_IsNewCardPresent())
    return;
  if ( mfrc522.PICC_ReadCardSerial()) {
    lcd.clear();
    lcd.setCursor(3, 0);
    lcd.print("ESPERE...");
    tag = String(getID());
    data = "{\"cardId\":\"" + tag + "\"}";
    Serial.println(data);
    sendInfo();
    mfrc522.PCD_StopCrypto1();
    lcd.clear();
    lcd.setCursor(5, 0);
    lcd.print("LISTO");
  }
  if(tag == "16909060"){
    tone(BZ_PIN, 587.33, 200);
    delay(250);
    tone(BZ_PIN, 587.33, 200);
    delay(250);
    tone(BZ_PIN, 1174.66, 200);
    delay(250);
    tone(BZ_PIN, 880.00, 200);
  }else{
    tone(BZ_PIN, 587.33, 200);
    delay(250);
    tone(BZ_PIN, 587.33*2, 200);
  }
  delay(500);
  lcd.clear();
  lcd.setCursor(4, 0);
  lcd.print("PASE SU");
  lcd.setCursor(4, 1);
  lcd.print("TARJETA");
}

void sendInfo() {
  WiFiClient client;
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.POST(data);
    String content = http.getString();
    http.end();
    Serial.println(content);
  }
}

long unsigned int getID() {
  long unsigned int hex_num;
  hex_num =  mfrc522.uid.uidByte[0] << 24;
  hex_num += mfrc522.uid.uidByte[1] << 16;
  hex_num += mfrc522.uid.uidByte[2] <<  8;
  hex_num += mfrc522.uid.uidByte[3];
  mfrc522.PICC_HaltA();
  return hex_num;
}
