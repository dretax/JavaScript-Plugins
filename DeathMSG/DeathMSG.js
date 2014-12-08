/**
 * Created by DreTaX on 2014.04.03.. V2.8
 */

var blue = "[color #0099FF]";
var red = "[color #FF0000]";
var pink = "[color #CC66FF]";
var teal = "[color #00FFFF]";
var green = "[color #009900]";
var purple = "[color #6600CC]";
var white = "[color #FFFFFF]";

function On_Command(Player, cmd, args) {
    switch(cmd) {
        case "uautoban":
            if (args.Length == 0) {
                Player.Message("---DeathMSG 2.8---");
                Player.Message("/uautoban name - Unbans player");
            }
            else if (args.Length > 0) {
				var config = DeathMSGConfig();
                var deathmsgname = config.GetSetting("Settings", "deathmsgname");
                if(!Player.Admin && !isMod(Player.SteamID)) {
                    Player.MessageFrom(deathmsgname, "You aren't an admin!");
                    return;
                }
                var ini = DMB();
                var pl = args[0];
                var id = GetPlayerUnBannedID(pl);
                var ip = GetPlayerUnBannedIP(pl);
                if(id == null) {
                    Player.Message("Target: " + pl + " isn't in the database, or you misspelled It!")
                }
                else {
                    var iprq = ini.GetSetting("NameIps", ip);
                    var idrq = ini.GetSetting("NameIds", id);
                    ini.DeleteSetting("Ips", iprq);
                    ini.DeleteSetting("Ids", idrq);
                    ini.DeleteSetting("NameIps", ip);
                    ini.DeleteSetting("NameIds", id);
                    ini.Save();
                    Player.MessageFrom(deathmsgname, "Player " + pl + " unbanned!");
                }
            }
        break;
    }
}
function On_PlayerKilled(DeathEvent) {
    if (DeathEvent.Attacker != DeathEvent.Victim && DeathEvent.DamageType != null && DeathEvent.Victim != null && DeathEvent.Attacker != null && DeathEvent.DamageEvent.bodyPart != null && !IsAnimal(DeathEvent.Attacker.Name)) {
		recordInventory(DeathEvent.Victim);
        var config = DeathMSGConfig();
		var autoban = config.GetSetting("Settings", "autoban");
		var message = config.GetSetting("Settings", "msg");
		var bmessage = config.GetSetting("Settings", "bmsg");
		var banmessage = config.GetSetting("Settings", "banmsg");
		var explosionmsg = config.GetSetting("Settings", "explosionmsg");
		var huntingbow = config.GetSetting("Settings", "huntingbow");
		var deathmsgname = config.GetSetting("Settings", "deathmsgname");
		var enablekilllog = config.GetSetting("Settings", "killog");
		var tpamsg = config.GetSetting("Settings", "TpaMsg");
		var tpbackonimpossibleshot = config.GetSetting("Settings", "tpbackonimpossibleshot");
		var tpbackmsg = config.GetSetting("Settings", "tpbackmsg");
		//Other Vars
		var killer = DeathEvent.Attacker.Name;
        var victim = DeathEvent.Victim.Name;
        var weapon = DeathEvent.WeaponName;
        var damage = Math.round(DeathEvent.DamageAmount);
        var killerloc = DeathEvent.Attacker.Location;
        var location = DeathEvent.Victim.Location;
		var xpos = Player.X;
		var ypos = Player.Y;
		var zpos = Player.Z;
        var distance = Util.GetVectorsDistance(killerloc, location);
        var number = Number(distance).toFixed(2);
        var bodyPart = BD(DeathEvent.DamageEvent.bodyPart);
        // Check if player is bleeding
        var bleed = DeathEvent.DamageType;
        var ini = DMB();
		var ip = DeathEvent.Attacker.IP;
		var id = DeathEvent.Attacker.SteamID;
		var vid = DeathEvent.Victim.SteamID;
		var tpfriendteleport = DataStore.Get("tpfriendautoban", id);
		var hometeleport = DataStore.Add("homesystemautoban", id);
        var spike = config.GetSetting("Settings", "spike");
        var bigspike = config.GetSetting("Settings", "bigspike");
        //Msg bullet
        var n = message.replace("victim", victim);
        n = n.replace("killer", killer);
        n = n.replace("weapon", weapon);
        n = n.replace("damage", damage);
        n = n.replace("number", number);
        n = n.replace("bodyPart", bodyPart);
        // Explosion
        var x = explosionmsg.replace("killer", killer);
        x = x.replace("victim", victim);
        x = x.replace("weapon", "C4/F1 Grenade");
		var rtpamsg = tpamsg.replace("killer", killer);
		switch (bleed) {
			case 'Bullet':
				var z = banmessage.replace("killer", killer);
				switch (weapon) {
					case 'HandCannon':
					case 'Pipe Shotgun':
					case 'Revolver':
					case '9mm Pistol':
					case 'P250':
					case 'Shotgun':
					case 'Bolt Action Rifle':
					case 'M4':
					case 'MP5A4':
						Server.BroadcastFrom(deathmsgname, n);
						if (autoban == 1) {
							if (number > RangeOf(weapon) && RangeOf(weapon) > 0) {
								if ((tpfriendteleport == "none" || tpfriendteleport == undefined) && (hometeleport == "none" || hometeleport == undefined)) {
									DeathEvent.Attacker.Kill();
									Server.BroadcastFrom(deathmsgname, red + z);
									ini.AddSetting("Ips", ip, "1");
									ini.AddSetting("Ids", id, "1");
									ini.AddSetting("NameIps", killer, ip);
									ini.AddSetting("NameIds", killer, id);
									ini.AddSetting("Logistical", killer, "Gun: " + weapon + " Dist: " + number + " BodyP: " + bodyPart + " DMG: " + damage);
									ini.Save();
									DeathEvent.Attacker.Disconnect();
								}
								else {
									Server.BroadcastFrom(deathmsgname, rtpamsg);
									if (enablekilllog == 1) {
										ini.AddSetting("KillLog", System.DateTime.Now, "Killer: " + killer + " Gun: " + weapon + " Dist: " + number + " Victim: " + victim + " BodyP: " + bodyPart + " DMG: " + damage + " WAS TELEPORTING");
										ini.Save();
									}
								}
							}
						}
						if (enablekilllog == 1) {
							ini.AddSetting("KillLog", System.DateTime.Now, "Killer: " + killer + " Gun: " + weapon + " Dist: " + number + " Victim: " + victim + " BodyP: " + bodyPart + " DMG: " + damage);
							ini.Save();
						}
					break;
				}
			break;
			
			case 'Melee':
                if (damage == 75) {
					var hn = huntingbow.replace("victim", victim);
					hn = hn.replace("killer", killer);
					hn = hn.replace("damage", damage);
					hn = hn.replace("number", number);
					hn = hn.replace("bodyPart", bodyPart);
					Server.BroadcastFrom(deathmsgname, hn);
					if(autoban == 1) {
						if (number > RangeOf("HuntingBow") && RangeOf("HuntingBow") > 0) {
							if ((tpfriendteleport == "none" || tpfriendteleport == undefined) && (hometeleport == "none" || hometeleport == undefined)) {
								DeathEvent.Attacker.Kill();
								Server.BroadcastFrom(deathmsgname, red + z);
								ini.AddSetting("Ips", ip, "1");
								ini.AddSetting("Ids", id, "1");
								ini.AddSetting("NameIps", killer, ip);
								ini.AddSetting("NameIds", killer, id);
								ini.AddSetting("Logistical", killer, "Gun: Hunting Bow Dist: " + number + " BodyP: " + bodyPart + " DMG: " + damage);
								ini.Save();
								DeathEvent.Attacker.Disconnect();
							}
							else {
								Server.BroadcastFrom(deathmsgname, rtpamsg);
								if (enablekilllog == 1) {
									ini.AddSetting("KillLog", System.DateTime.Now, "Killer: " + killer + " Gun: Hunting Bow " + " Dist: " + number + " Victim: " + victim + " BodyP: " + bodyPart + " DMG: " + damage + " WAS TELEPORTING");
									ini.Save();
								}
								return;
							}
						}
					}
					if (enablekilllog == 1) {
						ini.AddSetting("KillLog", System.DateTime.Now, "Killer: " + killer + " Gun: Hunting Bow Dist: " + number + " Victim: " + victim + " BodyP: " + bodyPart + " DMG: " + damage);
						ini.Save();
					}
				}
				else if (damage == 10) {
					var s = bigspike.replace("victim", victim);
					s = s.replace("killer", killer);
					s = s.replace("weapon", "Large Spike Wall");
					Server.BroadcastFrom(deathmsgname, s);
				}
				else if (damage == 15) {
					var s = spike.replace("victim", victim);
					s = s.replace("killer", killer);
					s = s.replace("weapon", "Spike Wall");
					Server.BroadcastFrom(deathmsgname, s);
				}
                else {
                    Server.BroadcastFrom(deathmsgname, n);
                }

			break;
			
			case 'Explosion':
				Server.BroadcastFrom(deathmsgname, x);
			break;
			
			case 'Bleeding':
				var n = bmessage.replace("victim", victim);
				n = n.replace("killer", killer);
				Server.BroadcastFrom(deathmsgname, n);
			break;
		}
    }
    //Animal Stuff
    if (DeathEvent.Attacker != DeathEvent.Victim && DeathEvent.Victim != null && DeathEvent.Attacker != null && DeathEvent.DamageType != null && IsAnimal(DeathEvent.Attacker.Name)) {
        var config = DeathMSGConfig();
		var eanimal = config.GetSetting("Settings", "enableanimalmsg");
		var bleed = DeathEvent.DamageType;
        if (eanimal == 1 && bleed == "Melee") {
            var killer = DeathEvent.Attacker.Name;
            var victim = DeathEvent.Victim.Name;
            var deathmsgname = config.GetSetting("Settings", "deathmsgname");
            var animal = config.GetSetting("Settings", "animalkill");
            var animalk = animal.replace("victim", victim);
            animalk = animalk.replace("killer", killer);
            Server.BroadcastFrom(deathmsgname, animalk);
        }
    }
    // Suicide
    if (DeathEvent.Attacker == DeathEvent.Victim && DeathEvent.Victim != null && DeathEvent.Attacker != null && !IsAnimal(DeathEvent.Attacker.Name)) {
        var config = DeathMSGConfig();
		var enablesuicidemsg = config.GetSetting("Settings", "enablesuicidemsg");
        if (enablesuicidemsg == 1) {
            var victim = DeathEvent.Victim.Name;
            var suicide = config.GetSetting("Settings", "suicide");
            var n = suicide.replace("victim", victim);
            var deathmsgname = config.GetSetting("Settings", "deathmsgname");
            Server.BroadcastFrom(deathmsgname, n);
        }
    }
}

function On_PlayerSpawned(Player, SpawnEvent) {
	returnInventory(Player);
}

function isMod(id) {
	if (DataStore.ContainsKey("Moderators", id)) return true;
	return false;
}

function FindPlayer(id) {
	for (pl in Server.Players) {
		if (pl.SteamID == id) {
			return pl;
		}
	}
    return null;
}

function IsAnimal(killer) {
	switch (killer) {
		case 'Wolf':
		case 'Bear':
		case 'MutantWolf':
		case 'MutantBear':
			return true;
		default:
			return false;
	}
}

function BD(bodyp) {
    var ini = Bodies();
    var name = ini.GetSetting("bodyparts", bodyp);
    return name;
}

function Bodies() {
    if(!Plugin.IniExists("bodyparts")) {
        Plugin.CreateIni("bodyparts");
    }
    return Plugin.GetIni("bodyparts");
}

function DeathMSGConfig() {
    if(!Plugin.IniExists("DeathMSGConfig")) {
        Plugin.CreateIni("DeathMSGConfig");
    }
    return Plugin.GetIni("DeathMSGConfig");
}

function DMB(){
    if(!Plugin.IniExists("BannedPeopleDM")){
        var ini = Plugin.CreateIni("BannedPeopleDM");
        ini.Save();
    }
    return Plugin.GetIni("BannedPeopleDM");
}

/**
 * @return {null}
 */
function GetPlayerUnBannedIP(name){
    var ini = DMB();
    name = Data.ToLower(name);
    var checkdist = ini.EnumSection("NameIps");
    for(pl in checkdist){
        var nameid = ini.GetSetting("NameIps", pl);
        var lower = Data.ToLower(pl);
        if (nameid != null && lower == name) {
            return pl;
        }
    }
    return null;
}

/**
 * @return {null}
 */
function GetPlayerUnBannedID(name){
    var ini = DMB();
    name = Data.ToLower(name);
    var checkdist = ini.EnumSection("NameIds");
    for(pl in checkdist){
        var nameid = ini.GetSetting("NameIds", pl);
        var lower = Data.ToLower(pl);
        if (nameid != null && lower == name) {
            return pl;
        }
    }
    return null;
}

function RangeOf(weapon) {
    var ini = Plugin.GetIni("range");
    var range = ini.GetSetting("range", weapon);
    return range;
}

function On_PlayerConnected(Player)
{
    var ini = DMB();
    var ip = Player.IP;
    var id = Player.SteamID;
	var config = DeathMSGConfig();
    var deathmsgname = config.GetSetting("Settings", "deathmsgname");
    if (ini.GetSetting("Ips", ip) != null && ini.GetSetting("Ips", ip) == "1") {
        Player.MessageFrom(deathmsgname, "You are banned from this server");
        Player.Disconnect();
		return;
    }
    if (ini.GetSetting("Ids", id) != null && ini.GetSetting("Ids", id) == "1") {
        Player.MessageFrom(deathmsgname, "You are banned from this server");
        Player.Disconnect();
    }
}

function On_PlayerDisconnected(Player) {
	var id;
	try {
		id = Player.SteamID;
		var get = DataStore.Get("EquinoxAntiCheat", id);
		if (get != undefined) DataStore.Remove("EquinoxAntiCheat", id);
	}
	catch (err) {
		Plugin.Log("DeathMSGError", "Error caught at disconnect event.");
    }
}

function recordInventory(Player) {
    var Inventory = [];
    var counter = 0;
	var id = Player.SteamID;
    for (var Item in Player.Inventory.Items) {
        if (Item && Item.Name) {
            var myitem = {};
            myitem.name = Item.Name;
            myitem.quantity = Item.Quantity;
            myitem.slot = Item.Slot;
            Inventory[counter++] = myitem;
        }
    }
    for (var Item in Player.Inventory.ArmorItems) {
        if (Item && Item.Name) {
            var myitem = {};
            myitem.name = Item.Name;
            myitem.quantity = Item.Quantity;
            myitem.slot = Item.Slot;
            Inventory[counter++] = myitem;
        }
    }
    for (var Item in Player.Inventory.BarItems) {
        if (Item && Item.Name) {
            var myitem = {};
            myitem.name = Item.Name;
            myitem.quantity = Item.Quantity;
            myitem.slot = Item.Slot;
            Inventory[counter++] = myitem;
        }
    }

    DataStore.Add("DeathMSGInventory", id, Inventory);
}

function returnInventory(Player) {
	var id = Player.SteamID;
    var config = DeathMSGConfig();
    var sysname = config.GetSetting("Settings", "deathmsgname");
	Player.Inventory.ClearAll();
    if (DataStoreContainsKey("DeathMSGInventory", id)) {
        var Inventory = DataStore.Get("DeathMSGInventory", id);
        if (Inventory) {
            Player.Inventory.ClearAll();
            for (var i = 0; i < Inventory.length; i++) {
                var Item = Inventory[i];
                if (Item && Item.name) {
                    Player.Inventory.AddItemTo(Item.name, Item.slot, Item.quantity);
                }
            }
            Player.MessageFrom(sysname, green + "You got your inventory back!");
        } else {
            Player.MessageFrom(sysname, "Null");
        }
        DataStore.Remove("DeathMSGInventory", id);
    } else {
        Player.MessageFrom(sysname, "Not giving items back, you didn't die by hacks.");
    }
}

function DataStoreContainsKey(tbl, pkey) {
    for (var key in DataStore.Keys(tbl)) {
        if (Data.ToLower(key) == Data.ToLower(pkey)) return true;
    }
    return false;
}