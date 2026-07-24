package it.unibo.holdservice;

class Slot{
    private boolean occupied;
    
    Slot() {
        this.occupied = false;
    }

    void free(){
        occupied = false;
    }

    void occupy(){
        occupied = true;
    }

    boolean isOccupied(){
        return occupied;
    }
}