
#Resizer-class  
###Easily listen on resize on a per-element basis!  
##Methods:  
* <Resizer>.addSizeListener()  
    @param <Object> args  
     {
      <Array, int> sizes      : The sizes to listen for,  
      <Function> inside       : Callback on match,  
      [<Function> outside]    : Callback on mismatch,  
      [<String> listenerType] : "width" or "height"  
     },  
    [@param <jQuery-object> $context] : Element-context function is called from.  
-------------------------------------  

* <jQuery>.addSizeListener()
    Same as above, with the $context provided as "$(this)".
-------------------------------------  

##Example usage: 
    $('.my-object').addSizeListener({  
      sizes       : [0, 768],  
      listenerType: "width",  
      inside      : function() { console.log("success!"); },  
      outside     : function() { console.log("Still outside.."); }  
    });
