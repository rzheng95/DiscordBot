
// Queue class 
class Queue {
    // Array is used to implement a Queue 
    constructor() {
        this.items = [];
    }

    // enqueue(item) 
    enqueue(element) {
        // adding element to the queue 
        this.items.push(element);
    }
    // dequeue() 
    dequeue() {
        // removing element from the queue 
        // returns underflow when called  
        // on empty queue 
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    // front() 
    front() {
        // returns the Front element of  
        // the queue without removing it. 
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }
    // isEmpty() 
    isEmpty() {
        // return true if the queue is empty. 
        return this.items.length == 0;
    }

    clear() {
        this.items = [];
    }

    // printQueue() 
    printQueue() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += `${i+1}. ${JSON.stringify(this.items[i])}\n`;
        return str;      
    }

    printTitles() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += `${i+1}. ${this.items[i].title}\n`;
        return str;     
    }

    printList() {
        return JSON.stringify(this.items);
    }
}

module.exports = Queue;