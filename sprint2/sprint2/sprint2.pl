%====================================================================================
% sprint2 description   
%====================================================================================
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
request( reserve_slot, reserve_slot(X) ).
reply( reserve_ok, reserve_ok(N) ).  %%for reserve_slot
reply( reserve_fail, reserve_fail(CAUSE) ).  %%for reserve_slot
dispatch( free_slot, free_slot(SLOT) ).
request( is_cargo_present, is_cargo_present(X) ).
reply( cargo_present, cargo_present(X) ).  %%for is_cargo_present
reply( cargo_absent, cargo_absent(X) ).  %%for is_cargo_present
event( container_in, container_in(X) ).
request( moverobot, moverobot(TARGETX,TARGETY,STEPTIME) ).
reply( moverobotdone, moverobotok(ARG) ).  %%for moverobot
reply( moverobotfailed, moverobotfailed(PLANDONE,PLANTODO) ).  %%for moverobot
request( setdirection, dir(D) ).
reply( setdirectiondone, pos(PX,PY) ).  %%for setdirection
dispatch( setrobotstate, setpos(X,Y,D) ).
request( getrobotstate, getrobotstate(ARG) ).
reply( robotstate, robotstate(POS,DIR) ).  %%for getrobotstate
request( handle_cargo_load, handle_cargo_load(TARGET_SLOT) ).
reply( cargo_load_success, cargo_load_success(X) ).  %%for handle_cargo_load
reply( cargo_load_failed, cargo_load_failed(X) ).  %%for handle_cargo_load
dispatch( send_home, send_home(X) ).
dispatch( sensorError, sensorError(X) ).
dispatch( sensorOK, sensorOK(X) ).
dispatch( led_blink, led_blink(X) ).
dispatch( led_off, led_off(X) ).
dispatch( mock_cargo_present, mock_cargo_present(X) ).
dispatch( mock_cargo_absent, mock_cargo_absent(X) ).
dispatch( test_hold_full, test_hold_full(X) ).
dispatch( test_hold_empty, test_hold_empty(X) ).
dispatch( setDelay, setDelay(X) ).
dispatch( already_home, already_home(X) ).
%====================================================================================
context(ctx_cargoservice, "localhost",  "TCP", "8010").
context(ctxrobotsmart, "127.0.0.1",  "TCP", "8020").
context(ctx_sensor, "rpi",  "TCP", "8030").
 qactor( robotsmart, ctxrobotsmart, "external").
  qactor( sensorservice, ctx_sensor, "external").
  qactor( ledservice, ctx_sensor, "external").
  qactor( cargoservice, ctx_cargoservice, "it.unibo.cargoservice.Cargoservice").
 static(cargoservice).
  qactor( cargorobot, ctx_cargoservice, "it.unibo.cargorobot.Cargorobot").
 static(cargorobot).
  qactor( holdservice, ctx_cargoservice, "it.unibo.holdservice.Holdservice").
 static(holdservice).
