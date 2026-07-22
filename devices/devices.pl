%====================================================================================
% devices description   
%====================================================================================
mqttBroker("localhost", "1883", "distance").
event( sonardata, sonardata(D) ).
dispatch( container_in, container_in(X) ).
dispatch( sensorError, sensorError(X) ).
dispatch( sensorOK, sensorOK(X) ).
request( is_cargo_present, is_cargo_present(X) ).
reply( cargo_present, cargo_present(X) ).  %%for is_cargo_present
reply( cargo_absent, cargo_absent(X) ).  %%for is_cargo_present
%====================================================================================
context(ctx_sensor, "localhost",  "TCP", "8030").
context(ctx_cargoservice, "127.0.0.1",  "TCP", "8010").
 qactor( cargoservice, ctx_cargoservice, "external").
  qactor( sensorservice, ctx_sensor, "it.unibo.sensorservice.Sensorservice").
 static(sensorservice).
