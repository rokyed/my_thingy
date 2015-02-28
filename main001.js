 /*
    Author: Andrei Bazavan

    Project: ClassManagementSystem

    Notes: Objects could have nested configs and variables , but no nested functions
    that means functions will not be considered on instance if they are deeper than the object's
    first level , exemple:

    // this is wrong:
    object:{
        someProp: {
            someConfig: null,
            someFunction: function () {
            }
        }
    }


    // THIS IS RIGHT :

    object:{
        someProp: {
            someConfig: null
        },
        someFunction: function () {

        }
    }





 */



function CMS () {
    this.clsName = "ROOT";
    this.keyWords = {
        className: "$className",
        config: "config",
        types: ["type","xtype","xclass"],
        initials: "initials",
        mixins: "mixins",
        parentClass: "parentClass",
        get: "get",
        set: "set",
        reset: "reset",
        define: "define",
        extend: "extend",
        override:"override",
        callParent:"callParent",
        uniqueID: "$uniqueId"
    };
    this.ownSettings = {
        instanceId: 0,
        _blueprintList:[],
        _instanceList:[],
        _instanceTypeList:[]
        };
    this.blueprints = {};
    this.instantiatedClasses = {};
    this.instances = this.instantiatedClasses; // only used for external naming ( shorter )
    var me = this,
        kwd = this.keyWords;

    // if you need to change some keywords to fit your solution here you go ,
    // please inspire yourself from the list of key words seen in this.keyWords
    this.setKeyword = function (keyWord, value) {
        this.keyWords[keyWord] = value;
    };
    // ----------------- faster but less flexible------------------------------
    this._addToInstanceList = function (instance,type) {
         this.ownSettings._instanceList.push(instance);
         this.ownSettings._instanceTypeList.push(type);
    };

    this._removeFromInstanceList = function (instance) {
        for (var i = 0; i< this.ownSettings._instanceList.length; i++) {
            if (this.ownSettings._instanceList[i] == instance) {
                this.ownSettings._instanceList.splice(i,1);
                this.ownSettings._instanceTypeList.splice(i,1);
            }
        }
    };

    this._getInstanceFromList = function (id) {
         return this.ownSettings._instanceList[id];
    };
    this._getInstanceTypeFromList = function (id) {
         return this.ownSettings._instanceTypeList[id];
    };

    this.__instanceListLength = function () {
        return this.ownSettings._instanceList.length;
    };

    this._addToBlueprintList = function (blueprint) {
         this.ownSettings._blueprintList.push(blueprint);
    };


    this._removeFromBlueprintList = function (blueprint) {
        for (var i = 0; i< this.ownSettings._blueprintList.length; i++) {
            if (this.ownSettings._blueprintList[i] == blueprint) {
                this.ownSettings._blueprintList.splice(i,1);

            }
        }
    };
    this._getBlueprintFromList = function (id) {
        return this.ownSettings._blueprintList[id];
    };
    this._blueprintListLength = function () {
        return this.ownSettings._blueprintList.length;
    };

    this._getAllInstancesOfType = function(classname) {
        var list = [];
        for (var i = 0; i < this._instanceListLength(); i++) {
            if(classname == this._getInstanceTypeFromList(i))
                list.push(this._getInstanceFromList(i));
        }
        return list;
    };


    this._destroyInstance = function (uid,lastCall) {
        if(lastCall)
            this.callFunction(arguments);

        this._removeFromInstanceList(uid);
        delete this.instantiatedClasses[uid];

    };
    //-------------------------------------------------------------------------
    // in order to populate types with new
    this.addType = function (typeToAdd){
        this.keyWords.types.push(typeToAdd);
    };

    this.override = function (parentClass, contents) {

        var par = this.blueprints[parentClass];
        // override parent functions
        for (var item in contents) {
            if(item != kwd.config && item != kwd.className)
                me.copyItem(item, contents, par);
        }
        // override parent configs
        for (var item in contents.config) {
            me.copyItem(item, contents.config, par.config);
        }

    };

    this.extend = function (processedContents, incommingContents, parentClass) {
        var par, i = 0;

        par = this.blueprints[parentClass];
         // set the parent of the class
        processedContents[kwd.parentClass] = par;
        // copy class contents into a processed object ( to be processed)
        for (var item in incommingContents) {
            me.copyItem(item, incommingContents, processedContents);
        }
        // copy items from parent to class if not in class

        for (var item in par) {
            if (!processedContents[item] && item != kwd.config && item != kwd.className)
                me.copyItem(item, par, processedContents);
        }
        // copy config ( config is like config in sencha touch)
        for (var def in par[kwd.config]) {
            var found = false;
            for (var xdef in processedContents[kwd.config]) {
                if (xdef == def) {
                    found = true;
                }
            }
            if (!found) {
                me.copyItem(def, par[kwd.config], processedContents[kwd.config]);
            }
        }
    };

    this.processMixins = function (processedContents) {
        for (var i = 0; i < processedContents.mixins.length; i++) {
            var mixin = processedContents.mixins[i],
                mxin = me.blueprints[mixin];
            for (var item in mxin) {
                if (item != [kwd.config]
                && item != [kwd.className]
                && item != [kwd.parenClass]
                && item != [kwd.callParent])
                    me.copyItem(item, mxin, processedContents);
                if (item == [kwd.config])
                    for ( var cfg in mxin[kwd.config]) {
                        if (!processedContents[kwd.config][cfg]) {
                            processedContents[kwd.config][cfg] = null;
                            me.copyItem(cfg, mxin[kwd.config], processedContents[kwd.config])
                        }
                    }
            }

        }
        delete processedContents[kwd.mixins];


    };
    this.setInitials = function (contents) {
        contents[kwd.initials] = {};

        for (var def in contents[kwd.config]) {
            me.copyItem(def, contents[kwd.config], contents[kwd.initials]);
        }


    };

    this.addBasics = function (processedContents,classname) {
         // generate universal getter , requires string (name of variable)
        processedContents[kwd.get] = function (item) {
            return this[kwd.config][item];
        };
         // generate universal setter , requires string (name of variable), requires value as second param
        processedContents[kwd.set] = function (item,value) {
            this[kwd.config][item] = value;
        };
         // generate universal resetter , requires string (name of variable)
        processedContents[kwd.reset] = function (item) {
            this[kwd.config][item] = this[kwd.initials][item];
        };
         // calling parent ( first paramenter is the function name , rest of parameters are parameters that parent function accepts)
        processedContents[kwd.callParent] = function(functionName) {
            var fn = functionName;
            [].shift.apply(arguments);
            this[kwd.parentClass][fn].apply(this,arguments);

        };
        // set classname for the class
        processedContents[kwd.className] = classname;

    };

    this.addBlueprint = function (classname, itsContents, action, fromParent,addToFastList) {
        var processedContents = {};

        if (!itsContents[kwd.config]) {
            itsContents[kwd.config] = {};
        }

        if (!action || action == kwd.define) {
            processedContents = itsContents;
        }

        if (action == kwd.override && fromParent) {
            this.override(fromParent, itsContents);
        }

        if (action == kwd.extend && fromParent) {
            this.extend(processedContents, itsContents, fromParent);
        }
         // creating the initial values ( in order to reset a variable to it's initial state)
        this.setInitials(processedContents);

         // copying mixins to class
        if (processedContents.mixins !== undefined) {
            this.processMixins(processedContents);
        }

        this.addBasics(processedContents, classname);

        // creation is done
        this.blueprints[classname] = processedContents;

        // it's limiting the flexibility but enhaces speed
        if (addToFastList)
            this._addToBlueprintList(classname);

    };

    this.addPrefix = function ( prefix, word) {
        word = word.substring(0,1).toUpperCase() + word.substring(1,word.length);
        return prefix + word;

    };

    this.copyItem = function (itemName,fromObj,toObj){
        toObj[itemName] = fromObj[itemName];
    };
    // merge A into B (override is optional)
    this.mergeItems = function (objA, objB, overrideB) {
        var merged = this.clone(objB);
        for (var item in objA){
            if (!merged[item] || overrideB === true)
                this.copyItem(item, objA, merged);
        }

        return merged;
    };

    this.applySettings = function (settings,onInstance) {
        if (settings[kwd.config]){
            for(var item in settings[kwd.config]){
                me.copyItem(item, settings[kwd.config], onInstance[kwd.config]);
            }
        }
        for (var item in settings) {
            if(item != kwd.config && item != kwd.className){
                me.copyItem(item, settings, onInstance);
            }
        }
    };


    this.generateInstanceUID = function (classname) {
        return classname + this.ownSettings.instanceId++;
    };

    // NOTE : 4th argument is boolean and it only means if new instance
    // should be added to instances array , to be used only if you are
    // processing big amounts of data , else use the standard version
    this.makeInstance = function () {
        var classname, settings, readyCall=false;

        if (arguments.length == 0)
            return;
        if (arguments.length == 1) {
            // if its object(settings)
            settings = arguments[0];

        }

        if (arguments.length == 2) {
            if ( typeof arguments[0] == "object") {
                // if is object(settings) and callback
                settings = arguments[0];
                readyCall = arguments[1];

            } else {
                // if is classname and object(settings)
                // we set the blueprint reference because we know it here
                classname = arguments[0];
                settings = arguments[1];
            }

        }

        if (arguments.length >= 3) {
            //if its classname , object(settings) ,callback
            // we set the blueprint reference because we know it here
            classname = arguments[0];
            settings = arguments[1];
            readyCall = arguments[2];
        }

        // first time we try looking for known varialbes that point to blueprint
        if (!classname) {
            for (var i = 0; i < kwd.types; i++) {
                if(settings[kwd.types[i]])
                    classname = settings[kwd.types[i]];
            }

        }

        // second time we try searching in the first level of depth of the instance settings

        if (!classname) {
            // fast implementation comes as 4th argument (boolean)
            if (arguments[4] === true) {
                for (var item in settings) {
                    for (var cls = 0; cls < this.ownSettings._blueprintList.length; cls++) {

                        if (settings[item] == this.ownSettings._blueprintList[cls]) {
                            classname = this.ownSettings._blueprintList[cls];
                            // also we add the new item as type alias
                            this.addType(item);
                        }
                    }
                }
            } else {
            // normal search
                for (var item in settings) {
                    for (var cls in this.blueprints) {

                        if (settings[item] == cls) {
                            classname = cls;
                            // also we add the new item as type alias
                            this.addType(item);
                        }
                    }
                }
            }
        }


        // third is a failure of finding referenced class
        if (!classname) {
            console.log("ERROR: no classname found");
            return;
        }

        var refObj = this.blueprints[classname],
            newClone = this.cloneForInstance(refObj,true),
            uid = this.generateInstanceUID(classname);


        this.applySettings(settings,newClone);

        this.instantiatedClasses[uid] = newClone;
        if (readyCall) {

            this.instantiatedClasses[uid][readyCall]();
        }
        this.instantiatedClasses[uid][kwd.uniqueID] = uid;


        if(arguments[4] === true)
            this._addToInstanceList(uid,classname);


        return uid;
    };

    this.clone = function (obj) {
        if (obj == null || typeof(obj) != 'object')
            return obj;

        var temp = {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                temp[key] = this.clone(obj[key]);
            }
        }
        return temp;
    };

    // this will clone configs but will modify functions to reference the blueprint (but only on first level of depth)

    this.cloneForInstance = function (obj, cname,objname) {

        if (objname && cname) {
            var tmpFn = function () {
                return cms.blueprints[cname][objname].apply(this,arguments);
            };
            return tmpFn;

        }
        if (obj == null || typeof(obj) != 'object') {
            return obj;
        }

        var temp = {};

        for (var key in obj) {

            if (obj.hasOwnProperty(key)) {
                if(typeof(obj[key]) == 'function') {
                    temp[key] = this.cloneForInstance(obj[key],obj[kwd.className],key);
                } else {
                    temp[key] = this.cloneForInstance(obj[key]);
                }
            }




        }
        return temp;
    };

    this.getInstance = function(uid) {

        return this.instantiatedClasses[uid];
    };

    // call function you need ( instancename (uid) , function name ,parameter1....)
    this.callFunction = function (){
        var args = [];

        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return this.instantiatedClasses[arguments[0]][arguments[1]](args);
    };


    this.destroyInstance = function (uid,lastCall) {

        if(lastCall)
            this.callFunction.apply(this,arguments);

        delete this.instantiatedClasses[uid];

    };

    this.getAllInstancesOfType = function(classname) {
        var list = [];
        for (var instance in this.instantiatedClasses) {
            if (classname == this.instantiatedClasses[instance][kwd.className])
                list.push(instance);
        }
        return list;
    };
    this.getAllInstancesOfTypeAsObj = function(classname) {
        var list = {};
        for (var instance in this.instantiatedClasses) {
            if (classname == this.instantiatedClasses[instance][kwd.className])
                list[instance] = this.instantiatedClasses[instance];
        }
        return list;
    };
    this.countItemsIn = function (element) {
        var cnt = 0 ;

        for (var i in element)
            cnt ++;

        return cnt;
    };

}

/*
// var cms = new CMS();

----- NOTE WE ARE USING THE WORD BLUEPRINT THE SAME AS CLASS
      SINCE THEY ARE THE SAME THING AND THEY ARE NOT AN INSTANCE OF
      CLASS OR BLUEPRINT


/////////////////////////////////////
// this is a base class declaration exemple:

cms.addBlueprint("baseClassName",{
    config: {
        configuredValue1: "something",
        configuredValue2: null
    },
    someFunction: function(args) {
        return this.get("configuredValue1");
    },
    veryOldFunction: function(message) {
        alert("The message is :" + message);
    }
});


////////////////////////////////////
// this is an extended class declaration exemple:

cms.addBlueprint("childClassName",{
    config: {
        configuredValue3: "something"
    },
    someFunction: function() {
        arguments.push(this.get("configuredValue2"))
        return this.callParent("someFunction", arguments);
    },
    ohANewFunction: function(args) {
        this.set("configuredValue3", args);
        return this.get("configuredValue1");
    }
},"extend","baseClassName");



////////////////////////////////////
// this is an exended class from extended class declaration example:

cms.addBlueprint("childOfChildClassName",{
    config: {
        anotherConfigValue:true
    },
    ultraNewFunction: function(args) {
        this.set("anotherConfigValue",false);
        this.veryOldFunction("oh it's still there , because it's inherited");
    }

},"extend","childClassName");

////////////////////////////////////
// this is an override that applies on the actual class

cms.addBlueprint("overidingClass",{
    config: {
        aNewVariable:"new value",
        configuredValue1:"it's overrided now"
    },
    veryOldFunction: function() {
        alert("this method has been overided")
        for( var i = 0; i < arguments.length;i++){
            alert(arguments[i]);
        }

    },
    specialNewFunction: function() {
        alert("this function is new and was never made into the base class");
    }
},"override","baseClassName");

*/


/*

--------------- Instances ----and extras---------------

cms.makeInstance() accepts up to 3 arguments

>>if only 1 argument then the argument is object and
    that object shall contain "type" as a reference blueprint
     we want to use.

>>if 2 arguments then
    >>if first argument is an object
        is the same like only 1 argument

    but second argument will be a string with the
    initialization function name
        (inside the new instance )
        and it can't have arguments

    -------------------------

    >>if first argument is a string
        ( is the reference of the blueprint used)

    but second argument will be the object with the
        configs and new functions we want for that instance

    note ( no initialization function )

>>if 3 arguments then

    first argument is a string ( with the blueprint reference)

    second argument is an object (with configs and new functions for the insance)

    but second argument will be a string with the
        initialization function name
        (inside the new instance )
        and it can't have arguments


exemples :
////////////////////
// with one argument:

// blueprint reference as element inside object(argument)
cms.makeInstance({
    type:"childClassName",
    config: {
        newConfigVal:"new val"
    },
    evenANewFunction: function(){
        alert(this.get("newConfigVal"));
    }
});



///////////////////////
// with two arguments:

// blueprint reference as construction argument

cms.makeInstance("childClassName",{
    config: {
        newConfigVal:"new val"
    },
    evenANewFunction: function(){
        alert(this.get("newConfigVal"));
    }
});



// blueprint reference as element inside object(argument)
// second argument is an ready function trigger in the instance.

cms.makeInstance({
    type:"childClassName",
    config: {
        newConfigVal:"new val"
    },
    evenANewFunction: function(){
        alert(this.get("newConfigVal"));
    }
},"evenANewFunction");


//////////////////////////
// with 3 arguments:

// blueprint reference as first argument,
// configs and sets (object) as second
// ready function trigger in the instance as the third argument

cms.makeInstance("childClassName",{
    config: {
        newConfigVal:"new val"
    },
    evenANewFunction: function(){
        alert(this.get("newConfigVal"));
    }
},"evenANewFunction");




////////////// the end////////////////////

*/
