(function (window) {
	'use strict';

	//Global variables
	var Units;
	var Attacker;
	var Defender;
	var Strike;
	var DefScore;

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
		var html;
		for (var i = 0; i < units.length; i++) {
			html += '<option value="' + units[i].unitId + '">' + units[i].type + ' - ' + units[i].typeUnit + '</option>';
		}
		$('#attackingUnit').html('<option value="" disabled selected style="display:none;">Select Attacking Unit</option>' + html);
		$('#defendingUnit').html('<option value="" disabled selected style="display:none;">Select Defending Unit</option>' + html);

		instantiateSelectize();
	}

	function instantiateSelectize () {
		// Set up the selectizes.
		$('#attackingUnit').selectize({
		});

		$('#defendingUnit').selectize({
		});
	}

// ==================== Defense Calculations ====================

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
		Attacker = attacker;
		console.log('Attacker');
		console.log(attacker);
		Defender = defender;
		console.log('Defender');
		console.log(defender);
		combatRouter();
	}

	function combatRouter () {
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
		if (Defender.type === 'Surface Naval') {
			promptSurfaceNavalLocation();
		} else if (Defender.type === 'Submarine') {
			switch (promptSubmarineLocation()) {
				case 'sea':
					console.log('sea');
					Tdef = 8;
					Udef = 8;
					break;
				case 'port':
					console.log('port');
					ASdef = 8;
					var subAMD = promptAMDInRange();
					if (subAMD > ASdef) {
						ASdef = subAMD;
					}
					break;
				default:
					console.log('ERROR INVALID LOCATION');
			}
			showAttackerAttackScores ();
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		} else if (Defender.type === 'Air') {
			AAdef = parseFloat(Defender.md); // TODO can air be defended by area missile defense?
			showAttackerAttackScores ();
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		} else if (Defender.type === 'Ground') {
			CAdef = 9;
			Gdef = 9;
			console.log(Defender.md);
		}
	}

	function promptSurfaceNavalLocation () {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Unit Location',
			message: 'Is the defending unit located at sea or in port?',
			buttons: {
				btnSea: {
					label: 'At Sea',
					className: 'btn-primary',
					callback: callbackSea
				},
				btnPort: {
					label: 'In Port',
					className: 'btn-primary',
					callback: callbackPort
				}
			}
		});

		function callbackSea () {
			console.log('sea');
			Gdef = 9;
			Tdef = 8;
			ASdef = parseFloat(Defender.md); // Always parse the numbers stored in the Units array, because they are strings.
			promptAMDInRange();
		}
		function callbackPort () {
			console.log('port');
			ASdef = 8; // “in port” ships only defend at MD of 8 regardless of its own (A)MD (5.363)
			promptAMDInRange();
		}
	}

	function promptSubmarineLocation () {
		return prompt("Is the defending submarine unit at sea or in port? (Type 'sea' or 'port')");
	}

	function promptAMDInRange () {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Area Missle Defense',
			message: 'Is there a unit providing Area Missile Defense (AMD) within range (same hex or adjacent hex) of the defending unit?',
			buttons: {
				btnYes: {
					label: 'Yes',
					className: 'btn-primary',
					callback: callbackYes
				},
				btnNo: {
					label: 'No',
					className: 'btn-danger',
					callback: callbackNo
				}
			}
		});
		function callbackYes () {
			promptAMDScore();
		}
		function callbackNo () {
			// Lease ASdef unchanged.
			showAttackerAttackScores ();
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		}
	}

	function promptAMDScore () {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Area Missle Defense Score',
			message: 'How much AMD does the unit providing Area Missle Defense have?',
			buttons: {
				btn10: {
					label: 'AMD 10',
					className: 'btn-primary',
					callback: callback10
				},
				btn11: {
					label: 'AMD 11',
					className: 'btn-primary',
					callback: callback11
				}
			}
		});
		function callback10 () {
			// Set ASdef to AMD if AMD is greater than the existing ASdef
			if (ASdef < 10) {
				ASdef = 10;
			}
			showAttackerAttackScores ();
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		}
		function callback11 () {
			// Set ASdef to AMD if AMD is greater than the existing ASdef
			if (ASdef < 11) {
				ASdef = 11;
			}
			showAttackerAttackScores ();
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		}
	}

	function showAttackerAttackScores () {
		var html = '<div class="col-md-12">';
		html += '<p>The attacking unit has the following attack scores</p>';
		html +=	'<table class="table">';
		html += '<tr><td>Air-to-Air Missiles (AA):</td>';
		html += '<td>' + Attacker.aa + '</td></tr>';
		html += '<tr><td>Air-to-Ground Missiles (AG):</td>';
		html += '<td>' + Attacker.ag + '</td></tr>';
		html += '<tr><td>Air-to-Ship Missiles (AS):</td>';
		html += '<td>' + Attacker.as + '</td></tr>';
		html += '<tr><td>Combined Arms (CA):</td>';
		html += '<td>' + Attacker.ca + '</td></tr>';
		html += '<tr><td>Guns (G):</td>';
		html += '<td>' + Attacker.g + '</td></tr>';
		html += '<tr><td>Torpedos (T):</td>';
		html += '<td>' + Attacker.t + '</td></tr>';
		html += '<tr><td>Anti-Submarine (U):</td>';
		html += '<td>' + Attacker.t + '</td></tr>';
		html += '</table>';
		$('#divAttackerAttackScores').html(html);
		$('#divAttackerAttackScores').show();
	}

	function showDefenderDefenseScores () {
		var html = '<div class="col-md-12">';
		html += '<p>The defending unit has the following defense scores</p>';
		html +=	'<table class="table">';
		html += '<tr><td>AA Def:</td>';
		html += '<td>' + AAdef + '</td></tr>';
		html += '<tr><td>AG Def:</td>';
		html += '<td>' + AGdef + '</td></tr>';
		html += '<tr><td>AS Def:</td>';
		html += '<td>' + ASdef + '</td></tr>';
		html += '<tr><td>CA Def:</td>';
		html += '<td>' + CAdef + '</td></tr>';
		html += '<tr><td>G Def:</td>';
		html += '<td>' + Gdef + '</td></tr>';
		html += '<tr><td>T Def:</td>';
		html += '<td>' + Tdef + '</td></tr>';
		html += '<tr><td>U Def:</td>';
		html += '<td>' + Udef + '</td></tr>';
		html += '</table>';
		$('#divDefenderDefenseScores').html(html);
		$('#divDefenderDefenseScores').show();
	}

	function showValidWeaponsSystems (Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef) {
		var untargetable = true; // If this variable is not false by the end of this function, then the attacker has no weapons systems that can target this defender.

		if (AAdef !== null) {
			if (Attacker.aa !== 'x') {
				untargetable = false;
				$('#btnAA').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (AGdef !== null) {
			if (Attacker.ag !== 'x') {
				untargetable = false;
				$('#btnAG').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (ASdef !== null) {
			if (Attacker.as !== 'x') {
				untargetable = false;
				$('#btnAS').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (CAdef !== null) {
			if (Attacker.ca !== 'x') {
				untargetable = false;
				$('#btnCA').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Gdef !== null) {
			if (Attacker.g !== 'x') {
				untargetable = false;
				$('#btnG').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Tdef !== null) {
			if (Attacker.t !== 'x') {
				untargetable = false;
				$('#btnT').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Udef !== null) {
			if (Attacker.u !== 'x') {
				untargetable = false;
				$('#btnU').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (untargetable === false) {
			$('#divWeaponsSystems').show();
		} else {
			$('#divUntargetable').show();
		}
	}

	// ==================== Attack Calculations ====================

	$('#btnAA').on('click', function () {
		Strike = parseFloat(Attacker.aa);
		DefScore = AAdef;
		promptAttackerSteps(promptAirRangeCheck);
	});
	$('#btnAG').on('click', function () {
		Strike = parseFloat(Attacker.ag);
		DefScore = AGdef;
		promptAttackerSteps(promptAirRangeCheck);
	});
	$('#btnAS').on('click', function () {
		Strike = parseFloat(Attacker.as);
		DefScore = ASdef;
		promptAttackerSteps(promptAirRangeCheck);
	});
	$('#btnCA').on('click', function () {
		Strike = parseFloat(Attacker.ca);
		DefScore = CAdef;
		promptAttackerSteps();
	});
	$('#btnG').on('click', function () {
		Strike = parseFloat(Attacker.g);
		DefScore = Gdef;
		promptAttackerSteps();
	});
	$('#btnT').on('click', function () {
		Strike = parseFloat(Attacker.t);
		DefScore = Tdef;
		promptAttackerSteps();
	});
	$('#btnU').on('click', function () {
		Strike = parseFloat(Attacker.u);
		DefScore = Udef;
		promptAttackerSteps(promptAirRangeCheck);
	});

	function promptAirRangeCheck () {
		if (Attacker.type === 'Air') {
			var maxDistance = parseFloat(Attacker.move) / 2;

			bootbox.dialog({
				closeButton: false,
				animate: false,
				title: 'Air Range',
				message: 'Is the attacking unit\'s hex more than ' + maxDistance + ' hexes (1/2 attacker\'s move radius) from the defending unit\'s hex?',
				buttons: {
					btnYes: {
						label: 'Yes, -1 to strike',
						className: 'btn-danger',
						callback: callbackYes
					},
					btnNo: {
						label: 'No, strike unchanged',
						className: 'btn-success',
						callback: callbackNo
					}
				}
			});
			function callbackYes () {
				Strike = Strike - 1;
				showRequiredRoll();
			}
			function callbackNo () {
				// Strike is unchanged.
				showRequiredRoll();
			}
		}
	}

	function promptAttackerSteps (nextStep) {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Missing Steps',
			message: 'Is the attacking unit missing any steps?',
			buttons: {
				btnYes: {
					label: 'Yes, -1 to strike',
					className: 'btn-danger',
					callback: callbackYes
				},
				btnNo: {
					label: 'No, strike unchanged',
					className: 'btn-success',
					callback: callbackNo
				}
			}
		});
		function callbackYes () {
			Strike = Strike - 1;
			nextStep();
		}
		function callbackNo () {
			// Strike is unchanged.
			nextStep();
		}
	}

	function showRequiredRoll () {
		var roll = DefScore - Strike;
		var html = '';
		html += '<div class="row">';
		html += '    <h2>Combat Results</h2>';
		html += '</div>';
		html += '<div class="row">';
		html += '    <div class="col-md-2">';
		html += '        <div class="panel panel-default">';
		html += '            <div class="panel-heading text-center">No damage is dealt if you roll</div>';
		html += '            <div class="panel-body text-center">';
		html += '                <h1>&le;' + roll + '</h1>';
		html += '            </div>';
		html += '        </div>';
		html += '    </div>';
		// Since you can't deal more steps of damage than the defending unit has,
		// and can't roll more than 12 with 2d6 (2 six-sided dies),
		// these if statments look for those cases.
		if (roll <= 11 && parseFloat(Defender.steps) >= 1) {
			html += '    <div class="col-md-2">';
			html += '        <div class="panel panel-default">';
			html += '            <div class="panel-heading text-center">To deal 1 step of damage, roll</div>';
			html += '            <div class="panel-body text-center">';
			html += '                <h1>' + (roll + 1) + '</h1>';
			html += '            </div>';
			html += '        </div>';
			html += '    </div>';
		}
		if (roll <= 10 && parseFloat(Defender.steps) >= 2) {
			html += '    <div class="col-md-2">';
			html += '        <div class="panel panel-default">';
			html += '            <div class="panel-heading text-center">To deal 2 steps of damage, roll</div>';
			html += '            <div class="panel-body text-center">';
			html += '                <h1>' + (roll + 2) + '</h1>';
			html += '            </div>';
			html += '        </div>';
			html += '    </div>';
		}
		if (roll <= 9 && parseFloat(Defender.steps) >= 3) {
			html += '    <div class="col-md-2">';
			html += '        <div class="panel panel-default">';
			html += '            <div class="panel-heading text-center">To deal 3 steps of damage, roll</div>';
			html += '            <div class="panel-body text-center">';
			html += '                <h1>' + (roll + 3) + '</h1>';
			html += '            </div>';
			html += '        </div>';
			html += '    </div>';
		}
		if (roll <= 8 && parseFloat(Defender.steps) >= 4) {
			html += '    <div class="col-md-2">';
			html += '        <div class="panel panel-default">';
			html += '            <div class="panel-heading text-center">To deal 4 steps of damage, roll</div>';
			html += '            <div class="panel-body text-center">';
			html += '                <h1>' + (roll + 4) + '</h1>';
			html += '            </div>';
			html += '        </div>';
			html += '    </div>';
		}
		if (roll <= 7 && parseFloat(Defender.steps) >= 5) {
			html += '    <div class="col-md-2">';
			html += '        <div class="panel panel-default">';
			html += '            <div class="panel-heading text-center">To deal 5 steps of damage, roll</div>';
			html += '            <div class="panel-body text-center">';
			html += '                <h1>' + (roll + 5) + '</h1>';
			html += '            </div>';
			html += '        </div>';
			html += '    </div>';
		}
		html += '</div>';
		$('#divRequiredRoll').html(html).show();
	}
})(window);
