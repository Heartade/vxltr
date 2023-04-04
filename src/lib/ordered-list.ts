// ordered random-access list of type T
export class OrderedList<T> {
    private _list: T[] = [];
    private _map: Map<T, number> = new Map();
    private _compare: (a: T, b: T) => -1 | 0 | 1;

    get list() {
        return [...this._list];
    }
    
    constructor(compare: (a: T, b: T) => -1 | 0 | 1) {
        this._compare = compare;
    }

    private _binarySearch(item: T, start: number, end: number): number {
        if (start > end) {
            return start;
        } else {
            const mid = Math.floor((start + end) / 2);
            if (this._compare(item, this._list[mid]) < 0) {
                return this._binarySearch(item, start, mid - 1);
            } else if (this._compare(item, this._list[mid]) > 0) {
                return this._binarySearch(item, mid + 1, end);
            } else {
                return mid;
            }
        }
    }

    // find possible index of item
    private findIndex(item: T): number {
        return this._binarySearch(item, 0, this._list.length - 1);
    }

    // check if item is in list
    has(item: T): boolean {
        return this._list[this.findIndex(item)] === item;
    }

    // add item to list
    add(item: T) {
        const index = this.findIndex(item);
        if (this._list[index] === item) {
            return;
        }
        this._list.splice(index, 0, item);
    }
    
    // remove item from list
    remove(item: T) {
        const index = this.findIndex(item);
        if (this._list[index] !== item) {
            return;
        }
        this._list.splice(index, 1);
    }
    
    // get item at index
    get(index: number) {
        return this._list[index];
    }
    
    // get index of item
    indexOf(item: T) {
        const index = this.findIndex(item);
        if (this._list[index] !== item) {
            return undefined;
        }
        return index;
    }
    
    // get length of list
    get length() {
        return this._list.length;
    }
}