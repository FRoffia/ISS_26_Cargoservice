package test.java.it.unibo.test;

import static org.junit.Assert.assertTrue;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import unibo.basicomm23.interfaces.Interaction;
import unibo.basicomm23.msg.ProtocolType;
import unibo.basicomm23.utils.CommUtils;
import unibo.basicomm23.utils.ConnectionFactory;

public class MultipleLoadReqTest {
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
	
	@Test
	public void testMultipleLoadRequests() throws Exception {
		String set_cargo_absent = CommUtils.buildDispatch("tester", "mock_cargo_absent", "mock_cargo_absent(X)", "mock_sensor").toString();
		conn.forward(set_cargo_absent);
		conn.forward(set_cargo_absent);
		conn.forward(CommUtils.buildDispatch("mock_sensor", "container_in", "container_in(X)", "cargoservice").toString());
		conn.forward(CommUtils.buildDispatch("mock_sensor", "container_in", "container_in(X)", "cargoservice").toString());
		
		String req = CommUtils.buildRequest("tester", "load_request", "load_request(x)", "cargoservice").toString();
	    conn.request(req);
	    String resp = conn.request(req);
	    
	  //TODO: TESTARE CON ASSERT POSIZIONE ROBOT QUI CHIEDENDO ROBOTSTATE!!!
	    
	    assertTrue("T07: sistema tornato in DISENGAGED dopo carico", resp.contains("load_accepted"));
	}
}
