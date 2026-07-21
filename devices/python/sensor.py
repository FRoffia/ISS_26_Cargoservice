import paho.mqtt.client as mqtt
import time
import keyboard

MQTT_BROKER = "127.0.0.1"
MQTT_PORT   = 1883
TOPIC       = "distance"

client = mqtt.Client(client_id="sensor")
client.connect(MQTT_BROKER, MQTT_PORT, 30)

d_int = 70

while True:
    value = f"sonardata({d_int})"
    msg   = f"msg(sonardata,event,sensor,none,{value},0)"

    #print("Invio:", msg)
    client.publish(TOPIC, msg)
    time.sleep(1)

    #DFREE = 100, DFREE/2 = 50
    if keyboard.is_pressed('q'):
        d_int = 20  # 0<D<DFREE/2
        print("q")
    if keyboard.is_pressed('w'):
        d_int = 70  # DFREE/2 < D < DFREE
        print("w")
    if keyboard.is_pressed('e'):
        d_int = 110 # D > DFREE
        print("e")

