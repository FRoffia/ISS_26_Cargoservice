package it.unibo.hold_controller

protected Class Slot{
    private boolean occupied;
    private String name;
    
    protected Slot(String name) {
    	this.occupied= false;
    	this.name = name;
    }
    
    protected void setName(String name) {
    	this.name = name;
    }

    protected void free(){
        occupied = false;
    }

    protected void occupy(){
        occupied = true;
    }

    protected boolean isOccupied(){
        return occupied;
    }    
}
