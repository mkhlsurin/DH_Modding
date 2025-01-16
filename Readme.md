# Dread Hunger Modding Scripts

This repository contains two scripts that can be inserted into **Dread Hunger** using the **Frida tool**.

## Scripts Overview

### `add_things.js`
- Adds random icebergs at the start of the game, along with other features.
- Works exclusively on the **Expanse** map.
- Generates additional content at the start of the game, so no file uploads are necessary to play—just start the regular **Expanse** map.

---

### Concept of Random Icebergs Spawn

Here is the concept of the random icebergs' spawn locations:
![Random Icebergs Spawn](Images/Expanse_Groups_ver1.png)

There are 4 available routes:
1. 1 → 4  
2. 1 → 3 → 5  
3. 2 → 5  
4. 2 → 6  

At the start of the game, only one route will be chosen, while the others will spawn small icebergs. The captain can choose to navigate through them, but this will cause additional damage to the ship and significantly slow it down.

Example Iceberg Placements
Below are the visual examples of random iceberg placements:

**Iceberg Placement Example 1**
![Iceberg Placement Example 1](Images/Point_3.png)
**Iceberg Placement Example 2**
![Iceberg Placement Example 2](Images/Point_5.png)
**Iceberg Placement Example 3**
![Iceberg Placement Example 3](Images/Point_6.png)

---

### Balancing Adjustments

To balance gameplay, the following adjustments have been made:

1. **Extra Coal in the Central Tower Zone**  
   ![Coal in Central Tower](Images/Extra_coal_Central_zone.png)

2. **Additional Skeletons and Meat for Thralls**  
   - Skeletons:  
     ![Skeletons](Images/Extra_skeleton_Central_zone.png)  
   - Meat:  
     ![Meat](Images/Extra_meat_and_skeleton_Central_Zone.png)

3. **Extra Bed in the Nitro Zone**  
   ![Extra Bed](Images/Extra_bed_nitro_Zone.png)

4. **Two Extra Buried Strongboxes in the Lighthouse Zone**  
    - Strongbox1:  
     ![Strongbox 1](Images/Extra_StrongBox_LightHouse_Zone.png)  
	 
	- Strongbox2:  
	 ![Strongbox 2](Images/Extra_StrongBox2_LightHouse_Zone.png)  
	 
5. **Extra Crafting table in the Lighthouse Zone**  
	- CragtingTable: 
	 ![CragtingTable](Images/Extra_CraftingTable_LightHouse_Zone.png)  
---


### Spirit_walk_on_demand.js

- Allows players to exit Spirit Walk early before the timer expires.
- The trigger for exiting Spirit Walk is PutBoneDagger_Down (bound to the X key by default).
- Simply press the X key while in Spirit Walk to end it prematurely.

### Example
Below is an example of the script in action:
![spirit_walk_end](Images/spirit_walk_end.gif)

### Limitations
Does not work if Spirit Walk is cast while in a Prison Cell.
This is because the Bone Dagger is unavailable until you leave the cell.


---


