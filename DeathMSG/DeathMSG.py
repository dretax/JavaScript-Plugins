__author__ = 'DreTaX'
import clr
#This will be used in fougerite.
clr.AddReferenceByPartialName("Fougerite")
import Fougerite

class Advertise:
	def On_PluginInit(self):
		DataStore.Flush("EquinoxAntiCheat");
	    Plugin.CreateTimer("CheckLOC", 5000).Start();

	def On_Command(Player, cmd, args):
        if (cmd is 'uautoban'):
			if (len(args) == 0):
				Player.Message("---DeathMSG 2.6.9---")
                Player.Message("/uautoban name - Unbans player")
			elif (len(args) > 0):
				config = DeathMSGConfig();
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
					
	def DeathMSGConfig(self):
		if(Plugin.IniExists("DeathMSGConfig") is False): Plugin.CreateIni("DeathMSGConfig");
		return Plugin.GetIni("DeathMSGConfig");