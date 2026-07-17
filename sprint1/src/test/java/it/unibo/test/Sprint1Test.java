package test.java.it.unibo.test;

import org.junit.Test;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.*;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;

import unibo.basicomm23.interfaces.Interaction;
import unibo.basicomm23.msg.ProtocolType;
import unibo.basicomm23.utils.CommUtils;
import unibo.basicomm23.utils.ConnectionFactory;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class Sprint1Test {
	private static Interaction conn;
	
	@BeforeClass
	public static void setup() throws Exception {
	    conn = ConnectionFactory.createClientSupport23(ProtocolType.tcp, "localhost", "8010");
	    Thread.sleep(500);
	    String setDelay = CommUtils.buildDispatch("tester", "setDelay", "setDelay(5000)", "cargoservice").toString();
		conn.forward(setDelay);
	}
	
	@AfterClass
	public static void down() throws Exception {
		String setDelay = CommUtils.buildDispatch("tester", "setDelay", "setDelay(30000)", "cargoservice").toString();
		conn.forward(setDelay);
	}
	
	/*
	 * Precondizione: sistema in DISENGAGED, IOPort libera al momento della load_request.
	 * Atteso: dopo il deposito del container alla IOPort, cargorobot esegue il ciclo IOPORT - SLOT5 - slotN, 
	 * il sistema torna in DISENGAGED con lo slot occupato (Golden Path).
	 */
	@Test
	public void testT01_02() throws Exception {
		String set_cargo_absent = CommUtils.buildDispatch("tester", "mock_cargo_absent", "mock_cargo_absent(X)", "mock_sensor").toString();
		conn.forward(set_cargo_absent);
		
	    String req = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    System.out.println("Richiesta: " + req);
	    String resp = conn.request(req);

	    assertTrue("T01: load_accepted con slot assegnato", resp.contains("load_accepted"));
	    //simula sensor: container rilevato all'IOPort (dispatch asincrono)
	    conn.forward(CommUtils.buildDispatch("mock_sensor", "container_in", "container_in(X)", "cargoservice").toString());

	    Thread.sleep(45000);
	    
		conn.forward(set_cargo_absent);

	    //una nuova richiesta deve essere accettata (sistema tornato in DISENGAGED)
	    String req2 = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    String resp2 = conn.request(req2);

	    Thread.sleep(2000);
	    conn.forward(CommUtils.buildDispatch("mock_sensor", "container_in", "container_in(X)", "cargoservice").toString());
	    Thread.sleep(500);
	    conn.forward(set_cargo_absent);
	    
	    //una nuova richiesta deve essere accettata (sistema tornato in DISENGAGED)
	    String req3 = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    String resp3 = conn.request(req3);

	    assertTrue("T02: sistema tornato in DISENGAGED dopo carico", resp3.contains("load_accepted"));
	
	}
	
	/*
	 * Precondizione: sistema in ENGAGED, un solo slot libero.
	 * Atteso: allo scadere dei 30s senza avere depositato un container alla IOPort, 
	 * il sistema torna in DISENGAGED con lo slot liberato (prima riservato) e risponde retrylater alla richiesta originale.
	 */
	@Test
	public void testT03() throws Exception {
		
		String set_cargo_absent = CommUtils.buildDispatch("tester", "mock_cargo_absent", "mock_cargo_absent(X)", "mock_sensor").toString();
		conn.forward(set_cargo_absent);
		Thread.sleep(7000);
	    //lo slot deve essere stato liberato
	    String req2 = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    String resp2 = conn.request(req2);

	    assertTrue("T03: slot liberato dopo timeout", resp2.contains("load_accepted"));
	}
	
	/*
	 * Precondizione: container depositato prima della load_request
	 * Atteso: alla load_request, cargoservice interroga sensor, che indicherà la presenza del container. Cargoservice risponde retrylater. 
	 */
	@Test
	public void testT04() throws Exception {
		String set_cargo_present = CommUtils.buildDispatch("tester", "mock_cargo_present", "mock_cargo_present(X)", "mock_sensor").toString();
		conn.forward(set_cargo_present);

	    //invio richiesta di carico
	    String req = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    String resp = conn.request(req);

	    assertTrue("T04: container già presente: retrylater", resp.contains("retrylater"));
	}
	
	/*
	 * Precondizione: tutti gli slot1-4 occupati.
	 * Atteso: cargoservice risponde load_rejected.
	 */
	@Test
	public void testT05() throws Exception {
		//occupo tutti gli slot
		String set_hold_full = CommUtils.buildDispatch("tester", "test_hold_full", "test_hold_full(X)", "holdservice").toString();
		conn.forward(set_hold_full);
		
	    //invio richiesta di carico
	    String req = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    String resp = conn.request(req);
	    
	    String set_hold_empty = CommUtils.buildDispatch("tester", "test_hold_empty", "test_hold_empty(X)", "holdservice").toString();
	    conn.forward(set_hold_empty);
	    
	    assertTrue("T05: hold piena - load_rejected", resp.contains("load_rejected"));
	}
	
	/*
	 * Precondizione: sistema in DISENGAGED.
	 * Atteso: dopo sensorError da sensor, il sistema entra in OUT_OF_SERVICE, le richieste successive ricevono retrylater(out_of_service).
	 */
	@Test
	public void testT06() throws Exception {
	    //simulo sensor guasto
	    conn.forward(CommUtils.buildDispatch("tester", "sensorError", "sensorError(x)", "cargoservice").toString());

	    //invio richiesta di carico
	    String req = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    String resp = conn.request(req);
	    
	    conn.forward(CommUtils.buildDispatch("tester", "sensorOK", "sensorOK(x)", "cargoservice").toString());
	    
	    assertTrue("T06: out_of_service - retrylater", resp.contains("retrylater"));
	}
}
