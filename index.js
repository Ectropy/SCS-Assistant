(function (window) {
	'use strict';

	// Set up the selectizes.
	$('#attackingUnit').selectize({
	});

	$('#defendingUnit').selectize({
	});

	var units;
	// Convert units csv to json.
	// First get file from server using ajax
	$.ajax({
		type: "GET",
		url: "units.csv",
		dataType: "text",
		success: function (unitsData) {
			// Next, use jquery-csv to parse
			units = $.csv.toObjects(unitsData);
			console.log(units);
		}
	});

	var strike;

	var Die1 = 2;
	var Die2 = 3;
	var Attacker = {
		country: 'prc',
		type: 'surface naval',
		typeUnit: 'CG Type 55',
		move: 4,
		stealth: 2,
		ca: null,
		g: 2,
		gRange: 0,
		u: 2,
		uRange: 0,
		as: 4,
		asRange: 6,
		ag: 4,
		agRange: 10,
		md: 9,
		amd: null,
		aa: null,
		t: 2,
		steps: 3
	};
	var Defender = {
		country: 'prc',
		type: 'surface naval',
		typeUnit: 'CG Type 55',
		move: 4,
		stealth: 2,
		ca: null,
		g: 2,
		gRange: 0,
		u: 2,
		uRange: 0,
		as: 4,
		asRange: 6,
		ag: 4,
		agRange: 10,
		md: 9,
		amd: null,
		aa: null,
		t: 2,
		steps: 3
	};
	var TicksMissing = true;
	var AirDistance = null;
	var defTerrain = null;

	// Global Defense variables
	var AAdef = null;
	var AGdef = null;
	var ASdef = null;
	var CAdef = null;
	var Gdef = null;
	var Tdef = null;
	var Udef = null;

	$('#btnSubmitCombatants').on('click', readCombatants);

	// TODO change Attacker and Defender hardcoded to Attacker and Defender selected from dropdowns
	function readCombatants () {
		console.log('readCombatants');
		combatRouter(Attacker, Defender);
	}

	function combatRouter (attacker, defender) {
		console.log('combatRouter');
		// Reset global defense values to null in case they have been modified
		AAdef = null;
		AGdef = null;
		ASdef = null;
		CAdef = null;
		Gdef = null;
		Tdef = null;
		Udef = null;

		// determine what type of unit the defender is
		if (defender.type === 'surface naval') {
			switch (promptSurfaceNavalLocation()) {
				case 'sea':
					console.log('sea');
					Gdef = 9;
					Tdef = 9;
					ASdef = defender.md;
					var localAMD = promptAMDInRange();
					if (localAMD > ASdef) {
						ASdef = localAMD;
					}
					break;
				case 'port':
					console.log('port');
					ASdef = promptAMDInRange();
					break;
				default:
					console.log('ERROR INVALID LOCATION');
			}
			showDefenderDefenseScores();
			showValidWeaponsSystems(attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		} else if (defender.type === 'submarine') {
			switch (promptSubmarineLocation()) {
				case 'sea':
					console.log('sea');
					break;
				case 'port':
					console.log('port');
					break;
				default:
					console.log('ERROR INVALID LOCATION');
			}
		} else if (defender.type === 'air') {
		} else if (defender.type === 'ground') {
		}
	}

	function promptSurfaceNavalLocation () {
		return prompt("Is the defending surface naval unit at sea or in port? (Type 'sea' or 'port')");
	}

	function promptSubmarineLocation () {
		return prompt("Is the defending submarine unit at sea or in port? (Type 'sea' or 'port')");
	}

	function promptAMDInRange () {
		switch (prompt("Is there a unit Area Missile Defense (AMD) within range (same hex or adjacent hex) of the defending unit? (Type 'yes' or 'no')")) {
			case 'yes':
				return prompt('What is the AMD score of the unit providing Area Missle Defense?');
				// break;
			case 'no':
				return 8;
				// break;
			default:
				console.log('ERROR INVALID RESPONSE');
		}
	}

	function showDefenderDefenseScores () {
		var html = '<div class="col-md-12">';
		html += '<p>The defending unit has the following defense scores</p>';
		html += '<p>AA Def:' + AAdef + '</p>';
		html += '<p>AG Def:' + AGdef + '</p>';
		html += '<p>AS Def:' + ASdef + '</p>';
		html += '<p>CA Def:' + CAdef + '</p>';
		html += '<p>G Def:' + Gdef + '</p>';
		html += '<p>T Def:' + Tdef + '</p>';
		html += '<p>U Def:' + Udef + '</p>';
		$('#divDefenderDefenseScores').html(html);
		$('#divDefenderDefenseScores').show();
	}
	function showValidWeaponsSystems (attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef) {
		if (AAdef !== null) {
			if (attacker.aa !== null) {
				$('#btnAA').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (AGdef !== null) {
			if (attacker.ag !== null) {
				$('#btnAG').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (ASdef !== null) {
			if (attacker.as !== null) {
				$('#btnAS').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (CAdef !== null) {
			if (attacker.ca !== null) {
				$('#btnCA').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Gdef !== null) {
			if (attacker.g !== null) {
				$('#btnG').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Tdef !== null) {
			if (attacker.t !== null) {
				$('#btnT').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Udef !== null) {
			if (attacker.u !== null) {
				$('#btnU').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		$('#divWeaponsSystems').show();
	}
})(window);
