%====================================================================================
% sprint1 description   
%====================================================================================
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
request( reserve_slot, reserve_slot(X) ).
reply( reserve_ok, reserve_ok(N) ).  %%for reserve_slot
reply( reserve_fail, reserve_fail(CAUSE) ).  %%for reserve_slot
request( is_cargo_present, is_cargo_present(X) ).
reply( cargo_present, cargo_present(X) ).  %%for is_cargo_present
reply( cargo_absent, cargo_absent(X) ).  %%for is_cargo_present
event( container_in, container_in(X) ).
request( moverobot, moverobot(TARGETX,TARGETY,STEPTIME) ).
reply( moverobotdone, moverobotok(ARG) ).  %%for moverobot
reply( moverobotfailed, moverobotfailed(PLANDONE,PLANTODO) ).  %%for moverobot
request( handle_cargo_load, handle_cargo_load(TARGET_SLOT) ).
reply( cargo_load_success, cargo_load_success(X) ).  %%for handle_cargo_load
reply( cargo_load_failed, cargo_load_failed(X) ).  %%for handle_cargo_load
%====================================================================================
context(ctx_cargoservice, "localhost",  "TCP", "8010").
context(ctxrobotsmart, "127.0.0.1",  "TCP", "8020").
context(ctx_sensor, "127.0.0.2",  "TCP", "8030").
context(ctx_ioport, "127.0.0.3",  "TCP", "8040").
 qactor( robotsmart26, ctxrobotsmart, "external").
  qactor( cargoservice, ctx_cargoservice, "it.unibo.cargoservice.Cargoservice").
 static(cargoservice).
  qactor( cargorobot, ctx_cargoservice, "it.unibo.cargorobot.Cargorobot").
 static(cargorobot).
  qactor( led, ctx_sensor, "it.unibo.led.Led").
 static(led).
  qactor( sensor, ctx_sensor, "it.unibo.sensor.Sensor").
 static(sensor).
  qactor( ioport, ctx_ioport, "it.unibo.ioport.Ioport").
 static(ioport).
  qactor( hold_controller, ctx_cargoservice, "it.unibo.hold_controller.Hold_controller").
 static(hold_controller).
