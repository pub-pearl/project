const DataBuilderEventPool = class {
    memberList;
    add(dataBuilderEventObj) {
        if(this.memberList == null) this.memberList = [];
        this.memberList.push(dataBuilderEventObj);
    }
    remove(dataBuilderEventObj) {
        if(this.memberList != null) {
            let index =0;
            this.memberList.forEach(member => {
               if(member == dataBuilderEventObj) {
                   this.memberList.splice(index, 1);
                   index++;
                   return;
               }
            });
        }
    }
    call(key) {
        if(this.memberList != null) {
            this.memberList.forEach(target => {
               target.call(key);
            });
        }
    }
    view() {
        if(this.memberList != null) {
            console.log("====== Event Pool Members =====");
            this.memberList.forEach(member => {
                console.log(member);
            });
            console.log("===============================");
        }
        return this.memberList;
    }
};

const DataBuilderEvent = class {
    eventHandlerMap;
    constructor(settings) {
        this.eventHandlerMap = new Map();
        for(let item in settings) {
            this.eventHandlerMap.set(item, settings[item]);
        }
    }
    getKey() {
        return this.eventHandlerMap.keys();
    }
    on(key,eventHandler) {
        return this.eventHandlerMap.set(key, eventHandler);
    }
    off(key) {
        return this.eventHandlerMap.delete(key);
    }
    one(key) {
        return this.off(key).on(key);
    }
    call(key) {
        if(typeof this.eventHandlerMap.get(key) === 'function') {
            this.eventHandlerMap.get(key)();
        }
    }
};