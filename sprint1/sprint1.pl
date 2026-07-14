%====================================================================================
% sprint1 description   
%====================================================================================
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
%====================================================================================
context(ctx_cargoservice, "localhost",  "TCP", "8010").
context(ctx_robot, "127.0.0.1",  "TCP", "8020").
context(ctx_sensor, "127.0.0.2",  "TCP", "8030").
context(ctx_ioport, "127.0.0.3",  "TCP", "8040").
 qactor( cargoservice, ctx_cargoservice, "it.unibo.cargoservice.Cargoservice").
 static(cargoservice).
  qactor( cargorobot, ctx_robot, "it.unibo.cargorobot.Cargorobot").
 static(cargorobot).
  qactor( led, ctx_sensor, "it.unibo.led.Led").
 static(led).
  qactor( sensor, ctx_sensor, "it.unibo.sensor.Sensor").
 static(sensor).
  qactor( ioport, ctx_ioport, "it.unibo.ioport.Ioport").
 static(ioport).
