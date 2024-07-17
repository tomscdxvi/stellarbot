class Paginator {
    constructor(array, pageSize) {
        this.array = array;
        this.pageSize = pageSize;
        this.currentPage = 1;
    }

    getPage() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.array.slice(startIndex, startIndex + this.pageSize);
    }

    next() {
        if (this.currentPage * this.pageSize < this.array.length) {
            this.currentPage += 1;
        }
        return this.getPage();
    }

    previous() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
        return this.getPage();
    }

    first() {
        this.currentPage = 1;
        return this.getPage();
    }

    last() {
        this.currentPage = Math.ceil(this.array.length / this.pageSize);
        return this.getPage();
    }
}

module.exports = Paginator;

/*
    let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    let pageSize = 4
    let paginator = new Paginator(array, pageSize);
  */
