%====================================================================================
% sprint0 description   
%====================================================================================
request( load_request, load_request(X) ).
reply( load_accepted, load_accepted(SLOT) ).  %%for load_request
reply( load_rejected, load_rejected(X) ).  %%for load_request
reply( retrylater, retrylater(X) ).  %%for load_request
%====================================================================================
context(ctx_cargoservice, "localhost",  "TCP", "8000").
context(ctx_robot, "127.0.0.1",  "TCP", "8020").
 qactor( robot, ctx_robot, "external").
  qactor( cargoservice, ctx_cargoservice, "it.unibo.cargoservice.Cargoservice").
 static(cargoservice).
