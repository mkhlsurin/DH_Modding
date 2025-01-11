
// Find the base address of the game module
var base = Module.findBaseAddress('DreadHungerServer-Win64-Shipping.exe');

// Simple helper for file logging
/*
function logInfo(info) {
    var f = new File('output.log', 'a');
    f.write('[DH] ' + info + '\n');  
    f.close();
}
*/

// ADH_HumanCharacter::EndSpiritWalk(this)
var ADH_HumanCharacter_EndSpiritWalk = new NativeFunction(
  base.add(0xD53C30),  
  'void',
  ['pointer'],
  'win64'
);

// ADH_BoneDagger::PutDown(this)
var ADH_BoneDagger_PutDown = new NativeFunction(
  base.add(0xE7E020),  
  'void',
  ['pointer'],
  'win64'
);



// Hook ADH_BoneDagger::PutDown
Interceptor.attach(ADH_BoneDagger_PutDown, {
  onEnter: function (args) {
    // args[0] = ADH_BoneDagger* (this)
    this.BoneDaggerPtr = args[0];

    //logInfo('[ADH_BoneDagger::PutDown] Enter');

    // Retrieve HumanOwner pointer at offset 0x268
    var humanOwnerPtr = this.BoneDaggerPtr.add(0x268).readPointer();
    if (humanOwnerPtr.isNull()) {
      //logInfo('No valid HumanOwner found at offset 0x268!');
      return;
    }

    // Check bSpiritWalking at offset 0xc71 in ADH_HumanCharacter
    var bSpiritWalking = humanOwnerPtr.add(0xc71).readU8();
    //logInfo('bSpiritWalking = ' + bSpiritWalking);

    // If spirit walking, end it 
    if (bSpiritWalking === 1) {
      //logInfo('Ending spirit walk now!');
      ADH_HumanCharacter_EndSpiritWalk(humanOwnerPtr);
      
    }
  },
  onLeave: function (retval) {
    //logInfo('[ADH_BoneDagger::PutDown] Leave');
  }
});
