import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Game, Players, Inventory, LeaderBoard, BuildBlocksSet, Teams, Damage, BreackGraph, Ui, Properties, GameMode, Spawns, Timers, TeamsBalancer, NewGameVote, NewGame } from 'pixel_combats/room';

// Константы:
var WaitingPlayersTime = 11;
var BuildBaseTime = 31;
var GameModeTime = 601;
var EndOfMatchTime = 11;

// Константы, очков/килов - с таймерам:
var Kill_SCORES = 20;
var Winner_SCORES = 50;
var Timer_SCORES = 40;
var TimerInterval_SCORES = 10;

// Константы, имён:
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var MockModeStateValue = "MockMode";

// Константы, для имён - с лидерБордами:
var ScoresLeaderBoard = "Scores";
var KillsLeaderBoard = "Kills";

// Постоянные - переменные:
var MainTimer = Timers.GetContext().Get("Main");
var ScoresTimer = Timers.GetContext().Get("Scores");
var StateProp = Properties.GetContext().Get("State");

// Применяем параметры, создания - комнаты:
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");
Map.Rotation = GameMode.Parameters.GetBool("MapPotation");

// Блок игрока, всегда - усилен:
BreackGraph.PlayerBlockBoost = true;

// Параметры, игры:
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = MainTimer.Id;
// Стандартные, команды:
Teams.Add("Blue", "<b><size=30><color=#0d177c>ß</color><color=#03088c>l</color><color=#0607b0>ᴜ</color><color=#1621ae>E</color></size></b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b><size=30><color=#962605>尺</color><color=#9a040c>ᴇ</color><color=#b8110b>D</color></size></b>", new Color(1, 0, 0, 0));
var BlueTeam = Teams.Get("Blue");
var RedTeam = Teams.Get("Red");
BlueTeam.Spawns.SpawnPointsGroups.Add(1);
RedTeam.Spawns.SpawnPointsGroups.Add(2);
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;

// Максимальные - смерти, команд:
var MaxDeaths = Players.MaxCount * 5;
Teams.Get("Red").Properties.Get("Deaths").Value = MaxDeaths;
Teams.Get("Blue").Properties.Get("Deaths").Value = MaxDeaths;
// Стандартные - лидерБорды:
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "KillsLeaderBoard",
		DisplayName: "<b><size=30><color=#be5f1b>K</color><color=#b65219>i</color><color=#ae4517>l</color><color=#a63815>l</color><color=#9e2b13>s</color></size></b>",
		ShortDisplayName: "<b><size=30><color=#be5f1b>K</color><color=#b65219>i</color><color=#ae4517>l</color><color=#a63815>l</color><color=#9e2b13>s</color></size></b>"
	},
	{
		Value: "Deaths",
		DisplayName: "<b><size=30><color=#be5f1b>D</color><color=#b85519>e</color><color=#b24b17>a</color><color=#ac4115>t</color><color=#a63713>h</color><color=#a02d11>s</color></size></b>",
		ShortDisplayName: "<b><size=30><color=#be5f1b>D</color><color=#b85519>e</color><color=#b24b17>a</color><color=#ac4115>t</color><color=#a63713>h</color><color=#a02d11>s</color></size></b>"
	},
	{
		Value: "Spawns",
		DisplayName: "<b><size=30><color=#be5f1b>S</color><color=#b85519>p</color><color=#b24b17>a</color><color=#ac4115>w</color><color=#a63713>n</color><color=#a02d11>s</color></size></b>",
		ShortDisplayName: "<b><size=30><color=#be5f1b>S</color><color=#b85519>p</color><color=#b24b17>a</color><color=#ac4115>w</color><color=#a63713>n</color><color=#a02d11>s</color></size></b>"
	},
	{
		Value: "ScoresLeaderBoard",
		DisplayName: "<b><size=30><color=#be5f1b>S</color><color=#b85519>c</color><color=#b24b17>o</color><color=#ac4115>r</color><color=#a63713>e</color><color=#a02d11>s</color></size></b>",
		ShortDisplayName: "<b><size=30><color=#be5f1b>S</color><color=#b85519>c</color><color=#b24b17>o</color><color=#ac4115>r</color><color=#a63713>e</color><color=#a02d11>s</color></size></b>"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
        DisplayName: "Statistics\Deaths",
	ShortDisplayName: "Statistics\Deaths"
};
// Вес - команды, в лидерБорде:
LeaderBoard.TeamWeightGetter.Set(function(Team) {
	return Team.Properties.Get("Deaths").Value;
});
// Вес - игрока, в лидерБорде:
LeaderBoard.PlayersWeightGetter.Set(function(Player) {
	return Player.Properties.Get("KillsLeaderBoard").Value;
});

// Обнуляем (изначально), очки игрокам - командам: 
 RedTeam.Properties.Get("ScoresLeaderBoard").Value = 0;
 BlueTeam.Properties.Get("ScoresLeaderBoard").Value = 0;

// Задаём, что выводить, в табе:
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// Задаём, зайти игроку - в команду:
Teams.OnRequestJoinTeam.Add(function(Player,Team){Team.Add(Player);});
// Задаём, заспавнится игроку - в команду: 
Teams.OnPlayerChangeTeam.Add(function(Player){ Player.Spawns.Spawn()});

// Делаем игроков, неуязвимыми - после спавна:
var ImmortalityTimerName = "Immortality";
Spawns.GetContext().OnSpawn.Add(function(Player) {
   if (StateProp.Value == MockModeStateValue) {
	Player.Properties.Immortality.Value = false;
    return;
   }
        Player.Properties.Immortality.Value = true;
	Timer = Player.Timers.Get("ImmortalityTimerName").Restart(6);
});
Timers.OnPlayerTimer.Add(function(Timer){
	if (Timer.Id != ImmortalityTimerName) return;
	Timer.Player.Properties.Immortality.Value = false;
});

// После каждой - смерти игрока, отнимаем одну - смерть, в команде:
Properties.OnPlayerProperty.Add(function(Context, Value) {
	if (Value.Name !== "Deaths") return;
	if (Context.Player.Team == null) return;
	Context.Player.Team.Properties.Get("Deaths").Value--;
});
// Если у игрока - занулилились смерти, то завершаем игру:
Properties.OnTeamProperty.Add(function(Context, Value) {
	if (Value.Name !== "DeathsLeaderBoard") return;
	if (Value.Value <= 0) SetEndOfMatchMode();
});

// Счётчик - спавнов:
Spawns.OnSpawn.Add(function(Player) {
	++Player.Properties.Spawns.Value;
});
// Счётчик - смертей:
Damage.OnDeath.Add(function(Player) {
   if (StateProp.Value == MockModeStateValue) {
 Spawns.GetContext(Player).Spawn();
      return;
}
  ++Player.Properties.Deaths.Value;
});
// Счётчик - убийствов:
Damage.OnKill.Add(function(Player, Killed) {
	if (Killed.Team != null && Killed.Team != Player.Team) {
		++Player.Properties.KillsLeaderBoard.Value;
		Player.Properties.ScoresLeaderBoard.Value += 100;
		// Добавляем, очки - килла игроку:
	          Player.Properties.ScoresLeaderBoard.Value += Kill_SCORES;
		if (StateProp.Value == MockModeStateValue && Player.Team != null) 
		 Player.Team.Properties.Get("ScoresLeaderBoard").Value;
	}
});

// Таймер очков, за проведённое время, в комнате:
ScoresTimer.OnTimer.Add(function() {
 for (var Player of Players.All) {
   if (Player.Team == null) continue;
 Player.Properties.ScoresLeaderBoard.Value += Timer_SCORES;
      }
});

// Переключение - игровых, режимов:
MainTimer.OnTimer.Add(function() {
	switch (StateProp.Value) {
	case WaitingStateValue:
		SetBuildMode();
		break;
	case BuildModeStateValue:
		SetGameMode();
		break;
	case GameStateValue:
		SetEndOfMatchMode();
		break;
	case EndOfMatchStateValue:
		RestartGame();
		break;
	}
});

// Задаём, первое игровое - состояние игры:
SetWaitingMode();

// Состояние, игры:
function SetWaitingMode() {
	StateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "Ожидание, игроков...";
	Spawns.GetContext().Enable = false;
	MainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	StateProp.Value = BuildModeStateValue;
	Ui.GetContext().Hint.Value = "!Застраивайте базу - и разрушайте, базу врагов!";
	
	var inventory = Inventory.GetContext();
	inventory.Main.Value = false;
	inventory.Secondary.Value = false;
	inventory.Melee.Value = true;
	inventory.Explosive.Value = false;
	inventory.Build.Value = true;

	MainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().Enable = true;
	SpawnTeams();
}
function SetGameMode() {
	
	StateProp.Value = GameStateValue;
	Ui.GetContext().Hint.Value = "!Атакуйте, врагов!";

	 var inventory = Inventory.GetContext();
	if (GameMode.Parameters.GetBool("OnlyKnives")) {
	 inventory.Main.Value = false;
	 inventory.Secondary.Value = false;
	 inventory.Melee.Value = true;
	 inventory.Explosive.Value = false;
	 inventory.Build.Value = true;
    } else {
	 inventory.Main.Value = true;
	 inventory.Secondary.Value = true;
	 inventory.Melee.Value = true;
	 inventory.Explosive.Value = true;
	 inventory.Build.Value = true;
	}

	MainTimer.Restart(GameModeTime);
	SpawnsTeams();
}	
function SetEndOfMatchMode() {
        StateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "!Конец, матча!";

	MainTimer.Restart(EndOfMatchTime);
	Game.GameOver(LeaderBoard.GetTeams());
	Spawns.GetContext().Enable = false;
	Spawns.GetContext().Despawn();

	ScoresTimer.Stop();
	 for (var WinPlayer of LeaderBoard[0].Team.Players) 
	 WinPlayer.Properties.ScoresLeaderBoard.Value += Winner_SCORES;
}
function RestartGame() {
 Game.RestartGame();
}
function SpawnTeams() {
  Spawns.GetContext().Spawn();
}

ScoresTimer.RestartLoop(TimerInterval_SCORES);
