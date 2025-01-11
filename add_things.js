var base = Module.findBaseAddress('DreadHungerServer-Win64-Shipping.exe');

var FTransform_Identity = base.add(0x4559220);
var FActorSpawnParameters_FActorSpawnParameters = new NativeFunction(base.add(0x29584A0), 'void', ['pointer'], 'win64');
var UWorld_SpawnActor = new NativeFunction(base.add(0x2624510), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'], 'win64');
var UObject_GetWorld = new NativeFunction(base.add(0x13075A0), 'pointer', ['pointer'], 'win64');

var UClass_GetPrivateStaticClass = new NativeFunction(base.add(0x11F02E0), 'pointer', [], 'win64');

var StaticLoadObject = new NativeFunction(base.add(0x137B290), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer', 'int32', 'pointer', 'int8', 'pointer'], 'win64');
var StaticFindObject = new NativeFunction(base.add(0x137AAA0), 'pointer', ['pointer', 'pointer', 'pointer', 'int8'], 'win64');
/*
function logInfo(Info) {
    var f = new File('output.log', 'a');
    f.write('[Patches] ' + Info + '\n');
    f.close();
}
*/
function findClassByName(ClassName) {
    return findObjectByName(ClassName, UClass_GetPrivateStaticClass());
}
function findObjectByName(ObjectName, Clazz) {
    var Buffer = Memory.alloc((ObjectName.length + 1) * 2);
    Buffer.writeUtf16String(ObjectName);
    return StaticFindObject(Clazz, ptr(0xFFFFFFFFFFFFFFFF), Buffer, 0);
}
function loadClassByName(ClassName) {
    return loadObjectByName(ClassName, UClass_GetPrivateStaticClass());
}
function loadObjectByName(ObjectName, Clazz) {
    var Buffer = Memory.alloc((ObjectName.length + 1) * 2);
    Buffer.writeUtf16String(ObjectName);
    return StaticLoadObject(Clazz, ptr(0), Buffer, ptr(0), 0, ptr(0), 1, ptr(0));
}

function spawnActor(World, Clazz, Position, Owner) {
    var Parameters = Memory.alloc(0x30);
    FActorSpawnParameters_FActorSpawnParameters(Parameters);
    Parameters.add(0x10).writePointer(Owner);
    return UWorld_SpawnActor(World, Clazz, Position, Parameters);
}
function getClass(ClassName) {
    var Clazz = findClassByName(ClassName);
    if (!Clazz.isNull()) {
        return Clazz;
    }
    return loadClassByName(ClassName);
}
function eulerToQuaternion(pitch, roll, yaw) {
    // Convert degrees to radians
    var p = pitch * Math.PI / 180;
    var r = roll * Math.PI / 180;
    var y = yaw * Math.PI / 180;

    var c1 = Math.cos(y * 0.5);
    var s1 = Math.sin(y * 0.5);
    var c2 = Math.cos(r * 0.5);
    var s2 = Math.sin(r * 0.5);
    var c3 = Math.cos(p * 0.5);
    var s3 = Math.sin(p * 0.5);

    return {
        x: Number((s1 * s2 * c3 + c1 * c2 * s3).toFixed(2)),
		y: Number((s1 * c2 * c3 + c1 * s2 * s3).toFixed(2)),
        z: Number((c1 * s2 * c3 - s1 * c2 * s3).toFixed(2)),
        w: Number((c1 * c2 * c3 - s1 * s2 * s3).toFixed(2))
    };
}
function makeTransform(Rot, Pos, Scale) {
    var TransformBuffer = Memory.alloc(16*3);
	
	if (Rot[0] === 0 && Rot[1] === 0 && Rot[2] === 0) {
        // Write Identity Quaternion [0, 0, 0, 1]
        TransformBuffer.add(0).writeFloat(0.0); // X
        TransformBuffer.add(4).writeFloat(0.0); // Y
        TransformBuffer.add(8).writeFloat(0.0); // Z
        TransformBuffer.add(12).writeFloat(0.0);
		
		//logInfo(`Rotation: x=${Rot[0]}, y=${Rot[1]}, z=${Rot[2]}`);
    } else {
        // Convert Euler angles to Quaternion
        var quaternion = eulerToQuaternion(Rot[0], Rot[1], Rot[2]);

        // Log Quaternion for Debugging
        //logInfo(`Quaternion: x=${quaternion.x}, y=${quaternion.y}, z=${quaternion.z}, w=${quaternion.w}`);

        // Write Rotation (Quaternion) in [X, Y, Z, W] order
		
		//As you may have noticed, quaternion.z and quaternion.y are swapped. I am not entirely sure why, but through trial and error, this approach works for rotation around the Z-axis
        TransformBuffer.add(0).writeFloat(quaternion.x); // Y
        TransformBuffer.add(4).writeFloat(quaternion.z); // y
        TransformBuffer.add(8).writeFloat(quaternion.y); // Z
        TransformBuffer.add(12).writeFloat(quaternion.w); // W
		
		
    }
   
	 //logInfo(`Pos X: ${Pos[0]}, Y: ${Pos[1]}, Z: ${Pos[2]}`);
	
    TransformBuffer.add(16).writeFloat(Pos[0]);
    TransformBuffer.add(20).writeFloat(Pos[1]);
    TransformBuffer.add(24).writeFloat(Pos[2]);

    TransformBuffer.add(32).writeFloat(Scale[0]);
    TransformBuffer.add(36).writeFloat(Scale[1]);
    TransformBuffer.add(40).writeFloat(Scale[2]);
    
	return TransformBuffer;
}


var GWorld = base.add(0x46ED420);
function getGameState() {
    var AuthorityGameMode = GWorld.readPointer().add(0x118).readPointer();
    var GameState = AuthorityGameMode.add(0x280).readPointer();
    return GameState;
}

var ActorGroups = {
	//Icebergs Group 1 - 6
    "Group1": [
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [-7429.48, -1787, -104], [0.7, 0.7, 0.7]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [-8442.48, -2753, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_3.BP_IceWall_3_C', [0, 0, 0], [-6409, -3063, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [-6444.48, -552, -104], [0.7, 0.7, 0.7]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [-4831, -1142, -104], [0.7, 0.7, 0.7]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [-4463.48, -2571, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [-5421.28, -2439, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_3.BP_IceWall_3_C', [0, 0, 0], [-6131.48, -1775, -104], [1, 1, 1]],
    ],
    "Group2": [
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [-9627.99, 5602.615, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_3.BP_IceWall_3_C', [0, 0, 0], [-7044.91, 6352.20, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [-8636.27, 7055.98, -104], [0.9, 0.9, 0.9]],
    ],
    "Group3": [
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [2533.45, 306.13, -104], [0.7, 0.7, 0.7]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_3.BP_IceWall_3_C', [0, 0, 0], [3333, 1683, -104], [2, 2, 2]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [4944, 755.57, -104], [1, 1, 1]],
    ],
    "Group4": [
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [5043.24, -8325.42, -104], [0.8, 0.8, 0.8]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [3914.72, -9292.23, -104], [0.8, 0.8, 0.8]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [5773.28, -9067.75, -104], [1, 1, 1]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [6193.99, -7423.39, -104], [1, 1, 1]],
		['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [6808.63, -8267.85, -104], [0.6, 0.6, 0.6]]
    ],
    "Group5": [
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [8724.46, 2372.18, -104], [0.8, 0.8, 0.8]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [9766.74, 796.61, -104], [0.8, 0.8, 0.8]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [10751.44, 1758.60, -104], [1, 1, 1]],
		['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [9924.33, 2881.78, -104], [1, 1, 1]],
    ],
    "Group6": [
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [4418.66, 13613.72, -104], [0.8, 0.8, 0.8]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [6393.12, 14523.40, -104], [0.7, 0.7, 0.7]],
        ['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [7084.24, 12986.44, -104], [0.8, 0.8, 0.8]],
		['/Game/Environment/Blueprints/IceWall/BP_IceWall.BP_IceWall_C', [0, 0, 0], [9939.17, 13370.70, -124], [0.8, 0.8, 0.8]],
		['/Game/Environment/Blueprints/IceWall/BP_IceWall_3.BP_IceWall_3_C', [0, 0, 0], [10224.87, 15085.95, -104], [2, 2, 2]],
		['/Game/Environment/Blueprints/IceWall/BP_IceWall_2.BP_IceWall_2_C', [0, 0, 0], [11623.08, 13106.51, -124], [0.9, 0.9, 0.9]],
    ],
	
	//Central tower
    "Group7": [
	
		['/Game/Blueprints/Environment/FoodStorage/Flesh/BP_Cannibal_Storage_2.BP_Cannibal_Storage_2_C', [0, 0, 180], [9805.14, 8582.82, 900.60], [1, 1, 1]],
		['/Game/Blueprints/Environment/FoodStorage/ClothedSkeletons/BP_Skeleton_Clothed_03.BP_Skeleton_Clothed_03_C', [0, 0, 180], [8003.31, 10844.30, 70.22], [1, 1, 1]],
		['/Game/Blueprints/Environment/FoodStorage/ClothedSkeletons/BP_Skeleton_Clothed_02.BP_Skeleton_Clothed_02_C', [0, 0, 0], [8909.20, 8345.51, 1000.60], [1, 1, 1]],
		['/Game/Blueprints/Environment/BP_CoalStorage_Sled.BP_CoalStorage_Sled_C', [0, 0, -30], [7608.31, 5465.47, 0.46], [1, 1, 1]],
		
    ],
	
	//LightHouse Zone
	"Group8": [
        ['/Game/Blueprints/Game/Crafting/BP_WorkBench.BP_WorkBench_C', [0, 0, -90], [50584, 5179.68, 3075], [1, 1, 1]],
		['/Game/Blueprints/Environment/Digsites/BP_BuriedStrongbox.BP_BuriedStrongbox_C', [0, 0, 0], [46892.41, 767.48, 700], [1, 1, 1]],
		['/Game/Blueprints/Environment/Digsites/BP_BuriedStrongbox.BP_BuriedStrongbox_C', [0, 0, -30], [50187.44, 6183.86, 2020], [1, 1, 1]],
		
		
    ],


	//Nitro Zone
	"Group9": [
		 ['/Game/Blueprints/Environment/BP_ReviveBed_Igloo.BP_ReviveBed_Igloo_C', [0, 0, 0], [39167.96, -10584.31, 1707.69], [1, 1, 1]],
	],
	
	
	//Testing Zone on the start
	//These are the starting coordinates for the Expanse mmap used to test new features
	/*
	"Group10": [
		 ['/Game/Blueprints/Game/Tutorial/ChapterFour/BP_CaveRubble.BP_CaveRubble_C', [0, 0, 0], [-31886.56, 139.76, 50.18], [1, 1, 1]],
		 
		 ['/Game/Blueprints/Environment/BP_StorageTrunk.BP_StorageTrunk_C', [0, 0, 0], [-29971.38, 213.38, 50.18], [1, 1, 1]],
		 //sit
		 ['/Game/Environment/Blueprints/PackIce/BP_PackIceSheet_Medium.BP_PackIceSheet_Medium_C', [0, 0, 0], [-28056.20, 287.00, 50.18], [1, 1, 1]],
		  
		 ['/Game/Environment/Placeholders/Structures/BP_ExployersTent.BP_ExployersTent_C', [0, 0, 0], [-26141.02, 360.62, 50.18], [1, 1, 1]],
		  
		 ['/Game/Environment/Placeholders/Structures/BP_ExployersTent.BP_HangingLantern_Exterior_C', [0, 0, 0], [-24225.84, 434.24, 50.18], [1, 1, 1]],
	]
	*/
}
	

var groupCombinations = [
    ["Group1", "Group4"],
    ["Group1", "Group3", "Group5"],
    ["Group2", "Group5"],
    ["Group2", "Group6"],
];

function selectRandomCombination() {
    var index = Math.floor(Math.random() * groupCombinations.length);
    return groupCombinations[index];
}

var ADH_HumanCharacter_AddStartingInventory_addr = base.add(0xD46F10);
var hasAttached = false;

Interceptor.attach(ADH_HumanCharacter_AddStartingInventory_addr, {
    onEnter: function(args) {},
    onLeave: function(ret) {
        if (!hasAttached) {
            // Select one combination to exclude
            var excludedCombination = selectRandomCombination();

            // Load all groups except those in the excluded combination
            for (var groupName in ActorGroups) {
                if (excludedCombination.includes(groupName)) continue;

                var actors = ActorGroups[groupName];
                if (!actors) continue;

                for (var j = 0; j < actors.length; j++) {
                    var ActorClass = getClass(actors[j][0]);
                    var Transform = makeTransform(actors[j][1], actors[j][2], actors[j][3]);
                    spawnActor(GWorld.readPointer(), ActorClass, Transform, getGameState());
                }
            }
            
            hasAttached = true;
        }
    }
});