 function CMS () { 
     this.clsName = "ROOT";
     var me = this;
     this.classes = {};
     this.instantiatedClasses = {};
     this.instanceId = 0;
     this.liveVars = {};


     this.override = function (parentClass, contents) {
     
         var par = this.classes[parentClass];  
         // override parent functions
         for (item in contents) {
             if(item != "config" && item != "className")
                 me.copyItem(item, contents, par);
         }
         // override parent configs
         for (item in contents.config) {
             me.copyItem(item, contents.config, par.config);
         }

     };

     this.extend = function (processedContents, incommingContents, parentClass) {
         var par, i = 0; 
             
         par = this.classes[parentClass];
         // set the parent of the class
         processedContents["parentClass"] = par; 
         // copy class contents into a processed object ( to be processed)
         for (item in incommingContents) {
             me.copyItem(item, incommingContents, processedContents);
         }
         // copy items from parent to class if not in class
         
         for (item in par) {
             if (!processedContents[item] && item != "config" && item != "className")
                 me.copyItem(item, par, processedContents);
         }
         // copy config ( config is like config in sencha touch)
         for (def in par.config) {
             var found = false;
             for (xdef in processedContents.config) {
                 if (xdef == def) {
                     found = true;
                 }
             }
             if (!found) {
                 me.copyItem(def, par.config, processedContents.config);
             }    

         }

     
     };

     this.processMixins = function (processedContents) {
         for (var i = 0; i <processedContents.mixins.length; i++) {
             var mixin = processedContents.mixins[i],
                 mxin = me.classes[mixin];
             for (item in mxin) {
                 if (item != "className" || item != "config") {
                     me.copyItem(item, mxin, processedContents);
                 }
             }
             
         
         }
         delete processedContents["mixins"];

     
     };
     this.setInitials = function (contents) {
         contents["initials"] = {};
         
         for (def in contents.config) {
             me.copyItem(def, contents.config, contents.initials);
         }

     
     };

     this.addBasics = function (processedContents,classname) {
         // generate universal getter , requires string (name of variable)
         processedContents["get"] = function (item) {
             return this.config[item];
         };
         // generate universal setter , requires string (name of variable), requires value as second param
         processedContents["set"] = function (item,value) {
             this.config[item] = value;
         };
         // generate universal setter , requires string (name of variable), requires value as second param
         processedContents["reset"] = function (item) {
             this.config[item] = this.initials[item];
         };
         // calling parent ( first paramenter is the function name , rest of parameters are parameters that parent function accepts)
         processedContents["callParent"] = function(functionName) {
             var fn = functionName;
             [].shift.apply(arguments);
             this.parentClass[fn].apply(this,arguments);
         
         };
         // set classname for the class
         processedContents["className"] = classname;

     };
     
     this.addBlueprint = function (classname, itsContents, action, fromParent) {
         var processedContents = {};
         
         if (!itsContents["config"]) {
             itsContents["config"] = {};
         }

         if (!action || action == "define") {
             processedContents = itsContents;
         }

         if (action == "override" && fromParent) {
            this.override(fromParent, itsContents);
         }

         if (action == "extend" && fromParent) {
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
         this.classes[classname] = processedContents;
         
     };
     
     this.addPrefix = function ( prefix, word) { 
         word = word.substring(0,1).toUpperCase() + word.substring(1,word.length); 
         return prefix + word;

     };

     this.copyItem = function (itemName,fromObj,toObj){
         toObj[itemName] = fromObj[itemName];
     };

     this.mergeItems = function (objA, objB, overrideB) {
         var merged = this.clone(objB);
         for (item in objA){
             if(!merged[item] || overrideB)
                 this.copyItem(item, objA, merged);
         }
         
     };

     this.applySettings = function (settings,onInstance) {
         if (settings.config){
             for(item in settings.config){
                 me.copyItem(item, settings.config, onInstance.config);  
             }
         }
         for (item in settings) {
             if(item != "config" && item != "className"){
                 me.copyItem(item, settings, onInstance);
             }
         }
     };


     this.generateInstanceUID = function (classname) {
         return classname+this.instanceId++;
     };
   
     this.makeInstance = function () {
         var classname, settings, readyCall=false;

         if (arguments.length == 0)
             return;
         if (arguments.length == 1) {
             // if its object(settings)
             settings = arguments[0];
             classname = settings.type;
         }

         if (arguments.length == 2) {
             if ( typeof arguments[0] == "object") {
                 // if is object(settings) and callback 
                 settings = arguments[0];
                 classname = settings.type;
                 readyCall = arguments[1];

             } else {
                 // if is classname and object(settings)
                 classname = arguments[0];
                 settings = arguments[1];
             }

         }

         if (arguments.length >= 3) {
             //if its classname , object(settings) ,callback
             classname = arguments[0];
             settings = arguments[1];
             readyCall = arguments[2];
         }


         var refObj = this.classes[classname],
             newClone = this.clone(refObj),
             uid = this.generateInstanceUID(classname);

         this.applySettings(settings,newClone);

         this.instantiatedClasses[uid] = newClone;
         if(readyCall) {

             this.instantiatedClasses[uid][readyCall]();
         }
         this.instantiatedClasses[uid]["_unique_id"] = uid;
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

     this.getInstance = function(uid) {
         return this.instantiatedClasses[uid];
     };
     this.getAllInstancesOfType = function(classname){
         var list = [];
         for (obj in this.instantiatedClasses) {
             if(this.instantiatedClasses[obj].className == classname){
                 list.push(obj);
             }
         }
         return list;
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
},"extends","baseClassName");



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
    
},"extends","childClassName");

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
