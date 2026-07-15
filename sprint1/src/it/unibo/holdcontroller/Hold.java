package it.unibo.holdcontroller;

public class Hold{         
    private int n;
    private Slot[] slots;

    public Hold(int n){
        this.n = n;
        slots = new Slot[n];

        for(int i = 0; i < n; i++){
            slots[i] = new Slot();
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
        boolean[] slotsOccupation = new boolean[n];
        
        for(int i = 0; i < n; i++) {
            slotsOccupation[i] = slots[i].isOccupied();
        }
        
        return slotsOccupation;
    }
}