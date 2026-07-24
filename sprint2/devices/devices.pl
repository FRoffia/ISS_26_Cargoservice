%====================================================================================
% devices description   
%====================================================================================
event( sonardata, sonardata(D) ).
event( container_in, container_in(X) ).
dispatch( sensorError, sensorError(X) ).
dispatch( sensorOK, sensorOK(X) ).
dispatch( led_blink, led_blink(X) ).
dispatch( led_off, led_off(X) ).
event( led_off_hw, led_off_hw(X) ).
event( led_blink_hw, led_blink_hw(X) ).
request( is_cargo_present, is_cargo_present(X) ).
reply( cargo_present, cargo_present(X) ).  %%for is_cargo_present
reply( cargo_absent, cargo_absent(X) ).  %%for is_cargo_present
event( push, push(X) ).
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
%====================================================================================
context(ctx_sensor, "localhost",  "TCP", "8030").
context(ctx_cargoservice, "192.168.178.81",  "TCP", "8010").
 qactor( cargoservice, ctx_cargoservice, "external").
  qactor( sensorservice, ctx_sensor, "it.unibo.sensorservice.Sensorservice").
 static(sensorservice).
  qactor( ledservice, ctx_sensor, "it.unibo.ledservice.Ledservice").
 static(ledservice).
  qactor( mock_pusbutton, ctx_sensor, "it.unibo.mock_pusbutton.Mock_pusbutton").
 static(mock_pusbutton).
