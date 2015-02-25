 function CMS (EventHandler) { 
     this.clsName = "ROOT";
     var me = this;
     this.classes = {};
     this.liveVars = {};
     
     this.addClass = function (classname, itsContents, action, fromParent) {
         //this.classes[name] = itsContents;
         
         var processedContents = {};
         
         if(itsContents["config"] === undefined ) {
             itsContents["config"] = {};
         }

         if (!action ||action == "define") {
             processedContents = itsContents;
         }
         if ( action == "override" && fromParent) {
             var par = this.classes[fromParent];  
             // override parent functions
             for( item in itsContents) {
                 if(item != "config" && item != "className")
                     par[item] = itsContents[item];
             }
             // override parent configs
             for( item in itsContents.config) {
                 par.config[item] = itsContents.config[item];
             }
         
         }

         if ( action == "extend" && fromParent) {
             var par, i = 0; 
             
             par = this.classes[fromParent] ;
             // set the parent of the class
             processedContents["parentClass"] = par; 
             // copy class contents into a processed object ( to be processed)
             for (item in itsContents) {
                 processedContents[item] = itsContents[item];

             }
             // copy items from parent to class if not in class
             for (item in processedContents) {
                 var itemFound = false;
                 for(item2 in par){
                     if( item != item2 && !itemFound && par[item2] !== undefined && processedContents[item2] === undefined ) {
                         processedContents[item2] = par[item2];
                         itemFound = true;
                     }
                 }
             }
             // copy config ( config is like config in sencha touch)
             for(def in par.config){
                 var found = false;
                 for( xdef in processedContents.config) {
                     if( xdef == def){
                         found = true;
                     }
                 }
                 if (!found) {
                     processedContents.config[def] = par.config[def];
                 }    

             }

            
         }
         // creating the initial values ( in order to reset a variable to it's initial state)
         processedContents["initials"] = {};
         
         for( def in processedContents.config) {
             processedContents.initials[def] = processedContents.config[def];
         }
         
         // copying mixins to class 
         if(processedContents.mixins !== undefined) {
             for(var i = 0; i <processedContents.mixins.length; i++) {
                 var mixin = processedContents.mixins[i],
                     mxin = me.classes[mixin];
                 for( item in mxin) {
                     if( item != "className" || item != "config") {
                         processedContents[item] = mxin[item];
                     }
                 }
                 
             
             }
             delete processedContents["mixins"];
         
         }

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
         // creation is done
         this.classes[classname] = processedContents;
                 
        
         
     };
     
     this.addPrefix = function ( prefix, word) { 
         word = word.substring(0,1).toUpperCase() + word.substring(1,word.length); 
         return prefix + word;

     };

    

}

var cms = new CMS();

cms.addClass("MXRock", {
     rockThePlace: function(motto){
         alert(motto);
     }
});

cms.addClass("Animal", {
    config: {
        makeSound: "craaa"
    },
    doSomeSounds: function() {
        alert( this.getMakeSound());
    }
});
cms.addClass("Bird", {
    config: {
        sing: "pi pi pi po"
    },
    singSong: function() {
        for( var i = 0; i < 3; i ++ ) {
            alert(this.get("sing"));
        }
        alert(arguments[0]);
    }
},"extend","Animal");

cms.addClass("Pigeon", {
    mixins:[
        "MXRock"
    ],

    singSong: function() {
        this.set("sing","gotta rock to stay alive");
        this.callParent("singSong","yeaahahhaaha");
    }
},"extend","Bird");

cms.addClass("OVRDBird", {
    config: {
        sing: " i'ma skatman!"
    },
    singSong: function() {
         alert(this.get("sing"));
    }
},"override","Bird");

