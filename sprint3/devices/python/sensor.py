import paho.mqtt.client as mqtt
import threading
import time
from gpiozero import DistanceSensor, Button, LED

sensor = DistanceSensor(echo=24, trigger=23, max_distance=4)
button = Button(17)
led = LED(27)

MQTT_BROKER = "192.168.178.81"
MQTT_PORT   = 1883

clientSensor = mqtt.Client(client_id="sensor")
clientPush   = mqtt.Client(client_id="pushbutton")
clientLed    = mqtt.Client(client_id="led")

blink_active = False
blink_thread = None

valuePush = "push(0)"
msg_pushbutton = f"msg(push,event,pushbutton,none,{valuePush},0)"

def blink_loop():
    while blink_active:
        led.toggle()
        time.sleep(0.3)
    led.off()

def on_button_pressed():
    print("sent load_request (callback)")
    clientPush.publish("push", msg_pushbutton)

def parse_qak_message(payload):
    try:
        start = payload.index("(")
        end   = payload.rindex(")")
        inner = payload[start+1:end]
        parts = inner.split(",")
        return parts[4]
    except Exception as e:
        print("Errore parsing:", e)
        return None

def on_message(client, userdata, msg):
    global blink_active, blink_thread

    raw = msg.payload.decode()
    print("RX RAW:", raw)

    content = parse_qak_message(raw)
    print("QAK content:", content)

    if content is None:
        return

    if content.startswith("led_off_hw"):
        print("LED OFF")
        blink_active = False
        led.off()

    elif content.startswith("led_blink_hw"):
        print("LED BLINK infinito")
        if not blink_active:
            blink_active = True
            blink_thread = threading.Thread(target=blink_loop, daemon=True)
            blink_thread.start()

# ordine corretto: prima definisco tutte le funzioni, POI le collego
clientSensor.connect(MQTT_BROKER, MQTT_PORT, 30)
clientPush.connect(MQTT_BROKER, MQTT_PORT, 30)
clientLed.connect(MQTT_BROKER, MQTT_PORT, 30)

clientLed.on_message = on_message
clientLed.subscribe("led")
clientLed.loop_start()

button.when_pressed = on_button_pressed

try:
    while True:
        dist_cm = int(sensor.distance * 100)
        value = f"sonardata({dist_cm})"
        msg_sensor = f"msg(sonardata,event,sensor,none,{value},0)"
        clientSensor.publish("distance", msg_sensor)
        time.sleep(1)
except KeyboardInterrupt:
    print("\nInterrotto")
    blink_active = False
    led.off()