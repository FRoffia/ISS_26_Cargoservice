%====================================================================================
% ioport description   
%====================================================================================
event( push, push(X) ).
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
event( display, display(MESSAGE) ).
event( system_state, system_state(STATE) ).
event( display_web, display_web(MESSAGE) ).
request( get_hold_status, get_hold_status(X) ).
reply( hold_status, hold_status(STATUS) ).  %%for get_hold_status
event( hold_status_request, hold_status_request(X) ).
%====================================================================================
context(ctx_cargoservice, "192.168.178.81",  "TCP", "8010").
context(ctx_ioport, "localhost",  "TCP", "8040").
 qactor( cargoservice, ctx_cargoservice, "external").
  qactor( holdservice, ctx_cargoservice, "external").
  qactor( pushbuttonservice, ctx_ioport, "it.unibo.pushbuttonservice.Pushbuttonservice").
 static(pushbuttonservice).
  qactor( displayservice, ctx_ioport, "it.unibo.displayservice.Displayservice").
 static(displayservice).
  qactor( holdstatusservice, ctx_ioport, "it.unibo.holdstatusservice.Holdstatusservice").
 static(holdstatusservice).
  qactor( stateservice, ctx_ioport, "it.unibo.stateservice.Stateservice").
 static(stateservice).
