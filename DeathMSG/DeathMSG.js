/**
 * Created by DreTaX on 2014.04.03.. V2.7.0
 */

function On_Command(Player, cmd, args) {
    switch(cmd) {
        case "uautoban":
            if (args.Length == 0) {
                Player.Message("---DeathMSG 2.7.0---");
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
									Server.BroadcastFrom(deathmsgname, z);
									ini.AddSetting("Ips", ip, "1");
									ini.AddSetting("Ids", id, "1");
									ini.AddSetting("NameIps", killer, ip);
									ini.AddSetting("NameIds", killer, id);
									ini.AddSetting("Logistical", killer, "Gun: " + weapon + " Dist: " + number + " BodyP: " + bodyPart + " DMG: " + damage);
									ini.Save();
									DeathEvent.Attacker.Disconnect();
									if (tpbackonimpossibleshot == 1) {
										DataStore.Add("deathmsgdeath", vid, true);
										DataStore.Add("deathmsgdeathx", vid, xpos);
										DataStore.Add("deathmsgdeathy", vid, ypos);
										DataStore.Add("deathmsgdeathz", vid, zpos);
									}
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
				if (weapon != null) {
					Server.BroadcastFrom(deathmsgname, n);
				}
                else {
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
									Server.BroadcastFrom(deathmsgname, z);
									ini.AddSetting("Ips", ip, "1");
									ini.AddSetting("Ids", id, "1");
									ini.AddSetting("NameIps", killer, ip);
									ini.AddSetting("NameIds", killer, id);
									ini.AddSetting("Logistical", killer, "Gun: Hunting Bow Dist: " + number + " BodyP: " + bodyPart + " DMG: " + damage);
									ini.Save();
									DeathEvent.Attacker.Disconnect();
									if (tpbackonimpossibleshot == 1) {
										DataStore.Add("deathmsgdeath", vid, true);
										DataStore.Add("deathmsgdeathx", vid, xpos);
										DataStore.Add("deathmsgdeathy", vid, ypos);
										DataStore.Add("deathmsgdeathz", vid, zpos);
									}
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
				}
			break;
			
			case 'Explosion':
				if (weapon == undefined) Server.BroadcastFrom(deathmsgname, x);
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

function On_PlayerSpawning(Player, SpawnEvent) {
	var id = Player.SteamID;
	var died = DataStore.Get("deathmsgdeath", id);
	if (died) {
		var x = DataStore.Get("deathmsgdeathx", id);
		var y = DataStore.Get("deathmsgdeathy", id);
		var z = DataStore.Get("deathmsgdeathz", id);
		SpawnEvent.X = x;
		SpawnEvent.Y = y;
		SpawnEvent.Z = z;
		DataStore.Remove("deathmsgdeath", id);
		DataStore.Remove("deathmsgdeathx", id);
		DataStore.Remove("deathmsgdeathy", id);
		DataStore.Remove("deathmsgdeathz", id);
		Player.MessageFrom(deathmsgname, tpbackmsg);
	}
}

function On_PlayerSpawned(Player, SpawnEvent) {
	var id = Player.SteamID;
	var config = DeathMSGConfig();
	var hackc = config.GetSetting("Settings", "FlySpeedCheck");
	if (hackc == 0) return;
	DataStore.Add('EquinoxAntiCheat', id, Player.X+", "+Player.Y+", "+Player.Z);
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
		Plugin.Log("EquinoxAntiCheatError", "Error caught at disconnect event.");
    }
}