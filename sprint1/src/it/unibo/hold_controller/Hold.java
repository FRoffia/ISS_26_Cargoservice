package it.unibo.hold_controller

public Class Hold{         
    private int number_of_slots n;
    private Slot slots[];

    public Hold(int n){
        this.n = n;
        slots = new Slot[n];

        for(int i = 0; i < n; i++){
            slots[i] = new Slot("slot"+(i+1));
        }
    }

    public void freeSlot(int slot_id){
        slots[slot_id - 1].free();
    }

    public void occupySlot(int slot_id){
        slots[slot_id - 1].occupy();
    }

    public boolean isSlotOccupied(int slot_id){
        return slots[slot_id - 1].isOccupied();
    }
    
    public boolean[] getSlotsOccupation() {
    	boolean[n] slotsOccupation;
    	
    	for(int i  = 0; i < n ; i++) {
    		slotsOccupation[i] = slots[i].isOccupied();
    	}
    	
    	return slotsOccupation;
    }
}

