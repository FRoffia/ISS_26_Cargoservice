%====================================================================================
% devices description   
%====================================================================================
mqttBroker("localhost", "1883", "distance").
event( sonardata, sonardata(D) ).
%====================================================================================
context(ctx_sensor, "localhost",  "TCP", "8030").
 qactor( sensorservice, ctx_sensor, "it.unibo.sensorservice.Sensorservice").
 static(sensorservice).
