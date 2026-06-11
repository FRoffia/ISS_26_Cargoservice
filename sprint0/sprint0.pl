%====================================================================================
% sprint0 description   
%====================================================================================
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
request( check_container, check_container(X) ).
reply( container_present, container_present(X) ).  %%for check_container
reply( container_absent, container_absent(X) ).  %%for check_container
dispatch( containerIn, containerIn(X) ).
dispatch( containerOut, containerOut(X) ).
dispatch( sensorError, sensorError(X) ).
dispatch( sensorReady, sensorReady(X) ).
request( do_move, do_move(DEST) ).
reply( move_done, move_done(ARG) ).  %%for do_move
reply( move_failed, move_failed(CAUSE) ).  %%for do_move
request( buildPlan, buildPlan(PX,PY,TX,TY) ).
reply( buildPlanDone, buildPlanDone(PLAN) ).  %%for buildPlan
request( doplan, doplan(PLAN,STEPTIME) ).
reply( doplandone, doplandone(ARG) ).  %%for doplan
reply( doplanfailed, doplanfailed(PLANTODO) ).  %%for doplan
%====================================================================================
context(ctx_cargoservice, "localhost",  "TCP", "8000").
context(ctxrobotsmart, "127.0.0.1",  "TCP", "8020").
 qactor( robotsmart, ctxrobotsmart, "external").
  qactor( cargoservice, ctx_cargoservice, "it.unibo.cargoservice.Cargoservice").
 static(cargoservice).
  qactor( cargorobot, ctx_cargoservice, "it.unibo.cargorobot.Cargorobot").
 static(cargorobot).
