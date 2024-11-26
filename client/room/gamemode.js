import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Game, Players, Inventory, LeaderBoard, BuildBlocksSet, Teams, Damage, BreackGraph, Ui, Properties, GameMode, Spawns, Timers, TeamsBalancer } from 'pixel_combats/room';

// Константы:
var WaitingPlayersTime = 3;
var BuildBaseTime = 11;
var GameModeTime = 601;
var EndOfMatchTime = 11;
var KnivesModeTime = 41;

// Константы, имён:
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var KnivesModeStateValue = "KnivesMode";

// Постоянные, переменны:
var MainTimer = Timers.GetContext().Get("Main");
var StateProp = Properties.GetContext().Get("State");

// Применяем параметры создания, комнаты:
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// Блок игрока всегда, усилен:
BreackGraph.PlayerBlockBoost = true;

// Параметры игры:
Properties.GetContext().GameModeName.Value = "GameModes/!A battle between two teams!";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// Стандартные, команды:
Teams.Add("Blue", "<b><i>Teams/Blue</i></b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b><i>Teams/Red</i></b>", new Color(1, 0, 0, 0));
var BlueTeam = Teams.Get("Blue");
var RedTeam = Teams.Get("Red");
BlueTeam.Spawns.SpawnPointsGroups.Add(1);
RedTeam.Spawns.SpawnPointsGroups.Add(2);
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;
// Задаём макс смертей, команд:
var MaxDeaths = Players.MaxCount * 5;
Teams.Get("Red").Properties.Get("Deaths").Value = MaxDeaths;
Teams.Get("Blue").Properties.Get("Deaths").Value = MaxDeaths;
// Задаём что выводить, в лидербордах:
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "<b>Убийства:</b>",
		ShortDisplayName: "<b>Убийства:</b>"
	},
	{
		Value: "Deaths",
		DisplayName: "<b>Смерти:</b>",
		ShortDisplayName: "<b>Смерти:</b>"
	},
	{
		Value: "Spawns",
		DisplayName: "<b>Спавны:</b>",
		ShortDisplayName: "<b>Спавны:</b>"
	},
	{
		Value: "Scores",
		DisplayName: "<b>Монеты:</b>",
		ShortDisplayName: "<b>Монеты:</b>"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "С",
	ShortDisplayName: "С"
};
// Вес команды, в лидерборде:
LeaderBoard.TeamWeightGetter.Set(function(Team) {
	return Team.Properties.Get("Deaths").Value;
});
// Вес игрока, в лидерборде:
LeaderBoard.PlayersWeightGetter.Set(function(Player) {
	return Player.Properties.Get("Kills").Value;
});

// Задаём, что выводить вверху:
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// Разрешаем вход в команды, по запросу:
Teams.OnRequestJoinTeam.Add(function(Player, Team){Team.Add(Player);});
// Спавн, по входу в команду:
Teams.OnPlayerChangeTeam.Add(function(Player){ Player.Spawns.Spawn()});

// Делаем игроков неуязвимыми, после спавна:
var immortalityTimerName = "immortality";
Spawns.GetContext().OnSpawn.Add(function(Player){
	Player.Properties.Immortality.Value = true;
	Timer = Player.Timers.Get(immortalityTimerName).Restart(7);
});
Timers.OnPlayerTimer.Add(function(Timer){
	if(Timer.Id! = immortalityTimerName) return;
	Timer.Player.Properties.Immortality.Value = false;
});

// После каждой смерти игрока, отнимаем одну смерть, в команде:
Properties.OnPlayerProperty.Add(function(Context, Value) {
	if (Value.Name !== "Deaths") return;
	if (Context.Player.Team == null) return;
	Context.Player.Team.Properties.Get("Deaths").Value--;
});
// Если в команде количество смертей занулилось, то завершаем игру:
Properties.OnTeamProperty.Add(function(Context, Value) {
	if (Value.Name !== "Deaths") return;
	if (Context.Value <= 0) SetEndOfMatchMode();
});

// Счётчик, спавнов:
Spawns.OnSpawn.Add(function(Player) {
	++Player.Properties.Spawns.Value;
});
// Счётчик, смертей:
Damage.OnDeath.Add(function(Player) {
	++Player.Properties.Deaths.Value;
});
// Счётчик, убийств:
Damage.OnKill.Add(function(Player, Killed) {
	if (Killed.Team != null && Killed.Team != Player.Team) {
		++Player.Properties.Kills.Value;
		Player.Properties.Scores.Value += 100;
	}
});

// Настройка переключения, режимов:
mainTimer.OnTimer.Add(function() {
	switch (stateProp.Value) {
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

//  Задаём первое игровое, состояние:
SetWaitingMode();

// Состояние, игры:
function SetWaitingMode() {
	StateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "Ожидание, игроков...";
	Spawns.GetContext().Enable = false;
	Spawns.GetContext().Despawn();
	MainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	StateProp.Value = BuildModeStateValue;
	Ui.GetContext().Hint.Value = "!Застраивайте базу, и атакуйте врагов!";
	var Inventory = Inventory.GetContext();
	Inventory.Main.Value = false;
	Inventory.Secondary.Value = false;
	Inventory.Melee.Value = true;
	Inventory.Explosive.Value = false;
	Inventory.Build.Value = true;    

	MainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().Enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	StateProp.Value = GameStateValue;
	Ui.GetContext().Hint.Value = "!Атакуйте, врагов!";

	var Inventory = Inventory.GetContext();
	if (GameMode.Parameters.GetBool("OnlyKnives")) {
		Inventory.Main.Value = false;
		Inventory.Secondary.Value = false;
		Inventory.Melee.Value = true;
		Inventory.Explosive.Value = false;
		Inventory.Build.Value = true;
	} else {
		Inventory.Main.Value = true;
	        Inventory.Secondary.Value = true;
		Inventory.Melee.Value = true;
		Inventory.Explosive.Value = true;
		Inventory.Build.Value = true;
	}

	MainTimer.Restart(GameModeTime);
	Spawns.GetContext().Spawn();
	SpawnTeams();
}
function SetEndOfMatchMode() {
	StateProp.Value = EndOfMatchStateValue;
	Spawns.GetContext().Enable = false;
	Spawns.GetContext().Despawn();
	Ui.GetContext().Hint.Value = "!Конец, матча!";
	Game.GameOver(LeaderBoard.GetTeams());
	MainTimer.Restart(EndOfMatchTime);
}
function RestartGame() {
  Game.RestartGame();
}

function SpawnTeams() {
var Spawn = API.Teams.All;
Spawn.forEach((Team) => {
    Team.Spawns.Spawn();
});
}
