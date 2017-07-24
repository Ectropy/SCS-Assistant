(function (window) {
	'use strict';

	//Global variables
	var Units;
	var strike;
	var Die1 = 2;
	var Die2 = 3;
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

	loadUnits();

	function loadUnits () {
		// First get file from server using ajax
		$.ajax({
			type: 'GET',
			url: 'units.csv',
			dataType: 'text',
			success: function (unitsData) {
				// Next, use jquery-csv to parse
				var units = $.csv.toObjects(unitsData);
				console.log(units);
				Units = units; // write to global
				populateCombatants(units);
			}
		});
	}

	function populateCombatants (units) {
		// Write unit info to dropdowns (must be done before instantiating selectizes)
		var html = '<option value="" disabled selected style="display:none;">Select Defending Unit</option>';
		for (var i = 0; i < units.length; i++) {
			html += '<option value="' + units[i].unitId + '">' + units[i].type + ' - ' + units[i].typeUnit + '</option>';
		}
		$('#attackingUnit').html(html);
		$('#defendingUnit').html(html);

		instantiateSelectize();
	}

	function instantiateSelectize () {
		// Set up the selectizes.
		$('#attackingUnit').selectize({
		});

		$('#defendingUnit').selectize({
		});
	}

	$('#btnSubmitCombatants').on('click', readCombatants);

	function readCombatants () {
		var attacker = null;
		var defender = null;
		for (var i = 0; i < Units.length; i++) {
			if (Units[i].unitId === $('#attackingUnit').val()) {
				attacker = Units[i];
				break;
			}
		}
		for (var j = 0; j < Units.length; j++) {
			if (Units[j].unitId === $('#defendingUnit').val()) {
				defender = Units[j];
				break;
			}
		}
		console.log('Defender');
		console.log(defender);
		console.log('Attacker');
		console.log(attacker);
		combatRouter(attacker, defender);
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
		if (defender.type === 'Surface Naval') {
			switch (promptSurfaceNavalLocation()) {
				case 'sea':
					console.log('sea');
					Gdef = 9;
					Tdef = 9;
					ASdef = parseFloat(defender.md); // Always parse the numbers stored in the Units array, because they are strings.
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
		} else if (defender.type === 'Submarine') {
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
		} else if (defender.type === 'Air') {
		} else if (defender.type === 'Ground') {
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
